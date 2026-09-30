begin;

do $migration$
declare
  v_app_id uuid;
  v_project_id uuid;
  current_categories text[];
  current_options jsonb;
  affected integer;
begin
  -- Docker Autoheal has its own MIT-licensed project and image. It has no web UI or saved app data.
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='autoheal' and a.published is true and a.self_hosting_status='self_hostable'
    and to_jsonb(a) @> '{
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"MIT",
      "source_model":"source_available",
      "docs_url":"https://github.com/willfarrell/docker-autoheal/issues",
      "install_docs_url":"https://github.com/willfarrell/docker-autoheal/issues",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'autoheal app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['monitoring-status','system-admin-hosting']::text[] then
    raise exception 'autoheal categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/willfarrell/autoheal'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/petersem/unraid-templates/main/autoheal/autoheal.xml' then
    raise exception 'autoheal install options changed since review';
  end if;
  update public.self_host_apps a set
    summary='Watches Docker health checks and restarts containers when they become unhealthy.',
    website_url='https://github.com/willfarrell/docker-autoheal',
    source_code_url='https://github.com/willfarrell/docker-autoheal', source_full_name='willfarrell/docker-autoheal',
    docs_url='https://github.com/willfarrell/docker-autoheal#readme',
    install_docs_url='https://github.com/willfarrell/docker-autoheal#readme',
    license='MIT', license_spdx_id='MIT', license_type='permissive', source_model='open_source',
    publisher_name='willfarrell', publisher_type='individual', publisher_url='https://github.com/willfarrell', pricing_model='free',
    docker_support='official', docker_url='https://hub.docker.com/r/willfarrell/autoheal', docker_image='willfarrell/autoheal:latest',
    compose_support=true, compose_url='https://github.com/willfarrell/docker-autoheal#readme',
    requires_database=false, database_types='{}', persistent_storage=false, storage_profile='tiny',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['cli']::text[],
    data_source_urls=array[
      'https://github.com/willfarrell/docker-autoheal',
      'https://github.com/willfarrell/docker-autoheal/blob/main/LICENSE',
      'https://github.com/willfarrell/docker-autoheal#readme',
      'https://hub.docker.com/r/willfarrell/autoheal',
      'https://raw.githubusercontent.com/petersem/unraid-templates/main/autoheal/autoheal.xml'
    ],
    summary_source='https://github.com/willfarrell/docker-autoheal#readme', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The upstream repository identifies an MIT license.","source_urls":["https://github.com/willfarrell/docker-autoheal/blob/main/LICENSE"]},
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README runs the willfarrell/autoheal image.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme","https://hub.docker.com/r/willfarrell/autoheal"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The upstream author documents willfarrell/autoheal:latest.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme"]},
      "compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The upstream README includes a Docker Compose example.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme"]},
      "database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"This container monitors Docker health and makes restart requests; it has no database service.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The documented setup has no persistent app-data volume; the optional certificate mount is read-only.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for a small Docker health monitor that checks every five seconds.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate covers the small image and ephemeral process files; there is no app-data volume.","source_urls":["https://github.com/willfarrell/docker-autoheal#readme"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'autoheal app update failed'; end if;
  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=16, ram_estimate_max_mb=128, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Small Docker health monitor checking containers every five seconds.',
    ram_source_urls=array['https://github.com/willfarrell/docker-autoheal#readme'],
    storage_estimate_min_gb=0.1, storage_estimate_max_gb=1, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Small image and ephemeral process files; no app-data volume.',
    storage_source_urls=array['https://github.com/willfarrell/docker-autoheal#readme'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'autoheal resource update failed'; end if;
  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/willfarrell/autoheal","note":"Image documented by the upstream project.","image":"willfarrell/autoheal:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/willfarrell/docker-autoheal#readme","support_level":"official"},
      {"url":"https://github.com/willfarrell/docker-autoheal#readme","note":"The upstream README includes a Compose example.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/willfarrell/docker-autoheal#readme","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/petersem/unraid-templates/main/autoheal/autoheal.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/petersem/unraid-templates/main/autoheal/autoheal.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/willfarrell/autoheal'], docker_images=array['willfarrell/autoheal:latest'],
    compose_urls=array['https://github.com/willfarrell/docker-autoheal#readme'],
    unraid_urls=array['https://raw.githubusercontent.com/petersem/unraid-templates/main/autoheal/autoheal.xml'],
    source_urls=array['https://github.com/willfarrell/docker-autoheal#readme','https://hub.docker.com/r/willfarrell/autoheal','https://raw.githubusercontent.com/petersem/unraid-templates/main/autoheal/autoheal.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'autoheal install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('automation','monitoring-status','system-admin-hosting');
  get diagnostics affected=row_count;
  if affected<>3 then raise exception 'autoheal category update failed'; end if;

  -- CouchPotato remains runnable, but the upstream application and LinuxServer image are archived.
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='couchpotato' and a.published is true and a.self_hosting_status='self_hostable'
    and a.github_project_id='d2bd1d5f-b91a-4f17-b79b-c8c847304718'::uuid
    and to_jsonb(a) @> '{
      "source_code_url":"https://github.com/linuxserver/docker-couchpotato",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"GPL-3.0",
      "source_model":"source_available",
      "docker_image":"lscr.io/linuxserver/couchpotato",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null,
      "maintenance_status":"archived"
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'couchpotato app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['search','system-admin-hosting','video-conferencing']::text[] then
    raise exception 'couchpotato categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/linuxserver/couchpotato'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/couchpotato.xml' then
    raise exception 'couchpotato install options changed since review';
  end if;

  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,disabled,license_spdx_id,checked_at,source_url)
  values('CouchPotato','CouchPotatoServer','CouchPotato/CouchPotatoServer','https://github.com/CouchPotato/CouchPotatoServer',1334821,'Organization','master',true,false,'GPL-3.0',now(),'https://github.com/CouchPotato/CouchPotatoServer')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    disabled=excluded.disabled,license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='CouchPotato' and gp.repo='CouchPotatoServer';

  update public.self_host_apps a set
    name='CouchPotato',
    summary='Finds wanted movies on NZB or torrent sources and sends the results to SABnzbd or a configured folder.',
    website_url='https://github.com/CouchPotato/CouchPotatoServer',
    source_code_url='https://github.com/CouchPotato/CouchPotatoServer', source_full_name='CouchPotato/CouchPotatoServer',
    source_repo_id='1334821', source_archived=true, source_default_branch='master', source_checked_at=now(),
    source_stars=null, source_forks=null, source_watchers=null, source_open_issues=null, source_languages='{}', source_topics='{}',
    source_is_fork=null, source_is_template=null, source_disabled=null, source_primary_language=null,
    source_created_at=null, source_updated_at=null, source_pushed_at=null, source_last_commit_at=null,
    source_latest_release=null, source_latest_release_at=null, source_repo_size_kb=null,
    github_project_id=v_project_id, github_owner='CouchPotato', github_repo='CouchPotatoServer', github_full_name='CouchPotato/CouchPotatoServer',
    github_repo_id=1334821, github_owner_type='Organization', github_archived=true, github_default_branch='master', github_checked_at=now(),
    github_stars=null, github_forks=null, github_watchers=null, github_open_issues=null, github_topics='{}', github_languages='{}',
    github_node_id=null, github_disabled=false, github_is_fork=null, github_is_template=null, github_primary_language=null,
    github_created_at=null, github_updated_at=null, github_pushed_at=null, github_last_commit_at=null,
    github_latest_release=null, github_latest_release_at=null, github_repo_size_kb=null,
    docs_url='https://github.com/CouchPotato/CouchPotatoServer#readme',
    install_docs_url='https://docs.linuxserver.io/deprecated_images/docker-couchpotato/',
    license='GPL-3.0', license_spdx_id='GPL-3.0', license_type='copyleft', source_model='open_source',
    publisher_name='CouchPotato', publisher_type='community', publisher_url='https://github.com/CouchPotato', pricing_model='free',
    docker_support='community', docker_url='https://hub.docker.com/r/linuxserver/couchpotato', docker_image='lscr.io/linuxserver/couchpotato:latest',
    compose_support=true, compose_url='https://docs.linuxserver.io/deprecated_images/docker-couchpotato/',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[], surfaces=array['web']::text[],
    data_source_urls=array[
      'https://github.com/CouchPotato/CouchPotatoServer',
      'https://github.com/CouchPotato/CouchPotatoServer/blob/master/license.txt',
      'https://github.com/CouchPotato/CouchPotatoServer#readme',
      'https://docs.linuxserver.io/deprecated_images/docker-couchpotato/',
      'https://github.com/linuxserver-archive/docker-couchpotato',
      'https://hub.docker.com/r/linuxserver/couchpotato',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/couchpotato.xml'
    ],
    summary_source='https://github.com/CouchPotato/CouchPotatoServer#readme', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The archived upstream application repository includes a GPL-3.0 license file.","source_urls":["https://github.com/CouchPotato/CouchPotatoServer/blob/master/license.txt"]},
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer documents its old CouchPotato image, but says it is deprecated and no longer updated.","source_urls":["https://docs.linuxserver.io/deprecated_images/docker-couchpotato/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The deprecated LinuxServer guide identifies lscr.io/linuxserver/couchpotato.","source_urls":["https://docs.linuxserver.io/deprecated_images/docker-couchpotato/"]},
      "compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The deprecated LinuxServer guide includes a Compose example for the old image.","source_urls":["https://docs.linuxserver.io/deprecated_images/docker-couchpotato/"]},
      "database":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The documented single-container setup has no separate database service.","source_urls":["https://docs.linuxserver.io/deprecated_images/docker-couchpotato/","https://github.com/CouchPotato/CouchPotatoServer#readme"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The container guide maps /config, downloads, and movies to persistent host folders.","source_urls":["https://docs.linuxserver.io/deprecated_images/docker-couchpotato/"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate for the archived Python web app and a small movie queue.","source_urls":["https://github.com/CouchPotato/CouchPotatoServer#readme"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate includes a small movie and download collection; media files can grow beyond it.","source_urls":["https://docs.linuxserver.io/deprecated_images/docker-couchpotato/"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'couchpotato app update failed'; end if;
  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256, ram_estimate_max_mb=1024, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Archived Python web app and a small movie queue.',
    ram_source_urls=array['https://github.com/CouchPotato/CouchPotatoServer#readme','https://docs.linuxserver.io/deprecated_images/docker-couchpotato/'],
    storage_estimate_min_gb=20, storage_estimate_max_gb=100, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='App config plus a small movie and download collection; stored media files drive growth.',
    storage_source_urls=array['https://docs.linuxserver.io/deprecated_images/docker-couchpotato/'], checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'couchpotato resource update failed'; end if;
  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/couchpotato","note":"Deprecated LinuxServer image; it is no longer maintained or updated.","image":"lscr.io/linuxserver/couchpotato:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/deprecated_images/docker-couchpotato/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/deprecated_images/docker-couchpotato/","note":"Compose example for the deprecated LinuxServer image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/deprecated_images/docker-couchpotato/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/couchpotato.xml","note":"Community Unraid template for the archived app.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/couchpotato.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/couchpotato'], docker_images=array['lscr.io/linuxserver/couchpotato:latest'],
    compose_urls=array['https://docs.linuxserver.io/deprecated_images/docker-couchpotato/'],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/couchpotato.xml'],
    source_urls=array['https://github.com/CouchPotato/CouchPotatoServer','https://docs.linuxserver.io/deprecated_images/docker-couchpotato/','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/couchpotato.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'couchpotato install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in('automation','media-servers','search');
  get diagnostics affected=row_count;
  if affected<>3 then raise exception 'couchpotato category update failed'; end if;

  -- NZBHydra2's repository LICENSE and README name different licenses, so list both and leave a single SPDX value unset.
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='nzbhydra2' and a.published is true and a.self_hosting_status='self_hostable'
    and a.github_project_id='c20663dd-1986-4943-9208-8ecf272ebdde'::uuid
    and to_jsonb(a) @> '{
      "source_code_url":"https://github.com/linuxserver/docker-nzbhydra2",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"GPL-3.0",
      "source_model":"source_available",
      "compose_support":false,
      "requires_database":null,
      "persistent_storage":null
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'nzbhydra2 app record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into current_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if current_categories is distinct from array['developer-tools','identity-access','search']::text[] then
    raise exception 'nzbhydra2 categories changed since review';
  end if;
  select io.options into current_options from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if current_options is null or jsonb_array_length(current_options)<>2
     or current_options->0->>'url' is distinct from 'https://hub.docker.com/r/linuxserver/nzbhydra2'
     or current_options->1->>'url' is distinct from 'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/nzbhydra2.xml' then
    raise exception 'nzbhydra2 install options changed since review';
  end if;

  insert into public.github_projects(owner,repo,full_name,repository_url,repo_id,owner_type,default_branch,archived,license_spdx_id,checked_at,source_url)
  values('theotherp','nzbhydra2','theotherp/nzbhydra2','https://github.com/theotherp/nzbhydra2',103616209,'User','master',false,'GPL-3.0',now(),'https://github.com/theotherp/nzbhydra2')
  on conflict(owner,repo) do update set
    full_name=excluded.full_name,repository_url=excluded.repository_url,repo_id=excluded.repo_id,
    owner_type=excluded.owner_type,default_branch=excluded.default_branch,archived=excluded.archived,
    license_spdx_id=excluded.license_spdx_id,checked_at=excluded.checked_at,source_url=excluded.source_url;
  select gp.id into v_project_id from public.github_projects gp where gp.owner='theotherp' and gp.repo='nzbhydra2';

  update public.self_host_apps a set
    name='NZBHydra 2', summary='Searches NZB indexers and torrent trackers and sends results to connected download tools.',
    website_url='https://github.com/theotherp/nzbhydra2',
    source_code_url='https://github.com/theotherp/nzbhydra2', source_full_name='theotherp/nzbhydra2',
    source_repo_id='103616209', source_archived=false, source_default_branch='master', source_checked_at=now(),
    source_stars=null, source_forks=null, source_watchers=null, source_open_issues=null, source_languages='{}', source_topics='{}',
    source_is_fork=null, source_is_template=null, source_disabled=null, source_primary_language=null,
    source_created_at=null, source_updated_at=null, source_pushed_at=null, source_last_commit_at=null,
    source_latest_release=null, source_latest_release_at=null, source_repo_size_kb=null,
    github_project_id=v_project_id, github_owner='theotherp', github_repo='nzbhydra2', github_full_name='theotherp/nzbhydra2',
    github_repo_id=103616209, github_owner_type='User', github_archived=false, github_default_branch='master', github_checked_at=now(),
    github_stars=null, github_forks=null, github_watchers=null, github_open_issues=null, github_topics='{}', github_languages='{}',
    github_node_id=null, github_disabled=null, github_is_fork=null, github_is_template=null, github_primary_language=null,
    github_created_at=null, github_updated_at=null, github_pushed_at=null, github_last_commit_at=null,
    github_latest_release=null, github_latest_release_at=null, github_repo_size_kb=null,
    docs_url='https://github.com/theotherp/nzbhydra2/wiki',
    install_docs_url='https://docs.linuxserver.io/images/docker-nzbhydra2/',
    license='GPL-3.0 (LICENSE); Apache-2.0 (README)', license_spdx_id=null, license_type='unknown', source_model='open_source',
    publisher_name='theotherp', publisher_type='individual', publisher_url='https://github.com/theotherp', pricing_model='free',
    docker_support='community', docker_url='https://hub.docker.com/r/linuxserver/nzbhydra2', docker_image='lscr.io/linuxserver/nzbhydra2:latest',
    compose_support=true, compose_url='https://docs.linuxserver.io/images/docker-nzbhydra2/',
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    deployment_methods=array['native','docker','compose','unraid']::text[], surfaces=array['web','api']::text[],
    data_source_urls=array[
      'https://github.com/theotherp/nzbhydra2',
      'https://github.com/theotherp/nzbhydra2/blob/master/LICENSE',
      'https://github.com/theotherp/nzbhydra2/blob/master/readme.md',
      'https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements',
      'https://github.com/theotherp/nzbhydra2/wiki/External-API%2C-RSS-and-cached-queries',
      'https://github.com/theotherp/nzbhydra2/releases',
      'https://docs.linuxserver.io/images/docker-nzbhydra2/',
      'https://hub.docker.com/r/linuxserver/nzbhydra2',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/nzbhydra2.xml'
    ],
    summary_source='https://github.com/theotherp/nzbhydra2#readme', summary_confidence='high', data_confidence='high',
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The repository LICENSE says GPL-3.0 while its README says Apache-2.0; the source files disagree, so both are listed without choosing one SPDX license.","source_urls":["https://github.com/theotherp/nzbhydra2/blob/master/LICENSE","https://github.com/theotherp/nzbhydra2/blob/master/readme.md"]},
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer documents its community container for NZBHydra 2.","source_urls":["https://docs.linuxserver.io/images/docker-nzbhydra2/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer documents lscr.io/linuxserver/nzbhydra2:latest.","source_urls":["https://docs.linuxserver.io/images/docker-nzbhydra2/"]},
      "compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer provides a Compose example for its image.","source_urls":["https://docs.linuxserver.io/images/docker-nzbhydra2/"]},
      "database":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The app stores its search history and stats locally; its documented container does not require a separate database service.","source_urls":["https://github.com/theotherp/nzbhydra2","https://docs.linuxserver.io/images/docker-nzbhydra2/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"LinuxServer maps /config for NZBHydra settings and its persistent data.","source_urls":["https://docs.linuxserver.io/images/docker-nzbhydra2/"]},
      "ram":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The author reports about 200 to 300 MB for NZBHydra 2 in a low-memory setup; indexer count and database size increase use.","source_urls":["https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"Estimate reflects persistent config, search history, and statistics; the author notes database size grows with indexers and retention.","source_urls":["https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements","https://docs.linuxserver.io/images/docker-nzbhydra2/"]}
    }'::jsonb,
    technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nzbhydra2 app update failed'; end if;
  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256, ram_estimate_max_mb=2048, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Upstream reports about 200 to 300 MB in a low-memory setup; larger databases need more.',
    ram_source_urls=array['https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements'],
    storage_estimate_min_gb=1, storage_estimate_max_gb=20, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='Persistent config, search history, and statistics; indexer count and retention drive growth.',
    storage_source_urls=array['https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements','https://docs.linuxserver.io/images/docker-nzbhydra2/'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nzbhydra2 resource update failed'; end if;
  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/theotherp/nzbhydra2/releases","note":"Official application releases; the upstream README explains native startup.","image":null,"label":"Native release","method":"native","sort_order":5,"source_url":"https://github.com/theotherp/nzbhydra2#readme","support_level":"official"},
      {"url":"https://hub.docker.com/r/linuxserver/nzbhydra2","note":"LinuxServer-maintained community image for the upstream app.","image":"lscr.io/linuxserver/nzbhydra2:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-nzbhydra2/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-nzbhydra2/","note":"LinuxServer provides a Compose example for its image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-nzbhydra2/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/nzbhydra2.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/nzbhydra2.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/nzbhydra2'], docker_images=array['lscr.io/linuxserver/nzbhydra2:latest'],
    compose_urls=array['https://docs.linuxserver.io/images/docker-nzbhydra2/'],
    native_urls=array['https://github.com/theotherp/nzbhydra2/releases'],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/nzbhydra2.xml'],
    source_urls=array['https://github.com/theotherp/nzbhydra2#readme','https://docs.linuxserver.io/images/docker-nzbhydra2/','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/nzbhydra2.xml'],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=current_options;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nzbhydra2 install option update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug='search';
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'nzbhydra2 category update failed'; end if;
end
$migration$;

commit;
