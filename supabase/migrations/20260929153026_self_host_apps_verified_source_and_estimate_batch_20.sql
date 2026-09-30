begin;

do $review_guard$
begin
  if (select count(*) from public.self_host_apps where slug in ('acronis','active-streams','activepieces','activitywatch','actual','actual-budget','actual-ical','adbtuner') and published=true and self_hosting_status='self_hostable') <> 8 then
    raise exception 'Batch 20 app set changed since review';
  end if;

  if not exists (select 1 from public.self_host_apps where slug='acronis' and website_url is null and docker_image='acronisdocker/backup_agent:12960' and docker_support='community' and publisher_url='https://hub.docker.com/r/acronisdocker/backup_agent/') then
    raise exception 'Acronis snapshot changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='active-streams' and docker_support='unknown' and compose_support is null and release_version is null) then
    raise exception 'Active Streams snapshot changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='activepieces' and docker_image='ghcr.io/activepieces/activepieces:0.88.4@sha256:c9dc95bd13c216f75bb031d87f80af22d371e952e004b6080023c3e424d143b3' and release_version='0.86.2' and license='MIT') then
    raise exception 'Activepieces snapshot changed since review';
  end if;
  if not exists (
    select 1 from public.self_host_apps a
    join public.self_host_app_category_links l on l.app_id=a.id
    join public.self_host_app_categories c on c.id=l.category_id
    where a.slug='activitywatch' and c.slug='project-task-management'
  ) then
    raise exception 'ActivityWatch category snapshot changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='actual' and source_code_url='https://github.com/actualbudget/actual' and published=true)
     or not exists (select 1 from public.self_host_apps where slug='actual-budget' and source_code_url='https://github.com/actualbudget/actual' and published=true) then
    raise exception 'Actual duplicate identity snapshot changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='actual-budget' and docker_image='actualbudget/actual-server:26.8.1' and release_version='v26.7.0') then
    raise exception 'Actual Budget snapshot changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='actual-ical' and docker_support='community' and compose_support=false and website_url is null) then
    raise exception 'Actual iCal snapshot changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='adbtuner' and source_model='closed_source' and license is null and docker_support='community' and compose_support=false) then
    raise exception 'ADBTuner snapshot changed since review';
  end if;

  if (select count(*) from public.self_host_app_resource_estimates e join public.self_host_apps a on a.id=e.app_id
      where (a.slug,e.ram_estimate_min_mb,e.ram_estimate_max_mb,e.storage_estimate_min_gb,e.storage_estimate_max_gb,e.ram_estimate_basis,e.storage_estimate_basis) in (
        ('acronis',2048,8192,50,500,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
        ('active-streams',1024,8192,5,100,'Small single-node service; active users and stored content vary.','Small single-node service; active users and stored content vary.'),
        ('activepieces',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
        ('activitywatch',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
        ('actual-budget',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
        ('actual-ical',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
        ('adbtuner',2048,8192,1,20,'Small single-node service; active users and stored content vary.','Small single-node service; active users and stored content vary.')
      )) <> 7 then
    raise exception 'Batch 20 estimate rows changed since review';
  end if;

  if (select count(*) from public.self_host_app_install_options i join public.self_host_apps a on a.id=i.app_id
      where (a.slug='acronis' and i.options @> '[{"method":"docker","image":"acronisdocker/backup_agent:12960"}]'::jsonb and i.options @> '[{"method":"unraid"}]'::jsonb)
         or (a.slug='active-streams' and i.options @> '[{"method":"unraid","url":"https://raw.githubusercontent.com/gthrift/gthrift-unraid-ca/main/activestreams.xml"}]'::jsonb)
         or (a.slug='activepieces' and i.options @> '[{"method":"docker","image":"ghcr.io/activepieces/activepieces:0.88.4@sha256:c9dc95bd13c216f75bb031d87f80af22d371e952e004b6080023c3e424d143b3"}]'::jsonb and i.options @> '[{"method":"umbrel"}]'::jsonb)
         or (a.slug='activitywatch' and i.options='[]'::jsonb)
         or (a.slug='actual' and i.options @> '[{"method":"compose"}]'::jsonb)
         or (a.slug='actual-budget' and i.options @> '[{"method":"docker","image":"actualbudget/actual-server:26.8.1"}]'::jsonb)
         or (a.slug='actual-ical' and i.options @> '[{"method":"unraid"}]'::jsonb)
         or (a.slug='adbtuner' and i.options @> '[{"method":"docker","support_level":"community"}]'::jsonb)
  ) <> 8 then
    raise exception 'Batch 20 install-option snapshot changed since review';
  end if;
end;
$review_guard$;

insert into public.self_host_app_categories(slug,name,icon_key,sort_order) values
  ('media-device-control','media device control','tv',255),
  ('time-tracking','time tracking','activity',325)
on conflict (slug) do update set name=excluded.name,icon_key=excluded.icon_key,sort_order=excluded.sort_order,updated_at=now();

update public.self_host_apps a set
  summary='Manages backups and cyber protection for servers, workstations, and virtual machines from a locally installed console.',
  summary_source='https://www.acronis.com/en/products/cyber-protect/',summary_confidence='high',
  website_url='https://www.acronis.com/en/products/cyber-protect/',
  source_code_url=null,source_code_host='unknown',source_full_name=null,source_model='closed_source',
  license='Proprietary commercial subscription',license_type='custom',license_spdx_id=null,
  publisher_name='Acronis International GmbH',publisher_type='company',publisher_url='https://www.acronis.com/',
  docs_url='https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/',
  install_docs_url='https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html',
  docker_url='https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html',
  docker_image=null,docker_support='official',compose_support=false,compose_url=null,
  requires_database=true,database_types=array['sqlite','postgres']::text[],storage_profile='depends',persistent_storage=true,
  deployment_methods=array['docker','native']::text[],pricing_model='paid',
  release_version='17 Update 1',release_published_at=null,release_url='https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/',release_checked_at=now(),
  data_source_urls=array[
    'https://www.acronis.com/en/products/cyber-protect/','https://www.acronis.com/en/products/cyber-protect/licensing/local/',
    'https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/','https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/getting-started.html',
    'https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html',
    'https://dl.acronis.com/u/cyberprotect/guide/17/AcronisCyberProtect_17_userguide_en-US.pdf',
    'https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/backup.html','https://hub.docker.com/r/acronisdocker/backup_agent'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Acronis sells Cyber Protect as a commercial subscription.','source_urls',jsonb_build_array('https://www.acronis.com/en/products/cyber-protect/licensing/local/')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official product and support pages identify Acronis.','source_urls',jsonb_build_array('https://www.acronis.com/en/products/cyber-protect/')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Cyber Protect 17 has an official Docker install guide; it provides an image file to load locally.','source_urls',jsonb_build_array('https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Docker image is supplied as a local image file rather than a public registry tag.','source_urls',jsonb_build_array('https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html')),
    'compose',jsonb_build_object('status','unchecked','checked_at','2026-09-29','confidence','medium','note','The official install guide does not document a Compose deployment.','source_urls',jsonb_build_array('https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Docker install documentation describes its bundled PostgreSQL service and built-in SQLite option.','source_urls',jsonb_build_array('https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Docker install mounts persistent data volumes; backup archives require additional capacity.','source_urls',jsonb_build_array('https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html','https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/backup.html')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The reviewed on-premises edition is Cyber Protect 17 Update 1.','source_urls',jsonb_build_array('https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/'))
  ),updated_at=now()
where a.slug='acronis';

update public.self_host_apps a set
  summary='Adds an Unraid dashboard widget showing streams from Plex, Emby, and Jellyfin.',
  summary_source='https://github.com/gthrift/activestreams-unraid/blob/main/README.md',summary_confidence='high',
  website_url='https://github.com/gthrift/activestreams-unraid',
  source_code_url='https://github.com/gthrift/activestreams-unraid',source_code_host='github',source_full_name='gthrift/activestreams-unraid',
  source_model='open_source',license='MIT License',license_type='permissive',license_spdx_id='MIT',
  publisher_name='gthrift',publisher_type='community',publisher_url='https://github.com/gthrift',
  docs_url='https://github.com/gthrift/activestreams-unraid/blob/main/README.md',
  install_docs_url='https://github.com/gthrift/activestreams-unraid/blob/main/README.md',
  docker_url=null,docker_image=null,docker_support='none',compose_support=false,compose_url=null,
  requires_database=false,database_types=array[]::text[],storage_profile='low',persistent_storage=true,
  deployment_methods=array['unraid']::text[],release_version='2026.08.20',release_published_at=null,
  release_url='https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg',release_checked_at=now(),
  data_source_urls=array[
    'https://github.com/gthrift/activestreams-unraid','https://github.com/gthrift/activestreams-unraid/blob/main/README.md',
    'https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project repository contains the Unraid plugin source.','source_urls',jsonb_build_array('https://github.com/gthrift/activestreams-unraid')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository declares MIT.','source_urls',jsonb_build_array('https://github.com/gthrift/activestreams-unraid')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project is an Unraid plugin installed from a .plg file, not a container.','source_urls',jsonb_build_array('https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plugin settings and tokens persist in the Unraid plugin configuration directory.','source_urls',jsonb_build_array('https://github.com/gthrift/activestreams-unraid/blob/main/README.md')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The plugin file identifies version 2026.08.20.','source_urls',jsonb_build_array('https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg'))
  ),updated_at=now()
where a.slug='active-streams';

update public.self_host_apps a set
  summary='Automates work across apps and AI tools with visual workflows.',
  summary_source='https://www.activepieces.com/docs/overview/welcome',summary_confidence='high',
  website_url='https://www.activepieces.com/',
  source_code_url='https://github.com/activepieces/activepieces',source_code_host='github',source_full_name='activepieces/activepieces',
  source_model='open_source',license='MIT License for Community Edition; commercial license for Enterprise features',license_type='mixed',license_spdx_id=null,
  publisher_name='Activepieces',publisher_type='company',publisher_url='https://www.activepieces.com/',
  docs_url='https://www.activepieces.com/docs/overview/welcome',install_docs_url='https://www.activepieces.com/docs/install/options/docker-compose',
  docker_url='https://github.com/activepieces/activepieces/pkgs/container/activepieces',
  docker_image='ghcr.io/activepieces/activepieces:0.92.0',docker_support='official',compose_support=true,
  compose_url='https://github.com/activepieces/activepieces/blob/main/docker-compose.yml',
  requires_database=true,database_types=array['postgres','redis']::text[],storage_profile='depends',persistent_storage=true,
  deployment_methods=array['docker','compose','kubernetes']::text[],release_version='0.92.0',
  release_published_at=null,release_url='https://github.com/activepieces/activepieces/releases/tag/0.92.0',release_checked_at=now(),pricing_model='freemium',
  data_source_urls=array[
    'https://www.activepieces.com/','https://www.activepieces.com/docs/overview/welcome','https://www.activepieces.com/docs/install/options/docker-compose',
    'https://github.com/activepieces/activepieces','https://github.com/activepieces/activepieces/blob/main/LICENSE',
    'https://github.com/activepieces/activepieces/blob/main/docker-compose.yml','https://github.com/activepieces/activepieces/pkgs/container/activepieces',
    'https://github.com/activepieces/activepieces/releases/tag/0.92.0'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Community Edition is MIT-licensed; Enterprise features use a commercial license.','source_urls',jsonb_build_array('https://github.com/activepieces/activepieces/blob/main/LICENSE')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Activepieces operates the official project and registry package.','source_urls',jsonb_build_array('https://www.activepieces.com/','https://github.com/activepieces/activepieces/pkgs/container/activepieces')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Compose guide requires Docker Compose v2 and configures the app and worker services.','source_urls',jsonb_build_array('https://www.activepieces.com/docs/install/options/docker-compose')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official GHCR package publishes the Activepieces app image.','source_urls',jsonb_build_array('https://github.com/activepieces/activepieces/pkgs/container/activepieces')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official guide documents a Compose deployment with PostgreSQL and Redis.','source_urls',jsonb_build_array('https://www.activepieces.com/docs/install/options/docker-compose','https://github.com/activepieces/activepieces/blob/main/docker-compose.yml')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official self-hosted stack uses PostgreSQL and Redis.','source_urls',jsonb_build_array('https://www.activepieces.com/docs/install/options/docker-compose')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Workflow, run, and connection data persist in PostgreSQL.','source_urls',jsonb_build_array('https://github.com/activepieces/activepieces/blob/main/docker-compose.yml')),
    'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Compose guide recommends 4 GB RAM as a minimum.','source_urls',jsonb_build_array('https://www.activepieces.com/docs/install/options/docker-compose')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The latest reviewed release is 0.92.0.','source_urls',jsonb_build_array('https://github.com/activepieces/activepieces/releases/tag/0.92.0'))
  ),updated_at=now()
where a.slug='activepieces';

update public.self_host_apps a set
  summary='Tracks how you use your devices and stores activity on the device.',
  summary_source='https://activitywatch.net/',summary_confidence='high',
  website_url='https://activitywatch.net/',source_code_url='https://github.com/ActivityWatch/activitywatch',source_code_host='github',source_full_name='ActivityWatch/activitywatch',
  source_model='open_source',license='Mozilla Public License 2.0',license_type='copyleft',license_spdx_id='MPL-2.0',
  publisher_name='ActivityWatch',publisher_type='community',publisher_url='https://github.com/ActivityWatch',
  docs_url='https://docs.activitywatch.net/en/latest/',install_docs_url='https://docs.activitywatch.net/en/latest/getting-started.html',
  docker_url=null,docker_image=null,docker_support='unknown',compose_support=null,compose_url=null,
  requires_database=false,database_types=array['sqlite']::text[],storage_profile='depends',persistent_storage=true,
  deployment_methods=array['native']::text[],release_version='v0.13.2',release_published_at=null,release_url='https://github.com/ActivityWatch/activitywatch/releases',release_checked_at=now(),
  data_source_urls=array[
    'https://activitywatch.net/','https://activitywatch.net/downloads/','https://docs.activitywatch.net/en/latest/',
    'https://docs.activitywatch.net/en/latest/getting-started.html','https://docs.activitywatch.net/en/latest/directories.html',
    'https://github.com/ActivityWatch/activitywatch','https://github.com/ActivityWatch/activitywatch/blob/master/LICENSE.txt',
    'https://github.com/ActivityWatch/activitywatch/releases'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The ActivityWatch repository publishes the application source.','source_urls',jsonb_build_array('https://github.com/ActivityWatch/activitywatch')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository declares MPL-2.0.','source_urls',jsonb_build_array('https://github.com/ActivityWatch/activitywatch/blob/master/LICENSE.txt')),
    'docker',jsonb_build_object('status','unchecked','checked_at','2026-09-29','confidence','medium','note','The official installation guide recommends native desktop installation; no Docker install guide was verified.','source_urls',jsonb_build_array('https://docs.activitywatch.net/en/latest/getting-started.html')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','ActivityWatch stores its local event history in SQLite.','source_urls',jsonb_build_array('https://docs.activitywatch.net/en/latest/directories.html')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Activity history persists in local SQLite files.','source_urls',jsonb_build_array('https://docs.activitywatch.net/en/latest/directories.html')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The latest stable release is v0.13.2; v0.14.0b8 is a prerelease.','source_urls',jsonb_build_array('https://github.com/ActivityWatch/activitywatch/releases'))
  ),updated_at=now()
where a.slug='activitywatch';

update public.self_host_apps a set
  summary='Personal finance app for budgeting, account tracking, and transaction review.',
  summary_source='https://actualbudget.org/',summary_confidence='high',
  website_url='https://actualbudget.org/',source_code_url='https://github.com/actualbudget/actual',source_code_host='github',source_full_name='actualbudget/actual',
  source_model='open_source',license='MIT License',license_type='permissive',license_spdx_id='MIT',
  publisher_name='Actual Budget',publisher_type='community',publisher_url='https://actualbudget.org/',
  docs_url='https://actualbudget.org/docs/',install_docs_url='https://actualbudget.org/docs/install/docker/',
  docker_url='https://hub.docker.com/r/actualbudget/actual-server',docker_image='actualbudget/actual-server:26.9.0',docker_support='official',
  compose_support=true,compose_url='https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml',
  requires_database=false,database_types=array[]::text[],storage_profile='depends',persistent_storage=true,
  deployment_methods=array['docker','compose']::text[],release_version='v26.9.0',release_published_at=null,release_url='https://github.com/actualbudget/actual/releases/tag/v26.9.0',release_checked_at=now(),
  data_source_urls=array[
    'https://actualbudget.org/','https://actualbudget.org/docs/install/','https://actualbudget.org/docs/install/docker/','https://actualbudget.org/docs/config/',
    'https://github.com/actualbudget/actual','https://github.com/actualbudget/actual/blob/master/LICENSE.txt',
    'https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml',
    'https://github.com/actualbudget/actual/releases/tag/v26.9.0','https://hub.docker.com/r/actualbudget/actual-server'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Actual Budget source is published in the actualbudget/actual repository.','source_urls',jsonb_build_array('https://github.com/actualbudget/actual')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project declares the MIT license.','source_urls',jsonb_build_array('https://github.com/actualbudget/actual/blob/master/LICENSE.txt')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Actual documents its official server container and Compose setup.','source_urls',jsonb_build_array('https://actualbudget.org/docs/install/docker/')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official image is actualbudget/actual-server.','source_urls',jsonb_build_array('https://hub.docker.com/r/actualbudget/actual-server')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository includes a Compose file for the sync server.','source_urls',jsonb_build_array('https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Actual stores account metadata in SQLite; no separate database service is required.','source_urls',jsonb_build_array('https://actualbudget.org/docs/config/')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The /data directory persists the account database and budget files.','source_urls',jsonb_build_array('https://actualbudget.org/docs/install/docker/')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The latest reviewed release is v26.9.0.','source_urls',jsonb_build_array('https://github.com/actualbudget/actual/releases/tag/v26.9.0'))
  ),updated_at=now()
where a.slug='actual-budget';

update public.self_host_apps a set
  name='Actual iCal',summary='Turns Actual Budget scheduled transactions into an iCalendar feed.',
  summary_source='https://github.com/matheusvellone/actual-ical#usage',summary_confidence='high',
  website_url='https://github.com/matheusvellone/actual-ical',source_code_url='https://github.com/matheusvellone/actual-ical',source_code_host='github',source_full_name='matheusvellone/actual-ical',
  source_model='open_source',license='MIT License',license_type='permissive',license_spdx_id='MIT',
  publisher_name='matheusvellone',publisher_type='community',publisher_url='https://github.com/matheusvellone',
  docs_url='https://github.com/matheusvellone/actual-ical#usage',install_docs_url='https://github.com/matheusvellone/actual-ical#usage',
  docker_url='https://github.com/matheusvellone/actual-ical/pkgs/container/actual-ical',docker_image='ghcr.io/matheusvellone/actual-ical:latest',docker_support='community',
  compose_support=true,compose_url='https://github.com/matheusvellone/actual-ical#usage',requires_database=false,database_types=array[]::text[],
  storage_profile='low',persistent_storage=true,deployment_methods=array['docker','compose','unraid']::text[],release_version=null,release_published_at=null,release_url=null,release_checked_at=null,
  data_source_urls=array[
    'https://github.com/matheusvellone/actual-ical','https://github.com/matheusvellone/actual-ical#usage',
    'https://github.com/matheusvellone/actual-ical#configuration','https://github.com/matheusvellone/actual-ical/blob/main/LICENSE',
    'https://github.com/matheusvellone/actual-ical/releases','https://github.com/matheusvellone/actual-ical/pkgs/container/actual-ical',
    'https://raw.githubusercontent.com/DevlinDelFuego/unraid-templates/main/actual-ics/actual-ics.xml'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Actual iCal source is published in its GitHub repository.','source_urls',jsonb_build_array('https://github.com/matheusvellone/actual-ical')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository declares MIT.','source_urls',jsonb_build_array('https://github.com/matheusvellone/actual-ical/blob/main/LICENSE')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository documents a community image and Docker run command.','source_urls',jsonb_build_array('https://github.com/matheusvellone/actual-ical#usage')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository includes a Compose example.','source_urls',jsonb_build_array('https://github.com/matheusvellone/actual-ical#usage')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','A cache directory is mounted for persistent API cache and settings.','source_urls',jsonb_build_array('https://github.com/matheusvellone/actual-ical#configuration'))
  ),updated_at=now()
where a.slug='actual-ical';

update public.self_host_apps a set
  summary='Controls Android TV and Google TV devices over ADB to open apps and tune channels.',
  summary_source='https://adbtuner.github.io/',summary_confidence='high',
  website_url='https://adbtuner.github.io/',source_code_url=null,source_code_host='unknown',source_full_name=null,source_model='closed_source',
  license='All rights reserved (pending open-source release)',license_type='custom',license_spdx_id=null,
  publisher_name='turtletank',publisher_type='individual',publisher_url='https://community.getchannels.com/u/turtletank/summary',
  docs_url='https://adbtuner.github.io/',install_docs_url='https://adbtuner.github.io/',
  docker_url='https://hub.docker.com/r/turtletank99/adbtuner',docker_image='turtletank99/adbtuner:stable',docker_support='official',
  compose_support=true,compose_url='https://adbtuner.github.io/',requires_database=false,database_types=array[]::text[],
  storage_profile='low',persistent_storage=true,deployment_methods=array['docker','compose','unraid']::text[],release_version=null,release_published_at=null,release_url=null,release_checked_at=null,
  data_source_urls=array[
    'https://adbtuner.github.io/','https://community.getchannels.com/t/adbtuner-a-channel-tuning-application-for-networked-google-tv-android-tv-devices/36822',
    'https://hub.docker.com/r/turtletank99/adbtuner','https://hub.docker.com/u/turtletank99',
    'https://community.getchannels.com/u/turtletank/summary','https://raw.githubusercontent.com/timstephens24/docker-templates/master/timstephens24/ADBTuner.xml'
  ]::text[],
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The publisher states all rights reserved pending an open-source release.','source_urls',jsonb_build_array('https://adbtuner.github.io/')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project page and creator profile identify the ADBTuner publisher.','source_urls',jsonb_build_array('https://adbtuner.github.io/','https://community.getchannels.com/u/turtletank/summary')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project page documents the publisher Docker image.','source_urls',jsonb_build_array('https://adbtuner.github.io/','https://hub.docker.com/r/turtletank99/adbtuner')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project page documents Docker Compose deployment.','source_urls',jsonb_build_array('https://adbtuner.github.io/')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The app stores settings and device configuration in files, without a separate database service.','source_urls',jsonb_build_array('https://adbtuner.github.io/')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The /app/.config volume retains settings and ADB key files.','source_urls',jsonb_build_array('https://adbtuner.github.io/'))
  ),updated_at=now()
where a.slug='adbtuner';

update public.self_host_apps set published=false,updated_at=now() where slug='actual';

delete from public.self_host_app_category_links where app_id in (
  select id from public.self_host_apps where slug in ('acronis','active-streams','activepieces','activitywatch','actual-budget','actual-ical','adbtuner')
);
insert into public.self_host_app_category_links(app_id,category_id)
select a.id,c.id from (values
  ('acronis','storage-backup'),('acronis','security-privacy'),
  ('active-streams','dashboards'),('active-streams','monitoring-status'),
  ('activepieces','automation'),('activepieces','developer-tools'),
  ('activitywatch','time-tracking'),('actual-budget','finance-budgeting'),
  ('actual-ical','finance-budgeting'),('actual-ical','calendars-contacts'),
  ('adbtuner','media-device-control')
) v(slug,category_slug)
join public.self_host_apps a on a.slug=v.slug
join public.self_host_app_categories c on c.slug=v.category_slug
on conflict(app_id,category_id) do nothing;
delete from public.self_host_app_category_links where app_id=(select id from public.self_host_apps where slug='actual');

update public.self_host_app_install_options set
  docker_urls=array['https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html']::text[],
  docker_images=array[]::text[],compose_urls=array[]::text[],unraid_urls=array[]::text[],
  native_urls=array['https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/']::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/','https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html']::text[],
  options='[
    {"label":"Docker install","method":"docker","support_level":"official","image":null,"url":"https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html","source_url":"https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/docker-installing-management-server.html","note":"The publisher supplies a local image file to load into Docker.","sort_order":10},
    {"label":"Native install","method":"native","support_level":"official","image":null,"url":"https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/","source_url":"https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/","note":"On-premises Windows and Linux installation is also available.","sort_order":80}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='acronis');

update public.self_host_app_install_options set
  docker_urls=array[]::text[],docker_images=array[]::text[],compose_urls=array[]::text[],
  unraid_urls=array['https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg']::text[],
  catalog_sources='[]'::jsonb,source_urls=array['https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg']::text[],
  options='[
    {"label":"Unraid plugin","method":"unraid","support_level":"official","image":null,"url":"https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg","source_url":"https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg","note":"Install the plugin from the project repository.","sort_order":35}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='active-streams');

update public.self_host_app_install_options set
  docker_urls=array['https://github.com/activepieces/activepieces/pkgs/container/activepieces']::text[],
  docker_images=array['ghcr.io/activepieces/activepieces:0.92.0']::text[],
  compose_urls=array['https://www.activepieces.com/docs/install/options/docker-compose']::text[],
  umbrel_urls=array[]::text[],catalog_sources='[]'::jsonb,
  source_urls=array['https://www.activepieces.com/docs/install/options/docker-compose','https://github.com/activepieces/activepieces/pkgs/container/activepieces','https://github.com/activepieces/activepieces/blob/main/docker-compose.yml']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"official","image":"ghcr.io/activepieces/activepieces:0.92.0","url":"https://github.com/activepieces/activepieces/pkgs/container/activepieces","source_url":"https://github.com/activepieces/activepieces/pkgs/container/activepieces","note":null,"sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"official","image":null,"url":"https://www.activepieces.com/docs/install/options/docker-compose","source_url":"https://github.com/activepieces/activepieces/blob/main/docker-compose.yml","note":"Includes PostgreSQL and Redis services.","sort_order":20}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='activepieces');

update public.self_host_app_install_options set
  docker_urls=array[]::text[],docker_images=array[]::text[],compose_urls=array[]::text[],native_urls=array['https://docs.activitywatch.net/en/latest/getting-started.html']::text[],
  catalog_sources='[]'::jsonb,source_urls=array['https://docs.activitywatch.net/en/latest/getting-started.html']::text[],
  options='[
    {"label":"Native app","method":"native","support_level":"official","image":null,"url":"https://docs.activitywatch.net/en/latest/getting-started.html","source_url":"https://docs.activitywatch.net/en/latest/getting-started.html","note":"Official desktop installation for supported operating systems.","sort_order":80}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='activitywatch');

update public.self_host_app_install_options set
  docker_urls=array[]::text[],docker_images=array[]::text[],compose_urls=array[]::text[],
  truenas_scale_urls=array[]::text[],unraid_urls=array[]::text[],umbrel_urls=array[]::text[],catalog_sources='[]'::jsonb,
  source_urls=array[]::text[],options='[]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='actual');

update public.self_host_app_install_options set
  docker_urls=array['https://hub.docker.com/r/actualbudget/actual-server']::text[],
  docker_images=array['actualbudget/actual-server:26.9.0']::text[],
  compose_urls=array['https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml']::text[],
  truenas_scale_urls=array[]::text[],
  source_urls=array['https://actualbudget.org/docs/install/docker/','https://hub.docker.com/r/actualbudget/actual-server','https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"official","image":"actualbudget/actual-server:26.9.0","url":"https://hub.docker.com/r/actualbudget/actual-server","source_url":"https://hub.docker.com/r/actualbudget/actual-server","note":null,"sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"official","image":null,"url":"https://actualbudget.org/docs/install/docker/","source_url":"https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml","note":"Budget data persists in the mounted /data directory.","sort_order":20}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='actual-budget');

update public.self_host_app_install_options set
  docker_urls=array['https://github.com/matheusvellone/actual-ical/pkgs/container/actual-ical']::text[],
  docker_images=array['ghcr.io/matheusvellone/actual-ical:latest']::text[],
  compose_urls=array['https://github.com/matheusvellone/actual-ical#usage']::text[],
  unraid_urls=array['https://raw.githubusercontent.com/DevlinDelFuego/unraid-templates/main/actual-ics/actual-ics.xml']::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://github.com/matheusvellone/actual-ical#usage','https://github.com/matheusvellone/actual-ical/pkgs/container/actual-ical','https://raw.githubusercontent.com/DevlinDelFuego/unraid-templates/main/actual-ics/actual-ics.xml']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"community","image":"ghcr.io/matheusvellone/actual-ical:latest","url":"https://github.com/matheusvellone/actual-ical/pkgs/container/actual-ical","source_url":"https://github.com/matheusvellone/actual-ical/pkgs/container/actual-ical","note":"Community image maintained with the project.","sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"community","image":null,"url":"https://github.com/matheusvellone/actual-ical#usage","source_url":"https://github.com/matheusvellone/actual-ical#usage","note":"Community Compose example.","sort_order":20},
    {"label":"Unraid template","method":"unraid","support_level":"community","image":"ghcr.io/matheusvellone/actual-ical:latest","url":"https://raw.githubusercontent.com/DevlinDelFuego/unraid-templates/main/actual-ics/actual-ics.xml","source_url":"https://raw.githubusercontent.com/DevlinDelFuego/unraid-templates/main/actual-ics/actual-ics.xml","note":"Community-maintained template.","sort_order":35}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='actual-ical');

update public.self_host_app_install_options set
  docker_urls=array['https://hub.docker.com/r/turtletank99/adbtuner']::text[],
  docker_images=array['turtletank99/adbtuner:stable']::text[],
  compose_urls=array['https://adbtuner.github.io/']::text[],
  unraid_urls=array['https://raw.githubusercontent.com/timstephens24/docker-templates/master/timstephens24/ADBTuner.xml']::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://adbtuner.github.io/','https://hub.docker.com/r/turtletank99/adbtuner','https://raw.githubusercontent.com/timstephens24/docker-templates/master/timstephens24/ADBTuner.xml']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"official","image":"turtletank99/adbtuner:stable","url":"https://hub.docker.com/r/turtletank99/adbtuner","source_url":"https://hub.docker.com/r/turtletank99/adbtuner","note":"Publisher image for ADBTuner.","sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"official","image":null,"url":"https://adbtuner.github.io/","source_url":"https://adbtuner.github.io/","note":"Compose setup is documented by the publisher.","sort_order":20},
    {"label":"Unraid template","method":"unraid","support_level":"community","image":"turtletank99/adbtuner:stable","url":"https://raw.githubusercontent.com/timstephens24/docker-templates/master/timstephens24/ADBTuner.xml","source_url":"https://raw.githubusercontent.com/timstephens24/docker-templates/master/timstephens24/ADBTuner.xml","note":"Community Unraid template.","sort_order":35}
  ]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='adbtuner');

update public.self_host_app_resource_estimates e set
  ram_estimate_min_mb=r.ram_min,ram_estimate_max_mb=r.ram_max,ram_estimate_kind='estimated',ram_estimate_confidence=r.confidence,
  ram_estimate_basis=r.ram_basis,ram_source_urls=array[r.source1,r.source2,r.source3]::text[],
  storage_estimate_min_gb=r.storage_min,storage_estimate_max_gb=r.storage_max,storage_estimate_kind='estimated',storage_estimate_confidence=r.confidence,
  storage_estimate_basis=r.storage_basis,storage_source_urls=array[r.source1,r.source2,r.source3]::text[],checked_at=now(),updated_at=now()
from public.self_host_apps a join (values
  ('acronis',8192,16384,100,1000,'low','Estimate for a small on-prem backup server, calibrated to Acronis guidance of 8 GiB for a protection appliance and 16 GiB for heavier backup workloads.','Estimate assumes a small backup environment; backup archives grow with protected data and retention.','https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/before-you-start-nutanix.html','https://dl.acronis.com/u/cyberprotect/guide/17/AcronisCyberProtect_17_userguide_en-US.pdf','https://www.acronis.com/en/support/documentation/AcronisCyberProtect_17/backup.html'),
  ('active-streams',64,256,1,2,'low','Small Unraid plugin polls configured media-server APIs and renders a dashboard widget; no media is stored by the plugin.','Plugin files and its small settings and server-token files persist in Unraid plugin configuration.','https://github.com/gthrift/activestreams-unraid','https://github.com/gthrift/activestreams-unraid/blob/main/activestreams.plg','https://github.com/gthrift/activestreams-unraid/blob/main/README.md'),
  ('activepieces',4096,8192,10,50,'medium','The official Compose guide lists 4 GB RAM as a minimum; the upper range allows a small workflow workload and worker processes.','Flows, run history, connections, PostgreSQL, and encryption-key configuration persist; run volume and retention drive growth.','https://www.activepieces.com/docs/install/options/docker-compose','https://github.com/activepieces/activepieces/blob/main/docker-compose.yml','https://www.activepieces.com/docs/install/options/docker-compose'),
  ('activitywatch',128,512,1,20,'low','Personal desktop tracker runs a local server, watchers, and web UI; enabled watchers and history queries change memory use.','Continuous app, window, browser, and AFK history is stored in local SQLite files.','https://activitywatch.net/','https://docs.activitywatch.net/en/latest/getting-started.html','https://docs.activitywatch.net/en/latest/directories.html'),
  ('actual-budget',256,1024,1,20,'medium','Small Node.js finance server for personal or household budgets; concurrent clients and imports can raise use.','The persistent /data directory stores SQLite account metadata and budget files; transaction history and backups drive growth.','https://actualbudget.org/docs/install/docker/','https://actualbudget.org/docs/config/','https://github.com/actualbudget/actual/blob/master/packages/sync-server/docker-compose.yml'),
  ('actual-ical',128,512,1,5,'low','Small iCalendar feed service reads scheduled transactions from Actual; sync activity and cache size drive use.','The persistent volume stores Actual API cache data and settings, not the full budget archive.','https://github.com/matheusvellone/actual-ical#usage','https://github.com/matheusvellone/actual-ical#configuration','https://github.com/matheusvellone/actual-ical#configuration'),
  ('adbtuner',128,512,1,5,'low','Small web service stores device and channel settings and sends ADB commands; connected devices and interactions affect load.','Persistent config holds channel lists, app settings, and ADB key files; video streams are not stored by the app.','https://adbtuner.github.io/','https://hub.docker.com/r/turtletank99/adbtuner','https://adbtuner.github.io/')
) as r(slug,ram_min,ram_max,storage_min,storage_max,confidence,ram_basis,storage_basis,source1,source2,source3) on a.slug=r.slug
where e.app_id=a.id;

do $post_update_guard$
begin
  if (select count(*) from public.self_host_apps where slug in ('acronis','active-streams','activepieces','activitywatch','actual-budget','actual-ical','adbtuner') and published=true and self_hosting_status='self_hostable') <> 7 then
    raise exception 'Batch 20 app corrections failed';
  end if;
  if not exists(select 1 from public.self_host_apps where slug='actual' and published=false) then
    raise exception 'Actual duplicate cleanup failed';
  end if;
  if (select count(*) from public.self_host_app_resource_estimates e join public.self_host_apps a on a.id=e.app_id
      where a.slug in ('acronis','active-streams','activepieces','activitywatch','actual-budget','actual-ical','adbtuner')
        and e.ram_estimate_kind='estimated' and e.storage_estimate_kind='estimated'
        and e.ram_estimate_basis not like 'Typical small self-hosted instance%'
        and e.storage_estimate_basis not like 'Typical small self-hosted instance%') <> 7 then
    raise exception 'Batch 20 estimate update check failed';
  end if;
  if (select count(*) from public.self_host_apps a join public.self_host_app_category_links l on l.app_id=a.id join public.self_host_app_categories c on c.id=l.category_id
      where (a.slug='activitywatch' and c.slug='time-tracking') or (a.slug='adbtuner' and c.slug='media-device-control')) <> 2 then
    raise exception 'Batch 20 category update check failed';
  end if;
end;
$post_update_guard$;

commit;
