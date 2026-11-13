import test from 'node:test';
import assert from 'node:assert/strict';
import { countAppCategories, publishedAppCategories, appCategoryStaticParams } from '../../lib/app-category-model.ts';
import { targetsForEvents } from '../../scripts/stack127/cache/targets.mjs';

test('multi-category counts count each app once, preserve zeroes, and include all records', () => {
  const apps = Array.from({ length: 16 }, (_, i) => ({ categories: i ? ['large'] : ['large', 'small', 'small'] }));
  assert.deepEqual(countAppCategories(apps, [{ slug: 'large', name: 'Large' }, { slug: 'small', name: 'Small' }, { slug: 'empty', name: 'Empty' }], app => app.categories), [
    { slug: 'large', name: 'Large', count: 16 }, { slug: 'small', name: 'Small', count: 1 }, { slug: 'empty', name: 'Empty', count: 0 },
  ]);
});

test('only exact published directory children at the 15-app threshold get links and static params, including noindex previews', () => {
  const categories = ['draft','small','ready','noindex','wrong-family','inherited'].map(slug => ({ slug, name: slug, count: slug === 'small' ? 14 : 15 }));
  const pages = ['draft','small','ready','noindex','wrong-family'].map(slug => ({ slug: `cli-apps/categories/${slug}`, is_published: slug !== 'draft', is_indexable: slug !== 'noindex', page_family: slug === 'wrong-family' ? 'tool' : 'directory' }));
  pages.push({ slug: 'cli-apps', is_published: true, page_family: 'directory' });
  const links = publishedAppCategories('cli-apps', categories, pages);
  assert.deepEqual(links.map(entry => entry.href), ['/cli-apps/categories/ready','/cli-apps/categories/noindex']);
  assert.deepEqual(appCategoryStaticParams(links), [{ category: 'ready' }, { category: 'noindex' }]);
});

test('category publication changes refresh hub links, registry, sitemap, and family purge tags', () => {
  for (const directory of ['self-host-apps','cli-apps']) {
    const result = targetsForEvents([{ entity_type: 'page', slug: `${directory}/categories/example` }]);
    assert.ok(result.paths.includes(`/${directory}`));
    assert.ok(result.paths.includes(`/${directory}/categories/example`));
    assert.ok(result.paths.includes('/sitemap.xml'));
    assert.ok(result.edgeTags.includes(directory === 'cli-apps' ? 'cli-apps-catalog' : 'self-host-catalog'));
    assert.ok(result.nextTags.includes('stack127-home-pages'));
  }
});

test('single-category publication smoke uses the rendered heading without title markup or sibling navigation', async () => {
  const { categorySmokeCheck } = await import('../../scripts/stack127/app-categories/categories.mjs');
  const check = categorySmokeCheck('cli-apps', 'development', 'Tools for <mark>development</mark>');
  assert.equal(check.path, '/cli-apps/categories/development');
  assert.equal(check.text, 'Tools for development');
  const { htmlText } = await import('../../scripts/stack127/publishing/verify.mjs');
  const punctuated = '100+ <mark>Tools</mark>: runtimes and editors';
  assert.equal(categorySmokeCheck('cli-apps', 'development', punctuated).text, htmlText(`<h1>${punctuated}</h1>`));
  assert.throws(() => categorySmokeCheck('cli-apps', 'development', '<mark></mark>'), /Missing category heading/);
});
