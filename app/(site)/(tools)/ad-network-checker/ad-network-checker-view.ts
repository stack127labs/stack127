import type {
  AdNetworkCheckerSiteView,
  AdNetworkRef,
  AdNetworkSiteRelationship,
} from "@/lib/ad-networks-types";

export const EXAMPLE_SITE = "collegefashion.net";
export const NOT_LISTED = "Not listed";

export type SiteInput = { domain: string; ok: true } | { message: string; ok: false };

const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const ENDING = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

/** Accepts a bare domain or any URL on the site, and returns the domain we store it under. */
export function normalizeSite(raw: string): SiteInput {
  const text = raw.trim();
  if (!text) return { message: "Enter a website.", ok: false };
  let host: string;
  try {
    host = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `http://${text}`).hostname;
  } catch {
    return { message: "Enter a domain such as example.com.", ok: false };
  }
  host = host.toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
  const labels = host.split(".");
  if (
    host.length > 253
    || labels.length < 2
    || !labels.every((label) => LABEL.test(label))
    || !ENDING.test(labels[labels.length - 1])
  ) {
    return { message: "Enter a domain such as example.com.", ok: false };
  }
  return { domain: host, ok: true };
}

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC", year: "numeric" });
const fullDate = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", timeZone: "UTC", year: "numeric" });

/** `Mar 2021`. */
export function formatMonth(iso: string | null) {
  return iso ? monthYear.format(new Date(iso)) : NOT_LISTED;
}

/** `Oct 12, 2026`. */
export function formatDay(iso: string | null) {
  return iso ? fullDate.format(new Date(iso)) : NOT_LISTED;
}

/** `2026-10`, the month key the history timeline takes. */
export const monthKey = (iso: string) => iso.slice(0, 7);

/** `Mediavine`, `Mediavine and Amazon APS`, `A, B, and C`. Pass `or` for `A, B, or C`. */
export function names(list: readonly AdNetworkRef[], join: "and" | "or" = "and") {
  if (list.length <= 2) return list.map((item) => item.name).join(` ${join} `);
  return `${list.slice(0, -1).map((item) => item.name).join(", ")}, ${join} ${list[list.length - 1].name}`;
}

const statusOrder = { confirmed: 0, stale: 1, ended: 2 } as const;

/** The manager first, then current networks, then ones not seen lately, then ended ones. */
export function sortedRelationships(view: AdNetworkCheckerSiteView) {
  const manager = view.site.managed_by?.slug;
  return [...view.relationships].sort((a, b) =>
    Number(b.slug === manager) - Number(a.slug === manager)
    || statusOrder[a.status] - statusOrder[b.status]
    || a.name.localeCompare(b.name));
}

/** True when this network is the site's main ad manager. */
export const isManager = (view: AdNetworkCheckerSiteView, relationship: AdNetworkRef) =>
  view.site.managed_by?.slug === relationship.slug;

/**
 * How we confirmed a network, from its stored verification method. Unknown methods stay unknown,
 * and page-only evidence never reads as an ads.txt statement.
 */
export type Evidence = "manager" | "seller" | "page" | "unknown";

export function evidenceOf(relationship: AdNetworkSiteRelationship): Evidence {
  switch (relationship.verification_method) {
    case "ads_txt_managerdomain": return "manager";
    case "ads_txt_and_adsense_account":
    case "ads_txt_and_page_signature": return "seller";
    case "page_signature": return "page";
    default: return "unknown";
  }
}

/** What the site's ads.txt says about one network (mockup column), worded to match the evidence. */
export function saysLabel(view: AdNetworkCheckerSiteView, relationship: AdNetworkSiteRelationship) {
  const evidence = evidenceOf(relationship);
  if (evidence === "page" && relationship.status !== "ended") return "Not listed. Its page ad code shows it";
  if (evidence === "page" || evidence === "unknown") return NOT_LISTED;
  if (relationship.status === "ended") return "No longer lists it";
  if (evidence === "seller") return "Allows it to sell ad space";
  return isManager(view, relationship) ? "Names it as the ad manager" : "Names it as an ad manager";
}

export function statusLabel(relationship: AdNetworkSiteRelationship) {
  if (relationship.status === "confirmed") return "Confirmed live";
  if (relationship.status === "stale") return "Not seen lately";
  return relationship.ended_at ? `Ended ${formatMonth(relationship.ended_at)}` : "Ended";
}

/** Who to count: `it`, `both`, or `all 6`. */
const countWord = (count: number) => (count === 1 ? "it" : count === 2 ? "both" : `all ${count}`);

/** Each evidence group as a first sentence about the site, or a later one that adds to it. */
const sentences: Record<Evidence, (list: AdNetworkRef[], domain: string, first: boolean) => string> = {
  manager: (list, domain, first) => `${first ? `${domain}'s ads.txt file names` : " Its ads.txt file also names"} ${names(list)} as ${list.length === 1 && first ? "its ad manager" : list.length === 1 ? "an ad manager" : "ad managers"}.`,
  seller: (list, domain, first) => (first ? `${domain}'s ads.txt file lets ${names(list)} sell its ad space.` : ` It also lets ${names(list)} sell its ad space.`),
  page: (list, domain, first) => (first ? `The ad code on ${domain}'s pages shows ${names(list)}.` : ` The ad code on its pages shows ${names(list)}.`),
  unknown: (list, domain, first) => (first ? `We confirmed ${names(list)} on ${domain}.` : ` We also confirmed ${names(list)}.`),
};

/**
 * The lead under the site's name, from the mockup: who runs its ads, who else sells its space,
 * and when we confirmed them. Each network is worded by how we confirmed it, and each part
 * appears only when the data behind it exists.
 */
export function leadFor(view: AdNetworkCheckerSiteView) {
  const { domain, managed_by: manager, manager_domain: managerDomain } = view.site;
  const rows = sortedRelationships(view);
  const current = rows.filter((row) => row.status === "confirmed");
  const stale = rows.filter((row) => row.status === "stale");
  // "Runs" needs the MANAGERDOMAIN line: the site's own, or the relationship's stored method.
  const lead = manager ? current.find((row) => row.slug === manager.slug && (managerDomain || evidenceOf(row) === "manager")) : undefined;
  const parts: { manager?: AdNetworkRef; text: string }[] = [];
  if (lead) parts.push({ manager: lead, text: `, and its ads.txt file names ${lead.name} as its ad manager.` });

  for (const evidence of ["manager", "seller", "page", "unknown"] as const) {
    const list = current.filter((row) => row !== lead && evidenceOf(row) === evidence);
    if (list.length) parts.push({ text: sentences[evidence](list, domain, parts.length === 0) });
  }
  if (!parts.length) parts.push({ text: `We haven't confirmed a network we track on ${domain} in our latest checks.` });

  const dates = current.map((row) => row.last_confirmed_at).filter((value): value is string => Boolean(value)).sort();
  if (dates.length) {
    const first = formatDay(dates[0]);
    const last = formatDay(dates[dates.length - 1]);
    const who = countWord(current.length);
    parts.push({ text: first === last ? ` We confirmed ${who} live on ${last}.` : ` We last confirmed ${who} live between ${first} and ${last}.` });
  }
  if (stale.length) parts.push({ text: ` ${names(stale)} ${stale.length === 1 ? "hasn't" : "haven't"} shown up in our latest checks.` });
  return parts;
}

export type HistoryEvent = { date: string; text: string };

/**
 * The site's network changes, newest first, from the events the API records (mockup events list).
 * A move from one network to another comes only from the API's `switched` event. The first
 * check reads as our starting point, since the networks on it may have been there long before.
 */
export function eventsFor(view: AdNetworkCheckerSiteView): HistoryEvent[] {
  const events = [...(view.events ?? [])].sort((a, b) =>
    Number(a.kind === "first_check") - Number(b.kind === "first_check") || b.date.localeCompare(a.date));
  return events.map((event) => {
    const date = formatMonth(event.date);
    if (event.kind === "switched" && event.from_network && event.network) return { date, text: `Moved from ${event.from_network.name} to ${event.network.name}` };
    if (event.kind === "first_check") {
      const seen = event.networks?.length ? event.networks : event.network ? [event.network] : [];
      return { date, text: seen.length ? `Our first check, with ${names(seen)}` : "Our first check" };
    }
    const name = event.network?.name ?? event.from_network?.name;
    if (!name) return null;
    return { date, text: event.kind === "dropped" ? `Dropped ${name}` : `Added ${name}` };
  }).filter((event): event is HistoryEvent => event !== null);
}

/** Real changes, not only what our first check found. */
export const hasChanges = (view: AdNetworkCheckerSiteView) =>
  (view.events ?? []).some((event) => event.kind !== "first_check") || view.relationships.some((item) => item.status === "ended");

/** The day of our first stored check on this site, when the history starts. */
export function firstCheck(view: AdNetworkCheckerSiteView) {
  return view.events?.find((event) => event.kind === "first_check")?.date ?? null;
}

/** The networks the similar sites were matched on, the same rule as the site view loader. */
export function similarNetworks(view: AdNetworkCheckerSiteView): AdNetworkRef[] {
  const current = sortedRelationships(view).filter((item) => item.status === "confirmed");
  const manager = view.site.managed_by;
  return manager && current.some((item) => item.slug === manager.slug) ? [manager] : current;
}

export function adsTxtUrl(domain: string) {
  return `https://${domain}/ads.txt`;
}
