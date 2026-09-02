#!/usr/bin/env node

import pg from "pg";

const MANAGED_DEVELOPMENT_PROJECT_REF = "phhrfvmncpqqmmgruktx";
const PRODUCTION_PROJECT_REF = "tulgfrqamtcshdtmhvpx";
const MANAGED_DEVELOPMENT_DATABASE_HOST = `db.${MANAGED_DEVELOPMENT_PROJECT_REF}.supabase.co`;
const MANAGED_DEVELOPMENT_API_HOST = `${MANAGED_DEVELOPMENT_PROJECT_REF}.supabase.co`;
const PRODUCTION_DATABASE_HOST = `db.${PRODUCTION_PROJECT_REF}.supabase.co`;
const PREVIEW_PAGE_TYPE = "WebApplication";
const LEGACY_UNMANAGED_DATABASE_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

const PREVIEW_ROWS = [
  {
    slug: "shr-calculator",
    label: "SHR capacity calculator",
    title: "Synology SHR capacity calculator for mixed drives",
    description: "Calculate estimated SHR-1 or SHR-2 pool capacity from mixed Synology drive sizes, with protection and unused tiers shown. Fresh-pool estimate.",
    priority: 0.8,
  },
  {
    slug: "unraid-calculator",
    label: "unraid calculator",
    title: "Unraid Main Array Calculator: plan data capacity and parity growth",
    description: "Plan an Unraid Main Array from explicit parity and data drives. See array-level data capacity, TB/TiB accounting, protection, and whether a future drive fits the parity ceiling.",
    priority: 0.8,
  },
  {
    slug: "snapraid-mergerfs-planner",
    label: "snapraid and mergerfs planner",
    title: "SnapRAID and mergerfs Config Planner",
    description: "Build structurally checked snapraid.conf and mergerfs fstab text from one disk inventory. Review path boundaries before editing your host.",
    priority: 0.76,
  },
  {
    slug: "drive-reliability",
    label: "drive reliability explorer",
    title: "Drive Reliability Explorer: compare Backblaze model evidence",
    description: "Compare Backblaze drive cohorts by period, model, AFR, failures, drive days, and approximate evidence range. Fleet data is not a home-NAS prediction.",
    priority: 0.74,
  },
  {
    slug: "rebuild-calculator",
    label: "rebuild calculator",
    title: "RAID rebuild window and read-error exposure calculator",
    description: "Estimate a RAID rebuild window, source bytes read, and modeled URE exposure from your array inputs. See the assumptions and limits behind the result.",
    priority: 0.74,
  },
  {
    slug: "ceph-capacity-calculator",
    label: "Ceph capacity planner",
    title: "Ceph capacity and failure-domain planner",
    description: "Model Ceph raw, usable, reserve, and failure-domain loss capacity without live cluster inspection.",
    priority: 0.74,
  },
  {
    slug: "storage-growth-planner",
    label: "Storage growth planner",
    title: "Storage Growth and TCO Planner | stack127",
    description: "Plan local storage capacity runway and modeled hardware, power, replacement, and backup cost from your assumptions. Not installed filesystem free space.",
    priority: 0.75,
  },
  {
    slug: "storage-layout-advisor",
    label: "Storage layout advisor",
    title: "Storage Layout Advisor: Compare RAID and ZFS Capacity",
    description: "Compare storage layouts from your real drive inventory, protection target, and workload. See theoretical capacity and failure boundaries before building.",
    priority: 0.78,
  },
];

const PREVIEW_SLUGS = PREVIEW_ROWS.map((row) => row.slug);
const remove = process.argv.includes("--remove");

function fail(message) {
  throw new Error(`Storage preview: ${message}`);
}

function requireManagedDevelopmentEnvironment() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) fail("DATABASE_URL is required. Run this script with --env-file=.env.local.");
  if (process.env.NODE_ENV === "production") fail("Refusing production NODE_ENV.");

  let database;
  try {
    database = new URL(databaseUrl);
  } catch {
    fail("DATABASE_URL is not a valid PostgreSQL URL.");
  }

  if (database.hostname === PRODUCTION_DATABASE_HOST || database.hostname.includes(PRODUCTION_PROJECT_REF)) {
    fail("Refusing the production database.");
  }
  if (LEGACY_UNMANAGED_DATABASE_HOSTS.has(database.hostname)) {
    fail("Refusing a legacy loopback database; use the managed development project.");
  }
  if (database.hostname !== MANAGED_DEVELOPMENT_DATABASE_HOST) {
    fail(`Refusing a database that is not the managed development project (${MANAGED_DEVELOPMENT_DATABASE_HOST}).`);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) fail("SUPABASE_URL is required to identify managed development.");
  let api;
  try {
    api = new URL(supabaseUrl);
  } catch {
    fail("SUPABASE_URL is not a valid URL.");
  }
  if (api.hostname === `${PRODUCTION_PROJECT_REF}.supabase.co` || api.hostname.includes(PRODUCTION_PROJECT_REF)) {
    fail("Refusing the production Supabase project.");
  }
  if (api.hostname !== MANAGED_DEVELOPMENT_API_HOST) {
    fail(`Refusing a Supabase project that is not managed development (${MANAGED_DEVELOPMENT_API_HOST}).`);
  }

  return databaseUrl;
}

function rowMatchesPreview(row, expected) {
  return expected !== undefined
    && row.slug === expected.slug
    && row.label === expected.label
    && row.meta_title === expected.title
    && row.meta_description === expected.description
    && row.is_published === true
    && row.page_family === "tool"
    && row.page_type === PREVIEW_PAGE_TYPE
    && Number(row.sitemap_priority) === expected.priority;
}

async function existingRows(pool) {
  const result = await pool.query(
    `
      select slug, label, meta_title, meta_description, is_published, page_family, page_type, sitemap_priority
      from public.stack127_pages
      where slug = any($1::text[])
      order by slug
    `,
    [PREVIEW_SLUGS],
  );
  return result.rows;
}

async function addPreviewRows(pool) {
  await pool.query("begin");
  try {
    for (const row of PREVIEW_ROWS) {
      const result = await pool.query(
        `
          update public.stack127_pages
          set label = $2,
              meta_title = $3,
              meta_description = $4,
              is_published = true,
              published_at = coalesce(published_at, now()),
              updated_at = now(),
              cover_image_url = null,
              page_type = $5,
              sitemap_priority = $6
          where slug = $1
            and page_family = 'tool'
            and exists (
              select 1 from public.stack127_tool_pages tool_page
              where tool_page.page_id = public.stack127_pages.id
            )
        `,
        [row.slug, row.label, row.title, row.description, PREVIEW_PAGE_TYPE, row.priority],
      );
      if (result.rowCount !== 1) fail(`tool registry or content row is missing for ${row.slug}.`);
    }
    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback").catch(() => undefined);
    throw error;
  }

  const inserted = await existingRows(pool);
  if (inserted.length !== PREVIEW_ROWS.length || inserted.some((row) => !rowMatchesPreview(row, PREVIEW_ROWS.find((candidate) => candidate.slug === row.slug)))) {
    fail("preview insertion could not be verified.");
  }
  console.log(`Added ${inserted.length} temporary managed-development preview rows.`);
}

async function removePreviewRows(pool) {
  await pool.query("begin");
  try {
    const result = await pool.query(
      `update public.stack127_pages
       set is_published = false, published_at = null, updated_at = null
       where slug = any($1::text[]) and page_family = 'tool'`,
      [PREVIEW_SLUGS],
    );
    if (result.rowCount !== PREVIEW_ROWS.length) {
      fail(`expected ${PREVIEW_ROWS.length} tool rows but updated ${result.rowCount}.`);
    }
    await pool.query("commit");
  } catch (error) {
    await pool.query("rollback").catch(() => undefined);
    throw error;
  }
  console.log(`Unpublished ${PREVIEW_ROWS.length} preview rows without deleting their tool content.`);
}

let pool;
try {
  const databaseUrl = requireManagedDevelopmentEnvironment();
  pool = new pg.Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 10_000,
    max: 1,
    query_timeout: 15_000,
  });
  if (remove) await removePreviewRows(pool);
  else await addPreviewRows(pool);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await pool?.end();
}
