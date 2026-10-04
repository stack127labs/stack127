import assert from "node:assert/strict";
import test from "node:test";
import { calculateCustomerLifetimeValue } from "../../../lib/customer-lifetime-value-calculator/engine.ts";
import { calculateCacPayback } from "../../../lib/cac-payback-calculator/engine.ts";
import { exactFraction, addExact, divideExact, roundExact, cumulativeGrossProfit, shareOfLtvEarned, straightLinePaybackMonths } from "../../../lib/saas-economics/unit-economics.ts";

const scenario = (overrides = {}) => ({ arpa: "50", grossMarginPercent: "80", churnPercent: "3", ...overrides });
const input = (overrides = {}) => ({ currency: "USD", basis: "month", compare: false, baseline: scenario(), alternative: {}, ...overrides });
function valid(overrides = {}) { const r = calculateCustomerLifetimeValue(input(overrides)); assert.equal(r.status, "valid", JSON.stringify(r.errors)); return r.values; }

test("LTV reports a margin estimate and the profit expected at finite checkpoints", () => {
  const v = valid().baseline;
  assert.equal(v.estimate.grossProfit.cents, 133333n);
  assert.equal(v.estimate.revenue.cents, 166667n);
  assert.equal(v.estimate.lifetimeTenths, 333n);
  assert.deepEqual(v.checkpoints.map(c => c.grossProfit.cents), [40821n, 69144n, 88796n, 111892n]);
  assert.deepEqual(v.checkpoints.map(c => c.shareOfLtv.tenths), [306n, 519n, 666n, 839n]);
  assert.equal(v.lessThanHalfByLastCheckpoint, false);
});

test("yearly values use yearly periods without silently converting churn", () => {
  const v = valid({ basis: "year", baseline: scenario({ arpa: "24000", grossMarginPercent: "75", churnPercent: "20" }) }).baseline;
  assert.equal(v.estimate.grossProfit.cents, 9000000n);
  assert.equal(v.estimate.lifetimeTenths, 50n);
  assert.deepEqual(v.checkpoints.map(c => c.grossProfit.cents), [1800000n, 3240000n, 4392000n, 6050880n]);
  assert.deepEqual(v.checkpoints.map(c => c.shareOfLtv.tenths), [200n, 360n, 488n, 672n]);
});

test("zero churn withholds lifetime estimates but keeps finite-horizon profit", () => {
  const v = valid({ baseline: scenario({ churnPercent: "0" }) }).baseline;
  assert.deepEqual(v.estimate, { kind: "notEstimable", reason: "zeroChurn" });
  assert.deepEqual(v.checkpoints.map(c => c.grossProfit.cents), [48000n, 96000n, 144000n, 240000n]);
  assert.ok(v.checkpoints.every(c => c.shareOfLtv === null));
  assert.equal(v.lessThanHalfByLastCheckpoint, null);
});

test("negative, zero, tiny, and 100-percent-churn inputs keep their exact meaning", () => {
  const loss = valid({ baseline: scenario({ grossMarginPercent: "-20", churnPercent: "5" }) }).baseline;
  assert.equal(loss.grossProfitSign, "negative");
  assert.equal(loss.estimate.grossProfit.cents, -20000n);
  assert.equal(loss.checkpoints[0].grossProfit.cents, -9193n);
  assert.equal(valid({ baseline: scenario({ grossMarginPercent: "0" }) }).baseline.estimate.grossProfit.cents, 0n);
  const tiny = valid({ baseline: scenario({ arpa: "0.01", grossMarginPercent: "0.01", churnPercent: "100" }) }).baseline;
  assert.equal(tiny.grossProfitSign, "positive");
  assert.equal(tiny.estimate.grossProfit.roundedToZero, true);
  const first = valid({ baseline: scenario({ churnPercent: "100" }) }).baseline;
  assert.ok(first.checkpoints.every(c => c.grossProfit.cents === 4000n && c.shareOfLtv.tenths === 1000n && !c.shareOfLtv.nearlyAll));
  assert.equal(valid({ baseline: scenario({ churnPercent: "50" }) }).baseline.checkpoints[0].shareOfLtv.nearlyAll, true);
  assert.equal(valid({ basis: "year", baseline: scenario({ churnPercent: "0.01" }) }).baseline.checkpoints[0].shareOfLtv.underOneTenth, true);
});

test("comparisons, low churn, and maximum amounts do not lose integer precision", () => {
  const v = valid({ compare: true, alternative: scenario({ churnPercent: "2.5" }) });
  assert.equal(v.comparison.ltvDeltaCents, 26667n);
  assert.equal(v.alternative.checkpoints[0].grossProfit.cents, 41920n);
  assert.equal(valid({ compare: true, alternative: scenario({ churnPercent: "0" }) }).comparison.ltvDeltaCents, null);
  const max = valid({ baseline: scenario({ arpa: "1000000000", grossMarginPercent: "100", churnPercent: "0.01" }) }).baseline;
  assert.equal(max.estimate.grossProfit.cents, 1000000000000000n);
  assert.equal(max.lessThanHalfByLastCheckpoint, true);
});

test("invalid fields clear results and disabled alternative drafts are ignored", () => {
  const r = calculateCustomerLifetimeValue(input({ currency: "JPY", basis: "quarter", baseline: scenario({ arpa: "1,000", grossMarginPercent: "101", churnPercent: "" }) }));
  assert.equal(r.status, "invalid");
  assert.equal(r.values, null);
  for (const key of ["currency", "basis", "baseline.arpa", "baseline.grossMarginPercent", "baseline.churnPercent"]) assert.ok(r.errors[key], key);
  for (const arpa of ["", "-1", "1e3", "$50", "50.001", "1000000000.01"]) assert.equal(calculateCustomerLifetimeValue(input({ baseline: scenario({ arpa }) })).status, "invalid");
  assert.equal(valid({ alternative: null }).alternative, null);
  assert.ok(calculateCustomerLifetimeValue(input({ compare: "false" })).errors.form);
});

test("shared fractions preserve signs and payback matches the standalone engine", () => {
  assert.deepEqual(addExact(exactFraction(1n, 3n), exactFraction(1n, 6n)), exactFraction(1n, 2n));
  assert.equal(roundExact(exactFraction(-1n, 2n)), -1n);
  assert.deepEqual(divideExact(exactFraction(1n, 3n), exactFraction(-2n)), exactFraction(-1n, 6n));
  assert.throws(() => exactFraction(1n, 0n), RangeError);
  assert.throws(() => cumulativeGrossProfit({ arpaCents: 1n, grossMarginHundredths: 10000n, churnHundredths: 1n }, 0), RangeError);
  assert.equal(shareOfLtvEarned(0n, 12), null);
  for (const [cac, arpa, margin] of [[300n, 50n, 80n], [0n, 0n, 0n], [300n, 50n, -20n], [1n, 50n, 80n]]) {
    const expected = calculateCacPayback({ currency: "USD", cacSource: "direct", compare: false, includeChurn: false, baseline: { cac: String(cac), monthlyArpa: String(arpa), grossMarginPercent: String(margin) } }).values.baseline.straightLine;
    const { recoveryMonth, ...withoutMonth } = expected;
    assert.deepEqual(straightLinePaybackMonths(exactFraction(cac * 100n), exactFraction(arpa * margin), "month"), withoutMonth);
  }
});
