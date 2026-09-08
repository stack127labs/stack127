#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";
import { parseComposeFacts } from "./lib/catalog-facts.mjs";
import { withClient } from "./lib/db.mjs";
import { mapConcurrent } from "./lib/http.mjs";
import {
  dockerHubImage,
  likelyAppImageFromCompose,
  likelyAppImageFromText,
  parsePublishedRequirements,
  readmeContainerSupport,
} from "./lib/primary-facts.mjs";

const readmePaths = ["README.md", "README", "README.rst", "docs/README.md"];
const composePaths = [
  "docker-compose.yml",
  "docker-compose.yaml",
  "compose.yml",
  "compose.yaml",
  "docker/docker-compose.yml",
  "docker/docker-compose.yaml",
  "deploy/docker-compose.yml",
  "deployment/docker-compose.yml",
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function githubRepository(value) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    if (url.hostname !== "github.com" || parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/i, "") };
  } catch {
    return null;
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "stack127-self-host-primary-facts/1.0" },
    redirect: "follow",
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return { text: (await response.text()).slice(0, 500_000), url: response.url };
}

function rawGithubUrl(value) {
  try {
    const url = new URL(value);
    const parts = url.pathname.split("/").filter(Boolean);
    const blobIndex = parts.indexOf("blob");
    if (url.hostname !== "github.com" || blobIndex !== 2 || parts.length < 5) return value;
    return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.slice(blobIndex + 1).join("/")}`;
  } catch {
    return value;
  }
}

async function firstGithubFile(repository, paths) {
  for (const file of paths) {
    const url = `https://raw.githubusercontent.com/${repository.owner}/${repository.repo}/HEAD/${file}`;
    try {
      const result = await fetchText(url);
      return { ...result, file };
    } catch {
      // Conventional official paths are checked in order.
    }
  }
  return null;
}

async function firstOfficialUrl(urls) {
  for (const url of unique(urls)) {
    try {
      return await fetchText(url);
    } catch {
      // Try the next official URL before reporting an unreviewable row.
    }
  }
  return null;
}

async function collect(app) {
  const repository = githubRepository(app.source_code_url);
  let readme = null;
  let compose = null;
  let dockerPage = null;
  let fallback = null;
  let checkedUrl = app.install_docs_url ?? app.docs_url ?? app.docker_url ?? app.source_code_url ?? app.website_url;

  if (repository) {
    [readme, compose, dockerPage] = await Promise.all([
      firstGithubFile(repository, readmePaths),
      app.compose_url
        ? fetchText(rawGithubUrl(app.compose_url)).catch(() => firstGithubFile(repository, composePaths))
        : firstGithubFile(repository, composePaths),
      app.docker_url && app.docker_url !== app.compose_url
          ? fetchText(rawGithubUrl(app.docker_url)).catch(() => null)
          : null,
    ]);
    if (!readme && !compose && !dockerPage) {
      fallback = await firstOfficialUrl([
        app.install_docs_url,
        app.docs_url,
        app.docker_url,
        app.website_url,
        app.source_code_url,
      ]);
    }
    checkedUrl = readme?.url ?? compose?.url ?? dockerPage?.url ?? fallback?.url ?? checkedUrl;
  } else {
    fallback = await firstOfficialUrl([
      app.install_docs_url,
      app.docs_url,
      app.docker_url,
      app.compose_url,
      app.website_url,
      app.source_code_url,
    ]);
    readme = fallback;
    checkedUrl = fallback?.url ?? checkedUrl;
  }

  if (!readme && !compose && !dockerPage && !fallback) throw new Error("No official primary source could be read");
  const primaryText = [readme?.text, dockerPage?.text, fallback?.text].filter(Boolean).join("\n");
  const requirements = parsePublishedRequirements(primaryText);
  const readmeContainers = readmeContainerSupport(primaryText);
  const composeFacts = compose ? parseComposeFacts(compose.text) : {
    databaseTypes: [],
    dockerImage: null,
    persistentStorage: false,
  };
  const registryImage = dockerHubImage(app.docker_url);
  const textImage = likelyAppImageFromText(`${readme?.text ?? ""}\n${dockerPage?.text ?? ""}`, app);

  return {
    app,
    checkedUrl,
    readmeUrl: readme?.url ?? dockerPage?.url ?? compose?.url ?? fallback?.url ?? checkedUrl,
    composeUrl: compose?.url ?? null,
    facts: {
      composeSupport: Boolean(compose || readmeContainers.compose),
      databaseTypes: composeFacts.databaseTypes,
      dockerImage: registryImage ?? (compose ? likelyAppImageFromCompose(compose.text, app) : null) ?? likelyAppImageFromText(primaryText, app) ?? textImage,
      dockerSupport: Boolean(compose || readmeContainers.docker),
      persistentStorage: composeFacts.persistentStorage,
      ...requirements,
    },
  };
}

async function main() {
  const args = parseArgs();
  if (args["apply-reviewed"] || args.apply) throw new Error("This command collects evidence only; --apply-reviewed and --apply are not supported. Apply source-reviewed field corrections with apply-qa-overrides.mjs.");
  // --refresh-all intentionally rechecks every published app, including rows with an existing audit status.
  const refreshAll = Boolean(args["refresh-all"]);
  if (args["requirements-file"]) throw new Error("--requirements-file no longer authorizes changes. Use the reviewed field-correction workflow.");
  const checkedAt = new Date().toISOString();
  const technicalGapPredicate = refreshAll
    ? "true"
    : `(
            coalesce(app.technical_fact_status -> 'ram' ->> 'status', 'unchecked') = 'unchecked'
            or coalesce(app.technical_fact_status -> 'storage' ->> 'status', 'unchecked') = 'unchecked'
            or coalesce(app.technical_fact_status -> 'database' ->> 'status', 'unchecked') = 'unchecked'
            or coalesce(app.technical_fact_status -> 'docker' ->> 'status', 'unchecked') = 'unchecked'
            or coalesce(app.technical_fact_status -> 'docker_image' ->> 'status', 'unchecked') = 'unchecked'
            or coalesce(app.technical_fact_status -> 'compose' ->> 'status', 'unchecked') = 'unchecked'
          )`;
  const rows = await withClient(async (client) => {
    const result = await client.query(
      `
        select app.id, app.slug, app.name, app.source_code_url, app.website_url,
               app.docs_url, app.install_docs_url, app.docker_url, app.docker_image,
               app.docker_support, app.compose_url, app.compose_support, app.requires_database,
               app.database_types, app.ram_min_mb, app.ram_recommended_mb, app.ram_default_limit_mb,
               app.storage_min_gb, app.storage_profile, app.persistent_storage,
               app.deployment_methods,
               app.technical_fact_status
        from public.self_host_apps app
        where app.published = true
          and app.self_hosting_status = 'self_hostable'
          and ${technicalGapPredicate}
        order by app.slug
      `,
    );
    return result.rows;
  }, args["database-url"]);

  const collected = await mapConcurrent(rows, Number(args.concurrency ?? 8), async (app) => {
    try {
      return { ok: true, ...(await collect(app)) };
    } catch (error) {
      return { ok: false, app, error: error.message };
    }
  });
  const passed = collected.filter((record) => record.ok);
  const failed = collected.filter((record) => !record.ok).map((record) => ({ slug: record.app.slug, error: record.error }));

  const factCounts = {};
  for (const record of passed) {
    for (const [key, value] of Object.entries(record.facts)) {
      if (value !== null && value !== false && (!Array.isArray(value) || value.length > 0)) factCounts[key] = (factCounts[key] ?? 0) + 1;
    }
  }
  const report = {
    checked_at: checkedAt,
    mode: "evidence_only",
    selected: rows.length,
    passed: passed.length,
    failed,
    facts: factCounts,
    requirements: passed
      .filter((record) => record.facts.ramMinMb !== null || record.facts.ramRecommendedMb !== null || record.facts.storageMinGb !== null)
      .map((record) => ({ slug: record.app.slug, source_url: record.readmeUrl, facts: record.facts })),
    images: passed
      .filter((record) => record.facts.dockerImage)
      .map((record) => ({ slug: record.app.slug, source_url: record.composeUrl ?? record.checkedUrl, image: record.facts.dockerImage })),
    records: passed.map((record) => ({ slug: record.app.slug, review_status: "pending", checked_url: record.checkedUrl, readme_url: record.readmeUrl, compose_url: record.composeUrl, candidate_facts: record.facts })),
  };
  if (args.out) await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
