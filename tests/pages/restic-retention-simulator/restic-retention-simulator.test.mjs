import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_RESTIC_INPUT,
  formatResticResult,
  simulateResticRetention,
} from "../../../lib/restic-retention-simulator/engine.ts";

function input(overrides = {}) {
  return {
    ...DEFAULT_RESTIC_INPUT,
    ...overrides,
    policy: { ...DEFAULT_RESTIC_INPUT.policy, ...(overrides.policy ?? {}) },
  };
}

test("RF-001 keeps the newest snapshot for keep-last", () => {
  const result = simulateResticRetention(input({
    snapshots: [
      { id: "old", time: "2026-01-01T00:00:00Z", host: "nas" },
      { id: "new", time: "2026-01-02T00:00:00Z", host: "nas" },
      { id: "mid", time: "2026-01-01T12:00:00Z", host: "nas" },
    ],
    policy: { keepLast: 1, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.deepEqual(result.values.rows.map((row) => [row.id, row.state]), [
    ["new", "kept"], ["mid", "pruned"], ["old", "pruned"],
  ]);
  assert.match(formatResticResult(result), /keep-last/);
});

test("RF-002 applies keep-daily separately within host groups", () => {
  const result = simulateResticRetention(input({
    snapshots: [
      { id: "a1", time: "2026-01-01T08:00:00Z", host: "a" },
      { id: "a2", time: "2026-01-02T08:00:00Z", host: "a" },
      { id: "b1", time: "2026-01-01T08:00:00Z", host: "b" },
      { id: "b2", time: "2026-01-02T08:00:00Z", host: "b" },
    ],
    policy: { keepLast: 0, keepDaily: 1, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.deepEqual(result.values.rows.filter((row) => row.state === "kept").map((row) => row.id).sort(), ["a2", "b2"]);
});

test("RF-003 keeps both groups when timestamps are equal", () => {
  const result = simulateResticRetention(input({
    snapshots: [
      { id: "one", time: "2026-02-01T00:00:00Z", host: "one" },
      { id: "two", time: "2026-02-01T00:00:00Z", host: "two" },
    ],
    policy: { keepLast: 1, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.rows.filter((row) => row.state === "kept").length, 2);
});

test("rejects malformed JSON-shaped input, duplicate IDs, and empty policy", () => {
  for (const candidate of [
    null,
    input({ snapshots: [] }),
    input({ snapshots: [{ id: "x", time: "nope" }] }),
    input({ snapshots: [{ id: "x", time: "2026-01-01T00:00:00Z" }, { id: "x", time: "2026-01-02T00:00:00Z" }] }),
    input({ policy: { keepLast: 0, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 } }),
  ]) {
    assert.equal(simulateResticRetention(candidate).status, "invalid");
  }
});

test("bounds rule counts and labels missing host as one explicit group", () => {
  const result = simulateResticRetention(input({
    snapshots: [{ id: "x", time: "2026-03-01T00:00:00Z" }],
    policy: { keepLast: 1, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.rows[0].group, "(none)");
  assert.equal(simulateResticRetention(input({ policy: { keepLast: 366 } })).status, "invalid");
});

test("uses UTC with a visible warning for an unknown timezone", () => {
  const result = simulateResticRetention(input({ timezone: "Mars/Olympus" }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.timezone, "UTC");
  assert.match(result.values.timezoneWarning, /UTC used/);
});

test("uses native restic hostname fields for host grouping", () => {
  const result = simulateResticRetention(input({
    snapshots: [
      { id: "new", time: "2026-01-02T00:00:00Z", hostname: "alpha" },
      { id: "old", time: "2026-01-01T00:00:00Z", hostname: "beta" },
    ],
    policy: { keepLast: 1, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.groups, 2);
  assert.deepEqual(result.values.rows.map((row) => [row.id, row.group, row.state]), [
    ["new", "alpha", "kept"],
    ["old", "beta", "kept"],
  ]);
});

test("keeps the oldest snapshot when a calendar rule has too few populated periods", () => {
  const result = simulateResticRetention(input({
    snapshots: [
      { id: "new", time: "2026-01-01T12:00:00Z", hostname: "nas" },
      { id: "old", time: "2026-01-01T08:00:00Z", hostname: "nas" },
    ],
    policy: { keepLast: 0, keepDaily: 2, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.deepEqual(result.values.rows.map((row) => [row.id, row.state]), [["new", "kept"], ["old", "kept"]]);
  assert.match(result.values.rows[1].reasons.join(" "), /oldest daily snapshot/);
});

test("applies the oldest fallback to weekly, monthly, and yearly rules", () => {
  for (const key of ["keepWeekly", "keepMonthly", "keepYearly"]) {
    const result = simulateResticRetention(input({
      snapshots: [
        { id: "new", time: "2026-01-02T12:00:00Z", hostname: "nas" },
        { id: "old", time: "2026-01-01T08:00:00Z", hostname: "nas" },
      ],
      policy: { keepLast: 0, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0, [key]: 2 },
    }));
    assert.equal(result.status, "valid");
    assert.equal(result.values.keptCount, 2, key);
  }
});

test("rejects invalid optional fields and IDs that collide after trimming", () => {
  for (const [field, value] of [["hostname", 42], ["host", 42]]) {
    const badHost = simulateResticRetention(input({
      snapshots: [{ id: "x", time: "2026-01-01T00:00:00Z", [field]: value }],
    }));
    assert.equal(badHost.status, "invalid");
    assert.match(badHost.issues.join(" "), new RegExp(`${field} must be text`));
  }

  const duplicate = simulateResticRetention(input({
    snapshots: [
      { id: "x", time: "2026-01-02T00:00:00Z" },
      { id: " x ", time: "2026-01-01T00:00:00Z" },
    ],
  }));
  assert.equal(duplicate.status, "invalid");
  assert.match(duplicate.issues.join(" "), /duplicated/);
});

test("keeps distinct path sets even when their display text could collide", () => {
  const result = simulateResticRetention(input({
    groupBy: "paths",
    snapshots: [
      { id: "a", time: "2026-01-02T00:00:00Z", paths: ["/a, /b"] },
      { id: "b", time: "2026-01-01T00:00:00Z", paths: ["/a", "/b"] },
    ],
    policy: { keepLast: 1, keepDaily: 0, keepWeekly: 0, keepMonthly: 0, keepYearly: 0 },
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.groups, 2);
  assert.equal(result.values.keptCount, 2);
  assert.notEqual(result.values.rows[0].group, result.values.rows[1].group);
});
