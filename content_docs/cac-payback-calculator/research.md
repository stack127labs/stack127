# Research: CAC payback calculator

Route: `/cac-payback-calculator`
Checked: 2026-10-04
Competitors used: 5

## Scope

A SaaS founder wants to estimate how many months of a new customer's gross profit it takes to recover the cost of acquiring that customer. The result must use gross profit after service costs. A revenue-only ratio can be shown as a comparison, but it is not CAC payback.

The route is flat and has no existing page or spec. The existing [SaaS metrics calculator spec](../saas-metrics-calculator/tool-spec.md) and [engine](../../lib/saas-metrics-calculator/engine.ts) already calculate basic margin-adjusted payback. This page should add depth through acquisition and pricing scenarios and, if the build can support it, a retention-aware cohort recovery view. It should not repeat the broad monthly metrics snapshot. The existing `/saas-tools` catalog is the natural listing page.

Queries tried included `SaaS CAC payback calculator`, `CAC payback period calculator gross margin`, `CAC payback calculator churn`, and `CAC payback period formula SaaS`. The calculator pages and definitions that appeared across searches included tidycalc.com, onsumo.com, sondola.com, valuefy.app, calcority.com, chartmogul.com, and stripe.com.

The T3 preview was initially closed. I opened a fresh preview tab and used it to operate five calculators. FoundStep returned an HTTP 521 page and was excluded. Google's search page returned a CAPTCHA. Bing results did not show a People also ask panel, and a later CAC query did not complete after the preview transport failed. Exact PAA wording is unknown. No local browser fallback was used because the T3 preview had been available for the competitor work.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| `CAC payback calculator` | A quick estimate of months to earn back acquisition cost. | CAC divided by monthly gross profit per new customer, with the assumptions shown. | Some results use monthly revenue alone or present the result as actual cash collection. |
| `SaaS CAC payback formula` | A formula and worked example they can check. | Monthly ARPA multiplied by gross margin gives monthly gross profit; divide CAC by that amount. | The meaning and cost scope of gross margin vary across pages. |
| `CAC payback with churn` or `CAC payback cohort` | To know whether customers stay long enough to repay CAC. | A simple payback estimate plus an optional cumulative gross-profit curve based on cohort retention. | Some pages convert churn to average lifetime or adjust one month's profit with a shortcut. Neither shows when cumulative cohort gross profit crosses CAC. |
| `good CAC payback SaaS` or `CAC payback vs LTV:CAC` | A way to interpret the months and compare the metric with lifetime value. | Explain that segment, billing, sales cycle, retention, and capital limits affect decisions. | Competitors use different benchmark bands and health grades. None is universal. |

Google PAA could not be checked. Questions repeated in competitor FAQs and related searches were: What is CAC payback? How do I calculate it with gross margin? Does churn change the payback period? Does annual billing change payback? What costs belong in CAC? How is payback different from LTV:CAC? Current results explain the simple formula. They do not consistently distinguish accumulated gross profit from cash received or model a real retention curve.

## User problems

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| A founder has customer retention for each month and is unsure whether the basic CAC formula can answer how long advertising takes to pay back. | [SaaS founder asks about monthly renewal rates and CAC payback](https://www.reddit.com/r/SaaS/comments/oo90g9) | Keep the basic formula, then offer a separate cohort mode that sums expected gross profit from the customers still active each month. State the retention timing assumption. |
| A micro-SaaS founder estimates that AI service calls consume half of subscription revenue and compares pricing against a $300 CAC. | [Pricing and payback question for a consumer SaaS with AI costs](https://www.reddit.com/r/microsaas/comments/1nnx1e7) | Make ARPA and gross margin visible in every scenario. Show how changing price or service margin changes gross-profit payback. |
| SaaS operators disagree about which sales and marketing costs belong in CAC, and one discussion treats an upfront annual payment as one-day payback. | [Discussion about CAC payback and sales and marketing costs](https://www.reddit.com/r/SaaS/comments/l8cwlq) | Define the CAC cost pool and distinguish gross-profit payback from cash collection. The monthly formula does not account for annual prepayment timing. |

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| CAC is sales and marketing cost divided by newly acquired paying customers. The time period and customer group need to match. Sales cycles and brand costs can make period averages misleading. | [Stripe CAC in SaaS](https://stripe.com/en-mx/resources/more/cac-in-saas) | Let a reader enter CAC directly or derive it from an explicitly matched cost total and new paying customer count. Label whether CAC is fully loaded or channel-specific. Do not include service-delivery COGS in that numerator if gross margin already subtracts it. |
| Gross margin = (revenue − cost of goods sold) ÷ revenue. SaaS COGS commonly includes hosting, support, payment processing, and direct third-party delivery costs. Sales and marketing are operating costs, not service COGS. | [Stripe SaaS gross margin](https://stripe.com/resources/more/saas-gross-margin-explained-what-it-is-and-why-it-is-important) | Use gross margin after the cost to serve the customer. The entered percentage must match the product or segment used for ARPA. |
| Basic CAC payback months = CAC ÷ (monthly ARPA × gross margin). The result estimates how long gross margin from the account takes to equal CAC. | [ChartMogul CAC payback formula](https://chartmogul.com/saas-metrics/cac-payback/) and [Stripe CAC payback formula](https://stripe.com/resources/more/what-is-the-cac-payback-period) | Show monthly gross profit per account, the division, and the resulting months. If ARPA or gross margin is zero, show that payback does not occur under these assumptions. A revenue-only calculation is a separate comparison, never the lead result. |
| The simple formula assumes steady monthly revenue and margin. It does not model customer survival, changing price, expansion, or payment dates. A customer can churn before simple payback. | [ChartMogul CAC payback limitations](https://chartmogul.com/saas-metrics/cac-payback/) | Label the base result as a straight-line estimate. If retention data is entered, calculate cumulative expected gross profit as `sum(active share of the original cohort in month t × ARPA in month t × gross margin in month t)`. The first month that sum reaches CAC is the modelled cohort recovery month. This extension is derived from the entered survival curve, not a universal CAC formula. |
| MRR normalizes recurring subscriptions by their billing interval and excludes one-time items. It is not a bank balance. For services satisfied over time, IFRS 15 recognizes revenue as the performance obligation is satisfied. | [ChartMogul MRR definition](https://chartmogul.com/saas-metrics/mrr/), [ChartMogul MRR report rules](https://help.chartmogul.com/article/154-chart-monthly-recurring-revenue-mrr), and [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/) | Use monthly ARPA for a gross-profit estimate. Say that annual prepayment can change cash collection timing while the monthly margin is earned over the service term. Do not call the simple result cash collected or cash payback. |

## Competitor reviews

Each page was opened in the T3 preview tab. Inputs below describe observed page behavior, not a claim that every site stores data locally. Privacy claims were not independently audited.

### 1. TidyCalc

URL: [tidycalc.com/cac-payback-period-calculator](https://tidycalc.com/cac-payback-period-calculator/)

- [Observed] The page asks for CAC, monthly revenue per customer, gross margin, and optional monthly churn. It shows payback and monthly gross profit first.
- [Observed] Clicking Calculate with CAC $300, revenue $50, and margin 80% showed $40 monthly gross profit and 7.5 months. Setting margin to 0% showed 0 months and $0 gross profit. Setting CAC to -1 cleared the numeric result and displayed "Enter your measurements to see results," without a field-specific error.
- [Documented] The page says its churn estimate assumes constant monthly churn and computes average lifetime as 1 ÷ churn. It also says the calculator assumes monthly billing and does not model expansion or discounting.
- [Inferred] The long guide explains the margin formula well, but its zero-margin result can falsely suggest immediate recovery.
- [Unknown] The client-side privacy statement was not inspected because the page makes no such claim in the form.

```text
$300 CAC + $50 monthly revenue + 80% margin -> $40 monthly gross profit -> 7.5 months
```

### 2. OnSumo

URL: [onsumo.com/tools/saas/cac-payback-calculator](https://onsumo.com/tools/saas/cac-payback-calculator)

- [Observed] The page asks for CAC, monthly ARPU, gross margin, and monthly churn. Its prefilled $1,200 CAC, $99 ARPU, 70% margin, and 2% churn show 17.3 months simple payback and 17.7 months churn-adjusted payback. It also shows four one-variable scenarios and five CAC levels.
- [Observed] At 0% margin it shows `n/a` with an explanation. Entering CAC -1 was clamped to $1 and showed 0.0 months, with no invalid-input message.
- [Documented] Its page defines churn-adjusted payback as CAC divided by monthly gross contribution multiplied by (1 − monthly churn). That adjusts one month's contribution; it is not a cumulative retention curve. The page claims inputs stay in the browser, which was not independently verified.
- [Inferred] The scenario levers are useful, but the churn-adjusted label can be mistaken for cohort survival math.
- [Unknown] The exact benchmark data behind its health bands was not verified.

```text
$1,200 CAC + $99 ARPU + 70% margin + 2% churn -> 17.3 months simple, 17.7 months adjusted
```

### 3. Sondola

URL: [sondola.com/tools/cac-payback-calculator](https://www.sondola.com/tools/cac-payback-calculator)

- [Observed] The page asks for CAC, monthly revenue per customer, gross margin, and optional churn. Entering $300, $50, 80%, and 0% churn showed 7.5 months.
- [Observed] At 0% margin it said "Never pays back" and explained that the customer contributes no gross profit. Entering CAC -1 with positive ARPA and margin also showed "Never pays back," without identifying the negative CAC as an invalid input.
- [Documented] It states CAC ÷ (monthly revenue per customer × gross margin), and its FAQ says to use margin because serving costs come out of revenue. It promotes automatic data connections in its paid product, but the calculator itself did not require an account.
- [Inferred] The zero-margin state is clear. Negative CAC is conflated with zero contribution, so the error reason is hidden.
- [Unknown] The external account and billing connections were not used or assessed.

```text
$300 CAC + $50 monthly revenue + 80% margin -> 7.5 months
```

### 4. Valuefy

URL: [valuefy.app/tools/cac-payback-calculator](https://valuefy.app/tools/cac-payback-calculator/)

- [Observed] The page has sample buttons, direct CAC inputs, an alternate unit-economics mode, optional churn or lifespan, stage benchmarks, LTV:CAC, and scenario suggestions. Its SMB sample showed $500 CAC, $99 ARPU, 80% margin, $79 monthly gross profit, and 6.3 months. Entering $300, $50, and 80% showed $40 gross profit and 7.5 months.
- [Observed] A 0% margin attempt left the previous 7.5-month result visible, so the edge result could not be confirmed in the preview. Entering CAC -1 cleared the result and returned the prompt to enter CAC and ARPU, without a specific field error.
- [Documented] It displays benchmark bands and stage labels and names Bessemer, Benchmarkit, and SaaS Capital as sources. Its direct formula is CAC ÷ (monthly ARPU × gross margin).
- [Inferred] Sample buttons and scenarios reduce setup time, but the result hierarchy encourages a grade before the user checks the assumptions.
- [Unknown] The benchmark values were not checked against the underlying reports.

```text
$500 CAC + $99 ARPU + 80% margin -> $79 monthly gross profit -> 6.3 months
```

### 5. Calcority

URL: [calcority.com/cac-payback-period-calculator](https://calcority.com/cac-payback-period-calculator)

- [Observed] The page has CAC, monthly ARPA, and gross margin inputs. Its prefilled $1,800 CAC, $180 ARPA, and 75% margin show $135 gross profit per account per month and 13.3 months.
- [Observed] A 0% margin attempt did not produce a reliable visible result after the page rerendered. Entering CAC -1 showed $0 gross profit and 0.0 months rather than an input error.
- [Documented] The page states `CAC ÷ (monthly ARPA × gross margin)` and gives separate self-serve and enterprise examples. It also discusses channel-level CAC and warns that blended averages can hide differences.
- [Inferred] The channel discussion is relevant to founders comparing acquisition motions. The negative CAC state can mislead because it returns a numeric zero-month result.
- [Unknown] The 12 to 18 month benchmark in its article was not independently checked against a primary dataset.

```text
$1,800 CAC + $180 ARPA + 75% margin -> $135 monthly gross profit -> 13.3 months
```

## Comparison

| Feature or answer | TidyCalc | OnSumo | Sondola | Valuefy | Calcority | What stack127 should do |
| --- | --- | --- | --- | --- | --- | --- |
| Main inputs | CAC, ARPA, margin, optional churn | Same, plus region | CAC, ARPA, margin, churn | CAC or unit economics, ARPA, margin, optional churn/lifespan | CAC, ARPA, margin | Use one clear monthly unit and define each input. |
| Lead result | Gross-profit payback | Simple and adjusted months | Payback and LTV:CAC | Payback plus grade and LTV | Payback and gross profit | Lead with gross-profit payback and show its arithmetic. |
| Churn handling | Converts churn to average lifetime | Reduces one month's contribution by churn | Optional LTV input | LTV/lifespan option | Long article warns about churn, no calculator curve | If retention is supplied, sum expected retained gross profit by month. Do not call a shortcut cohort payback. |
| Scenarios | Static examples in article | CAC, ARPA, margin, churn levers | None in calculator | Preset segments and lever suggestions | Worked price and channel examples | Compare user-entered CAC, ARPA, and margin cases without grades. |
| Zero margin or invalid input | Zero margin returns 0 months | Zero margin returns `n/a`; negative CAC becomes $1 | Zero margin says never; negative CAC also says never | Zero-margin output stayed stale; negative CAC clears results | Negative CAC returns 0 months; zero-margin state unclear | Reject negative inputs. Show no finite payback when gross profit is zero. |

## Where competitors disagree

- Gross-profit payback is the correct SaaS unit-economics result. Dividing CAC by ARPA alone ignores hosting, support, payment fees, and other direct delivery costs. ChartMogul and Stripe document the gross-margin formula.
- Churn-adjusted methods differ. OnSumo reduces monthly gross profit by one churn factor, while TidyCalc uses churn to estimate average lifetime and LTV. Neither produces cumulative recovery from an entered retention curve. If cohort data is available, the month when cumulative expected gross profit first reaches CAC is the direct answer.
- Pages use different benchmark bands and grades. They also warn that segment and sales motion matter. The available evidence does not support one universal threshold, so stack127 should show the number and assumptions without an investor health grade.
- Monthly gross-profit payback is not cash-collection timing. An annual subscription may bring cash upfront while gross profit is earned as service is delivered. Report the former as gross-profit payback. A cash recovery schedule would need billing and collection assumptions.

## How stack127 can win

- Show the core formula beside its values: CAC, monthly ARPA, gross margin, gross profit per account, and months to recover.
- Keep revenue-only recovery separate and label it clearly. For example, with $300 CAC and $50 ARPA, revenue-only division is 6 months, while 80% margin gives $40 monthly gross profit and a 7.5-month estimate.
- Let founders compare CAC, ARPA, and gross-margin scenarios without assigning a good or bad grade.
- Add an optional cohort mode only if it can use monthly retention as the share of the original cohort still active. Sum each month's expected gross profit and report the first recovery month or say it does not recover within the entered horizon.
- State that annual prepayment may change cash recovery timing and does not turn normalized MRR into cash or recognized revenue.
- Link the page from `/saas-tools`. Cross-link the existing SaaS metrics calculator and the break-even MRR tool when both routes are live.

## Blockers

No paid API, maintained dataset, background job, account, or approval is needed. FoundStep returned HTTP 521 and was not included among the five operated competitors. Google PAA wording is unknown because the search page returned a CAPTCHA.

## Sources

- [ChartMogul CAC payback](https://chartmogul.com/saas-metrics/cac-payback/), checked 2026-10-04.
- [Stripe CAC in SaaS](https://stripe.com/en-mx/resources/more/cac-in-saas), checked 2026-10-04.
- [Stripe CAC payback period](https://stripe.com/resources/more/what-is-the-cac-payback-period), checked 2026-10-04.
- [Stripe SaaS gross margin](https://stripe.com/resources/more/saas-gross-margin-explained-what-it-is-and-why-it-is-important), checked 2026-10-04.
- [ChartMogul MRR](https://chartmogul.com/saas-metrics/mrr/), checked 2026-10-04.
- [IFRS 15 Revenue from Contracts with Customers](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/), checked 2026-10-04.
- [CAC payback user question with retention data](https://www.reddit.com/r/SaaS/comments/oo90g9), checked 2026-10-04.
- [Micro-SaaS pricing and AI service cost question](https://www.reddit.com/r/microsaas/comments/1nnx1e7), checked 2026-10-04.
- [CAC payback cost-pool and annual-payment discussion](https://www.reddit.com/r/SaaS/comments/l8cwlq), checked 2026-10-04.
