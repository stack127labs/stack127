import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {openLocalDatabase} from '../../../scripts/ad-networks/local-db.mjs';
import {saveState} from '../../../scripts/ad-networks/enrichment-store.mjs';
import {syncArgs,syncReviewedData} from '../../../scripts/ad-networks/sync.mjs';

for(const scenario of ['present','missing','catalog-drift','deadlock-once','serialization-once','deadlock-always','unrecoverable'])test(`niche-only sync: ${scenario}`,async t=>{
  const missing=scenario==='missing',drift=scenario==='catalog-drift';
  const directory=mkdtempSync(join(tmpdir(),'s127-niche-sync-')),file=join(directory,'test.sqlite');
  const db=openLocalDatabase(file);
  const networks=db.prepare('select slug,manager_domains,ad_system_domains,program_signatures from ad_networks').all()
    .map(row=>({...row,manager_domains:JSON.parse(row.manager_domains),ad_system_domains:JSON.parse(row.ad_system_domains),program_signatures:JSON.parse(row.program_signatures)}));
  const network=db.prepare('select id from ad_networks limit 1').get().id;
  for(let id=1;id<=3;id++){
    db.prepare(`insert into publishers(id,normalized_domain,display_domain,niche,first_seen_at,last_discovered_at,created_at,updated_at)
      values(?,?,?,'food',datetime('now'),datetime('now'),datetime('now'),datetime('now'))`).run(id,`niche${id}.example`,`niche${id}.example`);
    db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,evidence,created_at,updated_at)
      values(?,?,?,'active_network_use','{}',datetime('now'),datetime('now'))`).run(network,id,id===1?'confirmed':id===2?'needs_review':'ended');
    saveState(db,id,'niche','classified',{confidence:'high'});
  }
  db.close();
  const target={niche:'tech',platform:'WordPress',evidence:{checked:'earlier'}};
  const mutations=[],payloads=[],transactions=[];
  let migrated=false,updateAttempts=0;
  const client={release(){},async query(sql,args){
    if(['begin','commit','rollback'].includes(sql))transactions.push(sql);
    if(sql.startsWith('select pg_advisory_lock')){migrated=true;return {rows:[]};}
    if(sql.startsWith('select slug,manager_domains'))return {rows:drift&&migrated
      ?networks.map(row=>row.slug==='she-media'?{...row,program_signatures:[]}:row):networks};
    if(sql.includes('as initial'))return {rows:[{initial:false}]};
    if(sql.includes('join jsonb_to_recordset'))return {rows:[{count:missing?0:1}]};
    if(sql.startsWith('update public.ad_network_publishers p set niche')){
      updateAttempts++;
      if(scenario==='deadlock-always'||scenario==='unrecoverable'
        ||(updateAttempts===1&&['deadlock-once','serialization-once'].includes(scenario))){
        throw Object.assign(new Error('simulated transaction failure'),{
          code:scenario==='serialization-once'?'40001':scenario==='unrecoverable'?'23514':'40P01'});
      }
      const payload=JSON.parse(args[0]);payloads.push(payload);target.niche=payload[0].niche;mutations.push('niche');
      return {rowCount:1,rows:[]};
    }
    if(/insert into public\.|update public\./.test(sql))mutations.push(sql);
    return {rows:[],rowCount:0};
  }};
  t.mock.method(pg.Pool.prototype,'connect',async()=>client);
  const previous=process.env.DATABASE_URL;
  process.env.DATABASE_URL='postgresql://localhost/development';
  try {
    const preview=await syncReviewedData(syncArgs(['--sqlite',file]));
    assert.equal(preview.publishers,1);assert.equal(preview.relationships,1);
    const options=syncArgs(['--sqlite',file,'--niches-only','--apply']);
    assert.equal(options.environment,'development');
    if(['deadlock-always','unrecoverable'].includes(scenario)){
      await assert.rejects(syncReviewedData(options),{code:scenario==='unrecoverable'?'23514':'40P01'});
      assert.equal(updateAttempts,scenario==='unrecoverable'?1:3);
      assert.equal(transactions.filter(x=>x==='commit').length,0);
      assert.deepEqual(mutations,[]);
      assert.equal(target.niche,'tech');
    }else if(missing||drift){
      await assert.rejects(syncReviewedData(options),missing?/completed full publisher sync/:/Target identity catalog/);
      assert.deepEqual(mutations,[]);
    }else{
      const result=await syncReviewedData(options);
      assert.equal(result.publishers,1);assert.equal(result.relationships,0);
      assert.equal(result.observations_changed,0);assert.equal(result.arrivals_recorded,0);
      assert.deepEqual(mutations,['niche']);
      assert.deepEqual(payloads,[[{normalized_domain:'niche1.example',niche:'food'}]]);
      assert.deepEqual(target,{niche:'food',platform:'WordPress',evidence:{checked:'earlier'}});
      if(['deadlock-once','serialization-once'].includes(scenario)){
        assert.equal(updateAttempts,2);
        assert.deepEqual(transactions,['begin','rollback','begin','commit']);
      }
    }
  }finally{
    if(previous===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=previous;
    rmSync(directory,{recursive:true,force:true});
  }
});
