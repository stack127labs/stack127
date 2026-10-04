import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import { type SaasPeriodBasis, type StraightLinePayback } from "../saas-economics/unit-economics.ts";
import { SAAS_ECONOMICS_MAX_MONEY_CENTS, isSaasEconomicsCurrency, parseMoneyCents, parsePercentHundredths, parseWholeNumber } from "../saas-economics/shared.ts";
import { type ExactFraction, exactFraction, compareExact, divideExact, isWholeAtScale, modelLtv, periodGrossProfit, roundExact, signOfExact, straightLinePaybackMonths } from "../saas-economics/unit-economics.ts";

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

const record = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;

function moneyOutput(value: ExactFraction): LtvCacMoney {
  const cents = roundExact(value);
  return { cents, roundedToZero: value.numerator !== 0n && cents === 0n };
}

export function calculateLtvCac(raw: unknown): LtvCacCalculation {
  const input = record(raw);
  const errors: LtvCacErrors = {};
  const formError = "Something in the form is out of date. Reset and try again.";
  if (!input) return { status: "invalid", values: null, errors: { form: formError } };
  const currency = typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = "Choose one of the listed options.";
  const ltvSource = input.ltvSource;
  const cacSource = input.cacSource;
  const basis = input.basis;
  if (ltvSource !== "model" && ltvSource !== "direct") errors.ltvSource = "Choose one of the listed options.";
  if (cacSource !== "direct" && cacSource !== "spend") errors.cacSource = "Choose one of the listed options.";
  if (ltvSource === "model" && basis !== "month" && basis !== "year") errors.basis = "Choose one of the listed options.";
  if (typeof input.compare !== "boolean") errors.form = formError;
  const period = basis === "month" ? "monthly" : basis === "year" ? "yearly" : "per-period";

  function scenario(rawScenario: unknown, key: LtvCacScenarioKey): LtvCacScenarioValues | null {
    const source = record(rawScenario);
    if (!source) { errors.form = formError; return null; }
    let failed = false;
    function error(field: LtvCacScenarioField, message: string) { failed = true; errors[`${key}.${field}`] = message; }
    function money(field: LtvCacScenarioField, label: string): bigint | null {
      const parsed = parseMoneyCents(source![field], { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
      if (parsed.ok) return parsed.value;
      error(field, parsed.reason === "missing" ? `Enter ${label}.`
        : parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
        : "Use digits with up to two decimals. No signs, commas, or currency symbols.");
      return null;
    }
    const cacScope = source.cacScope;
    if (cacScope !== "allAcquisition" && cacScope !== "paidMedia") error("cacScope", "Choose what this CAC includes.");
    let acquisitionSpendCents: bigint | null = null;
    let newCustomers: bigint | null = null;
    let cac: ExactFraction | null = null;
    if (cacSource === "direct") {
      const amount = money("cac", "CAC");
      if (amount !== null) cac = exactFraction(amount);
    } else if (cacSource === "spend") {
      acquisitionSpendCents = money("acquisitionSpend", "acquisition spend");
      const count = parseWholeNumber(source.newCustomers, { min: 1n, max: 10000000n });
      if (!count.ok) error("newCustomers", "Enter a whole number from 1 to 10,000,000.");
      else newCustomers = count.value;
      if (acquisitionSpendCents !== null && newCustomers !== null) cac = exactFraction(acquisitionSpendCents, newCustomers);
    }
    let ltv: LtvCacLtv | null = null;
    let exactLtv: ExactFraction | null = null;
    let payback: StraightLinePayback | null = null;
    if (ltvSource === "direct") {
      const amount = money("ltv", "LTV");
      if (amount !== null) { exactLtv = exactFraction(amount); ltv = { source: "direct", value: moneyOutput(exactLtv) }; }
    } else if (ltvSource === "model") {
      const arpa = money("arpa", `${period} ARPA`);
      const margin = parsePercentHundredths(source.grossMarginPercent, { min: -10000n, max: 10000n });
      if (!margin.ok) error("grossMarginPercent", "Enter a percent from -100 to 100, with up to two decimals.");
      const churn = parsePercentHundredths(source.churnPercent, { min: 0n, max: 10000n });
      if (!churn.ok) error("churnPercent", churn.reason === "missing" ? `Enter ${period} customer churn. Use 0 if no customers left.` : "Enter a percent from 0 to 100, with up to two decimals.");
      if (arpa !== null && margin.ok && churn.ok) {
        const profit = periodGrossProfit(arpa, margin.value);
        const sign = signOfExact(profit);
        const model = modelLtv({ arpaCents: arpa, grossMarginHundredths: margin.value, churnHundredths: churn.value });
        exactLtv = model.kind === "finite" ? model.grossProfit : null;
        ltv = {
          source: "model", arpaCents: arpa, grossMarginHundredths: margin.value, churnHundredths: churn.value,
          periodGrossProfit: moneyOutput(profit), grossProfitSign: sign < 0 ? "negative" : sign > 0 ? "positive" : "zero",
          lifetimeTenths: model.kind === "finite" ? roundExact(model.lifetimePeriods, 10n) : null,
          value: exactLtv === null ? null : moneyOutput(exactLtv),
        };
        if (cac !== null && (basis === "month" || basis === "year")) payback = straightLinePaybackMonths(cac, profit, basis);
      }
    }
    if (failed || cac === null || ltv === null || (cacScope !== "allAcquisition" && cacScope !== "paidMedia")) return null;
    let ratio: LtvCacRatio;
    if (cac.numerator === 0n) ratio = { kind: "zeroAcquisitionCost" };
    else if (exactLtv === null) ratio = { kind: "ltvNotEstimable" };
    else if (exactLtv.numerator < 0n) ratio = { kind: "negativeLtv" };
    else {
      const exactRatio = divideExact(exactLtv, cac);
      const hundredths = roundExact(exactRatio, 100n);
      ratio = { kind: "finite", hundredths, hundredthsUnderOne: exactRatio.numerator > 0n && hundredths === 0n };
    }
    const recoveryComparison = exactLtv === null ? null : compareExact(exactLtv, cac);
    return {
      cacScope, ltv, cac: {
        ...moneyOutput(cac), isRounded: !isWholeAtScale(cac, 1n), isZero: cac.numerator === 0n, acquisitionSpendCents, newCustomers,
      }, ratio, payback,
      cohortRecovers: ratio.kind !== "finite" || ltv.source !== "model" ? null
        : ltv.churnHundredths === 10000n ? recoveryComparison! >= 0 : recoveryComparison! > 0,
    };
  }
  const baseline = scenario(input.baseline, "baseline");
  const alternative = input.compare === true ? scenario(input.alternative, "alternative") : null;
  if (Object.keys(errors).length || !baseline || (input.compare === true && !alternative) || !isSaasEconomicsCurrency(currency)
    || (ltvSource !== "model" && ltvSource !== "direct") || (cacSource !== "spend" && cacSource !== "direct")
    || (ltvSource === "model" && basis !== "month" && basis !== "year")) return { status: "invalid", values: null, errors };
  return { status: "valid", errors: {}, values: {
    currency, ltvSource, cacSource, basis: ltvSource === "model" ? basis as SaasPeriodBasis : null, baseline, alternative,
    comparison: alternative === null ? null : {
      ratioHundredthsDelta: baseline.ratio.kind === "finite" && alternative.ratio.kind === "finite"
        ? alternative.ratio.hundredths - baseline.ratio.hundredths : null,
      paybackTenthsDelta: baseline.payback?.kind === "finite" && alternative.payback?.kind === "finite"
        ? alternative.payback.tenths - baseline.payback.tenths : null,
    },
  } };
}
