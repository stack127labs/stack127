import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { validateCardKey } from '../../scripts/stack127/card-keys.mjs';

function load(file, imports) {
  const code = ts.transpileModule(readFileSync(new URL(`../../lib/${file}.ts`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, Error, require(name) {
    if (name === "./card-data") return load("card-data", imports);
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`);
    return imports[name];
  } });
  return exports;
}

test('homepage card reads return all four fields for each family through both transports', async () => {
  const families = ['tool', 'directory', 'catalog', 'course'];
  const pages = families.map((page_family, id) => ({ id: id + 1, page_family }));
  const rows = pages.map(page => ({ page_id: page.id, card_name: page.page_family,
    card_description: 'Card description', card_icon_key: 'network', card_art_key: 'dns-tools' }));
  for (const transport of ['dataApiRead', 'postgresRead']) {
    const { readPageCards } = load('page-cards', {
      './db': { getPool: () => ({ query: async (sql, [ids]) => {
        assert.deepEqual(Array.from(ids), [1, 2, 3, 4]);
        assert.ok(sql.includes('stack127_directory_pages'));
        return { rows };
      } }) },
      './public-data-api': {
        readPublicData: options => options[transport](),
        selectPublicRows: async (table, parameters) => {
          assert.equal(parameters.select, 'page_id,card_name,card_description,card_icon_key,card_art_key');
          const family = families.find(name => table === `stack127_${name}_pages`);
          return rows.filter(row => row.card_name === family);
        },
      },
    });
    const cards = await readPageCards(pages);
    for (const row of rows) assert.deepEqual(JSON.parse(JSON.stringify(cards.get(String(row.page_id)))), row);
    assert.equal((await readPageCards([])).size, 0);
  }
});

test('directory Data API reads include nullable card assets and respect publication', async () => {
  let published = true;
  const row = { page_id: 1, card_icon_key: null, card_art_key: null };
  const { getPublishedDirectoryPage } = load('directory-pages', {
    react: { cache: fn => fn }, 'next/cache': { unstable_cache: fn => fn },
    'next/navigation': { notFound() { throw new Error('404'); } },
    './cache-tags': { DIRECTORY_PAGES_TAG: 'directory' }, './db': {},
    './page-registry': { getPublishedPage: async () => published ? { id: 1, slug: 'platform-fees/books', page_family: 'directory' } : null },
    './public-data-api': {
      readPublicData: options => options.dataApiRead(),
      selectPublicRows: async (table, parameters) => {
        assert.equal(table, 'stack127_directory_pages');
        assert.ok(parameters.select.includes('card_icon_key,card_art_key'));
        return [row];
      },
    },
  });
  const page = await getPublishedDirectoryPage('platform-fees/books');
  assert.equal(page.card_icon_key, null);
  assert.equal(page.card_art_key, null);
  published = false;
  assert.equal(await getPublishedDirectoryPage('platform-fees/books'), null);
});

test('directory, course, and labs keys resolve in both registries and existing tool keys remain valid', () => {
  for (const key of ['cli-apps', 'epp-status-codes', 'keyboard-shortcuts', 'labs', 'launch-directories',
    'platform-fees', 'self-host-apps', 'self-hosting-for-beginners', 'software-licenses-for-self-hosting', 'tld-directory']) {
    assert.equal(validateCardKey('card_icon_key', key), key);
    assert.equal(validateCardKey('card_art_key', key), key);
  }
  assert.equal(validateCardKey('card_icon_key', 'wrench'), 'wrench');
  assert.equal(validateCardKey('card_art_key', 'epp-status'), 'epp-status');
  assert.throws(() => validateCardKey('card_icon_key', 'missing-icon'), /Unknown card_icon_key/);
  assert.throws(() => validateCardKey('card_art_key', 'missing-art'), /Unknown card_art_key/);
});

test('writers reject unknown card keys before opening a database connection', () => {
  for (const [script, args, error] of [
    ['directory-pages/update-content.mjs', ['--slug', 'self-host-apps', '--card-icon-key', 'missing-icon'], /Unknown card_icon_key/],
    ['directory-pages/update-content.mjs', ['--slug', 'self-host-apps', '--card-art-key', 'missing-art'], /Unknown card_art_key/],
    ['tool-pages/update-catalogs.mjs', ['--slug', 'dns-lookup', '--card-name', 'DNS', '--card-description', 'Lookup',
      '--card-icon-key', 'network', '--card-art-key', 'missing-art', '--catalogs', 'dns-tools'], /Unknown card_art_key/],
  ]) {
    const result = spawnSync(process.execPath, [new URL(`../../scripts/stack127/${script}`, import.meta.url).pathname, ...args], { cwd: '/tmp', encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, error);
    assert.doesNotMatch(result.stderr, /required in .env/);
  }
});


test('card reads normalize old catalog columns and seed only old parent directory assets', () => {
  const { normalizeCardAssets } = load('card-data', { './public-data-api': {} });
  const catalog = normalizeCardAssets({ icon_key: 'network', home_art_key: 'dns-tools' }, 'catalog', 'dns-tools');
  assert.equal(catalog.card_icon_key, 'network');
  assert.equal(catalog.card_art_key, 'dns-tools');
  assert.equal('icon_key' in catalog, false);
  const parent = normalizeCardAssets({}, 'directory', 'self-host-apps');
  assert.equal(parent.card_icon_key, 'self-host-apps');
  assert.equal(parent.card_art_key, 'self-host-apps');
  const child = normalizeCardAssets({}, 'directory', 'keyboard-shortcuts/vscode');
  assert.equal(child.card_icon_key, null);
  assert.equal(child.card_art_key, null);
});

test('migrated directory reads preserve explicit nulls and changed assets', () => {
  const { normalizeCardAssets } = load('card-data', { './public-data-api': {} });
  const empty = normalizeCardAssets({ card_icon_key: null, card_art_key: null }, 'directory', 'self-host-apps');
  assert.equal(empty.card_icon_key, null);
  assert.equal(empty.card_art_key, null);
  const changed = normalizeCardAssets({ card_icon_key: 'server', card_art_key: 'labs' }, 'directory', 'self-host-apps');
  assert.equal(changed.card_icon_key, 'server');
  assert.equal(changed.card_art_key, 'labs');
  const oldSql = normalizeCardAssets({ card_icon_key: null, card_art_key: null, legacy_card_assets: true }, 'directory', 'self-host-apps');
  assert.equal(oldSql.card_icon_key, 'self-host-apps');
  assert.equal('legacy_card_assets' in oldSql, false);
});

test('Data API reads retry legacy card selections while preserving filters and order', async () => {
  for (const table of ['stack127_directory_pages', 'stack127_catalog_pages']) {
    const calls = [];
    const { selectCardRows } = load('card-data', { './public-data-api': {
      selectPublicRows: async (name, parameters) => {
        calls.push(parameters);
        assert.equal(name, table);
        if (calls.length === 1) throw new Error('Supabase public Data API read failed with status 400.');
        return [{ page_id: 1, card_name: 'Card', card_description: 'Description' }];
      },
    } });
    const rows = await selectCardRows(table, { select: 'page_id,card_name,card_description,card_icon_key,card_art_key', page_id: 'eq.1', order: 'page_id.asc' });
    assert.equal(rows[0].legacy_card_assets, true);
    assert.equal(calls[1].page_id, 'eq.1');
    assert.equal(calls[1].order, 'page_id.asc');
    assert.equal(calls[1].select, table === 'stack127_directory_pages'
      ? 'page_id,card_name,card_description'
      : 'page_id,card_name,card_description,card_icon_key:icon_key,card_art_key:home_art_key');
  }
});

test('card compatibility reads do not hide network errors or tool read failures', async () => {
  for (const [table, message] of [['stack127_directory_pages', 'network unavailable'], ['stack127_tool_pages', 'Supabase public Data API read failed with status 400.']]) {
    let calls = 0;
    const { selectCardRows } = load('card-data', { './public-data-api': {
      selectPublicRows: async () => { calls++; throw new Error(message); },
    } });
    await assert.rejects(selectCardRows(table, { select: 'card_icon_key,card_art_key' }), error => error.message === message);
    assert.equal(calls, 1);
  }
});
