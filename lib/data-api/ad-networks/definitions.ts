export const definitions = {
  listed: "A site is listed when its relationship status is confirmed or stale. A site may be listed for several networks.",
  managed: "A managed site has a listed relationship with relationship_type = primary_or_exclusive_manager. Its own ads.txt names that network as manager; this does not prove exclusivity.",
  domain_age: "RDAP domain_created_on, not the site's launch date. Age buckets use completed years as of the UTC query date; medians use the public page's age()/31557600 definition. Unknown dates stay unknown.",
  top_million: "Chrome UX Report traffic_group in (top-10k, top-100k, top-1m). These groups are exclusive. The imported CrUX month is not stored in the serving tables and is unknown here.",
  not_ranked: "Not ranked means absent from the imported CrUX list, not small or zero traffic.",
  niches: "stack127's single-label classification; about 88% clearly right in an 80-site hand check. It is an estimate, not an audited industry taxonomy.",
  movement: "Observed joins and departures, not contract dates. newly_found is discovery, not a join. Baseline imports are excluded.",
  shares: "Group counts are distinct sites. Share is count / that network's filtered distinct-site base, including unknown classifications. Global totals deduplicate across networks; adding network counts can double-count sites.",
};
export const movementWarning = 'STRONG WARNING: join/leave history starts around 2026-10-19. Checker faults caused false departures; blocked/challenged homepages and deferred/consent-held scripts were repaired on 2026-11-13/14. The conservative fault search window begins 2026-09-28; repairs do not prove all historical movements. Do not present these counts as reliable growth, churn, or market share changes.';
export const caveats = [
  'Observed first-party signals, not a complete customer census. Ezoic and some manager counts are minimums.',
  'ads.txt lists authorized sellers; it does not prove revenue, exclusivity, or an active contract. AdSense and page-signature networks also use homepage checks.',
  'Stale means retained after an inconclusive check, not freshly confirmed. Last successful check is not a freshness guarantee for every field.',
  'Unknown values remain null. Monthly traffic units and alternative joining rules are not interchangeable; read each network’s cited rules.',
  movementWarning,
];
export const sourceUrl = 'https://stack127.com/ad-networks';
