#!/usr/bin/env node

import { parseArgs } from "../lib/args.mjs";
import { withClient } from "../lib/db.mjs";

const args = parseArgs();
const candidateAliases = new Map([
  ["a6203178-0535-41e3-9e27-a74526c76b72", "1de10f2f-73da-43f3-b6a9-e45301e242cb"],
  ["7a67347f-1e6e-40ac-a755-ba2cdc474404", "c879fd91-fdfa-4745-9e30-688d2d4fe69d"],
  ["d5eee2fa-b70f-4d6f-80b6-24540b1cff9b", "a1f3b531-4b4b-42b9-b1c5-930ebcb3549c"],
]);
const editorialHolds = new Map([
  [
    "b12c99bd-6bb3-40c5-b8e7-a3acc26e7888",
    "The official repository says production self-hosting needs additional manual email configuration but provides no complete installation guide.",
  ],
  [
    "09a7287e-4aa2-4953-8694-0fb74baad8ef",
    "The official self-hosting documentation host currently does not resolve, so the installation path cannot be verified.",
  ],
  [
    "b2a0a941-f9c0-4737-9e77-a3ae87bb97da",
    "OpenAlternative still points to Infinite-Labs-AI/infinite-os, but the official GitHub repository currently returns 404 and cannot be verified.",
  ],
]);

async function preserveSource(client, candidate, projectId) {
  await client.query(
    `
      insert into public.open_project_sources (
        project_id, import_run_id, source, source_key, source_url, payload
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

await withClient(async (client) => {
  const counts = { project_duplicates: 0, candidate_duplicates: 0, editorial_holds: 0 };
  await client.query("begin");

  try {
    const projectMatches = await client.query(
      `
        select *
        from public.open_project_candidates
        where status = 'needs_review'
          and duplicate_reason = 'possible_name_match'
          and duplicate_project_id is not null
        order by source, name, id
        for update
      `,
    );

    for (const candidate of projectMatches.rows) {
      await preserveSource(client, candidate, candidate.duplicate_project_id);
      await client.query(
        `
          update public.open_project_candidates
          set status = 'duplicate',
              duplicate_candidate_id = null,
              duplicate_reason = 'curated_match',
              updated_at = now()
          where id = $1
        `,
        [candidate.id],
      );
      counts.project_duplicates += 1;
    }

    for (const [candidateId, duplicateCandidateId] of candidateAliases) {
      const result = await client.query(
        `
          update public.open_project_candidates
          set status = 'duplicate',
              duplicate_project_id = null,
              duplicate_candidate_id = $2,
              duplicate_reason = 'curated_match',
              updated_at = now()
          where id = $1
            and status = 'needs_review'
          returning id
        `,
        [candidateId, duplicateCandidateId],
      );
      counts.candidate_duplicates += result.rowCount;
    }

    for (const [candidateId, reason] of editorialHolds) {
      const result = await client.query(
        `
          update public.open_project_candidates
          set status = 'needs_review',
              duplicate_project_id = null,
              duplicate_candidate_id = null,
              duplicate_reason = null,
              rejection_reason = $2,
              updated_at = now()
          where id = $1
          returning id
        `,
        [candidateId, reason],
      );
      counts.editorial_holds += result.rowCount;
    }

    if (args["dry-run"]) await client.query("rollback");
    else await client.query("commit");
    console.log(JSON.stringify({ ...counts, dry_run: Boolean(args["dry-run"]) }, null, 2));
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
});
