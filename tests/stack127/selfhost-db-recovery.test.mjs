import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { refillEnvironment, targetUrl, assertIdentity } from '../../scripts/stack127/selfhost-db/restore-core.mjs';

const checker = fileURLToPath(new URL('../../scripts/stack127/selfhost-db/check-backup.py', import.meta.url));
const toc = '3501; 0 1 TABLE DATA public stack127_pages postgres\n3502; 0 2 TABLE DATA public ad_network_publishers postgres\n';
const payload = count => 'COPY public.stack127_pages (id) FROM stdin;\n1\n\\.\n'
  + 'COPY public.ad_network_publishers (id) FROM stdin;\n'
  + Array.from({ length: count }, (_, i) => i + '\n').join('') + '\\.\n';
function check(archiveToc, data) {
  const directory = mkdtempSync(join(tmpdir(), 'stack127-backup-check-'));
  try {
    const path = join(directory, 'archive.toc');
    writeFileSync(path, archiveToc, { mode: 0o600 });
    return spawnSync('python3', [checker, '--toc', path], { input: data, encoding: 'utf8' });
  } finally { rmSync(directory, { recursive: true, force: true }); }
}

test('backup rejects an empty cluster and missing core archive entries', () => {
  for (const entries of ['', toc.split('\n')[0] + '\n']) {
    const result = check(entries, payload(1000));
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /BACKUP REFUSED: Required core TABLE DATA/);
  }
});

test('recreated empty tables and undersized publisher snapshots cannot become backups', () => {
  const empty = 'COPY public.stack127_pages (id) FROM stdin;\n\\.\nCOPY public.ad_network_publishers (id) FROM stdin;\n\\.\n';
  for (const data of [empty, payload(999)]) {
    const result = check(toc, data);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /BACKUP REFUSED: Core data missing or below/);
  }
});

test('backup accepts a complete populated archive and rejects truncated COPY data', () => {
  const good = check(toc, payload(1000));
  assert.equal(good.status, 0, good.stderr);
  assert.match(good.stdout, /pages=1, publishers=1000/);
  assert.notEqual(check(toc, payload(1000).slice(0, -3)).status, 0);
});

test('refill passes exactly one target URL and removes inherited credentials/options', () => {
  const inherited = { PATH: '/usr/bin', HOME: '/home/ubuntu', DATABASE_URL: 'old-source',
    DATABASE_POOLER_URL: 'old-source', SUPABASE_SECRET_KEY: 'secret', POSTGRES_PASSWORD: 'admin',
    SELFHOST_DB_MIGRATION_PASSWORD: 'owner', GITHUB_ALERT_TOKEN: 'token', NODE_OPTIONS: '--inspect',
    AD_NETWORKS_RUNTIME_ENVIRONMENT: 'development' };
  assert.deepEqual(refillEnvironment('target', inherited), { PATH: '/usr/bin', HOME: '/home/ubuntu',
    DATABASE_POOLER_URL: 'target', AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production' });
  assert.equal(inherited.DATABASE_URL, 'old-source');
});

test('restore refuses non-target URLs and isolates the explicitly named scratch host', () => {
  const url = 'postgresql://stack127_app:fixture@127.0.0.1:5432/postgres?sslmode=disable';
  assert.equal(targetUrl(url, 'stack127-db', '127.0.0.1'), url);
  for (const bad of [url.replace('127.0.0.1', 'source.pooler.supabase.com'),
    url.replace('stack127_app', 'postgres'), url.replace(':5432', ':6543'), url.replace('/postgres?', '/other?')]) {
    assert.throws(() => targetUrl(bad, 'stack127-db', '127.0.0.1'));
  }
  assert.throws(() => targetUrl(url, 'stack127-db', '127.0.0.2'));
  assert.throws(() => targetUrl(url, 'another-container', '127.0.0.1'));
  assert.equal(new URL(targetUrl(url, 'stack127-db-rehearsal-scratch', '127.0.0.2')).hostname, '127.0.0.2');
});

test('TCP system identifier, app login, database and server address must all match', () => {
  const identity = { system_id: '123', login: 'stack127_app', database: 'postgres', server_address: '172.18.0.2' };
  assert.doesNotThrow(() => assertIdentity(identity, '123'));
  for (const change of [{ system_id: '456' }, { login: 'postgres' }, { database: 'other' }, { server_address: null }]) {
    assert.throws(() => assertIdentity({ ...identity, ...change }, '123'));
  }
});
