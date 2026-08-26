import assert from "node:assert/strict";
import test from "node:test";
import { shortcutApps } from "../../../../lib/shortcuts/index.ts";
import { shortcutPageClosing, shortcutPageGuidance } from "../../../../lib/shortcuts/copy.ts";
import { shortcutCount } from "../../../../lib/shortcuts/types.ts";

test("the reference contains the researched first-release apps", () => {
  assert.equal(shortcutApps.length, 26);
  assert.ok(shortcutApps.some((app) => app.slug === "claude-code"));
  assert.ok(shortcutApps.some((app) => app.slug === "opencode"));
  assert.ok(shortcutApps.some((app) => app.slug === "pi-coding-agent"));
  assert.ok(shortcutApps.some((app) => app.slug === "ghostty"));
  assert.ok(shortcutApps.some((app) => app.slug === "zed"));
});

test("deferred apps are not presented as verified first-release pages", () => {
  assert.equal(shortcutApps.some((app) => app.slug === "grok-build"), false);
  assert.equal(shortcutApps.some((app) => app.slug === "orbstack"), false);
});

test("every app has a source and documented data", () => {
  for (const app of shortcutApps) {
    assert.match(app.sourceUrl, /^https:\/\//);
    assert.ok(app.sourceLabel);
    assert.equal(app.lastVerified, "2026-08-26", `${app.slug} needs a current official-source check`);
    assert.ok(app.groups.length > 0);
    assert.ok(app.intro.length >= 120, `${app.slug} needs a specific intro`);
    assert.ok(shortcutCount(app) >= 18, `${app.slug} has too little shortcut coverage`);
    assert.ok(shortcutPageGuidance[app.slug]?.length >= 100, `${app.slug} needs landing guidance`);
    assert.ok(shortcutPageClosing[app.slug]?.length >= 140, `${app.slug} needs a meaningful closing`);

    const ids = new Set();
    for (const group of app.groups) {
      assert.ok(group.intro && group.intro.length >= 55, `${app.slug}/${group.id} needs a section description`);
      assert.ok(group.shortcuts.length > 0, `${app.slug}/${group.id} has no shortcuts`);
      for (const shortcut of group.shortcuts) {
        assert.equal(ids.has(shortcut.id), false, `${app.slug} repeats shortcut id ${shortcut.id}`);
        ids.add(shortcut.id);
        for (const key of shortcut.keys) {
          assert.ok(key.keys.length > 0, `${app.slug}/${shortcut.id} has an empty primary binding`);
          for (const alternative of key.alternatives ?? []) {
            assert.ok(alternative.length > 0, `${app.slug}/${shortcut.id} has an empty alternative binding`);
          }
        }
      }
    }
  }
});
