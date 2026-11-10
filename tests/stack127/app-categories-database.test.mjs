import test from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { resolveDatabaseUrl } from '../../scripts/stack127/tool-pages/lib.mjs';
const enabled = process.env.APP_CATEGORY_DATABASE_TESTS === '1';
async function transaction(work) {
  const db = new pg.Client({ connectionString: resolveDatabaseUrl({ environment: 'development' }), query_timeout: 60000 });
  await db.connect();
  try { await db.query('begin'); await work(db); } finally { await db.query('rollback'); await db.end(); }
}
const readPage = async (db, slug) => (await db.query('select is_published,updated_at::text from public.stack127_pages where slug=$1', [slug])).rows[0];
const reset = async (db, slug) => db.query("update public.stack127_pages set published_at='2000-01-01',updated_at='2000-01-01' where slug=$1", [slug]);

test('published self-host facts, category moves, and deletion touch their category pages; no-op leaves dates unchanged', { skip: !enabled }, async () => transaction(async db => {
  const category = 'self-host-apps/categories/learning-courses';
  const app = (await db.query(`select app.id from public.self_host_apps app join public.self_host_app_category_links link on link.app_id=app.id
    join public.self_host_app_categories category on category.id=link.category_id where app.published and app.self_hosting_status='self_hostable'
    and category.slug='learning-courses' limit 1`)).rows[0];
  assert.ok(app);
  await reset(db, category);
  const before = await readPage(db, category);
  await db.query('update public.self_host_apps set summary=summary where id=$1', [app.id]);
  assert.equal((await readPage(db, category)).updated_at, before.updated_at);
  await db.query("update public.self_host_apps set summary=summary || ' Test.' where id=$1", [app.id]);
  assert.notEqual((await readPage(db, category)).updated_at, before.updated_at);
  await reset(db, category);
  await db.query('delete from public.self_host_apps where id=$1', [app.id]);
  assert.notEqual((await readPage(db, category)).updated_at, before.updated_at);
}));

test('old and new CLI memberships refresh, and dropping below 15 retires the page', { skip: !enabled }, async () => transaction(async db => {
  const oldSlug = 'cli-apps/categories/media-graphics';
  const nextSlug = 'cli-apps/categories/development';
  const apps = (await db.query("select slug from public.terminal_apps where published and 'media-graphics'=any(categories) limit 2")).rows;
  assert.equal(apps.length, 2);
  await reset(db, oldSlug); await reset(db, nextSlug);
  const before = await readPage(db, oldSlug);
  const nextBefore = await readPage(db, nextSlug);
  await db.query("update public.terminal_apps set categories=array_remove(categories,'media-graphics') || array['development'] where slug=$1", [apps[0].slug]);
  assert.notEqual((await readPage(db, oldSlug)).updated_at, before.updated_at);
  assert.notEqual((await readPage(db, nextSlug)).updated_at, nextBefore.updated_at);
  assert.equal((await readPage(db, oldSlug)).is_published, true);
  await db.query('update public.terminal_apps set published=false where slug=$1', [apps[1].slug]);
  assert.equal((await readPage(db, oldSlug)).is_published, false);
  await assert.rejects(db.query('update public.stack127_pages set is_published=true where slug=$1', [oldSlug]), /at least 15/);
}));

test('self-host link moves, RAM facts, and linked GitHub facts use the existing category refresh pipeline', { skip: !enabled }, async () => transaction(async db => {
  const slug = 'self-host-apps/categories/ai-ml';
  const app = (await db.query(`select a.id,a.github_project_id,l.category_id from public.self_host_apps a
    join public.self_host_app_category_links l on l.app_id=a.id join public.self_host_app_categories c on c.id=l.category_id
    where a.published and a.self_hosting_status='self_hostable' and c.slug='ai-ml' and a.github_project_id is not null limit 1`)).rows[0];
  assert.ok(app);
  await reset(db, slug); const before = await readPage(db, slug);
  await db.query('update public.self_host_apps set ram_min_mb=coalesce(ram_min_mb,0)+1 where id=$1', [app.id]);
  assert.notEqual((await readPage(db, slug)).updated_at, before.updated_at);
  await reset(db, slug);
  await db.query('update public.github_projects set stars=coalesce(stars,0)+1 where id=$1', [app.github_project_id]);
  assert.notEqual((await readPage(db, slug)).updated_at, before.updated_at);
  await reset(db, slug);
  await db.query('delete from public.self_host_app_category_links where app_id=$1 and category_id=$2', [app.id,app.category_id]);
  assert.notEqual((await readPage(db, slug)).updated_at, before.updated_at);
}));

for (const state of ['absent', 'unpublished']) {
  test(`self-host sync skips retirement counts with ${state} category rows`, { skip: !enabled }, async () => transaction(async db => {
    if (state === 'absent') {
      await db.query("delete from public.stack127_pages where slug like 'self-host-apps/categories/%'");
    } else {
      await db.query("update public.stack127_pages set is_published=false,published_at=null,updated_at=null where slug like 'self-host-apps/categories/%'");
    }
    // Fail if any retirement count runs. Everything, including this replacement,
    // rolls back; this models production with no published self-host categories.
    await db.query(`create or replace function public.stack127_app_category_count(p_slug text)
      returns bigint language plpgsql stable security invoker set search_path=pg_catalog as $$
      begin raise exception 'Unexpected category count: %',p_slug; end; $$`);
    await db.query(`update public.self_host_apps set summary=summary || ' Test.' where id=(
      select id from public.self_host_apps where published and self_hosting_status='self_hostable' limit 1)`);
  }));
}

test('application function grants include all newly created category functions', { skip: !enabled }, async () => transaction(async db => {
  const functions = ['stack127_app_category_count(text)', 'stack127_check_app_category_publication()',
    'stack127_remove_published_app_category_links()', 'stack127_touch_directory_records()'];
  const roles = ['service_role'];
  if ((await db.query("select 1 from pg_catalog.pg_roles where rolname='stack127_app'")).rowCount) roles.push('stack127_app');
  for (const role of roles) for (const fn of functions) {
    const result = await db.query('select has_function_privilege($1,$2,\'EXECUTE\') as allowed', [role, `public.${fn}`]);
    assert.equal(result.rows[0].allowed, true, `${role}: ${fn}`);
  }
}));
