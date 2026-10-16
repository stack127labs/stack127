#!/usr/bin/env node
import { createReadStream } from 'node:fs';
import { mkdir,writeFile,rename,readFile } from 'node:fs/promises';
import { createGunzip,gunzipSync } from 'node:zlib';
import { createInterface } from 'node:readline';
import { dirname,resolve } from 'node:path';
import { csvFields,normalizeDomain } from './lib.mjs';
import { safeFetch,readLimitedText } from './fetch-policy.mjs';
import { cruxBucket } from './enrichment-parsers.mjs';
import { enrichmentArgs,enrichmentDatabase,confirmedSites,saveState,progressFile } from './enrichment-store.mjs';

export const CRUX_ATTRIBUTION = {
  creator:'Google Chrome UX Report',license:'CC BY 4.0',license_url:'https://creativecommons.org/licenses/by/4.0/',
  terms_url:'https://developer.chrome.com/docs/crux/methodology#license',
  cache:'https://github.com/zakird/crux-top-lists',
  adaptation:'Rank magnitudes grouped as top-10k, top-100k, top-1m. Best rank for exact hostname with www alias; absent means not in this top-million snapshot, not zero traffic.'
};
const startedAt=new Date().toISOString();
const args=enrichmentArgs({csv:{type:'string'},month:{type:'string'},'cache-directory':{type:'string',default:'/tmp/s127-crux'}});
let file=args.csv,month=args.month,url;
if(file && !/^20\d{2}(0[1-9]|1[0-2])$/.test(month??''))throw new Error('Offline --csv requires --month YYYYMM');
if(!file){
  const listing=await safeFetch('https://api.github.com/repos/zakird/crux-top-lists/contents/data/global',{headers:{Accept:'application/vnd.github+json'}});
  if(!listing.response.ok)throw new Error(`CrUX listing HTTP ${listing.response.status}`);
  const months=JSON.parse(await readLimitedText(listing.response,2*1024*1024)).filter(r=>/^20\d{4}\.csv\.gz$/.test(r.name)).sort((a,b)=>b.name.localeCompare(a.name));
  const latest=months[0];if(!latest)throw new Error('No dated CrUX snapshot found');
  month=latest.name.slice(0,6);url=`https://raw.githubusercontent.com/zakird/crux-top-lists/main/data/global/${latest.name}`;
  file=resolve(args['cache-directory'],latest.name);await mkdir(dirname(file),{recursive:true});
  try{await readFile(file);}catch(error){
    if(error.code!=='ENOENT')throw error;
    const downloaded=await safeFetch(url,{timeoutMs:180000});
    if(!downloaded.response.ok)throw new Error(`CrUX download HTTP ${downloaded.response.status}`);
    // Compressed dataset is bounded; parsing below streams the decompressed CSV.
    const reader=downloaded.response.body.getReader(),chunks=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;
      if(size>64*1024*1024){await reader.cancel();throw new Error('CrUX archive too large');}chunks.push(value);}
    const bytes=Buffer.concat(chunks);gunzipSync(bytes,{maxOutputLength:256*1024*1024});
    await writeFile(`${file}.tmp`,bytes,{mode:0o600});await rename(`${file}.tmp`,file);
  }
}
url ??= `https://raw.githubusercontent.com/zakird/crux-top-lists/main/data/global/${month}.csv.gz`;
const ranks=new Map();let lines=0,invalidOrigins=0;
const stream=file.endsWith('.gz')?createReadStream(file).pipe(createGunzip()):createReadStream(file);
for await(const line of createInterface({input:stream,crlfDelay:Infinity})){
  if(++lines===1){if(line.trim()!=='origin,rank')throw new Error('Unexpected CrUX CSV header');continue;}
  const [origin,rank]=csvFields(line);if(!origin)continue;
  let parsed;try{parsed=new URL(origin);}catch{invalidOrigins++;continue;}
  if(!['http:','https:'].includes(parsed.protocol)||!cruxBucket(rank))throw new Error(`Invalid CrUX row ${lines}`);
  const domain=normalizeDomain(parsed.hostname);if(!domain)continue;
  ranks.set(domain,Math.min(Number(rank),ranks.get(domain)??Infinity));
}
// Do not label absent sites from a partial download.
if(invalidOrigins>100)throw new Error(`Too many invalid CrUX origins: ${invalidOrigins}`);
if(lines<500000)throw new Error('CrUX snapshot is implausibly small; refusing not-ranked assignments');
const db=enrichmentDatabase(args);
try{
  const counts={},sites=confirmedSites(db,'p.id,p.normalized_domain');
  for(const p of sites){
    const group=ranks.has(p.normalized_domain)?cruxBucket(ranks.get(p.normalized_domain)):'not-ranked';
    db.prepare('update publishers set traffic_group=? where id=?').run(group,p.id);
    saveState(db,p.id,'traffic','measured',{month,source_url:url??null,...CRUX_ATTRIBUTION});
    counts[group]=(counts[group]??0)+1;
  }
  const summary={kind:'traffic',startedAt,elapsedSeconds:Math.round((Date.now()-Date.parse(startedAt))/1000),month,source_url:url??null,rows:lines-1,invalid_origins:invalidOrigins,total:sites.length,counts,attribution:CRUX_ATTRIBUTION};
  await progressFile(args['progress-file'],summary);console.log(JSON.stringify(summary));
}finally{db.close();}
