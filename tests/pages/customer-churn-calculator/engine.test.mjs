import assert from "node:assert/strict";
import test from "node:test";
import { calculateCustomerChurn } from "../../../lib/customer-churn-calculator/engine.ts";

function values(openingAccounts, lostAccounts) {
  const result = calculateCustomerChurn({ openingAccounts, lostAccounts });
  assert.equal(result.status, "valid", JSON.stringify(result.status === "invalid" ? result.errors : {}));
  return result.values;
}

function invalid(openingAccounts, lostAccounts) {
  const result = calculateCustomerChurn({ openingAccounts, lostAccounts });
  assert.equal(result.status, "invalid");
  return result.errors;
}

test("calculates churn and the retained opening count", () => {
  assert.deepEqual(values("100", "5"), {
    openingAccounts: 100,
    lostAccounts: 5,
    retainedOpeningAccounts: 95,
    churnBasisPoints: 500,
  });
});

test("rounds repeating rates once to two decimal places", () => {
  assert.equal(values("3", "1").churnBasisPoints, 3333);
});

test("rounds an exact half hundredth of a percentage up", () => {
  assert.equal(values("20000", "1").churnBasisPoints, 1);
});

test("keeps zero loss, complete loss, and the maximum count exact", () => {
  assert.equal(values("100", "0").churnBasisPoints, 0);
  assert.deepEqual(values("1000000000", "1000000000"), {
    openingAccounts: 1_000_000_000,
    lostAccounts: 1_000_000_000,
    retainedOpeningAccounts: 0,
    churnBasisPoints: 10_000,
  });
});

test("returns an unavailable rate for an empty opening base", () => {
  assert.deepEqual(values("0", "0"), {
    openingAccounts: 0,
    lostAccounts: 0,
    retainedOpeningAccounts: 0,
    churnBasisPoints: null,
  });
});

test("accepts trimmed ASCII digits and leading zeroes without treating blank as zero", () => {
  assert.equal(values(" 00100 ", " 005 ").churnBasisPoints, 500);
  assert.match(invalid("", "0").openingAccounts, /Enter the opening paying accounts/);
  assert.match(invalid("0", " ").lostAccounts, /Enter the lost opening accounts/);
});

test("rejects malformed, signed, formatted, non-string, and out-of-range counts", () => {
  for (const value of ["-1", "+1", "2.5", "1e3", "1,000", "1 000", "١", "1000000001", "9".repeat(1000)]) {
    assert.ok(invalid(value, "0").openingAccounts, `expected opening count error for ${JSON.stringify(value)}`);
  }
  for (const value of [undefined, null, 100, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.ok(invalid(value, "0").openingAccounts, `expected non-string error for ${String(value)}`);
  }
});

test("rejects losses larger than the opening base, including an empty base", () => {
  assert.match(invalid("100", "101").lostAccounts, /cannot exceed/);
  assert.match(invalid("0", "1").lostAccounts, /cannot exceed/);
});

test("returns errors for both missing fields and rejects a non-object input", () => {
  assert.deepEqual(calculateCustomerChurn({}), {
    status: "invalid",
    errors: {
      openingAccounts: "Enter the opening paying accounts count.",
      lostAccounts: "Enter the lost opening accounts count.",
    },
  });
  assert.equal(calculateCustomerChurn(null).status, "invalid");
});
