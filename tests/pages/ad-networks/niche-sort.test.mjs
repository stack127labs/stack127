import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { validateNicheBatch, nicheSortArgs, importNiches, runNicheJob, recoverNicheBatch, classifyNiches, sortNiches } from '../../../scripts/ad-networks/niche-sort.mjs';
import { adNetworkNicheShares, hasAdNetworkNicheCoverage } from '../../../lib/ad-networks-report.ts';

const input = [{ domain: 'example.com' }, { domain: 'example.org' }];
const result = (domain, niche = 'food', confidence = 'high') => ({ domain, niche, confidence });
const lines = rows => rows.map(row => JSON.stringify(row)).join('\n');
const collect = async iterator => { const rows = []; for await (const batch of iterator) rows.push(...batch); return rows; };
const noDelay = async () => {};

test('transient failures retry once then split 100 sites into 50 and 25, without losing sites', async () => {
  const sites = Array.from({ length: 100 }, (_, i) => ({ domain: `site${i}.com` })), sizes = [];
  const rows = await collect(recoverNicheBatch(sites, '', {}, { delay: noDelay, classify: async batch => {
    sizes.push(batch.length);
    if (batch.length > 25) throw Object.assign(Error('Model timed out'), { code: 'NICHE_MODEL_RETRYABLE' });
    return lines(batch.map(site => result(site.domain)));
  } }));
  assert.equal(rows.length, 100);
  assert.equal(new Set(rows.map(row => row.domain)).size, 100);
  assert.deepEqual(sizes, [100, 100, 50, 50, 25, 25, 50, 50, 25, 25]);
});

test('partial results are yielded immediately and only unanswered sites are retried', async () => {
  const batches = [], calls = [];
  for await (const rows of recoverNicheBatch(input, '', {}, { delay: noDelay, classify: async batch => {
    calls.push(batch.map(site => site.domain));
    return lines([result(batch[0].domain)]);
  } })) batches.push(rows);
  assert.deepEqual(batches, [[result('example.com')], [result('example.org')]]);
  assert.deepEqual(calls, [['example.com', 'example.org'], ['example.org']]);
});

test('empty or malformed answers stop after two attempts at the smallest batch', async () => {
  let calls = 0;
  assert.deepEqual(await collect(recoverNicheBatch(input, '', {}, {
    delay: noDelay, classify: async () => { calls++; return 'not JSON'; },
  })), []);
  assert.equal(calls, 2);
});

test('operator stops, login failures, spawn failures and usage limits are never retried', async () => {
  for (const code of ['NICHE_STOPPED', 'NICHE_MODEL_FAILED', 'NICHE_USAGE_LIMIT', 'ENOENT', 'EACCES']) {
    let calls = 0;
    await assert.rejects(collect(recoverNicheBatch(input, '', {}, { delay: noDelay, classify: async () => {
      calls++; throw Object.assign(Error('failed'), { code });
    } })), error => error.code === code);
    assert.equal(calls, 1);
  }
  let calls = 0;
  await assert.rejects(collect(recoverNicheBatch(input, '', {}, { delay: noDelay, classify: async () => {
    calls++; return "You've hit your weekly limit · resets tomorrow";
  } })), error => error.code === 'NICHE_USAGE_LIMIT');
  assert.equal(calls, 1);
});

test('a stop during retry backoff prevents the next call', async () => {
  const controller = new AbortController(); let calls = 0;
  await assert.rejects(collect(recoverNicheBatch(input, '', { signal: controller.signal }, {
    delay: async () => controller.abort(Object.assign(Error('Model interrupted'), { code: 'NICHE_STOPPED' })),
    classify: async () => { calls++; return ''; },
  })), error => error.code === 'NICHE_STOPPED');
  assert.equal(calls, 1);
});

function fakeModel(run) {
  const signals = new EventEmitter();
  return { signals, spawn: (_command, _args, config) => {
    const child = new EventEmitter();
    child.stdout = new PassThrough(); child.stderr = new PassThrough(); child.stdin = new PassThrough();
    child.kill = signal => queueMicrotask(() => child.emit('close', null, signal));
    child.stdin.once('finish', () => queueMicrotask(() => run(child, config, signals)));
    return child;
  } };
}

test('CLI output is collected through close, including data arriving after exit', async () => {
  const text = await classifyNiches(input, '', {}, fakeModel(child => {
    child.stdout.write(lines([result('example.com')]) + '\n');
    child.emit('exit', 0);
    child.stdout.write(lines([result('example.org')]));
    child.emit('close', 0);
  }));
  assert.equal(validateNicheBatch(input, text).length, 2);
});

test('CLI errors sanitize credentials, bound diagnostics, and distinguish fatal and transient failures', async t => {
  const prior = process.env.TEST_MODEL_API_KEY;
  process.env.TEST_MODEL_API_KEY = 'diagnostic-test-secret';
  t.after(() => { if (prior === undefined) delete process.env.TEST_MODEL_API_KEY; else process.env.TEST_MODEL_API_KEY = prior; });
  for (const [diagnostic, code] of [
    ['Not logged in; run /login', 'NICHE_MODEL_FAILED'],
    ['503 temporarily unavailable', 'NICHE_MODEL_RETRYABLE'],
    ['You have reached your usage limit', 'NICHE_USAGE_LIMIT'],
  ]) {
    await assert.rejects(classifyNiches(input, '', {}, fakeModel((child, config) => {
      assert.equal(config.env.TEST_MODEL_API_KEY, undefined);
      child.stderr.write(`\x1b[31m${diagnostic}\n diagnostic-test-secret Bearer abc123 sk-ant-secret123 postgresql://user:secret@db/test ${'x'.repeat(2000)}`);
      child.emit('close', 1);
    })), error => {
      assert.equal(error.code, code);
      assert.doesNotMatch(error.message, /diagnostic-test-secret|abc123|sk-ant-secret123|user:secret|\x1b/);
      assert.ok(error.message.length < 650);
      return true;
    });
  }
});

test('a CLI stop wins over output errors, while its own timeout is recoverable', async () => {
  await assert.rejects(classifyNiches(input, '', {}, fakeModel((child, _config, signals) => {
    child.stderr.write('usage limit'); signals.emit('SIGTERM');
  })), error => error.code === 'NICHE_STOPPED');
  await assert.rejects(classifyNiches(input, '', {}, { ...fakeModel(() => {}), timeoutMs: 1 }),
    error => error.code === 'NICHE_MODEL_RETRYABLE');
});

test('login errors and usage limits stop even when the CLI returns exit code zero', async () => {
  for (const [message, code] of [
    ['Not logged in · Please run /login', 'NICHE_MODEL_FAILED'],
    ['API Error: 429', 'NICHE_USAGE_LIMIT'],
    ["You've hit your limit · resets tomorrow", 'NICHE_USAGE_LIMIT'],
  ]) {
    await assert.rejects(classifyNiches(input, '', {}, fakeModel(child => {
      child.stdout.write(message); child.emit('close', 0);
    })), error => error.code === code);
  }
});

async function sortFixture(t, sites, classify, update) {
  const directory = await mkdtemp(join(tmpdir(), 's127-niche-recovery-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const writes = [];
  const client = { release() {}, query: async (sql, args) => {
    if (sql.includes('pg_try_advisory_lock')) return { rows: [{ locked: true }] };
    if (sql.startsWith('select p.normalized_domain')) return { rows: sites.filter(site => site.domain > args[0]) };
    if (sql.startsWith('update')) {
      const rows = JSON.parse(args[0]); writes.push(rows);
      if (update) return update(rows);
      return { rowCount: rows.filter(row => row.niche !== null).length };
    }
    return { rows: [] };
  } };
  const options = nicheSortArgs(['--apply', '--state-directory', directory, '--limit', String(sites.length)]);
  const run = () => sortNiches(options, { classify, delay: noDelay, revalidate: async () => {},
    pool: { connect: async () => client, end: async () => {} } });
  return { run, writes, checkpoint: async () => JSON.parse(await readFile(join(directory, 'niche-results.json'), 'utf8')) };
}

test('unresolved batches do not block later sites, and only completed answers get checkpoints', async t => {
  const sites = Array.from({ length: 101 }, (_, i) => ({ domain: `site${String(i).padStart(3, '0')}.com`, title: 'Evidence' }));
  let calls = 0;
  const fixture = await sortFixture(t, sites, async batch => {
    calls++;
    return batch.length === 1 ? lines([result(batch[0].domain, 'food', 'low')]) : '';
  });
  const actual = await fixture.run();
  assert.equal(calls, 15); // Two attempts each at 100, 50 and 25, then the next site's call.
  assert.equal(actual.candidates, 101); assert.equal(actual.classified, 1);
  assert.equal(actual.unresolved, 100); assert.equal(actual.imported, 0); assert.equal(actual.withheld, 1);
  assert.deepEqual(Object.keys(await fixture.checkpoint()), ['site100.com']);
});

test('database failures stop immediately without retrying the model or writing checkpoints', async t => {
  let calls = 0;
  const fixture = await sortFixture(t, [{ domain: 'example.com', title: 'Food' }],
    async () => { calls++; return lines([result('example.com')]); },
    async () => { throw Object.assign(Error('connection lost'), { code: '08006' }); });
  await assert.rejects(fixture.run(), error => {
    assert.equal(error.jobResult.classified, 0); assert.equal(error.jobResult.imported, 0);
    assert.equal(error.jobResult.unresolved, 1); return error.code === '08006';
  });
  assert.equal(calls, 1);
  await assert.rejects(fixture.checkpoint(), { code: 'ENOENT' });
});

test('a later usage limit preserves completed imports and reports the unprocessed sites', async t => {
  let calls = 0;
  const sites = input.map(site => ({ ...site, title: 'Food' }));
  const fixture = await sortFixture(t, sites, async () => {
    if (++calls === 1) return lines([result('example.com')]);
    throw Object.assign(Error('weekly limit reached'), { code: 'NICHE_USAGE_LIMIT' });
  });
  await assert.rejects(fixture.run(), error => {
    assert.equal(error.code, 'NICHE_USAGE_LIMIT');
    assert.deepEqual(error.jobResult, { candidates: 2, classified: 1, imported: 1, withheld: 0,
      unresolved: 1, synced: true, revalidated: false });
    return true;
  });
  assert.equal(calls, 2);
  assert.deepEqual(Object.keys(await fixture.checkpoint()), ['example.com']);
});

test('an operator stop after classification prevents imports and releases signal handlers', async t => {
  const priorListeners = process.listenerCount('SIGTERM');
  const fixture = await sortFixture(t, [{ domain: 'example.com', title: 'Food' }], async () => {
    process.emit('SIGTERM');
    return lines([result('example.com')]);
  });
  await assert.rejects(fixture.run(), error => error.code === 'NICHE_STOPPED');
  assert.deepEqual(fixture.writes, []);
  assert.equal(process.listenerCount('SIGTERM'), priorListeners);
});
test('model validation keeps only clean answers to input domains, once each', () => {
  const correct = [result('example.com'), result('example.org', null, 'low')];
  assert.deepEqual(validateNicheBatch(input, lines(correct)), correct);
  // A dropped, mangled, or repeated answer is left for the next run; nothing usable fails.
  assert.deepEqual(validateNicheBatch(input, lines([correct[0]])), [correct[0]]);
  for (const bad of [result('extra.com'), result('example.com', 'invented'), result('example.com', 'food', 1.5),
    { ...correct[0], comment: 'extra' }, result('https://example.com'), result('bad domain')]) {
    assert.deepEqual(validateNicheBatch(input, lines([bad, correct[1]])), [correct[1]]);
  }
  assert.deepEqual(validateNicheBatch(input, `not json\n${lines([correct[1]])}`), [correct[1]]);
  // A site answered twice is dropped, even when one of the answers is malformed, in either order.
  const malformed = { ...result('example.com', 'tech'), comment: 'extra' };
  for (const twice of [[correct[0], result('example.com', 'tech')], [correct[0], malformed], [malformed, correct[0]]]) {
    assert.deepEqual(validateNicheBatch(input, lines([...twice, correct[1]])), [correct[1]]);
  }
  for (const empty of ['', '```json\n{}\n```', lines([correct[0], correct[0]])]) {
    assert.throws(() => validateNicheBatch(input, empty), /No usable niche results/);
  }
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
  await runNicheJob(options, { alert, sort: async () => ({ imported: 1, unresolved: 2, synced: true, revalidated: true }) });
  assert.equal((await status()).status, 'partial');
  assert.equal((await status()).result.unresolved, 2);
  const partial = await status();
  await runNicheJob(options, { alert, sort: async () => ({ skipped: true }) });
  assert.deepEqual(await status(), partial);
  const error = Object.assign(Error('revalidation failed'), { jobResult: { imported: 1, synced: true, revalidated: false } });
  await assert.rejects(runNicheJob(options, { alert, sort: async () => { throw error; } }), /revalidation/);
  assert.equal((await status()).status, 'failed');
  assert.equal((await status()).result.synced, true);
  assert.deepEqual(alerts, [false, true, true]);
});
