#!/usr/bin/env node

// Replace self-host app category links from a reviewed category file.
// Only category links change. Each app must still have the categories the
// reviewer saw (`expected.categories`), so a later edit is never overwritten.
// Rolls back unless --apply is given.

import { readFile } from "node:fs/promises";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { databaseOptions } from "./lib/environment.mjs";
import { selfHostAppCategorySlugs } from "./lib/categories.mjs";

const usage = "Usage: node scripts/self-host-apps/apply-category-review.mjs --environment development|production [--confirm stack127-production] --file reviewed.json [--apply] [--skip-changed]";

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export function checkReviewedRecord(record) {
  if (typeof record?.slug !== "string" || !record.slug) throw new Error("Each record needs a slug");
  const { categories } = record;
  if (!Array.isArray(categories) || categories.length < 1 || categories.length > 3) {
    throw new Error(`${record.slug}: use one to three categories`);
  }
  if (new Set(categories).size !== categories.length) throw new Error(`${record.slug}: repeated category`);
  for (const slug of categories) {
    if (!selfHostAppCategorySlugs.has(slug)) throw new Error(`${record.slug}: unknown category ${slug}`);
  }
  if (!Array.isArray(record.expected?.categories)) throw new Error(`${record.slug}: expected.categories is required`);
}

async function main() {
  const args = parseArgs();
  if (!args.file) throw new Error(usage);
  for (const flag of ["skip-changed"]) {
    if (args[flag] !== undefined && args[flag] !== true) throw new Error(`--${flag} is a flag and does not accept a value`);
  }
  const databaseUrl = databaseOptions(args);
  const input = JSON.parse(await readFile(args.file, "utf8"));
  const records = Array.isArray(input) ? input : input.apps;
  if (!Array.isArray(records) || records.length === 0) throw new Error("The file has no app records");
  const seen = new Set();
  for (const record of records) {
    checkReviewedRecord(record);
    if (seen.has(record.slug)) throw new Error(`${record.slug}: listed twice`);
    seen.add(record.slug);
  }

  const summary = { checked: 0, updated: 0, unchanged: 0, linksRemoved: 0, linksAdded: 0, missing: [], changedSinceReview: [] };

  await withClient(async (client) => {
    await client.query("begin");
    try {
      const { rows: categoryRows } = await client.query(
        "select id, slug from public.self_host_app_categories where slug = any($1::text[])",
        [[...selfHostAppCategorySlugs]],
      );
      const categoryIds = new Map(categoryRows.map((row) => [row.slug, row.id]));
      const absent = [...selfHostAppCategorySlugs].filter((slug) => !categoryIds.has(slug));
      if (absent.length) throw new Error(`Missing category rows: ${absent.join(", ")}`);

      for (const record of records) {
        summary.checked += 1;
        const app = await client.query("select id from public.self_host_apps where slug = $1 for update", [record.slug]);
        if (app.rowCount === 0) {
          summary.missing.push(record.slug);
          continue;
        }
        const appId = app.rows[0].id;
        const current = (await client.query(
          `select category.slug from public.self_host_app_category_links link
           join public.self_host_app_categories category on category.id = link.category_id
           where link.app_id = $1`,
          [appId],
        )).rows.map((row) => row.slug);

        if (sorted(current).join() !== sorted(record.expected.categories).join()) {
          summary.changedSinceReview.push(record.slug);
          continue;
        }
        if (sorted(current).join() === sorted(record.categories).join()) {
          summary.unchanged += 1;
          continue;
        }

        const removed = await client.query(
          `delete from public.self_host_app_category_links link
           using public.self_host_app_categories category
           where link.app_id = $1 and category.id = link.category_id and not (category.slug = any($2::text[]))`,
          [appId, record.categories],
        );
        const added = await client.query(
          `insert into public.self_host_app_category_links (app_id, category_id)
           select $1, id from public.self_host_app_categories where slug = any($2::text[])
           on conflict (app_id, category_id) do nothing`,
          [appId, record.categories],
        );
        summary.linksRemoved += removed.rowCount;
        summary.linksAdded += added.rowCount;
        summary.updated += 1;
      }

      if (summary.missing.length || (summary.changedSinceReview.length && !args["skip-changed"])) {
        throw Object.assign(new Error("Stopped before writing: some apps are missing or changed since review. Use --skip-changed to leave changed apps as they are."), { summary });
      }

      if (args.apply) {
        await client.query("commit");
      } else {
        await client.query("rollback");
      }
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    }
  }, databaseUrl);

  console.log(JSON.stringify({ applied: Boolean(args.apply), ...summary, missing: summary.missing.length, changedSinceReview: summary.changedSinceReview.length, changedSlugs: summary.changedSinceReview.slice(0, 50) }, null, 1));
}

main().catch((error) => {
  if (error.summary) {
    const { summary } = error;
    console.error(JSON.stringify({ missing: summary.missing.slice(0, 50), changedSinceReview: summary.changedSinceReview.length, changedSlugs: summary.changedSinceReview.slice(0, 50) }, null, 1));
  }
  console.error(error.message);
  process.exit(1);
});
