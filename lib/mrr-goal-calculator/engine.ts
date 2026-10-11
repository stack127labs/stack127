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

export const MRR_GOAL_MAX_MONTHS = 600;
export const MRR_GOAL_MAX_COUNT = 1_000_000_000n;
export const MRR_GOAL_METHODS = ["customers", "growth"] as const;
export type MrrGoalMethod = (typeof MRR_GOAL_METHODS)[number];
export const MRR_GOAL_SOLVE_FOR = ["date", "pace"] as const;
export type MrrGoalSolveFor = (typeof MRR_GOAL_SOLVE_FOR)[number];
export const MRR_GOAL_PERIODS = ["month", "year"] as const;
export type MrrGoalPeriod = (typeof MRR_GOAL_PERIODS)[number];

export type MrrGoalInput = {
  currency: string;
  goalAmount: string;
  goalPeriod: string;
  monthlyArpa: string;
  method: string;
  solveFor: string;
  currentCustomers: string;
  newCustomersPerMonth: string;
  churnPercent: string;
  currentMrr: string;
  growthPercent: string;
  deadlineMonths: string;
  visitorToSignupPercent: string;
  signupToPaidPercent: string;
};

export type MrrGoalFieldKey = keyof MrrGoalInput | "traffic" | "form";
export type MrrGoalErrorCode =
  | "missing" | "format" | "range" | "zero" | "zeroBase" | "option" | "trafficNeedsTimeline" | "form";
export type MrrGoalErrors = Partial<Record<MrrGoalFieldKey, { code: MrrGoalErrorCode; message: string }>>;

export type MrrGoalGoal = {
  period: MrrGoalPeriod;
  enteredCents: bigint;
  monthlyGoalCents: bigint;
  monthlyGoalIsRounded: boolean;
  annualGoalCents: bigint;
  customersNeeded: bigint;
  mrrAtCustomersNeededCents: bigint;
};

export type MrrGoalCustomerPoint = { month: number; customers: bigint; mrrCents: bigint };
export type MrrGoalGrowthPoint = { month: number; mrrCents: bigint };

export type MrrGoalCustomerTimeline = {
  method: "customers";
  solveFor: MrrGoalSolveFor;
  currentCustomers: bigint;
  churnHundredths: bigint;
  remainingCustomers: bigint;
  lostPerMonthAtGoal: bigint;
  ceiling: { floor: bigint; isWhole: boolean } | null;
  pace: bigint;
  outcome:
    | { kind: "reached"; month: number }
    | { kind: "alreadyThere"; fallsBelowInMonth: number | null }
    | { kind: "unreachable"; reason: "noNewCustomers" }
    | { kind: "unreachable"; reason: "ceiling"; paceToReach: bigint }
    | { kind: "beyondHorizon" }
    | { kind: "paceForDeadline"; deadlineMonths: number; alreadyThere: boolean };
  path: MrrGoalCustomerPoint[];
};

export type MrrGoalGrowthTimeline = {
  method: "growth";
  solveFor: MrrGoalSolveFor;
  currentMrrCents: bigint;
  remainingMrrCents: bigint;
  growthHundredths: bigint; // Returns the tested maximum 100000n for aboveMaxRate.
  outcome:
    | { kind: "reached"; month: number }
    | { kind: "alreadyThere" }
    | { kind: "unreachable"; reason: "noGrowth" | "shrinking" }
    | { kind: "beyondHorizon" }
    | { kind: "rateForDeadline"; deadlineMonths: number; alreadyThere: boolean }
    | { kind: "aboveMaxRate"; deadlineMonths: number };
  path: MrrGoalGrowthPoint[];
};

export type MrrGoalTraffic =
  | {
      kind: "finite";
      visitorToSignupHundredths: bigint;
      signupToPaidHundredths: bigint;
      pace: bigint;
      signupsPerMonth: bigint;
      visitorsPerMonth: bigint;
      visitorsToGoal: bigint | null;
      months: number | null;
    }
  | { kind: "noFiniteTraffic"; stage: "visitorToSignup" | "signupToPaid" };

export type MrrGoalValues = {
  currency: SaasEconomicsCurrency;
  monthlyArpaCents: bigint;
  goal: MrrGoalGoal;
  timeline: MrrGoalCustomerTimeline | MrrGoalGrowthTimeline | null;
  traffic: MrrGoalTraffic | null;
};

export type MrrGoalCalculation =
  | { status: "valid"; values: MrrGoalValues; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: MrrGoalErrors };

const rateDenominator = 10000n;
const maxGrowthHundredths = 100000n;
type ExactPoint = { month: number; numerator: bigint; denominator: bigint };

function nonnegative(value: bigint): bigint {
  return value > 0n ? value : 0n;
}

function* customerPoints(current: bigint, pace: bigint, churn: bigint): Generator<ExactPoint> {
  let dPower = 1n;
  let qPower = 1n;
  const q = rateDenominator - churn;
  for (let month = 0; month <= MRR_GOAL_MAX_MONTHS; month += 1) {
    yield churn === 0n
      ? { month, numerator: current + pace * BigInt(month), denominator: 1n }
      : {
          month,
          numerator: pace * rateDenominator * (dPower - qPower) + current * churn * qPower,
          denominator: churn * dPower,
        };
    if (churn !== 0n) {
      dPower *= rateDenominator;
      qPower *= q;
    }
  }
}

function* growthPoints(current: bigint, growth: bigint): Generator<ExactPoint> {
  let numerator = current;
  let denominator = 1n;
  for (let month = 0; month <= MRR_GOAL_MAX_MONTHS; month += 1) {
    yield { month, numerator, denominator };
    numerator *= rateDenominator + growth;
    denominator *= rateDenominator;
  }
}

function customerTimeline(
  required: bigint, arpa: bigint, current: bigint, churn: bigint,
  enteredPace: bigint, solveFor: MrrGoalSolveFor, deadline: number,
): MrrGoalCustomerTimeline {
  let pace = enteredPace;
  let keyMonth = 0;
  let outcome: MrrGoalCustomerTimeline["outcome"];
  if (solveFor === "pace") {
    if (churn === 0n) pace = nonnegative(divideCeil(required - current, BigInt(deadline)));
    else {
      let dPower = 1n;
      let qPower = 1n;
      for (let month = 0; month < deadline; month += 1) {
        dPower *= rateDenominator;
        qPower *= rateDenominator - churn;
      }
      pace = nonnegative(divideCeil(
        (required * dPower - current * qPower) * churn,
        rateDenominator * (dPower - qPower),
      ));
    }
    outcome = { kind: "paceForDeadline", deadlineMonths: deadline, alreadyThere: current >= required };
    keyMonth = deadline;
  } else if (current >= required) {
    let fallsBelowInMonth: number | null = null;
    if (churn > 0n && current * churn > pace * rateDenominator) {
      for (const point of customerPoints(current, pace, churn)) {
        if (point.numerator < required * point.denominator) {
          fallsBelowInMonth = point.month;
          break;
        }
      }
    }
    outcome = { kind: "alreadyThere", fallsBelowInMonth };
    keyMonth = fallsBelowInMonth ?? 0;
  } else if (churn === 0n && pace === 0n) {
    outcome = { kind: "unreachable", reason: "noNewCustomers" };
    keyMonth = 120;
  } else if (churn > 0n && (required * churn > pace * rateDenominator
    || (churn < rateDenominator && required * churn === pace * rateDenominator))) {
    outcome = {
      kind: "unreachable", reason: "ceiling",
      paceToReach: churn === rateDenominator ? required : required * churn / rateDenominator + 1n,
    };
    keyMonth = 120;
  } else {
    outcome = { kind: "beyondHorizon" };
    keyMonth = MRR_GOAL_MAX_MONTHS;
    for (const point of customerPoints(current, pace, churn)) {
      if (point.numerator >= required * point.denominator) {
        outcome = { kind: "reached", month: point.month };
        keyMonth = point.month;
        break;
      }
    }
  }

  const end = keyMonth > 12 ? keyMonth : 12;
  const path: MrrGoalCustomerPoint[] = [];
  for (const point of customerPoints(current, pace, churn)) {
    const customers = point.numerator / point.denominator;
    path.push({ month: point.month, customers, mrrCents: customers * arpa });
    if (point.month === end) break;
  }
  return {
    method: "customers", solveFor, currentCustomers: current, churnHundredths: churn,
    remainingCustomers: nonnegative(required - current),
    lostPerMonthAtGoal: divideCeil(required * churn, rateDenominator),
    ceiling: churn === 0n ? null
      : { floor: pace * rateDenominator / churn, isWhole: pace * rateDenominator % churn === 0n },
    pace, outcome, path,
  };
}

function growthTimeline(
  goalTwelfthCents: bigint, monthlyGoalCents: bigint, current: bigint,
  enteredGrowth: bigint, solveFor: MrrGoalSolveFor, deadline: number,
): MrrGoalGrowthTimeline {
  let growth = enteredGrowth;
  let keyMonth = 0;
  let outcome: MrrGoalGrowthTimeline["outcome"];
  const alreadyThere = 12n * current >= goalTwelfthCents;
  if (solveFor === "pace") {
    keyMonth = deadline;
    if (alreadyThere) {
      growth = 0n;
      outcome = { kind: "rateForDeadline", deadlineMonths: deadline, alreadyThere: true };
    } else {
      const exponent = BigInt(deadline);
      const target = goalTwelfthCents * rateDenominator ** exponent;
      const meetsGoal = (rate: bigint) => 12n * current * (rateDenominator + rate) ** exponent >= target;
      if (!meetsGoal(maxGrowthHundredths)) {
        // No required rate exists in the supported range. Return the tested upper bound.
        growth = maxGrowthHundredths;
        outcome = { kind: "aboveMaxRate", deadlineMonths: deadline };
      } else {
        let low = 0n;
        let high = maxGrowthHundredths;
        while (low < high) {
          const middle = (low + high) / 2n;
          if (meetsGoal(middle)) high = middle;
          else low = middle + 1n;
        }
        growth = low;
        outcome = { kind: "rateForDeadline", deadlineMonths: deadline, alreadyThere: false };
      }
    }
  } else if (alreadyThere) outcome = { kind: "alreadyThere" };
  else if (growth <= 0n) {
    outcome = { kind: "unreachable", reason: growth === 0n ? "noGrowth" : "shrinking" };
    keyMonth = 120;
  } else {
    outcome = { kind: "beyondHorizon" };
    keyMonth = MRR_GOAL_MAX_MONTHS;
    for (const point of growthPoints(current, growth)) {
      if (12n * point.numerator >= goalTwelfthCents * point.denominator) {
        outcome = { kind: "reached", month: point.month };
        keyMonth = point.month;
        break;
      }
    }
  }

  const path: MrrGoalGrowthPoint[] = [];
  if (outcome.kind !== "aboveMaxRate") {
    const end = keyMonth > 12 ? keyMonth : 12;
    for (const point of growthPoints(current, growth)) {
      path.push({ month: point.month, mrrCents: divideHalfAwayFromZero(point.numerator, point.denominator) });
      if (point.month === end) break;
    }
  }
  return {
    method: "growth", solveFor, currentMrrCents: current,
    remainingMrrCents: nonnegative(monthlyGoalCents - current),
    growthHundredths: growth, outcome, path,
  };
}

function trafficForTimeline(timeline: MrrGoalCustomerTimeline, visitorRate: bigint, paidRate: bigint): MrrGoalTraffic {
  const pace = timeline.pace;
  if (pace > 0n && paidRate === 0n) return { kind: "noFiniteTraffic", stage: "signupToPaid" };
  if (pace > 0n && visitorRate === 0n) return { kind: "noFiniteTraffic", stage: "visitorToSignup" };
  const signupsPerMonth = pace === 0n ? 0n : divideCeil(pace * rateDenominator, paidRate);
  const visitorsPerMonth = pace === 0n ? 0n : divideCeil(pace * rateDenominator * rateDenominator, visitorRate * paidRate);
  const months = timeline.outcome.kind === "reached" ? timeline.outcome.month
    : timeline.outcome.kind === "paceForDeadline" ? timeline.outcome.deadlineMonths : null;
  return {
    kind: "finite", visitorToSignupHundredths: visitorRate, signupToPaidHundredths: paidRate,
    pace, signupsPerMonth, visitorsPerMonth,
    visitorsToGoal: months === null ? null : visitorsPerMonth * BigInt(months), months,
  };
}

export function calculateMrrGoal(inputValue: unknown): MrrGoalCalculation {
  if (inputValue === null || typeof inputValue !== "object" || Array.isArray(inputValue)) {
    return { status: "invalid", values: null, errors: {
      form: { code: "form", message: "Something in the form is out of date. Reset and try again." },
    } };
  }
  const input = inputValue as Record<string, unknown>;
  const errors: MrrGoalErrors = {};
  const option = (raw: unknown) => typeof raw === "string" ? raw.trim() : raw;
  const currency = option(input.currency);
  const period = option(input.goalPeriod);
  const method = option(input.method);
  const solveFor = option(input.solveFor);
  const optionError = { code: "option", message: "Choose one of the listed options." } as const;
  if (!isSaasEconomicsCurrency(currency)) errors.currency = optionError;
  if (period !== "month" && period !== "year") errors.goalPeriod = optionError;
  if (method !== "customers" && method !== "growth") errors.method = optionError;
  if (solveFor !== "date" && solveFor !== "pace") errors.solveFor = optionError;

  function money(key: "goalAmount" | "monthlyArpa" | "currentMrr", missing: string, zero: string): bigint | null {
    const parsed = parseMoneyCents(input[key], { min: 0n, max: SAAS_ECONOMICS_MAX_MONEY_CENTS });
    if (!parsed.ok) {
      errors[key] = { code: parsed.reason, message: parsed.reason === "missing" ? missing
        : parsed.reason === "range" ? "Enter an amount up to 1,000,000,000.00."
        : "Use digits with up to two decimals. No signs, commas, or currency symbols." };
      return null;
    }
    if (parsed.value === 0n) {
      errors[key] = { code: key === "currentMrr" ? "zeroBase" : "zero", message: zero };
      return null;
    }
    return parsed.value;
  }

  function count(key: "currentCustomers" | "newCustomersPerMonth" | "deadlineMonths"): bigint | null {
    const deadline = key === "deadlineMonths";
    const parsed = parseWholeNumber(input[key], { min: deadline ? 1n : 0n, max: deadline ? BigInt(MRR_GOAL_MAX_MONTHS) : MRR_GOAL_MAX_COUNT });
    if (!parsed.ok) {
      errors[key] = { code: parsed.reason, message: parsed.reason === "missing"
        ? deadline ? "Enter the number of months." : "Enter a whole number. Use 0 if none."
        : deadline ? "Enter whole months from 1 to 600."
        : parsed.reason === "range" ? "Enter a number from 0 to 1,000,000,000."
        : "Use digits only, without commas, signs, or decimals." };
      return null;
    }
    return parsed.value;
  }

  function percent(key: "churnPercent" | "growthPercent" | "visitorToSignupPercent" | "signupToPaidPercent"): bigint | null {
    const growth = key === "growthPercent";
    const parsed = parsePercentHundredths(input[key], { min: growth ? -10000n : 0n, max: growth ? maxGrowthHundredths : rateDenominator });
    if (!parsed.ok) {
      errors[key] = { code: parsed.reason, message: parsed.reason === "missing"
        ? growth ? "Enter your net monthly MRR growth."
          : key === "churnPercent" ? "Enter monthly churn. Use 0 if no one cancels."
          : "Enter this rate, or clear both rates."
        : growth ? "Enter a percent from -100 to 1000, with up to two decimals."
        : "Enter a percent from 0 to 100, with up to two decimals." };
      return null;
    }
    return parsed.value;
  }

  const goalCents = money("goalAmount", "Enter your revenue goal.", "Enter a goal above 0.");
  const arpaCents = money("monthlyArpa", "Enter your monthly price or ARPA.", "Enter an ARPA above 0.");
  const activeFields: (keyof MrrGoalInput)[] = method === "customers"
    ? solveFor === "date" ? ["currentCustomers", "newCustomersPerMonth", "churnPercent"]
      : solveFor === "pace" ? ["currentCustomers", "churnPercent", "deadlineMonths"] : []
    : method === "growth"
      ? solveFor === "date" ? ["currentMrr", "growthPercent"]
        : solveFor === "pace" ? ["currentMrr", "deadlineMonths"] : [] : [];
  const blank = (key: keyof MrrGoalInput) => typeof input[key] !== "string" || !(input[key] as string).trim();
  const timelineActive = activeFields.some(key => !blank(key));
  let currentCustomers: bigint | null = null;
  let newCustomers: bigint | null = null;
  let churn: bigint | null = null;
  let currentMrr: bigint | null = null;
  let growth: bigint | null = null;
  let deadline: bigint | null = null;
  if (timelineActive) {
    if (method === "customers") {
      currentCustomers = count("currentCustomers");
      churn = percent("churnPercent");
      if (solveFor === "date") newCustomers = count("newCustomersPerMonth");
    } else if (method === "growth") {
      currentMrr = money("currentMrr", "Enter your current MRR.", "A growth rate can't start from 0. Use new customers and churn instead.");
      if (solveFor === "date") growth = percent("growthPercent");
    }
    if (solveFor === "pace") deadline = count("deadlineMonths");
  }
  const trafficActive = method === "customers" && (!blank("visitorToSignupPercent") || !blank("signupToPaidPercent"));
  let visitorRate: bigint | null = null;
  let paidRate: bigint | null = null;
  if (trafficActive) {
    visitorRate = percent("visitorToSignupPercent");
    paidRate = percent("signupToPaidPercent");
    if (!timelineActive) errors.traffic = {
      code: "trafficNeedsTimeline", message: "Fill in the customer timeline first. Traffic is worked out from its monthly pace.",
    };
  }

  if (Object.keys(errors).length || !isSaasEconomicsCurrency(currency)
    || (period !== "month" && period !== "year") || (method !== "customers" && method !== "growth")
    || (solveFor !== "date" && solveFor !== "pace")) return { status: "invalid", values: null, errors };

  const goalTwelfthCents = period === "month" ? 12n * goalCents! : goalCents!;
  const monthlyGoalCents = divideHalfAwayFromZero(goalTwelfthCents, 12n);
  const required = divideCeil(goalTwelfthCents, 12n * arpaCents!);
  const goal: MrrGoalGoal = {
    period, enteredCents: goalCents!, monthlyGoalCents,
    monthlyGoalIsRounded: goalTwelfthCents % 12n !== 0n,
    annualGoalCents: goalTwelfthCents, customersNeeded: required,
    mrrAtCustomersNeededCents: required * arpaCents!,
  };
  const timeline = !timelineActive ? null : method === "customers"
    ? customerTimeline(required, arpaCents!, currentCustomers!, churn!, newCustomers ?? 0n, solveFor, Number(deadline ?? 0n))
    : growthTimeline(goalTwelfthCents, monthlyGoalCents, currentMrr!, growth ?? 0n, solveFor, Number(deadline ?? 0n));
  const traffic = trafficActive && timeline?.method === "customers" ? trafficForTimeline(timeline, visitorRate!, paidRate!) : null;
  return { status: "valid", errors: {}, values: { currency, monthlyArpaCents: arpaCents!, goal, timeline, traffic } };
}
