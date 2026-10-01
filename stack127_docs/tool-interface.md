# Tool interface system

Use [writing-style.md](writing-style.md) for all interface wording and visual choices.

stack127 tools should feel like focused instruments. A person should see what to enter, what to press, and what the answer means without reading a manual first.

This document is the source of truth for tool layout, control hierarchy, and shared interaction patterns. `stack127_docs/design-system.md` still owns sitewide color, type, radius, spacing, and theme rules.

## Start with the task

Before changing a tool, reduce its user flow to five parts:

1. The question the person came to answer.
2. The minimum input needed to answer it.
3. The one action that produces the answer.
4. The first result the person needs to see.
5. Optional detail, verification, or recovery.

The interface should follow that order. Do not give introductory copy, secondary settings, or implementation details more visual weight than the task.

## Plan before implementation

Every new tool and every substantial redesign needs a ready Interface section in `content_docs/<tool-slug>/tool-spec.md` before UI code changes. Create it with `skills/stack127/tools/stack127-tool-interface-plan/SKILL.md`. A small correction may proceed without revising the section only when it does not change the visible input set, result regions, hierarchy, visual format, or responsive order.

The interface contract must decide:

- the one user question and one lead answer;
- which available facts are inputs, supporting context, evidence, or omitted;
- why each control and result region exists;
- which formatted facts must not repeat;
- whether each proposed visual encodes a truthful relationship;
- behavior for real states, long values, desktop, and narrow screens;
- observable `UI-` acceptance criteria.

In the full tool pipeline, the Opus planning session plans the interface and later builds the frontend itself, on top of the backend Luna builds. It does not add controls, result regions, explanatory sentences, or visualizations outside the reviewed plan without updating the spec. The independent audit judges the rendered result without relying on the builder's explanation.

## Reading order

A tool page has three visual levels:

- Page header: identity icon, tool name, and at most one short sentence when the name does not explain the job.
- Workbench: required inputs, one primary action, status, and results.
- Supporting content: interpretation, limitations, and related checks after the workbench.

Inside the workbench, the eye should find the primary input before the primary action, and the answer before supporting data. Direct the eye with position and spacing first, size and weight second, and accent last.

## Remove text without removing clarity

- Keep visible labels. Placeholder text is an example, never the only label.
- Default to no helper text inside the workbench. Add it only when it prevents a likely error, explains a hidden consequence, or clarifies an unfamiliar value that the label and control cannot express.
- Remove sentences that repeat a field label, button label, heading, or visible result.
- Do not describe familiar providers, options, units, or control behavior below a field. That information belongs in the supporting content when it is still useful.
- When essential field guidance earns its place, keep it brief and beside the field. Do not add a paragraph above the form for it.
- Show common choices directly. Put optional advanced or uncommon choices behind a clearly named disclosure.
- Use a diagram, relationship, scale, timeline, table, or grouped result when it communicates faster than prose. Do not replace one sentence with decorative art.
- Results begin with the answer. Method, provider, timing, and raw data follow it.

Less text never means unlabeled controls, unexplained errors, hidden limitations, or icon-only mystery actions.

## Workbench structure

The workbench is the full-width band defined in `stack127_docs/design-system.md`. Its background and top and bottom rules span the entire main column beside the sidebar. Its interactive contents align to a calm inner measure.

Use this structure when the tool permits it:

```text
required input or query
visible common choices
secondary settings, only when needed
primary action   quiet secondary action
-----------------------------------------
answer
visual or structured result
verification and metadata
```

Do not wrap the form, action area, result, table, or visualization in separate nested cards. Use alignment, space, and a single divider to establish groups.

On wide screens, fields may share a row when they belong to one decision. Do not use columns only to fill empty width. On narrow screens, preserve the task order and stack controls without shrinking their hit areas.

When a select or input shares a row with its primary button, align the button with the control itself. The label stays above the control and must not push the action out of line. On narrow screens, stack the button below the control at full width.

## Control rules

All bounded controls use `--radius`, which is 2px. Controls use `--text-body`, the shared focus ring, and the site color tokens. They should be compact enough for technical work without dropping below a comfortable pointer target.

### Buttons

- Primary: one per workbench state. Use the accent fill and name the result, such as `Look up DNS` or `Calculate capacity`.
- Secondary: bordered surface for useful adjacent actions such as reset, copy, download, or load example.
- Ghost: unboxed action for low-priority, reversible operations.
- Icon-only: only for a familiar action in tight space. It requires an accessible name and a visible tooltip when the icon can be ambiguous.
- Loading: retain the button width, state what is happening, and prevent duplicate submission.
- Disabled: use only when the reason is apparent. Prefer an enabled submit that reveals precise validation when that is clearer.
- Copy: report success only after the clipboard API or a verified fallback succeeds. If both fail, keep the source value selectable and show one local failure state.

Do not give primary styling to reset, share, copy, download, or navigation actions.

### Text, search, and numeric fields

- Use a persistent label and a realistic example when an example helps.
- Mark every required field with a visible `*`; keep the required state programmatic as well.
- Choose the correct input type, input mode, autocomplete behavior, capitalization, and spellcheck.
- Use `UiNumberField` when whole or decimal values benefit from keyboard-safe increment and decrement buttons.
- Join a value and its unit into `UiQuantityField` or `UiQuantityInput`. They are one decision, so they should not float as unrelated controls.
- Units belong in the adjoining unit selector or a fixed suffix, not in helper paragraphs.
- Search fields search or filter a collection. Do not call a single-value lookup field search merely because it has a magnifying-glass icon.
- Put errors directly below the field and focus the first invalid field after submission.
- Render a validation or request error once at the narrowest useful scope. Do not repeat the same message below a field, above the action, and in the result area.
- Field validation does not create a result. Do not add an error result panel or a `Fix input` button when the interface can show the error beside the field and move focus there. Use a retry action only for a failed request or operation the person can repeat without changing the input.
- When a field and action share a row, reserve separate label, control, and error rows. An appearing error must not move the action out of alignment with the control.

### Selects and visible choices

- Use `UiSelect` for bounded choices. It renders the stack127 trigger and listbox while retaining a visually hidden native select for mobile and form accessibility.
- Use `UiComboBox` only when the person benefits from filtering a longer option set by typing.
- Use a compact radio or segmented row when seeing all common options helps the decision.
- Keep the real radio semantics and one shared hit target for each label and control.
- A selected option uses stronger contrast and the permitted accent treatment. Unselected options remain quiet.
- Do not use a dropdown to hide two or three important choices.

### Checks and switches

- Use a checkbox for an independent choice or a group where several items may apply.
- Use a switch only when changing it takes effect immediately. A setting submitted with a form is a checkbox.
- Write labels as the state or choice, not as instructions to click the control.

### Disclosures

- Advanced sections must say what is inside, such as `Resolver settings`, not `More options`.
- Keep values chosen inside a collapsed disclosure visible in a short summary.
- Never hide required fields, the primary action, an error, or the main result.
- Never hide a defaulted input that changes the main answer. A prefilled value is an active assumption, not permission to conceal it.
- A disclosure may contain optional refinement whose off state has no effect, optional evidence, or diagnostics. If enabling an option makes another field required, reveal that field in the main flow beside the enabling choice.
- Change every result-driving input during testing and verify the answer changes as documented. If it does not, remove the control or document the non-result behavior it owns.

### Optional Basic and Advanced modes

Record one control-mode decision for every tool: `single`, `disclosure`, or `basic-advanced`. Use a single mode unless a complete common task can run with a small, explicit set of assumptions and a distinct group of refinements would otherwise overwhelm that task. A disclosure keeps one mode. It is appropriate for optional evidence or refinement, while active result-driving assumptions remain visible.

Basic and Advanced use the same engine and normalized input contract. Basic shows every active assumption that affects the answer, including its source and an edit path. Advanced exposes the additional controls. A simpler screen must not mean a different calculation or a hidden default.

When someone switches modes, retain their values. If customized Advanced values stay active in Basic, show a concise customized-assumptions summary with an edit action. Replacing them with Basic defaults requires an explicit reset. If a hidden value becomes invalid, reveal its control, move focus to it, and announce the error. Never leave the user with an error they cannot see or repair.

The interface contract must define labels, mode explanation, input mapping, Basic assumptions and sources, value retention, reset, invalid-state recovery, focus and announcement, and URL, reload, back, and forward restoration. Tests must prove that equivalent normalized inputs return the same result in both modes and cover both switching directions with custom, invalid, and restored state. Do not add modes only to make a crowded form look shorter.

### Repeated rows and add actions

- Put `Add` beside the group heading when it creates another group. Put it after the current rows when it appends a row to that group.
- Focus the new row's first useful control after adding it. Return focus to a stable nearby action after removing the focused row.
- Keep row actions in a fixed final column. Do not let long input values push remove, duplicate, or reorder actions onto an accidental second line.
- On narrow screens, preserve row order and use an authored breakpoint. Do not wait for the browser to wrap controls unpredictably.

## Result hierarchy

Results should answer before they document.

1. One plain answer or status at `--text-body` or an appropriate heading size.
2. The useful visual relationship or structured values.
3. Raw records, calculation steps, or diagnostic detail.
4. Provider, timing, version, and source metadata in `--text-small`.
5. Next action only when it helps verify or continue the task.

Do not place every fact in an equal card. Group related facts and make the main finding visually dominant. Use tables for repeated fields, clean charts for exact comparisons, and marker art only for conceptual relationships.

Each result region must answer a different question. Do not repeat a visible value in a second metric row, card, or summary unless the second view communicates a necessary relationship. Compare the formatted values the reader sees. If two source timestamps display as the same date, do not render an identical two-value comparison.

Use a timeline only when its axis represents time. Do not place variable, conditional, or unknown stages at equal distances on a line. Use an ordered stage list or table that names each duration and consequence.

A repeated-field table needs enough width for its schema and real values. Place it beside another region only when both remain readable with long content. Otherwise stack the regions deliberately. On narrow screens, a table may scroll inside its own viewport, but sibling content must never cover a column or force page-level overflow.

When a result maps to a small fixed set of states, show one label and one value instead of a paragraph. Put the longer caveat in supporting content or an accessible description when the visible value remains accurate on its own.

## States are part of the design

Every tool must deliberately handle the states that can occur:

- initial;
- incomplete or invalid input;
- loading;
- success;
- empty or no match;
- partial result;
- service or network failure;
- retry or recovery;
- disabled controls;
- long content and narrow screens.

Status changes must be announced to assistive technology. A failure names the problem and the next useful action. Do not clear valid input after a failure.

### URL state

The canonical route is the initial state, not a blank query string waiting to be filled. Opening a clean tool URL must leave it unchanged through server render and hydration. Never call `replaceState` or `pushState` on mount to serialize defaults, derived values, or an initial result.

A tool may restore state from a query string that the person explicitly opened. When shareable state is useful, prefer an explicit Share action that creates or copies the stateful URL. If a tool updates the URL as the person edits, that persistence must be part of the documented task and must begin only after a deliberate user change.

## Shared component direction

Prefer a small semantic component layer over tool-specific visual copies. Components should preserve native HTML behavior and accept ordinary labels, descriptions, errors, and state props.

Shared fields may accept an outer placement class so an owning tool can put them into an explicit grid or subgrid. Page styles may position the component, but must not replace its internal control styling.

### Missing components

Planning must inspect `app/ui`, `/components-ui`, and relevant sibling tools before naming a component. For every nontrivial control or result, record one disposition: reuse an existing shared component; add a new shared component; or use a route-specific component because its behavior is unique. State the component anatomy, all applicable states, keyboard and screen-reader behavior, error and recovery behavior, responsive behavior, and design tokens.

Do not fall back to an unstyled native control, a generic browser upload box, a generic dashboard pattern, or an unrelated third-party component because the needed stack127 primitive does not exist. Keep native semantics underneath when they are useful or required. For example, a file upload may retain an accessible `input type="file"` while a stack127 dropzone, browse action, file status, rejection, remove, and retry interface provides the visible interaction.

Create the approved component in the shared UI when its visual and behavioral contract can serve more than one page. Keep it route-owned when the interaction is specific to that tool. If the missing component cannot be built and verified within scope, return the decision to the main agent.

The intended primitives are:

- `UiTextField`
- `UiSearchField`
- `UiTextArea`
- `UiSelect`
- `UiComboBox`
- `UiNumberField`
- `UiQuantityField`
- `UiQuantityInput`
- `UiSlider`
- `UiRangeSlider`
- `UiChoiceGroup`
- `UiCheckbox`
- `UiSwitch`
- `UiButton`
- `UiActionRow`
- `UiDisclosure`
- `UiRepeatableList`
- `UiStatus`
- `UiResultLead`
- `UiPrimaryResult`
- `UiProgressBar`
- `UiAllocationBar`
- `UiMetricGroup`
- `UiTimeline`
- `UiKeyValueList`
- `UiDataTable`
- `UiRawOutput`
- `UiCodeOutput`
- `UiCopyAction`
- `UiDownloadAction`
- `UiFileDropzone`
- `UiFileList`

### Allocation color

`UiAllocationBar` has three palettes. Use `neutral` for a plain two-part split, `accent` when one part needs focus against a neutral remainder, and `categorical` when three or more named parts must stay distinct. Set explicit segment tones when a category must keep the same color across related views.

Do not assign red, yellow, or green by position when they would imply danger, warning, or success. Color is never the only label. Keep every segment name and exact value in the legend. A zero or tiny value keeps its legend entry but receives no invented minimum width in the bar.

The canonical implementations live in `app/ui/controls.tsx`, `app/ui/display.tsx`, and focused modules such as `app/ui/uploads.tsx`, with styles beside them. Read [shared-ui.md](shared-ui.md) for cross-page use and Markdown syntax. `/components-ui` is the development-only gallery and returns `404` in production.

Extract a primitive when pages share its behavior and visual contract. Do not create a component that only renames one HTML element or makes an unusual tool harder to understand.

## Visual review

Review the rendered tool, not only its CSS.

- At first glance, can a person point to the required input, main action, and result?
- Is there one obvious primary action?
- Can any sentence be removed because the layout already says it?
- Are related controls grouped more tightly than unrelated controls?
- Does the result look more important than metadata and options?
- Do loading, error, empty, and recovery states preserve the same hierarchy?
- Does the task order remain intact on mobile?
- Are every table header and cell reachable without being covered by sibling content?
- Can every action be completed with a keyboard, and is focus always visible?
- Do dark and light themes both retain contrast and grouping?
- Does the workbench span the main column while its controls remain comfortably measured?
- Does a clean canonical URL remain unchanged after hydration?

Fix observable hierarchy or usability failures before polishing decoration.

---

_Internal doc. Created 2026-09-04._
