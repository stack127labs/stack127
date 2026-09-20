---
name: stack127-tool-interface-plan
description: Create a plan-only interface contract for a new or existing stack127 tool before implementation. Use when deciding inputs, actions, result hierarchy, component choices, visual formats, state behavior, responsive layout, and what to omit. Do not implement the tool.
---

# stack127 tool interface plan

Decide what the tool should show before anyone writes UI code. Produce a contract that a builder can implement without inventing the information model.

## Pipeline role and model routing

In the full tool pipeline, the main orchestrator continues the same `gpt-6-astra` worker used for product planning, with `reasoning_effort: "low"`, shown as Light in Codex. The main agent must accept the product gate before this skill starts. This worker never starts another pipeline worker or implements, tests, or browser-reviews the tool. Read `stack127_docs/tool-pipeline.md` for the artifact and acceptance contract.

## Output and boundary

Write only `content_docs/<route>/interface-contract.md` using [references/interface-contract-template.md](references/interface-contract-template.md). Do not edit route code, components, tests, public prose, database rows, or publication state.

Use one of two modes:

- `pipeline` for a new tool with a ready `implementation-report.md` and `brief.md`;
- `retrofit` for an existing working tool that needs a cleaner interface while keeping its engine and public content intact.

Return any unresolved product behavior, formula, data-source, or scope decision to the user or product-planning stage. Do not hide it inside a layout choice.

## Read and inspect

1. Read `AGENTS.md`, `stack127_docs/design-system.md`, `css-architecture.md`, and `tool-interface.md`.
   Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for proposed labels, actions, results, and state messages. It governs wording without changing this skill's information-design decisions or plan-only boundary.
2. Read the page brief, route, styles, tests, engine, API or data types, and ownership manifest.
3. In pipeline mode, require a ready `implementation-report.md`. Run the product-stage validator and stop if it fails.
4. In retrofit mode, operate the current tool before planning. Exercise normal, invalid, loading, empty, partial, failure, long-value, and expanded states that exist.
5. Inspect `app/tool-ui`, `/tool-ui-lab`, and at least two relevant sibling tools, but do not start by selecting components.

Preserve technical behavior unless the request explicitly changes it. The current UI is evidence, not a design contract.

Shared components are vocabulary, not a checklist. The template's rows and examples are structural prompts, not required content. Never carry a field, status, metric, timeline, table, or domain-specific concept into another tool simply because an example or sibling used it.

## Decide the information model

Include a feasibility verdict for the proposed interface and media: `feasibility: feasible` or `feasibility: blocked`. Preserve the product promise and name unsupported states or evidence. Choose one optional-mode treatment where relevant: `single mode`, `disclosure`, or `basic/advanced`. Keep one engine underneath, give the default meaningful evidence, keep active custom settings visible, reveal invalid hidden settings, and label beginner and advanced choices plainly.

Write the user's question as one sentence. Then inventory every available input, action, derived value, source fact, status, caveat, and raw record.

Assign each item one disposition:

- `input`: required to produce or refine the answer;
- `lead`: the one answer the user came for;
- `supporting`: changes how the lead answer is understood or acted on;
- `evidence`: verifies the answer but does not compete with it;
- `omit`: available to the system but not useful in the tool interface.

Exactly one item is the lead. Every visible result region must answer a different user question. If two regions answer the same question, keep the clearer one. Compare formatted values as the user sees them, so equivalent visible values do not create duplicate comparison UI.

Do a removal pass before choosing layout. Record what the existing tool or upstream plan contains that the builder must remove or avoid.

For every item marked visible, ask whether removing it would prevent input, change the answer, block the next decision, remove recovery, or hide necessary evidence. If none applies, omit it.

## Design the input

For each input or action, decide:

- why the user must control it;
- whether it is required, defaulted, derived, optional, or removed;
- whether it changes the lead answer and where any default comes from;
- whether it stays visible, appears conditionally, or belongs in a disclosure;
- the native interaction it represents;
- the stack127 component that preserves that interaction;
- its order, grouping, validation, focus, keyboard behavior, and narrow layout.

After the information model is stable, complete the component provenance table. For every nontrivial control and result, name the inspected existing component and choose one disposition: `reuse shared`, `new shared`, or `route-specific`. A new component contract defines anatomy, states, keyboard and screen-reader behavior, validation and recovery, responsive behavior, and token use. A route-specific choice needs a behavioral reason; page ownership alone is not a reason.

Do not choose an unstyled native control, generic browser upload box, generic dashboard pattern, or unrelated third-party component because a stack127 primitive is missing. Native semantics may remain underneath a designed stack127 control. An upload contract, for example, covers browse and drag/drop behavior, file status, validation and rejection, remove and retry, real progress when available, focus, announcements, and narrow layout. If the required component cannot be designed and built within the approved scope, set `Status: blocked` instead of specifying a generic fallback.

Keep one primary action. Do not expose an option merely because the engine accepts it. Do not hide a required decision behind a disclosure.

A default is still an input when it changes the answer. Keep required and defaulted result-driving inputs visible even when they are technical or uncommon. A disclosure may contain an optional refinement whose disabled state has no effect, optional evidence, or diagnostics. It must not conceal an active assumption that silently changes the lead answer. When a conditional choice becomes required, show it in the main flow at the point where that condition is selected.

Contract URL state explicitly. Opening the clean canonical route must leave the address unchanged through first render and hydration. A tool may read an explicit query string, but it must not serialize defaults, derived state, or an initial result into a clean URL. If shareable state is useful, prefer an explicit Share action; otherwise allow URL updates only after the user changes state, and say why persistence is part of the task.

## Design the result

Set the reading order before styling:

1. one lead answer;
2. only the supporting relationships needed to interpret or act on it;
3. verification or raw evidence;
4. quiet source and timing metadata.

For each proposed region, state its unique question, data, format, and omission guard. A component name is not a reason for the region to exist.

Run a truth test on every visual:

- A timeline needs a real time axis. Equal spacing must not imply equal duration unless that is true.
- A progress bar needs a meaningful start, end, and denominator.
- A chart needs an exact comparison or change encoded by its geometry.
- A table needs repeated items with the same fields.
- A diagram needs a relationship or dependency that is faster to understand visually.
- A large answer needs one conclusion worth making dominant.

When the truth test fails, choose a plain value, ordered list, key/value rows, or omit the visual.

Finish the result plan by reading only the wireframe, without the internal reports. State the answer in one sentence and what each region uniquely adds. If that is difficult, revise the contract before validation.

## Plan states and space

Contract the initial, invalid, loading or calculating, success, empty or no-data, partial, failure, retry, and expanded states that apply. State what remains visible, what becomes stale, where recovery appears, and what receives focus or announcement.

Create desktop and narrow mobile wireframes with realistic longest values. Budget the width beside the real sidebar. Name the owner of any necessary overflow. The page itself never owns horizontal overflow.

## Readiness gate

Set `Status: ready` only when:

- the user question and one lead answer are singular;
- every input and visible result has a reason;
- every required or defaulted input that changes the lead answer stays visible;
- every visible region answers a distinct question;
- duplicate facts and rejected UI are recorded;
- every visual passes the truth test;
- component choices follow the information model rather than define it;
- every nontrivial control and result has component provenance, and every missing primitive has a complete stack127 component contract;
- generic or native-looking fallback is rejected; an intentionally visible native element must still follow the stack127 visual and behavior contract and must not be used merely because a shared primitive is missing;
- important states, mobile order, long values, and expanded content are specified;
- the clean canonical route remains unchanged through hydration, with any later URL persistence tied to an explicit user action;
- the builder can implement the wireframes without making a new product or information-design decision;
- `UI-` acceptance criteria are observable.

Otherwise set `Status: blocked` and name the missing decision.

Run:

```bash
node skills/stack127/stack127-tool-interface-plan/scripts/validate-interface-contract.mjs content_docs/<route>
```

Stop after the contract and validation result.

When used in a pipeline, record the actual Astra model, `low` reasoning, and session through the orchestrator. The interface feasibility verdict and optional-mode decision must appear in the accepted evidence.
