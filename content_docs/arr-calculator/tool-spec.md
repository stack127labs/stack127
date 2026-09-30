# ARR calculator

Route: `/arr-calculator`

## Research

### User job

The [roadmap item](https://app.notion.com/p/3e37bc97c4438105a98be6e773bc78bc) says, “Converts normalized recurring revenue into annual recurring revenue.” Its page has no further instructions. This research interprets “normalized recurring revenue” as one already-calculated monthly recurring revenue (MRR) total. The reader knows that monthly value from a billing report, spreadsheet, or another calculation and wants its annualized run rate without assembling subscription rows or analyzing MRR movements.

The existing [MRR calculator](../mrr-calculator/tool-spec.md) outputs annualized ARR, but it asks for plan counts, prices, and billing intervals. A user can represent a known MRR as one monthly plan, though that encodes a total as plan data. The [SaaS metrics calculator](../saas-metrics-calculator/tool-spec.md) also outputs ending ARR, but it starts from monthly movements and requires a fuller snapshot. A single MRR input is therefore a narrower, lower-friction task, with high formula and result overlap. The brief does not define another input period or a contract-based calculation.

### Competitor patterns

- [Free Biz Tools ARR calculator](https://free-biz-tools.com/tools/saas-arr-calculator/) takes one MRR value and updates ARR as the value changes. I entered $10,000 and saw $120,000.00. Entering `-1` cleared the result to `—` without an inline error. The field has a positive minimum. Its page explains ARR as MRR × 12 and distinguishes current run rate from projected MRR.
- [DoCalc MRR to ARR](https://docalc.net/saas/mrr-to-arr) takes current MRR and an optional monthly growth rate. It shows current ARR, a 12-month projected ARR, and an ARR milestone. At $10,000 MRR and 5% monthly growth it showed $120,000 current ARR and $215,503 projected ARR. Entering `-1` in the formatted MRR field produced $1 MRR and $12 ARR without an error state. The growth input is an additional forecasting task, not needed for a direct conversion.
- [HitMRR ARR calculator](https://www.hitmrr.com/tools/arr-calculator) links MRR and ARR inputs in both directions and says annual plan prices must first be normalized monthly. I entered $10,000 MRR and got $120,000 ARR, then entered $240,000 ARR and got $20,000 MRR. Its page says to exclude one-time sales and services.

Across these examples, the direct task starts from monthly-normalized MRR and uses `ARR = MRR × 12`. Competitors add optional forecasting or a reverse conversion, but neither is required by this roadmap item. Negative-input handling differed, so a blank or changed result should not be mistaken for a valid calculation.

### Technical facts and sources

- For a monthly-normalized recurring revenue input, `ARR = MRR × 12`. [Stripe's official MRR and ARR guidance](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29?locale=en-GB) states this formula. [Vertex's June 2026 SEC filing](https://www.sec.gov/Archives/edgar/data/1806837/000110465926090420/verx-20260630x10q.htm) defines its ARR as period-end MRR multiplied by twelve and describes MRR as subscription price, including discounts, divided by subscription-covered months. As a check, $10,000 MRR gives $120,000 annualized ARR.
- Describe this result as a current run rate, not cash already collected or accounting revenue earned over the next year. Stripe distinguishes MRR from GAAP revenue. Its guidance and Vertex's period-end basis support making the snapshot assumption clear; neither value guarantees that the MRR will continue for twelve months.
- ARR is not calculated under one universal company policy. [Bentley Systems' SEC-filed metric definition](https://www.sec.gov/Archives/edgar/data/1031308/000103130824000008/a24q2exhibit992.htm) combines the annualized value of recurring contracts at period end with an annualized recent-revenue measure for certain recurring consumption subscriptions, and says similarly titled measures can differ across companies. A one-field MRR converter should state its basis and not claim to reproduce a company's investor-report ARR without matching that company's inclusion rules.
- The provided brief specifies no period other than the monthly basis assumed above. If “normalized recurring revenue” means quarterly, annual, or another period rather than MRR, its conversion rule is unknown.

### Opportunity and blockers

A focused page can let someone enter one known MRR value and read its annualized equivalent, with a clear run-rate label and explanation of what the input already needs to include. Its distinct value is direct entry and task clarity. The math and main result duplicate both existing Stack127 tools, and the MRR calculator can already produce the same answer through a one-row monthly plan, so duplication risk is high. The launch brief does not support adding a forecast, valuation estimate, contract analysis, or target planner. HitMRR shows that ARR-to-MRR as `MRR = ARR ÷ 12` is a nearby option, but the roadmap currently asks only for MRR-to-ARR.

No paid API, maintained dataset, account, or background job is needed. The only research assumption is that the input is monthly-normalized MRR.

## Product

### Promise and scope

A solo SaaS founder or operator already has a current, monthly-normalized MRR total from a billing report or spreadsheet and needs its annualized equivalent. Enter that one MRR amount and see ARR immediately after one calculation, with the monthly basis and run-rate meaning clear. Direct entry is the reason to use this page: `/mrr-calculator` first builds MRR from active plan counts, prices, and billing terms, while `/saas-metrics-calculator` first derives ending MRR from a month's movements. Both show ARR as a supporting result, but neither starts with one known MRR total.

Launch covers one current MRR snapshot in one currency. The entered amount must already reflect the user's chosen recurring-revenue inclusion rules and have annual or other billing terms normalized to a month. The calculator cannot verify those rules or reproduce a company's reported ARR policy. It does not normalize plan rows, explain MRR movements, project growth, calculate recognized revenue or cash receipts, convert currencies, or calculate from quarterly or annual revenue. Keep ARR-to-MRR reverse conversion out of launch: it is mathematically adjacent but adds a second input direction to a brief whose job is to annualize known MRR. No account, import, API, saved scenario, or export is needed.

### Technical contract

**Input and validation.** Start with an empty required MRR amount and a visible USD selection. Accept USD, EUR, GBP, INR, CAD, and AUD, matching the other SaaS calculators. Currency sets the display unit only; it never converts the number. The user enters a known nonnegative MRR from `0.00` through `1,000,000,000,000.00` inclusive, with no more than two decimal places. A known zero is valid; a blank or unknown MRR is not zero. Keep the raw field as text so invalid input can be reported rather than silently coerced.

Trim outer whitespace. After trimming, accept only base-10 digits with an optional period followed by one or two digits. Leading zeros are allowed. Reject signs, commas, currency symbols, interior spaces, exponent notation, more than two decimals, nonfinite or non-string values, unsupported currencies, and out-of-range amounts. Apply the same validation at the pure calculation boundary. Parse accepted money into integer cents; the maximum input and its 12-times result remain within JavaScript's safe-integer range. Do not silently round a submitted input or use binary floating-point money arithmetic.

**Calculation and output.** `annualized ARR cents = MRR cents × 12`. Show one lead result, `Annualized ARR`, in the selected currency with exactly two decimal places and en-US digit grouping, consistent with the sibling SaaS calculators; do not abbreviate large amounts. Beneath it, show the calculation basis once as the entered MRR multiplied by 12, so the user can check that the correct monthly figure and currency were used. Show a short run-rate qualification: this is the current MRR annualized, not twelve months of cash received, revenue already earned, or a forecast. Do not attach a calendar year or future date to an undated snapshot. Exact cent arithmetic means the ARR result needs no intermediate rounding. A zero input returns `0.00`, not an unknown or failure state.

**Action and states.** `Calculate ARR` is the sole primary action. Submitting valid input shows and focuses the ARR result. Submitting blank, malformed, or out-of-range input shows one precise field error, clears any old result, and focuses the amount input. Any edit to the MRR or currency clears the old result and requires another calculation; changing currency never converts the entered amount. An unexpected local calculation failure clears the result, preserves input, and lets the same action retry. The calculation is synchronous and local, so it has no loading, network, or partial-result state. Reset restores empty MRR and USD, clears result and errors, and focuses the amount field.

Keep the entered financial value in client component memory only. Do not put it in the URL, browser storage, cookie, request, log, or analytics event. Existing site analytics may record a page visit without tool input. Render the submitted value only as text, never HTML.

### Independently calculated examples

| Input | Expected result |
| --- | --- |
| USD MRR `10000` | ARR `$120,000.00`; basis `$10,000.00 × 12`. |
| EUR MRR `83.33` | ARR `€999.96`; basis `€83.33 × 12`. |
| INR MRR `0` | ARR `₹0.00`; valid zero run rate. |
| USD MRR `1,000,000,000,000.00` entered without commas as `1000000000000.00` | ARR `$12,000,000,000,000.00`; the upper bound remains exact. |
| Blank MRR, `-1`, `1e3`, `$100`, `1,000`, or `0.001` | One amount-field error and no ARR result. |

### Ownership

- Public URL `/arr-calculator`. Put the server page and client workbench in `app/(site)/(tools)/(saas)/arr-calculator/`, using the SaaS route-group layout, shared shell, `PageCanvas`, tool-page loader, and database Markdown renderer. Do not add route-owned publication or SEO metadata.
- Keep strict parsing, validation, and cent arithmetic in `lib/arr-calculator/engine.ts`; use focused independent examples in `tests/pages/arr-calculator/`. The route component owns currency formatting, form value, focus, error, and result state. Use a colocated CSS module only for route layout and shared tokens/components for controls and display. No API or background job.
- This spec owns the calculation contract. `public.stack127_tool_pages` owns visible page and card copy; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog rank. Development preview copy must be clearly temporary. Any dedicated page-update script belongs under `scripts/arr-calculator/`.

### Catalog placement and card art

Primary and only catalog: `/saas-tools`, because a reader choosing a SaaS calculator can select the known-MRR conversion beside the plan-based and movement-based calculators. The catalog already exists in development. Put the card at display order 3, after `/saas-metrics-calculator` at order 1 and `/mrr-calculator` at order 2. No secondary catalog serves this task.

Catalog `toolSpot` art key: `arr-calculator`. Visual takeaway: one monthly recurring amount repeats across twelve months to form an annual run rate. Focal subject: a clear 3-by-4 year grid of twelve equal month cells. One supporting object: a single monthly tile feeding that grid. Keep it wordless and legible at card size in both themes, calm and analytical, with no numbers, currency signs, rising trend, or generic calculator icon. This year grid should read differently from the MRR card's monthly normalization image and the SaaS metrics card's monthly movement image.

## Interface

### Flow and result hierarchy

The user's question is, "What is the annualized ARR of my known MRR?" The lead answer is one labeled ARR amount; the one primary action is `Calculate ARR`. Control mode is `single`. Show the required `Monthly recurring revenue (MRR)` field with a joined currency selector, followed by Calculate and a quiet Reset. USD is visible as the initial unit. There are no advanced choices or direction toggle. The result begins with `Annualized ARR`, then one compact basis line showing formatted MRR × 12 and one run-rate qualification. Do not add a second MRR metric, a table, chart, comparison cards, or a second rendering of ARR. The input and basis line together provide the useful relationship.

Use the shared `UiQuantityInput` for the string amount and currency selector: it keeps the value and unit together, exposes a persistent label and required mark, supports decimal keyboard input, and places its error beside the amount. Use `UiActionRow` with a primary `UiButton` for Calculate and a quiet secondary or ghost `UiButton` for Reset. Use `UiPrimaryResult` for the labeled ARR output and `UiStatus` only for a useful state announcement or unexpected failure. These components already appear in `/components-ui` and sibling tools. No new shared primitive is needed; a route-owned wrapper controls width, spacing, result divider, and responsive placement. Use site color, type, spacing, radius, and focus tokens. Keep the workbench band full width within the main column, with a measured inner content width and no nested result card.

### States and recovery

- **Initial and empty:** amount blank, USD visible, no result or placeholder number. An empty submission is invalid and focuses the amount field with one inline message. Do not imply a blank value means zero.
- **Valid:** show the formatted ARR and its basis, move focus to the labeled result, and announce it once. Zero is a valid `$0.00`-style result with neutral tone. Large values stay fully written and selectable.
- **Invalid:** keep the entered string and selected currency, clear any earlier result, show one specific amount error for syntax, precision, or bound, and focus the field. The fixed selector cannot produce an unsupported currency through normal interaction; the engine still rejects one rather than returning a mislabeled amount.
- **Edited after a result:** clear ARR, basis, and qualification immediately, and announce once that the input changed and needs recalculation. Preserve focus and the edited value. A currency change also invalidates the old result and leaves the numeric text unchanged.
- **Unexpected failure and retry:** clear the old result, preserve the input, show one `UiStatus` error near the action, and let Calculate retry. Do not invent a number or show a duplicate error panel.
- **Reset and restoration:** clear values, errors, status, and result; restore visible USD; focus the amount field and announce reset. A clean `/arr-calculator` URL stays unchanged through hydration. Do not serialize inputs to URL or browser storage. Reload begins fresh; browser back/forward cache may restore a form and result together, and any subsequent edit clears the restored result.

The engine is synchronous, so no loading indicator, disabled loading action, network retry, no-match state, or partial result applies. Keep the Calculate button available for a blank field so submission can explain the error.

### Responsive and accessible behavior

At desktop width, put the joined amount and currency control first at a comfortable measured width, then the action row, then a single divider and result. Align by position and spacing; the lead amount gets visual priority without extra panels or accent fills. At mobile width, keep the same order, let the joined control fit the viewport without clipping either the amount or currency trigger, and make the primary action easy to tap. The full ARR and basis may wrap at separators but must not cause page-level horizontal overflow or collapse into an abbreviation. No table or side-by-side result region is needed.

Keyboard order is amount, currency, Calculate, Reset, then any result link in supporting content. The shared currency select keeps its native/mobile and keyboard behavior. The amount has a visible required mark and programmatic required state; its error is associated with the input and announced when focused. Submit works with Enter, buttons with Enter or Space, and focus remains visible in both themes. The result has a programmatic label and receives focus after success; a polite status announces edits and reset without repeating the output. Check a long upper-bound result, zero, blank submission, malformed pasted amount, currency change after success, and mobile width in the real page review.

## Content

### Search intent and page promise

The reader searches for an ARR calculator or MRR-to-ARR conversion because they already know one monthly recurring revenue total. The page should let them annualize that amount and understand the result as a current run rate. It should help them confirm that their source figure really is monthly-normalized MRR. Do not imply access to a billing account, a verified company metric, a revenue forecast, or recognized revenue.

Follow the writing skill's `Tool name: the question it answers or the outcome it helps with` title pattern. Start the visible title with `ARR calculator` and use the rest to name conversion from MRR to an annualized run rate in plain words. The introduction should stand alone: establish that the reader has known MRR, state the simple `ARR = MRR × 12` formula, give the $10,000 MRR to $120,000 ARR example, then explain that the tool performs this conversion in the selected currency. Put this one-step formula in the introduction, not in a later formula block; the result already shows the user's own MRR × 12 basis. Keep the run-rate limitation close to the first use of ARR.

### Reader questions and planned coverage

| Reader question | Answered by the tool | Writer's job |
| --- | --- | --- |
| What ARR corresponds to my known MRR? | One required MRR amount, `Calculate ARR`, a lead annualized ARR value, and the submitted MRR × 12 basis. | Give the formula and one short worked example in the introduction; do not repeat the user's displayed numbers below the tool. |
| Which amount should I enter? | The field is labeled monthly recurring revenue; currency is visible. | Explain that the source total must already be normalized to a month, in one currency, and based on a consistent policy for recurring subscriptions. Give a concrete annual-plan normalization example. |
| Is this next year's revenue? | The result says it is a current run rate, not cash received, earned revenue, or a forecast. | Explain the period-end snapshot assumption and that future subscriptions, cancellations, and prices can change. Avoid a calendar-year label when none was supplied. |
| What if my MRR is zero or unknown? | Explicit `0` returns zero ARR; blank or invalid entry produces an amount error and no result. | Say a known zero is meaningful, while an unknown total needs checking at its source; do not enter zero merely to obtain an answer. |
| Why does a report use a different ARR number? | The tool states only its MRR × 12 basis and cannot inspect source classifications. | Explain that companies and billing products may count discounts, usage, past-due or non-renewing subscriptions, and other line items differently. Compare the source MRR definition before reconciling ARR. |
| What if I do not know MRR yet? | This page does not build MRR from plans or monthly movements. | Link to `/mrr-calculator` for active plan counts, prices, and terms; link to `/saas-metrics-calculator` for a completed month's MRR movements. Show these links only when their pages are published. |

### Proposed page structure and formats

**Introduction before the tool:** one compact explanation of the known-MRR situation, formula, $10,000 example, and run-rate meaning as above. The simple arithmetic should not be held back until after the workbench. Do not open with an extended SaaS metrics primer or reverse-conversion task.

**Usage after the tool:** brief steps for taking a current MRR total from a billing report or spreadsheet, checking that annual and other billing terms have been expressed per month, selecting the existing currency, and entering digits with up to two decimal places. The selector changes formatting only; it does not exchange currencies. Explain the zero versus unknown distinction here. Avoid narrating routine button presses or restating the visible result label.

**Supporting content after usage:**

1. A short `What belongs in the MRR input` section. Use one concrete normalization example, such as a $1,200 annual subscription contributing $100 monthly MRR. Name recurring subscription amounts after recurring discounts and consistent treatment of add-ons, status, and contractual usage. Explain that one-time fees, tax, and services do not automatically belong in recurring revenue. Present source-policy choices as choices, not a universal accounting rule. A short ordinary bullet list is enough if it makes included and excluded figures easier to scan.
2. A short `What annualized ARR means` section. Explain a current MRR snapshot extended to a twelve-month rate, with no claim that the same MRR will continue. Distinguish it from annual cash receipts and recognized accounting revenue. The UI already displays the exact formula and run-rate warning, so this section should add interpretation, not another formula display.
3. A concise `When reported ARR differs` and next-step section. Say that the converter follows the entered MRR and cannot reproduce a provider's or company's ARR policy without matching its inclusion rules. Suggest checking the source MRR definition and the snapshot date. Offer the two task-specific related tool links only when published. Do not imply that either sibling tool verifies a billing system.

Use ordinary Markdown headings, paragraphs, a short list if useful, and normal links through `ContentMarkdown`. No data chart, result table, formula block, FAQ, or article marker art improves this one-step calculation. The `toolSpot` described in Product is catalog card art only. The page should be useful without padding a simple conversion into a broad SaaS guide.

### Source roles, boundaries, and metadata direction

- Link [Stripe's MRR and ARR guidance](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29?locale=en-GB) near the formula and the MRR versus accounting-revenue distinction. The Product section defines the actual accepted input and exact arithmetic.
- Use [Vertex's SEC filing](https://www.sec.gov/Archives/edgar/data/1806837/000110465926090420/verx-20260630x10q.htm) for an example of period-end MRR × 12 and monthly normalization of covered subscription months. Do not present that company's definition as mandatory for all users.
- Use [Bentley Systems' SEC-filed definition](https://www.sec.gov/Archives/edgar/data/1031308/000103130824000008/a24q2exhibit992.htm) to support the caveat that reported ARR may follow a company-specific inclusion policy. If naming particular subscription statuses or line items, check the primary billing-methodology sources already recorded in the MRR calculator's Research rather than assigning one universal policy.
- Keep annual-plan normalization distinct from this tool's arithmetic: the reader prepares MRR first; this page multiplies that known monthly total by twelve. Do not add growth rates, ARR-to-MRR input, valuation, targets, health scores, benchmarks, or predictions to the page.

The SEO title should pair `ARR calculator` with conversion from MRR or monthly recurring revenue. The description should say that a reader enters known MRR to see its annualized ARR and understand that the result is a current run rate. The catalog card should have a short `ARR calculator` name and a task-specific description for known-MRR annualization, distinct from the plan-normalizing MRR card and the broader SaaS metrics card. Avoid keyword repetition, claims of live data, and promises to match an investor report.
