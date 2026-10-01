# Ad network data maintenance

This guide covers Phase 3 discovery and Phase 4 verification. The homelab SQLite database at `~/.local/share/stack127/ad-networks.sqlite` is the working store. Discovery adds candidates without assigning a network. Verification reads first-party evidence and owns relationship changes. The managed databases hold the 45 network identities, with no publisher or relationship rows imported by this cleanup release. Copying reviewed SQLite results into Supabase is a separate activation step.

## GitHub preview workflows

The repository discovery and verification workflows are manual-only previews. Neither has a schedule or passes `--apply`. Discovery needs no database credential in preview mode. Verification reads candidates from PostgreSQL and writes only its summary artifact, without saving database results. Its default preview batch is 100 domains.

These workflows do not change the independent homelab workers described below. Keep production pages unpublished and draft tables private. Before enabling PostgreSQL writes or a production schedule, review the queue import, permissions, identity rules, sample results, and limits. Publication is a separate registry decision.

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

The continuous homelab worker claims small leased batches with 12 concurrent checks. A stopped process leaves the rows recoverable when their 70-minute leases expire. A systemd user service restarts the worker after a crash or reboot. The weekly discovery timer is persistent, so a missed run starts after the machine returns. A daily online backup keeps the latest seven valid SQLite snapshots under `~/.local/share/stack127/backups/`.

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

The worker writes its latest batch to `tmp/ad-networks/local-verification-summary.json` and records completed runs in SQLite. Use `npm run ad-networks:local:status -- --json` and `systemctl --user status stack127-ad-network-verification.service` to check progress. Review processed domains, outcomes, confirmed matches, review matches, and write failures. A large shift toward temporary or invalid results should stop a rollout before changing matching rules.

SQLite uses WAL mode and commits each publisher with its relationships in one transaction. A database write failure releases that row's lease and fails the batch. A process interruption needs no cleanup; the lease expires. Discovery sources never remove domains, and verification preserves ended relationships as history. Back up the database file together with its WAL file or use SQLite's online backup command while workers are active.
