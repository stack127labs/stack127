#!/usr/bin/env node
// One foreground command. It creates no schedule or service and resumes from SQLite checkpoints.
import { spawn } from 'node:child_process';
import { existsSync,mkdirSync,readFileSync } from 'node:fs';
import { snapshotLocal } from './snapshot-local.mjs';
import { DatabaseSync } from 'node:sqlite';
import { homedir } from 'node:os';
import { join,resolve } from 'node:path';
import { enrichmentArgs,progressFile } from './enrichment-store.mjs';
const args=enrichmentArgs({
  'state-directory':{type:'string',default:join(homedir(),`.local/share/stack127/gather-${new Date().toISOString().slice(0,10)}`)},
  'niche-output':{type:'string',default:'/tmp/s127-niche/input'},
  'backup-directory':{type:'string',default:'/srv/data/backups/stack127-ad-networks'},
  'cleanup-code':{type:'boolean',default:false},
  'parallel-domain-age':{type:'boolean',default:false},
  'wait-for-pid':{type:'string'},'skip-verification':{type:'boolean',default:false},
});
const dir=resolve(args['state-directory']);mkdirSync(dir,{recursive:true,mode:0o700});
const database=resolve(args['local-database']);
let stopped=false;
const children=new Map();let pipelineState={pid:process.pid},reporting=Promise.resolve(),rdapRun;
function reportPipeline(patch={}) {
  pipelineState={...pipelineState,...patch,activeProcesses:Object.fromEntries([...children].map(([child,name])=>[name,child.pid])),updatedAt:new Date().toISOString()};
  const snapshot={...pipelineState};
  reporting=reporting.then(()=>progressFile(join(dir,'pipeline.json'),snapshot));return reporting;
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopped=true;for(const child of children.keys())child.kill(signal);});
async function dailyBackup(){
  const file=join(resolve(args['backup-directory']),`ad-networks-${new Date().toISOString().slice(0,10)}.sqlite`);
  if(existsSync(file))return;
  // Reuse the known working job when available. The script does not create or edit a unit.
  await runCommand('systemctl',['--user','start','stack127-ad-network-backup.service']);
  if(!existsSync(file))throw new Error(`Daily backup missing: ${file}`);
}
async function runCommand(command,argv,label=command){
  if(stopped)throw new Error('Gathering stopped');
  await new Promise((yes,no)=>{
    const child=spawn(command,argv,{stdio:'inherit',env:{...process.env,UV_THREADPOOL_SIZE:'128',NODE_NO_WARNINGS:'1'}});
    children.set(child,label);console.log(JSON.stringify({processStarted:label,pid:child.pid,at:new Date().toISOString()}));
    void reportPipeline().catch(no);
    child.on('error',error=>{children.delete(child);no(error);});
    child.on('exit',(code,signal)=>{children.delete(child);code===0?yes():no(new Error(`${label} exited ${code??signal}`));});
  });
}
async function step(name,options=[],parallel=false){
  await dailyBackup();
  const progressIndex=options.findIndex(option=>option==='--summary-file'||option==='--progress-file');
  const progress=progressIndex>=0?options[progressIndex+1]:null;
  await reportPipeline(parallel?{parallelStep:{step:name,status:'running',progressFile:progress}}:{status:'running',step:name,progressFile:progress});
  for(let attempt=0;attempt<3;attempt++){
    try {await runCommand(process.execPath,['--experimental-strip-types',`scripts/ad-networks/${name}.mjs`,...options],name);
      if(parallel)await reportPipeline({parallelStep:{step:name,status:'complete',progressFile:progress}});return;}
    catch(error){if(stopped||attempt===2)throw error;console.error(`${name} failed; resuming after backoff (${attempt+1}/3)`);await new Promise(r=>setTimeout(r,2000*2**attempt));}
  }
}
function neverChecked(){const db=new DatabaseSync(database,{readOnly:true});try{return db.prepare('select count(*) n from publishers where last_check_outcome is null').get().n;}finally{db.close();}}
try{
  if(args['wait-for-pid']){
    await progressFile(join(dir,'pipeline.json'),{status:'waiting',step:'existing-verifier',pid:Number(args['wait-for-pid']),updatedAt:new Date().toISOString()});
    const pid=Number(args['wait-for-pid']);if(!Number.isSafeInteger(pid)||pid<2)throw new Error('Invalid wait PID');
    // Attach to the explicitly named first one-shot run; do not launch a duplicate.
    while(true){try{process.kill(pid,0); if(!readFileSync(`/proc/${pid}/cmdline`,'utf8').includes('scripts/ad-networks/verify.mjs'))break;}catch(error){if(['ESRCH','ENOENT'].includes(error.code))break;throw error;}
      if(stopped)throw new Error('Gathering stopped');
      await new Promise(r=>setTimeout(r,5000));
    }
  }
  let run=0;
  if(!args['skip-verification'])while(neverChecked()){
    const before=neverChecked();
    await step('verify',['--apply','--unchecked-only','--local-database',database,'--limit','100000','--concurrency',args.concurrency,
      '--lease-minutes','30','--time-budget-minutes','350','--summary-file',join(dir,`verify-drain-${Date.now()}-${++run}.json`)]);
    if(neverChecked()>=before)throw new Error('No unchecked-site progress; inspect active leases before resuming');
  }
  const common=['--local-database',database,'--concurrency',args.concurrency];
  const rdapOptions=[...common,'--progress-file',join(dir,'domain-age.json')];
  if(args['parallel-domain-age'])rdapRun=step('domain-age',rdapOptions,true).then(()=>null,error=>error);
  for(const script of ['ads-txt-summary','platform','domain-age','publisher-names','traffic']){
    if(script==='domain-age'&&rdapRun)continue;
    await step(script,[...common,'--progress-file',join(dir,`${script}.json`)]);
  }
  await step('niche-export',['--local-database',database,'--output',args['niche-output']]);
  if(rdapRun) {
    // Make completed homepage/name/traffic work available while registries drain.
    const interim=await snapshotLocal(database,join(dir,'sync-interim.sqlite'));
    await step('sync',['--sqlite',interim,'--environment','development','--apply']);
    await reportPipeline({status:'running',step:'waiting-domain-age',progressFile:join(dir,'domain-age.json')});
    const error=await rdapRun;if(error)throw error;
    // Include any sites promoted by the homepage review after RDAP's first cohort.
    await step('domain-age',rdapOptions);
  }
  // Sync reads an online snapshot, never copies an open WAL file.
  const snapshot=await snapshotLocal(database,join(dir,'sync.sqlite'));
  await step('sync',['--sqlite',snapshot,'--environment','development','--apply']);
  await step('snapshot',['--environment','development','--apply']);
  await reportPipeline({status:'complete',finishedAt:new Date().toISOString(),snapshot});
  if(args['cleanup-code']){
    const cwd=process.cwd();
    if(!/^\/tmp\/s127-gather-[a-z0-9-]+$/.test(cwd))throw new Error('Cleanup is only allowed in this task temporary directory');
    const {rm}=await import('node:fs/promises');await rm(cwd,{recursive:true});
  }
}catch(error){
  for(const child of children.keys())child.kill('SIGTERM');
  if(rdapRun)await rdapRun;
  await reportPipeline({status:stopped?'stopped':'failed',error:error.message});console.error(error);process.exitCode=1;
}
