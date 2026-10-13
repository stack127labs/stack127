# Annual plan discount calculator

Route: `/annual-plan-discount-calculator`

Research: [research.md](research.md)

## Why people will choose this tool

The searcher is a founder with a monthly plan who has to put a price on the annual option. They want to know what a discount means in plain terms, such as "2 months free is 16.7%", what it costs them, and whether the upfront cash makes up for it once some monthly customers would have left anyway.

Where the current top results fail them:

- Most convert in one direction only. SaaSTurf and Rankite take two prices, MathBehind and MoneyDeck take a discount, SendPay takes months free. None takes all three.
- Bad input goes through. A negative price, a 110% discount, or 13 months free gets capped or turned into zeros without a word on five of the six tools.
- "Break even" means two different things and nobody says so. SaaSSwitcher and Rankite mean "the annual price equals this many monthly payments". MathBehind and MoneyDeck mean "the discount where annual collects as much as monthly after churn". Rankite rounds 9.6 up to 10 without saying it.
- Churn-aware tools stop at year one. None has an annual renewal rate, so nobody can see what happens at month 24 or 36.
- Nobody separates upfront cash, expected billings, and MRR, or applies processor fees, even though one annual charge pays the fixed fee once instead of twelve times.
- SaaSTurf calls 15% to 20% "healthy" with no source.

What this tool does better:

1. Starts from the monthly price and takes the annual offer as an annual price, a discount, or months free. It always shows all three, plus what the customer saves.
2. Shows two thresholds under two names: the annual price in monthly payments (9.6, and the 10th payment that passes it), and the break-even discount after monthly churn.
3. Keeps upfront cash, MRR, and expected billings over 12, 24, and 36 months in separate rows. Monthly churn drives the monthly plan. A separate annual renewal rate drives the annual plan.
4. Optional processor fees, with dated, editable US presets for Stripe, Paddle, and Lemon Squeezy. Fees show as their own figures and never touch MRR.
5. Rejects bad input under the field, with a reason. It never clamps.
6. No "best discount", grade, or benchmark range. Without churn it still answers the conversion. With churn it shows the scenario and says which assumptions drive it.

## Product

### Promise and scope

Primary user: an indie hacker or solo SaaS founder with a monthly plan price who is setting, or checking, an annual price.

Job: turn an annual offer into its price, discount, and months free, then see what it collects next to the monthly plan under their own churn, renewal, and fee assumptions.

Launch scope:

- One currency, as a label only. Processor presets only for USD.
- Monthly price as the anchor. The annual offer comes from one of three inputs: annual price, discount percent, or months free.
- Optional monthly churn and optional annual renewal rate.
- Optional processor fee: a preset or a custom percent plus a fixed fee per successful charge.
- Results per customer who signs up: upfront charge, MRR, and expected billings by month 12, 24, and 36, before and after fees.

Exclusions, each with its reason:

- **Working out a monthly price from an annual price and a discount.** The research scope is a founder who already has a monthly plan. Deriving it would need a rounded monthly price that then changes every other figure.
- **Refunds.** Refund timing and size are seller policy, and Paddle's fee treatment on refunds is unknown. The article covers it. The base comparison stays before refunds.
- **Customer counts, signup mix, and conversion lift.** The tool can't know how many people pick annual or whether a discount sells more. Per-customer figures avoid a made-up forecast.
- **Taxes, failed payments, chargebacks, payout and currency costs, and international or PayPal surcharges.**
- **Profit, LTV, CAC, and recommendations.** Other SaaS tools cover LTV and CAC.
- **URL sharing, saved scenarios, and export.**

`/mrr-calculator` normalizes many plans into portfolio MRR. This tool prices one annual offer and compares it with the same plan billed monthly.

### Technical contract

**Inputs.** All raw values are strings from the form, except `offerMode` and `feePreset`, which are ids.

| Input | Key | Accepted | Notes |
| --- | --- | --- | --- |
| Currency | `currency` | `USD`, `EUR`, `GBP`, `INR`, `CAD`, `AUD`. Default `USD`. | Formatting only. From `SAAS_ECONOMICS_CURRENCIES`. |
| Monthly price | `monthlyPrice` | Money, `0.01` to `1,000,000,000.00`. Required. | The price of one month on the monthly plan. `0` is invalid. |
| Annual offer as | `offerMode` | `annualPrice`, `discount`, or `monthsFree`. Default `discount`. | Only the field for the chosen mode is read. The other two are ignored, not validated. |
| Annual price | `annualPrice` | Money, `0.01` to `1,000,000,000.00`. | Above 12 × monthly price is valid. It's a surcharge with a negative discount. |
| Discount | `discountPercent` | Percent, `0` to `99.99`, two decimals. | No negative values. Above list price is entered as an annual price. |
| Months free | `monthsFree` | Months, `0` to `11.99`, two decimals. | `2` means pay for 10 of 12 months. |
| Monthly churn | `monthlyChurnPercent` | Percent, `0` to `100`, two decimals. Optional. | Blank means "not entered", never 0. |
| Annual renewal rate | `annualRenewalPercent` | Percent, `0` to `100`, two decimals. Optional. | Share of annual customers who renew at each year end. Blank leaves months 24 and 36 for the annual plan unknown. |
| Processor fee | `feePreset` | `none`, `stripeCard`, `stripeCardBilling`, `paddle`, `lemonSqueezy`, or `custom`. Default `none`. | The four named presets are valid only with `USD`. |
| Fee percent | `feePercent` | Percent, `0` to `50`, two decimals. | Read only when `feePreset` isn't `none`. Required then. |
| Fixed fee per charge | `feeFixed` | Money, `0` to `100.00`. | Read only when `feePreset` isn't `none`. Required then. |

**Parsing.** Use `lib/saas-economics/shared.ts`. `parseMoneyCents` for money, `parsePercentHundredths` for percents and months free. Both use non-negative bounds, so a minus sign is a format error. Same strict rules as the sibling engines: no commas, signs, symbols, exponents, or a third decimal. Leading and trailing spaces are trimmed. Blank is never zero.

**Fee presets.** Engine-owned data. Each preset has an id, a label, a percent in hundredths, a fixed fee in cents, a short scope note, a source URL, and `checked: "2026-10-10"`. All are published US rates in USD and exclude everything in the exclusions list.

| Id | Label | Percent | Fixed | Scope | Source |
| --- | --- | --- | --- | --- | --- |
| `stripeCard` | Stripe, card | `2.90` | `0.30` | Standard US online card rate. Stripe Billing not included. | https://stripe.com/pricing |
| `stripeCardBilling` | Stripe, card and Billing | `3.60` | `0.30` | Card rate plus Billing pay-as-you-go 0.7% of volume. | https://stripe.com/pricing |
| `paddle` | Paddle | `5.00` | `0.50` | Pay-as-you-go Checkout rate. Custom pricing may differ. | https://www.paddle.com/pricing |
| `lemonSqueezy` | Lemon Squeezy, subscription | `5.50` | `0.50` | 5% + $0.50, plus 0.5% for subscription payments. No international or PayPal surcharge. | https://docs.lemonsqueezy.com/help/getting-started/fees |

`custom` has no values. The frontend fills the two fee fields from a preset when one is chosen. The person may edit them. The engine reports `edited: true` when the parsed values differ from the chosen preset.

**The model.** Integer cents for money, integer hundredths for percents and months. Every step uses exact fractions (`ExactFraction` in `lib/saas-economics/unit-economics.ts`). Rounding happens only for output. `P` = monthly price, `A` = annual price, `c` = monthly churn, `q` = annual renewal rate, `p` = fee percent, `f` = fixed fee.

1. **Resolve the annual price** to whole cents. Every later figure uses this `A`.
   - `annualPrice`: `A` as entered.
   - `discount`: `A = round(12 × P × (10000 − d) ÷ 10000)`, half away from zero.
   - `monthsFree`: `A = round(P × (1200 − m) ÷ 100)`, half away from zero.
   - `annualPriceRounded` is true when the exact derived amount wasn't whole cents.
   - A derived `A` of `0` is an error on the mode's field (see messages).
2. **Offer.** `L = 12P`, the list price for a year of monthly payments.
   - Customer saves: `L − A` cents. Signed. Negative is a surcharge.
   - Discount: `(L − A) ÷ L`. Signed.
   - Months free: `(L − A) ÷ P`. Signed.
   - MRR on the annual plan: `A ÷ 12`. MRR on the monthly plan: `P`.
3. **Invoice-equivalent threshold.** `A ÷ P` monthly payments. Also `ceil(A ÷ P)`, the first whole monthly payment whose running total reaches `A`. This is the price comparison only. It has no churn.
4. **Expected monthly-plan billings by month `n`.** The first charge is at signup. Before each later monthly charge, a share `c` of remaining customers cancels.
   `M(n) = P × Σ (1 − c)^k for k = 0 … n − 1`. This equals `cumulativeGrossProfit({ arpaCents: P, grossMarginHundredths: 10000n, churnHundredths: c }, n)` from `unit-economics.ts`. Reuse it. At `c = 0` it's `nP`. At `c = 100%` it's `P`.
   Expected monthly charges by month `n`: `M(n) ÷ P`.
5. **Expected annual-plan billings by month `n`**, for `n` = 12, 24, 36. One charge at signup, then at the start of months 13 and 25 for customers who renew.
   `Y(n) = A × Σ q^j for j = 0 … n/12 − 1`, with `q^0 = 1`. `Y(12) = A` needs no renewal rate. `Y(24)` and `Y(36)` are `null` when the renewal rate is blank.
   Expected annual charges: `Y(n) ÷ A`.
6. **Break-even discount by month `n`.** The discount at which `Y(n)` equals `M(n)`:
   `d_BE(n) = 1 − M(n) ÷ (12P × Σ q^j)`. It doesn't depend on `P`. Month 12 needs only churn. Months 24 and 36 also need renewal. A negative value means annual would have to cost more than 12 monthly payments to match. Report it, and don't clamp it.
   `annualVsMonthly(n)` compares exact `Y(n)` with exact `M(n)`: `more`, `same`, or `less`.
7. **Fees.** Each successful charge of amount `x` costs `x × p ÷ 10000 + f`.
   Expected fees by month `n`: `(P × p ÷ 10000 + f) × expected monthly charges`, and `(A × p ÷ 10000 + f) × expected annual charges`.
   Upfront fee: one charge of `P` for monthly, one of `A` for annual.
   After fees, as displayed: `net = rounded gross − rounded fees`, so every table row adds up. Net can be negative when a fixed fee is larger than a small price. Report it signed.
   Fees never change MRR, the thresholds, or `d_BE`.
8. **Running totals for the chart**, months 1 to 36, gross only: `M(n)`, and annual `Y` for the current term. That's `A` for months 1–12, `A(1+q)` for 13–24, and `A(1+q+q²)` for 25–36. Annual is `null` from month 13 when renewal is blank. Only present when churn is entered.

**Rounding for output.**

- Money: cents, half away from zero. A difference is the rounded annual figure minus the rounded monthly figure, so the table adds up. Same rule as the LTV tool's scenario delta.
- Discount and break-even discount: tenths of a percent, half away from zero, signed. `nearZero: true` when the exact value isn't 0 but rounds to `0.0`. The interface shows `Under 0.1%`, or `Under −0.1%` for a tiny surcharge.
- Months free and invoice-equivalent months: tenths, half away from zero, signed. `exact: true` when the exact value is a whole number, so the interface can say "Exactly 10".
- Expected charges: hundredths, half away from zero. At 3% churn, 12 months gives `10.21`. The research says "about 10.20". The exact value is 10.2055…, so 10.21 is the rounded figure.

**Validation.** The engine collects every error in one pass and returns `status: "invalid"` with no values. It never throws for user input. It never clamps or swaps in a value.

| Case | Key | Message |
| --- | --- | --- |
| Monthly price blank | `monthlyPrice` | `Enter the monthly price.` |
| Monthly price `0` | `monthlyPrice` | `Enter a monthly price above 0.` |
| Any money format error (sign, comma, symbol, 3 decimals, letters) | field | `Use digits with up to two decimals. No signs, commas, or currency symbols.` |
| Money above max | field | `Enter an amount up to 1,000,000,000.00.` For `feeFixed`: `Enter a fixed fee up to 100.00.` |
| Annual price blank, mode `annualPrice` | `annualPrice` | `Enter the annual price.` |
| Annual price `0` | `annualPrice` | `Enter an annual price above 0.` |
| Discount blank, mode `discount` | `discountPercent` | `Enter the annual discount.` |
| Discount format or range (negative, `100`, `110`, `20%`) | `discountPercent` | `Enter a discount from 0 to 99.99. For an annual price above 12 monthly payments, enter the annual price instead.` |
| Months free blank, mode `monthsFree` | `monthsFree` | `Enter the number of months free.` |
| Months free format or range (negative, `12`, `13`) | `monthsFree` | `Enter months free from 0 to 11.99.` |
| Derived annual price rounds to `0.00` | mode's field | `This makes the annual price 0.00. Use a smaller discount.` For months free: `…Use fewer months free.` |
| Churn format or range | `monthlyChurnPercent` | `Enter a percent from 0 to 100, with up to two decimals, or leave it blank.` |
| Renewal format or range | `annualRenewalPercent` | `Enter a percent from 0 to 100, with up to two decimals, or leave it blank.` |
| Fee percent blank, format, or range with a fee on | `feePercent` | `Enter a fee percent from 0 to 50, with up to two decimals.` |
| Fixed fee blank with a fee on | `feeFixed` | `Enter a fixed fee per charge. Use 0 if there is none.` |
| Named preset with non-USD currency | `feePreset` | `These presets are US rates in USD. Choose Custom fee for other currencies.` |
| Unknown currency, mode, or preset | that key | `Choose one of the listed options.` |
| Not an object, or a non-string value | `form` | `Something in the form is out of date. Reset and try again.` |

The writing session may reword messages in the engine. Keys and cases stay.

**Action.** `Compare plans` is the only primary action. Its behavior is under Interface.

**Privacy and security.** Runs in the browser. Values never go to a server, the URL, cookies, storage, logs, or analytics. No API route, dataset, or background job. The clean URL never changes.

### Backend contract

Same runtime rules as the sibling SaaS engines: strip-types safe, no enums or namespaces, explicit `.ts` imports, no DOM, network, time, or randomness. Reuse `lib/saas-economics/shared.ts` and `lib/saas-economics/unit-economics.ts` as they are. Neither needs a change.

#### `lib/annual-plan-discount-calculator/engine.ts`

```ts
import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type ExactFraction } from "../saas-economics/unit-economics.ts";

export const ANNUAL_PLAN_OFFER_MODES = ["annualPrice", "discount", "monthsFree"] as const;
export type AnnualPlanOfferMode = (typeof ANNUAL_PLAN_OFFER_MODES)[number];

export const ANNUAL_PLAN_HORIZONS = [12, 24, 36] as const;
export type AnnualPlanHorizon = (typeof ANNUAL_PLAN_HORIZONS)[number];

export const ANNUAL_PLAN_FEE_PRESET_IDS = ["none", "stripeCard", "stripeCardBilling", "paddle", "lemonSqueezy", "custom"] as const;
export type AnnualPlanFeePresetId = (typeof ANNUAL_PLAN_FEE_PRESET_IDS)[number];

export type AnnualPlanFeePreset = {
  id: Exclude<AnnualPlanFeePresetId, "none" | "custom">;
  label: string;              // "Stripe, card"
  percentHundredths: bigint;  // 290n
  fixedCents: bigint;         // 30n
  currency: "USD";
  scope: string;              // one short sentence: what is and isn't included
  sourceUrl: string;
  checked: "2026-10-10";
};
/** The four named presets, in menu order. */
export const ANNUAL_PLAN_FEE_PRESETS: readonly AnnualPlanFeePreset[];

export type AnnualPlanInput = {
  currency: string;
  monthlyPrice: string;
  offerMode: string;
  annualPrice: string;
  discountPercent: string;
  monthsFree: string;
  monthlyChurnPercent: string;   // "" = not entered
  annualRenewalPercent: string;  // "" = not entered
  feePreset: string;
  feePercent: string;
  feeFixed: string;
};

export type AnnualPlanFieldKey = "form" | keyof AnnualPlanInput;
export type AnnualPlanErrors = Partial<Record<AnnualPlanFieldKey, string>>;

export type AnnualPlanMoney = { cents: bigint; exact: ExactFraction };              // cents half away from zero; signed where noted
export type AnnualPlanPercent = { tenths: bigint; nearZero: boolean; exact: ExactFraction }; // tenths of a percent, signed
export type AnnualPlanMonths = { tenths: bigint; exact: boolean };                   // tenths of a month, signed; exact = whole number

export type AnnualPlanOffer = {
  monthlyPriceCents: bigint;
  annualPriceCents: bigint;              // >= 1n, resolved and used everywhere below
  annualPriceRounded: boolean;           // derived from discount or months free and not whole cents
  listAnnualCents: bigint;               // 12 * monthly
  customerSavingsCents: bigint;          // list - annual; negative = surcharge
  discount: AnnualPlanPercent;           // negative = surcharge
  monthsFree: AnnualPlanMonths;          // negative = surcharge
  mrr: { monthlyPlanCents: bigint; annualPlan: AnnualPlanMoney; differenceCents: bigint }; // annual / 12, rounded. differenceCents = rounded annual MRR − monthly MRR (example 1: -333n). Added by coordinator after the backend check.
  invoiceEquivalent: {
    months: AnnualPlanMonths;            // annual / monthly
    wholePayments: bigint;               // ceil(annual / monthly), >= 1n
  };
};

export type AnnualPlanFeeAmounts = {
  feesCents: bigint;                     // >= 0n
  netCents: bigint;                      // rounded gross - rounded fees; signed
};

export type AnnualPlanUpfront = {
  monthly: { grossCents: bigint; fee: AnnualPlanFeeAmounts | null };
  annual: { grossCents: bigint; fee: AnnualPlanFeeAmounts | null };
  differenceCents: bigint;               // annual - monthly gross
};

export type AnnualPlanHorizonResult = {
  months: AnnualPlanHorizon;
  monthly: {
    grossCents: bigint;
    expectedChargesHundredths: bigint;   // 1021n = 10.21
    fee: AnnualPlanFeeAmounts | null;    // null when fee preset is none
  };
  /** null for 24 and 36 when the renewal rate is blank. Never null for 12. */
  annual: {
    grossCents: bigint;
    expectedChargesHundredths: bigint;
    fee: AnnualPlanFeeAmounts | null;
  } | null;
  differenceCents: bigint | null;        // annual.grossCents - monthly.grossCents
  netDifferenceCents: bigint | null;     // annual net - monthly net, when both exist
  annualVsMonthly: "more" | "same" | "less" | null; // from exact gross values
  breakEvenDiscount: AnnualPlanPercent | null;      // null when annual is null
};

export type AnnualPlanComparison = {
  monthlyChurnHundredths: bigint;
  annualRenewalHundredths: bigint | null;
  horizons: AnnualPlanHorizonResult[];   // always three, in ANNUAL_PLAN_HORIZONS order
  /** Months 1 to 36, gross. annualCents is null from month 13 when renewal is blank. */
  runningTotals: { month: number; monthlyCents: bigint; annualCents: bigint | null }[];
};

export type AnnualPlanFee = {
  preset: Exclude<AnnualPlanFeePresetId, "none">;
  percentHundredths: bigint;
  fixedCents: bigint;
  edited: boolean;                       // named preset whose values were changed
};

export type AnnualPlanValues = {
  currency: SaasEconomicsCurrency;
  offerMode: AnnualPlanOfferMode;
  offer: AnnualPlanOffer;
  upfront: AnnualPlanUpfront;
  fee: AnnualPlanFee | null;
  /** null when monthly churn is blank. The offer, upfront, and MRR still apply. */
  comparison: AnnualPlanComparison | null;
};

export type AnnualPlanCalculation =
  | { status: "valid"; values: AnnualPlanValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: AnnualPlanErrors };

export function calculateAnnualPlanDiscount(input: unknown): AnnualPlanCalculation;
```

Notes for the builder:

- When churn is blank and renewal is filled, the result is valid and `comparison` is `null`. Renewal is parsed and validated but has no output.
- Exact values (`exact` fields) stay in the output so the frontend can compare and show `Under 0.1%` without its own math. The frontend does no arithmetic beyond turning cents into display numbers for the chart.
- Throwing is only for programmer errors.

### Known examples

Calculated by hand with exact fractions. They don't come from competitor output, but several match it. USD, no fee unless stated. "Diff" is annual minus monthly.

| # | Inputs | Expected |
| --- | --- | --- |
| 1 | Monthly `20`, months free `2`, churn `3`, renewal `70`, fee `stripeCard` | Annual `$200.00`, not rounded. Discount `16.7%`. Months free `2.0`, exact. Saves `$40.00`. MRR `$20.00` vs `$16.67`. Invoice-equivalent `10.0` exact, whole payments `10`. Upfront `$20.00` vs `$200.00`, diff `$180.00`. Upfront fees `$0.88` vs `$6.10`. Month 12: monthly `$204.11` (charges `10.21`), annual `$200.00` (charges `1.00`), diff `−$4.11`, `less`, break-even `15.0%`. Month 24: `$345.72` vs `$340.00`, diff `−$5.72`, break-even `15.3%`. Month 36: `$443.98` vs `$438.00`, diff `−$5.98`, break-even `15.5%`. Fees: month 12 `$8.98` vs `$6.10`, net `$195.13` vs `$193.90`, net diff `−$1.23`. Month 24 fees `$15.21` vs `$10.37`, net `$330.51` vs `$329.63`. Month 36 fees `$19.54` vs `$13.36`, net `$424.44` vs `$424.64`, net diff `+$0.20`. |
| 2 | Monthly `20`, annual price `192`, churn `3` | Discount `20.0%`. Months free `2.4`, not exact. Saves `$48.00`. MRR `$16.00`. Invoice-equivalent `9.6`, whole payments `10`. Month 12 `$204.11` vs `$192.00`, diff `−$12.11`, break-even `15.0%`. Months 24 and 36: monthly `$345.72` and `$443.98`, annual `null`, break-even `null`. Matches MathBehind's 15.0% and 9.6, and Rankite's 10. |
| 3 | Monthly `50`, discount `20`, churn `5`, renewal `80` | Annual `$480.00`. Month 12 monthly `$459.64` (charges `9.19`), diff `+$20.36`, `more`, break-even `23.4%`. Month 24 `$708.01` vs `$864.00`, break-even `34.4%`. Month 36 `$842.22` vs `$1,171.20`, break-even `42.5%`. Month 12 matches MoneyDeck's $459.64 and 9.19. |
| 4 | Monthly `9.99`, discount `15` | Exact `101.898`, so annual `$101.90` with `annualPriceRounded: true`. Discount `15.0%`, from the rounded price, exact 14.998…%. Months free `1.8`. Saves `$17.98`. MRR `$8.49`. Invoice-equivalent `10.2`, whole payments `11`. `comparison: null`. |
| 5 | Monthly `29`, discount `20`, churn `2.5`, renewal `75`, fee `paddle` | Annual `$278.40`. Month 12 `$303.92` (charges `10.48`) vs `$278.40`, break-even `12.7%`. Month 36 `$693.74` vs `$643.80`, break-even `13.8%`. Month 12 fees `$20.44` vs `$14.42`. |
| 6 | Monthly `20`, months free `2`, churn `0`, renewal `100` | Month 12 `$240.00` vs `$200.00`, diff `−$40.00`, break-even `0.0%`, not `nearZero`. Month 36 `$720.00` vs `$600.00`. |
| 7 | Monthly `20`, months free `2`, churn `100`, renewal `0` | Monthly is `$20.00` at every horizon, charges `1.00`. Annual is `$200.00` at every horizon. Break-even `91.7%` at all three. |
| 8 | Monthly `20`, annual price `300` | Discount `−25.0%`. Months free `−3.0`. Saves `−$60.00`. Invoice-equivalent `15.0`. Valid, not an error. |
| 9 | Monthly `20`, months free `2`, churn `0`, fees `paddle` / `lemonSqueezy` / `stripeCardBilling` | Month 12 fees: Paddle `$18.00` vs `$10.50`. Lemon Squeezy `$19.20` vs `$11.50`. Stripe with Billing `$12.24` vs `$7.50`. With `stripeCard`, `$10.56` vs `$6.10`. These match the research. |
| 10 | Example 1 with `custom`, `2.9`, `0.30` | Same fee figures as example 1. `preset: "custom"`, `edited: false`. `stripeCard` with fixed `0.25` gives `edited: true`. |
| 11 | Monthly `20`, discount `0`, churn `0` | Discount `0.0%`, saves `$0.00`, months free `0.0`. Month 12 diff `$0.00`, `same`. |
| 12 | Monthly `0.01`, months free `11.99` | Invalid. `monthsFree`: the "0.00" message. |
| 13 | Monthly `1000000000`, discount `0` | Annual `$12,000,000,000.00`. Derived prices may exceed the entry maximum. |
| 14 | Invalid: monthly blank, `0`, `-20`, `$20`, `1,000`, `20.001`, `1e3`. Discount `100`, `-5`, `20%`. Months free `12`. Annual price `0`. Churn `100.01` or `-1`. Renewal `101`. `feePercent` blank with `paddle`. `paddle` with `EUR`. `offerMode: "weekly"`. Input `null`. | A field-specific error each, from the table. `status: "invalid"`, no values. With mode `discount`, a junk `annualPrice` draft is ignored. Churn and renewal blank are valid. |

Hand check for example 1, month 12: `Σ 0.97^k` for k = 0…11 is `(1 − 0.97^12) ÷ 0.03 = 10.2055…`. × $20 = $204.11. Break-even is `1 − 204.11 ÷ 240 = 14.95% → 15.0%`. Month 24 annual is `200 × 1.7 = 340`.

### Ownership

Sol builds the backend:

- `lib/annual-plan-discount-calculator/engine.ts`.
- `tests/pages/annual-plan-discount-calculator/annual-plan-discount-calculator.test.mjs`, covering the examples above.
- The development tool-page row with a placeholder title, when the coordinator asks.

Opus builds the frontend:

- `app/(site)/(tools)/annual-plan-discount-calculator/page.tsx`, `layout.tsx`, `annual-plan-discount-calculator.tsx`, and `annual-plan-discount-calculator.module.css`. Same shell as `break-even-mrr-calculator`. Header icon `Tag` from `lucide-react`. No SaaS sibling uses it, and it matches the card art.
- `app/(site)/(tools)/annual-plan-discount-calculator/art/annual-plan-discount-calculator.spec.json`, `.svg`, and `.ts`, made with marker-art-draw. A new `toolSpot` motif in `scripts/stack127/marker-art/figures.mjs`, and a registration line in `lib/card-art.ts`. Both are shared files that other SaaS planners may also touch. Check `git status` before editing, and wait if someone else has them open.

No URL-restore wrapper.

### Catalog placement

Primary and only catalog: `/saas-tools`. The reader is pricing a plan, which is the job of the SaaS tools catalog. Place it next to the MRR and ARR calculators, because annual MRR is the next question. The coordinator sets the final order for the batch. No secondary catalog fits. `/platform-fees` is a reference, not a tool catalog.

Catalog `toolSpot` key: `annual-plan-discount-calculator`. Suggested motif: `annualDiscount`.

- **Takeaway:** an annual plan is twelve months of payments with a few given away.
- **Focal subject:** a large price tag on its side. The hole and string are on the left. Inside the tag is one row of twelve small equal tiles. The first ten are solid `@sub`. The last two are dashed outlines in `@primary`, empty.
- **One supporting relationship:** a short curved arrow lifts the two empty tiles slightly up and out of the tag's right edge, so they read as taken off the price.
- **Tone:** calm, with the accent only on the giveaway. No numbers, currency signs, percent signs, scissors, calendars, or binder rings.
- **Keep it distinct from** the ARR card's `annualizeMonthly` (a calendar with a 3×4 grid), the MRR card's `monthlyNormalize` (lines into a calendar), and `usagePrice` (a document and a coin). The tag outline and the single row of tiles do that.
- Wordless, and legible at card size in both themes. If twelve tiles turn to mush at card size, use six tiles with one empty. The ratio stays the same.

## Interface

### Flow

- **Question:** "If I offer this annual price, what discount is it, and what does it collect next to my monthly plan?"
- **Minimum input:** monthly price and one annual offer value. Churn, renewal, and fees refine the answer.
- **Primary action:** `Compare plans`.
- **Lead answer:** the value the person didn't type. That's the annual price when they gave a discount or months free, or the discount when they gave an annual price.
- **Control mode:** `disclosure`. Processor fees sit behind a disclosure, because they're an optional refinement that does nothing when off. Churn and renewal stay visible, since they drive the comparison.

Workbench order:

1. `Currency`, a narrow select, and `Monthly price` *, on one row.
2. `Annual offer as`: three visible choices, `Discount`, `Months free`, and `Annual price`. One field below it changes with the choice: `Annual discount` (`%`), `Months free` (`months`), or `Annual price` (currency code). Switching keeps each field's draft.
3. `Monthly churn` (`%`) and `Annual renewal rate` (`%`), on one row. Both optional, with "Optional" in the label hint. One helper line each, because people mix them up:
   - Churn: `Share of monthly customers who cancel each month. Leave blank to skip the comparison.`
   - Renewal: `Share of annual customers who renew each year. Not the same as monthly churn.`
4. Disclosure `Processor fees`. The summary reads `None`, or `Stripe, card · 2.9% + $0.30`, or with `(edited)` added. Inside:
   - `Fee preset` select: `None`, the four presets, `Custom fee`. For a non-USD currency, only `None` and `Custom fee`.
   - `Fee percent` (`%`) and `Fixed fee per charge` (currency code), on one row, shown when the preset isn't `None`. A preset fills both, and the person can edit them.
   - One line under the fields: the preset's scope sentence, a source link, and `Published US rate, checked 10 Oct 2026.` For a custom fee: `Percent of each charge, plus a fixed amount per successful charge.`
   - Changing the currency away from USD while a named preset is selected switches it to `Custom fee` and keeps both values. That isn't silent: the summary changes and the status announces `Fee preset changed to Custom fee.`
5. `Compare plans` and a quiet `Reset`.
6. One divider, then the results.

### Result regions

Each region answers a different question. No formatted value repeats in two regions.

1. **Lead.** `UiPrimaryResult`, tone `neutral`.
   - Label `Annual price` (modes `discount`, `monthsFree`), with value `$200.00`. Or label `Annual discount` (mode `annualPrice`), with value `20.0%`.
   - Detail line: the other two offer values and the savings. Example: `16.7% off 12 payments of $20.00 · 2.0 months free · Customer saves $40.00 a year`. Leave out the field the person typed.
   - Surcharge: `25.0% more than 12 payments of $20.00 · Customer pays $60.00 more a year`. No months free on a surcharge.
   - When `annualPriceRounded`: add `Rounded to the cent from $101.898.` Show the exact amount to three decimals at most, or `Rounded to the cent.` if it has more.
2. **Two thresholds.** `UiKeyValueList`, two rows. Each value has a short second line.
   - `Equal to monthly payments`: `9.6`. Second line: `The 10th monthly payment passes $192.00.` When exact: `Exactly 10 monthly payments.`
   - `Break-even discount at 3% churn`: `15.0%`. Second line: `Your 20.0% is above it. In year one, annual collects $12.11 less than monthly is expected to.` Or `below it … more`, or `equal to it … the same`. With renewal, add a third line: `Over 24 months: 15.3%. Over 36 months: 15.5%, at 70% renewal.` A negative break-even reads `None. Annual would need to cost 5.2% more than 12 payments to match.`
   - Without churn, the value is `Add monthly churn`, and the second line is `Needed to compare expected billings.`
   - Never call either value "best" or "recommended".
3. **Per-customer comparison.** `UiDataTable`, caption `Per customer who signs up`. Columns: the row label, `Monthly plan`, `Annual plan`, `Difference` (annual minus monthly, with a sign). All right-aligned except the row label.
   - `Charged at signup`: $20.00, $200.00, +$180.00. Always shown.
   - `MRR`: $20.00, $16.67, −$3.33. Always shown. The row header has the visually quiet note `Annual price ÷ 12, not cash`.
   - `Expected billings by month 12`, `by month 24`, `by month 36`. Only with churn. An unknown annual cell reads `Needs renewal rate`, and its difference reads `—`.
   - With a fee: `After fees by month 12`, `24`, `36`, with the net figures. Each cell has a second small line, `$8.98 fees`. `Charged at signup` gets the same second line.
   - Signs use `−` and `+`, not color alone. A positive difference means annual collects more.
4. **Running total chart.** `UiLiveChart`, kind `line`, format `currency`, `xFormat: "number"`. Title `Expected billings per customer, running total`. Two series, `Monthly plan` and `Annual plan`. X runs over months 1–36, or 1–12 when renewal is blank. No `range`. Hover and series toggles help compare points. Caption: `Annual jumps when customers renew at months 13 and 25.` Shown only with churn.
5. **Assumptions.** One small line under the chart, or under the table when there's no chart. It's built from the inputs: `Monthly customers pay at signup, then 3% cancel before each later payment. Annual customers pay at signup, and 70% renew each year. Before refunds, taxes, and failed payments. Not profit.` When fees are on, add the fee sentence.

The chart is the only visual. It shows a real relationship: when the cumulative monthly line catches up with the annual line, and how each renewal moves it. A line chart draws the annual jump from month 12 to 13 as a one-month slope. That's acceptable at 36 points. A stepped line would be more exact. It's listed under Components as an optional improvement, not a blocker.

### Components

Existing shared components:

| Use | Component |
| --- | --- |
| Currency, fee preset | `UiSelect` from `@/app/ui/controls` |
| Annual offer as | `UiChoiceGroup` from `@/app/ui/controls` |
| Prices, percents, months, fees | `UiTextField` from `@/app/ui/controls`, `inputMode="decimal"`, with a `suffix` of the currency code, `%`, or `months`. Autocomplete, capitalization, and spellcheck off. |
| Processor fees | `UiDisclosure` from `@/app/ui/controls`, with `summary` |
| Actions | `UiActionRow` from `@/app/ui/display`, `UiButton` from `@/app/ui/controls` |
| Lead | `UiPrimaryResult` from `@/app/ui/display` |
| Thresholds | `UiKeyValueList` from `@/app/ui/display` |
| Comparison | `UiDataTable` from `@/app/ui/display` |
| Running total | `UiLiveChart` from `@/app/ui/charts/chart-client` |
| Changes, reset, failure | `UiStatus` from `@/app/ui/display` |
| Page | `ToolPageShell`, `ToolPageHeader`, `ToolPageArticle`, `PageCanvas`, as in `break-even-mrr-calculator/page.tsx` |

New or improved shared components built in planning: none. Every control and result fits an existing component. Shared files touched: none.

Optional shared improvement, not built: a per-series `step` option on line charts in `app/ui/charts/chart-option.ts`, using ECharts `step: "start"`. It would draw annual billings as a true step. It's left out because a one-month slope across 36 points reads correctly, and the chart files belong to every page. Report it to the coordinator if the audit flags the slope.

Tool-specific component, in the route file:

- `AnnualPlanDiscountCalculator`. It owns the raw form state, all three offer drafts, preset filling and the edited summary, the error mapping by `AnnualPlanFieldKey`, focus, status, and rendering the results. It calls only `calculateAnnualPlanDiscount` and reads `ANNUAL_PLAN_FEE_PRESETS`. It turns cents into numbers only for the chart spec.

### States

- **Initial.** Every value field is blank. `USD`, `Discount`, and fee `None` are selected. The disclosure is closed. No result. The clean URL doesn't change.
- **Invalid or incomplete.** Clear any old result and keep the inputs. Show one error under each invalid field, focus the first invalid field in reading order, and add no error panel. If the first error is inside the closed fee disclosure, open it before focusing. A `feePreset` currency error focuses the preset select.
- **Valid without churn.** The lead, the thresholds (break-even reads `Add monthly churn`), the table with `Charged at signup` and `MRR`, and the assumptions line without the churn sentence. No chart. This is a full answer to the conversion question, not an error.
- **Valid with churn and no renewal.** Month 24 and 36 annual cells read `Needs renewal rate`. The chart runs from month 1 to 12. The break-even line has no third line.
- **Valid with everything.** All five regions. Focus the lead and let it announce once.
- **Surcharge, zero discount, zero churn, 100% churn, negative net.** Valid results in the same layout, with honest signs.
- **Edited after a result.** Clear the result and announce once, politely: `Inputs changed. Compare again.` Focus stays where the person is typing. Opening or closing the disclosure isn't an edit.
- **Mode switch.** The visible field changes, the drafts stay, and the result clears. Focus stays on the choice group.
- **Preset chosen.** Fill both fee fields and clear the result. Editing a filled value adds `(edited)` to the summary.
- **Reset.** Restore the initial state with every draft cleared and the disclosure closed. Focus `Monthly price` and announce `Form reset.`
- **Unexpected failure.** If the engine throws, keep the inputs, clear the result, show one `UiStatus` error by the actions (`Couldn't calculate. Try again.`), and leave the button enabled.
- **Restored.** If the back-forward cache restores a result, the next edit clears it.
- **Long values.** `$12,000,000,000.00`, `−$12,345,678.90`, and `Needs renewal rate` must fit in table cells without clipping. The table may scroll inside its own frame. The lead value wraps rather than overflowing.
- **Loading, empty, partial request, and retry.** These don't apply. The calculation is local and synchronous.

### Responsive and accessible behavior

Desktop:

- Shared workbench band with a measured inner width, as on the sibling SaaS tools.
- Currency and monthly price share one row. The offer choice group and its field sit on their own row. Churn and renewal share a row.
- Results stack full width: lead, thresholds, table, chart, assumptions. The table needs four columns at real widths, so nothing sits beside it.

Mobile:

- One column, in the order above. The fee fields stack.
- `UiDataTable` turns into labeled rows. Each fee second line stays under its value.
- The chart fills the width at its default height. Its legend toggles stay reachable.
- Buttons go full width. No page-level horizontal overflow. Grid children get `min-width: 0`.

Keyboard and screen readers:

- Tab order follows the visual order. The disclosure button sits between renewal and the actions.
- Enter in any field submits.
- Every field has a visible label. Required fields have `*`, and optional fields say so in the label hint.
- Errors are tied to their fields with `aria-describedby`.
- One polite live region announces edits, mode changes, preset changes caused by currency, resets, and failures. Results are announced only through the focused lead.
- The chart carries its title. With 72 values it gets the wrapper's description rather than a hidden table. The comparison table already gives the exact checkpoint numbers.

Check at desktop and mobile, in both themes:

- Example 1 with the Stripe preset: all regions, fee lines, and the month 36 net turning positive.
- Example 2, renewal blank: `Needs renewal rate` and the 12-month chart.
- Example 4: the rounding note.
- Example 8: the surcharge wording.
- No churn: the conversion-only result.
- Invalid `20%` in the discount field, and `110` months free.
- A named preset, then switch currency to EUR.
- Example 13: long values in the table.

## Content

Plan for the writing pass. The page copy lives in the route's `content/intro.mdx`, `usage.mdx`, and `article.mdx`. Don't copy this plan into the page.

### Search intent and title

The searcher is a founder with a monthly plan who has to set the annual price. They want to turn an offer like "2 months free" into a percent and a price, and to know whether the upfront cash makes up for the discount once some monthly customers would have left anyway. The top results each answer one direction, mix up two meanings of "break even", stop at year one, ignore fees, or quote an unsourced "healthy" range. This page converts all three ways, names both thresholds, runs to month 36 with a separate renewal rate, and shows fees per charge.

- Visible title: `Annual plan discount calculator: monthly vs annual pricing for SaaS`
- SEO title: `Annual plan discount calculator: monthly vs annual pricing`
- SEO description: `Convert an annual price, discount, or months free. Compare what monthly and annual plans collect per customer after churn, renewals, and processor fees.`
- Card name: `Annual plan discount`
- Card description: `Price an annual plan and compare what it collects against monthly billing.`

### Reader questions and where each is answered

| Question | Where |
| --- | --- |
| What discount is 2 months free? What price is 20% off? | Tool lead. Article: formula and a table of common offers at $20. |
| Is 2 months free the same as 20% off? | Article, own section. 16.7% vs 20%, $200 vs $192. |
| What does the customer save? | Tool lead. |
| When has a monthly customer paid as much as the annual price? | Tool threshold `Annual price in monthly payments`. Article: two thresholds table. |
| Does annual collect more or less than monthly after churn? | Tool threshold `Break-even discount at N% churn`, the table, and the chart. Usage: worked example. Article: how churn moves it. |
| What about year two and three? | Tool table and chart with a renewal rate. Article: renewal section with a 50% case. |
| Is annual MRR the upfront payment? | Tool MRR row note. Article: MRR section with Stripe and Paddle links. |
| Do fees make annual cheaper to collect? | Tool fee rows. Article: fee table at four presets, with dated sources. |
| What about refunds? | Article, short section with processor refund links. |
| What annual discount should I offer? | Article: the tool doesn't pick one, and why. |

### Outline

**Intro.** What you get, and what to have ready. Three sentences.

**Usage.** `What to enter`: where each number comes from, that "2 months free" goes in `Months free`, customer churn not revenue churn, renewal as a separate guess for new products, presets as editable published US rates. `How to read the result`: the lead, the two thresholds, the table, the chart. One `Example`: $20, 2 months free, 3% churn, 70% renewal.

**Article.**

1. `How do you calculate an annual plan discount?` Formula box, then a table of six common offers at $20.
2. `Is 2 months free the same as 20% off?` No. Two sentences and the numbers.
3. `What are the two break-even numbers?` A table naming both thresholds, the question each answers, and the $192 example (9.6 and the 10th payment, 15.0% at 3% churn).
4. `How does monthly churn change the comparison?` Expected payments formula, 10.21 payments in year one at 3%. The 6% case flips the result.
5. `Why is the annual renewal rate separate from monthly churn?` Annual customers leave only at year end. The 50% renewal case: month 36 break-even turns to `None`. One `Warning` against plugging in 100 minus monthly churn.
6. `Is annual plan MRR the same as the upfront payment?` No. $16.67 MRR, $200 cash. Stripe and Paddle links.
7. `Do processor fees make annual billing cheaper?` A table of year-one fees at four presets. Fee savings are $4.46 to $7.70 next to a $40 discount. The Stripe example turns month 36 from $5.98 behind to $0.20 ahead. A `Note` with dated sources.
8. `What happens when you refund an annual plan?` Before refunds. One line each on Stripe, Paddle, Lemon Squeezy.
9. `What annual discount should you offer?` No pick, no benchmark, no conversion claim. Try several churn and renewal values.
10. `What this calculator doesn't cover`, then next steps.

Formats: one formula box, one example, three tables, one warning, one note. No article chart; the tool already draws one. No marker art in the article.

### Left out on purpose

- Input format rules, blank vs zero, and the `0.00` annual price case: field hints and engine messages.
- Surcharges above 12 payments: the lead says it. One clause in usage.
- Rounding of derived prices: the lead's rounding note.
- Customer counts and signup mix: out of scope in the product contract.

### Facts and sources

- Conversion formulas and every example figure come from `calculateAnnualPlanDiscount`, run 2026-10-10.
- Annual MRR is the annual price ÷ 12, not cash: [Stripe MRR and ARR](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29), [Paddle MRR](https://www.paddle.com/help/profitwell-metrics/measure/subscription-metrics/mrr).
- Stripe US card 2.9% + $0.30 and Billing 0.7%: [Stripe pricing](https://stripe.com/pricing), checked 2026-10-10.
- Paddle 5% + $0.50: [Paddle pricing](https://www.paddle.com/pricing), checked 2026-10-10.
- Lemon Squeezy 5% + $0.50, plus 0.5% on subscriptions, 1.5% international, 1.5% PayPal: [Lemon Squeezy fees](https://docs.lemonsqueezy.com/help/getting-started/fees), checked 2026-10-10.
- Refunds: [Stripe refunded payment fees](https://support.stripe.com/questions/understanding-fees-for-refunded-payments), [Paddle refunds](https://www.paddle.com/help/manage/your-customers/how-do-i-issue-refunds), [Lemon Squeezy refunds](https://docs.lemonsqueezy.com/help/payments/refunds-chargebacks), checked 2026-10-10.

Claims to avoid: a best or healthy discount, that annual plans lift conversion or retention, that annual customers can't cancel or get refunds, that MRR is cash, that monthly churn converts to a renewal rate, and that fee savings make a discount profitable.

### Next steps

[`/customer-churn-calculator`](/customer-churn-calculator) for the churn input (in usage), [`/churn-rate-converter`](/churn-rate-converter) in the renewal warning, [`/mrr-goal-calculator`](/mrr-goal-calculator) in the MRR section, [`/mrr-calculator`](/mrr-calculator) for MRR across plans, [`/customer-lifetime-value-calculator`](/customer-lifetime-value-calculator) for value per customer, and [`/platform-fees`](/platform-fees) for other platform charges.
