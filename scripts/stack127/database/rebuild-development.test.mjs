import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { planForwardMigrations, preserveDevelopmentPublication, verifyPageFamilyRestore, normalizeCardSnapshot, compatibleCardColumns } from './rebuild-development.mjs';

const pageTables = ['stack127_pages', 'stack127_tool_pages', 'stack127_catalog_pages', 'stack127_directory_pages', 'stack127_tool_catalog_memberships'];
const rowsByTable = overrides => new Map(pageTables.map(name => [name, overrides[name] ?? []]));

function directoryRestore() {
  const sourcePage = { id: 1, slug: 'self-host-apps', page_family: 'directory', is_indexable: true, is_published: true };
  const developmentPage = { id: 2, slug: 'development-directory', page_family: 'directory', is_indexable: true, is_published: true };
  const sourceCopy = { page_id: 1, title: 'Source directory', content_markdown: null, card_name: 'Source card', card_icon_key: 'self-host-apps', card_art_key: 'self-host-apps' };
  const savedCopy = { page_id: 2, title: 'Edited directory', content_markdown: 'Saved content.', card_name: 'Edited card', card_icon_key: 'terminal', card_art_key: 'labs' };
  return {
    production: rowsByTable({ stack127_pages: [sourcePage], stack127_directory_pages: [sourceCopy] }),
    restored: rowsByTable({ stack127_pages: [{ ...sourcePage }, { ...developmentPage, id: 4 }],
      stack127_directory_pages: [{ ...sourceCopy }, { ...savedCopy, page_id: 4 }] }),
    preserved: { pages: [sourcePage, developmentPage], rows: rowsByTable({ stack127_pages: [developmentPage], stack127_directory_pages: [savedCopy] }) },
  };
}

test('verification accepts the larger directory copy count after preserving an extra development page', () => {
  const { production, restored, preserved } = directoryRestore();
  assert.equal(production.get('stack127_directory_pages').length, 1);
  assert.equal(restored.get('stack127_directory_pages').length, 2);
  const result = verifyPageFamilyRestore(production, restored, preserved);
  assert.deepEqual(result.find(row => row.table === 'stack127_directory_pages'), {
    table: 'stack127_directory_pages', source: 1, development: 2, contentMatches: true,
    preservedDevelopmentRows: 1, preservedRowsVerified: true,
  });
});

test('verification detects missing and changed production-owned directory rows among preserved rows', () => {
  const fixture = directoryRestore();
  const rows = fixture.restored.get('stack127_directory_pages');
  rows[0].title = 'Corrupted source copy';
  assert.throws(() => verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved), /Content mismatch for stack127_directory_pages/);
  rows.shift();
  assert.throws(() => verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved), /Count mismatch for stack127_directory_pages/);
});

test('verification detects missing and changed preserved directory copy after ID remapping', () => {
  const fixture = directoryRestore();
  const rows = fixture.restored.get('stack127_directory_pages');
  rows[1].card_name = 'Lost edited card';
  assert.throws(() => verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved), /Content mismatch for stack127_directory_pages/);
  rows.pop();
  assert.throws(() => verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved), /Count mismatch for stack127_directory_pages/);
});

test('verification remaps tool, catalog, and mixed membership IDs through their page slugs', () => {
  const sourcePages = [{ id: 1, slug: 'source-tool', is_indexable: true }, { id: 2, slug: 'source-catalog', is_indexable: true }];
  const extraPages = [{ id: 3, slug: 'development-tool', is_indexable: true }, { id: 4, slug: 'development-catalog', is_indexable: true }];
  const tool = { page_id: 3, title: 'Saved tool', tool_version: '1.0.0' };
  const catalog = { page_id: 4, card_name: 'Saved catalog' };
  const memberships = [
    { catalog_page_id: 2, tool_page_id: 3, display_order: 1 },
    { catalog_page_id: 4, tool_page_id: 1, display_order: 2 },
    { catalog_page_id: 4, tool_page_id: 3, display_order: 3 },
  ];
  const production = rowsByTable({ stack127_pages: sourcePages,
    stack127_tool_pages: [{ page_id: 1, title: 'Source tool' }],
    stack127_catalog_pages: [{ page_id: 2, card_name: 'Source catalog' }],
    stack127_tool_catalog_memberships: [{ catalog_page_id: 2, tool_page_id: 1, display_order: 1 }],
  });
  const restored = new Map([...production].map(([name, rows]) => [name, structuredClone(rows)]));
  restored.get('stack127_pages').push({ ...extraPages[0], id: 7 }, { ...extraPages[1], id: 8 });
  restored.get('stack127_tool_pages').push({ ...tool, page_id: '7' });
  restored.get('stack127_catalog_pages').push({ ...catalog, page_id: '8' });
  restored.get('stack127_tool_catalog_memberships').push(...memberships.map(row => ({
    ...row, catalog_page_id: row.catalog_page_id === 4 ? 8 : row.catalog_page_id,
    tool_page_id: row.tool_page_id === 3 ? 7 : row.tool_page_id,
  })));
  const preserved = { pages: [...sourcePages, ...extraPages], rows: rowsByTable({ stack127_pages: extraPages,
    stack127_tool_pages: [tool], stack127_catalog_pages: [catalog], stack127_tool_catalog_memberships: memberships }) };
  const result = verifyPageFamilyRestore(production, restored, preserved);
  assert.equal(result.find(row => row.table === 'stack127_tool_pages').preservedDevelopmentRows, 1);
  assert.equal(result.find(row => row.table === 'stack127_catalog_pages').preservedDevelopmentRows, 1);
  assert.equal(result.find(row => row.table === 'stack127_tool_catalog_memberships').preservedDevelopmentRows, 3);
  restored.get('stack127_tool_catalog_memberships')[1].tool_page_id = 8;
  assert.throws(() => verifyPageFamilyRestore(production, restored, preserved), /Content mismatch for stack127_tool_catalog_memberships/);
});

test('preserved draft publication flags and dates are checked exactly after remapping', () => {
  const fixture = directoryRestore();
  for (const page of [fixture.preserved.pages[1], fixture.preserved.rows.get('stack127_pages')[0], fixture.restored.get('stack127_pages')[1]]) {
    page.slug = 'platform-fees/development-section';
    page.published_at = '2026-10-01';
  }
  verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved);
  fixture.restored.get('stack127_pages')[1].is_published = false;
  assert.throws(() => verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved), /Content mismatch for stack127_pages/);
});

test('standalone verification compares production content without claiming to verify preserved copy', () => {
  const fixture = directoryRestore();
  const result = verifyPageFamilyRestore(fixture.production, fixture.restored);
  assert.ok(result.every(row => row.contentMatches && !row.preservedRowsVerified));
});

test('development previews survive production introducing unpublished draft registry rows', () => {
  const production = [
    { slug: 'platform-fees', is_published: false, published_at: null, updated_at: null, label: 'Current fee directory', is_indexable: true },
    { slug: 'platform-fees/app-stores', is_published: false, published_at: null, is_indexable: true },
    { slug: 'launch-directories', is_published: false, published_at: null, is_indexable: true },
    { slug: 'ad-networks', is_published: false, published_at: null, is_indexable: true },
    { slug: 'ad-networks/google-adsense', is_published: false, published_at: null, is_indexable: true },
    { slug: 'self-host-apps', is_published: true, published_at: 'production-date', is_indexable: true },
  ];
  const development = production.map((row) => ({ ...row, is_published: row.slug !== 'self-host-apps', published_at: '2026-09-28T17:07:36Z', updated_at: '2026-10-01T04:54:10Z', label: 'Outdated local title' }));
  const result = preserveDevelopmentPublication(production, development);
  for (const row of result.slice(0, 5)) {
    assert.equal(row.is_published, true);
    assert.equal(row.published_at, '2026-09-28T17:07:36Z');
    assert.equal(row.updated_at, '2026-10-01T04:54:10Z');
    assert.ok(row.updated_at >= row.published_at);
  }
  assert.equal(result[0].label, 'Current fee directory');
  assert.deepEqual(result[5], production[5]);
  assert.equal(production[0].is_published, false);
  const unpublished = preserveDevelopmentPublication(production, [{ slug: 'platform-fees', is_published: false, published_at: null, updated_at: null, is_indexable: true }]);
  assert.equal(unpublished[0].published_at, null);
  assert.equal(unpublished[0].updated_at, null);
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


test('legacy catalog snapshots preserve icon, card art, and hero art through renames', () => {
  const row = { page_id: 1, icon_key: 'network', home_art_key: 'dns-tools', hero_art_key: 'dns-lookup' };
  assert.deepEqual(normalizeCardSnapshot('stack127_catalog_pages', [row], [])[0], {
    page_id: 1, card_icon_key: 'network', card_art_key: 'dns-tools', hero_art_key: 'dns-lookup',
  });
  assert.equal(row.icon_key, 'network');
  assert.throws(() => normalizeCardSnapshot('stack127_catalog_pages', [{ ...row, card_icon_key: 'globe' }], []), /Conflicting card columns/);
});

test('legacy directory snapshots backfill homepage cards and leave child assets null', () => {
  const pages = [{ id: 1, slug: 'self-host-apps', is_indexable: true }, { id: 2, slug: 'platform-fees/books', is_indexable: true }];
  assert.deepEqual(normalizeCardSnapshot('stack127_directory_pages', [{ page_id: 1 }, { page_id: 2 }], pages), [
    { page_id: 1, card_icon_key: 'self-host-apps', card_art_key: 'self-host-apps' },
    { page_id: 2, card_icon_key: null, card_art_key: null },
  ]);
  const edited = { page_id: 1, card_icon_key: 'terminal', card_art_key: null };
  assert.deepEqual(normalizeCardSnapshot('stack127_directory_pages', [edited], pages), [edited]);
});

test('copy accepts only the known card schema transition', () => {
  const column = column_name => ({ column_name, data_type: 'text', udt_name: 'text' });
  assert.ok(compatibleCardColumns('stack127_catalog_pages', [column('icon_key'), column('home_art_key'), column('hero_art_key')],
    [column('card_icon_key'), column('card_art_key'), column('hero_art_key')]));
  assert.ok(compatibleCardColumns('stack127_directory_pages', [column('title')],
    [column('title'), column('card_icon_key'), column('card_art_key')]));
  assert.ok(!compatibleCardColumns('stack127_directory_pages', [column('title')],
    [column('title'), column('card_icon_key'), column('card_art_key'), column('unexpected')]));
  assert.ok(!compatibleCardColumns('stack127_directory_pages', [column('title')],
    [column('title'), { ...column('card_icon_key'), udt_name: 'int4' }, column('card_art_key')]));
});

test('restore verification detects a changed card icon or art after ID remapping', () => {
  for (const field of ['card_icon_key', 'card_art_key']) {
    const fixture = directoryRestore();
    fixture.restored.get('stack127_directory_pages')[1][field] = 'globe';
    assert.throws(() => verifyPageFamilyRestore(fixture.production, fixture.restored, fixture.preserved), /Content mismatch/);
  }
});

test('copy and verification accept only the reviewed indexing and revision schema changes', () => {
  const column = (column_name, data_type = 'text', udt_name = 'text') => ({column_name, data_type, udt_name});
  const legacy = [column('title'), column('content_revision', 'integer', 'int4')];
  assert.equal(compatibleCardColumns('stack127_tool_pages', legacy, [column('title')]), true);
  assert.equal(compatibleCardColumns('stack127_tool_pages', [column('title'), column('content_revision')], [column('title')]), false);
  assert.equal(compatibleCardColumns('stack127_pages', [column('slug')], [column('slug'), column('is_indexable', 'boolean', 'bool')]), true);
  assert.equal(compatibleCardColumns('stack127_pages', [column('slug')], [column('slug'), column('is_indexable')]), false);
  assert.equal(compatibleCardColumns('stack127_pages', [column('slug')], [column('slug'), column('is_indexable', 'boolean', 'bool'), column('unknown')]), false);
  assert.deepEqual(normalizeCardSnapshot('stack127_tool_pages', [{page_id: 1, title: 'Tool', content_revision: 7}], []), [{page_id: 1, title: 'Tool'}]);
  assert.deepEqual(normalizeCardSnapshot('stack127_pages', [{slug: 'old'}, {slug: 'hidden', is_indexable: false}], []), [{slug: 'old', is_indexable: true}, {slug: 'hidden', is_indexable: false}]);
});
