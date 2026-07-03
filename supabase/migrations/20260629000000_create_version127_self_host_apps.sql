create extension if not exists pgcrypto;

drop table if exists public.self_host_apps_categories_join_table cascade;
drop table if exists public.self_host_app_categories cascade;
drop table if exists public.self_host_app_github_snapshots cascade;
drop table if exists public.self_host_apps cascade;
drop table if exists public.self_host_apps_categories cascade;
drop table if exists public.categories cascade;

create table public.self_host_apps_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon_key text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.self_host_apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  summary text not null,
  icon_url text,
  website_url text,
  repository_url text,
  docs_url text,
  install_docs_url text,
  docker_url text,
  license text,
  publisher_name text,
  publisher_type text not null default 'unknown'
    check (publisher_type in ('company', 'foundation', 'community', 'individual', 'unknown')),
  publisher_url text,
  published boolean not null default false,
  maintenance_status text not null default 'unknown'
    check (maintenance_status in ('active', 'slow', 'stale', 'archived', 'unknown')),
  github_owner text,
  github_repo text,
  github_stars integer check (github_stars is null or github_stars >= 0),
  github_latest_release text,
  github_latest_release_at timestamptz,
  github_last_commit_at timestamptz,
  github_checked_at timestamptz,
  docker_support text not null default 'unknown'
    check (docker_support in ('official', 'community', 'none', 'unknown')),
  compose_support boolean,
  requires_database boolean,
  database_types text[] not null default '{}',
  ram_mb integer check (ram_mb is null or ram_mb >= 0),
  storage_profile text not null default 'unknown'
    check (storage_profile in ('tiny', 'low', 'medium', 'high', 'depends', 'unknown')),
  platforms text[] not null default '{}',
  summary_source text not null default 'curated',
  summary_confidence text not null default 'unknown'
    check (summary_confidence in ('high', 'medium', 'low', 'unknown')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.self_host_apps_categories_join_table (
  app_id uuid not null references public.self_host_apps(id) on delete cascade,
  category_id uuid not null references public.self_host_apps_categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (app_id, category_id)
);

create table public.self_host_apps_import_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  status text not null default 'running'
    check (status in ('running', 'completed', 'failed', 'partial')),
  discovered_count integer not null default 0 check (discovered_count >= 0),
  imported_count integer not null default 0 check (imported_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  notes text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.self_host_apps_sources (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.self_host_apps(id) on delete set null,
  import_run_id uuid references public.self_host_apps_import_runs(id) on delete set null,
  source text not null,
  source_key text not null,
  source_url text,
  payload jsonb not null default '{}'::jsonb,
  imported_at timestamptz not null default now(),
  unique (source, source_key)
);

create table public.self_host_apps_field_sources (
  app_id uuid not null references public.self_host_apps(id) on delete cascade,
  field_name text not null,
  source text not null,
  source_url text,
  confidence text not null default 'unknown'
    check (confidence in ('high', 'medium', 'low', 'unknown')),
  checked_at timestamptz not null default now(),
  note text,
  primary key (app_id, field_name)
);

create table public.self_host_apps_curated_overrides (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.self_host_apps(id) on delete cascade,
  slug text,
  field_name text not null,
  value jsonb not null,
  note text,
  updated_at timestamptz not null default now(),
  check (app_id is not null or slug is not null)
);

create index self_host_apps_published_name_idx
  on public.self_host_apps (published, name);

create index self_host_apps_maintenance_idx
  on public.self_host_apps (maintenance_status);

create index self_host_apps_github_stars_idx
  on public.self_host_apps (github_stars desc nulls last);

create index self_host_apps_categories_join_table_category_idx
  on public.self_host_apps_categories_join_table (category_id);

create index self_host_apps_sources_app_id_idx
  on public.self_host_apps_sources (app_id);

create index self_host_apps_sources_import_run_idx
  on public.self_host_apps_sources (import_run_id);

create index self_host_apps_field_sources_field_idx
  on public.self_host_apps_field_sources (field_name);

create index self_host_apps_curated_overrides_app_field_idx
  on public.self_host_apps_curated_overrides (app_id, field_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_self_host_apps_categories_updated_at
before update on public.self_host_apps_categories
for each row execute function public.set_updated_at();

create trigger set_self_host_apps_updated_at
before update on public.self_host_apps
for each row execute function public.set_updated_at();

create trigger set_self_host_apps_curated_overrides_updated_at
before update on public.self_host_apps_curated_overrides
for each row execute function public.set_updated_at();
