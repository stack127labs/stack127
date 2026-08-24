-- Publish the eight completed storage tools together at their flat canonical routes.
-- The migration is intentionally forward-only and safe to rerun after review.

insert into public.stack127_pages (
  slug,
  label,
  meta_title,
  meta_description,
  is_published,
  published_at,
  cover_image_url,
  page_type,
  sitemap_priority
) values
  (
    'shr-calculator',
    'SHR capacity calculator',
    'Synology SHR capacity calculator for mixed drives',
    'Calculate estimated SHR-1 or SHR-2 pool capacity from mixed Synology drive sizes, with protection and unused tiers shown. Fresh-pool estimate.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.80
  ),
  (
    'unraid-calculator',
    'unraid calculator',
    'Unraid Main Array Calculator: plan data capacity and parity growth',
    'Plan an Unraid Main Array from explicit parity and data drives. See array-level data capacity, TB/TiB accounting, protection, and whether a future drive fits the parity ceiling.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.80
  ),
  (
    'snapraid-mergerfs-planner',
    'snapraid and mergerfs planner',
    'SnapRAID and mergerfs Config Planner',
    'Build structurally checked snapraid.conf and mergerfs fstab text from one disk inventory. Review path boundaries before editing your host.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.76
  ),
  (
    'drive-reliability',
    'drive reliability explorer',
    'Drive Reliability Explorer: compare Backblaze model evidence',
    'Compare Backblaze drive cohorts by period, model, AFR, failures, drive days, and approximate evidence range. Fleet data is not a home-NAS prediction.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.74
  ),
  (
    'rebuild-calculator',
    'rebuild calculator',
    'RAID rebuild window and read-error exposure calculator',
    'Estimate a RAID rebuild window, source bytes read, and modeled URE exposure from your array inputs. See the assumptions and limits behind the result.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.74
  ),
  (
    'ceph-capacity-calculator',
    'ceph capacity planner',
    'Ceph capacity and failure-domain planner',
    'Model Ceph raw, usable, reserve, and failure-domain loss capacity without live cluster inspection.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.74
  ),
  (
    'storage-growth-planner',
    'storage growth planner',
    'Storage Growth and TCO Planner | stack127',
    'Plan local storage capacity runway and modeled hardware, power, replacement, and backup cost from your assumptions. Not installed filesystem free space.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.75
  ),
  (
    'storage-layout-advisor',
    'storage layout advisor',
    'Storage Layout Advisor: Compare RAID and ZFS Capacity',
    'Compare storage layouts from your real drive inventory, protection target, and workload. See theoretical capacity and failure boundaries before building.',
    true,
    '2026-08-24T00:00:00.000Z',
    null,
    'WebApplication',
    0.78
  )
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  updated_at = now();
