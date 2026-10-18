import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { refreshArgs, refreshCommand, refresh, refreshJobs } from '../../../scripts/ad-networks/refresh.mjs';
import { targetDatabaseUrl, withJobLock } from '../../../scripts/ad-networks/runtime-db.mjs';
import { revalidateAdNetworks } from '../../../scripts/ad-networks/revalidate.mjs';
import { latestSlot, nextJob, schedulerTick, scheduledJobs } from '../../../scripts/ad-networks/scheduler.mjs';
import { jobAlert } from '../../../scripts/ad-networks/alerts.mjs';

const unlocked = (_options, work) => work();
test('every automatic job plans without opening storage and rejects unconfirmed production writes', async () => {
  for (const job of refreshJobs) {
    const args = ['--job', job, ...(job === 'rdap-import' ? ['--source-sqlite', '/tmp/later.sqlite'] : [])];
    const options = refreshArgs(args);
    assert.equal(options.environment, 'development');
    assert.throws(() => refreshArgs([...args, '--environment', 'production', '--apply']), /confirm/);
    const plan = await refresh(options, { run: () => assert.fail('execute'), snapshot: () => assert.fail('snapshot'), lock: () => assert.fail('lock') });
    assert.equal(plan.applied, false);
    assert.equal(plan.final_steps.at(-1).script, 'revalidate');
  }
  assert.throws(() => refreshArgs(['--job', 'platform', '--concurrency', '100']), /concurrency/);
  assert.throws(() => targetDatabaseUrl({ environment: 'development' }, { AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', DATABASE_URL: 'production' }), /mismatch/);
  assert.throws(() => targetDatabaseUrl({ environment: 'production', apply: true }, { AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', DATABASE_URL: 'production' }), /confirm/);
});

for (const scenario of ['success', 'collector-failure', 'sync-failure', 'snapshot-failure', 'revalidation-failure']) test(`collector publishes checkpoints, revalidates, and reports ${scenario}`, async () => {
  const state = await mkdtemp(join(tmpdir(), 's127-refresh-'));
  const options = refreshArgs(['--job', 'platform', '--state-directory', state, '--apply']);
  const calls = [];
  const dependencies = { lock: unlocked,
    snapshot: async () => { calls.push('snapshot'); if (scenario === 'snapshot-failure') throw Error('snapshot failed'); },
    run: async (script, args, env) => {
      calls.push(script);
      assert.equal(env.AD_NETWORK_FETCH_THROTTLE_DB, join(state, 'fetch-throttle.sqlite'));
      if (script === 'platform' && scenario === 'collector-failure' || script === 'sync' && scenario === 'sync-failure'
        || script === 'revalidate' && scenario === 'revalidation-failure') throw Error(scenario);
    },
    remove: async () => calls.push('cleanup'), alert: async (_options, failed) => calls.push(failed ? 'alert-failed' : 'alert-recovered'),
  };
  try {
    if (scenario === 'success') assert.equal((await refresh(options, dependencies)).synced, true);
    else await assert.rejects(refresh(options, dependencies));
    assert.equal(calls.filter(x => x === 'cleanup').length, 3);
    assert.equal(calls.includes('revalidate'), !['sync-failure', 'snapshot-failure'].includes(scenario));
    assert.equal(calls.at(-1), scenario === 'success' ? 'alert-recovered' : 'alert-failed');
    if (scenario === 'collector-failure') assert.deepEqual(calls.slice(0, 3), ['platform', 'snapshot', 'sync']);
  } finally { await rm(state, { recursive: true, force: true }); }
});

test('lock contention starts no collector and releases the database connection', async () => {
  const calls = [];
  const pool = { connect: async () => ({ query: async () => ({ rows: [{ locked: false }] }), release: () => calls.push('released') }), end: async () => calls.push('ended') };
  const result = await withJobLock({}, () => assert.fail('overlapping heavy job'), { pool });
  assert.equal(result.skipped, true); assert.deepEqual(calls, ['released', 'ended']);
});

test('collector failures release the heavy lock', async () => {
  const calls = [];
  const pool = { connect: async () => ({ query: async sql => { calls.push(sql); return { rows: [{ locked: true }] }; }, release() {} }), end: async () => {} };
  await assert.rejects(withJobLock({}, async () => { throw Error('collector'); }, { pool }), /collector/);
  assert.equal(calls.length, 2); assert.match(calls[1], /unlock/);
});

test('cache failures leave durable events for the existing worker', async () => {
  let query;
  const pool = { query: async sql => { query = sql; return { rows: [{ signing_key: 'test-only' }] }; }, end: async () => {} };
  const options = { environment: 'development', apply: true };
  const result = await revalidateAdNetworks(options, { pool, fetch: async (_url, request) => {
    const body = JSON.parse(request.body); assert.ok(body.tags.includes('stack127-ad-networks'));
    return { ok: true, json: async () => ({ ok: true }) };
  } });
  assert.equal(result.durable_cache_queue, true); assert.match(query, /^select signing_key/);
  await assert.rejects(revalidateAdNetworks(options, { pool, fetch: async () => ({ ok: false, status: 503 }) }), /503/);
  await assert.rejects(revalidateAdNetworks({ environment: 'development', site: 'https://stack127.com' }), /Invalid revalidation/);
});

test('scheduler persists completion and retries a failed slot without running two jobs', async () => {
  const now = new Date('2026-11-05T06:00:00Z'), activatedAt = '2026-11-01T00:00:00.000Z';
  assert.equal(latestSlot({ day: 5, hour: 4, minute: 0 }, new Date('2026-11-01T00:00:00Z')), '2026-10-05T04:00:00.000Z');
  assert.equal(latestSlot({ weekday: 2, hour: 4, minute: 0 }, now), '2026-11-03T04:00:00.000Z');
  assert.equal(nextJob({}, now, activatedAt, []), null);
  const state = {}, calls = [];
  const options = { activatedAt, enabled: ['snapshot', 'platform'], environment: 'development', database: '/tmp/test.sqlite', stateDirectory: '/tmp/test-state', concurrency: '4' };
  const deps = { save: async s => calls.push(JSON.parse(JSON.stringify(s))), refresh: async o => ({ applied: true, job: o.job }) };
  assert.equal((await schedulerTick(options, state, now, deps)).job, 'snapshot');
  assert.equal((await schedulerTick(options, state, now, deps)).job, 'platform');
  assert.equal((await schedulerTick(options, state, now, deps)).idle, true);
  assert.equal(calls[0].snapshot.status, 'running'); assert.equal(calls[1].snapshot.status, 'complete');
  assert.equal(nextJob({}, now, activatedAt, ['verification']).job, 'verification');
  assert.equal(new Set(scheduledJobs).size, 9);
  assert.ok(refreshCommand(refreshArgs(['--job', 'publisher-names'])).args.includes('--refresh'));
});

test('failure issues are deduplicated and close after recovery without raw error text', async () => {
  const state = await mkdtemp(join(tmpdir(), 's127-alert-')), requests = [];
  const options = { environment: 'production', job: 'platform', 'state-directory': state };
  const deps = { env: { GITHUB_ALERT_TOKEN: 'test-only' }, fetch: async (url, request) => {
    requests.push({ url, ...request }); return { ok: true, json: async () => request.method === 'GET' ? [] : { number: 42 } };
  } };
  try {
    await jobAlert(options, true, deps); await jobAlert(options, true, deps); await jobAlert(options, false, deps);
    assert.equal(requests.filter(r => r.method === 'POST').length, 1);
    assert.equal(requests.at(-1).method, 'PATCH');
    assert.equal(JSON.parse(requests.at(-1).body).state, 'closed');
    assert.doesNotMatch(requests[1].body, /test-only/);
  } finally { await rm(state, { recursive: true, force: true }); }
});

test('a lost database lock aborts the collector instead of publishing without its lock', async () => {
  const { EventEmitter } = await import('node:events');
  const client = new EventEmitter();
  client.query = async () => ({ rows: [{ locked: true }] }); client.release = () => {};
  await assert.rejects(withJobLock({}, async signal => {
    client.emit('error', Error('network lost'));
    assert.equal(signal.aborted, true);
  }, { pool: { connect: async () => client, end: async () => {} } }), /lock connection lost/);
});

test('false apply flags remain read-only when resolving checkout credentials', async () => {
  const { writeFile } = await import('node:fs/promises');
  const directory = await mkdtemp(join(tmpdir(), 's127-runtime-env-'));
  await writeFile(join(directory, '.env.local'), 'DATABASE_URL=postgresql://localhost/development\n');
  const before = process.cwd();
  try { process.chdir(directory); assert.equal(targetDatabaseUrl({ environment: 'development', apply: false }, {}), 'postgresql://localhost/development'); }
  finally { process.chdir(before); await rm(directory, { recursive: true, force: true }); }
});
