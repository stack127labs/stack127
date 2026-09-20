---
name: stack127-test-driven-page
description: Use when creating, publishing, or changing a Stack127 page, route, directory, tool page, or SEO-visible surface. Enforces test-first page workflow, route coverage manifest updates, production registry discipline, and build/SEO quality gates.
---

# Stack127 Test-Driven Page Workflow

Use this skill before changing any route under `app/(site)` or any SEO-visible page behavior.

## Required Order

1. Read `AGENTS.md`.
2. Read the relevant `content_docs/<page-slug>/` folder. Current tool work uses `tool-spec.md`. Other content pages use `brief.md` with the reader, job, and show-versus-say decision. If the required planning file does not exist, write it before implementation.
3. Before writing copy, read `stack127_docs/visual-first.md` and read and apply `skills/stack127/stack127-writing-voice/SKILL.md`. Propose the clearest mix of explanation and visuals, or apply an already approved direction. Challenge a format when it obscures the subject, not simply because it contains substantial prose.
4. Read `stack127_docs/css-architecture.md` before adding or moving page styles.
5. For an interactive tool, read `stack127_docs/tool-pages.md`. Keep its route and behavior in code, its readable copy in `stack127_tool_pages`, and its content and functional revisions separate.
6. Decide the route state before implementation:
   - `published`: exact slug should be indexable and listed in sitemap.
   - `unpublished`: route exists in code but should return 404 until approved.
   - `noindex`: route can render, but should not be indexed.
7. Create or update the route's `tests/pages/<route>/page.json` ownership manifest before or alongside the page. Use `tests/pages/home/page.json` for `/`.
8. Add or update tests before considering the page done.
9. Implement the smallest route/UI/data change.
10. Run the gates listed below.

## Test Requirements

Every route under `app/(site)` must have a page-scoped ownership manifest under `tests/pages/`. The manifest records the route state, documentation, tests, scripts, and skills connected to that page. stack127 repos are tracked in `stack127_docs/stack127-repos.md`, not copied into this repository; keep the manifest's required `repositories` array empty for them.

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

Put page-owned tests beside the page manifest. Keep genuinely sitewide tests in `tests/stack127/` and route-family tests in that family's `shared` folder. Prefer pure helpers and deterministic checks over browser tests when rendering is not needed.

## Quality Gates

Run fast local gates while iterating:

```bash
npm run test:fast
```

Run the change-aware gate before handing off:

```bash
npm run quality
```

`npm run quality` includes type checking, unit tests, static policy, production registry verification, browser tests selected from changed route ownership, and a production build. It fails safe to the complete release browser gate when shared or unmapped runtime code changed. Use `npm run quality:full` for shared routing, SEO, shell, registry, layout, or test-infrastructure changes. The nightly workflow also runs the full desktop and mobile matrix.

## Hard Rules

- Do not use local DB state for public SEO publication decisions.
- Do not add route-owned metadata, canonicals, robots rules, sitemap logic, or JSON-LD in page files.
- Do not add a page without its page-scoped ownership manifest.
- Do not weaken tests to match broken behavior.
- Do not hide missing data with broad fallbacks.
- Do not add component or page selectors to `app/globals.css`. Use a colocated CSS Module or route-family stylesheet.
- Do not store tool introductions or supporting prose in route code. Content-only changes increment `content_revision`; user-observable tool changes increment `tool_version`. Use the reviewed commands in `stack127_docs/tool-pages.md`.
- Keep catalogs, directories, and references in their matching route groups. Directories and references do not receive `stack127_tool_pages` rows.
- Do not push public-facing content or public stack127 repos without explicit approval.
