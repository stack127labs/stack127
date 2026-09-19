import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateKdpSetup,
} from "../../../lib/kdp/setup.ts";
import { getKdpPaperOptions } from "../../../lib/kdp/specs.ts";

const paperbackInput = (overrides = {}) => ({
  binding: "paperback",
  trimId: "6x9",
  pageCount: 300,
  interior: "black-white",
  paper: "white",
  bleed: true,
  direction: "ltr",
  units: "in",
  dpi: 300,
  ...overrides,
});

test("FF-001 calculates paperback bleed, margins, spine, cover, and pixels", () => {
  const result = calculateKdpSetup(paperbackInput());
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  assert.equal(result.values.page.widthInches, 6.125);
  assert.equal(result.values.page.heightInches, 9.25);
  assert.equal(result.values.margins.insideInches, 0.5);
  assert.equal(result.values.margins.outsideInches, 0.375);
  assert.equal(result.values.spine.widthInches, 0.6756);
  assert.equal(result.values.cover.widthInches, 12.9256);
  assert.equal(result.values.cover.heightInches, 9.25);
  assert.equal(result.values.effectivePageCount, 300);
  assert.equal(result.values.page.widthPixels, 1838);
  assert.equal(result.values.cover.heightPixels, 2775);
  assert.equal(result.values.eligibility, "eligible");
});

test("FF-002 uses trim dimensions without bleed and converts to millimeters", () => {
  const result = calculateKdpSetup(paperbackInput({
    trimId: "5x8",
    pageCount: 24,
    bleed: false,
    units: "mm",
    dpi: 72,
  }));
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  assert.equal(result.values.page.widthInches, 5);
  assert.equal(result.values.page.heightInches, 8);
  assert.equal(result.values.margins.insideInches, 0.375);
  assert.equal(result.values.margins.outsideInches, 0.25);
  assert.equal(result.values.page.widthMillimeters, 127);
  assert.equal(result.values.page.widthPixels, 360);
  assert.equal(result.values.cover.widthMillimeters, 261.72);
  assert.equal(result.values.cover.heightInches, 8.25);
});

test("FF-003 marks hardcover cover measurements as an estimate", () => {
  const result = calculateKdpSetup(paperbackInput({
    binding: "hardcover",
    trimId: "6x9",
    pageCount: 300,
    interior: "black-white",
    paper: "cream",
  }));
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  assert.equal(result.values.cover.isEstimate, true);
  assert.ok(result.issues.some((issue) => issue.code === "hardcover-cover-estimate"));
  assert.equal(result.values.eligibility, "eligible");
});

test("FF-004 rejects unsupported combinations and out-of-range page counts", () => {
  const invalidColor = calculateKdpSetup(paperbackInput({
    interior: "standard-color",
    paper: "cream",
  }));
  assert.equal(invalidColor.status, "invalid");
  assert.ok(invalidColor.issues.some((issue) => issue.code === "paper-not-supported"));

  const invalidPages = calculateKdpSetup(paperbackInput({ pageCount: 23 }));
  assert.equal(invalidPages.status, "valid");
  assert.ok(invalidPages.values);
  assert.equal(invalidPages.values.eligibility, "eligible");
  assert.ok(invalidPages.issues.some((issue) => issue.code === "page-count-too-low"));
});

test("FF-006 uses effective even pages for spine and keeps cover bleed independent of interior bleed", () => {
  const result = calculateKdpSetup(paperbackInput({ pageCount: 301, bleed: false }));
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  assert.equal(result.values.effectivePageCount, 302);
  assert.equal(result.values.spine.widthInches, 0.6801);
  assert.equal(result.values.cover.heightInches, 9.25);
  assert.ok(result.values.segments.some((segment) => segment.label === "Outer bleed"));
});

test("FF-007 uses KDP's current groundwood and color spine coefficients", () => {
  const groundwood = calculateKdpSetup(paperbackInput({
    pageCount: 300,
    paper: "groundwood",
  }));
  assert.equal(groundwood.values?.spine.widthInches, 0.705);

  const standardColor = calculateKdpSetup(paperbackInput({
    pageCount: 300,
    interior: "standard-color",
    paper: "white",
  }));
  assert.equal(standardColor.values?.spine.widthInches, 0.6756);

  const premiumColor = calculateKdpSetup(paperbackInput({
    pageCount: 300,
    interior: "premium-color",
    paper: "white",
  }));
  assert.equal(premiumColor.values?.spine.widthInches, 0.7041);
});

test("FF-005 exposes only papers supported by the selected binding and interior", () => {
  assert.deepEqual(getKdpPaperOptions("paperback", "black-white"), ["white", "cream", "groundwood"]);
  assert.deepEqual(getKdpPaperOptions("paperback", "standard-color"), ["white"]);
  assert.deepEqual(getKdpPaperOptions("hardcover", "premium-color"), ["white"]);
});
