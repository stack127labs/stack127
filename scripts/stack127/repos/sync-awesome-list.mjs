#!/usr/bin/env node
// Fresh clones make retries safe after interruption, including a failed push.
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lstatSync, readdirSync, readFileSync, writeFileSync, mkdirSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const remote = 'https://github.com/stack127labs/awesome-self-hosted-apps.git';
const fixed = ['README.md', 'LICENSE', 'data/apps.csv', 'data/apps.json'];
const categoryName = /^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/;

// Check every ancestor, including the leaf. Never traverse a symlink.
export function safePath(target) {
  const absolute = path.resolve(target);
  let current = path.parse(absolute).root;
  for (const part of absolute.slice(current.length).split(path.sep)) {
    current = path.join(current, part);
    if (lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${current}`);
  }
  return absolute;
}
function regular(root, name) {
  const target = safePath(path.join(root, name));
  const stat = lstatSync(target, { throwIfNoEntry: false });
  if (!stat?.isFile() || !stat.size) throw new Error(`Missing or empty generated file: ${name}`);
  return target;
}
export function inspectExport(root) {
  safePath(root);
  for (const name of fixed) regular(root, name);
  const readme = readFileSync(path.join(root, 'README.md'), 'utf8');
  if (!readme.startsWith('# Awesome self-hosted apps\n')) throw new Error('README is not an awesome-list export');
  const categories = [...readme.matchAll(/\]\(categories\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md\)/g)].map(match => `${match[1]}.md`);
  if (!categories.length || new Set(categories).size !== categories.length) throw new Error('README has missing or duplicate categories');
  const categoryDir = safePath(path.join(root, 'categories'));
  for (const name of categories) regular(root, `categories/${name}`);
  const files = readdirSync(categoryDir).filter(name => categoryName.test(name));
  if (files.length !== categories.length) throw new Error('Category files do not match README');
  const data = JSON.parse(readFileSync(path.join(root, 'data/apps.json'), 'utf8'));
  if (!Array.isArray(data.apps) || !data.apps.length) throw new Error('JSON has no apps');
  const slugs = new Set();
  const known = new Set(categories.map(name => name.slice(0, -3)));
  for (const app of data.apps) {
    if (!app.slug || slugs.has(app.slug) || !Array.isArray(app.categories) || !app.categories.length || app.categories.some(slug => !known.has(slug))) throw new Error('JSON has duplicate apps or invalid categories');
    slugs.add(app.slug);
  }
  return { apps: data.apps.length, categories: categories.length, files: [...fixed, ...categories.map(name => `categories/${name}`)] };
}
export function guardExport(next, previous, allowCountDrop = false) {
  if (next.apps < previous.apps * 0.9 || next.categories < previous.categories) {
    const detail = `apps ${previous.apps} -> ${next.apps}; categories ${previous.categories} -> ${next.categories}`;
    if (!allowCountDrop) throw new Error(`Export refused: count guard (${detail}); maximum app drop 10%, no category drop`);
    console.log(`WARNING: intentional count-drop override (${detail})`);
  }
}
export function syncGenerated(source, destination, next = inspectExport(source)) {
  inspectExport(destination); // Refuse an unrelated repository before deleting anything.
  const old = readdirSync(safePath(path.join(destination, 'categories'))).filter(name => categoryName.test(name));
  // Preflight all writes/deletes before changing any file.
  for (const name of [...next.files, ...old.map(name => `categories/${name}`)]) {
    const stat = lstatSync(safePath(path.join(destination, name)), { throwIfNoEntry: false });
    if (stat && !stat.isFile()) throw new Error(`Refusing non-file generated path: ${name}`);
  }
  for (const name of next.files) {
    regular(source, name);
    mkdirSync(path.dirname(path.join(destination, name)), { recursive: true });
    copyFileSync(path.join(source, name), path.join(destination, name));
  }
  for (const name of old) if (!next.files.includes(`categories/${name}`)) rmSync(path.join(destination, 'categories', name));
}
function redact(text) {
  for (const value of [process.env.PUBLIC_REPOS_GITHUB_TOKEN, process.env.DATABASE_URL]) if (value) text = text.replaceAll(value, '[redacted]');
  return text;
}
export function publishExport(source, destination, { git, allowCountDrop = false } = {}) {
  const next = inspectExport(source);
  guardExport(next, inspectExport(destination), allowCountDrop);
  syncGenerated(source, destination, next);
  // Stage only the generated paths, including removed category files.
  git(['add', '--', ...fixed, 'categories/*.md']);
  if (!git(['diff', '--cached', '--name-only']).trim()) {
    console.log(`No changes: ${next.apps} apps, ${next.categories} categories`);
    return false;
  }
  git(['-c', 'user.name=stack127 list bot', '-c', 'user.email=awesome-list-bot@users.noreply.github.com', '-c', 'commit.gpgsign=false', 'commit', '-m', `Refresh list: ${next.apps} apps, ${next.categories} categories`]);
  git(['push', 'origin', 'HEAD:refs/heads/main']);
  console.log(`Published ${next.apps} apps, ${next.categories} categories`);
  return true;
}
export function runWeekly({ workRoot = '/srv/stack127-data/self-host-apps', allowCountDrop = process.env.AWESOME_LIST_ALLOW_COUNT_DROP === '1' } = {}) {
  if (!process.env.PUBLIC_REPOS_GITHUB_TOKEN?.trim()) throw new Error('PUBLIC_REPOS_GITHUB_TOKEN is missing');
  safePath(workRoot);
  mkdirSync(workRoot, { recursive: true });
  const work = mkdtempSync(path.join(workRoot, 'awesome-list-'));
  const source = path.join(work, 'export');
  const destination = path.join(work, 'repo');
  const askpass = path.join(work, 'askpass.sh');
  // Only the variable name goes on disk. The token is never in args/config/remote.
  writeFileSync(askpass, '#!/bin/sh\ncase "$1" in *Username*) printf "%s\\n" x-access-token ;; *) printf "%s\\n" "$PUBLIC_REPOS_GITHUB_TOKEN" ;; esac\n', { mode: 0o700 });
  const env = { ...process.env, GIT_AUTHOR_NAME: 'stack127 list bot', GIT_AUTHOR_EMAIL: 'awesome-list-bot@users.noreply.github.com', GIT_COMMITTER_NAME: 'stack127 list bot', GIT_COMMITTER_EMAIL: 'awesome-list-bot@users.noreply.github.com', GIT_TERMINAL_PROMPT: '0', GIT_ASKPASS: askpass, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' };
  const run = (command, args, cwd) => {
    const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', timeout: 300000, maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    if (result.error || result.status !== 0) throw new Error(redact(`${command} ${args[0]} failed (exit ${result.status ?? result.error?.code}): ${(result.stderr || '').slice(-8000)}`));
    return result.stdout;
  };
  const git = args => run('git', ['-c', 'credential.helper=', '-c', 'http.followRedirects=false', '-c', 'http.lowSpeedLimit=1024', '-c', 'http.lowSpeedTime=30', ...args], destination);
  try {
    const exporter = fileURLToPath(new URL('./export-awesome-list.mjs', import.meta.url));
    run(process.execPath, [exporter, '--database-env', '--out', source]);
    inspectExport(source);
    // The clone is always fresh; no stale commit/index survives a failed run.
    run('git', ['-c', 'credential.helper=', '-c', 'http.followRedirects=false', 'clone', '--depth', '1', '--branch', 'main', remote, destination]);
    return publishExport(source, destination, { git, allowCountDrop });
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { runWeekly(); } catch (error) { console.error(`ERROR: awesome-list failed: ${redact(error.message)}`); process.exitCode = 1; }
}
