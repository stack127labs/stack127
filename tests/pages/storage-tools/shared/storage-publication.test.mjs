import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = new URL("../../../../", import.meta.url);
const migrationPath = new URL("supabase/migrations/20260824140000_publish_eight_storage_tools.sql", root);
const migration = readFileSync(migrationPath, "utf8");

const expectedRows = [
  ["shr-calculator", "SHR capacity calculator", "Synology SHR capacity calculator for mixed drives", "Calculate estimated SHR-1 or SHR-2 pool capacity from mixed Synology drive sizes, with protection and unused tiers shown. Fresh-pool estimate.", "0.80"],
  ["unraid-calculator", "unraid calculator", "Unraid Main Array Calculator: plan data capacity and parity growth", "Plan an Unraid Main Array from explicit parity and data drives. See array-level data capacity, TB/TiB accounting, protection, and whether a future drive fits the parity ceiling.", "0.80"],
  ["snapraid-mergerfs-planner", "snapraid and mergerfs planner", "SnapRAID and mergerfs Config Planner", "Build structurally checked snapraid.conf and mergerfs fstab text from one disk inventory. Review path boundaries before editing your host.", "0.76"],
  ["drive-reliability", "drive reliability explorer", "Drive Reliability Explorer: compare Backblaze model evidence", "Compare Backblaze drive cohorts by period, model, AFR, failures, drive days, and approximate evidence range. Fleet data is not a home-NAS prediction.", "0.74"],
  ["rebuild-calculator", "rebuild calculator", "RAID rebuild window and read-error exposure calculator", "Estimate a RAID rebuild window, source bytes read, and modeled URE exposure from your array inputs. See the assumptions and limits behind the result.", "0.74"],
  ["ceph-capacity-calculator", "ceph capacity planner", "Ceph capacity and failure-domain planner", "Model Ceph raw, usable, reserve, and failure-domain loss capacity without live cluster inspection.", "0.74"],
  ["storage-growth-planner", "storage growth planner", "Storage Growth and TCO Planner | stack127", "Plan local storage capacity runway and modeled hardware, power, replacement, and backup cost from your assumptions. Not installed filesystem free space.", "0.75"],
  ["storage-layout-advisor", "storage layout advisor", "Storage Layout Advisor: Compare RAID and ZFS Capacity", "Compare storage layouts from your real drive inventory, protection target, and workload. See theoretical capacity and failure boundaries before building.", "0.78"],
];

function sqlLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("publishes all eight routes through the canonical registry with exact metadata", () => {
  assert.match(migration, /insert into public\.stack127_pages/i);
  assert.doesNotMatch(migration, /version127_pages/i);
  assert.match(migration, /on conflict \(slug\) do update/i);
  assert.match(migration, /published_at[\s\S]*2026-08-24T00:00:00\.000Z/i);
  assert.match(migration, /'WebApplication'/g);

  for (const [slug, label, title, description, priority] of expectedRows) {
    assert.match(migration, new RegExp(escapeRegExp(sqlLiteral(slug))), slug);
    assert.match(migration, new RegExp(escapeRegExp(sqlLiteral(label))), `${slug} label`);
    assert.match(migration, new RegExp(escapeRegExp(sqlLiteral(title))), `${slug} title`);
    assert.match(migration, new RegExp(escapeRegExp(sqlLiteral(description))), `${slug} description`);
    assert.match(migration, new RegExp(`\\n    ${priority}\\n`), `${slug} priority`);

    const writing = readFileSync(new URL(`content_docs/${slug}/writing-and-seo.md`, root), "utf8");
    assert.ok(writing.includes("Meta title: `" + title + "`"), `${slug} writing title`);
    assert.ok(writing.includes("Meta description: `" + description + "`"), `${slug} writing description`);
    assert.match(writing, /Page type: `WebApplication`/);
  }
});

test("keeps route ownership manifests and publication docs aligned", () => {
  for (const [slug] of expectedRows) {
    const manifest = JSON.parse(readFileSync(new URL(`tests/pages/${slug}/page.json`, root), "utf8"));
    assert.equal(manifest.state, "published", slug);
    assert.deepEqual(manifest.docs, [`content_docs/${slug}`], slug);
    assert.ok(manifest.tests.some((path) => path.endsWith("/page.test.mjs")), `${slug} focused page test`);

    const publication = readFileSync(new URL(`content_docs/${slug}/publication.md`, root), "utf8");
    assert.match(publication, /20260824140000_publish_eight_storage_tools\.sql/);
    assert.match(publication, /ready to publish with the eight-tool storage batch/i);
    assert.match(publication, /not live until the migration is applied/i);
  }
});
