#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
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

const applyReviewedUsage = "--apply-reviewed";
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

async function loadRequirementReviews(path) {
  if (!path) return new Map();
  const payload = JSON.parse(await readFile(path, "utf8"));
  if (!Array.isArray(payload.reviews)) throw new Error("Requirement review file must contain a reviews array");
  return new Map(payload.reviews.map((review) => [review.slug, review]));
}

function applyRequirementReview(record, reviews) {
  const review = reviews.get(record.app.slug);
  if (!review) {
    return {
      ...record,
      facts: { ...record.facts, ramMinMb: null, ramRecommendedMb: null, storageMinGb: null },
    };
  }
  return {
    ...record,
    requirementReview: review,
    facts: {
      ...record.facts,
      ramMinMb: review.ram_min_mb ?? null,
      ramRecommendedMb: review.ram_recommended_mb ?? null,
      storageMinGb: review.storage_min_gb ?? null,
    },
  };
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

function technicalStatusFor(record, checkedAt) {
  const { facts } = record;
  const sourceUrl = record.readmeUrl ?? record.checkedUrl;
  const composeUrl = record.composeUrl ?? sourceUrl;
  const existing = record.app.technical_fact_status ?? {};
  const status = (key, newlyPublished, known, url, note) => ({
    status: known ? "published" : existing[key]?.status === "published" ? "published" : "not_published",
    source_urls: unique([...(existing[key]?.source_urls ?? []), url]),
    confidence: newlyPublished ? "high" : existing[key]?.confidence ?? "low",
    checked_at: checkedAt,
    note: newlyPublished ? note : existing[key]?.note ?? note,
  });
  return {
    ram: status(
      "ram",
      facts.ramMinMb !== null || facts.ramRecommendedMb !== null,
      facts.ramMinMb !== null || facts.ramRecommendedMb !== null ||
        record.app.ram_min_mb !== null || record.app.ram_recommended_mb !== null || record.app.ram_default_limit_mb !== null,
      sourceUrl,
      "Official primary source checked for RAM.",
    ),
    storage: status(
      "storage",
      facts.storageMinGb !== null || facts.persistentStorage,
      facts.storageMinGb !== null || facts.persistentStorage || record.app.storage_min_gb !== null ||
        record.app.storage_profile !== "unknown" || record.app.persistent_storage === true,
      sourceUrl,
      "Official primary source checked for storage.",
    ),
    database: status(
      "database",
      facts.databaseTypes.length > 0,
      facts.databaseTypes.length > 0 || record.app.requires_database !== null || (record.app.database_types ?? []).length > 0,
      composeUrl,
      "Official deployment checked for datastore services.",
    ),
    docker: status(
      "docker",
      facts.dockerSupport,
      facts.dockerSupport || record.app.docker_support !== "unknown",
      composeUrl,
      "Official primary source checked for Docker support.",
    ),
    docker_image: status(
      "docker_image",
      Boolean(facts.dockerImage),
      Boolean(facts.dockerImage || record.app.docker_image),
      composeUrl,
      "Official primary source checked for a prebuilt image.",
    ),
    compose: status(
      "compose",
      facts.composeSupport,
      facts.composeSupport || record.app.compose_support !== null,
      composeUrl,
      "Official primary source checked for Compose support.",
    ),
  };
}

function sourcesFor(record, checkedAt) {
  return Object.values(technicalStatusFor(record, checkedAt)).flatMap((status) => status.source_urls);
}

async function applyRecord(client, record, checkedAt) {
  const { app, facts } = record;
  const databaseTypes = unique([...(app.database_types ?? []), ...facts.databaseTypes])
    .map((value) => value === "postgresql" ? "postgres" : value);
  const deploymentMethods = unique([
    ...(app.deployment_methods ?? []),
    ...(facts.dockerSupport ? ["docker"] : []),
    ...(facts.composeSupport ? ["compose"] : []),
  ]);

  await client.query(
    `
      update public.self_host_apps
      set docker_support = case when docker_support = 'unknown' and $2 then 'official' else docker_support end,
          docker_image = coalesce(docker_image, $3),
          deployment_methods = $4::text[],
          compose_support = case when $5 then true else compose_support end,
          compose_url = coalesce(compose_url, $6),
          requires_database = case when cardinality($7::text[]) > 0 then true else requires_database end,
          database_types = $7::text[],
          ram_min_mb = coalesce(ram_min_mb, $8),
          ram_recommended_mb = coalesce(ram_recommended_mb, $9),
          storage_min_gb = coalesce(storage_min_gb, $10),
          persistent_storage = case when $11 then true else persistent_storage end,
          resource_requirement_kind = case
            when $8 is not null then 'official_minimum'
            when $9 is not null then 'official_recommended'
            else resource_requirement_kind
          end,
          technical_facts_checked_at = $12,
          technical_fact_status = $13::jsonb,
          data_source_urls = coalesce((
            select array_agg(distinct url order by url)
            from unnest(coalesce(data_source_urls, '{}') || $14::text[]) as values(url)
          ), '{}'),
          data_checked_at = $12,
          data_confidence = case when $13::jsonb @> '{"ram":{"confidence":"high"}}'::jsonb then 'high' else data_confidence end,
          updated_at = now()
      where id = $1
    `,
    [
      app.id,
      facts.dockerSupport,
      facts.dockerImage,
      deploymentMethods,
      facts.composeSupport,
      record.composeUrl,
      databaseTypes,
      facts.ramMinMb,
      facts.ramRecommendedMb,
      facts.storageMinGb,
      facts.persistentStorage,
      checkedAt,
      JSON.stringify(technicalStatusFor(record, checkedAt)),
      sourcesFor(record, checkedAt),
    ],
  );
}

async function main() {
  const args = parseArgs();
  const applyReviewed = Boolean(args["apply-reviewed"]);
  // --refresh-all intentionally rechecks every published app, including rows with an existing audit status.
  const refreshAll = Boolean(args["refresh-all"]);
  if (applyReviewed && !args["requirements-file"]) {
    throw new Error("--apply-reviewed requires --requirements-file so parsed numeric requirements are never published without editorial review");
  }
  const requirementReviews = await loadRequirementReviews(args["requirements-file"]);
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
  const passed = collected
    .filter((record) => record.ok)
    .map((record) => applyRequirementReview(record, requirementReviews));
  const failed = collected.filter((record) => !record.ok).map((record) => ({ slug: record.app.slug, error: record.error }));

  if (applyReviewed) {
    await withClient(async (client) => {
      await client.query("begin");
      try {
        for (const record of passed) await applyRecord(client, record, checkedAt);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }, args["database-url"]);
  }

  const factCounts = {};
  for (const record of passed) {
    for (const [key, value] of Object.entries(record.facts)) {
      if (value !== null && value !== false && (!Array.isArray(value) || value.length > 0)) factCounts[key] = (factCounts[key] ?? 0) + 1;
    }
  }
  const report = {
    checked_at: checkedAt,
    mode: applyReviewed ? "applied" : "dry_run",
    requirements_file: args["requirements-file"] ?? null,
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
    preview: passed.slice(0, 30).map((record) => ({ slug: record.app.slug, checked_url: record.checkedUrl, facts: record.facts })),
  };
  if (args.out) await writeFile(args.out, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  console.error(`Use ${applyReviewedUsage} only after reviewing the dry-run evidence.`);
  process.exit(1);
});
