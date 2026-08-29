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

async function collect(app) {
  const repository = githubRepository(app.source_code_url);
  let readme = null;
  let compose = null;
  let dockerPage = null;
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
    checkedUrl = readme?.url ?? compose?.url ?? checkedUrl;
  } else if (checkedUrl) {
    try {
      readme = await fetchText(checkedUrl);
    } catch {
      readme = null;
    }
  }

  if (!readme && !compose) throw new Error("No official primary source could be read");
  const requirements = parsePublishedRequirements(readme?.text);
  const readmeContainers = readmeContainerSupport(readme?.text);
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
    readmeUrl: readme?.url ?? checkedUrl,
    composeUrl: compose?.url ?? null,
    facts: {
      composeSupport: Boolean(compose || readmeContainers.compose),
      databaseTypes: composeFacts.databaseTypes,
      dockerImage: registryImage ?? (compose ? likelyAppImageFromCompose(compose.text, app) : null) ?? textImage,
      dockerSupport: Boolean(compose || readmeContainers.docker),
      persistentStorage: composeFacts.persistentStorage,
      ...requirements,
    },
  };
}

function sourcesFor(record, checkedAt) {
  const { app, facts } = record;
  const sourceUrl = record.readmeUrl ?? record.checkedUrl;
  const composeUrl = record.composeUrl ?? sourceUrl;
  const sources = [];
  const add = (fieldName, url, confidence, note) => {
    if (url) sources.push({ field_name: fieldName, source_url: url, confidence, checked_at: checkedAt, note });
  };

  if (!app.ram_researched) {
    if (facts.ramMinMb !== null) add("ram_min_mb", sourceUrl, "high", "Explicit minimum RAM requirement in the official primary source.");
    else if (facts.ramRecommendedMb !== null) add("ram_recommended_mb", sourceUrl, "high", "Explicit recommended RAM requirement in the official primary source.");
    else add("ram_min_mb", sourceUrl, "low", "Official primary source checked; no explicit RAM minimum was found, so the value remains null.");
  }
  if (!app.storage_researched) {
    if (facts.storageMinGb !== null) add("storage_min_gb", sourceUrl, "high", "Explicit minimum storage requirement in the official primary source.");
    else if (facts.persistentStorage) add("persistent_storage", composeUrl, "high", "Official deployment file declares persistent storage without a fixed capacity.");
    else add("storage_min_gb", sourceUrl, "low", "Official primary source checked; no explicit storage minimum was found, so the value remains null.");
  }
  if (!app.database_researched) {
    if (facts.databaseTypes.length > 0) {
      add("requires_database", composeUrl, "high", `Official deployment declares datastore services: ${facts.databaseTypes.join(", ")}.`);
      add("database_types", composeUrl, "high", `Datastore services declared by the official deployment: ${facts.databaseTypes.join(", ")}.`);
    } else {
      add("requires_database", sourceUrl, "low", "Official primary source checked; no separate datastore service was found, so the value remains null.");
      add("database_types", sourceUrl, "low", "Official primary source checked; no named datastore was found.");
    }
  }
  if (!app.docker_researched) {
    if (facts.dockerSupport) add("docker_support", composeUrl, "high", "Official primary source documents a container deployment.");
    else add("docker_support", sourceUrl, "low", "Official primary source checked; supported Docker deployment was not found, so the value remains unknown.");
    if (facts.dockerImage) add("docker_image", composeUrl, "high", "Exact app image declared by the official deployment file.");
  }
  if (app.docker_support === "official" && !app.docker_image && !app.docker_image_researched) {
    if (facts.dockerImage) add("docker_image", composeUrl, "high", "Exact app image declared by the official deployment source.");
    else add("docker_image", composeUrl, "low", "Official Docker and Compose sources checked; no exact prebuilt app image was published.");
  }
  if (!app.compose_researched) {
    if (facts.composeSupport) add("compose_support", composeUrl, "high", "Official primary source supplies or documents Compose deployment.");
    else add("compose_support", sourceUrl, "low", "Official primary source checked; supported Compose deployment was not found, so the value remains null.");
    if (record.composeUrl) add("compose_url", record.composeUrl, "high", "Official Compose deployment file.");
  }
  return sources;
}

async function applyRecord(client, record, sources, checkedAt) {
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
    ],
  );

  if (sources.length === 0) return;
  await client.query(
    `
      insert into public.self_host_app_field_sources (
        app_id, field_name, source, source_url, confidence, checked_at, note
      )
      select $1, source_record.field_name, 'official_primary_source_audit',
             source_record.source_url, source_record.confidence,
             source_record.checked_at, source_record.note
      from jsonb_to_recordset($2::jsonb) as source_record(
        field_name text,
        source_url text,
        confidence text,
        checked_at timestamptz,
        note text
      )
      on conflict (app_id, field_name) do update set
        source = excluded.source,
        source_url = excluded.source_url,
        confidence = excluded.confidence,
        checked_at = excluded.checked_at,
        note = excluded.note
      where self_host_app_field_sources.confidence in ('unknown', 'low')
         or excluded.confidence = 'high'
    `,
    [app.id, JSON.stringify(sources)],
  );
}

async function main() {
  const args = parseArgs();
  const applyReviewed = Boolean(args["apply-reviewed"]);
  if (applyReviewed && !args["requirements-file"]) {
    throw new Error("--apply-reviewed requires --requirements-file so parsed numeric requirements are never published without editorial review");
  }
  const requirementReviews = await loadRequirementReviews(args["requirements-file"]);
  const checkedAt = new Date().toISOString();
  const rows = await withClient(async (client) => {
    const result = await client.query(
      `
        select app.id, app.slug, app.name, app.source_code_url, app.website_url,
               app.docs_url, app.install_docs_url, app.docker_url, app.docker_image,
               app.docker_support, app.compose_url, app.database_types,
               app.deployment_methods,
               exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('ram_mb', 'ram_min_mb', 'ram_recommended_mb', 'ram_default_limit_mb')) as ram_researched,
               exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('storage_profile', 'storage_min_gb', 'persistent_storage')) as storage_researched,
               exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('requires_database', 'database_types')) as database_researched,
               exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('docker_support', 'docker_image')) as docker_researched,
               exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name = 'docker_image') as docker_image_researched,
               exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('compose_support', 'compose_url')) as compose_researched
        from public.self_host_apps app
        where app.published = true
          and app.self_hosting_status = 'self_hostable'
          and (
            not exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('ram_mb', 'ram_min_mb', 'ram_recommended_mb', 'ram_default_limit_mb'))
            or not exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('storage_profile', 'storage_min_gb', 'persistent_storage'))
            or not exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('requires_database', 'database_types'))
            or not exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('docker_support', 'docker_image'))
            or not exists (select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name in ('compose_support', 'compose_url'))
            or (app.docker_support = 'official' and app.docker_image is null and not exists (
              select 1 from public.self_host_app_field_sources f where f.app_id = app.id and f.field_name = 'docker_image'
            ))
          )
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
        for (const record of passed) await applyRecord(client, record, sourcesFor(record, checkedAt), checkedAt);
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
