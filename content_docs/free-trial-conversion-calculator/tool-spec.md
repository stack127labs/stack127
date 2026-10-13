# Free trial conversion calculator

Route: `/free-trial-conversion-calculator`

Research: [research.md](research.md)

## People and questions

- Most users are: SaaS founders with one trial cohort in a billing dashboard or spreadsheet. They come with two counts: how many started a trial, and how many of them paid. They know offhand whether people enter a card to start.
- Their top questions:
  - "What percentage of trial users paid?"
  - "Is 3 out of 160 bad?"
  - "How much more MRR would 5% or 10% bring?"
- Basic answers them with: trial type (`No card`, `Card upfront`, `Free plan`), trial starts, and paid. That's enough for the rate, how sure it is at this sample size, and where it sits next to the one published range that measures the same thing for that trial type.
- Advanced holds, for growth leads and founders who track more than two counts:
  - **Follow-up window and cohort age**, because a cohort that hasn't had the full window yet understates its final rate. ChartMogul's rates change after the signup month, and no competitor marks a young cohort. The old tool had both.
  - **Activated trials**, for growth leads who ask where the funnel loses people. Right Left and Kalkulero both have it, and it splits one rate into two places to work on.
  - **Revenue**: currency, monthly plan price, annual plan price, and how many paid accounts chose annual. All six competitors model revenue, and "how much MRR" is a top question. The old tool had the monthly and annual split.
  - **Target conversion**, for "how much more would 10% bring". VentriTools and CalcBee have it. The result adds the extra paid accounts and extra MRR.
  - **Other cohorts**, up to 12, each with a name, starts, paid, and age. Pros ask whether the rate holds by month, channel, plan, or trial type. The old tool had a cohort list and a combined rate that leaves young cohorts out.
- Left out:
  - **Retention, churn, CAC, and LTV.** A first payment isn't a kept customer, and modeling churn here would make one rate look like lifetime value. `/customer-churn-calculator`, `/customer-acquisition-cost-calculator`, and `/customer-lifetime-value-calculator` do those jobs with the inputs they need.
  - **Visitor-to-trial conversion and ad budget** (Kalkulero). It's a different funnel step with different counts, and it would turn this into a marketing planner.
  - **A health score or grade.** Niches differ, and the research shows every competitor's grade is unsourced or contradicts its own math.
  - **Trial length as an input.** It doesn't change the rate. The follow-up window is what changes the answer, and it's in Advanced.
- Example values it opens with: `No card`, 500 trial starts, 40 paid. That's 8%, between ChartMogul's no-card median (4 to 6%) and top quarter (10 to 15%), so the first comparison doesn't flatter or alarm. Competitors open on similar sizes (500 at Agents for Data and SaaSPriceLab).
- Published comparison: yes, for all three types. ChartMogul's January 2026 survey gives median and top-quarter bands for no-card trials, card-upfront trials, and free plans with a regular signup, for paid within six months. It's the only source that splits by trial type with a stated window. First Page Sage has no fixed window, Recurly counts subscriptions across consumer sites, and ChartMogul's 3% help-center median has no sample or window, so they go in the article, not the result. The research missed the free plan bands; the writing round found them in the same report and added them. The ranges count paid within six months, so they show only when the follow-up window is 180 to 184 days, or isn't set. With no window, the band labels name the six months, so the reader sees what they measure. Any other window shows no range and says so.
- Domain limits:
  - Paid can't exceed trial starts in one cohort. That's an error, never a clamp or a rate above 100%.
  - Zero starts has no rate. The answer reads `—` with `No trial starts`, not 0%.
  - A rate under 0.01% shows `Under 0.01%`, not `0%`.
  - A cohort younger than its window is `Provisional`, with the days left. Its rate can still rise.
  - A target at or below the current rate adds 0 paid accounts. It never shows a negative.

## Why people will choose this tool

The searcher is deciding whether their trial is working, and usually whether to change it: card or no card, onboarding, or pricing. Where the top results fail them:

- Most accept impossible counts. 120 paid from 100 starts gives 120% and a "Top 25%" label at Agents for Data, CalcBee, and VentriTools. Kalkulero quietly clamps it. Right Left rejects it but leaves the old result on screen as if it were accepted.
- They grade one number against unsourced bands, with no trial type or window, and SaaSPriceLab hides its bands behind a paid report.
- None says how much to trust a rate from 42 trials, which is exactly what r/SaaS commenters argue about.
- None marks a young cohort, so a recent month looks worse than it will end up.
- Revenue outputs call MRR × 12 "annual revenue" and don't say it's a run rate.

What this tool does better:

1. The answer comes with its counts, `40 of 500 trial starts paid`, so you can check you divided the right numbers.
2. A likely range at your sample size, drawn on the same scale as the published range. 30 of 42 is 71%, but anywhere from about 56% to 83% is plausible.
3. One dated, named comparison that matches your trial type and window, shown as position only. No grades, no colors that judge.
4. Impossible counts get a field error, and the last good result steps back instead of pretending.
5. `Provisional, 18 days left` when the cohort is too young, and a combined rate across cohorts that leaves young ones out.
6. New MRR and ARR run rate labeled for what they are, with annual plans counted as a twelfth a month.

## Product

### Promise and scope

- **Primary user:** a SaaS founder with counts for one trial cohort.
- **Main job:** find the share of trial starts that paid, see how sure that is, and see it next to a matching published range.
- **Delivered answer:** the conversion rate with its counts, a likely range, a 100-unit picture, and, from Advanced, maturity, an activation funnel, new MRR, a target scenario, and a cohort comparison.
- **Launch scope:** everything in this spec. One calculation runs in the browser. No network, storage, or account.
- **Exclusions:** see "Left out" above. Also no CSV import, no Stripe connection, no rolling-window rates like Stripe's 30-day metric, and no expected-customer fractions.

### Technical contract

**Definitions**

- A cohort is a group of accounts that started a trial, or signed up for a free plan, in one period. Each account counts once.
- Paid means the account's first payment went through. The engine takes the count as given. The hint and article say a card on file isn't a payment.
- The follow-up window is the days each account had to pay, counted from its own start.
- Cohort age is the days from the cohort's last start to the day the paid count was taken.
- Activated means the start reached the person's own activation event. The funnel is nested: activated includes everyone who paid.

**Inputs, parsing, and bounds**

Every value arrives as a string from a text field. Strict parsing, as in the sibling SaaS engines: no signs, commas, spaces inside, exponents, or currency symbols. Leading and trailing spaces are trimmed.

| Field | Parser | Range | Empty means |
| --- | --- | --- | --- |
| `trialType` | one of `noCard`, `cardUpfront`, `freePlan` | | error |
| `starts`, `paid` | `parseWholeNumber` | 0 to 10,000,000 | error |
| `windowDays` | `parseWholeNumber` | 1 to 730 | no window: maturity unknown |
| `ageDays` | `parseWholeNumber` | 0 to 3,650 | maturity unknown |
| `activated` | `parseWholeNumber` | 0 to 10,000,000 | no funnel |
| `targetRate` | `parsePercentHundredths` | 0.01 to 100 | no target |
| `currency` | `isSaasEconomicsCurrency` | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD` | `USD` |
| `monthlyPrice`, `annualPrice` | `parseMoneyCents` | 0 to `SAAS_ECONOMICS_MAX_MONEY_CENTS` | not used |
| `annualAccounts` | `parseWholeNumber` | 0 to 10,000,000 | see revenue rules |
| cohort `name` | `parseOptionalLabel` | up to 40 characters | `Cohort 2`, `Cohort 3`, by list position + 1 |
| cohort `starts`, `paid` | `parseWholeNumber` | 0 to 10,000,000 | error, unless the whole row is blank |
| cohort `ageDays` | `parseWholeNumber` | 0 to 3,650 | maturity unknown |
| `cohorts` | array | up to 12 rows | no comparison |

A cohort row with every field blank is ignored. It isn't an error.

**Formulas.** Exact bigint fractions through `lib/saas-economics/unit-economics.ts`, except the likely range.

- Rate = paid ÷ starts × 100. Rounded to hundredths of a percent, half away from zero. `roundedToZero` when paid > 0 and the rounded value is 0.
- Not paid = starts − paid.
- Trials per paying customer = starts ÷ paid, rounded to tenths. None when paid is 0.
- Likely range: the 95% Wilson score interval, z = 1.96, in floating point. Low rounds down and high rounds up to hundredths of a percent, so the range always contains the true interval. None when starts is 0.
  - `p = paid / starts`, `n = starts`, `d = 1 + z²/n`, `c = p + z²/(2n)`, `s = z × √(p(1 − p)/n + z²/(4n²))`, low = (c − s) / d, high = (c + s) / d.
- Maturity, when both window and age are set: `complete` when age ≥ window, otherwise `provisional` with `daysLeft = window − age`. Otherwise `unknown`.
- Activation, when `activated` is set: activation rate = activated ÷ starts. Activated to paid = paid ÷ activated. Each is a rate as above, or none when its denominator is 0.
- Revenue, when either price is set. The per-account monthly amount:
  - Monthly price only: every paid account at the monthly price.
  - Annual price only: every paid account at annual price ÷ 12.
  - Both: `annualAccounts` on annual price ÷ 12, the rest on the monthly price.
  - New MRR = the sum, exact, then rounded to cents half away from zero. ARR run rate = exact MRR × 12, rounded to cents. Never round MRR first.
- Target, when `targetRate` is set:
  - Paid at target = ceil(target ÷ 100 × starts). Whole accounts, rounded up, because reaching the target takes a whole extra account. 9 of 99 is 9.09%, and 10% needs 10 paid, so 1 extra.
  - Extra paid = max(0, paid at target − paid).
  - Extra MRR, when revenue is set = extra paid × MRR per paid account, rounded to cents. MRR per paid account = exact MRR ÷ paid when paid > 0. When paid is 0, it's the monthly price if set, else annual price ÷ 12.
- Cohorts, when at least one row is filled. The Basic cohort is index 0, named `This cohort`. Each row gets its own rate, maturity (the shared window with its own age), and likely range.
  - Combined: if the non-provisional cohorts have more than 0 starts in total, use only those: `basis: "settled"`. Otherwise use all: `basis: "all"`.
  - Combined rate = Σ paid ÷ Σ starts over the basis cohorts. It is not an average of the row rates.
  - `status` is `provisional` if any basis cohort is provisional, else `complete` if every basis cohort is complete, else `unknown`.

**Invalid, unknown, and partial results**

- Basic errors (trial type, starts, paid, paid > starts) make the whole calculation invalid. No values come back.
- Advanced errors hide only the part they feed. The calculation stays valid, that part is `null`, and its errors come back alongside:
  - Window or age error: `maturity` is `unknown`, and cohort maturities are `unknown`.
  - Activated error: `activation` is `null`.
  - Revenue error: `revenue` is `null`, and `target.extraMrrCents` is `null`.
  - Target error: `target` is `null`.
  - Any cohort row error: `cohorts` is `null`.
- An age, on the Basic cohort or any row, with no window is an error on `windowDays`.
- A window alone is valid. It names the window in the result, and maturity stays `unknown`.

**Privacy and security:** the calculation runs in the browser. No network calls and no storage. The URL holds inputs only after the person presses `Copy link`. Cohort names render as text, never HTML.

### Backend contract

Same runtime rules as the other SaaS engines: strip-types safe, no enums or namespaces, explicit `.ts` imports, and no DOM, network, time, or randomness. Reuse `lib/saas-economics/shared.ts` and `lib/saas-economics/unit-economics.ts` unchanged. No API route, script, dataset, or migration.

#### `lib/free-trial-conversion-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type ExactFraction } from "../saas-economics/unit-economics.ts";

export const TRIAL_TYPES = ["noCard", "cardUpfront", "freePlan"] as const;
export type TrialType = (typeof TRIAL_TYPES)[number];
export const TRIAL_MAX_COHORTS = 12;

export type TrialCohortRowInput = { id: string; name: string; starts: string; paid: string; ageDays: string };
export type FreeTrialInput = {
  trialType: string;
  starts: string;
  paid: string;
  windowDays: string;
  ageDays: string;
  activated: string;
  targetRate: string;
  currency: string;
  monthlyPrice: string;
  annualPrice: string;
  annualAccounts: string;
  cohorts: TrialCohortRowInput[];
};

/** The example the tool opens with and Reset returns to. */
export const FREE_TRIAL_EXAMPLE_INPUT: FreeTrialInput; // noCard, 500, 40, every other field "", currency "USD", cohorts []

export type TrialFieldKey =
  | "form" | "trialType" | "starts" | "paid"
  | "windowDays" | "ageDays" | "activated" | "targetRate"
  | "currency" | "monthlyPrice" | "annualPrice" | "annualAccounts"
  | "cohorts" | `cohorts.${number}.${"name" | "starts" | "paid" | "ageDays"}`;
// Row keys use the row's position in the input array, blank rows included.

export type TrialRate =
  | { kind: "rate"; hundredths: bigint; exact: ExactFraction; isRounded: boolean; roundedToZero: boolean }
  | { kind: "none" };
// hundredths = percent × 100. 800n is 8%.

export type TrialLikelyRange = { lowHundredths: bigint; highHundredths: bigint } | null;

export type TrialMaturity =
  | { status: "complete" }
  | { status: "provisional"; daysLeft: bigint }
  | { status: "unknown" };

export type TrialCohortResult = {
  inputIndex: number | null; // null for the Basic cohort, else the row's index in input.cohorts
  name: string;              // "This cohort", the trimmed name, or "Cohort N"
  starts: bigint;
  paid: bigint;
  rate: TrialRate;
  likely: TrialLikelyRange;
  maturity: TrialMaturity;
};

export type FreeTrialValues = {
  trialType: TrialType;
  starts: bigint;
  paid: bigint;
  notPaid: bigint;
  rate: TrialRate;
  likely: TrialLikelyRange;
  trialsPerPaidTenths: bigint | null;
  windowDays: bigint | null;
  maturity: TrialMaturity;
  activation: { activated: bigint; activationRate: TrialRate; activatedToPaid: TrialRate } | null;
  revenue: {
    currency: SaasEconomicsCurrency;
    monthlyAccounts: bigint;
    annualAccounts: bigint;
    mrrCents: bigint;
    mrrIsRounded: boolean;
    arrRunRateCents: bigint;
  } | null;
  target: {
    hundredths: bigint;
    paidAtTarget: bigint;
    extraPaid: bigint;
    extraMrrCents: bigint | null; // null when revenue isn't set or has an error
  } | null;
  cohorts: {
    rows: TrialCohortResult[]; // Basic cohort first, then filled rows in input order
    combined: {
      basis: "settled" | "all";
      status: "complete" | "provisional" | "unknown";
      leftOut: number;          // provisional cohorts left out (0 when basis is "all")
      starts: bigint;
      paid: bigint;
      rate: TrialRate;
    };
  } | null;
};

export type FreeTrialErrors = Partial<Record<TrialFieldKey, string>>;

export type FreeTrialCalculation =
  | { status: "valid"; values: FreeTrialValues; errors: FreeTrialErrors } // errors only for Advanced parts
  | { status: "invalid"; values: null; errors: FreeTrialErrors };

export function calculateFreeTrialConversion(input: unknown): FreeTrialCalculation;

/** Share link values. Empty fields stay out. */
export function freeTrialShareParams(input: FreeTrialInput): Record<string, string>;
/** Rebuilds the input from a shared link. Missing keys fall back to the example for Basic fields and "" for the rest. Bad values pass through as text, so the engine reports them as field errors. */
export function freeTrialInputFromQuery(get: (key: string) => string): FreeTrialInput;
```

The engine collects every error in one pass and never throws for user input. A non-object input or a non-array `cohorts` gives `errors.form` and `status: "invalid"`.

Share link keys: `type`, `starts`, `paid`, `window`, `age`, `activated`, `target`, `currency`, `monthly`, `annual`, `annualPaid`, and `cohorts`. `cohorts` holds the filled rows as `name~starts~paid~age`, joined by `|`. `~` and `|` are removed from names. `currency` goes in only when a price is set. More than 12 rows in a link keeps the first 12. Row IDs are made fresh on read, such as `shared-0`.

Error messages. The engine owns these, and the writing pass may reword them:

| Case | Key | Message |
| --- | --- | --- |
| Bad payload | `form` | `Something in the form is out of date. Reset and try again.` |
| Unknown trial type, currency | that key | `Choose one of the listed options.` |
| Starts or paid blank | the field | `Enter a count. Use 0 if there were none.` |
| Any count starts with `-` | the field | `Counts can't be negative.` |
| Any count in another bad format, such as `2.5`, `1,180`, `1e3` | the field | `Use a whole number with no commas or decimals.` |
| Any count above 10,000,000 | the field | `Enter a number up to 10,000,000.` |
| Paid > starts | `paid` | `Paid can't be more than trial starts. Count only accounts from this cohort.` |
| Window bad or out of range | `windowDays` | `Enter whole days from 1 to 730.` |
| Age, here or in any row, with no window | `windowDays` | `Enter the follow-up window to compare cohort age against.` |
| Age bad or out of range | the field | `Enter whole days from 0 to 3,650.` |
| Activated > starts | `activated` | `Activated can't be more than trial starts.` |
| Paid > activated | `activated` | `Activated must include everyone who paid, so it can't be less than <paid>.` |
| Target bad or out of range | `targetRate` | `Enter a rate from 0.01 to 100%.` |
| Money bad format | the field | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | the field | `Enter an amount up to 1,000,000,000.00.` |
| `annualAccounts` set without both prices | `annualAccounts` | `Enter a monthly and an annual price to split paid accounts by plan.` |
| Both prices set, `annualAccounts` blank | `annualAccounts` | `Enter how many paid accounts are on annual plans.` |
| `annualAccounts` > paid | `annualAccounts` | `Annual accounts can't be more than <paid>, the paid count.` |
| Row with starts or paid blank, other fields filled | the field | `Enter a count. Use 0 if there were none.` |
| Row paid > row starts | `cohorts.i.paid` | `Paid can't be more than starts in this cohort.` |
| Row name too long or has control characters | `cohorts.i.name` | `Use a name up to 40 characters on one line.` |
| More than 12 rows | `cohorts` | `Use up to 12 other cohorts.` |

### Known examples

Calculated by hand. `noCard`, Advanced empty, unless stated. Likely ranges were checked with the Wilson formula above.

| Inputs | Expected |
| --- | --- |
| The example: 500 starts, 40 paid | Rate `800n` (8%), not rounded. Not paid `460n`. Trials per paying customer `125n` (12.5). Likely `592n` to `1072n` (exact 5.9298% to 10.7107%). Maturity `unknown`. Everything else `null`. |
| 160 / 3 | `188n` (1.875%), `isRounded`. Likely `63n` to `537n` (0.6397% to 5.3671%). Trials per paying customer `533n` (53.3). |
| 42 / 30 | `7143n` (71.428…%). Likely `5643n` to `8284n` (56.4325% to 82.8331%). Trials per paying customer `14n` (1.4). |
| 1,180 / 156 | `1322n`. Likely `1140n` to `1528n`. |
| 50 / 0 | `0n`, not `roundedToZero`. Likely `0n` to `714n` (7.1350%). Trials per paying customer `null`. |
| 50 / 50 | `10000n`. Likely `9286n` to `10000n`. Trials per paying customer `10n` (1.0). |
| 2,000,000 / 1 | `0n`, `roundedToZero: true` (exact 0.00005%). Likely `0n` to `1n`. Shown as `Under 0.01%`. |
| 0 / 0 | Valid. Rate `none`, likely `null`, not paid `0n`, trials per paying customer `null`. |
| 500 / 40, window `30`, age `45` | Maturity `complete`. |
| 500 / 40, window `30`, age `30` | `complete`. Age equal to the window is complete. |
| 500 / 40, window `30`, age `12` | `provisional`, `daysLeft: 18n`. |
| 500 / 40, window `30` only | Valid. `windowDays: 30n`, maturity `unknown`. |
| 500 / 40, activated `200` | Activation rate `4000n` (40%). Activated to paid `2000n` (20%). |
| 500 / 0, activated `0` | Activation rate `0n`. Activated to paid `none`. |
| 500 / 40, monthly `29` | 40 monthly accounts. MRR `116000n` ($1,160.00), not rounded. ARR run rate `1392000n` ($13,920.00). |
| 500 / 40, annual `290` | 40 annual accounts. MRR `96667n` ($966.67, exact 966.666…), `mrrIsRounded`. ARR run rate `1160000n` ($11,600.00) from the exact MRR. |
| 500 / 40, monthly `29`, annual `290`, annual accounts `10` | 30 monthly, 10 annual. MRR `111167n` ($1,111.67, exact 1,111.666…), `mrrIsRounded`. ARR run rate `1334000n` ($13,340.00). Rounding MRR first would give $13,340.04. |
| 500 / 40, target `10` | Paid at target `50n`. Extra paid `10n`. Extra MRR `null`. |
| 500 / 40, target `10`, monthly `29` | Extra MRR `29000n` ($290.00). |
| 500 / 40, target `10`, monthly `29`, annual `290`, annual accounts `10` | Extra MRR = 10 × 1,111.666… ÷ 40 = 277.916… → `27792n` ($277.92). |
| 333 / 20, target `7.5` | Paid at target = ceil(24.975) = `25n`. Extra paid `5n`. |
| 99 / 9, target `10` | Paid at target = ceil(9.9) = `10n`. Extra paid `1n`. |
| 500 / 40, target `5` | Paid at target `25n`. Extra paid `0n`, never negative. |
| 500 / 0, target `10`, monthly `29` | Extra paid `50n`. Extra MRR `145000n` ($1,450.00), priced at the monthly price because paid is 0. |
| 500 / 40, window `30`, age `45`. Rows: `Jul` 400 / 36 / age 75; `Sep` 450 / 18 / age 10 | Rows: This cohort `800n` complete; Jul `900n` complete; Sep `400n` provisional, `daysLeft: 20n`. Combined `basis: "settled"`, `status: "complete"`, `leftOut: 1`, 76 ÷ 900 → `844n` (8.444…%). Not the mean of the settled rows (8.5%). |
| 500 / 40, window `30`, age `5`. Row: `Aug` 300 / 17 / age 8 | Both provisional. Combined `basis: "all"`, `status: "provisional"`, 57 ÷ 800 → `713n` (7.125%). |
| 500 / 40, no window. Row: blank name, 300 / 17, no age | Row name `Cohort 2`, rate `567n`. Both `unknown`. Combined `basis: "settled"`, `status: "unknown"`, 57 ÷ 800 → `713n`. |
| 500 / 40. Rows: one fully blank row | Valid. Blank row ignored. `cohorts` is `null`. |
| Maximums: 10,000,000 / 10,000,000, monthly `1000000000`, target `100` | Rate `10000n`. MRR $10,000,000,000,000,000.00. No overflow. |
| Invalid: starts `100`, paid `120` | `status: "invalid"`, error on `paid`. |
| Invalid: starts `0`, paid `1` | Error on `paid`. |
| Invalid: starts `-5`; `2.5`; `1,180`; `1e3`; blank | The count messages above, on `starts`. |
| Partial: 500 / 40, activated `30` | Valid. Rate `800n` and the rest as normal. `activation: null`. Error on `activated`: `…can't be less than 40.` |
| Partial: 500 / 40, age `20`, no window | Valid. Maturity `unknown`. Error on `windowDays`. |
| Partial: 500 / 40, monthly `$29` | Valid. `revenue: null`. Error on `monthlyPrice`. |
| Partial: 500 / 40, monthly `29`, annual accounts `5` | Valid. `revenue: null`. Error on `annualAccounts`. |
| Partial: 500 / 40, row `Sep` 100 / 120 | Valid. `cohorts: null`. Error on `cohorts.0.paid`. |
| Partial: target `0`, `101`, `abc` | Valid. `target: null`. Error on `targetRate`. |
| Share round trip: the cohort example, with the Sep row named `Sep~\|26` | `freeTrialShareParams` gives `type=noCard`, `starts=500`, `paid=40`, `window=30`, `age=45`, and `cohorts=Jul~400~36~75\|Sep26~450~18~10`. No empty keys. Reading it back gives the same input, with the name `Sep26` and fresh row IDs. |

### Ownership

Sol builds the backend:

- `lib/free-trial-conversion-calculator/engine.ts`.
- `tests/pages/free-trial-conversion-calculator/free-trial-conversion-calculator.test.mjs`, covering the examples above in the style of the other SaaS engine tests.
- The development tool-page row needs no change. It already exists.

Opus builds the frontend:

- `app/(site)/(tools)/free-trial-conversion-calculator/page.tsx`. Keep `layout.tsx` as it is.
- `free-trial-conversion-calculator.tsx`, the client tool. It calls only the engine contract.
- `free-trial-conversion-calculator-from-url.tsx`, the `useInitialQuery()` wrapper, as on `dns-lookup`.
- `free-trial-conversion-calculator.module.css`, for the result's two-column top only.
- `published-figures.ts`, the typed ChartMogul bands for the comparison.
- `content/intro.mdx`, `content/usage.mdx`, and `content/article.mdx`, in the writing round.
- Check that `lib/registered-site-pages.json` lists the route again once `page.tsx` exists.
- Card art already exists and stays: `art/free-trial-conversion-calculator.*`, motif `trialConversion`, registered in `lib/card-art.ts`.

Shared components improved during planning (Opus, done in this round): `UiRangeMarker` and `UiUnitGrid`. See Components.

### Catalog placement

Primary and only catalog: `/saas-tools`. A founder there is working through SaaS money and growth numbers, and trial conversion is the funnel step before MRR and CAC. Place it near `/mrr-calculator` and `/customer-acquisition-cost-calculator`. The coordinator confirms the development row's membership during integration. No secondary catalog fits.

Card art: keep the existing `toolSpot`, key `free-trial-conversion-calculator`, motif `trialConversion`. Its takeaway still fits: from a group that started together, a few paid before the window closed. A dashed gate line on a short time track, hollow starter circles before it, and two filled circles past it. No words, numbers, cards, funnels, or person glyphs. Recheck it at card size in both themes during the frontend round, and redraw only if it fails.

## Interface

### Flow

- Question: "What share of my trial starts paid, how sure is that, and how does it compare?"
- Lead answer: the conversion rate, large, with `40 of 500 trial starts paid` under it.
- Example values it opens with: `No card`, 500 trial starts, 40 paid, Advanced empty. The result shows 8%, marked `Example`.
- Button: `Calculate conversion`, with a quiet `Reset` beside it.

### Inputs

| Input | Basic or Advanced | Required or optional | Hint, one sentence or none | What it changes in the result |
| --- | --- | --- | --- | --- |
| `Trial type`: `No card`, `Card upfront`, `Free plan` | Basic | Required, `No card` selected | `Card upfront means people enter payment details to start the trial.` | The lead label and count words, and which published range shows. |
| `Trial starts`, or `Free signups` for `Free plan` | Basic | Required | `Everyone who started in one period, such as August, counting each account once.` | Every number in the result. |
| `Paid` | Basic | Required | `Accounts from those starts whose first payment went through. A card on file isn't a payment.` | Every number in the result. |
| `Follow-up window`, suffix `days` | Advanced | Optional | `Days each account had to pay, counted from its own start.` | The detail line reads `paid within 30 days`. With age, the `Complete` or `Provisional` status, and the cohort chart labels. |
| `Cohort age`, suffix `days` | Advanced | Optional, needs the window | `Days from this cohort's last start to the day you counted paid.` | `Complete`, or `Provisional` with the days left. |
| `Activated` | Advanced | Optional | `Starts that reached your activation event, such as a first project, including everyone who paid.` | Adds the funnel chart with activation and activated-to-paid rates. |
| `Target conversion`, suffix `%` | Advanced | Optional | `The conversion rate you're aiming for.` | Adds `Extra paid at 10%` and, with a price, `Extra MRR at 10%`. Outlines the target units in the grid. |
| `Currency` | Advanced | Optional, `USD` selected | none | The currency of every money value. |
| `Monthly price`, currency suffix | Advanced | Optional | `Average monthly plan price for a new customer, without one-time fees.` | Adds `New MRR` and `ARR run rate`. Prices `Extra MRR`. |
| `Annual price`, currency suffix | Advanced | Optional | `Average yearly plan price, which counts as a twelfth each month.` | Same as monthly price. |
| `On annual plans` | Advanced | Optional, required when both prices are set | `How many of the paid accounts chose a yearly plan.` | Splits paid accounts between the two prices. |
| `Other cohorts` rows: `Name`, `Trial starts`, `Paid`, `Age` (`days`) | Advanced | Optional. Starts and paid are required in a filled row | On the list: `Earlier months, channels, or plans, each with its own accounts.` | Adds the cohort chart and the `All cohorts` rate. |

Advanced is one `UiDisclosure` named `Window, activation, revenue, and cohorts`, closed, with `uiSetSummary(count)`. The count is every filled field, plus one per filled cohort row. Currency counts only when a price is set.

Cut: a separate `Trial length` field (it changes nothing the window doesn't), a monthly-customers count (derived from paid minus annual), and per-row trial type (put different trial types in separate runs or name the row).

### Result

Everything here comes from the person's inputs. Sources, method notes, and definitions go in the article.

1. **The answer.** `UiPrimaryResult`, label `Trial to paid`, or `Free signup to paid`. Value `8%`, with hundredths when needed (`13.22%`, `1.88%`) and trailing zeros trimmed. Detail: `40 of 500 trial starts paid`, adding `within 30 days` when the window is set. Under it, a `UiStatusWord`:
   - `Example` until the person calculates.
   - `Complete` when the cohort has had the full window.
   - `Provisional` with `18 days left`, warning tone. The rate can still rise.
   - Nothing when maturity is unknown.
2. **The picture.** `UiUnitGrid`, 10 × 10, beside the answer. Filled units are the paid share of every 100 starts, in the first data color. With a target, outlined units run from the rate up to the target. Legend: `Paid`, `Didn't pay`, and `At 10%`. It makes 2 of 100 feel like 2 of 100, which a percentage doesn't.
3. **Supporting numbers.** `UiMetricGroup` under the answer, in the same column:
   - `Didn't pay`: `460`.
   - `Trials per paying customer`: `12.5`, hint `How many trial starts it took, on average, for each one that paid.`
   - With a price: `New MRR` `$1,160.00`, hint `Paid accounts × their monthly amount, with annual plans as a twelfth.` And `ARR run rate` `$13,920.00`, hint `New MRR × 12. It isn't revenue earned this year, and it doesn't count churn.`
   - With a target: `Extra paid at 10%` `10`, and with a price `Extra MRR at 10%` `$290.00`.
   - With other cohorts: `All cohorts` `8.44%`, hint naming what's in it, such as `76 of 900 starts in complete cohorts. Sep is left out until it has 30 days.`
4. **Comparison and likely range.** `UiRangeMarker`, full width. The track shows ChartMogul's two bands for the chosen trial type, the `You` marker at the rate, and a likely-range bar under the marker:
   - The bands show only when the follow-up window is 180 to 184 days (six months), or isn't set. Any other window draws the marker and likely range alone, with the status word `No published range for a 30-day window` under it.
   - `No card`: `No-card median, paid within 6 months` 4 to 6%, and `No-card top quarter, paid within 6 months` 10 to 15%. Scale 0 to 30%.
   - `Card upfront`: `Card-upfront median, paid within 6 months` 25 to 35%, and `Card-upfront top quarter, paid within 6 months` 50 to 60%. Scale 0 to 80%.
   - `Free plan`: `Free plan median, paid within 6 months` 3 to 5%, and `Free plan top quarter, paid within 6 months` 8 to 12%. Scale 0 to 30%.
   - When the likely range's top is past the scale, the scale grows to the next 10%, up to 100%.
   - Each band's hint: `ChartMogul survey of 200 software products, January 2026, counting paid within six months.`
   - The likely range legend reads `Likely range at 500 starts` and `5.92 to 10.72%`, hint `The true rate is probably in this range. Fewer starts make it wider.`
   - No grade words, no colors that judge.
5. **Funnel**, with `Activated`. `UiLiveChart` kind `funnel`, full width, 260px tall, title `Where trial starts drop off`. Stages: `Trial starts` 500, `Activated` 200, `Paid` 40, each label with its share of the stage before (`40%`, `20%`).
6. **Cohort comparison**, with other cohorts. `UiLiveChart` kind `horizontal-bar`, full width, title `Paid within 30 days, by cohort`, or `Paid, by cohort` without a window. One bar per cohort, `This cohort` first, rate at the bar end. A provisional cohort's label reads `Sep, 20 days left`. Height grows with rows, at least 260px.
7. **Share.** `UiShareAction`, `Copy link`, at the end of the result.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Band, rows, result region | `ToolWorkbench`, `ToolFieldRow`, `ToolResult` from `@/app/ui/tools/tool-workbench` |
| Trial type | `UiChoiceGroup` from `@/app/ui/controls` |
| Counts, days, prices, target, cohort names | `UiTextField` from `@/app/ui/controls`, with `inputMode="numeric"` for counts and days and `decimal` for money and the target, suffixes `days`, `%`, or the currency code. A text field, so pasted `-5` or `1,180` reaches the strict parser. |
| Currency | `UiSelect` from `@/app/ui/controls` |
| Advanced | `UiDisclosure` and `uiSetSummary` from `@/app/ui/controls` |
| Other cohorts | `UiRepeatableList` from `@/app/ui/controls` |
| Button, reset, status | `UiButton` from `@/app/ui/controls`, `UiActionRow` and `UiStatus` from `@/app/ui/display` |
| Answer, status word, numbers | `UiPrimaryResult`, `UiStatusWord`, `UiMetricGroup` from `@/app/ui/display` |
| Picture | `UiUnitGrid` from `@/app/ui/display` |
| Comparison and likely range | `UiRangeMarker` from `@/app/ui/display` |
| Funnel, cohort bars | `UiLiveChart` from `@/app/ui/charts/chart-client` |
| Copy link | `UiShareAction` from `@/app/ui/controls` |
| Shared link | `useInitialQuery` from `@/app/ui/tools/use-initial-query` |

Shared components improved in this round:

- `UiRangeMarker` gets an optional `range` (`from`, `to`, `label`, `valueText`, `hint`). It draws the person's likely range as a bar in the first data color, just under the track, with the `You` marker through it, and adds it to the legend first. Any tool with a small sample can use it.
- `UiUnitGrid` gets an optional `target` amount and `targetLabel`. Units from the filled amount up to the target draw as outlined, so a gap to a goal shows in the same picture. Its fill now uses the first data color instead of the accent fill, as `design-system.md` requires for result visuals. `tone="neutral"` is unchanged.
- Both have gallery examples in the Results section.

Tool-specific components, in the route:

- `FreeTrialConversionCalculator`: form state, cohort row IDs, error mapping by `TrialFieldKey`, focus, stale state, and the result. It calls only the engine.
- `FreeTrialConversionFromUrl`: reads a shared link and renders the tool with `key={query.key}`.

### Layout

Desktop, inside the 66rem working width:

- Row 1: `Trial type` choice row. Three short options in one line.
- Row 2: `Trial starts` and `Paid`, side by side, each half the width. They're one decision.
- `Window, activation, revenue, and cohorts`, closed. Inside:
  - Row: `Follow-up window`, `Cohort age`, `Activated`, `Target conversion`. Four across: everything about this cohort.
  - Row: `Currency`, `Monthly price`, `Annual price`, `On annual plans`. Four across: revenue.
  - `Other cohorts` list. Each row on one line: name, starts, paid, age, and remove in a fixed last column. `Add cohort` below, disabled at 12 with `Up to 12 cohorts`.
- Action row: `Calculate conversion` and `Reset`, with `Inputs changed` beside them when stale.
- Result, below one divider:
  - Top: two columns. Left, about two thirds: the answer, then the supporting numbers in a grid under it. Right: the unit grid at 280px, top-aligned with the answer, legend under it. Both columns hold their own, so there's no empty half.
  - Then full width: the comparison and likely range, the funnel if any, the cohort chart if any, and `Copy link`.

Phones:

- Every row stacks in reading order. Trial type options wrap.
- Each cohort row stacks its fields, with remove top-right.
- Result: the answer, then the unit grid at full column width up to 320px, then the supporting numbers in two columns, then the full-width pieces. The range marker's legend stacks. Charts keep their overflow inside their own frame.

### States

- **Opens:** the example and its result, status `Example`. Advanced closed, `Not used`.
- **Edited after a result:** `ToolResult stale` steps the result back, and `UiStatus` says `Inputs changed`. Opening or closing Advanced isn't an edit.
- **Calculated:** the result updates, `Example` goes away, focus moves to the answer.
- **Basic error:** on press, errors under each field, focus on the first. The last good result stays stale.
- **Advanced error:** on press, Advanced opens whenever it holds an error, even when a Basic error takes focus first. Focus goes to the first error in reading order. The main answer updates. Only the part that field feeds disappears: the funnel, the revenue numbers, the target numbers, the cohort chart and `All cohorts`, or the maturity word.
- **Paid more than starts:** a field error on `Paid`. Never a clamp or a rate past 100%.
- **Zero starts:** valid. The answer reads `—` with `No trial starts`. The grid is empty, the range marker draws bands only, and the numbers read `—`. The layout keeps its size.
- **Zero paid:** `0%`, with `Trials per paying customer` `—`. The likely range still shows, from 0%.
- **Tiny rate:** `Under 0.01%`.
- **Provisional:** warning-tone `Provisional` and the days left, beside the answer and on each young cohort's bar label.
- **Target at or below the rate:** `Extra paid at 5%` reads `0`, and the grid draws no outlined units.
- **Window other than six months:** the published bands drop out, and `No published range for a 30-day window` sits under the marker. The likely range stays.
- **Shared link:** opens and calculates right away. Invalid values show their errors the same way as a press, with Advanced opened if needed.
- **Reset:** back to the example and its result, Advanced closed, cohort rows cleared.
- **Long values:** 10,000,000 starts, a 17-digit MRR, and a 40-character cohort name fit without page overflow. Names wrap in chart labels.
- **Loading and retry:** don't apply. The calculation is local and synchronous.

## Content

Written after the frontend. The tool was run with the example (500 / 40), the forum case (160 / 3), the small-sample case (42 / 30), and the full Advanced example before writing.

### Search intent and title

The searcher has two counts and wants the rate, then wants to know if it's normal. Top results grade the number against unsourced bands and accept impossible counts. This page gives the rate with its counts, says how sure it is, and shows dated ranges that match the trial type.

- Visible title: keep `Free trial conversion calculator: how many free trials turn into paid customers?`
- SEO title: keep `Free trial to paid conversion rate calculator`.
- SEO description, new: `Find what share of your free trial starts paid, how sure that rate is at your cohort's size, and how it compares with published ranges for your trial type.`
- Card: keep the name `Free trial conversion`. New description: `Find what share of your trial starts paid, and how it compares.`

### Reader questions

| Question | Where it's answered |
| --- | --- |
| What percentage of my trial users paid? | Tool answer. Formula and the 6% versus 20% example in the article. |
| Which counts do I enter? | Usage, "What to enter". |
| What counts as paid? | Paid hint, usage, and the article section. |
| Is 3 out of 160 bad? | Tool comparison and likely range. Usage example. Article "good rate" and "small cohort" sections. No grade anywhere. |
| Why does my newest month look low? | `Provisional` status. Article "How long should you wait". |
| What's a good rate? | Article table of four sources, with who was measured. |
| Does a card upfront convert better? | Article, with First Page Sage's visitor-to-trial and trial-to-paid averages. |
| How much MRR would 10% bring? | Tool target and revenue numbers. Article MRR section. |

### Outline

- Intro: what you get and what to have ready, in three sentences.
- Usage: three numbered steps for the counts, what counts as paid, a table of what each Advanced input answers, how to read the result, and one `Example` (160 / 3).
- Article:
  - `How is free trial conversion rate calculated?` Formula, then an `Example` of the calendar-month mistake.
  - `What counts as a paid conversion?` Bullets.
  - `How long should you wait before you count?` Paragraphs.
  - `What is a good free trial conversion rate?` Source table, then a `Note` on small cohorts.
  - `Why does a small cohort's rate swing so much?` The 42 / 30 case and the Wilson interval.
  - `Does requiring a card upfront improve conversion?` Small table.
  - `Is new MRR from trials the same as revenue?`
  - `What to check next` Links.

Left out: input format rules and limits (field errors), zero starts and `Under 0.01%` (the result shows them), the combined-rate fallback rules (the `All cohorts` hint names what's in it), and advice on trial length (the most common length isn't evidence of the best one).

### Facts, limits, and sources

- Formula and cohort rule, later conversions changing a cohort: [ChartMogul help article](https://help.chartmogul.com/article/219-chart-trial-to-paid-conversion-rate).
- Ranges by trial type, six-month window, 200 products, January 2026, typical $1M to $10M ARR, self-estimated: [ChartMogul SaaS Conversion Report](https://chartmogul.com/reports/saas-conversion-report/). Free plan bands are for freemium with a regular signup.
- Trial-to-paid and visitor-to-trial averages, 86 companies, 2022 to 2025, one paid month counts: [First Page Sage](https://firstpagesage.com/seo-blog/saas-free-trial-conversion-rate-benchmarks/), updated September 5, 2025.
- 37.5% site-level average, 39.0% with billing details, 12.0% without, per subscription, 803 sites, January to August 2022: [Recurly](https://recurly.com/resources/report/state-of-subscriptions-acquisition/).
- ARR = MRR × 12: [ChartMogul SaaS Go-To-Market Report glossary](https://chartmogul.com/reports/saas-go-to-market-report/).
- Likely range: 95% Wilson score interval.
- Avoid: calling any rate good or bad, blending sources into one average, saying card-upfront produces more customers, a recommended trial length, and an indie-specific benchmark (none exists).

### Next step

`/mrr-calculator`, `/customer-churn-calculator`, `/customer-acquisition-cost-calculator`, `/customer-lifetime-value-calculator`: totals, retention, cost, and value of the customers this tool counts.
