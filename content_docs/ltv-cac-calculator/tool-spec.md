# LTV:CAC calculator

Route: `/ltv-cac-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher wants to compare what a customer is worth with what it cost to win them. Then they want to know whether that comparison holds up: does the CAC cover the same customers and costs as the LTV, and how long until the cost comes back?

Where the current top results fail them:

- Grades decide for the reader, and they disagree. Free SaaS Metrics calls 3:1 `Healthy`, Napkin calls 5:1 `UNDERSPENDING`, and Daydream calls 9:1 `Strong`. None of them cite a source.
- Zero churn gives `$0` LTV and `0:1` on Free SaaS Metrics and Napkin, while payback still shows a number. A 101% margin goes through and earns a `Healthy` label.
- Nothing checks what the CAC covers. A paid-media-only CAC against all-customer LTV gives a flattering ratio with the same label as a full one.
- Ratio and payback are treated as one idea, or payback is missing. A customer can show 5:1 and still take two years to pay back.
- Free Biz Tools takes LTV and CAC as bare numbers and can't say what either means. Daydream turns a negative cost into a positive one.

What this tool does better:

1. Shows the LTV and the CAC behind the ratio in the same line, and names the CAC's scope in the result label.
2. Asks what the CAC includes, all acquisition costs or paid media only, and doesn't preselect an answer. A paid-media-only ratio is labeled as such.
3. Shows CAC payback in months next to the ratio, labeled as a separate measure, using the same gross profit as the LTV.
4. When LTV is modeled from churn, says whether a group of new customers ever earns back CAC under that churn. That happens only when LTV is above CAC.
5. Zero churn gives `Not estimable` for LTV and the ratio, never `0:1`. Payback, which doesn't need churn, still shows.
6. Compares a baseline with one alternative scenario, such as two channels or two cost scopes, with the difference in ratio and in payback months.
7. No grades, colored health bands, target lines, or spend advice.

## Product

### Promise and scope

The primary user is a SaaS founder or operator comparing customer value with acquisition cost for one group of customers. They either know ARPA, margin, and churn, or have an LTV figure already. They either know CAC, or know spend and new customers. The tool gives the ratio, the two amounts behind it, the payback months, and a comparison with a second scenario.

Launch scope:

- One currency, used as a label only.
- LTV from ARPA, gross margin, and customer churn on one basis (`month` or `year`), or an entered gross-profit LTV.
- CAC entered directly, or from spend and new customers.
- A required CAC scope per scenario: `allAcquisition` or `paidMedia`.
- Straight-line CAC payback in months, when LTV is modeled.
- An optional alternative scenario.

Exclusions:

- A CAC breakdown. `/customer-acquisition-cost-calculator` builds CAC from cost lines. Here the reader brings the result.
- Retention-adjusted payback month. `/cac-payback-calculator` covers it. This tool says only whether recovery ever happens under the churn.
- Payback with an entered LTV. Payback needs gross profit per month, and an entered LTV doesn't give it. Asking for ARPA and margin as well would repeat the model mode.
- A target ratio input. Even a reader's own target turns the result into a pass or fail, which the research argues against. The article explains how to think about the ratio.
- A customer-group or channel declaration. Each scenario keeps its LTV and CAC together in one fieldset, so a channel comparison is two scenarios. A label that the engine can't check adds no trust. The article explains matching.
- Discounting, cohort LTV, expansion, and basis conversion, for the reasons in the LTV spec.
- Benchmarks, grades, recommendations, URL sharing, saved scenarios, and export.

The existing `/saas-metrics-calculator` gives CAC, simple LTV, and payback, and doesn't calculate LTV:CAC at all. This tool adds the ratio, scope labels, zero-churn handling, the recovery check, either basis, and scenarios.

### Technical contract

**Fields and units.** Money is in the selected currency, per customer.

| Input | Accepted value | Notes |
| --- | --- | --- |
| Currency | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. |
| LTV source (`ltvSource`) | `model` or `direct`. Default `model`. Shared by both scenarios. | |
| Basis | `month` or `year`. Default `month`. Shared. Validated only with `model`. | Renames ARPA and churn. No conversion. |
| ARPA (`arpa`), `model` | Money `0` to `1,000,000,000.00`. | |
| Gross margin (`grossMarginPercent`), `model` | Percent `-100` to `100`, two decimals. | |
| Customer churn (`churnPercent`), `model` | Percent `0` to `100`, two decimals. | |
| LTV (`ltv`), `direct` | Money `0` to `1,000,000,000.00`. | Gross-profit LTV. Negative values aren't accepted. |
| CAC source (`cacSource`) | `direct` or `spend`. Default `direct`. Shared. | |
| CAC (`cac`), `direct` | Money `0` to `1,000,000,000.00`. | `0` is valid and gives `zeroAcquisitionCost`. |
| Spend (`acquisitionSpend`), `spend` | Money `0` to `1,000,000,000.00`. | |
| New paying customers (`newCustomers`), `spend` | Whole number `1` to `10,000,000`. | |
| CAC includes (`cacScope`) | `allAcquisition` or `paidMedia`. No default. Required per scenario. | Changes the result label. |
| Compare a second scenario | Boolean. Default off. | |

**Parsing.** Use `lib/saas-economics/shared.ts` exactly as the CAC payback and LTV specs do. Blank is never zero. Validate only active fields: model or direct LTV fields, direct or spend CAC fields, and the alternative only with compare on. Inactive drafts are ignored and keep their text.

**Exact arithmetic.** Use `lib/saas-economics/unit-economics.ts`. Round only for output.

- CAC is the exact fraction `N/d` cents: `cacCents / 1` or `spendCents / newCustomers`.
- Modeled LTV comes from `modelLtv`. Entered LTV is `ltvCents / 1`.
- Ratio is `LTV ÷ CAC`, from the exact fractions. In model mode it's `A × m × d ÷ (c × N)`.
- Payback is `straightLinePaybackMonths(CAC, periodGrossProfit, basis)`. With `year`, that's `12 × CAC ÷ yearly gross profit`, which assumes the yearly gross profit arrives evenly across 12 months.

**Ratio outcome.** The engine checks these in order:

1. CAC is exactly 0 (`N = 0`): `zeroAcquisitionCost`. This holds even if LTV is negative or not estimable. A derived CAC that's positive but rounds to `$0.00` isn't zero.
2. Modeled LTV with churn `0`: `ltvNotEstimable`.
3. LTV below 0: `negativeLtv`.
4. Otherwise: `finite`, with the ratio in hundredths, half away from zero. An LTV of exactly 0 gives `0.00`. Set `hundredthsUnderOne` when a positive exact ratio rounds to `0.00`, and the interface shows `Under 0.01:1`.

**Payback.** Only with `model`, and `null` with `direct`. Same order and outcomes as the CAC payback straight line: `zeroAcquisitionCost`, then `never` with `zeroGrossProfit` or `negativeGrossProfit`, then `finite` tenths with `tenthsUnderOne`. It doesn't depend on churn, so it's still returned at zero churn.

**Recovery under churn (`cohortRecovers`).** Only when the ratio is `finite` and LTV is modeled. Otherwise it's `null`.

- With churn below 100%, it's true when `LTV > CAC`, compared exactly as `A × m × d > c × N`. Equality is false, because the lifetime ceiling is approached and never reached.
- With churn at 100%, it's true when `LTV ≥ CAC`, because the whole LTV arrives in the first period.

This matches the CAC payback tool's retention outcome. `false` there is `never` with `churnLimit`.

**Rounding for output.**

- Money: half away from zero, to cents. Derived CAC sets `isRounded` when it isn't a whole number of cents, and `roundedToZero` when a positive value displays as `0.00`. The interface then shows `Under $0.01`.
- Ratio: hundredths, half away from zero, from the exact fractions. It's never computed from rounded LTV or CAC.
- Payback: tenths, half up, from the exact fractions.
- Differences: the alternative's rounded hundredths minus the baseline's for the ratio, and the same for payback tenths. Each exists only when both sides are `finite`.

**Action and handling.** `Calculate LTV:CAC` is the only primary action.

- A valid submit shows the results and focuses the first lead.
- An invalid submit clears any old result, keeps every raw input, puts one error under each invalid field, and focuses the first invalid field in reading order. An unanswered `CAC includes` is an error on that choice group.
- Editing any input, or changing either source, the basis, currency, scope, or compare, clears the result and announces `Inputs changed. Calculate again.`
- Reset restores the defaults, clears every draft, error, and scope choice, and focuses the LTV source choice.

**Privacy and security.** The calculation runs in the browser. Entered values never go to a server, the URL, cookies, storage, logs, or analytics. The clean URL stays unchanged. No API route, dataset, or background job.

### Backend contract

Same runtime rules as the other SaaS economics engines.

Uses `lib/saas-economics/shared.ts` and `lib/saas-economics/unit-economics.ts`, defined in the [LTV spec](../customer-lifetime-value-calculator/tool-spec.md#libsaas-economicsunit-economicsts). The LTV and LTV:CAC engines both call `modelLtv`, so the same inputs always give the same LTV in both tools. Neither changes the existing SaaS metrics or CAC payback engines.

#### `lib/ltv-cac-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type SaasPeriodBasis, type StraightLinePayback } from "../saas-economics/unit-economics.ts";

export const LTV_CAC_LTV_SOURCES = ["model", "direct"] as const;
export type LtvCacLtvSource = (typeof LTV_CAC_LTV_SOURCES)[number];
export const LTV_CAC_CAC_SOURCES = ["direct", "spend"] as const;
export type LtvCacCacSource = (typeof LTV_CAC_CAC_SOURCES)[number];
export const LTV_CAC_CAC_SCOPES = ["allAcquisition", "paidMedia"] as const;
export type LtvCacCacScope = (typeof LTV_CAC_CAC_SCOPES)[number];

export const LTV_CAC_SCENARIO_FIELDS = [
  "arpa", "grossMarginPercent", "churnPercent", "ltv",
  "cac", "acquisitionSpend", "newCustomers", "cacScope",
] as const;
export type LtvCacScenarioField = (typeof LTV_CAC_SCENARIO_FIELDS)[number];
export type LtvCacScenarioKey = "baseline" | "alternative";
export type LtvCacFieldKey =
  | "form" | "currency" | "ltvSource" | "cacSource" | "basis"
  | `${LtvCacScenarioKey}.${LtvCacScenarioField}`;

export type LtvCacScenarioInput = Record<LtvCacScenarioField, string>;
export type LtvCacInput = {
  currency: string;
  ltvSource: string;
  cacSource: string;
  basis: string;
  compare: boolean;
  baseline: LtvCacScenarioInput;
  alternative: LtvCacScenarioInput;
};

export type LtvCacMoney = { cents: bigint; roundedToZero: boolean };

export type LtvCacLtv =
  | {
      source: "model";
      arpaCents: bigint;
      grossMarginHundredths: bigint;
      churnHundredths: bigint;
      periodGrossProfit: LtvCacMoney;                    // signed
      grossProfitSign: "positive" | "zero" | "negative"; // from the exact value
      lifetimeTenths: bigint | null;                     // null at zero churn
      value: LtvCacMoney | null;                         // signed; null at zero churn
    }
  | { source: "direct"; value: LtvCacMoney };

export type LtvCacCac = {
  cents: bigint;                        // rounded; positive derived CAC can round to 0n
  isRounded: boolean;
  roundedToZero: boolean;
  isZero: boolean;                      // exact N = 0
  acquisitionSpendCents: bigint | null; // null for direct
  newCustomers: bigint | null;          // null for direct
};

export type LtvCacRatio =
  | { kind: "finite"; hundredths: bigint; hundredthsUnderOne: boolean } // >= 0n
  | { kind: "zeroAcquisitionCost" }
  | { kind: "ltvNotEstimable" }
  | { kind: "negativeLtv" };

export type LtvCacScenarioValues = {
  cacScope: LtvCacCacScope;
  ltv: LtvCacLtv;
  cac: LtvCacCac;
  ratio: LtvCacRatio;
  payback: StraightLinePayback | null; // null with direct LTV
  cohortRecovers: boolean | null;      // model and finite ratio only
};

export type LtvCacComparison = {
  /** alternative - baseline, rounded hundredths; null unless both ratios are finite. */
  ratioHundredthsDelta: bigint | null;
  /** alternative - baseline, rounded tenths; null unless both paybacks are finite. Negative means sooner. */
  paybackTenthsDelta: bigint | null;
};

export type LtvCacValues = {
  currency: SaasEconomicsCurrency;
  ltvSource: LtvCacLtvSource;
  cacSource: LtvCacCacSource;
  basis: SaasPeriodBasis | null;       // null with direct LTV
  baseline: LtvCacScenarioValues;
  alternative: LtvCacScenarioValues | null;
  comparison: LtvCacComparison | null;
};

export type LtvCacErrors = Partial<Record<LtvCacFieldKey, string>>;

export type LtvCacCalculation =
  | { status: "valid"; values: LtvCacValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: LtvCacErrors };

export function calculateLtvCac(input: unknown): LtvCacCalculation;
```

A non-object input, a missing scenario object, or a non-boolean `compare` gives `errors.form`. An unsupported currency, source, basis, or scope gives an error on that key. The engine collects every error in one pass and never throws for user input.

Error messages. The engine owns these strings, and the writing pass may reword them. `<period>` follows the LTV spec.

| Case | Message |
| --- | --- |
| Missing money | `Enter <label>.` For example, `Enter CAC.`, `Enter LTV.`, or `Enter monthly ARPA.` |
| Bad money format | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | `Enter an amount up to 1,000,000,000.00.` |
| Margin | `Enter a percent from -100 to 100, with up to two decimals.` |
| Missing churn | `Enter <period> customer churn. Use 0 if no customers left.` |
| Bad churn | `Enter a percent from 0 to 100, with up to two decimals.` |
| Customers | `Enter a whole number from 1 to 10,000,000.` |
| Scope not chosen | `Choose what this CAC includes.` |
| Bad option | `Choose one of the listed options.` |
| Form | `Something in the form is out of date. Reset and try again.` |

### Known examples

Calculated by hand with exact fractions, independent of competitor output, though several match the research results. USD, `model`, `month`, CAC `direct`, scope `allAcquisition`, compare off unless stated.

| Inputs | Expected |
| --- | --- |
| ARPA `50`, margin `80`, churn `3`, CAC `400` | LTV `$1,333.33`; ratio `3.33` (exact 3.333…); payback `10.0` months; `cohortRecovers: true`. |
| ARPA `100`, margin `80`, churn `5`, CAC `400` | LTV `$1,600.00`; ratio `4.00`; payback `5.0`. |
| ARPA `50`, margin `80`, churn `3`; spend `10000`, customers `100` | CAC `$100.00`; ratio `13.33`; payback `2.5`. |
| `year`: ARPA `24000`, margin `75`, churn `20`; spend `100000`, customers `10` | LTV `$90,000.00`; CAC `$10,000.00`; ratio `9.00`; payback `6.7` months (exact 6.666…, from `12 × 10000 ÷ 18000`). |
| `direct` LTV `10000`, CAC `2500` | Ratio `4.00`; payback `null`; `cohortRecovers: null`. |
| ARPA `99`, margin `70`, churn `6`, CAC `1200` | LTV `$1,155.00`; ratio `0.96` (exact 0.9625); payback `17.3`; `cohortRecovers: false`, matching the CAC payback churn-limit example. |
| ARPA `99`, margin `70`, churn `6`; spend `10000`, customers `7` | CAC `$1,428.57`, `isRounded: true`; ratio `0.81` (exact 0.8085); payback `20.6`; `cohortRecovers: false`. |
| ARPA `50`, margin `80`, churn `5`, CAC `800` | LTV `$800.00`; ratio `1.00`; payback `20.0`; `cohortRecovers: false`. Equality never recovers below 100% churn. |
| ARPA `50`, margin `80`, churn `100`, CAC `40` | LTV `$40.00`; ratio `1.00`; payback `1.0`; `cohortRecovers: true`. |
| ARPA `50`, margin `80`, churn `0`, CAC `400` | Ratio `ltvNotEstimable`; LTV `value: null`; payback `10.0`; `cohortRecovers: null`. |
| ARPA `50`, margin `80`, churn `3`, CAC `0` | Ratio and payback `zeroAcquisitionCost`; `cohortRecovers: null`. |
| ARPA `50`, margin `-20`, churn `5`, CAC `0` | Ratio and payback `zeroAcquisitionCost`, not `negativeLtv`. |
| ARPA `50`, margin `-20`, churn `5`, CAC `300` | LTV `-$200.00`; ratio `negativeLtv`; payback `never`, `negativeGrossProfit`. |
| ARPA `50`, margin `0`, churn `5`, CAC `300` | LTV `$0.00`; ratio `0.00`, `finite`; payback `never`, `zeroGrossProfit`; `cohortRecovers: false`. |
| ARPA `50`, margin `80`, churn `3`; spend `0.01`, customers `3` | CAC `$0.00`, `roundedToZero: true`, `isZero: false`. Ratio `400,000.00` (exact). Payback `tenths: 0`, `tenthsUnderOne: true`. Not `zeroAcquisitionCost`. |
| `direct` LTV `1`, CAC `1000000` | Ratio exact 0.000001, `hundredths: 0`, `hundredthsUnderOne: true`. |
| Compare: baseline ARPA `50`, margin `80`, churn `3`, CAC `400`, `allAcquisition`; alternative the same with CAC `150`, `paidMedia` | Baseline `3.33`, payback `10.0`. Alternative `8.89` (exact 8.888…), payback `3.8` (exact 3.75). `ratioHundredthsDelta: 556`; `paybackTenthsDelta: -62`. |
| Compare: baseline as the first row; alternative churn `0` | Alternative ratio `ltvNotEstimable`; `ratioHundredthsDelta: null`; `paybackTenthsDelta: 0`. |
| Maximum: ARPA `1000000000`, margin `100`, churn `0.01`; spend `0.01`, customers `10000000` | LTV `$10,000,000,000,000.00`; ratio `10,000,000,000,000,000,000,000.00` exactly. The interface must wrap it without clipping. |
| Invalid: `cacScope` blank or `organic`; CAC blank, `-1`, `1e3`, `$400`, `1,200`; LTV blank in `direct`; margin `101`; churn blank in `model`, or `100.01`; customers `0` or `2.5`; basis `quarter` in `model`; `ltvSource` `cohort`; currency `JPY` | A field-specific error for each; `status: "invalid"`; no values. Blank ARPA, margin, and churn in `direct` mode are valid. A blank LTV in `model` mode, an invalid basis in `direct` mode, and a blank alternative with compare off are valid. |

### Ownership

Sol builds the backend:

- `lib/saas-economics/unit-economics.ts`, defined in the LTV spec, if it isn't built yet.
- `lib/ltv-cac-calculator/engine.ts`.
- `tests/pages/ltv-cac-calculator/ltv-cac-calculator.test.mjs`, covering the examples above. Include one check that the same ARPA, margin, churn, and basis give the same LTV here as in `calculateCustomerLifetimeValue`.
- The development tool-page row, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/(saas)/ltv-cac-calculator/page.tsx`, `layout.tsx`, `ltv-cac-calculator.tsx`, and `ltv-cac-calculator.module.css`.
- `app/(site)/(tools)/(saas)/ltv-cac-calculator/art/ltv-cac-calculator.spec.json`, `.svg`, and `.ts`, generated with marker-art-draw, plus a new `toolSpot` motif in `scripts/stack127/marker-art/figures.mjs` and the registration line in `lib/tool-catalog-art.ts`. Another frontend worker currently has both shared files open, so these two edits wait until that worker is done.

No URL-restore wrapper.

### Catalog placement

Primary and only catalog: `/saas-tools`. It follows customer acquisition cost and customer lifetime value in the suggested batch order, because it uses both. CAC payback comes right after it, since the ratio and payback answer different questions. The coordinator sets the final order. No secondary catalog fits.

Catalog `toolSpot` key: `ltv-cac-calculator`. Suggested motif name: `valueToCost`.

- Takeaway: count how many acquisition costs fit inside one customer's lifetime value.
- Focal subject: one tall hatched bar standing on a baseline.
- One supporting relationship: beside it, one small solid square on the same baseline, with two dashed-outline copies of that square stacked on top. The stack reaches most of the way up the tall bar.
- Tone: calm and neutral. No numbers, colon or ratio signs, scales, checkmarks, grades, or arrows.
- It must read differently from the gross margin card, which has two equal-width columns joined by a bracket, the CAC payback staircase, and the break-even balance. The narrow repeated squares carry the difference. Keep it wordless and legible at card size in both themes.

## Interface

### Flow

- Question: "How does what a customer is worth compare with what it cost to win them, for the same customers and costs, and how long until the cost comes back?"
- Lead answer: the ratio per scenario, labeled with its CAC scope, or the reason there's no ratio.
- Primary action: `Calculate LTV:CAC`.
- Control mode: `single`. Both source choices, the basis, and the scope drive the result or its label, so they all stay visible.

Workbench order:

1. Currency, a narrow select.
2. `LTV from`, two visible choices: `ARPA, margin, and churn` and `Enter LTV`. With the first, `Basis` (`Per month`, `Per year`) sits beside it.
3. `CAC from`, two visible choices: `Enter CAC` and `From spend and new customers`.
4. The scenario fieldset, or two side by side with compare on, labeled `Baseline` and `Alternative`. Inside each:
   1. `Customer value`: ARPA, gross margin, customer churn, or the single `LTV` field.
   2. `Acquisition cost`: CAC, or spend and new customers. Then `CAC includes`, a required `UiChoiceGroup`: `All acquisition costs` or `Paid media only`, with nothing preselected.
5. One checkbox: `Compare a second scenario`.
6. `Calculate LTV:CAC` and a quiet `Reset`.
7. One divider, then the results.

Turning compare on for the first time copies the baseline's raw strings and scope into blank alternative fields. Turning it off and on again keeps the alternative drafts.

Helper lines, each preventing a likely mistake:

- At the top of each scenario: `Use the same customers for LTV and CAC.`
- Under gross margin: `After hosting, support, payment fees, and other costs to serve.`
- Under customer churn: `Use customer churn, not revenue churn.`
- Under `LTV` in direct mode: `Gross profit per customer, not revenue.`
- Under `All acquisition costs`: `Ads, sales and marketing pay, tools, and agencies.`

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Currency | `UiSelect` from `@/app/ui/controls` |
| LTV source, CAC source, basis, and CAC scope | `UiChoiceGroup` from `@/app/ui/controls`. Scope uses `required` with no initial value. |
| Money, percent, and count fields | `UiTextField` from `@/app/ui/controls`, with `inputMode="decimal"` (or `numeric` for customers), a currency-code or `%` `suffix`, and autocomplete, capitalization, and spellcheck off |
| Compare | `UiCheckbox` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, and `UiButton` from `@/app/ui/controls` |
| Leads | `UiPrimaryResult` from `@/app/ui/display` |
| How each answer is built | `UiDataTable` from `@/app/ui/display` |
| Change, reset, and failure messages | `UiStatus` from `@/app/ui/display` |

No new shared component. `UiChoiceGroup` is a controlled React Aria `RadioGroup`, so `value=""` renders with nothing selected. Never preselect a scope.

A bar comparing LTV and CAC was considered and left out. The lead already shows both amounts, and the bar would grow without limit for large ratios.

Tool-specific component, in the route file:

- `LtvCacCalculator`: owns the raw form state, error mapping by `LtvCacFieldKey`, focus, status, and the result rendering below. It calls only `calculateLtvCac`.

### Result regions

1. **Leads.** One `UiPrimaryResult` per scenario. With compare on, the two sit side by side.
   - Label: `LTV:CAC` for `allAcquisition` and `LTV to paid media CAC` for `paidMedia`. With compare on, prefix `Baseline` or `Alternative`.
   - Value: `3.33:1`, `Under 0.01:1`, or a no-ratio state with no unit. `ltvNotEstimable` gives `Not estimable`. `zeroAcquisitionCost` gives `No CAC to compare`. `negativeLtv` gives `LTV below zero`.
   - Detail line 1, the parts: `$1,333.33 LTV ÷ $400.00 CAC.` For `ltvNotEstimable`: `With 0% churn, LTV has no finite estimate in this model.` For `zeroAcquisitionCost`: `CAC is $0.00, so there's nothing to divide by.` For `negativeLtv`: `LTV is -$200.00. Each customer costs more to serve than they pay.`
   - Detail line 2, payback, in model mode: `CAC payback: 10.0 months of gross profit.` Also `Under 0.1 months`, or for `never`, `CAC payback: never, because gross profit per customer is $0.00` (or `negative`). Leave it out for `zeroAcquisitionCost`, which line 1 already explains.
   - Detail line 3, when `cohortRecovers` is false: `At this churn, a group of new customers never earns back CAC.` Say nothing when it's true or `null`.
   - Detail line 4, for `paidMedia`: `Leaves out pay, tools, agencies, and other acquisition costs.`
   - The alternative adds `5.56 higher than baseline`, `lower`, or `Same ratio as baseline`, then `Payback 6.2 months sooner`, `later`, or `Same payback`. Leave each out when its delta is `null`.
   - Tone stays `neutral`. No colors by ratio.
2. **How each answer is built.** One `UiDataTable`. Columns: `Item`, `Value` (or `Baseline` and `Alternative`). Rows, in order:
   - Model mode: ARPA, gross margin, gross profit per month (or year), customer churn, `Model lifetime`, then `LTV`.
   - Direct mode: `LTV, entered`.
   - CAC. In spend mode, add `$10,000.00 ÷ 100 customers` under the amount.
   - `CAC includes`: `All acquisition costs` or `Paid media only`.

   The ratio and payback aren't repeated in the table, because the leads hold them.
3. **Formula.** One small line under the table: `LTV:CAC = LTV ÷ CAC. Payback = CAC ÷ monthly gross profit.` With `year`: `Payback = CAC ÷ (yearly gross profit ÷ 12).` In direct mode, the payback part is left out.

### States

- **Initial.** Every value field is blank, and no scope is selected. USD, `ARPA, margin, and churn`, `Per month`, and `Enter CAC` are selected. Compare is off. No result.
- **Invalid or incomplete.** Clear the old result and keep the inputs. Show one error under each invalid field, focus the first invalid field in reading order, baseline before alternative, and add no error panel. An unanswered scope focuses its first option.
- **Valid.** Show the leads, table, and formula. Focus the first lead and announce it once through the focused output.
- **No ratio.** `Not estimable`, `No CAC to compare`, and `LTV below zero` are valid results with the same layout, not errors.
- **Edited after a result.** Clear the result and announce once, politely: `Inputs changed. Calculate again.` Focus stays where the reader is typing.
- **Source and basis changes.** Switching a source swaps the fields and keeps both sets of drafts. Switching the basis renames fields without converting. The result clears.
- **Toggle.** Turning compare on adds the alternative in place, and focus stays on the checkbox. Turning it off hides the alternative and keeps its drafts.
- **Unexpected failure.** If the engine throws, keep the inputs, clear the result, show one `UiStatus` error by the actions (`Couldn't calculate. Try again.`), and leave the button enabled.
- **Reset.** Restore the initial state, including no scope, focus the LTV source choice, and announce `Form reset.`
- **Restored.** The clean URL never changes. If the back-forward cache restores the page with a result, the next edit clears it.
- **Long values.** A ratio like `10,000,000,000,000,000,000,000.00:1` and `$10,000,000,000,000.00` must wrap inside the lead and table without clipping or page overflow. Minus signs stay visible.
- **Loading, empty, partial, and retry.** These don't apply. The calculation is synchronous and local.

### Responsive and accessible behavior

Desktop:

- Shared workbench band with a measured inner width.
- Currency, `LTV from` with basis, and `CAC from` take one or two rows as width allows.
- Scenario fields stack in one column without compare, and become two equal fieldset columns with compare. `Customer value` and `Acquisition cost` line up across columns.
- Leads side by side, with the table full width below.

Mobile:

- Stack in this order: currency, LTV source, basis, CAC source, the baseline fieldset, the alternative fieldset, the checkbox, actions, baseline lead, alternative lead, table, formula.
- `UiDataTable` turns into labeled rows.
- Buttons go full width. No page-level horizontal overflow. Grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order follows the visual order and goes through the whole baseline fieldset before the alternative.
- Enter in a field submits.
- Every field has a visible label. Fieldset legends give the context, so a screen reader announces "Alternative, Acquisition cost, CAC includes".
- The scope group is announced as required. Errors are tied to their fields.
- One polite live region announces changes, resets, and failures. Results are announced through the focused output only.

Check at desktop and mobile in both themes:

- The 50/80/3 example with CAC `400`.
- The yearly Daydream-style example.
- The ratio-below-1 example, with the never-earns-back line.
- Zero churn.
- CAC `0`.
- Compare with different scopes.
- An unanswered scope, and a pasted `$400` error.
- The maximum ratio.

---

## Content

Plan for the writing pass. The live article is the draft in `tmp/page-publishing/saas-economics-final-a/ltv-cac-calculator/`. Do not copy this plan into the page.

### Search intent and metadata direction

The reader wants lifetime value divided by acquisition cost, and they usually also ask whether 3:1 is good and how that differs from payback. The visible title starts with `LTV:CAC calculator` and asks whether the customer is worth more than they cost. The SEO title says the page compares value with acquisition cost. The description promises the ratio and separate payback months, for the same customers. The card name is `LTV to CAC`. The card description names the comparison and the months. Card art key is the exact slug `ltv-cac-calculator`.

Do not grade the ratio, tell the reader to spend more, or treat 3:1 as a pass line.

### Page promise

The reader can build gross-profit LTV from ARPA, margin, and churn, or type a gross-profit LTV. They can type a CAC or divide spend by new paying customers. They must choose `All acquisition costs` or `Paid media only`, and the lead label follows that choice. They can tell a finite ratio, `Not estimable`, `No CAC to compare`, and `LTV below zero` apart. They know straight-line payback is not the churn recovery check, direct LTV has no payback, and equal LTV and CAC does not earn the cost back unless churn is 100%.

### Content completeness map

| Reader question | Already answered by the tool | Writer's job |
| --- | --- | --- |
| How is the ratio calculated? | The lead shows LTV ÷ CAC, or a no-ratio state. The formula line is under the table. | One `[!FORMULA]` for the ratio and both payback lines. |
| Is 3:1 healthy? | No color and no grade. The example is 3.33:1. | Say Stripe and ChartMogul repeat 3:1 as a rule of thumb, and this page does not apply it or give spend advice. |
| How is payback different? | Model mode adds `CAC payback` in months. It does not use churn. Yearly mode divides yearly gross profit by 12. | Hold CAC and monthly gross profit still and change only churn: 3% is 3.33:1, 0.5% is 20.00:1, 0% is `Not estimable`. Payback stays 10.0 months. |
| When does the group never earn the cost back? | The sentence appears only when `cohortRecovers` is false. | Explain the ceiling. $800 LTV and $800 CAC at 5% churn is 1.00:1, payback 20.0 months, and the warning is on. At 100% churn, $40 against $40 earns it back in the first period. Public copy says "a group of new customers", not the engine name. |
| Why must I choose what CAC includes? | Nothing is preselected. Paid media changes the label and adds the leave-out line. | $400 all-in is 3.33:1. The same LTV against $150 of paid media is 8.89:1 and 3.8 months. The higher ratio dropped the other costs. One `[!WARNING]`. |
| When is there no ratio? | Four lead states, and direct mode omits payback. | One table. CAC of exactly 0 wins over zero churn and over a loss. A rounded `Under $0.01` CAC is not zero. |
| What has to match? | The scenario note says to use the same customers. Currency is a label. | Customer, currency, group, basis, and cost scope. Two channels are two scenarios. |
| What does this not decide? | No target input. | Not the retention-adjusted month, not a cost-line CAC, not the LTV checkpoints. Next tools include those, plus break-even MRR and the SaaS metrics snapshot. |

### Recommended outline and formats

**Introduction.** Three sentences: the comparison, payback when LTV is modeled, and what to have ready, including the required scope.

**Usage.** Heading `What to enter`. Steps for model versus entered LTV, one basis with no conversion, direct CAC versus spend, the required scope, matching customers, and compare. Say spend mode needs at least one new customer, unlike the acquisition-cost calculator's zero count. One `[!EXAMPLE]`: $50, 80%, 3%, CAC $400, all acquisition costs. LTV $1,333.33, ratio 3.33:1, payback 10.0 months. No formula block in usage.

**Supporting content:**

1. `How is LTV to CAC calculated?` Formula. Yearly payback assumes the year arrives evenly. Entered LTV drops the payback sentence.
2. `Is a 3:1 ratio a good result?` The rule of thumb and the refusal to grade. The example is only the division.
3. `How is payback different from the ratio?` The three churns on one CAC. Link the payback calculator for the month under churn.
4. `When does the model say the cost never comes back?` Equality versus 100% churn. Both the 20.0 month line and the warning can show at once.
5. `Why does the CAC choice change the label?` The $150 paid-media comparison and the warning.
6. `When is there no ratio?` The state table and a `[!NOTE]` that exact zero CAC is first.
7. `What has to match on both sides?` The five matches. Baseline and alternative.
8. `What this comparison does not decide?` No spend advice. Links to the other four batch tools and `/saas-metrics-calculator`.

No article chart or marker art. A bar of LTV against CAC would repeat the lead and break on a negative LTV. The catalog `toolSpot` stays on the card.

### Facts, sources, and claims to avoid

- The ratio is LTV ÷ CAC, and payback is a separate time measure: [ChartMogul's LTV guide](https://chartmogul.com/saas-metrics/ltv/) and [Stripe's CAC guide](https://stripe.com/resources/more/cac-in-saas).
- Stripe says there is no universal CAC benchmark, and also says SaaS businesses generally aim for 3:1, calling 1:1 breaking even and 4:1 or more highly efficient, possibly underinvesting. ChartMogul states a rule of thumb of at least 3×. Public copy names those guides and does not adopt the labels or the "spend more" reading.
- Stripe's CAC guide also says acquisition cost is sales and marketing cost divided by new customers, and that a long sales cycle can split spend from wins. Use that for the matching section.
- Numeric examples come from the Product contract and `calculateLtvCac`, including the cross-check that modeled LTV matches `calculateCustomerLifetimeValue`.
- Do not call a result healthy, strong, or underspending. Do not invent payback for direct LTV. Do not say the recovery line is an observed cohort. Do not treat LTV equal to CAC as success when churn is below 100%.
- Interface labels and engine errors need no change. `Choose what this CAC includes.` already blocks a silent scope.
