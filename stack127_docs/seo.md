# Stack127 SEO

Use [writing-style.md](writing-style.md) when writing titles, descriptions, and other public words. This document covers metadata storage and publication behavior.

## Base URL

The production URL is `https://stack127.com`.

Use `NEXT_PUBLIC_SITE_URL` when a deploy target needs to override the base URL. If it is missing, the app falls back to `https://stack127.com`.

## Publication Registry

Stack127 uses `public.stack127_pages` as the only source of truth for public page publication, metadata, indexing, and sitemap inclusion.

Page files must not export `metadata`, define `generateMetadata`, hardcode robots rules, create canonical URLs, define sitemap dates, or emit page-level JSON-LD. Page code renders content only. The root layout reads the current request path, checks `stack127_pages`, and applies publication rules centrally.

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

Unknown optional values should be `null`, not guessed.

Automatic row timestamps and public dates are separate. Do not present `row_created_at` or `row_updated_at` to readers, use them for sitemap dates, or set `row_updated_at` manually. Tool-specific fields and their update rules are documented in `stack127_docs/tool-pages.md`.

The first tool-page rollout retains the old `created_at` column only for zero-downtime compatibility
with the previously deployed application. New code uses `row_created_at`. Remove the compatibility
column in a later migration only after the new production image is verified.

## Indexing

The route rules are intentionally simple:

| request | behavior |
| --- | --- |
| Exact published slug, for example `/self-host-apps` | Render, `index, follow`, sitemap included |
| Exact published slug with query params, for example `/self-host-apps?page=2` | Render, `noindex, follow`, sitemap excluded |
| Child route under a published root, for example `/self-host-apps/page/2` | Render if code exists, `noindex, follow`, sitemap excluded |
| Exact child slug later added to `stack127_pages` | Render, `index, follow`, sitemap included |
| Route outside a published root, for example `/random-test-page` | `404`, even if code exists |

## Current Sitemap Routes

The exact approved set and its metadata come from `public.stack127_pages`. The shared SEO runtime reads that registry for indexing and sitemap decisions. It currently includes:

- core, legal, and collection pages: `/`, `/about`, `/privacy`, `/terms`, `/self-host-apps`, `/dns-tools`, `/domain-tools`, and `/software-licenses-for-self-hosting`;
- flat DNS tools: `/dns-lookup`, `/dns-trace`, `/dns-change-checker`, `/nameserver-checker`, `/dnssec-checker`, `/soa-checker`, and `/caa-checker`;
- flat domain tools and references: `/domain-age`, `/domain-availability`, `/domain-expiry`, `/domain-lookup`, `/domain-owner`, `/domain-registrar`, `/domain-report`, `/epp-status-codes`, `/multi-tld-availability`, `/punycode-converter`, `/tld-directory`, and `/transfer-readiness`;
- standalone technical tools: `/dockerignore-tester`, `/home-assistant-energy-entity-checker`, `/nginx-proxy-pass-calculator`, and `/nfs-firewall-rules`;
- the `/self-hosting-for-beginners` course root and its exact published lesson routes.

The storage collection and its flat calculators, including the RAIDZ Expansion Planner, are published at flat canonical routes. Historical or collection-prefixed nested tool URLs permanently redirect to their flat canonical paths and never appear in the sitemap.

## Structured Data

Sitewide JSON-LD describes Stack127 as a `WebSite` and `Organization`.

Exact published registry pages get page-level JSON-LD from the root layout. `datePublished`, `dateModified`, description, URL, and page type come from `stack127_pages`.

## Robots

`robots.txt` allows normal crawling, excludes `/api/` from voluntary crawler access, and points crawlers to `/sitemap.xml`. The API rule is crawl hygiene, not access control.

Do not block useful pages in `robots.txt` just to handle duplicates. Prefer `noindex, follow` on duplicate URL states so crawlers can still follow links.

## Creating A New Public Page

1. Build the repo-owned route under `app/`.
2. Keep page code free of metadata, robots, canonical, sitemap, and JSON-LD exports.
3. Add or update the page docs under `content_docs/<page-slug>/`.
4. Insert a reviewed row into `public.stack127_pages` with the correct `page_family` when the page should become public.
5. Verify the exact URL renders with `index, follow`, appears in `/sitemap.xml`, and child/query variants stay `noindex, follow`.
