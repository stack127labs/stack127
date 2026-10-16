#!/usr/bin/env node
import { mkdir,writeFile,rename,readdir,readFile,link,unlink } from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { enrichmentArgs,enrichmentDatabase,progressFile } from './enrichment-store.mjs';
import { assertLocalCatalog } from './identity-catalog.mjs';
const args=enrichmentArgs({output:{type:'string',default:'/tmp/s127-niche/input'},'batch-size':{type:'string',default:'1500'},
  incremental:{type:'boolean',default:false},flush:{type:'boolean',default:false},'include-unknown':{type:'boolean',default:false},'run-directory':{type:'string'}});
if(!/^[1-9]\d*$/.test(args['batch-size']) || +args['batch-size']>10000)throw new Error('Invalid batch size');
const db=enrichmentDatabase(args);
try {
  // Use a run directory so old batches cannot leak into a smaller replacement export.
  const output=args['run-directory']?resolve(args['run-directory']):join(resolve(args.output),args.incremental?new Date().toISOString().slice(0,10):new Date().toISOString().replace(/[:.]/g,'-'));
  await mkdir(output,{recursive:true,mode:0o700});
  const exported=new Set();let sequence=0,existingFiles=0;
  if(args.incremental)for(const name of await readdir(output)){
    const match=/^batch-(\d+)\.jsonl$/.exec(name);if(!match)continue;
    existingFiles++;sequence=Math.max(sequence,Number(match[1]));
    for(const line of (await readFile(join(output,name),'utf8')).trim().split('\n'))if(line)exported.add(JSON.parse(line).domain);
  }
  db.exec('begin');
  assertLocalCatalog(db);
  let sites=db.prepare(`select p.id,p.normalized_domain,p.platform,s.data as homepage_data
    from publishers p left join enrichment_state s on s.publisher_id=p.id and s.kind='homepage' and s.status='measured'
    where exists(select 1 from relationships r where r.publisher_id=p.id and r.status='confirmed') order by p.id`).all();
  const networkMap=new Map();
  for(const row of db.prepare("select r.publisher_id,n.slug from relationships r join ad_networks n on n.id=r.ad_network_id where r.status='confirmed' order by r.publisher_id,n.slug").all()){
    if(!networkMap.has(row.publisher_id))networkMap.set(row.publisher_id,[]);networkMap.get(row.publisher_id).push(row.slug);
  }
  db.exec('commit');
  sites=sites.filter(p=>!exported.has(p.normalized_domain)&&(!args.incremental||args['include-unknown']||p.homepage_data));
  const readyRows=sites.length;
  if(args.incremental&&!args.flush&&!args['include-unknown'])sites=sites.slice(0,Math.floor(sites.length/+args['batch-size'])*+args['batch-size']);
  let files=0;
  for(let i=0;i<sites.length;i+=+args['batch-size']){
    const lines=sites.slice(i,i + +args['batch-size']).map(p=>{
      const facts=p.homepage_data?JSON.parse(p.homepage_data):{};
      const networks=networkMap.get(p.id)??[];
      return JSON.stringify({domain:p.normalized_domain,title:facts.title??null,description:facts.description??null,h1:facts.h1??null,
        language:facts.language??null,platform:p.platform??null,networks});
    });
    files++;
    const path=join(output,`batch-${String(++sequence).padStart(4,'0')}.jsonl`),temporary=`${path}.${process.pid}.tmp`;
    await writeFile(temporary,lines.join('\n')+'\n',{mode:0o600});
    // Publish a complete immutable batch. Another exporter cannot overwrite it.
    if(args.incremental){await link(temporary,path);await unlink(temporary);}else await rename(temporary,path);
  }
  const summary={status:'complete',incremental:args.incremental,rows:sites.length,files,waitingForBatch:readyRows-sites.length,exportedRows:exported.size+sites.length,
    totalFiles:existingFiles+files,output,finishedAt:new Date().toISOString()};
  await progressFile(args['progress-file'],summary);console.log(JSON.stringify(summary));
}finally{db.close();}
