export function createLocalDiscoveryStore(database) {
  const insertPublisher = database.prepare(`
    insert into publishers (
      normalized_domain, display_domain, first_seen_at, last_discovered_at,
      next_check_at, verification_priority, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?)
    on conflict(normalized_domain) do nothing
  `);
  const findPublisher = database.prepare("select id from publishers where normalized_domain = ?");
  const findSource = database.prepare(`
    select 1 from publisher_sources where publisher_id = ? and source_key = ?
  `);
  const insertSource = database.prepare(`
    insert into publisher_sources (
      publisher_id, source_key, source_url, domain_as_supplied,
      license_attribution, first_seen_at, last_seen_at
    ) values (?, ?, ?, ?, ?, ?, ?)
    on conflict(publisher_id, source_key) do update set
      source_url = excluded.source_url,
      domain_as_supplied = coalesce(excluded.domain_as_supplied, publisher_sources.domain_as_supplied),
      license_attribution = coalesce(excluded.license_attribution, publisher_sources.license_attribution),
      last_seen_at = excluded.last_seen_at
  `);
  const markNewSource = database.prepare(`
    update publishers set
      last_discovered_at = ?,
      verification_priority = max(verification_priority, ?),
      next_check_at = case when next_check_at is null or next_check_at > ? then ? else next_check_at end,
      updated_at = ?
    where id = ?
  `);
  const markSeen = database.prepare(`
    update publishers set last_discovered_at = ?, updated_at = ? where id = ?
  `);

  return {
    upsertBatch(source, batch, seenAt) {
      let inserted = 0;
      let newSightings = 0;
      const priority = source.verificationPriority ?? (source.kind === "majestic-csv" ? 10 : 80);
      database.exec("begin immediate");
      try {
        for (const candidate of batch) {
          const result = insertPublisher.run(
            candidate.domain,
            candidate.domain,
            seenAt,
            seenAt,
            seenAt,
            priority,
            seenAt,
            seenAt,
          );
          inserted += Number(result.changes);
          const publisher = findPublisher.get(candidate.domain);
          const existed = Boolean(findSource.get(publisher.id, source.key));
          insertSource.run(
            publisher.id,
            source.key,
            source.url ?? null,
            candidate.supplied ?? candidate.domain,
            source.licenseAttribution ?? null,
            seenAt,
            seenAt,
          );
          if (!existed) {
            if (!result.changes) newSightings += 1;
            markNewSource.run(seenAt, priority, seenAt, seenAt, seenAt, publisher.id);
          } else {
            markSeen.run(seenAt, seenAt, publisher.id);
          }
        }
        database.exec("commit");
      } catch (error) {
        database.exec("rollback");
        throw error;
      }
      return { inserted, newSightings };
    },

    existingSourceDomains(sourceKey) {
      return new Set(database.prepare(`
        select publisher.normalized_domain
        from publisher_sources source
        join publishers publisher on publisher.id = source.publisher_id
        where source.source_key = ?
      `).all(sourceKey).map((row) => row.normalized_domain));
    },

    readState() {
      const state = {};
      for (const row of database.prepare("select * from source_state").all()) {
        state[row.source_key] = {
          url: row.source_url,
          etag: row.etag,
          lastModified: row.last_modified,
          candidates: row.candidate_count,
          completedAt: row.completed_at,
        };
      }
      return state;
    },

    saveSourceState(sourceKey, state) {
      database.prepare(`
        insert into source_state (
          source_key, source_url, etag, last_modified, candidate_count,
          completed_at, last_status, last_error
        ) values (?, ?, ?, ?, ?, ?, 'complete', null)
        on conflict(source_key) do update set
          source_url = excluded.source_url,
          etag = excluded.etag,
          last_modified = excluded.last_modified,
          candidate_count = excluded.candidate_count,
          completed_at = excluded.completed_at,
          last_status = 'complete',
          last_error = null
      `).run(
        sourceKey,
        state.url,
        state.etag ?? null,
        state.lastModified ?? null,
        state.candidates,
        state.completedAt,
      );
    },

    saveSourceFailure(source, error) {
      const previous = database.prepare("select * from source_state where source_key = ?").get(source.key);
      database.prepare(`
        insert into source_state (
          source_key, source_url, etag, last_modified, candidate_count,
          completed_at, last_status, last_error
        ) values (?, ?, ?, ?, ?, ?, 'failed', ?)
        on conflict(source_key) do update set
          source_url = excluded.source_url,
          last_status = 'failed',
          last_error = excluded.last_error
      `).run(
        source.key,
        source.url,
        previous?.etag ?? null,
        previous?.last_modified ?? null,
        previous?.candidate_count ?? 0,
        previous?.completed_at ?? new Date(0).toISOString(),
        String(error.message).slice(0, 2000),
      );
    },
  };
}
