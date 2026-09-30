begin;

update public.self_host_apps app set
  source_code_url = project.repository_url,
  source_code_host = 'github',
  github_project_id = project.id,
  github_owner = project.owner,
  github_repo = project.repo,
  github_full_name = project.full_name,
  github_repo_id = project.repo_id,
  github_node_id = project.node_id,
  github_owner_type = project.owner_type,
  github_stars = project.stars,
  github_forks = project.forks,
  github_watchers = project.watchers,
  github_open_issues = project.open_issues,
  github_primary_language = project.primary_language,
  github_languages = project.languages,
  github_topics = project.topics,
  github_created_at = project.created_at,
  github_updated_at = project.updated_at,
  github_pushed_at = project.pushed_at,
  github_default_branch = project.default_branch,
  github_repo_size_kb = project.repo_size_kb,
  github_archived = project.archived,
  github_disabled = project.disabled,
  github_is_fork = project.is_fork,
  github_is_template = project.is_template,
  github_latest_release = project.latest_release,
  github_latest_release_at = project.latest_release_at,
  github_last_commit_at = project.last_commit_at,
  github_checked_at = project.checked_at,
  release_version = project.latest_release,
  release_published_at = project.latest_release_at,
  release_checked_at = project.checked_at,
  release_url = case
    when project.latest_release is null then null
    else rtrim(project.repository_url, '/') || '/releases/latest'
  end,
  source_repo_id = project.repo_id::text,
  source_full_name = project.full_name,
  source_stars = project.stars,
  source_forks = project.forks,
  source_watchers = project.watchers,
  source_open_issues = project.open_issues,
  source_primary_language = project.primary_language,
  source_languages = project.languages,
  source_topics = project.topics,
  source_created_at = project.created_at,
  source_updated_at = project.updated_at,
  source_pushed_at = project.pushed_at,
  source_default_branch = project.default_branch,
  source_repo_size_kb = project.repo_size_kb,
  source_archived = project.archived,
  source_disabled = project.disabled,
  source_is_fork = project.is_fork,
  source_is_template = project.is_template,
  source_latest_release = project.latest_release,
  source_latest_release_at = project.latest_release_at,
  source_last_commit_at = project.last_commit_at,
  source_checked_at = project.checked_at,
  data_source_urls = (
    select array_agg(distinct source_url order by source_url)
    from unnest(
      coalesce(app.data_source_urls, array[]::text[])
      || array[
        project.repository_url,
        rtrim(project.repository_url, '/') || '/releases/latest'
      ]
    ) as source_url
  ),
  updated_at = now()
from public.github_projects project
where app.slug in ('dify','firecrawl','hermes-agent','langflow','rustdesk')
  and app.published = true
  and app.self_hosting_status = 'self_hostable'
  and app.github_project_id = project.id;

commit;
