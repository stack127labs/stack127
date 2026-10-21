# Launch directories tracker

Goal: make `/launch-directories` the most useful launch directory list on the web: more facts, checked monthly, easier to compare, and in our style (less text, more visuals, friendly).

Mockups with the picked designs: `dev-space/launch-directories-mockups/`. Scope memo: four routes only, no list or filter landing pages.

| Route | Indexed | Status |
| --- | --- | --- |
| `/launch-directories` | yes | Built locally, reviewed, not released |
| `/launch-directories/<slug>` | no, follow | Built locally, reviewed, not released |
| `/launch-directories/compare?d=a,b,c` | no, follow | Built locally, reviewed, not released |
| `/launch-planner` | yes | Later. Tool mockup is approved; build it with the tool pipeline |

Sort, filters, search, and `?page=` stay query parameters. Per `stack127_docs/seo.md`, query URLs are never indexed, so the main page carries the indexable content.

## Picked designs (2026-10-21)

- Main page: dotted band header with the stat line. Card A: logo, name, category, DR badge, two-line description, then cost, link, and review facts. Three per row.
- Directory page: left-aligned hero with Submit and Visit, fact tiles in two rows (Listing; Their site), then pricing, who can submit, how a launch works, link check, sources, similar places. No "Our launch result" section.
- Compare: quick read (cheapest, fastest stated review, most popular), then the fact table.
- Launch planner: tool page layout (catalog sidebar, version meta, workbench, article). Tool unchanged.

## Data

New facts per directory. Unknown stays unknown: a missing value is hidden or shows "Not stated", never a guess.

| Fact | Source | Lane | Status |
| --- | --- | --- | --- |
| Domain rating (DR) | Ahrefs free DR API with an APIv3 key | Luna / Sol | [~] 7/155. Monthly job built; key absent from homelab `.env.analytics` at the implementation check. |
| Popularity bucket (Top 1k, 10k, 100k, 1M, below) | Tranco list | Luna | [x] 155/155 (list 262W9) |
| Listing pages indexed | Google `site:` check of a sample listing | Luna | [x] 120 known (104 yes, 16 no), 35 unknown |
| Free-path review wait (label, min and max days) | Existing review text and submission evidence | Luna | [x] 39/155 state a time |
| Lowest paid price (USD) | Existing cost text, checked against the source | Luna | [x] 53/155 |
| Price tiers (name, price, billing, what you get, link type) | Pricing page | Luna | [x] 52/155 |
| Change history | Monthly recheck diff | Sol | [ ] later; section hidden until there is history |

Reviewed data file: `content_docs/launch-directories/facts-2026-10.json`, notes in `facts-2026-10-notes.md`. Imported to development on 2026-10-21 (155 records).

- [x] Fixed the 7 record mismatches (DevHunt, Launching Next, AIToolsBoard, IndieNeed, Aura++, SaaSGrow, StartupBase) in development through `scripts/stack127/database/update-launch-directories.mjs`. Launching Next and SaaSGrow keep a recorded conflict between their own pages. Production needs the same update at release.

## Backend (Sol)

- [x] Migration: new columns on `public.launch_directories` for the facts above, with checks. Keep the revision SQL and triggers covering them.
- [x] `lib/launch-directories.ts`: load and type the new fields.
- [x] Import command for Luna's reviewed data files (development first, dry run by default).
- [x] Child page rows (156 in development: 155 places + compare): one `stack127_pages` + `stack127_directory_pages` row per published directory (`is_indexable = false`), plus `launch-directories/compare`. Insert missing rows only; never overwrite written fields.
- [x] Cache: a `launch_directories` event refreshes the main page, every child page, and compare. Child rows touch the parent.
- [x] Monthly DR and popularity script, focused tests, OVH cron wrapper, and dashboard entry prepared. Install after release. Submission rechecks and a change log remain later work.
- [x] Focused tests for the import validation. Recheck diff tests come with the recheck script.

## Frontend (Opus)

- [x] Main page: band header with live stat line, quick picks (free + dofollow, no backlink needed, AI tools), filters (category, cost, link type, DR range, working submit page), sort (recommended, highest DR, most popular, lowest cost, recently checked, name), cards and table views, 24 per page.
- [x] Card A component, three per row, whole card links to the directory page.
- [x] Main page content: at a glance charts (cost split, link types, DR spread, cheapest paid), compare and planner promos, launch kit, how we check, FAQ, corrections.
- [x] Directory page `/launch-directories/[slug]`: hero, fact tiles, pricing table, who can submit, how a launch works, link check, sources, similar places, corrections. Sidebar: on this page, more in the category.
- [x] Compare page: picks in the URL (read in the browser), up to 3, sidebar picker, quick read, sticky heads, only-differences toggle, copy link, add one more.
- [x] Section bar: Directory, Compare (Launch planner joins when it ships).
- [x] Desktop and 390px checks on all three routes (dark). Light theme check still to do.

## Content (Opus)

- [x] Main page MDX: shorter intro, how we check, FAQ, in our style.
- [x] Directory page intros: one shared template filled from the record summary (page-content.md allows this for pipeline-grown record sets).
- [x] Titles and search fields for child rows and compare (template; refine top places later).

## Later

- [ ] Launch planner tool (tool pipeline: spec, backend, frontend, audit).
- [ ] Monthly metrics schedule live on OVH (day 2, 06:00 UTC).
- [ ] "What changed" section once the recheck has history.

## Release

- [x] Sol review of every code change (3 rounds; round 3 clear for a PR, 2026-10-21).
- [ ] PR, CI build, merge, production migration and data import, child rows published, public checks.

## Log

- 2026-10-21: Designs picked. Tracker created. Local build started.
- 2026-10-21: Rebased on main a6c44f6f (self-hosted production DB, Node cache worker). Sol prepared production publication plans, the facts import, 7 record corrections, the OVH metrics job, and the runbook. Ahrefs credit added wherever DR shows (license requirement). Development publish plans applied and verified. Sol review round 4 running before the PR.
- 2026-10-21: Luna fixed 7 price records in development; pages verified. Compare page console error (URL write inside a state update) fixed; needs Sol review with the PR.
- 2026-10-21: Luna facts imported to development. DR blocked by rate limits (7/155). Sol review round 1 found 4 must-fix and 2 optional issues, round 2 found 3 more in compare; all fixed. Round 3: clear for a PR.
- 2026-10-21: Sol backend done (2 dev migrations, importer, 156 child rows, cache mapping). Opus built all three routes locally; quality 80/80, launch tests pass, tsc clean. Luna facts gathering running. Sol review of the full diff running.
