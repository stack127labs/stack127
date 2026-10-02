import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { toolNames } from "./worker-process.mjs";

function objects(stdout) {
  try {
    const value = JSON.parse(stdout);
    return value && typeof value === "object" && !Array.isArray(value) ? [value] : [];
  } catch { /* Codex and Antigravity use NDJSON. */ }
  return stdout.split(/\r?\n/).flatMap((line) => {
    try { return [JSON.parse(line)]; } catch { return []; }
  }).filter((value) => value && typeof value === "object");
}

function errorText(value) {
  if (typeof value === "string") return value;
  return value && typeof value === "object" ? JSON.stringify(value) : "";
}

export function workerResult(tool, run, { session = null, resultPath } = {}) {
  const events = objects(run.stdout ?? "");
  let status = run.status ?? 1;
  const errors = [];
  let terminalDiagnostic = null;
  let cancelled = false;
  let resultText = "";
  let usage;
  for (const event of events) {
    session = event.thread_id ?? event.session_id ?? event.sessionId ?? event.conversation_id ?? session;
    if (tool === "claude" && event.type === "result") {
      resultText = String(event.result ?? "");
      usage = { cost_usd: event.total_cost_usd, turns: event.num_turns, duration_ms: event.duration_ms, usage: event.usage };
      if (event.is_error) {
        status ||= 1;
        terminalDiagnostic = [errorText(event.errors), errorText(event.error), resultText].filter(Boolean).join("\n");
        errors.push(terminalDiagnostic);
      }
    }
    if (tool === "grok" && typeof event.text === "string") { resultText = event.text; usage = event.usage; }
    const result = tool === "agy" ? (event.event === "result" ? event.result : event.status ? event : null) : null;
    if (result) {
      session = result.conversation_id ?? session;
      resultText = String(result.response ?? "");
      usage = result.usage;
      if (result.status !== "SUCCESS") {
        status ||= 1;
        terminalDiagnostic = errorText(result.error);
        errors.push(terminalDiagnostic);
        cancelled = ["CANCELED", "INTERRUPTED"].includes(result.status);
      }
    }
    if (event.type === "error" || event.type === "turn.failed") errors.push(errorText(event.error ?? event.message));
    if (event.type === "turn.failed" || (tool === "grok" && event.type === "error")) status ||= 1;
    if (event.type === "turn.failed" || (tool === "grok" && event.type === "error")) terminalDiagnostic = errorText(event.error ?? event.message);
  }
  if (tool === "codex" && resultPath && fs.existsSync(resultPath)) resultText = fs.readFileSync(resultPath, "utf8");
  // Never infer a limit from assistant answers, tool output, or a successful run.
  if (!events.length && status !== 0) errors.push(...(run.stdout ?? "").split(/\r?\n/).filter((line) => /^(?:error\b|you(?:'ve| have) hit|usage limit|rate limit|quota exceeded)/i.test(line.trim())));
  const incompleteResult = status === 0 && !resultText.trim();
  if (incompleteResult) { status = 1; errors.push("Worker returned no result."); }
  const diagnostic = [...errors, run.stderr, run.error?.message].filter(Boolean).join("\n");
  return { status, session, resultText: resultText || diagnostic || "No output.", diagnostic, limitDiagnostic: terminalDiagnostic ?? diagnostic, incompleteResult, cancelled, usage, signal: run.signal, processError: run.error };
}

export function limitReason(result) {
  if (result.status === 0 || result.signal || result.processError || result.incompleteResult || result.cancelled || [130, 143].includes(result.status)) return null;
  const text = result.limitDiagnostic ?? result.diagnostic ?? "";
  if (/disk quota|filesystem quota|file system quota|storage quota|ENOSPC/i.test(text)) return null;
  if (/assertion|tests? failed|test failure|segmentation fault|out of memory|permission denied|authentication required|not logged in|unknown model/i.test(text)) return null;
  if (/usage[_ -]limit[_ -](?:reached|exceeded)|you(?:'ve| have)? (?:hit|reached) (?:your |the )?(?:usage )?limit\b|(?:hit|reached|exceeded)[^\n]{0,35}(?:usage|message|request|token) limit|(?:daily|weekly|monthly|session) (?:usage |token |message )?limit (?:reached|exceeded)|out of (?:usage|credits)|credits (?:exhausted|depleted)/i.test(text)) return "usage limit";
  if (/rate[_ -]limit(?:ed|[_ -](?:exceeded|reached|error))\b|too many requests|(?:HTTP(?:\/\d(?:\.\d)?)?|status(?: code)?|api error)\s*[:=]?\s*429\b|"(?:code|status|status_code)"\s*:\s*429\b/i.test(text)) return "rate limit";
  if (/insufficient_quota|quota[_ -](?:exceeded|exhausted)|(?:exceeded|exhausted)[^\n]{0,20}quota|RESOURCE_EXHAUSTED/i.test(text)) return "quota limit";
  return null;
}

// Test injection replaces attempts with limit errors. It is never read from the environment.
export function runWithFallback({ lane, startTool = lane === "opus" ? "claude" : "codex", session = null, resume = false, priorLimits = [], toolChain }, { modelFor, run, simulateLimits = [] }) {
  const chain = toolChain ?? [lane === "opus" ? "claude" : "codex", "grok", "agy"];
  if (!chain.length || new Set(chain).size !== chain.length || chain.some(tool => !["claude", "codex", "grok", "agy"].includes(tool))) throw new Error("Invalid permitted worker tools.");
  const start = chain.indexOf(startTool);
  if (start < 0) throw new Error(`Invalid ${lane} worker tool: ${startTool}`);
  const attempts = [];
  const limits = [...priorLimits];
  let result;
  for (const tool of chain.slice(start)) {
    let model;
    const attemptSession = tool === startTool && resume ? session : ["claude", "grok"].includes(tool) ? randomUUID() : null;
    try {
      model = modelFor(tool);
      result = simulateLimits.includes(tool)
        ? { status: 1, session: attemptSession, resultText: "Simulated usage limit reached.", diagnostic: "Usage limit reached (test simulation)." }
        : run({ tool, model, session: attemptSession, resume: tool === startTool && resume });
    } catch (error) {
      result = { status: 1, session: attemptSession, resultText: error.message, diagnostic: error.message };
      // Setup errors, including model discovery and spawn failures, never trigger fallback.
      result.processError = error;
    }
    const reason = limitReason(result);
    attempts.push({ tool, model: model ?? null, session: result.session, status: result.status, limitReason: reason, error: result.status ? result.diagnostic : null });
    if (reason) limits.push({ tool, reason });
    if (!reason || tool === chain.at(-1)) break;
  }
  const actual = attempts.at(-1);
  const allLimited = attempts.every((attempt) => attempt.limitReason) && actual.tool === chain.at(-1);
  const fallbackUsed = actual.tool !== chain[0];
  const reasons = limits.map(({ tool, reason }) => `${toolNames[tool]} hit its ${reason}`).join("; ");
  const summary = allLimited
    ? `${fallbackUsed ? "Fallback used: " : ""}${reasons}. ${toolChain ? "All permitted tools" : "All tools"} are out of limits. Tried: ${[...new Set([...limits.map((entry) => entry.tool), ...attempts.map((entry) => entry.tool)])].map((tool) => toolNames[tool]).join(", ")}. Models: ${attempts.map(({ tool, model }) => `${toolNames[tool]} (${model ?? "unknown model"})`).join(", ")}.`
    : fallbackUsed ? `Fallback used: ${reasons || "continuing the saved fallback session"}, so ${toolNames[actual.tool]} (${actual.model ?? "unknown model"}) ${result.status === 0 ? "did this task" : "was tried but failed"}.` : null;
  return { ...result, tool: actual.tool, model: actual.model, attempts, limits, allLimited, fallbackUsed, fallbackSummary: summary };
}

export function resolveResume(reference, { lane, runsRoot, allowedTools = [lane === "opus" ? "claude" : "codex", "grok", "agy"] }) {
  if (!reference) return { tool: lane === "opus" ? "claude" : "codex", session: null, limits: [] };
  const prefix = reference.match(/^(claude|codex|grok|agy):(.+)$/);
  const id = prefix ? prefix[2] : reference;
  const entries = fs.existsSync(runsRoot) ? fs.readdirSync(runsRoot).sort().reverse() : [];
  for (const entry of entries) {
    let meta;
    try { meta = JSON.parse(fs.readFileSync(path.join(runsRoot, entry, "meta.json"), "utf8")); } catch { continue; }
    if (!meta || typeof meta !== "object" || meta.session !== id || (prefix && meta.tool !== prefix[1])) continue;
    if (meta.lane !== lane) throw new Error(`Session ${id} belongs to ${meta.lane}, not ${lane}.`);
    if (!allowedTools.includes(meta.tool ?? (lane === "opus" ? "claude" : "codex"))) throw new Error("The resumed tool is not permitted for this task.");
    return { tool: meta.tool ?? (lane === "opus" ? "claude" : "codex"), session: id, limits: meta.limits ?? [] };
  }
  if (prefix && ["grok", "agy"].includes(prefix[1])) throw new Error("Fallback resume requires its saved meta.json. Use the session printed by delegate.mjs.");
  if (prefix && !allowedTools.includes(prefix[1])) throw new Error(`Invalid ${lane} worker tool: ${prefix[1]}`);
  return { tool: prefix?.[1] ?? (lane === "opus" ? "claude" : "codex"), session: id, limits: [] };
}
