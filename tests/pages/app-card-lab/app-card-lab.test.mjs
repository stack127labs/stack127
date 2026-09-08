import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("app card lab is development-only and uses central noindex handling", async () => {
  const page = await source("app/(site)/app-card-lab/page.tsx");
  const layout = await source("app/(site)/layout.tsx");
  assert.match(page, /process\.env\.NODE_ENV !== "development"/);
  assert.match(page, /notFound\(\)/);
  assert.match(layout, /"\/app-card-lab"/);
  assert.doesNotMatch(page, /generateMetadata|export const metadata/);
});

test("lab offers ten identifiable variants without changing live directory components", async () => {
  const page = await source("app/(site)/app-card-lab/page.tsx");
  assert.equal((page.match(/id: "design-/g) ?? []).length, 10);
  assert.match(page, /samples\)\.map/);
  assert.match(page, /target="_blank"/);
  assert.match(page, /import \{ samples, thirdSample \} from "\.\/card-data"/);
  assert.match(page, /<AppShell/);
  assert.match(page, /<img/);
  assert.doesNotMatch(page, /react-icons\/si|Math\.random|SiHomeassistant/);
  const data = await source("app/(site)/app-card-lab/card-data.ts");
  for (const label of ["Source", "Pricing", "RAM", "Storage", "Last update", "Stars", "License", "Platforms", "Version", "Last commit"]) {
    assert.ok(data.includes(`"${label}"`), `${label} stays in the comparison`);
  }
});
