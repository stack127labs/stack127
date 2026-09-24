-- Public cache changes are coalesced by entity and slug. Only the trusted
-- deployment worker can read and remove these rows.
create table public.stack127_revalidation_events (
  id bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('page', 'self_host_app', 'self_host_catalog', 'cli_apps')),
  slug text not null,
  source text not null,
  created_at timestamptz not null default now(),
  attempts integer not null default 0,
  last_error text,
  unique (entity_type, slug)
);

create index stack127_revalidation_events_created_idx
  on public.stack127_revalidation_events (created_at, id);

create table public.stack127_cache_warm_events (
  path text primary key,
  created_at timestamptz not null default now(),
  attempts integer not null default 0
);

create index stack127_cache_warm_events_created_idx
  on public.stack127_cache_warm_events (created_at);

alter table public.stack127_revalidation_events enable row level security;
alter table public.stack127_cache_warm_events enable row level security;
revoke all on public.stack127_revalidation_events from anon, authenticated;
revoke all on public.stack127_cache_warm_events from anon, authenticated;
grant select, insert, update, delete on public.stack127_revalidation_events to service_role;
grant select, insert, update, delete on public.stack127_cache_warm_events to service_role;
grant usage on sequence public.stack127_revalidation_events_id_seq to service_role;

create function public.stack127_enqueue_revalidation(p_type text, p_slug text, p_source text)
returns void language plpgsql set search_path = pg_catalog, public as $$
begin
  if p_slug is null then return; end if;
  insert into public.stack127_revalidation_events (entity_type, slug, source)
  values (p_type, lower(trim(both '/' from p_slug)), p_source)
  on conflict (entity_type, slug) do update set
    source = excluded.source,
    created_at = now(),
    attempts = 0,
    last_error = null;
end;
$$;
revoke all on function public.stack127_enqueue_revalidation(text, text, text) from public, anon, authenticated;
grant execute on function public.stack127_enqueue_revalidation(text, text, text) to service_role;

create function public.stack127_queue_page_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'DELETE' then
    perform public.stack127_enqueue_revalidation('page', old.slug, 'page_delete');
  elsif tg_op = 'INSERT' then
    perform public.stack127_enqueue_revalidation('page', new.slug, 'page_insert');
  elsif (to_jsonb(new) - 'row_updated_at') is distinct from (to_jsonb(old) - 'row_updated_at') then
    perform public.stack127_enqueue_revalidation('page', new.slug, 'page_update');
    if old.slug is distinct from new.slug then
      perform public.stack127_enqueue_revalidation('page', old.slug, 'page_rename');
    end if;
  end if;
  return null;
end;
$$;

create trigger stack127_queue_page_change
after insert or update or delete on public.stack127_pages
for each row execute function public.stack127_queue_page_change();

create function public.stack127_queue_tool_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare page_slug text;
begin
  if tg_op = 'UPDATE' and old.page_id is distinct from new.page_id then
    select slug into page_slug from public.stack127_pages where id = old.page_id;
    if page_slug is not null then
      perform public.stack127_enqueue_revalidation('page', page_slug, 'tool_content_move');
    end if;
  end if;
  if tg_op = 'DELETE' then
    select slug into page_slug from public.stack127_pages where id = old.page_id;
  else
    select slug into page_slug from public.stack127_pages where id = new.page_id;
  end if;
  if page_slug is not null then
    perform public.stack127_enqueue_revalidation('page', page_slug, 'tool_content');
  end if;
  return null;
end;
$$;

create trigger stack127_queue_tool_change
after insert or update or delete on public.stack127_tool_pages
for each row execute function public.stack127_queue_tool_change();

create function public.stack127_queue_app_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if tg_op = 'DELETE' then
    if old.published then
      perform public.stack127_enqueue_revalidation('self_host_app', old.slug, 'app_delete');
    end if;
  elsif tg_op = 'INSERT' then
    if new.published then
      perform public.stack127_enqueue_revalidation('self_host_app', new.slug, 'app_insert');
    end if;
  elsif (old.published or new.published) and new is distinct from old then
    perform public.stack127_enqueue_revalidation('self_host_app', new.slug, 'app_update');
    if old.slug is distinct from new.slug then
      perform public.stack127_enqueue_revalidation('self_host_app', old.slug, 'app_rename');
    end if;
  end if;
  return null;
end;
$$;

create trigger stack127_queue_app_change
after insert or update or delete on public.self_host_apps
for each row execute function public.stack127_queue_app_change();

create function public.stack127_queue_app_child_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
declare app_slug text;
begin
  if tg_op = 'UPDATE' and old.app_id is distinct from new.app_id then
    select slug into app_slug from public.self_host_apps
    where id = old.app_id and published = true;
    if app_slug is not null then
      perform public.stack127_enqueue_revalidation('self_host_app', app_slug, tg_table_name);
    end if;
  end if;
  if tg_op = 'DELETE' then
    select slug into app_slug from public.self_host_apps
    where id = old.app_id and published = true;
  else
    select slug into app_slug from public.self_host_apps
    where id = new.app_id and published = true;
  end if;
  if app_slug is not null then
    perform public.stack127_enqueue_revalidation('self_host_app', app_slug, tg_table_name);
  end if;
  return null;
end;
$$;

create trigger stack127_queue_resource_change
after insert or update or delete on public.self_host_app_resource_estimates
for each row execute function public.stack127_queue_app_child_change();

create trigger stack127_queue_install_change
after insert or update or delete on public.self_host_app_install_options
for each row execute function public.stack127_queue_app_child_change();

create trigger stack127_queue_category_change
after insert or update or delete on public.self_host_app_category_links
for each row execute function public.stack127_queue_app_child_change();

create function public.stack127_queue_cli_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  perform public.stack127_enqueue_revalidation('cli_apps', 'cli-apps', 'cli_catalog');
  return null;
end;
$$;

create trigger stack127_queue_cli_change
after insert or update or delete on public.terminal_apps
for each statement execute function public.stack127_queue_cli_change();

create function public.stack127_queue_catalog_change()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  perform public.stack127_enqueue_revalidation('self_host_catalog', 'all', tg_table_name);
  return null;
end;
$$;

create trigger stack127_queue_github_catalog_change
after insert or update or delete on public.github_projects
for each statement execute function public.stack127_queue_catalog_change();

create trigger stack127_queue_category_catalog_change
after insert or update or delete on public.self_host_app_categories
for each statement execute function public.stack127_queue_catalog_change();

-- The public sort uses both keys; the older name-only index still leaves a
-- 5,000-row scan and sort in the measured plan.
create index self_host_apps_public_name_slug_idx
  on public.self_host_apps (name, slug)
  where published = true and self_hosting_status = 'self_hostable';

analyze public.self_host_apps;
