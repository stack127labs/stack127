#!/usr/bin/env node

// Replace self-host app category links from a reviewed category file.
// Only category links change. An app must still have the categories the
// reviewer saw (`expected.categories`); apps that already match the review
// are skipped, so reruns are safe. Work runs in short batches. Each batch
// locks the link table against other writers, rechecks its apps, and rolls
// back unless --apply is given.

import { readFile } from "node:fs/promises";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { databaseOptions } from "./lib/environment.mjs";
import { selfHostAppCategorySlugs } from "./lib/categories.mjs";

const usage = "Usage: node scripts/self-host-apps/apply-category-review.mjs --environment development|production [--confirm stack127-production] --file reviewed.json [--apply] [--skip-changed] [--batch-size 100]";

const key = (values) => [...values].sort((a, b) => a.localeCompare(b)).join(",");

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

// "apply": current matches the review's starting point. "done": already reviewed.
// "changed": someone edited the app's categories after the review.
export function classify(record, current) {
  if (current === undefined) return "missing";
  if (key(current) === key(record.categories)) return "done";
  if (key(current) === key(record.expected.categories)) return "apply";
  return "changed";
}

async function currentCategories(client, slugs, lock = false) {
  if (lock) await client.query("select id from public.self_host_apps where slug = any($1::text[]) order by id for update", [slugs]);
  const { rows } = await client.query(
    `select app.slug,
       coalesce(array_agg(category.slug) filter (where category.slug is not null), '{}') as categories
     from public.self_host_apps app
     left join public.self_host_app_category_links link on link.app_id = app.id
     left join public.self_host_app_categories category on category.id = link.category_id
     where app.slug = any($1::text[])
     group by app.slug`,
    [slugs],
  );
  return new Map(rows.map((row) => [row.slug, row.categories]));
}

async function main() {
  const args = parseArgs();
  if (!args.file) throw new Error(usage);
  if (args["skip-changed"] !== undefined && args["skip-changed"] !== true) throw new Error("--skip-changed is a flag and does not accept a value");
  const databaseUrl = databaseOptions(args);
  const batchSize = numberArg(args, "batch-size", 100);
  const input = JSON.parse(await readFile(args.file, "utf8"));
  const records = Array.isArray(input) ? input : input.apps;
  if (!Array.isArray(records) || records.length === 0) throw new Error("The file has no app records");
  const seen = new Set();
  for (const record of records) {
    checkReviewedRecord(record);
    if (seen.has(record.slug)) throw new Error(`${record.slug}: listed twice`);
    seen.add(record.slug);
  }

  const summary = { applied: Boolean(args.apply), records: records.length, updated: 0, alreadyDone: 0, linksRemoved: 0, linksAdded: 0, missing: [], changedSinceReview: [] };

  await withClient(async (client) => {
    const { rows: categoryRows } = await client.query("select slug from public.self_host_app_categories where slug = any($1::text[])", [[...selfHostAppCategorySlugs]]);
    const absent = [...selfHostAppCategorySlugs].filter((slug) => !categoryRows.some((row) => row.slug === slug));
    if (absent.length) throw new Error(`Missing category rows: ${absent.join(", ")}`);

    // Preflight without locks: stop before any write if the review is stale.
    const before = await currentCategories(client, records.map((record) => record.slug));
    const pending = [];
    for (const record of records) {
      const state = classify(record, before.get(record.slug));
      if (state === "missing") summary.missing.push(record.slug);
      else if (state === "changed") summary.changedSinceReview.push(record.slug);
      else if (state === "done") summary.alreadyDone += 1;
      else pending.push(record);
    }
    if (summary.missing.length || (summary.changedSinceReview.length && !args["skip-changed"])) {
      throw Object.assign(new Error("Stopped before writing: some apps are missing or changed since review. Use --skip-changed to leave changed apps as they are."), { summary });
    }

    for (let start = 0; start < pending.length; start += batchSize) {
      const batch = pending.slice(start, start + batchSize);
      await client.query("begin");
      try {
        await client.query("set local lock_timeout = '5s'");
        await client.query("set local statement_timeout = '120s'");
        await client.query("lock table public.self_host_app_category_links in share row exclusive mode");
        const now = await currentCategories(client, batch.map((record) => record.slug), true);
        for (const record of batch) {
          const state = classify(record, now.get(record.slug));
          if (state === "done") { summary.alreadyDone += 1; continue; }
          if (state !== "apply") {
            if (!args["skip-changed"] || state === "missing") throw new Error(`${record.slug}: ${state} during the run; nothing in this batch was written`);
            summary.changedSinceReview.push(record.slug);
            continue;
          }
          const removed = await client.query(
            `delete from public.self_host_app_category_links link
             using public.self_host_apps app, public.self_host_app_categories category
             where app.slug = $1 and link.app_id = app.id and category.id = link.category_id
               and not (category.slug = any($2::text[]))`,
            [record.slug, record.categories],
          );
          const added = await client.query(
            `insert into public.self_host_app_category_links (app_id, category_id)
             select app.id, category.id
             from public.self_host_apps app, public.self_host_app_categories category
             where app.slug = $1 and category.slug = any($2::text[])
             on conflict (app_id, category_id) do nothing`,
            [record.slug, record.categories],
          );
          summary.linksRemoved += removed.rowCount;
          summary.linksAdded += added.rowCount;
          summary.updated += 1;
        }
        await client.query(args.apply ? "commit" : "rollback");
      } catch (error) {
        await client.query("rollback").catch(() => {});
        throw Object.assign(error, { summary });
      }
      console.error(`${args.apply ? "Applied" : "Checked"} ${Math.min(start + batchSize, pending.length)}/${pending.length}`);
    }
  }, databaseUrl);

  console.log(JSON.stringify({ ...summary, missing: summary.missing.length, changedSinceReview: summary.changedSinceReview.length, changedSlugs: summary.changedSinceReview.slice(0, 50) }, null, 1));
}

main().catch((error) => {
  if (error.summary) {
    const { summary } = error;
    console.error(JSON.stringify({ updatedBeforeStop: summary.applied ? summary.updated : 0, missing: summary.missing.slice(0, 50), changedSinceReview: summary.changedSinceReview.length, changedSlugs: summary.changedSinceReview.slice(0, 50) }, null, 1));
  }
  console.error(error.message);
  process.exit(1);
});
