---
name: stack127-tool-interface-design
description: Design or refine a stack127 interactive tool by reasoning from its user task, information shape, and real states. Use for calculators, checkers, lookups, generators, explorers, and utilities when hierarchy, controls, results, responsiveness, or usability need work. Preserve the tool engine and public content unless the request changes them.
---

# stack127 tool interface design

Design the tool as an instrument, not a decorated form. The interface should make the next action and the answer clear before it explains anything.

Use this skill for implementation-level refinement and small corrections. Before a new tool or substantial redesign, use `$stack127-tool-interface-plan` to complete the interface sections of `tool-spec.md`, then apply this skill against that plan. Historical routes may keep an existing `interface-contract.md`. Do not let the implementation pass privately redefine what the tool shows.

## Read before designing

1. Read `AGENTS.md`.
   Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` when writing or reviewing labels, actions, results, errors, or accessibility text. Use its interface tone; it does not authorize extra helper copy or changes to supporting page content.
2. Read `stack127_docs/design-system.md`, `stack127_docs/css-architecture.md`, and `stack127_docs/tool-interface.md`.
3. Read the route, its styles, ownership manifest, tests, and page docs. Treat the current `tool-spec.md` or historical `interface-contract.md` as binding for visible inventory, omissions, result regions, visual semantics, and responsive order.
4. Read `skills/stack127/test-driven-page/SKILL.md` before changing a route.
5. Inspect the rendered tool and operate every reachable state.

The repo's design system wins over outside patterns. Keep the established palette, type, 2px radius, workbench layout, and component language.

## Start with the task, not the components

Moving an existing interface onto shared components is not a redesign. Decide the task flow, information order, and result composition first. Then use shared components where their behavior fits.

For small changes without a contract, make a private interface map:

- What question brought the person here?
- What is the minimum input needed?
- Which action produces the answer?
- What must they understand first in the result?
- What evidence, settings, or recovery belongs later?
- How large can every real value become?

Use that map to set the reading order. Do not expose the map as helper copy. Show it through position, spacing, alignment, type, and control choice.

For a substantial change, stop after the map and hand it to `$stack127-tool-interface-plan`. Implementation starts only after the contract is ready and independently reviewable.

## Match the format to the information

Choose a result pattern from the structure of the answer.

| Information shape | Preferred treatment |
| --- | --- |
| One conclusion or number | A clear lead answer |
| A small set of unlike facts | Aligned key and value rows |
| Many items with the same fields | A table or repeated rows |
| Exact comparison or change | A clean chart |
| A relationship, path, or dependency | A diagram or sequence |
| A finite state | A short label and value |
| Raw evidence | A disclosure after the readable result |

These are starting points, not templates. Combine them only when each part answers a different question. Do not turn every fact into a card, every result into prose, or every empty space into art.

Before adding another result region, name the new question it answers. If it only repeats a value already visible, remove it. Compare values as the user sees them, not only by their raw representation. Two timestamps that render as the same calendar date must not produce a comparison block with two identical dates.

Use a timeline only when position or spacing communicates real time. A conditional process with variable or unknown durations is not a time axis. Show it as an ordered stage list or table with explicit duration and consequence instead of evenly spaced dots.

The first result should answer the user's question. Supporting values come next. Raw data and source metadata come last.

## Plan the space before styling it

- Check the available width beside the real sidebar at every breakpoint.
- Size layouts with the longest realistic labels, values, and row counts.
- Put regions side by side only when each keeps enough width for its job.
- Stack regions deliberately when the width budget fails. Do not wait for accidental wrapping.
- Keep overflow inside the content that needs it. The page itself must not scroll sideways.
- Open every disclosure and expandable result while checking width. Collapsed content does not prove that its open state fits.
- Test preformatted output, code, URLs, hashes, and other long unbroken values. They must wrap or scroll inside their owner without widening the page.
- Do not let actions or metadata cover, squeeze, or truncate the primary result.
- Use truncation only when the complete value remains easy to reach.

A screenshot is not enough. Check element bounds, scroll containers, focus order, and the actual content at desktop and mobile widths.

## Design controls around decisions

- Keep one primary action.
- Keep labels visible. A placeholder is an example, not a label.
- Mark required fields visually and programmatically.
- Use the control whose native meaning matches the decision.
- Show a few important choices directly. Use a select for a bounded list and a combobox for a list worth filtering.
- Join values and units when they form one decision.
- Put only optional advanced or rare settings behind a specific disclosure.
- Keep every required or defaulted result-driving input visible. Technical complexity is not a reason to conceal an active assumption.
- Put errors at the narrowest useful scope and show each error once.
- Keep client-side field validation inside the form. Focus the first invalid field; do not create an error result region or a `Fix input` button that only returns to a field already identified by the form.
- Align actions with controls, not with labels or helper text.
- Reserve explicit grid rows for labels, controls, and errors when an action sits beside a field. An appearing error must not push the adjacent action below the control.

Inspect `app/tool-ui`, `/tool-ui-lab`, and relevant sibling tools before implementing a control. Reuse a shared component when its behavior matches. If no suitable component exists, follow the ready interface contract and build the approved shared or route-specific stack127 component with complete states, accessibility, recovery, tokens, and responsive behavior. Extend or add a shared component when at least two tools need the same semantic behavior. Keep unique presentation in the tool.

Do not expose an unstyled native control, generic browser upload box, generic dashboard pattern, or unrelated third-party component because the needed primitive is missing. Native elements may preserve semantics underneath the visible stack127 interaction. If a substantial change has no missing-component decision, return it to `$stack127-tool-interface-plan` instead of improvising.

Shared controls may expose an outer placement class or slot so a page can position them in its layout. That hook must not become a way to restyle the control's internal typography, radius, states, or spacing contract.

## Use less text with judgment

- Remove text that repeats a title, label, action, selected value, or visible result.
- Keep text that prevents a likely mistake, states a real limitation, or explains an unfamiliar consequence.
- Prefer a compact label and value for bounded states.
- Move background explanation below the workbench when it is still useful.
- Keep validation and recovery instructions next to the problem.

Less text is useful only when the task becomes clearer. Do not remove labels, errors, caveats that change the answer, or accessibility text.

## Preserve behavior and design every state

Do not change formulas, lookup behavior, data contracts, API semantics, publication state, or database content unless the request includes that work.

Protect existing behavior with tests. Cover initial, invalid, loading, success, empty, partial, failure, disabled, and recovery states when the tool can reach them. Preserve valid input after failure. Announce asynchronous results. Focus the first invalid field after submission.

A copy action must not report success merely because its promise completed. Test the clipboard path and fallback result. When neither succeeds, keep the source value reachable and show one local failure state.

Treat the clean canonical URL as part of the initial state. Hydration must not add query parameters or replace browser history to serialize defaults or a derived result. Read an explicit query string when the tool supports shared state. Write one only from the documented user action, preferably an explicit Share action, or after a deliberate state change when URL persistence is itself part of the task.

## Examples, not universal rules

- A calculator with one total and a short breakdown may need a lead number followed by key and value rows.
- A lookup returning many objects with the same fields may need a table. Secondary actions can sit above or below it if sharing the row would make the data unreadable.
- A checker with three possible outcomes may need one status value. Explanatory prose belongs nearby only when the short value could mislead.

Do not copy an example's nouns or layout into another tool. Repeat the reasoning.

## Finish gate

Do not call a redesign complete from code review or automated assertions alone. Use browser interaction to complete the primary task, trigger validation and failure, open every disclosure, and inspect real results.

Render and operate the finished tool at desktop and mobile widths in dark and light themes. Verify:

- the input, primary action, and answer are clear at a glance;
- visual weight follows the user's task;
- every result region answers a distinct question and visible facts are not repeated without a relational reason;
- every required or defaulted result-driving input is visible before submission, and changing each one has a tested observable effect;
- real long content does not overlap, clip, or create page-level overflow;
- every expandable region remains contained when open;
- tables, charts, and repeated rows remain readable and reachable;
- controls keep consistent height, type, radius, focus, hover, loading, disabled, and error behavior;
- every nontrivial control matches its approved component provenance, with no generic fallback or page-local copy of a suitable shared primitive;
- keyboard order and focus remain clear;
- every supported state keeps the same hierarchy;
- opening the clean canonical route leaves the URL unchanged through hydration;
- relevant tests and quality gates pass.

Fix what the render reveals. When a review finds a problem, add a general skill rule only if the lesson applies across different kinds of tools. Put page-specific behavior in that page's docs and tests.
