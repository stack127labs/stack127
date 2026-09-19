import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/kdp-page-count-estimator/", root);

test("owns an unpublished flat route with a range-first answer", () => {
  for (const file of ["page.tsx", "kdp-page-count-estimator.tsx"]) assert.equal(existsSync(new URL(file, route)), true, file);
  const page = readFileSync(new URL("page.tsx", route), "utf8");
  const client = readFileSync(new URL("kdp-page-count-estimator.tsx", route), "utf8");
  const engine = readFileSync(new URL("lib/kdp/page-count.ts", root), "utf8");
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.state, "unpublished");
  assert.match(page, /getRequiredToolPage\("kdp-page-count-estimator"\)/);
  assert.match(client, /Estimate pages/);
  assert.match(client, /Estimated print pages/);
  assert.match(client, /Final file rules apply\. Even-page estimate\./);
  assert.match(client, /Model: 5 chars\/word; 80%-120%; chapters\./);
  assert.doesNotMatch(client, /<ToolResultLead>/);
  assert.match(engine, /evenCeiling/);
  assert.doesNotMatch(engine, /react|fetch\(|localStorage|sessionStorage|navigator\.|document\.|window\./i);
});
