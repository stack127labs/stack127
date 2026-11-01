import assert from 'node:assert/strict';
import test from 'node:test';
import { diffPlatformFeeRecords, assertNoPlatformFeeDeletes } from '../../../scripts/platform-fees/record-diff.mjs';
import { datasetArgs, syncDataset } from '../../../scripts/platform-fees/sync-dataset.mjs';

test('dataset diff reports each action and blocks deletion before any write', async () => {
  const current = {
    sections: [{ id: 'same', fields: [{ key: 'fee', label: 'Fee' }], row_updated_at: 'ignored' }, { id: 'retired' }],
    entries: [{ id: 'edit', summary: 'Old', card: { label: 'Fee', percent: 10 } }, { id: 'retired-entry' }],
  };
  const incoming = {
    sections: [{ id: 'same', fields: [{ label: 'Fee', key: 'fee' }] }, { id: 'new' }],
    entries: [{ id: 'edit', summary: 'New', card: { percent: 10, label: 'Fee' } }],
  };
  const diff = diffPlatformFeeRecords(current, incoming);
  assert.deepEqual(diff.sections.counts, { insert: 1, update: 0, delete: 1, unchanged: 1 });
  assert.deepEqual(diff.entries.counts, { insert: 0, update: 1, delete: 1, unchanged: 0 });
  assert.deepEqual(diff.entries.records[0], { id: 'edit', action: 'update', fields: ['summary'] });
  assert.throws(() => assertNoPlatformFeeDeletes(diff), /--allow-delete.*sections\/retired.*entries\/retired-entry/);
  assert.doesNotThrow(() => assertNoPlatformFeeDeletes(diff, true));
  assert.doesNotThrow(() => assertNoPlatformFeeDeletes(diffPlatformFeeRecords(incoming, incoming)));

  const queries = [];
  const client = { async query(sql) {
    queries.push(sql);
    if (sql.includes('to_jsonb')) return { rows: current[sql.includes('platform_fee_sections') ? 'sections' : 'entries'].map(record => ({ record })) };
    return { rows: [], rowCount: 0 };
  } };
  await assert.rejects(syncDataset(client, incoming, { environment: 'development', apply: true }, () => {}), /--allow-delete/);
  assert.equal(queries.at(-1), 'rollback');
  assert.ok(queries.some(sql => sql.startsWith('lock table')));
  assert.ok(!queries.some(sql => /^(insert|update|delete|commit)/i.test(sql)));
  queries.length = 0;
  await syncDataset(client, incoming, { environment: 'development' }, () => {});
  assert.equal(queries[0], 'begin isolation level repeatable read read only');
  assert.equal(queries.at(-1), 'rollback');
  assert.ok(!queries.some(sql => /^(insert|update|delete|lock)/i.test(sql)));
  assert.throws(() => datasetArgs(['--environment', 'production', '--apply']), /--confirm stack127-production/);
  assert.throws(() => datasetArgs(['--environment', 'production']), /--confirm stack127-production/);
  assert.equal(datasetArgs(['--environment', 'production', '--confirm', 'stack127-production', '--apply']).apply, true);
});
