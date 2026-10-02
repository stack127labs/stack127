# Tool interface system

Use [writing-style.md](writing-style.md) for all interface wording and visual choices.

stack127 tools should feel like focused instruments. A person should see what to enter, what to press, and what the answer means without reading a manual first.

This doc is the source of truth for tool layout, control order, and shared interaction patterns. `stack127_docs/design-system.md` still owns sitewide color, type, radius, spacing, and theme rules.

## Start with the task

Before you change a tool, boil its flow down to five parts:

1. The question the person came to answer.
2. The minimum input needed to answer it.
3. The one action that produces the answer.
4. The first result the person needs to see.
5. Optional detail, verification, or recovery.

The interface follows that order. Don't give intro copy, secondary settings, or implementation details more visual weight than the task.

## Plan before you build

Every new tool and every major redesign needs a ready Interface section in `content_docs/<tool-slug>/tool-spec.md` before UI code changes. Create it with `skills/stack127/tools/stack127-tool-interface-plan/SKILL.md`.

A small fix can skip updating that section only if it doesn't change the visible inputs, result regions, hierarchy, visual format, or responsive order.

The interface contract must decide:

- The one user question and the one lead answer.
- Which available facts are inputs, supporting context, evidence, or left out.
- Why each control and result region exists.
- Which formatted facts must not repeat.
- Whether each proposed visual shows a true relationship.
- Behavior for real states, long values, desktop, and narrow screens.
- Observable `UI-` acceptance criteria.

In the full tool pipeline, the Opus planning session plans the interface. Later it builds the frontend itself, on top of the backend Luna builds. It doesn't add controls, result regions, explanatory sentences, or visuals outside the reviewed plan without updating the spec. The independent audit judges the rendered result without relying on the builder's explanation.

## Reading order

A tool page has three visual levels:

| Level | Contains |
| --- | --- |
| Page header | Identity icon, tool name, and at most one short sentence when the name doesn't explain the job. |
| Workbench | Required inputs, one primary action, status, and results. |
| Supporting content | Interpretation, limits, and related checks, after the workbench. |

Inside the workbench, the eye should find the main input before the main action, and the answer before supporting data. Guide the eye with position and spacing first, size and weight second, and accent last.

## Cut text, keep clarity

- Keep visible labels. Placeholder text is an example, never the only label.
- Default to no helper text inside the workbench. Add it only when it prevents a likely error, explains a hidden consequence, or clarifies an unfamiliar value the label and control can't express.
- Remove sentences that repeat a field label, button label, heading, or visible result.
- Don't describe familiar providers, options, units, or control behavior under a field. If that's still useful, it goes in the supporting content.
- When a field truly needs guidance, keep it short and beside the field. Don't add a paragraph above the form for it.
- Show common choices directly. Put optional advanced or rare choices behind a clearly named disclosure.
- Use a diagram, relationship, scale, timeline, table, or grouped result when it gets the point across faster than prose. Don't replace one sentence with decorative art.
- Results start with the answer. Method, provider, timing, and raw data come after.

Less text never means unlabeled controls, unexplained errors, hidden limits, or mystery icon-only actions.

## Workbench structure

The workbench is the full-width band defined in `stack127_docs/design-system.md`. Its background and top and bottom rules span the whole main column beside the sidebar. Its interactive contents line up to a calm inner measure.

Use this structure when the tool allows it:

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

Don't wrap the form, action area, result, table, or visual in separate nested cards. Use alignment, space, and a single divider to group things.

On wide screens, fields may share a row when they belong to one decision. Don't use columns just to fill empty width. On narrow screens, keep the task order and stack controls without shrinking their hit areas.

When a select or input shares a row with its primary button, line the button up with the control itself. The label stays above the control and must not push the action out of line. On narrow screens, stack the button under the control at full width.

## Control rules

All bounded controls use `--radius`, which is 2px. Controls use `--text-body`, the shared focus ring, and the site color tokens. Keep them compact enough for technical work, but never below a comfortable pointer target.

### Buttons

| Type | Rule |
| --- | --- |
| Primary | One per workbench state. Accent fill. Name the result, such as `Look up DNS` or `Calculate capacity`. |
| Secondary | Bordered surface, for useful nearby actions such as reset, copy, download, or load example. |
| Ghost | Unboxed, for low-priority actions you can undo. |
| Icon-only | Only for a familiar action in tight space. Needs an accessible name, and a visible tooltip when the icon could be unclear. |
| Loading | Keeps the button width, says what's happening, and blocks double submits. |
| Disabled | Only when the reason is obvious. Prefer an enabled submit that shows exact validation when that's clearer. |
| Copy | Reports success only after the clipboard API or a verified fallback works. If both fail, keep the source value selectable and show one local failure state. |

Don't give primary styling to reset, share, copy, download, or navigation actions.

### Text, search, and number fields

- Use a persistent label, plus a realistic example when one helps.
- Mark every required field with a visible `*`. Keep the required state in code as well.
- Pick the right input type, input mode, autocomplete, capitalization, and spellcheck.
- Use `UiNumberField` when whole or decimal values benefit from keyboard-safe increment and decrement buttons.
- Join a value and its unit with `UiQuantityField` or `UiQuantityInput`. They're one decision, so they shouldn't float as separate controls.
- Units go in the attached unit selector or a fixed suffix, not in helper paragraphs.
- Search fields search or filter a collection. Don't call a single-value lookup field "search" just because it has a magnifying-glass icon.
- Put errors right under the field. After submit, focus the first invalid field.
- Show a validation or request error once, at the narrowest useful scope. Don't repeat the same message under a field, above the action, and in the result area.
- Field validation doesn't create a result. Don't add an error result panel or a `Fix input` button when the error can show beside the field with focus moved there. Use a retry action only for a failed request or operation the person can repeat without changing the input.
- When a field and action share a row, keep separate rows for label, control, and error. A new error must not knock the action out of line with the control.

### Selects and visible choices

- Use `UiSelect` for a fixed set of choices. It renders the stack127 trigger and listbox, and keeps a visually hidden native select for mobile and form accessibility.
- Use `UiComboBox` only when the person benefits from typing to filter a longer list.
- Use a compact radio or segmented row when seeing all common options helps the decision.
- Keep real radio semantics, and one shared hit target for each label and control.
- A selected option gets stronger contrast and the allowed accent treatment. Unselected options stay quiet.
- Don't use a dropdown to hide two or three important choices.

### Checkboxes and switches

- Use a checkbox for an independent choice, or a group where several items can apply.
- Use a switch only when the change takes effect right away. A setting sent with a form is a checkbox.
- Write labels as the state or choice, not as an instruction to click.

### Disclosures

- Advanced sections say what's inside, such as `Resolver settings`, not `More options`.
- Keep values chosen inside a collapsed disclosure visible in a short summary.
- Never hide required fields, the primary action, an error, or the main result.
- Never hide a default input that changes the main answer. A prefilled value is an active assumption, not permission to hide it.
- A disclosure may hold optional refinements that do nothing when off, optional evidence, or diagnostics. If turning an option on makes another field required, show that field in the main flow next to the option.
- During testing, change every input that drives the result and confirm the answer changes as documented. If it doesn't, remove the control or document what else it does.

### Optional Basic and Advanced modes

Record one control-mode decision for every tool:

| Mode | Use it when |
| --- | --- |
| `single` | The default. Use this unless one of the others clearly fits. |
| `disclosure` | One mode, with optional evidence or refinement tucked away. Active assumptions that drive the result stay visible. |
| `basic-advanced` | A complete common task can run on a small, explicit set of assumptions, and a separate group of refinements would otherwise swamp it. |

Basic and Advanced use the same engine and the same normalized input contract. Basic shows every active assumption that affects the answer, with its source and a way to edit it. Advanced shows the extra controls. A simpler screen must not mean a different calculation or a hidden default.

When someone switches modes:

- Keep their values.
- If custom Advanced values stay active in Basic, show a short customized-assumptions summary with an edit action.
- Replacing them with Basic defaults needs an explicit reset.
- If a hidden value becomes invalid, show its control, move focus to it, and announce the error. Never leave someone with an error they can't see or fix.

The interface contract must define:

- Labels and the mode explanation.
- Input mapping.
- Basic assumptions and their sources.
- Value retention and reset.
- Invalid-state recovery.
- Focus and announcements.
- URL, reload, back, and forward restoration.

Tests must prove that equal normalized inputs return the same result in both modes. They must cover switching in both directions with custom, invalid, and restored state.

Don't add modes just to make a crowded form look shorter.

### Repeated rows and add actions

- Put `Add` beside the group heading when it creates another group. Put it after the current rows when it adds a row to that group.
- After adding a row, focus its first useful control. After removing the focused row, return focus to a stable nearby action.
- Keep row actions in a fixed last column. Don't let long values push remove, duplicate, or reorder actions onto a second line.
- On narrow screens, keep row order and use a set breakpoint. Don't wait for the browser to wrap controls unpredictably.

## Result hierarchy

Results answer before they document. The order:

1. One plain answer or status, at `--text-body` or a fitting heading size.
2. The useful visual relationship or structured values.
3. Raw records, calculation steps, or diagnostic detail.
4. Provider, timing, version, and source metadata, in `--text-small`.
5. A next action, only when it helps check or continue the task.

Don't put every fact in an equal card. Group related facts and make the main finding stand out.

| Content | Use |
| --- | --- |
| Repeated fields | Table |
| Exact comparisons | Clean chart |
| Conceptual relationships | Marker art |

Each result region answers a different question. Don't repeat a visible value in a second metric row, card, or summary unless the second view shows a needed relationship. Compare the formatted values the reader actually sees. If two source timestamps display as the same date, don't render an identical two-value comparison.

Use a timeline only when its axis is time. Don't place variable, conditional, or unknown stages at equal distances on a line. Use an ordered stage list or table that names each duration and consequence.

A repeated-field table needs enough width for its columns and real values. Put it beside another region only when both stay readable with long content. Otherwise, stack the regions on purpose. On narrow screens, a table may scroll inside its own viewport. Sibling content must never cover a column or cause page-level overflow.

When a result maps to a small fixed set of states, show one label and one value instead of a paragraph. Put the longer caveat in supporting content or an accessible description, as long as the visible value is accurate on its own.

## States are part of the design

Every tool must handle each state that can happen:

- Initial.
- Incomplete or invalid input.
- Loading.
- Success.
- Empty or no match.
- Partial result.
- Service or network failure.
- Retry or recovery.
- Disabled controls.
- Long content and narrow screens.

Announce status changes to assistive technology. A failure names the problem and the next useful action. Don't clear valid input after a failure.

### URL state

The canonical route is the initial state, not a blank query string waiting to be filled. A clean tool URL must stay unchanged through server render and hydration. Never call `replaceState` or `pushState` on mount to write defaults, derived values, or a first result into the URL.

The page stays static, so the server page never reads `searchParams`. The client tool reads the query with `useSearchParams()` inside a `<Suspense>` boundary. The first render shows the default state, then fills in from the URL. A tool that runs from a shared link starts after hydration. See `stack127_docs/caching.md`.

A tool may restore state from a query string the person opened on purpose. When shareable state helps, prefer an explicit Share action that creates or copies the URL. If a tool updates the URL as the person edits, that must be part of the documented task, and it must start only after a deliberate change by the person.

## Shared components

Prefer a small set of semantic components over visual copies inside each tool. Components keep native HTML behavior and take ordinary labels, descriptions, errors, and state props.

Shared fields may take an outer placement class, so the tool can put them in an explicit grid or subgrid. Page styles may position the component, but must not replace its internal control styling.

### Missing components

Before naming a component, planning must check `app/ui`, `/components-ui`, and related sibling tools. For every nontrivial control or result, record one decision:

- Reuse an existing shared component.
- Add a new shared component.
- Use a route-specific component because its behavior is unique.

Then describe the component's parts, all its states, keyboard and screen-reader behavior, error and recovery behavior, responsive behavior, and design tokens.

Don't fall back to an unstyled native control, a generic browser upload box, a generic dashboard pattern, or an unrelated third-party component because the stack127 piece doesn't exist yet. Keep native semantics underneath when they're useful or required. For example, a file upload can keep an accessible `input type="file"`, while a stack127 dropzone, browse action, file status, rejection, remove, and retry interface handles what people see.

Build the approved component in the shared UI when its look and behavior can serve more than one page. Keep it in the route when the interaction is specific to that tool. If the missing component can't be built and checked within scope, return the decision to the main agent.

The intended primitives:

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

`UiAllocationBar` has three palettes:

| Palette | Use it when |
| --- | --- |
| `neutral` | A plain two-part split. |
| `accent` | One part needs focus against a neutral remainder. |
| `categorical` | Three or more named parts must stay distinct. |

Set explicit segment tones when a category must keep the same color across related views.

Don't assign red, yellow, or green by position when they'd suggest danger, warning, or success. Color is never the only label. Keep every segment name and exact value in the legend. A zero or tiny value keeps its legend entry but gets no made-up minimum width in the bar.

The canonical code lives in `app/ui/controls.tsx`, `app/ui/display.tsx`, and focused modules such as `app/ui/uploads.tsx`, with styles beside them. Read [shared-ui.md](shared-ui.md) for use across pages and Markdown syntax. `/components-ui` is the development-only gallery and returns `404` in production.

Pull out a primitive when pages share its behavior and look. Don't create a component that only renames one HTML element or makes an unusual tool harder to understand.

## Visual review

Review the rendered tool, not just its CSS.

- At first glance, can a person point to the required input, main action, and result?
- Is there one obvious primary action?
- Can any sentence go because the layout already says it?
- Are related controls grouped more tightly than unrelated ones?
- Does the result look more important than metadata and options?
- Do loading, error, empty, and recovery states keep the same hierarchy?
- Does the task order hold on mobile?
- Can you reach every table header and cell without sibling content covering it?
- Can every action be done with a keyboard, with focus always visible?
- Do dark and light themes both keep contrast and grouping?
- Does the workbench span the main column while its controls stay comfortably measured?
- Does a clean canonical URL stay unchanged after hydration?

Fix visible hierarchy or usability problems before polishing decoration.

---

_Internal doc. Created 2026-09-04._
