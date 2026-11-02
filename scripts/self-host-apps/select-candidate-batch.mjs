#!/usr/bin/env node

import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

import { pathToFileURL } from "node:url";
import { databaseOptions } from "./lib/environment.mjs";

const claimableStatuses = new Set(["queued", "needs_review"]);

function requestedStatuses(value) {
  const statuses = String(value ?? "queued,needs_review")
    .split(",")
    .map((status) => status.trim())
    .filter(Boolean);
  const invalid = statuses.filter((status) => !claimableStatuses.has(status));
  if (invalid.length > 0) throw new Error(`Unsupported claim status: ${invalid.join(", ")}`);
  return [...new Set(statuses)];
}

function defaultOutputPath() {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `scripts/self-host-apps/batches/${stamp}-candidate-enrichment.json`;
}

async function loadPotentialMatches(client, candidates) {
  const appIds = candidates.map((candidate) => candidate.duplicate_app_id).filter(Boolean);
  const candidateIds = candidates.map((candidate) => candidate.duplicate_candidate_id).filter(Boolean);
  const [apps, matchedCandidates] = await Promise.all([
    appIds.length > 0
      ? client.query(
          "select id, slug, name, website_url, source_code_url from public.self_host_apps where id = any($1::uuid[])",
          [appIds],
        )
      : { rows: [] },
    candidateIds.length > 0
      ? client.query(
          "select id, source, source_key, name, website_url, source_code_url, status from public.self_host_app_candidates where id = any($1::uuid[])",
          [candidateIds],
        )
      : { rows: [] },
  ]);
  const appsById = new Map(apps.rows.map((row) => [row.id, row]));
  const candidatesById = new Map(matchedCandidates.rows.map((row) => [row.id, row]));

  return candidates.map((candidate) => ({
    ...candidate,
    possible_app_match: appsById.get(candidate.duplicate_app_id) ?? null,
    possible_candidate_match: candidatesById.get(candidate.duplicate_candidate_id) ?? null,
  }));
}

export async function requestedIds(args) {
  const hasIds = args.ids !== undefined;
  const hasFile = args["ids-from"] !== undefined;
  if (hasIds && hasFile) throw new Error("Use --ids or --ids-from, not both.");
  if (!hasIds && !hasFile) return null;
  if (args.status !== undefined || args.limit !== undefined || args.match !== undefined) throw new Error("Exact IDs cannot be combined with --status, --limit or --match.");
  let ids;
  if (hasFile) {
    const input = JSON.parse(await readFile(args["ids-from"], "utf8"));
    const reviews = Array.isArray(input) ? input : input.records ?? input.reviews ?? [input];
    ids = reviews.map((review) => review.candidate_id);
  } else {
    ids = String(args.ids).split(",").map((id) => id.trim());
  }
  if (!ids.length || ids.some((id) => typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
    throw new Error("Every selected record must have a valid candidate UUID.");
  }
  return [...new Set(ids.map((id) => id.toLowerCase()))];
}

// Called inside the caller's transaction. Lock all requested rows before validating
// any of them; a missing or terminal row must leave the whole batch unchanged.
export async function claimIds(client, ids, dryRun = false) {
  const result = await client.query(
    "select * from public.self_host_app_candidates where id = any($1::uuid[]) order by id" + (dryRun ? "" : " for no key update"), [ids],
  );
  const byId = new Map(result.rows.map((row) => [row.id, row]));
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) throw new Error(`Missing candidate IDs: ${missing.join(", ")}`);
  const invalid = result.rows.filter((row) => !["new", "queued", "needs_review", "enriching"].includes(row.status));
  if (invalid.length) throw new Error(`Cannot claim candidates: ${invalid.map((row) => `${row.id} (${row.status})`).join(", ")}`);
  const changes = result.rows.filter((row) => row.status !== "enriching");
  if (!dryRun && changes.length) {
    await client.query("update public.self_host_app_candidates set status = 'enriching', updated_at = now() where id = any($1::uuid[])", [changes.map((row) => row.id)]);
  }
  return result.rows.map((row) => ({ ...row, previous_status: row.status, already_enriching: row.status === "enriching", status: dryRun ? row.status : "enriching" }));
}

export async function findMatches(client, match) {
  if (typeof match !== "string" || !match.trim()) throw new Error("--match needs a name or repository.");
  const term = match.trim();
  // strpos uses a literal substring, so URL underscores and percent signs are not wildcards.
  const candidates = await client.query(`select id, status, name, source, source_url, source_code_url, website_url,
    duplicate_app_id, duplicate_candidate_id, duplicate_reason, enriched_app_id
    from public.self_host_app_candidates
    where strpos(lower(concat_ws(' ', name, slug, source_key, source_url, source_code_url, website_url)), lower($1)) > 0 order by name, id`, [term]);
  const apps = await client.query(`select id, slug, name, published, self_hosting_status, source_code_url, website_url
    from public.self_host_apps
    where strpos(lower(concat_ws(' ', name, slug, source_code_url, website_url)), lower($1)) > 0 order by slug`, [term]);
  return { candidates: candidates.rows, apps: apps.rows };
}

async function main() {
  const args = parseArgs();
  const ids = await requestedIds(args);
  const databaseUrl = databaseOptions(args);
  const limit = numberArg(args, "limit", 100);
  const statuses = requestedStatuses(args.status);
  const outPath = args.out ?? defaultOutputPath();

  await withClient(async (client) => {
    if (args.match !== undefined) {
      if (args.ids !== undefined || args["ids-from"] !== undefined || args.status !== undefined || args.limit !== undefined) throw new Error("--match is a separate read-only lookup.");
      console.log(JSON.stringify(await findMatches(client, args.match), null, 2));
      return;
    }
    await client.query(args["dry-run"] ? "begin read only" : "begin");
    try {
      const result = ids ? { rows: await claimIds(client, ids, Boolean(args["dry-run"])) } : args["dry-run"]
        ? await client.query(
            `
              select *
              from public.self_host_app_candidates
              where status = any($1::text[])
              order by confidence_score desc, last_seen_at desc, name, id
              limit $2
            `,
            [statuses, limit],
          )
        : await client.query(
            `
              with selected as (
                select id
                from public.self_host_app_candidates
                where status = any($1::text[])
                order by confidence_score desc, last_seen_at desc, name, id
                for no key update skip locked
                limit $2
              )
              update public.self_host_app_candidates candidate
              set status = 'enriching', updated_at = now()
              from selected
              where candidate.id = selected.id
              returning candidate.*
            `,
            [statuses, limit],
          );
      const candidates = await loadPotentialMatches(client, result.rows);
      const batch = {
        source: "self_host_app_candidates",
        selected_at: new Date().toISOString(),
        claimed: !args["dry-run"],
        selected_statuses: ids ? ["new", "queued", "needs_review", "enriching"] : statuses,
        already_enriching: candidates.filter((row) => row.already_enriching).length,
        would_claim: candidates.filter((row) => !row.already_enriching).length,
        candidate_count: candidates.length,
        candidates,
      };

      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, `${JSON.stringify(batch, null, 2)}\n`);

      if (args["dry-run"]) await client.query("rollback");
      else await client.query("commit");

      console.log(`${args["dry-run"] ? "Selected" : "Claimed"} ${candidates.length} candidate(s) in ${outPath}; ${batch.already_enriching} already enriching`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, databaseUrl);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch((error) => {
  console.error(error);
  process.exit(1);
});
