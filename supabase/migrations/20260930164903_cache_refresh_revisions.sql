-- Keep acknowledged content fingerprints so the 15-minute check can recover
-- missed updates, including a deletion whose original queue entry was lost.
create table public.stack127_cache_processed (
  entity_type text not null,
  slug text not null,
  fingerprint text not null,
  processed_at timestamptz not null default now(),
  primary key (entity_type, slug)
);
create table public.stack127_cache_observation (
  id boolean primary key default true check (id),
  enabled_at timestamptz not null default now(),
  healthy_since timestamptz,
  last_check_at timestamptz,
  last_reconcile_at timestamptz,
  last_failure_at timestamptz,
  last_error text,
  long_ttl_enabled_at timestamptz
);
insert into public.stack127_cache_observation (id) values (true);
alter table public.stack127_cache_processed enable row level security;
alter table public.stack127_cache_observation enable row level security;
revoke all on public.stack127_cache_processed, public.stack127_cache_observation from public, anon, authenticated;
grant select, insert, update, delete on public.stack127_cache_processed to service_role;
grant select, update on public.stack127_cache_observation to service_role;

create function public.stack127_cache_source_revisions(p_types text[] default null, p_slugs text[] default null)
returns table(entity_type text, slug text, fingerprint text)
language sql stable set search_path = pg_catalog, public as $$
  select 'page', page.slug,
    md5(to_jsonb(page)::text || coalesce(to_jsonb(tool)::text, ''))
  from public.stack127_pages page
  left join public.stack127_tool_pages tool on tool.page_id = page.id
  where (p_types is null or 'page' = any(p_types)) and (p_slugs is null or page.slug = any(p_slugs))
  union all
  select 'self_host_app', app.slug, md5(to_jsonb(app)::text ||
    coalesce((select string_agg(to_jsonb(resource)::text, '' order by to_jsonb(resource)::text)
      from public.self_host_app_resource_estimates resource where resource.app_id = app.id), '') ||
    coalesce((select string_agg(to_jsonb(inst)::text, '' order by to_jsonb(inst)::text)
      from public.self_host_app_install_options inst where inst.app_id = app.id), '') ||
    coalesce((select string_agg(to_jsonb(link)::text, '' order by link.category_id)
      from public.self_host_app_category_links link where link.app_id = app.id), ''))
  from public.self_host_apps app where app.published
    and (p_types is null or 'self_host_app' = any(p_types)) and (p_slugs is null or app.slug = any(p_slugs))
  union all
  select 'cli_apps', 'cli-apps', md5(coalesce(string_agg(md5(to_jsonb(app)::text), '' order by app.slug), ''))
  from public.terminal_apps app
  having (p_types is null or 'cli_apps' = any(p_types)) and (p_slugs is null or 'cli-apps' = any(p_slugs))
  union all
  select 'self_host_catalog', 'all', md5(
    coalesce((select string_agg(md5(to_jsonb(g)::text), '' order by g.id) from public.github_projects g), '') ||
    coalesce((select string_agg(md5(to_jsonb(c)::text), '' order by c.id) from public.self_host_app_categories c), ''))
  where (p_types is null or 'self_host_catalog' = any(p_types)) and (p_slugs is null or 'all' = any(p_slugs))
$$;
revoke all on function public.stack127_cache_source_revisions(text[], text[]) from public, anon, authenticated;
grant execute on function public.stack127_cache_source_revisions(text[], text[]) to service_role;

-- This migration runs before the release builds fresh pages. Capture a
-- baseline here; the new worker reconciles edits during that build on startup.
insert into public.stack127_cache_processed (entity_type, slug, fingerprint)
select * from public.stack127_cache_source_revisions();

-- GitHub facts are shared by both directories.
create or replace function public.stack127_queue_catalog_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  perform public.stack127_enqueue_revalidation('self_host_catalog', 'all', tg_table_name);
  if tg_table_name = 'github_projects' then
    perform public.stack127_enqueue_revalidation('cli_apps', 'cli-apps', tg_table_name);
  end if;
  return null;
end;
$$;
