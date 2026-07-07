#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const githubApiBase = "https://api.github.com";
const ignoredProofPathPattern =
  /(^|\/)(\.github|\.ci|\.devcontainer|dev|vendor|test|tests|testing|ci|e2e(?:[-_][^/]*)?|fixtures?|examples?|docker-compose-examples|test-infrastructure|tests_integration)(\/|$)|devcontainer|dev-container|compose\.dev|docker-compose\.dev|docker-compose[-.]ci|compose[-.]ci|example|gitpod|\.ddev/i;

const databasePatterns = [
  { type: "postgres", pattern: /\b(postgres|postgresql|timescaledb|supabase\/postgres)\b/i },
  { type: "mysql", pattern: /\b(mysql|percona)\b/i },
  { type: "mariadb", pattern: /\bmariadb\b/i },
  { type: "mongodb", pattern: /\b(mongo|mongodb)\b/i },
  { type: "couchdb", pattern: /\bcouchdb\b/i },
  { type: "sqlite", pattern: /\bsqlite\b/i },
  { type: "redis", pattern: /\bredis\b/i },
];

let cachedGithubToken;

function githubToken() {
  if (cachedGithubToken !== undefined) return cachedGithubToken;
  if (process.env.GITHUB_TOKEN) {
    cachedGithubToken = process.env.GITHUB_TOKEN;
    return cachedGithubToken;
  }

  try {
    cachedGithubToken = execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    cachedGithubToken = "";
  }

  return cachedGithubToken;
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "version127-self-host-apps",
  };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function githubJson(pathName, searchParams) {
  const url = new URL(`${githubApiBase}${pathName}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }

  const response = await fetch(url, { headers: githubHeaders() });
  if (response.status === 404) return null;
  if (response.status === 403 || response.status === 429) {
    const reset = response.headers.get("x-ratelimit-reset");
    throw new Error(`GitHub rate limited ${url.href}${reset ? ` until ${reset}` : ""}`);
  }
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${url.href}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/plain,*/*",
      "User-Agent": "version127-self-host-apps",
    },
  });
  if (!response.ok) return "";
  return response.text();
}

function decodeBase64(value) {
  if (!value) return "";
  return Buffer.from(value.replace(/\s+/g, ""), "base64").toString("utf8");
}

function proofUrl(row, filePath) {
  return `https://github.com/${row.github_owner}/${row.github_repo}/blob/HEAD/${filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function rawUrl(row, filePath) {
  return `https://raw.githubusercontent.com/${row.github_owner}/${row.github_repo}/HEAD/${filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function sortProofFiles(files) {
  return [...files].sort((a, b) => {
    const score = (item) => {
      let value = 0;
      if (!item.path.includes("/")) value -= 30;
      if (/^(docker-compose|compose)[^/]*\.ya?ml$/i.test(item.path)) value -= 20;
      if (/(^|\/)(deploy|deployment|docker|compose|docs|install)(\/|$)/i.test(item.path)) value -= 10;
      return value + item.path.length;
    };
    return score(a) - score(b) || a.path.localeCompare(b.path);
  });
}

function isCredibleProofPath(pathName) {
  return !ignoredProofPathPattern.test(pathName);
}

function dockerProofFiles(tree) {
  return sortProofFiles(
    tree.filter((item) => {
      if (item.type !== "blob" || !isCredibleProofPath(item.path)) return false;
      return /(^|\/)(docker-compose|compose)(?:[.-][^/]*)?\.ya?ml$/i.test(item.path) || /(^|\/)(Dockerfile|Containerfile)$/i.test(item.path);
    }),
  );
}

function documentationFiles(tree) {
  return sortProofFiles(
    tree.filter((item) => {
      if (item.type !== "blob" || !isCredibleProofPath(item.path)) return false;
      return /(^|\/)(README|INSTALL|DEPLOY|DEPLOYMENT|docs\/.+|doc\/.+).*\.(md|mdx|rst|txt|ya?ml|env|sample|example)$/i.test(item.path);
    }),
  ).slice(0, 6);
}

function databaseTypesFromText(text) {
  const found = [];
  for (const database of databasePatterns) {
    if (database.pattern.test(text)) found.push(database.type);
  }
  return [...new Set(found)];
}

function strongDatabaseTypesFromText(text) {
  const found = [];
  const checks = [
    { type: "postgres", pattern: /\b(DATABASE_URL|POSTGRES_HOST|POSTGRES_DB|DB_TYPE|DB_DRIVER|DATABASE_TYPE|database_type)\s*[:=]\s*["']?(postgres|postgresql)\b|\brequires?\s+(a\s+)?postgres(?:ql)?\b|\bpostgres(?:ql)?\s+(is\s+)?required\b/i },
    { type: "mysql", pattern: /\b(MYSQL_HOST|MYSQL_DATABASE|DB_TYPE|DB_DRIVER|DATABASE_TYPE|database_type)\s*[:=]\s*["']?mysql\b|\brequires?\s+(a\s+)?mysql\b|\bmysql\s+(is\s+)?required\b/i },
    { type: "mariadb", pattern: /\b(MARIADB_HOST|MARIADB_DATABASE|DB_TYPE|DB_DRIVER|DATABASE_TYPE|database_type)\s*[:=]\s*["']?mariadb\b|\brequires?\s+(a\s+)?mariadb\b|\bmariadb\s+(is\s+)?required\b/i },
    { type: "mongodb", pattern: /\b(MONGO_URL|MONGODB_URI|MONGO_HOST|DB_TYPE|DB_DRIVER|DATABASE_TYPE|database_type)\s*[:=]\s*["']?(mongo|mongodb)\b|\brequires?\s+(a\s+)?mongo(?:db)?\b|\bmongo(?:db)?\s+(is\s+)?required\b/i },
    { type: "couchdb", pattern: /\b(COUCHDB_URL|COUCHDB_HOST|DB_TYPE|DB_DRIVER|DATABASE_TYPE|database_type)\s*[:=]\s*["']?couchdb\b|\brequires?\s+(a\s+)?couchdb\b|\bcouchdb\s+(is\s+)?required\b/i },
    { type: "redis", pattern: /\b(REDIS_URL|REDIS_HOST|CACHE_DRIVER|QUEUE_DRIVER)\s*[:=]\s*["']?redis\b|\brequires?\s+(a\s+)?redis\b|\bredis\s+(is\s+)?required\b/i },
    { type: "sqlite", pattern: /\b(SQLITE_PATH|SQLITE_DATABASE|DB_TYPE|DB_DRIVER|DATABASE_TYPE|database_type)\s*[:=]\s*["']?sqlite\b|\buses?\s+sqlite\b|\bsqlite\s+(database|file)\b/i },
  ];

  for (const check of checks) {
    if (check.pattern.test(text)) found.push(check.type);
  }
  return [...new Set(found)];
}

function mergeDatabaseTypes(existing, detected) {
  return [...new Set([...(existing ?? []), ...detected])];
}

function externalDatabaseTypes(types) {
  return types.filter((type) => !["sqlite"].includes(type));
}

function inferDatabaseFact({ existingTypes, composeTexts, documentationTexts }) {
  const detected = [
    ...composeTexts.flatMap((text) => databaseTypesFromText(text)),
    ...documentationTexts.flatMap((text) => strongDatabaseTypesFromText(text)),
  ];
  const merged = mergeDatabaseTypes(existingTypes, detected);
  const external = externalDatabaseTypes(merged);

  if (external.length > 0) {
    return {
      requires_database: true,
      database_types: merged,
      confidence: "medium",
      note: `Detected separate datastore reference: ${external.join(", ")}.`,
    };
  }

  if (merged.length === 1 && merged[0] === "sqlite") {
    return {
      requires_database: false,
      database_types: merged,
      confidence: "medium",
      note: "Detected SQLite-only datastore reference.",
    };
  }

  return null;
}

async function analyzeRow(row) {
  const treeData = await githubJson(`/repos/${row.github_owner}/${row.github_repo}/git/trees/HEAD`, { recursive: 1 });
  const tree = Array.isArray(treeData?.tree) ? treeData.tree : [];
  const readme = await githubJson(`/repos/${row.github_owner}/${row.github_repo}/readme`);
  const readmeText = decodeBase64(readme?.content);
  const proofFiles = dockerProofFiles(tree);
  const composeFiles = proofFiles.filter((item) => /(^|\/)(docker-compose|compose)(?:[.-][^/]*)?\.ya?ml$/i.test(item.path));
  const dockerFile = proofFiles.find((item) => /(^|\/)(Dockerfile|Containerfile)$/i.test(item.path));
  const selectedDockerProof = composeFiles[0] ?? dockerFile ?? null;
  const documentation = documentationFiles(tree);
  const documentationTexts = [readmeText];
  const composeTexts = [];

  for (const file of composeFiles.slice(0, 2)) {
    const text = await fetchText(rawUrl(row, file.path));
    if (text) composeTexts.push(text.slice(0, 120_000));
  }

  for (const file of documentation.slice(0, 3)) {
    const text = await fetchText(rawUrl(row, file.path));
    if (text) documentationTexts.push(text.slice(0, 120_000));
  }

  const updates = {};
  const sources = [];
  const checkedAt = new Date().toISOString();

  if (selectedDockerProof && row.docker_support === "unknown") {
    updates.docker_support = "official";
    updates.docker_url = row.docker_url ?? proofUrl(row, selectedDockerProof.path);
    updates.compose_support = composeFiles.length > 0 ? true : false;
    for (const field of ["docker_support", "docker_url", "compose_support"]) {
      sources.push({
        field_name: field,
        source_url: proofUrl(row, selectedDockerProof.path),
        confidence: "medium",
        note: `Repository contains deployment proof file ${selectedDockerProof.path}.`,
      });
    }
  }

  if (row.requires_database === null) {
    const databaseFact = inferDatabaseFact({ existingTypes: row.database_types, composeTexts, documentationTexts });
    if (databaseFact) {
      updates.requires_database = databaseFact.requires_database;
      updates.database_types = databaseFact.database_types;
      for (const field of ["requires_database", "database_types"]) {
        sources.push({
          field_name: field,
          source_url: composeFiles[0] ? proofUrl(row, composeFiles[0].path) : row.repository_url,
          confidence: databaseFact.confidence,
          note: databaseFact.note,
        });
      }
    }
  }

  if (!row.license || String(row.license).toLowerCase() === "unknown") {
    const license = await githubJson(`/repos/${row.github_owner}/${row.github_repo}/license`);
    const spdx = license?.license?.spdx_id && license.license.spdx_id !== "NOASSERTION" ? license.license.spdx_id : null;
    if (spdx) {
      updates.license = spdx;
      sources.push({
        field_name: "license",
        source_url: license.html_url ?? row.repository_url,
        confidence: "high",
        note: "GitHub license endpoint returned a SPDX license id.",
      });
    }
  }

  return {
    slug: row.slug,
    updates,
    sources: sources.map((source) => ({ ...source, checked_at: checkedAt })),
  };
}

async function selectRows(client, args) {
  const limit = numberArg(args, "limit", 200);
  const offset = numberArg(args, "offset", 0);
  const params = [limit, offset];
  const result = await client.query(
    `
      select
        slug,
        repository_url,
        docker_url,
        docker_support,
        compose_support,
        requires_database,
        database_types,
        license,
        github_owner,
        github_repo
      from public.self_host_apps
      where published = true
        and repository_url ~ '^https://github.com/[^/]+/[^/#?]+/?$'
        and github_owner is not null
        and github_repo is not null
        and (
          docker_support = 'unknown'
          or requires_database is null
          or license is null
          or lower(license) = 'unknown'
        )
      order by coalesce(github_stars, 0) desc, slug
      limit $1 offset $2
    `,
    params,
  );
  return result.rows;
}

async function applyUpdates(client, result) {
  const columns = Object.keys(result.updates);
  if (columns.length === 0) return;

  const values = columns.map((column) => result.updates[column]);
  const assignments = columns.map((column, index) => {
    const parameter = `$${index + 2}`;
    if (["database_types"].includes(column)) return `${column} = ${parameter}::text[]`;
    return `${column} = ${parameter}`;
  });

  await client.query(
    `
      update public.self_host_apps
      set ${assignments.join(", ")},
          updated_at = now()
      where slug = $1
    `,
    [result.slug, ...values],
  );

  const appResult = await client.query("select id from public.self_host_apps where slug = $1", [result.slug]);
  const appId = appResult.rows[0]?.id;
  if (!appId) return;

  for (const source of result.sources) {
    await client.query(
      `
        insert into public.self_host_apps_field_sources (
          app_id,
          field_name,
          source,
          source_url,
          confidence,
          checked_at,
          note
        )
        values ($1, $2, 'version127_github_fact_refine', $3, $4, $5, $6)
        on conflict (app_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [appId, source.field_name, source.source_url, source.confidence, source.checked_at, source.note],
    );
  }
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);
  const out = {
    mode: dryRun ? "dry-run" : "write",
    selected: 0,
    checked: 0,
    changed: 0,
    fields: {},
    failed: [],
  };

  await withClient(async (client) => {
    const rows = await selectRows(client, args);
    out.selected = rows.length;

    await client.query("begin");
    for (const row of rows) {
      try {
        const result = await analyzeRow(row);
        out.checked += 1;
        const fields = Object.keys(result.updates);
        if (fields.length > 0) {
          out.changed += 1;
          for (const field of fields) out.fields[field] = (out.fields[field] ?? 0) + 1;
          await applyUpdates(client, result);
          console.log(`refined ${row.slug}: ${fields.join(", ")}`);
        } else {
          console.log(`checked ${row.slug}: no verified missing facts`);
        }
      } catch (error) {
        out.failed.push({ slug: row.slug, error: error.message });
        console.warn(`warning ${row.slug}: ${error.message}`);
      }
    }

    if (dryRun) await client.query("rollback");
    else await client.query("commit");
  }, args["database-url"]);

  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
