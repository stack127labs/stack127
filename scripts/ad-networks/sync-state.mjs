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
  return digest({ version: 1, environment, host: url.hostname, port: url.port || '5432', database: url.pathname, user: url.username });
}

export function openSyncState(file, target, { full = false } = {}) {
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file, { timeout: 10000 });
  db.exec(`pragma journal_mode=wal; pragma synchronous=normal;
    create table if not exists synced_rows (
      target text not null, kind text not null, key text not null, hash text not null,
      primary key(target,kind,key)
    ) without rowid;
    begin immediate;`);
  const get = db.prepare('select hash from synced_rows where target=? and kind=? and key=?');
  const put = db.prepare(`insert into synced_rows values(?,?,?,?)
    on conflict(target,kind,key) do update set hash=excluded.hash`);
  return {
    changed(kind, rows, keyOf) {
      return rows.flatMap(row => {
        const key = keyOf(row), hash = digest(row);
        return !full && get.get(target, kind, key)?.hash === hash ? [] : [{ row, key, hash }];
      });
    },
    // Called only after the corresponding PostgreSQL transaction commits.
    acknowledge(kind, changes) { for (const { key, hash } of changes) put.run(target, kind, key, hash); },
    commit() { db.exec('commit'); },
    close() { db.close(); }, // An unfinished SQLite transaction rolls back.
  };
}
