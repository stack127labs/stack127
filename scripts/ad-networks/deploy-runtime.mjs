#!/usr/bin/env node
// This command is invoked only by the protected, explicitly confirmed workflow.
// Preflight performs GET requests only. Never print Dokploy response bodies:
// application, Compose and registry objects can contain credentials.
import { readFile } from 'node:fs/promises';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { privateStorage, storageConfig } from './handoff-storage.mjs';
import { validateManifest } from './handoff.mjs';
import { scheduledJobs } from './scheduler.mjs';
import { assertUnpublished } from './runtime.mjs';
import { safeError } from './alerts.mjs';
import { sessionDatabaseUrl } from './runtime-db.mjs';

export const serviceName = 'ad-networks-jobs';
export const appName = 'stack127-ad-networks-jobs';
const registryName = `${appName}-ghcr`;
const GiB = 1024 ** 3;
export function deploymentConfig(env = process.env) {
  if (env.GITHUB_ACTIONS !== 'true' || env.CONFIRM !== 'stack127-production') throw new Error('Protected GitHub workflow and stack127-production confirmation required');
  const names = ['DOKPLOY_API_KEY', 'CF_ACCESS_CLIENT_ID', 'CF_ACCESS_CLIENT_SECRET', 'DATABASE_POOLER_URL', 'SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'GITHUB_ALERT_TOKEN', 'GHCR_DOKPLOY_TOKEN', 'GHCR_DOKPLOY_USERNAME', 'RELEASE_SHA', 'DEPLOYMENT_ID'];
  for (const name of names) if (!env[name]) throw new Error(`Missing production secret or variable: ${name}`);
  if (!/^[a-f0-9]{40}$/.test(env.RELEASE_SHA) || !/^[a-zA-Z0-9_-]+$/.test(env.DEPLOYMENT_ID)) throw new Error('Invalid release or deployment ID');
  const enabled = (env.ENABLED_JOBS || '').split(',').filter(Boolean);
  if (enabled.some(job => !scheduledJobs.includes(job)) || new Set(enabled).size !== enabled.length) throw new Error('Invalid enabled_jobs list');
  env = { ...env, DATABASE_POOLER_URL: sessionDatabaseUrl(env.DATABASE_POOLER_URL) };
  const apiUrl = (env.DOKPLOY_API_URL || 'https://dokploy.stack127.com').trim().replace(/\/$/, '');
  if (apiUrl !== 'https://dokploy.stack127.com') throw new Error('Unexpected production Dokploy target');
  return { env, enabled, releaseSha: env.RELEASE_SHA, deploymentId: env.DEPLOYMENT_ID, apiUrl };
}
export function dokployApi(config, fetchImpl = fetch) {
  return async (endpoint, data = {}, method = 'GET') => {
    const query = new URLSearchParams(Object.entries(data).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, String(v)]));
    let response;
    try { response = await fetchImpl(`${config.apiUrl}/api/${endpoint}${method === 'GET' && query.size ? `?${query}` : ''}`, {
      method, redirect: 'manual', signal: AbortSignal.timeout(60000), headers: { 'Content-Type': 'application/json',
        'x-api-key': config.env.DOKPLOY_API_KEY, 'CF-Access-Client-Id': config.env.CF_ACCESS_CLIENT_ID,
        'CF-Access-Client-Secret': config.env.CF_ACCESS_CLIENT_SECRET }, ...(method === 'GET' ? {} : { body: JSON.stringify(data) }),
    }); } catch { throw new Error(`Dokploy ${endpoint} network request failed`); }
    if (!response.ok) throw new Error(`Dokploy ${endpoint}: HTTP ${response.status}; verify API version, permissions and Cloudflare Access service-token policy`);
    try { return await response.json(); } catch { throw new Error(`Dokploy ${endpoint}: expected JSON`); }
  };
}
export function capacityGate(health, proc, seedBytes, now = Date.now()) {
  const cpu = health?.resources?.cpuCount, ram = health?.resources?.memTotalBytes;
  const available = Number(/^MemAvailable:\s+(\d+)\s+kB$/m.exec(proc.meminfo)?.[1]) * 1024;
  const load = /^\d+(?:\.\d+)?\s/.test(proc.loadavg || '') ? Number(proc.loadavg.trim().split(/\s+/)[0]) : NaN;
  const total = health?.disk?.totalBytes, used = health?.disk?.usedBytes;
  const age = now - Date.parse(health?.checkedAt);
  if (health?.error || ![cpu, ram, available, total, used, load, age, seedBytes].every(Number.isFinite)
    || cpu <= 0 || ram <= 0 || available < 0 || available > ram || total <= 0 || used < 0 || used > total || load < 0 || age < -60000 || age > 300000) throw new Error('Missing, invalid or stale OVH capacity measurements');
  const free = total - used, diskGate = Math.max(15 * GiB, seedBytes * 10 + 3 * GiB);
  const result = { cpu_count: cpu, ram_gib: +(ram / GiB).toFixed(2), available_ram_gib: +(available / GiB).toFixed(2),
    free_disk_gib: +(free / GiB).toFixed(2), load_1m: load, checked_at: health.checkedAt,
    gate: { cpu_count: 2, available_ram_gib: 2, free_disk_gib: +(diskGate / GiB).toFixed(2), load_1m_below: cpu - 0.5 } };
  return { ...result, admitted: cpu >= 2 && available >= 2 * GiB && free >= diskGate && load < cpu - 0.5 };
}
export async function preflight(config, dependencies = {}) {
  const api = dependencies.api ?? dokployApi(config);
  const storage = dependencies.storage ?? privateStorage(storageConfig({ environment: 'production' }, config.env));
  const target = JSON.parse(await readFile(new URL('../stack127/deployment/targets.json', import.meta.url), 'utf8')).production;
  const site = await api('application.one', { applicationId: target.dokploy.applicationId });
  if (site.appName !== target.dokploy.appName || !site.environmentId) throw new Error('Production application identity mismatch');
  const server = site.serverId ? { serverId: site.serverId } : {};
  const environment = await api('environment.one', { environmentId: site.environmentId });
  const matches = (environment.compose || []).filter(row => row.name === serviceName || row.appName?.startsWith(`${appName}-`));
  if (matches.length > 1 || matches.some(row => row.name !== serviceName || !new RegExp(`^${appName}-[a-z0-9]{6}$`).test(row.appName))) throw new Error('Ambiguous jobs Compose identity');
  const existing = matches[0] ? await api('compose.one', { composeId: matches[0].composeId }) : null;
  if (existing && (existing.sourceType !== 'raw' || existing.environmentId !== site.environmentId || (existing.serverId || null) !== (site.serverId || null))) throw new Error('Jobs service target or source mismatch');
  if (!await storage.bucket()) throw new Error('Upload the homelab seed to the private handoff bucket first');
  const seed = validateManifest(await storage.getJson('handoff/seed.json'), 'seed');
  await (dependencies.assertUnpublished ?? assertUnpublished)({ environment: 'production' });
  const fetchImpl = dependencies.fetch ?? fetch;
  const live = await fetchImpl('https://stack127.com/api/health?scope=deploy', { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!live.ok || (await live.json())?.build?.sha !== config.releaseSha) throw new Error('Jobs SHA must match the released production site');
  const containers = await api('docker.getContainers', server);
  const container = containers.find(row => row.state === 'running' && (row.name === site.appName || row.name.startsWith(`${site.appName}.`)));
  if (!container) throw new Error('Cannot read host capacity through the running production site container');
  const readProc = async path => {
    const result = await api('docker.readContainerFile', { ...server, containerId: container.containerId, path });
    if (result.truncated || typeof result.content !== 'string') throw new Error('Incomplete host capacity response');
    return Buffer.from(result.content, 'base64').toString('utf8');
  };
  const health = await api('docker.getServerHealth', { ...server, sinceHours: 1 });
  const capacity = capacityGate(health, { loadavg: await readProc('/proc/loadavg'), meminfo: await readProc('/proc/meminfo') }, seed.sqlite_bytes);
  // An existing service can always be paused for recovery, even under pressure.
  // First activation and every nonempty enable request must pass admission.
  const pause = !!existing && config.enabled.length === 0;
  if (!capacity.admitted && !pause) throw new Error(`OVH capacity gate failed: ${JSON.stringify(capacity)}`);
  console.log(JSON.stringify({ preflight: true, capacity, pause, compose_exists: !!existing, seed_id: seed.id }));
  return { site, existing, capacity, server, storage, api };
}

export function composeEnvironment(values) {
  return Object.entries(values).map(([key, value]) => {
    value = String(value);
    if (/[\r\n\0]/.test(value)) throw new Error(`Multiline runtime variable rejected: ${key}`);
    // Compose dotenv single quotes prevent interpolation of credentials with '$'.
    return `${key}='${value.replaceAll("'", "\\'")}'`;
  }).join('\n') + '\n';
}
export async function activate(config, dependencies = {}) {
  const context = await preflight(config, dependencies), { api, site, existing, server, storage } = context;
  const composeFile = await readFile(new URL('./runtime/compose.yml', import.meta.url), 'utf8');
  const prior = parseEnv(existing?.env || '');
  const activatedAt = prior.AD_NETWORKS_ACTIVATED_AT || new Date().toISOString();
  if (new Date(activatedAt).toISOString() !== activatedAt) throw new Error('Invalid persisted activation time');
  const env = composeEnvironment({ AD_NETWORKS_RELEASE_SHA: config.releaseSha, AD_NETWORKS_DEPLOYMENT_ID: config.deploymentId,
    AD_NETWORKS_ACTIVATED_AT: activatedAt, AD_NETWORKS_ENABLED_JOBS: config.enabled.join(','),
    DATABASE_POOLER_URL: config.env.DATABASE_POOLER_URL, SUPABASE_URL: config.env.SUPABASE_URL,
    SUPABASE_SECRET_KEY: config.env.SUPABASE_SECRET_KEY, GITHUB_ALERT_TOKEN: config.env.GITHUB_ALERT_TOKEN });
  const registries = await api('registry.all');
  const owned = registries.filter(row => row.registryName === registryName);
  if (owned.length > 1) throw new Error('Ambiguous jobs registry identity');
  const registry = { registryName, username: config.env.GHCR_DOKPLOY_USERNAME, password: config.env.GHCR_DOKPLOY_TOKEN,
    registryUrl: 'ghcr.io', registryType: 'cloud', imagePrefix: null, ...server };
  await api(owned.length ? 'registry.update' : 'registry.create', { ...registry, ...(owned.length ? { registryId: owned[0].registryId } : {}) }, 'POST');
  let composeId = existing?.composeId;
  if (!composeId) {
    const created = await api('compose.create', { name: serviceName, description: 'Automatic production data jobs; pages remain unpublished', appName, environmentId: site.environmentId,
      serverId: site.serverId || null, composeType: 'docker-compose', sourceType: 'raw', composeFile }, 'POST');
    composeId = created?.composeId;
    if (!composeId) throw new Error('Dokploy create returned no composeId; rerun discovers the service by its stable name');
  }
  await api('compose.update', { composeId, composeFile, sourceType: 'raw', composeType: 'docker-compose', autoDeploy: false, createEnvFile: true, env }, 'POST');
  await api('compose.deploy', { composeId, title: `Ad-network jobs ${config.releaseSha.slice(0, 12)}`,
    description: `GitHub activation ${config.deploymentId}`, freshVolumes: false }, 'POST');
  console.log(JSON.stringify({ deployed: true, compose_id: composeId, release_sha: config.releaseSha, enabled_jobs: config.enabled }));
  const deployed = await api('compose.one', { composeId });
  if (deployed.name !== serviceName || !new RegExp(`^${appName}-[a-z0-9]{6}$`).test(deployed.appName)) throw new Error('Unexpected deployed Compose identity');
  await waitHealthy(config, { ...dependencies, api, storage, server, composeId, composeAppName: deployed.appName });
  return { composeId, releaseSha: config.releaseSha, enabled: config.enabled };
}
export async function waitHealthy(config, dependencies) {
  const { api, storage, server, composeAppName } = dependencies, now = dependencies.now ?? Date.now;
  const deadline = now() + (dependencies.timeout ?? 45 * 60000);
  while (now() < deadline) {
    const containers = await api('docker.getContainersByAppNameMatch', { appName: composeAppName, appType: 'docker-compose', ...server });
    const jobs = containers.filter(row => row.name === `${composeAppName}-jobs-1` || row.name === `${composeAppName}_jobs_1`);
    if (jobs.length === 1 && jobs[0].state === 'running') {
      const inspect = await api('docker.getConfig', { containerId: jobs[0].containerId, ...server });
      const status = await storage.getJson('status/runtime.json', true);
      const age = now() - Date.parse(status?.updated_at);
      const marker = inspect?.Config?.Env?.find(value => value.startsWith('AD_NETWORKS_DEPLOYMENT_ID='));
      if (inspect?.State?.Health?.Status === 'healthy' && inspect?.Config?.Image === `ghcr.io/stack127labs/stack127-ad-networks:${config.releaseSha}` && marker === `AD_NETWORKS_DEPLOYMENT_ID=${config.deploymentId}`
        && status?.phase === 'ready' && status?.bootstrap?.complete && status.release_sha === config.releaseSha
        && status.deployment_id === config.deploymentId && Number.isFinite(age) && age >= -60000 && age < 120000
        && JSON.stringify(status.enabled_jobs) === JSON.stringify(config.enabled)) {
        console.log(JSON.stringify({ healthy: true, release_sha: status.release_sha, deployment_id: status.deployment_id,
          seed_id: status.bootstrap.seed_id, enabled_jobs: status.enabled_jobs })); return;
      }
      if (status?.deployment_id === config.deploymentId && status.phase === 'failed') throw new Error('Jobs bootstrap failed; read private Storage status and the failure issue');
    }
    await (dependencies.delay ?? delay)(15000);
  }
  throw new Error('Jobs did not become healthy before the 45-minute deadline; inspect private Storage status, then pause with enabled_jobs empty');
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const config = deploymentConfig();
    if (process.argv[2] === 'preflight') await preflight(config);
    else if (process.argv[2] === 'activate') await activate(config);
    else throw new Error('Use preflight or activate');
  } catch (error) { console.error(safeError(error)); process.exitCode = 1; }
}
