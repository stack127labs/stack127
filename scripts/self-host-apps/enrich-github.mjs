#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { collectGitHubAppFacts, parseRepo } from "./lib/github.mjs";
import { parseArgs, readJson, repoRoot } from "./lib/content-schema.mjs";

function usage() {
  console.error("Usage: npm run selfhost:github -- --file content/apps/name.json [--repo owner/name]");
}

function repoFromApp(app, explicitRepo) {
  if (explicitRepo) return parseRepo(explicitRepo);
  if (app.github?.owner && app.github?.repo) {
    return { owner: app.github.owner, repo: app.github.repo };
  }
  if (app.links?.source_code_url?.includes("github.com/")) {
    return parseRepo(app.links.source_code_url);
  }
  throw new Error("No GitHub repo found. Add github.owner/github.repo, source_code_url, or pass --repo owner/name.");
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.file) {
    usage();
    process.exit(1);
  }

  const filePath = args.file;
  const app = await readJson(filePath);
  const repo = repoFromApp(app, args.repo);
  const facts = await collectGitHubAppFacts(`${repo.owner}/${repo.repo}`);

  app.github = facts.github;
  app.last_checked_at = facts.checkedAt;
  app.license = app.license || facts.inferred.license;
  app.maintenance = {
    ...(app.maintenance ?? {}),
    last_release_at: facts.github.latest_release_at,
    last_commit_at: facts.github.last_commit_at,
  };

  if (!app.links?.source_code_url) {
    app.links = { ...(app.links ?? {}), source_code_url: facts.repoData.html_url };
  }

  app.automation = {
    ...(app.automation ?? {}),
    last_github_refresh: facts.checkedAt,
    github_refresh_candidates: {
      icon_urls: facts.inferred.icon_candidates,
      screenshots: facts.inferred.image_candidates,
      readme_links: facts.inferred.readme_links,
      readme_link_candidates: facts.inferred.readme_link_candidates,
      dockerfiles: facts.inferred.dockerfiles,
      compose_files: facts.inferred.compose_files,
      docs_files: facts.inferred.docs_files,
      package_files: facts.inferred.package_files,
    },
  };

  await writeFile(filePath, `${JSON.stringify(app, null, 2)}\n`);
  console.log(`Updated GitHub facts in ${filePath.replace(`${repoRoot}/`, "")}`);
  console.log(`Stars: ${app.github.stars ?? "unknown"}`);
  console.log(`Latest release: ${app.github.latest_release ?? "none"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
