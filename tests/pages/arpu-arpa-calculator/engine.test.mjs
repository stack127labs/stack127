import assert from "node:assert/strict";
import test from "node:test";
import { calculateArpuArpa } from "../../../lib/arpu-arpa-calculator/engine.ts";

function valid(input) {
  const result = calculateArpuArpa(input);
  assert.equal(result.status, "valid", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function unavailable(input) {
  const result = calculateArpuArpa(input);
  assert.equal(result.status, "unavailable", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function invalid(input) {
  const result = calculateArpuArpa(input);
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  return result.errors;
}

test("calculates period ARPU from exact net revenue and distinct active users", () => {
  const result = valid({
    mode: "arpu",
    currency: "USD",
    period: " Apr to Jun 2026 ",
    revenue: "75000.00",
    count: " 005000 ",
  });

  assert.deepEqual(result, {
    mode: "arpu",
    currency: "USD",
    period: "Apr to Jun 2026",
    revenueCents: 7_500_000n,
    count: 5_000n,
    averageTenThousandths: 150_000n,
    nonzeroRoundedToZero: false,
  });
});

test("retains small and negative ARPU values at four decimal places", () => {
  assert.equal(valid({ mode: "arpu", currency: "USD", period: "Sep 2026", revenue: "0.03", count: "10" }).averageTenThousandths, 30n);
  assert.equal(valid({ mode: "arpu", currency: "USD", period: "Sep 2026", revenue: "-50", count: "100" }).averageTenThousandths, -5_000n);
  assert.equal(valid({ mode: "arpu", currency: "USD", period: "Sep 2026", revenue: "-0.01", count: "201" }).nonzeroRoundedToZero, true);
});

test("rounds exact half cases up in magnitude and handles the maximum with BigInt", () => {
  assert.equal(valid({ mode: "arpu", currency: "USD", period: "Sep 2026", revenue: "0.01", count: "200" }).averageTenThousandths, 1n);

  const result = valid({
    mode: "arpa",
    currency: "USD",
    period: "2100-12",
    revenue: "1000000000000.00",
    count: "1",
  });
  assert.equal(result.averageTenThousandths, 10_000_000_000_000_000n);
  assert.equal(result.revenueCents, 100_000_000_000_000n);
});

test("calculates monthly ARPA and preserves exact zero revenue", () => {
  assert.equal(valid({ mode: "arpa", currency: "USD", period: "2026-04", revenue: "12000", count: "120" }).averageTenThousandths, 1_000_000n);
  assert.equal(valid({ mode: "arpa", currency: "EUR", period: "1900-01", revenue: "0", count: "20" }).averageTenThousandths, 0n);
});

test("returns an unavailable state for zero populations and flags positive MRR", () => {
  const arpu = unavailable({ mode: "arpu", currency: "USD", period: "Apr to Jun 2026", revenue: "0", count: "0" });
  assert.equal(arpu.checkSourceConsistency, false);

  const arpa = unavailable({ mode: "arpa", currency: "USD", period: "2026-04", revenue: "12", count: "0" });
  assert.equal(arpa.checkSourceConsistency, true);

  const zeroMrr = unavailable({ mode: "arpa", currency: "USD", period: "2026-04", revenue: "0", count: "0" });
  assert.equal(zeroMrr.checkSourceConsistency, false);
});

test("rejects malformed, over-precise, and out-of-range numbers without partial results", () => {
  for (const revenue of ["", "1e3", "1,000", "$1", "+1", "1.234", "1000000000000.01"]) {
    assert.ok(invalid({ mode: "arpu", currency: "USD", period: "Apr 2026", revenue, count: "1" }).revenue, revenue);
  }
  for (const count of ["", "1.5", "-1", "+1", "1e3", "1,000", "1000000001"]) {
    assert.ok(invalid({ mode: "arpu", currency: "USD", period: "Apr 2026", revenue: "1", count }).count, count);
  }
  assert.ok(invalid({ mode: "arpa", currency: "USD", period: "2026-04", revenue: "-1", count: "1" }).revenue);
  assert.ok(invalid({ mode: "arpa", currency: "USD", period: "2026-13", revenue: "1", count: "1" }).period);
  assert.ok(invalid({ mode: "arpa", currency: "USD", period: "1899-12", revenue: "1", count: "1" }).period);
  assert.ok(invalid({ mode: "arpu", currency: "USD", period: "x".repeat(81), revenue: "1", count: "1" }).period);
});

test("rejects unsupported modes, currencies, and non-string field values", () => {
  assert.ok(invalid({ mode: "other", currency: "USD", period: "Apr 2026", revenue: "1", count: "1" }).mode);
  assert.ok(invalid({ mode: "arpu", currency: "usd", period: "Apr 2026", revenue: "1", count: "1" }).currency);
  assert.ok(invalid({ mode: "arpu", currency: "USD", period: 2026, revenue: 1, count: 1 }).period);
  assert.ok(invalid(null).mode);
});
