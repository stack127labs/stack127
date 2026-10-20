import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hasAdNetworkNicheCoverage,adNetworkSiteAvailability,adNetworkMonthEnds,adNetworkYearChange,
  adNetworkMovementTotals,adNetworkManagerBreakdown,trafficOrder,lastDays,
} from '../../../lib/ad-networks-report.ts';
import {parseAdNetworkSitesParams} from '../../../app/api/ad-networks/input.ts';
import {adNetworksLibrary} from './loader-harness.mjs';
import {targetsForEvents} from '../../../scripts/stack127/cache/targets.mjs';
import {networkIdentities} from '../../../scripts/ad-networks/network-identities.mjs';

const emptyCoverage={listed:1000,classified:0,traffic:0,age:0,platform:0,publisher:0,checked:1000,manager:0,niches:[],networks:[]};
test('network and niche defaults agree between server and API while the directory stays A to Z',()=>{
  const {defaultAdNetworkSitesQuery}=adNetworksLibrary(()=>{throw Error('Defaults must not query the database');});
  for(const [network,niche] of [[null,null],[null,'food'],['mediavine',null],['mediavine','food']]) {
    const params=new URLSearchParams();
    if(network)params.set('network',network);
    if(niche)params.set('niche',niche);
    const query=defaultAdNetworkSitesQuery(network,niche);
    assert.equal(query.sort,network||niche?'traffic':'domain');
    assert.deepEqual(JSON.parse(JSON.stringify(query)),parseAdNetworkSitesParams(params));
    params.set('sort','domain');assert.equal(parseAdNetworkSitesParams(params).sort,'domain');
    params.set('sort','traffic');assert.equal(parseAdNetworkSitesParams(params).sort,'traffic');
  }
});
test('cold reports bound concurrent queries and release capacity after a database error',async()=>{
  let active=0,maximum=0;
  const {queryAdNetworkReport}=adNetworksLibrary(async(sql)=>{
    active++;maximum=Math.max(maximum,active);
    await new Promise(resolve=>setTimeout(resolve,5));
    active--;
    if(sql==='fail')throw Error('database failed');
    return {rows:[{value:sql}]};
  });
  const results=await Promise.allSettled(Array.from({length:12},(_,i)=>queryAdNetworkReport(i===2?'fail':String(i))));
  assert.equal(maximum,3);
  assert.equal(active,0);
  assert.equal(results.filter(result=>result.status==='rejected').length,1);
  assert.equal((await queryAdNetworkReport('after')).rows[0].value,'after');
});
test('development serializes cold reports while retaining capacity after a failed query',async()=>{
  let active=0,maximum=0;
  const {queryAdNetworkReport}=adNetworksLibrary(async(sql)=>{
    sql=sql.text;
    active++;maximum=Math.max(maximum,active);
    await new Promise(resolve=>setTimeout(resolve,5));
    active--;
    if(sql==='fail')throw Error('database failed');
    return {rows:[]};
  },{}, {process:{env:{NODE_ENV:'development'}}});
  const results=await Promise.allSettled(['first','fail','last'].map(sql=>queryAdNetworkReport(sql)));
  assert.equal(maximum,1);
  assert.equal(active,0);
  assert.equal(results.filter(result=>result.status==='rejected').length,1);
  await queryAdNetworkReport('after');
});
test('simultaneous cold niche reports share reads and recover after a shared database failure',async()=>{
  let counts=0,fail=true;
  const library=adNetworksLibrary(async sql=>{
    if(sql.includes('as classified')) {
      counts++;
      await new Promise(resolve=>setTimeout(resolve,5));
      if(fail)throw Error('database failed');
      return {rows:[{listed:0,confirmed:0,classified:0}]};
    }
    if(sql.includes('select niche,count(*)'))return {rows:[]};
    if(sql.includes('as updated_at'))return {rows:[{updated_at:null}]};
    if(sql.includes('r.verification_method as key'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  });
  const failed=await Promise.allSettled([library.getAdNetworkNichesPageData(),library.getAdNetworkNichesPageData()]);
  assert.equal(counts,1);
  assert.ok(failed.every(result=>result.status==='rejected'));
  fail=false;
  const [first,second]=await Promise.all([library.getAdNetworkNichesPageData(),library.getAdNetworkNichesPageData()]);
  assert.equal(counts,2);
  assert.deepEqual(first,second);
  assert.equal(first.listed,0);
});
test('niches need 100 classified sites and 80 percent scope coverage',()=>{
  assert.equal(hasAdNetworkNicheCoverage(0,0),false);
  assert.equal(hasAdNetworkNicheCoverage(99,99),false);
  assert.equal(hasAdNetworkNicheCoverage(125,99),false);
  assert.equal(hasAdNetworkNicheCoverage(125,100),true);
  assert.equal(hasAdNetworkNicheCoverage(126,100),false);
});
test('site controls disappear and reappear when their source fields fill',()=>{
  const empty=adNetworkSiteAvailability(emptyCoverage);
  assert.deepEqual(empty.availableColumns,['domain','checked']);
  assert.deepEqual(empty.availableSorts,['domain','checked']);
  assert.deepEqual(empty.availableFilters,[]);
  const full=adNetworkSiteAvailability({...emptyCoverage,classified:800,traffic:1,age:1,platform:1,publisher:1,manager:1,
    niches:['food'],networks:[{slug:'mediavine',name:'Mediavine'}]});
  assert.deepEqual(full.availableSorts,['domain','traffic','oldest','newest','checked']);
  for(const field of ['niche','traffic','domain_age','platform','publisher','manager','network'])assert.ok(full.availableColumns.includes(field));
  assert.deepEqual(full.filters.niches.map(n=>n.slug),['food']);
  assert.deepEqual(full.availableFilters,['niche','network']);
  // A network with some unsorted sites still gets the niche column and filter.
  const partial=adNetworkSiteAvailability({...emptyCoverage,listed:1000,classified:790,niches:['food']});
  assert.ok(partial.availableColumns.includes('niche'));
  assert.deepEqual(partial.availableFilters,['niche']);
});
const point=(date,listed=10)=>({date,listed,confirmed:listed,stale:0});
test('history excludes partial months, needs two real month ends, and handles leap days',()=>{
  assert.deepEqual(adNetworkMonthEnds([point('2026-10-16')]),[]);
  assert.deepEqual(adNetworkMonthEnds([point('2026-09-30'),point('2026-10-16')]),[]);
  assert.deepEqual(adNetworkMonthEnds([point('2024-03-31'),point('2024-02-28'),point('2024-02-29')]).map(p=>p.date),['2024-02-29','2024-03-31']);
  assert.equal(adNetworkYearChange([point('2026-01-01')],20,new Date('2026-10-16T00:00:00Z')),null);
  assert.equal(adNetworkYearChange([point('2025-10-15')],20,new Date('2026-10-16T00:00:00Z')),null);
  assert.equal(adNetworkYearChange([point('2023-02-28',12)],20,new Date('2024-02-29T00:00:00Z')),8);
  assert.equal(adNetworkYearChange([point('2025-10-16',12),point('2025-10-17',14)],20,new Date('2026-10-16T00:00:00Z')),8);
});
test('baseline imports never become joins and all-unknown managers hide',()=>{
  assert.deepEqual(adNetworkMovementTotals([{date:'2026-10-16',joined:2,left:1,baseline:100,newly_found:3}]),{joined:2,left:1,baseline:100,newly_found:3});
  assert.deepEqual(adNetworkManagerBreakdown([{key:'not-listed',label:'not-listed',count:100}]),[]);
  assert.equal(adNetworkManagerBreakdown([{key:'this-network',label:'manager',count:1}]).length,1);
  assert.ok(trafficOrder('top-10k')<trafficOrder('top-100k'));
  assert.deepEqual(lastDays(['2026-01-01'],2),['2025-12-31','2026-01-01']);
});
test('sites loader and parser default to 10, preserve explicit sizes, and bound pagination',async()=>{
  const calls=[];
  const {loadAdNetworkSites,defaultAdNetworkSitesQuery}=adNetworksLibrary(async(sql,args)=>{
    calls.push({sql,args});
    if(sql.includes('as classified'))return {rows:[emptyCoverage]};
    if(sql.includes('select distinct n.slug')||sql.includes('select evidence,manager_relationships'))return {rows:[]};
    if(sql.includes('count(*)::int as total'))return {rows:[{total:75}]};
    if(sql.includes('select slug,name,manager_domains'))return {rows:[]};
    if(sql.includes('p.normalized_domain as domain'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  });
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams()).pageSize,10);
  const query=defaultAdNetworkSitesQuery();assert.equal(query.pageSize,10);
  assert.deepEqual(JSON.parse(JSON.stringify(query)),parseAdNetworkSitesParams(new URLSearchParams()));
  assert.equal(defaultAdNetworkSitesQuery('mediavine','food',50).pageSize,50);
  assert.equal(defaultAdNetworkSitesQuery(null,'food').pageSize,10);
  const result=await loadAdNetworkSites({...defaultAdNetworkSitesQuery('mediavine'),page:99});
  assert.equal(result.effectiveSort,'domain');assert.equal(result.page,8);assert.equal(result.totalPages,8);
  assert.deepEqual(Array.from(result.availableSorts),['domain','checked']);
  const table=calls.find(c=>c.sql.includes('p.normalized_domain as domain'));
  assert.match(table.sql,/order by p.normalized_domain limit \$4 offset \$5/);
  assert.deepEqual(Array.from(table.args).slice(-2),[10,70]);
  const explicit=await loadAdNetworkSites({...query,page:99,pageSize:50});
  assert.equal(explicit.pageSize,50);assert.equal(explicit.page,2);assert.equal(explicit.totalPages,2);
  const niche=await loadAdNetworkSites(defaultAdNetworkSitesQuery(null,'tech'));
  assert.equal(niche.effectiveSort,'domain');
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams('pageSize=50')).pageSize,50);
});
test('default and explicit traffic sort use age, domain and id ties in both paging and final rows',async()=>{
  const tables=[];
  const {loadAdNetworkSites,defaultAdNetworkSitesQuery}=adNetworksLibrary(async(sql,args)=>{
    if(sql.includes('as classified'))return {rows:[{...emptyCoverage,traffic:1000,age:1000}]};
    if(sql.includes('select distinct n.slug')||sql.includes('select evidence,manager_relationships')||sql.includes('select slug,name,manager_domains'))return {rows:[]};
    if(sql.includes('count(*)::int as total'))return {rows:[{total:75}]};
    if(sql.includes('p.normalized_domain as domain')){tables.push({sql,args});return {rows:[]};}
    throw Error(`Unexpected SQL: ${sql}`);
  });
  for(const query of [defaultAdNetworkSitesQuery('mediavine'),defaultAdNetworkSitesQuery(null,'tech')]) {
    assert.equal((await loadAdNetworkSites(query)).effectiveSort,'traffic');
    assert.equal((await loadAdNetworkSites({...query,sort:'traffic',page:2})).effectiveSort,'traffic');
  }
  const order="case p.traffic_group when 'top-1k' then 0 when 'top-10k' then 1 when 'top-100k' then 2 when 'top-1m' then 3 when 'not-ranked' then 4 else 5 end,p.domain_created_on asc nulls last,p.normalized_domain,p.id";
  for(const {sql} of tables) {
    assert.ok(sql.includes(`order by ${order} limit $4 offset $5`));
    assert.ok(sql.trimEnd().endsWith(`order by ${order}`));
  }
  assert.deepEqual(Array.from(tables[0].args),['mediavine',null,'',10,0]);
  assert.deepEqual(Array.from(tables[1].args),['mediavine',null,'',10,10]);
  assert.deepEqual(Array.from(tables[2].args),[null,'tech','',10,0]);
  assert.deepEqual(Array.from(tables[3].args),[null,'tech','',10,10]);
});
test('an all-network data event refreshes every network, niches and both APIs',()=>{
  const targets=targetsForEvents([{entity_type:'ad_networks',slug:'all'}]);
  for(const network of networkIdentities)assert.ok(targets.verifyPaths.includes(`/ad-networks/${network.slug}`));
  for(const path of ['/ad-networks','/ad-networks/stats','/ad-networks/niches','/ad-networks/niches/food','/ad-network-checker','/api/ad-networks/site','/api/ad-networks/sites'])assert.ok(targets.verifyPaths.includes(path));
  assert.ok(targets.nextTags.includes('stack127-ad-networks'));assert.ok(targets.edgeTags.includes('ad-networks-catalog'));
});

test('directory groups, shares and joining order use loader data and never turn unknown rules into zero',async()=>{
  const rows=[
    {id:'1',slug:'higher',name:'Higher',listed_count:80,verified_count:70,stale_count:10,ended_count:0},
    {id:'2',slug:'lower',name:'Lower',listed_count:30,verified_count:25,stale_count:5,ended_count:0},
    {id:'3',slug:'unknown',name:'Unknown',listed_count:10,verified_count:5,stale_count:5,ended_count:0},
  ];
  const {getAdNetworkDirectoryData}=adNetworksLibrary(async(sql,args)=>{
    if(sql.includes('select n.id, n.slug'))return {rows};
    if(sql.includes('as classified'))return {rows:[{listed:125,confirmed:100,classified:100}]};
    if(sql.includes('select niche,count(*)'))return {rows:[{niche:'food',listed:100,confirmed:80}]};
    if(sql.includes('as updated_at'))return {rows:[{updated_at:null}]};
    if(sql.includes('r.verification_method as key'))return {rows:[]};
    if(sql.includes('select p.niche,n.slug'))return {rows:rows.map(n=>({niche:'food',slug:n.slug,name:n.name,count:n.listed_count}))};
    if(sql.includes('as total')&&sql.includes('group by n.id'))return {rows:rows.map(n=>({slug:n.slug,name:n.name,count:n.listed_count,total:args[0]==='food'?100:125}))};
    throw Error(`Unexpected SQL: ${sql}`);
  },{'../app/(site)/(directories)/ad-networks/network-facts':{adNetworkFacts:{higher:{minTraffic:{amount:50000,unit:'sessions'}},lower:{minTraffic:{amount:1000,unit:'pageviews'}},unknown:{minTraffic:null}}}});
  const data=await getAdNetworkDirectoryData();
  assert.equal(data.listed,125);assert.equal(data.confirmed_share,80);
  assert.deepEqual(Array.from(data.most_sites,n=>n.slug),['higher','lower','unknown']);
  assert.deepEqual(Array.from(data.easiest_to_join,n=>n.slug),['lower','higher']);
  assert.equal(data.networks.find(n=>n.slug==='unknown').minTraffic,null);
  assert.equal(data.by_niche[0].niche.share,80);
  assert.equal(data.by_niche[0].niche.easiest_to_join.slug,'lower');
  assert.equal(data.by_niche[0].networks[0].niche_share,80);
  assert.ok(data.availableSorts.includes('by-niche'));
});

test('niche matrix keeps per-niche denominators and overlapping network membership in one read',async()=>{
  const calls=[];
  const {getAdNetworkNichesPageData}=adNetworksLibrary(async(sql,args)=>{
    calls.push({sql,args});
    if(sql.includes('as classified'))return {rows:[{listed:225,confirmed:200,classified:180}]};
    if(sql.includes('select niche,count(*)'))return {rows:[{niche:'food',listed:100,confirmed:90},{niche:'tech',listed:80,confirmed:70}]};
    if(sql.includes('select p.niche,n.slug'))return {rows:[
      {niche:'food',slug:'higher',name:'Higher',count:80},
      {niche:'food',slug:'lower',name:'Lower',count:30},
      {niche:'tech',slug:'unknown',name:'Unknown',count:70},
      {niche:'tech',slug:'higher',name:'Higher',count:10},
    ]};
    if(sql.includes('as total')&&sql.includes('group by n.id'))return {rows:[{slug:'higher',name:'Higher',count:90,total:225}]};
    if(sql.includes('as updated_at'))return {rows:[{updated_at:null}]};
    if(sql.includes('r.verification_method as key'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  },{'../app/(site)/(directories)/ad-networks/network-facts':{adNetworkFacts:{higher:{minTraffic:{amount:50000,unit:'sessions'}},lower:{minTraffic:{amount:1000,unit:'pageviews'}},unknown:{minTraffic:null}}}});
  const data=await getAdNetworkNichesPageData();
  assert.equal(data.niche_coverage,80);assert.equal(data.unclassified,45);
  assert.deepEqual(Array.from(data.niches,n=>n.slug),['food','tech']);
  assert.deepEqual(Array.from(data.niches[0].networks,n=>[n.slug,n.count,n.share]),[['higher',80,80],['lower',30,30]]);
  assert.deepEqual(Array.from(data.niches[1].networks,n=>[n.slug,n.count,n.share]),[['unknown',70,87.5],['higher',10,12.5]]);
  assert.equal(data.niches[0].easiest_to_join.slug,'lower');
  assert.equal(data.niches[1].easiest_to_join.slug,'higher');
  assert.equal(calls.filter(c=>c.sql.includes('select p.niche,n.slug')).length,1);
  assert.equal(calls.filter(c=>c.args?.[0]!=null).length,0);
});
