import assert from "node:assert/strict";
import test from "node:test";
import { shortcutApps } from "../../../../lib/shortcuts/index.ts";
import { buildCheatSheet } from "../../../../lib/shortcuts/cheatsheet.ts";

test("an empty selection is invalid", () => {
  const result = buildCheatSheet(shortcutApps, []);
  assert.equal(result.ok, false);
});

test("a selected app produces only its selected platform", () => {
  const result = buildCheatSheet(shortcutApps, [{ slug: "brave", platforms: ["macos"], groupIds: null }]);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.doc.apps[0].platforms, ["macos"]);
    assert.ok(result.doc.shortcutCount > 0);
  }
});

test("an empty group selection is not treated as every group", () => {
  const result = buildCheatSheet(shortcutApps, [{ slug: "brave", platforms: ["macos"], groupIds: [] }]);
  assert.equal(result.ok, false);
});

test("unknown apps and groups return explicit errors", () => {
  const unknownApp = buildCheatSheet(shortcutApps, [{ slug: "missing", platforms: ["macos"], groupIds: null }]);
  assert.deepEqual(unknownApp, { ok: false, reason: "Unknown app: missing" });

  const unknownGroup = buildCheatSheet(shortcutApps, [{ slug: "brave", platforms: ["macos"], groupIds: ["missing"] }]);
  assert.equal(unknownGroup.ok, false);
  if (!unknownGroup.ok) assert.match(unknownGroup.reason, /no group named missing/);
});
