import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {networkIdentities} from '../../../scripts/ad-networks/network-identities.mjs';
import {parseAdsTxt} from '../../../scripts/ad-networks/ads-txt.mjs';
import {reviewDecision} from '../../../scripts/ad-networks/review-rules.mjs';
import {matchNetworks,needsHomepage} from '../../../scripts/ad-networks/matcher.mjs';
import {openLocalDatabase,loadLocalNetworks} from '../../../scripts/ad-networks/local-db.mjs';

// Minimal fixtures for the exact tag/config markers described by Luna in
// dev-space/ad-networks-signatures.md; these are not saved full homepage HTML.
const cases=[
  ['she-media','1966mag.com','ads.blogherads.com/static/blogherads.js','<script src="https://ads.blogherads.com/static/blogherads.js"></script>'],
  ['she-media','2dayitinerary.com','blogherads.adq.push','<script>blogherads.adq.push(function(){blogherads.defineSlot("test");});</script>'],
  ['adapex','abc12.com','cdn.adapex.io/hb/aaw.','<script src="https://cdn.adapex.io/hb/aaw.empowerlocal_a.js"></script>'],
  ['adpushup','2689web.com','cdn.adpushup.com/','<script src="https://cdn.adpushup.com/publisher.js"></script>'],
  ['infolinks','280living.com','resources.infolinks.com/js/infolinks_main.js','<script src="https://resources.infolinks.com/js/infolinks_main.js"></script>'],
  ['nitropay','artofmtg.com','s.nitropay.com/ads-','<script src="https://s.nitropay.com/ads-fixture.js"></script>'],
  ['publisher-collective','crosswordsolver.com','cdn.snigelweb.com/adengine/','<script src="https://cdn.snigelweb.com/adengine/crosswordsolver.com/loader.js"></script>'],
  ['the-moneytizer','123ru.net','ads.themoneytizer.com/s/gen.js','<script src="https://ads.themoneytizer.com/s/gen.js"></script>'],
  ['mediavine','crystalsandjewelry.com','scripts.mediavine.com/tags/','<script src="https://scripts.mediavine.com/tags/fixture.js"></script>'],
];
const negative='<script>const vendors={"tcf-media.net":true,"sovrn":true,"lijit.com":true};</script>'
  +'<script src="https://scripts.opti-digital.com/modules/fixture.js"></script>';
function input(slug,homepage){
  const source=networkIdentities.find(row=>row.slug===slug);
  const network={id:1,slug,manager_domains:source.managerDomains,ad_system_domains:source.adSystemDomains,program_signatures:source.programSignatures};
  return {network,relationship:{evidence:{matched_signal:`${source.adSystemDomains[0]},seller-id,RESELLER`}},
    parsed:parseAdsTxt(`${source.adSystemDomains[0]},seller-id,RESELLER`),fetchResult:{outcome:'parsed',httpStatus:200,sha256:'hash'},
    homepage:{html:homepage,finalUrl:'https://publisher.example/'},checkedAt:'2026-10-16T08:00:00Z'};
}
for(const [slug,sample,value,html] of cases)test(`${slug}: ${value} accepts the documented ${sample} marker and rejects false-positive controls`,()=>{
  const args=input(slug,html);
  // Test each of SHE Media's two signals independently, rather than letting one mask the other.
  args.network.program_signatures=args.network.program_signatures.filter(signature=>signature.value===value);
  assert.equal(args.network.program_signatures.length,1);
  assert.equal(reviewDecision(args).decision,'confirmed');
  assert.equal(reviewDecision({...args,homepage:{html:negative}}).decision,'kept');
  assert.equal(reviewDecision({...args,homepage:{html:`<p>${value}</p>`}}).decision,'kept');
  assert.equal(reviewDecision({...args,homepage:{html:`<!-- ${html} -->`}}).decision,'kept');
  const core={parsed:args.parsed,networks:[args.network],fetchEvidence:args.fetchResult,homepage:args.homepage,discoverySources:[]};
  assert.equal(matchNetworks(core).confirmed[0].relationshipType,'active_network_use');
  assert.equal(matchNetworks({...core,homepage:{html:`<p>${value}</p>`}}).confirmed.length,0);
  assert.equal(matchNetworks({...core,parsed:parseAdsTxt('unrelated.com,id,DIRECT')}).confirmed.length,0);
  assert.equal(needsHomepage(parseAdsTxt('unrelated.com,id,DIRECT'),[args.network]),false);
});

test('unsafe Media.net, Concert and Sovrn brand matches remain unconfigured; Mediavine uses only its tag path',()=>{
  for(const slug of ['media-net','concert','sovrn'])assert.deepEqual(networkIdentities.find(row=>row.slug===slug).programSignatures,[]);
  const args=input('mediavine','<script src="https://scripts.mediavine.com/app.js"></script>');
  assert.equal(reviewDecision(args).decision,'kept');
});

test('inert script data cannot establish active network use, regardless of attribute quoting',()=>{
  for(const type of ['application/json','text/plain','application/ld+json','importmap','module;not-a-module']) {
    for(const value of [`"${type}"`,`'${type}'`,type]) {
      const args=input('nitropay',`<script data-note="greater > lesser" type=${value}>{"url":"https://s.nitropay.com/ads-example.js"}</script>`);
      assert.equal(reviewDecision(args).decision,'kept',`${type}/${value}`);
      assert.equal(matchNetworks({parsed:args.parsed,networks:[args.network],fetchEvidence:args.fetchResult,
        homepage:args.homepage,discoverySources:[]}).confirmed.length,0);
    }
  }
  for(const type of ['', 'type=""', 'type=module', 'type="text/javascript; charset=utf-8"', 'TYPE=application/javascript']) {
    assert.equal(reviewDecision(input('nitropay',`<script ${type} src="https://s.nitropay.com/ads-example.js"></script>`)).decision,'confirmed');
  }
});

test('script examples in inert HTML contexts do not confirm network use',()=>{
  const tag='<script src="https://s.nitropay.com/ads-example.js"></script>';
  for(const context of ['textarea','template','style','title','xmp','iframe','noembed','noframes','noscript']) {
    const args=input('nitropay',`<${context}>${tag}</${context}>`);
    assert.equal(reviewDecision(args).decision,'kept',context);
    assert.equal(matchNetworks({parsed:args.parsed,networks:[args.network],fetchEvidence:args.fetchResult,
      homepage:args.homepage,discoverySources:[]}).confirmed.length,0,context);
  }
  assert.equal(reviewDecision(input('nitropay',`<template><template>${tag}</template>${tag}</template>`)).decision,'kept');
  assert.equal(reviewDecision(input('nitropay',`<textarea>${tag}</textarea>${tag}`)).decision,'confirmed');
});

test('opening a prior SQLite catalog upgrades signatures and repeats without changing identity IDs',()=>{
  const dir=mkdtempSync(join(tmpdir(),'s127-signatures-')),path=join(dir,'data.sqlite');
  let db=openLocalDatabase(path);
  try {
    const before=loadLocalNetworks(db).find(row=>row.slug==='she-media');
    db.prepare("update ad_networks set program_signatures='[]' where slug='she-media'").run();
    db.prepare("update schema_meta set value='2026-10-16.1' where key='identity_catalog_version'").run();
    db.close();db=openLocalDatabase(path);
    const after=loadLocalNetworks(db).find(row=>row.slug==='she-media');
    assert.equal(after.id,before.id);assert.equal(after.program_signatures.length,2);
    db.close();db=openLocalDatabase(path);
    assert.deepEqual(loadLocalNetworks(db).find(row=>row.slug==='she-media'),after);
  }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
