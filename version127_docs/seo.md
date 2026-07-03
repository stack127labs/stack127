# Version127 SEO

## Base URL

The production URL is `https://version127.com`.

Use `NEXT_PUBLIC_SITE_URL` when a deploy target needs to override the base URL. If it is missing, the app falls back to `https://version127.com`.

## Dates

Keep page-owned SEO dates in code. Use `pageDates` from `lib/seo.ts` for repo-owned pages.

Use database freshness only when the rendered page depends on database content. For example, `/self-host-apps` uses the latest published app/category update as its modified date.

Do not use `new Date()` as a default sitemap `lastmod`. It tells crawlers the page changed on every render, even when it did not.

## Indexing

- Clean public routes should be indexable.
- Pagination, filters, search states, selected app drawers, and other query-param variants should be `noindex, follow`.
- Sitemaps should include clean canonical routes only.
- Canonicals should point back to the clean route, not the current query-param URL.

## Current Sitemap Routes

- `/`
- `/self-host-apps`
- `/about`
- `/privacy`
- `/terms`

## Structured Data

Sitewide JSON-LD describes Version127 as a `WebSite` and `Organization`.

Page-specific JSON-LD should include `datePublished` and `dateModified`. The self-host apps page uses `CollectionPage`; legal/info pages use the closest matching page type.

## Robots

`robots.txt` allows normal crawling and points crawlers to `/sitemap.xml`.

Do not block useful pages in `robots.txt` just to handle duplicates. Prefer `noindex, follow` on duplicate URL states so crawlers can still follow links.
