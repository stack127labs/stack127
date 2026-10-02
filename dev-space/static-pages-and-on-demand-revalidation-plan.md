# Static pages and on-demand revalidation plan

Goal: every public page is a finished, cached page. Nothing renders per request. Pages change only when their data changes, through the existing revalidation pipeline. Navigation feels instant.

Nothing below is built yet.

---

## Rules for the whole site

1. **No `force-dynamic` on any page.** Only API routes, `/vitals`, and the 404 helper may be dynamic.
2. **No timed refresh.** Pages use `revalidate = false` (cache until told otherwise). No `604800`, `86400`, or `3600` timers on pages.
3. **On-demand revalidation only.** A data change queues an event, and the worker revalidates the Next page cache and purges Cloudflare by tag. A release rebuilds everything.
4. **Pages never read the URL query on the server.** `searchParams` and `headers()` make a page dynamic. Anything that depends on `?…` runs in a client component.
5. **URLs with `?` are never indexed.** The proxy already sends `X-Robots-Tag: noindex, follow` for them, and the canonical always points to the clean URL. Search results, filters, sorting, and `?page=` stay out of the index.
6. **Pages we want indexed get their own path**, such as `/platform-fees/communities` or later `/self-host-apps/categories/<name>`. A path is only indexed once its row is published in `stack127_pages`.
7. **Every dynamic route segment uses `generateStaticParams`**, so all pages are built during the release. No slow first visits.

---

## What is dynamic today

The last build has **42 dynamic pages** (`ƒ`). The other 287 pages are static but refresh on a timer.

### Directories (13)

`/self-host-apps`, `/cli-apps`, `/zigbee-devices`, `/zigbee-coordinators`, `/matter-devices`, `/z-wave-devices`, `/nut-compatible-ups`, `/local-security-cameras`, `/ad-networks`, `/ad-networks/[slug]`, `/launch-directories`, `/platform-fees`, `/platform-fees/[section]`

**Why:**

- Filters, sort, search, and `?page=` are read from `searchParams` on the server.
- `platform-fees/[section]` and `ad-networks/[slug]` layouts also set `dynamic = "force-dynamic"`.

### Tools (28)

All DNS and domain tools, the storage calculators with shareable state, `ip-asn-lookup`, and `shortcuts-cheatsheet-generator`.

**Why:** the page reads `?name=`, `?type=`, `?state=`, and similar values on the server, only to pass them to the client tool as starting values. Example: `dns-lookup/page.tsx` passes `initialName` and `initialResolver`, and `raid-calculator/page.tsx` passes `initialState`.

### Shared cause: the registry layout

`lib/registry-layout.tsx` calls `headers()` when `requestAware` is true, to read `x-stack127-has-query` and set `noindex` for query URLs. That alone makes the page dynamic. The proxy already sets `X-Robots-Tag: noindex, follow` for query URLs, so the layout check can be removed.

### Timed refresh (static pages)

- **Weekly:** 325 layouts use `revalidate = 604800`.
- **Daily:** `app/(site)/(home)/layout.tsx` uses 86400.
- **Hourly:** `app/sitemap.ts` and `app/robots.ts` use 3600.
- **Never cached:** `app/api/health/route.ts` uses 0, which is correct for a health check.

---

## The revalidation pipeline today

**How it works:**

- Database triggers queue rows in `stack127_revalidation_events`. Entity types are `page`, `self_host_app`, `self_host_catalog`, and `cli_apps`.
- The Supabase `cache-worker` turns each event into targets (`scripts/stack127/cache/targets.mjs`).
- It calls `/api/cache/revalidate`, which runs `revalidateTag` and `revalidatePath`, then purges Cloudflare by `Cache-Tag` and warms pages.
- The proxy tags every response: `stack127-public`, `page:<slug>`, plus `home`, `sitemap`, `self-host-catalog`, and `self-host-detail` where they apply.
- A release purges `stack127-public` and `stack127-assets`.

**Covered by triggers:** `stack127_pages`, `stack127_tool_pages`, `self_host_apps` and its child tables, `terminal_apps`, and `github_projects`.

**Not covered:**

- `platform_fee_sections` and `platform_fee_entries`
- `ad_networks` and `ad_network_publisher_relationships`
- `launch_directories`
- `stack127_tool_catalogs` and `stack127_tool_catalog_memberships` (check: they may already flow through the page trigger)

Hardware directories read files in the repo, so a release refreshes them. They need no trigger.

---

## Changes, in order

### 1. Shared pieces

- **`lib/registry-layout.tsx`:** remove the `headers()` read and the `requestAware` option. Query URLs rely on the proxy's `X-Robots-Tag` header plus the canonical link.
- **Change every page layout's `revalidate = 604800` to `revalidate = false`**, including home. For sitemap and robots, use `revalidate = false` plus the `sitemap` tag. The pipeline already purges it.
- **Add a cache-tag helper** (for example `lib/cache-tags.ts`) that names one tag per data source, such as `stack127-platform-fees` and `stack127-ad-networks`. `unstable_cache` calls and the cache targets both use these names.
- **Keep `unstable_cache` for shared data**, switched to `revalidate: false` plus tags. It is a second layer behind the page cache.
- **Check the 2 MB limit:** Next does not cache data entries over 2 MB. Large sources must be split, as the self-host index already is (batches of 750).

### 2. Tools (28 pages)

- **Move query reading into the client tool,** using `useSearchParams()` inside a `<Suspense>` boundary. Read the starting values on the client and keep the server page free of `searchParams`.
- **Hydration:**
  - First render shows the default state, then fills from the URL. For tools that auto-run from a shared link, start the request after hydration.
  - Keep the rendered page identical for all visitors. No server-side results from the query.
- **Same everywhere:** one shared helper (for example `useToolQueryState`) so every tool behaves the same.

### 3. Directories (13 pages)

**Static page shows:**

- The default view: first page, default sort, no filters.
- Server-rendered cards, with panel details in the HTML, as already done for self-host apps and CLI apps.
- This is the indexed page.

**Filters, search, sort, and pagination become a client component:**

- **Small directories** (hardware, CLI apps, platform fees, ad networks, launch directories): ship the compact index in the page, or as one cached JSON file, and filter in the browser. CLI apps (~309) and platform fees (543) fit easily.
- **Self-host apps (~5,257):**
  - Fetch filtered results from a cached API route, such as `/api/self-host-apps/search?…`.
  - Cloudflare caches it by query under the `self-host-catalog` tag. The pipeline already purges that tag.
  - The client shows results without a full page load.
- **URL state:** the URL keeps `?category=…&page=2` so links can be shared. The client reads it on load, and these URLs stay `noindex`.
- **Without JavaScript:** visitors and crawlers see the default static page. Fine for SEO, because filtered and paginated URLs are not indexed anyway.

**Platform fees:**

- Remove `force-dynamic` from `[section]/layout.tsx`.
- Add `generateStaticParams` for the 49 sections.
- Move hub search to the client (it filters 543 names locally).

**Ad networks:**

- Remove `force-dynamic` from `[slug]/layout.tsx`.
- Add `generateStaticParams`.

**Later, category pages:** add real routes such as `/self-host-apps/categories/[name]`, fully static, with `generateStaticParams`. Publish each one in `stack127_pages` only when it has enough content.

### 4. Pipeline coverage

**New entity types and triggers:**

| Entity | Tables | Refresh |
|---|---|---|
| `platform_fees` | `platform_fee_sections`, `platform_fee_entries` | tag `stack127-platform-fees`; paths `/platform-fees` and the changed section; sitemap if publication changed |
| `ad_networks` | `ad_networks`, `ad_network_publisher_relationships` | tag `stack127-ad-networks`; `/ad-networks` and the changed `/ad-networks/<slug>` |
| `launch_directories` | `launch_directories` | tag `stack127-launch-directories`; `/launch-directories` |
| `tool_catalogs` | `stack127_tool_catalogs`, `stack127_tool_catalog_memberships` | catalog page and the home page (check whether `page` already covers this) |

**Other updates:**

- Update the `entity_type` check constraint, `targets.mjs`, `cache-refresh` tests, and the Cloudflare tag list in `proxy.ts` (for example a `platform-fees-catalog` tag for all `/platform-fees/*` pages).
- Warm the changed pages after each refresh, as the worker already does.

### 5. Speed: "no loading"

- **Prefetch:** static pages are prefetched in full by `<Link>` when they come into view, so navigation is instant. Dynamic pages only prefetch the loading state, which is why we see loading feedback today.
- **Keep the shared loading feedback** (commit `01e199fc`) as a fallback. It should almost never show once pages are static.
- **Edge cache lengths:** Cloudflare currently uses 86,400 s for directories and 900 s for filtered views. With on-demand purges, lengthen them for HTML (the `--long-ttl` option in `configure-cloudflare.mjs`). Keep browser caching at "revalidate".
- **Proxy cost:** the proxy looks up the registry on every origin request (`getExactPublishedPage`). It is already cached by `unstable_cache`. Move it to `revalidate: false` plus a tag.
- **Page weight:** watch heavy pages. Self-host apps with panel details is about 1.05 MB of HTML; keep it under Bing's 1 MB soft limit (for example 24 cards per page). Google's limit is 2 MB of HTML.

### 6. Guard against regressions

- **Fail the release** if a page route builds as dynamic (`ƒ`), or uses a timed `revalidate`. One small check that reads the build route list, run in the release gate. API routes, `/vitals`, and `/publication-not-found` are allowed.
- **Fail the release** if a page uses `searchParams` or `headers()` on the server.

### 7. Docs and skills

- **New `stack127_docs/caching.md`:** the rendering and revalidation contract (the rules above), the tag names, how to add an entity type, how to check the build output, and the 2 MB data limit.
- **Update:**
  - `stack127_docs/seo.md`: query URLs never indexed; categories need real paths.
  - `stack127_docs/page-families.md`: directory, tool, and catalog patterns are static, with client-side filters.
  - `stack127_docs/tool-interface.md`: URL state is read on the client.
  - `stack127_docs/quality-workflow.md`: check that the build shows no dynamic pages.
  - `skills/stack127/page-build/SKILL.md` and the tool pipeline skills: every new page must be static, tagged, and covered by the pipeline.
- **Point `CLAUDE.md`** at `caching.md`.

---

## Suggested rollout

1. Shared pieces, the docs, and the build check (in report-only mode first).
2. Platform fees: smallest and newest, and proves the directory pattern.
3. Tools, in batches: DNS, domain, storage, others.
4. Hardware directories, CLI apps, ad networks, launch directories.
5. Self-host apps: needs the search API.
6. Pipeline coverage for the new entity types, then switch the build check to fail releases.
7. Lengthen the Cloudflare cache times.

Each step: `npm run quality`, `npm run build` (the route list must show the page as static), a desktop and mobile check, then release.
