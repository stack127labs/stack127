-- Terminal apps directory schema: dedicated tables for /cli-apps.
-- Terminal apps are intentionally separate from public.open_projects so that
-- closed-source, freeware, freemium, paid, and hosted tools can be listed
-- without forcing them into the open-project model.

begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.terminal_app_source_model as enum (
    'open_source',
    'source_available',
    'closed_source',
    'freeware',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.terminal_app_pricing_model as enum (
    'free',
    'freemium',
    'paid',
    'subscription',
    'usage_based',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.terminal_app_maintenance_status as enum (
    'active',
    'slow',
    'stale',
    'archived',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.terminal_app_candidate_status as enum (
    'discovered',
    'duplicate',
    'needs_review',
    'enriched',
    'published',
    'excluded',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.terminal_apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  aliases text[] not null default '{}',
  summary text not null,
  primary_type text not null default 'cli'
    check (primary_type in (
      'cli', 'tui', 'terminal_emulator', 'shell', 'multiplexer', 'prompt',
      'launcher', 'file_manager', 'editor', 'monitor', 'ai_agent', 'game',
      'mail', 'browser', 'media', 'other'
    )),
  additional_types text[] not null default '{}',
  categories text[] not null default '{}'
    check (cardinality(categories) between 0 and 3),
  platforms text[] not null default '{}',
  language text,
  install_methods text[] not null default '{}',
  website_url text,
  docs_url text,
  repository_url text,
  source_model public.terminal_app_source_model not null default 'unknown',
  pricing_model public.terminal_app_pricing_model not null default 'unknown',
  license text,
  latest_version text,
  latest_release_at timestamptz,
  stars integer check (stars is null or stars >= 0),
  last_commit_at timestamptz,
  maintenance_status public.terminal_app_maintenance_status not null default 'unknown',
  icon_url text,
  screenshot_url text,
  open_project_id uuid references public.open_projects(id) on delete set null,
  last_verified_at date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.terminal_app_import_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_url text,
  status text not null default 'running'
    check (status in ('running', 'completed', 'partial', 'failed')),
  discovered_count integer not null default 0 check (discovered_count >= 0),
  imported_count integer not null default 0 check (imported_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  notes text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.terminal_app_candidates (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid references public.terminal_app_import_runs(id) on delete set null,
  source text not null,
  source_type text not null default 'directory'
    check (source_type in (
      'directory', 'awesome_list', 'github_topic', 'package_registry',
      'community', 'manual'
    )),
  source_key text not null,
  source_url text,
  name text not null,
  slug text not null,
  normalized_name text not null,
  dedupe_key text not null,
  canonical_repo_key text,
  canonical_website_key text,
  summary_raw text,
  website_url text,
  repository_url text,
  docs_url text,
  install_hint text,
  license_raw text,
  language_raw text,
  stars integer check (stars is null or stars >= 0),
  latest_version text,
  latest_release_at timestamptz,
  categories_raw text[] not null default '{}',
  platforms_raw text[] not null default '{}',
  install_methods_raw text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  status public.terminal_app_candidate_status not null default 'discovered',
  duplicate_of_id uuid references public.terminal_app_candidates(id) on delete set null,
  duplicate_reason text,
  exclusion_reason text,
  review_notes text,
  confidence_score integer not null default 0
    check (confidence_score between 0 and 100),
  linked_app_id uuid references public.terminal_apps(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_key)
);

create table if not exists public.terminal_app_field_sources (
  app_id uuid not null references public.terminal_apps(id) on delete cascade,
  field_name text not null,
  source text not null,
  source_url text,
  confidence text not null default 'unknown'
    check (confidence in ('high', 'medium', 'low', 'unknown')),
  checked_at timestamptz not null default now(),
  note text,
  primary key (app_id, field_name)
);

create index if not exists terminal_apps_published_name_idx
  on public.terminal_apps (name)
  where published = true;

create index if not exists terminal_apps_categories_idx
  on public.terminal_apps using gin (categories);

create index if not exists terminal_apps_platforms_idx
  on public.terminal_apps using gin (platforms);

create index if not exists terminal_apps_stars_idx
  on public.terminal_apps (stars desc nulls last)
  where published = true;

create index if not exists terminal_apps_open_project_idx
  on public.terminal_apps (open_project_id)
  where open_project_id is not null;

create index if not exists terminal_app_candidates_status_score_idx
  on public.terminal_app_candidates (status, confidence_score desc, first_seen_at);

create index if not exists terminal_app_candidates_slug_idx
  on public.terminal_app_candidates (slug);

create index if not exists terminal_app_candidates_dedupe_key_idx
  on public.terminal_app_candidates (dedupe_key);

create index if not exists terminal_app_candidates_repo_key_idx
  on public.terminal_app_candidates (canonical_repo_key)
  where canonical_repo_key is not null;

create index if not exists terminal_app_candidates_website_key_idx
  on public.terminal_app_candidates (canonical_website_key)
  where canonical_website_key is not null;

create index if not exists terminal_app_candidates_linked_app_idx
  on public.terminal_app_candidates (linked_app_id)
  where linked_app_id is not null;

create index if not exists terminal_app_field_sources_field_idx
  on public.terminal_app_field_sources (field_name);

create trigger set_terminal_apps_updated_at
before update on public.terminal_apps
for each row execute function public.set_updated_at();

create trigger set_terminal_app_candidates_updated_at
before update on public.terminal_app_candidates
for each row execute function public.set_updated_at();

alter table public.terminal_apps enable row level security;
alter table public.terminal_app_import_runs enable row level security;
alter table public.terminal_app_candidates enable row level security;
alter table public.terminal_app_field_sources enable row level security;

revoke all on table public.terminal_apps from anon, authenticated;
revoke all on table public.terminal_app_import_runs from anon, authenticated;
revoke all on table public.terminal_app_candidates from anon, authenticated;
revoke all on table public.terminal_app_field_sources from anon, authenticated;

commit;
