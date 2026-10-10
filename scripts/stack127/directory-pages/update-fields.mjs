import { parseArgs, requireArg, runMutation, printResult } from '../tool-pages/lib.mjs';
import { validateCardKey } from '../card-keys.mjs';

const args = parseArgs();
const allowed = new Set(['slug', 'environment', 'apply', 'confirm', 'title', 'meta-title', 'meta-description', 'card-name', 'card-description', 'card-icon-key', 'card-art-key']);
for (const key of Object.keys(args)) {
  if (!allowed.has(key)) throw new Error(`Unsupported argument: --${key}. Edit page words in MDX.`);
}
const slug = requireArg(args, 'slug');
const fields = {};
const seo = {};
for (const flag of ['meta-title','meta-description']) {
  if (args[flag] !== undefined) seo[flag.replaceAll('-', '_')] = requireArg(args,flag).trim();
}
if (args.title !== undefined) fields.title = requireArg(args, 'title').trim();
for (const field of ['card-name', 'card-description']) {
  if (args[field] !== undefined) fields[field.replace('-', '_')] = requireArg(args, field).trim();
}
for (const flag of ['card-icon-key', 'card-art-key']) {
  if (args[flag] !== undefined) {
    const field = flag.replaceAll('-', '_');
    fields[field] = validateCardKey(field, requireArg(args, flag).trim());
  }
}
if ((!Object.keys(fields).length && !Object.keys(seo).length) || [...Object.values(fields),...Object.values(seo)].some(value => value === '')) throw new Error('Provide nonempty title, search metadata, or card fields to update');

printResult(await runMutation(args, async client => {
  const current = (await client.query(`select content.page_id,content.title,content.card_name,content.card_description,
    content.card_icon_key,content.card_art_key,page.meta_title,page.meta_description from public.stack127_directory_pages content
    join public.stack127_pages page on page.id=content.page_id
    where page.slug=$1 and page.page_family='directory' for update of page,content`, [slug])).rows[0];
  if (!current) throw new Error(`Directory page not found: ${slug}`);
  const copyChanged = Object.entries(fields).some(([key, value]) => current[key] !== value);
  if (copyChanged) await client.query(`update public.stack127_directory_pages set
    ${Object.keys(fields).map((key,index) => `${key}=$${index+2}`).join(',')}
    where page_id=$1`, [current.page_id, ...Object.values(fields)]);
  const seoChanged = Object.entries(seo).some(([key,value]) => current[key] !== value);
  if (seoChanged) {
    await client.query(`update public.stack127_pages set
      ${Object.keys(seo).map((key,index) => `${key}=$${index+2}`).join(',')} where id=$1`,
      [current.page_id,...Object.values(seo)]);
    await client.query('select public.stack127_touch_page($1,$2)',[slug,'directory_seo']);
  }
  return { slug, changed: copyChanged || seoChanged, fields: [...Object.keys(fields),...Object.keys(seo)] };
}));
