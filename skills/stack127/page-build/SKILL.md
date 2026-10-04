---
name: stack127-page-build
description: Create or change a stack127 tool, directory, course, catalog, or site page route and verify the real page with minimum useful checks.
---

# stack127 page build

Read `AGENTS.md`, `stack127_docs/writing-style.md`, `stack127_docs/shared-ui.md`, the page's brief or tool spec, and the relevant design, routing, and data docs. For new pages or substantial content changes, record the reader, task, and planned explanations and visuals in the brief or tool spec before implementation.

## Work

1. Confirm the route family, flat public URL, publication state, and data source.
2. Check the shared components and `/components-ui` gallery in development before creating local UI. Implement the page with the shared shell, `PageCanvas`, tokens, components, metadata system, and server-rendered content. Use `ContentMarkdown` for pages that render Markdown.
3. Keep the page static and on-demand revalidated, as `stack127_docs/caching.md` describes. No `force-dynamic`, no timed `revalidate`, and no server `searchParams`, `headers()`, or `cookies()`. URL-dependent parts are client components. A new data source gets a cache tag and pipeline coverage.
4. Keep page styles beside the page or component. Do not add page selectors to `app/globals.css`.
5. Add a focused test only for calculations, parsers, data transforms, or a failure that could return a wrong answer. Do not test prose, documentation, skill wording, hashes, file inventories, or incidental markup.
6. Open the real page at desktop and mobile width. Use the headless fallback in `skills/stack127/references/homelab-browser-and-search.md` if the in-app browser is unavailable. Confirm it loads, the main task works, links work, and there is no obvious overflow or browser error.
7. When code changed, run `npm run quality`. Don't build on the homelab. At release, pull request CI on GitHub runs the full build. Confirm there that the route list shows the page as static (`○` or `●`).
8. For a tool, catalog, or directory, write its publish manifest as `stack127_docs/page-publishing.md` describes. List the route, assets, readiness checks, and smoke text. A directory also says where its records come from. With the dev server and local cache watcher running, run the publisher's `prepare`, `preview`, and `apply` against development. `apply` also checks the public page.

This skill builds the page. The publisher checks readiness and turns publication on. Production publication runs through the release skill after the code is live. Do not write production data, publish, commit, push, or deploy without authorization.
