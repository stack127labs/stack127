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
  where a.slug='myst'
    and a.published is true
    and a.self_hosting_status='self_hostable'
    and a.name='myst'
    and a.summary='Node software for providing decentralized VPN bandwidth through the Mysterium network.'
    and a.source_code_url='https://github.com/mysteriumnetwork/node'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available'
    and a.docker_support='community'
    and a.docker_image='mysteriumnetwork/myst'
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'myst app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['ai-ml','networking-dns','system-admin-hosting']::text[] then
    raise exception 'myst categories changed since review';
  end if;

  select io.options into v_current_options
  from public.self_host_app_install_options io
  where io.app_id=v_app_id
  for update;
  if v_current_options is distinct from '[
    {"url":"https://hub.docker.com/r/mysteriumnetwork/myst/","note":"Community-maintained image. Verify the publisher before pulling.","image":"mysteriumnetwork/myst","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/mysteriumnetwork/myst/","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml","support_level":"community"}
  ]'::jsonb then
    raise exception 'myst install options changed since review';
  end if;

  update public.self_host_apps a set
    name='Mysterium Node',
    summary='Mysterium Node lets you run a decentralized VPN service on your own server.',
    website_url='https://mysterium.network/',
    docs_url='https://docs.mysterium.network/',
    install_docs_url='https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md',
    license='GPL-3.0', license_type='copyleft', license_spdx_id='GPL-3.0', source_model='open_source',
    publisher_name='BlockDev AG', publisher_type='company', publisher_url='https://mysterium.network/',
    pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/r/mysteriumnetwork/myst', docker_image='mysteriumnetwork/myst',
    compose_support=null, compose_url=null,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    ram_min_mb=1024, storage_min_gb=0.5, resource_requirement_kind='official_minimum',
    deployment_methods=array['native','docker','unraid']::text[], surfaces=array['web','api','cli']::text[],
    summary_source='https://github.com/mysteriumnetwork/node/blob/master/README.md', summary_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'compose') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream README identifies GNU GPL version 3.0 as the project license.","source_urls":["https://github.com/mysteriumnetwork/node/blob/master/README.md","https://github.com/mysteriumnetwork/node/blob/master/LICENSE"]},
      "ram":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Linux guide lists 1 GB RAM as sufficient for a node.","source_urls":["https://docs.mysterium.network/content-page"]},
      "storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Linux guide lists 500 MB of free disk space.","source_urls":["https://docs.mysterium.network/content-page"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream INSTALL guide calls the Docker image its convenient node install option.","source_urls":["https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md","https://hub.docker.com/r/mysteriumnetwork/myst"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Mysterium publishes mysteriumnetwork/myst on Docker Hub.","source_urls":["https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md","https://hub.docker.com/r/mysteriumnetwork/myst"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker install runs the node in one container without a separate database service.","source_urls":["https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The node stores its data under /var/lib/mysterium-node; keep this directory on persistent storage.","source_urls":["https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project includes a web UI, a client API, and a command-line client.","source_urls":["https://github.com/mysteriumnetwork/node/blob/master/README.md","https://github.com/mysteriumnetwork/node/blob/master/ui/server.go"]}
    }'::jsonb,
    data_source_urls=(
      select array_agg(distinct u order by u)
      from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
        'https://mysterium.network/',
        'https://docs.mysterium.network/',
        'https://docs.mysterium.network/content-page',
        'https://github.com/mysteriumnetwork/node',
        'https://github.com/mysteriumnetwork/node/blob/master/LICENSE',
        'https://github.com/mysteriumnetwork/node/blob/master/README.md',
        'https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md',
        'https://github.com/mysteriumnetwork/node/blob/master/ui/server.go',
        'https://github.com/mysteriumnetwork/node/releases',
        'https://hub.docker.com/r/mysteriumnetwork/myst',
        'https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml'
      ]::text[]) as urls(u)
    ),
    updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'myst app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='medium',
    ram_estimate_basis='Official guide lists 1 GB RAM; 1 to 2 GB suits a small VPN node.',
    ram_source_urls=array['https://docs.mysterium.network/content-page','https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md'],
    storage_estimate_min_gb=0.5, storage_estimate_max_gb=5, storage_estimate_kind='estimated', storage_estimate_confidence='medium',
    storage_estimate_basis='Official guide lists 500 MB free disk; node identity and logs use its data directory.',
    storage_source_urls=array['https://docs.mysterium.network/content-page','https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id
    and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'myst resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md","note":"Official Linux package and standalone binary instructions.","image":null,"label":"Linux install guide","method":"native","sort_order":5,"source_url":"https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md","support_level":"official"},
      {"url":"https://hub.docker.com/r/mysteriumnetwork/myst","note":"Official image. Linux Docker setup uses host networking and NET_ADMIN.","image":"mysteriumnetwork/myst","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml","note":"Community Unraid template for Mysterium Node.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml","support_level":"community"}
    ]'::jsonb,
    native_urls=array['https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md'],
    docker_urls=array['https://hub.docker.com/r/mysteriumnetwork/myst'],
    docker_images=array['mysteriumnetwork/myst'],
    compose_urls='{}',
    unraid_urls=array['https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml'],
    source_urls=array[
      'https://github.com/mysteriumnetwork/node/blob/master/INSTALL.md',
      'https://hub.docker.com/r/mysteriumnetwork/myst',
      'https://raw.githubusercontent.com/locus313/unraid-docker-templates/main/templates/myst.xml'
    ],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=v_current_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'myst install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('remote-access','security-privacy');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception 'myst category update failed'; end if;
end
$migration$;

commit;
