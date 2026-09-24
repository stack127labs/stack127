---
name: stack127-tool-orchestrator
description: Run a stack127 tool from research through writing, development integration, and independent audit.
---

# stack127 tool orchestrator

Read `AGENTS.md` and `stack127_docs/tool-pipeline.md`. The main agent starts each worker, checks its result, returns real gaps to the same worker, and moves on. Do not repeat specialist work or load every worker skill into the main context.

## Run the pipeline

1. Confirm the tool name, flat route, primary job, repository, existing work, publication state, and likely catalog placement. Create `content_docs/<slug>/tool-spec.md` from the local template when needed.
2. Start research with `$stack127-tool-research`.
3. Start one retained planning worker with `$stack127-tool-product-plan`, then `$stack127-tool-interface-plan`.
4. Start `$stack127-tool-build`. Require the focused correctness test and real desktop and mobile interaction. For a new database-backed route, use a development preview row with clearly marked placeholder copy until writing is integrated.
5. Run `npm run test:core` and `npm run build` once after route and runtime work. The build performs the TypeScript check.
6. Start `$stack127-tool-content-seo` to complete the Content section. Then start `$stack127-tool-writing` with `gpt-6-astra` at `low` reasoning. Pass it the finished spec and tool. Return factual or missing-copy corrections to that worker. Once corrected, ask the same worker in the same session for a final pass that makes all page copy simple and easy for a general reader to follow while keeping its details. Collect the final title, Markdown files, interface words, SEO text, card copy, and source notes. Do not pause for manual writing.
7. Confirm the planned primary and secondary catalogs exist. If the spec calls for a new catalog, coordinate its registry row, content, art, and page review through the catalog page workflow before tool integration. Start `$stack127-tool-content-integration` with the final draft to update development content, metadata, card fields, and memberships. Read the rendered tool and catalog pages. Check that their copy makes sense as public-facing text, with no stray research notes, citation markers, or insider wording. Keep useful source links. Send copy problems to the same writing worker, have integration apply its corrections, and check the affected pages again.
8. Start one independent `$stack127-tool-audit` worker after integration. Return confirmed defects to that worker and rerun only affected checks. Run a new build only if integration or audit changed route, runtime, or SEO code.
9. Give the user the complete `content_docs/<slug>/tool-spec.md`, current Tailscale preview URL, what the finished tool does, and the audit verdict.

The local tool is complete when its known examples are correct, the actual page works at desktop and mobile width, content and catalog memberships are integrated, the audit has no release blocker, and the minimum gate passes.

Do not create acceptance receipts, evidence folders, file hashes, ownership manifests, stage validators, or a full browser suite.

If production publication, commit, push, and deployment are already authorized after the final audit, update production content through the approved page workflow and invoke `$stack127-release-e2e`. Otherwise stop after the integrated development preview and ask once for release authorization.
