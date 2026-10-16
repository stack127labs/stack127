import { domainToASCII } from "node:url";
import { isIP } from "node:net";
import { getDomain } from "tldts";
import { AD_NETWORK_SITES_PAGE_SIZE } from "../../../lib/ad-networks-report.ts";
import { getAdNetworkNiche } from "../../../lib/ad-network-niches.ts";
import type { AdNetworkNicheSlug } from "../../../lib/ad-network-niches.ts";
import type { AdNetworkSitesQuery, AdNetworkSitesSort } from "../../../lib/ad-networks-types.ts";

export class AdNetworkInputError extends Error {}
const sorts = new Set(["domain", "traffic", "oldest", "newest", "checked"]);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export function parseAdNetworkSitesParams(params: URLSearchParams): AdNetworkSitesQuery {
  const allowed = new Set(["network", "niche", "q", "sort", "page", "pageSize"]);
  for (const key of params.keys()) {
    if (!allowed.has(key) || params.getAll(key).length > 1) throw new AdNetworkInputError(`Invalid parameter: ${key}`);
  }
  const network = params.get("network") || null;
  const niche = params.get("niche") || null;
  const q = (params.get("q") ?? "").trim().toLowerCase();
  const sort = params.get("sort") ?? "domain";
  if (network && (network.length > 100 || !slug.test(network))) throw new AdNetworkInputError("Invalid network.");
  if (niche && !getAdNetworkNiche(niche)) throw new AdNetworkInputError("Invalid niche.");
  if (q.length > 100 || /[\x00-\x1f\x7f]/.test(q)) throw new AdNetworkInputError("Search must be at most 100 characters.");
  if (!sorts.has(sort)) throw new AdNetworkInputError("Invalid sort.");
  function integer(key: string, fallback: number, max: number) {
    const raw = params.get(key);
    if (raw === null) return fallback;
    if (!/^[1-9]\d*$/.test(raw) || Number(raw) > max) throw new AdNetworkInputError(`Invalid ${key}.`);
    return Number(raw);
  }
  return { network, niche: niche as AdNetworkNicheSlug | null, q, sort: sort as AdNetworkSitesSort,
    page: integer("page", 1, 10000), pageSize: integer("pageSize", AD_NETWORK_SITES_PAGE_SIZE, 100) };
}
export function parseAdNetworkSiteParams(params: URLSearchParams): string {
  if ([...params.keys()].some(key => key !== "domain") || params.getAll("domain").length !== 1) {
    throw new AdNetworkInputError("Supply one domain.");
  }
  const input = params.get("domain")?.trim() ?? "";
  if (!input || input.length > 2048 || /[\s@*]/.test(input)) throw new AdNetworkInputError("Enter a public website domain.");
  let url: URL;
  try { url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`); }
  catch { throw new AdNetworkInputError("Enter a valid domain."); }
  const domain = domainToASCII(url.hostname.toLowerCase().replace(/\.$/, "")).replace(/^www\./, "");
  const labels = domain.split(".");
  if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port || isIP(domain)
    || domain.length > 253 || labels.length < 2
    || labels.some(label => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))
    || !getDomain(domain, { allowPrivateDomains: true })
    || /\.(?:local|localhost|internal|invalid|test|example)$/.test(domain)) {
    throw new AdNetworkInputError("Enter a public website domain.");
  }
  return domain;
}
