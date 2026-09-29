import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateKdpBreakEvenAcos,
  formatKdpBreakEvenAcos,
  formatKdpBreakEvenMoneyCents,
  formatKdpBreakEvenPurchaseRate,
} from "../../../lib/kdp/break-even-acos.ts";

function input(overrides = {}) {
  return {
    royaltyText: "$4.39",
    profitTargetText: "$1.00",
    purchaseRateText: "10.00",
    cpcText: "$0.30",
    salesValueText: "$14.99",
    ...overrides,
  };
}

function values(result) {
  assert.equal(result.status, "calculated");
  return result.values;
}

test("floors the maximum CPC and computes the known unit-profit example", () => {
  const result = values(calculateKdpBreakEvenAcos(input()));
  assert.equal(result.headroomCents, 339);
  assert.equal(result.maximumCpcCents, 33);
  assert.equal(result.meetsTarget, true);
  assert.equal(result.modeledClickCostCents, 300n);
  assert.equal(result.modeledAmountLeftCents, 139n);
  assert.deepEqual(result.requiredRate, { kind: "rate", hundredthsOfPercent: 885 });
  assert.equal(result.modeledAcosTenthsPercent, 200n);
  assert.equal(result.targetAcosTenthsPercent, 226n);
  assert.equal(formatKdpBreakEvenPurchaseRate(885), "8.85%");
  assert.equal(formatKdpBreakEvenAcos(226n), "22.6%");
});

test("does not round a fractional-cent bid ceiling upward and compares the entered CPC exactly", () => {
  const result = values(calculateKdpBreakEvenAcos(input({
    profitTargetText: "$0.00",
    cpcText: "$0.44",
    salesValueText: "",
  })));
  assert.equal(result.maximumCpcCents, 43);
  assert.equal(result.meetsTarget, false);
  assert.equal(result.modeledClickCostCents, 440n);
  assert.equal(result.modeledAmountLeftCents, -1n);
  assert.deepEqual(result.requiredRate, { kind: "rate", hundredthsOfPercent: 1003 });
  assert.equal(result.modeledAcosTenthsPercent, null);
  assert.equal(result.targetAcosTenthsPercent, null);
  assert.equal(formatKdpBreakEvenMoneyCents(result.modeledAmountLeftCents), "-$0.01");
});

test("meets the target at exact equality and misses one cent above the ceiling", () => {
  const equal = values(calculateKdpBreakEvenAcos(input({ purchaseRateText: "100.00", cpcText: "$3.39" })));
  const above = values(calculateKdpBreakEvenAcos(input({ purchaseRateText: "100.00", cpcText: "$3.40" })));
  assert.equal(equal.maximumCpcCents, 339);
  assert.equal(equal.meetsTarget, true);
  assert.equal(equal.modeledAmountLeftCents, 100n);
  assert.equal(above.meetsTarget, false);
});

test("zero purchases suppress sale-based values but may show a required positive rate", () => {
  const result = values(calculateKdpBreakEvenAcos(input({ purchaseRateText: "0.00", cpcText: "$0.30" })));
  assert.equal(result.maximumCpcCents, null);
  assert.equal(result.meetsTarget, null);
  assert.equal(result.modeledClickCostCents, null);
  assert.equal(result.modeledAmountLeftCents, null);
  assert.deepEqual(result.requiredRate, { kind: "rate", hundredthsOfPercent: 885 });
  assert.equal(result.modeledAcosTenthsPercent, null);
  assert.equal(result.targetAcosTenthsPercent, 226n);
});

test("zero CPC with royalty headroom needs any positive purchase rate and has a zero modeled cost", () => {
  const result = values(calculateKdpBreakEvenAcos(input({ cpcText: "$0.00" })));
  assert.equal(result.maximumCpcCents, 33);
  assert.equal(result.meetsTarget, true);
  assert.equal(result.modeledClickCostCents, 0n);
  assert.equal(result.modeledAmountLeftCents, 439n);
  assert.deepEqual(result.requiredRate, { kind: "any-positive" });
});

test("a target above royalty has no ceiling or required-rate claim but keeps modeled amount", () => {
  const result = values(calculateKdpBreakEvenAcos(input({ profitTargetText: "$5.00", cpcText: "$0.00" })));
  assert.equal(result.headroomCents, -61);
  assert.equal(result.maximumCpcCents, null);
  assert.equal(result.meetsTarget, false);
  assert.equal(result.modeledAmountLeftCents, 439n);
  assert.deepEqual(result.requiredRate, { kind: "target-exceeds-royalty" });
  assert.equal(result.targetAcosTenthsPercent, null);
});

test("zero headroom only meets the target at zero CPC; positive bids have no feasible rate", () => {
  const zeroBid = values(calculateKdpBreakEvenAcos(input({ profitTargetText: "$4.39", cpcText: "$0.00" })));
  const positiveBid = values(calculateKdpBreakEvenAcos(input({ profitTargetText: "$4.39", cpcText: "$0.01" })));
  assert.equal(zeroBid.maximumCpcCents, 0);
  assert.equal(zeroBid.meetsTarget, true);
  assert.deepEqual(zeroBid.requiredRate, { kind: "any-positive" });
  assert.equal(positiveBid.maximumCpcCents, 0);
  assert.equal(positiveBid.meetsTarget, false);
  assert.deepEqual(positiveBid.requiredRate, { kind: "no-headroom" });
});

test("marks a required purchase rate above 100% as unattainable", () => {
  const result = values(calculateKdpBreakEvenAcos(input({ royaltyText: "$0.01", profitTargetText: "$0.00", cpcText: "$10.00", purchaseRateText: "10.00" })));
  assert.deepEqual(result.requiredRate, { kind: "above-100" });
  assert.equal(result.meetsTarget, false);
});

test("invalid money, percentage, and optional sales value return field errors and no values", () => {
  const result = calculateKdpBreakEvenAcos(input({
    royaltyText: "",
    profitTargetText: "$1,000.01",
    purchaseRateText: "10.001",
    cpcText: "-$0.10",
    salesValueText: "$0.00",
  }));
  assert.equal(result.status, "invalid");
  if (result.status === "invalid") {
    assert.ok(result.fieldErrors.royalty);
    assert.ok(result.fieldErrors.profitTarget);
    assert.ok(result.fieldErrors.purchaseRate);
    assert.ok(result.fieldErrors.cpc);
    assert.ok(result.fieldErrors.salesValue);
    assert.equal("values" in result, false);
  }
});

test("parsers accept optional dollar marks but reject locale, exponent, suffix, and over-precision text", () => {
  const good = values(calculateKdpBreakEvenAcos(input({ royaltyText: " 4.3 ", profitTargetText: "0", purchaseRateText: "100", cpcText: "$0.01", salesValueText: "" })));
  assert.equal(good.royaltyCents, 430);
  assert.equal(good.profitTargetCents, 0);
  assert.equal(good.purchaseRateBasisPoints, 10_000);
  for (const malformed of ["$1,000", "1e2", "+1.00", "1.001", "1."]) {
    const bad = calculateKdpBreakEvenAcos(input({ royaltyText: malformed }));
    assert.equal(bad.status, "invalid", malformed);
  }
  for (const malformed of ["10.001", "10%", "-1", "1e1"]) {
    const bad = calculateKdpBreakEvenAcos(input({ purchaseRateText: malformed }));
    assert.equal(bad.status, "invalid", malformed);
  }
});
