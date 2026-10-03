import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { legacyShortcutRedirects } from "../../../lib/legacy-shortcut-redirects.ts";

test("every original shortcut reference redirects permanently to its replacement", () => {
  const formerApps = "brave chrome claude-code codex cursor excel figma firefox ghostty github gmail gnome google-sheets iterm2 macos neovim notion opencode pi-coding-agent powershell slack vim vscode windows-terminal windows zed".split(" ");
  assert.equal(legacyShortcutRedirects.length, formerApps.length + 1);
  for (const slug of ["", ...formerApps]) {
    const suffix = slug ? `/${slug}` : "";
    assert.deepEqual(legacyShortcutRedirects.find(r => r.source === `/shortcuts${suffix}`), {
      source: `/shortcuts${suffix}`, destination: `/keyboard-shortcuts${suffix}`, permanent: true,
    });
    assert.ok(existsSync(`app/(site)/(directories)/keyboard-shortcuts${suffix || "/(index)"}/page.tsx`));
  }
  assert.ok(!legacyShortcutRedirects.some(r => r.source.includes(":")));
});

test("Next server redirects include the legacy shortcut map", () => {
  const config = readFileSync("next.config.ts", "utf8");
  assert.match(config, /\.\.\.legacyShortcutRedirects/);
});
