---
name: version127-test-driven-page
description: Use when creating, publishing, or changing a Version127 page, route, directory, tool page, or SEO-visible surface. Enforces test-first page workflow, route coverage manifest updates, production registry discipline, and build/SEO quality gates.
---

# Version127 Test-Driven Page Workflow

Use this skill before changing any route under `app/(site)` or any SEO-visible page behavior.

## Required Order

1. Read `AGENTS.md`.
2. Read the relevant `content_docs/<page-slug>/` folder. If the page carries content, its `brief.md` (who is reading, the job, show vs say) must exist there before implementation. If it does not, write it first: the format is in `version127_docs/visual-first.md`.
3. Propose the format mix before writing copy. Read `version127_docs/visual-first.md` and `version127_docs/writing-style.md`, decide what is a chart, table, marker drawing, or screenshot, and challenge text-heavy requests, including Teja's, with a better visual format.
4. Read `version127_docs/css-architecture.md` before adding or moving page styles.
5. Decide the route state before implementation:
   - `published`: exact slug should be indexable and listed in sitemap.
   - `unpublished`: route exists in code but should return 404 until approved.
   - `noindex`: route can render, but should not be indexed.
6. Create or update the route's `tests/pages/<route>/page.json` ownership manifest before or alongside the page. Use `tests/pages/home/page.json` for `/`.
7. Add or update tests before considering the page done.
8. Implement the smallest route/UI/data change.
9. Run the gates listed below.

## Test Requirements

Every route under `app/(site)` must have a page-scoped ownership manifest under `tests/pages/`. The manifest records the route state, documentation, tests, scripts, skills, and public repositories connected to that page.

For published routes, Playwright must verify:
- HTTP 200.
- Visible main-content `h1`.
- canonical URL.
- JSON-LD presence.
- no `noindex` robots tag.
- sitemap inclusion.

For unpublished routes, Playwright must verify:
- HTTP 404, or an explicit `noindex` state if the route is intentionally visible.
- sitemap exclusion.
- a clear reason in the coverage manifest.

Put page-owned tests beside the page manifest. Keep genuinely sitewide tests in `tests/version127/`, route-family tests in that family's `shared` folder, and public-repository contract tests in `tests/repos/<repo>/`. Prefer pure helpers and deterministic checks over browser tests when rendering is not needed.

## Quality Gates

Run fast local gates while iterating:

```bash
npm run test
```

Run the complete gate before handing off:

```bash
npm run quality
```

`npm run quality` includes typecheck, unit tests, static policy, production registry verification, Playwright SEO checks, and production build.

## Hard Rules

- Do not use local DB state for public SEO publication decisions.
- Do not add route-owned metadata, canonicals, robots rules, sitemap logic, or JSON-LD in page files.
- Do not add a page without its page-scoped ownership manifest.
- Do not weaken tests to match broken behavior.
- Do not hide missing data with broad fallbacks.
- Do not add component or page selectors to `app/globals.css`. Use a colocated CSS Module or route-family stylesheet.
- Do not push public-facing content or public GitHub repos without explicit approval.
