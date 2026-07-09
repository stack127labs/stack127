#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { copyFileTree, ensureDir, loadRepoEnv, parseArgs, requireArg, run } from "./lib.mjs";

function renderTemplate(text, values) {
  return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => values[key] ?? "");
}

function renderTree(dir, values) {
  const entries = ["README.md", "package.json", "docker-compose.yml", "Dockerfile", ".env.example"];
  for (const entry of entries) {
    const filePath = path.join(dir, entry);
    if (!existsSync(filePath)) continue;
    writeFileSync(filePath, renderTemplate(readFileSync(filePath, "utf8"), values));
  }
}

function ensureGithubEnv() {
  loadRepoEnv();
  if (!process.env.GH_TOKEN && process.env.GITHUB_TOKEN) {
    process.env.GH_TOKEN = process.env.GITHUB_TOKEN;
  }
}

async function main() {
  const args = parseArgs();
  const slug = requireArg(args, "slug");
  const name = requireArg(args, "name");
  const org = String(args.org ?? process.env.VERSION127_GITHUB_ORG ?? "version127");
  const outDir = path.resolve(String(args.out ?? path.join("/tmp", slug)));
  const templateDir = path.resolve(String(args.template ?? "templates/github-tool"));
  const fullName = `${org}/${slug}`;

  if (!existsSync(templateDir)) {
    throw new Error(`Tool template not found: ${templateDir}`);
  }

  ensureDir(outDir);
  copyFileTree(templateDir, outDir);
  renderTree(outDir, {
    TOOL_NAME: name,
    TOOL_SLUG: slug,
    VERSION127_URL: `https://version127.com/tools/${slug}`,
    REPOSITORY_URL: `https://github.com/${fullName}`,
  });

  console.log(`Rendered tool repo scaffold: ${outDir}`);

  if (!args["create-repo"]) return;
  ensureGithubEnv();

  if (args["dry-run"]) {
    console.log(`Dry run: would create ${fullName} and push ${outDir}.`);
    return;
  }

  run("gh", [
    "repo",
    "create",
    fullName,
    "--public",
    "--description",
    `${name} by Version127.`,
    "--homepage",
    `https://version127.com/tools/${slug}`,
    "--source",
    outDir,
    "--remote",
    "origin",
    "--push",
  ]);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
