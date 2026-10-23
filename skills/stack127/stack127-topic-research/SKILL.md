---
name: stack127-topic-research
description: Find evidence-backed resource and product ideas for stack127's indie hackers, solo developers, and digital creators. Use for topic ideas, market gaps, underserved user tasks, and resource roadmaps across subjects such as KDP, SaaS, selling online, domains, and developer tools.
---

# stack127 topic research

## Pipeline role and model routing

Topic research proposes ideas. It never turns one into a tool on its own: the owner picks each tool and builds it with `skills/stack127/stack127-tool-page/SKILL.md`. When you propose a tool, say plainly whether it can be built and what it would promise.

Use this skill from the stack127 repository root when researching resources or products. Find concrete tasks where existing resources are fragmented, weak, too vendor-specific, or missing a useful tool.

## First Checks

- Read `AGENTS.md`.
- Inspect existing routes under `app/` and docs under `content_docs/` so ideas do not duplicate current surfaces.
- Check `stack127_docs/writing-style.md` when the result includes public-facing copy or page direction.
- If writing a durable note, place it in `content_ideas/` unless the user asks for another location.
- Treat route inventory, web search results, product docs, Reddit/community threads, and market demand as time-sensitive. Verify live.
- Read `skills/stack127/references/homelab-browser-and-search.md` before live search or competitor inspection. Prefer the configured SearXNG endpoint with `bing,duckduckgo` for search discovery and use its headless browser fallback when the in-app browser is unavailable.

## Research Workflow

Read `stack127_docs/product-direction.md` before choosing subjects or scoring audience fit. stack127 serves indie hackers: solo developers and digital creators who build and run projects online. Don't propose smart home, home automation, or homelab hardware resources. Use the user's current interests and experience to frame the research. Ads, analytics, and paid offerings are allowed; when to add them is a separate decision.

1. Define the subjects and user tasks for the request. The user may choose a new subject beyond existing coverage. Current areas to consider when relevant include:
   - Amazon KDP and self-publishing
   - SaaS metrics, pricing, and subscriptions
   - selling online: platform fees, payouts, and launch channels
   - domains and DNS
   - developer tools: CLI apps, self-hosted apps, config checkers, and deploys
   - AI tools and agents for solo builders
   - calculators, checkers, and reference pages for any of the above

   Treat this list as existing coverage, not an exhaustive scope. Propose tools, directories, references, courses, or software and digital products according to the job. Do not force every format into every subject or recommend unrelated articles just to expand a keyword list.

2. Build a demand signal for each candidate:
   - Search web results for the exact problem phrasing.
   - When available, run `node scripts/stack127/search-services/searxng-search.mjs --engines bing,duckduckgo "<query>"` and preserve the query, engines, date, and result URLs in the research notes.
   - Check Reddit, forums, GitHub issues/discussions, vendor docs, and community docs when accessible.
   - Prefer repeated pain patterns over one-off curiosity.
   - If Reddit is blocked, say so and use public search snippets, forum pages, official docs, and issue trackers instead.

3. Test the gap:
   - Search for direct competitors using phrases like `matrix`, `calculator`, `checker`, `compatibility`, `backup`, `reverse proxy`, `requirements`, `comparison`, and `generator`.
   - Operate candidate competitor pages with the selected Browser backend. Search snippets are discovery evidence only, not direct competitor review.
   - Do not claim "no page exists" unless proven very narrowly. Use "gap appears strong", "fragmented", or "covered but weak" when appropriate.
   - Prefer ideas where official answers exist per product but no cross-product reference exists.

4. Test feasibility:
   - Identify the data model needed.
   - Identify official or primary sources for the first batch.
   - Decide whether the page can be static, repo-owned, database-backed, or client-side only.
   - Reject ideas that require private data, unsafe scanning, fragile scraping, or fake precision.

5. Score and rank:
   - Demand: are people visibly asking or searching?
   - Gap: are current answers absent, scattered, outdated, or not tool-shaped?
   - stack127 fit: does it help indie hackers, solo developers, or digital creators with a concrete task, and can the team build and maintain it credibly?
   - Feasibility: can we build a credible MVP with official sources?
   - Moat: can structured data, calculators, or repeated updates make it hard to copy?

Read `references/research-rubric.md` when you need the scoring table or a reusable output structure.

## Surface Decision Rule

Every validated gap must be assigned a surface shape before it is recommended. Run these tests in order:

1. Search shape test. Write the exact query a real user types. If the query names a specific app, device, or integration, for example `immich v3 breaking changes` or `jellyfin arm64`, the demand is entity-specific. Entity-specific demand is captured by indexable pages and directory facts, never by a standalone tool with a picker.
2. Coverage test. Ask whether the idea is still useful at partial coverage. A reference page for one app is useful on its own. A curated tool covering 40 of 1,800 apps fails every user whose app is missing and reads as broken. If usefulness requires near-total coverage of a curated dataset, do not propose it as a tool.
3. Task test. A standalone tool should help the user complete a task through a calculation, lookup, check, conversion, generation, or other useful operation. Define the supported inputs, result quality, and limits. For an AI capability, identify how results will be evaluated and what each use costs. A tool does not need a live external data source.
4. Trust test. Never propose automating labels that promise safety or correctness, such as "safe to update". Wrong reassurance costs more trust than the feature earns. Judgment-heavy classifications are editorial content with human review, not tool output.

Default shapes that follow from the tests:

- Entity-specific facts: a structured field in the owning directory, shown in existing UI, becoming a section of per-entity pages when those ship.
- Big recurring events, such as a major breaking release: a hand-written reference page targeting the exact query.
- Calculators, lookups, checkers, converters, and generators: standalone tools with one canonical URL each.
- A learning task that needs a sequence: a course with connected lessons.
- A larger workflow with persistent work or several connected tasks: consider a software or digital product with its own experience.

## Content Strategy Boundaries

- Do not propose news, commentary, or coverage of weekly releases. News decays quickly and would shift the site's focus away from maintained tools, directories, references, and courses.
- Reference articles are allowed only when the page contains something not already answered identically elsewhere, visible on the page itself: assembled structured facts, original measurements, or version-anchored migration detail.
- Favor maintained tools, directories, references, and courses over a publishing quota. A data report or trend page is useful only when its evidence and reader task justify it.

## Output Shape

Lead with the best 3-6 ideas, not a long weak list. For each idea include:

- The page/tool name.
- The user problem and likely search phrases.
- The resource format, such as a directory improvement, reference, tool, course, or product, and why it fits the task.
- Why the market gap appears real.
- What evidence was checked.
- Whether Stack127 can build it.
- MVP scope and data fields.
- Risks or reasons to avoid it.
- A recommended URL slug, or the owning directory when the idea is a facet.

When the user asks to save ideas, create a dated markdown file in `content_ideas/` with unchecked checkboxes beside each idea.

## Quality Bar

- Quality beats quantity.
- Prefer a tool, calculator, matrix, checklist, or reference that solves a concrete problem.
- Keep unknowns explicit.
- Use official docs as the source of truth for product facts.
- Use community sources to prove demand, not to invent technical facts.
- Keep ideas actionable enough that the next agent can start implementation without redoing all discovery.
