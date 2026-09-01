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
      update public.self_host_apps
      set data_source_urls = coalesce((
        select array_agg(distinct url order by url)
        from unnest(coalesce(data_source_urls, '{}') || array_remove(array[$2, $3, $4, $5], null)::text[]) as values(url)
      ), '{}'),
      data_checked_at = now(),
      data_confidence = case when data_confidence = 'unknown' then 'medium' else data_confidence end,
      updated_at = now()
      where id = $1
    `,
    [
      appId,
      candidate.source_url,
      candidate.website_url,
      candidate.source_code_url,
      candidate.docs_url,
      candidate.docker_url,
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
