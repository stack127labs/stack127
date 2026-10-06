begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

-- A directory child change also updates its registered directory ancestors.
create function public.stack127_touch_page(p_slug text, p_reason text)
returns void language plpgsql security invoker set search_path = pg_catalog as $$
declare target record;
begin
  if p_reason is null or btrim(p_reason) = '' then raise exception 'A page change reason is required'; end if;
  for target in
    select page.slug from public.stack127_pages page
    where page.slug = p_slug or (
      page.page_family = 'directory' and left(p_slug, length(page.slug) + 1) = page.slug || '/'
      and exists (select 1 from public.stack127_pages child where child.slug = p_slug and child.page_family = 'directory')
    ) order by page.slug
  loop
    update public.stack127_pages set updated_at = case when is_published then now() else null end
    where slug = target.slug and updated_at is distinct from case when is_published then now() else null end;
    perform public.stack127_enqueue_revalidation('page', target.slug, p_reason);
  end loop;
end;
$$;
revoke all on function public.stack127_touch_page(text,text) from public, anon, authenticated;
grant execute on function public.stack127_touch_page(text,text) to service_role;

create or replace function public.touch_stack127_tool_page_public_date()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if (new.title,new.intro_markdown,new.usage_markdown,new.content_markdown,new.tool_version)
    is distinct from (old.title,old.intro_markdown,old.usage_markdown,old.content_markdown,old.tool_version) then
    perform public.stack127_touch_page((select slug from public.stack127_pages where id=new.page_id), 'tool_content');
  end if;
  return new;
end;
$$;

create or replace function public.stack127_touch_directory_content()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if tg_op='UPDATE' and (to_jsonb(new)-'row_updated_at') is not distinct from (to_jsonb(old)-'row_updated_at') then return null; end if;
  if tg_op<>'INSERT' then
    perform public.stack127_touch_page((select slug from public.stack127_pages where id=old.page_id),'directory_content');
  end if;
  if tg_op<>'DELETE' then
    perform public.stack127_touch_page((select slug from public.stack127_pages where id=new.page_id),'directory_content');
  end if;
  return null;
end;
$$;

-- Compare public records, excluding write timestamps and crawler bookkeeping.
create function public.stack127_directory_record_value(p_table text, p_row jsonb)
returns jsonb language plpgsql immutable security invoker set search_path = pg_catalog as $$
begin
  case p_table
    when 'ad_network_publishers' then
      return jsonb_build_object('id',p_row->'id','normalized_domain',p_row->'normalized_domain','display_domain',p_row->'display_domain');
    when 'ad_network_publisher_relationships' then
      if p_row->>'status' <> 'confirmed' then return null; end if;
      return jsonb_build_object('ad_network_id',p_row->'ad_network_id','publisher_id',p_row->'publisher_id',
        'relationship_type',p_row->'relationship_type','last_confirmed_at',p_row->'last_confirmed_at');
    when 'ad_networks' then
      return jsonb_build_object('id',p_row->'id','slug',p_row->'slug','name',p_row->'name',
        'official_url',p_row->'official_url','summary',p_row->'summary');
    when 'launch_directories' then
      if p_row->>'is_published' <> 'true' then return null; end if;
      return p_row - array['created_at','updated_at','research_notes'];
    when 'terminal_apps' then
      if p_row->>'published' <> 'true' then return null; end if;
      return p_row - array['created_at','updated_at','self_host_app_id'];
    when 'self_host_apps' then
      if p_row->>'published' <> 'true' or p_row->>'self_hosting_status' <> 'self_hostable' then return null; end if;
      return p_row - array['created_at','updated_at','data_checked_at','data_confidence','data_source_urls',
        'source_repo_id','github_repo_id','github_node_id','github_full_name','github_owner_type',
        'source_full_name','source_watchers','source_open_issues','source_languages','source_updated_at',
        'source_default_branch','source_repo_size_kb','source_disabled','source_is_fork','source_is_template',
        'github_watchers','github_open_issues','github_languages','github_updated_at','github_default_branch',
        'github_repo_size_kb','github_disabled','github_is_fork','github_is_template'];
    when 'github_projects' then
      return jsonb_build_object('id',p_row->'id','owner',p_row->'owner','repo',p_row->'repo',
        'stars',p_row->'stars','forks',p_row->'forks','primary_language',p_row->'primary_language','topics',p_row->'topics',
        'created_at',p_row->'created_at','pushed_at',p_row->'pushed_at','latest_release',p_row->'latest_release',
        'latest_release_at',p_row->'latest_release_at','last_commit_at',p_row->'last_commit_at',
        'checked_at',p_row->'checked_at','archived',p_row->'archived');
    when 'self_host_app_install_options' then
      return jsonb_build_object('app_id',p_row->'app_id','options',p_row->'options');
    else
      return p_row - array['created_at','updated_at','row_updated_at'];
  end case;
end;
$$;
revoke all on function public.stack127_directory_record_value(text,jsonb) from public, anon, authenticated;
grant execute on function public.stack127_directory_record_value(text,jsonb) to service_role;

create function public.stack127_platform_fee_group_slug(p_name text)
returns text language sql immutable security invoker set search_path = pg_catalog as $$
  select case p_name
    when 'Apps and software' then 'apps-and-software'
    when 'Digital products and stores' then 'digital-products-and-stores'
    when 'Creative assets' then 'creative-assets'
    when 'Music and audio' then 'music-and-audio'
    when 'Writing and books' then 'writing-and-books'
    when 'Teaching and courses' then 'teaching-and-courses'
    when 'Creators and communities' then 'creators-and-communities'
    when 'Payments' then 'payments'
  end
$$;
revoke all on function public.stack127_platform_fee_group_slug(text) from public, anon, authenticated;
grant execute on function public.stack127_platform_fee_group_slug(text) to service_role;

-- Transition tables let one statement refresh each affected page once.
create function public.stack127_touch_directory_records()
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
        slugs := array_append(slugs,'ad-networks');
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
        if exists(select 1 from public.self_host_apps app where app.github_project_id=(value->>'id')::bigint and app.published and app.self_hosting_status='self_hostable') then
          slugs := array_append(slugs,'self-host-apps');
          entities := array_append(entities,'self_host_catalog'); entity_slugs := array_append(entity_slugs,'all');
        end if;
        if exists(select 1 from public.terminal_apps app where app.github_project_id=(value->>'id')::bigint and app.published) then
          slugs := array_append(slugs,'cli-apps');
          entities := array_append(entities,'cli_apps'); entity_slugs := array_append(entity_slugs,'cli-apps');
        end if;
      when 'self_host_app_categories' then
        if exists(select 1 from public.self_host_app_category_links link join public.self_host_apps app on app.id=link.app_id
          where link.category_id=(value->>'id')::bigint and app.published and app.self_hosting_status='self_hostable') then
          slugs := array_append(slugs,'self-host-apps');
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
  end loop;
  for owner_slug in select distinct unnest(slugs) order by 1 loop
    perform public.stack127_touch_page(owner_slug,tg_table_name);
  end loop;
  for idx in select distinct on (entities[n],entity_slugs[n]) n from generate_subscripts(entities,1) n loop
    perform public.stack127_enqueue_revalidation(entities[idx],entity_slugs[idx],tg_table_name);
  end loop;
  return null;
end;
$$;
revoke all on function public.stack127_touch_directory_records() from public, anon, authenticated;
grant execute on function public.stack127_touch_directory_records() to service_role;

drop trigger stack127_queue_platform_section_change on public.platform_fee_sections;
create trigger stack127_touch_platform_fee_sections_insert
after insert on public.platform_fee_sections referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_platform_fee_sections_update
after update on public.platform_fee_sections referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_platform_fee_sections_delete
after delete on public.platform_fee_sections referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_platform_entry_change on public.platform_fee_entries;
create trigger stack127_touch_platform_fee_entries_insert
after insert on public.platform_fee_entries referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_platform_fee_entries_update
after update on public.platform_fee_entries referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_platform_fee_entries_delete
after delete on public.platform_fee_entries referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_ad_network_change on public.ad_networks;
create trigger stack127_touch_ad_networks_insert
after insert on public.ad_networks referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_ad_networks_update
after update on public.ad_networks referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_ad_networks_delete
after delete on public.ad_networks referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_ad_relationship_change on public.ad_network_publisher_relationships;
create trigger stack127_touch_ad_network_publisher_relationships_insert
after insert on public.ad_network_publisher_relationships referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_ad_network_publisher_relationships_update
after update on public.ad_network_publisher_relationships referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_ad_network_publisher_relationships_delete
after delete on public.ad_network_publisher_relationships referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_ad_publisher_change on public.ad_network_publishers;
create trigger stack127_touch_ad_network_publishers_insert
after insert on public.ad_network_publishers referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_ad_network_publishers_update
after update on public.ad_network_publishers referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_ad_network_publishers_delete
after delete on public.ad_network_publishers referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_launch_directory_change on public.launch_directories;
create trigger stack127_touch_launch_directories_insert
after insert on public.launch_directories referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_launch_directories_update
after update on public.launch_directories referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_launch_directories_delete
after delete on public.launch_directories referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_cli_change on public.terminal_apps;
create trigger stack127_touch_terminal_apps_insert
after insert on public.terminal_apps referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_terminal_apps_update
after update on public.terminal_apps referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_terminal_apps_delete
after delete on public.terminal_apps referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_app_change on public.self_host_apps;
create trigger stack127_touch_self_host_apps_insert
after insert on public.self_host_apps referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_apps_update
after update on public.self_host_apps referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_apps_delete
after delete on public.self_host_apps referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_resource_change on public.self_host_app_resource_estimates;
create trigger stack127_touch_self_host_app_resource_estimates_insert
after insert on public.self_host_app_resource_estimates referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_resource_estimates_update
after update on public.self_host_app_resource_estimates referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_resource_estimates_delete
after delete on public.self_host_app_resource_estimates referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_install_change on public.self_host_app_install_options;
create trigger stack127_touch_self_host_app_install_options_insert
after insert on public.self_host_app_install_options referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_install_options_update
after update on public.self_host_app_install_options referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_install_options_delete
after delete on public.self_host_app_install_options referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_category_change on public.self_host_app_category_links;
create trigger stack127_touch_self_host_app_category_links_insert
after insert on public.self_host_app_category_links referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_category_links_update
after update on public.self_host_app_category_links referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_category_links_delete
after delete on public.self_host_app_category_links referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_category_catalog_change on public.self_host_app_categories;
create trigger stack127_touch_self_host_app_categories_insert
after insert on public.self_host_app_categories referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_categories_update
after update on public.self_host_app_categories referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_self_host_app_categories_delete
after delete on public.self_host_app_categories referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

drop trigger stack127_queue_github_catalog_change on public.github_projects;
create trigger stack127_touch_github_projects_insert
after insert on public.github_projects referencing new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_github_projects_update
after update on public.github_projects referencing old table as old_rows new table as new_rows
for each statement execute function public.stack127_touch_directory_records();
create trigger stack127_touch_github_projects_delete
after delete on public.github_projects referencing old table as old_rows
for each statement execute function public.stack127_touch_directory_records();

-- Remember compared code records so an identical shortcut sync keeps public dates.
create table public.stack127_directory_record_state (
  page_id bigint primary key references public.stack127_directory_pages(page_id) on delete cascade,
  records jsonb not null
);
alter table public.stack127_directory_record_state enable row level security;
revoke all on public.stack127_directory_record_state from public, anon, authenticated;
grant select,insert,update,delete on public.stack127_directory_record_state to service_role;

create function public.stack127_sync_directory_records(p_slug text,p_records jsonb)
returns boolean language plpgsql security invoker set search_path = pg_catalog as $$
declare id bigint; previous jsonb;
begin
  select page.id into id from public.stack127_pages page join public.stack127_directory_pages content on content.page_id=page.id
    where page.slug=p_slug and page.page_family='directory' for update of page;
  if id is null then raise exception 'Directory page not found: %',p_slug; end if;
  select records into previous from public.stack127_directory_record_state where page_id=id;
  if previous is not distinct from p_records then return false; end if;
  insert into public.stack127_directory_record_state(page_id,records) values(id,p_records)
    on conflict(page_id) do update set records=excluded.records;
  -- The first snapshot establishes a baseline. Only later differences move dates.
  if previous is null then return false; end if;
  perform public.stack127_touch_page(p_slug,'code_records_sync');
  return true;
end;
$$;
revoke all on function public.stack127_sync_directory_records(text,jsonb) from public, anon, authenticated;
grant execute on function public.stack127_sync_directory_records(text,jsonb) to service_role;
notify pgrst,'reload schema';
commit;
