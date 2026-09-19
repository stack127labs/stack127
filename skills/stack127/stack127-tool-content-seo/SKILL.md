---
name: stack127-tool-content-seo
description: Plan complete, concise tool-page content, search intent, headings, metadata direction, internal links, result interpretation, limitations, and the visual-versus-prose outline for one stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after ready research, implementation, interface, and test-design artifacts when the user asks for the writing and SEO document. Produce a manual-content-ready outline only; do not draft final public page prose or implement the page.
---

# stack127 tool content and SEO

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator starts this worker as `gpt-6-astra` with `reasoning_effort: "low"`, shown as Light in Codex, and retains the session for public wording after the main agent accepts this plan. This worker never starts another pipeline worker or drafts final prose during this planning stage. Read `stack127_docs/tool-pipeline.md` for the artifact, usage-guide handoff, and acceptance contract.

Plan useful, search-friendly supporting content around a working tool. Keep the tool first and primary while giving readers enough explanation to understand and use its answer. Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` when proposing public headings and metadata or setting the writer's direction. This skill owns search intent and coverage, not a separate voice.

## Required output

Write `content_docs/<route-without-leading-slash>/writing-and-seo.md` using `references/writing-and-seo-template.md`.

Stop after this document. Do not draft final paragraphs, call a writer, create metadata migrations, change the route, or pass prose into `$stack127-tool-build`. Produce a `Usage Markdown handoff` section that closes the facts, input choices, output interpretation, limits, and required formats for the later public `usage_markdown` field. The retained Astra session uses `$stack127-tool-writing` to turn that contract into the actual guide; a separate Luna worker uses `$stack127-tool-content-integration` to apply and verify the approved words.

## Prerequisites

1. Read `AGENTS.md`.
2. Read `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, and `brief.md` completely. Require all four reports or contracts to say `Status: ready` and require route/tool identity to match.
3. Run the pipeline validator with `--stage=test`. Stop if it fails.
4. Record SHA-256 fingerprints for all five inputs in the writing and SEO plan. Treat later changes to any input as invalidating this plan.
5. Read `stack127_docs/visual-first.md`, `writing-style.md`, and `seo.md`, plus `skills/stack127/visual-first-content/SKILL.md`.
6. Read `skills/stack127/references/homelab-browser-and-search.md`. Verify the current result page for the exact primary query and two or three close intent variations using the Codex in-app Browser when available or standalone Playwright in homelab CLI mode. Use SearXNG with `bing,duckduckgo` for search discovery when configured, otherwise record the actual search backend. Record the date, backend, engines, viewport, and visible result shapes. Reuse recent competitive research, but verify that intent has not shifted.

## Define the page promise

State:

- the one query family this page should satisfy;
- the immediate answer the user expects from the interface;
- the explanation needed to interpret, use, and verify that answer;
- adjacent intent that deserves an internal link instead of another section;
- intent the page will deliberately not target.

Do not chase unrelated keywords. Do not add a section merely because competitors have one. Do not claim rankings, traffic, best, first, or only.

## Map content completeness

Create a coverage map before the heading outline. For each question, record where the finished page will answer it, the medium, and the evidence:

- what the tool is, who it serves, and the problem it solves;
- which inputs, modes, units, sources, or scope choices matter;
- how to choose meaningful inputs and use the tool for the real task;
- how to interpret the result and its important terms or uncertainty;
- which syntax, concepts, ordering, or edge cases commonly surprise users;
- what the tool does not inspect, calculate, prove, recommend, or guarantee;
- how user inputs are handled, including local-browser privacy when true;
- what to verify next in the real system or which adjacent page continues the task.

Do not require one heading per question. Treat `interface-contract.md` as the closed inventory of what the live tool already answers. Use supporting content only for unresolved interpretation or context. Mark an irrelevant question with a reason instead of silently omitting it.

## Plan headings and media

Create an outline in reading order. For each section include:

- proposed h1, h2, or h3;
- the exact user question or uncertainty it resolves;
- the takeaway, not finished prose;
- its medium: tool UI, exact result visualization, table, marker concept, screenshot, or sentences;
- source/evidence;
- maximum useful depth and what must not be repeated.

Keep `Primary medium: Tool UI`, but do not set default word, section, or prose-to-visual quotas. Record the useful depth and stopping point for each topic. Preserve explicit user length constraints when supplied. A clear tool can need a substantial supporting guide; do not invent diagrams or discard necessary explanations to make prose a minority.

For rewrites, identify useful existing coverage before proposing cuts. Distinguish repeated facts from explanations of why those facts matter. Plan the thread connecting the sections, not only a checklist of topics. Use the approved Domain Age content decisions as a quality reference, not as a required outline for other tools.

The tool and answer come before explanatory content. Headings must carry the point or ask a real search question in natural language. Include the relevant tool, operation, or concept where it clarifies the section; do not repeat keyword variants mechanically. Someone skimming headings alone should understand the page.

Use the template's controlled medium names exactly: `Tool UI`, `Exact result visualization`, `Exact chart`, `Clean chart`, `Table`, `Topology/diagram`, `Diagram`, `Screenshot`, `Marker concept`, or `Sentences`. Do not relabel prose as copy, FAQ, explanation, paragraph, or text; every `Sentences` row must map one-to-one to a reserved `COPY-` assignment for the later manual content pass.

Use prose for judgment, caveats, formula interpretation, and confusing boundaries. Use tables for repeated facts, clean charts for exact comparisons, marker art for vague concepts only, and screenshots only to prove a real interface. Never restate a visual in a paragraph.

## Plan technical explanation

Map the formula or resolution contract into a short human explanation:

- name the inputs and what changes the answer;
- explain how to choose representative inputs without narrating ordinary buttons;
- explain the result vocabulary, evidence, and decision boundary;
- show the equation or source path exactly where it helps;
- include one worked example only when it resolves a common misunderstanding;
- place each caveat beside the claim it limits;
- state assumptions, exclusions, units, rounding, freshness, privacy, and provenance only where relevant;
- link primary sources for standards and technical facts.

Do not simplify away necessary technical terms.

## Plan search presentation

Propose:

- a natural page title that contains the tool name and result promise;
- a truthful meta description that states what the tool returns and one meaningful boundary;
- a lowercase compact registry label;
- the existing Schema.org page type supported by the central registry;
- internal links in and out, with reader reason and anchor intent;
- FAQ questions only when the answer helps a real user and is not already answered by the tool or a prior section.

These are registry proposals, not route metadata. Do not add metadata, canonicals, robots, sitemap logic, or JSON-LD to page files.

## Prepare the manual prose handoff

Define exactly which static public sections the user may provide after the tool is built. Give every section a stable ID such as `COPY-01`. Include facts, sources, useful depth, a stopping point, banned claims, required caveats, and section IDs. Numeric word limits belong here only when requested by the user. Keep this handoff out of `$stack127-tool-build`; that skill implements no prose.

Do not write the final prose yourself.

## Readiness gate

Set `Status: ready` only when:

- the primary query, page promise, and above-the-fold answer agree;
- every section earns its place through a user question;
- every claim has a source or is explicitly editorial judgment;
- every repeated fact or exact comparison has a non-prose medium;
- the outline contains no duplicated answer, generic filler, or keyword padding;
- the content completeness map answers every relevant question once across the interface and guide;
- metadata and internal-link proposals follow the central registry architecture;
- the manual prose handoff is complete enough that later writing cannot invent product facts.

Otherwise set `Status: blocked` and return the missing fact or product decision upstream.

Before reporting completion, run the pipeline validator with `--stage=content`. Fix the outline or return upstream if it fails. Never weaken the validator.
