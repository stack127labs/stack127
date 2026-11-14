import { z } from 'zod';
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => !Number.isNaN(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s, 'Use a real YYYY-MM-DD date');
export const dimensions = ['network','niche','registration_year','age_bucket','size_group','platform'] as const;
export const filtersShape = {
  networks: z.array(slug).min(1).max(44).optional().describe('Network slugs, matched with OR. Example: ["mediavine","ezoic"]. Omit for all.'),
  relationship: z.enum(['managed','listed']).default('listed').describe('managed = listed primary_or_exclusive_manager; listed = confirmed or stale.'),
  niche: z.string().max(80).optional().describe('One stack127 niche slug; see overview. Example: food. Unknown values match no sites.'),
  registered_after: date.optional().describe('Exclusive RDAP registration lower bound. Example: 2020-01-01.'),
  registered_before: date.optional().describe('Exclusive RDAP registration upper bound. Example: 2026-01-01.'),
  min_age: z.number().min(0).max(100).optional().describe('Minimum completed years since RDAP registration, inclusive. Example: 3.'),
  max_age: z.number().min(0).max(100).optional().describe('Maximum completed years since RDAP registration, inclusive. Example: 10.'),
  size_group: z.enum(['top-10k','top-100k','top-1m','not-ranked']).optional().describe('CrUX size group. not-ranked does not mean small. Example: top-1m.'),
  platform: z.string().max(80).optional().describe('Platform value from overview. Example: WordPress. Exact, case-sensitive.'),
  status: z.enum(['confirmed','stale']).optional().describe('Further restrict listed status. Ended relationships are available only in lookup_site and movements.'),
};
export const toolSchemas = {
  ad_networks_overview: z.object({}).strict(),
  list_ad_networks: z.object({
    max_minimum_traffic: z.number().int().nonnegative().optional().describe('Maximum published monthly minimum. Unknown minimums are excluded; units differ, use traffic_unit. Example: 50000.'),
    traffic_unit: z.enum(['sessions','pageviews','visitors','visits','monthly active users']).optional().describe('Only minimums in this exact unit. Example: sessions.'),
    has_public_rule: z.boolean().optional().describe('Whether a numeric traffic minimum is public. null is unknown, never zero.'),
    sort: z.enum(['listed','managed','name','minimum_traffic']).default('listed').describe('Descending counts, ascending names/minimums. Unknown minimums last.'),
  }).strict(),
  get_ad_network: z.object({ network: slug.describe('Network slug from overview. Example: mediavine.') }).strict(),
  compare_ad_networks: z.object({ ...filtersShape,
    networks: z.array(slug).min(2).max(6).describe('2–6 distinct network slugs. Example: ["mediavine","ezoic"].'),
    dimension: z.enum(['niche','registration_year','age_bucket','size_group','platform']).describe('One comparison dimension. Example: niche.'),
  }).strict(),
  count_sites: z.object({ ...filtersShape,
    group_by: z.array(z.enum(dimensions)).max(2).default([]).describe('Up to two distinct dimensions. Example: ["network","niche"]. Empty returns only the distinct-site total.'),
  }).strict(),
  find_sites: z.object({ ...filtersShape,
    sort: z.enum(['domain','newest','oldest']).default('domain').describe('Stable domain/date order. Example: newest. Missing dates sort last.'),
    limit: z.number().int().min(1).max(200).default(50).describe('Maximum sites, further capped by server setting. Example: 50.'),
    cursor: z.string().max(1000).optional().describe('Opaque next_cursor from the same query. Omit on the first page.'),
  }).strict(),
  lookup_site: z.object({domain: z.string().max(253).describe('Bare hostname, without a URL or path. Example: example.com. IDN hostnames accepted.')}).strict(),
  network_movements: z.object({
    networks: z.array(slug).min(1).max(44).optional().describe('Optional network slugs. Example: ["mediavine"].'),
    from: date.describe('Inclusive UTC start day. Example: 2026-10-19.'),
    to: date.describe('Inclusive UTC end day, at most 366 days after from. Example: 2026-11-14.'),
  }).strict(),
  run_readonly_sql: z.object({sql: z.string().min(1).max(12000).describe('A single SELECT, no CTEs or comments. Only stack127_data views; see tool description. Example: SELECT slug,name FROM stack127_data.ad_networks ORDER BY slug')}).strict(),
};
export type ToolName = keyof typeof toolSchemas;
export type Filters = z.infer<typeof toolSchemas.count_sites>;
export const toolNames = Object.keys(toolSchemas) as ToolName[];
