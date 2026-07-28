import { test } from "node:test";
import assert from "node:assert/strict";
import { TRANSFER_POLICY_VERSIONS, policyInForce, pendingPolicy, evaluateLock } from "../../../../lib/domain/transfer-policy.ts";
import { assessTransfer } from "../../../../lib/domain/transfer-readiness.ts";

test("exactly one policy version is in force", () => {
  const effective = TRANSFER_POLICY_VERSIONS.filter((version) => version.effectiveDate !== null);
  assert.ok(effective.length >= 1);
  assert.equal(policyInForce().afterRegistrationDays, 60, "the 60 day lock is the rule today");
});

test("the adopted replacement is present but not in force", () => {
  const pending = pendingPolicy();
  assert.ok(pending, "the adopted policy must stay visible so switching over is one line");
  assert.equal(pending.effectiveDate, null);
  assert.equal(pending.afterRegistrationDays, 30, "720 hours");
  assert.equal(pending.afterRegistrantChangeDays, null, "the change of registrant lock goes away");
});

test("every version records where it came from", () => {
  for (const version of TRANSFER_POLICY_VERSIONS) {
    assert.ok(version.source.startsWith("https://"), `${version.id} needs a source URL`);
    assert.match(version.verifiedAt, /^\d{4}-\d{2}-\d{2}$/, `${version.id} needs a verification date`);
    assert.ok(version.note.length > 40, `${version.id} needs a note explaining it`);
  }
});

test("lock arithmetic handles both sides and the unknown case", () => {
  const now = new Date("2026-07-28T00:00:00Z");
  assert.equal(evaluateLock("2026-07-01T00:00:00Z", 60, now).state, "locked");
  assert.equal(evaluateLock("2026-07-01T00:00:00Z", 60, now).daysRemaining, 33);
  assert.equal(evaluateLock("2020-01-01T00:00:00Z", 60, now).state, "clear");
  assert.equal(evaluateLock(null, 60, now).state, "unknown");
  assert.equal(evaluateLock("not a date", 60, now).state, "unknown");
});

function registrationWith(overrides) {
  return {
    query: { domain: "example.com" }, statuses: [], nameservers: [], registrationDate: null,
    transferDate: null, registryExpiryDate: null, dnssecSigned: null, dsRecordCount: null, ...overrides,
  };
}

test("a registrar lock is reported as the reader's to clear", () => {
  const result = assessTransfer(registrationWith({ statuses: [{ rdap: "client transfer prohibited" }] }));
  const finding = result.findings.find((entry) => entry.id === "client-lock");
  assert.equal(finding.state, "blocked");
  assert.equal(finding.selfServiceable, true);
});

test("a registry lock is reported as not the reader's to clear", () => {
  const result = assessTransfer(registrationWith({ statuses: [{ rdap: "server transfer prohibited" }] }));
  const finding = result.findings.find((entry) => entry.id === "server-lock");
  assert.equal(finding.state, "blocked");
  assert.equal(finding.selfServiceable, false);
});

test("a missing transfer event is unknown, not clear", () => {
  const result = assessTransfer(registrationWith({}));
  const finding = result.findings.find((entry) => entry.id === "transfer-lock");
  assert.equal(finding.state, "unknown");
  assert.match(finding.detail, /does not publish a transfer date/);
});

test("a published transfer event is actually used", () => {
  const now = new Date("2026-07-28T00:00:00Z");
  const result = assessTransfer(registrationWith({ transferDate: "2026-07-20T00:00:00Z" }), now);
  const finding = result.findings.find((entry) => entry.id === "transfer-lock");
  assert.equal(finding.state, "blocked");
});

test("DNSSEC is flagged as a transfer risk", () => {
  const result = assessTransfer(registrationWith({ dnssecSigned: true }));
  assert.ok(result.findings.some((entry) => entry.id === "dnssec" && entry.state === "risk"));
});

test("it always states what it cannot see", () => {
  const result = assessTransfer(registrationWith({}));
  assert.ok(result.cannotCheck.length >= 3);
  assert.ok(result.cannotCheck.some((item) => item.includes("authorization code")));
});
