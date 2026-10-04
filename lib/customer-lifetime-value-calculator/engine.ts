import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type SaasPeriodBasis } from "../saas-economics/unit-economics.ts";
import { SAAS_ECONOMICS_MAX_MONEY_CENTS, isSaasEconomicsCurrency, parseMoneyCents, parsePercentHundredths } from "../saas-economics/shared.ts";
import { type ExactFraction, cumulativeGrossProfit, exactFraction, compareExact, modelLtv, periodGrossProfit, roundExact, shareOfLtvEarned, signOfExact } from "../saas-economics/unit-economics.ts";

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

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

function moneyOutput(value: ExactFraction): CustomerLtvMoney {
  const cents = roundExact(value);
  return { cents, roundedToZero: value.numerator !== 0n && cents === 0n };
}

export function calculateCustomerLifetimeValue(raw: unknown): CustomerLtvCalculation {
  const input = record(raw);
  const errors: CustomerLtvErrors = {};
  const formError = "Something in the form is out of date. Reset and try again.";
  if (!input) return { status: "invalid", values: null, errors: { form: formError } };
  const currency = typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = "Choose one of the listed options.";
  const basis = input.basis;
  if (basis !== "month" && basis !== "year") errors.basis = "Choose one of the listed options.";
  if (typeof input.compare !== "boolean") errors.form = formError;
  const period = basis === "month" ? "monthly" : basis === "year" ? "yearly" : "per-period";

  function scenario(rawScenario: unknown, key: CustomerLtvScenarioKey): CustomerLtvScenarioValues | null {
    const source = record(rawScenario);
    if (!source) { errors.form = formError; return null; }
    const arpa = parseMoneyCents(source.arpa, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (!arpa.ok) errors[`${key}.arpa`] = arpa.reason === "missing" ? `Enter ${period} ARPA.`
      : arpa.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
      : "Use digits with up to two decimals. No signs, commas, or currency symbols.";
    const margin = parsePercentHundredths(source.grossMarginPercent, { min: -10000n, max: 10000n });
    if (!margin.ok) errors[`${key}.grossMarginPercent`] = "Enter a percent from -100 to 100, with up to two decimals.";
    const churn = parsePercentHundredths(source.churnPercent, { min: 0n, max: 10000n });
    if (!churn.ok) errors[`${key}.churnPercent`] = churn.reason === "missing"
      ? `Enter ${period} customer churn. Use 0 if no customers left.` : "Enter a percent from 0 to 100, with up to two decimals.";
    if (!arpa.ok || !margin.ok || !churn.ok || (basis !== "month" && basis !== "year")) return null;
    const modelInput = { arpaCents: arpa.value, grossMarginHundredths: margin.value, churnHundredths: churn.value };
    const profit = periodGrossProfit(arpa.value, margin.value);
    const model = modelLtv(modelInput);
    const checkpoints = CUSTOMER_LTV_CHECKPOINTS[basis].map((periods): CustomerLtvCheckpoint => {
      const share = shareOfLtvEarned(churn.value, periods);
      const tenths = share === null ? null : roundExact(share, 1000n);
      return {
        periods, grossProfit: moneyOutput(cumulativeGrossProfit(modelInput, periods)),
        shareOfLtv: share === null ? null : {
          tenths: tenths!, underOneTenth: share.numerator > 0n && tenths === 0n,
          nearlyAll: compareExact(share, exactFraction(1n)) < 0 && tenths === 1000n,
        },
      };
    });
    const finalShare = shareOfLtvEarned(churn.value, CUSTOMER_LTV_CHECKPOINTS[basis].at(-1)!);
    const sign = signOfExact(profit);
    return {
      arpaCents: arpa.value, grossMarginHundredths: margin.value, churnHundredths: churn.value,
      periodGrossProfit: moneyOutput(profit), grossProfitSign: sign < 0 ? "negative" : sign > 0 ? "positive" : "zero",
      estimate: model.kind === "notEstimable" ? model : {
        kind: "finite", grossProfit: moneyOutput(model.grossProfit), revenue: moneyOutput(model.revenue), lifetimeTenths: roundExact(model.lifetimePeriods, 10n),
      },
      checkpoints, lessThanHalfByLastCheckpoint: finalShare === null ? null : compareExact(finalShare, exactFraction(1n, 2n)) < 0,
    };
  }
  const baseline = scenario(input.baseline, "baseline");
  const alternative = input.compare === true ? scenario(input.alternative, "alternative") : null;
  if (Object.keys(errors).length || !baseline || (input.compare === true && !alternative)
    || !isSaasEconomicsCurrency(currency) || (basis !== "month" && basis !== "year")) {
    return { status: "invalid", values: null, errors };
  }
  return { status: "valid", errors: {}, values: {
    currency, basis, baseline, alternative,
    comparison: alternative === null ? null : { ltvDeltaCents: baseline.estimate.kind === "finite" && alternative.estimate.kind === "finite"
      ? alternative.estimate.grossProfit.cents - baseline.estimate.grossProfit.cents : null },
  } };
}
