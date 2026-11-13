#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { targetPool } from './runtime-db.mjs';
import { loadLocalNetworks } from './local-db.mjs';
import { assertLocalCatalog } from './identity-catalog.mjs';
import { verifyPublisher } from './verify-publisher.mjs';
import { snapshotCounts } from './snapshot.mjs';

// The code predates the production runner. The earliest affected homepage-method
// miss retained in either store is 2026-09-28 (not the November loss spike).
export const FAULT_SINCE = '2026-09-28T00:00:00.000Z';
export const CORRECTION = 'homepage-misses-v1';
const methods = new Set(['ads_txt_and_adsense_account', 'ads_txt_and_page_signature', 'page_signature']);
const json = value => typeof value === 'string' ? JSON.parse(value) : value ?? {};
const iso = value => value == null ? null : new Date(value).toISOString();

export function correctionEligibility(row, since = FAULT_SINCE) {
  const evidence = json(row.evidence), check = json(row.last_check_evidence);
  if (evidence.homepage_miss_correction?.version === CORRECTION) return row.history_repaired_at ? 'history_complete' : 'already_restored';
  if (!methods.has(row.verification_method)) return 'not_homepage_dependent';
  if (!row.first_confirmed_at || !row.last_confirmed_at || row.relationship_type === 'unknown'
    || !['checked_url','checked_at','matched_signal','parser_version'].every(key => Object.hasOwn(evidence,key))) return 'no_original_confirmation';
  if (evidence.homepage_miss_correction?.version === CORRECTION && row.status === 'confirmed'
    && !row.consecutive_misses) return 'already_restored';
  if (!['confirmed','stale','ended'].includes(row.status) || !row.consecutive_misses) return 'not_damaged';
  if (!row.first_missed_at || new Date(row.first_missed_at).getTime() < Date.parse(since)) return 'before_fault_window';
  // A new verifier records obtained evidence of absence. Never undo that.
  if (evidence.last_absence) return 'recorded_absence';
  if (new Date(row.last_checked_at).getTime() !== new Date(row.last_missed_at).getTime()) return 'later_or_unknown_check';
  // Historical full-fetch misses have no homepage outcome. They cannot be
  // distinguished from genuine absences. A 304 proves this miss had no page.
  if (row.last_check_outcome !== 'not_modified' && check.homepage?.outcome !== 'inconclusive') {
    return 'no_proof_of_inconclusive_miss';
  }
  return 'needs_live_confirmation';
}

export function correctionConfirmation(row, result) {
  const match = result.matches?.confirmed.find(match => String(match.networkId) === String(row.ad_network_id));
  if (!match) return result.inconclusiveNetworkIds?.length ? 'live_check_inconclusive' : 'live_network_absent';
  const original = json(row.evidence);
  if (original.page_signature) {
    // Review-promoted evidence requires BOTH the exact authorized seller and
    // its configured live tag. A matching generic tag alone is insufficient.
    const seller = original.matched_signal?.split(',').map(value => value.trim());
    const current = result.evidence?.ads_txt_cache?.parsed?.sellers ?? [];
    if (!seller || seller.length !== 3 || !current.some(item => item.adSystem === seller[0]
      && item.sellerId === seller[1] && item.relationship === seller[2])
      || match.evidence.matched_signal !== original.page_signature) return 'live_signal_changed';
  } else if (match.evidence.matched_signal !== original.matched_signal) return 'live_signal_changed';
  const oldHash = json(row.evidence).ads_txt_sha256;
  if (oldHash && oldHash !== result.sha256) return 'ads_txt_changed_since_confirmation';
  return 'restore';
}

export function restoration(row, checkedAt, confirmation = null) {
  return {
    ...json(row.evidence),
    homepage_miss_correction: {
      version: CORRECTION, corrected_at: checkedAt, confirmation,
      prior_status: row.status, prior_ended_at: iso(row.ended_at),
      first_missed_at: iso(row.first_missed_at), last_missed_at: iso(row.last_missed_at),
      original_first_confirmed_at: iso(row.first_confirmed_at),
    },
  };
}

export async function planCorrections(rows, networks, { since = FAULT_SINCE, limit = 100, historyLimit = limit, afterDomain = '', statsOnly = false, verify = verifyPublisher } = {}) {
  const counts = {}, restores = [], repaired = [];
  const bump = reason => { counts[reason] = (counts[reason] ?? 0) + 1; };
  let checked = 0, nextAfterDomain = afterDomain;
  const checkedDomains = new Map(), historyDomains = new Set();
  let nextHistoryAfterDomain = afterDomain;
  // Bound work and issue requests one domain at a time; no protection bypass.
  for (const row of rows) {
    const reason = correctionEligibility(row, since);
    if (row.normalized_domain <= afterDomain) { bump('before_cursor'); continue; }
    if (reason === 'already_restored') {
      if (!historyDomains.has(row.normalized_domain) && historyDomains.size >= historyLimit) { bump('history_limit'); continue; }
      historyDomains.add(row.normalized_domain); nextHistoryAfterDomain = row.normalized_domain;
      repaired.push(row); bump(reason); continue;
    }
    if (reason !== 'needs_live_confirmation') { bump(reason); continue; }
    if (statsOnly) { bump('stats_only'); continue; }
    if (!checkedDomains.has(row.normalized_domain) && checked >= limit) { bump('live_check_limit'); continue; }
    let result = checkedDomains.get(row.normalized_domain);
    if (!result) {
      checked++;
      nextAfterDomain = row.normalized_domain;
      result = await verify({
      normalized_domain: row.normalized_domain, discovery_sources: json(row.discovery_sources || '[]'),
      last_check_evidence: {}, review_relationships: [],
      }, networks);
      checkedDomains.set(row.normalized_domain,result);
    }
    const decision = correctionConfirmation(row, result);
    bump(decision);
    if (decision === 'restore') restores.push({ ...row, correction_evidence: restoration(row, result.checkedAt, result.matches.confirmed.find(match => String(match.networkId) === String(row.ad_network_id)).evidence) });
  }
  return { counts, checked, restores, repaired, nextAfterDomain: statsOnly ? nextHistoryAfterDomain : nextAfterDomain, nextHistoryAfterDomain };
}

export async function previewPostgresCorrection(client, plan) {
  const repairs = [...plan.restores,...plan.repaired].map(row => {
    const marker = (row.correction_evidence ?? json(row.evidence)).homepage_miss_correction;
    return { ad_network_id:row.ad_network_id,publisher_id:row.publisher_id,
      ended_at:marker.prior_ended_at,first_missed_at:marker.first_missed_at,corrected_at:marker.corrected_at };
  });
  if (!repairs.length) return { wouldRemoveEvents:0,wouldNeutralizeArrivals:0,wouldInvalidateSnapshots:0 };
  return (await client.query(`with repairs as (
    select * from jsonb_to_recordset($1::jsonb) x(ad_network_id bigint,publisher_id bigint,
      ended_at timestamptz,first_missed_at timestamptz,corrected_at timestamptz)
  ) select
    (select count(*)::int from public.ad_network_relationship_events e join repairs r using(ad_network_id,publisher_id)
      where e.event='left' and e.observed_at=r.ended_at) as "wouldRemoveEvents",
    (select count(*)::int from public.ad_network_relationship_events e join repairs r using(ad_network_id,publisher_id)
      where e.event='joined' and e.observed_at between r.ended_at and r.corrected_at) as "wouldNeutralizeArrivals",
    (select count(distinct (d.ad_network_id,d.snapshot_on))::int from public.ad_network_daily_counts d
      join repairs r using(ad_network_id) where d.captured_at between r.first_missed_at and r.corrected_at
      and d.snapshot_on < (now() at time zone 'UTC')::date) as "wouldInvalidateSnapshots"`,[JSON.stringify(repairs)])).rows[0];
}

export async function applyPostgresCorrection(client, plan) {
  let completed = 0, restored = 0, queued = 0, removedEvents = 0, neutralizedArrivals = 0, invalidatedSnapshots = 0, observations = 0;
  const rows = [...plan.restores, ...plan.repaired];
  for (const row of rows) {
    const evidence = row.correction_evidence ?? json(row.evidence);
    const marker = evidence.homepage_miss_correction;
    if ((await client.query(`select 1 from public.ad_network_homepage_miss_repairs
      where ad_network_id=$1 and publisher_id=$2 and corrected_at=$3 and version=$4`,
    [row.ad_network_id,row.publisher_id,marker.corrected_at,CORRECTION])).rowCount) continue;
    if (row.correction_evidence) {
      const update = await client.query(`update public.ad_network_publisher_relationships
        set status='confirmed',ended_at=null,consecutive_misses=0,first_missed_at=null,last_missed_at=null,evidence=$3::jsonb
        where ad_network_id=$1 and publisher_id=$2 and status=$4 and last_missed_at=$5
          and first_confirmed_at=$6 and evidence=$7::jsonb`,
      [row.ad_network_id,row.publisher_id,JSON.stringify(evidence),row.status,row.last_missed_at,row.first_confirmed_at,JSON.stringify(json(row.evidence))]);
      if (update.rowCount !== 1) throw new Error('Relationship changed during live check; rerun correction');
      restored += update.rowCount;
    }
    if (!row.correction_evidence) {
      const current = await client.query(`select 1 from public.ad_network_publisher_relationships
        where ad_network_id=$1 and publisher_id=$2
          and evidence->'homepage_miss_correction'=$3::jsonb for update`,[row.ad_network_id,row.publisher_id,JSON.stringify(marker)]);
      if (!current.rowCount) throw new Error('Corrected relationship changed during selection; rerun correction');
    }
    // Exact departure only. Other departures and other networks remain intact.
    removedEvents += (await client.query(`delete from public.ad_network_relationship_events
      where ad_network_id=$1 and publisher_id=$2 and event='left' and observed_at=$3`,
    [row.ad_network_id,row.publisher_id,marker.prior_ended_at])).rowCount;
    // An apparent return after the invalid departure is baseline history.
    if (marker.prior_ended_at) {
      neutralizedArrivals += (await client.query(`delete from public.ad_network_relationship_events j
        where j.ad_network_id=$1 and j.publisher_id=$2 and j.event='joined' and j.observed_at between $3 and $4
        and exists(select 1 from public.ad_network_relationship_events b where b.ad_network_id=j.ad_network_id
          and b.publisher_id=j.publisher_id and b.event='baseline' and b.observed_at=j.observed_at)`,
      [row.ad_network_id,row.publisher_id,marker.prior_ended_at,marker.corrected_at])).rowCount;
      neutralizedArrivals += (await client.query(`update public.ad_network_relationship_events set event='baseline'
      where ad_network_id=$1 and publisher_id=$2 and event='joined' and observed_at between $3 and $4
      and not exists(select 1 from public.ad_network_relationship_events b where b.ad_network_id=$1
        and b.publisher_id=$2 and b.event='baseline' and b.observed_at=ad_network_relationship_events.observed_at)`,
    [row.ad_network_id,row.publisher_id,marker.prior_ended_at,marker.corrected_at])).rowCount;
    }
    // There is no history of individual miss times. Do not invent old
    // confirmed/stale totals. Remove uncertain network/day snapshots and
    // replace today's snapshot from current corrected relationships below.
    invalidatedSnapshots += (await client.query(`delete from public.ad_network_daily_counts
      where ad_network_id=$1 and captured_at between $2 and $3
        and snapshot_on < (now() at time zone 'UTC')::date`,
    [row.ad_network_id,marker.first_missed_at,marker.corrected_at])).rowCount;
    observations += (await client.query(`update public.ad_network_check_observations
      set confirmed_network_ids=array_append(confirmed_network_ids,$1::bigint)
      where publisher_id=$2 and not ($1::bigint=any(confirmed_network_ids))`,
    [row.ad_network_id,row.publisher_id])).rowCount;
    if (row.correction_evidence) queued += (await client.query(`update public.ad_network_publishers set verification_priority=100,next_check_at=now()
      where id=$1 and (verification_priority<>100 or next_check_at is null or next_check_at>now())`,[row.publisher_id])).rowCount;
    completed++;
    await client.query(`insert into public.ad_network_homepage_miss_repairs
      (ad_network_id,publisher_id,corrected_at,version) values($1,$2,$3,$4) on conflict do nothing`,
    [row.ad_network_id,row.publisher_id,marker.corrected_at,CORRECTION]);
  }
  const snapshots = completed
    ? (await snapshotCounts(client)).rowCount : 0;
  return { historyRepaired: completed, restored, queued, removedEvents, neutralizedArrivals, invalidatedSnapshots, observations, snapshots };
}

export function applySqliteCorrection(db, plan) {
  let restored = 0;
  for (const row of plan.restores) {
    const update = db.prepare(`update relationships set status='confirmed',ended_at=null,consecutive_misses=0,
      first_missed_at=null,last_missed_at=null,evidence=?,updated_at=?
      where ad_network_id=? and publisher_id=? and status=? and last_missed_at=? and evidence=?`)
      .run(JSON.stringify(row.correction_evidence),new Date().toISOString(),row.ad_network_id,row.publisher_id,row.status,
        row.last_missed_at,typeof row.evidence === 'string' ? row.evidence : JSON.stringify(row.evidence));
    if (update.changes !== 1) throw new Error('Relationship changed during live check; rerun correction');
    restored += update.changes;
    db.prepare('update publishers set verification_priority=100,next_check_at=?,updated_at=? where id=?')
      .run(new Date().toISOString(),new Date().toISOString(),row.publisher_id);
  }
  return { restored, queued: restored };
}

export function assertCorrectionStore(options, env = process.env) {
  if (env.AD_NETWORKS_RUNTIME_ENVIRONMENT && env.AD_NETWORKS_RUNTIME_ENVIRONMENT !== options.environment) {
    throw new Error('Runtime database environment mismatch');
  }
  if (options.store !== 'sqlite' || !options.apply) return;
  if (!env.AD_NETWORKS_RUNTIME_ENVIRONMENT || !env.AD_NETWORK_DB_PATH) {
    throw new Error('SQLite writes require AD_NETWORKS_RUNTIME_ENVIRONMENT and AD_NETWORK_DB_PATH');
  }
  if (!options.sqlite || realpathSync(options.sqlite) !== realpathSync(env.AD_NETWORK_DB_PATH)) {
    throw new Error('SQLite source path does not match AD_NETWORK_DB_PATH');
  }
  const source = realpathSync(options.sqlite);
  if (options.environment !== 'production' && (source === '/srv/stack127-data/ad-networks.sqlite'
    || resolve(options.sqlite) === '/srv/stack127-data/ad-networks.sqlite')) {
    throw new Error('Production SQLite source requires --environment production');
  }
}

export async function runCorrection(options) {
  const since = options.since ?? FAULT_SINCE, limit = Number(options.limit ?? 100);
  const historyLimit = Number(options['history-limit'] ?? limit);
  if (!Number.isInteger(historyLimit) || historyLimit < 1 || historyLimit > 100000) throw new Error('Invalid --history-limit (1–100000)');
  if (!Number.isFinite(Date.parse(since)) || !Number.isInteger(limit) || limit < 1 || limit > 100000) throw new Error('Invalid --since or --limit (1–100000)');
  if (!['development','production'].includes(options.environment)) throw new Error('Invalid environment');
  if (options.apply && options.environment === 'production' && options.confirm !== 'stack127-production') throw new Error('Production writes require --confirm stack127-production');
  if (!['postgres','sqlite'].includes(options.store)) throw new Error('--store must be postgres or sqlite');
  if (options.apply && options.environment === 'production' && options.store === 'postgres' && !options['stats-only']) {
    throw new Error('Production PostgreSQL correction requires --stats-only after repairing and syncing SQLite');
  }
  assertCorrectionStore(options);
  let pool, client, db, transaction = false;
  try {
    let rows, networks;
    if (options.store === 'sqlite') {
      if (!options.sqlite) throw new Error('--sqlite is required');
      db = new DatabaseSync(options.sqlite, { readOnly: !options.apply, timeout: 10000 });
      if (!options.apply) db.exec('pragma query_only=on');
      assertLocalCatalog(db);
      // Network checks run before the write transaction; guarded updates below
      // reject a source row changed by another verifier in the meantime.
      rows = db.prepare(`select r.*,p.normalized_domain,p.last_checked_at,p.last_check_outcome,p.last_check_evidence,
        '[]' as discovery_sources,n.slug from relationships r join publishers p on p.id=r.publisher_id
        join ad_networks n on n.id=r.ad_network_id
        where r.consecutive_misses>0 or json_extract(r.evidence,'$.homepage_miss_correction.version')=?
        order by p.normalized_domain,n.slug`).all(CORRECTION);
      for (const row of rows) row.discovery_sources = db.prepare('select source_key from publisher_sources where publisher_id=?').all(row.publisher_id);
      networks = loadLocalNetworks(db);
    } else {
      pool = targetPool(options); client = await pool.connect();
      await client.query('begin read only'); transaction = true;
      rows = (await client.query(`select r.*,p.normalized_domain,p.last_checked_at,p.last_check_outcome,p.last_check_evidence,
        p.discovery_sources,n.slug,h.repaired_at as history_repaired_at from public.ad_network_publisher_relationships r
        join public.ad_network_publishers p on p.id=r.publisher_id join public.ad_networks n on n.id=r.ad_network_id
        left join public.ad_network_homepage_miss_repairs h on h.ad_network_id=r.ad_network_id
          and h.publisher_id=r.publisher_id and h.version='homepage-misses-v1'
          and h.corrected_at=(r.evidence->'homepage_miss_correction'->>'corrected_at')::timestamptz
        where r.consecutive_misses>0 or r.evidence->'homepage_miss_correction'->>'version'=$1
        order by p.normalized_domain,n.slug`,[CORRECTION])).rows;
      networks = (await client.query('select * from public.ad_networks order by id')).rows;
    }
    // Do not hold an idle transaction or row locks while fetching public sites.
    if (client) { await client.query('commit'); transaction = false; }
    const plan = await planCorrections(rows, networks, { since, limit, historyLimit, afterDomain: options['after-domain'] ?? '', statsOnly: options['stats-only'] });
    let applied = {}, preview = {};
    if (client && !options.apply) {
      await client.query('begin read only'); transaction = true;
      preview = await previewPostgresCorrection(client,plan);
      await client.query('rollback'); transaction = false;
    }
    if (options.apply) {
      if (db) db.exec('begin immediate');
      else {
        await client.query('begin');
        await client.query("set local lock_timeout='5s'");
      }
      transaction = true;
      if (client) for (const name of ['ad-networks-runtime-heavy','ad-networks-reviewed-sync']) {
        if (!(await client.query('select pg_try_advisory_xact_lock(hashtext($1)) locked',[name])).rows[0].locked) throw new Error('Another ad-network sync is running');
      }
      applied = db ? applySqliteCorrection(db,plan) : await applyPostgresCorrection(client,plan);
    }
    if (transaction) {
      if (db) db.exec(options.apply ? 'commit' : 'rollback');
      else await client.query(options.apply ? 'commit' : 'rollback');
    }
    transaction = false;
    return { environment: options.environment,store:options.store,applied:options.apply,since,
      scanned:rows.length,checked:plan.checked,counts:plan.counts,nextAfterDomain:plan.nextAfterDomain,nextHistoryAfterDomain:plan.nextHistoryAfterDomain,wouldRestore:plan.restores.length,
      wouldRepairStats:plan.restores.length+plan.repaired.length,...preview,...applied };
  } catch (error) {
    if (transaction) { if (db) db.exec('rollback'); else await client.query('rollback'); }
    throw error;
  } finally { db?.close(); client?.release(); await pool?.end(); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: {
    environment:{type:'string',default:'development'},confirm:{type:'string'},apply:{type:'boolean',default:false},
    store:{type:'string',default:'postgres'},sqlite:{type:'string'},'after-domain':{type:'string',default:''},'stats-only':{type:'boolean',default:false},since:{type:'string',default:FAULT_SINCE},limit:{type:'string',default:'100'},'history-limit':{type:'string'},
  }});
  console.log(JSON.stringify(await runCorrection(values),null,2));
}
