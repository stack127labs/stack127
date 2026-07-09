-- Publish the software licenses reference under its stable public slug.
-- Also clear the short-lived software-licenses slug if it exists from earlier work.

delete from public.version127_pages
where slug = 'software-licenses';

insert into public.version127_pages (
  slug,
  meta_title,
  meta_description,
  is_published,
  published_at,
  cover_image_url,
  page_type,
  sitemap_priority
) values (
  'software-licenses-for-self-hosting',
  'Software licenses for self-hosters | version127',
  'What MIT, AGPL, SSPL, Elastic, BSL, and other licenses mean when you self-host an app or publish one. Practical notes for users and creators.',
  true,
  '2026-07-09T00:00:00.000Z',
  null,
  'WebPage',
  0.70
)
on conflict (slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = coalesce(public.version127_pages.published_at, excluded.published_at),
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  updated_at = now();
