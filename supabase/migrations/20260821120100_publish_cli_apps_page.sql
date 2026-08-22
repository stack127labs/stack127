-- Publish the /cli-apps terminal apps directory page.

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
) values (
  'cli-apps',
  'cli apps',
  'Terminal apps: a directory of CLI tools, TUI apps, shells, and agents | stack127',
  'Browse verified terminal apps by type, category, platform, install method, pricing, license, and maintenance health, with official links.',
  true,
  now(),
  null,
  'CollectionPage',
  0.80
)
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = coalesce(public.stack127_pages.published_at, excluded.published_at),
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  updated_at = now();
