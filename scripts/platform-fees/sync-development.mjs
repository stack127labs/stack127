#!/usr/bin/env node
// Writes only the managed development project in .env.local.
import { readFile } from 'node:fs/promises';
import { parseEnv, parseArgs } from 'node:util';
import pg from 'pg';
import { validateDirectory } from '../../lib/platform-fees/model.ts';
import { syncPlatformFeeRecords, ensurePlatformFeePages } from './sync-records.mjs';
const { values } = parseArgs({ options: { apply: { type: 'boolean', default: false }, migrate: { type: 'boolean', default: false }, preview: { type: 'boolean', default: false } } });
const data = JSON.parse(await readFile(new URL('./data/directory.json', import.meta.url), 'utf8'));
validateDirectory(data);
console.log(JSON.stringify({ sections: data.sections.length, entries: data.entries.length, researched: data.entries.filter(entry => entry.checked_at).length, apply: values.apply }));
if (!values.apply) process.exit(0);
const dev = parseEnv(await readFile('.env.local', 'utf8'));
const prod = parseEnv(await readFile('.env.database', 'utf8'));
function identity(env) {
  const url = new URL(env.DATABASE_POOLER_URL || env.DATABASE_URL);
  return url.hostname.startsWith('db.') ? url.hostname.split('.')[1] : decodeURIComponent(url.username).replace(/^postgres\./, '');
}
if (!dev.SUPABASE_URL || !prod.SUPABASE_URL || dev.SUPABASE_URL === prod.SUPABASE_URL || identity(dev) === identity(prod) || identity(dev) !== new URL(dev.SUPABASE_URL).hostname.split('.')[0]) throw new Error('Distinct development and production projects are required');
const client = new pg.Client({ connectionString: dev.DATABASE_POOLER_URL || dev.DATABASE_URL, connectionTimeoutMillis: 15000 });
await client.connect();
try {
  const requiredSchema = (await client.query(`select table_name,column_name from information_schema.columns
    where table_schema='public' and table_name=any($1::text[])`, [['platform_fee_sections', 'platform_fee_entries']])).rows;
  const available = new Set(requiredSchema.map((field) => `${field.table_name}.${field.column_name}`));
  const missing = [...Object.keys(data.sections[0] ?? {}).map((name) => `platform_fee_sections.${name}`),
    ...Object.keys(data.entries[0] ?? {}).map((name) => `platform_fee_entries.${name}`)].filter((name) => !available.has(name));
  if (missing.length || !available.has('platform_fee_sections.id') || !available.has('platform_fee_entries.id')) {
    throw new Error('Platform fee schema is missing or outdated. Apply current canonical forward migrations with scripts/stack127/database/rebuild-development.mjs --apply --migrate, then rerun this sync. Archived experiment migrations must not be replayed.');
  }
  if (values.migrate) console.log(JSON.stringify({ schemaReady: true, migrate: 'validated only; use the canonical recovery script for migrations' }));
  await client.query('begin');
  try {
    const changes = await syncPlatformFeeRecords(client,data);
    const groupSlugs = await ensurePlatformFeePages(client);
    console.log(JSON.stringify({changes}));
    if (values.preview) await client.query("update public.stack127_pages set is_published=true,published_at=coalesce(published_at,now()),updated_at=now() where (slug='platform-fees' or slug=any($1::text[])) and not is_published", [groupSlugs]);
    await client.query('commit');
  } catch(error) { await client.query('rollback'); throw error; }
  console.log((await client.query('select (select count(*) from public.platform_fee_sections) sections, (select count(*) from public.platform_fee_entries) entries')).rows[0]);
} finally { await client.end(); }
