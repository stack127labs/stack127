#!/usr/bin/env node
import { access, readFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { privateStorage, storageConfig } from './handoff-storage.mjs';
import { downloadSnapshot, validateManifest, fileDigest, checkSnapshot } from './handoff.mjs';
import { progressFile } from './enrichment-store.mjs';
import { refresh, refreshArgs, run } from './refresh.mjs';
import { targetPool } from './runtime-db.mjs';
import { jobAlert, safeError } from './alerts.mjs';
import { assertTargetCatalog } from './identity-catalog.mjs';

export const activationMigrations = ['20261015183928', '20261015193817', '20261016032034', '20261016032558',
  '20261016060000', '20261016084059', '20261016131455', '20261016133410', '20261016134827', '20261016144329'];

export const bootstrapSteps = ['catalog', 'seed-sync', 'seed-niches', 'seed-revalidation', 'snapshot', 'platform', 'verification', 'backup'];
const exists = async file => { try { await access(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
async function jsonFile(file, fallback) { try { return JSON.parse(await readFile(file, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return fallback; throw error; } }
const targetArgs = options => ['--environment', options.environment, ...(options.environment === 'production' ? ['--confirm', 'stack127-production'] : []), '--apply'];

export function runtimeOptions(env = process.env) {
  const environment = env.AD_NETWORKS_RUNTIME_ENVIRONMENT;
  if (!['development', 'production'].includes(environment)) throw new Error('Runtime environment required');
  return { environment, apply: true, ...(environment === 'production' ? { confirm: 'stack127-production' } : {}),
    database: env.AD_NETWORK_DB_PATH || '/data/ad-networks.sqlite', stateDirectory: env.AD_NETWORKS_STATE_DIRECTORY || '/data/state',
    releaseSha: env.AD_NETWORKS_RELEASE_SHA, deploymentId: env.AD_NETWORKS_DEPLOYMENT_ID, instanceId: randomUUID() };
}

export async function assertUnpublished(options, dependencies = {}) {
  const pool = dependencies.pool ?? targetPool(options);
  try {
    const row = (await pool.query(`select count(*)::int as published from public.stack127_pages
      where (slug='ad-networks' or slug like 'ad-networks/%' or slug='ad-network-checker') and is_published`)).rows[0];
    if (!row || options.environment === 'production' && row.published !== 0) throw new Error('Ad-network pages must remain unpublished during activation');
    const applied = (await pool.query('select count(*)::int as applied from supabase_migrations.schema_migrations where version=any($1::text[])', [activationMigrations])).rows[0]?.applied;
    if (applied !== activationMigrations.length) throw new Error('All ten ad-network release migrations must be applied before activation');
    assertTargetCatalog((await pool.query('select slug,manager_domains,ad_system_domains,program_signatures from public.ad_networks')).rows);
    return { environment: options.environment, migrations_applied: applied, networks: 44, published_pages: row.published };
  } finally { await pool.end(); }
}

export async function bootstrap(options, storage, dependencies = {}) {
  const file = join(options.stateDirectory, 'bootstrap.json');
  let marker = await jsonFile(file, null);
  if (marker?.complete) {
    if (!await exists(options.database)) throw new Error('Completed bootstrap marker has no working database');
    checkSnapshot(options.database);
    return marker;
  }
  await (dependencies.assertUnpublished ?? assertUnpublished)(options);
  if (!marker) {
    if (await exists(options.database)) throw new Error('Existing store has no bootstrap marker; refusing to replace or reseed it');
    const manifest = validateManifest(await storage.getJson('handoff/seed.json'), 'seed');
    marker = { schema: 1, seed: manifest, installed: false, completed_steps: [], complete: false };
    // Pin the manifest before installation. A newer uploaded seed never replaces
    // an interrupted or completed bootstrap's original database.
    await progressFile(file, marker);
  }
  validateManifest(marker.seed, 'seed');
  if (!marker.installed) {
    if (await exists(options.database)) {
      const digest = await fileDigest(options.database);
      if (digest.sha256 !== marker.seed.sqlite_sha256 || digest.bytes !== marker.seed.sqlite_bytes) throw new Error('Unmarked database does not match pinned seed');
      checkSnapshot(options.database);
    } else await (dependencies.download ?? downloadSnapshot)(storage, marker.seed, options.database);
    marker.installed = true; await progressFile(file, marker);
  }
  const execute = dependencies.run ?? run;
  const executeStep = dependencies.step ?? (async name => {
    const target = targetArgs(options), local = ['--local-database', options.database];
    if (name === 'catalog') return execute('catalog', local, process.env);
    if (name === 'seed-niches') return execute('sync', ['--sqlite', options.database, '--niches-only', ...target], process.env);
    if (name === 'seed-revalidation') return execute('revalidate', [...target, ...(options.site ? ['--site', options.site] : [])], process.env);
    if (name === 'snapshot') return execute('snapshot', target, process.env);
    if (name === 'backup') return execute('backup-local', [...local, '--backup-directory', join(options.stateDirectory, 'backups'), '--keep', '7'], process.env);
    return (dependencies.refresh ?? refresh)(refreshArgs(['--job', name === 'seed-sync' ? 'sync' : name,
      ...local, '--state-directory', options.stateDirectory, ...target, '--concurrency', '1', '--limit', '1', '--time-budget-minutes', '1',
      ...(options.site ? ['--site', options.site] : [])]));
  });
  for (const step of bootstrapSteps) {
    if (marker.completed_steps.includes(step)) continue;
    await dependencies.onStep?.(step);
    const result = await executeStep(step);
    if (result?.skipped) throw new Error('Bootstrap waits for another heavy job');
    marker.completed_steps.push(step);
    marker.results = { ...marker.results, [step]: result ?? { complete: true } };
    await progressFile(file, marker);
  }
  await (dependencies.assertUnpublished ?? assertUnpublished)(options);
  marker = { ...marker, complete: true, completed_at: new Date().toISOString() };
  await progressFile(file, marker);
  return marker;
}

export async function consumeRdap(options, storage, dependencies = {}) {
  const pointer = await storage.getJson('handoff/rdap.json', true);
  if (!pointer) return { idle: true };
  const manifest = validateManifest(pointer, 'rdap'), file = join(options.stateDirectory, 'rdap-imports.json');
  const state = await jsonFile(file, { imported: [] });
  if (state.imported.includes(manifest.id)) return { idle: true, already_imported: manifest.id };
  const source = join(options.stateDirectory, `rdap-${manifest.id}.sqlite`);
  try {
    if (await exists(source)) await rm(source); // only this immutable incoming snapshot
    await (dependencies.download ?? downloadSnapshot)(storage, manifest, source);
    const result = await (dependencies.refresh ?? refresh)(refreshArgs(['--job', 'rdap-import', '--source-sqlite', source,
      '--local-database', options.database, '--state-directory', options.stateDirectory, ...targetArgs(options),
      ...(options.site ? ['--site', options.site] : [])]));
    if (result.skipped) return result;
    state.imported.push(manifest.id); state.last = { id: manifest.id, finished_at: new Date().toISOString(), ...result };
    await progressFile(file, state);
    return { id: manifest.id, ...result };
  } finally { await rm(source, { force: true }); }
}

export async function publishRuntimeStatus(options, storage, extra = {}) {
  const scheduler = await jsonFile(join(options.stateDirectory, 'scheduler.json'), {});
  const marker = await jsonFile(join(options.stateDirectory, 'bootstrap.json'), null);
  const imports = await jsonFile(join(options.stateDirectory, 'rdap-imports.json'), null);
  const value = { schema: 1, updated_at: new Date().toISOString(), environment: options.environment,
    release_sha: options.releaseSha, deployment_id: options.deploymentId, instance_id: options.instanceId,
    phase: marker?.complete ? 'ready' : 'bootstrapping', enabled_jobs: (process.env.AD_NETWORKS_ENABLED_JOBS || '').split(',').filter(Boolean),
    bootstrap: marker ? { seed_id: marker.seed.id, complete: marker.complete, completed_steps: marker.completed_steps, results: marker.results } : null,
    jobs: scheduler, rdap: imports?.last ?? null, ...extra };
  await storage.putJson('status/runtime.json', value);
  await progressFile(join(options.stateDirectory, 'heartbeat.json'), { at: value.updated_at, phase: value.phase });
  return value;
}

export async function startRuntime(options, dependencies = {}) {
  const storage = dependencies.storage ?? privateStorage(storageConfig(options));
  if (!await storage.bucket()) throw new Error('Upload a seed to the private handoff bucket before activation');
  await mkdir(options.stateDirectory, { recursive: true, mode: 0o700 });
  let publishing = Promise.resolve(), phase = 'starting', currentStep;
  const publish = (extra = {}) => {
    const next = publishing.catch(() => {}).then(() => publishRuntimeStatus(options, storage, { phase, current_step: currentStep, ...extra }));
    publishing = next; return next;
  };
  const heartbeat = setInterval(() => { void publish().catch(error => console.error(safeError(error))); }, 30000);
  try {
    await publish();
    phase = 'bootstrapping';
    await bootstrap(options, storage, { ...dependencies, onStep: step => { currentStep = step; return publish(); } });
    phase = 'ready'; currentStep = undefined;
    await jobAlert({ ...options, job: 'bootstrap', 'state-directory': options.stateDirectory }, false);
    await publish();
    // Import lazily so the scheduler can use runtime helpers without a cycle.
    const { runScheduler } = await import('./scheduler.mjs');
    await runScheduler(options, { publish, rdap: () => consumeRdap(options, storage) });
  } catch (error) {
    phase = 'failed';
    await publish({ error: safeError(error) }).catch(() => {});
    try { await jobAlert({ ...options, job: 'bootstrap', 'state-directory': options.stateDirectory }, true); } catch (alertError) { console.error(safeError(alertError)); }
    throw error;
  } finally { clearInterval(heartbeat); await publishing.catch(() => {}); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { await startRuntime(runtimeOptions()); } catch (error) { console.error(safeError(error)); process.exitCode = 1; }
}
