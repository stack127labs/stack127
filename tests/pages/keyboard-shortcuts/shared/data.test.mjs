import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { loadShortcutApps } from "../../../../lib/shortcuts/index.ts";
import { shortcutCount } from "../../../../lib/shortcuts/types.ts";

const shortcutApps = await loadShortcutApps();
const backlog = readFileSync(new URL("../../../../content_docs/keyboard-shortcuts/altplusctrl-backlog.md", import.meta.url), "utf8");
const backlogRows = new Map(
  backlog
    .split("\n")
    .filter((line) => line.startsWith("|") && !line.startsWith("| ---"))
    .map((line) => {
      const columns = line.split("|").map((column) => column.trim());
      return [columns[2]?.replaceAll("`", ""), { status: columns[3], sourceUrl: columns[4] }];
    })
    .filter(([slug, row]) => Boolean(slug) && ["Verified", "Blocked", "Not started"].includes(row.status)),
);
const baselineSlugs = new Set([
  "brave",
  "chrome",
  "claude-code",
  "codex",
  "cursor",
  "excel",
  "figma",
  "firefox",
  "ghostty",
  "github",
  "gmail",
  "gnome",
  "google-sheets",
  "iterm2",
  "macos",
  "neovim",
  "notion",
  "opencode",
  "pi-coding-agent",
  "powershell",
  "slack",
  "vim",
  "vscode",
  "windows",
  "windows-terminal",
  "zed",
]);

test("the reference contains the baseline app set", () => {
  assert.ok(shortcutApps.length >= 26);
  assert.ok(shortcutApps.some((app) => app.slug === "claude-code"));
  assert.ok(shortcutApps.some((app) => app.slug === "opencode"));
  assert.ok(shortcutApps.some((app) => app.slug === "pi-coding-agent"));
  assert.ok(shortcutApps.some((app) => app.slug === "ghostty"));
  assert.ok(shortcutApps.some((app) => app.slug === "zed"));
});

test("deferred apps are not presented as verified entries", () => {
  assert.equal(shortcutApps.some((app) => app.slug === "grok-build"), false);
  assert.equal(shortcutApps.some((app) => app.slug === "orbstack"), false);
});

test("backlog and app records stay in sync", () => {
  for (const app of shortcutApps) {
    const row = backlogRows.get(app.slug);
    if (!row) {
      assert.equal(baselineSlugs.has(app.slug), true, `${app.slug} needs a backlog row or baseline allowance`);
      continue;
    }
    assert.equal(row.status, "Verified", `${app.slug} has a data module but is not Verified in the backlog`);
    assert.equal(row.sourceUrl, app.sourceUrl, `${app.slug} source URL differs between the backlog and data record`);
  }

  const appSlugs = new Set(shortcutApps.map((app) => app.slug));
  for (const [slug, row] of backlogRows) {
    if (row.status === "Verified") {
      assert.equal(appSlugs.has(slug), true, `${slug} is Verified but has no data module`);
    }
    if (row.status === "Blocked" || row.status === "Not started") {
      assert.equal(appSlugs.has(slug), false, `${slug} is ${row.status} but has a data module`);
    }
  }
});

test("every app has a source and documented data", () => {
  for (const app of shortcutApps) {
    assert.match(app.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${app.slug} needs a URL-safe slug`);
    assert.equal(new Set(app.platforms).size, app.platforms.length, `${app.slug} repeats a platform`);
    assert.match(app.sourceUrl, /^https:\/\//);
    assert.ok(app.sourceLabel);
    assert.match(app.lastVerified, /^20\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, `${app.slug} needs a verified date`);
    assert.equal(
      new Date(`${app.lastVerified}T00:00:00Z`).toISOString().slice(0, 10),
      app.lastVerified,
      `${app.slug} needs a real calendar date`,
    );
    assert.ok(app.groups.length > 0);
    assert.ok(app.intro.length >= 120, `${app.slug} needs a specific intro`);
    assert.ok(shortcutCount(app) > 0, `${app.slug} has no documented shortcut coverage`);
    const groupIds = new Set();
    const ids = new Set();
    for (const group of app.groups) {
      assert.equal(groupIds.has(group.id), false, `${app.slug} repeats group id ${group.id}`);
      groupIds.add(group.id);
      assert.ok(group.intro && group.intro.length >= 55, `${app.slug}/${group.id} needs a section description`);
      assert.ok(group.shortcuts.length > 0, `${app.slug}/${group.id} has no shortcuts`);
      for (const shortcut of group.shortcuts) {
        assert.equal(ids.has(shortcut.id), false, `${app.slug} repeats shortcut id ${shortcut.id}`);
        ids.add(shortcut.id);
        for (const key of shortcut.keys) {
          assert.ok(app.platforms.includes(key.platform), `${app.slug}/${shortcut.id} uses an undeclared platform`);
          assert.ok(key.keys.length > 0, `${app.slug}/${shortcut.id} has an empty primary binding`);
          for (const alternative of key.alternatives ?? []) {
            assert.ok(alternative.length > 0, `${app.slug}/${shortcut.id} has an empty alternative binding`);
          }
        }
      }
    }
  }
});
