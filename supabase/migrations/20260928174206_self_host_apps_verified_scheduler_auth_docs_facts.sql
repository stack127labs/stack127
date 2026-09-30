begin;

do $migration$
declare
  app_row public.self_host_apps;
  current_categories text[];
  current_options jsonb;
  estimate_row public.self_host_app_resource_estimates;
  affected integer;
  expected_options jsonb;
  new_options jsonb;
  app_slug text;
begin
  -- Ofelia
  app_slug := 'ofelia';
  select a.* into app_row
  from public.self_host_apps a
  where a.slug = app_slug and a.published is true and a.self_hosting_status = 'self_hostable'
    and to_jsonb(a) @> '{
      "summary":"Runs scheduled commands on a host or in Docker containers, with jobs configured through files or container labels.",
      "source_code_url":"https://github.com/mcuadros/ofelia",
      "docs_url":"https://github.com/mcuadros/ofelia/issues",
      "install_docs_url":"https://github.com/mcuadros/ofelia/issues",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"MIT",
      "source_model":"source_available",
      "docker_support":"community",
      "docker_url":"https://hub.docker.com/r/mcuadros/ofelia",
      "docker_image":"mcuadros/ofelia:latest",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if not found then raise exception 'ofelia app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=app_row.id;
  if current_categories is distinct from array['automation','system-admin-hosting']::text[] then
    raise exception 'ofelia categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=app_row.id for update;
  expected_options := '[
    {"url":"https://hub.docker.com/r/mcuadros/ofelia","note":"Community-maintained image. Verify the publisher before pulling.","image":"mcuadros/ofelia:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/mcuadros/ofelia","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml","support_level":"community"}
  ]'::jsonb;
  if current_options is distinct from expected_options then raise exception 'ofelia install options changed since review'; end if;
  select e.* into estimate_row from public.self_host_app_resource_estimates e where e.app_id=app_row.id for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":256,"ram_estimate_max_mb":2048,
    "ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.",
    "storage_estimate_min_gb":1,"storage_estimate_max_gb":20,
    "storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."
  }'::jsonb) then raise exception 'ofelia resource estimates changed since review'; end if;

  update public.self_host_apps a set
    summary='Docker job scheduler that runs commands in existing containers, new containers, or the host on a schedule.',
    website_url='https://github.com/mcuadros/ofelia',
    docs_url='https://github.com/mcuadros/ofelia#readme',
    install_docs_url='https://github.com/mcuadros/ofelia#installation',
    license='MIT License', license_spdx_id='MIT', license_type='permissive', source_model='open_source',
    pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/r/mcuadros/ofelia', docker_image='mcuadros/ofelia:latest',
    compose_support=true, compose_url='https://github.com/mcuadros/ofelia#docker-labels-configurations',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','binary','unraid']::text[], surfaces=array['cli']::text[],
    data_source_urls=array[
      'https://github.com/mcuadros/ofelia',
      'https://github.com/mcuadros/ofelia/blob/master/README.md',
      'https://github.com/mcuadros/ofelia/blob/master/LICENSE',
      'https://hub.docker.com/r/mcuadros/ofelia',
      'https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml'
    ],
    summary_source='https://github.com/mcuadros/ofelia/blob/master/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README documents its mcuadros/ofelia image.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md","https://hub.docker.com/r/mcuadros/ofelia"]},
      "compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README includes Docker Compose deployment examples.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The scheduler uses job files or Docker labels; its published setup does not include a database service.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project supports saving job reports to a configured directory.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for a low-footprint Go scheduler; job count and concurrent runs affect use.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers configuration and optional saved execution reports.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README names the mcuadros/ofelia image.","source_urls":["https://github.com/mcuadros/ofelia/blob/master/README.md","https://hub.docker.com/r/mcuadros/ofelia"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=app_row.id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'ofelia app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=128, ram_estimate_max_mb=512, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Low-footprint Go scheduler; job count and concurrent runs drive memory use.',
    ram_source_urls=array['https://github.com/mcuadros/ofelia/blob/master/README.md'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=5, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Configuration and optional saved execution reports; report volume drives growth.',
    storage_source_urls=array['https://github.com/mcuadros/ofelia/blob/master/README.md'], checked_at=now(), updated_at=now()
  where e.app_id=app_row.id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'ofelia resource update failed'; end if;

  new_options := '[
    {"url":"https://hub.docker.com/r/mcuadros/ofelia","note":null,"image":"mcuadros/ofelia:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/mcuadros/ofelia/blob/master/README.md","support_level":"official"},
    {"url":"https://github.com/mcuadros/ofelia#docker-labels-configurations","note":"The README includes Docker Compose examples.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/mcuadros/ofelia/blob/master/README.md","support_level":"official"},
    {"url":"https://github.com/mcuadros/ofelia/releases","note":null,"image":null,"label":"Binary releases","method":"binary","sort_order":25,"source_url":"https://github.com/mcuadros/ofelia/blob/master/README.md","support_level":"official"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml","support_level":"community"}
  ]'::jsonb;
  update public.self_host_app_install_options io set
    options=new_options,
    docker_urls=array['https://hub.docker.com/r/mcuadros/ofelia'], docker_images=array['mcuadros/ofelia:latest'],
    compose_urls=array['https://github.com/mcuadros/ofelia#docker-labels-configurations'],
    binary_urls=array['https://github.com/mcuadros/ofelia/releases'],
    unraid_urls=array['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml'],
    source_urls=array['https://github.com/mcuadros/ofelia/blob/master/README.md','https://github.com/mcuadros/ofelia/releases','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/ofelia.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=app_row.id and io.options=expected_options;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'ofelia install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=app_row.id;
  insert into public.self_host_app_category_links(app_id,category_id) select app_row.id,c.id from public.self_host_app_categories c where c.slug in ('automation','system-admin-hosting');
  get diagnostics affected=row_count; if affected<>2 then raise exception 'ofelia category update failed'; end if;

  -- Vouch Proxy
  app_slug := 'vouch-proxy';
  select a.* into app_row
  from public.self_host_apps a
  where a.slug=app_slug and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "summary":"Single sign-on proxy for protecting websites behind Nginx authentication requests.",
      "source_code_url":"https://github.com/vouch/vouch-proxy",
      "docs_url":"https://github.com/vouch/vouch-proxy/issues",
      "install_docs_url":"https://github.com/vouch/vouch-proxy/issues",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"MIT",
      "source_model":"source_available",
      "docker_support":"community",
      "docker_url":"https://registry.hub.docker.com/r/quay.io/vouch/vouch-proxy",
      "docker_image":"quay.io/vouch/vouch-proxy:latest",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if not found then raise exception 'vouch-proxy app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=app_row.id;
  if current_categories is distinct from array['identity-access','networking-dns']::text[] then raise exception 'vouch-proxy categories changed since review'; end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=app_row.id for update;
  expected_options := '[
    {"url":"https://quay.io/repository/vouch/vouch-proxy","note":"Community-maintained image. Verify the publisher before pulling.","image":"quay.io/vouch/vouch-proxy:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://registry.hub.docker.com/r/quay.io/vouch/vouch-proxy","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml","support_level":"community"}
  ]'::jsonb;
  if current_options is distinct from expected_options then raise exception 'vouch-proxy install options changed since review'; end if;
  select e.* into estimate_row from public.self_host_app_resource_estimates e where e.app_id=app_row.id for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":256,"ram_estimate_max_mb":2048,
    "ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.",
    "storage_estimate_min_gb":1,"storage_estimate_max_gb":20,
    "storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."
  }'::jsonb) then raise exception 'vouch-proxy resource estimates changed since review'; end if;

  update public.self_host_apps a set
    name='Vouch Proxy',
    summary='Single sign-on proxy that uses OAuth or OpenID Connect with Nginx to protect websites.',
    website_url='https://github.com/vouch/vouch-proxy',
    docs_url='https://github.com/vouch/vouch-proxy#readme',
    install_docs_url='https://github.com/vouch/vouch-proxy#running-from-docker',
    license='MIT License', license_spdx_id='MIT', license_type='permissive', source_model='open_source', pricing_model='free',
    docker_support='official', docker_url='https://quay.io/repository/vouch/vouch-proxy', docker_image='quay.io/vouch/vouch-proxy:latest',
    compose_support=false, compose_url=null, requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','helm','native','unraid']::text[], surfaces=array['web','api']::text[],
    data_source_urls=array[
      'https://github.com/vouch/vouch-proxy',
      'https://github.com/vouch/vouch-proxy/blob/master/README.md',
      'https://github.com/vouch/vouch-proxy/blob/master/LICENSE',
      'https://quay.io/repository/vouch/vouch-proxy',
      'https://github.com/vouch/helm-charts',
      'https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml'
    ],
    summary_source='https://github.com/vouch/vouch-proxy/blob/master/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The README documents the official quay.io/vouch/vouch-proxy image.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md","https://quay.io/repository/vouch/vouch-proxy"]},
      "compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The documented container and native setup do not include a Compose deployment.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The documented proxy stores login state in cookies and configuration files; no database service is used in its documented setup.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Docker setup mounts the configuration directory, including config and secret files.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for a small Go authentication proxy; request volume and configured claims affect use.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers the container, configuration, secrets, and modest logs.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README names the official quay.io image and its release tags.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md","https://quay.io/repository/vouch/vouch-proxy"]},
      "helm":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The README links Helm charts maintained by community contributors.","source_urls":["https://github.com/vouch/vouch-proxy/blob/master/README.md","https://github.com/vouch/helm-charts"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=app_row.id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'vouch-proxy app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=128, ram_estimate_max_mb=512, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small Go authentication proxy; request volume and configured claims drive memory use.',
    ram_source_urls=array['https://github.com/vouch/vouch-proxy/blob/master/README.md'],
    storage_estimate_min_gb=0.5, storage_estimate_max_gb=2, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Container, configuration, secret files, and modest logs.',
    storage_source_urls=array['https://github.com/vouch/vouch-proxy/blob/master/README.md'], checked_at=now(), updated_at=now()
  where e.app_id=app_row.id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'vouch-proxy resource update failed'; end if;

  new_options := '[
    {"url":"https://quay.io/repository/vouch/vouch-proxy","note":null,"image":"quay.io/vouch/vouch-proxy:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/vouch/vouch-proxy/blob/master/README.md","support_level":"official"},
    {"url":"https://github.com/vouch/helm-charts","note":"Charts are maintained by community contributors named in the project README.","image":null,"label":"Helm charts","method":"helm","sort_order":25,"source_url":"https://github.com/vouch/vouch-proxy/blob/master/README.md","support_level":"community"},
    {"url":"https://github.com/vouch/vouch-proxy#compiling-from-source-and-running-the-binary","note":null,"image":null,"label":"Build and run from source","method":"native","sort_order":30,"source_url":"https://github.com/vouch/vouch-proxy/blob/master/README.md","support_level":"official"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml","support_level":"community"}
  ]'::jsonb;
  update public.self_host_app_install_options io set
    options=new_options,
    docker_urls=array['https://quay.io/repository/vouch/vouch-proxy'], docker_images=array['quay.io/vouch/vouch-proxy:latest'],
    helm_urls=array['https://github.com/vouch/helm-charts'], native_urls=array['https://github.com/vouch/vouch-proxy#compiling-from-source-and-running-the-binary'],
    unraid_urls=array['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml'],
    source_urls=array['https://github.com/vouch/vouch-proxy/blob/master/README.md','https://quay.io/repository/vouch/vouch-proxy','https://github.com/vouch/helm-charts','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/vouch_proxy.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=app_row.id and io.options=expected_options;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'vouch-proxy install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=app_row.id;
  insert into public.self_host_app_category_links(app_id,category_id) select app_row.id,c.id from public.self_host_app_categories c where c.slug in ('identity-access','networking-dns');
  get diagnostics affected=row_count; if affected<>2 then raise exception 'vouch-proxy category update failed'; end if;

  -- explainshell
  app_slug := 'explainshell';
  select a.* into app_row
  from public.self_host_apps a
  where a.slug=app_slug and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "summary":"Web tool that explains shell commands using their scripts and manual-page references.",
      "website_url":null,
      "source_code_url":"https://github.com/idank/explainshell",
      "docs_url":"https://forums.unraid.net/topic/92947-support-spaceinvaderone-explainshell/",
      "install_docs_url":"https://forums.unraid.net/topic/92947-support-spaceinvaderone-explainshell/",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"GPL-3.0",
      "source_model":"source_available",
      "requires_database":null,
      "persistent_storage":null,
      "deployment_methods":["docker","unraid"]
    }'::jsonb
  for update;
  if not found then raise exception 'explainshell app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=app_row.id;
  if current_categories is distinct from array['ai-ml','search','system-admin-hosting']::text[] then raise exception 'explainshell categories changed since review'; end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=app_row.id for update;
  expected_options := '[
    {"url":"https://hub.docker.com/r/spaceinvaderone/explainshell","note":"Community-maintained image. Verify the publisher before pulling.","image":"spaceinvaderone/explainshell","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/spaceinvaderone/explainshell","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml","support_level":"community"}
  ]'::jsonb;
  if current_options is distinct from expected_options then raise exception 'explainshell install options changed since review'; end if;
  select e.* into estimate_row from public.self_host_app_resource_estimates e where e.app_id=app_row.id for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":2048,"ram_estimate_max_mb":8192,
    "ram_estimate_basis":"Small single-node service; data volume and request load vary.",
    "storage_estimate_min_gb":5,"storage_estimate_max_gb":100,
    "storage_estimate_basis":"Small single-node service; data volume and request load vary."
  }'::jsonb) then raise exception 'explainshell resource estimates changed since review'; end if;

  update public.self_host_apps a set
    name='explainshell',
    summary='Explains shell commands by matching each argument to help text from the command’s man page.',
    website_url='https://explainshell.com',
    docs_url='https://github.com/idank/explainshell#readme',
    install_docs_url='https://github.com/idank/explainshell#running-explainshell-locally',
    license='GPL-3.0 code; man-page data has separate licenses', license_spdx_id='GPL-3.0', license_type='copyleft', source_model='open_source', pricing_model='free',
    requires_database=true, database_types=array['sqlite']::text[], persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','native','unraid']::text[], surfaces=array['web','cli']::text[],
    data_source_urls=array[
      'https://explainshell.com',
      'https://github.com/idank/explainshell',
      'https://github.com/idank/explainshell/blob/master/README.md',
      'https://github.com/idank/explainshell/blob/master/LICENSE',
      'https://hub.docker.com/r/spaceinvaderone/explainshell',
      'https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml'
    ],
    summary_source='https://github.com/idank/explainshell/blob/master/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project stores processed manpages in SQLite.","source_urls":["https://github.com/idank/explainshell/blob/master/README.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Processed manpages and mappings are saved in the SQLite database.","source_urls":["https://github.com/idank/explainshell/blob/master/README.md"]},
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The community image is listed in an Unraid template.","source_urls":["https://hub.docker.com/r/spaceinvaderone/explainshell","https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml"]},
      "compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The upstream setup documents native installation and does not include a Compose deployment.","source_urls":["https://github.com/idank/explainshell/blob/master/README.md"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for the Python web service with a local manpage database; request volume and loaded data affect use.","source_urls":["https://github.com/idank/explainshell/blob/master/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers the SQLite manpage database and optional local manpage archive.","source_urls":["https://github.com/idank/explainshell/blob/master/README.md"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The image is distributed by a community publisher and linked in the Unraid template.","source_urls":["https://hub.docker.com/r/spaceinvaderone/explainshell","https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=app_row.id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'explainshell app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Python web service with a local manpage database; request volume and loaded data drive memory use.',
    ram_source_urls=array['https://github.com/idank/explainshell/blob/master/README.md'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=20, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='SQLite manpage database and optional local manpage archive; corpus size drives storage.',
    storage_source_urls=array['https://github.com/idank/explainshell/blob/master/README.md'], checked_at=now(), updated_at=now()
  where e.app_id=app_row.id;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'explainshell resource update failed'; end if;

  new_options := '[
    {"url":"https://hub.docker.com/r/spaceinvaderone/explainshell","note":"Community-maintained image.","image":"spaceinvaderone/explainshell","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml","support_level":"community"},
    {"url":"https://github.com/idank/explainshell#running-explainshell-locally","note":null,"image":null,"label":"Run from source","method":"native","sort_order":30,"source_url":"https://github.com/idank/explainshell/blob/master/README.md","support_level":"official"},
    {"url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml","support_level":"community"}
  ]'::jsonb;
  update public.self_host_app_install_options io set
    options=new_options,
    docker_urls=array['https://hub.docker.com/r/spaceinvaderone/explainshell'], docker_images=array['spaceinvaderone/explainshell'],
    native_urls=array['https://github.com/idank/explainshell#running-explainshell-locally'],
    unraid_urls=array['https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml'],
    source_urls=array['https://github.com/idank/explainshell/blob/master/README.md','https://hub.docker.com/r/spaceinvaderone/explainshell','https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/explainshell.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=app_row.id and io.options=expected_options;
  get diagnostics affected=row_count; if affected<>1 then raise exception 'explainshell install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=app_row.id;
  insert into public.self_host_app_category_links(app_id,category_id) select app_row.id,c.id from public.self_host_app_categories c where c.slug in ('developer-tools','search');
  get diagnostics affected=row_count; if affected<>2 then raise exception 'explainshell category update failed'; end if;
end
$migration$;

commit;
