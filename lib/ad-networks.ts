import { getPool } from "./db";
import { unstable_cache } from "next/cache";
import { AD_NETWORKS_TAG } from "./cache-tags";

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

export const publisherPageSize = 30;

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

async function loadAdNetworks(): Promise<AdNetwork[]> {
  const result = await getPool().query<AdNetwork & { verified_count: string }>(`
    select n.id, n.slug, n.name, n.official_url, n.summary,
      count(r.publisher_id) filter (where r.status = 'confirmed')::text as verified_count
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

export async function listAdNetworks(query: string): Promise<AdNetwork[]> {
  const needle = query.toLowerCase();
  return (await cachedAdNetworks()).filter(network =>
    network.name.toLowerCase().includes(needle) || network.slug.toLowerCase().includes(needle));
}

export async function getAdNetwork(slug: string): Promise<AdNetwork | null> {
  return (await cachedAdNetworks()).find(network => network.slug === slug) ?? null;
}

const publisherBatchSize = 750;

async function loadVerifiedPublishersBatch(networkId: string, offset: number): Promise<VerifiedPublisher[]> {
  const result = await getPool().query<VerifiedPublisher>(`
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
  const result = await getPool().query<{ total: string }>(`
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
