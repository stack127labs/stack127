import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {openLocalDatabase,loadLocalNetworks} from '../../../scripts/ad-networks/local-db.mjs';
import {assertLocalCatalog,assertTargetCatalog,newerCatalog} from '../../../scripts/ad-networks/identity-catalog.mjs';

test('a recreated retired identity and lost signatures are repaired even if the version label is unchanged',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-catalog-')),path=join(directory,'test.sqlite');
  let db=openLocalDatabase(path);
  try {
    db.exec(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at,last_checked_at,check_attempt_count)
      values(1,'example.com','example.com','2024-01-01','2024-01-01','2024-01-01','2026-10-16','2026-10-16T08:00:00Z',7);
      insert into ad_networks(slug,name,manager_domains,ad_system_domains,program_signatures,identity_reviewed_at)
      values('snigel','Snigel','["snigelweb.com"]','["snigelweb.com"]','[]','2025-01-01');
      update ad_networks set program_signatures='[]' where slug in ('she-media','infolinks');
      update ad_networks set manager_domains='["publisher-collective.com","network-n.com"]' where slug='publisher-collective';
      insert into relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at,created_at,updated_at)
      select id,1,'confirmed','primary_or_exclusive_manager','ads_txt_managerdomain','{"manager_domain":"snigelweb.com"}',
        '2025-01-01','2026-10-16T09:00:00Z','2025-01-01','2026-10-16T09:00:00Z' from ad_networks where slug='snigel';
      insert into relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,first_confirmed_at,last_confirmed_at,created_at,updated_at)
      select id,1,'confirmed','primary_or_exclusive_manager','ads_txt_managerdomain','{"manager_domain":"network-n.com"}',
        '2024-01-01','2026-10-16T06:00:00Z','2024-01-01','2026-10-16T06:00:00Z' from ad_networks where slug='publisher-collective';`);
    assert.throws(()=>assertLocalCatalog(db),/not current/);
    db.close();db=openLocalDatabase(path);assertLocalCatalog(db);
    const row=db.prepare('select * from relationships where publisher_id=1').get();
    assert.equal(db.prepare('select count(*) n from relationships').get().n,1);
    assert.equal(db.prepare('select count(*) n from ad_networks').get().n,44);
    assert.equal(row.first_confirmed_at,'2024-01-01');assert.equal(row.last_confirmed_at,'2026-10-16T09:00:00Z');
    assert.equal(row.created_at,'2024-01-01');assert.equal(row.updated_at,'2026-10-16T09:00:00Z');
    assert.equal(JSON.parse(row.evidence).identity_merge.previous_relationships.length,2);
    assert.equal(db.prepare('select check_attempt_count from publishers').get().check_attempt_count,7);
    assert.equal(db.prepare('select last_checked_at from publishers').get().last_checked_at,'2026-10-16T08:00:00Z');
    assert.deepEqual(db.prepare('pragma foreign_key_check').all(),[]);
    const once=JSON.stringify(db.prepare('select * from relationships').all());
    db.close();db=openLocalDatabase(path);assert.equal(JSON.stringify(db.prepare('select * from relationships').all()),once);
  }finally{db.close();rmSync(directory,{recursive:true,force:true});}
});

test('source and target guards reject a reverted catalog and accept JSONB key/domain ordering',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-catalog-')),path=join(directory,'test.sqlite'),db=openLocalDatabase(path);
  try {
    const rows=loadLocalNetworks(db);assertTargetCatalog(rows);
    const jsonb=rows.map(row=>({...row,manager_domains:[...row.manager_domains].reverse(),
      ad_system_domains:[...row.ad_system_domains].reverse(),program_signatures:row.program_signatures.map(signature=>Object.fromEntries(Object.entries(signature).reverse()))}));
    assertTargetCatalog(jsonb);
    assert.throws(()=>assertTargetCatalog([...rows,{...rows[0],slug:'snigel'}]),/expected 44|unexpected identity snigel/);
    assert.throws(()=>assertTargetCatalog(rows.map(row=>row.slug==='she-media'?{...row,program_signatures:[]}:row)),/she-media.program_signatures/);
    db.prepare("update schema_meta set value='2026-09-28.2' where key='identity_catalog_version'").run();
    assert.throws(()=>assertLocalCatalog(db),/version/);
  }finally{db.close();rmSync(directory,{recursive:true,force:true});}
});

test('released seeding code refuses a catalog downgrade without altering newer identities',()=>{
  assert.equal(newerCatalog('2026-10-16.10','2026-10-16.2'),true);
  assert.equal(newerCatalog('2026-09-28.20','2026-10-16.2'),false);
  const directory=mkdtempSync(join(tmpdir(),'s127-catalog-')),path=join(directory,'test.sqlite');
  let db=openLocalDatabase(path);
  db.prepare("update schema_meta set value='9999-12-31.1' where key='identity_catalog_version'").run();db.close();
  try {
    assert.throws(()=>openLocalDatabase(path),/Refusing to downgrade/);
    db=new DatabaseSync(path,{readOnly:true});
    assert.equal(db.prepare("select value from schema_meta where key='identity_catalog_version'").get().value,'9999-12-31.1');
    assert.equal(db.prepare('select count(*) n from ad_networks').get().n,44);
  }finally{db.close();rmSync(directory,{recursive:true,force:true});}
});
