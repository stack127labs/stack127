begin;

do $migration$
declare
  v_app_id uuid;
  current_categories text[];
  current_options jsonb;
  estimate_row public.self_host_app_resource_estimates;
  affected integer;
begin
  -- DuckDNS is a hosted dynamic-DNS service. This record describes the LinuxServer updater container.
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='duckdns' and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "name":"duckdns",
      "summary":"Duckdns is a free service which will point a DNS (sub domains of duckdns.org) to an IP of your choice.",
      "website_url":null,
      "source_code_url":"https://github.com/linuxserver/docker-duckdns",
      "docs_url":"https://github.com/linuxserver/docker-duckdns#readme",
      "install_docs_url":"https://github.com/linuxserver/docker-duckdns#readme",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"GPL-3.0",
      "source_model":"source_available",
      "docker_support":"community",
      "docker_image":"lscr.io/linuxserver/duckdns",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'duckdns app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['ai-ml','communication','networking-dns']::text[] then raise exception 'duckdns categories changed since review'; end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/linuxserver/duckdns'
     or current_options->0->>'support_level' is distinct from 'community'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckdns.xml' then
    raise exception 'duckdns install options changed since review';
  end if;
  select e.* into estimate_row from public.self_host_app_resource_estimates e where e.app_id=v_app_id for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":2048,"ram_estimate_max_mb":8192,
    "ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.",
    "storage_estimate_min_gb":1,"storage_estimate_max_gb":20,
    "storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."
  }'::jsonb) then raise exception 'duckdns resource estimates changed since review'; end if;

  update public.self_host_apps a set
    name='DuckDNS Updater',
    summary='Updates a DuckDNS record from a container on your server when your public IP changes.',
    website_url='https://www.duckdns.org',
    docs_url='https://docs.linuxserver.io/images/docker-duckdns/',
    install_docs_url='https://docs.linuxserver.io/images/docker-duckdns/#usage',
    license='GPL-3.0 LinuxServer updater image code', license_spdx_id='GPL-3.0', license_type='copyleft', source_model='open_source',
    publisher_name='LinuxServer.io', publisher_type='community', publisher_url='https://www.linuxserver.io', pricing_model='free',
    docker_support='community', docker_url='https://github.com/orgs/linuxserver/packages/container/package/duckdns',
    docker_image='lscr.io/linuxserver/duckdns:latest', compose_support=true,
    compose_url='https://docs.linuxserver.io/images/docker-duckdns/#usage',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['cli']::text[],
    data_source_urls=array[
      'https://www.duckdns.org',
      'https://docs.linuxserver.io/images/docker-duckdns/',
      'https://github.com/linuxserver/docker-duckdns',
      'https://github.com/linuxserver/docker-duckdns/blob/master/LICENSE',
      'https://github.com/linuxserver/docker-duckdns/blob/master/README.md',
      'https://github.com/orgs/linuxserver/packages/container/package/duckdns',
      'https://hub.docker.com/r/linuxserver/duckdns',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckdns.xml'
    ],
    summary_source='https://docs.linuxserver.io/images/docker-duckdns/', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer documents its lscr.io/linuxserver/duckdns container.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/","https://github.com/orgs/linuxserver/packages/container/package/duckdns"]},
      "compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer recommends a Docker Compose setup in its container guide.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/#usage"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The updater runs a scheduled IP update and does not use a database in its documented setup.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The container can save configuration and address history under /config.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/#volume-mappings-v"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for a small cron and curl updater container.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers the small container, optional config and optional IP history log.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/#volume-mappings-v"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer documents the image name and registry links.","source_urls":["https://docs.linuxserver.io/images/docker-duckdns/","https://github.com/orgs/linuxserver/packages/container/package/duckdns"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'duckdns app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=16, ram_estimate_max_mb=128, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small scheduled cron and curl updater; IP checks run every five minutes.',
    ram_source_urls=array['https://docs.linuxserver.io/images/docker-duckdns/'],
    storage_estimate_min_gb=0.1, storage_estimate_max_gb=1, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Small container and optional config or IP history log.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-duckdns/#volume-mappings-v'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'duckdns resource update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/orgs/linuxserver/packages/container/package/duckdns","note":"LinuxServer-maintained container for the hosted DuckDNS service.","image":"lscr.io/linuxserver/duckdns:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-duckdns/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-duckdns/#usage","note":"LinuxServer documents a Compose example for this image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-duckdns/#usage","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckdns.xml","note":"LinuxServer Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckdns.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://github.com/orgs/linuxserver/packages/container/package/duckdns'],
    docker_images=array['lscr.io/linuxserver/duckdns:latest'],
    compose_urls=array['https://docs.linuxserver.io/images/docker-duckdns/#usage'],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckdns.xml'],
    source_urls=array['https://docs.linuxserver.io/images/docker-duckdns/','https://github.com/linuxserver/docker-duckdns/blob/master/README.md','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckdns.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'duckdns install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id) select v_app_id,c.id from public.self_host_app_categories c where c.slug in ('automation','networking-dns');
  get diagnostics affected=row_count; if affected<>2 then raise exception 'duckdns category update failed'; end if;

  -- PostgreSQL 18: the Docker Library repo is for the image recipe, not the database source or license.
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='postgresql18' and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "name":"postgresql18",
      "source_code_url":"https://github.com/docker-library/postgres",
      "docs_url":"https://github.com/Skylinar/unraid_templates/blob/main/README.md#postgresql18",
      "install_docs_url":"https://github.com/Skylinar/unraid_templates/blob/main/README.md#postgresql18",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"MIT",
      "source_model":"source_available",
      "docker_support":"community",
      "docker_url":"https://registry.hub.docker.com/_/postgres/",
      "docker_image":"postgres:18",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'postgresql18 app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['databases','networking-dns','photos-galleries']::text[] then raise exception 'postgresql18 categories changed since review'; end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/_/postgres'
     or current_options->0->>'support_level' is distinct from 'community'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/Skylinar/unraid_templates/main/templates/postgresql18.xml' then
    raise exception 'postgresql18 install options changed since review';
  end if;
  select e.* into estimate_row from public.self_host_app_resource_estimates e where e.app_id=v_app_id for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":1024,"ram_estimate_max_mb":8192,
    "ram_estimate_basis":"Small single-node service; data volume and request load vary.",
    "storage_estimate_min_gb":5,"storage_estimate_max_gb":100,
    "storage_estimate_basis":"Small single-node service; data volume and request load vary."
  }'::jsonb) then raise exception 'postgresql18 resource estimates changed since review'; end if;

  update public.self_host_apps a set
    name='PostgreSQL 18',
    summary='Object-relational database server for storing and querying structured data with SQL.',
    website_url='https://www.postgresql.org', source_code_url='https://github.com/postgres/postgres',
    docs_url='https://www.postgresql.org/docs/18/', install_docs_url='https://hub.docker.com/_/postgres',
    license='PostgreSQL License', license_spdx_id='PostgreSQL', license_type='permissive', source_model='open_source',
    publisher_name='PostgreSQL Global Development Group', publisher_type='community', publisher_url='https://www.postgresql.org', pricing_model='free',
    docker_support='community', docker_url='https://hub.docker.com/_/postgres', docker_image='postgres:18',
    compose_support=true, compose_url='https://github.com/docker-library/docs/blob/master/postgres/compose.yaml',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['api','cli']::text[],
    data_source_urls=array[
      'https://www.postgresql.org',
      'https://www.postgresql.org/about/licence/',
      'https://www.postgresql.org/docs/18/',
      'https://www.postgresql.org/docs/18/runtime-config-resource.html',
      'https://github.com/postgres/postgres',
      'https://hub.docker.com/_/postgres',
      'https://github.com/docker-library/docs/blob/master/postgres/compose.yaml',
      'https://raw.githubusercontent.com/Skylinar/unraid_templates/main/templates/postgresql18.xml'
    ],
    summary_source='https://www.postgresql.org/about/', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Docker Hub documents the postgres:18 image and startup instructions.","source_urls":["https://hub.docker.com/_/postgres"]},
      "compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Docker Library provides a Compose example for the Postgres image.","source_urls":["https://github.com/docker-library/docs/blob/master/postgres/compose.yaml"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"PostgreSQL is the database server itself and the container setup does not require a separate database service.","source_urls":["https://hub.docker.com/_/postgres","https://www.postgresql.org/docs/18/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The Docker image stores PostgreSQL data in PGDATA and supports a persistent data volume.","source_urls":["https://hub.docker.com/_/postgres"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for a small PostgreSQL server; shared buffers, active connections, and query load drive use.","source_urls":["https://www.postgresql.org/docs/18/runtime-config-resource.html"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers database files, indexes, and write-ahead logs; application data size drives growth.","source_urls":["https://hub.docker.com/_/postgres","https://www.postgresql.org/docs/18/storage.html"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Docker Hub lists the Docker Official postgres image and its 18 tags.","source_urls":["https://hub.docker.com/_/postgres"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'postgresql18 app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=8192, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small PostgreSQL server; shared buffers, active connections, and query load drive memory use.',
    ram_source_urls=array['https://www.postgresql.org/docs/18/runtime-config-resource.html','https://hub.docker.com/_/postgres'],
    storage_estimate_min_gb=10, storage_estimate_max_gb=500, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Database files, indexes, and write-ahead logs; application data size drives growth.',
    storage_source_urls=array['https://www.postgresql.org/docs/18/storage.html','https://hub.docker.com/_/postgres'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'postgresql18 resource update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/_/postgres","note":"Docker Official Image; maintained by the Docker community.","image":"postgres:18","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/_/postgres","support_level":"community"},
      {"url":"https://github.com/docker-library/docs/blob/master/postgres/compose.yaml","note":"Compose example from the Docker Library image documentation.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/docker-library/docs/blob/master/postgres/compose.yaml","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/Skylinar/unraid_templates/main/templates/postgresql18.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/Skylinar/unraid_templates/main/templates/postgresql18.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/postgres'], docker_images=array['postgres:18'],
    compose_urls=array['https://github.com/docker-library/docs/blob/master/postgres/compose.yaml'],
    unraid_urls=array['https://raw.githubusercontent.com/Skylinar/unraid_templates/main/templates/postgresql18.xml'],
    source_urls=array['https://hub.docker.com/_/postgres','https://github.com/docker-library/docs/blob/master/postgres/compose.yaml','https://raw.githubusercontent.com/Skylinar/unraid_templates/main/templates/postgresql18.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'postgresql18 install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id) select v_app_id,c.id from public.self_host_app_categories c where c.slug='databases';
  get diagnostics affected=row_count; if affected<>1 then raise exception 'postgresql18 category update failed'; end if;

  -- RabbitMQ itself is MPL-2.0, while the Docker Official Image repository has a separate MIT license.
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='rabbitmq' and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "source_code_url":"https://github.com/docker-library/rabbitmq",
      "docs_url":"https://forums.unraid.net/topic/126248-rabbitmq-support-thread/",
      "install_docs_url":"https://forums.unraid.net/topic/126248-rabbitmq-support-thread/",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"MIT",
      "source_model":"source_available",
      "docker_support":"community",
      "docker_image":"rabbitmq:management",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'rabbitmq app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['ai-ml','knowledge-notes','password-managers']::text[] then raise exception 'rabbitmq categories changed since review'; end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/_/rabbitmq'
     or current_options->0->>'support_level' is distinct from 'community'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/Polemus/Unraid/main/RabbitMQ/RabbitMQ.xml' then
    raise exception 'rabbitmq install options changed since review';
  end if;
  select e.* into estimate_row from public.self_host_app_resource_estimates e where e.app_id=v_app_id for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":2048,"ram_estimate_max_mb":8192,
    "ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.",
    "storage_estimate_min_gb":1,"storage_estimate_max_gb":20,
    "storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."
  }'::jsonb) then raise exception 'rabbitmq resource estimates changed since review'; end if;

  update public.self_host_apps a set
    summary='Message broker for routing and streaming messages over AMQP and other protocols.',
    website_url='https://www.rabbitmq.com', source_code_url='https://github.com/rabbitmq/rabbitmq-server',
    docs_url='https://www.rabbitmq.com/docs', install_docs_url='https://www.rabbitmq.com/docs/download',
    license='MPL-2.0 core; some server OCF files Apache-2.0', license_spdx_id=null, license_type='mixed', source_model='open_source',
    publisher_name='Broadcom', publisher_type='company', publisher_url='https://www.broadcom.com', pricing_model='freemium',
    docker_support='community', docker_url='https://hub.docker.com/_/rabbitmq', docker_image='rabbitmq:management',
    compose_support=false, compose_url=null, requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['web','api','cli']::text[],
    data_source_urls=array[
      'https://www.rabbitmq.com',
      'https://www.rabbitmq.com/docs',
      'https://www.rabbitmq.com/docs/download',
      'https://www.rabbitmq.com/docs/configure',
      'https://github.com/rabbitmq/rabbitmq-server',
      'https://github.com/rabbitmq/rabbitmq-server/blob/main/LICENSE',
      'https://github.com/docker-library/rabbitmq',
      'https://hub.docker.com/_/rabbitmq',
      'https://raw.githubusercontent.com/Polemus/Unraid/main/RabbitMQ/RabbitMQ.xml'
    ],
    summary_source='https://github.com/rabbitmq/rabbitmq-server/blob/main/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"RabbitMQ documents the community-maintained rabbitmq:management Docker image.","source_urls":["https://www.rabbitmq.com/docs/download","https://hub.docker.com/_/rabbitmq"]},
      "compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The checked RabbitMQ installation guide documents Docker run but does not provide a Compose deployment.","source_urls":["https://www.rabbitmq.com/docs/download","https://github.com/docker-library/rabbitmq"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"high","note":"RabbitMQ stores broker metadata and messages in its own Mnesia and message stores; the documented setup does not use a separate database service.","source_urls":["https://www.rabbitmq.com/docs/configure","https://www.rabbitmq.com/docs/metadata-store"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"RabbitMQ stores node metadata and persistent messages in its Mnesia data directory.","source_urls":["https://www.rabbitmq.com/docs/configure","https://www.rabbitmq.com/docs/relocate"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for a small broker; connections, queues, messages, and plugins drive memory use.","source_urls":["https://www.rabbitmq.com/docs/3.13/memory-use"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers broker metadata and durable messages; queue volume and retention drive storage use.","source_urls":["https://www.rabbitmq.com/docs/configure","https://www.rabbitmq.com/docs/relocate"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"RabbitMQ labels its documented Docker image community-maintained.","source_urls":["https://www.rabbitmq.com/docs/download","https://github.com/docker-library/rabbitmq"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'rabbitmq app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024, ram_estimate_max_mb=4096, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small broker; connections, queues, message volume, and plugins drive memory use.',
    ram_source_urls=array['https://www.rabbitmq.com/docs/3.13/memory-use','https://github.com/rabbitmq/rabbitmq-server/blob/main/README.md'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=100, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Broker metadata and durable messages; queue volume and retention drive storage use.',
    storage_source_urls=array['https://www.rabbitmq.com/docs/configure','https://www.rabbitmq.com/docs/relocate'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'rabbitmq resource update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/_/rabbitmq","note":"Docker Official Image maintained by the Docker community.","image":"rabbitmq:management","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://www.rabbitmq.com/docs/download","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/Polemus/Unraid/main/RabbitMQ/RabbitMQ.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/Polemus/Unraid/main/RabbitMQ/RabbitMQ.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/rabbitmq'], docker_images=array['rabbitmq:management'], compose_urls='{}',
    unraid_urls=array['https://raw.githubusercontent.com/Polemus/Unraid/main/RabbitMQ/RabbitMQ.xml'],
    source_urls=array['https://www.rabbitmq.com/docs/download','https://hub.docker.com/_/rabbitmq','https://raw.githubusercontent.com/Polemus/Unraid/main/RabbitMQ/RabbitMQ.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'rabbitmq install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id) select v_app_id,c.id from public.self_host_app_categories c where c.slug in ('developer-tools','system-admin-hosting');
  get diagnostics affected=row_count; if affected<>2 then raise exception 'rabbitmq category update failed'; end if;
end
$migration$;

commit;
