-- App records for the 12 app directories built from the indie hacker apps research
-- (/payment-providers, /hosting, /databases, ...). Ships in the same pull request as
-- the code that reads it. Nothing reads these tables or queues their cache events until
-- a directory's registry page is published, so production stays quiet until then.
--
-- public.indie_hacker_apps holds one row per app per research category.
-- public.indie_hacker_app_directories mirrors lib/indie-hacker-apps/directories.ts so
-- triggers know which directory pages a changed app belongs to. The import command
-- (scripts/indie-hacker-apps/import-apps.mjs) writes both tables.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

create table public.indie_hacker_app_directories (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  category text not null check (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  jobs text[] not null check (cardinality(jobs) > 0),
  sets text[] not null check (cardinality(sets) > 0),
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.indie_hacker_app_directories is
  'Copy of lib/indie-hacker-apps/directories.ts, written by the import command. Read by the app record triggers and cache revisions.';

create table public.indie_hacker_apps (
  category text not null check (category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (btrim(name) <> ''),
  url text not null check (url ~ '^https?://'),
  jobs text[] not null check (cardinality(jobs) > 0),
  line text not null,
  free_kind text not null check (free_kind in ('free', 'trial', 'credits', 'selfhost', 'none')),
  free_text text not null default '',
  cells jsonb not null default '{}'::jsonb check (jsonb_typeof(cells) = 'object'),
  costs jsonb not null default '{}'::jsonb check (jsonb_typeof(costs) = 'object'),
  status jsonb not null default '[]'::jsonb check (jsonb_typeof(status) = 'array'),
  checked date,
  icon text not null default '' check (icon = '' or icon ~ '^/indie-hacker-apps/icons/[a-z0-9-]+/[a-z0-9-]+\.png$'),
  news text not null default '',
  sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category, slug)
);
comment on table public.indie_hacker_apps is
  'One researched app per research category. jobs is ordered; jobs[1] is the main job. Written only by scripts/indie-hacker-apps/import-apps.mjs.';
comment on column public.indie_hacker_apps.costs is 'Cost rows per cost set: {set: [{v, plan, state, math}]}, one row per size level.';
comment on column public.indie_hacker_apps.status is 'Dated status events, newest first: [{label, tone, text, date}].';
comment on column public.indie_hacker_apps.checked is 'Latest checked date across the research facts. Null when no fact has a date.';
comment on column public.indie_hacker_apps.sections is 'Side panel fact sections: [{title, facts: [{label, value, state, url, checked}]}].';

create index indie_hacker_apps_jobs_idx on public.indie_hacker_apps using gin (jobs);

create trigger set_indie_hacker_apps_updated_at
before update on public.indie_hacker_apps
for each row execute function public.set_updated_at();
create trigger set_indie_hacker_app_directories_updated_at
before update on public.indie_hacker_app_directories
for each row execute function public.set_updated_at();

insert into public.indie_hacker_app_directories (slug, category, jobs, sets, position) values
  ('payment-providers', 'payments', '{mor,gateway,billing,links,crypto}', '{fee}', 1),
  ('hosting', 'hosting', '{paas,vps,panel,static}', '{work}', 2),
  ('databases', 'databases', '{sql,nosql,kv,backend,vector}', '{sql}', 3),
  ('file-storage', 'databases', '{files}', '{files}', 4),
  ('background-jobs', 'databases', '{jobs}', '{jobs}', 5),
  ('uptime-monitoring', 'error-monitoring', '{uptime,status}', '{uptime}', 6),
  ('error-tracking', 'error-monitoring', '{errors,logs,performance,cron}', '{errors}', 7),
  ('newsletter-tools', 'email', '{newsletter,marketing,multichannel}', '{subs}', 8),
  ('transactional-email', 'email', '{transactional}', '{appmail}', 9),
  ('analytics', 'analytics', '{web,product,replay,revenue}', '{pv}', 10),
  ('customer-support', 'customer-support', '{helpdesk,chat,ai,inbox,kb}', '{agents}', 11),
  ('auth-providers', 'auth', '{hosted,library,server}', '{mau}', 12);

alter table public.stack127_revalidation_events
  drop constraint stack127_revalidation_events_entity_type_check;
alter table public.stack127_revalidation_events
  add constraint stack127_revalidation_events_entity_type_check check (
    entity_type in ('page', 'self_host_app', 'self_host_catalog', 'cli_apps',
      'platform_fees', 'ad_networks', 'launch_directories', 'indie_hacker_apps')
  );

-- Touch and refresh each published directory page whose visible records changed. Old
-- and new rows both count, so an app that drops or gains a job refreshes both directories.
-- Identical re-imports and timestamp-only writes change nothing. Unpublished directories
-- queue nothing: stack127_queue_indie_hacker_app_publication queues the first event
-- when a directory's page is published.
create function public.stack127_touch_indie_hacker_apps()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare
  changed jsonb[];
  directory_slugs text[];
  target text;
begin
  if tg_op = 'INSERT' then
    select array_agg(to_jsonb(r) - 'created_at' - 'updated_at') into changed from new_rows r;
  elsif tg_op = 'DELETE' then
    select array_agg(to_jsonb(r) - 'created_at' - 'updated_at') into changed from old_rows r;
  else
    with before as (select to_jsonb(r) - 'created_at' - 'updated_at' as value from old_rows r),
      after as (select to_jsonb(r) - 'created_at' - 'updated_at' as value from new_rows r),
      changes as ((select value from before except select value from after)
        union (select value from after except select value from before))
    select array_agg(value) into changed from changes;
  end if;
  if changed is null then return null; end if;

  if tg_table_name = 'indie_hacker_app_directories' then
    select array_agg(distinct item.value ->> 'slug') into directory_slugs
    from unnest(changed) as item(value)
    join public.stack127_pages page on page.slug = item.value ->> 'slug' and page.is_published;
  else
    select array_agg(distinct directory.slug) into directory_slugs
    from unnest(changed) as item(value)
    join public.indie_hacker_app_directories directory
      on directory.category = item.value ->> 'category'
      and directory.jobs && array(select jsonb_array_elements_text(item.value -> 'jobs'))
    join public.stack127_pages page on page.slug = directory.slug and page.is_published;
  end if;

  for target in select unnest(coalesce(directory_slugs, '{}'::text[])) order by 1 loop
    perform public.stack127_touch_page(target, tg_table_name);
    perform public.stack127_enqueue_revalidation('indie_hacker_apps', target, tg_table_name);
  end loop;
  return null;
end;
$$;
revoke all on function public.stack127_touch_indie_hacker_apps() from public, anon, authenticated;
grant execute on function public.stack127_touch_indie_hacker_apps() to service_role;

create trigger stack127_touch_indie_hacker_apps_insert after insert on public.indie_hacker_apps
  referencing new table as new_rows for each statement execute function public.stack127_touch_indie_hacker_apps();
create trigger stack127_touch_indie_hacker_apps_update after update on public.indie_hacker_apps
  referencing old table as old_rows new table as new_rows for each statement execute function public.stack127_touch_indie_hacker_apps();
create trigger stack127_touch_indie_hacker_apps_delete after delete on public.indie_hacker_apps
  referencing old table as old_rows for each statement execute function public.stack127_touch_indie_hacker_apps();
create trigger stack127_touch_indie_hacker_app_directories_insert after insert on public.indie_hacker_app_directories
  referencing new table as new_rows for each statement execute function public.stack127_touch_indie_hacker_apps();
create trigger stack127_touch_indie_hacker_app_directories_update after update on public.indie_hacker_app_directories
  referencing old table as old_rows new table as new_rows for each statement execute function public.stack127_touch_indie_hacker_apps();
create trigger stack127_touch_indie_hacker_app_directories_delete after delete on public.indie_hacker_app_directories
  referencing old table as old_rows for each statement execute function public.stack127_touch_indie_hacker_apps();

-- Publishing or unpublishing a directory page queues its records event, so the cache
-- worker refreshes the JSON routes and records the new revision (none while unpublished)
-- instead of finding it later in the 15-minute revision check.
create function public.stack127_queue_indie_hacker_app_publication()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare
  candidates text[] := '{}';
  target text;
begin
  if tg_op in ('UPDATE', 'DELETE') and old.is_published then candidates := candidates || old.slug; end if;
  if tg_op in ('INSERT', 'UPDATE') and new.is_published then candidates := candidates || new.slug; end if;
  for target in
    select directory.slug from public.indie_hacker_app_directories directory
    where directory.slug = any(candidates) order by 1
  loop
    perform public.stack127_enqueue_revalidation('indie_hacker_apps', target, 'stack127_pages');
  end loop;
  return null;
end;
$$;
revoke all on function public.stack127_queue_indie_hacker_app_publication() from public, anon, authenticated;
grant execute on function public.stack127_queue_indie_hacker_app_publication() to service_role;

create trigger stack127_queue_indie_hacker_app_publication_insert after insert on public.stack127_pages
  for each row when (new.is_published) execute function public.stack127_queue_indie_hacker_app_publication();
create trigger stack127_queue_indie_hacker_app_publication_update after update of slug, is_published on public.stack127_pages
  for each row when ((old.slug, old.is_published) is distinct from (new.slug, new.is_published))
  execute function public.stack127_queue_indie_hacker_app_publication();
create trigger stack127_queue_indie_hacker_app_publication_delete after delete on public.stack127_pages
  for each row when (old.is_published) execute function public.stack127_queue_indie_hacker_app_publication();

-- Server-side reads only. Production's runtime role has no BYPASSRLS, so it gets the
-- same backend policy every public table has (scripts/stack127/selfhost-db/app-role.sql).
alter table public.indie_hacker_apps enable row level security;
alter table public.indie_hacker_app_directories enable row level security;
revoke all on table public.indie_hacker_apps from anon, authenticated;
revoke all on table public.indie_hacker_app_directories from anon, authenticated;
do $$
begin
  if exists (select 1 from pg_catalog.pg_roles where rolname = 'stack127_app') then
    grant select, insert, update, delete on public.indie_hacker_apps, public.indie_hacker_app_directories to stack127_app;
    create policy stack127_backend_access on public.indie_hacker_apps
      for all to stack127_app using (true) with check (true);
    create policy stack127_backend_access on public.indie_hacker_app_directories
      for all to stack127_app using (true) with check (true);
    grant execute on function public.stack127_touch_indie_hacker_apps() to stack127_app;
    grant execute on function public.stack127_queue_indie_hacker_app_publication() to stack127_app;
  end if;
end;
$$;

-- Same as 20261019103238_ad_network_cache_revision_tokens.sql, plus one revision per
-- published app directory. It reads slugs, job order and row write times, not the 30 MB
-- of record JSON. The import only writes changed rows, so updated_at moves only on real
-- changes. Unpublished directories have no revision, so the worker's revision check
-- queues nothing for them; an unpublished directory with a past revision reads as deleted.
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
  -- Shared report inputs can affect any network's rankings or comparisons.
  -- Reading one maintained token avoids reserializing the publisher dataset.
  select 'ad_networks', network.slug, md5(state.revision::text || ':' || network.id::text)
  from public.ad_networks network
  cross join public.stack127_ad_network_source_revision state
  where (p_types is null or 'ad_networks'=any(p_types)) and (p_slugs is null or network.slug=any(p_slugs))
  union all
  select 'ad_networks', 'all', md5(state.revision::text)
  from public.stack127_ad_network_source_revision state
  where (p_types is null or 'ad_networks'=any(p_types)) and (p_slugs is null or 'all'=any(p_slugs))
  union all
  select 'launch_directories', 'launch-directories', md5(coalesce(string_agg(to_jsonb(directory)::text, '' order by directory.slug), ''))
  from public.launch_directories directory
  having (p_types is null or 'launch_directories' = any(p_types)) and (p_slugs is null or 'launch-directories' = any(p_slugs))
  union all
  select 'indie_hacker_apps', directory.slug, md5(directory.category || '|' || array_to_string(directory.jobs, ',') || '|' ||
    array_to_string(directory.sets, ',') || '|' ||
    coalesce((select string_agg(app.slug || ':' || array_to_string(app.jobs, ' ') || ':' || extract(epoch from app.updated_at)::text, ',' order by app.slug)
      from public.indie_hacker_apps app where app.category = directory.category and app.jobs && directory.jobs), ''))
  from public.indie_hacker_app_directories directory
  join public.stack127_pages page on page.slug = directory.slug and page.is_published
  where (p_types is null or 'indie_hacker_apps' = any(p_types)) and (p_slugs is null or directory.slug = any(p_slugs))
$$;

commit;
