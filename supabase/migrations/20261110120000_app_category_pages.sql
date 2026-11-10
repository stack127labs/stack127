begin;
set local lock_timeout = '10s';

create function public.stack127_app_category_count(p_slug text)
returns bigint language sql stable security invoker set search_path=pg_catalog as $$
  select case when p_slug like 'self-host-apps/categories/%' then (
    select count(*) from public.self_host_apps app where app.published and app.self_hosting_status='self_hostable' and exists(
      select 1 from public.self_host_app_category_links link join public.self_host_app_categories category on category.id=link.category_id
      where link.app_id=app.id and category.slug=split_part(p_slug,'/',3))
  ) when p_slug like 'cli-apps/categories/%' then (
    select count(*) from public.terminal_apps app where app.published and split_part(p_slug,'/',3)=any(app.categories)
  ) else 0 end
$$;
revoke all on function public.stack127_app_category_count(text) from public,anon,authenticated;
grant execute on function public.stack127_app_category_count(text) to service_role;

create function public.stack127_check_app_category_publication()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
  if new.is_published and (new.slug like 'self-host-apps/categories/%' or new.slug like 'cli-apps/categories/%')
    and public.stack127_app_category_count(new.slug) < 15 then
    raise exception 'Category needs at least 15 published apps: %',new.slug;
  end if;
  return new;
end;
$$;
revoke all on function public.stack127_check_app_category_publication() from public,anon,authenticated;
create trigger stack127_check_app_category_publication before insert or update of is_published,slug
on public.stack127_pages for each row execute function public.stack127_check_app_category_publication();

create or replace function public.stack127_touch_directory_records()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare
  changed jsonb[];
  value jsonb;
  owner_slug text;
  section_id text;
  slugs text[] := '{}';
  entities text[] := '{}';
  entity_slugs text[] := '{}';
  idx integer;
begin
  if tg_op = 'INSERT' then
    execute format('select array_agg(value) from (select public.stack127_directory_record_value(%L,to_jsonb(r)) value from new_rows r) records where value is not null',tg_table_name) into changed;
  elsif tg_op = 'DELETE' then
    execute format('select array_agg(value) from (select public.stack127_directory_record_value(%L,to_jsonb(r)) value from old_rows r) records where value is not null',tg_table_name) into changed;
  else
    execute format('with before as (select public.stack127_directory_record_value(%L,to_jsonb(r)) value from old_rows r),
      after as (select public.stack127_directory_record_value(%L,to_jsonb(r)) value from new_rows r),
      changes as ((select value from before except select value from after) union (select value from after except select value from before))
      select array_agg(value) from changes where value is not null',tg_table_name,tg_table_name) into changed;
  end if;
  if changed is null then return null; end if;
  foreach value in array changed loop
    case tg_table_name
      when 'platform_fee_sections','platform_fee_entries' then
        section_id := case when tg_table_name='platform_fee_sections' then value->>'id' else value->>'section_id' end;
        if tg_table_name='platform_fee_sections' then
          owner_slug := public.stack127_platform_fee_group_slug(value->>'group_name');
        else
          select public.stack127_platform_fee_group_slug(group_name) into owner_slug from public.platform_fee_sections where id=section_id;
        end if;
        slugs := slugs || array['platform-fees','platform-fees/' || owner_slug];
        entities := array_append(entities,'platform_fees'); entity_slugs := array_append(entity_slugs,section_id);
      when 'ad_networks','ad_network_publisher_relationships','ad_network_publishers' then
        if tg_table_name <> 'ad_network_publishers' or exists (
          select 1 from public.ad_network_publisher_relationships rel where rel.publisher_id=(value->>'id')::bigint and rel.status='confirmed'
        ) then slugs := array_append(slugs,'ad-networks'); end if;
        if tg_table_name='ad_networks' then
          owner_slug := value->>'slug';
          slugs := array_append(slugs,'ad-networks/' || owner_slug);
          entities := array_append(entities,'ad_networks'); entity_slugs := array_append(entity_slugs,owner_slug);
        else
          for owner_slug in
            select network.slug from public.ad_networks network where
              (tg_table_name='ad_network_publisher_relationships' and network.id=(value->>'ad_network_id')::bigint) or
              (tg_table_name='ad_network_publishers' and exists(select 1 from public.ad_network_publisher_relationships rel
                where rel.ad_network_id=network.id and rel.publisher_id=(value->>'id')::bigint and rel.status='confirmed'))
          loop
            slugs := array_append(slugs,'ad-networks/' || owner_slug);
            entities := array_append(entities,'ad_networks'); entity_slugs := array_append(entity_slugs,owner_slug);
          end loop;
        end if;
      when 'launch_directories' then
        slugs := array_append(slugs,'launch-directories');
        entities := array_append(entities,'launch_directories'); entity_slugs := array_append(entity_slugs,'launch-directories');
      when 'terminal_apps' then
        slugs := array_append(slugs,'cli-apps');
        entities := array_append(entities,'cli_apps'); entity_slugs := array_append(entity_slugs,'cli-apps');
      when 'github_projects' then
        if exists(select 1 from public.self_host_apps app where app.github_project_id=(value->>'id')::uuid and app.published and app.self_hosting_status='self_hostable') then
          slugs := array_append(slugs,'self-host-apps');
          slugs := slugs || coalesce((select array_agg('self-host-apps/' || app.slug) from public.self_host_apps app
            where app.published and app.self_hosting_status='self_hostable' and (
              (tg_table_name='github_projects' and app.github_project_id=(value->>'id')::uuid) or
              (tg_table_name='self_host_app_categories' and exists(select 1 from public.self_host_app_category_links link
                where link.app_id=app.id and link.category_id=(value->>'id')::uuid))
            )), '{}'::text[]);
          entities := array_append(entities,'self_host_catalog'); entity_slugs := array_append(entity_slugs,'all');
        end if;
        if exists(select 1 from public.terminal_apps app where app.github_project_id=(value->>'id')::uuid and app.published) then
          slugs := array_append(slugs,'cli-apps');
          entities := array_append(entities,'cli_apps'); entity_slugs := array_append(entity_slugs,'cli-apps');
        end if;
      when 'self_host_app_categories' then
        if exists(select 1 from public.self_host_app_category_links link join public.self_host_apps app on app.id=link.app_id
          where link.category_id=(value->>'id')::uuid and app.published and app.self_hosting_status='self_hostable') then
          slugs := array_append(slugs,'self-host-apps');
          slugs := slugs || coalesce((select array_agg('self-host-apps/' || app.slug) from public.self_host_apps app
            where app.published and app.self_hosting_status='self_hostable' and (
              (tg_table_name='github_projects' and app.github_project_id=(value->>'id')::uuid) or
              (tg_table_name='self_host_app_categories' and exists(select 1 from public.self_host_app_category_links link
                where link.app_id=app.id and link.category_id=(value->>'id')::uuid))
            )), '{}'::text[]);
          entities := array_append(entities,'self_host_catalog'); entity_slugs := array_append(entity_slugs,'all');
        end if;
      else
        if tg_table_name='self_host_apps' then owner_slug := value->>'slug';
        else
          select app.slug into owner_slug from public.self_host_apps app where app.id=(value->>'app_id')::uuid
            and app.published and app.self_hosting_status='self_hostable';
        end if;
        if owner_slug is not null then
          slugs := slugs || array['self-host-apps','self-host-apps/' || owner_slug];
          entities := array_append(entities,'self_host_app'); entity_slugs := array_append(entity_slugs,owner_slug);
        end if;
    end case;

    -- Both transition snapshots preserve removed memberships and old category slugs.
    if tg_table_name = 'terminal_apps' then
      slugs := slugs || coalesce((select array_agg('cli-apps/categories/' || category)
        from jsonb_array_elements_text(value->'categories') category), '{}'::text[]);
    elsif tg_table_name = 'github_projects' then
      slugs := slugs || coalesce((select array_agg(distinct 'cli-apps/categories/' || category)
        from public.terminal_apps app cross join lateral unnest(app.categories) category
        where app.published and app.github_project_id=(value->>'id')::uuid), '{}'::text[]);
    end if;
    if tg_table_name = 'self_host_app_categories' then
      slugs := array_append(slugs, 'self-host-apps/categories/' || (value->>'slug'));
    elsif tg_table_name = 'self_host_app_category_links' then
      slugs := slugs || coalesce((select array_agg('self-host-apps/categories/' || category.slug)
        from public.self_host_app_categories category where category.id=(value->>'category_id')::uuid
        and exists(select 1 from public.self_host_apps app where app.id=(value->>'app_id')::uuid
          and app.published and app.self_hosting_status='self_hostable')), '{}'::text[]);
    elsif tg_table_name in ('self_host_apps','self_host_app_resource_estimates','self_host_app_install_options','github_projects') then
      slugs := slugs || coalesce((select array_agg(distinct 'self-host-apps/categories/' || category.slug)
        from public.self_host_app_categories category join public.self_host_app_category_links link on link.category_id=category.id
        where (tg_table_name='self_host_apps' and link.app_id=(value->>'id')::uuid)
           or (tg_table_name in ('self_host_app_resource_estimates','self_host_app_install_options') and link.app_id=(value->>'app_id')::uuid
             and exists(select 1 from public.self_host_apps app where app.id=link.app_id and app.published and app.self_hosting_status='self_hostable'))
           or (tg_table_name='github_projects' and exists(select 1 from public.self_host_apps app where app.id=link.app_id
             and app.published and app.self_hosting_status='self_hostable' and app.github_project_id=(value->>'id')::uuid))), '{}'::text[]);
    end if;
  end loop;
  for owner_slug in select distinct unnest(slugs) order by 1 loop
    if owner_slug like 'self-host-apps/categories/%' or owner_slug like 'cli-apps/categories/%' then
      if public.stack127_app_category_count(owner_slug) < 15 then
        -- Falling below the threshold retires a page; growth never auto-publishes it.
        update public.stack127_pages set is_published=false,published_at=null,updated_at=null where slug=owner_slug and is_published;
      end if;
    end if;
    perform public.stack127_touch_page(owner_slug,tg_table_name);
  end loop;
  for idx in select distinct on (entities[n],entity_slugs[n]) n from generate_subscripts(entities,1) n loop
    perform public.stack127_enqueue_revalidation(entities[idx],entity_slugs[idx],tg_table_name);
  end loop;
  return null;
end;
$$;

-- Remove links while a deleted published app is still visible to the statement trigger.
-- FK cascades alone run after the owner is gone and lose its publication state.
create function public.stack127_remove_published_app_category_links()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
  if old.published and old.self_hosting_status='self_hostable' then
    delete from public.self_host_app_category_links where app_id=old.id;
  end if;
  return old;
end;
$$;
revoke all on function public.stack127_remove_published_app_category_links() from public,anon,authenticated;
create trigger stack127_remove_published_app_category_links before delete on public.self_host_apps
for each row execute function public.stack127_remove_published_app_category_links();
commit;
