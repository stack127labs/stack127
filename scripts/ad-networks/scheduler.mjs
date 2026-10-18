#!/usr/bin/env node
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { refresh, refreshArgs } from './refresh.mjs';
import { progressFile } from './enrichment-store.mjs';
import { safeError } from './alerts.mjs';

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
export const scheduledJobs = [...schedules.map(row => row.job), 'verification'];

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
    } else state[selected.job] = { status: 'complete', completedSlot: selected.slot, finishedAt: new Date().toISOString(),
      ...(selected.job === 'verification' ? { retryAt: new Date(Date.now() + 30000).toISOString() } : {}) };
  } catch (error) {
    state[selected.job] = { ...state[selected.job], status: 'failed', error: safeError(error), retryAt: new Date(Date.now() + 300000).toISOString() };
    console.error(`${selected.job}: ${safeError(error)}`);
  }
  await save(state);
  return { state, job: selected.job };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: { check: { type: 'boolean', default: false } } });
  const options = { environment: process.env.AD_NETWORKS_RUNTIME_ENVIRONMENT,
    database: process.env.AD_NETWORK_DB_PATH || '/data/ad-networks.sqlite', stateDirectory: process.env.AD_NETWORKS_STATE_DIRECTORY || '/data/state',
    concurrency: process.env.AD_NETWORKS_CONCURRENCY || '4', activatedAt: process.env.AD_NETWORKS_ACTIVATED_AT,
    enabled: (process.env.AD_NETWORKS_ENABLED_JOBS || '').split(',').filter(Boolean) };
  if (values.check) {
    const heartbeat = JSON.parse(await readFile(join(options.stateDirectory, 'heartbeat.json'), 'utf8'));
    if (Date.now() - Date.parse(heartbeat.at) > 120000) throw new Error('Scheduler heartbeat stale');
    process.exit(0);
  }
  if (!['production', 'development'].includes(options.environment)) throw new Error('Set AD_NETWORKS_RUNTIME_ENVIRONMENT');
  if (!options.activatedAt || new Date(options.activatedAt).toISOString() !== options.activatedAt) throw new Error('Set AD_NETWORKS_ACTIVATED_AT to an ISO UTC timestamp');
  if (options.enabled.some(job => !scheduledJobs.includes(job))) throw new Error('Unknown enabled job');
  if (options.environment === 'production' && !process.env.GITHUB_ALERT_TOKEN) throw new Error('GITHUB_ALERT_TOKEN required');
  // Refuse to create an empty replacement store after a missing-volume restart.
  await access(options.database);
  let state = {};
  try { state = JSON.parse(await readFile(join(options.stateDirectory, 'scheduler.json'), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  let stopping = false;
  process.on('SIGINT', () => { stopping = true; }); process.on('SIGTERM', () => { stopping = true; });
  const heartbeat = () => progressFile(join(options.stateDirectory, 'heartbeat.json'), { at: new Date().toISOString(), enabled: options.enabled });
  await heartbeat();
  const timer = setInterval(() => { void heartbeat().catch(() => { stopping = true; }); }, 30000);
  try {
    while (!stopping) {
      await schedulerTick(options, state, new Date());
      if (!stopping) await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } finally { clearInterval(timer); }
}
