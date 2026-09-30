begin;

do $migration$
declare
  v_app_id uuid;
  v_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='3proxy' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='3proxy'
    and a.summary='3proxy is a and lightweight HTTP/SOCKS proxy server.'
    and a.website_url='https://github.com/3proxy/3proxy'
    and a.source_code_url='https://github.com/3proxy/3proxy'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id is null and a.source_model='source_available'
    and a.docker_support='none' and a.docker_image is null and a.compose_support is false
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception '3proxy record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['networking-dns','system-admin-hosting']::text[] then
    raise exception '3proxy categories changed since review';
  end if;

  select io.options into v_options
  from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if v_options is distinct from '[
    {"url":"https://apps.truenas.com/catalog/three-proxy_community/","note":"Listed in the TrueNAS SCALE app catalog; catalog listing does not imply publisher support.","image":null,"label":"TrueNAS SCALE catalog","method":"truenas_scale","sort_order":30,"source_url":"https://apps.truenas.com/catalog/three-proxy_community/","support_level":"community"}
  ]'::jsonb then raise exception '3proxy install options changed since review'; end if;

  update public.self_host_apps a set
    name='3proxy',summary='3proxy runs HTTP, SOCKS, and other network proxy services.',
    website_url='https://3proxy.org/',
    source_code_url='https://github.com/3proxy/3proxy',source_code_host='github',
    github_owner='3proxy',github_repo='3proxy',github_full_name='3proxy/3proxy',source_full_name='3proxy/3proxy',
    docs_url='https://github.com/3proxy/3proxy/wiki',install_docs_url='https://github.com/3proxy/3proxy#docker-images',
    docker_url='https://hub.docker.com/r/3proxy/3proxy',
    license='3proxy Public License Agreement (BSD-style)',license_type='permissive',license_spdx_id=null,source_model='open_source',
    publisher_name='Vladimir Dubrovin (3APA3A)',publisher_type='individual',publisher_url='https://3proxy.org/',
    pricing_model='free',docker_support='official',docker_image='3proxy/3proxy:latest',compose_support=null,compose_url=null,
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='low',
    ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    surfaces=array['cli','web']::text[],deployment_methods=array['binary','docker','native','package','truenas_scale']::text[],
    summary_source='https://github.com/3proxy/3proxy',summary_confidence='high',
    release_url='https://github.com/3proxy/3proxy/releases',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes a BSD-style 3proxy Public License Agreement and describes 3proxy as open source.","source_urls":["https://github.com/3proxy/3proxy/blob/master/copying","https://3proxy.org/"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed RAM range is an estimate for a small proxy; connection volume, enabled services, and plugins affect use.","source_urls":["https://github.com/3proxy/3proxy","https://hub.docker.com/r/3proxy/3proxy"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed storage range is an estimate for configuration and optional log files.","source_urls":["https://github.com/3proxy/3proxy#docker-images","https://github.com/3proxy/3proxy#building-and-installation"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The 3proxy project documents its official 3proxy/3proxy Docker image.","source_urls":["https://github.com/3proxy/3proxy#docker-images","https://hub.docker.com/r/3proxy/3proxy"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes full, busybox, and minimal variants under 3proxy/3proxy.","source_urls":["https://hub.docker.com/r/3proxy/3proxy"]},
      "compose":{"status":"unchecked","checked_at":"2026-09-29","confidence":"low","note":"The reviewed official install guide documents Docker commands but no Compose destination was confirmed.","source_urls":["https://github.com/3proxy/3proxy#docker-images"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official configuration and install guides use configuration and log files without a separate database service.","source_urls":["https://github.com/3proxy/3proxy#docker-images","https://github.com/3proxy/3proxy#building-and-installation"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The default Docker setup mounts a configuration file; optional log files can be written to a persistent path.","source_urls":["https://github.com/3proxy/3proxy#docker-images","https://github.com/3proxy/3proxy#building-and-installation"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"3proxy includes command-line proxy services and web administration and statistics.","source_urls":["https://github.com/3proxy/3proxy"]}
    }'::jsonb),
    data_source_urls=array[
      'https://3proxy.org/','https://3proxy.org/repo/','https://github.com/3proxy/3proxy',
      'https://github.com/3proxy/3proxy/blob/master/copying','https://github.com/3proxy/3proxy/wiki',
      'https://github.com/3proxy/3proxy/releases','https://hub.docker.com/r/3proxy/3proxy',
      'https://apps.truenas.com/catalog/three-proxy_community/'
    ]::text[],
    data_checked_at=now(),data_confidence='high',technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception '3proxy app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=64,ram_estimate_max_mb=256,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='A small proxy can use little memory; active connections, enabled services, and plugins increase use.',
    ram_source_urls=array['https://github.com/3proxy/3proxy','https://hub.docker.com/r/3proxy/3proxy'],
    storage_estimate_min_gb=1,storage_estimate_max_gb=10,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The proxy needs a configuration file; optional log files can grow with traffic and retention.',
    storage_source_urls=array['https://github.com/3proxy/3proxy#docker-images','https://github.com/3proxy/3proxy#building-and-installation'],
    checked_at=now(),updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception '3proxy estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/3proxy/3proxy","note":"Official image. The latest tag is the current stable release; the project also publishes LTS and minimal variants.","image":"3proxy/3proxy:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/3proxy/3proxy#docker-images","support_level":"official"},
      {"url":"https://github.com/3proxy/3proxy/releases","note":"Official Windows and Linux release binaries.","image":null,"label":"Release binaries","method":"binary","sort_order":20,"source_url":"https://github.com/3proxy/3proxy#binaries-deb--rpm--windows-zip","support_level":"official"},
      {"url":"https://3proxy.org/repo/","note":"Official signed package repositories for Debian, Ubuntu, AlmaLinux, RHEL, Rocky, and CentOS Stream.","image":null,"label":"Linux packages","method":"package","sort_order":25,"source_url":"https://github.com/3proxy/3proxy#package-repository-apt--dnf","support_level":"official"},
      {"url":"https://github.com/3proxy/3proxy#building-and-installation","note":"Official build and install instructions for Linux, macOS, and BSD systems.","image":null,"label":"Build from source","method":"native","sort_order":26,"source_url":"https://github.com/3proxy/3proxy#building-and-installation","support_level":"official"},
      {"url":"https://apps.truenas.com/catalog/three-proxy_community/","note":"Listed in the TrueNAS SCALE Community catalog; this is not publisher support.","image":null,"label":"TrueNAS SCALE catalog","method":"truenas_scale","sort_order":30,"source_url":"https://apps.truenas.com/catalog/three-proxy_community/","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/3proxy/3proxy'],docker_images=array['3proxy/3proxy:latest'],
    binary_urls=array['https://github.com/3proxy/3proxy/releases'],
    package_urls=array['https://3proxy.org/repo/'],
    native_urls=array['https://github.com/3proxy/3proxy#building-and-installation'],
    truenas_scale_urls=array['https://apps.truenas.com/catalog/three-proxy_community/'],
    compose_urls='{}',
    source_urls=array[
      'https://github.com/3proxy/3proxy#docker-images','https://hub.docker.com/r/3proxy/3proxy',
      'https://github.com/3proxy/3proxy/releases','https://3proxy.org/repo/',
      'https://github.com/3proxy/3proxy#building-and-installation',
      'https://apps.truenas.com/catalog/three-proxy_community/'
    ],
    checked_at=now(),updated_at=now()
  where io.app_id=v_app_id and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception '3proxy install options update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in ('networking-dns','security-privacy');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception '3proxy categories update failed'; end if;
end
$migration$;

commit;
