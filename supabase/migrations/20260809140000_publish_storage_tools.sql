-- Publish the storage collection hub and its three completed flat calculators.
-- Homepage eligibility stays in lib/page-registry-helpers.ts while labels and
-- SEO remain registry-owned. The remaining roadmap tools in
-- content_ideas/2026-08-01-storage-tools-roadmap.md are added as they ship, so
-- the sidebar and the sitemap never point at a route that returns 404.

insert into public.version127_pages (
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
    'storage-tools',
    'storage tools',
    'Storage Tools: plan RAID and ZFS capacity before buying drives',
    'Calculate array capacity from the drives and topology you actually plan to use. Each tool keeps theoretical capacity, implementation estimates, and observed data separate.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'CollectionPage',
    0.90
  ),
  (
    'raid-calculator',
    'RAID calculator',
    'RAID Capacity Calculator for mixed drives and nested groups',
    'See theoretical usable capacity, what redundancy costs, and how much space unequal drives strand. RAID 10, 50, and 60 show their exact groups. Nothing leaves your browser.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'WebApplication',
    0.80
  ),
  (
    'zfs-capacity-calculator',
    'ZFS capacity calculator',
    'ZFS pool capacity calculator for mixed vdevs',
    'Calculate estimated writable capacity for mixed OpenZFS mirror and RAIDZ vdevs, including block allocation and slop. Fresh planned pools only.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'WebApplication',
    0.80
  ),
  (
    'zfs-padding-calculator',
    'ZFS padding calculator',
    'ZFS Block Size and Padding Calculator for RAIDZ',
    'See how one uncompressed ZFS block splits into data, parity, sector rounding, and padding on a RAIDZ vdev. Compare block sizes before changing recordsize.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'WebApplication',
    0.79
  )
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = coalesce(public.version127_pages.published_at, excluded.published_at),
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  updated_at = now();
