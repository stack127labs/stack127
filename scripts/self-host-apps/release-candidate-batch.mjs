#!/usr/bin/env node

import { databaseOptions } from "./lib/environment.mjs";
import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";
import { readJson } from "./lib/schema.mjs";

async function main() {
  const args = parseArgs();
  const databaseUrl = databaseOptions(args);
  if (!args.file) throw new Error("Pass --file with a claimed candidate batch.");
  const targetStatus = args.to ?? "needs_review";
  if (!new Set(["queued", "needs_review"]).has(targetStatus)) {
    throw new Error("--to must be queued or needs_review.");
  }

  const input = await readJson(args.file);
  const ids = (input.candidates ?? []).map((candidate) => candidate.id).filter(Boolean);
  if (ids.length === 0) throw new Error("The batch contains no candidate IDs.");

  await withClient(async (client) => {
    const result = await client.query(
      `
        with locked as (
          select id from public.self_host_app_candidates
          where id = any($1::uuid[]) and status = 'enriching'
          order by id
          for no key update
        )
        update public.self_host_app_candidates candidate
        set status = $2, updated_at = now()
        from locked
        where candidate.id = locked.id
          and candidate.status = 'enriching'
        returning candidate.id
      `,
      [ids, targetStatus],
    );
    console.log(`Released ${result.rowCount} candidate(s) to ${targetStatus}.`);
  }, databaseUrl);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
