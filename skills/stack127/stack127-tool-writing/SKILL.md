---
name: stack127-tool-writing
description: Write and integrate complete, concise, server-rendered supporting content around one finished stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after the technical tool and its tests are stable when the user asks to write, add, finish, simplify, expand, or improve a tool page. Keep the tool primary while covering what it does, meaningful use, result interpretation, confusing concepts, limitations, privacy, and the next verification step without publishing it.
---

# stack127 tool writing

Write the explanation someone needs around a finished tool. Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for all public wording. This skill owns tool-specific coverage, integration, and verification, not a separate voice.

## Read first

1. Read `AGENTS.md` and the route ownership manifest.
2. Read `skills/stack127/test-driven-page/SKILL.md` and `skills/stack127/visual-first-content/SKILL.md` completely.
3. Read `stack127_docs/visual-first.md`, `writing-style.md`, `design-system.md`, and `css-architecture.md`.
4. Read `stack127_docs/tool-pages.md` for the database Markdown boundary and content-only update command.
5. Read the route's `brief.md`, ready research, implementation, interface, and test artifacts. Read `writing-and-seo.md` when it exists.
6. Inspect the finished tool, its tests, and at least two established sibling tool pages. Preserve unrelated changes.

Do not write from the tool name alone. Use only facts already locked by the technical artifacts, engine fixtures, `interface-contract.md`, or authoritative sources they cite. Do not restate the lead answer, supporting values, evidence, or source metadata already assigned to the live interface.

## Hard boundary

Keep the interactive tool as the page's main visual and primary answer. Do not turn the page into an article with a calculator attached.

Do not change formulas, controls, result semantics, route identity, publication state, metadata, canonical behavior, sitemap behavior, or JSON-LD. The reviewed content command may update `content_revision` and the public `updated_at` as documented. Do not edit other registry fields or change `tool_version`. Return a technical mismatch to the owning build or planning stage instead of explaining around it.

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

Use these questions to review what the reader needs, not to generate eight paragraphs or sections. If the interface answers a question clearly, do not repeat it. Omit irrelevant topics without inventing a section to explain their absence.

Before writing, note the reader's main question and the line of reasoning in the page brief. A coverage map can help with a complex tool, but it is not the writing outline. Connect each technical claim to the implementation or its verified sources.

## Content shape

Start with a short intro that connects the reader's problem to the answer and cues the input. Keep the tool next. Below it, develop the explanation in reading order, with limits beside the claims they qualify. Add a glossary when unfamiliar result terms need definitions. Keep the controls and result concise without imposing that same brevity on the supporting guide.

Fluff-free means no wasted explanation, not the shortest possible page. Restore useful detail when a reader would otherwise need to search elsewhere to understand the answer. Practical scenarios, confusing distinctions, consequential edge cases, and next verification steps earn space when they change what someone understands or does. During a rewrite, inventory useful existing coverage before cutting it. Remove repetition, not the reasoning that joins the facts.

There are no section, paragraph, sentence-length, word-count, or prose-to-visual quotas unless the user supplies a constraint. A tool can need one supporting section or several. Do not add FAQs, benefits, sample outputs, or implementation explanations just to make the page seem complete. Do not remove a useful section solely to meet a preferred short shape.

Plan the result interpretation and limits in reading order, using the shared voice skill to connect the explanation. The completeness map is not a mandatory heading outline.

## Search intent and useful depth

Use the primary task and genuine follow-up questions to choose natural, descriptive headings. Name the tool, operation, or concept where that helps a search visitor identify the answer. Avoid vague headings, keyword variants repeated as separate sections, and promises of rankings. Keep supporting copy server-rendered and link primary technical sources near the claims they support. Add internal links when they continue the reader's task, not to satisfy a link count.

Give newcomers enough context to interpret the answer and experienced readers the boundaries they need to verify it. Keep a glossary for unfamiliar result terms that still need explanation.

Choose a table for repeated facts, an exact chart for measured relationships, and marker art for a useful conceptual relationship. Use connected prose for causes, implications, and decisions. A visual must make that specific point easier to understand; do not add components to reduce a prose ratio or illustrate what the live result already shows.

The approved Domain Age revision 5 is a quality reference, not a template. See `content_docs/domain-age/writing-and-seo.md` for the decisions behind it. Transfer the balance of useful depth, flow, headings, evidence, and restraint, not its topics, section count, table, or examples.

## Writing rules

- Use direct headings that carry the point, such as `Why an 8 KiB block can occupy 24 KiB`.
- Explain the plain-language idea before or beside identifiers such as `recordsize`, `ashift`, or an API field.
- Use a table for repeated option meanings or exact worked-example parts. Do not compare repeated facts in prose.
- Do not restate values already obvious in the live result.
- Separate overhead, padding, loss, uncertainty, and recommendation boundaries accurately. Do not collapse distinct technical ideas into “waste.”
- Do not claim best, optimal, recommended, exact real-world capacity, predicted performance, or predicted compression unless the verified product contract supports that claim.
- Do not use em dashes or en dashes. Follow the repository writing style for punctuation and the lowercase `stack127` brand.
- Keep caveats near the claim they limit. Avoid a large warning panel.
- Prefer practical guidance such as which inputs to probe, which source is effective, or how to verify a real result. Do not waste prose narrating ordinary controls.
- Let different tools use different headings. Test for required information and supported claims, not a universal heading formula.

## Test-first integration

Verify the draft's meaningful claims against the tool and existing fixtures. Update tests only when a changed claim or behavior needs protection. Do not add tests that enforce wording, paragraph counts, or a heading template. Current prose is verified against the prepared Markdown or rendered database page, not a historical migration seed. Keep the existing route and calculation checks.

Then use the dry-run-first content command in `stack127_docs/tool-pages.md`. It must increment `content_revision`, preserve `tool_version`, and keep the database as the only live copy. Also:

- keep the introduction and guide server-rendered through the shared Markdown layer;
- keep explanatory prose out of the client calculator component;
- do not create a route-owned guide component or duplicate Markdown file;
- reuse the shared tool-page Markdown typography instead of creating a new typography system;
- make tables keyboard-focusable and horizontally scrollable or reflow them cleanly at narrow widths;
- preserve comfortable paragraph spacing without large empty gaps;
- keep all existing tool behavior and formula fixtures unchanged.

## Verification

Run checks appropriate to the change:

- the route content and tool tests;
- related engine or regression fixtures;
- `npm run typecheck`;
- `npm run test:static`;
- broader repository gates when code, rendering, or route behavior changed.

Read `skills/stack127/references/homelab-browser-and-search.md`, then use the guarded local preview and the in-app Browser when available or standalone Playwright in homelab CLI mode. Inspect the complete page at a normal desktop width and at 390px or narrower, in both themes. Check the introduction, transition into the tool, transition into the guide, paragraph rhythm, table behavior, internal link, page-level overflow, and the calculated result. Do not judge the content layout with an empty or invalid tool state only.

Run the shared writing-voice skill's review pass against the rendered content, then review coverage and facts. Use `skills/stack127/writing-guidelines/SKILL.md` as a supplementary edit and unslop for final cleanup. Passing layout tests does not establish editorial quality.

Review in both directions: what can be removed without losing meaning, and what useful question is still unanswered? Do not accept a thin page merely because it is concise, or a long page merely because it covers more keywords. Verify the actual development content revision, not an older production or migration copy.

When invoked inside `$stack127-tool-orchestrator`, report the clean local URL, selected visual backend, and Browser or Playwright evidence to the orchestrator, then stop. The main orchestrator agent owns the final visual handoff. When invoked directly, leave the verified clean page open in the in-app Browser when available; otherwise provide the reproducible Playwright evidence and state that no visible in-app tab was available.

## Completion rule

Finish only when a new visitor can understand what the tool is, use it meaningfully, interpret the result, recognize its limits and data handling, and know the next verification step. The content must also be simple, factually bounded, server-rendered, visually consistent, covered by route tests, responsive around a real result, and unpublished. Report the content revision before and after, confirm the tool version did not change, list commands and results, visual states and backend checked, remaining P2 items, and the clean local URL.
