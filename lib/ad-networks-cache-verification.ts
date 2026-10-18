import { getPool } from "./db";
import { getAdNetworkNiche } from "./ad-network-niches";
import { defaultAdNetworkSitesQuery, loadAdNetworkSites, loadAdNetworkCheckerSite } from "./ad-networks";

/** Reports have their own sources; they are never network identity slugs. */
export function adNetworkPageKind(path: string) {
  if (path === "/ad-networks/stats") return "stats";
  if (path === "/ad-networks/niches") return "niches";
  if (path.startsWith("/ad-networks/niches/")) {
    return getAdNetworkNiche(path.slice("/ad-networks/niches/".length)) ? "niche" : "missing";
  }
  return /^\/ad-networks\/[^/]+$/.test(path) ? "network" : "missing";
}

/** Resolve a real request for each API and load its expected value directly from
 * PostgreSQL. Never use the cached getters as the source-of-truth comparison.
 */
export async function getAdNetworkApiVerification(path: string): Promise<{ requestPath: string; expected: unknown | null }> {
  const checker = path === "/api/ad-networks/site";
  if (!checker && path !== "/api/ad-networks/sites") throw new Error("Unsupported ad-network API verification");
  const parent = checker ? "ad-network-checker" : "ad-networks";
  const visible = (await getPool().query<{is_published:boolean}>(
    "select is_published from public.stack127_pages where slug=$1", [parent])).rows[0]?.is_published;

  // Inspect a recently changed site rather than whichever domain sorts first.
  // Table requests use a published network, matching the handler's visibility rules.
  const sample = (await getPool().query<{domain:string;network:string}>(`
    select p.normalized_domain as domain,n.slug as network
    from public.ad_network_publishers p join public.ad_network_publisher_relationships r on r.publisher_id=p.id
    join public.ad_networks n on n.id=r.ad_network_id
    where r.status in (${checker ? "'confirmed','stale','ended'" : "'confirmed','stale'"})
      ${checker || !visible ? "" : "and exists(select 1 from public.stack127_pages page where page.slug='ad-networks/'||n.slug and page.is_published)"}
    order by greatest(p.updated_at,r.updated_at,n.updated_at) desc,p.normalized_domain,n.slug limit 1`)).rows[0];
  if (checker) {
    const domain=sample?.domain??"stack127.com";
    const requestPath=`${path}?${new URLSearchParams({domain})}`;
    if (!visible) return {requestPath,expected:null};
    const site=await loadAdNetworkCheckerSite(domain);
    return {requestPath,expected:{domain,found:site!==null,site}};
  }
  const query=defaultAdNetworkSitesQuery(sample?.network??null);
  const params=new URLSearchParams();
  if (sample) {query.q=sample.domain.slice(0,100);params.set("network",sample.network);params.set("q",query.q);}
  return {requestPath:params.size ? `${path}?${params}` : path,expected:visible ? await loadAdNetworkSites(query) : null};
}
