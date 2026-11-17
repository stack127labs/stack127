import test from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { compile, run } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';
import { currentText, resolvePageText } from '../../lib/current-text.mjs';
import remarkCurrentText from '../../lib/remark-current-text.mjs';
import { inspectPublishedHtml } from '../../scripts/stack127/publishing/verify.mjs';

const now = new Date('2026-11-17T12:00:00Z');
test('only year and month resolve, including marked text', () => {
  assert.equal(currentText('<mark>[month]</mark> [year] [year] [day]', now), '<mark>November</mark> 2026 2026 [day]');
  assert.equal(currentText('Plain text', now), 'Plain text');
  assert.equal(currentText('[month] [year]', new Date('2027-01-01T00:30:00+01:00')), 'December 2026');
  assert.equal(currentText('[month] [year]', new Date('2026-12-31T23:30:00-01:00')), 'January 2027');
});
test('raw snapshots remain unchanged and can resolve again across a year boundary', () => {
  const row = { title: '[year]', page: { meta_title: '[month]' }, tools: [{ card_description: '[year]' }], slug: '[year]', cover_image_url: '/[year]', updated_at: now };
  assert.equal(resolvePageText(row, now).tools[0].card_description, '2026');
  assert.equal(resolvePageText(row, new Date('2027-01-01Z')).title, '2027');
  assert.equal(row.title, '[year]');
  assert.equal(resolvePageText(row, now).slug, '[year]');
  assert.equal(resolvePageText(row, now).cover_image_url, '/[year]');
});
test('MDX paragraphs, headings, lists, tables and link text resolve at render; code, URLs and real year links stay intact', async () => {
  const source = '# In [year]\n\nNow [month] [year]. `[year]`\n\n- In [year]\n\n| Time |\n| --- |\n| [month] |\n\n[year](/x) [In [year]](/[year])\n\n```txt\n[month] [year]\n```';
  const compiled = await compile(source, { outputFormat: 'function-body', remarkPlugins: [remarkGfm, remarkCurrentText] });
  const { default: Content } = await run(String(compiled), runtime);
  const html = renderToStaticMarkup(runtime.jsx(Content, { components: { CurrentDateText: ({ text }) => currentText(text, now) } }));
  assert.match(html, /<h1>In 2026<\/h1>/);
  assert.match(html, /Now November 2026/);
  assert.match(html, /<li>In 2026<\/li>/);
  assert.match(html, /<td>November<\/td>/);
  assert.match(html, /<a href="\/x">year<\/a>/);
  assert.match(html, /<a href="\/%5Byear%5D">In 2026<\/a>/);
  assert.match(html, /<code>\[year\]<\/code>/);
  assert.match(html, /\[month\] \[year\]\n<\/code>/);
});
test('course Markdown uses the same text rules', async () => {
  const parser = unified().use(remarkParse).use(remarkCurrentText, { markdown: true });
  const tree = await parser.run(parser.parse('In [year]. `[year]` [year](/x)'));
  const nodes = tree.children[0].children;
  assert.equal(nodes[0].value, `In ${currentText('[year]')}. `);
  assert.equal(nodes[1].value, '[year]');
  assert.equal(nodes.at(-1).url, '/x');
});
test('publisher compares resolved fields while preserving stored tokens', () => {
  const title = currentText('[month] [year]');
  const state = { family: 'directory', slug: 'example', registry: { meta_title: '[month] [year]', meta_description: '[year]', is_indexable: true }, content: { title: '<mark>[month]</mark> [year]' } };
  inspectPublishedHtml(`<title>${title}</title><h1>${title}</h1><meta name="description" content="${currentText('[year]')}"><meta name="stack127-content-revision" content="rev"><link rel="canonical" href="https://stack127.com/example">`, state, 'rev', 'https://stack127.com');
  assert.equal(state.registry.meta_title, '[month] [year]');
});
