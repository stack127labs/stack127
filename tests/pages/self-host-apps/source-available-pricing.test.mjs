import assert from "node:assert/strict";
import { test } from "node:test";
import {
  freemiumSlugs,
  paidSlugs,
  pricingModelFor,
  reviewedSlugs,
} from "../../../scripts/self-host-apps/backfill-source-available-pricing.mjs";

test("source-available pricing review is complete and unambiguous", () => {
  assert.equal(reviewedSlugs.length, 98);
  assert.equal(new Set(reviewedSlugs).size, reviewedSlugs.length);

  for (const slug of freemiumSlugs) assert.ok(reviewedSlugs.includes(slug), `${slug} is reviewed`);
  for (const slug of paidSlugs) assert.ok(reviewedSlugs.includes(slug), `${slug} is reviewed`);
  for (const slug of reviewedSlugs) {
    assert.ok(["free", "freemium", "paid"].includes(pricingModelFor(slug)), `${slug} has a usable pricing model`);
  }
});

test("paid and freemium decisions do not overlap", () => {
  assert.deepEqual([...paidSlugs].filter((slug) => freemiumSlugs.has(slug)), []);
});
