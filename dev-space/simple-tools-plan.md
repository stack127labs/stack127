# Simple tools plan

Goal: every stack127 tool answers the questions most people bring to it in a few seconds, without reading. Pros still get accurate, robust options, but those stay optional and tucked away.

The free trial conversion calculator showed the problem. It asks for cohorts, a follow-up window, and cohort age before giving a number, has about 90 words of helper text inside the tool, uses a checkbox to reveal more fields, and puts a sources table in the result. Competitors such as mowt.com and coachway.io answer "what's my rate" with three plain inputs.

The same pattern shows up across the catalog: 19 of the 20 SaaS calculators have text under fields, 5 use checkboxes to reveal fields, and only 3 use a chart. Our own docs and skills produced this, so the fix starts there, not in one tool.

## The system decides, not the user

Each tool's plan settles three things on its own.

1. **Who uses it and what they ask.** A written opinion: who most people are, their 2 or 3 questions, and what Basic answers. What Advanced adds, for whom, and what we leave out, with reasons.
2. **When the result shows.**
   - Live, for math that runs in the browser.
   - After a button, for network lookups, rate limits, slow work, or long input, like the DNS tools.
   - Shown on load, only when an example result teaches the tool without misleading anyone.
3. **Comparison numbers, only where real data exists.** Research finds published ranges with source, date, and who was measured. The plan decides if they mean anything for this tool. The result shows where the person sits next to the range, never a grade. Niches differ, so we never call a number good or bad. If sources disagree too much, show nothing. Sources go in the article, not the result.

## Phase 1: Docs and skills

Opus writes, the user reviews.

- [x] `stack127_docs/tool-interface.md`: Basic and Advanced by default with `UiDisclosure`, optional Advanced fields, every input changes the result, no checkbox reveals, `?` hints instead of field text, personal visual results with a share link, result timing, and neutral comparisons.
- [x] `stack127_docs/shared-ui.md`: the hint, the comparison marker, the share link, and the Advanced summary.
- [x] `stack127_docs/writing-style.md`: text inside a tool is labels and one-sentence hints, nothing else.
- [x] `stack127_docs/tool-pipeline.md`: the user-needs gate and the rework path for existing tools.
- [x] Tool research skill: user needs and comparison numbers first.
- [x] Tool product plan skill: the written opinion, result timing, and comparison decision.
- [x] Tool interface plan skill: Basic inputs, Advanced inputs, hints, and one visual result.
- [x] Tool frontend skill: build to those rules.
- [x] Tool writing skill: hint sentences, no text in the tool.
- [x] Tool audit skill: the new checklist.
- [x] Interface design and tool orchestrator skills: match the rework path.

## Phase 2: Shared components

Opus builds, Sol reviews.

- [x] `?` hint: hover, keyboard focus, and tap. A `hint` option on every field type. `UiHint` in `app/ui/controls.tsx`.
- [x] Advanced summary on `UiDisclosure`, such as "Not used" or "2 set", while closed. `uiSetSummary` in `app/ui/controls.tsx`.
- [x] Comparison marker: the person's value on a published range, no grade. `UiRangeMarker` in `app/ui/display.tsx`.
- [x] Share link action, built on the existing `useInitialQuery` URL pattern. `UiShareAction` in `app/ui/controls.tsx`.
- [x] All of these on `/components-ui`.
- [x] Sol review of the Phase 2 code. Passed on round 2 after five small accessibility and edge-case fixes.

## Phase 2b: Lean docs and open visuals

The first pass still boxed the model in. `tool-interface.md` was 3,800 words, mostly general UI advice a strong model already knows, and it listed a fixed menu of visuals. Skills repeated the docs. Rule: skills give a short path and make the model think; docs hold the facts, directly.

- [x] `tool-interface.md` rewritten to the stack127-specific decisions only: 3,800 words down to about 1,100.
- [x] Visuals are open: pick the form that makes the answer obvious, from any ECharts type, a shared component, or a custom SVG. Add a chart type when it's missing.
- [x] Tool skills rewritten as short paths that link to the docs, about 530 lines removed. The version rules live once, in `tool-pages.md`.
- [x] Chart wrapper: funnel, gauge, treemap, sankey, and radar added, with gallery examples. They load in the browser only on pages that draw one, so existing chart pages don't get heavier.
- [x] Sol review of the chart code. Passed on round 4 after edge-case fixes for empty, invalid, and looping data.

## Phase 2c: Examples, feel, and one writer

- [x] One Opus session plans the tool, builds the frontend, and writes every word, including the page content. The audit gives the fresh read.
- [x] Live tools open with realistic example values and their result, marked `Example` until the first edit. Button tools never run on their own.
- [x] "How a stack127 tool feels": the same shared parts, order, accent use, and type, without a fixed layout.
- [x] "Good and bad tools": three good sketches of different kinds (MRR goal, domain expiry, RAID planner) and three bad patterns. None of them is a pilot tool, so the pilots still test the docs.
- [x] URLs never change on their own. Only Share puts state in a link, and opening the link restores it.
- [x] Spec template: one short "States and layout" section instead of a state checklist.

## Phase 3: Two pilots

Agents run them with the new skills only, with no hand fixing.

- [x] Free trial conversion calculator (SaaS). Two Basic inputs opening on an example (500 started, 40 paid), an optional `Follow-up window and MRR` section, and a 10 × 10 grid of who paid. No published range in the result, because the sources disagree. Audit passed on round 4.
- [x] KDP royalty calculator (KDP). Format and price, plus page count and ink for print. The result is a split bar of where the price goes and a royalty-by-price line with "Your price" marked. No comparison, because none measures the same thing. Audit passed on round 2.
- [ ] User checks both real pages.
- [x] Fix the docs and skills wherever an agent went wrong:
  - A live tool's blank or invalid state shows `—` and keeps its layout. One bad Advanced value hides only its own part of the result.
  - Error timing: errors show on blur. An error comparing two fields waits for the edited field. A shared link focuses its first invalid field.
  - Accent: result visuals use the data colors, not the accent fill. `design-system.md` and `tool-interface.md` now agree.
  - `—` is allowed as an empty-value mark in tools.
  - Research for an older tool with no `research.md` creates one.
  - A rework deletes older planning docs that the spec replaces.

What the pilots showed: workers given only "we changed the docs and skills, rework this tool" took a clear position on users, cut inputs, and each picked a different visual that fits its tool. The weak spot was error and focus timing in live forms. Five of the seven audit defects were there, all hand-written per tool.

- [ ] Build a shared live-form helper for error timing and shared-link focus, so each tool stops hand-writing it.
- [ ] Delete the older KDP planning docs the new spec replaces: `brief.md` and `interface-contract.md`.

## Phase 3b: Fix the docs, then rebuild both pilots from scratch

The first pilots looked simple but lost too much. The free trial tool deleted cohorts, trial type, and billing options, and drew a narrow layout with large empty space. The KDP tool blanked its result when a long book's price fell below KDP's minimum, which looked like a 666-page cap. Live updates added most of the audit defects. The causes were in our docs: "pros use specialist tools", "leave it out", no shared layout, and no rule for blocked results.

- [x] Remove live results. Every tool opens on realistic example values with their result, and one named button recalculates. A changed result steps back instead of disappearing.
- [x] Advanced holds the depth. A rebuild never removes a working capability; it moves it into Advanced or the page content.
- [x] Shared layout: `ToolWorkbench`, `ToolFieldRow`, and `ToolResult` in `app/ui/tools/tool-workbench.tsx`, with the 66rem working width most tools already used. Tools stop writing their own.
- [x] Empty and blocked results: the result keeps its place, and a domain limit answers instead of blanking.
- [x] Detail restored where the lean docs cut too far: layout and whitespace, inputs, repeated rows, default state, and more good and bad examples.
- [x] Pilots deleted: tool code, content, engine, tests, and planning docs. Kept: route layouts, card art, database rows, and the shared KDP engine, restored to the original.
- [x] Free trial conversion calculator rebuilt from scratch through the full pipeline. Basic is trial type, starts, and paid. Advanced holds the window, activation, pricing, a target, and up to 12 cohorts. The result has the rate, a unit grid, a likely range, and published ranges by trial type, hidden when the window doesn't match. Audit passed on round 2, with one coordinator call: with no window set, the ranges show with "paid within 6 months" in their labels.
- [x] KDP royalty calculator rebuilt from scratch through the full pipeline. Basic is format, price, page count, and interior. Advanced holds trim, paper, Expanded Distribution, file size, royalty plan, and a goal. The result has a price split, a royalty-by-price line, and limits that answer, such as "Lowest price KDP allows". Audit passed on round 2.
- [x] Fixed on the way, in shared code: print rounding now matches KDP's official calculator in ten cases, and eBook delivery half cents round correctly. This also corrects the minimum list price and price-profit tools, so they need a version bump at release.
- [x] Doc lessons from this round: a comparison must match the source's window, and shows with the window in its label when the person hasn't set one. Tracking parameters are never a shared link.
- [x] Sol review of the shared UI built in these rounds (workbench, unit grid, range marker, chart marks, metric hints). Passed on round 2 after five edge-case fixes.
- [ ] User checks both real pages.
- [x] Polish: the range legend is now a vertical list, and funnel labels sit beside the shape in plain text.

## Phase 3c: Scannable results and required marks

The rebuilt free trial result stretched a few numbers across the full width and squeezed the range legend into three columns, so every label wrapped. The docs caused it: "fill the working width", "never an empty half", and a fixed result order.

- [x] Docs and skills: no fixed result layout. Design the result for scanning with a clear hierarchy: the main answer and its visual first, smaller numbers clean and readable. The working width is room, not a quota. A vertical list beats squeezed columns.
- [x] Every required field shows `*`, Basic and Advanced partners alike.
- [x] Free trial result redone by hand to these rules: the answer and its grid of 100 lead, where the rate sits follows the answer, and the numbers read as a list under the grid.
- [x] KDP: `*` on its four Basic fields only.
- [x] Shared: `UiMetricGroup layout="list"`, a vertical `UiRangeMarker` legend, and funnel labels beside the shape.
- [x] Sol review of these shared changes before release. Passed on round 2, after fixes for funnel labels on phones, blank cohort rows, and long values in the list.

## Phase 3d: Focused writers, friendly voice, and a slow pace

Tool copy read like a template: 14 intros start with "This calculator" and 13 with "Enter a". One Opus session writing several tools carries one tool's phrasing into the next.

- [x] One Opus session per tool for plan, interface, and writing. It never gets a second tool or integration work.
- [x] Integration is its own session: route and content wiring, card art, publishing, and the full checks.
- [x] The writing skill is short and asks the writer to think about the reader and talk like a friend. `writing-style.md` opens with the friendly, direct voice.
- [x] Default pace: one tool at a time, with one or two agents running, unless the user asks for speed.

## Phase 4: Triage all tools

76 tools: 20 SaaS, 13 storage, 10 domain, 7 DNS, and 26 others.

- [ ] Sol audit of each tool against the new checklist, with a short verdict.
- [ ] Order by search traffic from analytics, busiest first.

## Phase 5: Rollout in batches of about 5 tools

Each batch: Luna user needs and comparison numbers, Opus plan, Sol engine changes if needed, Opus frontend and words, Sol audit, pull request, release.

One integration session at a time, browser checks one at a time, and main synced before each batch.

- [ ] SaaS
- [ ] Storage
- [ ] Domain
- [ ] DNS
- [ ] Other tools
