import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');

// No credentials are stored. A new target or projection starts a fresh baseline.
export function syncTargetKey(environment, connectionString) {
  const url = new URL(connectionString);
  return digest({ version: 2, environment, host: url.hostname, port: url.port || '5432', database: url.pathname, user: url.username });
}

export function openSyncState(file, target, { full = false } = {}) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file, { timeout: 10000 });
  db.exec(`pragma journal_mode=wal; pragma synchronous=full;
    create table if not exists synced_rows (
      target text not null, kind text not null, key text not null, hash text not null,
      primary key(target,kind,key)
    ) without rowid;`);
  const get = db.prepare('select hash from synced_rows where target=? and kind=? and key=?');
  const remove = db.prepare('delete from synced_rows where target=? and kind=? and key=?');
  const put = db.prepare(`insert into synced_rows values(?,?,?,?)
    on conflict(target,kind,key) do update set hash=excluded.hash`);
  function transaction(work) {
    db.exec('begin immediate');
    try { work(); db.exec('commit'); }
    catch (error) { db.exec('rollback'); throw error; }
  }
  return {
    changed(kind, rows, keyOf) {
      return rows.flatMap(row => {
        const key = keyOf(row), hash = digest(row);
        return !full && get.get(target, kind, key)?.hash === hash ? [] : [{ row, key, hash }];
      });
    },
    // Durable before target writes. A crash after a PostgreSQL commit but before
    // acknowledgement must not leave an obsolete hash eligible for reuse.
    invalidate(kind, changes) { transaction(() => { for (const { key } of changes) remove.run(target, kind, key); }); },
    acknowledge(kind, changes) { transaction(() => { for (const { key, hash } of changes) put.run(target, kind, key, hash); }); },
    close() { db.close(); },
  };
}
