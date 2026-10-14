/**
 * Registration endpoint discovery: IANA RDAP, reviewed RDAP, reviewed WHOIS.
 * Nothing here touches the network. Unreviewed WHOIS discovery never enables it.
 */

import bootstrapData from "./data/rdap-bootstrap.json" with { type: "json" };
import overrideData from "./data/rdap-overrides.json" with { type: "json" };
import tldData from "./data/tlds.json" with { type: "json" };
import whoisData from "./data/whois-reviewed.json" with { type: "json" };
import whoisDiscovery from "./data/whois-servers.json" with { type: "json" };
import type { WhoisService } from "./whois-parser.ts";

const services = bootstrapData.services as Record<string, string>;
const overrides = overrideData.overrides as Record<
  string,
  { url: string; operator: string; verifiedWith: string; verifiedAt: string }
>;
const rootZoneTlds = tldData.tlds as string[];
const rootZoneSet = new Set(rootZoneTlds);

export const BOOTSTRAP_PUBLICATION = bootstrapData.publication as string;
export const BOOTSTRAP_FETCHED_AT = bootstrapData.fetchedAt as string;
export const TLD_LIST_VERSION = tldData.version as string;

export type CoverageSource = "bootstrap" | "override" | "whois" | "none";

export type TldCoverage = {
  tld: string;
  source: CoverageSource;
  url: string | null;
  host: string | null;
  /** Named only for overrides, where a human chose the endpoint. */
  operator: string | null;
  /** True when the TLD is not in the current root zone at all. */
  unknownTld: boolean;
};

const whoisServices = whoisData.services as Record<string, WhoisService>;
const discoveredWhois = whoisDiscovery.services as Record<string, string | null>;

export function whoisServiceForTld(tld: string): WhoisService | null {
  const key = tld.toLowerCase().replace(/^\./, "");
  const service = whoisServices[key];
  if (!rootZoneSet.has(key) || services[key] || overrides[key] || !service) return null;
  if (discoveredWhois[key] !== service.server) return null;
  // Missing verification is never coverage, even if an entry was added by mistake.
  if (!service.server || !service.verifiedWith || !service.notFoundWith || !service.notFoundPattern || !service.verifiedAt) return null;
  return service;
}

export function registrationServiceForTld(tld: string): TldCoverage {
  const key = tld.toLowerCase().replace(/^\./, "");
  const unknownTld = !rootZoneSet.has(key);

  const bootstrapUrl = services[key];
  if (bootstrapUrl) return { tld: key, source: "bootstrap", url: bootstrapUrl, host: new URL(bootstrapUrl).hostname, operator: null, unknownTld };

  const override = overrides[key];
  if (override) {
    return { tld: key, source: "override", url: override.url, host: new URL(override.url).hostname, operator: override.operator, unknownTld };
  }

  const whois = whoisServiceForTld(key);
  if (whois) return { tld: key, source: "whois", url: `whois://${whois.server}/`, host: whois.server, operator: null, unknownTld };

  return { tld: key, source: "none", url: null, host: null, operator: null, unknownTld };
}

/** Compatibility name; callers should use registrationServiceForTld for new work. */
export const rdapServiceForTld = registrationServiceForTld;

export type CoverageSummary = {
  rootZoneTlds: number;
  bootstrapCovered: number;
  overrideCovered: number;
  whoisCovered: number;
  covered: number;
  uncovered: number;
  checkedAt: string;
  tldListVersion: string;
};

let cachedSummary: CoverageSummary | null = null;

/**
 * The single source of truth for coverage numbers.
 *
 * Every page reads this rather than quoting a constant, because overrides change
 * the real number and a page that prints a stale figure while successfully
 * checking an overridden TLD contradicts itself.
 */
export function coverageSummary(): CoverageSummary {
  if (cachedSummary) return cachedSummary;
  let bootstrapCovered = 0;
  let overrideCovered = 0;
  let whoisCovered = 0;
  for (const tld of rootZoneTlds) {
    if (services[tld]) bootstrapCovered += 1;
    else if (overrides[tld]) overrideCovered += 1;
    else if (whoisServiceForTld(tld)) whoisCovered += 1;
  }
  cachedSummary = {
    rootZoneTlds: rootZoneTlds.length,
    bootstrapCovered,
    overrideCovered,
    whoisCovered,
    covered: bootstrapCovered + overrideCovered + whoisCovered,
    uncovered: rootZoneTlds.length - bootstrapCovered - overrideCovered - whoisCovered,
    checkedAt: [BOOTSTRAP_FETCHED_AT, tldData.fetchedAt, whoisDiscovery.fetchedAt,
      ...Object.values(overrides).map(entry => entry.verifiedAt),
      ...Object.values(whoisServices).map(entry => entry.verifiedAt)].sort().at(-1) ?? BOOTSTRAP_FETCHED_AT,
    tldListVersion: TLD_LIST_VERSION,
  };
  return cachedSummary;
}

export function allRootZoneTlds(): string[] {
  return rootZoneTlds;
}

export function overrideEntries() {
  return Object.entries(overrides).map(([tld, entry]) => ({ tld, ...entry }));
}
