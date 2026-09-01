#!/usr/bin/env node

import { parseArgs } from "./lib/args.mjs";
import { getSelfHostAppCategory } from "./lib/categories.mjs";
import { withClient } from "./lib/db.mjs";
import {
  normalizeRecord,
  appColumns,
  appSqlValue,
  readJson,
  validateRecord,
} from "./lib/schema.mjs";
import { buildInstallOptions } from "./lib/install-options.mjs";
import { installMethods, installOptionsToRow } from "./lib/streamlined-storage.mjs";

const decisions = new Set(["publish", "duplicate", "reject", "needs_review"]);

function reviewRecords(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.records)) return input.records;
  if (Array.isArray(input.reviews)) return input.reviews;
  return [input];
}

function validateProvenance(record) {
  const errors = [];
  const sourceUrls = [
    record.website_url,
    record.source_code_url,
    record.docs_url,
    record.install_docs_url,
    record.docker_url,
    record.icon_source_url,
  ].filter((value) => typeof value === "string" && /^https?:\/\//i.test(value));
  if (sourceUrls.length === 0) errors.push("published records require at least one source URL");

  return errors;
}

function validatePublishReview(review) {
  const input = { ...(review.app ?? review.project ?? review), published: true };
  const validation = validateRecord(input);
  const record = normalizeRecord(input);
  const errors = [...validation.errors];

  if (!review.candidate_id) errors.push("candidate_id is required");
  if (record.source_model !== "closed_source" && !record.source_code_url) {
    errors.push("open and source-available apps require source_code_url");
  }
  if (
    record.source_model !== "closed_source" &&
    (!record.license || record.license_type === "unknown" || record.source_model === "unknown")
  ) {
    errors.push("open and source-available apps require a verified license and source model");
  }
  if (record.source_model === "closed_source" && !record.website_url) {
    errors.push("closed-source apps require an official website_url");
  }
  if (record.source_model === "closed_source" && !record.publisher_name) {
    errors.push("closed-source apps require a verified publisher_name");
  }
  if (record.source_model === "unknown") {
    errors.push("source_model must be verified before publication");
  }
  if (record.self_hosting_status === "unknown") {
    errors.push("self_hosting_status must be verified before publication");
  }
  if (!record.icon_url?.startsWith("/app-icons/")) {
    errors.push("a cached local icon_url is required before publication");
  }
  if (record.categories.length > 3) errors.push("use one to three controlled categories");
  if (record.self_hosting_status === "self_hostable" && !record.install_docs_url) {
    errors.push("self-hostable apps require verified install_docs_url");
  }
  errors.push(...validateProvenance(record));

  return { record, errors, warnings: validation.warnings };
}

async function ensureCategories(client, categories) {
  for (const slug of categories) {
    const category = getSelfHostAppCategory(slug);
    if (!category) throw new Error(`Unknown category: ${slug}`);
    await client.query(
      `
        insert into public.self_host_app_categories (slug, name, icon_key, sort_order)
        values ($1, $2, $3, $4)
        on conflict (slug) do update set
          name = excluded.name,
          icon_key = excluded.icon_key,
          sort_order = excluded.sort_order,
          updated_at = now()
      `,
      [category.slug, category.name, category.icon_key, category.sort_order],
    );
  }
}

async function upsertApp(client, record, expectedAppId) {
  const existing = await client.query("select id from public.self_host_apps where slug = $1", [record.slug]);
  if (existing.rows[0] && expectedAppId && existing.rows[0].id !== expectedAppId) {
    throw new Error(`${record.slug} belongs to a different app than app_id`);
  }
  if (existing.rows[0] && !expectedAppId) {
    throw new Error(`${record.slug} already exists; provide app_id after confirming the merge`);
  }

  const values = appColumns.map((column) => record[column]);
  const updates = appColumns
    .filter((column) => column !== "slug")
    .map((column) => column === "github_project_id"
      ? `${column} = coalesce(excluded.${column}, self_host_apps.${column})`
      : `${column} = excluded.${column}`)
    .join(",\n          ");
  const result = await client.query(
    `
      insert into public.self_host_apps (${appColumns.join(", ")})
      values (${appColumns.map(appSqlValue).join(", ")})
      on conflict (slug) do update set
        ${updates},
        updated_at = now()
      returning id
    `,
    values,
  );
  return result.rows[0].id;
}

async function replaceCategoryLinks(client, appId, categories) {
  await client.query("delete from public.self_host_app_category_links where app_id = $1", [appId]);
  const result = await client.query(
    "select id, slug from public.self_host_app_categories where slug = any($1::text[])",
    [categories],
  );
  const ids = new Map(result.rows.map((row) => [row.slug, row.id]));
  for (const slug of categories) {
    if (!ids.has(slug)) throw new Error(`Missing category: ${slug}`);
    await client.query(
      `
        insert into public.self_host_app_category_links (app_id, category_id)
        values ($1, $2)
        on conflict (app_id, category_id) do nothing
      `,
      [appId, ids.get(slug)],
    );
  }
}

async function preserveCandidateSources(client, candidate, appId) {
  const related = await client.query(
    `
      select source_url, website_url, source_code_url, docs_url, docker_url
      from public.self_host_app_candidates
      where id = $1
         or (status = 'duplicate' and duplicate_candidate_id = $1)
    `,
    [candidate.id],
  );

  const sourceUrls = related.rows
    .flatMap((source) => [source.source_url, source.website_url, source.source_code_url, source.docs_url, source.docker_url])
    .filter((value) => typeof value === "string" && /^https?:\/\//i.test(value));
  if (sourceUrls.length === 0) return;
  await client.query(
    `
      update public.self_host_apps
      set data_source_urls = coalesce((
        select array_agg(distinct url order by url)
        from unnest(coalesce(data_source_urls, '{}') || $2::text[]) as values(url)
      ), '{}'),
      data_checked_at = coalesce(data_checked_at, now()),
      data_confidence = case when data_confidence = 'unknown' then 'medium' else data_confidence end,
      updated_at = now()
      where id = $1
    `,
    [appId, sourceUrls],
  );
}

async function upsertExtraSources(client, appId, sources) {
  const sourceUrls = (sources ?? [])
    .map((source) => source.source_url)
    .filter((value) => typeof value === "string" && /^https?:\/\//i.test(value));
  if (sourceUrls.length === 0) return;
  await client.query(
    `
      update public.self_host_apps
      set data_source_urls = coalesce((
        select array_agg(distinct url order by url)
        from unnest(coalesce(data_source_urls, '{}') || $2::text[]) as values(url)
      ), '{}'),
      data_checked_at = now(),
      updated_at = now()
      where id = $1
    `,
    [appId, sourceUrls],
  );
}

function installSourcePayload(candidate) {
  const payload = candidate?.payload && typeof candidate.payload === "object" ? candidate.payload : {};
  return {
    catalog: payload.catalog ?? candidate?.source ?? null,
    app_id: payload.app_id ?? payload.key ?? null,
    train: payload.train ?? null,
    compose_url: payload.compose_url ?? null,
    template_url: payload.template_url ?? null,
    image: payload.image ?? payload.docker_image ?? null,
    registry_url: payload.registry_url ?? null,
    raw: Array.isArray(payload.raw?.sources) ? { sources: payload.raw.sources } : undefined,
  };
}

function catalogSourceRows(candidate, review) {
  if (Array.isArray(review.catalog_sources)) return review.catalog_sources;
  const supported = new Set([
    "truenas_apps",
    "umbrel_apps",
    "unraid_apps",
    "casaos_apps",
    "yunohost_apps",
  ]);
  if (!supported.has(candidate?.source)) return [];
  return [{
    source: candidate.source,
    source_url: candidate.source_url,
    payload: installSourcePayload(candidate),
  }];
}

async function upsertInstallOptions(client, appId, options, catalogSources, checkedAt) {
  if (!Array.isArray(options) || options.length === 0) return;
  const stored = installOptionsToRow(options, { catalogSources, checkedAt });
  const columns = [
    "app_id",
    "docker_urls",
    "docker_images",
    ...installMethods.filter((method) => method !== "docker").map((method) => `${method}_urls`),
    "options",
    "catalog_sources",
    "source_urls",
    "checked_at",
  ];
  const recordColumns = columns.map((column) => `${column} ${column.endsWith("_urls") || column.endsWith("_images") || column === "source_urls" ? "text[]" : column === "app_id" ? "uuid" : column === "checked_at" ? "timestamptz" : "jsonb"}`);
  const updates = columns.filter((column) => column !== "app_id").map((column) => `${column} = excluded.${column}`).join(",\n          ");
  await client.query(
    `
      insert into public.self_host_app_install_options (${columns.join(", ")})
      select ${columns.map((column) => `item.${column}`).join(", ")}
      from jsonb_to_record($1::jsonb) as item(${recordColumns.join(", ")})
      on conflict (app_id) do update set
        ${updates},
        updated_at = now()
    `,
    [JSON.stringify({ app_id: appId, ...stored })],
  );
}

async function candidateById(client, id) {
  const result = await client.query("select * from public.self_host_app_candidates where id = $1 for update", [id]);
  if (!result.rows[0]) throw new Error(`Missing candidate: ${id}`);
  return result.rows[0];
}

async function applyReview(client, review) {
  const decision = review.decision ?? "publish";
  if (!decisions.has(decision)) throw new Error(`Unsupported decision: ${decision}`);
  if (!review.candidate_id) throw new Error("candidate_id is required");
  const candidate = await candidateById(client, review.candidate_id);
  if (candidate.status !== "enriching") {
    throw new Error(`Candidate ${candidate.id} is ${candidate.status}; claim it before applying a review`);
  }

  if (decision === "duplicate") {
    if (!review.app_id) throw new Error("duplicate decisions require app_id");
    await preserveCandidateSources(client, candidate, review.app_id);
    await client.query(
      `
        update public.self_host_app_candidates
        set status = 'duplicate', duplicate_app_id = $2,
            duplicate_candidate_id = null, duplicate_reason = 'curated_match', updated_at = now()
        where id = $1
      `,
      [candidate.id, review.app_id],
    );
    return { candidate_id: candidate.id, decision, app_id: review.app_id };
  }

  if (decision === "reject" || decision === "needs_review") {
    if (!review.reason) throw new Error(`${decision} decisions require reason`);
    const candidateStatus = decision === "reject" ? "rejected" : decision;
    await client.query(
      `
        update public.self_host_app_candidates
        set status = $2, rejection_reason = $3, updated_at = now()
        where id = $1
      `,
      [candidate.id, candidateStatus, review.reason],
    );
    return { candidate_id: candidate.id, decision };
  }

  const validation = validatePublishReview(review);
  for (const warning of validation.warnings) console.warn(`warning ${validation.record.slug}: ${warning}`);
  if (validation.errors.length > 0) {
    throw new Error(`${validation.record.slug}: ${validation.errors.join("; ")}`);
  }

  await ensureCategories(client, validation.record.categories);
  const appId = await upsertApp(client, validation.record, review.app_id ?? null);
  await replaceCategoryLinks(client, appId, validation.record.categories);
  await preserveCandidateSources(client, candidate, appId);
  await upsertExtraSources(client, appId, review.sources);
  const sourceRows = catalogSourceRows(candidate, review);
  const reviewedInstallOptions = Array.isArray(review.install_options)
    ? review.install_options
    : buildInstallOptions(validation.record, sourceRows);
  await upsertInstallOptions(
    client,
    appId,
    reviewedInstallOptions,
    sourceRows,
    new Date().toISOString(),
  );
  await client.query(
    `
      update public.self_host_app_candidates
      set status = 'published', enriched_app_id = $2,
          self_hosting_status = $3::public.self_host_app_self_hosting_status,
          rejection_reason = null, updated_at = now()
      where id = $1
    `,
    [candidate.id, appId, validation.record.self_hosting_status],
  );
  return { candidate_id: candidate.id, decision, app_id: appId, slug: validation.record.slug };
}

async function main() {
  const args = parseArgs();
  if (!args.file) throw new Error("Pass --file with reviewed candidate decisions.");
  const input = await readJson(args.file);
  const reviews = reviewRecords(input);
  const results = [];

  await withClient(async (client) => {
    await client.query("begin");
    try {
      for (const review of reviews) results.push(await applyReview(client, review));
      if (args["dry-run"]) await client.query("rollback");
      else await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);

  console.log(JSON.stringify({ dry_run: Boolean(args["dry-run"]), results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
