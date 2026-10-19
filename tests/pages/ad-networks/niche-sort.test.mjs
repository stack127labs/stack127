import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateNicheBatch, nicheSortArgs, importNiches, runNicheJob } from '../../../scripts/ad-networks/niche-sort.mjs';
import { adNetworkNicheShares, hasAdNetworkNicheCoverage } from '../../../lib/ad-networks-report.ts';

const input = [{ domain: 'example.com' }, { domain: 'example.org' }];
const result = (domain, niche = 'food', confidence = 'high') => ({ domain, niche, confidence });
const lines = rows => rows.map(row => JSON.stringify(row)).join('\n');
test('model validation requires the exact input set once each, known labels, and confidence', () => {
  const correct = [result('example.com'), result('example.org', null, 'low')];
  assert.deepEqual(validateNicheBatch(input, lines(correct)), correct);
  for (const bad of [[correct[0]], [correct[0], correct[0]], [...correct, result('extra.com')],
    [result('example.com', 'invented'), correct[1]], [result('example.com', 'food', 1.5), correct[1]],
    [{ ...correct[0], comment: 'extra' }, correct[1]], [result('https://example.com'), correct[1]]]) {
    assert.throws(() => validateNicheBatch(input, lines(bad)));
  }
  assert.throws(() => validateNicheBatch(input, '```json\n{}\n```'));
  assert.throws(() => nicheSortArgs(['--environment', 'production', '--apply']), /confirmation/);
});
test('niche imports withhold uncertain guesses, serialize against sync, and rollback on failure', async () => {
  const calls = [];
  const client = { query: async (sql, args) => { calls.push({ sql, args }); return { rowCount: 1, rows: [{ locked: true }] }; } };
  assert.equal(await importNiches(client, [result('example.com'), result('example.org', 'gaming', 'low')]), 1);
  assert.deepEqual(JSON.parse(calls[2].args[0]), [{ domain: 'example.com', niche: 'food' }, { domain: 'example.org', niche: null }]);
  assert.match(calls[0].sql, /ad-networks-reviewed-sync/);
  assert.match(calls[2].sql, /p.niche is null/);
  calls.length = 0;
  await assert.rejects(importNiches({ query: async sql => { calls.push(sql); if (sql.startsWith('update')) throw Error('database failed'); return { rows: [{ locked: true }] }; } }, []));
  assert.ok(calls.includes('rollback')); assert.match(calls.at(-1), /unlock/);
});
test('small network niche shares use sorted sites while broad comparison gates stay unchanged', () => {
  const shares = adNetworkNicheShares([{ key: 'food', label: 'Food', count: 2 }, { key: 'tech', label: 'Tech', count: 1 }]);
  assert.equal(shares[0].share, 2 / 3 * 100); assert.equal(shares[1].share, 1 / 3 * 100);
  assert.equal(hasAdNetworkNicheCoverage(1000, 3), false);
  assert.equal(adNetworkNicheShares([{ key: 'food', label: 'Food', count: 1 }])[0].share, 100);
  assert.deepEqual(adNetworkNicheShares([]), []);
});

test('niche import waits through a twelve-minute sync without starting a transaction early', async () => {
  let elapsed = 0, attempts = 0;
  const calls = [], waits = [];
  const client = { query: async sql => {
    calls.push(sql);
    if (sql.includes('pg_try_advisory_lock')) {
      attempts++;
      return { rows: [{ locked: elapsed >= 12 * 60000 }] };
    }
    assert.ok(elapsed >= 12 * 60000);
    return { rowCount: 1 };
  } };
  const imported = await importNiches(client, [result('example.com')], {
    now: () => elapsed, delay: async ms => { waits.push(ms); elapsed += ms; },
  });
  assert.equal(imported, 1);
  assert.equal(attempts, 145);
  assert.ok(waits.every(ms => ms === 5000));
  assert.equal(calls.filter(sql => sql === 'begin').length, 1);
  assert.match(calls.at(-1), /pg_advisory_unlock/);
});

test('niche import stops after an hour of contention without importing or unlocking', async () => {
  let elapsed = 0;
  const calls = [];
  await assert.rejects(importNiches({ query: async sql => {
    calls.push(sql);
    return { rows: [{ locked: false }] };
  } }, [], { now: () => elapsed, delay: async ms => { elapsed += ms; } }), /Timed out waiting 60 minutes/);
  assert.equal(elapsed, 60 * 60000);
  assert.ok(calls.every(sql => sql.includes('pg_try_advisory_lock')));
});

test('a lock query failure fails immediately instead of retrying a broken connection', async () => {
  await assert.rejects(importNiches({ query: async () => { throw Error('connection lost'); } }, [], {
    delay: () => assert.fail('must not retry query errors'),
  }), /connection lost/);
});

test('niche job keeps local completion and partial failure status and sends recovery alerts', async t => {
  const directory = await mkdtemp(join(tmpdir(), 's127-niche-status-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const options = { apply: true, environment: 'development', 'state-directory': directory }, alerts = [];
  const status = async () => JSON.parse(await readFile(join(directory, 'niche-status.json'), 'utf8'));
  const alert = async (_options, failed) => alerts.push(failed);
  await runNicheJob(options, { alert, sort: async (_options, deps) => {
    await deps.onStart(); assert.equal((await status()).status, 'running');
    return { imported: 2, synced: true, revalidated: true };
  } });
  const completed = await status();
  assert.equal(completed.result.imported, 2);
  assert.equal(completed.status, 'complete');
  await runNicheJob(options, { alert, sort: async () => ({ skipped: true }) });
  assert.deepEqual(await status(), completed);
  const error = Object.assign(Error('revalidation failed'), { jobResult: { imported: 1, synced: true, revalidated: false } });
  await assert.rejects(runNicheJob(options, { alert, sort: async () => { throw error; } }), /revalidation/);
  assert.equal((await status()).status, 'failed');
  assert.equal((await status()).result.synced, true);
  assert.deepEqual(alerts, [false, true]);
});
