import { type SaasEconomicsCurrency } from "../saas-economics/shared.ts";
import {
  SAAS_ECONOMICS_MAX_MONEY_CENTS,
  divideCeil,
  divideHalfAwayFromZero,
  isSaasEconomicsCurrency,
  parseMoneyCents,
  parseOptionalLabel,
  parsePercentHundredths,
  parseWholeNumber,
} from "../saas-economics/shared.ts";

export const STARTUP_RUNWAY_HORIZON_MONTHS = 60;
export const STARTUP_RUNWAY_MAX_PLANNED_CHANGES = 10;
export const STARTUP_RUNWAY_NAME_MAX_LENGTH = 60;
export const STARTUP_RUNWAY_DIRECTIONS = ["in", "out"] as const;
export type StartupRunwayDirection = (typeof STARTUP_RUNWAY_DIRECTIONS)[number];
export const STARTUP_RUNWAY_FREQUENCIES = ["once", "monthly", "yearly"] as const;
export type StartupRunwayFrequency = (typeof STARTUP_RUNWAY_FREQUENCIES)[number];

export type StartupRunwayPlannedChangeInput = {
  id: string;
  name: string;
  direction: string;
  amount: string;
  startMonth: string;
  frequency: string;
};

export type StartupRunwayInput = {
  currency: string;
  cashNow: string;
  collectedPerMonth: string;
  paidOutPerMonth: string;
  revenueGrowthPercent: string;
  expenseGrowthPercent: string;
  plannedChanges: StartupRunwayPlannedChangeInput[];
};

export type StartupRunwayFieldKey =
  | "form" | "currency" | "cashNow" | "collectedPerMonth" | "paidOutPerMonth"
  | "revenueGrowthPercent" | "expenseGrowthPercent" | "plannedChanges"
  | `plannedChanges.${string}.name` | `plannedChanges.${string}.direction`
  | `plannedChanges.${string}.amount` | `plannedChanges.${string}.startMonth`
  | `plannedChanges.${string}.frequency`;

export type StartupRunwayErrorCode =
  | "missing" | "format" | "negative" | "range" | "zero" | "option" | "limit" | "duplicateId" | "form";
export type StartupRunwayErrors = Partial<Record<StartupRunwayFieldKey, { code: StartupRunwayErrorCode; message: string }>>;

export type StartupRunwayToday =
  | {
      kind: "burning";
      netBurnCents: bigint;
      runwayTenths: bigint;
      runwayIsExact: boolean;
      cashOutMonth: bigint;
    }
  | { kind: "breakEven" }
  | { kind: "cashFlowPositive"; surplusCents: bigint };

export type StartupRunwayPlannedChange = {
  id: string;
  name: string;
  nameWasBlank: boolean;
  direction: StartupRunwayDirection;
  amountCents: bigint;
  startMonth: number;
  frequency: StartupRunwayFrequency;
};

export type StartupRunwayMonth = {
  month: number;
  collectedCents: bigint;
  paidOutCents: bigint;
  plannedCents: bigint;
  changeCents: bigint;
  balanceCents: bigint;
  atTodaysRateCents: bigint;
  coversCosts: boolean | null;
};

export type StartupRunwayCashOut = {
  month: number;
  runwayTenths: bigint;
  runwayIsExact: boolean;
};

export type StartupRunwayProjection = {
  revenueGrowthHundredths: bigint;
  revenueGrowthWasBlank: boolean;
  expenseGrowthHundredths: bigint;
  expenseGrowthWasBlank: boolean;
  plannedChanges: StartupRunwayPlannedChange[];
  matchesToday: boolean;
  cashOut: StartupRunwayCashOut | null;
  firstCoversCostsMonth: number | null;
  coversCostsFromMonth: number | null;
  lowestBalance: { month: number; cents: bigint };
  cashShortfallCents: bigint | null;
  outcome:
    | { kind: "runsOut" }
    | { kind: "coversCostsThroughout" }
    | { kind: "coversCostsBeforeCashOut"; month: number }
    | { kind: "lastsBeyondHorizon" };
  path: StartupRunwayMonth[];
};

export type StartupRunwayValues = {
  currency: SaasEconomicsCurrency;
  cashNowCents: bigint;
  collectedPerMonthCents: bigint;
  grossBurnCents: bigint;
  netBurnCents: bigint;
  today: StartupRunwayToday;
  projection: StartupRunwayProjection | null;
};

export type StartupRunwayCalculation =
  | { status: "valid"; values: StartupRunwayValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: StartupRunwayErrors };

const rateDenominator = 10000n;
const formMessage = "Something in the form is out of date. Reset and try again.";
const optionMessage = "Choose one of the listed options.";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function rawString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function projectRunway(
  cash: bigint, collected: bigint, paidOut: bigint,
  revenueGrowth: bigint, revenueGrowthWasBlank: boolean,
  expenseGrowth: bigint, expenseGrowthWasBlank: boolean,
  plannedChanges: StartupRunwayPlannedChange[],
): StartupRunwayProjection {
  const netBurn = paidOut - collected;
  const path: StartupRunwayMonth[] = [{
    month: 0, collectedCents: 0n, paidOutCents: 0n, plannedCents: 0n,
    changeCents: 0n, balanceCents: cash, atTodaysRateCents: cash, coversCosts: null,
  }];
  let balance = cash;
  let lowestBalance = { month: 0, cents: cash };
  let cashOut: StartupRunwayCashOut | null = null;
  let firstCoversCostsMonth: number | null = null;
  let coversCostsFromMonth: number | null = null;
  let revenuePower = 1n;
  let expensePower = 1n;
  let denominatorPower = 1n;

  for (let month = 1; month <= STARTUP_RUNWAY_HORIZON_MONTHS; month += 1) {
    // Round the exact powers, never the preceding month's rounded cents.
    const collectedCents = divideHalfAwayFromZero(collected * revenuePower, denominatorPower);
    const paidOutCents = divideHalfAwayFromZero(paidOut * expensePower, denominatorPower);
    let plannedCents = 0n;
    let recurringIn = collectedCents;
    let recurringOut = paidOutCents;
    for (const change of plannedChanges) {
      if (month < change.startMonth) continue;
      if (change.frequency === "once" && month !== change.startMonth) continue;
      if (change.frequency === "yearly" && (month - change.startMonth) % 12 !== 0) continue;
      plannedCents += change.direction === "in" ? change.amountCents : -change.amountCents;
      if (change.frequency === "monthly") {
        if (change.direction === "in") recurringIn += change.amountCents;
        else recurringOut += change.amountCents;
      }
    }
    const coversCosts = recurringIn >= recurringOut;
    if (coversCosts) {
      if (firstCoversCostsMonth === null) firstCoversCostsMonth = month;
      if (coversCostsFromMonth === null) coversCostsFromMonth = month;
    } else coversCostsFromMonth = null;

    const changeCents = collectedCents - paidOutCents + plannedCents;
    const previousBalance = balance;
    balance += changeCents;
    if (cashOut === null && balance <= 0n && changeCents < 0n) {
      const gap = -changeCents;
      cashOut = {
        month: month === 1 && previousBalance === 0n ? 0 : month,
        runwayTenths: 10n * BigInt(month - 1) + 10n * previousBalance / gap,
        runwayIsExact: (10n * previousBalance) % gap === 0n,
      };
    }
    if (balance < lowestBalance.cents) lowestBalance = { month, cents: balance };
    path.push({
      month, collectedCents, paidOutCents, plannedCents, changeCents,
      balanceCents: balance, atTodaysRateCents: cash - BigInt(month) * netBurn, coversCosts,
    });
    // The largest exact product has 265 decimal digits at month 60.
    if (month < STARTUP_RUNWAY_HORIZON_MONTHS) {
      revenuePower *= rateDenominator + revenueGrowth;
      expensePower *= rateDenominator + expenseGrowth;
      denominatorPower *= rateDenominator;
    }
  }

  const outcome: StartupRunwayProjection["outcome"] = cashOut !== null
    ? { kind: "runsOut" }
    : coversCostsFromMonth === 1 ? { kind: "coversCostsThroughout" }
    : coversCostsFromMonth !== null ? { kind: "coversCostsBeforeCashOut", month: coversCostsFromMonth }
    : { kind: "lastsBeyondHorizon" };
  return {
    revenueGrowthHundredths: revenueGrowth, revenueGrowthWasBlank,
    expenseGrowthHundredths: expenseGrowth, expenseGrowthWasBlank, plannedChanges,
    matchesToday: revenueGrowth === 0n && expenseGrowth === 0n && plannedChanges.length === 0,
    cashOut, firstCoversCostsMonth, coversCostsFromMonth, lowestBalance,
    cashShortfallCents: lowestBalance.cents < 0n && coversCostsFromMonth !== null ? -lowestBalance.cents : null,
    outcome, path,
  };
}

export function calculateStartupRunway(inputValue: unknown): StartupRunwayCalculation {
  const input = asRecord(inputValue);
  if (!input) return { status: "invalid", values: null, errors: { form: { code: "form", message: formMessage } } };
  const errors: StartupRunwayErrors = {};
  const currency = rawString(input.currency).trim();
  if (!isSaasEconomicsCurrency(currency)) errors.currency = { code: "option", message: optionMessage };

  function money(raw: unknown, key: StartupRunwayFieldKey, missing: string, positive = false): bigint | null {
    if (rawString(raw).trim().startsWith("-")) {
      errors[key] = { code: "negative", message: positive
        ? "Enter an amount above 0. Use Type to choose money in or out."
        : "Enter 0 or more. This tool doesn't model overdrafts or debt." };
      return null;
    }
    const parsed = parseMoneyCents(raw, { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (!parsed.ok) {
      errors[key] = { code: parsed.reason, message: parsed.reason === "missing" ? missing
        : parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
        : "Use digits with up to two decimals. No commas or currency symbols." };
      return null;
    }
    if (positive && parsed.value === 0n) {
      errors[key] = { code: "zero", message: "Enter an amount above 0." };
      return null;
    }
    return parsed.value;
  }

  function growth(key: "revenueGrowthPercent" | "expenseGrowthPercent", value: unknown): { value: bigint | null; wasBlank: boolean } {
    const raw = rawString(value);
    if (!raw.trim()) return { value: 0n, wasBlank: true };
    const parsed = parsePercentHundredths(raw, { min: -rateDenominator, max: rateDenominator });
    if (!parsed.ok) {
      errors[key] = { code: parsed.reason, message: "Enter a monthly rate from -100 to 100, with up to two decimals. Leave out the % sign." };
      return { value: null, wasBlank: false };
    }
    return { value: parsed.value, wasBlank: false };
  }

  const cash = money(input.cashNow, "cashNow", "Enter the cash you have now. Use 0 if none.");
  const collected = money(input.collectedPerMonth, "collectedPerMonth", "Enter the cash customers pay you in a typical month. Use 0 if none.");
  const paidOut = money(input.paidOutPerMonth, "paidOutPerMonth", "Enter what you pay out in a typical month. Use 0 if none.");
  const revenueGrowth = growth("revenueGrowthPercent", input.revenueGrowthPercent);
  const expenseGrowth = growth("expenseGrowthPercent", input.expenseGrowthPercent);
  const rows = Array.isArray(input.plannedChanges) ? input.plannedChanges : [];
  if (rows.length > STARTUP_RUNWAY_MAX_PLANNED_CHANGES) {
    errors.plannedChanges = { code: "limit", message: "You can add up to 10 planned changes." };
  }
  const seenIds = new Set<string>();
  const plannedChanges: StartupRunwayPlannedChange[] = [];
  let countedRows = 0;
  for (const value of rows) {
    const row = asRecord(value);
    if (!row || typeof row.id !== "string" || !row.id) {
      errors.form = { code: "form", message: formMessage };
      continue;
    }
    if (seenIds.has(row.id) && !errors.plannedChanges) {
      errors.plannedChanges = { code: "duplicateId", message: formMessage };
    }
    seenIds.add(row.id);
    const name = rawString(row.name);
    if (!name.trim() && !rawString(row.amount).trim() && !rawString(row.startMonth).trim()) continue;
    countedRows += 1;
    const prefix = `plannedChanges.${row.id}` as const;
    const label = parseOptionalLabel(name, STARTUP_RUNWAY_NAME_MAX_LENGTH);
    if (!label.ok) errors[`${prefix}.name`] = {
      code: label.reason, message: label.reason === "range" ? "Use 60 characters or fewer."
        : "Remove line breaks and special characters from the name.",
    };
    const direction = rawString(row.direction).trim();
    if (direction !== "in" && direction !== "out") errors[`${prefix}.direction`] = { code: "option", message: optionMessage };
    const amount = money(row.amount, `${prefix}.amount`, "Enter an amount, or remove this change.", true);
    const startMonth = parseWholeNumber(row.startMonth, { min: 1n, max: BigInt(STARTUP_RUNWAY_HORIZON_MONTHS) });
    if (!startMonth.ok) errors[`${prefix}.startMonth`] = {
      code: startMonth.reason, message: startMonth.reason === "missing"
        ? "Enter the month it starts, from 1 to 60." : "Enter a whole month from 1 to 60.",
    };
    const frequency = rawString(row.frequency).trim();
    if (frequency !== "once" && frequency !== "monthly" && frequency !== "yearly") {
      errors[`${prefix}.frequency`] = { code: "option", message: optionMessage };
    }
    if (label.ok && amount !== null && startMonth.ok && (direction === "in" || direction === "out")
      && (frequency === "once" || frequency === "monthly" || frequency === "yearly")) {
      plannedChanges.push({
        id: row.id, name: label.value || `Planned change ${countedRows}`, nameWasBlank: !label.value,
        direction, amountCents: amount, startMonth: Number(startMonth.value), frequency,
      });
    }
  }

  if (Object.keys(errors).length || !isSaasEconomicsCurrency(currency)) return { status: "invalid", values: null, errors };
  const netBurn = paidOut! - collected!;
  const today: StartupRunwayToday = netBurn > 0n
    ? {
        kind: "burning", netBurnCents: netBurn, runwayTenths: 10n * cash! / netBurn,
        runwayIsExact: (10n * cash!) % netBurn === 0n, cashOutMonth: divideCeil(cash!, netBurn),
      }
    : netBurn === 0n ? { kind: "breakEven" } : { kind: "cashFlowPositive", surplusCents: -netBurn };
  const forecastOn = !revenueGrowth.wasBlank || !expenseGrowth.wasBlank || plannedChanges.length > 0;
  return {
    status: "valid", errors: {}, values: {
      currency, cashNowCents: cash!, collectedPerMonthCents: collected!, grossBurnCents: paidOut!, netBurnCents: netBurn, today,
      projection: forecastOn ? projectRunway(
        cash!, collected!, paidOut!, revenueGrowth.value!, revenueGrowth.wasBlank,
        expenseGrowth.value!, expenseGrowth.wasBlank, plannedChanges,
      ) : null,
    },
  };
}
