import assert from 'node:assert/strict';
import test from 'node:test';
import {createEnrichmentQueue} from '../../../scripts/ad-networks/enrichment-queue.mjs';
import {siteWorkHost} from '../../../scripts/ad-networks/enrichment-store.mjs';

test('a shared redirect destination cannot occupy every worker or block independent hosts',async()=>{
  const rows=[...Array.from({length:20},(_,id)=>({id,host:'shared'})),...Array.from({length:8},(_,id)=>({id:id+20,host:`host${id}`}))];
  let release;const blocked=new Promise(resolve=>{release=resolve;});const starts=[];let active=0,maxActive=0,shared=0,maxShared=0;
  const queue=createEnrichmentQueue(rows,{concurrency:6,groupKey:row=>row.host});
  const running=queue.run(async row=>{
    starts.push(row);active++;maxActive=Math.max(active,maxActive);
    if(row.host==='shared'){shared++;maxShared=Math.max(shared,maxShared);await blocked;shared--;}
    active--;
  });
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(starts.filter(row=>row.host!=='shared').length,8);
  assert.equal(starts.filter(row=>row.host==='shared').length,2);
  release();await running;
  assert.equal(starts.length,rows.length);assert.equal(new Set(starts.map(row=>row.id)).size,rows.length);
  assert.ok(maxActive<=6);assert.ok(maxShared<=2);assert.equal(queue.snapshot().pendingHosts,0);
});

test('stopping drains active work without admitting new rows',async()=>{
  let stopped=false,started=0,completed=0,release;
  const blocked=new Promise(resolve=>{release=resolve;});
  const queue=createEnrichmentQueue(Array.from({length:20},(_,id)=>({id})),{concurrency:3,groupKey:row=>String(row.id),shouldStop:()=>stopped});
  const running=queue.run(async()=>{started++;await blocked;completed++;});
  stopped=true;release();await running;
  assert.equal(started,3);assert.equal(completed,3);
});

test('a failed SQLite write stops admission and drains other work before closing the database',async()=>{
  let started=0,finished=0;
  const queue=createEnrichmentQueue(Array.from({length:20},(_,id)=>({id})),{concurrency:3,groupKey:row=>String(row.id)});
  await assert.rejects(queue.run(async()=>{
    started++;if(started===1)throw new Error('database full');
    await new Promise(resolve=>setImmediate(resolve));finished++;
  }),/database full/);
  assert.equal(started,3);assert.equal(finished,2);
});

test('summary admission uses observed redirect destinations; homepage admission uses the site',()=>{
  const site={normalized_domain:'publisher.example.com',last_check_evidence:JSON.stringify({final_url:'https://adstxt.mediavine.com/sites/publisher/ads.txt'})};
  assert.equal(siteWorkHost(site,true),'mediavine.com');
  assert.equal(siteWorkHost(site),'example.com');
  assert.equal(siteWorkHost({...site,last_check_evidence:'bad'},true),'example.com');
});
