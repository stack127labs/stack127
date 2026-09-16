import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("app/(site)/(legal)/about/page.tsx", "utf8");

test("About explains the name and links to the public GitHub organization", () => {
  assert.match(source, /the loopback address for localhost/);
  assert.match(source, /always points back to your own machine/);
  assert.match(source, /Most of our tools are open source too/);
  assert.match(source, /Download them, run them on your own machine/);
  assert.match(source, /href="https:\/\/github\.com\/stack127labs"/);
  assert.doesNotMatch(source, /commonly associated with localhost/);
});

test("About keeps the personal follow link in Contact", () => {
  assert.doesNotMatch(source, /<h2>Follow along<\/h2>/);
  assert.match(source, /<h2>Contact<\/h2>/);
  assert.match(source, /href="https:\/\/x\.com\/RaviTejaKNTS"/);
});
