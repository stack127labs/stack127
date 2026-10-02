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
//
// Each run saves prompt.md, result.md, and meta.json under ~/.stack127-agents/.
// Delegated workers cannot delegate again.

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { newestModel } from "./models.mjs";
import { runWorker } from "./worker-process.mjs";

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
    job: "code review, backend changes, infra planning, and pushes or deploys the user asked for",
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
  const key = { "--effort": "effort", "--resume": "resume", "--label": "label", "--prompt-file": "promptFile" }[arg];
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

let model = "opus";
if (lane !== "opus") {
  model = newestModel(lane);
  if (!model) fail(`Could not find a ${lane} model in Codex's model list. Run codex once to refresh it.`);
}

const header = `You are the stack127 ${lane} worker (${model}, ${options.effort} effort). Your lane: ${lanes[lane].job}.
A coordinator delegated this task to you. Read the "Agent roles" section of AGENTS.md.
- Do only ${lane} work. Do not delegate or start other agents.
- If the task needs work from another lane, do your part, then list the rest under "Needs other lanes".
- Do not push, deploy, or write production data unless this task says the user asked for it.
- End with: what you changed (file paths), checks you ran, and open issues.

Task:
`;
const prompt = header + task;

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const runDir = path.join(runsRoot, `${stamp}-${lane}-${options.label.replace(/[^a-z0-9-]+/gi, "-").slice(0, 80)}-${randomUUID()}`);
fs.mkdirSync(runDir, { recursive: true, mode: 0o700 });
fs.chmodSync(runDir, 0o700);
fs.writeFileSync(path.join(runDir, "prompt.md"), prompt, { mode: 0o600 });
const resultPath = path.join(runDir, "result.md");

const env = { ...process.env, STACK127_DELEGATED: "1", STACK127_LANE: lane, STACK127_LANE_GUARD: "on" };
let session = options.resume;
let resultText = "";
let status = 0;

if (lane === "opus") {
  session = options.resume ?? randomUUID();
  const run = runWorker({ lane, model, effort: options.effort, session, resume: options.resume, resultPath, repoRoot, env, prompt });
  status = run.status ?? 1;
  try {
    const parsed = JSON.parse(run.stdout);
    resultText = String(parsed.result ?? "");
    if (parsed.is_error) status = status || 1;
    fs.writeFileSync(path.join(runDir, "usage.json"), JSON.stringify({ cost_usd: parsed.total_cost_usd, turns: parsed.num_turns, duration_ms: parsed.duration_ms, usage: parsed.usage }, null, 2), { mode: 0o600 });
  } catch {
    resultText = run.stdout || run.stderr || run.error?.message || "No output.";
    status = status || 1;
  }
} else {
  const run = runWorker({ lane, model, effort: options.effort, session, resume: options.resume, resultPath, repoRoot, env, prompt });
  status = run.status ?? 1;
  fs.writeFileSync(path.join(runDir, "events.jsonl"), run.stdout ?? "", { mode: 0o600 });
  session = session ?? run.stdout?.match(/"thread_id":"([^"]+)"/)?.[1] ?? null;
  resultText = fs.existsSync(resultPath) ? fs.readFileSync(resultPath, "utf8") : run.stderr || run.error?.message || "No output.";
}

fs.writeFileSync(resultPath, resultText, { mode: 0o600 });
fs.chmodSync(resultPath, 0o600);
fs.writeFileSync(path.join(runDir, "meta.json"), JSON.stringify({ lane, model, effort: options.effort, session, status, runDir }, null, 2), { mode: 0o600 });

console.log(`lane: ${lane}\nmodel: ${model}\neffort: ${options.effort}\nsession: ${session}\nresult: ${resultPath}\n`);
console.log(resultText);
process.exit(status);
