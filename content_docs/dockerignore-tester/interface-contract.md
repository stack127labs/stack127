# Interface contract: `.dockerignore` Pattern Tester

Status: ready
Tool: `.dockerignore` Pattern Tester
Route: `/dockerignore-tester`
Mode: retrofit
Depends on: `brief.md`
Input fingerprint: `brief.md sha256:dd4654f407813c87fa93e5dbf8818cab3fcfe585d4a37611e40bfa4fc7384e49`

## User task

- Primary user: A developer debugging the effective `.dockerignore` file for one Docker build context.
- Question: Which submitted context paths are included or excluded, and which rule decided each verdict?
- Lead answer: One sentence with the exact total, Excluded count, and Included count.
- Next decision: Correct the effective ignore file or confirm the result with a real Docker build.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Effective file | Which ignore file am I testing? | User choice: root or Dockerfile-specific | input | Docker uses one effective file and a Dockerfile-specific file replaces the root file. | Do not add a second source badge in results; the choice and contextual sentence remain visible above the editors. |
| Ignore rules | What ordered rules should be evaluated? | User-supplied multiline text | input | This is one half of the matcher input and preserves physical line numbers. | Do not repeat the full rules in the result; show only deciding rules, trace entries, and diagnostics. |
| Context-relative paths | Which probes should be tested? | User-supplied multiline text | input | Batch testing is the primary advantage over checking one path at a time. | Each submitted path appears once in the results, even when normalized display is also needed. |
| Exact outcome counts | What happened to this submitted batch? | Derived `total`, `excluded`, and `included` counts | lead | This answers the batch question before row-level evidence. | The answer sentence is the only count summary; remove the separate `Excluded n · Included n` line and do not add count cards. |
| Path verdict and deciding rule | What happened to this path, and why? | Row verdict, raw path, normalized path, deciding line, deciding rule, builder-control flag | supporting | Developers must be able to act on each submitted probe without opening details. | Keep one semantic row per submitted path; do not repeat the verdict inside its trace disclosure. |
| Ordered match trace | Which rules changed or carried the state for this path? | Row trace entries in source order | evidence | Direct and inherited parent matches explain Docker-specific behavior. | Show only inside that path's disclosure and never turn an intermediate state into another verdict. |
| Rule diagnostics | How did each physical rule line parse? | Parser diagnostics | evidence | Line number, raw source, normalized form, and activity status are repeated facts best checked as a table. | Keep in one result-level disclosure; do not annotate every rule in both editors and results. |
| Matcher identity | Which behavior produced these results? | Contract, Moby version, commit, Linux slash mode | evidence | The tool is a pinned compatibility port, not a generic glob tester. | Show once after result evidence and include it in copied output; do not repeat it in the lead. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Effective file | defaulted input | No, it changes context and copied metadata but not matcher logic | Root `.dockerignore`, from the current product contract | visible above editors | `ToolChoiceGroup` with Root `.dockerignore` and Dockerfile-specific | It prevents users from mentally merging two files and changes the nearby precedence sentence. | Full-width group; choices may wrap but remain before both editors. |
| 2 | `.dockerignore` rules | required input, where an empty file is valid after paths are supplied | yes | User supplied; empty stored value | visible | `ToolTextArea` extended with code-editor attributes and a textarea ref | Ordered source lines drive every verdict and exact error recovery. | Full-width editor before paths, at least eight visible text rows. |
| 3 | Context-relative paths | required input | yes | User supplied; empty stored value | visible | `ToolTextArea` extended with code-editor attributes and a textarea ref | One nonblank probe per physical line defines the result batch. | Full-width editor after rules, at least eight visible text rows. |
| 4 | Load example | secondary action | yes, because it replaces both inputs before the next test | Fixed parent-exception example from the brief | visible in the action row | `ToolButton` secondary | It demonstrates ordered negation and inherited parent evidence without another worked-example block. | Stays secondary and may wrap above the primary action. |
| 5 | Reset | secondary action | yes, because it clears inputs and results | No default beyond clean state | visible in the action row | `ToolButton` secondary with reset icon | It provides a complete recovery path without reloading. | Sits beside Load example when space permits. |
| 6 | Test patterns | primary action | not applicable | No default | visible at the end of the input flow | `ToolButton` primary inside `ToolActionRow` | Explicit submission avoids recalculating while multiline text is being edited. | Full-width final button at 390px and below. |
| 7 | Copy results | conditional secondary action | no | Derived from the current valid result | result beside the lead on wide screens | `ToolCopyAction` secondary | It exports the exact versioned result without copying unreferenced rules. | Full-width below the lead sentence. |

`Test patterns` is the only accent-filled action. Enter always inserts a newline in either editor. Any edit or source-mode change clears the old result immediately. The shared textarea must expose a ref, `autoCapitalize="none"`, and `spellCheck={false}` before replacing the current native editor wrapper; invalid-submit focus and developer-text behavior cannot regress.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Batch answer | How many submitted path lines are Excluded and Included? | Total, excluded, and included counts | One `ToolResultLead` sentence at the top of a focusable result section: `3 path lines: 1 Excluded, 2 Included.` | This is the only count summary. Do not add metric cards, a count strip, or a second sentence with the same numbers. |
| 2 | Path results | What is each path's final verdict and deciding rule? | Raw path, conditional normalized path, verdict, deciding line and rule, builder-control limitation | One responsive semantic table with one row per submitted path; textual verdict is always present and raw user text uses monospace | Do not add a separate detail row or use color as the only status. Show normalized text only when it differs. |
| 3 | Per-path trace | How did ordered matching produce this path's verdict? | Source line, normalized rule, Direct or Parent match source, state after evaluation | `ToolDisclosure` labelled `Show trace for <path>` inside the path row, containing a compact ordered table | Do not restate the row verdict as another conclusion. Omit the disclosure when no active rule produced trace entries. |
| 4 | Rule diagnostics | How did the tester interpret every physical rule line? | Line, raw source, normalized form, active or inactive status | One `ToolDisclosure` after path results with a semantic diagnostics table | Do not show by default and do not repeat trace eligibility or path outcomes here. |
| 5 | Compatibility provenance | Which matcher contract and platform rules generated this result? | Moby version, commit, contract ID, Linux slash mode | One subdued monospace metadata line after diagnostics | Do not promote provenance above the answer or repeat it beside every row. |

The result section appears directly after the action row with one neutral divider, not as a floating dashboard card. `Copy results` belongs to the current result header but stays visually secondary to the answer.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Path result table | Repeated path, verdict, deciding rule, and trace action fields | Yes. Columns align the same facts and rows preserve submitted path order. | Use on desktop; preserve semantic table order while each row becomes a labelled vertical group on narrow screens. |
| Ordered trace table | Source order and the state after each relevant rule | Yes. Top-to-bottom order is the evaluation order and columns compare repeated evidence. | Use inside the path disclosure with line order unchanged. |
| Rule diagnostics table | Physical source line, raw text, normalized form, and parser status | Yes. Rows preserve physical file order and columns align parser fields. | Use inside one result-level disclosure. |
| Included versus Excluded chart | Proportion of the submitted batch | No. Two exact counts already answer the task and chart area would imply importance without adding a decision. | Omit the chart and any proportional bar. |
| Marker art or matcher diagram | How Docker matching works in general | No. Vague geometry cannot carry exact line-level matcher evidence. | Omit it from the tool workbench; the live trace is the useful visual. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial | Root source selected; both editors empty; Load example, Reset, and Test patterns available | Absent | Absent | No error and no empty-result panel | Normal document focus; no unsolicited announcement. The clean canonical URL remains unchanged. |
| Example loaded | Both editors contain the fixed `docs` and negation example; result stays cleared | Absent until tested | Absent | Reset and edits remain available | Focus rules editor and announce `Example loaded` once. |
| Valid mixed result | Editors remain editable and Test patterns remains available | Exact one-sentence total and two counts | Path rows, conditional traces, diagnostics, provenance, and Copy results | Any edit clears all result regions before another test | Focus the result section and announce the answer sentence once. |
| Empty rule file | Rules are empty and at least one valid path is supplied | Every submitted path line is Included | Each row says `No rule matched`; diagnostics may show the blank physical line; no empty trace disclosure | User may add rules or reset | Focus and announce the valid batch answer like any other result. |
| Invalid rules | Drafts remain; result and copy action are absent | Absent | Absent | Exact physical rule line error appears with the rules editor; correcting and retesting is the recovery | Focus rules editor, set invalid semantics, and announce the error once. |
| Invalid paths or no paths | Drafts remain; result and copy action are absent | Absent | Absent | Exact path error appears with the paths editor; valid nonblank probes are required | Focus paths editor, set invalid semantics, and announce the error once. |
| Loading | Inputs remain unchanged | Not applicable | Not applicable | The bounded local engine is synchronous; never show a spinner, skeleton, progress label, or disabled waiting state | No loading announcement. |
| Partial | Inputs remain unchanged | Not applicable | Not applicable | Validation and evaluation are all-or-nothing; suppress every result if any rule or path is invalid | Announce the first actionable error instead. |
| Matcher failure | Inputs remain and all stale results are absent | Absent | One neutral failure status and Try again action | `The matcher could not finish. Your inputs are still here.` | Focus the failure region and use one concise assertive announcement. |
| Unsupported `state` query | Clean inputs; only `state` is removed and unrelated query parameters or hash remain | Absent | Neutral notice: `Shared inputs are not supported.` | Load example or enter inputs normally | Polite notice without forced focus; use `history.replaceState`, never add history. |
| Expanded trace | Inputs and batch answer do not change | Unchanged | One chosen row reveals its ordered trace; diagnostics may be expanded independently | Close with the same trigger; expansion never changes matcher state | Native disclosure focus remains on its trigger; no live announcement. |
| Copy failure | Valid result remains fully visible | Unchanged | Copy action temporarily reads `Copy failed` | Retry the same action; no matcher rerun | `ToolCopyAction` exposes the changed accessible label; focus stays on the button. |

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Effective-file choice | `ToolChoiceGroup` | It provides a labelled radio group with two mutually exclusive options and shared focus styling. | A select hides the important precedence choice; two plain buttons obscure selected state. |
| Multiline code-like inputs | `ToolTextArea` with shared support for textarea ref, capitalization, and spellcheck props | It keeps shared label, error, focus, and spacing behavior while allowing exact invalid-field focus. | The current page-owned label and textarea duplicate shared control styling; a code editor dependency is too heavy for line-oriented plain text. |
| Primary and secondary actions | `ToolActionRow` and `ToolButton` | They enforce one primary action, shared sizing, and consistent wrapping. | Custom buttons repeat the canonical control styles and make future state behavior drift. |
| Lead result | Focusable page-owned result section containing `ToolResultLead` | The shared lead gives the answer first while the section can receive focus after calculation. | `ToolMetricGroup` would repeat the same counts as separate cards; `ToolPrimaryResult` suits one dominant value, not a two-class batch answer. |
| Path results | Page-owned responsive semantic table using shared tokens | One row maps to one submitted path and the mobile treatment must stack instead of scroll. | `ToolDataTable` currently owns horizontal scrolling and cannot place a per-row disclosure without weakening the required narrow layout. |
| Trace and diagnostics | `ToolDisclosure` around page-owned semantic tables | Evidence remains available on demand with a shared accessible disclosure trigger. | Permanent expanded tables bury the answer; a modal breaks comparison with the path row. |
| Clipboard export | `ToolCopyAction` | It handles clipboard fallback plus visible success and failure states without a second status implementation. | A page-owned `navigator.clipboard` button lacks the shared fallback and repeats state logic. |
| Notices and matcher failure | `ToolStatus` with neutral or danger tone | It carries appropriate live-region semantics and keeps recovery copy short. | A large alert card would overstate a local retryable failure. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, above 760px | Source choice, two equal-width editors, one action row, lead with Copy results, then path table, disclosures, and provenance | A 1,024-code-point rule or path plus a 40-character commit | Editors scroll internally on long unbroken lines; result cells wrap. No page overflow. |
| Tablet, 391px to 760px | Source choice, rules editor, paths editor, secondary actions, full-width Test patterns, lead, Copy results, then stacked semantic path rows | A 64-segment normalized path and a long escaped rule | Each editor owns horizontal text overflow; all result values wrap. No table or page horizontal scroll. |
| Narrow mobile, 320px to 390px | Same reading order as tablet; source choices and every action become full width; each path row exposes Path, Verdict, Deciding rule, then Trace | A 1,024-code-point raw path with a different normalized path | The individual editor may scroll internally. Result and trace rows wrap within the viewport. |
| 200% zoom or long translated labels | Preserve DOM order and let controls wrap vertically without overlap; do not move Copy results before the answer | `Dockerfile-specific` plus its precedence sentence | The workbench height grows. Nothing clips or creates document-level horizontal overflow. |

## Interface wireframes

### Desktop result

```text
.dockerignore Pattern Tester: see which rule decides each path
Paste the .dockerignore file Docker will use and add context-relative path probes.

Effective file
(o) Root .dockerignore     ( ) Dockerfile-specific
Tests the root file.

.dockerignore rules                         Context-relative paths
+--------------------------------------+    +--------------------------------------+
| docs                                 |    | docs/README.md                       |
| !docs/README.md                      |    | docs/guide                           |
|                                      |    | src                                  |
+--------------------------------------+    +--------------------------------------+
Rules and paths stay in your browser. Final rules decide Included or Excluded.
[Load example] [Reset]                                      [Test patterns]
----------------------------------------------------------------------------
3 path lines: 1 Excluded, 2 Included.                        [Copy results]

Path                  Verdict       Deciding rule                    Trace
docs/README.md        Included      line 2  !docs/README.md          [Show trace]
docs/guide            Excluded      line 1  docs                     [Show trace]
src                   Included      No rule matched                  [Show trace]

[>] Rule diagnostics
Moby v0.6.1 | Linux slash | commit 5a6d8429a19bb6948a372ff19e86fe83599a04b7
```

### Narrow mobile result

```text
.dockerignore Pattern Tester

Effective file
[Root .dockerignore          ]
[Dockerfile-specific         ]
Tests the root file.

.dockerignore rules
+----------------------------+
| docs                       |
| !docs/README.md            |
+----------------------------+

Context-relative paths
+----------------------------+
| docs/README.md             |
| docs/guide                 |
| src                        |
+----------------------------+

[Load example                ]
[Reset                       ]
[Test patterns               ]
------------------------------
3 path lines: 1 Excluded,
2 Included.
[Copy results                ]

Path
docs/README.md
Verdict
Included
Deciding rule
line 2  !docs/README.md
[Show trace                  ]
------------------------------
Path
docs/guide
Verdict
Excluded
Deciding rule
line 1  docs
[Show trace                  ]
------------------------------
[>] Rule diagnostics
Moby v0.6.1 | Linux slash
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

Initial keeps both editors empty and shows no result placeholder. Empty rules with `src/index.ts` is a valid result:

```text
1 path line: 0 Excluded, 1 Included.

Path            Verdict     Deciding rule
src/index.ts    Included    No rule matched

[>] Rule diagnostics
```

Invalid rules and matcher failure replace every stale result region:

```text
.dockerignore rules
+----------------------------+
| node_modules               |
| [broken                    |
+----------------------------+
Rule line 2 has an unclosed character class.
                                           [Test patterns]

The matcher could not finish. Your inputs are still here. [Try again]
```

Loading and partial results do not exist because the bounded engine is synchronous and evaluation is all-or-nothing. An expanded row reveals evidence inside the same semantic path row:

```text
docs/README.md    Included    line 2 !docs/README.md    [Hide trace]
  Line    Rule                 Match     State after rule
  1       docs                 Parent    Excluded
  2       !docs/README.md      Direct    Included
```

The words in `State after rule` are evidence only. The row's single final verdict remains `Included`.

## Removed or rejected

- Remove the separate `Excluded n · Included n` count line because the lead sentence already contains those exact facts.
- Replace the current two-row-per-path table structure with one semantic row per path and an in-row trace disclosure. A trace must not masquerade as another path record.
- Replace custom buttons, choice controls, clipboard state, and compatible textarea chrome with shared tool controls after the shared textarea exposes the required developer-text and focus props.
- Remove empty trace tables when no active rule produced trace entries.
- Do not add file upload, repository scanning, rule generation, presets, comparison mode, context-size estimates, downloads, share links, or saved drafts.
- Do not add metric cards, a dashboard count strip, a chart, marker art, screenshots, decorative containers, or colored left borders.
- Do not repeat matcher provenance in the introduction, lead, and every row. One result metadata line plus copied metadata is enough.
- Do not treat builder control-file notes or trace states as a third verdict. Every submitted path is only Included or Excluded.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | After a valid test, the first result content is one focusable answer sentence with total, Excluded, and Included counts. | Browser focus and text assertion. |
| UI-002 | deduplication | The result contains no separate count strip or count cards, and each submitted path has one semantic result row. | DOM inspection and Browser row-count assertion. |
| UI-003 | visual-truth | Path, trace, and diagnostics tables preserve their source order and textual statuses; no chart, allocation bar, or marker figure implies additional matcher truth. | DOM inspection and representative fixture comparison. |
| UI-004 | responsive | At 320px, 390px, 760px, desktop, and 200% zoom, inputs follow source, rules, paths, actions order; path rows stack without page or table overflow. | Browser measurements and screenshots in both themes. |
| UI-005 | url | Opening `/dockerignore-tester` leaves the clean canonical URL unchanged through hydration; an unsupported `state` parameter alone is removed without dropping other query parameters or the hash. | Browser history and URL assertion. |
| UI-006 | action | `Test patterns` is the only accent action; Enter inserts editor newlines; Load example, Reset, Copy results, Try again, and disclosures remain secondary. | Keyboard Browser test and computed-style inspection. |
| UI-007 | stale-state | Editing either editor or changing effective file removes the lead, every path row, open trace, diagnostics, provenance, and Copy results before another test. | Browser interaction regression. |
| UI-008 | invalid | One invalid rule or path leaves both drafts visible, shows an exact associated error, focuses the first invalid editor, and exposes no partial or old result. | Browser focus, accessibility, and absence assertions. |
| UI-009 | empty | Empty rules with valid paths returns Included rows with `No rule matched`, while no nonblank paths focuses the paths editor and returns no result. | Unit and Browser boundary tests. |
| UI-010 | evidence | Each path with trace entries has one specifically labelled disclosure; expanded evidence shows ordered line, rule, Direct or Parent match, and state without restating another final verdict. | Browser disclosure and table-content assertion. |
| UI-011 | components | Choice, action, disclosure, copy, lead, and status behaviors use the shared tool-control components; textarea adoption retains exact focus and developer-text behavior. | Source inspection, component test, and Browser recovery test. |
| UI-012 | copy | Copy results appears only for a valid result, exports the current versioned summary, keeps the result visible on success or failure, and never becomes the primary action. | Clipboard success and rejection Browser tests. |
| UI-013 | accessibility | Labels, errors, result focus, disclosure names, verdict words, source order, 44px targets, focus rings, and live announcements work without relying on color. | Accessibility tree, keyboard test, and manual screen-reader check. |
| UI-014 | failure | An unexpected matcher exception clears stale output, preserves both inputs, focuses a concise failure region, and offers Try again without a loading state. | Injected-failure Browser test. |

## Open questions and blockers

- None. The matcher behavior, input limits, exact state model, and BuildKit receipt are already covered by the existing implementation and tests. This retrofit only contracts the visible interface and shared-component adoption; it does not change engine truth or the public content.
