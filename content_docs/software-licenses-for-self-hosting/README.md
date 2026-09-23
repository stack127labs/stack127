# Software licenses for self-hosters

Route: `/software-licenses-for-self-hosting`

Catalog of software license terms that matter when someone runs or publishes a self-hosted app.

## Intent

- Serve two readers on one page: people who self-host apps, and people who ship self-host apps.
- For users: what you can do at home, at work, with changes, and when hosting for others.
- For creators: which license fits the trade you want (adoption, share-alike, source-available limits, commercial splits).
- Put the comparison table directly after the page title so visitors can answer their question first.
- Stay factual and conservative. This is not legal advice.

Writing follows `stack127_docs/writing-style.md`. Each license summary must make sense on its own for both operators and app authors.

## Content source

- `lib/software-licenses.ts` is the single source of truth for groups, license entries, verdicts, aliases, and official links.
- The page route owns the short explanations around the catalog.
- Each license card includes a concise summary, matching apps when available, and the official source.

## Layout

- Shared `AppShell` with a licenses sidebar.
- Sidebar title is the page title. No eyebrow label.
- The sidebar links to the comparison, supporting explanations, and license anchors grouped by family.
- Anchor ids match entry `id` values for deep links such as `/software-licenses-for-self-hosting#agpl-3-0`.

## Publication

- Public SEO is controlled only by `public.stack127_pages` slug `software-licenses-for-self-hosting`.
- Do not add route-owned metadata, robots, canonical, sitemap, or JSON-LD in the page file.
- When publishing, also update `tests/pages/software-licenses-for-self-hosting/page.json` and `scripts/stack127/quality/seo-registry-check.mjs`.

## Maintenance

- Prefer licenses that appear in `self_host_apps.license` or that self-host operators and project authors commonly meet.
- When adding a license, update both user and creator notes, keep ids unique, and link official text.
- Dual, custom, and product-specific EULAs usually extend the pattern sections rather than one essay per vendor.
