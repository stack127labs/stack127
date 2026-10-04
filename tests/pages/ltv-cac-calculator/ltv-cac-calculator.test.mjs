import assert from "node:assert/strict";
import test from "node:test";
import { calculateLtvCac } from "../../../lib/ltv-cac-calculator/engine.ts";
import { calculateCustomerLifetimeValue } from "../../../lib/customer-lifetime-value-calculator/engine.ts";

const scenario = (overrides = {}) => ({ arpa: "50", grossMarginPercent: "80", churnPercent: "3", ltv: "", cac: "400", acquisitionSpend: "", newCustomers: "", cacScope: "allAcquisition", ...overrides });
const input = (overrides = {}) => ({ currency: "USD", ltvSource: "model", cacSource: "direct", basis: "month", compare: false, baseline: scenario(), alternative: {}, ...overrides });
function valid(overrides = {}) { const r = calculateLtvCac(input(overrides)); assert.equal(r.status, "valid", JSON.stringify(r.errors)); return r.values; }

test("ratio and payback are separate and LTV agrees with the dedicated model", () => {
  const v = valid().baseline;
  assert.equal(v.ltv.value.cents, 133333n);
  assert.equal(v.ratio.hundredths, 333n);
  assert.equal(v.payback.tenths, 100n);
  assert.equal(v.cohortRecovers, true);
  const ltv = calculateCustomerLifetimeValue({ currency: "USD", basis: "month", compare: false, baseline: scenario() }).values.baseline;
  assert.deepEqual(v.ltv.value, ltv.estimate.grossProfit);
  const year = valid({ basis: "year", cacSource: "spend", baseline: scenario({ arpa: "24000", grossMarginPercent: "75", churnPercent: "20", acquisitionSpend: "100000", newCustomers: "10" }) }).baseline;
  assert.equal(year.ltv.value.cents, 9000000n);
  assert.equal(year.ratio.hundredths, 900n);
  assert.equal(year.payback.tenths, 67n);
});

test("direct LTV has no invented payback or cohort recovery", () => {
  const v = valid({ ltvSource: "direct", basis: "ignored", baseline: scenario({ ltv: "10000", cac: "2500", arpa: "bad", grossMarginPercent: "bad", churnPercent: "bad" }) });
  assert.equal(v.basis, null);
  assert.equal(v.baseline.ratio.hundredths, 400n);
  assert.equal(v.baseline.payback, null);
  assert.equal(v.baseline.cohortRecovers, null);
});

test("zero CAC, zero churn, losses, and zero profit produce distinct outcomes", () => {
  assert.equal(valid({ baseline: scenario({ cac: "0", churnPercent: "0" }) }).baseline.ratio.kind, "zeroAcquisitionCost");
  assert.equal(valid({ baseline: scenario({ cac: "0", grossMarginPercent: "-20" }) }).baseline.payback.kind, "zeroAcquisitionCost");
  const churn = valid({ baseline: scenario({ churnPercent: "0" }) }).baseline;
  assert.equal(churn.ratio.kind, "ltvNotEstimable");
  assert.equal(churn.ltv.value, null);
  assert.equal(churn.payback.tenths, 100n);
  assert.equal(churn.cohortRecovers, null);
  assert.equal(valid({ baseline: scenario({ grossMarginPercent: "-20" }) }).baseline.ratio.kind, "negativeLtv");
  const zero = valid({ baseline: scenario({ grossMarginPercent: "0" }) }).baseline;
  assert.equal(zero.ratio.hundredths, 0n);
  assert.equal(zero.ratio.hundredthsUnderOne, false);
  assert.equal(zero.cohortRecovers, false);
  assert.equal(zero.payback.kind, "never");
});

test("churn recovery uses strict ceiling except when all customers leave after period one", () => {
  assert.equal(valid({ baseline: scenario({ churnPercent: "5", cac: "800" }) }).baseline.cohortRecovers, false);
  assert.equal(valid({ baseline: scenario({ churnPercent: "5", cac: "799.99" }) }).baseline.cohortRecovers, true);
  assert.equal(valid({ baseline: scenario({ churnPercent: "100", cac: "40" }) }).baseline.cohortRecovers, true);
  assert.equal(valid({ baseline: scenario({ churnPercent: "100", cac: "40.01" }) }).baseline.cohortRecovers, false);
});

test("derived CAC and ratios retain sub-cent and large exact values", () => {
  const tiny = valid({ cacSource: "spend", baseline: scenario({ acquisitionSpend: "0.01", newCustomers: "3" }) }).baseline;
  assert.equal(tiny.cac.cents, 0n);
  assert.equal(tiny.cac.isZero, false);
  assert.equal(tiny.cac.roundedToZero, true);
  assert.equal(tiny.ratio.hundredths, 40000000n);
  assert.equal(tiny.payback.tenthsUnderOne, true);
  assert.equal(valid({ ltvSource: "direct", baseline: scenario({ ltv: "1", cac: "1000000" }) }).baseline.ratio.hundredthsUnderOne, true);
  const max = valid({ cacSource: "spend", baseline: scenario({ arpa: "1000000000", grossMarginPercent: "100", churnPercent: "0.01", acquisitionSpend: "0.01", newCustomers: "10000000" }) }).baseline;
  assert.equal(max.ratio.hundredths, 1000000000000000000000000n);
  const fraction = valid({ cacSource: "spend", baseline: scenario({ arpa: "99", grossMarginPercent: "70", churnPercent: "6", acquisitionSpend: "10000", newCustomers: "7" }) }).baseline;
  assert.equal(fraction.cac.cents, 142857n);
  assert.equal(fraction.ratio.hundredths, 81n);
  assert.equal(fraction.payback.tenths, 206n);
});

test("scenario deltas reflect the displayed ratios and preserve CAC scope", () => {
  const v = valid({ compare: true, alternative: scenario({ cac: "150", cacScope: "paidMedia" }) });
  assert.equal(v.alternative.cacScope, "paidMedia");
  assert.deepEqual(v.comparison, { ratioHundredthsDelta: 556n, paybackTenthsDelta: -62n });
  assert.equal(valid({ compare: true, alternative: scenario({ churnPercent: "0" }) }).comparison.ratioHundredthsDelta, null);
});

test("unknown scopes and invalid active fields fail while inactive drafts are ignored", () => {
  const r = calculateLtvCac(input({ baseline: scenario({ cacScope: "", arpa: "-1", grossMarginPercent: "101", churnPercent: "", cac: "$400" }) }));
  assert.equal(r.status, "invalid");
  assert.equal(r.values, null);
  for (const field of ["cacScope", "arpa", "grossMarginPercent", "churnPercent", "cac"]) assert.ok(r.errors[`baseline.${field}`], field);
  for (const raw of [null, [], "form"]) assert.ok(calculateLtvCac(raw).errors.form);
  assert.equal(valid({ alternative: null }).alternative, null);
  assert.equal(valid({ baseline: scenario({ acquisitionSpend: "bad", newCustomers: "0", ltv: "bad" }) }).baseline.ratio.kind, "finite");
  assert.ok(calculateLtvCac(input({ cacSource: "spend", baseline: scenario({ acquisitionSpend: "0", newCustomers: "0" }) })).errors["baseline.newCustomers"]);
});
