import assert from 'node:assert/strict';
import test from 'node:test';
import { deploymentConfig, capacityGate, preflight, activate, waitHealthy, dokployApi, composeEnvironment, appName } from '../../../scripts/ad-networks/deploy-runtime.mjs';
const GiB = 1024 ** 3, release = 'a'.repeat(40), createdAppName = `${appName}-abc123`;
const env = { GITHUB_ACTIONS: 'true', AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production', CONFIRM: 'stack127-production',
  DOKPLOY_API_KEY: 'test-key', CF_ACCESS_CLIENT_ID: 'test-id', CF_ACCESS_CLIENT_SECRET: 'test-secret',
  DATABASE_POOLER_URL: 'postgresql://user:password@example.com:5432/postgres', SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_SECRET_KEY: 'test-secret', GITHUB_ALERT_TOKEN: 'test-token', GHCR_DOKPLOY_TOKEN: 'test-pull-token', GHCR_DOKPLOY_USERNAME: 'test',
  RELEASE_SHA: release, DEPLOYMENT_ID: 'test-1', ENABLED_JOBS: 'snapshot,verification' };
const manifest = { schema: 1, kind: 'seed', id: 'a'.repeat(64), compressed_sha256: 'a'.repeat(64), sqlite_sha256: 'b'.repeat(64),
  sqlite_bytes: GiB, compressed_bytes: 100, created_at: new Date().toISOString(), parts: [{ path: `seed/${'a'.repeat(64)}/part-0000`, bytes: 100, sha256: 'c'.repeat(64) }] };
const health = () => ({ checkedAt: new Date().toISOString(), resources: { cpuCount: 4, memTotalBytes: 8 * GiB }, disk: { totalBytes: 100 * GiB, usedBytes: 20 * GiB } });
function mock(existing = null) {
  const calls = [], state = { compose: existing };
  const config = deploymentConfig(env);
  const status = { updated_at: new Date().toISOString(), phase: 'ready', release_sha: release, deployment_id: env.DEPLOYMENT_ID,
    bootstrap: { complete: true, seed_id: manifest.id }, enabled_jobs: config.enabled };
  const storage = { bucket: async () => ({ public: false }), getJson: async path => path === 'handoff/seed.json' ? manifest : status };
  const api = async (endpoint, body, method = 'GET') => {
    calls.push({ endpoint, body, method });
    if (endpoint === 'application.one') return { appName: 'app-navigate-1080p-matrix-3pmfy6', environmentId: 'prod' };
    if (endpoint === 'environment.one') return { compose: state.compose ? [state.compose] : [] };
    if (endpoint === 'compose.one') return state.compose;
    if (endpoint === 'docker.getContainers') return [{ name: 'app-navigate-1080p-matrix-3pmfy6.task.id', state: 'running', containerId: 'site' }];
    if (endpoint === 'docker.getServerHealth') return health();
    if (endpoint === 'docker.readContainerFile') return { content: Buffer.from(body.path === '/proc/loadavg' ? '0.2 0.3 0.1 1/100 123' : `MemAvailable: ${4 * GiB / 1024} kB\n`).toString('base64'), truncated: false };
    if (endpoint === 'registry.all') return [{ registryName: 'website-registry', registryId: 'leave-alone' }];
    if (endpoint === 'registry.create') return { registryId: 'jobs-registry' };
    if (endpoint === 'compose.create') { state.compose = { ...body, appName: createdAppName, composeId: 'jobs', serverId: null }; return state.compose; }
    if (endpoint === 'compose.update') { Object.assign(state.compose, body); return state.compose; }
    if (endpoint === 'compose.deploy') return {};
    if (endpoint === 'docker.getContainersByAppNameMatch') return [{ name: `${createdAppName}-jobs-1`, containerId: 'jobs-container', state: 'running' }];
    if (endpoint === 'docker.getConfig') return { State: { Health: { Status: 'healthy' } }, Config: { Image: `ghcr.io/stack127labs/stack127-ad-networks:${release}`, Env: [`AD_NETWORKS_DEPLOYMENT_ID=${env.DEPLOYMENT_ID}`] } };
    throw Error(`Unexpected API: ${endpoint}`);
  };
  return { config, calls, state, status, dependencies: { api, storage, assertUnpublished: async () => {}, fetch: async () => Response.json({ build: { sha: release } }) } };
}
test('activation requires protected Actions, explicit confirmation, known jobs and all required credential names', () => {
  assert.throws(() => deploymentConfig({ ...env, CONFIRM: '' }), /confirmation/);
  assert.throws(() => deploymentConfig({ ...env, GITHUB_ALERT_TOKEN: '' }), /GITHUB_ALERT_TOKEN/);
  assert.throws(() => deploymentConfig({ ...env, DATABASE_POOLER_URL: 'postgresql://u:p@host:6543/postgres' }), /session/);
  assert.throws(() => deploymentConfig({ ...env, ENABLED_JOBS: 'unknown' }), /enabled_jobs/);
  assert.deepEqual(deploymentConfig({ ...env, ENABLED_JOBS: '' }).enabled, []);
  assert.equal(new URL(deploymentConfig({ ...env, DATABASE_POOLER_URL: 'postgresql://user:password@aws-0-test.pooler.supabase.com:6543/postgres' }).env.DATABASE_POOLER_URL).port, '5432');
});
test('capacity checks CPU, actual available RAM, seed-sized disk allowance, load and freshness', () => {
  const proc = { meminfo: `MemAvailable: ${4 * GiB / 1024} kB`, loadavg: '0.2 0.3 0.1' };
  assert.equal(capacityGate(health(), proc, GiB).admitted, true);
  assert.equal(capacityGate(health(), { ...proc, loadavg: '3.5 0 0' }, GiB).admitted, false);
  assert.equal(capacityGate(health(), proc, 9 * GiB).admitted, false);
  assert.equal(capacityGate(health(), { ...proc, meminfo: 'MemAvailable: 500000 kB' }, GiB).admitted, false);
  assert.throws(() => capacityGate({ ...health(), checkedAt: '2020-01-01' }, proc, GiB), /stale/);
  assert.throws(() => capacityGate(health(), { ...proc, loadavg: '' }, GiB), /Missing/);
});
test('preflight is read-only and refuses stale site releases, ambiguity or a missing capacity endpoint', async () => {
  const m = mock(); await preflight(m.config, m.dependencies);
  assert.ok(m.calls.every(call => call.method === 'GET'));
  await assert.rejects(preflight(m.config, { ...m.dependencies, fetch: async () => Response.json({ build: { sha: 'old' } }) }), /released/);
  const broken = mock(); const api = broken.dependencies.api;
  await assert.rejects(preflight(broken.config, { ...broken.dependencies, api: (name, ...args) => name === 'docker.getServerHealth' ? Promise.reject(Error('unsupported endpoint')) : api(name, ...args) }), /unsupported/);
  assert.ok(broken.calls.every(call => call.method === 'GET'));
});
test('first activation creates one service; reruns update it, preserve activation time, never replace the volume', async () => {
  const m = mock(); await activate(m.config, m.dependencies);
  assert.equal(m.calls.filter(call => call.endpoint === 'compose.create').length, 1);
  const previous = m.state.compose.env.match(/AD_NETWORKS_ACTIVATED_AT='([^']+)'/)[1];
  m.calls.length = 0;
  await activate(m.config, m.dependencies);
  assert.equal(m.calls.filter(call => call.endpoint === 'compose.create').length, 0);
  assert.ok(m.state.compose.env.includes(`AD_NETWORKS_ACTIVATED_AT='${previous}'`));
  assert.equal(m.calls.find(call => call.endpoint === 'compose.deploy').body.freshVolumes, false);
  assert.ok(m.calls.filter(call => call.endpoint.startsWith('registry.')).every(call => call.body?.registryId !== 'leave-alone'));
});
test('health requires the exact deployment, release, enabled jobs, freshness, bootstrap and Docker health', async () => {
  const mutations = [m => { m.status.deployment_id = 'old'; }, m => { m.status.release_sha = 'old'; },
    m => { m.status.updated_at = '2020-01-01'; }, m => { m.status.phase = 'bootstrapping'; },
    m => { m.status.bootstrap.complete = false; }, m => { m.status.enabled_jobs = []; },
    m => { m.inspect = { State: { Health: { Status: 'unhealthy' } } }; },
    m => { m.inspect = { State: { Health: { Status: 'healthy' } }, Config: { Image: 'old', Env: [] } }; }];
  for (const mutate of mutations) {
    const m = mock(); mutate(m); let time = Date.now();
    const api = m.dependencies.api;
    await assert.rejects(waitHealthy(m.config, { ...m.dependencies,
      api: (name, ...args) => name === 'docker.getConfig' && m.inspect ? Promise.resolve(m.inspect) : api(name, ...args),
      server: {}, composeAppName: createdAppName, timeout: 10, now: () => time, delay: async () => { time += 20; } }), /deadline/);
  }
});

test('API failures keep response secrets out of diagnostics and reject Access redirects', async () => {
  const api = dokployApi(deploymentConfig(env), async () => new Response('private-env-response', { status: 302 }));
  await assert.rejects(api('application.one'), error => /HTTP 302/.test(error.message) && !/private-env-response/.test(error.message));
});
test('Compose variables retain literal dollar signs and reject newline injection', () => {
  assert.equal(composeEnvironment({ KEY: 'a$b' }), "KEY='a$b'\n");
  assert.throws(() => composeEnvironment({ KEY: 'a\nATTACK=b' }), /Multiline/);
});

test('a rerun can pause an existing service under low capacity; initial deployment still refuses it', async () => {
  for (const existing of [false, true]) {
    const m = mock(existing ? { name: 'ad-networks-jobs', appName: createdAppName, composeId: 'jobs', sourceType: 'raw', environmentId: 'prod' } : null);
    m.config = deploymentConfig({ ...env, ENABLED_JOBS: '' });
    const api = m.dependencies.api;
    const deps = { ...m.dependencies, api: (name, ...args) => name === 'docker.getServerHealth' ? Promise.resolve({ ...health(), resources: { cpuCount: 1, memTotalBytes: 8 * GiB } }) : api(name, ...args) };
    if (existing) assert.equal((await preflight(m.config, deps)).capacity.admitted, false);
    else await assert.rejects(preflight(m.config, deps), /capacity gate failed/);
  }
});

test('a lost response after Compose creation is recovered by discovery on the next activation', async () => {
  const m = mock(), api = m.dependencies.api; let interrupted = false;
  await assert.rejects(activate(m.config, { ...m.dependencies, api: (name, ...args) => {
    if (name === 'compose.update' && !interrupted) { interrupted = true; throw Error('connection lost'); }
    return api(name, ...args);
  } }), /connection lost/);
  await activate(m.config, m.dependencies);
  assert.equal(m.calls.filter(call => call.endpoint === 'compose.create').length, 1);
});
