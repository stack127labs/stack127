#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { ahrefsRequester, ahrefsStateFile } from '../stack127/ahrefs-dr.mjs';
import { enrichmentArgs, enrichmentDatabase, saveState, progressFile } from './enrichment-store.mjs';

// Failed domains have a separate retry checkpoint. Never advance the successful
// measurement date on failure, and never let one bad domain starve the queue.
export function domainRatingSites(db, { now = Date.now(), limit = 500 } = {}) {
  const cutoff = new Date(now - 30 * 86400000).toISOString().slice(0, 10);
  return db.prepare(`select p.id,p.normalized_domain,p.domain_rating,p.domain_rating_checked_on
    from publishers p left join enrichment_state s on s.publisher_id=p.id and s.kind='domain-rating'
    where (p.domain_rating_checked_on is null or p.domain_rating_checked_on<?)
      and (s.retry_at is null or s.retry_at<=?)
    order by case when p.domain_rating_checked_on is not null then 3
      when exists(select 1 from relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale')
        and r.relationship_type='primary_or_exclusive_manager') then 0
      when exists(select 1 from relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale')) then 1
      else 2 end,p.domain_rating_checked_on,p.id limit ?`).all(cutoff, new Date(now).toISOString(), limit);
}

export async function collectDomainRatings(db, options = {}, dependencies = {}) {
  const now = dependencies.now ?? Date.now;
  const limit = Number(options.limit ?? 500), budgetMs = Number(options['time-budget-minutes'] ?? 30) * 60000;
  const paceMs = Number(options['pace-ms'] ?? 3000);
  if (!Number.isInteger(limit) || limit < 1 || limit > 5000) throw new Error('limit must be 1 to 5000');
  if (!Number.isFinite(budgetMs) || budgetMs <= 0 || budgetMs > 45 * 60000) throw new Error('time budget must be at most 45 minutes');
  if (!Number.isFinite(paceMs) || paceMs < 3000 || paceMs > 60000) throw new Error('pace-ms must be 3000 to 60000');
  const controller = new AbortController();
  let signal;
  const stop = received => { signal = received; controller.abort(); };
  const interrupt = () => stop('SIGINT'), terminate = () => stop('SIGTERM');
  const deadline = now() + budgetMs;
  const budget = setTimeout(() => controller.abort(), budgetMs);
  const summary = { kind: 'domain-rating', status: 'running', startedAt: new Date(now()).toISOString(), processed: 0, measured: 0, failed: 0, stopped: null };
  const report = async () => { if (options['progress-file']) await progressFile(options['progress-file'], summary); };
  process.on('SIGINT', interrupt); process.on('SIGTERM', terminate);
  try {
    const retryAt = db.prepare("select value from schema_meta where key='domain_rating_retry_at'").get()?.value;
    if (retryAt && Date.parse(retryAt) > now()) {
      Object.assign(summary, { status: 'failed', stopped: 'rate_limited', retryAt, total: 0, finishedAt: new Date(now()).toISOString() });
      await report(); return summary;
    }
    const request = dependencies.requestRating ?? ahrefsRequester({ apiKey: process.env.AHREFS_API_KEY, paceMs, signal: controller.signal, now,
      stateFile: dependencies.stateFile, fetchImplementation: dependencies.fetchImplementation, sleepImplementation: dependencies.sleepImplementation,
      onRateLimit: ({ retryAt }) => {
        const until = new Date(retryAt).toISOString();
        db.prepare("insert into schema_meta(key,value) values('domain_rating_retry_at',?) on conflict(key) do update set value=excluded.value").run(until);
        summary.retryAt = until;
      } });
    const rows = domainRatingSites(db, { now: now(), limit });
    summary.total = rows.length;
    await report();
    for (const site of rows) {
      if (controller.signal.aborted || now() >= deadline) break;
      let result;
      try { result = await request(site.normalized_domain); }
      catch (error) { if (controller.signal.aborted) break; throw error; }
      if (result.stopped) { summary.stopped = result.stopped; break; }
      db.exec('begin immediate');
      try {
        if (Number.isInteger(result.value) && result.value >= 0 && result.value <= 100) {
          const checkedOn = new Date(now()).toISOString().slice(0, 10);
          db.prepare('update publishers set domain_rating=?,domain_rating_checked_on=? where id=?').run(result.value, checkedOn, site.id);
          saveState(db, site.id, 'domain-rating', 'measured', { version: 'dr3', attribution: 'Domain Rating by Ahrefs', url: 'https://ahrefs.com' });
          summary.measured++;
        } else {
          saveState(db, site.id, 'domain-rating', 'lookup_failed', {}, 86400);
          summary.failed++;
        }
        db.exec('commit');
      } catch (error) { db.exec('rollback'); throw error; }
      summary.processed++;
      if (summary.processed % 50 === 0) { await report(); console.log(JSON.stringify(summary)); }
    }
    summary.status = signal ? 'stopped' : summary.stopped || summary.failed ? 'failed' : controller.signal.aborted || now() >= deadline ? 'budget_complete' : 'complete';
    summary.finishedAt = new Date(now()).toISOString();
    await report();
    if (signal) summary.signal = signal;
    return summary;
  } finally {
    clearTimeout(budget); process.off('SIGINT', interrupt); process.off('SIGTERM', terminate);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let db;
  try {
    const args = enrichmentArgs({ 'ahrefs-state-file': { type: 'string', default: ahrefsStateFile('development') }, 'pace-ms': { type: 'string', default: '3000' },
      limit: { type: 'string', default: '500' }, 'time-budget-minutes': { type: 'string', default: '30' } });
    db = enrichmentDatabase(args);
    const summary = await collectDomainRatings(db, args, { stateFile: args['ahrefs-state-file'] });
    console.log(JSON.stringify(summary));
    if (summary.signal) process.exitCode = summary.signal === 'SIGINT' ? 130 : 143;
    else if (summary.status === 'failed') process.exitCode = 1;
  } catch { console.error('Domain Rating collector failed; check key, network, arguments and SQLite schema.'); process.exitCode = 1; }
  finally { db?.close(); }
}
