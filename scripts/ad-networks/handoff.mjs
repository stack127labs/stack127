#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, mkdtemp, open, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { createGzip, createGunzip } from 'node:zlib';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { DatabaseSync } from 'node:sqlite';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { snapshotLocal } from './snapshot-local.mjs';
import { defaultLocalDatabasePath } from './local-db.mjs';
import { assertLocalCatalog } from './identity-catalog.mjs';
import { privateStorage, storageConfig, partBytes } from './handoff-storage.mjs';
import { safeError } from './alerts.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export async function fileDigest(file) {
  const hash = createHash('sha256'); let bytes = 0;
  for await (const chunk of createReadStream(file)) { hash.update(chunk); bytes += chunk.length; }
  return { sha256: hash.digest('hex'), bytes };
}
export function checkSnapshot(file) {
  const db = new DatabaseSync(file, { readOnly: true });
  try { if (db.prepare('pragma quick_check').get().quick_check !== 'ok') throw new Error('Seed SQLite quick_check failed'); assertLocalCatalog(db); }
  finally { db.close(); }
}
export function validateManifest(manifest, kind) {
  const hex = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
  if (!manifest || manifest.schema !== 1 || manifest.kind !== kind || !['seed', 'rdap'].includes(kind)
    || !hex(manifest.id) || manifest.id !== manifest.compressed_sha256 || !hex(manifest.sqlite_sha256)
    || !Number.isSafeInteger(manifest.sqlite_bytes) || manifest.sqlite_bytes < 512 || manifest.sqlite_bytes > 4 * 1024 ** 3
    || !Number.isSafeInteger(manifest.compressed_bytes) || manifest.compressed_bytes < 1 || manifest.compressed_bytes > 2 * 1024 ** 3
    || !Number.isFinite(Date.parse(manifest.created_at)) || !Array.isArray(manifest.parts) || !manifest.parts.length || manifest.parts.length > 512) throw new Error('Invalid snapshot manifest');
  let bytes = 0;
  manifest.parts.forEach((part, index) => {
    if (part.path !== `${kind}/${manifest.id}/part-${String(index).padStart(4, '0')}` || !hex(part.sha256)
      || !Number.isSafeInteger(part.bytes) || part.bytes < 1 || part.bytes > partBytes) throw new Error('Invalid snapshot chunk');
    bytes += part.bytes;
  });
  if (bytes !== manifest.compressed_bytes) throw new Error('Snapshot manifest size mismatch');
  return manifest;
}

export async function uploadSnapshot(options, dependencies = {}) {
  if (!['development', 'production'].includes(options.environment)) throw new Error('Invalid environment');
  if (options.apply && options.environment === 'production' && options.confirm !== 'stack127-production') throw new Error('Production confirmation missing');
  if (!['seed', 'rdap'].includes(options.kind)) throw new Error('Choose seed or rdap');
  if (!options.apply) return { applied: false, environment: options.environment, kind: options.kind, bucket: 'stack127-ad-networks-jobs', consistent_snapshot: true, compressed: true };
  const storage = dependencies.storage ?? privateStorage(storageConfig(options));
  await storage.ensureBucket();
  const directory = await mkdtemp(join(tmpdir(), 's127-adnet-upload-'));
  try {
    const sqlite = join(directory, 'snapshot.sqlite'), compressed = join(directory, 'snapshot.gz');
    await (dependencies.snapshot ?? snapshotLocal)(options['local-database'], sqlite);
    checkSnapshot(sqlite);
    await pipeline(createReadStream(sqlite), createGzip({ level: 6 }), createWriteStream(compressed, { mode: 0o600 }));
    const raw = await fileDigest(sqlite), gzip = await fileDigest(compressed);
    const manifest = { schema: 1, kind: options.kind, id: gzip.sha256, created_at: new Date().toISOString(),
      sqlite_bytes: raw.bytes, sqlite_sha256: raw.sha256, compressed_bytes: gzip.bytes, compressed_sha256: gzip.sha256, parts: [] };
    const file = await open(compressed, 'r');
    try {
      const buffer = Buffer.alloc(partBytes); let offset = 0;
      while (offset < gzip.bytes) {
        const { bytesRead } = await file.read(buffer, 0, Math.min(partBytes, gzip.bytes - offset), offset);
        if (!bytesRead) throw new Error('Unexpected snapshot EOF');
        const bytes = buffer.subarray(0, bytesRead), path = `${options.kind}/${gzip.sha256}/part-${String(manifest.parts.length).padStart(4, '0')}`;
        await storage.put(path, bytes);
        manifest.parts.push({ path, bytes: bytesRead, sha256: sha(bytes) }); offset += bytesRead;
      }
    } finally { await file.close(); }
    validateManifest(manifest, options.kind);
    await storage.putJson(`manifests/${options.kind}/${manifest.id}.json`, manifest);
    // Publish only after every immutable chunk and manifest is uploaded.
    await storage.putJson(`handoff/${options.kind}.json`, manifest);
    return { applied: true, environment: options.environment, kind: options.kind, id: manifest.id,
      sqlite_bytes: raw.bytes, compressed_bytes: gzip.bytes, chunks: manifest.parts.length };
  } finally { await rm(directory, { recursive: true, force: true }); }
}

export async function downloadSnapshot(storage, manifest, destination) {
  validateManifest(manifest, manifest.kind);
  await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
  const directory = await mkdtemp(join(dirname(destination), '.download-'));
  try {
    const compressed = join(directory, 'snapshot.gz'), sqlite = join(directory, 'snapshot.sqlite');
    const file = await open(compressed, 'wx', 0o600), hash = createHash('sha256'); let compressedBytes = 0;
    try {
      for (const part of manifest.parts) {
        const bytes = await storage.get(part.path, part.bytes);
        if (bytes.length !== part.bytes || sha(bytes) !== part.sha256) throw new Error('Snapshot chunk checksum mismatch');
        await file.writeFile(bytes); hash.update(bytes); compressedBytes += bytes.length;
      }
    } finally { await file.close(); }
    if (compressedBytes !== manifest.compressed_bytes || hash.digest('hex') !== manifest.compressed_sha256) throw new Error('Compressed snapshot checksum mismatch');
    const rawHash = createHash('sha256'); let rawBytes = 0;
    await pipeline(createReadStream(compressed), createGunzip(), new Transform({ transform(chunk, _encoding, done) {
      rawBytes += chunk.length;
      if (rawBytes > manifest.sqlite_bytes) { done(new Error('Expanded snapshot exceeds manifest size')); return; }
      rawHash.update(chunk); done(null, chunk);
    } }), createWriteStream(sqlite, { flags: 'wx', mode: 0o600 }));
    if (rawBytes !== manifest.sqlite_bytes || rawHash.digest('hex') !== manifest.sqlite_sha256) throw new Error('SQLite snapshot checksum mismatch');
    checkSnapshot(sqlite);
    // Caller owns destination admission; use an exclusive install, never overwrite a store.
    const { link } = await import('node:fs/promises'); await link(sqlite, destination);
    return { id: manifest.id, sqlite_bytes: rawBytes, quick_check: 'ok' };
  } finally { await rm(directory, { recursive: true, force: true }); }
}

export async function readHandoffStatus(options) {
  const storage = privateStorage(storageConfig(options));
  if (!await storage.bucket()) throw new Error('Handoff bucket missing');
  const runtime = await storage.getJson('status/runtime.json', true), niche = await storage.getJson('status/niche-sort.json', true);
  const age = runtime ? Math.round((Date.now() - Date.parse(runtime.updated_at)) / 1000) : null;
  return { runtime, runtime_age_seconds: age, runtime_stale: age === null || !Number.isFinite(age) || age < -60 || age > 120, niche };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { values } = parseArgs({ options: { kind: { type: 'string' }, status: { type: 'boolean', default: false },
    environment: { type: 'string', default: 'development' }, apply: { type: 'boolean', default: false }, confirm: { type: 'string' },
    'local-database': { type: 'string', default: defaultLocalDatabasePath } } });
  try {
    // Validate target even for a plan, without opening a connection or changing Storage.
    if (!['development', 'production'].includes(values.environment)) throw new Error('Invalid environment');
    if (values.apply && values.environment === 'production' && values.confirm !== 'stack127-production') throw new Error('Production confirmation missing');
    console.log(JSON.stringify(values.status ? await readHandoffStatus(values) : await uploadSnapshot(values), null, 2));
  } catch (error) { console.error(safeError(error)); process.exitCode = 1; }
}
