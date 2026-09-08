import test from "node:test";
import assert from "node:assert/strict";
import { guardCorrection } from "../../../scripts/cli-apps/lib/reviewed-corrections.mjs";

const correction = {
  slug: "example", reviewed_at: "2026-09-08",
  fields: { summary: "Searches files by name and previews their contents." },
  expected: { summary: "Old description." },
  sources: { summary: "https://example.org/docs" },
};

test("unsupported install methods can be removed without inventing replacements", () => {
  const record = { ...correction, fields: { install_methods: ["source"] }, expected: { install_methods: ["brew", "apt", "source"] }, sources: { install_methods: "https://example.org/install" } };
  assert.doesNotThrow(() => guardCorrection(record, record.expected));
  for (const value of [null, "source", ["source", "source"], ["invented"]]) {
    assert.throws(() => guardCorrection({ ...record, fields: { install_methods: value } }, record.expected), /install_methods/);
  }
});

test("CLI corrections require evidence and a matching prior value for each field", () => {
  assert.doesNotThrow(() => guardCorrection(correction, correction.expected));
  assert.throws(() => guardCorrection(correction, { summary: "Newer review." }), /changed since review/);
  assert.throws(() => guardCorrection({ ...correction, expected: {} }, {}), /expected value/);
  assert.throws(() => guardCorrection({ ...correction, sources: {} }, correction.expected), /source URL/);
});

test("partial corrections cannot publish records or change verification dates", () => {
  for (const field of ["last_verified_at", "published", "updated_at", "slug"]) {
    assert.throws(() => guardCorrection({ ...correction, fields: { [field]: "value" } }, {}), /not allowed/);
  }
});

test("CLI corrections reject malformed summaries and invalid review dates", () => {
  assert.throws(() => guardCorrection({ ...correction, fields: { summary: "Searches files and." } }, correction.expected), /unfinished/);
  assert.throws(() => guardCorrection({ ...correction, fields: { summary: "Searches [br] files by name." } }, correction.expected), /markup/);
  assert.throws(() => guardCorrection({ ...correction, reviewed_at: "yesterday" }, correction.expected), /review date/);
});

test("review dates reject calendar rollover and preserve valid leap days", () => {
  for (const reviewed_at of ["2026-02-29", "2026-02-31", "2026-04-31", "2026-13-01", "2026-00-10"]) {
    assert.throws(() => guardCorrection({ ...correction, reviewed_at }, correction.expected), /review date/);
  }
  assert.doesNotThrow(() => guardCorrection({ ...correction, reviewed_at: "2024-02-29" }, correction.expected));
});
