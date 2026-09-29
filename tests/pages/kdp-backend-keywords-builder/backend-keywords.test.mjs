import test from "node:test";
import assert from "node:assert/strict";
import { buildKdpBackendKeywords } from "../../../lib/kdp/backend-keywords.ts";

function input(overrides = {}) {
  return {
    candidatePhrases: "cozy cat mystery\nsmall town secrets\namateur sleuth\nCozy, cat mystery",
    planningCapText: "50",
    title: "",
    subtitle: "",
    categories: "",
    ...overrides,
  };
}

test("packs the priority list into seven fields and omits punctuation variants", () => {
  const result = buildKdpBackendKeywords(input());
  assert.equal(result.status, "built");
  if (result.status !== "built") return;
  assert.equal(result.placedCount, 3);
  assert.equal(result.distinctCount, 3);
  assert.equal(result.fields.length, 7);
  assert.equal(result.fields[0].text, "cozy cat mystery small town secrets amateur sleuth");
  assert.equal(result.fields[0].characters, 50);
  assert.deepEqual(result.duplicates, [{ line: 4, phrase: "Cozy, cat mystery", firstLine: 1 }]);
  assert.equal(result.fields.slice(1).every((field) => field.text === ""), true);
});

test("uses the first-fit cap, fills seven slots, and leaves the eighth phrase unplaced", () => {
  const result = buildKdpBackendKeywords(input({
    candidatePhrases: "oak woods\npine trail\nsea cave\nriver map\nhill path\nquiet bay\nmoon lake\nstone gate",
    planningCapText: "12",
  }));
  assert.equal(result.status, "built");
  if (result.status !== "built") return;
  assert.deepEqual(result.fields.map((field) => field.text), ["oak woods", "pine trail", "sea cave", "river map", "hill path", "quiet bay", "moon lake"]);
  assert.deepEqual(result.unplaced, [{ line: 8, phrase: "stone gate", characters: 10, reason: "no-room" }]);
});

test("keeps punctuation-only lines visible as needs-edit in a partial draft", () => {
  const result = buildKdpBackendKeywords(input({ candidatePhrases: "garden mystery\n..." }));
  assert.equal(result.status, "built");
  if (result.status !== "built") return;
  assert.deepEqual(result.needsEdit, [{ line: 2, phrase: "..." }]);
  assert.equal(result.placedCount, 1);
});

test("marks bounded KDP signals and labels overlap and reuse as local prompts", () => {
  const result = buildKdpBackendKeywords(input({
    candidatePhrases: "<b>cozy cat mystery</b>\ncozy cat books",
    title: "cozy cat mystery",
  }));
  assert.equal(result.status, "built");
  if (result.status !== "built") return;
  assert.ok(result.kdpFindings.some((finding) => finding.message.includes("HTML tags")));
  assert.ok(result.localFindings.some((finding) => finding.message.includes("All meaningful words")));
  assert.ok(result.localFindings.some((finding) => finding.message.includes("organization prompt")));
});

test("rejects invalid caps, overlong phrases, too many lines, and oversized source without truncating", () => {
  for (const cap of ["", "50.5", "9", "201", "1e2"]) {
    const result = buildKdpBackendKeywords(input({ planningCapText: cap }));
    assert.equal(result.status, "invalid", cap);
    if (result.status === "invalid") assert.ok(result.fieldErrors.planningCapText);
  }
  assert.equal(buildKdpBackendKeywords(input({ candidatePhrases: `${"x".repeat(201)}` })).status, "invalid");
  assert.equal(buildKdpBackendKeywords(input({ candidatePhrases: Array(101).fill("phrase here").join("\n") })).status, "invalid");
  const tooLarge = buildKdpBackendKeywords(input({ candidatePhrases: "x".repeat(64 * 1024 + 1) }));
  assert.equal(tooLarge.status, "invalid");
  if (tooLarge.status === "invalid") assert.match(tooLarge.fieldErrors.candidatePhrases ?? "", /64 KiB/u);
});

test("requires one usable phrase and does not treat the local cap as a KDP limit", () => {
  const result = buildKdpBackendKeywords(input({ candidatePhrases: "...\n—" }));
  assert.equal(result.status, "invalid");
  if (result.status === "invalid") assert.match(result.fieldErrors.candidatePhrases ?? "", /letter or number/u);
  const planning = buildKdpBackendKeywords(input({ candidatePhrases: "garden mystery", planningCapText: "200" }));
  assert.equal(planning.status, "built");
  if (planning.status === "built") assert.equal(planning.planningCap, 200);
});
