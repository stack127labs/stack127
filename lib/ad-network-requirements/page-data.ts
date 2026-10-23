import "server-only";
import { unstable_cache } from "next/cache";
import { listAdNetworks, queryAdNetworkReport } from "../ad-networks";
import { adNetworkNiches } from "../ad-network-niches.ts";
import { AD_NETWORKS_TAG } from "../cache-tags";
import { networkLogo } from "../../app/ui/ad-networks/network-logo-src";
import { adNetworkProfiles } from "./profiles.ts";
import { recommendAdNetworks } from "./engine.ts";
import type { NicheSlug, RequirementsPageData } from "./types.ts";

const slugs = adNetworkProfiles.map(profile => profile.slug);
const loadPeers = unstable_cache(async (): Promise<RequirementsPageData["peers"]> => {
  const rows = (await queryAdNetworkReport<{ niche: NicheSlug; slug: string; count: number }>(`
    select p.niche,n.slug,count(distinct p.id)::int as count
    from public.ad_network_publishers p
    join public.ad_network_publisher_relationships r on r.publisher_id=p.id and r.status='confirmed'
    join public.ad_networks n on n.id=r.ad_network_id
    where p.niche=any($1::text[]) and n.slug=any($2::text[])
    group by p.niche,n.slug order by p.niche,n.slug`, [adNetworkNiches.map(n => n.slug), slugs])).rows;
  const peers = Object.fromEntries(adNetworkNiches.map(niche => [niche.slug, {}])) as RequirementsPageData["peers"];
  for (const row of rows) peers[row.niche][row.slug] = row.count;
  return peers;
}, ["ad-network-recommendation-peers-v1"], { revalidate: false, tags: [AD_NETWORKS_TAG] });

export async function loadRequirementsPageData(): Promise<RequirementsPageData> {
  const [list, peers] = await Promise.all([listAdNetworks(), loadPeers()]);
  const bySlug = new Map(list.map(network => [network.slug, network]));
  const networks = slugs.map(slug => {
    const network = bySlug.get(slug);
    if (!network) throw new Error(`Missing ad network: ${slug}`);
    return { slug, name: network.name, logo: networkLogo(slug), directoryHref: `/ad-networks/${slug}` };
  });
  return { networks, peers, defaultResult: recommendAdNetworks({ niche: "food", pageviews: 40_000, visits: 22_000, visitsUnit: "sessions", siteAge: "gt12m", tier1Share: 65, current: "google-adsense", adRevenueMonth: 350 }, peers.food) };
}
