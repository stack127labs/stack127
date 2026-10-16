import assert from 'node:assert/strict';
import test from 'node:test';
import {adNetworkCheckerEvents,adNetworkObservedDomainAge,adNetworkUtcWindow,adNetworkMovementPeriods,adNetworkMovementTotals} from '../../../lib/ad-networks-report.ts';
import {adNetworksLibrary} from './loader-harness.mjs';
const a={slug:'a',name:'A'},b={slug:'b',name:'B'},c={slug:'c',name:'C'};
const observation=(network,event,date,type='primary_or_exclusive_manager')=>({network,event,date,relationship_type:type});
const realEvents=rows=>adNetworkCheckerEvents(rows,null).filter(e=>e.kind!=='first_check');

test('checker switches require a reciprocal one-to-one manager replacement within seven days',()=>{
  const events=realEvents([observation(a,'left','2026-01-29T12:00:00Z'),observation(b,'joined','2026-02-05T12:00:00Z')]);
  assert.equal(events.length,1);assert.equal(events[0].kind,'switched');assert.equal(events[0].network.slug,'b');
  assert.equal(events[0].from_network.slug,'a');assert.equal(events[0].date,'2026-02-05T12:00:00.000Z');
  // Same-month co-occurrence does not establish a switch, and crossing a month does not prevent a real one.
  for(const rows of [
    [observation(a,'left','2026-01-01'),observation(b,'joined','2026-01-20')],
    [observation(a,'left','2026-01-01','active_network_use'),observation(b,'joined','2026-01-02','active_network_use')],
    [observation(a,'left','2026-01-01','unknown'),observation(b,'joined','2026-01-02')],
    [observation(a,'left','2026-01-01'),observation(b,'newly_found','2026-01-02')],
    [observation(a,'left','2026-01-01'),observation(a,'joined','2026-01-02')],
  ]) {
    assert.equal(realEvents(rows).some(e=>e.kind==='switched'),false);
    assert.deepEqual(new Set(realEvents(rows).map(e=>e.kind)),new Set(['added','dropped']));
  }
});

test('multiple arrivals or departures remain separate events, including near the output limit',()=>{
  for(const rows of [
    [observation(a,'left','2026-01-01'),observation(b,'joined','2026-01-02'),observation(c,'joined','2026-01-03')],
    [observation(a,'left','2026-01-01'),observation(c,'left','2026-01-02'),observation(b,'joined','2026-01-03')],
  ])assert.equal(realEvents(rows).some(e=>e.kind==='switched'),false);
  const padding=Array.from({length:210},(_,i)=>observation(c,'baseline',new Date(Date.UTC(2020,0,i+1)).toISOString()));
  const result=adNetworkCheckerEvents([...padding,observation(a,'left','2026-01-01'),observation(b,'joined','2026-01-02'),observation(c,'joined','2026-01-03')],null);
  assert.equal(result.some(e=>e.kind==='switched'),false);
  assert.equal(result.find(e=>e.kind==='first_check').date,'2020-01-01T00:00:00.000Z');
});

test('seven-day threshold retains database microseconds and baseline imports never become additions',()=>{
  assert.equal(realEvents([observation(a,'left','2026-01-01T00:00:00.123456Z'),observation(b,'joined','2026-01-08T00:00:00.123456Z')])[0].kind,'switched');
  assert.equal(realEvents([observation(a,'left','2026-01-01T00:00:00.123456Z'),observation(b,'joined','2026-01-08T00:00:00.123457Z')]).some(e=>e.kind==='switched'),false);
  const first=adNetworkCheckerEvents([observation(a,'baseline','2026-01-01T00:00:00Z'),observation(b,'baseline','2026-01-01T00:00:00Z')],null);
  assert.equal(first.length,1);assert.equal(first[0].kind,'first_check');assert.equal(first[0].network,null);
  assert.deepEqual(first[0].networks.map(n=>n.slug),['a','b']);
  assert.deepEqual(adNetworkCheckerEvents([],null),[]);
});

test('domain age uses stored check dates and never invents a current date',()=>{
  assert.equal(adNetworkObservedDomainAge('2000-01-01','2010-01-01T00:00:00Z'),(Date.parse('2010-01-01')-Date.parse('2000-01-01'))/31557600000);
  for(const pair of [[null,'2026-01-01'],['2000-01-01',null],['bad','2026-01-01'],['2027-01-01','2026-01-01']])assert.equal(adNetworkObservedDomainAge(...pair),null);
});

test('movement source, totals and chart periods share exactly 90 UTC dates and exclude future dates',async()=>{
  const window=adNetworkUtcWindow(90,new Date('2026-01-05T23:59:59-05:00'));
  assert.deepEqual(window,{start:'2025-10-09',end:'2026-01-06',until:'2026-01-07',baseline:'2025-10-08'});
  const calls=[];
  const observations=[{date:'2025-10-08',joined:100,left:100},{date:'2025-10-09',joined:3,left:1},
    {date:'2026-01-06',joined:2,left:0},{date:'2026-01-07',joined:100,left:100}];
  const lib=adNetworksLibrary(async(sql,args)=>{
    calls.push({sql,args});
    return {rows:observations.filter(row=>row.date>=args[1]&&row.date<args[2])};
  });
  const rows=await lib.loadAdNetworkMovements(null,'2026-01-06');
  assert.deepEqual(Array.from(calls[0].args),[null,'2025-10-09','2026-01-07']);
  const totals=adNetworkMovementTotals(rows),period=adNetworkMovementPeriods(rows,new Date('2026-01-06')).find(p=>p.days===90);
  assert.equal(totals.joined,5);assert.equal(totals.left,1);assert.equal(totals.joined,period.joined);assert.equal(totals.left,period.left);
  assert.match(calls[0].sql,/at time zone 'UTC'/);
});

test('checker responses return evidence methods and explicit events and remain byte-identical as the clock advances',async()=>{
  let clock=Date.parse('2040-01-01');
  class AdvancingDate extends Date {static now(){clock+=86400000;return clock;}}
  const methods=['ads_txt_managerdomain','ads_txt_and_adsense_account','ads_txt_and_page_signature','page_signature'];
  const identities=methods.map((_,i)=>({slug:String(i),name:String(i),manager_domains:[],ad_system_domains:[]}));
  const lib=adNetworksLibrary(async(sql)=>{
    if(sql.includes('select slug,name,manager_domains'))return {rows:identities};
    if(sql.includes('p.normalized_domain=$1'))return {rows:[{id:'1',domain:'example.com',publisher_name:null,niche:null,traffic_group:null,
      domain_created_on:'2000-01-01',platform:null,last_checked_at:'2010-01-01T00:00:00Z',favicon:null,evidence:{},manager_relationships:[],networks:[],ads_txt_summary:null}]};
    if(sql.includes('select n.slug,n.name,r.status'))return {rows:identities.map((n,i)=>({slug:n.slug,name:n.name,status:'confirmed',relationship_type:'active_network_use',
      verification_method:methods[i],first_confirmed_at:null,last_confirmed_at:null,ended_at:null}))};
    if(sql.includes('e.observed_at::text'))return {rows:[observation(a,'left','2009-12-31'),observation(b,'joined','2010-01-01')]};
    if(sql.includes('p.normalized_domain<>$2'))return {rows:[]};
    throw Error(`Unexpected SQL: ${sql}`);
  },{},{Date:AdvancingDate});
  const first=await lib.loadAdNetworkCheckerSite('example.com'),second=await lib.loadAdNetworkCheckerSite('example.com');
  assert.equal(JSON.stringify(first),JSON.stringify(second));
  assert.ok(first.domain_age_years>10&&first.domain_age_years<11);
  assert.deepEqual(Array.from(first.relationships,r=>r.verification_method),methods);
  assert.equal(first.events.find(e=>e.kind==='switched').from_network.slug,'a');
});
