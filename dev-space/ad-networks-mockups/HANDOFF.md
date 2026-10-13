# Handoff: ad network section mockups (stack127)

You are continuing work moved from a homelab T3 thread. You are the Opus lane (design, frontend, copy). Read this whole file, then `CLAUDE.md`, then the docs listed under "Design rules". Work in the T3 worktree this thread was given. Copy this folder into it as `dev-space/ad-networks-mockups/` and keep building there. Do not commit or push unless the user asks.

## What the user asked for (latest message)

> Create mock up HTML pages with the same stack127 layout, with the exact pages and everything, giving me multiple card designs for each page and multiple UI layouts for everything. Basically an entire design mockup of all the pages, with multiple options and design styles. Keep things minimal and in line with our website design. Check the two websites I gave (https://www.fathom.tools/ and https://whichadnetwork.com/). We need to one-up them and make our pages easy to understand and navigate. Give me mockups for the tool result, the directory, each page, and all.

The user also said: noindex is not new. The registry already has `is_published` and `is_indexable`. Published with `is_indexable: false` sends `noindex, follow`, keeps its own canonical, skips JSON-LD, and stays out of the sitemap. This is confirmed in `stack127_docs/page-publishing.md` (line ~133) and `stack127_docs/page-families.md` (line 15).

## Decisions so far

The user is starting the ad network pages from scratch. Ignore the current page implementation. Keep the existing background runner and its data.

| Route | Job | Indexed |
| --- | --- | --- |
| `/ad-networks` | Main page is a tool: enter a domain, see which ad networks it uses, from its ads.txt and our network seller lists. If something looks off, note it as an extra ("things we noticed"). Promote checking your own ads.txt. Below the tool: directory of all networks. | Yes |
| `/ad-networks/niches` | Niche-based rankings: which networks lead each niche. | Yes |
| `/ad-networks/stats` | All other stats: market share, overlap, networks per site, how relationships are verified, adds and ends over time. | Yes |
| `/ad-networks/<network>` | Everything about one network: publisher list, top niches, and stats such as smallest site, newest domain, average authority, average traffic, estimated average revenue. | Yes |
| Per-site page | No index, follow. The user proposed `/ad-networks/<network>/<publisher>`. The previous assistant recommended one page per domain, `/ad-networks/sites/<domain>`, so a site with three networks has one URL, not three. The user has not answered this yet. Mock the single-domain version and say so; ask the user to confirm. | No (`is_indexable: false`) |

- No comparison pages for now. None at all.
- Previous assistant's advice the user has not yet confirmed: skip estimated revenue (it would be invented) and show traffic only with a real source. In mockups, show these slots honestly: a value marked as sample, or `—` with a hint naming the missing source. Point this out to the user again in your final message instead of silently dropping the stats.
- Reserve the slugs `niches`, `stats`, and `sites` so no network can use them.

## Competitor notes (checked 2026-10-12)

**Fathom (fathom.tools)**: "Know how any publisher makes money." Home has three lists: ad networks ranked by estimated revenue, top sites by traffic, newest domains with traffic. Nav: Benchmark, Networks, Niches, Tech, Stats. Network page (`/network/raptive`): logo, one-line description, 7 stats (publishers running it, confirmed live %, avg placements, avg bidders, sites live, not seen live, joined this month), then a big filter bar (niche, traffic, topic, geo, trend, DR, ads checks, LCP, domain age, status, platform) and a table (site, publisher, visits, global rank, platform, est. revenue, registered, category), 25/50/100 rows. A footnote explains sellers.json-only listings are excluded. `/stats` is a long numbered report: headline stats, platforms running live, demand partners, traffic buckets, DR buckets, how each network is evidenced, biggest movers week over week, tech stack, WordPress plugins, largest portfolios. Data from SimilarWeb, Tranco, Ahrefs. Weak spots: dense, jargon (bidders, placements, DR), revenue guesses, no plain explanation of labels on the page.

**WhichAdNetwork (whichadnetwork.com)**: blocks plain fetches (HTTP 403); a browser user agent with curl works. Home: search box (sites, networks, niches), then one big table of every tracked site (domain, niche, authority, first seen, networks with ✓ marks), filters for network, niche, authority. Verification labels: Confirmed both ways (network lists the site and the site's ads.txt points back), Unconfirmed (network side only), Site-declared only, No longer detected. Network page: tier (Premium or Standard), sites count, median authority, largest niche, a $39 CSV upsell, "also uses" column, first seen. Niche page: description, sites count, most common network, average authority, networks active. Compare pages: authority spread histograms and niche mix side by side. Big data blog ("best ad networks for food blogs", market share monthly, "how to find which ad network a website uses", "hardest to get into"). Method page explains labels well. Authority comes from Open PageRank. Weak spots: one giant table on home, labels explained in a long block, CSV paywall, symbols (✓ · ×) need a legend.

**How we one-up them** (the mockups should show this):
- Answer first. The lookup gives a plain sentence ("pinchofyum.com uses Raptive"), then each network with a plain label and the exact ads.txt line as proof, plus the date we checked.
- Labels in words, not symbols, explained once in a hint, not a wall of text.
- "Things we noticed" for anything off: a network in ads.txt that no longer lists the site, a missing MANAGERDOMAIN line, no ads.txt at all, two exclusive managed networks at once.
- A clear way into checking your own ads.txt.
- Simple navigation: sidebar lists Check a site, All networks, Niches, Stats, then every network with its count.
- No paywalled CSV. No jargon without a hint. Unknown shown as unknown.

## Data available (homelab SQLite, read on 2026-10-12)

The data lives only on homelab at `~/.local/share/stack127/ad-networks.sqlite`. The user stopped a heavy query there. Do not run heavy queries or browsers on homelab. Use these numbers in the mockups:

- 205,897 domains found. 53,259 checked, 138,394 waiting, 10,488 unreachable, 3,756 invalid.
- 40,370 confirmed relationships across 35,749 sites. 4,237 sites run more than one network.
- Verification methods (confirmed): ads.txt MANAGERDOMAIN 34,555; ads.txt plus AdSense account 5,189; ads.txt plus page script 623; page script only 3.
- Needs review 6,183. Ended 184. Stale 175. History starts 2026-09-26.
- Real Mediavine example rows: collegefashion.net, ecocult.com, sustainably-chic.com, each with evidence `MANAGERDOMAIN=mediavine.com` in ads.txt.

Confirmed sites per network: Ezoic 7,492; Mediavine 7,459; Raptive 6,437; Journey by Mediavine 6,119; Google AdSense 5,189; Publift 1,023; Monumetric 646; Playwire 501; Freestar 451; NitroPay 436; AdPushup 416; AnyMind / AnyManager 397; Snack Media 331; Venatus 329; Refinery89 298; Taboola 288; Infolinks 286; Setupad 277; PubPower 244; PubGalaxy 219; Clickio 186; Adnimation 153; Adapex 152; The Moneytizer 142; Snigel 118; MGID 116; Newor Media 115; Opti Digital 77; Amazon Publisher Services 72; Geniee SSP 66; Teads 56; Publisher Collective 53; PubNation 47; PubFuture 44; Aditude 38; Revcontent 28; BuySellAds / Carbon Ads 27; MonetizeMore / PubGuru 24; Sparteo 14; EthicalAds 3; Publir 1. Four of the 45 networks have none yet.

Not available yet: niche, authority, traffic, domain age, join requirements, revenue, week-over-week history. Mockups may show these with sample values, but every sample value must be visibly marked (the CSS has a `.sample` dotted underline and a mockup banner).

## Design rules

Read before building: `stack127_docs/design-system.md`, `stack127_docs/shared-ui.md`, `stack127_docs/tool-interface.md`, `stack127_docs/writing-style.md`, `stack127_docs/page-families.md`, `stack127_docs/css-architecture.md`. Key points:

- Dark first (#101010), check light. One chartreuse accent: h1 mark, one primary button, active pagination, focus ring, active tab underline. Nothing else filled with accent.
- Space Grotesk headings, Inter body, IBM Plex Mono for data and metadata. Only two body sizes (1.0625rem, 0.875rem). 2px radius. Borders, no shadows, no gradients, no tinted panels, no colored left edges, no badge soup.
- Status colors color words only, and only when the meaning is real.
- Shell: 58px top bar (logo `stack127.` and mono links "explore · kdp tools · saas tools · domain tools · labs" plus theme icon), left sidebar with a display-font title and SidebarList rows (icon, label, mono count, active row filled surface-2 with accent-ink icon), main column with mono breadcrumbs, h1 with identity icon plus one `<mark>` phrase, mono "Updated" meta row, lede.
- Entry pages use the dotted EntryHero. Tools use a full-width workbench band (surface background, strong top and bottom rules), form first, result below a divider: answer sentence, then table, then mono metadata. Network lookups show an example input and run only on button press; before the first run show the result shape with `—`.
- Tables: border, surface-2 header row, mono values. Cards: surface, 1px border, display title. Feature cards have a dashed divider above a mono count row.
- Sidebar never holds reading content. Its jobs: filters, related pages, or section jumps.
- Never grade (no good or bad, no red, yellow, or green verdicts by position).
- Copy: plain, short, friendly, sentence case, no em dashes, no hype.

Screenshots of the real site from homelab (dark, 1440 wide) are not copied here. On the Mac, run the dev server from the worktree (`npm run dev`, port 3333) and look at `/tld-directory`, `/domain-report`, and `/dns-tools` to match the shell.

## Mockup plan

Folder: `dev-space/ad-networks-mockups/`. Static HTML, one shared stylesheet and one shared script.

- `assets/mock.css` is done (copied here). It has the real tokens from `app/globals.css`, the shell, header, workbench, tables, labels, cards, metrics, bars, controls, callouts, and the mockup chrome. Mockup chrome is purple dashed (`.mk-bar`, `.mk-banner`) so it never reads as part of the design. Elements with `data-variant` show only when they have class `on`.
- `assets/mock.js` (to write): builds the top bar and sidebar from a page config, holds the shared network data above, wires the option switchers (`.mk-bar` buttons toggle `data-variant` siblings in a group), a theme toggle (`data-theme` on `<html>`, default dark), and a sticky banner saying which numbers are real and which are samples.
- `index.html`: list of every page and its options, with one line on what each option tries.
- `ad-networks.html` (`/ad-networks`):
  - Header options: A) dotted EntryHero with the lookup band inside it, B) plain task header with a workbench band below.
  - Result options: A) answer sentence plus a table (network, label, proof line, since, checked), B) one card per network found with the proof line, C) a short report: summary row, networks, "Things we noticed", ads.txt health, raw ads.txt in a closed disclosure.
  - Result states to switch between: before first run (`—` shape), found one network, found several, ads.txt says a network but the network doesn't list the site, no ads.txt, nothing found, domain unreachable or invalid.
  - "Check your own ads.txt" promotion: a short line plus a secondary button in the result, and a small block after the directory.
  - Directory options: A) ranked table (network, type, confirmed sites with a share bar, new in 30 days, top niche), B) feature-style cards with a count footer, C) fact cards (like `app-fact-card`), D) ranked bar list.
  - Then short content: how the check works, what the labels mean, FAQ.
- `network.html` (`/ad-networks/mediavine`):
  - Header with identity, type, official site, a one-line description.
  - Stats options: A) metric row, B) metric list beside a top niches chart, C) a "Can I join?" facts block first (sample values, to research), then stats. Include smallest site, newest domain, average authority, average traffic, estimated revenue as marked samples or `—` with a hint.
  - Charts: top niches, authority spread, also-uses networks.
  - Publisher list options: A) table with filters above (search, niche, authority, label), B) compact rows with chips, C) sidebar filters. Columns: domain (links to the site page), niche, authority, since, also uses, label. Pagination 50 per page.
  - Sidebar options: section jumps vs network list.
- `site.html` (`/ad-networks/sites/collegefashion.net`, noindex): networks on this site with proof lines, a timeline of first seen, last checked, and ended relationships, ads.txt health, raw ads.txt in a closed disclosure, similar sites. Two layout options.
- `niches.html` (`/ad-networks/niches`): A) table of niches with leading network and a share bar, B) niche cards with the top 3 networks each, C) a niche-by-network heatmap. All niche data is sample.
- `stats.html` (`/ad-networks/stats`): A) long numbered report like Fathom but plain, B) dashboard grid. Sections: market share (real), networks per site (4,237 multi), most common pairs (sample until queried), how relationships are verified (real), coverage of the check queue (real), added and ended per week (sample).
- Check every page at 1440 and 390 width in dark and light with headless Chrome on the Mac. Serve the folder over Tailscale (for example `python3 -m http.server 8127 --bind 0.0.0.0`) and give the user `http://100.91.14.95:8127/`. Stop the server when the user is done.

## After the mockups

Once the user picks options, rewrite `content_docs/ad-networks/brief.md` and `plan.md` to match the new routes and decisions. The current docs say no insight pages in the first release, which is out of date. Data work (niche, authority via Open PageRank or Tranco, domain age via RDAP, join facts research) goes to Luna. Site page and runtime work goes to Sol. Opus does the pages, cards, and copy.
