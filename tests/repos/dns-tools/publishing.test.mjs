import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const repo = path.join(root, "repos", "dns-tools");

test("DNS Tools has a fixed public organization target and guarded subtree publisher", () => {
  const configPath = path.join(repo, "version127-repository.json");
  assert.ok(existsSync(configPath));

  const config = JSON.parse(readFileSync(configPath, "utf8"));
  assert.deepEqual(config, {
    nameWithOwner: "version127/dns-tools",
    defaultBranch: "main",
    visibility: "public",
    sourcePath: "repos/dns-tools",
    syncCheck: "npm run version127:dns-tools:sync-check",
    qualityCheck: "npm --prefix repos/dns-tools run quality",
  });

  const publisher = readFileSync(
    path.join(root, "scripts", "version127", "repos", "publish-open-repo.mjs"),
    "utf8",
  );
  assert.match(publisher, /startsWith\("version127\/"\)/);
  assert.match(publisher, /\["subtree", "split"/);
  assert.match(publisher, /scanTrackedFiles/);
  assert.match(publisher, /Nested \.git directories are not allowed/);
  assert.match(publisher, /Commit the private repository changes before creating a public subtree commit/);
  assert.match(publisher, /shouldPush/);
});
