import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { ownerOf } from "../../scripts/stack127/agents/lanes.mjs";
import { check, shellWriteTargets } from "../../scripts/stack127/agents/lane-guard.mjs";
import { newestModel, syncProjectConfig } from "../../scripts/stack127/agents/models.mjs";
import { runWorker } from "../../scripts/stack127/agents/worker-process.mjs";

const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const guardPath = path.join(repoRoot, "scripts/stack127/agents/lane-guard.mjs");
const delegatePath = path.join(repoRoot, "scripts/stack127/agents/delegate.mjs");
const bash = (command, extra = {}) => ({ tool_name: "Bash", tool_input: { command, ...extra } });
const edit = (file_path) => ({ tool_name: "Edit", tool_input: { file_path } });
const patch = (command) => ({ tool_name: "apply_patch", tool_input: { command } });

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
  ["opus", bash("git push origin main"), true, "Claude push"],
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
  assert.equal(Boolean(check(payload, { lane, delegated: false })), blocked);
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
  ]) assert.equal(check(bash(command), { lane: "opus" }), null, command);
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
  ]) assert.ok(check(bash(command), { lane: "opus" }), command);
  assert.equal(check(bash(`echo '$(git push)'`), { lane: "opus" }), null);
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

test("Luna can change backend/data files but cannot push or deploy", () => {
  assert.equal(check(edit("lib/domain/data/tlds.json"), { lane: "luna" }), null);
  assert.equal(check(bash("node scripts/self-host-apps/apply-qa-overrides.mjs --apply"), { lane: "luna" }), null);
  for (const command of ["git push", "npm run stack127:deploy", "node scripts/stack127/deployment/dokploy-release.mjs release"]) {
    assert.ok(check(bash(command), { lane: "luna" }), command);
    assert.equal(check(bash(command), { lane: "sol" }), null, command);
  }
});

test("hook CLI returns exit 2 for blocked calls and malformed payloads", () => {
  for (const input of [JSON.stringify(edit("lib/x.ts")), "invalid JSON", "null"]) {
    const run = spawnSync(process.execPath, [guardPath, "claude"], { input, encoding: "utf8", env: { ...process.env, STACK127_LANE_GUARD: "on", STACK127_DELEGATED: "1" } });
    assert.equal(run.status, 2, run.stderr);
    assert.match(run.stderr, /Needs other lanes/);
  }
  const run = spawnSync(process.execPath, [guardPath, "codex"], { input: JSON.stringify(bash("git push")), encoding: "utf8", env: { ...process.env, STACK127_LANE_GUARD: "on", STACK127_LANE: "luna" } });
  assert.equal(run.status, 2, run.stderr);
});

test("delegated workers cannot delegate or start built-in agents", () => {
  const run = spawnSync(process.execPath, [delegatePath, "opus", "do not launch"], { encoding: "utf8", env: { ...process.env, STACK127_DELEGATED: "1" } });
  assert.equal(run.status, 3, run.stderr);
  assert.match(run.stderr, /Delegated workers do not delegate/);
  for (const tool_name of ["Agent", "Task", "spawn_agent"]) assert.ok(check({ tool_name, tool_input: {} }, { lane: "sol", delegated: true }));
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
