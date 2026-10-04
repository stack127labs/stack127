# Research: Customer Lifetime Value Calculator

Route: `/customer-lifetime-value-calculator`
Checked: 2026-10-04
Competitors used: 5

## Scope

The tool should help a founder estimate the gross profit a customer or account may produce over a stated period, with the assumptions visible. It should separate a churn-based forecast from historical cohort gross profit and support scenario comparisons. The main catalog is `/saas-tools`.

The existing [SaaS Metrics Calculator](../saas-metrics-calculator/tool-spec.md) already offers a basic churn and margin LTV estimate. This page should make the estimate safer and more useful by naming its model assumptions, time basis, and limits. The Notion backlog narrows the claim to an explicit cohort method or a gross-margin/churn model. This research supports the latter as the default manual workflow, with a clearly separate cohort view if users have cohort data.

Queries tried: “SaaS LTV calculator”, “customer lifetime value SaaS gross margin churn”, “cohort LTV vs average LTV”, “zero churn LTV calculator”, “how to calculate LTV monthly annual churn”, and “SaaS LTV formula”. Domains that appeared repeatedly included ChartMogul, Stripe, SyntaxPath, Napkin, OnSumo, ChurnTools, Free SaaS Metrics, Calcipedia, and OctoCalculator.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| SaaS LTV calculator | A fast customer value estimate | A result based on ARPA, gross margin, and churn with the units shown | Many show one number but do not state the constant-churn and constant-margin assumptions |
| customer lifetime value SaaS gross margin churn | To know whether to use revenue or gross profit | An explanation of cost of service and how margin changes LTV | Several calculators label revenue LTV and margin-adjusted LTV simply as “LTV” |
| cohort LTV vs average LTV | To assess actual customer groups over time | A way to compare customers by acquisition cohort at a fixed age | Top quick calculators estimate a blended future value instead of observing cohorts |
| zero churn LTV calculator | To understand what to enter when churn is zero | A clear message that the formula cannot estimate finite lifetime from zero observed churn | Some calculators return zero; others say “no limit” or clamp churn to a tiny positive value |
| how to calculate LTV monthly annual churn | To avoid mixing monthly revenue with annual churn | Matching periods and an example conversion | The time basis is often visible only in field labels, or not stated at all |

The search connector did not expose a “People also ask” panel. These related questions appeared in result snippets, calculator FAQs, and community threads; the leading quick calculators did not answer them consistently:

- Should LTV use revenue or gross profit?
- How do I calculate LTV when churn is zero or my sample is small?
- Is inverse churn the actual customer lifetime?
- How do monthly ARPA and annual churn fit together?
- When should I use cohort LTV instead of a churn formula?
- Should LTV include expansion, discounting, or a fixed contract term?

## User problems

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| Early-stage founders know LTV is an estimate because actual retention history takes time to observe. | [SaaS founders discuss difficult metrics](https://www.reddit.com/r/SaaS/comments/1vmmn5h/saas_founders_which_saas_metrics_do_you_struggle/) | Label a churn-based result as a forecast and show the input period and sample caveat. |
| A blended company number can hide cohorts with different acquisition channels, onboarding, or plans. One founder report describes finding cohorts with LTV below CAC after segmenting. | [Cohort and growth-budget discussion](https://www.reddit.com/r/SaaS/comments/1s2v1h2/we_found_that_34_of_a_saas_companys_growth_budget/) | Let users compare scenario rows or cohort inputs; do not imply an average is representative of every channel or plan. |
| Founders can mistake revenue LTV for value after service costs. One thread compares $1,782 revenue value with about $1,069 at 60% gross margin. | [Discussion of gross margin and unit economics](https://www.reddit.com/r/SaaS/comments/1rouhcs/4_things_about_saas_unit_economics_that_surprised/) | Put gross margin in the main calculation and show revenue LTV only as a separate optional measure. |
| People ask for a calculation that can withstand scrutiny, not just a rule of thumb. | [Discussion asking for defensible LTV methods](https://www.reddit.com/r/SaaS/comments/bmczlo) | Document the formula, model assumptions, and which observed data would improve the estimate. |

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| A common SaaS estimate is ARPA × gross margin fraction ÷ customer churn rate, with revenue and churn on the same time basis. | [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/), [ChartMogul LTV help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv) | For monthly inputs, show monthly ARPA × margin ÷ monthly logo churn. Convert all inputs if the user chooses annual values. |
| Revenue less cost of goods or service is gross profit; the margin fraction adjusts revenue LTV to a gross-profit basis. A high-revenue customer at thin margin may be worth less than one at higher margin. | [Stripe: Customer Lifetime Value](https://stripe.com/resources/more/customer-lifetime-value) | Make margin-adjusted LTV the primary output. Show revenue LTV only with a clear label. |
| The formula assumes churn and revenue behavior remain stable. Expansion, contraction, nonlinear retention, and segment mix can make it inaccurate. | [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/), [ChartMogul LTV report](https://chartmogul.com/reports/saas-ltv-report/) | List the model assumptions by the output. Offer conservative, base, and upside churn/margin/ARPA scenarios. |
| Under a constant churn-probability model, 1 ÷ churn gives an implied expected lifetime in periods. It is not an observed customer lifetime. Zero churn makes the inverse-churn estimate undefined as a finite value. | [ChartMogul LTV help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv) | Call this “model-implied lifetime”. When churn is zero or unavailable, show “not estimable from these inputs”, not zero or infinity as measured value. |
| Cohort measurement and formula estimates answer different questions. ChartMogul’s published analysis used 3,331 accounts and 35,512 cohorts from 2020 Q1 to 2024 Q4, with MRR observed through June 2026; 28.3% of cohort estimates differed by more than 50% from the formula estimate in its comparison. | [ChartMogul SaaS LTV report](https://chartmogul.com/reports/saas-ltv-report/) | Label historical cohort gross profit as observed to a stated age and date. Do not present the cohort total as a complete lifetime when customers remain active. |
| Different vendors use different LTV variants, including a report-interval ARPA with trailing six-month average churn, or separate discount-rate and contract-term models. | [ChartMogul LTV help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv), [OnSumo LTV Calculator](https://onsumo.com/tools/saas/saas-ltv-calculator) | Name the selected method. Do not switch churn windows or add discounting without showing the rate, interval, and assumptions. |

## Competitor reviews

### 1. SyntaxPath

URL: [SaaS LTV Calculator](https://www.syntaxpath.com/tools/ltv-calculator)

- [Observed] It asks for ARPA, gross margin, monthly or yearly churn, CAC, and a discount rate. It shows simple LTV, discounted LTV, implied lifetime, LTV:CAC, and payback.
- [Observed] Correct example: $50 ARPA, 80% margin, 3% monthly churn, and $400 CAC returned $1,333 simple LTV, 33.3 months implied lifetime, $1,062 discounted LTV, 3.3:1, and 10 months payback.
- [Observed] Edge case: zero churn showed “No limit” for simple LTV and implied lifetime, while discounted LTV still showed $5,056.
- [Observed] Wrong input: gross margin of 101% was accepted and produced about $1,683 LTV; no visible validation appeared.
- [Documented] Its labels identify the selected churn interval and annual discount input.
- [Inferred] “No limit” can be read as an observed value unless the model assumption is explained beside it.
- [Unknown] The page did not explain how it selected or sourced its default discount rate.

Input: $50 ARPA, 80% margin, 3% monthly churn -> about $1,333 simple LTV

### 2. Napkin

URL: [Napkin LTV Calculator](https://bynapkin.com/tools/ltv-calculator)

- [Observed] Inputs include ARPU, gross margin, monthly churn, and CAC. It shows LTV, implied lifetime, ratio, and a grade.
- [Observed] Correct example: $100 ARPU, 80% margin, 5% monthly churn, and $400 CAC returned $1,600 LTV, 20 months lifetime, and 4:1 with “GREAT”.
- [Observed] Edge case: zero churn returned $0 LTV, no lifetime value, and no ratio.
- [Observed] Wrong input: 101% gross margin was accepted, returning $2,020 LTV and 5:1 with “UNDERSPENDING”.
- [Documented] Its page discusses constant churn and omitting expansion from the estimate.
- [Inferred] The grade and the zero-churn result are more decisive than the inputs justify.
- [Unknown] I did not find a source for the grade thresholds.

Input: $100 ARPU, 80% margin, 5% monthly churn -> $1,600 LTV

### 3. OnSumo

URL: [OnSumo SaaS LTV Calculator](https://onsumo.com/tools/saas/saas-ltv-calculator)

- [Observed] It compares simple, gross-margin-adjusted, discounted, and fixed-contract-term LTV, and includes a churn sensitivity table.
- [Observed] Correct example: $49 ARPU, 80% margin, 5% monthly churn, 24-month contract, and 10% discount returned $980 simple, $784 margin-adjusted, $676 discounted, and $941 fixed-term LTV.
- [Observed] Edge case: zero churn was limited by the field minimum of 0.01%, producing $490,000 simple LTV and $392,000 margin-adjusted LTV.
- [Observed] Wrong input: gross margin above the 99% field maximum was clamped to 99%; the margin result was about $970.
- [Documented] The interface displays several methods side by side rather than treating them as one formula.
- [Inferred] The tiny minimum churn creates a very large output without a clear warning that the entered zero was changed.
- [Unknown] I did not verify the source or rationale for the default 10% discount rate.

Input: $49 ARPU, 80% margin, 5% monthly churn -> $980 simple, $784 margin-adjusted

### 4. ChurnTools

URL: [ChurnTools LTV Calculator](https://churntools.com/ltv-calculator)

- [Observed] It shows revenue LTV and gross-margin LTV separately, plus implied lifetime, annual churn, LTV:CAC, and CAC payback.
- [Observed] Correct example: $100 ARPA, 80% margin, 5% monthly churn, and $400 CAC returned $2,000 revenue LTV, $1,600 margin LTV, 20 months lifetime, 4:1, and 5 months payback.
- [Observed] Edge case: zero monthly churn returned $0 for both LTVs, with dashes for lifetime, annual churn, and ratio.
- [Observed] Wrong input: 101% gross margin was accepted, producing $2,020 margin LTV, 5:1, and a “very high, underinvesting” interpretation.
- [Documented] The page distinguishes revenue LTV from margin-adjusted LTV.
- [Inferred] Returning zero value when churn is zero reverses the practical interpretation of the formula and can mislead a user.
- [Unknown] The site did not expose a cohort-based observed LTV method.

Input: $100 ARPA, 80% margin, 5% monthly churn -> $1,600 margin LTV

### 5. Free SaaS Metrics

URL: [LTV:CAC Calculator](https://www.freesaasmetrics.com/calculators/ltv-cac-calculator)

- [Observed] It combines ARPU, gross margin, churn, sales and marketing spend, and new customers; outputs LTV, CAC, ratio, payback, and a health label.
- [Observed] Correct example: $50 ARPU, 80% margin, 3% monthly churn, $10,000 spend, and 100 customers returned $1,333 LTV, $100 CAC, 13.3:1, 2.5 months payback, and “Healthy”.
- [Observed] Edge case: zero churn returned $0 LTV and 0:1, while payback remained 2.5 months.
- [Observed] Wrong input: 101% margin made the HTML field invalid, but the calculator still used it and returned about $1,683 LTV and a 16.8:1 “Healthy” result.
- [Documented] Its method uses ARPU × gross margin ÷ monthly churn.
- [Inferred] The edge and invalid-input results show why display constraints alone are not enough; the calculation should reject invalid values and handle zero churn explicitly.
- [Unknown] It does not explain how the time basis changes for annual churn.

Input: $50 ARPU, 80% margin, 3% monthly churn -> about $1,333 modeled LTV

## Comparison

| Feature or answer | SyntaxPath | Napkin | OnSumo | ChurnTools | Free SaaS Metrics | What stack127 should do |
| --- | --- | --- | --- | --- | --- | --- |
| Main inputs | ARPA, margin, churn, CAC, discount | ARPU, margin, churn, CAC | ARPU, margin, churn, term, discount | ARPA, margin, churn, CAC | ARPU, margin, churn, S&M spend, customers | State whether the estimate is revenue or gross profit and match time units |
| Multiple methods | Simple and discounted | One churn estimate | Four methods and sensitivity | Revenue and margin views | Churn estimate plus ratio | Keep model variants named and assumptions visible |
| Zero churn | “No limit” | $0 | Clamped to 0.01% | $0 | $0 | Show “not estimable from these inputs” |
| Gross margin over 100% | Accepted | Accepted | Clamped at 99% | Accepted | Calculated despite invalid field | Reject invalid input and do not retain a plausible result |
| Cohort measurement | Not seen | Not seen | Not seen | Not seen | Not seen | Distinguish observed cohort gross profit to date from a forecast |
| Assumption warning | Some constant-churn explanation | Mentions assumptions | Several methods | Few limits in result | Health label | Put assumptions beside each result and scenario |

## Where competitors disagree

The core churn model is usually ARPA × gross margin ÷ churn, but some pages show revenue LTV, some show margin LTV, and some discount the forecast or cap it to a contract term. Those values differ because they answer different questions. The page should name the method and avoid comparing them as if they were the same estimate.

Zero churn exposes a model limit. “No limit” is the mathematical result of dividing by zero under a constant-churn assumption; it is not an observed, finite customer lifetime. Returning zero or silently replacing zero with 0.01% is also misleading. If churn is zero, unknown, or based on too few customers, the calculator should withhold the estimate and explain why.

The simple formula assumes stable churn, ARPA, and margin. ChartMogul’s cohort study shows that formula estimates can differ materially from cohort results. Historical cohort value is also incomplete while customers remain active. Label a cohort result by age, date, and gross profit observed so far.

## How stack127 can win

- Make gross-margin-adjusted LTV the primary modeled output; show revenue LTV separately if useful.
- Put the formula, currency, period, churn interval, and assumption that behavior stays stable directly beside the estimate.
- Never report zero churn as zero LTV or infinite measured value. Use “not estimable from these inputs” and explain that more retention history or a declared model assumption is needed.
- Offer conservative, base, and upside scenarios for churn and margin. Show which input changes each result.
- If cohort values are supported, label them as observed gross profit to a fixed age and date. Warn that active customers make the cohort value right-censored rather than a complete lifetime.
- Keep discounts and contract caps optional. Show the discount rate, time period, and contract term beside that variant.
- Include examples that compare revenue LTV with margin LTV and monthly churn with annual churn.
- Explain that segment and channel averages can hide different retention patterns; encourage separate estimates for materially different plans or acquisition cohorts.
- Keep the manual estimate usable without account access, uploaded customer records, or an external data source.

## Blockers

Build blockers: None for a manual model. Historical cohort measurement would require user-supplied cohort data or a separately approved data connection, but it is not needed for the churn-based calculator.

Research access: T3 preview’s automation host became unavailable, so the permitted local headless browser fallback was used. Calcipedia rendered symbolic formula labels without a numeric result, Bigdelta and OctoCalculator kept showing default results after input changes, Wati timed out, and FreeTooler remained in its empty state. Those candidates were excluded from the five operated competitors.

## Sources

- [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/), checked 2026-10-04.
- [ChartMogul LTV help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv), checked 2026-10-04.
- [ChartMogul SaaS LTV report](https://chartmogul.com/reports/saas-ltv-report/), checked 2026-10-04.
- [Stripe: Customer Lifetime Value](https://stripe.com/resources/more/customer-lifetime-value), checked 2026-10-04.
- [SyntaxPath LTV Calculator](https://www.syntaxpath.com/tools/ltv-calculator), checked 2026-10-04.
- [Napkin LTV Calculator](https://bynapkin.com/tools/ltv-calculator), checked 2026-10-04.
- [OnSumo SaaS LTV Calculator](https://onsumo.com/tools/saas/saas-ltv-calculator), checked 2026-10-04.
- [ChurnTools LTV Calculator](https://churntools.com/ltv-calculator), checked 2026-10-04.
- [Free SaaS Metrics LTV:CAC Calculator](https://www.freesaasmetrics.com/calculators/ltv-cac-calculator), checked 2026-10-04.
- [SaaS founders discuss difficult metrics](https://www.reddit.com/r/SaaS/comments/1vmmn5h/saas_founders_which_saas_metrics_do_you_struggle/), checked 2026-10-04.
- [Cohort and growth-budget discussion](https://www.reddit.com/r/SaaS/comments/1s2v1h2/we_found_that_34_of_a_saas_companys_growth_budget/), checked 2026-10-04.
- [Discussion of gross margin and unit economics](https://www.reddit.com/r/SaaS/comments/1rouhcs/4_things_about_saas_unit_economics_that_surprised/), checked 2026-10-04.
- [Discussion asking for defensible LTV methods](https://www.reddit.com/r/SaaS/comments/bmczlo), checked 2026-10-04.
