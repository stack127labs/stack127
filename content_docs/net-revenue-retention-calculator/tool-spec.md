# Net Revenue Retention Calculator
Route: /net-revenue-retention-calculator

## Research

### User job

A SaaS operator wants to measure how recurring revenue from a defined starting customer group changed over a chosen period, after expansion, contraction, and churn. They need a denominator that names the opening cohort, new-customer revenue kept out of the calculation, and a clear rule for returning customers.

The Notion launch item [Net Revenue Retention Calculator](https://app.notion.com/p/3e37bc97c4438159a09aca744acac475) is priority 9 in the SaaS / Indie Hacker Tools category. Its brief says the tool measures retained recurring revenue after expansion, contraction, and churn.

The existing [SaaS metrics calculator spec](../saas-metrics-calculator/tool-spec.md) already reports NRR and GRR as part of a single-company, one-month snapshot. It explicitly leaves detailed cohort analysis, detailed movement bridges, and alternate definitions to focused tools. No standalone NRR calculator route or page spec was found in the assigned worktree. The focused tool needs to make its cohort and time window explicit so it answers a more specific question than the broader monthly snapshot.

### Competitor patterns

- [OnSumo NRR calculator](https://onsumo.com/tools/saas/nrr-calculator) was operated in a browser. It has a starting cohort MRR field, expansion, contraction, churn, monthly or annual cadence, and a region selector. It shows NRR, GRR, expansion and churn rates, a waterfall, a 12-month projection, and sensitivity scenarios. It says inputs stay in the browser. There is no reactivation input. With 100,000 starting MRR, 12,000 expansion, 2,000 contraction, and 5,000 churn, its live outputs were 105% NRR and 93% GRR. Changing the starting MRR to zero produced 500,100% NRR, an invalid result for a zero denominator. After changing contraction from 3,000 to 2,000, the static guide still showed its original 104% and 3,000 example, so the guide did not follow the live values.
- [Quant NRR calculator](https://www.quantcalculator.org/tools/business/net-revenue-retention-calculator) was operated in a browser. Its inputs are beginning MRR, churn, contraction, expansion, and optional new-customer MRR. The page explicitly excludes new-customer MRR from NRR and uses it only in its projections. With the same 100,000 / 12,000 / 2,000 / 5,000 cohort values and 8,000 new MRR, the result was 105% NRR and 93% GRR. It offers separate NRR and projection views. It has no reactivation input.
- The repeated calculator pattern is an opening MRR/ARR base plus expansion, contraction, and churn, with NRR as the primary answer and GRR as a common companion. Some tools add projections, sensitivity, or benchmark bands. Their main gap for this task is that the cohort boundary and reactivation convention are often absent or unclear.

### Technical facts and sources

- For one defined cohort and one interval, the denominator is recurring revenue from that same cohort at the beginning of the interval. An endpoint form is: NRR = end-of-interval recurring revenue from the defined cohort ÷ its beginning recurring revenue × 100. The equivalent movement bridge is: NRR = (starting recurring revenue + expansion + any reactivation included by the chosen convention − contraction − churn) ÷ starting recurring revenue × 100. Keep the revenue basis and interval consistent, such as MRR to MRR for the same month or ARR to ARR for the same year.
- New customer revenue acquired after the interval starts is excluded. ChartMogul explicitly says its NRR report excludes new business and uses opening MRR from subscribers active or past due at the start. Baremetrics' published NRR formula also omits new MRR. These sources support treating new-customer revenue separately from retention.
- Expansion is a net revenue gain from existing customers. Contraction is a revenue loss when existing subscribers have a net decrease. Churn is lost recurring revenue when a subscriber cancels their last or only subscription. Use mutually exclusive movements so one loss is not counted as both contraction and churn. [ChartMogul's NRR report notes and formula](https://help.chartmogul.com/article/143-chart-net-mrr-retention) define these components and give: (Starting MRR + Expansion MRR + Reactivation MRR − Contraction MRR − Churn MRR) ÷ Starting MRR.
- Reactivation has no single convention across the reviewed sources. ChartMogul includes reactivation in its periodic NRR report by default and offers an option to exclude it. Its cohort analysis groups customers by their first subscription and keeps each customer in that original cohort after later expansion, churn, or reactivation. Baremetrics' NRR article says its NRR formula omits Reactivation MRR, while its cohort help says a reactivated customer returns to the original cohort and reactivation revenue appears in cohort retention. Treat these as different reporting choices, not as one universal rule. A calculator that accepts aggregate movements cannot infer account history; it must state whether reactivation is included and should keep it identifiable.
- ChartMogul's [cohort definition](https://help.chartmogul.com/article/161-cohort-analysis) groups customers by the interval in which they start their first subscription; a customer remains in that original cohort after taking another subscription or canceling and re-subscribing. Its [Net MRR Retention cohort notes](https://help.chartmogul.com/article/160-cohort-net-mrr-retention) say expansion and reactivation raise cohort retention, while contraction and churn lower it. This is lifecycle cohort analysis, which should be distinguished from a single period's opening active-customer base when explaining the denominator.
- GRR is commonly shown alongside NRR and excludes expansion; it isolates starting revenue retained before expansion. Stripe and ChartMogul provide compatible formulas for that comparison. NRR can exceed 100% when included gains outweigh losses. The ratio is undefined when starting recurring revenue is zero.
- Sources: [Stripe, Net revenue retention for SaaS businesses](https://stripe.com/resources/more/net-revenue-retention) for the period-based concept, formulas, and NRR/GRR distinction; [ChartMogul, Net MRR Retention report](https://help.chartmogul.com/article/143-chart-net-mrr-retention) for the precise starting base and movement formula; [ChartMogul, cohort analysis](https://help.chartmogul.com/article/161-cohort-analysis) and [Net MRR Retention cohort](https://help.chartmogul.com/article/160-cohort-net-mrr-retention) for cohort membership over time; [Baremetrics, NRR formula](https://baremetrics.com/blog/what-is-net-revenue-retention) and [Baremetrics cohort behavior](https://help.baremetrics.com/en/articles/5380031-cohorts) for a contrasting reactivation convention.

### Opportunity and blockers

The clearest opportunity is a focused calculation that names which customers make up the opening cohort, what interval is measured, and which MRR movements make up the ending cohort revenue. Keep new-customer revenue outside NRR and make the reactivation rule visible. A zero opening base must not produce a percentage.

No paid API, maintained dataset, account, or background job is needed for the manual calculation. Peer benchmarks are not required for correctness; reviewed competitor bands were not backed by a consistent source in the calculator flow. There is no research blocker for a manual cohort calculation.

## Product

### Promise and scope

A solo SaaS founder or operator has a billing report for one month and wants to know how much recurring revenue the customers active at the start of that month retained. The tool returns net revenue retention (NRR) for that opening group and shows the exact MRR bridge behind the percentage. It names the month, starting base, excluded new customers, and treatment of reactivation.

Launch is a manual calculation for one completed calendar month in one currency. The opening cohort is customers with an active, billable subscription immediately before that month's first day, using the operator's consistent billing-system definition of active. The ending boundary is immediately after the month's last day. Enter monthly recurring revenue (MRR) already normalized to a monthly run rate at both boundaries; exclude one-time charges and tax. A customer acquired after the opening boundary never joins this calculation, even if they churn during the month. This period's opening active base is distinct from a lifetime signup cohort.

Reactivation is included only when a customer in the opening active cohort churns and returns within the same month. The reactivation amount is that returning customer's restored MRR; it stays a separate movement. A customer who was inactive at the opening boundary is outside this cohort, even if they subscribed in an earlier month. The tool does not offer an alternate reactivation convention at launch. It cannot identify customers or verify classifications from aggregate amounts, so the person must use mutually exclusive categories from one source report. A decrease must not count as both contraction and churn. Record a same-month churn event in churned MRR and its later restoration in reactivation MRR; do not also count the restored amount as expansion.

This focused period retention check complements `/saas-metrics-calculator`'s broader one-month snapshot and `/mrr-waterfall-calculator`'s full-company bridge that includes new business. It does not calculate total-company ending MRR, customer-count retention, lifetime cohort tables, GRR, benchmarks, health scores, forecasts, ARR conversion, plan normalization, imports, saved scenarios, or alternate retention policies. GRR is omitted because gross movement amounts alone may not identify which churned dollars previously expanded; an apparently precise GRR could be wrong. The result is a recurring run-rate ratio, not recognized revenue or cash received.

### Technical contract

**Inputs and parsing.** Start with an empty reporting month and five empty required MRR fields. Show USD as the default currency. A known zero must be entered as `0`; a blank movement is unknown and blocks calculation. Currency only formats amounts and never converts them. All amounts must have the same currency, MRR definition, month, and opening-customer boundary.

| Input | Accepted value and meaning |
| --- | --- |
| Reporting month | Strict `YYYY-MM`, January 2000 through December 2100 inclusive. It labels the calendar month; the calculator does no timezone or date arithmetic and cannot verify that a report is final. |
| Currency | USD, EUR, GBP, INR, CAD, or AUD. All choices display two decimal places. |
| Opening cohort MRR (`S`) | Required nonnegative amount from `0` through `1,000,000,000,000.00` inclusive, from customers active at the opening boundary. |
| Expansion MRR (`E`) | Required nonnegative gain from that opening cohort during the month. |
| Reactivation MRR (`R`) | Required nonnegative restored MRR from opening-cohort customers who churned and returned during the month. Enter `0` when none did. |
| Contraction MRR (`C`) | Required nonnegative reduction from opening-cohort customers who remain subscribed, separate from complete churn. |
| Churned MRR (`L`) | Required nonnegative loss from opening-cohort customers who cancel their final subscription during the month. |

Each movement amount has the same inclusive bound as `S`. Trim outer whitespace. Accept only base-10 digits with an optional decimal point followed by one or two digits. Leading zeros are allowed. Reject blank amounts, signs, grouping commas, currency symbols, exponents, interior spaces, more than two fractional digits, non-string or nonfinite values, unsupported currency, and out-of-range amounts. Keep raw strings in the form and enforce the same validation in a pure calculation engine. Parse money into integer cents before arithmetic; all accepted intermediate monetary totals stay within JavaScript's safe-integer range.

**Calculation and consistency.** Compute `ending cohort MRR = S + E + R - C - L` in integer cents, then `NRR = ending cohort MRR / S × 100`. Do not add MRR from customers who joined after the opening boundary. If `S = 0`, the opening cohort is empty: require `E = R = C = L = 0`, then show `NRR unavailable` with the reason `Opening cohort MRR is zero`; ending cohort MRR is exactly zero. If `S = 0` with any nonzero movement, reject the inconsistent submission. If `R > 0` while `L = 0`, reject it: an opening-cohort customer cannot churn and return in the month without a recorded churn event. Reject a negative computed ending cohort MRR; do not clamp it to zero or show a negative retention rate. Do not impose a separate `C + L <= S` rule: aggregate losses can include revenue that expanded and later disappeared in the same month. These checks cannot prove that underlying account events were classified correctly.

**Output and rounding.** Lead with NRR as a percentage; show the named month and selected currency with the result. Next show a compact signed movement breakdown and ending cohort MRR, so numerator and denominator can be audited. Show positive `E` and `R` with `+`, negative `C` and `L` with `-`, and exact zero without a negative sign. Display money in the selected currency with en-US digit grouping and exactly two decimals; do not abbreviate large amounts. Keep every monetary operation in integer cents. Format NRR to two decimal places with half-up rounding from the exact integer-cent ratio; use integer or BigInt arithmetic for percentage scaling so the upper input bound cannot overflow. A nonzero NRR below `0.01%` must show `<0.01%`, not `0.00%`. Exact zero is `0.00%`, and NRR may exceed `100%`. Never show `0%`, infinity, or a fabricated percentage for a zero denominator. The whole bridge remains available when the denominator is zero and every movement is explicitly zero.

**Action and states.** `Calculate NRR` is the only primary action. A valid submission produces the percentage or its explicit zero-denominator unavailable state and the complete MRR breakdown. Empty, malformed, out-of-range, or inconsistent inputs clear any previous result, preserve entered strings, show precise field or movement-group errors, and focus the first affected field in reading order. If the implied ending value is negative, place the movement-group error by churned MRR and focus it. Any edit to month, currency, or money clears the previous result until recalculation; changing currency does not convert amounts. An unexpected local calculation failure clears the result, preserves inputs, and leaves Calculate available to retry. Calculation is synchronous and local, so no loading, no-match, network, or partial-input result state applies. Reset clears month, amounts, errors, and result, and restores USD.

Keep the financial figures in client component memory only. Do not place values in the URL, browser storage, cookies, requests, logs, or analytics events. Existing site analytics may count a page visit without calculator values. Render submitted values as text, never HTML; no user-supplied links are accepted.

### Known examples

These examples are independent arithmetic checks for the builder.

| Inputs | Expected result |
| --- | --- |
| April 2026, USD: `S=10000`, `E=1200`, `R=100`, `C=300`, `L=500`. | Ending cohort MRR is `$10,500.00`; NRR is `105.00%`. New-customer MRR, if any, is absent from these inputs and from the numerator. |
| May 2026, USD: `S=1000`, `E=100`, `R=50`, `C=80`, `L=70`. | Ending cohort MRR is `$1,000.00`; NRR is `100.00%`. The `$50.00` reactivation belongs to an opening-cohort customer who churned and returned in May. |
| June 2026, USD: `S=8450.25`, `E=349.90`, `R=150.05`, `C=275.35`, `L=424.90`. | Ending cohort MRR is `$8,249.95`; NRR rounds once from exact cents to `97.63%`. |
| July 2026, USD: `S=100`, `E=R=C=0`, `L=100`. | Ending cohort MRR is `$0.00`; NRR is the valid result `0.00%`. |
| August 2026, USD: `S=0`, `E=R=C=L=0`. | Ending cohort MRR is `$0.00`; NRR says `Unavailable` because opening cohort MRR is zero. It does not show `0.00%`. |
| September 2026, USD: `S=0`, `R=50`, `E=C=L=0`. | Invalid: there cannot be reactivation from an empty opening active cohort. Do not produce an NRR or bridge. |
| October 2026, USD: `S=100`, `E=10`, `R=0`, `C=60`, `L=60`. | Invalid: ending cohort MRR would be `-$10.00`. Do not floor or display it. |
| `S=100`, `R=10`, `L=0`, `E=C=0`; or a required movement left blank, `-1`, `1e3`, `$100`, `1,000`, `0.001`, or month `2026-13`. | Specific inline validation error and no result. Explicit `0` is valid. |

### Ownership

- Public URL `/net-revenue-retention-calculator`. Put the server page and client workbench in `app/(site)/(tools)/(saas)/net-revenue-retention-calculator/`, using the SaaS route-group layout, shared shell, `PageCanvas`, tool-page loader, and database Markdown renderer. Add no route-owned publication or SEO metadata.
- Put strict parsing, validation, integer-cent calculation, and percentage formatting data in `lib/net-revenue-retention-calculator/engine.ts`. Focused independent examples and invalid-input tests belong in `tests/pages/net-revenue-retention-calculator/`. The route component owns raw form values, errors, focus, status, and rendering. Use a colocated CSS module for layout with shared tokens and controls. No API, external data source, or background job is needed.
- This spec owns the contract. `public.stack127_tool_pages` owns title, introduction, instructions, supporting Markdown, version, and card copy; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog rank. Mark any development preview content as temporary. Any dedicated page-update script belongs under `scripts/net-revenue-retention-calculator/`.

### Catalog placement and card art

Primary and only catalog: `/saas-tools`. A founder browsing SaaS calculators can choose a cohort retention check after the broader metrics, revenue, and margin tools. The catalog already exists in development. Reserve display order 7, after `/saas-gross-margin-calculator` at 6; the earlier cards are SaaS Metrics (1), MRR (2), ARR (3), MRR Waterfall (4), and ARPU/ARPA (5). Confirm the full ordered membership list during integration. No secondary catalog serves this task.

Catalog `toolSpot` key: `net-revenue-retention-calculator`. Visual takeaway: an opening group carries recurring revenue through gains and losses to a retained ending amount. Focal subject: one anchored opening cohort bar and one ending bar connected by a small gain and loss movement sequence, with the opening group staying visually identified. Keep it wordless and legible at card size in both themes. Avoid generic calculator icons, percentages, currency glyphs, invented benchmark bands, or a visual that implies new customers joined the cohort.

## Interface

### Flow and control mode

The reader asks, "What percentage of MRR did the customers active at the start of this month retain by its end?" The lead answer is NRR for that opening group, or `Unavailable` when its opening MRR is zero. `Calculate NRR` is the one primary action. Control mode is `single`: month, currency, opening MRR, and all four cohort movements are visible because each determines the basis, answer, or meaning. There is no hidden assumption, alternate-policy switch, or advanced panel.

Use the shared full-width workbench band with a measured inner width. Read in this order: reporting month and currency; opening cohort MRR; expansion, reactivation, contraction, and churned MRR; Calculate and quiet Reset; one divider; NRR lead; exact cohort MRR breakdown. The page article explains cohort identification and MRR normalization. Keep only brief error-preventing guidance in the workbench: by opening MRR, say that this is from customers active when the month began; by reactivation, say it is only for those same customers if they churned and returned. Beside the movement group, say `Enter 0 if a movement did not occur. Exclude new customers.` These notes must not crowd the answer.

### Controls and component decisions

| Area | Component and behavior |
| --- | --- |
| Month and currency | Reuse required `UiTextField` for `Reporting month`, with `YYYY-MM` as an example, and `UiSelect` for the six currency choices. USD is visibly selected. Currency formats results but does not convert amounts. |
| Opening cohort | Reuse required `UiTextField` for `Opening cohort MRR`, keeping the entered string for strict parsing. Use `inputMode="decimal"`; the note beside it defines the opening active group. |
| Cohort movements | Reuse four required `UiTextField` controls in Product order, labeled `Expansion MRR`, `Reactivation MRR`, `Contraction MRR`, and `Churned MRR`. The labels name the nonnegative amounts to enter; the engine supplies the signs. Group the first two as gains and the last two as losses, without hiding any field. |
| Actions | Reuse `UiActionRow` and `UiButton` for primary `Calculate NRR` and secondary `Reset`. Enter submits the form; Reset is a button. Keep Calculate enabled on an empty form so submission can identify missing fields. |

Use persistent labels, visible required marks, programmatic required state, field-associated errors, `autoComplete="off"`, capitalization and spellcheck off. Money inputs use `inputMode="decimal"`. Keep selected currency visible once for the MRR group; do not repeat a unit selector under each amount. `UiNumberField` is unsuitable because numeric coercion or increment controls could reshape malformed pasted money before validation. Reuse the shared focus ring, `--radius`, text, surface, border, and accent tokens. The existing `/components-ui` gallery and SaaS sibling tools supply the control, action, status, lead result, and table patterns. Only the fixed form and result composition are route-specific. No chart, slider, upload, copy, export, or new shared component serves this calculation.

### Result hierarchy

Start with one neutral `UiPrimaryResult` labeled `Net revenue retention`, showing the formatted percentage or `Unavailable`. Its detail identifies the reporting month and that this is the opening active cohort. When the denominator is zero, the detail gives `Opening cohort MRR is zero`; it must not style the state as an input error. Put the short formula `Ending cohort MRR ÷ opening cohort MRR × 100` beside the lead result, without restating formatted values.

Follow with one `UiDataTable` headed `Opening cohort MRR breakdown`. Its columns are `Component` and `MRR`; rows are opening cohort MRR, signed expansion, signed reactivation, signed contraction, signed churn, and ending cohort MRR. The final row is the numerator; the first row is the denominator. Do not repeat the ending amount in a separate metric card or add a second bridge. Keep positive and negative signs textual, with neutral styling: a decline is a measurement, not a grade. The table order is arithmetic, not a claim that customer events happened in that chronological sequence. A zero entered by the reader appears as an exact zero amount. New-customer MRR has no row, because it is outside the calculation.

A chart would add an arbitrary scale and duplicate the six exact values without clarifying this one ratio. The table lets readers audit the result at any amount size and works as a screen-reader result. The catalog `toolSpot` art is conceptual card art, not part of the workbench.

### States and recovery

- **Initial and empty:** month and five amounts are blank, USD is visible, and no result, sample percentage, or placeholder bridge appears. A blank submission is invalid; no blank is silently zero.
- **Valid:** show NRR and the complete table together; move focus to the labeled lead output so it is announced once. An ending cohort MRR of zero yields a valid `0.00%`. NRR can exceed `100%` without success or health styling. A true nonzero rate below `0.01%` uses the Product's less-than display. Explicit all-zero inputs give a complete `$0.00` breakdown and `Unavailable` for the zero denominator, with its reason beside the lead.
- **Invalid:** clear any previous result, keep all entered strings, show each missing, malformed, or out-of-range error immediately under its field, and focus the first invalid control in visual order. If starting MRR is zero and a movement is positive, attach a cohort-consistency error to the first positive movement and focus it. If reactivation is positive while churn is zero, attach one consistency error to `Reactivation MRR` and focus it. If losses imply negative ending cohort MRR, put one movement-group error under `Churned MRR` and focus that field. No error result panel or duplicate form summary is needed. The pure engine also rejects unsupported currency even though the normal selector cannot produce it.
- **Edited after result:** immediately clear the lead and table, keep the edited value and focus, and announce `Inputs changed. Calculate again.` once. Currency changes invalidate the display but never alter numeric input.
- **Unexpected failure and retry:** keep every input, clear all results, show one `UiStatus` error by the action saying NRR could not be calculated and to try again. The same primary action retries. There is no loading spinner, network state, no-match state, or partial-input result because calculation is synchronous and local.
- **Reset and restoration:** clear month, amounts, errors, status, and result; restore visible USD, focus Reporting month, and announce reset. A clean `/net-revenue-retention-calculator` URL stays unchanged through hydration and calculation. Reload starts fresh; browser back/forward cache may restore form and result together, and the next edit clears that restored result. Do not serialize financial inputs in a URL or browser storage.

Use one polite status message for edits, reset, and failure. Success is announced by focusing the result, rather than by an identical live status. Associate each inline error with its field so the explanation is read when focus moves there. `Unavailable` remains a labeled ratio state, not a fabricated numeric value.

### Responsive and accessible behavior

At desktop width, pair month and currency, keep opening cohort MRR prominent on its own row, and use two authored movement rows for the gains and losses where labels and errors have room. Keep actions below every required amount. Below the divider, show the NRR lead before the table, without nested result cards. Align the form to a calm inner measure while the workbench band spans the main column.

At mobile width, stack month, currency, opening MRR, expansion, reactivation, contraction, churn, Calculate, Reset, lead, and table in that same order. Buttons retain comfortable targets. `UiDataTable` changes to labeled rows; long currency figures and a potentially very large percentage may wrap at separators but must not clip or force page-level horizontal scrolling. Input contents may scroll within their fields while focused. Use `min-width: 0` on grid children and keep labels, errors, and the less-than sign visible.

Tab order follows the visible inputs, currency select, Calculate, and Reset. Enter submits; Reset responds to Enter or Space. The shared select retains keyboard and mobile native semantics. No result row is an interactive target. Keep focus visible in both themes. The result output has a useful accessible label, and the table has an explicit caption and row and column headers. Review the actual page at desktop and mobile widths with the decimal example, zero opening base, zero ending base, missing versus entered zero, negative-ending rejection, malformed pasted money, the maximum money value, long percentage, keyboard focus, and both themes.

## Content

Follow `stack127_docs/writing-style.md` for the final words and visuals. This section plans the page; it is not live copy.

### Search intent and metadata direction

The reader searches for an NRR or net revenue retention calculator after exporting a month's subscription movements. They want a percentage for customers already active when that month began, plus a way to check what counted. They may arrive with a company-wide MRR figure, so the title and opening must establish the cohort boundary early.

Use the writing skill's title pattern: begin with `Net revenue retention calculator`, then name the question or outcome in ordinary language, such as retained MRR from starting customers. The introduction should state the monthly opening-cohort task, teach the simple endpoint formula `ending cohort MRR ÷ opening cohort MRR × 100`, explain that new-customer MRR is excluded, and lead into the tool. That short formula belongs in the introduction because it can be understood on its own. Explain how the four movements form ending cohort MRR after usage, with the worked example. Do not place the entire classification policy or a GRR discussion above the workbench.

The SEO title should pair the calculator name with monthly cohort MRR or retention, without promising a cohort dashboard. The description should say that the reader enters opening MRR and the month's expansion, reactivation, contraction, and churn to calculate and inspect NRR. Avoid `free benchmark`, ARR, forecasts, live billing access, or a company-health grade. The `/saas-tools` card needs a short task-focused name and description that identifies this as an opening-customer retention check, distinct from the broad SaaS Metrics calculator and the full-company MRR Waterfall. Final title, metadata, interface words, and card copy belong to the writing stage and tool-page database row, not this spec.

### Page promise

After using the page, the reader should be able to say what share of opening-cohort MRR remained at the end of one named month, which gains and losses produced it, and whether their billing report's cohort and reactivation policy match this calculation. They should know why a zero opening base gives `Unavailable` rather than `0%`, and why the result does not describe all-company MRR growth or count customer retention.

### Content completeness map

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| Which customers and dates define the cohort? | The form says `Opening cohort MRR`; result names the month and opening active cohort. | Define customers active immediately before the chosen calendar month, measured through its end. Distinguish this period's opening group from customers grouped by their first signup month. Explain why new subscribers in the month are excluded. |
| What MRR amounts should I enter? | Five required amount fields, currency, zero guidance, and signed result table show the categories. | Explain that all figures use one currency and normalized monthly recurring value from the same billing report. Define expansion, contraction, and churn without double counting a loss; exclude one-time charges, tax, and new-customer MRR. |
| When does reactivation count? | The form says it is for opening customers who churned and returned; the engine requires a recorded churn movement when reactivation is positive. | Explain the fixed policy: record the churn event and later restoration for an opening-cohort customer in the same month. An earlier customer inactive at the opening boundary is outside this cohort. Mention that reporting products use different conventions, so like-for-like comparison needs the same policy. |
| What does the percentage mean? | The lead NRR, endpoint formula, and exact opening-to-ending MRR table are in the result. | Explain that 100% means ending cohort MRR equals its opening amount; above 100% means included gains outweighed losses, not that no one churned. The table is an arithmetic reconciliation, not a timeline of when events occurred. |
| Why is the result unavailable or rejected? | Zero opening MRR yields `Unavailable` with a reason and a zero breakdown. Field errors identify blank or inconsistent amounts. | Explain that division by zero has no percentage, even when all values are zero. Distinguish unknown blank movements from entered zero; direct the reader back to source records for a missing amount, reactivation without churn, or losses implying negative ending MRR. |
| Is this GRR, customer retention, or company growth? | The tool reports NRR only and excludes new MRR. | Briefly distinguish NRR from GRR's exclusion of gains, customer-count retention, and full-company MRR growth. Explain why this aggregate bridge does not report GRR: losses can include revenue expanded and later lost in the same month. Do not invent a GRR from its visible amounts. |

### Recommended outline and formats

**Introduction before the tool:** Start with a founder who has one month's categorized MRR movements and wants retention of the customers who were already active. Define NRR in one sentence, give the endpoint formula with the opening cohort and same-month ending amount named, and say that the tool builds the ending amount from the four movements. State that new-customer MRR stays out. Keep it useful even if the reader does not scroll past the tool.

**Usage after the tool:** A short numbered sequence should help the reader (1) select a completed month and extract opening active-customer MRR from one consistent report, (2) enter expansion, reactivation, contraction, and churn from that same group, using explicit `0` when a movement did not occur, and (3) read NRR with the signed breakdown. Include one recovery sentence about checking source classifications when the form rejects a combination. Do not narrate ordinary clicking, repeat every field label, or recopy the live result.

**Supporting content after usage:**

1. `Who belongs to the opening cohort?` Explain the start and end boundary, why month-of-acquisition customers are excluded, and how this differs from a lifetime signup cohort. A small included/excluded Markdown table may help if prose alone makes the boundary hard to scan. Avoid treating a former customer inactive at the opening boundary as an opening-cohort reactivation.
2. `How the MRR movements affect NRR` Give the movement formula and one coherent worked example from Product: opening `$10,000`, expansion `$1,200`, reactivation `$100`, contraction `$300`, churn `$500`, ending cohort MRR `$10,500`, and NRR `105%`. Use one `> [!EXAMPLE]` block for the worked arithmetic; a `> [!FORMULA]` block is optional if it adds clarity beyond the introduction and live formula. Explain that churn and a later return can be separate movements for the same customer, while one reduction must not be both contraction and churn. Do not reproduce the result table as another chart or table.
3. `What NRR does and does not tell you` Interpret below, equal to, and above 100% without health labels. Explain that a high NRR may coexist with customer churn and that all-company growth also includes new business. Contrast GRR in a short paragraph; this page does not calculate it, and a reliable gross figure needs movement classification that isolates original revenue from later expansion. Compare retention rates only across like-for-like cohorts, intervals, and reactivation policies.
4. `When NRR is unavailable` Explain the zero opening denominator using the valid all-zero example. A result of `Unavailable` is a missing denominator, not a zero retention rate. Name the main data limits: manual aggregates cannot prove account identity, billing event timing, plan normalization, or source classification. Close with the practical next step: inspect customer-level billing records and compare later months using the same definitions.

The live tool already displays the exact bridge. No additional chart, marker art, benchmark band, FAQ, or projection is needed for this single-month page. If the writer uses a table, use ordinary Markdown rendered by `ContentMarkdown`; formulas and the example use the supported `[!FORMULA]` and `[!EXAMPLE]` blockquote syntax in `stack127_docs/shared-ui.md`. The generated `toolSpot` is catalog card art, not an article figure.

### Concepts and result interpretation

| Concept | Example, caveat, and source role |
| --- | --- |
| Opening active cohort | The April example starts with `$10,000` from customers active before April begins. A customer first subscribed on April 2 contributes no April NRR numerator or denominator, even if their MRR raises company revenue. [ChartMogul's NRR report](https://help.chartmogul.com/article/143-chart-net-mrr-retention) controls the period opening-base and excluded-new-business distinction; [cohort analysis](https://help.chartmogul.com/article/161-cohort-analysis) supports the separate lifetime-cohort concept. |
| Reactivation policy | An opening-customer churn event of `$100` followed by a `$100` restoration can net to zero for those two movements, while both events remain visible. A customer inactive before April began is excluded here. [ChartMogul](https://help.chartmogul.com/article/143-chart-net-mrr-retention) supports an include-reactivation formula, and [Baremetrics' NRR formula](https://baremetrics.com/blog/what-is-net-revenue-retention) shows that conventions differ. The tool's narrower opening-customer rule is its stated Product policy, not a universal provider rule. |
| NRR versus GRR | The `$10,500` ending amount over `$10,000` opening MRR gives `105%` NRR after gains and losses. This says nothing about how many customers stayed. GRR excludes expansion and is a separate measure; avoid computing it from this aggregate input set. [Stripe's NRR guide](https://stripe.com/resources/more/net-revenue-retention) controls the NRR/GRR distinction. |
| Unavailable versus zero | A valid `$0.00` opening and `$0.00` ending bridge gives `Unavailable`; `$100` opening and `$0` ending gives `0.00%`. Product defines these exact states. The first has no denominator; the second measures a cohort that lost all its opening MRR. |

### Usage, limits, and next step

Ground the guide in a founder reconciling one completed calendar month's MRR export, with every amount already normalized to monthly recurring value. Explain the fixed reactivation policy at the point the reader decides which events to enter. For an invalid form, recommend checking the source cohort and event labels rather than changing a figure merely to make the calculator accept it. For a zero opening base, read the exact zero bridge but do not interpret the missing rate as performance. Suggest comparing later monthly NRR values only after keeping the same cohort boundary, currency, billing definition, and reactivation policy.

Avoid claims of a billing integration, verified ledger, full historical cohort analysis, GRR, customer-count retention, recognized revenue, peer benchmark, forecast, or universal healthy threshold. Do not imply that `105%` means every customer was retained or that all-company MRR grew by 5%. Do not call a manual aggregate a certified accounting result. If the page suggests another tool, `/mrr-waterfall-calculator` answers how all-company MRR moved including new business, while `/saas-metrics-calculator` offers a broader monthly snapshot; link these and `/saas-tools` only when each destination is published.

### Source roles and links

Use the primary URLs in Research where they support the reader's decision, rather than adding a bibliography of every reviewed site. [ChartMogul's Net MRR Retention report](https://help.chartmogul.com/article/143-chart-net-mrr-retention) supports the opening base, movement categories, new-business exclusion, and an include-reactivation convention. [ChartMogul's cohort analysis](https://help.chartmogul.com/article/161-cohort-analysis) supports the distinction between a signup cohort and this tool's opening active group. [Stripe's NRR guide](https://stripe.com/resources/more/net-revenue-retention) supports retention interpretation and the NRR/GRR comparison. [Baremetrics' NRR formula](https://baremetrics.com/blog/what-is-net-revenue-retention) is useful only where the page explains that reactivation conventions vary. Competitor calculators supply research context, not authoritative formulas or benchmarks.

The page uses no live source data or maintained benchmark. Recheck the linked providers' definitions during writing, especially their reactivation wording; do not invent a checked date. Use internal links only after the target routes and catalog are published. Keep source links next to factual claims and the Product policy clear where it is this tool's chosen convention.
