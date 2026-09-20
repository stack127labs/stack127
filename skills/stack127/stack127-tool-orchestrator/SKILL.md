---
name: stack127-tool-orchestrator
description: Orchestrate one stack127 calculator, checker, converter, lookup, generator, explorer, or technical utility from competitor-led research through product and interface planning, test-first implementation, writing, content integration, one complete Sol audit with fixes, final quality gates, and a backend-accurate handoff. Use when the user asks to create or complete one stack127 tool page end to end and wants specialist subagents coordinated with feedback. Keep the route unpublished and stop before publication, commit, push, or deployment.
---

# stack127 tool orchestrator

## Model routing and source of truth

Record the selected main model explicitly in the task plan and every delegation handoff. The main agent creates every pipeline worker itself. Spawn Luna as `gpt-5.6-luna` with `reasoning_effort: "max"`; spawn Astra as `gpt-6-astra` with `reasoning_effort: "low"`, which is the Light setting in the Codex UI; spawn Sol as `gpt-5.6-sol` with `reasoning_effort: "high"`. Pass `fork_turns: "none"` unless a bounded stage needs a small stated context slice. Never omit the model or reasoning setting, rely on inheritance, substitute a model silently, or ask a worker to spawn another pipeline worker. Read `stack127_docs/tool-pipeline.md` for the canonical pipeline contract.

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
   - `skills/stack127/stack127-tool-content-integration/SKILL.md`;
   - `skills/stack127/stack127-tool-audit/SKILL.md`;
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
- Use one bounded Astra session for product planning followed by interface planning. Review and gate the product artifact before continuing that worker.
- Use one bounded Luna session for test design followed by test-first implementation. Review and gate the test contract before continuing that worker.
- Use one bounded Astra session for content planning followed by public wording. Review and gate the content plan before continuing that worker.
- Use a separate Luna session with `$stack127-tool-content-integration` for content, figure, route, and database integration.
- Use one Sol session for the complete-page audit, authorized fixes, and retesting. If the main agent finds a remaining issue, return it to that same Sol session.
- Keep dependency stages sequential. Do not start a downstream worker from draft or blocked inputs.
- Give workers the tool name, route, repository path, required skill path, input artifacts, allowed write scope, and exact stop condition. Do not give them the desired conclusions.
- Read every produced artifact and inspect every diff yourself. A worker saying “done” is not a gate.
- Return missing facts or decisions to the stage that owns them. Never let a downstream worker invent an upstream product decision.
- Classify review findings as P0, P1, or P2. Require P0 and P1 fixes and regressions before advancing. Record P2 items for handoff when deferral is safe.
- Use the available multi-agent controls to wait for workers, provide feedback, and continue them. Do not leave active workers running after completion or a blocker.
- The main orchestrator agent, not a worker, owns the final visual handoff. Use the in-app Browser when available; otherwise provide the reproducible standalone Playwright CLI evidence and explicitly disclose that no visible in-app tab was available.
- Every stage returns a feasibility verdict. Do not silently shrink a promise between stages. Record each requested outcome as feasible within its explicit contract or blocked, and name the evidence or upstream decision. A limitation belongs in the promise boundary; it is not a third status that lets incomplete work advance.
- Block a core promise that requires a new paid API, account, live-data crawler, scheduled refresh, background worker, queue, storage service, review operation, maintained dataset, or other unapproved ongoing system. Preserve independent finished work, stop dependent stages, and give the user two to four concrete decision options with the delivered behavior, cost or maintenance, and approval needed. Do not build the dependency or substitute a stale snapshot without the user's choice.
- Keep the tool's usage contract separate from the public guide. The content plan produces a `Usage Markdown handoff`; the Astra writing stage produces the actual `usage_markdown`; Luna integrates the approved guide. Track the handoff through rendered evidence, including ordered lists, bullet lists, definition lists, and registered `MarkerArt` figures.
- Record each worker's exact model, reasoning setting, and session identifier in `pipeline-acceptance.json`. A stated intention to use a model is not execution evidence.

## Workflow

### 1. Intake and preflight

Resolve the exact tool name, stable route, primary job, formula-versus-resolution contract, and current repository state. Default the route to unpublished. Check for duplicate tools and reusable route-family code.

Give the tool one flat canonical route, `/tool-slug`, with source under `app/(site)/(tools)/tool-slug`. Existing collections such as `/storage-tools`, `/dns-tools`, and `/domain-tools` are discovery surfaces, not URL parents. Add the tool to every collection it genuinely serves instead of choosing one permanent category. Inspect the flat route namespace for collisions and lock the slug before launching workers; no worker may rename or relocate it.

Run the inspector at intake:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=intake
```

Stop for user direction only when the route, product identity, authoritative technical basis, or required external side effect is materially ambiguous.

### 2. Competitor-led research

Launch a fresh worker with `model: "gpt-5.6-luna"`, `reasoning_effort: "max"`, and `$stack127-tool-research`. Require competitor discovery and operation first, followed in the same report by primary-source technical verification, formulas, data contracts, limitations, and feasibility. Require the selected Browser backend, SearXNG `bing,duckduckgo` search when configured, the competitor minimum or documented saturation, backend/viewport evidence, and only `competitive-report.md`.

Review evidence labels, URLs, wireframes, formula disagreements, mobile behavior, user pain, and rejected ideas. Return weak or incomplete research to the worker. Then run:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=research
```

### 3. Product contract

Launch one worker with `model: "gpt-6-astra"`, `reasoning_effort: "low"`, and `$stack127-tool-product-plan`. Require one decisive job, exact inputs and actions, formula or resolution truth, all visible states, desktop and narrow wireframes, result hierarchy, requirement IDs, ownership, and non-goals.

Reject plans that defer action semantics, responsive behavior, state restoration, invalid-result behavior, or result visualization to the builder. Run the inspector with `--expect=product` after review.

### 4. Interface contract

After the main agent accepts the product contract, continue the same Astra worker with `$stack127-tool-interface-plan`. Require one user question, one lead answer, an information inventory with explicit omissions, justified inputs and actions, distinct result-region questions, visual truth tests, all applicable states, realistic desktop and narrow wireframes, observable `UI-` requirements, and component provenance for every nontrivial control and result.

Reject contracts that start from available components, repeat a formatted fact, use a visual whose geometry does not encode the claimed relationship, leave hierarchy and responsive behavior to the builder, or permit a generic or native-looking fallback because a stack127 component is missing. A missing primitive must have an approved new shared or route-specific component contract. Run the inspector with `--expect=interface` after review.

### 5. Test contract

Launch one worker with `model: "gpt-5.6-luna"`, `reasoning_effort: "max"`, and `$stack127-tool-test-design`. Require exact P0/P1 cases, authoritative fixtures, requirement traceability, recovery behavior, accessibility, state, security, responsive, SEO, and performance coverage.

Return missing behavior to product planning instead of inventing it here. Run the inspector with `--expect=test` after review.

### 6. Test-first build

After the main agent accepts the test contract, continue the same Luna worker with `$stack127-tool-build`. Require ownership first, failing tests before production code, a pure technical core outside React, the ready interface contract, a guarded local preview, progressive tests, and no public page prose. The builder may not add a control, result region, explanatory sentence, or visualization that the interface contract rejected or did not justify.

Require the builder to compare the shell, page width, spacing, typography, and controls with at least two established sibling pages before styling. It must inspect `app/tool-ui` and `/tool-ui-lab`, reuse a suitable primitive, or implement the approved missing component with stack127 tokens, states, accessibility, and responsive behavior. Native elements may provide semantics underneath, but they may not become the visible generic browser UI unless the interface contract explicitly justifies that choice. Require explicit action semantics: inventory/edit actions must never replace the primary calculate/check/generate action.

Do not accept a builder report without focused test commands, results, visual states and backend checked, publication cleanup, and a diff summary.

### 7. Main-agent technical gates

Run:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=build
node skills/stack127/stack127-tool-build/scripts/validate-pipeline.mjs content_docs/<route> --tool-only
<route-owned focused tests>
npm run typecheck
npm run test:static
npm run build
```

Require all tool-owned P0 and P1 tests, focused fixtures, Browser checks, and the production build to pass. Restore guarded preview and publication state.

If a gate fails in an unrelated route, record the exact command and failure and keep final acceptance blocked. Do not edit unrelated work without authorization or describe the repository-wide gate as passing.

### 8. Content and SEO plan

After the technical UI is stable, launch one worker with `model: "gpt-6-astra"`, `reasoning_effort: "low"`, and `$stack127-tool-content-seo`. Permit only `writing-and-seo.md`, including its `Usage Markdown handoff`: search intent, heading/media outline, metadata proposals, internal links, sources, input and output facts, and limits.

Do not let this worker edit the route or draft final prose. Run the content-stage pipeline validator after review.

### 9. Public wording

After the main agent accepts the content plan, continue the same Astra worker with `$stack127-tool-writing` to generate the public wording. Use this writing direction in the Astra prompt:

> Use `$stack127-tool-writing` with `$stack127-writing-voice` to write the supporting content from the approved content plan. Keep the intro problem-led and the tool first. Cover meaningful use, interpretation, limits, and next verification steps, using the format each question needs. Keep the shared voice in its own skill rather than restating it in this handoff.

Require complete coverage of what the tool is, how to choose meaningful inputs and use it for the real task, how to interpret the result, the concepts or syntax that commonly surprise users, honest limitations, local handling or privacy when true, and the next real verification step. Do not require identical headings across tools. Astra generates words only. It does not implement, use a browser, run tests, or write to the database.

Review the exact draft against the approved plan and the completeness contract in `$stack127-tool-writing`. Return omissions to Astra. Remove duplicated result narration, mechanical button-click instructions, unnecessary headings, FAQs, methodology filler, and claims not supported by the ready artifacts. Return technical mismatches upstream.

### 10. Content and figure integration

After the main agent approves Astra's exact words, launch one worker with `model: "gpt-5.6-luna"`, `reasoning_effort: "max"`, and `$stack127-tool-content-integration`. Require exact-content application in development, safe figure registration, route and database integration, appropriate tests, current hashes and revision evidence, and complete rendered verification at desktop and narrow widths in both themes. Luna may correct integration defects but must return factual or editorial changes to Astra through the main agent.

Read the rendered page without relying on internal reports and answer every completeness-contract question from `$stack127-tool-writing`. Return writing omissions to Astra and integration defects to Luna.

### 11. Complete Sol audit, fixes, and retesting

After content integration, launch one Sol worker with `model: "gpt-5.6-sol"`, `reasoning_effort: "high"`, and `$stack127-tool-audit` against the complete page. This one audit covers technical correctness, tests, interface behavior, Browser states, accessibility, usage guide, supporting content, media, responsiveness, database state, and completion evidence. The first pass preserves reproducible findings. Continue the same Sol session for every authorized fix and require it to rerun affected tests, flows, widths, and themes after each fix batch.

The main agent then inspects the findings, diff, test output, and current target. If it finds a remaining issue, send one evidence-backed correction batch to the same Sol session and repeat the affected checks. Do not start another audit or verification worker.

### 12. Final page gates and visual handoff

Run:

```bash
node skills/stack127/stack127-tool-orchestrator/scripts/inspect-tool-pipeline.mjs <route> --expect=handoff
npm run quality
```

Require the route-owned content tests, technical regressions, static policy, type check, and production build to pass. Restore guarded preview and publication state.

Then the main orchestrator agent must perform the final visual inspection itself. Prefer the in-app Browser: open the clean base route without serialized query state, make the Browser visible, calculate a real result, and inspect the complete page at desktop and narrow width in both themes. If no in-app Browser instance exists, run the same inspection with standalone Playwright, save the required screenshots/measurements, and report the CLI backend instead of claiming a visible tab. Check the introduction, primary action, answer scanability, guide rhythm, table overflow or reflow, internal links, and page width. Reset temporary viewport overrides and leave the clean page open only when the selected backend supports that handoff.

If a proven unrelated repository failure remains, report it prominently and rerun the target's focused gates and `npm run build` separately, but keep the final acceptance record blocked until every required gate passes.

### 13. Handoff and stop

Use `references/handoff-template.md`. Report the local URL, supported behavior, limitations, artifacts, tests, backend-labelled Browser or Playwright evidence, competitive position, P2 follow-ups, publication state, content structure, and any unrelated repository gate warning.

Before calling the pipeline complete, run `scripts/stack127/tool-pipeline/validate-acceptance.mjs` against `content_docs/<slug>/pipeline-acceptance.json`. The acceptance artifact must identify actual stage models, reasoning settings, and sessions, current code and database evidence, feasibility verdicts, the `Usage Markdown handoff` and approved `usage_markdown`, media and list traceability, and distinct blocked versus not-verified items. Do not claim guide migrations or pilots passed unless the source-of-truth document records that evidence.

Explicitly confirm that the simple page content was integrated and state the actual visual backend and handoff form. Stop before publication, commit, push, or deployment.

## Completion rule

Call the page orchestration complete only when every stage artifact is ready, the technical tool and independent QA agree, P0 and P1 findings are closed, simple content is integrated and tested, every required gate and the production build pass, the route remains unpublished, preview state is restored, and the main orchestrator leaves reproducible final visual evidence. Leave a clean page open in the in-app Browser when available; otherwise provide the standalone Playwright evidence and disclose the missing in-app handoff.
