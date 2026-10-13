# CAC payback calculator

Route: `/cac-payback-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher wants to know how many months of a new customer's gross profit it takes to earn back what they spent to win that customer. They often want a second answer right after: what happens if I raise the price, cut serving costs, spend less per customer, or lose customers each month?

Where the current top results fail them:

- Zero or negative gross margin shows `0 months` on TidyCalc and Calcority. Negative CAC is clamped, cleared, or shown as `Never` without saying which input is wrong.
- Most pages don't say the result is gross-profit recovery, not cash collected. An annual prepayment is a cash question this formula doesn't answer.
- Churn "adjustments" are shortcuts. OnSumo shrinks one month's profit by the churn rate, and TidyCalc converts churn to an average lifetime. Neither finds the month when a cohort's accumulated gross profit reaches CAC, or says when it never will.
- Scenario levers exist on OnSumo and Valuefy, but they change one value at a time, or they grade the result before the reader checks the assumptions.

What this tool does better:

1. Leads with gross-profit payback and shows the CAC, ARPA, margin, and monthly gross profit behind it in the same view.
2. Says `Never` with the exact reason when gross profit per customer is zero or negative. It never shows a false `0 months`.
3. Rejects negative CAC and malformed values at the field that caused them. A CAC of `0` is a real answer, `Nothing to earn back`, never a payback time.
4. Compares a baseline with one alternative scenario. Each column keeps its own CAC, ARPA, margin, and optional churn, and the difference is stated in months.
5. Optional monthly churn gives the month the cohort actually earns back CAC. When churn makes that impossible, it shows the most gross profit a customer can ever return.
6. Shows the revenue-only months as a labeled comparison, so the reader can see what ignoring serving costs hides.
7. Gives no health grade or benchmark band. The research found no universal threshold.

## Product

### Promise and scope

The primary user is a SaaS founder or operator who knows, or can work out, what it costs to win one paying customer. They also know that customer's monthly revenue and their gross margin. The tool tells them how many months of gross profit repay that cost, and how a change in price, margin, CAC, or churn moves the answer.

Launch scope:

- One currency, used as a label only. The tool converts nothing.
- CAC entered directly, or calculated from sales and marketing spend and the new paying customers that spend produced in the same period.
- Monthly ARPA for the new customers being acquired.
- Gross margin after the cost to serve, from -100% to 100%.
- Optional constant monthly customer churn, which turns on a retention-adjusted recovery month.
- An optional alternative scenario with its own values, compared with the baseline.

Exclusions:

- Cash payback, annual or upfront billing schedules, collection delays, and refunds. The result is gross-profit recovery. Normalized MRR isn't cash.
- Month-by-month retention curves pasted from a cohort report. The research found no simple input that beats a constant churn rate without a table editor. This is a candidate for a later version.
- Expansion revenue, price changes over time, discounting, and the time value of money.
- LTV, LTV:CAC, and a lifetime value page. A separate tool covers those. The lifetime gross profit figure appears here only to explain a `Never` result.
- Benchmarks, health grades, recommendations, URL sharing, saved scenarios, and export.

The existing `/saas-metrics-calculator` returns one simple payback number from a monthly snapshot. This tool is the deeper version: it explains each assumption, compares scenarios, and handles churn.

### Technical contract

**Fields and units.** Every money value is in the selected currency, per customer. Every rate is monthly.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| CAC source | `direct` or `spend`. Default `direct`. One choice applies to both scenarios. | |
| CAC (`direct`) | Money from `0` to `1,000,000,000.00`. | Blank is an error. `0` is valid and means there's nothing to earn back. |
| Sales and marketing spend (`spend`) | Money from `0` to `1,000,000,000.00`. | Spend for the same period and channel as the customer count. `0` is valid and gives a CAC of `0`. |
| New paying customers (`spend`) | Whole number from `1` to `10,000,000`. | |
| Monthly ARPA | Money from `0` to `1,000,000,000.00`. | `0` is valid and gives `Never`. |
| Gross margin | Percent from `-100` to `100`, with up to two decimals. | Negative is valid and gives `Never`. |
| Monthly churn | Percent from `0` to `100`, with up to two decimals. Required in both scenarios only when churn is on. | Share of the original cohort lost each month. |
| Compare a second scenario | Boolean. Default off. | When off, the engine ignores alternative values. |
| Include monthly churn | Boolean. Default off. | When off, the engine ignores churn values. |

**Parsing.** Raw values stay strings until the engine parses them. Trim outer whitespace. Money matches `^\d+(\.\d{1,2})?$`. Percent matches `^-?\d+(\.\d{1,2})?$`, and the minus sign is allowed only for gross margin. Whole counts match `^\d+$`. Reject signs where not allowed, commas, currency symbols, `%`, interior spaces, exponents, a leading or trailing dot, and more than two decimals. Blank is never zero. A blank required field is a "missing" error. The engine validates only fields that are active for the chosen CAC source, comparison, and churn settings. Inactive drafts are ignored and keep their text in the form.

**Exact arithmetic.** Parse money to integer cents and percentages to integer hundredths of a percent (`80.5` → `8050`). Do every comparison and division in `bigint`. Round only for output.

- `CAC` is `cacCents / 1` for `direct` and `spendCents / newCustomers` for `spend`. Keep it as an exact fraction `N/d`. It's zero exactly when `N = 0`.
- `monthly gross profit` = `ARPA × margin`. In scaled form, `gpScaled = arpaCents × marginHundredths`, in units of 1/10,000 cent.

**Zero CAC comes first.** When `N = 0`, every month count is `zeroAcquisitionCost`: straight-line payback, revenue-only months, and the retention outcome when churn is on. There's no cost to earn back, so the engine doesn't divide, and ARPA, margin, and churn don't change the outcome. They're still validated and reported. Zero CAC with zero or negative gross profit is still `zeroAcquisitionCost`, not `never`. The interface states the loss separately. Never report zero CAC as `finite` with `0` months or month `0`.

With `N > 0`:

- `straight-line payback months` = `CAC ÷ monthly gross profit`. This is defined only when gross profit is above zero. Otherwise it's `never`.
- `recovery month` = `ceil(CAC ÷ monthly gross profit)`, with a minimum of 1. If the division is exact, the recovery month is that integer.
- `revenue-only months` = `CAC ÷ ARPA`. It is defined only when ARPA is above zero, and it's a comparison, not payback. With ARPA `0`, it's `zeroArpa`.

A `finite` month count always comes from a CAC above zero and a positive denominator, so its exact value is always above zero.

**Retention-adjusted recovery.** Timing assumption: every acquired customer pays in month 1. In month `t`, the share still paying is `(1 − churn)^(t − 1)`. Cumulative expected gross profit per acquired customer after `n` months is `g × (1 − (1 − c)^n) ÷ c` when `c > 0`. Below, `A` is ARPA in cents, `m` is margin in hundredths, `c` is churn in hundredths, and `N/d` is CAC. The engine checks the cases in this order:

1. If CAC is `0` (`N = 0`), the result is `zeroAcquisitionCost`.
2. If gross profit is zero or less, the result is `never`, with the same reason as straight-line payback.
3. If churn is `0`, the recovery month equals the straight-line recovery month. Handle this case before the tests below, which divide by `c`.
4. If churn is `100` (`c = 10000`), only month 1 pays, and the lifetime ceiling equals one month's gross profit, reached in month 1. If `A·m·d ≥ N·10000`, the result is `finite`, month 1. Otherwise it's `never` with reason `churnLimit`, and the lifetime figure is one month's gross profit. Handle this before step 5, because at 100% churn the ceiling is reached, not just approached, so equality recovers.
5. With `L = A·m ÷ c`, the lifetime gross profit ceiling in cents: if `CAC ≥ L`, the result is `never` with reason `churnLimit`. Compare exactly as `N·c ≥ A·m·d`. For churn below 100%, equality is `never`, because the ceiling is approached but never reached.
6. Otherwise, find the smallest `n` from 1 to 600 where `(A·m·d − N·c) × 10000^n ≥ A·m·d × (10000 − c)^n`. Use exact `bigint` powers, built up month by month.
7. If no `n` up to 600 meets that test, the result is `beyondHorizon` with `horizonMonths: 600`.

**Rounding for output.**

- Money: half away from zero, to cents. Derived CAC carries `cacIsRounded` when the exact fraction isn't a whole number of cents.
- Monthly gross profit: half away from zero, to cents. Set `monthlyGrossProfitRoundedToZero` when a nonzero exact value displays as `0.00`.
- Months, for straight-line and revenue-only values: tenths, half up. Set `tenthsUnderOne` when a positive exact value rounds to `0.0`. The interface then shows `Under 0.1`. A `finite` value is never an exact zero, because zero CAC has its own outcome. `tenthsUnderOne` is `false` whenever `tenths` is above `0`.
- Lifetime gross profit ceiling: cents, half up. At 100% churn it equals the monthly gross profit, rounded the same way.
- Scenario difference: the alternative's rounded tenths minus the baseline's rounded tenths, so the stated difference matches the two visible numbers. `6.25` displays `6.3`, and `6.3 − 7.5` gives `1.2 months sooner`. The retention difference is the difference of the whole recovery months. Both differences exist only when both sides are `finite`. Any other pair, including zero CAC on one or both sides, gives `null`, and the interface states no difference.

**Outputs per scenario.** CAC with its source, monthly ARPA, gross margin, monthly gross profit, straight-line payback (`finite`, `never` with a reason, or `zeroAcquisitionCost`), revenue-only months (`finite`, `zeroArpa`, or `zeroAcquisitionCost`), and, when churn is on, the retention outcome. Never return `Infinity`, `NaN`, a negative month count, zero months for a `never` case, or a `finite` result for zero CAC.

**Action and handling.** `Calculate payback` is the only primary action. A valid submit shows the results and focuses the lead result. An invalid submit clears any old result, keeps every raw input, puts one error under each invalid field, and focuses the first invalid field in reading order. Editing any input that drives the result, or toggling compare, churn, CAC source, or currency, clears the result and announces `Inputs changed. Calculate again.` Reset restores the defaults, clears every draft and error, and focuses the CAC source choice.

**Privacy and security.** The calculation runs in the browser. Entered values never go to a server, the URL, cookies, storage, logs, or analytics. The clean URL stays unchanged through load, calculation, and reset. No API route, dataset, or background job.

### Backend contract

Two plain TypeScript modules. Both run under `node --experimental-strip-types`, so use no enums, no namespaces, and no parameter properties. Use explicit `.ts` import extensions, as `lib/ip-asn/input.ts` does. Neither module reads the DOM, the network, time, or randomness.

#### `lib/saas-economics/shared.ts`

Shared by this tool and `/break-even-mrr-calculator`. Other SaaS calculators may adopt it later. Don't change existing engines to use it in this task.

```ts
export const SAAS_ECONOMICS_CURRENCIES = ["USD", "EUR", "GBP", "INR", "CAD", "AUD"] as const;
export type SaasEconomicsCurrency = (typeof SAAS_ECONOMICS_CURRENCIES)[number];
export function isSaasEconomicsCurrency(value: unknown): value is SaasEconomicsCurrency;

/** 1,000,000,000.00 in cents. */
export const SAAS_ECONOMICS_MAX_MONEY_CENTS = 100_000_000_000n;

export type SaasParseFailure = "missing" | "format" | "range";
export type SaasParseResult<T> = { ok: true; value: T } | { ok: false; reason: SaasParseFailure };

/** Non-string or trimmed-empty -> "missing". Pattern ^\d+(\.\d{1,2})?$. Inclusive bounds in cents. */
export function parseMoneyCents(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint>;

/**
 * Percent with up to two decimals, returned in hundredths ("80.5" -> 8050n).
 * A leading "-" is accepted only when bounds.min < 0n. Inclusive bounds in hundredths.
 */
export function parsePercentHundredths(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint>;

/** Pattern ^\d+$. Inclusive bounds. */
export function parseWholeNumber(raw: unknown, bounds: { min: bigint; max: bigint }): SaasParseResult<bigint>;

/** Optional plain-text label: trims; empty -> ""; rejects control characters or more than maxLength code points. */
export function parseOptionalLabel(raw: unknown, maxLength: number): SaasParseResult<string>;

/** Requires denominator > 0n. Rounds half away from zero; works for negative numerators. */
export function divideHalfAwayFromZero(numerator: bigint, denominator: bigint): bigint;

/** Requires denominator > 0n. Ceiling toward positive infinity. */
export function divideCeil(numerator: bigint, denominator: bigint): bigint;
```

A non-string value is `missing`, not a crash. An optional field treats `missing` as "not entered", and the engine decides that. Throwing is reserved for programmer errors such as a zero denominator.

#### `lib/cac-payback-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";

export const CAC_PAYBACK_CAC_SOURCES = ["direct", "spend"] as const;
export type CacPaybackCacSource = (typeof CAC_PAYBACK_CAC_SOURCES)[number];
export const CAC_PAYBACK_HORIZON_MONTHS = 600;

export const CAC_PAYBACK_SCENARIO_FIELDS = [
  "cac", "acquisitionSpend", "newCustomers", "monthlyArpa", "grossMarginPercent", "monthlyChurnPercent",
] as const;
export type CacPaybackScenarioField = (typeof CAC_PAYBACK_SCENARIO_FIELDS)[number];
export type CacPaybackScenarioKey = "baseline" | "alternative";
export type CacPaybackFieldKey =
  | "form" | "currency" | "cacSource"
  | `${CacPaybackScenarioKey}.${CacPaybackScenarioField}`;

export type CacPaybackScenarioInput = Record<CacPaybackScenarioField, string>;
export type CacPaybackInput = {
  currency: string;
  cacSource: string;
  compare: boolean;
  includeChurn: boolean;
  baseline: CacPaybackScenarioInput;
  alternative: CacPaybackScenarioInput;
};

export type CacPaybackNeverReason = "zeroGrossProfit" | "negativeGrossProfit";

/** CAC is exactly 0. Nothing to earn back; checked before gross profit, ARPA, and churn. */
export type CacPaybackZeroAcquisitionCost = { kind: "zeroAcquisitionCost" };

export type CacPaybackStraightLine =
  | { kind: "finite"; tenths: bigint; tenthsUnderOne: boolean; recoveryMonth: bigint } // recoveryMonth >= 1n
  | { kind: "never"; reason: CacPaybackNeverReason }
  | CacPaybackZeroAcquisitionCost;

export type CacPaybackRevenueOnly =
  | { kind: "finite"; tenths: bigint; tenthsUnderOne: boolean }
  | { kind: "zeroArpa" }   // CAC above 0, ARPA 0
  | CacPaybackZeroAcquisitionCost;

export type CacPaybackRetention =
  | { kind: "finite"; recoveryMonth: bigint } // >= 1n
  | { kind: "never"; reason: CacPaybackNeverReason }
  | { kind: "never"; reason: "churnLimit"; lifetimeGrossProfitCents: bigint }
  | { kind: "beyondHorizon"; horizonMonths: 600 }
  | CacPaybackZeroAcquisitionCost;

export type CacPaybackScenarioValues = {
  cacCents: bigint;                     // >= 0n; 0n only for zero CAC
  cacIsRounded: boolean;
  acquisitionSpendCents: bigint | null; // null for direct
  newCustomers: bigint | null;          // null for direct
  monthlyArpaCents: bigint;
  grossMarginHundredths: bigint;        // signed
  monthlyGrossProfitCents: bigint;      // signed, half away from zero
  monthlyGrossProfitRoundedToZero: boolean;
  revenueOnly: CacPaybackRevenueOnly;
  straightLine: CacPaybackStraightLine;
  monthlyChurnHundredths: bigint | null; // null when churn is off
  retention: CacPaybackRetention | null; // null when churn is off
};

export type CacPaybackComparison = {
  /** alternative.tenths - baseline.tenths; null unless both straight lines are finite. Negative means sooner. */
  straightLineTenthsDelta: bigint | null;
  /** alternative.recoveryMonth - baseline.recoveryMonth; null unless churn is on and both retentions are finite. */
  retentionMonthDelta: bigint | null;
};

export type CacPaybackValues = {
  currency: SaasEconomicsCurrency;
  cacSource: CacPaybackCacSource;
  includeChurn: boolean;
  baseline: CacPaybackScenarioValues;
  alternative: CacPaybackScenarioValues | null; // null when compare is off
  comparison: CacPaybackComparison | null;      // null when compare is off
};

export type CacPaybackErrors = Partial<Record<CacPaybackFieldKey, string>>;

export type CacPaybackCalculation =
  | { status: "valid"; values: CacPaybackValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: CacPaybackErrors };

export function calculateCacPayback(input: unknown): CacPaybackCalculation;
```

`calculateCacPayback` accepts `unknown`. A non-object input, a missing scenario object, or a non-boolean `compare` or `includeChurn` gives `errors.form`. An unsupported currency or CAC source gives an error on that key. It collects every field error in one pass and never throws for user input. The error keys are the only link between engine and form, so the frontend maps `baseline.monthlyArpa` to that field.

Error messages. The engine owns these strings, and the writing pass may reword them:

| Case | Message |
| --- | --- |
| Missing money | `Enter <label>.` For example, `Enter monthly ARPA.` |
| Bad money format | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | `Enter an amount up to 1,000,000,000.00.` |
| Customers | `Enter a whole number from 1 to 10,000,000.` |
| Gross margin | `Enter a percent from -100 to 100, with up to two decimals.` |
| Churn | `Enter a percent from 0 to 100, with up to two decimals.` |
| Form | `Something in the form is out of date. Reset and try again.` |

### Known examples

Calculated by hand and with exact fractions, independent of any competitor output. USD, CAC source `direct`, compare and churn off unless stated.

| Inputs | Expected |
| --- | --- |
| CAC `300`, ARPA `50`, margin `80` | Gross profit `$40.00`; payback `7.5` months; recovery month `8`; revenue-only `6.0`. |
| CAC `1800`, ARPA `180`, margin `75` | Gross profit `$135.00`; `13.3` months (exact 13⅓); month `14`; revenue-only `10.0`. |
| Spend `10000`, new customers `7`, ARPA `99`, margin `70` | CAC `$1,428.57`, `cacIsRounded: true`; gross profit `$69.30`; payback `20.6` (exact 20.614…); month `21`; revenue-only `14.4`. |
| CAC `300`, ARPA `50`, margin `0` | Straight line `never`, `zeroGrossProfit`; gross profit `$0.00`; revenue-only `6.0`. |
| CAC `300`, ARPA `50`, margin `-20` | Gross profit `-$10.00`; `never`, `negativeGrossProfit`. |
| CAC `300`, ARPA `0`, margin `80` | `never`, `zeroGrossProfit`; revenue-only `zeroArpa`. |
| CAC `1`, ARPA `50`, margin `80` | `tenths: 0`, `tenthsUnderOne: true` (exact 0.025); month `1`. Revenue-only `tenths: 0`, `tenthsUnderOne: true` (exact 0.02). |
| CAC `40`, ARPA `50`, margin `80` | Exactly `1.0` month; month `1`. |
| CAC `0`, ARPA `50`, margin `80` | Straight line and revenue-only `zeroAcquisitionCost`; gross profit `$40.00`. |
| CAC `0`, ARPA `50`, margin `-20` | Straight line `zeroAcquisitionCost`, not `never`; gross profit `-$10.00`. |
| CAC `0`, ARPA `0`, margin `0` | Straight line and revenue-only `zeroAcquisitionCost`; gross profit `$0.00`. |
| Spend `0`, new customers `5`, ARPA `50`, margin `80` | CAC `$0.00`, `cacIsRounded: false`; straight line `zeroAcquisitionCost`. |
| Churn on: CAC `0`, ARPA `50`, margin `80`, churn `100` | Retention `zeroAcquisitionCost`. |
| Churn on: CAC `300`, ARPA `50`, margin `80`, churn `5` | Straight line `7.5`, month `8`; retention `finite`, month `10`. After 9 months the cohort has earned $295.80; after 10, $321.01. |
| Churn on: CAC `1200`, ARPA `99`, margin `70`, churn `6` | Straight line `17.3`, month `18`; retention `never`, `churnLimit`, lifetime `$1,155.00`. |
| Churn on: CAC `800`, ARPA `50`, margin `80`, churn `5` | Retention `never`, `churnLimit`, lifetime `$800.00`. Equality never recovers. |
| Churn on: CAC `300`, ARPA `50`, margin `80`, churn `0` | Retention month `8`, the same as the straight-line month. |
| Churn on: ARPA `50`, margin `80`, churn `100`; CAC `30`, then `40`, then `50` | Gross profit `$40.00` in month 1 only. CAC `30`: month `1`. CAC `40`: month `1`, because the ceiling is reached in month 1. CAC `50`: `never`, `churnLimit`, lifetime `$40.00`. |
| Churn on: CAC `399000`, ARPA `50`, margin `80`, churn `0.01` | Straight line `9975.0`, month `9975`; retention `beyondHorizon`, 600. |
| Compare: baseline CAC `300`, ARPA `50`, margin `80`; alternative CAC `300`, ARPA `60`, margin `80` | Baseline `7.5`; alternative `6.3` (exact 6.25, half up); delta `-12` tenths, shown as `1.2 months sooner`. |
| Compare with churn on: baseline CAC `300`, ARPA `50`, margin `80`, churn `5`; alternative CAC `0`, same ARPA, margin, and churn | Baseline `7.5`, retention month `10`; alternative straight line and retention `zeroAcquisitionCost`; both deltas `null`. |
| Compare with churn on: CAC `300`, ARPA `50`, margin `80`, churn `5`; alternative CAC `300`, ARPA `50`, margin `80`, churn `2` | Baseline month `10`; alternative month `9` (after 8 months, $298.47; after 9, $332.50); `retentionMonthDelta: -1`. |
| Invalid: CAC blank, `-1`, `1e3`, `$300`, `1,200`, `300.001`; spend blank or `-5`; margin `100.01` or `-100.01`; churn blank with churn on, or `100.01`; customers `0` or `2.5`; currency `JPY` | A field-specific error for each; `status: "invalid"`; no values. CAC `0` and spend `0` are valid. Blank alternative fields with compare off, or blank churn with churn off, are valid. |

Check of the 100% churn rows: `A·m·d = 5,000 × 8,000 × 1 = 40,000,000`. CAC `30` gives `N·10000 = 30,000,000`, which is less, so month 1. CAC `40` gives `40,000,000`, equal, so month 1. CAC `50` gives `50,000,000`, more, so `never`.

### Ownership

Sol builds the backend:

- `lib/saas-economics/shared.ts`, shared with the break-even tool. Build it once and have both engines import it.
- `lib/cac-payback-calculator/engine.ts`.
- `tests/pages/cac-payback-calculator/cac-payback-calculator.test.mjs` covering the examples above, run with `npm run test:focused -- tests/pages/cac-payback-calculator`.
- The development tool-page row through the content and publishing commands, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/cac-payback-calculator/page.tsx`, `layout.tsx`, `cac-payback-calculator.tsx`, and `cac-payback-calculator.module.css`, following the sibling SaaS routes.
- `app/(site)/(tools)/cac-payback-calculator/art/cac-payback-calculator.ts`, plus its registration line in `lib/tool-catalog-art.ts`.

No URL-restore wrapper. Financial inputs don't go in the URL.

### Catalog placement

Primary and only catalog: `/saas-tools`. A founder there is choosing among SaaS money calculators, and payback sits next to the broad SaaS metrics snapshot and gross margin. Append it after the current last membership. The coordinator sets the final order with the break-even and LTV tools that ship in the same batch. No secondary catalog fits.

Catalog `toolSpot` key: `cac-payback-calculator`.

- Takeaway: monthly gross profit adds up until it reaches the cost of winning the customer.
- Focal subject: a staircase of equal solid steps climbing from left to right.
- One supporting relationship: a dashed horizontal level line at the cost height, with one small marked dot where the staircase first touches it.
- Tone: calm and neutral. No currency signs, numbers, clocks, calendars, coins, or arrows pointing up.
- It must read differently from the gross margin card, which uses two columns and a bracket, and the break-even card, which uses a balance. Keep it wordless and legible at card size in both themes.

## Interface

### Flow

- Question: "How many months until a new customer's gross profit repays what I spent to win them, and what changes that?"
- Lead answer: payback months for the baseline, `Never` with its reason, or `Nothing to earn back` when CAC is 0.
- Primary action: `Calculate payback`.
- Control mode: `single`. Each input drives the answer, so nothing that changes it is hidden. Compare and churn are visible checkboxes that add fields to the main flow. They aren't in a disclosure.

Workbench order:

1. Currency, a narrow select, and CAC source, two visible choices: `Enter CAC` and `From spend and new customers`.
2. Scenario fields: CAC (or spend and new customers), monthly ARPA, gross margin, then monthly churn when churn is on.
3. Two checkboxes: `Compare a second scenario` and `Include monthly churn`.
4. `Calculate payback` and a quiet `Reset`.
5. One divider, then the results.

When compare is on, the fields become two side-by-side fieldsets with the legends `Baseline` and `Alternative`. Turning compare on for the first time copies the baseline's raw strings into blank alternative fields, so the reader changes only what differs. Turning it off and on again keeps the alternative drafts.

Only one helper line sits in the workbench, under gross margin: `After hosting, support, payment fees, and other costs to serve.` It prevents the most common mistake, using revenue or a margin that includes sales costs. Everything else about which costs belong in CAC goes in the article.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Currency | `UiSelect` from `@/app/ui/controls` |
| CAC source | `UiChoiceGroup` from `@/app/ui/controls` |
| Money, percent, and count fields | `UiTextField` from `@/app/ui/controls`, with `inputMode="decimal"` (or `numeric` for customers), `suffix` set to the currency code or `%`, and autocomplete, capitalization, and spellcheck off |
| Compare and churn | `UiCheckbox` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, and `UiButton` from `@/app/ui/controls` |
| Lead answers | `UiPrimaryResult` from `@/app/ui/display` |
| Assumptions table | `UiDataTable` from `@/app/ui/display` |
| Failure and change messages | `UiStatus` from `@/app/ui/display` |

Use `UiTextField` rather than `UiNumberField`, so pasted values reach the strict parser unchanged.

No new shared component. The two-column scenario layout is route CSS: a grid of two `<fieldset>` elements with legends.

A cumulative recovery chart was considered and left out. `UiLineChart` draws one series with no reference line, so it can't show the CAC level clearly. The recovery month already answers the question.

Tool-specific component, in the route file:

- `CacPaybackCalculator`: owns the raw form state, error mapping by `CacPaybackFieldKey`, focus, status, and the result rendering described below. It calls only `calculateCacPayback`.

### Result regions

1. **Lead.** One `UiPrimaryResult` per scenario. With compare on, the two sit in a two-column row.
   - Label: `CAC payback`, or `Baseline payback` and `Alternative payback`.
   - Value: the tenths with unit `months`, `Under 0.1` with unit `months`, `Never`, or `Nothing to earn back` with no unit.
   - Detail, finite: `Earned back during month 8.`
   - Detail, `never`: `zeroGrossProfit` → `Each customer leaves $0.00 a month after serving costs.` `negativeGrossProfit` → `Each customer costs $10.00 a month more to serve than they pay.`
   - Detail, `zeroAcquisitionCost`: `CAC is $0.00, so there's no acquisition cost to earn back.` When monthly gross profit is zero or negative, add the matching `never` sentence with `still`, such as `Each customer still costs $10.00 a month more to serve than they pay.` Never show `0 months` or `month 0`.
   - With churn on, add a second detail line. Finite: `With 5% monthly churn: earned back during month 10.` Never: `With 6% monthly churn: never. A customer returns at most $1,155.00 in gross profit.` Beyond horizon: `With 0.01% monthly churn: not within 600 months.` Zero CAC: no churn line, because the lead already says there's nothing to earn back.
   - The alternative detail adds `1.2 months sooner than baseline`, `later`, or `Same as baseline`, plus the churn month difference when there is one. Leave each difference out when its delta is `null`, which happens whenever either side isn't `finite`, including zero CAC.
   - Tone stays `neutral` in every case. The words carry the meaning, with no grade colors.
2. **How each answer is built.** One `UiDataTable`. Columns: `Item`, `Baseline` (or `Value` without compare), and `Alternative`. Rows, in order:
   - CAC. In spend mode, add `$10,000.00 ÷ 7 customers` under the amount.
   - Monthly ARPA.
   - Gross margin.
   - Monthly gross profit per customer, which is the denominator.
   - Monthly churn, when churn is on.
   - `Months if you ignore serving costs`, the revenue-only comparison: tenths, `Under 0.1`, `n/a` for `zeroArpa`, or `Nothing to earn back` for `zeroAcquisitionCost`.

   Payback months aren't repeated in the table, because the leads hold them.
3. **Formula.** One small line under the table: `Payback months = CAC ÷ (monthly ARPA × gross margin)`. With churn on, add: `With churn, month 1 counts every customer, and each later month counts the share still paying.`

A rounded derived CAC shows the cent-rounded value in the table. The exact fraction is still what the payback uses. Gross profit that rounds to `$0.00` but isn't zero shows `Under $0.01`.

### States

- **Initial.** Every value field is blank. USD and `Enter CAC` are selected, and both checkboxes are off. No result.
- **Invalid or incomplete.** Clear the old result and keep the inputs. Show one error under each invalid field, focus the first invalid field in reading order, baseline before alternative, and add no error panel. An error on an alternative or churn field is always visible, because those fields show whenever their checkbox is on.
- **Valid.** Show the leads, table, and formula, focus the first lead, and announce it once through the focused output.
- **Never, beyond horizon, and zero CAC.** These are valid results with the same layout, not errors.
- **Edited after a result.** Clear the result and announce once, politely: `Inputs changed. Calculate again.` Focus stays where the reader is typing.
- **Toggle.** Turning compare or churn on adds fields in place. Focus stays on the checkbox. Turning it off hides the fields and keeps their drafts. Switching CAC source swaps the fields and keeps both drafts.
- **Unexpected failure.** If the engine throws, keep the inputs, clear the result, show one `UiStatus` error by the actions (`Couldn't calculate. Try again.`), and leave Calculate enabled.
- **Reset.** Restore the initial state, focus the CAC source choice, and announce `Form reset.`
- **Restored.** The clean URL never changes. If the back-forward cache restores the page with a result, the next edit clears it.
- **Long values.** `1,000,000,000.00` amounts and payback values like `9,975.0` must fit in the leads and table cells without clipping. Wrap the detail lines. Keep minus signs visible.
- **Loading, empty, partial, and retry.** These don't apply. The calculation is synchronous and local, and it always returns a full result or field errors.

### Responsive and accessible behavior

Desktop:

- Use the shared workbench band with a measured inner width.
- Currency and CAC source share one row.
- Scenario fields stack in one column without compare, and become two equal fieldset columns with compare. Matching fields line up across the columns.
- The two leads sit side by side, with the table full width below.

Mobile:

- Stack in this order: currency, CAC source, the baseline fieldset, the alternative fieldset, checkboxes, actions, baseline lead, alternative lead, table, formula.
- `UiDataTable` turns into labeled rows. Each row labels its value with `Baseline` or `Alternative`.
- Buttons go full width. No page-level horizontal overflow. Grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order follows the visual order. In a two-column layout, it goes through the whole baseline fieldset before the alternative one.
- Enter in a field submits.
- Each field has a visible label. Its fieldset legend gives the scenario context, so a screen reader announces "Alternative, Monthly ARPA".
- Errors are tied to their fields.
- One polite live region announces changes, resets, and failures. Results are announced through the focused output only, not twice.

Check at desktop and mobile in both themes:

- The 300/50/80 example.
- Margin `0`.
- The churn-limit example.
- CAC `0` with margin `-20`.
- Compare with churn.
- A pasted `$1,200` error.
- The 1e9 maximum amounts.

---

## Content

Plan for the writing session. The live article stays in the tool-page row. Draft files are in `tmp/page-publishing/saas-economics-final-b/cac-payback-calculator/`. This section does not repeat that article.

The dev server on port 11834 was not answering HTTP, and preview automation was unavailable. The examples below are the engine's known examples and the result sentences in the route file.

### Search intent and metadata direction

The reader wants the months of gross profit it takes to earn back the cost of winning one customer. They also want to know what changes if the price, the margin, the cost, or monthly customer churn changes.

Start the visible title with `CAC payback calculator` and ask how many months it takes to earn the cost back. The search title keeps that phrase and names months of gross profit. The description says what they enter and that churn and a second case are optional. No grade, no cash-payback promise, and no universal healthy range.

Card name: `CAC payback`. Card description: the months of gross profit that repay the cost of one new customer. Art key: `cac-payback-calculator`.

### Page promise and reader questions

After the page, the reader can compute gross-profit payback, see the revenue-only months as a separate comparison, and tell `Never`, `Nothing to earn back`, `Under 0.1`, and `not within 600 months` apart.

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| How many months until gross profit repays CAC? | Lead shows tenths, `Under 0.1`, `Never`, or `Nothing to earn back`, plus the recovery month. | Give the formula and the $300, $50, 80% example: $40.00 a month, 7.5 months, during month 8. |
| What if I ignore serving costs? | Table row `Months if you ignore serving costs`. | Say that row is CAC ÷ ARPA. In the example it is 6.0 months, and it is not the payback. |
| What do I put in CAC? | `Enter CAC` or spend ÷ new paying customers. | Same period and the same customers. Sales and marketing stay out of gross margin. Link Stripe. |
| What does customer churn change? | Second detail line. Month 1 counts everyone. Later months count the share still paying. | 5% churn on the example is month 10 ($295.80 after 9 months, $321.01 after 10). Straight-line 7.5 stays visible. |
| When is it never, even if the ceiling equals CAC? | `never` with `churnLimit` and the lifetime gross profit. 100% churn is month 1, and equality counts. | $800 at 5% is never. $40 at 100% is month 1. $50 at 100% is never. |
| What is past month 600? | `not within 600 months`. The straight-line lead can still be finite. | $399,000, $50, 80%, 0.01% churn is 9,975.0 months straight-line and not within 600. That is not `Never`. |
| What if CAC is zero, or margin is not positive? | `Nothing to earn back` wins over gross profit. A loss is a separate sentence. `Never` for zero or negative gross profit when CAC is above zero. | Do not call zero CAC `0 months`. A derived CAC under one cent is still a cost. |
| Does annual billing make this cash? | The formula line does not say cash. | Annual prepayment can move cash. This result is gross profit over the service. Link ChartMogul and IFRS 15. |
| How is this different from LTV:CAC? | This tool does not estimate lifetime value. | Link the lifetime value, LTV:CAC, acquisition cost, break-even MRR, and SaaS metrics calculators where each is the next job. |

### Recommended page structure and formats

**Introduction.** Three sentences. Months of gross profit, what to have ready, and the two optional additions. No history and no formula walkthrough.

**Usage.** Where the CAC number comes from, what ARPA and gross margin include, customer churn rather than revenue churn, and how to read the lead, the recovery month, and the revenue-only row. One `[!EXAMPLE]` for $300, $50, and 80%. Do not narrate Calculate or Reset.

**Supporting content, in this order:**

1. `How is CAC payback calculated?` Formula box. Point at the usage example. Do not retell every arithmetic step.
2. `Why show months that ignore serving costs?` The 6.0 versus 7.5 contrast, once.
3. `What belongs in the CAC?` Stripe link. Spend that does not divide evenly still uses the exact fraction. The acquisition cost calculator is the next step when the cost needs categories.
4. `What does monthly customer churn change?` Plain timing rule, then the 5% example with $295.80 and $321.01.
5. `When does the group never earn the cost back?` Table for the $800 ceiling, the 100% equality exception, and a short note for month 600. No grade.
6. `What if the cost is zero, or gross profit is not positive?` Table. Exact zero, a separate loss, `Never`, and `Under $0.01`.
7. `Does paying annually change the months?` Warning. Gross-profit recovery is not cash collected. ChartMogul and IFRS 15 links.
8. `How is payback different from lifetime value?` Links to the lifetime value calculator, the LTV:CAC calculator, the break-even MRR calculator, and the SaaS metrics calculator.

No article chart and no article marker art. The card art is already registered. One example home for $300 / $50 / 80%. The churn section extends that example. It does not start a second unrelated story.

### Claims to keep, and claims to avoid

Keep the engine's words: `Nothing to earn back`, `Never`, `Under 0.1`, `not within 600 months`, and `Months if you ignore serving costs`.

Avoid a benchmark band, a health label, a cash-payback claim, expansion or discount math, and any statement that a churn ceiling equal to CAC is earned back below 100% churn. Do not say month 600 means never. Do not say a subcent derived CAC is nothing to earn back. Do not copy the development placeholder.

### Source roles and links

- [Stripe's CAC guide](https://stripe.com/resources/more/cac-in-saas) for the cost pool, matching period, and the absence of a universal benchmark. Checked 2026-10-04 in research.
- [ChartMogul's CAC payback](https://chartmogul.com/saas-metrics/cac-payback/) and [Stripe's payback guide](https://stripe.com/resources/more/what-is-the-cac-payback-period) for CAC ÷ (monthly ARPA × gross margin).
- [Stripe's gross margin guide](https://stripe.com/resources/more/saas-gross-margin-explained-what-it-is-and-why-it-is-important) for serving costs versus sales and marketing.
- [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) and [IFRS 15](https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/) for normalized revenue versus cash and recognition.
- The $300 / 5% cumulative totals and the other edge rows come from this spec's known examples, which the engine tests cover. They are not a published industry series.
