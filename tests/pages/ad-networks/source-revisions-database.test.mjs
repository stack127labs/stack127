import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { targetPool } from '../../../scripts/ad-networks/runtime-db.mjs';

// All writes and new functions are session-local fixtures, rolled back. This
// exercises the migration SQL without installing it or touching public data.
test('report revision tracks public changes, ignores bookkeeping and rolls back with the data', {
  skip: process.env.AD_NETWORKS_TEST_ENVIRONMENT !== 'development',
}, async () => {
  const migration = await readFile(new URL('../../../supabase/migrations/20261019102740_ad_network_report_revision_counter.sql', import.meta.url), 'utf8');
  const pool = targetPool({ environment: 'development' });
  const client = await pool.connect();
  const tables = ['ad_networks', 'ad_network_publishers', 'ad_network_publisher_relationships',
    'ad_network_daily_counts', 'ad_network_relationship_events'];
  try {
    await client.query('begin');
    await client.query(migration.match(/create table public.stack127_ad_network_report_revision \([\s\S]*?\n\);/)[0]
      .replace('create table public.', 'create temporary table '));
    await client.query('insert into pg_temp.stack127_ad_network_report_revision(id) values(true)');
    for (const table of tables) {
      // CTAS inherits column types, without defaults/sequences, public triggers
      // or constraints. All fixture IDs and values are supplied explicitly.
      await client.query(`create temporary table ${table} as select * from public.${table} with no data`);
    }
    await client.query('create temporary table stack127_pages(slug text)');
    await client.query('create temporary table report_queue(entity_type text,slug text,source text)');
    await client.query(`create function pg_temp.stack127_enqueue_revalidation(text,text,text) returns void language sql as $$
      insert into pg_temp.report_queue values($1,$2,$3) $$`);
    await client.query(`create function pg_temp.stack127_touch_page(text,text) returns void language plpgsql as $$begin return; end$$`);
    const trigger = migration.match(/create or replace function public.stack127_touch_ad_network_reports\(\)[\s\S]*?\$\$;/)[0]
      .replaceAll('public.stack127_touch_ad_network_reports', 'pg_temp.stack127_touch_ad_network_reports')
      .replaceAll('public.stack127_ad_network_report_revision', 'pg_temp.stack127_ad_network_report_revision')
      .replaceAll('public.stack127_enqueue_revalidation', 'pg_temp.stack127_enqueue_revalidation')
      .replaceAll('public.stack127_touch_page', 'pg_temp.stack127_touch_page')
      .replaceAll('public.stack127_pages', 'pg_temp.stack127_pages');
    await client.query(trigger);
    const revisions = migration.match(/create or replace function public.stack127_cache_source_revisions\([\s\S]*?\$\$;/)[0]
      .replace('public.stack127_cache_source_revisions', 'pg_temp.stack127_cache_source_revisions')
      .replaceAll('public.stack127_ad_network_report_revision', 'pg_temp.stack127_ad_network_report_revision')
      .replaceAll('public.ad_networks', 'pg_temp.ad_networks');
    await client.query(revisions);
    for (const table of tables) {
      await client.query(`create trigger report_insert after insert on pg_temp.${table}
        referencing new table as new_rows for each statement execute function pg_temp.stack127_touch_ad_network_reports()`);
      await client.query(`create trigger report_update after update on pg_temp.${table}
        referencing old table as old_rows new table as new_rows for each statement execute function pg_temp.stack127_touch_ad_network_reports()`);
      await client.query(`create trigger report_delete after delete on pg_temp.${table}
        referencing old table as old_rows for each statement execute function pg_temp.stack127_touch_ad_network_reports()`);
      await client.query(`create trigger report_truncate after truncate on pg_temp.${table}
        for each statement execute function pg_temp.stack127_touch_ad_network_reports()`);
    }
    const revision = async () => BigInt((await client.query('select revision from pg_temp.stack127_ad_network_report_revision')).rows[0].revision);
    const fingerprints = async slugs => (await client.query(`select slug,fingerprint
      from pg_temp.stack127_cache_source_revisions(array['ad_networks'],$1::text[]) order by slug`, [slugs ?? null])).rows;
    const change = async (sql, expected = true) => {
      const before = await revision(), fingerprintsBefore = await fingerprints();
      const queued = (await client.query('select count(*) as n from pg_temp.report_queue')).rows[0].n;
      await client.query(sql);
      assert.equal(await revision(), before + (expected ? 1n : 0n), sql);
      const after = await fingerprints();
      for (const previous of fingerprintsBefore) {
        const current = after.find(row => row.slug === previous.slug);
        if (current) assert.equal(current.fingerprint !== previous.fingerprint, expected, `${sql}: ${previous.slug}`);
      }
      assert.equal(BigInt((await client.query('select count(*) as n from pg_temp.report_queue')).rows[0].n),
        BigInt(queued) + (expected ? 1n : 0n));
    };
    assert.deepEqual((await fingerprints()).map(row => row.slug), ['all']);
    await change("insert into pg_temp.ad_networks(id,slug,name) values(1,'fixture-a','A'),(2,'fixture-b','B')");
    await change("insert into pg_temp.ad_network_publishers(id,normalized_domain,niche) values(1,'fixture.example','food')");
    await change(`insert into pg_temp.ad_network_publisher_relationships(ad_network_id,publisher_id,status,relationship_type,evidence)
      values(1,1,'confirmed','active_network_use','{}')`);
    await change(`insert into pg_temp.ad_network_daily_counts(ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count)
      values(1,'2026-10-19',1,1,0)`);
    await change(`insert into pg_temp.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
      values(1,1,'joined','2026-10-19','active_network_use')`);
    assert.deepEqual((await fingerprints()).map(row => row.slug), ['all', 'fixture-a', 'fixture-b']);
    assert.equal((await fingerprints(['all'])).length, 1);
    assert.deepEqual(await fingerprints(['missing']), []);
    assert.equal((await client.query("select * from pg_temp.stack127_cache_source_revisions(array['missing'])")).rowCount, 0);

    await change("update pg_temp.ad_network_publishers set next_check_at=now(),updated_at=now(),check_attempt_count=10,ads_txt_etag='new'", false);
    await change("update pg_temp.ad_network_publisher_relationships set consecutive_misses=2,evidence='{\"ignored\":true}'", false);
    await change('update pg_temp.ad_networks set updated_at=now()', false);
    await change('update pg_temp.ad_network_daily_counts set captured_at=now()', false);
    await change("update pg_temp.ad_network_publishers set niche='food'", false);
    await change("update pg_temp.ad_network_publishers set niche='tech' where id=-1", false);
    await change("update pg_temp.ad_network_publishers set niche='tech'");
    await change(`update pg_temp.ad_network_publishers set last_check_evidence='{"homepage":{"title":"Changed"}}'`);
    await change(`update pg_temp.ad_network_publishers set discovery_sources='["new-source"]'`);
    await change(`update pg_temp.ad_network_publisher_relationships set verification_method='direct_ads_txt'`);
    await change(`update pg_temp.ad_network_publisher_relationships set evidence='{"manager_domain":"manager.example"}'`);
    await change("update pg_temp.ad_networks set manager_domains=array['manager.example']");
    await change('update pg_temp.ad_network_daily_counts set listed_count=2');
    await change("update pg_temp.ad_network_relationship_events set observed_at='2026-10-20'");
    await change(`insert into pg_temp.ad_network_publisher_relationships(ad_network_id,publisher_id,status)
      values(2,1,'candidate')`, false);
    await change("update pg_temp.ad_network_publisher_relationships set status='needs_review' where ad_network_id=2", false);
    await change("update pg_temp.ad_network_publisher_relationships set status='confirmed' where ad_network_id=2");
    await change("update pg_temp.ad_network_publisher_relationships set status='needs_review' where ad_network_id=2");
    await change('delete from pg_temp.ad_network_publisher_relationships where ad_network_id=2', false);

    const beforeRollback = await fingerprints(), versionBeforeRollback = await revision();
    await client.query('savepoint mutation');
    await change("update pg_temp.ad_network_publishers set niche='gaming'");
    await client.query('rollback to savepoint mutation');
    assert.equal(await revision(), versionBeforeRollback);
    assert.deepEqual(await fingerprints(), beforeRollback);
    for (const table of [...tables].reverse()) await change(`delete from pg_temp.${table}`);
    for (const table of tables) await change(`truncate pg_temp.${table}`);
    assert.deepEqual((await fingerprints()).map(row => row.slug), ['all']);
  } finally {
    await client.query('rollback').catch(() => {});
    client.release(); await pool.end();
  }
});
