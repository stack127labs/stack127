#!/usr/bin/env node

import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const repoName = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const shouldPush = process.argv.includes("--push");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });
  if (result.status !== 0) {
    if (options.capture && result.stderr) console.error(result.stderr.trim());
    fail(`Command failed: ${command} ${args.join(" ")}`);
  }
  return options.capture ? result.stdout.trim() : "";
}

function runShell(command) {
  const result = spawnSync(command, {
    cwd: root,
    encoding: "utf8",
    shell: true,
    stdio: "inherit",
  });
  if (result.status !== 0) fail(`Command failed: ${command}`);
}

function trackedFilesBelow(sourcePath) {
  const output = run("git", ["ls-tree", "-r", "--name-only", "HEAD", "--", sourcePath], { capture: true });
  return output ? output.split("\n") : [];
}

function scanTrackedFiles(sourcePath) {
  const forbiddenNames = [
    /(^|\/)\.env$/,
    /(^|\/)\.env\.(?:local|deploy|database|analytics|production)$/,
    /(^|\/)id_(?:rsa|ed25519)$/,
    /\.(?:pem|p12|pfx|key)$/,
  ];
  const forbiddenContent = [
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    /(?:DATABASE_URL|SUPABASE_SECRET_KEY|CLOUDFLARE_API_TOKEN|DOKPLOY_PASSWORD|OVH_VPS_PASSWORD)\s*=\s*\S+/i,
    /https?:\/\/[^\s"'/:]+:[^\s"'@]+@/,
    /gh[oprsu]_[A-Za-z0-9_]{20,}/,
  ];

  const failures = [];
  for (const file of trackedFilesBelow(sourcePath)) {
    const relative = path.relative(sourcePath, file);
    if (forbiddenNames.some((pattern) => pattern.test(relative))) {
      failures.push(`${relative}: forbidden secret-bearing filename`);
      continue;
    }

    const absolute = path.join(root, file);
    if (!existsSync(absolute) || statSync(absolute).size > 2_000_000) continue;
    const content = readFileSync(absolute);
    if (content.includes(0)) continue;
    const text = content.toString("utf8");
    if (forbiddenContent.some((pattern) => pattern.test(text))) {
      failures.push(`${relative}: possible embedded credential`);
    }
  }

  if (failures.length) {
    console.error("Public repository secret scan failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }
}

if (!repoName) {
  fail("Usage: node scripts/version127/repos/publish-open-repo.mjs <repo-name> [--push]");
}

const configPath = path.join(root, "repos", repoName, "version127-repository.json");
if (!existsSync(configPath)) fail(`Missing repository configuration: ${configPath}`);

const config = JSON.parse(readFileSync(configPath, "utf8"));
const expectedSourcePath = `repos/${repoName}`;
if (config.sourcePath !== expectedSourcePath) fail(`sourcePath must be ${expectedSourcePath}`);
if (!String(config.nameWithOwner).startsWith("version127/")) fail("Public repositories must belong to the version127 organization.");
if (config.visibility !== "public") fail("Open repository configuration must use public visibility.");
if (!config.defaultBranch) fail("defaultBranch is required.");
if (existsSync(path.join(root, config.sourcePath, ".git"))) fail("Nested .git directories are not allowed under repos/.");

const status = run("git", ["status", "--porcelain"], { capture: true });
if (status) fail("Commit the private repository changes before creating a public subtree commit.");

runShell(config.syncCheck);
runShell(config.qualityCheck);
scanTrackedFiles(config.sourcePath);

const subtreeCommit = run(
  "git",
  ["subtree", "split", `--prefix=${config.sourcePath}`, "HEAD"],
  { capture: true },
);

console.log(`Public subtree is ready: ${config.nameWithOwner}@${subtreeCommit}`);

if (!shouldPush) {
  console.log(`Dry run complete. Add --push to publish ${config.defaultBranch}.`);
  process.exit(0);
}

run("git", [
  "push",
  `git@github.com:${config.nameWithOwner}.git`,
  `${subtreeCommit}:refs/heads/${config.defaultBranch}`,
]);
console.log(`Published ${config.nameWithOwner} ${config.defaultBranch} at ${subtreeCommit}.`);
