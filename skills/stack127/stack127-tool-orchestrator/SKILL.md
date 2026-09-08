---
name: stack127-tool-orchestrator
description: Orchestrate one stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility from initial research through product planning, test design, test-first implementation, independent Browser or Playwright QA, competitive re-review, simple page writing, refinement, final quality gates, and a backend-accurate handoff. Use when the user asks to create or complete one stack127 tool page end to end and wants specialist subagents coordinated with feedback. Keep the route unpublished and stop before publication, commit, push, or deployment.
---

# stack127 tool orchestrator

Own one tool from idea to a complete unpublished page. Delegate bounded stages to the existing specialist skills, review every artifact yourself, and keep the user informed between stages.

## Read first

1. Read `AGENTS.md` and the complete files for:
   - `skills/stack127/stack127-tool-research/SKILL.md`;
   - `skills/stack127/stack127-tool-product-plan/SKILL.md`;
   - `skills/stack127/stack127-tool-interface-plan/SKILL.md`;
   - `skills/stack127/stack127-tool-test-design/SKILL.md`;
   - `skills/stack127/stack127-tool-build/SKILL.md`;
   - `skills/stack127/stack127-tool-content-seo/SKILL.md`;
   - `skills/stack127/stack127-tool-writing/SKILL.md`;
   - `skills/stack127/stack127-writing-voice/SKILL.md`;
   - `skills/stack127/visual-first-content/SKILL.md`;
   - `skills/stack127/test-driven-page/SKILL.md`.
2. Read `references/orchestration-contract.md` completely before launching a worker.
3. Read `references/browser-qa-checklist.md` before build review or independent QA.
4. Read `references/handoff-template.md` before the final handoff.
5. Read `skills/stack127/references/homelab-browser-and-search.md` before any live search, competitor operation, local visual QA, or handoff.
6. Inspect the worktree, related routes, shared components, docs, tests, scripts, and publication registry. Preserve unrelated changes.

## Hard boundary

Deliver a complete unpublished tool page with a verified technical core and a complete but concise server-rendered content layer. Keep the tool as the primary visual and answer. Do not turn the page into an article, add an FAQ or methodology essay by default, or use explanatory content to conceal a technical or interaction defect.

Do not publish, change registry metadata, commit, push, open a pull request, or deploy unless the user makes a separate explicit request. Do not conceal, waive, or relabel a failed gate.

## Orchestration rules

- Maintain one visible plan with exactly one active stage.
- Send the user a concise update when a stage starts, passes, returns for revision, or blocks.
- Use a fresh bounded worker for research, product planning, interface planning, test design, independent QA, competitive re-review, content/SEO planning, and writing.
- Use one builder worker for implementation and send later implementation feedback back to that worker when possible.
- Keep dependency stages sequential. Do not start a downstream worker from draft or blocked inputs.
- Give workers the tool name, route, repository path, required skill path, input artifacts, allowed write scope, and exact stop condition. Do not give them the desired conclusions.
- Read every produced artifact and inspect every diff yourself. A worker saying “done” is not a gate.
- Return missing facts or decisions to the stage that owns them. Never let a downstream worker invent an upstream product decision.
- Classify review findings as P0, P1, or P2. Require P0 and P1 fixes and regressions before advancing. Record P2 items for handoff when deferral is safe.
- Use the available multi-agent controls to wait for workers, provide feedback, and continue them. Do not leave active workers running after completion or a blocker.
- The main orchestrator agent, not a worker, owns the final visual handoff. Use the in-app Browser when available; otherwise provide the reproducible standalone Playwright CLI evidence and explicitly disclose that no visible in-app tab was available.

## Workflow

### 1. Intake and preflight

Resolve the exact tool name, stable route, primary job, formula-versus-resolution contract, and current repository state. Default the route to unpublished. Check for duplicate tools and reusable route-family code.

Give the tool one flat canonical route, `/tool-slug`, with source under `app/(site)/(tools)/tool-slug`. Existing collections such as `/storage-tools`, `/dns-tools`, and `/domain-tools` are discovery surfaces, not URL parents. Add the tool to every collection it genuinely serves instead of choosing one permanent category. Inspect the flat route namespace for collisions and lock the slug before launching workers; no worker may rename or relocate it.

Run the inspector at intake:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=intake
```

Stop for user direction only when the route, product identity, authoritative technical basis, or required external side effect is materially ambiguous.

### 2. Competitive research

Launch a research worker with `$stack127-tool-research`. Require the selected Browser backend, SearXNG `bing,duckduckgo` search when configured, primary-source technical verification, the competitor minimum or documented saturation, backend/viewport evidence, and only `competitive-report.md`.

Review evidence labels, URLs, wireframes, formula disagreements, mobile behavior, user pain, and rejected ideas. Return weak or incomplete research to the worker. Then run:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=research
```

### 3. Product contract

Launch a fresh worker with `$stack127-tool-product-plan`. Require one decisive job, exact inputs and actions, formula or resolution truth, all visible states, desktop and narrow wireframes, result hierarchy, requirement IDs, ownership, and non-goals.

Reject plans that defer action semantics, responsive behavior, state restoration, invalid-result behavior, or result visualization to the builder. Run the inspector with `--expect=product` after review.

### 4. Interface contract

Launch a fresh worker with `$stack127-tool-interface-plan`. Require one user question, one lead answer, an information inventory with explicit omissions, justified inputs and actions, distinct result-region questions, visual truth tests, all applicable states, realistic desktop and narrow wireframes, and observable `UI-` requirements.

Reject contracts that start from available components, repeat a formatted fact, use a visual whose geometry does not encode the claimed relationship, or leave hierarchy and responsive behavior to the builder. Run the inspector with `--expect=interface` after review.

### 5. Test contract

Launch a fresh worker with `$stack127-tool-test-design`. Require exact P0/P1 cases, authoritative fixtures, requirement traceability, recovery behavior, accessibility, state, security, responsive, SEO, and performance coverage.

Return missing behavior to product planning instead of inventing it here. Run the inspector with `--expect=test` after review.

### 6. Test-first build

Launch one builder with `$stack127-tool-build`. Require ownership first, failing tests before production code, a pure technical core outside React, the ready interface contract, a guarded local preview, progressive tests, and no public page prose. The builder may not add a control, result region, explanatory sentence, or visualization that the interface contract rejected or did not justify.

Require the builder to compare the shell, page width, spacing, typography, and controls with at least two established sibling pages before styling. Require explicit action semantics: inventory/edit actions must never replace the primary calculate/check/generate action.

Do not accept a builder report without focused test commands, results, visual states and backend checked, publication cleanup, and a diff summary.

### 7. Independent Browser QA

Launch a fresh read-only QA worker against the running local route. Do not pass the builder's conclusions or suspected bugs. Require the complete checklist in `references/browser-qa-checklist.md`, using the in-app Browser or standalone Playwright according to the backend preflight. Require screenshots or measurements for failures, the backend name, and reproducible findings.

Check the worker's evidence. Send P0 and P1 findings to the builder. After each fix batch, rerun the affected workflow and the relevant widths; do not validate only the changed control.

### 8. Post-build competitive review

Launch a fresh reviewer to operate the finished tool and the strongest relevant competitors with the selected visual backend. Compare time to first answer, action clarity, result usefulness, technical transparency, mobile behavior, accessibility, privacy, clean URL behavior, and honest limitations.

Return technical or interaction gaps upstream. Record content-only gaps for the content-plan and writing stages.

### 9. Final technical gates

Run:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=build
node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/<route> --tool-only
npm run test
npm run quality
```

Require all tool-owned P0 and P1 tests, focused fixtures, Browser checks, and the production build to pass. Restore guarded preview and publication state.

If `npm run quality` fails in an unrelated route, record the exact command and failure, prove it is unrelated, run the target's focused gates and `npm run build` separately, and continue the page pipeline when those pass. Do not edit the unrelated system or describe the repository-wide quality gate as passing.

### 10. Content and SEO plan

After the technical UI is stable, launch a fresh worker with `$stack127-tool-content-seo`. Permit only `writing-and-seo.md`: search intent, heading/media outline, metadata proposals, internal links, sources, limits, and stable `COPY-*` assignments.

Do not let this worker edit the route or draft final prose. Run the content-stage pipeline validator after review.

### 11. Simple page writing

Launch a fresh worker with `$stack127-tool-writing`. Use this writing direction in the prompt:

> Use `$stack127-tool-writing` with `$stack127-writing-voice` to write the supporting content from the approved content plan. Keep the intro problem-led and the tool first. Cover meaningful use, interpretation, limits, and next verification steps, using the format each question needs. Keep the shared voice in its own skill rather than restating it in this handoff.

Require complete coverage of what the tool is, how to choose meaningful inputs and use it for the real task, how to interpret the result, the concepts or syntax that commonly surprise users, honest limitations, local handling or privacy when true, and the next real verification step. Do not require identical headings across tools. Require appropriate tests, a short introduction before the tool, a server-rendered guide after it, shared prose styles, and no publication changes. Permit the scoped content-only development update through the reviewed command, page docs, and necessary route-owned styles, tests, and ownership updates. Keep `tool_version` unchanged for copy-only work. Require the worker to inspect two sibling tool pages and verify a real calculated result at desktop and narrow widths in both themes with the selected visual backend.

Read the rendered page without relying on internal reports and answer every completeness-contract question from `$stack127-tool-writing`. Return omissions to the writer. Remove duplicated result narration, mechanical button-click instructions, unnecessary headings, FAQs, methodology filler, and claims not supported by the ready artifacts. Return technical mismatches upstream. Send writing or responsive P0/P1 findings back to the writer and require regression tests.

### 12. Final page gates and visual handoff

Run:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=handoff
npm run test
npm run quality
```

Require the route-owned content tests, technical regressions, static policy, type check, and production build to pass. Restore guarded preview and publication state.

Then the main orchestrator agent must perform the final visual inspection itself. Prefer the in-app Browser: open the clean base route without serialized query state, make the Browser visible, calculate a real result, and inspect the complete page at desktop and narrow width in both themes. If no in-app Browser instance exists, run the same inspection with standalone Playwright, save the required screenshots/measurements, and report the CLI backend instead of claiming a visible tab. Check the introduction, primary action, answer scanability, guide rhythm, table overflow or reflow, internal links, and page width. Reset temporary viewport overrides and leave the clean page open only when the selected backend supports that handoff.

If the same proven unrelated repository failure remains, report it prominently, rerun the target's focused gates and `npm run build` separately, then continue the final visual handoff. Stop only when a target-owned gate, production build, P0/P1 finding, or required permission remains blocked.

### 13. Handoff and stop

Use `references/handoff-template.md`. Report the local URL, supported behavior, limitations, artifacts, tests, backend-labelled Browser or Playwright evidence, competitive position, P2 follow-ups, publication state, content structure, and any unrelated repository gate warning.

Explicitly confirm that the simple page content was integrated and state the actual visual backend and handoff form. Stop before publication, commit, push, or deployment.

## Completion rule

Call the page orchestration complete only when every stage artifact is ready, the technical tool and independent QA agree, P0 and P1 findings are closed, simple content is integrated and tested, all target-owned gates and the production build pass, the route remains unpublished, preview state is restored, and the main orchestrator leaves reproducible final visual evidence. Leave a clean page open in the in-app Browser when available; otherwise provide the standalone Playwright evidence and disclose the missing in-app handoff. Disclose any proven unrelated repository-wide gate failure without treating it as a page failure or silently calling the repository clean.
