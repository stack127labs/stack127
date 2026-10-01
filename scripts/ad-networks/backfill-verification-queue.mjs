#!/usr/bin/env node

import { parseArgs } from "node:util";
import pg from "pg";

const { values } = parseArgs({
  options: {
    apply: { type: "boolean", default: false },
    "batch-size": { type: "string", default: "10000" },
  },
});
const batchSize = Number(values["batch-size"]);
if (!Number.isInteger(batchSize) || batchSize < 100 || batchSize > 50_000) {
  throw new Error("--batch-size must be an integer from 100 to 50000");
}
const databaseUrl = process.env.DATABASE_POOLER_URL || process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_POOLER_URL or DATABASE_URL is required");
if (!values.apply) {
  console.log(JSON.stringify({ status: "dry_run", action: "backfill verification priority and due time", batchSize }));
  process.exit(0);
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 15_000,
  query_timeout: 120_000,
  application_name: "stack127-ad-network-queue-backfill",
});
let cursor = 0;
let updated = 0;
try {
  while (true) {
    const result = await pool.query(`
      with batch as materialized (
        select id, discovery_sources
        from public.ad_network_publishers
        where id > $1 and next_check_at is null
        order by id
        limit $2
      ), changed as (
        update public.ad_network_publishers publisher
        set
          verification_priority = case
            when exists (
              select 1 from jsonb_array_elements(batch.discovery_sources) source
              where source->>'source_key' <> 'majestic-million'
            ) then 80 else 10
          end,
          next_check_at = coalesce(publisher.next_check_at, now())
        from batch
        where publisher.id = batch.id
        returning publisher.id
      )
      select count(*)::int as updated, coalesce(max(id), $1)::bigint as cursor
      from changed
    `, [cursor, batchSize]);
    const count = result.rows[0].updated;
    cursor = Number(result.rows[0].cursor);
    updated += count;
    if (!count) break;
    if (updated % 100_000 === 0 || count < batchSize) {
      console.log(JSON.stringify({ status: "progress", updated, cursor }));
    }
    if (count < batchSize) break;
  }
  console.log(JSON.stringify({ status: "complete", updated, cursor }));
} finally {
  await pool.end();
}
