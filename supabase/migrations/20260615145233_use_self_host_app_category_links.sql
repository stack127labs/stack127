create table if not exists public.self_host_app_categories (
  app_id uuid not null references public.self_host_apps(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (app_id, category_id)
);

create index if not exists self_host_app_categories_category_id_idx
  on public.self_host_app_categories(category_id, app_id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'self_host_apps'
      and column_name = 'category_id'
  ) then
    insert into public.self_host_app_categories (app_id, category_id)
    select id, category_id
    from public.self_host_apps
    where category_id is not null
    on conflict (app_id, category_id) do nothing;
  end if;
end $$;

drop index if exists public.self_host_apps_category_id_idx;

alter table public.self_host_apps
  drop column if exists category_id;
