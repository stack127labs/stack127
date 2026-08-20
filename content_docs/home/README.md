# Home

Route: `/`

## Purpose

Home is the product map for Stack127: a design-system sidebar of main published pages, and a compact card grid for the live product/reference surfaces.

## Sidebar

- Same shell pattern as course and licenses: `directory-filter-panel`, heading `h1`, padded nav links.
- Heading is `stack127`.
- Built from `public.stack127_pages` via `getMainPublishedPages()`.
- Home eligibility is the explicit `homePageSlugs` collection in `lib/page-registry-helpers.ts`. URL depth is not navigation metadata because canonical tool routes are flat.
- Link text uses the `label` column, not `meta_title`.
- Ordered by `sitemap_priority` desc, then `label`.

## Main content

- Shared page H1 treatment and a short lede, without turning the opening into a marketing billboard.
- Feature cards for main product/reference pages (`isHomeFeaturePage`), excluding utility page types such as About, Privacy, and Terms.
- Direct cards for `/dockerignore-tester`, `/home-assistant-energy-entity-checker`, `/nginx-proxy-pass-calculator`, and `/nfs-firewall-rules` keep these useful tools discoverable until a relevant collection is designed. Their canonical URLs stay flat.
- Retired Immich page entries stay out of both the homepage cards and sidebar, even if a stale registry row remains locally.
- Cards use `label`, `meta_description`, and live stats when available (directory counts, lesson count, license count).
- Optional "Start here" path for beginners, app browsing, and license checks.

## Data

- Publication, labels, and SEO live only in `public.stack127_pages` (home slug is `''`).
- Keep the small home-eligibility list in the registry helper, never in the route file. Labels, descriptions, publication state, and ordering still come from `public.stack127_pages`.
- Unknown or missing stats should be omitted, not invented.

## SEO notes

Home meta describes the whole site, not one product surface. Align with AGENTS.md and `/about`: a compact technical directory for self-host apps, open-source tools, home automation, AI agents, calculators, references, and related technical resources. Prefer structured-facts language over marketing filler. Keep the title under about 60 characters and the description around 150 to 160 characters when possible.
