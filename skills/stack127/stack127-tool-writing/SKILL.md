---
name: stack127-tool-writing
description: Write and integrate complete, concise, server-rendered supporting content around one finished stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after the technical tool and its tests are stable when the user asks to write, add, finish, simplify, expand, or improve a tool page. Keep the tool primary while covering what it does, meaningful use, result interpretation, confusing concepts, limitations, privacy, and the next verification step without publishing it.
---

# stack127 tool writing

Add the minimum complete content layer around a finished tool. Write in a simple style and make the page useful to someone who arrived without the implementation report. Complete does not mean long: cover every necessary user question once, then stop.

## Read first

1. Read `AGENTS.md` and the route ownership manifest.
2. Read `skills/stack127/test-driven-page/SKILL.md` and `skills/stack127/visual-first-content/SKILL.md` completely.
3. Read `stack127_docs/visual-first.md`, `writing-style.md`, `design-system.md`, and `css-architecture.md`.
4. Read the route's `brief.md`, ready research, implementation, and test reports. Read `writing-and-seo.md` when it exists.
5. Inspect the finished tool, its tests, and at least two established sibling tool pages. Preserve unrelated changes.

Do not write from the tool name alone. Use only facts already locked by the technical artifacts, engine fixtures, interface, or authoritative sources they cite.

## Hard boundary

Keep the interactive tool as the page's main visual and primary answer. Do not turn the page into an article with a calculator attached.

Do not change formulas, controls, result semantics, route identity, publication state, metadata, registry records, canonical behavior, sitemap behavior, or JSON-LD. Return a technical mismatch to the owning build or planning stage instead of explaining around it.

Do not publish, commit, push, open a pull request, or deploy unless the user separately asks.

## Content completeness contract

Make the complete page answer all of these questions somewhere across the introduction, live tool, result UI, and supporting guide:

1. What is this tool, who is it for, and what problem does it solve?
2. What inputs or choices matter, including an effective source, unit, mode, or scope when relevant?
3. How should someone use it meaningfully? Explain how to choose representative inputs and complete the real task, not ordinary button-clicking mechanics.
4. What does the result mean, and how should the reader interpret its important terms, statuses, traces, ranges, or uncertainty?
5. Which syntax, concepts, or edge cases commonly cause a surprising result?
6. What does the tool not inspect, calculate, prove, recommend, or guarantee?
7. What happens to user inputs, including local-browser privacy when it is technically true?
8. What should the reader verify next in the real system, or which adjacent stack127 page continues the task?

Do not force these into fixed headings or one template. Group them in the order that fits the tool and let headings carry the actual point. If the interface already answers a question clearly, do not repeat it in prose. If a question is irrelevant, record why in `writing-and-seo.md` rather than silently omitting it.

Before writing, add a compact coverage map to `writing-and-seo.md` or the page brief with `user question`, `where it is answered`, `medium`, and `evidence`. Use the map to prevent both omissions and repetition.

## Content shape

Use this order as a starting point, not a heading template:

1. Put one short paragraph below the h1 and before the tool. In two or three sentences, say what the tool is, name the most important inputs and result, and state its main boundary.
2. Keep the complete interactive tool next.
3. Put supporting content after the tool in a server component.
4. Explain how to choose useful inputs and understand the effective scope. Avoid generic instructions such as “click Test.”
5. Clarify the terms, syntax, ordering, or conventions that commonly change the answer.
6. Add at most one exact worked example when it makes the result easier to understand.
7. Explain how to read the result, including recommendation or uncertainty boundaries.
8. List the important exclusions plainly and keep each caveat next to the claim it limits.
9. State local-browser privacy when it is true and keep the claim scoped to the tool action.
10. End with a useful real-world verification step, official source, or adjacent stack127 page.

Use three to seven h2 sections, normally no more than two compact tables, and normally no more than 800 static words. Completeness beats an arbitrary word target, but every extra paragraph must resolve a documented user question. Do not add an FAQ, generic methodology, repetitive instructions, keyword filler, or a long formula essay unless the user explicitly needs it.

## Writing rules

- Use direct headings that carry the point, such as `Why an 8 KiB block can occupy 24 KiB`.
- Explain the plain-language idea before or beside identifiers such as `recordsize`, `ashift`, or an API field.
- Keep paragraphs short and complete. Prefer two to four sentences.
- Use a table for repeated option meanings or exact worked-example parts. Do not compare repeated facts in prose.
- Do not restate values already obvious in the live result.
- Separate overhead, padding, loss, uncertainty, and recommendation boundaries accurately. Do not collapse distinct technical ideas into “waste.”
- Do not claim best, optimal, recommended, exact real-world capacity, predicted performance, or predicted compression unless the verified product contract supports that claim.
- Do not use em dashes or en dashes. Follow the repository writing style for punctuation and the lowercase `stack127` brand.
- Keep caveats near the claim they limit. Avoid a large warning panel.
- Prefer practical guidance such as which inputs to probe, which source is effective, or how to verify a real result. Do not waste prose narrating ordinary controls.
- Let different tools use different headings. Test for required information and supported claims, not a universal heading formula.

## Test-first integration

Before adding prose, update the route-owned static test to require the purpose, meaningful-use guidance, result interpretation, relevant concepts, limitations, privacy statement when applicable, real verification or adjacent link, and any worked example or table used. Assert essential information without forcing every tool to use identical headings. Keep tests for the clean route, server identity, absence of route metadata, and banned claims.

Then:

- keep the introduction and guide server-rendered;
- keep explanatory prose out of the client calculator component;
- reuse `proseClassName` and `proseFlowClassName` instead of creating a new typography system;
- colocate only layout and table styles in the route CSS module;
- keep the guide at the shared prose measure;
- make tables keyboard-focusable and horizontally scrollable or reflow them cleanly at narrow widths;
- preserve comfortable paragraph spacing without large empty gaps;
- keep all existing tool behavior and formula fixtures unchanged.

## Verification

Run the route content test red before implementation, then run:

- the route content and tool tests;
- related engine or regression fixtures;
- `npm run typecheck`;
- `npm run test:static`;
- the repository quality gate required by the active pipeline.

Read `skills/stack127/references/homelab-browser-and-search.md`, then use the guarded local preview and the in-app Browser when available or standalone Playwright in homelab CLI mode. Inspect the complete page at a normal desktop width and at 390px or narrower, in both themes. Check the introduction, transition into the tool, transition into the guide, paragraph rhythm, table behavior, internal link, page-level overflow, and the calculated result. Do not judge the content layout with an empty or invalid tool state only.

During the final reading pass, answer the completeness-contract questions from the rendered page without consulting internal reports. Treat a missing answer as a content defect. Treat duplicated answers, mechanical click instructions, or unsupported detail as content defects too.

When invoked inside `$stack127-tool-orchestrator`, report the clean local URL, selected visual backend, and Browser or Playwright evidence to the orchestrator, then stop. The main orchestrator agent owns the final visual handoff. When invoked directly, leave the verified clean page open in the in-app Browser when available; otherwise provide the reproducible Playwright evidence and state that no visible in-app tab was available.

## Completion rule

Finish only when a new visitor can understand what the tool is, use it meaningfully, interpret the result, recognize its limits and data handling, and know the next verification step. The content must also be simple, factually bounded, server-rendered, visually consistent, covered by route tests, responsive around a real result, and unpublished. Report files changed, commands and results, visual states and backend checked, remaining P2 items, and the clean local URL.
