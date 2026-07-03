alter table public.self_host_apps
  add column if not exists install_docs_url text,
  add column if not exists summary_source text not null default 'curated',
  add column if not exists summary_confidence text not null default 'unknown';

alter table public.self_host_apps
  drop constraint if exists self_host_apps_summary_confidence_check;

alter table public.self_host_apps
  add constraint self_host_apps_summary_confidence_check
  check (summary_confidence in ('high', 'medium', 'low', 'unknown'));

create table if not exists public.self_host_apps_import_runs (
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

create table if not exists public.self_host_apps_sources (
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

create table if not exists public.self_host_apps_field_sources (
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

create table if not exists public.self_host_apps_curated_overrides (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references public.self_host_apps(id) on delete cascade,
  slug text,
  field_name text not null,
  value jsonb not null,
  note text,
  updated_at timestamptz not null default now(),
  check (app_id is not null or slug is not null)
);

create index if not exists self_host_apps_sources_app_id_idx
  on public.self_host_apps_sources (app_id);

create index if not exists self_host_apps_sources_import_run_idx
  on public.self_host_apps_sources (import_run_id);

create index if not exists self_host_apps_field_sources_field_idx
  on public.self_host_apps_field_sources (field_name);

create index if not exists self_host_apps_curated_overrides_app_field_idx
  on public.self_host_apps_curated_overrides (app_id, field_name);

drop trigger if exists set_self_host_apps_curated_overrides_updated_at
on public.self_host_apps_curated_overrides;

create trigger set_self_host_apps_curated_overrides_updated_at
before update on public.self_host_apps_curated_overrides
for each row execute function public.set_updated_at();
