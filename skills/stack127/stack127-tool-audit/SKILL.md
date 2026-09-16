---
name: stack127-tool-audit
description: "Audit one or more existing stack127 tools for correctness, test coverage, rendered UI, accessibility, writing, data quality, and completion. Use when the user asks to check a tool, test local tools, review their quality, or say whether the work is fully done and what remains. Produces evidence and a readiness verdict; does not start implementation or deployment."
---

# stack127 tool audit

Answer whether a person can use the tool, trust its answer, and understand its limits. A passing test suite and a polished screenshot are evidence, not a completion verdict. Apply this review to calculators, checkers, converters, lookups, generators, planners, and other interactive tools. Do not carry forward old findings or counts without checking the current implementation.

## Scope and working boundaries

- Review the selected tool or tools. If unnamed local builds are clearly identifiable from Git changes, routes, and manifests, state the inferred list and proceed. Ask only when the target remains ambiguous.
- For a general quality or completion request, cover all review areas below. Respect a narrower request such as checking only writing or a particular bug. Missing source or browser access limits the verdict; it does not prevent useful checks elsewhere.
- Keep product code, public copy, database records, publication, versions, and Git history unchanged unless the user has also authorized fixes. Running tests, starting a development server, creating isolated probes, and saving audit evidence are part of the review. Preserve existing work and clean up only resources created for this audit.
- If fixes are authorized, keep the initial evidence, use the relevant implementation workflow, and distinguish the original findings from the verified final state. This skill does not add an approval step to already authorized work.
- Do not start the full tool-building pipeline, a competitor survey, or production deployment just to perform a review. Research primary sources when needed to establish correct behavior or verify a public claim.

## Establish what should work

Read `AGENTS.md`, then use each route's `tests/pages/<slug>/page.json` to locate its source, engine, tests, docs, and scripts. Read the page brief, implementation report, interface contract, edge-case contract, and writing plan where they exist. Treat their readiness labels as planning claims, not proof of completed QA.

Read `stack127_docs/tool-interface.md`, `stack127_docs/design-system.md`, and the shared writing skill at `skills/stack127/stack127-writing-voice/SKILL.md`. Use its writing-style companion and `skills/stack127/unslop/SKILL.md`. Consult CSS, page-family, and tool-content ownership docs where the implementation depends on them. Reuse instructions already read during this task.

For each tool, identify the user question, required inputs, primary action, lead answer, limitations, and promised recovery behavior. Check the promises against both source code and the rendered page. Missing planning artifacts are a maintenance gap, not automatic proof that the tool is broken.

Record the current commit, relevant uncommitted changes, environment, route, and data source. Inspect the test server command and environment loader before running them. Stack127 test tooling can default to `.env.database`, which is production. For local review, use the managed development environment explicitly and verify its target without printing secrets. Check preview helpers for writes before using them. Do not publish a route or silently replace database content to get a screenshot.

## Test independently of the implementation

Start with focused tests and inspect what they actually assert. Derive a few additional cases from the tool's promises, formulas, or primary specifications rather than copying expected values from its own engine. Choose probes relevant to the tool:

| Tool behavior | Useful independent probes |
| --- | --- |
| Numeric calculation | Unit conversions, exact boundaries, rounding near a verdict, fractional and large values, zero versus unknown, and equivalent inputs producing equivalent results. |
| Parser or validator | Valid alternative syntax, malformed structure, false errors, missed errors, normalization that preserves meaning, and supported versus explicitly unsupported features. |
| Lookup or asynchronous work | Missing fields, partial responses, upstream failures, repeated submit, editing during a pending request, late responses, and reset or retry. |
| Data-backed planner | Server loading and normalization, catalogue coverage, missing joins, evidence eligibility, per-row units, known subtotals, and the difference between absent data and a zero requirement. |
| Generator or export | Output validity, escaping, required fields, copy/download fidelity, share-state restoration, and whether exported content matches the visible result. |

Trace representative values through the full path: input, normalization, calculation or API, result formatting, chart, and exported output. Engine tests can pass while a loader discards a value or a chart labels it incorrectly. Verify derived identities, roles, and holder names against the source rather than accepting a plausible fallback.

Read enough current primary documentation to resolve disputed behavior. A product contract can itself contain a mistaken rule. Cite the precise source when reporting that conflict. Do not invent a feature requirement for an intentionally limited tool.

Use temporary probes to demonstrate defects during a read-only review. Do not commit regression tests or change expectations unless fixes are in scope. Avoid sending real secrets to tools or external providers.

## Inspect the actual interface

Use the available Browser skill before browser work and follow its supported setup and recovery. If that browser is unavailable, use the permitted repository Playwright setup when possible. A browser failure is a verification limitation, not a reason to claim visual QA from source alone.

Operate the initial, successful, invalid, edited, and reset states. Include loading, partial, empty, overflow, copy failure, and restored states when the tool supports them. Use real development data for an integration check; use controlled fixtures for deterministic failures and races. Label which evidence came from each.

- Inspect desktop, a layout breakpoint, and narrow mobile views in both actual site themes. Use the page contract's sizes; absent a contract, 1440, 760, 375, and 320 px are useful targets. Changing the browser's preferred color scheme does not prove a site with its own theme toggle changed theme.
- Check result visibility after submission, not just whether a node received focus. The answer should be visible and clear of the sticky header. Check logical keyboard order, visible focus, accessible names, field-associated errors, and concise announcements.
- Compare chart labels, scale, denominator, units, unknown states, and legends with the numeric answer. Geometry and labels must remain truthful when the requirement exceeds the budget or only part of the data is known.
- Inspect clipping, wrapping, scroll containers, action targets, long names, and expanded evidence. No page overflow is not enough if a table or control is clipped internally.
- Read the hierarchy at normal display size. Findings and the answer should not be buried under settings, count tiles, duplicated summaries, or implementation metadata.

Save useful screenshots at a readable scale. A very tall full-page image shrunk into a thumbnail is not adequate visual inspection. Inspect viewport captures or relevant sections too. Include concrete visual defects rather than personal preferences, and do not cap the report in a way that hides material problems.

## Review writing and evidence in context

Read the actual server-rendered title, introduction, supporting content, labels, results, errors, captions, and evidence disclosures. Tool prose normally lives in `public.stack127_tool_pages`; a Markdown plan or TSX shell is not the published copy. Use the existing read-only content access path and applicable Supabase instructions when required.

Check whether the words explain how to use the result and recover from mistakes. Look for repeated field lists, repeated limitations, unexplained jargon, sentence fragments, unsupported certainty, misleading privacy claims, and missing source context. Keep useful depth; word counts are observations, not quality scores. Apply the shared voice instead of inventing another writing rubric.

Verify relevant internal links and primary-source claims. Distinguish measured, estimated, user-supplied, and missing values. Inspect whether evidence notes and dates survive the server-to-UI path. A fixture with a source URL is not proof of reviewed catalogue data, and development coverage does not establish production coverage.

## Complete verification without confusing causes

For a full readiness review, run focused unit and browser suites, type checking, static policy, and a production build where available. Check relevant route ownership, server-rendered content, navigation, and SEO behavior using the existing page-quality workflow. Broaden to shared or sitewide tests when affected dependencies or release claims justify it. Report any required check that could not be completed.

Batch independent reads and light checks. Serialize heavyweight builds and browser runs when they compete for resources or write the same generated files. Preserve logs and collect actual exit codes. A success-looking log followed by a termination code is not a clean pass.

Classify failures before assigning blame:

- **Product defect:** observed behavior violates a justified expectation.
- **Data or fixture gap:** required records or test setup are absent or inconsistent.
- **Environment or test-run failure:** browser access, sandbox restrictions, server readiness, shared state, timeouts, or machine load prevent a reliable check.
- **Unverified concern:** source suggests a problem, but it has not been reproduced or established conclusively.

Retry a failed check in isolation when it will distinguish these causes. Repeated timeouts remain unresolved until explained; they are neither automatic product bugs nor passes. Do not weaken a test or fabricate data to obtain a green result. Count individual tests separately from test files, and separate unrelated repository failures from findings about the selected tools.

For each area, record passed, failed, or not verified, plus the supporting evidence. Do not claim a clean browser suite when a relevant case was skipped or failed. Keep implementation readiness, local integration readiness, and publication/release state separate. An intentionally unpublished tool can be implementation-ready; a development registry row is not a production release.

## Deliver the same clear review style

Lead with the answer to whether the work is fully done. For multiple tools, use a compact table with tool, verdict, and main remaining work. Useful verdicts are ready within the reviewed scope, close with minor fixes, needs fixes, or unable to verify. Avoid arbitrary percentage-complete scores.

Order findings by user impact. Each material finding needs:

- The affected tool and a verified source location or rendered section.
- A concrete input or action, expected behavior, and observed behavior.
- Why it matters, the smallest useful correction, and its confirmation status.
- A log, screenshot, or primary-source link when it helps establish the claim.

Include a brief UI/writing assessment, exact verification results, missing evidence, and the practical fix order. Name what works as well as what remains unfinished. Mark deferred features separately from defects and required acceptance gaps.

Keep the chat summary short and self-contained. For a substantial audit, save a detailed report with reproduction steps and evidence links in the task's artifact directory or a dated `stack127_records/YYYY-MM-DD-<scope>-tool-audit.md` record. Store useful evidence alongside the report or in its page-owned artifact location rather than relying only on disposable `/tmp` files. Follow page-specific script ownership for probe files. Do not create a second live copy of the tool's supporting Markdown.

End by stating whether fixes or publication changes were made. Never call the work fully finished while confirmed defects or required verification gaps remain.
