import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { refreshArgs, refreshCommand, refresh, refreshJobs, lastJobResult, jobCounts } from '../../../scripts/ad-networks/refresh.mjs';
import { targetDatabaseUrl, withJobLock, sessionDatabaseUrl } from '../../../scripts/ad-networks/runtime-db.mjs';
import { revalidateAdNetworks } from '../../../scripts/ad-networks/revalidate.mjs';
import { jobAlert } from '../../../scripts/ad-networks/alerts.mjs';

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

for (const scenario of ['success', 'collector-failure', 'sync-failure', 'revalidation-failure']) test(`collector publishes checkpoints, revalidates, and reports ${scenario}`, async () => {
  const state = await mkdtemp(join(tmpdir(), 's127-refresh-'));
  const options = refreshArgs(['--job', 'platform', '--state-directory', state, '--apply']);
  const calls = [];
  const dependencies = { lock: () => assert.fail('collector must not hold a database lock'),
    snapshot: () => assert.fail('sync pins its own read-only SQLite view'),
    run: async (script, args, env) => {
      calls.push(script);
      assert.equal(env.AD_NETWORK_FETCH_THROTTLE_DB, join(state, 'fetch-throttle.sqlite'));
      if (script === 'platform' && scenario === 'collector-failure' || script === 'sync' && scenario === 'sync-failure'
        || script === 'revalidate' && scenario === 'revalidation-failure') throw Error(scenario);
    },
    alert: async (_options, failed) => calls.push(failed ? 'alert-failed' : 'alert-recovered'),
  };
  try {
    if (scenario === 'success') assert.equal((await refresh(options, dependencies)).synced, true);
    else await assert.rejects(refresh(options, dependencies));
    assert.equal(calls.includes('revalidate'), scenario !== 'sync-failure');
    assert.equal(calls.at(-1), scenario === 'success' ? 'alert-recovered' : 'alert-failed');
    if (scenario === 'collector-failure') assert.deepEqual(calls.slice(0, 2), ['platform', 'sync']);
  } finally { await rm(state, { recursive: true, force: true }); }
});

test('sync lock contention releases the database connection and releases the database connection', async () => {
  const calls = [];
  const pool = { connect: async () => ({ query: async () => ({ rows: [{ locked: false }] }), release: () => calls.push('released') }), end: async () => calls.push('ended') };
  const result = await withJobLock({}, () => assert.fail('overlapping heavy job'), { pool });
  assert.equal(result.skipped, true); assert.deepEqual(calls, ['released', 'ended']);
});

test('sync failures release the shared lock', async () => {
  const calls = [];
  const pool = { connect: async () => ({ query: async sql => { calls.push(sql); return { rows: [{ locked: true }] }; }, release() {} }), end: async () => {} };
  await assert.rejects(withJobLock({}, async () => { throw Error('collector'); }, { pool }), /collector/);
  assert.equal(calls.length, 2); assert.match(calls[1], /unlock/);
});

test('cache failures leave durable events for the existing worker', async () => {
  let query;
  const calls = [];
  const client = { query: async sql => { query = sql; calls.push('credential'); return { rows: [{ signing_key: 'test-only' }] }; },
    release: () => calls.push('released') };
  const pool = { connect: async () => client, end: async () => calls.push('ended') };
  const refreshCopyCounts = async (connection, options) => {
    assert.equal(connection, client); assert.equal(options.apply, true); calls.push('counts');
  };
  const options = { environment: 'development', apply: true };
  const result = await revalidateAdNetworks(options, { pool, refreshCopyCounts, fetch: async (_url, request) => {
    calls.push('http');
    const body = JSON.parse(request.body); assert.ok(body.tags.includes('stack127-ad-networks'));
    return { ok: true, json: async () => ({ ok: true }) };
  } });
  assert.equal(result.durable_cache_queue, true); assert.match(query, /^select signing_key/);
  assert.deepEqual(calls, ['counts', 'credential', 'http', 'released', 'ended']);
  await assert.rejects(revalidateAdNetworks(options, { pool, refreshCopyCounts, fetch: async () => ({ ok: false, status: 503 }) }), /503/);
  assert.deepEqual(calls.slice(-2), ['released', 'ended']);
  await assert.rejects(revalidateAdNetworks({ environment: 'development', site: 'https://stack127.com' }), /Invalid revalidation/);
});

test('copy refresh failures prevent HTTP revalidation and always release the session', async () => {
  const calls = [];
  const client = { release: () => calls.push('released') };
  const pool = { connect: async () => client, end: async () => calls.push('ended') };
  await assert.rejects(revalidateAdNetworks({ environment: 'development', apply: true }, {
    pool, refreshCopyCounts: async () => { throw Error('copy mismatch'); }, fetch: () => assert.fail('HTTP after failure'),
  }), /copy mismatch/);
  assert.deepEqual(calls, ['released', 'ended']);
  await revalidateAdNetworks({ environment: 'development' }, { pool: { connect: () => assert.fail('preview opens database') } });
});

test('publisher-name refresh checks existing names again', () => {
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

test('a lost database lock aborts the sync', async () => {
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

test('Supabase shared transaction credentials select the same-host session pooler for advisory locks', () => {
  const transaction = 'postgresql://postgres.test:p%24ass@aws-0-example.pooler.supabase.com:6543/postgres?sslmode=require';
  const session = new URL(sessionDatabaseUrl(transaction));
  assert.equal(session.port, '5432'); assert.equal(session.hostname, new URL(transaction).hostname);
  assert.equal(session.username, new URL(transaction).username); assert.equal(session.password, new URL(transaction).password);
  assert.equal(session.search, '?sslmode=require');
  assert.equal(targetDatabaseUrl({ environment: 'production', apply: true, confirm: 'stack127-production' },
    { AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', DATABASE_POOLER_URL: transaction }), session.toString());
  assert.throws(() => sessionDatabaseUrl('postgresql://user:password@unknown.example:6543/postgres'), /session pooling/);
});

test('collector output extracts final JSON counts and drops arbitrary raw strings', () => {
  assert.deepEqual(lastJobResult('progress\n{\n "processed": 4, "outcomes": {"ok": 3}\n}\n'), { processed: 4, outcomes: { ok: 3 } });
  assert.equal(lastJobResult('{"processed":1,"outcomes":{"platform_found":1}}\n{"review_per_network":{}}').processed, 1);
  assert.deepEqual(jobCounts({ processed: 4, database: 'private', status: 'complete', outcomes: { ok: 3, detail: 'raw' } }), { processed: 4, status: 'complete', outcomes: { ok: 3 } });
});

test('self-hosted production URLs preserve the endpoint and credentials for session advisory locks', () => {
  for (const protocol of ['postgres', 'postgresql']) {
    for (const host of ['ovh-stack127', 'ovh-stack127.example.ts.net', '100.86.117.125', 'stack127-db', '127.0.0.1']) {
      const url = `${protocol}://stack127_app:p%24ass@${host}:5432/postgres?application_name=ad-networks`;
      assert.equal(sessionDatabaseUrl(url), url);
      assert.equal(targetDatabaseUrl({ environment: 'production', apply: true, confirm: 'stack127-production' },
        { AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', DATABASE_POOLER_URL: url }), url);
      assert.equal(targetDatabaseUrl({ environment: 'production' },
        { AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', DATABASE_URL: url }), url);
    }
  }
  assert.equal(sessionDatabaseUrl('postgres://stack127_app:password@stack127-db/postgres'),
    'postgres://stack127_app:password@stack127-db/postgres');
  assert.throws(() => sessionDatabaseUrl('https://ovh-stack127:5432/postgres'), /Postgres database URL required/);
});

for (const job of ['platform', 'snapshot', 'sync']) test(`${job} opens no parent lock, and refreshes only after the sync finishes`, async t => {
  const state = await mkdtemp(join(tmpdir(), 's127-refresh-order-'));
  t.after(() => rm(state, { recursive: true, force: true }));
  const calls = [];
  const options = refreshArgs(['--job', job, '--state-directory', state, '--apply']);
  await refresh(options, {
    lock: () => assert.fail('no connection around collector'),
    snapshot: () => assert.fail('no full-file copy for sync'),
    run: async script => { calls.push(script); return {}; }, alert: async () => {},
  });
  assert.deepEqual(calls, [...(job === 'platform' ? ['platform'] : []), 'sync', 'revalidate']);
});

test('sync contention preserves collected checkpoints and retries skip the collector', async t => {
  const state = await mkdtemp(join(tmpdir(), 's127-refresh-busy-'));
  t.after(() => rm(state, { recursive: true, force: true }));
  const calls = [];
  const options = refreshArgs(['--job', 'verification', '--state-directory', state, '--apply']);
  const deps = { run: async script => { calls.push(script); return script === 'sync' ? { skipped: true } : {}; },
    alert: () => assert.fail('contention is not an alert') };
  assert.equal((await refresh(options, deps)).skipped, true);
  assert.deepEqual(calls, ['verify', 'sync']);
  calls.length = 0;
  assert.equal((await refresh({ ...options, 'sync-only': true }, deps)).skipped, true);
  assert.deepEqual(calls, ['sync']);
});
