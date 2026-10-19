import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { chmod, lstat, mkdir, mkdtemp, readFile, realpath, rm, symlink, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const runner = fileURLToPath(new URL("../../scripts/stack127/setup-worktree.mjs", import.meta.url));
const syncRunner = fileURLToPath(new URL("../../scripts/stack127/shared-env.mjs", import.meta.url));
const names = [".env.local", ".env.database", ".env.deploy", ".env.analytics", ".env.homelab", ".env.repos", ".env.affiliate", ".env.search"];

async function fixture(t) {
  const directory = await realpath(await mkdtemp(path.join(os.tmpdir(), "stack127-setup-test-")));
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
  const env = { ...process.env, HOME: directory, STACK127_ENV_DIR: "", T3CODE_PROJECT_ROOT: main, PATH: `${bin}:${process.env.PATH}` };
  const run = (cwd = checkout, extra = {}) => spawnSync(process.execPath, [runner], {
    cwd, encoding: "utf8",
    env: { ...env, ...extra },
  });
  const sync = (args = ["sync"]) => spawnSync(process.execPath, [syncRunner, ...args], { cwd: checkout, encoding: "utf8", env });
  return { directory, main, checkout, run, sync, env };
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

test("conflicting private copies fail setup before changing any environment files", async (t) => {
  const { main, checkout, run } = await fixture(t);
  const local = path.join(checkout, ".env.local");
  await writeFile(local, "FIXTURE_VALUE=checkout-only\n", { mode: 0o600 });
  const identical = path.join(checkout, ".env.analytics");
  await writeFile(identical, "FIXTURE_VALUE=shared\n", { mode: 0o600 });
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Conflicting private copies/);
  assert.doesNotMatch(result.stdout + result.stderr, /FIXTURE_VALUE|checkout-only/);
  assert.equal((await lstat(local)).isSymbolicLink(), false);
  assert.equal((await lstat(identical)).isSymbolicLink(), false);
  await assert.rejects(lstat(path.join(checkout, ".env.deploy")), { code: "ENOENT" });
  assert.equal(await readFile(local, "utf8"), "FIXTURE_VALUE=checkout-only\n");
  assert.equal(run(main).status, 1);
  assert.equal(await readFile(path.join(main, ".env.local"), "utf8"), "FIXTURE_VALUE=shared\n");
});

test("identical private copies become links and read-only main files stay untouched", async (t) => {
  const { main, checkout, run } = await fixture(t);
  const source = path.join(main, ".env.local");
  await chmod(source, 0o400);
  const before = await lstat(source);
  await writeFile(path.join(checkout, ".env.local"), await readFile(source), { mode: 0o600 });
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal((await lstat(path.join(checkout, ".env.local"))).isSymbolicLink(), true);
  assert.equal(await realpath(path.join(checkout, ".env.local")), source);
  assert.equal((await lstat(source)).ino, before.ino);
  assert.equal((await lstat(source)).mode & 0o777, 0o400);
});

test("new private env names are discovered without linking examples or backups", async (t) => {
  const { main, checkout, run } = await fixture(t);
  for (const name of [".env.new-service", ".env.new-service.example", ".env.new-service.backup"]) {
    await writeFile(path.join(main, name), "FIXTURE_VALUE=new\n", { mode: 0o600 });
  }
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(await realpath(path.join(checkout, ".env.new-service")), path.join(main, ".env.new-service"));
  for (const suffix of ["example", "backup"]) {
    await assert.rejects(lstat(path.join(checkout, `.env.new-service.${suffix}`)), { code: "ENOENT" });
  }
});

test("worktree-only env files are promoted on Linux and rejected without mutation on Macs", async (t) => {
  const { main, checkout, run } = await fixture(t);
  const local = path.join(checkout, ".env.new-service");
  await writeFile(local, "FIXTURE_VALUE=worktree\n", { mode: 0o600 });
  const result = run();
  if (process.platform === "darwin") {
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Missing mirrored environment file/);
    await assert.rejects(lstat(path.join(main, ".env.new-service")), { code: "ENOENT" });
    assert.equal((await lstat(local)).isSymbolicLink(), false);
    await assert.rejects(lstat(path.join(checkout, ".env.local")), { code: "ENOENT" });
  } else {
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await realpath(local), path.join(main, ".env.new-service"));
  }
  assert.equal(await readFile(local, "utf8"), "FIXTURE_VALUE=worktree\n");
});

test("non-private env files fail without leaking values or changing other files", async (t) => {
  const { main, checkout, run } = await fixture(t);
  const source = path.join(main, ".env.search");
  await chmod(source, 0o644);
  const result = run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Expected an owner-only file/);
  assert.doesNotMatch(result.stdout + result.stderr, /FIXTURE_VALUE/);
  assert.equal((await lstat(source)).mode & 0o777, 0o644);
  await assert.rejects(lstat(path.join(checkout, ".env.local")), { code: "ENOENT" });
});

test("create never overwrites existing values and Macs cannot create or relocate mirrored files", async (t) => {
  const { directory, main, checkout, sync } = await fixture(t);
  if (process.platform === "darwin") {
    const create = sync(["create", ".env.new-service"]);
    assert.equal(create.status, 1);
    assert.match(create.stderr, /never on a Mac/);
    await assert.rejects(lstat(path.join(main, ".env.new-service")), { code: "ENOENT" });
    const relocate = sync(["sync", "--store", path.join(directory, "other-store")]);
    assert.equal(relocate.status, 1);
    assert.match(relocate.stderr, /must stay in the mirrored main checkout/);
    await assert.rejects(lstat(path.join(checkout, ".env.local")), { code: "ENOENT" });
  } else {
    const create = sync(["create", ".env.new-service"]);
    assert.equal(create.status, 0, create.stderr);
    assert.equal(await realpath(path.join(checkout, ".env.new-service")), path.join(main, ".env.new-service"));
    const existing = sync(["create", ".env.local"]);
    assert.equal(existing.status, 1);
    assert.match(existing.stderr, /EEXIST/);
  }
  assert.equal(await readFile(path.join(main, ".env.local"), "utf8"), "FIXTURE_VALUE=shared\n");
  assert.equal((await lstat(path.join(main, ".env.local"))).isSymbolicLink(), false);
});

test("a live lock is preserved and a dead-process lock is recovered automatically", async (t) => {
  const { directory, checkout, sync } = await fixture(t);
  const lock = path.join(directory, ".config/stack127/shared-env-sync-lock");
  await mkdir(lock, { recursive: true, mode: 0o700 });
  await writeFile(path.join(lock, "pid"), String(process.pid), { mode: 0o600 });
  const live = sync();
  assert.equal(live.status, 1);
  assert.match(live.stderr, /Another environment sync is running/);
  assert.equal(await readFile(path.join(lock, "pid"), "utf8"), String(process.pid));
  await assert.rejects(lstat(path.join(checkout, ".env.local")), { code: "ENOENT" });

  const dead = spawnSync(process.execPath, ["-e", ""]);
  assert.equal(dead.status, 0);
  await writeFile(path.join(lock, "pid"), String(dead.pid), { mode: 0o600 });
  const recovered = sync();
  assert.equal(recovered.status, 0, recovered.stderr);
  assert.equal(await readFile(path.join(checkout, ".env.local"), "utf8"), "FIXTURE_VALUE=shared\n");
  await assert.rejects(lstat(lock), { code: "ENOENT" });
  await assert.rejects(lstat(`${lock}.takeover`), { code: "ENOENT" });
});

test("a lock without a pid is protected for 30 seconds and then recovered", async (t) => {
  const { directory, checkout, sync } = await fixture(t);
  const lock = path.join(directory, ".config/stack127/shared-env-sync-lock");
  await mkdir(lock, { recursive: true, mode: 0o700 });
  const fresh = sync();
  assert.equal(fresh.status, 1);
  assert.match(fresh.stderr, /Another environment sync is running/);
  await assert.rejects(lstat(path.join(checkout, ".env.local")), { code: "ENOENT" });

  const stale = new Date(Date.now() - 31_000);
  await utimes(lock, stale, stale);
  const recovered = sync();
  assert.equal(recovered.status, 0, recovered.stderr);
  assert.equal(await readFile(path.join(checkout, ".env.local"), "utf8"), "FIXTURE_VALUE=shared\n");
});

test("an abandoned takeover guard fails closed without removing the main lock", async (t) => {
  const { directory, checkout, sync } = await fixture(t);
  const lock = path.join(directory, ".config/stack127/shared-env-sync-lock");
  await mkdir(lock, { recursive: true, mode: 0o700 });
  await writeFile(path.join(lock, "pid"), "2147483647", { mode: 0o600 });
  await mkdir(`${lock}.takeover`, { mode: 0o700 });
  const result = sync();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /stale takeover guard/);
  assert.equal(await readFile(path.join(lock, "pid"), "utf8"), "2147483647");
  await lstat(`${lock}.takeover`);
  await assert.rejects(lstat(path.join(checkout, ".env.local")), { code: "ENOENT" });
});

test("concurrent stale-lock recovery keeps environment files readable and converges on main links", async (t) => {
  const { directory, main, checkout, env, sync } = await fixture(t);
  const lock = path.join(directory, ".config/stack127/shared-env-sync-lock");
  await mkdir(lock, { recursive: true, mode: 0o700 });
  const dead = spawnSync(process.execPath, ["-e", ""]);
  assert.equal(dead.status, 0);
  await writeFile(path.join(lock, "pid"), String(dead.pid), { mode: 0o600 });
  for (const name of names) await writeFile(path.join(checkout, name), "FIXTURE_VALUE=shared\n", { mode: 0o600 });
  const results = await Promise.all(Array.from({ length: 4 }, () => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [syncRunner], { cwd: checkout, env });
    let stderr = "";
    child.stdout.resume();
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (status) => resolve({ status, stderr }));
  })));
  assert.ok(results.some((result) => result.status === 0));
  for (const result of results) {
    if (result.status !== 0) assert.match(result.stderr, /Another environment sync is running/);
  }
  const retry = sync();
  assert.equal(retry.status, 0, retry.stderr);
  for (const name of names) {
    assert.equal(await realpath(path.join(checkout, name)), path.join(main, name));
    assert.equal(await readFile(path.join(checkout, name), "utf8"), "FIXTURE_VALUE=shared\n");
  }
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
