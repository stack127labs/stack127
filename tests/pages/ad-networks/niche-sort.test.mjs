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
test('model validation takes only input domains once each, with known labels and confidence', () => {
  const correct = [result('example.com'), result('example.org', null, 'low')];
  assert.deepEqual(validateNicheBatch(input, lines(correct)), correct);
  // A dropped site is left for the next run; an empty answer fails.
  assert.deepEqual(validateNicheBatch(input, lines([correct[0]])), [correct[0]]);
  assert.throws(() => validateNicheBatch(input, ''), /No niche results/);
  for (const bad of [[correct[0], correct[0]], [...correct, result('extra.com')],
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
  const update = calls.find(call => call.sql.startsWith('update'));
  assert.deepEqual(JSON.parse(update.args[0]), [{ domain: 'example.com', niche: 'food' }, { domain: 'example.org', niche: null }]);
  assert.ok(calls.some(call => call.sql.includes("pg_advisory_lock(hashtext('ad-networks-reviewed-sync'))")));
  assert.match(update.sql, /p.niche is null/);
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

test('niche import queues through a twelve-minute sync with bounded server lock timeouts', async () => {
  let elapsed = 0, attempts = 0, timeout;
  const calls = [];
  const client = { query: async sql => {
    calls.push(sql);
    if (sql.startsWith('set lock_timeout')) {
      timeout = Number(sql.match(/'(\d+)ms'/)[1]);
      assert.ok(timeout > 0 && timeout <= 100000);
    } else if (sql.includes('pg_advisory_lock')) {
      attempts++;
      const wait = Math.min(timeout, 12 * 60000 - elapsed);
      elapsed += wait;
      if (elapsed < 12 * 60000) throw Object.assign(Error('lock unavailable'), { code: '55P03' });
    } else {
      assert.ok(elapsed >= 12 * 60000);
    }
    return { rowCount: 1 };
  } };
  assert.equal(await importNiches(client, [result('example.com')], { now: () => elapsed }), 1);
  assert.equal(attempts, 8);
  assert.equal(calls.filter(sql => sql === 'begin').length, 1);
  assert.equal(calls[calls.indexOf('begin') - 1], 'reset lock_timeout');
  assert.match(calls.at(-1), /pg_advisory_unlock/);
});

test('niche import stops after an hour of contention and resets the timeout without importing or unlocking', async () => {
  let elapsed = 0, timeout;
  const calls = [];
  await assert.rejects(importNiches({ query: async sql => {
    calls.push(sql);
    if (sql.startsWith('set lock_timeout')) timeout = Number(sql.match(/'(\d+)ms'/)[1]);
    if (sql.includes('pg_advisory_lock')) {
      // Include time spent sending queries so the last wait has to be shorter.
      elapsed += timeout + 1;
      throw Object.assign(Error('lock unavailable'), { code: '55P03' });
    }
  } }, [], { now: () => elapsed }), /Timed out waiting 60 minutes/);
  assert.ok(timeout < 100000);
  assert.ok(elapsed >= 60 * 60000 && elapsed <= 60 * 60000 + 1);
  assert.equal(calls.at(-1), 'reset lock_timeout');
  assert.equal(calls.includes('begin'), false);
  assert.equal(calls.some(sql => sql.includes('pg_advisory_unlock')), false);
});

test('a lock query failure resets the timeout and fails immediately without retrying', async () => {
  const calls = [];
  await assert.rejects(importNiches({ query: async sql => {
    calls.push(sql);
    if (sql.includes('pg_advisory_lock')) throw Object.assign(Error('connection lost'), { code: '08006' });
  } }, []), /connection lost/);
  assert.equal(calls.filter(sql => sql.includes('pg_advisory_lock')).length, 1);
  assert.equal(calls.at(-1), 'reset lock_timeout');
});

test('a timeout reset failure after acquisition still releases the advisory lock', async () => {
  const calls = [];
  await assert.rejects(importNiches({ query: async sql => {
    calls.push(sql);
    if (sql === 'reset lock_timeout') throw Error('reset failed');
  } }, []), /reset failed/);
  assert.equal(calls.includes('begin'), false);
  assert.match(calls.at(-1), /pg_advisory_unlock/);
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
