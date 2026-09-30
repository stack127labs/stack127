# Customer churn calculator

Route: `/customer-churn-calculator`

## Research

### User job

A solo SaaS founder or operator wants to calculate the share of customers lost during a reporting period. The answer needs a clearly defined starting customer base and time window, and must distinguish customer-count churn from revenue churn.

The existing [`/saas-metrics-calculator`](../saas-metrics-calculator/tool-spec.md) reports churned starting accounts divided by starting accounts as an optional metric in a broader one-month snapshot. It requires the full MRR group before customer counts can be used. The focused task is only partly covered there. The separate NRR calculator measures recurring revenue retained from a starting customer group, not the percentage of customers lost. No dedicated Customer Churn Calculator route or spec was present in this worktree.

### Competitor patterns

Direct pages were operated in a headless browser on September 30, 2026. Three examples covered the repeated patterns:

- [AlusLabs Churn Rate Calculator](https://aluslabs.com/tools/churn-rate-calculator) takes customers at the start, customers lost, and a monthly, quarterly, or annual period. It returns the period churn rate, monthly-equivalent rate, annualized churn, retention, and customer half-life; revenue churn is an optional section. With 100 starting customers and 5 lost, monthly churn was 5.00% and annualized churn was 45.96%. Selecting quarterly kept the entered period rate at 5.00% and showed 18.55% annualized churn. Its share guidance says values are saved in the query string. With a zero starting count and one lost, it showed 0.00% churn and 100.00% retention rather than an error.
- [Free SaaS Metrics Churn Calculator](https://www.freesaasmetrics.com/calculators/churn-calculator) separates customer-count inputs from starting MRR, churned MRR, and contracted MRR. It reports customer and net revenue churn with health labels, but has no period selector; nearby copy says these metrics are typically monthly. With 100 starting customers and 5 lost it showed 5.00%. With zero starting customers and one lost it showed 0.00% and `Healthy`, so its empty-denominator state can look like a valid result.
- [miniWebtool Churn Rate Calculator](https://miniwebtool.com/churn-rate-calculator/) takes a starting count, losses from that starting cohort, and a monthly, quarterly, or annual period. Optional new-customer and monthly ARPU inputs add net-churn and revenue context. It adds retention, lifetime, period conversions, a survival curve, and health bands. With 100 starting customers and 5 lost for a quarter, it showed 5.0000% quarterly churn and 18.5494% annualized churn. It blocks a zero starting count with a clear validation message and says the lost count must not exceed the starting count.

Across the operated examples, the common core is a starting-customer denominator and a count of customers lost during a named interval. Several competitors add revenue churn, period conversion, lifetime or survival projections, and benchmark labels. Those additions answer different questions and add assumptions. Zero-denominator handling and period assumptions are inconsistent. Published benchmark thresholds in the competitor flows do not establish a universal healthy churn rate.

### Technical facts and sources

- The basic formula is `customers lost during the period ÷ customers at the start of the period × 100`. [Stripe's churn calculation guide](https://stripe.com/en-sg/resources/more/how-to-calculate-churn-rates) gives this formula and says the measured interval can be a month, quarter, or year. Use counts measured on the same customer/account basis and for the same interval.
- The numerator convention varies. Stripe's basic formula counts customers lost in the period. [ChartMogul's customer churn definition](https://chartmogul.com/saas-metrics/customer-churn/) subtracts customers who joined and churned, and customers who churned and reactivated, during the same period. Its [Customer Churn Rate report documentation](https://help.chartmogul.com/article/203-chart-customer-churn-rate) defines churned subscribers as those still canceled at the end of the interval and lists join-and-churn and churn-and-reactivate counts as excluded from the metric. For 100 starting customers and 12 churn events, including one same-period join-and-churn and one churn-and-reactivate, ChartMogul's reported rate is `(12 − 1 − 1) ÷ 100 = 10%`; the unadjusted formula gives 12%. Treat this as a reporting-policy difference, not a single universally agreed adjustment.
- Customer churn is count-based (also called logo churn) and differs from revenue churn, which weights lost customers by their recurring revenue. ChartMogul says to count paying customers and exclude free trials and free-plan customers. Its [customer retention definition](https://chartmogul.com/saas-metrics/customer-retention/) describes customer churn as the inverse of customer retention over the same period.
- A zero starting-customer denominator makes the percentage undefined. If the lost count means customers from the opening base who remain lost under the selected convention, it cannot exceed that starting base. Make that interpretation explicit before applying the bound.
- Independent arithmetic checks for later product planning: 5 of 100 customers is 5%; zero lost from 100 is 0%; zero customers at the start has no defined rate; the ChartMogul example above is 10% under its adjusted convention.

### Opportunity and blockers

A focused calculator can answer the count-based churn question without requiring MRR, cost, or acquisition figures. Keep the measured period visible in the result and explain that customer churn does not show how much revenue those customers represented. Avoid a universal healthy/unhealthy label: ChartMogul notes that churn varies by company stage, category, and price point, and the inspected competitor thresholds were not supported by a common benchmark source.

The product plan should settle how to classify customers who join and churn or churn and reactivate within the same period. The simple lost/start convention and ChartMogul's adjusted report convention are both documented; the arithmetic alone cannot choose a business's reporting policy. Period conversion or lifetime projections would also need explicit steady-rate assumptions and are not required by the stated user job.

A manual calculation needs no paid API, maintained dataset, account, or background job. The calculator cannot verify customer identity, payment status, or the source system's churn classifications. No research blocker remains.

## Product

### Promise and scope

A solo SaaS founder or operator has paying-account counts for a completed reporting period and wants the share of the opening customer base that was lost. Enter the opening count and the count of those same accounts that are no longer paying at the end. The tool returns customer churn for that period and the retained opening-account count, with the counted population clear beside the answer. This focused task needs no MRR figures, unlike the broader `/saas-metrics-calculator`.

Count one paying customer per account, using the same stable account identity and billing-active definition at both boundaries. The opening base consists of accounts with at least one active, billable subscription at the start. A lost account is one of those opening accounts with no active, billable subscription at the end. Count each opening account at most once, even if it has several subscriptions or cancels more than once. An opening account that cancels and returns to paying status by the end is retained, not lost. An account that first joins after the start is outside both counts, even if it joins and churns during the period. Exclude free trials and free-plan accounts. These are boundaries for a period, not a lifetime signup cohort.

The launch calculation is manual and period neutral: the user supplies counts from any one reporting interval, such as a month, quarter, or year, and the result says `for the reporting period`. The tool does not infer dates, convert rates across periods, or assume that a rate persists. It cannot check account identities or classify billing events from aggregate counts. No event import, reactivation switch, revenue churn, cohort history, forecast, lifetime estimate, benchmark, health grade, saved scenario, or billing connection is in scope. The source report must provide the two counts under the stated policy; raw cancel events alone are not the lost-account count.

### Technical contract

**Inputs and parsing.** Start with both required count fields empty. `0` is an entered value; blank means unknown and cannot produce a result. Use the same opening and closing boundaries for both counts. There is no date, currency, or period selector because neither changes this ratio; label the result generically as the churn rate for the reporting period.

| Input | Accepted value and meaning |
| --- | --- |
| Opening paying accounts (`S`) | Whole count from `0` to `1,000,000,000` inclusive. Each account is counted once if paying at the opening boundary. |
| Lost opening accounts (`L`) | Whole count from `0` to `1,000,000,000` inclusive, and no greater than `S`. Count distinct accounts from `S` that are not paying at the closing boundary. |

Trim outer whitespace. Accept ASCII base-10 digits only, with leading zeros allowed. Reject empty strings, signs, decimals, grouping marks, exponent notation, interior spaces, non-string or nonfinite engine inputs, and values outside the bound. Do not coerce blanks or malformed values to zero. Validate the same rules in a pure engine and at the form boundary. The counts and percentage scaling fit within JavaScript safe integers at these bounds.

**Calculation and output.** Compute `retained opening accounts = S - L`. If `S > 0`, compute `customer churn = L / S × 100`. Lead with the churn percentage, then show `L` lost out of `S` opening paying accounts and the retained opening count, so the numerator can be checked. Do not call the retained opening count the company's total ending customer count: accounts acquired during the period are excluded. If `S = 0`, require `L = 0`, show the exact counts and `Churn unavailable` with the reason `No paying accounts at the start`; never display `0%` or `100%` as the churn rate for that case. `L > S` is invalid, including when `S = 0`.

Format whole counts with grouping for readability. Compute the percentage from exact integer counts and round once to two decimal places, half up. Exact zero is `0.00%`, and complete loss is `100.00%`. A positive rate smaller than `0.01%` displays `<0.01%`, not `0.00%`. Do not annualize, monthly-normalize, or attach an unentered calendar date to the answer.

**Action and states.** One primary action calculates customer churn. A valid nonzero opening base shows the percentage and count breakdown; a valid `S=0, L=0` shows the explicit unavailable rate and exact counts. Initial and reset states have no result. Editing either count clears the prior result until recalculation. An empty, malformed, out-of-range, or inconsistent input blocks the calculation, preserves what was entered, identifies the affected field, and focuses the first error. No partial percentage is shown from one known count. An unexpected local calculation failure clears the result, preserves inputs, and allows the person to try the same action again. Calculation is synchronous and local, so there is no loading, network retry, or no-match state.

Keep entered counts in component memory only. Do not put them in a URL, browser storage, cookies, requests, logs, or analytics events. Existing site analytics may count a page visit without the entered counts. Render values as text; accept no HTML or user-supplied links.

### Known examples

These independent checks use the end-of-period opening-base policy above.

| Scenario | Expected result |
| --- | --- |
| `S=100`, `L=5`. | `5.00%` churn; 5 lost of 100 opening paying accounts; 95 opening accounts retained. |
| `S=3`, `L=1`. | `33.33%` churn after one rounding step; 2 opening accounts retained. |
| `S=100`, `L=0`; separately `S=100`, `L=100`. | `0.00%` with 100 retained; `100.00%` with 0 retained, respectively. |
| Of 100 opening paying accounts, 10 are not paying at close. One other opening account canceled and returned; two accounts joined after opening and later churned. Enter `S=100`, `L=10`. | `10.00%` churn and 90 retained. The three other event histories do not add to `L`; do not ask for raw events. |
| `S=1,000,000`, `L=1`. | Exact rate `0.0001%`; show `<0.01%`, with 999,999 retained. |
| `S=0`, `L=0`. | Rate unavailable because there is no opening base; counts remain 0. |
| `S=0`, `L=1`; `S=10`, `L=11`; a blank, `-1`, `2.5`, `1e3`, or `1,000` in either count. | Field validation error and no calculated result. |

### Ownership

- Public URL `/customer-churn-calculator`. Put the server page and client workbench in `app/(site)/(tools)/(saas)/customer-churn-calculator/`, using the SaaS route-group layout, shared shell, `PageCanvas`, tool-page loader, and database Markdown renderer. Add no route-owned publication or SEO metadata.
- Put parsing, bounds, and calculation in `lib/customer-churn-calculator/engine.ts`; put focused independent arithmetic and invalid-input checks under `tests/pages/customer-churn-calculator/`. The route component owns raw form values, errors, focus, result state, and rendering. Use shared controls and tokens, adding a colocated CSS module only for layout. No API route, external dataset, or background job is needed.
- This spec owns the contract. `public.stack127_tool_pages` owns the visible title, introduction, instructions, supporting Markdown, version, and card copy; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog rank. Mark any development preview copy as temporary. If a dedicated page update script is needed, put it under `scripts/customer-churn-calculator/`.

### Catalog placement and card art

Primary and only catalog: `/saas-tools`. A founder comparing SaaS calculators can choose this focused customer-count check beside the broader metrics and revenue tools. The catalog already exists in development. Reserve display order 8, after `/net-revenue-retention-calculator` at order 7; confirm the complete ordered membership list during integration. No secondary catalog serves this task.

Catalog `toolSpot` art key: `customer-churn-calculator`. Visual takeaway: a small part of the opening paying-account group is absent at the end of the period. Focal subject: a compact group of account marks with one departing mark. One supporting relationship: a short outward path from the group to that mark. Keep it wordless, calm, and legible at card size in both themes. Avoid numbers, percentage signs, money symbols, a generic calculator icon, health colors, and marks implying new customers entered the opening group.

## Interface

### Flow and control mode

The reader asks, "What share of the paying accounts I had at the start were gone by the end of this reporting period?" The lead answer is customer churn for that period, or `Unavailable` when the opening count is zero. `Calculate customer churn` is the only primary action. Control mode is `single`: both required counts are visible, with no policy switch, advanced panel, date, or period selector. The user chooses the reporting interval in their source report; the interface never implies that the answer is monthly.

The workbench reads in one pass: opening paying accounts; lost accounts from that opening base; Calculate and quiet Reset; one divider; lead percentage or unavailable state; count breakdown. Keep the two labels and the lost-field helper visible without making readers study the article first. The helper beside lost accounts says, in substance, `Of the opening accounts, count those still not paying at the end. Exclude accounts that joined later.` An opening-field note may say `At the start of one reporting period.` The supporting content can explain repeated cancellations and returns in more detail.

### Controls and component decisions

| Area | Shared component and behavior |
| --- | --- |
| Two counts | Reuse required `UiTextField` controls labeled `Opening paying accounts` and `Lost opening accounts`. Keep raw strings for strict whole-count parsing, use `inputMode="numeric"`, and show errors directly under their field. The second field carries the brief opening-base helper. |
| Actions | Reuse `UiActionRow` and `UiButton`: primary `Calculate customer churn`, secondary `Reset`. Enter submits the form; Reset is a button, not a form submit. Keep Calculate enabled when fields are empty so it can reveal the missing values. |
| Lead answer and counts | Reuse neutral `UiPrimaryResult` for the rate or `Unavailable`, followed by one `UiKeyValueList` with the three exact counts. Reuse `UiStatus` only for an edited-result notice, reset notice, or unexpected local failure. |

Use persistent labels, visible required marks, programmatic required state, field-associated errors, `autoComplete="off"`, capitalization off, and spellcheck off. `UiNumberField` would normalize or step a malformed pasted value before the strict parser can explain it, so text fields are the better fit. The reused controls supply keyboard semantics, focus ring, 2px `--radius`, and shared text, surface, border, and accent tokens. The fixed form arrangement and result composition are route-specific; no new shared component is needed. The `/components-ui` gallery and SaaS sibling tools provide the field, action, result, and status patterns. There is no useful chart, progress bar, benchmark band, or count-based health color for this one ratio.

### Result hierarchy

Start with one `UiPrimaryResult` labeled `Customer churn`. Its value is the formatted percentage, including the literal less-than sign for a tiny nonzero rate, or `Unavailable` for an empty opening base. Its detail says `For the reporting period` and, only when unavailable, `No paying accounts at the start`. That unavailable state is a valid calculation outcome, not an input error. Keep the result tone neutral at `0.00%`, `100.00%`, and every value between.

Follow with one `UiKeyValueList`, in this order: `Opening paying accounts` (`S`), `Lost from opening accounts` (`L`), and `Opening accounts still paying at end` (`S - L`). These are the exact denominator, numerator, and retained opening-base count, formatted as whole numbers. The last label must not say `Ending customers` or `Total retained customers`: new accounts are outside the calculation. The list is the only count breakdown; do not repeat those formatted values in a second summary, cards, table, or chart. A short formula can live in the supporting explanation after the workbench rather than competing with the answer.

### States and recovery

- **Initial and empty:** both fields are blank; there is no sample rate or result. Submitting blanks shows required errors beside the fields, with focus on `Opening paying accounts`. An entered `0` remains distinct from blank.
- **Valid:** show the lead and all three counts together, then focus the labeled lead output so assistive technology announces the answer once. `S=100, L=0` yields `0.00%`; `S=100, L=100` yields `100.00%`. `S=1,000,000, L=1` shows `<0.01%` while the exact counts remain visible. For `S=0, L=0`, show `Unavailable`, the zero-base reason, and three zero counts; do not suggest that zero churn is a known rate.
- **Invalid or incomplete:** clear any old result, preserve entered strings, put each empty, malformed, or out-of-range message under its field, and focus the first invalid field in visual order. If `L>S`, put one consistency error under `Lost opening accounts` and focus it. Do not create an error result panel, duplicate summary, or a partial percentage from one field.
- **Edited after result:** clear the lead and count list immediately. Keep the edited value and focus; announce `Inputs changed. Calculate again.` once through `UiStatus`. Clear stale validation messages when editing and validate again on submission.
- **Unexpected failure and retry:** clear the result, keep both inputs, and show one `UiStatus` error near the action, such as `Customer churn could not be calculated. Try again.` The same primary action retries. Synchronous local calculation needs no loading indicator, disabled-button state, network error, or no-match panel.
- **Reset and restoration:** clear counts, errors, and result; replace any prior status with one reset notice, return focus to `Opening paying accounts`, and announce reset once. The clean `/customer-churn-calculator` URL stays unchanged through hydration, submission, and reset. Reload starts blank; browser back/forward cache may restore a result with its matching inputs, and the next edit clears that result. Never serialize counts to the URL or browser storage.

Associate inline errors with their fields so focusing the first error reads the explanation. Keep success announcement in the focused lead output rather than duplicating it in a live status. The unavailable reason is part of the labeled lead, with no warning or danger styling.

### Responsive and accessible behavior

Use the shared full-width workbench band and a measured inner form width. At desktop width, the two count fields may sit in one authored two-column row because they form one ratio; reserve independent label, control, helper, and error space so a new message does not misalign the controls. Actions follow below both fields. After the divider, place the lead before the count list. Do not wrap the form or each result in nested cards.

At narrow width, stack opening count, lost count and helper, Calculate, Reset, lead, and count list in that order. Keep the primary action full width and all targets comfortable. Use `min-width: 0` on grid children and allow the 13-character `1,000,000,000` result to wrap at a safe boundary if needed, without clipping or page-level horizontal scroll. Input text may scroll inside the focused field. The less-than sign in `<0.01%`, `Unavailable`, field errors, and the full retained-count label must stay visible in both themes.

Tab order follows the visible fields and actions. Enter submits from either field; Reset responds to Enter or Space. Use the shared focus ring, normal text contrast, and a semantic form with the result output as the focus target. `UiKeyValueList` remains a labeled description list on mobile, so it needs no table scroll or interactive row behavior. The builder should check a normal result, zero opening base, missing versus entered zero, `L>S`, malformed pasted input, the maximum count, tiny nonzero display, keyboard focus, and desktop/mobile containment in both themes.

## Content

Follow `stack127_docs/writing-style.md`. This plans the writing; live copy belongs in the tool-page row. The development page still has placeholder introduction and article text. In the operated tool, `100` opening and `5` lost showed `5.00%` churn and `95` opening accounts still paying.

### Search intent and metadata direction

The reader searching for a customer churn or logo churn calculator has two counts from a completed reporting period. They need to know which accounts belong in the lost count; a cancel-event total or all-company ending count may answer a different question.

Apply the writing skill's title pattern: begin with `Customer churn calculator`, then name the share of opening paying accounts lost. Put the short `lost opening accounts ÷ opening paying accounts × 100` formula in the introduction, with the end-of-period meaning of lost. It is simple enough to be useful before the tool. Explain event classification and the worked example after the workbench. Keep title, introduction, and SEO text period neutral; the tool has no date input or monthly conversion. The search description should promise the two-count rate and retained opening count, while allowing for an unavailable rate when the opening count is zero. The `/saas-tools` card should identify this as the focused count-based check beside the broader SaaS Metrics and revenue-based NRR tools. The writing stage supplies final title, metadata, interface-word suggestions, and card copy.

### Page promise

The reader can calculate the fraction of opening paying accounts no longer paying at the end of their chosen period, check the counts behind it, and distinguish that result from lost recurring revenue. They understand why join-and-churn and cancel-and-return histories do not increase this tool's lost count.

### Content completeness map

| Reader question | Tool already shows | Writer should explain |
| --- | --- | --- |
| Which customers and interval count? | Two fields; result says `For the reporting period`. | Use one completed interval and the same paying-account identity at both boundaries. Free/trial accounts are outside the opening base; the calculator does not store dates. |
| Which accounts were lost? | Lost-field helper excludes later joiners. | Count distinct opening accounts still not paying at close. An opening account that returns is retained; raw cancel events may differ. |
| What does the result mean? | Churn rate plus opening, lost, and still-paying opening counts. | Retained opening accounts equal opening minus lost, not total company customers at close. New accounts are outside this calculation. |
| Why is the rate unavailable or tiny? | `Unavailable` with a zero-base reason; `<0.01%` with exact counts. | Zero opening accounts has no denominator; a positive opening base with zero lost gives real `0.00%`. Any displayed `<0.01%` is positive, without implying one exact hidden rate. |
| Does this measure revenue or health? | No revenue field or grade. | Customer churn counts accounts equally. It does not reveal MRR lost or a universal good/bad threshold. |

### Recommended outline and formats

**Introduction before the tool:** Start with the completed-period question, name the opening paying base, give the one-step formula, and lead into the two counts. Keep detailed event rules below the tool.

**Usage after the tool:** In a brief numbered sequence, guide the reader to choose one interval in their source report, count paying accounts at its start, check which of those same accounts are no longer paying at close, and read the rate with its exact count breakdown. Add a recovery sentence for a blank, fractional, or greater-than-opening lost count. Do not narrate button clicks.

**Supporting content after usage:**

1. `Which accounts count as lost?` Explain the fixed opening-base, end-state policy. A short three-case list can cover an opening account still lost, an opening account that returned, and a later joiner who churned. Count one account once, including when it held several subscriptions.
2. `Calculate and read the rate` Use one `> [!EXAMPLE]` block with 100 opening, 5 still lost, 5% churn, and 95 opening accounts still paying. The 95 is not a total ending customer count. Avoid repeating the introduction's formula in another callout.
3. `When the result is unavailable or very small` Explain `0` opening and `0` lost versus a positive opening base with `0` lost. Use the exact count rows to explain `<0.01%`; one lost of 1,000,000 opening accounts is an optional example.
4. `Customer churn versus revenue churn` Explain what equal account weighting cannot reveal about recurring revenue, then suggest comparing later periods with the same interval length and counting policy. Avoid a health grade or forecast.

The workbench already has the rate and exact counts. No extra result table, chart, marker figure, FAQ, or benchmark strip is needed. `ContentMarkdown` supports the `[!EXAMPLE]` block and ordinary lists; the `toolSpot` is catalog card art only.

### Concepts and result interpretation

- **Opening group and loss policy:** A cancel-and-return account from the opening base remains in the denominator but not the lost count; a join-and-churn account is in neither. This is the tool's fixed convention, supported by [ChartMogul's churn report](https://help.chartmogul.com/article/203-chart-customer-churn-rate), not a claim that every provider reports identically.
- **Undefined versus zero:** `S=0, L=0` has no rate, while `S=100, L=0` gives `0.00%`. `S=1,000,000, L=1` is exactly `0.0001%` and displays `<0.01%`; do not generalize that exact value to every less-than display. These are Product and implemented display rules.
- **Count versus revenue:** Five lost of 100 means 5% customer churn regardless of the five accounts' subscription amounts. The lost revenue is unknown. [ChartMogul's customer churn definition](https://chartmogul.com/saas-metrics/customer-churn/) supports the count-based distinction.

### Usage, limits, and next step

Ground the guide in one billing report. If the report supplies cancel events rather than distinct opening accounts still lost at close, the reader must classify them before entering a count; the calculator cannot verify identities or reactivations from aggregates. Do not promise a monthly rate by default, an annualized conversion, billing import, date-labeled record, revenue churn, or benchmark. Compare periods only with a consistent interval and paying-account policy. `/net-revenue-retention-calculator` answers a related revenue-retention question; `/saas-metrics-calculator` gives a broader monthly snapshot requiring MRR. The direct revenue-churn follow-up may link to `/revenue-churn-calculator` only after its integrated development route resolves and the target environment publishes it. Apply the same publication check to those tools and `/saas-tools`.

### Source roles and links

Use [Stripe's churn calculation guide](https://stripe.com/en-sg/resources/more/how-to-calculate-churn-rates) for the lost-over-opening formula and flexible period, [ChartMogul's customer churn definition](https://chartmogul.com/saas-metrics/customer-churn/) for paying-account and count-versus-revenue distinctions, and [ChartMogul's report documentation](https://help.chartmogul.com/article/203-chart-customer-churn-rate) for the still-lost closing rule and event exclusions. Keep citations near claims. Recheck provider wording during writing; do not invent a source-check date. Competitor calculators are research context, not benchmark evidence.
