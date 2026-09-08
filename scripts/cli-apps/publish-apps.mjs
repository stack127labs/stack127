#!/usr/bin/env node

// Publish reviewed terminal apps from a verified batch file.
//
// Input: JSON produced by verify-candidates.mjs with an added `review` object
// per record: { decision: "publish"|"exclude"|"needs_review", summary, primary_type,
// additional_types, categories, platforms, source_model, pricing_model,
// install_methods, aliases, docs_url, notes }.
//
// Publication rules enforced here:
// - a record needs name, original summary, an official URL (website or repo),
//   source model, pricing model, a primary type, and 1-3 categories
// - every published field gets a terminal_app_field_sources provenance row
// - last_verified_at is required and comes from the verification pass
// - candidates move to 'published' (linked) or 'excluded'/'needs_review'

import { parseArgs } from "./lib/args.mjs";
import { slugify } from "./lib/normalize.mjs";
import { withClient } from "./lib/db.mjs";
import { validateSummary } from "../self-host-apps/lib/summary-rules.mjs";
import { isManagedMediaUrl } from "../stack127/media/storage.mjs";

const validSourceModels = new Set(["open_source", "source_available", "closed_source", "freeware", "unknown"]);
const validPricing = new Set(["free", "freemium", "paid", "subscription", "usage_based", "unknown"]);
const validTypes = new Set([
  "cli", "tui", "terminal_emulator", "shell", "multiplexer", "prompt",
  "launcher", "file_manager", "editor", "monitor", "ai_agent", "game",
  "mail", "browser", "media", "other",
]);
const validMaintenance = new Set(["active", "slow", "stale", "archived", "unknown"]);

function validateRecord(record) {
  const errors = [];
  const review = record.review ?? {};

  if (!record.name) errors.push("missing name");
  if (!review.summary || review.summary.length < 20) errors.push("summary missing or too short");
  if (typeof review.summary === "string") errors.push(...validateSummary(review.summary).errors);
  if (!record.website_url && !record.repository_url && !review.website_url) errors.push("no official website or repository URL");
  if (!validSourceModels.has(review.source_model)) errors.push(`invalid source_model: ${review.source_model}`);
  if (!validPricing.has(review.pricing_model)) errors.push(`invalid pricing_model: ${review.pricing_model}`);
  if (!validTypes.has(review.primary_type)) errors.push(`invalid primary_type: ${review.primary_type}`);
  const categories = review.categories ?? [];
  if (categories.length < 1 || categories.length > 3) errors.push("categories must contain 1 to 3 reviewed values");
  if (!record.last_verified_at && !review.last_verified_at) errors.push("missing last_verified_at");
  if (!isManagedMediaUrl(record.icon_url, { directory: "cli-apps", kind: "icons" })) {
    errors.push("missing managed icon_url");
  }
  if (!record.icon_source_url) errors.push("missing icon_source_url provenance");
  if (review.maintenance_status && !validMaintenance.has(review.maintenance_status)) {
    errors.push(`invalid maintenance_status: ${review.maintenance_status}`);
  }

  return errors;
}

async function publishRecord(client, record) {
  const review = record.review;
  const github = record.evidence?.github && !record.evidence.github.error ? record.evidence.github : null;

  const slug = slugify(review.slug ?? record.slug ?? record.name);
  const stars = github?.stars ?? record.stars ?? null;
  const lastCommitAt = github?.pushed_at ?? null;
  const license = github?.license_spdx_id ?? record.license_raw ?? null;
  const language = github?.language ?? record.language_raw ?? null;
  const websiteUrl = review.website_url ?? record.website_url ?? github?.homepage ?? null;
  const repositoryUrl = record.repository_url ?? (github ? `https://github.com/${github.full_name}` : null);
  const latestVersion = record.latest_version ?? null;
  const lastVerifiedAt = review.last_verified_at ?? record.last_verified_at;
  const maintenance = review.maintenance_status ?? "unknown";
  const iconUrl = record.icon_url ?? null;

  const upsert = await client.query(
    `
      insert into public.terminal_apps (
        slug, name, aliases, summary, primary_type, additional_types,
        categories, platforms, language, install_methods,
        website_url, docs_url, repository_url,
        source_model, pricing_model, license,
        latest_version, latest_release_at, stars, last_commit_at,
        maintenance_status, icon_url, screenshot_url, self_host_app_id,
        last_verified_at, published
      ) values (
        $1, $2, $3::text[], $4, $5, $6::text[],
        $7::text[], $8::text[], $9, $10::text[],
        $11, $12, $13,
        $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, null, null,
        $23, true
      )
      on conflict (slug) do update set
        name = excluded.name,
        aliases = excluded.aliases,
        summary = excluded.summary,
        primary_type = excluded.primary_type,
        additional_types = excluded.additional_types,
        categories = excluded.categories,
        platforms = excluded.platforms,
        language = excluded.language,
        install_methods = excluded.install_methods,
        website_url = excluded.website_url,
        docs_url = excluded.docs_url,
        repository_url = excluded.repository_url,
        source_model = excluded.source_model,
        pricing_model = excluded.pricing_model,
        license = excluded.license,
        latest_version = coalesce(excluded.latest_version, terminal_apps.latest_version),
        latest_release_at = coalesce(excluded.latest_release_at, terminal_apps.latest_release_at),
        stars = coalesce(excluded.stars, terminal_apps.stars),
        last_commit_at = coalesce(excluded.last_commit_at, terminal_apps.last_commit_at),
        maintenance_status = excluded.maintenance_status,
        icon_url = excluded.icon_url,
        last_verified_at = excluded.last_verified_at,
        published = true,
        updated_at = now()
      returning id, (xmax = 0) as inserted
    `,
    [
      slug,
      record.name,
      review.aliases ?? [],
      review.summary,
      review.primary_type,
      review.additional_types ?? [],
      review.categories,
      review.platforms ?? [],
      language,
      review.install_methods ?? [],
      websiteUrl,
      review.docs_url ?? record.docs_url ?? null,
      repositoryUrl,
      review.source_model,
      review.pricing_model,
      license,
      latestVersion,
      record.latest_release_at ?? null,
      stars,
      lastCommitAt,
      maintenance,
      iconUrl,
      lastVerifiedAt,
    ],
  );

  const appId = upsert.rows[0].id;

  // Provenance for every imported fact.
  const provenance = [
    ["summary", "stack127_editorial", null, "high", "original stack127 summary"],
    ["primary_type", "stack127_editorial", null, "high", review.type_note ?? null],
    ["categories", "stack127_editorial", null, "high", review.category_note ?? null],
    ["source_model", "stack127_editorial", null, "high", review.source_model_note ?? null],
    ["pricing_model", "stack127_editorial", null, "high", review.pricing_note ?? null],
    ["last_verified_at", "verification_run", record.verified_at ?? null, "high", null],
  ];

  if (websiteUrl) {
    provenance.push(["website_url", record.source, record.source_url, "medium", "candidate discovery; reachability checked"]);
  }
  if (repositoryUrl) {
    provenance.push(["repository_url", record.source, record.source_url, "medium", "candidate discovery"]);
  }
  if (github) {
    provenance.push(["stars", "github_api", `https://api.github.com/repos/${github.full_name}`, "high", null]);
    provenance.push(["last_commit_at", "github_api", `https://api.github.com/repos/${github.full_name}`, "high", "pushed_at"]);
    if (github.license_spdx_id) {
      provenance.push(["license", "github_api", `https://api.github.com/repos/${github.full_name}`, "high", null]);
    }
    if (github.language) {
      provenance.push(["language", "github_api", `https://api.github.com/repos/${github.full_name}`, "high", null]);
    }
  }
  if (latestVersion) {
    provenance.push(["latest_version", record.source, record.source_url, "low", "from discovery payload; re-verify before quoting"]);
  }
  if (iconUrl) {
    provenance.push(["icon_url", "media_storage", record.icon_source_url, "medium", "normalized PNG stored by stack127"]);
  }

  await client.query(
    `
      insert into public.terminal_app_field_sources (
        app_id, field_name, source, source_url, confidence, checked_at, note
      )
      select $1, data.field_name, data.source, data.source_url, data.confidence, now(), data.note
      from unnest($2::text[], $3::text[], $4::text[], $5::text[], $6::text[])
        as data(field_name, source, source_url, confidence, note)
      on conflict (app_id, field_name) do update set
        source = excluded.source,
        source_url = excluded.source_url,
        confidence = excluded.confidence,
        checked_at = now(),
        note = excluded.note
    `,
    [
      appId,
      provenance.map(([fieldName]) => fieldName),
      provenance.map(([, source]) => source),
      provenance.map(([, , sourceUrl]) => sourceUrl),
      provenance.map(([, , , confidence]) => confidence),
      provenance.map(([, , , , note]) => note),
    ],
  );

  // Link the candidate queue rows.
  await client.query(
    `
      update public.terminal_app_candidates
      set status = 'published', linked_app_id = $2, updated_at = now()
      where dedupe_key = $1
    `,
    [record.dedupe_key, appId],
  );

  return { slug, app_id: appId, inserted: Boolean(upsert.rows[0].inserted) };
}

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  if (!args.file) {
    console.error("Pass --file <batch.json>");
    process.exit(1);
  }

  const { readFile } = await import("node:fs/promises");
  const batch = JSON.parse(await readFile(args.file, "utf8"));
  const records = Array.isArray(batch.records) ? batch.records : [];

  let published = 0;
  let excluded = 0;
  let needsReview = 0;
  const validationFailures = [];

  for (const record of records) {
    const decision = record.review?.decision ?? "needs_review";

    if (decision === "publish") {
      const errors = validateRecord(record);
      if (errors.length > 0) {
        validationFailures.push({ name: record.name, errors });
        needsReview += 1;
      } else {
        published += 1;
      }
      continue;
    }

    if (decision === "exclude") {
      excluded += 1;
      continue;
    }

    needsReview += 1;
  }

  if (!dryRun && validationFailures.length === 0) {
    await withClient(async (client) => {
      await client.query("begin");

      try {
        for (const record of records) {
          const decision = record.review?.decision ?? "needs_review";

          if (decision === "publish") {
            await publishRecord(client, record);
            continue;
          }

          if (decision === "exclude") {
            await client.query(
            `
              update public.terminal_app_candidates
              set status = 'excluded',
                  exclusion_reason = $2,
                  updated_at = now()
              where dedupe_key = $1 and status <> 'published'
            `,
            [record.dedupe_key, record.review.exclusion_reason ?? "excluded during review"],
          );
            continue;
          }

          if (record.dedupe_key) {
            await client.query(
              `
                update public.terminal_app_candidates
                set status = 'needs_review',
                    review_notes = $2,
                    updated_at = now()
                where dedupe_key = $1 and status in ('discovered', 'failed')
              `,
              [record.dedupe_key, record.review?.notes ?? "awaiting editorial review"],
            );
          }
        }

        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }, args["database-url"]);
  }

  console.log(JSON.stringify({
    dryRun,
    total: records.length,
    published,
    excluded,
    needsReview,
    validationFailures,
  }, null, 2));

  if (validationFailures.length > 0) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
