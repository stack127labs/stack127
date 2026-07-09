insert into public.version127_pages (
  slug,
  meta_title,
  meta_description,
  is_published,
  published_at,
  cover_image_url,
  page_type,
  sitemap_priority
) values
  (
    '',
    'version127 | Practical technical directories and tools',
    'Find useful technical tools, references, self-host apps, and compact directories built for quick comparison.',
    true,
    '2026-07-07T00:00:00.000Z',
    null,
    'WebPage',
    1.00
  ),
  (
    'about',
    'About version127',
    'Learn what version127 is building: practical technical directories, clear references, and structured facts without extra fluff.',
    true,
    '2026-07-07T00:00:00.000Z',
    null,
    'AboutPage',
    0.40
  ),
  (
    'privacy',
    'Privacy | version127',
    'Read how version127 handles server logs, Cloudflare traffic, self-hosted analytics, contact email, and third-party links.',
    true,
    '2026-07-07T00:00:00.000Z',
    null,
    'PrivacyPolicy',
    0.20
  ),
  (
    'terms',
    'Terms | version127',
    'Read the terms for using version127 as an informational technical directory, reference site, and starting point for research.',
    true,
    '2026-07-07T00:00:00.000Z',
    null,
    'TermsOfService',
    0.20
  )
on conflict (slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority;
