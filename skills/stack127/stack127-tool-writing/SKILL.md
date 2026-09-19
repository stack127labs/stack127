---
name: stack127-tool-writing
description: "Write complete, concise public content for one finished stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after the technical tool and content plan are stable. Produce reviewed words only: title, introduction, usage guide, supporting content, interface wording, captions, and accessibility text. Do not integrate files, change code, use a browser, run tests, or write to the database."
---

# stack127 tool writing

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator continues the same `gpt-6-astra` content-planning session for public wording after accepting the plan; its `reasoning_effort` remains `low`, shown as Light in Codex. This worker returns reviewed public words only and never starts another pipeline worker. Luna integration belongs to the separate `$stack127-tool-content-integration` skill.

Write the explanation someone needs around a finished tool. Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for all public wording. This skill owns tool-specific coverage and wording, not implementation, integration, or a separate voice.

## Read first

1. Read `AGENTS.md` and the route ownership manifest.
2. Read `skills/stack127/visual-first-content/SKILL.md` completely.
3. Read `stack127_docs/visual-first.md`, `writing-style.md`, `design-system.md`, and `css-architecture.md`.
4. Read `stack127_docs/tool-pages.md` for the content-field and safe-Markdown boundaries.
5. Read the route's `brief.md`, ready research, implementation, interface, and test artifacts. Read `writing-and-seo.md` when it exists.
6. Inspect the finished tool, its tests, and at least two established sibling tool pages as source material. Preserve unrelated changes.

Do not write from the tool name alone. Use only facts already locked by the technical artifacts, engine fixtures, `interface-contract.md`, or authoritative sources they cite. Do not restate the lead answer, supporting values, evidence, or source metadata already assigned to the live interface.

## Hard boundary

Keep the interactive tool as the page's main visual and primary answer. Do not turn the page into an article with a calculator attached.

Do not change formulas, controls, result semantics, route identity, publication state, metadata, canonical behavior, sitemap behavior, JSON-LD, code, tests, database rows, or version fields. Return a technical mismatch to the owning build or planning stage instead of explaining around it.

Do not publish, commit, push, open a pull request, or deploy unless the user separately asks.

Consume the `Usage Markdown handoff` in `writing-and-seo.md` and produce the public `usage_markdown` required by `stack127_docs/tool-pipeline.md`. Keep the planning contract and public guide distinct and traceable. Preserve planned ordered lists, bullet lists, definition lists, tables, and registered figure references in the reviewed output.

## Required output

Return reviewed temporary files for the title, introduction, `usage_markdown`, and `content_markdown`, plus any labels, result messages, captions, alt text, tables, and list wording assigned to Astra. Include a short source map from material claims to the ready artifacts or authoritative sources. Stop when the main agent can inspect the exact public words. Do not integrate them.

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

## Editorial verification

Verify every meaningful claim against the ready artifacts, engine fixtures, or cited authoritative sources. Run the shared writing-voice review on the draft. Use `skills/stack127/writing-guidelines/SKILL.md` as a supplementary edit and unslop for final cleanup. Do not use a browser, run implementation tests, or change files outside the temporary writing output.

Review in both directions: what can be removed without losing meaning, and what useful question is still unanswered? Do not accept a thin page merely because it is concise, or a long page merely because it covers more keywords.

When invoked inside `$stack127-tool-orchestrator`, report the output paths, coverage, source map, unresolved factual conflicts, and exact files inspected, then stop. The integration worker owns rendering and Browser evidence.

## Completion rule

Finish only when the reviewed words let a new visitor understand what the tool is, use it meaningfully, interpret the result, recognize its limits and data handling, and know the next verification step. The draft must be concise, factually bounded, structurally complete, and ready for the separate integration skill. Report the output files, planned formats preserved, sources checked, and any unresolved mismatch. Do not claim that the content is integrated or rendered.
