import assert from 'node:assert/strict';
import test from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createLocalDiscoveryStore } from '../../../scripts/ad-networks/local-discovery-store.mjs';
import { runDiscoverySources } from '../../../scripts/ad-networks/discovery-run.mjs';
import { isStorageError } from '../../../scripts/ad-networks/storage-errors.mjs';
import { downloadToFile } from '../../../scripts/ad-networks/discovery-download.mjs';
import { fetchWithRetry, checkRobots, sellerDomainsStream } from '../../../scripts/ad-networks/lib.mjs';
import { sharedHostSlot, closeSharedFetchSlots } from '../../../scripts/ad-networks/shared-fetch-slots.mjs';
import { EventEmitter } from 'node:events';
import { PassThrough, Readable } from 'node:stream';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const sources = ['one', 'two'].map(key => ({ key, url: `https://${key}.example/sellers.json` }));
function fixture(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  db.exec(`create table source_state(source_key text primary key, source_url text, etag text, last_modified text,
    candidate_count integer, completed_at text, last_status text, last_error text);
    create table publishers(id integer primary key, normalized_domain text unique, display_domain text,
    first_seen_at text,last_discovered_at text,next_check_at text,verification_priority integer,created_at text,updated_at text);
    create table publisher_sources(publisher_id integer,source_key text,source_url text,domain_as_supplied text,
    license_attribution text,first_seen_at text,last_seen_at text,primary key(publisher_id,source_key));`);
  const store = createLocalDiscoveryStore(db);
  const warnings = [];
  const run = (failed, { unchanged = false, storageError = false } = {}) => {
    const state = store.readState(); // Reload as a separate cron invocation would.
    return runDiscoverySources({ sources, state,
      async processSource(source) {
        if (failed.includes(source.key)) throw Object.assign(new Error('HTTP 406'), { discoveryStorage: storageError });
        if (!unchanged) state[source.key] = { url: source.url, candidates: 12, completedAt: '2026-11-14T00:00:00Z', etag: 'one' };
        return { source: source.key, status: unchanged ? 'unchanged' : 'applied' };
      },
      saveSuccess: (source, entry) => store.saveSourceState(source.key, entry),
      saveFailure: (source, error) => store.saveSourceFailure(source, error),
      log() {}, warn: line => warnings.push(line),
    });
  };
  return { run, store, warnings };
}

test('one upstream failure warns; a second failure of that source on the next run fails', async t => {
  const f = fixture(t);
  assert.equal(await f.run(['one']), 0);
  assert.match(f.warnings.join('\n'), /WARNING: discovery source one failed once/);
  assert.equal(await f.run(['one']), 1);
  assert.match(f.warnings.join('\n'), /ERROR: discovery source one failed on consecutive runs/);
});

test('every source failing fails even on the first run', async t => {
  assert.equal(await fixture(t).run(['one', 'two']), 1);
});

test('successful 304 clears failure state without losing feed metadata', async t => {
  const f = fixture(t);
  assert.equal(await f.run([]), 0);
  assert.equal(await f.run(['one']), 0);
  assert.equal(await f.run([], { unchanged: true }), 0);
  assert.equal(f.store.readState().one.etag, 'one');
  assert.equal(f.store.readState().one.candidates, 12);
  assert.equal(f.store.readState().one.lastStatus, 'complete');
  assert.equal(await f.run(['one']), 0);
});

test('failure history belongs to each source, not the overall job', async t => {
  const f = fixture(t);
  assert.equal(await f.run(['one']), 0);
  assert.equal(await f.run(['two']), 0);
  assert.equal(await f.run(['one']), 0);
});

test('database writes and failure-state persistence errors always stop the run', async t => {
  await assert.rejects(fixture(t).run(['one'], { storageError: true }), /HTTP 406/);
  await assert.rejects(runDiscoverySources({ sources, state: {},
    processSource() { throw new Error('upstream'); },
    saveFailure() { throw new Error('disk full'); }, saveSuccess() {},
  }), /disk full/);
});

// A healthy second source must never hide a failure of local infrastructure.
async function runWithFailure(fail) {
  let healthySourceRan = false, savedFailure = false;
  const promise = runDiscoverySources({ sources, state: {},
    async processSource(source) {
      if (source.key === 'one') return fail();
      healthySourceRan = true;
      return { status: 'complete' };
    },
    saveSuccess() {}, saveFailure() { savedFailure = true; }, log() {}, warn() {},
  });
  await assert.rejects(promise, error => {
    assert.equal(healthySourceRan, false);
    assert.equal(savedFailure, false);
    return isStorageError(error);
  });
}

for (const code of ['ENOSPC', 'EDQUOT', 'EIO', 'EROFS', 'EACCES', 'EMFILE', 'ERR_SQLITE_ERROR']) {
  test(`local ${code} stays fatal through error wrappers`, async () => {
    await runWithFailure(() => {
      throw new Error('storage wrapper', { cause: Object.assign(new Error('disk failure'), { code }) });
    });
  });
}

test('fetch retry preserves ENOSPC and stops without network retries', async t => {
  let attempts = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    attempts++;
    throw new Error('fetch storage failure', { cause: Object.assign(new Error('disk full'), { code: 'ENOSPC' }) });
  });
  await runWithFailure(() => fetchWithRetry(sources[0].url));
  assert.equal(attempts, 1);
});

const downloadOptions = { maxTimeSeconds: 1, accept: 'application/json' };
function curlResult(code) {
  return () => {
    const child = new EventEmitter();
    child.stdout = new PassThrough(); child.stderr = new PassThrough();
    process.nextTick(() => {
      child.stdout.end('200 https://one.example/sellers.json');
      child.emit('close', code);
    });
    return child;
  };
}

test('temp creation, downloaded-header reads, and curl output writes stay fatal', async () => {
  const noSpace = () => { throw Object.assign(new Error('disk full'), { code: 'ENOSPC' }); };
  for (const dependencies of [
    { mkdtemp: noSpace },
    { spawn: curlResult(0), readFile: noSpace },
    { spawn: curlResult(23) },
  ]) {
    await runWithFailure(() => downloadToFile(sources[0], null, downloadOptions, dependencies));
  }
});

test('downloaded body read failures stay fatal through the seller parser', async () => {
  await runWithFailure(async () => {
    const response = await downloadToFile(sources[0], null, downloadOptions, {
      spawn: curlResult(0), readFile: async () => '',
    });
    try { for await (const candidate of sellerDomainsStream(response.body)) void candidate; }
    finally { await response.cleanup(); }
  });
  await runWithFailure(async () => {
    const body = Readable.from((async function* () {
      throw Object.assign(new Error('disk full'), { code: 'ENOSPC' });
    })());
    for await (const candidate of sellerDomainsStream(body)) void candidate;
  });
});

test('HTTP and curl connection errors remain isolated source failures', async () => {
  for (const fail of [
    () => downloadToFile(sources[0], null, downloadOptions, { spawn: curlResult(22) }),
    () => downloadToFile(sources[0], null, downloadOptions, { spawn: curlResult(7) }),
    () => { throw new Error('fetch failed', { cause: Object.assign(new Error('connection reset'), { code: 'ECONNRESET' }) }); },
  ]) {
    let healthySourceRan = false;
    assert.equal(await runDiscoverySources({ sources, state: {},
      processSource(source) { if (source.key === 'one') return fail(); healthySourceRan = true; return {}; },
      saveSuccess() {}, saveFailure() {}, log() {}, warn() {},
    }), 0);
    assert.equal(healthySourceRan, true);
  }
});

test('robots throttle database open, acquire and release failures stay fatal', async t => {
  const directory = mkdtempSync(join(tmpdir(), 'discovery-throttle-'));
  t.after(() => { closeSharedFetchSlots(); rmSync(directory, { recursive: true, force: true }); });
  const dependencies = { lookup: async () => [{ address: '8.8.8.8', family: 4 }] };
  const throttleFailure = () => { throw new Error('throttle transaction failure'); };
  for (const sharedSlot of [
    host => sharedHostSlot(host, { databasePath: directory }), // Real SQLite open failure.
    throttleFailure,
    async () => throttleFailure,
  ]) {
    // Cover both a no-body response and release after streaming a robots body.
    for (const status of [404, 200]) {
      await runWithFailure(() => checkRobots(sources[0].url, {
        ...dependencies, sharedHostSlot: sharedSlot,
        fetch: async () => status === 404 ? new Response(null, { status }) : new Response('User-agent: *\nAllow: /'),
      }));
    }
  }
});
