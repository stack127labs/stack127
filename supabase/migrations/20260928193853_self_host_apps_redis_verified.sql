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
  where a.slug='redis'
    and a.published is true
    and a.self_hosting_status='self_hostable'
    and a.name='Redis'
    and a.source_code_url='https://github.com/docker-library/redis'
    and a.license='No open-source license declared'
    and a.license_spdx_id='BSD-3-Clause'
    and a.source_model='source_available'
    and a.docker_image='redis'
    and a.docker_support='community'
    and a.compose_support is false
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'redis app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['databases','networking-dns','photos-galleries']::text[] then
    raise exception 'redis categories changed since review';
  end if;

  select io.options into v_current_options
  from public.self_host_app_install_options io
  where io.app_id=v_app_id
  for update;
  if v_current_options is distinct from '[
    {"url":"https://hub.docker.com/_/redis","note":"Community-maintained image. Verify the publisher before pulling.","image":"redis","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://registry.hub.docker.com/_/redis/","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml","support_level":"community"}
  ]'::jsonb then
    raise exception 'redis install options changed since review';
  end if;

  update public.self_host_apps a set
    summary='Redis is an in-memory data store for caching, data structures, messaging, and vector search.',
    website_url='https://redis.io/',
    source_code_url='https://github.com/redis/redis',
    source_code_host='github',
    github_owner='redis', github_repo='redis', github_full_name='redis/redis', source_full_name='redis/redis',
    github_project_id=null, github_repo_id=null, github_node_id=null, source_repo_id=null,
    docs_url='https://redis.io/docs/latest/operate/oss_and_stack/',
    install_docs_url='https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/',
    docker_url='https://hub.docker.com/_/redis/',
    compose_url='https://redis.io/tutorials/operate/orchestration/docker/',
    license='Redis 8+: AGPLv3, RSALv2, or SSPLv1. Redis 7.4–7.8: RSALv2 or SSPLv1. Redis 7.2 and earlier: BSD-3-Clause.',
    license_type='copyleft', license_spdx_id='AGPL-3.0', source_model='open_source',
    publisher_name='Redis Ltd.', publisher_type='company', publisher_url='https://redis.io/',
    pricing_model='free', maintenance_status='active',
    docker_support='official', docker_image='redis:8', compose_support=true,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    ram_min_mb=null, storage_min_gb=null, resource_requirement_kind='unknown',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['api','cli']::text[],
    summary_source='https://github.com/redis/redis', summary_confidence='high',
    release_url='https://github.com/redis/redis/releases', release_version=null, release_published_at=null,
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis 8+ offers AGPLv3, RSALv2, or SSPLv1; earlier release lines have different licenses.","source_urls":["https://redis.io/legal/licenses/","https://github.com/redis/redis/blob/unstable/LICENSE.txt"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"Redis memory use follows the live data set and peak usage; the listed range is an estimate.","source_urls":["https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"Storage use depends on the data set and persistence settings; the listed range is an estimate.","source_urls":["https://redis.io/tutorials/operate/orchestration/docker/","https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis documents its official Docker image and Docker setup.","source_urls":["https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/","https://hub.docker.com/_/redis/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis documents the official redis image; the 8 tag is available.","source_urls":["https://hub.docker.com/_/redis/"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis has an official Docker Compose guide.","source_urls":["https://redis.io/tutorials/operate/orchestration/docker/"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis is the database service and does not require a separate database service.","source_urls":["https://redis.io/docs/latest/operate/oss_and_stack/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis supports persistent data files; its Docker guide mounts /data when data must survive container removal.","source_urls":["https://redis.io/tutorials/operate/orchestration/docker/","https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis provides a network interface and redis-cli; it is not a web application.","source_urls":["https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/"]}
    }'::jsonb),
    data_source_urls=(
      select array_agg(distinct u order by u)
      from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
        'https://redis.io/',
        'https://redis.io/docs/latest/operate/oss_and_stack/',
        'https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/docker/',
        'https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/',
        'https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/',
        'https://redis.io/legal/licenses/',
        'https://redis.io/tutorials/operate/orchestration/docker/',
        'https://github.com/redis/redis',
        'https://github.com/redis/redis/blob/unstable/LICENSE.txt',
        'https://github.com/redis/docker-library-redis',
        'https://hub.docker.com/_/redis/',
        'https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml'
      ]::text[]) as urls(u)
    ),
    data_checked_at=now(), data_confidence='high', technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'redis app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='A small Redis cache or key-value service can start around 512 MB to 2 GB; required memory follows the live data set and peak use.',
    ram_source_urls=array['https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=20, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='A small persistent Redis data set can start around 1 to 20 GB; RDB/AOF files and backups grow with data and write volume.',
    storage_source_urls=array['https://redis.io/tutorials/operate/orchestration/docker/','https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id
    and e.ram_estimate_min_mb=1024 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'redis resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/_/redis/","note":"Official Redis Docker image; the redis:8 tag is available.","image":"redis:8","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/_/redis/","support_level":"official"},
      {"url":"https://redis.io/tutorials/operate/orchestration/docker/","note":"Official guide includes a Docker Compose setup.","image":"redis:8","label":"Docker Compose guide","method":"compose","sort_order":15,"source_url":"https://redis.io/tutorials/operate/orchestration/docker/","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/redis/'],
    docker_images=array['redis:8'],
    compose_urls=array['https://redis.io/tutorials/operate/orchestration/docker/'],
    unraid_urls=array['https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml'],
    source_urls=array[
      'https://hub.docker.com/_/redis/',
      'https://redis.io/tutorials/operate/orchestration/docker/',
      'https://raw.githubusercontent.com/juusujanar/unraid-templates/master/Redis.xml'
    ],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=v_current_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'redis install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug='databases';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'redis category update failed'; end if;
end
$migration$;

commit;
