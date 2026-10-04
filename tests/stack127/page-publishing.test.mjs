import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, writeFile, symlink, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { publishingArgs, resolveCopy, validatePlan } from '../../scripts/stack127/publishing/cli.mjs';
import { checkDatabaseRequirements, readinessSql, routeMatches } from '../../scripts/stack127/publishing/readiness.mjs';
import { checkLiveRelease, inspectPublishedHtml, verifyPublicPages } from '../../scripts/stack127/publishing/verify.mjs';
import { publicationEvent } from '../../scripts/stack127/publishing/github.mjs';

const sha = 'a'.repeat(40);
const state = {
  slug: 'example', family: 'directory',
  registry: { label: 'Example', meta_title: 'Example directory', meta_description: 'Compare examples & choices.', is_published: true, cover_image_url: null, page_type: 'CollectionPage', sitemap_priority: 0.5 },
  content: { title: 'Find <mark>examples</mark>', intro_markdown: 'Choose an example.', content_markdown: null, card_name: 'Examples', card_description: 'Compare examples.', card_icon_key: null, card_art_key: null },
};
const revision = '2026-10-04T00:00:00.000Z';
const requirements = { route: 'app/(site)/(directories)/example/page.tsx', assets: [], checks: [], smoke: [], records: { kind: 'code', files: ['lib/examples.ts'] } };
const plan = () => ({ schema_version: 1, kind: 'directories', environment: 'production', source_commit: sha, pages: [{ slug: 'example', family: 'directory', before: null, after: structuredClone(state), requirements }] });
const html = () => `<html><head><title>Example directory | stack127</title><meta name="description" content="Compare examples &amp; choices."><meta name="robots" content="index, follow"><meta name="stack127-content-revision" content="${revision}"><link rel="canonical" href="https://stack127.com/example"></head><body><h1>Find <mark>examples</mark></h1></body></html>`;

test('production mutations require explicit environment, confirmation, and exact release SHA', () => {
  assert.throws(() => publishingArgs(['apply', '--plan', 'p', '--environment', 'production']), /confirmation|confirm/);
  assert.throws(() => publishingArgs(['apply', '--plan', 'p', '--environment', 'production', '--confirm', 'stack127-production']), /release-sha/);
  assert.throws(() => publishingArgs(['dispatch', '--plan', 'p']), /production/);
  assert.throws(() => publishingArgs(['apply', '--plan', 'p', '--force']), /Unsupported/);
  assert.throws(() => publishingArgs(['apply', '--plan', 'p', '--environment', 'production', '--environment', 'development']), /repeated/);
  assert.equal(publishingArgs(['apply', '--plan', 'p', '--environment', 'production', '--confirm', 'stack127-production', '--release-sha', sha]).environment, 'production');
});

test('frozen plans cannot be applied to another family or environment', () => {
  assert.throws(() => validatePlan(plan(), 'tools', 'production'), /invalid/);
  assert.throws(() => validatePlan(plan(), 'directories', 'development'), /invalid/);
  const bad = plan();
  bad.pages[0].after.registry.database_url = 'unexpected';
  assert.throws(() => validatePlan(bad, 'directories', 'production'), /Unknown/);
  const wrongIdentity = plan();
  wrongIdentity.pages[0].after.slug = 'elsewhere';
  assert.throws(() => validatePlan(wrongIdentity, 'directories', 'production'), /identity/);
});

test('GitHub publication events must agree on repository, task, commit and environment', () => {
  const event = { repository: { full_name: 'stack127labs/stack127' }, deployment: { id: 42, environment: 'stack127-page-publication', task: 'page-publication', sha, ref: sha, payload: { release_sha: sha, plan: plan() } } };
  assert.equal(publicationEvent(event).deploymentId, 42);
  assert.throws(() => publicationEvent({ ...event, repository: { full_name: 'elsewhere/repo' } }), /not a stack127/);
  assert.throws(() => publicationEvent({ ...event, deployment: { ...event.deployment, sha: 'b'.repeat(40) } }), /agree/);
});

test('readiness checks reject batches with missing data and release their read-only transaction', async () => {
  const queries = [];
  let released = false;
  const pool = { connect: async () => ({ query: async sql => { queries.push(sql); return { rows: sql.startsWith('select *') ? [{ ready: false }] : [] }; }, release: () => { released = true; } }) };
  const pages = [{ slug: 'example', requirements: { ...requirements, checks: [{ name: 'Reviewed records', sql: 'select false as ready', params: [] }] } }];
  await assert.rejects(checkDatabaseRequirements(pool, pages), /Reviewed records/);
  assert.match(queries[0], /read only/);
  assert.equal(queries.at(-1), 'rollback');
  assert.equal(released, true);
  assert.throws(() => readinessSql('update records set approved=true'), /SELECT/);
  assert.throws(() => readinessSql('select true as ready; delete from records'), /SELECT/);
});

test('static and dynamic directory route matching respects complete path segments', () => {
  assert.equal(routeMatches('app/(site)/(directories)/example/[slug]/page.tsx', 'example/item'), true);
  assert.equal(routeMatches('app/(site)/(directories)/example/[slug]/page.tsx', 'example/item/other'), false);
  assert.equal(routeMatches('app/(site)/(tools)/(dns)/dns-lookup/page.tsx', 'dns-lookup'), true);
});

test('a healthy site with another build cannot satisfy the publication gate', async () => {
  await assert.rejects(checkLiveRelease('https://stack127.com', sha, { fetchImplementation: async () => new Response(JSON.stringify({ ok: true, build: { sha: 'b'.repeat(40) } })) }), /not reached/);
  await checkLiveRelease('https://stack127.com', sha, { fetchImplementation: async () => new Response(JSON.stringify({ ok: true, build: { sha } })) });
});

test('public verification checks metadata, visible heading and the current cache revision', () => {
  inspectPublishedHtml(html(), state, revision, 'https://stack127.com');
  assert.throws(() => inspectPublishedHtml(html().replace(revision, '2026-09-01T00:00:00.000Z'), state, revision, 'https://stack127.com'), /older revision/);
  assert.throws(() => inspectPublishedHtml(html().replace('index, follow', 'noindex, follow'), state, revision, 'https://stack127.com'), /indexing/);
  assert.throws(() => inspectPublishedHtml(html().replace('Find <mark>examples</mark>', 'Old heading'), state, revision, 'https://stack127.com'), /stale/);
  assert.throws(() => inspectPublishedHtml(html().replace('index, follow', 'none'), state, revision, 'https://stack127.com'), /indexing/);
  assert.throws(() => inspectPublishedHtml(html().replace('Example directory | stack127', 'Unrelated Example directory suffix'), state, revision, 'https://stack127.com'), /stale/);
});

test('a repository URL update requires the rendered repository link', () => {
  const tool = { ...state, family: 'tool', content: { ...state.content, stack127_repo_url: 'https://github.com/stack127labs/example' } };
  assert.throws(() => inspectPublishedHtml(html(), tool, revision, 'https://stack127.com'), /repository link/);
  inspectPublishedHtml(html() + '<a href="https://github.com/stack127labs/example">Source on GitHub</a>', tool, revision, 'https://stack127.com');
});

test('committed data is not reported complete when the public page or sitemap is stale', async () => {
  const pool = { query: async () => ({ rows: [{ slug: 'example', row_updated_at: revision }] }) };
  const fetchImplementation = async url => new Response(url.endsWith('sitemap.xml') ? '<urlset></urlset>' : html());
  await assert.rejects(verifyPublicPages(pool, plan().pages, { site: 'https://stack127.com', waitSeconds: 0, fetchImplementation }), /Database changes may already be saved/);
  await verifyPublicPages(pool, plan().pages, { site: 'https://stack127.com', waitSeconds: 0, fetchImplementation: async url => new Response(url.endsWith('sitemap.xml') ? '<urlset><url><loc>https://stack127.com/example</loc></url></urlset>' : html()) });
});

test('restored new pages must be unpublished and absent from the sitemap', async () => {
  const pool = { query: async () => ({ rows: [{ slug: 'example', row_updated_at: revision }] }) };
  await verifyPublicPages(pool, plan().pages, { site: 'https://stack127.com', waitSeconds: 0, restore: true, fetchImplementation: async url => url.endsWith('sitemap.xml') ? new Response('<urlset/>') : new Response('Not found', { status: 404 }) });
  await assert.rejects(verifyPublicPages(pool, plan().pages, { site: 'https://stack127.com', waitSeconds: 0, restore: true, fetchImplementation: async () => new Response('<urlset/>') }), /still public/);
});

test('development fetch addresses do not replace production canonicals or sitemap URLs', async () => {
  const pool = { query: async () => ({ rows: [{ slug: 'example', row_updated_at: revision }] }) };
  const addresses = [];
  await verifyPublicPages(pool, plan().pages, { site: 'http://127.0.0.1:3333', waitSeconds: 0, fetchImplementation: async url => {
    addresses.push(url);
    return new Response(url.endsWith('sitemap.xml') ? '<urlset><url><loc>https://stack127.com/example</loc></url></urlset>' : html());
  } });
  assert(addresses.every(url => url.startsWith('http://127.0.0.1:3333/')));
  const copy = structuredClone(state);
  copy.registry.meta_description = "Compare an author's examples.";
  inspectPublishedHtml(html().replace('Compare examples &amp; choices.', "Compare an author's examples."), copy, revision, 'https://stack127.com');
});

test('Markdown file references cannot escape the manifest directory or read non-Markdown files', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'page-copy-'));
  const sibling = await mkdtemp(path.join(os.tmpdir(), 'page-secret-'));
  try {
    await writeFile(path.join(directory, 'copy.md'), 'Reviewed copy.\n');
    await writeFile(path.join(sibling, 'private.md'), 'Private text');
    await symlink(path.join(sibling, 'private.md'), path.join(directory, 'escape.md'));
    await writeFile(path.join(directory, '.env'), 'SYNTHETIC_SECRET=private');
    await symlink(path.join(directory, '.env'), path.join(directory, 'disguised.md'));
    assert.deepEqual(await resolveCopy({ intro_markdown: { $file: 'copy.md' } }, directory), { intro_markdown: 'Reviewed copy.' });
    await assert.rejects(resolveCopy({ intro_markdown: { $file: '/etc/hostname' } }, directory), /relative Markdown/);
    await assert.rejects(resolveCopy({ intro_markdown: { $file: path.relative(directory, path.join(sibling, 'private.md')) } }, directory), /inside/);
    await assert.rejects(resolveCopy({ intro_markdown: { $file: 'escape.md' } }, directory), /inside/);
    await assert.rejects(resolveCopy({ intro_markdown: { $file: '.env.local' } }, directory), /relative Markdown/);
    await assert.rejects(resolveCopy({ intro_markdown: { $file: 'disguised.md' } }, directory), /resolve to a Markdown/);
  } finally { await rm(directory, { recursive: true, force: true }); await rm(sibling, { recursive: true, force: true }); }
});

test('restore verifies saved before copy without requiring after-state smoke text', async () => {
  const old = structuredClone(state);
  old.content.title = 'Old heading';
  const page = { ...plan().pages[0], before: old, requirements: { ...requirements, smoke: [{ path: '/example', text: 'New heading' }] } };
  const pool = { query: async () => ({ rows: [{ slug: 'example', row_updated_at: revision }] }) };
  await verifyPublicPages(pool, [page], { site: 'https://stack127.com', restore: true, waitSeconds: 0, fetchImplementation: async url => new Response(url.endsWith('sitemap.xml') ? '<urlset><url><loc>https://stack127.com/example</loc></url></urlset>' : html().replace('Find <mark>examples</mark>', 'Old heading')) });
});

test('older directory plans must be regenerated when either snapshot omits a card asset field', () => {
  for (const snapshot of ['before', 'after']) {
    for (const field of ['card_icon_key', 'card_art_key']) {
      const older = plan();
      older.pages[0].before = structuredClone(state);
      delete older.pages[0][snapshot].content[field];
      assert.throws(() => validatePlan(older, 'directories', 'production'), /Missing directory content field:.*Regenerate the plan/);
    }
  }
  const missingContent = plan();
  missingContent.pages[0].before = { ...structuredClone(state), content: null };
  assert.equal(validatePlan(missingContent, 'directories', 'production').schema_version, 1);
});
