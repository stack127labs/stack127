import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync(new URL("../../../app/(site)/(legal)/privacy/page.tsx", import.meta.url), "utf8")
  .replace(/\s+/g, " ")
  .trim();

test("privacy page explains domain lookup processing accurately", () => {
  assert.match(source, /queried domain name is sent to the registry and registrar/i);
  assert.match(source, /registration facts are cached.*domain name/i);
  assert.match(source, /requester identifiers are used temporarily for rate limiting/i);
  assert.match(source, /never persistently associated with a cached lookup/i);
  assert.match(source, /do not build a history that connects domain lookups to visitors/i);
  assert.doesNotMatch(source, /we do not store who asked/i);
});

test("privacy page records the stack127 rebrand update", () => {
  assert.match(source, /Last updated: August 20, 2026\./);
});
