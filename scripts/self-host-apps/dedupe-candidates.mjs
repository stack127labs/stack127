#!/usr/bin/env node

import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import {
  buildCandidateIndexes,
  buildAppIndexes,
  classifyCandidate,
} from "./lib/dedupe.mjs";

async function preserveExactAppSources(client, decisions) {
  if (decisions.length === 0) return;
  await client.query(
    `
      with decisions as (
        select decision.target_id, decision.app_id
        from jsonb_to_recordset($1::jsonb) as decision(
          target_id uuid,
          app_id uuid
        )
      ), source_rows as (
        select decisions.app_id, values.url
        from decisions
        join public.self_host_app_candidates candidate on candidate.id = decisions.target_id
        cross join lateral unnest(array[
          candidate.source_url,
          candidate.website_url,
          candidate.source_code_url,
          candidate.docs_url,
          candidate.docker_url
        ]) as values(url)
        where values.url ~ '^https?://'
      ), source_lists as (
        select app_id, array_agg(distinct url order by url) as source_urls
        from source_rows
        group by app_id
      )
      update public.self_host_apps
      set data_source_urls = coalesce((
        select array_agg(distinct url order by url)
        from unnest(coalesce(public.self_host_apps.data_source_urls, '{}') || source_lists.source_urls) as values(url)
      ), '{}'),
      data_checked_at = now(),
      data_confidence = case when data_confidence = 'unknown' then 'medium' else data_confidence end,
      updated_at = now()
      from source_lists
      where public.self_host_apps.id = source_lists.app_id
        and (data_confidence='unknown' or data_checked_at is null or data_source_urls is distinct from (
          select array_agg(distinct url order by url)
          from unnest(coalesce(public.self_host_apps.data_source_urls, '{}') || source_lists.source_urls) as values(url)
        ))
    `,
    [JSON.stringify(decisions)],
  );
}

async function applyDecisions(client, {
  appDuplicates,
  candidateDuplicates,
  nameReviews,
  queuedIds,
}) {
  await preserveExactAppSources(client, appDuplicates);

  if (appDuplicates.length > 0) {
    await client.query(
      `
        update public.self_host_app_candidates candidate
        set status = 'duplicate',
            duplicate_app_id = decisions.app_id,
            duplicate_candidate_id = null,
            duplicate_reason = decisions.reason,
            updated_at = now()
        from jsonb_to_recordset($1::jsonb) as decisions(
          target_id uuid,
          app_id uuid,
          reason text
        )
        where candidate.id = decisions.target_id
      `,
      [JSON.stringify(appDuplicates)],
    );
  }

  if (candidateDuplicates.length > 0) {
    await client.query(
      `
        update public.self_host_app_candidates candidate
        set status = 'duplicate',
            duplicate_app_id = null,
            duplicate_candidate_id = decisions.duplicate_candidate_id,
            duplicate_reason = decisions.reason,
            updated_at = now()
        from jsonb_to_recordset($1::jsonb) as decisions(
          target_id uuid,
          duplicate_candidate_id uuid,
          reason text
        )
        where candidate.id = decisions.target_id
      `,
      [JSON.stringify(candidateDuplicates)],
    );
  }

  if (nameReviews.length > 0) {
    await client.query(
      `
        update public.self_host_app_candidates candidate
        set status = 'needs_review',
            duplicate_app_id = decisions.app_id,
            duplicate_candidate_id = decisions.duplicate_candidate_id,
            duplicate_reason = 'possible_name_match',
            updated_at = now()
        from jsonb_to_recordset($1::jsonb) as decisions(
          target_id uuid,
          app_id uuid,
          duplicate_candidate_id uuid
        )
        where candidate.id = decisions.target_id
      `,
      [JSON.stringify(nameReviews)],
    );
  }

  if (queuedIds.length > 0) {
    await client.query(
      `
        update public.self_host_app_candidates
        set status = 'queued',
            duplicate_app_id = null,
            duplicate_candidate_id = null,
            duplicate_reason = null,
            updated_at = now()
        where id = any($1::uuid[])
      `,
      [queuedIds],
    );
  }
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

    const appDuplicates = [];
    const candidateDuplicates = [];
    const nameReviews = [];
    const queuedIds = [];

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

          if (decision.app) {
            appDuplicates.push({ target_id: candidate.id, app_id: decision.app.id, reason: decision.reason });
          } else {
            candidateDuplicates.push({
              target_id: candidate.id,
              duplicate_candidate_id: decision.candidate.id,
              reason: decision.reason,
            });
          }
          continue;
        }

        if (decision.action === "review") {
          counts.name_reviews += 1;
          nameReviews.push({
            target_id: candidate.id,
            app_id: decision.app?.id ?? null,
            duplicate_candidate_id: decision.candidate?.id ?? null,
          });
          continue;
        }

        counts.queued += 1;
        queuedIds.push(candidate.id);
      }

      if (args["dry-run"]) {
        await client.query("rollback");
      } else {
        await applyDecisions(client, { appDuplicates, candidateDuplicates, nameReviews, queuedIds });
        await client.query("commit");
      }
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
