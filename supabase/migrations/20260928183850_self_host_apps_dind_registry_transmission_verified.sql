begin;

do $migration$
declare
  v_app_id uuid;
  v_project_id uuid;
  current_categories text[];
  current_options jsonb;
  affected integer;
begin
  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,disabled,license_spdx_id,checked_at,source_url)
  values('docker-library','docker','docker-library/docker','https://github.com/docker-library/docker',33521619,'Organization','master',false,false,'Apache-2.0',now(),'https://github.com/docker-library/docker')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;

  select gp.id into v_project_id from public.github_projects gp where gp.owner='docker-library' and gp.repo='docker';
  select a.id into v_app_id from public.self_host_apps a
  where a.slug='docker-in-docker-dind' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/docker-library/docker'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='Apache-2.0'
    and a.docker_image='docker:dind'
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'docker-in-docker-dind app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['ai-ml','communication','photos-galleries']::text[] then
    raise exception 'docker-in-docker-dind categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/_/docker'
     or current_options->0->>'image' is distinct from 'docker:dind'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml' then
    raise exception 'docker-in-docker-dind install options changed since review';
  end if;

  update public.self_host_apps a set
    name='Docker-in-Docker (DinD)',
    summary='Runs a separate Docker daemon inside a container so build tools can create images without using the host daemon.',
    website_url='https://github.com/docker-library/docker',
    source_code_url='https://github.com/docker-library/docker', source_full_name='docker-library/docker',
    source_repo_id='33521619', source_archived=false, source_default_branch='master', source_checked_at=now(),
    github_project_id=v_project_id, github_owner='docker-library', github_repo='docker', github_full_name='docker-library/docker',
    github_repo_id=33521619, github_owner_type='Organization', github_archived=false, github_disabled=false,
    github_default_branch='master', github_checked_at=now(),
    docs_url='https://hub.docker.com/_/docker',
    install_docs_url='https://hub.docker.com/_/docker',
    release_url='https://github.com/moby/moby/releases',
    license='Apache-2.0', license_spdx_id='Apache-2.0', license_type='permissive', source_model='open_source',
    publisher_name='Docker Official Images', publisher_type='community', publisher_url='https://github.com/docker-library/docker', pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/_/docker', docker_image='docker:dind',
    compose_support=null, compose_url=null,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['api','cli']::text[],
    data_source_urls=array[
      'https://hub.docker.com/_/docker',
      'https://github.com/docker-library/docker',
      'https://github.com/docker-library/docker/blob/master/LICENSE',
      'https://github.com/moby/moby/blob/master/LICENSE',
      'https://github.com/moby/moby/releases',
      'https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml'
    ],
    summary_source='https://hub.docker.com/_/docker', summary_confidence='high', data_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'ram' - 'storage' - 'compose') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Docker Official Image packaging repository and Docker Engine source use Apache-2.0.","source_urls":["https://github.com/docker-library/docker/blob/master/LICENSE","https://github.com/moby/moby/blob/master/LICENSE"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Docker lists docker:dind as an Official Image and documents its use.","source_urls":["https://hub.docker.com/_/docker"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Docker documents the docker:dind image tag.","source_urls":["https://hub.docker.com/_/docker"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Docker daemon stores its state under /var/lib/docker; the DinD setup does not use a separate database service.","source_urls":["https://hub.docker.com/_/docker"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Docker documents /var/lib/docker as the daemon data directory; the community Unraid template maps it to persistent host storage.","source_urls":["https://hub.docker.com/_/docker","https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'docker-in-docker-dind app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=2048, ram_estimate_max_mb=8192, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small build runner; parallel builds and large build steps use more memory.',
    ram_source_urls=array['https://hub.docker.com/_/docker','https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml'],
    storage_estimate_min_gb=50, storage_estimate_max_gb=500, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Docker image layers and build cache stored under /var/lib/docker; retained images drive growth.',
    storage_source_urls=array['https://hub.docker.com/_/docker','https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.storage_estimate_min_gb=50 and e.storage_estimate_max_gb=500
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'docker-in-docker-dind resource estimate changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/_/docker","note":"Official Docker image. DinD requires privileged mode, which gives the daemon broad access to the host.","image":"docker:dind","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/_/docker","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml","note":"Community Unraid template; it runs privileged and exposes Docker API ports. Review its settings before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/docker'], docker_images=array['docker:dind'],
    compose_urls='{}', unraid_urls=array['https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml'],
    source_urls=array['https://hub.docker.com/_/docker','https://github.com/docker-library/docker','https://raw.githubusercontent.com/testdasi/testdasi-unraid-repo/master/docker-in-docker-dind.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'docker-in-docker-dind install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('developer-tools','system-admin-hosting');
  get diagnostics affected=row_count;
  if affected<>2 then raise exception 'docker-in-docker-dind category update failed'; end if;

  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,disabled,license_spdx_id,checked_at,source_url)
  values('distribution','distribution','distribution/distribution','https://github.com/distribution/distribution',28366058,'Organization','main',false,false,'Apache-2.0',now(),'https://github.com/distribution/distribution')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='distribution' and gp.repo='distribution';
  select a.id into v_app_id from public.self_host_apps a
  where a.slug='dockerregistry' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/docker/distribution-library-image'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='Apache-2.0'
    and a.docker_image='registry:2'
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'dockerregistry app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['networking-dns','photos-galleries','project-task-management']::text[] then
    raise exception 'dockerregistry categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/_/registry'
     or current_options->0->>'image' is distinct from 'registry:2'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/juusujanar/unraid-templates/master/DockerRegistry.xml' then
    raise exception 'dockerregistry install options changed since review';
  end if;

  update public.self_host_apps a set
    name='Docker Registry', summary='Stores and serves container images through the Registry HTTP API.',
    website_url='https://distribution.github.io/distribution/',
    source_code_url='https://github.com/distribution/distribution', source_full_name='distribution/distribution',
    source_repo_id='28366058', source_archived=false, source_default_branch='main', source_checked_at=now(),
    github_project_id=v_project_id, github_owner='distribution', github_repo='distribution', github_full_name='distribution/distribution',
    github_repo_id=28366058, github_owner_type='Organization', github_archived=false, github_disabled=false,
    github_default_branch='main', github_checked_at=now(),
    docs_url='https://distribution.github.io/distribution/about/deploying/',
    install_docs_url='https://distribution.github.io/distribution/about/deploying/',
    release_url='https://github.com/distribution/distribution/releases',
    license='Apache-2.0', license_spdx_id='Apache-2.0', license_type='permissive', source_model='open_source',
    publisher_name='CNCF Distribution', publisher_type='community', publisher_url='https://github.com/distribution/distribution', pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/_/registry', docker_image='registry:3',
    compose_support=true, compose_url='https://distribution.github.io/distribution/about/deploying/#deploy-your-registry-using-a-compose-file',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['api']::text[],
    data_source_urls=array[
      'https://distribution.github.io/distribution/',
      'https://distribution.github.io/distribution/about/deploying/',
      'https://distribution.github.io/distribution/storage-drivers/filesystem/',
      'https://github.com/distribution/distribution',
      'https://github.com/distribution/distribution/blob/main/LICENSE',
      'https://github.com/distribution/distribution/releases',
      'https://hub.docker.com/_/registry',
      'https://github.com/juusujanar/unraid-templates/blob/master/DockerRegistry3.xml'
    ],
    summary_source='https://distribution.github.io/distribution/about/deploying/', summary_confidence='high', data_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'ram' - 'storage') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Distribution source repository identifies Apache-2.0.","source_urls":["https://github.com/distribution/distribution/blob/main/LICENSE"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official deployment guide runs the Docker Official Image registry:3.","source_urls":["https://distribution.github.io/distribution/about/deploying/","https://hub.docker.com/_/registry"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official deployment guide uses registry:3.","source_urls":["https://distribution.github.io/distribution/about/deploying/"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official deployment guide includes a Docker Compose configuration.","source_urls":["https://distribution.github.io/distribution/about/deploying/#deploy-your-registry-using-a-compose-file"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official container stores registry data on a filesystem or configured storage backend and does not require a separate database service.","source_urls":["https://distribution.github.io/distribution/about/deploying/","https://distribution.github.io/distribution/storage-drivers/filesystem/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official guide stores image data at /var/lib/registry by default.","source_urls":["https://distribution.github.io/distribution/about/deploying/","https://distribution.github.io/distribution/storage-drivers/filesystem/"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'dockerregistry app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small private registry with low request volume; concurrent uploads and downloads raise use.',
    ram_source_urls=array['https://distribution.github.io/distribution/about/deploying/','https://github.com/distribution/distribution'],
    storage_estimate_min_gb=10, storage_estimate_max_gb=500, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Small collection of container images; retained tags and layers drive growth.',
    storage_source_urls=array['https://distribution.github.io/distribution/about/deploying/','https://distribution.github.io/distribution/storage-drivers/filesystem/'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.storage_estimate_min_gb=50 and e.storage_estimate_max_gb=500
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'dockerregistry resource estimate changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/_/registry","note":"Docker Official Image used in the Distribution deployment guide.","image":"registry:3","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://distribution.github.io/distribution/about/deploying/","support_level":"official"},
      {"url":"https://distribution.github.io/distribution/about/deploying/#deploy-your-registry-using-a-compose-file","note":"Compose example from the official deployment guide.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://distribution.github.io/distribution/about/deploying/","support_level":"official"},
      {"url":"https://github.com/juusujanar/unraid-templates/blob/master/DockerRegistry3.xml","note":"Community Unraid template using registry:3.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://github.com/juusujanar/unraid-templates/blob/master/DockerRegistry3.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/registry'], docker_images=array['registry:3'],
    compose_urls=array['https://distribution.github.io/distribution/about/deploying/#deploy-your-registry-using-a-compose-file'],
    unraid_urls=array['https://github.com/juusujanar/unraid-templates/blob/master/DockerRegistry3.xml'],
    source_urls=array['https://distribution.github.io/distribution/about/deploying/','https://hub.docker.com/_/registry','https://github.com/juusujanar/unraid-templates/blob/master/DockerRegistry3.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'dockerregistry install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('developer-tools','system-admin-hosting');
  get diagnostics affected=row_count;
  if affected<>2 then raise exception 'dockerregistry category update failed'; end if;

  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,disabled,license_spdx_id,checked_at,source_url)
  values('haugene','docker-transmission-openvpn','haugene/docker-transmission-openvpn','https://github.com/haugene/docker-transmission-openvpn',26399764,'User','master',false,false,'GPL-3.0',now(),'https://github.com/haugene/docker-transmission-openvpn')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='haugene' and gp.repo='docker-transmission-openvpn';
  select a.id into v_app_id from public.self_host_apps a
  where a.slug='transmission-vpn' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/haugene/docker-transmission-openvpn'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='GPL-3.0'
    and a.docker_image='haugene/transmission-openvpn:dev'
    and a.compose_support=false and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'transmission-vpn app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['ai-ml','communication','databases']::text[] then
    raise exception 'transmission-vpn categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/haugene/transmission-openvpn/'
     or current_options->0->>'image' is distinct from 'haugene/transmission-openvpn:dev'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/clowrym/docker-templates/master/Transmission_VPN.xml' then
    raise exception 'transmission-vpn install options changed since review';
  end if;

  update public.self_host_apps a set
    name='Transmission OpenVPN', summary='Runs the Transmission BitTorrent client behind an OpenVPN tunnel and provides a web interface for managing torrents.',
    website_url='https://haugene.github.io/docker-transmission-openvpn/',
    source_code_url='https://github.com/haugene/docker-transmission-openvpn', source_full_name='haugene/docker-transmission-openvpn',
    source_repo_id='26399764', source_archived=false, source_default_branch='master', source_checked_at=now(),
    github_project_id=v_project_id, github_owner='haugene', github_repo='docker-transmission-openvpn', github_full_name='haugene/docker-transmission-openvpn',
    github_repo_id=26399764, github_owner_type='User', github_archived=false, github_disabled=false,
    github_default_branch='master', github_checked_at=now(),
    docs_url='https://haugene.github.io/docker-transmission-openvpn/',
    install_docs_url='https://github.com/haugene/docker-transmission-openvpn#readme',
    license='GPL-3.0 (container); Transmission: GPLv2, GPLv3, or a future Mnemosyne-endorsed license',
    license_spdx_id=null, license_type='mixed', source_model='open_source',
    publisher_name='haugene', publisher_type='individual', publisher_url='https://github.com/haugene', pricing_model='free',
    docker_support='community', docker_url='https://hub.docker.com/r/haugene/transmission-openvpn', docker_image='haugene/transmission-openvpn:latest',
    compose_support=true, compose_url='https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['web','api']::text[],
    data_source_urls=array[
      'https://github.com/haugene/docker-transmission-openvpn',
      'https://github.com/haugene/docker-transmission-openvpn/blob/master/LICENSE',
      'https://github.com/haugene/docker-transmission-openvpn#readme',
      'https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml',
      'https://github.com/haugene/docker-transmission-openvpn/blob/master/transmission/default-settings.json',
      'https://github.com/transmission/transmission/blob/main/COPYING',
      'https://haugene.github.io/docker-transmission-openvpn/',
      'https://hub.docker.com/r/haugene/transmission-openvpn',
      'https://raw.githubusercontent.com/clowrym/docker-templates/master/Transmission_VPN.xml'
    ],
    summary_source='https://github.com/haugene/docker-transmission-openvpn#readme', summary_confidence='high', data_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'ram' - 'storage') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The container repository uses GPL-3.0; Transmission lists GPLv2, GPLv3, or a later license endorsed by Mnemosyne LLC.","source_urls":["https://github.com/haugene/docker-transmission-openvpn/blob/master/LICENSE","https://github.com/transmission/transmission/blob/main/COPYING"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project builds and documents the haugene/transmission-openvpn container image.","source_urls":["https://github.com/haugene/docker-transmission-openvpn#readme","https://hub.docker.com/r/haugene/transmission-openvpn"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream README uses the haugene/transmission-openvpn image; latest is the stable release tag and dev is a development build.","source_urls":["https://github.com/haugene/docker-transmission-openvpn#readme","https://hub.docker.com/r/haugene/transmission-openvpn"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream README and repository include Docker Compose examples.","source_urls":["https://github.com/haugene/docker-transmission-openvpn#readme","https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented setup persists Transmission settings and downloads to /config and /data without a separate database service.","source_urls":["https://github.com/haugene/docker-transmission-openvpn#readme","https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented container maps /data for downloads and /config for Transmission settings.","source_urls":["https://github.com/haugene/docker-transmission-openvpn#readme","https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'transmission-vpn app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small torrent queue with the documented default peer limit; more active peers use more memory.',
    ram_source_urls=array['https://github.com/haugene/docker-transmission-openvpn/blob/master/transmission/default-settings.json','https://github.com/haugene/docker-transmission-openvpn#readme'],
    storage_estimate_min_gb=50, storage_estimate_max_gb=500, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Small to medium download library stored under /data; downloaded files drive growth.',
    storage_source_urls=array['https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml','https://github.com/haugene/docker-transmission-openvpn#readme'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'transmission-vpn resource estimate changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/haugene/transmission-openvpn","note":"Community image published by the project maintainers; use the latest stable image tag.","image":"haugene/transmission-openvpn:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/haugene/docker-transmission-openvpn#readme","support_level":"community"},
      {"url":"https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml","note":"Compose example from the project repository.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/haugene/docker-transmission-openvpn#readme","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/clowrym/docker-templates/master/Transmission_VPN.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/clowrym/docker-templates/master/Transmission_VPN.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/haugene/transmission-openvpn'], docker_images=array['haugene/transmission-openvpn:latest'],
    compose_urls=array['https://github.com/haugene/docker-transmission-openvpn/blob/master/docker-compose.yml'],
    unraid_urls=array['https://raw.githubusercontent.com/clowrym/docker-templates/master/Transmission_VPN.xml'],
    source_urls=array['https://github.com/haugene/docker-transmission-openvpn#readme','https://hub.docker.com/r/haugene/transmission-openvpn','https://raw.githubusercontent.com/clowrym/docker-templates/master/Transmission_VPN.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'transmission-vpn install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('file-sharing-sync','networking-dns','security-privacy');
  get diagnostics affected=row_count;
  if affected<>3 then raise exception 'transmission-vpn category update failed'; end if;
end
$migration$;

commit;
