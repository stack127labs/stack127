---
name: stack127-tool-research
description: Research one proposed or existing stack127 tool page in depth before product planning. Use when the user names a single calculator, checker, converter, lookup, generator, explorer, or technical utility and asks for competitive research, competitor comparison, current market behavior, formulas, options, interaction patterns, or a competitive report. Inspect real competing tools with the Codex Browser when available or standalone Playwright in homelab CLI mode, and write only the research artifact, not the implementation plan or page.
---

# stack127 tool research

Research one tool deeply enough that the next agent can make product decisions without repeating discovery.

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator starts this worker as `gpt-5.6-luna` with `reasoning_effort: "max"`. This worker never starts another pipeline worker or begins a downstream stage. Read `stack127_docs/tool-pipeline.md` for the artifact and acceptance contract.

## Required output

Write `content_docs/<route-without-leading-slash>/competitive-report.md` using `references/competitive-report-template.md`.

Stop after this report. Do not create an implementation report, tests, public copy, route, or component.

## Start

1. Read `AGENTS.md`.
2. Resolve the intended tool name and stable route. Inspect existing routes and `content_docs/` to avoid duplicate or conflicting work. If the route is materially ambiguous, ask the user before writing files.
3. Read any existing docs, route files, tests, scripts, engine code, and ownership manifest for this tool or its route family. Summarize the current state as evidence, not assumptions.
4. Read `stack127_records/2026-07-site-review.md` sections 8 and 9 and the surface decision rule in `skills/stack127/stack127-topic-research/SKILL.md`. Flag a blocker if the idea is a thin wrapper, depends on incomplete curated coverage, promises judgment it cannot safely automate, or does not serve stack127's technical audience.
5. Read the complete installed Browser skill and `skills/stack127/references/homelab-browser-and-search.md`. Use the Codex in-app Browser when a runtime instance is available. In homelab or Codex CLI mode, use the documented standalone Playwright fallback when the in-app Browser is unavailable; do not silently downgrade to search snippets or static HTML.

## Research depth

Start with competitor discovery and operation. Establish the real market shape, common inputs, action models, result formats, failure states, missing guidance, and repeated user friction before drawing product conclusions. Then continue in the same report with primary-source technical research that resolves formulas, standards, data contracts, assumptions, maintenance requirements, and feasibility. Competitor behavior suggests questions; it does not establish technical truth.

Search at least four distinct query shapes:

- the exact tool phrase;
- the user's underlying job or question;
- a technical or specialist variation;
- a pain, comparison, or edge-case variation.

Check community discussions, issue trackers, forums, and question pages for repeated confusion or failure patterns. Use these sources to establish what people struggle with, never as the authority for formulas or technical facts.

Prefer SearXNG search with the `bing` and `duckduckgo` engines when `STACK127_SEARXNG_URL` or `SEARXNG_URL` is configured. Run `node skills/stack127/stack127-tool-research/scripts/searxng-search.mjs --engines bing,duckduckgo "<query>"` for each query shape. If SearXNG is unavailable, use the available web-search connector or another named backend and record that limitation instead of implying Bing/DuckDuckGo coverage.

Inspect at least eight direct competitors for an established tool category. For a genuinely narrow category, inspect at least five and document search saturation: queries tried, search backend and engines, repeated domains, and why more results were not direct competitors. Official specifications and source documentation do not count toward the competitor minimum.

Record `Direct competitors reviewed` and `Saturation exception` in the report header. Set the exception to `yes` only when the report contains the documented saturation evidence required above.

Open and operate each competitor with the selected Browser backend. Search snippets and screenshots alone are insufficient. Use representative valid, invalid, boundary, and mixed inputs when safe. Do not submit sensitive data, create accounts, pay, or trigger external side effects. Record `Browser backend`, viewport, access date, and any Playwright or authentication limitation in the report.

## Capture each competitor

Record:

- exact URL, access date, viewport, and whether the tool was fully accessible;
- audience promise and apparent search intent;
- first-screen hierarchy and an ASCII wireframe of the visible layout;
- every input, option, default, unit, limit, example, and advanced control;
- action model: live update, explicit submit, reset, repeat, copy, share, export, or persistence;
- result hierarchy, precise visual forms, explanations, sources, and caveats;
- empty, invalid, loading, success, partial, no-data, and failure behavior that can be observed;
- formula, algorithm, data source, rounding, assumptions, and freshness;
- mobile behavior, keyboard semantics, accessibility signals, privacy disclosures, and performance observations;
- visible title, h1, section headings, FAQ shape, and useful search-intent coverage;
- what helps users, what creates friction, and what must not be copied.

Label each material observation, not an entire competitor, as one of:

- `Observed`: visible in the live tool.
- `Documented`: stated by the competitor or an official source.
- `Inferred`: deduced from controlled probes and not disclosed.
- `Unknown`: not verifiable.

Never present an inferred formula as documented. Verify technical truth with primary specifications, official documentation, or standards. Use community sources only to establish user pain or demand.

## Synthesize

Build a comparison matrix across repeated fields. Separate table stakes from differentiators. Rank opportunities by user value, trust, clarity, and feasibility, not by feature count.

Identify:

- the fastest path to the user's answer;
- options competitors expose because users need them versus options that create clutter;
- formula or data disagreements and the evidence needed to resolve them;
- recurring failure states and misleading claims;
- visual patterns that communicate exact results well;
- underserved intent stack127 can answer honestly;
- ideas to reject because they are decorative, unsafe, unmaintainable, or copied.

Do not claim stack127 can be the best, first, or only result. State the evidence-backed opening precisely.

## Readiness gate

Include a feasibility verdict in the report: `feasibility: feasible` or `feasibility: blocked`. State the evidence, supported promise boundary, and any promise that cannot be supported. A known limitation can remain within a feasible contract only when the promised task still works. Do not silently shrink the requested promise. A tool whose core value requires a new paid API, account, live-data crawler, scheduled refresh, background worker, queue, storage service, review operation, maintained dataset, or other unapproved ongoing system is blocked. Do not propose a static snapshot as completion of a live promise.

For a blocked verdict, include two to four decision options. State what each option would deliver, the cost or maintenance it introduces, and what approval is needed. Include approval of the dependency, a complete manual, static, or offline direction, a coherent scope reduction, or remaining blocked when applicable. Record the required visual medium and how a later implementation will trace it to the rendered page, including ordered lists, bullet lists, definition lists, and any registered `MarkerArt` figure.

Set `Status: ready` only when:

- the competitor minimum or documented saturation rule is satisfied;
- all major claims have URLs and evidence labels;
- formula or data-source disagreements are explicit;
- wireframes show the interaction hierarchy of every inspected direct competitor;
- the report distinguishes observed fact from inference;
- search and Browser backends, engines, viewport, and access limitations are recorded;
- the next agent can decide scope without reopening the same pages.

Otherwise set `Status: blocked`, list exactly what is missing, provide the decision options, and stop.

Before reporting completion, run:

```bash
node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/<route-without-leading-slash> --stage=research
```

If it fails, keep the report in draft or blocked state and fix the actual research gap. Do not weaken the validator.

When used in a pipeline, record the actual Luna model, `max` reasoning, and session through the orchestrator. The research report does not substitute for the final acceptance artifact.
