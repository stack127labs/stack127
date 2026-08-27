import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const hostedStyleFiles = [
  "app/(site)/(catalogs)/dns-tools/dns-tools.css",
  "app/(site)/(catalogs)/dns-tools/dns-diagnostics.module.css",
  "app/(site)/(tools)/dns-trace/dns-trace.module.css",
];

test("DNS tool boxes never use a colored left-edge accent", () => {
  const styles = hostedStyleFiles.map((file) => readFileSync(path.join(root, file), "utf8")).join("\n");
  const leftEdges = [...styles.matchAll(/border-(?:left|inline-start)(?:-color)?:\s*([^;]+);/g)]
    .map((match) => match[1].trim());

  assert.deepEqual(
    leftEdges,
    ["1px solid var(--color-border-strong)"],
  );
});
