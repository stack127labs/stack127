#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { parseArgs } from './lib/args.mjs';
import { databaseOptions } from './lib/environment.mjs';
import { withClient } from './lib/db.mjs';
import { derivedPatch, storedFacts, starRecipientCtes, starRecipientColumn } from './lib/popularity.mjs';
import { changedPatch, writePatches } from './lib/app-refresh.mjs';

export function validateArgs(args) {
  for (const flag of ['all', 'apply', 'dry-run']) {
    if (args[flag] !== undefined && args[flag] !== true) throw new Error(`--${flag} is a flag`);
  }
  if (args.slug !== undefined && (typeof args.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(args.slug))) throw new Error('--slug needs an app slug');
  if (Boolean(args.slug) === Boolean(args.all)) throw new Error('Choose --slug <slug> or --all');
  if (args.apply && args['dry-run']) throw new Error('Use --dry-run or --apply, not both');
}

export async function refreshPopularity(client, args, checkedAt = new Date().toISOString()) {
  validateArgs(args);
  const apply = args.apply === true;
  await client.query(apply ? 'begin' : 'begin read only');
  try {
    const { rows } = await client.query(`with ${starRecipientCtes} select app.*, ${starRecipientColumn}, project.stars as project_stars,
        project.latest_release as project_release, project.latest_release_at as project_release_at
      from public.self_host_apps app
      left join public.github_projects project on project.id = app.github_project_id
      where app.published = true and ($1::text is null or app.slug = $1)
      order by app.slug ${apply ? 'for update of app' : ''}`, [args.slug ?? null]);
    if (args.slug && rows.length === 0) throw new Error(`Published app not found: ${args.slug}`);
    const patches = rows.flatMap(row => {
      const patch = changedPatch(row, derivedPatch(row, storedFacts(row), checkedAt));
      return Object.keys(patch).length ? [{ row, patch }] : [];
    });
    const written = apply ? await writePatches(client, patches) : 0;
    const report = { mode: apply ? 'apply' : 'preview', selected: rows.length, changed: patches.length, written,
      changes: patches.map(({ row, patch }) => ({ slug: row.slug,
        old: Object.fromEntries(Object.keys(patch).map(key => [key, row[key] ?? null])), new: patch })) };
    await client.query('commit');
    return report;
  } catch (error) {
    await client.query('rollback');
    throw error;
  }
}

async function main() {
  const args = parseArgs();
  validateArgs(args);
  const database = databaseOptions(args);
  console.log(JSON.stringify(await withClient(client => refreshPopularity(client, args), database), null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
