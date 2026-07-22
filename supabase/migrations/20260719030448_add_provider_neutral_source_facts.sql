begin;

alter table public.open_projects
  add column source_repo_id text,
  add column source_full_name text,
  add column source_stars integer check (source_stars is null or source_stars >= 0),
  add column source_forks integer check (source_forks is null or source_forks >= 0),
  add column source_watchers integer check (source_watchers is null or source_watchers >= 0),
  add column source_open_issues integer check (source_open_issues is null or source_open_issues >= 0),
  add column source_primary_language text,
  add column source_languages jsonb not null default '{}'::jsonb,
  add column source_topics text[] not null default '{}',
  add column source_created_at timestamptz,
  add column source_updated_at timestamptz,
  add column source_pushed_at timestamptz,
  add column source_default_branch text,
  add column source_repo_size_kb bigint check (source_repo_size_kb is null or source_repo_size_kb >= 0),
  add column source_archived boolean,
  add column source_disabled boolean,
  add column source_is_fork boolean,
  add column source_is_template boolean,
  add column source_latest_release text,
  add column source_latest_release_at timestamptz,
  add column source_last_commit_at timestamptz,
  add column source_checked_at timestamptz;

update public.open_projects
set
  source_repo_id = github_repo_id::text,
  source_full_name = github_full_name,
  source_stars = github_stars,
  source_forks = github_forks,
  source_watchers = github_watchers,
  source_open_issues = github_open_issues,
  source_primary_language = github_primary_language,
  source_languages = github_languages,
  source_topics = github_topics,
  source_created_at = github_created_at,
  source_updated_at = github_updated_at,
  source_pushed_at = github_pushed_at,
  source_default_branch = github_default_branch,
  source_repo_size_kb = github_repo_size_kb,
  source_archived = github_archived,
  source_disabled = github_disabled,
  source_is_fork = github_is_fork,
  source_is_template = github_is_template,
  source_latest_release = github_latest_release,
  source_latest_release_at = github_latest_release_at,
  source_last_commit_at = github_last_commit_at,
  source_checked_at = github_checked_at
where source_code_host = 'github';

create index open_projects_source_stars_idx
  on public.open_projects (source_stars desc nulls last);

create index open_projects_source_checked_at_idx
  on public.open_projects (source_code_host, source_checked_at nulls first)
  where source_code_url is not null;

create index open_projects_source_topics_idx
  on public.open_projects using gin (source_topics);

commit;
