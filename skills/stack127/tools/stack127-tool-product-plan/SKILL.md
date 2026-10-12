---
name: stack127-tool-product-plan
description: Start a stack127 tool-spec.md from research.md and write who the tool serves, why people will choose it, and its concrete product and technical contract, without implementing it.
---

# stack127 tool product plan

Opus runs this in the planning session, then continues with `$stack127-tool-interface-plan`.

Read `content_docs/<slug>/research.md` and `stack127_docs/tool-interface.md`. Create or continue `content_docs/<slug>/tool-spec.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/tool-spec-template.md`.

## Decide who it's for

Write "People and questions" first. Everything else follows from it. Take a position, the way a good product lead would:

- Who most users are, and the 2 or 3 questions they bring.
- What Basic answers, with the fewest inputs those people know offhand.
- What Advanced holds, for whom, and why. This is where the depth lives: everything a pro would expect from a serious tool in this space, from the research's competitors and forum questions, and everything the old tool did if there was one. Every Advanced input is optional, so say what empty means, such as "no discount entered: use the list price."
- What you're leaving out, with a reason a user would agree with. "Pros can use another tool" isn't one.
- The realistic example values the tool opens with, and whether a published comparison fits.
- The domain's real limits, such as a platform's maximum or minimum, and how the result answers when someone hits one.

Then write "Why people will choose this tool": where the top results fail these people, and what this tool does better. Don't copy a competitor's layout or add features because others have them.

## Write the contract

Make it concrete enough that Sol and the frontend can each build to it without guessing:

- Scope and exclusions.
- Inputs with units, bounds, and parsing. Formulas or source precedence, rounding, and output.
- Invalid, unknown, partial, and failure behavior.
- The backend contract: each exported function or API route, with its path, inputs, output shape, and errors.
- A few independently calculated examples for the backend test.
- Which files Sol builds and which Opus builds.
- Catalog placement, and a `toolSpot` card art brief. See the template.

For a rework, update "People and questions" from the new research and list the engine changes Sol must make. Keep what's still right.

Don't write code, tests, IDs, or validators.
