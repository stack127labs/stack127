#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, numberArg } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

async function main() {
  const args = parseArgs();
  const limit = numberArg(args, "limit", 100);
  const status = args.status ?? "queued";
  const today = new Date().toISOString().slice(0, 10);
  const outPath = args.out ?? `scripts/self-host-apps/batches/${today}-candidate-enrichment.json`;

  await withClient(async (client) => {
    const result = await client.query(
      `
        select
          id,
          source,
          source_key,
          source_url,
          name,
          slug,
          summary_raw,
          website_url,
          source_code_url,
          source_code_host,
          docs_url,
          docker_url,
          self_hosting_status,
          categories_raw,
          surfaces_raw,
          confidence_score,
          payload,
          first_seen_at,
          last_seen_at
        from public.open_project_candidates
        where status = $1
          and duplicate_project_id is null
          and duplicate_candidate_id is null
        order by confidence_score desc, last_seen_at desc, name
        limit $2
      `,
      [status, limit],
    );

    const batch = {
      source: "open_project_candidates",
      selected_at: new Date().toISOString(),
      status,
      candidate_count: result.rows.length,
      candidates: result.rows,
    };

    await mkdir(path.dirname(outPath), { recursive: true });
    await writeFile(outPath, `${JSON.stringify(batch, null, 2)}\n`);
    console.log(`Wrote ${result.rows.length} candidate(s) to ${outPath}`);
  }, args["database-url"]);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
