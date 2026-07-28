import { test } from "node:test";
import assert from "node:assert/strict";
import { STATUS_CODES, lookupStatus, eppSpellingFor, STATUS_GROUP_TITLES } from "../../../../lib/domain/status-codes.ts";

test("finds a code by either spelling", () => {
  assert.equal(lookupStatus("client transfer prohibited").epp, "clientTransferProhibited");
  assert.equal(lookupStatus("clientTransferProhibited").rdap, "client transfer prohibited");
  assert.equal(eppSpellingFor("redemption period"), "redemptionPeriod");
});

test("ok and active are the same code, not two", () => {
  assert.equal(lookupStatus("ok").rdap, "active");
  assert.equal(lookupStatus("active").epp, "ok");
});

test("an unknown code returns null so it can be shown as returned", () => {
  assert.equal(lookupStatus("registry invention"), null);
  assert.equal(eppSpellingFor("registry invention"), null);
});

test("the codes that remove a domain from DNS are marked", () => {
  assert.equal(lookupStatus("client hold").removesFromDns, true);
  assert.equal(lookupStatus("server hold").removesFromDns, true);
  assert.notEqual(lookupStatus("client transfer prohibited").removesFromDns, true);
});

test("every code explains itself and has a group title", () => {
  for (const code of STATUS_CODES) {
    assert.ok(code.meaning.length > 30, `${code.rdap} needs a real explanation`);
    assert.ok(STATUS_GROUP_TITLES[code.group], `${code.rdap} has no group title`);
    assert.equal(code.rdap, code.rdap.toLowerCase(), "RDAP values are lowercase");
  }
});

test("registrar locks and registry locks are separated", () => {
  assert.equal(lookupStatus("client delete prohibited").group, "registrar_lock");
  assert.equal(lookupStatus("server delete prohibited").group, "registry_lock");
});

test("no duplicate codes", () => {
  const seen = new Set();
  for (const code of STATUS_CODES) {
    assert.ok(!seen.has(code.rdap), `duplicate ${code.rdap}`);
    seen.add(code.rdap);
  }
});
