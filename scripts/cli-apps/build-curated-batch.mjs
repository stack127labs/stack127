#!/usr/bin/env node

// Assemble candidate evidence and existing editorial suggestions for review.
// Assembly is not verification and cannot authorize publication.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "./lib/args.mjs";
import { curated } from "./curated-map.mjs";

function maintenanceFrom(github, override) {
  if (override) return override.toLowerCase();
  if (github?.archived) return "archived";
  if (!github?.pushed_at) return "unknown";
  const pushedAt = new Date(github.pushed_at).getTime();
  const ageDays = (Date.now() - pushedAt) / (1000 * 60 * 60 * 24);
  if (Number.isNaN(ageDays)) return "unknown";
  if (ageDays < 110) return "active";
  if (ageDays < 395) return "slow";
  return "stale";
}

async function main() {
  const args = parseArgs();
  const out = args.out ?? "scripts/cli-apps/batches/curated-publish.json";
  const curatedOnly = Boolean(args["curated-only"]);

  const verifiedSources = [
    "scripts/cli-apps/batches/verified-github.json",
    "scripts/cli-apps/batches/verified-website.json",
  ];

  const recordsBySlug = new Map();

  for (const file of verifiedSources) {
    try {
      const batch = JSON.parse(await readFile(file, "utf8"));
      for (const record of batch.records ?? []) {
        if (!record.slug) continue;
        if (curatedOnly && !curated[record.slug]) continue;
        const existing = recordsBySlug.get(record.slug);
        if (existing && (existing.evidence?.github ?? null) && !(record.evidence?.github ?? null)) continue;
        recordsBySlug.set(record.slug, record);
      }
    } catch (error) {
      console.warn(`skip ${file}: ${error.message}`);
    }
  }

  // Add curated slugs that exist in candidates but were not in verified batches
  // (closed-source vendor CLIs). Fetch their candidate rows live.
  const extraSlugs = Object.keys(curated).filter((slug) => !recordsBySlug.has(slug) && !curated[slug]?.skip);
  if (extraSlugs.length > 0) {
    const { withClient: withDbClient } = await import("./lib/db.mjs");
    const extraRecords = await withDbClient(async (client) => {
      const result = await client.query(
        `select distinct on (slug)
           id, source, source_url, name, slug, dedupe_key, canonical_repo_key,
           website_url, repository_url, docs_url, summary_raw, license_raw,
           language_raw, stars, categories_raw, platforms_raw,
           install_methods_raw, latest_version, latest_release_at, payload
         from public.terminal_app_candidates
         where slug = any($1::text[])
         order by slug, confidence_score desc, stars desc nulls last, last_seen_at desc`,
        [extraSlugs],
      );
      return result.rows;
    });
    for (const record of extraRecords) {
      // Fallback to candidate-row evidence when no GitHub verification exists.
      recordsBySlug.set(record.slug, { ...record, evidence: { website: { status: "unchecked" } } });
    }
    const found = extraRecords.map((r) => r.slug).join(", ");
    const missing = extraSlugs.filter((s) => !extraRecords.some((r) => r.slug === s)).join(", ");
    if (found) console.log(`extra curated slugs matched in candidates: ${found}`);
    if (missing) console.log(`extra curated slugs not in candidates (allocate stub): ${missing}`);
    // Stub remaining slugs with synthetic candidate records so closed-source
    // vendor CLIs can still publish without a prior candidate row.
    for (const slug of extraSlugs.filter((s) => !extraRecords.some((r) => r.slug === s))) {
      const override = curated[slug];
      recordsBySlug.set(slug, {
        slug,
        name: override.name ?? slug.replace(/-cli$/, "").replace(/-/g, " "),
        dedupe_key: `name:${slug}`,
        source: "manual",
        source_url: override.repository_url ?? override.website_url ?? null,
        website_url: override.website_url ?? null,
        repository_url: override.repository_url ?? null,
        summary_raw: override.summary,
        source_type: "manual",
        evidence: { website: { status: "unchecked" } },
      });
    }
  }

  const records = [];

  for (const [slug, record] of recordsBySlug) {
    const override = curated[slug];
    if (!override) continue;
    if (override.skip) continue;

    const github = record.evidence?.github && !record.evidence.github.error ? record.evidence.github : null;

    const categories = override.categories ?? [record.categories_raw?.[0] ?? "development"].slice(0, 3);
    const platforms = override.platforms ?? [];
    const installMethods = override.install_methods ?? [];

    records.push({
      ...record,
      name: override.name ?? record.name,
      icon_source_url: override.icon_source_url ?? null,
      website_url: override.website_url ?? record.website_url ?? github?.homepage ?? null,
      repository_url: override.repository_url ?? record.repository_url ?? (github ? `https://github.com/${github.full_name}` : null),
      source_url: override.repository_url ?? override.website_url ?? record.source_url ?? null,
      last_verified_at: null,
      evidence_collected_at: record.verified_at ?? null,
      verified_at: null,
      review: {
        decision: "needs_review",
        notes: "Assembled evidence and prior editorial suggestions. Verify every field against primary sources before approving publication and setting a review date.",
        summary: override.summary,
        aliases: override.aliases ?? [],
        primary_type: override.primary_type,
        additional_types: override.additional_types ?? [],
        categories,
        platforms,
        language: override.language ?? github?.language ?? record.language_raw ?? null,
        install_methods: installMethods,
        website_url: override.website_url ?? record.website_url ?? github?.homepage ?? null,
        docs_url: override.docs_url ?? record.docs_url ?? null,
        source_model: override.source_model,
        pricing_model: override.pricing_model,
        maintenance_status: maintenanceFrom(github, override.maintenance_status),
        latest_version: record.latest_version ?? null,
        latest_release_at: record.latest_release_at ?? github?.pushed_at ?? null,
      },
    });
  }

  // Also emit explicit exclusions for anything curated as skip/excluded? Not needed yet.
  console.log(`assembled ${records.length} pending review records from ${recordsBySlug.size} candidates`);

  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify({ generated_at: new Date().toISOString(), review_status: "pending", records }, null, 2)}\n`, { flag: "wx" });
  console.log(`wrote ${out}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
