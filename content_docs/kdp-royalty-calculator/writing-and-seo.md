# Writing and SEO plan: KDP royalty calculator

Status: ready
Feasibility: feasible
Content review: 2026-09-19
Acceptance path: Main-agent review, then the retained Astra writing session; Luna integrates only accepted words.
Tool: KDP royalty calculator
Route: `/kdp-royalty-calculator`
Depends on: `competitive-report.md`, `implementation-report.md`, `interface-contract.md`, `edge-cases-and-tests.md`, `brief.md`
SERP checked: 2026-09-16
Primary medium: Tool UI
Content depth: The tool answers the selected-price economics first. Supporting copy explains the formula branches, how to read the price floor and derived values, the local estimate boundary, and what to verify in KDP. It stops before demand forecasting, tax accounting, publishing guidance, or KDP submission advice.

## Search intent

| Priority | Query family | Immediate job | Expected result shape | Page response |
| --- | --- | --- | --- | --- |
| Primary | `KDP royalty calculator` | Estimate what a US Amazon.com paperback, hardcover, or Kindle eBook sale leaves after the applicable KDP deduction. | A scenario form followed by royalty per sale, cost receipt, price floor, and rate-aware comparison. | The tool UI leads. COPY-01 introduces the estimate and its fixed US scope. |
| Secondary | `KDP paperback royalty calculator`, `KDP hardcover royalty calculator` | Check print cost, the 50% or 60% rate, and the minimum cost-covering price. | Print inputs and a comparison table at the floor, selected price, and $9.98 or $9.99 boundary. | The print branch and COPY-02 explain the rate band and cost receipt. |
| Secondary | `KDP ebook royalty calculator`, `KDP ebook delivery fee calculator` | Check the 35% or 70% result after file-size delivery cost and price-band rules. | eBook inputs, effective rate, delivery cost, and a warning when a selected 70% option falls back to 35%. | The eBook branch, COPY-02, and the result details explain the boundary. |
| Secondary | `KDP minimum price calculator` | Find a price that covers the modeled KDP printing cost or eBook floor. | A minimum valid price with the exact rate-band logic visible in the comparison. | The price floor result and COPY-03 explain that this is a cost-covering floor, not a recommendation. |
| Secondary | `KDP royalty calculator monthly target` | Turn a positive royalty per sale into the number of copies needed for a chosen monthly amount. | Optional target input and ceiling copy count. | The monthly target region and COPY-03 explain unit math without forecasting demand. |

### Search check record

- Search backend: web connector.
- Search engines: not individually available through the connector.
- Queries checked: `KDP royalty calculator`, `KDP paperback printing cost calculator`, `KDP ebook royalty calculator delivery fee`, and `KDP royalty calculator monthly income target`.
- Result shape: Amazon's official printing-cost and royalty pages appear for the broad and print queries. Third-party calculators appear for quick single-scenario estimates. eBook results surface delivery-cost documentation and rate-band explanations. The monthly-target query is adjacent intent, not the main page job.
- Browser backend: blocked. Standalone Playwright 1.60.0 was installed, but Chromium launch failed with `sandbox_host_linux.cc:41: FATAL: Check failed. . shutdown: Operation not permitted (1)`. No direct-page Browser QA is claimed. The search check uses the connector results and the ready competitive report's source review.
- Viewport requested for the blocked direct-page check: 1440 x 900.

### Intent not targeted

- `KDP sales forecast`, `KDP ranking calculator`, `Kindle Unlimited earnings calculator`, and ad performance forecasting: the implementation has no demand, ranking, KU, or campaign data.
- Non-US marketplace, VAT, GST, withholding-tax, price-matching, promotional, refund, or Expanded Distribution queries: those inputs and formulas are outside the launch contract.
- `Will KDP accept my book?`: this tool checks local arithmetic against a versioned US rule set. It does not submit a title, inspect files or metadata, or check KDP acceptance.

## Page promise

Use a US Amazon.com KDP scenario to estimate royalty per sale, the cost or delivery deduction behind it, the minimum modeled price, break-even ad headroom, and optional monthly copies. The result is a local estimate and rules check, not a guarantee of what KDP will report for every order and not a KDP acceptance check.

Reading flow: The author chooses a format and enters only its relevant inputs. The result leads with one royalty value, then shows the receipt, floor and margin, exact boundary comparisons, ad ceiling, and optional target math. Supporting copy explains why print and eBook branches differ, then names the exclusions and the KDP checks that still belong in the real publishing workflow.

## Content completeness map

| User question | Where answered | Medium | Evidence | Repetition guard |
| --- | --- | --- | --- | --- |
| What is the tool and who is it for? | COPY-01 after the tool introduction | Sentences | `brief.md`; implementation report product decision | Name the self-publishing author and the US Amazon.com pricing task once. Do not restate the result value. |
| Which inputs, modes, units, sources, or scope choices matter? | Active scenario form and COPY-02 | Tool UI plus Sentences | Interface input contract; implementation inputs and normalization | Let conditional controls carry the inventory. Explain only why format, pages or file size, price, and royalty option change the branch. |
| How should someone choose meaningful inputs and use it for the real task? | Scenario form, result receipt, and COPY-02 | Tool UI plus Sentences | Brief; interface user task and input contract | Explain representative inputs and boundary checks, not ordinary button operation. |
| How should the result and its important terms or uncertainty be interpreted? | Result regions and COPY-03 | Tool UI plus Sentences | Interface result contract; implementation assumptions | The UI owns exact values. Copy explains floor, margin, ad ceiling, and target math without repeating the table. |
| Which concepts or edge cases commonly surprise users? | Rate-aware comparison, eBook fallback warning, odd-page receipt note, and COPY-02 | Table plus Sentences | Edge cases FF-002, FF-003, FF-009, FF-011 | Explain why the boundary changes the answer. Do not list every fixture or duplicate table rows in prose. |
| What does the tool not inspect, calculate, prove, recommend, or guarantee? | COPY-04 | Sentences | Implementation non-goals and assumptions | State exclusions beside the claim they limit. Do not turn limitations into a large warning panel. |
| How are user inputs handled? | COPY-04 or COPY-05, beside the scope note | Sentences | Implementation accessibility, privacy, and performance plan; edge cases EC-029 and EC-030 | Say that calculation is local and that v1 does not send inputs to a server, store them, or add them to analytics. Do not promise broader privacy properties. |
| What should the reader verify or do next? | COPY-05 and calculation details | Sentences plus Tool UI | Official KDP sources; implementation source date and version | Point readers to the current KDP rules and their own KDP workflow. Do not say the tool checks acceptance or replaces KDP. |

## Heading and media outline

| Order | Level and proposed heading | User question | Takeaway, not draft prose | Medium | Evidence | Limit/repetition guard | Writer section ID |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | H1: KDP royalty calculator for US print books and eBooks | What does this tool calculate? | The page names the formats and the selected-sale answer. The workbench comes before supporting explanation. | Tool UI | `brief.md`; interface user task | The H1 must not promise profit, demand, or KDP acceptance. | n/a |
| 2 | Result lead: Royalty per sale | What does one selected-price sale leave under this scenario? | Show one dominant USD royalty with the effective rate and format. | Tool UI | Interface result contract; implementation R13 | This is the primary answer. Do not add a second standalone royalty metric. | n/a |
| 3 | Result details: Cost receipt and price floor | What KDP deduction produced the result, and what price covers it? | Keep exact fixed, page, printing, or delivery cost beside the minimum modeled price and margin. | Tool UI | Interface result contract; formula contract | The receipt owns cost components. The floor is not a price recommendation. | n/a |
| 4 | Result details: Price comparison | Which exact price boundaries change the answer? | Compare unique valid rows at the floor, selected price, and relevant print or eBook boundaries. | Table | Implementation comparison equation; edge cases FF-011 | No chart, timeline, cards, or paragraph may repeat the rows. | n/a |
| 5 | Result details: Ad headroom and monthly target | What can one sale absorb, and how many copies meet my target? | Show maximum break-even spend and ACoS when royalty is positive. Show optional ceiling copies only when a target is entered. | Tool UI | Interface result contract; edge cases FF-010 and FF-013 | Call ad spend a ceiling, not a budget recommendation. Do not call target copies a forecast. | n/a |
| 6 | H2: What does this KDP royalty calculator estimate? | Who is this for, and what answer should appear first? | Identify the self-publishing pricing task, the three formats, and the local US Amazon.com estimate before the supporting explanation. | Sentences | COPY-01; brief and implementation product decision | Cue the tool without listing every input or promising KDP acceptance. | COPY-01 |
| 7 | H2: How KDP royalty is calculated for print books and eBooks | Why do the print and eBook answers use different deductions? | Explain list price times the effective rate, then the print cost or eligible eBook delivery deduction. Tie the explanation to the active result. | Sentences | COPY-02; official KDP cost and royalty sources | Do not restate exact comparison values or narrate the form controls. | COPY-02 |
| 8 | H2: How to read the price floor, ad headroom, and monthly target | What do the supporting numbers mean? | Explain cost coverage, the zero-or-negative royalty boundary, and ceiling unit math. | Sentences | COPY-03; implementation assumptions and partial states | Do not recommend a price, ad budget, or sales target. | COPY-03 |
| 9 | H2: What this local KDP estimate does not cover | What should this number not be mistaken for? | Separate royalty math from author profit, taxes, refunds, promotions, price matching, demand, and KDP acceptance. | Sentences | COPY-04; implementation non-goals | Keep the limitation connected to the result. Do not add unsupported guarantees. | COPY-04 |
| 10 | H2: What to verify in KDP before you price or publish | What should I check after using the calculator? | Use the dated official sources and the actual KDP title workflow for the final decision. | Sentences | COPY-05; official KDP sources; source date in implementation report | Say the tool checks a local versioned rule set. Do not imply submission, approval, or live price scraping. | COPY-05 |
| 11 | Calculation details disclosure | Which rule set and sources support this result? | Keep formula version, source date, Amazon.com and USD scope, standard-distribution boundary, and official links after the economics. | Tool UI | Interface calculation-details contract; implementation source ledger | One quiet evidence region. Do not turn sources into result cards or repeat the lead. | n/a |
| Usage | H2: Use the tool for your task | Which inputs should I bring, and what should I do with the outcome? | Use the closed Usage Markdown handoff below. | Sentences | Accepted technical artifacts and route behavior | Explain meaningful choices and next action; no button narration or duplicate live results. | COPY-06 |

No marker art, clean chart, or screenshot is planned. The tool's exact comparison table carries repeated numbers more clearly than invented geometry. A screenshot would only be useful after a real published interface exists and would not explain the formula.

## Formula explanation

| Concept | What the reader needs | Presentation | Example/source | Caveat placement |
| --- | --- | --- | --- | --- |
| Print royalty | For paperback and hardcover, the modeled royalty is `effective rate x list price - printing cost`. Amazon.com print rates are 50% through $9.98 and 60% from $9.99. | Short connected explanation beside the result, with the exact rate and cost left to the receipt and table. | Implementation formula contract; [KDP print royalty rules](https://kdp.amazon.com/en_US/help/topic/G201834330) | State the rate boundary beside the explanation. |
| Print cost | Fixed and per-page costs depend on binding, trim class, interior profile, and normalized even page count. | Explain the cost drivers once. Let the receipt show fixed cost, page cost, and total where applicable. | Implementation formula contract; [KDP paperback printing costs](https://kdp.amazon.com/en_US/help/topic/G201834340); [KDP hardcover printing costs](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H) | Explain odd-page rounding beside the effective-page detail, not in a repeated formula block. |
| Print price floor | The floor is solved by rate band. Try the 50% cost-covering price first; if it crosses $9.98, solve in the 60% band and clamp to $9.99. | Explain the piecewise decision in COPY-02 or COPY-03. Show the resulting floor in the UI. | Implementation formula contract; FF-007; [KDP price guidance](https://kdp.amazon.com/en_US/help/topic/G200641280) | Call it the minimum modeled price, not the right price or a recommendation. |
| eBook delivery and rate | An eligible 70% eBook uses `70% x (list price - delivery cost)`. Delivery uses the rounded-up file size and the versioned US rate, with a $0.01 minimum. The 35% equation does not subtract delivery. | Use the eBook receipt and one explanatory sentence. | Implementation formula contract; [KDP digital book pricing](https://kdp.amazon.com/en_US/help/topic/G200634500) | Place the 70% band warning beside the result when the selected price is outside $2.99 to $12.99 and the tool falls back to 35%. |
| eBook price floor | The 35% floor changes with file size: $0.99 below 3 MB, $1.99 from 3 MB to less than 10 MB, and $2.99 at 10 MB or more. The 70% floor is $2.99. | State the bands only where a reader needs to understand a validation message or floor. | Implementation formula contract; [KDP eBook list price requirements](https://kdp.amazon.com/en_US/help/topic/G200634560) | Keep the exact floor with the invalid-input recovery. Do not imply that a floor predicts demand. |
| Ad headroom and target math | Maximum break-even ad spend equals positive royalty per sale. Break-even ACoS is royalty divided by list price. Copies for a target use ceiling division of target cents by displayed royalty cents. | Explain as derived unit math after the table. | Interface result contract; FF-010 and FF-013 | If royalty is zero or negative, show no positive headroom, omit ACoS, and make a positive target unknown. |
| Rounding and provenance | Money displays to two decimals, rates to whole percentages, and margin or ACoS to one decimal place. The answer uses `kdp-us-amazon-com-2026-09-16-v1` and the source date shown by the tool. | Put the version and date in calculation details. | Implementation rounding and versioning; FF-012 | Say the source date identifies the local rule set. It is not a live KDP response. |

## Metadata proposal

- Registry label: `kdp royalty calculator`
- Meta title: `KDP royalty calculator for US print books and eBooks`
- Meta description: `Estimate US KDP royalty per sale for a paperback, hardcover, or eBook. Compare rate bands, printing or delivery costs, price floors, ad headroom, and monthly copies. Local estimate, not KDP acceptance.`
- Page type: `WebPage`
- Publication recommendation: `Unpublished until separately approved. This content stage must not add a registry row, change publication state, or make the route indexable.`

These are central-registry proposals. They are not instructions to add route-local metadata, canonicals, robots rules, sitemap logic, or JSON-LD.

## Internal links

Related KDP tools exist in the route inventory but remain unpublished. The conditional paths below can become links only after their exact registry routes are published. Do not publish a destination as part of content integration.

| Direction | Destination | Reader reason | Anchor intent | Placement |
| --- | --- | --- | --- | --- |
| Outgoing, conditional | `/kdp-book-setup-calculator` | Prepare print dimensions after choosing a format and page count. | `KDP book setup calculator` | Final next-step section, only after publication. |
| Outgoing, conditional | `/kdp-page-count-estimator` | Estimate a paperback page range before the final PDF exists. | `KDP page count estimator` | Input preparation, only after publication; estimated pages are not final print pricing evidence. |

The official KDP links in the source ledger are outbound evidence links, not internal links.

## Manual prose handoff

### Sections reserved for later manual writing

| Section ID | Heading | Purpose | Required facts and sources | Useful depth and stopping point | Banned claims or repetition |
| --- | --- | --- | --- | --- | --- |
| COPY-01 | How this KDP royalty calculator helps with a US pricing decision | Identify the self-publishing author, the three supported formats, the Amazon.com and USD scope, and the selected-sale question. | Use `brief.md`, the implementation product decision, and the fixed-scope assumptions. | One connected introduction that cues the tool and explains what answer appears first. Stop before describing every field or repeating the result. | Do not call it a profit calculator, forecast, recommendation engine, acceptance checker, or live KDP quote. |
| COPY-02 | How KDP royalty is calculated for print books and eBooks | Explain the print cost and rate branches, eBook delivery deduction, 70% fallback, price floors, and even-page normalization only as needed to understand the UI. | Use implementation formula sections, interface input and result contracts, FF-002, FF-003, FF-008, FF-009, and the official KDP sources in the ledger. | Follow the reader from list price and format to the cost receipt and boundary table. Stop once the reader can explain why a rate or cost changes. | Do not restate all trim IDs, cost constants, comparison rows, or ordinary button steps. Do not present the local formula as KDP acceptance. |
| COPY-03 | How to read the price floor, ad headroom, and monthly target | Explain the floor as cost coverage, ad headroom as a break-even ceiling, and target copies as ceiling unit math. | Use interface result contract, implementation assumptions, FF-007, FF-010, FF-013, and non-positive-state rules. | Cover the decisions the supporting result regions answer. Stop before demand, campaign performance, or price advice. | Do not recommend a list price or ad budget, call copies a sales forecast, or repeat the table's exact values. |
| COPY-04 | What this local KDP estimate does not cover | Set the boundary around author profit, taxes, VAT, refunds, price matching, promotions, other marketplaces, Expanded Distribution, demand, and stored or transmitted input data. | Use implementation scope, non-goals, assumptions, technical privacy plan, and edge cases EC-017, EC-029, and EC-030. | Keep the caveats close to the claims they qualify. Stop after the reader understands that the calculation runs locally and is not a KDP acceptance check. | Do not make broader privacy claims, add legal or tax advice, imply a result is guaranteed, or build an oversized caveat panel. |
| COPY-05 | What to verify in KDP before you price or publish | Tell the reader to use the dated official sources and the actual KDP workflow for final confirmation. | Use the five official KDP source pages in the ledger, the version string and source date, and the implementation publication boundary. | Give the next verification step and explain that rules can change. Stop before giving submission instructions or claiming that the tool submits or checks a book. | Do not say KDP accepted a price, title, file, or order. Do not claim live scraping, an API check, or current account-specific behavior. |
| COPY-06 | Task-oriented usage | Explain input preparation, meaningful choices, states, and next verification. | Closed Usage Markdown handoff and accepted technical artifacts. | One concise connected guide; use steps only where order changes the outcome. | No live-result narration, unimplemented features, or duplicate supporting explanations. |

### Voice and accuracy constraints

- Follow `stack127_docs/writing-style.md` and `stack127_docs/visual-first.md`.
- Read and apply `skills/stack127/stack127-writing-voice/SKILL.md` for public wording. This plan owns search intent and useful coverage, not a separate voice.
- Apply `skills/stack127/unslop/SKILL.md` before any later prose pass.
- Write `stack127`, lowercase.
- Use no em dash or en dash.
- Keep the words estimate, local calculation, source date, and KDP acceptance distinct. A source-rule match is not a submission or acceptance result.
- Do not invent facts, numbers, benefits, privacy claims, freshness beyond the recorded source date, or implementation behavior.
- Do not repeat a result, table, heading, or prior section. The tool UI owns exact economics and repeated price comparisons.
- Leave unresolved future routes and publication decisions as review notes, not public copy.

### Tool-build exclusion

`$stack127-tool-build` must not draft or integrate these sections. The user supplies them in a later content pass.

## Source ledger

- [KDP paperback printing costs](https://kdp.amazon.com/en_US/help/topic/G201834340), checked 2026-09-16. Supports US paperback fixed and per-page costs, trim classes, page limits, and the printing-cost part of the print floor.
- [KDP print royalty rules](https://kdp.amazon.com/en_US/help/topic/G201834330), checked 2026-09-16. Supports Amazon.com 50% and 60% print rate bands, the royalty equation, and print price limits.
- [KDP hardcover printing costs](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H), checked 2026-09-16. Supports hardcover fixed and per-page cost branches and page limits.
- [KDP hardcover royalty rules](https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS), checked 2026-09-16. Supports the separate hardcover royalty contract.
- [KDP eBook list price requirements](https://kdp.amazon.com/en_US/help/topic/G200634560), checked 2026-09-16. Supports the Amazon.com eBook price bands and file-size-dependent 35% floors.
- [KDP digital book pricing](https://kdp.amazon.com/en_US/help/topic/G200634500), checked 2026-09-16. Supports 35% and 70% equations, US delivery cost, kilobyte rounding, and the minimum delivery cost.
- [KDP price guidance](https://kdp.amazon.com/en_US/help/topic/G200641280), checked 2026-09-16. Supports the distinction between a calculated minimum list price and the author's final pricing decision.
- Search result review via the web connector, checked 2026-09-16. Supports the current SERP shape recorded under Search intent. Search engines were not individually available, and no direct-page Browser QA is claimed because the standalone Playwright launch was blocked by the host sandbox.

## Open questions and blockers

- No content blocker remains. The page is ready for the later manual prose pass, but the tool and route remain unpublished until separately approved through the central publication workflow.


## Usage Markdown handoff

Disposition: Closed and feasible for the retained Astra writing session after main acceptance.

### Assignment and reading order

COPY-06 owns `usage_markdown`: explain the real task, inputs worth preparing, meaningful mode choices, important state distinctions, and the next verification. The existing manual assignments own the introduction, supporting explanations, metadata, and identified interface review only. Where an older assignment discusses how to choose an input, move that instruction into this usage assignment and retain only its conceptual explanation below. Do not repeat it in both fields. Interface inventories are review-only; this plan does not authorize implementation or rewriting dynamic findings.

### Technical facts and meaningful inputs

Choose paperback, hardcover, or eBook under the fixed Amazon.com USD scope. Print uses supported trim/interior/paper, even-normalized page count, and list price; invalid cost-table combinations block an answer. Print rate is 50% through $9.98 and 60% from $9.99. The cost-covering floor is solved across those two bands. eBook 70% price eligibility is $2.99–$12.99 in the checked US source; outside it the modeled result falls back to 35% with a warning. The 70% branch deducts delivery before multiplying, while 35% has no delivery deduction. Delivery uses rounded-up file KB, $0.15/MB, and a $0.01 minimum. Monthly target is optional; blank omits it, zero is zero, and positive targets use ceiling copies only for positive royalty.

### State interpretation and recovery

Distinguish unsupported inputs, invalid price or cost-table selection, eBook 70%-to-35% fallback, non-positive royalty, and an absent monthly target. Break-even ad spend is not a recommended budget; undefined target copies or ACoS must not be rendered as zero or infinity.

### Limitations and next action

Royalty is not author profit. Exclude taxes, refunds, promotions, price matching, demand, other marketplaces, and Expanded Distribution. Selecting 70% assumes other eligibility conditions; this tool does not verify public-domain status, account requirements, or the required relationship to a physical edition's price. The accepted contract uses integer cents: round each printing or delivery cost at its cost boundary, then use those cents for royalty, price floor, comparisons, and target math. Explain displayed USD estimates without claiming microdollar precision or coverage of an unrounded cost.

### Input handling boundary

Scenario arithmetic runs locally. Do not claim that the tool contacts an Amazon account, submits a price, or obtains a live account-specific quote. The implementation and accepted technical evidence support only these route-specific statements. Do not infer a general retention, logging, analytics, cookie, or anonymity policy.

### Content, media, and list requirements

Keep the interactive tool first. Preserve all outline tables and exact result media; their repeated fields belong in tables, not comparison paragraphs. Existing output values, counts, findings, formulas, and captions stay in the live result rather than a second narrative. No new screenshot, marker drawing, generated illustration, or chart is required. If an ordered list is used, it must represent dependent task steps; use an unordered list only for genuinely independent checks. Do not add a generic FAQ or a list-shaped summary of every control. Every retained table must ship with useful headers and its limitation, not merely a heading placeholder.

### Source ledger and links

Use the existing source ledger for attributable claims, with links at the point of explanation. The ready implementation, interface, edge-case, and brief artifacts govern what this tool actually does; official sources govern external rules. Local assumptions must be labeled rather than attributed to a standards body or platform. Preserve the ledger's checked dates; a content review is not a claim that every source was freshly reverified. Conditional internal destinations: /kdp-book-setup-calculator; /kdp-page-count-estimator. Include them only when the exact route is published at integration; all new batch tools remain unpublished. If a destination is unavailable, omit the link rather than invent a URL or publish its target.

### Feasibility and ownership

The accepted implementation can support this plan without new controls, engines, media, data sources, or implementation work. Astra supplies words only after acceptance. Luna performs content integration later. Neither this plan nor its validator result changes database content, registry publication, tool version, or deployment.
