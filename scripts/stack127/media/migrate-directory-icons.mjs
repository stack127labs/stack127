#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

import {
  contentDigest,
  extensionForContentType,
  imageContentType,
  loadMediaEnv,
  mediaObjectPath,
  uploadMediaObject,
} from "./storage.mjs";

const { Pool } = pg;

const catalogs = {
  "cli-apps": {
    localPrefix: "/cli-app-icons/",
    table: "public.terminal_apps",
  },
  "self-host-apps": {
    localPrefix: "/app-icons/",
    table: "public.self_host_apps",
  },
};

function parseArgs(argv = process.argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      index += 1;
    }
  }
  return args;
}

async function mapConcurrent(items, workerCount, callback) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await callback(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(workerCount, items.length || 1) }, () => worker()));
  return results;
}

function databasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required");
  return new Pool({ connectionString, max: 4, connectionTimeoutMillis: 15_000 });
}

async function loadRows(pool, selectedCatalogs) {
  const rows = [];
  for (const catalog of selectedCatalogs) {
    const config = catalogs[catalog];
    const result = await pool.query(
      `select id, slug, icon_url from ${config.table} where icon_url like $1 order by slug`,
      [`${config.localPrefix}%`],
    );
    rows.push(...result.rows.map((row) => ({ ...row, catalog, ...config })));
  }
  return rows;
}

async function prepareRow(row, { assetRoot, dryRun }) {
  const relativePath = row.icon_url.slice(1);
  const sourceFile = path.resolve(assetRoot, "public", relativePath.replace(/^public\//, ""));
  const expectedRoot = path.resolve(assetRoot, "public", row.localPrefix.slice(1));
  if (!sourceFile.startsWith(`${expectedRoot}${path.sep}`)) throw new Error(`unsafe local icon path: ${row.icon_url}`);
  const bytes = await readFile(sourceFile);
  const contentType = imageContentType(bytes);
  const extension = extensionForContentType(contentType);
  const objectPath = mediaObjectPath({
    directory: row.catalog,
    digest: contentDigest(bytes),
    extension,
    kind: "icons",
    slug: row.slug,
  });
  const iconUrl = dryRun
    ? `dry-run://${objectPath}`
    : await uploadMediaObject({ bytes, contentType, objectPath });
  return { ...row, iconUrl, objectPath, sourceFile };
}

async function updateRows(pool, rows) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const [catalog, config] of Object.entries(catalogs)) {
      const catalogRows = rows.filter((row) => row.catalog === catalog);
      if (catalogRows.length === 0) continue;
      const result = await client.query(
        `
          update ${config.table} app
          set icon_url = media.icon_url, updated_at = now()
          from jsonb_to_recordset($1::jsonb) as media(id uuid, old_icon_url text, icon_url text)
          where app.id = media.id and app.icon_url = media.old_icon_url
        `,
        [JSON.stringify(catalogRows.map((row) => ({
          id: row.id,
          old_icon_url: row.icon_url,
          icon_url: row.iconUrl,
        })))],
      );
      if (result.rowCount !== catalogRows.length) {
        throw new Error(`${catalog} changed while media was uploading: expected ${catalogRows.length}, updated ${result.rowCount}`);
      }
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  const args = parseArgs();
  const requested = args.catalog ?? "all";
  const selectedCatalogs = requested === "all" ? Object.keys(catalogs) : [requested];
  for (const catalog of selectedCatalogs) {
    if (!catalogs[catalog]) throw new Error(`unknown catalog: ${catalog}`);
  }

  loadMediaEnv();
  const dryRun = Boolean(args["dry-run"]);
  const assetRoot = path.resolve(args["asset-root"] ?? process.cwd());
  const workers = Math.max(1, Math.min(Number(args.workers) || 16, 32));
  const pool = databasePool();
  try {
    const rows = await loadRows(pool, selectedCatalogs);
    console.log(JSON.stringify({ catalogs: selectedCatalogs, dry_run: dryRun, rows: rows.length }));
    let completed = 0;
    const prepared = await mapConcurrent(rows, workers, async (row) => {
      const result = await prepareRow(row, { assetRoot, dryRun });
      completed += 1;
      if (completed % 100 === 0 || completed === rows.length) {
        console.log(`prepared ${completed}/${rows.length}`);
      }
      return result;
    });

    if (!dryRun) await updateRows(pool, prepared);
    console.log(JSON.stringify({ migrated: dryRun ? 0 : prepared.length, prepared: prepared.length, dry_run: dryRun }));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
