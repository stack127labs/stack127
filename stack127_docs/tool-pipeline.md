# Tool pipeline

This is the current workflow for creating or changing a stack127 tool. It keeps correctness checks proportional to risk and avoids repeating the same planning, browser, and repository checks.

## Choose the risk level first

Record one risk level in `content_docs/<slug>/tool-spec.md` before implementation.

| Risk | Use it for | Required work |
| --- | --- | --- |
| `simple` | Deterministic calculators, converters, generators, and static checkers with local inputs and stable formulas | One concise specification, focused tests, implementation, content, one desktop run, one mobile run, and one independent review |
| `standard` | Parsers, uploads, several interacting states, uncommon formulas, or tools with meaningful compatibility limits | Simple workflow plus targeted primary-source or competitor research and broader failure-state tests |
| `high` | Live lookups, external APIs, security-sensitive decisions, maintained datasets, background work, or paid dependencies | Standard workflow plus explicit source receipts, abuse and failure analysis, data freshness rules, and a complete independent audit |

Raise the risk level when the implementation discovers a dependency or failure mode that the current level does not cover. Do not lower it merely to save time.

## One working specification

New work uses `content_docs/<slug>/tool-spec.md`. Start from the template at `skills/stack127/stack127-tool-orchestrator/references/tool-spec-template.md`.

The specification records:

- the user question and lead answer;
- risk and the reason for it;
- inputs, outputs, important states, and limits;
- formula, parser, lookup, or data truth;
- the visible interface and component choices;
- focused tests and browser scenarios;
- public content requirements;
- publication state and blockers.

Keep existing competitive reports, implementation reports, interface contracts, test plans, and writing plans as historical records. Do not recreate that document set for new work. Add a focused source or fixture file only when the tool needs evidence that would make the main specification hard to use.

## Workflow

### 1. Scope

Confirm the flat route, user job, risk level, publication state, data ownership, and any external side effect. Inspect reusable components and related tools. Stop for a user decision only when a missing choice changes the product or introduces cost, credentials, publication, or ongoing maintenance.

### 2. Specify

Write the concise tool specification. For standard and high-risk work, complete the necessary research before locking the formula, parser, data contract, or limitations. Do not run a broad competitor survey for a settled deterministic calculation.

### 3. Build with focused tests

Add the ownership manifest and route-owned tests. Implement the pure engine outside React, then the interface and server-rendered content. During iteration run only the affected unit and browser tests. Use shared controls and layout rules. Do not run the complete repository browser suite after every edit.

### 4. Verify the actual page

Exercise the main successful task, invalid recovery, and the most important boundary or failure state. Inspect one desktop viewport and one narrow mobile viewport. Shared shell, theme, navigation, and spacing tests own the full theme and width matrix. Add route-specific theme or width cases only when the tool has its own visual behavior that can break there.

### 5. Independent review

Run one independent final review after the page is integrated. Review correctness, recovery, accessibility, content, limitations, responsive behavior, and data truth in one pass. Fix confirmed P0 and P1 findings, then rerun only affected checks. High-risk work receives the complete audit from `stack127-tool-audit`.

### 6. Generate the receipt

After review, run:

```bash
npm run stack127:tool:verify -- /tool-slug \
  --risk=simple \
  --review=passed \
  --review-summary="Independent review found no open release blocker."
```

The command runs the fast repository checks, route-owned browser specifications, and a production build. It writes `content_docs/<slug>/verification-receipt.json`. The receipt records commands, results, duration, risk, publication state, and the review result. It does not record model names, session identifiers, screenshots, shared-file hashes, or repeated evidence links.

Receipts are completion records, not publication authority. Publication still requires a deliberate production database change and a separately authorized release.

## Existing acceptance records

The schema-version-1 `pipeline-acceptance.json` files and their evidence directories are frozen historical records for work completed before this workflow. Do not refresh their shared-file hashes after unrelated changes. The old validator remains available for checking those records, but new work uses `verification-receipt.json`.

## Checks by stage

Use these commands according to the work:

- While editing: route-owned unit tests and browser specifications.
- Before handoff: `npm run stack127:tool:verify` for a tool or `npm run quality` for another page change.
- Shared routing, SEO, shell, tool UI, registry, or test infrastructure changes: `npm run quality:full`.
- Production release: the release workflow tests the exact immutable image with `npm run test:smoke:external`.
- Nightly: `npm run quality:nightly` runs the complete desktop and mobile matrix.

`npm run test:changed` fails safe. It runs shared desktop coverage plus focused mobile shell and layout coverage when a runtime file cannot be mapped to one route or when a shared-risk file changes. The nightly job retains the complete desktop and mobile matrix.

## Communication

Routine work needs three user updates: start, a blocker that needs a decision, and completion. Add a short progress note only when a long-running check crosses a meaningful boundary. Do not paste passing logs or announce every internal stage.

## Completion

A tool is implementation-ready when its specification is current, focused tests and browser scenarios pass, the production build passes, the independent review has no open P0 or P1 finding, and the generated receipt is accepted. State publication and production release separately.
