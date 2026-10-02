# stack127 SEO

Use [writing-style.md](writing-style.md) when writing headings, titles, descriptions, and other public words. This document covers metadata storage and publication behavior.

## Base URL

The production URL is `https://stack127.com`.

Use `NEXT_PUBLIC_SITE_URL` when a deploy target needs to override the base URL. If it is missing, the app falls back to `https://stack127.com`.

## Publication registry

`public.stack127_pages` alone controls public page publication, metadata, indexing, and sitemap inclusion.

Page files must not export `metadata`, define `generateMetadata`, hardcode robots rules, or create canonical URLs. They must not define sitemap dates or emit page-level JSON-LD. Page code renders content only. The root layout reads the current request path, checks `stack127_pages`, and applies publication rules.

Fields:

| column | purpose |
| --- | --- |
| `id` | Internal page identity and primary key |
| `slug` | URL path without leading slash, for example `self-host-apps` or `self-hosting-for-beginners/linux-ssh-basics` |
| `page_family` | Page ownership family: `tool`, `catalog`, `course`, `info`, or `legal` |
| `label` | Compact UI label for sidebars, home cards, and other chrome |
| `meta_title` | Full browser/search title |
| `meta_description` | Search description |
| `is_published` | Whether the exact slug is a public SEO page |
| `row_created_at` | Internal registry-row creation time. It is not a public date |
| `row_updated_at` | Automatic internal time of the latest registry-row write |
| `published_at` | Public time the exact slug first became public; `null` while unpublished |
| `updated_at` | Deliberate public time of the latest meaningful SEO, content, or tool change; `null` while unpublished |
| `cover_image_url` | Optional Open Graph/Twitter image |
| `page_type` | Schema.org page type, for example `WebPage` or `CollectionPage` |
| `sitemap_priority` | Sitemap priority from `0` to `1` |

Use `null` for unknown optional values. Do not guess.

Automatic row timestamps and public dates are separate. Do not show `row_created_at` or `row_updated_at` to readers or use them for sitemap dates. Do not set `row_updated_at` manually. See `stack127_docs/tool-pages.md` for tool-specific fields and update rules.

The first tool-page rollout keeps the old `created_at` column so the previous application keeps working without downtime. New code uses `row_created_at`. Remove the compatibility column in a later migration only after verifying the new production image.

## Indexing

Follow these route rules:

| request | behavior |
| --- | --- |
| Exact published slug, for example `/self-host-apps` | Render, `index, follow`, sitemap included |
| Exact published slug with query params, for example `/self-host-apps?page=2` | Render the same static page, `noindex, follow` through the proxy header, sitemap excluded |
| Child route under a published root, for example `/self-host-apps/page/2` | Render if code exists, `noindex, follow`, sitemap excluded |
| Exact child slug later added to `stack127_pages` | Render, `index, follow`, sitemap included |
| Route outside a published root, for example `/random-test-page` | `404`, even if code exists |

A URL with a query string is never indexed. Search, filters, sort, and `?page=` stay out of the index. To index a category or other view, give it its own path, such as `/self-host-apps/categories/<name>`. Publish that exact slug. See [caching.md](caching.md) for why pages never read the query on the server.

## Current sitemap routes

The approved routes and their metadata come from `public.stack127_pages`. The shared SEO runtime reads that registry for indexing and sitemap decisions. It currently includes:

- core, legal, and collection pages: `/`, `/about`, `/privacy`, `/terms`, `/self-host-apps`, `/dns-tools`, `/domain-tools`, and `/software-licenses-for-self-hosting`;
- flat DNS tools: `/dns-lookup`, `/dns-trace`, `/dns-change-checker`, `/nameserver-checker`, `/dnssec-checker`, `/soa-checker`, and `/caa-checker`;
- flat domain tools and references: `/domain-age`, `/domain-availability`, `/domain-expiry`, `/domain-lookup`, `/domain-owner`, `/domain-registrar`, `/domain-report`, `/epp-status-codes`, `/multi-tld-availability`, `/punycode-converter`, `/tld-directory`, and `/transfer-readiness`;
- standalone technical tools: `/dockerignore-tester`, `/nginx-proxy-pass-calculator`, and `/nfs-firewall-rules`;
- the `/self-hosting-for-beginners` course root and its exact published lesson routes.

The storage collection and its calculators, including the RAIDZ Expansion Planner, use flat canonical routes. Old nested tool URLs and URLs prefixed with a collection permanently redirect to their flat canonical paths. They never appear in the sitemap.

## Structured data

Sitewide JSON-LD describes stack127 as a `WebSite` and `Organization`.

Exact published registry pages get page-level JSON-LD from the root layout. `datePublished`, `dateModified`, description, URL, and page type come from `stack127_pages`.

## Robots

`robots.txt` allows normal crawling and asks crawlers to skip `/api/`. It points crawlers to `/sitemap.xml`. The API rule guides crawlers; it does not control access.

Do not block useful pages in `robots.txt` just to handle duplicates. Prefer `noindex, follow` on duplicate URL states. Crawlers can still follow their links.

## Creating a new public page

1. Build the repo-owned route under `app/`.
2. Keep page code free of metadata, robots, canonical, sitemap, and JSON-LD exports.
3. Add or update the page docs under `content_docs/<page-slug>/`.
4. When the page should become public, insert a reviewed row into `public.stack127_pages` with the correct `page_family`.
5. Verify the exact URL renders with `index, follow`, appears in `/sitemap.xml`, and child/query variants stay `noindex, follow`.
6. Follow [caching.md](caching.md). The page must be static and use on-demand revalidation. Its data source must be covered by the revalidation pipeline.
