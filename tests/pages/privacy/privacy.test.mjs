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

test("privacy page discloses both analytics systems and the visitor's control", () => {
  assert.match(source, /self-hosted Umami/i);
  assert.match(source, /Google Analytics/i);
  assert.match(source, /first-party cookie/i);
  assert.match(source, /Google/i);
  assert.match(source, /query strings/i);
  assert.match(source, /decline Google Analytics/i);
  assert.match(source, /analytics settings/i);
});

test("privacy page records the analytics update", () => {
  assert.match(source, /Last updated: September 19, 2026\./);
});
