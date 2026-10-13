# Startup runway calculator

Route: `/startup-runway-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher is a bootstrapped founder asking "how long will my business cash last, and do I cover my costs before it runs out?" They have three numbers at most: cash in the bank, what customers paid this month, and what went out. Some also have a growth rate they hope for and a cost they know is coming.

Where the current top results fail them:

- They ask for MRR, not cash collected. An annual prepayment then shows up as a twelfth of itself, and a founder can't tell which number to use.
- Bad input passes. Trezy, Futureproof, and Kenodo accept negative cash. Pilot treats `abc` as $0 and keeps a stale result. SaaS Runway clamps `-1` to `0` silently.
- "Infinite runway" and "36+ months" hide a projection horizon. Equal cash in and out gets "revenue exceeds expenses" (Trezy) or "default alive" (Calculator Academy, SaaS Runway).
- Only Calculator Academy grows expenses, and nobody models a hire starting in month 4, a yearly bill, or a known inflow. Kenodo tells you to fake a one-off cost by subtracting it from cash.
- The month growth first applies is rarely stated, so two tools give 10.6 and 12.6 months for the same inputs.
- Health bands such as "under 6 months is danger" come from fundraising advice and don't fit a bootstrapped business.

What this tool does better:

1. Three required inputs give gross burn, net burn, runway in months, and the cash-out month. It asks for cash collected, not MRR.
2. An optional forecast with revenue growth, expense growth, and up to 10 planned changes: a monthly cost or income starting in a given month, a yearly bill, or a one-off payment. No tested competitor has planned changes.
3. Today's runway and the forecast runway sit side by side, with a month-by-month cash path and chart.
4. Four outcomes stay apart: cash-flow positive now, break-even now, covers costs before cash runs out, and runs out first. When cash runs out before break-even, it says how much more cash would bridge the gap.
5. One stated month rule: month 1 uses the numbers as entered, and growth first applies in month 2. This matches Legendev and Calculator Academy, so a founder who checks against them gets the same answer.
6. A fixed 60-month horizon, stated in the answer: "No cash-out date in the next 60 months", never "infinite".
7. Every invalid value is rejected beside its field. Nothing is clamped or treated as zero.
8. No health bands, no "good runway" verdict, no "default alive" label in the result, and no hardcoded fees or price presets.

## Product

### Promise and scope

The primary user is an indie hacker or solo SaaS founder, usually bootstrapped, checking how long business cash lasts. Founder pay counts as cash paid out when they take it.

The tool gives them runway at today's numbers and, optionally, under a forecast they set, with the month cash runs out and the month customer cash first covers costs.

Launch scope:

- One currency, used as a label only. The same six currencies as the other SaaS tools.
- Three required amounts: cash available now, cash collected from customers in a typical month now, and total cash paid out in a typical month now.
- An optional forecast:
  - Monthly revenue growth and monthly expense growth, as percents.
  - Up to 10 planned changes. Each is money in or money out, an amount, a start month from 1 to 60, and how often: once, every month from then on, or every 12 months from then on. An optional short name.
- A 60-month projection with the month-by-month cash path.

Exclusions:

- Personal or household savings, and founder living costs outside the business. A founder who pays themselves includes that pay in cash paid out.
- Fundraising, loans as financing, debt, overdrafts, interest, and negative opening cash.
- Payment timing within a month, invoice delays, and weekly cash forecasts. The model is monthly.
- Cost cuts on a date. A planned change adds money in or money out. It doesn't lower a base figure. The usage copy can say to lower the base outflow if a cut is already made.
- Planned changes that grow. Their amounts stay flat.
- Churn, MRR movements, and recognized revenue. Customer cash collected is the only income input.
- Payment fees, tax rates, and service prices. The user includes them in cash paid out.
- Health bands, "good runway" rules, benchmarks, and a "default alive" label in the result.
- URL sharing, export, and saved scenarios.

### Technical contract

**Fields and units.** All money is in the selected currency. Every flow is per month.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| Cash now | Money `0` to `1,000,000,000.00`. | Required. `0` is valid. |
| Cash collected a month | Money `0` to `1,000,000,000.00`. | Required. Customer payments received, including annual prepayments in the month they arrive. Not loans or investment. |
| Cash paid out a month | Money `0` to `1,000,000,000.00`. | Required. Everything that leaves the account: founder pay, contractors, hosting, APIs, software, payment fees, marketing, taxes. |
| Revenue growth | Percent `-100` to `100`, up to two decimals, leading `-` allowed. | Optional. Monthly, compounding. |
| Expense growth | Percent `-100` to `100`, up to two decimals, leading `-` allowed. | Optional. Monthly, compounding. |
| Planned change: direction | `in` or `out`. Default `out`. | |
| Planned change: amount | Money above `0`, at most `1,000,000,000.00`. | |
| Planned change: start month | Whole number `1` to `60`. | Month 1 is the first month from today. |
| Planned change: frequency | `once`, `monthly`, or `yearly`. Default `once`. | `monthly` repeats every month from the start month. `yearly` repeats every 12 months from it. |
| Planned change: name | Up to 60 characters. Optional. | Blank shows `Planned change N`. |

At most 10 planned changes.

**Parsing.** Use `lib/saas-economics/shared.ts` as it is today: `parseMoneyCents`, `parsePercentHundredths`, `parseWholeNumber`, `parseOptionalLabel`, `divideHalfAwayFromZero`, `divideCeil`, and `isSaasEconomicsCurrency`.

- Trim outer whitespace.
- Reject commas, currency symbols, `%`, exponents, interior spaces, and a third decimal.
- Money never takes a sign. A leading `-` on money gets its own `negative` code so the message can say why.
- Whole numbers take digits only.
- Blank is never zero for the three required amounts.

**Forecast group.**

- The forecast is on when either growth field has a value or at least one planned change counts.
- A planned change counts unless its name, amount, and start month are all blank. A row with all three blank is ignored. Direction and frequency always have values.
- A counted row needs a valid amount and start month. Each blank or bad one gets its own field error.
- When the forecast is on, a blank growth field means `0%`. The result returns a `wasBlank` flag so the assumptions list can say `0% (left blank)`. A founder adding only a hire shouldn't have to type two zeros.
- When the forecast is off, the result has `projection: null`.

**Notation.** `d = 10000`.

| Symbol | Meaning |
| --- | --- |
| `C` | Cash now in cents |
| `R` | Cash collected a month in cents |
| `X` | Cash paid out a month in cents |
| `g` | Revenue growth in hundredths of a percent |
| `e` | Expense growth in hundredths of a percent |

Keep everything exact in `bigint`. No floating point, logarithms, or `Math.pow` in the engine.

**Today's numbers.** These ignore the forecast.

- `grossBurnCents = X`.
- `netBurnCents = X − R`, signed. Positive means cash shrinks. This is the sign convention the page states.
- If `X − R > 0`, the outcome is `burning`:
  - `runwayTenths = floor(10 × C ÷ (X − R))`. Always round down, so runway is never overstated. 12.59 shows `12.5`.
  - `runwayIsExact` is true when `(10 × C) mod (X − R) = 0`.
  - `cashOutMonth = divideCeil(C, X − R)`, a `bigint`. It's the month cash runs out in: `13` for 12.5 months, `10` for exactly 10.0. With `C = 0` it's `0`, meaning there's no cash for this month's gap.
  - No cap. A tiny burn can give thousands of months. The frontend shows it in years.
- If `X − R = 0`, the outcome is `breakEven`. The balance holds at `C`.
- If `X − R < 0`, the outcome is `cashFlowPositive`, with `surplusCents = R − X`.

**Month convention.** The coordinator asked for one clear rule.

- Month `0` is today. Its balance is `C`, with no flows.
- Month `t` is the `t`-th month from today, for `t` from 1 to 60. Its balance is the cash left at its end.
- Month 1 uses the amounts as entered. Growth first applies in month 2:

  `collected(t) = round(R × (d + g)^(t−1) ÷ d^(t−1))`

  `paidOut(t) = round(X × (d + e)^(t−1) ÷ d^(t−1))`

- `round` is half away from zero to whole cents. Compute it from the exact power, never by compounding a rounded value. Keep `(d + g)^(t−1)` and `d^(t−1)` as running `bigint` products.
- `planned(t)` is the signed sum of the planned changes in month `t`: `+amount` for `in`, `−amount` for `out`.
  - `once`: month `t = start`.
  - `monthly`: every `t ≥ start`.
  - `yearly`: every `t ≥ start` with `(t − start) mod 12 = 0`.
  - Planned amounts never grow.
- `change(t) = collected(t) − paidOut(t) + planned(t)`.
- `balance(t) = balance(t−1) + change(t)`. Balances are exact sums of the rounded month values, so the month table adds up by hand.
- `atTodaysRate(t) = C − t × (X − R)`, for the comparison line. It may go negative.
- The horizon is `STARTUP_RUNWAY_HORIZON_MONTHS = 60`. The engine never looks past month 60.

Why month 1 holds the entered amounts: the founder enters what a normal month looks like now, so next month is that month. Applying growth from month 1 would mean today's burn never happens in the forecast. With `C = 0`, a burning founder with growth would then show no cash-out at all. This rule is also more cautious. It matches Legendev and Calculator Academy, and gives Calculator Academy's 11.8 months for its own example.

**Cash out, in the forecast.**

- The cash-out month is the first `t` from 1 to 60 where `balance(t) ≤ 0` and `change(t) < 0`.
- Within that month, flows count as spread evenly. The exact runway is `(t − 1) + balance(t−1) ÷ (−change(t))`.
- `runwayTenths = 10 × (t − 1) + floor(10 × balance(t−1) ÷ (−change(t)))`, rounded down.
- `runwayIsExact` is true when `(10 × balance(t−1)) mod (−change(t)) = 0`.
- `cashOutMonth = t`. The only exception is when `balance(t−1) = 0` and `t = 1`, with `C = 0`. Then runway is `0` and `cashOutMonth = 0`.
- With steady flows, the cash-out month is the ceiling of the exact runway, the same as the static rule. A one-off payment can move it later than the ceiling. With `C = 0`, no monthly flows, and a $1 payment in month 2, cash lasts all of month 1, so runway is `1.0` and the cash-out month is `2`. Result wording takes the month from `cashOut.month`, never from the runway.
- If no month qualifies, there's no cash out within 60 months.
- With 0% growth and no planned changes, this gives exactly the static runway.

**Covering costs.** This compares the recurring flows only. One-off and yearly changes affect cash, not break-even.

- `recurringIn(t) = collected(t) + ` the sum of `monthly` `in` changes active in `t`.
- `recurringOut(t) = paidOut(t) + ` the sum of `monthly` `out` changes active in `t`.
- Month `t` covers costs when `recurringIn(t) ≥ recurringOut(t)`.
- `firstCoversCostsMonth` is the first `t` from 1 to 60 that covers costs, or `null`.
- `coversCostsFromMonth` is the first month of the last run of covering months, when that run reaches month 60. If month 60 doesn't cover costs, it's `null`. This is the lasting break-even month. A hire that pushes costs above income again moves it later. Example 6 shows this.

**Lowest balance and cash shortfall.**

- `lowestBalance` is the smallest `balance(t)` for `t` from 0 to 60, with its month. Ties take the earliest month.
- `cashShortfallCents = −lowestBalance.cents` when the lowest balance is below 0 and `coversCostsFromMonth` isn't `null`. Otherwise it's `null`.
- It's the extra cash today that would keep the balance at or above zero until costs are covered for good. It's only shown when the path recovers, because a path that keeps falling has no amount that's "enough", only one that lasts to an arbitrary horizon.

**Forecast outcome.** Checked in this order:

1. A cash-out month exists: `runsOut`, with `cashOutMonth`, `runwayTenths`, `runwayIsExact`, and `coversCostsFromMonth`.
   - If `coversCostsFromMonth` is after the cash-out month, cash runs out before costs are covered.
   - If it's at or before the cash-out month, a planned payment pushed cash below zero even though monthly costs are covered.
2. `coversCostsFromMonth = 1`: `coversCostsThroughout`. Every month from 1 to 60 covers costs.
3. `coversCostsFromMonth > 1`: `coversCostsBeforeCashOut`, with that month. If `firstCoversCostsMonth` is earlier, costs were covered, then weren't, then were again.
4. Otherwise: `lastsBeyondHorizon`. Cash stays above zero for 60 months, but costs aren't covered for good by month 60.

`matchesToday` is true when both growth rates are 0 and no planned change counts. The forecast then repeats today's numbers.

**Never return** `Infinity`, `NaN`, `-0`, a negative runway, a month above 60 in the forecast, or a clamped value.

**Action and handling.**

- `Calculate` is the only primary action. The writing pass names it.
- A valid submit shows the results and focuses the lead.
- An invalid submit clears any old result, keeps every raw input, shows each error under its field, and focuses the first invalid field in reading order.
- Editing any input clears the result and announces `Inputs changed. Calculate again.` once.
- Reset restores the initial state, focuses cash now, and announces `Form reset.`

**Privacy and security.** Everything runs in the browser. No value goes to a server, the URL, storage, logs, or analytics. The clean URL never changes. No API route, dataset, or job.

### Backend contract

Reuses `lib/saas-economics/shared.ts` as it is today. Runtime rules match the sibling engines: strip-types safe, explicit `.ts` imports, no DOM, network, clock, or randomness.

#### `lib/startup-runway-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";

export const STARTUP_RUNWAY_HORIZON_MONTHS = 60;
export const STARTUP_RUNWAY_MAX_PLANNED_CHANGES = 10;
export const STARTUP_RUNWAY_NAME_MAX_LENGTH = 60;
export const STARTUP_RUNWAY_DIRECTIONS = ["in", "out"] as const;
export type StartupRunwayDirection = (typeof STARTUP_RUNWAY_DIRECTIONS)[number];
export const STARTUP_RUNWAY_FREQUENCIES = ["once", "monthly", "yearly"] as const;
export type StartupRunwayFrequency = (typeof STARTUP_RUNWAY_FREQUENCIES)[number];

// Every field is the raw string from the form.
export type StartupRunwayPlannedChangeInput = {
  id: string;            // stable row id from the frontend, used in error keys
  name: string;
  direction: string;
  amount: string;
  startMonth: string;
  frequency: string;
};

export type StartupRunwayInput = {
  currency: string;
  cashNow: string;
  collectedPerMonth: string;
  paidOutPerMonth: string;
  revenueGrowthPercent: string;
  expenseGrowthPercent: string;
  plannedChanges: StartupRunwayPlannedChangeInput[];
};

export type StartupRunwayFieldKey =
  | "form" | "currency" | "cashNow" | "collectedPerMonth" | "paidOutPerMonth"
  | "revenueGrowthPercent" | "expenseGrowthPercent" | "plannedChanges"
  | `plannedChanges.${string}.name` | `plannedChanges.${string}.direction`
  | `plannedChanges.${string}.amount` | `plannedChanges.${string}.startMonth`
  | `plannedChanges.${string}.frequency`;

export type StartupRunwayErrorCode =
  | "missing" | "format" | "negative" | "range" | "zero" | "option" | "limit" | "duplicateId" | "form";

export type StartupRunwayErrors = Partial<Record<StartupRunwayFieldKey, { code: StartupRunwayErrorCode; message: string }>>;

export type StartupRunwayToday =
  | {
      kind: "burning";
      netBurnCents: bigint;       // > 0
      runwayTenths: bigint;       // floor; 125n = 12.5 months
      runwayIsExact: boolean;
      cashOutMonth: bigint;       // ceil(C ÷ net burn); 0n when cash is 0
    }
  | { kind: "breakEven" }
  | { kind: "cashFlowPositive"; surplusCents: bigint }; // > 0

export type StartupRunwayPlannedChange = {
  id: string;
  name: string;                   // trimmed, or "Planned change N" (N = position among counted rows)
  nameWasBlank: boolean;
  direction: StartupRunwayDirection;
  amountCents: bigint;            // > 0
  startMonth: number;             // 1..60
  frequency: StartupRunwayFrequency;
};

export type StartupRunwayMonth = {
  month: number;                  // 0..60
  collectedCents: bigint;         // 0 in month 0
  paidOutCents: bigint;           // 0 in month 0
  plannedCents: bigint;           // signed; positive = money in; 0 in month 0
  changeCents: bigint;            // signed; collected − paidOut + planned
  balanceCents: bigint;           // signed
  atTodaysRateCents: bigint;      // signed; C − month × (X − R)
  coversCosts: boolean | null;    // null in month 0
};

export type StartupRunwayCashOut = {
  month: number;                  // 0..60; 0 only when cash now is 0
  runwayTenths: bigint;
  runwayIsExact: boolean;
};

export type StartupRunwayProjection = {
  revenueGrowthHundredths: bigint;   // signed
  revenueGrowthWasBlank: boolean;
  expenseGrowthHundredths: bigint;   // signed
  expenseGrowthWasBlank: boolean;
  plannedChanges: StartupRunwayPlannedChange[]; // counted rows, input order
  matchesToday: boolean;
  cashOut: StartupRunwayCashOut | null;
  firstCoversCostsMonth: number | null;
  coversCostsFromMonth: number | null;
  lowestBalance: { month: number; cents: bigint };
  cashShortfallCents: bigint | null; // > 0 when present
  outcome:
    | { kind: "runsOut" }            // details in cashOut and coversCostsFromMonth
    | { kind: "coversCostsThroughout" }
    | { kind: "coversCostsBeforeCashOut"; month: number }
    | { kind: "lastsBeyondHorizon" };
  path: StartupRunwayMonth[];       // always 61 entries, months 0..60
};

export type StartupRunwayValues = {
  currency: SaasEconomicsCurrency;
  cashNowCents: bigint;
  collectedPerMonthCents: bigint;
  grossBurnCents: bigint;            // = paid out a month
  netBurnCents: bigint;              // signed; positive = cash shrinks
  today: StartupRunwayToday;
  projection: StartupRunwayProjection | null; // null = forecast off
};

export type StartupRunwayCalculation =
  | { status: "valid"; values: StartupRunwayValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: StartupRunwayErrors };

export function calculateStartupRunway(input: unknown): StartupRunwayCalculation;
```

`calculateStartupRunway` accepts `unknown`, collects every error in one pass, and never throws for user input.

- A non-object input gives `errors.form`.
- A missing string property counts as blank.
- A missing or non-array `plannedChanges` counts as an empty list.
- A row that isn't an object, or has a non-string or empty `id`, gives `errors.form`.
- Two rows with the same `id` give `errors.plannedChanges` with code `duplicateId`.
- More than 10 rows, counted or not, give `errors.plannedChanges` with code `limit`. The frontend never sends more than 10.

Error codes and messages. The engine owns these strings, and the writing pass may reword them:

| Field | Case | Code | Message |
| --- | --- | --- | --- |
| cashNow | blank | `missing` | `Enter the cash you have now. Use 0 if none.` |
| collectedPerMonth | blank | `missing` | `Enter the cash customers paid in a month. Use 0 if none.` |
| paidOutPerMonth | blank | `missing` | `Enter the cash you pay out in a month. Use 0 if none.` |
| any money | leading `-` | `negative` | `Enter 0 or more. This tool doesn't model overdrafts or debt.` |
| any money | bad format | `format` | `Use digits with up to two decimals. No commas or currency symbols.` |
| any money | above max | `range` | `Enter an amount up to 1,000,000,000.00.` |
| revenueGrowthPercent, expenseGrowthPercent | bad format or out of range | `format` / `range` | `Enter a monthly rate from -100 to 100, with up to two decimals.` |
| plannedChanges.*.amount | blank | `missing` | `Enter an amount, or remove this change.` |
| plannedChanges.*.amount | `0` | `zero` | `Enter an amount above 0.` |
| plannedChanges.*.startMonth | blank | `missing` | `Enter the month it starts, from 1 to 60.` |
| plannedChanges.*.startMonth | bad format, `0`, or above 60 | `format` / `range` | `Enter a whole month from 1 to 60.` |
| plannedChanges.*.name | control characters | `format` | `Remove line breaks and special characters from the name.` |
| plannedChanges.*.name | over 60 characters | `range` | `Use 60 characters or fewer.` |
| plannedChanges.*.direction, frequency; currency | not a listed value | `option` | `Choose one of the listed options.` |
| plannedChanges | more than 10 rows | `limit` | `You can add up to 10 planned changes.` |
| plannedChanges | repeated row id | `duplicateId` | `Something in the form is out of date. Reset and try again.` |
| form | non-object input or bad row | `form` | `Something in the form is out of date. Reset and try again.` |

The negative-money message applies to planned-change amounts too. The direction choice is how to enter money in.

### Known examples

Calculated independently with exact fractions, using the month rule above. USD. "Forecast off" means both growth fields blank and no planned changes.

| # | Inputs | Expected |
| --- | --- | --- |
| 1 | Cash `500000`, collected `10000`, paid out `50000`, forecast off | Gross burn `$50,000.00`; net burn `$40,000.00`; `burning`, `runwayTenths 125` (12.5), `runwayIsExact true`, `cashOutMonth 13`; `projection null`. |
| 2 | Cash `500000`, collected `10000`, paid out `60000`, revenue growth `10`, expense growth `0` | Today: net burn `$50,000.00`, `runwayTenths 100`, exact, `cashOutMonth 10`. Forecast: `runsOut`; cash out month `12`, `runwayTenths 118` (exact 11.8043…, = 37,146,880 ÷ 3,146,883), not exact. `firstCoversCostsMonth 20`, `coversCostsFromMonth 20`. Lowest balance month `19`, `-$128,409.11`; `cashShortfallCents 12840911`. Path: month 1 collected `$10,000.00`, balance `$450,000.00`; month 2 collected `$11,000.00`, balance `$401,000.00`; month 11 collected `$25,937.42`, balance `$25,311.67`; month 12 collected `$28,531.17`, balance `-$6,157.16`; month 20 collected `$61,159.09`, balance `-$127,250.02`. Matches Calculator Academy's 11.8. |
| 3 | Same as 2 with revenue growth `5` | `runsOut`; cash out month `11`, `runwayTenths 105` (exact 10.5897…). Covers costs from month `38`. Lowest month `37`, `-$703,718.62`. Legendev shows 10.6 because it rounds to nearest; this tool rounds down. |
| 4 | Cash `1000`, collected `60000`, paid out `50000`, forecast off | `cashFlowPositive`, `surplusCents 1000000`; net burn `-$10,000.00`. |
| 5 | Cash `1000`, collected `30000`, paid out `30000`, forecast off | `breakEven`; net burn `$0.00`. Not "cash-flow positive". |
| 6 | Cash `20000`, collected `3000`, paid out `2500`, revenue growth `5`, expense growth blank; changes: out `2000` monthly from month `4` (a hire); out `1200` yearly from month `3` (an annual renewal) | Today `cashFlowPositive`, surplus `$500.00`. Forecast: `expenseGrowthWasBlank true`, rate `0`. No cash out. `firstCoversCostsMonth 1`, `coversCostsFromMonth 10` (month 9 collects `$4,432.37` against `$4,500.00`; month 10 collects `$4,653.98`). Outcome `coversCostsBeforeCashOut`, month `10`. Lowest month `9`, `$17,379.70`; `cashShortfallCents null`. Month 3 planned `-$1,200.00`, balance `$20,757.50`; month 15 planned `-$3,200.00`, balance `$20,835.69`. |
| 7 | Cash `30000`, collected `5000`, paid out `10000`, revenue growth `10`, expense growth `0` | Today 6.0 months, exact, `cashOutMonth 6`. Forecast: no cash out. Covers costs from month `9`. Lowest month `8`, `$7,179.45`. `coversCostsBeforeCashOut`, month `9`. |
| 8 | Cash `100000`, collected `6000`, paid out `8000`, revenue growth `3`, expense growth `5` | Today `runwayTenths 500`, `cashOutMonth 50`. Forecast `runsOut`, cash out month `20`, `runwayTenths 196` (exact 19.659…). `coversCostsFromMonth null`, `cashShortfallCents null`. |
| 9 | Cash `0`, collected `500`, paid out `1000`, forecast off | `burning`, `runwayTenths 0`, exact, `cashOutMonth 0`. |
| 10 | Cash `0`, collected `900`, paid out `1000`, revenue growth `20`, expense growth `0` | Today `runwayTenths 0`, `cashOutMonth 0`. Forecast `runsOut`, cash out month `0`, `runwayTenths 0`. Covers costs from month `2`. Lowest month `1`, `-$100.00`; `cashShortfallCents 10000`. |
| 11 | Cash `500000`, collected `9900`, paid out `10000`, revenue growth `0`, expense growth `0` | Today `runwayTenths 50000`, `cashOutMonth 5000`. Forecast `matchesToday true`, `lastsBeyondHorizon`; month 60 balance `$494,000.00`. |
| 12 | Cash `100000`, collected `5000`, paid out `4000`, forecast: one change, out `150000` once in month `6` | Today `cashFlowPositive`. Forecast `runsOut`, cash out month `6`. Balance month 5 `$105,000.00`; month 6 change `-$149,000.00`, balance `-$44,000.00`; `runwayTenths 57` (exact 5.7046…). `coversCostsFromMonth 1`, so a planned payment caused it. Lowest month `6`, `-$44,000.00`; `cashShortfallCents 4400000`. |
| 13 | Revenue growth `-100`, cash `10000`, collected `1000`, paid out `500` | Valid. Month 1 collects `$1,000.00`; months 2 to 60 collect `$0.00`. |

Invalid, each with `status: "invalid"` and one error per named field:

- Cash `-1000`: `cashNow` `negative`.
- Cash blank: `cashNow` `missing`. Cash `abc`, `$500,000`, `500,000`, `1e5`, or `100.001`: `format`.
- Paid out `1000000000.01`: `range`.
- Revenue growth `-100.01` or `100.5%`: `revenueGrowthPercent` `range` or `format`.
- A planned change with amount `500` and blank month: its `startMonth` `missing`. Month `61` or `0`: `range`. Month `4.5`: `format`.
- A planned change with amount `0`: `zero`. Amount `-200`: `negative`.
- A planned change with name, amount, and month all blank: ignored, and the forecast stays off if nothing else is set. Valid.
- Frequency `weekly` or direction `both`: `option`.
- 11 rows: `plannedChanges` `limit`.
- Input `null`: `form`.

### Ownership

Sol builds the backend:

- `lib/startup-runway-calculator/engine.ts`. Reuse `lib/saas-economics/shared.ts` and don't change it.
- `tests/pages/startup-runway-calculator/startup-runway-calculator.test.mjs`, covering the examples above, including the full month 0 to 20 path for example 2.
- The development tool-page row, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/startup-runway-calculator/page.tsx`, `layout.tsx`, `startup-runway-calculator.tsx`, and `startup-runway-calculator.module.css`.
- `app/(site)/(tools)/startup-runway-calculator/art/startup-runway-calculator.{spec.json,svg,ts}`, plus its line in `lib/card-art.ts`. Other agents are adding lines there for sibling tools, so the coordinator should order those edits.

No URL-restore wrapper.

### Catalog placement

Primary and only catalog: `/saas-tools`. The reader's job is "will my SaaS business cash last until it covers its costs?" It sits beside the burn multiple calculator, which measures cash spent per new ARR, and the break-even MRR calculator, which finds the MRR a cost list needs. Neither says when cash runs out. The coordinator sets the final order for the batch.

No secondary catalog in the codebase fits a general founder-finance task. If one is planned later, this tool belongs there too.

Catalog `toolSpot` key: `startup-runway-calculator`. Suggested motif name: `runwayLiftoff`.

- Takeaway: get airborne, covering your costs, before the runway, your cash, ends.
- Focal subject: an airstrip drawn in perspective, from the lower left toward the right. It has two edge lines, a dashed center line, and a clear end: a short row of bars across the strip, then nothing.
- One supporting relationship: a small paper plane lifting off the strip, clearly before the end bars, with a short dashed climb path from the strip to the plane.
- Tone: calm and hopeful, not alarming. Accent on the plane and its climb path only. Neutral ink for the strip.
- Keep out: numbers, currency signs, coins, calendars, clocks, hourglasses, fuel gauges, flames, charts or axes, and any crash or cliff. The MRR goal card uses a rising line of dots, and burn multiple and the other SaaS cards use scales, stacks, and curves.
- Wordless, and legible at card size in both themes. The strip's end and the plane's gap above it must still read at the smallest card width.

Page header icon: `PlaneTakeoff` from `lucide-react`, which matches the card.

## Interface

### Flow

- Question: "How long will my business cash last, and will customer cash cover my costs before it runs out?"
- Minimum input: cash now, cash collected a month, cash paid out a month.
- Lead answer: runway in months. When the forecast is on, today's runway and the forecast runway show side by side as one comparison.
- Primary action: `Calculate`. The writing pass sets the final label.
- Control mode: `disclosure`. The three required fields and the two growth fields stay in the main flow. Planned changes sit in a `UiDisclosure`, because they're an optional refinement that does nothing when empty. Its summary shows the count, such as `2 planned`.

Workbench order:

1. **Today.** Cash now, with the currency select at the top right of the group, and above it on mobile. Then cash collected a month and cash paid out a month, on one row.
   - Helper under cash collected: `Payments received, not MRR. Count a yearly plan in the month it's paid.` This prevents the main mix-up in the research.
   - Helper under cash paid out: `Everything that leaves the account, including your own pay.`
   - The writing pass may tighten both.
2. **Forecast**, marked optional. Revenue growth and expense growth on one row, each with a `% a month` suffix. One line of plain text under the row: `Month 1 uses the numbers above. Growth starts in month 2.` This is the rule competitors hide, and it changes the answer.
3. **Planned changes**, a `UiDisclosure` holding a `UiRepeatableList`.
   - Each row: direction (`Money out` / `Money in`), amount with a currency-code suffix, start month with a `month` prefix label, frequency (`Once` / `Every month` / `Every 12 months`), and an optional name.
   - `Add a planned change` sits after the rows. It's disabled at 10, with the note `Up to 10 planned changes.`
   - A new row gets direction `out` and frequency `once`, and focus goes to its amount.
4. `Calculate` and a quiet `Reset`, in a `UiActionRow`.
5. One divider, then results.

### Components

Existing shared components. No new shared component is needed:

| Use | Component |
| --- | --- |
| Currency | `UiSelect` from `@/app/ui/controls` |
| Money, percents, months, names | `UiTextField` from `@/app/ui/controls`, with `inputMode="decimal"` or `"numeric"`, a suffix (currency code, `% a month`), autocomplete and spellcheck off |
| Planned change direction and frequency | `UiSelect` from `@/app/ui/controls`. Two selects keep a row compact. A choice group per row would wrap badly on mobile. |
| Planned changes | `UiDisclosure` and `UiRepeatableList` from `@/app/ui/controls`. The list already handles add, remove, and focus, as in the break-even MRR calculator. |
| Actions | `UiActionRow` from `@/app/ui/display`, `UiButton` from `@/app/ui/controls` |
| Lead, one or two | `UiPrimaryResult` from `@/app/ui/display` |
| Burn figures and forecast facts | `UiMetricGroup` from `@/app/ui/display` |
| Cash path chart | `UiLiveChart` from `@/app/ui/charts/chart-client`, kind `line` |
| Month-by-month table | `UiDataTable` from `@/app/ui/display`, inside a `UiDisclosure` |
| Assumptions | `UiKeyValueList` from `@/app/ui/display` |
| Change, reset, failure | `UiStatus` from `@/app/ui/display` |

Why no new component:

- The side-by-side lead is two `UiPrimaryResult` outputs in a route grid.
- Zero cash needs no reference line. The y axis shows `$0`, and the two series show where each path crosses it.
- The month axis is a numeric x with `xFormat: "number"`, the same as the MRR goal tool.
- `git status` shows no other agent has changed `app/ui/` or the gallery, but none of it needs changing.

Tool-specific component, in the route file:

- `StartupRunwayCalculator` owns raw input strings, planned-change rows with stable ids, error mapping by `StartupRunwayFieldKey`, focus, status, the calendar month label, and result rendering. It calls only `calculateStartupRunway`.

### Result regions

1. **Lead.**
   - Forecast off: one `UiPrimaryResult`, label `Runway at today's numbers`.
   - Forecast on, and `matchesToday` false: two `UiPrimaryResult` outputs side by side. `At today's numbers` comes first, then `With your forecast`. They're one comparison, so neither repeats elsewhere.
   - Forecast on, and `matchesToday` true: the single lead, plus one line: `Your forecast matches today's numbers.` No chart or second lead.
   - Tone stays `neutral` in every case. Running out isn't an input error, and there are no health colors.

   Value and detail by outcome. The writing pass sets the final words. The facts are fixed:

   | Outcome | Value | Detail |
   | --- | --- | --- |
   | Today `burning` | `12.5 months` | `Cash runs out in month 13, around November 2027.` |
   | Today `burning`, cash `0` | `0 months` | `There's no cash to cover this month's $500.00 gap.` |
   | Today `breakEven` | `Break-even` | `Cash in equals cash out, so the balance holds at $1,000.00.` |
   | Today `cashFlowPositive` | `Cash-flow positive` | `Cash grows by $10,000.00 a month.` |
   | Forecast `runsOut`, covers later | `11.8 months` | `Cash runs out in month 12. Customer cash covers costs from month 20.` |
   | Forecast `runsOut`, never covers | `19.6 months` | `Cash runs out in month 20. Costs aren't covered by month 60.` |
   | Forecast `runsOut`, planned payment | `5.7 months` | `A planned payment takes cash below zero in month 6.` |
   | Forecast `coversCostsBeforeCashOut` | `Covers costs in month 9` | `Cash stays above zero. Lowest point $7,179.45 in month 8.` When `firstCoversCostsMonth` is earlier: `Costs are covered again from month 10.` |
   | Forecast `coversCostsThroughout` | `Covers costs every month` | `No cash-out date in the next 60 months.` |
   | Forecast `lastsBeyondHorizon` | `More than 60 months` | `No cash-out date in the next 60 months, but costs still aren't covered.` |

   Number and date rules:
   - Runway shows one decimal from `runwayTenths`. When not exact, `about` can lead the detail. `0 months` shows without a decimal.
   - A runway of 12 months or more adds `about N years M months` from the whole months, such as `5,000.0 months (about 416 years)`.
   - The calendar month is shown only for runway up to 60 months, from the browser's local date when `Calculate` runs. Add the whole months to today, then the tenths times 3 days, and show `Month YYYY` only. It's always labeled `around`. It's never stored or put in the URL.
   - `cashOutMonth 0` reads as `now`, never `month 0`.

2. **Cash gap.** Shown only when `cashShortfallCents` isn't `null`. One `UiMetricGroup` item: `Extra cash needed to get there`, with the value `$128,409.11`, and the unit `lowest point in month 19`. It's the bootstrapper's real follow-up: how much to bridge. It isn't shown when the path never recovers.

3. **Monthly burn.** One `UiMetricGroup`:
   - `Cash paid out (gross burn)`: `$50,000.00`.
   - `Cash collected`: `$10,000.00`.
   - `Net burn`: `$40,000.00`. When negative, the label becomes `Net cash in` with a positive value. When zero, the value is `$0.00`.
   - These restate inputs on purpose. Gross and net burn are the terms searchers use, and this is the only place they appear.

4. **Chart.** Forecast on, and `matchesToday` false. `UiLiveChart`, `kind: "line"`, `format: "currency"`, `xFormat: "number"`, title `Cash balance by month`.
   - Series `With your forecast` from `path.balanceCents ÷ 100`.
   - Series `At today's numbers` from `path.atTodaysRateCents ÷ 100`.
   - Months 0 to an end month: `min(60, max(12, keyMonth + 3))`. `keyMonth` is the largest of the cash-out month, `coversCostsFromMonth`, and the lowest-balance month. `lastsBeyondHorizon` shows all 60.
   - No `range`. Hover reads both values at a month, and series toggles help.
   - Caption names the rates, such as `Revenue +10% a month, costs +0% a month, 2 planned changes.`

5. **Month by month.** Forecast on. A `UiDisclosure` named `Month by month`, holding a `UiDataTable` of all 61 months.
   - Columns: `Month`, `Collected`, `Paid out`, `Planned`, `Balance`. `Planned` shows `—` when it's 0. Number columns align right.
   - Rows are marked in text, not color alone: `Cash runs out` on the cash-out month, and `Covers costs` on `coversCostsFromMonth`. Use a short suffix in the month cell, such as `12 · Cash runs out`.
   - This gives exact numbers, because the chart has over 60 values and drops its hidden table.

6. **Assumptions.** A `UiKeyValueList`. Forecast off: currency and the month rule are left out, and only one line shows: `Runway = cash now ÷ (cash paid out − cash collected), with both held flat.` Forecast on:
   - `Revenue growth` `10% a month`, or `0% a month (left blank)`.
   - `Expense growth`, the same way.
   - `Planned changes`: each as `Hire · money out · $2,000.00 every month from month 4`.
   - `Month rule`: `Month 1 uses the numbers you entered. Growth applies from month 2.`
   - `Horizon`: `60 months`.

Facts aren't repeated:

- The runway figure appears only in the lead.
- The cash-out month appears in the lead detail and as a marked table row, which is the row the reader needs to find.
- The lowest balance appears in the lead detail or the cash gap, never both. When the cash gap shows, the lead detail doesn't mention the lowest point.
- Planned changes appear once, in assumptions. The table shows their monthly effect, which is a different fact.

### States

- **Initial.** Everything blank. USD. Planned changes collapsed, with no rows. No result.
- **Invalid.**
  - Clear the result and keep every value.
  - Field errors go under their fields.
  - A planned-change error opens the disclosure if it's collapsed.
  - Focus the first invalid field in reading order: cash now, collected, paid out, the growth rates, then each planned-change row from left to right.
  - A `limit` or `duplicateId` error shows by the add action.
- **Valid.** Show the results, focus the lead (the first output when there are two), and let the focused output announce it.
- **Partial.** Forecast off shows the lead, monthly burn, and the one-line assumption. No chart or table.
- **Runs out now.** Cash `0` while burning is a valid result, `0 months`, not an error.
- **Edited after result.** Clear the result, keep focus, and announce `Inputs changed. Calculate again.` once. That includes adding or removing a row.
- **Disclosure collapsed with rows.** The summary shows the count, so a hidden change that drives the answer is never invisible.
- **Unexpected failure.** Keep the inputs and show `UiStatus` danger by the actions: `Couldn't calculate. Try again.`
- **Reset.** Restore the initial state, remove every row, focus cash now, and announce `Form reset.`
- **Restored.** The clean URL never changes. A back-forward cache restore clears on the next edit.
- **Long values.** `$1,000,000,000.00` inputs, 100% growth balances with 30 or more digits, and `5,000.0 months` all show in full, never abbreviated. They wrap inside metrics without page overflow. Table cells may scroll inside the table frame.
- **Loading and retry.** Don't apply. The calculation is synchronous.

### Responsive and accessible behavior

Desktop:

- Use the measured workbench.
- Collected and paid out share a row. The two growth rates share a row.
- A planned-change row fits on one line: direction, amount, month, frequency, and name, with remove in a fixed last column.
- The two leads sit side by side in equal columns.
- Results stack in the order above. The chart is full width at about 280px tall.

Mobile:

- Every field stacks in task order.
- A planned-change row wraps at a set breakpoint into two lines: direction and amount, then month, frequency, and name. Remove stays in a fixed column at the top right.
- The two leads stack, today's first.
- Buttons go full width.
- The chart keeps full width, and series names wrap under it.
- `UiDataTable` turns into labeled rows. No page-level horizontal overflow, and grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order: currency, cash now, collected, paid out, revenue growth, expense growth, the planned-changes toggle, each row's fields and remove action, add, then the actions.
- Enter in a field submits.
- Remove buttons are named `Remove planned change 2`, or by name when one is set.
- One polite live region announces changes, resets, and failures. The result is announced through the focused lead.
- The month table gives exact chart values, because the chart has over 60 values.

Check at desktop and mobile in both themes:

- Example 1, forecast off.
- Example 2: side by side, with the cash gap.
- Example 6: planned changes, covered again.
- Example 12: a one-off payment drives cash out.
- Examples 4 and 5: positive and break-even.
- Example 9: zero cash.
- Example 11: matches today, and the long static runway.
- Pasted `$500,000` and `-1000`, as invalid inputs.
- 10 planned-change rows, with add disabled.

---

## Content

Written with `skills/stack127/tools/stack127-tool-writing/SKILL.md` and `stack127_docs/writing-style.md`.

### Search intent

1. **What the searcher wants:** a bootstrapped founder wants to know how many months their business cash lasts, the month it runs out, and whether customer cash catches up with costs first.
2. **Where top results fail:** they ask for MRR, so annual prepayments are counted wrong. They print "infinite runway" or "default alive" for break-even. They hide the month growth starts. They apply fundraising health bands to bootstrapped businesses. None model a hire or a yearly bill.
3. **What this page does better:** it asks for cash collected and explains why, keeps today's runway beside the forecast, states the month rule, handles planned changes, and gives the extra cash needed to reach break-even.

### Title and search text

- Title: `Startup runway calculator: how long will your cash last?`
- SEO title: `Startup runway calculator: how long your cash lasts`
- SEO description: `See how many months your business cash lasts and the month it runs out. Add revenue growth, a hire, or a yearly bill to see if you cover costs first.`
- Card name: `Startup runway calculator`
- Card description: `See how many months your cash lasts, and whether customer cash covers your costs before it runs out.`

### Question map

| Reader question | Answered in |
| --- | --- |
| How long will my cash last? | Tool lead, with the cash-out month |
| What do I enter, and where do I find it? | Usage: "What to enter" |
| Do I count my own pay? | Field hint, then article |
| MRR or cash collected? | Field hint, then article, with Stripe's $1,200 annual example |
| When does growth start, and why month 2? | Form helper, then usage |
| How do I add a hire, a yearly renewal, or a one-off bill? | Usage table |
| What does each result mean? | Usage table of outcomes, then the worked example |
| How is runway calculated? Gross vs net burn? | Article formula and sign convention |
| What is a good runway? | Article: no universal number; Paul Graham's test described and linked |
| Why does another calculator give a different number? | Article: MRR, growth start month, rounding, horizon |
| What doesn't it cover? | Article closing section with next tools |

### Outline

- **Intro:** what you get, the three figures to have ready, and the optional forecast.
- **Usage:**
  - `What to enter`: bullets for the three figures. Use a three-month average when months vary.
  - `Adding a forecast`: monthly compounding rates, the month 2 rule and why, a table of planned changes (hire, renewal, one-off bill, money in). Amounts don't grow. A cut already made goes in the base figure.
  - `How to read the result`: today vs forecast, rounding down, a table of the four forecast outcomes, the extra cash figure, and one worked example.
- **Article:**
  - `How is startup runway calculated?` Formula box, gross vs net burn, the sign convention, the monthly forecast rule.
  - `Should you use MRR or cash collected?` Stripe's $1,200 example.
  - `Should you count your own pay?` Yes, and how to add pay you'll start later.
  - `What is a good runway for a bootstrapped startup?` No universal number. Paul Graham's default alive test, described accurately and linked, and how to run it here.
  - `Why does another calculator show a different runway?` A short list.
  - `What this calculator doesn't cover` and next tools.

### Left out on purpose

- Input format rules and limits: field errors.
- The `C = 0` cases, the month-0 wording, and the covered-then-uncovered case: result lines.
- Exact rounding of grown amounts and the within-month spread: spec only. The article says runway rounds down and the cash-out month is a whole month.
- Calendar month estimation: the result labels it "around".
- Health bands, benchmarks, payment fee rates, and a "default alive" label: not used anywhere.

### Facts and sources

- Gross and net burn definitions: [Carta](https://carta.com/learn/resources/burn-rate-calculator/).
- Three months of bank data to estimate burn: [Pilot](https://pilot.com/blog/burn-rate-calculation-startup-runway-calculator).
- $1,200 annual plan recognized at $100 a month: [Stripe](https://stripe.com/resources/more/revenue-recognition-for-subscription-based-businesses-explained).
- Default alive: [Paul Graham](https://paulgraham.com/aord.html). Expenses constant, revenue growing at its recent rate, profitable before cash runs out.
- 10% a month compounds to about 214% a year: arithmetic, 1.1^12 ≈ 3.14.
- Worked example numbers come from the engine: cash 20,000, collected 3,000, paid out 6,000, revenue growth 6%, a 1,200 renewal yearly from month 3. Today 6.6 months, cash out month 7. Forecast 8.4 months, cash out month 9, covers costs from month 13, extra cash 2,590.17 with the lowest point in month 12.

Claims to avoid: "infinite", "default alive" as a label, any healthy runway number, built-in fees, predictions of real sales.

Links: `/break-even-mrr-calculator`, `/mrr-goal-calculator`, `/burn-multiple-calculator`, `/saas-metrics-calculator`.
