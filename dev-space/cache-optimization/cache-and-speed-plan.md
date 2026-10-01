# Cache and speed plan

Goal: edits show up on the live site within about 2 minutes, and pages stay cached much longer so the site is faster and the server does less work.

Order matters. Make updates reliable first. Only then make caches last longer.

Implementation update (1 October 2026): steps 1–6 are implemented and deployed to OVH at commit `e01659a1`. The Supabase worker is enabled and healthy, with no waiting updates. Development checks passed for app edits, unpublishing, retry timing, concurrent edits, missed updates, page navigation, and search performance. A production edit reached the live cached page in about 25 seconds. The build and live release checks passed; the final release took 5 minutes 12 seconds. [Release result](https://github.com/stack127labs/stack127/actions/runs/36768405452).

Remaining: the scheduled GitHub backup processor stops after one healthy day, and longer Cloudflare cache times turn on after seven healthy days. Both are automatic. Observation started on 30 September at 18:08 UTC; errors or delayed updates restart that clock. No manual action is needed now. Launch directory, advertising, and platform fee caching remains conditional on those pages being built and published.

The current maintenance workflow also passed a manual check: it applied the initial policy with its production credentials and correctly skipped the seven-day switch. [Maintenance result](https://github.com/stack127labs/stack127/actions/runs/36769403651).

Current operating instructions live in `stack127_docs/cloudflare.md`.

---

## 1. Move the update worker to Supabase

Today a GitHub Action (`.github/workflows/stack127-cache-maintenance.yml`) runs `scripts/stack127/cache/process-revalidation.mjs` every 5 minutes. GitHub often runs scheduled jobs late or skips them. One update sat for hours without being tried.

The worker only reads the queue, calls our site, and calls Cloudflare. It doesn't need our server, so it can run as a Supabase Edge Function.

**Setup:**

- New Edge Function `cache-worker` in `supabase/functions/cache-worker/`. It does the same job as `process-revalidation.mjs`, rewritten for Deno.
- A database trigger on `stack127_revalidation_events` calls the function through `pg_net` as soon as a change is queued. Most edits then start processing within seconds.
- Supabase Cron (`pg_cron`) also calls the function every 30 seconds. This catches anything the trigger missed.
- Secrets go in Supabase Edge Function secrets: Cloudflare token, zone ID, site URL, origin URL.
- Only one run at a time. Use a Postgres advisory lock or a "claimed" column so two runs don't process the same events.
- Remove the GitHub cron schedule once the function is working. Keep the workflow as a manual backup.

**Things to check:**

- Edge Functions have a time limit per run. Keep batches small (for example 50 events and 20 warm pages per run) and let the next run pick up the rest.
- To warm a page, the function has to reach our server directly, not through Cloudflare. Otherwise it may just get Cloudflare's old copy back. We need an origin URL the function can reach, protected by a secret header.

**Worker settings:**

| Setting | Value |
|---|---:|
| Backup check | Every 30 seconds |
| Group repeated changes during imports | Wait 10 seconds, but never more than 60 seconds |
| Retry after failure | 15 seconds, then 1 minute, then every 5 minutes |
| Alert when the oldest waiting update is older than | 5 minutes |
| Compare what's published with what's been processed | Every 15 minutes |
| Normal target | Live site updated within 2 minutes |

**First step:** find out why that update waited hours with zero attempts.

---

## 2. Clear everything a change affects

**Each update runs these steps in order:**

1. A database change adds an event to the queue.
2. Work out which pages, data, and API responses it affects.
3. Clear those from the Next.js cache.
4. Load the affected pages directly from our server so they rebuild.
5. Check the rebuilt page has the new content.
6. Clear the matching Cloudflare cache tags or file URLs.
7. Load the important public pages again so Cloudflare holds the fresh copy.
8. Remove the event from the queue.

**Rules:**

- If any step fails, keep the event and retry.
- If a newer edit arrives while one is being processed, only remove the older one. The newer one stays in the queue.
- Unpublishing and deleting go through the same steps, so a removed page stops being served.

**What each change should refresh:**

| Change | Refresh |
|---|---|
| Page copy, metadata, publishing, or slug | The page, catalogs and navigation that list it, homepage if relevant, sitemap |
| Tool copy or catalog card | Tool page, catalogs that list it, tool sidebars |
| Self-host app facts, categories, install options, resource estimates | App page, directory lists, planner, homepage counts, license reference |
| GitHub facts | Self-host app pages and CLI pages that use them |
| CLI records | CLI directory and homepage parts that show them |
| Hardware data bundled in the code | Their directory and detail pages, on deploy |
| Launch directories, advertising, platform fees | Their lists, detail pages, counts, and related pages, once published |
| Icon or image replaced | That file's URL and pages that show it |

**Known gaps to fix:**

- CLI pages don't refresh after GitHub data updates.
- The license reference doesn't refresh after app changes.

**Time-based text** like "12 days left": work it out in the browser, or queue an update for the moment it changes.

---

## 3. Cache times

Content edits clear caches right away through step 2. These time limits are a safety net in case something is missed.

| Content | Browser | Cloudflare | Next.js |
|---|---|---:|---:|
| Tools, courses, references, legal pages, catalogs | Check each time | 7 days | 7 days |
| Homepage and directory lists | Check each time | 24 hours | 24 hours |
| App and device detail pages | Check each time | 24 hours | 24 hours |
| Search and filter results | Check each time | 15 minutes | 15 minutes, limited count |
| Sitemap and robots.txt | Check each time | 1 hour | 1 hour |
| Icons, logos, favicons that can change | Check each time | 30 days | Serve file |
| Files with a version in the name, like Next.js bundles | 1 year | 1 year | Serve file |
| Live DNS and IP results, health checks, private endpoints, errors | Don't store | Skip cache | Don't cache |

- "Check each time" means the browser keeps a copy but asks before using it. Cloudflare usually answers, so the request doesn't reach our server. Use `Cache-Control: max-age=0, must-revalidate` with separate Cloudflare edge TTL rules.
- Keep the domain registry (RDAP) cache as it is: 24 hours for registered domains, 1 hour for unregistered ones. Those registries change without telling us.
- A 7-day cache doesn't rebuild pages every 7 days. It just allows reuse for up to 7 days unless an edit clears it sooner.

---

## 4. Cache rendered pages in Next.js

- Remove request header reads from the shared publishing and metadata code where possible. The `stack127_pages` table stays in charge of publishing and SEO.
- Pages that don't depend on the request use Next.js's normal full-page cache.
- Directory pages read search params, so they can't be fully static. Cache the parts that can be reused and the common filter results. Keep request-specific handling outside the cached parts.
- Cache keys include page number, filters, sort, and search. Full HTML and client navigation data stay cached separately.
- Keep the current SEO behavior for query pages.
- Keep up to 500 search and filter results per directory, dropping the least recently used. Normal numbered pages can all be cached.
- Run one copy of the app. Running more than one needs a shared cache first, because clearing one copy's cache doesn't clear the others.

---

## 5. Cache database reads that skip the cache today

Add shared, tagged caching for:

- Single self-host app pages
- Single resource planner entries and the full planner list
- Directory license counts
- Launch directory, advertising, and platform fee reads, once those pages are published

Use one tag per app for single app pages, and one tag per directory for lists and counts.

---

## 6. Database indexes

The main indexes already exist. Add two for planner search:

| Index | What it covers |
|---|---|
| `self_host_apps_public_name_trgm_idx` | Trigram index on `lower(name)`, only published, self-hostable apps |
| `self_host_apps_public_slug_trgm_idx` | Trigram index on `lower(slug)`, same condition |

- Turn on the `pg_trgm` extension. Production doesn't have it yet.
- Change the planner search from `position(...)` to `LIKE` so it can use these indexes. Search for `%`, `_`, and `\` literally.
- Test two-letter searches. Trigram indexes don't help much with very short searches.
- Measured: 2.3 seconds on a cold first run, 10 to 13 ms after. Check the indexes actually help before keeping them.

**Duplicate index:** `open_projects_source_model_idx` and `self_host_apps_source_model_idx` are the same. Check what uses them, then keep only one.

Only add more indexes after measuring a slow query. Many directory filters run in Node, so a database index won't help them.

---

## 7. Order of work and checks

1. Build the Supabase Edge Function worker and fix the stuck-update problem.
2. Fix the refresh map and add the missing data caches.
3. Add rendered page caching.
4. Test the search change and new indexes in development.
5. Test publishing, deleting, automatic imports, failed retries, and deploys.
6. Switch on the longer Cloudflare cache times after 7 days in a row with no missed updates.

**Confirm that:**

- A Cloudflare cache hit doesn't reach our server.
- A Next.js cache hit doesn't rebuild the page or query the database.
- Different filters return different, correct results.
- Edits show up within 2 minutes.
- `npm run quality` and `npm run build` pass.
- Changed pages look right on desktop and mobile.

Don't turn on Traefik response caching. Cloudflare plus Next.js should be enough. Measure before adding another cache layer.
