# Ad networks tracker

The rule: text that is written once lives in the codebase. Data that changes lives in the database.

Mockups: `dev-space/ad-networks-mockups/`. Build plan: [ad-networks-build-plan.md](ad-networks-build-plan.md). Working data: homelab SQLite at `~/.local/share/stack127/ad-networks.sqlite`.

## Where we are (2026-10-15)

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
- [x] Fix the homelab nightly backup (2026-10-16: now writes to `/srv/data/backups/stack127-ad-networks`)
- [ ] January 2027: remove the `data-gate` hide rules once every data run is filling its fields
- [x] PubGalaxy: keep as its own network, with a note that it's now part of Improve Digital (Azerion)
- [x] Snigel: merged into Publisher Collective; `/ad-networks/snigel` redirects (homelab and dev done; production with the release)
- [ ] Watch for sites naming an Improve Digital manager line; add Improve Digital as a network then
- [ ] Timeline chart type for site history in the checker
- [ ] Publish niche pages after the niche run

### Docs
- [x] Update `content_docs/ad-networks/plan.md`: niche routes, site pages, and stats
- [x] Update `content_docs/ad-networks/brief.md`
- [x] Decide on the Publisher tools catalog and widen the Domain tools brief for the checker

---

## Database

### Setup
- [x] Migration: new site columns (niche, publisher name, platform, domain age, traffic group, ads.txt summary, favicon), applied to dev
- [x] Migration: history snapshot table (counts per network per day), applied to dev
- [x] Copy reviewed sites and confirmed links from SQLite to Supabase dev
- [ ] Check the dev pages, then copy to production

### Site checks
- [ ] Clear the ~138,000 sites that are still waiting for a check
- [ ] Review the ~6,200 links that need review

### Domain age run
- [ ] RDAP lookup for every confirmed site

### Platform run
- [ ] Find the platform from page code (WordPress, Shopify, Next.js, Astro, Ghost, and so on)

### Traffic group run
- [ ] Set up the Google Cloud project and BigQuery limits for Chrome rank data
- [ ] Assign a traffic group to every confirmed site

### Publisher name run
- [ ] Take the business name from sellers.json files

### Niche run
- [ ] Haiku sorts every confirmed site into one niche
- [ ] Spot check a sample by hand

### ads.txt summary run
- [ ] Save line counts, direct vs reseller, and top sellers for each site

### Favicon run
- [ ] Fetch and store a favicon for every confirmed site

### History
- [ ] Start saving daily counts per network now
- [ ] Luna checks the Wayback Machine terms
- [ ] If allowed, fill older history from archived ads.txt files

### How often each piece of data updates

| Data | Source | How often |
| --- | --- | --- |
| New candidate sites | Network sellers.json files, EthicalAds list | Weekly (running) |
| Site checks and links | Each site's own ads.txt | All the time (running) |
| Copy to Supabase | Homelab SQLite | Daily |
| Network counts history | Supabase links | Daily |
| ads.txt summary | Each site's ads.txt | With each site check |
| Publisher names | sellers.json files | Weekly |
| Traffic groups | Chrome rank data | Monthly |
| Platform | Site home page | Monthly |
| Niche | Haiku | Once for each new site, then every 6 months |
| Favicon | Site home page | Once for each new site, then every 6 months |
| Domain age | RDAP | Once for each new site |

---

## Scripts to keep the data fresh

- [x] `discover`: finds new candidate sites (weekly timer)
- [x] `verify` and `worker`: check each site's ads.txt and update links (always running)
- [x] `backup-local`: backs up the SQLite file (daily timer)
- [x] `sync`: copies reviewed sites and links from SQLite to Supabase (no timer yet)
- [ ] `snapshot`: saves the daily count per network
- [ ] `domain-age`: RDAP lookups for new sites
- [ ] `platform`: detects each site's platform
- [ ] `traffic`: pulls Chrome rank data and sets traffic groups
- [ ] `publisher-names`: reads business names from sellers.json files
- [ ] `niche`: Haiku niche sorting for new sites
- [ ] `favicon`: fetches favicons for new sites
- [ ] `ads-txt-summary`: adds the summary to the site check
- [ ] `wayback` (only if the terms allow it): one-time history backfill
- [ ] Timers on homelab for every script above
