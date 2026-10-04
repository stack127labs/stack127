import { parseArgs, requireArg, readRequiredText, runMutation, printResult } from '../tool-pages/lib.mjs';
import { validateCardKey } from '../card-keys.mjs';

const args = parseArgs();
const slug = requireArg(args, 'slug');
const fields = {};
if (args.title !== undefined) fields.title = requireArg(args, 'title').trim();
if (args['intro-file']) fields.intro_markdown = readRequiredText(args['intro-file'], 'Intro');
if (args['content-file']) fields.content_markdown = readRequiredText(args['content-file'], 'Content');
if (args['clear-content']) fields.content_markdown = null;
if (args['content-file'] && args['clear-content']) throw new Error('Choose --content-file or --clear-content');
for (const field of ['card-name', 'card-description']) {
  if (args[field] !== undefined) fields[field.replace('-', '_')] = requireArg(args, field).trim();
}
for (const flag of ['card-icon-key', 'card-art-key']) {
  if (args[flag] !== undefined) {
    const field = flag.replaceAll('-', '_');
    fields[field] = validateCardKey(field, requireArg(args, flag).trim());
  }
}
if (!Object.keys(fields).length || Object.values(fields).some(value => value === '')) throw new Error('Provide nonempty page copy to update');

printResult(await runMutation(args, async client => {
  const current = (await client.query(`select content.* from public.stack127_directory_pages content
    join public.stack127_pages page on page.id=content.page_id
    where page.slug=$1 and page.page_family='directory' for update of page,content`, [slug])).rows[0];
  if (!current) throw new Error(`Directory page not found: ${slug}`);
  const changed = Object.entries(fields).some(([key, value]) => current[key] !== value);
  if (changed) await client.query(`update public.stack127_directory_pages set
    ${Object.keys(fields).map((key,index) => `${key}=$${index+2}`).join(',')}
    where page_id=$1`, [current.page_id, ...Object.values(fields)]);
  return { slug, changed, fields: Object.keys(fields) };
}));
