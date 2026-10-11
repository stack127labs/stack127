import { parsePercentHundredths } from "../saas-economics/shared.ts";
import { compareExact, exactFraction, roundExact } from "../saas-economics/unit-economics.ts";
import type { ExactFraction } from "../saas-economics/unit-economics.ts";

export const CHURN_PERIODS = ["month", "quarter", "year"] as const;
export type ChurnPeriod = (typeof CHURN_PERIODS)[number];
export const CHURN_PERIOD_MONTHS: Readonly<Record<ChurnPeriod, number>> = { month: 1, quarter: 3, year: 12 };

export type ChurnRateInput = { rate: string; period: string };
export type ChurnRateErrorCode = "missing" | "format" | "tooPrecise" | "belowZero" | "aboveHundred";
export type ChurnRateErrors = {
  rate?: { code: ChurnRateErrorCode; message: string };
  period?: { code: "unknownPeriod"; message: string };
};

/** A rate in hundredths of a percent: 4596 is 45.96%. */
export type ChurnPercent = {
  hundredths: number;
  roundedToZero: boolean;
  nearlyAll: boolean;
};

export type ChurnLinearEstimate = {
  hundredths: number;
  overHundred: boolean;
  roundedToZero: boolean;
};

export type ChurnPeriodRow = {
  period: ChurnPeriod;
  isSource: boolean;
  churn: ChurnPercent;
  retention: ChurnPercent;
  linearEstimate: ChurnLinearEstimate | null;
};

export type ChurnCohortOf100 = {
  lost: number;
  remaining: number;
  lostUnderOne: boolean;
  remainingUnderOne: boolean;
};

export type ChurnLifetime =
  | { kind: "finite"; tenths: number; period: ChurnPeriod }
  | { kind: "notEstimable"; reason: "zeroChurn" };

export type ChurnConversion = {
  source: { hundredths: number; period: ChurnPeriod };
  rows: [ChurnPeriodRow, ChurnPeriodRow, ChurnPeriodRow];
  leadPeriod: ChurnPeriod;
  yearOf100: ChurnCohortOf100;
  lifetime: ChurnLifetime;
};

export type ChurnRateCalculation =
  | { status: "valid"; values: ChurnConversion; errors: Record<string, never> }
  | { status: "invalid"; values: null; errors: ChurnRateErrors };

const RATE_MESSAGES: Readonly<Record<ChurnRateErrorCode, string>> = {
  missing: "Enter a churn rate from 0 to 100%.",
  format: "Use digits only, like 5 or 4.25.",
  tooPrecise: "Use up to two decimals.",
  belowZero: "Customer churn can't be below 0%. A negative rate is net revenue churn, which this tool doesn't convert.",
  aboveHundred: "Churn can't be above 100%. You can't lose more customers than you started with.",
};

function rateError(code: ChurnRateErrorCode): NonNullable<ChurnRateErrors["rate"]> {
  return { code, message: RATE_MESSAGES[code] };
}

function parseRate(raw: unknown): { value: bigint } | { error: NonNullable<ChurnRateErrors["rate"]> } {
  if (typeof raw !== "string") return { error: rateError("missing") };
  let text = raw.trim();
  if (text.endsWith("%")) text = text.slice(0, -1).trim();
  if (!text) return { error: rateError("missing") };
  if (text.startsWith("-")) return { error: rateError("belowZero") };
  if (/^\d+\.\d{3,}$/.test(text)) return { error: rateError("tooPrecise") };
  const parsed = parsePercentHundredths(text, { min: 0n, max: 10000n });
  return parsed.ok
    ? { value: parsed.value }
    : { error: rateError(parsed.reason === "range" ? "aboveHundred" : parsed.reason) };
}

function inputFields(raw: unknown): { rate?: unknown; period?: unknown } {
  try {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return {};
    const prototype = Object.getPrototypeOf(raw);
    if (prototype !== Object.prototype && prototype !== null) return {};
    const candidate = raw as { rate?: unknown; period?: unknown };
    return { rate: candidate.rate, period: candidate.period };
  } catch {
    // Unreadable objects are invalid input, including throwing getters and revoked proxies.
    return {};
  }
}

function wholePowerChurn(hundredths: bigint, exponent: bigint): ExactFraction {
  const denominator = 10000n ** exponent;
  return exactFraction(denominator - (10000n - hundredths) ** exponent, denominator);
}

function roundedRootChurn(hundredths: bigint, degree: bigint): bigint {
  const left = (10000n - hundredths) * 20000n ** degree;
  let low = 0n;
  let high = 10000n;
  while (low < high) {
    const middle = (low + high + 1n) / 2n;
    // Compare with the half-step by raising both non-negative retentions to the root degree.
    const right = (20001n - 2n * middle) ** degree * 10000n;
    if (left <= right) low = middle;
    else high = middle - 1n;
  }
  return low;
}

function periodRow(hundredths: bigint, source: ChurnPeriod, target: ChurnPeriod): ChurnPeriodRow {
  const sourceMonths = BigInt(CHURN_PERIOD_MONTHS[source]);
  const targetMonths = BigInt(CHURN_PERIOD_MONTHS[target]);
  const isSource = source === target;
  const rounded = isSource ? hundredths
    : targetMonths > sourceMonths
      ? roundExact(wholePowerChurn(hundredths, targetMonths / sourceMonths), 10000n)
      : roundedRootChurn(hundredths, sourceMonths / targetMonths);
  const roundedToZero = hundredths > 0n && rounded === 0n;
  const nearlyAll = hundredths < 10000n && rounded === 10000n;
  const linear = isSource ? null : roundExact(exactFraction(hundredths * targetMonths, sourceMonths));
  return {
    period: target,
    isSource,
    churn: { hundredths: Number(rounded), roundedToZero, nearlyAll },
    retention: { hundredths: Number(10000n - rounded), roundedToZero: nearlyAll, nearlyAll: roundedToZero },
    linearEstimate: linear === null ? null : {
      hundredths: Number(linear),
      overHundred: linear > 10000n,
      roundedToZero: hundredths > 0n && linear === 0n,
    },
  };
}

/** Never throws for invalid input, including null, arrays, and non-string fields. */
export function convertChurnRate(raw: unknown): ChurnRateCalculation {
  const input = inputFields(raw);
  const rate = parseRate(input.rate);
  const period = typeof input.period === "string" ? input.period.trim() : "";
  const knownPeriod = CHURN_PERIODS.includes(period as ChurnPeriod);
  const errors: ChurnRateErrors = {};
  if ("error" in rate) errors.rate = rate.error;
  if (!knownPeriod) errors.period = { code: "unknownPeriod", message: "Choose monthly, quarterly, or annual." };
  if ("error" in rate || !knownPeriod) return { status: "invalid", values: null, errors };

  const h = rate.value;
  const source = period as ChurnPeriod;
  const annual = wholePowerChurn(h, 12n / BigInt(CHURN_PERIOD_MONTHS[source]));
  const lost = roundExact(annual, 100n);
  return {
    status: "valid",
    errors: {},
    values: {
      source: { hundredths: Number(h), period: source },
      rows: [periodRow(h, source, "month"), periodRow(h, source, "quarter"), periodRow(h, source, "year")],
      leadPeriod: source === "year" ? "month" : "year",
      yearOf100: {
        lost: Number(lost),
        remaining: Number(100n - lost),
        lostUnderOne: compareExact(annual, exactFraction(0n)) > 0 && lost === 0n,
        remainingUnderOne: compareExact(annual, exactFraction(1n)) < 0 && lost === 100n,
      },
      lifetime: h === 0n
        ? { kind: "notEstimable", reason: "zeroChurn" }
        : { kind: "finite", tenths: Number(roundExact(exactFraction(10000n, h), 10n)), period: source },
    },
  };
}
