import type { CountryCode, Interval, Measures, RecommendationInput } from "./types.ts";

const countries: CountryCode[] = ["US", "GB", "CA", "AU", "NZ"];
const point = (value: number): Interval => ({ lo: value, hi: value, exact: true });
const interval = (lo: number, hi: number): Interval => ({ lo, hi, exact: false });
const multiply = (a: Interval, b: Interval, divisor = 1): Interval => interval(a.lo * b.lo / divisor, a.hi * b.hi / divisor);

/** Editorial ratio ranges; entered values and estimated measures stay distinct. */
export function estimateMeasures(input: RecommendationInput): Measures {
  const shares = input.shares ?? {};
  const entered = countries.filter(code => shares[code] !== undefined);
  const total = entered.reduce((sum, code) => sum + Math.round(shares[code]! * 10), 0) / 10;
  const noCountryInput = entered.length === 0 && input.tier1Share === undefined;
  const tier1 = entered.length === 5 ? point(total) : input.tier1Share !== undefined ? point(Math.max(input.tier1Share, total)) : interval(total, 100);
  function aggregate(codes: CountryCode[], prior: Interval): Interval {
    const known = codes.reduce((sum, code) => sum + Math.round((shares[code] ?? 0) * 10), 0) / 10;
    const unknownInside = codes.some(code => shares[code] === undefined);
    const unknownOutside = countries.some(code => !codes.includes(code) && shares[code] === undefined);
    if (!unknownInside) return point(known);
    const lo = unknownOutside ? known : known + Math.max(0, tier1.lo - total);
    const hi = known + Math.max(0, tier1.hi - total);
    if (!unknownOutside && tier1.exact) return point(lo);
    const intersectionLo = Math.max(lo, prior.lo), intersectionHi = Math.min(hi, prior.hi);
    // A prior may narrow an interval, but never manufacture an exact point.
    return intersectionLo < intersectionHi ? interval(intersectionLo, intersectionHi) : interval(lo, hi);
  }
  const us = aggregate(["US"], interval(tier1.lo * 0.55, tier1.hi * 0.9));
  const monumetric = aggregate(["US", "GB", "CA", "AU"], interval(Math.max(0, tier1.lo - 3), tier1.hi));
  const moneytizer = aggregate(["US", "GB", "CA"], interval(tier1.lo * 0.85, tier1.hi * 0.98));
  const result: Measures = { noCountryInput, tier1Share: tier1, usShare: us, monumetricShare: monumetric, moneytizerShare: moneytizer };
  if (input.visits !== undefined) {
    result.sessions = input.visitsUnit === "users" ? interval(input.visits / 0.9, input.visits / 0.6) : point(input.visits);
  } else if (input.pageviews !== undefined) result.sessions = interval(input.pageviews / 2, input.pageviews / 1.2);
  if (input.pageviews !== undefined) result.pageviews = point(input.pageviews);
  else if (result.sessions) result.pageviews = multiply(result.sessions, interval(1.2, 2));
  if (result.sessions) {
    result.visits = { ...result.sessions, exact: input.visits !== undefined && input.visitsUnit === "visits" };
    result.visitors = input.visits !== undefined && input.visitsUnit === "users" ? interval(input.visits, input.visits) : multiply(result.sessions, interval(0.6, 0.9));
    result.monthlyActiveUsers = { ...result.visitors };
    result.tier1Sessions30d = multiply(result.sessions, tier1, 100);
    result.moneytizerUniques30d = multiply(multiply(result.visitors, moneytizer, 100), interval(0.5, 1));
  }
  if (result.pageviews) result.usPageviews = { ...multiply(result.pageviews, us, 100), exact: input.pageviews !== undefined && us.exact };
  if (input.adRevenueMonth !== undefined) result.adRevenueMonth = point(input.adRevenueMonth);
  return result;
}
