# Book Series Read-Through Calculator

Route: `/series-read-through-calculator`

Research: [research.md](research.md)

## People and questions

- Most users are: fiction authors with book 1 of a 2 to 5 book Kindle series on Amazon.com, often running some ads. They come with: each book's price, copies sold per book over the last month from KDP Reports, and a rough ACoS. Most don't have the KENPC, the month's KENP rate, or their file size to hand.
- Their top questions:
  1. "How much can I spend on ads to get one new reader for book 1?"
  2. "What's my read-through from book 1 to book 2, and on through the series?"
  3. "Should I make book 1 free or put it on sale?"
- Basic answers 1 and 2 with one row per book: price and copies sold. That's two numbers per book that every KDP author can read off their reports. A 3-book series is six fields, all prefilled with the example. The result gives the value of one new book 1 reader across the series, the break-even ACoS on book 1, and the read-through at every step.
- Advanced, `File size, KU reads, ads, and deals`, holds:
  - **Converted file size**, for authors who know it from KDP's pricing page. It sets the 70% delivery cost and the 35% minimum price. Empty uses 2 MB, the same default as the KDP royalty calculator, and the hint names it.
  - **Kindle Unlimited**: one KENP rate with its month, plus KU pages read and KENPC for each book. For the 38% of authors with every book in KDP Select (research, Written Word Media 2025). KU readers count toward read-through and earn per page. Without it the tool counts sales only. A KENPC above 3,000 pays as 3,000, KDP's cap per borrow. Empty pages mean no KU reads for that book.
  - **Ads**: your current ad cost (as ACoS on book 1, or as cost per new reader for Facebook and other platforms), your conversion rate, and a profit to keep per reader. For authors already running ads who ask "does my ad pay?" and "what's my highest bid?" Empty means not used, and an empty profit means break even.
  - **Book 1 deal**: a deal price (0 for free), whether it's a Countdown Deal or a plain price change, and the share of deal readers who go on to book 2. For the "should book 1 be free?" question. Empty means no deal. An empty deal read-through uses the person's own book 1 to book 2 rate.
- Left out:
  - **A grade or benchmark for read-through.** The commonly quoted "50 to 60%" has no published sample or method behind it (research, Published comparison data). Showing it would grade people against a number nobody measured. The page content discusses it.
  - **Typing read-through percentages instead of copies.** Copies give the same answer: 100 copies of book 1 and 55 of book 2 is a 55% step. One input style keeps the form simple, and the usage section explains how to model a planned book this way.
  - **Paperback, audio, and box sets.** Print needs page count, trim, and ink for every book, which would triple the form. Audio and box sets are separate products with their own sales. The KDP royalty calculator handles print per book.
  - **Other Amazon stores, currencies, and VAT.** Each store has its own delivery rate, VAT, and KENP rate. The research verified Amazon.com, and the KDP royalty calculator is Amazon.com only too, so the two tools agree.
  - **The 35% plan as a choice.** Series authors take 70% wherever the price allows it. Prices outside $2.99 to $12.99 already pay 35% on their own, and the result shows it.
  - **A rate-basis choice for KENP** (`kdp-reported` or `planning-assumption`). It changes no number. The required rate month carries the honesty.
  - **Time lag and cash timing.** Readers reach book 2 weeks after book 1, and royalties arrive about 60 days after the month of sale. Both are guidance, so they go in the page content.
- Opens with: a 3-book series at $4.99 each, with 100, 55, and 44 copies sold. That's 55% from book 1 to book 2, inside the range authors commonly quote, and 80% from book 2 to book 3. One new reader is worth $6.53, and ads break even up to 130.8% ACoS on book 1.
- Published comparison: none, for the reason above.
- Domain limits: KDP's minimum ebook price by file size ($0.99, $1.99, $2.99), the $200 maximum, the 70% band of $2.99 to $12.99, the 650 MB file size limit, and the 3,000 KENPC cap per borrow. States says how each answers.

## Why people will choose this tool

The searcher is deciding how much to spend to win a new reader, and whether book 1 should be cheaper or free. They need one number they can act on and the read-through behind it.

Where the top results fail them:

- BookWriter's series tool stops at 3 books, uses the old $9.99 band, and didn't respond to new inputs in our test. Its own page shows three different values for one example.
- BookWriter's ACoS tool hides a 50% second-step rate and shows two different break-even ACoS figures for the same inputs.
- ScribeCount's permafree tool uses one read-through for every step and makes the author work out the sequel royalty by hand.
- Kindlepreneur's KENP tool fixes the rate at February 2026 and has no 3,000 page cap. Its read-through article divides the KU example the wrong way round.
- No tool puts series value, KU reads, and the ad ceiling together. Several accept blank or negative inputs silently.

What this tool does better:

1. Every step's read-through comes from the person's own copies sold. No step rate is hidden or assumed.
2. One answer the person can act on: what a new reader is worth, and the break-even ACoS on book 1 in the terms Amazon Ads reports.
3. Royalties from the shared KDP engine: the $2.99 to $12.99 band from July 7, 2026, delivery cost from file size, and 35% outside the band or below $2.99.
4. Kindle Unlimited counted properly: the person's rate with its month, never a stale default, KENPC capped at 3,000, and KU reads kept apart from sales.
5. A free or discounted book 1 compared fairly, using KDP's own Countdown Deal royalty text, with the deal read-through as the person's own guess.
6. A visual that shows where readers drop off and where the money comes from, book by book, for any series length up to 30 books.
7. Clear errors for blank, negative, and missing partner values, and limits that answer instead of going blank.

## Product

### Promise and scope

- Primary user: an indie author with a Kindle series on Amazon.com.
- Main job: turn copies sold per book into read-through at each step, the value of one new book 1 reader across the series, and the most they can pay to win that reader.
- Delivered answer: reader value in USD, break-even (or target) ACoS on book 1, what 10 more points of book 2 read-through is worth, read-through and reach per book, each book's share of the reader value, and each book's "worth from here". Advanced adds KU, current ad cost, highest CPC, and a book 1 deal comparison.
- Launch scope: Amazon.com, USD, Kindle eBooks, 70% plan where KDP allows it, 2 to 30 books.
- Exclusions: everything under "Left out" above. The tool doesn't check KDP Select enrollment, the 30 days in KDP Select a Countdown Deal needs, or price matching. It does check Countdown's price rules. It assumes every later-book reader came through book 1, which the page content explains.

### Technical contract

The engine is a pure synchronous function. It runs in the browser, makes no network calls, and stores nothing. A shared link holds only the inputs.

**Inputs and parsing.** Trim every text input. Reject signs, exponents, and currency symbols other than an optional leading `$` on money. Counts accept plain digits or digits with comma thousands separators (`1,200`).

| Input | Parsing and bounds | Empty |
| --- | --- | --- |
| Books | 2 to 30 rows. The bounds are this calculator's, not KDP's. | Error |
| Price (per book) | Money, `^\$?\d+(\.\d{1,2})?$`, 0 or more. `0` means free. No upper bound at parse time; see limits. | Error |
| Copies sold (per book) | Whole count, 0 to 10,000,000 | Error |
| KU pages read (per book) | Whole count, 0 to 1,000,000,000. Same parser as `parseKdpKenpRead`, plus commas. | 0 |
| KENPC (per book) | Whole count, 1 to 100,000 | Allowed only when that book's KU pages are 0 |
| Converted file size | Number above 0 and at most `KDP_MAX_FILE_MB` (650) | 2 MB |
| KENP rate | `parseKdpKenpRate` (above 0, up to 8 decimals), and at most $0.10 per page. The $0.10 bound is this tool's, to catch a rate typed in cents. | Required when any book has KU pages above 0. Otherwise ignored. |
| Rate month | `isValidKdpKenpMonth`, `YYYY-MM` | Required with the rate when it's used. Otherwise ignored. |
| Ad cost | With unit `acos`: percent, 0 to 1,000, up to 2 decimals. With unit `per-reader`: money, $0 to $1,000. | Not used |
| Ad cost unit | `acos` or `per-reader` | `acos` |
| Conversion rate | Percent, above 0 and at most 100, up to 2 decimals | Not used |
| Profit to keep per reader | Money, $0 to $1,000 | $0 (break even) |
| Deal price | Money, 0 or more, below book 1's entered price. `0` means free. A Countdown Deal must be at least $0.99 and at least $1.00 below book 1's answered price. | No deal |
| Deal kind | `price-change` or `countdown`. Ignored when the deal price is 0. | `price-change` |
| Deal read-through | Percent, 0 to 100, up to 2 decimals | The person's own book 1 to book 2 step |

**Royalty per copy.** Reuse `lib/kdp/royalty.ts` so every KDP tool agrees. Don't redefine rates or the band.

- Free (price 0): royalty $0.00, rate 0.
- Otherwise: answer the price inside KDP's limits first (below), then `getKdpEbookPricePoint(priceCents, 70, fileSizeMB)`. It pays 70% of (price − delivery) from $2.99 to $12.99 and 35% of price outside it. Floor the royalty at $0.00.
- Delivery: `getKdpEbookDeliveryCents(fileSizeMB)`.

**KU readers and earnings, per book.**

- Credited pages per full read `c = min(KENPC, 3000)`. `capped` is true when KENPC is above 3,000.
- KU full reads `= pages ÷ c`. KDP reports pages already capped per customer, so this counts readers who finished. Fractional values are kept.
- KU earnings `= pages × rate`. KU per full read `= c × rate`.
- Readers of book `i`: `R_i = sales_i + KU full reads_i`.
- Earnings of book `i`: `E_i = sales_i × royalty_i + KU earnings_i`.

**Series math.**

- Book 1 readers `R_1` must be above 0, otherwise a field error on book 1's copies sold.
- Step read-through `step_i = R_i ÷ R_(i−1)` for `i ≥ 2`. Null when `R_(i−1)` is 0. Values above 100% are valid and returned as is.
- Reach `reach_i = R_i ÷ R_1`.
- Reader value `V = (E_1 + … + E_n) ÷ R_1`. This is the series earnings per book 1 reader, which equals the sum of reach × value per reader for each book.
- Contribution of book `i` `= E_i ÷ R_1`. Contributions add up to `V`.
- Worth from here for book `i` `= (E_i + … + E_n) ÷ R_i`. Null when `R_i` is 0. This is the most a reader who starts at book `i` is worth, for authors advertising later books.
- Book 2 onward worth `W = (E_2 + … + E_n) ÷ R_2`, null when `R_2` is 0.
- 10 more points to book 2 `= 0.10 × W`. Null when `W` is null.
- Most to pay per reader `= max(0, V − profit target)`. `noRoom` is true when the target is at or above `V`.
- Highest ACoS on book 1 `= (most to pay) ÷ book 1 answered price`. ACoS is ad spend ÷ ad-attributed sales, the standard definition. Each attributed book 1 order counts as one sale at book 1's price. Amazon Ads decides which sales it attributes. Null when book 1 is free.
- Your cost per reader: with `acos`, `ACoS × book 1 answered price`. With `per-reader`, the amount. Left per reader after ads `= V − cost`, which can be negative.
- Highest CPC `= (most to pay) × conversion rate`. Null when no conversion rate is set.

**Book 1 deal.**

- Kind is `free` when the deal price is 0, otherwise the chosen kind.
- Royalty per deal copy:
  - `free`: $0.00. A free book earns no royalty, whether from free days or price matching.
  - `price-change`: KDP's normal rules at the deal price, through the same limits and `getKdpEbookPricePoint`. Below the minimum answers at the minimum.
  - `countdown`: KDP's promotional price text (research, Facts to get right; [KDP Digital Book Pricing](https://kdp.amazon.com/help/topic/G200634500), and [Kindle Countdown Deals](https://kdp.amazon.com/en_US/help/topic/G201293780), checked 2026-10-13). The deal keeps the plan book 1 qualified for at its list price. If book 1's answered price is in the 70% band, `round((deal − delivery) × 70%)`, floored at $0.00. Otherwise `round(deal × 35%)`. Countdown Deals run only on Amazon.com and Amazon.co.uk, so this US tool is in scope.
- Deal read-through `t`: the entered percent, or `step_2` when empty (`usedOwnRate: true`).
- Value per deal reader `= deal royalty + t × W`. Null when `W` is null.
- Deal copies to match one full-price reader `= V ÷ deal value`. Null when the deal value is 0.

**Rounding.** Money is exact inside the engine: whole cents for prices and royalties, and KU money in 1e-8 dollar units with the bigint rate from `parseKdpKenpRate`. Keep readers and ratios exact (bigint fractions, or another method that gives the same rounded results as the examples). Never accumulate floating-point money. Round each output once, from unrounded values:

- Values (reader value, worth from here, 10 points, cost per reader, left after ads, deal value, KU earnings, KU per full read): half up to the cent.
- Ceilings (most to pay, highest ACoS, highest CPC): down, to the cent or to 0.1%, so the tool never overstates what someone can spend.
- Contributions: floor each to the cent, then give the leftover cents to the largest remainders, earlier book first on ties, so they add up to the rounded reader value.
- Step and reach: half up to basis points (0.01%).
- KU full reads and readers: returned unrounded. The frontend rounds for display.
- Deal copies to match: half up to 0.1.

**Domain limits answer instead of failing.**

- A price above $0 but below KDP's minimum for the file size answers at the minimum (`limit.kind: "below-minimum"`).
- A price above $200 answers at $200 (`above-maximum`).
- A file size above 650 MB is a field error that names KDP's limit.
- A KENPC above 3,000 pays as 3,000 (`capped`).
- A profit target at or above `V` gives most to pay $0.00, highest ACoS 0.0%, highest CPC $0.00, and `noRoom: true`.

**Which errors block the answer.** Errors on books, prices, copies, KU pages, KENPC, file size, KENP rate, and rate month feed the reader value, so they return `invalid`. The frontend keeps the last good result, stepped back. Errors on ad, profit, and deal fields return `calculated`, with only the part they feed set to null and their field errors attached. A bad profit target nulls `ads` and `highestAcosTenths`, because both use it. The reader value stays.

**Partner rules.**

- KU pages above 0 on any book: the KENP rate and rate month become required, and that book's KENPC becomes required.
- Ad cost unit `acos` with book 1 free: an error on ad cost, because ACoS needs a sale price.
- A deal when book 1 is free: an error on deal price.
- A deal price at or above book 1's entered price: an error on deal price.
- A Countdown deal below $0.99: an error on deal price, since $0.99 is the lowest Kindle price KDP allows. KDP's Countdown page doesn't name a lowest deal price, so this rule stays.
- A Countdown deal when book 1's answered price is outside $2.99 to $24.99: an error on deal type. KDP's Countdown page lists that range for Amazon.com.
- A Countdown deal less than $1.00 below book 1's answered price: an error on deal price. KDP's Countdown page sets a $1.00 minimum cut on Amazon.com.

### Backend contract

New file `lib/kdp/series-read-through.ts`. The frontend calls only this. All display words live in the frontend; field errors are short sentences, with final wording from the writing round.

```ts
export const SERIES_MIN_BOOKS = 2;
export const SERIES_MAX_BOOKS = 30;

export type SeriesBookInput = Readonly<{
  priceText: string;    // required; "0" = free
  salesText: string;    // required
  kuPagesText: string;  // "" → 0
  kenpcText: string;    // required only when KU pages > 0
}>;

export type SeriesReadThroughInput = Readonly<{
  books: readonly SeriesBookInput[];
  fileSizeText: string;        // "" → 2 MB
  kenpRateText: string;        // USD per page; required when any KU pages > 0
  kenpMonthText: string;       // "YYYY-MM"; required with the rate
  adCostText: string;          // "" → not used
  adCostUnit: string;          // "acos" | "per-reader"; "" → "acos"
  conversionText: string;      // percent; "" → not used
  profitTargetText: string;    // USD per reader; "" → 0
  dealPriceText: string;       // USD; "" → no deal; "0" → free
  dealKind: string;            // "price-change" | "countdown"; "" → "price-change"
  dealReadThroughText: string; // percent; "" → own book 1 → 2 step
}>;

type BookField = "price" | "sales" | "kuPages" | "kenpc";
export type SeriesPartField =
  | "adCost" | "adCostUnit" | "conversion" | "profitTarget"
  | "dealPrice" | "dealKind" | "dealReadThrough";
export type SeriesField =
  | "books" | "fileSize" | "kenpRate" | "kenpMonth"
  | SeriesPartField
  | `${BookField}.${number}`;  // 0-based book index, such as "sales.0"

export type SeriesPriceLimit = null | Readonly<{ kind: "below-minimum" | "above-maximum"; priceCents: number }>;

export type SeriesBookValues = Readonly<{
  index: number;                    // 0-based
  enteredPriceCents: number;
  priceCents: number;               // answered price after limits
  limit: SeriesPriceLimit;
  free: boolean;
  rate: 0 | 35 | 70;                // applied rate; 0 when free
  royaltyCents: number;             // per copy, never negative
  sales: number;
  ku: null | Readonly<{             // null when KU pages are 0
    pages: number;
    kenpc: number;
    creditedPages: number;          // min(kenpc, 3000)
    capped: boolean;
    fullReads: number;              // pages ÷ creditedPages, unrounded
    perFullReadCents: number;
    earningsCents: number;
  }>;
  readers: number;                  // sales + KU full reads, unrounded
  stepBasisPoints: number | null;   // null for book 1, or when the previous book has 0 readers
  reachBasisPoints: number;
  contributionCents: number;        // sums to readerValueCents
  worthFromHereCents: number | null;
}>;

export type SeriesReadThroughValues = Readonly<{
  books: readonly SeriesBookValues[];
  fileSizeMB: number;
  defaultFileSize: boolean;
  deliveryCents: number;
  readerValueCents: number;
  highestAcosTenths: number | null;   // 0.1% units; null when book 1 is free or the profit target is invalid
  tenPointsCents: number | null;      // null when book 2 has 0 readers
  kenp: null | Readonly<{ rateText: string; month: string }>; // null when no KU pages
  ads: null | Readonly<{              // null only when the profit target is invalid
    profitTargetCents: number;
    mostToPayCents: number;
    noRoom: boolean;
    cost: null | Readonly<{ unit: "acos" | "per-reader"; costCents: number; leftCents: number }>; // leftCents may be negative
    highestCpcCents: number | null;
  }>;
  deal: null | Readonly<{             // null when no deal or a deal field is invalid
    kind: "free" | "price-change" | "countdown";
    enteredPriceCents: number;
    priceCents: number;
    limit: SeriesPriceLimit;          // price-change only
    rate: 0 | 35 | 70;
    royaltyCents: number;
    readThroughBasisPoints: number;
    usedOwnRate: boolean;
    valueCents: number | null;
    copiesToMatchTenths: number | null;
  }>;
  rulesVersion: string;               // KDP_ROYALTY_VERSION
}>;

export type SeriesReadThroughResult =
  | Readonly<{ status: "invalid"; fieldErrors: Partial<Record<SeriesField, string>> }>
  | Readonly<{ status: "calculated"; values: SeriesReadThroughValues; fieldErrors: Partial<Record<SeriesPartField, string>> }>;

export function calculateSeriesReadThrough(input: SeriesReadThroughInput): SeriesReadThroughResult;
```

- On `invalid`, return every field error found, not just the first.
- Reuse `getKdpEbookPricePoint`, `getKdpEbookDeliveryCents`, `getKdpEbookFloorCents`, `KDP_EBOOK_MAX_PRICE_CENTS`, `KDP_EBOOK_SEVENTY_MIN_CENTS`, `KDP_EBOOK_SEVENTY_MAX_CENTS`, `KDP_ROYALTY_VERSION`, `KDP_MAX_FILE_MB`, `parseKdpKenpRead`, `parseKdpKenpRate`, and `isValidKdpKenpMonth`. Don't change them or their results.
- Export from `lib/kdp/index.ts` if that file re-exports engines.
- No data, migration, API route, or script.

### Known examples

Worked by hand from KDP's rules and checked with the shared helpers. File size is 2 MB (delivery $0.30) unless stated.

| Case | Inputs | Expected |
| --- | --- | --- |
| Opening example | $4.99 × 3, copies 100, 55, 44 | Royalty $3.28 each. Steps 55.00%, 80.00%. Reach 100%, 55%, 44%. Reader value $6.53 (652.72¢). Contributions $3.28, $1.81, $1.44. Highest ACoS 130.8%. 10 points $0.59 (W = 590.4¢). Worth from here: $6.53, $5.90, $3.28. |
| Cheap book 1 | Book 1 $0.99, books 2 and 3 $4.99, copies 100, 55, 44 | Book 1 rate 35%, royalty $0.35. Reader value $3.60 (359.72¢). Highest ACoS 363.3%. |
| Outside the band | A book at $13.00 | Rate 35%, royalty $4.55 |
| Below minimum | Book price $0.50 | `below-minimum`, answered at $0.99, royalty $0.35 |
| Above maximum | Book price $250 | `above-maximum`, answered at $200.00, royalty $70.00 |
| File size | $4.99 at 1 MB / 5 MB | Royalty $3.39 / $2.97 |
| KU | Opening example plus KU pages 15,000, 9,000, 7,200, KENPC 300 each, rate 0.0045, month 2026-08 | Readers 150, 85, 68. Steps 56.67%, 80.00%. Earnings 395.50, 220.90, 176.72 dollars. Reader value $5.29 (528.747¢). Contributions $2.64, $1.47, $1.18. 10 points $0.47. |
| KU cap | Book 1 KENPC 4,000, KU pages 12,000, rate 0.0045 | Credited 3,000, `capped`, full reads 4, per full read $13.50, KU earnings $54.00 |
| Break-even ads | Opening example, ACoS 70%, conversion 10% | Cost per reader $3.49, left $3.03, most to pay $6.52, highest CPC $0.65 |
| Profit target | Opening example, profit $1.00, conversion 10% | Most to pay $5.52, highest ACoS 110.7%, highest CPC $0.55 |
| No room | Opening example, profit $7.00 | Most to pay $0.00, highest ACoS 0.0%, `noRoom` |
| Free deal | Opening example, deal 0 | Kind `free`, royalty $0.00, read-through 55% (`usedOwnRate`), deal value $3.25, copies to match 2.0 |
| Free deal, lower rate | Same, deal read-through 30% | Deal value $1.77, copies to match 3.7 |
| Countdown | Opening example, deal $0.99 `countdown` | Rate 70%, royalty $0.48, deal value $3.73, copies to match 1.8 |
| Price change | Opening example, deal $0.99 `price-change` | Rate 35%, royalty $0.35, deal value $3.60, copies to match 1.8 |
| Countdown, list above the band | Book 1 $13.00, deal $9.99 `countdown` | Rate 35%, royalty $3.50 (book 1 earns 35% at list) |
| Partial: Countdown cut too small | Opening example, deal $4.49 `countdown` | `calculated`, `deal: null`, `dealPrice` error |
| Partial: Countdown list too high | Book 1 $25.99, deal $9.99 `countdown` | `calculated`, `deal: null`, `dealKind` error |
| Over 100% | Copies 100, 120 at $4.99 | Step 120.00%, reach 120% |
| Zero gap | Copies 100, 0, 10 at $4.99 | Step 2 is 0.00%, step 3 null, book 2 worth from here null, 10 points null, reader value $3.61 (110 × 328 ÷ 100 = 360.8¢) |
| Invalid: one book | One row | `invalid`, `books` error |
| Invalid: no book 1 readers | Copies 0, 50 | `invalid`, `sales.0` error |
| Invalid: KU without rate | KU pages on book 2, rate empty | `invalid`, `kenpRate` and `kenpMonth` errors |
| Invalid: negative or decimal copies | `-5`, `12.5` | `invalid`, `sales.N` error |
| Partial: deal too high | Deal $5.99 with book 1 at $4.99 | `calculated`, `deal: null`, `dealPrice` error, reader value $6.53 |
| Partial: ACoS on free book 1 | Book 1 price 0, ad cost 50% ACoS | `calculated`, `ads.cost: null`, `adCost` error, `highestAcosTenths: null` |

### Ownership

- Sol builds `lib/kdp/series-read-through.ts`, its focused test `tests/pages/series-read-through-calculator/series-read-through.test.mjs` covering the examples above, and the development preview row the pipeline asks for.
- Opus builds `app/(site)/(tools)/series-read-through-calculator/series-read-through-calculator.tsx`, `series-read-through-calculator-from-url.tsx`, `series-read-through-calculator.module.css`, and `series-ladder.tsx`. Opus also adds `minItems` to the shared `UiRepeatableList`, under Components.
- Integration adds `page.tsx`, `layout.tsx`, the `content/*.mdx` wiring, the card art and its `lib/card-art.ts` key, the publish manifest, and the KDP Tools membership.

### Catalog placement

- Primary: KDP Tools (`/kdp-tools`). Its reader is an indie author pricing and selling a Kindle or print book. This tool answers the next question after a single book's royalty: what a series reader is worth, and what to spend to get one. Place it beside the KDP royalty calculator and the break-even ACoS calculator, which it links to.
- Secondary: none. No other catalog serves authors.

Card art, key `series-read-through-calculator`, `toolSpot`:

- Takeaway: readers carry from one book to the next, and fewer make each hop.
- Focal subject: three book spines standing in a row, the first a little taller.
- Relationship: a curved arrow hops from book 1 to book 2 and from book 2 to book 3, each arrow thinner than the last.
- Tone: neutral to positive, about momentum, not loss.
- No words or numbers. The spines and arcs must read at card size in both themes.

## Interface

### Flow

- The question: "What's one new reader worth across my series, and how much can I pay to get one?"
- Lead answer: `$6.53` for one new book 1 reader, across 3 books.
- Opens with: 3 books at $4.99, copies sold 100, 55, and 44. Result showing, marked `Example`.
- Button: `Calculate reader value`, with `Reset` beside it.

### Inputs

| Input | Basic or Advanced | Required or optional | Hint, one sentence or none | What it changes in the result |
| --- | --- | --- | --- | --- |
| Book N: Price | Basic | Required | The Kindle price on Amazon.com. Use 0 for a free book. | Royalty per copy, the reader value, and ACoS for book 1 |
| Book N: Copies sold | Basic | Required | Use the same dates for every book, such as the last 30 days. | Read-through, reach, and the reader value |
| Add book / remove book | Basic | 2 to 30 books | None | Series length |
| Converted file size | Advanced | Optional | Empty uses 2 MB. KDP shows it on the pricing page. | Delivery cost on 70% books, and the minimum price |
| KENP rate per page | Advanced, Kindle Unlimited | Optional, required with KU pages | KDP's per-page rate for the month the pages were read. | KU earnings |
| Rate month | Advanced, Kindle Unlimited | Optional, required with the rate | The month the rate is for, as year and month. | Labels the KU rate in the result |
| Book N: KU pages read | Advanced, Kindle Unlimited | Optional | KENP read in KDP Reports, over the same dates as its sales. | KU readers and earnings for that book |
| Book N: KENPC | Advanced, Kindle Unlimited | Optional, required with that book's KU pages | Find it under KDP Select info on your Bookshelf. | Full reads and KU per full read |
| Your ad cost (% ACoS or $ per reader) | Advanced, Ads | Optional | What ads cost you now, as ACoS on book 1 or per new reader. | Cost per reader and what's left after ads |
| Conversion rate | Advanced, Ads | Optional | Book 1 orders divided by ad clicks. | Highest CPC |
| Profit to keep per reader | Advanced, Ads | Optional | Empty means break even. | Most to pay, highest ACoS, highest CPC |
| Deal price | Advanced, Book 1 deal | Optional | A sale price for book 1. Use 0 for free. | The deal comparison |
| Deal type: `Price change` or `Countdown Deal` | Advanced, Book 1 deal | Optional | A Countdown Deal keeps the 70% royalty below $2.99. | Royalty per deal copy |
| Deal readers who read book 2 | Advanced, Book 1 deal | Optional | Empty uses your own book 1 to book 2 rate. | Deal reader value and copies to match |

The Advanced disclosure is `File size, KU reads, ads, and deals`, with `uiSetSummary`. Inside it, three small group labels: `Kindle Unlimited`, `Ads`, `Book 1 deal`. File size sits first, alone, above them. The KU per-book rows follow the Basic book list: same count and order, labeled `Book 1`, `Book 2`, with no add or remove of their own.

Required marks: the Basic price and copies fields always show `*`. The KENP rate, rate month, and each KENPC show `*` once any KU pages are entered.

### Result

Everything comes from the person's inputs. No benchmark, no grade, no sources.

1. **Lead.** `UiPrimaryResult`: label `A new book 1 reader is worth`, value `$6.53`, detail `across 3 books`. `Example` status word until the person calculates.
2. **Two supporting numbers**, `UiMetricGroup` in columns:
   - `Break-even ACoS on book 1` `130.8%`. Hint: `Ad spend ÷ ad sales, as Amazon Ads reports it.` With a profit target, the label reads `Highest ACoS on book 1`.
   - `10 more points to book 2 adds` `$0.59`. Hint: `What each reader gains if 10% more of them read book 2.`
3. **The ladder**, the visual. Title `Readers and earnings by book`, with the hint `A step tops 100% when a book had more readers than the one before.` One row per book. Each row has the book's name, a bar for reach drawn to scale (the longest reach fills the track), the reach as `55 of 100`, the step as `55%` from the book before, and the book's contribution to the reader value as `$1.81`. The eye sees readers thin out down the series and where the $6.53 comes from at the same time. Book 1's step shows `—`. Bars use the first data color. A book whose price hit a limit, or that pays 35% or is free, gets a short status word in its row: `KDP minimum`, `35%`, or `Free`.
4. **Ads**, only when an ad field or profit is set. `UiMetricGroup layout="list"`: `Most to pay per reader` (only with a profit target, since without one it equals the lead), `Your cost per reader`, `Left per reader after ads` (signed), `Highest CPC`.
5. **Book 1 deal**, only when a deal price is set. `UiMetricGroup layout="list"`: `Each deal reader is worth` `$3.25`, and `Deal copies to match one full-price reader` `2.0`. Status word `Uses your book 2 rate` when the deal read-through was empty.
6. **Per book**, `UiDataTable`, below everything: Book, Price, Royalty per copy, Readers, and Worth from this book on. With KU it adds Copies sold, KU full reads, and KU per full read, with `Capped` on capped books. Pros read this to advertise book 2 or 3, so "Worth from this book on" is the column they need.
7. **Footer row**: the KU rate as a status line when used (`KU at $0.0045 per page, 2026-08`), and `UiShareAction`.

Why the ladder and not a chart from the wrapper: the funnel kind cramps past 6 stages and puts labels on shapes, and a horizontal bar shows one value per row. The ladder needs reach, step, and money in one readable row for up to 30 books, and it must stack cleanly on phones. It's a small route component built from CSS bars, not a chart.

### Components

Existing shared components:

- `ToolWorkbench`, `ToolFieldRow`, `ToolResult` from `@/app/ui/tools/tool-workbench`
- `UiTextField`, `UiQuantityInput` (ad cost with its `% ACoS` and `$ per reader` units), `UiChoiceGroup` (deal type), `UiRepeatableList` (Basic books and the step that adds and removes them), `UiDisclosure`, `uiSetSummary`, `UiButton`, `UiShareAction`, `uiOption` from `@/app/ui/controls`
- `UiPrimaryResult`, `UiMetricGroup`, `UiStatus`, `UiStatusWord`, `UiActionRow`, `UiDataTable` from `@/app/ui/display`
- `useInitialQuery` from `@/app/ui/tools/use-initial-query`

Improved shared component, planned for the frontend round:

- `UiRepeatableList` gets `minItems?: number`. Remove buttons turn off while the list is at the minimum, so a series can't drop below 2 books. Its gallery example in `actions-and-forms.tsx` sets `minItems={1}`. Built in the frontend round.

Tool-specific components:

- `series-ladder.tsx`: the ladder above. Rows from the engine's `books`, a CSS bar per row, a visually hidden table for screen readers, and status words per row.
- `series-read-through-calculator.tsx`: the form, state, and result. `series-read-through-calculator-from-url.tsx` reads shared links, following `dns-lookup` and the KDP royalty calculator.

### Layout

Desktop, at the 66rem working width:

- Basic: the book list, one row per book. Each row has `Book 1` as its label, then Price and Copies sold side by side, then remove in the last column. The list sits at about half the working width, not stretched, with `Add book` under it.
- Advanced, closed. When open: file size alone. Then `Kindle Unlimited`: one `ToolFieldRow` with KENP rate and rate month, then one row per book with KU pages read and KENPC. Then `Ads`: one row with ad cost, conversion rate, and profit. Then `Book 1 deal`: one row with deal price, deal type, and deal read-through.
- Action row: `Calculate reader value`, `Reset`, and `Inputs changed` when stale.
- Result: the lead and its two metrics in a left column, about a third of the width. The ladder fills the right two thirds, so the eye lands on $6.53 and then follows the bars down. Ads and deal lists sit side by side under them when shown. The per-book table runs full width below, then the KU status and Share.

Phones: everything stacks in reading order. Book rows keep Price and Copies sold side by side, since both are short. The lead, then the two metrics in two columns, then the ladder. Each ladder row puts the name, reach, step, and money on one line, with the bar full width under it. The ads and deal lists stack. The table turns into labeled rows, as `UiDataTable` does.

### States

- **Opens** on the example with its result and `Example`. Reset returns there.
- **Stale:** any edit keeps the result, steps it back with `ToolResult stale`, and shows `Inputs changed`.
- **Invalid:** on press, errors show under each field and focus goes to the first one. If it's inside Advanced, Advanced opens first. The last good result stays, stepped back.
- **Partial:** a bad ad, profit, or deal field hides only its own group, with the error on the field. The lead, ladder, and table stay current.
- **Price below KDP's minimum or above $200:** the book answers at the limit. Its ladder row shows `KDP minimum` or `KDP maximum`, and the table shows the answered price.
- **Outside the 70% band:** the row shows `35%`, and the table shows the royalty at 35%.
- **Free book:** `Free` in its row. If book 1 is free, the ACoS metric shows `—` and the ads list still shows dollars.
- **KENPC above 3,000:** `Capped` in the table's KU column.
- **Profit target at or above the reader value:** most to pay `$0.00`, ACoS `0.0%`, CPC `$0.00`, with status `No room for ad spend`.
- **A step above 100%:** shown as is, such as `120%`. Bars scale to the longest reach, so nothing overflows.
- **A book with 0 readers:** its reach is 0, the next step shows `—`, and its worth from here shows `—`.
- **Book 2 has 0 readers:** `10 more points to book 2 adds` and the deal value show `—`.
- **Deal copies can't match** (deal value $0.00, such as free with 0% read-through): `—`.
- **Book list at 30:** `Add book` turns off. At 2: remove turns off through `minItems`.
- **Shared link:** opens and calculates. Invalid values in it show errors the same way.

## Content

### Search intent and title

- Main query: "series read-through calculator". The title leads with KDP so it reads as an author tool, not a reader one, and names the money outcome (reader value, ad budget). Close variants: "how to calculate read-through", "how much to spend on ads for book 1", "should I make book 1 free", "permafree series calculator".
- What the searcher wants: their read-through at each step, what a new reader is worth across the series, and an ad ceiling they can act on.
- Visible title (`title`, the H1): `KDP series read-through calculator: what one new reader earns you`
- Search title (`meta_title`): `KDP series read-through calculator: reader value and ad budget`
- Search description (`meta_description`): `See read-through from book to book in your KDP series, what one new reader earns you, and the most you can spend on ads to get one. Works with Kindle Unlimited.`
- Card name (`card_name`): `KDP series read-through calculator`
- Card description (`card_description`): `See book-to-book read-through, what a new reader earns, and your break-even ad cost.`

### Reader questions

| Question | Answered in |
| --- | --- |
| What is one new book 1 reader worth across my series? | Tool result; article, "What is one new reader worth?" |
| How much can I spend on ads to get one, and what ACoS or CPC is that? | Tool result and Ads part; article, "How much can I spend on ads to get one new reader?" |
| What's my read-through at each step, and how do I work it out? | Ladder; article, "How do you calculate series read-through?" |
| Why is one step above 100%? | Ladder hint; usage table; article, "Why is my read-through above 100%?" |
| Should book 1 be free or on sale? What does the deal read-through change? | Book 1 deal part; usage, after the input list; article, "Should I make book 1 free or put it on sale?" |
| How does Kindle Unlimited change the number, and which KENP rate do I use? | Usage; article, "How does Kindle Unlimited change the number?" |
| Is my read-through good? | Article, "What is a good read-through rate?" No grade in the tool. |
| Why does KDP pay less than the estimate? | Article, "Why might KDP pay me less than this?" |

### Outline

- Intro: what the tool shows (read-through per step, what a new reader is worth, the ad ceiling), and what to have ready (each book's price and copies sold over the same dates).
- Usage: what to enter, including planning an unreleased book with expected copies; each Advanced group in plain words; what the deal read-through changes, since the result doesn't repeat it. Then a table on reading each part of the result, and the opening example worked through as an example box.
- Article, in order:
  1. How do you calculate series read-through? Formula box, the later-over-earlier order, and KU full reads as an estimate.
  2. Why is my read-through above 100%? Bullets of causes. Not an error.
  3. What is one new reader worth? Formula box, the "every later reader came through book 1" assumption, and links to KDP pricing pages and `/kdp-royalty-calculator`.
  4. How much can I spend on ads to get one new reader? ACoS definition, Amazon's attribution, example box, CPC, link to `/kdp-break-even-acos-calculator`, and a warning on cash timing.
  5. How does Kindle Unlimited change the number? Example box, the 3,000 page cap, monthly rate with no default, link to `/kindle-unlimited-kenp-earnings-calculator`.
  6. Should I make book 1 free or put it on sale? Formula box, a comparison table of four deals, and a table of KDP's free day, Countdown, and permafree rules.
  7. What is a good read-through rate? The commonly quoted range with no sample behind it, and no grade.
  8. Why might KDP pay me less than this? Bullets.
  9. What doesn't this calculator cover? Bullets and links.

### Facts, limits, and sources

All checked 2026-10-13.

- 70% from $2.99 to $12.99 on Amazon.com since July 7, 2026: [KDP eBook list price requirements](https://kdp.amazon.com/en_US/help/topic/G200634560).
- Royalty formulas, delivery at $0.15 per MB, price matching, and the Countdown royalty: [KDP digital book pricing](https://kdp.amazon.com/help/topic/G200634500).
- Countdown rules: KDP Select for 30 days, list price $2.99 to $24.99, unchanged 30 days before and 14 after, a cut of at least $1.00, up to 7 days, one per term, not with free days in the same term, and the selected royalty rate during the deal: [Kindle Countdown Deals](https://kdp.amazon.com/en_US/help/topic/G201293780).
- Free days, 5 per 90-day term, no rollover: [Free Book Promotions](https://kdp.amazon.com/en_US/help/topic/G201298240).
- KDP Select exclusivity: [KDP Select enrollment](https://kdp.amazon.com/en_US/help/topic/GD9PMU58BV24QFZ7).
- KU first reads, the 3,000 page cap per borrow, and the rate finalized near the 15th: [KU royalties and KENPC](https://kdp.amazon.com/help/topic/G201541140).
- Payment about 60 days after the month of sale: [Royalties estimator](https://kdp.amazon.com/en_US/help/topic/G6BZ4M9PVJ8YSCW8).
- The "50 to 60%" phrase: [Kindlepreneur](https://kindlepreneur.com/calculate-series-read-through/), with no sample or method. Shown as commonly quoted, never as a benchmark.

Claims to avoid: any current KENP rate; a read-through benchmark or grade; Amazon's attribution window (unverified); how free readers carry on compared with paid ones (forum titles only); whether a book qualifies for KDP Select or a deal.

### Next step

- `/kdp-royalty-calculator` for one book's royalty, and for print editions.
- `/kdp-break-even-acos-calculator` to set a bid for one book.
- `/kindle-unlimited-kenp-earnings-calculator` for one book's KU earnings in a month.
