#!/usr/bin/env node
// Records only: no page creation, publication, or metadata edits.
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { validateDirectory } from '../../lib/platform-fees/model.ts';
import { resolveDatabaseUrl } from '../stack127/tool-pages/lib.mjs';
import { syncPlatformFeeRecords } from './sync-records.mjs';
import { diffPlatformFeeRecords, assertNoPlatformFeeDeletes } from './record-diff.mjs';

export function datasetArgs(args = process.argv.slice(2)) {
  const { values } = parseArgs({ args, options: {
    environment: { type: 'string', default: 'development' },
    apply: { type: 'boolean' }, confirm: { type: 'string' },
    'allow-delete': { type: 'boolean', default: false },
  } });
  if (!['development', 'production'].includes(values.environment)) throw new Error('Use --environment development or production');
  if (values.environment === 'production' && values.confirm !== 'stack127-production') {
    throw new Error('Production requires --confirm stack127-production (including previews)');
  }
  return values;
}

async function readRecords(client) {
  // to_jsonb preserves date-only strings and numeric values for comparison.
  const sections = await client.query('select to_jsonb(r) as record from public.platform_fee_sections r order by id');
  const entries = await client.query('select to_jsonb(r) as record from public.platform_fee_entries r order by id');
  return { sections: sections.rows.map(row => row.record), entries: entries.rows.map(row => row.record) };
}

export async function syncDataset(client, data, options, report = console.log) {
  await client.query(options.apply ? 'begin' : 'begin isolation level repeatable read read only');
  try {
    await client.query("set local lock_timeout = '10s'");
    // Hold both tables against concurrent writers between the guard and sync.
    if (options.apply) await client.query('lock table public.platform_fee_sections, public.platform_fee_entries in share row exclusive mode');
    const diff = diffPlatformFeeRecords(await readRecords(client), data);
    report(JSON.stringify({ environment: options.environment, apply: Boolean(options.apply), ...diff }, null, 2));
    if (options.apply) {
      assertNoPlatformFeeDeletes(diff, options['allow-delete']);
      await syncPlatformFeeRecords(client, data);
    }
    await client.query(options.apply ? 'commit' : 'rollback');
    return diff;
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  }
}

async function main() {
  const options = datasetArgs();
  const data = JSON.parse(await readFile(new URL('./data/directory.json', import.meta.url), 'utf8'));
  validateDirectory(data); // Fail before reading credentials or connecting.
  const client = new pg.Client({ connectionString: resolveDatabaseUrl(options),
    connectionTimeoutMillis: 15000, query_timeout: 120000,
    // Enforce read-only from connection startup as well as inside the preview.
    ...(!options.apply ? { options: '-c default_transaction_read_only=on' } : {}),
    application_name: 'stack127-platform-fees-dataset' });
  try {
    await client.connect();
    await syncDataset(client, data, options);
    console.log(options.apply ? 'Records committed.' : 'Read-only preview; no records changed.');
    console.log('Changed records queue platform_fees events through existing triggers. The cache worker refreshes stack127-platform-fees; in Cloudflare mode, wait for stack127-frontend-refresh.yml and verify the public pages. See stack127_docs/caching.md and stack127_docs/cloudflare.md.');
  } finally { await client.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
