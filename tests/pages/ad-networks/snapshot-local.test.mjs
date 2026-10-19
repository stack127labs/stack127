import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import { snapshotLocal } from '../../../scripts/ad-networks/snapshot-local.mjs';

for (const fails of [false, true]) test(`WAL snapshot removes temporary files after ${fails ? 'failed installation' : 'success'}`, async t => {
  const directory = await mkdtemp(join(tmpdir(), 's127-snapshot-cleanup-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, 'working.sqlite'), output = join(directory, 'snapshot.sqlite');
  const writer = new DatabaseSync(source);
  try {
    writer.exec("pragma journal_mode=WAL; create table sample(value text); insert into sample values('committed');");
    // Replacing a directory fails at rename, after backup and validation have
    // created the same temporary WAL sidecars as a successful production copy.
    if (fails) {
      await mkdir(output);
      await assert.rejects(snapshotLocal(source, output));
    } else {
      assert.equal(await snapshotLocal(source, output), output);
    }
    assert.deepEqual((await readdir(directory)).filter(name => name.startsWith('snapshot.sqlite.')), []);
    assert.equal(writer.prepare('select value from sample').get().value, 'committed');
    assert.ok((await readdir(directory)).includes('working.sqlite-wal'));
    if (!fails) {
      const snapshot = new DatabaseSync(output, { readOnly: true });
      try {
        assert.equal(snapshot.prepare('pragma quick_check').get().quick_check, 'ok');
        assert.equal(snapshot.prepare('select value from sample').get().value, 'committed');
      } finally { snapshot.close(); }
    }
  } finally { writer.close(); }
});
