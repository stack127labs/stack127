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

const reviewedFlag = "--apply-reviewed";

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

function fieldSources(facts, checkedAt) {
  const rows = [];
  const add = (fieldName, sourceUrl, note, confidence = "medium") => {
    if (!sourceUrl) return;
    rows.push({ fieldName, sourceUrl, note, confidence });
  };

  if (facts.dockerImage) add("docker_image", facts.dockerSourceUrl, "Exact image declared by a reviewed appliance package.");
  add("docker_support", facts.dockerSourceUrl, "Reviewed appliance package supplies a container deployment.");
  if (facts.composeSupport) {
    add("compose_support", facts.composeSourceUrl, "Reviewed appliance package supplies a Compose file.");
    add("compose_url", facts.composeSourceUrl, "Compose file from the reviewed appliance package.");
  } else {
    add("compose_support", facts.dockerSourceUrl, "Checked package source did not provide a portable Compose file; value remains unknown.", "low");
  }

  if (facts.databaseTypes.length > 0) {
    add("requires_database", facts.databaseSourceUrl, `Package declares datastore services: ${facts.databaseTypes.join(", ")}.`);
    add("database_types", facts.databaseSourceUrl, `Datastore services declared by the package: ${facts.databaseTypes.join(", ")}.`);
  } else {
    add("requires_database", facts.databaseSourceUrl, "Checked package declares no separate datastore service; embedded storage remains possible.", "low");
    add("database_types", facts.databaseSourceUrl, "Checked package declares no named datastore service.", "low");
  }

  if (facts.memoryLimitMb) {
    add("ram_default_limit_mb", facts.ramSourceUrl, "Default package memory cap. This is not an app minimum.");
  } else {
    add("ram_min_mb", facts.ramSourceUrl, "Checked package does not publish an app RAM minimum.", "low");
  }

  if (facts.persistentStorage) {
    add("persistent_storage", facts.storageSourceUrl, "Package declares persistent storage without a fixed capacity.");
  } else {
    add("storage_min_gb", facts.storageSourceUrl, "Checked package does not publish a storage minimum.", "low");
  }

  if (facts.releaseVersion) add("release_version", facts.releaseSourceUrl, "Package version mapped to the upstream app version.");
  if (facts.releasePublishedAt) add("release_published_at", facts.releaseSourceUrl, "Package catalog update time.");
  return rows.map((row) => ({ ...row, checkedAt }));
}

async function writeFacts(client, app, facts, sources, checkedAt) {
  const databaseTypes = normalizeDatabaseTypes([...app.database_types, ...facts.databaseTypes]);
  const deploymentMethods = unique([
    ...app.deployment_methods,
    ...(facts.dockerImage ? ["docker"] : []),
    ...(facts.composeSupport ? ["compose"] : []),
  ]);

  await client.query(
    `
      update public.self_host_apps
      set docker_image = coalesce(docker_image, $2),
          docker_support = case when docker_support = 'unknown' and $2 is not null then 'community' else docker_support end,
          deployment_methods = $3::text[],
          compose_support = case when $4::boolean is true then true else compose_support end,
          compose_url = coalesce(compose_url, $5),
          requires_database = case when cardinality($6::text[]) > 0 then true else requires_database end,
          database_types = $6::text[],
          ram_default_limit_mb = coalesce(ram_default_limit_mb, $7),
          persistent_storage = case when $8::boolean is true then true else persistent_storage end,
          release_version = coalesce(release_version, $9),
          release_published_at = coalesce(release_published_at, $10),
          release_checked_at = case when $9 is not null then $11 else release_checked_at end,
          technical_facts_checked_at = $11,
          updated_at = now()
      where id = $1
    `,
    [
      app.id,
      facts.dockerImage,
      deploymentMethods,
      facts.composeSupport,
      facts.composeUrl,
      databaseTypes,
      facts.memoryLimitMb,
      facts.persistentStorage,
      facts.releaseVersion,
      facts.releasePublishedAt,
      checkedAt,
    ],
  );

  if (sources.length > 0) {
    await client.query(
      `
        insert into public.self_host_app_field_sources (
          app_id, field_name, source, source_url, confidence, checked_at, note
        )
        select $1, source_record.field_name, 'official_appliance_catalog',
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
      [
        app.id,
        JSON.stringify(sources.map((source) => ({
          field_name: source.fieldName,
          source_url: source.sourceUrl,
          confidence: source.confidence,
          checked_at: source.checkedAt,
          note: source.note,
        }))),
      ],
    );
  }
}

async function main() {
  const args = parseArgs();
  const applyReviewed = Boolean(args["apply-reviewed"]);
  if (args["dry-run"] && applyReviewed) throw new Error("Use either --dry-run or --apply-reviewed, not both.");

  const checkedAt = new Date().toISOString();
  const result = await withClient(async (client) => {
    const rows = await client.query(
      `
        select app.id, app.slug, app.name, app.database_types, app.deployment_methods,
               source.source, source.source_url, source.payload
        from public.self_host_apps app
        join public.self_host_app_sources source on source.app_id = app.id
        where app.published = true
          and app.self_hosting_status = 'self_hostable'
          and source.source in ('truenas_apps', 'umbrel_apps')
        order by app.slug, source.source
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
      current.sources.push(row);
      apps.set(row.id, current);
    }

    await client.query("begin");
    const report = { checked: 0, updated: 0, failed: [], facts: {} };
    try {
      for (const app of apps.values()) {
        try {
          const evidence = [];
          for (const source of app.sources) {
            if (source.source === "umbrel_apps") evidence.push(await umbrelEvidence(source, args["umbrel-dir"]));
            if (source.source === "truenas_apps") evidence.push(await trueNasEvidence(source, args["truenas-dir"]));
          }
          const facts = mergeEvidence(evidence);
          const sources = fieldSources(facts, checkedAt);
          report.checked += 1;
          for (const [key, value] of Object.entries(facts)) {
            if (value !== null && value !== false && (!Array.isArray(value) || value.length > 0) && !key.endsWith("SourceUrl")) {
              report.facts[key] = (report.facts[key] ?? 0) + 1;
            }
          }
          if (applyReviewed) await writeFacts(client, app, facts, sources, checkedAt);
          report.updated += 1;
        } catch (error) {
          report.failed.push({ slug: app.slug, error: error.message });
        }
      }

      if (applyReviewed) await client.query("commit");
      else await client.query("rollback");
      return report;
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);

  const output = {
    checked_at: checkedAt,
    mode: applyReviewed ? "applied" : "dry_run",
    ...result,
  };
  if (args.out) await writeFile(args.out, `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
  if (result.failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  console.error(`Use ${reviewedFlag} only after reviewing the dry-run report.`);
  process.exit(1);
});
