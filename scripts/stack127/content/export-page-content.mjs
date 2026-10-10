#!/usr/bin/env node
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import pg from 'pg';
import { resolveDatabaseUrl } from '../tool-pages/lib.mjs';
import { pageContentFiles } from './convert-markdown.mjs';
import { routeMatches } from '../publishing/readiness.mjs';

export function parseExportArgs(argv) {
  const args = { environment: 'development' };
  for (let index = 0; index < argv.length; index++) {
    const match = /^--(slug|environment|out|force)(?:=(.*))?$/.exec(argv[index]);
    if (!match) throw new Error(`Unknown argument: ${argv[index]}`);
    const [, key, inline] = match;
    if (key === 'force') {
      if (inline !== undefined) throw new Error('--force is a flag');
      args.force = true;
    } else {
      const value = inline ?? argv[++index];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for --${key}`);
      args[key] = value;
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(args.slug ?? '')) throw new Error('--slug must be a page slug');
  if (!['development', 'production'].includes(args.environment)) throw new Error('--environment must be development or production');
  return args;
}

export async function findRouteFolder(slug, root = 'app/(site)', family) {
  const matches = [];
  const group = { tool: '(tools)', directory: '(directories)', catalog: '(catalogs)' }[family];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name === 'page.tsx') {
        const relative = path.relative(root, file).split(path.sep).join('/');
        if ((!group || relative.startsWith(`${group}/`)) && routeMatches(`app/(site)/${relative}`, slug)) matches.push(directory);
      }
    }
  }
  await walk(root);
  // Next.js serves a literal route before a matching dynamic route.
  const literal = matches.filter(directory => !path.relative(root, directory).includes('['));
  const candidates = literal.length ? literal : matches;
  if (candidates.length !== 1) throw new Error(`Expected one page.tsx route for ${slug}; found ${candidates.length}`);
  return candidates[0];
}

export async function readPageContent(pool, slug) {
  const client = await pool.connect();
  try {
    await client.query('begin transaction isolation level repeatable read read only');
    const page = (await client.query('select id, slug, page_family from public.stack127_pages where slug = $1', [slug])).rows[0];
    if (!page) throw new Error(`Page not found in stack127_pages: ${slug}`);
    const table = { tool: 'stack127_tool_pages', directory: 'stack127_directory_pages', catalog: 'stack127_catalog_pages' }[page.page_family];
    if (!table) throw new Error(`Unsupported page family: ${page.page_family}`);
    const fields = `intro_markdown, content_markdown${page.page_family === 'tool' ? ', usage_markdown' : ''}`;
    const hasLiveContent = (await client.query(`select exists (
      select 1 from information_schema.columns where table_schema='public'
        and table_name=$1 and column_name='intro_markdown'
    ) as present`, [table])).rows[0].present;
    const content = hasLiveContent
      ? (await client.query(`select ${fields} from public.${table} where page_id = $1`, [page.id])).rows[0]
      : await client.query(`select column_name,value from public.stack127_retired_page_content
          where page_id=$1 and table_name=$2`, [page.id, table]).then(({ rows }) =>
          rows.length ? Object.fromEntries(rows.map(row => [row.column_name, row.value])) : undefined);
    if (!content) throw new Error(`Content row not found for ${slug}`);
    await client.query('rollback');
    return { ...page, ...content };
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally { client.release(); }
}

export async function writeContentFiles(files, directory, { force = false } = {}) {
  // Check every destination before writing any of the exported files.
  if (!force) {
    for (const name of Object.keys(files)) {
      try { await access(path.join(directory, name)); }
      catch (error) { if (error.code === 'ENOENT') continue; throw error; }
      throw new Error(`Refusing to overwrite ${path.join(directory, name)}; use --force`);
    }
  }
  await mkdir(directory, { recursive: true });
  for (const [name, content] of Object.entries(files)) await writeFile(path.join(directory, name), content, { flag: force ? 'w' : 'wx' });
  return Object.keys(files).map(name => path.join(directory, name));
}

export async function exportPageContent(args) {
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl(args), max: 1, connectionTimeoutMillis: 15000, query_timeout: 60000 });
  let page;
  try { page = await readPageContent(pool, args.slug); }
  finally { await pool.end(); }
  const route = await findRouteFolder(args.slug, 'app/(site)', page.page_family);
  const files = pageContentFiles(page);
  const directory = args.out ? path.resolve(args.out) : path.join(route, 'content',
    route.includes('[') ? args.slug.split('/').at(-1) : '');
  return { slug: page.slug, family: page.page_family, environment: args.environment,
    files: await writeContentFiles(files, directory, args) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { console.log(JSON.stringify(await exportPageContent(parseExportArgs(process.argv.slice(2))), null, 2)); }
  catch (error) {
    // Database errors can include connection details. Only local conversion and argument errors are printed.
    console.error(error.constructor === Error ? error.message : `Database export failed${error.code ? ` (${error.code})` : ''}`);
    process.exitCode = 1;
  }
}
