---
name: stack127-tool-orchestrator
description: Run the complete stack127 tool workflow from research through a working development preview, then release it when the user authorizes production.
---

# stack127 tool orchestrator

Read `AGENTS.md` and `stack127_docs/tool-pipeline.md`. The main agent starts each worker, checks its result, returns real gaps to the same worker, and moves on. Do not repeat specialist work or load every worker skill into the main context.

## Run

1. Confirm the tool name, flat route, primary job, repository, existing work, and publication state. Create `content_docs/<slug>/tool-spec.md` from the local template when needed.
2. Start research with `$stack127-tool-research`.
3. Start one retained planning worker with `$stack127-tool-product-plan`, then `$stack127-tool-interface-plan`.
4. Start `$stack127-tool-build`. Require the focused correctness test and real desktop and mobile interaction.
5. Start one retained content worker with `$stack127-tool-content-seo`, then `$stack127-tool-writing`.
6. Start `$stack127-tool-content-integration` for the development row and integrated page.
7. Start one independent `$stack127-tool-audit` worker. Return confirmed defects to that worker and rerun only affected checks.
8. Run `npm run test:core` and `npm run build` once after all code and content integration. The build performs the TypeScript check. Leave a working development preview and give the user its current Tailscale URL.

The local tool is complete when its known examples are correct, the actual page works at desktop and mobile width, content is integrated, the audit has no release blocker, and the minimum gate passes.

Do not create acceptance receipts, evidence folders, file hashes, ownership manifests, stage validators, or a full browser suite.

If production publication, commit, push, and deployment are already authorized, update production content through the approved page workflow and invoke `$stack127-release-e2e`. Otherwise stop after the development preview and ask once for release authorization.
