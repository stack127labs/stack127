---
name: version127-test-driven-page
description: Use when creating, publishing, or changing a Version127 page, route, directory, tool page, or SEO-visible surface. Enforces test-first page workflow, route coverage manifest updates, production registry discipline, and build/SEO quality gates.
---

# Version127 Test-Driven Page Workflow

Use this skill before changing any route under `app/(site)` or any SEO-visible page behavior.

## Required Order

1. Read `AGENTS.md`.
2. Read the relevant `content_docs/<page-slug>/` folder.
3. Decide the route state before implementation:
   - `published`: exact slug should be indexable and listed in sitemap.
   - `unpublished`: route exists in code but should return 404 until approved.
   - `noindex`: route can render, but should not be indexed.
4. Update `tests/version127/page-coverage.json` before or alongside the page.
5. Add or update tests before considering the page done.
6. Implement the smallest route/UI/data change.
7. Run the gates listed below.

## Test Requirements

Every route under `app/(site)` must have an entry in `tests/version127/page-coverage.json`.

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

For shared logic, add Node unit tests in `tests/version127/*.test.mjs`. Prefer pure helpers and deterministic checks over browser tests when rendering is not needed.

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
- Do not add a page without a route coverage manifest entry.
- Do not weaken tests to match broken behavior.
- Do not hide missing data with broad fallbacks.
- Do not push public-facing content or public GitHub repos without explicit approval.
