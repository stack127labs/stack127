#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import {
  buildCandidateIndexes,
  buildAppIndexes,
  classifyCandidate,
} from "./lib/dedupe.mjs";

async function preserveExactAppSource(client, candidate, appId) {
  await client.query(
    `
      insert into public.self_host_app_sources (
        app_id,
        import_run_id,
        source,
        source_key,
        source_url,
        payload
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
    const appsResult = await client.query(
      "select id, name, website_url, source_code_url from public.self_host_apps order by created_at, id",
    );
    const allCandidatesResult = await client.query(
      `
        select *
        from public.self_host_app_candidates
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
        from public.self_host_app_candidates
        where status = 'new'
           or (
             $2::boolean = true
             and status = 'needs_review'
             and duplicate_reason = 'possible_name_match'
           )
        order by confidence_score desc, last_seen_at desc, id
        limit $1
      `,
      [limit, Boolean(args["recheck-name-review"])],
    );

    const appIndexes = buildAppIndexes(appsResult.rows);
    const candidateIndexes = buildCandidateIndexes(allCandidatesResult.rows);
    const counts = {
      checked: targetsResult.rows.length,
      queued: 0,
      app_duplicates: 0,
      candidate_duplicates: 0,
      name_reviews: 0,
      sources_preserved: 0,
      dry_run: Boolean(args["dry-run"]),
    };

    await client.query("begin");
    try {
      for (const candidate of targetsResult.rows) {
        const decision = classifyCandidate(candidate, appIndexes, candidateIndexes);

        if (decision.action === "duplicate") {
          if (decision.app) {
            counts.app_duplicates += 1;
            counts.sources_preserved += 1;
          } else {
            counts.candidate_duplicates += 1;
          }

          if (args["dry-run"]) continue;
          if (decision.app) await preserveExactAppSource(client, candidate, decision.app.id);

          await client.query(
            `
              update public.self_host_app_candidates
              set status = 'duplicate',
                  duplicate_app_id = $2,
                  duplicate_candidate_id = $3,
                  duplicate_reason = $4,
                  updated_at = now()
              where id = $1
            `,
            [
              candidate.id,
              decision.app?.id ?? null,
              decision.candidate?.id ?? null,
              decision.reason,
            ],
          );
          continue;
        }

        if (decision.action === "review") {
          counts.name_reviews += 1;
          if (args["dry-run"]) continue;
          await client.query(
            `
              update public.self_host_app_candidates
              set status = 'needs_review',
                  duplicate_app_id = $2,
                  duplicate_candidate_id = $3,
                  duplicate_reason = 'possible_name_match',
                  updated_at = now()
              where id = $1
            `,
            [candidate.id, decision.app?.id ?? null, decision.candidate?.id ?? null],
          );
          continue;
        }

        counts.queued += 1;
        if (args["dry-run"]) continue;
        await client.query(
          `
            update public.self_host_app_candidates
            set status = 'queued',
                duplicate_app_id = null,
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
