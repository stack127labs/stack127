import { existsSync, readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { setTimeout as delay } from 'node:timers/promises';

export const handoffBucket = 'stack127-ad-networks-jobs';
export const partBytes = 4 * 1024 * 1024;
export function storageConfig(options, env = process.env) {
  if (!['development', 'production'].includes(options.environment)) throw new Error('Invalid environment');
  if (options.apply && options.environment === 'production' && options.confirm !== 'stack127-production') throw new Error('Production confirmation missing');
  let values;
  if (env.AD_NETWORKS_RUNTIME_ENVIRONMENT || env.GITHUB_ACTIONS === 'true') {
    if (env.AD_NETWORKS_RUNTIME_ENVIRONMENT !== options.environment) throw new Error('Storage runtime environment mismatch');
    values = env;
  } else {
    const file = options.environment === 'production' ? '.env.database' : '.env.local';
    values = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
    if (options.environment === 'development' && existsSync('.env.database') && values.SUPABASE_URL === parseEnv(readFileSync('.env.database', 'utf8')).SUPABASE_URL) {
      throw new Error('Development Storage points to production');
    }
  }
  const url = new URL(values.SUPABASE_URL || 'https://invalid/');
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.username || url.password || url.search || url.hash || url.hostname === 'invalid') throw new Error('Valid SUPABASE_URL required');
  if (!values.SUPABASE_SECRET_KEY) throw new Error('SUPABASE_SECRET_KEY required');
  return { url: url.origin, key: values.SUPABASE_SECRET_KEY, bucket: handoffBucket };
}

export function privateStorage(config, fetchImpl = fetch) {
  const headers = { apikey: config.key, Authorization: `Bearer ${config.key}` };
  const path = key => {
    if (!/^[a-z0-9][a-z0-9/._-]*$/.test(key) || key.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('Invalid handoff object path');
    return key.split('/').map(encodeURIComponent).join('/');
  };
  async function request(endpoint, options = {}, missing = false) {
    for (let attempt = 0; attempt < 4; attempt++) {
      let response;
      try { response = await fetchImpl(`${config.url}/storage/v1/${endpoint}`, {
        ...options, headers: { ...headers, ...options.headers }, redirect: 'error', signal: AbortSignal.timeout(90000),
      }); } catch {
        if (attempt === 3) throw new Error('Storage network request failed');
        await delay(500 * 2 ** attempt); continue;
      }
      if (response.ok) return response;
      let detail = {}; try { detail = await response.json(); } catch { /* No response body is ever printed. */ }
      if (missing && (response.status === 404 || String(detail.statusCode) === '404')) return null;
      if ((response.status === 429 || response.status >= 500) && attempt < 3) { await delay(500 * 2 ** attempt); continue; }
      throw new Error(`Storage request failed: HTTP ${response.status}`);
    }
  }
  const bucket = async () => {
    const response = await request(`bucket/${encodeURIComponent(config.bucket)}`, {}, true);
    if (!response) return null;
    const data = await response.json();
    if (data.public !== false) throw new Error('Handoff bucket must be private');
    return data;
  };
  return {
    bucket,
    async ensureBucket() {
      if (await bucket()) return;
      await request('bucket', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        id: config.bucket, name: config.bucket, public: false, file_size_limit: 5 * 1024 * 1024,
        allowed_mime_types: ['application/octet-stream', 'application/json'],
      }) });
      await bucket();
    },
    async get(key, limit = partBytes, missing = false) {
      const response = await request(`object/authenticated/${config.bucket}/${path(key)}`, {}, missing);
      if (!response) return null;
      const reader = response.body.getReader(), chunks = []; let size = 0;
      try {
        while (true) { const { done, value } = await reader.read(); if (done) break;
          size += value.length; if (size > limit) throw new Error('Storage object exceeds expected size'); chunks.push(value); }
      } finally { await reader.cancel().catch(() => {}); }
      return Buffer.concat(chunks);
    },
    async getJson(key, missing = false) { const bytes = await this.get(key, 1024 * 1024, missing); return bytes ? JSON.parse(bytes.toString('utf8')) : null; },
    async put(key, bytes, json = false) {
      if (bytes.length > partBytes) throw new Error('Handoff object exceeds chunk limit');
      await request(`object/${config.bucket}/${path(key)}`, { method: 'POST',
        headers: { 'Content-Type': json ? 'application/json' : 'application/octet-stream', 'x-upsert': 'true', 'cache-control': 'max-age=0' }, body: bytes });
    },
    async putJson(key, value) { await this.put(key, Buffer.from(JSON.stringify(value)), true); },
    // Used only for removing this task's development test bucket and objects.
    async remove(keys) { await request(`object/${config.bucket}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: keys }) }); },
    async removeBucket() { await request(`bucket/${config.bucket}`, { method: 'DELETE' }); },
  };
}
