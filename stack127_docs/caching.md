# Caching and revalidation

Public page routes now build as static pages with no timed revalidation. The release gate enforces this contract. The directory trigger migration and cache-worker changes must ship with the converted pages. Track the rollout in [the plan](../dev-space/static-pages-and-on-demand-revalidation-plan.md).

Every public page is built and cached. A page changes when its data changes, and the revalidation pipeline refreshes it. A release rebuilds every page.

Links can prefetch whole pages for fast navigation. A failed database call throws, so it cannot become a cached error panel with status 200.

## Rules for every page

1. **Static pages only.** Never use `dynamic = "force-dynamic"` on a page or layout. Only API routes, `/vitals`, and `/publication-not-found` may be dynamic.
2. **No timed refresh.** Page and layout files use `export const revalidate = false`. Do not use `604800`, `86400`, `3600`, or any other timer.
3. **On-demand revalidation only.** When data changes, a database trigger queues an event. The cache worker refreshes the Next.js cache and purges Cloudflare by tag.
4. **No request data on the server.** Pages, layouts, and `generateMetadata` must not read `searchParams`, `headers()`, or `cookies()`. Anything that depends on the URL query runs in a client component.
5. **Build every page during the release.** Dynamic segments such as `[slug]` or `[section]` export `generateStaticParams`. It returns every published value.
6. **Fail loudly.** If data cannot be loaded, throw. Never render an error panel with status 200. A cache would keep it as the page.

## Indexing

- A URL with a query string (`?…`) is never indexed. This includes search, filters, sort, and `?page=`. The proxy sends `X-Robots-Tag: noindex, follow` for these, and the canonical link points to the clean URL.
- A page we want indexed gets its own path, such as `/platform-fees/communities` or later `/self-host-apps/categories/<name>`. It is indexed only after its row is published in `public.stack127_pages`.
- See [seo.md](seo.md) for the registry and sitemap rules.

## Page patterns

### Content, references, courses, and catalogs

Server-rendered from the registry, Markdown, or repository data. Static by default. Follow the rules above; no extra steps are needed.

### Tools

The page is static. The interactive tool is a client component. Read shared-link values, such as `?name=example.com` or `?state=…`, in the browser. Use a small client wrapper named `<slug>-from-url.tsx` with `useInitialQuery()` from `app/ui/tools/use-initial-query.ts`. Key the tool component with `query.key`, as `dns-lookup` does. Do not use `useSearchParams()` or pass these values from the server page. The first render shows the default state, then fills from the URL. A tool that runs automatically from a shared link starts after hydration.

### Directories

The static page shows the default view: first page, default sort, no filters. This is the indexed page. Its cards and detail content are server-rendered.

Filters, search, sort, and pagination are a client component:

- Small directories ship a compact index with the page, or as one cached JSON route, and filter in the browser.
- Large directories backed by repo files load their compact index from a static JSON route and filter in the browser. The release builds the route alongside the page.
- Large directories, such as self-host apps, fetch filtered results from a cached API route. Data changes purge that cache by tag.
- The URL keeps filter state such as `?category=…&page=2` so links can be shared. These URLs stay `noindex`.

Without JavaScript, visitors and crawlers see the default static page.

## Cache layers

1. **Cloudflare edge.** Caches successful HTML and RSC responses. The proxy adds a `Cache-Tag` header: `stack127-public`, `page:<slug>`, and family tags such as `home`, `sitemap`, `self-host-catalog`, and `self-host-detail`. API indexes share their directory's purge tags. Errors are never cached.
2. **Next.js page cache.** Static pages built at release time and kept until revalidated.
3. **Next.js data cache.** Shared data loaded with `unstable_cache`, using `revalidate: false` and a named tag. Next.js does not cache an entry over 2 MB. Split large sources into smaller entries, as the self-host index does.

## The revalidation pipeline

1. A source-table trigger calls `stack127_enqueue_revalidation(entity_type, slug, source)`. This adds a row to `public.stack127_revalidation_events`.
2. The Supabase `cache-worker` function claims events. It uses `scripts/stack127/cache/targets.mjs` to map them to Next.js tags, paths, Cloudflare tags, and pages to warm.
3. It calls `POST /api/cache/revalidate`, which runs `revalidateTag` and `revalidatePath`.
4. It verifies origin pages and the self-host search, CLI index, and hardware index against their sources before purging Cloudflare. It then warms the verified responses. A stale response leaves the event queued for retry.

A release purges `stack127-public` and `stack127-assets`, then warms the main pages.

The source tags live in `lib/cache-tags.ts`. `scripts/stack127/cache/targets.mjs` imports the same constants. The directory entities map as follows:

| Entity | Next.js data tag | Cloudflare family tag |
| --- | --- | --- |
| Directory page copy (a `page` event) | `stack127-directory-page:<slug>` | The page tag, such as `page:ad-networks:adapex` |
| `platform_fees` | `stack127-platform-fees` | `platform-fees-catalog` |
| `ad_networks` | `stack127-ad-networks` | `ad-networks-catalog` |
| `launch_directories` | `stack127-launch-directories` | `page:launch-directories` |
| `cli_apps` | `stack127-terminal-apps` | `cli-apps-catalog` |
| `self_host_app`, `self_host_catalog` | `stack127-self-host-apps` and app detail tags | `self-host-catalog` and app detail tags |

Keyboard-shortcut and ad-network child headings can inherit their parent directory icon. A parent `page` event also purges `keyboard-shortcuts-catalog` or `ad-networks-catalog`, shared by the parent and child responses. A child-only edit keeps its page-specific purge.

Hardware data ships from repository files. Releases refresh it. Each hardware JSON response also carries `page:<directory>` so publication changes purge its index and details.

## Cloudflare cache times

`configure-cloudflare.mjs --long-ttl` sets seven-day edge TTLs for successful HTML and RSC, including directory and query views. Browsers still revalidate each time. JSON routes use their origin TTLs. The rule covers self-host search, the CLI index, and hardware indexes and details. Errors keep `no-store`.

The existing seven-day worker health gate still applies. Apply this only after the migration, app, and cache worker are live:

```bash
node --env-file=.env.database --env-file=.env.deploy scripts/stack127/cache/configure-cloudflare.mjs --long-ttl --apply
```

This command changes Cloudflare rules and records when long TTLs were enabled. Without `--apply`, it checks readiness and reads Cloudflare rules without changing them. Without `--long-ttl`, the shorter TTLs remain.

## Adding a data source or page family

1. Name one tag for the source in the shared tag list, for example `stack127-platform-fees`.
2. Load the data with `unstable_cache(…, { revalidate: false, tags: [tag] })`.
3. In a migration, add the entity type to the `stack127_revalidation_events` check constraint. Add triggers on every source table.
4. Map the entity type in `scripts/stack127/cache/targets.mjs` to its Next.js tags, paths, Cloudflare tags, and warm paths.
5. If the family needs a group purge, add its Cloudflare tag in `proxy.ts`.
6. Open a pull request. Its CI runs `npm run build`, whose `postbuild` hook runs `npm run check:static -- --strict` and rejects dynamic public pages or timed revalidation. Don't build on the homelab.

## Checking a change

- Every public page must build as `○` or `●`. API routes, `/vitals`, and `/publication-not-found` may be dynamic.
- `npm run check:static -- --strict` reads the build manifests and checks server source for query reads, `headers()`, `cookies()`, and dynamic or timed route settings. A missing build fails the check.
- `npm run stack127:deploy:preflight` runs the same strict check in the release workflow. It uses `--static-source-only` before the image exists; the image build's `postbuild` hook checks the generated manifests. Source-only success is not a completed build check.
- Load the page twice. The second load must not query the database for page data.
- Change a source row in development and confirm the page updates after the worker runs.
