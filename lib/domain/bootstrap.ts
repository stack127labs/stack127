/**
 * RDAP endpoint discovery: committed IANA bootstrap, then reviewed overrides,
 * then nothing. Nothing here touches the network.
 */

import bootstrapData from "./data/rdap-bootstrap.json" with { type: "json" };
import overrideData from "./data/rdap-overrides.json" with { type: "json" };
import tldData from "./data/tlds.json" with { type: "json" };

const services = bootstrapData.services as Record<string, string>;
const overrides = overrideData.overrides as Record<
  string,
  { url: string; operator: string; verifiedWith: string; verifiedAt: string }
>;
const rootZoneTlds = tldData.tlds as string[];

export const BOOTSTRAP_PUBLICATION = bootstrapData.publication as string;
export const BOOTSTRAP_FETCHED_AT = bootstrapData.fetchedAt as string;
export const TLD_LIST_VERSION = tldData.version as string;

export type CoverageSource = "bootstrap" | "override" | "none";

export type TldCoverage = {
  tld: string;
  source: CoverageSource;
  url: string | null;
  /** Named only for overrides, where a human chose the endpoint. */
  operator: string | null;
  /** True when the TLD is not in the current root zone at all. */
  unknownTld: boolean;
};

export function rdapServiceForTld(tld: string): TldCoverage {
  const key = tld.toLowerCase().replace(/^\./, "");
  const unknownTld = !rootZoneTlds.includes(key);

  const bootstrapUrl = services[key];
  if (bootstrapUrl) return { tld: key, source: "bootstrap", url: bootstrapUrl, operator: null, unknownTld };

  const override = overrides[key];
  if (override) {
    return { tld: key, source: "override", url: override.url, operator: override.operator, unknownTld };
  }

  return { tld: key, source: "none", url: null, operator: null, unknownTld };
}

export type CoverageSummary = {
  rootZoneTlds: number;
  bootstrapCovered: number;
  overrideCovered: number;
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
  for (const tld of rootZoneTlds) {
    if (services[tld]) bootstrapCovered += 1;
    else if (overrides[tld]) overrideCovered += 1;
  }
  cachedSummary = {
    rootZoneTlds: rootZoneTlds.length,
    bootstrapCovered,
    overrideCovered,
    covered: bootstrapCovered + overrideCovered,
    uncovered: rootZoneTlds.length - bootstrapCovered - overrideCovered,
    checkedAt: BOOTSTRAP_FETCHED_AT,
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
