# Ad networks tracker

The rule: text that is written once lives in the codebase. Data that changes lives in the database.

Mockups: `dev-space/ad-networks-mockups/`. Build plan: [ad-networks-build-plan.md](ad-networks-build-plan.md). Working data: homelab SQLite at `~/.local/share/stack127/ad-networks.sqlite`.

## Release preparation (2026-10-16)

- [x] Rebuild committed as `2038dd94`; the final Sol review approved the gathering and readiness changes for the PR.
- [x] Full first-check queue drained. Development has 106,441 confirmed sites and 44 networks.
- [x] Homepage/platform/favicon, traffic, publisher-name, and ads.txt summary passes and their development sync completed.
- [x] Old discovery timer and verification service disabled with owner approval until their checkout is updated after release. Backup and the isolated one-off gathering continue.
- [x] Prepared recurring refresh commands and systemd units without enabling new schedules.
- [x] Added compact generated report fields and covering indexes in development to avoid scanning full evidence for aggregate reports.
- [x] Fix sparse site-search timeouts by filtering and selecting the page before reading full evidence. Real pagination, search, empty results, reset, and checker recovery pass.
- [x] Resolve the Sol review findings: protected robots transport, inert HTML matching, review-signal retention, confirmed departures, catalog locking, backup destination, and page-only verification gates. Final review passed with 246 tests and one optional live-database fixture skipped.
- [x] Finish and validate all 72 final niche files and import 106,441 reviewed rows into SQLite: 85,810 accepted labels; 6,278 low-confidence suggestions withheld.
- [x] Sync all 106,441 classifications to development from the fresh post-import snapshot, preserving other enrichment and history. Accepted labels cover 80.5% of 106,538 listed sites.
- [x] Publish the niche index and all 20 child routes in development; every child exceeds 500 sites. All 21 routes passed the publisher’s public checks, including titles, canonical URLs, revisions, indexing, and sitemap membership.
- [x] Recheck totals and all six page types at 1440 and 390, with checker recovery, pagination, search, empty results, niche filtering, and oldest-domain sort.
- [x] Resolve the final import deadlock and newly active niche report timeout; bounded transaction retries, one grouped niche matrix, and mobile joining-rule readability passed focused checks and independent Sol reviews.
- [x] Commit and push the reviewed changes to draft PR #53.
- [x] Validate refreshed directory and checker release manifests against development; both previews report no changes.
- [ ] Complete GitHub PR CI on the current PR #53 head. The repository became public on 2026-10-17, and GitHub Actions can now run. Use the PR for live CI status.
- [ ] Production merge, migrations, reviewed data import, publication, and worker activation follow release authorization.

The counts below are the earlier October 15 snapshot, not current progress.

## Where we were (2026-10-15)

| Data | Count | Stored in |
| --- | ---: | --- |
| Ad networks | 45 | Supabase (draft) |
| Candidate sites | ~206,000 | Homelab SQLite |
| Sites checked | ~53,000 | Homelab SQLite |
| Sites waiting for a check | ~138,000 | Homelab SQLite |
| Confirmed site and network links | ~40,000 | Homelab SQLite |
| Links that need review | ~6,200 | Homelab SQLite |

---

## Codebase

### Network details
- [x] Luna research for all 45 networks: join rules, pay share, payment terms, payment threshold, rules, service, with a source for each fact
- [x] Opus writes it into one MDX file per network: key numbers, Joining, Pay, Rules, and Service tabs, and sources
- [x] Guide text and Q&As for each network page, with no numbers in the text

### Network logos
- [x] Square favicon icons for all 45 networks: 36 from the mockups, 9 fetched in the same style
- [x] Save them in `public/ad-networks/logos/<slug>.png`

### Niches
- [x] Final list of niches: names, slugs, and one line each
- [x] Decide niche routes: real pages, indexed only with 500+ sites

### Pages
- [x] Ad networks directory (`/ad-networks`)
- [x] Network page (`/ad-networks/<network>`)
- [x] Niches page
- [x] Niche page (built, unpublished until the niche run)
- [x] Site view inside the checker (no static site pages: 20,000 file limit)
- [x] Stats page
- [x] Checker tool (flat URL)

### Shared parts
- [x] Tabs component that search engines can read, with every panel in the HTML
- [x] Chart components with hidden data tables
- [x] Sites table with search, filter, sort, and pages

### Rebuild to match the mockups (started 2026-10-16)
- [x] Shared components that look like the mockup charts, cards, tables, and controls
- [x] Live data and hide rules for every mockup number and chart (`dev-space/ad-networks-data-contract.md`)
- [x] Directory and network pages match their mockups
- [x] Niches, niche, and stats pages match their mockups
- [x] Checker site view matches `site.html`
- [x] Side-by-side check of every page against its mockup at 1440 and 390
- [x] Sol review of the rebuild (two rounds, all findings fixed)

### Follow-ups
- [x] Disable and stop the obsolete homelab verification service (2026-10-16). Restart only after the release: update `/srv/data/projects/stack127`, run `ad-networks:catalog -- --apply` and its check, then start the service
- [x] Disable and stop the old weekly discovery timer until the reviewed code is released (2026-10-16). The one-time domain-age and ads.txt gathering and the backup timer continue
- [x] Fix the homelab nightly backup (2026-10-16: now writes to `/srv/data/backups/stack127-ad-networks`)
- [ ] January 2027: remove the `data-gate` hide rules once every data run is filling its fields
- [x] PubGalaxy: keep as its own network, with a note that it's now part of Improve Digital (Azerion)
- [x] Snigel: merged into Publisher Collective; `/ad-networks/snigel` is retired with no redirect because it was never published in production. It stays unpublished and returns 404 (homelab and dev done; production with the release)
- [ ] Watch for sites naming an Improve Digital manager line; add Improve Digital as a network then
- [x] Timeline chart type for site history in the checker
- [ ] Publish niche pages after the niche run

### Docs
- [x] Update `content_docs/ad-networks/plan.md`: niche routes, site pages, and stats
- [x] Update `content_docs/ad-networks/brief.md`
- [x] Decide on the Publisher tools catalog and widen the Domain tools brief for the checker

---

## Database

### Setup
- [x] Extend SQLite-to-development sync for real enrichment columns, discovery provenance, and traffic month/attribution
- [x] Migration: new site columns (niche, publisher name, platform, domain age, traffic group, ads.txt summary, favicon), applied to dev
- [x] Migration: history snapshot table (counts per network per day), applied to dev
- [x] Copy reviewed sites and confirmed links from SQLite to Supabase dev
- [x] Check the first enriched development sync at desktop and mobile widths: directory, network page, stats, checker, traffic sort, and age-sort APIs
- [ ] Check the dev pages, then copy to production

### Site checks
- [x] Fix first-check starvation and the missing publisher relationship index; one-shot drain started on 2026-10-16
- [x] Clear the never-checked queue: zero remain after the final 61,959-site pass finished at 10:29 UTC on 2026-10-16
- [x] Review the needs-review links with safe current signatures; promote supported matches and leave ambiguous links unconfirmed
- [x] Add exact fresh ads.txt plus distinctive homepage-signature review to the platform pass; first catch-up completed with per-network decisions
- [x] Add Luna's nine verified tag/config patterns for eight networks, seed SQLite and development, and test positive/false-positive markers
- [x] Repair the obsolete worker's catalog rollback; audit affected links, preserve the 134 review confirmations, and verify 44 networks in development

### Domain age run
- [x] Build resumable RDAP gathering with the shared engine; live smoke pass stored the first registration date
- [ ] RDAP lookup for every confirmed site

### Platform run
- [x] Build one homepage pass for platform, title, description, h1, language and favicon; first 50-site pass complete
- [x] Complete the homepage/platform pass; leave unsupported or unavailable platforms unknown

### Traffic group run
- [x] Review Google CrUX dataset license and the zakird cached-data path; no BigQuery setup needed for this path
- [x] Import September 2026 traffic groups for the initial confirmed cohort; final catch-up follows the queue drain
- [ ] Optional fallback only: set up the Google Cloud project and BigQuery limits if the cached-data path stops being usable
- [x] Assign the September 2026 CrUX traffic group to every confirmed site

### Publisher name run
- [x] Build streaming business-name gathering; initial pass found 2,356 names, with paused/failed sources left unknown
- [x] Complete the sellers.json name pass; store source-backed names and leave missing names unknown

### Niche run
- [x] Build 1,500-row JSONL exporter and atomic, validating result importer; full input export follows the homepage pass
- [x] Luna classifies all 106,441 confirmed sites in 72 batches with the reviewed rubric
- [x] Independent 400-row stratified QA and coordinator spot checks; apply corrections and withhold low-confidence suggestions. The sample is not a population accuracy estimate

### ads.txt summary run
- [x] Build full summaries and 4 KB previews; reuse verifier fetches; initial 50-site pass stored 45 summaries
- [x] Complete the ads.txt summary pass and sync available line counts, direct vs reseller, and top sellers; unavailable files remain unknown

### Favicon run
- [x] Share the homepage pass; initial 50-site pass stored 33 explicit favicon URLs
- [x] Complete the homepage/favicon pass; store explicit favicon URLs and leave missing icons unknown

### History
- [x] Run the standalone development snapshot once on 2026-10-16; same-day counts were already present
- [x] Prepare the daily sync timer, which also captures daily snapshots; activation follows release
- [x] Luna checked the Wayback Machine terms (2026-10-16; see note below)
- [ ] If allowed, fill older history from archived ads.txt files

Wayback note (2026-10-16): Technically, CDX can find captures for exact /ads.txt URLs; read each available timestamped replay to inspect its saved body. Capture availability is incomplete. The current Terms page exposes text dated 31 Dec 2014: it limits access to scholarship and research, requires noninfringing or fair use, bars interference with Archive services, and asks publications to list the Archive as a resource. CDX docs describe a default 150,000-result query limit and pagination, but publish no requests-per-second limit. Use cached, sequential, low-rate requests. A capture time is an observed-at date, not the exact start or end of a relationship; an ads.txt system line alone still shows authorization only. Link each captured snapshot and timestamp. Do not publish derived dates in the directory until the Archive confirms that this product use fits its terms. See the [Terms of Use](https://archive.org/about/terms), [CDX API docs](https://github.com/internetarchive/wayback/blob/master/wayback-cdx-server/README.md), and [Wayback API overview](https://archive.org/help/wayback_api.php).

### How often each piece of data updates

| Data | Source | How often |
| --- | --- | --- |
| New candidate sites | Network sellers.json files, EthicalAds list | Weekly; old timer paused until release |
| Site checks and links | Each site's own ads.txt | Continuous; old service disabled until release |
| Copy to Supabase | Homelab SQLite | Daily |
| Network counts history | Supabase links | Daily |
| ads.txt summary | Each site's ads.txt | With each site check |
| Publisher names | sellers.json files | Weekly |
| Traffic groups | Chrome rank data | Monthly |
| Platform | Site home page | Monthly |
| Niche | Luna with the reviewed rubric | New exports through T3, then a 6-month recheck |
| Favicon | Site home page | With the monthly homepage refresh |
| Domain age | RDAP | Once for each new site |

---

## Scripts to keep the data fresh

- [x] `discover`: finds new candidate sites (existing weekly timer is unsafe until its shared checkout is updated)
- [x] `verify` and `worker`: check each site's ads.txt and update links (existing service stopped by coordinator pending released code)
- [x] `backup-local`: backs up the SQLite file (daily timer)
- [x] `sync`: copies reviewed sites and links from SQLite to Supabase (no timer yet)
- [x] `snapshot`: saves the daily count per network
- [x] `domain-age`: RDAP lookups for new sites
- [x] `platform`: detects each site's platform
- [x] `traffic`: pulls Chrome rank data and sets traffic groups
- [x] `publisher-names`: reads business names from sellers.json files
- [x] `niche-export` and `niche-import`: prepare inputs and validate results
- [x] `niche`: Luna classification and sample review (coordinator); new exports still need a model review before import
- [x] `favicon`: fetches favicons for new sites
- [x] `ads-txt-summary`: adds the summary to the site check
- [ ] `wayback` (only if the terms allow it): one-time history backfill
- [x] `gather-once`: resumable one-shot pipeline, external logs/progress, development sync, and temporary-code cleanup
- [x] `gather-parallel`: independent one-shot steps, shared host limits, incremental immutable niche batches and snapshot syncs after step completion
- [x] `enrichment:status`: read-only filled/null counts and queue outcomes
- [x] `catalog`: validate identities read-only, or repair catalog drift with `--apply`; export and sync reject stale catalogs
- [x] Prepare recurring systemd units for the refresh jobs; install and enable them after release. Niche model review stays in T3; Wayback remains deferred

### Current one-shot gathering

Started 2026-10-16 from `/tmp/s127-gather-2038dd94` on homelab. The isolated run leaves the main homelab checkout unchanged. The owner later approved pausing the old discovery and verification jobs; the backup destination was also repaired. The never-checked queue is now empty; the final pass checked 61,959 sites and confirmed 32,497 relationships without database failures. Homepage, summary, name and traffic passes and their development sync are complete. RDAP continues in the background; final niche import is pending. At the user's request, `gather-parallel` replaced the serial driver: summary, homepage, names, traffic and RDAP run independently, sharing a cross-process host limiter. Niche exports append immutable batches as homepages arrive; completed steps trigger serialized snapshot syncs. Progress is at `~/.local/share/stack127/gather-2026-10-16/pipeline.json`, with current child PIDs, `pipeline.log`, and per-stage logs/JSON. The pipeline removes its temporary code only after success. Run `ad-networks:enrichment:status` for current filled/null counts. The `dev-space` input path is not gitignored. See restart commands and timing limits in `content_docs/ad-networks/maintenance.md`.

The first 48 niche files are ready at `/tmp/s127-niche/input/2026-10-16/batch-0001.jsonl` through `batch-0048.jsonl`: 71,748 confirmed sites with measured homepage facts. These were the initial inputs; the final Luna review uses all 72 batches described in the release checklist. Existing files/domains are never rewritten or repeated; final export includes null facts for sites without a usable homepage. Traffic catch-up finished at 11:54 UTC for 106,418 sites using September 2026 CrUX: 468 top-10k, 2,760 top-100k, 12,562 top-1m and 90,628 not-ranked. Its development snapshot sync started immediately. Later review promotions get a traffic/name catch-up. RDAP runs separately; the `.com` cohort alone has a 59-hour minimum at the existing registry limit.

Publisher-name catch-up finished at 11:57 UTC for the same 106,418-site cohort: 4,618 business names filled, 101,800 null, including 31 ambiguous cases left null. It took 450 seconds, including the cold SQLite startup scan. The supervisor queued another snapshot sync. At 11:59 UTC the resumed summary and homepage jobs each processed about 20 sites/second; summary's shared-host tail, rather than its aggregate rate, determines its remaining time. RDAP's measured largest-TLD estimate was about 66 hours. Per-job progress files supersede these observations as the run advances.

The initial enriched development sync was checked on 2026-10-16 at `http://100.91.14.95:3333` with 1280 px and 390 px viewports. After refreshing the local ad-network cache, traffic/platform columns, publisher names, traffic/platform/ads.txt charts, checker summaries and preview, and domain registration facts rendered. Traffic sorting worked through the control; oldest/newest APIs returned the measured registration date before nulls. Invalid checker input was rejected. The temporary dev server was stopped after the check. Full-cohort name, traffic, homepage and summary syncs later completed. The final niche sync is also complete; RDAP remains in the background.

The first review-only homepage catch-up ran from 08:06 to 08:24 UTC for 5,794 sites and 7,137 relationships. The cohort had grown beyond the original 6,188 relationships during discovery/checking. It confirmed five Taboola links and one Teads link, with no drops. Progress and per-network decisions are in `~/.local/share/stack127/gather-2026-10-16/review-homepage.json`, with `review-homepage.log` beside it. Concert, Media.net and Sovrn still have no safe configured signatures.

The verified-signature rerun completed at 08:48 UTC: 2,304 sites, 2,326 review links, 423 seconds. It confirmed 128 links: SHE Media 13, Infolinks 105, Adapex 2, AdPushup 3, NitroPay 1, Publisher Collective 2 and Mediavine 2. The Moneytizer had no review rows. It kept 2,198 links unresolved and dropped none; 826 SHE Media links still named a different manager. All promotions are `active_network_use`. All nine positive/negative signature fixtures and four live controls passed.

The development sync completed at 09:11 UTC with 69,821 publishers, 75,639 reviewed relationships, 32,917 observation updates, and today's 44 network snapshots. The final audit found every promotion with the correct relationship type. Two unusable binary previews map to null; raw SQLite values and measured counts remain intact. Logs are `review-signatures.json`, `review-signatures-sync-retry.log`, and `review-signatures-sync.json` in the same state directory. The main gathering pipeline was not restarted; its later platform stage catches newly added review links and newly confirmed sites. The existing service's older catalog still needs the coordinator's worker-code release.

After the coordinator stopped that service, recovery restored SQLite catalog `2026-10-16.2` (44 networks, no Snigel identity, Publisher Collective's Snigel aliases and all verified signatures). There were no recreated Snigel relationships to merge at repair time. Comparisons against the merge and 08:48 snapshots found no lost relationships, enrichment facts or review promotions. Sixteen fresh checks completed in 21 seconds without database failures, recovering EEVblog's AdSense evidence. Genuine stale links were retained. The scoped development sync applied 914 publisher and 930 relationship updates across 2,634 sites and 2,782 links, with no inserts. Development still has 44 networks and SHE Media's 13 confirmations. Two unsupported joins were corrected to the existing/original baselines, and arrival tests now cover recovery without inventing a join plus genuine returns after a departure.

Catalog guards repair same-version drift, reject catalog downgrades, and prevent stale exports or syncs. The one-shot gathering keeps running from the isolated current-code copy; remaining enrichment, export and final sync use these guards. Before restarting verification or allowing the October 20 discovery run (observed next run 09:57 IST), release the reviewed code, update `/srv/data/projects/stack127`, and run `npm run ad-networks:catalog -- --apply` followed by `npm run ad-networks:catalog`. Both old jobs can reseed obsolete identities; the enabled verification service can also restart on reboot. The coordinator subsequently disabled both old jobs with owner approval; keep them disabled until the reviewed release is installed.
