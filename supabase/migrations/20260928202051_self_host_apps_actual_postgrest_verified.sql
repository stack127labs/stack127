begin;

do $migration$
declare
  v_actual_id uuid;
  v_postgrest_id uuid;
  v_actual_options jsonb;
  v_postgrest_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_actual_id
  from public.self_host_apps a
  where a.slug='actualserver' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='ActualServer'
    and a.source_code_url='https://github.com/kippenhof/docker-templates'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0' and a.source_model='source_available'
    and a.docker_support='community' and a.compose_support is false
    and a.requires_database is null and a.persistent_storage is null
    and a.github_owner='kippenhof' and a.github_repo='docker-templates'
    and a.source_full_name='kippenhof/docker-templates'
  for update;
  if v_actual_id is null then raise exception 'Actual Budget record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_actual_id;
  if v_categories is distinct from array['finance-budgeting','security-privacy','system-admin-hosting']::text[] then
    raise exception 'Actual Budget categories changed since review';
  end if;
  select io.options into v_actual_options from public.self_host_app_install_options io where io.app_id=v_actual_id for update;
  if v_actual_options is distinct from '[
    {"url":"https://hub.docker.com/r/actualbudget/actual-server","note":"Community-maintained image. Verify the publisher before pulling.","image":"actualbudget/actual-server","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/actualbudget/actual-server","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml","support_level":"community"}
  ]'::jsonb then raise exception 'Actual Budget install options changed since review'; end if;

  select a.id into v_postgrest_id
  from public.self_host_apps a
  where a.slug='postgrest' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='PostgREST' and a.source_code_url is null and a.license is null
    and a.license_spdx_id is null and a.source_model='closed_source'
    and a.docker_support='community' and a.compose_support is false
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_postgrest_id is null then raise exception 'PostgREST record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_postgrest_id;
  if v_categories is distinct from array['databases','developer-tools','documents-pdfs']::text[] then
    raise exception 'PostgREST categories changed since review';
  end if;
  select io.options into v_postgrest_options from public.self_host_app_install_options io where io.app_id=v_postgrest_id for update;
  if v_postgrest_options is distinct from '[
    {"url":"https://hub.docker.com/r/postgrest/postgrest","note":"Community-maintained image. Verify the publisher before pulling.","image":"postgrest/postgrest:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/postgrest/postgrest","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml","support_level":"community"}
  ]'::jsonb then raise exception 'PostgREST install options changed since review'; end if;

  update public.self_host_apps a set
    name='Actual Budget',
    summary='Local-first budgeting software for managing accounts, transactions, and budgets across devices.',
    website_url='https://actualbudget.org/',
    source_code_url='https://github.com/actualbudget/actual',source_code_host='github',
    github_owner='actualbudget',github_repo='actual',github_full_name='actualbudget/actual',source_full_name='actualbudget/actual',
    github_repo_id=null,github_node_id=null,source_repo_id=null,github_project_id=null,
    github_stars=null,source_stars=null,github_forks=null,source_forks=null,github_watchers=null,source_watchers=null,
    github_open_issues=null,source_open_issues=null,github_latest_release=null,github_latest_release_at=null,
    github_last_commit_at=null,github_checked_at=null,source_latest_release=null,source_latest_release_at=null,
    source_last_commit_at=null,source_checked_at=null,
    docs_url='https://actualbudget.org/docs/',install_docs_url='https://actualbudget.org/docs/install/docker/',
    docker_url='https://hub.docker.com/r/actualbudget/actual-server',
    compose_url='https://github.com/actualbudget/actual/blob/master/docker-compose.yml',
    license='MIT License.',license_type='permissive',license_spdx_id='MIT',source_model='open_source',
    publisher_name='Actual Budget',publisher_type='community',publisher_url='https://actualbudget.org/',
    pricing_model='free',docker_support='official',docker_image='actualbudget/actual-server:latest',compose_support=true,
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',
    ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    surfaces=array['web']::text[],deployment_methods=array['docker','unraid']::text[],
    summary_source='https://github.com/actualbudget/actual',summary_confidence='high',
    release_url='https://github.com/actualbudget/actual/releases',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Actual project repository identifies the MIT License.","source_urls":["https://github.com/actualbudget/actual/blob/master/LICENSE.txt","https://github.com/actualbudget/actual"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed RAM range is an estimate for a small Actual server; sync activity and users change actual use.","source_urls":["https://github.com/actualbudget/actual/blob/master/packages/docs/docs/install/docker.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed storage range is an estimate based on Actual storing server and budget files under /data.","source_urls":["https://actualbudget.org/docs/install/docker/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes its Docker Hub and GHCR images.","source_urls":["https://actualbudget.org/docs/install/docker/","https://hub.docker.com/r/actualbudget/actual-server"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Actual publishes the actualbudget/actual-server image.","source_urls":["https://actualbudget.org/docs/install/docker/"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide uses the Compose file in the Actual repository.","source_urls":["https://actualbudget.org/docs/install/docker/","https://github.com/actualbudget/actual/blob/master/docker-compose.yml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Docker server writes its data under /data and does not require a separate database service.","source_urls":["https://actualbudget.org/docs/install/docker/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide mounts /data to retain budget and server files when the container is removed.","source_urls":["https://actualbudget.org/docs/install/docker/"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The self-hosted server is accessed through a web browser.","source_urls":["https://actualbudget.org/docs/install/docker/"]}
    }'::jsonb),
    data_source_urls=array[
      'https://actualbudget.org/','https://actualbudget.org/docs/','https://actualbudget.org/docs/install/docker/',
      'https://github.com/actualbudget/actual','https://github.com/actualbudget/actual/blob/master/LICENSE.txt',
      'https://github.com/actualbudget/actual/blob/master/packages/docs/docs/install/docker.md',
      'https://github.com/actualbudget/actual/blob/master/docker-compose.yml',
      'https://hub.docker.com/r/actualbudget/actual-server','https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml'
    ]::text[],
    data_checked_at=now(),data_confidence='high',technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_actual_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Actual Budget app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256,ram_estimate_max_mb=1024,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='A small Actual server handles budget sync and a few users; simultaneous clients and sync activity raise memory use.',
    ram_source_urls=array['https://github.com/actualbudget/actual/blob/master/packages/docs/docs/install/docker.md'],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Actual saves server and budget files under /data; the number of budgets, imports, and backups determines growth.',
    storage_source_urls=array['https://actualbudget.org/docs/install/docker/','https://github.com/actualbudget/actual/blob/master/packages/docs/docs/install/docker.md'],
    checked_at=now(),updated_at=now()
  where e.app_id=v_actual_id and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Actual Budget estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/actualbudget/actual-server","note":"Official Actual Budget image on Docker Hub.","image":"actualbudget/actual-server:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://actualbudget.org/docs/install/docker/","support_level":"official"},
      {"url":"https://github.com/actualbudget/actual/blob/master/docker-compose.yml","note":"Official Docker Compose file from the Actual repository.","image":"actualbudget/actual-server:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://actualbudget.org/docs/install/docker/","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/actualbudget/actual-server'],docker_images=array['actualbudget/actual-server:latest'],
    compose_urls=array['https://github.com/actualbudget/actual/blob/master/docker-compose.yml'],
    unraid_urls=array['https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml'],
    source_urls=array['https://actualbudget.org/docs/install/docker/','https://hub.docker.com/r/actualbudget/actual-server','https://github.com/actualbudget/actual/blob/master/docker-compose.yml','https://raw.githubusercontent.com/hofq/docker-templates/main/actual-server.xml'],
    checked_at=now(),updated_at=now()
  where io.app_id=v_actual_id and io.options=v_actual_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Actual Budget install options update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_actual_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_actual_id,c.id from public.self_host_app_categories c where c.slug in ('finance-budgeting','security-privacy');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception 'Actual Budget categories update failed'; end if;

  update public.self_host_apps a set
    name='PostgREST',summary='Turns tables, views, and functions in an existing PostgreSQL database into a REST API.',
    website_url='https://postgrest.org/',source_code_url='https://github.com/PostgREST/postgrest',source_code_host='github',
    github_owner='PostgREST',github_repo='postgrest',github_full_name='PostgREST/postgrest',source_full_name='PostgREST/postgrest',
    docs_url='https://docs.postgrest.org/en/latest/',install_docs_url='https://docs.postgrest.org/en/latest/explanations/install.html',
    docker_url='https://hub.docker.com/r/postgrest/postgrest',
    compose_url='https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose',
    license='MIT License.',license_type='permissive',license_spdx_id='MIT',source_model='open_source',
    publisher_name='PostgREST',publisher_type='community',publisher_url='https://github.com/PostgREST',
    pricing_model='free',docker_support='official',docker_image='postgrest/postgrest:latest',compose_support=true,
    requires_database=true,database_types=array['PostgreSQL']::text[],persistent_storage=false,storage_profile='low',
    ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    surfaces=array['api']::text[],summary_source='https://github.com/PostgREST/postgrest',summary_confidence='high',
    release_url='https://github.com/PostgREST/postgrest/releases',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The PostgREST repository and package metadata identify the MIT License.","source_urls":["https://github.com/PostgREST/postgrest/blob/main/LICENSE","https://github.com/PostgREST/postgrest/blob/main/postgrest.cabal"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed RAM range is an estimate for the API service alone; database connections and request load affect use.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed storage range is an estimate for the service image, configuration, and logs; PostgreSQL data is stored separately.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The installation guide identifies postgrest/postgrest as the official Docker image.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html","https://hub.docker.com/r/postgrest/postgrest"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official installation guide provides the postgrest/postgrest image.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official installation guide includes a Docker Compose deployment with PostgreSQL.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"PostgREST requires an existing PostgreSQL database or a PostgreSQL service in its Compose setup.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"PostgREST itself is stateless; persist the separate PostgreSQL database when using the combined Compose setup.","source_urls":["https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"PostgREST serves a REST API from PostgreSQL; it is not a web application UI.","source_urls":["https://github.com/PostgREST/postgrest","https://docs.postgrest.org/en/latest/explanations/install.html"]}
    }'::jsonb),
    data_source_urls=array[
      'https://postgrest.org/','https://docs.postgrest.org/en/latest/','https://docs.postgrest.org/en/latest/explanations/install.html',
      'https://github.com/PostgREST/postgrest','https://github.com/PostgREST/postgrest/blob/main/LICENSE',
      'https://github.com/PostgREST/postgrest/blob/main/postgrest.cabal','https://hub.docker.com/r/postgrest/postgrest',
      'https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml'
    ]::text[],
    data_checked_at=now(),data_confidence='high',technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_postgrest_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'PostgREST app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for the API server alone; request rate and concurrent database connections affect memory, and PostgreSQL needs separate RAM.',
    ram_source_urls=array['https://docs.postgrest.org/en/latest/explanations/install.html','https://github.com/PostgREST/postgrest'],
    storage_estimate_min_gb=1,storage_estimate_max_gb=5,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='PostgREST keeps no application database on its own; this range covers the service image, configuration, and logs, not PostgreSQL data.',
    storage_source_urls=array['https://docs.postgrest.org/en/latest/explanations/install.html'],
    checked_at=now(),updated_at=now()
  where e.app_id=v_postgrest_id and e.ram_estimate_min_mb=1024 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'PostgREST estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/postgrest/postgrest","note":"Official PostgREST Docker image.","image":"postgrest/postgrest:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.postgrest.org/en/latest/explanations/install.html","support_level":"official"},
      {"url":"https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose","note":"Official Docker Compose guide includes PostgreSQL.","image":"postgrest/postgrest:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/postgrest/postgrest'],docker_images=array['postgrest/postgrest:latest'],
    compose_urls=array['https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose'],
    unraid_urls=array['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml'],
    source_urls=array['https://docs.postgrest.org/en/latest/explanations/install.html','https://hub.docker.com/r/postgrest/postgrest','https://docs.postgrest.org/en/latest/explanations/install.html#containerized-postgrest-and-db-with-docker-compose','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/postgrest.xml'],
    checked_at=now(),updated_at=now()
  where io.app_id=v_postgrest_id and io.options=v_postgrest_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'PostgREST install options update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_postgrest_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_postgrest_id,c.id from public.self_host_app_categories c where c.slug in ('databases','developer-tools');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception 'PostgREST categories update failed'; end if;
end
$migration$;

commit;
