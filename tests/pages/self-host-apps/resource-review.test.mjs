import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildResourceReviewQueue, hasCompleteResourceEstimate, validateResourceEstimate } from "../../../scripts/self-host-apps/lib/resource-review.mjs";

test("every app is queued until both source-backed estimate ranges are complete", () => {
  const row = { slug: "example", ram_min_mb: 512, ram_recommended_mb: 1024, ram_default_limit_mb: 512, storage_min_gb: 10,
    requires_database: true, database_types: ["postgres", "redis"], persistent_storage: true, install_docs_url: "https://example.org/install" };
  const queue = buildResourceReviewQueue([row]);
  assert.deepEqual(queue.map(item => item.resource_kind), ["ram", "storage"]);
  for (const item of queue) {
    assert.equal(item.status, "needs_review");
    assert.equal(item.estimate_min, undefined);
    assert.equal(item.estimate_max, undefined);
    assert.deepEqual(item.source_leads, ["https://example.org/install"]);
  }

  const estimateFields = {
    ram_estimate_min_mb: 512,
    ram_estimate_max_mb: 1024,
    ram_estimate_kind: "estimated",
    ram_estimate_confidence: "medium",
    ram_estimate_basis: "Typical small installation from documented project components.",
    ram_source_urls: ["https://example.org/install"],
    storage_estimate_min_gb: 1,
    storage_estimate_max_gb: 10,
    storage_estimate_kind: "estimated",
    storage_estimate_confidence: "medium",
    storage_estimate_basis: "Typical small installation with modest retained data.",
    storage_source_urls: ["https://example.org/install"],
  };
  assert.equal(hasCompleteResourceEstimate(estimateFields, "ram"), true);
  assert.equal(hasCompleteResourceEstimate(estimateFields, "storage"), true);
  assert.deepEqual(buildResourceReviewQueue([{ ...row, ...estimateFields }]), []);
  assert.deepEqual(buildResourceReviewQueue([{ ...row, ...estimateFields, ram_estimate_basis: "" }]).map(item => item.resource_kind), ["ram"]);
});

const estimate = { slug: "example", resource_kind: "ram", unit: "mb", estimate_min: 512, estimate_max: 1024,
  estimate_kind: "estimated", confidence: "low", basis: "Observed range for the documented test workload",
  source_urls: ["https://example.org/benchmark"], review: { method: "measurement", workload: "One user and 1,000 small documents", explanation: "Measured idle and indexing memory on the same documented setup." } };

test("app-based estimates need a source and short basis; measured estimates keep the detailed review", () => {
  assert.doesNotThrow(() => validateResourceEstimate(estimate));
  assert.throws(() => validateResourceEstimate({ ...estimate, review: undefined }), /review/);
  assert.throws(() => validateResourceEstimate({ ...estimate, review: { ...estimate.review, workload: "" } }), /workload/);
  assert.throws(() => validateResourceEstimate({ ...estimate, basis: "deployment-shape-v1: database services" }), /generated/);
  const appEstimate = { ...estimate, review: { method: "app_estimate" }, note: undefined };
  assert.equal(validateResourceEstimate(appEstimate).note, null);
  assert.throws(() => validateResourceEstimate({ ...appEstimate, source_urls: [] }), /source URLs/);
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
