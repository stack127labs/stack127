import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const runner = fileURLToPath(new URL("../../scripts/stack127/setup-worktree.mjs", import.meta.url));
const names = [".env.local", ".env.database", ".env.deploy", ".env.analytics", ".env.homelab", ".env.repos", ".env.affiliate", ".env.search"];

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "stack127-setup-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const main = path.join(directory, "main checkout");
  const checkout = path.join(directory, "task checkout");
  const bin = path.join(directory, "bin");
  await mkdir(main);
  await mkdir(bin);
  for (const folder of ["skills", ".agents", ".claude/skills"]) await mkdir(path.join(main, folder), { recursive: true });
  await symlink("../skills", path.join(main, ".agents/skills"));
  await writeFile(path.join(main, "skills/example.txt"), "skill fixture");
  await writeFile(path.join(main, ".claude/skills/example.txt"), "skill fixture");
  await writeFile(path.join(main, "package.json"), JSON.stringify({ name: "stack127" }));
  await writeFile(path.join(main, "package-lock.json"), "{}");
  await writeFile(path.join(main, ".gitignore"), ".env*\nnode_modules/\n.next/\ntmp/\n");
  const git = (args) => execFileSync("git", args, { cwd: main, stdio: "ignore" });
  git(["init", "-b", "main"]);
  git(["add", "."]);
  git(["-c", "user.name=Test", "-c", "user.email=test@example.com", "commit", "-m", "Fixture"]);
  git(["worktree", "add", "-b", "task", checkout]);
  for (const name of names) await writeFile(path.join(main, name), "FIXTURE_VALUE=shared\n", { mode: 0o600 });
  await writeFile(path.join(bin, "npm"), `#!${process.execPath}
const fs = require('node:fs');
if(process.env.FAIL_INSTALL)process.exit(7);
fs.mkdirSync('node_modules/next/dist/bin',{recursive:true});
fs.writeFileSync('node_modules/next/dist/bin/next',"require('node:fs').mkdirSync('.next/types',{recursive:true});console.log('Types generated');");
`, { mode: 0o755 });
  const run = (cwd = checkout, extra = {}) => spawnSync(process.execPath, [runner], {
    cwd, encoding: "utf8",
    env: { ...process.env, T3CODE_PROJECT_ROOT: main, PATH: `${bin}:${process.env.PATH}`, ...extra },
  });
  return { main, checkout, run };
}

test("fresh worktrees link all available env files and install their own dependencies", async (t) => {
  const { main, checkout, run } = await fixture(t);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Worktree ready/);
  assert.doesNotMatch(result.stdout, /FIXTURE_VALUE|shared\n/);
  for (const name of names) assert.equal(await realpath(path.join(checkout, name)), path.join(main, name));
  await realpath(path.join(checkout, "node_modules/next/dist/bin/next"));
  await assert.rejects(realpath(path.join(main, "node_modules")), { code: "ENOENT" });
  await realpath(path.join(checkout, ".next/types"));
  assert.equal(execFileSync("git", ["status", "--porcelain"], { cwd: checkout, encoding: "utf8" }), "");
  assert.equal(run().status, 0);
});

test("setup preserves private checkout-specific environments and the main source files", async (t) => {
  const { main, checkout, run } = await fixture(t);
  const local = path.join(checkout, ".env.local");
  await writeFile(local, "FIXTURE_VALUE=checkout-only\n", { mode: 0o600 });
  assert.equal(run().status, 0);
  assert.equal(await readFile(local, "utf8"), "FIXTURE_VALUE=checkout-only\n");
  assert.equal(run(main).status, 0);
  assert.equal(await readFile(path.join(main, ".env.local"), "utf8"), "FIXTURE_VALUE=shared\n");
});

test("a conflicting link or shared dependency folder fails without replacing local files", async (t) => {
  const { main, checkout, run } = await fixture(t);
  await symlink(path.join(main, ".env.database"), path.join(checkout, ".env.local"));
  const conflict = run();
  assert.equal(conflict.status, 1);
  assert.match(conflict.stderr, /link points somewhere else/);
  await assert.rejects(realpath(path.join(checkout, ".env.deploy")), { code: "ENOENT" });
  await rm(path.join(checkout, ".env.local"));
  await mkdir(path.join(main, "node_modules"));
  await symlink(path.join(main, "node_modules"), path.join(checkout, "node_modules"));
  const shared = run();
  assert.equal(shared.status, 1);
  assert.match(shared.stderr, /not be a shared link/);
  assert.equal(await realpath(path.join(checkout, "node_modules")), path.join(main, "node_modules"));
});

test("missing development credentials and failed installs never report a ready checkout", async (t) => {
  const { main, run } = await fixture(t);
  const local = path.join(main, ".env.local");
  await rm(local);
  const missing = run();
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /Missing development environment/);
  await writeFile(local, "FIXTURE_VALUE=shared\n", { mode: 0o600 });
  const failed = run(undefined, { FAIL_INSTALL: "1" });
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /exited with code 7/);
  assert.doesNotMatch(failed.stdout, /Worktree ready/);
});
