export async function createImportRun(client, { source, sourceUrl, notes }) {
  const result = await client.query(
    `
      insert into public.terminal_app_import_runs (source, source_url, status, notes)
      values ($1, $2, 'running', $3)
      returning id
    `,
    [source, sourceUrl ?? null, notes ?? null],
  );
  return result.rows[0].id;
}

export async function finishImportRun(client, importRunId, {
  status,
  discoveredCount,
  importedCount,
  updatedCount,
  errorCount,
  notes,
}) {
  await client.query(
    `
      update public.terminal_app_import_runs
      set status = $2,
          discovered_count = $3,
          imported_count = $4,
          updated_count = $5,
          error_count = $6,
          notes = coalesce($7, notes),
          finished_at = now()
      where id = $1
    `,
    [importRunId, status, discoveredCount, importedCount, updatedCount, errorCount, notes ?? null],
  );
}

/**
 * Record a failed source attempt so coverage reports never hide blocked or
 * broken sources. The run row keeps the error as its note.
 */
export async function recordFailedRun(client, { source, sourceUrl, notes, error }) {
  const importRunId = await createImportRun(client, { source, sourceUrl, notes: notes ?? null });
  await finishImportRun(client, importRunId, {
    status: "failed",
    discoveredCount: 0,
    importedCount: 0,
    updatedCount: 0,
    errorCount: 1,
    notes: `failed: ${String(error).slice(0, 500)}`,
  });
  return importRunId;
}

export async function upsertCandidate(client, candidate, importRunId) {
  const result = await client.query(
    `
      insert into public.terminal_app_candidates (
        import_run_id,
        source,
        source_type,
        source_key,
        source_url,
        name,
        slug,
        normalized_name,
        dedupe_key,
        canonical_repo_key,
        canonical_website_key,
        summary_raw,
        website_url,
        repository_url,
        docs_url,
        install_hint,
        license_raw,
        language_raw,
        stars,
        latest_version,
        latest_release_at,
        categories_raw,
        platforms_raw,
        install_methods_raw,
        payload,
        confidence_score
      )
      values (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22::text[], $23::text[], $24::text[], $25::jsonb, $26
      )
      on conflict (source, source_key) do update set
        import_run_id = excluded.import_run_id,
        source_url = coalesce(excluded.source_url, terminal_app_candidates.source_url),
        name = excluded.name,
        slug = excluded.slug,
        normalized_name = excluded.normalized_name,
        dedupe_key = excluded.dedupe_key,
        canonical_repo_key = coalesce(excluded.canonical_repo_key, terminal_app_candidates.canonical_repo_key),
        canonical_website_key = coalesce(excluded.canonical_website_key, terminal_app_candidates.canonical_website_key),
        summary_raw = coalesce(excluded.summary_raw, terminal_app_candidates.summary_raw),
        website_url = coalesce(excluded.website_url, terminal_app_candidates.website_url),
        repository_url = coalesce(excluded.repository_url, terminal_app_candidates.repository_url),
        docs_url = coalesce(excluded.docs_url, terminal_app_candidates.docs_url),
        install_hint = coalesce(excluded.install_hint, terminal_app_candidates.install_hint),
        license_raw = coalesce(excluded.license_raw, terminal_app_candidates.license_raw),
        language_raw = coalesce(excluded.language_raw, terminal_app_candidates.language_raw),
        stars = coalesce(excluded.stars, terminal_app_candidates.stars),
        latest_version = coalesce(excluded.latest_version, terminal_app_candidates.latest_version),
        latest_release_at = coalesce(excluded.latest_release_at, terminal_app_candidates.latest_release_at),
        categories_raw = case
          when cardinality(excluded.categories_raw) > 0 then excluded.categories_raw
          else terminal_app_candidates.categories_raw
        end,
        platforms_raw = case
          when cardinality(excluded.platforms_raw) > 0 then excluded.platforms_raw
          else terminal_app_candidates.platforms_raw
        end,
        install_methods_raw = case
          when cardinality(excluded.install_methods_raw) > 0 then excluded.install_methods_raw
          else terminal_app_candidates.install_methods_raw
        end,
        payload = excluded.payload,
        confidence_score = greatest(terminal_app_candidates.confidence_score, excluded.confidence_score),
        last_seen_at = now(),
        updated_at = now()
      returning (xmax = 0) as inserted
    `,
    [
      importRunId,
      candidate.source,
      candidate.source_type ?? "directory",
      candidate.source_key,
      candidate.source_url,
      candidate.name,
      candidate.slug,
      candidate.normalized_name,
      candidate.dedupe_key,
      candidate.canonical_repo_key,
      candidate.canonical_website_key,
      candidate.summary_raw,
      candidate.website_url,
      candidate.repository_url,
      candidate.docs_url,
      candidate.install_hint,
      candidate.license_raw,
      candidate.language_raw,
      candidate.stars,
      candidate.latest_version,
      candidate.latest_release_at,
      candidate.categories_raw,
      candidate.platforms_raw,
      candidate.install_methods_raw,
      JSON.stringify(candidate.payload ?? {}),
      candidate.confidence_score,
    ],
  );

  return Boolean(result.rows[0]?.inserted);
}

/**
 * Store a batch of normalized candidates inside one import run.
 * Uses chunked multi-row upserts so large catalogues stay fast; individual
 * chunk failures are counted instead of aborting the whole batch.
 */
export async function storeCandidates(client, candidates, { source, sourceUrl, notes } = {}) {
  const importRunId = await createImportRun(client, { source, sourceUrl, notes });
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  const chunkSize = 100;
  for (let offset = 0; offset < candidates.length; offset += chunkSize) {
    const chunk = candidates.slice(offset, offset + chunkSize);
    if (chunk.length === 0) continue;

    const values = [];
    const params = [];
    let paramIndex = 1;

    for (const candidate of chunk) {
      values.push(`(
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++},
        $${paramIndex++}, $${paramIndex++}::text[], $${paramIndex++}::text[], $${paramIndex++}::text[],
        $${paramIndex++}::jsonb, $${paramIndex++}
      )`);

      params.push(
        importRunId,
        candidate.source,
        candidate.source_type ?? "directory",
        candidate.source_key,
        candidate.source_url,
        candidate.name,
        candidate.slug,
        candidate.normalized_name,
        candidate.dedupe_key,
        candidate.canonical_repo_key,
        candidate.canonical_website_key,
        candidate.summary_raw,
        candidate.website_url,
        candidate.repository_url,
        candidate.docs_url,
        candidate.install_hint,
        candidate.license_raw,
        candidate.language_raw,
        candidate.stars,
        candidate.latest_version,
        candidate.latest_release_at,
        candidate.categories_raw,
        candidate.platforms_raw,
        candidate.install_methods_raw,
        JSON.stringify(candidate.payload ?? {}),
        candidate.confidence_score,
      );
    }

    try {
      const result = await client.query(
        `
          insert into public.terminal_app_candidates (
            import_run_id, source, source_type, source_key, source_url,
            name, slug, normalized_name, dedupe_key, canonical_repo_key,
            canonical_website_key, summary_raw, website_url, repository_url, docs_url,
            install_hint, license_raw, language_raw, stars, latest_version,
            latest_release_at, categories_raw, platforms_raw, install_methods_raw,
            payload, confidence_score
          )
          values ${values.join(", ")}
          on conflict (source, source_key) do update set
            import_run_id = excluded.import_run_id,
            source_url = coalesce(excluded.source_url, terminal_app_candidates.source_url),
            name = excluded.name,
            slug = excluded.slug,
            normalized_name = excluded.normalized_name,
            dedupe_key = excluded.dedupe_key,
            canonical_repo_key = coalesce(excluded.canonical_repo_key, terminal_app_candidates.canonical_repo_key),
            canonical_website_key = coalesce(excluded.canonical_website_key, terminal_app_candidates.canonical_website_key),
            summary_raw = coalesce(excluded.summary_raw, terminal_app_candidates.summary_raw),
            website_url = coalesce(excluded.website_url, terminal_app_candidates.website_url),
            repository_url = coalesce(excluded.repository_url, terminal_app_candidates.repository_url),
            docs_url = coalesce(excluded.docs_url, terminal_app_candidates.docs_url),
            install_hint = coalesce(excluded.install_hint, terminal_app_candidates.install_hint),
            license_raw = coalesce(excluded.license_raw, terminal_app_candidates.license_raw),
            language_raw = coalesce(excluded.language_raw, terminal_app_candidates.language_raw),
            stars = coalesce(excluded.stars, terminal_app_candidates.stars),
            latest_version = coalesce(excluded.latest_version, terminal_app_candidates.latest_version),
            latest_release_at = coalesce(excluded.latest_release_at, terminal_app_candidates.latest_release_at),
            categories_raw = case
              when cardinality(excluded.categories_raw) > 0 then excluded.categories_raw
              else terminal_app_candidates.categories_raw
            end,
            platforms_raw = case
              when cardinality(excluded.platforms_raw) > 0 then excluded.platforms_raw
              else terminal_app_candidates.platforms_raw
            end,
            install_methods_raw = case
              when cardinality(excluded.install_methods_raw) > 0 then excluded.install_methods_raw
              else terminal_app_candidates.install_methods_raw
            end,
            payload = excluded.payload,
            confidence_score = greatest(terminal_app_candidates.confidence_score, excluded.confidence_score),
            last_seen_at = now(),
            updated_at = now()
          returning (xmax = 0) as inserted
        `,
        params,
      );

      for (const row of result.rows) {
        if (row.inserted) inserted += 1;
        else updated += 1;
      }
    } catch (error) {
      // Fall back to row-by-row so one bad record cannot lose its chunk.
      for (const candidate of chunk) {
        try {
          if (await upsertCandidate(client, candidate, importRunId)) inserted += 1;
          else updated += 1;
        } catch (rowError) {
          errors += 1;
          console.warn(`warning ${candidate.slug}: ${rowError.message}`);
        }
      }
    }
  }

  await finishImportRun(client, importRunId, {
    status: errors > 0 ? "partial" : "completed",
    discoveredCount: candidates.length,
    importedCount: inserted,
    updatedCount: updated,
    errorCount: errors,
  });

  return { importRunId, discovered: candidates.length, inserted, updated, errors };
}
