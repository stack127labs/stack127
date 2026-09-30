-- Prepare the SaaS tools collection without making an empty catalog public.
-- Tool membership is added with the first tool page by the catalog update workflow.
insert into public.stack127_pages (
  slug, label, meta_title, meta_description, is_published,
  published_at, updated_at, cover_image_url, page_type, sitemap_priority, page_family
)
values (
  'saas-tools',
  'SaaS tools',
  'SaaS calculators for revenue and customer metrics | stack127',
  'Use SaaS calculators to examine recurring revenue, retention, churn, margin, and acquisition cost from your own monthly figures.',
  false,
  null,
  null,
  null,
  'CollectionPage',
  0.67,
  'catalog'
)
on conflict (slug) do nothing;

insert into public.stack127_tool_catalogs (
  page_id, heading_before, heading_mark, heading_after, intro, section_heading,
  icon_key, hero_art_key, home_art_key, home_order
)
select
  page.id,
  'SaaS ',
  'tools',
  ' for revenue and customer decisions',
  'Start with a monthly view of recurring revenue, retention, customer churn, margin, and acquisition cost. Each calculator explains what its result means and which figures it needs.',
  'Choose a SaaS calculator',
  'activity',
  'saas-tools',
  'saas-tools',
  90
from public.stack127_pages page
where page.slug = 'saas-tools' and page.page_family = 'catalog'
on conflict (page_id) do nothing;
