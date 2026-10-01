---
name: stack127-tool-research
description: Research one stack127 tool in depth, use competitors for real, check search intent and user problems, verify facts with primary sources, and write content_docs/<slug>/research.md.
---

# stack127 tool research

Write only `content_docs/<slug>/research.md`. Use `skills/stack127/tools/stack127-tool-orchestrator/references/research-template.md`. Do not create or edit `tool-spec.md`; Opus starts it from this research.

The goal is to know the topic, the searcher, and the competition well enough that the planner can build the tool people would pick over every current result.

1. Confirm the user job, flat route, and whether a stack127 tool already covers it.
2. Search the exact tool name, the user's job in plain words, specialist terms, and common problems. Record what the searcher wants for each query, the "People also ask" questions, and what the top results miss.
3. Find real user problems in forums, Reddit, communities, support threads, and reviews. Link each one.
4. Use 5 to 8 competitors for real: the official tool if one exists, the top search results, and tools people recommend. Try one correct example, one edge case, and one wrong input on each. Use `skills/stack127/references/homelab-browser-and-search.md` for the local headless browser when the in-app browser is unavailable. Stop early only when new competitors repeat known patterns.
5. Verify formulas, standards, limits, units, data dates, and security facts with official documentation or source code. Mark unsupported facts as unknown.
6. Fill the comparison table, note where competitors disagree and which answer is right, and write a concrete list of how stack127 can win.
7. Flag paid APIs, maintained datasets, background jobs, accounts, or other work that needs approval.

Do not plan the interface, write public copy, implement code, create evidence files, or add hashes. Return the research file path and any blocker.
