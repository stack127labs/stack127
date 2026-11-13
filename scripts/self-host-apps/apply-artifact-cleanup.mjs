#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { withClient } from "./lib/db.mjs";
import { parseArgs } from "./lib/args.mjs";
import { resolveDatabaseUrl } from "../stack127/tool-pages/lib.mjs";

const manifestPath = new URL("./artifact-cleanup-manifest.json", import.meta.url);

/**
 * Check the flags and pick the database with the shared resolver: `.env.local` for
 * development, `.env.database` for production. Production needs the shared confirm
 * value even for a preview, so a preview can't reach production by accident.
 */
export function cleanupOptions(args) {
  const environment = args.environment;
  if (!["development", "production"].includes(environment)) {
    throw new Error("Pass --environment development or --environment production.");
  }
  if (environment === "production" && args.confirm !== "stack127-production") {
    throw new Error("Production requires --confirm stack127-production, including previews.");
  }
  // The resolver rejects a value on --apply, such as --apply=false.
  const databaseUrl = resolveDatabaseUrl({ environment, apply: args.apply, confirm: args.confirm });
  return { environment, apply: args.apply === true, databaseUrl };
}

function identityMatches(row, expected) {
  if (!row) return false;
  return row.slug === expected.slug && row.name === expected.name && row.source_code_url === expected.source_code_url;
}

export function targetSources(row) {
  return [row.source_code_url, row.website_url, row.docs_url, row.install_docs_url, row.docker_url, row.compose_url, ...(row.data_source_urls ?? [])]
    .filter((value) => typeof value === "string");
}

function stateFor(record, targetRows, canonicalRows, manifest) {
  const target = targetRows.get(record.slug);
  const canonicalSpec = record.canonical_slug
    ? manifest.canonical_apps.find((item) => item.slug === record.canonical_slug)
    : null;
  const canonical = canonicalSpec ? canonicalRows.get(canonicalSpec.slug) : null;
  const identityOk = identityMatches(target, record);
  const canonicalIdentityOk = !canonicalSpec || (
    canonical && canonical.slug === canonicalSpec.slug && canonicalSpec.expected_names.includes(canonical.name) &&
    canonical.source_code_url === canonicalSpec.source_code_url
  );
  const requiredSources = target ? targetSources(target) : [];
  const mergedSourcesOk = !canonicalSpec || requiredSources.every((url) => canonical.data_source_urls?.includes(url));
  const nameOk = !canonicalSpec?.clean_name || canonical?.name === canonicalSpec.clean_name;
  const alreadyClean = identityOk && canonicalIdentityOk && !target.published && mergedSourcesOk && nameOk;
  return {
    slug: record.slug,
    kind: record.kind,
    current_name: target?.name ?? null,
    current_source_code_url: target?.source_code_url ?? null,
    current_docker_image: target?.docker_image ?? null,
    published: target?.published ?? null,
    identity_ok: identityOk,
    canonical_slug: record.canonical_slug ?? null,
    canonical_identity_ok: canonicalIdentityOk,
    canonical_name: canonical?.name ?? null,
    canonical_published: canonical?.published ?? null,
    merged_sources_ok: mergedSourcesOk,
    state: alreadyClean ? "already_clean" : "needs_cleanup",
    error: !target ? "record missing" : !identityOk ? "target identity mismatch" : !canonicalIdentityOk ? "canonical identity mismatch" : null,
  };
}

async function loadRows(client, manifest, lock) {
  const targetSlugs = manifest.records.map((record) => record.slug);
  const canonicalSlugs = manifest.canonical_apps.map((record) => record.slug);
  const targets = await client.query(
    "select * from public.self_host_apps where slug = any($1::text[]) order by slug" + (lock ? " for update" : ""),
    [targetSlugs],
  );
  const canonicals = await client.query(
    "select * from public.self_host_apps where slug = any($1::text[]) order by slug" + (lock ? " for update" : ""),
    [canonicalSlugs],
  );
  return {
    targets: new Map(targets.rows.map((row) => [row.slug, row])),
    canonicals: new Map(canonicals.rows.map((row) => [row.slug, row])),
  };
}

function validateIdentities(manifest, targetRows, canonicalRows) {
  const states = manifest.records.map((record) => stateFor(record, targetRows, canonicalRows, manifest));
  const failures = states.filter((state) => state.error);
  if (failures.length) {
    throw new Error(`Cleanup stopped: unexpected or missing row identity: ${failures.map((row) => `${row.slug} (${row.error})`).join(", ")}`);
  }
  for (const spec of manifest.canonical_apps) {
    const row = canonicalRows.get(spec.slug);
    if (!row || row.slug !== spec.slug || !spec.expected_names.includes(row.name) || row.source_code_url !== spec.source_code_url) {
      throw new Error(`Cleanup stopped: canonical identity mismatch for ${spec.slug}.`);
    }
    if (!row.published || row.self_hosting_status !== "self_hostable") {
      throw new Error(`Cleanup stopped: canonical app ${spec.slug} is not published and self-hostable.`);
    }
  }
  return states;
}

async function applyCleanup(client, manifest, targetRows, canonicalRows) {
  const sourcesByCanonical = new Map();
  for (const record of manifest.records) {
    if (!record.canonical_slug) continue;
    const current = targetRows.get(record.slug);
    const sourceSet = sourcesByCanonical.get(record.canonical_slug) ?? new Set();
    for (const url of targetSources(current)) sourceSet.add(url);
    sourcesByCanonical.set(record.canonical_slug, sourceSet);
  }

  for (const [slug, sources] of sourcesByCanonical) {
    const current = canonicalRows.get(slug);
    const merged = [...new Set([...(current.data_source_urls ?? []), ...sources])].sort();
    const spec = manifest.canonical_apps.find((item) => item.slug === slug);
    const cleanName = spec.clean_name ?? current.name;
    await client.query(
      `update public.self_host_apps
       set data_source_urls=$2::text[], name=$3, updated_at=now()
       where slug=$1 and (data_source_urls is distinct from $2::text[] or name is distinct from $3)`,
      [slug, merged, cleanName],
    );
  }

  await client.query(
    "update public.self_host_apps set published=false, updated_at=now() where slug = any($1::text[]) and published=true",
    [manifest.records.map((record) => record.slug)],
  );
}

async function main() {
  const args = parseArgs();
  const { environment, apply, databaseUrl } = cleanupOptions(args);

  const manifest = JSON.parse(await readFile(args.file ?? manifestPath, "utf8"));
  const targets = new Set(manifest.records.map((row) => row.slug));
  if (targets.size !== manifest.records.length || manifest.canonical_apps.some((row) => targets.has(row.slug))) {
    throw new Error("Cleanup stopped: repeated target or canonical app is also a retirement target.");
  }
  await withClient(async (client) => {
    await client.query(apply ? "begin isolation level serializable" : "begin read only");
    try {
      const { targets, canonicals } = await loadRows(client, manifest, apply);
      const states = validateIdentities(manifest, targets, canonicals);
      console.log(`Artifact cleanup preview (${environment})`);
      for (const state of states) console.log(JSON.stringify(state));
      const needed = states.filter((state) => state.state !== "already_clean");
      if (!apply) {
        await client.query("rollback");
        console.log(`Preview only: ${needed.length} record(s) need cleanup; ${states.length - needed.length} already clean.`);
        return;
      }

      await applyCleanup(client, manifest, targets, canonicals);
      const after = await loadRows(client, manifest, true);
      const finalStates = validateIdentities(manifest, after.targets, after.canonicals);
      const remaining = finalStates.filter((state) => state.state !== "already_clean");
      if (remaining.length) throw new Error(`Cleanup verification failed for ${remaining.map((state) => state.slug).join(", ")}.`);
      await client.query("commit");
      console.log(`Applied cleanup to ${needed.length} record(s); ${states.length - needed.length} were already clean.`);
    } catch (error) {
      await client.query("rollback").catch(() => undefined);
      throw error;
    }
  }, databaseUrl);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
