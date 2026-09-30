begin;

do $migration$
declare
  v_app_id uuid;
  current_categories text[];
  current_options jsonb;
  affected integer;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='drone' and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "summary":"DevOps service for hosting code, running pipelines, managing development environments, and storing build artifacts.",
      "website_url":null,
      "source_code_url":"https://github.com/harness/drone",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"Apache-2.0",
      "source_model":"source_available",
      "docker_support":"community",
      "docker_image":"drone/drone",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'drone app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['system-admin-hosting']::text[] then
    raise exception 'drone categories changed since review';
  end if;

  select io.options into current_options
  from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/drone/drone/'
     or current_options->0->>'support_level' is distinct from 'community'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/selfhosters/unRAID-CA-templates/master/templates/drone.xml' then
    raise exception 'drone install options changed since review';
  end if;

  update public.self_host_apps a set
    name='Drone CI',
    summary='CI server that connects to Git repositories and runs pipeline jobs with separate runners.',
    website_url='https://www.drone.io',
    source_code_url='https://github.com/harness/harness/tree/drone',
    source_full_name='harness/harness',
    docs_url='https://docs.drone.io/server/overview/',
    install_docs_url='https://docs.drone.io/server/overview/',
    license='Apache-2.0 (Community Edition)', license_spdx_id='Apache-2.0', license_type='permissive', source_model='open_source',
    publisher_name='Harness', publisher_type='company', publisher_url='https://www.harness.io', pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/r/drone/drone/', docker_image='drone/drone:2',
    compose_support=false, compose_url=null,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['web']::text[],
    data_source_urls=array[
      'https://www.drone.io/',
      'https://harness-community.github.io/',
      'https://docs.drone.io/server/overview/',
      'https://docs.drone.io/server/provider/github/',
      'https://docs.drone.io/server/storage/database/',
      'https://docs.drone.io/server/reference/drone-license/',
      'https://github.com/harness/harness/tree/drone',
      'https://github.com/harness/harness/blob/drone/LICENSE',
      'https://hub.docker.com/r/drone/drone/',
      'https://raw.githubusercontent.com/selfhosters/unRAID-CA-templates/master/templates/drone.xml'
    ],
    summary_source='https://docs.drone.io/server/overview/', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The Drone Community Edition is Apache 2.0; the repository identifies a separate license for Enterprise Edition files.","source_urls":["https://github.com/harness/harness/blob/drone/LICENSE","https://harness-community.github.io/"]},
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Drone documents its server as a Docker image and gives the drone/drone:2 command.","source_urls":["https://docs.drone.io/server/provider/github/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official install guide pulls drone/drone:2.","source_urls":["https://docs.drone.io/server/provider/github/","https://hub.docker.com/r/drone/drone/"]},
      "compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The official server install guide gives Docker run instructions; no official Compose deployment file was found.","source_urls":["https://docs.drone.io/server/provider/github/","https://docs.drone.io/server/overview/"]},
      "database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Drone uses embedded SQLite by default and supports PostgreSQL or MySQL as optional external backends, so a separate database service is not required.","source_urls":["https://docs.drone.io/server/storage/database/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official server command mounts the persistent /data directory.","source_urls":["https://docs.drone.io/server/provider/github/"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"No official RAM requirement found; the estimate covers a small server and one low-volume runner.","source_urls":["https://docs.drone.io/server/overview/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"No official storage requirement found; the estimate covers persistent server data and a small local runner cache.","source_urls":["https://docs.drone.io/server/provider/github/","https://docs.drone.io/server/overview/"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'drone app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024, ram_estimate_max_mb=4096,
    ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small Drone server with one low-volume runner; build jobs can use more memory.',
    ram_source_urls=array['https://docs.drone.io/server/overview/'],
    storage_estimate_min_gb=10, storage_estimate_max_gb=100,
    storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Persistent server data and a small local runner cache; repository and pipeline volume drive growth.',
    storage_source_urls=array['https://docs.drone.io/server/provider/github/','https://docs.drone.io/server/overview/'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'drone resource update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/drone/drone/","note":"Official Drone server image; the install guide uses drone/drone:2.","image":"drone/drone:2","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.drone.io/server/provider/github/","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/selfhosters/unRAID-CA-templates/master/templates/drone.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/selfhosters/unRAID-CA-templates/master/templates/drone.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/drone/drone/'],
    docker_images=array['drone/drone:2'],
    compose_urls='{}',
    unraid_urls=array['https://raw.githubusercontent.com/selfhosters/unRAID-CA-templates/master/templates/drone.xml'],
    source_urls=array[
      'https://docs.drone.io/server/provider/github/',
      'https://hub.docker.com/r/drone/drone/',
      'https://raw.githubusercontent.com/selfhosters/unRAID-CA-templates/master/templates/drone.xml'
    ],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'drone install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug='developer-tools';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'drone category update failed'; end if;
end
$migration$;

commit;
