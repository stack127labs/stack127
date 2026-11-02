import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { parseRootDb, validateRootDb } from "../../../../scripts/domain-tools/refresh-tld-directory.mjs";

const fixture = await readFile(new URL("./fixtures/iana-root-db.html", import.meta.url), "utf8");

test("parses current columns, clean IDN names, and real unassigned managers", () => {
  assert.deepEqual(parseRootDb(fixture), [
    { tld: "aaa", displayed: null, type: "generic", organisation: "American Automobile Association, Inc.", assigned: true },
    { tld: "xn--4dbrk0ce", displayed: "ישראל", type: "country-code", organisation: "The Israel Internet Association (RA)", assigned: true },
    { tld: "bl", displayed: null, type: "country-code", organisation: null, assigned: false },
    { tld: "arpa", displayed: null, type: "infrastructure", organisation: "Internet Architecture Board (IAB)", assigned: true },
  ]);
});

test("accepts all supported types and legacy .html links", () => {
  for (const type of ["generic", "country-code", "sponsored", "infrastructure", "generic-restricted", "test"]) {
    assert.equal(parseRootDb(fixture.replace("Generic", type))[0].type, type);
  }
  assert.equal(parseRootDb(fixture.replace('/db/aaa"', '/db/aaa.html"'))[0].tld, "aaa");
});

test("rejects blank type, unknown type, and a status in the type column", () => {
  for (const value of ["", "Active", "unexpected"]) {
    assert.throws(() => parseRootDb(fixture.replace("Generic", value)), /Invalid IANA type for .aaa/);
  }
});

test("rejects a blank manager rather than treating it as Not assigned", () => {
  assert.throws(() => parseRootDb(fixture.replace("American Automobile Association, Inc.", "")), /Missing IANA organisation for .aaa/);
  assert.throws(() => parseRootDb(fixture.replace("Not assigned", "")), /Missing IANA organisation for .bl/);
});

test("rejects changed columns and malformed TLD links", () => {
  assert.throws(() => parseRootDb(fixture.replace("<th>Status</th>", "<th>Other</th>")), /columns changed/);
  assert.throws(() => parseRootDb(fixture.replace('/db/aaa"', '/db/aaa/unknown"')), /Malformed IANA/);
});

test("requires every current root ending and rejects duplicates", () => {
  const entries = parseRootDb(fixture);
  assert.throws(() => validateRootDb(entries, ["aaa", "com"]), /Missing IANA rows for: com/);
  assert.throws(() => validateRootDb([...entries, entries[0]]), /Duplicate IANA row/);
});

test("validates every current ending while ignoring historical rows outside the root", () => {
  const brokenHistoricalRow = fixture.replace("Not assigned", "");
  assert.deepEqual(parseRootDb(brokenHistoricalRow, ["aaa"]), parseRootDb(fixture).slice(0, 1));
  assert.throws(() => parseRootDb(brokenHistoricalRow, ["aaa", "bl"]), /Missing IANA organisation for .bl/);
});

test("a failed refresh exits with an error and leaves the committed output untouched", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "stack127-tld-refresh-"));
  try {
    const output = path.join(directory, "lib/domain/data/tld-directory.json");
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, "previous valid dataset\n");
    const invalidHtml = fixture.replace("Generic", "Active");
    const preload = `globalThis.fetch = async () => ({ ok: true, text: async () => ${JSON.stringify(invalidHtml)} });`;
    const result = spawnSync(process.execPath, [
      "--experimental-strip-types", "--import", `data:text/javascript;base64,${Buffer.from(preload).toString("base64")}`,
      fileURLToPath(new URL("../../../../scripts/domain-tools/refresh-tld-directory.mjs", import.meta.url)),
    ], { cwd: directory, encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Invalid IANA type for .aaa/);
    assert.equal(await readFile(output, "utf8"), "previous valid dataset\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
