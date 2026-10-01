#!/usr/bin/env node

import { parseArgs } from "node:util";
import { defaultLocalDatabasePath, openLocalDatabase } from "./local-db.mjs";

const { values } = parseArgs({
  options: {
    "local-database": { type: "string", default: defaultLocalDatabasePath },
    json: { type: "boolean", default: false },
  },
});
const database = openLocalDatabase(values["local-database"]);
try {
  const scalar = (sql, ...params) => Number(database.prepare(sql).get(...params).value);
  const now = new Date().toISOString();
  const summary = {
    database: values["local-database"],
    generatedAt: now,
    domains: {
      total: scalar("select count(*) value from publishers"),
      due: scalar("select count(*) value from publishers where next_check_at is null or next_check_at <= ?", now),
      leased: scalar("select count(*) value from publishers where lease_until >= ?", now),
      checked: scalar("select count(*) value from publishers where last_checked_at is not null"),
    },
    relationships: Object.fromEntries(database.prepare(`
      select status, count(*) count from relationships group by status order by status
    `).all().map((row) => [row.status, Number(row.count)])),
    outcomes: Object.fromEntries(database.prepare(`
      select coalesce(last_check_outcome, 'unverified') outcome, count(*) count
      from publishers group by last_check_outcome order by count(*) desc
    `).all().map((row) => [row.outcome, Number(row.count)])),
    sources: database.prepare(`
      select source_key, candidate_count, completed_at, last_status, last_error
      from source_state order by source_key
    `).all(),
    phase2: {
      totalSources: scalar("select count(*) value from collector_checkpoints"),
      statuses: Object.fromEntries(database.prepare(`
        select status, count(*) count
        from collector_checkpoints group by status order by status
      `).all().map((row) => [row.status, Number(row.count)])),
      candidates: scalar("select coalesce(sum(collected), 0) value from collector_checkpoints"),
    },
    latestRuns: database.prepare(`
      select worker, started_at, finished_at, status, summary
      from worker_runs order by id desc limit 10
    `).all().map((row) => ({ ...row, summary: JSON.parse(row.summary) })),
  };
  if (values.json) console.log(JSON.stringify(summary, null, 2));
  else {
    console.log(`Local ad network database: ${summary.database}`);
    console.log(`Domains: ${summary.domains.total} total, ${summary.domains.checked} checked, ${summary.domains.due} due, ${summary.domains.leased} leased`);
    console.log(`Outcomes: ${JSON.stringify(summary.outcomes)}`);
    console.log(`Relationships: ${JSON.stringify(summary.relationships)}`);
    console.log(`Recurring sources: ${summary.sources.length}`);
    console.log(`Phase 2 sources: ${summary.phase2.totalSources}, ${summary.phase2.candidates} candidates, ${JSON.stringify(summary.phase2.statuses)}`);
    if (summary.latestRuns[0]) console.log(`Latest worker run: ${JSON.stringify(summary.latestRuns[0])}`);
  }
} finally {
  database.close();
}
