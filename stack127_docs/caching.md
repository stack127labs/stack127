# Caching and revalidation

This is the target contract for new pages and the planned conversion of existing pages. The conversion is not complete. Existing directories and some tools still render per request, and static pages still use timed revalidation. Track that work in [the rollout plan](../dev-space/static-pages-and-on-demand-revalidation-plan.md).

After conversion, every public page is built and cached. A page changes when its data changes, and the revalidation pipeline refreshes it. A release rebuilds every page.

This keeps pages fast. Links can prefetch whole pages for fast navigation. A slow or failed database call can never become the page a visitor sees.

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

The page is static. The interactive tool is a client component. Read shared-link values, such as `?name=example.com` or `?state=…`, in the browser. Use `useSearchParams()` inside a `<Suspense>` boundary. Never pass these values from the server page. The first render shows the default state, then fills from the URL. A tool that runs automatically from a shared link starts after hydration.

### Directories

The static page shows the default view: first page, default sort, no filters. This is the indexed page. Its cards and detail content are server-rendered.

Filters, search, sort, and pagination are a client component:

- Small directories ship a compact index with the page, or as one cached JSON route, and filter in the browser.
- Large directories, such as self-host apps, fetch filtered results from a cached API route. Data changes purge that cache by tag.
- The URL keeps filter state such as `?category=…&page=2` so links can be shared. These URLs stay `noindex`.

Without JavaScript, visitors and crawlers see the default static page.

## Cache layers

1. **Cloudflare edge.** Caches successful HTML and RSC responses. The proxy adds a `Cache-Tag` header: `stack127-public`, `page:<slug>`, and family tags such as `home`, `sitemap`, `self-host-catalog`, and `self-host-detail`. Errors are never cached.
2. **Next.js page cache.** Static pages built at release time and kept until revalidated.
3. **Next.js data cache.** Shared data loaded with `unstable_cache`, using `revalidate: false` and a named tag. Next.js does not cache an entry over 2 MB. Split large sources into smaller entries, as the self-host index does.

## The revalidation pipeline

1. A source-table trigger calls `stack127_enqueue_revalidation(entity_type, slug, source)`. This adds a row to `public.stack127_revalidation_events`.
2. The Supabase `cache-worker` function claims events. It uses `scripts/stack127/cache/targets.mjs` to map them to Next.js tags, paths, Cloudflare tags, and pages to warm.
3. It calls `POST /api/cache/revalidate`, which runs `revalidateTag` and `revalidatePath`.
4. It purges Cloudflare by tag and warms the changed pages.

A release purges `stack127-public` and `stack127-assets`, then warms the main pages.

## Adding a data source or page family

1. Name one tag for the source in the shared tag list, for example `stack127-platform-fees`.
2. Load the data with `unstable_cache(…, { revalidate: false, tags: [tag] })`.
3. In a migration, add the entity type to the `stack127_revalidation_events` check constraint. Add triggers on every source table.
4. Map the entity type in `scripts/stack127/cache/targets.mjs` to its Next.js tags, paths, Cloudflare tags, and warm paths.
5. If the family needs a group purge, add its Cloudflare tag in `proxy.ts`.
6. Run `npm run build` and confirm the route list shows the page as static (`○` or `●`), never dynamic (`ƒ`).

## Checking a change

- New and converted page routes must build as `○` (static) or `●` (built from `generateStaticParams`). Until the rollout is complete, report existing dynamic routes and timed refreshes against the rollout plan. Once complete, every page route must pass this gate. API routes, `/vitals`, and `/publication-not-found` may be `ƒ`.
- Load the page twice. The second load must not query the database for page data.
- Change a source row in development and confirm the page updates after the worker runs.
