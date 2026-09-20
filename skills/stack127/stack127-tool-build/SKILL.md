---
name: stack127-tool-build
description: Build and verify the interactive technical core of one stack127 calculator, checker, converter, lookup, generator, explorer, or utility from its ready competitive, product, interface, test, and brief artifacts. Use only when the user explicitly asks to implement the tool. Enforce tests first, implement the formula or resolution engine and contracted interface, verify it with the in-app Browser when available or standalone Playwright in homelab CLI mode, and run repository quality gates. Do not research, draft, or add explanatory page prose, SEO sections, FAQs, or article content. Content generation and integration happen in the writing stage.
---

# stack127 tool build

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator continues the same `gpt-5.6-luna` worker used for test design, with `reasoning_effort: "max"`. The main agent must accept the test-contract gate before this skill starts. This worker never starts another pipeline worker. Astra has no implementation, browser-QA, test, or database role.

Build exactly one working tool. Deliver the tool surface only; the writing stage owns the supporting content.

## Prerequisites

1. Read `AGENTS.md`.
   Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` to contracted interface wording. Its control, result, and error guidance applies here; its guide-writing guidance does not authorize explanatory page prose.
2. Read `skills/stack127/test-driven-page/SKILL.md` and `skills/stack127/visual-first-content/SKILL.md` completely.
3. Read `stack127_docs/design-system.md`, `css-architecture.md`, `visual-first.md`, `writing-style.md`, `seo.md`, and `quality-workflow.md`.
4. Read `stack127_docs/tool-pages.md` for the route/content boundary and functional version workflow.
5. Read `skills/stack127/references/homelab-browser-and-search.md` before visual verification and record the selected backend.
6. Run:

   ```bash
   node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/<route-without-leading-slash> --stage=test
   ```

7. Stop if validation fails. Require ready `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, and `brief.md`. Do not require or consume `writing-and-seo.md`.
8. Inspect the route family, shared components, libraries, tests, manifests, scripts, and worktree. Preserve unrelated and user-owned edits.

## Tool-only boundary

Implement only:

- the page title or tool name;
- inputs, selectors, units, controls, and actions;
- result values and the approved exact visualization;
- terse validation, loading, empty, partial, error, reset, and recovery states;
- accessibility labels, descriptions, announcements, and source/provider labels required for correct operation.

Do not add:

- an introduction, dek, explanatory paragraph, or marketing promise;
- how-to-use, methodology, formula-explanation, worked-example, caveat, FAQ, related-reading, or SEO sections;
- placeholder prose, empty content headings, lorem ipsum, or a reserved article shell;
- content from `writing-and-seo.md` or any writer.

Do not edit `intro_markdown`, `content_markdown`, or `content_revision`. Those belong to the content-only workflow.

Implement the approved media choice and leave rendered traceability for it. Trace structured content in the rendered page, including ordered lists, bullet lists, and definition lists. Marker art is allowed only when its spec is registered in the applicable MarkerArt registry and the rendered page uses that registered artifact.

If a planning artifact proposes explanatory prose, leave it for the writing stage. Preserve the underlying product behavior or structured result, but do not convert the prose into helper copy. Keep operational language short; shorten any static or interpolated public string that reaches eight words.

## Required order

### 1. Establish ownership and publication state

Create or update `tests/pages/<route>/page.json` before or alongside tests. Keep the route unpublished unless the user explicitly authorizes publication. Do not add route metadata, canonical, robots, sitemap, or JSON-LD logic.

### 2. Write failing tests first

Implement the P0 and P1 cases from `edge-cases-and-tests.md` before production code. Cover both product `R` requirements and interface `UI-` requirements. Start with pure engine tests and exact fixtures, then API or route boundaries, then rendered behavior. Add P2 tests only for meaningful regressions.

Do not weaken expectations to match implementation. Return unresolved formula, source, interaction, or state decisions to the owning planning skill.

### 3. Build the pure technical core

Keep formulas, parsing, validation, normalization, serialization, and upstream interpretation outside React. Use exact arithmetic where precision matters. Preserve formula or input versions when shared state can outlive a release.

Return structured invalid, unknown, partial, and error states. Never show a plausible result after current inputs or source state become invalid.

### 4. Build the interface

For optional modes, keep one engine and one primary action. Use the approved `single`, `disclosure`, or `basic-advanced` pattern. Basic must show its active assumptions and their sources. Preserve custom Advanced values when switching, summarize them visibly in Basic, require an explicit reset before replacing them with defaults, and reveal and focus a hidden invalid setting. Test equivalent-input parity plus direct URL, reset, reload, back, and forward behavior.

Implement `interface-contract.md` exactly. It owns the visible inputs, actions, result regions, component choices, omissions, reading order, and responsive behavior. Do not add a region because data exists or a component is available. Return a missing or contradictory interface decision to `$stack127-tool-interface-plan`.

Inspect `app/tool-ui`, `/tool-ui-lab`, and the sibling pages named in the interface contract before styling. Follow the component provenance disposition for every nontrivial control and result. Reuse a suitable shared component. When the approved component is missing, build the contracted shared or route-specific component with its complete states, tokens, accessibility, recovery, and responsive behavior.

Do not expose an unstyled native control, generic browser upload box, generic dashboard pattern, or unrelated third-party component as a silent fallback. Native elements may provide semantics underneath a stack127 interface; a file input can remain visually hidden and accessible behind an approved dropzone and browse action. If the contract lacks a missing-component decision or the component cannot be built within the approved scope, stop and return the issue to interface planning.

Also preserve the product interaction contract:

- keep the client island as small as practical;
- use one full-width workbench band with form and result in the same surface;
- make the answer the strongest element;
- use exact bars, charts, tables, or topology for exact relationships;
- avoid nested cards, dashboards, helper-copy clutter, decorative eyebrows, fake scores, gradients, shadows, and colored left-edge callouts;
- reuse the shared shell, tokens, typography, spacing, icons, and components;
- colocate CSS with its owner and verify dark mode first;
- preserve focus, keyboard, screen-reader, mobile, URL, retry, reset, and stale-result behavior.

Compare visible formatted values across the whole result. A value may appear twice only when each occurrence answers a documented different question. Every timeline, progress bar, chart, table, diagram, and large answer must pass the truth test recorded in the interface contract.

Do not add a dependency when a small auditable implementation is sufficient.

### 5. Verify progressively

Run focused engine and page tests while iterating, then `npm run test`.

Start the route family's guarded local preview. For an unpublished route, use or add a local-only preview helper that restores state afterward. Never publish or mutate the production registry for Browser testing.

Read the complete installed Browser skill. Use the in-app Browser when a runtime instance is available; otherwise use standalone Playwright with the repository's test runner and record the CLI backend. Inspect the actual page at desktop and narrow mobile widths in dark and light themes. Exercise valid, invalid, repeat, reset, reload/history, partial/failure, long-value, and keyboard-only states that apply.

Treat responsive layout as a blocking gate, not a screenshot preference:

- check 320px, 375px, 760px, and a normal desktop viewport in the selected visual backend;
- calculate a valid result before judging mobile layout, because empty forms do not expose result overflow;
- assert that the document, page container, tool frame, form, and result do not create page-level horizontal overflow;
- verify that long code, tables, charts, legends, and grid children cannot expand their parent, and add `min-width: 0` at every required grid or flex boundary;
- keep capacity, unit, and remove controls aligned in one drive row with at least 44px targets;
- keep the primary answer, every accounting label, value, and percentage visible at 320px and 375px without requiring horizontal table scrolling;
- reflow tables with many columns into labelled rows on narrow screens instead of clipping values or relying on an invisible horizontal scroll area;
- inspect auxiliary-role output and the longest generated command, not only the shortest default result;
- measure bounding boxes and scroll widths in addition to screenshots. A clipped child inside `overflow: hidden` still fails even when the document itself reports no overflow.

Judge the tool in a two-second scan:

- Is the input obvious?
- Is the result the loudest useful thing?
- Does the visualization explain the relationship without prose?
- Is any helper sentence unnecessary?
- Does anything look like generic dashboard furniture?

Then hide the contracts and state the answer in one sentence. Name what each remaining result region uniquely adds. Treat an unclear answer, a repeated fact, or a removable region as a failed interface requirement.

After visual verification, restore preview state and run:

```bash
node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/<route-without-leading-slash> --tool-only
```

The tool-only audit discovers every TypeScript and TSX file in the route and rejects long static or fragmented public copy. Fix violations by removing or shortening prose, not by splitting strings or omitting files.

When the user-observable tool behavior changed, use the dry-run-first functional version command in `stack127_docs/tool-pages.md` against development. Bump `tool_version` once after the implementation and focused tests pass. A refactor with no behavior change does not receive a new version. Do not record a stack127 repo sync unless that repository was actually compared or synchronized.

### 6. Run the full gate

Run `npm run quality`. Request normal approval if required production data or network access is unavailable. Do not skip registry or SEO checks.

## Completion gate

Call the tool complete only when:

- the pipeline validator passes with `--stage=test` and `--tool-only`;
- all P0 and P1 cases pass;
- formula or data fixtures reconcile with the approved contract;
- the rendered tool matches approved state wireframes in both themes and target widths;
- the rendered information model matches `interface-contract.md`, with one lead answer, no unjustified region, no repeated formatted fact, and truthful visual geometry;
- the calculated result has no clipped or offscreen values at 320px, 375px, 760px, or desktop width;
- no explanatory page prose, content section, FAQ, or writing artifact was added;
- a user-observable functional change has a reviewed `tool_version` bump, while `content_revision` is unchanged;
- the ownership manifest is complete;
- `npm run quality` passes;
- preview and publication state are restored.

Report the technical system built, tool version before and after when changed, tests run, visual states checked, selected backend, preview cleanup, and any P2 follow-up. Explicitly confirm that no page prose or content revision was added. Do not publish, deploy, commit, push, or open a pull request unless requested.
