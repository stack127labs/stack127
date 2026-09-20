# Interface contract: KDP metadata checker

Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: KDP metadata checker
Route: `/kdp-metadata-checker`
Mode: pipeline
Review scope: Contract refresh within the unfinished new-tool pipeline, using its ready research and product inputs. This refresh reviews planning and source evidence only. Runtime state operation, rendered component consistency, and final tool acceptance remain separate required checks.
Depends on: `brief.md`, `implementation-report.md`

## User task

- Primary user: A self-publishing author doing a final local check before pasting book metadata into KDP.
- Question: Which documented formatting problems and clearly labelled review prompts are present in these fields?
- Lead answer: The last submitted snapshot is either clean or has possible issues, with a finding count and field-specific recovery steps.
- Next decision: Fix the named source text, review heuristic prompts, and submit the unchanged metadata again.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Title and subtitle | Does the combined title text fit the documented limit and avoid HTML-like input? | Submitted title and subtitle | input | They are required source fields and their combined count drives a documented check. | Keep counts beside the fields; do not repeat the title in a second result card. |
| Description source | Does the raw description fit the limit and use supported, well-formed markup? | Submitted description | input | The raw source, not a rewritten version, is what the author will paste into KDP. | The form owns the source; the preview never becomes a second editable copy. |
| Keywords | Are all seven keyword slots visible and are duplicates or title overlap worth review? | Seven submitted keyword strings | input | Exact slot-by-slot feedback is more useful than a keyword score. | Keep slot numbers in the form and identify the source slot in findings. |
| Character and tag counts | What local facts explain the check? | Pure checker result | supporting | Counts show markup cost and which fields need attention. | Render each count once in a compact result region. |
| Findings | What should the author inspect or recover? | Deterministic parser checks and bounded heuristics | lead | This is the main answer and must distinguish documented errors from prompts. | Group by field and severity; do not mirror findings in a status banner and a card. |
| Safe description preview | What will the supported description content look like without executing input? | Parsed description tokens | supporting | A visual approximation helps inspect the source while preserving the original. | Render once, with a clear safe-preview label and no editable mutation. |
| Rule disclosure | Which rule date and official sources define this local result? | Bundled rule set and KDP help links | evidence | The checker cannot promise KDP approval, so its boundary must be visible. | Put sources and the limitation in one disclosure after the answer. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Title | required text | yes — missing title prevents a valid check | Blank | visible | `ToolTextField` | It is one of the two fields that define the documented title rule. | Full width, with the count next to or below the label. |
| 2 | Subtitle | optional text | yes — changes the combined title count and overlap checks | Blank | visible | `ToolTextField` | An empty subtitle is valid, but the author needs to see the same field KDP provides. | Full width below Title. |
| 3 | Description | required source text | yes — drives length, tag, restriction, and preview findings | Blank | visible | `ToolTextArea` | This is the main field being checked and must remain unchanged. | Full width with a minimum readable height; count wraps below it. |
| 4 | Keyword slots 1 through 7 | exactly seven string slots; each may be empty | yes — drives duplicate, overlap, and restriction findings | Seven blank slots | visible | Seven labelled `ToolTextField` controls | The KDP workflow has seven slots, so hiding them behind an array or add button would obscure coverage. | One column at narrow widths; keep slot numbers stable. |
| 5 | Check metadata | primary action | not applicable — commits the current snapshot | No default | visible | `ToolButton` submit action | Findings should describe one stable submitted snapshot rather than change on every keystroke. | Full width before Reset. |
| 6 | Reset | secondary action | no — clears fields and the result | Restores blank fields | visible | Secondary `ToolButton` | It is the direct recovery action after testing copied or malformed source. | Full width below Check metadata. |
| 7 | Copy source | result-only action | no — copies the unchanged description source | Hidden until a result exists | result | `ToolButton` with clipboard feedback | The author needs the original text, not a cleaned or generated replacement. | Full width below the preview; keep the status message nearby. |

Editing after a result keeps the source values and marks the result stale. The old result may remain visible only with a clear `Check again` prompt; it must not be presented as current. Submit focuses the first invalid field in source order. The clean canonical route has no query state and no browser storage.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Check status | What did the last submitted snapshot produce? | Clean or possible-issues status, finding count, and heuristic count | `ToolPrimaryResult` with one answer-first heading and one limitation line | Never use Approved, Safe, or Guaranteed. This is the only lead. |
| 2 | Counts | Which local limits and source counts explain the status? | Combined title count, raw and visible description counts, supported tags, populated keywords, and per-slot counts | `ToolKeyValueList` with exact integer values and local-count labels | Show counts once; do not turn them into gauges or a score. |
| 3 | Findings by field | What should be fixed or reviewed? | Field, severity, code, message, recovery, and optional source position | Grouped semantic list with documented errors before heuristic warnings | Every finding says whether it is a documented check or a review prompt. Empty groups are omitted. |
| 4 | Safe description preview | How is the supported description content rendered without executing source? | Parsed text and allowlisted tag tokens | Read-only preview with a safe-preview label | Never inject raw HTML and never treat preview output as an editable cleaned description. |
| 5 | Source and limitation | Which rule set supports this local check, and what remains unknown? | Review date, official KDP links, rule version, and non-approval limitation | `ToolDisclosure` after the result | Keep evidence after the answer; do not repeat the finding summary in prose. |

The result order is status, counts, findings, preview, then sources. A valid clean submission focuses the result heading. An invalid shape has no result lead and keeps the author in the form with field-level recovery. A copy action reports success or denied clipboard permission without changing the source.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Findings list | Severity and field ownership need to be scanned and acted on | Yes — grouped rows carry exact text and recovery, not magnitude | Use a semantic list with text labels for documented error and review prompt. |
| Character limit bar | Distance from a local limit | No — the limit is a documented boundary, not a quality score, and a bar invites false precision | Omit; show `n / limit` as exact text. |
| Keyword overlap chart | Similarity between keyword phrases and title words | No — the heuristic is categorical and phrase-specific, not a numerical ranking | Omit; name the affected slots in the finding. |
| Safe description preview | Supported markup and visible content | Yes — rendered tags and text show the approximation without executing source | Use a bordered text preview with a clear safety label and no raw HTML injection. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean | Blank title and description, optional fields available | No check yet | Counters show zero or blank local values; no findings | No unsolicited warning | Focus begins at Title. |
| Invalid submission | Title or description missing, wrong keyword shape, or local input guard exceeded | No result lead | No findings or preview | Inline message names the missing or oversized field and preserves other input | Focus the first invalid field and announce one concise error summary. |
| Possible issues | Submitted source contains a deterministic problem or heuristic prompt | Possible issues found | Counts, grouped findings, safe preview, and sources | Each finding states recovery and whether it is a prompt or documented check | Focus the status heading and announce the count. |
| Clean | Submitted source has no findings | No issues found, not approval | Counts, preview, and sources remain available | State the non-approval limitation in the source disclosure | Focus the result heading; do not celebrate with animation. |
| Stale edit | Any checked field changes after a result | Old result is labelled stale | Old findings remain visibly tied to the previous snapshot | Show Check again and never silently recalculate | Keep focus in the edited control and announce that the result needs another check. |
| Copy failure | Clipboard permission is denied or unavailable | Result remains unchanged | Original source remains visible for manual selection | Show a short copy-failed message; do not rewrite or clear source | Keep focus on Copy source and announce the failure. |

## Optional mode and state visibility

- Control mode: single
- Reason: Title, subtitle, description, and all seven keyword slots belong to the same submitted snapshot. A mode switch would obscure the scope of the check.
- Shared engine and normalized input mapping: The metadata engine receives the complete immutable snapshot; edits preserve the existing stale-result treatment. No second calculation path or alternate rules are introduced.
- Active assumptions: Keep required and defaulted result-driving values in the input flow described above. Conditional fields appear beside the choice that activates them, before submission.
- Retention and recovery: Evidence expansion never changes input or result state. Retain edited values until the existing Reset, example, or branch action explicitly replaces them. Reveal and focus any invalid active conditional field; no collapsed region may hide a blocking error.
- URL, reload, and history restoration: Preserve the URL contract and existing explicit restoration behavior below. A clean canonical load must remain unchanged through hydration; this mode decision adds no query, storage, or history writes.
- Equivalent-input parity: There is one input model and one engine. A basic/advanced parity fixture is not applicable; disclosure state must not alter normalized inputs or computed output.

## Component contract

- Generic or native-looking fallback allowed: no
- Inspection: shared implementations in `app/tool-ui`, the source for `/tool-ui-lab`, this route, and sibling patterns in `/kdp-book-setup-calculator`, `/kdp-royalty-calculator`, and `/kdp-pdf-preflight-checker`. This is source inspection, not a new rendered-state verification receipt.
- Native form, input, radio, table, and file semantics may remain underneath the approved stack127 presentation. Missing behavior must receive a complete shared or justified route-specific contract; it must not become a bare native control, generic upload box, or unrelated dashboard component.
- All rows use `--text-body`, `--color-text`, `--color-border`, `--radius`, `--space-*`, and `--focus-ring` as applicable. Only metadata uses `--text-small`. Keep one accent primary action, semantic status text, both themes, and no colored left edges.
- Route-specific choices retain the behavioral reason in their row and use the existing route stylesheet. They do not introduce new controls or public behavior. Shared components own their internal appearance; route styles own placement and any stated reflow.

| Need | Existing component inspected | Disposition | Chosen component | States, accessibility, responsive behavior, and tokens | Why it fits; rejected alternative |
| --- | --- | --- | --- | --- | --- |
| Title, subtitle, and seven keyword slots | `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextField | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Persistent labels and field errors retain each source value. Rejected: No placeholder-only labels or merged keywords. |
| Description source | `ToolTextArea` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolTextArea | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Preserve exact description source and associated guard errors. Rejected: No silent cleaned output. |
| Submission, reset, and source copy | `ToolActionRow`, `ToolButton`, `ToolCopyAction` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolActionRow, ToolButton, and ToolCopyAction | Actions are explicit and keyboard accessible. Copy success follows a confirmed write; failure keeps text selectable. Downloads use the current report. Preserve focus, label actions, and wrap at narrow widths. Use secondary shared button tokens. | One Check metadata action captures a snapshot; copy uses the checked source. Rejected: No auto-submit or generated rewrite. |
| Primary answer and stale state | `ToolPrimaryResult`, `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolPrimaryResult and ToolStatus | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | Keep one local-check result and announce when edits make its snapshot stale. Rejected: No approval score. |
| Counts | `ToolKeyValueList` in `app/tool-ui/tool-controls.tsx` | reuse shared | ToolKeyValueList | Use semantic labels and exact values with explicit unknowns. Supporting facts follow the lead, retain source order, and stack at narrow widths. Use shared text and metadata tokens. | Raw and visible character counts remain distinct. Rejected: No progress gauges. |
| Field findings and safe preview | `ToolDataTable`, `ToolKeyValueList`, and `ToolDisclosure` in `app/tool-ui/tool-controls.tsx`; current route markup | route-specific | Page-owned grouped findings and parsed-tag preview | Preserve semantic headings, lists, or figures and the route-specific relationship described here. No interactive element loses its label or visible focus. Wrap long text, keep exact data accessible, and use site text, border, spacing, and focus tokens. | Retain field, severity, recovery, and safe supported-tag structure. Rejected: No raw dangerouslySetInnerHTML or card per finding. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Wider than 960px | Keep the input workbench and result in two columns when a result exists; form order remains title, subtitle, description, keywords, actions | Long malformed tag message and the full source disclosure | Each column uses `min-width: 0`; long text wraps. |
| 760px to 959px | Stack the complete form before the result; keep findings and preview in result order | Seven keyword fields and a 4,000-character count | No page overflow; preview text wraps within its region. |
| 375px | One column, one keyword field per row, full-width actions, result after form | `Unsupported tag <script>` and `Review prompt: keyword 7 overlaps title words` | Long findings wrap; no horizontal page scrolling. |
| 320px and reduced motion | Preserve labels, focus, status words, and order; do not animate counts or result geometry | Clipboard failure and source URLs | Shared tokens and route styles own wrapping; no color-only state. |

## Interface wireframes

### Desktop result

```text
KDP metadata checker
Local rule check · original source preserved

Inputs                                      Possible issues found
Title             [A Quiet Atlas________]    3 findings · 2 review prompts
Subtitle          [Notes for attention__]    Title + subtitle       42 / 199
Description       [source text..........]    Description raw         421 / 4,000
                  [....................]    Visible text             380
Keywords          1 [quiet travel_______]   Supported tags            4
                  2 [slow journeys______]   Populated keywords         5
                  3 [__________________]    Findings by field
                  ...                         Description
                  7 [__________________]      Error · unsupported tag
[Check metadata] [Reset]                       Review · promotion phrase
                                             Safe description preview
                                             Rendered source approximation
                                             [Copy source]
```

### Narrow mobile

```text
KDP metadata checker

Inputs
Title             [____________________]
Subtitle          [____________________]
Description       [                    ]
                  [                    ]
421 / 4,000 local characters
Keywords
1                 [____________________]
2                 [____________________]
...
7                 [____________________]
[ Check metadata ]
[ Reset           ]

Result
Possible issues found
3 findings · 2 review prompts
Counts
Findings by field
Safe description preview
[ Copy source ]
Rule details
```

## Removed or rejected

- Removed an approval score because local text checks cannot reproduce KDP's private review systems.
- Rejected live KDP submission, account connection, scraping, URL-shared state, and browser storage because the job is a private local preflight.
- Rejected AI rewriting and cleaned-description export because changing source text would undermine the copy-preservation contract.
- Rejected charts and gauges because the available facts are categorical findings and exact counts, not continuous measures.

## Acceptance criteria

| ID | Category | Acceptance test | Guard |
| --- | --- | --- | --- |
| UI-001 | lead | A submitted snapshot shows exactly one status lead: clean or possible issues, never an approval verdict. | The result has no competing score or metric lead. |
| UI-002 | deduplication | Counts, findings, preview, and sources each appear in one owned region. | No finding is repeated as a banner and a list row. |
| UI-003 | visual-truth | The preview renders parsed safe content and exact counts remain text. | No raw HTML injection, gauge, or false similarity scale. |
| UI-004 | responsive | At 320px and 375px, fields and findings wrap without page-level horizontal overflow. | Only long source text may scroll inside its own region if needed. |
| UI-005 | url | The canonical route remains `/kdp-metadata-checker` with no query-state dependency. | Editing and checking do not change the URL or write storage. |
| UI-006 | lead | On invalid submission, the result lead is absent and the first invalid field receives focus. | The author keeps all entered source values for recovery. |

| UI-007 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

No implementation blocker remains. The rule set is US KDP metadata guidance reviewed on 2026-09-16. A future source review may change the allowlist or limits and must increment the bundled rule-set version; it must not be inferred from competitor behavior at runtime.
