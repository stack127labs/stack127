# Tool catalogs

Tool catalogs are server-rendered at `/<slug>` by one route. Notion is a planning space only. The site never reads or syncs Notion for catalog content or tool membership.

## Data ownership

- `public.stack127_pages` is the only URL, publication, SEO, social image, and public date registry. Set `page_family = 'catalog'` for a tool catalog. A catalog is public only when `is_published = true`.
- `public.stack127_tool_catalogs` holds the visible heading, introduction, section heading, catalog navigation order, icon key, and approved marker-art keys. Its `page_id` refers to the registry row.
- `public.stack127_tool_pages` holds each tool's short card name and description plus icon and marker-art keys. These fields work in every catalog that includes the tool.
- `public.stack127_tool_catalog_memberships` links tools to any number of catalogs. `catalog_rank = 1` is the tool's primary catalog. Use `2`, `3`, and so on for secondary catalogs. `display_order` is the tool's position inside that catalog. Each rank is unique per tool, and each display order is unique per catalog.

Only published tool rows render as cards. An unpublished tool may have memberships ready for launch. Publishing it in `stack127_pages` makes its card visible in all assigned catalogs. Keep published catalogs populated with at least one published tool.

## Editing

1. Create the `stack127_pages` row first. Use a flat unique slug, `page_family = 'catalog'`, a short `label`, reviewed `meta_title` and `meta_description`, appropriate `page_type` such as `CollectionPage`, and public dates when publishing. Do not put SEO metadata in route files.
2. Add a `stack127_tool_catalogs` row for that page ID. Write a heading in three parts so `heading_mark` gets the site accent. Add the intro, section heading, `home_order` for the homepage catalog section, and approved icon/art keys. See `lib/tool-catalog-icons.ts` and `lib/tool-catalog-art.ts` for supported keys. Use `none` when the catalog has no reviewed marker drawing; its icon remains visible. Unknown art keys show no drawing. The homepage lists every published catalog first in `home_order`, followed by other resource cards. The sidebar uses the registry's `sitemap_priority`.
3. Add at least one `stack127_tool_catalog_memberships` row. Select the tool's `page_id` from `stack127_tool_pages`, set its next catalog rank, and choose its display order. To move a tool, edit its membership rows. Do not add tool cards to the route code.
4. Review the tool's `card_name`, `card_description`, `card_icon_key`, and `card_art_key` in `stack127_tool_pages`. New tool rows inherit the registry label and search description until the card is edited. Use `icon` for a card without its own reviewed marker drawing. Keep card copy short and task focused.
5. Publish the catalog registry row after its copy and visible tools are ready. It then enters the homepage and sitemap automatically. Check its desktop and mobile page, links, title, canonical, and public dates.

For a new tool, the product plan names its primary catalog and any secondary catalogs. The writing worker supplies one card name and description shared across them. The integration worker applies the card fields and memberships to development together:

```bash
npm run stack127:tool-page:catalogs:update -- \
  --slug dns-lookup \
  --catalogs dns-tools,domain-tools \
  --card-name "DNS lookup" \
  --card-description "Read current DNS records and see where each answer came from." \
  --card-icon-key search \
  --card-art-key dns-lookup
```

Review the dry-run result, then add `--apply`. The catalog list is the complete desired list, in rank order. The first entry becomes the primary catalog. An existing catalog keeps its display order; a new placement appends unless `catalog-slug:order` specifies an unused position. Omitting an existing catalog removes that membership, so inspect the full list before applying. The command rejects duplicate or missing catalogs and occupied positions. It reads `.env.local` by default, checks that it differs from production, and rolls back dry runs. Production use is a separate authorized action with `--environment production --confirm stack127-production --apply` after the schema migration exists there. Inspect the actual catalog cards and links after applying.

The domain catalog has a separate explanatory reference article. EPP status codes and the TLD directory remain reference pages in the publication registry, not tool rows.

## Freshness

Catalog content edits, membership changes, tool card edits, and tool publication changes touch the catalog's public `updated_at`. The existing database revalidation queue receives the catalog slug as a page event. The cache worker invalidates the catalog page, catalog data tags, homepage, and sitemap. A new catalog needs no route or homepage code change.

The development project can lag the repo's migration history. Apply the catalog migration only to the intended managed project, and verify the tool count, primary membership count, visible catalog cards, homepage cards, and cache events before sharing a preview. Production migration and deployment are separate release work.

For a local preview, run `npm run dev` and `npm run stack127:cache:watch:local` as separate background services. The watcher accepts only the managed development project, revalidates through the local signed endpoint every five seconds, and never calls Cloudflare. Stop both services when the preview is no longer needed.
