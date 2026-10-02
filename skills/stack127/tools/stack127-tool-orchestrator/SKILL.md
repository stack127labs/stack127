---
name: stack127-tool-orchestrator
description: Run a stack127 tool from research through writing, development integration, and independent audit.
---

# stack127 tool orchestrator

Read `AGENTS.md` and `stack127_docs/tool-pipeline.md`. The main agent starts each worker, checks its result, returns real gaps to the same worker, and moves on. Follow "Agent roles" in `AGENTS.md`. Luna researches and integrates data. Sol builds the backend and audits. Opus plans, builds the frontend, and writes. Start each round with `node scripts/stack127/agents/delegate.mjs` unless it is in your own lane, as described in the pipeline's Sessions section. Do not repeat specialist work or load every worker skill into the main context.

## Run the pipeline

1. Confirm the tool name, flat route, primary job, repository, existing work, publication state, and likely catalog placement.
2. Start research with `$stack127-tool-research`. Check that `content_docs/<slug>/research.md` is deep: real competitor use on 5 to 8 tools, search intent, user problems with links, verified facts, a comparison table, and a concrete list of how stack127 can win. Send thin research back to the same worker.
3. Start one Claude Code planning session with Opus. It reads `research.md` and starts `tool-spec.md` from the template. Have it follow `skills/stack127/tools/stack127-tool-product-plan/SKILL.md`, then `skills/stack127/tools/stack127-tool-interface-plan/SKILL.md`. Read the spec against the research. Confirm it says why people will choose this tool, the plan is concrete enough to build without guessing, Product includes a specific tool card art brief, Product has a precise backend contract, and Interface names the existing components to use and any new or improved shared components Opus built and checked. Send suggestions and gaps back to the same session.
4. Start `$stack127-tool-backend` with Sol. It builds the backend contract with a focused correctness test and, for a new database-backed route, a development preview row with clearly marked placeholder copy. It builds no UI. Send backend gaps back to Sol and contract gaps to the planning session.
5. Resume the planning session at high effort with `skills/stack127/tools/stack127-tool-frontend/SKILL.md`. Opus builds the page, interface, tool components, styles, and registered card art on top of the backend, then checks the real page at desktop and mobile width. Send backend problems it reports to Sol, then back to Opus once fixed.
6. Run `npm run test:core` and `npm run build` once after the backend and frontend are done. The build performs the TypeScript check.
7. Start one Claude Code writing session with Opus. Have it follow `skills/stack127/tools/stack127-tool-writing/SKILL.md`: plan the Content section of the spec first, then write the copy in the same session. Return factual or missing-copy corrections to that session. Once corrected, ask the same session for a final pass that makes all page copy simple and easy for a general reader to follow while keeping its details. Collect the final title, Markdown files, interface words, SEO text, card copy, and source notes. Do not pause for manual writing.
8. Confirm the planned primary and secondary catalogs exist. If the spec calls for a new catalog, coordinate its registry row, content, art, and page review through the catalog page workflow before tool integration. Start `$stack127-tool-content-integration` with the final draft and registered art key to update development content, metadata, card fields, and memberships. Read the rendered tool and catalog pages. Check card art at its real size in both themes and desktop and mobile layouts. Check that copy makes sense as public-facing text, with no stray research notes, citation markers, or insider wording. Keep useful source links. Send copy problems to the writing session, have integration apply its corrections, and check the affected pages again.
9. Start one independent `$stack127-tool-audit` worker after integration. Send backend defects to Sol, data defects to Luna, frontend and component problems to the planning session at high effort, and copy problems to the writing session. Rerun only affected checks. Run a new build only if integration or fixes changed route, runtime, or SEO code.
10. Give the user the complete `content_docs/<slug>/tool-spec.md`, current Tailscale preview URL, what the finished tool does, and the audit verdict.

The local tool is complete when its known examples are correct, the actual page works at desktop and mobile width, its generated card art and catalog memberships are integrated, the audit has no release blocker, and the minimum gate passes.

Do not create acceptance receipts, evidence folders, file hashes, ownership manifests, stage validators, or a full browser suite.

If production publication, commit, push, and deployment are already authorized after the final audit, update production content through the approved page workflow and invoke `$stack127-release-e2e`. Otherwise stop after the integrated development preview and ask once for release authorization.
