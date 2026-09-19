# Competitive report: kdp royalty calculator

Status: ready
Tool: KDP royalty calculator
Route: `/kdp-royalty-calculator`
Direct competitors reviewed: 5
Saturation exception: yes

## Research scope

This review covers pricing decisions for paperback, hardcover, and Kindle ebooks: printing cost, royalty rate, price floors, delivery cost, ad headroom, and monthly sales targets. Queries tried: `KDP royalty calculator`, `KDP paperback printing cost calculator`, `KDP hardcover royalty`, `KDP ebook delivery fee`, and `KDP ACoS calculator`. Repeated domains: kdp.amazon.com, kindlepreneur.com, bookow.com, ingramspark.com, and publishing calculator sites. Exclusions: Expanded Distribution, non-US marketplaces, taxes and VAT, advertising platform reporting, and live price scraping. The job is established but fragmented, so the saturation exception is yes.

## Search intent

| Query job | User intent | Required answer | Current gap |
| --- | --- | --- | --- |
| Print royalty | See what remains after printing cost | Rate, cost, and royalty per sale | Older calculators use outdated 60% thresholds. |
| Minimum price | Avoid a price that loses money on print | Cost-covering price floor | Rate-band changes make a single division misleading. |
| Ebook pricing | Include file-size delivery cost | Delivery and effective rate | Delivery is often omitted or hidden. |
| Ad decision | Know maximum spend per sale | Break-even spend and ACoS | Ad calculators can lose the publishing context. |
| Monthly target | Translate income goal into unit sales | Copies at selected price | Many tools stop at per-sale royalty. |

## User pain evidence

| Repeated problem | Evidence | Product implication |
| --- | --- | --- |
| Print royalty rules changed by price bands and older calculators remain in circulation. | [Amazon print royalty rules](https://kdp.amazon.com/en_US/help/topic/G201834330); [Reddit KDP royalty search](https://www.reddit.com/r/selfpublish/search/?q=royalty%20rate&restrict_sr=1) | Version the constants and show the price band. |
| Authors forget that printing cost is deducted from the percentage royalty. | [Amazon print cost rules](https://kdp.amazon.com/en_US/help/topic/G201834340); [KDP community royalty search](https://www.kdpcommunity.com/s/search?q=printing%20cost) | Make cost and royalty separate lead-supporting values. |
| Ebook delivery cost varies with file size and affects the 70% result. | [Amazon ebook delivery rules](https://kdp.amazon.com/en_US/help/topic/G200634500); [Reddit Kindle delivery search](https://www.reddit.com/r/selfpublish/search/?q=delivery%20fee%20ebook&restrict_sr=1) | Ask for file size and expose the delivery calculation. |

## Technical truth to verify

| Claim | Authority | Build treatment |
| --- | --- | --- |
| US print royalties use 50% or 60% depending on list price and marketplace. | [Amazon print royalty rules](https://kdp.amazon.com/en_US/help/topic/G201834330) | Use the Amazon.com threshold and label the marketplace scope. |
| Printing cost is fixed plus per-page and differs by trim, interior, paper, and binding. | [Amazon print costs](https://kdp.amazon.com/en_US/help/topic/G201834340) | Use current US cost branches in a pure engine. |
| Hardcover has separate fixed and per-page costs. | [Amazon hardcover print costs](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H) | Keep hardcover cost data separate from paperback. |
| Ebook 70% royalty uses price minus delivery cost, while 35% does not deduct delivery. | [Amazon ebook delivery rules](https://kdp.amazon.com/en_US/help/topic/G200634500) | Round delivery and royalty to cents. |
| Amazon.com 70% ebook prices sit in the $2.99 to $12.99 band. | [Amazon ebook pricing](https://kdp.amazon.com/en_US/help/topic/G200634560) | Fall back to the effective 35% rate outside that band. |

## Competitor reviews

### Competitor 1: Amazon KDP royalty calculator

URL: [kdp.amazon.com/royalty-calculator](https://kdp.amazon.com/royalty-calculator)

- [Observed] The official calculator handles a royalty scenario with many publishing inputs.
- [Documented] Amazon publishes print cost and royalty rules separately from the calculator.
- [Observed] The workflow is scenario-first and does not focus on monthly targets or ad headroom.
- [Inferred] A compact planner can answer pricing comparisons faster for a known setup.
- [Unknown] The public calculator's internal data update timing is not visible as a version label.

```text
format -> trim -> pages -> price -> marketplace
                    -> royalty result
```

### Competitor 2: Kindlepreneur KDP royalty calculator

URL: [kindlepreneur.com KDP royalty calculator](https://kindlepreneur.com/kdp-royalty-calculator/)

- [Observed] The page presents a simple pricing and royalty workflow for authors.
- [Observed] It emphasizes a quick answer over a full cost receipt.
- [Documented] A third-party calculator must follow current Amazon rate rules to stay correct.
- [Inferred] Users benefit from a dated rate note and a comparison table.
- [Unknown] The public page does not make every current branch and threshold auditable.

```text
format + pages + price -> estimated royalty
```

### Competitor 3: Bookow KDP royalty calculator

URL: [bookow.com KDP royalty calculator](https://www.bookow.com/kdp-royalty-calculator/)

- [Observed] Bookow provides a focused KDP calculator with fewer visible controls.
- [Observed] The result is suitable for a single list-price check.
- [Documented] Print cost depends on more fields than a price-only form exposes.
- [Inferred] A price comparison table would reduce repeated submissions.
- [Unknown] The page does not state a revision date beside its formula.

```text
pages + format + price -> one royalty number
```

### Competitor 4: IngramSpark rate calculator

URL: [ingramspark.com rate calculator](https://www.ingramspark.com/plan-and-price/print-and-ship)

- [Observed] IngramSpark positions its calculator around a different distribution service.
- [Documented] Its print and distribution assumptions are not KDP assumptions.
- [Observed] The pricing workflow includes product and shipping context.
- [Inferred] It is useful as a contrast but should not be mixed into KDP output.
- [Unknown] A visitor can mistake cross-platform costs for KDP costs without an explicit boundary.

```text
platform -> format -> quantity / ship -> cost
KDP planner -> KDP rules only
```

### Competitor 5: Publisher Rocket keyword and book tools

URL: [publisherrocket.com](https://publisherrocket.com/)

- [Observed] Publisher Rocket focuses on market and keyword research around books.
- [Observed] Pricing is not the primary visual answer on its public product page.
- [Documented] Market research cannot replace a royalty formula.
- [Inferred] A pricing planner should avoid demand estimates and fake sales forecasts.
- [Unknown] The public product page does not expose current KDP print constants.

```text
market inputs -> demand research -> publishing decision
royalty inputs -> cost / price -> unit economics
```

## Comparison matrix

| Capability | Amazon | Kindlepreneur | Bookow | IngramSpark | Publisher Rocket | stack127 launch decision |
| --- | --- | --- | --- | --- | --- | --- |
| Paperback cost | Yes | Yes | Partial | Other platform | No | Current US branch |
| Hardcover cost | Yes | Partial | Unknown | Other platform | No | Separate branches |
| Ebook delivery fee | Yes | Partial | Unknown | No | No | File-size input |
| Current rate threshold | Yes | Unknown | Unknown | Other platform | No | Show source date |
| Minimum cost-covering price | No | Partial | Partial | Other platform | No | Compute by band |
| Price comparison | One scenario | Partial | One scenario | Quantity | No | Four-point table |
| Break-even ad spend | No | Partial | No | No | No | Royalty per sale |
| Copies for target income | No | No | No | No | No | Optional target |

## Formula and data disagreements

The most important disagreement is not arithmetic but scope. Some tools mix Amazon marketplaces, Expanded Distribution, or another printer's cost model. This planner is US Amazon.com only and excludes Expanded Distribution. Print floors are solved piecewise because the rate changes at $9.99; dividing every cost by 60% would misstate cheaper books. Ebook delivery uses the current US per-MB rule and a rounded-KB input model, with VAT excluded because the planner does not have a tax jurisdiction input.

## Evidence-backed opportunities

- Keep print and ebook branches separate while sharing the price comparison result.
- State the data date and source links next to a rate-sensitive answer.
- Explain break-even ad spend as a ceiling, not a recommended ad budget.
- Give a monthly copy count only when the user supplies a target and the royalty is positive.
- Keep Expanded Distribution out of the launch scope so the output remains auditable.

## Sources

- [KDP print costs](https://kdp.amazon.com/en_US/help/topic/G201834340), checked 2026-09-16.
- [KDP print royalties](https://kdp.amazon.com/en_US/help/topic/G201834330), checked 2026-09-16.
- [KDP hardcover costs](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H), checked 2026-09-16.
- [KDP ebook pricing](https://kdp.amazon.com/en_US/help/topic/G200634560), checked 2026-09-16.
- [KDP ebook delivery](https://kdp.amazon.com/en_US/help/topic/G200634500), checked 2026-09-16.
