import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import { previewDirectoryPages } from '../../scripts/stack127/directory-pages/lib.mjs';

const hardwareSlugs = ['zigbee-coordinators', 'z-wave-devices', 'nut-compatible-ups', 'local-security-cameras', 'matter-devices'];
const cases = [
  { name: 'hardware', script: '../../scripts/stack127/preview-hardware-directories.mjs', slugs: hardwareSlugs },
  { name: 'Zigbee', script: '../../scripts/zigbee-devices/preview-local-page.mjs', slugs: ['zigbee-devices'] },
];

function database(slugs) {
  const rows = slugs.map((slug, index) => ({
    id: index + 1, slug, label: 'Zigbee devices',
    meta_title: 'Zigbee devices with ZHA and Zigbee2MQTT evidence',
    meta_description: 'Check exact Zigbee models with current Zigbee2MQTT converter evidence and community-confirmed ZHA records.',
    is_published: true, page_family: 'directory', page_type: 'CollectionPage', sitemap_priority: 0.5,
    published_at: '2026-10-01', updated_at: '2026-10-01',
  }));
  const copies = rows.map(row => ({
    page_id: row.id, title: `Edited <mark>${row.slug}</mark>`, intro_markdown: 'Edited intro.',
    content_markdown: 'Edited page content.', card_name: 'Edited card name',
    card_description: 'Edited card description.', card_icon_key: 'layers', card_art_key: 'catalog/test', row_updated_at: '2026-10-02',
  }));
  const state = { rows, copies, failUpdate: null };
  let snapshot;
  const client = {
    release() {},
    async query(sql, args = []) {
      const query = sql.replace(/\s+/g, ' ').trim().toLowerCase();
      if (query === 'begin') { snapshot = structuredClone({ rows: state.rows, copies: state.copies }); return { rows: [] }; }
      if (query === 'commit') { snapshot = null; return { rows: [] }; }
      if (query === 'rollback') { Object.assign(state, snapshot); snapshot = null; return { rows: [] }; }
      if (query.startsWith('select')) {
        const requested = Array.isArray(args[0]) ? args[0] : [args[0]];
        return { rows: state.rows.filter(row => requested.includes(row.slug)).map(row => ({
          ...row, has_directory_copy: state.copies.some(copy => copy.page_id === row.id),
        })) };
      }
      if (query.startsWith('delete')) {
        const requested = Array.isArray(args[0]) ? args[0] : [args[0]];
        const removedIds = state.rows.filter(row => requested.includes(row.slug)).map(row => row.id);
        state.rows = state.rows.filter(row => !removedIds.includes(row.id));
        state.copies = state.copies.filter(copy => !removedIds.includes(copy.page_id));
        return { rows: [] };
      }
      if (query.startsWith('insert into public.stack127_pages')) {
        if (state.rows.some(row => row.slug === args[0])) return { rows: [], rowCount: 0 };
        const [slug, label, title, description, pageType, priority] = args;
        state.rows.push({ id: Math.max(0, ...state.rows.map(row => row.id)) + 1,
          slug, label, meta_title: title, meta_description: description, page_family: 'directory',
          page_type: pageType, sitemap_priority: priority, is_published: false, published_at: null, updated_at: null });
        return { rows: [], rowCount: 1 };
      }
      if (query.startsWith('insert into public.stack127_directory_pages')) {
        const row = state.rows.find(row => row.slug === args[0] && row.page_family === 'directory');
        if (!row || state.copies.some(copy => copy.page_id === row.id)) return { rows: [], rowCount: 0 };
        state.copies.push({ page_id: row.id, title: args[1], intro_markdown: args[2], content_markdown: args[3],
          card_name: args[4] ?? row.label, card_description: args[5] ?? row.meta_description, row_updated_at: 'now' });
        return { rows: [{ page_id: row.id }], rowCount: 1 };
      }
      if (query.startsWith('update')) {
        const row = state.rows.find(row => row.id === args[0]);
        if (row.slug === state.failUpdate) throw new Error('Preview update failed');
        if (query.includes('is_published=false')) {
          Object.assign(row, { is_published: false, published_at: null, updated_at: null });
        } else if (query.includes('label=')) {
          const [, label, title, description, refresh] = args;
          Object.assign(row, { label, meta_title: title, meta_description: description });
          if (!refresh) Object.assign(row, { is_published: true, published_at: 'now', updated_at: 'now' });
        } else {
          Object.assign(row, { is_published: true, published_at: row.published_at ?? 'now', updated_at: 'now' });
        }
        return { rows: [] };
      }
      throw new Error(`Unexpected database operation: ${query}`);
    },
  };
  return { state, pool: { connect: async () => client, query: client.query, end: async () => {} } };
}

async function runScript(script, args, pool, environment = {}) {
  const source = readFileSync(new URL(script, import.meta.url), 'utf8').replace(/^#![^\n]*\n/, '');
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  return vm.runInNewContext(`(async () => { ${code} })()`, {
    exports: {}, URL,
    process: { argv: ['node', script, ...args], env: {
      DATABASE_URL: 'postgres://preview:placeholder@db.phhrfvmncpqqmmgruktx.supabase.co/postgres',
      SUPABASE_URL: 'https://phhrfvmncpqqmmgruktx.supabase.co', ...environment,
    } },
    console: { log() {} },
    require(name) {
      if (name === 'pg') return { Pool: class { constructor() { return pool; } } };
      if (name.endsWith('/directory-pages/lib.mjs')) return { previewDirectoryPages };
      throw new Error(`Unexpected import: ${name}`);
    },
  });
}

for (const preview of cases) {
  test(`${preview.name} removal and republishing preserve edited copy, cards, timestamps, and IDs`, async () => {
    const { state, pool } = database(preview.slugs);
    const before = structuredClone(state.copies);
    const searchBefore = state.rows.map(row => ({ label: row.label, title: row.meta_title, description: row.meta_description }));
    const ids = state.rows.map(row => row.id);
    await runScript(preview.script, ['--remove'], pool);
    assert.ok(state.rows.every(row => !row.is_published));
    assert.deepEqual(state.copies, before);
    await runScript(preview.script, [], pool);
    assert.ok(state.rows.every(row => row.is_published));
    assert.deepEqual(state.rows.map(row => row.id), ids);
    assert.deepEqual(state.copies, before);
    assert.deepEqual(state.rows.map(row => ({ label: row.label, title: row.meta_title, description: row.meta_description })), searchBefore);
  });

  test(`${preview.name} preview inserts only missing directory copy and preserves existing fields`, async () => {
    const { state, pool } = database(preview.slugs);
    state.rows.forEach(row => { row.is_published = false; });
    state.copies.pop();
    const before = structuredClone(state.copies);
    const searchBefore = state.rows.map(row => [row.label, row.meta_title, row.meta_description]);
    await runScript(preview.script, [], pool);
    assert.ok(state.rows.every(row => row.is_published));
    assert.deepEqual(state.copies.slice(0, before.length), before);
    assert.equal(state.copies.length, preview.slugs.length);
    assert.deepEqual(state.rows.map(row => [row.label, row.meta_title, row.meta_description]), searchBefore);
    const initialized = state.copies.at(-1);
    assert.equal(initialized.intro_markdown, state.rows.at(-1).meta_description);
    assert.equal(initialized.content_markdown, null);
  });

  test(`${preview.name} preview leaves published rows and their dates unchanged`, async () => {
    const { state, pool } = database(preview.slugs);
    const before = structuredClone({ rows: state.rows, copies: state.copies });
    await runScript(preview.script, [], pool);
    assert.deepEqual({ rows: state.rows, copies: state.copies }, before);
  });

  test(`${preview.name} preview initializes missing registry and directory rows once`, async () => {
    const { state, pool } = database([]);
    await runScript(preview.script, [], pool);
    assert.equal(state.rows.length, preview.slugs.length);
    assert.equal(state.copies.length, preview.slugs.length);
    assert.ok(state.rows.every(row => row.is_published && row.page_family === 'directory'));
    const before = structuredClone({ rows: state.rows, copies: state.copies });
    await runScript(preview.script, [], pool);
    assert.deepEqual({ rows: state.rows, copies: state.copies }, before);
  });

  test(`${preview.name} dry runs roll back publication, removal, and missing-row insertion`, async () => {
    for (const operation of ['publish', 'remove', 'insert']) {
      const { state, pool } = database(operation === 'insert' ? [] : preview.slugs);
      if (operation === 'publish') state.rows.forEach(row => { row.is_published = false; });
      const before = structuredClone({ rows: state.rows, copies: state.copies });
      await runScript(preview.script, ['--dry-run', ...(operation === 'remove' ? ['--remove'] : [])], pool);
      assert.deepEqual({ rows: state.rows, copies: state.copies }, before);
    }
  });

  test(`${preview.name} rejects the retired refresh flag without changing fields`, async () => {
    const { state, pool } = database(preview.slugs);
    const before = structuredClone({ rows: state.rows, copies: state.copies });
    await assert.rejects(runScript(preview.script, ['--refresh'], pool), /--refresh is retired/);
    assert.deepEqual({ rows: state.rows, copies: state.copies }, before);
  });

  test(`${preview.name} preview rejects another page family`, async () => {
    const { state, pool } = database(preview.slugs);
    state.rows[0].page_family = 'tool';
    await assert.rejects(runScript(preview.script, ['--remove'], pool), /Wrong page family/);
    assert.ok(state.rows.every(row => row.is_published));
  });

  test(`${preview.name} preview keeps its production environment guard`, async () => {
    const { pool } = database(preview.slugs);
    await assert.rejects(runScript(preview.script, [], pool, { NODE_ENV: 'production' }), /Refusing production/);
  });
}

test('hardware preview rolls back the entire batch when an update fails', async () => {
  const { state, pool } = database(hardwareSlugs);
  state.rows.forEach(row => { row.is_published = false; });
  state.failUpdate = hardwareSlugs[1];
  const before = structuredClone({ rows: state.rows, copies: state.copies });
  await assert.rejects(runScript(cases[0].script, [], pool), /Preview update failed/);
  assert.deepEqual({ rows: state.rows, copies: state.copies }, before);
});

test('Zigbee removal retains the preview metadata guard', async () => {
  const { state, pool } = database(['zigbee-devices']);
  state.rows[0].meta_title = 'Another page';
  await assert.rejects(runScript(cases[1].script, ['--remove'], pool), /does not match the preview contract/);
  assert.equal(state.rows[0].is_published, true);
  assert.equal(state.copies.length, 1);
});
