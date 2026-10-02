# Static pages: status and open issues

Status on 2 Oct 2026. The plan is in [static-pages-and-on-demand-revalidation-plan.md](static-pages-and-on-demand-revalidation-plan.md). The rules are in [stack127_docs/caching.md](../stack127_docs/caching.md).

Local acceptance is complete. The user authorized the static-page release, production database migration, and cache configuration on 2 Oct 2026, with unpublished pages kept unpublished. The release uses `.github/workflows/stack127-release-e2e.yml`. Check its latest result and `/api/health?scope=deploy` for the production revision.

---

## Result

- Every public page is static. The build lists one dynamic page, the allowed `/publication-not-found`. Before this work there were 42.
- No page refreshes on a timer. Pages change only through on-demand revalidation or a release.
- URLs with `?` are `noindex, follow`, with a canonical link to the clean URL.
- The build now fails if a page becomes dynamic, uses a timed `revalidate`, or reads `searchParams`, `headers()`, or `cookies()` on the server (`check:static --strict` in `postbuild` and preflight).

## Checks run

- `npm run build` passes, with the strict static check: 0 problems.
- `npm run quality` passes: TypeScript and 78 core tests. The earlier Sol pass also ran 47 focused tests.
- The final production build passes with 426 generated pages and 0 strict static-check problems.
- Codex rechecked the last four fixes at 1440 px and 390 px, with no script errors or sideways overflow. The self-host facet check used a controlled API response with a new facet to verify that the browser keeps a value absent from the initial facets.
- Additional checks at both widths passed for launch-directory search results, RAID valid and invalid shared state, and shortcuts shared loading, manual choices during loading, clean-URL reset, failed loading, and retry.
- RAID drive-removal tooltips and the shortcuts shared selection also passed light-mode checks at both widths.
- The isolated production release passed 54 core tests and 62 focused directory and caching tests. Agent-routing changes are outside this release.
- All 11 changed storage tools passed valid shared-state, invalid-state recovery, and browser back checks at both widths.
- Unpublished ad-network and launch-directory pages returned 404 in the release preview. Ad-network components passed search, empty results, pagination, and page-clamping checks without publication changes.
- The OVH, Git, Cloudflare DNS, and strict static-route preflight passed for the isolated release.
- Browser check at 1440 px and 390 px. Each page loaded from the cache (`HIT`) with no script errors and no sideways overflow:
  - self-host apps: default, filter + page 2, search, detail panel on a fetched result
  - CLI apps: default, search, filter + page 2
  - zigbee, z-wave, matter, cameras: default and search
  - launch directories search
  - platform fees: hub search, section search, shared link, old `?section=` link
  - tools: `dns-lookup` and `domain-age` shared links, `raid-calculator`
- Page sizes (uncompressed HTML):

| Page | Live now | After |
|---|---|---|
| `/self-host-apps` | 1.10 MB | 862 KB |
| `/cli-apps` | 884 KB | 845 KB |
| `/zigbee-devices` | n/a | 502 KB |

---

## What changed

### Shared (Sol)
- `lib/registry-layout.tsx`: the `headers()` read and the `requestAware` option are removed.
- `proxy.ts`: noindex and canonical for every query URL, plus cache tags for the new JSON routes.
- `lib/cache-tags.ts`: one tag name per data source. Every `unstable_cache` call uses `revalidate: false`.
- `scripts/stack127/check-static-routes.mjs`, `npm run check:static`, wired into `postbuild`, preflight, and the release workflow.

### Pages (Opus)
- 324 layouts and the home layout: `revalidate = false`.
- **Platform fees:** hub and 49 sections are static (`generateStaticParams`). Search runs in the browser.
- **Tools (28):** each page renders a small client wrapper, `<slug>-from-url.tsx`, that reads the URL with `app/ui/tools/use-initial-query.ts`.
- **Small directories:** search and filters run in the browser through `app/ui/directories/directory-query.tsx`.
  - Launch directories, ad networks, and zigbee coordinators ship their list with the page.
  - CLI apps and the five large hardware lists load their list from a cached JSON route only when someone filters.
- **Self-host apps:**
  - The static page shows the default view with 24 cards (was 30) and hidden detail HTML.
  - Filters fetch `/api/self-host-apps/search`.
- **Pagination links:** `prefetch={false}`.

### Data and pipeline (Sol)
- New migration `supabase/migrations/20261002143000_directory_revalidation_coverage.sql`. It adds entity types and triggers for `platform_fees`, `ad_networks`, and `launch_directories`. Tool catalogs were already covered by `page`.
- `scripts/stack127/cache/targets.mjs` maps the new entities to their tags, paths, Cloudflare tags, and warm paths.
- New cached routes:
  - `GET /api/self-host-apps/search` (24 per page, 400 on bad input, seven-day edge cache, `self-host-catalog` tag)
  - `GET /api/hardware-directory/<directory>` (static, one-year cache)
  - `GET /api/cli-apps/index` (static, purged by `cli_apps` events)
- Zigbee details are now served by the existing details route.
- `listAllVerifiedPublishers(networkId)` in `lib/ad-networks.ts`.
- Cloudflare: `configure-cloudflare.mjs --long-ttl` now sets seven days for HTML/RSC and covers the JSON routes. **Not applied.**

### Docs
- New `stack127_docs/caching.md`.
- Updated:
  - `seo.md`, `quality-workflow.md`, `page-families.md`, `tool-interface.md`, `production-deployment.md`
  - the page-build skill, the tool-frontend skill, and the release skill
  - `CLAUDE.md`

---

## Bugs found and fixed

1. **Empty hardware pages.** The six hardware directories showed "No exact models match" by default. The server imported the page size from a `"use client"` file, where it is not a number. The constants moved to plain files. A repo-wide scan found no other cases.
2. **CLI apps over 1 MB** (1.11 MB) after shipping all 309 records inline. It now loads the list from `/api/cli-apps/index` when filtering: 845 KB.
3. **Self-host apps over 1 MB.** Page size went from 30 to 24.
4. **Sol review, fixed by Sol:**
   - Hardware detail JSON had no purge tag.
   - CLI and hardware indexes skipped origin checks before the Cloudflare purge.
   - A deleted network or fee section could block purges.
   - The release workflow missed the worker's new imports.
5. **Sol review, fixed by Opus:**
   - Back and forward on a tool did not restore its values. The hook now listens for `popstate`.
   - "Show all platforms" on platform fees kept the old search. It now clears the search state.
   - The directory index was cached in memory for the whole visit. Now only pending loads are shared.
   - A self-host filter value that only appeared in filtered results was dropped. Values now validate against both facet sets.
6. **Codex follow-up, using the user-approved task exception:**
   - The platform-fees reset cleared results but could leave the search in the URL. It now clears both together and preserves modified clicks.
   - Loading a shortcuts shared link remounted the generator and lost manual selections. Loading now adds records to the current selection. Returning to a clean URL clears the shared selection, and failed loads allow retry.
   - Hidden drive-removal tooltips caused mobile RAID overflow. They now stay anchored inside the row.
   - The plan doc now records the completed implementation and pending production rollout.
   - Codex reviewed the final diff itself. No separate worker or fallback was used, as requested, so this review was not independent.

---

## Release and remaining work

### Release steps
Items 1 and 2 are complete. Codex reviewed the four files and checked tool back/forward, platform-fees reset, filtered self-host facets, and directory index refetch in a browser at desktop and mobile widths.

3. **Production database migration.** The release workflow applies `20261002143000_directory_revalidation_coverage.sql`. It is the only pending production migration. It adds directory refresh triggers without publishing pages.
4. **Release scope.** An isolated checkout contains the static conversion, browser fixes, shared data caches, directory APIs, database migration, cache rules, release checks, and related docs. Agent-routing changes and unrelated skill edits stay in the original workspace.

### After release
5. **Apply the Cloudflare cache rules**, after the app, migration, and worker are live. Seven-day page caching still requires the existing seven-day worker health gate. The first production check on 2 Oct found only a few healthy hours, so the longer TTL was not ready:
   ```bash
   node --env-file=.env.database --env-file=.env.deploy scripts/stack127/cache/configure-cloudflare.mjs --long-ttl --apply
   ```

### Publication and shared links
6. **Ad networks:** remain unpublished. The release preview returns 404. Search and paging passed component checks with fixtures; no pages were published for testing.
7. **Launch directories:** local search results passed at both widths, including a Product Hunt search. The live page remains unpublished.
8. **Shortcuts cheatsheet generator:** shared `?apps=` links and loading recovery passed at both widths. This check is complete.
9. **Storage calculators:** all 11 changed tools passed valid and invalid `?state=` links and browser back checks at both widths. This check is complete.

### Behaviour changes to accept or fix
10. **Shared links fill in after load.** A filtered directory link or a tool link first shows the default view, then switches. Hardware, zigbee, and CLI apps show "Loading" while the list downloads.
11. **Without JavaScript,** every query URL shows the default page. This is fine for SEO because query URLs are not indexed.
12. **Shortcuts generator:** fixed. An app selected while shared apps are loading stays selected.
13. **Self-host apps:**
    - 24 cards per page instead of 30.
    - Active filter chips are in alphabetical order, not URL order.
    - Unknown filter values are dropped from the request.
14. **Hardware:** `?page=2abc` now means page 1.
15. **Ad network search** updates the URL in place instead of loading a new page.

### Later improvements
16. **Self-host detail HTML** is about 400 KB, and 315 KB of it is 699 inline icon SVGs. A shared SVG sprite would cut about 300 KB and allow 30 cards again.
17. **Hardware and zigbee detail panels** load from the API, not the HTML, so search engines cannot read them. This was true before too.
18. **Ad networks with thousands of verified sites** should move their list to a JSON route instead of shipping it with the page.
19. **Matter index:** search terms over 160 characters are dropped, so long product descriptions are no longer searchable.
20. **Category pages,** such as `/self-host-apps/categories/<name>`, are not built yet. They will be static and published one by one.
21. **The plan doc:** corrected. It now records the completed implementation and pending production rollout.
