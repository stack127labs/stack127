#!/usr/bin/env node
import { registerHooks } from 'node:module';
import { getDomain } from 'tldts';
import { registrationDate,registrationTld } from './enrichment-parsers.mjs';
import { enrichmentArgs,enrichmentDatabase,confirmedSites,progressFile,saveState } from './enrichment-store.mjs';
// The Next runtime accepts extensionless TS imports. Resolve those same imports in this Node CLI.
registerHooks({resolve(specifier,context,next){
  try{return next(specifier,context);}catch(error){
    if(error.code==='ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier))return next(`${specifier}.ts`,context);
    throw error;
  }
}});
const { registrationServiceForTld }=await import('../../lib/domain/bootstrap.ts');
const { fetchRegistry }=await import('../../lib/domain/rdap.ts');
const args=enrichmentArgs(),db=enrichmentDatabase(args);
let stopped=false,signal;
const stop=value=>{stopped=true;signal=value;};
const interrupt=()=>stop('SIGINT'),terminate=()=>stop('SIGTERM');
process.on('SIGINT',interrupt);process.on('SIGTERM',terminate);
const sleep=async ms=>{const until=Date.now()+ms;while(!stopped&&Date.now()<until)await new Promise(r=>setTimeout(r,Math.min(1000,until-Date.now())));};
let reportTimer;
try {
  const roots=new Map();
  for(const site of confirmedSites(db,'p.id,p.normalized_domain')){
    // Registration belongs to the ICANN registrable domain, never a private hosting suffix.
    const domain=getDomain(site.normalized_domain,{allowPrivateDomains:false});
    if(domain){if(!roots.has(domain))roots.set(domain,[]);roots.get(domain).push(site.id);}
    else saveState(db,site.id,'domain-age','no_registrable_domain');
  }
  const groups=new Map();let processed=0;
  for(const [domain,ids] of roots){
    const tld=registrationTld(domain),coverage=registrationServiceForTld(tld);
    const prior=db.prepare('select * from rdap_domains where domain=?').get(domain);
    const repairedCoverage=prior?.status==='no_service'&&['bootstrap','override'].includes(coverage.source);
    if(prior && !repairedCoverage && !args.refresh && (!prior.retry_at || prior.retry_at>new Date().toISOString())) {
      if(prior.registered_on)for(const id of ids)db.prepare('update publishers set domain_created_on=? where id=?').run(prior.registered_on,id);
      continue;
    }
    const key=coverage.url ? new URL(coverage.url).hostname : 'no-rdap';
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push({domain,ids,tld,coverage});
  }
  const total=[...groups.values()].reduce((n,g)=>n+g.length,0),startedAt=new Date().toISOString(),outcomes={};
  const tlds=new Map();
  for(const group of groups.values())for(const row of group)if(['bootstrap','override'].includes(row.coverage.source)){
    if(!tlds.has(row.tld))tlds.set(row.tld,{tld:row.tld,total:0,processed:0,milliseconds:0});tlds.get(row.tld).total++;
  }
  async function report(){const elapsed=(Date.now()-Date.parse(startedAt))/1000;
    const remainingTlds=[...tlds.values()].filter(row=>row.total>row.processed).map(row=>({tld:row.tld,total:row.total,processed:row.processed,
      remaining:row.total-row.processed,etaSeconds:Math.ceil((row.total-row.processed)*Math.max(3100,row.processed?row.milliseconds/row.processed:0)/1000)})).sort((a,b)=>b.etaSeconds-a.etaSeconds);
    await progressFile(args['progress-file'],{kind:'domain-age',pid:process.pid,status:stopped?'stopped':processed===total?'complete':'running',startedAt,total,processed,outcomes,
      remaining:total-processed,elapsedSeconds:Math.round(elapsed),sitesPerSecond:elapsed?processed/elapsed:0,
      etaSeconds:remainingTlds[0]?.etaSeconds??0,remainingTlds:remainingTlds.slice(0,12)});}
  await report();
  reportTimer=setInterval(()=>{void report().catch(error=>{console.error(error);stopped=true;});},15000);reportTimer.unref();
  // One worker per registry endpoint, at most 20 requests per minute per TLD and 60 per host.
  // Shared engine throttles and rejection breaker remain authoritative.
  const entries=[...groups.values()];let cursor=0;
  await Promise.all(Array.from({length:Math.min(+args.concurrency,entries.length)},async()=>{
    while(!stopped&&cursor<entries.length){
      const group=entries[cursor++],lastTld=new Map();let lastHost=0;
      for(const {domain,ids,tld,coverage} of group){
        if(stopped||processed>=+args.limit)break;
        const requestStarted=Date.now();
        let result={status:'no_service',body:null,url:null},date=null;
        if(coverage.source==='bootstrap'||coverage.source==='override'){
          await sleep(Math.max(0,lastHost+1100-Date.now(),(lastTld.get(tld)??0)+3100-Date.now()));
          if(stopped)break;
          lastHost=Date.now();lastTld.set(tld,lastHost);
          for(let attempt=0;attempt<3;attempt++){
            result=(await fetchRegistry(domain,tld,{bypassCache:true})).fetch;
            if(stopped)break;
            if(!['rate_limited','registry_error','timeout'].includes(result.status))break;
            if(attempt<2)await sleep(Math.max(1000*2**attempt,(result.retryAfterSeconds??0)*1000));
          }
          if(result.status==='registered')date=registrationDate(result.body,Date.now(),domain);
        }
        const terminal=['registered','not_registered','no_service'].includes(result.status);
        const now=new Date().toISOString(),retry=terminal?null:new Date(Date.now()+86400000).toISOString();
        db.prepare(`insert into rdap_domains(domain,status,registered_on,checked_at,retry_at,source_url) values(?,?,?,?,?,?)
          on conflict(domain) do update set status=excluded.status,registered_on=excluded.registered_on,
          checked_at=excluded.checked_at,retry_at=excluded.retry_at,source_url=excluded.source_url`).run(domain,result.status,date,now,retry,result.url);
        for(const id of ids){
          if(date)db.prepare('update publishers set domain_created_on=? where id=?').run(date,id);
          saveState(db,id,'domain-age',result.status,{domain,registered_on:date,source_url:result.url},terminal?null:86400);
        }
        outcomes[result.status]=(outcomes[result.status]??0)+1;processed++;
        const timing=tlds.get(tld);if(timing){timing.processed++;timing.milliseconds+=Date.now()-requestStarted;}
        if(processed%50===0){await report();console.log(JSON.stringify({processed,total,outcomes}));}
      }
    }
  }));
  await report(); console.log(JSON.stringify({kind:'domain-age',total,processed,outcomes}));
  if(stopped)process.exitCode=signal==='SIGINT'?130:143;
}finally{clearInterval(reportTimer);process.off('SIGINT',interrupt);process.off('SIGTERM',terminate);db.close();}
