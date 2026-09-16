import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../../", import.meta.url);

async function read(p) { return readFile(new URL(p, root), "utf8"); }

test("cli-apps is registered as a home feature page", async () => {
  const helpers = await read("lib/page-registry-helpers.ts");
  assert.match(helpers, /"cli-apps"/);
});

test("the home page exposes a cli-apps card with an icon", async () => {
  const home = await read("app/(site)/page.tsx");
  assert.match(home, /"cli-apps": SquareTerminal/);
  assert.match(home, /SquareTerminal/);
});

test("the site navigation leads to home, where Start here links to cli-apps", async () => {
  const nav = await read("app/site-nav.tsx");
  const home = await read("app/(site)/page.tsx");
  assert.match(nav, /href="\/"[^>]*>\s*explore/);
  assert.match(home, /href="\/cli-apps"/);
  assert.match(home, /Browse CLI apps/);
});

test("the cli-apps page exposes language and license filters", async () => {
  const page = await read("app/(site)/(directories)/cli-apps/page.tsx");
  assert.match(page, /name="language"/);
  assert.match(page, /name="license"/);
  assert.match(page, /languageOptions/);
  assert.match(page, /licenseOptions/);
});

test("the directory filter logic supports license filtering", async () => {
  const filters = await read("app/(site)/(directories)/cli-apps/filters.ts");
  assert.match(filters, /getValues\(params, "license"\)/);
  assert.match(filters, /licenses\.length/);
});
