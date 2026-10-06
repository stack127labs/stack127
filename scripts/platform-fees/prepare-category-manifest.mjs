// Prepare publication input only. The publisher previews and applies it.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import path from 'node:path';
import pg from 'pg';
import { feeGroups, groupPath } from '../../lib/platform-fees/groups.ts';
import { validateDirectory } from '../../lib/platform-fees/model.ts';
import { resolveDatabaseUrl } from '../stack127/tool-pages/lib.mjs';


const { values } = parseArgs({ options: {
  environment: { type: 'string', default: 'development' },
  out: { type: 'string' },
} });
if (!values.out || !['development', 'production'].includes(values.environment)) {
  throw new Error('Use --out <new manifest file> --environment development|production');
}
const data = JSON.parse(await readFile(new URL('./data/directory.json', import.meta.url), 'utf8'));
validateDirectory(data);
const client = new pg.Client({ connectionString: resolveDatabaseUrl({ environment: 'development' }), connectionTimeoutMillis: 15000 });
await client.connect();
try {
  const route = 'app/(site)/(directories)/platform-fees';
  const records = (group, sections, entries) => ({ kind: 'database', checks: [{
    name: 'Reviewed platform fee records loaded', sql_file: 'scripts/platform-fees/records-ready.sql',
    params: [group, sections, entries],
  }] });
  const available = new Set((await client.query(`select page.slug from public.stack127_pages page
    join public.stack127_directory_pages content on content.page_id=page.id
    where page.slug='platform-fees' or page.slug like 'platform-fees/%'`)).rows.map(row=>row.slug));
  for (const slug of ['platform-fees',...feeGroups.map(group=>groupPath(group.name).slice(1))]) {
    if (!available.has(slug)) throw new Error(`Copy is missing for ${slug}. Run the development fee sync first, then review its database copy.`);
  }
  const pages = [{
    slug: 'platform-fees', family: 'directory', source: 'development',
    registry: { is_published: true },
    requirements: { route: `${route}/page.tsx`, assets: ['lib/platform-fees/groups.ts'],
      records: records(null,data.sections.length,data.entries.length),
      smoke: [{path:'/platform-fees',text:'Apps and software'}],
    },
  }];
  for (const group of feeGroups) {
    const sections = data.sections.filter(section=>section.group_name===group.name);
    const sectionIds = new Set(sections.map(section=>section.id));
    const entries = data.entries.filter(entry=>sectionIds.has(entry.section_id));
    pages.push({
      slug: groupPath(group.name).slice(1), family:'directory', source:'development',
      registry: { is_published:true },
      requirements: {route:`${route}/[section]/page.tsx`,assets:['lib/platform-fees/groups.ts'],
        records:records(group.name,sections.length,entries.length),
        smoke:[{path:groupPath(group.name),text:sections[0].name}],
      },
    });
  }
  const currentSlugs = new Set(pages.map(page => page.slug));
  const target = values.environment === 'development' ? client : new pg.Client({
    connectionString: resolveDatabaseUrl({ environment: values.environment }),
    options: '-c default_transaction_read_only=on', connectionTimeoutMillis: 15000,
  });
  let retired;
  try {
    if (target !== client) await target.connect();
    retired = await target.query("select slug from public.stack127_pages where slug like 'platform-fees/%' and is_published order by slug");
  } finally { if (target !== client) await target.end(); }
  for (const { slug } of retired.rows) {
    if (currentSlugs.has(slug)) continue;
    pages.push({ slug, family: 'directory', registry: { is_published: false },
      requirements: { route: `${route}/[section]/page.tsx`,
        records: records(null, data.sections.length, data.entries.length), smoke: [] },
    });
  }
  const out = path.resolve(values.out);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify({ schema_version: 1, kind: 'directories', pages }, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ environment: values.environment, manifest: values.out,
    published: pages.filter(page => page.registry.is_published).length,
    retired: pages.filter(page => !page.registry.is_published).length,
    sections: data.sections.length, listings: data.entries.length }));
} finally { await client.end(); }
