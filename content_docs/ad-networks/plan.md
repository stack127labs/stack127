# Ad network publisher directory plan

Status (2026-10-16): The active roster has 44 networks after the Snigel merger. The pages are rebuilt, and development holds the reviewed publisher and relationship data from the homelab SQLite store at `~/.local/share/stack127/ad-networks.sqlite`. The never-checked queue is empty. Homepage, traffic, publisher-name and ads.txt summary gathering and their development sync finished. All 72 niche batches were validated and imported into SQLite; 85,810 accepted labels cover 80.6% of the confirmed cohort. The labels are synced to development, and the niche index and 20 child pages are published there. All six page types passed desktop and mobile checks, and all 21 niche routes passed public verification. PR #53 is awaiting GitHub CI after the account billing block is resolved. Domain ages continue in the background. Production data import, page publication and worker activation remain release steps. Majestic Million is postponed.

The roster started with the [31 ad networks in the research database](https://app.notion.com/p/bc1c2f83e00a463b97219f7f8ae8cb0e?v=70131f4d0b4848a5b87b301714c64c07), then added Google AdSense and 13 reviewed publisher platforms. This document covers the 45-network directory, one page per network, domain discovery, independent verification, database updates, and recurring refreshes. The work has five phases: build the foundation, gather the initial domain list, add new domains on a schedule, verify network relationships on a separate schedule, and check the complete system. Niche pages, a stats page, and a site checker were added on 2026-10-16; see [the build plan](../../dev-space/ad-networks-build-plan.md). Traffic estimates and earnings estimates are later decisions.

Merger rule (2026-10-16): Snigel is merged into Publisher Collective following their February 2025 merger. Map `snigelweb.com` manager and ad-system evidence to Publisher Collective, keep the usual evidence thresholds, and retire `/ad-networks/snigel` with no redirect because it was never published in production. The retired page returns 404. The active roster is 44 networks. PubGalaxy stays separate.

## What we will publish

| Route | Job | Initial content |
| --- | --- | --- |
| `/ad-networks` | Directory of ad networks | Network name, short factual description, official website, count of currently verified publisher sites, and link to its page. |
| `/ad-networks/<network-slug>` | Directory of sites for one network | Network introduction and a searchable, paginated list of verified domains. Each row links to the site and identifies the relationship accurately. |
| `/ad-networks/niches` | Niches across all networks | Sites per niche, network share in each niche, and a niche by network grid. |
| `/ad-networks/niches/<niche>` | One niche | Its sites, the networks used most, site sizes, moves between networks, and newest sites. Unpublished until the niche run fills the data. Index only niches with 500 or more sites. |
| `/ad-networks/stats` | The whole market | Market share, growth, switches, site sizes, ads.txt, and freshness. |
| `/ad-network-checker` | Tool | One site's networks, manager, history, and ads.txt summary, loaded in the browser. |

Use `/ad-networks/journey-by-mediavine` for Journey. Keep the URL plural and consistent with the parent. Niche pages live only at `/ad-networks/niches/<niche>`; there are no `/ad-networks/<network>/niches/<niche>` or `/ad-network/niche` routes. Filters on a list use query parameters. There is no static page per site: the static export allows 20,000 files and there are far more sites than that, so the checker tool shows one site at a time.

The directory belongs in `app/(site)/(directories)/`. Each public route must have its exact slug in `public.stack127_pages`; that registry controls publication, indexing, and the sitemap. Follow [page families](../../stack127_docs/page-families.md), [product direction](../../stack127_docs/product-direction.md), and [shared UI](../../stack127_docs/shared-ui.md) when building the pages. Use server-rendered initial rows and bounded pagination so a network with thousands of sites does not load its whole dataset into the browser. Pagination follows the existing `?page=2` convention.

The wording on a site row must match the evidence. A site can **use** a network without that network being its primary manager. Only show a primary/manager claim when the publisher's own current record supports it. Do not show candidate rows, import states, or collector details on public pages. A simple “checked on” date can help a reader judge freshness.

## Three core tables

Keep domains separate from their verified network relationships. The discovery script inserts domains without a network ID. The verification script creates or updates relationships. A domain can have more than one confirmed relationship. The canonical migration history contains the current draft schema; later scripts must follow this contract. The old development SQL experiments are archived and must not be replayed.

| Table | Row grain | Proposed fields and rules |
| --- | --- | --- |
| `public.ad_networks` | One network or distinct program | `id`, stable `slug`, `name`, `official_url`, short reviewed description, optional `parent_network_id`, known `manager_domains`, known ad-system domains, program-specific detection rules, timestamps. Use the parent link for Journey/Mediavine without merging their publisher lists. Page publication belongs only to `stack127_pages`. |
| `public.ad_network_publishers` | One normalized publisher domain | `id`, unique `normalized_domain`, preferred display domain, discovery source summary, `first_seen_at`, `last_discovered_at`, `last_checked_at`, domain check status, and timestamps. There is **no network ID** or network assignment in this table. |
| `public.ad_network_publisher_relationships` | One `(ad_network_id, publisher_id)` pair | `ad_network_id`, `publisher_id`, `status`, `relationship_type`, `verification_method`, latest first-party evidence, `first_confirmed_at`, `last_confirmed_at`, `ended_at`, and timestamps. Enforce uniqueness on network plus publisher. This table holds current and ended relationships without deleting history. |

Use domain check states such as `unverified`, `checked`, `unreachable`, and `invalid`. Keep invalid domains so the next discovery run does not recreate known bad inputs. Relationship states can be `confirmed`, `needs_review`, `stale`, and `ended`. `relationship_type` should distinguish `primary_or_exclusive_manager`, `active_network_use`, and `unknown`; a `MANAGERDOMAIN` value supports the first label but does not tell us whether the arrangement is exclusive. Do not create a confirmed relationship from a `sellers.json` row alone.

For the first version, keep a bounded array of discovery records in the publisher row. Each record needs `source_key`, exact `source_url`, `seen_at`, and the domain as supplied. A discovery record may identify the list it came from, but it is never a network assignment. Keep the latest first-party verification facts with the relationship they support: checked URL, checked time, response outcome, matched signal, and parser version. Do not store a full raw copy of every third-party page. If repeated checks and many sources make these rows unwieldy, move observations to a private child table later; the three canonical row grains stay the same. Job logs belong with the scheduler, not in a new import-run table.

If these tables are placed in Supabase's exposed `public` schema, enable RLS and set grants deliberately. The first implementation should revoke anonymous Data API access to these whole tables: row policies cannot hide the evidence columns on an otherwise readable row. Server-side page queries should return only reviewed public fields, only for routes published in `stack127_pages`, and only for confirmed relationships. Collector writes stay server-side. [Supabase explains the separate roles of grants and RLS](https://supabase.com/docs/guides/api/securing-your-api). A later public API would need a deliberately limited projection and its own access review.

## What counts as a verified publisher

Discovery creates a candidate domain with no network relationship; it never publishes one. Verification reads the candidate publisher's own current `/ads.txt` and, where useful, its live page or ad configuration. Parse `ads.txt` as a structured file rather than searching for a network name anywhere in its text. Normalize the site domain, follow only safe redirects, and retain the actual host checked.

| Evidence | Decision |
| --- | --- |
| The site's `/ads.txt` explicitly names the mapped network in `MANAGERDOMAIN` | Strong evidence that the network is the primary **or** exclusive programmatic manager. Publish with that exact label after checking that the record is current and the mapping is unambiguous. |
| The site runs a distinctive network or program configuration, with corresponding current authorization in `/ads.txt` | Evidence of active network use. Publish as “uses this network” when the signature is specific enough; otherwise send to review. |
| The network names the site in an official portfolio, and the site's current configuration corroborates the relationship | Publish with the supported relationship label. A portfolio mention alone may be historical. |
| The site's `/ads.txt` contains a `DIRECT` or `RESELLER` seller line only | Record authorization. This does not establish a primary manager or even an active managed-service relationship; keep it pending unless stronger evidence exists. |
| The network's `sellers.json` contains a domain only | Candidate only. A seller's `domain` can be its company website rather than the publication that carries ads. |
| A third-party directory lists the domain only | Candidate only, provided that source's terms permit collecting it. |

The [IAB ads.txt 1.1 specification](https://iabtechlab.com/wp-content/uploads/2022/04/Ads.txt-1.1.pdf) defines `MANAGERDOMAIN` as a primary or exclusive partner. [Google's sellers.json guidance](https://support.google.com/admanager/answer/9761171?hl=en) explains the business-domain distinction. A missing `MANAGERDOMAIN`, a timeout, a temporary block, or a missing seller entry must remain “unknown” until another check resolves it; none proves the relationship ended.

Some programs need separate rules before their pages go live. Journey and PubNation now have separate seller files, but those files provide leads, not proof that a particular website belongs to either program. Journey still needs a program-specific live signal or another distinct publisher-side declaration. Apply the same caution to related programs such as Mediavine/PubNation. One company's ad-system domain must not silently populate every related brand's page.

## Source policy

The collector must have a source allowlist. Record a source's purpose, exact entry URL, extraction method, rate limit, robots/terms review date, and whether its output may be used in a public directory. “The page is readable” is a technical observation, not a license. Independent verification of a copied domain does not override a source's stated extraction or reuse limits.

| Source | Exact starting point | Role and realistic collection decision |
| --- | --- | --- |
| Network-run `sellers.json` | Exact endpoints in the network matrix below | Machine-readable candidate source. Fetch with caching, normal request limits, and a site-specific terms/robots check. Treat `sellers[].domain` as a lead, not a publisher claim. |
| Official publisher portfolios | [Publisher Collective's sites](https://www.publisher-collective.com/our-sites); other verified network portfolios can be added | First-party candidate source. Review each site's terms and robots rules before scheduling an HTML collector. |
| [Majestic Million](https://majestic.com/reports/majestic-million) | [Download CSV](https://downloads.majestic.com/majestic_million.csv) | Domain-first seed for every network. Majestic offers the download under [CC BY 3.0](https://majestic.com/reports/majestic-million); keep attribution. It does not identify ad networks. |
| [Common Crawl](https://commoncrawl.org/columnar-index) | [Columnar index](https://commoncrawl.org/columnar-index) | Optional large-scale domain-first seed. Budget storage and compute, and check the [terms](https://commoncrawl.org/terms-of-use), including terms attached to crawled content, before use. |
| Manual top-site lists and submissions | Curated domains from niches, editorial research, and user submissions | Add domains to the same candidate queue. Check the terms of any third-party list used as a seed. Do not assign a network from a list title. |
| [Fathom](https://www.fathom.tools/) | Network-specific URLs below | Public paginated HTML and useful evidence labels. No public bulk license was verified. Keep as a conditional source; complete terms and robots review before a scheduled collector. |
| [Arul John](https://aruljohn.com/blog/websites-using-ezoic-mediavine-raptive/) | Network-specific URLs below | Public paginated HTML, often about 100 domains per page. His own explanation says many lists come from network seller files. Keep as a conditional source until terms and robots review; the official JSON may provide the same candidates directly. |
| [ExplodingWeb](https://explodingweb.io/ad-networks/) | Network-specific URLs below | Public network pages expose the top 50 and 10 rising domains. Keep as a conditional source until terms and robots review; do not assume access to the paid full dataset. |
| [WhichAdNetwork](https://whichadnetwork.com/networks) | Network pages from its index | Research reference only for now. Its [terms](https://whichadnetwork.com/terms) prohibit systematic scraping and wholesale republication; discuss its export or API terms before any bulk use. |
| [List of Websites Using](https://listofwebsitesusing.com/ad-networks) | Network pages from its index | Research reference only. Its [pricing and use rules](https://listofwebsitesusing.com/pricing) allow prospecting but rule out rebuilding a directory from the dataset; visible rows and exports have caps. |
| [SiteStatsDB](https://sitestatsdb.com/technologies/ad-networks) | Technology pages from its index | Research reference only. Its [terms](https://sitestatsdb.com/terms) expressly prohibit scraping, bulk extraction, and populating a competing product. |
| [Wappalyzer](https://www.wappalyzer.com/technologies/advertising/) | Advertising technology pages | Research reference only. Its [terms](https://www.wappalyzer.com/terms/) restrict commercial copying and customer-facing publication of licensed data without permission. |
| [Red Volcano](https://www.redvolcano.io/data/) | SSP profile pages | Research reference only. Its [service terms](https://www.redvolcano.io/terms-of-service/) restrict automated collection and external reuse, but say the public `.io` site has separate website terms. Confirm those terms or obtain permission before using its public directory in a collector. A site listing an SSP in `ads.txt` is not necessarily managed by that SSP. |
| BuiltWith | No collector | Excluded from this workflow, as requested. |

The source decisions above were reviewed on 2026-09-25. Recheck terms and robots rules before implementing any conditional adapter or subscribing to a commercial export. The initial one-time domain import must follow the same terms as later refreshes; doing it only once does not remove extraction or reuse restrictions. If a source cannot be used, its coverage does not block the directory because domain-first scanning and first-party checks still work.

## Per-network collection map

In this table, `JSON` is a network-run candidate feed, `Sites` is an official portfolio, and `List` is a public network-specific page. Every collected domain enters `ad_network_publishers` without a network ID; the source column is only provenance. Fathom, Arul John, and ExplodingWeb links are **conditional research targets**, not approved scheduled scrapers. A dash means no exact usable page was confirmed in that source. The licensed Majestic domain seed and first-party verification apply to **all 45 networks** and are not repeated in each row.

| Network | Network-run source for the first collector | Fathom, conditional | Arul John, conditional | ExplodingWeb, conditional |
| --- | --- | --- | --- | --- |
| Raptive | [JSON, paused](https://ads.cafemedia.com/sellers.json) | [List](https://www.fathom.tools/network/raptive) | [List](https://aruljohn.com/websites-using-raptive) | [Top sites](https://explodingweb.io/ad-networks/cafemedia) |
| Newor Media | [JSON](https://newormedia.com/sellers.json) | [List](https://www.fathom.tools/network/newor-media) | [List](https://aruljohn.com/websites-using-newormedia) | — |
| AdPushup | [JSON](https://adpushup.com/sellers.json) | [List](https://www.fathom.tools/network/adpushup) | [List](https://aruljohn.com/websites-using-adpushup) | [Top sites](https://explodingweb.io/ad-networks/adpushup) |
| Ezoic | [JSON, paused](https://ezoic.ai/sellers.json) | [List](https://www.fathom.tools/network/ezoic) | [List](https://aruljohn.com/websites-using-ezoic) | [Top sites](https://explodingweb.io/ad-networks/ezoic) |
| Monumetric | [JSON](https://monumetric.com/sellers.json) | [List](https://www.fathom.tools/network/monumetric) | [List](https://aruljohn.com/websites-using-monumetric) | — |
| Snigel | [JSON](https://cdn.snigelweb.com/sellers/sellers.json) | — | — | [Top sites](https://explodingweb.io/ad-networks/snigelweb-com) |
| Journey by Mediavine | [JSON, paused](https://sellers.journeymv.com/sellers.json) | — | [List](https://aruljohn.com/websites-using-journey) | — |
| Setupad | [JSON](https://setupad.com/sellers.json) | [List](https://www.fathom.tools/network/setupad) | [List](https://aruljohn.com/websites-using-setupad) | [Top sites](https://explodingweb.io/ad-networks/setupad) |
| Mediavine | [JSON](https://www.mediavine.com/sellers.json) | [List](https://www.fathom.tools/network/mediavine) | [List](https://aruljohn.com/websites-using-mediavine) | [Top sites](https://explodingweb.io/ad-networks/mediavine) |
| Playwire | [JSON](https://playwire.com/sellers.json) | [List](https://www.fathom.tools/network/playwire) | — | [Top sites](https://explodingweb.io/ad-networks/playwire) |
| SHE Media | [JSON](https://ads.shemedia.com/sellers.json) | [List](https://www.fathom.tools/network/she-media) | [List](https://aruljohn.com/websites-using-shemedia) | — |
| Freestar | [JSON](https://freestar.com/sellers.json) | [List](https://www.fathom.tools/network/freestar) | [List](https://aruljohn.com/websites-using-freestar) | [Top sites](https://explodingweb.io/ad-networks/freestar) |
| Publift | [JSON](https://www.publift.com/sellers.json) | [List](https://www.fathom.tools/network/publift) | [List](https://aruljohn.com/websites-using-publift) | [Top sites](https://explodingweb.io/ad-networks/publift) |
| Refinery89 | [JSON, paused](https://refinery89.com/sellers.json) | [List](https://www.fathom.tools/network/refinery89) | — | [Top sites](https://explodingweb.io/ad-networks/refinery89) |
| NitroPay | [JSON](https://nitropay.com/sellers.json) | [List](https://www.fathom.tools/network/nitropay) | [List](https://aruljohn.com/websites-using-nitropay) | [Top sites](https://explodingweb.io/ad-networks/nitropay) |
| Aditude | [JSON](https://cdn-prod.aditude.com/sellers.json) | [List](https://www.fathom.tools/network/aditude) | — | — |
| Publisher Collective | [Official sites, manual research only](https://www.publisher-collective.com/our-sites) | [List](https://www.fathom.tools/network/publisher-collective) | — | — |
| Clickio | [JSON](https://clickio.com/sellers.json) | [List](https://www.fathom.tools/network/clickio) | — | [Top sites](https://explodingweb.io/ad-networks/clickio) |
| PubNation | [JSON](https://sellers.pubnation.com/sellers.json) | [List](https://www.fathom.tools/network/pubnation) | — | [Top sites](https://explodingweb.io/ad-networks/pubnation-com) |
| Snack Media | [JSON](https://www.snack-media.com/sellers.json) | [List](https://www.fathom.tools/network/snack-media) | — | [Top sites](https://explodingweb.io/ad-networks/snack-media-com) |
| Opti Digital | [JSON](https://scripts.opti-digital.com/sellers.json) | [List](https://www.fathom.tools/network/opti-digital) | — | — |
| Adnimation | [JSON](https://www.adnimation.com/sellers.json) | [List](https://www.fathom.tools/network/adnimation) | [List](https://aruljohn.com/websites-using-adnimation) | — |
| AnyMind / AnyManager | [JSON](https://anymanager.io/sellers.json) | [List](https://www.fathom.tools/network/anymind) | — | [Top sites](https://explodingweb.io/ad-networks/anymanager) |
| Venatus | [JSON, paused](https://www.venatus.com/sellers.json) | [List](https://www.fathom.tools/network/venatus) | — | [Top sites](https://explodingweb.io/ad-networks/venatus) |
| Adapex | [JSON, paused](https://adapex.io/sellers.json) | [List](https://www.fathom.tools/network/adapex) | — | — |
| PubPower | [JSON](https://pubpower.io/sellers.json) | [List](https://www.fathom.tools/network/pubpower) | — | [Top sites](https://explodingweb.io/ad-networks/pubpower-io) |
| PubGalaxy | [JSON](https://www.pubgalaxy.com/sellers.json) | [List](https://www.fathom.tools/network/pubgalaxy) | [List](https://aruljohn.com/websites-using-pubgalaxy) | — |
| Media.net | [JSON](https://media.net/sellers.json) | — | [List](https://aruljohn.com/websites-using-medianet) | — |
| Concert | [JSON](https://concert.io/sellers.json) | [List](https://www.fathom.tools/network/concert) | [List](https://aruljohn.com/websites-using-concertio) | — |
| Sovrn | [JSON, paused](https://lijit.com/sellers.json) | — | [List](https://aruljohn.com/websites-using-sovrn) | — |
| Infolinks | [JSON](https://infolinks.com/sellers.json) | [List](https://www.fathom.tools/network/infolinks) | [List](https://aruljohn.com/websites-using-infolinks) | [Top sites](https://explodingweb.io/ad-networks/infolinks-com) |
| Google AdSense | [Combined Google seller JSON](https://realtimebidding.google.com/sellers.json) | Candidate domains only; it also contains Ad Manager and AdMob sellers | — | — |
| The Moneytizer | No verified public seller feed | — | — | Found through broader candidate scans and verified with `MANAGERDOMAIN=themoneytizer.com` |
| Taboola | [JSON](https://www.taboola.com/sellers.json) | — | — | Confirm with a live Taboola loader and a direct `taboola.com` ads.txt record |
| Teads | [Teads JSON](https://sellers.teads.tv/sellers.json) and [legacy Outbrain JSON](https://www.outbrain.com/sellers.json) | — | — | One current identity with Teads and legacy Outbrain signals |
| Amazon Publisher Services | [JSON](https://aps.amazon.com/sellers.json) | — | — | Confirm with the APS header tag and direct `aps.amazon.com` record |
| MGID | [JSON](https://www.mgid.com/sellers.json) | — | — | Confirm with the MGID widget and direct `mgid.com` record |
| Revcontent | [JSON](https://assets.revcontent.com/sellers/master/sellers.json) | — | — | Confirm with a Revcontent widget and direct `revcontent.com` record |
| BuySellAds / Carbon Ads | [JSON](https://cdn4.buysellads.com/sellers.json) | — | — | Confirm with `MANAGERDOMAIN=buysellads.com` or an official lead plus live tag |
| EthicalAds | [Official publisher list](https://www.ethicalads.io/publishers/list/) | — | — | Confirm an official-list lead only when the live EthicalAds client tag remains present |
| Sparteo | [JSON](https://sparteo.com/sellers.json) | — | — | Confirm with `MANAGERDOMAIN=sparteo.com` |
| MonetizeMore / PubGuru | No verified public seller feed | — | — | Confirm with `MANAGERDOMAIN=monetizemore.com` |
| PubFuture | No verified public seller feed | — | — | Confirm with `MANAGERDOMAIN=pubfuture.com` |
| Geniee SSP | No verified public seller feed | — | — | Confirm with `MANAGERDOMAIN=genieegroup.com` or `genieesspv.jp` |
| Publir | No verified public seller feed | — | — | Confirm with `MANAGERDOMAIN=publir.com` |

The direct JSON locations include redirects in some cases. Preserve the starting URL and validate the returned structure. The [maintenance guide](maintenance.md) records which feeds are enabled or paused for recurring use. The [well-known record for Sovrn](https://well-known.dev/resources/ads_txt/ad-systems/sovrn.com/) confirms that its usable file is at `lijit.com`, while its `sovrn.com/sellers.json` path returns 404.

## Five phases

### 1. Build the foundation

Completed in development: created the three tables, indexes, grants, and RLS configuration; seeded 45 network identities and slugs with official links and short descriptions; and built `/ad-networks` and `/ad-networks/<slug>` with cards, list rows, search, pagination, empty states, and server queries. Public lists query confirmed relationships only. The parent page and 45 network page records are seeded unpublished. Production publication waits until the data and the full workflow pass phase 5. The route build and quality checks passed; desktop and mobile browser checks covered both themes, search, navigation, empty states, confirmed rows, and pagination with temporary development fixtures that were removed afterward.

This phase establishes the page and database contract. It does not assign a network to a domain merely to fill a page.

Database history is reconciled through the cleanup release. Keep the canonical versions in both managed projects. The old development ledger gaps and SQL experiments are historical context, not pending migrations.

The GitHub discovery and verification workflows remain manual-only, without `--apply`. They preview candidates and checks without saving database changes. Keep their production schedules disabled until a separate activation review. The independent homelab SQLite workers remain separate.

### 2. Gather the initial domain list

Completed locally on 2026-09-26. The resumable one-time collector attempted all 201 configured Phase 2 source URLs and processed 191,990 candidate rows. After global normalization and deduplication, the homelab SQLite database contains 71,178 unique domains. The rerun started from 30,585 domains, so it added 40,593 while the recurring discovery worker was also active. Majestic Million remains excluded.

The completed sources include the Fathom global API and 27 network catalogs, full pagination for 18 Arul John lists, 18 ExplodingWeb pages, eight one-time official sellers files, usable Wappalyzer and Red Volcano pages, four List of Websites Using pages, and the Publisher Collective portfolio. WhichAdNetwork returned HTTP 403 for all configured pages. SiteStatsDB returned a Vercel HTTP 429 challenge. Twenty-five Wappalyzer URLs returned no list, and 26 Red Volcano URLs returned HTTP 404. These outcomes are stored in `collector_checkpoints`; no unavailable source was treated as an empty successful import.

Every accepted domain keeps its source key, exact source URL, supplied value, and observation time. The source remains provenance only. Domains entered the publisher queue without a network relationship and stay off public directory pages until Phase 4 first-party verification confirms them. The [maintenance guide](maintenance.md) contains the complete result table and rerun command.

### 3. Refresh candidate domains with an add-only script

Implemented locally. The [maintenance guide](maintenance.md) and [source manifest](../../scripts/ad-networks/sources.mjs) cover 28 enabled official seller feeds and the EthicalAds publisher list. Eleven official feeds are paused pending usable access. Majestic remains available but is excluded by default. The collector defaults to a dry run, supports selected sources, checks robots rules on each run, streams large seller files, and writes only new domains or new source sightings. A persistent systemd timer runs the local discovery worker weekly. Phase 4 remains responsible for verification and relationship changes.

The discovery orchestrator lives under `scripts/ad-networks/`, with a source manifest and adapters for the permitted source types. It supports all enabled sources or a selected source, defaults to a dry run, and requires `--apply` for writes. On a scheduled run, it collects newly visible domains, adds only new domains and source sightings, and leaves existing domains and relationships intact. A domain disappearing from a source is not a deletion signal. The discovery script never writes a network ID or relationship row. Its default store is local SQLite; `--store postgres` retains the later Supabase path.

The collector uses conditional requests where available, one source at a time, retries, and a robots check before every source request. Schedule only sources whose terms and robots rules have been checked for recurring collection. The initial bulk import may use more permitted sources than the recurring job.

### 4. Verify domains and update relationships with a separate script

Implemented as a continuous homelab worker. The verifier reads unverified domains and confirmed relationships due for recheck. For each site, it safely fetches and parses the site's own `/ads.txt`, including `MANAGERDOMAIN`, `OWNERDOMAIN`, `SUBDOMAIN`, seller system, seller ID, and `DIRECT` or `RESELLER`. It checks a small live-page signature only when needed to establish active use, separate programs such as Journey and Google AdSense, or verify networks that use a direct publisher tag. Matching uses the reviewed identity catalog for all 45 networks, not the source list where the domain was found.

If the evidence still supports the existing relationship, keep its network ID and refresh `last_confirmed_at`. If a domain has no relationship and the evidence identifies a network, add a relationship row. If the evidence identifies another network, add that relationship; end the old one only when repeated first-party checks show it has actually stopped. A site may retain two confirmed relationships. One failed fetch, a missing `MANAGERDOMAIN`, or disappearance from a source leaves the relationship in place for recheck. Queue conflicting or ambiguous cases for manual review. Preserve ended relationships as history instead of deleting the domain.

The verifier defaults to a dry run, uses bounded leased batches for writes, blocks unsafe network targets, follows the ads.txt redirect rules, and retains response checksums and conditional request metadata. Publisher `/ads.txt` and the small conditional homepage check do not consult `robots.txt`; discovery collectors keep their separate source policy. The relationship state machine requires a second valid absence after at least 48 hours before a relationship becomes stale and a third absence spanning seven days before it ends. Network errors never age a relationship. SQLite uses WAL mode, and the systemd user service restarts after a process crash or homelab reboot. The [maintenance guide](maintenance.md) records commands, evidence rules, schedules, and recovery behavior.

The verifier writes only checked outcomes. It does not infer network membership, niche, traffic, revenue, or technology from a discovery list alone.

### 5. Verify the complete system and publish

Pilot Raptive, Mediavine, Journey, Ezoic, and one smaller network before processing the full roster. Manually inspect samples of new, unchanged, changed, ambiguous, and rejected domains. Test redirect handling, invalid domains, seller business domains, missing files, parser errors, multiple networks, and repeated negative checks. Confirm discovery cannot assign networks and verification cannot delete a domain because a source stopped listing it.

Check the real directory and network pages at desktop and mobile widths, including search, pagination, empty states, counts, and links. Run the repository's quality and build gates for the route and schema work. Exercise the scripts in dry-run mode first. Review a bounded development apply run and its results before separately enabling production writes or schedules. Check alerts for source failures and unexpected count drops, then publish the reviewed routes through `stack127_pages` after owner approval.

Completion for the first release means every published network page has an official identity, accurate wording, at least one first-party-confirmed relationship, a working discovery and verification path, and no unverified domains in its public list. Later insights can use the same verified relationships without changing what “confirmed” means.
