import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/kdp-royalty-calculator/", root);

test("owns a published flat route with print and ebook controls", () => {
  for (const file of ["page.tsx", "kdp-royalty-calculator.tsx"]) assert.equal(existsSync(new URL(file, route)), true, file);
  const page = readFileSync(new URL("page.tsx", route), "utf8");
  const client = readFileSync(new URL("kdp-royalty-calculator.tsx", route), "utf8");
  const engine = readFileSync(new URL("lib/kdp/royalty.ts", root), "utf8");
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.state, "published");
  assert.match(page, /getRequiredToolPage\("kdp-royalty-calculator"\)/);
  assert.match(client, /Calculate royalty/);
  assert.match(client, /Price comparison/);
  assert.match(client, /Expanded Distribution/);
  assert.doesNotMatch(engine, /react|fetch\(|localStorage|sessionStorage|navigator\.|document\.|window\./i);
});
