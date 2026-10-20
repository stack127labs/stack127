import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {captureNetworkObservations,classifyNetworkArrivals} from '../../../scripts/ad-networks/movements.mjs';

// CI does not set AD_NETWORKS_MOVEMENTS_TEST_DATABASE_URL, so this test is
// opt-in and skips there. Run it explicitly against a disposable PostgreSQL DB.
// Opt in to any disposable test connection. Both queries use ONLY transaction-local
// temporary fixtures; no public data, observations, events or triggers are touched.
const connectionString=process.env.AD_NETWORKS_MOVEMENTS_TEST_DATABASE_URL;
const originalQuery=`select p.id::text,p.last_checked_at::text as checked_at,
      o.checked_at::text as previous_checked_at,o.confirmed_network_ids as previous_network_ids,
      array(select n.id::text from public.ad_networks n
        where coalesce(p.last_check_evidence->'confirmed_networks','[]'::jsonb) ? n.slug order by n.id) as network_ids,
      array(select distinct e.ad_network_id::text from public.ad_network_relationship_events e
        where e.publisher_id=p.id and e.event in ('baseline','newly_found','joined')) as known_network_ids,
      array(select r.ad_network_id::text from public.ad_network_publisher_relationships r
        where r.publisher_id=p.id and r.first_confirmed_at<p.last_checked_at) as established_network_ids,
      array(select e.ad_network_id::text from (
        select distinct on (e.ad_network_id) e.ad_network_id,e.event
        from public.ad_network_relationship_events e where e.publisher_id=p.id and e.observed_at<p.last_checked_at
        order by e.ad_network_id,e.observed_at desc,case when e.event='left' then 0 else 1 end desc
      ) e where e.event='left') as departed_network_ids,
      exists(select 1 from public.ad_network_relationship_events e where e.publisher_id=p.id) as known_site
      from public.ad_network_publishers p left join public.ad_network_check_observations o on o.publisher_id=p.id
      where p.id>$1::bigint and p.last_check_outcome in ('matched','no_match','no_ads_txt','not_modified')
        and p.last_checked_at=p.last_successful_check_at
        and (o.publisher_id is null or p.last_checked_at>o.checked_at)
        and exists(select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id
          and (r.status in ('confirmed','stale') or (r.status='ended' and r.first_confirmed_at is not null)))
      order by p.id limit $2`;
const temporary=sql=>sql.replaceAll(/public\.(ad_network_[a-z_]+|ad_networks)\b/g,'pg_temp.$1');
const normalize=rows=>rows.map(row=>({...row,
  ...Object.fromEntries(['known_network_ids','established_network_ids','departed_network_ids']
    .map(key=>[key,[...row[key]].sort()])),
}));
const arrivals=rows=>rows.map(row=>classifyNetworkArrivals(
  row.previous_checked_at?{checked_at:row.previous_checked_at,network_ids:row.previous_network_ids.map(String)}:null,
  {checked_at:row.checked_at,network_ids:row.network_ids},row));

test('batched observation query matches the original selection and arrival history', {skip:!connectionString}, async()=>{
  const client=new pg.Client({connectionString,connectionTimeoutMillis:15000,query_timeout:30000});
  await client.connect();
  try {
    await client.query('begin');
    await client.query(`
      create temporary table ad_networks(id bigint primary key,slug text) on commit drop;
      create temporary table ad_network_publishers(id bigint primary key,last_checked_at timestamptz,
        last_successful_check_at timestamptz,last_check_outcome text,last_check_evidence jsonb) on commit drop;
      create temporary table ad_network_check_observations(publisher_id bigint primary key,checked_at timestamptz,
        confirmed_network_ids bigint[]) on commit drop;
      create temporary table ad_network_publisher_relationships(publisher_id bigint,ad_network_id bigint,
        status text,first_confirmed_at timestamptz) on commit drop;
      create temporary table ad_network_relationship_events(publisher_id bigint,ad_network_id bigint,event text,
        observed_at timestamptz) on commit drop;
      insert into ad_networks values(1,'a'),(2,'b'),(3,'c');
      insert into ad_network_publishers
        select id,'2026-01-10','2026-01-10','matched','{}'::jsonb from generate_series(1,14) id;
      update ad_network_publishers set last_check_evidence='{"confirmed_networks":["b","a","a","unknown"]}' where id=1;
      update ad_network_publishers set last_check_outcome='no_match',last_check_evidence=null where id=2;
      update ad_network_publishers set last_check_outcome='no_ads_txt' where id=3;
      update ad_network_publishers set last_check_outcome='not_modified',last_check_evidence='{"confirmed_networks":{"a":true}}' where id=4;
      update ad_network_publishers set last_check_outcome='failed' where id=5;
      update ad_network_publishers set last_successful_check_at='2026-01-09' where id=6;
      update ad_network_publishers set last_checked_at=null,last_successful_check_at=null where id=12;
      update ad_network_publishers set last_check_evidence='{"confirmed_networks":null}' where id=13;
      update ad_network_publishers set last_check_evidence='{"confirmed_networks":["c"]}' where id=14;
      insert into ad_network_check_observations values
        (2,'2026-01-08',array[1,2]),(7,'2026-01-10',array[1]),(8,'2026-01-11',array[1]);
      insert into ad_network_publisher_relationships
        select id,1,'confirmed','2026-01-01' from generate_series(1,14) id where id<>11;
      insert into ad_network_publisher_relationships values
        (1,2,'stale','2026-01-10'),(14,2,'needs_review','2026-01-01');
      update ad_network_publisher_relationships set status='ended' where publisher_id in(3,9);
      update ad_network_publisher_relationships set first_confirmed_at=null where publisher_id in(4,9);
      update ad_network_publisher_relationships set status='needs_review' where publisher_id=10;
      insert into ad_network_relationship_events values
        (1,1,'baseline','2026-01-01'),(1,1,'left','2026-01-09'),
        (1,2,'left','2026-01-08'),(1,2,'joined','2026-01-08'),
        (1,3,'joined','2026-01-11'),(1,3,'left','2026-01-10'),
        (14,3,'left','2026-01-09'),(5,1,'baseline','2026-01-01');
    `);
    let optimizedQuery;
    await captureNetworkObservations({query:async sql=>{optimizedQuery=sql;return {rows:[]};}});
    const select=async(query,after='0',limit=500)=>(await client.query(temporary(query),[after,limit])).rows;
    const expected=await select(originalQuery);
    const actual=await select(optimizedQuery);
    assert.deepEqual(actual.map(row=>row.id),['1','2','3','4','13','14']);
    assert.deepEqual(normalize(actual),normalize(expected));
    assert.deepEqual(arrivals(actual),arrivals(expected));
    assert.deepEqual(actual[0].network_ids,['1','2']);
    assert.deepEqual([...actual[0].departed_network_ids],['1']);
    assert.deepEqual([...actual[0].known_network_ids].sort(),['1','2','3']);
    assert.equal(actual[1].previous_network_ids.length,2);
    assert.deepEqual(actual[2].network_ids,[]);
    assert.deepEqual(actual[3].network_ids,['1']);
    assert.deepEqual(actual.at(-1).established_network_ids.sort(),['1','2']);
    assert.deepEqual(arrivals(actual)[0],[{network_id:'1',event:'baseline'}]);
    // Keyset pages must filter eligibility before LIMIT, including a gap of
    // failed/unchanged/unreviewed rows, and must terminate after the last row.
    let after='0';const paged=[];
    while(true){
      const old=await select(originalQuery,after,2),next=await select(optimizedQuery,after,2);
      assert.deepEqual(normalize(next),normalize(old));
      if(!next.length)break;
      paged.push(...next);after=next.at(-1).id;
    }
    assert.deepEqual(normalize(paged),normalize(expected));
  } finally {
    await client.query('rollback').catch(()=>{});
    await client.end();
  }
});
