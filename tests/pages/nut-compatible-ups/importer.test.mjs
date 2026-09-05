import assert from "node:assert/strict";
import { test } from "node:test";
import { buildNutRecord, groupUpsRows, parseNutHcl } from "../../../scripts/nut-compatible-ups/lib/catalog.mjs";

const source = `
"Example"\t"ups"\t"3"\t"Power 1000"\t"USB"\t"usbhid-ups" # https://example.com/issue/1
"Example"\t"ups"\t"2"\t"Power 1000"\t"serial"\t"blazer_ser"
"Example"\t"pdu"\t"4"\t"Rack PDU"\t"network"\t"snmp-ups"`;

test("NUT parser preserves every source row and groups connection variants", () => {
  const rows = parseNutHcl(source);
  assert.equal(rows.length, 3);
  assert.equal(rows[0].sourceUrls[0], "https://example.com/issue/1");
  const groups = groupUpsRows(rows);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].rows.length, 2);
});

test("NUT card shows support, drivers, and connection choices", () => {
  const group = groupUpsRows(parseNutHcl(source))[0];
  const record = buildNutRecord(group, { commit: "a".repeat(40), slug: "example-power-1000" });
  assert.deepEqual(record.card, {
    compatibility: { label: "NUT support", status: "confirmed", value: "3 or 2/5 depending on connection" },
    facts: [
      { label: "Driver", value: "2 supported drivers" },
      { label: "Connection", value: "USB + serial" },
    ],
  });
  assert.equal(record.detail_sections.find((section) => section.heading === "Connection configurations").facts.length, 2);
});
