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
  values('maxmind','geoipupdate','maxmind/geoipupdate','https://github.com/maxmind/geoipupdate',142222440,'Organization','main',false,false,'Apache-2.0 OR MIT',now(),'https://github.com/maxmind/geoipupdate')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='maxmind' and gp.repo='geoipupdate';
  select a.id into v_app_id from public.self_host_apps a
  where a.slug='geoipupdate' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/maxmind/geoipupdate'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='Apache-2.0'
    and a.docker_image='maxmindinc/geoipupdate'
  for update;
  if v_app_id is null then raise exception 'geoipupdate app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['databases','system-admin-hosting']::text[] then
    raise exception 'geoipupdate categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/maxmindinc/geoipupdate/'
     or current_options->0->>'image' is distinct from 'maxmindinc/geoipupdate'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/tritones/unraid-templates/main/templates/geoipupdate.xml' then
    raise exception 'geoipupdate install options changed since review';
  end if;

  update public.self_host_apps a set
    name='GeoIP Update', summary='Downloads and updates MaxMind GeoIP and GeoLite binary databases.',
    website_url='https://dev.maxmind.com/geoip/updating-databases/',
    source_code_url='https://github.com/maxmind/geoipupdate', source_full_name='maxmind/geoipupdate',
    source_repo_id='142222440', source_archived=false, source_default_branch='main', source_checked_at=now(),
    github_project_id=v_project_id, github_owner='maxmind', github_repo='geoipupdate', github_full_name='maxmind/geoipupdate',
    github_repo_id=142222440, github_owner_type='Organization', github_archived=false, github_disabled=false,
    github_default_branch='main', github_checked_at=now(),
    docs_url='https://dev.maxmind.com/geoip/updating-databases/',
    install_docs_url='https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md',
    release_url='https://github.com/maxmind/geoipupdate/releases',
    license='Apache-2.0 OR MIT', license_spdx_id='Apache-2.0 OR MIT', license_type='permissive', source_model='open_source',
    publisher_name='MaxMind, Inc.', publisher_type='company', publisher_url='https://www.maxmind.com/', pricing_model='freemium',
    docker_support='official', docker_url='https://github.com/maxmind/geoipupdate/pkgs/container/geoipupdate',
    docker_image='ghcr.io/maxmind/geoipupdate:latest',
    compose_support=true, compose_url='https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['native','docker','compose','unraid']::text[], surfaces=array['cli']::text[],
    data_source_urls=array[
      'https://github.com/maxmind/geoipupdate',
      'https://github.com/maxmind/geoipupdate/blob/main/README.md',
      'https://github.com/maxmind/geoipupdate/blob/main/LICENSE-APACHE',
      'https://github.com/maxmind/geoipupdate/blob/main/LICENSE-MIT',
      'https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md',
      'https://github.com/maxmind/geoipupdate/pkgs/container/geoipupdate',
      'https://dev.maxmind.com/geoip/updating-databases/',
      'https://www.maxmind.com/en/geoip-databases',
      'https://hub.docker.com/r/maxmindinc/geoipupdate',
      'https://github.com/tritones/unraid-templates/blob/main/templates/geoipupdate.xml'
    ],
    summary_source='https://github.com/maxmind/geoipupdate/blob/main/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'ram' - 'storage') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"MaxMind licenses the program under Apache-2.0 or MIT, at the user''s option.","source_urls":["https://github.com/maxmind/geoipupdate/blob/main/README.md","https://github.com/maxmind/geoipupdate/blob/main/LICENSE-APACHE","https://github.com/maxmind/geoipupdate/blob/main/LICENSE-MIT"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"MaxMind publishes geoipupdate images on GHCR and documents Docker and Compose installs.","source_urls":["https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md","https://github.com/maxmind/geoipupdate/pkgs/container/geoipupdate"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"MaxMind directs new image releases to ghcr.io/maxmind/geoipupdate; its older Docker Hub image is still available.","source_urls":["https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md","https://hub.docker.com/r/maxmindinc/geoipupdate"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"MaxMind''s Docker guide includes a Docker Compose example.","source_urls":["https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"GeoIP Update downloads binary database files; it does not require a separate database service.","source_urls":["https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md","https://dev.maxmind.com/geoip/updating-databases/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Docker guide mounts /usr/share/GeoIP so downloaded database files remain available on the host.","source_urls":["https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'geoipupdate app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=64, ram_estimate_max_mb=256, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small scheduled job updating a few binary database files.',
    ram_source_urls=array['https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md','https://github.com/maxmind/geoipupdate'],
    storage_estimate_min_gb=0.1, storage_estimate_max_gb=2, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='A few GeoIP or GeoLite database files stored under /usr/share/GeoIP; selected editions drive size.',
    storage_source_urls=array['https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md','https://dev.maxmind.com/geoip/docs/databases/'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=1024 and e.ram_estimate_max_mb=8192
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'geoipupdate resource estimate changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/maxmind/geoipupdate/releases","note":"Official native release; configuration needs an account ID, license key, and edition IDs.","image":null,"label":"Native release","method":"native","sort_order":5,"source_url":"https://github.com/maxmind/geoipupdate#readme","support_level":"official"},
      {"url":"https://github.com/maxmind/geoipupdate/pkgs/container/geoipupdate","note":"Current official image on GitHub Container Registry.","image":"ghcr.io/maxmind/geoipupdate:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md","support_level":"official"},
      {"url":"https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md","note":"Official Compose example; account ID, license key, and edition IDs are required.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md","support_level":"official"},
      {"url":"https://github.com/tritones/unraid-templates/blob/main/templates/geoipupdate.xml","note":"Community Unraid template; it uses the older Docker Hub image, while new releases are on GHCR.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://github.com/tritones/unraid-templates/blob/main/templates/geoipupdate.xml","support_level":"community"}
    ]'::jsonb,
    native_urls=array['https://github.com/maxmind/geoipupdate/releases'],
    docker_urls=array['https://github.com/maxmind/geoipupdate/pkgs/container/geoipupdate'], docker_images=array['ghcr.io/maxmind/geoipupdate:latest'],
    compose_urls=array['https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md'],
    unraid_urls=array['https://github.com/tritones/unraid-templates/blob/main/templates/geoipupdate.xml'],
    source_urls=array['https://github.com/maxmind/geoipupdate/blob/main/doc/docker.md','https://github.com/maxmind/geoipupdate/pkgs/container/geoipupdate','https://github.com/tritones/unraid-templates/blob/main/templates/geoipupdate.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'geoipupdate install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug='system-admin-hosting';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'geoipupdate category update failed'; end if;

  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,disabled,license_spdx_id,checked_at,source_url)
  values('NginxProxyManager','nginx-proxy-manager','NginxProxyManager/nginx-proxy-manager','https://github.com/NginxProxyManager/nginx-proxy-manager',114938943,'Organization','develop',false,false,'MIT',now(),'https://github.com/NginxProxyManager/nginx-proxy-manager')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='NginxProxyManager' and gp.repo='nginx-proxy-manager';
  select a.id into v_app_id from public.self_host_apps a
  where a.slug='nginxproxymanager' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/jlesage/docker-nginx-proxy-manager'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='MIT'
    and a.docker_image='jlesage/nginx-proxy-manager'
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'nginxproxymanager app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['ai-ml','identity-access','photos-galleries']::text[] then
    raise exception 'nginxproxymanager categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/jlesage/nginx-proxy-manager'
     or current_options->0->>'image' is distinct from 'jlesage/nginx-proxy-manager'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/nginx-proxy-manager.xml' then
    raise exception 'nginxproxymanager install options changed since review';
  end if;

  update public.self_host_apps a set
    name='Nginx Proxy Manager', summary='Routes websites through a reverse proxy and manages host rules and TLS certificates from a web interface.',
    website_url='https://nginxproxymanager.com/',
    source_code_url='https://github.com/NginxProxyManager/nginx-proxy-manager', source_full_name='NginxProxyManager/nginx-proxy-manager',
    source_repo_id='114938943', source_archived=false, source_default_branch='develop', source_checked_at=now(),
    github_project_id=v_project_id, github_owner='NginxProxyManager', github_repo='nginx-proxy-manager', github_full_name='NginxProxyManager/nginx-proxy-manager',
    github_repo_id=114938943, github_owner_type='Organization', github_archived=false, github_disabled=false,
    github_default_branch='develop', github_checked_at=now(),
    docs_url='https://nginxproxymanager.com/setup/', install_docs_url='https://nginxproxymanager.com/setup/',
    release_url='https://github.com/NginxProxyManager/nginx-proxy-manager/releases',
    license='MIT', license_spdx_id='MIT', license_type='permissive', source_model='open_source',
    publisher_name='Nginx Proxy Manager', publisher_type='community', publisher_url='https://github.com/NginxProxyManager', pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/r/jc21/nginx-proxy-manager', docker_image='jc21/nginx-proxy-manager:latest',
    compose_support=true, compose_url='https://nginxproxymanager.com/setup/',
    requires_database=false, database_types=array['sqlite']::text[], persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['web']::text[],
    data_source_urls=array[
      'https://github.com/NginxProxyManager/nginx-proxy-manager',
      'https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/LICENSE',
      'https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/README.md',
      'https://nginxproxymanager.com/setup/',
      'https://hub.docker.com/r/jc21/nginx-proxy-manager',
      'https://github.com/jlesage/docker-nginx-proxy-manager',
      'https://github.com/jlesage/docker-templates/blob/master/jlesage/nginx-proxy-manager.xml'
    ],
    summary_source='https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'ram' - 'storage') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Nginx Proxy Manager source repository uses the MIT License.","source_urls":["https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/LICENSE"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official project publishes jc21/nginx-proxy-manager and uses it in its setup guide.","source_urls":["https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/README.md","https://hub.docker.com/r/jc21/nginx-proxy-manager"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream quick setup uses jc21/nginx-proxy-manager:latest.","source_urls":["https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/README.md"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official README and setup guide include Docker Compose examples.","source_urls":["https://github.com/NginxProxyManager/nginx-proxy-manager/blob/develop/README.md","https://nginxproxymanager.com/setup/"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The default install uses embedded SQLite; MySQL, MariaDB, and PostgreSQL are optional external choices.","source_urls":["https://nginxproxymanager.com/setup/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose setup persists /data and /etc/letsencrypt.","source_urls":["https://nginxproxymanager.com/setup/"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nginxproxymanager app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small home reverse-proxy setup with a few hosts and TLS certificates.',
    ram_source_urls=array['https://nginxproxymanager.com/setup/','https://github.com/NginxProxyManager/nginx-proxy-manager'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=10, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Proxy configuration, SQLite data, certificates, and logs stored under /data and /etc/letsencrypt.',
    storage_source_urls=array['https://nginxproxymanager.com/setup/'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.storage_estimate_min_gb=50 and e.storage_estimate_max_gb=500
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nginxproxymanager resource estimate changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/jc21/nginx-proxy-manager","note":"Official Nginx Proxy Manager container image.","image":"jc21/nginx-proxy-manager:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://nginxproxymanager.com/setup/","support_level":"official"},
      {"url":"https://nginxproxymanager.com/setup/","note":"Official Compose setup with SQLite by default.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://nginxproxymanager.com/setup/","support_level":"official"},
      {"url":"https://github.com/jlesage/docker-templates/blob/master/jlesage/nginx-proxy-manager.xml","note":"Community Unraid template using jlesage''s separate packaging image.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://github.com/jlesage/docker-templates/blob/master/jlesage/nginx-proxy-manager.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/jc21/nginx-proxy-manager'], docker_images=array['jc21/nginx-proxy-manager:latest'],
    compose_urls=array['https://nginxproxymanager.com/setup/'],
    unraid_urls=array['https://github.com/jlesage/docker-templates/blob/master/jlesage/nginx-proxy-manager.xml'],
    source_urls=array['https://nginxproxymanager.com/setup/','https://hub.docker.com/r/jc21/nginx-proxy-manager','https://github.com/jlesage/docker-templates/blob/master/jlesage/nginx-proxy-manager.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nginxproxymanager install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('networking-dns','remote-access','security-privacy');
  get diagnostics affected=row_count;
  if affected<>3 then raise exception 'nginxproxymanager category update failed'; end if;

  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,disabled,license_spdx_id,checked_at,source_url)
  values('getwud','wud','getwud/wud','https://github.com/getwud/wud',197008093,'Organization','main',false,false,'MIT',now(),'https://github.com/getwud/wud')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='getwud' and gp.repo='wud';
  select a.id into v_app_id from public.self_host_apps a
  where a.slug='whats-up-docker' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/fmartinou/whats-up-docker'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='MIT'
    and a.docker_image='fmartinou/whats-up-docker'
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'whats-up-docker app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['ai-ml','email-newsletters','monitoring-status']::text[] then
    raise exception 'whats-up-docker categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/fmartinou/whats-up-docker'
     or current_options->0->>'image' is distinct from 'fmartinou/whats-up-docker'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/AlexGreenUK/unraid-templates/main/whats-up-docker/whats-up-docker.xml' then
    raise exception 'whats-up-docker install options changed since review';
  end if;

  update public.self_host_apps a set
    name='What’s Up Docker (WUD)', summary='Monitors container image versions and can notify or update containers when new versions appear.',
    website_url='https://getwud.app/',
    source_code_url='https://github.com/getwud/wud', source_full_name='getwud/wud',
    source_repo_id='197008093', source_archived=false, source_default_branch='main', source_checked_at=now(),
    github_project_id=v_project_id, github_owner='getwud', github_repo='wud', github_full_name='getwud/wud',
    github_repo_id=197008093, github_owner_type='Organization', github_archived=false, github_disabled=false,
    github_default_branch='main', github_checked_at=now(),
    docs_url='https://getwud.app/docs/', install_docs_url='https://getwud.app/docs/quickstart/',
    release_url='https://github.com/getwud/wud/releases',
    license='MIT', license_spdx_id='MIT', license_type='permissive', source_model='open_source',
    publisher_name='WUD project', publisher_type='community', publisher_url='https://github.com/getwud', pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/r/getwud/wud', docker_image='getwud/wud',
    compose_support=true, compose_url='https://getwud.app/docs/quickstart/',
    requires_database=false, database_types=array['sqlite']::text[], persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose']::text[], surfaces=array['web','api']::text[],
    data_source_urls=array[
      'https://github.com/getwud/wud',
      'https://github.com/getwud/wud/blob/main/LICENSE',
      'https://github.com/getwud/wud/blob/main/README.md',
      'https://getwud.app/docs/quickstart/',
      'https://getwud.app/docs/configuration/storage/',
      'https://getwud.app/docs/configuration/',
      'https://hub.docker.com/r/getwud/wud',
      'https://github.com/getwud/wud/releases'
    ],
    summary_source='https://github.com/getwud/wud/blob/main/README.md', summary_confidence='high', data_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) - 'ram' - 'storage') || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream WUD repository uses the MIT License.","source_urls":["https://github.com/getwud/wud/blob/main/LICENSE"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The upstream quick start uses the getwud/wud image from Docker Hub or GHCR.","source_urls":["https://getwud.app/docs/quickstart/","https://hub.docker.com/r/getwud/wud"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The current upstream image is getwud/wud.","source_urls":["https://getwud.app/docs/quickstart/","https://hub.docker.com/r/getwud/wud"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official quick start includes a Docker Compose example.","source_urls":["https://getwud.app/docs/quickstart/"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"WUD v9 stores app state in an embedded SQLite database and does not need a separate database service.","source_urls":["https://getwud.app/docs/configuration/storage/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"WUD stores its SQLite database at /store/wud.sqlite; the official guide recommends mounting /store.","source_urls":["https://getwud.app/docs/configuration/storage/"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'whats-up-docker app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small Docker host monitoring a modest container list and update history.',
    ram_source_urls=array['https://getwud.app/docs/quickstart/','https://getwud.app/docs/configuration/storage/'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=20, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='SQLite state and image history under /store; watched workload and retained history drive growth.',
    storage_source_urls=array['https://getwud.app/docs/configuration/storage/'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'whats-up-docker resource estimate changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/getwud/wud","note":"Current WUD image published by the project maintainers; the container socket is needed to inspect or manage Docker containers.","image":"getwud/wud","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://getwud.app/docs/quickstart/","support_level":"official"},
      {"url":"https://getwud.app/docs/quickstart/","note":"Official Compose quick start; it mounts the Docker socket.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://getwud.app/docs/quickstart/","support_level":"official"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/getwud/wud'], docker_images=array['getwud/wud'],
    compose_urls=array['https://getwud.app/docs/quickstart/'], unraid_urls='{}',
    source_urls=array['https://getwud.app/docs/quickstart/','https://hub.docker.com/r/getwud/wud'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'whats-up-docker install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('automation','monitoring-status','system-admin-hosting');
  get diagnostics affected=row_count;
  if affected<>3 then raise exception 'whats-up-docker category update failed'; end if;
end
$migration$;

commit;
