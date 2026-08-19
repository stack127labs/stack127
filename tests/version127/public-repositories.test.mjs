import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const registryPath = "version127_docs/public-repositories.md";
const registry = readFileSync(registryPath, "utf8");

test("external repositories are tracked as documentation, not local source copies", () => {
  assert.equal(existsSync("repos"), false, "the private repository must not contain a repos source tree");
  assert.match(registry, /version127\/basebuddy-website/);
  assert.match(registry, /version127\/basebuddy/);
  assert.match(registry, /version127\/dns-tools/);
  assert.match(registry, /version127\/version127-datasets/);
  assert.match(registry, /\| Source of truth \|/);
  assert.match(registry, /Clone external repositories beside, not inside/);
  assert.doesNotMatch(registry, /repos\/(?:basebuddy-website|basebuddy|dns-tools|version127-datasets)/);
});

test("the private repository documents hard boundaries for external projects", () => {
  assert.match(registry, /must not import private version127 code/);
  assert.match(registry, /must not import an external repository at runtime or during its normal build/);
  assert.match(registry, /release\/tag.*exact commit SHA/);
});
