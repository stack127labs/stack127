import assert from "node:assert/strict";
import test from "node:test";
import { estimateKdpPageCount } from "../../../lib/kdp/page-count.ts";

test("FF-014 returns an even likely range and separates non-body pages", () => {
  const result = estimateKdpPageCount({
    words: 50000,
    trimId: "6x9",
    font: "serif",
    fontSize: 11,
    lineSpacing: 1.15,
    insideMargin: 0.5,
    outsideMargin: 0.375,
    topBottomMargin: 0.75,
    chapterCount: 20,
    imagePages: 4,
    frontMatterPages: 6,
    backMatterPages: 4,
  });
  assert.equal(result.status, "valid");
  assert.ok(result.values);
  assert.equal(result.values.totalPages.min % 2, 0);
  assert.equal(result.values.totalPages.max % 2, 0);
  assert.ok(result.values.totalPages.min < result.values.totalPages.max);
  assert.equal(result.values.addedPages.image, 4);
  assert.equal(result.values.addedPages.frontMatter, 6);
  assert.equal(result.values.addedPages.backMatter, 4);
  assert.equal(result.values.addedPages.chapterStarts, 20);
  assert.deepEqual(result.values.rawPages, { min: 108, max: 146 });
  assert.equal(result.values.rangeMidpoint, 127);
  assert.deepEqual(result.values.textBlockInches, { width: 5.125, height: 7.5 });
  assert.equal(result.values.calculationVersion, "kdp-page-count-1");
  assert.equal(result.values.inputVersion, "kdp-page-count-input-1");
  assert.ok(result.values.gutterBands.length > 0);
});

test("FF-017 returns KDP floor and gutter guidance without clamping the estimate", () => {
  const result = estimateKdpPageCount({
    words: 100,
    trimId: "6x9",
    font: "serif",
    fontSize: 11,
    lineSpacing: 1.15,
    insideMargin: 0.1,
    outsideMargin: 0.375,
    topBottomMargin: 0.75,
    chapterCount: 0,
    imagePages: 0,
    frontMatterPages: 0,
    backMatterPages: 0,
  });
  assert.equal(result.status, "valid");
  assert.ok(result.issues.some((issue) => issue.code === "below-kdp-minimum"));
  assert.ok(result.issues.some((issue) => issue.code === "inside-margin-below-guidance"));
  assert.ok((result.values?.totalPages.min ?? 24) < 24);
});

test("FF-015 makes a zero-word outline transparent instead of inventing body pages", () => {
  const result = estimateKdpPageCount({
    words: 0,
    trimId: "5x8",
    font: "sans",
    fontSize: 12,
    lineSpacing: 1.3,
    insideMargin: 0.375,
    outsideMargin: 0.25,
    topBottomMargin: 0.75,
    chapterCount: 0,
    imagePages: 2,
    frontMatterPages: 4,
    backMatterPages: 2,
  });
  assert.equal(result.status, "valid");
  assert.deepEqual(result.values?.textPages, { min: 0, max: 0 });
  assert.deepEqual(result.values?.totalPages, { min: 8, max: 8 });
});

test("FF-016 rejects impossible typography and negative page additions", () => {
  const result = estimateKdpPageCount({
    words: 1000,
    trimId: "6x9",
    font: "serif",
    fontSize: 7,
    lineSpacing: 1.15,
    insideMargin: 0.5,
    outsideMargin: 0.375,
    topBottomMargin: 0.75,
    chapterCount: -1,
    imagePages: 0,
    frontMatterPages: 0,
    backMatterPages: 0,
  });
  assert.equal(result.status, "invalid");
  assert.ok(result.issues.some((issue) => issue.field === "fontSize"));
  assert.ok(result.issues.some((issue) => issue.field === "chapterCount"));
});
