import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), "cache-worker-ovh-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const repo = join(directory, "repo"), data = join(directory, "data"), bin = join(directory, "bin");
  await Promise.all([mkdir(repo), mkdir(data), mkdir(bin)]);
  const envFile = join(data, "cache-worker.env"), calls = join(directory, "calls");
  const unwanted = join(directory, "unwanted");
  await writeFile(envFile, `DATABASE_URL=unused\nGITHUB_FRONTEND_TOKEN=$(touch ${unwanted})\n`, { mode: 0o600 });
  const source = await readFile(new URL("../../scripts/stack127/cache/ovh/run-worker.sh", import.meta.url), "utf8");
  const wrapper = join(directory, "run-worker.sh");
  await writeFile(wrapper, source.replaceAll("/srv/stack127-data", data).replaceAll("/srv/stack127", repo)
    .replace("PATH=/usr/local/bin:/usr/bin:/bin", `PATH=${bin}:/usr/local/bin:/usr/bin:/bin`));
  // Exercise the wrapper on macOS using equivalent POSIX flock/stat shims.
  // No production env, Node worker or database is opened.
  await writeFile(join(bin, "stat"), `#!/usr/bin/python3
import os, stat, sys
value=os.stat(sys.argv[3])
print(format(stat.S_IMODE(value.st_mode), 'o') if sys.argv[2]=='%a' else value.st_uid)
`, { mode: 0o755 });
  await writeFile(join(bin, "flock"), `#!/usr/bin/python3
import fcntl, os, subprocess, sys
fd=os.open(sys.argv[4], os.O_CREAT|os.O_RDWR, 0o600)
try:
  fcntl.flock(fd, fcntl.LOCK_EX|fcntl.LOCK_NB)
except BlockingIOError:
  sys.exit(0)
sys.exit(subprocess.call(sys.argv[5:]))
`, { mode: 0o755 });
  await writeFile(join(bin, "node"), `#!/bin/sh
printf '%s\\n' "$*" >> "$WRAPPER_CALLS"
if [ "\${WRAPPER_HOLD:-0}" = 1 ]; then while :; do sleep 1; done; fi
exit "\${WRAPPER_EXIT:-0}"
`, { mode: 0o755 });
  const launch = (env = {}) => {
    const child = spawn("/bin/sh", [wrapper], { detached: true, stdio: "ignore",
      env: { ...process.env, WRAPPER_CALLS: calls, ...env } });
    t.after(() => { try { process.kill(-child.pid, "SIGKILL"); } catch { /* Already exited. */ } });
    return { child, completed: once(child, "close") };
  };
  return { calls, envFile, unwanted, launch };
}

test("the OVH wrapper rejects a readable-by-others env file before Node starts", async t => {
  const f = await fixture(t);
  await chmod(f.envFile, 0o644);
  assert.deepEqual(await f.launch().completed, [1, null]);
  await assert.rejects(readFile(f.calls), { code: "ENOENT" });
});

test("the OVH wrapper passes dotenv to Node without evaluating it and propagates failures", async t => {
  const f = await fixture(t);
  assert.deepEqual(await f.launch({ WRAPPER_EXIT: "7" }).completed, [7, null]);
  const args = await readFile(f.calls, "utf8");
  assert.ok(args.includes(`--env-file=${f.envFile}`));
  assert.ok(args.includes("scripts/stack127/cache/worker.mjs"));
  await assert.rejects(readFile(f.unwanted), { code: "ENOENT" });
});

test("the OVH wrapper yields to an existing host lock and recovers after process death", async t => {
  const f = await fixture(t);
  const running = f.launch({ WRAPPER_HOLD: "1" });
  for (let attempt = 0; ; attempt++) {
    try { if ((await readFile(f.calls, "utf8")).length) break; } catch (error) { if (error.code !== "ENOENT") throw error; }
    assert.ok(attempt < 300, "wrapper did not start");
    await delay(10);
  }
  const initial = await readFile(f.calls, "utf8");
  assert.deepEqual(await f.launch().completed, [0, null]);
  assert.equal(await readFile(f.calls, "utf8"), initial);
  process.kill(-running.child.pid, "SIGKILL");
  await running.completed;
  assert.deepEqual(await f.launch().completed, [0, null]);
  assert.equal((await readFile(f.calls, "utf8")).trim().split("\n").length, 2);
});
