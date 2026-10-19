begin;
set local lock_timeout='10s';
set local statement_timeout='120s';

-- Fence in-flight writers before replacing their trigger function. There is no
-- publisher backfill: the versioned baseline invalidates the old fingerprints.
lock table public.ad_networks, public.ad_network_publishers,
  public.ad_network_publisher_relationships, public.ad_network_daily_counts,
  public.ad_network_relationship_events in share row exclusive mode;

create table public.stack127_ad_network_report_revision (
  id boolean primary key default true check (id),
  revision bigint not null default 0 check (revision >= 0)
);
insert into public.stack127_ad_network_report_revision(id) values(true);
alter table public.stack127_ad_network_report_revision enable row level security;
revoke all on public.stack127_ad_network_report_revision from public,anon,authenticated;
grant select,update on public.stack127_ad_network_report_revision to service_role;

create or replace function public.stack127_cache_source_revisions(p_types text[] default null, p_slugs text[] default null)
returns table(entity_type text, slug text, fingerprint text)
language sql stable set search_path = pg_catalog, public as $$
  select 'page', page.slug,
    md5(to_jsonb(page)::text || coalesce(to_jsonb(tool)::text, '') ||
      coalesce((select to_jsonb(course)::text from public.stack127_course_pages course where course.page_id=page.id), '') ||
      coalesce((select to_jsonb(lesson)::text from public.stack127_course_lessons lesson where lesson.page_id=page.id), '') ||
      coalesce((select string_agg((to_jsonb(lesson)-'row_updated_at')::text || registry.is_published::text, '' order by lesson.display_order) from public.stack127_course_lessons lesson join public.stack127_pages registry on registry.id=lesson.page_id where lesson.course_page_id=page.id), '') ||
      coalesce((select to_jsonb(directory)::text from public.stack127_directory_pages directory where directory.page_id=page.id), '') ||
      coalesce((select to_jsonb(catalog)::text from public.stack127_catalog_pages catalog
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
  select 'ad_networks', network.slug,
    md5('ad-network-report-v2:' || revision.revision::text || ':' || network.slug)
  from public.ad_networks network
  cross join public.stack127_ad_network_report_revision revision
  where revision.id
    and (p_types is null or 'ad_networks'=any(p_types)) and (p_slugs is null or network.slug=any(p_slugs))
  union all
  -- All report routes share inputs, so every meaningful change invalidates the
  -- network fingerprints conservatively. Reads never scan publisher data.
  select 'ad_networks', 'all', md5('ad-network-report-v2:' || revision.revision::text || ':all')
  from public.stack127_ad_network_report_revision revision
  where revision.id
    and (p_types is null or 'ad_networks'=any(p_types)) and (p_slugs is null or 'all'=any(p_slugs))
  union all
  select 'launch_directories', 'launch-directories', md5(coalesce(string_agg(to_jsonb(directory)::text, '' order by directory.slug), ''))
  from public.launch_directories directory
  having (p_types is null or 'launch_directories' = any(p_types)) and (p_slugs is null or 'launch-directories' = any(p_slugs))
$$;

-- Reuse the existing statement-level change detection, not row timestamps or
-- row counts. The increment commits/rolls back with the data, and UPDATE locks
-- serialize concurrent writers without losing increments. Work is limited to
-- the statement's transition rows, regardless of the total dataset size.
-- Keep stack127_directory_record_value unchanged. Daily snapshots omit only
-- captured_at, exactly as the previous source fingerprint did.
create or replace function public.stack127_touch_ad_network_reports()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare changed boolean; route text; projection text;
begin
  if tg_op='TRUNCATE' then
    changed := true;
  else
    projection := case when tg_table_name='ad_network_daily_counts' then 'to_jsonb(r)-''captured_at'''
      else format('public.stack127_directory_record_value(%L,to_jsonb(r))',tg_table_name) end;
    if tg_op='INSERT' then
      execute format('select exists(select 1 from new_rows r where (%s) is not null)',projection) into changed;
    elsif tg_op='DELETE' then
      execute format('select exists(select 1 from old_rows r where (%s) is not null)',projection) into changed;
    else
      execute format('with a as (select %s v from old_rows r), b as (select %s v from new_rows r)
        select exists(select 1 from ((select v from a except select v from b) union (select v from b except select v from a)) d where v is not null)',projection,projection) into changed;
    end if;
  end if;
  if not changed then return null; end if;
  update public.stack127_ad_network_report_revision set revision=revision+1 where id;
  if not found then raise exception 'Ad-network report revision baseline is missing'; end if;
  perform public.stack127_enqueue_revalidation('ad_networks','all',tg_table_name);
  for route in select slug from public.stack127_pages where slug='ad-networks' or slug like 'ad-networks/%' or slug='ad-network-checker' order by slug loop
    perform public.stack127_touch_page(route,tg_table_name);
  end loop;
  return null;
end;
$$;
revoke all on function public.stack127_touch_ad_network_reports() from public,anon,authenticated;
grant execute on function public.stack127_touch_ad_network_reports() to service_role;

do $$
declare tab text;
begin
  foreach tab in array array['ad_networks','ad_network_publishers','ad_network_publisher_relationships','ad_network_daily_counts','ad_network_relationship_events'] loop
    execute format('create trigger stack127_ad_reports_truncate after truncate on public.%I for each statement execute function public.stack127_touch_ad_network_reports()',tab);
  end loop;
end;
$$;

commit;
