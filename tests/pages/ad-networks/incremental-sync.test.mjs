import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { openLocalDatabase } from '../../../scripts/ad-networks/local-db.mjs';
import { saveState } from '../../../scripts/ad-networks/enrichment-store.mjs';
import { syncArgs, syncReviewedData, compactPublisherEvidence, compactRelationshipEvidence, mapSyncPublisher } from '../../../scripts/ad-networks/sync.mjs';
import { deriveManagedBy } from '../../../lib/ad-network-site-facts.mjs';
import { targetDatabaseUrl } from '../../../scripts/ad-networks/runtime-db.mjs';

function syncFixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 's127-incremental-')), file = join(directory, 'source.sqlite');
  const before = process.cwd();
  writeFileSync(join(directory, '.env.local'), 'DATABASE_URL=postgresql://localhost/development\n');
  const db = openLocalDatabase(file);
  const networks = db.prepare('select slug,manager_domains,ad_system_domains,program_signatures from ad_networks').all()
    .map(row => ({ ...row, ...Object.fromEntries(['manager_domains', 'ad_system_domains', 'program_signatures'].map(key => [key, JSON.parse(row[key])])) }));
  const network = db.prepare("select id from ad_networks where slug='mediavine'").get().id;
  const evidence = { manager_domains: [{ value: 'mediavine.com' }], confirmed_networks: ['mediavine'], parse_errors: ['raw diagnostic'],
    seller_records: Array.from({ length: 100 }, () => ({ seller: 'local-only' })) };
  const now = '2026-10-19T00:00:00Z';
  for (let id = 1; id <= 3; id++) {
    db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,last_checked_at,
      check_status,last_check_outcome,last_successful_check_at,last_check_evidence,created_at,updated_at)
      values(?,?,?, ?,?,?,'checked','matched',?,?,?,?)`)
      .run(id, `site${id}.example`, `site${id}.example`, now, now, now, now, JSON.stringify(evidence), now, now);
    db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,
      first_confirmed_at,last_confirmed_at,created_at,updated_at) values(?,?,?,'primary_or_exclusive_manager',
      'managerdomain',?,?,?, ?,?)`)
      .run(network, id, id === 3 ? 'needs_review' : 'confirmed', JSON.stringify({ manager_domain: 'mediavine.com', matched_signal: 'MANAGERDOMAIN=mediavine.com', checked_url: 'https://site.example/ads.txt', checked_at: now, parser_version: '1', raw: 'local-only' }), now, now, now, now);
    saveState(db, id, 'homepage', 'measured', { title: `Site ${id}`, description: 'Food ideas', h1: 'Recipes', language: 'en', raw: 'local-only' });
  }
  process.chdir(directory);
  t.after(() => { process.chdir(before); db.close(); rmSync(directory, { recursive: true, force: true }); });
  const options = syncArgs(['--sqlite', file, '--apply']);
  const calls = [], payloads = { publishers: [], relationships: [] };
  let connections = 0, fail = false, contended = null;
  const client = { release() { calls.push('release'); }, async query(sql, params) {
    calls.push(sql);
    if (sql.includes('pg_try_advisory_lock')) return { rows: [{ locked: !contended || !sql.includes(contended) }] };
    if (sql.startsWith('select slug,manager_domains')) return { rows: networks };
    if (sql.includes('as initial')) return { rows: [{ initial: false }] };
    if (sql.startsWith('with i as')) return { rows: [{ inserted: 0, updated: JSON.parse(params[0]).length }] };
    if (sql.startsWith('insert into public.ad_network_publishers')) payloads.publishers.push(...JSON.parse(params[0]));
    if (sql.startsWith('insert into public.ad_network_publisher_relationships')) {
      if (fail) throw new Error('target failure');
      payloads.relationships.push(...JSON.parse(params[0]));
    }
    return { rows: [], rowCount: 0 };
  } };
  const pool = { connect: async () => { connections++; return client; }, end: async () => calls.push('end') };
  return { directory, file, db, network, options, pool, calls, payloads, networks,
    run: () => syncReviewedData(options, { pool }), connections: () => connections,
    fail: value => { fail = value; }, contend: value => { contended = value; } };
}

test('sync sends only changed page facts, preserves local evidence, and uses one session', async t => {
  const f = syncFixture(t);
  let result = await f.run();
  assert.equal(result.publishers_sent, 2); assert.equal(result.relationships_sent, 2);
  assert.equal(f.connections(), 1);
  assert.equal(f.calls.filter(sql => sql.includes('pg_try_advisory_lock')).length, 2);
  assert.ok(f.payloads.publishers.every(row => !Object.hasOwn(row, 'discovery_sources')));
  assert.deepEqual(f.payloads.publishers[0].last_check_evidence.enrichment.homepage,
    { title: 'Site 1', description: 'Food ideas', h1: 'Recipes', language: 'en' });
  assert.doesNotMatch(JSON.stringify(f.payloads), /local-only|raw diagnostic|seller_records/);
  const sent = JSON.stringify(f.payloads);
  result = await f.run();
  assert.equal(result.publishers_sent, 0); assert.equal(result.relationships_sent, 0);
  assert.equal(JSON.stringify(f.payloads), sent);

  f.db.prepare("update publishers set last_check_evidence=json_set(last_check_evidence,'$.parse_errors',json('[\"another local error\"]')) where id=1").run();
  f.db.prepare("update relationships set evidence=json_set(evidence,'$.raw','changed locally') where publisher_id=1").run();
  result = await f.run();
  assert.equal(result.publishers_sent, 0); assert.equal(result.relationships_sent, 0);

  f.db.prepare("update publishers set platform='WordPress' where id=1").run();
  f.db.prepare("update relationships set status='stale' where publisher_id=2").run();
  result = await f.run();
  assert.equal(result.publishers_sent, 1); assert.equal(result.relationships_sent, 1);
  assert.match(f.db.prepare('select last_check_evidence from publishers where id=1').get().last_check_evidence, /local-only/);
  assert.equal(f.calls.at(-1), 'end');
});

test('failed sync cannot checkpoint unsent changes; a full replay and a new target ignore the old baseline', async t => {
  const f = syncFixture(t);
  f.fail(true);
  await assert.rejects(f.run(), /target failure/);
  f.fail(false);
  let result = await f.run();
  assert.equal(result.publishers_sent, 2); assert.equal(result.relationships_sent, 2);
  assert.equal((await f.run()).publishers_sent, 0);
  result = await syncReviewedData({ ...f.options, full: true }, { pool: f.pool });
  assert.equal(result.publishers_sent, 2); assert.equal(result.relationships_sent, 2);
  writeFileSync(join(f.directory, '.env.local'), 'DATABASE_URL=postgresql://different-host/development\n');
  result = await f.run();
  assert.equal(result.publishers_sent, 2); assert.equal(result.relationships_sent, 2);
});

for (const lock of ['runtime-heavy', 'reviewed-sync']) test(`${lock} contention skips writes and closes the only session`, async t => {
  const f = syncFixture(t); f.contend(lock);
  assert.equal((await f.run()).skipped, true);
  assert.equal(f.connections(), 1);
  assert.deepEqual(f.payloads, { publishers: [], relationships: [] });
  assert.deepEqual(f.calls.slice(-2), ['release', 'end']);
});

test('compact evidence retains manager resolution, successful observations, niche input, and checker preview', () => {
  const publisher = { manager_domains: [{ value: 'mediavine.com' }], confirmed_networks: ['mediavine'], raw: 'large',
    enrichment: { homepage: { title: 'Recipes', description: 'Food', h1: 'Soup', language: 'en', raw: 'large' }, traffic: { raw: 'large' } } };
  const relationship = { manager_domain: 'mediavine.com', matched_signal: 'MANAGERDOMAIN=mediavine.com', raw: 'large' };
  const identities = [{ slug: 'mediavine', name: 'Mediavine', manager_domains: ['mediavine.com'] }];
  const manager = evidence => deriveManagedBy(evidence, identities);
  assert.deepEqual(manager(compactPublisherEvidence(publisher)), manager(publisher));
  assert.deepEqual(compactPublisherEvidence(publisher).confirmed_networks, publisher.confirmed_networks);
  assert.deepEqual(compactRelationshipEvidence(relationship), { manager_domain: 'mediavine.com', matched_signal: 'MANAGERDOMAIN=mediavine.com' });
  assert.deepEqual(compactPublisherEvidence(publisher).enrichment.homepage,
    { title: 'Recipes', description: 'Food', h1: 'Soup', language: 'en' });
  const summary = { lines: 3, companies: 1, direct: 1, reseller: 0, invalid: 0, top_sellers: [{ name: 'seller.example', lines: 1 }], seller_domains: ['seller.example'], preview: 'one\ntwo\nMANAGERDOMAIN=mediavine.com' };
  assert.deepEqual(mapSyncPublisher({ last_check_evidence: publisher, ads_txt_summary: JSON.stringify(summary) }).ads_txt_summary, summary);
});

test('incremental upserts run against PostgreSQL constraints and generated report columns', {
  skip: process.env.AD_NETWORKS_TEST_ENVIRONMENT !== 'development',
}, async t => {
  // Copy schema into session-local tables. No public data, sequences, cache
  // triggers, or publication rows are written, even when --apply is exercised.
  const connectionString = targetDatabaseUrl({ environment: 'development' });
  const f = syncFixture(t), pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 15000 });
  const client = await pool.connect();
  t.after(async () => { client.release(); await pool.end(); });
  const tables = ['ad_network_publishers', 'ad_network_publisher_relationships', 'ad_network_check_observations',
    'ad_network_relationship_events', 'ad_network_daily_counts'];
  for (const table of tables) await client.query(`create temporary table sync_${table} (like public.${table} including all)`);
  const isolated = { query: (sql, params) => {
    for (const table of tables) sql = sql.replaceAll(`public.${table}`, `pg_temp.sync_${table}`);
    return client.query(sql, params);
  }, release() {} };
  const dependencies = { pool: { connect: async () => isolated, end: async () => {} } };
  let result = await syncReviewedData(f.options, dependencies);
  assert.equal(result.publishers_inserted, 2); assert.equal(result.relationships_inserted, 2);
  assert.equal((await client.query('select count(*)::int as count from sync_ad_network_check_observations')).rows[0].count, 2);
  result = await syncReviewedData(f.options, dependencies);
  assert.equal(result.publishers_sent, 0); assert.equal(result.relationships_sent, 0);
  const row = (await client.query('select last_check_evidence,report_manager_domains from sync_ad_network_publishers limit 1')).rows[0];
  assert.deepEqual(row.report_manager_domains, row.last_check_evidence.manager_domains.map(item => item.value));
  f.db.prepare("update publishers set platform='WordPress' where id=1").run();
  result = await syncReviewedData(f.options, dependencies);
  assert.equal(result.publishers_updated, 1); assert.equal(result.publishers_sent, 1);
  await client.query(`update sync_ad_network_publishers set
    last_check_evidence=last_check_evidence || '{"raw":"large local-only data"}'::jsonb,
    discovery_sources='[{"source":"local-only"}]'::jsonb;
    update sync_ad_network_publisher_relationships set evidence=evidence || '{"raw":"large local-only data"}'::jsonb`);
  const cleanup = readFileSync(new URL('../../../scripts/ad-networks/trim-production-evidence.sql', import.meta.url), 'utf8')
    .replace(/^\\set.*$/gm, '');
  await isolated.query(cleanup);
  assert.equal((await client.query(`select count(*)::int as count from sync_ad_network_publishers
    where last_check_evidence ? 'raw' or discovery_sources<>'[]'::jsonb`)).rows[0].count, 0);
  assert.equal((await client.query(`select count(*)::int as count from sync_ad_network_publisher_relationships
    where evidence ? 'raw'`)).rows[0].count, 0);
  // Compacting must not invent null-valued keys that let an invalid confirmed
  // relationship pass the existing required-evidence constraint.
  f.db.prepare("update relationships set evidence=json_remove(evidence,'$.checked_url') where publisher_id=1").run();
  await assert.rejects(syncReviewedData(f.options, dependencies), { code: '23514' });
});
