import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ownerOf } from "../../scripts/stack127/agents/lanes.mjs";
import { check as guardCheck, shellWriteTargets } from "../../scripts/stack127/agents/lane-guard.mjs";
import { cliModel, newestCliModel, newestModel, syncProjectConfig } from "../../scripts/stack127/agents/models.mjs";
import { grokDenyRules, runWorker, workerExecutable } from "../../scripts/stack127/agents/worker-process.mjs";
import { limitReason, resolveResume, runWithFallback, workerResult } from "../../scripts/stack127/agents/fallback.mjs";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const guardPath = path.join(repoRoot, "scripts/stack127/agents/lane-guard.mjs");
const delegatePath = path.join(repoRoot, "scripts/stack127/agents/delegate.mjs");
const bash = (command, extra = {}) => ({ tool_name: "Bash", tool_input: { command, ...extra } });
const edit = (file_path) => ({ tool_name: "Edit", tool_input: { file_path } });
const patch = (command) => ({ tool_name: "apply_patch", tool_input: { command } });
// Default-rule tests must not inherit a real coordinator's active task exception.
const check = (payload, options) => guardCheck({ session_id: "ordinary-lane-test-session", ...payload }, options);

test("ownership keeps card art with Opus and server entry points with Codex", () => {
  for (const file of ["app/ui/callout.tsx", "lib/tool-catalog-art.ts", "content_docs/x/tool-spec.md", "content_docs/x/brief.md", "public/logos/mark.svg", "public/favicon.ico"]) assert.equal(ownerOf(file), "opus", file);
  for (const file of ["lib/dns/lookup.ts", "app/api/dns/route.ts", "app/(site)/x/route.ts", "app/sitemap.ts", "scripts/x.mjs", "tests/x.test.mjs", "supabase/migrations/x.sql", "proxy.ts", "middleware.ts", ".claude/settings.json", ".codex/hooks.json", "content_docs/x/research.md"]) assert.equal(ownerOf(file), "codex", file);
  assert.equal(ownerOf("./app/ui/../api/x/route.ts"), "codex");
  assert.equal(ownerOf("lib\\tool-catalog-art.ts"), "opus");
  assert.equal(ownerOf("AGENTS.md"), "shared");
  assert.equal(ownerOf("content_docs/x/writing-and-seo.md"), "opus");
  assert.equal(ownerOf("content_docs/x/interface-contract.md"), "opus");
  assert.equal(ownerOf("content_docs/x/research/0001-0005.md"), "codex");
  assert.equal(ownerOf("content_docs/x/review-progress.csv"), "codex");
  assert.equal(ownerOf("templates/stack127-tool-repo/app/page.tsx"), "opus");
  assert.equal(ownerOf("templates/stack127-tool-repo/Dockerfile"), "codex");
});

const guardCases = [
  ["opus", edit("lib/kdp/royalty.ts"), true, "Claude lib edit"],
  ["opus", edit("app/(site)/(tools)/x/page.tsx"), false, "Claude page edit"],
  ["opus", edit("lib/tool-catalog-art.ts"), false, "Claude card art"],
  ["opus", edit("app/api/dns/route.ts"), true, "Claude API edit"],
  ["opus", bash("git push origin main"), false, "Opus coordinator push"],
  ["opus", bash("cat lib/kdp/royalty.ts | head -5"), false, "Claude read"],
  ["opus", bash("sed -i s/a/b/ scripts/x.mjs"), true, "Claude in-place edit"],
  ["opus", bash("echo hi > tests/a.test.mjs"), true, "Claude redirect"],
  ["opus", bash("npm run quality 2>&1 | tail -5"), false, "Claude checks"],
  ["opus", edit("AGENTS.md"), false, "Claude shared instructions"],
  ["opus", bash("echo 'see git push docs' && rg -n push AGENTS.md"), false, "push mention"],
  ["sol", patch("*** Begin Patch\n*** Update File: app/ui/callout.tsx\n@@\n-a\n+b\n*** End Patch"), true, "Codex UI patch"],
  ["sol", patch("*** Begin Patch\n*** Update File: lib/dns/lookup.ts\n*** End Patch"), false, "Codex backend patch"],
  ["sol", bash("git push origin main"), false, "Sol release command"],
  ["sol", bash("echo x > stack127_docs/writing-style.md"), true, "Codex style edit"],
];
for (const [lane, payload, blocked, name] of guardCases) test(name, () => {
  for (const delegated of [false, true]) {
    if (delegated && payload.tool_input.command === "git push origin main") continue;
    assert.equal(Boolean(check(payload, { lane, delegated })), blocked);
  }
});

test("quoted prose and JSON do not create shell commands or redirects", () => {
  for (const command of [
    `echo '{"html":"<a> tests/a.test.mjs", "command":"git push; dokploy"}'`,
    `printf '%s\\n' "git push && npm run stack127:deploy > lib/x.ts"`,
    `echo git push`,
    `rg 'git push|dokploy|supabase db push' scripts`,
    `echo hi # git push > lib/x.ts`,
    `npm run test -- 'stack127:deploy'`,
    `npm run stack127:deploy:preflight`,
  ]) for (const lane of ["opus", "sol", "luna"]) for (const delegated of [false, true]) {
    assert.equal(check(bash(command), { lane, delegated }), null, `${lane}, delegated=${delegated}: ${command}`);
  }
  assert.deepEqual(shellWriteTargets(`echo '{"redirect": "> lib/x.ts"}' > '/tmp/lane result.json'`), ["/tmp/lane result.json"]);
});

test("real commands remain blocked through quoting, wrappers, and substitutions", () => {
  for (const command of [
    `git -C . push origin main`,
    `env MODE=test command /usr/bin/git 'push' origin main`,
    `env -S 'git push origin main'`,
    `npm exec -- git push origin main`,
    `npx --yes git push origin main`,
    `nohup timeout 10s git push origin main`,
    `bash -lc 'git push origin main'`,
    `echo "$(git push origin main)"`,
    'echo `git push origin main`',
    `eval 'git push origin main'`,
    `echo hi && npm run stack127:deploy`,
    `node scripts/stack127/deployment/dokploy-release.mjs release`,
    `gh workflow run 'Stack127 Release'`,
    `supabase functions deploy cache-worker`,
    `docker --context prod push image`,
    `supabase --workdir . db push`,
    `node scripts/self-host-apps/apply-qa-overrides.mjs --apply`,
  ]) for (const lane of ["opus", "sol", "luna"]) {
    assert.ok(check(bash(command), { lane, delegated: true }), `${lane}: ${command}`);
    assert.equal(check(bash(command), { lane, delegated: false }), null, `${lane}: ${command}`);
  }
  assert.equal(check(bash(`echo '$(git push)'`), { lane: "opus", delegated: true }), null);
});

test("write targets include quoted paths, descriptor redirects, in-place edits, and moves", () => {
  for (const command of [
    `echo x > 'lib/file with spaces.ts'`,
    `echo x > "$PWD/lib/x.ts"`,
    `echo x 2>lib/errors.ts`,
    `echo x &>lib/errors.ts`,
    `echo x >|lib/x.ts`,
    `printf x | /usr/bin/tee lib/x.ts`,
    `sed --in-place 's/a/b/' lib/x.ts`,
    `mv lib/x.ts /tmp/x.ts`,
    `cp /tmp/x.ts lib`,
    `bash -c 'echo x > lib/x.ts'`,
    `echo "$(echo x > lib/x.ts)"`,
  ]) assert.ok(check(bash(command), { lane: "opus" }), command);
  assert.deepEqual(shellWriteTargets("npm run quality 2>&1"), []);
});

test("guard resolves cwd, cd, patch moves, and existing symlinks", (t) => {
  assert.ok(check({ ...edit("royalty.ts"), cwd: path.join(repoRoot, "lib/kdp") }, { lane: "opus" }));
  assert.ok(check(bash("echo x > royalty.ts", { cwd: path.join(repoRoot, "lib/kdp") }), { lane: "opus" }));
  assert.ok(check(bash("cd lib && echo x > x.ts"), { lane: "opus" }));
  assert.ok(check(bash("(cd /tmp); echo x > lib/x.ts"), { lane: "opus" }));
  assert.ok(check(bash("cd lib && bash -c 'echo x > x.ts'"), { lane: "opus" }));
  assert.ok(check(patch("*** Begin Patch\n*** Update File: lib/x.ts\n*** Move to: app/ui/x.tsx\n*** End Patch"), { lane: "sol" }));
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "stack127-lane-symlink-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  fs.symlinkSync(path.join(repoRoot, "lib"), path.join(temp, "alias"));
  assert.ok(check(edit(path.join(temp, "alias/new.ts")), { lane: "opus" }));
});

test("all lanes can read files owned by another lane", () => {
  for (const tool_name of ["Read", "mcp__filesystem__read_file", "view_image"]) {
    assert.equal(check({ tool_name, tool_input: { file_path: "app/ui/callout.tsx", path: "app/ui/callout.tsx" } }, { lane: "sol" }), null);
    assert.equal(check({ tool_name, tool_input: { path: "lib/dns/lookup.ts" } }, { lane: "opus" }), null);
  }
});

test("worker CLI requests preserve stdin prompts and resume arguments without launching agents", () => {
  for (const lane of ["opus", "sol", "luna"]) for (const resume of [false, true]) {
    const prompt = "Private task text with `backticks` and $(shell syntax).";
    const session = "fixture-session";
    let call;
    const result = runWorker({ lane, model: "fixture-model", effort: "high", session, resume, resultPath: "/tmp/result.md", repoRoot, env: { STACK127_LANE: lane }, prompt }, (...args) => { call = args; return { status: 0 }; });
    assert.equal(result.status, 0);
    const [command, args, options] = call;
    assert.equal(command, lane === "opus" ? "claude" : "codex");
    assert.equal(args.includes(prompt), false);
    assert.equal(options.input, prompt);
    assert.equal(options.stdio[0], "pipe");
    if (resume) assert.ok(args.includes("--resume") || args[1] === "resume");
    if (lane !== "opus") {
      assert.equal(args.at(-1), "-");
      assert.ok(args.includes('sandbox_mode="workspace-write"'));
    }
  }
});

const releaseCommands = [
  "git push origin main",
  "docker push image",
  "dokploy deploy",
  "npm run stack127:deploy",
  "pnpm run stack127:deploy:release",
  "yarn stack127:deploy",
  "bun run stack127:deploy",
  "node scripts/stack127/deployment/dokploy-release.mjs release",
  "gh workflow run stack127-release-e2e.yml",
  "gh workflow run stack127-release-e2e",
  "gh workflow run 'Stack127 Release'",
  "supabase functions deploy cache-worker",
  "supabase db push",
  "node scripts/self-host-apps/apply-qa-overrides.mjs --apply",
  "npm run data:update -- --apply",
];

test("release and data apply commands belong to coordinators in every lane", () => {
  for (const lane of ["opus", "sol", "luna"]) for (const command of releaseCommands) {
    assert.equal(check(bash(command), { lane, delegated: false }), null, `${lane}: ${command}`);
    assert.match(check(bash(command), { lane, delegated: true }), /Only the coordinator may/, `${lane}: ${command}`);
  }
});

test("Sol and Luna workers can still edit backend and data files", () => {
  for (const lane of ["sol", "luna"]) for (const file of ["lib/domain/data/tlds.json", "scripts/x.mjs"]) {
    assert.equal(check(edit(file), { lane, delegated: true }), null);
  }
});

test("hook CLI returns exit 2 for blocked calls and malformed payloads", () => {
  for (const input of [JSON.stringify(edit("lib/x.ts")), "invalid JSON", "null"]) {
    const run = spawnSync(process.execPath, [guardPath, "claude"], { input, encoding: "utf8", env: { ...process.env, STACK127_LANE_GUARD: "on", STACK127_DELEGATED: "1", STACK127_LANE: "opus" } });
    assert.equal(run.status, 2, run.stderr);
    assert.match(run.stderr, /Needs other lanes/);
    assert.match(run.stderr, /Report this back to the coordinator/);
  }
});

test("hook CLI uses worker status to block releases in every lane", () => {
  for (const lane of ["opus", "sol", "luna"]) for (const delegated of [false, true]) {
    for (const command of ["git push", "npm run stack127:deploy", "node scripts/data/update.mjs --apply"]) {
      const run = spawnSync(process.execPath, [guardPath, lane === "opus" ? "claude" : "codex"], {
        input: JSON.stringify(bash(command)), encoding: "utf8",
        env: { ...process.env, STACK127_LANE_GUARD: "on", STACK127_LANE: lane, STACK127_DELEGATED: delegated ? "1" : "0" },
      });
      assert.equal(run.status, delegated ? 2 : 0, `${lane}, delegated=${delegated}: ${command}\n${run.stderr}`);
      if (delegated) assert.match(run.stderr, /Report this back to the coordinator/);
    }
  }
});

test("delegated workers cannot delegate or start built-in agents", () => {
  const run = spawnSync(process.execPath, [delegatePath, "opus", "do not launch"], { encoding: "utf8", env: { ...process.env, STACK127_DELEGATED: "1" } });
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /Delegated workers do not delegate/);
  for (const tool_name of ["Agent", "Task", "spawn_agent", "spawn_subagent"]) assert.ok(check({ tool_name, tool_input: {} }, { lane: "sol", delegated: true }));
  assert.equal(check({ tool_name: "spawn_agent", tool_input: {} }, { lane: "sol", delegated: false }), null);
});

test("newest-model picking uses numeric versions and ignores hidden or malformed entries", (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "stack127-models-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const cachePath = path.join(temp, "models.json");
  const models = [
    { slug: "gpt-6.9-sol", visibility: "list" }, { slug: "gpt-6.10-sol", visibility: "list" },
    { slug: "gpt-7-sol", visibility: "hide" }, { slug: "gpt-6-luna" }, { slug: "gpt-6.1-luna" },
    { slug: "gpt-6.11-astra" }, { slug: "gpt-99-sol-preview" }, { slug: 123 }, null,
  ];
  for (const cache of [models, { models }, { data: models }]) {
    fs.writeFileSync(cachePath, JSON.stringify(cache));
    assert.equal(newestModel("sol", { cachePath }), "gpt-6.10-sol");
    assert.equal(newestModel("luna", { cachePath }), "gpt-6.1-luna");
  }
  const configPath = path.join(temp, "config.toml");
  fs.writeFileSync(configPath, '[profiles.review]\nmodel = "profile-model"\n');
  assert.equal(syncProjectConfig({ cachePath, configPath }).changed, true);
  const config = fs.readFileSync(configPath, "utf8");
  assert.match(config, /^model_reasoning_effort = "high"\nmodel = "gpt-6.10-sol"\n\[profiles.review\]\nmodel = "profile-model"/);
  assert.equal(syncProjectConfig({ cachePath, configPath }).changed, false);
  for (const invalid of ["{", "null", '{"models":{}}', "[]"]) {
    fs.writeFileSync(cachePath, invalid);
    assert.equal(newestModel("sol", { cachePath }), null);
  }
  assert.equal(newestModel("sol", { cachePath: path.join(temp, "missing") }), null);
});

test("fallback model lists select only newest main Grok and Gemini Flash High", () => {
  assert.equal(newestCliModel("grok", "Default model: grok-99\n  * grok-4.9 (default)\n  - grok-4.10\n  - grok-5-build-fast\n  - grok-8-preview"), "grok-4.10");
  assert.equal(newestCliModel("agy", "gemini-3.9-flash-high\tGemini 3.9 Flash\ngemini-3.10-flash-high\tGemini 3.10 Flash\ngemini-4-pro-high\tPro\ngemini-5-flash-low\tLow"), "gemini-3.10-flash-high");
  for (const tool of ["grok", "agy"]) {
    assert.equal(newestCliModel(tool, "unknown"), null);
    assert.throws(() => cliModel(tool, tool, { spawn: () => ({ status: 1, stderr: "model discovery failed" }) }), /model list failed/);
    assert.throws(() => cliModel(tool, tool, { spawn: () => ({ status: 0, stdout: "unknown" }) }), /No .* model/);
  }
  assert.equal(cliModel("grok", "grok", { spawn: (command, args, options) => {
    assert.deepEqual(args, ["models"]);
    assert.equal(options.timeout, 30000);
    return { status: 0, stdout: "grok-4.10" };
  } }), "grok-4.10");
});

test("limit detection requires failed CLI diagnostics, not successful answers or tool output", () => {
  const failures = [
    ["claude", { status: 0, stdout: JSON.stringify({ type: "result", is_error: true, result: "You've hit your usage limit. Try again later." }) }, "usage limit"],
    ["codex", { status: 1, stdout: JSON.stringify({ type: "turn.failed", error: { message: "HTTP 429 Too Many Requests" } }) }, "rate limit"],
    ["grok", { status: 1, stdout: JSON.stringify({ type: "error", message: "rate_limit_exceeded" }) }, "rate limit"],
    ["agy", { status: 1, stdout: JSON.stringify({ event: "result", result: { status: "ERROR", error: "RESOURCE_EXHAUSTED: quota exceeded" } }) }, "quota limit"],
    ["grok", { status: 1, stdout: JSON.stringify({ type: "error", message: "Daily token limit exceeded" }) }, "usage limit"],
    ["claude", { status: 1, stdout: JSON.stringify({ type: "result", is_error: true, result: "You've hit your limit. Resets at 6pm." }) }, "usage limit"],
  ];
  for (const [tool, run, reason] of failures) assert.equal(limitReason(workerResult(tool, run)), reason, tool);
  for (const tool of ["claude", "codex", "grok", "agy"]) {
    for (const message of ["Disk quota exceeded", "test failure: expected HTTP 429", "Authentication required", "panic: crash", "There were 429 errors", "Limit on file size exceeded", "The response about usage limits was invalid", "Could not calculate a rate limit"]) {
      assert.equal(limitReason(workerResult(tool, { status: 1, stderr: message })), null, `${tool}: ${message}`);
    }
  }
  const success = workerResult("grok", { status: 0, stdout: JSON.stringify({ text: "Explain rate limits and quota exceeded errors." }), stderr: "HTTP 429 transient warning" });
  assert.equal(limitReason(success), null);
  const toolFailure = workerResult("codex", { status: 1, stdout: JSON.stringify({ type: "item.completed", item: { type: "command_execution", aggregated_output: "HTTP 429" } }), stderr: "Tests failed." });
  assert.equal(limitReason(toolFailure), null);
  const recovered = workerResult("codex", { status: 1, stdout: '{"type":"error","message":"HTTP 429"}\n{"type":"turn.failed","error":{"message":"Invalid command"}}', stderr: "HTTP 429 earlier warning" });
  assert.equal(limitReason(recovered), null);
  const noResult = workerResult("grok", { status: 0, stdout: "{}", stderr: "HTTP 429 earlier warning" });
  assert.equal(limitReason(noResult), null);
  const cancelled = workerResult("agy", { status: 1, stdout: '{"event":"result","result":{"status":"CANCELED","error":"quota exceeded earlier"}}' });
  assert.equal(limitReason(cancelled), null);
  for (const run of [{ status: 130, stderr: "Usage limit reached" }, { status: null, signal: "SIGTERM", stderr: "Usage limit reached" }, { status: null, error: new Error("Usage limit reached") }]) assert.equal(limitReason(workerResult("grok", run)), null);
});

test("worker result parsing preserves actual sessions, failures, and responses", () => {
  for (const [tool, stdout, session, resultText] of [
    ["claude", { type: "result", session_id: "claude-id", result: "done" }, "claude-id", "done"],
    ["grok", { sessionId: "grok-id", text: "done", stopReason: "end_turn" }, "grok-id", "done"],
    ["agy", { event: "result", result: { conversation_id: "agy-id", status: "SUCCESS", response: "done" } }, "agy-id", "done"],
  ]) {
    const result = workerResult(tool, { status: 0, stdout: JSON.stringify(stdout) });
    assert.equal(result.session, session);
    assert.equal(result.status, 0);
    assert.equal(result.resultText, resultText);
  }
  const failed = workerResult("agy", { status: 0, stdout: JSON.stringify({ event: "result", result: { status: "WAITING", error: "Permission required" } }) });
  assert.equal(failed.status, 1);
  const codex = workerResult("codex", { status: 1, stdout: '{"type":"thread.started","thread_id":"codex-id"}\n{"type":"turn.failed","error":{"message":"Usage limit reached"}}' });
  assert.equal(codex.session, "codex-id");
  assert.equal(limitReason(codex), "usage limit");
  for (const stdout of ["null", "[]", "invalid"]) assert.equal(workerResult("grok", { status: 0, stdout }).status, 1);
});

test("mock fallback follows normal tool, Grok, then Gemini for all lanes", () => {
  for (const lane of ["opus", "sol", "luna"]) for (const lastTool of [lane === "opus" ? "claude" : "codex", "grok", "agy"]) {
    const chain = [lane === "opus" ? "claude" : "codex", "grok", "agy"];
    const tools = [];
    const result = runWithFallback({ lane }, {
      modelFor: (tool) => { tools.push(tool); return `${tool}-fixture-model`; },
      simulateLimits: chain.slice(0, chain.indexOf(lastTool)),
      run: ({ tool }) => ({ status: 0, session: `${tool}-session`, resultText: "done", diagnostic: "" }),
    });
    assert.deepEqual(tools, chain.slice(0, chain.indexOf(lastTool) + 1));
    assert.equal(result.tool, lastTool);
    assert.equal(result.status, 0);
    assert.equal(result.session, `${lastTool}-session`);
    assert.equal(result.fallbackUsed, lastTool !== chain[0]);
    if (result.fallbackUsed) {
      assert.match(result.fallbackSummary, /Fallback used: .* hit its usage limit/);
      assert.ok(result.fallbackSummary.includes(`${lastTool}-fixture-model`));
    }
  }
});

test("all-out fallback reports every attempted tool and stops", () => {
  const result = runWithFallback({ lane: "sol" }, {
    modelFor: (tool) => `${tool}-fixture-model`, simulateLimits: ["codex", "grok", "agy"],
    run: () => assert.fail("Simulated limits must not launch a worker"),
  });
  assert.equal(result.status, 1);
  assert.equal(result.allLimited, true);
  assert.deepEqual(result.attempts.map(({ tool }) => tool), ["codex", "grok", "agy"]);
  assert.match(result.fallbackSummary, /All tools are out of limits.*Codex, Grok, Gemini in Antigravity/);
});

test("realistic mocked CLI limit envelopes trigger the complete fallback order", () => {
  const outputs = {
    codex: { status: 1, stdout: '{"type":"turn.failed","error":{"message":"HTTP 429 Too Many Requests"}}' },
    grok: { status: 1, stdout: '{"type":"error","message":"quota exceeded"}' },
    agy: { status: 0, stdout: '{"event":"result","result":{"conversation_id":"gemini-session","status":"SUCCESS","response":"done"}}' },
  };
  const result = runWithFallback({ lane: "sol" }, { modelFor: (tool) => `${tool}-model`, run: ({ tool }) => workerResult(tool, outputs[tool]) });
  assert.equal(result.status, 0);
  assert.equal(result.session, "gemini-session");
  assert.deepEqual(result.limits, [{ tool: "codex", reason: "rate limit" }, { tool: "grok", reason: "quota limit" }]);
  assert.deepEqual(result.attempts.map(({ tool }) => tool), ["codex", "grok", "agy"]);
  assert.match(result.fallbackSummary, /Codex hit its rate limit; Grok hit its quota limit/);
});

test("normal worker or setup failures never cause another fallback", () => {
  for (const failingTool of ["codex", "grok"]) {
    const result = runWithFallback({ lane: "sol" }, {
      modelFor: (tool) => tool,
      simulateLimits: failingTool === "grok" ? ["codex"] : [],
      run: () => ({ status: 1, session: null, resultText: "Tests failed.", diagnostic: "Tests failed: HTTP 429 assertion." }),
    });
    assert.equal(result.tool, failingTool);
    assert.equal(result.allLimited, false);
    assert.equal(result.attempts.length, failingTool === "grok" ? 2 : 1);
  }
  const result = runWithFallback({ lane: "sol" }, { modelFor: () => { throw new Error("Missing CLI or model list failed"); }, run: () => assert.fail() });
  assert.equal(result.attempts.length, 1);
  assert.equal(result.status, 1);
});

test("resume routes to the saved fallback tool and keeps the original limit reason", (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "stack127-fallback-resume-"));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temp, "invalid"));
  fs.writeFileSync(path.join(temp, "invalid/meta.json"), "null");
  for (const tool of ["grok", "agy"]) {
    const dir = path.join(temp, tool);
    fs.mkdirSync(dir);
    fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ lane: "sol", tool, session: `${tool}-id`, limits: [{ tool: "codex", reason: "usage limit" }] }));
    for (const reference of [`${tool}-id`, `${tool}:${tool}-id`]) {
      const saved = resolveResume(reference, { lane: "sol", runsRoot: temp });
      let call;
      const result = runWithFallback({ lane: "sol", startTool: saved.tool, session: saved.session, resume: true, priorLimits: saved.limits }, {
        modelFor: () => "latest-model", run: (request) => { call = request; return { status: 0, session: request.session, resultText: "done" }; },
      });
      assert.equal(call.tool, tool);
      assert.equal(call.resume, true);
      assert.equal(call.session, `${tool}-id`);
      assert.match(result.fallbackSummary, /Codex hit its usage limit/);
    }
    assert.throws(() => resolveResume(`${tool}-id`, { lane: "opus", runsRoot: temp }), /belongs to sol/);
  }
  assert.throws(() => resolveResume("grok:missing", { lane: "sol", runsRoot: temp }), /saved meta.json/);
  assert.deepEqual(resolveResume("legacy-codex-id", { lane: "sol", runsRoot: temp }), { tool: "codex", session: "legacy-codex-id", limits: [] });
});

test("a resumed Grok limit continues to Gemini without restarting Codex", () => {
  const calls = [];
  const result = runWithFallback({ lane: "sol", startTool: "grok", session: "saved-grok", resume: true, priorLimits: [{ tool: "codex", reason: "usage limit" }] }, {
    modelFor: (tool) => { calls.push(tool); return tool; }, simulateLimits: ["grok"],
    run: ({ tool, resume, session }) => {
      assert.equal(tool, "agy");
      assert.equal(resume, false);
      assert.equal(session, null);
      return { status: 0, session: "gemini-session", resultText: "done" };
    },
  });
  assert.deepEqual(calls, ["grok", "agy"]);
  assert.equal(result.tool, "agy");
  assert.match(result.fallbackSummary, /Codex hit its usage limit; Grok hit its usage limit/);
});

test("fallback adapters keep prompts private and pass native permissions and resume flags", () => {
  for (const tool of ["grok", "agy"]) for (const resume of [false, true]) {
    const prompt = "Private prompt with `backticks` and $(shell syntax).";
    const env = { STACK127_DELEGATED: "1", STACK127_LANE: "luna", STACK127_LANE_GUARD: "on" };
    let call;
    runWorker({ lane: "luna", tool, model: "fixture-model", effort: "xhigh", session: "fixture-id", resume, repoRoot, env, prompt, promptPath: "/tmp/private-prompt.md", denyRules: ["Edit(app/ui/**)"] }, (...args) => { call = args; return { status: 0 }; });
    const [command, args, options] = call;
    assert.equal(command, workerExecutable(tool));
    assert.equal(args.includes(prompt), false);
    assert.equal(options.env.STACK127_DELEGATED, "1");
    assert.equal(options.env.STACK127_LANE, "luna");
    if (tool === "grok") {
      assert.ok(args.includes("--prompt-file"));
      assert.ok(args.includes("--no-subagents"));
      assert.ok(args.includes("Edit(app/ui/**)"));
      assert.ok(args.includes(resume ? "--resume" : "--session-id"));
      assert.equal(options.input, undefined);
    } else {
      assert.ok(args.includes("--sandbox"));
      assert.equal(args.includes("--dangerously-skip-permissions"), false);
      assert.ok(args.includes("max"));
      assert.equal(args.includes("--conversation"), resume);
      assert.equal(JSON.parse(options.input).message.content, prompt);
    }
  }
});

test("Grok native rules deny other-lane files and worker release commands", () => {
  const files = ["app/ui/card.tsx", "app/(site)/[slug]/page.tsx", "lib/dns.ts", "lib/tool-catalog-art.ts", "AGENTS.md"];
  const sol = grokDenyRules("sol", files);
  assert.ok(sol.includes("Edit(app/ui/card.tsx)"));
  assert.ok(sol.includes("Edit(app/(site)/[[]slug]/page.tsx)"));
  assert.ok(sol.includes("Edit(lib/tool-catalog-art.ts)"));
  assert.equal(sol.includes("Edit(lib/dns.ts)"), false);
  const opus = grokDenyRules("opus", files);
  assert.ok(opus.includes("Edit(lib/dns.ts)"));
  assert.equal(opus.includes("Edit(lib/tool-catalog-art.ts)"), false);
  for (const rules of [sol, opus]) for (const rule of ["Bash(git *push*)", "Bash(npm run stack127:deploy)", "Bash(gh workflow run *)", "Bash(*--environment*production*)", "MCPTool(*)"]) assert.ok(rules.includes(rule));
});

test("compatible Claude hooks preserve the fallback worker's assigned lane", () => {
  for (const lane of ["opus", "sol", "luna"]) {
    const payload = { toolName: "search_replace", toolInput: { target_file: "lib/dns.ts" } };
    const run = spawnSync(process.execPath, [guardPath, "claude"], {
      input: JSON.stringify(payload), encoding: "utf8",
      env: { ...process.env, STACK127_LANE_GUARD: "on", STACK127_DELEGATED: "1", STACK127_LANE: lane },
    });
    assert.equal(run.status, lane === "opus" ? 2 : 0, run.stderr);
  }
  assert.equal(check({ toolName: "read_file", toolInput: { target_file: "lib/dns.ts" } }, { lane: "opus", delegated: true }), null);
});
