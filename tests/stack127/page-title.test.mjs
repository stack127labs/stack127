import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../", import.meta.url);

function source(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("every page family uses the shared responsive H1 typography", () => {
  const globals = source("app/globals.css");
  assert.match(globals, /--text-h1: clamp\(2rem, 5vw, 2\.6rem\);/);
  assert.match(globals, /--line-h1: 1\.02;/);

  const h1Owners = [
    ["app/prose.module.css", /\.prose h1\s*\{[\s\S]*font-size: var\(--text-h1\);[\s\S]*line-height: var\(--line-h1\);/],
    ["app/(site)/home.css", /\.home-intro h1\s*\{[\s\S]*font-size: var\(--text-h1\);[\s\S]*line-height: var\(--line-h1\);/],
    ["app/(site)/dns-tools/dns-tools.css", /\.dns-page-header h1\s*\{[\s\S]*font-size: var\(--text-h1\);[\s\S]*line-height: var\(--line-h1\);/],
    ["app/(site)/self-host-apps/self-host-apps.css", /\.directory-results-header h1\s*\{[\s\S]*font-size: var\(--text-h1\);[\s\S]*line-height: var\(--line-h1\);/],
    ["app/not-found.module.css", /\.panel h1\s*\{[\s\S]*font-size: var\(--text-h1\);[\s\S]*line-height: var\(--line-h1\);/],
  ];

  for (const [path, pattern] of h1Owners) {
    assert.match(source(path), pattern, `${path} should use the shared H1 size and line height`);
  }
});
