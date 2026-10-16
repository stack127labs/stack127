#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { snapshotCounts } from './snapshot.mjs';
import { captureNetworkObservations } from './movements.mjs';
import { resolveDatabaseUrl } from '../stack127/tool-pages/lib.mjs';
import { assertLocalCatalog,assertTargetCatalog } from './identity-catalog.mjs';

const reviewed = new Set(['confirmed', 'stale', 'ended']);
// A terminal discovery candidate has never established network use.
const reviewedWhere = (prefix = '') => `(${prefix}status in ('confirmed','stale') or (${prefix}status='ended' and ${prefix}first_confirmed_at is not null))`;
const publisherFields = ['normalized_domain','display_domain','first_seen_at','last_discovered_at','last_checked_at',
  'check_status','last_check_outcome','last_check_evidence','last_successful_check_at'];
export const enrichmentFields = ['niche','publisher_name','platform','domain_created_on','traffic_group','ads_txt_summary','favicon'];
const relationFields = ['status','relationship_type','verification_method','evidence','first_confirmed_at',
  'last_confirmed_at','ended_at','consecutive_misses','first_missed_at','last_missed_at'];
function object(value, field) {
  const result = typeof value === 'string' ? JSON.parse(value) : value;
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error(`Invalid ${field}`);
  // A binary/misencoded source is not a usable text preview. Keep source counts,
  // and retain the raw SQLite evidence; PostgreSQL jsonb cannot store U+0000.
  if (field === 'ads_txt_summary' && typeof result.preview === 'string' && result.preview.includes('\0')) {
    return {...result,preview:null};
  }
  return result;
}
export function mapSyncPublisher(row) {
  return Object.fromEntries([...publisherFields, ...enrichmentFields.filter(field => Object.hasOwn(row,field)),
    ...(Object.hasOwn(row,'discovery_sources') ? ['discovery_sources'] : [])].map(field => [field,
    ['last_check_evidence','ads_txt_summary'].includes(field) && row[field] != null ? object(row[field],field)
      : field === 'last_check_evidence' ? {} : row[field] ?? null]));
}
export function mapSyncRelationship(row) {
  if (!reviewed.has(row.status) || (row.status === 'ended' && !row.first_confirmed_at)) {
    throw new Error('Only reviewed, previously confirmed relationships may be synced');
  }
  return { domain: row.normalized_domain, network_slug: row.network_slug,
    ...Object.fromEntries(relationFields.map(field => [field,
      field === 'evidence' ? object(row[field] ?? {}, field) : row[field] ?? null])) };
}
export function syncArgs(argv) {
  const {values} = parseArgs({args:argv, options:{sqlite:{type:'string'},apply:{type:'boolean',default:false},
    environment:{type:'string',default:'development'},confirm:{type:'string'},'batch-size':{type:'string',default:'500'},
    'niches-only':{type:'boolean',default:false}}});
  if (!values.sqlite) throw new Error('Supply --sqlite with a consistent SQLite snapshot');
  if (!['development','production'].includes(values.environment)) throw new Error('Invalid environment');
  if (values.environment === 'production' && values.confirm !== 'stack127-production') throw new Error('Production requires --environment production --confirm stack127-production');
  if (!/^[1-9]\d*$/.test(values['batch-size']) || Number(values['batch-size']) > 1000) throw new Error('Batch size must be 1–1000');
  return {...values,batchSize:Number(values['batch-size']),nichesOnly:values['niches-only']};
}
const relColumns = relationFields.join(',');
const relDiff = `(${relationFields.map(f=>`r.${f}`).join(',')}) is distinct from (${relationFields.map(f=>`i.${f}`).join(',')})`;
const relationshipInput = `select n.id as ad_network_id,p.id as publisher_id,${relationFields.map(f=>`x.${f}`).join(',')}
  from jsonb_to_recordset($1::jsonb) x(domain text,network_slug text,status text,relationship_type text,
    verification_method text,evidence jsonb,first_confirmed_at timestamptz,last_confirmed_at timestamptz,
    ended_at timestamptz,consecutive_misses integer,first_missed_at timestamptz,last_missed_at timestamptz)
  join public.ad_network_publishers p on p.normalized_domain=x.domain
  join public.ad_networks n on n.slug=x.network_slug`;

export async function syncReviewedData(options) {
  // Do not call openLocalDatabase: it migrates/seeds the working store. This input is strictly read-only.
  const databaseUrl=resolveDatabaseUrl({environment:options.environment,...(options.apply ? {apply:true,confirm:options.confirm} : {})});
  const sqlite = new DatabaseSync(options.sqlite,{readOnly:true});
  const pool = new pg.Pool({connectionString:databaseUrl,max:1,connectionTimeoutMillis:15000,query_timeout:120000});
  const available=new Set(sqlite.prepare('pragma table_info(publishers)').all().map(row=>row.name));
  const fields=[...publisherFields,...enrichmentFields.filter(field=>available.has(field)),'discovery_sources'];
  const pubColumns=fields.join(',');
  const pubDiff=`(${fields.map(f=>`p.${f}`).join(',')}) is distinct from (${fields.map(f=>`i.${f}`).join(',')})`;
  const publisherInput=`select ${pubColumns} from jsonb_populate_recordset(null::public.ad_network_publishers,$1::jsonb)`;
  let client, locked=false;
  const counts={publishers:0,relationships:0,publishers_inserted:0,publishers_updated:0,
    relationships_inserted:0,relationships_updated:0,snapshots_changed:0};
  try {
    assertLocalCatalog(sqlite);
    for(let attempt=0;attempt<3;attempt++) {
      try{client=await pool.connect();break;}catch(error){
        if(attempt===2 || !['ENOTFOUND','EAI_AGAIN','ETIMEDOUT','ECONNRESET','ECONNREFUSED'].includes(error.code))throw error;
        await new Promise(resolve=>setTimeout(resolve,2000*2**attempt));
      }
    }
    if(options.apply) {
      await client.query("select pg_advisory_lock(hashtext('ad-networks-reviewed-sync'))");
      locked=true;
    }
    sqlite.exec('begin');
    const networkSlugs=sqlite.prepare(`select distinct n.slug from relationships r join ad_networks n on n.id=r.ad_network_id where ${reviewedWhere('r.')}`).all().map(r=>r.slug);
    const target=(await client.query('select slug,manager_domains,ad_system_domains,program_signatures from public.ad_networks')).rows;
    assertTargetCatalog(target);
    const known=new Set(target.map(r=>r.slug));
    for (const slug of networkSlugs) if (!known.has(slug)) throw new Error(`Missing target network: ${slug}`);
    const nicheScope=`exists(select 1 from enrichment_state s where s.publisher_id=p.id and s.kind='niche' and s.status='classified')
      and exists(select 1 from relationships r where r.publisher_id=p.id and ${reviewedWhere('r.')})`;
    if (!options.apply) {
      const publishers=options.nichesOnly?sqlite.prepare(`select count(*) as count from publishers p where ${nicheScope}`).get().count
        :sqlite.prepare(`select count(distinct publisher_id) as count from relationships where ${reviewedWhere()}`).get().count;
      const relationships=options.nichesOnly?0:sqlite.prepare(`select count(*) as count from relationships where ${reviewedWhere()}`).get().count;
      return {applied:false,environment:options.environment,publishers,relationships,message:'Read-only preview; --apply imports these reviewed rows. No target rows changed.'};
    }
    const initialBaseline=(await client.query(`select not exists(select 1 from public.ad_network_check_observations)
      and not exists(select 1 from public.ad_network_relationship_events where event in ('baseline','newly_found','joined')) as initial`)).rows[0].initial;
    async function batch(work) {
      for (let attempt=0;attempt<3;attempt++) {
        await client.query('begin');
        try {const result=await work();await client.query('commit');return result;}
        catch(error) {
          await client.query('rollback');
          // A different writer can publish a route after this transaction starts.
          // Cache acknowledgements can also deadlock with date/event triggers.
          // Retry the whole rolled-back transaction, with a fresh timestamp.
          const retryable=error.constraint==='stack127_pages_public_dates_check'
            || ['40P01','40001'].includes(error.code);
          if (!retryable || attempt===2) throw error;
          await new Promise(resolve=>setTimeout(resolve,100*(attempt+1)));
        }
      }
    }
    if(options.nichesOnly) {
      // The full-cohort sync already created these publishers. A classification
      // update must not retransmit large evidence or overwrite concurrent facts.
      let lastId=0;
      while(true) {
        const source=sqlite.prepare(`select p.id,p.normalized_domain,p.niche from publishers p
          where p.id>? and ${nicheScope} order by p.id limit ?`).all(lastId,options.batchSize);
        if(!source.length)break;
        const payload=JSON.stringify(source.map(({normalized_domain,niche})=>({normalized_domain,niche})));
        const updated=await batch(async()=>{
          const matched=await client.query(`select count(*)::int as count from public.ad_network_publishers p
            join jsonb_to_recordset($1::jsonb) i(normalized_domain text,niche text) using(normalized_domain)`,[payload]);
          if(matched.rows[0].count!==source.length)throw new Error('Niche sync requires a completed full publisher sync first');
          return (await client.query(`update public.ad_network_publishers p set niche=i.niche
            from jsonb_to_recordset($1::jsonb) i(normalized_domain text,niche text)
            where p.normalized_domain=i.normalized_domain and p.niche is distinct from i.niche`,[payload])).rowCount;
        });
        counts.publishers+=source.length;counts.publishers_updated+=updated;lastId=source.at(-1).id;
        if(counts.publishers%5000===0)console.error(`Niche publishers processed: ${counts.publishers}`);
      }
      return {applied:true,environment:options.environment,scope:'niches-only',...counts,observations_changed:0,arrivals_recorded:0};
    }
    // Keyset batches keep both the SQLite read and PostgreSQL payload bounded.
    let lastId=0;
    while (true) {
      const source=sqlite.prepare(`select p.* from publishers p where p.id>? and p.id in(
        select publisher_id from relationships where ${reviewedWhere()}) order by p.id limit ?`).all(lastId,options.batchSize);
      if (!source.length) break;
      const hasEnrichment=sqlite.prepare("select 1 from sqlite_master where type='table' and name='enrichment_state'").get();
      const payload=JSON.stringify(source.map(row=>{
        const traffic=hasEnrichment ? sqlite.prepare("select data from enrichment_state where publisher_id=? and kind='traffic' and status='measured'").get(row.id) : null;
        const evidence=object(row.last_check_evidence??{},'last_check_evidence');
        return mapSyncPublisher({...row,
          last_check_evidence:traffic?{...evidence,enrichment:{...evidence.enrichment,traffic:JSON.parse(traffic.data)}}:evidence,
          discovery_sources:sqlite.prepare(`select source_key,source_url,domain_as_supplied,license_attribution,first_seen_at,last_seen_at
            from publisher_sources where publisher_id=? order by source_key`).all(row.id)});
      }));
      const planned=await batch(async () => {
      const plan=await client.query(`with i as (${publisherInput}) select count(*) filter(where p.id is null)::int inserted,
        count(*) filter(where p.id is not null and ${pubDiff})::int updated from i left join public.ad_network_publishers p using(normalized_domain)`,[payload]);
      await client.query(`insert into public.ad_network_publishers as p (${pubColumns}) ${publisherInput}
        on conflict(normalized_domain) do update set ${fields.filter(f=>f!=='normalized_domain').map(f=>`${f}=excluded.${f}`).join(',')}
        where (${fields.map(f=>`p.${f}`).join(',')}) is distinct from (${fields.map(f=>`excluded.${f}`).join(',')})`,[payload]);
      return plan.rows[0];
      });
      counts.publishers_inserted+=planned.inserted;counts.publishers_updated+=planned.updated;
      counts.publishers+=source.length; lastId=source.at(-1).id;
      if (counts.publishers % 5000 === 0) console.error(`Publishers processed: ${counts.publishers}`);
    }
    let lastNetwork=0,lastPublisher=0;
    while (true) {
      const source=sqlite.prepare(`select r.*,p.normalized_domain,n.slug as network_slug from relationships r
        join publishers p on p.id=r.publisher_id join ad_networks n on n.id=r.ad_network_id
        where ${reviewedWhere('r.')} and (r.ad_network_id>? or (r.ad_network_id=? and r.publisher_id>?))
        order by r.ad_network_id,r.publisher_id limit ?`).all(lastNetwork,lastNetwork,lastPublisher,options.batchSize);
      if (!source.length) break;
      const payload=JSON.stringify(source.map(mapSyncRelationship));
      const planned=await batch(async () => {
      const plan=await client.query(`with i as (${relationshipInput}) select count(*) filter(where r.publisher_id is null)::int inserted,
        count(*) filter(where r.publisher_id is not null and ${relDiff})::int updated from i
        left join public.ad_network_publisher_relationships r using(ad_network_id,publisher_id)`,[payload]);
      await client.query(`insert into public.ad_network_publisher_relationships as r(ad_network_id,publisher_id,${relColumns})
        ${relationshipInput} on conflict(ad_network_id,publisher_id) do update set ${relationFields.map(f=>`${f}=excluded.${f}`).join(',')}
        where (${relationFields.map(f=>`r.${f}`).join(',')}) is distinct from (${relationFields.map(f=>`excluded.${f}`).join(',')})`,[payload]);
      return plan.rows[0];
      });
      counts.relationships_inserted+=planned.inserted;counts.relationships_updated+=planned.updated;
      counts.relationships+=source.length;
      if (counts.relationships % 5000 === 0) console.error(`Relationships processed: ${counts.relationships}`);
      lastNetwork=source.at(-1).ad_network_id;lastPublisher=source.at(-1).publisher_id;
    }
    const movements=await batch(()=>captureNetworkObservations(client,{baseline:initialBaseline,batchSize:options.batchSize}));
    const snapshot=await batch(() => snapshotCounts(client));
    counts.snapshots_changed=snapshot.rowCount;
    return {applied:true,environment:options.environment,...counts,observations_changed:movements.observations,arrivals_recorded:movements.arrivals};
  } catch(error) {if(client) await client.query('rollback').catch(()=>{});throw error;}
  finally {
    sqlite.close();
    if(client) {
      if(locked)await client.query("select pg_advisory_unlock(hashtext('ad-networks-reviewed-sync'))").catch(()=>{});
      client.release();
    }
    await pool.end();
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncReviewedData(syncArgs(process.argv.slice(2))).then(result=>console.log(JSON.stringify(result,null,2)))
    .catch(error=>{console.error(error.message);process.exitCode=1;});
}
