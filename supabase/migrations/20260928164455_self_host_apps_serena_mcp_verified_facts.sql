begin;

do $migration$
declare
  v_app_id uuid;
  v_categories text[];
  v_options jsonb;
  v_estimate jsonb;
  v_affected integer;
  expected_options constant jsonb := '[
    {"url":"https://github.com/oraios/serena/pkgs/container/serena","note":"Community-maintained image. Verify the publisher before pulling.","image":"ghcr.io/oraios/serena","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/oraios/serena/pkgs/container/serena","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/PikkonMG/unraid-docker-templates/main/templates/serena_mcp.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/PikkonMG/unraid-docker-templates/main/templates/serena_mcp.xml","support_level":"community"}
  ]'::jsonb;
  reviewed_options constant jsonb := '[
    {"url":"https://github.com/oraios/serena/pkgs/container/serena","note":null,"image":"ghcr.io/oraios/serena:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://oraios.github.io/serena/02-usage/020_running.html","support_level":"official"},
    {"url":"https://github.com/oraios/serena/blob/main/compose.yaml","note":null,"image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://oraios.github.io/serena/02-usage/020_running.html","support_level":"official"},
    {"url":"https://oraios.github.io/serena/02-usage/010_installation.html","note":null,"image":null,"label":"Native install","method":"native","sort_order":30,"source_url":"https://oraios.github.io/serena/02-usage/010_installation.html","support_level":"official"},
    {"url":"https://raw.githubusercontent.com/PikkonMG/unraid-docker-templates/main/templates/serena_mcp.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/PikkonMG/unraid-docker-templates/main/templates/serena_mcp.xml","support_level":"community"}
  ]'::jsonb;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug = 'serena-mcp'
    and a.published is true
    and a.self_hosting_status = 'self_hostable'
    and a.summary = 'MCP toolkit that gives coding agents tools for working with software projects.'
    and a.website_url is null
    and a.docs_url = 'https://github.com/oraios/serena/blob/main/DOCKER.md'
    and a.install_docs_url = 'https://github.com/oraios/serena/blob/main/DOCKER.md'
    and a.license = 'No license file declared (all rights reserved by default)'
    and a.license_spdx_id = 'MIT'
    and a.license_type = 'permissive'
    and a.source_model = 'source_available'
    and a.publisher_name = 'oraios'
    and a.publisher_type = 'community'
    and a.pricing_model = 'unknown'
    and a.docker_support = 'community'
    and a.docker_url = 'https://github.com/oraios/serena/pkgs/container/serena'
    and a.docker_image = 'ghcr.io/oraios/serena'
    and a.compose_support is false
    and a.compose_url is null
    and a.requires_database is null
    and a.persistent_storage is null
    and a.storage_profile = 'unknown'
    and a.deployment_methods = array['docker','unraid']::text[]
    and a.surfaces = array['web']::text[]
  for update;

  if v_app_id is null then
    raise exception 'serena-mcp app record changed since review';
  end if;

  select array_agg(c.slug order by c.slug) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id = l.category_id
  where l.app_id = v_app_id;

  if v_categories is distinct from array['ai-ml','monitoring-status','video-conferencing']::text[] then
    raise exception 'serena-mcp categories changed since review';
  end if;

  select io.options into v_options
  from public.self_host_app_install_options io
  where io.app_id = v_app_id
  for update;

  if v_options is distinct from expected_options then
    raise exception 'serena-mcp install options changed since review';
  end if;

  select to_jsonb(e) into v_estimate
  from public.self_host_app_resource_estimates e
  where e.app_id = v_app_id
  for update;

  if v_estimate ->> 'ram_estimate_min_mb' is distinct from '2048'
     or v_estimate ->> 'ram_estimate_max_mb' is distinct from '8192'
     or v_estimate ->> 'ram_estimate_basis' is distinct from 'Small single-node service; active users and stored content vary.'
     or v_estimate ->> 'storage_estimate_min_gb' is distinct from '5'
     or v_estimate ->> 'storage_estimate_max_gb' is distinct from '100'
     or v_estimate ->> 'storage_estimate_basis' is distinct from 'Small single-node service; active users and stored content vary.' then
    raise exception 'serena-mcp resource estimates changed since review';
  end if;

  update public.self_host_apps a set
    summary = 'MCP server that gives coding agents semantic tools to search, understand, edit, refactor, and debug software projects.',
    website_url = 'https://oraios.github.io/serena/',
    docs_url = 'https://oraios.github.io/serena/02-usage/000_intro.html',
    install_docs_url = 'https://oraios.github.io/serena/02-usage/020_running.html',
    license = 'GNU General Public License v3.0 or later',
    license_spdx_id = 'GPL-3.0-or-later',
    license_type = 'copyleft',
    source_model = 'open_source',
    publisher_name = 'Oraios AI',
    publisher_type = 'company',
    publisher_url = 'https://github.com/oraios',
    pricing_model = 'freemium',
    source_code_host = 'github',
    docker_support = 'official',
    docker_url = 'https://github.com/oraios/serena/pkgs/container/serena',
    docker_image = 'ghcr.io/oraios/serena:latest',
    compose_support = true,
    compose_url = 'https://github.com/oraios/serena/blob/main/compose.yaml',
    requires_database = false,
    database_types = '{}'::text[],
    persistent_storage = true,
    storage_profile = 'depends',
    deployment_methods = array['docker','compose','native','unraid']::text[],
    surfaces = array['api','cli','web']::text[],
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(a.data_source_urls, '{}'::text[]) || array[
        'https://github.com/oraios/serena',
        'https://github.com/oraios/serena/blob/main/LICENSE',
        'https://github.com/oraios/serena/blob/main/README.md',
        'https://github.com/oraios/serena/blob/main/compose.yaml',
        'https://github.com/oraios/serena/pkgs/container/serena',
        'https://oraios.github.io/serena/02-usage/000_intro.html',
        'https://oraios.github.io/serena/02-usage/010_installation.html',
        'https://oraios.github.io/serena/02-usage/020_running.html',
        'https://oraios.github.io/serena/02-usage/050_configuration.html',
        'https://oraios.github.io/serena/01-about/060_license.html'
      ]::text[]) as source(source_url)
    ),
    summary_source = 'https://github.com/oraios/serena/blob/main/README.md',
    summary_confidence = 'high',
    data_confidence = 'high',
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status','published','checked_at','2026-09-28','confidence','high','note','Official running instructions document the published Docker image.','source_urls',to_jsonb(array['https://oraios.github.io/serena/02-usage/020_running.html','https://github.com/oraios/serena/pkgs/container/serena']::text[])),
      'compose', jsonb_build_object('status','published','checked_at','2026-09-28','confidence','high','note','Official running instructions support Compose and the repository provides compose.yaml.','source_urls',to_jsonb(array['https://oraios.github.io/serena/02-usage/020_running.html','https://github.com/oraios/serena/blob/main/compose.yaml']::text[])),
      'database', jsonb_build_object('status','published','checked_at','2026-09-28','confidence','medium','note','The official Compose setup runs Serena without a separate database; configuration and project state use files.','source_urls',to_jsonb(array['https://github.com/oraios/serena/blob/main/compose.yaml','https://oraios.github.io/serena/02-usage/050_configuration.html']::text[])),
      'persistent_storage', jsonb_build_object('status','published','checked_at','2026-09-28','confidence','high','note','Serena stores user settings and per-project memories and caches in files.','source_urls',to_jsonb(array['https://oraios.github.io/serena/02-usage/050_configuration.html']::text[])),
      'ram', jsonb_build_object('status','not_published','checked_at','2026-09-28','confidence','low','note','The planning range is an estimate for the MCP server and one language-server workload.','source_urls',to_jsonb(array['https://oraios.github.io/serena/02-usage/020_running.html','https://oraios.github.io/serena/01-about/020_programming-languages.html']::text[])),
      'storage', jsonb_build_object('status','not_published','checked_at','2026-09-28','confidence','low','note','The estimate covers the container, Serena files, and language-server caches; mounted project files are user-managed.','source_urls',to_jsonb(array['https://oraios.github.io/serena/02-usage/020_running.html','https://oraios.github.io/serena/02-usage/050_configuration.html']::text[])),
      'docker_image', jsonb_build_object('status','published','checked_at','2026-09-28','confidence','high','note','The official GitHub Container Registry package publishes ghcr.io/oraios/serena.','source_urls',to_jsonb(array['https://github.com/oraios/serena/pkgs/container/serena']::text[]))
    ),
    technical_facts_checked_at = now(),
    data_checked_at = now(),
    updated_at = now()
  where a.id = v_app_id;
  get diagnostics v_affected = row_count;
  if v_affected <> 1 then raise exception 'serena-mcp app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb = 512,
    ram_estimate_max_mb = 4096,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = 'low',
    ram_estimate_basis = 'MCP server with one language-server workload; larger codebases use more memory.',
    ram_source_urls = array['https://oraios.github.io/serena/02-usage/020_running.html','https://oraios.github.io/serena/01-about/020_programming-languages.html']::text[],
    storage_estimate_min_gb = 1,
    storage_estimate_max_gb = 10,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = 'low',
    storage_estimate_basis = 'Container, settings, language-server files, and caches; project files are mounted separately.',
    storage_source_urls = array['https://oraios.github.io/serena/02-usage/020_running.html','https://oraios.github.io/serena/02-usage/050_configuration.html']::text[],
    checked_at = now(),
    updated_at = now()
  where e.app_id = v_app_id;
  get diagnostics v_affected = row_count;
  if v_affected <> 1 then raise exception 'serena-mcp resource update failed'; end if;

  update public.self_host_app_install_options io set
    options = reviewed_options,
    docker_urls = array['https://github.com/oraios/serena/pkgs/container/serena']::text[],
    docker_images = array['ghcr.io/oraios/serena:latest']::text[],
    compose_urls = array['https://github.com/oraios/serena/blob/main/compose.yaml']::text[],
    native_urls = array['https://oraios.github.io/serena/02-usage/010_installation.html']::text[],
    unraid_urls = array['https://raw.githubusercontent.com/PikkonMG/unraid-docker-templates/main/templates/serena_mcp.xml']::text[],
    source_urls = array[
      'https://github.com/oraios/serena/pkgs/container/serena',
      'https://github.com/oraios/serena/blob/main/compose.yaml',
      'https://oraios.github.io/serena/02-usage/010_installation.html',
      'https://oraios.github.io/serena/02-usage/020_running.html',
      'https://raw.githubusercontent.com/PikkonMG/unraid-docker-templates/main/templates/serena_mcp.xml'
    ]::text[],
    checked_at = now(),
    updated_at = now()
  where io.app_id = v_app_id
    and io.options = expected_options;
  get diagnostics v_affected = row_count;
  if v_affected <> 1 then raise exception 'serena-mcp install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id = v_app_id;
  insert into public.self_host_app_category_links(app_id, category_id)
  select v_app_id, c.id
  from public.self_host_app_categories c
  where c.slug = 'developer-tools';
  get diagnostics v_affected = row_count;
  if v_affected <> 1 then raise exception 'serena-mcp category update failed'; end if;
end
$migration$;

commit;
