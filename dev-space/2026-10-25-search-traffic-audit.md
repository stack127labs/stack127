# Why stack127 gets little search traffic, and what to do next

Audit date: October 25, 2026. This is a read-only investigation and an action plan. No site code, content, settings, publication records, or production data were changed.

**Priority update, October 25:** At the owner's request, focus execution on **Bing and other search engines**. The Bing evidence below adds a more encouraging trend than Google's and changes the order of topic experiments. Preserve Google's basic compatibility and existing reports, but do not make Google indexing a prerequisite for improving or promoting pages elsewhere.

## Bing and other engines first

**Yes: Bing shows promising early movement. It does not yet show dependable traffic.** The strongest evidence is growing search exposure, a rising property index count, and actual main-site clicks. The important limits are the small sample, BaseBuddy in property totals, and searches that may come from testing.

### What is improving

| Evidence | Earlier period | Later period | Interpretation |
| --- | --- | --- | --- |
| Bing property impressions, equal 28-day periods | 85, August 28–September 24 | 1,740, September 25–October 22 | Clear growth in reported exposure, about 20 times from a very small base. Includes BaseBuddy. |
| Bing property clicks, same periods | 0 | 13 | Some searchers are clicking. The query report includes three `site:` clicks and one brand click; these cannot all be treated as new audience acquisition. |
| Bing property `InIndex` | 83 on September 10; 182 on October 1 | 392 on October 23 | Bing is expanding its recorded index, rather than showing Google's same visibility pattern. Not a reconciliation against the 418 main-site sitemap URLs. |
| Bing main-site page rows, August 28–October 16 | — | 7 clicks, 412 impressions | Separately confirms main-site activity after filtering out BaseBuddy. This is a top-page report with an earlier end date, not a complete breakdown of the 13 property clicks. |

The seven main-site page clicks were one each to Inkscape shortcuts, WPS Office shortcuts, VMware Workstation shortcuts, TablePlus shortcuts, ZFS capacity calculator, domain expiry, and the homepage. Query rows also show non-brand tasks such as `vmware workstation hotkeys`, `shortcuts for wps office`, and `zfs calculator mixed drives`. Query and page reports have different coverage and are not joined here; these observations do not identify individual visitors or prove repeat use.

This changes the topic emphasis: **accurate specialist shortcut references and technical utilities have a Bing signal worth protecting.** Do not prune those pages because Google ignores them. Windows Terminal, Pi, PowerShell, Codex, Azure DevOps, and OpenCode also have main-site page impressions in the returned Bing rows. Their samples are small, so use them as candidates for a focused test rather than reasons for another bulk page launch.

### Other engines and discovery sources

Umami's main-site referrer report for July 26–October 23 records DuckDuckGo **36**, `noai.duckduckgo.com` **7**, Bing **20**, Google **16**, and ChatGPT **17**. Brave Search, Kagi, Qwant, and Lilo each have a count of **one**. These are analytics referrer counts, not verified search-engine clicks or deduplicated new customers; owner/agent traffic remains unfiltered. ChatGPT is reported separately as a discovery source, not as conventional search traffic.

DuckDuckGo is worth including in the primary experiment. It says that its traditional links and images are [largely sourced from Bing](https://duckduckgo.com/duckduckgo-help-pages/results/sources). Improving Bing discovery can therefore help reach DuckDuckGo, though rankings and presentation can differ. Brave, Kagi, Qwant, and Lilo currently have too little site evidence to justify separate content strategies.

### Additional Bing URL checks

Read-only `GetUrlInfo` checks on October 25 returned stored crawl dates for KDP royalty (October 12 UTC), KDP PDF preflight (October 13), MRR (October 16), `.dockerignore tester` (October 8), and Pi shortcuts (October 21). This is encouraging evidence that Bing has reached pages Google has not yet indexed.

The digital-product fee page returned default dates and no usable crawl information. All six responses showed `HttpStatus: 0`; several also showed zero document size. Those API fields do not establish a live HTTP failure or successful indexing. `IsPage: true` is not an explicit indexed verdict. Confirm current eligibility in [Bing URL Inspection](https://www.bing.com/webmasters/help/URL-Inspection-55a30305), which provides an index card and a live test.

### Revised execution order

1. **Measure Bing first.** Track main-host page performance and task queries weekly. Separate BaseBuddy, brand queries, and `site:` searches. Keep property trends for context, but use relevant main-site clicks and successful tool use to judge progress.
2. **Protect and improve existing Bing performers.** Verify VMware, Inkscape, WPS, and TablePlus shortcuts; inspect Windows Terminal, Pi, PowerShell, and Codex as the next reference candidates. Keep ZFS and domain expiry in the monitored utility set. Pick the first batch by actual task fit and verification capacity, not just count.
3. **Inspect the new business pages in Bing directly.** KDP, MRR, and fees should not wait for Google before being tested. Distinguish Bing crawl history, index eligibility, relevant impressions, and clicks; each is a different step.
4. **Check IndexNow delivery.** No integration was found in the inspected repository search-service scripts, SEO documentation, or workflows. That does not rule out Cloudflare Crawler Hints or another external integration. Verify Bing's received-URL history first. If absent, plan one notification path for genuinely added, changed, or deleted URLs after publication. [Microsoft's setup guidance](https://www2.bing.com/indexnow/getstarted) explains both integration paths and states that submission does not guarantee crawling or indexing. Do not send unchanged URLs repeatedly.
5. **Keep shared quality and technical repairs.** Crawler access, correct facts, usable directory pages, clear comparisons, reliable tools, and relevant links matter beyond Google. The Google-specific HTML limit is not evidence of Bing's limit, although reducing excessive payload still benefits users and renderers.
6. **Run a six-week Bing/DuckDuckGo experiment.** Look for non-brand clicks across multiple weeks, more than one useful destination, and successful uses. Do not call a single spike or a `site:` click growth. Keep other referral sources visible, and expand only where their evidence supports it.

The earlier Google findings remain useful diagnostic history. For decisions in the remaining roadmap, substitute **Bing index and performance evidence as the primary gate**, with Google as a secondary observation. KDP remains a well-supported product experiment, but Bing's current traffic evidence is stronger for specialist shortcuts and technical utilities than for KDP or fee pages.

## The answer

**The traffic problem is real. It is a mix of limited Google indexing, a young and recently expanded site, uneven directory quality, and a strategy spread across too many search markets. It is not explained by one missing SEO tag.**

The immediate job is to get a small set of strong pages crawled, indexed, used, and recommended. Building another large batch of pages before that happens would make the same problem larger.

| Question | Finding | Confidence |
| --- | --- | --- |
| Are we getting no search traffic? | Almost none from Google. Its report shows one click to the main site in the available history. Bing records some clicks. Analytics records additional search referrals, but those are not equivalent to search-engine clicks. | Confirmed, with measurement limits below. |
| Is the whole site blocked from search? | No. All 418 sitemap URLs returned HTTP 200. None had `noindex`. Several pages are indexed in Google, and Bing is crawling the property. | Confirmed for the audit date. |
| Is Google indexing the pages we want to grow? | Often not. Of 23 selected current canonical URLs inspected, 13 were discovered but not indexed, one was unknown, and nine were indexed. | Confirmed sample, not a sitewide percentage. |
| Is this just because the site is new? | Newness matters. Most current pages were published in September or October. It does not explain away an observed September visibility drop or verified product faults. | Dates confirmed; causal contribution uncertain. |
| Is the content bad? | There are strong, sourced calculators and useful original datasets. There are also wrong reference facts, poor directory records, and pages that make readers work too hard to find the answer. | Confirmed examples, not a judgment of every record. |
| Are the topics too competitive? | Broad DNS, domain, self-host app, and SaaS terms face strong alternatives. Narrow tasks have shown more promise. Recent KDP, fee, and publisher pages have not had a fair Google test because many are not indexed. | Supported by search data and competitor review. |
| Should we wait or publish more? | Keep useful URLs stable, fix the specific faults, choose two growth tracks, and earn real usage and relevant links. Watch indexing and query evidence before expanding. | Recommended strategy, not a ranking guarantee. |

Start with the [implementation backlog](#8-prioritized-implementation-backlog) for what to do, the [topic plan](#6-topics-to-focus-on) for what to focus on, and the [measurement rules](#9-measurement-and-decision-rules) for how to judge progress. The evidence is in sections 1–5; remaining access and measurement gaps are in section 11.

## 1. What the traffic data actually says

### Google Search Console

I queried the authorized `sc-domain:stack127.com` property, using Web search and final data through **October 23, 2026**. The property includes subdomains such as BaseBuddy. For main-site analysis I filtered page URLs to `^https://stack127\.com/`.

| Main site, page-aggregated report | Clicks | Impressions |
| --- | ---: | ---: |
| Available history in the request, June 25, 2025 to October 23, 2026 | 1 | 2,138 |
| August 29 to September 25, 2026 | 1 | 1,341 |
| September 26 to October 23, 2026 | 0 | 161 |

An impression means a search result was shown, not that somebody visited. The latest 28-day page-impression count is **88.0% lower** than the preceding 28 days. At this scale, a small number of searches can change the totals substantially.

The unfiltered domain-property report returns **one click and 2,272 impressions**, including BaseBuddy. Its latest 28-day total is 52 impressions. **Do not mix these totals with the main-site table.** Google counts property and page impressions differently; several pages from the site can appear in one search. Query reports also omit private queries, and API reports are not guaranteed to expose every row. The first daily rows returned begin August 19; that is not proof of the site's first-ever visit. [Google API definitions](https://developers.google.com/webmaster-tools/v1/searchanalytics/query).

Main-site pages with the strongest historical signals, July 26 to October 23:

| Page | Clicks | Impressions | Average position | Reading of the evidence |
| --- | ---: | ---: | ---: | --- |
| `/dockerignore-tester` | 1 | 326 | 7.4 | A specific developer task already reached useful positions. One click is a lead, not validation of a large market. |
| `/self-host-apps` | 0 | 601 | 62.0 | Some discovery, but little visibility near the top of results. |
| Old `/shortcuts/cursor` | 0 | 265 | 13.5 | Preserve its redirect and combine old/new URLs when measuring. |
| Old `/shortcuts/pi-coding-agent` | 0 | 252 | 7.6 | A narrow app-specific reference had visibility. |
| Old `/shortcuts/zed` | 0 | 90 | 19.6 | Another narrow reference with a small signal. |
| `/domain-tools` | 0 | 87 | 33.4 | A broad catalog has not become a traffic source. |
| `/nginx-proxy-pass-calculator` | 0 | 38 | 34.4 | Useful task, but little search exposure so far. |

These are historical averages across different queries and devices, not today's rank for a chosen keyword. The one Google click was attributed to `.dockerignore tester`. A missing query row does not mean the page has no demand.

### The September drop needs its own investigation

Main-site page impressions totaled **766 on September 1–10** and **157 on September 11–20**. September 10 had 65; September 11 had five. The change is visible even after excluding BaseBuddy.

What the historical review established:

- The September redesign was deployed on **September 9**, with release commit `f5a23db5`. The [successful release run](https://github.com/stack127labs/stack127/actions/runs/34312953154) completed at 05:27:38 UTC.
- Its SEO diff did not introduce a broad robots block, change canonical generation, or replace sitemap logic. Its release record says original publication dates and publication flags were preserved.
- Blanket query-URL `noindex` already existed in July. It is worth improving, but it was not a new September 11 change.
- The KDP royalty publication, October fee pages, and October Cloudflare frontend move came after the drop. They cannot explain its start.
- Google's officially announced [September 2026 spam update](https://status.search.google.com/incidents/XhUDXP7A67iHCD2kmbVu) began September 24. That does not match the September 11 onset. This audit does not diagnose a spam penalty or exclude every possible algorithmic change.

**Unresolved:** historical crawl failures, Cloudflare access changes, Google-selected canonicals at the time, and Google's quality/demand assessment. A nearby release date is a reason to investigate, not proof that the release caused the drop.

Action: compare the affected URLs before and after September 11; inspect Search Console's Crawl Stats, Page indexing, Manual actions, Security issues, and Removals reports. Check retained edge/server logs around September 8–15. Confirm genuine Googlebot using Google's verification guidance, rather than trusting a user-agent name. If historical logs have expired, record that the cause remains unproven. [Google's traffic-drop investigation guide](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops).

### Bing and analytics tell different parts of the story

| Source and scope | What it returned | What it does not prove |
| --- | --- | --- |
| Bing `GetRankAndTrafficStats`, authorized site property, August 25 to October 22 | 13 clicks, 1,826 impressions. The API's page breakdown includes BaseBuddy. | These are not 13 confirmed new main-site users. |
| Bing `GetCrawlStats`, October 23 snapshot | `InIndex: 392`; 54 crawled pages; one crawl error; no reported 5xx, DNS failure, or connection timeout in that snapshot. | Do not divide 392 by the main site's 418 sitemap URLs. The report scope includes subdomain activity and is not an exact sitemap reconciliation. |
| Bing exposed query rows | Three clicks from `site:` queries and one from the brand query `stack127`. Other clicks include shortcut and mixed-drive ZFS queries. | We cannot identify who searched. Owner or audit activity could be part of these totals. |
| Umami, July 26 to October 23 UTC, filtered to hostname `stack127.com` | 3,242 pageviews, 1,550 visitors, 1,769 visits. Organic-search channel metric: 97. | These totals have not been cleaned of owner, agent, monitoring, or bot activity. They are not verified customers. |
| Google Analytics, July 26 to October 23 | 85 sessions: 84 Direct, one Organic Search. Returned monthly data appears only in October. | GA loads only after consent. It cannot measure all visits or establish several months of no traffic. |

Umami without a hostname filter also includes `version127.com`. Use the filter. Its main-site referrer counts include Google 16, Bing 20, DuckDuckGo 36, and ChatGPT 17. These differ from engine click counts because source definitions, periods, consent, attribution, repeated visits, and exclusions differ. The exact discrepancy was not resolved. Do not force these reports to agree by adding their numbers.

The live browser loaded `/vitals/core.js` and sent an Umami request. No custom-event rows were returned for the requested period. Thus there is a measurement gap between opening a tool and successfully using it.

## 2. Indexing, age, and what Google has seen

The sitemap was read by Google on **October 23**, with **418 submitted URLs, zero sitemap errors, and one warning**. The API does not describe the warning. Open it in Search Console and resolve the actual warning. Do not infer that it blocks the entire site.

The sitemap API's `indexed: 0` field is deprecated. It is **not** evidence that Google has indexed zero pages. [Google explicitly says not to use that field](https://developers.google.com/webmaster-tools/v1/sitemaps).

### URL Inspection sample

These are Google's stored indexing results, retrieved October 25. They are not live-test results. The sample deliberately covers important pages and known historical performers; it is not random.

| Google state | Current canonical URLs inspected |
| --- | --- |
| Submitted and indexed: 9 | `/`, `/self-host-apps`, `/self-hosting-for-beginners`, `/dockerignore-tester`, `/nginx-proxy-pass-calculator`, `/raidz-expansion-planner`, `/keyboard-shortcuts/pi-coding-agent`, `/domain-tools`, `/dns-tools` |
| Discovered, currently not indexed: 13 | `/kdp-royalty-calculator`, `/kdp-pdf-preflight-checker`, `/kdp-tools`, `/mrr-calculator`, `/saas-tools`, `/keyboard-shortcuts/vscode`, `/platform-fees`, `/platform-fees/digital-products-and-stores`, `/ad-networks`, `/ad-networks/mediavine`, `/launch-directories`, `/restic-retention-simulator`, `/rsync-filter-tester` |
| URL unknown to Google: 1 | `/dns-lookup` |

One extra legacy URL, `/shortcuts/pi-coding-agent`, was correctly recorded as a redirect to `/keyboard-shortcuts/pi-coding-agent`. That makes **24 inspections in total, covering 23 current canonical pages**.

For the indexed examples, Google allowed indexing, fetched successfully, and selected the intended canonical. Crawl dates varied: homepage October 24; `.dockerignore tester` October 21; nginx September 14; RAIDZ expansion August 27. Several pages now contain work that Google's stored crawl may not yet reflect.

“Discovered” tells us Google knows the URL but has not indexed it; these responses did not provide a last-crawl time. It does not establish a bad formula, a penalty, or a robots block. “Unknown” on DNS lookup is also not a live availability failure: the public URL returns 200 and appears in the current sitemap.

### Most current pages are much newer than the project

Verisign's public registry record dates `stack127.com` registration to **August 20, 2026**, and the former `version127.com` domain to **July 3, 2026**. The current domain is 66 days old. Registration is not the same as launch, but this establishes that the current brand is only about nine weeks old. Sources: [stack127 RDAP record](https://rdap.verisign.com/com/v1/domain/stack127.com), [version127 RDAP record](https://rdap.verisign.com/com/v1/domain/version127.com), retrieved directly during the audit.

The domain move and later URL changes require search engines to process new addresses. Preserve the old-domain redirects and check the Search Console migration setup. They do not imply a fixed waiting period or a mandatory “sandbox.” Google's [site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) describes recrawling and possible fluctuations, not guaranteed rankings after a set number of months.

Public page dates in the site's structured data:

| Page or group | Published date/count | Age on audit date |
| --- | --- | --- |
| `.dockerignore tester` | August 7 | About 11 weeks |
| KDP royalty calculator | September 19 | 36 days |
| KDP tools catalog | September 24 | 31 days |
| MRR calculator and SaaS catalog | September 30 | 25 days |
| Platform fees | October 1 | 24 days |
| Launch directories | October 3 | 22 days |
| Ad networks | October 21 | 4 days |
| Sitemap URL publication months | July: 43; August: 46; September: 236; October: 93 | 329 of 418, or 78.7%, have September/October dates. |

These are the site's recorded public dates, not independent proof of first deployment. They do show why “months without traffic” should not be applied equally to every new section.

**First indexing action:** choose ten useful canonical URLs, improve only their real gaps, link them clearly from relevant catalogs, run Google's live test, and request indexing once after meaningful fixes. Recheck their stored state weekly. Do not repeatedly submit unchanged URLs or use Google's restricted Indexing API for ordinary tool pages.

## 3. Technical SEO: what works and what needs repair

### Keep the working foundations

| Check | Result |
| --- | --- |
| All 418 sitemap pages | HTTP 200; unique, nonempty HTML titles and descriptions; one H1 each; no `noindex` response header or meta tag. |
| Canonicals | Point to the intended page. Homepage uses `https://stack127.com` rather than the trailing-slash spelling; this is not a meaningful competing homepage. |
| Structured data | Present and valid JSON on all sitemap pages. This is syntax checking, not a promise of rich-result eligibility. |
| Server-rendered content | Main text is in initial HTML. The site is not an empty JavaScript shell. |
| Robots | Public pages allowed; `/api/` disallowed; sitemap declared. |
| Missing route | A deliberately nonexistent path returned a real 404. |
| Legacy routes | Sample old tool and shortcut URLs permanently redirect to their current URLs. |
| Crawlable internal links | 412 sitemap pages are reachable from home in three links or fewer in the initial-HTML graph. Six old hardware directories are outside that reachable group. |
| Live frontend | Cloudflare static frontend SHA `cc3bc99f76ebd96558ae07291c65e3d031ccff20`, matching the audited checkout. Release manifest built October 25. |

Do not replace this setup with a generic SEO plugin or rebuild the whole site. The failures are more specific.

### T1. Cloudflare blocks some clients despite the documented setup

**Priority: P1. Confirmed configuration mismatch; effect on real Googlebot is unproven.**

Read-only Cloudflare API inspection returned `browser_check: on`. [The operating document](../stack127_docs/cloudflare.md#security-and-crawlers) says Browser Integrity Check should be off. Python's default client received HTTP 403 with `error code: 1010`; browser-like requests and requests labelled Googlebot/Bingbot returned 200. Cloudflare's AI crawler protection and Bot Fight Mode were off.

Cloudflare documents [1010 as a browser-signature block](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-1xxx-errors/error-1010/). This can obstruct legitimate automated readers and auditing tools. It is not proof that genuine Googlebot was denied; Google's successful stored crawls are evidence against a universal block.

- [ ] Inspect Security Events for verified search crawlers and legitimate fetchers.
- [ ] Reconcile Browser Integrity Check with the intended policy; make a narrow, reviewed configuration change if appropriate.
- [ ] Verify homepage, robots, sitemap, an important tool, and required assets with Google's live test and Bing URL Inspection.
- [ ] Add a check that catches future configuration drift. Keep useful security protections; do not disable the whole firewall.

### T2. Large directories are not exposing most records as search landing pages

**Priority: P1 design decision; phased implementation. Confirmed discovery limitation.**

`/self-host-apps` and `/self-host-apps?page=2` return the same initial HTML, **877,281 bytes**. Page two has `noindex, follow` and canonicalizes to page one. The first response includes 24 self-host app detail panels; CLI includes 30. Details are opened through controls and stored in hidden panels, rather than linked entity pages.

Code: [self-host page](../app/(site)/(directories)/self-host-apps/page.tsx), [CLI page](../app/(site)/(directories)/cli-apps/page.tsx), and [hidden details](../app/ui/directories/hidden-details.tsx).

This is not a claim that all collapsed content is ignored. The problem is that thousands of records do not have distinct, discoverable pages with a useful search promise. Google does not need to operate the picker and search through the dataset like a person.

- [ ] Choose useful category and entity destinations based on search tasks, not every database row.
- [ ] Give each chosen page a normal link, substantial useful facts, source dates, and its own server-rendered HTML and canonical.
- [ ] If numbered listing pages are needed for discovery, render distinct records at each URL and use self-canonicals. Simply removing `noindex` from today's identical responses is not a fix.
- [ ] Keep arbitrary filters and searches out of the index. Pilot a small set before scaling.
- [ ] Update the existing static-export, caching, publication, and SEO rules together. This is an architecture change, not a page-only toggle.

[Google's pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading) explains distinct page URLs, crawlable links, and self-canonicals.

### T3. Fee-page HTML is too large

**Priority: P1. Confirmed size problem; rendering loss is a risk requiring a live rendering test.**

| URL | Uncompressed HTML bytes |
| --- | ---: |
| `/platform-fees/creators-and-communities` | 3,137,639 |
| `/platform-fees/creative-assets` | 2,555,705 |
| `/platform-fees/teaching-and-courses` | 2,186,025 |
| `/platform-fees/digital-products-and-stores` | 2,105,036 |
| `/platform-fees/apps-and-software` | 2,078,164 |

Googlebot's documented limit is **2 MB of uncompressed data per supported non-PDF resource**. Four pages exceed even 2 MiB; apps/software is also close enough to require attention. Compression makes browser transfers smaller but does not remove this crawl limit. [Googlebot documentation](https://developers.google.com/search/docs/crawling-indexing/googlebot).

The visible main content ends before 1.2 MB in the sampled large pages. The tail beyond the documented cutoff contains React data used to make the page interactive. The verified problem is **oversized responses that risk truncation and incomplete rendering**. Google's actual rendered result for these URLs still needs testing; the audit does not establish that Google misses every fee or rejects the whole URL.

- [ ] Remove unnecessary repeated HTML and inline component data.
- [ ] Keep essential comparison facts in lean server-rendered markup.
- [ ] Split content by a genuine reader task where appropriate; do not create many near-identical keyword pages.
- [ ] Set a practical byte budget with room below the crawler limit. Treat 1 MB as an internal warning threshold, not Google's ranking rule.
- [ ] Verify Google's rendered HTML, core text, links, and interactive fallbacks after the change.

### T4. Every query string gets `noindex`, including tracking parameters

**Priority: P2. Confirmed overbroad policy, not a blanket block of clean pages.**

`/dns-lookup?utm_source=audit` returns 200 with `X-Robots-Tag: noindex, follow`, despite canonicalizing to `/dns-lookup`. The active rule is in [Cloudflare frontend configuration](../scripts/stack127/frontend/cloudflare.mjs); `proxy.ts` does not run for static public HTML.

- [ ] Classify query parameters: tracking-only, tool state, filters, search, pagination.
- [ ] For tracking-only duplicates, prefer clean canonical consolidation and consistent internal links.
- [ ] Retain intentional exclusions for low-value filtered/search states.
- [ ] Test state-sharing URLs and their canonical target before changing shared rules.

Google [recommends canonical signals rather than `noindex` for consolidating duplicates](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls). This finding does not demonstrate that a query URL's exclusion removes its clean counterpart.

### T5. Some useful detail pages are intentionally excluded

**Priority: P2 review, P3 expansion.**

`/launch-directories/product-hunt`, `/launch-directories/alternativeto`, and `/launch-directories/compare` return 200 with `noindex, follow`. They are absent from the sitemap by design. Their existence should not be counted as search coverage.

- [ ] Review a small number of entity pages for unique facts and independent usefulness.
- [ ] Enable indexing only for pages that satisfy a distinct search task; leave thin or comparison-state pages excluded when appropriate.
- [ ] Verify the exact registry rows, rebuilt public HTML, and sitemap after publication. A database flag alone is not the public release.

### T6. Keep migration and navigation stable

**Priority: P2 for preservation; P3 for small redirect improvements.**

Old shortcut URLs still have search history. Google's inspection confirms the Pi shortcut redirect and the new canonical. Keep those redirects and report old and new URLs together. Do not rename working URLs just to add more keywords.

The six home-unreachable sitemap pages are `/local-security-cameras`, `/matter-devices`, `/nut-compatible-ups`, `/z-wave-devices`, `/zigbee-coordinators`, and `/zigbee-devices`. They link among themselves; they are not necessarily devoid of all incoming links. Decide whether to maintain and link them, or retire them deliberately after checking traffic and backlinks. Do not redirect unrelated hardware content to the homepage.

`http://www.stack127.com/...` first redirects to HTTPS www, then to the apex host. The sampled trailing-slash URL uses a temporary 307. Cleaning these up is useful housekeeping, but neither is a convincing explanation for nearly zero traffic to clean HTTPS URLs.

### Performance and mobile: no invented score

The homepage and KDP royalty page loaded in under one second in one desktop browser session. The fee page transferred about 114 KB compressed even though its uncompressed HTML was 2.1 MB. These are local observations with cache effects, not real-user Core Web Vitals or a slow-phone test.

At 390 px, the KDP calculator and fee listing had no document-level horizontal overflow. A valid KDP example, 200 black-and-white paperback pages at $12.99, returned $4.39. Zero pages produced an input error. The fee search reduced the list to Gumroad and updated its URL. These checks establish basic operation, not correctness of every calculation or fee record.

The PageSpeed API returned HTTP 429 because its daily quota was unavailable. No Lighthouse score or field-performance verdict is reported. After fixing large responses, inspect real-user loading speed (LCP), response to interaction (INP), and visual movement (CLS), plus a mobile lab run. [Current Web Vitals guidance](https://web.dev/articles/vitals) sets good thresholds at LCP at most 2.5 seconds, INP at most 200 ms, and CLS at most 0.1 at the 75th percentile.

## 4. Content and product quality

The content review directly sampled 25 live pages across tools, catalogs, directories, reference pages, the course, and site pages. The full HTML inventory covered all sitemap pages; it did not fact-check every shortcut, fee, app, or network record.

### Preserve these strengths

| Asset | What is already useful | Next improvement |
| --- | --- | --- |
| [KDP royalty calculator](https://stack127.com/kdp-royalty-calculator) | Current US rules, worked examples, the one-cent print-price threshold, official sources, limits, and relevant next tools. | Get the existing page indexed and used. Add marketplaces only when they can be maintained accurately. |
| [MRR calculator](https://stack127.com/mrr-calculator) | Definitions and examples distinguish recurring revenue from one-off income; sources and billing-dashboard differences are explained. | Show specific reconciliation tasks rather than compete only for “MRR calculator.” |
| [Dockerignore tester](https://stack127.com/dockerignore-tester) | A concrete task, useful edge-case explanations, and an observed Google click. | Add or improve reproducible problem examples, then put it in front of developers who face them. |
| [Ad-network data](https://stack127.com/ad-networks) | Observations of which networks sites use, linked sources, dated evidence, and stated uncertainty. | Explain observed relationships clearly. Do not imply that a network pays well, accepts applicants, or is the only provider because it appears in ads.txt. |
| [Launch directories](https://stack127.com/launch-directories) | Costs, link types, review times, and source checks in a maintained dataset. | Help people choose a shortlist and finish submissions, rather than treating directory count as the whole benefit. |
| [About](https://stack127.com/about) | A named founder, writing background, contact details, GitHub projects, and affiliate disclosure. | Connect this accountability to pages that contain research or recommendations. |

These strengths argue against a blanket rewrite or removal of all AI-assisted content. Check the output's accuracy and usefulness. Automation is not a substitute for verification, but it is not by itself evidence of a penalty. Google's [people-first content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) emphasizes original value, focus, reliability, and clear responsibility.

### Q1. Fix incorrect shortcut facts before expanding that directory

**Priority: P1. Verified user-visible errors.**

The live [Figma shortcut page](https://stack127.com/keyboard-shortcuts/figma) maps `Shift+A` to showing/hiding the layers panel. Figma's own [auto-layout guide](https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma) assigns it to adding auto layout. Its [layer-selection guide](https://help.figma.com/hc/en-us/articles/360040449873-Select-layers-and-objects) documents the panel shortcut separately.

The same page maps the macOS eyedropper to `Cmd+C`, and Windows to `Ctrl+C`. Figma's [eyedropper documentation](https://help.figma.com/hc/en-us/articles/27643269375767-Sample-colors-with-the-eyedropper-tool) specifies `Control+C` or `I` on Mac and `I` on Windows. The page's broad source citation is insufficient for these individual claims.

- [ ] Correct these rows using the official references and a real app check.
- [ ] Audit a small, risk-based sample across operating systems and contexts in the shortcut directory. Expand the audit if errors repeat.
- [ ] Label app version, operating system, and context where shortcuts differ. Do not invent Linux bindings from Windows behavior.
- [ ] Make “not documented” an explicit gap, not a usable shortcut row.
- [ ] Prioritize developer and creator apps with real audience fit and impressions. Keep the cheat-sheet workflow as a useful differentiator.

Do **not** automatically noindex a page because it has fewer than 25 shortcuts or fewer than a chosen number of words. A short complete reference can be useful. Review accuracy, task completion, audience fit, duplication of the official source, and actual use. A nine-command reference that solves a task is better than a padded list of 50 commands.

### Q2. Clean the self-host app dataset and its default ordering

**Priority: P1 for the visible default results.**

[Self-host apps](https://stack127.com/self-host-apps) has the strongest main-site impression count, but its initial popular results include `CouchDB-Offical-Docker-v1.x`, `immich-redis`, `makerworks-postgres`, and `Lucia-PostgreSQL` alongside real applications. Dependency containers and image variants make a “find an app” directory harder to trust.

- [ ] Separate applications from dependencies, example stacks, images, and duplicate variants.
- [ ] Merge duplicates while preserving valid source facts; do not blindly delete related records.
- [ ] Show readable product names and explain what the popularity order measures.
- [ ] Recalculate the displayed app count after cleanup. Do not defend an inflated count as SEO value.
- [ ] Keep useful resource facts, but distinguish vendor minimums from measured recommendations and unknown values.

This is a stronger improvement than adding more records or increasing the count in the title.

### Q3. Turn research notes into usable decisions without hiding uncertainty

**Priority: P1. Confirmed copy and presentation problem.**

[AdPushup's page](https://stack127.com/ad-networks/adpushup) exposes field notes such as “Soft signal in vendor small-publisher article” and warnings to verify an old offer. The same revenue figure appears in several blocks. [The fee directory](https://stack127.com/platform-fees/digital-products-and-stores) shows a SendOwl note comparing conflicting table and FAQ bandwidth figures.

- [ ] Explain uncertainty once in plain language beside the number it limits.
- [ ] Separate a current confirmed requirement from a vendor example, historical term, or unknown value.
- [ ] If sources conflict, state both, link them, and avoid a falsely precise recommendation until the conflict is resolved.
- [ ] Remove repeated versions of the same fact. Keep the evidence and check dates accessible.
- [ ] Sample other records produced by the same research/import workflow; fix the shared presentation pattern where it repeats.

Do not merely hide caveats or choose the lower number to make the display look cleaner.

### Q4. Deliver the title's comparison near the start

**Priority: P1 on the digital-product fee page.**

The SEO title promises **Gumroad vs Payhip vs Etsy fees**. The page opens as a 72-platform directory, and its worked comparison near the end covers Gumroad and Sellfy. A visitor looking for the promised three-way decision has substantial work to do.

- [ ] Put a compact comparison of the named platforms before the long directory.
- [ ] Show net proceeds for a few explicit scenarios, such as a $5, $20, or $100 product, with monthly sales, seller country, fixed fees, processing, and optional charges stated.
- [ ] Compare equivalent plans and routes to sale. A marketplace-discovered sale is not the same as a direct sale.
- [ ] Distinguish “percentage before other fees” from actual money kept. Include fixed charges and monthly-plan allocation in the worked result.
- [ ] Explain merchant-of-record and tax responsibilities without turning the page into unsupported tax advice.
- [ ] Keep the full directory available below the answer. If the page remains only a directory, change its promise to match.

Recheck official price sources before implementing any example. The audit verifies the mismatch in intent and layout, not every fee in the dataset.

### Q5. Make ownership and checking visible where they matter

**Priority: P2. A trust improvement, not a guaranteed ranking signal.**

The About page names Ravi Teja KNTS. The course uses “Raviteja KNTS.” Sampled tools and directories generally show update dates but no named checker. Prefer one name and a brief link to the person responsible on research-heavy pages. Explain what was checked, against what source or test, and when.

Do not add fake qualifications, invented first-hand experience, or a decorative reviewer label. A calculator's methodology and tested examples may be more useful than a large author box. Use `Person`, `Organization`, or software structured data only when it accurately describes visible content; adding schema is not an indexing cure.

### Q6. Fix the course's missing Docker permission explanation

**Priority: P1 for reader safety; not presented as a cause of the traffic problem.**

The [Docker installation lesson](https://stack127.com/self-hosting-for-beginners/install-docker) recommends adding the user to the Docker group for convenience, without stating the privilege this grants. [Docker's official documentation](https://docs.docker.com/engine/install/linux-postinstall/) says that group has root-level privileges.

- [ ] Explain the consequence next to the command, and link the official rootless option where relevant.
- [ ] Give a short recovery path when the test fails or group membership has not refreshed.
- [ ] Re-run the lesson's commands in the documented supported environment during the future content fix.

### Q7. Reduce the strategy spread, not useful content indiscriminately

**Priority: P1 editorial decision, followed by P2 navigation work.**

The current sitemap has **218 keyboard-shortcut child pages** and **66 ad-network child pages**, compared with 15 course lessons, eight fee sections, and 111 root-level pages. The homepage leads with DNS, domains, and storage before KDP; SaaS appears later in the catalog grid.

These counts do not prove a Google “topical authority penalty” or a crawl-budget limit. They do show that maintenance and search destinations are weighted toward broad references, while the stated product focus has recently shifted.

- [ ] Choose two growth tracks for the next 60 days; the topic plan below recommends specific developer tasks and KDP publishing decisions.
- [ ] Feature the best tools and starting tasks from those tracks on home and their catalogs.
- [ ] Connect related pages through useful next steps, such as royalties to profit, or an ignore-pattern explanation to a live tester.
- [ ] Keep useful secondary resources available. Assess old hardware and unrelated consumer-app references individually.
- [ ] Stop using new-page count as a progress metric.

Minor title-case inconsistencies, a `| stack127` suffix on Labs, and a title over a nominal character limit are lower-priority editing tasks. They are not a credible explanation for the indexing pattern. Also revise deterministic wording in the internal writing guide: completing a visitor's task improves the page, but does not guarantee that it ranks.

## 5. Competition and the gap stack127 can realistically fill

Competition is query-specific. A site can lose “domain age checker” and still attract users for a precise domain-transfer failure. A large competitor list does not establish search volume, and an attractive keyword does not establish that stack127 can win it.

| Area | Direct alternatives reviewed | What stack127 needs to offer |
| --- | --- | --- |
| KDP royalties and book setup | [Amazon's pricing rules](https://kdp.amazon.com/en_US/help/topic/G200634560), [Kindlepreneur calculator](https://kindlepreneur.com/kdp-royalty-calculator/) | Accurate current rules plus a decision the reader can act on: price thresholds, delivery-cost tradeoffs, minimum price, file checks, and handoffs to the next task. |
| Self-host software | [Awesome-Selfhosted](https://awesome-selfhosted.net/), [selfh.st apps](https://selfh.st/apps/) | A cleaner, task-specific comparison with defensible resource, maintenance, deployment, and license facts. A larger count alone will not beat a trusted list. |
| Shortcut references | Figma's [official keyboard documentation](https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard) and in-app help | Correct platform/context bindings plus a printable cross-app workflow. Repeating the same official nine keys has little independent advantage. |
| Launch directories | [startups.fm](https://startups.fm/blog/best-free-startup-directories), [Position Digital](https://www.position.digital/?p=14164), [WitsCode](https://witscode.com/resources/saas-launch-playbook/saas-directories) | Verifiable cost, eligibility, wait time, required assets, and what happens after submission. Avoid framing paid submissions as a ranking shortcut. |

One concrete advantage is freshness: on the audit date Kindlepreneur's explanatory text still described the US 70% eBook band as $2.99–$9.99. Amazon now documents $2.99–$12.99, and stack127 explains the change. This is a verified gap in that competitor's text, not a full audit of its calculation engine. Kindlepreneur offers marketplace choice; stack127 explicitly limits its current tool to Amazon.com/USD.

The launch-directory comparison also shows that no single headline count wins the task. Position Digital advertises a larger list; WitsCode offers checked link information with a gated tracker; stack127's dated source checks are useful. Build on the verifiable fields and submission workflow, rather than claiming nobody else has the data.

The site's own Google evidence favors narrow tasks so far: `.dockerignore tester` and Pi shortcuts have better historical positions than broad self-host app queries. That is enough to justify a focused experiment. It is not enough to abandon every unindexed new topic or forecast traffic.

## 6. Topics to focus on

**Use two growth tracks for the next 60 days: developer troubleshooting and KDP publishing decisions.** Keep DNS and fees as measured secondary experiments. This is an allocation of effort, not a recommendation to remove every other useful page.

The queries below are research targets, not measured search volumes. No reliable keyword-volume or difficulty dataset was available. Community questions establish that a problem exists; they do not establish how many searchers will visit stack127.

### Track A: solve a developer's exact configuration problem

| Priority | Queries and reader task | Existing destination | Work to do |
| --- | --- | --- | --- |
| A1 | `.dockerignore tester`; `.dockerignore pattern not working`; `exclude everything except files in dockerignore` | `/dockerignore-tester` | Make the tester's deciding-rule explanation easy to find. Check the examples against Docker semantics, and offer useful example inputs for exception ordering and Dockerfile-specific overrides. Review the actual query/device breakdown before changing its title. |
| A2 | `rsync include exclude tester`; `rsync include folder exclude everything else`; `rsync filter order` | `/rsync-filter-tester` | Verify example outputs against rsync and connect explanations directly to loaded examples and a safe dry-run command. The page already covers rule order and folder inclusion; avoid publishing a duplicate article that repeats it. |
| A3 | `pi coding agent shortcuts`; app-specific Cursor and Zed shortcut tasks | Existing `/keyboard-shortcuts/<app>` routes | Correct and verify the reference before promotion. Identify app version, OS, and shortcut context. Preserve old redirects and combine old/new URL performance. Expand only when a real missing workflow warrants it. |
| Candidates | `nginx proxy_pass trailing slash`; `restic forget keep daily unexpected snapshots` | `/nginx-proxy-pass-calculator`, `/restic-retention-simulator` | Both pages already address these problems. Check demand and competitors separately before spending on new content. Meanwhile verify their worked cases and measure crawl/indexing status. |

The `.dockerignore` opportunity has the strongest direct site evidence: 326 impressions and the only Google click. It is still a very small sample. Alternatives include [VoriTools](https://voritools.com/dockerignore/) and [CloudOps Toolkit](https://www.cloudopstoolkit.com/dockerignore-pattern-tester). Stack127 already exposes the deciding rule, a trace, Dockerfile-specific rules, and local browser processing. The opportunity is to make this useful result discoverable and dependable, rather than inventing a missing feature.

[Docker's build-context documentation](https://docs.docker.com/build/concepts/context/) explains pattern handling and precedence. [This Stack Overflow question](https://stackoverflow.com/questions/66891191/how-do-i-exclude-everything-except-go-files-in-dockerignore) is a concrete exception-rule use case. Keep the tool's documented compatibility boundary with Moby `patternmatcher` visible. For the other tools, use the [rsync manual](https://download.samba.org/pub/rsync/rsync.1#FILTER_RULES), [NGINX proxy documentation](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass), and [Restic retention documentation](https://restic.readthedocs.io/en/stable/060_forget.html) as correctness references.

**Maintenance:** low to medium. These tools do not require thousands of commercial records, but semantic correctness matters. Prefer a handful of regression cases for tricky behavior to more explanatory text that has not been tested.

### Track B: help a KDP author finish a publishing decision

| Priority | Queries and reader task | Existing asset to use | Work to do |
| --- | --- | --- | --- |
| B1 | `KDP royalty calculator`; `KDP minimum list price`; pricing just below or above a royalty threshold | Royalty, minimum-price, and print-profit tools within `/kdp-tools` | Connect price floor, royalty, and actual profit. Keep the current US/USD scope explicit. Preserve the existing threshold examples and explain the inputs needed for each next step. |
| B2 | `why did KDP reject my PDF`; `KDP bleed page size`; `KDP PDF font check` | `/kdp-pdf-preflight-checker` and related setup tools | Show a concrete failure, the correction, and the checks the tool cannot perform. Use non-private sample files. Do not claim that passing this tool guarantees Amazon acceptance. |
| B3 | `KDP break even ACOS`; `maximum CPC for a book`; royalties versus ad spend | Existing break-even ACOS and profit tools | Connect royalty per sale to advertising limits and explain assumptions about conversion rate and attributed sales. Clearly separate royalty, contribution after ads, and final business profit. |

The current KDP pages already contain substantial examples and source material. Their absence from search is not proof that they need a rewrite. First check the rendering, links, and indexing of the existing destinations.

Direct competitors include [Amazon's own print calculator](https://kdp.amazon.com/en_US/help/topic/GSQF43YAMUPFTMSP), [Kindlepreneur](https://kindlepreneur.com/kdp-royalty-calculator/), and [KDPBook](https://kdpbook.io/kdp/royalty-calculator). Some offer multiple marketplaces. Stack127's opportunity is a clear sequence from file problem to minimum price to royalties to advertising decision. Add UK, Germany, Canada, or Australia only after verifying the separate costs, currencies, and rules, and seeing user demand for that expansion.

**Maintenance:** medium to high. Assign an owner to check Amazon's pricing, royalty, printing, and file requirements when they change. Keep each financial example reproducible and dated. Confidence in the task fit is medium; confidence in near-term traffic is low while the pages remain unindexed.

### Secondary experiment C: diagnose a DNS change

Use the existing [`/dns-change-checker`](https://stack127.com/dns-change-checker) for `DNS change still showing old record`, `DNS propagation checker`, and `how long does DNS propagation take`.

It already compares authoritative nameservers with seven public resolvers, accepts an expected value, and reports TTLs. That supports a useful diagnosis: distinguish the published authoritative answer from a cached recursive answer. Explain negative caching and the old TTL using [Cloudflare's DNS troubleshooting guidance](https://developers.cloudflare.com/dns/troubleshooting/dns-issues/). Alternatives include [nslookup.io](https://www.nslookup.io/dns-propagation-checker/) and [IP Network Tools](https://www.ipnetworktools.net/dns-propagation-checker).

Keep the limits clear: seven resolvers are not a worldwide geographic propagation test. Improve the explanation and measure the current page; do not launch a second propagation checker. This is a crowded market and a secondary experiment, not a reason to expand every DNS topic.

### Secondary experiment D: answer one fee comparison well

Start with **Gumroad versus Payhip**, with Etsy included if the title continues to promise it. Target `Gumroad vs Payhip fees`, `fees on a $2 ebook sale`, and a specific monthly sales break-even decision. Improve `/platform-fees/digital-products-and-stores` first.

[CreatorMarketplaces' comparison](https://creatormarketplaces.com/compare/gumroad-vs-payhip/) provides a verdict and take-home examples. Stack127's 72-platform breadth is useful for exploration, but does not replace that direct answer. Follow Q4: show equivalent scenarios, processing, fixed fees, plans, and sale channel separately. [Gumroad's pricing](https://gumroad.com/pricing) distinguishes direct sales and Discover sales; the implementation must preserve that distinction. Recheck Payhip and Etsy's official current terms before calculating their examples.

Only after the existing page is crawlable, indexed, and useful should a small **five-to-ten-page pilot** be considered for individual platforms or comparisons. Each proposed page needs a different user task, sufficient verified facts, and a maintenance owner. Do not create many near-identical fee pages or a calculator dependent on completing the entire dataset.

### What to defer

- More generic MRR, SaaS, domain-age, DNS, and royalty calculators where stack127 already has a working destination.
- Expanding the self-host directory count before cleaning the existing records and choosing useful categories.
- Bulk consumer-app shortcut pages, generic “best tools” articles, and smart-home expansion unrelated to the chosen growth tracks.
- More ad-network child pages before the current October 21–25 batch has been checked and observed in search. Preserve the useful site evidence and improve the explanations first.
- New pages aimed mainly at a year suffix, keyword variation, or a promised search volume that has not been measured.

Keep useful existing secondary pages stable. “Defer” means do not spend the next production cycle expanding them; it does not mean bulk-delete or bulk-`noindex` them.

## 7. Distribution and authority

The audit did not obtain a comprehensive backlink index. Bing's reported `InLinks: 1` is not proof that the site has only one backlink. Domain age is not a substitute for measuring reputation, and an unindexed page cannot be fixed by declaring it authoritative.

For the first two growth tracks:

1. Find five real users with the exact task: a developer debugging ignore rules, or an author checking a file or price. Observe whether they finish the job and what they misunderstand. Treat five as an initial research batch, not statistical validation.
2. Publish one reproducible worked case per track using public or synthetic inputs. Show the failure, inputs, result, and limits. Link the relevant existing tool.
3. Identify relevant documentation maintainers, tutorial authors, or specialist communities whose material the tool actually improves. Offer a useful tested example and let them decide whether to mention it. Do not buy links or send mass requests.
4. Answer real questions where the community permits it. Give the answer in the post and disclose ownership when linking stack127. A dropped link with no answer is not useful distribution.
5. Record referral visits and successful uses separately from search clicks. Relevant mentions and repeat use are progress even before search traffic develops.

The directory of launch sites is not a mandate to submit stack127 to every listing. Choose relevant audiences and judge leads or use, not the advertised “domain authority” of the listing. Google treats links created mainly to manipulate ranking as [link spam](https://developers.google.com/search/docs/essentials/spam-policies#link-spam).

No outreach, submissions, messages, or link purchases were performed in this audit.

## 8. Prioritized implementation backlog

Effort estimates below are planning ranges, not quotes. “Small” means roughly half a day or less, “medium” one to three working days, and “large” requires a separate scoped batch. External crawl/indexing delays are not included. Owners describe the work needed; this audit does not schedule or authorize implementation.

| Order | Work and finding IDs | Owner | Effort | Definition of done |
| --- | --- | --- | --- | --- |
| 1 | Resolve crawler access uncertainty and the September drop evidence gap: T1, section 1 | Sol technical; owner for authenticated search reports | Medium, depending on retained logs | Current verified crawler access checked; relevant Cloudflare setting reconciled; Crawl Stats, sitemap warning, indexing, Manual actions, Security issues, and Removals reviewed. Historical cause stated only if supported. |
| 2 | Correct Figma reference and Docker permission explanation: Q1, Q6 | Opus copy; Luna source verification | Small to medium | Displayed keys match primary sources and app context; lesson states Docker-group privileges and a recovery path. |
| 3 | Clean default self-host results and sample the data workflow: Q2 | Luna data; Sol for import/query faults | Medium first batch; large for the whole set | Default results show actual apps; dependencies and duplicates correctly classified; count updated; sample beyond the first page checked. |
| 4 | Reduce fee-page HTML and duplicated payload: T3 | Sol runtime, Opus presentation if needed | Medium | Largest responses comfortably below Google's fetch limit; content and interactive behavior checked in the rendered page. Use a 1 MB internal alert as a target, not a Google rule. |
| 5 | Fix research-note presentation and the promised fee comparison: Q3, Q4 | Opus; Luna for current commercial facts | Medium | Answer appears before the long list; conflicting sources remain clear; worked amounts are reproducible; repeated raw notes removed. |
| 6 | Choose two tracks, improve home/catalog links, decide the six hardware pages: Q7, T6 | Owner product choice; Opus navigation | Small to medium | Priority tools have visible contextual links; every intended landing page is reachable; retirements have an explicit URL treatment. |
| 7 | Correct directory discovery architecture and query handling: T2, T4, T5 | Sol architecture; Opus page scope | Large; pilot one directory | Selected category/entity/pagination pages have useful unique initial HTML, real links, and deliberate canonicals/indexability. Tracking parameters consolidate without blanket query exclusion. |
| 8 | Check old-domain redirects and retained old URLs: T6 | Sol | Small to medium | Representative old URLs reach the matching current destination with minimal hops; no mass redirects to home, redirect loops, or lost useful paths. |
| 9 | Improve visible checking/ownership and measure tool use: Q5, sections 1 and 9 | Opus trust copy; Sol analytics | Medium | Accurate checker/source/date explanation; consistent name; owner/agent traffic can be excluded going forward; useful completion events work without collecting private inputs. |
| 10 | Run focused examples, user research, and distribution: sections 6–7 | Opus examples; Luna research; owner outreach | Ongoing, tightly bounded | Two tracks have useful examples and actual user feedback; referrals and successful uses recorded; no duplicate routes created just to publish more. |
| 11 | Consider selected new entity/comparison pages or KDP marketplaces | Opus and Luna, Sol implementation | Large; only after evidence | Small pilot with distinct intent, verified sources, maintenance owner, useful linking, and an agreed measurement window. |
| 12 | Minor title/style cleanup and secondary category-fit review | Opus and Luna | Small | Accurate titles reflect the page; CLI categories are reviewed; no claim that cosmetic edits solve indexing. |

### Days 1–7: establish access and fix known errors

- [ ] Review the search reports and crawler evidence in backlog item 1. Resolve the single sitemap warning based on its actual message.
- [ ] Fix the confirmed reference and lesson problems. Start cleaning the default self-host results.
- [ ] Reduce the largest fee responses and correct the most visible research-note presentation.
- [ ] Select the initial measurement set below and record each URL's current state before changes.
- [ ] Agree that developer troubleshooting and KDP decisions are the two growth tracks for the next 60 days.

### Days 8–30: improve the existing destinations

- [ ] Finish the fee comparison, useful internal links, and first data-cleanup batch.
- [ ] Implement one directory-discovery pilot; verify actual initial HTML and rendered output.
- [ ] Complete focused redirect and query-header work after a written URL policy.
- [ ] Add useful completion measurement and exclude known owner/agent traffic going forward.
- [ ] Test priority tools with real users and distribute the two worked cases.
- [ ] Request indexing for a small set of materially improved priority pages after live verification; keep the sitemap current. Repeated requests do not make crawling faster, and a request does not guarantee indexing. [Google's recrawl guidance](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl).

### Days 31–60: respond to the observed stage of failure

- [ ] Compare each priority URL's crawl and indexing state with baseline.
- [ ] For indexed pages, inspect the actual queries, countries, and devices before changing snippets or adding content.
- [ ] Strengthen the connected KDP file/pricing workflow and the developer examples based on observed user problems.
- [ ] Recheck corrected data and commercial facts. Do not substitute a new publication date for a real review.
- [ ] Run the focused fee experiment on the existing page; consider a small entity-page pilot only if discovery, quality, and maintenance are ready.

### Days 61–90: decide where to expand

- [ ] Expand the track that earns relevant impressions, successful use, and useful mentions.
- [ ] If pages remain undiscovered or uncrawled, escalate access, linking, rendering, and search-report diagnosis before creating more pages.
- [ ] If indexed pages get impressions but few clicks, review the actual position and competing results. Change the title only when it better describes the page's answer.
- [ ] If clicks arrive but users cannot finish, fix the tool and instructions before seeking more traffic.
- [ ] Reassess old content individually. Preserve pages with real usefulness; merge overlapping pages with appropriate redirects; retire only pages without a defensible purpose.

These are review windows, not a promise that Google will recover in 30, 60, or 90 days.

## 9. Measurement and decision rules

### Start with ten existing URLs

Use `/dockerignore-tester`, `/rsync-filter-tester`, `/nginx-proxy-pass-calculator`, `/restic-retention-simulator`, `/keyboard-shortcuts/pi-coding-agent`, `/kdp-tools`, `/kdp-royalty-calculator`, and `/kdp-pdf-preflight-checker` as eight priority or candidate URLs. Use `/mrr-calculator` and `/platform-fees/digital-products-and-stores` as two comparison URLs outside the primary tracks. These are an operational monitoring set, not a randomized experiment.

| Weekly measure | How to collect it | What it tells us |
| --- | --- | --- |
| Indexed state and last crawl for each URL | Search Console URL Inspection, recording Google's stored result and any available live-test result separately | Whether the page is failing before it gets a ranking opportunity. |
| Main-site clicks and page impressions | Web search; final data; same apex page filter; same page aggregation; equal 28-day windows | Whether exposure is changing without mixing BaseBuddy or counting formats. |
| Queries for each priority page | Inspect returned rows; separate brand and `site:` searches; retain the privacy/row-limit caveat | Whether the page matches the intended task. Do not infer zero demand from absent rows. |
| Selected competitor results | Manually check a fixed small query set in the intended country and device; date the check | Whether a calculator, official answer, video, directory, or article satisfies the result better. Avoid treating a general web-search connector as a rank tracker. |
| Tool starts and useful completions | Minimal events appropriate to each tool; identify failed validation separately | Whether visitors can finish. Do not log uploaded PDFs, domain lists, code, or financial inputs. |
| Known owner/agent exclusions and referrals | Document the analytics exclusion method and inspect source/hostname | Whether growth is external use rather than more testing. Historical totals stay qualified. |
| Important source changes | Named checker and actual review date | Whether facts remain dependable enough to recommend. |

Use Google data's reporting dates consistently; Umami totals in this audit used UTC. Do not compare incomplete days across systems. Keep total visitor counts separate from search demand and product success.

Decision rules:

- **Discovered but not crawled:** investigate access, discovery links, fetch/render cost, and the site's evidence of usefulness. This state does not by itself diagnose poor copy.
- **Crawled but not indexed:** inspect rendered content, Google-selected canonical, duplication, soft-404 treatment, and whether the page has a clear independent purpose.
- **Indexed but no relevant impressions:** revisit query fit and competition; check that the intended facts are prominent and linked. Seek actual user feedback and relevant recommendations.
- **Relevant impressions but no clicks:** segment query, device, country, and position. At position 60, a rewritten meta description is unlikely to solve the main problem. At useful positions, inspect whether the title and result answer the task or whether the search needs no click.
- **Visits but no successful use:** test the task, failure messages, mobile controls, and output explanation.

After four weekly reviews with no meaningful movement in crawl/indexing for the priority set, reopen the technical and search-report investigation. This is an internal escalation point, not a Google indexing deadline.

## 10. What not to spend the next month on

- Bulk publishing, blanket deletion, or blanket `noindex` based on a word-count or shortcut-count threshold.
- Buying links, mass directory submissions, or creating pages mainly to repeat keyword variations.
- Rewriting every good page because it has no clicks before it has been indexed.
- Moving to another domain or redesigning the whole site without evidence that either solves the present problem.
- Treating schema markup, `llms.txt`, an SEO score, or exact title length as an indexing switch. Google says its [AI search features do not require special additional optimizations](https://developers.google.com/search/docs/appearance/ai-features).
- Promising a traffic target from these very small samples, or attributing the September drop to a penalty without evidence.

## 11. Audit coverage and unresolved evidence

The technical crawl checked all **418 sitemap URLs** on October 25 for status, head metadata, canonical, H1, indexing directives, structured-data parsing, HTML size, and links. It is a current snapshot, not proof of historical availability. Main content was checked in initial HTML; representative pages were also inspected in the browser. The content worker read **25 live pages** directly across tools, catalogs, directories, courses, and site pages. Thousands of individual dataset facts and every tool calculation were not audited.

Search evidence used authorized, read-only Search Console, Bing Webmaster, Umami, and Google Analytics access. Google analysis used final Web data through October 23, the apex page filter shown in section 1, and separate property/page aggregations. API rows can omit queries or other detail. The URL Inspection sample was chosen for relevance, not to estimate the entire site's indexing percentage. Bing's returned history ended October 22; its crawl snapshot was October 23. RDAP registration dates and release history were checked separately from page publication dates.

The production frontend revision matched local HEAD, `cc3bc99f76ebd96558ae07291c65e3d031ccff20`, at the time of the review. Historical release review found no proven broad indexing block in the September deployment. It cannot reconstruct expired logs or prior production database state.

Still unresolved:

- Search Console's one sitemap warning, full Page indexing and Crawl Stats details, Manual actions, Security issues, and Removals. The browser dashboard required login; API access did not expose all of these reports.
- Genuine crawler access across the affected period, Cloudflare setting history, and the exact cause of the September 11 decline.
- Field Core Web Vitals. The PageSpeed API returned quota error 429; fast unthrottled browser observations are not a field-performance assessment.
- Comprehensive backlink data, reliable keyword search volumes, and sustained rank tracking by country/device.
- The precise contribution of owner, agent, bot, and consent effects to analytics totals.

Work was split by lane: **Sol** handled technical, traffic, and historical checks; **Opus** reviewed content and search intent; **Luna** researched competitors and priority topics. The coordinator reconciled the findings, removed unsupported causal claims and arbitrary pruning thresholds, and wrote this plan.

Only this audit document was added to the repository. No site implementation, content publication, configuration, database, commit, push, or deployment was performed. No build or code test suite was run because this was a read-only audit with a documentation deliverable.
