const SUCCESSFUL_OUTCOMES = new Set(["matched", "no_match", "no_ads_txt", "not_modified"]);

// Weekly positive checks plus 6/24/72/168-hour retries get several chances.
// Thirty days without successful page confirmation is unknown, never a departure.
export const HOMEPAGE_CONFIRMATION_MAX_AGE_MS = 30 * 86_400_000;
// The time of the last positive page evidence. Older not-modified checks could
// move last_confirmed_at without fetching the page, so the saved evidence time
// wins when it is earlier. Without either, the confirmation counts as expired.
export function homepageEvidenceTime(relationship) {
  let evidence = relationship.evidence;
  if (typeof evidence === "string") {
    try { evidence = JSON.parse(evidence); } catch { evidence = null; }
  }
  const times = [Date.parse(evidence?.checked_at ?? ""), relationship.last_confirmed_at ? new Date(relationship.last_confirmed_at).getTime() : NaN]
    .filter(Number.isFinite);
  return times.length ? Math.min(...times) : null;
}

export function homepageConfirmationExpired(relationship, checkedAt) {
  if (relationship.status !== "confirmed"
    || !["ads_txt_and_adsense_account", "ads_txt_and_page_signature", "page_signature"].includes(relationship.verification_method)) return false;
  const evidenceTime = homepageEvidenceTime(relationship);
  return evidenceTime === null || Date.parse(checkedAt) - evidenceTime >= HOMEPAGE_CONFIRMATION_MAX_AGE_MS;
}

export function nextCheckAt(outcome, failures = 0, now = new Date()) {
  const milliseconds = {
    matched: 7 * 86_400_000,
    no_match: 90 * 86_400_000,
    no_ads_txt: 30 * 86_400_000,
    not_modified: 7 * 86_400_000,
    robots_blocked: 7 * 86_400_000,
    invalid_ads_txt: 14 * 86_400_000,
    invalid_domain: 365 * 86_400_000,
  }[outcome] ?? [6, 24, 72, 168][Math.min(failures, 3)] * 3_600_000;
  return new Date(now.getTime() + milliseconds);
}

export function relationshipAfterMiss(relationship, checkedAt) {
  const now = new Date(checkedAt);
  const misses = relationship.consecutive_misses + 1;
  const firstMissedAt = relationship.first_missed_at ? new Date(relationship.first_missed_at) : now;
  const priorMissAt = relationship.last_missed_at ? new Date(relationship.last_missed_at) : null;
  let status = relationship.status;
  let endedAt = relationship.ended_at;
  if (misses >= 3 && now.getTime() - firstMissedAt.getTime() >= 7 * 86_400_000) {
    status = "ended";
    endedAt = now;
  } else if (misses >= 2 && priorMissAt && now.getTime() - priorMissAt.getTime() >= 48 * 3_600_000) {
    status = "stale";
  }
  return { misses, firstMissedAt, status, endedAt };
}

function publisherStatus(outcome) {
  if (SUCCESSFUL_OUTCOMES.has(outcome)) return "checked";
  if (outcome === "invalid_domain" || outcome === "invalid_ads_txt") return "invalid";
  return "unreachable";
}

export async function claimPublishers(client, { limit, leaseMinutes, domains = [] }) {
  const domainFilter = domains.length ? "and publisher.normalized_domain = any($3::text[])" : "";
  const result = await client.query(`
    with due as materialized (
      select publisher.id
      from public.ad_network_publishers publisher
      where (publisher.lease_until is null or publisher.lease_until < now())
        and ($4::boolean or publisher.next_check_at is null or publisher.next_check_at <= now())
        ${domainFilter}
      order by
        publisher.verification_priority desc,
        exists (
          select 1 from public.ad_network_publisher_relationships relationship
          where relationship.publisher_id = publisher.id
            and relationship.status in ('confirmed', 'stale')
        ) desc,
        publisher.next_check_at asc nulls first,
        publisher.id
      for update skip locked
      limit $1
    )
    update public.ad_network_publishers publisher
    set lease_until = now() + make_interval(mins => $2::int)
    from due
    where publisher.id = due.id
    returning publisher.*
  `, [limit, leaseMinutes, domains, domains.length > 0]);
  return result.rows;
}

export async function selectPublishers(client, { limit, domains = [] }) {
  const result = await client.query(`
    select publisher.*,coalesce((select jsonb_agg(to_jsonb(r)||jsonb_build_object('ad_network_id',r.ad_network_id::text))
      from public.ad_network_publisher_relationships r where r.publisher_id=publisher.id
        and r.status='needs_review' and r.verification_method='discovery_hint_and_ads_txt_system'),'[]'::jsonb) as review_relationships
    from public.ad_network_publishers publisher
    where ($2::boolean or publisher.next_check_at is null or publisher.next_check_at <= now())
      and ($2::boolean = false or publisher.normalized_domain = any($3::text[]))
    order by publisher.verification_priority desc,
      publisher.next_check_at asc nulls first, publisher.id
    limit $1
  `, [limit, domains.length > 0, domains]);
  return result.rows;
}

async function relationshipRows(client, publisherId) {
  const result = await client.query(`
    select * from public.ad_network_publisher_relationships
    where publisher_id = $1
    for update
  `, [publisherId]);
  return result.rows;
}

async function upsertMatches(client, publisherId, matches, checkedAt) {
  for (const match of matches) {
    if (match.status === "needs_review") {
      await client.query(`
        insert into public.ad_network_publisher_relationships (
          ad_network_id, publisher_id, status, relationship_type,
          verification_method, evidence, consecutive_misses
        ) values ($1, $2, 'needs_review', 'unknown', $3, $4::jsonb, 0)
        on conflict (ad_network_id, publisher_id) do update set
          verification_method = excluded.verification_method,
          evidence = excluded.evidence
        where ad_network_publisher_relationships.status = 'needs_review'
      `, [match.networkId, publisherId, match.verificationMethod, JSON.stringify(match.evidence)]);
      continue;
    }
    await client.query(`
      insert into public.ad_network_publisher_relationships (
        ad_network_id, publisher_id, status, relationship_type,
        verification_method, evidence, first_confirmed_at, last_confirmed_at,
        ended_at, consecutive_misses, first_missed_at, last_missed_at
      ) values ($1, $2, $3, $4, $5, $6::jsonb,
        case when $3 = 'confirmed' then $7::timestamptz else null end,
        case when $3 = 'confirmed' then $7::timestamptz else null end,
        null, 0, null, null)
      on conflict (ad_network_id, publisher_id) do update set
        status = excluded.status,
        relationship_type = excluded.relationship_type,
        verification_method = excluded.verification_method,
        evidence = excluded.evidence || case when ad_network_publisher_relationships.evidence ? 'homepage_miss_correction'
          then jsonb_build_object('homepage_miss_correction',ad_network_publisher_relationships.evidence->'homepage_miss_correction')
          else '{}'::jsonb end,
        first_confirmed_at = case
          when excluded.status = 'confirmed' then coalesce(ad_network_publisher_relationships.first_confirmed_at, excluded.first_confirmed_at)
          else ad_network_publisher_relationships.first_confirmed_at
        end,
        last_confirmed_at = case
          when excluded.status = 'confirmed' then excluded.last_confirmed_at
          else ad_network_publisher_relationships.last_confirmed_at
        end,
        ended_at = null,
        consecutive_misses = 0,
        first_missed_at = null,
        last_missed_at = null
    `, [match.networkId, publisherId, match.status, match.relationshipType,
      match.verificationMethod, JSON.stringify(match.evidence), checkedAt]);
  }
}

async function ageMissingRelationships(client, existing, positiveIds, checkedAt, evidence) {
  for (const relationship of existing) {
    if (!new Set(["confirmed", "stale"]).has(relationship.status) || positiveIds.has(String(relationship.ad_network_id))) continue;
    const { misses, status, endedAt } = relationshipAfterMiss(relationship, checkedAt);
    await client.query(`
      update public.ad_network_publisher_relationships
      set status = $3, ended_at = $4, consecutive_misses = $5,
        first_missed_at = coalesce(first_missed_at, $2), last_missed_at = $2,
        evidence = evidence || jsonb_build_object('last_absence', $7::jsonb)
      where ad_network_id = $1 and publisher_id = $6
    `, [relationship.ad_network_id, checkedAt, status, endedAt, misses, relationship.publisher_id, JSON.stringify({ checked_at: checkedAt, homepage: evidence?.homepage ?? null, ads_txt_sha256: evidence?.ads_txt_sha256 ?? null })]);
  }
}

export async function saveVerification(pool, publisher, result) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const existing = await relationshipRows(client, publisher.id);
    const conclusive = SUCCESSFUL_OUTCOMES.has(result.outcome) && !result.inconclusiveNetworkIds?.length;
    const failures = conclusive ? 0 : (publisher.consecutive_failures ?? 0) + 1;
    const positive = result.matches?.confirmed ?? [];
    const review = result.matches?.review ?? [];
    const positiveIds = new Set([
      ...positive.map((match) => String(match.networkId)),
      ...(result.unchangedNetworkIds ?? []).map(String),
    ]);
    // Unknown evidence never adds misses; old confirmation expires below.
    const protectedIds = new Set([...positiveIds, ...(result.inconclusiveNetworkIds ?? []).map(String)]);
    const missingActive = existing.filter((relationship) =>
      new Set(["confirmed", "stale"]).has(relationship.status)
      && !protectedIds.has(String(relationship.ad_network_id))
    );

    if (result.outcome === "not_modified") {
      await client.query(`
        update public.ad_network_publisher_relationships
        set status = 'confirmed', ended_at = null, last_confirmed_at = $2, consecutive_misses = 0,
          first_missed_at = null, last_missed_at = null
        where publisher_id = $1 and status in ('confirmed', 'stale')
          and ad_network_id = any($3::bigint[])
      `, [publisher.id, result.checkedAt, result.unchangedNetworkIds ?? []]);
      await ageMissingRelationships(client, existing, protectedIds, result.checkedAt, result.evidence);
    } else {
      await upsertMatches(client, publisher.id, [...positive, ...review], result.checkedAt);
      if (SUCCESSFUL_OUTCOMES.has(result.outcome)) {
        await ageMissingRelationships(client, existing, protectedIds, result.checkedAt, result.evidence);
      }
    }

    for (const relationship of existing) {
      // Every check without fresh page evidence can expire an old confirmation,
      // including a valid absence. The status guard keeps an ended relationship ended.
      if (!positiveIds.has(String(relationship.ad_network_id))
        && homepageConfirmationExpired(relationship, result.checkedAt)) {
        await client.query(`update public.ad_network_publisher_relationships set status='stale'
          where ad_network_id=$1 and publisher_id=$2 and status='confirmed'`,
        [relationship.ad_network_id, relationship.publisher_id]);
      }
    }

    const defaultNextCheck = nextCheckAt(result.inconclusiveNetworkIds?.length ? "temporary_error" : result.outcome, Math.max(0, failures - 1), new Date(result.checkedAt));
    const relationshipNextCheck = missingActive.length && conclusive
      ? new Date(new Date(result.checkedAt).getTime() + (missingActive.some((relationship) => relationship.consecutive_misses >= 1) ? 24 : 48) * 3_600_000)
      : null;

    await client.query(`
      update public.ad_network_publishers set
        last_checked_at = $2,
        check_status = $3,
        check_attempt_count = check_attempt_count + 1,
        consecutive_failures = $4,
        last_check_outcome = $5,
        last_check_evidence = $6::jsonb,
        last_successful_check_at = case when $7 then $2 else last_successful_check_at end,
        ads_txt_hash = coalesce($8, ads_txt_hash),
        ads_txt_etag = coalesce($9, ads_txt_etag),
        ads_txt_last_modified = coalesce($10, ads_txt_last_modified),
        next_check_at = $11,
        lease_until = null
      where id = $1
    `, [publisher.id, result.checkedAt, publisherStatus(result.inconclusiveNetworkIds?.length ? "temporary_error" : result.outcome), failures,
      result.outcome, JSON.stringify(result.evidence), conclusive,
      result.sha256 ?? null, result.etag ?? null, result.lastModified ?? null,
      relationshipNextCheck ?? defaultNextCheck]);
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function releaseLease(pool, publisherId) {
  await pool.query(`update public.ad_network_publishers set lease_until = null where id = $1`, [publisherId]);
}
