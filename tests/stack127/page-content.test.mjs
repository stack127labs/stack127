import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { convertMarkdown, pageContentFiles, splitDirectorySections } from '../../scripts/stack127/content/convert-markdown.mjs';
import { checkMdx, checkContentFiles } from '../../scripts/stack127/content/check-mdx.mjs';
import { findRouteFolder, parseExportArgs, readPageContent, writeContentFiles } from '../../scripts/stack127/content/export-page-content.mjs';

function valid(markdown) { assert.deepEqual(checkMdx(markdown), []); }

test('converts all callout tones, optional titles, and nested Markdown', () => {
  for (const [tone, component] of Object.entries({ NOTE: 'Note', WARNING: 'Warning', TIP: 'Tip', FORMULA: 'Formula', EXAMPLE: 'Example' })) {
    const result = convertMarkdown(`> [!${tone}] A "title" & {value}\n>\n> **Keep this** and [a link](/example).\n>\n> - First\n> - Second`);
    assert.match(result, new RegExp(`<${component} title="A &#34;title&#34; &#38; &#123;value&#125;">`));
    assert.match(result, /\*\*Keep this\*\* and \[a link\]\(\/example\)/);
    assert.match(result, /- First\n- Second/);
    valid(result);
  }
  const untitled = convertMarkdown('> [!TIP]\n> Start here.');
  assert.match(untitled, /^<Tip>\n\nStart here\.\n\n<\/Tip>/);
  valid(untitled);
  const nested = convertMarkdown('> [!NOTE]\n> Outer\n>\n> > [!WARNING]\n> > Inner');
  assert.match(nested, /<Warning>/);
  valid(nested);
});

test('converts definition lists into Terms and Term components', () => {
  const result = convertMarkdown('Churn\n: Customers who leave.\n\nGross margin\n: Revenue less costs.');
  assert.match(result, /^<Terms>/);
  assert.equal((result.match(/<Terms>/g) ?? []).length, 1);
  assert.match(result, /<Term name="Churn">\n\nCustomers who leave\./);
  assert.match(result, /<Term name="Gross margin">\n\nRevenue less costs\./);
  valid(result);
});

test('preserves escaped text in terms and converts nested callouts without breaking lists or quotes', () => {
  const terms = convertMarkdown('Term\n: A \\*literal\\* and {value}.');
  assert.ok(terms.includes('A \\*literal\\* and &#123;value&#125;.'));
  valid(terms);
  const quote = convertMarkdown('> Quote\n>\n> > [!NOTE] Nested\n> > Body');
  assert.match(quote, /> <Note title="Nested">/);
  valid(quote);
  const list = convertMarkdown('- Item\n\n  > [!NOTE] Nested\n  > Body');
  assert.match(list, /  <Note title="Nested">/);
  valid(list);
  valid(convertMarkdown('import data from a spreadsheet.\n\nexport a CSV.'));
  assert.throws(() => convertMarkdown('> [!NOTE] **Formatted**\n> Body'), /Callout titles with inline formatting/);
});

test('converts marker art and escapes quoted alt text', () => {
  const result = convertMarkdown('![A "quote" & {x}](marker-art://catalog/test)');
  assert.match(result, /^<MarkerArt figure="catalog\/test" alt="A &#34;quote&#34; &#38; &#123;x&#125;" \/>/);
  valid(result);
  const reference = convertMarkdown('![A figure][art]\n\n[art]: marker-art://test');
  assert.match(reference, /<MarkerArt figure="test" alt="A figure" \/>/);
  valid(reference);
});

test('escapes text expressions and angles while preserving code byte for byte', () => {
  const source = 'Use {amount} when x < 3, and \\{literal\\}.\n\n`<span>{code}</span>`\n\n```js\nconst value = { html: "<span>" };\n```\n\n    {indented} <code>\n';
  const result = convertMarkdown(source);
  assert.match(result, /Use &#123;amount&#125; when x &#60; 3/);
  assert.ok(result.includes('\\{literal\\}'));
  assert.ok(result.includes('`<span>{code}</span>`'));
  assert.ok(result.includes('```js\nconst value = { html: "<span>" };\n```'));
  assert.ok(result.includes('```\n{indented} <code>\n```'));
  valid(result);
});

test('preserves GFM tables and makes angle autolinks safe for MDX', () => {
  const result = convertMarkdown('## Data\n\n| Name | Value |\n| --- | --- |\n| braces | {x} |\n\n<https://example.com> and <me@example.com>');
  assert.match(result, /\| braces \| &#123;x&#125; \|/);
  assert.match(result, /\[https:\/\/example.com\]\(https:\/\/example.com\)/);
  assert.match(result, /\[me@example.com\]\(mailto:me@example.com\)/);
  valid(result);
});

test('splits directory sections using parsed comments and ignores markers in code', () => {
  const input = '<!-- section:copy-1 -->\n## First\n\n```html\n<!-- section:fake -->\n```\n\n<!-- section:copy-2 -->\n## Second';
  assert.deepEqual(splitDirectorySections(input).map(section => section.id), ['copy-1', 'copy-2']);
  const files = pageContentFiles({ slug: 'test', page_family: 'directory', intro_markdown: 'Intro', content_markdown: input });
  assert.deepEqual(Object.keys(files), ['intro.mdx', 'copy-1.mdx', 'copy-2.mdx']);
  assert.match(files['copy-1.mdx'], /<!-- section:fake -->/);
  Object.values(files).forEach(valid);
  assert.equal(splitDirectorySections('## Plain article'), null);
  assert.throws(() => splitDirectorySections('Lost text\n\n<!-- section:one -->\nBody'), /:1: Content before/);
  assert.throws(() => splitDirectorySections('<!-- section:one -->\nBody\n\n<!-- section:one -->\nBody'), /:4: Duplicate/);
  assert.throws(() => splitDirectorySections('<!-- section:intro -->\nBody'), /reserved directory section/);
});

test('reports unsupported syntax with source and original line', () => {
  const cases = [
    ['Fine\n\n```chart-bar\n{}\n```', /fixture:3: Chart fences/],
    ['> [!NOTE]body\n> Next', /fixture:1: Add a space/],
    ['Fine\n\n<div>Body</div>', /fixture:3: Raw HTML/],
    ['Fine\n\n<!-- unknown -->', /fixture:3: Unknown HTML comment/],
    ['> [!NOTE]\n>\n> <span>Body</span>', /fixture:3: Raw HTML/],
    ['![No title](marker-art://key "title")', /fixture:1: Marker art image titles/],
  ];
  for (const [source, error] of cases) assert.throws(() => convertMarkdown(source, { source: 'fixture' }), error);
  assert.throws(() => pageContentFiles({ slug: 'fixture', page_family: 'directory', intro_markdown: 'Intro', content_markdown: '<!-- section:one -->\nBody\n\n<!-- unknown -->' }), /fixture\/article:4: Unknown HTML comment/);
});

test('writes tool usage only when present and an article for unsectioned directories', () => {
  const page = { slug: 'test', page_family: 'tool', intro_markdown: 'Intro', content_markdown: 'Article' };
  assert.deepEqual(Object.keys(pageContentFiles(page)), ['intro.mdx', 'article.mdx']);
  assert.deepEqual(Object.keys(pageContentFiles({ ...page, usage_markdown: 'Use it' })), ['intro.mdx', 'usage.mdx', 'article.mdx']);
  assert.deepEqual(Object.keys(pageContentFiles({ ...page, page_family: 'directory' })), ['intro.mdx', 'article.mdx']);
});

test('checks headings, HTML, attributes, imports, and the allowed component list', () => {
  for (const [content, error] of [
    ['# Title', /content.mdx:1: Content cannot have an h1/],
    ['## First\n\n#### Skip', /content.mdx:3: Heading skips a level/],
    ['### Missing h2', /content.mdx:1: Heading skips a level/],
    ['<div>HTML</div>', /content.mdx:1: Raw HTML/],
    ['<Note style={{color: "red"}}>Body</Note>', /style= is not allowed/],
    ['<Note\n className="x">Body</Note>', /content.mdx:2: className= is not allowed/],
    ['import Thing from "x"\n\n## Heading', /cannot import or export/],
    ['export const x = 1', /cannot import or export/],
    ['<Unknown />', /Component is not allowed: Unknown/],
    ['<Note {...props} />', /Spread attributes cannot be checked/],
  ]) assert.ok(checkMdx(content).some(message => error.test(message)), checkMdx(content).join('\n'));
  valid('## Heading\n\n### Detail\n\n## Next\n\n<UiChart spec={{kind: "bar"}} />\n\n`<div style="x">`\n\n```js\nimport Thing from "x";\nexport const x = {};\n```');
  assert.match(checkMdx('<Note>')[0], /Invalid MDX/);
});

test('core MDX content gate', async () => {
  assert.deepEqual(await checkContentFiles(), []);
});

test('scans only content MDX, passes empty trees, and reports the failing file', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'stack127-mdx-check-'));
  try {
    assert.deepEqual(await checkContentFiles(root), []);
    await mkdir(path.join(root, 'route/content'), { recursive: true });
    await writeFile(path.join(root, 'route/other.mdx'), '# Ignored');
    const file = path.join(root, 'route/content/article.mdx');
    await writeFile(file, 'Intro\n\n# Wrong');
    assert.match((await checkContentFiles(root))[0], new RegExp(`${file}:3:`));
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('refuses overwrites before writing other files; force is explicit', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'stack127-mdx-export-'));
  try {
    await writeFile(path.join(root, 'article.mdx'), 'Existing');
    await assert.rejects(writeContentFiles({ 'intro.mdx': 'New', 'article.mdx': 'New' }, root), /Refusing to overwrite/);
    await assert.rejects(readFile(path.join(root, 'intro.mdx')), { code: 'ENOENT' });
    assert.equal(await readFile(path.join(root, 'article.mdx'), 'utf8'), 'Existing');
    await writeContentFiles({ 'article.mdx': 'New' }, root, { force: true });
    assert.equal(await readFile(path.join(root, 'article.mdx'), 'utf8'), 'New');
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('finds one route and rejects missing or ambiguous routes', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'stack127-mdx-routes-'));
  try {
    await mkdir(path.join(root, '(tools)/pilot'), { recursive: true });
    await writeFile(path.join(root, '(tools)/pilot/page.tsx'), '');
    assert.equal(await findRouteFolder('pilot', root), path.join(root, '(tools)/pilot'));
    await assert.rejects(findRouteFolder('missing', root), /found 0/);
    await mkdir(path.join(root, '(directories)/pilot'), { recursive: true });
    await writeFile(path.join(root, '(directories)/pilot/page.tsx'), '');
    await assert.rejects(findRouteFolder('pilot', root), /found 2/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('validates export arguments and defaults to development', () => {
  assert.deepEqual(parseExportArgs(['--slug', 'pilot']), { slug: 'pilot', environment: 'development' });
  assert.equal(parseExportArgs(['--slug=pilot', '--environment=production', '--out', '/tmp/pilot', '--force']).force, true);
  for (const args of [[], ['--slug', '../x'], ['--slug', 'x', '--environment', 'staging'], ['--apply'], ['--slug'], ['--force=false']]) {
    assert.throws(() => parseExportArgs(args));
  }
});

test('database exports use a read-only transaction and roll back on success and failure', async () => {
  for (const fail of [false, true]) {
    let readOnly = false;
    let rolledBack = false;
    let released = false;
    const client = {
      async query(sql, values) {
        if (sql.startsWith('begin')) { assert.match(sql, /read only$/); readOnly = true; return {}; }
        if (sql === 'rollback') { rolledBack = true; return {}; }
        assert.ok(readOnly);
        assert.ok(sql.startsWith('select '));
        if (sql.includes('stack127_pages')) { assert.deepEqual(values, ['pilot']); return { rows: [{ id: 1, slug: 'pilot', page_family: 'tool' }] }; }
        if (fail) throw new Error('Read failed');
        return { rows: [{ intro_markdown: 'Intro', content_markdown: 'Article' }] };
      },
      release() { released = true; },
    };
    const operation = readPageContent({ connect: async () => client }, 'pilot');
    if (fail) await assert.rejects(operation, /Read failed/);
    else assert.equal((await operation).slug, 'pilot');
    assert.ok(rolledBack);
    assert.ok(released);
  }
});
