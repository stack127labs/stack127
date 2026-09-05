import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCoordinatorRecord, findChipset, findConnection } from "../../../scripts/zigbee-coordinators/lib/catalog.mjs";

test("coordinator hardware parser recognizes current radio and connection choices", () => {
  assert.equal(findChipset("CC2652P7 based adapter"), "CC2652P7");
  assert.equal(findConnection("USB or Ethernet PoE coordinator"), "PoE + Ethernet + USB");
});

test("coordinator card puts software compatibility before source bookkeeping", () => {
  const record = buildCoordinatorRecord({ compatible: ["z2m", "zha"], dateAdded: "2025-01-02", model: "Adapter One", title: "Adapter One", vendor: "Example" }, {
    chipset: "CC2652P7",
    connection: "USB",
    imagePath: "/hardware-directory-images/zigbee-coordinators/example.webp",
    imageSourceUrl: "https://example.com/image.png",
    pinnedRecordUrl: "https://github.com/example/record.md",
    recordUrl: "https://example.com/record",
    slug: "example-adapter-one",
  });
  assert.deepEqual(record.card, {
    compatibility: { label: "Works with", status: "reported", value: "Zigbee2MQTT + ZHA" },
    facts: [
      { label: "Connection", value: "USB" },
      { label: "Radio", value: "CC2652P7" },
    ],
  });
});
