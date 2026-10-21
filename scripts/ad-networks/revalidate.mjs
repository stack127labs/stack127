import { createHmac } from 'node:crypto';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import { targetPool } from './runtime-db.mjs';
import { targetsForEvents } from '../stack127/cache/targets.mjs';
import { refreshCopyCounts } from './refresh-copy-counts.mjs';

export function revalidationSite(options) {
  const site = new URL(options.site || (options.environment === 'production' ? 'https://stack127.com' : 'http://127.0.0.1:3333'));
  if (site.username || site.password || site.pathname !== '/' || site.search || site.hash
    || (options.environment === 'production' ? site.origin !== 'https://stack127.com'
      : site.protocol !== 'http:' || site.hostname !== '127.0.0.1' || !site.port)) throw new Error('Invalid revalidation origin for environment');
  return site;
}

export async function revalidateAdNetworks(options, dependencies = {}) {
  const site = revalidationSite(options);
  const targets = targetsForEvents([{ entity_type: 'ad_networks', slug: 'all' }]);
  if (!options.apply) return { applied: false, environment: options.environment, paths: targets.paths.length, tags: targets.nextTags };
  const pool = dependencies.pool ?? targetPool(options);
  let client;
  try {
    client = await pool.connect();
    await (dependencies.refreshCopyCounts ?? refreshCopyCounts)(client, { apply: true });
    const credential = (await client.query('select signing_key from public.stack127_cache_credentials where id')).rows[0];
    if (!credential?.signing_key) throw new Error('Cache signing key missing');
    const token = createHmac('sha256', credential.signing_key).update('stack127-cache-revalidation-v1').digest('hex');
    const response = await (dependencies.fetch ?? fetch)(new URL('/api/cache/revalidate', site), {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: targets.paths, tags: targets.nextTags }), redirect: 'error', signal: AbortSignal.timeout(30000),
    });
    if (!response.ok || !(await response.json()).ok) throw new Error(`Revalidation failed: HTTP ${response.status}`);
    // Never acknowledge queue events here. The existing cache-worker verifies
    // origin/edge responses (or rebuilds Cloudflare's static export) before ack.
    return { applied: true, environment: options.environment, origin_revalidated: true, durable_cache_queue: true, paths: targets.paths.length };
  } finally {
    try { client?.release(); } finally { await pool.end(); }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: { environment: { type: 'string', default: 'development' },
    confirm: { type: 'string' }, apply: { type: 'boolean', default: false }, site: { type: 'string' } } });
  try { console.log(JSON.stringify(await revalidateAdNetworks(values))); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
