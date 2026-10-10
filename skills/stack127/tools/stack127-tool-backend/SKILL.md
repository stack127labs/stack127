---
name: stack127-tool-backend
description: Build the backend for one stack127 tool from the spec's backend contract, with focused correctness tests. No UI.
---

# stack127 tool backend

Read `AGENTS.md`, the complete tool spec, and `stack127_docs/tool-pages.md`. Build only the backend. Opus builds the frontend in the next round against the same contract.

Build exactly what the spec's Backend contract describes: the same function names, inputs, outputs, data shapes, and errors. Do not redesign the product or change the contract. If the contract is unclear, wrong, or cannot be built as written, stop and report the gap to the main agent so it can go back to the planning session.

1. Build parsing, validation, formulas, lookup logic, and serialization as plain TypeScript outside React.
2. Build any API routes, server data loaders, external lookups, timeouts, and caching the contract lists.
3. Build any data scripts, migrations, or maintained datasets the contract lists. Keep migrations, scripts, and docs aligned.
4. Add one focused unit test file for independently known normal, boundary, and invalid examples from the spec. Add more only for a real high-risk calculation or recovery path. Run it.
5. For a new route that needs a database row to render, use the publisher against development with the reviewed title, search metadata, cards, and catalog memberships. Page words live in MDX beside the route. Do not fill retired Markdown fields or create another temporary content-writing script.
6. Check one correct and one invalid example directly against the backend, such as through the test or a request to the API route.

Do not build the page, client components, styles, or card art. Do not write page content, create manifests or evidence files, or run the whole repository test collection. This backend task does not authorize production data, commits, pushes, or deployment. A separate coordinator-approved production task follows the approval rules in `AGENTS.md` and the release skill.

Return the files you built, the exported functions or endpoints, the test result, and any contract gap.

For an existing tool, a change to inputs, results, calculations, validation, or other user-visible behavior needs a `tool_version` increase. Use a patch for a compatible fix, a minor version for compatible new behavior, and a major version for an incompatible contract change. Confirm the version with the coordinator before integration. The database moves the public date when the version changes. MDX content changes leave the version and the date alone; a date move for content-only tool changes comes later. Card-only edits refresh catalogs and keep the tool date unchanged. See `stack127_docs/tool-pages.md`.
