import assert from 'node:assert/strict';
import test from 'node:test';
import { deriveManagedBy, buildAdsTxtPreview, aggregateAdNetworkManagers, aggregateAdNetworkTrafficShares } from '../../../lib/ad-network-site-facts.mjs';
import { mapSyncPublisher,mapSyncRelationship,syncArgs } from '../../../scripts/ad-networks/sync.mjs';
import { parseAdNetworkSitesParams,parseAdNetworkSiteParams,AdNetworkInputError } from '../../../app/api/ad-networks/input.ts';
const networks=[{slug:'mediavine',name:'Mediavine',manager_domains:['mediavine.com']},
  {slug:'journey-by-mediavine',name:'Journey',manager_domains:['journeymv.com']}];
test('manager comes from MANAGERDOMAIN, including a different network than the selling relationship',()=>{
  assert.deepEqual(deriveManagedBy({manager_domains:[{value:'MEDIAVINE.COM.',country:null}]},networks),
    {managed_by:{slug:'mediavine',name:'Mediavine'},manager_domain:'mediavine.com'});
  assert.deepEqual(deriveManagedBy({manager_domains:[{value:'journeymv.com',country:null}]},networks).managed_by,
    {slug:'journey-by-mediavine',name:'Journey'});
  assert.equal(deriveManagedBy({relationship_type:'primary_or_exclusive_manager'},networks).managed_by,null);
  assert.equal(deriveManagedBy({manager_domains:[]},networks).managed_by,null);
});
test('ambiguous and regional managers stay unknown',()=>{
  assert.equal(deriveManagedBy({manager_domains:[{value:'mediavine.com'},{value:'journeymv.com'}]},networks).managed_by,null);
  assert.equal(deriveManagedBy({manager_domains:['mediavine.com']},[...networks,{...networks[0],slug:'other'}]).managed_by,null);
  assert.deepEqual(deriveManagedBy({manager_domains:['unmapped.com']},networks),{managed_by:null,manager_domain:'unmapped.com'});
});
test('publisher mapping parses evidence without copying local IDs, leases or enrichment placeholders',()=>{
  const row=mapSyncPublisher({id:999,normalized_domain:'food.com',display_domain:'Food.com',first_seen_at:'2026-10-01T00:00:00Z',
    check_status:'checked',last_check_evidence:'{"manager_domains":[{"value":"mediavine.com"}]}',lease_until:'tomorrow'});
  assert.equal(row.normalized_domain,'food.com');assert.deepEqual(row.last_check_evidence,{manager_domains:[{value:'mediavine.com'}]});
  assert.equal('id' in row,false);assert.equal('lease_until' in row,false);assert.equal('niche' in row,false);
  assert.equal(row.last_checked_at,null);
  assert.throws(()=>mapSyncPublisher({last_check_evidence:'[]'}),/Invalid/);
});
test('relationship mapping uses stable domain and slug, preserves observed dates, and excludes review candidates',()=>{
  const row=mapSyncRelationship({ad_network_id:1,publisher_id:999,normalized_domain:'food.com',network_slug:'mediavine',
    status:'ended',relationship_type:'primary_or_exclusive_manager',first_confirmed_at:'2026-09-01T00:00:00Z',
    ended_at:'2026-10-01T00:00:00Z',evidence:'{"checked_url":"https://food.com/ads.txt"}',consecutive_misses:3});
  assert.equal(row.domain,'food.com');assert.equal(row.network_slug,'mediavine');assert.equal('publisher_id' in row,false);
  assert.equal(row.ended_at,'2026-10-01T00:00:00Z');assert.equal(row.consecutive_misses,3);
  assert.throws(()=>mapSyncRelationship({status:'needs_review'}),/reviewed/);
  assert.throws(()=>mapSyncRelationship({status:'ended',first_confirmed_at:null}),/previously confirmed/);
});
test('sync defaults to a read-only development preview and requires explicit production confirmation',()=>{
  assert.equal(syncArgs(['--sqlite','/tmp/test.sqlite']).apply,false);
  assert.equal(syncArgs(['--sqlite','/tmp/test.sqlite']).environment,'development');
  assert.throws(()=>syncArgs(['--sqlite','x','--environment','production']),/Production requires/);
  assert.throws(()=>syncArgs(['--sqlite','x','--batch-size','1001']),/Batch size/);
});
test('sites inputs support both network and niche with bounded pagination and literal search',()=>{
  assert.deepEqual(parseAdNetworkSitesParams(new URLSearchParams('network=mediavine&niche=food&q=Food%25&sort=oldest&page=2&pageSize=50')),
    {network:'mediavine',niche:'food',q:'food%',sort:'oldest',page:2,pageSize:50});
  for (const query of ['page=0','page=-1','page=1.5','page=10001','pageSize=101','pageSize=0','sort=drop','niche=made-up','network=x%27','q=a&q=b','x=1']) {
    assert.throws(()=>parseAdNetworkSitesParams(new URLSearchParams(query)),AdNetworkInputError,query);
  }
});
test('checker accepts URLs and international domains and rejects local or malformed inputs',()=>{
  assert.equal(parseAdNetworkSiteParams(new URLSearchParams({domain:'https://www.Example.com/a?b=1'})),'example.com');
  assert.equal(parseAdNetworkSiteParams(new URLSearchParams({domain:'münchen.de'})),'xn--mnchen-3ya.de');
  for(const domain of ['localhost','127.0.0.1','[::1]','internal.local','a.internal','https://user:pass@site.com','site.com:8443','*.site.com','bad..com','ftp://site.com']) {
    assert.throws(()=>parseAdNetworkSiteParams(new URLSearchParams({domain})),AdNetworkInputError,domain);
  }
  assert.throws(()=>parseAdNetworkSiteParams(new URLSearchParams('domain=a.com&domain=b.com')),AdNetworkInputError);
});

const { loadTypeScript } = await import('../../helpers/load-typescript.mjs');
const input = {parseAdNetworkSitesParams,parseAdNetworkSiteParams,AdNetworkInputError};
function route(kind, {published=true,fail=false}={}) {
  let calls=0;
  const lib={
    getAdNetworkSites: async query=>{calls++;if(fail)throw Error('database unavailable');return {rows:[],total:0,page:query.page,pageSize:query.pageSize,totalPages:1};},
    getAdNetworkCheckerSite: async domain=>{calls++;if(fail)throw Error('database unavailable');return domain==='known.com'?{site:{domain}}:null;},
  };
  const {GET}=loadTypeScript(new URL(`../../../app/api/ad-networks/${kind}/route.ts`,import.meta.url),{
    'next/server':{NextResponse:{json:(body,options)=>new Response(JSON.stringify(body),options)}},
    '@/lib/ad-networks':lib,'@/lib/page-registry':{getPublishedPage:async()=>published?{}:null},'../input':input,
  });
  return {GET,calls:()=>calls};
}
test('API responses cache successful lookups and keep unknown sites and invalid inputs uncached',async()=>{
  const api=route('site');
  const known=await api.GET(new Request('https://stack127.com/api/ad-networks/site?domain=known.com'));
  assert.equal(known.status,200);assert.match(known.headers.get('Cache-Control'),/public/);assert.match(known.headers.get('Cache-Tag'),/ad-networks-catalog/);
  const missing=await api.GET(new Request('https://stack127.com/api/ad-networks/site?domain=unknown.com'));
  assert.equal((await missing.json()).found,false);assert.equal(missing.headers.get('Cache-Control'),'no-store');
  const invalid=await api.GET(new Request('https://stack127.com/api/ad-networks/site?domain=127.0.0.1'));
  assert.equal(invalid.status,400);assert.equal(invalid.headers.get('Cache-Control'),'no-store');assert.equal(api.calls(),2);
});
test('unpublished directories and checker tools never reach their data loaders',async()=>{
  for(const [kind,query] of [['sites','network=mediavine'],['site','domain=known.com']]) {
    const api=route(kind,{published:false});const response=await api.GET(new Request(`https://stack127.com/api/ad-networks/${kind}?${query}`));
    assert.equal(response.status,404);assert.equal(response.headers.get('Cache-Control'),'no-store');assert.equal(api.calls(),0);
  }
});
test('database failures return uncached 503 responses for both APIs',async()=>{
  for(const [kind,query] of [['sites','niche=food'],['site','domain=known.com']]) {
    const api=route(kind,{fail:true});const response=await api.GET(new Request(`https://stack127.com/api/ad-networks/${kind}?${query}`));
    assert.equal(response.status,503);assert.equal(response.headers.get('Cache-Control'),'no-store');
  }
});


test('College Fashion retains its Mediavine manager after an unsuccessful publisher check',()=>{
  const evidence={reason:'content_type',manager_domains:[]};
  const relationship={slug:'mediavine',status:'confirmed',relationship_type:'primary_or_exclusive_manager',
    evidence:{manager_domain:'mediavine.com',matched_signal:'MANAGERDOMAIN=mediavine.com'}};
  assert.deepEqual(deriveManagedBy(evidence,networks,[relationship]),
    {managed_by:{slug:'mediavine',name:'Mediavine'},manager_domain:'mediavine.com'});
  assert.equal(deriveManagedBy(evidence,networks,[{...relationship,status:'ended'}]).managed_by,null);
  assert.equal(deriveManagedBy(evidence,networks,[{...relationship,relationship_type:'active_network_use'}]).managed_by,null);
  assert.equal(deriveManagedBy(evidence,networks,[relationship,{...relationship,slug:'journey-by-mediavine'}]).managed_by,null);
  assert.deepEqual(deriveManagedBy(evidence,networks,[{...relationship,evidence:{}}]).managed_by,{slug:'mediavine',name:'Mediavine'});
  assert.equal(deriveManagedBy({manager_domains:['journeymv.com']},networks,[relationship]).managed_by.slug,'journey-by-mediavine');
});
test('ads.txt previews preserve ten real lines and a later manager line within the byte cap',()=>{
  const first=Array.from({length:10},(_,i)=>`# source line ${i+1}`);
  const preview=buildAdsTxtPreview([...first,'unselected line','MANAGERDOMAIN=mediavine.com','another line'].join('\r\n'));
  assert.deepEqual(preview.split('\n'),[...first,'MANAGERDOMAIN=mediavine.com']);
  assert.equal(buildAdsTxtPreview(null),null);assert.equal(buildAdsTxtPreview(''),null);
  const bounded=buildAdsTxtPreview(Array.from({length:20},()=> '猫'.repeat(2000)).join('\n')+'\nMANAGERDOMAIN=mediavine.com');
  assert.ok(Buffer.byteLength(bounded)<=4096);assert.equal(bounded.includes('�'),false);
  assert.equal(bounded.split('\n').length,11);assert.ok(bounded.endsWith('MANAGERDOMAIN=mediavine.com'));
});

const {classifyNetworkArrivals,captureNetworkObservations}=await import('../../../scripts/ad-networks/movements.mjs');
test('initial backfill and first discoveries are separate from proved network joins',()=>{
  const first={checked_at:'2026-09-26T10:00:00Z',network_ids:['9']};
  assert.deepEqual(classifyNetworkArrivals(null,first,{baseline:true}),[{network_id:'9',event:'baseline'}]);
  assert.deepEqual(classifyNetworkArrivals(null,first),[{network_id:'9',event:'newly_found'}]);
  const absent={checked_at:'2026-09-27T10:00:00Z',network_ids:['4']};
  const added={checked_at:'2026-09-28T10:00:00Z',network_ids:['4','9']};
  assert.deepEqual(classifyNetworkArrivals(absent,added),[{network_id:'9',event:'joined'}]);
  assert.deepEqual(classifyNetworkArrivals(added,added),[]);
  assert.deepEqual(classifyNetworkArrivals(added,first),[]);
  assert.deepEqual(classifyNetworkArrivals(null,added,{known_site:true,known_network_ids:['4']}),[{network_id:'9',event:'baseline'}]);
  assert.deepEqual(classifyNetworkArrivals(null,added,{known_site:true,known_network_ids:['4','9']}),[]);
});
test('sync records an observed join after a retained negative check, then advances the check snapshot',async()=>{
  const calls=[];let reads=0;
  const client={query:async(sql,args)=>{
    calls.push({sql,args});
    if(sql.includes('select p.id::text')) return {rows:reads++ ? [] : [{id:'27',checked_at:'2026-10-15 12:00:00.123456+00',
      previous_checked_at:'2026-10-14T12:00:00Z',previous_network_ids:['4'],network_ids:['4','9'],known_network_ids:['4'],known_site:true}]};
    return {rows:[],rowCount:1};
  }};
  const result=await captureNetworkObservations(client);
  assert.deepEqual(result,{observations:1,arrivals:1});
  const events=JSON.parse(calls.find(c=>c.sql.startsWith('insert into public.ad_network_relationship_events')).args[0]);
  assert.deepEqual(events,[{network_id:'9',event:'joined',publisher_id:'27',observed_at:'2026-10-15 12:00:00.123456+00'}]);
  const snapshots=JSON.parse(calls.find(c=>c.sql.startsWith('insert into public.ad_network_check_observations')).args[0]);
  assert.deepEqual(snapshots[0].confirmed_network_ids,['4','9']);
  assert.equal(snapshots[0].checked_at,'2026-10-15 12:00:00.123456+00');
});

test('recovering an omitted or re-attributed confirmation does not manufacture a join',()=>{
  const previous={checked_at:'2026-10-16T09:00:00Z',network_ids:['4']};
  const current={checked_at:'2026-10-16T09:22:00Z',network_ids:['4','9']};
  // An older matcher lost a previously imported confirmation; no departure occurred.
  assert.deepEqual(classifyNetworkArrivals(previous,current,{known_network_ids:['4','9']}),[]);
  // A signature-based confirmation predates this check but had no event yet.
  assert.deepEqual(classifyNetworkArrivals(previous,current,{known_site:true,established_network_ids:['9']}),[
    {network_id:'9',event:'baseline'},
  ]);
  // An actual completed departure followed by a fresh positive still proves a return.
  assert.deepEqual(classifyNetworkArrivals(previous,current,{
    known_network_ids:['4','9'],established_network_ids:['9'],departed_network_ids:['9'],
  }),[{network_id:'9',event:'joined'}]);
});


test('manager aggregates retain confirmed evidence and use one population for numerator and denominator',()=>{
  const retained={slug:'mediavine',status:'confirmed',relationship_type:'primary_or_exclusive_manager',evidence:{manager_domain:'mediavine.com'}};
  const failed={reason:'content_type',manager_domains:[]};
  const groups=[
    {evidence:failed,manager_relationships:[retained],network_slugs:['mediavine'],has_summary:true,count:1},
    {evidence:failed,manager_relationships:[retained],network_slugs:['mediavine'],has_summary:false,count:100},
    {evidence:{},manager_relationships:[],network_slugs:['mediavine'],has_summary:true,count:1},
  ];
  const stats=aggregateAdNetworkManagers(groups,networks);
  assert.equal(stats.network_counts.mediavine.find(row=>row.key==='this-network').count,101);
  assert.equal(stats.network_counts.mediavine.find(row=>row.key==='not-listed').count,1);
  assert.equal(stats.with_manager,1);assert.equal(stats.measured,2);
  assert.equal(stats.with_manager/stats.measured,0.5);
  assert.equal(deriveManagedBy(failed,networks,[retained]).managed_by.slug,'mediavine');
});

test('traffic shares retain confirmed managers after failed checks and count each resolved site once',()=>{
  const retained={slug:'mediavine',status:'confirmed',relationship_type:'primary_or_exclusive_manager',
    evidence:{manager_domain:'mediavine.com'}};
  const failed={reason:'content_type',manager_domains:[]};
  const group={traffic_group:'top-100k',evidence:failed,manager_relationships:[retained],count:2};
  const groups=[
    group,
    {...group,evidence:{manager_domains:[{value:'mediavine.com'}]},count:1},
    {...group,evidence:{manager_domains:['journeymv.com']},count:1},
    {...group,manager_relationships:[{...retained,status:'ended'}],count:10},
    {...group,manager_relationships:[retained,{...retained,slug:'journey-by-mediavine'}],count:10},
  ];
  const expected=[{traffic_group:'top-100k',sites:4,networks:[
    {slug:'mediavine',name:'Mediavine',count:3,share:75},
    {slug:'journey-by-mediavine',name:'Journey',count:1,share:25},
  ]}];
  assert.deepEqual(aggregateAdNetworkTrafficShares(groups,networks),expected);
  assert.deepEqual(aggregateAdNetworkTrafficShares([...groups].reverse(),networks),expected);
  assert.deepEqual(aggregateAdNetworkTrafficShares([],networks),[]);
});
