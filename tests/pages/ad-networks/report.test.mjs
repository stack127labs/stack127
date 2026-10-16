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
  const result=await loadAdNetworkSites({...query,sort:'traffic',page:99});
  assert.equal(result.effectiveSort,'domain');assert.equal(result.page,8);assert.equal(result.totalPages,8);
  assert.deepEqual(Array.from(result.availableSorts),['domain','checked']);
  const table=calls.find(c=>c.sql.includes('p.normalized_domain as domain'));
  assert.match(table.sql,/order by p.normalized_domain limit \$4 offset \$5/);
  assert.deepEqual(Array.from(table.args).slice(-2),[10,70]);
  const explicit=await loadAdNetworkSites({...query,page:99,pageSize:50});
  assert.equal(explicit.pageSize,50);assert.equal(explicit.page,2);assert.equal(explicit.totalPages,2);
  assert.equal(parseAdNetworkSitesParams(new URLSearchParams('pageSize=50')).pageSize,50);
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
