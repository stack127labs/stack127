import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../../../app/(site)/labs/page.tsx", import.meta.url), "utf8");

test("labs page links to the stack127labs organization and public projects", () => {
  assert.match(source, /github\.com\/stack127labs/);
  assert.match(source, /stack127labs\/basebuddy/);
  assert.match(source, /stack127labs\/dns-tools/);
  assert.match(source, /stack127labs\/stack127-datasets/);
  assert.doesNotMatch(source, /github\.com\/version127/);
});
