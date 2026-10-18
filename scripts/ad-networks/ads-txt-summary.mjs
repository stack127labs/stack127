#!/usr/bin/env node
import { fetchAdsTxt, fetchDeclaredSubdomainAdsTxt } from './fetch-policy.mjs';
import { parseAdsTxt } from './ads-txt.mjs';
import { summarizeAdsTxt } from './enrichment-parsers.mjs';
import { enrichmentArgs,enrichmentDatabase,pendingSites,runSites,saveState,siteWorkHost,progressFile } from './enrichment-store.mjs';
const args=enrichmentArgs(),db=enrichmentDatabase(args);
try {
  const pending=pendingSites(db,'ads-txt-summary',args.refresh,'p.id,p.normalized_domain,p.ads_txt_summary,p.last_check_evidence').slice(0,+args.limit);
  const reusable=pending.filter(p=>!args.refresh&&p.ads_txt_summary&&JSON.parse(p.ads_txt_summary).summary_version===1);
  const reusedIds=new Set(reusable.map(p=>p.id));
  // A reused verifier fetch needs no network slot. Checkpoint it before the slow
  // shared-host tail, in short transactions that can coexist with RDAP writes.
  for(let i=0;i<reusable.length;i+=1000) {
    db.exec('begin immediate');
    try{for(const p of reusable.slice(i,i+1000))saveState(db,p.id,'ads-txt-summary','reused');db.exec('commit');}
    catch(error){db.exec('rollback');throw error;}
    await progressFile(args['progress-file'],{kind:'ads-txt-summary',status:'checkpointing-reuse',pid:process.pid,reused:Math.min(i+1000,reusable.length),total:reusable.length});
  }
  await runSites(db,args,'ads-txt-summary',async p=>{
    if(p.ads_txt_summary && JSON.parse(p.ads_txt_summary).summary_version === 1 && !args.refresh){saveState(db,p.id,'ads-txt-summary','reused');return 'reused';}
    let fetched=await fetchAdsTxt(p.normalized_domain);
    let parsed=fetched.outcome==='parsed' ? parseAdsTxt(fetched.text):null;
    if(parsed?.subdomains.some(s=>s.value===p.normalized_domain) && fetched.registrableDomain){
      fetched=await fetchDeclaredSubdomainAdsTxt(p.normalized_domain);
      parsed=fetched.outcome==='parsed' ? parseAdsTxt(fetched.text):null;
    }
    if(parsed) {
      db.prepare('update publishers set ads_txt_summary=? where id=?').run(JSON.stringify(summarizeAdsTxt(fetched.text)),p.id);
      saveState(db,p.id,'ads-txt-summary','measured',{source_url:fetched.finalUrl,sha256:fetched.sha256});return 'measured';
    }
    saveState(db,p.id,'ads-txt-summary',fetched.outcome,{reason:fetched.reason??null},86400);return fetched.outcome;
  },pending.filter(p=>!reusedIds.has(p.id)),()=>({reusedBeforeRun:reusable.length}),{groupKey:p=>siteWorkHost(p,true)});
} finally {db.close();}
