import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);

function source(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("the shared sidebar preserves main-content space on desktop", () => {
  const globals = source("app/globals.css");
  const shell = source("app/app-shell.module.css");
  const panel = source("app/sidebar-panel.module.css");

  assert.match(
    globals,
    /--sidebar-width:\s*clamp\(260px,\s*20vw,\s*300px\);/,
  );
  assert.doesNotMatch(shell, /minmax\(250px,\s*25vw\)/);
  assert.match(
    panel,
    /\.panel\s*\{[\s\S]*padding:\s*var\(--space-11\)\s+clamp\(20px,\s*2vw,\s*28px\)\s+34px;/,
  );
});

test("the shared sidebar becomes a drawer at the compact desktop boundary", () => {
  const shell = source("app/app-shell.module.css");
  const panel = source("app/sidebar-panel.module.css");

  assert.match(
    shell,
    /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*\.page\s*\{[\s\S]*grid-template-columns:\s*1fr;/,
  );
  assert.match(panel, /@media\s*\(max-width:\s*960px\)/);
});
