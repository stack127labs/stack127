import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCatalog,
  flattenExposes,
  parseCompatibilityRecord,
} from "../../../scripts/zigbee-devices/lib/catalog.mjs";

const zhaAndZ2mRecord = `---
date_added: 2023-06-08
model: SNZB-02P
vendor: Sonoff
title: Temperature and Humidity Sensor
category: sensor
supports: temperature, humidity
zigbeemodel: ['SNZB-02P']
compatible: [z2m, zha]
---
`;

test("compatibility front matter keeps exact support evidence", () => {
  assert.deepEqual(parseCompatibilityRecord(zhaAndZ2mRecord, "Sonoff_SNZB-02P.md"), {
    category: "sensor",
    compatible: ["z2m", "zha"],
    dateAdded: "2023-06-08",
    fileName: "Sonoff_SNZB-02P.md",
    model: "SNZB-02P",
    supports: ["temperature", "humidity"],
    title: "Temperature and Humidity Sensor",
    vendor: "Sonoff",
    zigbeeModels: ["SNZB-02P"],
    zigbee2mqttModel: null,
  });
});

test("exposes flatten nested features without duplicate labels", () => {
  assert.deepEqual(
    flattenExposes([
      { name: "battery", type: "numeric" },
      {
        name: "climate",
        type: "climate",
        features: [{ name: "system_mode" }, { name: "occupied_heating_setpoint" }],
      },
      { name: "battery", type: "numeric" },
    ]),
    ["battery", "climate", "occupied_heating_setpoint", "system_mode"],
  );
});

test("catalog keeps the official marketed universe and adds unmatched community records", () => {
  const result = buildCatalog({
    blakadderCommit: "abc123",
    compatibilityRecords: [
      parseCompatibilityRecord(zhaAndZ2mRecord, "Sonoff_SNZB-02P.md"),
      parseCompatibilityRecord(
        zhaAndZ2mRecord.replaceAll("SNZB-02P", "ZHA-ONLY").replace("vendor: Sonoff", "vendor: Community"),
        "community-only.md",
      ),
      parseCompatibilityRecord(
        zhaAndZ2mRecord.replace("model: SNZB-02P", "model: COORD").replace("category: sensor", "category: coordinator"),
        "coordinator.md",
      ),
    ].filter(Boolean),
    definitions: [
      {
        description: "Temperature and humidity sensor",
        exposes: [{ name: "battery" }, { name: "temperature" }, { name: "humidity" }],
        model: "SNZB-02P",
        ota: true,
        vendor: "SONOFF",
        zigbeeModel: ["SNZB-02P"],
      },
      { description: "Other", exposes: [], model: "OTHER", vendor: "Other" },
    ],
    generatedAt: "2026-08-29T00:00:00.000Z",
    packageVersion: "26.100.0",
    z2mIoCommit: "def456",
  });

  assert.equal(result.devices.length, 3);
  const joined = result.devices.find((device) => device.model === "SNZB-02P");
  assert.deepEqual(joined.zigbee2mqtt_capabilities, ["battery", "humidity", "temperature"]);
  assert.equal(joined.image_path, "/zigbee-device-images/sonoff-snzb-02p.webp");
  assert.equal(
    joined.image_source_url,
    "https://github.com/Koenkk/zigbee2mqtt.io/blob/def456/public/images/devices/SNZB-02P.png",
  );
  assert.equal(joined.battery_reporting, true);
  assert.equal(joined.ota, true);
  assert.equal(result.devices.some((device) => device.model === "ZHA-ONLY"), true);
  assert.equal(result.meta.coverage.zigbee2mqtt_marketed_total, 2);
  assert.equal(result.meta.coverage.record_total, 3);
  assert.equal(result.meta.excluded.coordinators, 1);
});
