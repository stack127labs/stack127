import { brandKit } from '../brand.ts';
import { AHREFS_ATTRIBUTION } from "../../ahrefs.ts";
import { createHash } from 'node:crypto';
import { domainToASCII } from 'node:url';
import { adNetworkFacts } from '../../../app/(site)/(directories)/ad-networks/network-facts.ts';
import { adNetworkNiches } from '../../ad-network-niches.ts';
import { ApiError, MAX_ANSWER_BYTES, rowLimit, sqlEnabled } from '../config.ts';
import { readTransaction, sqlReadTransaction } from '../database.ts';
import type { Reader } from '../database.ts';
import { definitions, caveats, sourceUrl } from './definitions.ts';
import { toolSchemas, toolNames } from './schemas.ts';
import type { Filters, ToolName } from './schemas.ts';
import { validateReadonlySql } from './sql.ts';
const listed = "r.status in ('confirmed','stale')";
export const ageYears = 'extract(year from age(current_date,p.domain_created_on))';
const ageBucket = `case when p.domain_created_on is null then null when ${ageYears}<3 then '0–2 years' when ${ageYears}<6 then '3–5 years' when ${ageYears}<11 then '6–10 years' when ${ageYears}<16 then '11–15 years' else '16+ years' end`;
export const domainRatingBucket = `case when p.domain_rating is null then 'unknown' when p.domain_rating<10 then '0–9' when p.domain_rating<20 then '10–19' when p.domain_rating<30 then '20–29' when p.domain_rating<50 then '30–49' when p.domain_rating<70 then '50–69' else '70–100' end`;
const dimensionSql = { network:'n.slug',niche:'p.niche',registration_year:'extract(year from p.domain_created_on)::int',age_bucket:ageBucket,size_group:'p.traffic_group',platform:'p.platform',domain_rating:domainRatingBucket };
export function filterSql(f: Partial<Filters>) {
  const values: unknown[] = [];
  const add = (v: unknown) => { values.push(v); return `$${values.length}`; };
  const conditions = [listed];
  if (f.networks) conditions.push(`n.slug=any(${add(f.networks)}::text[])`);
  if (f.relationship === 'managed') conditions.push("r.relationship_type='primary_or_exclusive_manager'");
  if (f.status) conditions.push(`r.status=${add(f.status)}`);
  if (f.niche) conditions.push(`p.niche=${add(f.niche)}`);
  if (f.platform) conditions.push(`p.platform=${add(f.platform)}`);
  if (f.size_group) conditions.push(`p.traffic_group=${add(f.size_group)}`);
  if (f.registered_after) conditions.push(`p.domain_created_on>${add(f.registered_after)}::date`);
  if (f.registered_before) conditions.push(`p.domain_created_on<${add(f.registered_before)}::date`);
  if (f.min_age !== undefined) conditions.push(`${ageYears}>=${add(f.min_age)}`);
  if (f.max_age !== undefined) conditions.push(`${ageYears}<=${add(f.max_age)}`);
  if (f.min_domain_rating !== undefined) conditions.push(`p.domain_rating>=${add(f.min_domain_rating)}`);
  if (f.max_domain_rating !== undefined) conditions.push(`p.domain_rating<=${add(f.max_domain_rating)}`);
  return { text: conditions.join(' and '), values };
}
const joins = 'from ad_network_publishers p join ad_network_publisher_relationships r on r.publisher_id=p.id join ad_networks n on n.id=r.ad_network_id';
export function normalizeDomain(input: string) {
  const domain = domainToASCII(input.trim().toLowerCase().replace(/\.$/,''));
  if (domain.length > 253 || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(domain)) {
    throw new ApiError(400,'invalid_domain','Use a bare domain such as example.com.');
  }
  return domain;
}
export function validateInput(name: ToolName, input: unknown): Record<string, any> {
  const parsed = toolSchemas[name].safeParse(input);
  if (!parsed.success) throw new ApiError(400,'invalid_input','Invalid input. Check the tool schema, types, and allowed values.');
  const f = parsed.data as Record<string, any>;
  if ((f.registered_after && f.registered_before && f.registered_after>=f.registered_before)
    || (f.min_age !== undefined && f.max_age !== undefined && f.min_age>f.max_age)
    || (f.min_domain_rating !== undefined && f.max_domain_rating !== undefined && f.min_domain_rating>f.max_domain_rating)
    || (f.networks && new Set(f.networks).size!==f.networks.length)
    || (f.group_by && new Set(f.group_by).size!==f.group_by.length)
    || (f.from && (f.from>f.to || Date.parse(f.to)-Date.parse(f.from)>366*86400000))) throw new ApiError(400,'invalid_input','Invalid range or duplicate dimension/network.');
  if (name==='lookup_site') f.domain=normalizeDomain(f.domain);
  if (name==='run_readonly_sql') validateReadonlySql(f.sql);
  return f;
}
async function grouped(db: Reader, f: Partial<Filters>, dimensions: (keyof typeof dimensionSql)[], cap: number) {
  const w=filterSql(f);
  const counts=(await db.query(`select count(distinct p.id)::int as total,
    count(distinct p.id) filter(where p.domain_rating is not null)::int as domain_rating_base ${joins} where ${w.text}`,w.values))[0];
  const base=counts.total as number;
  const domain_rating_coverage={sites_with_rating:counts.domain_rating_base,total_sites:base,scope:'distinct sites matching all filters'};
  if (!dimensions.length) return { total:base,domain_rating_coverage,base:'distinct sites matching all filters; networks are OR',rows:[],truncated:false };
  const selections=dimensions.map((d,i)=>`${dimensionSql[d]} as group_${i+1}`);
  const rows=await db.query(`select ${selections.join(',')},count(distinct p.id)::int as count ${joins}
    where ${w.text} group by ${dimensions.map((_,i)=>i+1).join(',')}
    order by count desc,${dimensions.map((_,i)=>`${i+1} nulls last`).join(',')} limit ${cap+1}`,w.values);
  const truncated=rows.length>cap;
  const networkBases=dimensions.includes('network') ? await db.query(`select n.slug,count(distinct p.id)::int as total,count(distinct p.id) filter(where p.domain_rating is not null)::int as domain_rating_base ${joins} where ${w.text} group by n.slug`,w.values) : [];
  return { total:base,domain_rating_coverage,base:'distinct filtered sites; network shares use their own filtered base; null groups include unknowns',dimensions,
    network_bases:dimensions.includes('network')?Object.fromEntries((f.networks??networkBases.map(n=>n.slug)).map(slug=>[slug,networkBases.find(n=>n.slug===slug)?.total??0])):undefined,
    network_domain_rating_coverage:dimensions.includes('network')?Object.fromEntries((f.networks??networkBases.map(n=>n.slug)).map(slug=>[slug,{sites_with_rating:networkBases.find(n=>n.slug===slug)?.domain_rating_base??0,total_sites:networkBases.find(n=>n.slug===slug)?.total??0}])):undefined,
    rows:rows.slice(0,cap).map(row=>{
      const networkIndex=dimensions.indexOf('network');
      const denominator=networkIndex<0 ? base : networkBases.find(n=>n.slug===row[`group_${networkIndex+1}`])?.total ?? 0;
      return {...Object.fromEntries(dimensions.map((d,i)=>[d,row[`group_${i+1}`]])),count:row.count,base:denominator,share_percent:denominator ? row.count/denominator*100 : 0};
    }),truncated };
}
type NetworkRow = {slug:string;name:string;official_url:string|null;summary:string|null;listed:number;managed:number;confirmed:number;stale:number;median_domain_age_years:number|null;domain_age_base:number;median_domain_rating:number|null;average_domain_rating:number|null;domain_rating_base:number};
async function networks(db: Reader) {
  return (await db.query<NetworkRow>(`select n.slug,n.name,n.official_url,n.summary,
    count(r.publisher_id) filter(where ${listed})::int as listed,
    count(r.publisher_id) filter(where ${listed} and r.relationship_type='primary_or_exclusive_manager')::int as managed,
    count(r.publisher_id) filter(where r.status='confirmed')::int as confirmed,
    count(r.publisher_id) filter(where r.status='stale')::int as stale,
    percentile_cont(0.5) within group(order by extract(epoch from age(current_date,p.domain_created_on))/31557600)
      filter(where ${listed} and p.domain_created_on is not null)::float8 as median_domain_age_years,
    count(r.publisher_id) filter(where ${listed} and p.domain_created_on is not null)::int as domain_age_base,
    percentile_cont(0.5) within group(order by p.domain_rating) filter(where ${listed})::float8 as median_domain_rating,
    avg(p.domain_rating) filter(where ${listed})::float8 as average_domain_rating,
    count(r.publisher_id) filter(where ${listed} and p.domain_rating is not null)::int as domain_rating_base
    from ad_networks n left join ad_network_publisher_relationships r on r.ad_network_id=n.id
    left join ad_network_publishers p on p.id=r.publisher_id group by n.id,n.slug,n.name,n.official_url,n.summary order by n.slug limit 201`)).map(n=>({
      ...n,facts:adNetworkFacts[n.slug]??null,url:`${sourceUrl}/${n.slug}`,
    }));
}
const siteFields = 'p.normalized_domain as domain,p.niche,p.platform,p.domain_created_on::text,p.traffic_group as size_group,p.last_successful_check_at,p.domain_rating,p.domain_rating_checked_on::text';
const membership = `coalesce((select jsonb_agg(jsonb_build_object('network',n.slug,'status',r.status,'relationship_type',r.relationship_type,
  'first_confirmed_at',r.first_confirmed_at,'last_confirmed_at',r.last_confirmed_at,'ended_at',r.ended_at) order by n.slug)
  from ad_network_publisher_relationships r join ad_networks n on n.id=r.ad_network_id
  where r.publisher_id=p.id and r.status in ('confirmed','stale')),'[]'::jsonb) as networks`;
const querySignature = (f: Record<string, any>) => createHash('sha256').update(JSON.stringify({...f,cursor:undefined,limit:undefined})).digest('hex');
export function decodeCursor(cursor: string, signature: string) {
  try {
    const c=JSON.parse(Buffer.from(cursor,'base64url').toString());
    if (c.signature!==signature || typeof c.domain!=='string' || c.domain.length>253 || !(c.date===null || /^\d{4}-\d{2}-\d{2}$/.test(c.date))) throw Error();
    return c as {domain:string;date:string|null};
  } catch { throw new ApiError(400,'invalid_cursor','Use next_cursor with the same filters and sort.'); }
}
async function find(db: Reader,f: Record<string, any>,cap: number) {
  const w=filterSql(f), limit=Math.min(cap,f.limit), signature=querySignature(f);
  const values=[...w.values];
  const bind=(v: unknown) => {values.push(v);return `$${values.length}`;};
  let after='';
  if (f.cursor) {
    const c=decodeCursor(f.cursor,signature),domain=bind(c.domain);
    if (f.sort==='domain') after=`and p.normalized_domain>${domain}`;
    else if (c.date===null) after=`and p.domain_created_on is null and p.normalized_domain>${domain}`;
    else {
      const date=bind(c.date),op=f.sort==='newest'?'<':'>';
      after=`and (p.domain_created_on${op}${date}::date or p.domain_created_on is null or (p.domain_created_on=${date}::date and p.normalized_domain>${domain}))`;
    }
  }
  const order=f.sort==='domain'?'p.normalized_domain':`p.domain_created_on ${f.sort==='newest'?'desc':'asc'} nulls last,p.normalized_domain`;
  const rows=await db.query(`select ${siteFields},${membership} from ad_network_publishers p
    where exists(select 1 from ad_network_publisher_relationships r join ad_networks n on n.id=r.ad_network_id where r.publisher_id=p.id and ${w.text})
    ${after} order by ${order} limit ${limit+1}`,values);
  const hasMore=rows.length>limit, sites=rows.slice(0,limit),last=sites.at(-1);
  return {sites,limit,next_cursor:hasMore&&last ? Buffer.from(JSON.stringify({signature,domain:last.domain,date:last.domain_created_on})).toString('base64url'):null,
    base:'distinct sites matching filters; networks on each row show all listed memberships, not only matched networks'};
}
export function boundResults(data: Record<string, any>,cap: number) {
  const sets: {parent:Record<string,any>;key:string;path:string}[]=[];
  for(const key of ['networks','rows','sites','relationships','events','movements','co_listed','daily_counts']) {
    if(Array.isArray(data[key]))sets.push({parent:data,key,path:key});
  }
  if(data.distributions)for(const [key,value] of Object.entries(data.distributions)) {
    const parent=value as Record<string,any>;
    if(Array.isArray(parent.rows))sets.push({parent,key:'rows',path:`distributions.${key}.rows`});
  }
  const counts=sets.map(()=>0);let left=cap;
  while(left>0){let added=false;sets.forEach((set,i)=>{if(left>0&&counts[i]<set.parent[set.key].length){counts[i]++;left--;added=true;}});if(!added)break;}
  const truncatedSets:string[]=[];
  sets.forEach((set,i)=>{if(set.parent[set.key].length>counts[i]){set.parent[set.key]=set.parent[set.key].slice(0,counts[i]);set.parent.truncated=true;truncatedSets.push(set.path);}});
  return {row_count:cap-left,truncated_sets:truncatedSets};
}
export type DataAnswer = { as_of: unknown; queried_at: string; definitions: Record<string, string>; caveats: string[]; filters: Record<string, any>; url: string; data: Record<string, any>; limits: { max_rows: number; row_count:number; truncated: boolean; truncated_sets:string[] } };
export async function queryTool(db: Reader,name: ToolName,f: Record<string, any>,cap: number): Promise<Record<string, any>> {
  switch(name) {
    case 'get_brand_kit': return brandKit;
    case 'ad_networks_overview': {
      const stats=(await db.query('select * from dataset_summary'))[0];
      const totals=(await db.query(`select count(distinct publisher_id)::int as listed,count(distinct publisher_id) filter(where relationship_type='primary_or_exclusive_manager')::int as managed from ad_network_publisher_relationships r where ${listed}`))[0];
      return { ...stats,...totals,measurement:'We check the publisher’s ads.txt for seller signals and MANAGERDOMAIN. AdSense and page-signature networks also require homepage signals. Discovery lists alone do not confirm a relationship.',
        available_values:{niche:adNetworkNiches.map(n=>({slug:n.slug,name:n.name})),domain_rating:['0–9','10–19','20–29','30–49','50–69','70–100','unknown'],size_group:['top-10k','top-100k','top-1m','not-ranked'],
          platform:(await db.query(`select distinct platform from ad_network_publishers where platform is not null order by platform limit 200`)).map(r=>r.platform),
          networks:(await db.query(`select slug,name from ad_networks order by slug limit 200`))},
        tools:{ad_networks_overview:'Start here for definitions, coverage and values.',list_ad_networks:'Joining and payment facts and network totals.',get_ad_network:'Full network profile and distributions.',compare_ad_networks:'One dimension side by side.',count_sites:'Distinct counts with filters and up to two groups.',find_sites:'Bounded site list with cursor.',lookup_site:'One domain with current and past memberships.',network_movements:'Observed events with a strong quality warning.',...(sqlEnabled()?{run_readonly_sql:'Private SQL for documented safe views only.'}:{})}};
    }
    case 'list_ad_networks': {
      let rows=await networks(db);
      rows=rows.filter(n=> (f.max_minimum_traffic===undefined || (n.facts?.minTraffic!=null && n.facts.minTraffic.amount<=f.max_minimum_traffic))
        && (f.traffic_unit===undefined || n.facts?.minTraffic?.unit===f.traffic_unit)
        && (f.has_public_rule===undefined || (n.facts?.minTraffic!=null)===f.has_public_rule));
      rows.sort((a,b)=>f.sort==='name'?a.name.localeCompare(b.name):f.sort==='minimum_traffic'?(a.facts?.minTraffic?.amount??Infinity)-(b.facts?.minTraffic?.amount??Infinity)||a.slug.localeCompare(b.slug):(f.sort==='managed'?b.managed-a.managed:b.listed-a.listed)||a.slug.localeCompare(b.slug));
      return {networks:rows.slice(0,cap),truncated:rows.length>cap,has_public_rule:'Published numeric monthly minimum; unknown is not zero. Full joining facts may describe alternatives.'};
    }
    case 'get_ad_network': {
      const n=(await networks(db)).find(n=>n.slug===f.network);if(!n)throw new ApiError(404,'not_found','Unknown network slug.');
      const distributions:Record<string,unknown>={};
      for(const dim of ['age_bucket','registration_year','niche','size_group','platform','domain_rating'] as const) distributions[dim]=await grouped(db,{networks:[f.network]},[dim],cap);
      const co=await db.query(`select n.slug,count(distinct r.publisher_id)::int as count from ad_network_publisher_relationships r
        join ad_networks n on n.id=r.ad_network_id where ${listed} and n.slug<>$1 and r.publisher_id in
        (select r.publisher_id from ad_network_publisher_relationships r join ad_networks n on n.id=r.ad_network_id where n.slug=$1 and ${listed})
        group by n.slug order by count desc,n.slug limit ${cap+1}`,[f.network]);
      const daily=await db.query(`select snapshot_on::text,listed_count,confirmed_count,stale_count,captured_at from ad_network_daily_counts d
        join ad_networks n on n.id=d.ad_network_id where n.slug=$1 order by snapshot_on desc limit ${cap+1}`,[f.network]);
      return {network:n,distributions,co_listed:co.slice(0,cap),daily_counts:daily.slice(0,cap),truncated:co.length>cap||daily.length>cap,history_order:'newest first; gaps are missing observations, never zero; snapshots are listed counts, not managed counts'};
    }
    case 'count_sites': return grouped(db,f,f.group_by,cap);
    case 'compare_ad_networks': return grouped(db,f,['network',f.dimension],cap);
    case 'find_sites': return find(db,f,cap);
    case 'lookup_site': {
      const rows=await db.query(`select p.id,${siteFields},${ageYears}::int as domain_age_years,p.ads_txt_summary from ad_network_publishers p where p.normalized_domain=$1 limit 1`,[f.domain]);
      if(!rows.length)throw new ApiError(404,'not_found','Domain not found in observed relationships.');
      const {id,...site}=rows[0];
      const relationships=await db.query(`select n.slug as network,r.status,r.relationship_type,r.first_confirmed_at,r.last_confirmed_at,r.ended_at
        from ad_network_publisher_relationships r join ad_networks n on n.id=r.ad_network_id where r.publisher_id=$1 order by n.slug limit ${cap+1}`,[id]);
      const events=await db.query(`select n.slug as network,e.event,e.observed_at,e.relationship_type from ad_network_relationship_events e
        join ad_networks n on n.id=e.ad_network_id where e.publisher_id=$1 order by e.observed_at desc,n.slug,e.event limit ${cap+1}`,[id]);
      return {site,relationships:relationships.slice(0,cap),events:events.slice(0,cap),truncated:relationships.length>cap||events.length>cap,history_order:'newest first'};
    }
    case 'network_movements': {
      const rows=await db.query(`select n.slug as network,(e.observed_at at time zone 'UTC')::date::text as date,
        count(*) filter(where e.event='joined')::int as joined,count(*) filter(where e.event='left')::int as left,
        count(distinct e.publisher_id) filter(where e.event='newly_found')::int as newly_found
        from ad_network_relationship_events e join ad_networks n on n.id=e.ad_network_id
        where e.observed_at>=($1::date::timestamp at time zone 'UTC') and e.observed_at<(($2::date+1)::timestamp at time zone 'UTC')
        and ($3::text[] is null or n.slug=any($3)) group by 1,2 order by 2 desc,1 limit ${cap+1}`,[f.from,f.to,f.networks??null]);
      return {movements:rows.slice(0,cap),truncated:rows.length>cap,known_fault_window:{search_from:'2026-09-28',repair_days:['2026-11-13','2026-11-14'],reliable_churn_series:false},base:'observed events per network and UTC date; missing dates do not imply zero'};
    }
    case 'run_readonly_sql': {
      if(!sqlEnabled())throw new ApiError(404,'disabled','SQL tool disabled.');
      const rows=await db.query(`select * from (${validateReadonlySql(f.sql)}) as bounded_data_query limit ${cap+1}`);
      return {rows:rows.slice(0,cap),truncated:rows.length>cap,base:'defined by the SELECT; inspect aggregates for distinct-site counting'};
    }
  }
}
export async function executeTool(name: ToolName,input: unknown,transaction?: typeof readTransaction): Promise<DataAnswer> {
  if (!toolNames.includes(name)) throw new ApiError(404,'not_found','Unknown tool.');
  if (name==='run_readonly_sql' && !sqlEnabled()) throw new ApiError(404,'not_found','Not found.');
  const f=validateInput(name,input),cap=rowLimit();
  if(name==='get_brand_kit') return {
    as_of:null,queried_at:new Date().toISOString(),
    definitions:{as_of:'Brand assets have no dataset freshness date. Use as_of from the data answer in the source line.'},
    caveats:['Use the data tool answer for its citation URL, as_of date, definitions and caveats.'],
    filters:f,url:sourceUrl,data:brandKit,
    limits:{max_rows:cap,row_count:0,truncated:false,truncated_sets:[]},
  };
  return (transaction ?? (name==='run_readonly_sql' ? sqlReadTransaction : readTransaction))(async db=>{
    const freshness=(await db.query('select * from dataset_summary'))[0];
    const data=await queryTool(db,name,f,cap);
    const budget=boundResults(data,cap);
    const result={as_of:freshness.as_of,queried_at:new Date().toISOString(),definitions,caveats,filters:f,
      url:name==='get_ad_network'?`${sourceUrl}/${f.network}`:name==='lookup_site'?`https://stack127.com/ad-network-checker?domain=${encodeURIComponent(f.domain)}`:name==='network_movements'?'https://stack127.com/ad-networks/stats':sourceUrl,
      data:{...data,domain_rating_metadata:{attribution:AHREFS_ATTRIBUTION.text,url:AHREFS_ATTRIBUTION.url,
        credit:`[${AHREFS_ATTRIBUTION.text}](${AHREFS_ATTRIBUTION.url})`,caveat:definitions.domain_rating,
        coverage:{sites_with_rating:freshness.domain_rating_base,total_sites:freshness.domain_rating_total,scope:'all distinct listed sites in the dataset; not the returned page or filtered cohort'}}},limits:{max_rows:cap,...budget,truncated:JSON.stringify(data).includes('"truncated":true')}};
    if(Buffer.byteLength(JSON.stringify(result))>MAX_ANSWER_BYTES)throw new ApiError(413,'answer_too_large','Answer exceeds 1 MB. Narrow the query or lower the row limit.');
    return result;
  });
}
