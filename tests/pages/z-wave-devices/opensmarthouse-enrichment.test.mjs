import assert from "node:assert/strict";
import { test } from "node:test";
import { matchOpenSmartHouseDevice, openSmartHouseCandidates, productImageDocument } from "../../../scripts/z-wave-devices/lib/opensmarthouse.mjs";

test("matches an OpenSmartHouse device by exact Z-Wave protocol identifiers", () => {
  const fields = new Map([
    ["Manufacturer ID", "0x010f"],
    ["Product Type ID", "0x0203"],
    ["Product ID", "0x1000"],
    ["Identifier", "FGS-223"],
  ]);
  const match = matchOpenSmartHouseDevice(fields, [
    { device_ref: "0203:1000,0203:2000", id: 416, label: "FGS223", manufacturer_ref: 271 },
  ]);
  assert.equal(match?.confidence, "exact-protocol-identifiers");
  assert.equal(match?.device.id, 416);
});

test("accepts only a unique exact model when protocol identifiers are unavailable", () => {
  const fields = new Map([["Identifier", "ZW189"], ["Brand", "Aeotec"]]);
  const match = matchOpenSmartHouseDevice(fields, [
    { description: "Range Extender 7", id: 1274, label: "ZW189", manufacturer_name: "Aeotec", uuid: "zw189" },
  ]);
  assert.equal(match?.confidence, "unique-exact-model");
  assert.equal(match?.device.id, 1274);
});

test("does not guess between duplicate model matches", () => {
  const fields = new Map([["Identifier", "ABC-1"]]);
  assert.equal(matchOpenSmartHouseDevice(fields, [
    { id: 1, label: "ABC-1" },
    { id: 2, uuid: "abc-1" },
  ]), null);
});

test("accepts one contained model token only when the vendor also matches", () => {
  const fields = new Map([["Identifier", "TH8320ZW1026"], ["Brand", "Honeywell"]]);
  const match = matchOpenSmartHouseDevice(fields, [
    { description: "Honeywell TH8320ZW thermostat", id: 12, manufacturer_name: "Honeywell" },
    { description: "Other thermostat", id: 13, manufacturer_name: "Other" },
  ]);
  assert.equal(match?.confidence, "unique-model-token-and-vendor");
  assert.equal(match?.device.id, 12);
});

test("accepts repeated protocol definitions only when they share one product identity", () => {
  const fields = new Map([["Manufacturer ID", "0x010f"], ["Product Type ID", "0x0203"], ["Product ID", "0x1000"]]);
  const match = matchOpenSmartHouseDevice(fields, [
    { device_ref: "0203:1000", id: 1, label: "FGS223 v1", manufacturer_ref: 271, uuid: "fgs223" },
    { device_ref: "0203:1000", id: 2, label: "FGS223 v2", manufacturer_ref: 271, uuid: "fgs223" },
  ]);
  assert.equal(match?.confidence, "exact-protocol-identifiers-shared-product");
});

test("selects a clearly labeled image attachment", () => {
  assert.deepEqual(productImageDocument([
    { file: "manual.pdf", label: "Manual" },
    { file: "front.jpg", label: "Product Image" },
  ]), { file: "front.jpg", label: "Product Image" });
});

test("shortlists devices from the same Z-Wave manufacturer before detail fetches", () => {
  const fields = new Map([["Manufacturer ID", "0x010f"], ["Identifier", "FGS-223"]]);
  const candidates = openSmartHouseCandidates(fields, [
    { id: 416, label: "FGS223", manufacturer_ref: 271 },
    { id: 999, label: "Other", manufacturer_ref: 1 },
  ]);
  assert.deepEqual(candidates.map((device) => device.id), [416]);
});
