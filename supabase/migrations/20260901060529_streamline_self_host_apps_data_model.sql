-- Streamline the self-host app directory around page-owned records.
--
-- The candidate queue is intentionally kept: it is the durable review queue
-- for discovery. Import history and field-level provenance are removed. The
-- app row now keeps compact status/source summaries, while mutable GitHub
-- facts live in a shared repository table.

begin;

create extension if not exists pgcrypto;

alter table public.self_host_apps
  add column if not exists data_source_urls text[] not null default '{}',
  add column if not exists data_checked_at timestamptz,
  add column if not exists data_confidence text not null default 'unknown'
    check (data_confidence in ('high', 'medium', 'low', 'unknown')),
  add column if not exists technical_fact_status jsonb not null default '{}'::jsonb;

create table public.github_projects (
  id uuid primary key default gen_random_uuid(),
  owner text not null,
  repo text not null,
  full_name text not null,
  repository_url text not null check (repository_url ~ '^https?://github\.com/'),
  repo_id bigint,
  node_id text,
  owner_type text,
  stars integer check (stars is null or stars >= 0),
  forks integer check (forks is null or forks >= 0),
  watchers integer check (watchers is null or watchers >= 0),
  open_issues integer check (open_issues is null or open_issues >= 0),
  primary_language text,
  languages jsonb not null default '{}'::jsonb,
  topics text[] not null default '{}',
  created_at timestamptz,
  updated_at timestamptz,
  pushed_at timestamptz,
  default_branch text,
  repo_size_kb bigint check (repo_size_kb is null or repo_size_kb >= 0),
  archived boolean,
  disabled boolean,
  is_fork boolean,
  is_template boolean,
  latest_release text,
  latest_release_at timestamptz,
  last_commit_at timestamptz,
  license_spdx_id text,
  checked_at timestamptz,
  source_url text,
  inserted_at timestamptz not null default now(),
  row_updated_at timestamptz not null default now(),
  unique (owner, repo)
);

create index github_projects_stars_idx
  on public.github_projects (stars desc nulls last, full_name);
create index github_projects_repo_id_idx
  on public.github_projects (repo_id)
  where repo_id is not null;
create index github_projects_checked_at_idx
  on public.github_projects (checked_at nulls first, full_name);

create or replace function public.set_github_projects_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.row_updated_at = now();
  return new;
end;
$$;

create trigger set_github_projects_updated_at
before update on public.github_projects
for each row execute function public.set_github_projects_updated_at();

alter table public.self_host_apps
  add column if not exists github_project_id uuid references public.github_projects(id) on delete set null;

alter table public.terminal_apps
  add column if not exists github_project_id uuid references public.github_projects(id) on delete set null;

-- Seed one shared repository row from every known self-host app repository.
with normalized as (
  select distinct on (lower(coalesce(app.github_owner, match.parts[1])), lower(coalesce(app.github_repo, regexp_replace(match.parts[2], '\.git$', '', 'i'))))
    lower(coalesce(app.github_owner, match.parts[1])) as owner,
    lower(coalesce(app.github_repo, regexp_replace(match.parts[2], '\.git$', '', 'i'))) as repo,
    coalesce(app.github_full_name, app.github_owner || '/' || app.github_repo) as full_name,
    case
      when app.source_code_url ~* '^https?://(?:www\.)?github\.com/' then app.source_code_url
      else format('https://github.com/%s/%s', coalesce(app.github_owner, match.parts[1]), coalesce(app.github_repo, regexp_replace(match.parts[2], '\.git$', '', 'i')))
    end as repository_url,
    app.github_repo_id as repo_id,
    app.github_node_id as node_id,
    app.github_owner_type as owner_type,
    app.github_stars as stars,
    app.github_forks as forks,
    app.github_watchers as watchers,
    app.github_open_issues as open_issues,
    app.github_primary_language as primary_language,
    app.github_languages as languages,
    app.github_topics as topics,
    app.github_created_at as created_at,
    app.github_updated_at as updated_at,
    app.github_pushed_at as pushed_at,
    app.github_default_branch as default_branch,
    app.github_repo_size_kb as repo_size_kb,
    app.github_archived as archived,
    app.github_disabled as disabled,
    app.github_is_fork as is_fork,
    app.github_is_template as is_template,
    coalesce(app.github_latest_release, app.source_latest_release) as latest_release,
    coalesce(app.github_latest_release_at, app.source_latest_release_at) as latest_release_at,
    coalesce(app.github_last_commit_at, app.source_last_commit_at) as last_commit_at,
    app.license_spdx_id as license_spdx_id,
    coalesce(app.github_checked_at, app.source_checked_at) as checked_at,
    coalesce(app.source_code_url, app.website_url) as source_url
  from public.self_host_apps app
  left join lateral regexp_matches(
    coalesce(app.source_code_url, ''),
    '^https?://(?:www\.)?github\.com/([^/?#]+)/([^/?#]+)',
    'i'
  ) as match(parts) on true
  where app.github_owner is not null
     or match.parts is not null
  order by lower(coalesce(app.github_owner, match.parts[1])), lower(coalesce(app.github_repo, regexp_replace(match.parts[2], '\.git$', '', 'i'))), app.updated_at desc
)
insert into public.github_projects (
  owner, repo, full_name, repository_url, repo_id, node_id, owner_type,
  stars, forks, watchers, open_issues, primary_language, languages, topics,
  created_at, updated_at, pushed_at, default_branch, repo_size_kb, archived,
  disabled, is_fork, is_template, latest_release, latest_release_at,
  last_commit_at, license_spdx_id, checked_at, source_url
)
select owner, repo, coalesce(full_name, owner || '/' || repo), repository_url,
       repo_id, node_id, owner_type, stars, forks, watchers, open_issues,
       primary_language, coalesce(languages, '{}'::jsonb), coalesce(topics, '{}'),
       created_at, updated_at, pushed_at, default_branch, repo_size_kb, archived,
       disabled, is_fork, is_template, latest_release, latest_release_at,
       last_commit_at, license_spdx_id, checked_at, source_url
from normalized
where owner is not null and repo is not null and repository_url ~ '^https?://github\.com/'
on conflict (owner, repo) do update set
  full_name = coalesce(nullif(excluded.full_name, ''), public.github_projects.full_name),
  repository_url = coalesce(excluded.repository_url, public.github_projects.repository_url),
  repo_id = coalesce(excluded.repo_id, public.github_projects.repo_id),
  node_id = coalesce(excluded.node_id, public.github_projects.node_id),
  owner_type = coalesce(excluded.owner_type, public.github_projects.owner_type),
  stars = coalesce(excluded.stars, public.github_projects.stars),
  forks = coalesce(excluded.forks, public.github_projects.forks),
  watchers = coalesce(excluded.watchers, public.github_projects.watchers),
  open_issues = coalesce(excluded.open_issues, public.github_projects.open_issues),
  primary_language = coalesce(excluded.primary_language, public.github_projects.primary_language),
  languages = case when excluded.languages <> '{}'::jsonb then excluded.languages else public.github_projects.languages end,
  topics = case when cardinality(excluded.topics) > 0 then excluded.topics else public.github_projects.topics end,
  created_at = coalesce(excluded.created_at, public.github_projects.created_at),
  updated_at = coalesce(excluded.updated_at, public.github_projects.updated_at),
  pushed_at = coalesce(excluded.pushed_at, public.github_projects.pushed_at),
  default_branch = coalesce(excluded.default_branch, public.github_projects.default_branch),
  repo_size_kb = coalesce(excluded.repo_size_kb, public.github_projects.repo_size_kb),
  archived = coalesce(excluded.archived, public.github_projects.archived),
  disabled = coalesce(excluded.disabled, public.github_projects.disabled),
  is_fork = coalesce(excluded.is_fork, public.github_projects.is_fork),
  is_template = coalesce(excluded.is_template, public.github_projects.is_template),
  latest_release = coalesce(excluded.latest_release, public.github_projects.latest_release),
  latest_release_at = coalesce(excluded.latest_release_at, public.github_projects.latest_release_at),
  last_commit_at = coalesce(excluded.last_commit_at, public.github_projects.last_commit_at),
  license_spdx_id = coalesce(excluded.license_spdx_id, public.github_projects.license_spdx_id),
  checked_at = coalesce(excluded.checked_at, public.github_projects.checked_at),
  source_url = coalesce(excluded.source_url, public.github_projects.source_url),
  row_updated_at = now();

-- Terminal apps can point at the same repository. Rows with no API facts are
-- still useful: the refresh job fills their mutable fields later.
with normalized as (
  select distinct on (lower(match.parts[1]), lower(regexp_replace(match.parts[2], '\.git$', '', 'i')))
    lower(match.parts[1]) as owner,
    lower(regexp_replace(match.parts[2], '\.git$', '', 'i')) as repo,
    format('https://github.com/%s/%s', match.parts[1], regexp_replace(match.parts[2], '\.git$', '', 'i')) as repository_url
  from public.terminal_apps app
  cross join lateral regexp_matches(
    coalesce(app.repository_url, ''),
    '^https?://(?:www\.)?github\.com/([^/?#]+)/([^/?#]+)',
    'i'
  ) as match(parts)
)
insert into public.github_projects (owner, repo, full_name, repository_url, source_url)
select owner, repo, owner || '/' || repo, repository_url, repository_url
from normalized
on conflict (owner, repo) do update set
  repository_url = coalesce(public.github_projects.repository_url, excluded.repository_url),
  source_url = coalesce(public.github_projects.source_url, excluded.source_url),
  row_updated_at = now();

update public.self_host_apps app
set github_project_id = project.id
from public.github_projects project
where app.github_project_id is null
  and lower(project.owner) = lower(app.github_owner)
  and lower(project.repo) = lower(app.github_repo);

update public.self_host_apps app
set github_project_id = project.id
from public.github_projects project
where app.github_project_id is null
  and project.repo_id = app.github_repo_id;

update public.terminal_apps app
set github_project_id = project.id
from public.github_projects project
where app.github_project_id is null
  and lower(project.owner) = lower((regexp_match(
    coalesce(app.repository_url, ''),
    '^https?://(?:www\.)?github\.com/([^/?#]+)/([^/?#]+)',
    'i'
  ))[1])
  and lower(project.repo) = lower(regexp_replace((regexp_match(
    coalesce(app.repository_url, ''),
    '^https?://(?:www\.)?github\.com/([^/?#]+)/([^/?#]+)',
    'i'
  ))[2], '\.git$', '', 'i'));

create index self_host_apps_github_project_idx
  on public.self_host_apps (github_project_id)
  where github_project_id is not null;
create index terminal_apps_github_project_idx
  on public.terminal_apps (github_project_id)
  where github_project_id is not null;

-- Collapse field-level provenance into compact row-level status. The status
-- values are deliberately explicit so QA can distinguish unchecked facts from
-- an official source that was checked but published no value.
with field_rollup as (
  select
    app_id,
    max(checked_at) as checked_at,
    array_remove(array_agg(distinct source_url), null) as source_urls,
    bool_or(field_name in ('ram_mb', 'ram_min_mb', 'ram_recommended_mb', 'ram_default_limit_mb')) as ram_checked,
    bool_or(field_name in ('storage_profile', 'storage_min_gb', 'persistent_storage')) as storage_checked,
    bool_or(field_name in ('requires_database', 'database_types')) as database_checked,
    bool_or(field_name in ('docker_support', 'docker_image')) as docker_checked,
    bool_or(field_name = 'docker_image') as docker_image_checked,
    bool_or(field_name in ('compose_support', 'compose_url')) as compose_checked
  from public.self_host_app_field_sources
  group by app_id
), status_base as (
  select
    app.id,
    coalesce(rollup.checked_at, app.technical_facts_checked_at) as checked_at,
    coalesce(
      (
        select array_agg(distinct url order by url)
        from unnest(
          coalesce(rollup.source_urls, '{}') || array_remove(array[
            app.source_code_url,
            app.website_url,
            app.docs_url,
            app.install_docs_url,
            app.docker_url,
            app.compose_url
          ]::text[], null)
        ) as source_values(url)
      ),
      '{}'
    ) as source_urls,
    coalesce(rollup.ram_checked, false) as ram_checked,
    coalesce(rollup.storage_checked, false) as storage_checked,
    coalesce(rollup.database_checked, false) as database_checked,
    coalesce(rollup.docker_checked, false) as docker_checked,
    coalesce(rollup.docker_image_checked, false) as docker_image_checked,
    coalesce(rollup.compose_checked, false) as compose_checked,
    app.ram_mb,
    app.ram_min_mb,
    app.ram_recommended_mb,
    app.ram_default_limit_mb,
    app.storage_min_gb,
    app.storage_profile,
    app.persistent_storage,
    app.requires_database,
    app.database_types,
    app.docker_support,
    app.docker_image,
    app.compose_support,
    app.compose_url
  from public.self_host_apps app
  left join field_rollup rollup on rollup.app_id = app.id
), status_rows as (
  select
    id,
    checked_at,
    source_urls,
    jsonb_build_object(
      'ram', jsonb_build_object(
        'status', case when ram_checked then case when coalesce(ram_mb, ram_min_mb, ram_recommended_mb, ram_default_limit_mb) is null then 'not_published' else 'published' end else 'unchecked' end,
        'source_urls', source_urls,
        'checked_at', checked_at
      ),
      'storage', jsonb_build_object(
        'status', case when storage_checked then case when storage_min_gb is null and storage_profile = 'unknown' and persistent_storage is null then 'not_published' else 'published' end else 'unchecked' end,
        'source_urls', source_urls,
        'checked_at', checked_at
      ),
      'database', jsonb_build_object(
        'status', case when database_checked then case when requires_database is null and cardinality(database_types) = 0 then 'not_published' else 'published' end else 'unchecked' end,
        'source_urls', source_urls,
        'checked_at', checked_at
      ),
      'docker', jsonb_build_object(
        'status', case when docker_checked then case when docker_support = 'unknown' then 'not_published' else 'published' end else 'unchecked' end,
        'source_urls', source_urls,
        'checked_at', checked_at
      ),
      'docker_image', jsonb_build_object(
        'status', case when docker_image_checked then case when docker_image is null then 'not_published' else 'published' end else 'unchecked' end,
        'source_urls', source_urls,
        'checked_at', checked_at
      ),
      'compose', jsonb_build_object(
        'status', case when compose_checked then case when compose_support is null and compose_url is null then 'not_published' else 'published' end else 'unchecked' end,
        'source_urls', source_urls,
        'checked_at', checked_at
      )
    ) as technical_fact_status
  from status_base
)
update public.self_host_apps app
set data_source_urls = status_rows.source_urls,
    data_checked_at = coalesce(app.data_checked_at, status_rows.checked_at),
    data_confidence = case
      when exists (select 1 from public.self_host_app_field_sources source where source.app_id = app.id and source.confidence = 'high') then 'high'
      when exists (select 1 from public.self_host_app_field_sources source where source.app_id = app.id and source.confidence = 'medium') then 'medium'
      when exists (select 1 from public.self_host_app_field_sources source where source.app_id = app.id and source.confidence = 'low') then 'low'
      else app.data_confidence
    end,
    technical_facts_checked_at = coalesce(app.technical_facts_checked_at, status_rows.checked_at),
    technical_fact_status = case when app.technical_fact_status = '{}'::jsonb then status_rows.technical_fact_status else app.technical_fact_status end
from status_rows
where app.id = status_rows.id;

-- A resource estimate is one row per app. Exact published requirements remain
-- on self_host_apps; these columns only hold planning ranges and their basis.
alter table public.self_host_app_resource_estimates
  rename to self_host_app_resource_estimates_legacy;

create table public.self_host_app_resource_estimates (
  app_id uuid primary key references public.self_host_apps(id) on delete cascade,
  ram_estimate_min_mb numeric check (ram_estimate_min_mb is null or ram_estimate_min_mb >= 0),
  ram_estimate_max_mb numeric check (ram_estimate_max_mb is null or ram_estimate_max_mb >= ram_estimate_min_mb),
  ram_estimate_kind text check (ram_estimate_kind is null or ram_estimate_kind in ('derived', 'estimated')),
  ram_estimate_confidence text check (ram_estimate_confidence is null or ram_estimate_confidence in ('high', 'medium', 'low')),
  ram_estimate_basis text,
  ram_source_urls text[] not null default '{}',
  ram_note text,
  storage_estimate_min_gb numeric check (storage_estimate_min_gb is null or storage_estimate_min_gb >= 0),
  storage_estimate_max_gb numeric check (storage_estimate_max_gb is null or storage_estimate_max_gb >= storage_estimate_min_gb),
  storage_estimate_kind text check (storage_estimate_kind is null or storage_estimate_kind in ('derived', 'estimated')),
  storage_estimate_confidence text check (storage_estimate_confidence is null or storage_estimate_confidence in ('high', 'medium', 'low')),
  storage_estimate_basis text,
  storage_source_urls text[] not null default '{}',
  storage_note text,
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((ram_estimate_min_mb is null) = (ram_estimate_max_mb is null)),
  check ((storage_estimate_min_gb is null) = (storage_estimate_max_gb is null))
);

insert into public.self_host_app_resource_estimates (
  app_id,
  ram_estimate_min_mb,
  ram_estimate_max_mb,
  ram_estimate_kind,
  ram_estimate_confidence,
  ram_estimate_basis,
  ram_source_urls,
  ram_note,
  storage_estimate_min_gb,
  storage_estimate_max_gb,
  storage_estimate_kind,
  storage_estimate_confidence,
  storage_estimate_basis,
  storage_source_urls,
  storage_note,
  checked_at
)
select
  app.id,
  max(legacy.estimate_min) filter (where legacy.resource_kind = 'ram'),
  max(legacy.estimate_max) filter (where legacy.resource_kind = 'ram'),
  max(legacy.estimate_kind) filter (where legacy.resource_kind = 'ram'),
  max(legacy.confidence) filter (where legacy.resource_kind = 'ram'),
  max(legacy.basis) filter (where legacy.resource_kind = 'ram'),
  coalesce((select latest.source_urls from public.self_host_app_resource_estimates_legacy latest where latest.app_id = app.id and latest.resource_kind = 'ram' order by latest.checked_at desc limit 1), '{}'),
  max(legacy.note) filter (where legacy.resource_kind = 'ram'),
  max(legacy.estimate_min) filter (where legacy.resource_kind = 'storage'),
  max(legacy.estimate_max) filter (where legacy.resource_kind = 'storage'),
  max(legacy.estimate_kind) filter (where legacy.resource_kind = 'storage'),
  max(legacy.confidence) filter (where legacy.resource_kind = 'storage'),
  max(legacy.basis) filter (where legacy.resource_kind = 'storage'),
  coalesce((select latest.source_urls from public.self_host_app_resource_estimates_legacy latest where latest.app_id = app.id and latest.resource_kind = 'storage' order by latest.checked_at desc limit 1), '{}'),
  max(legacy.note) filter (where legacy.resource_kind = 'storage'),
  max(legacy.checked_at)
from public.self_host_apps app
left join public.self_host_app_resource_estimates_legacy legacy on legacy.app_id = app.id
group by app.id;

create trigger set_self_host_app_resource_estimates_updated_at
before update on public.self_host_app_resource_estimates
for each row execute function public.set_updated_at();

-- Install destinations are one row per app. Arrays are used instead of comma-
-- separated text so URLs remain queryable and safe to render. `options` keeps
-- support level, source URL, and notes for each individual link.
alter table public.self_host_app_install_options
  rename to self_host_app_install_options_legacy;

create table public.self_host_app_install_options (
  app_id uuid primary key references public.self_host_apps(id) on delete cascade,
  docker_urls text[] not null default '{}',
  docker_images text[] not null default '{}',
  compose_urls text[] not null default '{}',
  truenas_scale_urls text[] not null default '{}',
  unraid_urls text[] not null default '{}',
  umbrel_urls text[] not null default '{}',
  yunohost_urls text[] not null default '{}',
  casaos_urls text[] not null default '{}',
  runtipi_urls text[] not null default '{}',
  cosmos_urls text[] not null default '{}',
  openmediavault_urls text[] not null default '{}',
  synology_urls text[] not null default '{}',
  qnap_urls text[] not null default '{}',
  proxmox_urls text[] not null default '{}',
  home_assistant_os_urls text[] not null default '{}',
  kubernetes_urls text[] not null default '{}',
  helm_urls text[] not null default '{}',
  native_urls text[] not null default '{}',
  binary_urls text[] not null default '{}',
  package_urls text[] not null default '{}',
  other_urls text[] not null default '{}',
  options jsonb not null default '[]'::jsonb,
  catalog_sources jsonb not null default '[]'::jsonb,
  source_urls text[] not null default '{}',
  checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

with grouped as (
  select
    app.id as app_id,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'docker'), '{}') as docker_urls,
    coalesce(array_agg(distinct legacy.image order by legacy.image) filter (where legacy.method = 'docker' and legacy.image is not null), '{}') as docker_images,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'compose'), '{}') as compose_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'truenas_scale'), '{}') as truenas_scale_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'unraid'), '{}') as unraid_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'umbrel'), '{}') as umbrel_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'yunohost'), '{}') as yunohost_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'casaos'), '{}') as casaos_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'runtipi'), '{}') as runtipi_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'cosmos'), '{}') as cosmos_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'openmediavault'), '{}') as openmediavault_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'synology'), '{}') as synology_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'qnap'), '{}') as qnap_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'proxmox'), '{}') as proxmox_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'home_assistant_os'), '{}') as home_assistant_os_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'kubernetes'), '{}') as kubernetes_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'helm'), '{}') as helm_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'native'), '{}') as native_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'binary'), '{}') as binary_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'package'), '{}') as package_urls,
    coalesce(array_agg(distinct legacy.url order by legacy.url) filter (where legacy.method = 'other'), '{}') as other_urls,
    coalesce(jsonb_agg(jsonb_build_object(
      'method', legacy.method,
      'label', legacy.label,
      'url', legacy.url,
      'image', legacy.image,
      'support_level', legacy.support_level,
      'source_url', legacy.source_url,
      'note', legacy.note,
      'sort_order', legacy.sort_order
    ) order by legacy.sort_order, legacy.label, legacy.url) filter (where legacy.id is not null), '[]'::jsonb) as options,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'source', source.source,
        'source_url', source.source_url,
        'payload', source.payload
      ) order by source.source)
      from public.self_host_app_sources source
      where source.app_id = app.id
        and source.source in ('truenas_apps', 'umbrel_apps')
    ), '[]'::jsonb) as catalog_sources,
    coalesce(array_agg(distinct legacy.source_url order by legacy.source_url) filter (where legacy.source_url is not null), '{}') as source_urls,
    max(legacy.checked_at) as checked_at
  from public.self_host_apps app
  left join public.self_host_app_install_options_legacy legacy on legacy.app_id = app.id
  group by app.id
)
insert into public.self_host_app_install_options (
  app_id, docker_urls, docker_images, compose_urls, truenas_scale_urls,
  unraid_urls, umbrel_urls, yunohost_urls, casaos_urls, runtipi_urls,
  cosmos_urls, openmediavault_urls, synology_urls, qnap_urls, proxmox_urls,
  home_assistant_os_urls, kubernetes_urls, helm_urls, native_urls, binary_urls,
  package_urls, other_urls, options, catalog_sources, source_urls, checked_at
)
select app_id, docker_urls, docker_images, compose_urls, truenas_scale_urls,
       unraid_urls, umbrel_urls, yunohost_urls, casaos_urls, runtipi_urls,
       cosmos_urls, openmediavault_urls, synology_urls, qnap_urls, proxmox_urls,
       home_assistant_os_urls, kubernetes_urls, helm_urls, native_urls, binary_urls,
       package_urls, other_urls, options, catalog_sources, source_urls, checked_at
from grouped;

create trigger set_self_host_app_install_options_updated_at
before update on public.self_host_app_install_options
for each row execute function public.set_updated_at();

-- The old compatibility views and pipeline-only tables no longer represent
-- the source of truth. Drop them only after the data has been folded into the
-- app, GitHub, resource, and install rows above.
drop view if exists public.open_project_candidates cascade;
drop view if exists public.open_project_curated_overrides cascade;
drop view if exists public.open_project_field_sources cascade;
drop view if exists public.open_project_sources cascade;
drop view if exists public.open_project_import_runs cascade;
drop view if exists public.open_project_categories_join_table cascade;
drop view if exists public.open_project_categories cascade;
drop view if exists public.open_projects cascade;
drop view if exists public.version127_pages cascade;

drop table public.self_host_app_sources;
drop table public.self_host_app_field_sources;
drop table public.self_host_app_curated_overrides;
alter table public.self_host_app_candidates drop column import_run_id;
drop table public.self_host_app_import_runs;
drop table public.self_host_app_resource_estimates_legacy;
drop table public.self_host_app_install_options_legacy;

alter table public.github_projects enable row level security;
alter table public.self_host_app_resource_estimates enable row level security;
alter table public.self_host_app_install_options enable row level security;

revoke all on table public.github_projects from anon, authenticated;
revoke all on table public.self_host_app_resource_estimates from anon, authenticated;
revoke all on table public.self_host_app_install_options from anon, authenticated;

commit;
