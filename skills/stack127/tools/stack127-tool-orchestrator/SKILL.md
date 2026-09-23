---
name: stack127-tool-orchestrator
description: Run a stack127 tool from research through writing, development integration, and independent audit.
---

# stack127 tool orchestrator

Read `AGENTS.md` and `stack127_docs/tool-pipeline.md`. The main agent starts each worker, checks its result, returns real gaps to the same worker, and moves on. Do not repeat specialist work or load every worker skill into the main context.

## Run the pipeline

1. Confirm the tool name, flat route, primary job, repository, existing work, and publication state. Create `content_docs/<slug>/tool-spec.md` from the local template when needed.
2. Start research with `$stack127-tool-research`.
3. Start one retained planning worker with `$stack127-tool-product-plan`, then `$stack127-tool-interface-plan`.
4. Start `$stack127-tool-build`. Require the focused correctness test and real desktop and mobile interaction. For a new database-backed route, use a development preview row with clearly marked placeholder copy until writing is integrated.
5. Run `npm run test:core` and `npm run build` once after route and runtime work. The build performs the TypeScript check.
6. Start `$stack127-tool-content-seo` to complete the Content section. Then start `$stack127-tool-writing` with `gpt-6-astra` at `low` reasoning. Pass it the finished spec and tool; collect its title, Markdown files, interface words, SEO text, and source notes. Do not pause for manual writing.
7. Start `$stack127-tool-content-integration` with that draft to update the development content and metadata and verify the rendered page. Return factual or missing-copy gaps to the writing worker, then let integration apply the correction.
8. Start one independent `$stack127-tool-audit` worker after integration. Return confirmed defects to that worker and rerun only affected checks. Run a new build only if integration or audit changed route, runtime, or SEO code.
9. Give the user the complete `content_docs/<slug>/tool-spec.md`, current Tailscale preview URL, what the finished tool does, and the audit verdict.

The local tool is complete when its known examples are correct, the actual page works at desktop and mobile width, content is integrated, the audit has no release blocker, and the minimum gate passes.

Do not create acceptance receipts, evidence folders, file hashes, ownership manifests, stage validators, or a full browser suite.

If production publication, commit, push, and deployment are already authorized after the final audit, update production content through the approved page workflow and invoke `$stack127-release-e2e`. Otherwise stop after the integrated development preview and ask once for release authorization.
