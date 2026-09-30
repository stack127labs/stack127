
import assert from "node:assert/strict";
import test from "node:test";
import { calculateSaasMetrics } from "../../../lib/saas-metrics-calculator/engine.ts";

const required = {
  reportingMonth: "2026-04",
  currency: "USD",
  startingMrr: "10000",
  newMrr: "2000",
  expansionMrr: "1000",
  contractionMrr: "500",
  churnedMrr: "500",
};

test("calculates the independently checked full April snapshot", () => {
  const result = calculateSaasMetrics({
    ...required,
    startingAccounts: "100",
    newAccounts: "25",
    churnedAccounts: "5",
    recognizedRevenue: "11000",
    recurringCogs: "2200",
    acquisitionSpend: "4000",
    netCashBurn: "12000",
  });

  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.equal(result.values.endingMrrCents, 1_200_000);
  assert.equal(result.values.endingArrCents, 14_400_000);
  assert.equal(result.values.netNewMrrCents, 200_000);
  assert.equal(result.values.mrrGrowth, 0.2);
  assert.equal(result.values.nrr, 1);
  assert.equal(result.values.grr, 0.9);
  assert.deepEqual(result.values.accounts, { starting: 100, new: 25, churned: 5, ending: 120 });
  assert.equal(result.values.customerChurn, 0.05);
  assert.equal(result.values.grossMargin, 0.8);
  assert.equal(result.values.monthlyArpa, 100);
  assert.equal(result.values.cac, 160);
  assert.equal(result.values.simpleLtv, 1600);
  assert.equal(result.values.cacPaybackMonths, 2);
  assert.equal(result.values.burnMultiple, 0.5);
});

test("keeps zero-denominator and negative-growth results undefined", () => {
  const zeroStart = calculateSaasMetrics({
    reportingMonth: "2026-05",
    currency: "USD",
    startingMrr: "0",
    newMrr: "1000",
    expansionMrr: "0",
    contractionMrr: "0",
    churnedMrr: "0",
  });
  assert.equal(zeroStart.status, "valid");
  if (zeroStart.status !== "valid") return;
  assert.equal(zeroStart.values.endingMrrCents, 100_000);
  assert.equal(zeroStart.values.endingArrCents, 1_200_000);
  assert.equal(zeroStart.values.mrrGrowth, null);
  assert.equal(zeroStart.values.nrr, null);
  assert.equal(zeroStart.values.grr, null);
  assert.equal(zeroStart.values.accounts, null);

  const negativeChange = calculateSaasMetrics({
    reportingMonth: "2026-06",
    currency: "USD",
    startingMrr: "1000",
    newMrr: "0",
    expansionMrr: "0",
    contractionMrr: "100",
    churnedMrr: "100",
    netCashBurn: "1000",
  });
  assert.equal(negativeChange.status, "valid");
  if (negativeChange.status !== "valid") return;
  assert.equal(negativeChange.values.netNewMrrCents, -20_000);
  assert.equal(negativeChange.values.mrrGrowth, -0.2);
  assert.equal(negativeChange.values.nrr, 0.8);
  assert.equal(negativeChange.values.grr, 0.8);
  assert.equal(negativeChange.values.burnMultiple, null);
});

test("accepts signed cash generation and returns no negative burn multiple", () => {
  const result = calculateSaasMetrics({
    ...required,
    netCashBurn: "-500",
  });
  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.equal(result.values.netCashBurnCents, -50_000);
  assert.equal(result.values.burnMultiple, null);
});

test("keeps a tiny positive burn multiple above zero for display", () => {
  const result = calculateSaasMetrics({
    reportingMonth: "2026-05",
    currency: "USD",
    startingMrr: "0",
    newMrr: "100",
    expansionMrr: "0",
    contractionMrr: "0",
    churnedMrr: "0",
    netCashBurn: "0.01",
  });
  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.ok(result.values.burnMultiple > 0);
  assert.ok(result.values.burnMultiple < 0.005);
});

test("rejects malformed required inputs, bad month, partial groups, and inconsistent movements", () => {
  const malformed = calculateSaasMetrics({
    ...required,
    reportingMonth: "2026-13",
    startingMrr: "1,000",
    newMrr: "1e3",
    expansionMrr: "1.234",
  });
  assert.equal(malformed.status, "invalid");
  if (malformed.status !== "invalid") return;
  assert.ok(malformed.errors.reportingMonth);
  assert.ok(malformed.errors.startingMrr);
  assert.ok(malformed.errors.newMrr);
  assert.ok(malformed.errors.expansionMrr);

  const partial = calculateSaasMetrics({
    ...required,
    startingAccounts: "100",
  });
  assert.equal(partial.status, "invalid");
  if (partial.status !== "invalid") return;
  assert.ok(partial.errors.newAccounts);
  assert.ok(partial.errors.churnedAccounts);

  const overLoss = calculateSaasMetrics({
    ...required,
    startingMrr: "100",
    newMrr: "0",
    expansionMrr: "0",
    contractionMrr: "80",
    churnedMrr: "30",
  });
  assert.equal(overLoss.status, "invalid");
  if (overLoss.status !== "invalid") return;
  assert.match(overLoss.errors.churnedMrr ?? "", /cannot exceed starting MRR/);
});

test("rejects non-string amount inputs, invalid currency, and account-zero mismatches", () => {
  const nonString = calculateSaasMetrics({
    ...required,
    startingMrr: 10000,
  });
  assert.equal(nonString.status, "invalid");
  if (nonString.status !== "invalid") return;
  assert.ok(nonString.errors.startingMrr);

  const currency = calculateSaasMetrics({ ...required, currency: "JPY" });
  assert.equal(currency.status, "invalid");
  if (currency.status !== "invalid") return;
  assert.ok(currency.errors.currency);

  const mismatch = calculateSaasMetrics({
    ...required,
    startingAccounts: "0",
    newAccounts: "25",
    churnedAccounts: "5",
  });
  assert.equal(mismatch.status, "invalid");
  if (mismatch.status !== "invalid") return;
  assert.ok(mismatch.errors.startingAccounts);
});
