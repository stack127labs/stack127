-- Tool catalog content and membership already touch stack127_pages and queue page events.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

alter table public.stack127_revalidation_events
  drop constraint stack127_revalidation_events_entity_type_check;
alter table public.stack127_revalidation_events
  add constraint stack127_revalidation_events_entity_type_check check (
    entity_type in ('page', 'self_host_app', 'self_host_catalog', 'cli_apps',
      'platform_fees', 'ad_networks', 'launch_directories')
  );

-- Queue both owners when an entry moves or a public slug changes.
create function public.stack127_queue_directory_row_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare
  row_value jsonb;
  owner_slug text;
  owners jsonb[] := '{}';
begin
  if tg_op = 'UPDATE' and
    (to_jsonb(new) - 'updated_at' - 'row_updated_at') is not distinct from
    (to_jsonb(old) - 'updated_at' - 'row_updated_at') then
    return null;
  end if;
  if tg_op <> 'INSERT' then owners := array_append(owners, to_jsonb(old)); end if;
  if tg_op <> 'DELETE' then owners := array_append(owners, to_jsonb(new)); end if;
  foreach row_value in array owners loop
    owner_slug := row_value ->> tg_argv[1];
    if tg_table_name = 'ad_network_publisher_relationships' then
      select slug into owner_slug from public.ad_networks
      where id = (row_value ->> 'ad_network_id')::bigint;
    end if;
    perform public.stack127_enqueue_revalidation(tg_argv[0], owner_slug, tg_table_name);
  end loop;
  return null;
end;
$$;

create trigger stack127_queue_platform_section_change
after insert or update or delete on public.platform_fee_sections
for each row execute function public.stack127_queue_directory_row_change('platform_fees', 'id');
create trigger stack127_queue_platform_entry_change
after insert or update or delete on public.platform_fee_entries
for each row execute function public.stack127_queue_directory_row_change('platform_fees', 'section_id');
create trigger stack127_queue_ad_network_change
after insert or update or delete on public.ad_networks
for each row execute function public.stack127_queue_directory_row_change('ad_networks', 'slug');
create trigger stack127_queue_ad_relationship_change
after insert or update or delete on public.ad_network_publisher_relationships
for each row execute function public.stack127_queue_directory_row_change('ad_networks', 'ad_network_id');

-- Publisher names and domains also appear on the network pages.
create function public.stack127_queue_ad_publisher_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare network_slug text;
begin
  for network_slug in
    select distinct network.slug
    from public.ad_network_publisher_relationships relationship
    join public.ad_networks network on network.id = relationship.ad_network_id
    where relationship.publisher_id = old.id
  loop
    perform public.stack127_enqueue_revalidation('ad_networks', network_slug, tg_table_name);
  end loop;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger stack127_queue_ad_publisher_change
before update or delete on public.ad_network_publishers
for each row execute function public.stack127_queue_ad_publisher_change();

create function public.stack127_queue_launch_directory_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  perform public.stack127_enqueue_revalidation('launch_directories', 'launch-directories', tg_table_name);
  return null;
end;
$$;
create trigger stack127_queue_launch_directory_change
after insert or update or delete on public.launch_directories
for each statement execute function public.stack127_queue_launch_directory_change();

-- Include these sources in the worker's missed-update recovery.
create or replace function public.stack127_cache_source_revisions(p_types text[] default null, p_slugs text[] default null)
returns table(entity_type text, slug text, fingerprint text)
language sql stable set search_path = pg_catalog, public as $$
  select 'page', page.slug,
    md5(to_jsonb(page)::text || coalesce(to_jsonb(tool)::text, '') ||
      coalesce((select to_jsonb(catalog)::text from public.stack127_tool_catalogs catalog
        where catalog.page_id = page.id), '') ||
      coalesce((select string_agg(to_jsonb(member)::text, '' order by member.tool_page_id)
        from public.stack127_tool_catalog_memberships member where member.catalog_page_id = page.id), ''))
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
  union all
  select 'platform_fees', section.id, md5(to_jsonb(section)::text ||
    coalesce((select string_agg(to_jsonb(entry)::text, '' order by entry.id)
      from public.platform_fee_entries entry where entry.section_id = section.id), ''))
  from public.platform_fee_sections section
  where (p_types is null or 'platform_fees' = any(p_types)) and (p_slugs is null or section.id = any(p_slugs))
  union all
  select 'ad_networks', network.slug, md5(to_jsonb(network)::text ||
    coalesce((select string_agg(to_jsonb(relationship)::text || to_jsonb(publisher)::text, '' order by relationship.publisher_id)
      from public.ad_network_publisher_relationships relationship
      join public.ad_network_publishers publisher on publisher.id = relationship.publisher_id
      where relationship.ad_network_id = network.id), ''))
  from public.ad_networks network
  where (p_types is null or 'ad_networks' = any(p_types)) and (p_slugs is null or network.slug = any(p_slugs))
  union all
  select 'launch_directories', 'launch-directories', md5(coalesce(string_agg(to_jsonb(directory)::text, '' order by directory.slug), ''))
  from public.launch_directories directory
  having (p_types is null or 'launch_directories' = any(p_types)) and (p_slugs is null or 'launch-directories' = any(p_slugs))
$$;

commit;
