import {
  isSaasEconomicsCurrency, parseMoneyCents, parseOptionalLabel, parseWholeNumber,
  SAAS_ECONOMICS_MAX_MONEY_CENTS, type SaasEconomicsCurrency,
} from "../saas-economics/shared.ts";
import {
  addExact, divideExact, exactFraction, isWholeAtScale, multiplyExact, roundExact,
  type ExactFraction,
} from "../saas-economics/unit-economics.ts";

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

const formError = "Something in the form is out of date. Reset and try again.";
const optionError = "Choose one of the listed options.";
const maximumCount = 10_000_000n;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function conversionRate(starts: bigint, paid: bigint): TrialConversionRate {
  if (starts === 0n) return { kind: "notAvailable", reason: "noStarts" };
  const exact = multiplyExact(divideExact(exactFraction(paid), exactFraction(starts)), exactFraction(100n));
  const hundredths = roundExact(exact, 100n);
  return {
    kind: "finite", hundredths, exact, isRounded: !isWholeAtScale(exact, 100n),
    roundedToZero: paid > 0n && hundredths === 0n,
  };
}

export function calculateFreeTrialConversion(inputValue: unknown): FreeTrialConversionCalculation {
  const input = asRecord(inputValue);
  const errors: FreeTrialConversionErrors = {};
  if (!input) return { status: "invalid", values: null, errors: { form: formError } };
  if (typeof input.includeMrr !== "boolean") errors.form = formError;
  const model = input.model;
  if (typeof model !== "string" || !TRIAL_MODELS.includes(model as TrialModel)) errors.model = optionError;

  const parsedWindow = parseWholeNumber(input.windowDays, { min: 1n, max: 730n });
  if (!parsedWindow.ok) errors.windowDays = parsedWindow.reason === "missing"
    ? "Enter the follow-up window in days." : "Enter whole days from 1 to 730.";

  function count(raw: unknown, key: TrialFieldKey): bigint | null {
    const parsed = parseWholeNumber(raw, { min: 0n, max: maximumCount });
    if (parsed.ok) return parsed.value;
    errors[key] = typeof raw === "string" && raw.trim().startsWith("-")
      ? "Counts can't be negative."
      : parsed.reason === "missing" ? "Enter a count. Use 0 if there were none."
      : parsed.reason === "range" ? "Enter a number up to 10,000,000."
      : "Use a whole number with no commas or decimals.";
    return null;
  }

  function money(raw: unknown, key: TrialFieldKey): bigint | null {
    const parsed = parseMoneyCents(raw, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (parsed.ok) return parsed.value;
    errors[key] = parsed.reason === "missing" ? "Enter an amount."
      : parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
      : "Use digits with up to two decimals. No signs, commas, or currency symbols.";
    return null;
  }

  const cohorts: TrialCohortResult[] = [];
  let paidCustomers = 0n;
  let allCohortCountsParsed = true;
  if (!Array.isArray(input.cohorts)) {
    errors.form = formError;
    allCohortCountsParsed = false;
  } else {
    if (input.cohorts.length === 0) errors.cohorts = "Add at least one cohort.";
    if (input.cohorts.length > TRIAL_MAX_COHORTS) errors.cohorts = "Use up to 12 cohorts.";
    for (let index = 0; index < input.cohorts.length; index += 1) {
      const row = asRecord(input.cohorts[index]);
      if (!row) {
        errors.form = formError;
        allCohortCountsParsed = false;
        continue;
      }
      const label = parseOptionalLabel(row.label, 40);
      if (!label.ok) errors[`cohorts.${index}.label`] = "Use a name up to 40 characters on one line.";
      const starts = count(row.starts, `cohorts.${index}.starts`);
      const paid = count(row.paid, `cohorts.${index}.paid`);
      if (starts === null || paid === null) allCohortCountsParsed = false;
      if (paid !== null) paidCustomers += paid;
      if (starts !== null && paid !== null && paid > starts) {
        errors[`cohorts.${index}.paid`] = "Paid can't be more than starts. Count only accounts from this cohort.";
      }
      const age = parseWholeNumber(row.ageDays, { min: 0n, max: 3650n });
      if (!age.ok) errors[`cohorts.${index}.ageDays`] = age.reason === "missing"
        ? "Enter the days since this cohort's last start." : "Enter whole days from 0 to 3,650.";
      if (label.ok && starts !== null && paid !== null && paid <= starts && age.ok && parsedWindow.ok) {
        cohorts.push({
          index, label: label.value, starts, paid, notPaid: starts - paid, ageDays: age.value,
          rate: conversionRate(starts, paid),
          maturity: age.value >= parsedWindow.value ? { status: "complete" }
            : { status: "maturing", daysLeft: parsedWindow.value - age.value },
        });
      }
    }
  }

  let newMrr: TrialNewMrr | null = null;
  if (input.includeMrr === true) {
    const currency = input.currency;
    const method = input.mrrMethod;
    if (!isSaasEconomicsCurrency(currency)) errors.currency = optionError;
    if (typeof method !== "string" || !TRIAL_MRR_METHODS.includes(method as TrialMrrMethod)) errors.mrrMethod = optionError;
    let averageMonthlyCents: bigint | null = null;
    let monthlyPlan: TrialNewMrr["monthlyPlan"] = null;
    let annualPlan: TrialNewMrr["annualPlan"] = null;
    let exactMrr: ExactFraction | null = null;
    if (method === "average") {
      averageMonthlyCents = money(input.averageMonthly, "averageMonthly");
      if (averageMonthlyCents !== null) exactMrr = multiplyExact(exactFraction(paidCustomers), exactFraction(averageMonthlyCents));
    } else if (method === "split") {
      const monthlyCustomers = count(input.monthlyCustomers, "monthlyCustomers");
      const monthlyPrice = money(input.monthlyPrice, "monthlyPrice");
      const annualCustomers = count(input.annualCustomers, "annualCustomers");
      const annualPrice = money(input.annualPrice, "annualPrice");
      if (allCohortCountsParsed && monthlyCustomers !== null && annualCustomers !== null
        && monthlyCustomers + annualCustomers !== paidCustomers) {
        const formattedPaid = paidCustomers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        errors.monthlyCustomers = `Monthly and annual customers must add up to ${formattedPaid}, the paid customers above.`;
      }
      if (monthlyCustomers !== null && monthlyPrice !== null && annualCustomers !== null && annualPrice !== null) {
        monthlyPlan = { customers: monthlyCustomers, priceCents: monthlyPrice, mrrCents: monthlyCustomers * monthlyPrice };
        const annualMrr = divideExact(multiplyExact(exactFraction(annualCustomers), exactFraction(annualPrice)), exactFraction(12n));
        annualPlan = { customers: annualCustomers, annualPriceCents: annualPrice, mrrCents: roundExact(annualMrr), isRounded: !isWholeAtScale(annualMrr, 1n) };
        exactMrr = addExact(exactFraction(monthlyPlan.mrrCents), annualMrr);
      }
    }
    if (isSaasEconomicsCurrency(currency) && (method === "average" || method === "split") && exactMrr !== null) {
      newMrr = {
        currency, method, paidCustomers, averageMonthlyCents, monthlyPlan, annualPlan,
        mrrCents: roundExact(exactMrr), mrrIsRounded: !isWholeAtScale(exactMrr, 1n),
        runRateArrCents: roundExact(multiplyExact(exactMrr, exactFraction(12n))),
      };
    }
  }
  if (Object.keys(errors).length > 0 || !parsedWindow.ok) return { status: "invalid", values: null, errors };

  const complete = cohorts.filter(row => row.maturity.status === "complete");
  const useComplete = complete.reduce((sum, row) => sum + row.starts, 0n) > 0n;
  const included = useComplete ? complete : cohorts;
  const starts = included.reduce((sum, row) => sum + row.starts, 0n);
  const paid = included.reduce((sum, row) => sum + row.paid, 0n);
  const combined: TrialCombined = {
    basis: useComplete ? "complete" : "all",
    status: useComplete || cohorts.every(row => row.maturity.status === "complete") ? "complete" : "provisional",
    includedIndexes: included.map(row => row.index),
    excludedMaturing: useComplete ? cohorts.length - complete.length : 0,
    starts, paid, notPaid: starts - paid, rate: conversionRate(starts, paid),
  };
  return { status: "valid", errors: {}, values: { model: model as TrialModel, windowDays: parsedWindow.value, cohorts, combined, newMrr } };
}
