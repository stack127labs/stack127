import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { counterTone, energyAnswer, statisticsAnswer, visibleReceived } from "../../../app/(site)/(tools)/home-assistant-energy-entity-checker/home-assistant-energy-view.ts";

const source = readFileSync(path.join(process.cwd(), "app/(site)/(tools)/home-assistant-energy-entity-checker/home-assistant-energy-entity-checker.tsx"), "utf8");

function result(energy = "attributes_match_instance_check_required", statistics = "attributes_match_recorder_check_required") {
  return { input: { role: "grid_import" }, energy: { status: energy }, statistics: { status: statistics } };
}

test("Energy and statistics answers remain independent", () => {
  assert.equal(energyAnswer(result("fails_attributes")), "Attributes do not match Grid import.");
  assert.equal(statisticsAnswer(result("fails_attributes", "attributes_match_recorder_check_required")), "Statistics attributes match.");
});

test("counter suitability never changes the lead answer", () => {
  assert.equal(counterTone({ status: "pass" }), "success");
  assert.equal(counterTone({ status: "fail" }), "danger");
  assert.equal(counterTone({ status: "unknown" }), "warning");
});

test("long received evidence is bounded without changing its full accessible value", () => {
  const value = "x".repeat(121);
  assert.equal(Array.from(visibleReceived(value)).length, 120);
  assert.match(visibleReceived(value), /…$/);
});

test("interface uses shared controls and omits repeated result cards", () => {
  for (const component of ["ToolChoiceGroup", "ToolDisclosure", "ToolTextArea", "ToolTextField", "ToolSelect", "ToolActionRow", "ToolButton", "ToolResultLead", "ToolStatus"]) assert.match(source, new RegExp(component));
  assert.match(source, /<ToolResultLead inputRef=\{resultRef\}>/);
  assert.doesNotMatch(source, /primaryButton|secondaryButton|<select|instanceChecks|Energy picker|Long-term statistics<\/h3>/);
});
