const identifier = value => {
  if (!/^[a-z][a-z0-9_]*$/.test(value)) throw new Error(`Invalid database identifier: ${value}`);
  return `"${value}"`;
};

export function changedColumns(table, columns, { preserveOnNull = new Set(), exclude = [] } = {}) {
  const selected = columns.filter(column => !exclude.includes(column));
  if (!selected.length) throw new Error('Record comparison needs columns');
  const current = selected.map(column => `${identifier(table)}.${identifier(column)}`);
  const desired = selected.map((column, index) => preserveOnNull.has(column)
    ? `coalesce(excluded.${identifier(column)},${current[index]})` : `excluded.${identifier(column)}`);
  return `row(${current.join(',')}) is distinct from row(${desired.join(',')})`;
}

// The caller owns the transaction and chooses the rows this import owns.
export async function syncRecords(client, { table, rows, keys, columns = [...new Set(rows.flatMap(row => Object.keys(row)))], removeMissing = false, scope }) {
  const name = `public.${identifier(table)}`;
  if (!keys.length || keys.some(key => !columns.includes(key))) throw new Error('Record keys must be present');
  const selected = columns.map(identifier).join(',');
  const mutable = columns.filter(column => !keys.includes(column));
  let removed = 0;
  if (removeMissing) {
    const match = keys.map(key => `incoming.${identifier(key)}=current.${identifier(key)}`).join(' and ');
    const result = await client.query(`delete from ${name} current where
      ${scope ? `current.${identifier(scope.column)}=any($2)` : 'true'} and not exists (
        select 1 from jsonb_populate_recordset(null::${name},$1::jsonb) incoming where ${match})`,
    [JSON.stringify(rows), ...(scope ? [scope.values] : [])]);
    removed = result.rowCount;
  }
  if (!rows.length) return { changed: 0, removed };
  const result = await client.query(`insert into ${name} (${selected})
    select ${selected} from jsonb_populate_recordset(null::${name},$1::jsonb)
    on conflict (${keys.map(identifier).join(',')}) do ${mutable.length ? `update set
      ${mutable.map(column => `${identifier(column)}=excluded.${identifier(column)}`).join(',')}
      where ${changedColumns(table,mutable)}` : 'nothing'} returning ${keys.map(identifier).join(',')}`,
  [JSON.stringify(rows)]);
  return { changed: result.rowCount, removed };
}
