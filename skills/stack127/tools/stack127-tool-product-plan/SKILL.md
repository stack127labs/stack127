---
name: stack127-tool-product-plan
description: Turn ready tool research into a concise product and technical contract in tool-spec.md without implementing it.
---

# stack127 tool product plan

Edit only the Product section of `content_docs/<slug>/tool-spec.md`.

Define:

- the primary user, job, promise, and reason to use this tool;
- launch scope and clear exclusions;
- inputs, units, bounds, parsing, formulas or source precedence, rounding, and output;
- invalid, unknown, partial, failure, privacy, and security behavior;
- one primary action and the important state changes;
- a few independently calculated examples that the builder can use for correctness checks;
- route, engine, component, style, script, and content ownership.

Keep the contract specific enough to build without reopening research. Do not create requirement IDs, fingerprints, validators, receipts, code, or tests.
