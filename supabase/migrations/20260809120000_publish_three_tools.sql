-- Publish three reviewed flat tool routes. Homepage eligibility stays in
-- lib/page-registry-helpers.ts while labels and SEO remain registry-owned.

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
    'home-assistant-energy-entity-checker',
    'Home Assistant energy checker',
    'Home Assistant Energy Entity Eligibility Checker: find failed rules',
    'Check an entity''s Energy role, device class, state class, and unit against Home Assistant rules. Results stay local and still require recorder checks.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'WebApplication',
    0.79
  ),
  (
    'nginx-proxy-pass-calculator',
    'NGINX proxy_pass calculator',
    'NGINX proxy_pass URI Calculator: see the upstream URL',
    'Calculate the final upstream URL for one NGINX location, request target, and static proxy_pass URL. See the replacement trace and slash difference.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'WebApplication',
    0.78
  ),
  (
    'nfs-firewall-rules',
    'NFS firewall planner',
    'NFS Firewall Rules Planner for v3 and v4',
    'Plan source-scoped NFSv3 or NFSv4 host-firewall listeners for firewalld, UFW, or nftables. Verified helper ports are required for NFSv3.',
    true,
    '2026-08-09T00:00:00.000Z',
    null,
    'WebApplication',
    0.77
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
