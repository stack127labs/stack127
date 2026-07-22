#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import {
  buildCandidateIndexes,
  buildProjectIndexes,
  classifyCandidate,
} from "./lib/dedupe.mjs";

async function preserveExactProjectSource(client, candidate, projectId) {
  await client.query(
    `
      insert into public.open_project_sources (
        project_id,
        import_run_id,
        source,
        source_key,
        source_url,
        payload
      )
      values ($1, $2, $3, $4, $5, $6::jsonb)
      on conflict (source, source_key) do update set
        project_id = excluded.project_id,
        import_run_id = excluded.import_run_id,
        source_url = excluded.source_url,
        payload = excluded.payload,
        imported_at = now()
    `,
    [
      projectId,
      candidate.import_run_id,
      candidate.source,
      candidate.source_key,
      candidate.source_url,
      JSON.stringify(candidate.payload ?? {}),
    ],
  );
}

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 5000);

  await withClient(async (client) => {
    const projectsResult = await client.query(
      "select id, name, website_url, source_code_url from public.open_projects order by created_at, id",
    );
    const allCandidatesResult = await client.query(
      `
        select *
        from public.open_project_candidates
        where status <> 'rejected'
        order by
          case status
            when 'published' then 0
            when 'enriching' then 1
            when 'queued' then 2
            when 'needs_review' then 3
            when 'new' then 4
            when 'duplicate' then 5
            else 6
          end,
          first_seen_at,
          id
      `,
    );
    const targetsResult = await client.query(
      `
        select *
        from public.open_project_candidates
        where status = 'new'
           or (status = 'needs_review' and duplicate_reason = 'possible_name_match')
        order by confidence_score desc, last_seen_at desc, id
        limit $1
      `,
      [limit],
    );

    const projectIndexes = buildProjectIndexes(projectsResult.rows);
    const candidateIndexes = buildCandidateIndexes(allCandidatesResult.rows);
    const counts = {
      checked: targetsResult.rows.length,
      queued: 0,
      project_duplicates: 0,
      candidate_duplicates: 0,
      name_reviews: 0,
      sources_preserved: 0,
      dry_run: Boolean(args["dry-run"]),
    };

    await client.query("begin");
    try {
      for (const candidate of targetsResult.rows) {
        const decision = classifyCandidate(candidate, projectIndexes, candidateIndexes);

        if (decision.action === "duplicate") {
          if (decision.project) {
            counts.project_duplicates += 1;
            await preserveExactProjectSource(client, candidate, decision.project.id);
            counts.sources_preserved += 1;
          } else {
            counts.candidate_duplicates += 1;
          }

          await client.query(
            `
              update public.open_project_candidates
              set status = 'duplicate',
                  duplicate_project_id = $2,
                  duplicate_candidate_id = $3,
                  duplicate_reason = $4,
                  updated_at = now()
              where id = $1
            `,
            [
              candidate.id,
              decision.project?.id ?? null,
              decision.candidate?.id ?? null,
              decision.reason,
            ],
          );
          continue;
        }

        if (decision.action === "review") {
          counts.name_reviews += 1;
          await client.query(
            `
              update public.open_project_candidates
              set status = 'needs_review',
                  duplicate_project_id = $2,
                  duplicate_candidate_id = $3,
                  duplicate_reason = 'possible_name_match',
                  updated_at = now()
              where id = $1
            `,
            [candidate.id, decision.project?.id ?? null, decision.candidate?.id ?? null],
          );
          continue;
        }

        counts.queued += 1;
        await client.query(
          `
            update public.open_project_candidates
            set status = 'queued',
                duplicate_project_id = null,
                duplicate_candidate_id = null,
                duplicate_reason = null,
                updated_at = now()
            where id = $1
          `,
          [candidate.id],
        );
      }

      if (args["dry-run"]) await client.query("rollback");
      else await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }

    console.log(JSON.stringify(counts, null, 2));
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
