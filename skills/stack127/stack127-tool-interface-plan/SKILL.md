---
name: stack127-tool-interface-plan
description: Plan the visible information model, controls, result hierarchy, states, responsive layout, and component use for one stack127 tool. Use for a new interface, substantial redesign, or unresolved interaction design. Do not implement the tool.
---

# stack127 tool interface plan

Decide what the user must see and control before implementation. Read the tool specification, current route and engine, `stack127_docs/tool-interface.md`, the design system, `app/tool-ui`, `/tool-ui-lab`, and two relevant sibling tools.

## Output

Update the `Inputs and actions`, `Results and states`, and `Interface` sections of `content_docs/<slug>/tool-spec.md`. Historical tools can keep an existing `interface-contract.md`; do not require a new separate contract for current work.

## Plan the interface

- Write the user's question and identify exactly one lead answer.
- Inventory available inputs, actions, derived values, evidence, caveats, and raw records.
- Mark each item as input, lead, supporting, evidence, or omitted.
- Keep one primary action.
- Give each visible result region a different user question.
- Remove repeated formatted facts and decorative status furniture.
- Decide clean URL, explicit sharing, reset, reload, history, stale-result, focus, keyboard, and announcement behavior.
- Create realistic desktop and narrow mobile arrangements with longest values.

For every nontrivial visible control or result, record whether it reuses a shared component, needs a new shared component, or stays route-specific for a behavioral reason. Native semantics may sit underneath, but a missing component does not permit a generic browser-looking fallback.

Every chart, bar, timeline, table, diagram, or large answer must truthfully encode the relationship it claims. Use plain values or lists when geometry adds no meaning.

Shared tests own the full theme and viewport matrix. The route plan requires one desktop and one narrow mobile verification. Add more cases only for route-specific visual behavior.

Mark the interface ready only when the builder can implement it without inventing controls, result regions, state behavior, or responsive order.
