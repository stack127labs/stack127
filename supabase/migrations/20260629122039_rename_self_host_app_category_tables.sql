do $$
begin
  if to_regclass('public.categories') is not null
    and to_regclass('public.self_host_apps_categories') is null then
    alter table public.categories rename to self_host_apps_categories;
  end if;

  if to_regclass('public.self_host_app_categories') is not null
    and to_regclass('public.self_host_apps_categories_join_table') is null then
    alter table public.self_host_app_categories rename to self_host_apps_categories_join_table;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'categories_pkey'
      and conrelid = 'public.self_host_apps_categories'::regclass
  ) then
    alter table public.self_host_apps_categories
    rename constraint categories_pkey to self_host_apps_categories_pkey;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'categories_slug_key'
      and conrelid = 'public.self_host_apps_categories'::regclass
  ) then
    alter table public.self_host_apps_categories
    rename constraint categories_slug_key to self_host_apps_categories_slug_key;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'self_host_app_categories_pkey'
      and conrelid = 'public.self_host_apps_categories_join_table'::regclass
  ) then
    alter table public.self_host_apps_categories_join_table
    rename constraint self_host_app_categories_pkey
    to self_host_apps_categories_join_table_pkey;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'self_host_app_categories_app_id_fkey'
      and conrelid = 'public.self_host_apps_categories_join_table'::regclass
  ) then
    alter table public.self_host_apps_categories_join_table
    rename constraint self_host_app_categories_app_id_fkey
    to self_host_apps_categories_join_table_app_id_fkey;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'self_host_app_categories_category_id_fkey'
      and conrelid = 'public.self_host_apps_categories_join_table'::regclass
  ) then
    alter table public.self_host_apps_categories_join_table
    rename constraint self_host_app_categories_category_id_fkey
    to self_host_apps_categories_join_table_category_id_fkey;
  end if;
end $$;

alter index if exists public.categories_pkey
  rename to self_host_apps_categories_pkey;

alter index if exists public.categories_slug_key
  rename to self_host_apps_categories_slug_key;

alter index if exists public.self_host_app_categories_pkey
  rename to self_host_apps_categories_join_table_pkey;

alter index if exists public.self_host_app_categories_category_idx
  rename to self_host_apps_categories_join_table_category_idx;

do $$
begin
  if exists (
    select 1
    from pg_trigger
    where tgname = 'set_categories_updated_at'
      and tgrelid = 'public.self_host_apps_categories'::regclass
  ) then
    alter trigger set_categories_updated_at
    on public.self_host_apps_categories
    rename to set_self_host_apps_categories_updated_at;
  end if;
end $$;
