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
  where a.slug='binhex-delugevpn'
    and a.published is true
    and a.self_hosting_status='self_hostable'
    and a.name='binhex-delugevpn'
    and a.summary='Deluge is a full-featured BitTorrent client for Linux, OS X, Unix and Windows.'
    and a.source_code_url='https://github.com/binhex/arch-delugevpn'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available'
    and a.docker_image='ghcr.io/binhex/arch-delugevpn'
    and a.docker_support='community'
    and a.compose_support is false
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'binhex-delugevpn app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['identity-access','networking-dns','remote-access']::text[] then
    raise exception 'binhex-delugevpn categories changed since review';
  end if;

  select io.options into v_current_options
  from public.self_host_app_install_options io
  where io.app_id=v_app_id
  for update;
  if v_current_options is distinct from '[
    {"url":"https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn","note":"Community-maintained image. Verify the publisher before pulling.","image":"ghcr.io/binhex/arch-delugevpn","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml","support_level":"community"}
  ]'::jsonb then
    raise exception 'binhex-delugevpn install options changed since review';
  end if;

  update public.self_host_apps a set
    name='DelugeVPN',
    summary='DelugeVPN runs the Deluge BitTorrent client with OpenVPN or WireGuard, plus optional Privoxy and MicroSocks proxies.',
    website_url='https://deluge-torrent.org/',
    docs_url='https://github.com/binhex/arch-delugevpn/blob/master/README.md',
    install_docs_url='https://github.com/binhex/arch-delugevpn/blob/master/README.md',
    docker_url='https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn',
    docker_image='ghcr.io/binhex/arch-delugevpn',
    license='GPL-3.0 (Binhex container project); included components have their own licenses.',
    license_type='copyleft', license_spdx_id='GPL-3.0', source_model='open_source',
    publisher_name='Binhex', publisher_type='community', publisher_url='https://github.com/binhex',
    pricing_model='free',
    compose_support=null, compose_url=null,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    ram_min_mb=null, storage_min_gb=null, resource_requirement_kind='unknown',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['web','cli']::text[],
    summary_source='https://github.com/binhex/arch-delugevpn/blob/master/README.md', summary_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The GHCR package identifies the image project as GPL-3.0; bundled software has separate licenses.","source_urls":["https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn","https://github.com/binhex/arch-delugevpn/blob/master/README.md"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"No RAM minimum is listed in the project README; the range is estimated for the listed services.","source_urls":["https://github.com/binhex/arch-delugevpn/blob/master/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The README mounts downloads at /data but does not specify a disk size; the range is estimated for a small library.","source_urls":["https://github.com/binhex/arch-delugevpn/blob/master/README.md"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented container runs without a separate database service.","source_urls":["https://github.com/binhex/arch-delugevpn/blob/master/README.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The container mounts /data for downloads and /config for application configuration.","source_urls":["https://github.com/binhex/arch-delugevpn/blob/master/README.md"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Binhex documents Docker run setup and publishes the arch-delugevpn image on GHCR.","source_urls":["https://github.com/binhex/arch-delugevpn/blob/master/README.md","https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes ghcr.io/binhex/arch-delugevpn.","source_urls":["https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The README lists Deluge web and console interfaces and exposes the web UI.","source_urls":["https://github.com/binhex/arch-delugevpn/blob/master/README.md"]}
    }'::jsonb),
    data_source_urls=(
      select array_agg(distinct u order by u)
      from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
        'https://deluge-torrent.org/',
        'https://github.com/binhex/arch-delugevpn',
        'https://github.com/binhex/arch-delugevpn/blob/master/README.md',
        'https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn',
        'https://github.com/binhex/documentation',
        'https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml'
      ]::text[]) as urls(u)
    ),
    data_checked_at=now(), data_confidence='high', technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'binhex-delugevpn app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for one small Deluge client with its VPN and proxy services; active torrents and transfer load drive use.',
    ram_source_urls=array['https://github.com/binhex/arch-delugevpn/blob/master/README.md'],
    storage_estimate_min_gb=20, storage_estimate_max_gb=200, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Downloads use the mounted /data folder; 20 to 200 GB is a small-library estimate and actual space follows downloaded files.',
    storage_source_urls=array['https://github.com/binhex/arch-delugevpn/blob/master/README.md'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id
    and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'binhex-delugevpn resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn","note":"Community image from the Binhex project; includes Deluge with VPN and proxy services.","image":"ghcr.io/binhex/arch-delugevpn","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/binhex/arch-delugevpn/blob/master/README.md","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn'],
    docker_images=array['ghcr.io/binhex/arch-delugevpn'],
    compose_urls='{}',
    unraid_urls=array['https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml'],
    source_urls=array[
      'https://github.com/binhex/arch-delugevpn/blob/master/README.md',
      'https://github.com/binhex/arch-delugevpn/pkgs/container/arch-delugevpn',
      'https://raw.githubusercontent.com/binhex/templates/main/unraid/binhex/templates/delugevpn.xml'
    ],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=v_current_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'binhex-delugevpn install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('file-sharing-sync','security-privacy');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception 'binhex-delugevpn category update failed'; end if;
end
$migration$;

commit;
