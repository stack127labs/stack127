begin;

do $$
begin
  create type public.open_project_self_hosting_status as enum (
    'self_hostable',
    'not_self_hostable',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.open_project_license_type as enum (
    'permissive',
    'copyleft',
    'public_domain',
    'mixed',
    'custom',
    'unknown'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.self_host_apps rename to open_projects;
alter table public.self_host_apps_categories rename to open_project_categories;
alter table public.self_host_apps_categories_join_table rename to open_project_categories_join_table;
alter table public.self_host_apps_import_runs rename to open_project_import_runs;
alter table public.self_host_apps_sources rename to open_project_sources;
alter table public.self_host_apps_field_sources rename to open_project_field_sources;
alter table public.self_host_apps_curated_overrides rename to open_project_curated_overrides;

alter table public.open_projects rename column repository_url to source_code_url;
alter table public.open_projects rename column platforms to surfaces;
alter table public.open_project_categories_join_table rename column app_id to project_id;
alter table public.open_project_sources rename column app_id to project_id;
alter table public.open_project_field_sources rename column app_id to project_id;
alter table public.open_project_curated_overrides rename column app_id to project_id;

alter table public.open_projects
  add column source_code_host text not null default 'unknown',
  add column self_hosting_status public.open_project_self_hosting_status not null default 'unknown',
  add column license_type public.open_project_license_type not null default 'unknown',
  add column license_spdx_id text,
  add column github_repo_id bigint,
  add column github_node_id text,
  add column github_full_name text,
  add column github_owner_type text,
  add column github_forks integer check (github_forks is null or github_forks >= 0),
  add column github_watchers integer check (github_watchers is null or github_watchers >= 0),
  add column github_open_issues integer check (github_open_issues is null or github_open_issues >= 0),
  add column github_primary_language text,
  add column github_languages jsonb not null default '{}'::jsonb,
  add column github_topics text[] not null default '{}',
  add column github_created_at timestamptz,
  add column github_updated_at timestamptz,
  add column github_pushed_at timestamptz,
  add column github_default_branch text,
  add column github_repo_size_kb bigint check (github_repo_size_kb is null or github_repo_size_kb >= 0),
  add column github_archived boolean,
  add column github_disabled boolean,
  add column github_is_fork boolean,
  add column github_is_template boolean;

update public.open_projects
set
  self_hosting_status = 'self_hostable',
  source_code_host = case
    when source_code_url ~* '^https?://(www\.)?github\.com/' then 'github'
    when source_code_url ~* '^https?://(www\.)?gitlab\.com/' then 'gitlab'
    when source_code_url ~* '^https?://(www\.)?codeberg\.org/' then 'codeberg'
    when source_code_url is not null then 'other'
    else 'unknown'
  end,
  license_spdx_id = case
    when license ~* '^MIT$|MIT License' then 'MIT'
    when license ~* 'Apache[^0-9]*2' then 'Apache-2.0'
    when license ~* 'AGPL[^0-9]*3' then 'AGPL-3.0'
    when license ~* 'LGPL[^0-9]*3' then 'LGPL-3.0'
    when license ~* 'LGPL[^0-9]*2\.1' then 'LGPL-2.1'
    when license ~* 'GPL[^0-9]*3' then 'GPL-3.0'
    when license ~* 'GPL[^0-9]*2' then 'GPL-2.0'
    when license ~* 'MPL[^0-9]*2' then 'MPL-2.0'
    when license ~* '^ISC$|ISC License' then 'ISC'
    when license ~* 'BSD[^0-9]*3' then 'BSD-3-Clause'
    when license ~* 'BSD[^0-9]*2' then 'BSD-2-Clause'
    when license ~* 'Unlicense' then 'Unlicense'
    when license ~* 'CC0' then 'CC0-1.0'
    else null
  end,
  license_type = case
    when license ~* 'MIT|Apache|BSD|ISC|Zlib' then 'permissive'::public.open_project_license_type
    when license ~* 'AGPL|LGPL|GPL|MPL|EUPL|CECILL' then 'copyleft'::public.open_project_license_type
    when license ~* 'Unlicense|CC0|public domain' then 'public_domain'::public.open_project_license_type
    when license ~* 'dual|multiple| or ' then 'mixed'::public.open_project_license_type
    when license is not null and btrim(license) <> '' and lower(license) <> 'unknown' then 'custom'::public.open_project_license_type
    else 'unknown'::public.open_project_license_type
  end,
  github_full_name = case
    when github_owner is not null and github_repo is not null then github_owner || '/' || github_repo
    else null
  end,
  github_pushed_at = github_last_commit_at;

update public.open_project_field_sources
set field_name = case field_name
  when 'repository_url' then 'source_code_url'
  when 'platforms' then 'surfaces'
  else field_name
end
where field_name in ('repository_url', 'platforms');

update public.open_project_curated_overrides
set field_name = case field_name
  when 'repository_url' then 'source_code_url'
  when 'platforms' then 'surfaces'
  else field_name
end
where field_name in ('repository_url', 'platforms');

alter table public.open_projects rename constraint self_host_apps_pkey to open_projects_pkey;
alter table public.open_projects rename constraint self_host_apps_slug_key to open_projects_slug_key;
alter table public.open_projects rename constraint self_host_apps_publisher_type_check to open_projects_publisher_type_check;
alter table public.open_projects rename constraint self_host_apps_maintenance_status_check to open_projects_maintenance_status_check;
alter table public.open_projects rename constraint self_host_apps_github_stars_check to open_projects_github_stars_check;
alter table public.open_projects rename constraint self_host_apps_docker_support_check to open_projects_docker_support_check;
alter table public.open_projects rename constraint self_host_apps_ram_mb_check to open_projects_ram_mb_check;
alter table public.open_projects rename constraint self_host_apps_storage_profile_check to open_projects_storage_profile_check;
alter table public.open_projects rename constraint self_host_apps_summary_confidence_check to open_projects_summary_confidence_check;

alter table public.open_project_categories rename constraint self_host_apps_categories_pkey to open_project_categories_pkey;
alter table public.open_project_categories rename constraint self_host_apps_categories_slug_key to open_project_categories_slug_key;

alter table public.open_project_categories_join_table rename constraint self_host_apps_categories_join_table_pkey to open_project_categories_join_table_pkey;
alter table public.open_project_categories_join_table rename constraint self_host_apps_categories_join_table_app_id_fkey to open_project_categories_join_table_project_id_fkey;
alter table public.open_project_categories_join_table rename constraint self_host_apps_categories_join_table_category_id_fkey to open_project_categories_join_table_category_id_fkey;

alter table public.open_project_import_runs rename constraint self_host_apps_import_runs_pkey to open_project_import_runs_pkey;
alter table public.open_project_import_runs rename constraint self_host_apps_import_runs_status_check to open_project_import_runs_status_check;
alter table public.open_project_import_runs rename constraint self_host_apps_import_runs_discovered_count_check to open_project_import_runs_discovered_count_check;
alter table public.open_project_import_runs rename constraint self_host_apps_import_runs_imported_count_check to open_project_import_runs_imported_count_check;
alter table public.open_project_import_runs rename constraint self_host_apps_import_runs_updated_count_check to open_project_import_runs_updated_count_check;
alter table public.open_project_import_runs rename constraint self_host_apps_import_runs_error_count_check to open_project_import_runs_error_count_check;

alter table public.open_project_sources rename constraint self_host_apps_sources_pkey to open_project_sources_pkey;
alter table public.open_project_sources rename constraint self_host_apps_sources_app_id_fkey to open_project_sources_project_id_fkey;
alter table public.open_project_sources rename constraint self_host_apps_sources_import_run_id_fkey to open_project_sources_import_run_id_fkey;
alter table public.open_project_sources rename constraint self_host_apps_sources_source_source_key_key to open_project_sources_source_source_key_key;

alter table public.open_project_field_sources rename constraint self_host_apps_field_sources_pkey to open_project_field_sources_pkey;
alter table public.open_project_field_sources rename constraint self_host_apps_field_sources_app_id_fkey to open_project_field_sources_project_id_fkey;
alter table public.open_project_field_sources rename constraint self_host_apps_field_sources_confidence_check to open_project_field_sources_confidence_check;

alter table public.open_project_curated_overrides rename constraint self_host_apps_curated_overrides_pkey to open_project_curated_overrides_pkey;
alter table public.open_project_curated_overrides rename constraint self_host_apps_curated_overrides_app_id_fkey to open_project_curated_overrides_project_id_fkey;
alter table public.open_project_curated_overrides rename constraint self_host_apps_curated_overrides_check to open_project_curated_overrides_project_or_slug_check;

alter index public.self_host_apps_github_stars_idx rename to open_projects_github_stars_idx;
alter index public.self_host_apps_maintenance_idx rename to open_projects_maintenance_idx;
alter index public.self_host_apps_published_name_idx rename to open_projects_published_name_idx;
alter index public.self_host_apps_categories_join_table_category_idx rename to open_project_categories_join_table_category_idx;
alter index public.self_host_apps_sources_app_id_idx rename to open_project_sources_project_id_idx;
alter index public.self_host_apps_sources_import_run_idx rename to open_project_sources_import_run_idx;
alter index public.self_host_apps_field_sources_field_idx rename to open_project_field_sources_field_idx;
alter index public.self_host_apps_curated_overrides_app_field_idx rename to open_project_curated_overrides_project_field_idx;

alter trigger set_self_host_apps_updated_at on public.open_projects rename to set_open_projects_updated_at;
alter trigger set_self_host_apps_categories_updated_at on public.open_project_categories rename to set_open_project_categories_updated_at;
alter trigger set_self_host_apps_curated_overrides_updated_at on public.open_project_curated_overrides rename to set_open_project_curated_overrides_updated_at;

create index open_projects_self_host_directory_idx
  on public.open_projects (name)
  where published = true and self_hosting_status = 'self_hostable';

create index open_projects_source_code_host_idx
  on public.open_projects (source_code_host);

create index open_projects_github_repo_id_idx
  on public.open_projects (github_repo_id)
  where github_repo_id is not null;

create index open_projects_github_created_at_idx
  on public.open_projects (github_created_at desc nulls last);

create index open_projects_github_pushed_at_idx
  on public.open_projects (github_pushed_at desc nulls last);

create index open_projects_surfaces_idx
  on public.open_projects using gin (surfaces);

create index open_projects_github_topics_idx
  on public.open_projects using gin (github_topics);

create table public.open_project_candidates (
  id uuid primary key default gen_random_uuid(),
  import_run_id uuid references public.open_project_import_runs(id) on delete set null,
  source text not null,
  source_key text not null,
  source_url text,
  name text not null,
  slug text not null,
  summary_raw text,
  website_url text,
  source_code_url text,
  source_code_host text not null default 'unknown',
  docs_url text,
  docker_url text,
  self_hosting_status public.open_project_self_hosting_status not null default 'unknown',
  canonical_source_code_key text,
  canonical_website_key text,
  normalized_name text not null,
  categories_raw text[] not null default '{}',
  surfaces_raw text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'new'
    check (status in ('new', 'duplicate', 'queued', 'enriching', 'published', 'rejected', 'needs_review')),
  duplicate_project_id uuid references public.open_projects(id) on delete set null,
  duplicate_candidate_id uuid references public.open_project_candidates(id) on delete set null,
  duplicate_reason text,
  confidence_score integer not null default 0
    check (confidence_score between 0 and 100),
  rejection_reason text,
  enriched_project_id uuid references public.open_projects(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  discovered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_key)
);

create index open_project_candidates_status_score_idx
  on public.open_project_candidates (status, confidence_score desc, first_seen_at);

create index open_project_candidates_slug_idx
  on public.open_project_candidates (slug);

create index open_project_candidates_source_code_key_idx
  on public.open_project_candidates (canonical_source_code_key)
  where canonical_source_code_key is not null;

create index open_project_candidates_website_key_idx
  on public.open_project_candidates (canonical_website_key)
  where canonical_website_key is not null;

create index open_project_candidates_normalized_name_idx
  on public.open_project_candidates (normalized_name);

create index open_project_candidates_duplicate_project_idx
  on public.open_project_candidates (duplicate_project_id)
  where duplicate_project_id is not null;

create trigger set_open_project_candidates_updated_at
before update on public.open_project_candidates
for each row execute function public.set_updated_at();

alter table public.open_projects enable row level security;
alter table public.open_project_categories enable row level security;
alter table public.open_project_categories_join_table enable row level security;
alter table public.open_project_import_runs enable row level security;
alter table public.open_project_sources enable row level security;
alter table public.open_project_field_sources enable row level security;
alter table public.open_project_curated_overrides enable row level security;
alter table public.open_project_candidates enable row level security;

revoke all on table public.open_projects from anon, authenticated;
revoke all on table public.open_project_categories from anon, authenticated;
revoke all on table public.open_project_categories_join_table from anon, authenticated;
revoke all on table public.open_project_import_runs from anon, authenticated;
revoke all on table public.open_project_sources from anon, authenticated;
revoke all on table public.open_project_field_sources from anon, authenticated;
revoke all on table public.open_project_curated_overrides from anon, authenticated;
revoke all on table public.open_project_candidates from anon, authenticated;

commit;
