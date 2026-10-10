import assert from "node:assert/strict";
import test from "node:test";
import "../../helpers/register-repo-imports.mjs";
import { paginationPages } from "../../../lib/pagination.ts";
const {
  filterDevices,
  getPage,
  sortDevices,
} = await import("../../../app/(site)/(directories)/zigbee-devices/filters.ts");

function device(overrides = {}) {
  return {
    slug: "sonoff-snzb-02p",
    vendor: "SONOFF",
    name: "Temperature and humidity sensor",
    model: "SNZB-02P",
    category: "sensor",
    zigbee_models: ["SNZB-02P"],
    fingerprints: [],
    zigbee2mqtt_capabilities: ["battery", "temperature", "humidity"],
    zha_reported_capabilities: ["temperature", "humidity"],
    ota: true,
    battery_reporting: true,
    date_added: "2023-06-08",
    zigbee2mqtt_url: "https://www.zigbee2mqtt.io/devices/SNZB-02P.html",
    blakadder_url: "https://zigbee.blakadder.com/Sonoff_SNZB-02P.html",
    ...overrides,
  };
}

const devices = [
  device(),
  device({
    slug: "ikea-e2201",
    vendor: "IKEA",
    name: "RODRET wireless dimmer",
    model: "E2201",
    category: "remote",
    zigbee_models: ["RODRET Dimmer"],
    zigbee2mqtt_capabilities: ["action", "battery"],
    zha_reported_capabilities: ["action"],
    ota: false,
  }),
  device({
    slug: "innr-sp-240",
    vendor: "Innr",
    name: "Smart plug",
    model: "SP 240",
    category: "plug",
    zigbee_models: ["SP 240"],
    zigbee2mqtt_capabilities: ["energy", "power", "switch"],
    zha_reported_capabilities: ["on/off", "power metering"],
    ota: false,
    battery_reporting: false,
  }),
];

test("search covers vendor, retail model, Zigbee identifiers, and capabilities", () => {
  assert.deepEqual(filterDevices(devices, { q: "SNZB-02P" }).map((d) => d.slug), ["sonoff-snzb-02p"]);
  assert.deepEqual(filterDevices(devices, { q: "RODRET" }).map((d) => d.slug), ["ikea-e2201"]);
  assert.deepEqual(filterDevices(devices, { q: "energy" }).map((d) => d.slug), ["innr-sp-240"]);
});

test("filters intersect category, vendor, capability, OTA, and battery evidence", () => {
  assert.deepEqual(filterDevices(devices, { category: ["sensor"] }).map((d) => d.slug), ["sonoff-snzb-02p"]);
  assert.deepEqual(filterDevices(devices, { vendor: ["IKEA"] }).map((d) => d.slug), ["ikea-e2201"]);
  assert.deepEqual(filterDevices(devices, { capability: ["battery"] }).map((d) => d.slug), ["sonoff-snzb-02p", "ikea-e2201"]);
  assert.deepEqual(filterDevices(devices, { ota: "yes" }).map((d) => d.slug), ["sonoff-snzb-02p"]);
  assert.deepEqual(filterDevices(devices, { battery: "yes", category: ["remote"] }).map((d) => d.slug), ["ikea-e2201"]);
});

test("sort and pagination helpers stay deterministic", () => {
  assert.deepEqual(sortDevices(devices, "vendor").map((d) => d.slug), ["ikea-e2201", "innr-sp-240", "sonoff-snzb-02p"]);
  assert.deepEqual(sortDevices(devices, "capabilities").map((d) => d.slug), ["innr-sp-240", "sonoff-snzb-02p", "ikea-e2201"]);
  assert.equal(getPage({ page: "bad" }), 1);
  assert.equal(getPage({ page: "3" }), 3);
  assert.deepEqual(paginationPages(5, 10), [1, null, 4, 5, 6, null, 10]);
});

test("capability filter and feature sort include Blakadder-only records", () => {
  const blakadderOnly = device({
    slug: "acme-th1",
    vendor: "Acme",
    name: "Climate sensor",
    model: "TH1",
    zigbee2mqtt_capabilities: [],
    zha_reported_capabilities: ["Temperature", "humidity", "batterypct", "occupancy"],
    zigbee2mqtt_url: "",
  });
  const withBlakadder = [...devices, blakadderOnly];
  assert.deepEqual(filterDevices(withBlakadder, { capability: ["temperature"] }).map((d) => d.slug), ["sonoff-snzb-02p", "acme-th1"]);
  assert.deepEqual(filterDevices(withBlakadder, { capability: ["occupancy"] }).map((d) => d.slug), ["acme-th1"]);
  assert.deepEqual(filterDevices(withBlakadder, { capability: ["power"] }).map((d) => d.slug), ["innr-sp-240"]);
  assert.equal(sortDevices(withBlakadder, "capabilities")[0].slug, "acme-th1");
});

test("a tilt sensor doesn't count as a cover, but a tilt-only blind motor does", () => {
  const sensor = device({ slug: "nyce-tilt", vendor: "Nyce", model: "NCZ-3014-HA", category: "sensor",
    zigbee2mqtt_capabilities: [], zha_reported_capabilities: ["tilt"], zigbee2mqtt_url: "" });
  const motor = device({ slug: "current-am25", vendor: "Current Products Corp", model: "AM25", category: "cover",
    zigbee2mqtt_capabilities: [], zha_reported_capabilities: ["tilt"], zigbee2mqtt_url: "" });
  assert.deepEqual(filterDevices([sensor, motor], { capability: ["cover"] }).map((d) => d.slug), ["current-am25"]);
});
