# SaaS metrics calculator

Route: `/saas-metrics-calculator`

## Research

### User job

A solo SaaS founder or operator wants to turn a period of billing and operating figures into a clear snapshot of recurring revenue, retention, acquisition cost, unit economics, gross margin, and growth efficiency. They need to see what each result measures, keep monthly and annual figures straight, and know when the inputs do not support a meaningful result. The requested route is new: no matching SaaS metrics, MRR, churn, CAC, or LTV tool exists under the current tools routes.

### Competitor patterns

- [Free SaaS Metrics](https://www.freesaasmetrics.com/) takes inputs in four groups: revenue and growth, retention and churn, acquisition and unit economics, and advanced health benchmarks. It calculates 14 metrics live and presents a color-coded health scorecard. The operated page also had example and clear controls, saved scenarios, PDF download, copy/share actions, improvement suggestions, and metric FAQs. It claims calculations stay in the browser; that privacy claim was not independently checked. Its benchmark and health labels make a wide metric set easy to scan, but depend on the company's stage and definitions.
- [FCF Startups SaaS Metrics Calculator](https://fcfstartups.com/tools/saas-metrics-calculator/) uses one month of MRR movements: opening MRR, new, expansion, contraction and churn, plus gross margin, sales and marketing spend, new customers, and net burn. It updates ending MRR/ARR, net new MRR, NRR, gross MRR churn, CAC, CAC payback, burn multiple, and quick ratio, with CSV download. With opening MRR cleared, NRR and gross MRR churn displayed as `—`; with new MRR set to zero, CAC payback displayed as `—` instead of a numeric result. This is a useful pattern for showing a metric as undefined when a denominator is zero.
- **Observed inference:** FCF Startups' prefilled result showed $13,000 net new MRR, $130,000 net burn, and a 10.00× burn multiple, which matches burn divided by net new MRR. The [Burn Multiple definition from Craft Ventures](https://www.craftventures.com/articles/the-burn-multiple) is net burn divided by net new ARR. If those FCF Startups figures cover one month, $13,000 net new MRR annualizes to $156,000 ARR, producing about 0.83×. The competitor does not expose its formula beside the result, so this is an inference from the displayed values.
- [Simran Software Solutions' calculator](https://simransoftwaresolutions.com/lab/saas-metrics/) was a third candidate. Direct browser navigation failed with an HTTP response error, so it was not used to support an observation. The two operated calculators covered the distinct all-metrics scorecard and monthly movement approaches; further examples repeated those patterns.

### Technical facts and sources

- **MRR and ARR:** MRR is normalized recurring subscription revenue for a month. Divide an annual subscription by 12; exclude one-time fees. ARR is commonly MRR × 12, an annualized run rate rather than revenue already earned. [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) documents both the normalization and the annual-plan rule.
- **Churn and retention:** Customer churn counts paying customers lost divided by paying customers at period start; it is distinct from revenue churn. Excluding customers who joined and churned or churned and reactivated in the same period can affect the count. [ChartMogul's customer churn definition](https://chartmogul.com/saas-metrics/customer-churn/) records these cases. NRR = (starting MRR + expansion − contraction − churn) ÷ starting MRR for the existing customer base; leave new customers out. GRR uses the same opening MRR and losses but excludes expansion, so it cannot exceed 100%. [ChartMogul's retention formulas](https://chartmogul.com/blog/net-and-gross-retention-rates/) and [Stripe's GRR definition](https://stripe.com/resources/more/gross-revenue-retention-what-it-is-how-to-calculate-it-and-what-it-can-tell-businesses) support this distinction.
- **Gross margin and LTV:** Gross margin = (revenue − COGS) ÷ revenue. COGS scope matters; Stripe lists hosting, software delivery, and customer support as SaaS examples in its [SaaS metrics guide](https://stripe.com/resources/more/essential-saas-metrics). A simple SaaS LTV estimate is ARPA × gross margin ÷ customer churn rate. It is forward-looking and assumes churn and margin stay stable; it can overstate value when churn is concentrated early and does not model expansion or contraction. [ChartMogul's LTV definition and limitations](https://chartmogul.com/saas-metrics/ltv/) document those limits.
- **CAC and payback:** CAC = acquisition sales and marketing costs ÷ new paying customers over a matching period. Sales cycles and expense allocation can make same-calendar-period CAC misleading. [Stripe's CAC guide](https://stripe.com/resources/more/cac-in-saas) describes the formula and timing problem. Payback is CAC divided by monthly customer profit. Stripe's general metrics guide uses MRR as the divisor, while its [dedicated payback guide](https://stripe.com/resources/more/what-is-the-cac-payback-period) uses monthly profit per customer. A margin-aware result should explicitly use monthly gross profit per customer (ARPA × gross margin); do not label a revenue-only calculation as profit payback.
- **Growth efficiency:** Burn multiple = net burn ÷ net new ARR for the same reporting period; when net new ARR is zero or negative, the ratio is not meaningful. [Craft Ventures' definition](https://www.craftventures.com/articles/the-burn-multiple) gives this formula. The Rule of 40 is commonly revenue growth plus a profit margin, but the margin basis and measurement period must be stated. [Bessemer's discussion](https://www.bvp.com/atlas/the-rule-of-x) uses growth plus free-cash-flow margin and notes the heuristic is limited, especially for early-stage companies. Do not imply these metrics alone determine business health.
- Keep the currency, customer/account basis, and reporting period aligned across inputs. Percentage inputs are rates; formulas using them as multipliers require the percentage converted to a fraction (for example, 80% = 0.80). When a denominator is zero or unavailable, show the result as undefined rather than zero or infinity.

### Opportunity and blockers

Make the tool a transparent manual snapshot for founders who do not have a connected analytics platform: accept clearly defined figures for a reporting period, show a compact set of revenue, retention, unit economics, margin, and efficiency results, and expose formulas and period assumptions near those results. The strongest gap is avoiding incompatible units and opaque score labels: distinguish customer churn from revenue churn, use existing-customer movements for retention, margin-adjust acquisition payback, and annualize MRR before presenting burn multiple. Stage and segment benchmarks vary, so historical comparison or a clearly sourced benchmark set is more defensible than a universal healthy/unhealthy verdict.

The manual calculator needs no paid API, maintained dataset, account, or background job. It cannot verify whether source accounting, attribution, COGS allocation, or recurring-revenue inputs are correct. Any live peer benchmark would require a maintained, well-defined source; none is included in this research scope. No external approval is needed for the manual calculation scope.

## Product

### Promise and scope

A solo SaaS founder or operator wants one honest snapshot from a completed calendar month, without connecting billing or accounting systems. Enter normalized MRR movements and, when available, matching customer, cost, and cash figures. The tool shows the resulting run rate, retention, unit economics, and burn efficiency, with the period and denominator beside each result. It helps the reader find a question to investigate; it gives no health grade or investment advice.

Launch is a manual, single-company, single-currency, one-month calculation. The five MRR figures are the minimum. Customer counts, recurring revenue and COGS, acquisition spend, and net cash burn add optional result groups. All money and counts use the same calendar month and the same paying-account basis. Starting MRR and starting accounts mean the instant before that month; ending values mean the instant after it. Enter MRR already normalized to monthly recurring value, including annual subscriptions divided by 12, and exclude one-time charges, tax, and usage that is not contractually recurring. Movements are net categories during the month: new MRR comes from newly paying accounts; expansion, contraction, and churn concern accounts paying at the start. Do not count the same loss in both contraction and churn.

This is the overview for the 40 other planned SaaS tools, not their combined workflows:

| Planned focused tools | Boundary for this overview |
| --- | --- |
| MRR, ARR, MRR Waterfall, ARPU/ARPA, SaaS Gross Margin, NRR, Customer Churn, Revenue Churn, Burn Multiple, CAC, LTV:CAC, CAC Payback, SaaS Unit Economics | Show the simple monthly snapshot metrics specified below. Leave detailed bridges, alternate definitions, segments, cohort analysis, assumptions, and comparisons to those tools. Do not calculate LTV:CAC here. |
| Break-Even MRR, Ramen Profitability, SaaS Cost Structure, Startup Burn Rate, Startup Runway | No expense model, founder salary target, cash-balance projection, or break-even calculation. Net cash burn is an entered figure used only for burn multiple. |
| SaaS Pricing, SaaS Pricing Tier Builder, Monthly vs Annual Pricing, Price Increase, Usage-Based Pricing, Hybrid Pricing, Freemium vs Free Trial, AI SaaS Pricing, AI SaaS Gross Margin | No price, plan, billing mix, trial, usage, AI cost, or margin scenario builder. |
| SaaS Sales Funnel, CAC by Acquisition Channel, Customer Growth, MRR Growth Projection, SaaS Revenue Forecast, Time to MRR Goal | No channel attribution, funnel stages, projections, goal dates, or future-period forecasts. |
| Customer Retention, Churn Impact, Dunning Revenue Recovery, Monthly ↔ Annual Churn Converter, SaaS Activation Rate, Product Stickiness, A/B Test Significance | No cohorts, recovery model, annualized churn conversion, activation or usage events, or experiment statistics. |

No import, integration, saved scenario, PDF/CSV, peer benchmark, traffic-light score, Rule of 40, or automatic financial recommendation at launch. Rule of 40 needs a separately defined annual growth window and profit-margin basis; this one-month tool must not improvise either. The tool cannot verify ledger classification, cost allocation, or whether this month's sales spend actually acquired this month's customers.

### Technical contract

**Inputs and parsing.** Start with an empty reporting month and empty amount fields; currency defaults to USD. Required MRR fields must be entered explicitly, even when zero. An optional group may be entirely blank or complete. A partly filled group is invalid and names the missing fields.

| Input | Unit and accepted value |
| --- | --- |
| Reporting month | Required strict `YYYY-MM`, January 2000 through December 2100. This labels the measured calendar month; no date or timezone arithmetic. |
| Currency | Required choice USD, EUR, GBP, INR, CAD, or AUD. It formats every monetary result; there is no conversion. All choices use two decimal places. |
| Starting MRR; new, expansion, contraction, and churned MRR | Five required nonnegative amounts, each 0 to 1,000,000,000,000 inclusive. Expansion, contraction, and churned MRR apply only to the starting paying base. |
| Starting paying accounts; new paying accounts; churned starting accounts | Optional all-or-none group of nonnegative whole counts, each 0 to 1,000,000,000 inclusive. One account means one paying customer for every count and ARPA calculation; do not mix users, seats, and companies. |
| Recognized recurring revenue; recurring service COGS | Optional all-or-none pair of nonnegative monthly amounts in the chosen currency, each 0 to 1,000,000,000,000. Use recognized subscription revenue and its matching delivery costs, such as hosting and support, rather than cash receipts or all company expenses. |
| Acquisition sales and marketing spend | Optional nonnegative monthly amount in the chosen currency, 0 to 1,000,000,000,000. Requires the complete account-count group. It is the cost allocated to acquiring the new paying accounts entered above. |
| Net cash burn | Optional signed monthly amount in the chosen currency, -1,000,000,000,000 to 1,000,000,000,000. Cash outflows minus cash inflows; negative means cash generated. Do not derive it from COGS or acquisition spend. |

Trim outer whitespace. Amounts use plain base-10 digits with an optional period and one or two fractional digits; reject commas, currency signs, exponent notation, interior spaces, and more than two decimals. Counts use digits only. Do not silently coerce empty, malformed, negative where forbidden, nonfinite, or out-of-range values to zero. Parse money into integer cents and keep derived calculations unrounded until display. Validate the same contract at the pure engine boundary, including unknown currency values and non-string or nonnumeric inputs.

**Consistency.** Contraction plus churned MRR cannot exceed starting MRR. If starting MRR is zero, expansion, contraction, and churned MRR must all be zero. When account counts are supplied, churned accounts cannot exceed starting accounts. Starting MRR is zero exactly when starting paying accounts are zero; new MRR is zero exactly when new paying accounts are zero; churned MRR is zero exactly when churned accounts are zero. The derived ending MRR is zero exactly when derived ending paying accounts are zero. These checks prevent a paying-account average with revenue but no paying account. Do not require new MRR per new account to equal the ending ARPA.

**Results.** Compute from the submitted snapshot only. `S` is starting MRR; `N`, `E`, `C`, and `L` are new, expansion, contraction, and churned MRR; `A0`, `AN`, and `AL` are starting, new, and churned account counts. Percentage formulas use fractions internally (80% means 0.80).

| Result | Formula and meaning |
| --- | --- |
| Ending MRR; ending ARR | `M = S + N + E - C - L`; `12 × M`. ARR is an annualized end-of-month run rate, not earned revenue or a forecast. |
| Net new MRR; MRR growth | `M - S`; `(M - S) / S`. Growth is undefined when `S = 0`. |
| Net revenue retention (NRR); gross revenue retention (GRR) | `(S + E - C - L) / S`; `(S - C - L) / S`. Both use only the starting customer base and are undefined when `S = 0`. GRR stays between 0% and 100%; NRR may exceed 100%. New MRR is excluded from both. |
| Ending paying accounts; customer churn | `A = A0 + AN - AL`; `AL / A0`. Customer churn is undefined when `A0 = 0`; do not substitute revenue churn. These require the account group. |
| Gross margin | `(recognized recurring revenue - recurring service COGS) / recognized recurring revenue`. Undefined when recognized recurring revenue is zero; a negative result is valid when COGS exceeds revenue. Requires the revenue/COGS pair. |
| Monthly ARPA | `M / A`, using end-of-month MRR and end-of-month paying accounts. Undefined when `A = 0`. Requires the account group. |
| CAC | Acquisition spend / `AN`. Undefined when `AN = 0`, including when spend is also zero. Requires spend and the account group. |
| Simple LTV estimate | `ARPA × gross-margin fraction / monthly customer-churn fraction`. Show only when all three inputs exist, ARPA and gross margin are positive, and customer churn is greater than zero. It assumes stable churn and margin, omits expansion/contraction, and mixes end-of-month ARPA with the month's starting-base churn; label it an estimate. |
| Margin-aware CAC payback | `CAC / (ARPA × gross-margin fraction)`, in months. Show only when CAC exists and monthly gross profit per account is positive. A valid zero CAC yields zero months. |
| Burn multiple | `net cash burn / (12 × net new MRR)`. Use the same month's burn and MRR change, with the MRR change annualized to net new ARR. Show a number only when net new MRR is positive and burn is zero or positive. For negative burn, say cash generating; for zero or negative net new MRR, say undefined. This monthly snapshot can be volatile. |

Round only formatted outputs: money to two decimal places in the chosen currency; percentages, months, and multiples to two decimal places. Preserve a nonzero value that would display as zero with a less-than sign such as `<0.01%` or `<0.01 months` (and the corresponding negative sign where applicable). Show the MRR movement and cash inputs with their signs. Never turn an undefined denominator into 0, infinity, or an implied healthy result. The result should give a short reason beside each unavailable metric, including which optional input group is missing. Formulas and the reporting-period basis must be accessible beside the relevant result, not hidden in the article alone.

**Action and states.** The one primary action calculates the snapshot. Initial state has no result. Valid submission shows the results available from completed groups and clear missing-group prompts for the others. Editing any field clears the prior result so it cannot be mistaken for the edited values; submit again to recalculate. A malformed or inconsistent supplied value blocks calculation, identifies the affected fields, and focuses the first error. A missing optional group is unknown, not zero. A partly entered optional group is invalid. If an unexpected calculation error occurs, clear results and offer a retry; no fallback figures. The calculation is synchronous and local, so there is no loading or network retry state. Reset clears fields and results and restores default USD.

Keep entered financial figures in component memory only. Do not put them in a URL, browser storage, cookie, server request, log, or analytics event. No account or API is needed. Render user values as text; do not accept HTML or user-supplied links. Existing sitewide analytics may still record the page visit without tool inputs.

### Known examples

These arithmetic checks are calculated from the stated figures, independently of code.

| Scenario and inputs | Expected result |
| --- | --- |
| April 2026, USD: `S=10,000`, `N=2,000`, `E=1,000`, `C=500`, `L=500`. Accounts `A0=100`, `AN=25`, `AL=5`. Recognized recurring revenue `11,000`, COGS `2,200`, acquisition spend `4,000`, net cash burn `12,000`. | Ending MRR `12,000`; ARR `144,000`; net new MRR `2,000`; MRR growth `20%`; NRR `100%`; GRR `90%`; ending accounts `120`; customer churn `5%`; margin `80%`; ARPA `100`; CAC `160`; simple LTV `1,600`; payback `2 months`; burn multiple `0.50×` because net new ARR is `24,000`. |
| May 2026, USD: `S=0`, `N=1,000`, `E=C=L=0`; no optional groups. | Ending MRR `1,000`, ARR `12,000`, net new MRR `1,000`. MRR growth, NRR, and GRR are undefined because starting MRR is zero. Other optional metrics are unavailable, not zero. |
| June 2026, USD: `S=1,000`, `N=0`, `E=0`, `C=100`, `L=100`; net burn `1,000`. | Ending MRR `800`, ARR `9,600`, net new MRR `-200`, MRR growth `-20%`, NRR and GRR `80%`. Burn multiple is undefined because net new MRR is negative. |
| April 2026, USD: the first scenario with net cash burn `-500`. | Core and other supplied metrics stay the same. Burn multiple says cash generating rather than displaying a negative multiple. |
| April 2026, USD: `S=100`, `N=0`, `E=0`, `C=80`, `L=30`. | Invalid because contraction plus churned MRR is `110`, more than starting MRR; show no snapshot. |
| A required value `1,000`, `1e3`, `1.234`, an empty required MRR field, or month `2026-13`; alternatively enter only one of the three account counts. | Field or group validation error; show no snapshot. |

### Ownership

- Public URL `/saas-metrics-calculator`. Put the server page and interactive component in `app/(site)/(tools)/(saas)/saas-metrics-calculator/`; the new SaaS route group may share its eventual catalog sidebar layout with later SaaS tools. The page uses the existing tool-page loader, shared shell, `PageCanvas`, header, and database Markdown renderer. No route-owned metadata.
- Pure parser, validation, and formulas: `lib/saas-metrics-calculator/engine.ts`. Focused arithmetic and invalid-input checks: `tests/pages/saas-metrics-calculator/saas-metrics-calculator.test.mjs`.
- Route component owns form and result state. Reuse shared controls and tokens; add a colocated CSS module only where layout needs it. No API route, external dataset, or scheduled job.
- Use the existing development tool-page and catalog update scripts. If a dedicated one-off script becomes necessary, place it under `scripts/saas-metrics-calculator/`.
- This spec owns the contract. `public.stack127_tool_pages` owns the visible title, intro, usage, supporting Markdown, version, and card fields; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog ranks. Temporary development preview copy must be marked as such. Do not duplicate live prose in the route.

### Catalog placement and card art

Primary and only planned membership: a new `/saas-tools` catalog. Its reader task is to find SaaS business calculators together, including this overview and the 40 focused tools. No existing DNS, domain, storage, or KDP catalog matches that task. The dedicated catalog does not exist in the current repository migration history, so creating its registry/content row, art, and reviewed page is a separate required catalog task for the main agent before catalog integration. Do not place this tool in an unrelated catalog as a substitute.

Catalog card `toolSpot` key: `saas-metrics-calculator`. Visual takeaway: a month's recurring-revenue movements resolve into one clear end-of-month figure. Focal subject: a recognizable stacked revenue column, with small segments that suggest the starting base and change. One supporting relationship: a simple arrow to the final column. Wordless, calm and analytical, with no dashboard labels, score colors, tiny numbers, or generic calculator icon. It must remain readable at card size in light and dark themes.

## Interface

### Flow and control mode

The reader asks, "What did this month of SaaS activity do to my recurring revenue, retention, and unit economics?" The lead answer is **ending MRR for the named month**. The sole primary action is `Calculate SaaS metrics`. Control mode is `disclosure`: the reporting month, currency, and five MRR inputs stay visible; a named disclosure adds optional customer, cost, and cash inputs. The required fields alone produce a useful revenue and revenue-retention snapshot. Optional inputs add results without changing the MRR answer.

Use the shared full-width workbench band. In reading order: reporting month and currency; starting MRR; four monthly MRR movements; optional-input disclosure; primary and reset actions; one divider; answer and supporting results. Keep all required fields and the primary action outside the disclosure. The disclosure label is `Add customer, cost, and cash metrics`. It starts closed. Once any optional value is entered, its collapsed summary must show the actual entered values with labels, such as `Accounts: 100 start, 25 new, 5 churned; recurring revenue $11,000; COGS $2,200; acquisition spend $4,000; net burn $12,000`. Omit empty values rather than presenting them as zero; mark an incomplete group as `incomplete`. Never hide an error inside a closed disclosure. On a submission with an optional-field error, open it and focus the first invalid field. Reset closes it.

### Controls and component decisions

Reuse `UiTextField` for the month, every amount, and every count. Their raw strings must reach the pure parser so malformed decimals, grouping commas, signs, and empty required fields can be rejected instead of normalized by a number widget. Use `inputMode="decimal"` for money, `inputMode="numeric"` for counts, and a text keyboard for `YYYY-MM`. Set autocomplete off, capitalization off, and spellcheck off. Keep a visible label, programmatic required state, and the shared field-level error for each required field. Optional groups become required together only after one member is entered; communicate this in the group label and errors, without marking untouched optional fields required.

| Area | Visible control and reason |
| --- | --- |
| Period and denomination | `Reporting month` text field with `YYYY-MM` example and brief same-month guidance; `Currency` as `UiSelect` with the six Product choices, USD selected and visible. Currency changes formatting only. |
| Required MRR | `Starting MRR`, `New MRR`, `Expansion MRR`, `Contraction MRR`, and `Churned MRR` text fields. Group the four changes under `During the month`. Say once, beside that heading, `Enter 0 for a movement that did not happen.` Show the selected currency code in the MRR group heading; show it again in optional monetary group headings or field labels. Do not repeat a currency helper sentence under every field. The labels distinguish lost subscription value from the count of lost accounts. |
| Optional accounts | `Starting paying accounts`, `New paying accounts`, and `Churned starting accounts` in one labeled group. A short group note says all three counts must describe the same paying-account unit. |
| Optional margin | `Recognized recurring revenue` and `Recurring service COGS` in one labeled pair. A short note distinguishes recognized revenue from cash collected; detailed COGS examples belong in the article. |
| Optional acquisition and cash | `Acquisition sales and marketing spend` and `Net cash burn` each have their own label. Spend depends on the account group. Explain the sign only by burn: `Negative means cash generated.` |
| Actions | `UiActionRow` with one primary `UiButton` labeled `Calculate SaaS metrics` and a secondary `Reset`. Keep calculate enabled with incomplete fields so submission can explain the exact problem. Enter submits; reset is `type="button"`. |

Use `UiDisclosure` for the optional area, but its current API has no controlled expansion or summary. Extend the shared component with optional controlled open state and a short summary slot so the route can reveal hidden validation errors and show active values when collapsed. Preserve its native disclosure button, keyboard activation, focus ring, and open/closed announcement; existing callers need no change. The route supplies the summary and handles value formatting. This is a reusable shared enhancement, not a new SaaS-only control. No new chart, slider, modal, upload, copy, or export control is needed.

### Result hierarchy

Start with a neutral `UiPrimaryResult` labeled `Ending MRR`, showing one formatted amount. Its detail identifies the reporting month and says that ARR below is an annualized run rate. Never color the entire result as healthy or unhealthy based on growth. Directly below, show one compact MRR movement table with starting MRR and the four signed changes; the lead result is its final value, so do not repeat ending MRR in the table. Beside the lead or immediately under that table, state the ending-MRR arithmetic once. This is a signed bridge, not a part-of-whole chart: `UiAllocationBar` and `UiBarChart` cannot truthfully show the negative movements.

Then present three distinct result regions, each with a heading and `UiDataTable` columns for metric, result, and calculation basis or unavailable reason:

1. `Revenue and retention`: ending ARR, net new MRR, MRR growth, NRR, GRR, ending paying accounts, and customer churn. ARR and net new appear only here. The basis cells show the period/denominator and explicitly say NRR and GRR exclude new MRR. Undefined growth or retention at a zero starting base stays in its own row with the reason. Account results request the account group when absent.
2. `Margin and acquisition`: gross margin, monthly ARPA, CAC, simple LTV estimate, and margin-aware CAC payback. Each basis cell uses the Product formula in short notation and names a missing group or zero denominator. Put the stable-churn/margin limitation immediately by the LTV row. A negative gross margin is a real value, while LTV and payback explain why they are unavailable.
3. `Cash efficiency`: burn multiple, with `net burn ÷ (12 × net new MRR)` and the Product reason for missing burn, zero or negative growth, or cash generation. Do not show a negative multiple as a score.

The tables give a home to every partial or undefined result without making equal-sized dashboard cards. Reuse `UiDataTable` and its mobile labeled-row behavior; do not duplicate the same formatted metric in `UiMetricGroup`, a stat strip, a second summary, or a chart. Values are numbers or explicit `Unavailable` text with a nearby reason. Keep the month and currency in the lead context, not as repeated columns. Source and accounting limitations follow the result in quiet supporting text; the article can explain assumptions at greater length. No rank, badge, benchmark, progress bar, or recommendation follows the output.

### States and recovery

- **Initial:** all money fields are empty, USD is selected, optional inputs are closed, and the result area says briefly that the required MRR figures produce the snapshot. There is no example result that could be mistaken for submitted data.
- **Valid full or partial:** focus the ending-MRR output after calculation. The same result structure appears in both cases. Missing optional groups and zero denominators produce `Unavailable` rows with reasons, never zero, infinity, or an empty cell. A month with no optional data is a valid revenue snapshot.
- **Invalid:** keep entered values, remove any old result, show each specific error directly below its field, and focus the first invalid control in reading order. Attach excess contraction-plus-churn to Churned MRR. Attach MRR/count zero mismatches to the corresponding account count; an ending-count mismatch attaches to Churned starting accounts. Show each cross-field error once at its narrowest useful scope. If the first error is optional, open the disclosure before moving focus. Do not add a second error list or an error result panel.
- **Edited after a result:** clear the entire prior snapshot immediately and announce `Inputs changed. Calculate again.` without moving focus. The table never pairs old numbers with new fields.
- **Unexpected failure:** clear the result, preserve input, and show one `UiStatus` error beside the action: `Metrics could not be calculated. Try again.` The same primary action retries. There is no request, loading indicator, network retry, or disabled calculating state for this synchronous engine.
- **Reset:** clear every field, error, result, and disclosure summary; restore USD, close the disclosure, announce `Calculator reset.`, and focus the reporting month. Reload starts with the same initial state. Do not serialize values into the URL or browser storage. Browser back/forward cache may retain a form and result together; the next edit clears the retained result.

For status changes, use the shared `UiStatus` or one polite live announcement, not several messages saying the same thing. Successful focus on the labeled output announces the answer; invalid focus reaches the field and its associated error. Result headings, table captions/labels, row headers, and formulas must be available to screen readers. Do not place financial values in analytics or the URL.

### Responsive and accessible behavior

At desktop width, use a measured inner form column with at most two fields per row: month and currency; MRR movements in paired rows; optional groups in paired rows where labels and controls stay readable. Starting MRR can occupy its own row. Keep groups separated by headings and spacing, not nested cards. The action follows all input groups, and the result follows one divider in the same workbench band.

At narrow widths, stack every field in the same reading and tab order, then the primary action before Reset, followed by the lead answer and result regions. Keep the disclosure trigger and summary in the normal flow. Use the shared `UiDataTable` labeled-row presentation; let long formulas wrap and retain an internal horizontal scroll fallback only if necessary. Values, signs, currency codes, error text, and row labels must stay visible without page-level horizontal overflow. Text inputs may scroll their contents while focused, but their labels and errors must not be clipped. Use `min-width: 0` on grid children.

Tab order follows the visible fields, optional disclosure trigger and fields when open, calculate, reset, then result links. The disclosure trigger works with Enter and Space and exposes its state. The currency select keeps the shared listbox/native semantics. No custom arrow-key shortcuts are needed. Use the shared `--focus-ring`, input and button sizing, `--radius`, and dark/light theme tokens. The build review should confirm the optional summary and error reveal, one clear lead MRR, unique supporting values with formulas, zero-denominator reasons, no stale result after editing, and no clipped table or action at desktop and mobile widths.

## Content

### Search intent and metadata direction

The main search task is a SaaS metrics calculator that turns one completed month's figures into a readable business snapshot. Readers may arrive through MRR, ARR, NRR, churn, CAC, payback, LTV, gross margin, or burn-multiple queries. They are likely preparing figures from billing and accounting reports and need to reconcile definitions before trusting the output. The page should meet the broad calculator intent while leaving deep metric-specific tasks to the planned focused tools.

Follow the writing skill's `Tool name: the question it answers or the outcome it helps with` title pattern. Keep `SaaS metrics calculator` at the start and make the second part about understanding one month's recurring revenue and retention; avoid a promise of a universal business-health grade. The SEO title can pair the calculator name with the most useful task terms, MRR and retention, without listing every output. The SEO description should state that the reader enters monthly MRR movements and optional customer/cost figures to calculate a snapshot, and should make clear that this is a manual estimate where appropriate. The title and description must not claim live account access, a forecast, peer benchmark, or certified accounting result.

### Page promise

After using the page, a founder should be able to say what changed in recurring revenue during one named month, how much of the starting customer base was retained, and which optional cost and customer figures support a meaningful unit-economics result. They should know why a missing or zero denominator produces `Unavailable` and which source figures to revisit before drawing a conclusion. The page helps interpret the snapshot; it does not pronounce the company healthy or predict what happens next.

### Content completeness map

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| Which amounts belong in starting, new, expansion, contraction, and churned MRR? | The form names each movement and the result shows the signed bridge to ending MRR. | In usage, define the month boundary, normalize annual subscriptions to monthly MRR, exclude one-time charges, and keep contraction separate from full churn. Explain the simplified starting-base treatment of expansion and losses. |
| Is ARR revenue already earned, and how is MRR growth different from NRR or GRR? | Result labels, formulas, and zero-start reasons are beside the numbers. | Explain ARR as an annualized month-end run rate. Contrast growth from all MRR changes with retention of the starting base; new MRR belongs in growth but not NRR/GRR. |
| Why is customer churn different from MRR churn? | Customer churn uses starting paying accounts; NRR and GRR use starting MRR. | Explain the different denominators and ask readers to use one consistent paying-account unit. Mention that same-month joins, exits, and reactivations need careful source classification; the tool is a simple monthly snapshot. |
| Which cost and acquisition figures should I enter? | Optional groups label recognized recurring revenue, service COGS, acquisition spend, and net cash burn. | In usage, distinguish recognized revenue from cash collected, give concrete SaaS COGS examples, and describe the matching-period/attribution limitation of CAC. Do not present net burn as derived from the other cost fields. |
| What do LTV and payback actually estimate? | The result shows ARPA, margin, CAC, LTV, payback formulas, and unavailable reasons. | Explain the stable-churn and margin assumption behind simple LTV, that payback uses monthly gross profit per account, and why same-month spend and customers may misalign across long sales cycles. |
| Why is burn multiple based on 12 times net new MRR? | Its row shows the annualized denominator and handles no growth or cash generation. | Give one short worked example of annualizing monthly MRR change before division. Say monthly results can swing and should be compared with the company's own history, without universal grade bands. |
| Why is a result unavailable, and what should I do next? | Each unavailable row states the missing group or zero denominator; malformed inputs get field errors. | Show how to return to the source report, enter complete optional groups, or leave unknown data blank. Do not tell readers to invent a churn rate or zero cost to force a number. |

### Recommended outline and formats

**Introduction before the tool:** Start with the reader's situation: they have a month of subscription movements and want one coherent view of revenue and retention. State the basic solution and include the simple formula, `ending MRR = starting MRR + new MRR + expansion MRR - contraction MRR - churned MRR`, with enough explanation of each movement to make it usable. Then say the optional account and cost figures extend the snapshot. Do not put the multi-step LTV or burn formulas, a score, or the full worked example in the introduction. This follows the writing skill's rule that the introduction should teach the basic calculation on its own, while detailed assumptions and examples follow usage.

**Usage after the tool:** A short numbered task sequence can cover preparing one calendar month's normalized MRR, adding complete optional account/cost groups only when their figures are known, and reading the lead MRR plus unavailable reasons. Explain the difference between entering `0` for no MRR movement and leaving an optional group blank because the figures are unknown. Include how to recover from a partly completed group or a loss larger than starting MRR. Do not narrate routine button presses or reproduce the live result table.

**Supporting content, in this order:**

1. A section on reading the revenue and retention snapshot. Explain ending MRR versus ARR, total MRR growth versus NRR/GRR, and customer churn. A compact Markdown comparison table can show each metric's population or denominator and the question it answers, rather than copying the UI formulas row by row.
2. A section on margin and acquisition economics. Explain recognized recurring revenue, COGS, ARPA, CAC, simple LTV, and margin-aware payback as a connected chain. Use one `> [!EXAMPLE]` block with the complete April 2026 figures in Product. Walk through the meaningful relationships, especially 80% margin, $100 ARPA, $160 CAC, $1,600 simple LTV, and 2-month payback, without restating every UI output. Keep the assumption and sales-cycle caveat beside the estimate it qualifies.
3. A section on burn multiple. Use one `> [!FORMULA]` block for `net cash burn ÷ net new ARR`; the example's $2,000 net new MRR becomes $24,000 net new ARR, so $12,000 burn gives 0.50×. Explain why zero or negative MRR growth and negative burn do not produce a numeric multiple in this tool. Do not compare this result to unsourced good/bad thresholds.
4. A short limits and next-step section. Say the calculator cannot audit billing classification, customer identity, cost allocation, or acquisition attribution. Suggest checking the source ledger and comparing like-for-like monthly snapshots. Link to a focused calculator only when that page is actually published and helps with the next specific question.

The UI already gives exact values and formulas, so no additional chart is needed for a single-month snapshot. The signed MRR bridge is in the live table; a part-of-whole bar would misstate the losses. A Markdown comparison table and the shared `[!EXAMPLE]` and `[!FORMULA]` blocks are the supported visuals for this page. The catalog `toolSpot` art is card art, not an article illustration.

### Concepts and result interpretation

Use one coherent April 2026 scenario from Product rather than unrelated examples. The writer may simplify the arithmetic shown in each paragraph, but should preserve these distinctions and sources:

| Concept | Accurate example and caveat | Source role |
| --- | --- | --- |
| MRR and ARR | $12,000 ending MRR implies $144,000 ARR at month end. ARR is a run rate, not $144,000 already earned or guaranteed next year. Annual-plan value is normalized to a month before entry. | [ChartMogul MRR](https://chartmogul.com/saas-metrics/mrr/) controls normalization and ARR language. |
| Revenue versus customer retention | The example's NRR is 100% after expansion offsets losses, GRR is 90% because it excludes expansion, and customer churn is 5% of 100 starting paying accounts. These are different bases and do not mean every customer stayed. Same-month account events can alter churn classification. | [ChartMogul retention](https://chartmogul.com/blog/net-and-gross-retention-rates/), [Stripe GRR](https://stripe.com/resources/more/gross-revenue-retention-what-it-is-how-to-calculate-it-and-what-it-can-tell-businesses), and [ChartMogul customer churn](https://chartmogul.com/saas-metrics/customer-churn/) control the distinctions. |
| Gross margin and ARPA | $11,000 recognized recurring revenue less $2,200 service COGS gives 80% margin; $12,000 ending MRR over 120 ending paying accounts gives $100 monthly ARPA. The revenue and MRR bases have different timing; COGS classification changes the margin. | [Stripe SaaS metrics](https://stripe.com/resources/more/essential-saas-metrics) controls the cost scope. Product defines the calculator's timing basis. |
| CAC, LTV, and payback | $4,000 allocated spend over 25 new paying accounts gives $160 CAC. With $100 ARPA, 80% margin, and 5% monthly customer churn, the simple LTV estimate is $1,600 and margin-aware payback is 2 months. LTV assumes stable churn/margin and omits expansion; same-month CAC can mismatch a longer acquisition cycle. Neither is a measured customer lifetime. | [Stripe CAC](https://stripe.com/resources/more/cac-in-saas), [Stripe payback](https://stripe.com/resources/more/what-is-the-cac-payback-period), and [ChartMogul LTV](https://chartmogul.com/saas-metrics/ltv/) control those caveats. |
| Burn multiple | $2,000 net new MRR annualizes to $24,000 net new ARR; $12,000 monthly net burn divided by that increase is 0.50×. This is one period's ratio and may be volatile; the tool does not rate it against peers. | [Craft Ventures burn multiple](https://www.craftventures.com/articles/the-burn-multiple) controls the denominator. |

A zero starting MRR makes MRR growth, NRR, and GRR undefined. Zero starting customers makes customer churn undefined. Zero churn does not prove infinite LTV; it means this simple finite estimate cannot be made. A blank optional group means unknown, while an entered zero is a real value and may still leave a ratio undefined. Explain these near the relevant concept rather than in a long generic warning.

### Usage, limits, and next step

Ground the usage guide in reconciling one completed month from a billing export and accounting report. Check that all subscription amounts use one currency and the same paying-account unit. Normalize annual plans, remove one-time revenue, and keep recurring revenue recognized during the month separate from ending MRR. Use paid-account counts only if the start, new, and churned groups can be completed on the same basis. If the form rejects values, check malformed money, incomplete groups, or contraction plus churn greater than starting MRR; correct the source classification rather than manipulating a figure to make the tool pass.

Read the lead ending MRR first, then retention, then optional economics. An unavailable result is a request for a real denominator or complete group, not a poor score. For a decision, compare the same definitions across the founder's prior months and investigate the underlying accounts and costs. The page should not recommend a price change, spending cut, funding decision, or target multiple from this snapshot alone.

Avoid claims of live billing/accounting access, cohort or channel analysis, future ARR, a universal healthy benchmark, a Rule of 40 score, or verified financial statements. Do not use `LTV` without `simple estimate` where the claim could suggest measured lifetime value. Do not label CAC payback as revenue-only or burn multiple as burn divided by unannualized net new MRR.

### Source roles and links

The primary sources and their factual roles are named in Research and the interpretation table above. The writer should put a few direct links where readers need to verify definitions: ChartMogul for MRR and retention, Stripe for COGS/CAC/payback, ChartMogul for LTV's limits, and Craft Ventures for burn multiple. Bessemer's Rule of 40 source supports the Product exclusion; link it only if the final page explains why that separate annual heuristic is omitted. Competitor pages are research context, not authorities for formulas or score thresholds.

The tool uses no live external data or maintained benchmark set. Do not invent a source-check date; if the writer adds a checked date, verify the linked definitions then. Recheck that URLs and source wording still support the final claims during writing. Internal links may point to `/saas-tools` after that catalog is published and to specific focused SaaS tools only after their routes are live. Do not send readers to unpublished placeholders.
