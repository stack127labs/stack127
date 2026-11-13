import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { inspectExport, guardExport, syncGenerated, publishExport } from '../../scripts/stack127/repos/sync-awesome-list.mjs';
import { scheduledAt } from '../../scripts/self-host-apps/ovh/due.mjs';

function fixture(t) {
  const root = mkdtempSync(path.join(realpathSync(tmpdir()), 'awesome-sync-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
function output(root, count = 10, categories = ['wikis']) {
  mkdirSync(path.join(root, 'data'), { recursive: true });
  mkdirSync(path.join(root, 'categories'), { recursive: true });
  writeFileSync(path.join(root, 'README.md'), '# Awesome self-hosted apps\n' + categories.map(slug => `[${slug}](categories/${slug}.md)`).join('\n'));
  writeFileSync(path.join(root, 'LICENSE'), 'CC BY 4.0\n');
  writeFileSync(path.join(root, 'data/apps.json'), JSON.stringify({ apps: Array.from({ length: count }, (_, i) => ({ slug: `app-${i}`, categories: [categories[0]] })) }));
  writeFileSync(path.join(root, 'data/apps.csv'), 'slug,categories\napp-0,wikis\n');
  for (const slug of categories) writeFileSync(path.join(root, 'categories', `${slug}.md`), `# ${slug}\n`);
  return root;
}
const git = (cwd, args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

test('weekly list is due Monday 14:02 UTC and catches up across the week boundary', () => {
  assert.equal(scheduledAt('self-host-awesome-list', new Date('2026-11-16T14:01:00Z')), Date.parse('2026-11-09T14:02:00Z'));
  for (const now of ['2026-11-16T14:02:00Z', '2026-11-22T23:59:00Z']) assert.equal(scheduledAt('self-host-awesome-list', new Date(now)), Date.parse('2026-11-16T14:02:00Z'));
});

test('refuses missing files, missing category tables, empty apps and count drops; override affects counts only', t => {
  const root = fixture(t);
  const source = output(path.join(root, 'source'));
  const original = inspectExport(source);
  assert.doesNotThrow(() => guardExport({ apps: 9, categories: 1 }, original));
  assert.throws(() => guardExport({ apps: 8, categories: 1 }, original), /Export refused.*10%/);
  assert.throws(() => guardExport({ apps: 10, categories: 0 }, original), /Export refused/);
  assert.doesNotThrow(() => guardExport({ apps: 8, categories: 1 }, original, true));
  for (const name of ['README.md', 'LICENSE', 'data/apps.json', 'data/apps.csv', 'categories/wikis.md']) {
    const target = path.join(source, name), bytes = readFileSync(target);
    rmSync(target);
    assert.throws(() => inspectExport(source));
    writeFileSync(target, bytes);
  }
  output(source, 0);
  assert.throws(() => inspectExport(source), /no apps/);
});

test('sync removes retired category files and leaves unrelated files unchanged', t => {
  const root = fixture(t);
  const source = output(path.join(root, 'source'), 10, ['wikis', 'new']);
  const destination = output(path.join(root, 'repo'), 10, ['wikis', 'retired']);
  mkdirSync(path.join(destination, '.github'));
  for (const name of ['CONTRIBUTING.md', '.github/settings.yml', 'data/notes.txt', 'categories/notes.txt']) writeFileSync(path.join(destination, name), 'keep me');
  syncGenerated(source, destination);
  assert.equal(existsSync(path.join(destination, 'categories/retired.md')), false);
  assert.equal(existsSync(path.join(destination, 'categories/new.md')), true);
  for (const name of ['CONTRIBUTING.md', '.github/settings.yml', 'data/notes.txt', 'categories/notes.txt']) assert.equal(readFileSync(path.join(destination, name), 'utf8'), 'keep me');
});

test('sync refuses source, destination file and ancestor symlinks without touching targets', t => {
  const root = fixture(t);
  const source = output(path.join(root, 'source'));
  const destination = output(path.join(root, 'repo'));
  const external = path.join(root, 'external');
  writeFileSync(external, 'keep me');
  rmSync(path.join(destination, 'LICENSE'));
  symlinkSync(external, path.join(destination, 'LICENSE'));
  assert.throws(() => syncGenerated(source, destination), /symbolic link/);
  assert.equal(readFileSync(external, 'utf8'), 'keep me');
  symlinkSync(source, path.join(root, 'link'));
  assert.throws(() => inspectExport(path.join(root, 'link')), /symbolic link/);
});

test('unchanged export is a no-op; changed export commits counts with bot identity and push failures propagate', t => {
  const root = fixture(t);
  const source = output(path.join(root, 'source'));
  const repo = output(path.join(root, 'repo'));
  git(repo, ['init', '-b', 'main']);
  git(repo, ['add', '.']);
  git(repo, ['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'initial']);
  const before = git(repo, ['rev-parse', 'HEAD']);
  let pushes = 0;
  const runGit = args => {
    if (args[0] === 'push') { pushes++; throw new Error('push rejected: non-fast-forward'); }
    return git(repo, args);
  };
  assert.equal(publishExport(source, repo, { git: runGit }), false);
  assert.equal(git(repo, ['rev-parse', 'HEAD']), before);
  assert.equal(pushes, 0);
  output(source, 11);
  assert.throws(() => publishExport(source, repo, { git: runGit }), /push rejected: non-fast-forward/);
  assert.equal(pushes, 1);
  assert.match(git(repo, ['log', '-1', '--format=%s%n%an%n%ae%n%cn%n%ce']), /Refresh list: 11 apps, 1 categories\nstack127 list bot\nawesome-list-bot@users.noreply.github.com\nstack127 list bot/);
});

test('count refusal occurs before sync or git mutation', t => {
  const root = fixture(t);
  const source = output(path.join(root, 'source'), 8);
  const repo = output(path.join(root, 'repo'), 10);
  const before = readFileSync(path.join(repo, 'data/apps.json'), 'utf8');
  assert.throws(() => publishExport(source, repo, { git() { throw new Error('must not run git'); } }), /Export refused/);
  assert.equal(readFileSync(path.join(repo, 'data/apps.json'), 'utf8'), before);
});

test('env preflight requires the dedicated token only for the list job', t => {
  const root = fixture(t);
  const wrapper = path.join(root, 'steps.sh');
  writeFileSync(wrapper, '#!/bin/bash\nexit 0\n');
  const validator = new URL('../../scripts/self-host-apps/ovh/validate-env.mjs', import.meta.url);
  const env = { ...process.env, DATABASE_URL: 'postgresql://stack127_app@127.0.0.1:5432/postgres?sslmode=disable' };
  delete env.AWESOME_LIST_GITHUB_TOKEN;
  const options = { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore', 'ignore'] };
  assert.throws(() => execFileSync(process.execPath, [validator.pathname, 'self-host-awesome-list', wrapper, root, 'test'], options), error => /AWESOME_LIST_GITHUB_TOKEN is missing/.test(error.stderr));
  assert.doesNotThrow(() => execFileSync(process.execPath, [validator.pathname, 'self-host-discovery-lists', wrapper, root, 'test'], options));
  env.AWESOME_LIST_GITHUB_TOKEN = 'fixture-only';
  assert.doesNotThrow(() => execFileSync(process.execPath, [validator.pathname, 'self-host-awesome-list', wrapper, root, 'test'], options));
});
