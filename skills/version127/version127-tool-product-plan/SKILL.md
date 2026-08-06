---
name: version127-tool-product-plan
description: Convert a ready competitive report for one version127 calculator, checker, converter, lookup, generator, explorer, or technical utility into a compact product and implementation contract. Use after version127-tool-research when the user asks to plan what the page should build, choose a formula or data contract, define the interface and visual result, or create an implementation report, wireframes, and complete user flow. This is a plan-only stage and must not implement the page.
---

# version127 tool product plan

Turn research into one decisive build contract. Prefer a small, opinionated product over a feature inventory.

## Required outputs

Write:

- `content_docs/<route-without-leading-slash>/implementation-report.md` from `references/implementation-report-template.md`;
- `content_docs/<route-without-leading-slash>/brief.md` using the exact brief format in `version127_docs/visual-first.md`.

Stop after these documents. Do not write tests, final public prose, route code, or components.

## Prerequisites

1. Read `AGENTS.md`.
2. Read the complete `competitive-report.md`. Require `Status: ready`. If it is missing, blocked, stale for a time-sensitive tool, or lacks evidence for a core formula or data source, stop and return to `$version127-tool-research`.
3. Run the pipeline validator with `--stage=research`. Stop if it fails.
4. Record the SHA-256 fingerprint of `competitive-report.md` in the implementation report before making downstream decisions.
5. Inspect the current route family, shared components, libraries, tests, manifests, scripts, and relevant `content_docs/` files.
6. Read `version127_docs/visual-first.md`, `writing-style.md`, `design-system.md`, `css-architecture.md`, `seo.md`, and `quality-workflow.md`.
7. Read `skills/version127/visual-first-content/SKILL.md` and `skills/version127/test-driven-page/SKILL.md`.

## Decide the product

State one primary user, one job, and one product thesis. Name the evidence-backed reason a user should prefer this tool. It must be a real advantage such as clearer topology, safer validation, better source transparency, faster repeat use, or an exact visualization. "More features" and "better design" are not theses.

Define table stakes, launch differentiators, deferred ideas, and explicit non-goals. Reject options that do not change a meaningful answer or decision.

## Specify technical truth

For a calculator or converter, define a versioned formula contract:

- accepted inputs, types, units, normalization, bounds, and defaults;
- exact equations or ordered derivation steps;
- rounding and display rules without changing source values;
- invalid configurations and why no result may be shown;
- assumptions, uncertainty, and excluded effects;
- primary sources and the date checked;
- formula and serialized-input versioning when shared URLs can outlive implementation changes.

For a lookup or checker, define the equivalent resolution contract:

- authoritative sources and precedence;
- request normalization and fixed upstream boundaries;
- timeouts, caching, rate limits, freshness, partial data, and provenance;
- unknown, absent, negative, conflicting, and failed-result semantics;
- privacy, abuse, SSRF, and untrusted-output handling.

Unknown is better than fake precision. A result must never coexist with an error that invalidates it.

Set `Contract type: formula` or `Contract type: resolution` in the report header. Generators and explorers use the type that matches their technical truth: deterministic input transformation is a formula contract; external-source interpretation is a resolution contract.

## Design the interaction visually

Make the tool itself the primary visual. Follow the version127 rule: one clear framed tool with form and result in the same surface, no nested card dashboard.

Create ASCII wireframes for desktop and narrow mobile in these states when relevant:

- clean or empty;
- valid result;
- invalid input or invalid configuration;
- loading or calculating;
- partial/no-data/upstream failure;
- restored or shared state.

Use a Mermaid flow only when the state transitions are clearer as a diagram. Define focus movement, keyboard behavior, live-region behavior, repeat submission, reset, stale-result handling, URL state, copy/export, and recovery. Decide whether results update live or through one explicit action and explain why.

Assign every claim to a medium: tool UI, exact chart, table, topology/diagram, screenshot, or sentence. Use marker art only for a conceptual mental model and never for exact results. Do not plan decorative visuals.

## Plan the build

Assign stable IDs such as `R1`, `R2`, and `R3` to every acceptance criterion so the next stage can trace each edge case and test back to a product requirement.

Specify:

- server-rendered page content versus the smallest client-side island;
- pure engine boundaries and why formula/data logic stays outside React;
- route, component, CSS, library, test, script, doc, and manifest ownership;
- dependency policy, performance budget, accessibility semantics, privacy, analytics exclusions, and publication state;
- acceptance criteria written as observable outcomes.

Do not put metadata, canonical, robots, sitemap, or JSON-LD in the route file. Keep the page unpublished unless the user separately approves publication.

## Readiness gate

Set `Status: ready` only when:

- the primary job and winning thesis are singular and evidence-backed;
- all P0 formula, source, data, privacy, and product decisions are resolved;
- every visible state and transition has an expected experience;
- wireframes are concrete enough to implement without redesigning;
- the result hierarchy is visual and answer-first;
- scope, non-goals, file ownership, and acceptance criteria are explicit;
- `brief.md` matches the report and does not introduce extra prose.

Otherwise set `Status: blocked`, name the unresolved decision, and stop.

Before reporting completion, run the pipeline validator with `--stage=product`. Fix the contract if it fails and never weaken the validator.
