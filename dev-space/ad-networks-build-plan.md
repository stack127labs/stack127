# Ad networks build plan

This is the brief for the codebase part of [the tracker](ad-networks-tracker.md). The approved designs are the static mockups in `dev-space/ad-networks-mockups/`. Open them with `python3 -m http.server` from that folder, or read the HTML.

The rule: text written once lives in code. Data that changes lives in the database.

## Decisions

| Question | Decision | Why |
| --- | --- | --- |
| Site pages | No static page per site. The Checker tool shows the site view from the mockup's `site.html`, loaded in the browser from a cached API route. | The static export has a hard limit of 20,000 files on Cloudflare Free, and each page writes several. We have about 40,000 confirmed sites. |
| Niche pages | Build `/ad-networks/niches` and `/ad-networks/niches/<niche>`. Keep them unpublished until the niche run fills the data. Later, index only niches with 500 or more sites. | Twenty pages fit easily. Thin niches stay noindex. |
| Stats page | `/ad-networks/stats`. | One page. |
| Checker | Flat tool URL `/ad-network-checker`. List it in Domain tools for now. A Publisher tools catalog comes later, when two or three tools exist. | Tools use flat URLs. |
| Section bar | Every ad networks page uses the shared `SectionBar` from `app/ui/site/section-bar.tsx`: Directory, Niches, Stats, Checker. | Same as the mockups. |
| Charts | Every chart and visual looks like the mockup. Port the mockup's bars, stacked bars, donut, meters, line, joined-and-left bars, switches flow, age strip, heatmap, treemap, ladder, and timeline as shared components in `app/ui/ad-networks/viz/`. Server-rendered, with small client code only for hover and resize. Keep a hidden data table for charts of 60 values or fewer. | The mockups are the approved design. (Changed 2026-10-16. The first build used generic ECharts charts and drifted.) |
| Missing data | Hide what has no data: the column, sort option, filter, number, sentence part, chart block, or whole group. It shows up by itself once the data exists. Never print "not collected yet" lines. Never fake numbers. Mark each gate with a `data-gate` comment so we can remove the gates in January 2027. Per-site "Not listed" stays for a single missing value in a row that has data elsewhere. | Clean pages now, no rework later. (Changed 2026-10-16.) |
| Dev data | Copy confirmed sites and links from the homelab SQLite into the dev database so pages can be checked. Production stays untouched. | Pages can't be checked empty. |

## Routes

| Route | Mockup | Data |
| --- | --- | --- |
| `/ad-networks` | `ad-networks.html` | Network list with counts |
| `/ad-networks/<network>` | `mediavine.html` | Header, sites table, details (from code), stats report |
| `/ad-networks/niches` | `niches.html` | Niche list, treemap, network share, heatmap |
| `/ad-networks/niches/<niche>` | `food.html` | Sites table, network ladder, sizes, moves, newest |
| `/ad-networks/stats` | `stats.html` | Whole-market report |
| `/ad-network-checker` | `site.html` plus the check form | Site view from the API |

Pages are static with `revalidate = false` and never read the URL query on the server. The first page of each sites table is server-rendered. Search, filter, sort, and paging fetch from a cached API route. Read `stack127_docs/caching.md`.

## Where each part lives

| Part | Place | Owner |
| --- | --- | --- |
| Niche list | `lib/ad-network-niches.ts` (done) | Opus |
| Network facts: key numbers, join rules, pay share, payment terms, threshold, sources, checked date | `app/(site)/(directories)/ad-networks/network-facts.ts` | Luna |
| Research notes with sources | `content_docs/ad-networks/research/<network>.md` | Luna |
| Network logos | `public/ad-networks/logos/<network>.png`: square favicon icons on a white tile, 36 from the mockups plus 9 fetched in the same style (done 2026-10-16) | Coordinator |
| Schema, loaders, API routes, dev sync | `supabase/migrations/`, `lib/ad-networks*.ts`, `app/api/ad-networks/`, `scripts/ad-networks/sync.mjs` | Sol |
| Directory pages and shared parts | `app/(site)/(directories)/ad-networks/` and new shared components in `app/ui/` | Opus |
| Network words: intro, Joining, Pay, Rules, Service tabs, and Q&As | `app/(site)/(directories)/ad-networks/[slug]/content/<network>/` | Opus, after Luna |
| Checker tool | `app/(site)/(tools)/ad-network-checker/`, `content_docs/ad-network-checker/` | Opus, with Sol's API |
| Docs | `content_docs/ad-networks/plan.md`, `brief.md`, this file, the tracker | Opus |

## Network content files

Each network folder under `[slug]/content/<network>/` holds:

| File | Holds |
| --- | --- |
| `intro.mdx` | One or two lines under the title. No numbers. |
| `joining.mdx` | Joining tab: who can apply, traffic rule, site rules, how to apply. |
| `pay.mdx` | Pay tab: pay share, payment terms, threshold, methods. |
| `rules.mdx` | Rules tab: ad placement, exclusivity, content rules, contract. |
| `service.mdx` | Service tab: support, tools, reporting. |
| `article.mdx` | The Q&A prose beside the details. |

Words in these files must not repeat numbers that live in `network-facts.ts`. The page pulls numbers from there. Every tab is in the HTML with an h3. With JavaScript, inactive tabs use `hidden="until-found"` so search engines and find-in-page still reach them.

## Order of work

1. Luna researches network facts and logos. Sol builds the schema, loaders, API routes, and dev sync. Opus builds the shared parts and pages. Opus builds the checker. All four start together.
2. When Sol finishes, the page workers switch from sample props to the real loaders.
3. When Luna finishes, Opus writes the network words for all 45 networks.
4. Sol reviews all code. Fixes go back to the worker who wrote it.
5. The coordinator checks every page at desktop and phone width, updates the docs, and asks before any PR or release.

## Rebuild to match the mockups (2026-10-16)

The first build drifted from the mockups. This pass rebuilds every page to match them.

- **The mockup is the spec.** Same sections, order, headings, copy, card design, table columns, controls, charts, and spacing. Open the mockup and the real page side by side at 1440 and 390 before calling a page done.
- **Copy:** use the mockup's words. Two exceptions: keep our corrected method text (a seller list never confirms a site; we confirm from the site's own ads.txt or page ad setup), and swap every sample number for a live one.
- **Numbers:** every number, chart, ranking, and count comes from the database through the loaders, so it updates when the sync runs and the page revalidates. No number typed into page code or MDX, except joining rules from `network-facts.ts`.
- **Controls:** dropdowns and sorts use our own components (`ToolbarSelect` on react-aria, `ToolbarSearch`, `ToolbarSwitch`, `Pagination`), never a native `<select>`. Same options as the mockup, minus options whose data doesn't exist yet.
- **Logos:** `NetworkLogo` shows the square icon on a white tile, like the mockup's `.logo-tile` and `.title-logo`.
- **Data gates:** see the "Missing data" row above.
