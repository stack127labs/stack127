import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_MQTT_INPUT,
  checkMqttDiscovery,
  formatMqttReport,
} from "../../../lib/mqtt-discovery-checker/engine.ts";

function input(overrides = {}) {
  return { ...DEFAULT_MQTT_INPUT, ...overrides };
}

test("RF-001 accepts a common sensor discovery payload", () => {
  const result = checkMqttDiscovery(input({
    topic: "homeassistant/sensor/lab/temperature/config",
    payload: JSON.stringify({ name: "Temperature", unique_id: "lab-temperature", state_topic: "lab/temperature/state" }),
  }));
  assert.equal(result.status, "valid");
  assert.equal(result.values.component, "sensor");
  assert.equal(result.values.errorCount, 0);
  assert.match(formatMqttReport(result), /Temperature/);
});

test("RF-002 returns a parse error for malformed JSON", () => {
  const result = checkMqttDiscovery(input({ payload: '{"name":"broken"' }));
  assert.equal(result.status, "invalid");
  assert.equal(result.values, null);
  assert.equal(result.issues[0].code, "json.parse");
});

test("RF-003 separates a partial device warning from structural errors", () => {
  const result = checkMqttDiscovery(input({
    topic: "homeassistant/sensor/temperature/config",
    payload: JSON.stringify({ name: "Temperature", state_topic: "lab/temperature", device: { name: "Lab" } }),
  }));
  assert.equal(result.status, "partial");
  assert.equal(result.values.errorCount, 0);
  assert.ok(result.values.warningCount > 0);
});

test("reports topic shape and unsupported component errors", () => {
  for (const candidate of [
    input({ topic: "", payload: "{}" }),
    input({ prefix: "", payload: "{}" }),
    input({ topic: "homeassistant/sensor/demo", payload: "{}" }),
    input({ topic: "homeassistant/custom/demo/config", payload: "{}" }),
    input({ topic: "homeassistant/sensor/demo/config", payload: "[]" }),
    input({ topic: "homeassistant/sensor/demo/config", payload: "" }),
    input({ topic: "homeassistant/sensor/demo/config", payload: "null" }),
  ]) assert.equal(checkMqttDiscovery(candidate).status, "invalid");
});

test("normalizes valid JSON without changing scalar types", () => {
  const result = checkMqttDiscovery(input({ payload: JSON.stringify({ name: "x", state_topic: "lab/x", enabled_by_default: false, qos: 1 }) }));
  assert.equal(result.status, "valid");
  assert.match(result.values.normalizedPayload, /"enabled_by_default": false/);
});

test("rejects a sensor discovery payload without its required state topic", () => {
  const result = checkMqttDiscovery(input({ payload: JSON.stringify({ name: "Temperature" }) }));
  assert.equal(result.status, "invalid");
  assert.match(result.issues.map((issue) => issue.message).join(" "), /state_topic/);
});

test("validates node and object IDs in discovery topics", () => {
  for (const topic of [
    "homeassistant/sensor/bad id/config",
    "homeassistant/sensor//demo/config",
    "homeassistant/sensor/node/bad.id/config",
  ]) {
    const result = checkMqttDiscovery(input({ topic }));
    assert.equal(result.status, "invalid");
    assert.match(result.issues.map((issue) => issue.code).join(" "), /topic\.id/);
  }
});

test("rejects an empty or multi-segment discovery prefix", () => {
  for (const prefix of ["", "home/assistant"]) {
    const result = checkMqttDiscovery(input({ prefix }));
    assert.equal(result.status, "invalid");
    assert.match(result.issues.map((issue) => issue.code).join(" "), /prefix\./);
  }
});

test("recognizes documented field abbreviations and scalar device identifiers", () => {
  const abbreviated = checkMqttDiscovery(input({
    payload: JSON.stringify({ name: "Temperature", uniq_id: "demo", stat_t: "lab/temp" }),
  }));
  assert.equal(abbreviated.status, "valid");

  const scalarIdentifier = checkMqttDiscovery(input({
    payload: JSON.stringify({
      name: "Temperature",
      unique_id: "demo",
      state_topic: "lab/temp",
      device: { name: "Lab", identifiers: "device-1" },
    }),
  }));
  assert.equal(scalarIdentifier.status, "valid");
});

test("rejects invalid common values and unsafe JSON integers", () => {
  const badQos = checkMqttDiscovery(input({
    payload: JSON.stringify({ name: "Temperature", state_topic: "lab/temp", qos: 99 }),
  }));
  assert.equal(badQos.status, "invalid");
  assert.match(badQos.issues.map((issue) => issue.path).join(" "), /qos/);

  const unsafe = checkMqttDiscovery(input({
    payload: '{"name":"Temperature","state_topic":"lab/temp","value":9007199254740993}',
  }));
  assert.equal(unsafe.status, "invalid");
  assert.match(unsafe.issues.map((issue) => issue.code).join(" "), /json\.number/);
});

test("marks recognized components outside the checked profile as partial", () => {
  const result = checkMqttDiscovery(input({
    topic: "homeassistant/camera/demo/config",
    payload: JSON.stringify({ name: "Camera", topic: "camera/image" }),
  }));
  assert.equal(result.status, "partial");
  assert.match(result.issues.map((issue) => issue.code).join(" "), /profile\.unchecked/);
});
