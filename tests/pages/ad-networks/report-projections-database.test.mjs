import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {deriveManagedBy} from '../../../lib/ad-network-site-facts.mjs';

const connectionString=process.env.DATABASE_POOLER_URL||process.env.DATABASE_URL;
test('compact database projections preserve manager resolution and ambiguity', {skip:!connectionString}, async()=>{
  const networks=[{slug:'a',name:'A',manager_domains:['a.example','a-alt.example']},
    {slug:'b',name:'B',manager_domains:['b.example']}];
  const manager=(slug,evidence,status='confirmed')=>({slug,status,relationship_type:'primary_or_exclusive_manager',evidence});
  const cases=[
    {evidence:{manager_domains:[' A.EXAMPLE. ']},relationships:[]},
    {evidence:{manager_domains:[{value:'a.example'},'a.example']},relationships:[]},
    {evidence:{manager_domains:['a.example','b.example']},relationships:[]},
    {evidence:{manager_domains:[12,{value:12}]},relationships:[manager('a',{manager_domain:'a.example'})]},
    {evidence:{},relationships:[manager('a',{matched_signal:'MANAGERDOMAIN = A.EXAMPLE.'})]},
    {evidence:{manager_domains:['x'.repeat(300)]},relationships:[]},
    {evidence:{manager_domains:['x'.repeat(300),'y'.repeat(300)]},relationships:[]},
    {evidence:{},relationships:[manager('a',{}),manager('b',{})]},
    {evidence:{},relationships:[manager('a',{manager_domain:'a.example'},'ended')]},
    {evidence:{},relationships:[manager('a',{manager_domain:'b.example'})]},
    {evidence:{},relationships:[manager('a',{manager_domain:12,matched_signal:'MANAGERDOMAIN=a.example'})]},
    {evidence:{},relationships:[manager('a',{manager_domain:'x'.repeat(300)})]},
  ].map((row,id)=>({...row,id}));
  const pool=new pg.Pool({connectionString,max:1,connectionTimeoutMillis:15000,query_timeout:15000});
  try {
    const rows=(await pool.query(`select x.id,public.stack127_ad_network_report_manager_domains(x.evidence) as domains,
      coalesce((select jsonb_agg(r || jsonb_build_object('evidence',jsonb_build_object('manager_domain',
        public.stack127_ad_network_report_retained_manager(r->'evidence')))) from jsonb_array_elements(x.relationships) r),'[]') as relationships
      from jsonb_to_recordset($1::jsonb) x(id int,evidence jsonb,relationships jsonb) order by x.id`,[JSON.stringify(cases)])).rows;
    const meaning=result=>({manager:result.managed_by?.slug??null,named:Boolean(result.managed_by||result.manager_domain)});
    for(const row of rows){
      const original=cases[row.id];
      assert.deepEqual(meaning(deriveManagedBy({manager_domains:row.domains},networks,row.relationships)),
        meaning(deriveManagedBy(original.evidence,networks,original.relationships)),`case ${row.id}`);
      assert.ok(Buffer.byteLength(JSON.stringify(row.domains))<1024);
    }
  } finally {await pool.end();}
});

test('domain-age SQL keeps each network histogram, distinct market sites and exact endpoint ties', {skip:!connectionString}, async()=>{
  const {adNetworksLibrary}=await import('./loader-harness.mjs');
  const client=new pg.Client({connectionString,connectionTimeoutMillis:15000,query_timeout:15000,
    options:'-c default_transaction_read_only=on'});
  const fixtures=`with fixture_publishers(id,normalized_domain,niche,domain_created_on) as (values
    (1,'a.example','food','2000-01-01'::date),(2,'b.example','food','2010-06-01'::date),
    (3,'c.example','tech','2020-12-31'::date),(4,'unknown.example','food',null::date),
    (5,'ended.example','food','1980-01-01'::date),(6,'z.example','food','2000-01-01'::date)),
    fixture_networks(id,slug,name) as (values (1,'a','A'),(2,'b','B'),(3,'empty','Empty')),
    fixture_relationships(publisher_id,ad_network_id,status) as (values
      (1,1,'confirmed'),(1,2,'stale'),(2,1,'stale'),(3,2,'confirmed'),
      (4,1,'confirmed'),(5,1,'ended'),(6,1,'confirmed')),`;
  const plain=value=>JSON.parse(JSON.stringify(value));
  try {
    await client.connect();
    const library=adNetworksLibrary((sql,args)=>client.query(fixtures+sql.replace(/^with /,'')
      .replaceAll('public.ad_network_publishers','fixture_publishers')
      .replaceAll('public.ad_network_publisher_relationships','fixture_relationships')
      .replaceAll('public.ad_networks','fixture_networks'),args));
    const market=await library.loadAdNetworkDomainAgeStrip();
    assert.equal(market.measured,4);
    assert.deepEqual(plain(market.bins),[{year:2000,count:2},{year:2010,count:1},{year:2020,count:1}]);
    assert.equal(market.median_year,2005);
    assert.equal(market.oldest.domain,'a.example');
    assert.equal(market.newest.domain,'c.example');
    const networks=await library.loadAdNetworkDomainAgeByNetwork();
    assert.deepEqual(Array.from(networks,n=>n.slug),['a','b']);
    assert.deepEqual(plain(networks[0].strip.bins),[{year:2000,count:2},{year:2010,count:1}]);
    assert.deepEqual(plain(networks[1].strip.bins),[{year:2000,count:1},{year:2020,count:1}]);
    assert.deepEqual(Array.from(await library.loadAdNetworkDomainAgeByNetwork('food'),n=>n.strip.measured),[3,1]);
    assert.equal((await library.loadAdNetworkDomainAgeStrip('b','food')).measured,1);
    assert.equal(await library.loadAdNetworkDomainAgeStrip('empty'),null);
  } finally {await client.end();}
});

test('weekly discovery SQL counts first discoveries once and hides weeks missing source attribution', {skip:!connectionString}, async()=>{
  const {adNetworksLibrary}=await import('./loader-harness.mjs');
  const client=new pg.Client({connectionString,connectionTimeoutMillis:15000,query_timeout:15000,
    options:'-c default_transaction_read_only=on'});
  const fixtures=`with fixture_clock as (
      select date_trunc('week',now() at time zone 'UTC') at time zone 'UTC' as week_start
    ), fixture_publishers(id,discovery_sources) as (values
      (1,'[{"source_key":"scan"}]'::jsonb),(2,'[{"source_key":"checker"},{"source_key":"scan"}]'::jsonb),
      (3,'[]'::jsonb),(4,'[{"source_key":"checker"}]'::jsonb),(5,'[{"source_key":"scan"}]'::jsonb),
      (6,'[{"source_key":"scan"}]'::jsonb),(7,'[{"source_key":"scan"}]'::jsonb)),
    fixture_events as (
      select publisher_id,event,week_start+delta as observed_at from fixture_clock cross join (values
        (1,'baseline','-100 days'::interval),(1,'newly_found','-6 days'::interval),
        (1,'newly_found','-5 days'::interval),(2,'newly_found','-4 days'::interval),
        (3,'newly_found','-13 days'::interval),(4,'newly_found','-12 days'::interval),
        (5,'newly_found','-100 days'::interval),(5,'newly_found','-3 days'::interval),
        (6,'newly_found','1 day'::interval),(7,'baseline','-3 days'::interval)
      ) events(publisher_id,event,delta)
    ),`;
  try {
    await client.connect();
    const library=adNetworksLibrary((sql,args)=>client.query(fixtures+sql.replace(/^with /,'')
      .replaceAll('public.ad_network_publishers','fixture_publishers')
      .replaceAll('public.ad_network_relationship_events','fixture_events'),args));
    const rows=JSON.parse(JSON.stringify(await library.loadAdNetworkWeeklyDiscoveries()));
    const {week}=(await client.query(`select (date_trunc('week',now() at time zone 'UTC')-interval '7 days')::date::text as week`)).rows[0];
    assert.deepEqual(rows,[{week,discovered:1,checker:1}]);
  } finally {await client.end();}
});
