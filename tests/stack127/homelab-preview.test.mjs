import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const runner = fileURLToPath(new URL("../../scripts/stack127/homelab-preview.mjs", import.meta.url));
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const serverSource = `
const http = require('node:http');
http.createServer((req, res) => res.end(process.cwd() + ':' + process.env.STACK127_PREVIEW_TEST_VALUE))
  .listen(Number(process.env.PORT), '0.0.0.0');
`;
// Model the Next.js dev CLI launching a server child. The child deliberately
// ignores SIGTERM so Stop preview must also clear surviving descendants.
const devSource = `require('node:child_process').spawn(process.execPath, ['-e', ${JSON.stringify(serverSource + "process.on('SIGTERM', () => {});")}], {stdio: 'inherit'});`;

async function fixture(t, { ownEnv = true, ownDependencies = true } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "stack127-preview-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "bin"));
  await mkdir(path.join(root, "public"));
  await mkdir(path.join(root, "node_modules/next/dist/bin"), { recursive: true });
  if (ownDependencies) await writeFile(path.join(root, "node_modules/next/dist/bin/next"), devSource);
  await writeFile(path.join(root, "package.json"), JSON.stringify({ name: "stack127" }));
  await writeFile(path.join(root, "public/example.txt"), "public asset");
  if (ownEnv) await writeFile(path.join(root, ".env.local"), "STACK127_PREVIEW_TEST_VALUE=development-env\n");
  await writeFile(path.join(root, "bin/tailscale"), "#!/bin/sh\nprintf '100.86.117.125\\n'\n", { mode: 0o755 });
  await writeFile(path.join(root, "bin/npm"), `#!${process.execPath}
const fs = require('node:fs');
fs.appendFileSync('npm-calls.txt', process.argv.slice(2).join(' ') + '\\n');
if (process.env.STACK127_PREVIEW_TEST_FAIL) process.exit(7);
if (process.argv[2] === 'ci') {
  fs.mkdirSync('node_modules/next/dist/bin', {recursive:true});
  fs.writeFileSync('node_modules/next/dist/bin/next', ${JSON.stringify(devSource)});
}
if (process.argv[3] === 'build') {
  fs.mkdirSync('.next/standalone', {recursive:true});
  fs.mkdirSync('.next/static', {recursive:true});
  fs.writeFileSync('.next/static/example.txt', 'static asset');
  fs.writeFileSync('.next/standalone/server.js', ${JSON.stringify(serverSource)});
}
`, { mode: 0o755 });
  const env = { ...process.env, PATH: `${root}/bin:${process.env.PATH}`, T3CODE_PROJECT_ROOT: root };
  delete env.STACK127_PREVIEW_TEST_VALUE;
  function run(mode, extraEnv = {}) {
    const child = spawn(process.execPath, [runner, mode], { cwd: root, env: { ...env, ...extraEnv }, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    const exit = once(child, "exit").then(([code]) => code);
    t.after(async () => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill("SIGTERM");
        await exit;
      }
    });
    return { child, exit, output: () => output };
  }
  return { root, run };
}

async function ready(action) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    const match = action.output().match(/Site ready: http:\/\/100\.86\.117\.125:(\d+)\//);
    if (match) return Number(match[1]);
    if (action.child.exitCode !== null) assert.fail(action.output());
    await delay(30);
  }
  assert.fail(`Preview did not become ready: ${action.output()}`);
}

test("preview actions use the current checkout, rebuild cleanly, and stop their process", async (t) => {
  const { root, run } = await fixture(t);
  const dev = run("dev");
  const devPort = await ready(dev);
  assert.equal(await (await fetch(`http://127.0.0.1:${devPort}/`)).text(), `${root}:development-env`);
  await mkdir(path.join(root, ".next"), { recursive: true });
  await writeFile(path.join(root, ".next/stale.txt"), "stale output");
  const rebuilt = run("rebuild");
  const rebuiltPort = await ready(rebuilt);
  assert.equal(await dev.exit, 0);
  await assert.rejects(access(path.join(root, ".next/stale.txt")), { code: "ENOENT" });
  assert.equal(await readFile(path.join(root, ".next/standalone/public/example.txt"), "utf8"), "public asset");
  assert.equal(await readFile(path.join(root, ".next/standalone/.next/static/example.txt"), "utf8"), "static asset");
  assert.equal(await (await fetch(`http://127.0.0.1:${rebuiltPort}/`)).text(), `${root}:development-env`);
  await writeFile(path.join(root, ".next/keep.txt"), "keep cached output");
  const built = run("build");
  await ready(built);
  assert.equal(await rebuilt.exit, 0);
  assert.equal(await readFile(path.join(root, ".next/keep.txt"), "utf8"), "keep cached output");
  assert.equal(await run("stop").exit, 0);
  assert.equal(await built.exit, 0);
  await assert.rejects(access(path.join(root, "tmp/homelab-preview.json")), { code: "ENOENT" });
  const idleStop = run("stop");
  assert.equal(await idleStop.exit, 0);
  assert.match(idleStop.output(), /No preview is running/);
});

test("worktree previews skip occupied ports and stopping one leaves other servers running", async (t) => {
  const main = await fixture(t);
  const worktree = await fixture(t, { ownEnv: false, ownDependencies: false });
  const unrelated = http.createServer((req, res) => res.end("unrelated preview"));
  try { await new Promise((resolve, reject) => unrelated.once("error", reject).listen(3333, "0.0.0.0", resolve)); }
  catch (error) { if (error.code !== "EADDRINUSE") throw error; }
  t.after(() => new Promise((resolve) => unrelated.close(resolve)));
  const first = main.run("dev");
  const firstPort = await ready(first);
  assert.notEqual(firstPort, 3333);
  const second = worktree.run("dev", { T3CODE_PROJECT_ROOT: main.root });
  const secondPort = await ready(second);
  assert.notEqual(firstPort, secondPort);
  assert.equal(await readFile(path.join(worktree.root, "npm-calls.txt"), "utf8"), "ci\nrun predev\n");
  assert.equal(await (await fetch(`http://127.0.0.1:${secondPort}/`)).text(), `${worktree.root}:development-env`);
  assert.equal(await main.run("stop").exit, 0);
  assert.equal(await first.exit, 0);
  await assert.rejects(fetch(`http://127.0.0.1:${firstPort}/`));
  assert.equal((await fetch(`http://127.0.0.1:${secondPort}/`)).status, 200);
  if (unrelated.listening) assert.equal(await (await fetch("http://127.0.0.1:3333/")).text(), "unrelated preview");
  assert.equal(await worktree.run("stop").exit, 0);
  assert.equal(await second.exit, 0);
});

test("failed builds and quality checks return failure and allow a later preview", async (t) => {
  const { root, run } = await fixture(t);
  const failed = run("build", { STACK127_PREVIEW_TEST_FAIL: "1" });
  assert.equal(await failed.exit, 1);
  assert.match(failed.output(), /exited with code 7/);
  await assert.rejects(access(path.join(root, "tmp/homelab-preview.json")), { code: "ENOENT" });
  const failedQuality = run("quality", { STACK127_PREVIEW_TEST_FAIL: "1" });
  assert.equal(await failedQuality.exit, 1);
  assert.equal(await run("quality").exit, 0);
  const preview = run("dev");
  await ready(preview);
  assert.equal(await run("stop").exit, 0);
  assert.equal(await preview.exit, 0);
});

test("a stale process record never stops a reused PID", async (t) => {
  const { root, run } = await fixture(t);
  const unrelated = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { cwd: root });
  const exited = once(unrelated, "exit");
  t.after(async () => { unrelated.kill("SIGTERM"); await exited; });
  await mkdir(path.join(root, "tmp"));
  await writeFile(path.join(root, "tmp/homelab-preview.json"), JSON.stringify({ root, pid: unrelated.pid, started: "stale", mode: "dev" }));
  assert.equal(await run("stop").exit, 0);
  assert.equal(unrelated.exitCode, null);
  process.kill(unrelated.pid, 0);
});
