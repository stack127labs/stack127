import assert from "node:assert/strict";
import test from "node:test";
import { calculateCacPayback } from "../../../lib/cac-payback-calculator/engine.ts";

const scenario = (overrides = {}) => ({ cac: "300", acquisitionSpend: "", newCustomers: "", monthlyArpa: "50", grossMarginPercent: "80", monthlyChurnPercent: "5", ...overrides });
const input = (overrides = {}) => ({ currency: "USD", cacSource: "direct", compare: false, includeChurn: false, baseline: scenario(), alternative: {}, ...overrides });
const valid = (overrides) => {
  const r = calculateCacPayback(input(overrides));
  assert.equal(r.status, "valid", JSON.stringify(r.errors));
  return r.values;
};

test("payback recovers gross profit and labels revenue-only recovery separately", () => {
  const v = valid().baseline;
  assert.equal(v.monthlyGrossProfitCents, 4000n);
  assert.deepEqual(v.straightLine, { kind: "finite", tenths: 75n, tenthsUnderOne: false, recoveryMonth: 8n });
  assert.deepEqual(v.revenueOnly, { kind: "finite", tenths: 60n, tenthsUnderOne: false });
  const other = valid({ baseline: scenario({ cac: "1800", monthlyArpa: "180", grossMarginPercent: "75" }) }).baseline;
  assert.equal(other.monthlyGrossProfitCents, 13500n);
  assert.equal(other.straightLine.tenths, 133n);
  assert.equal(other.straightLine.recoveryMonth, 14n);
});

test("CAC from spend remains a fraction rather than rounding before division", () => {
  const v = valid({ cacSource: "spend", baseline: scenario({ cac: "ignored", acquisitionSpend: "10000", newCustomers: "7", monthlyArpa: "99", grossMarginPercent: "70" }) }).baseline;
  assert.equal(v.cacCents, 142857n);
  assert.equal(v.cacIsRounded, true);
  assert.equal(v.straightLine.tenths, 206n);
  assert.equal(v.straightLine.recoveryMonth, 21n);
  assert.equal(v.revenueOnly.tenths, 144n);
  // A nonzero acquisition cost that rounds to zero cents is still a cost.
  const tiny = valid({ cacSource: "spend", baseline: scenario({ acquisitionSpend: "0.01", newCustomers: "3", monthlyArpa: "0.01", grossMarginPercent: "100" }) }).baseline;
  assert.equal(tiny.cacCents, 0n);
  assert.equal(tiny.cacIsRounded, true);
  assert.equal(tiny.straightLine.kind, "finite");
  assert.equal(tiny.straightLine.tenths, 3n);
});

test("no gross profit cannot recover a positive CAC", () => {
  for (const [baseline, reason] of [
    [scenario({ grossMarginPercent: "0" }), "zeroGrossProfit"],
    [scenario({ grossMarginPercent: "-20" }), "negativeGrossProfit"],
    [scenario({ monthlyArpa: "0" }), "zeroGrossProfit"],
  ]) {
    const v = valid({ baseline, includeChurn: true }).baseline;
    assert.deepEqual(v.straightLine, { kind: "never", reason });
    assert.deepEqual(v.retention, { kind: "never", reason });
  }
  assert.equal(valid({ baseline: scenario({ monthlyArpa: "0" }) }).baseline.revenueOnly.kind, "zeroArpa");
});

test("zero cost is a distinct outcome even when the customer loses money", () => {
  for (const baseline of [scenario({ cac: "0" }), scenario({ cac: "0", grossMarginPercent: "-20" }), scenario({ cac: "0", monthlyArpa: "0", grossMarginPercent: "0" })]) {
    const v = valid({ baseline, includeChurn: true }).baseline;
    assert.equal(v.straightLine.kind, "zeroAcquisitionCost");
    assert.equal(v.retention.kind, "zeroAcquisitionCost");
    assert.equal(v.revenueOnly.kind, "zeroAcquisitionCost");
  }
  assert.equal(valid({ cacSource: "spend", baseline: scenario({ acquisitionSpend: "0", newCustomers: "5" }) }).baseline.straightLine.kind, "zeroAcquisitionCost");
});

test("fractional month displays and exact month boundaries stay meaningful", () => {
  const small = valid({ baseline: scenario({ cac: "1" }) }).baseline;
  assert.deepEqual(small.straightLine, { kind: "finite", tenths: 0n, tenthsUnderOne: true, recoveryMonth: 1n });
  assert.equal(small.revenueOnly.tenthsUnderOne, true);
  assert.equal(valid({ baseline: scenario({ cac: "40" }) }).baseline.straightLine.recoveryMonth, 1n);
  const subcentProfit = valid({ baseline: scenario({ cac: "0.01", monthlyArpa: "0.01", grossMarginPercent: "0.01" }) }).baseline;
  assert.equal(subcentProfit.monthlyGrossProfitCents, 0n);
  assert.equal(subcentProfit.monthlyGrossProfitRoundedToZero, true);
  assert.equal(subcentProfit.straightLine.recoveryMonth, 10000n);
});

test("retention finds the first cumulative recovery month and the asymptotic ceiling", () => {
  const v = valid({ includeChurn: true }).baseline;
  assert.deepEqual(v.retention, { kind: "finite", recoveryMonth: 10n });
  assert.deepEqual(valid({ includeChurn: true, baseline: scenario({ monthlyChurnPercent: "0" }) }).baseline.retention, { kind: "finite", recoveryMonth: 8n });
  assert.deepEqual(valid({ includeChurn: true, baseline: scenario({ cac: "800" }) }).baseline.retention, { kind: "never", reason: "churnLimit", lifetimeGrossProfitCents: 80000n });
  const impossible = valid({ includeChurn: true, baseline: scenario({ cac: "1200", monthlyArpa: "99", grossMarginPercent: "70", monthlyChurnPercent: "6" }) }).baseline;
  assert.deepEqual(impossible.retention, { kind: "never", reason: "churnLimit", lifetimeGrossProfitCents: 115500n });
  const long = valid({ includeChurn: true, baseline: scenario({ cac: "399000", monthlyChurnPercent: "0.01" }) }).baseline;
  assert.deepEqual(long.retention, { kind: "beyondHorizon", horizonMonths: 600 });
});

test("100 percent churn attains its ceiling in the first month, including equality", () => {
  for (const cac of ["30", "40"]) {
    assert.deepEqual(valid({ includeChurn: true, baseline: scenario({ cac, monthlyChurnPercent: "100" }) }).baseline.retention, { kind: "finite", recoveryMonth: 1n });
  }
  assert.deepEqual(valid({ includeChurn: true, baseline: scenario({ cac: "50", monthlyChurnPercent: "100" }) }).baseline.retention, { kind: "never", reason: "churnLimit", lifetimeGrossProfitCents: 4000n });
});

test("scenario deltas agree with displayed months and omit undefined comparisons", () => {
  const v = valid({ compare: true, alternative: scenario({ monthlyArpa: "60" }) });
  assert.equal(v.alternative.straightLine.tenths, 63n);
  assert.equal(v.comparison.straightLineTenthsDelta, -12n);
  const churn = valid({ compare: true, includeChurn: true, alternative: scenario({ monthlyChurnPercent: "2" }) });
  assert.equal(churn.alternative.retention.recoveryMonth, 9n);
  assert.equal(churn.comparison.retentionMonthDelta, -1n);
  assert.deepEqual(valid({ compare: true, includeChurn: true, alternative: scenario({ cac: "0" }) }).comparison, { straightLineTenthsDelta: null, retentionMonthDelta: null });
});

test("invalid inputs report active fields, while inactive drafts are ignored", () => {
  const bad = calculateCacPayback(input({ currency: "JPY", baseline: scenario({ cac: "$300", monthlyArpa: "1e3", grossMarginPercent: "100.01", monthlyChurnPercent: "" }), includeChurn: true }));
  assert.equal(bad.status, "invalid");
  for (const key of ["currency", "baseline.cac", "baseline.monthlyArpa", "baseline.grossMarginPercent", "baseline.monthlyChurnPercent"]) assert.ok(bad.errors[key], key);
  for (const cac of ["", "-1", "1,200", "300.001"]) assert.equal(calculateCacPayback(input({ baseline: scenario({ cac }) })).status, "invalid");
  for (const newCustomers of ["0", "2.5", "10000001"]) assert.equal(calculateCacPayback(input({ cacSource: "spend", baseline: scenario({ acquisitionSpend: "10", newCustomers }) })).status, "invalid");
  assert.equal(valid({ baseline: scenario({ acquisitionSpend: "bad", newCustomers: "bad", monthlyChurnPercent: "bad" }), alternative: null }).alternative, null);
  for (const raw of [null, [], 5, input({ baseline: null }), input({ compare: "false" }), input({ includeChurn: 1 }), input({ compare: true, alternative: null })]) {
    const r = calculateCacPayback(raw);
    assert.equal(r.status, "invalid");
    assert.ok(r.errors.form);
  }
});
