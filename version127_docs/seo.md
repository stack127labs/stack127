# Version127 SEO

## Base URL

The production URL is `https://version127.com`.

Use `NEXT_PUBLIC_SITE_URL` when a deploy target needs to override the base URL. If it is missing, the app falls back to `https://version127.com`.

## Publication Registry

Version127 uses `public.version127_pages` as the only source of truth for public page publication, metadata, indexing, and sitemap inclusion.

Page files must not export `metadata`, define `generateMetadata`, hardcode robots rules, create canonical URLs, define sitemap dates, or emit page-level JSON-LD. Page code renders content only. The root layout reads the current request path, checks `version127_pages`, and applies publication rules centrally.

Fields:

| column | purpose |
| --- | --- |
| `slug` | URL path without leading slash, for example `self-host-apps` or `self-hosting-for-beginners/linux-ssh-basics` |
| `meta_title` | Full browser/search title |
| `meta_description` | Search description |
| `is_published` | Whether the exact slug is a public SEO page |
| `created_at` | Registry creation date |
| `published_at` | Date the exact slug became public |
| `updated_at` | Last meaningful SEO/content update for sitemap `lastmod` and JSON-LD |
| `cover_image_url` | Optional Open Graph/Twitter image |
| `page_type` | Schema.org page type, for example `WebPage` or `CollectionPage` |
| `sitemap_priority` | Sitemap priority from `0` to `1` |

Unknown optional values should be `null`, not guessed.

## Indexing

The route rules are intentionally simple:

| request | behavior |
| --- | --- |
| Exact published slug, for example `/self-host-apps` | Render, `index, follow`, sitemap included |
| Exact published slug with query params, for example `/self-host-apps?page=2` | Render, `noindex, follow`, sitemap excluded |
| Child route under a published root, for example `/self-host-apps/page/2` | Render if code exists, `noindex, follow`, sitemap excluded |
| Exact child slug later added to `version127_pages` | Render, `index, follow`, sitemap included |
| Route outside a published root, for example `/random-test-page` | `404`, even if code exists |

## Current Sitemap Routes

- `/self-host-apps`

## Structured Data

Sitewide JSON-LD describes Version127 as a `WebSite` and `Organization`.

Exact published registry pages get page-level JSON-LD from the root layout. `datePublished`, `dateModified`, description, URL, and page type come from `version127_pages`.

## Robots

`robots.txt` allows normal crawling and points crawlers to `/sitemap.xml`.

Do not block useful pages in `robots.txt` just to handle duplicates. Prefer `noindex, follow` on duplicate URL states so crawlers can still follow links.

## Creating A New Public Page

1. Build the repo-owned route under `app/`.
2. Keep page code free of metadata, robots, canonical, sitemap, and JSON-LD exports.
3. Add or update the page docs under `content_docs/<page-slug>/`.
4. Insert a reviewed row into `public.version127_pages` when the page should become public.
5. Verify the exact URL renders with `index, follow`, appears in `/sitemap.xml`, and child/query variants stay `noindex, follow`.
