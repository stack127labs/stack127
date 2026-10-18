import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { openLocalDatabase } from '../../../scripts/ad-networks/local-db.mjs';
import { uploadSnapshot, downloadSnapshot, validateManifest, checkSnapshot, fileDigest } from '../../../scripts/ad-networks/handoff.mjs';
import { privateStorage, storageConfig } from '../../../scripts/ad-networks/handoff-storage.mjs';
import { bootstrap, bootstrapSteps, consumeRdap, publishRuntimeStatus, assertUnpublished } from '../../../scripts/ad-networks/runtime.mjs';
import { runNicheJob } from '../../../scripts/ad-networks/niche-sort.mjs';
import { lastJobResult, jobCounts } from '../../../scripts/ad-networks/refresh.mjs';

function memoryStorage() {
  const objects = new Map();
  return { objects, ensureBucket: async () => {}, bucket: async () => ({ public: false }),
    async put(path, bytes) { objects.set(path, Buffer.from(bytes)); },
    async get(path) { return objects.get(path); },
    async putJson(path, value) { objects.set(path, Buffer.from(JSON.stringify(value))); },
    async getJson(path) { return objects.has(path) ? JSON.parse(objects.get(path)) : null; } };
}
async function fixture(t, kind = 'seed') {
  const directory = await mkdtemp(join(tmpdir(), 's127-handoff-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, 'source.sqlite'), storage = memoryStorage();
  const db = openLocalDatabase(source); db.close();
  const uploaded = await uploadSnapshot({ kind, environment: 'development', apply: true, 'local-database': source }, { storage });
  const manifest = await storage.getJson(`handoff/${kind}.json`);
  return { directory, source, storage, uploaded, manifest };
}

test('consistent compressed seed uploads a final pointer and installs an exclusive verified SQLite file', async t => {
  const { directory, source, storage, manifest, uploaded } = await fixture(t);
  const destination = join(directory, 'installed.sqlite');
  assert.equal(uploaded.id, manifest.compressed_sha256);
  assert.equal((await downloadSnapshot(storage, manifest, destination)).quick_check, 'ok');
  assert.deepEqual(await fileDigest(destination), { sha256: manifest.sqlite_sha256, bytes: manifest.sqlite_bytes });
  await assert.rejects(downloadSnapshot(storage, manifest, destination), /EEXIST/);
  const db = new DatabaseSync(source); db.exec("update ad_networks set name='Later mutation' where id=1"); db.close();
  checkSnapshot(destination); assert.notDeepEqual(await fileDigest(destination), await fileDigest(source));
});

test('damaged chunks, expanded size, checksums, path traversal and wrong snapshot kinds fail closed', async t => {
  const { directory, storage, manifest } = await fixture(t);
  const part = manifest.parts[0], original = storage.objects.get(part.path);
  storage.objects.set(part.path, Buffer.from('tampered'));
  await assert.rejects(downloadSnapshot(storage, manifest, join(directory, 'bad.sqlite')), /chunk checksum/);
  storage.objects.set(part.path, original);
  await assert.rejects(downloadSnapshot(storage, { ...manifest, sqlite_bytes: 512 }, join(directory, 'expanded.sqlite')), /exceeds manifest/);
  await assert.rejects(downloadSnapshot(storage, { ...manifest, sqlite_sha256: '0'.repeat(64) }, join(directory, 'digest.sqlite')), /SQLite snapshot checksum/);
  assert.throws(() => validateManifest(manifest, 'rdap'), /manifest/);
  assert.throws(() => validateManifest({ ...manifest, parts: [{ ...part, path: '../seed' }] }, 'seed'), /chunk/);
  assert.throws(() => validateManifest({ ...manifest, compressed_bytes: manifest.compressed_bytes + 1 }, 'seed'), /size/);
  await assert.rejects(readFile(join(directory, 'bad.sqlite')), /ENOENT/);
});

test('upload requires explicit production confirmation even with injected transport; plans never connect', async () => {
  await assert.rejects(uploadSnapshot({ environment: 'production', apply: true, kind: 'seed' }, { storage: memoryStorage() }), /confirmation/);
  assert.equal((await uploadSnapshot({ environment: 'development', kind: 'seed' })).applied, false);
  assert.throws(() => storageConfig({ environment: 'development' }, { AD_NETWORKS_RUNTIME_ENVIRONMENT: 'production' }), /mismatch/);
});

test('bootstrap pins the seed, resumes completed steps after failure, and never reseeds a working store', async t => {
  const { directory, storage, manifest } = await fixture(t), steps = [];
  const options = { environment: 'development', database: join(directory, 'data.sqlite'), stateDirectory: join(directory, 'state') };
  await mkdir(options.stateDirectory);
  const deps = { assertUnpublished: async () => {}, step: async name => { steps.push(name); if (name === 'seed-niches') throw Error('network failure'); return { applied: true }; } };
  await assert.rejects(bootstrap(options, storage, deps), /network failure/);
  await storage.putJson('handoff/seed.json', { invalid: 'new pointer must never be adopted' });
  const result = await bootstrap(options, storage, { ...deps, step: async name => { steps.push(name); return { synced: true, revalidated: true }; } });
  assert.equal(result.complete, true); assert.equal(result.seed.id, manifest.id);
  assert.equal(steps.filter(s => s === 'seed-sync').length, 1);
  assert.deepEqual(result.completed_steps, bootstrapSteps);
  await bootstrap(options, storage, { assertUnpublished: () => assert.fail(), step: () => assert.fail() });
  await rm(options.database);
  await assert.rejects(bootstrap(options, storage), /no working database/);
});

test('bootstrap refuses an unmarked preexisting working store', async t => {
  const { directory, source, storage } = await fixture(t);
  await assert.rejects(bootstrap({ database: source, stateDirectory: directory }, storage, { assertUnpublished: async () => {} }), /no bootstrap marker/);
});

test('production activation refuses published pages and always closes its database connection', async () => {
  let ended = 0;
  await assert.rejects(assertUnpublished({ environment: 'production' }, { pool: { query: async () => ({ rows: [{ published: 1 }] }), end: async () => ended++ } }), /unpublished/);
  assert.equal(ended, 1);
});

test('finished RDAP manifests are imported once, retries on lock contention, and leave the working store intact', async t => {
  const { directory, storage, manifest, source } = await fixture(t, 'rdap');
  const options = { environment: 'development', database: source, stateDirectory: directory };
  const digest = await fileDigest(source); let calls = 0;
  const deps = { refresh: async args => { assert.equal(args.job, 'rdap-import'); calls++; return calls === 1 ? { skipped: true } : { synced: true, revalidated: true }; } };
  assert.equal((await consumeRdap(options, storage, deps)).skipped, true);
  assert.equal((await consumeRdap(options, storage, deps)).id, manifest.id);
  assert.equal((await consumeRdap(options, storage, deps)).already_imported, manifest.id);
  assert.equal(calls, 2); assert.deepEqual(await fileDigest(source), digest);
});

test('private status publishes job counts and publication results, never a database URL', async t => {
  const { directory, storage } = await fixture(t);
  await storage.putJson('handoff/seed.json', await storage.getJson('handoff/seed.json'));
  const { progressFile } = await import('../../../scripts/ad-networks/enrichment-store.mjs');
  await progressFile(join(directory, 'scheduler.json'), { platform: { status: 'complete', result: { synced: true, revalidated: true, counts: { collector: { processed: 1 } } } } });
  const value = await publishRuntimeStatus({ environment: 'development', stateDirectory: directory, releaseSha: 'a'.repeat(40), deploymentId: 'test' }, storage);
  assert.equal(value.jobs.platform.result.counts.collector.processed, 1);
  assert.equal((await storage.getJson('status/runtime.json')).jobs.platform.result.revalidated, true);
  assert.doesNotMatch(JSON.stringify(value), /postgresql|SUPABASE_SECRET/);
});

test('niche run records externally readable completion and partial failure results', async () => {
  const storage = memoryStorage(), options = { apply: true, environment: 'development' };
  await runNicheJob(options, { storage, alert: async () => {}, sort: async (_o, deps) => { await deps.onStart(); return { imported: 2, withheld: 1, synced: true, revalidated: true }; } });
  assert.equal((await storage.getJson('status/niche-sort.json')).result.imported, 2);
  const error = Object.assign(Error('revalidation failed'), { jobResult: { imported: 1, synced: true, revalidated: false } });
  await assert.rejects(runNicheJob(options, { storage, alert: async () => {}, sort: async () => { throw error; } }), /revalidation/);
  assert.equal((await storage.getJson('status/niche-sort.json')).result.synced, true);
});

test('collector output extracts final JSON counts and drops arbitrary raw strings', () => {
  assert.deepEqual(lastJobResult('progress\n{\n "processed": 4, "outcomes": {"ok": 3}\n}\n'), { processed: 4, outcomes: { ok: 3 } });
  assert.equal(lastJobResult('{"processed":1,"outcomes":{"platform_found":1}}\n{"review_per_network":{}}').processed, 1);
  assert.deepEqual(jobCounts({ processed: 4, database: 'private', status: 'complete', outcomes: { ok: 3, detail: 'raw' } }), { processed: 4, status: 'complete', outcomes: { ok: 3 } });
});

test('Storage transport refuses public buckets and never logs an API error body', async () => {
  const config = { url: 'https://example.supabase.co', key: 'test', bucket: 'test' };
  await assert.rejects(privateStorage(config, async () => Response.json({ public: true })).bucket(), /private/);
  await assert.rejects(privateStorage(config, async () => Response.json({ message: 'secret-value' }, { status: 403 })).bucket(), error => /HTTP 403/.test(error.message) && !/secret-value/.test(error.message));
  let requests = 0;
  const store = privateStorage(config, async () => { requests++; return Response.json({}); });
  await assert.rejects(store.put('../escape', Buffer.from('x')), /Invalid/); assert.equal(requests, 0);
});

test('multi-chunk snapshots are reassembled in order without an upload size exception', async t => {
  const { directory, source, storage } = await fixture(t);
  const db = new DatabaseSync(source); db.exec('create table payload(value blob); insert into payload values(randomblob(5*1024*1024));'); db.close();
  const result = await uploadSnapshot({ kind: 'seed', environment: 'development', apply: true, 'local-database': source }, { storage });
  assert.ok(result.chunks > 1);
  const manifest = await storage.getJson('handoff/seed.json'), destination = join(directory, 'large.sqlite');
  await downloadSnapshot(storage, manifest, destination);
  assert.deepEqual(await fileDigest(destination), { sha256: manifest.sqlite_sha256, bytes: manifest.sqlite_bytes });
});

test('release guard refuses missing migrations and a stale target catalog before seed writes', async () => {
  for (const applied of [9, 10]) {
    let ended = false;
    const pool = { query: async sql => ({ rows: sql.includes('stack127_pages') ? [{ published: 0 }] : sql.includes('schema_migrations') ? [{ applied }] : [] }), end: async () => { ended = true; } };
    await assert.rejects(assertUnpublished({ environment: 'production' }, { pool }), applied === 9 ? /ten.*migrations/ : /catalog/);
    assert.equal(ended, true);
  }
});
