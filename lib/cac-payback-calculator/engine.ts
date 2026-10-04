import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import {
  SAAS_ECONOMICS_MAX_MONEY_CENTS,
  divideCeil,
  divideHalfAwayFromZero,
  isSaasEconomicsCurrency,
  parseMoneyCents,
  parsePercentHundredths,
  parseWholeNumber,
} from "../saas-economics/shared.ts";

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
  cacCents: bigint;                     // Rounded display value; a positive derived CAC can round to 0n.
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function calculateRetention(
  cacNumerator: bigint, cacDenominator: bigint, gpScaled: bigint, churn: bigint,
  straightLine: CacPaybackStraightLine,
): CacPaybackRetention {
  if (straightLine.kind === "zeroAcquisitionCost" || straightLine.kind === "never") return straightLine;
  if (churn === 0n) return { kind: "finite", recoveryMonth: straightLine.recoveryMonth };
  const grossProfitProduct = gpScaled * cacDenominator;
  if (churn === 10000n) {
    return grossProfitProduct >= cacNumerator * 10000n
      ? { kind: "finite", recoveryMonth: 1n }
      : { kind: "never", reason: "churnLimit", lifetimeGrossProfitCents: divideHalfAwayFromZero(gpScaled, 10000n) };
  }
  if (cacNumerator * churn >= grossProfitProduct) {
    return { kind: "never", reason: "churnLimit", lifetimeGrossProfitCents: divideHalfAwayFromZero(gpScaled, churn) };
  }
  const remainingCeiling = grossProfitProduct - cacNumerator * churn;
  let fullPower = 1n;
  let retentionPower = 1n;
  for (let month = 1; month <= CAC_PAYBACK_HORIZON_MONTHS; month++) {
    fullPower *= 10000n;
    retentionPower *= 10000n - churn;
    if (remainingCeiling * fullPower >= grossProfitProduct * retentionPower) {
      return { kind: "finite", recoveryMonth: BigInt(month) };
    }
  }
  return { kind: "beyondHorizon", horizonMonths: CAC_PAYBACK_HORIZON_MONTHS };
}

export function calculateCacPayback(inputValue: unknown): CacPaybackCalculation {
  const input = asRecord(inputValue);
  const errors: CacPaybackErrors = {};
  const formError = "Something in the form is out of date. Reset and try again.";
  if (!input) return { status: "invalid", values: null, errors: { form: formError } };
  const currency = typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = "Choose one of the listed options.";
  const cacSource = input.cacSource;
  if (cacSource !== "direct" && cacSource !== "spend") errors.cacSource = "Choose one of the listed options.";
  if (typeof input.compare !== "boolean" || typeof input.includeChurn !== "boolean") errors.form = formError;

  function scenario(raw: unknown, key: CacPaybackScenarioKey): CacPaybackScenarioValues | null {
    const source = asRecord(raw);
    if (!source) { errors.form = formError; return null; }
    let hasError = false;
    function money(field: CacPaybackScenarioField, label: string): bigint | null {
      const parsed = parseMoneyCents(source![field], { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
      if (parsed.ok) return parsed.value;
      hasError = true;
      errors[`${key}.${field}`] = parsed.reason === "missing" ? `Enter ${label}.`
        : parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
        : "Use digits with up to two decimals. No signs, commas, or currency symbols.";
      return null;
    }
    function percent(field: CacPaybackScenarioField, min: bigint, message: string): bigint | null {
      const parsed = parsePercentHundredths(source![field], { min, max: 10000n });
      if (parsed.ok) return parsed.value;
      hasError = true;
      errors[`${key}.${field}`] = message;
      return null;
    }
    let numerator: bigint | null = null;
    let denominator = 1n;
    let acquisitionSpendCents: bigint | null = null;
    let newCustomers: bigint | null = null;
    if (cacSource === "direct") numerator = money("cac", "CAC");
    else if (cacSource === "spend") {
      numerator = acquisitionSpendCents = money("acquisitionSpend", "sales and marketing spend");
      const parsed = parseWholeNumber(source.newCustomers, { min: 1n, max: 10000000n });
      if (!parsed.ok) {
        hasError = true;
        errors[`${key}.newCustomers`] = "Enter a whole number from 1 to 10,000,000.";
      } else denominator = newCustomers = parsed.value;
    }
    const monthlyArpaCents = money("monthlyArpa", "monthly ARPA");
    const grossMarginHundredths = percent("grossMarginPercent", -10000n, "Enter a percent from -100 to 100, with up to two decimals.");
    const monthlyChurnHundredths = input!.includeChurn === true
      ? percent("monthlyChurnPercent", 0n, "Enter a percent from 0 to 100, with up to two decimals.") : null;
    if (hasError || numerator === null || monthlyArpaCents === null || grossMarginHundredths === null) return null;

    const gpScaled = monthlyArpaCents * grossMarginHundredths;
    const monthlyGrossProfitCents = divideHalfAwayFromZero(gpScaled, 10000n);
    let straightLine: CacPaybackStraightLine;
    let revenueOnly: CacPaybackRevenueOnly;
    if (numerator === 0n) {
      straightLine = { kind: "zeroAcquisitionCost" };
      revenueOnly = { kind: "zeroAcquisitionCost" };
    } else {
      if (gpScaled <= 0n) straightLine = { kind: "never", reason: gpScaled === 0n ? "zeroGrossProfit" : "negativeGrossProfit" };
      else {
        const tenths = divideHalfAwayFromZero(numerator * 100000n, denominator * gpScaled);
        straightLine = { kind: "finite", tenths, tenthsUnderOne: tenths === 0n, recoveryMonth: divideCeil(numerator * 10000n, denominator * gpScaled) };
      }
      if (monthlyArpaCents === 0n) revenueOnly = { kind: "zeroArpa" };
      else {
        const tenths = divideHalfAwayFromZero(numerator * 10n, denominator * monthlyArpaCents);
        revenueOnly = { kind: "finite", tenths, tenthsUnderOne: tenths === 0n };
      }
    }
    return {
      cacCents: divideHalfAwayFromZero(numerator, denominator), cacIsRounded: numerator % denominator !== 0n,
      acquisitionSpendCents, newCustomers, monthlyArpaCents, grossMarginHundredths,
      monthlyGrossProfitCents, monthlyGrossProfitRoundedToZero: gpScaled !== 0n && monthlyGrossProfitCents === 0n,
      revenueOnly, straightLine, monthlyChurnHundredths,
      retention: monthlyChurnHundredths === null ? null : calculateRetention(numerator, denominator, gpScaled, monthlyChurnHundredths, straightLine),
    };
  }

  const baseline = scenario(input.baseline, "baseline");
  const alternative = input.compare === true ? scenario(input.alternative, "alternative") : null;
  if (Object.keys(errors).length || !baseline || (input.compare === true && !alternative)
    || !isSaasEconomicsCurrency(currency) || (cacSource !== "direct" && cacSource !== "spend")) {
    return { status: "invalid", values: null, errors };
  }
  const comparison: CacPaybackComparison | null = alternative === null ? null : {
    straightLineTenthsDelta: baseline.straightLine.kind === "finite" && alternative.straightLine.kind === "finite"
      ? alternative.straightLine.tenths - baseline.straightLine.tenths : null,
    retentionMonthDelta: baseline.retention?.kind === "finite" && alternative.retention?.kind === "finite"
      ? alternative.retention.recoveryMonth - baseline.retention.recoveryMonth : null,
  };
  return { status: "valid", errors: {}, values: {
    currency, cacSource, includeChurn: input.includeChurn as boolean, baseline, alternative, comparison,
  } };
}
