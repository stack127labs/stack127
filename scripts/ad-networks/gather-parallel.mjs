#!/usr/bin/env node
// One-shot supervision: no unit, timer, cron or persistent scheduler is installed.
import {spawn} from 'node:child_process';
import {openSync,closeSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {homedir} from 'node:os';
import {enrichmentArgs,progressFile} from './enrichment-store.mjs';
import {snapshotLocal} from './snapshot-local.mjs';
const args=enrichmentArgs({'state-directory':{type:'string',default:join(homedir(),`.local/share/stack127/gather-${new Date().toISOString().slice(0,10)}`)},
  'niche-directory':{type:'string',default:`/tmp/s127-niche/input/${new Date().toISOString().slice(0,10)}`},'cleanup-code':{type:'boolean',default:false}});
const state=resolve(args['state-directory']),database=resolve(args['local-database']);mkdirSync(state,{recursive:true,mode:0o700});
const env={...process.env,UV_THREADPOOL_SIZE:'128',NODE_NO_WARNINGS:'1',AD_NETWORK_FETCH_THROTTLE_DB:join(state,'fetch-throttle.sqlite')};
let stopped=false,reporting=Promise.resolve(),syncRunning=null,syncError=null;
const children=new Map(),jobs={},dirty=new Set();
const pipeline={pid:process.pid,status:'running',mode:'parallel-one-shot',startedAt:new Date().toISOString(),nicheDirectory:resolve(args['niche-directory'])};
function report(patch={}) {
  Object.assign(pipeline,patch);
  const data=JSON.parse(JSON.stringify({...pipeline,jobs,activeProcesses:Object.fromEntries([...children].map(([child,name])=>[name,child.pid])),updatedAt:new Date().toISOString()}));
  reporting=reporting.then(()=>progressFile(join(state,'pipeline.json'),data));return reporting;
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopped=true;for(const child of children.keys())child.kill(signal);});
async function sleep(ms){const until=Date.now()+ms;while(!stopped&&Date.now()<until)await new Promise(r=>setTimeout(r,Math.min(1000,until-Date.now())));}
async function command(script,options=[]) {
  if(stopped)throw new Error('Gathering stopped');
  const fd=openSync(join(state,`${script}.log`),'a',0o600);
  try {await new Promise((yes,no)=>{
    const child=spawn(process.execPath,['--experimental-strip-types',`scripts/ad-networks/${script}.mjs`,...options],{env,stdio:['ignore',fd,fd]});
    children.set(child,script);console.log(JSON.stringify({processStarted:script,pid:child.pid,at:new Date().toISOString()}));void report().catch(no);
    child.on('error',error=>{children.delete(child);no(error);});
    child.on('exit',(code,signal)=>{children.delete(child);code===0?yes():no(new Error(`${script} exited ${code??signal}`));});
  });}finally{closeSync(fd);}
}
async function syncPending() {
  while(dirty.size&&!stopped) {
    const reasons=[...dirty];dirty.clear();await report({sync:{status:'running',reasons}});
    let lastError;
    for(let attempt=0;attempt<3&&!stopped;attempt++)try {
      const snapshot=await snapshotLocal(database,join(state,'sync-parallel.sqlite'));
      await command('sync',['--sqlite',snapshot,'--environment','development','--apply']);lastError=null;break;
    }catch(error){lastError=error;if(attempt<2)await sleep(2000*2**attempt);}
    if(lastError)throw lastError;
    syncError=null;
    await report({sync:{status:'complete',reasons,finishedAt:new Date().toISOString()}});
  }
}
function requestSync(reason) {
  dirty.add(reason);
  if(!syncRunning)syncRunning=syncPending().catch(async error=>{syncError=error;await report({sync:{status:'failed',error:error.message}});})
    .finally(()=>{syncRunning=null;if(dirty.size&&!stopped)requestSync('pending-completions');});
}
async function job(name,catchup=false) {
  jobs[name]={status:'running',catchup,startedAt:new Date().toISOString(),progressFile:join(state,`${name}.json`)};await report();
  for(let attempt=0;attempt<3&&!stopped;attempt++)try {
    await command(name,['--local-database',database,'--concurrency',args.concurrency,'--progress-file',jobs[name].progressFile]);
    jobs[name].status='complete';jobs[name].finishedAt=new Date().toISOString();await report();requestSync(name);return true;
  }catch(error){jobs[name].error=error.message;if(attempt<2&&!stopped)await sleep(2000*2**attempt);}
  jobs[name].status=stopped?'stopped':'failed';await report();return false;
}
async function exportNiches(final=false) {
  await command('niche-export',['--local-database',database,'--incremental','--run-directory',pipeline.nicheDirectory,
    '--progress-file',join(state,'niche-export.json'),...(final?['--include-unknown']:[])]);
}
try {
  await report();
  const summary=job('ads-txt-summary'),homepage=job('platform');
  async function withCatchup(name) {
    const first=await job(name),page=await homepage;
    return first&&page&&!stopped?job(name,true):first;
  }
  const names=withCatchup('publisher-names'),traffic=withCatchup('traffic'),rdap=withCatchup('domain-age');
  const exporter=(async()=>{
    while(!stopped) {
      await exportNiches();
      if(['complete','failed','stopped'].includes(jobs.platform?.status)) {
        if(jobs.platform.status==='complete')await exportNiches(true);return;
      }
      await sleep(60000);
    }
  })().catch(async error=>{await report({nicheExport:{status:'failed',error:error.message}});throw error;});
  const results=await Promise.allSettled([summary,homepage,names,traffic,rdap,exporter]);
  if(!stopped){requestSync('final-catch-up');while(syncRunning)await syncRunning;}
  else if(syncRunning)await syncRunning;
  const failure=results.find(result=>result.status==='rejected');
  const failed=Object.values(jobs).some(job=>job.status!=='complete');
  if(failure)throw failure.reason;if(syncError)throw syncError;if(failed&&!stopped)throw new Error('An enrichment step failed; inspect its progress/log before resuming.');
  await report({status:stopped?'stopped':'complete',finishedAt:new Date().toISOString()});
  if(stopped)process.exitCode=143;
  else if(args['cleanup-code']) {
    const cwd=process.cwd();if(!/^\/tmp\/s127-gather-[a-z0-9-]+$/.test(cwd))throw new Error('Cleanup is restricted to this task temporary directory');
    const {rm}=await import('node:fs/promises');await rm(cwd,{recursive:true});
  }
}catch(error){
  for(const child of children.keys())child.kill('SIGTERM');
  await report({status:stopped?'stopped':'failed',error:error.message});console.error(error);process.exitCode=1;
}
