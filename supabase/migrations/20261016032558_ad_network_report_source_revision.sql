begin;
set local lock_timeout='10s';
set local statement_timeout='120s';

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
  select 'ad_networks', network.slug, md5(public.stack127_directory_record_value('ad_networks',to_jsonb(network))::text ||
    coalesce((select string_agg(md5(public.stack127_directory_record_value('ad_network_publisher_relationships',to_jsonb(relationship))::text ||
        public.stack127_directory_record_value('ad_network_publishers',to_jsonb(publisher))::text), '' order by relationship.publisher_id)
      from public.ad_network_publisher_relationships relationship
      join public.ad_network_publishers publisher on publisher.id=relationship.publisher_id
      where relationship.ad_network_id=network.id), '') ||
    coalesce((select string_agg(md5((to_jsonb(d)-'captured_at')::text), '' order by snapshot_on)
      from public.ad_network_daily_counts d where d.ad_network_id=network.id), '') ||
    coalesce((select string_agg(md5(to_jsonb(e)::text), '' order by publisher_id,event,observed_at)
      from public.ad_network_relationship_events e where e.ad_network_id=network.id), ''))
  from public.ad_networks network
  where (p_types is null or 'ad_networks'=any(p_types)) and (p_slugs is null or network.slug=any(p_slugs))
  union all
  -- Shared reports have their own source revision; "all" must never look deleted.
  select 'ad_networks', 'all', md5(
    coalesce((select string_agg(md5(public.stack127_directory_record_value('ad_networks',to_jsonb(n))::text), '' order by n.id)
      from public.ad_networks n), '') ||
    coalesce((select string_agg(md5(public.stack127_directory_record_value('ad_network_publishers',to_jsonb(p))::text), '' order by p.id)
      from public.ad_network_publishers p), '') ||
    coalesce((select string_agg(md5(public.stack127_directory_record_value('ad_network_publisher_relationships',to_jsonb(r))::text), '' order by r.ad_network_id,r.publisher_id)
      from public.ad_network_publisher_relationships r), '') ||
    coalesce((select string_agg(md5((to_jsonb(d)-'captured_at')::text), '' order by ad_network_id,snapshot_on)
      from public.ad_network_daily_counts d), '') ||
    coalesce((select string_agg(md5(to_jsonb(e)::text), '' order by ad_network_id,publisher_id,event,observed_at)
      from public.ad_network_relationship_events e), ''))
  where (p_types is null or 'ad_networks'=any(p_types)) and (p_slugs is null or 'all'=any(p_slugs))
  union all
  select 'launch_directories', 'launch-directories', md5(coalesce(string_agg(to_jsonb(directory)::text, '' order by directory.slug), ''))
  from public.launch_directories directory
  having (p_types is null or 'launch_directories' = any(p_types)) and (p_slugs is null or 'launch-directories' = any(p_slugs))
$$;


-- The public check-queue coverage also depends on candidate rows without a link.
-- Compare public projections so leases, retries and identical imports stay quiet.
create or replace function public.stack127_touch_ad_network_reports()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
declare changed boolean; route text;
begin
  if tg_op='INSERT' then
    execute format('select exists(select 1 from new_rows r where public.stack127_directory_record_value(%L,to_jsonb(r)) is not null)',tg_table_name) into changed;
  elsif tg_op='DELETE' then
    execute format('select exists(select 1 from old_rows r where public.stack127_directory_record_value(%L,to_jsonb(r)) is not null)',tg_table_name) into changed;
  else
    execute format('with a as (select public.stack127_directory_record_value(%L,to_jsonb(r)) v from old_rows r),
      b as (select public.stack127_directory_record_value(%L,to_jsonb(r)) v from new_rows r)
      select exists(select 1 from ((select v from a except select v from b) union (select v from b except select v from a)) d where v is not null)',tg_table_name,tg_table_name) into changed;
  end if;
  if not changed then return null; end if;
  perform public.stack127_enqueue_revalidation('ad_networks','all',tg_table_name);
  for route in select slug from public.stack127_pages where slug='ad-networks' or slug like 'ad-networks/%' or slug='ad-network-checker' order by slug loop
    perform public.stack127_touch_page(route,tg_table_name);
  end loop;
  return null;
end;
$$;
revoke all on function public.stack127_touch_ad_network_reports() from public,anon,authenticated;
grant execute on function public.stack127_touch_ad_network_reports() to service_role;

commit;
