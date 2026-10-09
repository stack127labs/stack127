import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('../../', import.meta.url));
const route = 'app/(site)/(directories)/keyboard-shortcuts';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'stack127-shortcut-sync-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of ['scripts/keyboard-shortcuts/sync-pages.mjs',
    'scripts/stack127/directory-pages/lib.mjs', 'scripts/stack127/tool-pages/lib.mjs']) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await cp(path.join(repo, file), path.join(root, file));
  }
  await symlink(path.join(repo, 'node_modules'), path.join(root, 'node_modules'), 'dir');
  await mkdir(path.join(root, 'lib/shortcuts/apps'), { recursive: true });
  for (const slug of ['alpha', 'beta']) {
    await writeFile(path.join(root, `lib/shortcuts/apps/${slug}.ts`),
      `export default ${JSON.stringify({ slug, name: slug, category: 'Editor', platforms: ['linux'], groups: [] })};\n`);
  }
  return root;
}

function run(root, ...args) {
  const result = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/keyboard-shortcuts/sync-pages.mjs', ...args],
    { cwd: root, encoding: 'utf8', timeout: 15000 });
  assert.ifError(result.error);
  return result;
}

test('missing intros stop generation and checks before any files change, and name every app', async t => {
  const root = await fixture(t);
  const existing = path.join(root, route, 'alpha/page.tsx');
  await mkdir(path.dirname(existing), { recursive: true });
  await writeFile(existing, 'Existing route');
  await writeFile(path.join(root, 'lib/shortcuts/catalog.generated.ts'), 'Existing catalog');
  for (const args of [[], ['--check'], ['--apply', '--environment', 'development']]) {
    const result = run(root, ...args);
    assert.equal(result.status, 1, result.stderr);
    for (const slug of ['alpha', 'beta']) assert.ok(result.stderr.includes(`${slug}: ${route}/${slug}/content/intro.mdx`));
    assert.equal(await readFile(existing, 'utf8'), 'Existing route');
    assert.equal(await readFile(path.join(root, 'lib/shortcuts/catalog.generated.ts'), 'utf8'), 'Existing catalog');
    await assert.rejects(readFile(path.join(root, 'lib/shortcuts/loaders.generated.ts')), { code: 'ENOENT' });
    await assert.rejects(readFile(path.join(root, route, 'beta/page.tsx')), { code: 'ENOENT' });
  }
});

test('generated child routes pass their own MDX intro to the template and checks detect stale routes', async t => {
  const root = await fixture(t);
  for (const slug of ['alpha', 'beta']) {
    const directory = path.join(root, route, slug, 'content');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'intro.mdx'), 'Written intro.\n');
  }
  const generated = run(root);
  assert.equal(generated.status, 0, generated.stderr);
  for (const slug of ['alpha', 'beta']) {
    assert.equal(await readFile(path.join(root, route, slug, 'page.tsx'), 'utf8'),
      `import app from "@/lib/shortcuts/apps/${slug}";
import { KeyboardShortcutsAppPage } from "../keyboard-shortcuts-app-page";
import Intro from "./content/intro.mdx";

export default function KeyboardShortcutsPage() {
  return <KeyboardShortcutsAppPage app={app} intro={<Intro />} />;
}
`);
    assert.equal(await readFile(path.join(root, route, slug, 'content/intro.mdx'), 'utf8'), 'Written intro.\n');
  }
  const checked = run(root, '--check');
  assert.equal(checked.status, 0, checked.stderr);
  const stale = path.join(root, route, 'alpha/page.tsx');
  await writeFile(stale, 'Stale route');
  const result = run(root, '--check');
  assert.equal(result.status, 1, result.stderr);
  assert.ok(result.stderr.includes(`${route}/alpha/page.tsx`), result.stderr);
  assert.equal(await readFile(stale, 'utf8'), 'Stale route');
});
