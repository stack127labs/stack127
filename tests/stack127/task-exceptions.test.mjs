import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createTaskException, delegationRoute, extendTaskException, readTaskException, removeTaskException, renewTaskException, taskSession, validateTaskException } from "../../scripts/stack127/agents/task-exception.mjs";
import { check } from "../../scripts/stack127/agents/lane-guard.mjs";
import { resolveResume, runWithFallback } from "../../scripts/stack127/agents/fallback.mjs";
import { runWorker } from "../../scripts/stack127/agents/worker-process.mjs";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const now = Date.now();
const edit = file => ({ session_id: "coordinator", tool_name: "Edit", tool_input: { file_path: file } });
function fixture(t, overrides = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "stack127-task-exception-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const value = createTaskException({ root, session: "coordinator", task: "Fix shared links", userInstruction: "Do this yourself. Do not delegate.", files: ["app/ui/tools/use-initial-query.ts", "lib/dns/lookup.ts"], now, ...overrides }, {});
  return { root, value, guardOptions: { exceptionRoot: root, now } };
}

test("explicit exceptions allow only the coordinator's named files in every lane", t => {
  const { root, guardOptions } = fixture(t);
  for (const lane of ["sol", "luna", "opus"]) {
    for (const file of ["app/ui/tools/use-initial-query.ts", "lib/dns/lookup.ts"]) assert.equal(check(edit(file), { ...guardOptions, lane, delegated: false }), null);
    const unlisted = lane === "opus" ? "lib/apps.ts" : "app/ui/callout.tsx";
    assert.match(check(edit(unlisted), { ...guardOptions, lane, delegated: false }), /belongs to/);
    const otherLaneFile = lane === "opus" ? "lib/dns/lookup.ts" : "app/ui/tools/use-initial-query.ts";
    assert.match(check(edit(otherLaneFile), { ...guardOptions, lane, delegated: true }), /belongs to/);
    assert.match(check({ ...edit(otherLaneFile), session_id: "another-session" }, { ...guardOptions, lane, delegated: false }), /belongs to/);
  }
  assert.equal(readTaskException({ root, session: "unknown", now }), null);
});

test("expired, malformed, or removed exceptions restore the guard without blocking cleanup", t => {
  const { root, value, guardOptions } = fixture(t);
  const file = "app/ui/tools/use-initial-query.ts";
  assert.match(check(edit(file), { ...guardOptions, lane: "sol", delegated: false, now: Date.parse(value.expiresAt) }), /belongs to/);
  assert.throws(() => readTaskException({ root, session: "coordinator", now: Date.parse(value.expiresAt) }), /expired/);
  fs.writeFileSync(path.join(root, "tmp/agent-task-exceptions/coordinator.json"), "invalid JSON");
  assert.match(check(edit(file), { ...guardOptions, lane: "sol", delegated: false }), /belongs to/);
  removeTaskException({ root, session: "coordinator" }, {});
  assert.match(check(edit(file), { ...guardOptions, lane: "sol", delegated: false }), /belongs to/);
});

test("exceptions reject another checkout, broad paths, and missing user instructions", t => {
  const { root, value } = fixture(t);
  const validate = patch => validateTaskException({ ...value, ...patch }, { root, session: "coordinator", now });
  for (const files of [["../app/x.tsx"], ["app/*"], ["/app/x.tsx"], ["app/../app/x.tsx"]]) assert.throws(() => validate({ files }), /exact checkout-relative/);
  assert.throws(() => validate({ root: "/another-checkout" }), /checkout and session/);
  assert.throws(() => validate({ userInstruction: " " }), /explicit routing/);
  assert.throws(() => validate({ expiresAt: new Date(now + 25 * 60 * 60 * 1000).toISOString() }), /invalid dates/);
  assert.doesNotThrow(() => validate({ files: ["app/(site)/[slug]/page.tsx"] }));
});

test("extending access adds only named files and preserves the task and routing", t => {
  const { root, value } = fixture(t);
  const next = extendTaskException({ root, session: "coordinator", files: ["app/ui/controls.module.css"], now }, {});
  assert.deepEqual(next, { ...value, files: [...value.files, "app/ui/controls.module.css"] });
  assert.throws(() => extendTaskException({ root, session: "coordinator", files: ["app/*"], now }, {}), /exact checkout-relative/);
  assert.throws(() => extendTaskException({ root, session: "coordinator", files: [], now }, { STACK127_DELEGATED: "1" }), /Only the coordinator/);
});

test("repeated setup reuses the authorized task without extending its lifetime or changing routing", t => {
  const { root, value } = fixture(t, { tools: ['codex'], models: { codex: 'chosen-model' } });
  const request = { root, session: value.session, task: value.task, userInstruction: value.userInstruction, files: ['app/ui/callout.tsx'], tools: value.delegation.tools, models: value.delegation.models, now: now + 1000 };
  const next = createTaskException(request, {});
  assert.equal(next.expiresAt, value.expiresAt);
  assert.equal(next.createdAt, value.createdAt);
  assert.deepEqual(next.files, [...value.files, 'app/ui/callout.tsx']);
  for (const patch of [{ task: 'Unrelated task' }, { userInstruction: 'Use Claude instead' }, { tools: ['claude'], models: {} }]) assert.throws(() => createTaskException({ ...request, ...patch }, {}), /another unfinished task or routing/);
});

test("renewal restores expired access only to the same task, files, and routing", t => {
  const { root, value } = fixture(t, { tools: ['codex'], models: { codex: 'chosen-model' } });
  const later = Date.parse(value.expiresAt) + 1000;
  const request = { root, session: value.session, now: later };
  assert.throws(() => renewTaskException(request, { STACK127_DELEGATED: '1' }), /Only the coordinator/);
  assert.throws(() => renewTaskException(request, { CODEX_THREAD_ID: 'other-session' }), /another session/);
  const next = renewTaskException(request, {});
  assert.equal(next.task, value.task);
  assert.equal(next.userInstruction, value.userInstruction);
  assert.deepEqual(next.files, value.files);
  assert.deepEqual(next.delegation, value.delegation);
  assert.equal(readTaskException({ root, session: value.session, now: later }).expiresAt, next.expiresAt);
});

test("workers cannot create or delete exceptions or use them to release", t => {
  const { root, guardOptions } = fixture(t);
  assert.throws(() => createTaskException({ root, session: "worker" }, { STACK127_DELEGATED: "1" }), /Only the coordinator/);
  assert.throws(() => removeTaskException({ root, session: "coordinator" }, { STACK127_DELEGATED: "1" }), /Only the coordinator/);
  for (const lane of ["opus", "sol", "luna"]) {
    assert.match(check(edit("tmp/agent-task-exceptions/coordinator.json"), { ...guardOptions, lane, delegated: true }), /Only the coordinator/);
    for (const command of ["git push", "supabase db push", "node scripts/stack127/agents/task-exception.mjs create", "node scripts/stack127/agents/task-exception.mjs remove"]) {
      assert.match(check({ ...edit(""), tool_name: "Bash", tool_input: { command } }, { ...guardOptions, lane, delegated: true }), /Only the coordinator/);
    }
  }
});

test("no-delegation instructions reject native agents and CLI workers", t => {
  const { value, guardOptions } = fixture(t);
  assert.throws(() => delegationRoute(value), /prohibited delegation/);
  for (const name of ["Agent", "Task", "spawn_agent", "spawn_subagent"]) assert.match(check({ session_id: "coordinator", tool_name: name }, { ...guardOptions, delegated: false }), /prohibited delegation/);
  for (const command of ["node scripts/stack127/agents/delegate.mjs opus task", "codex exec task", "claude -p task", "grok --prompt-file task.md", "agy --input-format stream-json"]) assert.match(check({ session_id: "coordinator", tool_name: "Bash", tool_input: { command } }, { ...guardOptions, delegated: false }), /prohibited delegation/);
  for (const command of ["git diff -- scripts/stack127/agents/delegate.mjs", "cat scripts/stack127/agents/delegate.mjs", "rg delegate.mjs AGENTS.md", "sed -n '1,120p' scripts/stack127/agents/task-exception.mjs", "rg 'create|remove' scripts/stack127/agents/task-exception.mjs", 'codex exec --help', 'claude --version']) for (const lane of ['opus', 'sol', 'luna']) assert.equal(check({ session_id: "coordinator", tool_name: "Bash", tool_input: { command } }, { ...guardOptions, lane, delegated: false }), null);
  assert.match(check({ session_id: 'coordinator', tool_name: 'Bash', tool_input: { command: 'echo "$(node scripts/stack127/agents/delegate.mjs opus task)"' } }, { ...guardOptions, delegated: false }), /prohibited delegation/);
  assert.equal(check({ session_id: 'coordinator', tool_name: 'Bash', tool_input: { command: 'node --check scripts/stack127/agents/delegate.mjs' } }, { ...guardOptions, delegated: false }), null);
  assert.match(check({ session_id: 'coordinator', tool_name: 'Bash', tool_input: { command: 'node scripts/stack127/agents/delegate.mjs --check' } }, { ...guardOptions, delegated: false }), /prohibited delegation/);
});

test("named tools and models cannot fall back to an excluded provider", t => {
  const { value } = fixture(t, { tools: ["codex"], models: { codex: "chosen-model" } });
  const routing = delegationRoute(value, { tool: "codex", model: "chosen-model" });
  assert.deepEqual(routing.toolChain, ["codex"]);
  assert.throws(() => delegationRoute(value, { tool: "claude" }), /did not permit/);
  assert.throws(() => delegationRoute(value, { model: "other-model" }), /does not match/);
  assert.throws(() => delegationRoute(value, { previous: "claude", resume: true }), /resumed worker/);
  assert.throws(() => delegationRoute(null, { tool: "codex" }), /explicit-user/);
  const calls = [];
  const result = runWithFallback({ lane: "opus", startTool: "codex", toolChain: routing.toolChain }, {
    modelFor: tool => { calls.push(tool); return routing.model; },
    run: () => ({ status: 1, diagnostic: "Usage limit reached", resultText: "limited" }),
  });
  assert.deepEqual(calls, ["codex"]);
  assert.equal(result.allLimited, true);
  assert.equal(result.fallbackUsed, false);
  assert.match(result.fallbackSummary, /All permitted tools are out of limits/);
});

test("a permitted alternate tool resumes in its task lane and uses its selected model", t => {
  const { root, value } = fixture(t, { tools: ["codex", "grok"] });
  const runsRoot = path.join(root, "runs");
  fs.mkdirSync(path.join(runsRoot, "run"), { recursive: true });
  fs.writeFileSync(path.join(runsRoot, "run/meta.json"), JSON.stringify({ lane: "opus", tool: "codex", session: "worker" }));
  assert.equal(resolveResume("codex:worker", { lane: "opus", runsRoot, allowedTools: value.delegation.tools }).tool, "codex");
  assert.equal(resolveResume("codex:unsaved-worker", { lane: "opus", runsRoot, allowedTools: value.delegation.tools }).tool, "codex");
  assert.throws(() => resolveResume("claude:unsaved-worker", { lane: "opus", runsRoot, allowedTools: value.delegation.tools }), /Invalid/);
  assert.throws(() => resolveResume("codex:worker", { lane: "opus", runsRoot, allowedTools: ["claude"] }), /not permitted/);
  let args;
  runWorker({ lane: "sol", tool: "claude", model: "user-named-model", session: "worker", effort: "high", env: {}, prompt: "task" }, (_command, passedArgs) => { args = passedArgs; return { status: 0 }; });
  assert.equal(args[args.indexOf("--model") + 1], "user-named-model");
});

test("session identity comes from each host's hook rather than tool input", () => {
  assert.equal(taskSession({ session_id: "claude-current", tool_input: { session_id: "fake" } }, { CODEX_THREAD_ID: "parent" }), "claude-current");
  assert.equal(taskSession({ thread_id: "codex-current" }, {}), "codex-current");
  assert.equal(taskSession({}, { CLAUDE_SESSION_ID: "claude-current" }), "claude-current");
});

test("exception CLI creation and removal work without disabling the guard", t => {
  const session = `exception-test-${process.pid}`;
  const file = path.join(repoRoot, "tmp/agent-task-exceptions", `${session}.json`);
  t.after(() => fs.rmSync(file, { force: true }));
  const script = path.join(repoRoot, "scripts/stack127/agents/task-exception.mjs");
  const env = { ...process.env, CODEX_THREAD_ID: session, CLAUDE_SESSION_ID: "", STACK127_DELEGATED: "0" };
  const create = spawnSync(process.execPath, [script, "create", "--task", "Local test", "--user-instruction", "Do not delegate", "--file", "app/ui/callout.tsx", "--no-delegate"], { env, encoding: "utf8" });
  assert.equal(create.status, 0, create.stderr);
  const guard = path.join(repoRoot, "scripts/stack127/agents/lane-guard.mjs");
  const allowed = spawnSync(process.execPath, [guard, "codex"], { env, input: JSON.stringify({ ...edit("app/ui/callout.tsx"), session_id: session }), encoding: "utf8" });
  assert.equal(allowed.status, 0, allowed.stderr);
  const delegate = spawnSync(process.execPath, [path.join(repoRoot, "scripts/stack127/agents/delegate.mjs"), "opus", "must not start"], { env, encoding: "utf8" });
  assert.equal(delegate.status, 1);
  assert.match(delegate.stderr, /prohibited delegation/);
  const remove = spawnSync(process.execPath, [script, "remove"], { env, encoding: "utf8" });
  assert.equal(remove.status, 0, remove.stderr);
  const blocked = spawnSync(process.execPath, [guard, "codex"], { env, input: JSON.stringify({ ...edit("app/ui/callout.tsx"), session_id: session }), encoding: "utf8" });
  assert.equal(blocked.status, 2);
});
