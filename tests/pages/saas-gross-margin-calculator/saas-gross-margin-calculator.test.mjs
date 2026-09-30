import assert from "node:assert/strict";
import test from "node:test";
import { calculateSaasGrossMargin, SAAS_GROSS_MARGIN_MAX_CENTS } from "../../../lib/saas-gross-margin-calculator/engine.ts";

const required = {
  reportingPeriod: "April 2026",
  revenueScope: "company",
  scopeName: "",
  currency: "USD",
  recognizedRevenue: "200000",
  hostingInfrastructure: "20000",
  thirdPartyDelivery: "10000",
  paymentProcessing: "6000",
  supportPeople: "14000",
  otherCostOfRevenue: "0",
};

function calculate(overrides = {}) {
  return calculateSaasGrossMargin({ ...required, ...overrides });
}

test("calculates cost of revenue, gross profit, and margin from exact cents", () => {
  const result = calculate();
  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.equal(result.values.costOfRevenueCents, 5_000_000n);
  assert.equal(result.values.grossProfitCents, 15_000_000n);
  assert.equal(result.values.grossMarginHundredths, 7_500n);
  assert.equal(result.values.grossMarginRoundedToZero, false);
});

test("rounds repeating percentages half up in magnitude", () => {
  const repeating = calculate({
    recognizedRevenue: "3.00",
    hostingInfrastructure: "1.00",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(repeating.status, "valid");
  if (repeating.status !== "valid") return;
  assert.equal(repeating.values.grossMarginHundredths, 6_667n);

  const positiveTie = calculate({
    recognizedRevenue: "200.00",
    hostingInfrastructure: "199.99",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(positiveTie.status, "valid");
  if (positiveTie.status !== "valid") return;
  assert.equal(positiveTie.values.grossMarginHundredths, 1n);

  const negativeTie = calculate({
    recognizedRevenue: "200.00",
    hostingInfrastructure: "200.01",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(negativeTie.status, "valid");
  if (negativeTie.status !== "valid") return;
  assert.equal(negativeTie.values.grossMarginHundredths, -1n);
});

test("keeps negative gross profit valid when delivery costs exceed revenue", () => {
  const result = calculate({
    recognizedRevenue: "1000",
    hostingInfrastructure: "400",
    thirdPartyDelivery: "300",
    paymentProcessing: "200",
    supportPeople: "250",
    otherCostOfRevenue: "0",
  });
  assert.equal(result.status, "valid");
  if (result.status !== "valid") return;
  assert.equal(result.values.costOfRevenueCents, 115_000n);
  assert.equal(result.values.grossProfitCents, -15_000n);
  assert.equal(result.values.grossMarginHundredths, -1_500n);
});

test("zero revenue has no margin denominator, whether costs are zero or not", () => {
  const withCosts = calculate({
    recognizedRevenue: "0",
    hostingInfrastructure: "200",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(withCosts.status, "valid");
  if (withCosts.status !== "valid") return;
  assert.equal(withCosts.values.costOfRevenueCents, 20_000n);
  assert.equal(withCosts.values.grossProfitCents, -20_000n);
  assert.equal(withCosts.values.grossMarginHundredths, null);

  const allZero = calculate({
    recognizedRevenue: "0",
    hostingInfrastructure: "0",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(allZero.status, "valid");
  if (allZero.status !== "valid") return;
  assert.equal(allZero.values.grossProfitCents, 0n);
  assert.equal(allZero.values.grossMarginHundredths, null);
});

test("flags a nonzero margin that rounds to 0.00% so the display can preserve its sign", () => {
  const positive = calculate({
    recognizedRevenue: "2000",
    hostingInfrastructure: "1999.99",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(positive.status, "valid");
  if (positive.status !== "valid") return;
  assert.equal(positive.values.grossMarginHundredths, 0n);
  assert.equal(positive.values.grossMarginRoundedToZero, true);

  const negative = calculate({
    recognizedRevenue: "2000",
    hostingInfrastructure: "2000.01",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(negative.status, "valid");
  if (negative.status !== "valid") return;
  assert.equal(negative.values.grossProfitCents, -1n);
  assert.equal(negative.values.grossMarginHundredths, 0n);
  assert.equal(negative.values.grossMarginRoundedToZero, true);
});

test("accepts the exact amount ceiling and rejects values above it", () => {
  const maximum = calculate({
    recognizedRevenue: "1000000000000.00",
    hostingInfrastructure: "1000000000000.00",
    thirdPartyDelivery: "0",
    paymentProcessing: "0",
    supportPeople: "0",
    otherCostOfRevenue: "0",
  });
  assert.equal(maximum.status, "valid");
  if (maximum.status !== "valid") return;
  assert.equal(maximum.values.recognizedRevenueCents, SAAS_GROSS_MARGIN_MAX_CENTS);
  assert.equal(maximum.values.costsCents.hostingInfrastructure, SAAS_GROSS_MARGIN_MAX_CENTS);
  assert.equal(maximum.values.grossProfitCents, 0n);

  const over = calculate({ recognizedRevenue: "1000000000000.01" });
  assert.equal(over.status, "invalid");
  if (over.status !== "invalid") return;
  assert.match(over.errors.recognizedRevenue ?? "", /0 to 1,000,000,000,000\.00/);
});

test("rejects malformed, missing, and non-string amounts with field-specific errors", () => {
  for (const amount of ["1e3", "-1", "+1", "0.001", "1,000", "$100", "1 000", ""]) {
    const result = calculate({ hostingInfrastructure: amount });
    assert.equal(result.status, "invalid", `expected ${JSON.stringify(amount)} to be invalid`);
    if (result.status === "invalid") assert.ok(result.errors.hostingInfrastructure);
  }

  const nonString = calculate({ recognizedRevenue: 1000 });
  assert.equal(nonString.status, "invalid");
  if (nonString.status !== "invalid") return;
  assert.ok(nonString.errors.recognizedRevenue);

  const missingCost = calculate({ otherCostOfRevenue: " " });
  assert.equal(missingCost.status, "invalid");
  if (missingCost.status !== "invalid") return;
  assert.ok(missingCost.errors.otherCostOfRevenue);
});

test("validates reporting labels, revenue scope, and currency at the engine boundary", () => {
  const invalidPeriod = calculate({ reportingPeriod: `April\n2026` });
  assert.equal(invalidPeriod.status, "invalid");
  if (invalidPeriod.status !== "invalid") return;
  assert.ok(invalidPeriod.errors.reportingPeriod);

  const invalidScope = calculate({ revenueScope: "other" });
  assert.equal(invalidScope.status, "invalid");
  if (invalidScope.status !== "invalid") return;
  assert.ok(invalidScope.errors.revenueScope);

  const invalidCurrency = calculate({ currency: "JPY" });
  assert.equal(invalidCurrency.status, "invalid");
  if (invalidCurrency.status !== "invalid") return;
  assert.ok(invalidCurrency.errors.currency);

  const missingName = calculate({ revenueScope: "named", scopeName: "  " });
  assert.equal(missingName.status, "invalid");
  if (missingName.status !== "invalid") return;
  assert.ok(missingName.errors.scopeName);

  const named = calculate({ revenueScope: "named", scopeName: " Pro plan " });
  assert.equal(named.status, "valid");
  if (named.status === "valid") assert.equal(named.values.scopeName, "Pro plan");
});
