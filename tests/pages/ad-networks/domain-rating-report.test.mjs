import { AHREFS_ATTRIBUTION } from "../../../lib/ahrefs.ts";
import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {
  AD_NETWORK_DR_GATE, adNetworkDomainRatingReport, adNetworkSiteAvailability, hasAdNetworkDomainRatingCoverage,
} from '../../../lib/ad-networks-report.ts';
import {AdNetworkInputError, parseAdNetworkSitesParams} from '../../../app/api/ad-networks/input.ts';
import {adNetworksLibrary} from './loader-harness.mjs';

const coverage={listed:1000,classified:0,traffic:0,age:0,platform:0,publisher:0,checked:0,manager:0,niches:[],networks:[]};
const summary=(slug,listed,rated,median,average)=>({slug,name:slug,listed,rated,median,average});

test('the sites API accepts only the DR steps and the two DR sorts',()=>{
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams()).minDr,null);
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams('network=raptive&dr=30')).minDr,30);
  for(const step of [10,20,30,50,70])assert.equal(parseAdNetworkSitesParams(new URLSearchParams(`dr=${step}`)).minDr,step);
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams('sort=highest-dr')).sort,'highest-dr');
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams('sort=lowest-dr')).sort,'lowest-dr');
  // One cache key per view: no near-duplicates of a step, no repeats, no blanks.
  for(const query of ['dr=31','dr=030','dr=30.0','dr=','dr=0','dr=100','dr=30&dr=30','sort=dr'])
    assert.throws(()=>parseAdNetworkSitesParams(new URLSearchParams(query)),AdNetworkInputError,query);
});

test('DR column, sorts and filter appear only once sites in scope are rated',()=>{
  for(const rated of [undefined,0]) {
    const none=adNetworkSiteAvailability({...coverage,rated});
    assert.ok(!none.availableColumns.includes('domain_rating'));
    assert.ok(!none.availableSorts.includes('highest-dr'));
    assert.ok(!none.availableFilters.includes('domain_rating'));
  }
  const some=adNetworkSiteAvailability({...coverage,rated:1});
  assert.ok(some.availableColumns.includes('domain_rating'));
  assert.deepEqual(some.availableSorts.filter(sort=>sort.endsWith('-dr')),['highest-dr','lowest-dr']);
  assert.ok(some.availableFilters.includes('domain_rating'));
});

test('the DR block hides below the gate on rated sites and coverage',()=>{
  assert.deepEqual(AD_NETWORK_DR_GATE,{minRated:20,minShare:0.25});
  assert.equal(hasAdNetworkDomainRatingCoverage(19,19),false);
  assert.equal(hasAdNetworkDomainRatingCoverage(20,81),false);
  assert.equal(hasAdNetworkDomainRatingCoverage(20,80),true);
  assert.equal(hasAdNetworkDomainRatingCoverage(0,0),false);
  assert.equal(adNetworkDomainRatingReport('raptive',[summary('raptive',1000,249,30,30)],[{min:30,count:249}]),null);
  assert.equal(adNetworkDomainRatingReport('missing',[summary('raptive',100,100,30,30)],[]),null);
});

test('the DR block bands sites, marks the rounded median band and compares the gated big networks',()=>{
  const summaries=[
    summary('raptive',100,90,29.5,34.2),summary('mediavine',200,150,28,30.4),
    summary('ezoic',1000,100,20,19),            // 10% rated: left out of the comparison
    summary('journey-by-mediavine',300,300,14,15.6),summary('mgid',50,50,60,61),
  ];
  const report=adNetworkDomainRatingReport('raptive',summaries,[
    {min:0,count:5},{min:20,count:30},{min:30,count:40},{min:70,count:10},{min:80,count:4},{min:100,count:1},
  ]);
  assert.deepEqual(report.bands.map(band=>band.label),['0–9','10–19','20–29','30–39','40–49','50–59','60–69','70+']);
  assert.deepEqual(report.bands.map(band=>band.count),[5,0,30,40,0,0,0,15]);
  // 29.5 shows as 30, so the highlighted band is 30–39.
  assert.equal(report.median_band,'30-39');
  assert.deepEqual(report.comparison.map(row=>[row.slug,row.current]),
    [['raptive',true],['mediavine',false],['journey-by-mediavine',false]]);
  // A network outside the big four still sees itself beside them.
  const mgid=adNetworkDomainRatingReport('mgid',summaries,[{min:60,count:50}]);
  assert.equal(mgid.comparison[0].slug,'mgid');assert.equal(mgid.comparison.length,4);
  // Compared with nothing else, the strip hides.
  assert.deepEqual(adNetworkDomainRatingReport('mgid',[summaries[4]],[{min:60,count:50}]).comparison,[]);
});

test('the sites loader filters by DR in both queries and sorts unrated sites last',async()=>{
  const calls=[];
  const {loadAdNetworkSites,defaultAdNetworkSitesQuery}=adNetworksLibrary(async(sql,args)=>{
    calls.push({sql,args});
    if(sql.includes('as classified'))return {rows:[{...coverage,rated:10}]};
    if(sql.includes('select distinct n.slug')||sql.includes('select evidence,manager_relationships')||sql.includes('select slug,name,manager_domains'))return {rows:[]};
    if(sql.includes('count(*)::int as total'))return {rows:[{total:3}]};
    if(sql.includes('p.normalized_domain as domain'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  });
  const result=await loadAdNetworkSites({...defaultAdNetworkSitesQuery('raptive'),sort:'highest-dr',minDr:30});
  assert.equal(result.effectiveSort,'highest-dr');
  const count=calls.find(call=>call.sql.includes('count(*)::int as total'));
  const table=calls.find(call=>call.sql.includes('p.normalized_domain as domain'));
  for(const call of [count,table]) {
    assert.match(call.sql,/\(\$4::int is null or p\.domain_rating>=\$4\)/);
    assert.equal(call.args[3],30);
  }
  assert.ok(table.sql.includes('order by p.domain_rating desc nulls last,p.normalized_domain limit $5 offset $6'));
  calls.length=0;
  await loadAdNetworkSites({...defaultAdNetworkSitesQuery('raptive'),sort:'lowest-dr'});
  assert.ok(calls.find(call=>call.sql.includes('p.normalized_domain as domain')).sql.includes('order by p.domain_rating asc nulls last'));
  await assert.rejects(loadAdNetworkSites({...defaultAdNetworkSitesQuery('raptive'),minDr:31}),/Invalid sites query/);
});

// Read-only fixture query: the real ORDER BY runs in PostgreSQL; no tables are written.
const connectionString=process.env.DATABASE_URL;
test('both DR sorts put unrated sites last across pages',{skip:!connectionString},async()=>{
  const orders={};
  const library=adNetworksLibrary(async sql=>{
    if(sql.includes('as classified'))return {rows:[{...coverage,rated:5}]};
    if(sql.includes('count(*)::int as total'))return {rows:[{total:6}]};
    const order=sql.match(/select p\.id from matches p order by (.*?) limit \$5 offset \$6/s);
    if(order)orders.current=order[1];
    return {rows:[]};
  });
  const rows=[[1,'a.com',40],[2,'b.com',null],[3,'c.com',70],[4,'d.com',40],[5,'e.com',null],[6,'f.com',5]]
    .map(([id,normalized_domain,domain_rating])=>({id,normalized_domain,domain_rating}));
  const client=new pg.Client({connectionString,connectionTimeoutMillis:15000,
    options:'-c default_transaction_read_only=on -c statement_timeout=15000'});
  try {
    await client.connect();
    for(const [sort,expected] of [['highest-dr',[3,1,4,6,2,5]],['lowest-dr',[6,1,4,3,2,5]]]) {
      await library.loadAdNetworkSites({...library.defaultAdNetworkSitesQuery('raptive'),sort});
      const sql=`with matches as materialized (
        select * from jsonb_to_recordset($1::jsonb) p(id int,normalized_domain text,domain_rating int)
      ) select p.id from matches p order by ${orders.current} limit $2 offset $3`;
      const page=async(size,offset)=>(await client.query(sql,[JSON.stringify(rows),size,offset])).rows.map(row=>row.id);
      assert.deepEqual([...(await page(2,0)),...(await page(2,2)),...(await page(2,4))],expected,sort);
    }
  } finally { await client.end(); }
});

test('the public sites loader carries linked attribution beside rated records and the response',async()=>{
  for(const rating of [0,42,null]) {
    const lib=adNetworksLibrary(async sql=>{
      if(sql.includes('as classified'))return {rows:[{...coverage,rated:rating===null?0:1}]};
      if(sql.includes('count(*)::int as total'))return {rows:[{total:1}]};
      if(sql.includes('p.normalized_domain as domain'))return {rows:[{domain:'example.com',last_checked_at:null,evidence:{},manager_relationships:[],domain_rating:rating}]};
      return {rows:[]};
    });
    const result=await lib.loadAdNetworkSites(lib.defaultAdNetworkSitesQuery());
    if(rating===null) {assert.equal(Object.hasOwn(result,'attribution'),false);assert.equal(Object.hasOwn(result.rows[0],'attribution'),false);}
    else {assert.deepEqual(result.attribution,AHREFS_ATTRIBUTION);assert.deepEqual(result.rows[0].attribution,AHREFS_ATTRIBUTION);}
  }
});
