---
name: stack127-tool-product-plan
description: Define the user job, technical contract, scope, states, and acceptance outcomes for one stack127 tool without implementing it. Use when product decisions are unresolved or the user asks for a plan.
---

# stack127 tool product plan

Turn known evidence into one buildable product decision. Read `AGENTS.md`, `stack127_docs/tool-pipeline.md`, the current tool specification or historical reports, related routes, and shared tool patterns.

## Output

In the current tool workflow, update `content_docs/<slug>/tool-spec.md`. Do not create `implementation-report.md` or a separate brief for new tool work. For a standalone planning request on a historical tool, preserve its existing artifact layout unless the user asks to migrate it.

## Decide

- One primary user question and one lead answer.
- Risk level and publication state.
- Formula, parser, lookup, or data contract, including units, rounding, freshness, unknowns, and invalid states.
- Required and optional inputs, one primary action, result hierarchy, recovery, state restoration, and meaningful limits.
- Explicit non-goals and deferred ideas.
- File ownership, focused checks, and observable completion criteria.

Prefer a small complete job over a feature inventory. Do not expose an option merely because the engine could support it. Unknown is better than fake precision. Never show a plausible result beside an error that invalidates it.

For external services, record timeouts, caching, rate limits, provenance, partial data, privacy, abuse controls, and maintenance. Block work that needs an unapproved paid service, account, crawler, queue, scheduled job, storage system, or recurring editorial operation.

Use a table, exact chart, diagram, screenshot, marker concept, or prose only when that medium clarifies a real relationship. Keep the tool and answer first.

Mark the specification ready only when the builder can implement without making a new product or technical decision.
