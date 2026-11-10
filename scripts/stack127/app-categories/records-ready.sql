select case when $1::text = 'self-host-apps' then (
  select count(*) >= 15 from public.self_host_apps app
  where app.published and app.self_hosting_status='self_hostable' and exists (
    select 1 from public.self_host_app_category_links link join public.self_host_app_categories category on category.id=link.category_id
    where link.app_id=app.id and category.slug=$2::text)
) when $1::text = 'cli-apps' then (
  select count(*) >= 15 from public.terminal_apps app where app.published and $2::text=any(app.categories)
) else false end as ready;
