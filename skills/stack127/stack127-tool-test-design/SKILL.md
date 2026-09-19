---
name: stack127-tool-test-design
description: Produce the exhaustive edge-case and test contract for one stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility. Use after ready competitive, implementation, interface, and brief artifacts when the user asks what can go wrong, how invalid or boundary input should behave, what interface failures must be prevented, or what tests are required. Design tests and fixtures only; do not implement the page or test files.
---

# stack127 tool test design

Turn the product contract into an explicit risk model and test plan. Cover behavior, not implementation trivia.

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator starts this worker as `gpt-5.6-luna` with `reasoning_effort: "max"` and retains the session for implementation after the main agent accepts this contract. This worker never starts another pipeline worker or implements tests or page code during this planning stage. Read `stack127_docs/tool-pipeline.md` for the artifact and acceptance contract.

## Required output

Write `content_docs/<route-without-leading-slash>/edge-cases-and-tests.md` using `references/edge-cases-and-tests-template.md`.

Stop after this document. Do not create executable tests or page code.

## Prerequisites

1. Read `AGENTS.md`.
2. Read `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, and `brief.md` completely. Require all three contracts or reports to say `Status: ready` and require the route and tool name to agree.
3. Run the pipeline validator with `--stage=interface`. Stop if it fails.
4. Record SHA-256 fingerprints for all four inputs in the test report. Treat a later mismatch as a stale downstream artifact.
5. Read the relevant engine, route-family tests, ownership manifests, `skills/stack127/test-driven-page/SKILL.md`, and `stack127_docs/quality-workflow.md`.
6. Return product behavior, formula, source precedence, or scope gaps to `$stack127-tool-product-plan`. Return missing hierarchy, result-region, component, omission, visual-semantic, or responsive decisions to `$stack127-tool-interface-plan`. Do not invent either kind of decision inside the test report.

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
- optional mode behavior, including the selected single mode, disclosure, or basic/advanced treatment, meaningful default evidence, visible custom settings, hidden-setting invalidation and reveal, and beginner or advanced labels;
- loading, timeout, offline, rate limit, partial result, no data, upstream disagreement, corrupt payload, changed schema, and dependency failure;
- copy, share, download, serialization, encoding, version compatibility, and privacy leakage;
- focus order, labels, descriptions, error association, live regions, reduced motion, zoom, keyboard-only use, and screen-reader result order;
- dark/light themes, narrow/wide viewports, long translated-like strings, long values, tables, overflow, and touch targets;
- one lead answer, distinct result-region questions, duplicate formatted facts, removable regions, and the truth of any timeline, progress bar, chart, table, diagram, or large answer;
- untrusted input/output, HTML injection, URL injection, SSRF, prototype keys, oversized payloads, abuse limits, and secrets in analytics or logs;
- server rendering, hydration, no-JavaScript explanatory content, query noindex, canonical behavior, ownership manifest, and publication state;
- clean URL stability, explicit sharing, reset, reload, history restoration, and state preservation across edits;
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
- requirement ID from the implementation report or interface contract.

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
- every `UI-` acceptance criterion has an automated P0/P1 case or a repeatable manual comprehension check with a stated reason automation is insufficient.

Otherwise set `Status: blocked` and return the missing decision to the correct upstream stage.

Before reporting completion, run the pipeline validator with `--stage=test`. Fix the test contract if it fails and never weaken the validator.

When used in a pipeline, record the actual Luna model, `max` reasoning, and session through the orchestrator. Test readiness does not imply that the built tool or rendered content passed acceptance.
