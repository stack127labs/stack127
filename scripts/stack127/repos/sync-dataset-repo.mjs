#!/usr/bin/env node

import { existsSync } from "node:fs";
import path from "node:path";
import { copyFileTree, ensureDir, loadRepoEnv, parseArgs, run } from "./lib.mjs";

function repoFullName(args) {
  const org = String(args.org ?? process.env.STACK127_GITHUB_ORG ?? "stack127labs");
  const repo = String(args.repo ?? process.env.STACK127_DATASET_REPO ?? "stack127-datasets");
  return `${org}/${repo}`;
}

function ensureGithubEnv() {
  loadRepoEnv();
  if (!process.env.GH_TOKEN && process.env.GITHUB_TOKEN) {
    process.env.GH_TOKEN = process.env.GITHUB_TOKEN;
  }
}

function gitHasChanges(cwd) {
  const result = run("git", ["status", "--porcelain"], { cwd, capture: true });
  return (result.stdout ?? "").trim().length > 0;
}

function cloneOrUpdate(fullName, checkoutDir) {
  if (existsSync(path.join(checkoutDir, ".git"))) {
    run("git", ["pull", "--ff-only"], { cwd: checkoutDir });
    return;
  }

  ensureDir(path.dirname(checkoutDir));
  run("gh", ["repo", "clone", fullName, checkoutDir]);
}

async function main() {
  const args = parseArgs();
  ensureGithubEnv();

  const fullName = repoFullName(args);
  const createRepo = Boolean(args["create-repo"]);
  const dryRun = Boolean(args["dry-run"]);
  const sourceDir = path.resolve(String(args.source ?? args.out ?? "/tmp/stack127-datasets"));
  const checkoutDir = path.resolve(String(args.checkout ?? `/tmp/${fullName.replace("/", "-")}`));

  if (!existsSync(sourceDir)) {
    throw new Error(`Export directory does not exist: ${sourceDir}`);
  }

  try {
    run("gh", ["repo", "view", fullName, "--json", "name", "--jq", ".name"], {
      capture: true,
    });
  } catch (error) {
    if (!createRepo) throw error;
    if (dryRun) {
      console.log(`Dry run: would create GitHub repo ${fullName}.`);
      return;
    }
    try {
      run("gh", [
        "repo",
        "create",
        fullName,
        "--public",
        "--description",
        "Open CSV datasets for self-host apps, homelab software, and open-source tools from Stack127.",
        "--homepage",
        "https://stack127.com",
      ]);
    } catch (createError) {
      throw new Error(
        [
          createError.message,
          "",
          `Could not create ${fullName}. Create an empty public repo in the stack127 org, or use a token whose resource owner/access is the stack127 organization and whose repository permissions include Administration: read/write. A fine-grained token scoped only to personal repositories owned by RaviTejaKNTS can read the org but cannot create stack127 repos.`,
        ].join("\n"),
      );
    }
  }

  cloneOrUpdate(fullName, checkoutDir);
  copyFileTree(sourceDir, checkoutDir);

  if (!gitHasChanges(checkoutDir)) {
    console.log(`No dataset changes to sync for ${fullName}.`);
    return;
  }

  run("git", ["diff", "--stat"], { cwd: checkoutDir });

  if (dryRun) {
    console.log(`Dry run: dataset changes prepared at ${checkoutDir}.`);
    return;
  }

  run("git", ["add", "README.md", "LICENSE", "CONTRIBUTING.md", "self-host-apps/README.md", "self-host-apps/apps.csv"], {
    cwd: checkoutDir,
  });
  run("git", ["commit", "-m", "Update Stack127 datasets"], { cwd: checkoutDir });
  run("git", ["push"], { cwd: checkoutDir });
  console.log(`Synced ${fullName}.`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
