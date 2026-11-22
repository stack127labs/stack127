-- The homepage lists directories by sitemap_priority and catalogs by
-- display_order. Lead with the indie hacker data directories and catalogs.
update public.stack127_pages as page
set sitemap_priority = desired.priority
from (values
  ('platform-fees', 0.95),
  ('ad-networks', 0.94),
  ('launch-directories', 0.93),
  ('cli-apps', 0.88),
  ('keyboard-shortcuts', 0.60)
) as desired(slug, priority)
where page.slug = desired.slug
  and page.page_family = 'directory'
  and page.sitemap_priority is distinct from desired.priority;

update public.stack127_catalog_pages as catalog
set display_order = desired.display_order
from public.stack127_pages as page
join (values
  ('kdp-tools', 10),
  ('saas-tools', 20),
  ('publisher-tools', 30),
  ('domain-tools', 40),
  ('dns-tools', 50),
  ('developer-tools', 60),
  ('hosting-cloud-tools', 70),
  ('productivity-tools', 80),
  ('storage-tools', 90)
) as desired(slug, display_order) on desired.slug = page.slug
where catalog.page_id = page.id
  and page.page_family = 'catalog'
  and catalog.display_order is distinct from desired.display_order;
