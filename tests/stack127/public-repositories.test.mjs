import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const registryPath = "stack127_docs/public-repositories.md";
const registry = readFileSync(registryPath, "utf8");

test("external repositories are tracked as documentation, not local source copies", () => {
  assert.equal(existsSync("repos"), false, "the private repository must not contain a repos source tree");
  assert.match(registry, /stack127\/basebuddy-website/);
  assert.match(registry, /stack127\/basebuddy/);
  assert.match(registry, /stack127\/dns-tools/);
  assert.match(registry, /stack127\/stack127-datasets/);
  assert.match(registry, /\| Source of truth \|/);
  assert.match(registry, /Clone external repositories beside, not inside/);
  assert.doesNotMatch(registry, /repos\/(?:basebuddy-website|basebuddy|dns-tools|stack127-datasets)/);
});

test("the private repository documents hard boundaries for external projects", () => {
  assert.match(registry, /must not import private stack127 code/);
  assert.match(registry, /must not import an external repository at runtime or during its normal build/);
  assert.match(registry, /release\/tag.*exact commit SHA/);
});
