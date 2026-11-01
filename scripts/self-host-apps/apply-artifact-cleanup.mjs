#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { withClient } from "./lib/db.mjs";
import { parseArgs } from "./lib/args.mjs";

const manifestPath = new URL("./artifact-cleanup-manifest.json", import.meta.url);
const developmentProjectRef = "yzasonowwlvritqicatj";

function readEnvFile(path) {
  const source = requireEnvText(path);
  return Object.fromEntries(source.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return [];
    const index = trimmed.indexOf("=");
    if (index < 0) return [];
    return [[trimmed.slice(0, index).trim(), trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "")]];
  }));
}

function requireEnvText(path) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    throw new Error(`Could not read ${path}. Run this command from the repository root.`);
  }
}

function databaseConfig(environment) {
  const file = environment === "production" ? ".env.database" : ".env.local";
  const env = readEnvFile(file);
  const siteUrl = new URL(env.SUPABASE_URL ?? "");
  const projectRef = siteUrl.hostname.endsWith(".supabase.co")
    ? siteUrl.hostname.slice(0, -".supabase.co".length)
    : "";
  const connectionString = env.DATABASE_POOLER_URL || env.DATABASE_URL;
  if (!connectionString || !projectRef) throw new Error(`${file} must contain SUPABASE_URL and a database URL.`);

  const connection = new URL(connectionString);
  const username = decodeURIComponent(connection.username);
  const isDirect = connection.hostname === `db.${projectRef}.supabase.co`;
  const isPooler = connection.hostname.endsWith(".pooler.supabase.com") && username.includes(projectRef);
  if (!isDirect && !isPooler) throw new Error(`${file} database URL does not match its Supabase project URL.`);
  if (environment === "development" && projectRef !== developmentProjectRef) {
    throw new Error("Development cleanup requires the managed development project in .env.local.");
  }
  if (environment === "production" && projectRef === developmentProjectRef) {
    throw new Error("Production cleanup refuses the development project.");
  }
  return connectionString;
}

function identityMatches(row, expected) {
  if (!row) return false;
  return row.slug === expected.slug && row.name === expected.name && row.source_code_url === expected.source_code_url;
}

function targetSources(row) {
  return [row.source_code_url, row.website_url, row.docs_url, row.install_docs_url, row.docker_url]
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
  const environment = args.environment;
  if (!["development", "production"].includes(environment)) {
    throw new Error("Pass --environment development or --environment production.");
  }
  if (args.apply && environment === "production" && !args["confirm-reviewed-cleanup"]) {
    throw new Error("Production apply requires --confirm-reviewed-cleanup.");
  }
  if (args["confirm-reviewed-cleanup"] && environment !== "production") {
    throw new Error("--confirm-reviewed-cleanup is only valid with --environment production.");
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const databaseUrl = databaseConfig(environment);
  await withClient(async (client) => {
    await client.query(args.apply ? "begin isolation level serializable" : "begin read only");
    try {
      const { targets, canonicals } = await loadRows(client, manifest, Boolean(args.apply));
      const states = validateIdentities(manifest, targets, canonicals);
      console.log(`Artifact cleanup preview (${environment})`);
      for (const state of states) console.log(JSON.stringify(state));
      const needed = states.filter((state) => state.state !== "already_clean");
      if (!args.apply) {
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

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
