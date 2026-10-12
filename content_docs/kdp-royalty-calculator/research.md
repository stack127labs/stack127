# Research: KDP Royalty Calculator

Route: `/kdp-royalty-calculator` | Checked: 2026-10-11 | Competitors used: 7 (Amazon KDP plus six independent tools)

## Who uses it

The main group is an independent author who is pricing a book or checking what one sale might earn. They usually know the format and a candidate list price. For print, many also know page count, but trim size, interior, and paper can take a lookup. For eBooks, people may know the retail price but need to find the converted file size. Community questions show confusion between a royalty, profit, tax, and production costs.

| Group | Rough share | What they already know | Their questions, in their words |
| --- | --- | --- | --- |
| Authors pricing a first or next book | Most (qualitative; no share data found) | Book format, likely price, sometimes page count | "How much do I earn on a $12.99 paperback?" "Why does a $9.98 paperback earn less than $9.99?" |
| Authors comparing formats or offers | Some (qualitative) | Candidate prices for eBook and print; may know page count and file size | "Which is better, 35% or 70%?" "What is the delivery fee?" "What is the minimum list price?" |
| Publishers planning several editions or ad spend | Few (qualitative) | Print specs, prices, target income, and perhaps ad budget | "How many sales do I need for a monthly target?" "What royalty can cover an ad sale?" |

These are qualitative groups inferred from the pages and discussions reviewed. No source found a representative share of calculator users.

- **First few seconds:** authors want a per-copy estimate at a price they can choose, and need to know whether the price is above the KDP minimum.
- **Inputs people may know offhand:** format, candidate list price, and a rough monthly sales or income target. Page count is often known for a finished book. Trim, ink, paper, eligible eBook royalty plan, converted file size, and marketplace may require checking book files or KDP settings.
- **What experienced users need:** separate estimates for each format, print cost or digital delivery deduction, minimum price, eligibility caveats, and price comparisons. Ad headroom or sales needed for a target are useful planning arithmetic, but do not equal net profit.

## Published comparison data

None found that can serve as a defensible benchmark for this tool's per-copy estimate. Royalties vary with format, list price, page count, print setup, file size, marketplace, and eligibility. Forum anecdotes mix royalties with editing, illustration, advertising, taxes, and other platforms, so they do not form a comparable range.

Amazon's KDP Select Author Earnings page showed a $69.4 million pool for August 2026 when checked. That is an aggregate Kindle Unlimited fund, not a typical per-copy royalty or a same-definition comparison, so it should not be presented as an expected earnings range. [KDP Royalty Calculator](https://kdp.amazon.com/en_US/royalty-calculator)

There is no source agreement that supports showing one "normal" royalty or profit range. Use a worked calculation as an arithmetic check, not a market benchmark.

## Scope

The defensible initial scope is a US Amazon.com estimate in USD for Kindle eBooks, paperbacks, and hardcovers. The remaining shared code in `lib/kdp/royalty.ts` and `lib/kdp/specs.ts` already models these three formats, US print costs, print thresholds, eBook delivery costs and price limits, and optional planning values for royalty margin, ad headroom, and copies for a monthly target. Its spec and royalty tables are dated `2026-09-16`. This is a source-code observation, not validation that every table is still current.

Keep "royalty" separate from profit. The calculation excludes editing, cover design, ad spend, income tax, refunds, and some KDP account conditions. It cannot guarantee KDP acceptance or the final amount in the author's account.

Searches tried:

- `KDP royalty calculator Amazon print eBook royalty calculator`
- `KDP royalty calculator Kindlepreneur Bookow Self Publishing Titans`
- `site:reddit.com/r/selfpublish KDP royalty calculator how much earn print cost 70%`
- `Amazon KDP royalty calculator questions paperback ebook royalty 60% $9.99`
- `KDP royalty calculator Bookow royalty calculation`
- `KDP royalty calculator calculator 2026 Kindle eBook paperback hardcover tool`
- `People also ask KDP royalty calculator how is paperback royalty calculated 35 70 rate`

Recurring domains and sources included Amazon KDP, KDPBook.io, SmartKDP, Kindlepreneur, Royalties HQ, BookDraft, KDP Workspace, Reddit's `r/selfpublish` and `r/KDP`, plus a search result for Self Publishing Titans. The seven tools tested below were the official calculator and six independent calculators. Google did not surface a usable People also ask panel in the search results I could inspect. The questions below come from competitor FAQs and community posts; they should not be presented as verified PAA wording.

## Search intent

| Query | What the searcher wants | Answer they need | What current results miss |
| --- | --- | --- | --- |
| KDP royalty calculator | A royalty estimate without navigating KDP help pages | Format-specific inputs, rate, deductions, and estimated amount | Results vary in supported formats, marketplace coverage, validation, and freshness. |
| KDP paperback royalty calculator | A per-copy estimate for a print setup | Rate, printing cost, royalty, and minimum price for trim, paper, ink, and pages | Some tools show only a final royalty or do not enforce KDP's minimum price. |
| How much do I earn on a $12.99 KDP paperback? | A concrete estimate for a common retail price | Print specifications and the correct 50% or 60% tier are needed too | Several pages answer with a worked example, but assumptions vary. |
| Why does a $9.98 paperback earn less than $9.99? | Explanation of the US print royalty threshold | The 50%/60% step at $9.99, plus the print cost deduction | The $0.01 boundary is easy to miss when a tool only shows the current price. |
| KDP eBook 35% or 70% royalty | Which plan applies and what the sale earns | Price, file size, marketplace, territory, and eligibility affect the answer | Some pages still give the old $9.99 upper limit for the US 70% option. |
| What is the KDP eBook delivery fee? | Why the 70% estimate differs from 70% of retail price | US delivery cost is based on converted file size and is deducted before the 70% share | A simple 35% vs 70% comparison can hide the fee and file-size input. |
| What is the lowest KDP paperback list price? | Whether a desired price can cover production | Print cost and applicable royalty tier determine the minimum | Tools that accept zero or below-floor prices may show arithmetic for an unpublishable setup. |

Competitor FAQ and forum questions also include "Does this include Kindle eBook royalties?", "What does expanded distribution pay?", "Can a royalty be negative?", and "Are royalties calculated on price with VAT?" The reviewed high-ranking pages do not all answer these together or make their exclusions equally visible.

## User problems

| Problem people repeat | Evidence link | What it means for the tool |
| --- | --- | --- |
| Confusion about whether the plan pays 35% or 70%, and what costs are deducted | [First-time author asks how to choose KDP royalties](https://www.reddit.com/r/selfpublish/comments/1jdp9va/can_someone_help_me_on_how_to_choose_royalities/) | Show the actual rate and deduction in the estimate; explain that eligibility and marketplace matter. Treat Reddit advice as anecdotal and potentially stale. |
| "Normal profit margin" questions mix KDP royalty with expenses and other channels | [Authors compare how much they make per book](https://www.reddit.com/r/selfpublish/comments/1d8ut3t/how_much_do_you_make_per_book/) | Label the output as an estimated KDP royalty. Do not call it profit or use individual replies as an earnings benchmark. |
| Long books can have a minimum list price above the price an author hoped to charge | [Pricing a long paperback on KDP](https://www.reddit.com/r/selfpublish/comments/1g2u9d5/pricing_on_kdp/) | Make the print-cost floor and retail-price decision separate. A floor calculation cannot establish what readers will pay. |
| New authors ask whether "royalty" means profit after tax and why they would pick 35% or 70% | [Questions about KDP royalties and pay](https://www.reddit.com/r/KDP/comments/1impxag/royalties_and_pay/) | Define royalty narrowly and state the exclusions near the answer. Avoid implying tax or net income is included. |

These discussions are dated and self-selected. They are evidence of the questions people ask, not measures of how common each problem is.

## Facts to get right

| Fact | Primary source | How the tool should treat it |
| --- | --- | --- |
| US paperback royalty is 50% below $9.99 and 60% at or above $9.99; standard formula is rate times list price minus print cost. | [Paperback Royalty](https://kdp.amazon.com/en_US/help/topic/G201834330) | Apply the US threshold at the exact cent boundary and show the print cost deduction. |
| US hardcover uses the same $9.99 threshold and 50%/60% tiers, with print cost deducted. | [Hardcover Royalty](https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS) | Keep hardcover separate from paperback print-cost inputs. |
| Amazon.com print list prices have a $250 maximum; the minimum depends on print cost and royalty tier. | [Paperback Royalty](https://kdp.amazon.com/en_US/help/topic/G201834330), [Hardcover Royalty](https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS) | Enforce the price bounds. Explain that the minimum is a platform floor, not a recommended market price. |
| Print cost is a fixed amount plus page count times per-page cost, with cost tables varying by marketplace, trim, ink, paper, binding, and page count. | [Paperback Printing Cost](https://kdp.amazon.com/en_US/help/topic/G201834340), [Hardcover Printing Cost](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H) | Use the matching dated table and validate supported page/spec combinations. Example: US 6x9, black-and-white, white-paper paperback at 200 pages costs $3.40 under the current table. |
| Expanded Distribution pays 40% of the list price effective in its sales channel, minus printing costs, applicable taxes, and withholding. KDP says the Expanded Distribution minimum differs, but its public help pages do not give a separate 40% minimum-price formula. The paperback printing-cost page gives the standard minimum formula as printing cost divided by the applicable 50% or 60% rate. | [Expanded Distribution](https://kdp.amazon.com/en_US/help/topic/GQTT4W3T5AYK7L45), [Paperback Printing Cost](https://kdp.amazon.com/en_US/help/topic/G201834340), [Print Book Pricing Page](https://kdp.amazon.com/en_US/help/topic/G8BKPU9AGVZSF9QF), [Official KDP calculator](https://kdp.amazon.com/en_US/royalty-calculator) | Treat printing cost divided by 40% as a math-derived break-even point before taxes and withholding, not a KDP-published minimum rule. The ED help page tells authors to check the KDP Rights & Pricing grid for its estimated royalty. The exact ED minimum remains unconfirmed from public help pages. |
| Groundwood is a current Amazon.com paperback paper option for black ink. The US page limits are 24 to 812 pages for 5x8, 5.06x7.81, 5.25x8, 5.5x8.5, 6x9, 6.14x9.21, 6.69x9.61, 7x10, 7.44x9.69, 7.5x9.25, and 8x10; 24 to 784 for 8.25x6 and 8.25x8.25; 24 to 764 for 8.27x11.69; 24 to 578 for 8.5x8.5 and 8.5x11. Manuscript page counts round up to an even number. | [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950), [Paperback Printing Cost](https://kdp.amazon.com/en_US/help/topic/G201834340) | Keep groundwood limited to black ink and validate the maximum for the selected trim. `lib/kdp/specs.ts` matches these US limits and exposes groundwood only for black-and-white paperback interiors. |
| US hardcover printing costs are fixed plus per page. Black ink costs $6.80 fixed for regular trim or $7.49 for large trim at 75 to 108 pages. At 110 to 550 pages, they are $5.65 fixed plus $0.012 per page for regular trim or $0.017 for large trim. Premium color at 75 to 550 pages is $5.65 fixed plus $0.065 per page regular or $0.080 large. KDP's hardcover page range is 75 to 550 pages. | [Hardcover Printing Cost](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H), [Hardcover options and page limits](https://kdp.amazon.com/en_US/help/topic/GAVW3FZZAKA2KY3B) | `lib/kdp/royalty.ts` uses these US rates and cutoffs. `lib/kdp/specs.ts` supports five hardcover trim sizes and sets the 75 to 550 page range. The rates, large-trim treatment, and limits match the current KDP pages reviewed. |
| The eBook 35% plan pays 35% of list price less applicable VAT; it has no delivery charge. The 70% plan deducts applicable VAT and delivery costs before applying 70%. | [Digital Book Pricing](https://kdp.amazon.com/en_US/help/topic/G200634500) | Show the selected/effective rate and deduction. Do not describe 70% as 70% of the full retail price. |
| For US sales, the eBook delivery rate is $0.15/MB. KDP bases it on converted file size rounded up to the nearest KB, with a $0.01 minimum. | [Digital Book Pricing](https://kdp.amazon.com/en_US/help/topic/G200634500) | Use converted file size as an estimate input and explain that the uploaded source file size may differ. The shared model rounds MB upward to KB. |
| Effective July 7, 2026, the US 70% eBook price band is $2.99 to $12.99. The 35% minimum is $0.99 below 3 MB, $1.99 from 3 MB to under 10 MB, and $2.99 at 10 MB or higher. eBook maximum list price is $200. | [eBook List Price Requirements](https://kdp.amazon.com/en_US/help/topic/G200634560) | Keep the US 70% ceiling current at $12.99; use the size-based minimum for the 35% plan and the maximum. Add a checked date to the rule source. |
| 70% eligibility depends on more than price, including territory and content/account conditions. KDP notes a requirement that the eBook price be at least 20% below the print edition in certain cases; price matching and promotions can also affect realized royalties. | [Digital Book Pricing](https://kdp.amazon.com/en_US/help/topic/G200634500), [eBook List Price Requirements](https://kdp.amazon.com/en_US/help/topic/G200634560) | Treat a calculator result as conditional. It cannot establish account or book eligibility, and actual reported earnings can differ. |
| The official KDP print calculator estimates paperback and hardcover printing cost, minimum list price, and royalty; it does not estimate Expanded Distribution. | [Official KDP calculator](https://kdp.amazon.com/en_US/royalty-calculator) | Link to the official source for final verification and disclose the channel limitation. |
| The existing shared tables use rule version `2026-09-16`; code includes US formulas, eBook threshold points, print minimums, and print page limits. | `lib/kdp/royalty.ts`, `lib/kdp/specs.ts` | Treat this as current repository behavior, not an official rule citation. Recheck the official sources before reusing or changing the tables. |

KDP explicitly says paperback manuscript page counts round up to an even number. `lib/kdp/royalty.ts` and the shared setup calculations apply this rule before checking print page limits and cost.

Code comparison for these checks: no groundwood page-limit or hardcover cost-table discrepancy was found. The shared royalty engine calculates standard Amazon print royalties; it does not implement Expanded Distribution. KDP does not confirm `printing cost / 40%` as the ED minimum-price formula in the public help pages reviewed. To confirm the actual ED minimum for a title, use its KDP Rights & Pricing grid.

## Competitor reviews

### 1. Amazon KDP Printing Costs and Royalty Calculator

URL: [kdp.amazon.com/en_US/royalty-calculator](https://kdp.amazon.com/en_US/royalty-calculator)

- **Observed** It asks for book type, interior, trim, marketplace, page count, and list price. Its print result table shows marketplace, list price, royalty rate, minimum list price, printing cost, and estimated royalty.
- **Observed** Correct case: 200-page 6x9 black-and-white paperback at $12.99 returned $4.39 with $3.40 printing cost. Edge case: $9.98 returned the 50% tier and $1.59. Wrong input: $0 was rejected with "List price can't be 0 or empty."
- **Documented** The page supports paperback and hardcover, many marketplaces, and says figures are estimates. It explicitly excludes Expanded Distribution estimates.
- **Inferred** This is the reference source users can trust for print inputs, but its public calculator does not cover eBooks, so users need another page for the full KDP set.
- **Unknown** I did not verify every marketplace and binding combination.

```text
200 pages, 6x9, black-and-white paperback, $12.99 -> $4.39 royalty
$9.98 -> $1.59 at 50%; $0 -> price validation error
```

### 2. KDPBook.io

URL: [kdpbook.io/kdp/royalty-calculator](https://kdpbook.io/kdp/royalty-calculator)

- **Observed** It has paperback, hardcover, and eBook modes; marketplace options; print specifications; and an Expanded Distribution option for paperback. Print results show a cost breakdown, minimum price, royalty, and nearby price comparisons.
- **Observed** Correct case: 200-page 6x9 black-and-white paperback at $12.99 returned $4.39 and $3.40 print cost. Edge case: $9.98 returned $1.59 at 50%; 201 pages was treated as 202. Wrong input: $0 produced a visible "Enter a list price above 0" validation message.
- **Documented** The site displays source/update dates in September and October 2026 and its eBook section shows a $12.99 upper bound for the US 70% plan.
- **Inferred** Its multiple-format, source-dated presentation is a strong competitor; it gives users more public market coverage than the current US-focused shared engine.
- **Unknown** I did not validate every marketplace's rates or every Expanded Distribution case against KDP.

```text
200 pages, 6x9 paperback, $12.99 -> $4.39
$9.98 -> $1.59; 201 pages -> 202; $0 -> validation error
```

### 3. SmartKDP

URL: [smartkdp.com/tools/kdp-royalty-calculator](https://smartkdp.com/tools/kdp-royalty-calculator)

- **Observed** It supports paperback, hardcover, and Kindle eBook, with multiple Amazon marketplaces, print costs, minimums, margin, and an Expanded Distribution option. It also shows a worked example and a market comparison table.
- **Observed** Correct case: a 200-page 6x9 black-and-white paperback at $12.99 returned $4.39. Edge case: $9.98 returned $1.59. Wrong input: $0 returned a negative $3.40 amount and a "Below break-even" status instead of rejecting a price below KDP's $6.80 floor.
- **Documented** Its page says tables were checked July 22, 2026.
- **Inferred** Accepting zero can confuse equation output with an allowed KDP list price. The tool's coverage and dated table are useful strengths, but users still need to distinguish a modeled number from a publishable price.
- **Unknown** I did not independently verify all listed marketplace tables or every eBook condition.

```text
200 pages, 6x9 paperback, $12.99 -> $4.39
$9.98 -> $1.59; $0 -> -$3.40 and "Below break-even"
```

### 4. Kindlepreneur KDP Royalty Calculator

URL: [kindlepreneur.com/kdp-royalty-calculator](https://kindlepreneur.com/kdp-royalty-calculator/)

- **Observed** It offers eBook, paperback, and hardback inputs, including royalty plan, marketplace, price, eBook file size, or print details. The displayed result emphasizes effective royalty rate and a graph; an exact dollar result was not available as readable text in the test.
- **Observed** Correct eBook case: $4.99, 5 MB, and 70% showed an effective rate of 59%, consistent with subtracting a $0.75 delivery charge before applying 70%. Edge paperback case: $9.98 showed an effective rate of 16%, consistent with $1.59 on $9.98. Wrong input: $0 showed "--" rather than a result.
- **Documented** The page's guidance says the US 70% price band ends at $9.99. That ceiling became stale after KDP's July 7, 2026 increase to $12.99.
- **Inferred** It is useful for comparing formats, but a rate-focused result is less direct for people asking "how many dollars do I earn?"
- **Unknown** I could not confirm exact displayed dollar amounts from the accessible result text or test every print setting.

```text
$4.99 eBook, 5 MB, 70% -> 59% effective rate
$9.98 paperback -> 16% effective rate; $0 -> "--"
```

### 5. Royalties HQ

URL: [royaltieshq.com/kdp-royalty-calculator](https://royaltieshq.com/kdp-royalty-calculator/)

- **Observed** It has eBook, paperback, and hardcover tabs and estimates per-sale plus total royalties for a chosen copy count. The print model says it assumes regular trim.
- **Observed** Correct eBook case: $4.99, 2 MB, 70%, and 100 sales returned $0.30 delivery, $3.28 per sale, and $328.30 total. Edge case: $12.99 was forced to 35% and returned $4.55 per sale. Wrong input: $0 returned $0 with no visible validation.
- **Documented** Its page says the 70% maximum is $9.99 and carries an April 13, 2026 checked date. Both are out of date for the US after the official July 7 increase.
- **Inferred** The copy-count estimate is useful for planning, but an old cap can understate eligible eBook earnings for a $10 to $12.99 price.
- **Unknown** I did not test all print settings or verify its formulas for other marketplaces.

```text
$4.99 eBook, 2 MB, 70%, 100 copies -> $3.28 each; $328.30 total
$12.99 -> forced to 35%; $0 -> $0 with no visible validation
```

### 6. BookDraft KDP Royalty Calculator

URL: [bookdraft.co/tools/kdp-royalty-calculator](https://bookdraft.co/tools/kdp-royalty-calculator)

- **Observed** It covers Amazon.com paperback and eBook estimates, explains the formula, and shows a minimum print price and examples. It also has an Expanded Distribution selection for paperback.
- **Observed** Correct case: 200-page 6x9 black-and-white paperback at $12.99 returned $4.39 and a $6.80 minimum. Edge case: $9.98 returned $1.59. Wrong input: at $0 the result section disappeared, with no visible input error in the test.
- **Documented** The page was updated October 6, 2026 and uses the current $12.99 eBook band. Its stated scope is Amazon.com/USD; it does not include hardcover.
- **Inferred** Its worked examples and formula explanation help readers audit the estimate. Users pricing a hardcover or another marketplace need a different calculator.
- **Unknown** I did not verify the eBook estimate against an account-specific KDP case.

```text
200 pages, 6x9 paperback, $12.99 -> $4.39; minimum $6.80
$9.98 -> $1.59; $0 -> result disappears
```

### 7. KDP Workspace Guide

URL: [kdpworkspace.com/guides/royalty-calculator](https://kdpworkspace.com/guides/royalty-calculator/)

- **Observed** This is a US paperback calculator with page count, paper, trim, and list price. It returns a royalty estimate and explains the formula. The guide points readers to a separate full calculator for other marketplaces.
- **Observed** Correct case: 200-page black-and-white paperback at $12.99 returned $4.39. Edge case: $9.98 returned $1.59 at 50%. Wrong input: $0 returned negative $3.40 without enforcing the $6.80 minimum.
- **Documented** Its page is limited to US paperback estimates; it does not calculate hardcover or eBook royalties.
- **Inferred** The small scope keeps the estimate simple, but users with multiple formats must leave the page. A below-floor result needs clearer distinction from an allowed KDP price.
- **Unknown** I did not test the guide's separate full calculator.

```text
200 pages, 6x9 paperback, $12.99 -> $4.39
$9.98 -> $1.59; $0 -> -$3.40
```

## Comparison

| Feature or answer | Amazon KDP | KDPBook.io | SmartKDP | Kindlepreneur | Royalties HQ | BookDraft | KDP Workspace | What stack127 should do |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| eBook, paperback, hardcover | Print only | Yes | Yes | Yes | Yes | eBook and paperback | Paperback only | Match the three formats covered by shared KDP code. |
| Marketplace coverage | Many print marketplaces | Many | Many | Several | Several | US only | US only | State the supported US scope clearly unless rules are researched and modeled for other marketplaces. |
| US eBook $12.99 70% ceiling | Not an eBook tool | Current | Current in page | Stale at $9.99 | Stale at $9.99 | Current | Not an eBook tool | Use the July 7, 2026 official limit and date the source data. |
| Cost detail | Print cost and minimum | Cost breakdown | Cost and minimum | Effective rate and graph | Delivery plus royalty | Formula and minimum | Formula | Make the amount and its deduction auditable. |
| Below-floor or zero price | Rejects zero | Rejects zero | Calculates negative | Shows no result | Returns zero | Hides result | Shows negative | Keep invalid prices distinct from valid royalties. |
| Expanded Distribution | Excluded | Paperback option | Option | Not confirmed | Not confirmed | Paperback option | Not included | Do not suggest the US standard-channel answer covers it. |
| Price/target planning | No eBook or target model | Price comparisons | Market comparison | Graph | Copy-count total | Worked examples | Single estimate | Explain planning arithmetic and keep it separate from profit. |

## Where competitors disagree

The biggest live disagreement is the US eBook 70% ceiling. KDP's official price rules raised it from $9.99 to $12.99 effective July 7, 2026. Royalties HQ's page states the old $9.99 ceiling and was checked April 13; Kindlepreneur also states $9.99. KDPBook.io, SmartKDP, and BookDraft show the current upper bound. The official KDP date and current help page control. [KDP eBook List Price Requirements](https://kdp.amazon.com/en_US/help/topic/G200634560)

Invalid-price behavior also differs. SmartKDP and KDP Workspace show a negative amount at zero, while the official KDP calculator and KDPBook.io reject zero. A negative formula result does not mean KDP accepts that list price or charges the author. For a print book, the tool should enforce the minimum list price derived from print cost and the applicable royalty rate.

The word "royalty" is also used loosely in forum replies and competitor copy. KDP's royalty formula is a platform payout estimate before the author's publishing expenses and tax position. A per-sale royalty should not be relabeled as profit or take-home income.

## How stack127 can win

- Cover the three KDP formats the shared engine already supports in one US-focused estimate, and make it clear that the calculation is for Amazon.com in USD.
- Make the result auditable: state the selected rate, print cost or delivery deduction, and estimated royalty. Include worked values around the exact $9.98/$9.99 print boundary and the current $12.99 eBook upper limit.
- Keep the KDP list-price floor separate from a suggested retail price. Reject invalid or below-floor print prices instead of showing negative earnings as though the setup could be published.
- Explain the difference between a royalty and profit. Be explicit about what is not included: production and marketing expenses, taxes, Expanded Distribution, and account-specific eligibility.
- Keep a dated source ledger for the shared rules. The search results show that some competitor pages retain old price bands after policy changes; users benefit from seeing when the rules were checked.
- Answer the questions that lead to support confusion: why print royalty changes by one cent at $9.99, why eBook 70% is reduced by delivery cost, why an eBook may be limited to 35%, and why the minimum print price may be higher than the author's intended price.
- Avoid claiming typical earnings. No comparable public dataset supports such a range.

The market is crowded: official KDP is authoritative for print, and several third-party tools already cover multiple formats, examples, or price comparisons. A credible edge is current US rules, clear assumptions, and reliable handling of price boundaries rather than adding a broader marketplace claim without verifying those rules.

## Blockers

None. Public KDP help pages are sufficient for the rules in the current US scope. Keep source dates current as Amazon changes rules; no paid API or outside dataset is needed.

## Sources

- [Paperback Royalty](https://kdp.amazon.com/en_US/help/topic/G201834330), checked 2026-10-11.
- [Paperback Printing Cost](https://kdp.amazon.com/en_US/help/topic/G201834340), checked 2026-10-11.
- [Expanded Distribution](https://kdp.amazon.com/en_US/help/topic/GQTT4W3T5AYK7L45), checked 2026-10-11.
- [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950), checked 2026-10-11.
- [Hardcover Royalty](https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS), checked 2026-10-11.
- [Hardcover Printing Cost](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H), checked 2026-10-11.
- [Hardcover options and page limits](https://kdp.amazon.com/en_US/help/topic/GAVW3FZZAKA2KY3B), checked 2026-10-11.
- [Print Book Pricing Page](https://kdp.amazon.com/en_US/help/topic/G8BKPU9AGVZSF9QF), checked 2026-10-11.
- [Digital Book Pricing](https://kdp.amazon.com/en_US/help/topic/G200634500), checked 2026-10-11.
- [eBook List Price Requirements](https://kdp.amazon.com/en_US/help/topic/G200634560), checked 2026-10-11.
- [Official KDP Printing Costs and Royalty Calculator](https://kdp.amazon.com/en_US/royalty-calculator), interacted with 2026-10-11.
- [KDPBook.io calculator](https://kdpbook.io/kdp/royalty-calculator), interacted with 2026-10-11.
- [SmartKDP calculator](https://smartkdp.com/tools/kdp-royalty-calculator), interacted with 2026-10-11.
- [Kindlepreneur calculator](https://kindlepreneur.com/kdp-royalty-calculator/), interacted with 2026-10-11.
- [Royalties HQ calculator](https://royaltieshq.com/kdp-royalty-calculator/), interacted with 2026-10-11.
- [BookDraft calculator](https://bookdraft.co/tools/kdp-royalty-calculator), interacted with 2026-10-11.
- [KDP Workspace Guide calculator](https://kdpworkspace.com/guides/royalty-calculator/), interacted with 2026-10-11.
- [Reddit: choosing KDP royalties](https://www.reddit.com/r/selfpublish/comments/1jdp9va/can_someone_help_me_on_how_to_choose_royalities/), checked 2026-10-11.
- [Reddit: earnings per book](https://www.reddit.com/r/selfpublish/comments/1d8ut3t/how_much_do_you_make_per_book/), checked 2026-10-11.
- [Reddit: pricing on KDP](https://www.reddit.com/r/selfpublish/comments/1g2u9d5/pricing_on_kdp/), checked 2026-10-11.
- [Reddit: royalties and payment](https://www.reddit.com/r/KDP/comments/1impxag/royalties_and_pay/), checked 2026-10-11.
