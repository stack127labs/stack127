# Churn rate converter

Route: `/churn-rate-converter`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher has a customer churn rate for one period and needs the same rate for another period. Most often they have a monthly rate and need the annual figure for a plan, an investor update, or a benchmark that is quoted per year. Some have the reverse: an annual non-renewal rate they want to compare with monthly numbers. Underneath is a doubt: "Can I just multiply by 12?"

Where the current top results fail them:

- Most converters go one way only, monthly to annual. Only SubJolt and Refgrow take a quarterly rate, and both make you enter customer counts first. None of the six takes an annual rate and returns a monthly one.
- Bad input goes through. Churnkey shows `-1` in the field but calculates with 1%. ChurnTools, Refgrow, and Subscription Index accept 101% churn, and Refgrow then shows −1% retention.
- Only katlab shows the wrong `× 12` figure next to the right one, which is the fastest way to see why the tool exists.
- The converted rate is presented as if it were measured. No result says it assumes the same share leaves every period, or that an annual-plan customer doesn't really get a monthly chance to cancel.
- Several pages add a "Good" or "High" grade without a source. Refgrow calls 5% monthly good, and SubJolt calls it high.
- Lifetime is shown with false precision. At 100% quarterly churn, SubJolt and Refgrow both show a 1-month lifetime, though the input says nothing about when inside the quarter people left.

What this tool does better:

1. One rate and its period in, equivalent monthly, quarterly, and annual rates out, in every direction.
2. The wrong linear figure (`× 12`, `÷ 12`, `× 4`, and so on) sits beside each converted rate, so the reader sees how far off it is.
3. Retention beside every rate, and a plain "out of 100 customers" view of one year, labeled as expected values.
4. Average lifetime as a model estimate in the period the user entered, and `Not estimable` at 0%.
5. Values below 0% or above 100% are rejected with a message under the field. Nothing is clamped. A negative rate gets a short note that negative net revenue churn isn't customer churn.
6. The constant-rate assumption is stated in the result. An annual source rate also gets the annual-plan caveat.
7. No grades or benchmarks.

## Product

### Promise and scope

The primary user is an indie hacker or solo SaaS founder who already has a customer (logo) churn rate for one period, from their billing tool, dashboard, or the customer churn calculator. The tool gives the constant-rate equivalent of that rate for a month, a quarter, and a year, with retention, the linear mistake for contrast, a 100-customer view of one year, and the model's average lifetime.

Launch scope:

- Customer churn only.
- One rate, as a percent with up to two decimals, from 0 to 100.
- One source period: month, quarter, or year. A quarter is 3 months and a year is 12 months.
- Outputs for all three periods, always in month, quarter, year order.

Exclusions:

- Calculating churn from customer counts. `/customer-churn-calculator` does that, and the page links to it.
- Revenue churn, gross or net. A revenue mode would need its own labels: negative net churn is revenue growth, and it has no customer lifetime or 100-customer view. The article explains the boundary and links to `/revenue-churn-calculator` and `/net-revenue-retention-calculator`. No revenue toggle.
- Custom period lengths, such as 6 months or 2 years. They're rare in the research and would turn three plain choices into a number field.
- Cohort curves, renewal-date analysis, and churn that changes with customer age.
- Grades, benchmark bands, recommendations, LTV, money, URL sharing, saved scenarios, and export.

### Technical contract

**Inputs.**

| Input | Accepted value | Notes |
| --- | --- | --- |
| Churn rate (`rate`) | String. A percent from `0` to `100`, with up to two decimals. Required. | Share of customers at the start of one period who left by its end. |
| Period (`period`) | `month`, `quarter`, or `year`. Default `month`. | The period the rate was measured over. |

**Parsing `rate`,** in this order. Use `parsePercentHundredths` from `lib/saas-economics/shared.ts` for the number itself. Don't write a second decimal parser.

1. Not a string, or blank after trimming: `missing`.
2. Trim. Remove one trailing `%` and trim again, so a pasted `5%` or `5 %` works. Anything left empty: `missing`.
3. Starts with `-`: `belowZero`. This applies to `-0` too, since a sign has no use here.
4. Matches `^\d+\.\d{3,}$`: `tooPrecise`.
5. Call `parsePercentHundredths(text, { min: 0n, max: 10000n })`. `format` stays `format`, `range` becomes `aboveHundred`, and `missing` can't happen here.

Commas, spaces inside the number, a leading `+` or `.`, a trailing `.`, and exponents are `format`. `0`, `0.00`, `100`, and `100.00` are valid. Leading zeros are fine: `05` is 5%.

**Validation codes and messages.** The engine owns the messages, like the sibling engines. The writing session may reword them later in the engine.

| Field | Code | Message |
| --- | --- | --- |
| `rate` | `missing` | `Enter a churn rate from 0 to 100%.` |
| `rate` | `format` | `Use digits only, like 5 or 4.25.` |
| `rate` | `tooPrecise` | `Use up to two decimals.` |
| `rate` | `belowZero` | `Churn can't be below 0%. Negative net revenue churn isn't customer churn, so it can't be converted here.` |
| `rate` | `aboveHundred` | `Churn can't be above 100%. A period can't lose more customers than it started with.` |
| `period` | `unknownPeriod` | `Choose monthly, quarterly, or annual.` |

Both fields are checked on every call, so both errors can show at once.

**Formula.** Let `h` be the rate in hundredths of a percent (0 to 10000), `r = (10000 − h) / 10000` the source retention, and `s` and `t` the source and target period lengths in months. Target retention is `R = r^(t / s)` and target churn is `1 − R`. This is the research formula `target = 1 − (1 − source)^(t/s)`.

The exponent is always one of `1`, `3`, `4`, `12`, `1/3`, `1/4`, or `1/12`:

| Source → target | Exponent | Kind |
| --- | --- | --- |
| Same period | 1 | Identity |
| Month → quarter, month → year, quarter → year | 3, 12, 4 | Whole power, exact fraction |
| Quarter → month, year → quarter, year → month | 1/3, 1/4, 1/12 | Root, irrational in general |

**Numeric method.** Do every step in `bigint`. No floating point anywhere in the engine, including roots.

- Whole power `n`: churn is the exact fraction `1 − (10000 − h)^n / 10000^n`. Build it with `exactFraction` and round with `roundExact(value, 10000n)` from `lib/saas-economics/unit-economics.ts`. The numbers stay small: `10000^12` is 10^48.
- Root `1/n`: the root itself is never computed. Rounding only needs to know which side of each half-step the true value falls on, and that comparison can be raised to the power `n` and done exactly. The rounded churn in hundredths of a percent is the largest whole `k` from 0 to 10000 for which `k = 0` or

  `(10000 − h) × 20000^n ≤ (20001 − 2k)^n × 10000`.

  Find `k` by binary search, about 14 comparisons. Why it works: churn is at least `(k − ½) / 10000` exactly when `R ≤ (20001 − 2k) / 20000`, and both sides are non-negative, so raising them to the power `n` keeps the order, and `R^n = r` is exact. Ties round up, matching the half-up rule. This method was checked against 70-digit decimals for every `h` from 0 to 10000 and every root, with no mismatch.
- Identity: churn is `h`.

**Rounding.** All rates are returned in hundredths of a percent, so `4596` is `45.96%`.

- Churn: half up, as above. Every rate is between 0 and 100%, so half up and half away from zero are the same.
- Retention: `10000 − churn hundredths`, taken from the rounded churn. Each pair adds up to exactly 100.00%. Never round retention separately.
- `roundedToZero`: true when the exact churn is above 0 but rounds to `0`. The interface shows `Under 0.01%` for churn, and `Over 99.99%` for its retention.
- `nearlyAll`: true when the exact churn is below 100% but rounds to `10000`. The interface shows `Over 99.99%` for churn and `Under 0.01%` for its retention. Exact 0% and exact 100% show plainly.
- Exact churn is above 0 exactly when `h > 0`, and below 100% exactly when `h < 10000`. Both flags come from that and the rounded value.

**Linear estimate,** the wrong figure the tool shows for contrast. For each target period other than the source: `h × t / s`, as an exact fraction rounded half up to hundredths of a percent. It can go above 100%: 10% monthly × 12 is 120%. Return it as it is and set `overHundred`. Set `roundedToZero` the same way as for churn. The source row has no linear estimate.

**100 customers over a year.** From the exact annual churn `A`, which is always a whole power or the identity, never a root:

- `lost` is `A × 100` rounded half up to a whole number of customers, with `roundExact(A, 100n)`. Don't round the already rounded annual hundredths again.
- `remaining` is `100 − lost`, so the two always add up to 100.
- `lostUnderOne`: `A > 0` and `lost` is 0.
- `remainingUnderOne`: `A < 1` and `lost` is 100.

These are expected values from the model. The interface says "about 46", not "46", unless the source rate is exactly 0% or 100%.

**Average lifetime.** `1 ÷ churn`, in the source period: `10000 / h` periods, rounded half up to tenths with `roundExact(exactFraction(10000n, h), 10n)`. It ranges from 1.0 (at 100%) to 10,000.0 (at 0.01%). At `h = 0` the result is `notEstimable` with reason `zeroChurn`. Never return zero, `Infinity`, or a value from a substituted rate.

Lifetime stays in the source period on purpose. In this discrete model, `1 ÷ monthly equivalent` doesn't equal `3 × (1 ÷ quarterly rate)`: 5% quarterly gives 20 quarters, while its 1.70% monthly equivalent gives 59 months, not 60. Showing only the source period avoids two lifetimes that disagree.

**Lead period.** `year` when the source is `month` or `quarter`. `month` when the source is `year`.

**Action and handling.** `Convert churn rate` is the only primary action.

- A valid submit shows the results and focuses the lead result.
- An invalid submit clears any old result, keeps the raw input, shows the error under the field, and focuses it.
- Editing the rate or changing the period clears the result and announces `Inputs changed. Convert again.`
- Reset clears the rate, sets the period back to monthly, clears errors and results, and focuses the rate field.

**Privacy and security.** The conversion runs in the browser. The rate never goes to a server, the URL, cookies, storage, logs, or analytics. The clean URL stays unchanged. No API route, dataset, or background job.

### Backend contract

Same runtime rules as the other SaaS economics engines: safe for `--experimental-strip-types`, no enums or namespaces, explicit `.ts` imports, and no DOM, network, time, randomness, or floating point.

Reuse:

- `parsePercentHundredths` from `lib/saas-economics/shared.ts`.
- `exactFraction`, `compareExact`, and `roundExact` from `lib/saas-economics/unit-economics.ts`.

Don't change either shared file. If something there is missing, report it instead of adding a parallel helper.

#### `lib/churn-rate-converter/engine.ts`

```ts
export const CHURN_PERIODS = ["month", "quarter", "year"] as const;
export type ChurnPeriod = (typeof CHURN_PERIODS)[number];
export const CHURN_PERIOD_MONTHS: Readonly<Record<ChurnPeriod, number>> = { month: 1, quarter: 3, year: 12 };

export type ChurnRateInput = { rate: string; period: string };

export type ChurnRateErrorCode = "missing" | "format" | "tooPrecise" | "belowZero" | "aboveHundred";
export type ChurnRateErrors = {
  rate?: { code: ChurnRateErrorCode; message: string };
  period?: { code: "unknownPeriod"; message: string };
};

/** A rate in hundredths of a percent: 4596 is 45.96%. */
export type ChurnPercent = {
  hundredths: number;      // 0 to 10000
  roundedToZero: boolean;  // exact value > 0, rounded value 0
  nearlyAll: boolean;      // exact value < 100%, rounded value 10000
};

export type ChurnLinearEstimate = {
  hundredths: number;      // 0 or more; may exceed 10000
  overHundred: boolean;    // hundredths > 10000
  roundedToZero: boolean;
};

export type ChurnPeriodRow = {
  period: ChurnPeriod;
  isSource: boolean;
  churn: ChurnPercent;
  /** 10000 - churn.hundredths. roundedToZero mirrors churn.nearlyAll; nearlyAll mirrors churn.roundedToZero. */
  retention: ChurnPercent;
  /** null on the source row. */
  linearEstimate: ChurnLinearEstimate | null;
};

export type ChurnCohortOf100 = {
  lost: number;               // 0 to 100, whole customers, half up from the exact annual churn
  remaining: number;          // 100 - lost
  lostUnderOne: boolean;
  remainingUnderOne: boolean;
};

export type ChurnLifetime =
  | { kind: "finite"; tenths: number; period: ChurnPeriod } // 10 to 100000, in the source period
  | { kind: "notEstimable"; reason: "zeroChurn" };

export type ChurnConversion = {
  source: { hundredths: number; period: ChurnPeriod };
  rows: [ChurnPeriodRow, ChurnPeriodRow, ChurnPeriodRow]; // always month, quarter, year
  leadPeriod: ChurnPeriod;    // "year", or "month" when the source is "year"
  yearOf100: ChurnCohortOf100;
  lifetime: ChurnLifetime;
};

export type ChurnRateCalculation =
  | { status: "valid"; values: ChurnConversion; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: ChurnRateErrors };

/** Never throws for any input, including null, arrays, and non-string fields. */
export function convertChurnRate(raw: unknown): ChurnRateCalculation;
```

Notes for the builder:

- `raw` that isn't a plain object is invalid with both a `rate` `missing` error and a `period` `unknownPeriod` error.
- `period` is matched exactly after trimming. `Monthly`, `MONTH`, and `12` are `unknownPeriod`.
- Keep the root comparison in a small unexported helper. Throwing is only for programmer errors, and the public function must not throw.

#### Focused test: `tests/pages/churn-rate-converter/engine.test.mjs`

Use the examples below. Check every row value and flag, the 100-customer counts, and the lifetime. Also check that retention plus churn is 10000 on every row for every `h` from 0 to 10000 with every source period. That loop is cheap and protects the rounding.

### Known examples

Calculated independently with 60 to 70 digit decimals, not with the engine method. Rates are percent. Linear estimates are in brackets.

| # | Input | Monthly | Quarterly | Annual | Of 100 in a year | Lifetime |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 5% monthly | 5.00% (source) | 14.26% [15.00%] | 45.96% [60.00%], retention 54.04% | 46 lost, 54 remain | 20.0 months |
| 2 | 5% quarterly | 1.70% [1.67%] | 5.00% (source) | 18.55% [20.00%] | 19 lost, 81 remain | 20.0 quarters |
| 3 | 20% annual | 1.84% [1.67%] | 5.43% [5.00%] | 20.00% (source) | 20 lost, 80 remain | 5.0 years |
| 4 | 3.5% monthly | 3.50% | 10.14% [10.50%] | 34.79% [42.00%] | 35 lost, 65 remain | 28.6 months |
| 5 | 10% monthly | 10.00% | 27.10% [30.00%] | 71.76% [120.00%, `overHundred`] | 72 lost, 28 remain | 10.0 months |
| 6 | 45.96% annual | 5.00% [3.83%] | 14.26% [11.49%] | 45.96% | 46 lost, 54 remain | 2.2 years |

Exact working for the three anchor examples:

- 5% monthly: `1 − 0.95^12 = 0.459639912…`, so 45.96% annual and 54.04% retention. `0.95^3 = 0.857375`, so 14.2625% quarterly, shown as 14.26%.
- 5% quarterly: `1 − 0.95^(1/3) = 0.016952427…`, so 1.70% monthly. `1 − 0.95^4 = 0.18549375`, so 18.55% annual.
- 20% annual: `1 − 0.8^(1/12) = 0.018423470…`, so 1.84% monthly. `1 − 0.8^(1/4) = 0.054258390…`, so 5.43% quarterly.

Boundaries:

| Input | Expected |
| --- | --- |
| `0` monthly | Every row 0.00% churn and 100.00% retention, no flags. Linear 0.00%. 0 lost, 100 remain, no flags. Lifetime `notEstimable`, `zeroChurn`. |
| `100` quarterly | Every row 100.00%, no flags. Monthly linear 33.33%. Annual linear 400.00%, `overHundred`. 100 lost, 0 remain, no flags. Lifetime 1.0 quarter. |
| `0.01` annual | Monthly churn 0 with `roundedToZero` (exact 0.000833…%). Quarterly churn 0 with `roundedToZero` (exact 0.0025000…%). Both retentions 10000 with `nearlyAll`. Both linear estimates 0 with `roundedToZero`. 0 lost with `lostUnderOne`, 100 remain. Lifetime 10000.0 years. |
| `0.01` monthly | Quarterly 0.03% (exact 0.029997…%). Annual 0.12% (exact 0.119934…%). 0 lost, `lostUnderOne`. Lifetime 10000.0 months. |
| `99.99` monthly | Quarterly and annual churn 10000 with `nearlyAll`, retention 0 with `roundedToZero`. Annual linear 1199.88%, `overHundred`. 100 lost, 0 remain, `remainingUnderOne`. Lifetime 1.0 month. |
| `0.5` annual | 100-customer tie: exact 0.5 lost rounds half up to 1 lost, 99 remain. |
| `0.02` annual | Quarterly exact 0.0050004%, rounds to 0.01%, so not `roundedToZero`. Quarterly linear exact 0.005% is a tie and rounds to 0.01%. |
| `0.06` annual | Monthly exact 0.0050014%, rounds to 0.01%. Monthly linear exact 0.005% rounds to 0.01%. |
| `66.35` quarterly | Root near a tie: monthly exact 30.444999802…%, so 30.44%, not 30.45%. |
| `0.64` monthly | Lifetime tie: exact 156.25 rounds to 156.3 months. |

Parsing:

| Raw `rate` | Result |
| --- | --- |
| `" 5% "` | Valid, 500. |
| `"05"` | Valid, 500. |
| `""`, `"  "`, `"%"`, `undefined`, `5` (a number) | `missing` |
| `"5,5"`, `"1e2"`, `".5"`, `"5."`, `"+5"`, `"five"`, `"5%%"` | `format` |
| `"4.567"` | `tooPrecise` |
| `"-1"`, `"-0"` | `belowZero` |
| `"100.01"`, `"101"`, `"9999999999999"` | `aboveHundred` |
| `period: "Monthly"`, `""`, missing | `unknownPeriod`, alongside any rate error |

### Ownership

Sol builds the backend:

- `lib/churn-rate-converter/engine.ts`
- `tests/pages/churn-rate-converter/engine.test.mjs`
- The development preview row in `public.stack127_pages` and `public.stack127_tool_pages`, with a clearly marked placeholder title and the placeholder Markdown fields the tables require.

Opus builds the frontend:

- `app/(site)/(tools)/churn-rate-converter/page.tsx`, `layout.tsx`, `churn-rate-converter.tsx`, and `churn-rate-converter.module.css`.
- Placeholder `content/intro.mdx`, `content/usage.mdx`, and `content/article.mdx`, so the route renders until the writing session replaces them.
- Card art in `app/(site)/(tools)/churn-rate-converter/art/`, registered as `churn-rate-converter` in `lib/card-art.ts`.

No shared file changes are planned.

### Catalog placement

Primary and only catalog: `/saas-tools`. A founder there is comparing churn, LTV, and revenue calculators. This converter is the step between the customer churn calculator, which produces a rate for one period, and the LTV calculator, which needs that rate on a monthly or annual basis. Place it directly after `/customer-churn-calculator` and confirm the full order during integration. No secondary catalog serves this task.

Card `toolSpot` art key: `churn-rate-converter`.

- Visual takeaway: customers lost add up more slowly each period, because each period starts with fewer customers. Multiplying one period's loss overstates the total.
- Focal subject: five filled bars of customers lost so far, rising along flattening steps.
- Supporting relationship: a dashed outline on top of the last bar, reaching the height a straight multiply would give.
- Tone: calm and explanatory. No danger red or health colors.
- Keep it wordless. No numbers, `%`, `× 12`, calendar pages, clocks, money, or a generic calculator icon. It reads at card size in both themes, and it looks different from the `customer-churn-calculator` card, which shows one group with one departing mark.
- Built as the `churnCompounding` `toolSpot` motif. A straight dashed line across shrinking bars was tried first and dropped, because the line had to run through the bars.

## Interface

### Flow

- Question: "What is my churn rate as a monthly, quarterly, or annual rate?"
- Minimum inputs: the rate and the period it covers. Both always visible. Control mode is `single`.
- Primary action: `Convert churn rate`. Reset is the quiet secondary action.
- Lead answer: the equivalent rate for the lead period, usually annual churn.
- Supporting order: lead result, then the table of all three periods, then one year out of 100 customers, then average lifetime, then the assumption note.

The workbench reads in one pass:

```text
Churn rate [ 5      % ]     Period ( Monthly | Quarterly | Annual )
[Convert churn rate]  [Reset]
-----------------------------------------------------------------
Annual churn
45.96%
Equivalent of 5% monthly churn.

Period     Churn            Retention   Multiplying instead
Monthly    5.00% (entered)  95.00%      —
Quarterly  14.26%           85.74%      15.00%
Annual     45.96%           54.04%      60.00%

Out of 100 customers, over a year
[█████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░]
About 46 leave · About 54 remain

Average lifetime   20 months (model estimate)

Assumes the same share of remaining customers leaves every month.
```

The interface words above are working labels. The writing session sets the final words.

The lead value appears again as one table row. That's deliberate: the table is the full conversion, and it holds the linear comparison for every period. Nothing else repeats. The 100-customer view repeats annual churn as counts, which is the reading most founders want and the relationship the bar draws.

### Components

Existing shared components:

| Use | Component | Import |
| --- | --- | --- |
| Rate field, with a `%` suffix and `inputMode="decimal"` | `UiTextField` | `@/app/ui/controls` |
| Period, three visible choices | `UiChoiceGroup` | `@/app/ui/controls` |
| Convert and Reset | `UiButton`, `UiActionRow` | `@/app/ui/controls`, `@/app/ui/display` |
| Changed-input and reset announcements, unexpected failure | `UiStatus` | `@/app/ui/display` |
| Lead result | `UiPrimaryResult` | `@/app/ui/display` |
| Three-period table | `UiDataTable`, right-aligned number columns | `@/app/ui/display` |
| One year out of 100 customers | `UiAllocationBar`, `accent` palette, lost as the accent segment | `@/app/ui/display` |
| Average lifetime | `UiKeyValueList`, one row | `@/app/ui/display` |
| Page shell and header | `ToolPageShell`, `ToolPageHeader`, `ToolPageArticle`, `PageCanvas` | as in `customer-churn-calculator/page.tsx` |

The period uses visible choices, not `UiSelect`, because mixing up a quarterly and a monthly rate is the most likely error, and the doc says not to hide three important choices in a dropdown. That rules out `UiQuantityInput` too.

New or improved shared components: none. Every region fits an existing component. `UiAllocationBar`'s `formatValue` gets only the value, but that's enough: the two segments add up to 100, so a value of 0 or 100 can be matched to its flags without knowing the segment.

Tool-specific code, all in `churn-rate-converter.tsx`:

- `ChurnRateConverter`, the client workbench, following the `customer-churn-calculator.tsx` structure: form state, submit, clear on edit, reset, focus handling.
- Small format helpers: `formatPercent(ChurnPercent)` (`Under 0.01%`, `Over 99.99%`, or two decimals), `formatLinear`, `formatLifetime` (drop `.0`, use the source period name, singular at exactly 1.0), and `formatOf100`.

### Display rules

- Period names: `Monthly`, `Quarterly`, `Annual` in the choice group and table. `month`, `quarter`, `year` in lifetime and the assumption note.
- Lead label: `Annual churn` or `Monthly churn`. Detail: `Equivalent of {rate} {period} churn.` A rate at exactly 100% or 0% still shows normally.
- Source row: its churn cell adds a quiet `(entered)` tag. Its linear cell shows `—` with an accessible label such as `Not applicable`.
- Linear column header names the mistake. Values over 100% show as they are, such as `120.00%`. Don't style them as errors. The header and the article explain them.
- 100-customer legend: `About 46 leave`, `About 54 remain`. For exact 0% and 100% source rates, drop "About": `0 leave`, `100 remain`, or `100 leave`, `0 remain`. With `lostUnderOne`: `Fewer than 1 leaves`. With `remainingUnderOne`: `Fewer than 1 remains`. A zero segment keeps its legend entry and gets no bar width.
- Lifetime: `20 months`, `2.2 years`, `156.3 months`, `10,000 years`, `1 quarter`. At 0%: `Not estimable at 0% churn`. The row label says it's a model estimate.
- Assumption note, below the results in `--text-small`: `Assumes the same share of remaining customers leaves every {source period}.`
- Annual-plan note, only when the source period is `year`, beside the assumption note: `A monthly equivalent doesn't mean annual-plan customers can cancel every month.` Keep both as plain result text, not `Callout` or `Warning`, which are editorial blocks.
- No tone colors on any result. Every `UiPrimaryResult` uses `neutral`.

### States

| State | Behavior |
| --- | --- |
| Initial | Empty rate field, `Monthly` selected, Convert enabled after hydration, no result region. |
| Valid | Result region below one divider. Focus moves to the lead result. |
| Invalid | One message under the rate field, from the engine. Focus moves to the rate field. Any old result is cleared. The raw input stays. A `period` error can't happen through the interface; if it does, show it under the choice group. |
| Edited after a result | Result clears. `UiStatus` says `Inputs changed. Convert again.` |
| Reset | Rate empty, `Monthly`, no errors or results. `UiStatus` says `Converter reset.` Focus on the rate field. |
| Unexpected failure | The engine shouldn't throw. If it does, catch it, clear the result, and show one `UiStatus` with `danger` tone: `The rate couldn't be converted. Try again.` Keep the input. |
| Long values | The longest values are `Over 99.99%`, `1199.88%`, `10,000 quarters`, and `Not estimable at 0% churn`. They must fit their cells at 320px without overflow. |
| Loading, empty, partial, retry, restored | Don't apply. The conversion is instant and local, and there's no URL state. |

### Responsive and accessible behavior

- Desktop: the rate field and period choices share one row, about 1:2. Convert and Reset sit below them. Results stack at the workbench's inner measure, which follows the `customer-churn-calculator` CSS: 66rem max, one divider above the results.
- Mobile, under 760px: rate field, then period choices, then the actions, then results, in that order. The three choices stay on one row if they fit at 320px, otherwise they wrap as the shared choice row already does. `UiDataTable` becomes labeled rows on small screens. Check that the `(entered)` tag and the `—` cell still read correctly there.
- Keyboard: rate field, period radios (arrow keys move within the group), Convert, Reset. Enter in the rate field submits.
- Focus: lead result after a valid submit, rate field after an invalid submit or reset.
- Announcements: field errors through the field's error text. Changed-input, reset, and failure messages through `UiStatus`. The lead `output` is focused, so its label and value are read.
- Both themes: the allocation bar accent and the table must keep contrast in light and dark.

### Checks for the frontend round

- Example 1 (5% monthly) shows 45.96% annual, 54.04% retention, 60.00% linear, about 46 of 100, and 20 months.
- Example 3 (20% annual) shows 1.84% monthly as the lead and the annual-plan note.
- `-1` shows the `belowZero` message under the field with no result. `101` shows `aboveHundred`.
- `0` shows `Not estimable at 0% churn`. `0.01` annual shows `Under 0.01%`.
- Changing the period after a result clears it.
- Desktop and mobile widths, both themes. The URL stays clean.

## Content

The writing session fills this section with `skills/stack127/tools/stack127-tool-writing/SKILL.md`. Page copy uses existing components only.

Notes for the writing session from planning:

- Title and lead should use the "monthly to annual churn rate calculator" wording, per research.
- An optional reference table of common monthly rates and their annual equivalents fits the article as a Markdown table. These values come from the same 60-digit calculation as the examples: 1% → 11.36%, 2% → 21.53%, 3% → 30.62%, 5% → 45.96%, 7% → 58.14%, 10% → 71.76%, 15% → 85.78%.
- The article explains customer churn versus gross and net revenue churn, and why negative net churn can't go into this tool.

### Search intent and title

Used once: 5% monthly showed 45.96% annual churn as the lead, 14.26% quarterly, 60.00% in the shortcut column, about 46 of 100 leaving in a year, and 20 months average lifetime. The likely misreads: taking 45.96% as a measured yearly rate, reading the shortcut column as a second valid answer, and comparing the 20-month lifetime with a quarterly or annual figure.

The searcher has one customer churn rate and needs it for another period, most often monthly to annual, for a plan, an investor update, or a benchmark. The doubt underneath is "can I multiply by 12?" Top results go one way only, accept impossible input, grade the rate without a source, and present the annual figure as measured. This page answers both directions, shows the shortcut beside the right figure, and says plainly that the result is a model.

- Title: `Monthly to annual churn rate calculator: convert churn without multiplying by 12`
- SEO title: `Monthly to annual churn rate calculator (quarterly too)`
- SEO description: `Convert customer churn between monthly, quarterly, and annual rates, in either direction. See why 5% a month is 45.96% a year, not 60%.`
- Card: `Churn rate converter`, `Turn a monthly, quarterly, or annual churn rate into the other periods, without multiplying by 12.`

### Reader questions

| Question | Answered in |
| --- | --- |
| How do I convert monthly churn to annual? And back? | Tool result; article formula |
| Can I multiply by 12? | Shortcut column; article section with the step-by-step loss |
| What are common monthly rates per year? | Article reference table |
| Which rate and period do I enter? | Field labels; usage |
| Is annualized churn my real annual churn? Annual plans? | Result notes; article |
| How long does a customer stay? | Lifetime row; article, with the CLV link |
| Revenue churn or negative churn? | `belowZero` message; article boundary section |
| How do I compare with a benchmark? | Article: match period and churn type first. No grades. |

### Outline

- Intro: what the tool converts, in the searched wording, and what to have ready.
- Usage: what to enter (customer churn, and the period it was measured over, which is the slip that matters), then one example box for 5% monthly and how to read the shortcut column, the "about" counts, and lifetime.
- Article, with question headings:
  1. How do you convert monthly churn to annual churn? Formula box, general form, and the three powers.
  2. Why not multiply monthly churn by 12? Shrinking base, numbers for the first months, 10% × 12 = 120%, and ÷ 12 understating.
  3. Monthly to annual churn table. Markdown table of 1, 2, 3, 5, 7, 10, 15% with the × 12 figure.
  4. Is annualized churn your real annual churn? Model versus measured, with the annual-plan case.
  5. How long does an average customer stay? 1 ÷ churn, in the entered period, model estimate; link to CLV.
  6. Can you convert revenue churn or negative churn? Customer churn only; negative net churn is revenue growth.
  7. How do you compare your churn with a benchmark? Same period, same type; no grades.

### Facts, limits, and sources

- Compounding formula and the 5% → about 46% example: [ChartMogul customer churn report](https://help.chartmogul.com/article/203-chart-customer-churn-rate), [ChartMogul cohort retention](https://help.chartmogul.com/article/159-cohort-customer-retention).
- Revenue churn and negative net churn: [Stripe revenue churn guide](https://stripe.com/resources/more/revenue-churn-101-how-to-calculate-it-and-why-it-matters).
- Annual renewal versus monthly decisions: [ChartMogul billing cycles](https://chartmogul.com/saas-metrics/billing-cycles/).
- All numbers on the page come from the engine and the spec's known examples.
- Avoid: grades, benchmark bands, "measured" wording for converted rates, lifetime in a period other than the entered one, lifetime or customer counts for revenue churn.
- Left out on purpose: rounding, `Under 0.01%` and `Over 99.99%`, input format rules (field messages handle them), the discrete-model lifetime mismatch across periods (the tool avoids it by showing one period), and count-based churn (`/customer-churn-calculator`).

### Next step

Link `/customer-churn-calculator` for counts, `/customer-lifetime-value-calculator` for lifetime value, `/revenue-churn-calculator` and `/net-revenue-retention-calculator` for revenue. Link `/annual-plan-discount-calculator` from the annual-plan section and `/mrr-goal-calculator` from the lifetime section, since both take churn in a set period.
