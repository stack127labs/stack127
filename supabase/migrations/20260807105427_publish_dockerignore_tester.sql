-- Publish the tested flat tool route and keep its SEO metadata in the registry.

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
  'dockerignore-tester',
  '.dockerignore tester',
  '.dockerignore Pattern Tester: see the deciding rule',
  'Test .dockerignore rules against path probes and see Included or Excluded verdicts, deciding lines, and ordered traces. Matching stays local.',
  true,
  '2026-08-07T00:00:00.000Z',
  null,
  'WebApplication',
  0.80
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
