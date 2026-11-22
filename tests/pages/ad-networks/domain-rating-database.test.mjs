import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import pg from 'pg';
import { executeTool, domainRatingBucket } from '../../../lib/data-api/ad-networks/core.ts';

let devEnv = {};
try { devEnv = parseEnv(readFileSync(new URL('../../../.env.local', import.meta.url), 'utf8')); } catch { /* Optional development check. */ }
const connection = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
const devConnection = devEnv.DATABASE_POOLER_URL || devEnv.DATABASE_URL;
const live = process.env.STACK127_DR_INTEGRATION === 'true' && connection === devConnection
  && devEnv.SUPABASE_URL === 'https://yzasonowwlvritqicatj.supabase.co';

test('development DR schema, cache projection, private views and all API queries; rollback leaves no changes', {skip:!live}, async () => {
  const client = new pg.Client({connectionString:connection,connectionTimeoutMillis:15000,query_timeout:120000});
  await client.connect();
  try {
    // Apply the migration separately: its validation must start after the DDL commits.
    // Only test fixtures belong in this rolled-back transaction.
    await client.query('begin');
    const constraint=(await client.query("select convalidated from pg_constraint where conrelid='public.ad_network_publishers'::regclass and conname='ad_network_publishers_domain_rating_check'")).rows[0];
    assert.equal(constraint?.convalidated,true);
    await client.query('set local search_path=pg_temp,stack127_data,public');
    const sync=(await client.query(`select domain_rating,domain_rating_checked_on::text from jsonb_populate_recordset(null::public.ad_network_publishers,
      '[{\"domain_rating\":0,\"domain_rating_checked_on\":\"2026-11-14\"}]'::jsonb)`)).rows[0];
    assert.deepEqual(sync,{domain_rating:0,domain_rating_checked_on:'2026-11-14'});
    const before = (await client.query('select revision from public.stack127_ad_network_source_revision')).rows[0].revision;
    await client.query(`update public.ad_network_publishers set domain_rating=42,domain_rating_checked_on=current_date
      where id=(select min(id) from public.ad_network_publishers)`);
    assert.equal((await client.query('select revision from public.stack127_ad_network_source_revision')).rows[0].revision,before,
      'DR-only updates must not queue a frontend refresh or change the source revision');
    const projection = (await client.query(`select
      public.stack127_directory_record_value('ad_network_publishers','{"id":1,"domain_rating":1,"domain_rating_checked_on":"2026-01-01","platform":"A"}') =
      public.stack127_directory_record_value('ad_network_publishers','{"id":1,"domain_rating":99,"domain_rating_checked_on":"2026-11-14","platform":"A"}') as same,
      public.stack127_directory_record_value('ad_network_publishers','{"id":1,"platform":"A"}') <>
      public.stack127_directory_record_value('ad_network_publishers','{"id":1,"platform":"B"}') as other_changes`)).rows[0];
    assert.equal(projection.same,true);assert.equal(projection.other_changes,true);
    const reader={query:async(sql,values)=>(await client.query(sql,values)).rows};
    const transaction=async work=>work(reader);
    const real=await executeTool('find_sites',{limit:1},transaction);
    assert.ok(Object.hasOwn(real.data.sites[0],'domain_rating'));
    assert.ok(Object.hasOwn(real.data.sites[0],'domain_rating_checked_on'));
    const anon=(await client.query("select has_table_privilege('anon','stack127_data.ad_network_publishers','SELECT') as allowed")).rows[0];
    assert.equal(anon.allowed,false);
    await client.query(`create temp table ad_network_publishers as select * from stack127_data.ad_network_publishers where false;
      create temp table ad_networks as select * from stack127_data.ad_networks where false;
      create temp table ad_network_publisher_relationships as select * from stack127_data.ad_network_publisher_relationships where false;
      create temp table ad_network_relationship_events as select * from stack127_data.ad_network_relationship_events where false;
      create temp table ad_network_daily_counts as select * from stack127_data.ad_network_daily_counts where false;
      insert into ad_networks(id,slug,name) values(1,'test-a','Test A'),(2,'test-b','Test B'),(3,'test-empty','Empty');`);
    const ratings=[0,9,10,19,20,29,30,49,50,69,70,100,null];
    for(const [i,value] of ratings.entries()) {
      await client.query(`insert into ad_network_publishers(id,normalized_domain,domain_rating,domain_rating_checked_on)
        values($1,$2,$3,case when $3::int is not null then current_date end)`,[i+1,`site${i+1}.example`,value]);
      await client.query(`insert into ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type)
        values(1,$1,'confirmed','primary_or_exclusive_manager')`,[i+1]);
    }
    await client.query(`insert into ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type)
      values(2,1,'stale','primary_or_exclusive_manager'),(2,13,'confirmed','active_network_use');`);
    const buckets=(await reader.query(`select ${domainRatingBucket} as bucket,count(*)::int as count from ad_network_publishers p group by 1`));
    assert.deepEqual(Object.fromEntries(buckets.map(r=>[r.bucket,r.count])),{'0–9':2,'10–19':2,'20–29':2,'30–49':2,'50–69':2,'70–100':2,unknown:1});
    const grouped=await executeTool('count_sites',{group_by:['domain_rating']},transaction);
    assert.equal(grouped.data.total,13);assert.equal(grouped.data.domain_rating_coverage.sites_with_rating,12);
    assert.equal(grouped.data.rows.reduce((sum,r)=>sum+r.count,0),13);
    const compare=await executeTool('compare_ad_networks',{networks:['test-a','test-b'],dimension:'domain_rating'},transaction);
    assert.deepEqual(compare.data.network_domain_rating_coverage['test-b'],{sites_with_rating:1,total_sites:2});
    assert.equal(compare.data.total,13);assert.equal(compare.data.network_bases['test-b'],2);
    const filtered=await executeTool('count_sites',{min_domain_rating:30,max_domain_rating:69},transaction);
    assert.equal(filtered.data.total,4);
    const zero=await executeTool('find_sites',{min_domain_rating:0,max_domain_rating:0},transaction);
    assert.equal(zero.data.sites.length,1);assert.equal(zero.data.sites[0].domain_rating,0);
    const lookup=await executeTool('lookup_site',{domain:'site13.example'},transaction);
    assert.equal(lookup.data.site.domain_rating,null);assert.equal(lookup.data.site.domain_rating_checked_on,null);
    const networks=await executeTool('list_ad_networks',{},transaction);
    const n=networks.data.networks.find(n=>n.slug==='test-a');
    assert.equal(n.domain_rating_base,12);assert.equal(n.median_domain_rating,29.5);
    assert.ok(Math.abs(n.average_domain_rating-ratings.filter(r=>r!==null).reduce((a,b)=>a+b,0)/12)<1e-10);
    const empty=networks.data.networks.find(n=>n.slug==='test-empty');
    assert.equal(empty.domain_rating_base,0);assert.equal(empty.median_domain_rating,null);assert.equal(empty.average_domain_rating,null);
    const profile=await executeTool('get_ad_network',{network:'test-a'},transaction);
    assert.equal(profile.data.network.domain_rating_base,12);
    assert.equal(profile.data.distributions.domain_rating.total,13);
    for(const answer of [real,grouped,compare,filtered,zero,lookup,networks,profile]) {
      assert.equal(answer.data.domain_rating_metadata.attribution,'Domain Rating by Ahrefs');
      assert.equal(answer.data.domain_rating_metadata.url,'https://ahrefs.com');
      assert.ok(Number.isInteger(answer.data.domain_rating_metadata.coverage.sites_with_rating));
    }
  } finally { await client.query('rollback'); await client.end(); }
});

test('DR schema guards allow reruns, reject wrong types, and validate after releasing the exclusive lock', {skip:!live}, async()=>{
  const client=new pg.Client({connectionString:connection,connectionTimeoutMillis:15000,query_timeout:120000});
  await client.connect();
  const migration=readFileSync(new URL('../../../supabase/migrations/20261114130000_ad_network_domain_rating.sql',import.meta.url),'utf8');
  // Exercise the exact column/constraint SQL on disposable development tables.
  // Views and source-revision functions are covered by the integration test above.
  const ddl=migration.split('comment on column')[0].replaceAll('public.ad_network_publishers','pg_temp.dr_guard_test');
  const validation=migration.slice(migration.indexOf('-- Release ACCESS EXCLUSIVE')).replaceAll('public.ad_network_publishers','pg_temp.dr_guard_test');
  try {
    await client.query('create temp table dr_guard_test(id integer); insert into dr_guard_test values(1)');
    await client.query(ddl);
    const constraint=()=>client.query("select convalidated from pg_constraint where conrelid='pg_temp.dr_guard_test'::regclass and conname='ad_network_publishers_domain_rating_check'");
    assert.equal((await constraint()).rows[0].convalidated,false);
    await client.query('commit');
    await client.query(validation.replace(/commit;\s*$/,''));
    assert.equal((await constraint()).rows[0].convalidated,true);
    const locks=(await client.query("select mode from pg_locks where pid=pg_backend_pid() and relation='pg_temp.dr_guard_test'::regclass")).rows.map(row=>row.mode);
    assert.ok(locks.includes('ShareUpdateExclusiveLock'));
    assert.ok(!locks.includes('AccessExclusiveLock'));
    await client.query('commit');
    await client.query(ddl+'commit;'); await client.query(validation);
    assert.equal((await constraint()).rows[0].convalidated,true);
    assert.equal((await client.query('select count(*)::int as total from dr_guard_test')).rows[0].total,1);
    await assert.rejects(client.query('insert into dr_guard_test(domain_rating) values(101)'),/ad_network_publishers_domain_rating_check/);
    for(const columns of ['domain_rating text','domain_rating integer,domain_rating_checked_on text']) {
      await client.query(`drop table dr_guard_test;create temp table dr_guard_test(${columns})`);
      await assert.rejects(client.query(ddl),/has type text, expected (integer|date)/);
      await client.query('rollback');
    }
  }finally{await client.query('rollback').catch(()=>{});await client.end();}
});
