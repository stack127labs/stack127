---
name: stack127-tool-test-design
description: Produce the exhaustive edge-case and test contract for one stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after a ready competitive report and implementation report when the user asks what can go wrong, how every invalid or boundary input should behave, what tests are required, or for an edge-cases and tests report. Design tests and fixtures only; do not implement the page or test files.
---

# stack127 tool test design

Turn the product contract into an explicit risk model and test plan. Cover behavior, not implementation trivia.

## Required output

Write `content_docs/<route-without-leading-slash>/edge-cases-and-tests.md` using `references/edge-cases-and-tests-template.md`.

Stop after this document. Do not create executable tests or page code.

## Prerequisites

1. Read `AGENTS.md`.
2. Read `competitive-report.md`, `implementation-report.md`, and `brief.md` completely. Require both reports to say `Status: ready` and require the route and tool name to agree.
3. Run the pipeline validator with `--stage=product`. Stop if it fails.
4. Record SHA-256 fingerprints for all three inputs in the test report. Treat a later mismatch as a stale downstream artifact.
5. Read the relevant engine, route-family tests, ownership manifests, `skills/stack127/test-driven-page/SKILL.md`, and `stack127_docs/quality-workflow.md`.
6. Return to `$stack127-tool-product-plan` if an expected behavior, requirement ID, formula, source precedence, or invalid-state decision is missing. Do not invent a product decision inside the test report.

## Build the risk model

Classify each case:

- `P0`: could show a materially wrong answer, create a security/privacy problem, corrupt shared state, or make the primary job inaccessible;
- `P1`: breaks a common flow, recovery path, browser state, or important accessibility behavior;
- `P2`: uncommon polish, resilience, or presentation issue.

Cover every applicable family:

- empty, whitespace, letters, punctuation, locale separators, exponent notation, signs, leading zeroes, decimals, pasted text, and unsupported units;
- minimum, maximum, just-inside, just-outside, zero, negative, huge, overflow, precision, and rounding boundaries;
- impossible combinations, duplicate identifiers, mixed sizes, ordering, grouping, and stale dependent controls;
- formula invariants and hand-calculated or specification-derived oracles for formula contracts;
- source precedence, response classification, provenance, freshness, conflict, and failure fixtures for resolution contracts;
- submit by click and keyboard, rapid repeat clicks, double submit, edit during request, abort, retry, reset, back/forward, reload, restored state, malformed shared state, and stale results;
- loading, timeout, offline, rate limit, partial result, no data, upstream disagreement, corrupt payload, changed schema, and dependency failure;
- copy, share, download, serialization, encoding, version compatibility, and privacy leakage;
- focus order, labels, descriptions, error association, live regions, reduced motion, zoom, keyboard-only use, and screen-reader result order;
- dark/light themes, narrow/wide viewports, long translated-like strings, long values, tables, overflow, and touch targets;
- untrusted input/output, HTML injection, URL injection, SSRF, prototype keys, oversized payloads, abuse limits, and secrets in analytics or logs;
- server rendering, hydration, no-JavaScript explanatory content, query noindex, canonical behavior, ownership manifest, and publication state;
- deterministic engine performance, client bundle restraint, request concurrency, cache behavior, and layout stability.

If a family does not apply, record why instead of silently omitting it.

Complete every row in the template's coverage checklist. The validator requires at least eight concrete `EC-` cases, including P0 and P1 cases, and at least three authoritative formula or resolution fixtures. These are floors, not targets; add every distinct case the contract needs.

## Define expected experience

For every edge case, specify:

- setup and exact input;
- expected calculation or system outcome;
- what remains visible, what is cleared, and where recovery appears;
- whether focus moves or an announcement occurs;
- whether a request, URL update, analytics event, or stored state is allowed;
- test level and proposed file;
- fixture or oracle source;
- requirement ID from the implementation report.

Do not use vague expectations such as "handle gracefully" or "show an error". Do not assert exact prose unless wording is safety-critical; assert meaning, location, semantics, and recovery.

## Choose the smallest effective test

- Use pure Node tests for formulas, parsing, validation, serialization, and invariants.
- Use route/API tests for trust boundaries, upstream handling, caching, limits, and response contracts.
- Use Playwright only for rendered behavior, focus, keyboard interaction, responsive layout, themes, live regions, SEO-visible behavior, and browser history.
- Use static policy tests for route ownership and architecture rules.
- Keep visual human review for hierarchy, clipping, density, and whether a result is understandable in a two-second scan.

Each P0 and P1 case must map to an automated test unless automation cannot observe it. Document the reason and a repeatable manual procedure when it cannot.

## Readiness gate

Set `Status: ready` only when:

- every formula branch or resolution branch has authoritative or independently derived fixtures;
- every invalid configuration prevents stale or plausible-looking output;
- every P0 and P1 row has an owner, expected UX, test level, and file;
- concurrency, recovery, accessibility, privacy, security, SEO, state, and responsive behavior are covered or explicitly not applicable;
- the proposed test set is traceable to the implementation acceptance criteria.

Otherwise set `Status: blocked` and return the missing decision to the correct upstream stage.

Before reporting completion, run the pipeline validator with `--stage=test`. Fix the test contract if it fails and never weaken the validator.
