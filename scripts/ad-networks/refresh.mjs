#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { defaultLocalDatabasePath } from './local-db.mjs';
import { snapshotLocal } from './snapshot-local.mjs';
import { withJobLock } from './runtime-db.mjs';
import { jobAlert, safeError } from './alerts.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const refreshJobs = ['sync', 'snapshot', 'verification', 'discovery', 'catalog', 'backup',
  'platform', 'publisher-names', 'traffic', 'domain-age', 'ads-txt-summary', 'niche-export', 'rdap-import'];

export function refreshArgs(argv) {
  const { values } = parseArgs({ args: argv, options: {
    job: { type: 'string' }, apply: { type: 'boolean', default: false },
    environment: { type: 'string', default: 'development' }, confirm: { type: 'string' }, site: { type: 'string' },
    'local-database': { type: 'string', default: defaultLocalDatabasePath },
    'state-directory': { type: 'string', default: join(homedir(), '.local/state/stack127/ad-networks') },
    concurrency: { type: 'string', default: '4' }, limit: { type: 'string', default: '500' },
    'time-budget-minutes': { type: 'string', default: '10' }, 'source-sqlite': { type: 'string' },
  } });
  if (!refreshJobs.includes(values.job)) throw new Error(`Choose --job ${refreshJobs.join('|')}`);
  if (!['development', 'production'].includes(values.environment)) throw new Error('Invalid environment');
  if (values.apply && values.environment === 'production' && values.confirm !== 'stack127-production') throw new Error('Production writes require --confirm stack127-production');
  for (const [key, max] of [['concurrency', 8], ['limit', 5000], ['time-budget-minutes', 45]]) {
    if (!/^[1-9]\d*$/.test(values[key]) || Number(values[key]) > max) throw new Error(`${key} must be 1 to ${max}`);
  }
  if (values.job === 'rdap-import' && !values['source-sqlite']) throw new Error('rdap-import needs --source-sqlite');
  return { ...values, 'local-database': resolve(values['local-database']), 'state-directory': resolve(values['state-directory']) };
}

const targetArgs = options => ['--environment', options.environment,
  ...(options.environment === 'production' ? ['--confirm', 'stack127-production'] : [])];

export function refreshCommand(options) {
  const state = options['state-directory'], local = ['--local-database', options['local-database']];
  if (options.job === 'sync') return { script: 'sync', args: ['--sqlite', join(state, `sync-${process.pid}.sqlite`), ...targetArgs(options), '--apply'] };
  if (options.job === 'snapshot') return { script: 'snapshot', args: [...targetArgs(options), '--apply'] };
  if (options.job === 'catalog') return { script: 'catalog', args: [...local, '--apply'] };
  if (options.job === 'backup') return { script: 'backup-local', args: [...local, '--backup-directory', join(state, 'backups'), '--keep', '7'] };
  if (options.job === 'rdap-import') return { script: 'merge-rdap', args: [...local, '--source-sqlite', options['source-sqlite'], '--apply'] };
  if (options.job === 'verification') return { script: 'verify', args: [...local, '--store', 'local', '--apply',
    '--concurrency', options.concurrency, '--limit', options.limit, '--time-budget-minutes', options['time-budget-minutes'],
    '--lease-minutes', '70', '--summary-file', join(state, 'verification.json')] };
  if (options.job === 'discovery') return { script: 'discover', args: [...local, '--apply', '--store', 'local',
    '--state-file', join(state, 'discovery.json')] };
  if (options.job === 'niche-export') return { script: 'niche-export', args: [...local, '--incremental', '--flush',
    '--run-directory', join(state, 'niche/input'), '--progress-file', join(state, 'niche-export.json')] };
  return { script: options.job, args: [...local, '--concurrency', options.concurrency, '--limit', options.limit,
    '--time-budget-minutes', options['time-budget-minutes'], '--progress-file', join(state, `${options.job}.json`),
    ...(options.job === 'traffic' ? ['--cache-directory', join(state, 'crux')] : []),
    ...(options.job === 'publisher-names' ? ['--refresh'] : [])] };
}

export function run(script, args, env, signal) {
  return new Promise((resolveRun, reject) => {
    if (signal?.aborted) { reject(new Error('Heavy-job lock was lost')); return; }
    const child = spawn(process.execPath, ['--experimental-strip-types', join(root, 'scripts/ad-networks', `${script}.mjs`), ...args],
      { cwd: root, env, stdio: 'inherit' });
    let killTimer;
    const stop = () => { child.kill('SIGTERM'); killTimer ??= setTimeout(() => child.kill('SIGKILL'), 120000); };
    // A broken feed or child must not hold all later schedules forever.
    const deadline = setTimeout(stop, (script === 'sync' ? 120 : 50) * 60000);
    signal?.addEventListener('abort', stop, { once: true });
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    const clean = () => { clearTimeout(deadline); clearTimeout(killTimer); signal?.removeEventListener('abort', stop); process.off('SIGINT', stop); process.off('SIGTERM', stop); };
    child.once('error', error => { clean(); reject(error); });
    child.once('exit', (code, signal) => {
      clean(); code === 0 ? resolveRun() : reject(new Error(`${script} stopped: ${signal ?? code}`));
    });
  });
}

export async function refresh(options, dependencies = {}) {
  const command = refreshCommand(options);
  const sync = refreshCommand({ ...options, job: 'sync' });
  const revalidation = { script: 'revalidate', args: [...targetArgs(options), '--apply', ...(options.site ? ['--site', options.site] : [])] };
  if (!options.apply) return { applied: false, environment: options.environment, collector: command,
    final_steps: [...(options.job === 'sync' ? [] : [sync]), revalidation], ...command };
  if (options.environment === 'production' && options.confirm !== 'stack127-production') throw new Error('Production confirmation missing');
  await mkdir(options['state-directory'], { recursive: true, mode: 0o700 });
  const execute = dependencies.run ?? run;
  const env = { ...process.env, UV_THREADPOOL_SIZE: '8', AD_NETWORK_DB_PATH: options['local-database'],
    AD_NETWORK_FETCH_THROTTLE_DB: join(options['state-directory'], 'fetch-throttle.sqlite') };
  const publish = async signal => {
    if (signal?.aborted) throw new Error('Heavy-job lock was lost');
    const snapshot = sync.args[1];
    try {
      await (dependencies.snapshot ?? snapshotLocal)(options['local-database'], snapshot);
      await execute(sync.script, sync.args, env, signal);
    } finally {
      for (const path of [snapshot, `${snapshot}-wal`, `${snapshot}-shm`]) await (dependencies.remove ?? rm)(path, { force: true });
    }
    await execute(revalidation.script, revalidation.args, env, signal);
  };
  try {
    const result = await (dependencies.lock ?? withJobLock)(options, async signal => {
      let collectorError;
      if (options.job !== 'sync') {
        try { await execute(command.script, command.args, env, signal); } catch (error) { collectorError = error; }
      }
      await publish(signal);
      if (collectorError) throw collectorError;
      return { applied: true, environment: options.environment, job: options.job, synced: true, revalidated: true };
    });
    if (!result.skipped) await (dependencies.alert ?? jobAlert)(options, false);
    return result;
  } catch (error) {
    try { await (dependencies.alert ?? jobAlert)(options, true); } catch (alertError) { console.error(`Alert failed: ${safeError(alertError)}`); }
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { const result = await refresh(refreshArgs(process.argv.slice(2))); console.log(JSON.stringify(result)); if (result.skipped) process.exitCode = 75; }
  catch (error) { console.error(safeError(error)); process.exitCode = 1; }
}
