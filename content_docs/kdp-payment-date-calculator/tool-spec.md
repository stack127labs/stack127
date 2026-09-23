# KDP payment date calculator

Route: `/kdp-payment-date-calculator`

## Research

### User job

Estimate when KDP is likely to issue royalties for a reported earnings month, including the longer schedule for Expanded Distribution. Authors also need to know whether the estimate refers to Amazon's payment date or the day money reaches their bank. The existing `/kdp-royalty-calculator` estimates royalties; it does not cover payout timing.

### Competitor patterns

Reviewed on 23 September 2026. Searches for KDP payment dates, payout schedules, and payment timing found one direct calculator: [ebookdone's KDP Payment Schedule Calculator](https://www.ebookdone.com/tools/kdp-payment-schedule). Its live page shows a month input, an earnings type selector, an estimated payment date, and a count of days from today. The visible example applies about 60 days to September 2026 and labels the result "on or around November 29." It also mentions the 90 day Expanded Distribution schedule and direct deposit arrival time. The page's visible fields and default result were inspected, but alternate inputs could not be operated in this session; their behavior is unknown.

The useful pattern is to start with the month whose royalties were reported and distinguish standard distribution from Expanded Distribution. Gaps: the exact-looking day exceeds KDP's approximate schedule, which specifies a payment month; the page gives a general $100 threshold for checks and wires even though KDP's threshold table varies by marketplace and payment method; and its arrival note omits differences by method and location beyond the general EFT timing.

[Kelso's royalty payment dates guide](https://kelsohq.com/royalty-payment-dates/) is an adjacent reference, not a KDP date calculator. Its cross-store table separates payment timing, payout thresholds, and bank arrival, and it states that published dates are approximate. The existing stack127 KDP royalty calculator is adjacent but does not calculate payment timing.

### Technical facts and sources

- KDP says royalties are paid monthly, approximately 60 days after the end of the month in which the sale was reported, or approximately 90 days for Expanded Distribution, once any required threshold is met. Its payment FAQ maps the month a threshold is met to a payment at the end of the second following month, such as January to the end of March. This supports an estimated payment month, not a guaranteed calendar day. [When will I get paid?](https://kdp.amazon.com/en_US/help/topic/GK2MKZUL6U3SFBPZ) and [KDP's print-book pricing and payment schedule](https://kdp.amazon.com/en_US/help/topic/G8BKPU9AGVZSF9QF).
- Use the month KDP reports the royalty for, not an assumed individual transaction date. The Payment Report includes a Sales Period and a Payment Date; KDP defines the Payment Date as when Amazon transfers funds to the bank, while its delivery guidance treats the time funds appear in the account as a separate delay. The Payment Report is the source for a user's actual past payment date. [Payment Report](https://kdp.amazon.com/en_US/help/topic/G201436840).
- EFT has no KDP payment threshold. Check and wire thresholds apply separately by marketplace and local currency, after applicable tax withholding. If a check or wire balance is below its threshold, KDP carries it forward and pays after the threshold is met; the payout month can therefore differ from the month initially entered. Local bank rules may still affect EFT receipt. [Payment Thresholds](https://kdp.amazon.com/en_US/help/topic/G201207800) and [KDP Payment Options](https://kdp.amazon.com/en_US/help/topic/GJD7DFFX6X88AK46).
- Delivery after KDP's payment date varies by method and location: direct deposit usually takes 1–5 business days, or 7–10 for banks in India; wire takes 5–10 days; checks can take up to 30 days to arrive. These are delivery estimates, not changes to the royalty schedule. [When will I get paid?](https://kdp.amazon.com/en_US/help/topic/GK2MKZUL6U3SFBPZ).
- KDP's reports distinguish estimated royalties from recorded payments. The Payments report is updated about 60 days after the month in which the sale was reported, with a longer reporting delay for Expanded Distribution. [KDP Reports](https://kdp.amazon.com/en_US/help/topic/GVTTXHKHVPAPBEDQ).

### Opportunity and blockers

Give authors a transparent estimate from the reported month and distribution type, state the estimate as approximate, and separate Amazon's scheduled payment from bank or check arrival. Point users to the KDP Payment Report for a confirmed past payment date. Do not imply the calculator can see whether a threshold was met, whether KDP has finalized a royalty, or whether a bank will release funds on a specific day.

A basic schedule estimate needs no API, account, paid service, or maintained dataset. Exact handling of check and wire rollovers would need current marketplace thresholds and supported payment methods; exact arrival estimates would need region and method rules that KDP can change. No external approval is needed for the basic estimate. The official rules do not specify one exact payment day, and the direct competitor's alternate-input behavior remains unverified in this session.

## Product

### User, job, and promise

An independent author wants to plan cash flow from a month of reported KDP royalties. Enter the reported earnings month and distribution type to estimate the month Amazon normally issues payment. Explain the eligibility condition and the separate delivery delay beside the result. The useful distinction is a readable month estimate that follows KDP's schedule without inventing a guaranteed day.

### Launch scope

- One reported month and one distribution type per calculation. Standard distribution covers royalties on the normal approximately 60-day schedule. Expanded Distribution uses the approximately 90-day schedule.
- Show an approximate payment month, a short explanation of the month offset, and the original inputs. A past month stays a historical schedule estimate and never becomes a claim that payment happened or is overdue.
- Always explain that check and wire thresholds must be met. A balance below its applicable threshold can carry forward. The tool cannot establish eligibility or estimate the later payout from that balance.
- Separate delivery guidance from the payment month. Show the researched method estimates as reference information, including the India EFT exception, with an official KDP source link. No receipt-date calculation or method/location inputs are needed at launch.
- Exclude royalty amounts, tax calculations, threshold lookup, carryover accounting, account access, exact payment dates, countdowns, holiday calendars, exports, and annual payment tables. Future months are allowed as planning scenarios under the current rule.

### Inputs and calculation

| Input | Contract |
| --- | --- |
| Reported earnings month | Required month value in strict `YYYY-MM` form, with year 2007 through 2100 inclusive and month 01 through 12. These years are a supported input range, not a historical policy guarantee. Start empty. Help identifies the month KDP reports the royalties for, not a purchase date. |
| Distribution type | Required enum `standard` or `expanded`. Default to `standard`. Explain Expanded Distribution in the selector help so print authors do not assume all print sales use that schedule. |

Validate unknown input types and enum values at the engine boundary. Trim surrounding whitespace from the month string, then require the full format. Reject single-digit months, date suffixes, decimals, missing values, and out-of-range years or months. Do not let JavaScript's date parser normalize invalid values.

Use integer calendar-month arithmetic. Convert the input to `year * 12 + month - 1`, add 2 for standard or 3 for Expanded Distribution, then recover the output year and month with division and modulo. No day arithmetic, rounding, local timezone conversion, or business-day adjustment applies. Output may reach March 2101 for the maximum input.

Display the output as a month name and four-digit year, with an explicit approximate label and an explanation that KDP normally pays toward the end of that month. The 60/90-day language is the source rule; the calendar-month offset is the planning model. Do not calculate 60 or 90 literal days from a month's last day because that produces misleading day precision and can choose a different month.

Official KDP help in Research controls the rule. The competitor's exact-day calculation has no authority. This is a static rule, so calculation needs no remote request. Source links and the researched date can explain its basis without suggesting a live KDP lookup.

### States, action, and privacy

The primary action calculates the estimate. Before the first submission, show an empty result prompt. On valid submission, render the payment month and its conditions together. Editing either input removes the old result until the user submits again, preventing an old month from appearing to match new inputs.

On invalid submission, show a field error, move focus to the first invalid control, and show no estimate. Missing month, malformed month, unsupported year, and unknown distribution type each return a structured validation error from the engine. A valid future month is not an error. No input combination proves that a particular user has met the payment threshold, so all successful results retain the eligibility qualification.

There is no partial result from invalid input. Missing account information does not block a schedule estimate; explain that eligibility and actual payment status remain unknown. If an unexpected calculation failure occurs, clear the result and provide a retry instruction. Do not manufacture a fallback date. No loading state or network retry is needed for this synchronous calculation.

Keep inputs in component memory only. No account, cookies, browser storage, URL parameters, API submission, or analytics payload containing entered values. Use normal React rendering for output; no user-controlled HTML or URLs. The surrounding site may still use its existing analytics.

### Independent correctness examples

These examples follow the named calendar months in the schedule, independently of the proposed implementation.

| Reported month | Type | Expected estimate or behavior |
| --- | --- | --- |
| January 2026 | Standard | March 2026, approximately toward month end, conditional on payment eligibility. |
| January 2026 | Expanded | April 2026, approximately toward month end, conditional on payment eligibility. |
| November 2026 | Standard | January 2027. |
| December 2026 | Expanded | March 2027. |
| February 2024 | Standard | April 2024. Leap day does not affect the month offset. |
| December 2100 | Expanded | March 2101, valid output beyond the input year ceiling. |
| ` 2026-01 ` | Standard | March 2026 after trimming outer whitespace. |
| Empty string, `2026-00`, `2026-13`, `2026-1`, `2026-01-01`, `2006-12`, or `2101-01` | Standard | Validation error, no estimate. |
| `2026-01` | Unknown enum | Validation error, no estimate. |

For January 2026 standard royalties that have not met a check or wire threshold, March 2026 is only the normal schedule estimate. The tool must not promise March payment or assign another payout month.

### Ownership

- Public route `/kdp-payment-date-calculator`; server page at `app/(site)/(tools)/kdp-payment-date-calculator/page.tsx` uses the existing tool-page loader, shared shell, `PageCanvas`, header, and Markdown renderer.
- Pure parsing and month arithmetic live in `lib/kdp-payment-date-calculator/engine.ts`, with focused correctness tests beside the engine following repository conventions.
- Interactive controls and result states live in `app/(site)/(tools)/kdp-payment-date-calculator/kdp-payment-date-calculator.tsx`. Reuse shared tool components and styles. Add a colocated CSS module only for layout that shared styles cannot express.
- No runtime API or maintenance dataset. Use existing shared development content/publication scripts; place any necessary one-off page script under `scripts/kdp-payment-date-calculator/`.
- This spec owns planning. Database tool rows own title, introduction, usage, supporting copy, and versions. The central page registry owns publication and SEO. Development preview may use clearly marked temporary copy; final public prose awaits the user's writing handoff. Do not add route-owned metadata or a committed duplicate of database prose.

## Interface

### Task and structure

The user question is when Amazon normally issues payment for one reported earnings month. The lead answer is one approximate month and year. The primary action is `Estimate payment month`. Control mode is `single`; both inputs stay visible.

Use the shared full-width workbench band with a measured inner column. Place the month field, distribution choices, action row, one divider, and result in that order. Keep the same order at every viewport. Do not introduce nested cards, a calendar, metric tiles, a countdown, or a timeline. A month estimate and a small delivery table explain this task without a chart.

### Controls and component decisions

Reuse the inspected primitives from `app/tool-ui/tool-controls.tsx`, as demonstrated in `/tool-ui-lab` and the KDP royalty calculator. Keep the sibling's workbench spacing and form/result division, but show validation only beside the affected field.

| Control | Component and behavior |
| --- | --- |
| `Reported earnings month` | Reuse `ToolTextField`, required, empty initially, placeholder `2026-01`. Use text input because the current shared field does not support a month picker. Visible helper: `Use YYYY-MM for the month shown in your KDP royalty report.` Disable autocomplete, capitalization, and spellcheck. Keep a normal text keyboard so the hyphen is reachable. This is the engine's month string directly. |
| `Distribution` | Reuse required `ToolChoiceGroup` with visible `Standard` and `Expanded Distribution` options. Default Standard. Helper: `Choose Expanded Distribution only for royalties reported through that program.` Preserve shared radio semantics and arrow-key navigation. |
| Action | Reuse `ToolActionRow` and primary `ToolButton` for `Estimate payment month`. Enter submits the form. Keep it enabled with incomplete input so submission can identify the missing field. |
| Reset | Reuse a secondary `ToolButton` labeled `Reset` after the primary action. Clear month, result, errors, and operation failure; restore Standard and focus the month field. |

No new shared component is required. Route-owned code arranges these controls and manages state. Reuse existing control typography, color tokens, `--radius`, and focus styles. Do not replace internal component styling. Required marks and programmatic required state come from the shared fields.

### Result order and wording

1. Reuse neutral `ToolPrimaryResult`, labeled `Approximate payment month`, with one large month/year value. Its detail says `Usually toward the end of the month. This estimates when Amazon issues payment.` Do not use success green, a precise day, or a claim that the payment is confirmed.
2. Immediately below, show one visible eligibility paragraph: `Direct deposit has no KDP payment threshold. Check and wire payments depend on the threshold for each marketplace. A balance below its threshold carries forward, so payment can be later.` Follow with `This tool cannot confirm your payment eligibility or status.` Link the threshold phrase to the official threshold page in Research. This qualification stays outside disclosures and uses readable body text.
3. Show the calculation basis once in a compact sentence containing the submitted earnings month and chosen distribution type. State that the planning estimate uses two calendar months for Standard or three for Expanded Distribution, based on KDP's approximate 60/90-day rule. Do not repeat the output month in this sentence or add another summary of the same inputs.
4. Under `After Amazon issues payment`, reuse `ToolDataTable` for the reference below. Introduce it with `Arrival takes extra time. These are delivery estimates, not guaranteed receipt dates.` The table is guidance, not another calculated output.
5. End with quiet source and verification links: `KDP payment timing` to the official timing page, `KDP Payment Report` to its official help page, and `Rules checked 23 September 2026`. State `Use your KDP Payment Report to check an actual payment.` Links reuse the exact official URLs in Research. Do not suggest that opening a help page accesses the user's account.

| Payment method | Typical delivery after issue |
| --- | --- |
| Direct deposit | 1 to 5 business days |
| Direct deposit to banks in India | 7 to 10 business days |
| Wire transfer | 5 to 10 days |
| Check | Up to 30 days |

The month estimate, eligibility, calculation basis, delivery reference, and verification each answer a different question. Keep the delivery table below the estimate, never beside it as an equal-weight panel. All result content appears only after valid submission; initial guidance remains limited to the controls and empty prompt.

### State behavior

- Initial and reset: empty month, Standard selected, no result. Beneath the divider show `Enter a reported month to estimate payment timing.` Reset announces `Calculator reset.` without changing the URL.
- Valid: replace the empty prompt with the result and all its qualifications. Move focus to the primary output after rendering. Use that focused output to announce the estimate; avoid an additional visible success message repeating it.
- Changed input: clear the prior result and return to the empty prompt. Clear that field's validation error and any operation failure. Keep focus in the edited control. A polite, visually hidden status may announce `Inputs changed. Estimate again.` once when removing a result, rather than on every keystroke.
- Invalid: show only the field error and focus its control. Missing month uses `Enter a reported earnings month.` Malformed month uses `Use YYYY-MM, with a month from 01 to 12.` Unsupported year uses `Use a year from 2007 to 2100.` Unknown distribution uses `Choose Standard or Expanded Distribution.` Do not render a second error list, error result, or date. The focused field exposes its linked error to assistive technology.
- Unexpected failure: retain entered values, remove the result, and use `ToolStatus` with danger tone once: `The estimate could not be calculated. Try again.` The primary action retries; do not add a competing retry button.
- Loading, no match, partial result, and disabled states do not apply to the synchronous month calculation. Unknown account eligibility is explained in every valid result rather than presented as a partial calculation.
- Restored state: there is no application persistence or query-string restoration. Reload starts from the initial values. Do not rewrite the canonical URL on hydration or edits. If the browser preserves a page in its back/forward cache, keep its form and result together; any subsequent edit clears that result.

### Responsive and accessible behavior

Use one column throughout. The month field may have a modest maximum width on desktop; the two distribution options share a row when they fit and wrap without shrinking labels. At mobile width, inputs and primary action use the available width, and actions stack in primary-then-reset order. Preserve comfortable shared hit targets and visible focus in both themes.

Use `min-width: 0` on layout children and wrapping for explanatory copy and month names. Keep long pasted field values contained inside the text input. The two-column delivery table should wrap its labels and guidance; if overflow remains, use the shared table's internal scroll region rather than page-level scrolling. No sibling may cover its cells.

Keyboard order follows month, distribution group, estimate, reset, and source links. Preserve radio arrow keys and normal Enter submission. Successful submission focuses the output, invalid submission focuses the first invalid field, and reset focuses the month input. Do not move focus merely because an input changes. Use semantic form labels, a labeled result region, table headers, and shared descriptions/errors so keyboard and screen-reader users receive the same estimate and qualifications.

The build review should visibly confirm one approximate lead month, readable eligibility beside it, separate delivery guidance, no stale estimate after editing, recoverable inline errors, unchanged canonical URL, and no horizontal page overflow at desktop and mobile widths. These are observable checks, not a separate requirement registry.

## Content

### Search intent and metadata direction

The main intent is to estimate a KDP payout from a reported royalty month. Target the existing task name, KDP payment date calculator, with natural supporting references to payment schedule and Expanded Distribution. Some visitors will be checking a missing payment; distinguish that task from schedule planning early.

Keep the title centered on the calculator name. The description should name the reported month and distribution choice, promise an approximate payment month, and indicate that bank arrival takes additional time. Avoid exact-date, guaranteed-payment, live-account, or overdue-payment claims. These are directions for the manual writer, not finished metadata.

### Page promise

The reader should leave with a usable month for cash-flow planning, understand why their payment may arrive later, and know where to check an actual payment. The introduction should establish the estimate's scope before the tool without delaying access to the inputs.

### Content completeness map

| Reader question | UI coverage | Writer's job and location |
| --- | --- | --- |
| Which month should I enter? | Month helper gives the report basis and required format. | Usage guide should connect the input to the reported earnings period and distinguish it from an individual purchase date. |
| Does a paperback use Expanded Distribution? | Selector help restricts the option to that program. | Usage guide should make the program choice explicit; book format alone does not select it. |
| When will Amazon pay? | Lead result gives an approximate month; calculation basis explains the offset. | Introduction should promise that level of precision. Supporting example should explain the two schedules without reproducing the calculation sentence. |
| Is this when money reaches my bank? | Result includes a separate delivery table. | Introduction should flag the distinction; supporting content should explain issue versus receipt without duplicating the table. |
| Why might the payment come later? | Every result explains threshold carryover and unknown eligibility. | Supporting content should direct check/wire users to the applicable threshold and their report. Do not diagnose an account from the estimate. |
| Where can I confirm a past payment? | Result links to Payment Report help. | End supporting content with the report as the next step, keeping recorded payment and estimated schedule distinct. |

### Recommended outline and formats

Keep the interactive tool first after a short introduction. Follow it with a compact usage guide and two supporting sections. Proposed heading directions and purposes:

1. Usage guide: identify the reporting month, choose the distribution program, and interpret the approximate output. Include one format example for users recovering from invalid input.
2. Payment schedule example: use a small comparison table with January 2026 as the shared reported month, Standard giving March 2026 and Expanded Distribution giving April 2026. Explain the month estimate and eligibility condition beside the example. Avoid an annual calendar or precise dates.
3. Checking a payment that has not arrived: explain threshold carryover, separate delivery time, and the Payment Report next step. Link to official help where the reader needs current account or method details.

The result already contains a delivery table. Do not add a second delivery table, FAQ, glossary, standalone methodology, chart, or decorative figure. The example comparison is enough visual support for this short task.

### Concepts and result interpretation

The finished engine was operated directly on 23 September 2026. January 2026 returned March 2026 for Standard and April 2026 for Expanded Distribution. Input `2026-13` returned a month-format error and no result. Route and component code were also reviewed. Browser interaction was unavailable in this session, so these observations do not establish visual or keyboard behavior.

| Concept | Example and caveat for the writer | Source basis |
| --- | --- | --- |
| Approximate payment month | January 2026 Standard produces March 2026. This is a planning estimate for issue toward month end, conditional on eligibility. It supplies no exact calendar day. | Research timing sources and Product calculation contract. |
| Expanded Distribution | The same reported month produces April 2026 for the program. Do not treat every print sale as Expanded Distribution. | Research timing sources and Product scope. |
| Threshold carryover | A check or wire balance below its applicable threshold can be paid later than the displayed month. The calculator has no balance input and cannot assign the eventual month. | Research Payment Thresholds source. |
| Payment date and arrival | A recorded Amazon transfer can precede receipt in the bank account. The delivery table is reference guidance, not a calculated arrival date. | Research Payment Report and timing sources. |

Use the precise result term, approximate payment month, when interpreting an answer. Explain terms in place. A past input remains a schedule scenario and proves neither that payment occurred nor that it is overdue.

### Usage, limits, and next step

Plan the usage guide around an author checking royalties reported for January 2026. Have the writer explain where the month comes from, why the distribution choice matters, and how to use the month estimate for planning. Refer to the comparison example rather than repeating result values throughout the page.

For input recovery, show the accepted `YYYY-MM` form and the supported 2007 through 2100 input years. Do not imply historical policy coverage across those years. Future months use the current rule as a scenario. Explain that editing an input requires a fresh estimate only if needed in the usage guide; routine clicks and reset behavior need no prose tutorial.

Avoid claims about exact payout days, receipt dates, countdowns, threshold eligibility, bank holidays, account status, tax amounts, or a live KDP connection. Do not call a historical estimate an unpaid balance. The tool neither calculates royalties nor diagnoses missing payments.

The next step for an actual payment is the user's KDP Payment Report, using the official help page to interpret it. For estimating royalty amounts, offer the existing `/kdp-royalty-calculator` as a separate related task.

### Source roles and links

Use the exact official URLs already recorded in Research. The timing help controls the approximate schedule and method-specific delivery guidance. Its detailed delivery section is the basis for the UI table; a later general sentence on that page gives different delivery ranges, so do not combine them into a new promise. Payment Thresholds controls carryover and marketplace eligibility conditions. Payment Report controls the distinction between a reported sales period, Amazon's transfer date, and payment status. KDP Payment Options is a useful onward link only if discussing supported methods by location.

Research and the three primary result links were checked on 23 September 2026. Present that as a rules-check date, not evidence of a live account lookup. Recheck official guidance when revising schedule or delivery claims. Competitor pages inform layout choices only.

Keep internal linking limited to the relevant `/kdp-royalty-calculator` task. Do not invent a KDP topic hub or additional related pages. Final title, introduction, usage, and supporting prose still await the user's manual writing handoff.
