# Tool catalogs

One route server-renders every tool catalog at `/<slug>`.

Notion is only a planning space. The site never reads or syncs Notion for catalog content or tool membership.

## Data ownership

| Table | Owns |
| --- | --- |
| `public.stack127_pages` | The only registry for URL, publication, SEO, social image, and public dates. Set `page_family = 'catalog'` for a tool catalog. A catalog is public only when `is_published = true`. |
| `public.stack127_catalog_pages` | The visible heading, introduction, section heading, homepage order, `hero_art_key`, and the catalog's card: `card_name`, `card_description`, `card_icon_key`, and `card_art_key`. Its `page_id` points to a registry row whose family is `catalog`. |
| `public.stack127_tool_pages` | Each tool's short card name and description, plus icon and marker art keys. These fields apply in every catalog that includes the tool. |
| `public.stack127_tool_catalog_memberships` | Links tools to any number of catalogs. |

In memberships, `catalog_rank = 1` is the tool's primary catalog. Use `2`, `3`, and so on for secondary catalogs. `display_order` is the tool's position inside that catalog. Each rank is unique per tool, and each display order is unique per catalog.

Only published tool rows render as cards. An unpublished tool can have its memberships ready for launch. Publishing it in `stack127_pages` makes its card show in every assigned catalog.

Keep each published catalog populated with at least one published tool.

## Cards

Every card on the site uses `PageCard` from `app/ui/cards/page-card.tsx`: art, icon, name, description, and an optional count. Catalog pages render `ToolCard` through the `ToolCatalog` grid. The homepage renders `CatalogCard` with the tool count. Don't build a card inside a route.

## Navigation

Catalog sidebars list every published catalog in navigation order. They highlight the current catalog with the shared active row style and `aria-current="page"`.

Each tool page finds its `catalog_rank = 1` membership. It lists every published tool in that catalog, in the same `display_order` as the catalog cards. The current tool uses the same active row style.

Secondary memberships add cards to those catalogs, but they don't change the tool page's sidebar.

Give a published tool one primary membership before launch. A tool without one falls back to the catalog list.

## Editing

The tools publisher creates and publishes catalogs. Add a new catalog to the same batch as the first tool that needs it, with `family: "catalog"`. See [page-publishing.md](page-publishing.md). The steps below say what a catalog needs, whichever command writes it.

1. Create the `stack127_pages` row first. Use a flat unique slug, `page_family = 'catalog'`, a short `label`, reviewed `meta_title` and `meta_description`, a fitting `page_type` such as `CollectionPage`, and public dates when publishing. Don't put SEO metadata in route files.
2. Add a `stack127_catalog_pages` row for that page ID, with its card name and description.
   - Write the heading in three parts, so `heading_mark` gets the site accent.
   - Add the intro, section heading, `home_order` for the homepage catalog section, and approved icon and art keys. Supported keys are in `lib/card-icons.ts` and `lib/card-art.ts`. The publisher manifest still names the card keys `icon_key` and `home_art_key`, and writes them to `card_icon_key` and `card_art_key`.
   - The writers reject keys that aren't registered. A card with no drawing shows its icon large instead.
   - The homepage lists every published catalog first, in `home_order`, then other resource cards. The sidebar uses the registry's `sitemap_priority`.
3. Add at least one `stack127_tool_catalog_memberships` row. Pick the tool's `page_id` from `stack127_tool_pages`, set its next catalog rank, and choose its display order. To move a tool, edit its membership rows. Don't add tool cards to the route code.
4. Review the tool's `card_name`, `card_description`, `card_icon_key`, and `card_art_key` in `stack127_tool_pages`.
   - New tool rows use the registry label and search description until someone edits the card.
   - Every new tool gets its own spec-backed `toolSpot` marker drawing. Generate it before integration and register it in `lib/card-art.ts`.
   - Use `icon` only as a temporary fallback for an existing card waiting for reviewed art.
   - Keep card copy short and focused on the task.
5. Publish the catalog registry row once its copy and visible tools are ready. It then joins the homepage and sitemap automatically. Check the page at desktop and mobile width, plus its links, title, canonical, and public dates.

### Adding a new tool to catalogs

Each step has an owner:

| Step | Owner |
| --- | --- |
| Name the primary catalog, any secondary catalogs, and a specific card art brief | Product plan |
| Generate and register the drawing | Opus frontend step |
| Write one card name and description, shared across catalogs | Opus writing session |
| Apply the card fields and memberships to development together | Integration worker |

The integration worker runs:

```bash
npm run stack127:tool-page:catalogs:update -- \
  --slug dns-lookup \
  --catalogs dns-tools,domain-tools \
  --card-name "DNS lookup" \
  --card-description "Read current DNS records and see where each answer came from." \
  --card-icon-key search \
  --card-art-key dns-lookup
```

Review the dry-run result, then add `--apply`.

How the command treats the catalog list:

- The list is the complete list you want, in rank order. The first entry becomes the primary catalog.
- An existing catalog keeps its display order. A new placement goes at the end, unless `catalog-slug:order` names an unused position.
- Leaving out an existing catalog removes that membership. Check the full list before you apply.
- It rejects duplicate or missing catalogs and taken positions.
- It reads `.env.local` by default, checks that it differs from production, and rolls back dry runs.

For production, put the same card fields and catalog list in the tool's publisher manifest. Its `catalogs` list follows the same rules: complete, in rank order, first entry primary. The catalogs command still accepts `--environment production --confirm stack127-production --apply` for a small fix to a live tool's cards.

After applying, look at the actual catalog cards and links.

The domain catalog has a separate reference article that explains it. EPP status codes and the TLD directory stay reference pages in the publication registry. They aren't tool rows.

## Freshness

These changes touch the catalog's public `updated_at`:

- Catalog content edits.
- Membership changes.
- Tool card edits.
- Tool publication changes.

The database revalidation queue gets the catalog slug as a page event. The cache worker then invalidates the catalog page, catalog data tags, homepage, and sitemap. A new catalog needs no route or homepage code change.

Catalog page events also invalidate the primary catalog lookup and every published tool page. That's because one catalog change can change many tool sidebars. Tool pages are invalidated without warming them all at once. The revalidation endpoint takes paths in batches of at most 200.

The development project can fall behind the repo's migration history. Apply the catalog migration only to the managed project you mean to change.

Before sharing a preview, check the tool count, primary membership count, visible catalog cards, homepage cards, and cache events. Production migrations ship through a pull request. Production catalog data goes through the publisher after that release is live.

For a local preview, run `npm run dev` and `npm run stack127:cache:watch:local` as separate background services. The watcher only accepts the managed development project. It revalidates through the local signed endpoint every five seconds and never calls Cloudflare. Stop both services when you're done with the preview.
