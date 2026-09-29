import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateKdpKenpEarnings,
  formatKdpKenpCurrencyMinorUnits,
  normalizeKdpKenpCurrencyCode,
  parseKdpKenpRate,
  parseKdpKenpRead,
} from "../../../lib/kdp/kenp.ts";

function input(overrides = {}) {
  return {
    earningsMonthText: "2026-08",
    marketplaceText: "Amazon.com",
    currencyCodeText: "USD",
    kenpReadText: "60000",
    rateText: "0.00458",
    rateBasis: "planning-assumption",
    ...overrides,
  };
}

function values(result) {
  assert.equal(result.status, "calculated");
  return result.values;
}

test("multiplies 60,000 KENP by a user-entered rate without a hard-coded rate", () => {
  const result = values(calculateKdpKenpEarnings(input()));
  assert.equal(result.amountMinorUnits, "27480");
  assert.equal(result.amountDisplay, "274.80 USD");
  assert.equal(result.kenpRead, 60_000);
  assert.equal(result.rateText, "0.00458");
  assert.equal(result.rateBasisLabel, "My planning assumption");
});

test("rounds a half-cent once, half up, after multiplying all pages", () => {
  const result = values(calculateKdpKenpEarnings(input({ kenpReadText: "125", rateText: "0.00452" })));
  assert.equal(result.amountMinorUnits, "57");
  assert.equal(result.amountDisplay, "0.57 USD");
});

test("shows a positive subunit amount instead of rounded zero", () => {
  const result = values(calculateKdpKenpEarnings(input({ kenpReadText: "1" })));
  assert.equal(result.amountMinorUnits, "0");
  assert.equal(result.amountDisplay, "0.00 USD");
  assert.equal(result.minorUnitDisplay, "0.01 USD");
  assert.equal(result.lessThanMinorUnit, true);
});

test("does not apply the per-customer 3,000-page cap to an aggregate report total", () => {
  const result = values(calculateKdpKenpEarnings(input({ kenpReadText: "3001", rateText: "0.00452" })));
  assert.equal(result.amountDisplay, "13.56 USD");
  assert.equal(result.kenpRead, 3_001);
});

test("accepts zero reads and formats zero with the selected currency precision", () => {
  const usd = values(calculateKdpKenpEarnings(input({ kenpReadText: "0" })));
  const jpy = values(calculateKdpKenpEarnings(input({ kenpReadText: "0", currencyCodeText: "jpy" })));
  assert.equal(usd.amountDisplay, "0.00 USD");
  assert.equal(usd.lessThanMinorUnit, false);
  assert.equal(jpy.amountDisplay, "0 JPY");
  assert.equal(jpy.minorUnitDisplay, "1 JPY");
  assert.equal(formatKdpKenpCurrencyMinorUnits("JPY", "274"), "274 JPY");
});

test("rejects malformed month, marketplace, currency, reads, rate, and basis independently", () => {
  const result = calculateKdpKenpEarnings(input({
    earningsMonthText: "0000-13",
    marketplaceText: "x\u2028Amazon",
    currencyCodeText: "ZZZ",
    kenpReadText: "60,000",
    rateText: "0.004521234",
    rateBasis: "other",
  }));
  assert.equal(result.status, "invalid");
  if (result.status === "invalid") {
    assert.ok(result.fieldErrors.earningsMonth);
    assert.ok(result.fieldErrors.marketplace);
    assert.ok(result.fieldErrors.currencyCode);
    assert.ok(result.fieldErrors.kenpRead);
    assert.ok(result.fieldErrors.rate);
    assert.ok(result.fieldErrors.rateBasis);
  }
});

test("strict parsers keep values exact and enforce bounds without coercion", () => {
  assert.equal(parseKdpKenpRead(" 1000000000 "), 1_000_000_000);
  assert.equal(parseKdpKenpRead("1000000001"), null);
  assert.equal(parseKdpKenpRead("+1"), null);
  assert.equal(parseKdpKenpRead("1e2"), null);
  assert.equal(parseKdpKenpRead("1.0"), null);
  assert.equal(parseKdpKenpRate(" 0.00452123 ")?.units, 452_123n);
  assert.equal(parseKdpKenpRate("0.004521234"), null);
  assert.equal(parseKdpKenpRate("0"), null);
  assert.equal(parseKdpKenpRate("1000.00000000")?.units, 100_000_000_000n);
  assert.equal(parseKdpKenpRate("1000.00000001"), null);
  assert.equal(normalizeKdpKenpCurrencyCode("usd"), "USD");
  assert.equal(normalizeKdpKenpCurrencyCode("ſsd"), null);
});
