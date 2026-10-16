import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {parseAdsTxt} from '../../../scripts/ad-networks/ads-txt.mjs';
import {openLocalDatabase} from '../../../scripts/ad-networks/local-db.mjs';
import {reviewDecision,applyReviewDecision,gateReviewMatches,REVIEW_METHOD} from '../../../scripts/ad-networks/review-rules.mjs';
import {matchNetworks} from '../../../scripts/ad-networks/matcher.mjs';
import {saveLocalVerification,selectLocalPublishers} from '../../../scripts/ad-networks/local-verifier-store.mjs';

const network={id:1,slug:'example',ad_system_domains:['example.com'],manager_domains:['manager.example.com'],
  program_signatures:[{kind:'html_substring',value:'tags.example.com/ad.js',relationship_type:'primary_or_exclusive_manager'}]};
const relationship={publisher_id:1,ad_network_id:1,status:'needs_review',consecutive_misses:0,
  evidence:{matched_signal:'example.com, Seller-ID, RESELLER'}};
const base={network,relationship,parsed:parseAdsTxt('EXAMPLE.COM, seller-id, reseller'),checkedAt:'2026-10-16T00:00:00Z',
  fetchResult:{outcome:'parsed',httpStatus:200,sha256:'current-hash',finalUrl:'https://site.com/ads.txt'},
  homepage:{html:'<script src="https://tags.example.com/ad.js"></script>',finalUrl:'https://site.com/'}};

test('normal verifier cannot bypass the review cohort rule on a later queue pass',()=>{
  const candidate={networkId:1,slug:'example',status:'confirmed',relationshipType:'active_network_use',verificationMethod:'ads_txt_and_page_signature',evidence:{}};
  const input={...base,relationships:[{...relationship,verification_method:REVIEW_METHOD}],networks:[network],matches:{confirmed:[candidate],review:[]}};
  assert.equal(gateReviewMatches(input).confirmed.length,1);
  for(const parsed of [parseAdsTxt('example.com,different-id,RESELLER'),
    parseAdsTxt('MANAGERDOMAIN=another.com\nexample.com,seller-id,RESELLER')]){
    const result=gateReviewMatches({...input,parsed});assert.equal(result.confirmed.length,0);
    assert.equal(result.review[0].verificationMethod,REVIEW_METHOD);
    assert.equal(result.review[0].evidence.matched_signal,relationship.evidence.matched_signal);
  }
  assert.equal(gateReviewMatches({...input,matches:{confirmed:[{...candidate,verificationMethod:'ads_txt_managerdomain'}],review:[]}}).confirmed.length,1);
});

test('successive verifier passes preserve the original seller signal awaiting review',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-review-signal-')),db=openLocalDatabase(join(directory,'test.sqlite'));
  try {
    db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at)
      values(1,'site.com','site.com',?,?,?,?)`).run(...Array(4).fill(base.checkedAt));
    db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,created_at,updated_at)
      values(1,1,'needs_review','unknown',?,?,?,?)`).run(REVIEW_METHOD,JSON.stringify(relationship.evidence),base.checkedAt,base.checkedAt);
    const parsed=parseAdsTxt('example.com,new-id,RESELLER'),discoverySources=[{source_key:'sellers-json:example'}];
    for(const homepage of [null,base.homepage]) {
      const publisher=selectLocalPublishers(db,{limit:1,domains:['site.com']})[0];
      const matches=gateReviewMatches({...base,homepage,parsed,discoverySources,networks:[network],relationships:publisher.review_relationships,
        matches:matchNetworks({parsed,homepage,networks:[network],discoverySources,fetchEvidence:base.fetchResult})});
      assert.equal(matches.confirmed.length,0);
      saveLocalVerification(db,publisher,{checkedAt:base.checkedAt,outcome:'no_match',matches,evidence:{}});
      const stored=db.prepare('select status,evidence from relationships where publisher_id=1').get();
      assert.equal(stored.status,'needs_review');
      assert.equal(JSON.parse(stored.evidence).matched_signal,relationship.evidence.matched_signal);
    }
  }finally{db.close();rmSync(directory,{recursive:true,force:true});}
});

test('review promotion requires the exact current seller row and a configured distinctive script',()=>{
  const result=reviewDecision(base);
  assert.equal(result.decision,'confirmed');assert.equal(result.evidence.seller_type,'RESELLER');
  assert.equal(result.evidence.ads_txt_line,'EXAMPLE.COM, seller-id, reseller');
  assert.equal(result.evidence.page_signature,'page:tags.example.com/ad.js');
  for(const text of ['example.com, other-id, RESELLER','example.com, seller-id, DIRECT','other.com, seller-id, RESELLER'])
    assert.notEqual(reviewDecision({...base,parsed:parseAdsTxt(text)}).decision,'confirmed');
  for(const html of ['<p>tags.example.com/ad.js</p>','<!-- <script src="https://tags.example.com/ad.js"></script> -->',
    '<script src="https://wrapper.example.net/prebid.js"></script>',
    '<script type="application/ld+json">{"articleBody":"tags.example.com/ad.js"}</script>'])
    assert.equal(reviewDecision({...base,homepage:{html}}).decision,'kept');
  for(const program_signatures of [[],[{kind:'html_substring',value:'wrapper.example.net/prebid.js'}],
    [{kind:'html_substring',value:'tags.example.com/ad.js',shared_wrapper:true}]])
    assert.equal(reviewDecision({...base,network:{...network,program_signatures}}).decision,'kept');
  assert.equal(reviewDecision({...base,homepage:null}).decision,'kept');
});

test('review path keeps other managers and routes own manager evidence without writing a manager',()=>{
  assert.equal(reviewDecision({...base,parsed:parseAdsTxt('MANAGERDOMAIN=another.com\nexample.com,seller-id,RESELLER')}).reason,'different_manager');
  for(const text of ['MANAGERDOMAIN=manager.example.com\nexample.com,seller-id,RESELLER','MANAGERDOMAIN=manager.example.com'])
    assert.equal(reviewDecision({...base,parsed:parseAdsTxt(text)}).reason,'route_manager_evidence');
});

test('review absences require a full valid body, 48-hour spacing and at least seven days',()=>{
  for(const fetchResult of [{outcome:'temporary_error',httpStatus:403},{outcome:'no_ads_txt',httpStatus:404},
    {outcome:'not_modified',httpStatus:304},{outcome:'temporary_error',httpStatus:503}])
    assert.equal(reviewDecision({...base,fetchResult}).absence,undefined);
  for(const text of ['', '# empty', 'error page', 'other.com,id,DIRECT\nbroken'])
    assert.equal(reviewDecision({...base,parsed:parseAdsTxt(text)}).absence,undefined);
  const valid={...base,parsed:parseAdsTxt('other.com,id,DIRECT')};
  const first=reviewDecision(valid);assert.equal(first.decision,'kept');assert.equal(first.absence.misses,1);
  const prior={...relationship,consecutive_misses:1,first_missed_at:base.checkedAt,last_missed_at:base.checkedAt};
  assert.equal(reviewDecision({...valid,relationship:prior,checkedAt:'2026-10-17T00:00:00Z'}).absence,undefined);
  const second=reviewDecision({...valid,relationship:prior,checkedAt:'2026-10-18T00:00:00Z'});
  assert.equal(second.decision,'kept');assert.equal(second.absence.misses,2);
  const twice={...prior,consecutive_misses:2,last_missed_at:'2026-10-18T00:00:00Z'};
  assert.equal(reviewDecision({...valid,relationship:twice,checkedAt:'2026-10-22T00:00:00Z'}).decision,'kept');
  assert.equal(reviewDecision({...valid,relationship:twice,checkedAt:'2026-10-23T00:00:00Z'}).decision,'dropped');
});

test('review writes active use only, preserves unconfirmed drops and respects concurrent decisions',()=>{
  const directory=mkdtempSync(join(tmpdir(),'s127-review-')),db=openLocalDatabase(join(directory,'test.sqlite'));
  try {
    db.prepare(`insert into publishers(id,normalized_domain,display_domain,first_seen_at,last_discovered_at,created_at,updated_at)
      values(1,'site.com','site.com',?,?,?,?)`).run(...Array(4).fill(base.checkedAt));
    db.prepare(`insert into relationships(ad_network_id,publisher_id,status,relationship_type,verification_method,evidence,created_at,updated_at)
      values(1,1,'needs_review','unknown',?,?,?,?)`).run(REVIEW_METHOD,JSON.stringify(relationship.evidence),base.checkedAt,base.checkedAt);
    assert.equal(applyReviewDecision(db,relationship,reviewDecision(base),base.checkedAt),'confirmed');
    const row=db.prepare('select * from relationships where publisher_id=1').get();
    assert.equal(row.status,'confirmed');assert.equal(row.relationship_type,'active_network_use');
    assert.equal(applyReviewDecision(db,relationship,{decision:'dropped',absence:{misses:3,first:base.checkedAt,last:base.checkedAt}},base.checkedAt),'changed_elsewhere');
    db.prepare("update relationships set status='needs_review',verification_method=?,evidence=?,first_confirmed_at=null").run(REVIEW_METHOD,JSON.stringify(relationship.evidence));
    applyReviewDecision(db,relationship,{decision:'dropped',absence:{misses:3,first:'2026-10-09',last:base.checkedAt}},base.checkedAt);
    assert.equal(db.prepare('select first_confirmed_at from relationships').get().first_confirmed_at,null);
    assert.equal(db.prepare('select status from relationships').get().status,'ended');
  } finally {db.close();rmSync(directory,{recursive:true,force:true});}
});
