-- Publish the DNS tools hub and first DNS Lookup tool through the central registry.

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
    'dns-tools',
    'DNS tools',
    'DNS Tools for Record Troubleshooting | Version127',
    'Check public DNS records and read exact resolver response states with compact DNS troubleshooting tools from Version127.',
    true,
    '2026-07-12T00:00:00.000Z',
    null,
    'CollectionPage',
    0.80
  ),
  (
    'dns-tools/dns-lookup',
    'DNS lookup',
    'DNS Lookup: Check Domain Records | Version127',
    'Enter a domain or hostname to check its A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, and other public DNS records.',
    true,
    '2026-07-12T00:00:00.000Z',
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
