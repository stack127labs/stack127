# Stack127 Quality Workflow

Every public page change should keep Stack127 fast, consistent, and easy for crawlers to understand. Use this workflow before any production deploy or public-facing repo export.

## Source Of Truth

- `public.stack127_pages` is the source of truth for public SEO publication state.
- Production publication checks must use `.env.database`, not the local database.
- Page routes must not own metadata, canonicals, robots rules, sitemap inclusion, or JSON-LD. Keep that in the shared registry/layout system.
- In-development routes stay unpublished until their exact slug is approved in `stack127_pages`.
- Unknown values should stay empty or `null`; do not add fake precision or broad fallback copy to hide missing data.

## Page Workflow

1. Read `AGENTS.md` and the relevant `content_docs/<page-slug>/` folder.
2. Create or update `tests/pages/<route>/page.json` with the route state and its docs, tests, scripts, and skills before or alongside the page. Keep the required `repositories` array empty for external repositories; track those relationships in `stack127_docs/public-repositories.md`. Use `tests/pages/home/page.json` for `/`.
3. Add or update route tests before considering the page done.
4. Add or update the route under `app/` using the shared shell, typography, spacing, and components.
5. Keep important page content server-rendered.
6. Add any production SEO publication row through a Supabase migration.
7. Run `npm run quality`.
8. Fix failures at the real source instead of weakening the gate.

## Required Gates

Run the full gate:

```bash
npm run quality
```

That command runs:

- `npm run typecheck`
- `npm run test:unit`
- `npm run test:static`
- `npm run test:seo:registry`
- `npm run test:seo`
- `npm run build`

`test:unit` uses the Node test runner for deterministic helper tests under `tests/stack127/*.test.mjs`.

`test:static` fails when a site route has no `content_docs` folder, no route coverage manifest entry, no referenced test file, or an invalid publication state.

`test:seo:registry` reads the production database through `.env.database` and fails if the public slug list does not match the approved set.

`test:seo` starts the site on port `3334` with `.env.database` loaded, then checks indexability, canonicals, JSON-LD presence, query noindex behavior, sitemap output, and unpublished route blocking on desktop and mobile. It does not reuse an existing dev server.

## Agent Rules

- Do not publish a new route just because the file exists.
- Do not add a route without its page-scoped ownership manifest under `tests/pages/`.
- Do not add page-specific SEO logic inside route files.
- Do not add hidden fallbacks that make broken data look valid.
- Do not use local database state to decide public SEO or GitHub dataset output.
- Do not push public GitHub repos or public-facing content without explicit approval.
- Write public-facing copy for readers, not as internal development notes.
- Keep `.agents/skills` and `.claude/skills` as symlinks to the canonical `skills/` folder.
- Use the Stack127 cover image intake skill for generated page images; final JPGs should remove junk metadata and keep clean SEO-friendly metadata where tooling supports it.
