begin;

do $migration$
declare
  v_blender uuid;
  v_mylar uuid;
  v_openvscode uuid;
  v_unifi uuid;
  v_categories text[];
  v_options jsonb;
  v_affected integer;
begin
  select a.id into v_blender
  from public.self_host_apps a
  where a.slug='blender' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/linuxserver/docker-blender'
    and a.license='No license file declared (all rights reserved by default)' and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available' and a.github_project_id='923408d3-fdc5-42df-8698-0008c0083f7d'::uuid
    and a.compose_support is false and a.requires_database is null and a.persistent_storage is null;
  if v_blender is null then raise exception 'Blender record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_blender;
  if v_categories is distinct from array['games','photos-galleries']::text[] then
    raise exception 'Blender categories changed since review';
  end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_blender for update;
  if v_options is null or jsonb_array_length(v_options)<>2
     or not exists(select 1 from jsonb_array_elements(v_options) x where x->>'url'='https://hub.docker.com/r/linuxserver/blender')
     or not exists(select 1 from jsonb_array_elements(v_options) x where x->>'url'='https://raw.githubusercontent.com/linuxserver/templates/main/unraid/blender.xml') then
    raise exception 'Blender install options changed since review';
  end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=8192,ram_estimate_max_mb=32768,ram_estimate_kind='estimated',ram_estimate_confidence='medium',
    ram_estimate_basis='Estimated from Blender published minimum and recommended desktop memory; complex scenes and rendering can use more.',
    ram_source_urls=array['https://www.blender.org/download/requirements/','https://docs.linuxserver.io/images/docker-blender/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=500,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the application, settings, and project files. Textures, caches, and renders can increase storage use substantially.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-blender/','https://docs.blender.org/manual/en/latest/']::text[],
    checked_at=now(),updated_at=now()
  where e.app_id=v_blender and e.ram_estimate_min_mb=1024 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; active users and stored content vary.'
    and e.storage_estimate_min_gb=10 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; active users and stored content vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Blender estimates changed since review'; end if;

  update public.self_host_apps a set
    name='Blender',summary='3D creation suite for modeling, sculpting, animation, rendering, compositing, and video editing.',
    website_url='https://www.blender.org/',source_code_url='https://projects.blender.org/blender/blender',source_code_host='gitea',
    source_full_name='blender/blender',source_repo_id=null,source_archived=false,source_disabled=false,source_default_branch='main',
    source_checked_at=now(),source_latest_release='5.2.2 LTS',source_latest_release_at=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    docs_url='https://docs.blender.org/manual/en/latest/',install_docs_url='https://docs.linuxserver.io/images/docker-blender/',
    release_version='5.2.2 LTS',release_published_at=null,release_checked_at=now(),release_url='https://www.blender.org/download/',
    license='GNU General Public License v3.0 or later',license_spdx_id='GPL-3.0-or-later',license_type='copyleft',source_model='open_source',
    publisher_name='Blender Foundation',publisher_type='foundation',publisher_url='https://www.blender.org/about/foundation/',pricing_model='free',
    maintenance_status='active',docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/blender',
    docker_image='lscr.io/linuxserver/blender:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-blender/',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://www.blender.org/about/',summary_confidence='high',
    data_source_urls=array[
      'https://www.blender.org/about/','https://www.blender.org/about/foundation/','https://www.blender.org/about/license/',
      'https://www.blender.org/download/','https://www.blender.org/download/requirements/','https://projects.blender.org/blender/blender',
      'https://docs.blender.org/manual/en/latest/','https://docs.linuxserver.io/images/docker-blender/',
      'https://hub.docker.com/r/linuxserver/blender','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/blender.xml'
    ]::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Blender Foundation identifies Blender as GPL v3 or later.','source_urls',jsonb_build_array('https://www.blender.org/about/license/','https://projects.blender.org/blender/blender')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer documents a community Blender container.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer documents lscr.io/linuxserver/blender:latest.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose example for its community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented Blender desktop container has no external database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container maps /config for settings and local files; Blender projects and assets are user data.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/','https://docs.blender.org/manual/en/latest/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Blender is a desktop application; the LinuxServer image exposes its desktop in a browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The directory shows an estimate based on Blender published minimum and recommended memory; server and scene needs vary.','source_urls',jsonb_build_array('https://www.blender.org/download/requirements/')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate for the application and user files; projects, caches, and renders can grow substantially.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-blender/','https://docs.blender.org/manual/en/latest/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_blender;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Blender app update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/blender","note":"LinuxServer community image for Blender.","image":"lscr.io/linuxserver/blender:latest","label":"Community Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-blender/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-blender/","note":"LinuxServer provides a Compose example for its image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-blender/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/blender.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/blender.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/blender']::text[],docker_images=array['lscr.io/linuxserver/blender:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-blender/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/blender.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-blender/','https://hub.docker.com/r/linuxserver/blender','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/blender.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_blender and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Blender install options changed since review'; end if;

  delete from public.self_host_app_category_links where app_id=v_blender;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_blender,c.id from public.self_host_app_categories c where c.slug='photos-galleries';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Blender category update failed'; end if;

  select a.id into v_mylar
  from public.self_host_apps a
  where a.slug='mylar3' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/mylar3/mylar3' and a.license='GPL-3.0' and a.license_spdx_id='GPL-3.0'
    and a.source_model='open_source' and a.github_project_id='b30983aa-f1a4-4789-9816-091e215d3846'::uuid
    and a.docker_support='official' and a.compose_support is false and a.requires_database is null and a.persistent_storage is null;
  if v_mylar is null then raise exception 'Mylar3 record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_mylar;
  if v_categories is distinct from array['automation','ebooks-libraries']::text[] then
    raise exception 'Mylar3 categories changed since review';
  end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_mylar for update;
  if v_options is null or jsonb_array_length(v_options)<>0 then
    raise exception 'Mylar3 install options changed since review';
  end if;

  if exists(select 1 from public.github_projects gp where gp.owner='MylarComics' and gp.repo='mylar3') then
    raise exception 'Mylar3 upstream repository is now registered; review project metadata before applying';
  end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for a small comic library manager. Download activity, clients, and post-processing change memory use.',
    ram_source_urls=array['https://github.com/MylarComics/mylar3','https://docs.linuxserver.io/images/docker-mylar3/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=500,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for application data and a small-to-large comic library. The comics and downloads folders determine actual storage use.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-mylar3/','https://github.com/MylarComics/mylar3/wiki/Usage']::text[],
    checked_at=now(),updated_at=now()
  where e.app_id=v_mylar and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=50 and e.storage_estimate_max_gb=500
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Mylar3 estimates changed since review'; end if;

  update public.self_host_apps a set
    name='Mylar3',summary='Comic book library manager that tracks series and automates downloads from NZB and torrent clients.',
    website_url='https://mylar.nerdfirehurricane.com/',source_code_url='https://github.com/MylarComics/mylar3',source_code_host='github',
    source_full_name='MylarComics/mylar3',source_repo_id=null,source_archived=false,source_disabled=false,source_default_branch='stable',source_checked_at=now(),
    source_latest_release=null,source_latest_release_at=null,
    github_project_id=null,github_owner='MylarComics',github_repo='mylar3',github_full_name='MylarComics/mylar3',github_repo_id=null,
    github_node_id=null,github_owner_type='Organization',github_checked_at=now(),github_archived=false,github_disabled=false,
    github_is_fork=null,github_is_template=null,github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,
    github_primary_language=null,github_languages='{}'::jsonb,github_topics='{}'::text[],github_created_at=null,github_updated_at=null,
    github_pushed_at=null,github_last_commit_at=null,github_default_branch='stable',github_repo_size_kb=null,
    github_latest_release=null,github_latest_release_at=null,
    docs_url='https://mylar.nerdfirehurricane.com/',install_docs_url='https://docs.linuxserver.io/images/docker-mylar3/',
    release_version=null,release_published_at=null,release_checked_at=now(),release_url='https://github.com/MylarComics/mylar3/releases',
    license='GNU General Public License v3.0',license_spdx_id='GPL-3.0',license_type='copyleft',source_model='open_source',
    publisher_name='MylarComics community',publisher_type='community',publisher_url='https://github.com/MylarComics',pricing_model='free',
    docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/mylar3',docker_image='lscr.io/linuxserver/mylar3:latest',
    compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-mylar3/',requires_database=false,database_types=array['SQLite']::text[],
    persistent_storage=true,storage_profile='depends',deployment_methods=array['native','docker','compose','unraid']::text[],surfaces=array['web','api']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://github.com/MylarComics/mylar3',summary_confidence='high',
    data_source_urls=array[
      'https://github.com/MylarComics/mylar3','https://github.com/MylarComics/mylar3/blob/stable/LICENSE',
      'https://github.com/MylarComics/mylar3/blob/stable/README.md','https://github.com/MylarComics/mylar3/blob/stable/API_REFERENCE',
      'https://mylar.nerdfirehurricane.com/','https://docs.linuxserver.io/images/docker-mylar3/',
      'https://hub.docker.com/r/linuxserver/mylar3','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mylar3.xml',
      'https://github.com/MylarComics/mylar3/wiki/Usage'
    ]::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The maintained MylarComics repository identifies the application as GPL-3.0.','source_urls',jsonb_build_array('https://github.com/MylarComics/mylar3','https://github.com/MylarComics/mylar3/blob/stable/LICENSE')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer maintains a community container that follows the MylarComics fork.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-mylar3/','https://github.com/linuxserver/docker-mylar3')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The community image is lscr.io/linuxserver/mylar3:latest.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-mylar3/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose example for the community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-mylar3/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','Mylar stores local application data and does not require an external database service.','source_urls',jsonb_build_array('https://github.com/MylarComics/mylar3','https://docs.linuxserver.io/images/docker-mylar3/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container persists config, downloads, and the comics library in mapped folders.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-mylar3/','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mylar3.xml')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Mylar provides a web interface and an API reference.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-mylar3/','https://github.com/MylarComics/mylar3/blob/stable/API_REFERENCE')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate for a small library manager; download and post-processing activity change memory use.','source_urls',jsonb_build_array('https://github.com/MylarComics/mylar3','https://docs.linuxserver.io/images/docker-mylar3/')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate; the comics library and downloads determine actual storage use.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-mylar3/','https://github.com/MylarComics/mylar3/wiki/Usage'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_mylar;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Mylar3 app update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/MylarComics/mylar3","note":"Install from the maintained upstream repository using its README instructions.","image":null,"label":"Source install","method":"native","sort_order":5,"source_url":"https://github.com/MylarComics/mylar3/blob/stable/README.md","support_level":"official"},
      {"url":"https://hub.docker.com/r/linuxserver/mylar3","note":"LinuxServer community image for Mylar3.","image":"lscr.io/linuxserver/mylar3:latest","label":"Community Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-mylar3/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-mylar3/","note":"LinuxServer provides a Compose example for its image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-mylar3/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mylar3.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mylar3.xml","support_level":"community"}
    ]'::jsonb,
    native_urls=array['https://github.com/MylarComics/mylar3']::text[],docker_urls=array['https://hub.docker.com/r/linuxserver/mylar3']::text[],
    docker_images=array['lscr.io/linuxserver/mylar3:latest']::text[],compose_urls=array['https://docs.linuxserver.io/images/docker-mylar3/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mylar3.xml']::text[],
    source_urls=array['https://github.com/MylarComics/mylar3','https://docs.linuxserver.io/images/docker-mylar3/','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mylar3.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_mylar and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'Mylar3 install options changed since review'; end if;

  delete from public.self_host_app_category_links where app_id=v_mylar;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_mylar,c.id from public.self_host_app_categories c where c.slug in ('automation','ebooks-libraries');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception 'Mylar3 category update failed'; end if;

  select a.id into v_openvscode
  from public.self_host_apps a
  where a.slug='openvscode-server' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/linuxserver/docker-openvscode-server'
    and a.license='GNU Affero General Public License v3.0' and a.license_spdx_id='GPL-3.0'
    and a.source_model='open_source' and a.github_project_id='3db78f5e-1d13-4291-86df-ca83036a9093'::uuid
    and a.compose_support is false and a.requires_database is null and a.persistent_storage is null;
  if v_openvscode is null then raise exception 'OpenVSCode Server record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_openvscode;
  if v_categories is distinct from array['ai-ml','developer-tools','system-admin-hosting']::text[] then
    raise exception 'OpenVSCode Server categories changed since review';
  end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_openvscode for update;
  if v_options is null or jsonb_array_length(v_options)<>1
     or v_options->0->>'url' is distinct from 'https://hub.docker.com/r/linuxserver/openvscode-server' then
    raise exception 'OpenVSCode Server install options changed since review';
  end if;

  if exists(select 1 from public.github_projects gp where gp.owner='gitpod-io' and gp.repo='openvscode-server') then
    raise exception 'OpenVSCode Server upstream repository is now registered; review project metadata before applying';
  end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for a small-to-medium browser IDE workspace. Extensions, language servers, and builds increase memory use.',
    ram_source_urls=array['https://github.com/gitpod-io/openvscode-server','https://github.com/gitpod-io/openvscode-server#readme']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=50,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the server, workspace files, extensions, and common development tools. Project size and toolchains vary.',
    storage_source_urls=array['https://github.com/gitpod-io/openvscode-server#readme','https://hub.docker.com/r/gitpod/openvscode-server']::text[],
    checked_at=now(),updated_at=now()
  where e.app_id=v_openvscode and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'OpenVSCode Server estimates changed since review'; end if;

  update public.self_host_apps a set
    name='OpenVSCode Server',summary='Run Visual Studio Code on a server and use its development environment in a web browser.',
    website_url='https://github.com/gitpod-io/openvscode-server',source_code_url='https://github.com/gitpod-io/openvscode-server',source_code_host='github',
    source_full_name='gitpod-io/openvscode-server',source_repo_id=null,source_archived=false,source_disabled=false,source_default_branch='main',source_checked_at=now(),
    source_latest_release='openvscode-server-v1.109.5',source_latest_release_at=null,
    github_project_id=null,github_owner='gitpod-io',github_repo='openvscode-server',github_full_name='gitpod-io/openvscode-server',github_repo_id=null,
    github_node_id=null,github_owner_type='Organization',github_checked_at=now(),github_archived=false,github_disabled=false,
    github_is_fork=true,github_is_template=false,github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,
    github_primary_language=null,github_languages='{}'::jsonb,github_topics='{}'::text[],github_created_at=null,github_updated_at=null,
    github_pushed_at=null,github_last_commit_at=null,github_default_branch='main',github_repo_size_kb=null,
    github_latest_release='openvscode-server-v1.109.5',github_latest_release_at=null,
    docs_url='https://github.com/gitpod-io/openvscode-server#readme',install_docs_url='https://github.com/gitpod-io/openvscode-server#readme',
    release_version='v1.109.5',release_published_at=null,release_checked_at=now(),release_url='https://github.com/gitpod-io/openvscode-server/releases',
    license='MIT License',license_spdx_id='MIT',license_type='permissive',source_model='open_source',
    publisher_name='Gitpod',publisher_type='company',publisher_url='https://www.gitpod.io/',pricing_model='free',maintenance_status='active',
    docker_support='official',docker_url='https://hub.docker.com/r/gitpod/openvscode-server',docker_image='gitpod/openvscode-server:latest',
    compose_support=true,compose_url='https://github.com/gitpod-io/openvscode-server#readme',requires_database=false,database_types='{}'::text[],
    persistent_storage=true,storage_profile='depends',deployment_methods=array['native','docker','compose']::text[],surfaces=array['web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://github.com/gitpod-io/openvscode-server',summary_confidence='high',
    data_source_urls=array[
      'https://github.com/gitpod-io/openvscode-server','https://github.com/gitpod-io/openvscode-server/blob/main/LICENSE.txt',
      'https://github.com/gitpod-io/openvscode-server#readme','https://github.com/gitpod-io/openvscode-server/releases',
      'https://hub.docker.com/r/gitpod/openvscode-server','https://docs.linuxserver.io/deprecated_images/docker-openvscode-server/'
    ]::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream product metadata and license file identify OpenVSCode Server as MIT licensed.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server/blob/main/LICENSE.txt','https://github.com/gitpod-io/openvscode-server/blob/main/product.json')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream README documents the Gitpod OpenVSCode Server image.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme','https://hub.docker.com/r/gitpod/openvscode-server')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream image is gitpod/openvscode-server.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme','https://hub.docker.com/r/gitpod/openvscode-server')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The upstream README documents Compose entrypoint configuration for the official Docker image.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented OpenVSCode server deployment has no external database service.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream Docker example mounts the workspace directory for persistent project files.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','OpenVSCode Server is accessed through a web browser.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate; extensions, language servers, and builds drive actual memory needs.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate for workspace files and development tools; project size varies.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server#readme','https://hub.docker.com/r/gitpod/openvscode-server')),
      'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project release page lists v1.109.5 as its latest release when checked.','source_urls',jsonb_build_array('https://github.com/gitpod-io/openvscode-server/releases'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_openvscode;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'OpenVSCode Server app update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/gitpod-io/openvscode-server/releases","note":"Maintainer-published releases for native installation.","image":null,"label":"Native release","method":"native","sort_order":5,"source_url":"https://github.com/gitpod-io/openvscode-server#readme","support_level":"official"},
      {"url":"https://hub.docker.com/r/gitpod/openvscode-server","note":"Gitpod-maintained Docker image documented by the upstream project.","image":"gitpod/openvscode-server:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/gitpod-io/openvscode-server#readme","support_level":"official"},
      {"url":"https://github.com/gitpod-io/openvscode-server#readme","note":"The upstream README documents Compose entrypoint configuration for the Docker image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/gitpod-io/openvscode-server#readme","support_level":"official"}
    ]'::jsonb,
    native_urls=array['https://github.com/gitpod-io/openvscode-server/releases']::text[],
    docker_urls=array['https://hub.docker.com/r/gitpod/openvscode-server']::text[],docker_images=array['gitpod/openvscode-server:latest']::text[],
    compose_urls=array['https://github.com/gitpod-io/openvscode-server#readme']::text[],unraid_urls='{}'::text[],
    source_urls=array['https://github.com/gitpod-io/openvscode-server#readme','https://hub.docker.com/r/gitpod/openvscode-server','https://github.com/gitpod-io/openvscode-server/releases']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_openvscode and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'OpenVSCode Server install options changed since review'; end if;

  delete from public.self_host_app_category_links where app_id=v_openvscode;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_openvscode,c.id from public.self_host_app_categories c where c.slug='developer-tools';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'OpenVSCode Server category update failed'; end if;

  select a.id into v_unifi
  from public.self_host_apps a
  where a.slug='unifi-network-application' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/linuxserver/docker-unifi-network-application'
    and a.license='No license file declared (all rights reserved by default)' and a.license_spdx_id='GPL-3.0'
    and a.source_model='source_available' and a.github_project_id='76215c9a-8c13-41f5-9751-127fb02361b2'::uuid
    and a.compose_support is false and a.requires_database is null and a.persistent_storage is null;
  if v_unifi is null then raise exception 'UniFi Network Application record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_unifi;
  if v_categories is distinct from array['monitoring-status','networking-dns','system-admin-hosting']::text[] then
    raise exception 'UniFi Network Application categories changed since review';
  end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_unifi for update;
  if v_options is null or jsonb_array_length(v_options)<>2
     or not exists(select 1 from jsonb_array_elements(v_options) x where x->>'url'='https://hub.docker.com/r/linuxserver/unifi-network-application')
     or not exists(select 1 from jsonb_array_elements(v_options) x where x->>'url'='https://raw.githubusercontent.com/linuxserver/templates/main/unraid/unifi-network-application.xml') then
    raise exception 'UniFi Network Application install options changed since review';
  end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=2048,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for the legacy application with its external MongoDB service. Device count and database activity affect use.',
    ram_source_urls=array['https://docs.linuxserver.io/images/docker-unifi-network-application/','https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi']::text[],
    storage_estimate_min_gb=10,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for application configuration and MongoDB data. Managed devices and retained statistics affect growth.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-unifi-network-application/','https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi']::text[],
    checked_at=now(),updated_at=now()
  where e.app_id=v_unifi and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'UniFi Network Application estimates changed since review'; end if;

  update public.self_host_apps a set
    name='UniFi Network Application (Legacy)',summary='Legacy self-hosted controller for configuring and managing UniFi network devices; UniFi OS Server is the current self-hosting standard.',
    website_url='https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi',
    source_code_url=null,source_code_host='unknown',source_full_name=null,source_repo_id=null,source_archived=null,source_disabled=null,
    source_default_branch=null,source_latest_release=null,source_latest_release_at=null,source_checked_at=now(),
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,github_owner_type=null,
    github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    docs_url='https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi',
    install_docs_url='https://docs.linuxserver.io/images/docker-unifi-network-application/',
    license='Proprietary software under the Ubiquiti EULA',license_spdx_id=null,license_type='custom',source_model='closed_source',
    publisher_name='Ubiquiti Inc.',publisher_type='company',publisher_url='https://ui.com/',pricing_model='free',
    maintenance_status='active',docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/unifi-network-application',
    docker_image='lscr.io/linuxserver/unifi-network-application:latest',compose_support=true,
    compose_url='https://docs.linuxserver.io/images/docker-unifi-network-application/',requires_database=true,database_types=array['MongoDB']::text[],
    persistent_storage=true,storage_profile='depends',deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    release_version=null,release_published_at=null,release_checked_at=now(),release_url=null,
    summary_source='https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi',summary_confidence='high',
    data_source_urls=array[
      'https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi','https://help.ui.com/hc/en-us/articles/220066768--Legacy-Updating-and-Installing-Self-Hosted-UniFi-Network-Servers-Linux',
      'https://www.ui.com/eula/','https://docs.linuxserver.io/images/docker-unifi-network-application/',
      'https://hub.docker.com/r/linuxserver/unifi-network-application',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/unifi-network-application.xml'
    ]::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Ubiquiti EULA grants use of the software in object-code form only and limits reverse engineering to derive source.','source_urls',jsonb_build_array('https://www.ui.com/eula/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer documents a community container for the legacy Network Application.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The documented community image is lscr.io/linuxserver/unifi-network-application:latest.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose example for this image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The LinuxServer deployment requires an external MongoDB service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container maps /config and its Compose database example uses a persistent MongoDB data directory.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','UniFi Network Application provides a browser-based management interface.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate for the legacy application and its database; client count and activity affect use.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/','https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','The directory shows an estimate for configuration and MongoDB data; device count and retained statistics affect growth.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-unifi-network-application/','https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi')),
      'current_product',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Ubiquiti states UniFi OS Server is the current self-hosting standard and the Network Server is legacy.','source_urls',jsonb_build_array('https://help.ui.com/hc/en-us/articles/34210126298775-Self-Hosting-UniFi'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_unifi;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'UniFi Network Application update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/unifi-network-application","note":"LinuxServer community image for the legacy UniFi Network Application; it requires an external MongoDB service.","image":"lscr.io/linuxserver/unifi-network-application:latest","label":"Community Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-unifi-network-application/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-unifi-network-application/","note":"LinuxServer provides a Compose example with MongoDB configuration.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-unifi-network-application/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/unifi-network-application.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/unifi-network-application.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/unifi-network-application']::text[],
    docker_images=array['lscr.io/linuxserver/unifi-network-application:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-unifi-network-application/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/unifi-network-application.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-unifi-network-application/','https://hub.docker.com/r/linuxserver/unifi-network-application','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/unifi-network-application.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_unifi and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'UniFi Network Application install options changed since review'; end if;

  delete from public.self_host_app_category_links where app_id=v_unifi;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_unifi,c.id from public.self_host_app_categories c where c.slug in ('networking-dns','system-admin-hosting');
  get diagnostics v_affected=row_count;
  if v_affected<>2 then raise exception 'UniFi Network Application category update failed'; end if;
end
$migration$;

commit;
