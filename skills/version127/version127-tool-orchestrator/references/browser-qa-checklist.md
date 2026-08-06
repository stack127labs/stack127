# Browser QA checklist

## Contents

1. Setup and evidence
2. Complete user flow
3. Responsive and visual checks
4. Accessibility and state
5. Competitive re-review
6. Pass criteria

## Setup and evidence

- Read the complete installed Browser skill before operating pages.
- Use the guarded local preview for unpublished routes and record how it will be restored.
- Record route, timestamp, viewport, theme, input, expected state, observed state, screenshot when useful, bounding boxes, and scroll widths for failures.
- Inspect at 320px, 375px, 760px, and a normal desktop width in dark and light themes.
- Compare page width, shell, spacing, typography, controls, and content order with at least two established sibling pages.

## Complete user flow

Exercise every applicable state:

- clean first load with a stable URL and no automatic serialized-state query;
- valid primary configuration;
- invalid text, bounds, units, and impossible combinations;
- mixed sizes, reordered items, auxiliary roles, and maximum supported inventory;
- add, remove, edit, reset, primary submit, repeat submit, and keyboard submit;
- reload, back, forward, malformed state, restored state, and explicit share if supported;
- loading, partial, timeout, retry, no-data, or upstream failure for resolution tools;
- longest result, command, label, legend, percentage, and translated-like string.

Inventory actions and the primary action must remain separately visible and semantically distinct. Adding an item must never calculate, and calculating must never remove the ability to add a differently sized item.

## Responsive and visual checks

For every target width:

- calculate a real result before judging layout;
- measure document, page container, tool frame, form, result, grid, table, chart, and legend scroll widths;
- fail clipped children even when an ancestor hides overflow;
- keep `min-width: 0` at required flex and grid boundaries;
- keep related capacity, unit, role, and remove controls aligned with at least 44px touch targets;
- keep every result label, value, percentage, and unit visible without page-level horizontal scrolling;
- reflow dense tables into labelled rows when columns cannot fit;
- confirm exact charts and color segments match the numbers;
- use semantic colors with sufficient contrast and redundant labels, patterns, or text so color is not the only signal;
- make the primary answer the strongest useful element;
- reject nested-card dashboards, unreadable grayscale, decorative clutter, oversized inputs, and helper-copy walls.
- after writing, confirm the introduction is short, the tool still dominates the page, paragraphs have calm consistent spacing, tables scroll or reflow without page overflow, and supporting content does not repeat the live result;

Apply a two-second scan:

1. Is the required input obvious?
2. Is the primary action visible without guessing?
3. Is the answer immediately identifiable?
4. Does the visualization explain the relationship?
5. Can the user find the next corrective action after an error?

## Accessibility and state

- Verify keyboard order, visible focus, Enter behavior, Escape only where expected, and no keyboard traps.
- Verify labels, descriptions, grouped controls, error association, headings, tables, and result reading order.
- Verify live announcements without duplicate or noisy output.
- Check zoom, reduced motion, high-content states, and touch target size.
- Ensure an invalid current input clears or marks a stale result; never leave a plausible answer active.
- Ensure URL updates are intentional. Keep the base route clean; serialize state only for an explicit share or documented restoration action.
- Ensure copy, share, reset, and recovery feedback is visible and non-destructive.

## Competitive re-review

Operate the strongest relevant competitors again and compare:

- time to first trustworthy answer;
- required input effort and defaults;
- action clarity;
- depth and scanability of the result;
- technical transparency and provenance;
- advanced and mixed configurations;
- mobile and keyboard behavior;
- privacy and URL state;
- limitations stated honestly.

Return technical and interaction gaps to the builder. Return missing, unclear, repetitive, or overly long explanations to the writer. Do not add an FAQ or another section merely because a competitor has one.

## Pass criteria

Pass only when no P0 or P1 finding remains, all values are visible at every target width in both themes, the complete primary workflow succeeds by pointer and keyboard, invalid state cannot coexist with a credible result, the simple content remains readable without page-level overflow, and the complete page matches the established version127 shell.
