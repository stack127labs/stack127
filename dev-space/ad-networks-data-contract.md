# Ad networks data contract

Use the loaders in `lib/ad-networks.ts`; types are in `lib/ad-networks-types.ts`. Render an optional block only when its value is non-null or its array is nonempty. Gates and chart shaping live in `lib/ad-networks-report.ts`. Page workers can replace `report-data.ts` imports with that file, including `trafficLabel`.

Development checked 2026-10-16: 45 networks; 35,816 unique listed sites; 35,719 confirmed sites; 40,342 confirmed and 247 stale links. The 35,953 publisher rows include ended-only sites. Niche, traffic, age, platform, publisher names and summaries have zero populated rows. One daily snapshot date exists. Counts below always mean unique sites unless a row explicitly says relationships.

Shared rules:

- `listed` includes confirmed and stale links; confirmed site totals count a site once if any link is confirmed. Network totals count that network's links. Percentages are 0 to 100.
- Niche comparisons need at least **100 classified sites and 80% classification coverage**, in the comparison's scope. A niche page returns null before the whole-directory gate passes. The separate publication rule remains 500 sites for indexing.
- Other enrichment columns/series appear when at least one value exists in their scope. Missing cells can say “Not listed”. No missing datum becomes zero. All-unknown manager groups hide.
- Trends contain exact month-end observations only and require two points. No interpolation. `change_year` requires a snapshot on the exact year-ago date (February 28 for a leap-day anniversary). Keep the “sites in a year” label only with that field. `change_90_days` requires a 90-day-old snapshot. Market `net_change` then counts observed joins minus departures, excluding imports.
- Movement/newest/weekly arrival counts exclude `baseline`. Switches require one unambiguous manager departure/arrival within seven days. Current overlapping networks never imply a switch.
- `minTraffic` comes from the read-only `network-facts.ts` exception. Null means unknown or a non-traffic rule, never zero. Easiest-to-join sorts known amounts ascending, retaining their units; sessions, visitors and pageviews are not converted or claimed equivalent.
- All site tables use `defaultAdNetworkSitesQuery()` (10 rows), `getAdNetworkSites()` and the response's `availableColumns`, `availableSorts`, `availableFilters`, `filters`, `effectiveSort`. Scope controls ignore the search term and current page. Unavailable requested sorts safely fall back to `domain`.
- DB runs below are the tracker runs; this task does not activate their timers. The check queue is the **Supabase queue**, not the larger homelab candidate queue.

## Directory: `/ad-networks`

Loader: `getAdNetworkDirectoryData()`.

| Mockup element | Loader field | Dev now | Gate | DB run |
| --- | --- | --- | --- | --- |
| Intro totals, count on Show all, updated date | `listed`, `confirmed`, `networks_tracked`, `updated_at` | yes | date non-null | sync / verifier |
| Cards: listed, confirmed, confirmation meter, order/rank | `networks[].listed_count`, `verified_count`, `confirmed_share`, `rank` | yes | share/rank non-null | sync |
| Most sites sort | `most_sites`, `availableSorts` | yes | nonempty | sync |
| Easiest to join sort / card joining rule | `easiest_to_join`, `networks[].minTraffic` | yes | known `minTraffic` only | reviewed code facts |
| By niche sort, niche filter, groups, network's count/share in niche | `by_niche[].niche`, `.networks[].niche_count`, `.niche_share`, `availableFilters` | no | niche coverage | niche |
| Search network names | `networks` | yes | nonempty | network identity sync |
| Search sites / niches | `getAdNetworkSites({...query,q})`; `getAdNetworkNichesPageData().niches` | sites yes; niches no | same site controls / niche coverage | sync / niche |

## Network: `/ad-networks/<network>`

Loader: `getAdNetworkPageData(slug)`; null means unknown network.

| Mockup element | Loader field | Dev now | Gate | DB run |
| --- | --- | --- | --- | --- |
| Intro and headline counts, confirmed share, updated date, rank/of networks | `network.listed_count`, `.verified_count`; `stats.confirmed_share`, `.updated_at`, `.rank`, `.networks_tracked` | yes | rank/share/date non-null | sync / verifier |
| Site rows/search/paging (10), network/manager/checked columns | `sites.rows`, `.total`, `.page`, `.totalPages`, control metadata | yes | advertised columns and options only | sync / verifier |
| Niche column/filter; traffic column/sort; oldest/newest/age; platform | `sites` control metadata and row fields | no | niche coverage; other fields at least one measured value | niche / traffic / domain-age / platform |
| Sites in a year; sites over time | `stats.change_year`; `.history` | no | year-ago snapshot; two month ends | sync daily snapshot / reviewed Wayback backfill |
| Rank among networks | `stats.ranking` | yes | nonempty; highlight current slug | sync |
| Top niches | `stats.niches` (`count`, `share`) | no | network niche coverage | niche |
| Traffic distribution | `stats.traffic` (`count`, `share`) | no | measured groups only | traffic |
| Biggest business publishers | `stats.publishers` | no | business suffix evidence only; personal/ambiguous names excluded | publisher-names |
| Joined/left by day, 30/90-day views | `stats.movements`, `.movement_totals` | departures yes | no baseline/newly-found counted as joined; array nonempty | verifier observations / sync |
| Switches from/to | `stats.switches` | no | real unambiguous manager replacements | verifier / sync |
| Domain age strip/median | `stats.domain_age`, `.median_domain_age` | no | measured RDAP dates | domain-age |
| Platform distribution | `stats.platforms` (`count`, `share`) | no | measured platforms | platform |
| Domain endings | `stats.domain_endings` (`count`, `share`) | yes | public suffix list; real domains | sync |
| Ad manager meter/mix | `stats.managers` (`count`, `share`; this-network/another-network/not-listed) | yes | at least one manager resolved from MANAGERDOMAIN/retained confirmation | verifier |
| Also runs overlap | `stats.also_runs` (`count`, `share`) | yes | listed relationships on same sites | sync |
| Verification method mix | `stats.verification_methods` | yes | confirmed relationship method present | verifier |
| Joining / pay / rules / service numbers | read-only `network-facts.ts` | yes where reviewed | null hides number | code research exception |

## Niches: `/ad-networks/niches`

Loader: `getAdNetworkNichesPageData()`.

| Mockup element | Loader field | Dev now | Gate | DB run |
| --- | --- | --- | --- | --- |
| Intro listed/classified/unsorted/niche count/date | `listed`, `classified`, `unclassified`, `niches.length`, `updated_at`, `niche_coverage` | totals yes; niche block no | `niche_coverage !== null` | niche / sync |
| Treemap | `niches[].listed`, `.name`, `.slug` | no | niche coverage | niche |
| Search, most-sites/A-to-Z sorts | `niches` (already sorted by listed) | no | `niches` nonempty | niche |
| Network filter choices | `networks` | no | niche coverage and network has sites | niche / sync |
| Niche table count/live/share | `niches[].listed`, `.confirmed`, `.share` | no | niche coverage; share denominator is all listed sites | niche / sync |
| Top three networks, shares, heatmap cells | `niches[].networks` (`count`, `share`) | no | niche coverage; share denominator is that niche's sites | niche / sync |
| Easiest of the top three | `niches[].easiest_to_join` | no | known minimum among top three, else null | niche + reviewed code facts |

## Niche: `/ad-networks/niches/<niche>`

Loader: `getAdNetworkNichePageData(slug)`; null when invalid or gated.

| Mockup element | Loader field | Dev now | Gate | DB run |
| --- | --- | --- | --- | --- |
| Intro count/live/leading network | `niche.listed`, `.confirmed`, `.networks[0]` | no | niche page exists after coverage gate | niche / sync |
| Site table, network filter, search, 10-row paging | `sites` including control metadata | no | niche page + advertised controls | niche / sync |
| Traffic/oldest/newest sorts, traffic/age/platform columns | `sites.availableSorts`, `.availableColumns` | no | at least one measured field in niche | traffic / domain-age / platform |
| Network ladder count/share/rules, most-used sort | `niche.networks`; directory `networks[].minTraffic` | no | positive niche counts; rule non-null | niche + code facts |
| Easiest-to-join ladder order | directory `easiest_to_join`, intersect `niche.networks` | no | known minimum and positive niche count | niche + code facts |
| Size stacks | `traffic` | no | measured traffic + resolved main manager | traffic / verifier |
| Switches, last 90 days | `switches` | no | real manager replacement | verifier / sync |
| Newest sites overall / per network | `newest_sites[].first_confirmed_at`; `newest[].sites` | no | observed joined/newly-found arrival, never baseline | verifier / sync |

## Stats: `/ad-networks/stats`

Loader: `getAdNetworkStatsPageData()`.

| Mockup element | Loader field | Dev now | Gate | DB run |
| --- | --- | --- | --- | --- |
| Totals, confirmed share, 2+ count/share, updated date | `listed`, `confirmed`, `confirmed_share`, `networks_tracked`, `multiple_networks`, `multiple_networks_share`, `updated_at` | yes | share/date non-null | sync / verifier |
| Market share/ranking | `market_share` | yes | nonempty | sync |
| Top-five sites at month end | `history[].history` | no | each series has two actual month ends | sync daily snapshots |
| Net change, last 90 days | `net_change` | no | 90-day observation history; actual joined minus left events | snapshots + verifier / sync |
| Biggest switches | `switches` | no | real manager replacements | verifier / sync |
| Traffic stacks by main manager | `traffic` | no | traffic measured and manager resolved | traffic / verifier |
| Networks per site (1, 2, 3, 4+) | `networks_per_site` (`count`, `share`) | yes | actual relationship counts | sync |
| Most common pairs | `pairs` | yes | two listed networks on same site | sync |
| Joining rule vs site count | `joining_rules` (`amount`, `unit`, `sites`) | yes | known traffic rule; preserve units, exclude revenue/unknown | sync + code facts |
| Median ages / WordPress shares | `median_domain_age`; `wordpress_share` | no | measured dates/platforms; WordPress denominator is known platforms | domain-age / platform |
| ads.txt headline numbers and percentages | `ads_txt_metrics` | no | at least one stored summary; null hides block | ads-txt-summary |
| ads.txt line-count histogram | `ads_txt.file_sizes` (`count`, `share`) | no | measured summaries only | ads-txt-summary |
| Checked last 7 days / confirmed freshness | `freshness.checked_last_7_days`, `freshness.checked_share`; `confirmed_share` | yes | listed scope; checked percentage non-null | verifier / sync |
| New last week and weekly scan/checker stacks | `freshness.new_last_week`, `.weekly` | no | real new observations; no import spike; provenance required for weekly split | verifier / sync + source attribution |
| Verification method mix / queue coverage | `verification_methods`; `check_queue` | yes | stored confirmed methods; nonempty Supabase queue | verifier / queue import |

## Checker site view: `/ad-network-checker`

API: `/api/ad-networks/site?domain=…`; loader: `getAdNetworkCheckerSite(domain)`. Unknown domains return null without writes or live external checks.

| Mockup element | Loader field | Dev now | Gate | DB run |
| --- | --- | --- | --- | --- |
| Domain, checked date, main manager, networks sentence | `site.domain`, `.last_checked_at`, `.managed_by`, `.manager_domain`, `.networks` | yes | nullable date/manager | verifier / sync |
| Traffic/niche/platform/registered year/age/publisher | `site.traffic_group`, `.niche`, `.platform`, `.domain_created_on`, `.publisher_name`; `domain_age_years` | no | individual field non-null | traffic / niche / platform / domain-age / publisher-names |
| Network evidence/status/since table | `relationships` (`status`, `relationship_type`, dates) | yes | reviewed confirmed/stale/ended only; no candidate claims | verifier / sync |
| Other ad sellers count | `other_sellers` | no | complete `ads_txt_summary.seller_domains` required, never infer from top sellers | ads-txt-summary |
| Timeline and dated events | `history`; relationship observed dates; `history_source` | observed only | real observed dates; no claim of archived history | verifier / sync; Wayback later |
| Line/company/direct/reseller totals, split, top sellers | `ads_txt_summary`; `direct_share`, `reseller_share` | no | summary non-null; split denominator nonzero | ads-txt-summary |
| Stored source excerpt / more lines | `ads_txt_preview`; `ads_txt_summary.lines` | no | preview non-null; source excerpt capped at 4 KB | ads-txt-summary |
| Similar sites / traffic labels / basis | `similar_sites`, `similar_available_columns`, `basis` | sites yes; traffic/niche no | confirmed network overlap; prefer niche then same traffic when present | sync / niche / traffic |
| Similar links to network/niche | `site.managed_by` or `site.networks`; `site.niche` | networks yes; niche no | non-null slug | sync / niche |

`availableSorts` excludes missing-field choices. The sites API still validates every known sort and safely resolves an old shared URL's now-unavailable choice to `effectiveSort: "domain"`. Pages must use the returned control metadata, not a second hardcoded option list.

## Additive chart fields (2026-10-16 follow-up)

Existing fields and names remain unchanged. The properties below are optional in the TypeScript response types so page fixtures already being edited keep compiling; the real loaders always populate them. They share the existing `AD_NETWORKS_TAG` and RDAP/movement/niche gates. No migration or data write is needed.

| Page / mockup element | Added loader field | Dev now | Gate / source |
| --- | --- | --- | --- |
| Network registration-year histogram, middle band, median line, oldest/newest captions | `getAdNetworkPageData(slug).stats.domain_age_strip` | no | null until RDAP dates exist for listed sites in the network |
| Market-wide registration strip and per-network strips | `getAdNetworkStatsPageData().domain_age_strip`, `.domain_age_by_network[]` (`slug`, `name`, `strip`) | no | null/empty until RDAP dates exist; a multi-network site counts once in the overall strip |
| Niche registration strip | `getAdNetworkNichePageData(slug).domain_age_strip` | no | parent niche gate, then measured RDAP dates in the niche |
| Switches came from / went to, names, counts, totals | network `stats.switch_flow` | no | null without real unambiguous manager replacements; uses the existing last-90-days `switches` source |
| Joined/left 30-day daily and 90-day weekly views | network `stats.movement_periods` | departures yes | actual joined/left events only; no baseline or newly-found arrivals in joins |
| Platform donut's Unknown slice | network `stats.platform_mix` | no | empty without measured platforms; adds the true unmeasured count using the full network site denominator |
| Niche newest-sites rows: the network actually joined and observed date | niche `newest_arrivals[]` (`site`, `network`, `observed_at`) | no | real joined/newly-found arrival; no baseline dates or arbitrary choice from current network overlaps |

Each `domain_age_strip` has:

- `p25_year`, `median_year`, `p75_year`, plus `middle_half: [p25_year, p75_year]`. These use PostgreSQL continuous percentiles over registration years; fractional years are intentional, not rounded sample values.
- `oldest` and `newest`: `{ domain, year, registered_on }`. Exact registration dates select the domains, with alphabetical domain order breaking equal-date ties.
- `bins: [{ year, count }]`, `bin_years: 1`, and `measured`. Bins count measured domains per calendar registration year, not the existing age-range buckets. Pass `binYears={strip.bin_years}` to `AgeStrip`, since years with no observations can be absent.

`switch_flow` contains `center`, `came_from`, `went_to`, `incoming_total`, and `outgoing_total`. Each side row has `slug`, `name`, `label`, and `count`; rows are largest first. One side can be empty. Pass the arrays directly to the shared flow component as `cameFrom` and `wentTo`, and use `center.name` for its title. The original `stats.switches` pairs stay available.

`movement_periods` is compatible with the shared `JoinedLeftBars` period props: `key`, `label`, `points`, `startLabel`, `endLabel`, plus `days`, `interval`, `joined`, `left`, `net`. Points have `date`, `label`, `joined`, `left`. Windows include today in UTC; weekly bins begin on Monday. A period with no real joined/left events hides. Sparse observation dates remain sparse; missing checks are never drawn as fabricated zero counts.

Standalone cached access is also available through `getAdNetworkDomainAgeStrip(network = null, niche = null)` and `getAdNetworkDomainAgeByNetwork(niche = null)`. The corresponding `load*` functions bypass the Next cache for source verification.


## Checker preview highlighting

`/api/ad-networks/site` now returns **`site.relationships[].ad_system_domains`**, a `string[]` copied from that relationship's network identity. It is always present in actual loader responses, including an empty array when the identity has no ad-system domains. The TypeScript property is optional to preserve existing fixtures. Existing relationship fields are unchanged.

For seller-line highlighting, use the union of `ad_system_domains` from relationships whose `status === "confirmed"`, and match the ads.txt line's first comma-separated domain. Keep the existing MANAGERDOMAIN highlighting too. Ended/stale relationship domains and unrelated sellers must not brighten as confirmed networks. Ad-system domains are separate from manager domains; a confirmed network can authorize selling without being the site's manager. This field uses the existing network-identity database source and cache tag, so identity updates refresh the checker automatically. No migration is needed.


## Sites pagination default

`defaultAdNetworkSitesQuery(network = null, niche = null, pageSize = 10)` and `/api/ad-networks/sites` both default to 10 rows, using `AD_NETWORK_SITES_PAGE_SIZE` from `lib/ad-networks-report.ts`. The network and niche loaders' embedded `sites` first page therefore also has 10 rows. No page call needs to change; explicit `pageSize: 10` calls remain valid and use the same query/cache key as the helper default. Existing explicit API page sizes (1 to 100), including shared URLs with `pageSize=50`, remain supported. Callers can use the helper's optional third argument for another page size. The data-cache version was bumped to avoid reusing an older cached niche response containing a 50-row first page.

## Checker events, evidence methods, and deterministic observations

The site API adds **`site.events`**, an array of `{ date, kind, network, from_network?, networks? }`:

- `kind: "switched"` means one explicit manager departure and one different manager join within seven days, with exactly one candidate in **both** directions. The date is the arrival observation; `network` is the arrival and `from_network` the departure. Concurrent seller relationships, unknown relationship types, baseline imports, newly found sites, ambiguous candidates, and distant events in the same month never establish a switch. Microseconds at the seven-day boundary are preserved while matching.
- `added` and `dropped` retain the individual observed arrival/departure when no switch is established.
- `first_check` means our earliest **stored observation**, not the site's lifetime first use. `network` can be null when no single network is known; `networks` lists networks seen on that check. Baselines produce this event rather than invented additions. Without any dated observation, the array is empty.
- Detection uses the complete stored site history before bounding public output to the latest 199 changes plus the earliest check. Existing `history` stays available with its original first-200-observations limit. Use `events` for event wording; remove the checker's same-month switch inference.

Each `site.relationships[]` now also returns **`verification_method`**, the stored string or null. Known verifier values are:

| Value | Supported wording |
| --- | --- |
| `ads_txt_managerdomain` | The site's ads.txt names the network as its manager. |
| `ads_txt_and_adsense_account` | The site's ads.txt and page use the same AdSense account. |
| `ads_txt_and_page_signature` | The site's ads.txt and page ad setup identify the network. |
| `page_signature` | The page's ad setup identifies the network; do not claim its ads.txt names it. |

Preserve unknown/null methods as unknown; do not promote them to stronger evidence. Both additions are optional in TypeScript for existing fixtures, and always returned by actual loader responses.

`domain_age_years` now measures registration age at `site.last_checked_at`, not the wall clock. It is null without both valid stored dates, or if the check predates registration. Re-reading identical stored site data produces identical response bodies for exact cache verification.

`adNetworkUtcWindow()` supplies a shared inclusive UTC calendar window: today and the previous 89 dates, with tomorrow's midnight as the exclusive upper bound. Movement SQL, 30/90-day chart periods, movement totals, `change_90_days`, and market `net_change` use that same observation day. The baseline snapshot coverage test uses the day before the window. Switch report totals use the same 90-day window for departures, but keep a 14-day context on either side while checking ambiguity, so a competing departure just outside the report window cannot create a false switch. Checker history switch detection is lifetime observed history rather than a 90-day report.

## Production schema prerequisites before the PR build

Read-only production audit on 2026-10-16: none of the four migrations below is recorded, all seven enrichment columns and all three new tables are absent, and production publisher/relationship row counts are both zero. No production migration or data write was performed.

Apply order and distinction:

| Migration | Required for | Purely additive? / ahead-of-code assessment |
| --- | --- | --- |
| `20261015183928_ad_network_site_facts_and_snapshots.sql` | **Hard loader/build schema prerequisite:** publisher `niche`, `publisher_name`, `platform`, `domain_created_on`, `traffic_group`, `ads_txt_summary`, `favicon`; `ad_network_daily_counts`; `ad_network_relationship_events` | Schema additions preserve old columns and rows, but the whole file is **not purely additive**: it also replaces a comparison function, adds source-table triggers, and tightens private table grants. Compatible with the existing server-side reader; review/apply before any PR build that reads production. |
| `20261015193817_ad_network_observed_movement_classification.sql` | Correct event semantics and the sync's `ad_network_check_observations` table; not an additional SELECT dependency for the build itself | **Not purely additive:** widens an event constraint, changes existing `joined` events to `baseline`, backfills check observations, and replaces the relationship-event trigger function. Must follow the first migration, before the new sync runs. With the audited empty source tables, the rewrite/backfill has no existing production publisher data to alter. |
| `20261016032034_ad_network_report_evidence_revalidation.sql` | Cache invalidation for methods, retained manager evidence, identity domains and source attribution | **Not purely additive:** replaces the existing public-value comparison function. Backward-compatible function signature; needed for full feature correctness, not to make the page SQL compile. |
| `20261016032558_ad_network_report_source_revision.sql` | Shared report fingerprints, snapshot/event changes, and queue-coverage refreshes | **Not purely additive:** replaces source-revision and report-trigger functions. Backward-compatible signatures; depends on the first migration's tables. Needed for full feature correctness, not an additional loader SELECT dependency. |

The hard missing-schema build blocker is the first migration. The complete reviewed feature requires the four migrations in the order above. They can be prepared ahead of the new code with the audited empty publisher/relationship tables, while keeping ad-network sync/production activation off until all four are applied. They are not four schema-only additions and should not be described as such. Recheck production migration state and data occupancy before applying, since this is a read-only audit, not an authorization or release change. Ordinary migration locks still apply. Keep production data import, publication, and release coordination separate.
