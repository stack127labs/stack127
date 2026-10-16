import assert from 'node:assert/strict';
import test from 'node:test';
import {adNetworkSwitchFlow,adNetworkMovementPeriods,adNetworkPlatformMix} from '../../../lib/ad-networks-report.ts';
import {adNetworksLibrary} from './loader-harness.mjs';

const a={slug:'a',name:'Network A'},b={slug:'b',name:'Network B'},c={slug:'c',name:'Network C'},d={slug:'d',name:'Network D'};
test('switch flow keeps each direction separate, orders counts, and excludes unrelated/self/empty moves',()=>{
  const switches=[{from:a,to:b,count:4},{from:c,to:b,count:7},{from:a,to:b,count:2},
    {from:b,to:a,count:3},{from:b,to:d,count:1},{from:a,to:d,count:100},{from:b,to:b,count:100},{from:d,to:b,count:0}];
  const result=adNetworkSwitchFlow(b,switches);
  assert.deepEqual(result.came_from,[{...c,label:c.name,count:7},{...a,label:a.name,count:6}]);
  assert.deepEqual(result.went_to,[{...a,label:a.name,count:3},{...d,label:d.name,count:1}]);
  assert.equal(result.incoming_total,13);assert.equal(result.outgoing_total,4);
  assert.equal(adNetworkSwitchFlow(b,[]),null);
  assert.deepEqual(adNetworkSwitchFlow(b,[{from:a,to:b,count:2}]).went_to,[]);
});

test('movement periods use inclusive UTC windows, Monday weeks and actual joins/departures only',()=>{
  const rows=[
    {date:'2025-10-07',joined:999,left:999},
    {date:'2025-12-06',joined:1,left:2},
    {date:'2025-12-07',joined:2,left:0},
    {date:'2025-12-08',joined:3,left:0},
    {date:'2026-01-04',joined:7,left:1},
    {date:'2026-01-05',joined:3,left:4,baseline:999,newly_found:999},
    {date:'2026-01-06',joined:999,left:999},
  ];
  const before=structuredClone(rows);
  const periods=adNetworkMovementPeriods(rows,new Date('2026-01-05T23:59:59Z'));
  const daily=periods.find(p=>p.days===30),weekly=periods.find(p=>p.days===90);
  assert.equal(daily.interval,'day');assert.equal(daily.joined,15);assert.equal(daily.left,5);assert.equal(daily.net,10);
  assert.equal(daily.points[0].date,'2025-12-07');assert.equal(daily.points.length,4);
  assert.equal(weekly.interval,'week');assert.equal(weekly.joined,16);assert.equal(weekly.left,7);
  assert.deepEqual(weekly.points[0],{date:'2025-12-01',label:'Week of Dec 1',joined:3,left:2});
  assert.equal(weekly.points.at(-1).date,'2026-01-05');
  assert.deepEqual(adNetworkMovementPeriods([{date:'2026-01-05',joined:0,left:0,baseline:100,newly_found:10}],new Date('2026-01-05')),[]);
  assert.deepEqual(rows,before);
});

test('platform mix hides without measurements and includes the real unknown share once measured',()=>{
  assert.deepEqual(adNetworkPlatformMix([],100),[]);
  const result=adNetworkPlatformMix([{key:'wordpress',label:'WordPress',count:8},{key:'ghost',label:'Ghost',count:1}],10);
  assert.deepEqual(result.map(r=>r.share),[80,10,10]);
  assert.deepEqual(result.at(-1),{key:'unknown',label:'Unknown',count:1,share:10});
  assert.equal(adNetworkPlatformMix([{key:'wordpress',label:'WordPress',count:10}],10).length,1);
});

const ageRow={scope_key:'a',name:'Network A',measured:4,p25_year:2003.75,median_year:2007.5,p75_year:2012.5,
  oldest_domain:'oldest.com',oldest_on:'2000-12-31',newest_domain:'newest.com',newest_on:'2020-01-01',
  bins:[{year:2000,count:1},{year:2005,count:1},{year:2010,count:1},{year:2020,count:1}]};
test('age strip retains interpolated quartiles, chronological endpoint domains and explicit one-year bins',async()=>{
  const calls=[];
  const lib=adNetworksLibrary(async(sql,args)=>{calls.push({sql,args});return {rows:[ageRow]};});
  const strip=await lib.loadAdNetworkDomainAgeStrip('a','food');
  assert.equal(strip.measured,4);assert.equal(strip.p25_year,2003.75);assert.equal(strip.p75_year,2012.5);
  assert.deepEqual(Array.from(strip.middle_half),[2003.75,2012.5]);
  assert.equal(strip.oldest.domain,'oldest.com');assert.equal(strip.oldest.year,2000);assert.equal(strip.newest.year,2020);
  assert.equal(strip.bin_years,1);assert.deepEqual(strip.bins,ageRow.bins);
  assert.deepEqual(Array.from(calls[0].args),['a','food',false]);
  const byNetwork=await lib.loadAdNetworkDomainAgeByNetwork('food');
  assert.equal(byNetwork[0].slug,'a');assert.equal(byNetwork[0].strip.measured,4);
  assert.deepEqual(Array.from(calls[1].args),[null,'food',true]);
});
test('an unmeasured age scope never becomes a zero-valued strip or network entry',async()=>{
  for(const rows of [[],[{...ageRow,measured:0}]]) {
    const lib=adNetworksLibrary(async()=>({rows}));
    assert.equal(await lib.loadAdNetworkDomainAgeStrip(),null);
    assert.deepEqual(Array.from(await lib.loadAdNetworkDomainAgeByNetwork()),[]);
  }
});

test('newest niche arrivals name the network actually joined while preserving legacy site rows',async()=>{
  const refs=[{slug:'a',name:'Network A',manager_domains:[],ad_system_domains:[]},{slug:'b',name:'Network B',manager_domains:[],ad_system_domains:[]}];
  const site={domain:'example.com',publisher_name:null,niche:'food',traffic_group:null,domain_created_on:null,platform:null,
    last_checked_at:null,favicon:null,evidence:{},manager_relationships:[],networks:refs.map(({slug,name})=>({slug,name}))};
  const coverage={listed:125,classified:100,traffic:0,age:0,platform:0,publisher:0,checked:0,manager:0,niches:['food']};
  const pageSizes=[];
  const lib=adNetworksLibrary(async(sql,args)=>{
    if(sql.includes('limit $4 offset $5'))pageSizes.push(args[3]);
    if(sql.includes('arrived_network.name'))return {rows:[{...site,first_confirmed_at:'2026-10-15T12:30:00Z',arrived_network:{slug:'b',name:'Network B'}}]};
    if(sql.includes('count(p.niche)'))return {rows:[coverage]};
    if(sql.includes('as classified'))return {rows:[{listed:125,confirmed:100,classified:100}]};
    if(sql.includes('select niche,count(*)'))return {rows:[{niche:'food',listed:100,confirmed:80}]};
    if(sql.includes('as updated_at'))return {rows:[{updated_at:null}]};
    if(sql.includes('r.verification_method as key'))return {rows:[]};
    if(sql.includes('as total')&&sql.includes('group by n.id'))return {rows:[{slug:'a',name:'Network A',count:100,total:125}]};
    if(sql.includes('select distinct n.slug'))return {rows:refs.map(({slug,name})=>({slug,name}))};
    if(sql.includes('select slug,name,manager_domains'))return {rows:refs};
    if(sql.includes('count(*)::int as total'))return {rows:[{total:0}]};
    if(sql.includes('p.normalized_domain as domain')||sql.includes('select evidence,manager_relationships')||
      sql.includes('select traffic_group,evidence')||sql.includes('with records as materialized')||sql.includes('with moves as'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  });
  const result=await lib.getAdNetworkNichePageData('food');
  assert.equal(result.newest_arrivals[0].network.slug,'b');
  assert.equal(result.newest_arrivals[0].observed_at,'2026-10-15T12:30:00.000Z');
  assert.equal(result.newest_sites[0].domain,'example.com');
  assert.equal(result.newest_sites[0].first_confirmed_at,'2026-10-15T12:30:00Z');
  assert.equal('arrived_network' in result.newest_sites[0],false);
  assert.equal(result.domain_age_strip,null);
  assert.equal(result.sites.pageSize,10);assert.deepEqual(pageSizes,[10]);
});
