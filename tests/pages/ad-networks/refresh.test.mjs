import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { refreshArgs, refreshCommand, refresh } from '../../../scripts/ad-networks/refresh.mjs';

test('scheduled jobs default to development and reject unconfirmed production writes', async () => {
  const options = refreshArgs(['--job', 'sync']);
  assert.equal(options.environment, 'development');
  assert.equal(options.apply, false);
  assert.throws(() => refreshArgs(['--job', 'sync', '--environment', 'production', '--apply']), /confirm/);
  assert.throws(() => refreshArgs(['--job', 'unknown']), /Choose/);
  let writes = 0;
  const plan = await refresh(options, { run: () => writes++, snapshot: () => writes++ });
  assert.equal(plan.applied, false);
  assert.equal(writes, 0);
});

test('sync publishes only a consistent snapshot and cleans it after success or failure', async () => {
  const state = await mkdtemp(join(tmpdir(), 's127-refresh-'));
  const options = refreshArgs(['--job', 'sync', '--state-directory', state, '--apply']);
  const calls = [];
  const dependencies = {
    snapshot: async (source, target) => { assert.notEqual(source, target); calls.push('snapshot'); },
    run: async (script, args) => { assert.equal(script, 'sync'); assert.equal(args[3], 'development'); calls.push('sync'); },
    remove: async () => calls.push('cleanup'),
  };
  try {
    await refresh(options, dependencies);
    assert.deepEqual(calls, ['snapshot', 'sync', 'cleanup']);
    calls.length = 0;
    await assert.rejects(refresh(options, { ...dependencies, snapshot: async () => { throw Error('backup failed'); } }), /backup failed/);
    assert.deepEqual(calls, ['cleanup']);
    calls.length = 0;
    await assert.rejects(refresh(options, { ...dependencies, run: async () => { calls.push('sync'); throw Error('target unavailable'); } }), /target unavailable/);
    assert.deepEqual(calls, ['snapshot', 'sync', 'cleanup']);
  } finally { await rm(state, { recursive: true, force: true }); }
});

test('recurring names revisit changed sources and concurrent jobs share request limits', async () => {
  const state = await mkdtemp(join(tmpdir(), 's127-refresh-'));
  const options = refreshArgs(['--job', 'publisher-names', '--state-directory', state, '--apply']);
  assert.ok(refreshCommand(options).args.includes('--refresh'));
  try {
    await refresh(options, { run: async (script, args, env) => {
      assert.equal(script, 'publisher-names');
      assert.equal(env.AD_NETWORK_FETCH_THROTTLE_DB, join(state, 'fetch-throttle.sqlite'));
    }});
    const production = refreshArgs(['--job', 'sync', '--environment', 'production', '--confirm', 'stack127-production', '--apply']);
    assert.ok(refreshCommand(production).args.includes('stack127-production'));
  } finally { await rm(state, { recursive: true, force: true }); }
});
