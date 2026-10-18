import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { openLocalDatabase, defaultLocalDatabasePath } from './local-db.mjs';
import { getDomain } from 'tldts';
import { createEnrichmentQueue } from './enrichment-queue.mjs';

export function enrichmentArgs(extra = {}) {
  const {values} = parseArgs({options: { 'local-database': {type:'string',default:defaultLocalDatabasePath},
    concurrency: {type:'string',default:'32'}, limit:{type:'string',default:'1000000'},
    'progress-file':{type:'string',default:'tmp/ad-networks/enrichment-progress.json'},
    'time-budget-minutes':{type:'string',default:'350'},
    refresh:{type:'boolean',default:false}, ...extra }});
  for (const field of ['concurrency','limit']) if (!/^[1-9]\d*$/.test(values[field])) throw new Error(`Invalid --${field}`);
  if (+values.concurrency > 100) throw new Error('Concurrency must be at most 100');
  if (!/^[1-9]\d*$/.test(values['time-budget-minutes']) || +values['time-budget-minutes']>350) throw new Error('Invalid time budget');
  return values;
}
export function enrichmentDatabase(args) { return openLocalDatabase(args['local-database']); }
export function confirmedSites(db,fields='p.*') {
  return db.prepare(`select ${fields} from publishers p where exists (select 1 from relationships r
    where r.publisher_id=p.id and r.status='confirmed') order by p.id`).all();
}
export function pendingSites(db,kind,refresh=false,fields='p.*',maxAgeSeconds=null) {
  const staleBefore=maxAgeSeconds===null?null:new Date(Date.now()-maxAgeSeconds*1000).toISOString();
  return db.prepare(`select ${fields} from publishers p left join enrichment_state s on s.publisher_id=p.id and s.kind=?
    where exists(select 1 from relationships r where r.publisher_id=p.id and r.status='confirmed')
    and (? or s.publisher_id is null or s.retry_at<=? or (s.retry_at is null and s.checked_at<=?)) order by p.id`)
    .all(kind,refresh?1:0,new Date().toISOString(),staleBefore);
}
export function saveState(db,id,kind,status,data={},retrySeconds=null) {
  const now=new Date();
  db.prepare(`insert into enrichment_state(publisher_id,kind,status,checked_at,retry_at,data) values(?,?,?,?,?,?)
    on conflict(publisher_id,kind) do update set status=excluded.status,checked_at=excluded.checked_at,
    retry_at=excluded.retry_at,data=excluded.data`).run(id,kind,status,now.toISOString(),retrySeconds ? new Date(+now+retrySeconds*1000).toISOString():null,JSON.stringify(data));
}
export async function progressFile(file,data) {
  const serialized=JSON.stringify(data,null,2)+'\n';
  const path=resolve(file); await mkdir(dirname(path),{recursive:true});
  const temporary=`${path}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temporary,serialized,{mode:0o600});
  await rename(temporary,path);
}
export function siteWorkHost(site,useAdsDestination=false) {
  let hostname=site.normalized_domain;
  if(useAdsDestination)try{hostname=new URL(JSON.parse(site.last_check_evidence??'{}').final_url).hostname;}catch{/* Unknown route: use the site's own host. */}
  return getDomain(hostname,{allowPrivateDomains:true})??hostname;
}
export async function runSites(db,args,kind,work,selectedRows=null,details=()=>({}),options={}) {
  const rows=(selectedRows??pendingSites(db,kind,args.refresh)).slice(0,+args.limit);
  const summary={kind,status:'running',pid:process.pid,startedAt:new Date().toISOString(),total:rows.length,processed:0,outcomes:{}};
  let stopped=false,signal;
  const stop=received=>{stopped=true;signal=received;};
  const interrupt=()=>stop('SIGINT'),terminate=()=>stop('SIGTERM');
  process.on('SIGINT',interrupt);process.on('SIGTERM',terminate);
  const queue=createEnrichmentQueue(rows,{concurrency:+args.concurrency,groupKey:options.groupKey??siteWorkHost,shouldStop:()=>stopped});
  let reports=Promise.resolve();
  async function report() {
    const elapsed=(Date.now()-Date.parse(summary.startedAt))/1000;
    const metrics=queue.snapshot();
    const data={...summary,status:stopped&&summary.status==='running'?'draining':summary.status,...details(),...metrics,elapsedSeconds:Math.round(elapsed),sitesPerSecond:elapsed ? summary.processed/elapsed:0,
      etaSeconds:summary.processed ? Math.max(rows.length>summary.processed?1:0,metrics.hostEtaSeconds,Math.round((rows.length-summary.processed)*elapsed/summary.processed)):null};
    reports=reports.then(()=>progressFile(args['progress-file'],data));await reports;
  }
  let timer;
  const budget=setTimeout(()=>{stopped=true;},+args['time-budget-minutes']*60000);
  try {
    await report();
    timer=setInterval(()=>{void report().catch(()=>{stopped=true;});},15000);timer.unref();
    await queue.run(async row=>{
      // Transport errors are handled by work. SQLite failures must stop the run.
      const outcome=await work(row);
      summary.processed++;summary.outcomes[outcome]=(summary.outcomes[outcome]??0)+1;
      if(summary.processed%100===0){ await report();console.log(JSON.stringify(summary)); }
    });
    summary.status=stopped?(signal?'stopped':'budget_complete'):'complete';
    if(signal){summary.signal=signal;process.exitCode=signal==='SIGINT'?130:143;}
    summary.finishedAt=new Date().toISOString(); await report(); console.log(JSON.stringify(summary));return summary;
  } finally {clearTimeout(budget);clearInterval(timer);process.off('SIGINT',interrupt);process.off('SIGTERM',terminate);}
}
