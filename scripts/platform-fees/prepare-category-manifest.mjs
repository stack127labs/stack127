// Prepare publication input only. The publisher previews and applies it.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import path from 'node:path';
import pg from 'pg';
import { feeGroups, groupPath } from '../../lib/platform-fees/groups.ts';
import { validateDirectory } from '../../lib/platform-fees/model.ts';
import { resolveDatabaseUrl } from '../stack127/tool-pages/lib.mjs';
import { platformFeeOverviewCopy, platformFeeSectionCopy } from '../stack127/directory-pages/lib.mjs';

const { values } = parseArgs({ options: {
  environment: { type: 'string', default: 'development' },
  out: { type: 'string' },
} });
if (!values.out || !['development', 'production'].includes(values.environment)) {
  throw new Error('Use --out <new manifest file> --environment development|production');
}
const data = JSON.parse(await readFile(new URL('./data/directory.json', import.meta.url), 'utf8'));
validateDirectory(data);
const client = new pg.Client({ connectionString: resolveDatabaseUrl({ environment: values.environment }), connectionTimeoutMillis: 15000 });
await client.connect();
try {
  const route = 'app/(site)/(directories)/platform-fees';
  const records = (group, sections, entries) => ({ kind: 'database', checks: [{
    name: 'Reviewed platform fee records loaded', sql_file: 'scripts/platform-fees/records-ready.sql',
    params: [group, sections, entries],
  }] });
  const overview = platformFeeOverviewCopy();
  const pages = [{
    slug: overview.slug, family: 'directory',
    registry: { is_published: true, meta_title: overview.meta_title, meta_description: overview.meta_description },
    content: { title: overview.title, intro_markdown: overview.intro_markdown, content_markdown: overview.content_markdown,
      card_description: overview.card_description },
    requirements: { route: `${route}/page.tsx`, assets: ['lib/platform-fees/groups.ts'],
      records: records(null, data.sections.length, data.entries.length),
      smoke: [{ path: '/platform-fees', text: 'Apps and software' }],
    },
  }];
  for (const group of feeGroups) {
    const sections = data.sections.filter(section => section.group_name === group.name);
    const sectionIds = new Set(sections.map(section => section.id));
    const entries = data.entries.filter(entry => sectionIds.has(entry.section_id));
    const copy = platformFeeSectionCopy(group, groupPath(group.name).slice(1));
    pages.push({
      slug: copy.slug, family: 'directory',
      registry: { label: group.name, meta_title: group.meta_title, meta_description: group.meta_description,
        is_published: true, page_type: 'CollectionPage', sitemap_priority: 0.6 },
      content: { title: copy.title, intro_markdown: copy.intro_markdown, content_markdown: copy.content_markdown,
        card_name: copy.card_name, card_description: copy.card_description, card_icon_key: null, card_art_key: null },
      requirements: { route: `${route}/[section]/page.tsx`, assets: ['lib/platform-fees/groups.ts'],
        records: records(group.name, sections.length, entries.length),
        smoke: [{ path: groupPath(group.name), text: sections[0].name }],
      },
    });
  }
  const currentSlugs = new Set(pages.map(page => page.slug));
  const retired = await client.query("select slug from public.stack127_pages where slug like 'platform-fees/%' and is_published order by slug");
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
