import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  multiTldSummary,
  resultDetail,
  sourceAndFreshness,
  stateLabel,
} from "../../../app/(site)/(tools)/multi-tld-availability/multi-tld-view.ts";

const source = readFileSync(path.join(process.cwd(), "app/(site)/(tools)/multi-tld-availability/multi-tld-tool.tsx"), "utf8");

function row(state, overrides = {}) {
  return {
    detail: "",
    domain: "stack127.com",
    expiryDate: null,
    fetchedAt: "2026-09-05T12:00:00.000Z",
    fromCache: false,
    registrar: null,
    sourceHost: "rdap.example.test",
    state,
    tld: "com",
    ...overrides,
  };
}

test("set summary counts only settled result states", () => {
  const summary = multiTldSummary([
    row("not_registered"),
    row("not_registered", { tld: "net" }),
    row("registered", { tld: "org" }),
    row("cannot_check", { tld: "co" }),
    row("check_failed", { tld: "ai" }),
  ]);
  assert.equal(summary.value, "2 of 5");
  assert.equal(summary.detail, "1 registered. 1 cannot be checked. 1 check failed.");
  assert.equal(multiTldSummary([row("registered"), row("registered", { tld: "net" })]).detail, "2 registered.");
});

test("rows use distinct concise states without claiming availability", () => {
  assert.equal(stateLabel("not_registered"), "No registration found");
  assert.equal(stateLabel("registered"), "Registered");
  assert.equal(stateLabel("cannot_check"), "Cannot check");
  assert.equal(stateLabel("check_failed"), "Check failed");
  assert.doesNotMatch(stateLabel("not_registered"), /available|free/i);
});

test("row detail is conditional and never repeats conclusive labels", () => {
  assert.equal(resultDetail(row("not_registered", { detail: "No registration in this registry." })), null);
  assert.equal(resultDetail(row("registered", { detail: "Already registered." })), null);
  assert.equal(resultDetail(row("cannot_check", { tld: "co" })), "No known RDAP service for .co");
  assert.equal(resultDetail(row("check_failed", { detail: "This registry did not answer in time." })), "This registry did not answer in time.");
});

test("source and freshness stay attached to each row", () => {
  assert.deepEqual(sourceAndFreshness(row("cannot_check", { sourceHost: null, fetchedAt: null })), {
    source: "No RDAP service",
    freshness: null,
  });
  const cached = sourceAndFreshness(row("not_registered", { fromCache: true }));
  assert.equal(cached.source, "rdap.example.test");
  assert.match(cached.freshness, /from cache/);
  assert.match(sourceAndFreshness(row("not_registered")).freshness, /live response/);
});

test("interface uses shared controls and omits the legacy result shell", () => {
  for (const component of ["ToolTextField", "ToolCheckbox", "ToolButton", "ToolStatus", "ToolPrimaryResult", "ToolResultLead", "ToolDataTable"]) {
    assert.match(source, new RegExp(component));
  }
  assert.doesNotMatch(source, /DomainForm|DownloadReportButton|StatePill|domain-answer|Premium pricing in particular|Checked .* at/);
});
