import { isDeepStrictEqual } from 'node:util';

// Compare only import-owned columns, like syncRecords. JSON object key order
// is irrelevant; array order is part of the stored public record.
export function diffPlatformFeeRecords(current, incoming) {
  return Object.fromEntries(['sections', 'entries'].map(kind => {
    const before = new Map(current[kind].map(row => [row.id, row]));
    const desired = new Map(incoming[kind].map(row => [row.id, row]));
    const columns = [...new Set(incoming[kind].flatMap(row => Object.keys(row)))].sort();
    const records = [...new Set([...before.keys(), ...desired.keys()])].sort().map(id => {
      if (!desired.has(id)) return { id, action: 'delete', fields: [] };
      if (!before.has(id)) return { id, action: 'insert', fields: [] };
      const fields = columns.filter(column => !isDeepStrictEqual(before.get(id)[column] ?? null, desired.get(id)[column] ?? null));
      return { id, action: fields.length ? 'update' : 'unchanged', fields };
    });
    const counts = Object.fromEntries(['insert', 'update', 'delete', 'unchanged'].map(action =>
      [action, records.filter(row => row.action === action).length]));
    return [kind, { counts, records }];
  }));
}

export function assertNoPlatformFeeDeletes(diff, allowDelete = false) {
  const removed = ['sections', 'entries'].flatMap(kind => diff[kind].records
    .filter(row => row.action === 'delete').map(row => `${kind}/${row.id}`));
  if (removed.length && !allowDelete) throw new Error(`Refusing deletions without --allow-delete: ${removed.join(', ')}`);
}
