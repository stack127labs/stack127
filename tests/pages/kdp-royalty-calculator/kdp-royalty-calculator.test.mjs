import assert from "node:assert/strict";
import test from "node:test";
import { calculateKdpRoyalty } from "../../../lib/kdp/royalty.ts";

test("FF-010 calculates current US paperback print cost and 60 percent royalty", () => {
  const result = calculateKdpRoyalty({
    format: "paperback",
    trimId: "6x9",
    pageCount: 300,
    interior: "black-white",
    paper: "white",
    listPrice: 9.99,
    monthlyTarget: 100,
  });
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  assert.equal(result.values.printingCostCents, 460);
  assert.equal(result.values.royaltyRate, 60);
  assert.equal(result.values.royaltyCents, 139);
  assert.equal(result.values.minimumListPriceCents, 920);
  assert.equal(result.values.breakEvenAdSpendCents, 139);
  assert.equal(result.values.breakEvenAcosBasisPoints, 1391);
});

test("FF-011 uses short-run and large-trim pricing branches", () => {
  const short = calculateKdpRoyalty({
    format: "paperback",
    trimId: "6x9",
    pageCount: 100,
    interior: "black-white",
    paper: "white",
    listPrice: 9.98,
  });
  assert.equal(short.values?.printingCostCents, 230);
  assert.equal(short.values?.royaltyRate, 50);
  assert.equal(short.values?.royaltyCents, 269);

  const largeColor = calculateKdpRoyalty({
    format: "paperback",
    trimId: "8.5x11",
    pageCount: 300,
    interior: "standard-color",
    paper: "white",
    listPrice: 24.99,
  });
  assert.equal(largeColor.values?.printingCostCents, 1306);
  assert.equal(largeColor.values?.royaltyRate, 60);
});

test("FF-012 calculates ebook delivery and falls back from an ineligible 70 percent price", () => {
  const valid = calculateKdpRoyalty({
    format: "ebook",
    ebookFileSizeMB: 5,
    ebookRoyaltyOption: 70,
    listPrice: 9.99,
    monthlyTarget: 100,
  });
  assert.equal(valid.status, "valid");
  assert.equal(valid.values?.deliveryCostCents, 75);
  assert.equal(valid.values?.effectiveRoyaltyRate, 70);
  assert.equal(valid.values?.royaltyCents, 647);

  const fallback = calculateKdpRoyalty({
    format: "ebook",
    ebookFileSizeMB: 5,
    ebookRoyaltyOption: 70,
    listPrice: 1.99,
  });
  assert.equal(fallback.status, "valid");
  assert.equal(fallback.values?.effectiveRoyaltyRate, 35);
  assert.equal(fallback.values?.royaltyCents, 70);
  assert.ok(fallback.issues.some((issue) => issue.code === "ebook-70-price-band"));
});

test("FF-014 keeps the black-ink fixed cost through 110 effective pages", () => {
  for (const pageCount of [109, 110]) {
    const result = calculateKdpRoyalty({
      format: "paperback",
      trimId: "6x9",
      pageCount,
      interior: "black-white",
      paper: "white",
      listPrice: 9.99,
    });
    assert.equal(result.values?.effectivePageCount, 110);
    assert.equal(result.values?.printingCostCents, 230);
  }

  const next = calculateKdpRoyalty({
    format: "paperback",
    trimId: "6x9",
    pageCount: 111,
    interior: "black-white",
    paper: "white",
    listPrice: 9.99,
  });
  assert.equal(next.values?.effectivePageCount, 112);
  assert.equal(next.values?.printingCostCents, 234);
});

test("FF-017 normalizes odd hardcover premium pages before cent arithmetic", () => {
  const result = calculateKdpRoyalty({
    format: "hardcover",
    trimId: "6x9",
    pageCount: 75,
    interior: "premium-color",
    paper: "white",
    listPrice: 24.99,
  });
  assert.equal(result.status, "valid");
  assert.equal(result.values?.effectivePageCount, 76);
  assert.equal(result.values?.printingCostCents, 1059);
});

test("FF-018 accepts raw 23 pages when the normalized count is valid and rejects 829", () => {
  const minimum = calculateKdpRoyalty({
    format: "paperback",
    trimId: "6x9",
    pageCount: 23,
    interior: "black-white",
    paper: "white",
    listPrice: 9.99,
  });
  assert.equal(minimum.status, "valid");
  assert.equal(minimum.values?.effectivePageCount, 24);

  const overMaximum = calculateKdpRoyalty({
    format: "paperback",
    trimId: "6x9",
    pageCount: 829,
    interior: "black-white",
    paper: "white",
    listPrice: 9.99,
  });
  assert.equal(overMaximum.status, "invalid");
  assert.equal(overMaximum.values, null);
  assert.equal(overMaximum.values?.effectivePageCount, undefined);
  assert.ok(overMaximum.issues.some((issue) => issue.code === "page-count-out-of-range"));
});

test("FF-015 distinguishes blank, zero, and unavailable monthly targets", () => {
  const base = {
    format: "ebook",
    ebookFileSizeMB: 5,
    ebookRoyaltyOption: 70,
    listPrice: 9.99,
  };
  assert.equal(calculateKdpRoyalty(base).values?.monthlyTargetStatus, "omitted");
  assert.equal(calculateKdpRoyalty({ ...base, monthlyTarget: 0 }).values?.copiesForMonthlyTarget, 0);
  assert.equal(calculateKdpRoyalty({ ...base, monthlyTarget: 0 }).values?.monthlyTargetStatus, "calculated");
});

test("FF-016 comparison prices stay unique and within the active format bounds", () => {
  const result = calculateKdpRoyalty({
    format: "ebook",
    ebookFileSizeMB: 5,
    ebookRoyaltyOption: 70,
    listPrice: 200,
  });
  const prices = result.values?.pricePoints.map((point) => point.listPriceCents) ?? [];
  assert.deepEqual(prices, [...new Set(prices)]);
  assert.ok(prices.every((price) => price >= 199 && price <= 20_000));
});

test("FF-013 computes copies to target and rejects impossible print configurations", () => {
  const target = calculateKdpRoyalty({
    format: "hardcover",
    trimId: "6x9",
    pageCount: 300,
    interior: "black-white",
    paper: "white",
    listPrice: 24.99,
    monthlyTarget: 500,
  });
  assert.equal(target.values?.printingCostCents, 925);
  assert.equal(target.values?.royaltyCents, 574);
  assert.equal(target.values?.copiesForMonthlyTarget, 88);

  const invalid = calculateKdpRoyalty({
    format: "hardcover",
    trimId: "5x8",
    pageCount: 300,
    interior: "black-white",
    paper: "white",
    listPrice: 20,
  });
  assert.equal(invalid.status, "invalid");
  assert.ok(invalid.issues.some((issue) => issue.code === "trim-not-supported"));
});
