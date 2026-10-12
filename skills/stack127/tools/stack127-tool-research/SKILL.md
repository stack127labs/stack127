---
name: stack127-tool-research
description: Research one stack127 tool in depth, find who uses it and what they ask, use competitors for real, check search intent and user problems, verify facts with primary sources, and write content_docs/<slug>/research.md.
---

# stack127 tool research

Write `content_docs/<slug>/research.md` from `skills/stack127/tools/stack127-tool-orchestrator/references/research-template.md`. The planner builds the tool from it, so give them what they need to decide well.

1. **Start with the people.** Who searches for this, what do they already know, and what do they want answered in the first few seconds? Find out from search results, "People also ask", competitor pages, and forum threads, not guesses. Say which inputs most people can give offhand and which need digging.
2. **Find published comparison data**, if any: figures people use to judge their own number, with source, date, who was measured, and whether it measures the same thing. Say whether the sources agree well enough to show one range.
3. **Use 5 to 8 competitors for real**: the official tool, the top results, and tools people recommend. Try a correct example, an edge case, and a wrong input on each. Note what they get right, where people get stuck, and the options the serious ones offer that pros rely on. Those become Advanced.
4. **Verify the facts** that drive answers (formulas, limits, units, data dates) with official docs or source code, including the domain's hard limits, such as a platform's maximum. Mark anything unverified as unknown.
5. **Say how stack127 can win**, concretely, and flag anything that needs approval, such as paid APIs or maintained datasets.

For a headless browser, see `skills/stack127/references/homelab-browser-and-search.md`.

For a rework of an existing tool, add only "Who uses it" and "Published comparison data" to the existing file. If an older tool has no `research.md`, create one with those two sections and link the older docs in its folder.

Don't plan the interface, write page copy, or write code. Return the file path and any blocker.
