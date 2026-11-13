import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyPublisher } from '../../../scripts/ad-networks/verify-publisher.mjs';
import { fetchHomepage,homepageChallenge } from '../../../scripts/ad-networks/fetch-policy.mjs';
import { openLocalDatabase } from '../../../scripts/ad-networks/local-db.mjs';
import { saveLocalVerification } from '../../../scripts/ad-networks/local-verifier-store.mjs';
import { saveVerification,homepageConfirmationExpired } from '../../../scripts/ad-networks/verifier-store.mjs';
import { correctionEligibility,correctionConfirmation,planCorrections,restoration,applySqliteCorrection } from '../../../scripts/ad-networks/correct-homepage-misses.mjs';
import { MATCHER_VERSION } from '../../../scripts/ad-networks/matcher.mjs';

const network={id:32,slug:'google-adsense',manager_domains:[],ad_system_domains:['google.com'],program_signatures:[{kind:'adsense_account_match'}]};
const manager={id:1,slug:'manager',manager_domains:['manager.com'],ad_system_domains:[],program_signatures:[]};
const ads={outcome:'parsed',text:'google.com,pub-1234567890123456,DIRECT\n',sha256:'hash',httpStatus:200};
const page={html:'<script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"></script>',finalUrl:'https://publisher.example/'};
const publisher={normalized_domain:'publisher.example',discovery_sources:[],last_check_evidence:{}};
const signal='google.com,pub-1234567890123456,DIRECT + ca-pub-1234567890123456';
async function verify(homepage,fetchAdsTxt=async()=>ads) {
  return verifyPublisher(publisher,[network,manager],{fetchAdsTxt,fetchHomepage:async()=>{
    if(homepage instanceof Error)throw homepage;
    return homepage;
  }});
}
function fixture(t) {
  const dir=mkdtempSync(join(tmpdir(),'ad-homepage-')),db=openLocalDatabase(join(dir,'store.sqlite'));
  t.after(()=>{db.close();rmSync(dir,{recursive:true,force:true});});
  const now='2026-10-01T00:00:00.000Z';
  db.prepare("insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at) values(1,'publisher.example','publisher.example',?,?,?,?)").run(now,now,now,now);
  db.prepare("insert into relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at,consecutive_misses,first_missed_at,last_missed_at,created_at,updated_at) values(32,1,'stale','active_network_use','ads_txt_and_adsense_account',?,?,?,2,?,?,?,?)")
    .run(JSON.stringify({matched_signal:signal,checked_url:'https://publisher.example/ads.txt',checked_at:now,parser_version:'ads-txt-1.1.0'}),now,now,now,'2026-10-03T00:00:00.000Z',now,now);
  return db;
}
for(const [name,homepage] of [['timeout',new Error('timeout')],['unavailable',null],
  ['soft challenge',{html:'<title>One moment, please...</title><script>wsidchk</script>'}],
  ['Cloudflare',{html:'<title>Just a moment...</title><form id="challenge-form"></form>'}]]) {
  test(name+' leaves a stale relationship completely unchanged',async t=>{
    const db=fixture(t),before=db.prepare('select * from relationships').get(),result=await verify(homepage);
    assert.deepEqual(result.inconclusiveNetworkIds,[32]);
    saveLocalVerification(db,{id:1,consecutive_failures:0},result);
    assert.deepEqual(db.prepare('select * from relationships').get(),before);
    const stored=db.prepare('select * from publishers').get();
    assert.equal(stored.consecutive_failures,1);assert.equal(stored.last_successful_check_at,null);
    assert.equal(Date.parse(stored.next_check_at)-Date.parse(result.checkedAt),6*3600000);
  });
}
test('304 refetches ads.txt and obtains fresh homepage evidence',async()=>{
  let calls=0,pages=0;
  const result=await verifyPublisher(publisher,[network],{
    fetchAdsTxt:async(_,conditional)=>{assert.ok(!conditional.etag);return ++calls===1?{outcome:'not_modified'}:ads;},
    fetchHomepage:async()=>{pages++;return page;},
  });
  assert.equal(calls,2);assert.equal(pages,1);assert.equal(result.matches.confirmed[0].networkId,32);
});
test('a repeated 304 neither confirms nor misses a homepage relationship',async t=>{
  const db=fixture(t),before=db.prepare('select * from relationships').get(),result=await verify(null,async()=>({outcome:'not_modified'}));
  assert.deepEqual(result.inconclusiveNetworkIds,[32]);assert.deepEqual(result.unchangedNetworkIds,[]);
  saveLocalVerification(db,{id:1,consecutive_failures:0},result);
  assert.deepEqual(db.prepare('select * from relationships').get(),before);
});
for(const [name,home,body] of [['fetched homepage without tag',{html:'<html><body>Real homepage</body></html>'},ads],
  ['ads.txt drops authorization',null,{...ads,text:'other.com,123,DIRECT'}]]) {
  test(name+' still ends after three valid misses over seven days',async t=>{
    const db=fixture(t),result=await verify(home,async()=>body);result.checkedAt='2026-10-09T00:00:00.000Z';
    assert.deepEqual(result.inconclusiveNetworkIds,[]);
    saveLocalVerification(db,{id:1,consecutive_failures:0},result);
    const row=db.prepare('select * from relationships').get();
    assert.equal(row.status,'ended');assert.equal(row.consecutive_misses,3);
    assert.equal(JSON.parse(row.evidence).last_absence.checked_at,result.checkedAt);
    assert.equal(JSON.parse(row.evidence).last_absence.matcher_version,MATCHER_VERSION);
  });
}
test('independent manager evidence still confirms during a homepage failure',async()=>{
  const result=await verify(null,async()=>({...ads,text:ads.text+'MANAGERDOMAIN=manager.com'}));
  assert.equal(result.matches.confirmed[0].networkId,1);assert.deepEqual(result.inconclusiveNetworkIds,[32]);
});
test('fetcher records HTTP and challenge outcomes; normal Cloudflare analytics remains usable',async()=>{
  const deps={lookup:async()=>[{address:'93.184.216.34',family:4}],sharedHostSlot:async()=>()=>{}};
  for(const [status,html,reason] of [[403,'blocked','http_status'],[200,'<title>One moment, please...</title>','challenge_page'],
    [200,'<title>Home</title><script src="/cdn-cgi/challenge-platform/scripts/jsd/main.js"></script>',undefined]]) {
    const result=await fetchHomepage('example.com',{...deps,fetch:async()=>new Response(html,{status,headers:{'content-type':'text/html'}})});
    assert.equal(result.reason,reason);assert.equal(result.httpStatus,status);assert.equal(result.outcome,reason?'inconclusive':'fetched');
  }
  assert.equal(homepageChallenge('<title>How Cloudflare works</title><p>Access denied errors</p>'),false);
});
test('PostgreSQL writer does not update an inconclusive relationship',async()=>{
  const queries=[],relationship={ad_network_id:'32',publisher_id:'1',status:'stale',consecutive_misses:2};
  const client={query:async(sql,args)=>{queries.push({sql,args});return{rows:sql.includes('for update')?[relationship]:[]};},release(){}};
  await saveVerification({connect:async()=>client},{id:1,consecutive_failures:0},await verify(null));
  assert.equal(queries.some(({sql})=>sql.includes('set status = $3')),false);
  const write=queries.find(({sql})=>sql.includes('update public.ad_network_publishers set'));
  assert.equal(write.args[3],1);assert.equal(write.args[6],false);
});
const damaged={ad_network_id:32,publisher_id:1,normalized_domain:'publisher.example',status:'ended',
  verification_method:'ads_txt_and_adsense_account',consecutive_misses:3,first_confirmed_at:'2026-09-26T00:00:00Z',
  first_missed_at:'2026-10-20T00:00:00Z',last_missed_at:'2026-11-13T00:00:00Z',ended_at:'2026-11-13T00:00:00Z',
  last_checked_at:'2026-11-13T00:00:00Z',last_check_outcome:'not_modified',
  last_confirmed_at:'2026-09-26T00:00:00Z',relationship_type:'active_network_use',
  evidence:{matched_signal:signal,ads_txt_sha256:'hash',checked_url:'https://publisher.example/ads.txt',checked_at:'2026-09-26',parser_version:'ads-txt-1.1.0'},last_check_evidence:{}};
test('correction includes full-fetch misses but still excludes old misses, changed signals and hashes',async()=>{
  assert.equal(correctionEligibility(damaged),'needs_live_confirmation');
  assert.equal(correctionEligibility({...damaged,verification_method:'ads_txt_managerdomain'}),'not_homepage_dependent');
  assert.equal(correctionEligibility({...damaged,last_check_outcome:'no_match'}),'needs_live_confirmation');
  assert.equal(correctionEligibility({...damaged,last_check_outcome:'no_match',last_check_evidence:{homepage:{outcome:'fetched'}}}),'needs_live_confirmation');
  assert.equal(correctionEligibility({...damaged,evidence:{...damaged.evidence,last_absence:{}}}),'needs_live_confirmation');
  assert.equal(correctionEligibility({...damaged,first_missed_at:'2026-09-27'}),'before_fault_window');
  const positive=await verify(page);
  assert.equal(correctionConfirmation(damaged,positive),'restore');
  assert.equal(correctionConfirmation(damaged,{...positive,sha256:'different'}),'ads_txt_changed_since_confirmation');
  assert.equal(correctionConfirmation({...damaged,evidence:{matched_signal:'other'}},positive),'live_signal_changed');
  const plan=await planCorrections([damaged,{...damaged,last_check_outcome:'no_match'}],[network],{verify:async()=>positive});
  assert.equal(plan.restores.length,2);assert.equal(plan.checked,1);
});

test('absence versions do not prove a historical error or prevent current reconfirmation',async()=>{
  const row=(absence,check={})=>({...damaged,evidence:{...damaged.evidence,last_absence:absence},last_check_evidence:check});
  for(const version of ['ad-network-1.4.1','ad-network-1.4.0','ad-network-1.2.1']){
    assert.equal(correctionEligibility(row({checked_at:damaged.last_missed_at,matcher_version:version})),'needs_live_confirmation');
    assert.equal(correctionEligibility(row({checked_at:damaged.last_missed_at},{matcher_version:version})),'needs_live_confirmation');
  }
  for(const version of [MATCHER_VERSION,'ad-network-1.4.2','ad-network-2.0.0','unknown',null]){
    assert.equal(correctionEligibility(row({checked_at:damaged.last_missed_at,matcher_version:version})),'needs_live_confirmation');
  }
  assert.equal(correctionEligibility(row({checked_at:'2026-09-27',matcher_version:'ad-network-1.4.1'})),'needs_live_confirmation');
  assert.equal(correctionEligibility(row({matcher_version:'ad-network-1.4.1'})),'needs_live_confirmation');
  assert.equal(correctionEligibility(row({checked_at:'2026-11-12'},{matcher_version:'ad-network-1.4.1'})),'needs_live_confirmation');
  assert.equal(correctionEligibility(row({checked_at:damaged.last_missed_at})), 'needs_live_confirmation');
  const positive=await verify(page);
  assert.equal(correctionConfirmation(damaged,{...positive,evidence:{...positive.evidence,matcher_version:'ad-network-1.4.1'}}),'live_matcher_not_current');
  const absent=await verify({html:'<h1>Normal homepage without the ad</h1>'});
  const plan=await planCorrections([row({checked_at:damaged.last_missed_at,matcher_version:'ad-network-1.4.1'})],[network],{verify:async()=>absent});
  assert.equal(plan.restores.length,0);assert.equal(plan.counts.live_network_absent,1);
});

test('widened full-fetch corrections require fresh exact evidence, including delayed code',async()=>{
  const positive=await verify({html:page.html.replace('<script src=', '<script type="litespeed/javascript" data-src=')});
  const fullFetch={...damaged,last_check_outcome:'no_match',last_check_evidence:{homepage:{outcome:'fetched'}}};
  for(const [result,reason] of [[positive,'restore'],[await verify(null),'live_check_inconclusive'],
    [await verify({html:'<h1>Normal page</h1>'}),'live_network_absent'],
    [await verify(page,async()=>({...ads,text:'google.com,pub-9999999999999999,DIRECT'})),'live_network_absent'],
    [{...positive,sha256:'changed'},'ads_txt_changed_since_confirmation']]){
    const plan=await planCorrections([fullFetch],[network],{verify:async()=>result});
    assert.equal(plan.counts[reason],1);assert.equal(plan.restores.length,reason==='restore'?1:0);
  }
});

test('PostgreSQL absence evidence saves the matcher version for future correction exclusions',async()=>{
  const queries=[],relationship={ad_network_id:'32',publisher_id:'1',status:'confirmed',consecutive_misses:0};
  const client={query:async(sql,args)=>{queries.push({sql,args});return{rows:sql.includes('for update')?[relationship]:[]};},release(){}};
  const result=await verify({html:'<h1>Normal home, no account</h1>'});
  await saveVerification({connect:async()=>client},{id:1,consecutive_failures:0},result);
  const write=queries.find(({sql})=>sql.includes("jsonb_build_object('last_absence'"));
  assert.equal(JSON.parse(write.args[6]).matcher_version,MATCHER_VERSION);
});
test('SQLite correction preserves dates, queues priority checks, and is repeatable',async t=>{
  const db=fixture(t),row={...db.prepare('select * from relationships').get(),normalized_domain:'publisher.example',
    last_check_outcome:'not_modified',last_checked_at:'2026-10-03T00:00:00.000Z'};
  const evidence=restoration(row,'2026-11-13T01:00:00Z');
  db.exec('begin immediate');assert.equal(applySqliteCorrection(db,{restores:[{...row,correction_evidence:evidence}]}).restored,1);db.exec('commit');
  const restored=db.prepare('select * from relationships').get();
  assert.equal(restored.status,'confirmed');assert.equal(restored.first_confirmed_at,row.first_confirmed_at);
  assert.equal(restored.last_confirmed_at,row.last_confirmed_at);assert.equal(restored.consecutive_misses,0);
  assert.equal(db.prepare('select verification_priority from publishers').get().verification_priority,100);
  assert.equal(correctionEligibility(restored),'already_restored');
  const positive=await verify(page);
  saveLocalVerification(db,{id:1,consecutive_failures:0},positive);
  assert.equal(JSON.parse(db.prepare('select evidence from relationships').get().evidence).homepage_miss_correction.version,'homepage-misses-v1');
  const plan=await planCorrections([restored],[network],{verify:async()=>{throw Error('must not fetch');}});
  assert.equal(plan.restores.length,0);
});

test('development PostgreSQL repair removes only the invalid departure, replaces uncertain snapshots and repeats safely',
  {skip:process.env.AD_NETWORKS_CORRECTION_DATABASE_TEST!=='1'},async()=>{
  const {targetPool}=await import('../../../scripts/ad-networks/runtime-db.mjs');
  const {applyPostgresCorrection,previewPostgresCorrection}=await import('../../../scripts/ad-networks/correct-homepage-misses.mjs');
  const pool=targetPool({environment:'development'}),client=await pool.connect();
  try {
    await client.query('begin');
    const {readFileSync}=await import('node:fs');
    await client.query(readFileSync(new URL('../../../supabase/migrations/20261113120000_ad_network_homepage_miss_repairs.sql',import.meta.url),'utf8').replace(/^begin;|commit;$/gm,''));
    const networkId=(await client.query("select id from public.ad_networks where slug='google-adsense'")).rows[0].id;
    const domain='homepage-correction-'+Date.now()+'.example';
    const pub=(await client.query("insert into public.ad_network_publishers(normalized_domain,display_domain) values($1,$1) returning id",[domain])).rows[0].id;
    const row={...damaged,ad_network_id:networkId,publisher_id:pub};
    await client.query("insert into public.ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at,consecutive_misses,first_missed_at,last_missed_at,ended_at) values($1,$2,'ended','active_network_use',$3,$4,$5,$5,3,$6,$7,$7)",
      [networkId,pub,row.verification_method,JSON.stringify(row.evidence),row.first_confirmed_at,row.first_missed_at,row.last_missed_at]);
    await client.query("insert into public.ad_network_daily_counts(ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count,captured_at) values($1,'2026-11-12',1,0,1,'2026-11-12') on conflict(ad_network_id,snapshot_on) do update set captured_at=excluded.captured_at",[networkId]);
    await client.query("insert into public.ad_network_check_observations(publisher_id,checked_at,confirmed_network_ids) values($1,$2,'{}')",[pub,row.last_missed_at]);
    await client.query("insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type) values($1,$2,'joined','2026-11-13T00:10:00Z','active_network_use'),($1,$2,'baseline','2026-11-13T00:10:00Z','active_network_use')",[networkId,pub]);
    const revisionBefore=(await client.query('select revision from public.stack127_ad_network_source_revision')).rows[0].revision;
    const proof=restoration(row,new Date().toISOString());
    const repairPlan={restores:[{...row,correction_evidence:proof}],repaired:[]};
    const preview=await previewPostgresCorrection(client,repairPlan);
    assert.equal(preview.wouldRemoveEvents,1);assert.equal(preview.wouldNeutralizeArrivals,1);assert.ok(preview.wouldInvalidateSnapshots>=1);
    await client.query('savepoint interrupted_history');
    await applyPostgresCorrection(client,repairPlan);
    await client.query('rollback to savepoint interrupted_history');
    assert.equal((await client.query('select count(*)::int n from public.ad_network_homepage_miss_repairs where publisher_id=$1',[pub])).rows[0].n,0);
    assert.equal((await client.query("select count(*)::int n from public.ad_network_relationship_events where publisher_id=$1 and event='left'",[pub])).rows[0].n,1);
    const first=await applyPostgresCorrection(client,repairPlan);
    assert.notEqual((await client.query('select revision from public.stack127_ad_network_source_revision')).rows[0].revision,revisionBefore);
    assert.ok((await client.query("select 1 from public.stack127_revalidation_events where entity_type='ad_networks' and slug='all'")).rowCount);
    assert.equal(first.restored,1);assert.equal(first.removedEvents,1);assert.equal(first.neutralizedArrivals,1);assert.ok(first.invalidatedSnapshots>=1);
    const after=(await client.query('select * from public.ad_network_publisher_relationships where ad_network_id=$1 and publisher_id=$2',[networkId,pub])).rows[0];
    assert.equal(after.status,'confirmed');assert.equal(after.first_confirmed_at.toISOString(),new Date(row.first_confirmed_at).toISOString());
    assert.equal((await client.query("select count(*)::int n from public.ad_network_relationship_events where ad_network_id=$1 and publisher_id=$2 and event='left'",[networkId,pub])).rows[0].n,0);
    assert.equal((await client.query("select verification_priority from public.ad_network_publishers where id=$1",[pub])).rows[0].verification_priority,100);
    const second=await applyPostgresCorrection(client,{restores:[],repaired:[after]});
    assert.equal(second.restored,0);assert.equal(second.removedEvents,0);assert.equal(second.invalidatedSnapshots,0);
    assert.equal(second.snapshots,0);assert.equal(second.historyRepaired,0);
    // A public check date is the successful verification, never a later blocked attempt.
    await client.query("update public.ad_network_publishers set last_checked_at='2026-11-13',last_successful_check_at='2026-10-01' where id=$1",[pub]);
    await client.query("update public.ad_network_publisher_relationships set status='stale' where publisher_id=$1",[pub]);
    const {adNetworksLibrary}=await import('./loader-harness.mjs');
    const lib=adNetworksLibrary((sql,args)=>client.query(sql,args));
    const publicSite=await lib.loadAdNetworkCheckerSite(domain);
    assert.equal(publicSite.site.last_checked_at,'2026-10-01T00:00:00.000Z');
    assert.equal(publicSite.relationships[0].status,'stale');
    assert.equal(publicSite.relationships[0].last_confirmed_at,new Date(row.last_confirmed_at).toISOString());
    const listing=await lib.loadAdNetworkSites({...lib.defaultAdNetworkSitesQuery(),q:domain,sort:'checked'});
    assert.equal(listing.rows[0].last_checked_at,'2026-10-01T00:00:00.000Z');

    // The same real database must preserve a genuine departure on reinstall.
    const returnedPub=(await client.query("insert into public.ad_network_publishers(normalized_domain,display_domain) values($1,$1) returning id",[domain+'-return'])).rows[0].id;
    const genuine={...row,publisher_id:returnedPub,last_check_outcome:'no_match',last_check_evidence:{homepage:{outcome:'fetched'}}};
    await client.query("insert into public.ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at,consecutive_misses,first_missed_at,last_missed_at,ended_at) values($1,$2,'ended','active_network_use',$3,$4,$5,$5,3,$6,$7,$7)",
      [networkId,returnedPub,genuine.verification_method,JSON.stringify(genuine.evidence),genuine.first_confirmed_at,genuine.first_missed_at,genuine.last_missed_at]);
    await client.query("insert into public.ad_network_daily_counts(ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count,captured_at) values($1,'2026-11-12',1,0,1,'2026-11-12') on conflict(ad_network_id,snapshot_on) do update set captured_at=excluded.captured_at",[networkId]);
    const returnAt='2026-11-13T03:00:00Z';
    const returnPlan={restores:[{...genuine,correction_evidence:restoration(genuine,returnAt,{matched_signal:signal,page_url:page.finalUrl})}],repaired:[]};
    assert.deepEqual(await previewPostgresCorrection(client,returnPlan),{wouldRemoveEvents:0,wouldNeutralizeArrivals:0,wouldInvalidateSnapshots:0});
    const current=await applyPostgresCorrection(client,returnPlan);
    assert.equal(current.currentReconfirmed,1);assert.equal(current.returnsRecorded,1);assert.equal(current.historyRepaired,0);
    assert.equal(current.removedEvents,0);assert.equal(current.invalidatedSnapshots,0);
    const events=(await client.query("select event from public.ad_network_relationship_events where publisher_id=$1 order by observed_at",[returnedPub])).rows.map(r=>r.event);
    assert.deepEqual(events,['left','joined']);
    const returned=(await client.query('select * from public.ad_network_publisher_relationships where publisher_id=$1',[returnedPub])).rows[0];
    assert.equal(returned.status,'confirmed');assert.equal(returned.last_confirmed_at.toISOString(),new Date(returnAt).toISOString());
    assert.equal((await client.query("select count(*)::int n from public.ad_network_daily_counts where ad_network_id=$1 and snapshot_on='2026-11-12'",[networkId])).rows[0].n,1);
    const repeated=await applyPostgresCorrection(client,{restores:[],repaired:[returned]});
    assert.equal(repeated.returnsRecorded,0);assert.equal(repeated.currentReconfirmed,0);
  } finally {await client.query('rollback');client.release();await pool.end();}
});
test('a blocked homepage protects AdSense and corroborated tag networks together',async()=>{
  const mgid={id:33,slug:'mgid',manager_domains:[],ad_system_domains:['mgid.com'],
    program_signatures:[{kind:'html_substring',value:'jsc.mgid.com',requires_direct_ad_system_domains:['mgid.com']}]};
  const result=await verifyPublisher(publisher,[network,mgid],{
    fetchAdsTxt:async()=>({...ads,text:ads.text+'mgid.com,123,DIRECT'}),
    fetchHomepage:async()=>({outcome:'inconclusive',httpStatus:403,reason:'http_status'}),
  });
  assert.deepEqual(result.inconclusiveNetworkIds,[32,33]);
  assert.equal(result.evidence.homepage.http_status,403);
});
test('homepage-only networks remain unknown when ads.txt is missing and the page is blocked',async()=>{
  const ethical={id:7,slug:'ethicalads',manager_domains:[],ad_system_domains:[],
    program_signatures:[{kind:'html_substring',value:'data-ea-publisher=',allow_without_ads_txt:true}]};
  const result=await verifyPublisher(publisher,[ethical],{
    fetchAdsTxt:async()=>({outcome:'no_ads_txt',httpStatus:404}),fetchHomepage:async()=>null,
  });
  assert.deepEqual(result.inconclusiveNetworkIds,[7]);
});
test('inconclusive checks back off to seven days and preserve the original absence count',async t=>{
  const db=fixture(t),before=db.prepare('select * from relationships').get();
  for(const [failures,hours] of [[1,24],[2,72],[3,168],[4,168]]) {
    const result=await verify(null);
    saveLocalVerification(db,{id:1,consecutive_failures:failures},result);
    const stored=db.prepare('select * from publishers').get();
    assert.equal(Date.parse(stored.next_check_at)-Date.parse(result.checkedAt),hours*3600000);
    assert.deepEqual(db.prepare('select * from relationships').get(),before);
  }
});
test('bounded correction batches advance a domain cursor; stats-only makes no network requests',async()=>{
  const rows=['a.example','b.example'].map(normalized_domain=>({...damaged,normalized_domain}));
  const positive=await verify(page);
  const first=await planCorrections(rows,[network],{limit:1,verify:async()=>positive});
  assert.equal(first.checked,1);assert.equal(first.nextAfterDomain,'a.example');assert.equal(first.counts.live_check_limit,1);
  const second=await planCorrections(rows,[network],{limit:1,afterDomain:first.nextAfterDomain,verify:async()=>positive});
  assert.equal(second.checked,1);assert.equal(second.nextAfterDomain,'b.example');
  const stats=await planCorrections(rows,[network],{statsOnly:true,verify:async()=>{throw Error('must not fetch');}});
  assert.equal(stats.checked,0);
});

test('active challenge fixtures exclude quoted examples, comments, inert HTML and contact forms',async()=>{
  const {readFileSync}=await import('node:fs');
  const fixtures=JSON.parse(readFileSync(new URL('./fixtures/homepage-challenges.json',import.meta.url),'utf8'));
  for(const fixture of fixtures) assert.equal(homepageChallenge(fixture.html),fixture.challenge,fixture.name);
});

test('homepage confirmation expires at 30 days, preserves dates and misses, and a real positive recovers',async t=>{
  const db=fixture(t),confirmed='2026-10-01T00:00:00.000Z';
  db.prepare("update relationships set status='confirmed',consecutive_misses=0,first_missed_at=null,last_missed_at=null").run();
  db.prepare('update publishers set last_successful_check_at=?').run(confirmed);
  for(const [checkedAt,expected] of [['2026-10-30T23:59:59.999Z','confirmed'],['2026-10-31T00:00:00.000Z','stale']]) {
    const result=await verify(null); result.checkedAt=checkedAt;
    saveLocalVerification(db,{id:1,consecutive_failures:0},result);
    const row=db.prepare('select * from relationships').get();
    assert.equal(row.status,expected);assert.equal(row.consecutive_misses,0);assert.equal(row.ended_at,null);
    assert.equal(row.last_confirmed_at,confirmed);
    assert.equal(db.prepare('select last_successful_check_at from publishers').get().last_successful_check_at,confirmed);
  }
  const positive=await verify(page);positive.checkedAt='2026-11-01T00:00:00.000Z';
  saveLocalVerification(db,{id:1,consecutive_failures:0},positive);
  const row=db.prepare('select * from relationships').get();
  assert.equal(row.status,'confirmed');assert.equal(row.last_confirmed_at,positive.checkedAt);
});

test('transport failures also expire homepage confirmation without creating a departure',async t=>{
  const db=fixture(t);db.exec("update relationships set status='confirmed'");
  const before=db.prepare('select * from relationships').get();
  saveLocalVerification(db,{id:1,consecutive_failures:0},{outcome:'temporary_error',checkedAt:'2026-11-02T00:00:00Z',evidence:{}});
  const after=db.prepare('select * from relationships').get();
  assert.equal(after.status,'stale');assert.equal(after.consecutive_misses,before.consecutive_misses);
  assert.equal(after.last_confirmed_at,before.last_confirmed_at);assert.equal(after.ended_at,null);
});

test('PostgreSQL expires unknown homepage confirmation without moving successful dates',async()=>{
  const queries=[],relationship={ad_network_id:'32',publisher_id:'1',status:'confirmed',verification_method:'ads_txt_and_adsense_account',last_confirmed_at:'2026-10-01'};
  const client={query:async(sql,args)=>{queries.push({sql,args});return {rows:sql.includes('for update')?[relationship]:[]};},release(){}};
  const result=await verify(null); result.checkedAt='2026-11-01T00:00:00Z';
  await saveVerification({connect:async()=>client},{id:1},result);
  assert.ok(queries.find(({sql})=>sql.includes("set status='stale'")));
  const write=queries.find(({sql})=>sql.includes('update public.ad_network_publishers set'));
  assert.equal(write.args[6],false);
});

test('expiry uses the saved page evidence time when a not-modified check moved the confirmation date',()=>{
  const relationship={status:'confirmed',verification_method:'ads_txt_and_adsense_account',
    last_confirmed_at:'2026-11-01T00:00:00Z',evidence:JSON.stringify({checked_at:'2026-10-01T00:00:00Z'})};
  assert.equal(homepageConfirmationExpired(relationship,'2026-11-13T00:00:00Z'),true);
  assert.equal(homepageConfirmationExpired({...relationship,evidence:{checked_at:'2026-11-01T00:00:00Z'}},'2026-11-13T00:00:00Z'),false);
  assert.equal(homepageConfirmationExpired({...relationship,evidence:'not json'},'2026-11-13T00:00:00Z'),false);
  assert.equal(homepageConfirmationExpired({...relationship,verification_method:'ads_txt_manager_domain',evidence:{checked_at:'2026-01-01'}},'2026-11-13T00:00:00Z'),false);
});

for(const store of ['PostgreSQL','SQLite']) test(store+': the first valid absence also expires an old confirmation, without ending it',async t=>{
  const result={outcome:'no_match',checkedAt:'2026-11-13T00:00:00Z',evidence:{},matches:{confirmed:[],review:[]},inconclusiveNetworkIds:[]};
  if(store==='SQLite'){
    const db=fixture(t);
    db.prepare("update relationships set status='confirmed',consecutive_misses=0,first_missed_at=null,last_missed_at=null,last_confirmed_at=?").run('2026-10-01T00:00:00.000Z');
    saveLocalVerification(db,{id:1,consecutive_failures:0},result);
    const row=db.prepare('select * from relationships').get();
    assert.equal(row.status,'stale');assert.equal(row.ended_at,null);assert.equal(row.consecutive_misses,1);
    return;
  }
  const queries=[],relationship={ad_network_id:'32',publisher_id:'1',status:'confirmed',verification_method:'ads_txt_and_adsense_account',
    last_confirmed_at:'2026-10-01',consecutive_misses:0,first_missed_at:null,last_missed_at:null,evidence:{checked_at:'2026-10-01'}};
  const client={query:async(sql,args)=>{queries.push({sql,args});return {rows:sql.includes('for update')?[relationship]:[]};},release(){}};
  await saveVerification({connect:async()=>client},{id:1},result);
  const stale=queries.find(({sql})=>sql.includes("set status='stale'"));
  assert.ok(stale);assert.match(stale.sql,/status='confirmed'/);
});

for(const [name,networks,text,homeCount] of [
  ['homepage network',[network],ads.text,1],['manager-only publisher in whole catalog',[network,manager],'MANAGERDOMAIN=manager.com',0],
]) test('conditional ads.txt reuses the full parse for '+name,async t=>{
  const db=fixture(t); let pages=0;
  const first=await verifyPublisher(publisher,networks,{fetchAdsTxt:async()=>({...ads,text,etag:'"v1"'}),fetchHomepage:async()=>{pages++;return page;}});
  saveLocalVerification(db,{id:1},first);
  const stored=db.prepare('select * from publishers').get();stored.last_check_evidence=JSON.parse(stored.last_check_evidence);stored.discovery_sources=[];
  pages=0;let calls=0;
  const second=await verifyPublisher(stored,networks,{fetchAdsTxt:async(_,conditional)=>{calls++;assert.equal(conditional.etag,'"v1"');return {outcome:'not_modified',httpStatus:304};},
    fetchHomepage:async()=>{pages++;return {html:'<h1>Real home, tag removed</h1>'};}});
  assert.equal(calls,1);assert.equal(pages,homeCount);assert.equal(second.sha256,'hash');
  assert.deepEqual(second.inconclusiveNetworkIds,[]);
  assert.deepEqual(second.matches.confirmed.map(m=>m.networkId),homeCount?[]:[manager.id]);
  assert.ok(second.evidence.ads_txt_cache.parsed.sellers);
});

test('cached ads.txt still needs a fresh homepage and cannot renew confirmation on a challenge',async()=>{
  const first=await verify(page,async()=>({...ads,etag:'v1'}));
  let pages=0;
  const second=await verifyPublisher({...publisher,last_check_evidence:first.evidence},[network],{
    fetchAdsTxt:async()=>({outcome:'not_modified'}),fetchHomepage:async()=>{pages++;return null;},
  });
  assert.equal(pages,1);assert.deepEqual(second.inconclusiveNetworkIds,[32]);assert.equal(second.matches.confirmed.length,0);
});

test('review-promoted corrections require both the original seller line and live page signature',async()=>{
  const mgid={id:33,slug:'mgid',ad_system_domains:['mgid.com'],program_signatures:[{kind:'html_substring',value:'jsc.mgid.com'}]};
  const row={...damaged,ad_network_id:33,verification_method:'ads_txt_and_page_signature',
    evidence:{...damaged.evidence,matched_signal:'mgid.com,123,DIRECT',page_signature:'page:jsc.mgid.com'}};
  const check=async text=>verifyPublisher(publisher,[mgid],{fetchAdsTxt:async()=>({...ads,text}),fetchHomepage:async()=>({html:'<script src="https://jsc.mgid.com/tag.js"></script>'})});
  const positive=await check('mgid.com,123,DIRECT');assert.equal(correctionConfirmation(row,positive),'restore');
  assert.equal(correctionConfirmation(row,await check('mgid.com,456,DIRECT')),'live_signal_changed');
  assert.equal(correctionConfirmation({...row,evidence:{...row.evidence,page_signature:'page:other-tag'}},positive),'live_signal_changed');
});

test('history repairs honor independent bounds, cursors and durable completion checkpoints',async()=>{
  const restored=domain=>({...damaged,normalized_domain:domain,status:'confirmed',consecutive_misses:0,evidence:restoration(damaged,'2026-11-13T01:00:00Z')});
  const rows=['a.example','b.example','c.example'].map(restored);
  const first=await planCorrections(rows,[],{statsOnly:true,limit:100,historyLimit:1});
  assert.equal(first.repaired.length,1);assert.equal(first.nextAfterDomain,'a.example');assert.equal(first.counts.history_limit,2);
  const next=await planCorrections(rows,[],{statsOnly:true,limit:1,afterDomain:first.nextAfterDomain});
  assert.equal(next.repaired.length,1);assert.equal(next.repaired[0].normalized_domain,'b.example');
  const retry=await planCorrections([{...rows[0],history_repaired_at:'2026-11-13'},rows[1]],[],{statsOnly:true,limit:1});
  assert.equal(retry.repaired[0].normalized_domain,'b.example');assert.equal(retry.counts.history_complete,1);
  // History still needs repair if an interrupted stage was followed by a real verifier miss.
  const interrupted=await planCorrections([{...rows[0],status:'stale',consecutive_misses:1}],[],{statsOnly:true});
  assert.equal(interrupted.repaired.length,1);assert.equal(interrupted.restores.length,0);
});

test('wrong environment and SQLite aliases are rejected before writable opening',async t=>{
  const {assertCorrectionStore,runCorrection}=await import('../../../scripts/ad-networks/correct-homepage-misses.mjs');
  const {writeFileSync,symlinkSync}=await import('node:fs');
  const dir=mkdtempSync(join(tmpdir(),'ad-store-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const source=join(dir,'source.sqlite'),other=join(dir,'other.sqlite'),alias=join(dir,'alias.sqlite');
  writeFileSync(source,'');writeFileSync(other,'');symlinkSync(other,alias);
  const options={environment:'development',apply:true,store:'sqlite',sqlite:source};
  assert.throws(()=>assertCorrectionStore(options,{AD_NETWORKS_RUNTIME_ENVIRONMENT:'production',AD_NETWORK_DB_PATH:source}),/environment mismatch/);
  assert.throws(()=>assertCorrectionStore(options,{}),/require AD_NETWORKS_RUNTIME_ENVIRONMENT/);
  assert.throws(()=>assertCorrectionStore({...options,sqlite:alias},{AD_NETWORKS_RUNTIME_ENVIRONMENT:'development',AD_NETWORK_DB_PATH:source}),/source path/);
  assert.doesNotThrow(()=>assertCorrectionStore(options,{AD_NETWORKS_RUNTIME_ENVIRONMENT:'development',AD_NETWORK_DB_PATH:source}));
  await assert.rejects(runCorrection({...options,environment:'production'}),/--confirm/);
});

test('each domain is admitted before the deadline and unstarted leases are released',async()=>{
  const {runVerificationBatch}=await import('../../../scripts/ad-networks/verification-batch.mjs');
  let now=0;const started=[],released=[];
  await runVerificationBatch([1,2,3,4].map(id=>({id})),{concurrency:1,deadline:10,now:()=>now,
    process:async row=>{started.push(row.id);now+=6;},release:async id=>released.push(id)});
  assert.deepEqual(started,[1,2]);assert.deepEqual(released,[3,4]);
  await runVerificationBatch([{id:5}],{concurrency:1,deadline:10,now:()=>10,
    process:async()=>assert.fail('must not start at deadline'),release:async id=>released.push(id)});
  assert.deepEqual(released,[3,4,5]);
});

test('interrupted SQLite source stage rolls back and can safely restart before sync',async t=>{
  const db=fixture(t),row={...db.prepare('select * from relationships').get(),normalized_domain:'publisher.example'};
  const planned={...row,correction_evidence:restoration(row,'2026-11-13T01:00:00Z')};
  db.exec('begin immediate');applySqliteCorrection(db,{restores:[planned]});db.exec('rollback');
  assert.deepEqual({...db.prepare('select * from relationships').get()},Object.fromEntries(Object.entries(row).filter(([key])=>key!=='normalized_domain')));
  db.exec('begin immediate');applySqliteCorrection(db,{restores:[planned]});db.exec('commit');
  const restored=db.prepare('select * from relationships').get();
  const resume=await planCorrections([{...restored,normalized_domain:row.normalized_domain}],[],{verify:async()=>assert.fail('restored source must not refetch')});
  assert.equal(resume.restores.length,0);assert.equal(resume.repaired.length,1);
});

test('a failed worker releases unstarted leases after all admitted workers settle',async()=>{
  const {runVerificationBatch}=await import('../../../scripts/ad-networks/verification-batch.mjs');
  const released=[],finished=[];
  await assert.rejects(runVerificationBatch([1,2,3].map(id=>({id})),{concurrency:2,deadline:100,now:()=>0,
    process:async row=>{if(row.id===1)throw Error('save failed');await new Promise(resolve=>setImmediate(resolve));finished.push(row.id);},
    release:async id=>{assert.deepEqual(finished,[2]);released.push(id);}}),/save failed/);
  assert.deepEqual(released,[3]);
});

test('public stale relationship reports unknown freshness and its last successful confirmation',async()=>{
  const {loadTypeScript}=await import('../../helpers/load-typescript.mjs');
  const view=loadTypeScript(new URL('../../../app/(site)/(tools)/ad-network-checker/ad-network-checker-view.ts',import.meta.url),{});
  assert.equal(view.statusLabel({status:'stale',last_confirmed_at:'2026-10-01T00:00:00Z'}),'Verification stale; last confirmed Oct 1, 2026');
});

test('a declared subdomain cache never supplies validators for the root ads.txt file',async()=>{
  const {parseAdsTxt}=await import('../../../scripts/ad-networks/ads-txt.mjs');
  const rootAds={...ads,text:'SUBDOMAIN=blog.publisher.example\n'+ads.text,checkedUrl:'https://publisher.example/ads.txt'};
  const cache={parsed:parseAdsTxt('manager.com,999,DIRECT'),etag:'subdomain-v1',checkedUrl:'https://blog.publisher.example/ads.txt'};
  const result=await verifyPublisher({...publisher,normalized_domain:'blog.publisher.example',last_check_evidence:{ads_txt_cache:cache}},[network],{
    fetchAdsTxt:async(_,conditional)=>{assert.equal(conditional.etag,undefined);return rootAds;},
    fetchDeclaredSubdomainAdsTxt:async()=>({...ads,checkedUrl:'https://blog.publisher.example/ads.txt'}),fetchHomepage:async()=>page,
  });
  assert.equal(result.matches.confirmed[0].networkId,32);assert.ok(result.adsTxtSummary);
});

for (const proven of [false,true]) test(`${proven?'proven false miss':'genuine removal then reinstall'}: current use recovers and history follows saved proof`,async t=>{
  const {applyPostgresCorrection,previewPostgresCorrection}=await import('../../../scripts/ad-networks/correct-homepage-misses.mjs');
  const db=fixture(t);
  db.prepare("update relationships set status='ended',ended_at=last_missed_at").run();
  const source=db.prepare('select * from relationships').get();
  const row={...source,normalized_domain:'publisher.example',last_checked_at:source.last_missed_at,
    last_check_outcome:proven?'not_modified':'no_match',last_check_evidence:{homepage:proven?{outcome:'inconclusive'}:{outcome:'fetched'}}};
  const positive=await verify(page);
  const plan=await planCorrections([row],[network],{verify:async()=>positive});
  assert.equal(plan.restores.length,1);
  assert.equal(plan.restores[0].correction_evidence.homepage_miss_correction.history_action,proven?'repair':'preserve');
  assert.equal(plan.counts[proven?'history_correction':'current_reconfirmation'],1);
  applySqliteCorrection(db,plan);
  const after=db.prepare('select * from relationships').get();
  assert.equal(after.status,'confirmed');assert.equal(after.ended_at,null);assert.equal(after.consecutive_misses,0);
  assert.equal(after.first_confirmed_at,source.first_confirmed_at);
  assert.equal(after.last_confirmed_at,proven?source.last_confirmed_at:positive.checkedAt);
  if(!proven)assert.equal(homepageConfirmationExpired(after,positive.checkedAt),false);
  const queries=[],departures=[{event:'left',observed_at:source.last_missed_at}],returns=[],checkpoints=new Set();
  const client={query:async(sql,args)=>{
    queries.push({sql,args});
    if(sql.includes('select 1 from public.ad_network_homepage_miss_repairs'))return {rowCount:checkpoints.size,rows:[]};
    if(sql.includes('insert into public.ad_network_homepage_miss_repairs'))checkpoints.add(args[2]);
    if(sql.includes('delete from public.ad_network_relationship_events')&&sql.includes("event='left'"))departures.length=0;
    if(sql.includes('insert into public.ad_network_relationship_events'))returns.push({event:'joined',observed_at:args[2]});
    return {rowCount:1,rows:[]};
  }};
  // Mirror the real release: repair the source, sync it, then finalize on PG.
  const synced={...after,normalized_domain:row.normalized_domain};
  const finish={restores:[],repaired:[synced]};
  if(!proven)assert.deepEqual(await previewPostgresCorrection(client,finish),{
    wouldRemoveEvents:0,wouldNeutralizeArrivals:0,wouldInvalidateSnapshots:0});
  const applied=await applyPostgresCorrection(client,finish);
  assert.equal(departures.length,proven?0:1);
  assert.deepEqual(returns,proven?[]:[{event:'joined',observed_at:positive.checkedAt}]);
  assert.equal(applied.historyRepaired,proven?1:0);assert.equal(applied.currentReconfirmed,proven?0:1);
  assert.equal(queries.some(q=>q.sql.includes('delete from public.ad_network_daily_counts')),proven);
  assert.equal(queries.some(q=>q.sql.includes('update public.ad_network_check_observations')),proven);
  const again=await applyPostgresCorrection(client,finish);
  assert.equal(again.returnsRecorded,0);assert.equal(again.historyRepaired,0);assert.equal(returns.length,proven?0:1);
});

test('stored versions and fresh delayed markup never prove a full-fetch miss was false',async()=>{
  const {historyCorrectionProof}=await import('../../../scripts/ad-networks/correct-homepage-misses.mjs');
  for(const version of ['ad-network-1.3.0','ad-network-1.4.1',MATCHER_VERSION,null]){
    const row={...damaged,last_check_outcome:'no_match',last_check_evidence:{matcher_version:version,homepage:{outcome:'fetched'}},
      evidence:{...damaged.evidence,last_absence:{checked_at:damaged.last_missed_at,matcher_version:version}}};
    assert.equal(historyCorrectionProof(row),null);
    const plan=await planCorrections([row],[network],{verify:async()=>verify({html:page.html.replace('src=', 'type="litespeed/javascript" data-src=')})});
    assert.equal(plan.counts.current_reconfirmation,1);assert.equal(plan.counts.history_correction,undefined);
  }
  assert.equal(historyCorrectionProof({...damaged,last_checked_at:'2026-11-14'}),null);
  assert.equal(historyCorrectionProof({...damaged,last_check_outcome:'no_match',last_check_evidence:{homepage:{outcome:'inconclusive'}}}),'homepage_inconclusive');
});

test('all fresh Taboola signatures and AdSense accounts can reconfirm the exact original',async()=>{
  const taboola={id:33,slug:'taboola',ad_system_domains:['taboola.com'],program_signatures:[
    {kind:'html_substring',value:'cdn.taboola.com/libtrc/'},{kind:'html_substring',value:'static.tblcontent.com/libtrc/'}]};
  const fresh=await verifyPublisher(publisher,[taboola],{
    fetchAdsTxt:async()=>({...ads,text:'taboola.com,123,DIRECT'}),
    fetchHomepage:async()=>({html:'<script src="https://cdn.taboola.com/libtrc/original/loader.js"></script><script type="litespeed/javascript" data-src="https://static.tblcontent.com/libtrc/other/loader.js"></script>'}),
  });
  assert.equal(fresh.matches.confirmed[0].evidence.matched_signal,'page:static.tblcontent.com/libtrc/');
  assert.equal(fresh.matches.confirmed[0].signals.length,2);
  const row={...damaged,ad_network_id:33,verification_method:'ads_txt_and_page_signature',
    evidence:{...damaged.evidence,matched_signal:'page:cdn.taboola.com/libtrc/'}};
  assert.equal(correctionConfirmation(row,fresh),'restore');
  assert.equal(correctionConfirmation({...row,evidence:{...row.evidence,matched_signal:'taboola.com,123,DIRECT',page_signature:'page:cdn.taboola.com/libtrc/'}},fresh),'restore');
  assert.equal(correctionConfirmation({...row,evidence:{...row.evidence,matched_signal:'taboola.com,456,DIRECT',page_signature:'page:cdn.taboola.com/libtrc/'}},fresh),'live_signal_changed');
  assert.equal(correctionConfirmation(row,{...fresh,sha256:'changed'}),'ads_txt_changed_since_confirmation');
  const multi=await verify({html:page.html+page.html.replaceAll('1234567890123456','1234567890123457')},async()=>({...ads,text:ads.text+'google.com,pub-1234567890123457,DIRECT'}));
  assert.equal(multi.matches.confirmed[0].signals.length,2);
  assert.equal(correctionConfirmation(damaged,multi),'restore');
});

test('legacy restored full-fetch markers cannot authorize history deletion',async()=>{
  const {previewPostgresCorrection}=await import('../../../scripts/ad-networks/correct-homepage-misses.mjs');
  const row={...damaged,status:'confirmed',last_check_outcome:'no_match',consecutive_misses:0};
  row.evidence=restoration(row,'2026-11-13T01:00:00Z');
  delete row.evidence.homepage_miss_correction.history_action;
  delete row.evidence.homepage_miss_correction.history_proof;
  const plan=await planCorrections([row],[],{statsOnly:true});
  assert.equal(plan.counts.current_reconfirmation,1);
  assert.deepEqual(await previewPostgresCorrection({query:async()=>assert.fail('must not select destructive repairs')},plan),{
    wouldRemoveEvents:0,wouldNeutralizeArrivals:0,wouldInvalidateSnapshots:0});
});


for (const [name,html] of [
  ['held inline', '<script type="text/plain" data-category="marketing">const unused = "ca-pub-1234567890123456";</script>'],
  ['parse failure', '<script>adsbygoogle.push({client: "ca-pub-1234567890123456"}; broken syntax</script>'],
]) test(`${name} retries without a miss and expires only to stale after 30 days`, async t => {
  const db=fixture(t);
  db.prepare("update relationships set status='confirmed',consecutive_misses=0,first_missed_at=null,last_missed_at=null").run();
  const before=db.prepare('select * from relationships').get();
  const result=await verify({html});
  result.checkedAt='2026-10-20T00:00:00.000Z';
  saveLocalVerification(db,{id:1,consecutive_failures:0},result);
  assert.deepEqual(db.prepare('select * from relationships').get(),before);
  const stored=db.prepare('select * from publishers').get();
  assert.equal(stored.consecutive_failures,1);
  assert.equal(Date.parse(stored.next_check_at)-Date.parse(result.checkedAt),6*3600000);
  result.checkedAt='2026-11-01T00:00:00.000Z';
  saveLocalVerification(db,{id:1,consecutive_failures:1},result);
  const expired=db.prepare('select * from relationships').get();
  assert.equal(expired.status,'stale');assert.equal(expired.consecutive_misses,0);
  assert.equal(expired.ended_at,null);assert.equal(expired.last_confirmed_at,before.last_confirmed_at);
  assert.equal(JSON.parse(expired.evidence).last_absence,undefined);
  const queries=[],client={query:async(sql,args)=>{queries.push({sql,args});return {rows:sql.includes('for update')?[before]:[]};},release(){}};
  await saveVerification({connect:async()=>client},{id:1,consecutive_failures:0},result);
  assert.equal(queries.some(q=>q.sql.includes("jsonb_build_object('last_absence'")),false);
  assert.ok(queries.some(q=>q.sql.includes("set status='stale'")));
});
