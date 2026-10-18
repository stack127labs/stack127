with selected_routes as (
  select unnest($1::text[]) as slug
), required_networks as (
  select substring(slug from '^ad-networks/([^/]+)$') as slug
  from (
    select slug from selected_routes
    union
    select slug from public.stack127_pages where is_published
  ) pages
  where slug ~ '^ad-networks/[a-z0-9-]+$' and slug not in ('ad-networks/stats','ad-networks/niches')
)
select
  to_regclass('public.ad_network_daily_counts') is not null
  and to_regclass('public.ad_network_relationship_events') is not null
  and to_regclass('public.ad_network_check_observations') is not null
  and exists(select 1 from public.ad_network_publisher_relationships where status='confirmed')
  and not exists(
    select 1 from required_networks required
    where not exists(
      -- Researched network pages remain useful with no confirmed sites yet.
      -- Require their identity. The cohort-wide evidence gate above stays on.
      select 1 from public.ad_networks n
      where n.slug=required.slug
    )
  ) as ready
