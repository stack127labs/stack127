import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const route = new URL("app/(site)/(tools)/kdp-metadata-checker/", root);

test("owns an unpublished flat route and safe preview", () => {
  for (const file of ["page.tsx", "kdp-metadata-checker.tsx"]) assert.equal(existsSync(new URL(file, route)), true, file);
  const page = readFileSync(new URL("page.tsx", route), "utf8");
  const client = readFileSync(new URL("kdp-metadata-checker.tsx", route), "utf8");
  const engine = readFileSync(new URL("lib/kdp/metadata.ts", root), "utf8");
  const manifest = JSON.parse(readFileSync(new URL("page.json", import.meta.url), "utf8"));
  assert.equal(manifest.state, "unpublished");
  assert.match(page, /getRequiredToolPage\("kdp-metadata-checker"\)/);
  assert.match(client, /Check metadata/);
  assert.match(client, /Last checked snapshot\. Check again\./);
  assert.match(client, /tokenizeKdpDescription/);
  assert.doesNotMatch(client, /dangerouslySetInnerHTML/);
  assert.doesNotMatch(engine, /react|fetch\(|localStorage|sessionStorage|navigator\.|document\.|window\./i);
});
