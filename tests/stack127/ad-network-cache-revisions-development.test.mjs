import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {resolveDatabaseUrl} from '../../scripts/stack127/tool-pages/lib.mjs';

const enabled=process.env.STACK127_TEST_DEVELOPMENT_DATABASE==='1';

test('ad-network source revisions track public changes and roll back with their sources', {skip:!enabled}, async t=>{
  const client=new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000});
  await client.connect();
  const network=-927001, publisher=-927001;
  const slugs=['cache-revision-test','cache-revision-peer','all'];
  const revisions=async(types=['ad_networks'],selected=slugs)=>(await client.query(
    'select * from public.stack127_cache_source_revisions($1::text[],$2::text[]) order by entity_type,slug',[types,selected])).rows;
  async function changes(sql,args=[]){
    const before=await revisions();
    await client.query(sql,args);
    const after=await revisions();
    assert.deepEqual(after.map(row=>[row.entity_type,row.slug]),before.map(row=>[row.entity_type,row.slug]));
    for(let index=0;index<before.length;index++) assert.notEqual(after[index].fingerprint,before[index].fingerprint,before[index].slug);
    assert.ok((await client.query("select 1 from public.stack127_revalidation_events where entity_type='ad_networks' and slug='all'")).rowCount);
  }
  async function unchanged(sql,args=[]){
    const before=await revisions();
    await client.query(sql,args);
    assert.deepEqual(await revisions(),before);
  }
  try {
    await client.query('begin');
    await client.query("set local statement_timeout='30s'");
    await client.query("set local lock_timeout='5s'");
    await client.query('set local role service_role');
    await client.query(`insert into public.ad_networks(id,slug,name,official_url) overriding system value
      values($1,'cache-revision-test','Cache revision test','https://cache-revision.example'),
        ($2,'cache-revision-peer','Cache revision peer','https://cache-revision-peer.example')`,[network,network-1]);

    await t.test('keeps the API shape and filters, including the shared all revision',async()=>{
      const rows=await revisions();
      assert.equal(rows.length,3);
      for(const row of rows){
        assert.equal(row.entity_type,'ad_networks');
        assert.match(row.fingerprint,/^[a-f0-9]{32}$/);
      }
      assert.deepEqual(await revisions(['page'],slugs),[]);
      assert.deepEqual(await revisions(['ad_networks'],['missing-cache-revision-test']),[]);
      assert.deepEqual(await revisions(['ad_networks'],[]),[]);
      assert.deepEqual(await revisions([],slugs),[]);
      assert.deepEqual((await revisions(null,['all'])).filter(row=>row.entity_type==='ad_networks'),
        await revisions(['ad_networks'],['all']));
    });

    await t.test('source writers can read revisions but cannot remove their durable state',async()=>{
      for(const sql of ['delete from public.stack127_ad_network_source_revision','truncate public.stack127_ad_network_source_revision']){
        await client.query('savepoint protected_revision');
        try {await assert.rejects(client.query(sql),error=>error.code==='42501');}
        finally {await client.query('rollback to savepoint protected_revision');}
      }
    });

    await t.test('network facts and unlinked candidate coverage change every network revision',async()=>{
      await changes("update public.ad_networks set summary='New visible summary' where id=$1",[network]);
      await changes(`insert into public.ad_network_publishers(id,normalized_domain,display_domain) overriding system value
        values($1,'cache-revision.example','cache-revision.example')`,[publisher]);
      await changes("update public.ad_network_publishers set niche='tech' where id=$1",[publisher]);
    });

    await t.test('leases, retry bookkeeping, identical writes, and empty statements keep revisions stable',async()=>{
      await unchanged('update public.ad_network_publishers set lease_until=now(),next_check_at=now(),check_attempt_count=check_attempt_count+1 where id=$1',[publisher]);
      await unchanged('update public.ad_network_publishers set display_domain=display_domain where id=$1',[publisher]);
      await unchanged('update public.ad_networks set name=name where id=$1',[network]);
      await unchanged('update public.ad_network_publishers set niche=null where false');
      await unchanged('delete from public.ad_network_publishers where false');
      await unchanged(`insert into public.ad_network_publishers(normalized_domain,display_domain)
        select 'never-inserted.example','never-inserted.example' where false`);
    });

    await t.test('relationship state, verification method, and manager evidence change revisions',async()=>{
      await changes(`insert into public.ad_network_publisher_relationships
        (ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at)
        values($1,$2,'confirmed','active_network_use','live_configuration',
          '{"checked_url":"https://cache-revision.example","checked_at":"2026-10-19","matched_signal":"test","parser_version":"test"}',now(),now())`,[network,publisher]);
      await unchanged('update public.ad_network_publisher_relationships set updated_at=now(),evidence=evidence || \'{"private_debug":"ignored"}\'::jsonb where ad_network_id=$1 and publisher_id=$2',[network,publisher]);
      await changes("update public.ad_network_publisher_relationships set verification_method='ads_txt' where ad_network_id=$1 and publisher_id=$2",[network,publisher]);
      await changes(`update public.ad_network_publisher_relationships set evidence=evidence || '{"manager_domain":"manager.example"}'::jsonb
        where ad_network_id=$1 and publisher_id=$2`,[network,publisher]);
      await changes("update public.ad_network_publisher_relationships set status='stale' where ad_network_id=$1 and publisher_id=$2",[network,publisher]);
      await changes(`update public.ad_network_publishers set last_check_evidence='{"manager_domains":["manager.example"]}'::jsonb
        where id=$1`,[publisher]);
      await changes(`update public.ad_network_publishers set ads_txt_summary=
        '{"lines":2,"companies":1,"direct":1,"reseller":1,"invalid":0,"top_sellers":[]}'::jsonb where id=$1`,[publisher]);
    });

    await t.test('daily counts and retained relationship history cover inserts, updates, and deletes',async()=>{
      await changes(`insert into public.ad_network_daily_counts(ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count)
        values($1,'2026-01-01',1,1,0)`,[network]);
      await changes("update public.ad_network_daily_counts set confirmed_count=0,stale_count=1 where ad_network_id=$1",[network]);
      await changes("delete from public.ad_network_daily_counts where ad_network_id=$1",[network]);
      await changes(`insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
        values($1,$2,'joined','2026-01-01','active_network_use')`,[network,publisher]);
      await changes("update public.ad_network_relationship_events set relationship_type='primary_or_exclusive_manager' where ad_network_id=$1 and publisher_id=$2",[network,publisher]);
      await changes('delete from public.ad_network_relationship_events where ad_network_id=$1 and publisher_id=$2',[network,publisher]);
      await changes('delete from public.ad_network_publisher_relationships where ad_network_id=$1 and publisher_id=$2',[network,publisher]);
      await changes('delete from public.ad_network_publishers where id=$1',[publisher]);
    });

    await t.test('restoring values still records a write, while rollback restores the original revision',async()=>{
      const before=await revisions();
      await client.query('savepoint source_change');
      await changes("update public.ad_networks set summary='Temporary summary' where id=$1",[network]);
      await changes("update public.ad_networks set summary='New visible summary' where id=$1",[network]);
      assert.notDeepEqual(await revisions(),before);
      await client.query('rollback to savepoint source_change');
      assert.deepEqual(await revisions(),before);
    });

    await t.test('renamed and deleted networks retain the existing missing-slug behavior',async()=>{
      const before=await revisions(['ad_networks'],['all']);
      await client.query("update public.ad_networks set slug='cache-revision-renamed' where id=$1",[network]);
      assert.deepEqual(await revisions(['ad_networks'],['cache-revision-test']),[]);
      assert.equal((await revisions(['ad_networks'],['cache-revision-renamed'])).length,1);
      await client.query('delete from public.ad_networks where id=$1',[network]);
      assert.deepEqual(await revisions(['ad_networks'],['cache-revision-renamed']),[]);
      assert.notDeepEqual(await revisions(['ad_networks'],['all']),before);
    });

    // Full source truncations are checked in a separate rollback below.
  } finally {await client.query('rollback');await client.end();}
});

test('ad-network source truncations invalidate revisions, including when all networks disappear', {skip:!enabled}, async()=>{
  const client=new pg.Client({connectionString:resolveDatabaseUrl({environment:'development'}),connectionTimeoutMillis:15000});
  await client.connect();
  const fingerprint=async()=>(await client.query("select fingerprint from public.stack127_cache_source_revisions(array['ad_networks'],array['all'])")).rows[0].fingerprint;
  try {
    await client.query('begin');
    await client.query("set local lock_timeout='5s'");
    await client.query("set local statement_timeout='30s'");
    // Acquire these locks together to avoid racing development collectors.
    await client.query(`lock table public.ad_networks,public.ad_network_publishers,public.ad_network_publisher_relationships,
      public.ad_network_daily_counts,public.ad_network_relationship_events in access exclusive mode`);
    const initial=await fingerprint();
    await client.query('savepoint truncate_sources');
    for(const table of ['ad_network_daily_counts','ad_network_relationship_events','ad_network_publisher_relationships']){
      const before=await fingerprint();
      await client.query(`truncate public.${table}`);
      assert.notEqual(await fingerprint(),before,table);
    }
    const before=await fingerprint();
    await client.query(`truncate public.ad_networks,public.ad_network_publishers,public.ad_network_publisher_relationships,
      public.ad_network_daily_counts,public.ad_network_relationship_events cascade`);
    assert.notEqual(await fingerprint(),before);
    assert.equal((await client.query("select * from public.stack127_cache_source_revisions(array['ad_networks'])")).rowCount,1);
    await client.query('rollback to savepoint truncate_sources');
    assert.equal(await fingerprint(),initial);
  } finally {await client.query('rollback');await client.end();}
});
