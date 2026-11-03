// Compare values as PostgreSQL/JSON sees them, including dates and JSON objects.
const normalized = value => {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalized);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalized(value[key])]));
  return value ?? null;
};
export function changedPatch(row, patch) {
  return Object.fromEntries(Object.entries(patch).filter(([key, value]) =>
    JSON.stringify(normalized(key.endsWith('_at') && row[key] ? new Date(row[key]) : row[key])) !==
    JSON.stringify(normalized(key.endsWith('_at') && value ? new Date(value) : value))));
}

// Caller holds row locks in a transaction. One set-based UPDATE, with no write
// at all when the prepared values are identical. Never update unrelated fields.
export async function writePatches(client, rows) {
  if (!rows.length) return 0;
  const columns = [...new Set(rows.flatMap(({ patch }) => Object.keys(patch)))];
  if (columns.some(column => !/^[a-z][a-z0-9_]*$/.test(column))) throw new Error('Invalid app column');
  const result = await client.query(`
    update public.self_host_apps app set
      ${columns.map(column => `${column} = incoming.${column}`).join(', ')}
    from jsonb_populate_recordset(null::public.self_host_apps, $1::jsonb) incoming
    where app.id = incoming.id
      and row(${columns.map(column => `app.${column}`).join(',')})
        is distinct from row(${columns.map(column => `incoming.${column}`).join(',')})
    returning app.slug
  `, [JSON.stringify(rows.map(({ row, patch }) => ({ id: row.id, ...Object.fromEntries(columns.map(column => [column, column in patch ? patch[column] : row[column]])) })))]);
  return result.rowCount;
}

export async function refreshApps(client, selection, params, prepare, checkedAt, transaction = true) {
  if (transaction) await client.query('begin');
  try {
    const { rows } = await client.query(`${selection} for update of app`, params);
    const patches = rows.flatMap(row => {
      const patch = changedPatch(row, prepare(row));
      return Object.keys(patch).length ? [{ row, patch: {
        ...patch, ...(checkedAt ? { source_checked_at: checkedAt, data_checked_at: checkedAt, updated_at: checkedAt } : {}),
      } }] : [];
    });
    await writePatches(client, patches);
    // Successful polling must still move through the queue. data_checked_at is
    // ignored by the public-date trigger; source_checked_at changes only with facts.
    if (checkedAt && rows.length) await client.query(`update public.self_host_apps
      set data_checked_at = $2 where id = any($1::uuid[]) and data_checked_at is distinct from $2::timestamptz`,
    [rows.map(row => row.id), checkedAt]);
    if (transaction) await client.query('commit');
  } catch (error) {
    if (transaction) await client.query('rollback');
    throw error;
  }
}
