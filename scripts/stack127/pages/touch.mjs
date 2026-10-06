#!/usr/bin/env node
import { parseArgs, requireArg, runMutation, printResult } from '../tool-pages/lib.mjs';
import { validateRef } from '../publishing/model.mjs';

const args = parseArgs();
if ((args.environment ?? 'development') !== 'development') throw new Error('Use a reviewed publisher batch for production page dates');
const slug = validateRef({slug: requireArg(args,'slug'),family:'directory'}).slug;
const reason = requireArg(args,'reason').trim();
if (!reason) throw new Error('A page change reason is required');
printResult(await runMutation(args, async client => {
  const before = (await client.query("select published_at,updated_at::text from public.stack127_pages where slug=$1 and page_family='directory' for update",[slug])).rows[0];
  if (!before) throw new Error(`Page not found: ${slug}`);
  await client.query('select public.stack127_touch_page($1,$2)',[slug,reason]);
  const after = (await client.query('select published_at,updated_at::text from public.stack127_pages where slug=$1',[slug])).rows[0];
  return {slug,reason,before,after};
}));
