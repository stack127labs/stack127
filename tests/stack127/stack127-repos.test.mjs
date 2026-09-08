import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const registryPath = "stack127_docs/stack127-repos.md";
const registry = readFileSync(registryPath, "utf8");

test("stack127 repos are tracked without local source copies", () => {
  assert.equal(existsSync("repos"), false, "the private repository must not contain a repos source tree");
  assert.match(registry, /stack127labs\/basebuddy-website/);
  assert.match(registry, /stack127labs\/basebuddy/);
  assert.match(registry, /stack127labs\/dns-tools/);
  assert.match(registry, /stack127labs\/stack127-datasets/);
  assert.match(registry, /\| Source of truth \|/);
  assert.match(registry, /Clone stack127 repos beside, not inside/);
  assert.doesNotMatch(registry, /repos\/(?:basebuddy-website|basebuddy|dns-tools|stack127-datasets)/);
});

test("the private repository documents hard boundaries for stack127 repos", () => {
  assert.match(registry, /must not import private stack127 code/);
  assert.match(registry, /must not import a stack127 repo at runtime or during its normal build/);
  assert.match(registry, /release\/tag.*exact commit SHA/);
});
