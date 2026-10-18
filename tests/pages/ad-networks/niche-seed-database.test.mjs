import assert from 'node:assert/strict';
import test from 'node:test';
import pg from 'pg';
import { syncNicheBatch } from '../../../scripts/ad-networks/sync.mjs';
import { targetDatabaseUrl } from '../../../scripts/ad-networks/runtime-db.mjs';

// Opt in with AD_NETWORKS_TEST_ENVIRONMENT=development. The actual UPDATE runs
// against a transaction-local temporary table; no public rows or triggers run.
test('seed SQL fills only missing labels; reviewed correction remains an explicit separate mode', {
  skip: process.env.AD_NETWORKS_TEST_ENVIRONMENT !== 'development',
}, async () => {
  const pool = new pg.Pool({ connectionString: targetDatabaseUrl({ environment: 'development' }), max: 1,
    connectionTimeoutMillis: 15000, query_timeout: 30000 });
  let client;
  try {
    client = await pool.connect(); await client.query('begin');
    await client.query('create temporary table ad_network_niche_seed_fixture(normalized_domain text primary key,niche text) on commit drop');
    await client.query(`insert into ad_network_niche_seed_fixture values
      ('already-sorted.example','tech'),('old-null.example','gaming'),('unsorted.example',null),('both-null.example',null)`);
    const source = [
      { normalized_domain: 'already-sorted.example', niche: 'food' },
      { normalized_domain: 'old-null.example', niche: null },
      { normalized_domain: 'unsorted.example', niche: 'food' },
      { normalized_domain: 'both-null.example', niche: null },
    ];
    // Change only the relation name to isolate the real production SQL.
    const isolated = { query: (sql, params) => client.query(sql.replaceAll('public.ad_network_publishers', 'pg_temp.ad_network_niche_seed_fixture'), params) };
    const labels = async () => Object.fromEntries((await client.query('select * from ad_network_niche_seed_fixture')).rows.map(row => [row.normalized_domain, row.niche]));
    assert.equal(await syncNicheBatch(isolated, source, 'seed'), 1);
    assert.deepEqual(await labels(), { 'already-sorted.example': 'tech', 'old-null.example': 'gaming', 'unsorted.example': 'food', 'both-null.example': null });
    assert.equal(await syncNicheBatch(isolated, source, 'seed'), 0);
    await assert.rejects(syncNicheBatch(isolated, source), /Explicit niche sync mode/);
    assert.equal(await syncNicheBatch(isolated, source, 'correction'), 2);
    assert.deepEqual(await labels(), { 'already-sorted.example': 'food', 'old-null.example': null, 'unsorted.example': 'food', 'both-null.example': null });
  } finally {
    if (client) { await client.query('rollback').catch(() => {}); client.release(); }
    await pool.end();
  }
});
