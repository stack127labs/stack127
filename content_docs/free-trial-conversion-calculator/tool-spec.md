# Free trial conversion calculator

Route: `/free-trial-conversion-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher wants to know what share of the people who started a free trial, or signed up for a free plan, went on to pay. They also want to know if that number is any good. Usually they're deciding whether to change the trial: card or no card, length, or onboarding.

Where current results fail them (see the research's competitor reviews):

- They take "starts" and "paid" from any period. Nothing ties the paid count to the same start cohort or a fixed follow-up window, so a calendar-month ratio passes as a conversion rate.
- None of them tells you when a cohort is too young to judge. A recent cohort looks worse than it will end up.
- Most accept impossible counts. 0 starts with 1 paid gives 100%. 101 paid of 100 gives 101% and a perfect score. Negative starts are accepted.
- No-card trials, card-upfront trials, and free plans get mixed together or are labeled with bare "opt-in" and "opt-out".
- Revenue outputs call non-converters "lost revenue", round 0.5 expected customers up to a whole person, or skip annual plan normalization.
- Benchmarks are unsourced bands or a made-up health score.

What this tool does better:

1. It measures one start cohort against itself: starts, and paid within a named window counted from each person's own start.
2. It shows a visible **Complete** or **Provisional** state from the cohort's age, with the days left.
3. An optional list of cohorts compares months at the same age. The combined rate uses complete cohorts only.
4. It has three plain-word models: free trial with no card, free trial with a card upfront, and free plan.
5. It rejects impossible counts beside the field and never clamps. Zero starts gives "Not available", not 0% or 100%.
6. Optional new MRR uses one average monthly amount, or monthly and annual plans with annual ÷ 12. It leaves out one-time fees, shows ARR only as a run rate, and never mentions "lost" revenue.
7. Published figures for the chosen model come with source, date, population, and method. They're directional, with no score or grade, and the page says plainly that indie SaaS figures by model are unknown.

## Product

### Promise and scope

- **User:** an indie hacker or solo SaaS founder with a free trial or free plan, reading counts from Stripe, Paddle, Lemon Squeezy, or their own database.
- **Job:** find the trial-to-paid (or free-to-paid) rate for one or more start cohorts, know whether each one is old enough to trust, and optionally see the new MRR those customers added.
- **Answer:** a cohort conversion rate with its window and maturity state. Optionally, a per-cohort table and new MRR with ARR run rate.

In scope:

- Three models: `trialNoCard`, `trialCardRequired`, `freemium`. The math is the same for all three. The model changes the count labels and the published figures shown.
- One follow-up window in days, shared by every cohort, so cohorts are compared at the same age.
- 1 to 12 cohorts.
- New MRR from paid customers, by one average monthly amount or a monthly and annual split.
- Published figures for the selected model, from the research's dated sources.

Out of scope: forecasts or "what if the rate improves" scenarios, expected-customer estimates, churn, retention, CAC, LTV, cash collected, revenue recognition, activation, funnel attribution, rolling-window rates like Stripe's, CSV import, and saving or sharing state. Link out to `/mrr-calculator`, `/customer-acquisition-cost-calculator`, and `/customer-churn-calculator` for those jobs.

### Technical contract

**Definitions**

- A cohort is a group of accounts that started a trial (or free plan) in one period, such as a calendar month. Each account counts once.
- Paid means the account's first payment succeeded within the window, counted from that account's own start. A card on file, a pending payment, or a failed first invoice isn't paid. The engine can't check this. It takes the count as given, and the interface and article explain it.
- The follow-up window `N` is a whole number of days.
- Cohort age is the number of days from the cohort's newest start to the day the paid count was taken.

**Formulas**, all exact (bigint fractions, no floats):

- Rate = paid ÷ starts × 100.
- Didn't pay within the window = starts − paid. Never label this "lost".
- Maturity: `complete` when age ≥ `N`. Otherwise `maturing`, with `daysLeft = N − age`.
- Combined rate, with one or more cohorts:
  - If the complete cohorts have more than 0 starts in total, use only complete cohorts: `basis: "complete"`, `status: "complete"`.
  - Otherwise use every cohort: `basis: "all"`. The status is `provisional` if any cohort is maturing, else `complete`.
  - Combined rate = Σ paid ÷ Σ starts over the basis cohorts. It is not an average of the cohort rates.
  - If Σ starts is 0, the rate is `notAvailable`.
- New MRR, when on. "Paid customers" means Σ paid across **all** listed cohorts, maturing ones included, because those payments already happened.
  - `average`: MRR = paid customers × average monthly amount.
  - `split`: monthly-plan customers + annual-plan customers must equal paid customers. MRR = monthly customers × average monthly price + annual customers × average annual price ÷ 12.
  - ARR run rate = exact MRR × 12. Compute it from the exact MRR, not the rounded one.

**Rounding**

- Rates go to hundredths of a percent, half away from zero, through `roundExact` (`lib/saas-economics/unit-economics.ts`). Return `isRounded`. Return `roundedToZero` when paid > 0 but the rounded value is 0. The interface then shows `Under 0.01%`.
- Money is in cents, half away from zero, with `isRounded`.
- Counts are whole numbers and never rounded. The tool takes no fractional people and makes no expected-customer estimates.

**Units and bounds**

| Field | Parse | Range |
| --- | --- | --- |
| Starts, paid, monthly and annual customers | `parseWholeNumber` | 0 to 10,000,000 |
| Window | `parseWholeNumber` | 1 to 730 days |
| Cohort age | `parseWholeNumber` | 0 to 3,650 days |
| Money | `parseMoneyCents` | 0 to `SAAS_ECONOMICS_MAX_MONEY_CENTS` (1,000,000,000.00) |
| Cohort name | `parseOptionalLabel` | up to 40 characters, blank allowed |
| Currency | `isSaasEconomicsCurrency` | the listed currencies |

Strict text: no signs, commas, spaces inside, exponents, or currency symbols. This matches the sibling engines.

**Privacy and security:** the tool runs only in the browser. No network calls, no storage, and no URL state, because these are private business numbers. Labels render as text, never HTML.

### Backend contract

Same runtime rules as the other SaaS economics engines: strip-types safe, no enums or namespaces, explicit `.ts` imports, and no DOM, network, time, or randomness. Reuse `lib/saas-economics/shared.ts` (`parseWholeNumber`, `parseMoneyCents`, `parseOptionalLabel`, `isSaasEconomicsCurrency`, `SAAS_ECONOMICS_MAX_MONEY_CENTS`) and `lib/saas-economics/unit-economics.ts` (`exactFraction`, `addExact`, `multiplyExact`, `divideExact`, `roundExact`, `isWholeAtScale`) unchanged. No API route, script, dataset, or migration.

#### `lib/free-trial-conversion-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type ExactFraction } from "../saas-economics/unit-economics.ts";

export const TRIAL_MODELS = ["trialNoCard", "trialCardRequired", "freemium"] as const;
export type TrialModel = (typeof TRIAL_MODELS)[number];
export const TRIAL_MRR_METHODS = ["average", "split"] as const;
export type TrialMrrMethod = (typeof TRIAL_MRR_METHODS)[number];
export const TRIAL_MAX_COHORTS = 12;

export type TrialCohortInput = { label: string; starts: string; paid: string; ageDays: string };
export type TrialCohortField = keyof TrialCohortInput;
export type FreeTrialConversionInput = {
  model: string;
  windowDays: string;
  cohorts: TrialCohortInput[];
  includeMrr: boolean;
  currency: string;          // ignored when includeMrr is false
  mrrMethod: string;         // ignored when includeMrr is false
  averageMonthly: string;    // used by "average"
  monthlyCustomers: string;  // used by "split"
  monthlyPrice: string;
  annualCustomers: string;
  annualPrice: string;
};

export type TrialFieldKey =
  | "form" | "model" | "windowDays" | "cohorts"
  | `cohorts.${number}.${TrialCohortField}`
  | "currency" | "mrrMethod" | "averageMonthly"
  | "monthlyCustomers" | "monthlyPrice" | "annualCustomers" | "annualPrice";

export type TrialConversionRate =
  | { kind: "finite"; hundredths: bigint; exact: ExactFraction; isRounded: boolean; roundedToZero: boolean }
  | { kind: "notAvailable"; reason: "noStarts" };
// hundredths = percent × 100. 1322n means 13.22%. exact is the percent as a fraction.

export type TrialMaturity =
  | { status: "complete" }
  | { status: "maturing"; daysLeft: bigint };

export type TrialCohortResult = {
  index: number;             // position in the input
  label: string;             // trimmed; "" when blank. The UI shows "Cohort 1" etc.
  starts: bigint;
  paid: bigint;
  notPaid: bigint;           // starts - paid
  ageDays: bigint;
  rate: TrialConversionRate;
  maturity: TrialMaturity;
};

export type TrialCombined = {
  basis: "complete" | "all";
  status: "complete" | "provisional";
  includedIndexes: number[]; // cohorts in the basis, in input order
  excludedMaturing: number;  // maturing cohorts left out (0 when basis is "all")
  starts: bigint;            // over the basis
  paid: bigint;
  notPaid: bigint;
  rate: TrialConversionRate;
};

export type TrialNewMrr = {
  currency: SaasEconomicsCurrency;
  method: TrialMrrMethod;
  paidCustomers: bigint;               // across all cohorts
  averageMonthlyCents: bigint | null;  // "average" only
  monthlyPlan: { customers: bigint; priceCents: bigint; mrrCents: bigint } | null; // "split" only, exact
  annualPlan: { customers: bigint; annualPriceCents: bigint; mrrCents: bigint; isRounded: boolean } | null; // "split" only, ÷12 rounded
  mrrCents: bigint;                    // rounded from the exact total
  mrrIsRounded: boolean;
  runRateArrCents: bigint;             // exact MRR × 12, rounded (always whole in practice)
};

export type FreeTrialConversionValues = {
  model: TrialModel;
  windowDays: bigint;
  cohorts: TrialCohortResult[];
  combined: TrialCombined;
  newMrr: TrialNewMrr | null;
};

export type FreeTrialConversionErrors = Partial<Record<TrialFieldKey, string>>;

export type FreeTrialConversionCalculation =
  | { status: "valid"; values: FreeTrialConversionValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: FreeTrialConversionErrors };

export function calculateFreeTrialConversion(input: unknown): FreeTrialConversionCalculation;
```

The engine collects every error in one pass and never throws for user input. A non-object input, a non-array `cohorts`, a non-object cohort, or a non-boolean `includeMrr` gives `errors.form`. MRR fields are checked only when `includeMrr` is true, and only the active method's fields.

Error messages. The engine owns these strings, and the writing pass may reword them:

| Case | Key | Message |
| --- | --- | --- |
| Bad payload | `form` | `Something in the form is out of date. Reset and try again.` |
| Unknown model | `model` | `Choose one of the listed options.` |
| Window blank | `windowDays` | `Enter the follow-up window in days.` |
| Window bad or out of range | `windowDays` | `Enter whole days from 1 to 730.` |
| 0 cohorts | `cohorts` | `Add at least one cohort.` |
| More than 12 cohorts | `cohorts` | `Use up to 12 cohorts.` |
| Count starts with `-` | the field | `Counts can't be negative.` |
| Count blank | the field | `Enter a count. Use 0 if there were none.` |
| Count other bad format, such as `2.5`, `1,180`, `1e3` | the field | `Use a whole number with no commas or decimals.` |
| Count above 10,000,000 | the field | `Enter a number up to 10,000,000.` |
| Paid > starts | `cohorts.i.paid` | `Paid can't be more than starts. Count only accounts from this cohort.` |
| Age blank | `cohorts.i.ageDays` | `Enter the days since the newest start.` |
| Age bad or out of range | `cohorts.i.ageDays` | `Enter whole days from 0 to 3,650.` |
| Label too long or has control characters | `cohorts.i.label` | `Use a name up to 40 characters on one line.` |
| Unknown currency or method | that key | `Choose one of the listed options.` |
| Money blank | the field | `Enter an amount.` |
| Money bad format | the field | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | the field | `Enter an amount up to 1,000,000,000.00.` |
| Split doesn't add up | `monthlyCustomers` | `Monthly and annual customers must add up to <paid>, the paid customers above.` For example, `…add up to 156, the paid customers above.` Only when every count parsed. |

Negative numbers get their own message because the research shows competitors accepting them. Zero starts with zero paid is valid and gives `notAvailable`. Zero starts with paid > 0 is the "paid > starts" error.

#### Published figures

No engine involvement. The frontend keeps them as a typed constant in the route folder (see Ownership), copied from the research's benchmark table. They're display content, not calculation.

### Known examples

Calculated by hand. Use `trialNoCard` with MRR off unless stated.

| Inputs | Expected |
| --- | --- |
| Window `30`. One cohort: starts `1180`, paid `156`, age `45` | Rate `1322n` (13.2203…%), `isRounded: true`. `notPaid: 1024n`. Maturity `complete`. Combined: the same rate, `basis: "complete"`, `status: "complete"`. (Calclet's 13.22%.) |
| As above, MRR on, USD, `average`, `49` | Paid customers `156n`. MRR `764400n` ($7,644.00), not rounded. ARR run rate `9172800n` ($91,728.00). |
| Window `30`. One cohort: starts `100`, paid `20`, age `30` | `2000n` (20.00%). Age = window gives `complete`. The article contrasts this with the 6% calendar-month ratio (6 of the 100 paid in August). The tool doesn't compute that ratio. |
| Window `14`. One cohort: starts `200`, paid `30`, age `10` | `1500n`. Maturity `maturing`, `daysLeft: 4n`. Combined `basis: "all"`, `status: "provisional"`. |
| Window `30`. Cohorts: Jul `400`/`60`/age `75`; Aug `500`/`70`/age `45`; Sep `450`/`30`/age `10` | Rows: `1500n`; `1400n`; `667n` (6.6667%) `maturing`, `daysLeft: 20n`. Combined: `basis: "complete"`, `includedIndexes: [0, 1]`, `excludedMaturing: 1`, 130 ÷ 900 gives `1444n` (14.444…%). Not the mean of the row rates (14.50%). |
| Same three cohorts, MRR on, `average`, `20` | Paid customers `160n` (Sep included). MRR `320000n`. |
| Window `30`. Cohorts `100`/`5`/age `5` and `200`/`10`/age `12` | Rows `500n`, `500n`, both maturing. Combined `basis: "all"`, `provisional`, `500n` (5.00%) from 15 ÷ 300. Corrected by coordinator after the backend check. |
| Window `30`. Cohorts `0`/`0`/age `40` and `100`/`10`/age `5` | Row 1 `notAvailable`, `complete`. The complete starts total is 0, so the basis is `all`: `provisional`, 10 ÷ 100 gives `1000n`. |
| One cohort `0`/`0`/age `40` | Valid. Rate `notAvailable`, shown as `Not available`. Combined `notAvailable`. |
| One cohort `3`/`1` and `3`/`2` (separate runs), age ≥ window | `3333n` and `6667n`, both `isRounded: true`. |
| One cohort `1`/`1` | `10000n` (100.00%), not rounded. |
| One cohort `2000000`/`1` | `0n`, `roundedToZero: true` (exact 0.00005%). Shown as `Under 0.01%`. |
| Paid `4` total. MRR `split`: monthly `3` at `10`, annual `1` at `100` | Monthly plan `3000n`. Annual plan `833n` (exact 833.33…), `isRounded: true`. MRR `3833n` ($38.33), `mrrIsRounded: true`. ARR run rate `46000n` ($460.00), from the exact MRR. Rounding first would give $459.96. |
| Paid `156`. MRR `split`: monthly `100`, annual `50` | Error on `monthlyCustomers`: `…must add up to 156…`. |
| Paid `0`. MRR `average` `49` | MRR `0n`, valid. |
| `freemium`. Window `180`. One cohort `5000`/`150`/age `200` | `300n` (3.00%), `complete`. Same math and only the model differs. |
| Maximums: starts `10000000`, paid `10000000`, window `730`, age `3650`; MRR `average` `1000000000` | `10000n`. MRR `1000000000000000000n` cents ($10,000,000,000,000,000.00). ARR run rate twelve times that. No overflow, because everything is bigint. |
| Invalid: starts `100`, paid `101` | Error on `cohorts.0.paid`. No values. (Agents for Data and Technotize case.) |
| Invalid: starts `0`, paid `1` | Error on `cohorts.0.paid`. (Calclet's 100% case.) |
| Invalid: starts `-5` | `Counts can't be negative.` (VentriTools case.) |
| Invalid: starts `2.5`, `1,180`, `1e3`, blank; window `0`, `731`, blank; age blank, `-1`; label of 41 characters; 0 cohorts; 13 cohorts; model `optIn`; MRR on with currency `JPY`, method `blend`, average `$49`, or annual price `-1` | A field-specific error for each, under the keys above. `status: "invalid"`. Several errors in one input all come back together. |
| MRR off, with every MRR field blank or garbage | Valid. MRR fields aren't checked. |

### Ownership

Sol builds the backend:

- `lib/free-trial-conversion-calculator/engine.ts`.
- `tests/pages/free-trial-conversion-calculator/free-trial-conversion-calculator.test.mjs`, covering the examples above in the CAC test's style.
- The development tool-page preview row, with a clearly marked placeholder title, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/(saas)/free-trial-conversion-calculator/page.tsx`, `layout.tsx`, `free-trial-conversion-calculator.tsx`, `free-trial-conversion-calculator.module.css`, and `published-figures.ts`, the typed benchmark constant.
- Card art: `art/free-trial-conversion-calculator.spec.json`, `.svg`, and `.ts` through `$marker-art-draw`, a new `trialConversion` motif in `scripts/stack127/marker-art/figures.mjs`, and the key in `lib/card-art.ts`. Other agents may be editing these shared files, so check `git status` first and wait if they're touched.
- The page icon: lucide `Hourglass`.

No URL-restore wrapper. Business counts and prices don't go in the URL.

### Catalog placement

Primary and only catalog: `/saas-tools`. A founder there is working through SaaS money and growth numbers. Trial conversion is the earliest funnel step before MRR and CAC, so put it next to `/customer-acquisition-cost-calculator` and `/mrr-calculator`. The coordinator sets the final order. No secondary catalog fits. There's no growth or marketing catalog, and creating one isn't needed for this tool.

Catalog `toolSpot` key: `free-trial-conversion-calculator`. Motif name: `trialConversion`.

- Takeaway: from a group that started together, a few paid before the window closed.
- Focal subject: a short horizontal time track with three or four small ticks. A dashed vertical gate line stands near its right end, for day N. Left of the gate, a loose cluster of five or six small hollow circles sits on the track: the starters. Just past the gate, two filled `@primary` circles: the ones who paid.
- One relationship: the gate. Paid means past the line in time, not moved by an arrow.
- Tone: calm and neutral, with accent only on the two paid circles. No currency signs, numbers, cards, funnels, arrows, hourglasses, calendars, or person glyphs.
- It must read differently from `customerChurn` (four person icons with an arrow out to one), `cohortRetention` (anchored bars), and `acquisitionCost` (person on a plinth). Wordless, and legible at card size in both themes.

## Interface

### Flow

- Question: "Of the people who started in this cohort, what share paid within my window, and is the cohort old enough to trust?"
- Minimum input: model (preselected), window, and one cohort row with starts, paid, and age.
- Primary action: `Calculate conversion`.
- Lead answer: the combined conversion rate, with its Complete or Provisional state.
- Control mode: `single`. Every visible field drives the answer. `Add new MRR` is a visible checkbox that adds required fields to the main flow. The model choice changes labels and the published figures, not the math. That's documented here so the audit doesn't flag it as a no-op.

Workbench order:

1. `What people started`, a `UiChoiceGroup` with descriptions. These are plain words, never bare "opt-in/opt-out":
   - `Free trial, no card`: `They try it without entering a card.`
   - `Free trial, card upfront`: `They enter a card to start. The plan bills when the trial ends unless they cancel.`
   - `Free plan`: `They sign up for a free plan with no end date.`
2. `Follow-up window`, a narrow `UiTextField` with suffix `days`. Helper: `Days each account gets to pay, counted from its own start.`
3. `Cohorts`, a group heading with one note under it: `Count each account once. Paid means the first payment went through. A card on file isn't a payment.` Then a `UiRepeatableList` with `Add cohort` (max 12). Each row is one line on desktop:
   - `Cohort name`: optional, placeholder `Aug 2026`.
   - `Trial starts`, or `Free signups` for the free plan model.
   - `Paid within 30 days`. The number follows the window field and shows `Paid within window` while the window is blank.
   - `Cohort age`, with a `days` suffix. A longer label wrapped and pushed the input out of line.
   - The remove button.

   The age field gets one helper, on the first row only: `Days from the last start in this cohort to the day you counted.` Removing the only row clears its fields and keeps the row.
4. `Add new MRR from these customers`, a `UiCheckbox`. When on, below it in the main flow:
   - `Currency`, a narrow `UiSelect`.
   - `Price data`, a `UiChoiceGroup`: `One average amount` or `Monthly and annual plans`.
   - For average: `Average monthly price` (currency suffix). Helper: `Recurring price only. Leave out setup and other one-time fees.`
   - For split, two paired rows: `Monthly-plan customers` with `Average monthly price`, and `Annual-plan customers` with `Average annual price`. The same helper sits under the group.
5. `Calculate conversion` (primary) and a quiet `Reset`, in `UiActionRow`.
6. One divider, then the results.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Model, MRR method | `UiChoiceGroup` from `@/app/ui/controls` (option `description` carries the plain explanation) |
| Window, counts, age, name, money | `UiTextField` from `@/app/ui/controls`, with `inputMode="numeric"` for counts and days and `decimal` for money, `days` or currency-code `suffix`, and autocomplete, capitalization, and spellcheck off. `UiTextField`, not `UiNumberField`, so pasted text like `-5` or `1,180` reaches the strict parser and gets its message. |
| Cohort rows | `UiRepeatableList` from `@/app/ui/controls`, as on `/mrr-calculator` |
| Currency | `UiSelect` from `@/app/ui/controls` |
| MRR toggle | `UiCheckbox` from `@/app/ui/controls` |
| Actions | `UiActionRow` from `@/app/ui/display`, `UiButton` from `@/app/ui/controls` |
| Lead | `UiPrimaryResult` from `@/app/ui/display` |
| Maturity label | `UiStatusWord` from `@/app/ui/display`: `warning` tone for `Provisional`, `neutral` for `Complete` |
| Cohort table, published figures | `UiDataTable` from `@/app/ui/display` |
| New MRR facts | `UiKeyValueList` from `@/app/ui/display` |
| Change, reset, and failure messages | `UiStatus` from `@/app/ui/display` |

**Multi-cohort decision: build it, with the shared list.** It fits existing components: `UiRepeatableList` for input rows and `UiDataTable` for output, the same pairing `/mrr-calculator` uses. It's the clearest way to show the research's core point, that a young cohort understates its final rate. It also lets the combined rate leave maturing cohorts out instead of quietly blending them in. One row is the default, so the quick single-cohort job costs nothing extra.

**No chart.** With at most 12 rates, the table shows exact values side by side. A bar chart would draw maturing cohorts as if they were finished, and marking them differently would need a new chart feature for little gain.

**No new or improved shared component.** The row grid, paired MRR rows, and figures note are route CSS.

Tool-specific component, in the route file:

- `FreeTrialConversionCalculator`: owns the raw form state, row IDs, error mapping by `TrialFieldKey`, focus, status, and result rendering. It calls only `calculateFreeTrialConversion`. It reads `published-figures.ts` for the selected model.

### Result regions

Each region answers a different question, and no formatted value repeats.

1. **Lead.** `UiPrimaryResult`.
   - Label: `Free trial to paid` (both trial models) or `Free plan to paid`. With several cohorts, add `, complete cohorts` when `basis` is `complete`.
   - Value: `13.22%`, `Under 0.01%`, or `Not available` with no unit.
   - Detail line 1, one cohort: `156 of 1,180 trial starts paid within 30 days. 1,024 didn't.` For several cohorts: `130 of 900 starts in 2 complete cohorts paid within 30 days.`, adding `1 cohort still maturing is left out.` when `excludedMaturing` > 0. For `notAvailable`: `No starts in this cohort, so there's no rate.`
   - Detail line 2, maturity, starting with `UiStatusWord`:
     - Complete: `Complete: every account had the full 30 days.`
     - Provisional, one cohort: `Provisional: the newest starts have 4 more days. This rate can still rise.`
     - Provisional, several cohorts with basis `all`: `Provisional: no cohort has had the full 30 days yet.`
   - The tone stays `neutral`. No grade color on the number.
2. **Cohort table**, only with two or more cohorts. `UiDataTable` columns: `Cohort`, `Starts` (or `Signups`), `Paid`, `Rate`, `Status`, with numbers right-aligned. Status reads `Complete` or `20 days left`. Rows show in input order. A blank name shows `Cohort 1`. A rate of `notAvailable` shows `Not available`.
3. **New MRR**, when on. A small heading, `New MRR from these customers`, then a `UiKeyValueList`:
   - `New MRR`: `$7,644.00`.
   - `How`: `156 paid customers × $49.00`, or for split, `3 monthly × $10.00 + 1 annual × $100.00 ÷ 12`.
   - `ARR run rate`: `$460.00` with `New MRR × 12. Not revenue earned this year.`
   - When `mrrIsRounded`: `Rounded to the cent.`
   - When a maturing cohort is listed: `Includes customers from cohorts still maturing.`
4. **Published figures for this model.** A small heading, then a `UiDataTable` with columns `Source`, `Who was measured`, `Reported`. Show only the rows for the selected model:
   - ChartMogul, Growth Unhinged and ProductLed, January 2026 survey: all three models.
   - First Page Sage, updated September 2025: all three.
   - Recurly, 2022 data: both trial models. No free plan row.
   - Leave out Recurly's 2024 50% median. The research marks it as too broad.
   - Each source name links out.
   - One note line under the table: `Directional only. Each source counts conversion its own way. No dated figure was found for indie SaaS by model and follow-up window.`
   - The user's rate is never placed against these bands, scored, or colored.

### States

- **Initial.** Model `Free trial, no card`. Window blank. One blank cohort row. MRR off, with USD and `One average amount` preselected under it. No result. The published figures appear only with a result.
- **Invalid or incomplete.** Clear the old result and keep the inputs. Show one error under each invalid field. Put a list-level `cohorts` error in the list's `addDescription` slot as an error. Focus the first invalid field in reading order and add no error panel. All error fields stay visible: MRR fields only exist while the checkbox is on, and the engine only checks them then.
- **Valid.** Render the regions, focus the lead, and announce once through the focused output.
- **Zero starts.** Valid. The lead reads `Not available`. It isn't an error.
- **Provisional.** Valid. Same layout, with a warning-tone `Provisional` word and the days left.
- **Edited after a result.** Clear the result and announce once, politely: `Inputs changed. Calculate again.` Changing the model counts as an edit. Focus stays where the reader is.
- **Rows.** `Add cohort` focuses the new row's name field. At 12 rows the add button is disabled with `Up to 12 cohorts`. Removing a row focuses the next row, or `Add cohort`. Removing the only row clears it instead.
- **MRR toggle and method.** Turning it on adds fields in place, and focus stays on the checkbox. Turning it off or switching method keeps drafts.
- **Unexpected failure.** If the engine throws, keep the inputs, clear the result, and show one `UiStatus` error by the actions: `Couldn't calculate. Try again.`
- **Reset.** Restore the initial state, focus the model group, and announce `Form reset.`
- **Restored.** The clean URL never changes. A back-forward cache restore keeps the result until the next edit.
- **Long values.** `10,000,000` starts, `$10,000,000,000,000,000.00` MRR, and a 40-character cohort name fit their cells and leads without clipping. Names wrap in the table.
- **Loading, partial, and retry.** These don't apply. The calculation is synchronous and local.

### Responsive and accessible behavior

Desktop:

- Shared workbench band with a measured inner width.
- The model choices sit in one row. The window field is narrow.
- Each cohort row is a five-column grid: name, starts, paid, age, remove. The remove button is in the fixed last column. Labels repeat per row, like the MRR calculator's plan rows.
- Paired MRR fields share a row.
- Results stack full width: lead, table, MRR, figures.

Mobile (set breakpoint, as the sibling tools use):

- Model choices stack.
- Each cohort row stacks its fields in one column, in tab order. In two columns, `Paid within 30 days` wrapped and misaligned its input. The remove button stays top-right.
- Paired MRR fields stack. Buttons go full width.
- `UiDataTable` turns into labeled rows.
- No page-level horizontal overflow. Grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order follows the visual order, row by row.
- Enter in any field submits.
- Every field has a visible label. Each row is a group named `Cohort 2` (or its name), so a screen reader announces "Cohort 2, Paid within 30 days".
- Errors are tied to their fields.
- One polite live region announces changes, resets, and failures. Results are announced through the focused lead only.
- The `Provisional` meaning is in words, never only in color.

Check at desktop and mobile in both themes:

- 1,180 / 156 with average MRR `49`.
- The three-cohort example.
- The provisional single cohort.
- 0 / 0.
- 100 / 101 and `-5` errors.
- The split MRR rounding example.
- 12 rows with long names.

## Content

Plan for the writing session. The engine was run with the three-cohort example (Jul 400/60/75, Aug 500/70/45, Sep 450/30/10, window 30, average price 29): lead 14.44%, complete cohorts, Sep left out with 20 days left, 160 paid customers, new MRR $4,640.00, ARR run rate $55,680.00. A reader might misread the lead as the average of the row rates, read the maturing Sep row as a drop, or read "didn't pay" as money missed.

### Search intent and title

The searcher wants their trial-to-paid rate, and to know if it's any good. Top results take two counts from any period, accept impossible counts, and quote unsourced "good" bands. This page ties both counts to one start cohort, says when a cohort is too young, and shows dated figures with who was measured.

- Visible title: `Free trial conversion calculator: how many free trials turn into paid customers?`
- SEO title: `Free trial to paid conversion rate calculator`
- SEO description: names trial or free plan starts, a follow-up window, complete or provisional cohorts, and optional new MRR. No grade, no benchmark promise.
- Card: `Free trial conversion`, with the share of a trial cohort that paid in the window, and the new MRR.

### Reader questions

| Question | Where it's answered |
| --- | --- |
| What's my trial-to-paid rate? | Tool lead. Formula and the 6% versus 20% example in content. |
| Which counts do I enter, and from where? | Usage: cohort, paid, window, age. |
| Why does my newest month look low? | Tool `Provisional` line and table. Usage on reading the result. |
| What counts as paid? | Cohort note in the tool. Content section with the Stripe link. |
| Why doesn't this match Stripe's number? | Content: Stripe's rolling 30-day metric. |
| What's a good rate? | Content table of three dated sources by trial type, plus the in-tool figures for the chosen type. |
| Free plan or free trial? | Model choice descriptions. Content section on the longer window. |
| What MRR did they add? | Tool MRR group. Content on run rate versus revenue. |

### Outline

- **Intro.** Three sentences: what you get, what to have ready, the optional MRR.
- **Usage.** `What to enter`: trial type when unsure, the window, where the counts come from, cohort age with a date example, the MRR prices. `How to read the result`: complete and provisional, the combined rate, the cohort table, "didn't pay", new MRR. One `Example` with the three-cohort run.
- **Article.** `How is free trial conversion rate calculated?` (Formula, 6% vs 20% example). `What counts as a paid conversion?` (list). `Why doesn't this match Stripe's trial conversion rate?` `What is a good free trial conversion rate?` (table across types, sources list, note). `How is a free plan different from a free trial?` `Is new MRR the same as revenue?` with next steps.

No chart and no marker art in the article. The card art is registered.

### Left out on purpose

- Input format, ranges, and the 12-cohort limit: field errors.
- Zero starts, `Under 0.01%`, cent rounding: result text and the spec.
- Every combined-rate fallback case: the result lines say which cohorts were used.
- Card versus no-card strategy advice, activation, CAC, churn: out of scope. Linked next steps instead.

### Facts and limits

- Formula and same-cohort rule: ChartMogul trial-to-paid help article.
- Paid event and trialing to active: Stripe Subscription object. Count each account once; Recurly separates subscribers from subscriptions.
- Stripe rolling 30-day rate can exceed 100%: Stripe support article.
- Benchmarks: ChartMogul, Growth Unhinged, and ProductLed (January 2026 survey, 200 products); First Page Sage (86 clients, 2022 to 2025, updated September 2025); Recurly (2022 data, 803 sites, 22 million trials). Leave out Recurly's 2024 50% median.
- Free plan six-month window: ChartMogul 2026 report.
- MRR normalization and one-time fees: ChartMogul MRR.
- Avoid: benchmarks as targets, grades, "lost" revenue, saying card-upfront is better, an indie SaaS benchmark (unknown).

### Next steps

`/mrr-calculator`, `/customer-acquisition-cost-calculator`, `/customer-churn-calculator`.
