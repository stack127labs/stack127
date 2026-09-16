# Home

Route: `/`

## Purpose

Home helps tech tinkerers and hustlers find the resources already available on stack127. Follow [the product direction](../../stack127_docs/product-direction.md) and the [page brief](brief.md).

## Sidebar and cards

- Use the shared shell, `SidebarLabel`, and linked card grid.
- Read published page labels and descriptions through `getMainPublishedPages()`.
- Keep homepage eligibility in `lib/page-registry-helpers.ts`. URL depth is not navigation metadata.
- Feature published directories, tool catalogs, reference roots, the course, and Labs. Individual tools and shortcut sheets remain discoverable through their collections.
- Every card needs its spec-backed marker art and a meaningful count from its destination's data. Do not invent counts or show unfinished resources.
- Preserve the existing layout, typography, themes, and artwork.

## Opening and recommendations

Use the agreed byline, "Tools and directories for tech tinkerers and hustlers." Explain the available tools, software and hardware directories, references, and courses in one short introduction.

Start here links to existing domain tools, CLI apps, keyboard shortcuts, and the self-hosting course. Include each recommendation only when its destination belongs to the published feature set.

## Publication and metadata

Publication, labels, metadata, and ordering remain owned by `public.stack127_pages`. The homepage slug is the empty string. The shared description and the homepage metadata should describe the whole site. New offerings must not be presented as available before they launch.
