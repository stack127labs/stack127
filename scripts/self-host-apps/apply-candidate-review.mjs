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

const decisions = new Set(["publish", "duplicate", "reject", "needs_review"]);
const provenanceRequiredWhenPresent = [
  "website_url",
  "source_code_url",
  "icon_source_url",
  "docs_url",
  "install_docs_url",
  "docker_url",
  "license",
  "license_type",
  "license_spdx_id",
  "source_model",
  "publisher_name",
  "publisher_type",
  "publisher_url",
  "pricing_model",
  "self_hosting_status",
  "icon_url",
  "summary_source",
  "summary_confidence",
  "source_repo_id",
  "source_full_name",
  "source_stars",
  "source_forks",
  "source_watchers",
  "source_open_issues",
  "source_primary_language",
  "source_created_at",
  "source_updated_at",
  "source_pushed_at",
  "source_default_branch",
  "source_repo_size_kb",
  "source_archived",
  "source_disabled",
  "source_is_fork",
  "source_is_template",
  "source_latest_release",
  "source_latest_release_at",
  "source_last_commit_at",
  "source_checked_at",
  "release_version",
  "release_published_at",
  "release_checked_at",
  "release_url",
  "popularity_score",
  "popularity_basis",
  "popularity_checked_at",
];
const technicalFactRules = [
  ["docker_support", (record) => record.docker_support !== "unknown"],
  ["deployment_methods", (record) => record.deployment_methods.length > 0],
  ["docker_image", (record) => record.docker_image !== null],
  ["compose_support", (record) => record.compose_support !== null],
  ["compose_url", (record) => record.compose_url !== null],
  ["requires_database", (record) => record.requires_database !== null],
  ["database_types", (record) => record.database_types.length > 0],
  ["ram_mb", (record) => record.ram_mb !== null],
  ["ram_min_mb", (record) => record.ram_min_mb !== null],
  ["ram_recommended_mb", (record) => record.ram_recommended_mb !== null],
  ["storage_profile", (record) => record.storage_profile !== "unknown"],
  ["storage_min_gb", (record) => record.storage_min_gb !== null],
  ["resource_requirement_kind", (record) => record.resource_requirement_kind !== "unknown"],
  ["surfaces", (record) => record.surfaces.length > 0],
  ["source_languages", (record) => Object.keys(record.source_languages ?? {}).length > 0],
  ["source_topics", (record) => record.source_topics.length > 0],
];

function reviewRecords(input) {
  if (Array.isArray(input)) return input;
  if (Array.isArray(input.records)) return input.records;
  if (Array.isArray(input.reviews)) return input.reviews;
  return [input];
}

function fieldSourceMap(record) {
  return new Map((record.field_sources ?? []).map((source) => [source.field_name, source]));
}

function validateProvenance(record) {
  const errors = [];
  const sources = fieldSourceMap(record);
  const required = ["summary", "categories"];

  for (const field of provenanceRequiredWhenPresent) {
    const value = record[field];
    if (value !== null && value !== undefined && value !== "unknown") required.push(field);
  }
  for (const [field, applies] of technicalFactRules) {
    if (applies(record)) required.push(field);
  }

  for (const field of new Set(required)) {
    const source = sources.get(field);
    if (!source?.source) errors.push(`${field} requires field_sources evidence`);
    if (source?.confidence && !["high", "medium", "low", "unknown"].includes(source.confidence)) {
      errors.push(`${field} has invalid evidence confidence`);
    }
  }

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
  errors.push(...validateProvenance({ ...record, field_sources: review.field_sources ?? input.field_sources }));

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
    .map((column) => `${column} = excluded.${column}`)
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
      select *
      from public.self_host_app_candidates
      where id = $1
         or (status = 'duplicate' and duplicate_candidate_id = $1)
    `,
    [candidate.id],
  );

  for (const source of related.rows) {
    await client.query(
      `
        insert into public.self_host_app_sources (
          app_id, import_run_id, source, source_key, source_url, payload
        )
        values ($1, $2, $3, $4, $5, $6::jsonb)
        on conflict (source, source_key) do update set
          app_id = excluded.app_id,
          import_run_id = excluded.import_run_id,
          source_url = excluded.source_url,
          payload = excluded.payload,
          imported_at = now()
      `,
      [
        appId,
        source.import_run_id,
        source.source,
        source.source_key,
        source.source_url,
        JSON.stringify(source.payload ?? {}),
      ],
    );
  }
}

async function upsertExtraSources(client, appId, sources) {
  for (const source of sources ?? []) {
    if (!source.source || !source.source_key) throw new Error("extra sources require source and source_key");
    await client.query(
      `
        insert into public.self_host_app_sources (app_id, source, source_key, source_url, payload)
        values ($1, $2, $3, $4, $5::jsonb)
        on conflict (source, source_key) do update set
          app_id = excluded.app_id,
          source_url = excluded.source_url,
          payload = excluded.payload,
          imported_at = now()
      `,
      [appId, source.source, source.source_key, source.source_url ?? null, JSON.stringify(source.payload ?? {})],
    );
  }
}

async function upsertFieldSources(client, appId, fieldSources) {
  for (const source of fieldSources ?? []) {
    await client.query(
      `
        insert into public.self_host_app_field_sources (
          app_id, field_name, source, source_url, confidence, checked_at, note
        )
        values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()), $7)
        on conflict (app_id, field_name) do update set
          source = excluded.source,
          source_url = excluded.source_url,
          confidence = excluded.confidence,
          checked_at = excluded.checked_at,
          note = excluded.note
      `,
      [
        appId,
        source.field_name,
        source.source,
        source.source_url ?? null,
        source.confidence ?? "unknown",
        source.checked_at ?? null,
        source.note ?? null,
      ],
    );
  }
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
  await upsertFieldSources(
    client,
    appId,
    review.field_sources ?? review.app?.field_sources ?? review.project?.field_sources,
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
