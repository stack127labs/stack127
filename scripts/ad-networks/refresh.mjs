#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { defaultLocalDatabasePath } from './local-db.mjs';
import { snapshotLocal } from './snapshot-local.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const refreshJobs = ['sync', 'platform', 'publisher-names', 'traffic', 'domain-age', 'ads-txt-summary', 'niche-export'];

export function refreshArgs(argv) {
  const { values } = parseArgs({ args: argv, options: {
    job: { type: 'string' }, apply: { type: 'boolean', default: false },
    environment: { type: 'string', default: 'development' }, confirm: { type: 'string' },
    'local-database': { type: 'string', default: defaultLocalDatabasePath },
    'state-directory': { type: 'string', default: join(homedir(), '.local/state/stack127/ad-networks') },
    concurrency: { type: 'string', default: '32' },
  }});
  if (!refreshJobs.includes(values.job)) throw new Error(`Choose --job ${refreshJobs.join('|')}`);
  if (!['development', 'production'].includes(values.environment)) throw new Error('Invalid environment');
  if (values.apply && values.environment === 'production' && values.confirm !== 'stack127-production') {
    throw new Error('Production writes require --confirm stack127-production');
  }
  if (!/^[1-9]\d*$/.test(values.concurrency) || Number(values.concurrency) > 100) throw new Error('Concurrency must be 1 to 100');
  return { ...values, 'local-database': resolve(values['local-database']), 'state-directory': resolve(values['state-directory']) };
}

export function refreshCommand(options) {
  const state = options['state-directory'];
  const local = ['--local-database', options['local-database']];
  if (options.job === 'sync') return {
    script: 'sync', args: ['--sqlite', join(state, `sync-${process.pid}.sqlite`), '--environment', options.environment,
      '--apply', ...(options.environment === 'production' ? ['--confirm', 'stack127-production'] : [])],
  };
  if (options.job === 'niche-export') return {
    script: 'niche-export', args: [...local, '--incremental', '--run-directory', join(state, 'niche/input'),
      '--progress-file', join(state, 'niche-export.json')],
  };
  return { script: options.job, args: [...local, '--concurrency', options.concurrency,
    '--progress-file', join(state, `${options.job}.json`),
    // Seller cohorts can stay unchanged while names change at the source.
    ...(options.job === 'publisher-names' ? ['--refresh'] : [])] };
}

function run(script, args, env) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(process.execPath, ['--experimental-strip-types', join(root, 'scripts/ad-networks', `${script}.mjs`), ...args],
      { cwd: root, env, stdio: 'inherit' });
    const stop = () => child.kill('SIGTERM');
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
    const clean = () => { process.off('SIGINT', stop); process.off('SIGTERM', stop); };
    child.once('error', error => { clean(); reject(error); });
    child.once('exit', (code, signal) => {
      clean();
      code === 0 ? resolveRun() : reject(new Error(`${script} stopped: ${signal ?? code}`));
    });
  });
}

export async function refresh(options, dependencies = {}) {
  // A plan must be printable without opening SQLite or contacting either database.
  const command = refreshCommand(options);
  if (!options.apply) return { applied: false, environment: options.environment, ...command };
  if (options.environment === 'production' && options.confirm !== 'stack127-production') throw new Error('Production confirmation missing');
  const state = options['state-directory'];
  await mkdir(state, { recursive: true, mode: 0o700 });
  const execute = dependencies.run ?? run;
  const env = { ...process.env, UV_THREADPOOL_SIZE: '128',
    AD_NETWORK_FETCH_THROTTLE_DB: join(state, 'fetch-throttle.sqlite') };
  if (options.job === 'sync') {
    const snapshot = command.args[1];
    try {
      await (dependencies.snapshot ?? snapshotLocal)(options['local-database'], snapshot);
      await execute(command.script, command.args, env);
    } finally { await (dependencies.remove ?? rm)(snapshot, { force: true }); }
  } else await execute(command.script, command.args, env);
  return { applied: true, environment: options.environment, job: options.job };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { console.log(JSON.stringify(await refresh(refreshArgs(process.argv.slice(2))))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
