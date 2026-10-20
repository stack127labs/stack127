import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import pg from 'pg';
import { openLocalDatabase } from '../../../scripts/ad-networks/local-db.mjs';
import { saveState } from '../../../scripts/ad-networks/enrichment-store.mjs';
import { syncArgs, syncReviewedData, compactPublisherEvidence, compactRelationshipEvidence, mapSyncPublisher, compactDiscoverySources } from '../../../scripts/ad-networks/sync.mjs';
import { deriveManagedBy } from '../../../lib/ad-network-site-facts.mjs';
import { openSyncState, syncTargetKey } from '../../../scripts/ad-networks/sync-state.mjs';
import { adNetworksLibrary } from './loader-harness.mjs';
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
    for (const key of (id===1 ? ['checker','sellers-json'] : ['sellers-json'])) {
      db.prepare(`insert into publisher_sources(publisher_id,source_key,source_url,first_seen_at,last_seen_at) values(?,?,?,?,?)`)
        .run(id,key,'https://local-only.example/raw-source',now,now);
    }
    saveState(db, id, 'homepage', 'measured', { title: `Site ${id}`, description: 'Food ideas', h1: 'Recipes', language: 'en', raw: 'local-only' });
  }
  process.chdir(directory);
  t.after(() => { process.chdir(before); db.close(); rmSync(directory, { recursive: true, force: true }); });
  const options = syncArgs(['--sqlite', file, '--apply']);
  const calls = [], payloads = { publishers: [], relationships: [] };
  const target = { publishers: new Map(), relationships: new Map() };
  let connections = 0, fail = false, contended = null, transaction;
  const client = { release() { calls.push('release'); }, async query(sql, params) {
    calls.push(sql);
    if (sql==='begin') transaction={publishers:new Map(target.publishers),relationships:new Map(target.relationships)};
    if (sql==='commit') { target.publishers=transaction.publishers;target.relationships=transaction.relationships;transaction=null; }
    if (sql==='rollback') transaction=null;
    if (sql.includes('pg_try_advisory_lock')) return { rows: [{ locked: !contended || !sql.includes(contended) }] };
    if (sql.startsWith('select slug,manager_domains')) return { rows: networks };
    if (sql.includes('as initial')) return { rows: [{ initial: false }] };
    if (sql.startsWith('with i as')) {
      const rows=JSON.parse(params[0]);
      return {rows:[{inserted:0,updated:rows.length,matched:rows.filter(row=>transaction.publishers.has(row.domain)).length}]};
    }
    if (sql.startsWith('insert into public.ad_network_publishers')) {
      const rows=JSON.parse(params[0]);payloads.publishers.push(...rows);
      for(const row of rows)transaction.publishers.set(row.normalized_domain,row);
    }
    if (sql.startsWith('insert into public.ad_network_publisher_relationships')) {
      if (fail) throw new Error('target failure');
      const rows=JSON.parse(params[0]);payloads.relationships.push(...rows);
      for(const row of rows)if(transaction.publishers.has(row.domain))transaction.relationships.set(`${row.network_slug}:${row.domain}`,row);
    }
    return { rows: [], rowCount: 0 };
  } };
  const pool = { connect: async () => { connections++; return client; }, end: async () => calls.push('end') };
  return { directory, file, db, network, options, pool, calls, payloads, networks, target,
    run: () => syncReviewedData(options, { pool }), connections: () => connections,
    fail: value => { fail = value; }, contend: value => { contended = value; } };
}

test('sync sends only changed page facts, preserves local evidence, and uses one session', async t => {
  const f = syncFixture(t);
  let result = await f.run();
  assert.equal(result.publishers_sent, 2); assert.equal(result.relationships_sent, 2);
  assert.equal(f.connections(), 1);
  assert.equal(f.calls.filter(sql => sql.includes('pg_try_advisory_lock')).length, 2);
  assert.deepEqual(f.payloads.publishers[0].discovery_sources,[{source_key:'checker'},{source_key:'sellers-json'}]);
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

test('failed relationships remain unsynced; committed publishers, full replay, and new targets retain their correct baselines', async t => {
  const f = syncFixture(t);
  f.fail(true);
  await assert.rejects(f.run(), /target failure/);
  f.fail(false);
  let result = await f.run();
  assert.equal(result.publishers_sent, 0); assert.equal(result.relationships_sent, 2);
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
    discovery_sources=discovery_sources || '[{"source":"local-only"}]'::jsonb;
    update sync_ad_network_publisher_relationships set evidence=evidence || '{"raw":"large local-only data"}'::jsonb`);
  const cleanup = readFileSync(new URL('../../../scripts/ad-networks/trim-production-evidence.sql', import.meta.url), 'utf8')
    .replace(/^\\set.*$/gm, '');
  await isolated.query(cleanup);
  assert.equal((await client.query(`select count(*)::int as count from sync_ad_network_publishers
    where last_check_evidence ? 'raw' or discovery_sources @> '[{"source":"local-only"}]'::jsonb`)).rows[0].count, 0);
  assert.equal((await client.query(`select count(*)::int as count from sync_ad_network_publisher_relationships
    where evidence ? 'raw'`)).rows[0].count, 0);
  // Compacting must not invent null-valued keys that let an invalid confirmed
  // relationship pass the existing required-evidence constraint.
  f.db.prepare("update relationships set evidence=json_remove(evidence,'$.checked_url') where publisher_id=1").run();
  await assert.rejects(syncReviewedData(f.options, dependencies), { code: '23514' });
  f.db.prepare("update relationships set evidence=json_set(evidence,'$.checked_url','https://site.example/ads.txt') where publisher_id=1").run();
  // A target deletion must fail coverage even though the local publisher hash
  // is unchanged. A full replay repairs the parent and retries its relationship.
  await client.query(`delete from sync_ad_network_publisher_relationships where publisher_id in
    (select id from sync_ad_network_publishers where normalized_domain='site2.example');
    delete from sync_ad_network_publishers where normalized_domain='site2.example'`);
  f.db.prepare("update relationships set status='stale' where publisher_id=2").run();
  await assert.rejects(syncReviewedData(f.options, dependencies),/missing target parents/);
  await syncReviewedData({...f.options,full:true},dependencies);
  assert.equal((await client.query(`select r.status from sync_ad_network_publisher_relationships r
    join sync_ad_network_publishers p on p.id=r.publisher_id where p.normalized_domain='site2.example'`)).rows[0].status,'stale');
});


test('a committed publisher update is reverted after a later batch fails and the source returns to its old value', async t => {
  const f=syncFixture(t);
  await f.run();
  f.db.prepare("update publishers set platform='WordPress' where id=1").run();
  f.db.prepare("update relationships set status='stale' where publisher_id=2").run();
  f.fail(true);
  await assert.rejects(f.run(),/target failure/);
  assert.equal(f.target.publishers.get('site1.example').platform,'WordPress');
  f.db.prepare('update publishers set platform=null where id=1').run();
  f.fail(false);
  const result=await f.run();
  assert.equal(result.publishers_sent,1);
  assert.equal(f.target.publishers.get('site1.example').platform,null);
});

test('a crash after target commit but before acknowledgement cannot reuse the old hash', t => {
  const f=syncFixture(t),key=syncTargetKey('development','postgresql://localhost/development');
  const before={domain:'site1.example',platform:null},after={...before,platform:'WordPress'};
  let state=openSyncState(f.options.stateFile,key);
  state.acknowledge('publisher',state.changed('publisher',[before],row=>row.domain));
  const changes=state.changed('publisher',[after],row=>row.domain);
  state.invalidate('publisher',changes);
  const target={...after};
  state.close(); // Simulated interruption after the remote commit, before ack.
  state=openSyncState(f.options.stateFile,key);
  try {
    const repair=state.changed('publisher',[before],row=>row.domain);
    assert.equal(repair.length,1);
    Object.assign(target,repair[0].row);
    assert.equal(target.platform,null);
  } finally {state.close();}
});

test('a changed relationship with a missing target parent fails and remains eligible after the parent is repaired', async t => {
  const f=syncFixture(t);
  await f.run();
  const publisher=f.target.publishers.get('site2.example');
  f.target.publishers.delete('site2.example');
  f.db.prepare("update relationships set status='stale' where publisher_id=2").run();
  await assert.rejects(f.run(),/missing target parents/);
  f.target.publishers.set('site2.example',publisher);
  const result=await f.run();
  assert.equal(result.publishers_sent,0);assert.equal(result.relationships_sent,1);
  assert.equal(f.target.relationships.get('mediavine:site2.example').status,'stale');
});

test('compact attribution preserves checker membership and unknown-but-present sources', () => {
  const original=[{source_key:'checker',source_url:'https://local-only.example'}, {source_key:'sellers-json',license_attribution:'large'},null,{}, {source_key:['checker']},{source_key:null}];
  assert.deepEqual(compactDiscoverySources(original),[{source_key:'checker'},{source_key:'sellers-json'},{},{},{source_key:['checker']},{source_key:null}]);
  assert.deepEqual(compactDiscoverySources([]),[]);
});

async function weeklyStatsQuery() {
  let found;
  const query=new Promise(resolve=>{found=resolve;});
  const library=adNetworksLibrary(async sql=>{
    if(sql.includes('having bool_and(jsonb_array_length(discovery_sources)>0)'))found(sql);
    return {rows:[{listed:0,confirmed:0,total:0,checked:0,waiting:0,updated_at:null}]};
  });
  const result=library.getAdNetworkStatsPageData().catch(()=>{});
  const sql=await query;
  await result;
  return sql;
}

test('compact attribution preserves the real weekly chart, and cleanup bounds projection before advancing through unchanged batches', {
  skip:process.env.AD_NETWORKS_TEST_ENVIRONMENT!=='development',timeout:60000,
}, async t=>{
  const pool=new pg.Pool({connectionString:targetDatabaseUrl({environment:'development'}),max:1,connectionTimeoutMillis:15000});
  const client=await pool.connect();
  t.after(async()=>{client.release();await pool.end();});
  await client.query(`create temporary table trim_publishers(id bigint primary key,last_check_evidence jsonb,discovery_sources jsonb);
    create temporary table trim_relationships(ad_network_id bigint,publisher_id bigint,evidence jsonb,primary key(ad_network_id,publisher_id));
    create temporary table trim_events(publisher_id bigint,event text,observed_at timestamptz);
    insert into trim_publishers select id,'{}'::jsonb,'[{"source_key":"checker"}]'::jsonb from generate_series(1,5001) id;
    update trim_publishers set discovery_sources='[{"source_key":"checker","source_url":"https://large.example/raw"},{"source_key":"sellers-json"}]' where id=1;
    update trim_publishers set discovery_sources='[{"source_key":"sellers-json","domain_as_supplied":"Site Two"}]' where id=2;
    update trim_publishers set discovery_sources='[{"unknown_source":"present-but-unclassified"}]',last_check_evidence='[]' where id=5001;
    insert into trim_relationships select 1,id,case when id=5001 then '[]'::jsonb else '{}'::jsonb end from generate_series(1,5001) id;
    insert into trim_events values
      (1,'newly_found',date_trunc('week',now() at time zone 'UTC')-interval '7 days'),
      (2,'newly_found',date_trunc('week',now() at time zone 'UTC')-interval '7 days'),
      (5001,'newly_found',date_trunc('week',now() at time zone 'UTC')-interval '14 days');`);
  const rewrite=sql=>sql.replaceAll('public.ad_network_publishers','pg_temp.trim_publishers')
    .replaceAll('public.ad_network_publisher_relationships','pg_temp.trim_relationships')
    .replaceAll('public.ad_network_relationship_events','pg_temp.trim_events');
  const weekly=await weeklyStatsQuery();
  const chart=async()=>(await client.query(rewrite(weekly))).rows;
  const before=await chart();
  assert.deepEqual(before.map(({discovered,checker})=>({discovered,checker})),[{discovered:1,checker:0},{discovered:1,checker:1}]);
  const source=(await client.query('select id,discovery_sources from trim_publishers where id in (1,2,5001) order by id')).rows;
  const slim=source.map(row=>({...row,discovery_sources:compactDiscoverySources(row.discovery_sources)}));
  await client.query(`update trim_publishers p set discovery_sources=i.discovery_sources
    from jsonb_to_recordset($1::jsonb) i(id bigint,discovery_sources jsonb) where p.id=i.id`,[JSON.stringify(slim)]);
  assert.deepEqual(await chart(),before);
  await client.query('update trim_publishers set discovery_sources=$1::jsonb where id=5001',[JSON.stringify(source.at(-1).discovery_sources)]);
  const cleanup=rewrite(readFileSync(new URL('../../../scripts/ad-networks/trim-production-evidence.sql',import.meta.url),'utf8').replace(/^\\set.*$/gm,''));
  const clean=async()=>{
    const results=await client.query(cleanup);
    return results.flatMap(result=>result.rows);
  };
  // The out-of-range array raises in jsonb_each if either projection reads past
  // the first 5,000 keys. The first batch is already compact and changes no rows.
  let progress=await clean();
  assert.equal(Number(progress[0].publishers_scanned),5000);assert.equal(Number(progress[0].publishers_trimmed),0);
  assert.equal(Number(progress[1].relationships_scanned),5000);assert.equal(Number(progress[1].relationships_trimmed),0);
  await client.query(`update trim_publishers set last_check_evidence='{"raw":"large"}' where id=5001;
    update trim_relationships set evidence='{"raw":"large"}' where publisher_id=5001;`);
  progress=await clean();
  assert.equal(Number(progress[0].publishers_scanned),1);assert.equal(Number(progress[0].publishers_trimmed),1);
  assert.equal(Number(progress[1].relationships_scanned),1);assert.equal(Number(progress[1].relationships_trimmed),1);
  assert.deepEqual(await chart(),before);
  progress=await clean();
  assert.equal(Number(progress[0].publishers_scanned),0);assert.equal(Number(progress[1].relationships_scanned),0);
});
