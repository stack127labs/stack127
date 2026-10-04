import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { validateToolMarkdown } from '../tool-pages/validate-markdown.mjs';

const object = value => value && typeof value === 'object' && !Array.isArray(value);
export function onlyKeys(value, keys, label) {
  if (!object(value)) throw new Error(`${label} must be an object`);
  for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`${label}: unsupported field ${key}`);
}

export async function repositoryFile(relative, root = process.cwd()) {
  if (typeof relative !== 'string' || path.isAbsolute(relative)) throw new Error('Requirements must use repository-relative paths');
  const resolved = await realpath(path.resolve(root, relative));
  const repository = await realpath(root);
  if (!resolved.startsWith(repository + path.sep) || !(await stat(resolved)).isFile()) {
    throw new Error(`Requirement is not a repository file: ${relative}`);
  }
  return resolved;
}

export function routeMatches(file, slug) {
  const parts = file.split('/').slice(2, -1).filter(part => !part.startsWith('('));
  const pattern = parts.map(part => {
    if (/^\[\[\.\.\.[^\]]+\]\]$/.test(part)) return '(?:[^/]+(?:/[^/]+)*)?';
    if (/^\[\.\.\.[^\]]+\]$/.test(part)) return '[^/]+(?:/[^/]+)*';
    if (/^\[[^\]]+\]$/.test(part)) return '[^/]+';
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }).join('/');
  return new RegExp(`^${pattern}$`).test(slug);
}

export function readinessSql(sql) {
  const trimmed = sql.trim().replace(/;\s*$/, '');
  if (!/^(select|with)\b/i.test(trimmed) || trimmed.includes(';')) throw new Error('Readiness SQL must be one SELECT query');
  return trimmed;
}

async function freezeChecks(checks = [], root) {
  if (!Array.isArray(checks)) throw new Error('Readiness checks must be an array');
  return Promise.all(checks.map(async check => {
    onlyKeys(check, ['name', 'sql_file', 'params'], 'Readiness check');
    if (typeof check.name !== 'string' || !check.name.trim()) throw new Error('Readiness checks need a name');
    const sql = readinessSql(await readFile(await repositoryFile(check.sql_file, root), 'utf8'));
    if (check.params !== undefined && !Array.isArray(check.params)) throw new Error('Readiness params must be an array');
    return { name: check.name, sql_file: check.sql_file, sql, params: check.params ?? [] };
  }));
}

export async function freezeRequirements(requirements, state, root = process.cwd()) {
  onlyKeys(requirements, ['route', 'assets', 'checks', 'records', 'smoke'], `${state.slug} requirements`);
  const frozen = { route: requirements.route, assets: requirements.assets ?? [], checks: await freezeChecks(requirements.checks, root), smoke: requirements.smoke ?? [] };
  if (state.family === 'directory') {
    onlyKeys(requirements.records, ['kind', 'files', 'checks'], `${state.slug} records`);
    if (requirements.records.kind === 'code') {
      if (!Array.isArray(requirements.records.files) || !requirements.records.files.length || requirements.records.checks !== undefined) throw new Error('Code records require files only');
      frozen.records = { kind: 'code', files: requirements.records.files };
    } else if (requirements.records.kind === 'database') {
      if (!Array.isArray(requirements.records.checks) || !requirements.records.checks.length || requirements.records.files !== undefined) throw new Error('Database records require readiness checks only');
      frozen.records = { kind: 'database', checks: await freezeChecks(requirements.records.checks, root) };
    } else throw new Error('Directory records must declare kind code or database');
  } else if (requirements.records !== undefined) throw new Error('Only directories declare record sources');
  await checkRepositoryRequirements(frozen, state, root);
  return frozen;
}

export async function checkRepositoryRequirements(requirements, state, root = process.cwd()) {
  onlyKeys(requirements, ['route', 'assets', 'checks', 'records', 'smoke'], 'Frozen requirements');
  const group = { tool: '(tools)', catalog: '(catalogs)', directory: '(directories)' }[state.family];
  if (typeof requirements.route !== 'string' || !requirements.route.startsWith(`app/(site)/${group}/`) || !requirements.route.endsWith('/page.tsx') || !routeMatches(requirements.route, state.slug)) {
    throw new Error(`Route does not match ${state.family} /${state.slug}`);
  }
  await repositoryFile(requirements.route, root);
  const layout = path.posix.join(path.posix.dirname(requirements.route), 'layout.tsx');
  if (!(await readFile(await repositoryFile(layout, root), 'utf8')).includes('registryLayout')) throw new Error(`Route needs a registry layout: ${state.slug}`);
  if (!Array.isArray(requirements.assets) || !Array.isArray(requirements.checks) || !Array.isArray(requirements.smoke)) throw new Error('Frozen requirements need assets, checks, and smoke arrays');
  for (const asset of requirements.assets) await repositoryFile(asset, root);
  for (const check of [...requirements.checks, ...(requirements.records?.checks ?? [])]) {
    onlyKeys(check, ['name', 'sql_file', 'sql', 'params'], 'Frozen readiness check');
    if (typeof check.name !== 'string' || !check.name.trim() || !Array.isArray(check.params)) throw new Error('Invalid frozen readiness check');
    if (readinessSql(await readFile(await repositoryFile(check.sql_file, root), 'utf8')) !== check.sql) throw new Error(`Readiness query changed: ${check.name}`);
  }
  if (state.family === 'directory') {
    onlyKeys(requirements.records, ['kind', 'files', 'checks'], 'Frozen records');
    if (requirements.records.kind === 'code' && Array.isArray(requirements.records.files) && requirements.records.files.length) {
      for (const file of requirements.records.files) await repositoryFile(file, root);
    } else if (requirements.records.kind !== 'database' || !Array.isArray(requirements.records.checks) || !requirements.records.checks.length) throw new Error('Directory record requirements are incomplete');
  }
  for (const smoke of requirements.smoke) {
    onlyKeys(smoke, ['path', 'text'], 'Smoke check');
    if (typeof smoke.path !== 'string' || !smoke.path.startsWith(`/${state.slug}`) || smoke.path.startsWith('//') || /[\r\n#]/.test(smoke.path) || typeof smoke.text !== 'string' || !smoke.text.trim()) throw new Error(`Invalid smoke check for ${state.slug}`);
    const pathname = new URL(smoke.path, 'https://stack127.com').pathname;
    if (pathname !== `/${state.slug}` && !pathname.startsWith(`/${state.slug}/`)) throw new Error('Smoke checks must belong to the selected page');
  }
  if (state.content) {
    const markdown = Object.fromEntries(Object.entries(state.content).filter(([key, value]) => key.endsWith('_markdown') && typeof value === 'string'));
    validateToolMarkdown(markdown, { repositoryRoot: root });
    if (state.family !== 'directory') {
      const icons = await readFile(path.join(root, 'lib/tool-catalog-icons.ts'), 'utf8');
      const arts = await readFile(path.join(root, 'lib/tool-catalog-art.ts'), 'utf8');
      const keys = (source, name) => new Set([...source.split(`const ${name}:`)[1].split('};')[0].matchAll(/^\s*(?:"([a-z0-9-]+)"|([a-z0-9]+))\s*:/gm)].map(match => match[1] ?? match[2]));
      const iconKeys = keys(icons, 'icons');
      const artKeys = keys(arts, 'art');
      const icon = state.family === 'tool' ? state.content.card_icon_key : state.content.icon_key;
      const art = state.family === 'tool' ? [state.content.card_art_key] : [state.content.hero_art_key, state.content.home_art_key];
      if (!iconKeys.has(icon) || art.some(key => !artKeys.has(key))) throw new Error(`Unregistered icon or card art for ${state.slug}`);
    }
  }
}

export async function checkDatabaseRequirements(pool, pages) {
  const client = await pool.connect();
  try {
    await client.query('begin transaction isolation level repeatable read read only');
    await client.query("set local statement_timeout = '15s'");
    for (const page of pages) {
      for (const check of [...page.requirements.checks, ...(page.requirements.records?.checks ?? [])]) {
        const result = await client.query(`select * from (${readinessSql(check.sql)}) as publication_readiness`, check.params);
        if (result.rows.length !== 1 || result.rows[0].ready !== true) throw new Error(`Readiness failed for ${page.slug}: ${check.name}`);
      }
    }
    await client.query('rollback');
  } catch (error) {
    await client.query('rollback').catch(() => {});
    throw error;
  } finally { client.release(); }
}
