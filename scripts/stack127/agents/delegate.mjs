#!/usr/bin/env node
// Send work to another lane and wait for its answer.
//
//   node scripts/stack127/agents/delegate.mjs <opus|sol|luna> [options] "task"
//
// Options:
//   --effort <level>     opus: medium (default) or high. sol: high (default) or xhigh. luna: xhigh (default) or max.
//   --resume <session>   continue an earlier session with a follow-up.
//   --label <name>       short name for the run folder.
//   --prompt-file <file> read the task from a file instead of the command line.
//   --task-session <id> current coordinator's exception ID when no session env is available.
//   --tool <tool>       choose a tool permitted by the explicit-user task exception.
//   --model <model>     use the model named in that exception.
//   --approve-release <sha> allow this worker to release the reviewed commit.
//   --approve-production-data allow production data work described in the task.
//
// Each run saves prompt.md, result.md, and meta.json under ~/.stack127-agents/.
// Delegated workers cannot delegate again.

import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cliModel, newestModel } from "./models.mjs";
import { grokDenyRules, runWorker, workerExecutable, workerProtection } from "./worker-process.mjs";
import { resolveResume, runWithFallback, workerResult } from "./fallback.mjs";
import { delegationRoute, readTaskException, taskSession } from "./task-exception.mjs";
import { createWorkerApproval, workerEnvironment } from "./worker-approval.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const runsRoot = path.join(os.homedir(), ".stack127-agents");

const lanes = {
  opus: {
    defaultEffort: "medium",
    efforts: ["medium", "high"],
    job: "writing, design, components, frontend, site content, SEO planning, and planning how to do the work",
  },
  sol: {
    defaultEffort: "high",
    efforts: ["high", "xhigh"],
    job: "code review, backend changes, and infra planning",
  },
  luna: {
    defaultEffort: "xhigh",
    efforts: ["xhigh", "max"],
    job: "research, mass data gathering, and data work",
  },
};

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

if (process.env.STACK127_DELEGATED === "1") {
  fail(
    "You are a delegated worker. Delegated workers do not delegate. Stop and list the other-lane work under 'Needs other lanes' in your final answer.",
    3,
  );
}

const args = process.argv.slice(2);
const lane = args.shift();
if (!lanes[lane]) fail(`Usage: delegate.mjs <${Object.keys(lanes).join("|")}> [--effort level] [--resume session] [--label name] [--prompt-file file] "task"`);

const options = { effort: lanes[lane].defaultEffort, resume: null, label: lane, promptFile: null };
const words = [];
while (args.length) {
  const arg = args.shift();
  if (arg === '--approve-production-data') { options.productionData = true; continue; }
  const key = { "--effort": "effort", "--resume": "resume", "--label": "label", "--prompt-file": "promptFile", "--task-session": "taskSession", "--tool": "tool", "--model": "model", "--approve-release": "releaseSha" }[arg];
  if (key) {
    if (!args[0] || args[0].startsWith("--")) fail(`Missing value for ${arg}.`);
    options[key] = args.shift();
  } else if (arg === "--") { words.push(...args); args.length = 0; }
  else if (arg.startsWith("--")) fail(`Unknown option: ${arg}`);
  else words.push(arg);
}
if (!lanes[lane].efforts.includes(options.effort)) fail(`${lane} effort must be one of: ${lanes[lane].efforts.join(", ")}`);

const task = options.promptFile ? fs.readFileSync(options.promptFile, "utf8") : words.join(" ");
if (!task.trim()) fail("Give the task as text or with --prompt-file.");

let previous;
let exception;
let routing;
try {
  const actualSession = taskSession();
  if (actualSession && options.taskSession && actualSession !== options.taskSession) throw new Error("Cannot use another coordinator session's exception.");
  exception = readTaskException({ session: options.taskSession ?? actualSession });
  // Enforce a no-delegation instruction before reading or launching any worker session.
  delegationRoute(exception, { tool: options.tool, model: options.model });
  previous = resolveResume(options.resume, { lane, runsRoot, ...(exception ? { allowedTools: exception.delegation.tools } : {}) });
  routing = delegationRoute(exception, { tool: options.tool, model: options.model, previous: previous.tool, resume: Boolean(options.resume) });
}
catch (error) { fail(error.message); }

const workerPrompt = (model, protection, approval) => `You are the stack127 ${lane} worker (${model}, ${options.effort} effort). Your lane: ${lanes[lane].job}.
A coordinator delegated this task to you. Read the "Agent roles" section of AGENTS.md.
- Do only ${lane} work. Do not delegate or start other agents.
- If the task needs work from another lane, do your part, then list the rest under "Needs other lanes".
- Development tool-page updates are allowed through the guarded tool-page scripts. Other development applies go back to the coordinator.
- ${approval?.releaseSha ? `The coordinator approved release of commit ${approval.releaseSha}. Push only that commit to origin/main, follow the release skill, and verify the live revision. If the commit changes, report back for a new review.` : 'No release approval was granted for this run. Do not push or deploy.'}
- ${approval?.productionData ? 'The coordinator approved the production data work described in this task. Keep it within that scope, dry-run first, and verify the written rows.' : 'No separate production data approval was granted for this run. Do not run production data commands. An approved release may run the required migrations in its reviewed release workflow.'}
- Read relevant repo skills under skills/ and follow them. Never turn off or bypass a guard.
- A previous attempt may have made partial changes. Review the current diff before editing.
- End with: what you changed (file paths), checks you ran, and open issues.
${protection ? `- ${protection}\n` : ""}

Task:
${task}`;

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const runDir = path.join(runsRoot, `${stamp}-${lane}-${options.label.replace(/[^a-z0-9-]+/gi, "-").slice(0, 80)}-${randomUUID()}`);
fs.mkdirSync(runDir, { recursive: true, mode: 0o700 });
fs.chmodSync(runDir, 0o700);
const resultPath = path.join(runDir, "result.md");

let approval;
try { approval = createWorkerApproval({ root: repoRoot, lane, runDir, task, releaseSha: options.releaseSha, productionData: options.productionData }); }
catch (error) { fail(error.message); }
const env = workerEnvironment(process.env, lane, approval);
const result = runWithFallback({ lane, startTool: routing.toolChain?.[0] ?? previous.tool, toolChain: routing.toolChain, session: previous.session, resume: Boolean(options.resume), priorLimits: previous.limits }, {
  modelFor(tool) {
    if (exception?.delegation.models[tool]) return exception.delegation.models[tool];
    if (tool === "claude") return "opus";
    if (tool === "codex") {
      const model = newestModel(lane === "luna" ? "luna" : "sol");
      if (!model) throw new Error(`Could not find a ${lane} model in Codex's model list. Run codex once to refresh it.`);
      return model;
    }
    return cliModel(tool, workerExecutable(tool), { env, cwd: repoRoot });
  },
  run({ tool, model, session, resume }) {
    const protection = workerProtection(tool, approval);
    if (protection) console.error(protection);
    const prompt = workerPrompt(model, protection, approval);
    const promptPath = path.join(runDir, `${tool}-prompt.md`);
    fs.writeFileSync(promptPath, prompt, { mode: 0o600 });
    fs.writeFileSync(path.join(runDir, "prompt.md"), prompt, { mode: 0o600 });
    let denyRules = [];
    if (tool === "grok") {
      const files = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], { cwd: repoRoot, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      if (files.error || files.status !== 0) throw new Error("Could not list repo files for Grok's lane deny rules.");
      denyRules = grokDenyRules(lane, files.stdout.split("\0").filter(Boolean), approval);
    }
    const attemptResult = path.join(runDir, `${tool}-result.md`);
    const run = runWorker({ lane, tool, model, effort: options.effort, session, resume, resultPath: attemptResult, promptPath, repoRoot, env, prompt, approval, denyRules });
    fs.writeFileSync(path.join(runDir, `${tool}-events.jsonl`), run.stdout ?? "", { mode: 0o600 });
    fs.writeFileSync(path.join(runDir, `${tool}-stderr.log`), run.stderr ?? run.error?.message ?? "", { mode: 0o600 });
    const parsed = workerResult(tool, run, { session, resultPath: attemptResult });
    if (parsed.usage) fs.writeFileSync(path.join(runDir, `${tool}-usage.json`), JSON.stringify(parsed.usage, null, 2), { mode: 0o600 });
    return parsed;
  },
});

fs.writeFileSync(resultPath, result.resultText, { mode: 0o600 });
fs.chmodSync(resultPath, 0o600);
const meta = { lane, tool: result.tool, model: result.model, effort: options.effort, session: result.session, status: result.status, runDir, attempts: result.attempts, limits: result.limits, fallbackUsed: result.fallbackUsed, fallbackSummary: result.fallbackSummary, allLimited: result.allLimited, protection: workerProtection(result.tool, approval), approvedReleaseSha: approval?.releaseSha ?? null, productionDataApproved: approval?.productionData ?? false, ...(exception ? { taskExceptionSession: exception.session, permittedTools: exception.delegation.tools } : {}) };
fs.writeFileSync(path.join(runDir, "meta.json"), JSON.stringify(meta, null, 2), { mode: 0o600 });

console.log(`lane: ${lane}\ntool: ${result.tool}\nmodel: ${result.model}\neffort: ${options.effort}\nsession: ${result.session}\nresume: ${result.session ? `${result.tool}:${result.session}` : "unavailable"}\nresult: ${resultPath}\n`);
if (result.fallbackSummary) console.log(result.fallbackSummary);
if (exception) console.log(`User-directed routing for '${exception.task}'. Permitted tools: ${exception.delegation.tools.join(", ")}.`);
if (approval) console.log(`Coordinator approval for this run: release ${approval.releaseSha ?? 'not approved'}; production data ${approval.productionData ? 'approved for the task' : 'not approved'}.`);
console.log(result.resultText);
process.exit(result.status);
