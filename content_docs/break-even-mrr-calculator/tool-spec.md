# Break-even MRR calculator

Route: `/break-even-mrr-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher wants a number to aim at: the monthly recurring revenue, and the number of paying accounts, that cover their monthly costs. Often they also want to know how far their current MRR is from it.

Where the current top results fail them:

- When variable cost equals or beats price, Calcometry and Callculator show `0 customers` and `$0 MRR`, and SoloFig calls an equal cost "higher". A negative fixed cost gives `-0` customers or silent zeros.
- Pages mix a continuous dollar threshold with a rounded account count without saying so. 610 accounts at $49 is $29,890, not the $29,878.05 threshold shown.
- Some pages treat gross margin as the variable-cost ratio, even when fixed delivery costs sit inside it. QuixCalc accepts a 101% margin.
- Few pages show fixed costs as separate lines, and none handle yearly bills. Founders can't see which costs they counted.
- Wording overreaches. Some results are called cash flow, net burn, or a health grade, when the math is a steady-state run rate.

What this tool does better:

1. Fixed costs are entered as named lines, each per month or per year. Yearly lines convert exactly.
2. Variable costs are entered one of two ways: an amount per account or a share of MRR. Each way uses its matching formula.
3. It shows the continuous MRR threshold, the whole accounts needed, and the MRR those accounts bring in, each with a distinct label.
4. It says there's no break-even point, with the reason and what would have to change, when each account adds nothing or loses money. It separates that from the zero-fixed-cost cases.
5. Optional current MRR shows the monthly surplus or shortfall now, the MRR still needed, and how many more accounts would close the gap.
6. No health grade, and no claim about cash or recognized revenue.

## Product

### Promise and scope

The primary user is a solo founder or small SaaS team who knows their recurring monthly costs and their average price per account. The tool tells them the MRR and paying accounts that cover those costs, and where they stand today.

Launch scope:

- One currency, used as a label only.
- Fixed cost lines, from 1 to 20. Each has an optional name, an amount, and a period of `per month` or `per year`.
- Monthly ARPA.
- Variable costs as either `per account`, a monthly amount per paying account, or `share of MRR`, a percent of recurring revenue.
- Optional current MRR.

Exclusions:

- Separate plans or price tiers. Enter a weighted average ARPA, or run the tool once per plan. The article explains this.
- Target profit. The tool answers one question, the MRR where profit is zero. A profit target is a different measure and is out of launch scope.
- A variable cost share above 100% of MRR. Share mode is capped at 100%, so it can't show an account that loses money. Per account mode can: enter a variable cost above ARPA.
- Using per-account and percent variable costs at once. The research asks for one method at a time. Mixed models are a candidate for later.
- Forecasts, growth rates, a break-even date, churn, CAC, tax, financing, one-time revenue, cash timing, and recognized revenue.
- Grades, benchmarks, URL sharing, export, and saved scenarios.

### Technical contract

**Fields and units.** All money is in the selected currency. Every value except a yearly fixed cost is monthly.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| Fixed cost lines | 1 to 20 rows. Each row has an `id` matching `^[A-Za-z0-9_-]{1,40}$`, unique in the list. | Zero rows is an error. The form starts with one blank row. |
| Line name | Optional text, at most 60 characters, with no control characters. | Blank displays as `Fixed cost 1`, `Fixed cost 2`, and so on, numbered by position. |
| Line amount | Money from `0` to `1,000,000,000.00`. | Required. `0` is valid. |
| Line period | `month` or `year`. Default `month`. | A yearly line counts as amount ÷ 12 per month, kept exact. |
| Monthly ARPA | Money above `0` and at most `1,000,000,000.00`. | Required with `per account`. Optional with `share of MRR`, where blank means the account count is unknown. |
| Variable cost method | `perAccount` or `shareOfMrr`. Default `perAccount`. | |
| Variable cost per account | Money from `0` to `1,000,000,000.00`. | Required and validated only with `perAccount`. May exceed ARPA. |
| Variable cost share | Percent from `0` to `100`, with up to two decimals. | Required and validated only with `shareOfMrr`. |
| Current MRR | Money from `0` to `1,000,000,000.00`. | Optional. Blank means not entered, and `0` is a real value. |

**Parsing.** Use the shared parsers. Trim outer whitespace. Money matches `^\d+(\.\d{1,2})?$`, and a percent matches `^\d+(\.\d{1,2})?$`. Reject signs, commas, currency symbols, `%`, exponents, interior spaces, a leading or trailing dot, and extra decimals. Blank is never zero, except for the two optional fields: ARPA in share mode, and current MRR. Validate only the active variable-cost field. The inactive one keeps its draft in the form and is ignored.

**Exact arithmetic.** Keep every value as integer cents, or hundredths of a percent, in `bigint`.

- Fixed monthly total, exact: `F12 = Σ(12 × monthly cents) + Σ(yearly cents)`, in twelfths of a cent. The fixed monthly total is `F12 ÷ 12`.
- Per account: contribution per account is `c = ARPA − v` in exact cents, and the contribution ratio is `c ÷ ARPA`.
- Share of MRR: the contribution ratio is `(10000 − p) ÷ 10000`, where `p` is the share in hundredths. With ARPA, contribution per account is `ARPA × (10000 − p) ÷ 10000`.

**Outcome.** Classify the contribution first, then the fixed costs. Contribution is "positive" when `c > 0`, or when `p < 10000` in share mode.

| Contribution | Fixed costs | Outcome |
| --- | --- | --- |
| Positive | Above 0 | `finite` |
| Positive | 0 | `zeroFixedCosts`. Break-even MRR is $0.00, and no accounts are needed. |
| Zero | Above 0 | `noFiniteThreshold`, `contribution: "zero"`, `fixedCosts: "positive"` |
| Negative | Above 0 | `noFiniteThreshold`, `contribution: "negative"`, `fixedCosts: "positive"` |
| Zero | 0 | `noFiniteThreshold`, `contribution: "zero"`, `fixedCosts: "zero"`. Every MRR level breaks even exactly. |
| Negative | 0 | `noFiniteThreshold`, `contribution: "negative"`, `fixedCosts: "zero"`. Only zero accounts break even. |

Share mode can't produce a negative contribution, because the share is capped at 100% by design. A loss-making account is modeled in per account mode.

**Formulas for `finite`.** Every threshold rounds up, because the answer is the least that covers the costs.

- Per account:
  - Break-even MRR in cents is `ceil(F12 × ARPA ÷ (12 × c))`.
  - Accounts needed is `ceil(F12 ÷ (12 × c))`.
- Share of MRR:
  - Break-even MRR is `ceil(F12 × 10000 ÷ (12 × (10000 − p)))`.
  - With ARPA, accounts needed is `ceil(F12 × 10000 ÷ (12 × ARPA × (10000 − p)))`.
- MRR at those accounts is `accounts × ARPA`, which is exact.
- Left over at those accounts is `accounts × contribution − F12 ÷ 12`. It's never negative. Round half away from zero to cents.
- Without ARPA in share mode, `accounts`, `mrrAtAccountsCents`, and `leftAfterFixedCents` are `null`, with `accountsUnknownReason: "arpaMissing"`. This is a partial result, not an error.

**Current position, when current MRR `M` is entered.**

- `monthlyResultCents` = `M × contribution ratio − F12 ÷ 12`, signed and rounded half away from zero. Compute it for every outcome. When the contribution isn't positive, it shows the monthly loss today.
- `mrrGapCents` = displayed break-even MRR `− M`. Positive means a shortfall and negative means already above. It's computed only for `finite` and `zeroFixedCosts`, and it's `null` otherwise.
- `additionalAccounts` = `max(0, ceil((F12 ÷ 12 − M × ratio) ÷ contribution per account))`. It's computed only when the threshold is finite and ARPA is known. It assumes new accounts arrive at the entered ARPA and variable cost.

**Displayed ratios and line amounts.**

- Contribution ratio: hundredths of a percent, signed, rounded half away from zero.
- Each line's monthly equivalent: half away from zero to cents. Flag `monthlyIsRounded` when the yearly amount doesn't divide evenly by 12.
- The fixed monthly total is rounded the same way, from the exact `F12`.

Never return `Infinity`, `NaN`, `-0`, or a zero threshold for a `noFiniteThreshold` case.

**Action and handling.** `Calculate break-even MRR` is the only primary action.

- A valid submit shows the results and focuses the lead.
- An invalid submit clears any old result, keeps every raw input, shows each error by its field, and focuses the first invalid field in reading order. For a list-level error, focus `Add cost`.
- Editing any input, changing the method or currency, or adding or removing a line clears the result and announces `Inputs changed. Calculate again.`
- Reset restores one blank monthly line, `perAccount`, USD, and blank fields. It focuses the first line's name.

**Privacy and security.** The calculation runs in the browser. Line names are plain text and never rendered as markup. No value goes to a server, the URL, storage, logs, or analytics. The clean URL stays unchanged. No API route, dataset, or job.

### Backend contract

Uses `lib/saas-economics/shared.ts` exactly as defined in [the CAC payback spec](../cac-payback-calculator/tool-spec.md#libsaas-economicssharedts). Same runtime rules: strip-types safe, explicit `.ts` imports, no DOM, network, time, or randomness.

#### `lib/break-even-mrr-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";

export const BREAK_EVEN_MRR_MAX_FIXED_COST_LINES = 20;
export const BREAK_EVEN_MRR_LINE_NAME_MAX_LENGTH = 60;
export const BREAK_EVEN_MRR_VARIABLE_METHODS = ["perAccount", "shareOfMrr"] as const;
export type BreakEvenMrrVariableMethod = (typeof BREAK_EVEN_MRR_VARIABLE_METHODS)[number];
export const BREAK_EVEN_MRR_COST_PERIODS = ["month", "year"] as const;
export type BreakEvenMrrCostPeriod = (typeof BREAK_EVEN_MRR_COST_PERIODS)[number];

export type BreakEvenMrrFixedCostInput = { id: string; name: string; amount: string; period: string };
export type BreakEvenMrrInput = {
  currency: string;
  fixedCosts: BreakEvenMrrFixedCostInput[];
  monthlyArpa: string;
  variableMethod: string;
  variableCostPerAccount: string;
  variableCostSharePercent: string;
  currentMrr: string;
};

export type BreakEvenMrrFieldKey =
  | "form" | "currency" | "fixedCosts" | "monthlyArpa" | "variableMethod"
  | "variableCostPerAccount" | "variableCostSharePercent" | "currentMrr"
  | `fixedCosts.${string}.name` | `fixedCosts.${string}.amount` | `fixedCosts.${string}.period`;

export type BreakEvenMrrFixedCostLine = {
  id: string;
  name: string;               // trimmed entry, or "Fixed cost N" when blank
  nameWasBlank: boolean;
  period: BreakEvenMrrCostPeriod;
  enteredCents: bigint;
  monthlyCents: bigint;       // half away from zero
  monthlyIsRounded: boolean;
};

export type BreakEvenMrrOutcome =
  | {
      kind: "finite";
      breakEvenMrrCents: bigint;           // ceil
      accounts: bigint | null;             // ceil; null only when ARPA is missing in share mode
      mrrAtAccountsCents: bigint | null;
      leftAfterFixedCents: bigint | null;  // >= 0
      accountsUnknownReason: "arpaMissing" | null;
    }
  | { kind: "zeroFixedCosts" }
  | { kind: "noFiniteThreshold"; contribution: "zero" | "negative"; fixedCosts: "positive" | "zero" };

export type BreakEvenMrrCurrent = {
  mrrCents: bigint;
  monthlyResultCents: bigint;        // signed
  mrrGapCents: bigint | null;        // positive = shortfall, negative = above
  additionalAccounts: bigint | null;
};

export type BreakEvenMrrValues = {
  currency: SaasEconomicsCurrency;
  variableMethod: BreakEvenMrrVariableMethod;
  fixedCosts: BreakEvenMrrFixedCostLine[];
  fixedMonthlyCents: bigint;         // displayed total, half away from zero
  fixedMonthlyIsRounded: boolean;
  monthlyArpaCents: bigint | null;   // null only when blank in share mode
  variableCostPerAccountCents: bigint | null; // perAccount only
  variableCostShareHundredths: bigint | null; // shareOfMrr only
  contributionPerAccountCents: bigint | null; // signed; null when ARPA is unknown
  contributionRatioHundredths: bigint;        // signed percent x 100
  outcome: BreakEvenMrrOutcome;
  current: BreakEvenMrrCurrent | null;        // null when current MRR is blank
};

export type BreakEvenMrrErrors = Partial<Record<BreakEvenMrrFieldKey, string>>;

export type BreakEvenMrrCalculation =
  | { status: "valid"; values: BreakEvenMrrValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: BreakEvenMrrErrors };

export function calculateBreakEvenMrr(input: unknown): BreakEvenMrrCalculation;
```

`calculateBreakEvenMrr` accepts `unknown`, collects every error in one pass, and never throws for user input.

- A non-object input, or a `fixedCosts` value that isn't an array, gives `errors.form`.
- An empty list, more than 20 lines, or a bad or duplicate `id` gives `errors.fixedCosts`.
- A row with a valid `id` reports errors under `fixedCosts.<id>.<field>`.

Error messages. The engine owns these strings, and the writing pass may reword them:

| Case | Message |
| --- | --- |
| No lines | `Add at least one fixed cost. Enter 0 if you have none.` |
| Too many lines | `Use up to 20 fixed costs. Combine small ones.` |
| Line amount missing | `Enter an amount, or remove this line.` |
| Money format | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | `Enter an amount up to 1,000,000,000.00.` |
| Line name | `Use up to 60 characters.` |
| ARPA missing (per account) | `Enter monthly ARPA.` |
| ARPA `0` | `Enter an ARPA above 0.` |
| Variable cost per account missing | `Enter variable cost per account. Use 0 if there is none.` |
| Variable share | `Enter a percent from 0 to 100, with up to two decimals.` |
| Bad method, period, or currency | `Choose one of the listed options.` |
| Form | `Something in the form is out of date. Reset and try again.` |

### Known examples

Calculated independently with exact fractions. USD, one monthly line, `perAccount`, and no current MRR unless stated.

| Inputs | Expected |
| --- | --- |
| Fixed `25000`, ARPA `49`, variable `8` | Contribution `$41.00`, ratio `83.67%`; break-even MRR `$29,878.05` (exact 29,878.048…); accounts `610`; MRR at 610 `$29,890.00`; left over `$10.00`. |
| Fixed `80000`, ARPA `120`, variable `25`, current MRR `60000` | Contribution `$95.00`, ratio `79.17%`; MRR `$101,052.64`; accounts `843` (exact 842.1); MRR at 843 `$101,160.00`; left over `$85.00`. Current result `-$32,500.00`; gap `$41,052.64`; more accounts `343`. |
| Fixed `1000`, ARPA `50`, variable `10`, current MRR `5000` | MRR `$1,250.00`; accounts `25`; left over `$0.00`. Current result `$3,000.00`; gap `-$3,750.00`, shown as above by `$3,750.00`; more accounts `0`. |
| Fixed `55`, ARPA `10`, variable `0` | Ratio `100.00%`; MRR `$55.00`; accounts `6`; MRR at 6 `$60.00`; left over `$5.00`. |
| One yearly line `100`, ARPA `10`, variable `2` | Line monthly `$8.33`, `monthlyIsRounded: true`; fixed total `$8.33`; MRR `$10.42` (exact 10.4166…); accounts `2`; MRR at 2 `$20.00`; left over `$7.67`. |
| Lines: `40` per month, `120` per year, `0` per month; ARPA `20`, variable `5` | Fixed total `$50.00`; contribution `$15.00`; MRR `$66.67` (exact 66.666…); accounts `4`; MRR at 4 `$80.00`; left over `$10.00`. The zero line is listed as `$0.00`. |
| Share mode: fixed `4500`, share `20`, ARPA blank | Ratio `80.00%`; MRR `$5,625.00`; `accounts: null`, `accountsUnknownReason: "arpaMissing"`; contribution per account `null`. |
| Share mode: fixed `4500`, share `20`, ARPA `29` | Contribution `$23.20`; MRR `$5,625.00`; accounts `194` (exact 193.97); MRR at 194 `$5,626.00`; left over `$0.80`. |
| Fixed `4500`, ARPA `29`, variable `29` | `noFiniteThreshold`, `zero`/`positive`; contribution `$0.00`; ratio `0.00%`. |
| Fixed `4500`, ARPA `29`, variable `30`, current MRR `2900` | `noFiniteThreshold`, `negative`/`positive`; contribution `-$1.00`; ratio `-3.45%`. Current result `-$4,600.00`; gap and more accounts `null`. |
| Share mode: fixed `4500`, share `100` | `noFiniteThreshold`, `zero`/`positive`. |
| Fixed `0`, ARPA `29`, variable `4` | `zeroFixedCosts`. |
| Fixed `0`, ARPA `29`, variable `29` | `noFiniteThreshold`, `zero`/`zero`. |
| Fixed `0`, ARPA `29`, variable `35` | `noFiniteThreshold`, `negative`/`zero`. |
| Invalid: empty list; 21 lines; duplicate ids; amount blank, `-1`, `1e3`, `$55`, `1,000`, `55.001`; ARPA blank or `0` with per account; share `100.01`; current MRR `abc`; period `week`; a 61-character name | A field-specific error for each, under the keys above; `status: "invalid"`. A blank ARPA in share mode and a blank current MRR are valid. |

Check of the `-$4,600.00` row: `2900 × (−1 ÷ 29) − 4500 = −100 − 4500`.

### Ownership

Sol builds the backend:

- `lib/saas-economics/shared.ts`, defined in the CAC payback spec. Build it once.
- `lib/break-even-mrr-calculator/engine.ts`.
- `tests/pages/break-even-mrr-calculator/break-even-mrr-calculator.test.mjs` covering the examples above.
- The development tool-page row, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/(saas)/break-even-mrr-calculator/page.tsx`, `layout.tsx`, `break-even-mrr-calculator.tsx`, and `break-even-mrr-calculator.module.css`.
- `app/(site)/(tools)/(saas)/break-even-mrr-calculator/art/break-even-mrr-calculator.ts`, plus its registration line in `lib/tool-catalog-art.ts`.

No URL-restore wrapper.

### Catalog placement

Primary and only catalog: `/saas-tools`. It answers the cost-coverage question that the SaaS metrics, MRR, and gross margin tools don't. Append it after the current last membership. The coordinator sets the final order for the batch. No secondary catalog fits.

Catalog `toolSpot` key: `break-even-mrr-calculator`.

- Takeaway: enough small paying accounts balance one fixed block of monthly costs.
- Focal subject: a level balance beam on a triangle fulcrum.
- One supporting relationship: one large hatched block on the left pan, and a neat stack of small equal solid tiles on the right pan, with the beam exactly level.
- Tone: calm and neutral. No numbers, currency signs, line charts, crossing lines, coins, or tilted beams.
- It must read differently from the CAC payback staircase and the gross margin columns. Keep it wordless and legible at card size in both themes.

## Interface

### Flow

- Question: "How much MRR, and how many paying accounts, do I need to cover my monthly costs, and how far am I from that?"
- Lead answer: break-even MRR, or a clear statement that there's no break-even point.
- Primary action: `Calculate break-even MRR`.
- Control mode: `single`. Fixed costs, ARPA, the variable cost method, and its value all drive the answer and stay visible. Current MRR is one optional field in the main flow. A disclosure would hide a single field for no gain.

Workbench order:

1. Currency, a narrow select at the top right of the first group, or above it on mobile.
2. `Fixed monthly costs`: the repeatable lines. Each line has a name, an amount with the currency suffix, and a period select (`per month` or `per year`), followed by `Add cost`.
3. `Revenue and variable costs`: monthly ARPA, then the variable cost method (`Per account` or `Share of MRR`), then the one active field.
4. `Current MRR`, marked optional.
5. `Calculate break-even MRR` and a quiet `Reset`.
6. One divider, then the results.

The workbench has three short helper lines, because each one prevents a likely error:

- Under the fixed cost heading: `Costs that stay the same as you add accounts. Include your own pay if this should cover it.`
- Under the variable cost field: `Per account`: `Costs that grow with each paying account, like usage hosting or per-seat tools.` `Share of MRR`: `Costs that grow with revenue, like payment fees.`
- On ARPA in share mode: `Optional. Needed for the account count.`

How to split a bill with a minimum plus usage goes in the article.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Currency, line period | `UiSelect` from `@/app/ui/controls` |
| Fixed cost lines | `UiRepeatableList` from `@/app/ui/controls`. `addLabel="Add cost"`. Set `addDisabled` at 20 lines, with `addDescription` `Up to 20 costs.` Remove labels read `Remove <name or Fixed cost N>`. |
| Names and amounts | `UiTextField` from `@/app/ui/controls`. Amounts use `inputMode="decimal"` and a currency-code `suffix`. Turn off autocomplete, and turn off spellcheck on amounts. |
| Variable cost method | `UiChoiceGroup` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, and `UiButton` from `@/app/ui/controls` |
| Lead | `UiPrimaryResult` from `@/app/ui/display` |
| Whole-account view and current position | `UiMetricGroup` from `@/app/ui/display` |
| Progress toward threshold | `UiProgressBar` from `@/app/ui/display` |
| Fixed cost breakdown | `UiDataTable` from `@/app/ui/display` |
| Per-account values | `UiKeyValueList` from `@/app/ui/display` |
| Change, reset, and failure messages | `UiStatus` from `@/app/ui/display` |

No new shared component. `UiRepeatableList` already focuses the new row's first input after an add, and moves focus to a nearby row or `Add cost` after a remove. Removing the last line is allowed. The submit then gives the list-level error.

Tool-specific component, in the route file:

- `BreakEvenMrrCalculator`: owns the raw rows, with stable ids from a counter and never the array index. It also owns the error mapping by `BreakEvenMrrFieldKey`, focus, status, and result rendering. It calls only `calculateBreakEvenMrr`.

### Result regions

1. **Lead.** `UiPrimaryResult` with the label `Break-even MRR`.

   | Outcome | Value | Detail |
   | --- | --- | --- |
   | Finite | `$29,878.05` | `The recurring revenue that covers your fixed costs each month.` |
   | Zero fixed costs | `$0.00` | `You have no fixed costs, so any paying account adds profit.` |
   | Zero contribution, fixed costs above 0 | `No break-even point` | `Each account leaves $0.00 after variable costs, so more accounts never cover fixed costs.` |
   | Negative contribution, fixed costs above 0 | `No break-even point` | `Each account loses $1.00 after variable costs. More accounts make the gap bigger.` |
   | Zero contribution, zero fixed costs | `Breaks even at any MRR` | `Fixed costs and contribution are both $0.` |
   | Negative contribution, zero fixed costs | `Only at $0 MRR` | `Each account loses $6.00 after variable costs.` |

   Every no-threshold case adds what would have to change. Per account: `ARPA must be above $29.00, the variable cost per account.` Share of MRR: `Variable costs must be under 100% of MRR.`

   Tone stays `neutral` in every case.
2. **Whole accounts.** A `UiMetricGroup`, shown only for a finite threshold with ARPA known:
   - `Paying accounts needed`: `610`.
   - `MRR at 610 accounts`: `$29,890.00`.
   - `Left after fixed costs at 610 accounts`: `$10.00`.

   In share mode without ARPA, show one line in its place: `Add monthly ARPA to see how many accounts this takes.` That's information, not an error.
3. **Where you are now.** Shown only when current MRR is entered.
   - For a finite threshold below current MRR, a `UiProgressBar` labeled `Current MRR toward break-even`, with `valueText` `$60,000.00 of $101,052.64`.
   - Then a `UiMetricGroup` with:
     - `Monthly result now`: a signed amount, such as `-$32,500.00`.
     - `MRR still needed`: `$41,052.64`. When current MRR is above, show `Above break-even by` and `$3,750.00` instead.
     - `More accounts at $120.00 ARPA`: `343`.
   - When current MRR is at or above the threshold, skip the bar. A full bar repeats the "above by" value. When there's no finite threshold, show only `Monthly result now`.
4. **What the answer uses.**
   - A `UiDataTable` captioned `Fixed costs`. Columns: `Cost`, `Entered`, `Per month`. One row per line, and yearly lines show `$100.00 a year` under `Entered`. A final `Total` row shows the monthly total.
   - Then a `UiKeyValueList`: `Monthly ARPA` (or `Not entered`), `Variable cost per account` or `Variable costs`, `Contribution per account`, and `Contribution ratio`.
   - Then one formula line. Per account: `Break-even MRR = fixed costs ÷ contribution ratio. Accounts = fixed costs ÷ contribution per account, rounded up.` Share of MRR: `Break-even MRR = fixed costs ÷ (1 − variable share).`

Facts aren't repeated:

- The lead holds the continuous threshold.
- The metric group holds the account view.
- The table holds the cost lines and their monthly total.
- `Contribution per account` appears once, in the key-value list. The no-threshold detail uses it to explain the reason, and that's its only other use.

### States

- **Initial.** One blank monthly line, `perAccount`, USD, blank ARPA, blank variable cost, blank current MRR. No result.
- **Invalid or incomplete.** Clear the old result and keep every value. Errors go under each field. A line error goes under its line's field. A list error goes under `Add cost` through the list's `addDescription` with `addDescriptionIsError`. Focus the first invalid field in reading order: lines top to bottom, then ARPA, method, the variable field, then current MRR.
- **Valid.** Show the results, focus the lead, and let the focused output announce it.
- **Partial.** In share mode without ARPA, show the lead, the add-ARPA line, current position without more accounts, and the breakdown. Valid and complete for what was entered.
- **No threshold.** A valid result with the same layout. The whole-accounts region is hidden.
- **Edited, added, or removed after a result.** Clear the result, keep focus where the reader is, and announce `Inputs changed. Calculate again.` once.
- **Method switch.** Swap the active field and keep both drafts. The ARPA required mark and helper text update.
- **Unexpected failure.** Keep the inputs, clear the result, show one `UiStatus` error by the actions (`Couldn't calculate. Try again.`), and leave Calculate enabled.
- **Reset.** Restore the initial state, focus the first line's name, and announce `Form reset.`
- **Restored.** The clean URL never changes. A back-forward cache restore with a result clears on the next edit.
- **Long values.** 60-character line names wrap in the table and stay readable in the row inputs. Show `1,000,000,000.00` amounts in full, never abbreviated. Line rows with 20 entries stay aligned with the remove action in a fixed last column.
- **Loading and retry.** These don't apply. The calculation is synchronous and local.

### Responsive and accessible behavior

Desktop:

- Use the shared workbench band at a measured width.
- Each fixed cost line is one row: name (flexible), amount (fixed width), period select (compact), and remove (fixed last column).
- ARPA and the active variable field share a row under the method choice.
- In results, the lead and whole-account metrics stack. The progress bar and current position follow. The table and key-value list come last, at full width.

Mobile:

- Each line stacks name, then amount and period on one row, with remove fixed at the top right of the line. This is a set breakpoint, not a browser wrap.
- All other fields stack in task order, and buttons go full width.
- `UiDataTable` turns into labeled rows. No page-level horizontal overflow, and grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order runs through each line's name, amount, period, and remove, then `Add cost`, the method choices (arrow keys), the fields, and the actions.
- Enter in a field submits.
- Each line's inputs carry accessible names that include the line number, such as `Fixed cost 2 amount`, while the visible labels stay short.
- One polite live region announces changes, resets, line add and remove, and failures. The result is announced only through the focused output.

Check at desktop and mobile in both themes:

- The 25000/49/8 example.
- A yearly line.
- Share mode without ARPA.
- Equal ARPA and variable cost.
- Fixed costs of 0.
- Current MRR above and below the threshold.
- 20 lines.
- A pasted `$55` error.

---

## Content

Plan for the writing session. The live article stays in the tool-page row. Draft files are in `tmp/page-publishing/saas-economics-final-b/break-even-mrr-calculator/`. This section does not repeat that article.

The dev server on port 11834 was not answering HTTP, and preview automation was unavailable. The examples below are the engine's known examples and the result sentences in the route file.

### Search intent and metadata direction

The reader wants the monthly recurring revenue, and the number of paying accounts, that cover monthly costs. They often also want the gap from current MRR.

Start the visible title with `Break-even MRR calculator` and ask what monthly revenue covers the costs. The search title keeps that phrase and names revenue that covers costs. The description mentions fixed costs, variable costs, and the current gap. No cash-flow claim, no profit target, and no health grade.

Card name: `Break-even MRR`. Card description: the recurring revenue and accounts that cover the costs they list. Art key: `break-even-mrr-calculator`.

### Page promise and reader questions

After the page, the reader can tell the continuous MRR threshold from the MRR of whole accounts, split fixed and variable costs without double counting, and read a zero-fixed or non-positive contribution result.

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| What MRR covers my costs? | Lead is the continuous threshold, rounded up to the cent. | Formula from the SBA. The $25,000, $49, $8 example: contribution $41.00, ratio 83.67%, threshold $29,878.05. |
| How many accounts is that? | `Paying accounts needed`, `MRR at N accounts`, and `Left after fixed costs`. | 610 accounts bring $29,890.00 and leave $10.00. Say why that is not $29,878.05. |
| Where do yearly bills go? | Each line is per month or per year. The monthly column is the exact amount ÷ 12, shown to the cent. | $100 a year shows $8.33. The threshold keeps the exact twelfth. |
| Per account or a share of MRR? | One method at a time. Share mode without ARPA hides the account count. | $4,500 at 20% of MRR is $5,625.00. Blank ARPA means the account count is unknown. Share mode cannot show a loss. |
| Where am I now? | `Monthly result now`, `MRR still needed` or `Above break-even by`, and more accounts. | Use the tested $1,000 / $50 / $10 case. Current $5,000 is above by $3,750.00. A current $500 is $750.00 short and needs 15 more accounts. |
| What if each account adds nothing? | `No break-even point`, `$0.00`, `Breaks even at any MRR`, or `Only at $0 MRR`. | Table of those states. More accounts do not close a zero or negative contribution. |
| Should founder pay, or a profit goal, be a line? | Helper says to include your own pay if the result should cover it. There is no profit-target field. | Pay is a scope choice. Do not tell the reader to type a profit goal as a fixed cost. |
| Is this cash or a date? | Labels say recurring revenue. | Run rate, not cash, recognized revenue, or a forecast month. Link ChartMogul and Stripe. |

### Recommended page structure and formats

**Introduction.** Three sentences. The revenue and the account count, what to have ready, and optional current MRR. No formula walkthrough.

**Usage.** How to split a bill, when a yearly line means the year's amount, founder pay as a choice, per account versus share of MRR, and what current MRR is. Then how to read the lead, the whole-account MRR, and the monthly result. Do not narrate Calculate or Reset. Do not retell the $25,000 arithmetic. That example lives in content.

**Supporting content, in this order:**

1. `How is break-even MRR calculated?` Formula box and one `[!EXAMPLE]` for $25,000, $49, and $8, with both revenue figures and the $10 left over.
2. `Which costs are fixed, and which grow?` Table. Yearly ÷ 12. Do not list one cost twice. Gross margin can already contain fixed delivery costs. Stripe link.
3. `Should your own pay be included?` Two scope questions. Warning: a profit goal is not a cost line. The tool answers zero profit only.
4. `What if variable costs are a share of MRR?` The 20% example, blank ARPA, and the 100% cap.
5. `What does current MRR change?` The $1,000 case, above and short. Name the result labels.
6. `When is there no break-even point?` Table of the six contribution and fixed-cost states.
7. `Is break-even MRR cash, or a date?` ChartMogul and Stripe links. Several prices need a weighted average or one run per plan. Next links: CAC payback, acquisition cost, lifetime value, LTV:CAC, and SaaS metrics.

No article chart and no article marker art. The card art is already registered. Do not add a target-profit scenario.

### Claims to keep, and claims to avoid

Keep both revenue figures when they differ. Keep `No break-even point` for a contribution that is not positive while fixed costs are above zero. A displayed ratio can be rounded. The threshold uses the exact contribution.

Avoid calling the result cash flow, net burn, recognized revenue, net profit, or the month profitability arrives. Avoid telling the reader to add a profit target as a fixed cost. Avoid a health grade. Do not copy the development placeholder.

### Source roles and links

- [SBA break-even guidance](https://legacy.sba.gov/business-guide/plan-your-business/calculate-your-startup-costs/break-even-point) for fixed costs divided by contribution, and for splitting a semi-variable cost. Checked 2026-10-04 in research.
- [Stripe's gross margin guide](https://stripe.com/resources/more/saas-gross-margin-explained-what-it-is-and-why-it-is-important) for serving costs that can include both fixed and variable delivery.
- [ChartMogul's MRR definition](https://chartmogul.com/saas-metrics/mrr/) for a normalized monthly amount, not cash received.
- [Stripe on subscription revenue recognition](https://stripe.com/gb/resources/more/revenue-recognition-for-subscription-based-businesses-explained) for recognition over the service.
- The $29,878.05, 610-account, and current-position rows come from this spec's known examples. The $500 current-MRR row uses that same tested $1,250 threshold and exact cents. It is not a published industry series.
