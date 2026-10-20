#!/usr/bin/env node
import { DatabaseSync } from 'node:sqlite';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { snapshotCounts } from './snapshot.mjs';
import { captureNetworkObservations } from './movements.mjs';
import { targetDatabaseUrl, targetPool, withJobLock } from './runtime-db.mjs';
import { openSyncState, syncTargetKey } from './sync-state.mjs';
import { assertLocalCatalog,assertTargetCatalog } from './identity-catalog.mjs';

const reviewed = new Set(['confirmed', 'stale', 'ended']);
// A terminal discovery candidate has never established network use.
const reviewedWhere = (prefix = '') => `(${prefix}status in ('confirmed','stale') or (${prefix}status='ended' and ${prefix}first_confirmed_at is not null))`;
const publisherFields = ['normalized_domain','display_domain','first_seen_at','last_discovered_at','last_checked_at',
  'check_status','last_check_outcome','last_check_evidence','last_successful_check_at','discovery_sources'];
export const enrichmentFields = ['niche','publisher_name','platform','domain_created_on','traffic_group','ads_txt_summary','favicon'];
// Recurring model work on homelab owns existing target niches. SQLite can seed
// a newly inserted publisher, but a full collector sync must never replace one.
export const publisherUpdateFields = fields => fields.filter(field => !['normalized_domain','niche'].includes(field));
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
// Reports use manager domains; arrival history uses confirmed networks. Niche
// sorting on homelab also needs these four bounded homepage text fields.
export function compactPublisherEvidence(value, homepage = null) {
  const evidence = object(value ?? {}, 'last_check_evidence');
  const facts = homepage ?? evidence.enrichment?.homepage;
  return {
    ...Object.fromEntries(['manager_domains', 'confirmed_networks'].filter(key => Object.hasOwn(evidence, key)).map(key => [key, evidence[key]])),
    ...(facts && typeof facts === 'object' ? { enrichment: { homepage: Object.fromEntries(
      ['title', 'description', 'h1', 'language'].filter(key => Object.hasOwn(facts, key)).map(key => [key, facts[key]])) } } : {}),
  };
}
const relationshipEvidenceFields = ['manager_domain','matched_signal','checked_url','checked_at','parser_version'];
export function compactRelationshipEvidence(value) {
  const evidence = object(value ?? {}, 'evidence');
  return Object.fromEntries(relationshipEvidenceFields.filter(key => Object.hasOwn(evidence, key)).map(key => [key, evidence[key]]));
}
export function compactDiscoverySources(value) {
  const sources = typeof value === 'string' ? JSON.parse(value) : value ?? [];
  if (!Array.isArray(sources)) throw new Error('Invalid discovery_sources');
  // Preserve source presence and the checker flag used by the weekly chart.
  return sources.map(source => source && typeof source === 'object' && !Array.isArray(source) && Object.hasOwn(source,'source_key')
    ? { source_key: source.source_key } : {});
}
export function mapSyncPublisher(row) {
  return Object.fromEntries([...publisherFields, ...enrichmentFields.filter(field => Object.hasOwn(row,field))].map(field => [field,
    field === 'last_check_evidence' ? compactPublisherEvidence(row[field], row.homepage)
      : field === 'discovery_sources' ? compactDiscoverySources(row[field])
      : field === 'ads_txt_summary' && row[field] != null ? object(row[field], field) : row[field] ?? null]));
}
export function mapSyncRelationship(row) {
  if (!reviewed.has(row.status) || (row.status === 'ended' && !row.first_confirmed_at)) {
    throw new Error('Only reviewed, previously confirmed relationships may be synced');
  }
  return { domain: row.normalized_domain, network_slug: row.network_slug,
    ...Object.fromEntries(relationFields.map(field => [field,
      field === 'evidence' ? compactRelationshipEvidence(row[field]) : row[field] ?? null])) };
}
export function syncArgs(argv) {
  const {values} = parseArgs({args:argv, options:{sqlite:{type:'string'},apply:{type:'boolean',default:false},
    environment:{type:'string',default:'development'},confirm:{type:'string'},'batch-size':{type:'string',default:'500'},
    'niches-only':{type:'boolean',default:false},'seed-niches':{type:'boolean',default:false},
    'state-file':{type:'string'},full:{type:'boolean',default:false}}});
  if (!values.sqlite) throw new Error('Supply --sqlite with the working store or a consistent SQLite snapshot');
  if (!['development','production'].includes(values.environment)) throw new Error('Invalid environment');
  if (values.environment === 'production' && values.confirm !== 'stack127-production') throw new Error('Production requires --environment production --confirm stack127-production');
  if (!/^[1-9]\d*$/.test(values['batch-size']) || Number(values['batch-size']) > 1000) throw new Error('Batch size must be 1–1000');
  if (values['niches-only'] && values['seed-niches']) throw new Error('Choose either --seed-niches or the reviewed --niches-only correction');
  if (values['state-file'] && resolve(values['state-file']) === resolve(values.sqlite)) throw new Error('Sync state must differ from the source SQLite store');
  return {...values,stateFile:resolve(values['state-file'] ?? `${values.sqlite}.sync-state.sqlite`),batchSize:Number(values['batch-size']),nichesOnly:values['niches-only'] || values['seed-niches'],seedNiches:values['seed-niches']};
}
const relColumns = relationFields.join(',');
const relDiff = `(${relationFields.map(f=>`r.${f}`).join(',')}) is distinct from (${relationFields.map(f=>`i.${f}`).join(',')})`;
const relationshipInput = `select n.id as ad_network_id,p.id as publisher_id,${relationFields.map(f=>`x.${f}`).join(',')}
  from jsonb_to_recordset($1::jsonb) x(domain text,network_slug text,status text,relationship_type text,
    verification_method text,evidence jsonb,first_confirmed_at timestamptz,last_confirmed_at timestamptz,
    ended_at timestamptz,consecutive_misses integer,first_missed_at timestamptz,last_missed_at timestamptz)
  join public.ad_network_publishers p on p.normalized_domain=x.domain
  join public.ad_networks n on n.slug=x.network_slug`;

// Seed admission is enforced in the UPDATE, under its row lock. A classifier
// that wins the race keeps its label; neither an old label nor null replaces it.
export async function syncNicheBatch(client, source, mode) {
  if (!['seed', 'correction'].includes(mode)) throw new Error('Explicit niche sync mode required');
  const payload=JSON.stringify(source.map(({normalized_domain,niche})=>({normalized_domain,niche})));
  const matched=await client.query(`select count(*)::int as count from public.ad_network_publishers p
    join jsonb_to_recordset($1::jsonb) i(normalized_domain text,niche text) using(normalized_domain)`,[payload]);
  if(matched.rows[0].count!==source.length)throw new Error('Niche sync requires a completed full publisher sync first');
  const admission=mode==='seed' ? 'p.niche is null and i.niche is not null' : 'p.niche is distinct from i.niche';
  return (await client.query(`update public.ad_network_publishers p set niche=i.niche
    from jsonb_to_recordset($1::jsonb) i(normalized_domain text,niche text)
    where p.normalized_domain=i.normalized_domain and ${admission}`,[payload])).rowCount;
}

export async function syncReviewedData(options, dependencies = {}) {
  // Do not call openLocalDatabase: it migrates/seeds the working store. This input is strictly read-only.
  const databaseUrl=targetDatabaseUrl({environment:options.environment,...(options.apply ? {apply:true,confirm:options.confirm} : {})});
  const sqlite = new DatabaseSync(options.sqlite,{readOnly:true,timeout:10000});
  const pool = dependencies.pool ?? targetPool(options);
  const available=new Set(sqlite.prepare('pragma table_info(publishers)').all().map(row=>row.name));
  const fields=[...publisherFields,...enrichmentFields.filter(field=>available.has(field))];
  const pubColumns=fields.join(',');
  const updates=publisherUpdateFields(fields);
  const pubDiff=`(${updates.map(f=>`p.${f}`).join(',')}) is distinct from (${updates.map(f=>`i.${f}`).join(',')})`;
  const publisherInput=`select ${pubColumns} from jsonb_populate_recordset(null::public.ad_network_publishers,$1::jsonb)`;
  let client, locked=false, state;
  const counts={publishers:0,relationships:0,publishers_sent:0,relationships_sent:0,publishers_inserted:0,publishers_updated:0,
    relationships_inserted:0,relationships_updated:0,snapshots_changed:0};
  try {
    assertLocalCatalog(sqlite);
    const work = async (signal, connection) => {
      client = connection;
      if(options.apply) {
        locked = (await client.query("select pg_try_advisory_lock(hashtext('ad-networks-reviewed-sync')) as locked")).rows[0].locked;
        if (!locked) return { skipped: true, reason: 'another reviewed sync is running' };
      }
      try {
        // Pin one WAL view only after winning the remote lock. No full-file copy,
        // and no older pre-lock snapshot can overwrite a newer completed sync.
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
            if (signal?.aborted) throw new Error('Sync database lock connection lost');
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
            const updated=await batch(()=>syncNicheBatch(client,source,options.seedNiches?'seed':'correction'));
            counts.publishers+=source.length;counts.publishers_updated+=updated;lastId=source.at(-1).id;
            if(counts.publishers%5000===0)console.error(`Niche publishers processed: ${counts.publishers}`);
          }
          return {applied:true,environment:options.environment,scope:options.seedNiches?'niche-seed':'niches-only',...counts,observations_changed:0,arrivals_recorded:0};
        }
        state = openSyncState(options.stateFile ?? `${options.sqlite}.sync-state.sqlite`,
          syncTargetKey(options.environment, databaseUrl), { full: options.full });
        const hasEnrichment=sqlite.prepare("select 1 from sqlite_master where type='table' and name='enrichment_state'").get();
        const homepageQuery=hasEnrichment ? sqlite.prepare("select data from enrichment_state where publisher_id=? and kind='homepage' and status='measured'") : null;
        // Extract only the compact evidence in SQLite; raw fetch bodies never cross
        // into the Node payload, hashes, or PostgreSQL. Other facts stay unchanged.
        const publisherSelect=fields.map(field=>field==='last_check_evidence'
          ? `json_object('manager_domains',json_extract(p.last_check_evidence,'$.manager_domains'),
              'confirmed_networks',json_extract(p.last_check_evidence,'$.confirmed_networks'),
              'enrichment',json_object('homepage',case when json_type(p.last_check_evidence,'$.enrichment.homepage')='object' then
                json_object('title',json_extract(p.last_check_evidence,'$.enrichment.homepage.title'),
                  'description',json_extract(p.last_check_evidence,'$.enrichment.homepage.description'),
                  'h1',json_extract(p.last_check_evidence,'$.enrichment.homepage.h1'),
                  'language',json_extract(p.last_check_evidence,'$.enrichment.homepage.language')) end)) as last_check_evidence`
          : field==='discovery_sources' ? `(select json_group_array(json_object('source_key',source_key))
              from (select source_key from publisher_sources where publisher_id=p.id order by source_key)) as discovery_sources`
          : `p.${field}`).join(',');
        // Keyset batches keep both the SQLite read and PostgreSQL payload bounded.
        let lastId=0;
        while (true) {
          const source=sqlite.prepare(`select p.id,${publisherSelect} from publishers p where p.id>? and exists(
            select 1 from relationships r where r.publisher_id=p.id and ${reviewedWhere('r.')}) order by p.id limit ?`).all(lastId,options.batchSize);
          if (!source.length) break;
          counts.publishers+=source.length; lastId=source.at(-1).id;
          const changes=state.changed('publisher',source.map(row=>{
            const homepage=homepageQuery?.get(row.id);
            return mapSyncPublisher({...row,homepage:homepage?.data ? JSON.parse(homepage.data) : null});
          }),row=>row.normalized_domain);
          if (!changes.length) continue;
          const payload=JSON.stringify(changes.map(change=>change.row));
          state.invalidate('publisher',changes);
          const planned=await batch(async () => {
          const plan=await client.query(`with i as (${publisherInput}) select count(*) filter(where p.id is null)::int inserted,
            count(*) filter(where p.id is not null and ${pubDiff})::int updated from i left join public.ad_network_publishers p using(normalized_domain)`,[payload]);
          await client.query(`insert into public.ad_network_publishers as p (${pubColumns}) ${publisherInput}
            on conflict(normalized_domain) do update set ${updates.map(f=>`${f}=excluded.${f}`).join(',')}
            where (${updates.map(f=>`p.${f}`).join(',')}) is distinct from (${updates.map(f=>`excluded.${f}`).join(',')})`,[payload]);
          return plan.rows[0];
          });
          counts.publishers_inserted+=planned.inserted;counts.publishers_updated+=planned.updated;
          counts.publishers_sent+=changes.length;state.acknowledge('publisher',changes);
        }
        let lastNetwork=0,lastPublisher=0;
        while (true) {
          const source=sqlite.prepare(`select r.ad_network_id,r.publisher_id,${relationFields.map(field=>field==='evidence'
            ? `(select json_group_object(key,json(r.evidence -> fullkey)) from json_each(r.evidence)
                where key in (${relationshipEvidenceFields.map(key=>`'${key}'`).join(',')})) as evidence`
            : `r.${field}`).join(',')},p.normalized_domain,n.slug as network_slug from relationships r
            join publishers p on p.id=r.publisher_id join ad_networks n on n.id=r.ad_network_id
            where ${reviewedWhere('r.')} and (r.ad_network_id,r.publisher_id)>(?,?)
            order by r.ad_network_id,r.publisher_id limit ?`).all(lastNetwork,lastPublisher,options.batchSize);
          if (!source.length) break;
          counts.relationships+=source.length;
          lastNetwork=source.at(-1).ad_network_id;lastPublisher=source.at(-1).publisher_id;
          const changes=state.changed('relationship',source.map(mapSyncRelationship),row=>`${row.network_slug}:${row.domain}`);
          if (!changes.length) continue;
          const payload=JSON.stringify(changes.map(change=>change.row));
          state.invalidate('relationship',changes);
          const planned=await batch(async () => {
          // Lock every matched parent through the upsert so a concurrent delete
          // cannot make the second inner join silently omit a validated row.
          const plan=await client.query(`with i as (${relationshipInput} for key share of p,n) select count(*)::int matched,
            count(*) filter(where r.publisher_id is null)::int inserted,
            count(*) filter(where r.publisher_id is not null and ${relDiff})::int updated from i
            left join public.ad_network_publisher_relationships r using(ad_network_id,publisher_id)`,[payload]);
          if (plan.rows[0].matched!==changes.length) throw new Error('Relationship sync is missing target parents; run sync --full to repair before retrying');
          await client.query(`insert into public.ad_network_publisher_relationships as r(ad_network_id,publisher_id,${relColumns})
            ${relationshipInput} on conflict(ad_network_id,publisher_id) do update set ${relationFields.map(f=>`${f}=excluded.${f}`).join(',')}
            where (${relationFields.map(f=>`r.${f}`).join(',')}) is distinct from (${relationFields.map(f=>`excluded.${f}`).join(',')})`,[payload]);
          return plan.rows[0];
          });
          counts.relationships_inserted+=planned.inserted;counts.relationships_updated+=planned.updated;
          counts.relationships_sent+=changes.length;state.acknowledge('relationship',changes);
        }
        const movements=await batch(()=>captureNetworkObservations(client,{baseline:initialBaseline,batchSize:options.batchSize}));
        const snapshot=await batch(() => snapshotCounts(client));
        counts.snapshots_changed=snapshot.rowCount;
        return {applied:true,environment:options.environment,...counts,observations_changed:movements.observations,arrivals_recorded:movements.arrivals};
      } finally {
        if (locked) await client.query("select pg_advisory_unlock(hashtext('ad-networks-reviewed-sync'))").catch(()=>{});
      }
    };
    if (options.apply) return await withJobLock(options, work, { pool });
    client=await pool.connect();
    try { return await work(null,client); } finally { client.release();await pool.end(); }
  } finally { state?.close();sqlite.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncReviewedData(syncArgs(process.argv.slice(2))).then(result=>{console.log(JSON.stringify(result,null,2));if(result.skipped)process.exitCode=75;})
    .catch(error=>{console.error(error.message);process.exitCode=1;});
}
