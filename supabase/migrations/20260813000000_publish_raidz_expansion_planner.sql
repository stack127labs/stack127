-- Publish the completed RAIDZ Expansion Planner at its flat canonical route.

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
) values (
  'raidz-expansion-planner',
  'RAIDZ expansion',
  'RAIDZ Expansion Planner: compare capacity at every width',
  'Plan one-disk RAIDZ expansion steps and compare current, immediate, and fresh-width capacity. Uses exact block geometry but not live ZFS-reported space.',
  true,
  '2026-08-13T00:00:00.000Z',
  null,
  'WebApplication',
  0.78
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
