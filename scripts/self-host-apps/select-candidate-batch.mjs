#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

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
  const projectIds = candidates.map((candidate) => candidate.duplicate_project_id).filter(Boolean);
  const candidateIds = candidates.map((candidate) => candidate.duplicate_candidate_id).filter(Boolean);
  const [projects, matchedCandidates] = await Promise.all([
    projectIds.length > 0
      ? client.query(
          "select id, slug, name, website_url, source_code_url from public.open_projects where id = any($1::uuid[])",
          [projectIds],
        )
      : { rows: [] },
    candidateIds.length > 0
      ? client.query(
          "select id, source, source_key, name, website_url, source_code_url, status from public.open_project_candidates where id = any($1::uuid[])",
          [candidateIds],
        )
      : { rows: [] },
  ]);
  const projectsById = new Map(projects.rows.map((row) => [row.id, row]));
  const candidatesById = new Map(matchedCandidates.rows.map((row) => [row.id, row]));

  return candidates.map((candidate) => ({
    ...candidate,
    possible_project_match: projectsById.get(candidate.duplicate_project_id) ?? null,
    possible_candidate_match: candidatesById.get(candidate.duplicate_candidate_id) ?? null,
  }));
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);
  const statuses = requestedStatuses(args.status);
  const outPath = args.out ?? defaultOutputPath();

  await withClient(async (client) => {
    await client.query("begin");
    try {
      const result = args["dry-run"]
        ? await client.query(
            `
              select *
              from public.open_project_candidates
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
                from public.open_project_candidates
                where status = any($1::text[])
                order by confidence_score desc, last_seen_at desc, name, id
                for update skip locked
                limit $2
              )
              update public.open_project_candidates candidate
              set status = 'enriching', updated_at = now()
              from selected
              where candidate.id = selected.id
              returning candidate.*
            `,
            [statuses, limit],
          );
      const candidates = await loadPotentialMatches(client, result.rows);
      const batch = {
        source: "open_project_candidates",
        selected_at: new Date().toISOString(),
        claimed: !args["dry-run"],
        selected_statuses: statuses,
        candidate_count: candidates.length,
        candidates,
      };

      await mkdir(path.dirname(outPath), { recursive: true });
      await writeFile(outPath, `${JSON.stringify(batch, null, 2)}\n`);

      if (args["dry-run"]) await client.query("rollback");
      else await client.query("commit");

      console.log(`${args["dry-run"] ? "Selected" : "Claimed"} ${candidates.length} candidate(s) in ${outPath}`);
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
