import { readFile, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import pg from 'pg';
import { resolveDatabaseUrl } from '../tool-pages/lib.mjs';
import { CONTENT_FIELDS, REGISTRY_FIELDS, desiredStates, validateState, validateTouch } from './model.mjs';
import { executeBatch, readStates } from './database.mjs';
import { checkDatabaseRequirements, checkRepositoryRequirements, freezeRequirements, onlyKeys } from './readiness.mjs';
import { checkLiveRelease, verifyPublicPages } from './verify.mjs';

const commands = ['prepare', 'preview', 'apply', 'verify', 'restore', 'dispatch'];
export function publishingArgs(argv) {
  const [command, ...tokens] = argv;
  if (!commands.includes(command)) throw new Error(`Use ${commands.join(', ')}. See stack127_docs/page-publishing.md.`);
  const allowed = { prepare: ['manifest', 'out', 'environment'], preview: ['plan', 'environment'], apply: ['plan', 'environment', 'confirm', 'release-sha', 'site', 'wait-seconds'], verify: ['plan', 'environment', 'release-sha', 'site', 'wait-seconds', 'restored'], restore: ['plan', 'environment', 'confirm', 'release-sha', 'site', 'wait-seconds'], dispatch: ['plan', 'environment', 'confirm', 'release-sha'] }[command];
  const args = { command };
  for (let index = 0; index < tokens.length; index++) {
    const key = tokens[index].replace(/^--/, '');
    if (!tokens[index].startsWith('--') || !allowed.includes(key) || args[key] !== undefined) throw new Error(`Unsupported or repeated argument: ${tokens[index]}`);
    if (key === 'restored') { args[key] = true; continue; }
    const value = tokens[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing --${key}`);
    args[key] = value;
  }
  args.environment ??= 'development';
  if (!['development', 'production'].includes(args.environment)) throw new Error('Environment must be development or production');
  for (const required of command === 'prepare' ? ['manifest', 'out'] : ['plan']) if (!args[required]) throw new Error(`Missing --${required}`);
  if (args['wait-seconds'] !== undefined && (!/^\d+$/.test(args['wait-seconds']) || Number(args['wait-seconds']) > 900)) throw new Error('--wait-seconds must be between 0 and 900');
  if (command === 'dispatch' && args.environment !== 'production') throw new Error('Dispatch is only for production');
  if (args.environment === 'production' && ['apply', 'restore', 'dispatch'].includes(command) && args.confirm !== 'stack127-production') throw new Error('Production writes require --confirm stack127-production');
  if (args.environment === 'production' && ['apply', 'verify', 'restore', 'dispatch'].includes(command) && !/^[a-f0-9]{40}$/.test(args['release-sha'] ?? '')) throw new Error('Production requires a full --release-sha');
  return args;
}

function git(...args) { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
function cleanCode(plan) {
  const files = plan?.pages.flatMap(page => [page.requirements.route, ...page.requirements.assets, ...(page.requirements.records?.files ?? []), ...[...page.requirements.checks, ...(page.requirements.records?.checks ?? [])].map(check => check.sql_file)]) ?? [];
  if (files.length) git('ls-files', '--error-unmatch', '--', ...files);
  if (git('status', '--porcelain', '--', 'app', 'lib', 'scripts', '.github', 'supabase', 'public', 'next.config.*', 'tsconfig.json', 'package.json', 'package-lock.json', ...files)) throw new Error('Commit the reviewed code and required assets before preparing or applying a production batch');
}
function familyKind(kind, family) {
  if (!(kind === 'tools' ? ['tool', 'catalog'] : ['directory']).includes(family)) throw new Error(`${kind} batch cannot contain ${family}`);
}
async function loadJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
export async function resolveCopy(content, base) {
  const result = {};
  for (const [key, value] of Object.entries(content ?? {})) {
    if (value && typeof value === 'object') {
      onlyKeys(value, ['$file'], `${key} reference`);
      if (typeof value.$file !== 'string' || !key.endsWith('_markdown') || path.isAbsolute(value.$file) || !/\.(md|markdown)$/i.test(value.$file)) throw new Error('Only relative Markdown files are accepted by $file');
      const directory = await realpath(base);
      const file = await realpath(path.resolve(directory, value.$file));
      if (!file.startsWith(directory + path.sep) || !(await stat(file)).isFile()) throw new Error('$file must stay inside the manifest directory');
      if (!/\.(md|markdown)$/i.test(file)) throw new Error('$file must resolve to a Markdown file');
      result[key] = (await readFile(file, 'utf8')).trim();
    } else result[key] = value;
  }
  return result;
}

async function readSnapshot(pool, refs, { dates = false } = {}) {
  const client = await pool.connect();
  try {
    await client.query('begin transaction isolation level repeatable read read only');
    const states = await readStates(client, refs);
    const publicDates = dates ? (await client.query('select slug,updated_at::text as updated_at from public.stack127_pages where slug=any($1::text[])',[refs.map(ref=>ref.slug)])).rows : [];
    await client.query('rollback');
    return dates ? {states,dates:new Map(publicDates.map(row=>[row.slug,row.updated_at]))} : states;
  } catch (error) { await client.query('rollback').catch(() => {}); throw error; }
  finally { client.release(); }
}

export async function preparePlan(pool, manifest, { kind, environment, base = process.cwd(), sourceCommit, developmentPool, root = process.cwd() } = {}) {
  onlyKeys(manifest, ['schema_version', 'kind', 'pages'], 'Manifest');
  if (manifest.schema_version !== 1 || manifest.kind !== kind || !Array.isArray(manifest.pages) || !manifest.pages.length) throw new Error('Manifest needs schema_version 1, the command kind, and selected pages');
  const seen = new Set();
  for (const page of manifest.pages) {
    onlyKeys(page, ['slug', 'family', 'source', 'registry', 'content', 'catalogs', 'requirements', 'touch_reason'], 'Selected page');
    familyKind(kind, page.family);
    if (page.touch_reason !== undefined) validateTouch({reason:page.touch_reason,expected_updated_at:null},page.family);
    if (page.source !== undefined && page.source !== 'development') throw new Error('The only supported page source is development');
    if (page.source && typeof page.registry?.is_published !== 'boolean') throw new Error('A development-sourced page needs an explicit registry.is_published');
    if (page.catalogs !== undefined && page.family !== 'tool') throw new Error('Only tools have catalog memberships');
    if (seen.has(page.slug)) throw new Error(`Duplicate selected page: ${page.slug}`);
    seen.add(page.slug);
    onlyKeys(page.registry ?? {}, REGISTRY_FIELDS, 'Registry patch');
    onlyKeys(page.content ?? {}, CONTENT_FIELDS[page.family], 'Content patch');
  }
  const refs = manifest.pages.map(({ slug, family }) => ({ slug, family }));
  const snapshot = await readSnapshot(pool, refs,{dates:manifest.pages.some(page=>page.touch_reason!==undefined)});
  const before = snapshot.states ?? snapshot;
  const developmentRefs = manifest.pages.filter(page => page.source).map(({ slug, family }) => ({ slug, family }));
  if (developmentRefs.length && environment !== 'development' && !developmentPool) throw new Error('A development source connection is required');
  const developmentStates = developmentRefs.length ? await readSnapshot(developmentPool ?? pool, developmentRefs) : [];
  const development = new Map(developmentRefs.map((ref, index) => [ref.slug, developmentStates[index]]));
  const pages = [];
  for (let index = 0; index < manifest.pages.length; index++) {
    const page = manifest.pages[index];
    const current = before[index];
    const source = page.source ? development.get(page.slug) : current;
    if (page.source && !source?.content) throw new Error(`Reviewed development page is missing: ${page.slug}`);
    const defaults = page.family === 'tool' ? { usage_markdown: null, tool_version: '1.0.0', stack127_repo_url: null, stack127_repo_version: null, stack127_repo_commit_sha: null } : page.family === 'directory' ? { content_markdown: null, card_icon_key: null, card_art_key: null } : { heading_before: '', heading_after: '', icon_key: 'layers', home_order: 100 };
    const after = validateState({ slug: page.slug, family: page.family, registry: { is_published: false, is_indexable: true, cover_image_url: null, page_type: page.family === 'tool' ? 'SoftwareApplication' : 'CollectionPage', sitemap_priority: 0.5, ...source?.registry, ...page.registry }, content: { ...defaults, ...source?.content, ...await resolveCopy(page.content, base) }, ...(page.family === 'tool' ? { catalogs: page.catalogs ?? source?.catalogs ?? [] } : {}) });
    const requirements = await freezeRequirements(page.requirements, after, root);
    pages.push({ slug: page.slug, family: page.family, before: current, after, requirements,
      ...(page.touch_reason !== undefined ? {touch:{reason:page.touch_reason,expected_updated_at:snapshot.dates.get(page.slug) ?? null}} : {}) });
  }
  await checkDatabaseRequirements(pool, pages);
  return { schema_version: 1, kind, environment, source_commit: sourceCommit, pages };
}

export function validatePlan(plan, kind, environment) {
  onlyKeys(plan, ['schema_version', 'kind', 'environment', 'source_commit', 'pages'], 'Plan');
  if (plan.schema_version !== 1 || plan.kind !== kind || plan.environment !== environment || !/^[a-f0-9]{40}$/.test(plan.source_commit ?? '') || !Array.isArray(plan.pages) || !plan.pages.length) throw new Error('Plan version, kind, environment, or source commit is invalid');
  const slugs = new Set();
  for (const page of plan.pages) {
    onlyKeys(page, ['slug', 'family', 'before', 'after', 'requirements', 'touch'], 'Frozen page');
    familyKind(kind, page.family);
    validateTouch(page.touch,page.family);
    if (slugs.has(page.slug)) throw new Error(`Duplicate selected page: ${page.slug}`);
    slugs.add(page.slug);
    page.after = validateState(page.after);
    if (page.after.slug !== page.slug || page.after.family !== page.family || page.after.content === null) throw new Error('Desired page identity or content is invalid');
    if (page.before !== null) {
      page.before = validateState(page.before);
      if (page.before.slug !== page.slug || page.before.family !== page.family) throw new Error('Before state identity is invalid');
    }
  }
  return plan;
}

export function productionCodeGate(plan, releaseSha) {
  cleanCode(plan);
  if (git('rev-parse', 'HEAD') !== releaseSha) throw new Error('The executing checkout must be the exact release SHA');
  const mainSha = git('ls-remote', 'origin', 'refs/heads/main').split(/\s/)[0];
  if (mainSha !== releaseSha) throw new Error('Release SHA must be the current origin/main commit');
  git('merge-base', '--is-ancestor', plan.source_commit, releaseSha);
}

async function verifyDatabase(pool, plan, restore) {
  const client = await pool.connect();
  try {
    await client.query('begin transaction isolation level repeatable read read only');
    const current = await readStates(client, plan.pages.map(({ slug, family }) => ({ slug, family })));
    const targets = desiredStates(plan.pages, { restore });
    for (let index = 0; index < plan.pages.length; index++) {
      const page = plan.pages[index];
      const wanted = targets[index];
      if (JSON.stringify(current[index]) !== JSON.stringify(validateState(wanted))) throw new Error(`Database verification failed: ${page.slug}`);
    }
    await client.query('rollback');
  } catch (error) { await client.query('rollback').catch(() => {}); throw error; }
  finally { client.release(); }
}

export async function verifyPublication(pool, plan, { restore = false, site, canonicalOrigin, waitSeconds = 180,
  releaseSha, afterCommit, fetchImplementation = fetch } = {}) {
  await verifyDatabase(pool, plan, restore);
  // A static export must include the committed rows before public checks start.
  if (afterCommit) await afterCommit({ pool, plan, restore, releaseSha, site });
  return await verifyPublicPages(pool, plan.pages, { site, canonicalOrigin, restore, waitSeconds, fetchImplementation });
}

export async function publishingMain(kind, argv = process.argv.slice(2), { afterCommit } = {}) {
  if (afterCommit !== undefined && typeof afterCommit !== 'function') throw new Error('afterCommit must be a function');
  const args = publishingArgs(argv);
  const site = (args.site ?? (args.environment === 'production' ? 'https://stack127.com' : 'http://127.0.0.1:3333')).replace(/\/$/, '');
  const siteUrl = new URL(site);
  if (!['http:', 'https:'].includes(siteUrl.protocol) || siteUrl.username || siteUrl.password || siteUrl.pathname !== '/' || siteUrl.search || siteUrl.hash) throw new Error('--site must be an HTTP site origin');
  if (args.environment === 'production' && site !== 'https://stack127.com') throw new Error('Production publishing uses https://stack127.com');
  const localEnvironment = args.environment === 'development' ? await readFile('.env.local', 'utf8').catch(error => { if (error.code === 'ENOENT') return ''; throw error; }) : '';
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? localEnvironment.match(/^\s*NEXT_PUBLIC_SITE_URL\s*=\s*(.*?)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, '') ?? 'https://stack127.com';
  const canonicalOrigin = args.environment === 'production' ? 'https://stack127.com' : new URL(configuredOrigin).origin;
  const pool = new pg.Pool({ connectionString: resolveDatabaseUrl({ environment: args.environment, ...(['apply', 'restore'].includes(args.command) ? { apply: true, confirm: args.confirm } : {}) }), max: 1, connectionTimeoutMillis: 15000, query_timeout: 60000 });
  let applied = false;
  try {
    if (args.command === 'prepare') {
      if (args.environment === 'production') cleanCode();
      const manifest = await loadJson(args.manifest);
      let developmentPool;
      let plan;
      try {
        if (args.environment === 'production' && manifest.pages?.some(page => page.source === 'development')) developmentPool = new pg.Pool({ connectionString: resolveDatabaseUrl({ environment: 'development' }), max: 1, connectionTimeoutMillis: 15000, query_timeout: 60000 });
        plan = await preparePlan(pool, manifest, { kind, environment: args.environment, base: path.dirname(path.resolve(args.manifest)), sourceCommit: git('rev-parse', 'HEAD'), developmentPool });
      } finally { if (developmentPool) await developmentPool.end(); }
      await writeFile(args.out, JSON.stringify(plan, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
      console.log(JSON.stringify({ prepared: true, environment: args.environment, plan: args.out, pages: plan.pages.map(page => page.slug) }));
      return;
    }
    const plan = validatePlan(await loadJson(args.plan), kind, args.environment);
    const restore = args.command === 'restore' || Boolean(args.restored);
    const targets = desiredStates(plan.pages, { restore });
    for (const [index, page] of plan.pages.entries()) await checkRepositoryRequirements(page.requirements, targets[index]);
    if (!restore) await checkDatabaseRequirements(pool, plan.pages);
    if (args.command === 'dispatch') {
      productionCodeGate(plan, args['release-sha']);
      const payload = { ref: args['release-sha'], task: 'page-publication', environment: 'stack127-page-publication', auto_merge: false, required_contexts: [], production_environment: true, payload: { release_sha: args['release-sha'], plan } };
      const response = JSON.parse(execFileSync('gh', ['api', 'repos/stack127labs/stack127/deployments', '--method', 'POST', '--input', '-'], { input: JSON.stringify(payload), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }));
      if (!response.id || response.sha !== args['release-sha']) throw new Error('GitHub did not accept the expected publication deployment');
      console.log(JSON.stringify({ dispatched: true, deployment_id: response.id, url: `https://github.com/stack127labs/stack127/deployments`, complete: false }));
      return;
    }
    if (args.environment === 'production' && args.command !== 'preview') {
      productionCodeGate(plan, args['release-sha']);
      await checkLiveRelease(site, args['release-sha'], { waitSeconds: Number(args['wait-seconds'] ?? 600) });
      productionCodeGate(plan, args['release-sha']);
    }
    if (!restore && args.environment === 'production') await checkDatabaseRequirements(pool, plan.pages);
    if (['apply', 'restore', 'preview'].includes(args.command)) {
      const result = await executeBatch(pool, plan.pages.map(({ slug, family, before, after, touch }) => ({ slug, family, before, after, ...(touch ? {touch} : {}) })), { apply: args.command !== 'preview', restore });
      console.log(JSON.stringify(result));
      if (args.command === 'preview') return;
      applied = true;
    }
    const verification = await verifyPublication(pool, plan, { site, canonicalOrigin, restore,
      waitSeconds: Number(args['wait-seconds'] ?? 180), releaseSha: args['release-sha'],
      afterCommit: applied ? afterCommit : undefined });
    if (args.environment === 'production') await checkLiveRelease(site, args['release-sha']);
    console.log(JSON.stringify({ ...verification, complete: true, restored: restore }));
  } catch (error) {
    if (applied) console.error('The database batch committed. Public verification did not complete; retry verify with the same plan.');
    throw error;
  } finally { await pool.end(); }
}
