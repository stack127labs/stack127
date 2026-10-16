import { nextCheckAt, relationshipAfterMiss } from "./verifier-store.mjs";

const SUCCESSFUL_OUTCOMES = new Set(["matched", "no_match", "no_ads_txt", "not_modified"]);

function parsePublisher(row, database) {
  if (!row) return row;
  return {
    ...row,
    review_relationships: database.prepare("select * from relationships where publisher_id=? and status='needs_review' and verification_method='discovery_hint_and_ads_txt_system'")
      .all(row.id).map(relationship=>({...relationship,evidence:JSON.parse(relationship.evidence)})),
    last_check_evidence: JSON.parse(row.last_check_evidence || "{}"),
    discovery_sources: database.prepare(`
      select source_key, source_url, domain_as_supplied, license_attribution,
        first_seen_at, last_seen_at
      from publisher_sources where publisher_id = ? order by first_seen_at, source_key
    `).all(row.id),
  };
}

function placeholders(length) {
  return Array.from({ length }, () => "?").join(", ");
}

export function claimLocalPublishers(database, { limit, leaseMinutes, domains = [], uncheckedOnly = false }) {
  const now = new Date().toISOString();
  const leaseUntil = new Date(Date.now() + leaseMinutes * 60_000).toISOString();
  database.exec("begin immediate");
  try {
    const select = (size, onlyNew) => database.prepare(`
      select id from publishers where (lease_until is null or lease_until < ?)
        and (${domains.length ? "1 = 1" : "next_check_at is null or next_check_at <= ?"})
        ${domains.length ? `and normalized_domain in (${placeholders(domains.length)})` : ""}
        ${onlyNew ? "and last_check_outcome is null" : ""}
      order by verification_priority desc, next_check_at asc, id limit ?
    `).all(now, ...(domains.length ? domains : [now]), size);
    const lease = rows => {
      if (rows.length) database.prepare(`update publishers set lease_until = ?, updated_at = ?
        where id in (${placeholders(rows.length)})`).run(leaseUntil, now, ...rows.map(row => row.id));
    };
    // Reserve a quarter for new sites so recurring high-priority rechecks cannot starve them.
    const rows = select(uncheckedOnly || domains.length ? limit : Math.max(1, Math.ceil(limit / 4)), uncheckedOnly || !domains.length);
    lease(rows);
    if (!uncheckedOnly && !domains.length && rows.length < limit) {
      const rest = select(limit - rows.length, false);
      lease(rest); rows.push(...rest);
    }
    database.exec("commit");
    return rows.map(row => parsePublisher(database.prepare("select * from publishers where id = ?").get(row.id), database));
  } catch (error) { database.exec("rollback"); throw error; }
}

export function selectLocalPublishers(database, { limit, domains = [], uncheckedOnly = false }) {
  const now = new Date().toISOString();
  const rows = database.prepare(`select * from publishers
    where (${domains.length ? "1 = 1" : "next_check_at is null or next_check_at <= ?"})
      ${domains.length ? `and normalized_domain in (${placeholders(domains.length)})` : ""}
      ${uncheckedOnly ? "and last_check_outcome is null" : ""}
    order by verification_priority desc, next_check_at asc, id limit ?
  `).all(...(domains.length ? domains : [now]), limit);
  return rows.map(row => parsePublisher(row, database));
}

function publisherStatus(outcome) {
  if (SUCCESSFUL_OUTCOMES.has(outcome)) return "checked";
  if (outcome === "invalid_domain" || outcome === "invalid_ads_txt") return "invalid";
  return "unreachable";
}

function upsertMatches(database, publisherId, matches, checkedAt) {
  const statement = database.prepare(`
    insert into relationships (
      ad_network_id, publisher_id, status, relationship_type,
      verification_method, evidence, first_confirmed_at, last_confirmed_at,
      ended_at, consecutive_misses, first_missed_at, last_missed_at,
      created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, null, 0, null, null, ?, ?)
    on conflict(ad_network_id, publisher_id) do update set
      status = case
        when excluded.status = 'needs_review' and relationships.status <> 'needs_review' then relationships.status
        else excluded.status
      end,
      relationship_type = case
        when excluded.status = 'needs_review' and relationships.status <> 'needs_review' then relationships.relationship_type
        else excluded.relationship_type
      end,
      verification_method = case
        when excluded.status = 'needs_review' and relationships.status <> 'needs_review' then relationships.verification_method
        else excluded.verification_method
      end,
      evidence = case
        when excluded.status = 'needs_review' and relationships.status <> 'needs_review' then relationships.evidence
        when excluded.status = 'needs_review' and relationships.verification_method = 'discovery_hint_and_ads_txt_system'
          then json_set(excluded.evidence, '$.matched_signal', json_extract(relationships.evidence, '$.matched_signal'))
        else excluded.evidence
      end,
      first_confirmed_at = case
        when excluded.status = 'confirmed' then coalesce(relationships.first_confirmed_at, excluded.first_confirmed_at)
        else relationships.first_confirmed_at
      end,
      last_confirmed_at = case
        when excluded.status = 'confirmed' then excluded.last_confirmed_at
        else relationships.last_confirmed_at
      end,
      ended_at = case when excluded.status = 'confirmed' then null else relationships.ended_at end,
      consecutive_misses = case when excluded.status = 'confirmed' then 0 else relationships.consecutive_misses end,
      first_missed_at = case when excluded.status = 'confirmed' then null else relationships.first_missed_at end,
      last_missed_at = case when excluded.status = 'confirmed' then null else relationships.last_missed_at end,
      updated_at = excluded.updated_at
  `);
  for (const match of matches) {
    const confirmedAt = match.status === "confirmed" ? checkedAt : null;
    statement.run(
      match.networkId,
      publisherId,
      match.status,
      match.status === "needs_review" ? "unknown" : match.relationshipType,
      match.verificationMethod,
      JSON.stringify(match.evidence),
      confirmedAt,
      confirmedAt,
      checkedAt,
      checkedAt,
    );
  }
}

function ageMissingRelationships(database, existing, positiveIds, checkedAt) {
  const statement = database.prepare(`
    update relationships set status = ?, ended_at = ?, consecutive_misses = ?,
      first_missed_at = coalesce(first_missed_at, ?), last_missed_at = ?, updated_at = ?
    where ad_network_id = ? and publisher_id = ?
  `);
  for (const relationship of existing) {
    if (!new Set(["confirmed", "stale"]).has(relationship.status) || positiveIds.has(String(relationship.ad_network_id))) continue;
    const { misses, status, endedAt } = relationshipAfterMiss(relationship, checkedAt);
    statement.run(
      status,
      endedAt ? endedAt.toISOString() : null,
      misses,
      checkedAt,
      checkedAt,
      checkedAt,
      relationship.ad_network_id,
      relationship.publisher_id,
    );
  }
}

export function saveLocalVerification(database, publisher, result) {
  database.exec("begin immediate");
  try {
    const existing = database.prepare("select * from relationships where publisher_id = ?").all(publisher.id);
    const failures = SUCCESSFUL_OUTCOMES.has(result.outcome) ? 0 : publisher.consecutive_failures + 1;
    const positive = result.matches?.confirmed ?? [];
    const review = result.matches?.review ?? [];
    const positiveIds = new Set([
      ...positive.map((match) => String(match.networkId)),
      ...(result.unchangedNetworkIds ?? []).map(String),
    ]);
    const missingActive = existing.filter((relationship) =>
      new Set(["confirmed", "stale"]).has(relationship.status)
      && !positiveIds.has(String(relationship.ad_network_id))
    );

    if (result.outcome === "not_modified") {
      if ((result.unchangedNetworkIds ?? []).length) {
        database.prepare(`
          update relationships set status = 'confirmed', ended_at = null,
            last_confirmed_at = ?, consecutive_misses = 0,
            first_missed_at = null, last_missed_at = null, updated_at = ?
          where publisher_id = ? and status in ('confirmed', 'stale')
            and ad_network_id in (${placeholders(result.unchangedNetworkIds.length)})
        `).run(result.checkedAt, result.checkedAt, publisher.id, ...result.unchangedNetworkIds);
      }
      ageMissingRelationships(database, existing, positiveIds, result.checkedAt);
    } else {
      upsertMatches(database, publisher.id, [...positive, ...review], result.checkedAt);
      if (SUCCESSFUL_OUTCOMES.has(result.outcome)) {
        ageMissingRelationships(database, existing, positiveIds, result.checkedAt);
      }
    }

    const defaultNext = nextCheckAt(result.outcome, failures, new Date(result.checkedAt));
    const relationshipNext = missingActive.length && SUCCESSFUL_OUTCOMES.has(result.outcome)
      ? new Date(new Date(result.checkedAt).getTime() + (missingActive.some((item) => item.consecutive_misses >= 1) ? 24 : 48) * 3_600_000)
      : null;
    database.prepare(`
      update publishers set
        last_checked_at = ?, check_status = ?, check_attempt_count = check_attempt_count + 1,
        consecutive_failures = ?, last_check_outcome = ?, last_check_evidence = ?,
        last_successful_check_at = case when ? then ? else last_successful_check_at end,
        ads_txt_hash = coalesce(?, ads_txt_hash),
        ads_txt_etag = coalesce(?, ads_txt_etag),
        ads_txt_last_modified = coalesce(?, ads_txt_last_modified),
        next_check_at = ?, lease_until = null, updated_at = ?
      where id = ?
    `).run(
      result.checkedAt,
      publisherStatus(result.outcome),
      failures,
      result.outcome,
      JSON.stringify(result.evidence),
      SUCCESSFUL_OUTCOMES.has(result.outcome) ? 1 : 0,
      result.checkedAt,
      result.sha256 ?? null,
      result.etag ?? null,
      result.lastModified ?? null,
      (relationshipNext ?? defaultNext).toISOString(),
      result.checkedAt,
      publisher.id,
    );
    if (result.homepageFacts) {
      database.prepare('update publishers set platform=?,favicon=? where id=?')
        .run(result.homepageFacts.platform,result.homepageFacts.favicon,publisher.id);
      database.prepare(`insert into enrichment_state(publisher_id,kind,status,checked_at,retry_at,data)
        values(?,'homepage','measured',?,null,?) on conflict(publisher_id,kind) do update set
        status=excluded.status,checked_at=excluded.checked_at,retry_at=null,data=excluded.data`)
        .run(publisher.id,result.checkedAt,JSON.stringify(result.homepageFacts));
    }
    if (result.adsTxtSummary) database.prepare('update publishers set ads_txt_summary = ? where id = ?')
      .run(JSON.stringify(result.adsTxtSummary), publisher.id);
    database.exec("commit");
  } catch (error) {
    database.exec("rollback");
    throw error;
  }
}

export function releaseLocalLease(database, publisherId) {
  database.prepare("update publishers set lease_until = null, updated_at = ? where id = ?")
    .run(new Date().toISOString(), publisherId);
}
