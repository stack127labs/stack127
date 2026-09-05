import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../../../../", import.meta.url);

test("hardware cards render the compatibility decision and two practical facts", async () => {
  const source = await readFile(new URL("app/(site)/(directories)/_components/hardware-directory-browser.tsx", root), "utf8");
  assert.match(source, /record\.card\?\.compatibility/);
  assert.match(source, /cardFacts/);
  assert.match(source, /record\.detail_sections/);
  assert.doesNotMatch(source, /record\.evidence\.slice\(0, 2\)/);
});

test("hardware directory pages show their source coverage ledger", async () => {
  const source = await readFile(new URL("app/(site)/(directories)/_components/hardware-directory-page.tsx", root), "utf8");
  assert.match(source, /snapshot\.meta\.coverage/);
  assert.match(source, /Source records/);
  assert.match(source, /Product images/);
  assert.match(source, /Detailed records/);
});

test("grouped Matter cards keep every certification variant inspectable", async () => {
  const source = await readFile(new URL("app/(site)/(directories)/_components/hardware-directory-browser.tsx", root), "utf8");
  assert.match(source, /record\.certification_variants/);
  assert.match(source, /Certification variants/);
  assert.match(source, /variant\.certificate_id/);
  assert.match(source, /variant\.product_id/);
  assert.match(source, /variant\.firmware_version/);
});
