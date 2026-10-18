#!/usr/bin/env node
import { fetchHomepage,fetchAdsTxt,fetchDeclaredSubdomainAdsTxt } from './fetch-policy.mjs';
import { parseAdsTxt } from './ads-txt.mjs';
import { homepageFacts,summarizeAdsTxt } from './enrichment-parsers.mjs';
import { loadLocalNetworks } from './local-db.mjs';
import { REVIEW_METHOD,reviewLinks,reviewDecision,applyReviewDecision } from './review-rules.mjs';
import { pendingSites,enrichmentArgs,enrichmentDatabase,runSites,saveState } from './enrichment-store.mjs';
const args=enrichmentArgs({'review-only':{type:'boolean',default:false},network:{type:'string',multiple:true}}),db=enrichmentDatabase(args);
const networks=new Map(loadLocalNetworks(db).map(network=>[network.id,network]));
const requested=new Set(args.network??[]);
for(const slug of requested)if(![...networks.values()].some(network=>network.slug===slug))throw new Error(`Unknown network: ${slug}`);
if(requested.size&&!args['review-only'])throw new Error('--network requires --review-only');
const selectedLinks=id=>reviewLinks(db,id).filter(row=>!requested.size||requested.has(networks.get(row.ad_network_id).slug));
const reviewBySite=new Map();
for(const row of db.prepare(`select distinct p.id,p.normalized_domain from publishers p join relationships r on r.publisher_id=p.id
  where r.status='needs_review' and r.verification_method=? order by p.id`).all(REVIEW_METHOD))reviewBySite.set(row.id,row);
const cohort=links=>links.map(row=>`${row.ad_network_id}:${row.evidence.matched_signal}`).sort().join('|');
const pending=(id,kind,key)=>{
  const state=db.prepare('select * from enrichment_state where publisher_id=? and kind=?').get(id,kind);
  return args.refresh||!state||(key&&JSON.parse(state.data).cohort!==key)||(state.retry_at&&state.retry_at<=new Date().toISOString());
};
const sites=new Map(args['review-only']?[]:pendingSites(db,'homepage',args.refresh,'p.id,p.normalized_domain',30*86400).map(row=>[row.id,row]));
for(const row of reviewBySite.values()){
  const links=selectedLinks(row.id);
  if(links.length&&pending(row.id,'homepage-review',cohort(links)))sites.set(row.id,row);
}
const perNetwork={};
for(const slug of requested)perNetwork[slug]={total:0,confirmed:0,kept:0,dropped:0,changed_elsewhere:0,reasons:{}};
try {
  await runSites(db,args,'homepage',async p=>{
    const links=selectedLinks(p.id),key=cohort(links);
    let page,reason;
    try {page=await fetchHomepage(p.normalized_domain);} catch(error){reason=error.message;}
    const facts=page ? homepageFacts(page.html,page.finalUrl):null;
    let fetched,parsed;
    if(links.length) {
      // Unconditional fresh body: a 304 without retained parsed rows cannot establish this rule.
      fetched=await fetchAdsTxt(p.normalized_domain);
      parsed=fetched.outcome==='parsed'?parseAdsTxt(fetched.text):null;
      if(parsed?.subdomains.some(row=>row.value===p.normalized_domain)&&fetched.registrableDomain){
        fetched=await fetchDeclaredSubdomainAdsTxt(p.normalized_domain);
        parsed=fetched.outcome==='parsed'?parseAdsTxt(fetched.text):null;
      }
    }
    const checkedAt=new Date().toISOString(),decisions=[];
    const discoverySources=db.prepare('select source_key from publisher_sources where publisher_id=?').all(p.id);
    db.exec('begin immediate');
    try {
      if(facts) {
        db.prepare('update publishers set platform=?,favicon=? where id=?').run(facts.platform,facts.favicon,p.id);
        saveState(db,p.id,'homepage','measured',{...facts,source_url:page.finalUrl});
      } else saveState(db,p.id,'homepage','unavailable',{reason:reason??'no_usable_html'},86400);
      if(parsed&&parsed.sellers.length)db.prepare('update publishers set ads_txt_summary=? where id=?')
        .run(JSON.stringify(summarizeAdsTxt(fetched.text)),p.id);
      for(const relationship of links) {
        const network=networks.get(relationship.ad_network_id);
        const result=reviewDecision({relationship,network,parsed,fetchResult:fetched,homepage:facts?page:null,checkedAt,discoverySources});
        const decision=applyReviewDecision(db,relationship,result,checkedAt);
        decisions.push({network:network.slug,decision,reason:result.reason,absence:result.absence??null});
      }
      if(links.length)saveState(db,p.id,'homepage-review','measured',{cohort:key,checked_at:checkedAt,
        page_url:page?.finalUrl??null,ads_txt_url:fetched?.finalUrl??null,ads_txt_sha256:fetched?.sha256??null,
        http_status:fetched?.httpStatus??null,decisions},48*3600);
      db.exec('commit');
    }catch(error){db.exec('rollback');throw error;}
    for(const result of decisions) {
      const count=perNetwork[result.network]??={total:0,confirmed:0,kept:0,dropped:0,changed_elsewhere:0,reasons:{}};
      count.total++;count[result.decision]++;count.reasons[result.reason]=(count.reasons[result.reason]??0)+1;
    }
    return facts?(facts.platform?'platform_found':'unknown_platform'):'unavailable';
  },[...sites.values()],()=>({review_per_network:perNetwork}));
  console.log(JSON.stringify({review_per_network:perNetwork}));
} finally {db.close();}
