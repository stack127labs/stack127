import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import test from "node:test";
import {
  HOME_ASSISTANT_CORE_VERSION,
  HOME_ASSISTANT_ENERGY_FORMULA_VERSION,
  HOME_ASSISTANT_FRONTEND_VERSION,
  evaluateEnergyEntity,
  parseHomeAssistantAttributes,
} from "../../../lib/home-assistant-energy/eligibility.ts";

function input(overrides = {}) {
  return {
    role: "grid_import",
    entityId: "sensor.grid_import",
    stateKind: "numeric",
    deviceClass: "energy",
    stateClass: "total",
    unit: "kWh",
    counterBehavior: "never_resets",
    ...overrides,
  };
}

function result(candidate) {
  const actual = evaluateEnergyEntity(candidate);
  assert.equal(actual.status, "valid", JSON.stringify(actual));
  return actual;
}

test("pins current rule provenance", () => {
  assert.equal(HOME_ASSISTANT_ENERGY_FORMULA_VERSION, 1);
  assert.equal(HOME_ASSISTANT_CORE_VERSION, "2026.8.1");
  assert.equal(HOME_ASSISTANT_FRONTEND_VERSION, "20260729.6");
});

test("matches all electricity and power fixtures", () => {
  const fixtures = [
    ["grid_import", "energy", "total", "kWh", "never_resets"],
    ["grid_export", "energy", "total_increasing", "Wh", "resets_to_zero"],
    ["solar", "energy", "total", "GJ", "never_resets"],
    ["battery_charge", "energy", "total", "MWh", "never_resets"],
    ["battery_discharge", "energy", "total", "mWh", "never_resets"],
    ["individual_device", "energy", "total", "J", "never_resets"],
    ["power", "power", "measurement", "W", "can_decrease"],
  ];
  for (const [role, deviceClass, stateClass, unit, counterBehavior] of fixtures) {
    const actual = result(input({ role, deviceClass, stateClass, unit, counterBehavior }));
    assert.equal(actual.energy.status, "attributes_match_instance_check_required", role);
    assert.equal(actual.statistics.status, "attributes_match_recorder_check_required", role);
    assert.equal(actual.rules.filter((rule) => rule.status === "fail").length, 0, role);
    assert.equal(actual.counter.status, role === "power" ? "not_applicable" : "pass", role);
  }
});

test("evaluates Energy roles and long-term statistics independently", () => {
  const statisticsOnly = result(input({
    role: "grid_import",
    deviceClass: "power",
    stateClass: "measurement",
    unit: "W",
  }));
  assert.equal(statisticsOnly.energy.status, "fails_attributes");
  assert.equal(statisticsOnly.statistics.status, "attributes_match_recorder_check_required");
  assert.deepEqual(
    statisticsOnly.rules.filter((entry) => entry.status === "fail").map((entry) => [entry.scope, entry.field]),
    [["energy", "device_class"], ["energy", "state_class"], ["energy", "unit"]],
  );
  assert.equal(
    statisticsOnly.rules.find((entry) => entry.scope === "statistics" && entry.field === "state_class")?.status,
    "pass",
  );

  const neither = result(input({
    role: "grid_import",
    stateClass: "not_a_state_class",
  }));
  assert.equal(neither.energy.status, "fails_attributes");
  assert.equal(neither.statistics.status, "fails_attributes");
  assert.equal(
    neither.rules.find((entry) => entry.scope === "statistics" && entry.field === "state_class")?.status,
    "fail",
  );

  // Core's statistics attribute set is a superset of every Energy role set.
  const energyMatch = result(input());
  assert.equal(energyMatch.energy.status, "attributes_match_instance_check_required");
  assert.equal(energyMatch.statistics.status, "attributes_match_recorder_check_required");
});

test("matches gas branches and the water branch without crossing them", () => {
  for (const candidate of [
    input({ role: "gas", deviceClass: "gas", unit: "m³" }),
    input({ role: "gas", deviceClass: "energy", unit: "GJ" }),
    input({ role: "water", deviceClass: "water", unit: "gal" }),
  ]) {
    assert.equal(result(candidate).energy.status, "attributes_match_instance_check_required");
  }
  const gasGallons = result(input({ role: "gas", deviceClass: "gas", unit: "gal" }));
  assert.equal(gasGallons.energy.status, "fails_attributes");
  assert.equal(gasGallons.statistics.status, "attributes_match_recorder_check_required");
  assert.equal(gasGallons.rules.find((rule) => rule.field === "unit")?.status, "fail");
  const waterEnergy = result(input({ role: "water", deviceClass: "energy", unit: "kWh" }));
  assert.equal(waterEnergy.energy.status, "fails_attributes");
  assert.equal(waterEnergy.statistics.status, "attributes_match_recorder_check_required");
  assert.equal(waterEnergy.rules.find((rule) => rule.field === "device_class")?.status, "fail");
});

test("compares exact case and Unicode units", () => {
  for (const unit of ["KWh", "m3", "ft3", "kWh\u200b"]) {
    const actual = result(input({ role: unit.includes("3") ? "water" : "grid_import", deviceClass: unit.includes("3") ? "water" : "energy", unit }));
    assert.equal(actual.energy.status, "fails_attributes", unit);
    assert.equal(actual.statistics.status, "attributes_match_recorder_check_required", unit);
  }
  assert.equal(result(input({ unit: "  kWh  " })).energy.status, "attributes_match_instance_check_required");
  assert.equal(result(input({ role: "water", deviceClass: "water", unit: "ft³" })).energy.status, "attributes_match_instance_check_required");
});

test("separates counter suitability from attribute compatibility", () => {
  const decreasing = result(input({ stateClass: "total_increasing", counterBehavior: "can_decrease" }));
  assert.equal(decreasing.energy.status, "attributes_match_instance_check_required");
  assert.equal(decreasing.statistics.status, "attributes_match_recorder_check_required");
  assert.equal(decreasing.counter.status, "fail");
  assert.equal(decreasing.counter.correction, null);
  const unknown = result(input({ stateClass: "total_increasing", counterBehavior: "unknown" }));
  assert.equal(unknown.counter.status, "unknown");
  assert.equal(unknown.counter.correction, null);
  assert.equal(result(input({ stateClass: "total", counterBehavior: "can_decrease" })).counter.status, "pass");
  assert.equal(result(input({ role: "power", deviceClass: "power", stateClass: "measurement", unit: "W", counterBehavior: "can_decrease" })).counter.status, "not_applicable");
});

test("fails domain and current state before role fields in stable order", () => {
  const actual = result(input({ entityId: "input_number.grid", stateKind: "unavailable", deviceClass: "power", stateClass: "measurement", unit: "W" }));
  assert.equal(actual.energy.status, "fails_attributes");
  assert.equal(actual.statistics.status, "fails_attributes");
  assert.deepEqual(actual.rules.map((rule) => [rule.scope, rule.field]), [
    ["both", "domain"],
    ["both", "state"],
    ["energy", "device_class"],
    ["energy", "state_class"],
    ["energy", "unit"],
    ["statistics", "state_class"],
  ]);
  assert.deepEqual(actual.rules.filter((rule) => rule.status === "fail").map((rule) => [rule.scope, rule.field]), [
    ["both", "domain"],
    ["both", "state"],
    ["energy", "device_class"],
    ["energy", "state_class"],
    ["energy", "unit"],
  ]);
});

test("parses supported state attributes without evaluating untrusted input", () => {
  const yaml = parseHomeAssistantAttributes(`entity_id: sensor.meter\nstate: "12.5"\ndevice_class: energy\nstate_class: total\nunit_of_measurement: kWh\nlast_reset: null\nfriendly_name: Ignore me`);
  assert.deepEqual(yaml, {
    status: "valid",
    values: { entityId: "sensor.meter", stateKind: "numeric", deviceClass: "energy", stateClass: "total", unit: "kWh", lastReset: "null" },
  });
  const json = parseHomeAssistantAttributes('{"entity_id":"sensor.gas","state":"unknown","device_class":"gas","state_class":"total","unit_of_measurement":"m³"}');
  assert.equal(json.status, "valid");
  assert.equal(json.values.stateKind, "unknown");
  for (const pasted of [
    "device_class: energy\ndevice_class: power",
    '{"device_class":{"nested":true}}',
    '{"__proto__":{"polluted":true}}',
    '{"constructor":"bad"}',
    "[1,2,3]",
    'device_class: "unterminated',
    "x".repeat(20_001),
  ]) assert.equal(parseHomeAssistantAttributes(pasted).status, "invalid", pasted.slice(0, 40));
  assert.equal({}.polluted, undefined);
});

test("rejects malformed enums, objects, lengths, and extra keys", () => {
  const invalid = [
    null,
    [],
    input({ role: "electricity" }),
    input({ stateKind: "yes" }),
    input({ counterBehavior: "sometimes" }),
    input({ entityId: "x".repeat(256) }),
    input({ deviceClass: "x".repeat(65) }),
    input({ stateClass: "x".repeat(65) }),
    input({ unit: "x".repeat(33) }),
    { ...input(), extra: "hostile" },
  ];
  for (const candidate of invalid) {
    const actual = evaluateEnergyEntity(candidate);
    assert.equal(actual.status, "invalid");
    assert.equal("energy" in actual, false);
  }
});

test("is deterministic, does not mutate inputs, and stays within budget", () => {
  const candidate = Object.freeze(input());
  const first = evaluateEnergyEntity(candidate);
  const started = performance.now();
  for (let index = 0; index < 1_000; index += 1) assert.deepEqual(evaluateEnergyEntity(candidate), first);
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 10_000, `1,000 evaluations took ${elapsed.toFixed(2)}ms`);
  assert.deepEqual(candidate, input());
});
