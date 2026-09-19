import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_LXC_INPUT,
  checkLxcIdmap,
  formatLxcReport,
} from "../../../lib/lxc-idmap-checker/engine.ts";

function input(overrides = {}) {
  return { ...DEFAULT_LXC_INPUT, ...overrides };
}

test("RF-001 maps a queried UID with exact offset arithmetic", () => {
  const result = checkLxcIdmap(input({
    uidMap: "u 0 100000 65536",
    gidMap: "g 0 100000 65536",
    queryType: "uid",
    queryId: "1000",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.query.hostId, "101000");
  assert.match(formatLxcReport(result), /101000/);
});

test("RF-002 accepts adjacent ranges and maps the next boundary", () => {
  const result = checkLxcIdmap(input({
    uidMap: "u 0 100000 100\nu 100 200000 100",
    gidMap: "g 0 100000 200",
    queryType: "uid",
    queryId: "100",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.query.hostId, "200000");
});

test("RF-003 reports grant coverage separately", () => {
  const result = checkLxcIdmap(input({
    uidMap: "u 0 100000 65536",
    gidMap: "g 0 100000 65536",
    grantOwner: "root",
    uidGrants: "root:100000:65536",
    gidGrants: "root:100000:65536",
    queryType: "uid",
    queryId: "1000",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.query.grantStatus, "covered");
});

test("rejects malformed lines, overlaps, and zero lengths", () => {
  for (const candidate of [
    input({ uidMap: "u 0 100000", gidMap: "g 0 100000 10" }),
    input({ uidMap: "u 0 100000 100\nu 50 200000 20", gidMap: "g 0 100000 10" }),
    input({ uidMap: "u 0 100000 0", gidMap: "g 0 100000 10" }),
  ]) assert.equal(checkLxcIdmap(candidate).status, "invalid");
});

test("returns an unmapped query and unknown grant status", () => {
  const result = checkLxcIdmap(input({ uidGrants: "", gidGrants: "", queryType: "gid", queryId: "999999" }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.query.hostId, null);
  assert.equal(result.values.query.grantStatus, "unknown");
});

test("rejects host-side overlaps as well as container-side overlaps", () => {
  const result = checkLxcIdmap(input({
    uidMap: "u 0 100000 10\nu 10 100005 10",
    gidMap: "g 0 200000 20",
  }));
  assert.equal(result.status, "invalid");
  assert.match(result.issues.map((issue) => issue.code).join(" "), /map\.host-overlap/);
});

test("requires one selected-owner grant to cover the complete matched range", () => {
  const incomplete = checkLxcIdmap(input({
    grantOwner: "root",
    uidGrants: "root:101000:1",
    gidGrants: "root:100000:65536",
  }));
  assert.equal(incomplete.status, "valid");
  assert.equal(incomplete.values.query.grantStatus, "missing");

  const wrongOwner = checkLxcIdmap(input({
    grantOwner: "root",
    uidGrants: "other-user:100000:65536",
    gidGrants: "root:100000:65536",
  }));
  assert.equal(wrongOwner.values.query.grantStatus, "missing");
});

test("uses UID and GID grant sources independently", () => {
  const result = checkLxcIdmap(input({
    grantOwner: "root",
    uidGrants: "root:100000:65536",
    gidGrants: "root:300000:65536",
    queryType: "gid",
    queryId: "1000",
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.query.hostId, "101000");
  assert.equal(result.values.query.grantStatus, "missing");
});

test("rejects reserved IDs and range endpoint overflow", () => {
  for (const candidate of [
    input({ uidMap: "u 0 4294967295 1" }),
    input({ uidMap: "u 4294967294 100000 2" }),
    input({ uidMap: "u 0 4294967294 2" }),
  ]) {
    const result = checkLxcIdmap(candidate);
    assert.equal(result.status, "invalid");
  }
});
