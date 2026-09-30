begin;

do $migration$
declare
  v_nginx_id uuid;
  v_statping_id uuid;
  v_nginx_options jsonb;
  v_statping_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_nginx_id
  from public.self_host_apps a
  where a.slug='nginx-php-fpm'
    and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='NGINX---PHP-FPM'
    and a.source_code_url='https://github.com/richarvey/nginx-php-fpm'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available'
    and a.docker_support='community'
    and a.compose_support is false
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_nginx_id is null then raise exception 'Nginx PHP-FPM record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_nginx_id;
  if v_categories is distinct from array['developer-tools','networking-dns']::text[] then
    raise exception 'Nginx PHP-FPM categories changed since review';
  end if;
  select io.options into v_nginx_options from public.self_host_app_install_options io where io.app_id=v_nginx_id for update;
  if v_nginx_options is distinct from '[
    {"url":"https://hub.docker.com/r/richarvey/nginx-php-fpm","note":"Community-maintained image. Verify the publisher before pulling.","image":"richarvey/nginx-php-fpm:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/richarvey/nginx-php-fpm","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml","support_level":"community"}
  ]'::jsonb then raise exception 'Nginx PHP-FPM install options changed since review'; end if;

  select a.id into v_statping_id
  from public.self_host_apps a
  where a.slug='statping'
    and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='statping'
    and a.source_code_url='https://github.com/hunterlong/statping'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available'
    and a.docker_support='community'
    and a.compose_support is false
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_statping_id is null then raise exception 'Statping record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_statping_id;
  if v_categories is distinct from array['monitoring-status','networking-dns']::text[] then
    raise exception 'Statping categories changed since review';
  end if;
  select io.options into v_statping_options from public.self_host_app_install_options io where io.app_id=v_statping_id for update;
  if v_statping_options is distinct from '[
    {"url":"https://hub.docker.com/r/statping/statping","note":"Community-maintained image. Verify the publisher before pulling.","image":"statping/statping:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/statping/statping","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml","support_level":"community"}
  ]'::jsonb then raise exception 'Statping install options changed since review'; end if;

  update public.self_host_apps a set
    name='Nginx PHP-FPM',
    summary='Runs Nginx and PHP-FPM in one Docker image to serve PHP sites, with optional Git-based code deployment.',
    website_url='https://github.com/richarvey/nginx-php-fpm',
    docs_url='https://github.com/richarvey/nginx-php-fpm/tree/main/docs',
    install_docs_url='https://github.com/richarvey/nginx-php-fpm/blob/main/README.md',
    docker_url='https://hub.docker.com/r/richarvey/nginx-php-fpm',
    compose_url='https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md',
    license='GNU General Public License v3.0 (GPL-3.0).',
    license_type='copyleft', license_spdx_id='GPL-3.0', source_model='open_source',
    docker_support='official', docker_image='richarvey/nginx-php-fpm:latest', compose_support=true,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    surfaces=array['web']::text[],
    summary_source='https://github.com/richarvey/nginx-php-fpm', summary_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project repository identifies GPL-3.0.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/LICENSE","https://github.com/richarvey/nginx-php-fpm"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed planning range is an estimate for a small PHP site; worker settings and traffic change actual use.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed planning range is an estimate; site files and logs set actual use.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project documents its richarvey/nginx-php-fpm Docker image.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/README.md","https://hub.docker.com/r/richarvey/nginx-php-fpm"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project quick start pulls its own richarvey/nginx-php-fpm image.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/README.md"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project provides a Docker Compose guide.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"This PHP runtime image does not require a separate database service.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/README.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The image supports local volume mounts for application files and configuration.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/README.md","https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Nginx serves the PHP application over HTTP.","source_urls":["https://github.com/richarvey/nginx-php-fpm/blob/main/README.md"]}
    }'::jsonb),
    data_source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
      'https://github.com/richarvey/nginx-php-fpm','https://github.com/richarvey/nginx-php-fpm/blob/main/LICENSE',
      'https://github.com/richarvey/nginx-php-fpm/blob/main/README.md','https://github.com/richarvey/nginx-php-fpm/tree/main/docs',
      'https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md',
      'https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/kubernetes.md',
      'https://hub.docker.com/r/richarvey/nginx-php-fpm','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml'
    ]::text[]) as urls(u)),
    data_checked_at=now(), data_confidence='high', technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_nginx_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Nginx PHP-FPM app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small PHP sites can start within this range; PHP worker count, extensions, traffic, and the served application raise memory use.',
    ram_source_urls=array['https://github.com/richarvey/nginx-php-fpm/blob/main/README.md'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=20, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='The container and a small PHP site need little space; site assets, logs, and mounted application files determine the total.',
    storage_source_urls=array['https://github.com/richarvey/nginx-php-fpm/blob/main/README.md','https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_nginx_id and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Nginx PHP-FPM resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/richarvey/nginx-php-fpm","note":"Official project image; the project quick start pulls this image.","image":"richarvey/nginx-php-fpm:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/richarvey/nginx-php-fpm/blob/main/README.md","support_level":"official"},
      {"url":"https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md","note":"Official Docker Compose guide.","image":"richarvey/nginx-php-fpm:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/richarvey/nginx-php-fpm'],docker_images=array['richarvey/nginx-php-fpm:latest'],
    compose_urls=array['https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md'],
    unraid_urls=array['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml'],
    source_urls=array['https://github.com/richarvey/nginx-php-fpm/blob/main/README.md','https://hub.docker.com/r/richarvey/nginx-php-fpm','https://github.com/richarvey/nginx-php-fpm/blob/main/docs/guides/docker_compose.md','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/nginx_php_fpm.xml'],
    checked_at=now(),updated_at=now()
  where io.app_id=v_nginx_id and io.options=v_nginx_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Nginx PHP-FPM install option update failed'; end if;

  update public.self_host_apps a set
    name='Statping',summary='Monitors websites and services, then shows their status on a web page with an API and alert integrations.',
    website_url='https://github.com/statping/statping',source_code_url='https://github.com/statping/statping',
    source_code_host='github',github_owner='statping',github_repo='statping',github_full_name='statping/statping',source_full_name='statping/statping',
    docs_url='https://github.com/statping/statping/wiki',install_docs_url='https://github.com/statping/statping/wiki/Docker',
    docker_url='https://hub.docker.com/r/statping/statping',compose_url='https://github.com/statping/statping/blob/dev/docker-compose.yml',
    license='GNU General Public License v3.0 (GPL-3.0).',license_type='copyleft',license_spdx_id='GPL-3.0',source_model='open_source',
    publisher_name='Statping',publisher_type='community',publisher_url='https://github.com/statping',
    docker_support='official',docker_image='statping/statping:latest',compose_support=true,
    requires_database=false,database_types=array['sqlite','mysql','postgres']::text[],persistent_storage=true,storage_profile='depends',
    surfaces=array['web','api']::text[],release_url='https://github.com/statping/statping/releases',
    summary_source='https://github.com/statping/statping',summary_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project repository identifies GPL-3.0.","source_urls":["https://github.com/statping/statping/blob/dev/LICENSE","https://github.com/statping/statping"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed planning range is an estimate for a small status page; check frequency and service count change actual use.","source_urls":["https://github.com/statping/statping/blob/dev/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed planning range is an estimate; logs, assets, and status history affect actual use.","source_urls":["https://github.com/statping/statping/wiki/Docker"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project documents the statping/statping Docker image.","source_urls":["https://github.com/statping/statping/wiki/Docker","https://hub.docker.com/r/statping/statping"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream Docker guide provides the statping/statping image.","source_urls":["https://github.com/statping/statping/wiki/Docker"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project README and repository include Docker Compose examples.","source_urls":["https://github.com/statping/statping/blob/dev/README.md","https://github.com/statping/statping/blob/dev/docker-compose.yml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Statping supports SQLite, MySQL, and Postgres; SQLite data is kept in its /app working directory, so a separate database is optional.","source_urls":["https://github.com/statping/statping/blob/dev/README.md","https://github.com/statping/statping/wiki/Docker"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Docker guide stores configuration, logs, assets, and SQLite data in /app.","source_urls":["https://github.com/statping/statping/wiki/Docker"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project provides a web status page and REST API.","source_urls":["https://github.com/statping/statping/blob/dev/README.md","https://github.com/statping/statping/wiki/API"]}
    }'::jsonb),
    data_source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
      'https://github.com/statping/statping','https://github.com/statping/statping/blob/dev/LICENSE',
      'https://github.com/statping/statping/blob/dev/README.md','https://github.com/statping/statping/wiki/Docker',
      'https://github.com/statping/statping/wiki/API','https://github.com/statping/statping/blob/dev/docker-compose.yml',
      'https://hub.docker.com/r/statping/statping','https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml'
    ]::text[]) as urls(u)),
    data_checked_at=now(),data_confidence='high',technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_statping_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Statping app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256,ram_estimate_max_mb=1024,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='The project describes a small status-page server; monitored service count, check frequency, and database choice change memory use.',
    ram_source_urls=array['https://github.com/statping/statping/blob/dev/README.md'],
    storage_estimate_min_gb=1,storage_estimate_max_gb=10,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The /app directory keeps configuration, logs, assets, and the SQLite database; checks and retained history grow storage use.',
    storage_source_urls=array['https://github.com/statping/statping/wiki/Docker','https://github.com/statping/statping/blob/dev/README.md'],
    checked_at=now(),updated_at=now()
  where e.app_id=v_statping_id and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Statping resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/statping/statping","note":"Official Statping Docker image from the project''s Docker guide.","image":"statping/statping:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/statping/statping/wiki/Docker","support_level":"official"},
      {"url":"https://github.com/statping/statping/blob/dev/docker-compose.yml","note":"Official Docker Compose file from the project repository.","image":"statping/statping:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/statping/statping/blob/dev/docker-compose.yml","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/statping/statping'],docker_images=array['statping/statping:latest'],
    compose_urls=array['https://github.com/statping/statping/blob/dev/docker-compose.yml'],
    unraid_urls=array['https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml'],
    source_urls=array['https://github.com/statping/statping/wiki/Docker','https://hub.docker.com/r/statping/statping','https://github.com/statping/statping/blob/dev/docker-compose.yml','https://raw.githubusercontent.com/FoxxMD/unraid-docker-templates/master/foxxmd/statping.xml'],
    checked_at=now(),updated_at=now()
  where io.app_id=v_statping_id and io.options=v_statping_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Statping install option update failed'; end if;
end
$migration$;

commit;
