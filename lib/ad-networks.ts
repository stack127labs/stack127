import { getPublicSuffix } from "tldts";
import { adNetworkNiches, getAdNetworkNiche } from "./ad-network-niches";
import type { AdNetworkNicheSlug } from "./ad-network-niches";
import type {
  AdNetworkListRow, AdNetworkRef, AdNetworkSiteRow, AdNetworkSitesQuery, AdNetworkSitesResponse,
  AdNetworkStatsReport, AdNetworkPageData, AdNetworkNichesPageData, AdNetworkNichePageData,
  AdNetworkStatsPageData, AdNetworkShare, AdNetworkCount, AdNetworkDailyCount,
  AdNetworkMovement, AdNetworkSwitch, AdNetworkTrafficShare, AdNetworkCheckerSiteView,
  AdNetworkSiteRelationship, AdNetworkAdsTxtSummary, AdNetworkSitesAvailability, AdNetworkDirectoryData, AdNetworkJoiningRule, AdNetworkDomainAgeStrip,
} from "./ad-networks-types";
import { deriveManagedBy, buildAdsTxtPreview, aggregateAdNetworkManagers, aggregateAdNetworkTrafficShares } from "./ad-network-site-facts.mjs";

import { AD_NETWORK_SITES_PAGE_SIZE, adNetworkSiteAvailability, adNetworkNicheShares, hasAdNetworkNicheCoverage, adNetworkMonthEnds, adNetworkYearChange,
  adNetworkMovementTotals, adNetworkManagerBreakdown, trafficOrder, domainAgeOrder,
  adNetworkSwitchFlow, adNetworkMovementPeriods, adNetworkPlatformMix,
  adNetworkCheckerEvents, adNetworkObservedDomainAge, adNetworkUtcWindow } from "./ad-networks-report";
import type { AdNetworkSiteCoverage } from "./ad-networks-report";
import { adNetworkFacts } from "../app/(site)/(directories)/ad-networks/network-facts";

import { getPool } from "./db";
import type { QueryResult, QueryResultRow } from "pg";
import { unstable_cache } from "next/cache";
import { AD_NETWORKS_TAG } from "./cache-tags";

let reportQueries = 0;
const waitingReports: (() => void)[] = [];
// The managed development database stalls when cold reports compete for its CPU.
// Production keeps three readers, leaving one pool connection for page registry queries.
const reportQueryLimit = process.env.NODE_ENV === "development" ? 1 : 3;
export async function queryAdNetworkReport<Row extends QueryResultRow>(sql: string, values?: unknown[]): Promise<QueryResult<Row>> {
  await new Promise<void>(resolve => {
    if (reportQueries < reportQueryLimit) { reportQueries++; resolve(); }
    else waitingReports.push(resolve);
  });
  try {
    // Cold scans on the managed dev instance can exceed the shared pool's 15s
    // budget even when reading cached database pages. Keep production unchanged.
    const developmentQuery = { text: sql, values, query_timeout: 60000 };
    return await (process.env.NODE_ENV === "development"
      ? getPool().query<Row>(developmentQuery)
      : getPool().query<Row>(sql, values));
  }
  finally {
    const next = waitingReports.shift();
    if (next) next();
    else reportQueries--;
  }
}

export type AdNetwork = {
  id: string;
  slug: string;
  name: string;
  official_url: string | null;
  summary: string | null;
  verified_count: number;
};

export type VerifiedPublisher = {
  normalized_domain: string;
  display_domain: string;
  relationship_type: "primary_or_exclusive_manager" | "active_network_use";
  last_confirmed_at: Date;
};

export const publisherPageSize = 50;

export function directoryQuery(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] ?? "" : value ?? "").trim().slice(0, 100);
}

export function directoryPage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^[1-9]\d{0,5}$/.test(raw)) return 1;
  return Number(raw);
}

export function directoryPageHref(route: string, query: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `${route}?${suffix}` : route;
}

async function loadAdNetworks(): Promise<AdNetworkListRow[]> {
  const result = await queryAdNetworkReport<AdNetworkListRow & { verified_count: string }>(`
    select n.id, n.slug, n.name, n.official_url, n.summary,
      count(r.publisher_id) filter (where r.status = 'confirmed')::int as verified_count,
      count(r.publisher_id) filter (where r.status in ('confirmed','stale'))::int as listed_count,
      count(r.publisher_id) filter (where r.status = 'stale')::int as stale_count,
      count(r.publisher_id) filter (where r.status = 'ended')::int as ended_count
    from public.ad_networks n
    left join public.ad_network_publisher_relationships r on r.ad_network_id = n.id
    group by n.id
    order by n.name, n.id
  `);
  return result.rows.map((row) => ({ ...row, verified_count: Number(row.verified_count) }));
}

const cachedAdNetworks = unstable_cache(loadAdNetworks, ["stack127-ad-networks"], {
  revalidate: false, tags: [AD_NETWORKS_TAG],
});

export async function listAdNetworks(query = ""): Promise<AdNetworkListRow[]> {
  const needle = query.toLowerCase();
  return (await cachedAdNetworks()).filter(network =>
    network.name.toLowerCase().includes(needle) || network.slug.toLowerCase().includes(needle));
}

export async function getAdNetwork(slug: string): Promise<AdNetworkListRow | null> {
  return (await cachedAdNetworks()).find(network => network.slug === slug) ?? null;
}

const publisherBatchSize = 750;

async function loadVerifiedPublishersBatch(networkId: string, offset: number): Promise<VerifiedPublisher[]> {
  const result = await queryAdNetworkReport<VerifiedPublisher>(`
    select p.normalized_domain, p.display_domain,
      r.relationship_type, r.last_confirmed_at
    from public.ad_network_publisher_relationships r
    join public.ad_network_publishers p on p.id = r.publisher_id
    where r.ad_network_id = $1 and r.status = 'confirmed'
    order by p.normalized_domain, p.id
    limit $2 offset $3
  `, [networkId, publisherBatchSize, offset]);
  return result.rows;
}

const cachedVerifiedPublishersBatch = unstable_cache(loadVerifiedPublishersBatch, ["stack127-ad-network-publishers-batch"], {
  revalidate: false, tags: [AD_NETWORKS_TAG],
});

const cachedVerifiedPublisherCount = unstable_cache(async (networkId: string) => {
  const result = await queryAdNetworkReport<{ total: string }>(`
    select count(*)::text as total
    from public.ad_network_publisher_relationships r
    join public.ad_network_publishers p on p.id = r.publisher_id
    where r.ad_network_id = $1 and r.status = 'confirmed'
  `, [networkId]);
  return Number(result.rows[0]?.total ?? 0);
}, ["stack127-ad-network-publisher-count"], {
  revalidate: false, tags: [AD_NETWORKS_TAG],
});

export async function listAllVerifiedPublishers(networkId: string): Promise<VerifiedPublisher[]> {
  const count = await cachedVerifiedPublisherCount(networkId);
  const batches = await Promise.all(Array.from({ length: Math.ceil(count / publisherBatchSize) }, (_, batch) =>
    cachedVerifiedPublishersBatch(networkId, batch * publisherBatchSize)));
  return batches.flat();
}

export async function listVerifiedPublishers(networkId: string, query: string, page: number) {
  const needle = query.toLowerCase();
  const publishers = (await listAllVerifiedPublishers(networkId)).filter(publisher =>
    publisher.normalized_domain.toLowerCase().includes(needle));
  const total = publishers.length;
  const totalPages = Math.max(1, Math.ceil(total / publisherPageSize));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const rows = publishers.slice((currentPage - 1) * publisherPageSize, currentPage * publisherPageSize);
  return { currentPage, rows, total, totalPages };
}

/** Every cached response is an aggregate or a bounded page. Never cache an entire site catalog. */
function cached<T extends unknown[], R>(key: string, loader: (...args: T) => Promise<R>) {
  // Concurrent pages can miss the same Next cache entry during a cold refresh.
  // Share the pending read, then let Next own the stored result and invalidation.
  const pending = new Map<string, Promise<R>>();
  return unstable_cache(async (...args: T) => {
    const argumentKey = JSON.stringify(args);
    let read = pending.get(argumentKey);
    if (!read) {
      read = (async () => {
        const result = await loader(...args);
        if (Buffer.byteLength(JSON.stringify(result)) >= 1_900_000) throw new Error(`${key} exceeds cache entry budget`);
        return result;
      })();
      pending.set(argumentKey, read);
    }
    try { return await read; }
    finally { if (pending.get(argumentKey) === read) pending.delete(argumentKey); }
  }, [key, "v14"], { revalidate: false, tags: [AD_NETWORKS_TAG] });
}
const iso = (value: Date | string | null): string | null => value === null ? null : new Date(value).toISOString();
const ref = (network: AdNetworkRef): AdNetworkRef => ({ slug: network.slug, name: network.name });
const share = (count: number, total: number) => total ? count / total * 100 : 0;

async function queryNetworkIdentities() {
  return (await queryAdNetworkReport<{ slug: string; name: string; manager_domains: string[]; ad_system_domains: string[] }>(
    "select slug,name,manager_domains,ad_system_domains from public.ad_networks order by slug")).rows;
}
const loadNetworkIdentities = cached("ad-network-manager-identities",queryNetworkIdentities);

type SiteRecord = Omit<AdNetworkSiteRow, "managed_by" | "manager_domain" | "last_checked_at"> & {
  last_checked_at: Date | string | null; evidence: unknown;
  manager_relationships: {slug:string;status:string;relationship_type:string;evidence:unknown}[];
};
const managerEvidenceProjection = `jsonb_build_object('manager_domains',p.last_check_evidence->'manager_domains') as evidence,
  coalesce((select jsonb_agg(jsonb_build_object('slug',n.slug,'status',r.status,
      'relationship_type',r.relationship_type,'evidence',jsonb_build_object(
        'manager_domain',r.evidence->'manager_domain','matched_signal',r.evidence->'matched_signal')) order by n.slug)
    from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
    where r.publisher_id=p.id and r.status='confirmed' and r.relationship_type='primary_or_exclusive_manager'),
    '[]'::jsonb) as manager_relationships`;
const siteProjection = `p.normalized_domain as domain, p.publisher_name, p.niche, p.traffic_group,
  p.domain_created_on::text, p.platform, p.last_checked_at, p.favicon,${managerEvidenceProjection},
  coalesce((select jsonb_agg(jsonb_build_object('slug',n.slug,'name',n.name) order by n.name)
    from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
    where r.publisher_id=p.id and r.status in ('confirmed','stale')),'[]'::jsonb) as networks`;

// Reports need the same evidence as individual rows, but must aggregate the
// relationship table once instead of running JSON subqueries per publisher.
const reportMemberships = `with relationship_facts as (
  select r.publisher_id,n.slug,r.status,r.relationship_type,
    case when r.status='confirmed' and r.relationship_type='primary_or_exclusive_manager'
      then jsonb_build_object('manager_domain',r.report_retained_manager) end as manager_evidence
  from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
  where r.status in ('confirmed','stale')
) select r.publisher_id,array_agg(r.slug order by r.slug) as network_slugs,
  coalesce(jsonb_agg(jsonb_build_object('slug',r.slug,'status',r.status,'relationship_type',r.relationship_type,
    'evidence',r.manager_evidence) order by r.slug)
    filter(where r.status='confirmed' and r.relationship_type='primary_or_exclusive_manager'),'[]'::jsonb) as manager_relationships
  from relationship_facts r group by r.publisher_id`;
const reportManagerEvidence = `jsonb_build_object('manager_domains',p.last_check_evidence->'manager_domains') as evidence,m.manager_relationships`;

export async function loadAdNetworkManagerStatistics() {
  const [groups,identities]=await Promise.all([
    queryAdNetworkReport<{evidence:unknown;manager_relationships:SiteRecord["manager_relationships"];network_slugs:string[];has_summary:boolean;count:number}>(`
      with memberships as (${reportMemberships}), publishers as (
        select p.id,jsonb_build_object('manager_domains',p.report_manager_domains) as last_check_evidence,
          p.report_has_ads_txt_summary as has_summary from public.ad_network_publishers p
      ), records as (
        select ${reportManagerEvidence},p.has_summary,m.network_slugs
        from memberships m join publishers p on p.id=m.publisher_id)
      select evidence,manager_relationships,has_summary,network_slugs,count(*)::int as count from records group by 1,2,3,4`),
    queryNetworkIdentities(),
  ]);
  return aggregateAdNetworkManagers(groups.rows,identities);
}
const getAdNetworkManagerStatistics=cached("ad-network-manager-statistics",loadAdNetworkManagerStatistics);
function toSite(row: SiteRecord, identities: Awaited<ReturnType<typeof loadNetworkIdentities>>): AdNetworkSiteRow {
  const { evidence, manager_relationships, ...site } = row;
  return { ...site, last_checked_at: iso(row.last_checked_at), ...deriveManagedBy(evidence, identities, manager_relationships) };
}
const siteWhere = `exists(select 1 from public.ad_network_publisher_relationships r
  join public.ad_networks n on n.id=r.ad_network_id where r.publisher_id=p.id
  and r.status in ('confirmed','stale') and ($1::text is null or n.slug=$1))
  and ($2::text is null or p.niche=$2)
  and ($3::text='' or position($3 in p.normalized_domain)>0 or position($3 in lower(coalesce(p.publisher_name,'')))>0)`;
/** Scope controls to the table's network/niche, independent of search and page. */
export async function loadAdNetworkSitesAvailability(network: string | null, niche: string | null): Promise<AdNetworkSitesAvailability> {
  const [coverage, networks, managerGroups, identities] = await Promise.all([
    queryAdNetworkReport<Omit<AdNetworkSiteCoverage,"networks">>(`${scopedCoverageSites}
      select count(*)::int as listed,count(p.niche)::int as classified,count(p.traffic_group)::int as traffic,
        count(p.domain_created_on)::int as age,count(p.platform)::int as platform,count(p.publisher_name)::int as publisher,
        count(p.last_checked_at)::int as checked,
        0::int as manager,
        coalesce(array_agg(distinct p.niche) filter(where p.niche is not null),'{}') as niches from sites p`,[network,niche]),
    queryAdNetworkReport<AdNetworkRef>(`${scopedCoverageSites} select distinct n.slug,n.name from sites p
      join public.ad_network_publisher_relationships r on r.publisher_id=p.id and r.status in ('confirmed','stale')
      join public.ad_networks n on n.id=r.ad_network_id order by n.name,n.slug`,[network,niche]),
    queryAdNetworkReport<{evidence:unknown;manager_relationships:SiteRecord["manager_relationships"];count:number}>(`${scopedManagerSites},
      memberships as materialized (${reportMemberships}),
      records as (select ${reportManagerEvidence} from sites p join memberships m on m.publisher_id=p.id)
      select evidence,manager_relationships,count(*)::int as count from records group by 1,2`,[network,niche]),
    queryNetworkIdentities(),
  ]);
  // data-gate: use the same resolver as rows so ambiguous evidence cannot expose an empty manager column.
  const manager=managerGroups.rows.reduce((sum,row)=>{
    const resolved=deriveManagedBy(row.evidence,identities,row.manager_relationships);
    return sum+(resolved.managed_by||resolved.manager_domain ? row.count : 0);
  },0);
  return adNetworkSiteAvailability({...coverage.rows[0],manager,networks:networks.rows});
}
const coverageWhere = `exists(select 1 from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
    where r.publisher_id=p.id and r.status in ('confirmed','stale') and ($1::text is null or n.slug=$1))
    and ($2::text is null or p.niche=$2)`;
const scopedCoverageSites = `with sites as materialized (select p.id,p.niche,p.traffic_group,p.domain_created_on,p.platform,p.publisher_name,p.last_checked_at
  from public.ad_network_publishers p where ${coverageWhere})`;
const scopedManagerSites = `with sites as materialized (select p.id,
  jsonb_build_object('manager_domains',p.report_manager_domains) as last_check_evidence
  from public.ad_network_publishers p
  where exists(select 1 from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
    where r.publisher_id=p.id and r.status in ('confirmed','stale') and ($1::text is null or n.slug=$1))
    and ($2::text is null or p.niche=$2))`;
export const getAdNetworkSitesAvailability=cached("ad-network-sites-availability",loadAdNetworkSitesAvailability);
const siteSort: Record<AdNetworkSitesQuery["sort"], string> = {
  domain: "p.normalized_domain", traffic: "case p.traffic_group when 'top-1k' then 0 when 'top-10k' then 1 when 'top-100k' then 2 when 'top-1m' then 3 when 'not-ranked' then 4 else 5 end,p.domain_created_on asc nulls last,p.normalized_domain,p.id",
  oldest: "p.domain_created_on asc nulls last,p.normalized_domain",
  newest: "p.domain_created_on desc nulls last,p.normalized_domain",
  checked: "p.last_checked_at desc nulls last,p.normalized_domain",
};
/** Uncached source loader for signed origin verification. */
export async function loadAdNetworkSites(query: AdNetworkSitesQuery): Promise<AdNetworkSitesResponse> {
  // Apply bounds here too: server page callers do not go through the API parser.
  if (!Object.hasOwn(siteSort, query.sort) || !Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100
    || !Number.isInteger(query.page) || query.page < 1 || query.page > 10000 || query.q.length > 100) throw new Error("Invalid sites query");
  const availability = await loadAdNetworkSitesAvailability(query.network,query.niche);
  // data-gate: unavailable traffic/age sorts fall back to domain until enrichment lands.
  const effectiveSort = availability.availableSorts.includes(query.sort) ? query.sort : "domain";
  const values = [query.network, query.niche, query.q.trim().toLowerCase()];
  const count = await queryAdNetworkReport<{total:number}>(`select count(*)::int as total from public.ad_network_publishers p where ${siteWhere}`, values);
  const total = count.rows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const [result, identities] = await Promise.all([
    // Filter and page using the small indexed facts before reading full evidence.
    // Sparse searches must not walk every evidence-heavy heap row in domain order.
    queryAdNetworkReport<SiteRecord>(`with matches as materialized (
      select p.id,p.normalized_domain,p.traffic_group,p.domain_created_on,p.last_checked_at
      from public.ad_network_publishers p where ${siteWhere}
    ), selected as materialized (
      select p.id from matches p order by ${siteSort[effectiveSort]} limit $4 offset $5
    ) select ${siteProjection} from selected s join public.ad_network_publishers p on p.id=s.id
      order by ${siteSort[effectiveSort]}`, [...values, query.pageSize, (page - 1) * query.pageSize]),
    queryNetworkIdentities(),
  ]);
  return { rows: result.rows.map(row => toSite(row, identities)), total, page, pageSize: query.pageSize, totalPages, effectiveSort, ...availability };
}
export const getAdNetworkSites=cached("ad-network-sites-traffic-age",loadAdNetworkSites);
export function defaultAdNetworkSitesQuery(network: string | null = null, niche: AdNetworkNicheSlug | null = null, pageSize = AD_NETWORK_SITES_PAGE_SIZE): AdNetworkSitesQuery {
  return { network, niche, q: "", sort: network || niche ? "traffic" : "domain", page: 1, pageSize };
}

const scopedSites = `with sites as materialized (select p.id,p.normalized_domain,p.niche,p.publisher_name,p.traffic_group,p.platform,p.domain_created_on
  from public.ad_network_publishers p where ${siteWhere})`;
const networkShares = cached("ad-network-shares", async (niche: string | null): Promise<AdNetworkShare[]> => {
  const result = await queryAdNetworkReport<AdNetworkRef & {count:number; total:number}>(`
    with sites as (select p.id from public.ad_network_publishers p where ($1::text is null or p.niche=$1)
      and exists(select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale')))
    select n.slug,n.name,count(r.publisher_id)::int as count,(select count(*)::int from sites) as total
    from public.ad_networks n left join public.ad_network_publisher_relationships r on r.ad_network_id=n.id
      and r.status in ('confirmed','stale') and r.publisher_id in (select id from sites)
    group by n.id order by count(r.publisher_id) desc,n.name`, [niche]);
  return result.rows.map(({total,...row}) => ({ ...row, share: share(row.count,total) }));
});
const loadHistory = cached("ad-network-daily-history", async (network: string): Promise<AdNetworkDailyCount[]> => {
  const result = await queryAdNetworkReport<AdNetworkDailyCount>(`select snapshot_on::text as date,listed_count as listed,
    confirmed_count as confirmed,stale_count as stale from public.ad_network_daily_counts d
    join public.ad_networks n on n.id=d.ad_network_id where n.slug=$1 and snapshot_on >= current_date-730
    order by snapshot_on limit 731`,[network]);
  return result.rows;
});
export async function loadAdNetworkMovements(network: string | null,asOf=new Date().toISOString().slice(0,10)): Promise<AdNetworkMovement[]> {
  const window=adNetworkUtcWindow(90,new Date(asOf));
  // data-gate: verifier observations supply real joined/left/newly-found events; baseline imports never count.
  return (await queryAdNetworkReport<AdNetworkMovement>(`select (e.observed_at at time zone 'UTC')::date::text as date,
      count(*) filter(where event='joined')::int as joined,count(*) filter(where event='left')::int as left,
      count(distinct e.publisher_id) filter(where event='newly_found')::int as newly_found,0::int as baseline
    from public.ad_network_relationship_events e join public.ad_networks n on n.id=e.ad_network_id
    where ($1::text is null or n.slug=$1) and e.observed_at >= ($2::date::timestamp at time zone 'UTC')
      and e.observed_at < ($3::date::timestamp at time zone 'UTC') and e.event<>'baseline'
    group by 1 order by 1 limit 90`,[network,window.start,window.until])).rows;
}
const loadMovements=cached("ad-network-movements",loadAdNetworkMovements);
const movementTotals=adNetworkMovementTotals;
export async function loadAdNetworkSwitches(network: string | null,niche: string | null,asOf=new Date().toISOString().slice(0,10)): Promise<AdNetworkSwitch[]> {
  const window=adNetworkUtcWindow(90,new Date(asOf));
  // data-gate: successive verifier observations must establish a real manager replacement.
  // Count a manager replacement only when exactly one departed and one arrived within 7 days.
  // Concurrent selling relationships never imply a switch. The 14-day context retains
  // competing departures near a report boundary before the final 90-day filter.
  return (await queryAdNetworkReport<AdNetworkSwitch>(`
    with moves as (
      select l.publisher_id,l.ad_network_id as from_id,j.ad_network_id as to_id,l.observed_at,
        count(*) over(partition by l.publisher_id,l.ad_network_id,l.observed_at) as candidates,
        count(*) over(partition by j.publisher_id,j.ad_network_id,j.observed_at) as departure_candidates
      from public.ad_network_relationship_events l
      join public.ad_network_relationship_events j on j.publisher_id=l.publisher_id and j.event='joined'
        and j.ad_network_id<>l.ad_network_id and j.relationship_type='primary_or_exclusive_manager'
        and j.observed_at between l.observed_at-interval '7 days' and l.observed_at+interval '7 days'
      join public.ad_network_publishers p on p.id=l.publisher_id
      where l.event='left' and l.relationship_type='primary_or_exclusive_manager'
        and l.observed_at >= (($3::date::timestamp at time zone 'UTC')-interval '14 days')
        and l.observed_at < (($4::date::timestamp at time zone 'UTC')+interval '14 days') and ($2::text is null or p.niche=$2)
    ) select jsonb_build_object('slug',a.slug,'name',a.name) as "from",
      jsonb_build_object('slug',b.slug,'name',b.name) as "to",count(distinct m.publisher_id)::int as count
      from moves m join public.ad_networks a on a.id=m.from_id join public.ad_networks b on b.id=m.to_id
      where m.candidates=1 and m.departure_candidates=1
        and m.observed_at >= ($3::date::timestamp at time zone 'UTC')
        and m.observed_at < ($4::date::timestamp at time zone 'UTC')
        and ($1::text is null or a.slug=$1 or b.slug=$1)
      group by a.id,b.id order by count(distinct m.publisher_id) desc,a.slug,b.slug limit 100`,[network,niche,window.start,window.until])).rows;
}
const loadSwitches=cached("ad-network-observed-switches",loadAdNetworkSwitches);

type DomainAgeRecord = {
  scope_key: string; name: string; measured: number;
  p25_year: number; median_year: number; p75_year: number;
  oldest_domain: string; oldest_on: string; newest_domain: string; newest_on: string;
  bins: {year:number;count:number}[];
};

/** DISTINCT makes the market/niche strip count a multi-network site once.
 * Percentiles use chronological registration years with continuous interpolation.
 * Exact dates select the endpoint domains, with domain order breaking ties.
 */
async function queryDomainAgeStrips(network: string | null,niche: string | null,byNetwork: boolean): Promise<DomainAgeRecord[]> {
  return (await queryAdNetworkReport<DomainAgeRecord>(`with records as materialized (
    select distinct case when $3::boolean then n.slug else '' end as scope_key,
      case when $3::boolean then n.name else '' end as name,
      p.normalized_domain as domain,p.domain_created_on as registered_on,
      extract(year from p.domain_created_on)::int as year
    from public.ad_network_publishers p
    join public.ad_network_publisher_relationships r on r.publisher_id=p.id and r.status in ('confirmed','stale')
    join public.ad_networks n on n.id=r.ad_network_id
    where p.domain_created_on is not null and ($1::text is null or n.slug=$1) and ($2::text is null or p.niche=$2)
  ), summaries as (
    select scope_key,name,count(*)::int as measured,
      percentile_cont(0.25) within group(order by year)::float8 as p25_year,
      percentile_cont(0.5) within group(order by year)::float8 as median_year,
      percentile_cont(0.75) within group(order by year)::float8 as p75_year,
      (array_agg(domain order by registered_on,domain))[1] as oldest_domain,min(registered_on)::text as oldest_on,
      (array_agg(domain order by registered_on desc,domain))[1] as newest_domain,max(registered_on)::text as newest_on
    from records group by scope_key,name
  ), bins as (
    select scope_key,year,count(*)::int as count from records group by scope_key,year
  ), histograms as (
    select scope_key,jsonb_agg(jsonb_build_object('year',year,'count',count) order by year) as bins
    from bins group by scope_key
  ) select summaries.*,coalesce(histograms.bins,'[]'::jsonb) as bins
    from summaries left join histograms using (scope_key) order by scope_key`,[network,niche,byNetwork])).rows;
}

function toDomainAgeStrip(row: DomainAgeRecord | undefined): AdNetworkDomainAgeStrip | null {
  // data-gate: RDAP dates must exist in this scope; unknown dates never enter percentiles or endpoints.
  if(!row?.measured)return null;
  return {measured:row.measured,p25_year:row.p25_year,median_year:row.median_year,p75_year:row.p75_year,
    middle_half:[row.p25_year,row.p75_year],bin_years:1,bins:row.bins,
    oldest:{domain:row.oldest_domain,year:Number(row.oldest_on.slice(0,4)),registered_on:row.oldest_on},
    newest:{domain:row.newest_domain,year:Number(row.newest_on.slice(0,4)),registered_on:row.newest_on}};
}

/** Uncached source loader, also useful for verification of currently gated RDAP fields. */
export async function loadAdNetworkDomainAgeStrip(network: string | null=null,niche: string | null=null): Promise<AdNetworkDomainAgeStrip | null> {
  return toDomainAgeStrip((await queryDomainAgeStrips(network,niche,false))[0]);
}
export const getAdNetworkDomainAgeStrip=cached("ad-network-domain-age-strip",loadAdNetworkDomainAgeStrip);

export async function loadAdNetworkDomainAgeByNetwork(niche: string | null=null): Promise<(AdNetworkRef & {strip:AdNetworkDomainAgeStrip})[]> {
  return (await queryDomainAgeStrips(null,niche,true)).flatMap(row=>{
    const strip=toDomainAgeStrip(row);
    return strip ? [{slug:row.scope_key,name:row.name,strip}] : [];
  });
}
export const getAdNetworkDomainAgeByNetwork=cached("ad-network-domain-age-by-network",loadAdNetworkDomainAgeByNetwork);

type Breakdowns = Pick<AdNetworkStatsReport,"niches"|"traffic"|"publishers"|"domain_age"|"median_domain_age"|"median_domain_registered_year"|"platforms"|"domain_endings"|"managers"|"also_runs"|"platform_mix">;
const loadBreakdowns = cached("ad-network-breakdowns", async (network: string): Promise<Breakdowns> => {
  const pool = {query:queryAdNetworkReport};
  const base = [network,null,""];
  async function groups(expression: string, condition: string, limit=50): Promise<AdNetworkCount[]> {
    return (await pool.query<AdNetworkCount>(`${scopedSites} select ${expression} as key,${expression} as label,count(*)::int as count
      from sites p where ${condition} group by 1,2 order by count(*) desc,1 limit ${limit}`,base)).rows;
  }
  // data-gate: traffic, platform and RDAP runs supply measured groups; null fields never enter a bucket.
  const [niches, traffic, publishers, platforms, domain_age, domain_endings, median, managers, alsoRuns] = await Promise.all([
    groups("p.niche","p.niche is not null"), groups("p.traffic_group","p.traffic_group is not null"),
    // data-gate: publisher-names run; business suffixes only, excluding personal/ambiguous names.
    groups("p.publisher_name","p.publisher_name ~* '( LLC| Ltd\\.?| Inc\\.?| Limited| GmbH| Corporation| Corp\\.?)$'",20),
    groups("p.platform","p.platform is not null"),
    groups("case when extract(year from age(current_date,p.domain_created_on))<3 then '0–2 years' when extract(year from age(current_date,p.domain_created_on))<6 then '3–5 years' when extract(year from age(current_date,p.domain_created_on))<11 then '6–10 years' when extract(year from age(current_date,p.domain_created_on))<16 then '11–15 years' else '16+ years' end", "p.domain_created_on is not null"),
    // TLD statistics use the public suffix list, including multi-label endings, below.
    pool.query<{domain:string}>(`${scopedSites} select p.normalized_domain as domain from sites p order by p.id`,base),
    pool.query<{median:number|null;registered_year:number|null}>(`${scopedSites} select percentile_cont(0.5) within group(order by extract(epoch from age(current_date,domain_created_on))/31557600)::float8 as median,
      extract(year from to_timestamp(percentile_cont(0.5) within group(order by extract(epoch from domain_created_on::timestamp))))::int as registered_year from sites where domain_created_on is not null`,base),
    getAdNetworkManagerStatistics(),
    pool.query<AdNetworkRef & {count:number}>(`${scopedSites} select n.slug,n.name,count(*)::int as count from sites p
      join public.ad_network_publisher_relationships r on r.publisher_id=p.id and r.status in ('confirmed','stale')
      join public.ad_networks n on n.id=r.ad_network_id where n.slug<>$1 group by n.id order by count(*) desc,n.name limit 50`,base),
  ]);
  const suffixes = new Map<string,number>();
  for (const row of domain_endings.rows) {
    const suffix = getPublicSuffix(row.domain);
    if (suffix) suffixes.set(`.${suffix}`,(suffixes.get(`.${suffix}`)??0)+1);
  }
  const currentNetwork=await getAdNetwork(network);
  const total=currentNetwork?.listed_count??0;
  // Per-network shares use only sorted sites. Broad comparison gates stay in their loaders.
  const percentages=(rows:AdNetworkCount[])=>rows.map(row=>({...row,share:share(row.count,total)}));
  return { niches:adNetworkNicheShares(niches),
    traffic:percentages(traffic.sort((a,b)=>trafficOrder(a.key)-trafficOrder(b.key))),publishers,platforms:percentages(platforms),
    platform_mix:adNetworkPlatformMix(platforms,total),
    domain_age:percentages(domain_age.sort((a,b)=>domainAgeOrder(a.key)-domainAgeOrder(b.key))),
    domain_endings: [...suffixes].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,50).map(([key,count])=>({key,label:key,count,share:share(count,total)})),
    median_domain_age: median.rows[0].median,median_domain_registered_year:median.rows[0].registered_year, managers: percentages(adNetworkManagerBreakdown(managers.network_counts[network]??[]))
      .map(row=>({...row,label:row.key==='this-network' ? currentNetwork!.name : row.key==='another-network' ? 'Another network' : 'Not listed'}))
      .sort((a,b)=>['this-network','another-network','not-listed'].indexOf(a.key)-['this-network','another-network','not-listed'].indexOf(b.key)),
    also_runs: alsoRuns.rows.map(row=>({...row,share:share(row.count,total)})),
  };
});

export async function getAdNetworkPageData(slug: string): Promise<AdNetworkPageData | null> {
  const observedDay=new Date();
  const asOf=observedDay.toISOString().slice(0,10);
  const network = await getAdNetwork(slug);
  if (!network) return null;
  const [sites,breakdowns,history,ranking,movements,switches,metadata,domain_age_strip] = await Promise.all([
    getAdNetworkSites(defaultAdNetworkSitesQuery(slug)),loadBreakdowns(slug),loadHistory(slug),networkShares(null),loadMovements(slug,asOf),loadSwitches(slug,null,asOf),loadReportMetadata(slug),getAdNetworkDomainAgeStrip(slug,null),
  ]);
  // data-gate: a 90-day-old snapshot establishes the observation span for real gains/losses.
  const older = history.filter(row=>row.date<=adNetworkUtcWindow(90,observedDay).baseline).at(-1);
  return { network,sites,stats:{ domain_age_strip,switch_flow:adNetworkSwitchFlow(ref(network),switches),
    movement_periods:adNetworkMovementPeriods(movements,observedDay),confirmed_share:network.listed_count ? share(network.verified_count,network.listed_count) : null,
    change_year:adNetworkYearChange(history,network.listed_count,observedDay),networks_tracked:ranking.length,...metadata,listed:network.listed_count,confirmed:network.verified_count,
    rank:network.listed_count ? ranking.findIndex(row=>row.slug===slug)+1 : null,
    change_90_days:older ? movementTotals(movements).joined-movementTotals(movements).left : null,
    ...breakdowns,history:adNetworkMonthEnds(history),ranking,movements,movement_totals:movementTotals(movements),switches } };
}

// Aggregate relationships once. A correlated EXISTS in an aggregate FILTER can
// rescan the relationship table for every site as the directory grows.
const nichePopulation = `with listed_publishers as (
  select publisher_id,bool_or(status='confirmed') as is_confirmed
  from public.ad_network_publisher_relationships where status in ('confirmed','stale') group by publisher_id
), population as (
  select p.niche,l.is_confirmed from listed_publishers l
  join public.ad_network_publishers p on p.id=l.publisher_id
)`;

export const getAdNetworkNichesPageData = cached("ad-network-niches-page", async (): Promise<AdNetworkNichesPageData> => {
  const counts = (await queryAdNetworkReport<{listed:number;confirmed:number;classified:number}>(`${nichePopulation}
    select count(*)::int as listed,count(*) filter(where is_confirmed)::int as confirmed,
    count(niche)::int as classified from population`)).rows[0];
  const rows = (await queryAdNetworkReport<{niche:AdNetworkNicheSlug;listed:number;confirmed:number}>(`${nichePopulation}
    select niche,count(*)::int as listed,count(*) filter(where is_confirmed)::int as confirmed
    from population where niche is not null group by niche`)).rows;
  const ready=hasAdNetworkNicheCoverage(counts.listed,counts.classified);
  // data-gate: hide niche groups and their controls until the classification run reaches coverage.
  if (!ready) return {...counts,unclassified:counts.listed-counts.classified,niches:[],networks:[],niche_coverage:null,
    updated_at:(await loadReportMetadata(null)).updated_at};
  // Read the niche/network matrix once, rather than scanning membership for
  // each of the twenty niches when classification first becomes available.
  const memberships = (await queryAdNetworkReport<AdNetworkRef & {niche:AdNetworkNicheSlug;count:number}>(`
    with classified as materialized (
      select id,niche from public.ad_network_publishers where niche is not null
    ) select p.niche,n.slug,n.name,count(*)::int as count from classified p
      join public.ad_network_publisher_relationships r on r.publisher_id=p.id and r.status in ('confirmed','stale')
      join public.ad_networks n on n.id=r.ad_network_id
      group by p.niche,n.id order by p.niche,count(*) desc,n.name`)).rows;
  const niches = adNetworkNiches.filter(n=>rows.some(row=>row.niche===n.slug)).map(niche => {
    const count=rows.find(row=>row.niche===niche.slug);
    const networks=memberships.filter(row=>row.niche===niche.slug).map(({niche:_,...network})=>({
      ...network,share:share(network.count,count?.listed??0),
    }));
    return { ...niche,listed:count?.listed??0,confirmed:count?.confirmed??0,share:share(count?.listed??0,counts.listed),networks,easiest_to_join:null as AdNetworkJoiningRule | null };
  });
  const visible=ready ? niches.filter(niche=>niche.listed>0).sort((a,b)=>b.listed-a.listed||a.slug.localeCompare(b.slug)) : [];
  for (const niche of visible) niche.easiest_to_join=joiningRules(niche.networks.slice(0,3))[0]??null;
  return {...counts,unclassified:counts.listed-counts.classified,niches:visible,
    niche_coverage:ready ? share(counts.classified,counts.listed) : null,updated_at:(await loadReportMetadata(null)).updated_at,
    networks:ready ? (await networkShares(null)).filter(n=>n.count>0).map(ref) : []};
});

export async function loadAdNetworkTrafficShares(niche: string | null): Promise<AdNetworkTrafficShare[]> {
  const [groups,identities] = await Promise.all([
    queryAdNetworkReport<{traffic_group:string;evidence:unknown;manager_relationships:SiteRecord["manager_relationships"];count:number}>(`
      with memberships as (${reportMemberships}), publishers as (
        select p.id,p.traffic_group,jsonb_build_object('manager_domains',p.report_manager_domains) as last_check_evidence
        from public.ad_network_publishers p
        where p.traffic_group is not null and ($1::text is null or p.niche=$1)
      ), records as (select p.traffic_group,${reportManagerEvidence} from memberships m join publishers p on p.id=m.publisher_id)
      select traffic_group,evidence,manager_relationships,count(*)::int as count
      from records group by 1,2,3`,[niche]),
    queryNetworkIdentities(),
  ]);
  // data-gate: traffic run plus resolved manager evidence; unknown groups/managers are excluded.
  return aggregateAdNetworkTrafficShares(groups.rows,identities);
}
const loadTrafficShares = cached("ad-network-traffic-shares",loadAdNetworkTrafficShares);
// This payload includes the default table view; retire cached A–Z initial rows.
export const getAdNetworkNichePageData = cached("ad-network-niche-page-traffic", async (slug: string): Promise<AdNetworkNichePageData | null> => {
  const asOf=new Date().toISOString().slice(0,10);
  const definition=getAdNetworkNiche(slug);
  if (!definition) return null;
  const all=await getAdNetworkNichesPageData();
  const niche=all.niches.find(row=>row.slug===slug);
  if (!niche) return null;
  const [sites,traffic,switches,identities,newestRows,recentRows,domain_age_strip] = await Promise.all([
    getAdNetworkSites(defaultAdNetworkSitesQuery(null,niche.slug)),loadTrafficShares(slug),loadSwitches(null,slug,asOf),loadNetworkIdentities(),
    queryAdNetworkReport<SiteRecord & {network_slug:string}>(`with ranked as (
      select p.id,n.slug as network_slug,row_number() over(partition by n.id order by (select max(e.observed_at) from public.ad_network_relationship_events e where e.publisher_id=p.id and e.ad_network_id=n.id and e.event in ('joined','newly_found')) desc,p.normalized_domain) as position
      from public.ad_network_publishers p join public.ad_network_publisher_relationships r on r.publisher_id=p.id
      join public.ad_networks n on n.id=r.ad_network_id where p.niche=$1 and r.status in ('confirmed','stale')
      and exists(select 1 from public.ad_network_relationship_events e where e.publisher_id=p.id and e.ad_network_id=n.id and e.event in ('joined','newly_found')))
      select ${siteProjection},ranked.network_slug from ranked join public.ad_network_publishers p on p.id=ranked.id
      where position<=5 order by ranked.network_slug,position`,[slug]),
    queryAdNetworkReport<SiteRecord & {first_confirmed_at:string;arrived_network:AdNetworkRef}>(`with recent as (
      select distinct on(e.publisher_id) e.publisher_id,e.ad_network_id,e.observed_at as arrived from public.ad_network_relationship_events e
      join public.ad_network_publisher_relationships r on r.publisher_id=e.publisher_id and r.ad_network_id=e.ad_network_id
      join public.ad_network_publishers p on p.id=e.publisher_id where p.niche=$1 and r.status in ('confirmed','stale')
      and e.event in ('joined','newly_found') order by e.publisher_id,e.observed_at desc,e.ad_network_id),
      latest as (select * from recent order by arrived desc,publisher_id limit 5)
      select ${siteProjection},latest.arrived::text as first_confirmed_at,
        jsonb_build_object('slug',arrived_network.slug,'name',arrived_network.name) as arrived_network from latest
      join public.ad_network_publishers p on p.id=latest.publisher_id
      join public.ad_networks arrived_network on arrived_network.id=latest.ad_network_id
      order by latest.arrived desc,p.normalized_domain`,[slug]),
    getAdNetworkDomainAgeStrip(null,slug),
  ]);
  // data-gate: newest lists use observed arrivals, excluding baseline import dates.
  return {niche,sites,traffic,switches,domain_age_strip,
    newest_arrivals:recentRows.rows.map(({first_confirmed_at,arrived_network,...record})=>({
      site:toSite(record,identities),network:arrived_network,observed_at:iso(first_confirmed_at)!,
    })),newest_sites:recentRows.rows.map(row=>{
    const {first_confirmed_at,arrived_network,...record}=row; return {...toSite(record,identities),first_confirmed_at};
  }),newest:niche.networks.map(n=>({...ref(n),sites:newestRows.rows.filter(row=>row.network_slug===n.slug).map(({network_slug,...row})=>toSite(row,identities))})).filter(n=>n.sites.length>0)};
});

/** Uncached source loader for signed origin verification. */
export async function loadAdNetworkCheckerSite(domain: string): Promise<AdNetworkCheckerSiteView | null> {
  const [records,identities] = await Promise.all([
    queryAdNetworkReport<SiteRecord & {id:string;ads_txt_summary:AdNetworkAdsTxtSummary|null}>(`select p.id,${siteProjection},p.ads_txt_summary
      from public.ad_network_publishers p where p.normalized_domain=$1
      and exists(select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale','ended'))`,[domain]),queryNetworkIdentities(),
  ]);
  const row=records.rows[0];if (!row) return null;
  const relationships=(await queryAdNetworkReport<AdNetworkSiteRelationship>(`select n.slug,n.name,r.status,r.relationship_type,r.verification_method,
    r.first_confirmed_at::text,r.last_confirmed_at::text,r.ended_at::text from public.ad_network_publisher_relationships r
    join public.ad_networks n on n.id=r.ad_network_id where r.publisher_id=$1 and r.status in ('confirmed','stale','ended')
    order by case r.status when 'confirmed' then 0 when 'stale' then 1 else 2 end,n.name`,[row.id])).rows;
  const history=(await queryAdNetworkReport<AdNetworkCheckerSiteView["history"][number]>(`select e.observed_at::text as date,e.event,e.relationship_type,
    jsonb_build_object('slug',n.slug,'name',n.name) as network from public.ad_network_relationship_events e
    join public.ad_networks n on n.id=e.ad_network_id where e.publisher_id=$1 order by e.observed_at,e.event,n.slug`,[row.id])).rows;
  const {id,ads_txt_summary,...siteRecord}=row;
  const site=toSite(siteRecord,identities);
  let similar_sites: AdNetworkSiteRow[]=[];
  const activeNetworks=relationships.filter(r=>r.status==='confirmed').map(r=>r.slug);
  const similarNetworks=site.managed_by && activeNetworks.includes(site.managed_by.slug)
    ? [site.managed_by.slug] : activeNetworks;
  let basis: "niche" | "network" = "network";
  if (similarNetworks.length) {
    const findSimilar=(niche: string | null)=>queryAdNetworkReport<SiteRecord>(`select ${siteProjection} from public.ad_network_publishers p
      where ($1::text is null or p.niche=$1) and p.normalized_domain<>$2
      and exists(select 1 from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
        where r.publisher_id=p.id and r.status='confirmed' and n.slug=any($3::text[]))
      order by case when $4::text is not null and p.traffic_group=$4 then 0 else 1 end,md5($2::text || ':' || p.normalized_domain),p.normalized_domain,p.id limit 6`,[niche,domain,similarNetworks,site.traffic_group]);
    let similar=await findSimilar(site.niche);
    if (site.niche && similar.rows.length) basis="niche";
    else if (site.niche) similar=await findSimilar(null);
    similar_sites=similar.rows.map(record=>toSite(record,identities));
  }
  const ads_txt_preview=buildAdsTxtPreview(ads_txt_summary?.preview);
  const summary=ads_txt_summary ? {...ads_txt_summary,preview:ads_txt_preview} : null;
  const denominator=(summary?.direct??0)+(summary?.reseller??0);
  // data-gate: RDAP, ads-txt-summary, niche/traffic/platform/name enrichment fill per-site values.
  const domain_age_years=adNetworkObservedDomainAge(site.domain_created_on,site.last_checked_at);
  const similar_available_columns=(["domain",...(similar_sites.some(s=>s.traffic_group!==null) ? ["traffic"] : [])]) as AdNetworkSitesAvailability["availableColumns"];
  // data-gate: a complete seller-company list (not the bounded top_sellers list) must be saved by the summary run.
  const companies=summary?.seller_domains;
  const other_sellers=companies ? [...new Set(companies)].filter(company=>!identities.some(n=>n.ad_system_domains.includes(company))).length : null;
  return {events:adNetworkCheckerEvents(history,site.last_checked_at),history:history.slice(0,200).map(e=>({...e,date:iso(e.date)!})),other_sellers,
    direct_share:denominator ? share(summary!.direct,denominator) : null,reseller_share:denominator ? share(summary!.reseller,denominator) : null,
    domain_age_years,similar_available_columns,site,relationships:relationships.map(r=>({...r,verification_method:r.verification_method??null,ad_system_domains:identities.find(n=>n.slug===r.slug)?.ad_system_domains??[],first_confirmed_at:iso(r.first_confirmed_at),last_confirmed_at:iso(r.last_confirmed_at),ended_at:iso(r.ended_at)})),ads_txt_summary:summary,ads_txt_preview,similar_sites,basis,history_source:"observed"};
}
export const getAdNetworkCheckerSite=cached("ad-network-checker-site-v2",loadAdNetworkCheckerSite);

/** Scan each partial source-ID index once instead of fetching JSON or probing per site.
 * The events publisher foreign key guarantees that every first discovery has a publisher.
 */
export async function loadAdNetworkWeeklyDiscoveries(): Promise<AdNetworkStatsPageData["freshness"]["weekly"]> {
  return (await queryAdNetworkReport<AdNetworkStatsPageData["freshness"]["weekly"][number]>(`with first_listed as (
      select publisher_id,min(observed_at) as first_seen_at from public.ad_network_relationship_events
      where event='newly_found' group by publisher_id
    ), checker_sources as materialized (
      select id from public.ad_network_publishers where discovery_sources @> '[{"source_key":"checker"}]'
    ), attributed_sources as materialized (
      select id from public.ad_network_publishers where jsonb_array_length(discovery_sources)>0
    ) select date_trunc('week',f.first_seen_at at time zone 'UTC')::date::text as week,
      count(*) filter(where checker.id is null)::int as discovered,
      count(*) filter(where checker.id is not null)::int as checker
      from first_listed f left join checker_sources checker on checker.id=f.publisher_id
      left join attributed_sources attributed on attributed.id=f.publisher_id
      where f.first_seen_at>=date_trunc('week',now() at time zone 'UTC')-interval '12 weeks'
      and f.first_seen_at<date_trunc('week',now() at time zone 'UTC') group by 1
      having bool_and(attributed.id is not null) order by 1 limit 12`)).rows;
}

export const getAdNetworkStatsPageData = cached("ad-network-market-report", async (): Promise<AdNetworkStatsPageData> => {
  const pool={query:queryAdNetworkReport};
  const observedDay=new Date();
  const asOf=observedDay.toISOString().slice(0,10);
  const active=`with active as materialized (select p.last_checked_at from public.ad_network_publishers p where exists(
    select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale')))`;
  const activeAds=`with active as materialized (select p.report_ads_txt_lines as lines,
    p.report_ads_txt_invalid as invalid from public.ad_network_publishers p
    where p.report_has_ads_txt_summary and exists(select 1 from public.ad_network_publisher_relationships r
      where r.publisher_id=p.id and r.status in ('confirmed','stale')))`;
  const [niches,market_share,traffic,switches,networkCounts,pairs,ages,wordpress,ads,sizes,freshness,weekly,movements,managerStats,metadata,queue,domain_age_strip,domain_age_by_network] = await Promise.all([
    getAdNetworkNichesPageData(),networkShares(null),loadTrafficShares(null),loadSwitches(null,null,asOf),
    pool.query<AdNetworkCount>(`with counts as (select publisher_id,count(*) as n from public.ad_network_publisher_relationships
      where status in ('confirmed','stale') group by publisher_id)
      select case when n>=4 then '4+' else n::text end as key,case when n>=4 then '4+' else n::text end as label,count(*)::int as count from counts group by 1,2 order by min(n)`),
    pool.query<AdNetworkStatsPageData["pairs"][number]>(`select jsonb_build_object('slug',a.slug,'name',a.name) as first,
      jsonb_build_object('slug',b.slug,'name',b.name) as second,count(*)::int as count
      from public.ad_network_publisher_relationships r join public.ad_network_publisher_relationships s
        on s.publisher_id=r.publisher_id and s.ad_network_id>r.ad_network_id and s.status in ('confirmed','stale')
      join public.ad_networks a on a.id=r.ad_network_id join public.ad_networks b on b.id=s.ad_network_id
      where r.status in ('confirmed','stale') group by a.id,b.id order by count(*) desc,a.slug,b.slug limit 100`),
    pool.query<AdNetworkStatsPageData["median_domain_age"][number]>(`select n.slug,n.name,
      percentile_cont(0.5) within group(order by extract(epoch from age(current_date,p.domain_created_on))/31557600)::float8 as years
      from public.ad_network_publishers p join public.ad_network_publisher_relationships r on r.publisher_id=p.id
      join public.ad_networks n on n.id=r.ad_network_id where r.status in ('confirmed','stale') and p.domain_created_on is not null
      group by n.id order by years desc,n.name`),
    pool.query<AdNetworkRef & {count:number;total:number}>(`select n.slug,n.name,
      count(*) filter(where lower(p.platform)='wordpress')::int as count,count(p.platform)::int as total
      from public.ad_network_publishers p join public.ad_network_publisher_relationships r on r.publisher_id=p.id
      join public.ad_networks n on n.id=r.ad_network_id where r.status in ('confirmed','stale')
      group by n.id having count(p.platform)>0 order by count(*) filter(where lower(p.platform)='wordpress')::float/count(p.platform) desc,n.name`),
    pool.query<{median_lines:number|null;with_broken_lines:number}>(`${activeAds}
      select percentile_cont(0.5) within group(order by lines)::float8 as median_lines,
      count(*) filter(where invalid>0)::int as with_broken_lines from active`),
    pool.query<AdNetworkCount>(`${activeAds} select bucket as key,bucket as label,count(*)::int as count from (
      select case when lines<20 then '<20' when lines<50 then '20–49'
        when lines<100 then '50–99' when lines<200 then '100–199'
        when lines<500 then '200–499' else '500+' end as bucket from active
      ) x group by bucket order by min(case bucket when '<20' then 0 when '20–49' then 1 when '50–99' then 2 when '100–199' then 3 when '200–499' then 4 else 5 end)`),
    pool.query<{checked_last_7_days:number;new_last_week:number}>(`${active}, first_listed as (
      select publisher_id,min(observed_at) as first_seen_at from public.ad_network_relationship_events
      where event='newly_found' group by publisher_id)
      select count(*) filter(where last_checked_at>=now()-interval '7 days')::int as checked_last_7_days,
      (select count(*)::int from first_listed where first_seen_at>=date_trunc('week',now() at time zone 'UTC')-interval '7 days'
        and first_seen_at<date_trunc('week',now() at time zone 'UTC')) as new_last_week from active`),
    loadAdNetworkWeeklyDiscoveries(),
    loadMovements(null,asOf),getAdNetworkManagerStatistics(),loadReportMetadata(null),
    pool.query<{total:number;checked:number;waiting:number}>(`select count(*)::int as total,
      count(*) filter(where last_checked_at is not null)::int as checked,
      count(*) filter(where last_checked_at is null)::int as waiting from public.ad_network_publishers`),
    getAdNetworkDomainAgeStrip(),getAdNetworkDomainAgeByNetwork(),
  ]);
  // Cache each network's history separately so the aggregate never approaches the 2 MB limit.
  const history=await Promise.all(market_share.slice(0,5).map(async n=>({...ref(n),history:adNetworkMonthEnds(await loadHistory(n.slug))})));
  const net_change:AdNetworkStatsPageData["net_change"]=[];
  const cutoff=adNetworkUtcWindow(90,observedDay).baseline;
  const allHistories=await Promise.all(market_share.map(n=>loadHistory(n.slug)));
  for (const [index,network] of market_share.entries()) {
    const earlier=allHistories[index].filter(row=>row.date<=cutoff).at(-1);
    // data-gate: daily snapshots establish 90-day observation coverage; only real events count as gains/losses.
    if (earlier) {
      const events=movementTotals(await loadMovements(network.slug,asOf));
      net_change.push({...ref(network),change:events.joined-events.left});
    }
  }
  const multiple=networkCounts.rows.filter(row=>row.key!=="1").reduce((sum,row)=>sum+row.count,0);
  // data-gate: summary run must populate at least one measured file before any ads.txt block is shown.
  const ads_txt_metrics=managerStats.measured ? {manager_share:share(managerStats.with_manager,managerStats.measured),
    broken_share:share(ads.rows[0].with_broken_lines,managerStats.measured),median_lines:ads.rows[0].median_lines} : null;
  const queueCount=queue.rows[0];
  return {domain_age_strip,domain_age_by_network,confirmed_share:niches.listed ? share(niches.confirmed,niches.listed) : null,
    multiple_networks_share:niches.listed ? share(multiple,niches.listed) : null,...metadata,
    joining_rules:joiningRules(market_share.filter(n=>n.count>0)).map(n=>({...n,sites:market_share.find(row=>row.slug===n.slug)!.count})),
    check_queue:queueCount.total ? {...queueCount,checked_share:share(queueCount.checked,queueCount.total)} : null,ads_txt_metrics,
    movements,movement_totals:movementTotals(movements),listed:niches.listed,confirmed:niches.confirmed,networks_tracked:market_share.length,
    multiple_networks:networkCounts.rows.filter(row=>row.key!=="1").reduce((sum,row)=>sum+row.count,0),
    market_share,history:history.filter(n=>n.history.length>0),net_change,switches,traffic,networks_per_site:networkCounts.rows.map(row=>({...row,share:share(row.count,niches.listed)})),pairs:pairs.rows,
    median_domain_age:ages.rows,wordpress_share:wordpress.rows.map(({total,...row})=>({...row,share:share(row.count,total)})),
    ads_txt:{...ads.rows[0],with_manager:managerStats.with_manager,measured:managerStats.measured,file_sizes:sizes.rows.map(row=>({...row,share:share(row.count,managerStats.measured)}))},freshness:{...freshness.rows[0],
      checked_share:niches.listed ? share(freshness.rows[0].checked_last_7_days,niches.listed) : null,
      // data-gate: real new-site observations populate the weekly count; imported baselines are excluded.
      new_last_week:movements.some(row=>(row.newly_found??0)>0) ? freshness.rows[0].new_last_week : null,
      // data-gate: every site in a week needs source attribution before scan/checker stacks are shown.
      weekly}};
});

function joiningRules(networks: AdNetworkRef[]): AdNetworkJoiningRule[] {
  // Null is unknown or revenue-based, never an invented zero traffic minimum.
  return networks.flatMap(network => {
    const minimum=adNetworkFacts[network.slug]?.minTraffic;
    return minimum ? [{...ref(network),...minimum}] : [];
  }).sort((a,b)=>a.amount-b.amount||a.unit.localeCompare(b.unit)||a.slug.localeCompare(b.slug));
}

const loadReportMetadata=cached("ad-network-report-metadata",async (network: string | null) => {
  const [updated,methods]=await Promise.all([
    queryAdNetworkReport<{updated_at:Date|null}>(`select max(p.last_checked_at) as updated_at from public.ad_network_publishers p
      where exists(select 1 from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
        where r.publisher_id=p.id and r.status in ('confirmed','stale') and ($1::text is null or n.slug=$1))`,[network]),
    queryAdNetworkReport<AdNetworkCount>(`select r.verification_method as key,r.verification_method as label,count(*)::int as count
      from public.ad_network_publisher_relationships r join public.ad_networks n on n.id=r.ad_network_id
      where r.status='confirmed' and r.verification_method is not null and ($1::text is null or n.slug=$1)
      group by r.verification_method order by count(*) desc,r.verification_method`,[network]),
  ]);
  return {updated_at:iso(updated.rows[0].updated_at),verification_methods:methods.rows};
});

export const getAdNetworkDirectoryData=cached("ad-network-directory-data",async (): Promise<AdNetworkDirectoryData> => {
  const [networks,niches]=await Promise.all([cachedAdNetworks(),getAdNetworkNichesPageData()]);
  const most_sites=networks.map(network=>({...network,
    confirmed_share:network.listed_count ? share(network.verified_count,network.listed_count) : null,
    minTraffic:joiningRules([network])[0]??null,rank:null as number|null,
  })).sort((a,b)=>b.listed_count-a.listed_count||a.slug.localeCompare(b.slug));
  for(const [index,network] of most_sites.entries()) network.rank=network.listed_count ? index+1 : null;
  const easiest_to_join=most_sites.filter(n=>n.minTraffic!==null).sort((a,b)=>
    a.minTraffic!.amount-b.minTraffic!.amount||a.minTraffic!.unit.localeCompare(b.minTraffic!.unit)||b.listed_count-a.listed_count||a.slug.localeCompare(b.slug));
  // data-gate: niche classification coverage; zero-count networks have no niche group.
  const by_niche=niches.niches.map(niche=>({niche,networks:niche.networks.flatMap(n=>{
    const network=most_sites.find(row=>row.slug===n.slug);
    return network ? [{...network,niche_count:n.count,niche_share:n.share}] : [];
  })}));
  return {networks:most_sites,most_sites,easiest_to_join,by_niche,listed:niches.listed,confirmed:niches.confirmed,
    networks_tracked:networks.length,confirmed_share:niches.listed ? share(niches.confirmed,niches.listed) : null,
    updated_at:niches.updated_at,availableSorts:["most-sites",...(easiest_to_join.length ? ["easiest-to-join" as const] : []),
      ...(by_niche.length ? ["by-niche" as const] : [])],availableFilters:by_niche.length ? ["niche"] : []};
});
