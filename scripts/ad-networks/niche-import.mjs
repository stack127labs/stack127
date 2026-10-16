#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { readFile } from 'node:fs/promises';
import { adNetworkNiches } from '../../lib/ad-network-niches.ts';
import { normalizeDomain } from './lib.mjs';
import { enrichmentArgs,enrichmentDatabase,saveState } from './enrichment-store.mjs';
export function validateNicheResult(row) {
  const slugs=new Set(adNetworkNiches.map(n=>n.slug));
  if(!row || typeof row!=='object'||!normalizeDomain(row.domain))throw new Error('Invalid domain');
  if(row.niche!==null && !slugs.has(row.niche))throw new Error(`Invalid niche for ${row.domain}`);
  const numeric=typeof row.confidence==='number'&&Number.isFinite(row.confidence)&&row.confidence>=0&&row.confidence<=1;
  if(!numeric&&!['high','medium','low'].includes(row.confidence))throw new Error(`Confidence must be high, medium, low, or 0 to 1 for ${row.domain}`);
  return {...row,domain:normalizeDomain(row.domain)};
}
export function publicNiche(row) {
  // Keep the model's suggestion in local state, but withhold uncertain labels.
  return row.confidence==='low'||(typeof row.confidence==='number'&&row.confidence<0.8)?null:row.niche;
}
// Validate all rows before beginning a single atomic import.
if(process.argv[1] && import.meta.url===(await import('node:url')).pathToFileURL(process.argv[1]).href){
  const args=enrichmentArgs({file:{type:'string',multiple:true},apply:{type:'boolean',default:false}});
  if(!args.file?.length)throw new Error('Supply --file result.jsonl (repeat for more files)');
  const rows=new Map();
  for(const file of args.file)for(const [i,line] of (await readFile(file,'utf8')).split(/\r?\n/).entries()){
    if(!line.trim())continue;
    let row;try{row=validateNicheResult(JSON.parse(line));}catch(error){throw new Error(`${file}:${i+1}: ${error.message}`);}
    if(rows.has(row.domain)&&JSON.stringify(rows.get(row.domain))!==JSON.stringify(row))throw new Error(`Conflicting results: ${row.domain}`);
    rows.set(row.domain,row);
  }
  const db=args.apply?enrichmentDatabase(args):new DatabaseSync(args['local-database'],{readOnly:true});let changed=0,withheld=0;
  try{
    db.exec(args.apply?'begin immediate':'begin');
    for(const row of rows.values()){
      const site=db.prepare(`select p.id,p.niche from publishers p where normalized_domain=? and exists(
        select 1 from relationships r where r.publisher_id=p.id and status='confirmed')`).get(row.domain);
      if(!site)throw new Error(`Domain is not confirmed: ${row.domain}`);
      const niche=publicNiche(row);
      if(row.niche!==null&&niche===null)withheld++;
      if(site.niche!==niche)changed++;
      if(args.apply){db.prepare('update publishers set niche=? where id=?').run(niche,site.id);
        saveState(db,site.id,'niche','classified',{confidence:row.confidence,suggested_niche:row.niche});}
    }
    db.exec(args.apply?'commit':'rollback');
    console.log(JSON.stringify({applied:args.apply,rows:rows.size,changed,withheld_low_confidence:withheld}));
  }catch(error){db.exec('rollback');throw error;}finally{db.close();}
}
