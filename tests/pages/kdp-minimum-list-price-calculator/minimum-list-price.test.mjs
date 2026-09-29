import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateKdpMinimumListPrice,
  parseKdpMinimumEbookFileSizeMB,
  parseKdpMinimumGoalCents,
  parseKdpMinimumPageCount,
} from "../../../lib/kdp/minimum-list-price.ts";
import { getKdpEbookPricePoint, getKdpPrintPricePoint } from "../../../lib/kdp/royalty.ts";

function input(overrides = {}) {
  return {
    desiredRoyaltyText: "",
    ebookFileSizeText: "1",
    ebookRoyaltyOption: 70,
    format: "paperback",
    interior: "black-white",
    pageCountText: "300",
    paper: "white",
    trimId: "6x9",
    ...overrides,
  };
}

function valuesFor(result, expectedStatus = "available") {
  assert.equal(result.status, expectedStatus);
  if (result.status !== "available" && result.status !== "unreachable") assert.fail("Expected a calculated result");
  return result.values;
}

test("returns the paperback rule floor with a zero modeled royalty", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input()));
  assert.equal(values.minimumPriceCents, 920);
  assert.equal(values.priceCents, 920);
  assert.equal(values.deductionCents, 460);
  assert.equal(values.royaltyCents, 0);
  assert.equal(values.royaltyRate, 50);
});

test("searches across the $9.98 to $9.99 print rate boundary", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({ desiredRoyaltyText: "$1.39" })));
  assert.equal(getKdpPrintPricePoint(998, 460).royaltyCents, 39);
  assert.equal(values.priceCents, 999);
  assert.equal(values.royaltyCents, 139);
  assert.equal(values.royaltyRate, 60);
});

test("finds the first paperback price that meets a $2.00 goal", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({ desiredRoyaltyText: "2.00" })));
  assert.equal(values.priceCents, 1_100);
  assert.equal(values.priceCents - values.minimumPriceCents, 180);
  assert.equal(getKdpPrintPricePoint(1_099, 460).royaltyCents, 199);
  assert.equal(values.royaltyCents, 200);
});

test("uses the fixed-only hardcover cost and searches cent boundaries", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({
    desiredRoyaltyText: "$1.00",
    format: "hardcover",
    pageCountText: "100",
  })));
  assert.equal(values.deductionCents, 680);
  assert.equal(values.minimumPriceCents, 1_134);
  assert.equal(getKdpPrintPricePoint(1_299, 680).royaltyCents, 99);
  assert.equal(values.priceCents, 1_300);
  assert.equal(values.royaltyCents, 100);
});

test("uses the selected 70% eBook price band and delivery formula", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({
    desiredRoyaltyText: "$2.00",
    ebookFileSizeText: "1",
    format: "ebook",
  })));
  assert.equal(values.minimumPriceCents, 299);
  assert.equal(values.priceCents, 300);
  assert.equal(values.deductionCents, 15);
  assert.equal(values.royaltyCents, 200);
  assert.equal(values.royaltyRate, 70);
});

test("uses the 35% file-size tier and first cent that meets the goal", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({
    desiredRoyaltyText: "$1.00",
    ebookFileSizeText: "3",
    ebookRoyaltyOption: 35,
    format: "ebook",
  })));
  assert.equal(values.minimumPriceCents, 199);
  assert.equal(values.priceCents, 285);
  assert.equal(values.deductionType, "none");
  assert.equal(getKdpEbookPricePoint(284, 35, 3).royaltyCents, 99);
  assert.equal(values.royaltyCents, 100);
});

test("reports an unreachable 70% goal without inventing a price", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({
    desiredRoyaltyText: "$9.00",
    format: "ebook",
  })), "unreachable");
  assert.equal(values.minimumPriceCents, 299);
  assert.equal(values.maximumPriceCents, 1_299);
  assert.equal(values.highestRoyaltyCents, 899);
});

test("keeps a large-file negative 70% royalty as a formula estimate", () => {
  const values = valuesFor(calculateKdpMinimumListPrice(input({
    ebookFileSizeText: "650",
    format: "ebook",
  })));
  assert.equal(values.priceCents, 299);
  assert.equal(values.deductionCents, 9_750);
  assert.equal(values.royaltyCents, -6_616);
});

test("strict parsers reject malformed and out-of-range input without rounding", () => {
  assert.equal(parseKdpMinimumPageCount("300.5"), null);
  assert.equal(parseKdpMinimumPageCount("1e3"), null);
  assert.equal(parseKdpMinimumEbookFileSizeMB("0.000"), null);
  assert.equal(parseKdpMinimumEbookFileSizeMB("1.0001"), null);
  assert.equal(parseKdpMinimumGoalCents("1e3").kind, "invalid");
  assert.equal(parseKdpMinimumGoalCents("$1.23").value, 123);
  assert.equal(parseKdpMinimumGoalCents("0").value, 0);
  const invalidPages = calculateKdpMinimumListPrice(input({ pageCountText: "300.5" }));
  assert.equal(invalidPages.status, "invalid");
  if (invalidPages.status === "invalid") assert.match(invalidPages.fieldErrors.pageCount ?? "", /whole page count/);
  const invalidGoal = calculateKdpMinimumListPrice(input({ desiredRoyaltyText: "1e3" }));
  assert.equal(invalidGoal.status, "invalid");
  if (invalidGoal.status === "invalid") assert.match(invalidGoal.fieldErrors.desiredRoyalty ?? "", /USD amount/);
});
