import assert from 'node:assert/strict';
import test from 'node:test';
import { validateNicheBatch, nicheSortArgs, importNiches } from '../../../scripts/ad-networks/niche-sort.mjs';
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
  const client = { query: async (sql, args) => { calls.push({ sql, args }); return { rowCount: 1 }; } };
  assert.equal(await importNiches(client, [result('example.com'), result('example.org', 'gaming', 'low')]), 1);
  assert.deepEqual(JSON.parse(calls[2].args[0]), [{ domain: 'example.com', niche: 'food' }, { domain: 'example.org', niche: null }]);
  assert.match(calls[0].sql, /ad-networks-reviewed-sync/);
  assert.match(calls[2].sql, /p.niche is null/);
  calls.length = 0;
  await assert.rejects(importNiches({ query: async sql => { calls.push(sql); if (sql.startsWith('update')) throw Error('database failed'); } }, []));
  assert.ok(calls.includes('rollback')); assert.match(calls.at(-1), /unlock/);
});
test('small network niche shares use sorted sites while broad comparison gates stay unchanged', () => {
  const shares = adNetworkNicheShares([{ key: 'food', label: 'Food', count: 2 }, { key: 'tech', label: 'Tech', count: 1 }]);
  assert.equal(shares[0].share, 2 / 3 * 100); assert.equal(shares[1].share, 1 / 3 * 100);
  assert.equal(hasAdNetworkNicheCoverage(1000, 3), false);
  assert.equal(adNetworkNicheShares([{ key: 'food', label: 'Food', count: 1 }])[0].share, 100);
  assert.deepEqual(adNetworkNicheShares([]), []);
});
