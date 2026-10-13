# Burn multiple calculator

Route: `/burn-multiple-calculator`

## Research

### User job

A solo SaaS founder or operator has net cash burn and ARR figures for a reporting period and wants to see how much cash the company used for each dollar of net new ARR. The existing `/saas-metrics-calculator` includes a monthly burn multiple as one result, using that month's net cash burn and annualized net new MRR. There is no focused Burn Multiple route. A standalone calculator serves the narrower task of checking two period-matched figures without completing the broader snapshot.

### Competitor patterns

- [Nautis Burn Multiple Calculator](https://getnautis.com/calculators/burn-multiple-calculator) is a quarterly calculator with prefilled net burn of $200,000 and net new ARR of $150,000, which displays 1.33×. I changed the values to $12,000 and $24,000 and saw 0.50×. Zero or negative net new ARR produced an em dash and an undefined explanation. A $0.01 denominator produced 1,200,000.00× and an “Inefficient” verdict, while the displayed denominator rounded to $0. The calculation works, but the verdict and rounded input hide how little positive ARR supports that extreme ratio.
- [PercentageCalculatorFree SaaS Burn Multiple](https://percentagecalculatorfree.com/calculators/saas/saas-burn-multiple) has two inputs and Calculate and Reset actions. It returned 0.50× for $12,000 net burn and $24,000 net new ARR, and 1,200,000.00× for a $0.01 denominator. After submitting zero or negative ARR, it retained the earlier 0.50× result, leaving stale output visible for the edited values.
- [Codivox Burn Multiple Calculator](https://codivox.com/tools/burn-multiple-calculator/) offers monthly, quarterly, and yearly windows. It says both values must cover the selected same window and that it does not auto-annualize. Its inputs describe net cash burn and net ARR movements. The page rendered in headless Chrome, but the Calculate button detached while I tried to operate it, so I did not use its calculated outputs. The other operated examples repeat the two-input, same-period pattern.

### Technical facts and sources

- Burn multiple = net burn ÷ net new ARR, measured over the same reporting period. [Craft Ventures' definition](https://www.craftventures.com/articles/the-burn-multiple) describes the metric for a month, quarter, or year and gives a Q1 example: $2 million burn ÷ $1 million net new ARR = 2×. Its co-founder explicitly says the ratio does not compute when net new ARR is zero. [ChartMogul's Burn Multiple definition](https://chartmogul.com/saas-metrics/burn-multiple/) also defines net burn as cash spent beyond cash received in the period and net new ARR as ARR change: new business plus expansion, minus churn and contraction.
- Use net cash burn, not total spending or gross burn. A negative net burn means cash was generated; the existing Stack127 SaaS Metrics calculator reports “Cash generating” instead of a negative multiple. With positive net new ARR and zero burn, the formula gives 0×.
- ARR is an annualized recurring-revenue measure, not cash collected or revenue already earned during the next year. For an MRR-based convention, [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) annualizes MRR as `MRR × 12` and excludes one-time fees. Stack127's sibling ARR tool uses this convention; the SaaS Metrics tool calculates a monthly burn multiple as `net cash burn ÷ (12 × net new MRR)`. Keep the burn and ARR change on the same month, and make clear that a company's reported ARR can use its own inclusion rules.
- A zero net new ARR denominator has no defined multiple. A negative change means ARR shrank, so a signed quotient no longer answers how much cash produced each dollar of growth; show that the metric is unavailable and explain that ARR declined. A very small positive denominator remains calculable but can create a very large ratio. For example, `$12,000 ÷ $0.01 = 1,200,000×`; preserve the denominator's displayed precision and avoid a health verdict. Craft notes that benchmarks vary by company stage, so a single score band is not a supported universal judgment.
- Examples: Craft's Q1 figures produce `2×` ($2 million ÷ $1 million) and `5×` ($5 million ÷ $1 million). Independently, `$12,000` net burn ÷ `$24,000` net new ARR is `0.50×`. For a zero denominator the result is undefined; for a negative denominator it is not a burn-per-dollar-of-growth measure.

### Opportunity and blockers

Make the focused calculator explicit about the cash basis, ARR change, and reporting window so users enter net cash burn and net new ARR from the same period. Show the calculation and both amounts beside the result. Handle zero and negative ARR change as unavailable, identify cash generation when net burn is negative, and keep a small positive denominator visible when it creates a large ratio. Do not add stage-independent grades or benchmarks. The existing SaaS Metrics route already calculates a related monthly result, so the focused route should be clear about its direct two-figure task.

The manual calculation needs no paid API, maintained dataset, account, or background job. It cannot verify cash-flow classification or a company's ARR policy. No blocker is known for the calculation scope.

## Product

### Promise and scope

A solo SaaS founder or operator has net cash burn and the change in ARR for one completed reporting period. They want to know how much cash the company used for each unit of net new annual recurring revenue. Enter the two known figures directly; the tool returns their ratio, the exact amounts used, and the period. This is the focused check when the wider `/saas-metrics-calculator` snapshot is unnecessary.

Launch is a manual, single-company, single-currency calculation for one named month, quarter, year, or other consistent reporting window. Net cash burn is operating cash spending less cash collected from customers during that window; exclude equity funding and loan proceeds from cash received. A negative value means the business generated cash under the chosen burn policy. If investment outlays are included in that policy, keep their treatment consistent across periods; the calculator does not prescribe a universal capital-expenditure rule. Net new ARR is ending ARR minus starting ARR across the *same* window. ARR is an annualized recurring-revenue run rate at each endpoint, so its change is already in annualized currency units. If using MRR under a consistent policy, the net new ARR for a month can be the month's net new MRR multiplied by 12. For a quarter, use the ARR change from the quarter's opening to closing, with that quarter's actual net cash burn. Do not multiply quarter burn by four or automatically annualize either entered figure. The shared period label makes the intended match visible but cannot verify the underlying records, cash-flow classification, or ARR inclusion policy.

No starting/ending ARR builder, cash-flow worksheet, gross burn, runway, forecasts, peer comparison, score band, funding recommendation, import, account, or external data at launch. The result does not claim that all burn caused the ARR growth or that one ratio is a universal measure of company health. Do not infer a burn multiple from bookings, total spending, recognized revenue, cash receipts, or a negative ARR change.

### Technical contract

**Inputs and validation.** Start with the reporting period and both required amounts empty, with USD visibly selected. The two amounts use the same selected currency and the same named period. Currency changes formatting only; it does not convert a figure or change its meaning.

| Input | Accepted value and meaning |
| --- | --- |
| Reporting period | Required plain-text label, 1 to 80 characters after trimming outer whitespace, such as `April 2026` or `Q1 2026`. This names one shared measurement window; it does not drive date arithmetic. Reject control characters and render the label only as text. |
| Currency | Required USD, EUR, GBP, INR, CAD, or AUD, matching the SaaS sibling tools. Display monetary values to two decimal places. |
| Net cash burn | Required signed amount from `-1,000,000,000,000.00` through `1,000,000,000,000.00` inclusive. Positive means business cash used during the period; zero means neither net use nor generation; negative means cash generated under the chosen burn policy. Exclude new equity and borrowing proceeds; it is not total expense or gross burn. |
| Net new ARR | Required signed amount in the same range. It is the change in the ARR run rate between the start and end of the period, already expressed as an annualized amount. Positive means growth, zero means no change, and negative means decline. |

Keep amount inputs as raw strings. Trim outer whitespace, then accept base-10 digits with an optional leading minus sign and an optional period followed by one or two digits. Accept explicit zero and leading zeros. Reject blanks, leading plus signs, grouping commas, currency symbols, internal whitespace, exponent notation, more than two decimals, nonfinite values, and out-of-range values; never coerce them to zero. Normalize a signed zero to zero. Validate the same rules in the pure engine, including a non-object input, non-string amounts or period, and unsupported currency. Parse monetary amounts to integer cents so accepted inputs and displayed monetary values remain exact at the bounds.

**Answer and precedence.** For positive net new ARR and nonnegative net cash burn, `burn multiple = net cash burn cents / net new ARR cents`. Divide the two figures as submitted. A zero burn with positive ARR growth yields `0.00×`. For negative net cash burn, the lead result is `Cash generating` and there is no negative numeric multiple, regardless of the ARR change. If that ARR change is zero or negative, also state beside the result that there was no positive net new ARR; do not imply growth. For nonnegative burn and zero ARR change, the multiple is `Undefined` because there is no growth denominator. For nonnegative burn and negative ARR change, the multiple is `Unavailable` because ARR declined, and a signed quotient would not mean cash used per unit of growth. These are valid submitted snapshots, not field errors. Show no stale number or implied zero for either unavailable case.

Show the period, currency, and signed burn and ARR change beside every result; show their direct division only for a numeric multiple. Preserve exact cents in the money display, especially a positive `0.01` denominator. Do not abbreviate money or large multiples. Format a numeric multiple to two decimal places with half-up rounding from the exact integer-cent ratio; use integer or BigInt arithmetic for rounding so large values and half-way cases do not depend on floating-point approximations. If a positive ratio would round to `0.00×`, display `<0.01×` so it cannot be mistaken for zero. Do not cap large results, add an arbitrary health grade, or attach benchmark colors. The tool makes no period conversion; its result is meaningful only when both amounts cover the same window and the reader's ARR definition is consistent.

**Action and state.** `Calculate burn multiple` is the sole primary action. A valid submission shows the numeric or explicit nonnumeric result above its basis. An invalid or missing value clears any earlier result, keeps the entered strings, shows a precise error beside each affected field, and focuses the first invalid field in reading order. Editing the period, currency, or either amount immediately clears the old result until recalculation. An unexpected local calculation failure clears the result, preserves inputs, and leaves the same action available to retry. Reset empties the period and amounts, restores USD, clears errors and results, and focuses the period field. The operation is synchronous and local: there is no loading, network retry, partial result, or unknown amount treated as zero.

Keep period and financial inputs in client component memory only. Do not add them to the URL, browser storage, cookies, requests, logs, or analytics events. Existing site analytics may record the page visit without tool inputs. Render submitted text as text, never as HTML or a link. Reload starts empty; browser back/forward cache may restore a form and result together, and the next edit must still clear that result.

### Known examples

These checks are independent arithmetic on figures from one stated period, using USD unless noted.

| Net cash burn; net new ARR | Expected result |
| --- | --- |
| Q1 2026: `2000000`; `1000000` | `$2,000,000.00 / $1,000,000.00 = 2.00×`. The quarterly burn is used once; it is not multiplied by four. |
| April 2026: `12000`; `24000` | `$12,000.00 / $24,000.00 = 0.50×`. If the latter came from `$2,000.00` net new MRR, that MRR was multiplied by 12 before entry. |
| `0`; `24000` | `0.00×`, a valid zero-burn result with positive ARR growth. |
| `12000`; `0` | `Undefined` because net new ARR is zero, including if burn is also zero. |
| `12000`; `-24000` | `Unavailable` because ARR declined; do not show `-0.50×`. |
| `-500`; `24000`, then `-500`; `0` | `Cash generating` in both cases, with no numeric multiple. The second case additionally says there was no positive net new ARR. |
| `12000`; `0.01` | `1,200,000.00×`; display the denominator as `$0.01`, not `$0.00`. |
| `1`; `8`, then `0.01`; `2.50` | `0.13×` from the half-way case `1/8 = 0.125`; `<0.01×` from `0.01/2.50 = 0.004`. |
| `1000000000000.00`; `0.01` | `100,000,000,000,000.00×` with no clipping or abbreviation; both inputs are within bounds. |
| Blank period or amount; `1e3`, `$100`, `1,000`, `0.001`, `+1`, or `1000000000000.01` as an amount; unsupported currency | Precise field error and no result. A bare `0` is accepted and must not be treated as blank. |

### Ownership

- Public URL `/burn-multiple-calculator`. Place the server page and client workbench in `app/(site)/(tools)/burn-multiple-calculator/`, using the shared shell, `PageCanvas`, tool-page loader, and database Markdown renderer. Do not add route-owned publication or SEO metadata.
- Keep strict parsing, validation, exact-cent inputs, result classification, and ratio rounding in `lib/burn-multiple-calculator/engine.ts`; use independent arithmetic, parser, bounds, and state-precedence examples in `tests/pages/burn-multiple-calculator/`. The route component owns raw form, focus, error, and result state. Use a colocated CSS module only for composition, with shared controls, display components, and tokens. No API route, dataset, or background job.
- This spec owns the contract. `public.stack127_tool_pages` owns the visible title, introduction, instructions, supporting Markdown, version, and card copy; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog rank. Mark development preview copy as temporary. A dedicated page-update script, if needed, belongs under `scripts/burn-multiple-calculator/`.

### Catalog placement

Primary and only catalog: `/saas-tools`, already present in development. A reader browsing SaaS tools can choose this direct cash-efficiency calculation beside revenue, retention, and margin checks. Reserve display order 10, after the earlier SaaS tool cards; confirm the full ordered membership list during integration. No secondary catalog serves this task.

Catalog `toolSpot` art key: `burn-multiple-calculator`. Visual takeaway: net cash used is compared with a gain in recurring-revenue run rate. Focal subject: one clearly shrinking cash stack. One supporting object: a single rising ARR step beside it. Keep it wordless, measured, and legible at card size in both themes. Avoid numbers, currency glyphs, flames, score colors, a universal good/bad threshold, or a generic calculator icon. The drawing must read differently from the gross-margin card's two revenue-and-cost columns and the SaaS Metrics card's MRR movement column.

## Interface

### Flow

The reader asks, "How much net cash did we use for each unit of net new ARR in this period?" The one primary action is `Calculate burn multiple`. Control mode is `single`: the reporting period, currency, net cash burn, and net new ARR are the complete visible input set. There are no advanced options or hidden defaults. The lead answer is the multiple when burn is nonnegative and net new ARR is positive, otherwise the Product-defined `Cash generating`, `Undefined`, or `Unavailable` state.

Use the shared full-width workbench band and a measured inner form. Read in this order: Reporting period; Currency; Net cash burn; Net new ARR; Calculate and quiet Reset; one divider; lead result; exact submitted basis; short status reason when needed. Keep guidance beside the amount group: `Use net cash burn and the change in ARR from the same period.` Beside net new ARR, briefly clarify `ARR is already an annualized run rate. Enter its change for this period.` Do not add a period conversion selector, starting and ending ARR fields, a cash worksheet, or a preset example. The supporting article can explain a monthly MRR-to-ARR conversion and why quarter burn is not annualized.

### Components and states

| Area | Shared component and behavior |
| --- | --- |
| Period | Required `UiTextField` labeled `Reporting period`, with `Q1 2026` as example text. Keep the actual entered label visible in the result; it is one shared window for both amounts. |
| Currency | Required `UiSelect` labeled `Currency` with Product's six choices and USD visibly selected. Place it before both amounts; show the selected currency code by their group or labels, since one currency applies to both. Changing it relabels values and clears the result without converting an amount. |
| Amounts | Two required `UiTextField` controls labeled `Net cash burn` and `Net new ARR`, in that order. Keep raw text for strict signed-money validation. Use a text keyboard on mobile so a minus sign remains available. The brief shared-window and ARR guidance above appears once beside the relevant fields, rather than repeating a paragraph below each. Do not prefill zero. |
| Actions | `UiActionRow` with a primary `UiButton` for `Calculate burn multiple` and a quiet secondary or ghost `UiButton` for `Reset`. Keep Calculate enabled on a blank form so the reader gets field-specific errors. |
| Answer and feedback | Neutral `UiPrimaryResult` with label `Burn multiple` for all four result states; use `UiStatus` for edit, reset, and unexpected-failure messages. The two-amount basis is a small route-specific text composition below the lead, without a new shared component. |

Set `autoComplete="off"`, capitalization off, and spellcheck off on the text fields. Keep persistent labels, visible required marks, programmatic required state, and errors associated with each field. `UiNumberField` would coerce malformed money before validation. `UiQuantityInput` would attach the currency selector to just one amount even though it applies to both, so use one separate select. Follow shared focus, border, radius, type, and color tokens. No chart, table, ratio bar, slider, export, or copy action adds clarity to a two-amount division.

**Result order.** `UiPrimaryResult` leads with the numeric ratio or the exact Product status, then gives the submitted period and currency code in its detail. Beneath it, show each submitted amount once with its label and full selected-currency formatting. For a numeric result, make those two values a readable division line, `Net cash burn [amount] ÷ net new ARR [amount]`; for a nonnumeric result, use the same labels and values without displaying a misleading quotient. A positive one-cent ARR change must appear as `$0.01`, never `$0.00`; `1,200,000.00×` and the maximum `100,000,000,000,000.00×` must remain full. Show `<0.01×` for a positive multiple that would round to zero. There is no second metric card or repeated ratio.

Keep one concise reason under a nonnumeric lead: negative burn says the business generated cash and no negative multiple is shown; zero net new ARR says there is no growth denominator; negative net new ARR says ARR declined and the ratio cannot measure cash per unit of growth. Apply the accepted precedence: negative burn leads with `Cash generating`; if its ARR change is zero or negative, also say explicitly that ARR did not grow or declined. Zero burn with positive ARR gives `0.00×`, while zero burn with zero or negative ARR follows the denominator state. All statuses use neutral styling; none is a grade.

**States and recovery.**

- **Initial and incomplete:** period and amounts are empty, USD is selected, and no result or example figure appears. A blank submit places a specific error by each missing required field and focuses the first.
- **Valid numeric:** show the multiple, period and currency, and exact division basis together. Focus the labeled result and let its output announce the answer once.
- **Valid nonnumeric:** show the Product status and reason, with the same period, currency, and exact entered values. Focus the labeled result. Do not substitute zero, infinity, or a signed negative multiple.
- **Invalid:** clear any prior result; keep the entered strings; associate missing, malformed, out-of-bounds, or unsupported-currency errors with their controls; focus the first invalid field in visible order. Do not add an error panel or duplicate an error in the result area. Entered `0` is valid; an empty string is missing.
- **Edit after result:** changing any of the four fields clears the complete prior result immediately and announces `Inputs changed. Calculate again.` once, without moving focus. Do not leave a result based on older figures visible.
- **Unexpected failure and retry:** clear the result, retain all inputs, show one error `UiStatus` near Calculate, and leave the action available to retry. Calculation is synchronous and local, so loading, network retry, no-match, and partial-result states do not apply.
- **Reset and restoration:** clear drafts, errors, feedback, and result; restore USD; focus Reporting period and announce reset. A clean `/burn-multiple-calculator` URL stays unchanged through hydration and use. Reload starts empty. If browser back/forward cache restores form and result together, the next edit still clears the result.

Use one polite status announcement for edits and reset, and one error announcement for an unexpected failure. A focused result announces success or the nonnumeric answer; do not also announce an identical live success message. Field errors are read when validation focus moves to the affected control.

### Responsive and accessible behavior

At desktop width, keep period and currency above the two amounts. The amounts may share one row only when both full labels, guidance, and field errors fit without collision; otherwise stack them. Keep one aligned action row and the lead result directly below the workbench divider. Use spacing rather than nested cards to separate input from answer. Do not shrink the result type solely to fit an extreme ratio.

At mobile width, stack period, currency, burn, ARR change, Calculate, Reset, lead, and basis in exactly that order. Ensure a minus sign can be entered in either money field. Let input text scroll inside its own control while editing. Allow an 80-character period label and full money values to wrap in the result; allow break opportunities after ratio digit groups so `100,000,000,000,000.00×` stays readable without clipping or page-level horizontal scroll. Keep `-$` or the relevant negative currency sign with its amount, and retain `$0.01` precision. Use `min-width: 0` on grid children and check both themes at desktop and mobile width.

Tab order follows period, currency, burn, ARR change, Calculate, and Reset. Enter submits; buttons work with Enter and Space; the shared select retains its keyboard and mobile behavior. Focus the first field error after invalid submission, the lead output after a valid submission, and period after Reset. Keep a visible focus ring. Make the result label, status reason, period, currency code, and both signed amounts available to screen readers. Review the real page with the ordinary 0.50× case, cash generation with zero ARR growth, zero burn, declining ARR, `$0.01` denominator, a malformed signed amount, the maximum ratio, and a long period label.

## Content

Follow `stack127_docs/writing-style.md` for writing, visual choices, and SEO wording.

Use the Page structure section of `skills/stack127/tools/stack127-tool-writing/SKILL.md` to prepare the writing directions below.

### Search intent and metadata direction

A reader searching for a burn multiple calculator has net cash burn and an ARR change from a month, quarter, or year and wants a direct ratio. Meet that task before broader SaaS-finance interpretation. Follow the writing skill's `Tool name: the question it answers or the outcome it helps with` pattern: start the visible title with `Burn multiple calculator`, then name cash used per unit of net new ARR in plain words. The introduction must stand alone: define the two figures, give `net cash burn ÷ net new ARR`, use one short worked example, and connect it to the two-field tool. This formula is simple enough for the introduction; do not delay it until a supporting formula block.

The SEO title should pair `burn multiple calculator` with net cash burn and net new ARR. The description should say that the reader enters both figures from the same period to see the ratio or a clear reason it cannot be shown. Keep the catalog card name short and its description focused on this direct cash-to-ARR-growth comparison, distinct from the broader monthly SaaS Metrics card. Do not promise a company grade, investor benchmark, verified financial records, or a forecast. The development preview's placeholder copy and metadata are not writing source material.

### Page promise

After using the page, the founder should know the burn multiple implied by their period-matched figures, or why a number is unavailable. They should understand that net burn is a cash figure for the named window while net new ARR is the change in an already annualized recurring-revenue run rate across that window. They should be able to check the source figures and compare another period under the same definitions without mistaking the ratio for a universal score or proof that the burn caused the growth.

### Content completeness map

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| What is my burn multiple? | One lead result and the exact submitted division for a positive ARR change and nonnegative burn. | Give the plain formula and one matched-period example in the introduction; explain what `2×` means without claiming causation. |
| Which figures and period belong together? | One period label, one currency, two signed amount fields, and same-period guidance. | Define operating cash burn without counting funding or loans as customer cash, and net new ARR as ending ARR less starting ARR. Show how to use a completed quarter's actual burn and ARR change without multiplying quarter burn by four. |
| Is ARR already annualized? | The ARR field says it is an annualized run rate; the tool does no conversion. | Explain that each ARR endpoint is already annualized. For a monthly MRR-based convention, net new MRR × 12 can supply net new ARR; a company's ARR policy may differ. Never apply ×12 to entered ARR or annualize cash burn. |
| What if growth or burn is zero or negative? | `0.00×`, `Undefined`, `Unavailable`, or `Cash generating` appears with a reason and both exact amounts. | Explain the distinctions briefly, especially that cash generation takes precedence and can coexist with flat or declining ARR. Unknown input is not an entered zero. |
| Why is the ratio huge or different from another report? | The basis retains cents, including a `$0.01` denominator, and shows the selected period and currency. | Explain that a tiny positive ARR change can make the quotient very large. Compare period boundaries, net-cash classification, and ARR inclusion policy before drawing a conclusion; do not attach a health grade. |
| What should I do next? | The result gives the current period's arithmetic, not a trend. | Suggest checking the source cash and ARR movement, then comparing periods under the same definitions. Link to a relevant stack127 monthly metrics or MRR movement tool when published. |

### Recommended outline and formats

**Introduction before the workbench:** a compact explanation for someone with a cash-flow figure and an ARR movement from the same completed window. Give `net cash burn ÷ net new ARR` and the Research's Q1 example of `$2 million ÷ $1 million = 2×`; explain the ratio as cash used per unit of new annual run rate, then point to the tool. Name the differing time units accurately: quarter cash use compared with the ARR run-rate change *during that quarter*. Do not imply a quarter's burn should be annualized.

**Usage after the workbench:** short steps for selecting one completed reporting window, deriving operating net cash burn without treating funding or loan proceeds as operating receipts, getting the change between opening and closing ARR, and entering both in one currency. Explain what to do if only MRR movements are available, including the monthly `net new MRR × 12` convention, without asking the user to multiply ARR again. State that the calculator cannot verify the source classifications or currency conversion. Mention the blank-versus-known-zero distinction only once.

**Supporting content after usage, in this order:**

1. `How to read the burn multiple`: explain `2×` as arithmetic and its limits. A ratio from one window is sensitive to timing and ARR policy; it does not isolate what spending produced growth. Do not add stage-independent target bands.
2. `When no multiple appears`: cover zero ARR change, ARR decline, negative burn, and the combined negative-burn plus flat/declining-ARR case in compact prose or a short list. The UI already names each status; this section adds why each case cannot be read as a normal positive-growth burn multiple. Distinguish valid `0.00×` with positive ARR growth from undefined `0 ÷ 0`.
3. `Check the inputs before comparing periods`: describe consistent cash and ARR definitions, excluding funding and loans from operating receipts, consistent treatment of any included investment outlays, the same period boundaries, and why `$0.01` of positive ARR growth can produce a very large number. End with a practical next step and task-specific internal links.

Use ordinary Markdown headings, paragraphs, and a short list where the status cases are easier to scan. The simple formula and worked example belong in the introduction, so no second `[!FORMULA]` or `[!EXAMPLE]` block is needed. The result already displays exact values; an article result table or chart would repeat them, and a gauge or benchmark color would imply an unsupported grade. No article marker art is needed; Product's `toolSpot` is catalog card art only. The tool-page renderer uses `ContentMarkdown` for normal links and these formats.

### Concepts and result interpretation

- **Net cash burn:** use operating cash spending less customer cash collected for the period, not gross spend, an income-statement loss, or a change in bank balance that includes fresh funding or borrowing. For example, a new loan is financing cash, not operating revenue that turns a cash-burning business into `Cash generating`. The Research's ChartMogul Burn Multiple source controls the burn-metric definition; IAS 7 supports the distinction between operating, investing, and financing cash flows but does not define this calculator's numerator. If the founder includes investment purchases in a management burn figure, ask them to state and keep that treatment consistent, without presenting one universal capital-expenditure rule. The tool labels a negative input `Cash generating` and cannot inspect the source ledger.
- **Net new ARR:** use ending ARR less starting ARR across that same window. ARR is a recurring-revenue run rate; it is not cash received or revenue earned over the next year. For a month, `$2,000` net new MRR becomes `$24,000` net new ARR under the `MRR × 12` convention, and `$12,000` burn divided by `$24,000` gives `0.50×`. ChartMogul's MRR source supports this convention; the reader must use their own consistent ARR inclusion policy. A quarter's net new ARR is still the quarter-end minus quarter-start ARR run rates, while quarter burn remains the actual quarter cash use.
- **Nonnumeric and extreme results:** zero net new ARR gives `Undefined`; negative net new ARR gives `Unavailable`; negative net cash burn gives `Cash generating` first, even when ARR did not grow. Explain that these are meaningful observations, not a missing-data zero or a bad score. A `$0.01` positive denominator with `$12,000` burn gives `1,200,000.00×` exactly as the tool displays, showing why denominator size matters; it is still arithmetic, not a verdict. The Product and implemented result behavior control these cases. Craft supports the zero-denominator limitation and the absence of one universal benchmark.

### Usage, limits, and next step

Walk through one founder's completed quarter: take that quarter's net cash burn and the difference between ARR at the quarter's close and start, enter the same currency and a recognizable quarter label, and read the ratio with its exact basis. If either source value is unknown, retrieve it instead of entering zero. The form accepts signed values but requires plain digits with up to two decimal places; briefly explain a likely pasted-currency or grouping-comma error if useful, then return to the records. The selected currency labels values; it does not convert them.

After a valid result, suggest checking cash-flow classification, including any funding or borrowing and the company's investment-outlay policy, plus ARR movement before comparing prior periods. Link to `/saas-metrics-calculator` for a wider monthly snapshot and `/mrr-waterfall-calculator` for monthly MRR movement when those pages are published; neither verifies a billing ledger. Avoid statements that a given multiple is healthy, efficient, fundable, or a spending recommendation. Do not treat ARR as realized revenue, annualize quarterly burn, assert that all burn caused ARR growth, or infer company quality from a lone period. The page should remain a focused calculator rather than a broad fundraising or runway guide.

### Source roles and links

- Link [Craft Ventures' Burn Multiple explanation](https://www.craftventures.com/articles/the-burn-multiple) near the ratio and Q1 example. It supports the same-period formula, the zero-growth denominator limitation, and the caution that benchmarks vary by company stage. Do not present its example values as a universal target.
- Link [ChartMogul's Burn Multiple definition](https://chartmogul.com/saas-metrics/burn-multiple/) where the cash-basis operating-burn numerator and net new ARR are defined. Use [IAS 7's official cash-flow summary](https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/) only to explain why equity and borrowing cash flows are financing rather than operating receipts. IAS 7 does not define burn multiple or prescribe the treatment of capital expenditure in a management burn figure. Link [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) only if explaining the MRR-to-ARR conversion in the page. These are definitions, not live company data or a maintained benchmark feed.
- Internal related tasks are `/saas-metrics-calculator` for a monthly overview and `/mrr-waterfall-calculator` for the movements behind net new MRR. Show a link only when its destination is published. The finished tool and its Product contract control parser details, status precedence, precision, and exact interface wording; competitor pages in Research are comparison evidence, not public claims to repeat.
