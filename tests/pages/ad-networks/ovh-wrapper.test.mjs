import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 's127-ovh-wrapper-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const repo = join(directory, 'repo'), data = join(directory, 'data'), bin = join(directory, 'bin');
  await mkdir(repo); await mkdir(join(data, 'logs'), { recursive: true }); await mkdir(bin);
  await writeFile(join(data, 'ad-networks.env'), `AD_NETWORK_DB_PATH=${join(data, 'unused.sqlite')}\nAD_NETWORKS_STATE_DIRECTORY=${data}\n`);
  const wrapper = join(directory, 'run-job.sh'), calls = join(directory, 'calls');
  const source = await readFile(new URL('../../../scripts/ad-networks/ovh/run-job.sh', import.meta.url), 'utf8');
  // Redirect host paths into this fixture and replace the collector launcher.
  // No database, production env file, or real collector is opened.
  await writeFile(wrapper, source.replaceAll('/srv/stack127-data', data).replaceAll('/srv/stack127', repo)
    .replaceAll('/tmp/adn-', join(directory, 'adn-')));
  await writeFile(join(bin, 'nice'), '#!/bin/sh\nprintf "run\\n" >> "$WRAPPER_CALLS"\nif [ "${WRAPPER_HOLD:-0}" = 1 ]; then while :; do sleep 1; done; fi\n', { mode: 0o755 });
  const launch = (job, hold = false) => {
    const child = spawn('/bin/sh', [wrapper, job], { detached: true,
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, WRAPPER_CALLS: calls, WRAPPER_HOLD: hold ? '1' : '0' },
      stdio: 'ignore' });
    t.after(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch { /* Already exited. */ } });
    return { child, completed: once(child, 'close') };
  };
  return { directory, calls, launch };
}

test('verification ignores empty, invalid and dead PID markers but yields to a live wrapper', async t => {
  const { directory, calls, launch } = await fixture(t);
  const exited = spawn('/bin/sh', ['-c', 'exit 0']);
  await once(exited, 'close');
  for (const [name, value] of [['old', ''], ['invalid', 'invalid\n'], ['zero', '0000\n'], ['dead', `${exited.pid}\n`]]) {
    await writeFile(join(directory, `adn-pending-${name}`), value);
  }
  assert.deepEqual(await launch('verification').completed, [0, null]);
  assert.equal(await readFile(calls, 'utf8'), 'run\n');
  await writeFile(join(directory, 'adn-pending-live'), `${process.pid}\n`);
  assert.deepEqual(await launch('verification').completed, [0, null]);
  assert.equal(await readFile(calls, 'utf8'), 'run\n');
});

for (const signal of ['SIGKILL', 'SIGTERM']) test(`verification recovers after a scheduled wrapper receives ${signal}`, async t => {
  const { directory, calls, launch } = await fixture(t);
  const scheduled = launch('traffic', true);
  for (let attempt = 0; ; attempt++) {
    try { if ((await readFile(calls, 'utf8')) === 'run\n') break; } catch (error) { if (error.code !== 'ENOENT') throw error; }
    assert.ok(attempt < 300, 'scheduled wrapper did not start');
    await delay(10);
  }
  const marker = join(directory, `adn-pending-traffic-${scheduled.child.pid}`);
  assert.equal(await readFile(marker, 'utf8'), `${scheduled.child.pid}\n`);
  assert.deepEqual(await launch('verification').completed, [0, null]);
  assert.equal(await readFile(calls, 'utf8'), 'run\n');
  process.kill(-scheduled.child.pid, signal);
  await scheduled.completed;
  assert.equal((await readdir(directory)).some(name => name.startsWith('adn-pending-')), signal === 'SIGKILL');
  assert.deepEqual(await launch('verification').completed, [0, null]);
  assert.equal(await readFile(calls, 'utf8'), 'run\nrun\n');
});
