---
name: stack127-tool-frontend
description: Build the page, interface, tool components, styles, and card art for one stack127 tool on top of its finished backend, then check it at desktop and mobile width.
---

# stack127 tool frontend

In the tool pipeline, Opus runs this skill in the same planning session that wrote the spec, after Sol finishes the backend.

Read the spec, the backend files Sol built, `stack127_docs/tool-pages.md`, `stack127_docs/tool-interface.md`, `stack127_docs/shared-ui.md`, `stack127_docs/design-system.md`, and `stack127_docs/css-architecture.md`.

Build the interface you planned. Call the backend only through its contract. If the backend does not match the contract or has a bug, do not patch it. Report it to the main agent so it goes back to Sol.

1. Build the route page. Use `ToolPageShell` from `app/ui/catalogs/tool-page-shell.tsx` with the fetched `toolPage`. It resolves the primary catalog and sidebar from database memberships. Do not add a route-owned tool sidebar.
2. Build the interface with the components named in the spec, one primary action, and one lead answer. Add only the tool-specific components the spec lists. Keep the client island small and colocate styles. The route page stays static: read shared-link values in a client wrapper with `useInitialQuery()` from `app/ui/tools/use-initial-query.ts`, never `searchParams` on the server page. See `stack127_docs/caching.md`.
3. Handle every state in the spec: initial, valid, invalid, loading, empty, partial, failure, retry, reset, restored, and long values, as they apply.
4. Use `$marker-art-draw` and the card art brief to create the tool's `toolSpot` in `app/(site)/(catalogs)/_components/art/`. Generate its `.svg` and `.ts`, register a tool-specific key in `lib/tool-catalog-art.ts`, and check it at card size. Do not use the `icon` fallback for a new tool.
5. Start or reuse the homelab server. Use `skills/stack127/references/homelab-browser-and-search.md` for the local headless browser. Check the real page at desktop and mobile width in both themes with one correct example and one invalid example. Check keyboard use, focus, and overflow.
6. Run `npm run quality`.

Leave the production build to the main agent. Do not write page content, publish production data, commit, push, or deploy.

Return the files you built, what you checked, and any backend problem you found.
