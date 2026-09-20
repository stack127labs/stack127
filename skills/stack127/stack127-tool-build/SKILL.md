---
name: stack127-tool-build
description: Implement one stack127 calculator, checker, converter, lookup, generator, explorer, or utility from a ready concise specification. Use only when the user asks to build or change the tool. Write focused tests first, implement the engine and interface, integrate concise content, and verify the affected page.
---

# stack127 tool build

Build one working tool from `content_docs/<slug>/tool-spec.md` or the accepted historical contracts for an existing route. Read `AGENTS.md`, `stack127_docs/tool-pipeline.md`, `stack127_docs/tool-interface.md`, `stack127_docs/tool-pages.md`, the ownership manifest, and the shared writing voice before public wording.

## Boundaries

- Keep the route unpublished unless publication is explicitly authorized.
- Keep formula, parsing, validation, normalization, serialization, and source interpretation outside React.
- Keep important content server-rendered and live tool prose in `stack127_tool_pages`.
- Use shared controls and page structure. Do not ship a generic native-looking fallback because a component is missing.
- Preserve unknown, partial, invalid, and failed states. Never leave a stale plausible result visible after current input becomes invalid.
- Do not add route-owned SEO metadata, canonical, robots, sitemap, or JSON-LD logic.

## Build order

1. Confirm risk, route, publication state, technical truth, interface, and focused checks in the specification.
2. Create or update `tests/pages/<slug>/page.json`.
3. Write failing P0 and P1 tests before production code.
4. Implement the pure engine and trust boundaries.
5. Implement the contracted controls, one primary action, one lead answer, recovery, state behavior, and responsive order.
6. Integrate concise title, introduction, usage guidance, result interpretation, limitations, and next verification step. Use the reviewed content command and version rules.
7. Run focused tests while iterating.
8. Exercise a real result, invalid recovery, and the main boundary or failure state at one desktop and one narrow mobile viewport.
9. Run the change-aware quality gate.

Use exact fixtures independent of the implementation where correctness matters. Sanitize untrusted output and bound payloads, retries, concurrency, and upstream requests according to risk.

## Visual check

Inspect the actual result, not only the empty form. Check answer hierarchy, focus, labels, announcements, long values, overflow, touch targets, table reflow, copy or export output, and URL behavior. Shared tests own the full theme and width matrix. Add route-specific theme or width cases only when the tool has its own visual behavior there.

## Verification

Run route-owned tests and then:

```bash
npm run quality
```

Use `npm run quality:full` when shared routing, SEO, shell, registry, tool UI, or test infrastructure changed. After one independent review passes, generate the compact receipt with `npm run stack127:tool:verify`.

Report the behavior built, versions changed, focused tests, browser states, review status, receipt, publication state, and remaining P2 follow-up. Do not commit, push, publish, or deploy without authority.
