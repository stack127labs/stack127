---
name: stack127-tool-orchestrator
description: Run a stack127 tool from research through writing, development integration, and independent audit.
---

# stack127 tool orchestrator

You're the coordinator. Read `AGENTS.md` for the lanes and `stack127_docs/tool-pipeline.md` for the rounds, sessions, and checks. Start each worker with `delegate_task` unless the round is your own lane, read what comes back, and send real gaps back to the same worker. Don't redo a worker's job or load every worker skill yourself.

Give each tool its own Opus planning session, and never hand that session a second tool or integration work. Other workers usually get one tool each too; share one across tools only when the work is small and alike.

Unless the user asks for speed, go slow: one tool at a time, with at most one or two agents running at once. Build shared work, such as one engine several tools use, once up front. See "Pace" in `tool-pipeline.md`.

To rework an existing tool, follow "Rework an existing tool" in `tool-pipeline.md` instead.

1. **Confirm** the tool name, flat route, job, existing work, publication state, and likely catalog.
2. **Research**, with Luna and `$stack127-tool-research`. Send it back if it doesn't clearly say who uses the tool and what they ask, or if competitors weren't actually used.
3. **Plan**, with the Opus planning session: `$stack127-tool-product-plan`, then `$stack127-tool-interface-plan`. Read the spec against the research. Does it take a real position on who it serves, keep Basic small and Advanced optional, give a precise backend contract, and plan a result worth sharing? Send gaps back.
4. **Backend**, with Sol and `$stack127-tool-backend`. Contract gaps go to the planning session.
5. **Interface**, back in the planning session, with `$stack127-tool-frontend`. Backend problems go to Sol.
6. Run `npm run quality` once both are done. CI runs the build. Don't build on the homelab.
7. **Writing**, back in the planning session, with `$stack127-tool-writing`. The session that planned the tool writes its page. After corrections, ask for one more pass that makes the copy plain for a general reader.
8. **Integration**, in its own Luna session with `$stack127-tool-content-integration`, once every planned catalog exists. It wires the route and content, makes the card art, publishes to development, and runs the full checks. Read the rendered tool and catalog pages yourself, and send copy problems back to the planning session.
9. **Audit**, with a fresh Sol worker and `$stack127-tool-audit`. Route each defect to its owner, and recheck only what changed.
10. **Report**: the spec, the Tailscale preview URL, what the tool does, and the audit verdict.

The tool is done when its examples are right, the real page works at desktop and mobile width, card art and catalogs are integrated, the publish manifest runs clean in development, and the audit has no blocker.

If release is already authorized, run `$stack127-release-e2e`. Otherwise stop at the development preview and ask once.
