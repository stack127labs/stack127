import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { guardPartialCorrection, guardInstallCorrection, mergeReviewedInstallOptions } from "../../../scripts/self-host-apps/lib/reviewed-corrections.mjs";

test("partial corrections require prior values and reject concurrent changes", () => {
  const record = { slug: "example", review_scope: "partial", summary: "Stores documents for teams to search and share.", expected: { summary: "Old sentence." }, data_source_urls: ["https://example.org/docs"] };
  assert.doesNotThrow(() => guardPartialCorrection(record, { summary: "Old sentence." }));
  assert.throws(() => guardPartialCorrection(record, { summary: "Someone else's revision." }), /changed since review/);
  assert.throws(() => guardPartialCorrection({ ...record, expected: {} }, { summary: "Old sentence." }), /expected value/);
  assert.throws(() => guardPartialCorrection({ ...record, data_source_urls: [] }, { summary: "Old sentence." }), /source/);
});

test("partial corrections cannot advance whole-record verification dates", () => {
  for (const field of ["data_checked_at", "technical_facts_checked_at"]) {
    assert.throws(() => guardPartialCorrection({ review_scope: "partial", [field]: "2026-09-08", data_source_urls: ["https://example.org"] }, {}), /whole-record/);
  }
});

test("install corrections replace only explicitly reviewed methods", () => {
  const existing = [{ method: "unraid", url: "https://example.org/unraid" }, { method: "docker", url: "https://old.example.org" }];
  const reviewed = [{ method: "docker", url: "https://hub.docker.com/r/example/app" }];
  assert.deepEqual(mergeReviewedInstallOptions(existing, reviewed, ["docker"]), [existing[0], reviewed[0]]);
  assert.throws(() => mergeReviewedInstallOptions(existing, reviewed, ["compose"]), /unreviewed method/);
});

test("partial installation corrections reject stale or missing snapshots", () => {
  const options = [{ method: "docker", url: "https://example.org/image" }];
  const record = { slug: "example", review_scope: "partial", expected_install_options: options };
  assert.doesNotThrow(() => guardInstallCorrection(record, options));
  assert.throws(() => guardInstallCorrection(record, []), /changed since review/);
  assert.throws(() => guardInstallCorrection({ review_scope: "partial" }, options), /snapshot required/);
});

test("QA corrections lock records and append evidence without replacing it", () => {
  const code = readFileSync("scripts/self-host-apps/apply-qa-overrides.mjs", "utf8");
  assert.match(code, /for update/i);
  assert.match(code, /guardPartialCorrection\(record, currentRow\)/);
  assert.match(code, /column !== "data_source_urls"/);
  assert.match(code, /record\.review_scope === "partial"/);
});
