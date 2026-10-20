import pg from 'pg';
import { resolveDatabaseUrl } from '../stack127/tool-pages/lib.mjs';

export function sessionDatabaseUrl(value) {
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Postgres database URL required');
  if (!url.port || url.port === '5432') return value;
  // Supabase shared session/transaction poolers use the same host, user and
  // password, with different ports. Never guess a different hostname/project.
  if (url.hostname.endsWith('.pooler.supabase.com') && url.port === '6543') { url.port = '5432'; return url.toString(); }
  throw new Error('Ad-network jobs require a direct or session pooling connection on port 5432');
}

export function targetDatabaseUrl(options, env = process.env) {
  if (!['development', 'production'].includes(options.environment)) throw new Error('Invalid environment');
  if (options.apply && options.environment === 'production' && options.confirm !== 'stack127-production') {
    throw new Error('Production writes require --confirm stack127-production');
  }
  // Cron jobs receive explicitly loaded variables instead of checkout env files.
  // Require an explicit target marker so inherited production credentials can
  // never silently become a development connection.
  if (env.AD_NETWORKS_RUNTIME_ENVIRONMENT) {
    if (env.AD_NETWORKS_RUNTIME_ENVIRONMENT !== options.environment) throw new Error('Runtime database environment mismatch');
    const url = env.DATABASE_POOLER_URL || env.DATABASE_URL;
    if (!url) throw new Error('Runtime database URL missing');
    return sessionDatabaseUrl(url);
  }
  return sessionDatabaseUrl(resolveDatabaseUrl({ ...options, apply: options.apply ? true : undefined }));
}

export function targetPool(options) {
  return new pg.Pool({ connectionString: targetDatabaseUrl(options), max: 1,
    connectionTimeoutMillis: 15000, query_timeout: 120000, application_name: 'stack127-ad-networks-jobs' });
}

export async function withJobLock(options, work, dependencies = {}) {
  const pool = dependencies.pool ?? targetPool(options);
  let client, locked = false, lockError;
  const controller = new AbortController();
  const lost = () => { lockError = new Error('Sync database lock connection lost'); controller.abort(); };
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try { client = await pool.connect(); break; }
      catch (error) {
        if (attempt === 2 || !['ENOTFOUND', 'EAI_AGAIN', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED'].includes(error.code)) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * 2 ** attempt));
      }
    }
    client.on?.('error', lost);
    locked = (await client.query("select pg_try_advisory_lock(hashtext('ad-networks-runtime-heavy')) as locked")).rows[0].locked;
    if (!locked) return { skipped: true, reason: 'another sync is running' };
    // The lock and every sync query share this one session.
    const result = await work(controller.signal, client);
    if (lockError) throw lockError;
    return result;
  } finally {
    if (locked) await client.query("select pg_advisory_unlock(hashtext('ad-networks-runtime-heavy'))").catch(() => {});
    client?.off?.('error', lost);
    client?.release();
    await pool.end();
  }
}
