#!/usr/bin/env node
// Writes only the managed development project in .env.local.
import { readFile } from 'node:fs/promises';
import { parseEnv, parseArgs } from 'node:util';
import pg from 'pg';
import { validateDirectory } from '../../lib/platform-fees/model.ts';
import { sectionPath } from '../../lib/platform-fees/section-routes.ts';
import { upsertDirectoryPage, platformFeeSectionCopy, platformFeeOverviewCopy } from '../stack127/directory-pages/lib.mjs';
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
    // Reload this directory alone; unrelated directory and registry data is preserved.
    await client.query('delete from public.platform_fee_entries');
    await client.query('delete from public.platform_fee_sections');
    await client.query('insert into public.platform_fee_sections select * from jsonb_populate_recordset(null::public.platform_fee_sections, $1::jsonb)', [JSON.stringify(data.sections)]);
    await client.query('insert into public.platform_fee_entries select * from jsonb_populate_recordset(null::public.platform_fee_entries, $1::jsonb)', [JSON.stringify(data.entries)]);
    for (const section of data.sections) {
      const slug = sectionPath(section.id).slice(1);
      const oldSlug = `platform-fees/${section.id}`;
      if (oldSlug !== slug) {
        // Retain the publication history when moving an existing registry row.
        await client.query('update public.stack127_pages set slug=$2 where slug=$1 and not exists (select 1 from public.stack127_pages where slug=$2)', [oldSlug, slug]);
        await client.query('update public.stack127_pages set is_published=false where slug=$1', [oldSlug]);
      }
      await client.query(`insert into public.stack127_pages (slug,page_family,label,meta_title,meta_description,is_published,page_type,sitemap_priority)
        values ($1,'directory',$2,$3,$4,false,'CollectionPage',0.6)
        on conflict (slug) do update set page_family=excluded.page_family, label=excluded.label, meta_title=excluded.meta_title, meta_description=excluded.meta_description,
          page_type=excluded.page_type, updated_at=case when stack127_pages.is_published then now() else stack127_pages.updated_at end`,
        [slug, section.name, section.meta_title, section.meta_description]);
      await upsertDirectoryPage(client, platformFeeSectionCopy(section, slug));
    }
    await client.query(`update public.stack127_pages set
      meta_title=$1,
      meta_description='Compare selling fees, start costs and payment charges across app stores, digital products and creator platforms. Choose a category and compare sourced rates.',
      updated_at=case when is_published then now() else updated_at end
      where slug='platform-fees'`, [`Platform fees compared: ${data.entries.length} platforms across ${data.sections.length} categories`]);
    await upsertDirectoryPage(client, platformFeeOverviewCopy(data.sections.length, data.entries.length));
    if (values.preview) await client.query("update public.stack127_pages set is_published=true,published_at=coalesce(published_at,now()),updated_at=now() where slug='platform-fees' or slug=any($1::text[])", [data.sections.map(section => sectionPath(section.id).slice(1))]);
    await client.query('commit');
  } catch(error) { await client.query('rollback'); throw error; }
  console.log((await client.query('select (select count(*) from public.platform_fee_sections) sections, (select count(*) from public.platform_fee_entries) entries')).rows[0]);
} finally { await client.end(); }
