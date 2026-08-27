---
name: stack127-topic-research
description: Find evidence-backed new Stack127 page, directory, calculator, reference, or tool ideas across self-hosting, homelab, home automation, local AI, developer tooling, and adjacent technical niches. Use when the user asks for new topic ideas, market gaps, SEO opportunities, underserved search problems, content/tool roadmaps, or "what should Stack127 build next" research.
---

# Stack127 Topic Research

Use this skill in `/Users/ravitejaknts/projects/Stack127` when researching new Stack127 content or tool surfaces. The goal is not generic brainstorming. The goal is to find problems people already search for where the current web answer is fragmented, weak, too vendor-specific, or missing a practical tool.

## First Checks

- Read `AGENTS.md`.
- Inspect existing routes under `app/` and docs under `content_docs/` so ideas do not duplicate current surfaces.
- Check `stack127_docs/writing-style.md` when the result includes public-facing copy or page direction.
- If writing a durable note, place it in `content_ideas/` unless the user asks for another location.
- Treat route inventory, web search results, product docs, Reddit/community threads, and market demand as time-sensitive. Verify live.
- Read `skills/stack127/references/homelab-browser-and-search.md` before live search or competitor inspection. Prefer the configured SearXNG endpoint with `bing,duckduckgo` for search discovery; record the actual search backend and engines used. Use standalone Playwright when the Codex in-app Browser is unavailable in homelab CLI mode, and record that backend in the research note.

## Research Workflow

1. Define the covered niches for the request. Default niches:
   - self-host apps and operations
   - self-hosting learning paths
   - homelab networking, storage, backup, monitoring, and deploys
   - home automation and local-first smart home
   - local AI, agents, and self-hosted model tooling
   - open-source developer/admin utilities
   - calculators, compatibility checkers, and reference pages

2. Build a demand signal for each candidate:
   - Search web results for the exact problem phrasing.
   - When available, run `node skills/stack127/stack127-tool-research/scripts/searxng-search.mjs --engines bing,duckduckgo "<query>"` and preserve the query, engines, date, and result URLs in the evidence notes.
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
   - Stack127 fit: does it match the site promise and current audience?
   - Feasibility: can we build a credible MVP with official sources?
   - Moat: can structured data, calculators, or repeated updates make it hard to copy?

Read `references/research-rubric.md` when you need the scoring table or a reusable output structure.

## Surface Decision Rule

Every validated gap must be assigned a surface shape before it is recommended. Run these tests in order:

1. Search shape test. Write the exact query a real user types. If the query names a specific app, device, or integration, for example `immich v3 breaking changes` or `jellyfin arm64`, the demand is entity-specific. Entity-specific demand is captured by indexable pages and directory facts, never by a standalone tool with a picker.
2. Coverage test. Ask whether the idea is still useful at partial coverage. A reference page for one app is useful on its own. A curated tool covering 40 of 1,800 apps fails every user whose app is missing and reads as broken. If usefulness requires near-total coverage of a curated dataset, do not propose it as a tool.
3. Automation test. A standalone tool is only justified when at least one of these holds:
   - The answer is computed live from universal machine-readable sources, so it works for any input without a curated dataset, for example querying a public registry manifest.
   - The answer is a genuine calculation over inputs only the user knows, for example summing requirements against the user's own hardware.
4. Trust test. Never propose automating labels that promise safety or correctness, such as "safe to update". Wrong reassurance costs more trust than the feature earns. Judgment-heavy classifications are editorial content with human review, not tool output.

Default shapes that follow from the tests:

- Entity-specific facts: a structured field in the owning directory, shown in existing UI, becoming a section of per-entity pages when those ship.
- Big recurring events, such as a major breaking release: a hand-written reference page targeting the exact query.
- Live universal lookups and calculators: standalone tool drops with one clean URL each.

## Content Strategy Boundaries

- Do not propose news, commentary, or coverage of weekly releases. News decays in days, earns few links from this audience, and shifts the domain's dominant content class toward commodity output while domain trust is still being earned. See `stack127_records/2026-07-site-review.md` sections 8 and 9.
- Reference articles are allowed only when the page contains something not already answered identically elsewhere, visible on the page itself: assembled structured facts, original measurements, or version-anchored migration detail.
- The fast-cadence channel is data reports and automated trend pages generated from Stack127's own databases, not articles.

## Output Shape

Lead with the best 3-6 ideas, not a long weak list. For each idea include:

- The page/tool name.
- The user problem and likely search phrases.
- The surface shape (directory facet, reference page, per-entity page section, or standalone tool) and why it passes the surface decision rule.
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
