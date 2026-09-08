import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { walk } from "../../scripts/stack127/quality/route-utils.mjs";

const root = new URL("../../", import.meta.url);

function source(relativePath) {
  return readFileSync(new URL(relativePath, root), "utf8");
}

test("the site uses one 2px radius token", () => {
  const globals = source("app/globals.css");

  assert.match(globals, /--radius:\s*2px;/);
  assert.doesNotMatch(globals, /--radius-(?:md|lg|xl):/);
});

test("bounded UI shapes use the shared radius token", () => {
  const allowedRadius = /^(?:(?:var\(--radius\)|0)(?:\s+(?:var\(--radius\)|0)){0,3}|50%)$/;
  const cssFiles = walk("app").filter((file) => file.endsWith(".css"));
  const failures = [];

  for (const file of cssFiles) {
    const css = source(file);
    for (const match of css.matchAll(/border-radius:\s*([^;\n}]+)[;\n}]/g)) {
      const value = match[1].trim();
      if (!allowedRadius.test(value)) {
        const line = css.slice(0, match.index).split("\n").length;
        failures.push(`${file}:${line} uses ${value}`);
      }
    }
  }

  assert.deepEqual(failures, []);
});

test("generated site graphics follow the 2px radius", () => {
  assert.match(
    source("app/(site)/(directories)/self-host-apps/directory-app-card.tsx"),
    /<rect width="64" height="64" rx="2"/,
  );
  assert.match(
    source("app/(site)/(directories)/cli-apps/cli-app-browser.tsx"),
    /<rect width="64" height="64" rx="2"/,
  );
  assert.match(
    source("scripts/cli-apps/cache-icons.mjs"),
    /<rect width="256" height="256" rx="8"/,
  );
  assert.match(
    source("scripts/stack127/clean-charts/figures.mjs"),
    /C\.rect\(x0, y \+ 8, w, 18, \{ fill: toneOf\(item\.tone\), rx: 2 \}\);/,
  );
});
