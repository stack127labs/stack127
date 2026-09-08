#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import {
  parseComposeFacts,
  parseTrueNasImage,
  trueNasDatabaseTypes,
  trueNasMemoryLimit,
  trueNasPersistentStorage,
} from "./lib/catalog-facts.mjs";
import { withClient } from "./lib/db.mjs";


function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeDatabaseTypes(values) {
  return unique(values.map((value) => String(value).toLowerCase() === "postgresql" ? "postgres" : String(value).toLowerCase()));
}

async function optionalRead(file) {
  try {
    return await readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function textFromUrl(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "stack127-self-host-app-catalog-facts/1.0" },
    signal: AbortSignal.timeout(45_000),
  });
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.text();
}

async function umbrelEvidence(source, root) {
  const payload = source.payload ?? {};
  const appId = payload.app_id;
  const composeUrl = payload.compose_url;
  const localPath = root && appId ? path.join(root, appId, "docker-compose.yml") : null;
  const compose = localPath ? await optionalRead(localPath) : null;
  const text = compose ?? (composeUrl ? await textFromUrl(composeUrl) : null);
  if (!text) throw new Error("Umbrel Compose file is unavailable");

  const facts = parseComposeFacts(text);
  return {
    provider: "umbrel_apps",
    sourceUrl: composeUrl ?? source.source_url,
    dockerImage: facts.dockerImage ?? payload.docker_image ?? null,
    composeSupport: true,
    composeUrl: composeUrl ?? source.source_url,
    databaseTypes: facts.databaseTypes,
    persistentStorage: facts.persistentStorage,
    memoryLimitMb: null,
    releaseVersion: payload.version ?? null,
    releasePublishedAt: null,
  };
}

function trueNasVersion(payload, versions) {
  const requested = payload?.raw?.latest_version;
  if (requested && versions[requested]) return requested;
  return Object.keys(versions).sort((left, right) => right.localeCompare(left, undefined, { numeric: true }))[0] ?? null;
}

async function trueNasEvidence(source, root) {
  if (!root) throw new Error("--truenas-dir is required for TrueNAS facts");
  const payload = source.payload ?? {};
  const key = payload.key;
  const train = payload.train;
  if (!key || !train) throw new Error("TrueNAS source payload has no train or key");

  const appRoot = path.join(root, "trains", train, key);
  const versionsText = await readFile(path.join(appRoot, "app_versions.json"), "utf8");
  const versions = JSON.parse(versionsText);
  const version = trueNasVersion(payload, versions);
  const record = version ? versions[version] : null;
  if (!record) throw new Error("TrueNAS source has no usable app version");

  const versionRoot = path.join(appRoot, version);
  const [values, template] = await Promise.all([
    optionalRead(path.join(versionRoot, "ix_values.yaml")),
    optionalRead(path.join(versionRoot, "templates", "docker-compose.yaml")),
  ]);
  const sourceUrl = `https://github.com/truenas/apps/tree/master/trains/${train}/${key}/${version}`;

  return {
    provider: "truenas_apps",
    sourceUrl,
    dockerImage: parseTrueNasImage(values),
    composeSupport: null,
    composeUrl: null,
    databaseTypes: trueNasDatabaseTypes(record.app_metadata, template),
    persistentStorage: trueNasPersistentStorage(record.schema, template),
    memoryLimitMb: trueNasMemoryLimit(record.schema),
    releaseVersion: record.app_metadata?.app_version ?? payload.release_version ?? null,
    releasePublishedAt: record.last_update ?? payload.release_published_at ?? null,
  };
}

function mergeEvidence(records) {
  const umbrel = records.find((record) => record.provider === "umbrel_apps");
  const truenas = records.find((record) => record.provider === "truenas_apps");
  return {
    dockerImage: umbrel?.dockerImage ?? truenas?.dockerImage ?? null,
    composeSupport: umbrel?.composeSupport ?? null,
    composeUrl: umbrel?.composeUrl ?? null,
    databaseTypes: normalizeDatabaseTypes(records.flatMap((record) => record.databaseTypes)),
    persistentStorage: records.some((record) => record.persistentStorage),
    memoryLimitMb: truenas?.memoryLimitMb ?? null,
    releaseVersion: umbrel?.releaseVersion ?? truenas?.releaseVersion ?? null,
    releasePublishedAt: truenas?.releasePublishedAt ?? null,
    dockerSourceUrl: (umbrel?.dockerImage ? umbrel : truenas)?.sourceUrl ?? null,
    composeSourceUrl: umbrel?.sourceUrl ?? null,
    databaseSourceUrl: records.find((record) => record.databaseTypes.length > 0)?.sourceUrl ?? records[0]?.sourceUrl,
    storageSourceUrl: records.find((record) => record.persistentStorage)?.sourceUrl ?? records[0]?.sourceUrl,
    ramSourceUrl: truenas?.sourceUrl ?? records[0]?.sourceUrl,
    releaseSourceUrl: (umbrel?.releaseVersion ? umbrel : truenas)?.sourceUrl ?? null,
  };
}

async function main() {
  const args = parseArgs();
  if (args["apply-reviewed"] || args.apply) throw new Error("This command collects evidence only. Use source-reviewed partial corrections to publish facts.");

  const checkedAt = new Date().toISOString();
  const result = await withClient(async (client) => {
    const rows = await client.query(
      `
        select app.id, app.slug, app.name, app.database_types, app.deployment_methods,
               install.catalog_sources
        from public.self_host_apps app
        join public.self_host_app_install_options install on install.app_id = app.id
        where app.published = true
          and app.self_hosting_status = 'self_hostable'
          and jsonb_array_length(install.catalog_sources) > 0
        order by app.slug
      `,
    );
    const apps = new Map();
    for (const row of rows.rows) {
      const current = apps.get(row.id) ?? {
        id: row.id,
        slug: row.slug,
        name: row.name,
        database_types: row.database_types ?? [],
        deployment_methods: row.deployment_methods ?? [],
        sources: [],
      };
      current.sources.push(...(Array.isArray(row.catalog_sources) ? row.catalog_sources : []));
      apps.set(row.id, current);
    }

    await client.query("begin read only");
    const report = { checked: 0, failed: [], facts: {}, records: [] };
    try {
      for (const app of apps.values()) {
        try {
          const evidence = [];
          for (const source of app.sources) {
            if (source.source === "umbrel_apps") evidence.push(await umbrelEvidence(source, args["umbrel-dir"]));
            if (source.source === "truenas_apps") evidence.push(await trueNasEvidence(source, args["truenas-dir"]));
          }
          const facts = mergeEvidence(evidence);
          report.checked += 1;
          for (const [key, value] of Object.entries(facts)) {
            if (value !== null && value !== false && (!Array.isArray(value) || value.length > 0) && !key.endsWith("SourceUrl")) {
              report.facts[key] = (report.facts[key] ?? 0) + 1;
            }
          }
          report.records.push({ slug: app.slug, review_status: "pending", evidence, candidate_facts: facts });
        } catch (error) {
          report.failed.push({ slug: app.slug, error: error.message });
        }
      }

      await client.query("rollback");
      return report;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);

  const output = {
    checked_at: checkedAt,
    mode: "evidence_only",
    ...result,
  };
  if (args.out) await writeFile(args.out, `${JSON.stringify(output, null, 2)}\n`, { flag: "wx" });
  console.log(JSON.stringify(output, null, 2));
  if (result.failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
