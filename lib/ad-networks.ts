import { getPool } from "./db";

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

export async function listAdNetworks(query: string): Promise<AdNetwork[]> {
  const result = await getPool().query<AdNetwork & { verified_count: string }>(`
    select n.id, n.slug, n.name, n.official_url, n.summary,
      count(r.publisher_id) filter (where r.status = 'confirmed')::text as verified_count
    from public.ad_networks n
    left join public.ad_network_publisher_relationships r on r.ad_network_id = n.id
    where position(lower($1) in lower(n.name)) > 0
      or position(lower($1) in lower(n.slug)) > 0
    group by n.id
    order by n.name, n.id
  `, [query]);
  return result.rows.map((row) => ({ ...row, verified_count: Number(row.verified_count) }));
}

export async function getAdNetwork(slug: string): Promise<AdNetwork | null> {
  const result = await getPool().query<AdNetwork & { verified_count: string }>(`
    select n.id, n.slug, n.name, n.official_url, n.summary,
      count(r.publisher_id) filter (where r.status = 'confirmed')::text as verified_count
    from public.ad_networks n
    left join public.ad_network_publisher_relationships r on r.ad_network_id = n.id
    where n.slug = $1
    group by n.id
  `, [slug]);
  const row = result.rows[0];
  return row ? { ...row, verified_count: Number(row.verified_count) } : null;
}

export async function listVerifiedPublishers(networkId: string, query: string, page: number) {
  const count = await getPool().query<{ total: string }>(`
    select count(*)::text as total
    from public.ad_network_publisher_relationships r
    join public.ad_network_publishers p on p.id = r.publisher_id
    where r.ad_network_id = $1 and r.status = 'confirmed'
      and position(lower($2) in lower(p.normalized_domain)) > 0
  `, [networkId, query]);
  const total = Number(count.rows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / publisherPageSize));
  const currentPage = Math.min(page, totalPages);
  const result = await getPool().query<VerifiedPublisher>(`
    select p.normalized_domain, p.display_domain,
      r.relationship_type, r.last_confirmed_at
    from public.ad_network_publisher_relationships r
    join public.ad_network_publishers p on p.id = r.publisher_id
    where r.ad_network_id = $1 and r.status = 'confirmed'
      and position(lower($2) in lower(p.normalized_domain)) > 0
    order by p.normalized_domain, p.id
    limit $3 offset $4
  `, [networkId, query, publisherPageSize, (currentPage - 1) * publisherPageSize]);
  return { currentPage, rows: result.rows, total, totalPages };
}
