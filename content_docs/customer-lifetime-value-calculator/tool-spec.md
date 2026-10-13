# Customer lifetime value calculator

Route: `/customer-lifetime-value-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher wants a number for what a customer is worth: the gross profit one customer brings in over the time they stay. They often want to see how it changes if churn drops or margin improves, and they want to know how far to trust it.

Where the current top results fail them:

- Zero churn breaks every one of the five. Napkin, ChurnTools, and Free SaaS Metrics show `$0`. SyntaxPath shows `No limit`. OnSumo quietly turns 0% into 0.01% and shows $392,000.
- A margin of 101% goes straight through on four of the five, and three of them then grade the result.
- Revenue LTV and gross-profit LTV are both called "LTV". Only ChurnTools labels them apart.
- `1 ÷ churn` is shown as "lifetime", as if it were measured. It's what the model implies, not what anyone has observed.
- No page shows how much of the estimate depends on customers staying for years. At 0.5% monthly churn, most of the LTV arrives after year 5, and the headline number hides that.
- The time basis is often only in a field label. Nothing stops monthly ARPA going in with yearly churn.

What this tool does better:

1. Leads with gross-profit LTV from ARPA, gross margin, and customer churn, with the formula and its numbers in the same view. Revenue LTV appears once, labeled as before serving costs.
2. ARPA and churn are always on one declared basis, per month or per year. Changing the basis renames both fields, and nothing gets converted.
3. Zero churn gives `Not estimable`. It's never `$0`, `No limit`, or a tiny churn swapped in. The gross profit by month 12, 24, 36, and 60 still shows, because those totals are finite.
4. Shows the gross profit expected by each of those checkpoints, and what share of the LTV that is. A reader can see when an estimate rests on customers staying for many years.
5. Calls `1 ÷ churn` the model lifetime, and says it isn't measured.
6. Compares a baseline with one alternative scenario. The difference is stated in money.
7. No grades or benchmark bands, and no CAC. The LTV:CAC tool covers that.

## Product

### Promise and scope

The primary user is a SaaS founder or operator who knows their ARPA, gross margin, and customer churn rate, roughly or exactly. The tool gives an explicit gross-profit LTV estimate under a stated model: churn, ARPA, and margin stay the same. It also shows how much of that value arrives within fixed checkpoints, and how a second set of assumptions compares.

Launch scope:

- One currency, used as a label only.
- One basis for both ARPA and churn: `month` or `year`.
- ARPA per basis, gross margin, and customer (logo) churn per basis.
- An optional alternative scenario with its own ARPA, margin, and churn.

Exclusions:

- Historical cohort mode. It needs a table of gross profit by cohort and age, and the result is cut off while customers are still active. The research found no small input that does this well, so it's a candidate for a later version. The article explains how cohort numbers differ.
- Converting between bases, such as monthly ARPA with yearly churn. Turning yearly churn into monthly churn needs a compounding assumption the reader should choose. The article shows how to put both on one basis.
- Discounting, fixed contract terms, expansion, contraction, and price changes over time. Each is a separate model with its own assumptions. The checkpoint totals answer the most common reason for a contract cap, which is not trusting the far future.
- Revenue churn as the churn input. The model needs customer churn. Revenue churn with expansion would mix two effects.
- CAC, LTV:CAC, and payback. Separate tools cover those.
- Benchmarks, grades, recommendations, URL sharing, saved scenarios, and export.

The existing `/saas-metrics-calculator` returns one simple LTV from a monthly snapshot and hides it when churn is zero. This tool is the deeper version: named model, either basis, checkpoints, zero-churn handling, and scenarios.

### Technical contract

**Fields and units.** Money is in the selected currency, per customer. ARPA and churn use the selected basis.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| Basis | `month` or `year`. Default `month`. Shared by both scenarios. | Renames the ARPA and churn fields. No conversion. |
| ARPA (`arpa`) | Money from `0` to `1,000,000,000.00`. | Average revenue per paying customer per period. `0` is valid and gives LTV `$0.00`. |
| Gross margin (`grossMarginPercent`) | Percent from `-100` to `100`, two decimals. | After the cost to serve. Negative is valid. |
| Customer churn (`churnPercent`) | Percent from `0` to `100`, two decimals. | Share of paying customers lost per period. `0` is valid and gives `notEstimable`. `100` means every customer pays for one period. |
| Compare a second scenario | Boolean. Default off. | When off, the engine ignores the alternative. |

**Parsing.** Use `lib/saas-economics/shared.ts`: `parseMoneyCents` for ARPA, and `parsePercentHundredths` with `min: -10000n` for margin and `min: 0n` for churn. The same strict patterns and rejections as the CAC payback spec apply. Blank is never zero. Every active field is required.

**The model.** Each customer pays in period 1. In period `t`, the expected share still paying is `(1 − c)^(t − 1)`, where `c` is churn as a fraction. This is the same timing as the CAC payback retention model, so the two tools agree. With `A` as ARPA in cents, `m` as margin in hundredths, and `c` as churn in hundredths:

- Gross profit per period, in cents: `g = A × m ÷ 10000`. Signed.
- LTV (gross profit), in cents: `A × m ÷ c`, when `c > 0`. Signed. This equals the CAC payback tool's lifetime gross profit ceiling.
- Revenue LTV, in cents: `A × 10000 ÷ c`, when `c > 0`.
- Model lifetime, in periods: `10000 ÷ c`, when `c > 0`.
- Gross profit by period `n`, in cents: `A × m × (10000^n − (10000 − c)^n) ÷ (c × 10000^n)` when `c > 0`, and `A × m × n ÷ 10000` when `c = 0`.
- Share of LTV earned by period `n`: `(10000^n − (10000 − c)^n) ÷ 10000^n` when `c > 0`. It doesn't depend on ARPA or margin. There's no share when `c = 0`.
- At `c = 10000`, every checkpoint total equals one period's gross profit, and every share is exactly 100%.

**Checkpoints.** `month` basis: periods 12, 24, 36, and 60. `year` basis: periods 1, 2, 3, and 5. Both are the same horizons, 1, 2, 3, and 5 years. They're fixed reading points, not data or a recommendation.

**Zero churn.** With `c = 0`, the estimate is `notEstimable` with reason `zeroChurn`. LTV, revenue LTV, and model lifetime are `null`. Gross profit per period and the checkpoint totals are still returned, because they're finite. Never return zero, `Infinity`, or a value from a substituted churn.

**Gross profit sign.** `grossProfitSign` comes from the exact `A × m`, not the rounded cents, so a tiny positive gross profit that displays as `$0.00` is still `positive`.

**Exact arithmetic.** Parse to integer cents and hundredths. Do every operation in `bigint` with exact fractions. Round only for output.

**Rounding for output.**

- Money: half away from zero, to cents. Set `roundedToZero` when a nonzero exact value displays as `0.00`. The interface shows `Under $0.01`, or `Under -$0.01` for a tiny loss.
- Model lifetime: tenths of a period, half up. It's always between 1.0 and 10,000.0, so it never rounds to zero.
- Share of LTV: tenths of a percent, half up. Set `underOneTenth` when a positive exact share rounds to `0.0`, and the interface shows `Under 0.1%`. Set `nearlyAll` when a share below 100% rounds to `100.0`, and the interface shows `Over 99.9%`. An exact 100% shows `100%`.
- `lessThanHalfByLastCheckpoint` is exact: true when the share at the last checkpoint is below one half. It's `null` with zero churn.
- Scenario difference: the alternative's rounded LTV cents minus the baseline's. It exists only when both estimates are `finite`.

**Action and handling.** `Estimate LTV` is the only primary action.

- A valid submit shows the results and focuses the first lead.
- An invalid submit clears any old result, keeps every raw input, puts one error under each invalid field, and focuses the first invalid field in reading order.
- Editing any input, or changing the basis, currency, or compare, clears the result and announces `Inputs changed. Calculate again.`
- Reset restores the defaults, clears every draft and error, and focuses the basis choice.

**Privacy and security.** The calculation runs in the browser. Entered values never go to a server, the URL, cookies, storage, logs, or analytics. The clean URL stays unchanged. No API route, dataset, or background job.

### Backend contract

Same runtime rules as the other SaaS economics engines: strip-types safe, no enums or namespaces, explicit `.ts` imports, and no DOM, network, time, or randomness.

#### `lib/saas-economics/unit-economics.ts`

A new shared module for the customer acquisition cost, customer lifetime value, and LTV:CAC engines. It holds the exact-fraction helpers, the modeled LTV, and straight-line payback.

Don't change `lib/saas-metrics-calculator/engine.ts`, `lib/cac-payback-calculator/engine.ts`, or `lib/break-even-mrr-calculator/engine.ts` to use it in this task. `straightLinePaybackMonths` must match the CAC payback engine's straight line exactly on a monthly basis. The test checks that against `calculateCacPayback` on its direct-CAC examples, so the two can't drift apart.

```ts
import { divideHalfAwayFromZero } from "./shared.ts";

/** Exact rational. denominator > 0n; not necessarily reduced. */
export type ExactFraction = { numerator: bigint; denominator: bigint };

/** Throws RangeError when denominator <= 0n. denominator defaults to 1n. */
export function exactFraction(numerator: bigint, denominator?: bigint): ExactFraction;
export function addExact(...values: ExactFraction[]): ExactFraction;
export function multiplyExact(a: ExactFraction, b: ExactFraction): ExactFraction;
/** Throws RangeError when b is zero. */
export function divideExact(a: ExactFraction, b: ExactFraction): ExactFraction;
export function compareExact(a: ExactFraction, b: ExactFraction): -1 | 0 | 1;
export function signOfExact(value: ExactFraction): -1 | 0 | 1;
/** round(value * scale), half away from zero. scale defaults to 1n. */
export function roundExact(value: ExactFraction, scale?: bigint): bigint;
/** True when value * scale is a whole number. */
export function isWholeAtScale(value: ExactFraction, scale: bigint): boolean;

export const SAAS_PERIOD_BASES = ["month", "year"] as const;
export type SaasPeriodBasis = (typeof SAAS_PERIOD_BASES)[number];
export const SAAS_MONTHS_PER_PERIOD: Readonly<Record<SaasPeriodBasis, bigint>> = { month: 1n, year: 12n };

/** Already-validated values: arpaCents >= 0n, -10000n <= margin <= 10000n, 0n <= churn <= 10000n. */
export type ModeledLtvInput = { arpaCents: bigint; grossMarginHundredths: bigint; churnHundredths: bigint };

/** A * m / 10000, in cents per period. Signed. */
export function periodGrossProfit(arpaCents: bigint, grossMarginHundredths: bigint): ExactFraction;

export type ModeledLtv =
  | {
      kind: "finite";
      grossProfit: ExactFraction;     // cents, signed: A * m / c
      revenue: ExactFraction;         // cents: A * 10000 / c
      lifetimePeriods: ExactFraction; // 10000 / c
    }
  | { kind: "notEstimable"; reason: "zeroChurn" };

export function modelLtv(input: ModeledLtvInput): ModeledLtv;

/** Expected gross profit per acquired customer after `periods` whole periods, in cents. Defined for churn 0. periods: 1 to 600. */
export function cumulativeGrossProfit(input: ModeledLtvInput, periods: number): ExactFraction;

/** 1 - (1 - c)^periods, as a fraction from 0 to 1. null when churn is 0. */
export function shareOfLtvEarned(churnHundredths: bigint, periods: number): ExactFraction | null;

export type StraightLinePayback =
  | { kind: "finite"; tenths: bigint; tenthsUnderOne: boolean }
  | { kind: "never"; reason: "zeroGrossProfit" | "negativeGrossProfit" }
  | { kind: "zeroAcquisitionCost" };

/**
 * Months of gross profit to recover CAC: cac * monthsPerPeriod / periodGrossProfit.
 * Checks zero CAC first, then gross profit <= 0. Tenths half up.
 */
export function straightLinePaybackMonths(
  cacCents: ExactFraction,
  periodGrossProfitCents: ExactFraction,
  basis: SaasPeriodBasis,
): StraightLinePayback;
```

Throwing is only for programmer errors, such as a zero denominator or periods outside 1 to 600. Engines validate first and never pass invalid values.

#### `lib/customer-lifetime-value-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type SaasPeriodBasis } from "../saas-economics/unit-economics.ts";

export const CUSTOMER_LTV_CHECKPOINTS: Readonly<Record<SaasPeriodBasis, readonly number[]>> = {
  month: [12, 24, 36, 60],
  year: [1, 2, 3, 5],
};

export const CUSTOMER_LTV_SCENARIO_FIELDS = ["arpa", "grossMarginPercent", "churnPercent"] as const;
export type CustomerLtvScenarioField = (typeof CUSTOMER_LTV_SCENARIO_FIELDS)[number];
export type CustomerLtvScenarioKey = "baseline" | "alternative";
export type CustomerLtvFieldKey =
  | "form" | "currency" | "basis"
  | `${CustomerLtvScenarioKey}.${CustomerLtvScenarioField}`;

export type CustomerLtvScenarioInput = Record<CustomerLtvScenarioField, string>;
export type CustomerLtvInput = {
  currency: string;
  basis: string;
  compare: boolean;
  baseline: CustomerLtvScenarioInput;
  alternative: CustomerLtvScenarioInput;
};

export type CustomerLtvMoney = { cents: bigint; roundedToZero: boolean }; // signed where the value can be

export type CustomerLtvEstimate =
  | {
      kind: "finite";
      grossProfit: CustomerLtvMoney;   // signed
      revenue: CustomerLtvMoney;
      lifetimeTenths: bigint;          // 10n to 100000n, in tenths of a period
    }
  | { kind: "notEstimable"; reason: "zeroChurn" };

export type CustomerLtvShare = { tenths: bigint; underOneTenth: boolean; nearlyAll: boolean }; // tenths of a percent

export type CustomerLtvCheckpoint = {
  periods: number;
  grossProfit: CustomerLtvMoney;       // signed
  shareOfLtv: CustomerLtvShare | null; // null when churn is 0
};

export type CustomerLtvScenarioValues = {
  arpaCents: bigint;
  grossMarginHundredths: bigint;       // signed
  churnHundredths: bigint;
  periodGrossProfit: CustomerLtvMoney; // signed
  grossProfitSign: "positive" | "zero" | "negative"; // from the exact value
  estimate: CustomerLtvEstimate;
  checkpoints: CustomerLtvCheckpoint[]; // always four, in CUSTOMER_LTV_CHECKPOINTS order
  lessThanHalfByLastCheckpoint: boolean | null; // null when churn is 0
};

export type CustomerLtvComparison = {
  /** alternative - baseline, from the rounded LTV cents; null unless both are finite. */
  ltvDeltaCents: bigint | null;
};

export type CustomerLtvValues = {
  currency: SaasEconomicsCurrency;
  basis: SaasPeriodBasis;
  baseline: CustomerLtvScenarioValues;
  alternative: CustomerLtvScenarioValues | null;
  comparison: CustomerLtvComparison | null;
};

export type CustomerLtvErrors = Partial<Record<CustomerLtvFieldKey, string>>;

export type CustomerLtvCalculation =
  | { status: "valid"; values: CustomerLtvValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: CustomerLtvErrors };

export function calculateCustomerLifetimeValue(input: unknown): CustomerLtvCalculation;
```

A non-object input, a missing scenario object, or a non-boolean `compare` gives `errors.form`. An unsupported currency or basis gives an error on that key. The engine collects every error in one pass and never throws for user input.

Error messages. The engine owns these strings, and the writing pass may reword them. `<period>` is `monthly` or `yearly`, from the basis. When the basis itself is invalid, use `per-period`.

| Case | Message |
| --- | --- |
| Missing ARPA | `Enter <period> ARPA.` |
| Bad money format | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | `Enter an amount up to 1,000,000,000.00.` |
| Missing or bad margin | `Enter a percent from -100 to 100, with up to two decimals.` |
| Missing churn | `Enter <period> customer churn. Use 0 if no customers left.` |
| Bad churn | `Enter a percent from 0 to 100, with up to two decimals.` |
| Bad currency or basis | `Choose one of the listed options.` |
| Form | `Something in the form is out of date. Reset and try again.` |

### Known examples

Calculated by hand with exact fractions, independent of competitor output, though several match the competitor results in the research. USD, `month`, compare off unless stated. Checkpoints are listed as total (share of LTV).

| Inputs | Expected |
| --- | --- |
| ARPA `50`, margin `80`, churn `3` | Gross profit `$40.00` a month. LTV `$1,333.33` (exact 1,333.33…). Revenue LTV `$1,666.67`. Lifetime `33.3` months. Month 12 `$408.21` (30.6%), 24 `$691.44` (51.9%), 36 `$887.96` (66.6%), 60 `$1,118.92` (83.9%). `lessThanHalfByLastCheckpoint: false`. |
| ARPA `100`, margin `80`, churn `5` | LTV `$1,600.00`; revenue LTV `$2,000.00`; lifetime `20.0`. Month 12 `$735.42` (46.0%), 60 `$1,526.29` (95.4%). |
| ARPA `49`, margin `80`, churn `5` | LTV `$784.00`; revenue LTV `$980.00`. |
| ARPA `99`, margin `70`, churn `6` | Gross profit `$69.30`. LTV `$1,155.00`, equal to the CAC payback churn-limit example. Lifetime `16.7`. |
| `year`: ARPA `24000`, margin `75`, churn `20` | Gross profit `$18,000.00` a year. LTV `$90,000.00`; revenue LTV `$120,000.00`; lifetime `5.0` years. Year 1 `$18,000.00` (20.0%), 2 `$32,400.00` (36.0%), 3 `$43,920.00` (48.8%), 5 `$60,508.80` (67.2%). |
| ARPA `50`, margin `80`, churn `0` | `notEstimable`, `zeroChurn`. Gross profit `$40.00`. Month 12 `$480.00`, 24 `$960.00`, 36 `$1,440.00`, 60 `$2,400.00`, each with share `null`. `lessThanHalfByLastCheckpoint: null`. |
| ARPA `50`, margin `0`, churn `5` | Gross profit `$0.00`, sign `zero`. LTV `$0.00`, `finite`. Revenue LTV `$1,000.00`. Every checkpoint `$0.00`, with the same shares as any 5% churn. |
| ARPA `50`, margin `-20`, churn `5` | Gross profit `-$10.00`, sign `negative`. LTV `-$200.00`. Month 12 `-$91.93`. |
| ARPA `0`, margin `80`, churn `5` | LTV `$0.00`; revenue LTV `$0.00`. |
| ARPA `50`, margin `80`, churn `100` | LTV `$40.00`; lifetime `1.0`. Every checkpoint `$40.00` at exactly 100%. |
| ARPA `50`, margin `80`, churn `50` | LTV `$80.00`; lifetime `2.0`. Month 12 `$79.98` (exact 79.98046875), share `nearlyAll: true`, shown as `Over 99.9%`. |
| ARPA `50`, margin `80`, churn `0.01` | LTV `$400,000.00`; lifetime `10,000.0` months. Month 12 `$479.74` (0.1%), 60 `$2,392.93` (0.6%). `lessThanHalfByLastCheckpoint: true`. |
| `year`: ARPA `50`, margin `80`, churn `0.01` | Year 1 share exact 0.01%, `tenths: 0`, `underOneTenth: true`. |
| ARPA `0.01`, margin `0.01`, churn `100` | Gross profit exact 0.0001 cents, sign `positive`, `roundedToZero: true`. LTV `roundedToZero: true`. |
| Compare: baseline ARPA `50`, margin `80`, churn `3`; alternative churn `2.5`, same ARPA and margin | Baseline `$1,333.33`; alternative `$1,600.00`; `ltvDeltaCents: 26667`, shown as `$266.67 more`. Alternative month 12 `$419.20` (26.2%). |
| Compare: baseline churn `3`; alternative churn `0`, same ARPA `50` and margin `80` | Alternative `notEstimable`; `ltvDeltaCents: null`. |
| Maximum: ARPA `1000000000`, margin `100`, churn `0.01` | LTV `$10,000,000,000,000.00`. |
| Invalid: ARPA blank, `-1`, `1e3`, `$50`, `1,000`, `50.001`, `1000000000.01`; margin `100.01`, `-100.01`, or `80%`; churn blank, `-1`, or `100.01`; basis `quarter`; currency `JPY` | A field-specific error for each; `status: "invalid"`; no values. Churn `0`, ARPA `0`, and margin `0` are valid. A blank alternative with compare off is valid. |

Check of the 50/80/3 month-12 row: `40 × (1 − 0.97^12) ÷ 0.03 = 1,333.33… × 0.306157… = 408.210…`.

### Ownership

Sol builds the backend:

- `lib/saas-economics/unit-economics.ts`, shared with the customer acquisition cost and LTV:CAC engines. Build it once.
- `lib/customer-lifetime-value-calculator/engine.ts`.
- `tests/pages/customer-lifetime-value-calculator/customer-lifetime-value-calculator.test.mjs`, covering the examples above, plus the cross-check of `straightLinePaybackMonths` against `calculateCacPayback`.
- The development tool-page row, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/customer-lifetime-value-calculator/page.tsx`, `layout.tsx`, `customer-lifetime-value-calculator.tsx`, and `customer-lifetime-value-calculator.module.css`.
- `app/(site)/(tools)/customer-lifetime-value-calculator/art/customer-lifetime-value-calculator.spec.json`, `.svg`, and `.ts`, generated with marker-art-draw, plus a new `toolSpot` motif in `scripts/stack127/marker-art/figures.mjs` and the registration line in `lib/tool-catalog-art.ts`. Another frontend worker currently has both shared files open, so these two edits wait until that worker is done.

No URL-restore wrapper.

### Catalog placement

Primary and only catalog: `/saas-tools`. It sits between customer acquisition cost and LTV:CAC in the suggested batch order, because LTV:CAC uses both. The coordinator sets the final order. No secondary catalog fits.

Catalog `toolSpot` key: `customer-lifetime-value-calculator`. Suggested motif name: `lifetimeValue`.

- Takeaway: each month adds a thinner layer of gross profit, and the total approaches a limit without reaching it.
- Focal subject: one upright column built from five or six horizontal layers. The bottom layer is thickest, and each layer above is thinner.
- One supporting relationship: a dashed horizontal line a little above the top layer, which the column approaches but doesn't touch.
- Tone: calm and neutral. No currency signs, numbers, infinity signs, hourglasses, people, or arrows.
- It must read differently from the CAC payback staircase, which has equal steps rising to a dashed line it touches. Here the layers stack vertically, shrink, and never meet the line. It must also differ from the gross margin columns and the cohort retention bars. Keep it wordless and legible at card size in both themes.

## Interface

### Flow

- Question: "How much gross profit is a customer worth if my churn, price, and margin hold, and how much of that do I see in the first few years?"
- Lead answer: modeled LTV per scenario, or `Not estimable` at zero churn.
- Primary action: `Estimate LTV`.
- Control mode: `single`. Three fields and one basis choice drive the answer. Nothing is hidden.

Workbench order:

1. Currency, a narrow select, and `Basis`, two visible choices: `Per month` and `Per year`.
2. Scenario fields: `Monthly ARPA`, `Gross margin`, `Monthly customer churn`. With `Per year`, the labels read `Yearly ARPA` and `Yearly customer churn`.
3. One checkbox: `Compare a second scenario`.
4. `Estimate LTV` and a quiet `Reset`.
5. One divider, then the results.

When compare is on, the fields become two side-by-side fieldsets with the legends `Baseline` and `Alternative`. Turning compare on for the first time copies the baseline's raw strings into blank alternative fields. Turning it off and on again keeps the alternative drafts.

Two helper lines, each preventing a likely mistake:

- Under gross margin: `After hosting, support, payment fees, and other costs to serve.`
- Under churn: `Share of paying customers who cancel each month. Use customer churn, not revenue churn.` With `Per year`, `each year`.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Currency | `UiSelect` from `@/app/ui/controls` |
| Basis | `UiChoiceGroup` from `@/app/ui/controls` |
| ARPA, margin, and churn | `UiTextField` from `@/app/ui/controls`, with `inputMode="decimal"`, a currency-code or `%` `suffix`, and autocomplete, capitalization, and spellcheck off |
| Compare | `UiCheckbox` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, and `UiButton` from `@/app/ui/controls` |
| Leads | `UiPrimaryResult` from `@/app/ui/display` |
| Checkpoints, and how the estimate is built | `UiDataTable` from `@/app/ui/display`, two tables |
| Change, reset, and failure messages | `UiStatus` from `@/app/ui/display` |

No new shared component. The two-column scenario layout is route CSS.

A cumulative gross profit chart was considered and left out. `UiLineChart` draws one series with no reference line, so it can't show the LTV limit, and four checkpoints read better as a table.

Tool-specific component, in the route file:

- `CustomerLifetimeValueCalculator`: owns the raw form state, error mapping by `CustomerLtvFieldKey`, focus, status, and the result rendering below. It calls only `calculateCustomerLifetimeValue`.

### Result regions

1. **Leads.** One `UiPrimaryResult` per scenario. With compare on, the two sit side by side.
   - Label: `Lifetime gross profit per customer`, or `Baseline LTV` and `Alternative LTV`.
   - Value: LTV in currency, signed, or `Under $0.01`. At zero churn, `Not estimable` with no unit.
   - Detail line 1, finite: `$40.00 gross profit a month ÷ 3% monthly churn.` At zero churn: `With 0% churn, this model has no finite lifetime. The totals below still apply.`
   - Detail line 2, when gross profit isn't positive: zero gives `Each customer leaves $0.00 a month after serving costs.` Negative gives `Each customer costs $10.00 a month more to serve than they pay.`
   - Detail line 3, when `lessThanHalfByLastCheckpoint` is true: `Less than half of this arrives in the first 5 years.`
   - The alternative adds `$266.67 more than baseline`, `less`, or `Same as baseline`. Leave it out when the delta is `null`.
   - Tone stays `neutral` in every case.
2. **Gross profit by checkpoint.** One `UiDataTable` with the caption `If customers keep leaving at this rate`.
   - Without compare, the columns are `By the end of`, `Gross profit`, and `Share of LTV`. With compare, they're `By the end of`, `Baseline`, and `Alternative`, and each cell shows `$408.21` with `30.6% of LTV` under it.
   - Rows: `Month 12`, `Month 24`, `Month 36`, `Month 60`, or `Year 1`, `Year 2`, `Year 3`, `Year 5`.
   - At zero churn the share reads `n/a`.
3. **How the estimate is built.** One `UiDataTable`. Columns: `Item`, `Value` (or `Baseline` and `Alternative`). Rows, in order:
   - ARPA.
   - Gross margin.
   - Gross profit per month (or year).
   - Customer churn.
   - `Model lifetime`, such as `33.3 months`, or `n/a` at zero churn.
   - `Revenue LTV, before serving costs`, or `n/a` at zero churn.
4. **Formula.** One small line under the tables: `LTV = ARPA × gross margin ÷ customer churn, all per month.` Then: `Assumes churn, ARPA, and margin stay the same. Model lifetime is 1 ÷ churn, not a measured lifetime.`

The lead's formula line uses rounded numbers for reading. The LTV comes from the exact values.

### States

- **Initial.** Every value field is blank. USD and `Per month` are selected, and compare is off. No result.
- **Invalid or incomplete.** Clear the old result and keep the inputs. Show one error under each invalid field, focus the first invalid field in reading order, baseline before alternative, and add no error panel.
- **Valid.** Show the leads, both tables, and the formula. Focus the first lead and announce it once through the focused output.
- **Not estimable, zero, and negative.** These are valid results with the same layout, not errors.
- **Edited after a result.** Clear the result and announce once, politely: `Inputs changed. Calculate again.` Focus stays where the reader is typing.
- **Basis change.** The field labels and helper change. The drafts stay as typed, because the tool doesn't convert. The result clears.
- **Toggle.** Turning compare on adds the alternative in place, and focus stays on the checkbox. Turning it off hides the alternative and keeps its drafts.
- **Unexpected failure.** If the engine throws, keep the inputs, clear the result, show one `UiStatus` error by the actions (`Couldn't calculate. Try again.`), and leave the button enabled.
- **Reset.** Restore the initial state, focus the basis choice, and announce `Form reset.`
- **Restored.** The clean URL never changes. If the back-forward cache restores the page with a result, the next edit clears it.
- **Long values.** `$10,000,000,000,000.00` and `10,000.0 months` must fit in the leads and table cells without clipping. Minus signs stay visible. Detail lines wrap.
- **Loading, empty, partial, and retry.** These don't apply. The calculation is synchronous and local.

### Responsive and accessible behavior

Desktop:

- Shared workbench band with a measured inner width.
- Currency and basis share one row.
- Scenario fields stack in one column without compare, and become two equal fieldset columns with compare.
- Leads side by side. The checkpoint table and the build table go full width below, in that order.

Mobile:

- Stack in this order: currency, basis, the baseline fieldset, the alternative fieldset, the checkbox, actions, baseline lead, alternative lead, checkpoint table, build table, formula.
- Each `UiDataTable` turns into labeled rows.
- Buttons go full width. No page-level horizontal overflow. Grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order follows the visual order and goes through the whole baseline fieldset before the alternative.
- Enter in a field submits.
- Every field has a visible label. The fieldset legend gives the scenario context.
- Errors are tied to their fields.
- One polite live region announces changes, resets, and failures. Results are announced through the focused output only.

Check at desktop and mobile in both themes:

- The 50/80/3 example.
- Zero churn.
- Margin `-20`.
- The yearly 24000/75/20 example.
- Churn `0.01`, which shows the less-than-half line.
- Compare with one side at zero churn.
- A pasted `80%` margin error.
- The maximum LTV.

---

## Content

Plan for the writing pass. The live article is the draft in `tmp/page-publishing/saas-economics-final-a/customer-lifetime-value-calculator/`. Do not copy this plan into the page.

### Search intent and metadata direction

The reader wants the gross profit one customer is worth, and how much of that estimate sits in later years. The visible title starts with `Customer lifetime value calculator` and asks that question. The SEO title pairs the search phrase with gross profit. The description says the estimate uses ARPA, gross margin, and customer churn on one time basis, and that zero churn stays not estimable. The card name is `Customer lifetime value`. The card description is the estimate under those steady assumptions. Card art key is the exact slug `customer-lifetime-value-calculator`.

Do not promise an observed lifetime, a cohort measurement, a historical forecast, or a healthy LTV.

### Page promise

The reader can enter monthly or yearly figures without the tool converting them, read gross-profit LTV apart from revenue LTV, and see checkpoint totals at 12, 24, 36, and 60 months or at 1, 2, 3, and 5 years. They know model lifetime is `1 ÷ churn`. At zero churn the lead says `Not estimable` while the finite checkpoint totals remain. A negative margin stays a loss.

### Content completeness map

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| How is SaaS LTV calculated? | The lead is lifetime gross profit. The formula under the tables names ARPA, margin, and churn on one basis. | One `[!FORMULA]`. Say the first period is paid in full, then the same share of remaining customers leaves each period. |
| Revenue or gross profit? | `Revenue LTV, before serving costs` is its own row. | Use the usage example: $1,666.67 before serving costs, $1,333.33 after. Link the margin point. |
| Can I mix a monthly price with yearly churn? | Basis renames both fields and does not convert. | A table, plus the 5% monthly case: about 54% still paying after 12 months, not a 60% yearly churn. Say 12 times the monthly rate is the wrong shortcut. |
| Is 1 ÷ churn how long customers stayed? | The row is labeled `Model lifetime`, and the formula says it is not measured. | Say 33.3 months is what the model implies. |
| What if churn is zero? | `Not estimable`. Checkpoint money remains. Shares say `n/a`. | $40 a month gives $480, $960, $1,440, and $2,400. Not $0 and not an unlimited measured life. |
| How much depends on later years? | Checkpoints and, when true, `Less than half of this arrives in the first 5 years.` | Table for the 3% example. Then 0.5% monthly churn: $8,000.00 LTV, 26.0% by month 60. One `[!WARNING]`. |
| What if margin is negative or zero? | Signed gross profit. A loss is a negative lead. | Margin `-20`: a loss of $10 a month and $200 lifetime. Revenue LTV stays $1,000. Zero margin gives $0 gross-profit LTV. |
| What does a second scenario compare? | Alternative lead shows the rounded difference when both estimates are finite. | One usage step. No difference when either side is `Not estimable`. |
| Is this my cohort's profit? | The caption is `If customers keep leaving at this rate`. | Say there is no history mode. Cite ChartMogul's formula, their different in-product formula, and the 2026 cohort study without claiming this model was the one tested. |

### Recommended outline and formats

**Introduction.** Three sentences: gross profit if the three inputs stay the same, what to have ready, and no automatic conversion.

**Usage.** Heading `What to enter`. Steps for basis, ARPA, margin (including a typed minus), customer churn rather than revenue churn, zero as a real entry, and compare. One `[!EXAMPLE]`: $50, 80%, 3% gives $40.00 a month, LTV $1,333.33, revenue LTV $1,666.67, and 33.3 months. No formula block in usage.

**Supporting content:**

1. `How is customer lifetime value calculated?` Formula, first period paid, constant churn, margin, and ARPA. At 100% churn the $50 example is $40.00 forever after.
2. `How is revenue LTV different from gross-profit LTV?` The two figures from the example. A thin margin can be worth less than a smaller bill.
3. `Can you mix monthly revenue with yearly churn?` One table. The compounding sentence. Yearly inputs are a separate run: $24,000, 75%, 20% gives $18,000 a year and $90,000 LTV.
4. `What does model lifetime mean?` 33.3 months is not an observed stay.
5. `What if customer churn is zero?` The four finite totals.
6. `How much of the estimate arrives in the first few years?` Checkpoint table for the 3% example, then the 0.5% warning.
7. `What if gross margin is zero or negative?` The loss example and the zero-margin example.
8. `Is my LTV good or bad?` No grade. Point to the LTV to CAC calculator.
9. `What this estimate does not measure?` No cohort mode, the ChartMogul limits, no expansion or discount. Next tools: acquisition cost, LTV to CAC, CAC payback, and the SaaS metrics snapshot.

No article chart. Four checkpoints are already a table in the tool. No marker art in the article. The catalog drawing stays on the card.

### Facts, sources, and claims to avoid

- Simple formula ARPA × gross margin ÷ customer churn, forward-looking rather than historical, constant-churn limit, and the 3:1 remark left to the ratio page: [ChartMogul's LTV guide](https://chartmogul.com/saas-metrics/ltv/), updated on that site 8 September 2026, read 2026-10-04.
- ChartMogul's product report is ARPA ÷ trailing six-month customer churn, with no margin, and it is unavailable at zero churn: [ChartMogul LTV report help](https://help.chartmogul.com/article/208-chart-customer-lifetime-value-ltv), updated on that site 11 September 2026.
- 35,512 cohorts, 3,331 company accounts, Q1 2020 through Q4 2024, revenue through June 2026. Over the 12-month window, 28.3% of cohorts missed by more than 50% in either direction. That test used ChartMogul's revenue formula: [SaaS LTV report](https://chartmogul.com/reports/saas-ltv-report/).
- A thin margin can make a high-revenue customer worth less: [Stripe's customer lifetime value guide](https://stripe.com/resources/more/customer-lifetime-value). Do not attribute this tool's formula to that Stripe page. Stripe shows several other formulas there.
- Checkpoint amounts, signs, and the 0.5% case ($8,000.00, month 60 $2,077.91, 26.0%) come from `calculateCustomerLifetimeValue`.
- Do not say the tool observed a cohort, forecast the reader's history, converted churn by multiplying by 12, or graded the estimate.
- Interface labels and engine errors need no change. The basis rename, `Not estimable`, and `n/a` shares already say the limits.
