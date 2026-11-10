// Insert missing drafts only. Copy and publication belong to the directory publisher.
import { existsSync } from 'node:fs';
import { parseArgs, requireArg, runMutation, printResult } from '../tool-pages/lib.mjs';
import { readCategories } from './categories.mjs';
import { MIN_CATEGORY_APPS } from '../../../lib/app-category-model.ts';
const args = parseArgs();
for (const key of Object.keys(args)) if (!['directory','environment','apply'].includes(key)) throw new Error(`Unsupported --${key}`);
if (args.environment && args.environment !== 'development') throw new Error('Draft sync writes development only; use the publisher for production.');
const directory = requireArg(args, 'directory');
printResult(await runMutation(args, async client => {
  const categories = await readCategories(client, directory);
  const rows = [];
  for (const category of categories) {
    if (category.count < MIN_CATEGORY_APPS) continue;
    const slug = `${directory}/categories/${category.slug}`;
    const title = `${category.name} ${directory === 'cli-apps' ? 'CLI apps' : 'self-host apps'}`;
    await client.query(`insert into public.stack127_pages(slug,page_family,label,meta_title,meta_description,is_published,is_indexable,page_type)
      values($1,'directory',$2,$2,$3,false,false,'CollectionPage') on conflict(slug) do nothing`,
    [slug, title, `Apps in the ${category.name} category of the ${directory} directory.`]);
    const page = (await client.query('select id,page_family,is_published,is_indexable from public.stack127_pages where slug=$1', [slug])).rows[0];
    if (page.page_family !== 'directory') throw new Error(`Wrong page family: ${slug}`);
    await client.query(`insert into public.stack127_directory_pages(page_id,title,card_name,card_description)
      values($1,$2,$3,$4) on conflict(page_id) do nothing`, [page.id, `<mark>${category.name}</mark> ${directory === 'cli-apps' ? 'CLI apps' : 'self-host apps'}`, category.name, `Apps in the ${category.name} category.`]);
    rows.push({ slug, published: page.is_published, indexable: page.is_indexable, count: category.count });
  }
  return { directory, categories, rows, missing_intros: categories.filter(category => !existsSync(`app/(site)/(directories)/${directory}/categories/[category]/content/${category.slug}/intro.mdx`)).map(category => category.slug) };
}));
