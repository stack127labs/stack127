# Customer acquisition cost calculator

Route: `/customer-acquisition-cost-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher wants to know what it cost to win one new paying customer. They also want to be able to defend that number: which costs went in, which customers were counted, and whether their own unpaid hours were part of it.

Where the current top results fail them:

- Most pages take one or two cost totals. Only 4Calculators and MoneySheet split costs into categories, and none of the five show how shared costs like rent or a part-time role were split.
- Founder time is left out or mixed into payroll. No calculator keeps unpaid hours apart from cash, so a solo founder can't compare their CAC with a staffed team's.
- Paid-channel CAC and blended CAC are shown side by side with different denominators and no label saying so. "Paid CAC" means three different things across the five tools.
- Nobody says when costs and customers come from different months. A same-month ratio is a proxy when the sales cycle is longer than a month, and no result is labeled that way.
- Bad input is handled badly. ARB Digital accepts negative spend, MoneySheet treats it as zero, Daydream appears to use its absolute value, and CustomerAcquisitionCostCalculator leaves an old result showing.

What this tool does better:

1. Costs go in named categories: paid media, sales and marketing pay, agencies and freelancers, and tools, content, and events. A blank category reads `Not counted`, which is different from `$0.00`.
2. Shared costs are allocated with a method the reader picks and can see: a fixed share, acquisition hours out of total hours, or acquisition headcount out of total headcount.
3. Founder time is hours times an hourly value the reader sets. It gives a second CAC with founder time, and never changes the cash CAC.
4. Paid media per paid-sourced customer is a third, separately named number, with its own denominator shown.
5. The result says whether costs and customers come from the same period, or were matched to the customers they won.
6. A baseline and an alternative scenario can differ in any cost, allocation, customer count, or timing, and the difference is stated in money.
7. No benchmark band, grade, or spend advice. The research found no universal CAC target.

## Product

### Promise and scope

The primary user is a SaaS founder or small team who wants a CAC they can explain. They know roughly what they spent on acquisition in a period and how many first-time paying customers they won. The tool shows CAC from cash costs, CAC with founder time when they add it, and the cost of each paid-sourced customer, with every cost line and denominator visible.

Launch scope:

- One currency, used as a label only.
- Four cost categories, each optional.
- Optional shared costs, with an allocation method.
- Optional founder time: hours and an hourly value.
- New paying customers, and optional paid-sourced customers.
- A timing choice: `samePeriod` or `matched`.
- An optional alternative scenario with its own values.

Exclusions:

- Free-form cost lines. The four categories cover every cost type in the research. Anything else goes in the nearest category or in shared costs. A repeatable list would make the breakdown harder to compare across scenarios.
- Organic CAC. Splitting non-media costs between paid and organic customers is an allocation the research found no agreement on.
- Fully loaded paid CAC, meaning paid media plus some share of other costs per paid customer. Competitors compute it three different ways, so the tool shows only the two numbers it can define exactly.
- Period length, such as month or quarter. CAC doesn't depend on it. The timing choice says what matters, which is whether costs and customers line up.
- A sales-cycle lag calculator that shifts spend between months. That needs month-by-month spend and win data. The `matched` choice covers the case where the reader has already assigned costs to customers.
- LTV, LTV:CAC, and payback. Separate tools cover those.
- Benchmarks, grades, recommendations, GAAP or ASC 340-40 claims, URL sharing, saved scenarios, and export.

The existing `/saas-metrics-calculator` divides one spend figure by new accounts in a monthly snapshot. This tool is the deeper version: named costs, allocation, founder time, paid-sourced customers, timing, and scenarios.

### Technical contract

**Fields and units.** Every money value is in the selected currency, for the reader's chosen window. Scenario fields exist once for `baseline` and once for `alternative`.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| Include shared costs | Boolean. Default off. | When off, the engine ignores every shared cost field. |
| Include founder time | Boolean. Default off. | When off, the engine ignores both founder fields. |
| Compare a second scenario | Boolean. Default off. | When off, the engine ignores the alternative. |
| Timing (`timing`) | `samePeriod` or `matched`. Default `samePeriod`. Per scenario. | Changes the result label only. `samePeriod` is the default because it claims less. |
| Paid media (`paidMedia`) | Optional money, `0` to `1,000,000,000.00`. | Ad spend and sponsored placements. Required when paid-sourced customers is entered. |
| Sales and marketing pay (`salesMarketingPay`) | Optional money, same bounds. | Salaries, commissions, and contractors who work only on acquisition. |
| Agencies and freelancers (`agencies`) | Optional money, same bounds. | |
| Tools, content, and events (`toolsContentEvents`) | Optional money, same bounds. | |
| Shared costs (`sharedCosts`) | Money, same bounds. Required when shared costs are on. | Costs that only partly serve acquisition, such as a mixed role, rent, or general software. |
| Allocation method (`allocationMethod`) | `share`, `hours`, or `headcount`. Default `share`. Validated when shared costs are on. | |
| Share (`sharePercent`) | Percent `0` to `100`, two decimals. Required with `share`. | |
| Acquisition hours (`acquisitionHours`) and total hours (`totalHours`) | Decimal with up to two places. Acquisition `0` to `100,000`. Total above `0`, up to `100,000`. Required with `hours`. | Acquisition can't exceed total. |
| Acquisition headcount (`acquisitionHeadcount`) and total headcount (`totalHeadcount`) | Same rules as hours. Required with `headcount`. | Decimals allow part-time people, such as `1.5`. |
| Founder hours (`founderHours`) | Decimal `0` to `100,000`, two places. Required when founder time is on. | Unpaid hours spent on acquisition. |
| Founder hourly value (`founderHourlyValue`) | Money `0` to `1,000,000.00`. Required when founder time is on. | The reader's own value. There's no default. |
| New paying customers (`newCustomers`) | Whole number `0` to `10,000,000`. Required. | First-time paying customers only. `0` is valid and gives `noCustomers`. |
| Paid-sourced customers (`paidCustomers`) | Optional whole number, `0` to `10,000,000`. | Can't exceed new paying customers. Blank means no paid view. |

**Parsing.** Use `lib/saas-economics/shared.ts`. Raw values stay strings until the engine parses them. Money uses `parseMoneyCents`, percents use `parsePercentHundredths` with `min: 0n`, counts use `parseWholeNumber`, and hours and headcount use `parsePercentHundredths` with `min: 0n` and the bounds above in hundredths. That parser already accepts exactly `^\d+(\.\d{1,2})?$` when the minimum is 0. Sol may add a neutrally named alias for it in `shared.ts` without changing behavior. Reject signs, commas, currency symbols, `%`, exponents, interior spaces, a leading or trailing dot, and extra decimals.

Blank handling differs by field, and it's deliberate:

- A blank cost category is `Not counted`. It adds nothing and shows as `Not counted`, not `$0.00`.
- At least one cost must be entered in the scenario, counting the four categories plus any active shared or founder section. An entered `0` counts as entered.
- Every other active field is required. Blank is a `missing` error, never zero.
- Blank `paidCustomers` means no paid view.
- Inactive fields, meaning shared or founder fields with their checkbox off, method fields for another method, and the alternative with compare off, are ignored. They keep their drafts in the form.

**Exact arithmetic.** Keep every amount as an exact fraction of cents in `bigint` (`ExactFraction` from `lib/saas-economics/unit-economics.ts`, defined in the [LTV spec](../customer-lifetime-value-calculator/tool-spec.md#libsaas-economicsunit-economicsts)). Round only for output.

- Category amounts are whole cents.
- Allocated shared cost is `S × p ÷ 10000` with `share`, where `p` is hundredths of a percent. With `hours` or `headcount`, it's `S × part ÷ whole`, using both values in hundredths.
- Founder time value is `hours × rate ÷ 100` cents, with hours in hundredths and rate in cents.
- Cash total is the sum of entered categories plus the allocated shared cost.
- Total with founder time is the cash total plus the founder time value.
- Cash CAC is `cash total ÷ newCustomers`. CAC with founder time is `total with founder time ÷ newCustomers`. Paid media CAC is `paidMedia ÷ paidCustomers`.
- A denominator of `0` gives `noCustomers` for that view. The engine doesn't divide. This includes zero costs over zero customers.
- Each line's per-customer amount is its exact amount divided by `newCustomers`. Line amounts aren't rounded first.

**Rounding for output.** Money rounds half away from zero to cents.

- `isRounded` is set when the exact value isn't a whole number of cents.
- `roundedToZero` is set when a positive exact value displays as `0.00`. The interface shows `Under $0.01`.
- Per-customer line amounts are rounded one by one. They may not add up to the rounded CAC. The table's total row is the exact CAC rounded once.
- Scenario differences subtract the two rounded CACs, so the stated difference matches the visible numbers. A difference exists only when both sides are `finite`.

**Outputs per scenario.** Timing, each category with its entered amount or `null` and its per-customer amount, the shared allocation with its method and driver values, the cash total and cash CAC, the founder time and CAC with founder time when on, the counts, and the paid media CAC when paid-sourced customers is entered. Never return `Infinity`, `NaN`, a negative amount, or a `finite` CAC for zero customers.

**Action and handling.** `Calculate CAC` is the only primary action.

- A valid submit shows the results and focuses the first lead.
- An invalid submit clears any old result, keeps every raw input, puts one error under each invalid field, and focuses the first invalid field in reading order. The "at least one cost" error sits under the first cost category, `Paid media`.
- Editing any input that drives the result, or toggling compare, shared costs, founder time, the allocation method, timing, or currency, clears the result and announces `Inputs changed. Calculate again.`
- Reset restores the defaults, clears every draft and error, and focuses the currency select.

**Privacy and security.** The calculation runs in the browser. Entered values never go to a server, the URL, cookies, storage, logs, or analytics. The clean URL stays unchanged. No API route, dataset, or background job.

### Backend contract

Same runtime rules as the other SaaS economics engines: strip-types safe, no enums or namespaces, explicit `.ts` imports, and no DOM, network, time, or randomness.

Uses `lib/saas-economics/shared.ts` unchanged, apart from an optional parser alias, and `ExactFraction` helpers from `lib/saas-economics/unit-economics.ts`.

#### `lib/customer-acquisition-cost-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";

export const CAC_COST_CATEGORIES = ["paidMedia", "salesMarketingPay", "agencies", "toolsContentEvents"] as const;
export type CacCostCategory = (typeof CAC_COST_CATEGORIES)[number];
export const CAC_ALLOCATION_METHODS = ["share", "hours", "headcount"] as const;
export type CacAllocationMethod = (typeof CAC_ALLOCATION_METHODS)[number];
export const CAC_TIMINGS = ["samePeriod", "matched"] as const;
export type CacTiming = (typeof CAC_TIMINGS)[number];

export const CAC_SCENARIO_FIELDS = [
  ...CAC_COST_CATEGORIES,
  "sharedCosts", "allocationMethod", "sharePercent",
  "acquisitionHours", "totalHours", "acquisitionHeadcount", "totalHeadcount",
  "founderHours", "founderHourlyValue",
  "newCustomers", "paidCustomers", "timing",
] as const;
export type CacScenarioField = (typeof CAC_SCENARIO_FIELDS)[number];
export type CacScenarioKey = "baseline" | "alternative";
export type CacFieldKey = "form" | "currency" | `${CacScenarioKey}.${CacScenarioField}`;

export type CacScenarioInput = Record<CacScenarioField, string>;
export type CustomerAcquisitionCostInput = {
  currency: string;
  includeShared: boolean;
  includeFounderTime: boolean;
  compare: boolean;
  baseline: CacScenarioInput;
  alternative: CacScenarioInput;
};

export type CacPerCustomer =
  | { kind: "finite"; cents: bigint; isRounded: boolean; roundedToZero: boolean }
  | { kind: "noCustomers" };

export type CacCostLine = {
  category: CacCostCategory;
  enteredCents: bigint | null;      // null = not counted
  perCustomerCents: bigint | null;  // null when not counted or newCustomers is 0
};

export type CacAllocationDriver =
  | { method: "share"; shareHundredths: bigint }
  | { method: "hours"; partHundredths: bigint; wholeHundredths: bigint }
  | { method: "headcount"; partHundredths: bigint; wholeHundredths: bigint };

export type CacSharedCost = {
  sharedCents: bigint;
  driver: CacAllocationDriver;
  allocatedCents: bigint;           // half away from zero
  allocatedIsRounded: boolean;
  perCustomerCents: bigint | null;  // from the exact allocation
};

export type CacFounderTime = {
  hoursHundredths: bigint;
  hourlyValueCents: bigint;
  valueCents: bigint;               // half away from zero
  valueIsRounded: boolean;
  perCustomerCents: bigint | null;
};

export type CacScenarioValues = {
  timing: CacTiming;
  costs: CacCostLine[];             // always four, in CAC_COST_CATEGORIES order
  shared: CacSharedCost | null;     // null when shared costs are off
  cashTotalCents: bigint;
  cashTotalIsRounded: boolean;
  cashCac: CacPerCustomer;
  founderTime: CacFounderTime | null;          // null when founder time is off
  totalWithFounderTimeCents: bigint | null;
  cacWithFounderTime: CacPerCustomer | null;
  newCustomers: bigint;
  paidCustomers: bigint | null;     // null when blank
  paidMediaCac: CacPerCustomer | null;         // null when paidCustomers is blank
};

export type CacComparison = {
  /** alternative - baseline, from the rounded cents; null unless both are finite. Negative means cheaper. */
  cashCacDeltaCents: bigint | null;
  cacWithFounderTimeDeltaCents: bigint | null;
  paidMediaCacDeltaCents: bigint | null;
};

export type CustomerAcquisitionCostValues = {
  currency: SaasEconomicsCurrency;
  includeShared: boolean;
  includeFounderTime: boolean;
  baseline: CacScenarioValues;
  alternative: CacScenarioValues | null;
  comparison: CacComparison | null;
};

export type CustomerAcquisitionCostErrors = Partial<Record<CacFieldKey, string>>;

export type CustomerAcquisitionCostCalculation =
  | { status: "valid"; values: CustomerAcquisitionCostValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: CustomerAcquisitionCostErrors };

export function calculateCustomerAcquisitionCost(input: unknown): CustomerAcquisitionCostCalculation;
```

A non-object input, a missing scenario object, or a non-boolean toggle gives `errors.form`. An unsupported currency, allocation method, or timing gives an error on that key. The engine collects every error in one pass and never throws for user input.

Error messages. The engine owns these strings, and the writing pass may reword them:

| Case | Key | Message |
| --- | --- | --- |
| No cost entered | `<scenario>.paidMedia` | `Enter at least one cost. Use 0 if there were none.` |
| Missing required money | the field | `Enter <label>.` For example, `Enter shared costs.` |
| Bad money format | the field | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | the field | `Enter an amount up to 1,000,000,000.00.` For the hourly value, `up to 1,000,000.00`. |
| Share | `sharePercent` | `Enter a percent from 0 to 100, with up to two decimals.` |
| Hours or headcount | the field | `Enter a number from 0 to 100,000, with up to two decimals.` |
| Total of 0 | `totalHours` or `totalHeadcount` | `Enter a total above 0.` |
| Part above total | `acquisitionHours` or `acquisitionHeadcount` | `This can't be more than the total.` |
| Customer count | the field | `Enter a whole number from 0 to 10,000,000.` |
| Paid above new | `paidCustomers` | `This can't be more than new paying customers.` |
| Paid customers without paid media | `paidMedia` | `Enter paid media, or clear paid-sourced customers.` |
| Bad option | the field | `Choose one of the listed options.` |
| Form | `form` | `Something in the form is out of date. Reset and try again.` |

When both "no cost entered" and "paid customers without paid media" apply, show the second message, since it's more specific.

### Known examples

Calculated by hand with exact fractions, independent of competitor output. USD, `samePeriod`, all toggles off unless stated.

| Inputs | Expected |
| --- | --- |
| Paid media `1200`, tools `300`, new `20`; founder on, `40` hours at `75` | Cash total `$1,500.00`; cash CAC `$75.00`. Founder time `$3,000.00`; total with founder time `$4,500.00`; CAC with founder time `$225.00`. Per customer: paid media `$60.00`, tools `$15.00`, founder `$150.00`. Pay and agencies `Not counted`. |
| Paid media `5000`, pay `3000`, tools `2000`, new `100`, paid-sourced `40` | Cash CAC `$100.00`; paid media CAC `$125.00`. Matches the MoneySheet result in research. |
| Paid media `7000`, pay `12000`; shared on, `9000` by `hours`, `120` of `400` | Allocated `$2,700.00`; cash total `$21,700.00`; new `30`; CAC `$723.33`, `isRounded: true` (exact 723.333…). Per customer: `$233.33`, `$400.00`, `$90.00`. |
| Agencies `500`; shared on, `10000` by `headcount`, `1.5` of `6`; new `7` | Allocated `$2,500.00`; cash total `$3,000.00`; CAC `$428.57` (exact 428.571…). Per customer: agencies `$71.43`, shared `$357.14`. |
| Paid media `1000`; shared on, `4000` by `share`, `12.5`; new `3` | Allocated `$500.00`; CAC `$500.00`. |
| Shared on, `1000` by `hours`, `1` of `3`; no categories; new `3` | Allocated `$333.33`, `allocatedIsRounded: true`; CAC `$111.11` (exact 111.111…). |
| Shared on, `0.01` by `share`, `50`; new `2` | Allocated `$0.01` (exact 0.5 cents, half away from zero). CAC `$0.00`, `roundedToZero: true`, from the exact 0.25 cents. Rounding the allocation first would wrongly give `$0.01`. |
| Paid media `500`; founder on, `12.25` hours at `33.33`; new `4` | Founder time `$408.29`, `valueIsRounded: true` (exact 408.2925). Cash CAC `$125.00`. CAC with founder time `$227.07` (exact 227.073…). |
| Paid media `5000`, new `0` | Cash total `$5,000.00`; cash CAC `noCustomers`; per-customer amounts `null`. |
| Paid media `5000`, new `10`, paid-sourced `0` | Cash CAC `$500.00`; paid media CAC `noCustomers`. |
| Paid media `0`, new `10` | Cash CAC `$0.00`, `finite`, not rounded. |
| Paid media `0.01`, new `3` | CAC `$0.00`, `isRounded: true`, `roundedToZero: true`. |
| Founder on, `10` hours at `0`; paid media `100`; new `1` | Founder time `$0.00`; both CACs `$100.00`. |
| Compare: baseline paid media `5000`, pay `3000`, new `100`; alternative paid media `3500`, pay `3000`, new `90` | Baseline `$80.00`; alternative `$72.22` (exact 72.222…); `cashCacDeltaCents: -778`, shown as `$7.78 less`. |
| Compare: baseline `samePeriod`, alternative `matched`, otherwise as the first row | Both CACs `$75.00`; delta `0`, shown as `Same as baseline`. Each lead keeps its own timing label. |
| Maximums: all four categories `1000000000`; shared on, `1000000000` by `share` `100`; founder on, `100000` hours at `1000000`; new `1` | Cash CAC `$5,000,000,000.00`; founder time `$100,000,000,000.00`; CAC with founder time `$105,000,000,000.00`. |
| Invalid: every category blank with toggles off; paid media `-1`, `1e3`, `$300`, `1,200`, `300.001`; share `100.01`; acquisition hours `500` of total `400`; total hours `0`; founder on with hourly value blank; hours `100000.01`; new customers blank or `2.5`; paid-sourced `41` of new `40`; paid-sourced `10` with paid media blank; timing `lagged`; currency `JPY` | A field-specific error for each, under the keys above; `status: "invalid"`; no values. Blank categories next to an entered one are valid. Blank shared or founder fields with their checkbox off, and a blank alternative with compare off, are valid. |

### Ownership

Sol builds the backend:

- `lib/saas-economics/unit-economics.ts`, defined in the LTV spec, if it isn't built yet.
- `lib/customer-acquisition-cost-calculator/engine.ts`.
- `tests/pages/customer-acquisition-cost-calculator/customer-acquisition-cost-calculator.test.mjs`, covering the examples above.
- The development tool-page row, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/(saas)/customer-acquisition-cost-calculator/page.tsx`, `layout.tsx`, `customer-acquisition-cost-calculator.tsx`, and `customer-acquisition-cost-calculator.module.css`.
- `app/(site)/(tools)/(saas)/customer-acquisition-cost-calculator/art/customer-acquisition-cost-calculator.spec.json`, `.svg`, and `.ts`, generated with marker-art-draw, plus a new `toolSpot` motif in `scripts/stack127/marker-art/figures.mjs` and the registration line in `lib/tool-catalog-art.ts`. Another frontend worker currently has both shared files open, so these two edits wait until that worker is done.

No URL-restore wrapper. Financial inputs don't go in the URL.

### Catalog placement

Primary and only catalog: `/saas-tools`. A founder there is choosing among SaaS money calculators. CAC is the input that LTV:CAC and CAC payback both depend on, so it should sit just before them. Suggested order for the batch: customer acquisition cost, customer lifetime value, LTV:CAC, CAC payback, break-even MRR. The coordinator sets the final order. No secondary catalog fits.

Catalog `toolSpot` key: `customer-acquisition-cost-calculator`. Suggested motif name: `acquisitionCost`.

- Takeaway: several kinds of cost add up under one new customer.
- Focal subject: one person glyph standing on a short plinth made of three stacked layers of different heights. The bottom layer is solid, the middle one hatched, and the top one a dashed outline only.
- One supporting relationship: the dashed top layer stands for founder time, counted but not cash. No other objects.
- Tone: calm and neutral. No currency signs, numbers, coins, funnels, magnets, arrows, or targets.
- It must read differently from the `customerEconomics` card, which is a person with three arrows out to icons, the CAC payback staircase, the gross margin columns, and the break-even balance. Keep it wordless and legible at card size in both themes.

## Interface

### Flow

- Question: "What did it cost to win one new paying customer, and which costs and customers did I count?"
- Lead answer: cash CAC per scenario, or `No new customers` when the count is 0.
- Primary action: `Calculate CAC`.
- Control mode: `single`. Every visible field drives the answer. Shared costs and founder time are visible checkboxes that add fields to the main flow, because turning them on makes those fields required.

Workbench order:

1. Currency, a narrow select.
2. The scenario fieldset. With compare off it has no legend frame, and with compare on there are two side-by-side fieldsets labeled `Baseline` and `Alternative`. Inside each, in order:
   1. `Costs and customers from`, a `UiChoiceGroup`: `The same period` or `Matched to these customers`.
   2. `Acquisition costs`, a group heading, then four money fields: `Paid media`, `Sales and marketing pay`, `Agencies and freelancers`, `Tools, content, and events`.
   3. When shared costs are on: `Shared costs`, `Split by` (`Fixed share`, `Hours`, `Headcount`), then the active method's fields. Hours and headcount show their two fields on one row: `Acquisition hours` and `Total hours`.
   4. When founder time is on: `Founder hours` and `Hourly value` on one row.
   5. `Customers`, a group heading, then `New paying customers` and `Paid-sourced customers` on one row.
3. Three checkboxes: `Include shared costs`, `Include founder time`, `Compare a second scenario`.
4. `Calculate CAC` and a quiet `Reset`.
5. One divider, then the results.

Turning compare on for the first time copies the baseline's raw strings and timing into blank alternative fields. Turning it off and on again keeps the alternative drafts.

Helper lines, each preventing a likely mistake:

- Under `Acquisition costs`: `Leave a cost blank to leave it out. Enter 0 to count it as zero.`
- Under `Sales and marketing pay`: `Only people who work on acquisition full time. Put mixed roles in shared costs.` This line shows only when shared costs are off. When they're on, the shared costs helper covers it.
- Under `Shared costs`: `Costs that partly serve acquisition, like a mixed role, rent, or general software.`
- Under `Hourly value`: `What an hour of your time is worth to you. This doesn't change cash CAC.`
- Under `New paying customers`: `First-time paying customers only. Leave out trials, leads, and renewals.`

Which costs belong where, and how to pick a timing, go in the article.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Currency | `UiSelect` from `@/app/ui/controls` |
| Timing and allocation method | `UiChoiceGroup` from `@/app/ui/controls` |
| Money, percent, hours, headcount, and count fields | `UiTextField` from `@/app/ui/controls`, with `inputMode="decimal"` (or `numeric` for customer counts), a currency-code, `%`, `hours`, or `people` `suffix`, and autocomplete, capitalization, and spellcheck off |
| Toggles | `UiCheckbox` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, and `UiButton` from `@/app/ui/controls` |
| Leads | `UiPrimaryResult` from `@/app/ui/display` |
| Cost breakdown | `UiDataTable` from `@/app/ui/display` |
| Change, reset, and failure messages | `UiStatus` from `@/app/ui/display` |

Use `UiTextField` rather than `UiNumberField`, so pasted values reach the strict parser unchanged.

No new shared component. The scenario columns and paired-field rows are route CSS.

A cost-mix `UiAllocationBar` was considered and left out. The breakdown table already lists every amount, and the bar would repeat it.

Tool-specific component, in the route file:

- `CustomerAcquisitionCostCalculator`: owns the raw form state, error mapping by `CacFieldKey`, focus, status, and the result rendering below. It calls only `calculateCustomerAcquisitionCost`.

### Result regions

1. **Leads.** One `UiPrimaryResult` per scenario. With compare on, the two sit side by side.
   - Label: `CAC from cash costs`, or `Baseline CAC` and `Alternative CAC`.
   - Value: the cash CAC in currency, `Under $0.01`, or `No new customers` with no unit.
   - Detail line 1: `$1,500.00 ÷ 20 new paying customers.` For `noCustomers`: `$5,000.00 spent and no new paying customers, so there's no CAC.`
   - Detail line 2, founder time on: `With founder time: $225.00.` For `noCustomers`, leave it out.
   - Detail line 3, paid-sourced customers entered: `Paid media per paid-sourced customer: $125.00.` For `noCustomers`: `No paid-sourced customers, so there's no paid media CAC.`
   - Last detail line, timing: `samePeriod` gives `Costs and customers from the same period.` and `matched` gives `Costs matched to the customers they won.`
   - The alternative adds `$7.78 less than baseline`, `more`, or `Same as baseline`, for cash CAC only. Founder-time and paid differences go in the table. Leave a difference out when its delta is `null`.
   - Tone stays `neutral`. No grade colors.
2. **Cost breakdown.** One `UiDataTable`. Without compare, the columns are `Cost`, `Amount`, and `Per new customer`. With compare, they're `Cost`, `Baseline`, and `Alternative`, with amounts only and per-customer values on the total rows. Rows, in order:
   - The four categories. A blank one reads `Not counted`.
   - `Shared costs, allocated`, when on: `$2,700.00`, with `of $9,000.00, 120 of 400 hours` under it. For `share`: `of $4,000.00, 12.5%`.
   - `Cash total`, with cash CAC in the per-customer column.
   - `Founder time, not cash`, when on: `$3,000.00`, with `40 hours at $75.00` under it.
   - `Total with founder time`, when on, with CAC with founder time in the per-customer column.
   - `New paying customers`, and `Paid-sourced customers` when entered.
   - With compare, the founder-time and paid media CAC differences show under the alternative's total cells, such as `$12.00 less`.
3. **Formula.** One small line under the table: `CAC = acquisition costs ÷ new paying customers. Founder time is listed apart because it isn't cash.` When a per-customer value is rounded, add: `Per-customer amounts are rounded one by one, so they may not add up to the CAC.`

### States

- **Initial.** Every value field is blank. USD, `The same period`, and `Fixed share` are selected. All checkboxes are off. No result.
- **Invalid or incomplete.** Clear the old result and keep the inputs. Show one error under each invalid field, focus the first invalid field in reading order, baseline before alternative, and add no error panel. Every field that can carry an error is visible whenever its checkbox and method are active.
- **Valid.** Show the leads, table, and formula, focus the first lead, and announce it once through the focused output.
- **No new customers.** A valid result with the same layout. It isn't an error.
- **Edited after a result.** Clear the result and announce once, politely: `Inputs changed. Calculate again.` Focus stays where the reader is typing.
- **Toggle.** Turning a checkbox on adds its fields in place, and focus stays on the checkbox. Turning it off hides the fields and keeps their drafts. Switching the allocation method swaps the method fields and keeps each method's drafts.
- **Unexpected failure.** If the engine throws, keep the inputs, clear the result, show one `UiStatus` error by the actions (`Couldn't calculate. Try again.`), and leave Calculate enabled.
- **Reset.** Restore the initial state, focus the currency select, and announce `Form reset.`
- **Restored.** The clean URL never changes. If the back-forward cache restores the page with a result, the next edit clears it.
- **Long values.** `$105,000,000,000.00` and `10,000,000` customers must fit in the leads and table cells without clipping. Detail lines and the allocation note wrap.
- **Loading, empty, partial, and retry.** These don't apply. The calculation is synchronous and local.

### Responsive and accessible behavior

Desktop:

- Shared workbench band with a measured inner width.
- Without compare, the scenario is one column. Paired fields (hours, founder time, customers) share a row.
- With compare, two equal fieldset columns, and matching fields line up across them. Paired fields stack inside each column, because two pairs side by side are too narrow.
- Leads side by side, with the table full width below.

Mobile:

- Stack in this order: currency, the baseline fieldset, the alternative fieldset, checkboxes, actions, baseline lead, alternative lead, table, formula.
- Paired fields stack. `UiDataTable` turns into labeled rows.
- Buttons go full width. No page-level horizontal overflow. Grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order follows the visual order and goes through the whole baseline fieldset before the alternative.
- Enter in a field submits.
- Every field has a visible label. Group headings are fieldset legends, so a screen reader announces "Alternative, Acquisition costs, Paid media".
- Errors are tied to their fields.
- One polite live region announces changes, resets, and failures. Results are announced through the focused output only.

Check at desktop and mobile in both themes:

- The solo founder example with founder time.
- The hours allocation example.
- New customers `0`.
- Compare with different timing.
- A pasted `$300` error, and acquisition hours above total.
- The maximum amounts.

---

## Content

Plan for the writing pass. The live article is the draft in `tmp/page-publishing/saas-economics-final-a/customer-acquisition-cost-calculator/`. Do not copy this plan into the page.

### Search intent and metadata direction

The reader wants a customer acquisition cost they can explain: which cash costs went in, which customers were counted, and whether their own unpaid hours were included. Meet that with the cash result first. The visible title starts with `Customer acquisition cost calculator` and asks what one new paying customer cost. The SEO title keeps that search phrase and says the page is the cost per new customer. The description tells them they can separate cash, founder time, and paid media. The card name is `Customer acquisition cost`. The card description is the task, a cost per first-time paying customer with the costs and the count visible. Card art key is the exact slug `customer-acquisition-cost-calculator`.

Do not promise a healthy CAC, a channel to cut, GAAP or ASC 340-40 accuracy, or a lag-adjusted month.

### Page promise

After the page, the reader can point at one period's cash CAC, see a blank cost as `Not counted`, and tell a founder-time figure or a paid-media figure apart from that cash number. They know `The same period` does not move spend between months, and `Matched to these customers` does not check their assignment. They know a count of 0 has no CAC.

### Content completeness map

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| How is customer acquisition cost calculated? | The lead is cash CAC, or `No new customers`. The line under it shows the cash total and the count. | Give the three formulas once. Say the lead uses cash only. |
| Which costs go in, and what does a blank mean? | Four optional money fields, shared costs, and founder time. Blank rows say `Not counted`. A typed 0 is `$0.00`. | Map each field to a kind of cost. Leave support, hosting, and product work out, with Stripe's list as the source. Say at least one cost must be entered. |
| How do I split a mixed cost? | `Fixed share`, `Hours`, or `Headcount`, with the driver printed under the allocated amount. | One hours example. Say the split is the reader's assumption. Decimals such as `1.5` people are allowed. |
| Should my own hours be in CAC? | Founder time is a separate row and a separate per-customer line. Cash CAC does not change. | Continue the usage example with 40 hours at $75. There is no suggested hourly rate. |
| Why is paid CAC a different number? | Paid media uses paid-sourced customers. The lead names that count. | Use the $5,000 / 40 example so $125 sits next to a $100 cash CAC. Say this is not paid media plus other costs per paid customer. |
| What if the sale takes longer than the period? | The last lead line is either `Costs and customers from the same period.` or `Costs matched to the customers they won.` | Say the choice does not change the math and does not shift earlier months. Same period is a pairing, not proof. |
| What if nobody new paid? | `No new customers`, with the spend still shown. | Say this is a result, not a broken form. A typed 0 cost over a real count is a real `$0.00`. |
| How does a second scenario work? | Baseline and alternative leads. The cash difference is on the alternative. | One usage step. Founder-time and paid-media differences stay in the table. |
| What does this not decide? | No grade colors. | No universal benchmark. Not an accounting cost under ASC 340-40. Next tools: lifetime value, LTV to CAC, CAC payback, break-even MRR, and the SaaS metrics snapshot. |

### Recommended outline and formats

**Introduction, before the tool.** Three sentences: the cash cost per new paying customer, the two figures that stay beside it, and what to have ready. No formula block here.

**Usage, after the tool.** One heading, `What to enter`. Steps cover the period, where each cost goes, blank versus 0, the shared-cost split, founder hours, who counts as a new paying customer, the two timing choices, and compare. Then how to read the lead, and one `[!EXAMPLE]` for $1,200 paid media, $300 tools, and 20 new customers: cash total $1,500.00 and cash CAC $75.00. Mention plain digits, and that a pasted currency sign or comma is rejected. No second formula block.

**Supporting content, in this order:**

1. `How is customer acquisition cost calculated?` One `[!FORMULA]` for cash CAC, CAC with founder time, and paid media CAC. Answer in the first sentence.
2. `Which costs belong in CAC?` One table for the four fields, shared costs, and founder time. Then what Stripe says to leave out: costs to serve go in gross margin, product-building costs are operating costs, and each cost is counted once.
3. `How do you split a cost that only partly wins customers?` The $9,000 and 120-of-400-hours case. Name share and headcount without a second full example.
4. `Should your own hours be included?` Add 40 hours at $75 to the usage example. Cash CAC stays $75.00. The other figure is $225.00.
5. `Why is paid media CAC a different number?` $5,000 of paid media, $3,000 of pay, $2,000 of tools, 100 new customers, 40 paid-sourced: cash CAC $100.00, paid media CAC $125.00.
6. `What if spend and new customers fall in different months?` One `[!WARNING]`. Same period pairs the two totals. Matched means the reader already assigned the costs. No hidden lag.
7. `What if there were no new paying customers?` $5,000 and a count of 0. Contrast with a typed 0 cost.
8. `What this cost does not tell you?` No benchmark, not GAAP, then the next calculators.

No article chart or marker art. The result table already lists every amount. The catalog `toolSpot` stays on the card.

### Facts, sources, and claims to avoid

- Formula, included costs, excluded support and infrastructure and research and development, new paying customers rather than trials or leads, period mismatch, and no universal CAC benchmark: [Stripe's CAC guide](https://stripe.com/resources/more/cac-in-saas), checked 2026-10-04.
- ASC 340-40 is about certain incremental contract costs, such as a commission paid only when a contract is won. It is not this cost pool: [FASB revenue TRG memo 23](https://storage.fasb.org/REVREC_TRG_Memo_23_Costs_to_Obtain_a_Contract.pdf), checked in research on 2026-10-04.
- Worked amounts come from the Product examples and the engine, not from competitor pages.
- Do not quote competitor copy, give a healthy range, call the result GAAP CAC, or say the tool verified attribution or moved spend by a sales-cycle lag.
- Interface labels and engine errors already match the states a reader sees. No wording change in this pass.
