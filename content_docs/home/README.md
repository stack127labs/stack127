# Home

Route: `/`

## Purpose

Home helps solo builders, indie hackers, content creators, and tech tinkerers find the resources already available on stack127. Follow [the product direction](../../stack127_docs/product-direction.md) and the [page brief](brief.md).

## Sidebar and cards

- Use the shared shell, `SidebarLabel`, and linked card grid.
- Read published page labels and descriptions through `getMainPublishedPages()`.
- Keep homepage eligibility in `lib/page-registry-helpers.ts`. URL depth is not navigation metadata.
- Show sections in this order: published directories and reference roots (`DirectoryCard`), every published tool catalog (`CatalogCard`, in the catalog table's `home_order`), then courses as wide cards (`CourseCard`). Labs is not shown on the home page; it stays in the top bar menu. That one exception lives in the home page's `hiddenOnHome` list. Individual tools and shortcut sheets remain discoverable through their collections.
- Every card needs its approved marker art or catalog icon and a meaningful count from its destination's data. Directory cards read `card_icon_key` and `card_art_key` from the database. Each directory computes its count in its own `card-counts.ts`. Do not invent counts or show unfinished resources.
- Preserve the existing layout, typography, themes, and artwork.

## Opening

Use the positioning line, "A toolbox and reference hub for solo builders and tinkerers creating things online." Explain the available tools, software and hardware directories, references, and courses in one short introduction.

## Publication and metadata

Publication, labels, metadata, and ordering remain owned by `public.stack127_pages`. The homepage slug is the empty string. The shared description and the homepage metadata should describe the whole site. New offerings must not be presented as available before they launch.
