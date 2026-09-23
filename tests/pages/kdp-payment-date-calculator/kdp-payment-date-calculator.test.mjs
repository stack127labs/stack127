import assert from "node:assert/strict";
import test from "node:test";
import { calculateKdpPaymentDate, formatKdpPaymentMonth } from "../../../lib/kdp-payment-date-calculator/engine.ts";

function paymentMonth(reportedMonth, distribution) {
  const result = calculateKdpPaymentDate({ reportedMonth, distribution });
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  return formatKdpPaymentMonth(result.values.paymentMonth);
}

test("standard and expanded schedules add calendar months across year boundaries", () => {
  assert.equal(paymentMonth("2026-01", "standard"), "March 2026");
  assert.equal(paymentMonth("2026-01", "expanded"), "April 2026");
  assert.equal(paymentMonth("2026-11", "standard"), "January 2027");
  assert.equal(paymentMonth("2026-12", "expanded"), "March 2027");
});

test("month arithmetic ignores leap days and allows the contracted maximum output", () => {
  assert.equal(paymentMonth("2024-02", "standard"), "April 2024");
  assert.equal(paymentMonth("2100-12", "expanded"), "March 2101");
});

test("trims outer whitespace while preserving strict year-month input", () => {
  assert.equal(paymentMonth(" 2026-01 ", "standard"), "March 2026");
  for (const reportedMonth of ["", "2026-00", "2026-13", "2026-1", "2026-01-01", "2006-12", "2101-01"]) {
    const result = calculateKdpPaymentDate({ reportedMonth, distribution: "standard" });
    assert.equal(result.status, "invalid", `${JSON.stringify(reportedMonth)} must be rejected`);
    assert.equal(result.values, null);
  }
});

test("rejects missing values, non-string months, and unknown distributions at the engine boundary", () => {
  for (const input of [
    { reportedMonth: undefined, distribution: "standard" },
    { reportedMonth: 202601, distribution: "standard" },
    { reportedMonth: "2026-01", distribution: "other" },
    { reportedMonth: "2026-01", distribution: undefined },
    null,
  ]) {
    const result = calculateKdpPaymentDate(input);
    assert.equal(result.status, "invalid");
    assert.equal(result.values, null);
    assert.ok(result.issues.length > 0);
  }
});
