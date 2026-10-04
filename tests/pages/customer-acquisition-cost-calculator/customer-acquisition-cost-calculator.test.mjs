import assert from "node:assert/strict";
import test from "node:test";
import { CAC_SCENARIO_FIELDS, calculateCustomerAcquisitionCost } from "../../../lib/customer-acquisition-cost-calculator/engine.ts";

const scenario = (overrides = {}) => ({ ...Object.fromEntries(CAC_SCENARIO_FIELDS.map(f => [f, ""])), timing: "samePeriod", allocationMethod: "share", paidMedia: "1200", toolsContentEvents: "300", newCustomers: "20", ...overrides });
const input = (overrides = {}) => ({ currency: "USD", includeShared: false, includeFounderTime: false, compare: false, baseline: scenario(), alternative: {}, ...overrides });
function valid(overrides = {}) { const r = calculateCustomerAcquisitionCost(input(overrides)); assert.equal(r.status, "valid", JSON.stringify(r.errors)); return r.values; }

test("CAC separates cash, unpaid founder time, and paid media denominators", () => {
  const v = valid({ includeFounderTime: true, baseline: scenario({ founderHours: "40", founderHourlyValue: "75" }) }).baseline;
  assert.equal(v.cashTotalCents, 150000n);
  assert.equal(v.cashCac.cents, 7500n);
  assert.equal(v.founderTime.valueCents, 300000n);
  assert.equal(v.totalWithFounderTimeCents, 450000n);
  assert.equal(v.cacWithFounderTime.cents, 22500n);
  assert.equal(v.costs[1].enteredCents, null);
  const paid = valid({ baseline: scenario({ paidMedia: "5000", salesMarketingPay: "3000", toolsContentEvents: "2000", newCustomers: "100", paidCustomers: "40" }) }).baseline;
  assert.equal(paid.cashCac.cents, 10000n);
  assert.equal(paid.paidMediaCac.cents, 12500n);
});

test("shared costs use explicit shares, acquisition hours, or fractional headcount", () => {
  const hours = valid({ includeShared: true, baseline: scenario({ paidMedia: "7000", salesMarketingPay: "12000", toolsContentEvents: "", sharedCosts: "9000", allocationMethod: "hours", acquisitionHours: "120", totalHours: "400", newCustomers: "30" }) }).baseline;
  assert.equal(hours.shared.allocatedCents, 270000n);
  assert.equal(hours.cashCac.cents, 72333n);
  assert.equal(hours.cashCac.isRounded, true);
  const head = valid({ includeShared: true, baseline: scenario({ paidMedia: "", toolsContentEvents: "", agencies: "500", sharedCosts: "10000", allocationMethod: "headcount", acquisitionHeadcount: "1.5", totalHeadcount: "6", newCustomers: "7" }) }).baseline;
  assert.equal(head.shared.allocatedCents, 250000n);
  assert.equal(head.cashCac.cents, 42857n);
  const share = valid({ includeShared: true, baseline: scenario({ paidMedia: "1000", toolsContentEvents: "", sharedCosts: "4000", sharePercent: "12.5", newCustomers: "3" }) }).baseline;
  assert.equal(share.shared.allocatedCents, 50000n);
  assert.equal(share.cashCac.cents, 50000n);
});

test("fractions are rounded only after dividing by customers", () => {
  const v = valid({ includeShared: true, baseline: scenario({ paidMedia: "", toolsContentEvents: "", sharedCosts: "0.01", sharePercent: "50", newCustomers: "2" }) }).baseline;
  assert.equal(v.shared.allocatedCents, 1n);
  assert.deepEqual(v.cashCac, { kind: "finite", cents: 0n, isRounded: true, roundedToZero: true });
  const founder = valid({ includeFounderTime: true, baseline: scenario({ paidMedia: "500", toolsContentEvents: "", founderHours: "12.25", founderHourlyValue: "33.33", newCustomers: "4" }) }).baseline;
  assert.equal(founder.founderTime.valueCents, 40829n);
  assert.equal(founder.founderTime.valueIsRounded, true);
  assert.equal(founder.cacWithFounderTime.cents, 22707n);
});

test("zero customers remain distinct from a zero acquisition cost", () => {
  const zeroCustomers = valid({ baseline: scenario({ newCustomers: "0" }) }).baseline;
  assert.deepEqual(zeroCustomers.cashCac, { kind: "noCustomers" });
  assert.equal(zeroCustomers.costs[0].perCustomerCents, null);
  const zeroPaid = valid({ baseline: scenario({ paidCustomers: "0" }) }).baseline;
  assert.deepEqual(zeroPaid.paidMediaCac, { kind: "noCustomers" });
  assert.equal(valid({ baseline: scenario({ paidMedia: "0", toolsContentEvents: "0" }) }).baseline.cashCac.cents, 0n);
});

test("comparison follows visible values and ignores disabled drafts", () => {
  const v = valid({ compare: true, baseline: scenario(), alternative: scenario({ paidMedia: "1500" }) });
  assert.equal(v.comparison.cashCacDeltaCents, 1500n);
  assert.equal(v.comparison.cacWithFounderTimeDeltaCents, null);
  assert.equal(valid({ baseline: scenario({ sharedCosts: "bad", founderHours: "bad" }), alternative: null }).alternative, null);
  assert.equal(valid({ includeShared: true, baseline: scenario({ sharedCosts: "100", sharePercent: "0", totalHours: "bad" }) }).baseline.shared.allocatedCents, 0n);
});

test("invalid costs, allocations, counts, and malformed forms collect field errors", () => {
  const r = calculateCustomerAcquisitionCost(input({ includeShared: true, includeFounderTime: true, baseline: scenario({ paidMedia: "-1", toolsContentEvents: "1e3", sharedCosts: "$4", allocationMethod: "hours", acquisitionHours: "5", totalHours: "3", founderHours: "100000.01", founderHourlyValue: "1000000.01", newCustomers: "2", paidCustomers: "3", timing: "quarter" }) }));
  assert.equal(r.status, "invalid");
  for (const field of ["paidMedia", "toolsContentEvents", "sharedCosts", "acquisitionHours", "founderHours", "founderHourlyValue", "paidCustomers", "timing"]) assert.ok(r.errors[`baseline.${field}`], field);
  for (const raw of [null, [], 3]) assert.ok(calculateCustomerAcquisitionCost(raw).errors.form);
  assert.ok(calculateCustomerAcquisitionCost(input({ baseline: scenario({ paidMedia: "", toolsContentEvents: "" }) })).errors["baseline.paidMedia"]);
  assert.match(calculateCustomerAcquisitionCost(input({ baseline: scenario({ paidMedia: "", toolsContentEvents: "", paidCustomers: "0" }) })).errors["baseline.paidMedia"], /paid media/);
  assert.ok(calculateCustomerAcquisitionCost(input({ includeShared: true, baseline: scenario({ sharedCosts: "10", allocationMethod: "headcount", acquisitionHeadcount: "0", totalHeadcount: "0" }) })).errors["baseline.totalHeadcount"]);
});
