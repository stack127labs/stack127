---
name: stack127-page-build
description: Create or change a stack127 content, directory, reference, course, legal, catalog, or tool route and verify the real page with minimum useful checks.
---

# stack127 page build

Read `AGENTS.md`, the page's brief or tool spec, and the relevant design, writing, routing, and data docs.

## Work

1. Confirm the route family, flat public URL, publication state, and data source.
2. Implement the page with the shared shell, `PageCanvas`, tokens, components, metadata system, and server-rendered content.
3. Keep page styles beside the page or component. Do not add page selectors to `app/globals.css`.
4. Add a focused test only for calculations, parsers, data transforms, or a failure that could return a wrong answer. Do not test prose, documentation, skill wording, hashes, file inventories, or incidental markup.
5. Open the real page at desktop and mobile width. Confirm it loads, the main task works, links work, and there is no obvious overflow or browser error.
6. When code, routes, SEO, or production configuration changed, run `npm run test:core` and `npm run build` once. The build already checks TypeScript. For a change that needs no build, run `npm run quality` only when TypeScript changed.

Use the production registry for publication decisions. Do not write production data, publish, commit, push, or deploy without authorization.
