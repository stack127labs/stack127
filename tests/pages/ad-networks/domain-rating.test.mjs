import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openLocalDatabase } from '../../../scripts/ad-networks/local-db.mjs';
import { collectDomainRatings, domainRatingSites } from '../../../scripts/ad-networks/domain-rating.mjs';
import { ahrefsRequester } from '../../../scripts/stack127/ahrefs-dr.mjs';

function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 's127-dr-'));
  const db = openLocalDatabase(join(dir, 'test.sqlite'));
  t.after(() => { db.close(); rmSync(dir, { recursive: true, force: true }); });
  const network = db.prepare('select id from ad_networks limit 1').get().id;
  function site(id, status, manager = false, checked = null, value = null) {
    db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at,domain_rating_checked_on,domain_rating)
      values(?,?,?,datetime('now'),datetime('now'),datetime('now'),datetime('now'),?,?)`).run(id, `site${id}.example`, `site${id}.example`, checked, value);
    if (status) db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,evidence,created_at,updated_at)
      values(?,?,?,?, '{}',datetime('now'),datetime('now'))`).run(network, id, status, manager ? 'primary_or_exclusive_manager' : 'active_network_use');
  }
  return { db, site };
}

test('DR selection prioritizes listed managers, other listed, remaining never checked, then oldest due', t => {
  const { db, site } = fixture(t);
  site(1, 'ended', true); site(2, 'stale'); site(3, 'stale', true); site(4, 'confirmed', true);
  site(5, 'confirmed', true, '2026-10-14', 10); site(6, null, false, '2026-09-01', 0);
  site(7, 'confirmed', true, '2026-10-15', 100); // Exactly 30 days old is not due yet.
  site(8, null); site(9, 'needs_review', true);
  assert.deepEqual(domainRatingSites(db, { now: Date.parse('2026-11-14T12:00:00Z'), limit: 50 }).map(r => r.id), [3,4,2,1,8,9,6,5]);
  assert.deepEqual(domainRatingSites(db, { now: Date.parse('2026-11-14T12:00:00Z'), limit: 2 }).map(r => r.id), [3,4]);
  for (const value of [-1,101,1.5,'invalid']) assert.throws(() => db.prepare('update publishers set domain_rating=? where id=1').run(value));
});

test('failures keep prior DR/date, defer retry, and never block other domains; successes resume idempotently', async t => {
  const { db, site } = fixture(t);
  site(1, 'confirmed', true, '2020-01-01', 40); site(2, 'confirmed', true);
  let calls = 0;
  const result = await collectDomainRatings(db, { limit: 2 }, { requestRating: async domain => { calls++; return domain === 'site1.example' ? { error: 'unavailable' } : { value: 0 }; } });
  assert.equal(result.status, 'failed'); assert.equal(result.measured, 1); assert.equal(result.failed, 1);
  assert.deepEqual({...db.prepare('select domain_rating,domain_rating_checked_on from publishers where id=1').get()}, {domain_rating:40,domain_rating_checked_on:'2020-01-01'});
  assert.equal(db.prepare('select domain_rating from publishers where id=2').get().domain_rating, 0);
  assert.ok(db.prepare("select retry_at from enrichment_state where publisher_id=1 and kind='domain-rating'").get().retry_at);
  await collectDomainRatings(db, { limit: 2 }, { requestRating: async () => assert.fail('already measured or retry deferred') });
  assert.equal(calls, 2);
});

for (const status of [401,403,429]) test(`HTTP ${status} stops the run, keeps all values and does not start another domain`, async t => {
  const { db, site } = fixture(t); site(1, 'confirmed', true); site(2, 'confirmed', true);
  let time = 1, calls = 0;
  const requestRating = ahrefsRequester({apiKey:'test-only', now:()=>time, sleepImplementation:async ms=>{time+=ms;},
    fetchImplementation:async()=>{calls++;return new Response('', {status,headers:{'Retry-After':'40'}});}});
  const result = await collectDomainRatings(db, {limit:2}, {requestRating});
  assert.equal(result.status, 'failed'); assert.equal(result.measured, 0); assert.equal(calls, status===429?3:1);
  assert.ok(db.prepare('select * from publishers').all().every(r=>r.domain_rating===null&&r.domain_rating_checked_on===null));
});

test('shared requester enforces the minimum pace, honors slower configuration and cancels a backoff', async () => {
  assert.throws(()=>ahrefsRequester({apiKey:'test',paceMs:2999}), /3000/);
  let time=1;
  const times=[];
  const request=ahrefsRequester({apiKey:'test',paceMs:5000,now:()=>time,sleepImplementation:async ms=>{time+=ms;},fetchImplementation:async()=>{
    times.push(time);return new Response(JSON.stringify({domain_rating:{domain_rating:42.6}}));
  }});
  assert.deepEqual(await request('a.example'),{value:43});await request('b.example');assert.deepEqual(times,[1,5001]);
  const controller=new AbortController(); let calls=0;
  const cancelled=ahrefsRequester({apiKey:'test',signal:controller.signal,fetchImplementation:async()=>{
    calls++;return new Response('',{status:429});
  },sleepImplementation:async()=>{controller.abort();}});
  await assert.rejects(cancelled('a.example'));assert.equal(calls,1);
});

test('run budget checkpoints partial work and prevents the next request', async t => {
  const {db,site}=fixture(t);site(1,'confirmed');site(2,'confirmed');
  let time=Date.now(),calls=0;
  const result=await collectDomainRatings(db,{limit:2,'time-budget-minutes':1},{now:()=>time,requestRating:async()=>{calls++;time+=61000;return {value:20};}});
  assert.equal(calls,1);assert.equal(result.status,'budget_complete');
  assert.equal(domainRatingSites(db).length,1);
});


test('a long Retry-After survives the run and blocks all later domains/runs until it expires', async t => {
  const {db,site}=fixture(t);site(1,'confirmed');site(2,'confirmed');
  const previous=process.env.AHREFS_API_KEY;process.env.AHREFS_API_KEY='test-only';
  t.after(()=>{if(previous===undefined)delete process.env.AHREFS_API_KEY;else process.env.AHREFS_API_KEY=previous;});
  let time=Date.now(),calls=0;
  const first=await collectDomainRatings(db,{limit:2},{now:()=>time,fetchImplementation:async()=>{
    calls++;return new Response('',{status:429,headers:{'Retry-After':'86400'}});
  }});
  assert.equal(first.stopped,'rate_limited');assert.equal(calls,1);
  assert.ok(db.prepare("select value from schema_meta where key='domain_rating_retry_at'").get().value);
  const second=await collectDomainRatings(db,{limit:2},{now:()=>time+3600000,requestRating:async()=>assert.fail('Retry-After not reached')});
  assert.equal(second.stopped,'rate_limited');assert.equal(second.processed,0);
  time+=86400001;
  const third=await collectDomainRatings(db,{limit:1},{now:()=>time,requestRating:async()=>({value:50})});
  assert.equal(third.measured,1);
});

test('November 1 ad-network Retry-After blocks November 2 launch metrics on the shared host state', async t => {
  const { db, site } = fixture(t); site(1, 'confirmed', true);
  const dir = mkdtempSync(join(tmpdir(), 's127-ahrefs-shared-'));
  t.after(() => rmSync(dir, {recursive:true,force:true}));
  const stateFile = join(dir, 'ahrefs.sqlite');
  const previous = process.env.AHREFS_API_KEY; process.env.AHREFS_API_KEY = 'test-only';
  t.after(() => {if(previous===undefined)delete process.env.AHREFS_API_KEY;else process.env.AHREFS_API_KEY=previous;});
  const firstAt = Date.parse('2026-11-01T23:05:00Z');
  let calls = 0;
  const adNetworks = await collectDomainRatings(db, {limit:1}, {stateFile, now:()=>firstAt,
    fetchImplementation:async()=>{calls++; return new Response('',{status:429,headers:{'Retry-After':'86400'}});}});
  assert.equal(adNetworks.stopped,'rate_limited'); assert.equal(calls,1);
  const {collectMetrics} = await import('../../../scripts/launch-directories/refresh-metrics.mjs');
  const records = [{slug:'example',website_url:'https://example.com',domain_rating:20,domain_rating_checked_on:'2026-10-02'}];
  const launch = await collectMetrics(records, {checkedOn:'2026-11-02',
    loadTranco:async()=>({list_id:'test',ranks:new Map()}),
    requestRating:ahrefsRequester({apiKey:'test-only',stateFile,now:()=>Date.parse('2026-11-02T06:00:00Z'),
      fetchImplementation:async()=>assert.fail('24-hour cooldown must block the other job'),
      sleepImplementation:async()=>assert.fail('long cooldown must stop promptly')})});
  assert.equal(launch.stopped,'rate_limited');
  assert.ok(launch.patches.every(patch=>!Object.hasOwn(patch.changes,'domain_rating')));
  assert.equal(launch.patches[0].changes.traffic_bucket,'below_1m','Tranco still runs during an Ahrefs cooldown');
  const after = ahrefsRequester({apiKey:'test-only',stateFile,now:()=>firstAt+86400001,
    fetchImplementation:async()=>new Response(JSON.stringify({domain_rating:{domain_rating:30}}))});
  assert.deepEqual(await after('example.com'),{value:30});
});

test('independent requesters serialize in-flight HTTP and retain post-response pacing across restarts', async t => {
  const dir=mkdtempSync(join(tmpdir(),'s127-ahrefs-lock-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const stateFile=join(dir,'ahrefs.sqlite');
  let time=1000, release, entered;
  const ready=new Promise(resolve=>{entered=resolve;});
  const hold=new Promise(resolve=>{release=resolve;});
  const first=ahrefsRequester({apiKey:'test',stateFile,now:()=>time,fetchImplementation:async()=>{
    entered(); await hold; time=2000; return new Response(JSON.stringify({domain_rating:{domain_rating:10}}));
  }});
  const pending=first('first.example'); await ready;
  let secondCalls=0;
  const waits=[];
  const options={apiKey:'test',stateFile,now:()=>time,sleepImplementation:async ms=>{waits.push(ms);time+=ms;},
    fetchImplementation:async()=>{secondCalls++;return new Response(JSON.stringify({domain_rating:{domain_rating:20}}));}};
  const second=ahrefsRequester(options)('second.example');
  assert.equal(secondCalls,0); release();
  assert.deepEqual(await pending,{value:10}); assert.deepEqual(await second,{value:20});
  assert.deepEqual(waits,[3000]);
  await ahrefsRequester(options)('third.example');
  assert.deepEqual(waits,[3000,3000]);
});

test('a killed process releases the shared request lock for the next job', {timeout:10000}, async t => {
  const {spawn}=await import('node:child_process');
  const {once}=await import('node:events');
  const dir=mkdtempSync(join(tmpdir(),'s127-ahrefs-crash-'));
  t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const stateFile=join(dir,'ahrefs.sqlite');
  const moduleUrl=new URL('../../../scripts/stack127/ahrefs-dr.mjs',import.meta.url).href;
  const child=spawn(process.execPath,['--input-type=module','-e',`
    import {ahrefsRequester} from ${JSON.stringify(moduleUrl)};
    const request=ahrefsRequester({apiKey:'test-only',stateFile:process.argv[1],fetchImplementation:async()=>{
      process.stdout.write('locked'); await new Promise(resolve=>setTimeout(resolve,60000));
    }});
    await request('example.com');
  `,stateFile],{stdio:['ignore','pipe','pipe']});
  t.after(()=>child.kill('SIGKILL'));
  await Promise.race([once(child.stdout,'data'),once(child,'exit').then(()=>assert.fail('child exited before acquiring lock'))]);
  const exit=once(child,'exit'); child.kill('SIGKILL'); await exit;
  const request=ahrefsRequester({apiKey:'test-only',stateFile,
    fetchImplementation:async()=>new Response(JSON.stringify({domain_rating:{domain_rating:15}}))});
  assert.deepEqual(await request('next.example'),{value:15});
});
