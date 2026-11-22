import assert from 'node:assert/strict';
import test from 'node:test';
import { request } from '../../scripts/self-host-apps/lib/request.mjs';
import { scheduledAt } from '../../scripts/self-host-apps/ovh/due.mjs';
import { fetchJson } from '../../scripts/self-host-apps/discover-app-catalogs.mjs';

test('missed daily, weekly, monthly and twice-daily occurrences remain due after downtime', () => {
  const now = new Date('2026-11-13T19:03:00Z');
  for (const [job, expected] of [
    ['discovery-github', '2026-11-13T07:02:00Z'],
    ['discovery-lists', '2026-11-08T08:10:00Z'],
    ['discovery-catalogs', '2026-11-08T09:14:00Z'],
    ['discovery-directories', '2026-11-01T10:18:00Z'],
    ['refresh-github', '2026-11-13T07:06:00Z'],
    ['refresh-technical', '2026-11-09T12:26:00Z'],
  ]) assert.equal(scheduledAt(`self-host-${job}`, now), Date.parse(expected));
  assert.equal(scheduledAt('self-host-refresh-github', new Date('2026-11-13T19:06:00Z')), Date.parse('2026-11-13T19:06:00Z'));
  assert.equal(scheduledAt('self-host-refresh-github', new Date('2026-11-13T06:00:00Z')), Date.parse('2026-11-12T19:06:00Z'));
  assert.equal(scheduledAt('self-host-discovery-directories', new Date('2027-01-01T09:00:00Z')), Date.parse('2026-12-01T10:18:00Z'));
});

test('Docker Hub tolerates a short upstream outage without receiving GitHub credentials', async t => {
  const previous = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = 'test-credential';
  t.after(() => previous === undefined ? delete process.env.GITHUB_TOKEN : process.env.GITHUB_TOKEN = previous);
  let attempts = 0;
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.headers.Authorization, undefined);
    assert.ok(options.signal instanceof AbortSignal);
    return ++attempts === 1 ? new Response('', { status: 503 }) : Response.json({ results: [{ repo_name: 'example/app' }] });
  });
  assert.equal((await fetchJson('https://registry.hub.docker.com/v2/search/repositories/?query=self-hosted')).results.length, 1);
  assert.equal(attempts, 2);
});

test('permanent authentication errors fail immediately, transient errors stop after three attempts', async t => {
  let attempts = 0;
  t.mock.method(globalThis, 'fetch', async () => { attempts++; return new Response('', { status: 401 }); });
  await assert.rejects(request('https://example.com'), /HTTP 401/);
  assert.equal(attempts, 1);
  t.mock.method(globalThis, 'fetch', async () => { attempts++; return new Response('', { status: 503 }); });
  await assert.rejects(request('https://example.com'), /HTTP 503/);
  assert.equal(attempts, 4);
});

test('technical evidence reads Docker Hub publisher README through the public API', async t => {
  const { readPrimarySource } = await import('../../scripts/self-host-apps/lib/primary-source.mjs');
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push(url);
    assert.equal(options.headers.Authorization, undefined);
    return Response.json({ full_description: 'Run docker compose up with 2 GB RAM.' });
  });
  for (const host of ['hub.docker.com', 'registry.hub.docker.com']) {
    const source = await readPrimarySource(`https://${host}/r/example/app/`);
    assert.equal(source.text, 'Run docker compose up with 2 GB RAM.');
    assert.equal(source.url, 'https://hub.docker.com/v2/repositories/example/app/');
  }
  assert.ok(calls.every(url => url === 'https://hub.docker.com/v2/repositories/example/app/'));
});

test('an empty Docker Hub description stays unreadable; a missing repo is not a negative fact', async t => {
  const { readPrimarySource } = await import('../../scripts/self-host-apps/lib/primary-source.mjs');
  t.mock.method(globalThis, 'fetch', async () => Response.json({ full_description: '', description: '' }));
  await assert.rejects(readPrimarySource('https://hub.docker.com/r/example/app'), /README is empty/);
  t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  await assert.rejects(readPrimarySource('https://hub.docker.com/r/example/deleted'), /HTTP 404/);
});

test('discovery fails at once on a database write error instead of reporting partial success', async () => {
  const { storeCandidates } = await import('../../scripts/self-host-apps/lib/candidates.mjs');
  let writes = 0;
  const client = { async query() { writes++; throw new Error('missing_column'); } };
  await assert.rejects(storeCandidates(client, [{ source_key: 'one' }, { source_key: 'two' }], { source: 'catalog' }), /Candidate write failed \(catalog\/one\): missing_column/);
  assert.equal(writes, 1);
});

test('renamed GitHub repositories follow API redirects with the token kept on api.github.com', async t => {
  const { githubJson } = await import('../../scripts/self-host-apps/lib/github.mjs');
  const previous = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = 'test-credential';
  t.after(() => previous === undefined ? delete process.env.GITHUB_TOKEN : process.env.GITHUB_TOKEN = previous);
  const urls = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    urls.push(String(url));
    assert.equal(options.redirect, 'manual');
    assert.equal(options.headers.Authorization, 'Bearer test-credential');
    return urls.length === 1
      ? new Response('', { status: 301, headers: { Location: '/repositories/123/readme' } })
      : Response.json({ content: 'README evidence' });
  });
  assert.deepEqual(await githubJson('/repos/old-owner/old-name/readme'), { content: 'README evidence' });
  assert.deepEqual(urls, ['https://api.github.com/repos/old-owner/old-name/readme', 'https://api.github.com/repositories/123/readme']);
});

test('GitHub redirects reject foreign origins, HTTP, credentials, missing locations and loops without retries', async t => {
  const { githubJson } = await import('../../scripts/self-host-apps/lib/github.mjs');
  for (const location of ['https://example.com/steal', 'http://api.github.com/repos/app', 'https://user:pass@api.github.com/repos/app', null]) {
    let calls = 0;
    t.mock.method(globalThis, 'fetch', async () => {
      calls++;
      return new Response('', { status: 302, headers: location ? { Location: location } : {} });
    });
    await assert.rejects(githubJson('/repos/old/app'), /Refusing redirect|missing Location/);
    assert.equal(calls, 1);
  }
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return new Response('', { status: 307, headers: { Location: '/loop' } });
  });
  await assert.rejects(githubJson('/repos/old/app'), /maximum 5/);
  assert.equal(calls, 6);
});

test('catalog GitHub API reads follow repository transfers and block external redirects', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(new URL(url).origin, 'https://api.github.com');
    assert.equal(options.redirect, 'manual');
    return ++calls === 1
      ? new Response('', { status: 301, headers: { Location: '/repositories/123/contents' } })
      : Response.json([{ name: 'app' }]);
  });
  assert.deepEqual(await fetchJson('https://api.github.com/repos/old/app/contents'), [{ name: 'app' }]);
  calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return new Response('', { status: 308, headers: { Location: 'https://example.com' } });
  });
  await assert.rejects(fetchJson('https://api.github.com/repos/old/app/contents'), /Refusing redirect/);
  assert.equal(calls, 1);
});
