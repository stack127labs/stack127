import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {openLocalDatabase,loadLocalNetworks} from '../../../scripts/ad-networks/local-db.mjs';
import {mergeNetworkRelationship,mergeRetiredLocalNetworks} from '../../../scripts/ad-networks/merge-identities.mjs';
import {parseAdsTxt} from '../../../scripts/ad-networks/ads-txt.mjs';
import {matchNetworks} from '../../../scripts/ad-networks/matcher.mjs';
import {sources} from '../../../scripts/ad-networks/sources.mjs';
import {phase2Sources} from '../../../scripts/ad-networks/phase2-sources.mjs';

test('legacy Snigel manager maps only to Publisher Collective; seller lines keep the evidence threshold',()=>{
  const dir=mkdtempSync(join(tmpdir(),'ad-network-merge-'));const db=openLocalDatabase(join(dir,'test.sqlite'));
  try {
    const networks=loadLocalNetworks(db);
    assert.equal(networks.length,44);assert.equal(networks.some(n=>n.slug==='snigel'),false);
    assert.ok(networks.find(n=>n.slug==='publisher-collective').ad_system_domains.includes('snigelweb.com'));
    const match=(text,discoverySources=[])=>matchNetworks({parsed:parseAdsTxt(text),networks,fetchEvidence:{},discoverySources});
    assert.deepEqual(match('MANAGERDOMAIN=snigelweb.com').confirmed.map(n=>n.slug),['publisher-collective']);
    assert.equal(match('snigelweb.com,123,DIRECT').confirmed.length,0);
    assert.deepEqual(match('snigelweb.com,123,DIRECT',[{source_key:'sellers-json:snigel'}]).review.map(n=>n.slug),['publisher-collective']);
    assert.equal(sources.find(s=>s.key==='sellers-json:snigel').networkSlug,'publisher-collective');
    assert.equal(phase2Sources.find(s=>s.key==='explodingweb:snigel').networkSlug,'publisher-collective');
    assert.deepEqual(networks.find(n=>n.slug==='pubgalaxy').manager_domains,['pubgalaxy.com']);
  }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});

test('duplicate relationship keeps stronger status, full date range, and original evidence',()=>{
  const source={status:'confirmed',relationship_type:'primary_or_exclusive_manager',evidence:'{"manager_domain":"snigelweb.com"}',
    first_confirmed_at:'2025-01-01',last_confirmed_at:'2026-09-01',created_at:'2025-01-01',updated_at:'2026-09-01',ended_at:null};
  const target={...source,status:'ended',evidence:'{"manager_domain":"network-n.com"}',first_confirmed_at:'2024-01-01',last_confirmed_at:'2026-10-01',ended_at:'2026-10-02'};
  const merged=mergeNetworkRelationship(source,target);
  assert.equal(merged.status,'confirmed');assert.equal(merged.ended_at,null);
  assert.equal(merged.first_confirmed_at,'2024-01-01');assert.equal(merged.last_confirmed_at,'2026-10-01');
  assert.equal(JSON.parse(merged.evidence).manager_domain,'snigelweb.com');
  assert.equal(JSON.parse(merged.evidence).identity_merge.previous_relationships.length,2);
});

test('opening an older store retires Snigel atomically and subsequent opens never recreate it',()=>{
  const dir=mkdtempSync(join(tmpdir(),'ad-network-old-'));const path=join(dir,'test.sqlite');let db=openLocalDatabase(path);
  try {
    db.exec(`insert into ad_networks(slug,name,manager_domains,ad_system_domains,program_signatures,identity_reviewed_at)
      values('snigel','Snigel','["snigelweb.com"]','["snigelweb.com"]','[]','2025-01-01');
      insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at,last_check_evidence)
      values(1,'example.com','example.com','2025-01-01','2025-01-01','2025-01-01','2025-01-01','{"confirmed_networks":["snigel","publisher-collective"],"manager_domains":["snigelweb.com"]}');
      insert into relationships(ad_network_id,publisher_id,status,relationship_type,evidence,first_confirmed_at,last_confirmed_at,created_at,updated_at)
      select id,1,'confirmed','primary_or_exclusive_manager','{}','2025-01-01','2026-01-01','2025-01-01','2026-01-01' from ad_networks where slug in ('snigel','publisher-collective');
      update schema_meta set value='old' where key='identity_catalog_version';`);
    db.close();db=openLocalDatabase(path);
    assert.equal(db.prepare('select count(*) n from ad_networks').get().n,44);
    assert.equal(db.prepare('select count(*) n from relationships').get().n,1);
    const evidence=JSON.parse(db.prepare('select last_check_evidence from publishers').get().last_check_evidence);
    assert.deepEqual(evidence.confirmed_networks,['publisher-collective']);assert.deepEqual(evidence.manager_domains,['snigelweb.com']);
    db.exec('begin');mergeRetiredLocalNetworks(db);db.exec('commit');
    assert.deepEqual(db.prepare('pragma foreign_key_check').all(),[]);
    db.close();db=openLocalDatabase(path);assert.equal(db.prepare("select count(*) n from ad_networks where slug='snigel'").get().n,0);
  }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});

test('merge winner matches SQL status, confirmation NULLS LAST, update time, then descending network ID',()=>{
  const row={ad_network_id:10,status:'confirmed',relationship_type:'active_network_use',verification_method:'source',
    evidence:'{"picked":"source"}',first_confirmed_at:'2025-01-01T00:00:00Z',last_confirmed_at:'2026-10-01T00:00:00.123456Z',
    created_at:'2025-01-01T00:00:00Z',updated_at:'2026-10-02T00:00:00.123457Z',ended_at:null};
  const target={...row,ad_network_id:20,verification_method:'target',evidence:'{"picked":"target"}',updated_at:'2026-10-02T00:00:00.123456Z'};
  const picked=(source,other)=>JSON.parse(mergeNetworkRelationship(source,other).evidence).picked;
  // Regression: equal confirmations must use the newer source's evidence.
  assert.equal(picked(row,target),'source');
  assert.equal(picked({...row,updated_at:target.updated_at},target),'target');
  assert.equal(picked({...row,ad_network_id:30,updated_at:target.updated_at},target),'source');
  assert.equal(picked({...row,status:'stale',last_confirmed_at:'2030-01-01T00:00:00Z'},target),'target');
  assert.equal(picked({...row,last_confirmed_at:null,updated_at:'2030-01-01T00:00:00Z'},target),'target');
  assert.equal(picked(row,{...target,last_confirmed_at:null,updated_at:'2030-01-01T00:00:00Z'}),'source');
  assert.equal(picked({...row,last_confirmed_at:null},{...target,last_confirmed_at:null}),'source');
  // Equal instants in different offsets still fall through to the ID tie-breaker.
  assert.equal(picked({...row,last_confirmed_at:'2026-10-01T02:00:00.123456+02:00',updated_at:target.updated_at},target),'target');
});
