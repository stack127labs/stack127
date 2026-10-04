# Research: Customer Acquisition Cost Calculator

Route: `/customer-acquisition-cost-calculator`
Checked: 2026-10-04
Competitors used: 5

## Scope

The tool should answer: “What did it cost to win a new paying customer, and which costs and customers did I count?” It should show cash-only and fully loaded views, separate blended CAC from paid-channel CAC, and make the reporting window and sales-cycle treatment visible. The main catalog is `/saas-tools`.

This page should add a cost and timing breakdown to the existing [SaaS Metrics Calculator](../saas-metrics-calculator/tool-spec.md), which already gives a basic CAC snapshot, a simple LTV estimate, and payback. It should not present a second unexplained spend-divided-by-customer count as a distinct product.

Queries tried: “customer acquisition cost calculator”, “fully loaded CAC calculator SaaS”, “CAC including founder time”, “CAC sales cycle allocation”, “how to calculate CAC with long sales cycle”, “blended vs paid CAC”, and “SaaS CAC formula”. Domains that appeared repeatedly included Stripe, 4Calculators, CustomerAcquisitionCostCalculator, MoneySheet, ARB Digital, Best SaaS Metrics, and PanCalcHub.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| customer acquisition cost calculator | A quick cost per new customer | A clear formula, new-customer definition, and reporting period | Many show a number without stating whether customers are paid, trial, or attributed |
| fully loaded CAC calculator SaaS | A cost that includes the work behind acquisition | Payroll, commissions, tools, agencies, and any allocated overhead in separate rows | Most do not explain the allocation driver or distinguish acquisition work from retention work |
| CAC including founder time | To compare cash spend with the value of unpaid founder labor | Hours and an explicit hourly value, reported separately from cash CAC | Most tools omit founder labor or silently mix it into payroll |
| CAC sales cycle allocation | To handle costs paid months before a customer signs | A same-period proxy plus a way to align spend with the paying customer cohort | Calculators rarely ask about sales-cycle length or warn that calendar-period ratios can be lagged |
| blended vs paid CAC | To assess the whole business and paid channels separately | Two aligned ratios with their different cost pools and customer counts | Some results label channel CAC without defining how organic customers or shared costs are treated |

The search connector did not expose a “People also ask” panel. These related questions appeared in result snippets, page FAQs, and community threads; no top calculator answered all of them well:

- Which sales and marketing costs belong in CAC?
- Should founder time and sales commissions be included?
- Should CAC count trials, leads, or only paying customers?
- How should CAC be calculated when the sales cycle crosses months?
- Is paid CAC the same as fully loaded CAC?

## User problems

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| Founders leave their own selling time out of cash CAC, then struggle to compare that result with a staffed sales team. Replies in this thread distinguish cash costs from hours spent on outreach and follow-up. | [Founder discussion of true acquisition costs](https://www.reddit.com/r/SaaS/comments/1qbo2bv/what_are_your_true_customer_acquisition_costs/) | Show cash CAC and time-included CAC as separate views. Require an hourly value before counting founder labor. |
| Teams compare paid-channel cost per acquired customer with blended company CAC as if the denominators were the same. | [SaaS discussion of organic and paid CAC](https://www.reddit.com/r/SaaS/comments/1qbsy5f/saas-organic-channel-economics-9-cac-vs-465-paid/) | Name each cost pool and count. Do not use a generic “CAC” label for unlike measures. |
| CAC is difficult to interpret when spend and closed customers fall in different months. | [Discussion of acquisition cost and sales timing](https://www.reddit.com/r/SaaS/comments/1g63f8f/whats_your_current_cost_per_acquisition_feels/) | Put the selected cost window and customer window next to the result, and offer a cohort-aligned method when attribution data exists. |
| Founders want a “true” number but differ on whether it means cash paid or all effort consumed. | [Founder discussion of actual acquisition costs](https://www.reddit.com/r/SaaS/comments/oo0w5w) | Let users state the cost boundary instead of implying one universal fully loaded definition. |

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| Basic CAC is sales and marketing acquisition cost divided by new customers acquired. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | Display the numerator and denominator beside the result. Let users select month, quarter, or year. |
| Common acquisition costs include advertising, content, events, sales and marketing salaries or commissions, tools, and agencies. Customer support, infrastructure, and R&D are not direct acquisition costs in Stripe’s examples. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | Provide separate rows and explain exclusions. Treat shared rent or admin allocations as user-selected assumptions, not universal requirements. |
| CAC should use newly paying customers, not leads or trials, unless the user explicitly defines a different conversion point. Freemium and usage-based businesses need a stated conversion rule. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | Default to first-time paying customers and allow an explicit alternative label. Never mix trials in the count without changing the result label. |
| Spend and wins can fall in different periods when sales cycles are long. Shared brand spending also needs an allocation choice. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | Offer a calendar-period snapshot and a cohort-aligned view. If the user cannot attribute historical spend to the cohort, call the result a period proxy. Show the allocation rule and sales-cycle window. |
| ASC 340-40 covers incremental costs of obtaining a customer contract, such as a commission that is payable only when a contract is won. It is not a prescribed management CAC formula. | [FASB ASU 2014-09, Section A](https://storage.fasb.org/ASU%202014-09_Section%20A.pdf), [FASB Revenue Transition Resource Group Memo 23](https://storage.fasb.org/REVREC_TRG_Memo_23_Costs_to_Obtain_a_Contract.pdf) | Do not call the calculator “GAAP CAC” or imply that all marketing, payroll, or allocated overhead receives the same accounting treatment. |
| There is no universal CAC benchmark across SaaS businesses. | [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas) | Avoid a universal pass/fail band. Compare scenarios or user-entered targets and show the basis. |
| Founder time and shared overhead do not have one standard value or allocation basis. | [Stripe’s cost and allocation discussion](https://stripe.com/resources/more/cac-in-saas); founder reports in the linked Reddit discussion above | Keep labor hours and hourly value explicit. Show direct spend, allocated payroll, shared overhead, and founder time separately. |

## Competitor reviews

### 1. CustomerAcquisitionCostCalculator, fully loaded CAC

URL: [Fully Loaded CAC Calculator](https://customeracquisitioncostcalculator.com/calculators/fully-loaded/)

- [Observed] Inputs ask for sales cost including overhead, marketing cost including overhead, and new customers.
- [Observed] Correct example: $7,000 sales + $12,000 marketing over 100 new customers returned $190.
- [Observed] Edge case: $0 sales + $0 marketing over one customer returned $0.
- [Observed] Wrong input: a negative sales cost was blocked by the field minimum. The earlier $190 result remained visible, so the stale output could be mistaken for the new answer.
- [Documented] The page suggests allocating overhead by headcount, square footage, or a share of department spend, and names rent, utilities, admin, software, and depreciation.
- [Inferred] It is the clearest direct-cost-plus-overhead example in this set, but the user must choose the allocation and cannot separate cash from allocated costs in the result.
- [Unknown] It does not show how costs should be assigned across a multi-month sales cycle.

Input: $7,000 sales + $12,000 marketing; 100 customers -> $190 CAC

### 2. MoneySheet

URL: [MoneySheet CAC Calculator](https://themoneysheet.com/calculators/cac/)

- [Observed] It separates ad spend, salaries, tools and agency costs, total blended CAC, and paid-only CAC.
- [Observed] Correct example: $5,000 ads + $3,000 salary + $2,000 tools and agency costs over 100 customers returned $100 blended CAC. With 40 paid customers, paid-only CAC was $125.
- [Observed] Edge case: with no total customers and 40 paid customers, blended and ad-only CAC showed dashes while paid-only CAC still showed $125.
- [Observed] Wrong input: negative ad spend was treated as zero in the total. With $5,000 of other cost over 100 customers, it returned $50 CAC; the paid-only ad result was $0.
- [Documented] Salary allocation can be toggled, and the page distinguishes paid customers from organic customers.
- [Inferred] The paid-only number is useful for channel decisions, but the page could make the distinction between paid media CAC and fully loaded paid CAC clearer.
- [Unknown] I did not verify whether the salary allocation can use logged hours or only a fixed share.

Input: $5,000 ads + $3,000 salary + $2,000 other; 100 total, 40 paid -> $100 blended, $125 paid-only

### 3. ARB Digital, reached through the Arbsbuy result

URL: [ARB Digital CAC Calculator](https://arbdigital.agency/cac-calculator/)

- [Observed] It accepts ad spend, salaries, tools, agency, other costs, and new customers. It also asks for LTV and monthly gross margin to show ratio and payback.
- [Observed] Correct example: $7,000 ads + $3,000 salaries + $1,000 tools + $500 agency + $500 other over 50 customers returned $240 CAC. With its $900 LTV and $75 monthly gross margin inputs, it also showed 3.8:1 and 3.2 months.
- [Observed] Edge case: zero new customers returned $0 CAC and the message “Enter new customers to calculate.”
- [Observed] Wrong input: negative $1 ad spend was accepted. With $5,000 in other acquisition cost and 50 customers, CAC was $99.98 and ad-only CPA was negative $0.02.
- [Documented] It presents total spend divided by new customers and separately reports ad-only CPA.
- [Inferred] The extra LTV and payback outputs can distract from the CAC cost boundary; negative costs should be rejected instead of included.
- [Unknown] It does not explain whether “other” costs should include shared overhead or founder labor.

Input: $12,000 total acquisition spend; 50 customers -> $240 CAC

### 4. Best SaaS Metrics

URL: [Best SaaS Metrics CAC Calculator](https://bestsaasmetrics.com/cac-calculator)

- [Observed] It asks for sales salaries and commissions, marketing and advertising, software licenses, and new paying customers.
- [Observed] Correct example: $20,000 sales + $10,000 marketing + $2,000 software over 20 customers returned $1,600 CAC.
- [Observed] Edge case: zero cost over one customer returned $0.
- [Observed] Wrong input: the cost slider minimum was zero, so a negative sales cost was clamped to zero; the customer slider minimum also prevented a zero denominator.
- [Documented] Results include cost shares and comparisons to a default ACV.
- [Documented] The page describes CAC as “under GAAP / ASC 340-40 accounting standards.” FASB’s text is about incremental contract acquisition costs, not a prescribed all-in management CAC formula.
- [Inferred] A default ACV comparison can imply a universal target even when a business has a different margin, segment, or sales motion.
- [Unknown] The page does not show a custom allocation basis for shared team costs.

Input: $20,000 sales + $10,000 marketing + $2,000 software; 20 customers -> $1,600 CAC

### 5. 4Calculators

URL: [Customer Acquisition Cost Calculator](https://4calculators.com/calculators/customer-acquisition-cost-calculator/)

- [Observed] It separates paid media, agency and creative fees, fully loaded sales and marketing salaries, software/content/events, total new customers, and paid customers.
- [Observed] Correct example: $10,000 media + $2,000 agency + $5,000 salaries + $1,000 tools over 100 customers returned $180 blended CAC. With 50 paid customers it returned $240 media-plus-agency CAC and $300 fully loaded paid CAC.
- [Observed] The fully loaded paid result adds $60 shared cost per total new customer to the $240 channel cost per paid customer.
- [Observed] Edge case: zero new and zero paid customers produced dashes for per-customer results and retained the $18,000 total spend, with a missing-denominator message.
- [Observed] Wrong input: negative media spend failed the field’s minimum of zero and the result fields changed to dashes.
- [Documented] It counts first-time paying customers and explicitly warns that paid CAC and blended CAC have different denominators. It also shows first-order gross profit after CAC.
- [Inferred] This is the most complete cost decomposition in the set, though it still treats sales and marketing salaries as one input and does not model sales-cycle lag.
- [Unknown] It does not provide a cohort spend-allocation method.

Input: $18,000 total costs; 100 total and 50 paid customers -> $180 blended, $240 paid channel, $300 fully loaded paid CAC

## Comparison

| Feature or answer | CustomerAcquisitionCostCalculator | MoneySheet | ARB Digital | Best SaaS Metrics | 4Calculators | What stack127 should do |
| --- | --- | --- | --- | --- | --- | --- |
| Cost categories | Sales and marketing plus overhead | Ads, salaries, tools, agency | Ads, salaries, tools, agency, other | Salaries, marketing, software | Media, agency, salary, tools/content/events | Separate direct costs, payroll, tools, agency, and optional shared overhead |
| Blended and paid CAC | Blended | Both, with paid-only ad view | Blended and ad-only CPA | Blended | Blended, media/agency paid CAC, fully loaded paid CAC | Show each cost pool beside its denominator |
| Paying customer definition | New customers | New and paid customer counts | New customers | New paying customers | First-time paying customers | Default to first-time paying customers |
| Allocation clarity | Several overhead drivers | Salary toggle | “Other” bucket | No allocation detail | Shared cost per total customer | Let users select and name an allocation method |
| Zero denominator | Stale prior result can remain | Dashes for some measures | CAC shows $0 plus prompt | Slider prevents zero | Dashes plus explanation | Show “not calculable” and clear any prior result |
| Sales-cycle treatment | Not shown | Not shown | Not shown | Not shown | Same-period count only | Label same-period proxy and support a cohort-aligned window |

## Where competitors disagree

“Paid CAC” may mean paid media divided by paid-sourced customers, paid media plus agency divided by paid-sourced customers, or paid cost plus some shared-cost allocation. Those are different measures, not calculation errors, if their cost pools and counts are named. A paid-channel result should not be compared with LTV as though it included every cost of acquiring a customer; Stripe identifies full sales and marketing CAC as the company-level comparison.

A same-month spend/customer ratio is a useful quick measure, but it can mismatch costs and closed customers when sales take several months. Stripe notes this timing issue. The page should preserve the quick snapshot and clearly label it; use cohort-level spend only when the user can connect spend to the customers won.

“Fully loaded” is also not a single settled allocation rule. The overhead allocation choices documented by CustomerAcquisitionCostCalculator and the shared-cost rule at 4Calculators produce different results. Show the method and cost rows instead of claiming one is universally correct.

## How stack127 can win

- Start with direct acquisition spend, then let users add payroll and commission, acquisition tools and agencies, shared overhead, and founder hours as separate rows.
- Show cash CAC and time-included CAC separately. Require an hourly value before founder hours change the result.
- Ask for reporting period, first-time paying customers, and paid-sourced customers. Keep trials, leads, and renewals out of the default denominator.
- Show blended CAC, paid media CAC, and fully loaded paid CAC with each numerator and denominator visible.
- Offer a same-calendar-period result and a cohort-aligned result. If a user has no attribution from spend to a closed cohort, label the same-period result as a proxy.
- Let the user name the allocation driver for shared salary or overhead, such as acquisition hours, headcount, or a fixed percentage. Show the selected driver in the result.
- Compare conservative, base, and upside scenarios by changing cost assumptions, sales-cycle window, or customer count. Do not grade CAC against one SaaS-wide target.
- Include a worked example for a solo founder and one for a team with a multi-month sales cycle. Explain why they produce different cost views.
- Keep the result useful without an account, data upload, or benchmark lookup.

## Blockers

Build blockers: None. No paid API, maintained dataset, login, or background job is needed for a manual calculator.

Research access: T3 preview initially opened, then its automation host became unavailable. The local headless browser fallback completed the five competitor checks. FoundStep returned a Cloudflare 521 host error, and PanCalcHub had a DNS failure during the wrong-input check; neither was counted among the five.

## Sources

- [Stripe: CAC in SaaS](https://stripe.com/resources/more/cac-in-saas), checked 2026-10-04.
- [FASB ASU 2014-09, Section A](https://storage.fasb.org/ASU%202014-09_Section%20A.pdf), checked 2026-10-04.
- [FASB Revenue Transition Resource Group Memo 23](https://storage.fasb.org/REVREC_TRG_Memo_23_Costs_to_Obtain_a_Contract.pdf), checked 2026-10-04.
- [CustomerAcquisitionCostCalculator](https://customeracquisitioncostcalculator.com/calculators/fully-loaded/), checked 2026-10-04.
- [MoneySheet CAC Calculator](https://themoneysheet.com/calculators/cac/), checked 2026-10-04.
- [ARB Digital CAC Calculator](https://arbdigital.agency/cac-calculator/), checked 2026-10-04.
- [Best SaaS Metrics CAC Calculator](https://bestsaasmetrics.com/cac-calculator), checked 2026-10-04.
- [4Calculators CAC Calculator](https://4calculators.com/calculators/customer-acquisition-cost-calculator/), checked 2026-10-04.
- [Founder discussion of true acquisition costs](https://www.reddit.com/r/SaaS/comments/1qbo2bv/what_are_your_true_customer_acquisition_costs/), checked 2026-10-04.
- [SaaS discussion of organic and paid CAC](https://www.reddit.com/r/SaaS/comments/1qbsy5f/saas-organic-channel-economics-9-cac-vs-465-paid/), checked 2026-10-04.
- [Discussion of acquisition cost and sales timing](https://www.reddit.com/r/SaaS/comments/1g63f8f/whats_your_current_cost_per_acquisition_feels/), checked 2026-10-04.
- [Founder discussion of actual acquisition costs](https://www.reddit.com/r/SaaS/comments/oo0w5w), checked 2026-10-04.
