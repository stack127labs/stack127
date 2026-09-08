import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../../../app/(site)/labs/page.tsx", import.meta.url), "utf8")
  + await readFile(new URL("../../../app/(site)/labs/projects.ts", import.meta.url), "utf8");
const styles = await readFile(
  new URL("../../../app/(site)/labs/labs.module.css", import.meta.url),
  "utf8",
);

test("labs page links to the stack127labs organization and public projects", () => {
  assert.match(source, /github\.com\/stack127labs/);
  assert.match(source, /stack127labs\/basebuddy/);
  assert.match(source, /stack127labs\/dns-tools/);
  assert.match(source, /stack127labs\/stack127-datasets/);
  assert.doesNotMatch(source, /github\.com\/version127/);
  assert.doesNotMatch(source, /Some source-of-truth repositories stay private while they are under active development\./);
});

test("labs presents the projects as a responsive, icon-led ledger", () => {
  for (const icon of ["ArrowUpRight", "Binary", "Database", "Network", "FaGithub"]) {
    assert.match(source, new RegExp(`\\b${icon}\\b`), `${icon} is part of the project UI`);
  }

  assert.match(source, /icon:\s*Binary/);
  assert.match(source, /icon:\s*Network/);
  assert.match(source, /icon:\s*Database/);
  assert.match(source, /<ProjectIcon/);
  assert.match(source, /<table/);
  assert.match(source, /<th[^>]+scope="row"/);
  assert.match(source, /Open project/);
  assert.match(source, /Source code/);
  assert.match(source, /Browse all public projects/);
  assert.match(source, /<InfoPage[\s\S]*\bwide\b/);

  assert.match(styles, /\.projectIdentity/);
  assert.match(styles, /\.projectIcon/);
  assert.match(styles, /\.actions/);
  assert.match(styles, /@media\s*\(max-width:\s*700px\)/);
  assert.doesNotMatch(styles, /min-width:\s*640px/);
});
