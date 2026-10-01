import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { planForwardMigrations, preserveDevelopmentPublication } from './rebuild-development.mjs';

test('development previews survive production introducing unpublished draft registry rows', () => {
  const production = [
    { slug: 'platform-fees', is_published: false, published_at: null, label: 'Current fee directory' },
    { slug: 'platform-fees/app-stores', is_published: false, published_at: null },
    { slug: 'launch-directories', is_published: false, published_at: null },
    { slug: 'ad-networks', is_published: false, published_at: null },
    { slug: 'ad-networks/google-adsense', is_published: false, published_at: null },
    { slug: 'self-host-apps', is_published: true, published_at: 'production-date' },
  ];
  const development = production.map((row) => ({ ...row, is_published: row.slug !== 'self-host-apps', published_at: 'preview-date', label: 'Outdated local title' }));
  const result = preserveDevelopmentPublication(production, development);
  for (const row of result.slice(0, 5)) {
    assert.equal(row.is_published, true);
    assert.equal(row.published_at, 'preview-date');
  }
  assert.equal(result[0].label, 'Current fee directory');
  assert.deepEqual(result[5], production[5]);
  assert.equal(production[0].is_published, false);
});

test('old missing production migrations and retired development versions stop migration before SQL replay', () => {
  assert.throws(() => planForwardMigrations(['100', '200'], ['100', '150'], ['100', '200', '300']), /Do not replay old SQL/);
  assert.throws(() => planForwardMigrations(['100', '200'], ['100'], ['100', '200', '300']), /Do not replay old SQL/);
  assert.throws(() => planForwardMigrations(['100', '200'], ['100', '200'], ['100', '200', '150']), /Only forward/);
  assert.throws(() => planForwardMigrations(['100'], ['100', '300'], ['100', '200', '300']), /Only forward/);
  assert.deepEqual(planForwardMigrations(['100', '200'], ['100', '200'], ['100', '200', '300']), ['300']);
  assert.deepEqual(planForwardMigrations(['100', '200'], ['100', '200', '300'], ['100', '200', '300', '400']), ['400']);
});

test('history alignment requires data copy, verification and a backup before reading credentials', () => {
  const result = spawnSync(process.execPath, [new URL('./rebuild-development.mjs', import.meta.url).pathname, '--apply', '--align-history'], { cwd: '/tmp', encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requires --apply --copy --verify --history-backup/);
  assert.doesNotMatch(result.stderr, /\.env\.database/);
});
