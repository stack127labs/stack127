#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { collectGitHubAppFacts } from "./lib/github.mjs";
import { parseArgs, repoRoot } from "./lib/content-schema.mjs";

function usage() {
  console.error("Usage: npm run selfhost:draft -- --repo owner/name [--out content/app-drafts/name.json] [--overwrite]");
}

function emptyEditorial() {
  return {
    get_started: "",
    verdict: "",
    good_fit: [],
    watch_outs: [],
    known_issues: [],
  };
}

function emptyDeployment(inferred) {
  return {
    deployment_methods: inferred.deployment_methods,
    docker_support: inferred.docker_support,
    compose_support: inferred.compose_support,
    requires_database: null,
    database_types: [],
    requires_redis: null,
    requires_object_storage: null,
    supported_platforms: ["web"],
  };
}

function emptyData() {
  return {
    storage_and_data_notes: "",
    backup_details: "",
    backup_difficulty: "unknown",
    backup_criticality: "unknown",
    raid_notes: "",
  };
}

function buildDraft(facts) {
  const { repo, repoData, checkedAt, github, inferred } = facts;
  const recentCommit = github.last_commit_at ? new Date(github.last_commit_at).getTime() : 0;
  const sixMonthsAgo = Date.now() - 180 * 24 * 60 * 60 * 1000;

  return {
    slug: inferred.slug,
    name: inferred.name,
    description: "",
    status: "draft",
    published: false,
    categories: inferred.category_suggestions.map((category) => category.slug),
    media: {
      icon_url: null,
      icon_source: null,
      screenshots: [],
      youtube_video_url: null,
    },
    editorial: emptyEditorial(),
    links: {
      website_url: inferred.homepage,
      source_code_url: repoData.html_url,
      demo_url: null,
      docker_url: inferred.readme_link_candidates.docker_url,
      install_docs_url: inferred.readme_link_candidates.install_docs_url,
      docs_url: inferred.readme_link_candidates.docs_url,
    },
    deployment: emptyDeployment(inferred),
    resources: {
      ram_required_mb: null,
      ram_recommended_mb: null,
      storage_required_gb: null,
      cpu_notes: null,
      gpu_notes: null,
    },
    data: emptyData(),
    maintenance: {
      actively_maintained: inferred.archived ? false : recentCommit > sixMonthsAgo ? true : null,
      maintenance_status: inferred.archived ? "archived" : recentCommit > sixMonthsAgo ? "active" : "unknown",
      last_release_at: github.latest_release_at,
      last_commit_at: github.last_commit_at,
    },
    license: inferred.license,
    github,
    alternative_app_ids: [],
    replaces_apps: [],
    client_apps: [],
    hardware_recommendations: [],
    data_confidence: "unknown",
    notes: "",
    last_checked_at: checkedAt,
    automation: {
      generated_at: checkedAt,
      source: "github_api",
      repo: `${repo.owner}/${repo.repo}`,
      repo_description: inferred.repo_description,
      topics: inferred.topics,
      primary_language: inferred.primary_language,
      language_hints: inferred.language_hints,
      archived: inferred.archived,
      fork: inferred.fork,
      category_suggestions: inferred.category_suggestions,
      candidates: {
        icon_urls: inferred.icon_candidates,
        screenshots: inferred.image_candidates,
        readme_links: inferred.readme_links,
        readme_link_candidates: inferred.readme_link_candidates,
        dockerfiles: inferred.dockerfiles,
        compose_files: inferred.compose_files,
        docs_files: inferred.docs_files,
        package_files: inferred.package_files,
      },
      manual_checklist: [
        "Write original description, get_started, verdict, storage/data notes, backup details, and raid notes.",
        "Verify website, docs, install docs, Docker image, screenshots, client apps, and YouTube video manually.",
        "Keep useful candidates and delete wrong or unverified candidate values before moving to content/apps.",
      ],
    },
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (!args.repo) {
    usage();
    process.exit(1);
  }

  const facts = await collectGitHubAppFacts(args.repo);
  const draft = buildDraft(facts);
  const outPath = path.resolve(repoRoot, args.out ?? `content/app-drafts/${draft.slug}.generated.json`);

  await mkdir(path.dirname(outPath), { recursive: true });

  const flag = args.overwrite ? "w" : "wx";
  await writeFile(outPath, `${JSON.stringify(draft, null, 2)}\n`, { flag });

  console.log(`Created draft: ${path.relative(repoRoot, outPath)}`);
  console.log(`Suggested categories: ${draft.categories.length ? draft.categories.join(", ") : "none"}`);
  console.log(`GitHub stars: ${draft.github.stars ?? "unknown"}`);
  if (draft.automation.candidates.screenshots.length) {
    console.log(`Screenshot candidates: ${draft.automation.candidates.screenshots.length}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
