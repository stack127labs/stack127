create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.self_host_apps (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  status text not null default 'draft',
  screenshots jsonb not null default '[]'::jsonb,
  youtube_video_url text,
  get_started text,
  verdict text,
  best_for text[] not null default '{}',
  not_best_for text[] not null default '{}',
  known_issues text[] not null default '{}',
  website_url text,
  source_code_url text,
  demo_url text,
  docker_url text,
  install_docs_url text,
  docs_url text,
  deployment_methods text[] not null default '{}',
  docker_support text,
  compose_support boolean,
  requires_database boolean,
  database_types text[] not null default '{}',
  requires_redis boolean,
  requires_object_storage boolean,
  supported_platforms text[] not null default '{}',
  ram_required_mb integer,
  ram_recommended_mb integer,
  storage_required_gb numeric,
  storage_notes text,
  cpu_notes text,
  gpu_notes text,
  storage_model text,
  backup_details text,
  backup_difficulty text,
  backup_criticality text,
  raid_notes text,
  actively_maintained boolean,
  maintenance_status text,
  maintenance_notes text,
  last_release_at timestamptz,
  last_commit_at timestamptz,
  github_owner text,
  github_repo text,
  github_stars integer,
  github_forks integer,
  github_open_issues integer,
  github_open_pull_requests integer,
  github_latest_release text,
  github_latest_release_at timestamptz,
  github_last_commit_at timestamptz,
  github_commit_count_90d integer,
  github_release_count_90d integer,
  github_updated_at timestamptz,
  github_checked_at timestamptz,
  alternative_app_ids uuid[] not null default '{}',
  replaces_apps text[] not null default '{}',
  client_apps jsonb not null default '[]'::jsonb,
  hardware_recommendations jsonb not null default '[]'::jsonb,
  data_confidence text,
  notes text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_checked_at timestamptz,
  constraint self_host_apps_status_check
    check (status in ('draft', 'published', 'archived')),
  constraint self_host_apps_docker_support_check
    check (docker_support is null or docker_support in ('official', 'community', 'none', 'unknown')),
  constraint self_host_apps_maintenance_status_check
    check (maintenance_status is null or maintenance_status in ('active', 'slow_but_alive', 'possibly_stale', 'archived', 'unknown')),
  constraint self_host_apps_backup_difficulty_check
    check (backup_difficulty is null or backup_difficulty in ('very_easy', 'easy', 'moderate', 'hard', 'expert', 'unknown')),
  constraint self_host_apps_backup_criticality_check
    check (backup_criticality is null or backup_criticality in ('low', 'medium', 'high', 'critical', 'unknown')),
  constraint self_host_apps_data_confidence_check
    check (data_confidence is null or data_confidence in ('high', 'medium', 'low', 'unknown')),
  constraint self_host_apps_ram_required_mb_check
    check (ram_required_mb is null or ram_required_mb >= 0),
  constraint self_host_apps_ram_recommended_mb_check
    check (ram_recommended_mb is null or ram_recommended_mb >= 0),
  constraint self_host_apps_storage_required_gb_check
    check (storage_required_gb is null or storage_required_gb >= 0),
  constraint self_host_apps_github_stars_check
    check (github_stars is null or github_stars >= 0),
  constraint self_host_apps_github_forks_check
    check (github_forks is null or github_forks >= 0),
  constraint self_host_apps_github_open_issues_check
    check (github_open_issues is null or github_open_issues >= 0),
  constraint self_host_apps_github_open_pull_requests_check
    check (github_open_pull_requests is null or github_open_pull_requests >= 0),
  constraint self_host_apps_github_commit_count_90d_check
    check (github_commit_count_90d is null or github_commit_count_90d >= 0),
  constraint self_host_apps_github_release_count_90d_check
    check (github_release_count_90d is null or github_release_count_90d >= 0)
);

create table public.self_host_app_github_snapshots (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.self_host_apps(id) on delete cascade,
  snapshot_date date not null,
  stars integer,
  forks integer,
  open_issues integer,
  open_pull_requests integer,
  latest_release text,
  latest_release_at timestamptz,
  last_commit_at timestamptz,
  commit_count_90d integer,
  release_count_90d integer,
  created_at timestamptz not null default now(),
  constraint self_host_app_github_snapshots_unique_app_snapshot
    unique (app_id, snapshot_date),
  constraint self_host_app_github_snapshots_stars_check
    check (stars is null or stars >= 0),
  constraint self_host_app_github_snapshots_forks_check
    check (forks is null or forks >= 0),
  constraint self_host_app_github_snapshots_open_issues_check
    check (open_issues is null or open_issues >= 0),
  constraint self_host_app_github_snapshots_open_pull_requests_check
    check (open_pull_requests is null or open_pull_requests >= 0),
  constraint self_host_app_github_snapshots_commit_count_90d_check
    check (commit_count_90d is null or commit_count_90d >= 0),
  constraint self_host_app_github_snapshots_release_count_90d_check
    check (release_count_90d is null or release_count_90d >= 0)
);

create index categories_slug_idx on public.categories(slug);
create index self_host_apps_slug_idx on public.self_host_apps(slug);
create index self_host_apps_category_id_idx on public.self_host_apps(category_id);
create index self_host_apps_published_idx on public.self_host_apps(published);
create index self_host_apps_maintenance_status_idx on public.self_host_apps(maintenance_status);
create index self_host_app_github_snapshots_app_id_snapshot_date_idx
  on public.self_host_app_github_snapshots(app_id, snapshot_date desc);
