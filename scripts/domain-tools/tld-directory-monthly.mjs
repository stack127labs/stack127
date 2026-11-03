#!/usr/bin/env node

/**
 * Monthly check behind /tld-directory. Run by a homelab timer; see
 * scripts/domain-tools/systemd/.
 *
 * Refreshes the datasets the directory reads in a throwaway checkout of main.
 * If a real fact changed, it opens one pull request for review. If only dates
 * and version numbers moved, it does nothing. Any failure exits non-zero, which
 * the automation monitor shows.
 *
 * --dry-run stops before the commit. --base <ref> checks out another ref.
 */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const BRANCH = "chore/tld-directory-refresh";
const DATA_DIR = "lib/domain/data";
const DATA_FILES = ["tlds.json", "rdap-bootstrap.json", "whois-servers.json", "whois-reviewed.json", "tld-directory.json"];
// These move on most runs without any fact changing.
const VOLATILE_KEYS = new Set(["fetchedAt", "version", "publication", "tldListVersion"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const baseIndex = args.indexOf("--base");
const base = baseIndex === -1 ? "origin/main" : args[baseIndex + 1];

const run = (command, commandArgs, cwd) =>
  execFileSync(command, commandArgs, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], maxBuffer: 1 << 28 });

const facts = (text) =>
  JSON.stringify(Object.fromEntries(Object.entries(JSON.parse(text)).filter(([key]) => !VOLATILE_KEYS.has(key))));

function listChange(before, after) {
  const was = new Set(JSON.parse(before).tlds);
  const now = new Set(JSON.parse(after).tlds);
  return { added: [...now].filter((tld) => !was.has(tld)), removed: [...was].filter((tld) => !now.has(tld)) };
}

function refresh(tree) {
  const script = (name) => path.join("scripts/domain-tools", name);
  const node = process.execPath;
  run(node, ["--experimental-strip-types", script("refresh-datasets.mjs")], tree);
  // That script also refreshes data the directory doesn't read. Leave it for its own release.
  const others = run("git", ["diff", "--name-only", "--", DATA_DIR], tree)
    .split("\n")
    .filter((file) => file && !DATA_FILES.includes(path.basename(file)));
  if (others.length) run("git", ["checkout", "--", ...others], tree);
  run(node, ["--experimental-strip-types", script("refresh-tld-directory.mjs")], tree);
}

function changedFiles(tree) {
  return DATA_FILES.filter((file) => {
    const relative = path.posix.join(DATA_DIR, file);
    const before = run("git", ["show", `HEAD:${relative}`], tree);
    return facts(before) !== facts(readFileSync(path.join(tree, relative), "utf8"));
  });
}

function pullRequestBody(tree, changed) {
  const tlds = path.posix.join(DATA_DIR, "tlds.json");
  const { added, removed } = listChange(run("git", ["show", `HEAD:${tlds}`], tree), readFileSync(path.join(tree, tlds), "utf8"));
  const lines = ["The monthly TLD directory check found changes in IANA's data.", "", "Changed files:", ...changed.map((file) => `- \`${file}\``)];
  if (added.length) lines.push("", `New endings: ${added.map((tld) => `\`.${tld}\``).join(", ")}. Check whether they need reviewed RDAP or WHOIS servers.`);
  if (removed.length) lines.push("", `Removed endings: ${removed.map((tld) => `\`.${tld}\``).join(", ")}.`);
  lines.push("", "Review the data diff and merge to update /tld-directory. Merging deploys.");
  return lines.join("\n");
}

function publish(tree, changed) {
  run("git", ["switch", "--quiet", "-c", BRANCH], tree);
  run("git", ["add", "--", ...DATA_FILES.map((file) => path.posix.join(DATA_DIR, file))], tree);
  const month = new Date().toISOString().slice(0, 7);
  run("git", ["commit", "--quiet", "-m", `Update TLD directory data (${month})`], tree);
  run("git", ["push", "--quiet", "--force", "origin", `HEAD:refs/heads/${BRANCH}`], tree);
  const open = run("gh", ["pr", "list", "--head", BRANCH, "--state", "open", "--json", "number", "--jq", "length"], tree).trim();
  if (open !== "0") {
    console.log(`Updated the open pull request on ${BRANCH}.`);
    return;
  }
  const url = run("gh", ["pr", "create", "--base", "main", "--head", BRANCH, "--title", `Update TLD directory data (${month})`, "--body", pullRequestBody(tree, changed)], tree).trim();
  console.log(`Opened ${url}`);
}

const repo = run("git", ["rev-parse", "--show-toplevel"], process.cwd()).trim();
const parent = mkdtempSync(path.join(tmpdir(), "stack127-tld-"));
const tree = path.join(parent, "tree");

try {
  if (baseIndex === -1) run("git", ["fetch", "--quiet", "origin", "main"], repo);
  run("git", ["worktree", "add", "--quiet", "--detach", tree, base], repo);
  refresh(tree);
  const changed = changedFiles(tree);
  if (!changed.length) {
    console.log("No TLD directory facts changed. Nothing to do.");
  } else if (dryRun) {
    console.log(`Dry run. Would open a pull request:\n${pullRequestBody(tree, changed)}`);
  } else {
    publish(tree, changed);
  }
} finally {
  try {
    run("git", ["worktree", "remove", "--force", tree], repo);
  } finally {
    rmSync(parent, { recursive: true, force: true });
  }
}
