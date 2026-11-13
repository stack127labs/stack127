import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import { parseArgs, requireArg, resolveDatabaseUrl } from '../tool-pages/lib.mjs';
import { readCategories, categorySmokeCheck } from './categories.mjs';
import { MIN_CATEGORY_APPS } from '../../../lib/app-category-model.ts';
const args = parseArgs();
for (const key of Object.keys(args)) if (!['directory','out','indexable','category'].includes(key)) throw new Error(`Unsupported --${key}`);
if (!['true','false'].includes(args.indexable)) throw new Error('Explicit --indexable true|false is required; true needs reviewed copy.');
const directory = requireArg(args, 'directory');
const client = new pg.Client({ connectionString: resolveDatabaseUrl({ environment: 'development' }), options: '-c default_transaction_read_only=on' });
await client.connect();
try {
  const pages = [];
  for (const category of await readCategories(client, directory)) {
    if (category.count < MIN_CATEGORY_APPS || (args.category && category.slug !== args.category)) continue;
    const route = `app/(site)/(directories)/${directory}/categories/[category]`;
    const intro = `${route}/content/${category.slug}/intro.mdx`;
    const about = `${route}/content/${category.slug}/about.mdx`;
    for (const [name, file] of [["intro", intro], ["about", about]]) if (!existsSync(file)) throw new Error(`Missing ${name}: ${file}`);
    const slug = `${directory}/categories/${category.slug}`;
    const page = (await client.query(`select content.title from public.stack127_directory_pages content
      join public.stack127_pages page on page.id=content.page_id where page.slug=$1 and page.page_family='directory'`, [slug])).rows[0];
    if (!page) throw new Error(`Missing development category page: ${slug}`);
    pages.push({ slug: `${directory}/categories/${category.slug}`, family: 'directory', source: 'development',
      registry: { is_published: true, is_indexable: args.indexable === 'true' },
      touch_reason: 'Category introduction and complete app list',
      requirements: { route: `${route}/page.tsx`, assets: [intro, about], records: { kind: 'database', checks: [{
        name: 'Category has at least 15 published apps', sql_file: 'scripts/stack127/app-categories/records-ready.sql', params: [directory, category.slug],
      }] }, smoke: [categorySmokeCheck(directory, category.slug, page.title)] },
    });
  }
  if (!pages.length) throw new Error('No eligible categories selected');
  const out = requireArg(args, 'out'); await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify({ schema_version: 1, kind: 'directories', pages }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ manifest: out, pages: pages.length, indexable: args.indexable }));
} finally { await client.end(); }
