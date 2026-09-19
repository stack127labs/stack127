# Interface contract: KDP royalty calculator

Status: ready
Feasibility: feasible. The existing engine and shared controls support this interface contract within the approved product scope. This planning update does not certify runtime behavior, external services, or publication readiness.
Tool: KDP royalty calculator
Route: `/kdp-royalty-calculator`
Mode: pipeline
Review scope: Contract refresh within the unfinished new-tool pipeline, using its ready research and product inputs. This refresh reviews planning and source evidence only. Runtime state operation, rendered component consistency, and final tool acceptance remain separate required checks.
Depends on: `brief.md`, `implementation-report.md`
Input fingerprint: `brief.md sha256:e88c2b8c9b71e15a9a1729bc1c05af84fbaaf220b7fb6b4d6bac79f482e311c4`
Input fingerprint: `implementation-report.md sha256:c8ad4f6712d70ac4caa65de2a5172475e47f6a8ce02ae1a08d916256c02bf405`

## User task

- Primary user: A self-publishing author choosing a US Amazon.com list price for a paperback, hardcover, or Kindle eBook.
- Question: What will this KDP scenario leave per sale at the selected list price?
- Lead answer: The royalty per sale in USD, with the effective rate and selected format beside it.
- Next decision: Keep or change the list price, then use the price floor, ad ceiling, and optional monthly target to judge the scenario.

## Information decisions

| Item | User question | Source | Disposition | Reason | Duplicate guard |
| --- | --- | --- | --- | --- | --- |
| Format | Which KDP product is being priced? | `format` input | input | It selects the calculation branch and the fields that can affect the answer. | Keep the choice in the form. Mention the selected format once in the lead detail, not in a second summary. |
| Trim size | Which print size and cost class apply? | `trimSizeId` input and shared KDP preset catalog | input | It changes print cost, page limits, and regular or large trim classification. | Show it only in the active print form and the compact lead detail. eBook has no trim control. |
| Print profile | Which interior and paper cost branch applies? | `printProfile` input | input | Black ink, groundwood, standard color, and premium color use different KDP costs and compatible bindings. | Use one combined profile control; do not split it into separate interior and paper selectors. |
| Page count | How many printed pages are charged? | `pageCount` input | input | It changes printing cost and can make the selected trim/profile invalid. | Keep page count in the form and show the effective even count only in the cost receipt when it differs. |
| List price | What sale price should the selected scenario test? | `listPriceUsd` input | input | It changes the rate band, royalty, margin, floor validation, and comparison rows. | The input owns the entered value; the lead detail may identify the rate at that price, but no separate price metric is needed. |
| eBook royalty option | Which digital royalty option is being attempted? | `ebookRoyaltyOption` input | input | It changes the eBook equation and can produce a clear 35% fallback warning. | Show it only for eBooks and state the effective rate once in the lead and warning. |
| eBook file size | What file-size floor and delivery deduction apply? | `ebookFileSizeMb` input | input | It changes the eBook delivery cost and the 35% minimum price band. | Show the entered size in the eBook form and the rounded delivery detail only in the receipt. |
| Monthly target | How many copies would reach an optional income target? | `monthlyTargetUsd` input | input | It enables a useful follow-on decision without changing the selected-price royalty. | Keep the field visible but optional; its result appears only in the monthly-target region. |
| Calculate royalties | When should the current scenario produce an answer? | Form submission | input | An explicit action separates editing from a committed result and gives validation a clear recovery point. | Use one primary action. Do not calculate on every keystroke. |
| Reset | How can the author return to known defaults? | Local form action | input | It clears errors and results and restores format-specific defaults. | Keep one quiet secondary action beside the primary action; do not repeat it below the result. |
| Amazon.com, USD, standard distribution | Which market and channel does the number describe? | Fixed formula scope | evidence | The calculator is deliberately US-first and excludes Expanded Distribution, so the scope must be visible without becoming a control. | Show one short scope line near the scenario and one matching source note; do not add marketplace or currency selectors. |
| Selected-price royalty | What does one sale earn under this scenario? | `selectedRoyaltyCents`, effective rate, and list price | lead | This is the answer the author came to get. | Render one dominant lead value. Do not repeat it as a metric card or prose sentence. The comparison table may repeat it only as the selected row in a multi-price comparison. |
| Printing or delivery deduction | What KDP charge produced the royalty? | Fixed cost, page cost, printing cost, file-size KB, or delivery cost | supporting | The author needs a compact receipt to audit the result and find the cost driver. | The receipt owns all cost components. Do not add a second cost equation or cost chart. |
| Minimum price and royalty margin | What is the cost-covering floor and what share remains at the selected price? | `minimumPrice`, `royaltyMargin` | supporting | These values guide the pricing decision after the lead royalty. | Show each once in one supporting region. The comparison table repeats them only as row fields needed for cross-price comparison. |
| Price comparison | How do the exact boundary prices change the economics? | Unique valid floor, selected, and rate-band rows | supporting | Repeated price, rate, cost or delivery, royalty, and margin fields need aligned columns. | The table is the only repeated-price view. Do not add cards or a second chart for the same rows. |
| Break-even ad headroom | How much advertising spend can one sale absorb before royalty reaches zero? | `maxBreakEvenAdSpend`, `breakEvenAcos` | supporting | It answers the ad decision without pretending to forecast performance. | Show one labeled value and ACoS. When royalty is non-positive, show no positive headroom and no negative ACoS. |
| Copies for monthly target | How many sales reach the entered monthly amount? | `monthlyTargetCents`, rounded royalty cents, `copiesForTarget` | supporting | It turns the selected royalty into simple unit math when the author asks for it. | Render only when a target is entered. A non-positive royalty owns the `unknown` explanation. |
| Rate warning and validation status | Can the result be used, and what assumption needs attention? | Typed validation issues and eBook fallback warning | supporting | A 70% eBook selection outside its band remains calculable only after a visible 35% fallback explanation. | Place each message at the smallest useful scope. Do not mirror the same warning in a banner, field, and result. |
| Formula version and source date | Which current KDP rules support this answer? | Local formula constants, version, and official KDP links | evidence | Rate-sensitive output needs a quiet audit trail and a refresh date. | Keep it in a compact source/details region. Do not turn sources into competing result cards. |
| Exclusions and assumptions | What does this number not claim? | Product contract | evidence | Taxes, VAT, refunds, price matching, promotions, demand, and author expenses are outside the model. | Use one short limitation sentence or details block. Do not add a caveat panel above the lead. |

## Input contract

| Order | Input or action | Requirement | Affects lead answer | Default source | Placement | Component | Why visible | Narrow layout |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Format | required and defaulted | yes — selects the pricing branch and active fields | Product default `paperback` | visible | `ToolChoiceGroup` with Paperback, Hardcover, and Kindle eBook | The three product branches are the first decision and should be comparable without opening a menu. | Wrap the three choices, then keep the selected branch fields below. |
| 2 | Trim size | conditionally required and defaulted for print | yes — changes print cost and page limits | Shared KDP catalog, default `6 x 9` | conditional | `ToolSelect` | The trim catalog is long and format-dependent, so a bounded select is clearer than free text. | Full width below Format when Paperback or Hardcover is active. |
| 3 | Interior and paper | conditionally required and defaulted for print | yes — selects the KDP cost and page-limit branch | Product default `Black ink / white` | conditional | `ToolSelect` | It keeps compatible profile choices together and prevents unsupported binding combinations. | Full width below Trim size; unavailable profiles never appear. |
| 4 | Printed pages | conditionally required and defaulted for print | yes — changes cost and eligibility | Product default `300` pages | conditional | `ToolNumberField` with whole-number step | Page count is a direct cost input and needs bounded numeric editing. | Full width; the validation message stays below the field. |
| 5 | List price (USD) | required and defaulted | yes — changes rate, royalty, margin, floor validation, and comparison | `$14.99` for print, `$4.99` for eBook | visible | `ToolTextField` with decimal input mode | Keeping the exact edited string allows clear currency validation without floating-point UI behavior. | Full width with a stable USD label; long invalid values wrap in the field error, not the page. |
| 6 | eBook royalty option | conditionally required and defaulted for eBook | yes — selects the requested digital rate and possible fallback | Product default `70%` | conditional | `ToolChoiceGroup` with 35% and 70% | Both options are important pricing choices, and hiding them in a select would make the rate model harder to inspect. | Two choices stay in one row when they fit and wrap as one group otherwise. |
| 7 | eBook file size (MB) | conditionally required and defaulted for eBook | yes — changes delivery cost and the eBook floor band | Product default `1 MB` | conditional | `ToolNumberField` with `MB` suffix | File size is an active pricing assumption, even for the 35% floor calculation. | Full width below the royalty option. |
| 8 | Monthly target (USD) | optional | no — changes only the optional copies result | Blank by design | visible | `ToolTextField` with decimal input mode | It enables target math without cluttering the required scenario or changing the lead royalty. | Full width below the main price fields; blank remains a normal state. |
| 9 | Calculate royalties | primary action | not applicable — commits the current inputs | No default | visible | `ToolButton` of type submit inside `ToolActionRow` | One explicit action makes the answer predictable and gives invalid input a single recovery path. | Full width before Reset. Keep its label stable during a synchronous calculation. |
| 10 | Reset | secondary action | no — restores defaults and clears the result | Restores format-specific defaults | visible | `ToolButton` with ghost or secondary treatment | It is the direct recovery action after experimenting with prices or switching format. | Full width below Calculate royalties. |

Required-field behavior: Format and every active branch input keep visible and programmatic required states. Changing Format resets incompatible fields to their branch defaults, clears any result, and reveals the newly active fields. Editing any result-driving field clears the old result immediately; it does not silently recalculate. Submit focuses the first invalid field in source order and keeps the entered strings intact. The clean canonical route has no query state, and no input or result is written to browser storage.

## Result contract

| Order | Region | Unique user question | Data | Treatment | Evidence or omission guard |
| --- | --- | --- | --- | --- | --- |
| 1 | Royalty per sale | How much does one selected-price sale earn? | Selected royalty cents, selected list price, effective rate, and format | `ToolPrimaryResult` with one dominant USD value and one short detail line | This is the only lead. Do not place the same royalty in a second standalone metric. |
| 2 | Cost receipt | What KDP deduction produces that amount? | Print fixed cost, page cost, total printing cost, effective page count, or eBook file-size KB and delivery cost | `ToolKeyValueList` with conditional rows and a short odd-page note when needed | The receipt owns all exact cost components. Do not render a cost allocation bar or duplicate equation. |
| 3 | Price floor and margin | What cost-covering floor and retained percentage apply? | Minimum valid price and royalty margin at the selected price | `ToolKeyValueList` directly after the receipt | Show the floor and margin once outside the comparison table. Do not add a recommendation or a price verdict. |
| 4 | Price comparison | How do the exact boundary prices change the economics? | Unique valid price rows with price, effective rate, cost or delivery, royalty, and margin | Semantic `ToolDataTable`; mark the selected row with text, not color alone | The table is the only repeated-price region. Omit duplicate rows and prices outside the active format's valid range. |
| 5 | Ad headroom | What is the most this sale can absorb in advertising? | Maximum break-even ad spend and break-even ACoS | Compact labeled values using `ToolKeyValueList` or a page-owned equivalent | If royalty is zero or negative, show `No positive ad headroom` and omit ACoS instead of displaying a negative budget. |
| 6 | Monthly target | How many copies reach the entered monthly amount? | Target amount and copies from rounded royalty cents | Conditional `ToolKeyValueList` or one labeled result row | Omit the region for a blank target. Show zero for a zero target and `Unknown` with its reason when no positive royalty exists. |
| 7 | Calculation details | Which rule set and exclusions define the answer? | Formula version, source date, official KDP links, Amazon.com and USD scope, standard-distribution boundary, and key exclusions | `ToolDisclosure` with quiet metadata and one concise limitation sentence | This evidence stays after the economics. It must not repeat the lead or become a source-card grid. |

The result order is lead, receipt, floor and margin, comparison, ad headroom, monthly target, then details. On a valid submission the result heading is focusable and receives focus after the DOM update. The result remains local to the browser and never promises author profit, demand, or KDP acceptance.

## Visual semantics

| Candidate | Relationship to communicate | Does geometry encode truth? | Decision |
| --- | --- | --- | --- |
| Price comparison table | The same fields across the floor, selected price, and exact rate boundaries | Yes — aligned columns compare repeated exact values without inventing a continuous scale | Use `ToolDataTable` with Price, Rate, KDP cost or delivery, Royalty, and Margin columns. |
| Royalty margin progress bar | A percentage of list price retained after KDP deductions | No — a bar would suggest a target or quality score and adds no decision beyond the exact percentage | Omit and use a labeled percentage value. |
| Price-band timeline | Where the 50% and 60% print bands or 35% and 70% eBook bands apply | No — the result uses discrete thresholds and a table communicates the exact boundary values better than equal-spaced geometry | Replace with the semantic comparison table and rate labels. |
| Cost allocation bar | How list price splits among KDP cost, royalty, and ad headroom | No — ad headroom is a ceiling, not an allocated part of a sale, and the eBook and print equations do not share one visual partition | Omit and keep the receipt plus exact economics rows. |
| Ad-spend gauge | How close a chosen ad budget is to break-even | No — the tool has no ad budget input and must not imply campaign performance | Omit; show maximum spend and ACoS as labeled values. |

## State contract

| State | Inputs and actions | Lead result | Supporting result | Error or recovery | Focus or announcement |
| --- | --- | --- | --- | --- | --- |
| Initial clean | Branch defaults are visible, monthly target is blank, Calculate royalties and Reset are available | Absent | No receipt, comparison, or economics regions | No helper panel and no unsolicited announcement | Normal focus order begins at Format. The clean URL stays unchanged. |
| Editing after a result | The author changes Format or any active field | Removed immediately so old economics cannot sit beside new inputs | Removed with the old result | Keep the edited value and clear only resolved field errors | Keep focus in the edited control and announce that the result needs recalculation. |
| Invalid submission | A required value is missing or malformed, an unavailable profile is selected, a page limit is exceeded, or price is outside its valid range | Absent | No partial economics result | Inline errors state the allowed range or recovery. Preserve all inputs and focus the first invalid field. | Announce one concise error summary; do not duplicate it inside the result area. |
| Calculating | The form is submitted with valid-looking inputs | No stale lead is shown during the action | No stale support is shown | The engine is synchronous. If a render boundary yields, keep the button width and label it `Calculating royalties...`; do not add a spinner or fake progress. | Keep focus on the submit action until the result is ready. Do not announce a loading state that users cannot observe. |
| Success | A valid print or eBook scenario is submitted | Show the selected royalty first with effective rate and format | Show receipt, floor and margin, comparison, ad headroom, optional target, and details in that order | None | Focus the result heading and announce the selected royalty once through a polite status. |
| eBook fallback warning | 70% is selected outside the `$2.99` to `$12.99` band | Show the royalty calculated at the effective 35% rate | Keep the receipt and comparison; show one warning beside the result explaining the fallback | The author can change price or choose 35%; do not block the valid calculation | Announce the fallback once. Color supplements the words `35% rate` and `70% option not eligible`. |
| No monthly target | A valid result is submitted with the optional target blank | Normal selected royalty | Omit only the monthly-target region | The blank is normal and needs no error | Do not announce an absent optional region. |
| Non-positive royalty or unknown target | The selected economics produce zero or negative royalty, or a positive target is entered with no positive royalty | Show the exact non-positive royalty without calling it profit | Show no positive ad headroom and `Unknown` target copies with the reason when applicable | Change list price, format, or print inputs and submit again | Announce the limitation once; never render a negative ad budget or infinite copy count. |
| Calculation or data failure | The versioned local constants are unavailable or the engine throws unexpectedly | Absent; remove any stale result | Keep all form inputs visible | `ToolStatus` says the calculation could not finish and leaves Calculate royalties available for retry | Focus the retry action or Calculate royalties and announce the failure as an alert. Do not clear valid input. |
| Expanded calculation details | The author opens the optional Calculation details disclosure | Lead stays unchanged | Source date, formula version, links, and exclusions appear below the economics | Closing the disclosure restores the quiet evidence state | Use native disclosure semantics. Keep focus on the trigger and do not move the lead. |
| Reset | The author activates Reset from any editable or result state | Absent | All errors, warnings, and support regions clear | Restore the Format, trim, profile, page, price, eBook, file-size, and blank-target defaults | Focus Format and announce that defaults were restored. |
| Refresh or explicit query state | The author opens the clean route or refreshes it | Starts clean with no restored result | Starts clean with defaults | No URL, storage, cookie, or server restoration exists in v1 | Leave the canonical URL unchanged through hydration and make no announcement on load. |

## Optional mode and state visibility

- Control mode: disclosure
- Reason: Format and every active pricing assumption stay visible. Print and eBook fields are conditional product branches; only calculation evidence collapses.
- Shared engine and normalized input mapping: The same royalty adapter receives the normalized format-specific input and optional monthly target. No second calculation path or alternate rules are introduced.
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
| Three product branches | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolChoiceGroup` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | All important format choices remain visible and retain radio semantics. Rejected: A select would hide the first decision and make branch changes harder to scan. |
| Long trim and profile catalogs | `ToolSelect` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolSelect` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | Bounded compatible options are easier to maintain and filter by binding than free text. Rejected: Free-text dimensions and a generic combo box would permit unsupported KDP combinations. |
| Page count and eBook file size | `ToolNumberField` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolNumberField` | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | Whole-page and bounded decimal inputs benefit from numeric semantics, step controls, and visible units. Rejected: Plain text without numeric input mode would weaken keyboard and validation behavior. |
| eBook royalty choice | `ToolChoiceGroup` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolChoiceGroup` | Keep the active value visible, expose label and selection to assistive technology, preserve keyboard selection and focus, and associate validation with the control. Wrap choice rows and constrain popovers to the viewport. Use shared control tokens. | 35% and 70% are both central, conditional choices and should not be hidden. Rejected: A disclosure would hide an active rate assumption. |
| Currency inputs | `ToolTextField` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolTextField` with decimal input mode | Keep persistent labels, required semantics where applicable, exact entered values, field-associated errors, and first-error focus. Preserve native editing and numeric keyboard behavior; labels and errors wrap on narrow widths. Use shared control tokens. | It preserves the edited string until submission and avoids presenting floating-point behavior as exact money. Rejected: A range slider or currency-only masked input would make boundary errors and pasted values harder to recover. |
| Submit and reset | `ToolActionRow`, `ToolButton` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolActionRow` with `ToolButton` | One submit is primary. Keyboard activation, disabled or busy state, and reset retain clear labels and visible focus. Keep input after failure and stack actions at narrow widths. Use shared button tokens. | One primary Calculate royalties action and one quiet Reset action preserve hierarchy and keyboard behavior. Rejected: Auto-submit, icon-only reset, or a second primary action would make the commit point unclear. |
| Dominant royalty answer | `ToolPrimaryResult` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolPrimaryResult` | One lead precedes support; announce result changes and focus the documented result target after submit. Invalid inputs create field recovery, not a fabricated answer. Long values wrap. Use shared result and text tokens. | One money value deserves a clear result lead and accessible heading. Rejected: Equal metric cards would compete with or repeat the answer. |
| Receipt and economics values | `ToolKeyValueList` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolKeyValueList` | Use semantic labels and exact values with explicit unknowns. Supporting facts follow the lead, retain source order, and stack at narrow widths. Use shared text and metadata tokens. | Exact labeled values and conditional rows are clearer than decorative panels. Rejected: `ToolMetricGroup` would make unlike cost, floor, margin, and target values appear equivalent. |
| Repeated price rows | `ToolDataTable` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolDataTable` | Retain column and row headers, full exact values, explicit unknowns, and text states. The inner table viewport owns overflow and remains keyboard reachable; required reflow preserves labels. Use shared table tokens. | The rows share a fixed schema and need aligned exact comparisons. Rejected: Cards, a chart, or a timeline would either repeat facts or imply a false continuous model. |
| Warning and failure feedback | `ToolStatus` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolStatus` plus field-level errors | Expose textual status and one concise live announcement. Keep recovery beside its input; no duplicate alert. Long messages wrap and status uses semantic text color only. | Status words and focus behavior remain accessible without relying on color. Rejected: A colored callout edge or a duplicate result error panel is rejected. |
| Sources and assumptions | `ToolDisclosure` in `app/tool-ui/tool-controls.tsx` | reuse shared | `ToolDisclosure` after the economics | Named evidence follows the answer. Enter or Space toggles disclosures with expanded state and retained focus. Escaped output remains selectable; a bounded inner viewport owns any code overflow. Use shared evidence and focus tokens. | Optional evidence stays available without competing with the pricing answer. Rejected: Source cards, raw JSON, or a second visible formula panel add noise without another decision. |

## Responsive contract

| Width or condition | Layout and reading order | Longest realistic value | Overflow owner |
| --- | --- | --- | --- |
| Desktop, wider than 960px | Keep the scenario form in the left workbench column and the result in the right column when a result exists. Form order is Format, print or eBook fields, price, target, actions. Result order is lead, receipt, floor and margin, comparison, ad headroom, target, details. | `KDP US rules checked Sep 16, 2026`, `$1,000,000.00`, and the full `No positive ad headroom` status | No page overflow. The comparison region has a minimum readable width and may own an inner viewport only if the real main column cannot fit its five columns. |
| 760px to 959px | Stack the full form before the result in DOM order. Keep active conditional fields together and let the result use the full main column. | `Premium color`, `650 MB`, and `Minimum cost-covering price` | The comparison table owns horizontal scrolling; form controls and source links wrap within their regions. |
| 375px | One column. Format choices wrap, active fields stack, Calculate royalties and Reset become full-width actions, and the result follows the desktop reading order. | `$250.00`, `70% option not eligible at this price`, and `KDP cost or delivery` | Only the comparison table scrolls inside its labeled viewport. No page-level horizontal overflow. |
| 320px | Preserve the same order and labels. Long errors and details wrap; the price table keeps its headings and can be scrolled without covering sibling content. | `Black ink / white`, `1,000,000 copies`, and `The selected price is below the calculated floor.` | The route-owned comparison viewport handles its minimum table width. Every other region uses `min-width: 0` and wraps. |
| Both themes and reduced motion | Keep the same layout, status words, focus ring, and semantic labels in dark and light themes. Do not use color as the only signal and do not animate result geometry. | Warning, failure, and non-positive royalty text must remain readable without color. | Shared tokens and the route stylesheet own contrast and spacing; `app/globals.css` is not changed. |

Stable dimensions: buttons retain a comfortable shared hit target and stable width through status changes. The result focus target does not shift when warnings appear. Table headers remain in the accessibility tree, and the page itself never owns horizontal overflow.

## Interface wireframes

### Desktop result

```text
KDP royalty calculator
Amazon.com · USD · standard KDP distribution

Scenario                                      Royalty per sale
Format *             [Paperback          v]   $4.39
Trim size *          [6 x 9              v]   60% rate at $14.99
Interior and paper * [Black ink / white  v]   Paperback · 300 pages
Printed pages *      [300                  ]
List price (USD) *   [$14.99               ]   Cost receipt
Monthly target       [optional             ]   Fixed cost              $1.00
                                                Page cost               $3.60
[Calculate royalties] [Reset]                  Printing cost           $4.60

                                                Price floor and margin
                                                Minimum price            $9.20
                                                Royalty margin           29.3%

                                                Price comparison
                                                Price | Rate | KDP cost | Royalty | Margin
                                                $9.20 | 50%  | $4.60    | $0.00   | 0.0%
                                                $9.98 | 50%  | $4.60    | $0.39   | 3.9%
                                                $9.99 | 60%  | $4.60    | $1.39   | 13.9%
                                                $14.99| 60%  | $4.60    | $4.39   | 29.3%  selected

                                                Ad headroom
                                                Break-even spend       $4.39 per sale
                                                Break-even ACoS        29.3%

                                                Monthly target
                                                $1,000 target           228 copies

                                                > Calculation details
                                                KDP US rules checked Sep 16, 2026
```

### Narrow mobile result

```text
KDP royalty calculator
Amazon.com · USD · standard KDP distribution

Scenario
Format *             [Paperback          v]
Trim size *          [6 x 9              v]
Interior and paper * [Black ink / white  v]
Printed pages *      [300                  ]
List price (USD) *   [$14.99               ]
Monthly target       [optional             ]
[ Calculate royalties ]
[ Reset ]

Royalty per sale
$4.39
60% rate at $14.99 · Paperback

Cost receipt
Fixed cost                         $1.00
Page cost                          $3.60
Printing cost                      $4.60

Price floor and margin
Minimum price                      $9.20
Royalty margin                     29.3%

Price comparison  [scroll table]
Price | Rate | KDP cost | Royalty | Margin
...

Ad headroom
Break-even spend                   $4.39 per sale
Break-even ACoS                   29.3%

Monthly target
$1,000 target                      228 copies

> Calculation details
KDP US rules checked Sep 16, 2026
```

### Initial, invalid, partial, failure, and expanded references

```text
Initial:   Scenario defaults visible. No result region. Format is first focus.
Invalid:   List price  [$5.00]
           Price must be at least $9.20 for this scenario.
           Result removed. Focus returns to List price (USD).
Calculating: [Calculating royalties...] keeps the action width; no stale result.
Partial:   eBook at $14.99 with 70% selected.
           Warning: 70% is not eligible here. Result uses 35%.
No target:  Lead and economics remain. Monthly target region is omitted.
Failure:   The calculation could not finish. [Calculate royalties] remains available.
Expanded:  Calculation details opens below the economics without moving the lead.
```

## Removed or rejected

- Remove marketplace, currency, tax, VAT, and Expanded Distribution selectors from v1; the fixed US Amazon.com scope is the data contract, not a set of unsupported branches.
- Remove separate spine, printing-cost, break-even-ad, and sales-target calculators; their outputs belong to this one pricing decision and should not become five competing primary actions.
- Remove ad budget, demand, BSR, Kindle Unlimited, sales forecast, and price-recommendation controls; the engine cannot support those claims.
- Remove saved scenarios, browser storage, and automatic URL state; v1 has no shareable state and the clean route must stay clean through hydration.
- Remove automatic calculation on every field edit; a stale answer is more dangerous than one explicit Calculate royalties action.
- Remove progress bars, margin gauges, price timelines, and allocation charts; none has a truthful denominator or adds more clarity than exact values and the comparison table.
- Remove duplicate royalty, price-floor, cost, and target metric cards; each fact has one result owner, with repetition permitted only inside the comparison table's repeated row schema.
- Remove a positive or negative verdict such as `good price` or `profitable`; the result is royalty math, not author profit or demand advice.
- Remove a success claim about KDP acceptance; the calculator exposes current source rules but does not model every order, marketplace adjustment, or review decision.

## Acceptance criteria

| ID | Category | Observable interface requirement | Evidence |
| --- | --- | --- | --- |
| UI-001 | lead | A valid submission places one `Royalty per sale` result first, with one dominant USD value and its effective rate; no other standalone result is visually equal. | Browser inspection at desktop and narrow widths. |
| UI-002 | deduplication | The selected royalty, price floor, and cost receipt each have one standalone owner; repeated values appear only where the comparison table needs them for row comparison. | DOM/text review and browser result assertions. |
| UI-003 | visual-truth | The price comparison uses aligned semantic columns, while no progress bar, gauge, allocation bar, or timeline implies a false target or continuous scale. | Interface inspection and table semantics test. |
| UI-004 | responsive | At desktop, 760px, 375px, and 320px widths, the workbench preserves task order, controls stay usable, and only the comparison table can scroll horizontally. | Browser bounds and overflow measurements. |
| UI-005 | url | Opening `/kdp-royalty-calculator` leaves the URL unchanged through server render and hydration; editing, submitting, and resetting do not serialize state. | Browser history and URL assertion. |
| UI-006 | inputs | Format changes expose only compatible fields, reset incompatible values, and keep every active result-driving defaulted input visible. | Browser interaction matrix and form inspection. |
| UI-007 | states | Invalid input, eBook 70% fallback, blank target, non-positive royalty, engine failure, retry, and reset each preserve recovery and announce the relevant change once. | Browser state matrix and accessibility inspection. |
| UI-008 | evidence | The result exposes Amazon.com, USD, standard-distribution scope and a quiet formula version/source date without adding a marketplace selector or source-card grid. | Rendered result and static source review. |

| UI-009 | component-consistency | Every visible nontrivial control and result uses the component and disposition above. Compare labels, focus, selected state, field errors, busy or disabled state where applicable, and narrow layout with the shared lab in both themes. No bare native or generic fallback may appear. | Source mapping plus required browser and keyboard review; this planning pass does not mark those runtime checks passed. |

## Open questions and blockers

- None. The builder can implement the form, result hierarchy, responsive behavior, and states without inventing another pricing model or changing the prepared formula contract.
