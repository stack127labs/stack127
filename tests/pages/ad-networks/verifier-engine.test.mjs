import assert from 'node:assert/strict';
import test from 'node:test';
import {spawnSync} from 'node:child_process';
import {networkIdentities} from '../../../scripts/ad-networks/network-identities.mjs';
import {verifyPublisher} from '../../../scripts/ad-networks/verify-publisher.mjs';

test('PostgreSQL verification cannot bypass the reviewed SQLite sync with direct writes',()=>{
  const result=spawnSync(process.execPath,['scripts/ad-networks/verify.mjs','--store','postgres','--apply'],{encoding:'utf8'});
  assert.notEqual(result.status,0);assert.match(result.stderr,/PostgreSQL verification is preview-only/);
});

test('missing ads.txt cannot promote a protected seller candidate through page-only evidence',async()=>{
  const identity=networkIdentities.find(row=>row.slug==='buysellads-carbon-ads');
  const network={id:1,slug:identity.slug,manager_domains:identity.managerDomains,
    ad_system_domains:identity.adSystemDomains,program_signatures:identity.programSignatures};
  const publisher={normalized_domain:'publisher.example',last_check_evidence:{},
    discovery_sources:[{source_key:`sellers-json:${identity.slug}`}],review_relationships:[]};
  const tag='<script src="https://srv.carbonads.net/ads/fixture.js"></script>';
  const fetched=[{outcome:'parsed',httpStatus:200,text:`${identity.adSystemDomains[0]},original-seller,RESELLER`,finalUrl:'https://publisher.example/ads.txt'},
    {outcome:'no_ads_txt',httpStatus:404,finalUrl:'https://publisher.example/ads.txt'}];
  const pages=['<html><body>No tag</body></html>',tag];
  const first=await verifyPublisher(publisher,[network],{
    fetchAdsTxt:async()=>fetched.shift(),fetchHomepage:async()=>({html:pages.shift(),finalUrl:'https://publisher.example/'}),
  });
  assert.equal(first.matches.confirmed.length,0);assert.equal(first.matches.review.length,1);
  const candidate=first.matches.review[0];
  const protectedPublisher={...publisher,review_relationships:[{ad_network_id:1,status:'needs_review',
    verification_method:candidate.verificationMethod,evidence:candidate.evidence}]};
  const second=await verifyPublisher(protectedPublisher,[network],{
    fetchAdsTxt:async()=>fetched.shift(),fetchHomepage:async()=>({html:pages.shift(),finalUrl:'https://publisher.example/'}),
  });
  assert.equal(second.outcome,'no_ads_txt');assert.equal(second.matches.confirmed.length,0);
  assert.equal(second.matches.review.length,1);
  assert.equal(second.matches.review[0].evidence.matched_signal,candidate.evidence.matched_signal);
  const unprotected=await verifyPublisher(publisher,[network],{
    fetchAdsTxt:async()=>({outcome:'no_ads_txt',httpStatus:404}),
    fetchHomepage:async()=>({html:tag,finalUrl:'https://publisher.example/'}),
  });
  assert.equal(unprotected.outcome,'matched');assert.equal(unprotected.matches.confirmed.length,1);
  assert.equal(unprotected.matches.confirmed[0].verificationMethod,'page_signature');
});
