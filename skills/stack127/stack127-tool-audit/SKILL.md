---
name: stack127-tool-audit
description: Independently audit one or more stack127 tools for correctness, focused tests, rendered behavior, accessibility, writing, data truth, and readiness. Use the complete audit for high-risk tools or when the user explicitly requests a deep review. Audit-only work remains read-only.
---

# stack127 tool audit

Answer whether a person can use the tool, trust its answer, recover from mistakes, and understand its limits. Read `AGENTS.md`, the tool specification or historical contracts, ownership manifest, engine, route, tests, current database content, interface rules, design system, and shared writing voice.

## Choose the audit depth

- Simple and standard pipeline review: independently probe the main result, one boundary, invalid recovery, keyboard and focus behavior, content accuracy, one desktop viewport, and one narrow mobile viewport.
- High-risk or explicitly requested complete audit: also cover upstream failures, partial data, abuse and privacy, maintained-data freshness, schema drift, security boundaries, restored state, relevant themes and breakpoints, and all consequential branches.

Do not expand a routine review into a broad competitor survey or repeat checks already established by shared site tests.

## Review

Derive independent expected values or fixtures rather than copying the engine. Trace representative input through normalization, calculation or resolution, formatting, visualization, and export. Distinguish product defects, data gaps, environment failures, and unverified concerns.

Operate the actual page. Check answer visibility, stale results, field errors, focus order, accessible names, announcements, long values, clipping, table or chart truth, copy or export fidelity, and clean URL behavior. Read the server-rendered introduction, usage guide, supporting content, labels, results, errors, captions, limitations, and source context.

For authorized fixes, preserve the initial finding, make the smallest correction, add a regression when useful, and rerun affected checks. Do not run the complete repository browser suite unless shared-risk code changed.

## Verdict

Use ready, close with minor fixes, needs fixes, or unable to verify. Every material finding needs the affected route, exact input or action, expected and observed behavior, impact, correction, and confirmation state. P0 and P1 findings block readiness. Safe P2 work can remain explicit.

For the risk-based pipeline, supply the short independent review summary used by `npm run stack127:tool:verify`. Do not maintain model, session, screenshot, or shared-file hash evidence. Historical schema-version-1 acceptance records remain frozen.

State whether fixes, data, publication, or deployment changed. Never call the tool finished while a confirmed blocker remains.
