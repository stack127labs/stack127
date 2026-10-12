# KDP royalty calculator

Route: `/kdp-royalty-calculator`

Research: [research.md](research.md)

## People and questions

- Most users are: independent authors pricing a paperback, hardcover, or Kindle eBook for Amazon.com. They come with: the format, a price they have in mind, and for print, the page count and whether the inside is black and white or color.
- Their top questions:
  1. "How much do I earn on a $12.99 paperback?" (or a $4.99 eBook)
  2. "Why does a $9.98 paperback earn less than $9.99?" and "Should I take 35% or 70%?"
  3. "What's the lowest price KDP will let me set?"
- Basic answers them with: format, list price, and for print, page count and interior. Four fields for print and two for an eBook. Everything else opens on a default the hint names.
- Advanced holds:
  - **Trim size**, for print authors who don't use 6 × 9 in. Large trims (wider than 6.12 in or taller than 9 in) cost more per page, and page limits differ. Default 6 × 9 in, the trim the research examples and KDP's own calculator test use.
  - **Paper**, for print authors who chose cream or groundwood. Cream changes the page limit; groundwood changes the cost. Default white.
  - **Sales channel** (paperback only): Amazon.com or Expanded Distribution, for authors who also sell to bookstores and libraries. Three of the six independent competitors offer it, and "What does Expanded Distribution pay?" is a repeated question. KDP publishes the 40% rate but not this channel's minimum price, so the tool shows the break-even price, where 40% just covers printing, and never calls it KDP's minimum. Default Amazon.com.
  - **Converted file size** (eBook), for eBook authors who know their size from KDP's pricing page. It sets the 70% delivery cost and the 35% minimum price. Empty uses 2 MB, and the result names that size wherever it's used, so the default is never hidden.
  - **Royalty plan** (eBook): 70% or 35%, for authors who must use 35%, such as for public-domain books or stores outside the 70% list. Default 70%, which KDP applies only from $2.99 to $12.99; outside that band the result pays 35% and says so.
  - **Monthly royalty goal**, for publishers planning income or several editions. It turns the per-copy royalty into copies a month. The old tool had it. Empty means not used.
- Left out:
  - **Other Amazon stores and currencies.** Each store has its own print cost table, VAT, and price rules, and the research only verified Amazon.com. A wrong UK or EU number is worse than none.
  - **Profit after editing, covers, ads, and tax.** The research's top confusion is royalty versus profit. This page answers one number, what KDP pays per copy, and labels it that way. The KDP price and profit calculator handles per-sale and one-time costs.
  - **Kindle Unlimited page reads.** Paid from a monthly pool per page read, not per sale, with a different set of inputs. The Kindle Unlimited KENP earnings calculator covers it.
  - **Price from a target royalty.** The reverse question, "what price earns me $3?", is the KDP minimum list price calculator's job. The chart here still shows the royalty at every nearby price.
  - **Ad spend.** The break-even ACoS is a hint on "Share of list price", since it is the same number. Bids and targets stay with the KDP book ads bid check.
- Opens with: a 200-page, 6 × 9 in, black-and-white paperback on white paper at $12.99. It earns $4.39, the same as the official KDP calculator and five competitors in the research. Typical for a novel, and a verified answer for the first thing people see.
- Published comparison: none. The research found no source measuring a typical royalty, so the result shows no range.
- Domain limits: the print minimum list price (from printing cost and rate), the Expanded Distribution break-even price (a math floor, since KDP doesn't publish that channel's minimum), the $250 print maximum, the eBook minimum by file size ($0.99, $1.99, or $2.99), the $200 eBook maximum, the 70% band of $2.99 to $12.99, KDP page limits per binding, trim, interior, and paper, and a 70% delivery cost larger than the 70% share. See States for how each answers.

## Why people will choose this tool

The searcher is deciding on a price. They want the dollars they'll earn per copy at that price, and whether a small change, such as a cent or a dollar, would earn more.

Where the top results fail them:

- KDP's own calculator has no eBooks. KDP Workspace has paperback only. BookDraft has no hardcover.
- Kindlepreneur and Royalties HQ still use the old $9.99 top of the 70% band, so they understate eBooks priced $10 to $12.99.
- SmartKDP and KDP Workspace show a negative royalty at $0. BookDraft's result disappears. Neither tells you the lowest price KDP allows.
- Most show one number at one price, so the $9.98 to $9.99 step and the $12.99 to $13.00 drop stay invisible.
- Kindlepreneur leads with a rate, not dollars.

What this tool does better:

1. All three formats in one tool, on the current Amazon.com rules, including the July 7, 2026 $12.99 band.
2. Dollars first, with a bar that shows where the rest of the list price goes: printing or delivery, and Amazon's share. "70% isn't 70% of the price" becomes obvious.
3. A chart of royalty at every nearby price, with the person's price marked. The $9.99 step and the $12.99 drop show up without reading anything.
4. A price below KDP's minimum answers with the minimum and what it earns, never a negative number or a blank.
5. For eBooks, both plans side by side, so "35% or 70%?" has a direct answer for the person's own price and file size.
6. The next useful number when it matters: what $9.99 would earn when the price is just below it, or what $12.99 on 70% would earn when an eBook is priced above the band.

## Product

### Promise and scope

- Primary user: an independent author pricing one book format on Amazon.com.
- Main job: show the KDP royalty per copy sold at a chosen list price, and what changes nearby.
- Delivered answer: royalty per copy in USD, how the list price splits, the applied rate, the KDP minimum list price, the royalty as a share of the price, one next-step comparison, copies a month for an optional goal, and royalty across nearby prices.
- Launch scope: Amazon.com, USD, Kindle eBook, paperback, and hardcover. Standard channel for all three, plus Expanded Distribution for paperbacks.
- Exclusions: other stores and currencies, profit and costs, tax, Kindle Unlimited, price matching and promotions, refunds, and account or book eligibility. The tool doesn't check whether a trim and paper can use Expanded Distribution, or whether a book qualifies for 70%. It doesn't know KDP's Expanded Distribution minimum or deduct that channel's taxes and withholding. The page content says so and points to the book's Rights & Pricing page in KDP.

### Technical contract

All money is whole cents inside the engine. The engine is a pure synchronous function. It runs in the browser with no network calls and stores nothing.

**Inputs and parsing**

| Input | Parsing and bounds | Empty |
| --- | --- | --- |
| Format | `paperback`, `hardcover`, or `ebook` | Error |
| List price | Trimmed text. Optional leading `$`. Digits with up to 2 decimals: `12`, `12.5`, `$12.99`. Must be above $0. No upper bound at parse time; see limits. | Error |
| Page count (print) | Whole number, 1 or more | Error |
| Interior (print) | `black-white`, `standard-color`, `premium-color`. Hardcover allows `black-white` and `premium-color`. | Error |
| Trim (print) | A trim ID from `getKdpTrimOptions(binding)` | `6x9` |
| Paper (print) | From `getKdpPaperOptions(binding, interior)` | `white` |
| Channel (paperback) | `amazon` or `expanded`. Ignored for hardcover and eBook. | `amazon` |
| File size (eBook) | Number in MB, above 0 and at most 650 | 2 MB |
| Plan (eBook) | `70` or `35` | `70` |
| Monthly goal | Money, parsed like list price, above $0 and at most $10,000,000 | Not used |

**Formulas.** Use the existing helpers in `lib/kdp/royalty.ts` so every KDP tool agrees.

- Printed pages: an odd page count rounds up to the next even number, as KDP's paperback submission guidelines say.
- Printing cost: `getKdpPrintCost` with the printed pages. Keep the unrounded cost to $0.0001 with `getKdpPrintingCostHundredthCents`, and use it in every print calculation. `getKdpPrintingCostCents` rounds it to whole cents only for display and the split.
- Amazon.com print: rate 50% below $9.99 and 60% at $9.99 or more. Royalty = `round(price × rate − unrounded printing)`, rounded once to the nearest cent. Minimum = unrounded printing ÷ rate, rounded to the nearest cent, not always up, with `getKdpPrintFloorCents`. Maximum $250.
- Expanded Distribution (paperback): rate 40%. Royalty = `round(price × 40% − unrounded printing)`, rounded once. Break-even price = unrounded printing ÷ 40%, always rounded up to the cent, the lowest price where the royalty isn't negative. This is arithmetic, not a KDP rule: KDP says this channel has its own minimum but doesn't publish how it's worked out, and its real minimum may be higher. The break-even price is always at or above the Amazon.com minimum, so it's the only lower bound for this channel. Maximum $250.
- eBook delivery: `getKdpEbookDeliveryCents(fileSizeMB)`, which is $0.15 per MB on the size rounded up to the KB, $0.01 at least.
- eBook 70%: applies only when the plan is 70 and the price is $2.99 to $12.99. Royalty = `round((price − delivery) × 70%)`. If that is 0 or less, the royalty is $0.00 and `deliveryExceedsShare` is true.
- eBook 35%: royalty = `round(price × 35%)`, no delivery cost. Used when the plan is 35, or when the plan is 70 and the price is outside the band.
- eBook minimum: `getKdpEbookFloorCents(fileSizeMB)`. Maximum $200.
- Split: `royalty + cost + amazon = answered price`, where cost is printing rounded to whole cents, or delivery when 70% applies, else 0. `amazon` is the remainder. When `deliveryExceedsShare`, royalty is 0, cost is `min(delivery, price)`, and `amazon` is the remainder, never negative.
- Share of list price = `round(royalty × 10,000 ÷ price)` basis points.
- Copies a month = `ceil(goal ÷ royalty)`, or null when the royalty is $0.00.
- Rounding: every amount the engine returns is whole cents. In-between print costs keep $0.0001. Each print royalty and the Amazon.com minimum round once, to the nearest cent. Only the Expanded Distribution break-even rounds up. eBook amounts round to the nearest cent with `Math.round`, as the helpers do. These match KDP's own calculator in ten checked cases.

**Domain limits answer instead of failing.** A price below the minimum or above the maximum is not a field error. The engine answers at the nearest allowed price and reports which limit it hit. For Expanded Distribution, a price below the break-even answers at the break-even price with `limit.kind` `below-break-even`, so the result never shows a negative royalty and never claims KDP's minimum. Page counts outside KDP's range for the setup are field errors, because no nearby page count is a useful answer for the person's book.

**Next-step comparison.** At most one, picked in this order:

1. Amazon.com print, answered price below $9.99, and $9.99 within the maximum: the royalty at $9.99 (`rate-step`).
2. Expanded Distribution: the Amazon.com royalty at the same price (`other-channel`). The Amazon.com minimum is always at or below the Expanded Distribution break-even price, so this always exists.
3. eBook, 70% applied, or `deliveryExceedsShare`: the 35% royalty at the same price (`other-plan`).
4. eBook, plan 35, price inside the band: the 70% royalty at the same price (`other-plan`).
5. eBook, price outside the band (either plan): the 70% royalty at the nearest band edge, $2.99 or $12.99 (`seventy-band`). Skip if that edge is below the eBook minimum.
6. Otherwise none.

**Curve for the chart.** Built by the engine so the chart and the answer always agree.

- Lower bound: the lowest minimum among the plotted series. Upper bound: the larger of the answered price × 1.5 rounded up to the next `.99`, and $14.99 for print or $15.99 for eBook, capped at the format maximum.
- Prices: 48 evenly spaced whole-cent prices from lower to upper, plus the lower bound, upper bound, answered price, and every rule boundary in range ($9.98 and $9.99 for Amazon.com print; $2.98, $2.99, $12.99, and $13.00 for eBook). Sorted and unique.
- Series, the person's selection first:
  - Amazon.com print: one series, `amazon`, from the Amazon.com minimum.
  - Expanded Distribution: `expanded` from its break-even price, then `amazon` from the Amazon.com minimum.
  - eBook plan 70: `plan70` only for prices from $2.99 (or the minimum, if higher) to $12.99, floored at $0.00, then `plan35` across the range.
  - eBook plan 35: `plan35`, then `plan70` as above.
- Mark: the answered price and its royalty.

**Unknowns and privacy.** No unknown values in a valid result. Nothing leaves the browser. A shared link holds only the inputs.

### Backend contract

New file `lib/kdp/royalty-calculator.ts`. The frontend calls only this.

```ts
export type KdpRoyaltyCalculatorField =
  | "format" | "listPrice" | "pageCount" | "interior" | "trimId" | "paper"
  | "channel" | "fileSize" | "plan" | "monthlyGoal";

export type KdpRoyaltyCalculatorInput = Readonly<{
  format: string;
  listPriceText: string;
  pageCountText: string;
  interior: string;
  trimId: string;        // "" → "6x9"
  paper: string;         // "" → "white"
  channel: string;       // "" → "amazon"; paperback only
  fileSizeText: string;  // "" → 2 MB
  plan: string;          // "" → "70"
  monthlyGoalText: string; // "" → not used
}>;

export type KdpRoyaltyCalculatorResult =
  | Readonly<{ status: "invalid"; fieldErrors: Partial<Record<KdpRoyaltyCalculatorField, string>> }>
  | Readonly<{ status: "calculated"; values: KdpRoyaltyCalculatorValues; fieldErrors: Partial<Record<"monthlyGoal", string>> }>;

export type KdpRoyaltyCalculatorValues = Readonly<{
  format: "paperback" | "hardcover" | "ebook";
  channel: "amazon" | "expanded" | null;      // null for eBook
  plan: 35 | 70 | null;                       // selected plan; null for print
  enteredPriceCents: number;
  priceCents: number;                         // the answered price, after any limit
  limit: null | Readonly<{ kind: "below-minimum" | "below-break-even" | "above-maximum"; priceCents: number }>;
  rate: 35 | 40 | 50 | 60 | 70;               // applied rate
  seventyOutsideBand: null | "below" | "above"; // plan 70 but price outside $2.99–$12.99
  deliveryExceedsShare: boolean;
  royaltyCents: number;                       // never negative
  split: Readonly<{ royaltyCents: number; costCents: number; amazonCents: number }>;
  costKind: "printing" | "delivery" | null;
  printing: null | Readonly<{ enteredPages: number; printedPages: number; costCents: number; fixedCents: number; pageCents: number }>;
  delivery: null | Readonly<{ fileSizeMB: number; defaultSize: boolean; costCents: number }>; // costCents even when 35% applies
  minimumPriceCents: number;                  // lowest price for the selected channel or plan
  minimumKind: "kdp" | "break-even";          // "break-even" only for Expanded Distribution
  maximumPriceCents: number;
  shareBasisPoints: number;
  comparison: null | Readonly<{
    kind: "rate-step" | "other-channel" | "other-plan" | "seventy-band";
    priceCents: number;
    rate: number;
    royaltyCents: number;
  }>;
  goal: null | Readonly<{ goalCents: number; copies: number | null }>; // null when no goal or the goal is invalid
  curve: Readonly<{
    series: readonly Readonly<{ id: "amazon" | "expanded" | "plan70" | "plan35"; points: readonly (readonly [priceCents: number, royaltyCents: number])[] }>[];
    mark: Readonly<{ priceCents: number; royaltyCents: number }>;
  }>;
  rulesVersion: string;                       // KDP_ROYALTY_VERSION
}>;

export function calculateKdpRoyaltyEstimate(input: KdpRoyaltyCalculatorInput): KdpRoyaltyCalculatorResult;
```

- Field errors are short sentences for the field, final wording from the writing round. Page-limit errors name the range and KDP, such as "KDP prints 24 to 828 pages for this setup." An interior, trim, or paper value the binding doesn't offer is a field error on that field.
- An invalid monthly goal returns `calculated` with `goal: null` and the goal error. Every other field error returns `invalid`.
- Series labels and all display words live in the frontend.
- Remove the old `calculateKdpRoyalty` and the types and private helpers only it used from `lib/kdp/royalty.ts`. Keep every exported helper, constant, `KdpPricePoint`, and `KDP_ROYALTY_VERSION`, because `minimum-list-price.ts` and `price-profit.ts` use them. Don't change their results.
- Don't change the shared US tables or `KDP_ROYALTY_VERSION`. Research rechecked groundwood, its page limits, and the hardcover cost table and page range on 2026-10-11, and they match KDP.

### Known examples

Worked from the KDP rules in the research. Rows marked "verified" match the official KDP calculator or competitors in the research.

| Case | Inputs | Expected |
| --- | --- | --- |
| Opening example, verified | Paperback, 200 pages, black and white, $12.99 | Printing $3.40, rate 60%, royalty $4.39, Amazon $5.20, minimum $6.80, share 33.80% |
| Rate step, verified | Same, $9.98 | Rate 50%, royalty $1.59, comparison `rate-step` at $9.99: $2.59 |
| Below minimum | Same, $5.99 | `limit` below-minimum at $6.80, royalty $0.00 |
| Odd pages, verified | Same, 201 pages, $12.99 | Printed pages 202, printing $3.42 (unrounded $3.424), royalty $4.37, minimum $6.85 |
| Floor boundary | `getKdpPrintFloorCents(499)` and `(500)` | $9.98 and $9.99 |
| Long book | Paperback, 600 pages, black and white, $12.99 | Printing $8.20, minimum $13.67, `limit` below-minimum, royalty at $13.67: $0.00 |
| Large trim | Paperback, 8.5 × 11 in, 120 pages, black and white, $7.99 | Printing $3.04, rate 50%, royalty $0.96 |
| Expanded Distribution | Paperback, 200 pages, $12.99, channel expanded | Rate 40%, royalty $1.80, minimum $8.50 with `minimumKind` `break-even`, comparison `other-channel` $4.39 |
| Below ED break-even | Same, $7.99, channel expanded | `limit` below-break-even at $8.50, royalty $0.00, comparison `other-channel` at $8.50: $0.85 |
| Hardcover | Hardcover, 6 × 9 in, 300 pages, black and white, $24.99 | Printing $9.25, minimum $15.42, royalty $5.74 |
| eBook 70%, verified | eBook, $4.99, 2 MB | Delivery $0.30, royalty $3.28, comparison `other-plan` 35%: $1.75 |
| eBook 70% at 5 MB, verified | eBook, $4.99, 5 MB | Delivery $0.75, royalty $2.97 |
| Top of band | eBook, $12.99, 2 MB | Royalty $8.88 |
| Above band, verified | eBook, $13.00, plan 70 | Rate 35%, royalty $4.55, `seventyOutsideBand` above, comparison `seventy-band` at $12.99 |
| Above band | eBook, $13.99, 2 MB, plan 70 | Rate 35%, royalty $4.90, comparison $12.99 on 70%: $8.88 |
| eBook minimum by size | eBook, $0.99, 5 MB | `limit` below-minimum at $1.99, rate 35%, royalty $0.70 |
| Delivery exceeds share | eBook, $2.99, 30 MB, plan 70 | Delivery $4.50, royalty $0.00, `deliveryExceedsShare`, comparison 35%: $1.05 |
| Goal | Opening example, goal $1,000 | 228 copies |
| Invalid price | `abc`, `0`, `12.999` | `invalid`, listPrice error |
| Invalid pages | Paperback, 6 × 9 in, white, 829 pages | `invalid`, pageCount error naming 24 to 828 |
| Hardcover short | Hardcover, 60 pages | `invalid`, pageCount error naming 75 to 550 |
| Invalid goal | Opening example, goal `-5` | `calculated`, royalty $4.39, `goal: null`, monthlyGoal error |

### Ownership

- Sol builds: `lib/kdp/royalty-calculator.ts`, the cleanup in `lib/kdp/royalty.ts`, and a rewrite of `tests/pages/kdp-royalty-calculator/kdp-royalty-calculator.test.mjs` with the examples above. The route's database rows and `layout.tsx` already exist, so no preview row or route file.
- Opus builds: `app/(site)/(tools)/kdp-royalty-calculator/page.tsx`, `kdp-royalty-calculator.tsx`, `kdp-royalty-calculator-from-url.tsx`, a CSS module only if the shared workbench can't express the result grid, and later the `content/*.mdx` files. Card art: review the existing `kdp-royalty-calculator` art against the brief below and redraw only if it doesn't read.

### Catalog placement

- Primary: **KDP tools** (`/kdp-tools`). Its article already lists this tool under "Working out what you earn per sale."
- Secondary: none. No other catalog serves authors.

Card art (`toolSpot`, key `kdp-royalty-calculator`, already registered in `lib/card-art.ts`):

- Takeaway: each copy sold pays the author a share of its price.
- Focal subject: a closed book.
- Supporting relationship: a small stack of coins beside it, the author's share.
- Tone: neutral and practical. No price tags, numbers, or words.

The existing art (`royaltyBook`, a book and coins) already matches this brief. The frontend round checks it at card size in both themes.

## Interface

### Flow

- User question: "How much do I earn per copy at this price?"
- Lead answer: royalty per copy, such as `$4.39`.
- Opens with: Paperback, $12.99, 200 pages, black and white. Advanced empty. Result showing `$4.39`, marked `Example`.
- Button: `Calculate royalty`, with a quiet `Reset` beside it.

### Inputs

| Input | Basic or Advanced | Required or optional | Hint, one sentence or none | What it changes in the result |
| --- | --- | --- | --- | --- |
| Format | Basic | Required | None | Which rules apply, which fields show, every number |
| List price (suffix `USD`) | Basic | Required | "The price readers pay on Amazon.com, before any sale." | Royalty, rate, split, mark on the chart |
| Page count (suffix `pages`, print) | Basic | Required | "Every page in your interior file, blanks included." | Printing cost, minimum, page limit |
| Interior (print) | Basic | Required | "Standard color suits color photos; premium color suits picture books." | Printing cost, minimum, page limit |
| Trim size (print) | Advanced | Optional, default 6 × 9 in | "Empty uses 6 × 9 in. Larger trims cost more per page." | Printing cost, page limit |
| Paper (print, black and white only) | Advanced | Optional, default White | "Cream allows fewer pages. Groundwood costs less." | Page limit, printing cost (groundwood) |
| Sales channel (paperback) | Advanced | Optional, default Amazon.com | "Expanded Distribution sells to bookstores and libraries at 40% minus printing." | Rate, royalty, break-even price, a second chart line |
| Converted file size (suffix `MB`, eBook) | Advanced | Optional, empty uses 2 MB | "KDP shows it on the pricing page after you upload. Empty uses 2 MB." | Delivery cost on 70%, 35% minimum price |
| Royalty plan (eBook) | Advanced | Optional, default 70% | "KDP pays 70% only from $2.99 to $12.99." | Which plan leads, comparison, chart order |
| Monthly royalty goal (suffix `USD`) | Advanced | Optional, empty not used | "Shows how many copies a month earn this much." | Adds a copies-a-month number |

Format, Interior, Paper, Sales channel, and Royalty plan are choice rows, since each has two or three options. Trim size is a select. Hint wording is a draft; the writing round finalizes it.

Format shows different fields, which is a format's own inputs swapping, not a reveal. Values are kept when switching formats, so switching back restores them. If a trim, interior, or paper isn't offered for the new binding, it falls back to 6 × 9 in, black and white, or white.

Advanced disclosure name, by format:

- Paperback: `Trim, paper, channel, and goal`
- Hardcover: `Trim, paper, and goal`
- eBook: `File size, plan, and goal`

Its closed summary is `uiSetSummary(count)`, counting fields that differ from their default or are filled.

### Result

Order: answer, split bar, supporting numbers, chart, actions.

1. **Answer.** `UiPrimaryResult`, label `Royalty per copy`, value such as `$4.39`, detail `on a $12.99 paperback`. A `UiStatusWord` beside it only when something could mislead: `Example`, `Below KDP minimum`, `Below break-even`, `Above KDP maximum`, `Paid at 35%`, or `Delivery tops the 70% share`. When a limit applies, the value becomes the limit price, labeled `Lowest price KDP allows`, `Expanded Distribution break-even`, or `Highest price KDP allows`, and the detail says what it earns, such as `earns $0.00 a copy`.
2. **Split bar.** `UiAllocationBar` of the answered price: `Your royalty` (first data color), `Printing` or `Delivery, 2 MB` (neutral medium), `Amazon` (neutral light). It shows what the numbers alone don't: where the rest of the price goes, and why 70% isn't 70% of the price. The delivery label names the file size, so the 2 MB default is visible. The 35% plan has two parts. When printed pages differ from entered pages, the label reads `Printing, 202 pages`.
3. **Supporting numbers.** `UiMetricGroup`, three or four items:
   - `Royalty rate`: `60%`, `40%`, `70%`, or `35%`. Hint for eBook 70%: "Taken after the delivery cost."
   - `Lowest list price`: the KDP minimum for this setup. Hint: "KDP sets it so your share covers printing." (eBook: "KDP sets it by file size.") For Expanded Distribution the label is `Break-even price`, with the hint "Where 40% covers printing. KDP's minimum for this channel may be higher."
   - `Share of list price`: `33.8%`. Hint: "This is also your break-even ACoS for Amazon ads."
   - The comparison, when there is one: `At $9.99` → `$2.59`; `Amazon.com only` → `$4.39`; `On the 35% plan` → `$1.75`; `On the 70% plan` → `$X`; `At $12.99 on 70%` → `$8.88`.
   - `Copies a month for $1,000` → `228`, when a goal is set. `—` when the royalty is $0.00.
4. **Chart.** `UiLiveChart`, kind `line`, `format` and `xFormat` `currency`, title `Royalty at each list price`, height 280 (260 on phones). Series labels: `Amazon.com`, `Expanded Distribution`, `70% plan`, `35% plan`. One mark, `Your price`, at the answered price. The print line steps up at $9.99. The eBook 70% line stops at $12.99 while the 35% line runs on, so the drop is plain. It replaces the old price table: hover gives the royalty at any nearby price.
5. **Actions.** `UiCopyAction` `Copy summary` (format, price, rate, royalty, printing or delivery with fixed and per-page cost, minimum, setup) and `UiShareAction` `Copy link`.

No sources, dates, caveats, or advice in the result. They go in the page content.

### Components

Existing shared components:

- `ToolWorkbench`, `ToolFieldRow`, `ToolResult` from `@/app/ui/tools/tool-workbench`
- `UiChoiceGroup`, `UiTextField`, `UiNumberField`, `UiSelect`, `UiDisclosure`, `uiSetSummary`, `UiButton`, `UiCopyAction`, `UiShareAction`, `uiOption` from `@/app/ui/controls`
- `UiPrimaryResult`, `UiStatusWord`, `UiStatus`, `UiAllocationBar`, `UiMetricGroup`, `UiActionRow` from `@/app/ui/display`
- `UiLiveChart` from `@/app/ui/charts/chart-client`, using line `marks` for `Your price`
- `useInitialQuery` from `@/app/ui/tools/use-initial-query`

New or improved shared components: none. The line chart's `marks`, the step line (the gallery's "Line with a mark" example is a royalty curve), and the allocation bar's per-segment tones already cover this tool.

Tool-specific components:

- `KdpRoyaltyCalculator`: form state per field as text, the press-to-calculate flow, stale state, error focus, Advanced open on an Advanced error, and the result.
- `KdpRoyaltyCalculatorFromUrl`: reads a shared link with `useInitialQuery()` and renders the tool with `key={query.key}`. Params: `format`, `price`, `pages`, `interior`, `trim`, `paper`, `channel`, `size`, `plan`, `goal`. An unknown value for a choice falls back to its default.

### Layout

Desktop, inside the 66rem working width:

```
[ Format: Paperback | Hardcover | Kindle eBook ]   [ List price ______ USD ]
[ Page count ____ pages ]                          [ Interior: B&W | Standard | Premium ]
> Trim, paper, channel, and goal                                    Not used
    [ Trim size  6 × 9 in ▾ ]   [ Paper: White | Cream | Groundwood ]
    [ Sales channel: Amazon.com | Expanded ]   [ Monthly royalty goal ____ USD ]
[ Calculate royalty ]  Reset                                  Inputs changed
──────────────────────────────────────────────────────────────────────────────
Royalty per copy  [Example]        ████████████▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░
$4.39                              ■ Your royalty $4.39  ■ Printing $3.40
on a $12.99 paperback              ■ Amazon $5.20
──
Royalty rate 60% · Lowest list price $6.80 · Share of list price 33.8% · (comparison)
──
Royalty at each list price  (full width, 280px, Your price marked)
[ Copy summary ] [ Copy link ]
```

- Basic: two `ToolFieldRow`s for print, one for an eBook (Format and List price). An eBook has no second Basic row.
- Advanced: one `UiDisclosure` under the Basic rows, with two `ToolFieldRow`s. eBook: File size and Royalty plan, then the goal.
- Result top: the answer and the split bar side by side, about 2 to 3, the bar vertically centered against the answer. Both hold their own: the answer is large, and the bar plus legend fills its column.
- Supporting numbers: one full-width row of three or four.
- Chart and actions: full width.

Phones: every row stacks in reading order. The format choice row may wrap. The answer, then the bar, then the numbers in two columns, then the chart at 260px, then the actions. Nothing overflows the page.

### States

- **Example.** Opens on the example with its result and `Example`. The word goes away after the first press of `Calculate royalty`, even with unchanged values.
- **Stale.** Any edit, including a format switch or an Advanced field, steps the result back with `ToolResult stale` and shows `Inputs changed` in `UiStatus`. The result never disappears.
- **Invalid input.** On press, errors show under each field and focus moves to the first. If it's inside Advanced, Advanced opens first. The last good result stays, stepped back.
- **Invalid goal only.** The main result updates. The goal field shows its error, Advanced opens, and the copies number is left out.
- **Below the minimum.** The answer becomes the minimum price, `Lowest price KDP allows`, with what it earns. Status `Below KDP minimum`. The split bar, numbers, and chart mark use the minimum. No field error.
- **Below the Expanded Distribution break-even.** The answer becomes the break-even price, `Expanded Distribution break-even`, with what it earns ($0.00). Status `Below break-even`. The comparison shows the Amazon.com royalty at that price. No field error, and nothing calls it KDP's minimum.
- **Above the maximum.** Same, at $250 for print or $200 for eBook, `Highest price KDP allows`, status `Above KDP maximum`.
- **70% outside the band.** Royalty at 35%, status `Paid at 35%`, comparison `At $12.99 on 70%` or `At $2.99 on 70%`.
- **Delivery exceeds the 70% share.** Royalty `$0.00`, status `Delivery tops the 70% share`, comparison `On the 35% plan`.
- **Page count outside KDP's range for the setup.** Field error naming the range and KDP. Also used for standard color under 72 pages and hardcover under 75. Last good result stays, stepped back.
- **Shared link.** Opens and calculates right away. If a value is invalid, the errors show as on press, and the example result stays, stepped back.
- **Reset.** Returns every field, including Advanced, to the example, and shows its result marked `Example`.

## Content

Written after the frontend. The tool was run with the opening paperback ($12.99, 200 pages), $9.98 and $9.99, a 600-page paperback, Expanded Distribution at $12.99 and $7.99, a $24.99 hardcover, and eBooks at $4.99, $12.99, $13.99, and $2.99 with a 30 MB file. Every number in the copy comes from those runs.

### Search intent and title

The searcher is picking a price and wants the dollars per copy at that price. Top results either skip a format, still use the old $9.99 top of the 70% band, or show a negative number at a price KDP won't allow. This page gives the dollars, where the rest of the price goes, and what nearby prices pay, on the current Amazon.com rules.

- Visible title: keep `KDP royalty calculator: how much do you earn per book sale?`
- SEO title: keep `KDP royalty calculator for paperbacks, hardcovers, and eBooks`.
- SEO description, new: `See what you earn per Amazon.com sale of a paperback, hardcover, or Kindle eBook, the lowest price KDP allows, and what nearby prices pay.`
- Card: keep the name `KDP royalty calculator` and the description `See what you earn per Amazon.com sale for a paperback, hardcover, or eBook.`

### Reader questions

| Question | Where it's answered |
| --- | --- |
| How much do I earn on a $12.99 paperback? | Tool answer. Article formula and worked example. |
| How is KDP royalty calculated? | Article, formula and rate table. |
| Why does $9.98 earn less than $9.99? | Tool comparison and chart step. Article section. |
| Should I choose 35% or 70%? What is the delivery fee? | Tool comparison and chart. Article section. |
| What's the lowest price I can set? | Tool number, and the answer itself when the price is too low. Article section. |
| What does Expanded Distribution pay? | Tool channel choice. Article section. |
| Is royalty the same as profit? | Article section. |
| How many copies a month do I need? | Tool goal. Usage. |
| What can I spend on ads per sale? | Share of list price hint. Usage. |

### Outline

- Intro: what you get, for which formats, and what to have ready. Two sentences.
- Usage: what to enter where the form can't say it (page count, file size), how to read the bar, numbers, and chart, and one `Example` (the opening paperback, with a $1,000 goal).
- Article:
  - `How is KDP royalty calculated?` Formula, rate table, printing and delivery cost, links to KDP.
  - `Why does one cent change a paperback royalty by $1?` The $9.98 and $9.99 pair.
  - `Should you choose 35% or 70% for your eBook?` Delivery cost, the $13.99 drop, the 30 MB case.
  - `What is the lowest list price KDP allows?` The minimum rule, the 600-page case, eBook minimums by size.
  - `What does Expanded Distribution pay?` 40% minus printing, the break-even, the unpublished minimum.
  - `Is a KDP royalty the same as profit?`
  - `What doesn't this calculator cover?` Scope, rules date, exclusions, next tools.

Left out: input format rules and limits (field errors cover them), odd-page rounding beyond one line, trim and paper cost tables (KDP's pages link them), and price advice (the research found no evidence for a good price).

### Facts, limits, and sources

- Print rates, $9.99 step, print formula, $250 maximum, minimum from printing cost: [Paperback Royalty](https://kdp.amazon.com/en_US/help/topic/G201834330), [Hardcover Royalty](https://kdp.amazon.com/en_US/help/topic/G77F3WPD3KQLJTFS).
- Printing cost tables and even page counts: [Paperback Printing Cost](https://kdp.amazon.com/en_US/help/topic/G201834340), [Hardcover Printing Cost](https://kdp.amazon.com/en_US/help/topic/GHT976ZKSKUXBB6H), [Paperback Submission Guidelines](https://kdp.amazon.com/en_US/help/topic/G201857950).
- 35% and 70% plans, delivery at $0.15 per MB rounded up to the KB with a $0.01 minimum, 70% eligibility conditions: [Digital Book Pricing](https://kdp.amazon.com/en_US/help/topic/G200634500).
- $2.99 to $12.99 band from July 7, 2026, eBook minimums by size, $200 maximum: [eBook List Price Requirements](https://kdp.amazon.com/en_US/help/topic/G200634560).
- Expanded Distribution at 40% minus printing, taxes, and withholding; minimum not published; Rights & Pricing grid: [Expanded Distribution](https://kdp.amazon.com/en_US/help/topic/GQTT4W3T5AYK7L45).
- Rules checked: October 11, 2026.
- Avoid: calling a price good or bad, a typical royalty or earnings figure (none exists), calling the break-even KDP's minimum, a 1.5 MB example (a rounding fix is pending), and saying the tool checks KDP acceptance or eligibility.

### Next step

`/kdp-price-profit-calculator` (costs and profit), `/kdp-minimum-list-price-calculator` (price for a target royalty), `/kdp-break-even-acos-calculator` (ad bids), `/kindle-unlimited-kenp-earnings-calculator` (page reads), `/kdp-page-count-estimator` (page count before the final file).
