# Home

Route: `/`

## Purpose

Home is the product map for Version127: a design-system sidebar of main published pages, and a compact card grid for the live product/reference surfaces.

## Sidebar

- Same shell pattern as course and licenses: `directory-filter-panel`, heading `h1`, padded nav links.
- Heading is `version127`.
- Built from `public.version127_pages` via `getMainPublishedPages()`.
- Main pages only: published, non-empty slug, no `/` in the slug (no child routes).
- Link text uses the `label` column, not `meta_title`.
- Ordered by `sitemap_priority` desc, then `label`.

## Main content

- Compact H1 and short lede (not a marketing billboard).
- Feature cards for main product/reference pages (`isHomeFeaturePage`), excluding utility page types such as About, Privacy, and Terms.
- Cards use `label`, `meta_description`, and live stats when available (directory counts, lesson count, license count).
- Optional "Start here" path for beginners, app browsing, and license checks.

## Data

- Publication, labels, and SEO live only in `public.version127_pages` (home slug is `''`).
- Do not hardcode main page lists or metadata in the route file.
- Unknown or missing stats should be omitted, not invented.

## SEO notes

Home meta describes the whole site, not one product surface. Align with AGENTS.md and `/about`: a compact technical directory for self-host apps, open-source tools, home automation, AI agents, calculators, references, and related technical resources. Prefer structured-facts language over marketing filler. Keep the title under about 60 characters and the description around 150 to 160 characters when possible.
