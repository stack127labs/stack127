begin;

do $migration$
declare
  v_app_id uuid;
  v_current_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='docker-github-actions-runner'
    and a.published is true
    and a.self_hosting_status='self_hostable'
    and a.name='Docker-Github-Actions-Runner'
    and a.source_code_url='https://github.com/myoung34/docker-github-actions-runner'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available'
    and a.docker_support='community'
    and a.compose_support is false
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'GitHub Actions runner record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['developer-tools','system-admin-hosting']::text[] then
    raise exception 'GitHub Actions runner categories changed since review';
  end if;

  select io.options into v_current_options
  from public.self_host_app_install_options io
  where io.app_id=v_app_id
  for update;
  if v_current_options is distinct from '[
    {"url":"https://hub.docker.com/r/myoung34/github-runner","note":"Community-maintained image. Verify the publisher before pulling.","image":"myoung34/github-runner:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/myoung34/github-runner","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml","support_level":"community"}
  ]'::jsonb then
    raise exception 'GitHub Actions runner install options changed since review';
  end if;

  update public.self_host_apps a set
    name='GitHub Actions Runner (Docker)',
    summary='Runs self-hosted GitHub Actions runners in Docker and can execute Docker-based workflow jobs.',
    website_url='https://github.com/myoung34/docker-github-actions-runner',
    source_code_url='https://github.com/myoung34/docker-github-actions-runner',
    source_code_host='github',
    github_owner='myoung34', github_repo='docker-github-actions-runner',
    github_full_name='myoung34/docker-github-actions-runner', source_full_name='myoung34/docker-github-actions-runner',
    docs_url='https://github.com/myoung34/docker-github-actions-runner/wiki',
    install_docs_url='https://github.com/myoung34/docker-github-actions-runner/wiki/Usage',
    docker_url='https://hub.docker.com/r/myoung34/github-runner',
    compose_url='https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose',
    license='GNU General Public License v3.0 (GPL-3.0) for this project; bundled components may have separate licenses.',
    license_type='copyleft', license_spdx_id='GPL-3.0', source_model='open_source',
    publisher_name='myoung34', publisher_type='community', publisher_url='https://github.com/myoung34',
    pricing_model='free', maintenance_status='active',
    docker_support='official', docker_image='myoung34/github-runner:latest', compose_support=true,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    ram_min_mb=null, ram_recommended_mb=null, storage_min_gb=null, resource_requirement_kind='unknown',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['cli']::text[],
    summary_source='https://github.com/myoung34/docker-github-actions-runner', summary_confidence='high',
    release_url='https://github.com/myoung34/docker-github-actions-runner/releases',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project repository identifies GPL-3.0.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/blob/master/LICENSE","https://github.com/myoung34/docker-github-actions-runner"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The 256 MiB to 2 GiB planning range is an estimate based on the upstream one-runner example; job workloads change actual use.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#kubernetes"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Workspace and build cache sizes vary; the listed range is an estimate.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project documents its Docker runner image and Docker workload setup.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage","https://hub.docker.com/r/myoung34/github-runner"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project usage guide provides the myoung34/github-runner image.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official usage wiki includes a Docker Compose example.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The runner connects to GitHub and does not require a separate database service.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project supports persistent runner data and work directories; ephemeral setups can omit them.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose","https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#ephemeral-runners"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is configured and run as a command-line container service; the repo does not provide a web interface.","source_urls":["https://github.com/myoung34/docker-github-actions-runner/wiki/Usage"]}
    }'::jsonb),
    data_source_urls=(
      select array_agg(distinct u order by u)
      from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
        'https://github.com/myoung34/docker-github-actions-runner',
        'https://github.com/myoung34/docker-github-actions-runner/blob/master/LICENSE',
        'https://github.com/myoung34/docker-github-actions-runner/wiki/Usage',
        'https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose',
        'https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#kubernetes',
        'https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#ephemeral-runners',
        'https://github.com/myoung34/docker-github-actions-runner/blob/master/README.md',
        'https://hub.docker.com/r/myoung34/github-runner',
        'https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml'
      ]::text[]) as urls(u)
    ),
    data_checked_at=now(), data_confidence='high', technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'GitHub Actions runner app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='The project Kubernetes example assigns 256 MiB request and 512 MiB limit to one runner; workflow tools and Docker jobs can need more.',
    ram_source_urls=array['https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#kubernetes'],
    storage_estimate_min_gb=5, storage_estimate_max_gb=50, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='A small runner needs workspace and configuration space; checked-out code, Docker images, and build caches can use much more.',
    storage_source_urls=array['https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose','https://github.com/myoung34/docker-github-actions-runner/blob/master/README.md'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id
    and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'GitHub Actions runner resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/myoung34/github-runner","note":"Project Docker image; shown in the official usage guide.","image":"myoung34/github-runner:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/myoung34/docker-github-actions-runner/wiki/Usage","support_level":"official"},
      {"url":"https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose","note":"Official Docker Compose example.","image":"myoung34/github-runner:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/myoung34/github-runner'],
    docker_images=array['myoung34/github-runner:latest'],
    compose_urls=array['https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose'],
    unraid_urls=array['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml'],
    source_urls=array[
      'https://github.com/myoung34/docker-github-actions-runner/wiki/Usage',
      'https://hub.docker.com/r/myoung34/github-runner',
      'https://github.com/myoung34/docker-github-actions-runner/wiki/Usage#docker-compose',
      'https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/github_runner.xml'
    ],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=v_current_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'GitHub Actions runner install option update failed'; end if;
end
$migration$;

commit;
