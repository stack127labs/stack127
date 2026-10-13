# MRR goal calculator

Route: `/mrr-goal-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher has a target, usually "$10k MRR", and wants it made concrete: how many paying customers that is at their price, and how long it takes at the pace they can manage. Some also want the traffic that pace needs.

Where the current top results fail them:

- Each tool answers one slice. Paydude gives a no-churn count, HitMRR gives a growth-rate timeline only, VisitTrack covers traffic but not a date, and BuildGrid has no traffic. The founder moves numbers between three tabs.
- Churn is either left out, or mixed into the one-time customer count. Forum posts add "50 more a month for churn" to the total, which mixes customers at goal with monthly acquisition.
- A goal at or above the `new customers ÷ churn` ceiling gets a huge date or a vague "not reachable" with no reason.
- Bad input passes quietly. BuildGrid clamps ARPA 0 to 1 and churn 101% to 100%. HitMRR accepts negative MRR. ShowMRR shows negative customer counts.
- Growth from $0 MRR shows "Never at this rate", as if the rate were the problem.
- MRR and ARR targets blur. $10k ARR at $29 is 29 customers, not 345.

What this tool does better:

1. It always answers the count first: customers needed = goal ÷ monthly ARPA, rounded up, with the goal period (MRR or ARR) stated in the answer.
2. One timeline section, two methods. New customers a month plus monthly churn, or net MRR growth rate. Each uses its own formula, and churn is never subtracted from a net rate.
3. Each method can solve either way: when you reach the goal at a pace, or the pace you need for a deadline.
4. It keeps three numbers apart: customers at goal, new customers a month, and customers lost each month at goal.
5. It names the ceiling. When the goal is at or above `new ÷ churn`, it says the goal is out of reach at this pace, shows where the count levels off, and says what pace would work.
6. An optional traffic step turns the monthly pace into signups and visitors a month, one stage at a time.
7. It rejects bad input beside the field, never clamps, and never shows a negative count. Growth from $0 gets a specific message that points to the customer method.
8. No benchmarks and no "typical time to $10k". Every date depends only on the numbers entered.

## Product

### Promise and scope

The primary user is an indie hacker or solo SaaS founder with a revenue target. They know their price or average revenue per account, and maybe their current customers, new customers a month, churn, or recent MRR growth.

The tool gives them the paying customers the goal needs. Optionally it adds a month the goal is reached, or the pace a deadline needs, and the traffic that pace takes.

Launch scope:

- One currency, used as a label only.
- A goal amount with a period: per month (MRR) or per year (ARR).
- Monthly ARPA. This is the plan price for one flat plan, or the average for tiered plans.
- An optional timeline, by `customers` (current paying customers, new customers a month, monthly customer churn) or by `growth` (current MRR, net monthly MRR growth). Each solves for `date` or `pace`.
- Optional traffic: visitor-to-signup and signup-to-paid rates. Customer method only.

Exclusions:

- Price tiers, plan-mix changes, expansion, and downgrades in the customer method. It uses one ARPA throughout.
- Revenue churn in the customer method. It takes logo churn only.
- Using a churn rate and a growth rate together.
- Ramps, seasonality, or pace that changes month to month.
- Calendar dates. Results are month numbers from today, so the engine has no clock.
- Costs, profit, founder income, cash collected, recognized revenue, taxes, fees. The break-even MRR tool handles costs.
- Benchmarks, "good growth rate" grades, community averages.
- URL sharing, export, saved scenarios.

### Technical contract

**Fields and units.** All money is in the selected currency. ARPA, pace, churn, and growth are monthly.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| Goal amount | Money above `0`, at most `1,000,000,000.00`. | Required. |
| Goal period | `month` (MRR) or `year` (ARR). Default `month`. | A yearly goal counts as amount ÷ 12 per month, kept exact. |
| Monthly ARPA | Money above `0`, at most `1,000,000,000.00`. | Required. |
| Timeline method | `customers` or `growth`. Default `customers`. | |
| Solve for | `date` or `pace`. Default `date`. | Applies to the active method. |
| Current paying customers | Whole number `0` to `1,000,000,000`. | Customer method. `0` is valid. |
| New paying customers a month | Whole number `0` to `1,000,000,000`. | Customer method, `date` only. Gross additions, before churn. |
| Monthly customer churn | Percent `0` to `100`, up to two decimals. | Customer method, both solve modes. Logo churn. |
| Current MRR | Money `0` to `1,000,000,000.00`, but `0` is an error in this method. | Growth method. |
| Net monthly MRR growth | Percent `-100` to `1000`, up to two decimals. A leading `-` is allowed. | Growth method, `date` only. |
| Deadline | Whole number of months, `1` to `600`. | Either method, `pace` only. One shared field. |
| Visitor-to-signup rate | Percent `0` to `100`, up to two decimals. | Traffic, customer method only. |
| Signup-to-paid rate | Percent `0` to `100`, up to two decimals. | Traffic, customer method only. |

**Parsing.** Use `lib/saas-economics/shared.ts`: `parseMoneyCents`, `parsePercentHundredths`, `parseWholeNumber`, `divideCeil`, `divideHalfAwayFromZero`, and `isSaasEconomicsCurrency`. Trim outer whitespace. Reject signs (except growth), commas, currency symbols, `%`, exponents, interior spaces, and a third decimal. Whole numbers take digits only. Blank is never zero.

**Active fields.** Only the active method's fields are read, and only those its solve mode needs:

| Method / solve | Fields read |
| --- | --- |
| `customers` / `date` | current customers, new customers a month, churn |
| `customers` / `pace` | current customers, churn, deadline |
| `growth` / `date` | current MRR, growth |
| `growth` / `pace` | current MRR, deadline |

Inactive fields keep their drafts in the form, and the engine ignores them.

**Optional groups.** The timeline and traffic are all-or-nothing groups.

- If every field the active timeline reads is blank, the timeline is skipped. That's a valid partial result, not an error.
- If any of them has a value, every one is required, and a blank gets its own field error.
- Traffic works the same way with its two rates. It is read only when the method is `customers`.
- If traffic has a value while the timeline is skipped, the error is `traffic`.

**Notation.** `d = 10000`.

| Symbol | Meaning |
| --- | --- |
| `G` | Goal in cents |
| `A` | ARPA in cents |
| `N0` | Current customers |
| `a` | New customers a month |
| `h` | Churn in hundredths of a percent, so `c = h / d` |
| `M0` | Current MRR in cents |
| `g` | Growth in hundredths of a percent |
| `T` | Deadline in months |
| `v` | Visitor-to-signup rate in hundredths |
| `s` | Signup-to-paid rate in hundredths |

Keep everything exact in `bigint`. No floating point, logarithms, or `Math.pow` anywhere in the engine.

**Goal.**

- Monthly goal, exact, in twelfths of a cent: `G12 = 12 × G` for `month`, and `G` for `year`.
- `monthlyGoalCents = divideHalfAwayFromZero(G12, 12)`. `monthlyGoalIsRounded` is true when `G12 % 12 ≠ 0`.
- `annualGoalCents = G12` for both periods. Twelve times the monthly goal is always whole cents.
- `customersNeeded R = divideCeil(G12, 12 × A)`. Always at least 1.
- `mrrAtCustomersNeededCents = R × A`. This can be a little above the goal.

**Month convention.**

- Month `0` is today, the values entered.
- Month `t` is the state at the end of the `t`-th month from now.
- In the customer method, churn applies to the customers at the start of each month. New customers join at month end and don't churn in the month they join:

  `N(t+1) = N(t) × (1 − c) + a`

  Closed form, for `h > 0`:

  `N(t) = [a × d × (d^t − q^t) + N0 × h × q^t] ÷ (h × d^t)`, where `q = d − h`.

  For `h = 0`: `N(t) = N0 + a × t`.

  `N(t)` is fractional, an expected value. Compute `d^t` and `q^t` incrementally, not with repeated exponentiation.
- In the growth method:

  `MRR(t) = M0 × ((d + g) ÷ d)^t`

- "Reached in month `t`" means the first `t` from `0` to `600` where `N(t) ≥ R`, or `12 × MRR(t) ≥ G12`.
- The horizon cap is `MRR_GOAL_MAX_MONTHS = 600`, which is 50 years. The engine never looks past month 600.

Comparisons stay exact:

- Customers: `a·d·(d^t − q^t) + N0·h·q^t ≥ R·h·d^t`.
- Growth: `12·M0·(d+g)^t ≥ G12·d^t`.

**Customer method, `date`.**

- `remainingCustomers = max(0, R − N0)`.
- When `h > 0`, the ceiling is `a × d ÷ h` accounts, exact. Return `ceilingFloor = floor(a·d / h)` and `ceilingIsWhole`.
- When `h > 0`, the monthly loss at goal is `lostPerMonthAtGoal = divideCeil(R × h, d)`. It's `0` when `h = 0`. This is the pace that just holds the goal.

Outcome, checked in this order:

1. `N0 ≥ R`: `alreadyThere`, month `0`.
   - If `h > 0` and `N0 × h > a × d`, the count is shrinking. Return `fallsBelowInMonth`, the first `t ≤ 600` with `N(t) < R`, or `null` if none.
   - If `N0 × h ≤ a × d`, or `h = 0`, it holds or grows, and `fallsBelowInMonth` is `null`.
2. `h = 0` and `a = 0`: `unreachable`, reason `noNewCustomers`.
3. `h > 0` and `R × h ≥ a × d`: `unreachable`, reason `ceiling`. The count levels off at `a ÷ c`, which is at or below the goal.
   - Coordinator decision after the backend check: at `c = 100%` (`h = d`), `N(t) = a` for every t ≥ 1, so a goal with `R ≤ a` is `reached` in month 1 and is not unreachable. The `R × h = a × d` case is unreachable only when `c < 100%`.
   - `paceToReach = floor(R × h / d) + 1` is the smallest whole pace whose ceiling is above `R`. It only says the goal becomes reachable at that pace, not when.
4. Otherwise, the first `t ≤ 600` with `N(t) ≥ R` gives `reached` with `month: t`. If there's none, the outcome is `beyondHorizon`.

**Customer method, `pace`.** Find the smallest whole `a` with `N(T) ≥ R`:

- `h = 0`: `requiredPace = max(0, divideCeil(R − N0, T))`.
- `h > 0`: `requiredPace = max(0, divideCeil((R·d^T − N0·q^T) × h, d × (d^T − q^T)))`. When `h = d` (100%), `q^T = 0`, so this reduces to `R`.
- The same formula covers `N0 ≥ R`. With churn the base shrinks, so the pace that holds the goal to month `T` may be above `0`. The flag `alreadyThere` is set from `N0 ≥ R`.
- Also return `lostPerMonthAtGoal` as above.

**Growth method.**

- `M0 = 0` is a field error with code `zeroBase`. Growth from zero has no defined ratio.
- `remainingMrrCents = max(0, monthlyGoalCents − M0)`, shown from the rounded monthly goal.
- `date` mode:
  - `M0 × 12 ≥ G12` gives `alreadyThere`, month `0`.
  - Otherwise `g ≤ 0` gives `unreachable`, reason `noGrowth` when `g = 0` and `shrinking` when `g < 0`.
  - Otherwise the first `t ≤ 600` that reaches the goal gives `reached`. If there's none, the outcome is `beyondHorizon`.
- `pace` mode:
  - `requiredGrowthHundredths` is the smallest whole `g` from `0` to `100000` with `12·M0·(d+g)^T ≥ G12·d^T`. Find it by binary search with exact comparison.
  - If even `g = 100000` (1000%) falls short, the outcome is `aboveMaxRate`. It returns `growthHundredths = 100000n`, which the interface shows as "more than 1000% a month" (coordinator decision).
  - If `M0 × 12 ≥ G12`, the result is `0` with `alreadyThere`.

**Path, for the chart and the table.**

- `path` lists months `0..end`, where `end = max(keyMonth, 12)`.
- `keyMonth` is:
  - the reached month, for `reached`;
  - `T`, for `pace` modes;
  - `fallsBelowInMonth ?? 0`, for `alreadyThere`;
  - `120`, for `unreachable`;
  - `600`, for `beyondHorizon`.
- `pace` modes use the required pace or rate.
- `aboveMaxRate` returns an empty `path`, and the frontend shows no chart. Growth `unreachable` with `g = −100%` returns its path as computed, where MRR drops to 0.
- Customer points are `{ month, customers: floor(N(t)), mrrCents: floor(N(t)) × A }`. Floor never shows the goal as met before it is.
- Growth points are `{ month, mrrCents }`, rounded half away from zero.
- At most 601 points.

**Traffic.** Only when the timeline has a monthly pace `P`. That's `a` in `customers/date`, or `requiredPace` in `customers/pace`.

- If `P = 0`: signups and visitors are `0`.
- Else if `s = 0`: `noFiniteTraffic`, stage `signupToPaid`.
- Else if `v = 0`: `noFiniteTraffic`, stage `visitorToSignup`. Check `s` first, because it's the later stage.
- Else:
  - `signupsPerMonth = divideCeil(P × d, s)`.
  - `visitorsPerMonth = divideCeil(P × d × d, v × s)`. Work from `P`, not from the rounded signups, so rounding never compounds.
  - `visitorsToGoal = visitorsPerMonth × months`, where `months` is the reached month or `T`. It's `null` when there's no finite month (`unreachable`, `beyondHorizon`, or `alreadyThere` in `date` mode).

**Never return** `Infinity`, `NaN`, `-0`, a negative count, a negative pace, or a month above 600.

**Action and handling.** `Calculate` is the only primary action. The writing pass may name it, for example `Calculate goal`.

- A valid submit shows the results and focuses the lead.
- An invalid submit clears any old result, keeps every raw input, shows each error under its field, and focuses the first invalid field in reading order.
- Editing any input clears the result and announces `Inputs changed. Calculate again.` That includes changing method, solve mode, goal period, or currency.
- Reset restores defaults with every field blank, focuses the goal amount, and announces `Form reset.`

**Privacy and security.** Everything runs in the browser. No value goes to a server, the URL, storage, logs, or analytics. The clean URL never changes. No API route, dataset, or job.

### Backend contract

Reuses `lib/saas-economics/shared.ts` as it is today. Runtime rules match the sibling engines: strip-types safe, explicit `.ts` imports, no DOM, network, clock, or randomness.

#### `lib/mrr-goal-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";

export const MRR_GOAL_MAX_MONTHS = 600;
export const MRR_GOAL_MAX_COUNT = 1_000_000_000n;
export const MRR_GOAL_METHODS = ["customers", "growth"] as const;
export type MrrGoalMethod = (typeof MRR_GOAL_METHODS)[number];
export const MRR_GOAL_SOLVE_FOR = ["date", "pace"] as const;
export type MrrGoalSolveFor = (typeof MRR_GOAL_SOLVE_FOR)[number];
export const MRR_GOAL_PERIODS = ["month", "year"] as const;
export type MrrGoalPeriod = (typeof MRR_GOAL_PERIODS)[number];

// Every field is the raw string from the form. Inactive fields may hold drafts and are ignored.
export type MrrGoalInput = {
  currency: string;
  goalAmount: string;
  goalPeriod: string;
  monthlyArpa: string;
  method: string;
  solveFor: string;
  currentCustomers: string;
  newCustomersPerMonth: string;
  churnPercent: string;
  currentMrr: string;
  growthPercent: string;
  deadlineMonths: string;
  visitorToSignupPercent: string;
  signupToPaidPercent: string;
};

export type MrrGoalFieldKey = keyof MrrGoalInput | "traffic" | "form";

export type MrrGoalErrorCode =
  | "missing" | "format" | "range" | "zero" | "zeroBase" | "option" | "trafficNeedsTimeline" | "form";

export type MrrGoalErrors = Partial<Record<MrrGoalFieldKey, { code: MrrGoalErrorCode; message: string }>>;

export type MrrGoalGoal = {
  period: MrrGoalPeriod;
  enteredCents: bigint;
  monthlyGoalCents: bigint;          // half away from zero
  monthlyGoalIsRounded: boolean;
  annualGoalCents: bigint;
  customersNeeded: bigint;           // ceil, >= 1
  mrrAtCustomersNeededCents: bigint; // customersNeeded × ARPA
};

export type MrrGoalCustomerPoint = { month: number; customers: bigint; mrrCents: bigint };
export type MrrGoalGrowthPoint = { month: number; mrrCents: bigint };

export type MrrGoalCustomerTimeline = {
  method: "customers";
  solveFor: MrrGoalSolveFor;
  currentCustomers: bigint;
  churnHundredths: bigint;
  remainingCustomers: bigint;        // max(0, R − N0)
  lostPerMonthAtGoal: bigint;        // 0 when churn is 0
  ceiling: { floor: bigint; isWhole: boolean } | null;  // null when churn is 0
  pace: bigint;                      // entered pace (date) or required pace (pace)
  outcome:
    | { kind: "reached"; month: number }
    | { kind: "alreadyThere"; fallsBelowInMonth: number | null }
    | { kind: "unreachable"; reason: "noNewCustomers" }
    | { kind: "unreachable"; reason: "ceiling"; paceToReach: bigint }
    | { kind: "beyondHorizon" }
    | { kind: "paceForDeadline"; deadlineMonths: number; alreadyThere: boolean };
  path: MrrGoalCustomerPoint[];
};

export type MrrGoalGrowthTimeline = {
  method: "growth";
  solveFor: MrrGoalSolveFor;
  currentMrrCents: bigint;
  remainingMrrCents: bigint;
  growthHundredths: bigint;          // entered (date) or required (pace); signed
  outcome:
    | { kind: "reached"; month: number }
    | { kind: "alreadyThere" }
    | { kind: "unreachable"; reason: "noGrowth" | "shrinking" }
    | { kind: "beyondHorizon" }
    | { kind: "rateForDeadline"; deadlineMonths: number; alreadyThere: boolean }
    | { kind: "aboveMaxRate"; deadlineMonths: number };
  path: MrrGoalGrowthPoint[];
};

export type MrrGoalTraffic =
  | {
      kind: "finite";
      visitorToSignupHundredths: bigint;
      signupToPaidHundredths: bigint;
      pace: bigint;
      signupsPerMonth: bigint;
      visitorsPerMonth: bigint;
      visitorsToGoal: bigint | null;
      months: number | null;
    }
  | { kind: "noFiniteTraffic"; stage: "visitorToSignup" | "signupToPaid" };

export type MrrGoalValues = {
  currency: SaasEconomicsCurrency;
  monthlyArpaCents: bigint;
  goal: MrrGoalGoal;
  timeline: MrrGoalCustomerTimeline | MrrGoalGrowthTimeline | null; // null = skipped
  traffic: MrrGoalTraffic | null;    // null = off, or growth method
};

export type MrrGoalCalculation =
  | { status: "valid"; values: MrrGoalValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: MrrGoalErrors };

export function calculateMrrGoal(input: unknown): MrrGoalCalculation;
```

`calculateMrrGoal` accepts `unknown`, collects every error in one pass, and never throws for user input. A non-object gives `errors.form`. A missing string property counts as blank.

Error codes and messages. The engine owns these strings, and the writing pass may reword them:

| Field | Case | Code | Message |
| --- | --- | --- | --- |
| goalAmount | blank | `missing` | `Enter your revenue goal.` |
| goalAmount | `0` | `zero` | `Enter a goal above 0.` |
| monthlyArpa | blank | `missing` | `Enter monthly ARPA or your monthly price.` |
| monthlyArpa | `0` | `zero` | `Enter an ARPA above 0.` |
| any money | bad format | `format` | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| any money | above max | `range` | `Enter an amount up to 1,000,000,000.00.` |
| currentCustomers, newCustomersPerMonth | blank | `missing` | `Enter a whole number. Use 0 if none.` |
| currentCustomers, newCustomersPerMonth | bad format | `format` | `Use digits only, without commas, signs, or decimals.` |
| currentCustomers, newCustomersPerMonth | above max | `range` | `Enter a number from 0 to 1,000,000,000.` |
| churnPercent | blank | `missing` | `Enter monthly churn. Use 0 if no one cancels.` |
| churnPercent, rates | bad or out of range | `format` / `range` | `Enter a percent from 0 to 100, with up to two decimals.` |
| currentMrr | blank | `missing` | `Enter your current MRR.` |
| currentMrr | `0` | `zeroBase` | `A growth rate can't grow $0. Use new customers and churn instead.` |
| growthPercent | blank | `missing` | `Enter your monthly MRR growth.` |
| growthPercent | bad or out of range | `format` / `range` | `Enter a percent from -100 to 1000, with up to two decimals.` |
| deadlineMonths | blank | `missing` | `Enter the number of months.` |
| deadlineMonths | bad, `0`, or above 600 | `format` / `range` | `Enter whole months from 1 to 600.` |
| visitorToSignupPercent, signupToPaidPercent | blank while the other has a value | `missing` | `Enter this rate, or clear both rates.` |
| traffic | rates entered, timeline skipped | `trafficNeedsTimeline` | `Fill in the customer timeline first. Traffic is worked out from its monthly pace.` |
| currency, goalPeriod, method, solveFor | not a listed value | `option` | `Choose one of the listed options.` |
| form | non-object input | `form` | `Something in the form is out of date. Reset and try again.` |

The `zeroBase` message uses `$` only as an example. The frontend may swap in the currency symbol.

### Known examples

Calculated independently with exact fractions. USD, monthly goal, `date`, and no traffic unless stated.

| Inputs | Expected |
| --- | --- |
| Goal `10000`, ARPA `29`, timeline blank | `customersNeeded 345`; MRR at 345 `$10,005.00`; `timeline: null`. |
| Goal `10000`, ARPA `12` | `834`. |
| Goal `10000` per **year**, ARPA `29` | Monthly goal `$833.33`, `monthlyGoalIsRounded: true`; annual `$10,000.00`; `customersNeeded 29` (exact 28.74). |
| Goal `10000`, ARPA `29`, customers: current `0`, new `15`, churn `0` | `reached`, month `23`; `ceiling: null`; `lostPerMonthAtGoal 0`; `remainingCustomers 345`. Path month 23 customers `345`. |
| Same, churn `3` | `reached`, month `39`. Exact N(38) = 342.86, N(39) = 347.57. Ceiling `500`, `isWhole: true`; `lostPerMonthAtGoal 11` (exact 10.35). Path floors at months 1, 2, 3, 12, 24, 39: `15, 29, 43, 153, 259, 347`. |
| Goal `15000`, ARPA `29`, current `0`, new `15`, churn `3` | `customersNeeded 518`; `unreachable`, reason `ceiling`; ceiling `500`; `paceToReach 16`. Path to month 120. |
| Goal `10000`, ARPA `29`, current `120`, new `20`, churn `2.5` | `remainingCustomers 225`; ceiling `800`; `reached`, month `16`. Path floors at months 15 and 16: `334, 346`. |
| Goal `10000`, ARPA `29`, current `400`, new `5`, churn `3` | `alreadyThere`; ceiling `166` (`isWhole: false`, exact 166.67); `fallsBelowInMonth 9`. |
| Goal `10000`, ARPA `29`, current `10`, new `0`, churn `0` | `unreachable`, reason `noNewCustomers`. |
| Goal `29000`, ARPA `29`, current `0`, new `1`, churn `0` | `customersNeeded 1000`; `beyondHorizon`. Month 1000 is past the 600 cap. Path months 0 to 600. |
| Goal `10000`, ARPA `50`, customers `pace`: current `0`, churn `0`, deadline `12` | `customersNeeded 200`; `requiredPace 17` (exact 16.67); `paceForDeadline`. |
| Goal `10000`, ARPA `29`, customers `pace`: current `0`, churn `4`, deadline `12`; traffic visitor→signup `3`, signup→paid `15` | `requiredPace 36` (exact 35.63). Pace 35 reaches in month 13, pace 36 in month 12. Signups `240`, visitors `8,000` a month, `visitorsToGoal 96,000` over 12 months. VisitTrack shows 7,919 because it uses the fractional 35.63 customers. |
| Same, signup→paid `0` | Traffic `noFiniteTraffic`, stage `signupToPaid`. |
| Growth: current MRR `1000`, growth `10`, goal `10000` | `reached`, month `25`. Path month 24 `$9,849.73`, month 1 `$1,100.00`, month 3 `$1,331.00`. `remainingMrrCents` `$9,000.00`. |
| Growth `pace`: current MRR `1000`, goal `10000`, deadline `24` | `requiredGrowthHundredths 1007` (10.07%). At 10.07%, month 24 is `$10,001.27`. At 10.06% it's `$9,979.49`. |
| Growth `pace`: current MRR `1000`, goal `10000`, deadline `1` | `900.00%`, so `90000` hundredths, `rateForDeadline`. |
| Growth `pace`: current MRR `0.01`, goal `1000000000`, deadline `1` | `aboveMaxRate`. |
| Growth: current MRR `1000`, growth `0.3`, goal `10000` | `beyondHorizon`. The exact first month is 769. |
| Growth: current MRR `1000`, growth `0` / `-2` | `unreachable`, `noGrowth` / `shrinking`. |
| Growth: current MRR `12000`, growth `5`, goal `10000` | `alreadyThere`, month 0; `remainingMrrCents 0`. |
| Invalid | One error per field, `status: "invalid"`: goal blank or `0`; ARPA `0`; goal `$10,000`, `1e4`, `10000.001`; churn `101` or `-1`; current customers `12.5` or `1,200`; growth current MRR `0` (`zeroBase`); growth `1000.01`; deadline `0` or `601`; one traffic rate blank; traffic set with the timeline blank (`traffic`); only new customers filled in `customers/date` (errors on current customers and churn); method `weekly`. A blank timeline and blank traffic are valid. |

### Ownership

Sol builds the backend:

- `lib/mrr-goal-calculator/engine.ts`. Reuse `lib/saas-economics/shared.ts` and don't change it.
- `tests/pages/mrr-goal-calculator/mrr-goal-calculator.test.mjs`, covering the examples above.
- The development tool-page row, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/mrr-goal-calculator/page.tsx`, `layout.tsx`, `mrr-goal-calculator.tsx`, and `mrr-goal-calculator.module.css`.
- `app/(site)/(tools)/mrr-goal-calculator/art/mrr-goal-calculator.{spec.json,svg,ts}`, plus its line in `lib/card-art.ts`.

No URL-restore wrapper.

### Catalog placement

Primary and only catalog: `/saas-tools`. It's the forward-looking goal and pace question. The MRR, ARPA, churn, break-even, and metrics tools measure today's numbers or a cost target, and none of them plans a goal. Place it next to the break-even MRR calculator. The coordinator sets the final order for the batch. No secondary catalog fits.

Catalog `toolSpot` key: `mrr-goal-calculator`. Suggested motif name: `goalFlag`.

- Takeaway: a monthly climb of paying customers meets a set target.
- Focal subject: a small pennant flag on a short pole, planted on a horizontal dashed target line in the upper right.
- One supporting relationship: a rising line of evenly spaced dots, one per month, climbs from the lower left and meets the dashed line exactly at the flag pole's foot.
- Tone: aspirational but calm. Accent on the flag only, neutral ink for the dots and line.
- Keep out: numbers, currency signs, coins, people icons, steps, bars or columns, and a curve that flattens below the line. The LTV card already uses an asymptote, CAC payback a staircase, and gross margin columns.
- Wordless, and legible at card size in both themes.

## Interface

### Flow

- Question: "How many paying customers do I need for my revenue goal, and how long will it take me to get there?"
- Lead answer: paying customers needed, always.
- Primary action: `Calculate`. The writing pass sets the final label.
- Control mode: `single`. Each method's fields stay visible in the main flow. Traffic sits in a `UiDisclosure`, because it's an optional refinement that does nothing when blank. Its summary shows the two rates when they're set.

Workbench order:

1. **Goal.** Goal amount, with a currency-code suffix, beside a `per month (MRR)` / `per year (ARR)` choice. Then monthly ARPA, with this helper: `For yearly plans, divide the yearly price by 12.` The currency select sits at the top right of this group, and above it on mobile.
2. **Timeline.** Marked optional. Two compact `UiChoiceGroup` rows:
   - Method: `New customers and churn` / `MRR growth rate`.
   - Solve for: `When I reach it` / `Pace for a deadline`.

   Then only the fields the pair reads, in this order:
   - Customers, date: current paying customers, new paying customers a month, monthly customer churn. Units sit in the labels (`New paying customers a month`, `Deadline in months`), because a long suffix wraps inside a narrow field.
   - Customers, pace: current paying customers, monthly customer churn, deadline in months.
   - Growth, date: current MRR, net monthly MRR growth.
   - Growth, pace: current MRR, deadline in months.

   Helpers:
   - Under churn: `Share of paying customers who cancel each month. Not revenue churn.`
   - Under growth: `Net change in total MRR. Churn is already in it.`

   Both prevent the most common mix-up in the research.
3. **Traffic needed**, a `UiDisclosure`. Customer method only, and hidden for growth with drafts kept. It holds the visitor-to-signup and signup-to-paid rates, each with a `%` suffix.
4. `Calculate` and a quiet `Reset`, in a `UiActionRow`.
5. One divider, then results.

### Components

Existing shared components. No new shared component is needed:

| Use | Component |
| --- | --- |
| Currency | `UiSelect` from `@/app/ui/controls` |
| Goal period, method, solve for | `UiChoiceGroup` from `@/app/ui/controls` |
| Money, counts, percents, months | `UiTextField` from `@/app/ui/controls`, with `inputMode="decimal"` or `"numeric"`, a suffix (currency code, `%`, `months`, `a month`), autocomplete and spellcheck off |
| Traffic | `UiDisclosure` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, `UiButton` from `@/app/ui/controls` |
| Lead | `UiPrimaryResult` from `@/app/ui/display` |
| Timeline and traffic figures | `UiMetricGroup` from `@/app/ui/display` |
| Progress toward goal today | `UiProgressBar` from `@/app/ui/display` |
| Month chart | `UiLiveChart` from `@/app/ui/charts/chart-client`, kind `line` |
| Month-by-month table | `UiDataTable` from `@/app/ui/display`, inside a `UiDisclosure` |
| Assumptions | `UiKeyValueList` from `@/app/ui/display` |
| Change, reset, failure | `UiStatus` from `@/app/ui/display` |

Why no new component:

- The chart's goal and ceiling are flat extra series in a `line` spec, so no reference-line feature is needed.
- A month axis is a numeric x with `xFormat: "number"`.
- This is the first tool page to use `UiLiveChart`, so the frontend check must confirm it at mobile width in both themes.

Tool-specific component, in the route file:

- `MrrGoalCalculator` owns raw input strings, error mapping by `MrrGoalFieldKey`, focus, status, and result rendering. It calls only `calculateMrrGoal`.

### Result regions

1. **Lead.** `UiPrimaryResult`, label `Paying customers needed`, value `345`.
   - Detail: `At $29.00 a month, 345 customers bring in $10,005.00 MRR.`
   - For ARR: `$10,000.00 ARR is $833.33 a month. At $29.00, 29 customers bring in $841.00 MRR.`
   - Tone `neutral`.
2. **Timeline answer.** Shown when the timeline isn't skipped. A short sentence heading, then a `UiMetricGroup`.

   | Outcome | Heading | Metrics |
   | --- | --- | --- |
   | Customers, reached | `Reached in month 39` (`about 3 years 3 months`) | `Customers still needed` 345 · `Lost each month at goal` 11 · `Ceiling at this pace` 500. The entered pace shows only in the assumptions list. |
   | Customers, already there | `You're already there` | If `fallsBelowInMonth`: `At this pace you drop below the goal in month 9. Customers level off near 166.` |
   | Unreachable, ceiling | `Out of reach at this pace` | Detail: `With 15 new customers a month and 3% churn, you level off at 500 customers, short of 518. Add at least 16 a month to reach it.` When the ceiling equals the goal: `you get close to 500 but never reach it.` |
   | Unreachable, no new customers | `Out of reach at this pace` | `With no new customers and no churn, the count stays at 10.` |
   | Beyond horizon | `Not within 50 years` | `At this pace the goal is more than 600 months away.` |
   | Customers, pace | `Add 36 new customers a month` | `to reach 345 by month 12` · `Lost each month at goal` 14 · `Customers still needed` 345 |
   | Growth, reached | `Reached in month 25` | `MRR still needed` $9,000.00. The entered rate shows only in the assumptions list. |
   | Growth, unreachable | `Out of reach at this rate` | `MRR doesn't grow at 0% a month.` or `MRR shrinks at -2% a month.` |
   | Growth, pace | `Grow MRR 10.07% a month` | `to reach $10,000.00 by month 24` |
   | Growth, above max | `Needs more than 1000% a month` | `Try a later deadline.` |

   - Month spans show as `about N years M months` when 12 or more, with whole months only.
   - Tone stays `neutral`. "Out of reach" isn't an error state.
   - When the timeline is skipped, show one line instead: `Add your current numbers to see when you'd reach it.`
3. **Today's progress.**
   - Customer method with `N0 > 0`: `UiProgressBar` labeled `Customers today toward goal`, with `valueText` `120 of 345`.
   - Growth method: labeled `MRR today toward goal`.
   - Skip it when already there, because a full bar repeats the heading.
4. **Chart.** `UiLiveChart`, `kind: "line"`, `xFormat: "number"`.
   - Customer method: `format: "number"`, title `Paying customers by month`.
     - Series `Paying customers` from `path.customers`.
     - Series `Customers needed`, flat at `R`.
     - Series `Ceiling at this pace`, flat, only when the outcome is `unreachable/ceiling`.
   - Growth method: `format: "currency"`, title `MRR by month`.
     - Series `MRR`, cents ÷ 100.
     - Series `Goal`, flat at the monthly goal.
   - Pace modes use the required pace or rate. Caption: `At 36 new customers a month` or `At 10.07% a month`.
   - No `range`. Hover and series toggles help read a crossing month.
   - No chart for `alreadyThere` without `fallsBelowInMonth`, in either method, and none for a flat path. The month table follows the chart and is hidden when the chart is.
   - The shared chart formats `currency` as US dollars. For other currencies the MRR chart uses `number` and names the code in its title.
5. **Traffic.** Customer method with rates set. A `UiMetricGroup`: `Signups a month` 240 · `Visitors a month` 8,000 · `Visitors until goal` 96,000.
   - For `noFiniteTraffic`, one line: `At 0% signup-to-paid, no amount of traffic adds paying customers.`
6. **Month by month.** A `UiDisclosure` named `Month by month`, holding a `UiDataTable`.
   - Customer columns: `Month`, `Paying customers`, `MRR`. Growth columns: `Month`, `MRR`.
   - The goal month's row is marked with text, `Goal reached`, not color alone.
   - This gives exact numbers for paths over 60 points, where the chart drops its hidden table.
7. **Assumptions.** A `UiKeyValueList`: `Goal`, `Monthly ARPA`, and the method's inputs.
   - One formula line per method. Customers: `Next month = customers × (1 − churn) + new customers.` Growth: `Next month = MRR × (1 + growth).`

Facts aren't repeated:

- The customer count appears only in the lead.
- The pace appears in the timeline metrics or heading, never both.
- The chart's goal line restates `R` visually, which is the relationship it shows.
- The traffic pace isn't repeated, because the timeline already shows it.

### States

- **Initial.** Everything blank. USD, `month`, `customers`, `date`. Traffic collapsed. No result.
- **Invalid.**
  - Clear the result and keep every value.
  - Field errors go under their fields.
  - A `traffic` error goes under the disclosure's first rate. Expand the disclosure if it's collapsed.
  - Focus the first invalid field in reading order: goal, ARPA, then timeline fields, then the rates.
- **Valid.** Show the results, focus the lead, and let the focused output announce it.
- **Partial.** A skipped timeline shows the lead plus the add-numbers line. A growth method shows no traffic.
- **Unreachable, beyond horizon, above max rate.** Valid results in the same layout.
- **Edited after result.** Clear the result, keep focus, and announce `Inputs changed. Calculate again.` once.
- **Method or solve switch.** Swap the visible fields and keep every draft. Hidden fields are never validated, so no hidden error can happen.
- **Unexpected failure.** Keep the inputs and show `UiStatus` danger by the actions: `Couldn't calculate. Try again.`
- **Reset.** Restore initial values, focus the goal amount, and announce `Form reset.`
- **Restored.** The clean URL never changes. A back-forward cache restore clears on the next edit.
- **Long values.** `1,000,000,000.00` goals and 100-billion customer counts show in full, never abbreviated. They wrap inside metrics without page overflow. A 600-row table scrolls inside its disclosure.
- **Loading and retry.** Don't apply. The calculation is synchronous.

### Responsive and accessible behavior

Desktop:

- Use the measured workbench.
- Goal amount and goal period share a row. ARPA sits beside the currency select.
- The two choice rows sit one above the other.
- Timeline fields share a row of three, or two in growth.
- Results stack in the order above. The chart is full width at about 280px tall.

Mobile:

- Every field stacks in task order, and choice rows wrap their options.
- Buttons go full width.
- The chart keeps full width, and series names wrap under it.
- `UiDataTable` turns into labeled rows. No page-level horizontal overflow, and grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order is currency, goal, goal period (arrows), ARPA, method (arrows), solve for (arrows), visible timeline fields, the traffic toggle and rates, then the actions.
- Enter in a field submits.
- One polite live region announces changes, resets, and failures. The result is announced through the focused lead.
- The chart carries its own hidden table up to 60 points, and the month table covers longer paths.

Check at desktop and mobile in both themes:

- $10k at $29, with 15 a month at 0% and at 3%.
- $15k unreachable.
- Already there and shrinking.
- An ARR goal.
- Customer pace with traffic.
- Growth at 10%, and growth pace.
- Growth from 0, for the error.
- A 600-month path.
- Pasted `$10,000`.

---

## Content

Plan for the writing session. The page words live in the route's `content/*.mdx` files, and this section doesn't repeat them.

The tool was run through the engine with the known examples above, not in a browser. The result sentences come from the route file.

### Search intent and metadata direction

The searcher has a revenue target, usually "$10k MRR". They want to know how many paying customers that is at their price, and how long it takes at a pace they can manage. Top results answer one slice each, leave churn out or add it to the one-time count, and give no reason when a goal can't be reached.

- Visible title: `MRR goal calculator: how many customers do you need, and when?`
- SEO title: `MRR goal calculator: customers and time to $10k MRR`. "$10k MRR" is the phrase people search.
- SEO description: `Find how many paying customers your MRR or ARR goal needs, and when you'll reach it from new customers and churn or your MRR growth rate.`
- Card name: `MRR goal`. Card description: `Find how many paying customers your revenue goal needs, and the month you'll reach it.`

No benchmark, typical growth rate, or "time to $10k" claim anywhere, including the metadata.

### Page promise and reader questions

After the page, the reader knows their customer count, can tell it apart from the monthly pace, and knows why churn can put a goal out of reach.

| Reader question | Answered by the tool | Where the page answers it |
| --- | --- | --- |
| How many customers do I need for $10k MRR? | Lead, rounded up, with the MRR those customers bring. | Article: formula, a price table for $10k MRR, the ARR case. |
| What price or ARPA do I enter? | Field label and hint. | Usage: one plan vs several, yearly plans, link to ARPA and MRR tools. |
| How long will it take? | Timeline heading, month count. | Usage worked example. Article: no typical answer, your pace decides. |
| How does churn change it? | Path, chart, `Lost each month at goal`. | Article: the month formula, 23 vs 39 months. |
| Why does it say out of reach? | Heading and the level-off sentence. | Article: `new ÷ churn`, 15 ÷ 3% = 500, the $15k goal, the 16 a month pace. |
| Is "customers needed" the same as new customers a month? | Lead vs timeline metrics. | Article section with a three-row table. |
| Should I use a growth rate instead? | Method switch, growth helper. | Article: net rate already has churn in it; can't start from 0. |
| How much traffic do I need? | Traffic metrics. | Article: funnel formula, 8,000 vs 7,919. |
| Is $10k MRR $10k income? | Not answered by the tool. | Article: run rate, not cash or income; link break-even MRR. |

### Recommended page structure and formats

**Intro.** Two sentences and a short third: what you get, what to have ready, the timeline is optional.

**Usage.** `What to enter`: the goal period, price or ARPA, which timeline method to pick, where new customers, churn, and growth rate come from, and the deadline mode. Short traffic note. `How to read the result`: lead rounds up, month numbering, the three timeline metrics, and one `Example` with $10k, $29, 15 a month, 3% churn.

**Article, in this order:**

1. `How many customers do you need for $10k MRR?` Formula box, price table for $10k MRR, the ARR case at $29.
2. `How does churn slow you down?` Formula box for the month step. 15 a month: month 23 at 0%, month 39 at 3%.
3. `Why is my goal out of reach?` The ceiling, the 15 ÷ 3% = 500 example, the $15k goal at 518, pace 16 reaching in month 117. Point to `Pace for a deadline` for a date.
4. `Are customers at goal and new customers a month the same?` Table of the three numbers.
5. `Should you plan from a growth rate or from new customers?` Net rate includes churn. $1,000 at 10%, month 25, 10.07% for 24 months. Zero start.
6. `How much traffic does your goal need?` Formula box, 36 a month at 3% and 15%, 8,000 vs VisitTrack's 7,919.
7. `How long does it take to reach $10k MRR?` No typical time; self-reported threads are not a survey.
8. `Is $10k MRR the same as $10k income?` No. Stripe definition, yearly plans, costs. Next links.

No article chart and no marker art. The tool already draws the path and the ceiling line.

### Left out on purpose

- The 600-month cap, the 1,000% growth cap, 100% churn, and month 0 at goal. Result headings and the spec handle them.
- Input format rules. Field errors handle them.
- Why the chart floors customer counts. The month table shows the exact numbers.
- A "good growth rate" or churn benchmark. Research found no dated, segmented source.

### Claims to keep, and claims to avoid

Keep: counts round up; the goal says MRR or ARR; churn is never taken off a net growth rate; the ceiling is `new ÷ churn`; customers at goal, new a month, and lost a month at goal are three numbers; traffic comes from a whole-number pace; results are scenarios from the entered numbers.

Avoid: typical times to $10k MRR, community averages, good or bad rates, calling MRR cash, revenue, profit, or income, and saying the minimum pace reaches the goal by a date.

### Source roles and links

- [Stripe: Understanding MRR and ARR](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29) for MRR as a normalized monthly amount, not GAAP revenue. Checked 2026-10-10 in research.
- [ChartMogul: Customer churn rate](https://chartmogul.com/saas-metrics/customer-churn/) for customer churn as customers lost ÷ customers at the start.
- [ChartMogul: Average revenue per account](https://chartmogul.com/saas-metrics/arpa/) for ARPA as MRR ÷ paying customers.
- The 345, 23, 39, 500, 518, 16, 117, 36, 240, 8,000, 25, and 10.07% figures come from this spec's known examples and an engine run on 2026-10-10. The price table is `ceil(10000 ÷ price)`.
- VisitTrack's 7,919 comes from the research's competitor review.
- Founder threads in research show the question, not a typical time. They aren't linked.

Next stack127 pages: `/mrr-calculator`, `/arpu-arpa-calculator`, `/customer-churn-calculator`, `/churn-rate-converter`, `/free-trial-conversion-calculator`, `/break-even-mrr-calculator`.
