import type { AdNetworkNicheSlug } from "./ad-network-niches";

/** API dates are ISO strings. Null means the field has not been collected. */
export type AdNetworkRef = { slug: string; name: string };
export type AdNetworkRelationshipType = "primary_or_exclusive_manager" | "active_network_use" | "unknown";
export type AdNetworkRelationshipStatus = "confirmed" | "stale" | "ended";
export type AdNetworkListRow = AdNetworkRef & {
  id: string; official_url: string | null; summary: string | null;
  verified_count: number; listed_count: number; stale_count: number; ended_count: number;
};
export type AdNetworkSiteRow = {
  domain: string; publisher_name: string | null; niche: AdNetworkNicheSlug | null;
  traffic_group: string | null; domain_created_on: string | null; platform: string | null;
  /** MANAGERDOMAIN evidence, with a confirmed manager relationship as fallback. */
  managed_by: AdNetworkRef | null; manager_domain: string | null;
  last_checked_at: string | null; favicon: string | null; networks: AdNetworkRef[];
};
export type AdNetworkSitesSort = "domain" | "traffic" | "oldest" | "newest" | "checked";
export type AdNetworkSitesQuery = {
  network: string | null; niche: AdNetworkNicheSlug | null; q: string;
  sort: AdNetworkSitesSort; page: number; pageSize: number;
};
export type AdNetworkSitesAvailability = {
  availableColumns: ("domain" | "niche" | "traffic" | "domain_age" | "platform" | "manager" | "checked" | "network" | "publisher")[];
  availableSorts: AdNetworkSitesSort[];
  availableFilters: ("niche" | "network")[];
  filters: { niches: { slug: string; name: string; line: string }[]; networks: AdNetworkRef[] };
};
export type AdNetworkSitesResponse = AdNetworkSitesAvailability & {
  effectiveSort: AdNetworkSitesSort;
  rows: AdNetworkSiteRow[]; total: number; page: number; pageSize: number; totalPages: number;
};
export type AdNetworkCount = { key: string; label: string; count: number; share?: number };
export type AdNetworkShare = AdNetworkRef & { count: number; share: number };
export type AdNetworkDailyCount = { date: string; listed: number; confirmed: number; stale: number };
export type AdNetworkMovementCounts = { joined: number; left: number; newly_found: number; baseline: number };
export type AdNetworkMovement = { date: string; joined: number; left: number; newly_found?: number; baseline?: number };
/** An observed manager replacement, not merely two networks appearing on one site. */
export type AdNetworkSwitch = { from: AdNetworkRef; to: AdNetworkRef; count: number };
export type AdNetworkTrafficShare = { traffic_group: string; sites: number; networks: AdNetworkShare[] };
/** Additive chart data: optional properties keep existing page fixtures source-compatible.
 * Loaders always populate them, with null/empty for a gated block. */
export type AdNetworkDomainAgeStrip = {
  measured: number;
  p25_year: number; median_year: number; p75_year: number;
  middle_half: [number, number];
  oldest: { domain: string; year: number; registered_on: string };
  newest: { domain: string; year: number; registered_on: string };
  bins: { year: number; count: number }[]; bin_years: number;
};
export type AdNetworkSwitchFlowSide = AdNetworkRef & { label: string; count: number };
export type AdNetworkSwitchFlow = {
  center: AdNetworkRef;
  came_from: AdNetworkSwitchFlowSide[]; went_to: AdNetworkSwitchFlowSide[];
  incoming_total: number; outgoing_total: number;
};
export type AdNetworkMovementPeriod = {
  key: string; label: string; days: 30 | 90; interval: "day" | "week";
  points: { date: string; label: string; joined: number; left: number }[];
  startLabel: string; endLabel: string;
  joined: number; left: number; net: number;
};
export type AdNetworkArrival = { site: AdNetworkSiteRow; network: AdNetworkRef; observed_at: string };
export type AdNetworkStatsReport = {
  domain_age_strip?: AdNetworkDomainAgeStrip | null;
  switch_flow?: AdNetworkSwitchFlow | null;
  movement_periods?: AdNetworkMovementPeriod[];
  platform_mix?: AdNetworkCount[];

  confirmed_share: number | null; change_year: number | null; networks_tracked: number;
  updated_at: string | null; verification_methods: AdNetworkCount[];
  movement_totals?: AdNetworkMovementCounts;
  listed: number; confirmed: number; rank: number | null; change_90_days: number | null;
  history: AdNetworkDailyCount[]; ranking: AdNetworkShare[]; niches: AdNetworkCount[];
  traffic: AdNetworkCount[]; publishers: AdNetworkCount[]; movements: AdNetworkMovement[];
  switches: AdNetworkSwitch[]; domain_age: AdNetworkCount[]; median_domain_age: number | null; median_domain_registered_year: number | null;
  platforms: AdNetworkCount[]; domain_endings: AdNetworkCount[];
  managers: AdNetworkCount[]; also_runs: AdNetworkShare[];
};
export type AdNetworkPageData = {
  network: AdNetworkListRow; sites: AdNetworkSitesResponse; stats: AdNetworkStatsReport;
};
export type AdNetworkNicheRow = {
  slug: AdNetworkNicheSlug; name: string; line: string; listed: number; confirmed: number;
  share: number; networks: AdNetworkShare[]; easiest_to_join: AdNetworkJoiningRule | null;
};
export type AdNetworkNichesPageData = {
  listed: number; confirmed: number; classified: number; unclassified: number;
  niches: AdNetworkNicheRow[]; networks: AdNetworkRef[]; niche_coverage: number | null; updated_at: string | null;
};
export type AdNetworkNichePageData = {
  domain_age_strip?: AdNetworkDomainAgeStrip | null;
  newest_arrivals?: AdNetworkArrival[];
  newest_sites: (AdNetworkSiteRow & { first_confirmed_at: string })[];
  niche: AdNetworkNicheRow; sites: AdNetworkSitesResponse; traffic: AdNetworkTrafficShare[];
  switches: AdNetworkSwitch[]; newest: (AdNetworkRef & { sites: AdNetworkSiteRow[] })[];
};
export type AdNetworkStatsPageData = {
  domain_age_strip?: AdNetworkDomainAgeStrip | null;
  domain_age_by_network?: (AdNetworkRef & { strip: AdNetworkDomainAgeStrip })[];
  confirmed_share: number | null; multiple_networks_share: number | null; updated_at: string | null;
  joining_rules: (AdNetworkJoiningRule & { sites: number })[];
  verification_methods: AdNetworkCount[];
  check_queue: { total: number; checked: number; waiting: number; checked_share: number | null } | null;
  ads_txt_metrics: { manager_share: number; broken_share: number; median_lines: number | null } | null;
  movements?: AdNetworkMovement[]; movement_totals?: AdNetworkMovementCounts;
  listed: number; confirmed: number; networks_tracked: number; multiple_networks: number;
  market_share: AdNetworkShare[];
  history: (AdNetworkRef & { history: AdNetworkDailyCount[] })[];
  net_change: (AdNetworkRef & { change: number })[]; switches: AdNetworkSwitch[];
  traffic: AdNetworkTrafficShare[]; networks_per_site: AdNetworkCount[];
  pairs: { first: AdNetworkRef; second: AdNetworkRef; count: number }[];
  median_domain_age: (AdNetworkRef & { years: number })[];
  wordpress_share: AdNetworkShare[];
  /** Manager share is with_manager / measured, both restricted to sites with a summary. */
  ads_txt: { with_manager: number; median_lines: number | null; with_broken_lines: number; measured: number; file_sizes: AdNetworkCount[] };
  freshness: { checked_last_7_days: number; checked_share: number | null; new_last_week: number | null; weekly: { week: string; discovered: number; checker: number }[] };
};
export type AdNetworkAdsTxtSummary = {
  lines: number; companies: number; direct: number; reseller: number; invalid: number;
  top_sellers: { name: string; lines: number }[];
  /** Stored source excerpt: first 10 lines plus MANAGERDOMAIN, maximum 4096 UTF-8 bytes. */
  preview?: string | null;
  /** Complete distinct ad-system domains, required for the other-sellers count. */
  seller_domains?: string[];
};
export type AdNetworkSiteRelationship = AdNetworkRef & {
  /** Network identity domains for matching ads.txt seller lines; filter status before highlighting. */
  ad_system_domains?: string[];
  /** Raw stored evidence method; null means unknown, never infer page-only evidence as ads.txt. */
  verification_method?: string | null;
  status: AdNetworkRelationshipStatus; relationship_type: AdNetworkRelationshipType;
  first_confirmed_at: string | null; last_confirmed_at: string | null; ended_at: string | null;
};
export type AdNetworkHistoryObservation = {
  date: string; event: "baseline" | "newly_found" | "joined" | "left"; network: AdNetworkRef;
  relationship_type?: AdNetworkRelationshipType;
};
export type AdNetworkCheckerEvent = {
  date: string; kind: "added" | "dropped" | "switched" | "first_check";
  /** Null when the first recorded check has no single network. */
  network: AdNetworkRef | null;
  from_network?: AdNetworkRef;
  /** Networks recorded on the first observed check, when available. */
  networks?: AdNetworkRef[];
};
export type AdNetworkCheckerSiteView = {
  events?: AdNetworkCheckerEvent[];
  site: AdNetworkSiteRow; relationships: AdNetworkSiteRelationship[];
  /** Null until the ads-txt-summary enrichment run stores the source excerpt. */
  ads_txt_preview?: string | null;
  /** Niche matches when available, otherwise sites sharing a confirmed network. */
  basis?: "niche" | "network";
  ads_txt_summary: AdNetworkAdsTxtSummary | null; similar_sites: AdNetworkSiteRow[];
  /** Dates are observations from our verifier, not an inferred lifetime history. */
  history_source: "observed";
  history: AdNetworkHistoryObservation[];
  other_sellers: number | null; direct_share: number | null; reseller_share: number | null;
  domain_age_years: number | null;
  similar_available_columns: AdNetworkSitesAvailability["availableColumns"];
};
export type AdNetworkSiteResponse = { domain: string; found: boolean; site: AdNetworkCheckerSiteView | null };

export type AdNetworkJoiningRule = AdNetworkRef & { amount: number; unit: "sessions" | "pageviews" | "visitors"; label?: string };
export type AdNetworkDirectorySort = "most-sites" | "easiest-to-join" | "by-niche";
export type AdNetworkDirectoryCard = AdNetworkListRow & {
  confirmed_share: number | null; rank: number | null; minTraffic: AdNetworkJoiningRule | null;
};
export type AdNetworkDirectoryData = {
  networks: AdNetworkDirectoryCard[]; listed: number; confirmed: number; networks_tracked: number;
  confirmed_share: number | null; updated_at: string | null;
  availableSorts: AdNetworkDirectorySort[];
  availableFilters: ("niche")[];
  most_sites: AdNetworkDirectoryCard[]; easiest_to_join: AdNetworkDirectoryCard[];
  by_niche: { niche: AdNetworkNicheRow; networks: (AdNetworkDirectoryCard & { niche_count: number; niche_share: number })[] }[];
};
