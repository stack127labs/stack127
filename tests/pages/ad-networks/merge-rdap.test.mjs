import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openLocalDatabase } from '../../../scripts/ad-networks/local-db.mjs';
import { mergeRdap } from '../../../scripts/ad-networks/merge-rdap.mjs';

test('late homelab RDAP progress merges by domain without replacing OVH facts or newer checkpoints', () => {
  const directory = mkdtempSync(join(tmpdir(), 's127-rdap-')), source = join(directory, 'source.sqlite'), target = join(directory, 'target.sqlite');
  for (const file of [source, target]) {
    const db = openLocalDatabase(file);
    db.prepare(`insert into publishers(id,normalized_domain,display_domain,niche,platform,first_seen_at,last_discovered_at,created_at,updated_at)
      values(1,'blog.example.com','blog.example.com','food','WordPress',datetime('now'),datetime('now'),datetime('now'),datetime('now'))`).run();
    db.prepare(`insert into rdap_domains values('example.com','registered',? ,?,null,'https://example.com/rdap')`).run(file === source ? '2001-01-01' : '2002-01-01', file === source ? '2026-10-18T00:00:00Z' : '2026-10-17T00:00:00Z');
    db.close();
  }
  try {
    const options = { 'source-sqlite': source, 'local-database': target, apply: false };
    assert.equal(mergeRdap(options).rdap_checkpoints, 1);
    assert.equal(mergeRdap({ ...options, apply: true }).publisher_dates, 1);
    const db = openLocalDatabase(target);
    assert.deepEqual({ ...db.prepare('select niche,platform,domain_created_on from publishers').get() }, { niche: 'food', platform: 'WordPress', domain_created_on: '2001-01-01' });
    db.prepare("update rdap_domains set registered_on='2003-01-01',checked_at='2026-10-19T00:00:00Z'").run(); db.close();
    assert.equal(mergeRdap({ ...options, apply: true }).rdap_checkpoints, 0);
    const check = openLocalDatabase(target); assert.equal(check.prepare('select domain_created_on from publishers').get().domain_created_on, '2003-01-01'); check.close();
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
