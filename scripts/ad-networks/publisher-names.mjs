#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { sources } from './sources.mjs';
import { checkRobots, normalizeDomain, sellerDomainsStream } from './lib.mjs';
import { safeFetch } from './fetch-policy.mjs';
import { businessName } from './enrichment-parsers.mjs';
import { enrichmentArgs,enrichmentDatabase,confirmedSites,progressFile,saveState } from './enrichment-store.mjs';
const startedAt=new Date().toISOString();
const args=enrichmentArgs(),db=enrichmentDatabase(args);
try {
  const sites=new Map(confirmedSites(db,'p.id,p.normalized_domain').map(p=>[p.normalized_domain,p]));
  const cohort=createHash('sha256').update([...sites.keys()].sort().join('\n')).digest('hex');
  const results=[];
  for(const source of sources.filter(s=>s.kind==='sellers-json')) {
    if(!source.recurring){results.push({source:source.key,status:'paused',reason:source.pausedReason});continue;}
    const stateKey=`seller-names:${source.key}`;
    const previous=db.prepare('select value from schema_meta where key=?').get(stateKey);
    if(previous?.value===cohort && !args.refresh){results.push({source:source.key,status:'cached'});continue;}
    let rows=[];
    try {
      const request=await safeFetch(source.url,{timeoutMs:180000,beforeRequest:async url=>{if(!source.skipRobotsCheck)await checkRobots(url.href);}});
      if(!request.response.ok){await request.response.body?.cancel();throw new Error(`HTTP ${request.response.status}`);}
      // Stream even the large Google feed. Retain business names only for confirmed domains.
      for await(const row of sellerDomainsStream(request.response.body,seller=>{
        const domain=normalizeDomain(seller.domain),name=businessName(seller.name);
        if(!sites.has(domain)||!name||seller.is_confidential===1||!['PUBLISHER','BOTH'].includes(seller.seller_type))return null;
        const id=typeof seller.seller_id==='string'||typeof seller.seller_id==='number'?String(seller.seller_id).trim():null;
        return id ? {domain,name,id}:null;
      }))rows.push(row);
      db.exec('begin immediate');
      try {
        db.prepare('delete from seller_names where network_slug=? and source_url=?').run(source.networkSlug,source.url);
        const insert=db.prepare('insert or replace into seller_names(network_slug,seller_id,domain,name,source_url) values(?,?,?,?,?)');
        for(const row of rows)insert.run(source.networkSlug,row.id,row.domain,row.name,source.url);
        db.prepare('insert or replace into schema_meta(key,value) values(?,?)').run(stateKey,cohort);
        db.exec('commit');
      }catch(error){db.exec('rollback');throw error;}
      results.push({source:source.key,status:'complete',business_records:rows.length});
    }catch(error){results.push({source:source.key,status:'unavailable',reason:error.message});}
    await progressFile(args['progress-file'],{kind:'publisher-names',sources:results});
    console.log(JSON.stringify(results.at(-1)));
  }
  let filled=0,ambiguous=0;
  for(const site of sites.values()) {
    const rows=db.prepare(`select distinct s.name,s.source_url,s.seller_id,n.slug,r.evidence from seller_names s
      join ad_networks n on n.slug=s.network_slug join relationships r on r.ad_network_id=n.id
      where s.domain=? and r.publisher_id=? and r.status='confirmed'`).all(site.normalized_domain,site.id);
    // Matching the exact confirmed site's domain in its network feed is sufficient. If
    // the verifier retained a specific seller ID, also require that ID to agree.
    const matches=rows.filter(row=>{
      const evidence=JSON.parse(row.evidence||'{}');
      const id=evidence.seller_id ?? (/^[^,\s]+,([^,]+),/.exec(evidence.matched_signal??'')?.[1]);
      return !id || id===row.seller_id;
    });
    const names=[...new Set(matches.map(row=>row.name))];
    const name=names.length===1?names[0]:null;
    db.prepare('update publishers set publisher_name=? where id=?').run(name,site.id);
    saveState(db,site.id,'publisher-names',name?'measured':names.length>1?'ambiguous':'unknown',
      {sources:matches.map(({source_url,seller_id})=>({source_url,seller_id}))});
    if(name)filled++;if(names.length>1)ambiguous++;
  }
  const summary={kind:'publisher-names',startedAt,elapsedSeconds:Math.round((Date.now()-Date.parse(startedAt))/1000),total:sites.size,filled,null:sites.size-filled,ambiguous,sources:results};
  await progressFile(args['progress-file'],summary);console.log(JSON.stringify(summary));
}finally{db.close();}
