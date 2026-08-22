/**
 * Build the per-source coverage report from terminal_app_import_runs and
 * terminal_app_candidates. Counts are live database facts, never estimates.
 */
export async function buildCoverage(client) {
  const runs = await client.query(
    `
      with run_summary as (
        select
          source,
          count(*) as run_count,
          sum(discovered_count)::int as discovered,
          sum(imported_count)::int as imported,
          sum(updated_count)::int as updated,
          sum(error_count)::int as errors,
          count(*) filter (where status = 'failed')::int as failed_runs,
          count(*) filter (where status = 'partial')::int as partial_runs,
          min(started_at) as first_run,
          max(finished_at) as last_run
        from public.terminal_app_import_runs
        group by source
      ),
      latest_run as (
        select distinct on (source)
          source,
          status as latest_status,
          notes as latest_note
        from public.terminal_app_import_runs
        order by source, finished_at desc nulls last, started_at desc, created_at desc
      )
      select
        run_summary.*,
        latest_run.latest_status,
        latest_run.latest_note
      from run_summary
      join latest_run using (source)
      order by source asc
    `,
  );

  const candidates = await client.query(
    `
      select
        source,
        count(*) as total,
        count(*) filter (where status = 'discovered') as discovered_now,
        count(*) filter (where status = 'duplicate') as duplicate,
        count(*) filter (where status = 'needs_review') as needs_review,
        count(*) filter (where status = 'enriched') as enriched,
        count(*) filter (where status = 'published') as published,
        count(*) filter (where status = 'excluded') as excluded,
        count(*) filter (where status = 'failed') as failed
      from public.terminal_app_candidates
      group by source
      order by source asc
    `,
  );

  const uniqueCounts = await client.query(
    `
      select
        (select count(*)::int from public.terminal_apps where published = true) as published_unique_apps,
        (select count(distinct dedupe_key)::int from public.terminal_app_candidates) as unique_candidate_keys,
        (select count(*)::int from public.terminal_app_candidates) as total_candidate_rows
    `,
  );

  const bySource = new Map();
  for (const row of runs.rows) {
    bySource.set(row.source, {
      source: row.source,
      runs: Number(row.run_count),
      discovered: Number(row.discovered),
      imported: Number(row.imported),
      updated: Number(row.updated),
      errors: Number(row.errors),
      status:
        row.latest_status === "failed"
          ? "failed"
          : row.latest_status === "partial" || row.latest_status === "running"
            ? "partial"
            : "completed",
      latest_status: row.latest_status,
      latest_note: row.latest_note ?? null,
      historical_failed_runs: Number(row.failed_runs),
      historical_partial_runs: Number(row.partial_runs),
      first_run: row.first_run,
      last_run: row.last_run,
      failure_note: row.latest_status === "failed" ? row.latest_note ?? null : null,
      deduplicated: 0,
      excluded: 0,
      enriched: 0,
      published_candidate_rows: 0,
      published: 0,
      failed_records: 0,
      queue_total: 0,
    });
  }

  for (const row of candidates.rows) {
    const entry = bySource.get(row.source) ?? {
      source: row.source,
      runs: 0,
      discovered: 0,
      imported: 0,
      updated: 0,
      errors: 0,
      status: "completed",
      latest_status: "completed",
      latest_note: null,
      historical_failed_runs: 0,
      historical_partial_runs: 0,
      first_run: null,
      last_run: null,
      failure_note: null,
    };
    entry.deduplicated = Number(row.duplicate);
    entry.excluded = Number(row.excluded);
    entry.enriched = Number(row.enriched);
    entry.published_candidate_rows = Number(row.published);
    entry.published = Number(row.published);
    entry.failed_records = Number(row.failed);
    entry.queue_total = Number(row.total);
    if (!bySource.has(row.source)) bySource.set(row.source, entry);
  }

  const unique = uniqueCounts.rows[0];
  const totals = {
    sources: bySource.size,
    discovered: 0,
    deduplicated: 0,
    excluded: 0,
    enriched: 0,
    published_candidate_rows: 0,
    published: 0,
    published_unique_apps: Number(unique.published_unique_apps),
    total_candidate_rows: Number(unique.total_candidate_rows),
    unique_candidate_keys: Number(unique.unique_candidate_keys),
    failed_sources: 0,
    partial_sources: 0,
    queue_total: 0,
  };

  for (const entry of bySource.values()) {
    totals.discovered += entry.discovered;
    totals.deduplicated += entry.deduplicated;
    totals.excluded += entry.excluded;
    totals.enriched += entry.enriched;
    totals.published_candidate_rows += entry.published_candidate_rows;
    totals.published += entry.published;
    totals.queue_total += entry.queue_total;
    if (entry.status === "failed") totals.failed_sources += 1;
    if (entry.status === "partial") totals.partial_sources += 1;
  }
  // Keep queue_total as alias for total_candidate_rows for backwards compat.
  totals.queue_total = totals.total_candidate_rows;

  return {
    generated_at: new Date().toISOString(),
    scope_note:
      "Counts cover the attempted approved source set only. This is not proof that every terminal app in existence has been found.",
    totals,
    sources: [...bySource.values()].sort((a, b) => a.source.localeCompare(b.source)),
  };
}

export function coverageToMarkdown(report) {
  const lines = [
    "# cli-apps discovery coverage report",
    "",
    `Generated: ${report.generated_at}`,
    "",
    `Scope: ${report.scope_note}`,
    "",
    `Unique published apps: ${report.totals.published_unique_apps} (from ${report.totals.published_candidate_rows} published candidate rows)`,
    `Total candidate rows: ${report.totals.total_candidate_rows} (unique dedupe keys: ${report.totals.unique_candidate_keys})`,
    "",
    "| source | status | runs | discovered | deduplicated | excluded | enriched | published candidate rows | failed records |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const s of report.sources) {
    lines.push(
      `| ${s.source} | ${s.status} | ${s.runs} | ${s.discovered} | ${s.deduplicated} | ${s.excluded} | ${s.enriched} | ${s.published_candidate_rows ?? s.published} | ${s.failed_records} |`,
    );
  }

  lines.push(
    `| **total** | ${report.totals.failed_sources} failed / ${report.totals.partial_sources} partial sources | | ${report.totals.discovered} | ${report.totals.deduplicated} | ${report.totals.excluded} | ${report.totals.enriched} | ${report.totals.published_candidate_rows} | |`,
  );

  const sourcesWithHistory = report.sources.filter(
    (s) => s.failure_note || s.historical_failed_runs > 0 || s.historical_partial_runs > 0,
  );
  if (sourcesWithHistory.length > 0) {
    lines.push("", "## Source failures and limits", "");
    for (const s of sourcesWithHistory) {
      const notes = [];
      if (s.failure_note) notes.push(s.failure_note);
      if (s.historical_failed_runs > 0 && !s.failure_note) {
        notes.push(`${s.historical_failed_runs} historical failed run(s)`);
      }
      if (s.historical_partial_runs > 0) {
        notes.push(`${s.historical_partial_runs} historical partial run(s)`);
      }
      if (!s.failure_note && s.status === "completed") {
        notes.push("latest attempt completed successfully");
      }
      lines.push(`- **${s.source}**: ${notes.join("; ")}`);
    }
  }

  return `${lines.join("\n")}\n`;
}
