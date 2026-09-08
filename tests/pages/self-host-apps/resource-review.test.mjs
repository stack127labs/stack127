import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildResourceReviewQueue, validateResourceEstimate } from "../../../scripts/self-host-apps/lib/resource-review.mjs";

test("unknown resources produce review tasks, never invented numeric ranges", () => {
  const row = { slug: "example", ram_min_mb: null, ram_recommended_mb: null, ram_default_limit_mb: null, storage_min_gb: null,
    requires_database: true, database_types: ["postgres", "redis"], persistent_storage: true, install_docs_url: "https://example.org/install" };
  const queue = buildResourceReviewQueue([row]);
  assert.deepEqual(queue.map(item => item.resource_kind), ["ram", "storage"]);
  for (const item of queue) {
    assert.equal(item.status, "needs_review");
    assert.equal(item.estimate_min, undefined);
    assert.equal(item.estimate_max, undefined);
    assert.deepEqual(item.source_leads, ["https://example.org/install"]);
  }
});

const estimate = { slug: "example", resource_kind: "ram", unit: "mb", estimate_min: 512, estimate_max: 1024,
  estimate_kind: "estimated", confidence: "low", basis: "Observed range for the documented test workload",
  source_urls: ["https://example.org/benchmark"], review: { method: "measurement", workload: "One user and 1,000 small documents", explanation: "Measured idle and indexing memory on the same documented setup." } };

test("resource estimates need a reviewed method, workload, and explanation", () => {
  assert.doesNotThrow(() => validateResourceEstimate(estimate));
  assert.throws(() => validateResourceEstimate({ ...estimate, review: undefined }), /review/);
  assert.throws(() => validateResourceEstimate({ ...estimate, review: { ...estimate.review, workload: "" } }), /workload/);
  assert.throws(() => validateResourceEstimate({ ...estimate, basis: "deployment-shape-v1: database services" }), /generated/);
});

test("null, empty, and reversed numbers cannot become valid estimates", () => {
  for (const value of [null, "", false, undefined]) {
    assert.throws(() => validateResourceEstimate({ ...estimate, estimate_min: value }), /estimate_min/);
  }
  assert.throws(() => validateResourceEstimate({ ...estimate, estimate_max: 256 }), /estimate_max/);
});

test("the estimate writer uses the reviewed-evidence validator", () => {
  const writer = readFileSync("scripts/self-host-apps/apply-resource-estimates.mjs", "utf8");
  assert.match(writer, /validateResourceEstimate\(record\)/);
  assert.doesNotMatch(writer, /\|\| "editorial_review"/);
});
