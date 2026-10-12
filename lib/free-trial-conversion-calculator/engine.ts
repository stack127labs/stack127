import {
  type SaasEconomicsCurrency,
  SAAS_ECONOMICS_MAX_MONEY_CENTS,
  divideCeil,
  isSaasEconomicsCurrency,
  parseMoneyCents,
  parseOptionalLabel,
  parsePercentHundredths,
  parseWholeNumber,
} from "../saas-economics/shared.ts";
import {
  type ExactFraction,
  addExact,
  divideExact,
  exactFraction,
  isWholeAtScale,
  multiplyExact,
  roundExact,
} from "../saas-economics/unit-economics.ts";

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

export const FREE_TRIAL_EXAMPLE_INPUT: FreeTrialInput = {
  trialType: "noCard", starts: "500", paid: "40", windowDays: "", ageDays: "",
  activated: "", targetRate: "", currency: "USD", monthlyPrice: "", annualPrice: "",
  annualAccounts: "", cohorts: [],
};

export type TrialFieldKey =
  | "form" | "trialType" | "starts" | "paid"
  | "windowDays" | "ageDays" | "activated" | "targetRate"
  | "currency" | "monthlyPrice" | "annualPrice" | "annualAccounts"
  | "cohorts" | `cohorts.${number}.${"name" | "starts" | "paid" | "ageDays"}`;
export type TrialRate =
  | { kind: "rate"; hundredths: bigint; exact: ExactFraction; isRounded: boolean; roundedToZero: boolean }
  | { kind: "none" };
export type TrialLikelyRange = { lowHundredths: bigint; highHundredths: bigint } | null;
export type TrialMaturity =
  | { status: "complete" }
  | { status: "provisional"; daysLeft: bigint }
  | { status: "unknown" };
export type TrialCohortResult = {
  inputIndex: number | null;
  name: string;
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
    extraMrrCents: bigint | null;
  } | null;
  cohorts: {
    rows: TrialCohortResult[];
    combined: {
      basis: "settled" | "all";
      status: "complete" | "provisional" | "unknown";
      leftOut: number;
      starts: bigint;
      paid: bigint;
      rate: TrialRate;
    };
  } | null;
};
export type FreeTrialErrors = Partial<Record<TrialFieldKey, string>>;
export type FreeTrialCalculation =
  | { status: "valid"; values: FreeTrialValues; errors: FreeTrialErrors }
  | { status: "invalid"; values: null; errors: FreeTrialErrors };

const FORM_ERROR = "Something in the form is out of date. Reset and try again.";
const MAX_COUNT = 10_000_000n;
const COHORT_FIELDS = ["name", "starts", "paid", "ageDays"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function isBlank(value: unknown): boolean {
  return typeof value === "string" && value.trim() === "";
}

function blankRow(row: Record<string, unknown>): boolean {
  return COHORT_FIELDS.every(field => isBlank(row[field]));
}

function rate(numerator: bigint, denominator: bigint): TrialRate {
  if (denominator === 0n) return { kind: "none" };
  // The exact fraction is in percent, before rounding to hundredths.
  const exact = exactFraction(numerator * 100n, denominator);
  const hundredths = roundExact(exact, 100n);
  return {
    kind: "rate", hundredths, exact, isRounded: !isWholeAtScale(exact, 100n),
    roundedToZero: numerator > 0n && hundredths === 0n,
  };
}

function likely(starts: bigint, paid: bigint): TrialLikelyRange {
  if (starts === 0n) return null;
  const n = Number(starts);
  const p = Number(paid) / n;
  const zSquared = 1.96 ** 2;
  const d = 1 + zSquared / n;
  const c = p + zSquared / (2 * n);
  const s = 1.96 * Math.sqrt(p * (1 - p) / n + zSquared / (4 * n * n));
  return {
    lowHundredths: BigInt(Math.floor(Math.max(0, (c - s) / d) * 10000)),
    highHundredths: BigInt(Math.ceil(Math.min(1, (c + s) / d) * 10000)),
  };
}

function maturity(window: bigint | null, age: bigint | null, hasError: boolean): TrialMaturity {
  if (hasError || window === null || age === null) return { status: "unknown" };
  return age >= window ? { status: "complete" } : { status: "provisional", daysLeft: window - age };
}

export function calculateFreeTrialConversion(inputValue: unknown): FreeTrialCalculation {
  const input = asRecord(inputValue);
  if (!input || !Array.isArray(input.cohorts)) {
    return { status: "invalid", values: null, errors: { form: FORM_ERROR } };
  }
  const errors: FreeTrialErrors = {};
  function count(raw: unknown, key: TrialFieldKey, optional = false): bigint | null {
    if (optional && isBlank(raw)) return null;
    const parsed = parseWholeNumber(raw, { min: 0n, max: MAX_COUNT });
    if (parsed.ok) return parsed.value;
    errors[key] = typeof raw === "string" && raw.trim().startsWith("-")
      ? "Counts can't be negative."
      : parsed.reason === "missing" ? "Enter a count. Use 0 if there were none."
      : parsed.reason === "range" ? "Enter a number up to 10,000,000."
      : "Use a whole number with no commas or decimals.";
    return null;
  }
  function days(raw: unknown, key: TrialFieldKey, window = false): bigint | null {
    if (isBlank(raw)) return null;
    const parsed = parseWholeNumber(raw, { min: window ? 1n : 0n, max: window ? 730n : 3650n });
    if (parsed.ok) return parsed.value;
    errors[key] = window ? "Enter whole days from 1 to 730." : "Enter whole days from 0 to 3,650.";
    return null;
  }
  function money(raw: unknown, key: TrialFieldKey): bigint | null {
    if (isBlank(raw)) return null;
    const parsed = parseMoneyCents(raw, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (parsed.ok) return parsed.value;
    errors[key] = parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
      : "Use digits with up to two decimals. No signs, commas, or currency symbols.";
    return null;
  }

  const trialType = typeof input.trialType === "string" ? input.trialType.trim() : input.trialType;
  if (!TRIAL_TYPES.includes(trialType as TrialType)) errors.trialType = "Choose one of the listed options.";
  const starts = count(input.starts, "starts");
  const paid = count(input.paid, "paid");
  if (starts !== null && paid !== null && paid > starts) {
    errors.paid = "Paid can't be more than trial starts. Count only accounts from this cohort.";
  }

  const windowDays = days(input.windowDays, "windowDays", true);
  const ageDays = days(input.ageDays, "ageDays");
  let hasAge = !isBlank(input.ageDays);
  const activated = count(input.activated, "activated", true);
  if (activated !== null) {
    if (starts !== null && activated > starts) errors.activated = "Activated can't be more than trial starts.";
    else if (paid !== null && activated < paid) {
      errors.activated = `Activated must include everyone who paid, so it can't be less than ${paid}.`;
    }
  }

  let targetRate: bigint | null = null;
  if (!isBlank(input.targetRate)) {
    const parsed = parsePercentHundredths(input.targetRate, { min: 1n, max: 10000n });
    if (parsed.ok) targetRate = parsed.value;
    else errors.targetRate = "Enter a rate from 0.01 to 100%.";
  }

  const currency = isBlank(input.currency) ? "USD"
    : typeof input.currency === "string" ? input.currency.trim() : input.currency;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = "Choose one of the listed options.";
  const monthlyPrice = money(input.monthlyPrice, "monthlyPrice");
  const annualPrice = money(input.annualPrice, "annualPrice");
  const annualAccounts = count(input.annualAccounts, "annualAccounts", true);
  const bothPricesSet = !isBlank(input.monthlyPrice) && !isBlank(input.annualPrice);
  if (!errors.annualAccounts && !isBlank(input.annualAccounts) && !bothPricesSet) {
    errors.annualAccounts = "Enter a monthly and an annual price to split paid accounts by plan.";
  } else if (!errors.annualAccounts && bothPricesSet && isBlank(input.annualAccounts)) {
    errors.annualAccounts = "Enter how many paid accounts are on annual plans.";
  } else if (!errors.annualAccounts && annualAccounts !== null && paid !== null && annualAccounts > paid) {
    errors.annualAccounts = `Annual accounts can't be more than ${paid}, the paid count.`;
  }

  const parsedRows: { index: number; name: string; starts: bigint; paid: bigint; age: bigint | null }[] = [];
  if (input.cohorts.length > TRIAL_MAX_COHORTS) errors.cohorts = "Use up to 12 other cohorts.";
  input.cohorts.forEach((raw: unknown, index: number) => {
    const row = asRecord(raw);
    if (!row) { errors.form = FORM_ERROR; return; }
    if (blankRow(row)) return;
    const name = parseOptionalLabel(row.name, 40);
    if (!name.ok) errors[`cohorts.${index}.name`] = "Use a name up to 40 characters on one line.";
    const rowStarts = count(row.starts, `cohorts.${index}.starts`);
    const rowPaid = count(row.paid, `cohorts.${index}.paid`);
    const age = days(row.ageDays, `cohorts.${index}.ageDays`);
    hasAge ||= !isBlank(row.ageDays);
    if (rowStarts !== null && rowPaid !== null && rowPaid > rowStarts) {
      errors[`cohorts.${index}.paid`] = "Paid can't be more than starts in this cohort.";
    }
    if (name.ok && rowStarts !== null && rowPaid !== null) {
      parsedRows.push({ index, name: name.value || `Cohort ${index + 2}`, starts: rowStarts, paid: rowPaid, age });
    }
  });
  if (hasAge && isBlank(input.windowDays)) {
    errors.windowDays = "Enter the follow-up window to compare cohort age against.";
  }
  if (errors.form || errors.trialType || errors.starts || errors.paid || starts === null || paid === null) {
    return { status: "invalid", values: null, errors };
  }

  const maturityError = Boolean(errors.windowDays || errors.ageDays
    || Object.keys(errors).some(key => /^cohorts\.\d+\.ageDays$/.test(key)));
  const mainMaturity = maturity(windowDays, ageDays, maturityError);
  const activation = activated === null || errors.activated ? null : {
    activated, activationRate: rate(activated, starts), activatedToPaid: rate(paid, activated),
  };

  let revenue: FreeTrialValues["revenue"] = null;
  let exactMrr: ExactFraction | null = null;
  if (!errors.currency && !errors.monthlyPrice && !errors.annualPrice && !errors.annualAccounts
    && isSaasEconomicsCurrency(currency) && (monthlyPrice !== null || annualPrice !== null)) {
    const annual = monthlyPrice === null ? paid : annualPrice === null ? 0n : annualAccounts!;
    const monthly = paid - annual;
    exactMrr = addExact(exactFraction(monthly * (monthlyPrice ?? 0n)), exactFraction(annual * (annualPrice ?? 0n), 12n));
    revenue = {
      currency, monthlyAccounts: monthly, annualAccounts: annual,
      mrrCents: roundExact(exactMrr), mrrIsRounded: !isWholeAtScale(exactMrr, 1n),
      arrRunRateCents: roundExact(multiplyExact(exactMrr, exactFraction(12n))),
    };
  }

  let target: FreeTrialValues["target"] = null;
  if (targetRate !== null) {
    const paidAtTarget = divideCeil(targetRate * starts, 10000n);
    const extraPaid = paidAtTarget > paid ? paidAtTarget - paid : 0n;
    const perPaid = exactMrr === null ? null : paid > 0n ? divideExact(exactMrr, exactFraction(paid))
      : monthlyPrice !== null ? exactFraction(monthlyPrice) : exactFraction(annualPrice!, 12n);
    target = {
      hundredths: targetRate, paidAtTarget, extraPaid,
      extraMrrCents: perPaid === null ? null : roundExact(multiplyExact(perPaid, exactFraction(extraPaid))),
    };
  }

  let cohorts: FreeTrialValues["cohorts"] = null;
  if (parsedRows.length && !Object.keys(errors).some(key => key === "cohorts" || key.startsWith("cohorts."))) {
    const rows: TrialCohortResult[] = [
      { inputIndex: null, name: "This cohort", starts, paid, rate: rate(paid, starts), likely: likely(starts, paid), maturity: mainMaturity },
      ...parsedRows.map(row => ({
        inputIndex: row.index, name: row.name, starts: row.starts, paid: row.paid,
        rate: rate(row.paid, row.starts), likely: likely(row.starts, row.paid),
        maturity: maturity(windowDays, row.age, maturityError),
      })),
    ];
    const settled = rows.filter(row => row.maturity.status !== "provisional");
    const useSettled = settled.reduce((sum, row) => sum + row.starts, 0n) > 0n;
    const basisRows = useSettled ? settled : rows;
    const combinedStarts = basisRows.reduce((sum, row) => sum + row.starts, 0n);
    const combinedPaid = basisRows.reduce((sum, row) => sum + row.paid, 0n);
    cohorts = {
      rows,
      combined: {
        basis: useSettled ? "settled" : "all",
        status: basisRows.some(row => row.maturity.status === "provisional") ? "provisional"
          : basisRows.every(row => row.maturity.status === "complete") ? "complete" : "unknown",
        leftOut: useSettled ? rows.length - settled.length : 0,
        starts: combinedStarts, paid: combinedPaid, rate: rate(combinedPaid, combinedStarts),
      },
    };
  }
  return {
    status: "valid", errors,
    values: {
      trialType: trialType as TrialType, starts, paid, notPaid: starts - paid,
      rate: rate(paid, starts), likely: likely(starts, paid),
      trialsPerPaidTenths: paid === 0n ? null : roundExact(exactFraction(starts, paid), 10n),
      windowDays, maturity: mainMaturity, activation, revenue, target, cohorts,
    },
  };
}

const SHARE_FIELDS = {
  type: "trialType", starts: "starts", paid: "paid", window: "windowDays", age: "ageDays",
  activated: "activated", target: "targetRate", currency: "currency", monthly: "monthlyPrice",
  annual: "annualPrice", annualPaid: "annualAccounts",
} as const;

export function freeTrialShareParams(input: FreeTrialInput): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, field] of Object.entries(SHARE_FIELDS)) {
    const value = input[field].trim();
    if (value && (key !== "currency" || input.monthlyPrice.trim() || input.annualPrice.trim())) params[key] = value;
  }
  const rows = input.cohorts.filter(row => !blankRow(row));
  if (rows.length) params.cohorts = rows.map(row => [
    row.name.replace(/[~|]/g, "").trim(), row.starts.trim(), row.paid.trim(), row.ageDays.trim(),
  ].join("~")).join("|");
  return params;
}

export function freeTrialInputFromQuery(get: (key: string) => string): FreeTrialInput {
  const input: FreeTrialInput = { ...FREE_TRIAL_EXAMPLE_INPUT, cohorts: [] };
  for (const [key, field] of Object.entries(SHARE_FIELDS)) {
    input[field] = get(key) || FREE_TRIAL_EXAMPLE_INPUT[field];
  }
  const rows = get("cohorts");
  if (rows) input.cohorts = rows.split("|").slice(0, TRIAL_MAX_COHORTS).map((raw, index) => {
    const [name = "", starts = "", paid = "", ageDays = ""] = raw.split("~");
    return { id: `shared-${index}`, name, starts, paid, ageDays };
  });
  return input;
}
