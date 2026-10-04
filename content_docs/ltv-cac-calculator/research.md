# Research: LTV:CAC Calculator

Route: `/ltv-cac-calculator`
Checked: 2026-10-04
Competitors used: 5

## Scope

The tool should compare customer value with the cost to acquire those customers, using matching customer units, segments, currency, and cost basis. It should show the LTV and CAC inputs before the ratio, then show payback separately because a ratio has no time dimension.

The existing [SaaS Metrics Calculator](../saas-metrics-calculator/tool-spec.md) already gives a basic CAC, simple churn-and-margin LTV estimate, and payback. This tool should focus on whether those two economic bases actually match, show alternative scenarios, and avoid a universal healthy grade. The main catalog is `/saas-tools`.

Queries tried: “LTV CAC calculator”, “what is a good SaaS LTV CAC ratio”, “LTV CAC calculator with gross margin”, “LTV CAC ratio by cohort channel”, “LTV:CAC payback”, and “SaaS LTV to CAC formula”. Domains that appeared repeatedly included ChartMogul, Stripe, Free SaaS Metrics, Napkin, SyntaxPath, Daydream, Free Biz Tools, and PlanMySaaS.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| LTV CAC calculator | A ratio from customer value and acquisition cost | LTV and CAC with the formula, assumptions, and units | Some calculators accept direct numbers with no basis or period |
| what is a good SaaS LTV CAC ratio | A target or decision rule | Context for margin, growth stage, acquisition motion, and payback | Fixed “healthy” grades ignore business model and cash constraints |
| LTV CAC calculator with gross margin | A profit-based comparison | Gross-profit LTV compared with an acquisition cost that includes acquisition work | Some tools accept revenue LTV or a paid-media-only CAC without warning |
| LTV CAC ratio by cohort channel | To see which group of customers is economic | Cohort or channel LTV matched with corresponding spend and customers | Most tools calculate blended values and cannot reveal weak cohorts |
| LTV:CAC payback | To know how long cash takes to return | CAC recovery time shown separately from lifetime ratio | Several pages imply the ratio itself means payback speed |

The search connector did not expose a “People also ask” panel. These related questions appeared in result FAQs and community threads; the calculators did not answer them consistently:

- Does LTV use revenue or gross profit?
- Should CAC include salaries, tools, agencies, and founder time?
- Is a 3:1 ratio always healthy?
- Should paid CAC be compared with blended LTV?
- How do I match CAC and LTV by cohort or channel?
- What does LTV:CAC say that CAC payback does not?

## User problems

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| A blended average can hide cohorts that are below break-even. One founder report describes separating source, onboarding, and plan to find different economics. | [Cohort and growth-budget discussion](https://www.reddit.com/r/SaaS/comments/1s2v1h2/we_found_that_34_of_a_saas_companys_growth_budget/) | Let users compare a matched customer group or clearly mark a blended result as an average. |
| Founders disagree about the payback period they can tolerate, and whether CAC means all sales and marketing or just ad spend. | [Discussion of CAC payback and acquisition cost scope](https://www.reddit.com/r/digital_marketing/comments/1sotwoi/how_long_is_too_long_for_cac_payback_in_saas/) | Show the cost basis and payback period next to the ratio; do not turn one ratio into a funding recommendation. |
| Revenue LTV can overstate value when delivery cost is material. A founder thread works through how 60% margin reduces revenue value. | [Discussion of gross margin and unit economics](https://www.reddit.com/r/SaaS/comments/1rouhcs/4_things_about_saas_unit_economics_that_surprised/) | Use gross-profit LTV by default and make revenue LTV an explicitly separate view. |
| Users ask whether a unit-economics result will withstand scrutiny, not just whether it crosses a popular threshold. | [Discussion asking for defensible LTV methods](https://www.reddit.com/r/SaaS/comments/bmczlo) | Show source formula, user inputs, time basis, and caveats rather than a grade alone. |

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| LTV:CAC is LTV divided by CAC. It is a lifetime return multiple, not a time-to-recovery measure. | [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/) | Display the ratio only after showing its LTV and CAC components. Show payback as a separate number with months or years. |
| A common SaaS LTV estimate is ARPA × gross margin ÷ customer churn, with matching time units. | [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/), [ChartMogul LTV help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv) | Use margin-adjusted LTV and display whether ARPA and churn are monthly or annual. |
| CAC is total sales and marketing acquisition cost divided by newly acquired customers; long sales cycles can create a period mismatch. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | Use the same customer unit and segment as the LTV input. Distinguish a calendar-period blended estimate from a cohort-matched calculation. |
| A “3:1” ratio is a rule of thumb, not a universal healthy threshold. Stripe also notes that CAC benchmarks vary by SaaS business. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | If mentioned, call it a common heuristic and provide context. Do not color-code a universal healthy/poor grade. |
| CAC payback is the cost divided by periodic gross profit or contribution from the acquired customer. It has a time unit; LTV:CAC does not. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas), [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/) | Keep payback separate and use the same margin basis as LTV. State whether the calculation uses first-month or recurring gross profit. |
| LTV formula outputs depend on stable churn, margin, and revenue assumptions; cohort estimates can differ. | [ChartMogul SaaS LTV report](https://chartmogul.com/reports/saas-ltv-report/) | Show the method and scenario inputs. For historical cohort data, label the age and observed-to-date basis. |
| A ratio compares like currency amounts per like customer or account, with a matched scope. | [ChartMogul LTV and CAC definitions](https://chartmogul.com/saas-metrics/ltv/), [Stripe CAC guidance](https://stripe.com/resources/more/cac-in-saas) | Do not compare annual account value for one segment with monthly customer CAC for another. Identify paid-only versus fully loaded CAC and match to the selected LTV scope. |

## Competitor reviews

### 1. Daydream

URL: [Daydream LTV:CAC Calculator](https://www.withdaydream.com/tools/saas-calculators/ltv-cac)

- [Observed] It takes annual contract value, gross margin, annual churn, annual sales and marketing spend, and new customers. It returns LTV, CAC, ratio, payback, and a qualitative label.
- [Observed] Correct example: $24,000 ACV, 75% margin, 20% annual churn, $40,000 sales spend, $60,000 marketing spend, and 10 customers returned $90,000 LTV, $10,000 CAC, 9.00:1, and 6.7 months payback.
- [Observed] Edge case: zero new customers returned $0 CAC with a dash for ratio and payback.
- [Observed] Wrong input: with negative $1,000 sales spend, zero marketing spend, and 10 customers, the input remained negative while output CAC was positive $100 and the ratio was 900:1. [Inferred] The result appears to use the absolute cost; the page did not explain that behavior.
- [Documented] It labels its inputs annually and calculates ACV × gross margin ÷ annual churn.
- [Inferred] Its “Strong” label can overstate confidence when churn or spend inputs are rough estimates.
- [Unknown] It does not show which customers are included in the annual win count.

Input: $24,000 ACV, 75% margin, 20% annual churn, $100,000 S&M / 10 wins -> $90,000 LTV, $10,000 CAC, 9:1

### 2. Free Biz Tools

URL: [SaaS LTV:CAC Ratio Calculator](https://free-biz-tools.com/tools/saas-ltv-cac-ratio-calculator/)

- [Observed] It accepts a direct LTV and CAC value and displays their ratio, without breaking either value into assumptions.
- [Observed] Correct example: $10,000 LTV ÷ $2,500 CAC returned 4.00.
- [Observed] Edge case: CAC of zero returned a dash because the input minimum is $0.01.
- [Observed] Wrong input: negative $1 LTV failed the field minimum and the result remained a dash.
- [Documented] The page advises matching periods, currency, and units in the user’s inputs.
- [Inferred] The direct-value form avoids modeling decisions, but users can still enter incompatible figures without the calculator detecting the mismatch.
- [Unknown] It does not define whether LTV means revenue, gross profit, or a cohort observation.

Input: $10,000 LTV ÷ $2,500 CAC -> 4.00

### 3. Free SaaS Metrics

URL: [LTV:CAC Calculator](https://www.freesaasmetrics.com/calculators/ltv-cac-calculator)

- [Observed] It derives LTV from ARPU, gross margin, and churn, derives CAC from sales and marketing spend divided by customers, then shows ratio, payback, and a health label.
- [Observed] Correct example: $50 ARPU, 80% margin, 3% monthly churn, $10,000 spend, and 100 customers returned $1,333 LTV, $100 CAC, 13.3:1, and 2.5 months payback.
- [Observed] Edge case: zero churn returned $0 LTV and 0:1 while payback remained 2.5 months.
- [Observed] Wrong input: 101% margin made the browser field invalid, but the calculation still ran and showed about $1,683 LTV, 16.8:1, and “Healthy”.
- [Documented] It marks the result healthy at 3:1 or higher and shows a payback threshold.
- [Inferred] Its universal health label hides both the zero-churn problem and invalid-margin input.
- [Unknown] It does not ask whether the spend and wins belong to the LTV customer cohort.

Input: $50 ARPU, 80% margin, 3% monthly churn, $100 CAC -> about $1,333 LTV and 13.3:1

### 4. Napkin

URL: [Napkin LTV Calculator](https://bynapkin.com/tools/ltv-calculator)

- [Observed] Inputs are ARPU, gross margin, monthly churn, and CAC. The result includes LTV, implied lifetime, ratio, and a grade.
- [Observed] Correct example: $100 ARPU, 80% margin, 5% monthly churn, and $400 CAC returned $1,600 LTV, 20 months lifetime, and 4:1 with “GREAT”.
- [Observed] Edge case: zero churn returned $0 LTV, no lifetime, and no ratio.
- [Observed] Wrong input: 101% margin was accepted, producing $2,020 LTV and 5:1 with “UNDERSPENDING”.
- [Documented] Its page states constant churn and no expansion in its LTV model.
- [Inferred] Calling a 5:1 result “UNDERSPENDING” turns one assumption-driven ratio into spending advice.
- [Unknown] The page did not document where its grade thresholds came from.

Input: $100 ARPU, 80% margin, 5% monthly churn, $400 CAC -> $1,600 LTV and 4:1

### 5. SyntaxPath

URL: [SaaS LTV Calculator](https://www.syntaxpath.com/tools/ltv-calculator)

- [Observed] It combines ARPA, margin, churn interval, CAC, and discount rate, then displays LTV, implied lifetime, ratio, and payback.
- [Observed] Correct example: $50 ARPA, 80% margin, 3% monthly churn, and $400 CAC returned $1,333 simple LTV, 3.3:1, and 10 months payback.
- [Observed] Edge case: zero churn showed “No limit” simple LTV and lifetime. A discounted result remained finite at $5,056.
- [Observed] Wrong input: 101% margin was accepted and produced about $1,683 LTV.
- [Documented] It lets users select monthly or yearly churn and enter a discount rate.
- [Inferred] The simple ratio and discounted ratio can refer to different value bases unless the selected method is stated alongside the result.
- [Unknown] The page did not make the discount-rate source clear.

Input: $50 ARPA, 80% margin, 3% monthly churn, $400 CAC -> about $1,333 LTV and 3.3:1

## Comparison

| Feature or answer | Daydream | Free Biz Tools | Free SaaS Metrics | Napkin | SyntaxPath | What stack127 should do |
| --- | --- | --- | --- | --- | --- | --- |
| LTV inputs | ACV, margin, annual churn | Direct value | ARPU, margin, monthly churn | ARPU, margin, monthly churn | ARPA, margin, churn, discount | State the LTV method and time basis |
| CAC inputs | Annual S&M and wins | Direct value | S&M spend and customer count | Direct value | Direct CAC | Offer a fully loaded cost breakdown or clearly labeled direct input |
| Ratio and payback | Both | Ratio only | Both | Ratio only | Both | Keep ratio and months-to-recover distinct |
| Cohort matching | Not confirmed | User must match inputs | Not confirmed | User must match inputs | User must match inputs | Compare the same segment and acquisition cohort when data supports it |
| Universal grade | “Strong” label | None | “Healthy” threshold | Several grades | None | Avoid a universal grade; show user-selected targets only |
| Input and zero handling | Negative cost appears absolute-valued | Blocks zero/negative | Zero churn gives 0; invalid margin still calculates | Zero churn gives 0; invalid margin accepted | Zero churn “No limit”; invalid margin accepted | Reject invalid economics and explain non-estimable cases |

## Where competitors disagree

Most modeled tools calculate a gross-profit LTV and divide by CAC, but they use different periods and different CAC scopes. Daydream takes annual ACV and annual churn, while several others use monthly ARPU and churn. A ratio is only interpretable when both inputs share currency, customer unit, segment, and economic basis.

Some calculators grade 3:1 as healthy; Napkin labels 5:1 “underinvesting”; Daydream labels 9:1 “strong”. These labels can point in opposite directions and are not universal standards. Stripe calls 3:1 a common rule of thumb while also stating that CAC benchmarks vary across SaaS. The tool should not assign a universal grade.

Payback and LTV:CAC are also different. A customer may have a high projected lifetime ratio but still take a long time to repay CAC. Report months to recover CAC separately, using the same gross-margin basis as LTV.

## How stack127 can win

- Put the LTV amount, CAC amount, ratio, and payback period together, with each formula and unit visible.
- Let users calculate LTV from ARPA, gross margin, and churn, or enter an explicitly labeled LTV value. Let CAC come from fully loaded acquisition costs and new paying customers, or accept a labeled direct CAC.
- Match the cost period, acquisition cohort, customer/account definition, channel, and currency. If users only have blended numbers, label the result as a blended estimate.
- Show paid-only and fully loaded CAC as separate options. Do not compare paid CAC with an LTV figure for all customer sources without warning.
- Offer conservative, base, and upside scenarios. Show how churn, margin, sales-cycle timing, and cost allocation change the ratio.
- Avoid “healthy”, “great”, or “underinvesting” grades. If a user enters a target, show the gap to that target without presenting it as a universal standard.
- Treat zero churn as non-estimable under the simple model and reject margin above 100%. Do not leave a stale result visible after invalid inputs.
- For observed cohort LTV, label value as gross profit to a stated age and compare it with CAC assigned to that same cohort. Keep projected lifetime ratio separate from observed-to-date ratio.
- Explain that a high LTV:CAC result alone does not establish that a business should spend more; cash runway, growth constraints, and the speed of payback matter.

## Blockers

Build blockers: None for a manual calculator. A cohort comparison can start with user-supplied data and does not need an external benchmark dataset or background job.

Research access: T3 preview’s automation host became unavailable, so the permitted local headless browser fallback was used. PlanMySaaS was inspected but its calculate control stayed disabled after input entry; it was excluded. Five other competitors were operated with correct, edge, and wrong-input checks.

## Sources

- [ChartMogul: LTV](https://chartmogul.com/saas-metrics/ltv/), checked 2026-10-04.
- [ChartMogul LTV help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv), checked 2026-10-04.
- [ChartMogul SaaS LTV report](https://chartmogul.com/reports/saas-ltv-report/), checked 2026-10-04.
- [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas), checked 2026-10-04.
- [Free SaaS Metrics LTV:CAC Calculator](https://www.freesaasmetrics.com/calculators/ltv-cac-calculator), checked 2026-10-04.
- [Napkin LTV Calculator](https://bynapkin.com/tools/ltv-calculator), checked 2026-10-04.
- [SyntaxPath LTV Calculator](https://www.syntaxpath.com/tools/ltv-calculator), checked 2026-10-04.
- [Daydream LTV:CAC Calculator](https://www.withdaydream.com/tools/saas-calculators/ltv-cac), checked 2026-10-04.
- [Free Biz Tools LTV:CAC Ratio Calculator](https://free-biz-tools.com/tools/saas-ltv-cac-ratio-calculator/), checked 2026-10-04.
- [Cohort and growth-budget discussion](https://www.reddit.com/r/SaaS/comments/1s2v1h2/we_found_that_34_of_a_saas_companys_growth_budget/), checked 2026-10-04.
- [Discussion of CAC payback and acquisition cost scope](https://www.reddit.com/r/digital_marketing/comments/1sotwoi/how_long_is_too_long_for_cac_payback_in_saas/), checked 2026-10-04.
- [Discussion of gross margin and unit economics](https://www.reddit.com/r/SaaS/comments/1rouhcs/4_things_about_saas_unit_economics_that_surprised/), checked 2026-10-04.
- [Discussion asking for defensible LTV methods](https://www.reddit.com/r/SaaS/comments/bmczlo), checked 2026-10-04.
