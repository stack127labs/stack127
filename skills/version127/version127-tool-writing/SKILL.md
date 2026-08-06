---
name: version127-tool-writing
description: Write and integrate the small amount of simple, server-rendered explanatory content needed around one finished version127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after the technical tool and its tests are stable when the user asks to write, add, finish, simplify, or improve the content part of a tool page. Keep the tool primary, explain controls and confusing concepts plainly, add at most one useful worked example, state honest limits, and verify the complete page without publishing it.
---

# version127 tool writing

Add a calm content layer around a finished tool. Write in a simple style, make it easy for anyone to understand, and keep things simple. Add detail only when it resolves a real user question.

## Read first

1. Read `AGENTS.md` and the route ownership manifest.
2. Read `skills/version127/test-driven-page/SKILL.md` and `skills/version127/visual-first-content/SKILL.md` completely.
3. Read `version127_docs/visual-first.md`, `writing-style.md`, `design-system.md`, and `css-architecture.md`.
4. Read the route's `brief.md`, ready research, implementation, and test reports. Read `writing-and-seo.md` when it exists.
5. Inspect the finished tool, its tests, and at least two established sibling tool pages. Preserve unrelated changes.

Do not write from the tool name alone. Use only facts already locked by the technical artifacts, engine fixtures, interface, or authoritative sources they cite.

## Hard boundary

Keep the interactive tool as the page's main visual and primary answer. Do not turn the page into an article with a calculator attached.

Do not change formulas, controls, result semantics, route identity, publication state, metadata, registry records, canonical behavior, sitemap behavior, or JSON-LD. Return a technical mismatch to the owning build or planning stage instead of explaining around it.

Do not publish, commit, push, open a pull request, or deploy unless the user separately asks.

## Content shape

Use this order unless the page gives a strong reason to omit an item:

1. Put one short paragraph below the h1 and before the tool. In two or three sentences, say what the tool shows, name the most important inputs or result, and state its main boundary.
2. Keep the complete interactive tool next.
3. Put supporting content after the tool in a server component.
4. Explain controls in one compact table only when their names are not self-explanatory.
5. Clarify one or two terms that users commonly confuse.
6. Add one exact worked example only when it makes the result easier to understand.
7. State when a result is descriptive rather than a universal recommendation.
8. List the important exclusions plainly.
9. State local-browser privacy when it is true.
10. End with one useful internal link to the adjacent tool or next task.

Skip any item that does not help this tool. Use three to seven h2 sections, no more than two compact tables, and normally no more than 700 static words. Do not add an FAQ, generic methodology, repetitive instructions, keyword filler, or a long formula essay unless the user explicitly needs it.

## Writing rules

- Use direct headings that carry the point, such as `Why an 8 KiB block can occupy 24 KiB`.
- Explain the plain-language idea before or beside identifiers such as `recordsize`, `ashift`, or an API field.
- Keep paragraphs short and complete. Prefer two to four sentences.
- Use a table for repeated option meanings or exact worked-example parts. Do not compare repeated facts in prose.
- Do not restate values already obvious in the live result.
- Separate overhead, padding, loss, uncertainty, and recommendation boundaries accurately. Do not collapse distinct technical ideas into “waste.”
- Do not claim best, optimal, recommended, exact real-world capacity, predicted performance, or predicted compression unless the verified product contract supports that claim.
- Do not use em dashes or en dashes. Follow the repository writing style for punctuation and the lowercase `version127` brand.
- Keep caveats near the claim they limit. Avoid a large warning panel.

## Test-first integration

Before adding prose, update the route-owned static test to require the intended introduction, guide component, essential headings, worked example or table when used, limitations, privacy statement when applicable, and internal link. Keep tests for the clean route, server identity, absence of route metadata, and banned claims.

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

Use the guarded local preview and the in-app Browser to inspect the complete page at a normal desktop width and at 390px or narrower, in both themes. Check the introduction, transition into the tool, transition into the guide, paragraph rhythm, table behavior, internal link, page-level overflow, and the calculated result. Do not judge the content layout with an empty or invalid tool state only.

When invoked inside `$version127-tool-orchestrator`, report the clean local URL and Browser evidence to the orchestrator, then stop. The main orchestrator agent owns the final visible Browser handoff. When invoked directly, leave the verified clean page open in the in-app Browser as the deliverable.

## Completion rule

Finish only when the content is simple, factually bounded, server-rendered, visually consistent, covered by route tests, responsive around a real result, and the route remains unpublished. Report files changed, commands and results, Browser states checked, remaining P2 items, and the clean local URL.
