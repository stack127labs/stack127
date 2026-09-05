import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("../../../", import.meta.url);

test("camera datasheet research requires exact model text and rejects sparse images", async () => {
  const source = await readFile(new URL("scripts/local-security-cameras/research-datasheet-images.mjs", root), "utf8");
  assert.match(source, /includes\(normalized\(record\.model\)\)/);
  assert.match(source, /stats\.entropy < 1\.5/);
  assert.match(source, /technical line drawing/);
  assert.match(source, /"-png"/);
  assert.match(source, /first two pages/i);
});
