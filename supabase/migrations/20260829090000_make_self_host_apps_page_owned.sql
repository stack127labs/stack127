-- Make /self-host-apps the owner of its data model and admit every verified
-- self-hostable app, regardless of whether its source code is public.

begin;

alter table public.open_projects rename to self_host_apps;
alter table public.open_project_categories rename to self_host_app_categories;
alter table public.open_project_categories_join_table rename to self_host_app_category_links;
alter table public.open_project_import_runs rename to self_host_app_import_runs;
alter table public.open_project_sources rename to self_host_app_sources;
alter table public.open_project_field_sources rename to self_host_app_field_sources;
alter table public.open_project_curated_overrides rename to self_host_app_curated_overrides;
alter table public.open_project_candidates rename to self_host_app_candidates;

alter table public.self_host_app_category_links rename column project_id to app_id;
alter table public.self_host_app_sources rename column project_id to app_id;
alter table public.self_host_app_field_sources rename column project_id to app_id;
alter table public.self_host_app_curated_overrides rename column project_id to app_id;
alter table public.self_host_app_candidates rename column duplicate_project_id to duplicate_app_id;
alter table public.self_host_app_candidates rename column enriched_project_id to enriched_app_id;

alter type public.open_project_self_hosting_status rename to self_host_app_self_hosting_status;
alter type public.open_project_license_type rename to self_host_app_license_type;
alter type public.open_project_source_model rename to self_host_app_source_model;

alter type public.self_host_app_source_model add value if not exists 'closed_source';

alter table public.self_host_apps
  add column icon_source_url text,
  add column pricing_model text not null default 'unknown'
    check (pricing_model in ('free', 'freemium', 'paid', 'subscription', 'usage_based', 'enterprise', 'unknown')),
  add column deployment_methods text[] not null default '{}',
  add column docker_image text,
  add column compose_url text,
  add column ram_min_mb integer check (ram_min_mb is null or ram_min_mb > 0),
  add column ram_recommended_mb integer check (
    ram_recommended_mb is null
    or ram_recommended_mb > 0
  ),
  add column storage_min_gb numeric check (storage_min_gb is null or storage_min_gb >= 0),
  add column resource_requirement_kind text not null default 'unknown'
    check (resource_requirement_kind in (
      'official_minimum', 'official_recommended', 'measured', 'community_estimate', 'unknown'
    )),
  add column popularity_score integer not null default 0
    check (popularity_score between 0 and 100),
  add column popularity_basis text[] not null default '{}',
  add column popularity_checked_at timestamptz,
  add column release_version text,
  add column release_published_at timestamptz,
  add column release_checked_at timestamptz,
  add column release_url text;

alter table public.terminal_apps rename column open_project_id to self_host_app_id;

update public.self_host_apps app
set ram_min_mb = ram_mb
where ram_mb is not null
  and exists (
    select 1
    from public.self_host_app_field_sources field_source
    where field_source.app_id = app.id
      and field_source.field_name = 'ram_mb'
      and field_source.confidence = 'high'
      and (
        field_source.source = 'official_documentation'
        or field_source.source = 'official_repository'
        or field_source.source = 'official_website'
        or field_source.source = 'manual_official'
      )
  );

update public.self_host_apps
set
  deployment_methods = array_remove(array[
    case when docker_support in ('official', 'community') then 'docker' end,
    case when compose_support = true then 'compose' end
  ], null),
  compose_url = case
    when compose_support = true and docker_url ~* 'compose' then docker_url
    else null
  end,
  release_version = coalesce(source_latest_release, github_latest_release),
  release_published_at = coalesce(source_latest_release_at, github_latest_release_at),
  release_checked_at = coalesce(source_checked_at, github_checked_at),
  popularity_score = case
    when coalesce(source_stars, github_stars, 0) >= 100000 then 100
    when coalesce(source_stars, github_stars, 0) >= 50000 then 95
    when coalesce(source_stars, github_stars, 0) >= 20000 then 90
    when coalesce(source_stars, github_stars, 0) >= 10000 then 85
    when coalesce(source_stars, github_stars, 0) >= 5000 then 80
    when coalesce(source_stars, github_stars, 0) >= 1000 then 70
    when coalesce(source_stars, github_stars, 0) >= 250 then 60
    when coalesce(source_stars, github_stars, 0) > 0 then 50
    else 0
  end,
  popularity_basis = case
    when coalesce(source_stars, github_stars) is not null then array['source_stars']::text[]
    else '{}'::text[]
  end,
  popularity_checked_at = coalesce(source_checked_at, github_checked_at);

create index self_host_apps_directory_idx
  on public.self_host_apps (published, self_hosting_status, name);
create index self_host_apps_source_model_idx
  on public.self_host_apps (source_model, name)
  where published = true;
create index self_host_apps_deployment_methods_idx
  on public.self_host_apps using gin (deployment_methods);
create index self_host_apps_popularity_idx
  on public.self_host_apps (popularity_score desc, name)
  where published = true and self_hosting_status = 'self_hostable';

-- Compatibility aliases keep the currently deployed app and any in-flight
-- jobs working while the new code rolls out. New code must use self_host_app_*.
create domain public.open_project_self_hosting_status as public.self_host_app_self_hosting_status;
create domain public.open_project_license_type as public.self_host_app_license_type;
create domain public.open_project_source_model as public.self_host_app_source_model;

create view public.open_projects as select * from public.self_host_apps;
create view public.open_project_categories as select * from public.self_host_app_categories;
create view public.open_project_categories_join_table as
  select app_id as project_id, category_id, created_at
  from public.self_host_app_category_links;
create view public.open_project_import_runs as select * from public.self_host_app_import_runs;
create view public.open_project_sources as
  select id, app_id as project_id, import_run_id, source, source_key, source_url, payload, imported_at
  from public.self_host_app_sources;
create view public.open_project_field_sources as
  select app_id as project_id, field_name, source, source_url, confidence, checked_at, note
  from public.self_host_app_field_sources;
create view public.open_project_curated_overrides as
  select id, app_id as project_id, slug, field_name, value, note, updated_at
  from public.self_host_app_curated_overrides;
create view public.open_project_candidates as
  select
    id, import_run_id, source, source_key, source_url, name, slug, summary_raw,
    website_url, source_code_url, source_code_host, docs_url, docker_url,
    self_hosting_status, canonical_source_code_key, canonical_website_key,
    normalized_name, categories_raw, surfaces_raw, payload, status,
    duplicate_app_id as duplicate_project_id, duplicate_candidate_id,
    duplicate_reason, confidence_score, rejection_reason,
    enriched_app_id as enriched_project_id, first_seen_at, last_seen_at,
    discovered_at, updated_at
  from public.self_host_app_candidates;

commit;

begin;

update public.self_host_apps
set
  source_model = 'closed_source',
  source_code_url = case when source_code_url = website_url then null else source_code_url end,
  source_code_host = case when source_code_url = website_url then 'unknown' else source_code_host end,
  popularity_score = case slug
    when 'plex' then 98
    when 'emby' then 88
    when 'blue-iris' then 78
    when 'channels-dvr' then 74
    else popularity_score
  end,
  popularity_basis = array['reviewed_directory_demand'],
  popularity_checked_at = now()
where slug in ('plex', 'emby', 'blue-iris', 'channels-dvr');

commit;
