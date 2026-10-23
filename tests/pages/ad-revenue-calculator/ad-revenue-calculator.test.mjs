import assert from "node:assert/strict";
import test from "node:test";
import {
  AD_REVENUE_EXAMPLE_INPUT,
  adRevenueInputFromQuery,
  adRevenueShareParams,
  calculateAdRevenue,
} from "../../../lib/ad-revenue-calculator/engine.ts";

function run(overrides = {}) {
  return calculateAdRevenue({ ...AD_REVENUE_EXAMPLE_INPUT, ...overrides });
}
function values(overrides = {}) {
  const result = run(overrides);
  assert.equal(result.status, "valid", JSON.stringify(result.errors));
  return result.values;
}
function errors(overrides = {}) {
  const result = run(overrides);
  assert.equal(result.status, "invalid");
  return result.errors;
}

test("every tab opens on the same example answer", () => {
  const revenue = values({ tab: "revenue" });
  assert.equal(revenue.rpm.cents, 1200n);
  assert.equal(revenue.monthly.cents, 60000n);
  assert.equal(revenue.yearly.cents, 720000n);

  const cpm = values({ tab: "cpm" });
  assert.equal(cpm.rpm.cents, 1200n);
  assert.equal(cpm.monthly.cents, 60000n);
  assert.deepEqual(cpm.impressions, { monthly: 200000n, yearly: 2400000n });

  const find = values({ tab: "rpm" });
  assert.equal(find.rpm.cents, 1200n);
  assert.equal(find.yearly.cents, 720000n);
});

test("yearly revenue is exact, not 12 times a rounded month", () => {
  const result = values({ traffic: "333", rpm: "1" });
  assert.equal(result.monthly.cents, 33n);
  assert.equal(result.yearly.cents, 400n);
});

test("CPM to RPM uses fractional impressions and works without traffic", () => {
  const result = values({ tab: "cpm", cpm: "2.35", impressions: "3.5", traffic: "", unit: "sessions" });
  assert.equal(result.rpm.cents, 823n); // 822.5 rounds half up
  assert.equal(result.monthly, null);
  assert.equal(result.impressions, null);
});

test("Find RPM rounds and marks a rate under one cent", () => {
  assert.equal(values({ tab: "rpm", revenue: "100", traffic: "30,000" }).rpm.cents, 333n);
  const tiny = values({ tab: "rpm", revenue: "0.01", traffic: "10000000" }).rpm;
  assert.deepEqual(tiny, { cents: 0n, underCent: true });
});

test("invalid input names the field and the limit", () => {
  assert.deepEqual(errors({ tab: "rpm", traffic: "0" }), { traffic: "Enter more than 0 pageviews to find RPM." });
  assert.equal(errors({ traffic: "", unit: "sessions" }).traffic, "Enter monthly sessions.");
  assert.equal(errors({ traffic: "1.5" }).traffic, "Enter a whole number.");
  assert.equal(errors({ rpm: "-2" }).rpm, "Enter 0 or more.");
  assert.equal(errors({ rpm: "1.234" }).rpm, "Use up to 2 decimals.");
  assert.equal(errors({ tab: "cpm", impressions: "1001" }).impressions, "Enter 1,000 or less.");
  assert.equal(errors({ tab: "cpm", cpm: "abc" }).cpm, "Enter a number, such as 12.50.");
});

test("a shared link reopens only the active tab's fields", () => {
  const params = adRevenueShareParams({ ...AD_REVENUE_EXAMPLE_INPUT, tab: "cpm", traffic: "" });
  assert.deepEqual(params, { tab: "cpm", unit: "pageviews", cpm: "3.00", impressions: "4" });
  const input = adRevenueInputFromQuery((key) => params[key] ?? "");
  assert.equal(input.tab, "cpm");
  assert.equal(input.traffic, "");
  assert.equal(input.rpm, AD_REVENUE_EXAMPLE_INPUT.rpm);
  assert.equal(adRevenueInputFromQuery(() => ""), null);
});
