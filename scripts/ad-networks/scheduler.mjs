#!/usr/bin/env node
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { refresh, refreshArgs } from './refresh.mjs';
import { progressFile } from './enrichment-store.mjs';
import { jobAlert, safeError } from './alerts.mjs';

export const schedules = [
  { job: 'snapshot', hour: 0, minute: 10 },
  { job: 'platform', hour: 1, minute: 0 },
  { job: 'domain-age', hour: 2, minute: 0 },
  { job: 'ads-txt-summary', hour: 3, minute: 0 },
  { job: 'discovery', hour: 4, minute: 0, weekday: 2 },
  { job: 'publisher-names', hour: 4, minute: 0, weekday: 3 },
  { job: 'traffic', hour: 4, minute: 0, day: 5 },
  { job: 'backup', hour: 5, minute: 0 },
];
export const scheduledJobs = [...schedules.map(row => row.job), 'verification', 'rdap-import'];

export function latestSlot(schedule, now) {
  const date = new Date(now);
  date.setUTCHours(schedule.hour, schedule.minute, 0, 0);
  if (schedule.day) {
    date.setUTCDate(schedule.day);
    if (date > now) date.setUTCMonth(date.getUTCMonth() - 1);
  } else {
    if (date > now) date.setUTCDate(date.getUTCDate() - 1);
    if (schedule.weekday !== undefined) date.setUTCDate(date.getUTCDate() - (date.getUTCDay() - schedule.weekday + 7) % 7);
  }
  return date.toISOString();
}

export function nextJob(state, now, activatedAt, enabled) {
  const due = schedules.filter(row => enabled.includes(row.job)).map(row => ({ ...row, slot: latestSlot(row, now) }))
    .filter(row => row.slot >= activatedAt && row.slot !== state[row.job]?.completedSlot
      && (!state[row.job]?.retryAt || state[row.job].retryAt <= now.toISOString()))
    .sort((a, b) => a.slot.localeCompare(b.slot));
  if (due.length) return due[0];
  if (enabled.includes('verification') && (!state.verification?.retryAt || state.verification.retryAt <= now.toISOString())) {
    return { job: 'verification', slot: now.toISOString() };
  }
  return null;
}

export async function schedulerTick(options, state, now, dependencies = {}) {
  const selected = nextJob(state, now, options.activatedAt, options.enabled);
  if (!selected) return { state, idle: true };
  const save = dependencies.save ?? (data => progressFile(join(options.stateDirectory, 'scheduler.json'), data));
  state[selected.job] = { ...state[selected.job], status: 'running', startedAt: now.toISOString(), slot: selected.slot };
  await save(state);
  try {
    const args = refreshArgs(['--job', selected.job, '--environment', options.environment,
      ...(options.environment === 'production' ? ['--confirm', 'stack127-production'] : []), '--apply',
      '--local-database', options.database, '--state-directory', options.stateDirectory,
      '--concurrency', options.concurrency, '--limit', selected.job === 'verification' ? '500' : '5000',
      '--time-budget-minutes', selected.job === 'verification' ? '5' : '30']);
    const result = await (dependencies.refresh ?? refresh)(args);
    if (result.skipped) {
      state[selected.job] = { ...state[selected.job], status: 'waiting_for_lock', retryAt: new Date(now.getTime() + 30000).toISOString() };
    } else state[selected.job] = { status: 'complete', completedSlot: selected.slot, startedAt: now.toISOString(), finishedAt: new Date().toISOString(), result,
      ...(selected.job === 'verification' ? { retryAt: new Date(Date.now() + 30000).toISOString() } : {}) };
  } catch (error) {
    state[selected.job] = { ...state[selected.job], status: 'failed', result: error.jobResult ?? { synced: false, revalidated: false }, error: safeError(error), retryAt: new Date(Date.now() + 300000).toISOString() };
    console.error(`${selected.job}: ${safeError(error)}`);
  }
  await save(state);
  return { state, job: selected.job };
}

export async function runScheduler(options, dependencies = {}) {
  options = { activatedAt: process.env.AD_NETWORKS_ACTIVATED_AT, concurrency: process.env.AD_NETWORKS_CONCURRENCY || '4',
    enabled: (process.env.AD_NETWORKS_ENABLED_JOBS || '').split(',').filter(Boolean), ...options };
  if (!options.activatedAt || new Date(options.activatedAt).toISOString() !== options.activatedAt) throw new Error('Set AD_NETWORKS_ACTIVATED_AT to an ISO UTC timestamp');
  if (options.enabled.some(job => !scheduledJobs.includes(job))) throw new Error('Unknown enabled job');
  if (options.environment === 'production' && !process.env.GITHUB_ALERT_TOKEN) throw new Error('GITHUB_ALERT_TOKEN required');
  await access(options.database);
  let state = {};
  try { state = JSON.parse(await readFile(join(options.stateDirectory, 'scheduler.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  let stopping = false, rdapAt = 0;
  const stop = () => { stopping = true; };
  process.on('SIGINT', stop); process.on('SIGTERM', stop);
  try {
    while (!stopping) {
      if (dependencies.rdap && options.enabled.includes('rdap-import') && Date.now() >= rdapAt) {
        rdapAt = Date.now() + 60000;
        try {
          const result = await dependencies.rdap();
          if (!result.idle && !result.skipped) state['rdap-import'] = { status: 'complete', finishedAt: new Date().toISOString(), result };
        } catch (error) {
          state['rdap-import'] = { status: 'failed', finishedAt: new Date().toISOString(), result: error.jobResult ?? { synced: false, revalidated: false }, error: safeError(error) };
          await jobAlert({ ...options, job: 'rdap-import', 'state-directory': options.stateDirectory }, true).catch(() => {});
          rdapAt = Date.now() + 300000;
        }
        await progressFile(join(options.stateDirectory, 'scheduler.json'), state);
      }
      const tick = await schedulerTick(options, state, new Date());
      if (!tick.idle) await dependencies.publish?.();
      if (!stopping) await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } finally { process.off('SIGINT', stop); process.off('SIGTERM', stop); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: { check: { type: 'boolean', default: false } } });
  if (values.check) {
    const file = join(process.env.AD_NETWORKS_STATE_DIRECTORY || '/data/state', 'heartbeat.json');
    const heartbeat = JSON.parse(await readFile(file, 'utf8')), age = Date.now() - Date.parse(heartbeat.at);
    if (!Number.isFinite(age) || age < -60000 || age > 120000 || heartbeat.phase !== 'ready') throw new Error('Scheduler not ready or heartbeat stale');
  } else throw new Error('Start runtime.mjs; it installs and checks the seed before scheduling jobs');
}
