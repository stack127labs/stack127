import { divideHalfAwayFromZero } from "./shared.ts";

export type ExactFraction = { numerator: bigint; denominator: bigint };

export function exactFraction(numerator: bigint, denominator = 1n): ExactFraction {
  if (denominator <= 0n) throw new RangeError("Denominator must be positive.");
  let a = numerator < 0n ? -numerator : numerator;
  let b = denominator;
  while (b !== 0n) [a, b] = [b, a % b];
  return { numerator: numerator / a, denominator: denominator / a };
}

export function addExact(...values: ExactFraction[]): ExactFraction {
  return values.reduce((sum, value) => exactFraction(
    sum.numerator * value.denominator + value.numerator * sum.denominator,
    sum.denominator * value.denominator,
  ), exactFraction(0n));
}

export function multiplyExact(a: ExactFraction, b: ExactFraction): ExactFraction {
  return exactFraction(a.numerator * b.numerator, a.denominator * b.denominator);
}

export function divideExact(a: ExactFraction, b: ExactFraction): ExactFraction {
  if (b.numerator === 0n) throw new RangeError("Cannot divide by zero.");
  const sign = b.numerator < 0n ? -1n : 1n;
  return exactFraction(a.numerator * b.denominator * sign, a.denominator * b.numerator * sign);
}

export function compareExact(a: ExactFraction, b: ExactFraction): -1 | 0 | 1 {
  const difference = a.numerator * b.denominator - b.numerator * a.denominator;
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}

export function signOfExact(value: ExactFraction): -1 | 0 | 1 {
  return value.numerator < 0n ? -1 : value.numerator > 0n ? 1 : 0;
}

export function roundExact(value: ExactFraction, scale = 1n): bigint {
  return divideHalfAwayFromZero(value.numerator * scale, value.denominator);
}

export function isWholeAtScale(value: ExactFraction, scale: bigint): boolean {
  return value.numerator * scale % value.denominator === 0n;
}

export const SAAS_PERIOD_BASES = ["month", "year"] as const;
export type SaasPeriodBasis = (typeof SAAS_PERIOD_BASES)[number];
export const SAAS_MONTHS_PER_PERIOD: Readonly<Record<SaasPeriodBasis, bigint>> = { month: 1n, year: 12n };
export type ModeledLtvInput = { arpaCents: bigint; grossMarginHundredths: bigint; churnHundredths: bigint };

export function periodGrossProfit(arpaCents: bigint, grossMarginHundredths: bigint): ExactFraction {
  return exactFraction(arpaCents * grossMarginHundredths, 10000n);
}

export type ModeledLtv =
  | { kind: "finite"; grossProfit: ExactFraction; revenue: ExactFraction; lifetimePeriods: ExactFraction }
  | { kind: "notEstimable"; reason: "zeroChurn" };

export function modelLtv(input: ModeledLtvInput): ModeledLtv {
  const { arpaCents, grossMarginHundredths, churnHundredths } = input;
  if (churnHundredths === 0n) return { kind: "notEstimable", reason: "zeroChurn" };
  return {
    kind: "finite",
    grossProfit: exactFraction(arpaCents * grossMarginHundredths, churnHundredths),
    revenue: exactFraction(arpaCents * 10000n, churnHundredths),
    lifetimePeriods: exactFraction(10000n, churnHundredths),
  };
}

function checkPeriods(periods: number) {
  if (!Number.isInteger(periods) || periods < 1 || periods > 600) {
    throw new RangeError("Periods must be a whole number from 1 to 600.");
  }
}

export function shareOfLtvEarned(churnHundredths: bigint, periods: number): ExactFraction | null {
  checkPeriods(periods);
  if (churnHundredths === 0n) return null;
  const full = 10000n ** BigInt(periods);
  return exactFraction(full - (10000n - churnHundredths) ** BigInt(periods), full);
}

export function cumulativeGrossProfit(input: ModeledLtvInput, periods: number): ExactFraction {
  checkPeriods(periods);
  const model = modelLtv(input);
  if (model.kind === "notEstimable") {
    return multiplyExact(periodGrossProfit(input.arpaCents, input.grossMarginHundredths), exactFraction(BigInt(periods)));
  }
  return multiplyExact(model.grossProfit, shareOfLtvEarned(input.churnHundredths, periods)!);
}

export type StraightLinePayback =
  | { kind: "finite"; tenths: bigint; tenthsUnderOne: boolean }
  | { kind: "never"; reason: "zeroGrossProfit" | "negativeGrossProfit" }
  | { kind: "zeroAcquisitionCost" };

export function straightLinePaybackMonths(
  cacCents: ExactFraction, periodGrossProfitCents: ExactFraction, basis: SaasPeriodBasis,
): StraightLinePayback {
  if (signOfExact(cacCents) === 0) return { kind: "zeroAcquisitionCost" };
  const profitSign = signOfExact(periodGrossProfitCents);
  if (profitSign <= 0) return { kind: "never", reason: profitSign === 0 ? "zeroGrossProfit" : "negativeGrossProfit" };
  const months = divideExact(multiplyExact(cacCents, exactFraction(SAAS_MONTHS_PER_PERIOD[basis])), periodGrossProfitCents);
  const tenths = roundExact(months, 10n);
  return { kind: "finite", tenths, tenthsUnderOne: tenths === 0n };
}
