# Ad network data maintenance

## Recurring production jobs (prepared 2026-10-18)

The recurring runtime and shell-free activation are ready for review. It has not been pushed, installed, enabled, or deployed. Production data and publication stay unchanged. All ad-network pages stay unpublished and return 404. Follow the [production runbook](production-runbook.md) only after the coordinator authorizes the release.

Collectors, verification, discovery, catalog checks, daily counts, and backups run in a separate OVH Dokploy Compose service. SQLite stays on the named volume `stack127-ad-networks-data`, created automatically by Compose. The protected `ad-networks-runtime.yml` workflow builds the jobs image, creates or updates the separate service through the authenticated Dokploy API, sets its private runtime variables, deploys and waits for health. It requires the exact deployed main SHA and `confirm=stack127-production`. No OVH shell or server SSH identity is needed. Niche sorting runs on homelab with its logged-in Claude CLI and the reviewed Haiku alias. No model API key is needed.

| Job | Schedule, UTC | Work |
| --- | --- | --- |
| Site checks | Continuous, between scheduled jobs | Up to 500 sites or five minutes per batch, then sync and revalidate |
| Daily counts | Daily 00:10 | Current UTC counts; no history backfill |
| Platform and favicon | Daily 01:00 | Missing, retryable, or 30-day-old homepage facts |
| Domain age | Daily 02:00 | New registrations and due retries, with existing registry limits |
| ads.txt summary | Daily 03:00 | Missing summaries and due failures; reuse verifier summaries |
| Backup | Daily 05:00 | Consistent daily SQLite backup, seven retained copies |
| Discovery | Tuesday 04:00 | Active recurring sources; paused sources stay paused |
| Publisher/business names | Wednesday 04:00 | Refresh permitted official seller feeds |
| Traffic | Day 5, 04:00 | Latest complete dated CrUX snapshot |
| Niche sorting, homelab | Sunday 06:00 | Up to 3,000 new unsorted sites, 100 per model batch |

The OVH scheduler runs one job at a time. Due jobs wait for the current batch; coincident jobs run in schedule order. Persistent completion slots survive restarts and coalesce missed periods to the latest due slot. Verification resumes between jobs. A session-level PostgreSQL advisory lock also excludes other automatic/manual heavy runners. A volume-backed kernel lock excludes duplicate schedulers. Failed jobs retry after five minutes; contention retries after 30 seconds. Site-based enrichment stops admitting work after 30 minutes or 5,000 sites. Source-feed jobs need a complete feed and have an outer timeout. Existing host limits remain authoritative. The container caps are 0.5 CPU, 1 GiB RAM, four fetch workers, and a 640 MiB JavaScript heap. The workflow checks fresh CPU/RAM/disk/load through Dokploy read APIs before building and again before service changes. It requires at least two CPUs, 2 GiB available RAM, free disk of max(15 GiB, ten seed sizes + 3 GiB), and one-minute load below CPU count minus 0.5. Actual OVH numbers remain unmeasured until the protected workflow can use its GitHub-only Access credentials. Unsupported endpoints or missing measurements fail closed. An existing service can still be paused under low capacity.

`node --experimental-strip-types scripts/ad-networks/refresh.mjs --job <job> --environment development` prints the full collector, sync, and revalidation plan without opening storage. `--apply` runs it. Production additionally requires `--environment production --confirm stack127-production`. Every scheduled invocation ends with a consistent reviewed sync and an authenticated on-demand origin revalidation. Completed checkpoints are still synced when a collector fails, and the invocation remains failed. A failed sync or revalidation never reports success. Snapshots and backups also use this final pipeline. Normal operation has no separate human sync step.

Sync's database triggers already queue `ad_networks:all` and affected page changes. The runner's extra revalidation immediately expires the origin data/page caches. It deliberately does not delete queued events. The existing Supabase cache worker verifies/purges the legacy host, or dispatches the Cloudflare static frontend refresh, before acknowledging events. In Cloudflare mode the public files update after that workflow completes. No collector publishes routes.

### Activation, seed and private status

The owner must add the existing `GITHUB_ALERT_TOKEN` to GitHub's protected production environment. Read-only name checks found the database, Dokploy, Cloudflare Access, GHCR and Supabase Storage credentials already present. Workflow reruns update the same service, preserve its activation timestamp and working volume, and accept an enabled-jobs list. An empty list pauses recurring work. The website service is unchanged.

Ad-network database runners select session port 5432 on the same Supabase shared-pooler host when existing credentials specify transaction port 6543. This applies to OVH and homelab niche sorting, preserves the target/project/credentials, and makes session advisory locks reliable without editing mirrored env files or GitHub secrets. Unknown non-session endpoints fail closed. See [Supabase connection modes](https://supabase.com/docs/guides/database/connecting-to-postgres).

Homelab runs `handoff.mjs --kind seed --environment production --confirm stack127-production --apply` once after release. It uses `snapshot-local.mjs`, compresses a consistent SQLite read view and uploads checksummed immutable 4 MiB chunks to the private `stack127-ad-networks-jobs` Storage bucket using existing `.env.database` credentials. The manifest pointer is published last. Uploads leave the source and running RDAP progress intact.

On first start, the container pins that manifest before download, verifies chunk/compressed/raw SHA-256 checksums, expanded size, SQLite `quick_check` and catalog, then installs exclusively into an absent store. A marker records each automatic bootstrap step: catalog, seed sync/revalidation, niche seed, revalidation, counts snapshot, bounded platform and verification checks, and checked backup. A restart resumes missing steps; completed bootstrap never reseeds. Scheduling starts afterward. Keep homelab niche sorting stopped until completion. Repeated effects are safe after a crash between commit and marker write.

The later `handoff.mjs --kind rdap ... --apply` uses the same transfer path. The `rdap-import` enabled job polls once per minute between heavy jobs and records imported manifest IDs. It merges newer RDAP facts into the working store, syncs and revalidates without replacing the store or niches.

Runtime status is written every 30 seconds to private `status/runtime.json`: release/deployment IDs, enabled jobs, bootstrap steps, last job times/results/counts, sync/revalidation flags and latest RDAP import. Homelab writes `status/niche-sort.json`. Read both with `handoff.mjs --status --environment production`; it flags runtime heartbeats older than two minutes. This requires no status table or migration. The workflow requires a healthy Docker container and a fresh status for its exact deployment before succeeding. A powered-off host leaves a stale status; external outage notification remains the owner's uptime-monitor choice.

### Niche ownership

Postgres owns existing public niche values. A full SQLite sync may seed a newly inserted publisher's niche; it never updates an existing publisher's niche. This prevents the next OVH sync from overwriting homelab classification. Use `--niches-only` only for the explicit one-time reviewed seed or a separately reviewed correction, while recurring sorting is paused.

The full sync now includes measured homepage title, description, h1, language, and source under `last_check_evidence.enrichment.homepage`. Homelab reads unsorted confirmed publishers and these facts directly from production. It never copies or pushes a second working store. `niche-sort.mjs` checks the exact input domain set, rejects duplicate/missing/extra domains, unsupported labels and fields, and invalid confidence before each atomic batch import. Low confidence suggestions remain private in homelab state; accepted results update only still-unsorted confirmed publishers. A changed OVH cohort cannot cause a stale full-row overwrite. Classified null results are retried after changed evidence or 180 days. Sites without usable homepage facts wait for a later homepage pass.

The model runs in a neutral temporary directory with tools disabled. Database credentials, tokens, passwords, secrets, and API keys are removed from its environment. Batch checkpoints live in `~/.local/state/stack127/ad-networks-niche/niche-results.json`, outside Git. The recurring service uses the login already tested on homelab. Only the niche timer remains in `scripts/ad-networks/systemd/`; old homelab collector/backup unit templates are retired. Installed old collector units are disabled during cutover. Keep the installed homelab backup service/timer until the original RDAP pass and supervisor finish: their already-loaded code still invokes it at midnight. The released code invokes the backup script directly instead. Retire that last timer only after both the one-time work has finished and OVH’s first backup succeeds. Do not stop the one-time RDAP pass during cutover.

Per-network Top niches now appears for any nonempty sorted sample. Shares use sorted sites, and the sorted count is visible. The 100-site/80% gates remain for broad niche comparisons, controls, and index/child loaders; the 500-site child publication gate remains too. Nothing in this round publishes those pages.

### Alerts and recovery

Job failures reuse the existing `GITHUB_ALERT_TOKEN` and the repository's GitHub issue alert pattern. One issue per failed job opens and closes on recovery; raw errors and credentials stay out of issue bodies. The activation workflow supplies the token privately to the OVH jobs service from the protected production secret. Homelab reads its mirrored `.env.deploy`. Development never sends alerts. The existing cache-worker alert continues to cover delayed revalidation. The jobs container exposes a heartbeat health check; an external host/container outage notification still needs the owner's chosen uptime monitor.

Keep the one-time homelab RDAP pass and gather supervisor running. Read-only observation at 08:18 UTC on October 18: both PIDs were alive; 77,212 publisher ages were stored; the RDAP progress file showed 49,964 of 69,052 remaining-pass roots processed and 19,088 still pending, with an estimated 400,415 seconds left. These are changing run observations. The Storage uploader takes the first online SQLite snapshot. Later, `merge-rdap.mjs` merges only newer RDAP checkpoints and registration dates by domain into OVH's store, followed automatically by sync/revalidation through `refresh --job rdap-import`. It never replaces the working SQLite file, niches, site checks, sources, or relationships.

The ten pending production migrations are still coordinator release work. Read-only comparison found production at `20261010064142`, with no pending object or publisher-column name collisions. The two shared cache functions match their pre-PR migration baselines; unrelated directory projection branches are unchanged. See the runbook for the exact release and verification order.

## GitHub preview workflows

The repository discovery and verification workflows are manual-only previews. Neither has a schedule or passes `--apply`. Discovery needs no database credential in preview mode. Verification reads candidates from PostgreSQL and writes only its summary artifact, without saving database results. Its default preview batch is 100 domains.

The verifier rejects `--store postgres --apply`. Apply verification to the SQLite working store, then copy reviewed results through `sync`; this keeps one verification write path. PostgreSQL previews still load protected review signals.

These workflows do not change the independent homelab workers described below. Keep production pages unpublished and draft tables private. Before enabling a production sync or schedule, review the queue import, permissions, identity rules, sample results, and limits. Publication is a separate registry decision.

## Phase 2 one-time import

The one-time Phase 2 import completed on 2026-09-26. It processed 201 configured source URLs and 191,990 candidate rows before global normalization and deduplication. The local database now contains 71,178 unique domains. It contained 30,585 before this rerun, so the combined import and concurrently running discovery worker added 40,593 unique domains. Majestic Million was not imported.

Run the resumable collector with `npm run ad-networks:phase2 -- --apply`. Progress is stored in `collector_checkpoints` after every page. Completed sources are skipped on the next run unless `--fresh` is supplied. Permanent HTTP failures and empty pages are recorded separately from completed sources.

| Source group | Configured | Candidate rows | Result on 2026-09-26 |
| --- | ---: | ---: | --- |
| Official one-time sellers files | 8 | 46,585 | 8 complete |
| Fathom API, global and per network | 28 | 87,565 | 28 complete |
| Arul John, full pagination | 18 | 56,237 | 18 complete |
| ExplodingWeb | 18 | 1,061 | 18 complete |
| WhichAdNetwork | 31 | 0 | 31 failed with HTTP 403 |
| Wappalyzer | 31 | 150 | 6 complete, 25 empty |
| SiteStatsDB | 31 | 0 | 31 unavailable behind a Vercel HTTP 429 challenge |
| List of Websites Using | 4 | 40 | 4 complete |
| Red Volcano | 31 | 250 | 5 complete, 26 returned HTTP 404 |
| Publisher Collective portfolio | 1 | 102 | 1 complete |
| Total | 201 | 191,990 | 88 complete, 25 empty, 31 failed, 57 unavailable |

The exact inventory and URLs live in [`phase2-sources.mjs`](../../scripts/ad-networks/phase2-sources.mjs). Each accepted domain keeps the source key, exact source URL, supplied value, and first and last observation times. Source labels remain discovery provenance and never assign an ad network relationship.

## Recurring sources

The exact URLs and stable source keys are in [`scripts/ad-networks/sources.mjs`](../../scripts/ad-networks/sources.mjs). The manifest has 39 official `sellers.json` feeds, the official EthicalAds publisher list, and the Majestic Million CSV. As of 2026-09-28, 28 seller feeds and the EthicalAds list are enabled. Majestic remains in the manifest but is excluded by default until the smaller, higher-signal queue is processed. The 11 paused feeds remain in the manifest so they can be reviewed without losing their known endpoints. Networks without a verified public feed stay in the identity catalog and can still be found through broader domain discovery and first-party checks.

| Source | Refresh | Use | Terms and access |
| --- | --- | --- | --- |
| 28 enabled official `sellers.json` feeds | Weekly | `sellers[].domain` from publisher or both seller records | These are public machine-readable supply-chain files. The collector checks each starting host and redirected destination's `robots.txt`. A seller's business domain is only a lead. Large files are parsed as a stream. Taboola has a three-minute stream limit because its feed is substantially larger than the others. |
| [EthicalAds publisher list](https://www.ethicalads.io/publishers/list/) | Weekly | External publisher links from the official curated list | The list creates candidates only. A current EthicalAds client tag must still be present before a relationship is confirmed. |
| [Google seller JSON](https://realtimebidding.google.com/sellers.json) | Weekly | Transparent Google seller business domains | The file combines AdSense, Ad Manager, and AdMob. Its domains are candidates only and never establish an AdSense relationship. It is an official machine-readable endpoint, so the collector records a narrow robots exception because the separate robots endpoint times out. |
| [Majestic Million CSV](https://downloads.majestic.com/majestic_million.csv) | Postponed | Domains newly appearing in the top million | Excluded from normal local runs. Enable later with `--include-majestic`. [CC BY 3.0](https://majestic.com/reports/majestic-million); keep the source attribution saved with each new sighting. |

Eleven feeds are paused for scheduled use following runtime access checks on 2026-09-25 to 2026-09-28:

| Network | Feed | Reason |
| --- | --- | --- |
| Raptive | [Seller JSON](https://ads.cafemedia.com/sellers.json) | `ads.cafemedia.com/robots.txt` returned 403. |
| Ezoic | [Seller JSON](https://ezoic.ai/sellers.json) | `ezoic.ai/robots.txt` timed out on repeat checks. |
| Journey by Mediavine | [Seller JSON](https://sellers.journeymv.com/sellers.json) | `sellers.journeymv.com/robots.txt` returned 403. |
| Refinery89 | [Seller JSON](https://refinery89.com/sellers.json) | Its CloudFront destination's robots file returned 403. |
| Adapex | [Seller JSON](https://adapex.io/sellers.json) | Its robots file explicitly disallows all paths. |
| Venatus | [Seller JSON](https://www.venatus.com/sellers.json) | `hb.vntsm.com/robots.txt` returned 403 after redirect. |
| Sovrn | [Seller JSON](https://lijit.com/sellers.json) | `lijit.com/robots.txt` returned 403. |
| PubGalaxy | [Seller JSON](https://www.pubgalaxy.com/sellers.json) | Its `cdn.pubgalaxy.com` redirect destination returned 403 for `robots.txt`. |
| Amazon Publisher Services | [Seller JSON](https://aps.amazon.com/sellers.json) | `aps.amazon.com/robots.txt` repeatedly returned HTTP 503. |
| Revcontent | [Seller JSON](https://assets.revcontent.com/sellers/master/sellers.json) | `assets.revcontent.com/robots.txt` returned HTTP 403. |
| BuySellAds / Carbon Ads | [Seller JSON](https://cdn4.buysellads.com/sellers.json) | The host's robots rules disallow the seller file. |

Do not enable a paused feed simply because its JSON is reachable. Check its current rules and, where needed, get permission first. The runtime robots check also fails closed for an unavailable robots file. A 404 robots file permits the specific feed request; a 403, timeout, or disallow stops that source.

## Sources not in the weekly job

| Source | Decision |
| --- | --- |
| [Chrome UX Report origins](https://developer.chrome.com/docs/crux/bigquery) | Good monthly domain source under [CC BY 4.0](https://developer.chrome.com/docs/crux/methodology/). Add after setting up a Google Cloud project, BigQuery billing controls, and a service credential. No credential is configured for this job. |
| [Common Crawl URL Index](https://commoncrawl.org/url-index) | Optional broader host discovery. Measure incremental yield and query cost, and review its [terms](https://commoncrawl.org/terms-of-use), before adding it. |
| [IAB Transparency Center](https://iabtechlab.com/software/transparency-center/) | Potential aggregated ads.txt source. Confirm export/API access and permitted use first. |
| [Fathom](https://www.fathom.tools/), [Arul John](https://aruljohn.com/blog/websites-using-ezoic-mediavine-raptive/), [ExplodingWeb](https://explodingweb.io/ad-networks/) | Conditional research leads. Recurring extraction terms are not cleared. |
| [WhichAdNetwork](https://whichadnetwork.com/terms), [SiteStatsDB](https://sitestatsdb.com/terms), [Wappalyzer](https://www.wappalyzer.com/terms/), [List of Websites Using](https://listofwebsitesusing.com/pricing) | Do not schedule bulk scraping under their current use rules. |
| BuiltWith | Excluded by the project decision. |

## Run the collector

The homelab discovery timer runs every Tuesday at 04:17 UTC. It processes the 28 enabled seller files and the EthicalAds publisher list one at a time. Majestic is excluded. A source failure is recorded without rolling back sources that already completed.

```bash
# Read-only source checks, no database credentials required.
npm run ad-networks:discover -- --kind sellers-json
npm run ad-networks:discover -- --source concert

# Write to the local SQLite database.
npm run ad-networks:discover -- --source concert --apply

# Import the two one-time Notion ZIP exports.
npm run ad-networks:import:notion -- --apply <first.zip> <second.zip>

# Inspect queue and worker progress.
npm run ad-networks:local:status -- --json

# Review exact URLs, status, and pause reasons.
npm run ad-networks:discover -- --list-sources
```

The default is a dry run. `--apply` is required for database writes. `--source` accepts a network slug or source key and can be repeated. `--kind sellers-json` selects only enabled seller feeds. The job records `source_key`, exact starting `source_url`, observation time, and domain as supplied. New domains are inserted with their original discovery status. An existing row gains a source sighting only if that source key is new to the row. A repeated source sighting does not rewrite a million unchanged rows. The script never writes `ad_network_id` or `ad_network_publisher_relationships`.

HTTP ETag, Last-Modified, candidate counts, and source failures are stored in SQLite. A 304 response skips an unchanged source. Source count drops greater than 50% cause a failure for review; disappearance from a source never deletes a candidate. The old PostgreSQL path remains available with `--store postgres` for a later controlled sync.

Check the workflow log for failed sources, unusually low domain counts, and changes in redirects or robots rules. When a source URL changes, update the manifest and this guide, run its dry run, then apply that source in development. Keep `source_key` stable across URL changes so existing provenance remains idempotent. Before a new source is scheduled, record its exact URL, extraction method, permitted use, robots result, and review date.

## Verify publisher relationships

The verifier is [`scripts/ad-networks/verify.mjs`](../../scripts/ad-networks/verify.mjs). It checks the publisher's own `ads.txt`, follows the ads.txt redirect limit, parses ads.txt 1.1 variables, and compares those signals with the reviewed network identity fields. It checks a page signature only when a network rule requires one, such as distinguishing Journey from the wider Mediavine program.

The default is a dry run. `--apply` is required for database writes.

```bash
# Inspect the next 25 due domains without writing.
node scripts/ad-networks/verify.mjs --limit 25 --verbose

# Inspect one existing candidate without writing.
node scripts/ad-networks/verify.mjs --domain example.com --verbose

# Process a bounded batch.
node scripts/ad-networks/verify.mjs --apply --limit 500 --concurrency 12

# Show the identity rules currently loaded from the database.
node scripts/ad-networks/verify.mjs --list-rules
```

The OVH scheduler claims bounded verification batches with four concurrent checks. A stopped process leaves rows recoverable when their 70-minute leases expire. The jobs container restarts after failure or reboot; persisted schedule slots catch up. Its daily online backup retains seven valid snapshots under `/data/state/backups/`. The old `worker.mjs` is a legacy local gathering entrypoint and is not the recurring production service.

### Evidence rules

| Evidence | Stored result |
| --- | --- |
| Exact reviewed `MANAGERDOMAIN` | Confirm `primary_or_exclusive_manager`. Preserve its optional country code. |
| Reviewed page signature plus a required manager domain | Confirm `active_network_use`. This supports program-level distinctions such as Journey. |
| Matching AdSense account in a `google.com, pub-…, DIRECT` ads.txt row and a live page `ca-pub-…` marker | Confirm Google AdSense `active_network_use`. The exact 16-digit account must match. |
| Reviewed live tag plus that network's `DIRECT` ads.txt system | Confirm `active_network_use`. Used for Taboola, Teads, Amazon Publisher Services, MGID, and Revcontent. |
| Official network discovery source plus a reviewed live tag | Confirm `active_network_use` for BuySellAds / Carbon Ads and EthicalAds, which may not expose a useful ads.txt manager signal. |
| Network-specific discovery lead plus the network's ad-system row | Create or refresh `needs_review`. Do not publish it. |
| Ad-system, `DIRECT`, or `RESELLER` row alone | Do not assign a network. |
| Seller JSON, portfolio, list, or other discovery source alone | Do not assign a network. |
| Unrecognized manager domain | Preserve it in the publisher check evidence for later identity research. |

Every confirmed relationship stores the checked URL, time, matched signal, ads.txt checksum, parser version, and matcher version. Public pages continue to query only `confirmed` relationships.

### Fetch policy

The fetcher uses the Public Suffix List through `tldts`, resolves every request and redirect target, rejects local and reserved addresses, permits only HTTP and HTTPS on their normal ports, and caps redirects and response size. Publisher verification reads the public `/ads.txt` file and, only when a network rule needs it, the public homepage without consulting `robots.txt`. It sends the stack127 crawler identity, prefers HTTPS, and uses a limited HTTP fallback only when HTTPS cannot be reached. A second redirect outside the publisher's registrable domain is rejected. Discovery source collectors keep their separate robots policy.

A positive parse requires a successful `text/plain` response. HTML, oversized bodies, unsupported content types, unsafe targets, and redirect violations cannot create a relationship. ETag, Last-Modified, and SHA-256 values allow unchanged files to be checked without reparsing them.

### Check and relationship states

| Result | Publisher state | Next check |
| --- | --- | --- |
| Confirmed match | `checked` | 7 days |
| Valid file with no match | `checked` | 90 days, unless an existing relationship needs a follow-up |
| Hard missing file | `checked` | 30 days, unless an existing relationship needs a follow-up |
| Unchanged file | `checked` | Uses the prior positive or negative evidence |
| Timeout, DNS failure, `429`, or `5xx` | `unreachable` | 6 hours, 24 hours, 3 days, then 7 days |
| Invalid domain or ads.txt response | `invalid` | 14 days for the response, 365 days for the domain |

Domains previously stored with `robots_blocked` were requeued when this policy changed on 2026-09-26. New verification runs do not emit that outcome.

One valid absence records a miss and keeps a confirmed relationship. A second valid absence at least 48 hours later marks it `stale`. A third valid absence spanning at least seven days marks it `ended`. Fetch failures never increase the miss counter. Positive evidence restores a stale relationship and clears its misses. A newly confirmed network is added without immediately ending another network because a site can use more than one program during a transition or by country.

### Network identity maintenance

`manager_domains`, `ad_system_domains`, `program_signatures`, and `identity_reviewed_at` are seeded into the local `ad_networks` table from [`network-identities.mjs`](../../scripts/ad-networks/network-identities.mjs). The same 45 definitions are represented by the Supabase migrations. A catalog version change requeues previously checked local publishers once, so new rules can classify stored evidence. These identity sources define matching rules and are not publisher membership evidence.

| Network | Accepted manager domain | Identity source |
| --- | --- | --- |
| Raptive | `cafemedia.com`, `raptive.com` | [Official seller file](https://ads.cafemedia.com/sellers.json) |
| Newor Media | `newormedia.com` | [Official seller file](https://newormedia.com/sellers.json) |
| AdPushup | `adpushup.com` | [Official seller file](https://adpushup.com/sellers.json) |
| Ezoic | `ezoic.ai`, `ezoic.com` | [Official seller file](https://ezoic.ai/sellers.json) |
| Monumetric | `monumetric.com` | [Official ads.txt guidance](https://www.monumetric.com/lets-rewind-what-is-ads-txt/) |
| Snigel | `snigelweb.com` | [Official ads.txt guide](https://snigelweb.atlassian.net/wiki/spaces/DOC/pages/647200769) |
| Journey by Mediavine | `journeymv.com` | [Official seller file](https://sellers.journeymv.com/sellers.json) and a `journeymv.com` page signature when `mediavine.com` manages the file |
| Setupad | `setupad.com` | [Official seller file](https://setupad.com/sellers.json) |
| Mediavine | `mediavine.com` | [Official seller file](https://www.mediavine.com/sellers.json) |
| Playwire | `playwire.com` | [Official seller file](https://playwire.com/sellers.json) |
| SHE Media | `shemedia.com` | [Official seller file](https://ads.shemedia.com/sellers.json) |
| Freestar | `freestar.com` | [Official seller file](https://freestar.com/sellers.json) |
| Publift | `publift.com` | [Official seller file](https://www.publift.com/sellers.json) |
| Refinery89 | `refinery89.com` | [Official seller file](https://refinery89.com/sellers.json) |
| NitroPay | `nitropay.com` | [Official seller file](https://nitropay.com/sellers.json) |
| Aditude | `aditude.com`, `aditude.io` | [Official seller file](https://cdn-prod.aditude.com/sellers.json) |
| Publisher Collective | `publisher-collective.com`, `network-n.com` | [Official portfolio](https://www.publisher-collective.com/our-sites) |
| Clickio | `clickio.com` | [Official seller file](https://clickio.com/sellers.json) |
| PubNation | `pubnation.com` | [Official seller file](https://sellers.pubnation.com/sellers.json) |
| Snack Media | `snack-media.com` | [Official seller file](https://www.snack-media.com/sellers.json) |
| Opti Digital | `optidigital.com` | [Official seller file](https://scripts.opti-digital.com/sellers.json) |
| Adnimation | `adnimation.com` | [Official seller file](https://www.adnimation.com/sellers.json) |
| AnyMind / AnyManager | `anymanager.io`, `anymindgroup.com` | [Official seller file](https://anymanager.io/sellers.json) |
| Venatus | `venatus.com`, `adinplay.com` | [Official seller file](https://www.venatus.com/sellers.json) and [AdinPlay acquisition notice](https://adinplay.com/about) |
| Adapex | `adapex.io` | [Official seller file](https://adapex.io/sellers.json) |
| PubPower | `pubpower.io` | [Official seller file](https://pubpower.io/sellers.json) |
| PubGalaxy | `pubgalaxy.com` | [Official seller file](https://www.pubgalaxy.com/sellers.json) |
| Media.net | `media.net` | [Official seller file](https://media.net/sellers.json) |
| Concert | `concert.io` | [Official seller file](https://concert.io/sellers.json) |
| Sovrn | `sovrn.com` | [Official seller file](https://lijit.com/sellers.json) |
| Infolinks | `infolinks.com` | [Official seller file](https://infolinks.com/sellers.json) |
| Google AdSense | None; program-specific rule | [Official site connection guide](https://support.google.com/adsense/answer/7584263?hl=en) and [ads.txt guide](https://support.google.com/adsense/answer/9785052?hl=en-GB). Confirm only when the same account appears as `pub-…` in ads.txt and `ca-pub-…` on the page. |
| The Moneytizer | `themoneytizer.com` | [Official publisher guide](https://us.themoneytizer.com/publisherguide) |
| Taboola | `taboola.com` | [Official seller file](https://www.taboola.com/sellers.json), [tag guide](https://developers.taboola.com/web-integrations/docs/js-tag), and a matching direct ads.txt system |
| Teads | `teads.tv`, `outbrain.com` | [Teads seller file](https://sellers.teads.tv/sellers.json), [Outbrain seller file](https://www.outbrain.com/sellers.json), and current or legacy live tags |
| Amazon Publisher Services | `aps.amazon.com` | [Official seller file](https://aps.amazon.com/sellers.json) and APS header tag |
| MGID | `mgid.com` | [Official seller file](https://www.mgid.com/sellers.json) and [widget guide](https://help.mgid.com/mgid-widget-code-direct-installation) |
| Revcontent | `revcontent.com` | [Official seller file](https://assets.revcontent.com/sellers/master/sellers.json), [ads.txt guide](https://help.revcontent.com/knowledge/ads.txt-for-publishers), and live widget |
| BuySellAds / Carbon Ads | `buysellads.com` | [Official seller file](https://cdn4.buysellads.com/sellers.json), official discovery source, and live BuySellAds or Carbon tag |
| EthicalAds | None; program-specific rule | [Official publisher list](https://www.ethicalads.io/publishers/list/) plus the current EthicalAds client tag |
| Sparteo | `sparteo.com` | [Official seller file](https://sparteo.com/sellers.json) |
| MonetizeMore / PubGuru | `monetizemore.com` | [Official PubGuru page](https://www.monetizemore.com/solutions/pubguru/) |
| PubFuture | `pubfuture.com` | [Official publisher platform](https://pubfuture.com/) |
| Geniee SSP | `genieegroup.com`, `genieesspv.jp` | [Official publisher service](https://en.geniee.co.jp/services/publishers/) |
| Publir | `publir.com` | [Official company page](https://subscriptions.publir.com/about-us) |

When a network changes its identity:

1. Confirm the new value from an official seller file, ads.txt guide, or program page.
2. Update `network-identities.mjs` and the matching Supabase migration.
3. Increase the matcher version when the meaning of a rule changes.
4. Dry-run known positive and negative domains.
5. Queue affected publishers for an immediate recheck.

### Monitoring and recovery

The worker writes its latest batch to `tmp/ad-networks/local-verification-summary.json` and records completed runs in SQLite. Use `npm run ad-networks:local:status -- --json` for legacy local work. For production, inspect the jobs container logs, `/data/state/verification.json`, and `/data/state/scheduler.json`. Review processed domains, outcomes, confirmed matches, review matches, and write failures. A large shift toward temporary or invalid results should stop a rollout before changing matching rules.

SQLite uses WAL mode and commits each publisher with its relationships in one transaction. A database write failure releases that row's lease and fails the batch. A process interruption needs no cleanup; the lease expires. Discovery sources never remove domains, and verification preserves ended relationships as history. Back up the database file together with its WAL file or use SQLite's online backup command while workers are active.

## Sync reviewed data to Supabase

Use a consistent SQLite backup, not a copy of an open WAL database. For example, run `sqlite3 ~/.local/share/stack127/ad-networks.sqlite '.backup /tmp/ad-networks.sqlite'` on homelab, then copy that snapshot to the machine running the sync.

Preview with `npm run ad-networks:sync -- --sqlite /tmp/ad-networks.sqlite`. Add `--apply` to write to development. The preview is read-only. The sync imports only publishers with confirmed or stale relationships, or ended relationships with a recorded first confirmation. Review candidates and never-confirmed departures stay in SQLite. It maps network slugs and publisher domains to target IDs, writes in bounded transactions, and includes the enrichment columns present in the SQLite snapshot. Older snapshots without those columns preserve target enrichment. It does not set public page dates; database triggers handle meaningful changes and queue the ad-networks cache tag.

Every applied sync also records the current UTC day's per-network counts. Repeating it on the same UTC day with the same snapshot changes no site, relationship, history, or count rows. A later UTC day adds a real daily snapshot. History begins with real observed dates; it does not invent past daily totals. A later return to an ended relationship records another observed join.

The default environment is development, read from `.env.local`. Production requires both `--environment production` and `--confirm stack127-production`, plus the coordinator's release authorization. No production schedule is enabled by this work.

The checker reads synced results only. Unknown domains return an empty result; requests do not fetch remote ads.txt files or add sites to the queue. The gathering commands below supply enrichment; a future submission flow remains separate work.


The verifier now saves complete line counts, companies, direct/reseller split, top sellers, distinct seller domains, and a bounded `ads_txt_summary.preview` excerpt from its existing fetch. The excerpt keeps the first ten source lines and the first MANAGERDOMAIN line if it occurs later, with a maximum of 4096 UTF-8 bytes. The site API returns it as `ads_txt_preview`; it stays null until stored. The `ads-txt-summary` command fetches confirmed sites still missing a complete summary. The reviewed sync includes both the summary and preview.

A binary or misencoded preview containing NUL bytes stays null in new summaries and in the PostgreSQL mapping. PostgreSQL jsonb cannot represent NUL. Existing raw SQLite previews are retained for inspection, and their measured counts are preserved. This recovery was needed for two source files during the first larger development import.

## Rebuild loaders, gates, and cache flow

The six mockup contracts and current development availability are in [the data contract](../../dev-space/ad-networks-data-contract.md). Pages consume `getAdNetworkDirectoryData`, `getAdNetworkPageData`, `getAdNetworkNichesPageData`, `getAdNetworkNichePageData`, and `getAdNetworkStatsPageData`. Both APIs use the same library gates. Table responses include `availableColumns`, `availableSorts`, `availableFilters`, actual filter values, and `effectiveSort`; the default page size is 10. Explicit page sizes from 1 to 100 remain supported. A stale shared URL asking for a missing traffic/age sort falls back to domain order.

Broad niche comparisons open once 100 sites and 80% of the relevant scope are classified. Before that, niche controls are empty and niche-page loaders return null. A network’s own Top niches block is available with one sorted site and uses the sorted sample as its denominator. Site-level fields use null individually; traffic, age, platform and publisher aggregates stay empty until populated. Manager charts hide when every manager is unknown. Niche indexing still needs the separate 500-site publication decision.

History charts need two exact month-end snapshots. Partial months are excluded and no observations are interpolated. The annual headline needs a snapshot on the exact year-ago date (February 28 for a leap-day anniversary). A sparse older snapshot never becomes a mislabeled annual change. A 90-day net-change number needs a snapshot at least 90 days old and then counts real joins minus departures. Imported baseline events never enter joins, new-site totals, or newest-site lists. Weekly scan/checker stacks require stored source provenance for every site in the week. Publisher leaderboards admit conservative business-name suffixes and omit personal or ambiguous names. These gates carry `// data-gate:` comments in lib for the January 2027 follow-up.

Applied syncs write reviewed publisher and relationship rows, capture successful check observations and real movement events, and upsert daily network counts. The five source tables (`ad_networks`, `ad_network_publishers`, relationships, events, daily counts) have statement-level report triggers. They compare public values and enqueue `ad_networks:all`, then touch all registered ad-network routes and the checker. Identical imports, leases and retry counters do not move dates. Candidate insertions/checks also refresh the public Supabase check-queue coverage. No homelab-wide queue total is inferred from the reviewed-only import.

Migrations `20261016032034` and `20261016032558` extend this coverage to verification-method changes, retained manager evidence, manager/ad-system identity changes, source attribution, and report source fingerprints. The `ad_networks:all` fingerprint includes public network/site/relationship values plus history snapshots and movement events. A cache worker can therefore detect a report change while a rebuild is running, rather than treating the shared report source as deleted.

All library caches use `AD_NETWORKS_TAG` (`stack127-ad-networks`) with no expiry timer. `targetsForEvents` invalidates that tag, lists the directory, **every network page**, the niches index, every niche route, stats, the checker, and both APIs, and purges `ad-networks-catalog` at the edge. All network paths are included because rank, overlap and shares depend on other networks too. The identity roster covers existing networks; a new network's registry page event covers its new path.

In the legacy page host, the worker calls `/api/cache/revalidate`, verifies origin pages and real parameterized API lookups through `/api/cache/refresh`, purges the edge tags, then warms the verified responses. API verification compares against uncached source loaders, including the control metadata. In Cloudflare static hosting, the existing frontend refresh workflow rebuilds published pages and refreshes the same OVH API caches before acknowledging captured events. Unpublished niche routes stay 404 until separately published; data gates do not grant publication.

The migration changes in this pass were applied only to development. Production migrations and scheduling remain coordinator release work. No new automation timer was started. The prepared OVH scheduler now includes the standalone 00:10 UTC snapshot job.

Enrichment jobs write SQLite first; the reviewed sync maps the existing enrichment columns into the explicitly selected Supabase target. The summary stores the complete distinct `ads_txt_summary.seller_domains` list for `other_sellers`; the top-sellers excerpt cannot establish that count. The sync also carries `discovery_sources` and traffic source metadata. Unknown checker domains remain read-only lookups, so the current UI must not promise to add a domain or fetch it live.

## Snigel merger (2026-10-16)

Snigel is retired as a separate network. Publisher Collective owns its `snigelweb.com` manager and ad-system aliases. Keep legacy discovery source keys as provenance; the matcher resolves their `snigel` suffix to Publisher Collective. The SQLite catalog upgrade merges old stores in one transaction, preserves the strongest relationship, earliest first confirmation, latest last confirmation, and original evidence, then deletes the retired identity. Seller lines still require the existing evidence thresholds.

The initial homelab merge combined 215 rows into 198: 175 confirmed, 4 ended, and 19 needing review. The verification service was paused during the write and resumed. Its existing backup symlink was broken; the verified pre-merge snapshot is at `~/.local/share/stack127/merger-backups/snigel-merge-2026-10-16T06-01-08.869Z/before.sqlite`. No remote source files were deployed for that operation. The old worker later reseeded its obsolete identities; see the recovery and restart requirements below. The reviewed source changes must reach the shared checkout before that worker runs again.

Applied in development only. Migration `20261016060000_merge_snigel_into_publisher_collective.sql` follows the four report migrations listed in the data contract. It updates identity aliases, merges relationships, remaps existing events and successful-check network IDs, relabels last-check slug arrays, removes Snigel, and leaves refresh triggers enabled. It creates no arrival or departure events. Both old daily aggregate series are removed because they cannot be deduplicated without historical site membership; the next sync records a fresh measured count. With no publisher data, it changes identities only; with no network identities, it does nothing. Registry retirement is a separate directory-publisher batch. PubGalaxy remains separate.

Development retirement used `tmp/page-publishing/merge-snigel/manifest.json` and `plan-dev-final.json` through prepare, preview, and apply. The publisher verified 404 and sitemap removal. Snigel's page is retired with no redirect because it was never published in production. `/ad-networks/snigel` stays unpublished and returns 404, matching the release, publication, and cache checks.

## First enrichment and queue drain (2026-10-16)

These commands run once and create no service, timer, or cron job. Code is developed in the assigned Mac worktree. Homelab runs an isolated copy at `/tmp/s127-gather-2038dd94`, with symlinks to the existing dependencies and read-only env files. The main homelab checkout is not edited. Logs and progress survive outside that copy at `~/.local/share/stack127/gather-2026-10-16/`. The pipeline removes its temporary code copy only after successful development sync and snapshot. It keeps the SQLite data, logs, progress, downloaded CrUX snapshot, and niche inputs.

Before the first write on each UTC day, confirm the online backup at `/srv/data/backups/stack127-ad-networks/ad-networks-YYYY-MM-DD.sqlite`. Start the existing `stack127-ad-network-backup.service` if needed. `gather-once` does this check before each stage. It never edits the unit. The homelab SQLite opener also checks before writes, protecting long RDAP jobs that cross UTC midnight.

The queue stalled because verification priority and confirmed-link preference always won over first checks. Its correlated relationship scan also lacked an index beginning with publisher ID. The SQLite opener now adds that index. Normal batches reserve one quarter for unchecked sites; `--unchecked-only` selects only never-checked rows. Larger leased batches keep slow hosts from leaving most workers idle. Interrupted new versions of the verifier finish in-flight checks and release unused leases. Killed older versions recover through lease expiry.

The first high-concurrency attempt exposed libuv DNS queue exhaustion. Its 151 DNS-only first-check failures were requeued, and only that process's unprocessed leases were released. The fetch policy now uses bounded asynchronous DNS checks, one active request per registrable host through body consumption, a one-second host pause, timeouts, bounded bodies, and retries with backoff. The run uses `UV_THREADPOOL_SIZE=128` for the HTTP transport's resolver. Private destinations remain blocked.

The final unchecked pass finished at 10:29 UTC: 61,959 checks, 32,497 confirmed relationships, 1,783 review relationships and no database failures. No never-checked sites remained. Its outcome counts were 31,296 matched, 10,403 no match, 6,159 no ads.txt, 2,219 invalid ads.txt, 11,881 temporary errors and one invalid domain. Temporary failures remain explicit outcomes for later retries.

### Parallel one-shot gathering and early niche batches

The user changed the run plan so summary gathering cannot block other fields. `gather-parallel.mjs` now starts summary, homepage/review, seller-name, traffic and RDAP work independently. It appends niche batches every minute while homepages arrive, and serializes development snapshot syncs whenever a step finishes. Completions arriving during a sync are combined into the next snapshot. Names, traffic and RDAP get a final catch-up for sites promoted during the homepage review. No timer, unit or cron entry is created. The original serial driver was stopped; the replacement uses the same log/state directory and removes the temporary code only after all jobs and syncs succeed.

The summary slowdown was measured in the live process: requests converged on `adstxt.mediavine.com`, and almost all worker capacity queued behind the existing shared-host limit. The sampled process had only a handful of live host slots and request timers. It was not spending that time on 100 network requests or retry sleeps. The old ETA also included 71,723 verifier summaries that needed no fetch. These are now checkpointed before network work. The runner admits at most two jobs per observed redirect destination, keeping other hosts moving; the transport still permits one live request plus a one-second pause per registrable host. Progress reports separate reused work, network throughput, active workers and the shared-host tail. A 400-site homepage sample completed in 73 seconds, including timeout tails; its first 350 completed in 15 seconds. Shared ads.txt endpoints do not determine ordinary homepage speed.

Concurrent jobs set `AD_NETWORK_FETCH_THROTTLE_DB` to the same small SQLite state file. Its atomic expiring leases preserve the host limit and post-response pause across processes, including streamed seller files. This file contains scheduling state only. The working publisher database retains its daily backup protection. Startup queries now select the fields each job needs, and pending checkpoints are filtered in SQL instead of loading every publisher's full evidence and summary into each process. RDAP uses its existing separate registry limiter. Its root-zone TLD key is `.uk` or `.br`, not the multi-label public suffix `co.uk` or `com.br`; previous unsupported-service checkpoints are revisited when the corrected bootstrap lookup has RDAP coverage.

The first 48 immutable niche batches contain 71,748 confirmed sites with measured homepages at `/tmp/s127-niche/input/2026-10-16/batch-0001.jsonl` through `batch-0048.jsonl` on homelab. Haiku can start immediately. Later exports append files with about 1,500 new rows and never rewrite or repeat a domain already exported. A final pass includes remaining confirmed sites with null homepage facts. The exporter publishes complete files atomically, so workers cannot read a half-written batch. Progress is in `niche-export.json`; inputs and results stay outside Git.

```bash
cd /tmp/s127-gather-2038dd94
RUN_STATE="$HOME/.local/share/stack127/gather-2026-10-16"
export UV_THREADPOOL_SIZE=128 NODE_NO_WARNINGS=1
export AD_NETWORK_FETCH_THROTTLE_DB="$RUN_STATE/fetch-throttle.sqlite"

# Restart the whole supervisor only after its existing children have stopped.
nohup node --experimental-strip-types scripts/ad-networks/gather-parallel.mjs \
  --state-directory "$RUN_STATE" --niche-directory /tmp/s127-niche/input/2026-10-16 \
  --concurrency 100 --cleanup-code >> "$RUN_STATE/pipeline.log" 2>&1 < /dev/null &

# Individual restarts: use only for a stopped step that the supervisor is not retrying.
restart_step() {
  nohup node --experimental-strip-types "scripts/ad-networks/$1.mjs" \
    --concurrency 100 --progress-file "$RUN_STATE/$1.json" \
    >> "$RUN_STATE/$1.log" 2>&1 < /dev/null &
  echo "$1 PID: $!"
}
restart_step ads-txt-summary
restart_step platform
restart_step publisher-names
restart_step traffic
restart_step domain-age

# One manual append; the supervisor normally calls this as homepages arrive.
node scripts/ad-networks/niche-export.mjs --incremental \
  --run-directory /tmp/s127-niche/input/2026-10-16 --progress-file "$RUN_STATE/niche-export.json"
```

Stop the supervisor by its recorded PID with `kill -TERM PID`. It forwards the signal to its own children. Summary/homepage queues stop admission and drain active requests before closing SQLite; RDAP completes its current bounded requests. Completed checkpoints remain resumable. `pipeline.json` contains current child PIDs, job states and sync state; each step has its own `.log` and `.json`. Do not start duplicate copies of a step. The shared limiter must also be set for manual restarts. RDAP's roughly 68,800 `.com` domains require at least 59 hours at the existing 20/minute limit, and network latency or backoff can extend that. Its progress file reports the largest remaining TLD and a measured estimate. Other jobs and niche classification proceed while it runs.

At 11:59 UTC the resumed summary and homepage jobs each sustained about 20 sites/second. The summary's observed shared-host tail still projected roughly six hours, so the supervisor leaves it independent. Homepage work projected about 26 minutes. Publisher-name catch-up completed in 450 seconds with 4,618 business names and 101,800 nulls for 106,418 sites (31 ambiguous cases remained null). Traffic completed in 237 seconds. Names and traffic each queued a development snapshot sync. These are run observations, not fixed performance promises; current `.json` progress files carry the changing estimates.

```bash
# One foreground run; use nohup with an external log for the long first pass.
UV_THREADPOOL_SIZE=128 npm run ad-networks:gather-once -- --concurrency 100

# Inspect actual filled/null counts and outcomes, without changing the store.
npm run ad-networks:enrichment:status

# Resume only never-checked candidates, without touching recurring rechecks.
UV_THREADPOOL_SIZE=128 npm run ad-networks:verify -- --apply --unchecked-only \
  --limit 100000 --concurrency 100 --lease-minutes 30 --time-budget-minutes 350

# Individual enrichment commands write only the local SQLite store.
UV_THREADPOOL_SIZE=128 npm run ad-networks:ads-txt-summary -- --concurrency 32
UV_THREADPOOL_SIZE=128 npm run ad-networks:platform -- --concurrency 32
# Review-only catch-up still saves homepage facts and refetches ads.txt for the exact stored signal.
UV_THREADPOOL_SIZE=128 npm run ad-networks:platform -- --review-only --concurrency 48 \
  --progress-file /tmp/s127-review-homepage.json
# After a reviewed signature change, rerun only affected networks. Repeat --network as needed.
UV_THREADPOOL_SIZE=128 npm run ad-networks:platform -- --review-only --refresh \
  --network she-media --network adapex --network adpushup --network infolinks \
  --network nitropay --network publisher-collective --network the-moneytizer --network mediavine \
  --concurrency 64 --progress-file /tmp/s127-review-signatures.json
npm run ad-networks:domain-age -- --concurrency 32
npm run ad-networks:publisher-names
npm run ad-networks:traffic

# Platform and favicon share one homepage fetch. This alias resumes the same job.
npm run ad-networks:favicon

# Each export gets a new run directory, with about 1,500 JSONL rows per file.
npm run ad-networks:niche-export -- --output /tmp/s127-niche/input

# Validate the entire result set before an atomic import. Confidence is high, medium, or low; numeric scores from 0 to 1 also work.
npm run ad-networks:niche-import -- --file /tmp/s127-niche/results/batch-0001.jsonl
npm run ad-networks:niche-import -- --file /tmp/s127-niche/results/batch-0001.jsonl --apply

# A standalone snapshot defaults to development. Production needs explicit confirmation.
npm run ad-networks:snapshot -- --environment development --apply
```

The `dev-space/ad-networks-niche/input/` path is not gitignored. Large inputs therefore stay under `/tmp/s127-niche/input/<run-date>/` on homelab. Exports contain every currently confirmed site, including null fields when no usable page was obtained. Rows are `{domain,title,description,h1,language,platform,networks}`. Use the export made after the full homepage pass for Haiku. The importer accepts JSONL `{domain,niche,confidence}` records, checks all 20 current slugs or null, rejects unknown/unconfirmed domains and conflicting duplicates, and stores confidence privately without converting labels into numeric scores. Preview mode is read-only. This describes the original offline import. Recurring classification now uses `niche-sort.mjs` on homelab, as described above.

| Command | Expected first-run time | Resume and source rules |
| --- | --- | --- |
| `verify --unchecked-only` | Hours for 138,231 sites; use the live sites/second and ETA in its summary | Existing outcomes skip; leases prevent overlapping claims. Transient failures remain retryable. |
| `ads-txt-summary` | Roughly 1 to 4 hours for 36,000 sites, depending on failures | Reuses summaries saved by the new verifier; otherwise fetches only missing summaries. Counts physical source lines and all seller rows, including duplicate rows. Evidence matching still deduplicates. Stores all seller domains, top 20, invalid counts, and the existing 4 KB preview. |
| `platform` / `favicon` | Roughly 1 to 4 hours for 36,000 sites; review-only catch-up usually tens of minutes | One homepage fetch supplies platform, favicon URL, title, description, h1, and language. Includes `needs_review` links with method `discovery_hint_and_ads_txt_system`, even without a confirmed network. Their decision also requires a fresh unconditional ads.txt fetch. Explicit signatures only. Challenge pages are not publisher content. No invented `/favicon.ico` fallback. Verifier page fetches also save reusable facts. |
| `domain-age` | More than a day for a large `.com` cohort | Reuses the shared RDAP bootstrap, fetch engine, throttle and breaker. ICANN registrable domains are deduplicated, with one worker per registry host, 20 requests/minute per TLD, and 60/minute per host. No WHOIS fallback in this job. Missing RDAP services/dates stay null. |
| `publisher-names` | About 5 to 30 minutes; large feeds and robots checks dominate | Streams permitted official seller files. Paused feeds stay paused. Requires a confirmed network plus matching exact domain and, when retained, seller ID. Only the public report's business suffixes qualify. Conflicting names stay null. A changed confirmed cohort reruns the feed, so newly confirmed sites are covered. |
| `traffic` | About 1 to 5 minutes | Uses the newest dated CrUX global CSV, validates the complete snapshot before any write, and records source month and attribution. Never uses CSV row order as rank. |
| `niche-export` / `niche-import` | Usually seconds | Export once the homepage pass finishes. Import validates every row before writing; identical results are safe to repeat. |
| `sync` / `snapshot` | Usually minutes / seconds | Create a consistent online backup with `ad-networks:snapshot-local -- --output /tmp/ad-networks.sqlite`, then sync it with `--environment development --apply`. The backup pins a read transaction so active verifier writes cannot restart it indefinitely. New SQLite enrichment columns and source provenance are included. Old snapshots without those columns leave target enrichment alone. Today-only snapshots are real observations; no older dates are invented. |

Successful/unknown enrichment attempts have SQLite checkpoints. Fetch failures have a next-day retry date. `--refresh` deliberately revisits completed homepage, summary, RDAP, or seller-name work; a normal rerun resumes and catches newly confirmed sites. Do not start duplicate enrichment processes for the same kind. The pipeline retries a failed stage with backoff and reports a terminal failure instead of silently marking it complete. `pipeline.json` and each stage's JSON file show the current state.

The homepage review follows [the review rules](../../dev-space/ad-networks-review-rules.md). Only an exact fresh system/seller-ID/type match plus a configured distinctive script tag/configuration confirms `active_network_use`. The evidence retains the ads.txt line and page signature. Shared wrappers, article text, commented-out tags, seller lists, and ads.txt alone do not qualify. Another manager keeps the link in review; this network's own manager is recorded for the separate manager-evidence path. This job never writes manager relationships. Networks with no configured distinctive signature stay unresolved.

Catalog version `2026-10-16.2` adds [the researched signatures](../../dev-space/ad-networks-signatures.md) for SHE Media, Adapex, AdPushup, Infolinks, NitroPay, Publisher Collective, and The Moneytizer, and narrows Mediavine to `/tags/`. Opening SQLite upgrades its catalog transactionally; migration `20261016084059_ad_network_verified_homepage_signatures.sql` applies the same eight network updates to Supabase. That migration is applied only to development. Concert, Media.net and Sovrn remain without safe signatures. Existing DIRECT-only guards on other networks are unchanged. New tag patterns accept either exact seller type in the review path, and the general verifier requires current seller-system corroboration. Both paths exclude article text and commented-out scripts for these tags.

The coordinator stopped the existing verification service after its shared checkout at `9a2243ab` reseeded catalog `2026-09-28.2`. It recreated a 45th Snigel identity and removed current aliases/signatures. The isolated gathering copy restored `2026-10-16.2` and the 44-network roster. The repair backup is `~/.local/share/stack127/gather-2026-10-16/before-catalog-repair.sqlite`; audit and sync reports are beside it. The repair left the shared checkout unchanged. The coordinator later disabled the obsolete verification service and discovery timer with owner approval.

Catalog seeding now checks the actual roster, aliases and signatures even when the version label is unchanged, repairs drift transactionally, and refuses to replace a newer catalog with older released code. Sync validates both the source and development catalog before writes. The niche export validates its catalog inside the same read transaction as its rows. All remaining enrichment commands open SQLite through the guarded seeder. The running pipeline continues from its isolated copy.

The recovery audit compared the pre-repair snapshot with the original merge backup and the 08:48 UTC sync snapshot. No relationship disappeared after canonical alias mapping, none of the 134 homepage-review promotions lost its status or evidence, and no measured enrichment value was cleared. No recreated Snigel relationships were present when the merge reran, and no last-check slug array still named Snigel. The old worker also touched scheduling/update metadata; that does not establish a new observation and was not backdated. Failed obsolete-worker transactions had rolled back, including its foreign-key errors for `crosswordsolver.com` and three earlier sites.

Sixteen affected sites received fresh checks in 21 seconds, with no database failures: 13 matched and three had no ads.txt. EEVblog's AdSense confirmation was recovered from fresh evidence. The four formerly confirmed links that had become stale retained that state: their repeated misses were real, and fresh checks did not reconfirm them. The scoped development repair imported 2,634 sites and 2,782 links (914 publisher updates, 930 relationship updates, no inserts), then verified 44 identities with the restored aliases and signatures. SHE Media retained 13 confirmations; Concert, Media.net and Sovrn remained at zero.

The repair sync initially misclassified two recovered confirmations as joins. EEVblog's duplicate AdSense join was removed while preserving its October 5 baseline. Crossword Solver's Publisher Collective event became a baseline at its original 08:42 UTC confirmation. Arrival classification now checks established confirmations and prior lifecycle events: a missing older check cannot manufacture a join, while a completed departure followed by a positive check can still record a return. Focused tests cover both cases. The repair reports, counts and exact history corrections are in `catalog-repair*.json` and `catalog-recheck.json` beside `pipeline.json`; `catalog-repair-sync.log` retains the original sync counters before these two history corrections.

Before verification is restarted, the coordinator must release these reviewed changes and update `/srv/data/projects/stack127` to that released commit, including the catalog, merger, seeder, matcher and verifier/store changes. From that checkout, run `npm run ad-networks:catalog -- --apply`, then the read-only `npm run ad-networks:catalog`; expect 44 identities, catalog `2026-10-16.2` or its reviewed successor, no Snigel identity, and the current signatures. The old verification service is disabled and inactive. Keep it disabled until the released checkout and catalog pass these checks.

The obsolete discovery timer is disabled and inactive too. Both `discover.mjs` and the worker's run recorder open the same SQLite catalog from `/srv/data/projects/stack127`. Keep both old jobs paused until that checkout contains the reviewed release. Existing backups and the isolated one-time RDAP job continue.

Only a fully valid, nonblank HTTP 200 ads.txt body counts an absence. Reviews remain pending after the first and second absences; a third spaced check must span at least seven days before writing `ended`, with the original null `first_confirmed_at` preserved. Absences are spaced by at least 48 hours. Failures, blocked pages, 404s, and unbacked 304s never count as absence. Per-site `homepage-review` checkpoints retain decisions and a 48-hour retry date; a changed review cohort invalidates its checkpoint. No timer is created. The progress JSON includes `review_per_network` counts and reasons for this invocation. Newly confirmed sites flow into the later RDAP, seller-name, traffic, niche-export, and development-sync stages.

### Chrome data and attribution

[Google explicitly licenses CrUX datasets under CC BY 4.0](https://developer.chrome.com/docs/crux/methodology#license). [The license allows sharing and adaptation with attribution](https://creativecommons.org/licenses/by/4.0/). The [zakird cache](https://github.com/zakird/crux-top-lists) describes its files as cached public Google CrUX data. Its repository has no standalone LICENSE file; this job uses only the underlying Google-licensed CSV data and copies no repository code. The use decision relies on Google's dataset license, rather than a guessed license for the repository's code.

The September 2026 file has 1k, 5k, 10k, 50k, 100k, 500k, and 1m magnitude buckets. Both 1k and 5k map to `top-10k`; 50k maps to `top-100k`; 500k maps to `top-1m`. The best rank for the exact hostname, treating `www` as an alias, supplies the group. Other subdomains are never merged into their parent. `not-ranked` means absent from this complete top-million snapshot, not zero traffic. One malformed upstream ACE origin is skipped and counted; too many malformed origins or an unknown rank magnitude stops the import before writes.

SQLite `enrichment_state(kind='traffic').data` records the month, Google creator, CC BY license link, source URL, cache credit, and the grouping adaptation. Sync retains it under `last_check_evidence.enrichment.traffic` in development. Keep this attribution with any public presentation of the derived traffic groups. Production publication and any visible attribution copy remain part of the coordinator's release review. No BigQuery credential is needed for this cached dataset path.
