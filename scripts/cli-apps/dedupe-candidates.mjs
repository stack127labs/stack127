#!/usr/bin/env node

// Deterministic deduplication for terminal_app_candidates.
//
// Rows sharing one dedupe_key are grouped; the strongest row (highest
// confidence, then earliest discovery) keeps an active status and every other
// row becomes 'duplicate' pointing at it. No rows are deleted: each duplicate
// keeps its own source URL, payload, and alias evidence.
//
// The whole pass is set-based SQL so it stays fast on six-figure queues.
// --dry-run wraps the work in a rolled-back transaction.

import { parseArgs } from "./lib/args.mjs";
import { withClient } from "./lib/db.mjs";

const markDuplicatesSql = `
  with primaries as (
    select dedupe_key,
           (array_agg(id order by confidence_score desc, first_seen_at asc, id asc))[1] as primary_id
    from public.terminal_app_candidates
    where status in ('discovered', 'needs_review', 'failed')
    group by dedupe_key
    having count(*) > 1
  )
  update public.terminal_app_candidates c
  set status = 'duplicate',
      duplicate_of_id = p.primary_id,
      duplicate_reason = 'same dedupe key',
      updated_at = now()
  from primaries p
  where c.dedupe_key = p.dedupe_key
    and c.id <> p.primary_id
    and c.status in ('discovered', 'needs_review', 'failed')
  returning c.id
`;

const linkPublishedSql = `
  with published_links as (
    select dedupe_key, (array_agg(linked_app_id order by first_seen_at asc))[1] as linked_app_id
    from public.terminal_app_candidates
    where status = 'published' and linked_app_id is not null
    group by dedupe_key
  )
  update public.terminal_app_candidates c
  set status = 'published',
      linked_app_id = l.linked_app_id,
      updated_at = now()
  from published_links l
  where c.dedupe_key = l.dedupe_key
    and c.status in ('discovered', 'needs_review', 'duplicate')
  returning c.id
`;

async function main() {
  const args = parseArgs();
  const dryRun = Boolean(args["dry-run"]);

  const result = await withClient(async (client) => {
    if (dryRun) {
      await client.query("begin");
    }

    try {
      const duplicates = await client.query(markDuplicatesSql);
      const linked = await client.query(linkPublishedSql);

      return {
        markedDuplicates: duplicates.rowCount ?? 0,
        linkedPublished: linked.rowCount ?? 0,
      };
    } finally {
      if (dryRun) {
        await client.query("rollback");
      }
    }
  }, args["database-url"]);

  console.log(JSON.stringify({ ...result, dryRun }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
