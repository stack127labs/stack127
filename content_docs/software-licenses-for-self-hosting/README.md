# Software licenses for self-hosters

Route: `/software-licenses-for-self-hosting`

Practical guide to license labels self-hosters see when they run apps or publish them.

## Intent

- Serve two readers on one page: people who self-host apps, and people who ship self-host apps.
- For users: what you can do at home, at work, with changes, and when hosting for others.
- For creators: which license fits the trade you want (adoption, share-alike, source-available limits, commercial splits).
- Keep the written intro short so people can jump into license sections from the sidebar.
- Stay factual and conservative. This is not legal advice.

## Voice

Use normal Version127 reference voice from `version127_docs/writing-style.md`, with a self-host angle for both operators and app authors.

- Full sentences with clear flow. Not stitched fragments.
- Say the useful thing first, then context, then the caveat.
- Plain words. Avoid abstract business jargon.
- Summaries under the license name must be understandable on their own.
- No em or en dashes.
- Not first-person course storytelling, and not corporate license-speak.

## Content source

- `lib/software-licenses.ts` is the single source of truth for concepts, groups, license entries, fact rows, user/creator notes, aliases, and official links.
- The page route only renders that data.
- Each license section includes: summary, decision facts, "If you run the app", "If you ship an app", official license text link, then optional common mistake.

## Layout

- Shared `AppShell` with a licenses sidebar.
- Sidebar title is the page title. No eyebrow label.
- Sidebar groups: Start here, Permissive, Weak copyleft, Strong / network, Source-available, Public domain / CC, Dual / custom.
- Anchor ids match entry `id` values for deep links such as `/software-licenses-for-self-hosting#agpl-3-0`.

## Publication

- Public SEO is controlled only by `public.version127_pages` slug `software-licenses-for-self-hosting`.
- Do not add route-owned metadata, robots, canonical, sitemap, or JSON-LD in the page file.
- When publishing, also update `tests/version127/page-coverage.json` and `scripts/version127/quality/seo-registry-check.mjs`.

## Maintenance

- Prefer licenses that appear in `open_projects.license` or that self-host operators and project authors commonly meet.
- When adding a license, update both user and creator notes, keep ids unique, and link official text.
- Dual, custom, and product-specific EULAs usually extend the pattern sections rather than one essay per vendor.
