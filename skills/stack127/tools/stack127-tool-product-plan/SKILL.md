---
name: stack127-tool-product-plan
description: Start a stack127 tool-spec.md from research.md and write the reasons people will choose the tool and its concrete product and technical contract, without implementing it.
---

# stack127 tool product plan

In the tool pipeline, Opus runs this skill in the Claude Code planning session, then continues with `$stack127-tool-interface-plan` in the same session.

Read `content_docs/<slug>/research.md` in full. Create `content_docs/<slug>/tool-spec.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`, or continue the existing spec. Write the "Why people will choose this tool" and Product sections.

## Plan the tool people want

Before writing the contract, answer three questions from the research:

1. What is the searcher really trying to decide or produce?
2. Where do the current top results fail them?
3. What will this tool do better?

Plan the tool a person would pick over every current result: more useful, faster to a clear answer, and honest about unknowns. Do not copy a competitor's layout or add features only because others have them. Where research is thin or a key competitor is missing, use a few more competitors and add your findings to `research.md`.

## Write the contract

Define:

- the primary user, job, promise, and reason to use this tool;
- launch scope and clear exclusions;
- inputs, units, bounds, parsing, formulas or source precedence, rounding, and output;
- invalid, unknown, partial, failure, privacy, and security behavior;
- one primary action and the important state changes;
- a backend contract: each exported function or API route with its file path, inputs, output shape, errors, unknown values, and any timeouts, caching, scripts, or datasets. Sol builds to it and the frontend calls only through it;
- a few independently calculated examples that the backend test can use for correctness checks;
- which files Sol builds for the backend and which files Opus builds for the frontend;
- one primary catalog and any secondary catalogs, with a short reason for each; flag a missing catalog for the main agent to create through the catalog page workflow;
- a `toolSpot` brief for the new tool's catalog card: one visual takeaway, recognizable focal subject, at most one supporting object or relationship, semantic tone, and tool-specific art key. Keep it wordless and legible at card size in both themes.

Make the plan concrete enough to build without guessing. Do not create requirement IDs, fingerprints, validators, receipts, code, or tests.
