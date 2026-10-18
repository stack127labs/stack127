import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {summarizeAdsTxt,homepageFacts,businessName,registrationDate,registrationTld,cruxBucket} from '../../../scripts/ad-networks/enrichment-parsers.mjs';
import {openLocalDatabase} from '../../../scripts/ad-networks/local-db.mjs';
import {claimLocalPublishers,saveLocalVerification} from '../../../scripts/ad-networks/local-verifier-store.mjs';
import {mapSyncPublisher} from '../../../scripts/ad-networks/sync.mjs';
import {validateNicheResult,publicNiche} from '../../../scripts/ad-networks/niche-import.mjs';
import {pendingSites,saveState} from '../../../scripts/ad-networks/enrichment-store.mjs';

test('uncertain niche suggestions stay unpublished while supported labels are retained',()=>{
  for(const confidence of ['low',0,0.5,0.79])assert.equal(publicNiche({niche:'food',confidence}),null);
  for(const confidence of ['medium','high',0.8,1])assert.equal(publicNiche({niche:'food',confidence}),'food');
  assert.equal(publicNiche({niche:null,confidence:'high'}),null);
});

test('ads.txt summary counts source lines and duplicate records while retaining a bounded preview',()=>{
  const text='# Header\r\n\r\na.example, id, DIRECT\r\na.example, id, DIRECT\r\nb.example, b, RESELLER\r\ninvalid\r\n';
  const summary=summarizeAdsTxt(text);
  assert.deepEqual({...summary,preview:null},{summary_version:1,lines:6,companies:2,direct:2,reseller:1,invalid:1,
    seller_domains:['a.example','b.example'],top_sellers:[{name:'a.example',lines:2},{name:'b.example',lines:1}],preview:null});
  const long=summarizeAdsTxt(('é'.repeat(600)+'\n').repeat(15)+'MANAGERDOMAIN=mediavine.com\n');
  assert.ok(Buffer.byteLength(long.preview)<=4096);
  assert.match(long.preview,/MANAGERDOMAIN=mediavine.com/);
  assert.equal(summarizeAdsTxt('').lines,0);
  assert.equal(summarizeAdsTxt('b\0i\0n\0a\0r\0y').preview,null);
});

test('sync leaves a binary preview unknown while preserving its summary and raw SQLite value',()=>{
  const source={lines:2,companies:0,direct:0,reseller:0,invalid:2,preview:'b\0i\0n\0a\0r\0y'};
  const mapped=mapSyncPublisher({ads_txt_summary:source});
  assert.deepEqual(mapped.ads_txt_summary,{...source,preview:null});
  assert.ok(source.preview.includes('\0'));
  assert.equal(JSON.stringify(mapped).includes('\\u0000'),false);
});

test('homepage signatures identify platforms and preserve unknown facts',()=>{
  const signatures={WordPress:'<link href="/wp-content/themes/a.css">',Shopify:'<script src="https://cdn.shopify.com/a.js"></script>',
    Squarespace:'<script src="https://static1.squarespace.com/a.js"></script>',Wix:'<script src="https://static.wixstatic.com/a.js"></script>',
    Ghost:'<meta name="generator" content="Ghost 6.0">',Webflow:'<html data-wf-site="123">',
    'Next.js':'<script src="/_next/static/a.js"></script>',Astro:'<astro-island>',Blogger:'<meta content="blogger" name="generator">',
    Drupal:'<div data-drupal-selector="page">'};
  for(const [platform,html] of Object.entries(signatures))assert.equal(homepageFacts(html,'https://example.com').platform,platform);
  assert.deepEqual(homepageFacts('<html lang="en-US"><title>A &amp; B</title><meta content="A useful site" name="description"><h1>Hello <em>world</em></h1><link rel="shortcut icon" href="/icon.png">','https://example.com/page'),
    {title:'A & B',description:'A useful site',h1:'Hello world',language:'en-us',platform:null,favicon:'https://example.com/icon.png'});
  assert.equal(homepageFacts('<p>A WordPress tutorial</p>','https://example.com').platform,null);
  assert.equal(homepageFacts('<title>Just a moment...</title><script>cf-chl-foo</script>','https://example.com'),null);
  assert.equal(homepageFacts('<link rel="icon" href="javascript:alert(1)">','https://example.com').favicon,null);
});

test('monthly homepage refresh revisits old facts without bypassing future retry dates',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-homepage-due-'));
  const db=openLocalDatabase(join(directory,'test.sqlite'));
  try {
    const network=db.prepare('select id from ad_networks limit 1').get().id;
    for(let id=1;id<=3;id++) {
      db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at)
        values(?,?,?,datetime('now'),datetime('now'),datetime('now'),datetime('now'))`).run(id,`due${id}.example`,`due${id}.example`);
      db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,evidence,created_at,updated_at)
        values(?,?,'confirmed','active_network_use','{}',datetime('now'),datetime('now'))`).run(network,id);
      saveState(db,id,'homepage','measured');
    }
    db.prepare("update enrichment_state set checked_at=? where publisher_id in (1,3)").run(new Date(Date.now()-40*86400000).toISOString());
    db.prepare('update enrichment_state set retry_at=? where publisher_id=3').run(new Date(Date.now()+86400000).toISOString());
    assert.deepEqual(pendingSites(db,'homepage').map(row=>row.id),[]);
    assert.deepEqual(pendingSites(db,'homepage',false,'p.id',30*86400).map(row=>row.id),[1]);
  } finally {db.close();rmSync(directory,{recursive:true,force:true});}
});

test('seller names require the same conservative business suffixes as public reports',()=>{
  for(const name of ['Example LLC','Example Ltd.','Example Inc','Example Limited','Example GmbH','Example Corporation','Example Corp.'])assert.equal(businessName(name),name);
  for(const name of ['Jane Smith','Jane Smith Media','Example','Inc','<b>Example LLC',null])assert.equal(businessName(name),null);
});

test('RDAP dates require a valid registration event, never expiration or a future/invalid date',()=>{
  assert.equal(registrationTld('example.co.uk'),'uk');assert.equal(registrationTld('example.com.br'),'br');
  assert.equal(registrationTld('EXAMPLE.COM'),'com');
  const record={objectClassName:'domain',events:[{eventAction:'expiration',eventDate:'2030-01-01T00:00:00Z'},
    {eventAction:'registration',eventDate:'2000-02-29T04:00:00Z'}]};
  assert.equal(registrationDate(record),'2000-02-29');
  assert.equal(registrationDate({...record,ldhName:'OTHER.COM'},Date.now(),'example.com'),null);
  assert.equal(registrationDate({objectClassName:'domain',events:[{eventAction:'registration',eventDate:'2000-01-01T01:00:00+02:00'}]}),'1999-12-31');
  for(const eventDate of ['garbage','2024-02-31T00:00:00Z','9999-01-01T00:00:00Z'])assert.equal(registrationDate({objectClassName:'domain',events:[{eventAction:'registration',eventDate}]}),null);
  assert.equal(registrationDate({...record,objectClassName:'entity'}),null);
  assert.equal(registrationDate({objectClassName:'domain'}),null);
});

test('CrUX buckets use magnitude thresholds and reject arbitrary ranks',()=>{
  assert.deepEqual([1000,5000,10000,50000,100000,500000,1000000].map(cruxBucket),['top-10k','top-10k','top-10k','top-100k','top-100k','top-1m','top-1m']);
  for(const value of [null,0,12,2000000,'NaN'])assert.equal(cruxBucket(value),null);
});

test('niche results accept known slugs and preserve valid confidence labels or scores',()=>{
  assert.equal(validateNicheResult({domain:'www.example.com',niche:'food',confidence:0.8}).domain,'example.com');
  assert.equal(validateNicheResult({domain:'example.com',niche:null,confidence:0}).niche,null);
  for(const confidence of ['high','medium','low'])assert.equal(validateNicheResult({domain:'example.com',niche:'food',confidence}).confidence,confidence);
  for(const row of [{domain:'example.com',niche:'made-up',confidence:1},{domain:'example.com',niche:'food',confidence:'uncertain'},
    {domain:'example.com',niche:'food',confidence:1.01}])assert.throws(()=>validateNicheResult(row));
});

test('local queue reserves unchecked capacity, respects leases, and stores reusable fetch facts',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-enrichment-'));const db=openLocalDatabase(join(directory,'test.sqlite'));
  try{
    for(let id=1;id<=8;id++)db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at,verification_priority,last_check_outcome)
      values(?,?,?,'2020-01-01','2020-01-01','2020-01-01','2020-01-01',?,?)`).run(id,`site${id}.com`,`site${id}.com`,id<=4?80:100,id<=4?null:'matched');
    const batch=claimLocalPublishers(db,{limit:4,leaseMinutes:10});
    assert.equal(batch.length,4);assert.ok(batch.some(p=>p.last_check_outcome===null));assert.ok(batch.some(p=>p.verification_priority===100));
    const unchecked=claimLocalPublishers(db,{limit:4,leaseMinutes:10,uncheckedOnly:true});
    assert.equal(unchecked.length,3);assert.ok(unchecked.every(p=>p.last_check_outcome===null));assert.ok(unchecked.every(p=>!batch.some(b=>b.id===p.id)));
    const summary=summarizeAdsTxt('example.com, id, DIRECT');
    saveLocalVerification(db,unchecked[0],{outcome:'no_match',checkedAt:new Date().toISOString(),evidence:{},adsTxtSummary:summary,
      homepageFacts:{platform:'WordPress',favicon:'https://example.com/icon.png',title:'Example'}});
    const saved=db.prepare('select * from publishers where id=?').get(unchecked[0].id);
    assert.deepEqual(mapSyncPublisher(saved).ads_txt_summary,summary);assert.equal(mapSyncPublisher(saved).platform,'WordPress');
    assert.equal(db.prepare("select status from enrichment_state where publisher_id=? and kind='homepage'").get(saved.id).status,'measured');
    assert.equal(Object.hasOwn(mapSyncPublisher({normalized_domain:'old.com'}),'platform'),false);
  }finally{db.close();rmSync(directory,{recursive:true,force:true});}
});

test('online snapshots preserve a complete source while another connection writes',async()=>{
  const {snapshotLocal}=await import('../../../scripts/ad-networks/snapshot-local.mjs');
  const {DatabaseSync}=await import('node:sqlite');
  const directory=mkdtempSync(join(tmpdir(),'s127-snapshot-')),path=join(directory,'working.sqlite'),output=join(directory,'snapshot.sqlite');
  const writer=openLocalDatabase(path);
  try{
    writer.exec('create table sample(id integer primary key, payload text)');
    const insert=writer.prepare('insert into sample(payload) values(?)');
    writer.exec('begin');for(let i=0;i<500;i++)insert.run('x'.repeat(1000));writer.exec('commit');
    const copying=snapshotLocal(path,output);
    const timer=setInterval(()=>insert.run('later'),1);
    try{await copying;}finally{clearInterval(timer);}
    const snapshot=new DatabaseSync(output,{readOnly:true});
    try{assert.equal(snapshot.prepare('pragma quick_check').get().quick_check,'ok');
      const rows=snapshot.prepare('select count(*) n from sample').get().n;assert.ok(rows>=500);
      assert.ok(rows<=writer.prepare('select count(*) n from sample').get().n);
    }finally{snapshot.close();}
  }finally{writer.close();rmSync(directory,{recursive:true,force:true});}
});

test('fetches to one host wait for the previous response body to finish',async()=>{
  const {safeFetch}=await import('../../../scripts/ad-networks/fetch-policy.mjs');
  let calls=0,finish;
  const firstBody=new ReadableStream({start(controller){finish=()=>{controller.enqueue(new TextEncoder().encode('first'));controller.close();};}});
  const dependencies={lookup:async()=>[{address:'8.8.8.8',family:4}],fetch:async()=>{calls++;return calls===1?new Response(firstBody):new Response('second');}};
  const first=await safeFetch('https://polite.example/one',{},dependencies);
  const second=safeFetch('https://polite.example/two',{},dependencies);
  await new Promise(resolve=>setTimeout(resolve,10));assert.equal(calls,1);
  finish();assert.equal(await first.response.text(),'first');
  assert.equal(await (await second).response.text(),'second');assert.equal(calls,2);
});

test('a failed shared lease release cannot leave the in-process host queue locked forever',async t=>{
  const {safeFetch}=await import('../../../scripts/ad-networks/fetch-policy.mjs');
  const errors=[];t.mock.method(console,'error',message=>errors.push(message));
  const dependencies={lookup:async()=>[{address:'8.8.8.8',family:4}],fetch:async()=>new Response('body'),
    sharedHostSlot:async()=>()=>{throw new Error('database busy');}};
  const first=await safeFetch('https://release-recovery.example/first',{},dependencies);
  assert.equal(await first.response.text(),'body');
  const second=await safeFetch('https://release-recovery.example/second',{},dependencies);
  assert.equal(await second.response.text(),'body');assert.equal(errors.length,2);
});
