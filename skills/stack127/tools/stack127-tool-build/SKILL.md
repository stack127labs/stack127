---
name: stack127-tool-build
description: Build one stack127 tool from a ready tool-spec.md, add focused correctness tests, and verify the real interaction locally.
---

# stack127 tool build

Read `AGENTS.md`, the complete tool spec, `stack127_docs/tool-pages.md`, `stack127_docs/shared-ui.md`, and the relevant design and interface docs.

1. Build parsing, validation, formulas, lookup logic, and serialization outside React.
2. Implement the contracted interface with shared components from `app/ui/`, one primary action, and one lead answer. Check `/components-ui` in development before adding a local control or result pattern.
3. Keep the client island small, use `ToolPageShell` from `app/ui/catalogs/tool-page-shell.tsx` with the fetched `toolPage`, and colocate styles. It resolves the primary catalog and sidebar from database memberships. Do not add a route-owned tool sidebar.
4. Add one focused unit test file for independently known normal, boundary, and invalid examples. Add more only for a real high-risk calculation or recovery path.
5. Run that focused test.
6. For a new route that needs a database row to render, create a development-only preview row with the required title and plainly marked placeholder intro and content. Guard the development database and preserve any existing row. The placeholder is preview scaffolding, not the page copy.
7. Start or reuse the homelab server. Use `skills/stack127/references/homelab-browser-and-search.md` when the in-app browser is unavailable. Check the real tool at desktop and mobile width with one correct example and one invalid-input example.
8. Leave the core test run and production build to the orchestrator after route and runtime work.

Do not write supporting article content, create manifests or evidence files, run the whole repository test collection, publish production data, commit, push, or deploy.
