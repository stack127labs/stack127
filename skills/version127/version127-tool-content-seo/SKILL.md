---
name: version127-tool-content-seo
description: Plan the useful writing, search intent, headings, metadata direction, internal links, formula explanation, and visual-versus-prose outline for one version127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after ready research, implementation, and test-design reports when the user asks for the writing and SEO document. Produce a manual-content-ready outline only; do not draft final public page prose or implement the page.
---

# version127 tool content and SEO

Plan only the words users need around a working visual tool. Do not turn the page into an article with a calculator attached.

## Required output

Write `content_docs/<route-without-leading-slash>/writing-and-seo.md` using `references/writing-and-seo-template.md`.

Stop after this document. Do not draft final paragraphs, call a writer, create metadata migrations, change the route, or pass prose into `$version127-tool-build`. The user will provide prose later.

## Prerequisites

1. Read `AGENTS.md`.
2. Read `competitive-report.md`, `implementation-report.md`, `edge-cases-and-tests.md`, and `brief.md` completely. Require all three reports to say `Status: ready` and require route/tool identity to match.
3. Run the pipeline validator with `--stage=test`. Stop if it fails.
4. Record SHA-256 fingerprints for all four inputs in the writing and SEO plan. Treat later changes to any input as invalidating this plan.
5. Read `version127_docs/visual-first.md`, `writing-style.md`, and `seo.md`, plus `skills/version127/visual-first-content/SKILL.md`.
6. Use the in-app Browser to verify the current result page for the exact primary query and two or three close intent variations. Record the date and visible result shapes. Reuse recent competitive research, but verify that intent has not shifted.

## Define the page promise

State:

- the one query family this page should satisfy;
- the immediate answer the user expects from the interface;
- the minimum explanation needed to trust and use that answer;
- adjacent intent that deserves an internal link instead of another section;
- intent the page will deliberately not target.

Do not chase unrelated keywords. Do not add a section merely because competitors have one. Do not claim rankings, traffic, best, first, or only.

## Plan headings and media

Create an outline in reading order. For each section include:

- proposed h1, h2, or h3;
- the exact user question or uncertainty it resolves;
- the takeaway, not finished prose;
- its medium: tool UI, exact result visualization, table, marker concept, screenshot, or sentences;
- source/evidence;
- maximum useful depth and what must not be repeated.

Set an explicit static prose budget before outlining: no more than five static prose sections and 700 drafted words total. The interactive tool, exact result visualization, tables, diagrams, and screenshots do not count as prose sections. Keep `Primary medium: Tool UI` and require `Prose is the minority: yes`. If the page genuinely needs more, split the job or ask the user to revise this pipeline instead of silently overriding the ceiling.

The tool and answer come before explanatory content. Headings must carry the point or ask the real question. Someone skimming headings alone should understand the page.

Use the template's controlled medium names exactly: `Tool UI`, `Exact result visualization`, `Exact chart`, `Clean chart`, `Table`, `Topology/diagram`, `Diagram`, `Screenshot`, `Marker concept`, or `Sentences`. Do not relabel prose as copy, FAQ, explanation, paragraph, or text; every `Sentences` row must map one-to-one to a reserved `COPY-` assignment for the later manual content pass.

Use prose for judgment, caveats, formula interpretation, and confusing boundaries. Use tables for repeated facts, clean charts for exact comparisons, marker art for vague concepts only, and screenshots only to prove a real interface. Never restate a visual in a paragraph.

## Plan technical explanation

Map the formula or resolution contract into a short human explanation:

- name the inputs and what changes the answer;
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

Define exactly which static public sections the user may provide after the tool is built. Give every section a stable ID such as `COPY-01`. Include facts, sources, word limit, shape constraints, banned claims, required caveats, and section IDs. Keep this handoff out of `$version127-tool-build`; that skill implements no prose.

Do not write the final prose yourself.

## Readiness gate

Set `Status: ready` only when:

- the primary query, page promise, and above-the-fold answer agree;
- every section earns its place through a user question;
- every claim has a source or is explicitly editorial judgment;
- every repeated fact or exact comparison has a non-prose medium;
- the outline contains no duplicated answer, generic filler, or keyword padding;
- metadata and internal-link proposals follow the central registry architecture;
- the manual prose handoff is complete enough that later writing cannot invent product facts.

Otherwise set `Status: blocked` and return the missing fact or product decision upstream.

Before reporting completion, run the pipeline validator with `--stage=content`. Fix the outline or return upstream if it fails. Never weaken the validator.
