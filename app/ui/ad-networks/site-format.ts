import { getAdNetworkNiche } from "@/lib/ad-network-niches";
import type { AdNetworkSiteRow } from "@/lib/ad-networks-types";

// Shared by the sites table and the ad network checker, so a site reads the same everywhere.
// Fixed en-US formats and UTC dates keep the server and browser output identical.

export const NOT_LISTED = "Not listed";

const dayFormat = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", timeZone: "UTC" });
const fullDayFormat = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export const formatCount = (value: number) => value.toLocaleString("en-US");

export function formatDay(iso: string | null | undefined, withYear = false) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return (withYear ? fullDayFormat : dayFormat).format(date);
}

/** Chrome's popularity groups, most visited first. Each fills one more step of a five-step meter. */
const trafficSteps: Record<string, number> = {
  "top 1k": 5,
  "top 10k": 4,
  "top 100k": 3,
  "top 1m": 2,
  "not ranked": 1,
};

/** `top-100k` or `top 100k` reads as `top 100k`. */
export const trafficText = (group: string) => group.toLowerCase().replace(/-/g, " ").replace(/(\d)m\b/, "$1M");

export function trafficStep(group: string | null) {
  return group ? trafficSteps[group.toLowerCase().replace(/-/g, " ")] ?? null : null;
}

/** Registration year and age in whole years at the last check. Age needs both dates. */
export function domainAge(row: Pick<AdNetworkSiteRow, "domain_created_on" | "last_checked_at">) {
  if (!row.domain_created_on) return null;
  const created = new Date(row.domain_created_on);
  if (Number.isNaN(created.getTime())) return null;
  const year = created.getUTCFullYear();
  const checked = row.last_checked_at ? new Date(row.last_checked_at) : null;
  if (!checked || Number.isNaN(checked.getTime())) return { year, years: null };
  let years = checked.getUTCFullYear() - year;
  if (checked.getUTCMonth() < created.getUTCMonth() || (checked.getUTCMonth() === created.getUTCMonth() && checked.getUTCDate() < created.getUTCDate())) years -= 1;
  return { year, years: Math.max(0, years) };
}

export function nicheName(slug: string | null) {
  return getAdNetworkNiche(slug)?.name ?? null;
}

/** The company named as the site's main ad manager in ads.txt, or the bare domain when it isn't one of ours. */
export function managerName(row: Pick<AdNetworkSiteRow, "managed_by" | "manager_domain">) {
  return row.managed_by?.name ?? row.manager_domain ?? null;
}

export const checkerHref = (domain: string) => `/ad-network-checker?site=${encodeURIComponent(domain)}`;
