# Revenue Churn Calculator

Route: `/revenue-churn-calculator`

## Research

### User job

A subscription business operator wants to measure how much of its recurring-revenue base was lost to cancellations and downgrades during a period. The Notion brief describes the task as calculating the percentage of recurring revenue lost during a period. That points most directly to **gross revenue churn**: losses are measured before gains from expansion can hide them.

This is distinct from customer churn, which counts accounts, and from net revenue retention (NRR), which measures the opening customer base after both losses and gains. The existing `/net-revenue-retention-calculator` spec is a focused opening-cohort NRR calculation; `/mrr-waterfall-calculator` reconciles the full-company MRR bridge, including new business. A revenue-churn page adds a useful answer only if it makes the loss-only view clear and keeps attribution tied to the opening base. A net churn result alone would be the mathematical complement of NRR under matching definitions, so it would largely repeat that tool.

No separate Revenue Churn Calculator spec or route source was found in the worktree.

### Competitor patterns

- [Free SaaS Metrics Churn Calculator](https://www.freesaasmetrics.com/calculators/churn-calculator) combines customer churn with an optional revenue section. Its revenue inputs are starting MRR, churned MRR, and contracted MRR; it labels `(churned + contracted) ÷ starting MRR` as **Net Revenue Churn**, although that formula excludes expansion and is gross churn by the ChartMogul definition. I operated it with 100 starting customers, 5 lost, $10,000 starting MRR, $400 churned MRR, and $100 contraction; it returned 5% for both customer and its revenue-churn label. Setting starting MRR to zero while leaving losses entered changed the displayed revenue rate to 0.00%, which hides the undefined denominator.
- [SyntaxPath Churn Rate Calculator](https://www.syntaxpath.com/tools/churn-rate-calculator) combines customer churn, optional MRR churn, GRR, and NRR, with month/quarter/year controls and formula explanations. It separates churned, contraction, and expansion MRR. With $10,000 starting MRR, $400 churn, $100 contraction, and $700 expansion, I observed 5% gross MRR churn, -2% net MRR churn, 95% GRR, and 102% NRR. Setting starting MRR to zero showed dashes for the revenue ratios. It has no reactivation input in the reviewed calculator.
- The repeated pattern is a combined customer-and-revenue churn workflow, often expanded into GRR/NRR, period conversion, benchmarks, or projections. Clear labels matter: one operated calculator mislabeled gross loss as net churn, and starting MRR of zero needs an unavailable result rather than a fabricated 0%.

### Technical facts and sources

- ChartMogul defines gross MRR churn as `(churn MRR + contraction MRR) ÷ MRR at the start of the period`. It describes this as the percentage of recurring revenue lost to cancellation and contraction, without credit for gains from existing customers. Its net MRR churn formula subtracts expansion and reactivation from those losses before dividing by starting MRR. Gross churn is nonnegative; net churn can be negative when existing-customer gains exceed losses. See [ChartMogul's revenue churn definitions and formulas](https://chartmogul.com/saas-metrics/revenue-churn/).
- Stripe also separates gross from net revenue churn. Its explanation says gross churn includes cancellations and downgrades and uses the previous month's ending MRR as the base; its net example subtracts expansion. Stripe presents the combined cancellations/downgrades loss as “Churned MRR,” while ChartMogul names churn and contraction separately. The reviewed Stripe net formula does not mention reactivation, while ChartMogul includes it. These are reporting conventions to state explicitly, not one universal taxonomy. See [Stripe's revenue churn explanation](https://stripe.com/resources/more/revenue-churn-101-how-to-calculate-it-and-why-it-matters).
- Use a period-opening recurring-revenue denominator and losses from the same defined base. In an opening-cohort measure, do not add MRR from customers acquired after the period starts to the loss numerator. Otherwise numerator and denominator describe different customer groups. ChartMogul's gross formula names churn and contraction from existing customers; its [MRR movement guide](https://help.chartmogul.com/article/163-understanding-mrr-movements) separately defines new business, expansion, contraction, churn, and reactivation and documents provider-specific classification and timing. A manual calculator cannot verify that aggregate source totals follow the chosen cohort boundary.
- Keep the recurring-revenue basis and period consistent. For an MRR calculation, use monthly-normalized recurring amounts from one reporting policy; the result is a recurring run-rate metric, not cash received or accounting revenue. Stripe states that MRR is monthly-normalized and is not GAAP revenue in its [MRR and ARR help article](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29?locale=en-GB). Revenue-churn rates are commonly monthly, though Stripe says they can use other periods; a longer period still needs matching opening and movement inputs.
- The zero-base ratio is undefined. If starting recurring MRR is zero, no percentage should be shown even when losses are also zero. An entered known zero is different from missing data. The competitor test above shows why this state needs explicit handling.
- Under ChartMogul's movement convention, an independent check with $10,000 starting MRR, $400 churn, and $100 contraction gives 5% gross churn. Adding $700 expansion leaves gross churn at 5%, while net churn becomes -2% and NRR becomes 102%. The net-churn/NRR complement holds only when period, opening base, and movement conventions match: `net churn % = 100% - NRR %`.
- Subscription sources can classify timing and events differently. ChartMogul, for example, treats a discount as contraction, distinguishes cancellation of a last subscription from cancellation of one among several subscriptions, and lets churn-recognition settings affect when loss is recorded. Follow the chosen source report and do not imply the calculator can reclassify or validate its events.

### Opportunity and blockers

The opportunity is a manual, source-backed gross-loss calculation that answers “what share of the opening recurring-revenue base was lost before expansion?” Keep the loss measure separate from customer counts and from NRR. If a net churn companion is considered later, name its treatment of expansion and reactivation and explain that it mirrors NRR for the same inputs. The formula should not be presented as a universal benchmark or health score; ChartMogul says there is no single good churn benchmark across company stages and segments.

No paid API, maintained dataset, account, or background job is needed. The calculator cannot inspect billing records, confirm that losses came from opening customers, standardize provider-specific event timing, or convert currencies. The Notion rationale does not specify MRR versus ARR or a reporting period; the product stage should settle that input scope while preserving a consistent basis.

## Product

### Promise and scope

A solo SaaS founder or operator wants to know what share of the recurring revenue present at the start of a month was gone by its end because starting customers canceled or paid less. The tool calculates gross revenue churn for those opening MRR dollars, with canceled and reduced amounts shown separately. It does not subtract gains made by other customers. This loss view gives a different answer from the existing NRR tool's net retention bridge.

Launch is a manual calculation for one completed calendar month and one currency. The base is monthly-normalized MRR from customers with an active, billable subscription immediately before the month's first day. Compare the same customers immediately after its last day, using one billing source's consistent active-subscription, discount, timezone, and effective-date policy. Exclude one-time charges and tax. A customer first acquired during the month is outside both the opening base and the loss inputs. The answer describes recurring run rate, not cash collected or accounting revenue.

This tool measures **opening MRR dollars missing at month end**, once per opening customer. For each opening customer with MRR `s` and closing MRR `e` in the same currency and monthly basis:

- If the customer has no active, billable subscription at close, attribute `s` to canceled opening MRR.
- If the customer still has an active, billable subscription at close and `0 <= e < s`, attribute `s - e` to reduced opening MRR. This includes a zero-MRR closing subscription when the source still classifies it as billable, such as one with a 100% discount.
- If the customer is active at close and `e >= s`, attribute no loss. Gains above `s` do not offset another customer's loss.

Sum those customer-level amounts into the two inputs. A cancellation followed by reactivation is classified by the closing state: if the customer is active again, count only any remaining reduction from their opening MRR. A customer with several subscriptions is still one opening customer; canceling one subscription while another remains is a reduction if their closing MRR is lower. Repeated downgrades, cancellation attempts, and restorations cannot count the same opening dollar twice. Expansion that later disappears is not a loss of opening MRR unless closing MRR falls below that customer's own opening level. This is a deliberate snapshot attribution policy. A provider's sum of all churn and contraction **events** may differ and can exceed 100% of opening MRR after expansion or repeated loss events. Do not paste those raw event totals as these inputs; the calculator cannot reconstruct customer-level attribution from them.

Do not add net revenue churn, NRR, gross revenue retention, customer-count churn, total-company ending MRR, benchmarks, health grades, forecasts, annualization, plan normalization, imports, stored scenarios, or a billing connection. The source must supply or allow the operator to derive the opening-customer amounts under the stated policy. The calculator cannot verify that provenance from two aggregate loss figures.

### Technical contract

**Inputs, units, and parsing.** Start with an empty month and three empty required money fields; default currency is USD. A known zero must be entered as `0`. Blank means unknown and blocks calculation. Currency formats the result only and does not convert values.

| Input | Accepted value and meaning |
| --- | --- |
| Reporting month | Strict `YYYY-MM`, January 2000 through December 2100 inclusive. It names the calendar month; the calculator does no timezone arithmetic and cannot verify that the source report is final. |
| Currency | USD, EUR, GBP, INR, CAD, or AUD; all entered amounts must already use this one currency. |
| Opening MRR (`S`) | Required `0` to `1,000,000,000,000.00` inclusive, summed from customers active at the opening boundary. |
| Canceled opening MRR (`L`) | Required `0` to `1,000,000,000,000.00` inclusive. Sum each opening customer's own opening MRR only if that customer has no active, billable subscription at close. |
| Reduced opening MRR (`C`) | Required `0` to `1,000,000,000,000.00` inclusive. Sum `opening MRR - closing MRR` only for opening customers still active under the source's billable policy at close with lower MRR, including closing MRR of zero. |

Trim outer whitespace. Accept base-10 ASCII digits with an optional decimal point and one or two following digits; leading zeros are allowed. Reject empty strings, signs, grouping commas, currency symbols, exponents, interior spaces, more than two fractional digits, non-string or nonfinite engine values, unsupported currencies, and out-of-range amounts. Keep raw strings in the form and apply the same checks in a pure calculation engine. Parse money to integer cents before arithmetic; the accepted totals fit within JavaScript safe integers.

**Calculation and bounds.** Compute `lost opening MRR = L + C` and `opening MRR still present = S - L - C` in integer cents. When `S > 0`, `gross revenue churn = (L + C) / S × 100`. Require `L + C <= S`; this bound follows from counting each opening dollar at most once under this tool's attribution rule. Reject a larger total with a loss-group error rather than clamping it or displaying a rate over 100%. The bound is necessary but cannot prove the figures came from opening customers or that repeated events were deduplicated. If `S = 0`, require `L = C = 0`; show the exact zero amounts and `Churn unavailable` because the denominator is zero. A positive loss with zero opening MRR is invalid.

Lead with the churn percentage and the named month. Show exact `L`, `C`, their sum, `S`, and opening MRR still present so the numerator and denominator can be checked. The last amount is **not** total closing MRR or NRR: it omits any gain above a customer's opening MRR and all new-customer MRR. Format money with the selected currency, en-US digit grouping, and two decimal places; do not abbreviate large values. Compute the percentage from exact cents and round once, half up, to two decimals using integer or BigInt scaling that cannot overflow at the stated bound. Exact zero is `0.00%`; a positive result below `0.01%` is `<0.01%`; complete loss is `100.00%`. Never show a fabricated `0%`, infinity, or a percentage when `S = 0`.

**Action and states.** `Calculate revenue churn` is the sole primary action. A valid submission produces the percentage or the explicit zero-base unavailable result and the exact amount breakdown. An empty, malformed, out-of-range, or inconsistent input clears any previous result, preserves entered strings, puts a precise error by the affected field or loss group, and focuses the first affected field in reading order. Changing any input or currency clears the old result until recalculation; changing currency does not alter the numeric entries. Reset clears month, amounts, errors, and result and restores USD. An unexpected local calculation failure clears the result, retains inputs, and leaves the action available to retry. Calculation is synchronous and local; loading, no-match, network, and partial-result states do not apply.

Keep entered figures and month in client component memory only. Do not put them in URLs, storage, cookies, requests, logs, or analytics events. Existing site analytics may count the page visit without these values. Render submitted values as text, never HTML; no user-supplied links are accepted.

### Known examples

These checks use opening-customer amounts after the attribution above, not raw movement totals.

| Inputs or source scenario | Expected result |
| --- | --- |
| April 2026, USD: `S=10000`, `L=400`, `C=100`. | Lost opening MRR is `$500.00`; opening MRR still present is `$9,500.00`; gross revenue churn is `5.00%`. A separate `$700` expansion does not change this answer. |
| May 2026, USD: two opening customers each have `$100` MRR. One closes at `$150`, the other at `$50`; enter `S=200`, `L=0`, `C=50`. | Gross churn is `25.00%`; opening MRR still present is `$150.00`. The first customer's `$50` gain does not erase the second customer's loss, even though total closing MRR is `$200`. |
| June 2026, USD: one customer opens at `$100`, expands to `$200`, then closes at `$50`; enter `S=100`, `L=0`, `C=50`. | Gross churn is `50.00%`. The `$150` downgrade event is not `$150` of lost opening MRR. If that customer instead closes with no active subscription, enter `L=100`, `C=0` and get `100.00%`. |
| July 2026, USD: one customer opens at `$100`, drops to `$80`, returns to `$100`, then closes at `$80`; enter `S=100`, `L=0`, `C=20`. | Gross churn is `20.00%`, not the `40.00%` obtained by summing both downgrade events. If they close back at `$100`, enter both losses as `0` and get `0.00%`. |
| One customer opens at `$100` and retains an active, billable subscription discounted to `$0` at close; enter `S=100`, `L=0`, `C=100`. | Gross churn is `100.00%` as reduction. If no billable subscription remains at close, enter `L=100`, `C=0` instead; the rate stays `100.00%`. |
| August 2026, USD: `S=3`, `L=1`, `C=0`; separately `S=1000000`, `L=0.01`, `C=0`. | The first rate rounds from exact cents to `33.33%`; the second positive rate is `0.000001%` and displays `<0.01%`. |
| September 2026, USD: `S=L=C=0`. | Show exact zero amounts and `Churn unavailable` because there was no opening MRR; show no percentage. |
| `S=100`, `L=60`, `C=50`; `S=0`, `L=1`; or a blank required amount, `-1`, `1e3`, `$100`, `1,000`, `0.001`, or month `2026-13`. | Validation error and no result. Explicit `0` is valid. |

### Ownership

- Public URL `/revenue-churn-calculator`. Put the server page and client workbench in `app/(site)/(tools)/(saas)/revenue-churn-calculator/`, using the shared SaaS route-group layout, shell, `PageCanvas`, tool-page loader, and database Markdown renderer. Add no route-owned publication or SEO metadata.
- Put strict parsing, validation, integer-cent calculation, and percentage formatting data in `lib/revenue-churn-calculator/engine.ts`; focused independent arithmetic, attribution-boundary, and invalid-input checks belong under `tests/pages/revenue-churn-calculator/`. The route component owns raw values, errors, focus, status, and result rendering. Use shared controls and tokens, with a colocated CSS module only for layout. No API route, maintained dataset, account, or background job is needed.
- This spec owns the contract. `public.stack127_tool_pages` owns title, introduction, instructions, supporting Markdown, version, and card copy; `public.stack127_pages` owns publication and SEO; `public.stack127_tool_catalog_memberships` owns catalog placement. Mark development preview copy as temporary. A dedicated update script, if needed, belongs under `scripts/revenue-churn-calculator/`.

### Catalog placement and card art

Primary and only catalog: `/saas-tools`. Readers comparing SaaS metrics can choose this focused opening-revenue loss check after the customer-count churn tool. The development catalog already exists. Reserve display order 9, after `/customer-churn-calculator` at order 8; confirm the full ordered membership list during integration. No secondary catalog serves this task.

Catalog `toolSpot` art key: `revenue-churn-calculator`. Visual takeaway: a small part of an opening recurring-revenue block has gone by month end. Focal subject: one solid opening bar with a clearly separated missing slice. One supporting relationship: a simple link to the smaller retained opening portion. Keep it wordless, calm, and legible at card size in both themes. Avoid a generic calculator, currency signs, percentages, benchmark colors, or an image that suggests gains or new customers replenish the lost slice.

## Interface

### Flow and control mode

The reader asks, "What share of the MRR I started this month with was missing at month end?" The lead answer is gross revenue churn for the opening MRR dollars, or `Unavailable` when opening MRR is zero. `Calculate revenue churn` is the one primary action. Control mode is `single`: reporting month, currency, opening MRR, canceled opening MRR, and reduced opening MRR are all visible. There is no event mode, gain input, hidden assumption, or advanced panel.

Use the shared full-width workbench band with a measured inner width. Read in this order: month and currency; opening MRR; the two opening-dollar loss fields; Calculate and quiet Reset; one divider; lead rate; one exact MRR breakdown. The article can explain how to derive customer-level snapshots in detail. In the workbench, keep the minimum guidance that prevents a wrong numerator: opening MRR comes from customers active at the start; canceled loss is their opening MRR if inactive at close; reduced loss is their shortfall if still billable at close. Beside the paired loss fields say `Count each opening dollar once at month end. Don't use raw event totals. Enter 0 when none.` This warns against event sums without turning the form into a billing guide.

### Controls and component decisions

| Area | Component and behavior |
| --- | --- |
| Period and currency | Reuse required `UiTextField` labeled `Reporting month`, with `YYYY-MM` as example, and `UiSelect` labeled `Currency` with USD, EUR, GBP, INR, CAD, and AUD. USD is visibly selected. The currency code stays visible near the amount group and in the lead result; it formats but never converts. |
| Opening base | Reuse required `UiTextField` labeled `Opening MRR`, retaining the exact entered string for strict parsing. Its brief note says it is from customers active when the month began. |
| Losses | Reuse two required `UiTextField` controls labeled `Canceled opening MRR` and `Reduced opening MRR`. The first covers opening customers with no billable subscription at close. The second covers still-billable opening customers whose closing MRR is lower, including a zero-MRR billable subscription under the source policy. One short group note warns against raw event totals and repeated opening dollars. |
| Actions | Reuse `UiActionRow` and `UiButton` for primary `Calculate revenue churn` and secondary `Reset`. Keep Calculate enabled on an empty form so submit reveals required-field errors. Enter submits; Reset never submits. |
| Result | Reuse neutral `UiPrimaryResult` for the rate or unavailable state, then one `UiKeyValueList` for exact amounts. Reuse `UiStatus` only for an edited-result notice, reset notice, or unexpected local failure. The fixed form and breakdown composition are route-specific; no new shared component is needed. |

Use persistent labels, visible and programmatic required state, and field-associated errors. Money fields use `inputMode="decimal"`, month uses text input, and all text fields turn off autocomplete, capitalization, and spellcheck. `UiNumberField` is unsuitable because numeric coercion or steppers can alter malformed pasted money before the strict parser explains it. The existing `/components-ui` gallery and SaaS sibling tool use the shared field, selection, action, status, and result patterns. Use their focus ring, `--radius`, surface, border, text, and accent tokens in both themes. No chart, progress bar, upload, copy, export, or extra card helps this one ratio.

### Result hierarchy

Start with one `UiPrimaryResult` labeled `Gross revenue churn`, showing `0.00%` to `100.00%`, `<0.01%` for a tiny positive rate, or `Unavailable`. Its detail names the reporting month and selected currency and says the rate uses opening MRR. When the opening base is zero, use the reason `Opening MRR is zero`; this is a valid unavailable ratio, not an input error. Keep every rate neutral: no health grade or danger color.

Follow with one `UiKeyValueList` headed `Opening MRR breakdown`, in this order: `Opening MRR` (`S`), `Canceled opening MRR` (`L`), `Reduced opening MRR` (`C`), `Total lost opening MRR` (`L + C`), and `Opening MRR still present` (`S - L - C`). Show exact amounts with the selected currency and two decimals. These five rows expose the denominator, two distinct loss sources, numerator, and remaining opening dollars. The last row must not be labeled ending MRR; a short note directly beneath it says `This excludes gains and MRR from new customers. It is not total ending MRR.` Do not repeat amounts in metric cards, an allocation bar, or another table. A percentage formula belongs in supporting content rather than beside the lead value.

### States and recovery

- **Initial and empty:** month and all three money fields are blank; USD is selected. No sample rate or breakdown appears. Submitting blanks shows required errors, and blank never becomes zero.
- **Valid:** display the lead and complete breakdown together, then focus the labeled lead output so it is announced once. Explicit zero losses with a positive opening base produce `0.00%`; complete loss produces `100.00%`; a positive rate below `0.01%` keeps its `<` sign while exact cents remain visible below. `S=L=C=0` produces `Unavailable`, a zero-base reason, and exact zero amounts.
- **Invalid or incomplete:** clear any old result, retain every entered string, show each empty, malformed, or out-of-range error under its field, and focus the first invalid control in visual order. If `L + C > S`, attach one loss-group error below `Reduced opening MRR` and focus that field; if `S=0` and a loss is positive, focus the first positive loss field. The error says these inputs must be opening dollars counted once, not that raw source events are impossible. No partial percentage or separate error result panel appears. The engine still rejects an unsupported currency even though the normal selector cannot produce one.
- **Edited after result:** clear the lead and breakdown immediately, preserve the edit and focus, clear stale errors, and announce `Inputs changed. Calculate again.` once. A currency edit clears the old result without converting amounts.
- **Unexpected failure and retry:** preserve all inputs, clear the result, and show one `UiStatus` error by the action: `Revenue churn could not be calculated. Try again.` The same primary action retries. Synchronous local calculation has no loading indicator, network failure, no-match, or partial-result state. Do not disable the submit button merely because fields are blank.
- **Reset and restoration:** clear month, amounts, errors, notice, and result; restore USD, focus Reporting month, and announce the reset once. A clean `/revenue-churn-calculator` URL stays unchanged through server render, hydration, calculation, and reset. Reload starts empty; browser back/forward cache may restore inputs and their matching result together, and the next edit clears that result. Never serialize entered figures or month in a URL or browser storage.

Associate each inline error with its field so focus reads it. Success is announced by moving focus to the result rather than by a duplicate live message. The zero-base `Unavailable` result stays neutral and retains the exact zero breakdown.

### Responsive and accessible behavior

At desktop width, pair month and currency, keep opening MRR prominent on its own row, and put the two loss fields in one authored row with space for their labels, notes, and errors. Actions follow all required fields. Below the divider, show the lead before the amount list without nested result cards. The workbench spans the main column; its inner form and amounts stay comfortably measured.

At mobile width, stack month, currency, opening MRR, canceled opening MRR, reduced opening MRR, Calculate, Reset, lead, and breakdown in that order. Give the primary action full width and keep touch targets comfortable. `UiKeyValueList` remains labeled rows, with no table scroll or interactive cells. Use `min-width: 0` on grid children; allow maximum formatted values such as `$1,000,000,000,000.00`, long labels, errors, and the `<0.01%` value to wrap without clipping or page-level horizontal scrolling. Input contents may scroll inside their own fields while focused.

Tab order follows the visible controls and actions. Enter submits from a field, the currency select keeps shared keyboard and mobile-native behavior, and Reset responds to Enter or Space. Preserve a clear focus ring and readable neutral text in dark and light themes. The builder should review desktop and mobile with the normal decimal example, explicit versus missing zero, positive tiny rate, zero opening base, zero-MRR still-billable case, losses above the opening base, malformed pasted money, the maximum amount, long labels, focus movement, and both themes.

## Content

Follow `stack127_docs/writing-style.md` for the final words, visual choices, and SEO text. The current development page has placeholder copy. The live workbench already labels its three amounts, states the raw-event warning, and shows the exact breakdown; write around that interface rather than repeating it.

### Search intent and metadata direction

Readers searching for a revenue churn calculator, gross revenue churn calculator, or MRR churn formula likely have a monthly billing report and want a loss percentage. The visible title should follow the writing skill's `Tool name: question or outcome` pattern, naming revenue churn and the share of opening MRR lost. The SEO title should identify the calculator and gross MRR loss; the description should promise a month-specific percentage from canceled and reduced **opening** MRR. Do not suggest that the tool accepts all movement-event totals, calculates net churn, connects to billing data, or grades performance. Keep the short catalog card words about this one task.

### Page promise and introduction

After using the page, a founder should be able to measure the portion of one month's opening MRR missing at month end, see why canceled and reduced opening dollars make up the loss, and know when their source report needs preparation before entry.

The introduction should start with the situation: a monthly MRR report shows cancellations and downgrades, but the reader needs a percentage tied to the revenue they had when the month began. Define gross revenue churn here as this tool's **month-end snapshot of opening MRR dollars**, then give the simple formula once: `(canceled opening MRR + reduced opening MRR) ÷ opening MRR × 100`. Explain in the same short passage that the two loss amounts come from the same opening customers and are counted once, and that gains on other customers are not subtracted. Connect this to the calculator's month, currency, and three MRR amounts. This formula is simple enough for the introduction; reserve the numerical worked example and source-policy details for after the tool. Avoid calling this particular attribution policy every provider's definition of gross churn.

### Content completeness map

| Reader question | Already answered by the tool | What the writer should add |
| --- | --- | --- |
| What do I enter? | Month, currency, opening MRR, canceled opening MRR, reduced opening MRR, and concise field notes. | Explain how to compare monthly-normalized MRR for the same opening customers at the start and end of one completed calendar month. Use the source's consistent active, discount, effective-date, and timezone policy. |
| Which losses count? | The loss-field notes distinguish inactive from still-billable customers; the group warns against raw event totals. | Explain the per-customer month-end rule, including cancellation followed by return, a remaining subscription after another is canceled, and a zero-MRR subscription still considered billable. Show why an expansion later lost or a repeated downgrade event may not be a loss of opening dollars. |
| What does the percentage mean? | The lead rate and exact canceled, reduced, total-lost, opening, and still-present values appear together. | Use one worked example to interpret the percentage. Make clear that `Opening MRR still present` excludes gains and new customers and is not total ending MRR. |
| Why is the result unavailable or rejected? | Blank and malformed values get field errors; an all-zero opening base says `Unavailable`; losses above the base are rejected. | Distinguish unknown blank from known `0`; suggest checking the report's customer set and event aggregation instead of editing amounts merely to pass validation. No percentage exists with a zero opening base. |
| Is the rate good, and how does it differ from other churn measures? | The tool uses a neutral result and has no health score. | Avoid universal good/bad thresholds. Briefly distinguish customer-count churn and NRR; direct readers to the relevant tools when those are the next question. |

### Recommended outline and formats

1. **Introduction before the tool:** reader situation, this calculator's opening-dollar scope, the one-line formula, and the tool connection described above. Keep it useful without requiring the reader to scroll to the article to understand the denominator.
2. **How to use the revenue churn calculator:** after the tool, a short numbered guide for a completed month: gather opening-customer MRR at both boundaries in one currency and monthly basis; derive canceled versus reduced opening dollars from each customer's closing billable state; enter `0` where no loss occurred; read the rate and breakdown. Do not narrate ordinary clicks or restate every label. Include one recovery sentence for a rejected total.
3. **How this tool counts lost opening MRR:** explain this product's snapshot attribution, once per opening customer. An inactive opening customer contributes their opening MRR to cancellation; a still-billable one contributes only a shortfall, including a zero-MRR billable close. A return by month end follows its final state. A compact two-case list is enough. Then explain that raw event-based churn or contraction totals can exceed the opening base after expansion or repeated losses, so they cannot be pasted here. This is a difference in reporting method, not evidence the provider is wrong.
4. **Reading the result:** use one `> [!EXAMPLE]` block with the independent April figures: `$10,000` opening MRR, `$400` canceled, `$100` reduced, `$500` total lost, `5%` gross churn, and `$9,500` of opening MRR still present. A `$700` gain for another opening customer does not reduce this loss percentage, and neither gain nor any new-customer MRR is part of the still-present figure. Do not call `$9,500` company ending MRR. Add one short comparison if needed: one customer opening at `$100`, expanding to `$200`, and closing at `$50` loses `$50` of opening MRR, although their downgrade event is `$150`.
5. **Using the number with a source report:** one concise paragraph on monthly-normalized recurring run rate versus cash or recognized revenue, the source's timing and discount classification, and the fact that the calculator cannot inspect or deduplicate records. Compare periods only when the source, currency, customer boundary, and policy stay consistent; avoid benchmarks or health labels. Close with task-specific related links.

Ordinary Markdown headings, a short numbered guide, and one `[!EXAMPLE]` block through `ContentMarkdown` are enough. The live result already gives every exact amount, so do not add a static chart, duplicate amount table, second formula callout, or article marker art. The wordless `toolSpot` belongs to the `/saas-tools` card only. Add a FAQ only if the finished draft exposes an unanswered practical question.

### Concepts, limits, and result interpretation

Use "gross" for losses before gains from **other** opening customers can offset them. This tool still compares each customer's opening and closing MRR, so a same-customer gain that remains at month end means no opening dollars are missing for that customer. The `0%` and `100%` boundaries apply to this deduplicated opening-dollar measure; they do not impose a ceiling on a provider's sum of movement events. The manual calculator cannot prove that aggregate inputs satisfy its customer-level rule.

`Opening MRR still present` is the opening amount less lost opening dollars. It can differ from the opening customers' actual closing MRR when some have expanded, and it excludes all customers acquired during the month. NRR measures the opening customer group after its gains as well as losses; customer churn counts accounts rather than MRR. The result is a monthly run-rate comparison, not money collected during the month. The examples should describe the final billable state, not merely a cancellation request date, and should avoid claiming that every billing provider recognizes churn or discounts in the same way.

### Usage, limits, and next step

Ground the guide in a founder preparing a completed month's export. If the export gives only cumulative event movements, advise calculating opening and closing MRR by opening customer first or using an already deduplicated snapshot report. Explain an invalid `L + C > S` as a mismatch with this chosen input policy; don't imply such movement totals cannot occur in real billing data. For a zero opening base, read the exact zero breakdown but do not interpret `Unavailable` as either zero churn or a performance grade. Do not add annualized churn, forecasting, or a universal target.

When published in the target environment, link `/customer-churn-calculator` for lost account share, `/net-revenue-retention-calculator` for the same opening customer group's net result after gains, and `/mrr-waterfall-calculator` for a full-company bridge that includes new business. `/saas-tools` is the collection link. Link only to pages published in that environment; none of those tools validates this page's source totals.

### Source roles and links

- [ChartMogul's revenue churn guide](https://chartmogul.com/saas-metrics/revenue-churn/) supports the broad gross-versus-net distinction and the cancellation-plus-contraction over starting MRR formula. It does **not** establish this tool's exact month-end, per-customer deduplication policy; identify that policy as stack127's choice.
- [Stripe's revenue churn explanation](https://stripe.com/resources/more/revenue-churn-101-how-to-calculate-it-and-why-it-matters) supports the opening recurring-revenue base and cancellation/downgrade distinction. Its category grouping differs from ChartMogul's, so do not assert universal labels.
- [ChartMogul's MRR movement guide](https://help.chartmogul.com/article/163-understanding-mrr-movements) supports why new business, expansion, contraction, churn, and reactivation are distinct movements, and why provider classification and event timing can differ. Use it near the source-report caveat, not as proof that every provider's raw event totals match this input policy.
- [Stripe's MRR and ARR guidance](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29?locale=en-GB) supports monthly normalization and the distinction between MRR run rate and accounting revenue. Place the link where that input basis is explained.

Competitor pages in Research show calculator patterns but are not definition sources for public copy. Keep source links beside the claims they support, without a source dump, invented source-check dates, or a claim that this particular snapshot rule is an industry standard.
