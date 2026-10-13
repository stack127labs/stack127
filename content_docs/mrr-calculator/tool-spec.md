# MRR calculator

Route: `/mrr-calculator`

## Research

### User job

A SaaS founder or subscription operator needs to turn active plans with different billing intervals into a comparable monthly recurring revenue figure. The [roadmap item](https://app.notion.com/p/3e37bc97c44381b6973dd4b3a8ffbc59) describes this as normalizing recurring subscription revenue into MRR; its Notion page is otherwise blank. The existing [`/saas-metrics-calculator`](../saas-metrics-calculator/tool-spec.md) starts with monthly MRR movements already normalized, so it does not cover this plan-price and billing-interval task.

### Competitor patterns

- [figured.fyi's MRR calculator](https://figured.fyi/mrr-calculator) takes subscriber count, one average subscription price, and one frequency (monthly, quarterly, semiannual, or annual), then returns MRR with copy and embed actions. I entered 2 subscribers at $1,200 annually and got $200 MRR. A negative price replaced the result with a generic input error. Because the form applies one frequency to one blended price, mixed billing intervals require separate runs and manual addition.
- [TheCalcLibrary's MRR calculator](https://www.thecalclibrary.com/mrr-calculator) has separate monthly and annual subscriber/price pairs. It shows total MRR, annualized ARR, each interval's contribution, subscriber count, and average revenue per subscriber. With 2 subscribers at $100 monthly and 1 at $1,200 annually, it returned $300 MRR ($200 monthly plus $100 annual), $3,600 annualized ARR, 3 subscribers, and $100 average revenue per subscriber. The form sets `min=0`, but entering a negative annual price still changed the live output without a visible error; the contribution displayed as negative zero. Its summary is easy to audit, but input coverage is limited to two billing intervals.
- [Kometrics' MRR calculator](https://kometrics.com/tools/mrr-calculator) appeared in search with rows for different plans and a billing selector. Headless Chrome timed out before the page became usable, so it was not operated or used to support product claims.

### Technical facts and sources

- Normalize each recurring plan amount by the number of months it covers, then sum the active plan contributions: `MRR = Σ(subscribers × recurring plan price ÷ billing interval months)`. [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) gives this billing-interval formula; [Chargebee's MRR documentation](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/monthly-recurring-revenue) confirms that a $1,200 yearly plan contributes $100 per month. For month-based terms, the divisor is 1 for monthly, 3 for quarterly, 6 for semiannual, and 12 for annual.
- MRR is a subscription run-rate measure, not the cash received or recognized accounting revenue. ARR is commonly annualized as `12 × MRR`; it does not mean that amount has been earned or is guaranteed. Chargebee explicitly distinguishes MRR from payment received and GAAP reporting; ChartMogul names ARR as Annualized Run Rate.
- Line-item treatment varies across billing analytics products and settings. ChartMogul's [MRR report methodology](https://help.chartmogul.com/article/154-chart-monthly-recurring-revenue-mrr) includes active and past-due subscriptions, offsets discounts, excludes one-time invoice items, and leaves transaction-fee handling to a setting. Chargebee includes recurring plans and addons, can include some non-recurring components by configuration, excludes setup fees and tax, and counts active and non-renewing subscriptions. A manual result therefore cannot claim to match a billing platform or accounting report unless the user applies that platform's status and pricing rules consistently.

### Opportunity and blockers

Provide a manual way to calculate a mixed plan portfolio in one pass, with the monthly contribution of each plan and a total that can be checked. State that inputs are current recurring subscription prices and define the treatment of discounts, tax, one-time charges, usage charges, and inactive plans. This is narrower than the existing SaaS metrics overview, which handles period movements after MRR has already been normalized. No paid API, maintained dataset, account, or background job is needed. The calculator cannot verify the submitted plan status, pricing, or billing-platform configuration; that is a limitation to explain, not a launch blocker.

## Product

### Promise and scope

A solo SaaS founder or subscription operator has active subscriptions on plans with different billing intervals. They need one current monthly recurring revenue figure without normalizing each plan by hand. Enter each plan's active subscription count, net recurring price per subscription, and billing interval. The tool returns total MRR, its annualized run rate, and each plan's monthly contribution so the total can be checked.

This is a manual, current-plan snapshot in one currency. Count one billable subscription as one unit within every row, even if one customer has more than one subscription. Use the recurring price for the full selected term after recurring discounts. Include recurring add-ons only when their amount and renewal interval are folded into that subscription price consistently. Exclude tax, setup fees, one-time charges, noncontractual usage, trials, and cancelled or expired subscriptions. The person preparing the input must choose a consistent policy for past-due and non-renewing subscriptions; billing platforms may classify these differently. The calculator cannot check source status or reconcile its total to a billing report.

The existing `/saas-metrics-calculator` starts with already normalized MRR movements for a completed month. This tool ends at the current plan-based MRR run rate. It does not calculate new, expansion, contraction, or churned MRR; retention; revenue recognition; cash received; cohorts; forecasts; currency conversion; or billing-platform-specific adjustments. No import, account connection, saved scenario, benchmark, or export is needed for launch.

### Technical contract

**Input and validation.** Start with one blank plan row and a visible monthly billing selection. Currency is visibly set to USD. Permit 1 to 20 rows. Each row has an optional plan name of at most 80 characters, an active subscription count, a price per subscription for the full billing term, and a billing interval. Blank names display as `Plan 1`, `Plan 2`, and so on in results; names need not be unique, so every result row also retains its row number. The count and price are required even when zero. A zero count means no currently active subscriptions on that plan; a zero price represents a free or fully discounted recurring plan and contributes zero MRR. Do not infer zero from a blank field.

| Input | Accepted value |
| --- | --- |
| Currency | USD, EUR, GBP, INR, CAD, or AUD. This changes formatting only; all entered prices must already be in the same currency. |
| Active subscriptions | Whole number from 0 through 1,000,000 per row. |
| Price per subscription | Nonnegative amount from 0 through 100,000.00 in the selected currency, with at most two decimal places. |
| Billing interval | Monthly, quarterly, every six months, or annually, meaning 1, 3, 6, or 12 months. |

Trim outer whitespace. Counts accept base-10 digits only; prices accept base-10 digits with an optional period and one or two fractional digits. Reject commas, currency symbols, signs, exponent notation, interior spaces, fractional counts, nonfinite values, and out-of-range values instead of coercing them. Validate the same rules at the pure engine boundary, including unknown interval or currency values, non-string input, zero rows, and more than 20 rows. A blank optional name remains valid; trim and render supplied names as text, never HTML. Do not silently omit an invalid row or produce a partial total.

**Calculation.** For row `i`, let `nᵢ` be active subscriptions, `pᵢ` the full-term recurring price in integer cents, and `mᵢ` the interval in months. `row MRRᵢ = nᵢ × pᵢ ÷ mᵢ` cents. `total MRR = Σ row MRRᵢ`. `annualized ARR = 12 × exact total MRR`; this is a run rate, not earned revenue or a guarantee. The selected intervals all divide 12, so an exact integer twelfths-of-a-cent accumulator can calculate `Σ nᵢ × pᵢ × (12 ÷ mᵢ)` without floating-point drift. The stated row and value caps keep this accumulator within JavaScript's safe-integer range. Do not round a row before adding it to the total.

Show total MRR and ARR to two currency decimals, using round-half-up for nonnegative amounts. Show each row's monthly contribution to two decimals. For a positive amount below one cent, show `<0.01` with the selected currency symbol/code rather than `0.00`. If displayed rounded row contributions do not sum to the displayed total, place one short rounding note beside the table; the exact unrounded contributions remain the basis of the total and ARR. A true zero displays as zero. The result includes the selected currency and each row's name, count, full-term price, interval, and monthly contribution. Do not display a fabricated calendar month or imply that annual billing cash was received monthly.

**Action and states.** `Calculate MRR` is the sole primary action. Submit validates all rows, then shows the lead total and supporting results. Any edit to a plan name or result-driving field, row addition, or row removal clears the old result and requires another calculation. Blank or malformed required fields show field errors; zero rows show a list-level error and an Add action. A valid all-zero portfolio returns zero MRR and zero ARR with a neutral explanation. An unexpected local calculation error clears the result, preserves entered values, and lets the same action retry. There is no network operation or loading state. Reset restores one blank monthly row and USD.

All figures and plan names stay in client component memory. Do not send them in a URL, form request, browser storage, cookie, log, or analytics event. Existing site analytics may record the page visit without input values.

### Independently calculated examples

| Inputs in USD | Expected result |
| --- | --- |
| 2 subscriptions at $100 monthly; 3 at $300 quarterly; 4 at $600 every six months; 1 at $1,200 annually. | Row MRR is $200, $300, $400, and $100. Total MRR is $1,000.00 and annualized ARR is $12,000.00. |
| 1 subscription at $1 annually and 1 at $1 quarterly. | Exact row MRR is $0.08333… and $0.33333…; displayed rows are $0.08 and $0.33. Exact total is $0.41666… per month, displayed MRR is $0.42, ARR is $5.00, and the table needs its rounding note. |
| One row with 0 subscriptions at $100 monthly, plus one row with 2 subscriptions at $0 annually. | Each contribution, total MRR, and ARR are $0.00. This is a valid zero result. |
| A count of `1.5`, price `1e3` or `$100`, a blank required price, or 21 plan rows. | Specific field or list error; no MRR or ARR result. |

### Ownership

- Public URL `/mrr-calculator`. Put the server page and interactive workbench in `app/(site)/(tools)/mrr-calculator/`, using the existing tool-page loader, shared shell, `PageCanvas`, header, and database Markdown renderer. No route-owned SEO or publication metadata.
- Keep parsing, validation, and arithmetic in `lib/mrr-calculator/engine.ts`; focused independent arithmetic and invalid-input checks belong in `tests/pages/mrr-calculator/`. The route component owns row IDs, form state, focus, and result state. Use a colocated CSS module for the row grid only and shared tokens/components for controls and output. No API, dataset, or background job.
- This spec owns the contract. `public.stack127_tool_pages` owns visible page and card copy; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog rank. Mark any development preview copy as temporary. If a dedicated page-update script is needed, place it under `scripts/mrr-calculator/`.

### Catalog placement and card art

Primary and only catalog: `/saas-tools`, because readers choosing among SaaS business calculators can find this plan-normalization task beside the broader metrics overview. Its registry and development preview already exist; integration must add this tool's membership. Put this card at display order 2, after `/saas-metrics-calculator` at order 1. No DNS, domain, storage, or KDP catalog serves this task.

Catalog `toolSpot` art key: `mrr-calculator`. Visual takeaway: several billing schedules become one comparable monthly revenue amount. Focal subject: one clear monthly calendar tile with a filled revenue column. One supporting relationship: a few unequal plan-price strokes converge into that column. Keep it wordless, legible at card size in both themes, calm and analytical, without numbers, labels, currency symbols, a generic calculator icon, or an upward-growth claim.

## Interface

### Flow and control mode

The user's question is, "What is the monthly recurring value of my active plans?" The lead answer is total MRR in the selected currency. The one primary action is `Calculate MRR`. Control mode is `single`: every plan row needs the same three required inputs, the interval always changes the answer, and there is no separate advanced task to hide. Keep one visible, empty first row on initial load; its Monthly choice and the global USD choice are explicit assumptions.

Use the shared full-width workbench band. Reading order: currency, `Plans` group with rows, `Add plan`, calculate and reset actions, one divider, lead MRR, annualized ARR, then the contribution table. A brief note near the currency choice says the selector changes labels, not amounts. Keep the row guidance to one short sentence at the group level: enter the recurring price for the selected full billing term. The article explains exclusions and status choices in detail.

### Controls and component decisions

| Area | Control and behavior |
| --- | --- |
| Currency | Reuse `UiSelect` with the six Product options. Its visible selected value makes the single-currency assumption clear. Keyboard and native/mobile selection follow the shared control. |
| Plan row | Reuse `UiTextField` for optional `Plan name`, required `Active subscriptions` (`inputMode="numeric"`), and required `Price per subscription` (`inputMode="decimal"`). Keep raw strings so the engine can reject malformed entries. Reuse `UiSelect` for required `Billing interval` with the four visible values. Field errors sit directly below their fields. Show the selected currency code by the price label or as a fixed suffix, not in a paragraph under every row. |
| Row actions | Reuse `UiRepeatableList` for stable keyed rows, an `Add plan` action after the rows, and a fixed final remove-action column. Name each remove action for its plan or row number and give it a visible tooltip. Its current add-focus behavior can focus the new row's plan name. Extend its shared focus behavior if needed so removing the focused row moves focus to the next row, previous row, or Add plan; never leave focus on a removed element. Permit removal of the last row so the empty-list recovery is explicit. At 20 rows, disable Add and show `Maximum 20 plans` beside it. No duplicate, reorder, drag, or inline calculated row total is needed. |
| Actions | Reuse `UiActionRow` and `UiButton` for primary `Calculate MRR` and secondary `Reset`. Keep Calculate enabled when fields are blank so submission can show exact errors. Enter submits the form; Reset is a button, not form submission. |

Use the shared field and button focus ring, `--radius`, text, surface, border, and accent tokens. The repeated four-field row and its error/focus management are route-specific composition inside the shared repeatable primitive, not a new shared control. No slider, chart, disclosure, mode switch, copy, or export action helps this task.

### Result hierarchy

Begin with one neutral `UiPrimaryResult` labeled `Monthly recurring revenue` and the formatted total. Immediately below, show `Annualized ARR` as one quiet labeled value with the run-rate qualification; it must not appear as a second equally weighted hero. Then use one `UiDataTable` titled `Monthly contribution by plan` with columns for plan, active subscriptions, billed price and interval, and monthly contribution. The table repeats row inputs only to make each contribution auditable. Do not repeat total MRR as a table footer or metric card. A rounding note appears only if the displayed row values do not add to the displayed lead total. A zero result has a neutral explanation beside the lead, not a warning or a score.

No allocation bar is required: rows can contribute zero, the list can contain 20 plans, and exact values are easier to check in a table. The page's supporting content explains the formula, exclusions, and ARR meaning after the workbench; it should not reprint the live result. Do not show retention, cash, revenue recognition, or a recommendation.

### States and recovery

- **Initial:** one blank plan row, Monthly visible, USD visible, no numeric result. A short neutral result prompt can say to enter at least one plan.
- **Valid:** calculate all rows together, focus the labeled MRR output, show ARR and the table. A valid all-zero set shows `$0.00` values and says the entered plans currently contribute no recurring revenue. A tiny positive contribution displays `<0.01` in the chosen currency instead of zero.
- **Invalid or empty:** preserve all rows, clear the old result, put each error below its affected field, and focus the first invalid field in visual order. With zero rows, put one list-level error by `Add plan` and focus that action. Do not add an error result panel or duplicate the same message in a status area. Adding a row after the empty-list error removes that error.
- **Edited after a result:** clear MRR, ARR, table, and rounding note immediately; announce `Inputs changed. Calculate again.` once without moving focus. Changing currency also invalidates the displayed result because the selected unit has changed; it never converts the entered prices.
- **Unexpected failure:** preserve input, clear the result, and show one `UiStatus` error by the action: `MRR could not be calculated. Try again.` The primary action retries. The engine is synchronous and local, so there is no loading indicator, request retry, or loading-disabled control.
- **Reset and restoration:** clear rows, errors, statuses, and result; restore one blank Monthly row and USD; announce reset and focus its first field. Clean `/mrr-calculator` remains unchanged through hydration. Do not serialize inputs to a query string or browser storage. Reload starts fresh; browser back/forward cache may restore a form and result together, and the next edit clears that result.

Use one polite status announcement for successful and changed states; successful focus on the output announces its accessible label and value. Error focus reaches the input and its associated field error. Row names are text, never interpreted as markup. Do not send values to analytics.

### Responsive and accessible behavior

At desktop width, keep the form at a measured inner width within the full-width workbench. Place each plan's name, count, price, interval, and remove action in explicit columns, with the remove action fixed at the end. Reserve room for labels and errors so one error does not shift neighboring controls into an accidental alignment. Separate rows with quiet rules or spacing, not nested cards. Keep Add beneath the current rows; actions follow the group; results follow one divider.

At narrow widths, stack each plan's fields in the same name, count, price, interval order, followed by its visible remove action. Keep the row boundary and plan number clear. Add, Calculate, and Reset remain in task order with comfortable hit targets. `UiDataTable` uses labeled rows on mobile; long plan names wrap, numeric values and currency symbols remain intact, and no sibling content causes page-level horizontal overflow. Input text may scroll within its own field while focused; labels and errors cannot clip. Use `min-width: 0` on row grid children.

Tab order follows currency, each row's fields and remove action, Add, Calculate, Reset, then result links. The select retains shared keyboard behavior; Add and Remove work with Enter/Space. Adding a row focuses its first field. Removing a focused row returns focus to a stable nearby control. Visible focus, field labels, required marks, row action names, table headers, and result labels must work in both themes and at mobile width. Check long 80-character names, 20 rows, small fractional-cent contributions, validation focus, empty-list recovery, and the one-cent rounding-note case in the real page review.

## Content

### Search intent and metadata direction

The reader is looking for an MRR calculator that combines active subscriptions sold on monthly, quarterly, six-month, and annual terms. They may have counts and plan prices from a billing export and need the monthly run rate without separate calculators for each interval. The page should meet this plan-normalization task, not present the broader retention and unit-economics workflow of `/saas-metrics-calculator`.

Follow the writing skill's `Tool name: the question it answers or the outcome it helps with` title pattern. Start the visible title with `MRR calculator`; use the second part to name monthly recurring revenue across billing plans. The SEO title can pair MRR calculator with mixed billing intervals or subscription plans. The description should say that readers enter active subscription counts, recurring plan prices, and billing intervals to see total MRR, annualized ARR, and each plan's contribution. Avoid claims of live billing access, accounting revenue, forecasts, churn analysis, or exact agreement with a provider report. The catalog card name should remain short; its description should identify the mixed-interval calculation rather than promise a full SaaS metrics dashboard.

### Page promise and reader questions

After using the page, a founder should know the current monthly recurring value of the subscriptions they entered, how each plan contributes, and what the annualized figure means. They should be able to spot a mistaken term or price in the result table, know which charges to leave out, and understand why a billing report can differ. This is a manual snapshot from supplied figures, not verification of the billing source.

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| How do different billing terms become one monthly figure? | Each row takes a count, full-term price, and interval; the table shows its monthly contribution and the lead shows total MRR. | Explain the one-row normalization formula plainly and show a short mixed monthly/annual example. |
| Which subscriptions and price should I enter? | Labels specify active subscriptions and price per subscription for the selected full term; currency is visible. | Define one billable subscription as the count unit, including when one customer has several subscriptions. Explain net recurring price after recurring discounts, recurring add-ons with matching terms, and excluded charges. |
| What do MRR and ARR tell me? | MRR leads; ARR appears underneath with a run-rate qualification. | Explain that MRR is the current recurring monthly run rate, ARR is 12 times that run rate, and neither is cash collected, earned accounting revenue, or a guarantee. |
| Why does the total differ from my provider's MRR report? | The table makes each entered row auditable and a conditional note explains display rounding. | Name the source choices the tool cannot resolve: past-due or non-renewing status, discounts, add-ons, one-time items, and provider settings. Tell readers to compare the same inclusion rules before reconciling totals. |
| Why is there no result, or why is it zero? | Field/list errors stop a partial total; valid zero inputs produce a neutral zero result. | Distinguish unknown source figures from a known zero count or price. Explain how to correct a missing row value rather than entering zero to force a calculation. |

### Recommended page structure and formats

**Introduction before the tool:** Start with the practical situation: several active plans have different billing terms, but the reader needs one monthly number. Explain the basic calculation on its own: for each plan, active subscriptions × recurring price for the full term ÷ months in that term, then add the monthly contributions. A one-sentence annual example, such as one $1,200 annual subscription contributing $100 MRR, makes the divisor concrete. Then say the calculator handles several terms together. Keep the technical rounding method and provider-status differences out of the introduction; they belong after the tool. This follows the writing skill's simple-formula introduction rule.

**Usage after the tool:** Use a short numbered sequence for preparing one-currency source figures, entering one row per price-and-interval combination, and checking the result table. Mention that the price is for the whole selected term and already reflects recurring discounts. A row represents subscriptions, not distinct customers or seats. Explain that a known zero is valid but an unknown count or price must be checked in the source report; the calculator will not total incomplete rows. Do not narrate routine button presses or repeat every field label.

**Supporting content after usage, in this order:**

1. `How the monthly total is calculated`: use one shared `> [!EXAMPLE]` block for 2 subscriptions at $100 monthly plus 1 at $1,200 annually. The two contributions are $200 and $100; total MRR is $300 and annualized ARR is $3,600. Explain that annual billing of $1,200 is divided across 12 months for MRR, without implying monthly cash collection. The live table already provides the user's own row values, so do not duplicate it with a static chart or a four-interval lookup table.
2. `What belongs in a plan price`: explain active subscription status, one unit per billable subscription, a single currency, recurring discounts, and add-ons only when included in a matching recurring plan amount. A compact bullet list can separate excluded tax, setup and one-time fees, noncontractual usage, trials, and cancelled or expired subscriptions. Keep the past-due and non-renewing classification caveat beside this guidance.
3. `Reading MRR and ARR`: explain current run rate versus cash received or recognized revenue. The result already shows `12 × MRR`, so supporting prose should clarify interpretation rather than restate the displayed values. Name the snapshot's lack of period movements and forecasting. A short note may explain that displayed row values are rounded independently and can differ by a cent from the total, which uses exact contributions; the UI itself shows this note only when needed.
4. `When your billing report differs`: identify classification and configuration differences and recommend checking plan status, price after recurring discounts, term, and included line items against the source report. Keep this as reconciliation guidance, not a promise to reproduce ChartMogul or Chargebee totals.

The interactive `UiDataTable` already gives the per-plan comparison the task needs, with displayed amounts rounded as Product specifies. No article chart or additional marker art is necessary. The shared `[!EXAMPLE]` block supports the worked example; ordinary paragraphs and bullets suit the other sections. The catalog `toolSpot` is card art only.

### Concepts, limits, and next step

Use the mixed two-plan example above consistently rather than adding unrelated scenarios. In that example, `$300 MRR` is an estimated current monthly run rate from the supplied active plans; `$3,600 ARR` annualizes it and is not an amount already earned or guaranteed for the next year. A zero contribution may mean zero active subscriptions or a known zero recurring price. Unknown data is different: a blank required count or price blocks the calculation rather than disappearing from the total. A positive sub-cent contribution can display `<0.01` in the selected currency; the total is calculated from unrounded contributions, as Product specifies.

The tool cannot inspect subscriber status, billing history, tax treatment, discount schedules, add-on configuration, or exchange rates. It accepts one currency and only month-based billing intervals of 1, 3, 6, and 12 months. It does not tell the reader whether their company is growing, retaining customers, recognizing revenue, or collecting cash. Avoid a benchmark, grade, recommendation to change price, or claim that annual-plan payments are monthly receipts.

After the reader has normalized a current plan portfolio, the useful next question is how MRR changed during a completed month. Link to `/saas-metrics-calculator` only when that tool is published in the target environment; it requires starting MRR and monthly movements, not the plan rows from this calculator. `/saas-tools` can be a broader discovery link once its catalog is published. Do not point readers to planned but unpublished SaaS tools.

### Source roles and links

- [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) supports normalization across billing terms and the annualized run-rate meaning of ARR. Link it near the formula or MRR/ARR interpretation.
- [Chargebee's MRR documentation](https://www.chargebee.com/docs/billing/2.0/reports-and-analytics/monthly-recurring-revenue) supports the $1,200 annual to $100 monthly example and the distinction between MRR, cash received, and accounting revenue. Link where that distinction is explained.
- [ChartMogul's MRR methodology](https://help.chartmogul.com/article/154-chart-monthly-recurring-revenue-mrr) and the Chargebee documentation support the statement that subscription status and line-item rules vary by provider and settings. Use these links beside the report-comparison caveat, without implying this manual calculator matches either provider's implementation.

Competitor calculators in Research explain the product gap but are not authorities for definitions. No live source or maintained benchmark powers the tool. The final writer should verify that each linked primary page still supports the wording used and should not invent a source-check date.
