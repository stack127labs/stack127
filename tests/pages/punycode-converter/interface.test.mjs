import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { describeCharacters } from "../../../lib/domain/unicode.ts";
import {
  inspectInput,
  labelRows,
  scriptAssessment,
} from "../../../app/(site)/(tools)/punycode-converter/punycode-view.ts";

const source = readFileSync(path.join(process.cwd(), "app/(site)/(tools)/punycode-converter/punycode-tool.tsx"), "utf8");

test("absolute URLs preserve every non-host part while converting the hostname", () => {
  const parsed = inspectInput("https://user:pass@münchen.de:8443/a?q=one#part");
  assert.equal(parsed.kind, "url");
  assert.equal(parsed.hostname, "münchen.de");
  assert.equal(parsed.reconstruct("xn--mnchen-3ya.de"), "https://user:pass@xn--mnchen-3ya.de:8443/a?q=one#part");
});

test("input parser distinguishes field errors", () => {
  assert.throws(() => inspectInput("a@b.com"), /not an email address/);
  assert.throws(() => inspectInput("example.com/path"), /Include the scheme/);
  assert.throws(() => inspectInput("   "), /Enter a domain name or URL/);
});

test("script assessment does not turn absence of mixed scripts into a safety verdict", () => {
  assert.match(scriptAssessment([{ label: { unicode: "münchen" }, scripts: { mixed: false, scripts: ["Latin"] } }]), /does not clear/);
  assert.doesNotMatch(scriptAssessment([{ label: { unicode: "münchen" }, scripts: { mixed: false, scripts: ["Latin"] } }]), /safe/i);
  assert.equal(
    scriptAssessment([{ label: { unicode: "pаypal" }, scripts: { mixed: true, scripts: ["Cyrillic", "Latin"] } }]),
    "The label pаypal mixes Cyrillic and Latin. Inspect its characters. This does not prove spoofing.",
  );
});

test("label rows use exact DNS limits without arbitrary near-limit warnings", () => {
  const rows = labelRows([{ label: { ascii: "a".repeat(63), converted: false, unicode: "a".repeat(63) }, octets: 63, scripts: { scripts: ["Latin"] } }]);
  assert.equal(rows[0].length, "63 of 63 bytes");
  assert.equal(rows[0].overLimit, false);
});

test("character evidence uses formal Unicode names rather than repeating the script", () => {
  const detail = describeCharacters("а")[0];
  assert.equal(detail.script, "Cyrillic");
  assert.equal(detail.name, "CYRILLIC SMALL LETTER A");
});

test("interface uses shared controls and omits pills and duplicate prose", () => {
  for (const component of ["ToolTextField", "ToolButton", "ToolCopyAction", "ToolResultLead", "ToolDataTable", "ToolStatus"]) assert.match(source, new RegExp(component));
  assert.doesNotMatch(source, /StatePill|domain-answer|Converted, single script|Plain ASCII|Every character that is not plain ASCII/);
});
