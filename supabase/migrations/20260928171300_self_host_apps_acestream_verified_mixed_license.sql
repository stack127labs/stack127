begin;

do $migration$
declare
  v_app_id uuid;
  current_categories text[];
  current_options jsonb;
  v_estimate public.self_host_app_resource_estimates;
  v_rows integer;
  expected_options constant jsonb := '[
    {"url":"https://hub.docker.com/r/vstavrinov/acestream-engine","note":"Community-maintained image. Verify the publisher before pulling.","image":"vstavrinov/acestream-engine","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/vstavrinov/acestream-engine","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml","support_level":"community"}
  ]'::jsonb;
  new_options constant jsonb := '[
    {"url":"https://hub.docker.com/r/vstavrinov/acestream-engine","note":"Community-maintained image. Verify the publisher before pulling.","image":"vstavrinov/acestream-engine","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/vstavrinov/acestream-engine#readme","support_level":"community"},
    {"url":"https://docs.acestream.media/products/#linux","note":null,"image":null,"label":"Linux downloads","method":"package","sort_order":20,"source_url":"https://docs.acestream.media/products/#linux","support_level":"official"},
    {"url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml","support_level":"community"}
  ]'::jsonb;
  official_and_project_sources text[] := array[
    'https://acestream.org/about/android/org.acestream.core/license.html',
    'https://www.acestream.org/license',
    'https://docs.acestream.media/products/#ace-stream-engine',
    'https://docs.acestream.media/products/#linux',
    'https://github.com/acestream/acestream-engine-android',
    'https://github.com/acestream/acestream-engine-android/blob/master/LICENSE',
    'https://github.com/vstavrinov/acestream-engine',
    'https://github.com/vstavrinov/acestream-engine/blob/master/README.md',
    'https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile',
    'https://github.com/vstavrinov/acestream-engine/blob/master/LICENSE',
    'https://hub.docker.com/r/vstavrinov/acestream-engine',
    'https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml'
  ];
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug = 'acestream'
    and a.published is true
    and a.self_hosting_status = 'self_hostable'
    and to_jsonb(a) @> '{
      "name":"Acestream",
      "summary":"Acestream-engine for streaming media through the Ace Stream engine.",
      "website_url":null,
      "source_code_url":"https://github.com/vstavrinov/acestream-engine",
      "docs_url":"https://github.com/vstavrinov/acestream-engine",
      "install_docs_url":"https://github.com/vstavrinov/acestream-engine",
      "license":"No license file declared (all rights reserved by default)",
      "publisher_name":"vstavrinov",
      "publisher_type":"community",
      "publisher_url":"https://github.com/vstavrinov",
      "source_model":"source_available",
      "license_type":"copyleft",
      "license_spdx_id":"GPL-3.0",
      "docker_support":"community",
      "docker_url":"https://hub.docker.com/r/vstavrinov/acestream-engine",
      "docker_image":"vstavrinov/acestream-engine",
      "compose_support":false,
      "compose_url":null,
      "requires_database":null,
      "database_types":[],
      "persistent_storage":null,
      "storage_profile":"unknown",
      "deployment_methods":["docker","unraid"],
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'acestream app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[])
    into current_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id = l.category_id
  where l.app_id = v_app_id;
  if current_categories is distinct from array['identity-access','knowledge-notes','video-conferencing']::text[] then
    raise exception 'acestream categories changed since review';
  end if;

  select io.options into current_options
  from public.self_host_app_install_options io
  where io.app_id = v_app_id
  for update;
  if current_options is distinct from expected_options then raise exception 'acestream install options changed since review'; end if;

  select e.* into v_estimate
  from public.self_host_app_resource_estimates e
  where e.app_id = v_app_id
  for update;
  if not found or not (to_jsonb(v_estimate) @> '{
    "ram_estimate_min_mb":1024,
    "ram_estimate_max_mb":8192,
    "ram_estimate_basis":"Small single-node service; active users and stored content vary.",
    "storage_estimate_min_gb":1,
    "storage_estimate_max_gb":20,
    "storage_estimate_basis":"Small single-node service; active users and stored content vary."
  }'::jsonb) then
    raise exception 'acestream resource estimates changed since review';
  end if;

  update public.self_host_apps a set
    name = 'Ace Stream Engine',
    summary = 'Peer-to-peer media engine for streaming. It connects to other peers and temporarily caches stream data.',
    website_url = 'https://acestream.org',
    docs_url = 'https://docs.acestream.media/products/#ace-stream-engine',
    install_docs_url = 'https://github.com/vstavrinov/acestream-engine#readme',
    license = 'Mixed: GPL-3.0 container build; MIT engine app with closed-source libraries',
    license_spdx_id = null,
    license_type = 'mixed',
    publisher_name = 'Ace Stream DAO LLC',
    publisher_type = 'company',
    publisher_url = 'https://acestream.org',
    source_model = 'source_available',
    docker_support = 'community',
    docker_url = 'https://hub.docker.com/r/vstavrinov/acestream-engine',
    docker_image = 'vstavrinov/acestream-engine',
    compose_support = false,
    compose_url = null,
    requires_database = false,
    database_types = '{}',
    persistent_storage = false,
    storage_profile = 'depends',
    deployment_methods = array['docker','package','unraid']::text[],
    surfaces = array['api']::text[],
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(a.data_source_urls, '{}'::text[]) || official_and_project_sources) as source(source_url)
    ),
    summary_source = 'https://docs.acestream.media/products/#ace-stream-engine',
    summary_confidence = 'high',
    data_confidence = 'high',
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The Docker image is a community build that downloads the Linux engine package from Ace Stream.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/README.md","https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile","https://hub.docker.com/r/vstavrinov/acestream-engine"]},
      "compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The community image documents a Docker run command and has no Compose file.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/README.md"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The documented engine container uses a temporary cache and has no database setup.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile","https://www.acestream.org/license"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The community container keeps its engine cache in memory; the official agreement describes the stream cache as temporary.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile","https://www.acestream.org/license"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate accounts for the in-memory stream cache; concurrent streams and cache settings affect use.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile","https://www.acestream.org/license"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers the engine image and temporary files; stream cache is configured in memory and is cleared by the app.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile","https://www.acestream.org/license"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README documents the community Docker Hub image.","source_urls":["https://github.com/vstavrinov/acestream-engine/blob/master/README.md","https://hub.docker.com/r/vstavrinov/acestream-engine"]}
    }'::jsonb,
    technical_facts_checked_at = now(),
    updated_at = now()
  where a.id = v_app_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'acestream app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb = 1024,
    ram_estimate_max_mb = 4096,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = 'low',
    ram_estimate_basis = 'P2P stream cache uses memory; stream count and cache settings drive use.',
    ram_source_urls = array['https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile','https://www.acestream.org/license'],
    storage_estimate_min_gb = 1,
    storage_estimate_max_gb = 5,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = 'low',
    storage_estimate_basis = 'Engine files and temporary cache; the container keeps stream cache in memory.',
    storage_source_urls = array['https://github.com/vstavrinov/acestream-engine/blob/master/Dockerfile','https://www.acestream.org/license'],
    checked_at = now(),
    updated_at = now()
  where e.app_id = v_app_id;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'acestream resource update failed'; end if;

  update public.self_host_app_install_options io set
    options = new_options,
    docker_urls = array['https://hub.docker.com/r/vstavrinov/acestream-engine'],
    docker_images = array['vstavrinov/acestream-engine'],
    compose_urls = '{}',
    package_urls = array['https://docs.acestream.media/products/#linux'],
    unraid_urls = array['https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml'],
    source_urls = array['https://docs.acestream.media/products/#linux','https://github.com/vstavrinov/acestream-engine#readme','https://raw.githubusercontent.com/qubex22/unraid-templates/main/acestream/acestream.xml'],
    checked_at = now(),
    updated_at = now()
  where io.app_id = v_app_id and io.options = expected_options;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'acestream install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id = v_app_id;
  insert into public.self_host_app_category_links(app_id, category_id)
  select v_app_id, c.id
  from public.self_host_app_categories c
  where c.slug = 'media-servers';
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then raise exception 'acestream category update failed'; end if;
end
$migration$;

commit;
