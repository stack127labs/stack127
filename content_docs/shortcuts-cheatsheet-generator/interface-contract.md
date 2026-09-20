# Interface contract: Shortcut Cheat Sheet Generator

Status: ready
Tool: Shortcut Cheat Sheet Generator
Route: `/shortcuts-cheatsheet-generator`
Mode: retrofit
Depends on: `brief.md`

## User task

- Primary user: Someone who wants a printed desk reference for the shortcuts they use across a few apps.
- Question: What exact shortcut sheet will print for these app, platform, and task-group choices?
- Lead answer: The live paper preview of the printable sheet.
- Next decision: Trim or expand the selections, then open the browser print dialog.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| App filter | How do I find an app in the full shortcut catalog? | Client-only text filter over app names | input | The catalog is too large for a scroll-only checkbox list. | Filtering never changes selection or the printed sheet, and the filter text never appears in the preview. |
| Selected apps | Which app sections belong in the sheet? | User checkboxes or known `apps` query seed | input | At least one selected app is required for a printable document. | Remove the separate `n selected` label; the preview summary already reports document app count. |
| Platform per app | Which platform columns should print? | User choice from each app's supported platforms | input | Bindings differ by platform and All platforms is a real default. | Keep the choice visible inside every selected multi-platform app section. Do not repeat it as a control summary. |
| Task groups per app | Which categories belong in each app section? | Default-on group checkboxes | input | Removing irrelevant groups is how the user keeps the sheet useful. | Keep every active group choice visible; do not hide selected defaults in a disclosure. |
| Printable sheet | What exactly will the browser print? | Resolved cheat-sheet document | lead | The artifact is the product, not a success badge or generation status. | Render one sheet DOM for both preview and print. Never build a separate print-only copy. |
| Document count | How large is the current resolved selection? | App and shortcut counts | supporting | It helps the user notice a sheet that has grown beyond their desk-reference goal. | Show once above the preview. Do not repeat app count in the controls or printed title. |
| App and platform context | Which app and platform columns does this printed section cover? | Resolved app and platform records | evidence | Paper needs context after it leaves the browser. | Put context inside the sheet header or app heading, not in a second preview caption. |
| Shortcut groups and rows | Which actions and documented bindings will print? | Resolved ordered sections and shortcuts | evidence | Repeated action-to-platform relationships belong in tables. | Each action appears once per selected app group; alternatives stay inside the same platform cell. |
| Missing platform binding | Does the source lack a key for one selected platform? | Missing key entry in a retained shortcut row | evidence | `Not documented` is safer than an inferred key or blank cell. | Use the exact text once in the affected cell and never copy another platform's binding. |
| Source and verification metadata | Where did this app's keys come from, and when were they checked? | App source label, URL, and `lastVerified` | evidence | Printed reference facts need provenance when viewed away from stack127. | Show one compact source line per app section. Do not repeat it under every group. |
| App intro, group intro, and version context | Should descriptive reference prose print? | Source record prose | omit | The desk sheet should contain actions, bindings, scope, and provenance rather than app-page explanations. | Keep these sentences in app pages and the server-rendered guide. |
| Engine error reason | Why is no printable sheet available? | Resolution result reason | supporting | Empty groups, unknown seeded data, or no app must never leave a plausible stale preview. | Replace the preview with one reason and disable Print sheet. Do not render an empty paper frame. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Initial apps from `apps` query | optional inbound seed | yes | Known comma-separated app slugs from links on app reference pages; none on the clean route | visible through checked app controls | Server parsing reflected by `ToolCheckbox` state | A reference-page link can open the generator with that app already selected without serializing later edits. | Same checked app and preview state as a manual selection. |
| 2 | Filter apps | optional input | no | Empty | visible above the app list | `ToolSearchField` | It narrows the large catalog by app name without touching current selections. | Full-width above the internally scrolling list. |
| 3 | App selection | required input with no clean-route default | yes | User selected or inbound known seed | visible | `ToolCheckbox` list | Each checked app creates one printable section in catalog order. | One-column list at 600px and below. |
| 4 | Platform | defaulted input per selected multi-platform app | yes | All supported platforms for that app | visible inside each selected app section | `ToolChoiceGroup` | It controls the sheet's platform columns and shortcut filtering. | Full-width wrapped group beneath the app name. |
| 5 | Task groups | defaulted input per selected app | yes | Every app group selected | visible inside each selected app section | `ToolCheckbox` list | Every checked group may add rows to the artifact. | One-column list; long group names wrap. |
| 6 | Print sheet | primary action, disabled until the document is valid | not applicable | No default | visible above the preview | `ToolButton` primary | It calls `window.print()` for the exact live sheet. There is no separate Generate action. | Full-width after the document count. |

Print sheet is the only accent-filled action. Selection changes update the document synchronously, with no submit step and no stale preview. The app filter does not update the document. App option sections are not collapsible because platform and group defaults change the printed artifact.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Live paper preview | What exact document will print? | Resolved apps, platforms, groups, actions, key bindings, missing bindings, and sources | One light paper-like `[data-print-root]` document that remains visually consistent in either site theme | The same DOM must drive preview and print. Do not create a hidden second document or put control-only text inside it. |
| 2 | Document size | How many app sections and shortcut rows are in this sheet? | Exact app and shortcut counts | One `ToolStatus` sentence above the sheet: `2 apps, 26 shortcuts` | Remove the controls-side selected count and do not print this summary unless it is part of the sheet title context. |
| 3 | Empty or invalid preview | Why is there nothing safe to print? | Engine reason or empty selection | One calm message in the preview area with Print sheet disabled | Do not show a dashed fake-paper card, a zero-count sheet, or stale table rows. |
| 4 | Printed scope | Which apps and platforms does this paper cover? | App names and selected platform labels | Sheet title plus one compact context line; multi-app sheets also give each app its own heading | Do not repeat task-group names in the top context line because they already head their rows. |
| 5 | Shortcut tables | Which binding performs each selected action? | Ordered group and shortcut records | One semantic table per app, with group row headers and selected platform columns | Do not sort alphabetically, merge apps, infer missing keys, or hide `Not documented`. |
| 6 | Source footer | Can I verify the printed shortcuts later? | Official source label, URL, and last-verified date | One compact line after each app table; source label remains a link on screen and readable text in print | Omit app intro and version-context paragraphs from the paper. |

The wide-screen workbench puts controls on the left and the paper preview on the right. At narrower widths, controls come first and preview follows. The preview is the visual lead even though controls precede it in keyboard order.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Paper preview | The selected document is the same artifact that will print | Yes. Paper width, grouping, and table columns represent the printed document structure. | Use a light paper-like document in both themes and reuse the same DOM for print. |
| Shortcut tables | Repeated actions mapped to the same selected platform fields | Yes. Rows align actions and columns align platform bindings. | Use one table per app with source order intact. |
| App and group hierarchy | Apps contain ordered task groups, which contain shortcut rows | Yes. Heading levels and grouped table bodies encode ownership. | Use sheet h2, app h3 when needed, and one table body per task group with a row-group header. |
| Shortcut-count chart | Relative size of apps or groups | No. Counts only help judge sheet volume and do not need geometry. | Omit charts, bars, and count cards. |
| Keyboard illustration | What keys look like | No. Decorative keycaps add ink but no new binding facts. | Omit marker art, keyboard diagrams, and ornamental keycap graphics. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Clean initial | No app selected; filter empty; no app options; Print sheet disabled | Absent | Preview says `Choose an app to see the sheet.` | Check an app or use a reference-page seed link | Natural document focus and no unsolicited announcement. Clean canonical URL remains unchanged through hydration. |
| Seeded initial | Known `apps` query slugs are checked; defaults select all platforms and groups | Live printable sheet | Exact document count and source metadata | Edit selections normally | Server and hydrated output agree; announce no extra restoration message. |
| Filtered app list | Matching apps remain visible; selected hidden apps stay selected | Unchanged | Document count and preview unchanged | Clear search to restore the full list; `No apps match` appears only in controls | Focus stays in Filter apps; do not announce a new document count. |
| Valid live document | One or more apps resolve to non-empty sections | Exact paper preview | Count, platform context, ordered tables, and per-app sources | Change app, platform, or groups, or print | Count uses polite status semantics after document-changing input. Focus stays on the changed control. |
| One platform | Selected app section keeps one platform choice | Preview table keeps Action plus only that platform | Count updates after unsupported rows drop | Choose All platforms to restore columns | Native radio state announces the choice; preview update does not move focus. |
| No groups for one selected app | App remains selected with all its groups unchecked | Absent because the document is invalid | Preview reason names the app; Print sheet disabled | Select at least one group for that app | Focus stays on the final unchecked group; reason is announced once as status. |
| Missing platform binding | Selected row has a key for at least one chosen platform but not another | Sheet remains valid | Affected cell says `Not documented` | Choose another platform or keep the documented gap | No warning announcement; the cell text carries the evidence. |
| Unknown seeded slug | Unknown values never become checked apps | Valid known selections render, or clean empty state when none are known | Unknown seed is ignored because the server supplies only catalog records | Select from visible apps | No error or fabricated app section. The route remains as opened. |
| Engine rejection | Current visible choices cannot produce a non-empty section | Absent | Exact engine reason replaces the paper preview; Print sheet disabled | Repair the named platform or group choice | Status announces the reason. No plausible sheet remains. |
| Loading | Controls and preview remain stable | Not applicable | Not applicable | Resolution is synchronous over server-supplied records; show no spinner, skeleton, or progress state | No loading announcement. |
| Partial | Current selections remain visible | Not applicable | Not applicable | The engine returns the complete selected document or no document | Never show a partly resolved sheet beside an error. |
| Printing | Current controls and preview state remain in memory | The same sheet DOM is the print root | Browser print UI owns printer, paper, scale, and page count | Cancel or finish in the browser dialog; the page returns unchanged | `window.print()` handles focus return. Do not claim that printing completed. |
| Print pagination | Current document remains valid | Same artifact, potentially split by browser pagination | Table headers repeat where supported; group heading stays with its first row when possible | Trim groups or apps if a shorter printout is wanted | No fake one-page guarantee or calculated page count. |
| Runtime failure | Controls remain and Print sheet is disabled | Absent | One concise failure status | `The sheet could not be built. Your choices are still here.` | Focus failure status only for an unexpected exception; offer recovery by changing a choice. |

The only expanded state is the browser print dialog, which the page does not control. App settings stay expanded as ordinary sections, not disclosure widgets.

## Component contract

| Need | Chosen component | Why it fits | Rejected alternative |
| --- | --- | --- | --- |
| Find an app | `ToolSearchField` | It gives a large local list a labelled filter and clear action without changing selection. | Scroll-only discovery becomes slow as the catalog grows; a combobox would hide multi-selection. |
| Select apps and groups | `ToolCheckbox` | Apps and groups are independent selections with native checked state. | Toggle switches imply immediate system settings; selected tags make removal harder to discover. |
| Choose platform per app | `ToolChoiceGroup` | All platforms or one platform is a mutually exclusive visible choice. | A select hides the platform columns that will print; tabs imply view switching instead of document filtering. |
| Print action | `ToolButton` primary | It is the one terminal action and can expose a real disabled state. | A Generate button is false because preview updates live; a download button implies server PDF creation. |
| Document count or error | `ToolStatus` | It announces the current resolved document without competing with the sheet. | A metric card makes the count look like the product; duplicate selected counts add noise. |
| Printable artifact | Page-owned semantic sheet with app headings and tables | The source records have a print-specific hierarchy that shared generic result components do not express. | `ToolDataTable` owns horizontal scrolling and cannot represent group row headers or print-only source footers. |

The sheet uses literal black and neutral gray print colors on white paper instead of site theme tokens that may print unpredictably. Interactive controls keep shared tokens and focus behavior.

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Wide desktop, above 900px | Fixed 320px to 360px controls column beside flexible preview; filter, apps, selected app settings, then preview count and Print sheet | Full catalog list, three platform columns, and long action text | App list owns vertical scroll; paper frame owns any horizontal preview scroll. Page has no horizontal overflow. |
| Tablet, 601px to 900px | Controls stack above preview; selected app sections remain fully visible; paper stays at its print width | Several selected apps with many groups | Paper frame owns horizontal scroll only when needed. Controls and page do not scroll sideways. |
| Narrow mobile, 320px to 600px | Filter, one-column app list, selected app platform and groups, count, Print sheet, then paper preview | A long app name, group title, and three-platform shortcut row | Paper frame owns horizontal preview scroll; the real sheet keeps print geometry. |
| Print media | Hide app shell, sidebar, page header, controls, guide, preview count, button, and frame chrome; show only `[data-print-root]` | Multi-app selection with repeated table headers and source URLs | Browser print pagination owns vertical breaks. No screen overflow behavior leaks into print. |
| 200% zoom or long translated labels | Controls grow vertically and preview frame remains below or beside according to available width | `Adobe Substance 3D Painter` and a long official source label | App list and paper frame remain the only scroll owners. Nothing overlaps or clips. |

## Interface wireframes

### Desktop result

```text
Shortcut Cheat Sheet Generator

+----------------------------------+  +----------------------------------------------------+
| Choose apps                      |  | 2 apps, 26 shortcuts                  [Print sheet] |
| Filter apps                      |  |----------------------------------------------------|
| [notion______________________x]  |  | Keyboard shortcuts cheat sheet                    |
| [ ] Apple Notes                  |  | Brave Browser | Windows, macOS, Linux              |
| [x] Notion                       |  | Notion | macOS                                    |
| [ ] Notability                   |  |                                                    |
|                                  |  | Brave Browser keyboard shortcuts                   |
| Notion                           |  | Tabs and windows                                   |
| Platform                         |  | Action                   Windows  macOS  Linux      |
| [All] [Windows] [macOS] [Linux]  |  | New tab                  Ctrl T   Cmd T  Ctrl T     |
| Groups                           |  | ...                                                |
| [x] Popular and desktop          |  | Source: official Brave keyboard shortcuts          |
| [x] Markdown and formatting      |  | Verified 2026-08-26                                |
| [ ] Database and commands        |  |                                                    |
|                                  |  | Notion keyboard shortcuts                          |
| Brave Browser                    |  | ...                                                |
| Platform and groups stay visible |  | Source: official Notion keyboard shortcuts         |
|                                  |  | Verified 2026-08-26                                |
+----------------------------------+  +----------------------------------------------------+
```

### Narrow mobile result

```text
Shortcut Cheat Sheet Generator

Choose apps
Filter apps
[notion____________________x]
[ ] Apple Notes
[x] Notion
[ ] Notability

Notion
Platform
[All platforms              ]
[Windows                    ]
[macOS                      ]
[Linux                      ]
Groups
[x] Popular and desktop shortcuts
[x] Markdown and formatting
[ ] Database and commands

1 app, 34 shortcuts
[Print sheet                ]
--------------------------------
|  Keyboard shortcuts preview ->
|  Notion keyboard shortcuts
|  Notion | Windows, macOS, Linux
|
|  Action          Windows  macOS ...
|  Search page     Ctrl F   Cmd F ...
|  ...
|  Source: official Notion keyboard shortcuts
|  Verified 2026-08-26
--------------------------------
Paper preview scrolls inside this frame.
```

### Initial, invalid, loading, empty, partial, failure, and expanded states

Clean initial state has no paper document:

```text
0 apps
Choose an app to see the sheet.
[Print sheet disabled]
```

Filtering to no catalog match changes only the controls:

```text
Filter apps
[zz-no-match________________x]
No apps match this filter.

[existing selected app options remain below]
[existing live sheet remains unchanged]
```

Removing the last selected group from one app invalidates the whole sheet:

```text
Brave Browser
Groups
[ ] Tabs and windows
[ ] Browser tools
[ ] Address bar and search
[ ] Page and editing
Select at least one group for Brave Browser.

Nothing to print for Brave Browser with that choice.
[Print sheet disabled]
```

Loading and partial document states do not apply. The browser print dialog is the only expanded state and prints the same sheet DOM. An unexpected resolution failure removes the paper preview, disables Print sheet, keeps all choices, and shows `The sheet could not be built. Your choices are still here.`

## Removed or rejected

- Remove the controls-side `n selected` count. The preview summary already reports document size.
- Replace the scroll-only app picker with a labelled local search plus the checkbox list. Search does not change selected apps.
- Replace open `details` elements for selected app options with always-visible sections. Platform and group defaults change the artifact and must not hide behind collapsible controls.
- Add the official source label, source link, and last-verified date to each app section in the preview and printed sheet, as required by the brief and source records.
- Fix print ownership so print media hides the full app shell, sidebar, header, controls, guide, and frame chrome, then prints only `[data-print-root]`.
- Do not generate a second hidden print document, server PDF, download, account, saved sheet, share state, branding controls, page-count estimate, or fit-to-one-page claim.
- Do not print app intros, group intros, version-context paragraphs, filter text, selection controls, counts, or status messages.
- Do not collapse selected app options, sort shortcut rows, infer missing platform keys, or turn bindings into decorative keycap art.
- Do not add cards, charts, screenshots, marker art, colored left borders, or a separate Generate action.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid selection renders one `[data-print-root]` paper preview as the strongest result, and Print sheet prints that same DOM. | DOM identity, print-media, and screenshot assertions. |
| UI-002 | deduplication | The selected-app count is absent from controls; one document count appears above preview; each app has one source footer. | DOM text-count assertions. |
| UI-003 | visual-truth | App, group, action, and platform relationships use heading hierarchy and semantic tables; no count chart, keycap illustration, or progress visual appears. | DOM and print-tree inspection. |
| UI-004 | responsive | At 320px, 375px, 600px, 900px, desktop, and 200% zoom, controls keep their order, the page has no horizontal overflow, and only the paper frame owns preview overflow. | Browser measurements and screenshots in both themes. |
| UI-005 | url | Opening `/shortcuts-cheatsheet-generator` leaves the clean canonical URL unchanged through hydration; a known `apps` query only seeds initial checks, and later edits never mutate URL or storage. | Server render, Browser URL, history, and storage assertions. |
| UI-006 | search | Filter apps matches app names without changing selection, preview, or print state; a no-match query has one controls-only empty message. | Browser filter and state-preservation test. |
| UI-007 | inputs | Every selected multi-platform app shows its active platform choice and all group choices without a disclosure; single-platform apps omit the redundant platform group. | Accessible control assertions for representative apps. |
| UI-008 | live-update | App, platform, and group changes synchronously replace the complete resolved sheet and count without a Generate action, stale rows, or focus movement. | Browser selection and count assertions. |
| UI-009 | empty | No app shows the exact empty message and disabled Print sheet; no-groups selection names the app, removes the sheet, and disables printing. | Engine fixtures and Browser states. |
| UI-010 | missing | A retained shortcut without one selected platform binding says `Not documented` and never copies another platform's key. | Engine fixture and table-cell assertion. |
| UI-011 | source | Each printed app section contains its official source label, link destination, and ISO last-verified date once. | Source-record comparison and print DOM assertion. |
| UI-012 | print | Print sheet is the only accent action, calls `window.print()` only for a valid document, and print media exposes only the sheet with readable tables and repeated headers where supported. | Print spy, print stylesheet inspection, and PDF or print-preview check. |
| UI-013 | order | App sections follow catalog order; task groups and shortcuts preserve source order; selected platform columns preserve app platform order. | Engine and rendered-order fixtures. |
| UI-014 | accessibility | Search, checkboxes, radio groups, count status, table headers, disabled print state, 44px targets, and focus rings work by keyboard without relying on color. | Accessibility tree, keyboard test, and manual screen-reader check. |
| UI-015 | components | Search, app and group checks, platform choices, status, and Print sheet use shared tool controls without changing the resolution input. | Source inspection and shared component tests. |
| UI-016 | failure | Invalid or unexpected resolution exposes no partial paper, preserves all choices, disables Print sheet, and announces one exact recovery reason. | Injected invalid-data Browser test. |

## Open questions and blockers

- None. The current resolution engine and structured app records define selection order, filtering, missing bindings, and source metadata. Browser print owns paper size and pagination, so the interface makes no one-page guarantee beyond showing the exact printable document.
