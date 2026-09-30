begin;

do $review_guard$
begin
  if (
    select count(*)
    from public.self_host_apps
    where slug in ('commentario','gitea','joplin','joplin-server','plane','sentry')
      and published=true and self_hosting_status='self_hostable'
  ) <> 6 then
    raise exception 'Batch 19 published app set changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='commentario'
      and source_code_url='https://github.com/Stirling-Tools/Stirling-PDF'
      and source_full_name='Stirling-Tools/Stirling-PDF'
      and publisher_name='Stirling-Tools'
      and docker_support='none'
      and requires_database is null
      and storage_profile='unknown'
  ) then
    raise exception 'Comentario identity snapshot changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='gitea'
      and docker_url='https://github.com/go-gitea/gitea/blob/HEAD/Dockerfile'
      and docker_image='gitea/gitea:1.27.2-rootless@sha256:c7953964c6e8fe532cf7fc3f3efdea1d0b161d7859c47e04f5e05489d494dea0'
      and database_types=array['mysql','mariadb']::text[]
      and release_version='v1.26.4'
  ) then
    raise exception 'Gitea snapshot changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='joplin'
      and source_model='open_source'
      and license='MIT'
      and docker_url='https://github.com/laurent22/joplin/blob/HEAD/docker-compose.db-dev.yml'
  ) then
    raise exception 'Joplin snapshot changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='joplin-server'
      and source_model='open_source'
      and license='AGPL-3.0'
      and docker_image='joplin/server:amd64-3.7.1'
      and compose_url is null
      and database_types=array['postgres','sqlite']::text[]
  ) then
    raise exception 'Joplin Server snapshot changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='plane'
      and website_url='http://plane.so'
      and docker_image='rabbitmq:3.13.7-management-alpine@sha256:0c64ec4fc5596406d755dcca75e8a3b618192cc5fb69f8f0340f06290b1cc08c'
      and release_version='v1.3.1'
  ) then
    raise exception 'Plane snapshot changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='sentry'
      and source_model='open_source'
      and license='Apache-2.0'
      and compose_support=false
      and release_version='26.6.0'
  ) then
    raise exception 'Sentry snapshot changed since review';
  end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='standardnotes-localstack'
      and published=true
      and self_hosting_status='self_hostable'
      and source_code_url='https://github.com/localstack/localstack'
      and docker_image='localstack/localstack:3.0'
  ) then
    raise exception 'Standard Notes helper snapshot changed since review';
  end if;

  if (
    select count(*) from public.self_host_app_resource_estimates e
    join public.self_host_apps a on a.id=e.app_id
    where (a.slug,e.ram_estimate_min_mb,e.ram_estimate_max_mb,e.storage_estimate_min_gb,e.storage_estimate_max_gb,
           e.ram_estimate_basis,e.storage_estimate_basis) in (
      ('commentario',2048,8192,50,500,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
      ('gitea',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
      ('joplin',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
      ('joplin-server',256,2048,50,500,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
      ('plane',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.'),
      ('sentry',256,2048,5,100,'Typical small self-hosted instance; workload and stored data vary.','Typical small self-hosted instance; workload and stored data vary.')
    )
  ) <> 6 then
    raise exception 'Batch 19 estimate rows changed since review';
  end if;

  if (
    select count(*)
    from public.self_host_app_install_options i
    join public.self_host_apps a on a.id=i.app_id
    where (a.slug='commentario' and i.options='[]'::jsonb)
       or (a.slug='gitea' and i.options @> '[{"method":"docker","image":"gitea/gitea:1.27.2-rootless@sha256:c7953964c6e8fe532cf7fc3f3efdea1d0b161d7859c47e04f5e05489d494dea0"}]'::jsonb
             and i.options @> '[{"method":"truenas_scale","url":"https://apps.truenas.com/catalog/gitea-act-runner_community/"}]'::jsonb)
       or (a.slug='joplin' and i.options @> '[{"method":"compose","url":"https://github.com/laurent22/joplin/blob/HEAD/docker-compose.db-dev.yml"}]'::jsonb)
       or (a.slug='joplin-server' and i.options @> '[{"method":"docker","image":"joplin/server:amd64-3.7.1"}]'::jsonb)
       or (a.slug='plane' and i.options @> '[{"method":"docker","image":"rabbitmq:3.13.7-management-alpine@sha256:0c64ec4fc5596406d755dcca75e8a3b618192cc5fb69f8f0340f06290b1cc08c"}]'::jsonb)
       or (a.slug='sentry' and i.options='[]'::jsonb)
       or (a.slug='standardnotes-localstack' and jsonb_array_length(i.options)=2
             and i.options @> '[{"method":"docker","image":"localstack/localstack:3.0"}]'::jsonb)
  ) <> 7 then
    raise exception 'Batch 19 install option snapshot changed since review';
  end if;
end;
$review_guard$;

update public.self_host_apps set
  summary='Self-hosted comment engine for adding moderated discussion threads to websites.',
  summary_source='https://docs.comentario.app/en/about/',
  summary_confidence='high',
  website_url='https://comentario.app/',
  source_code_url='https://gitlab.com/comentario/comentario',
  source_code_host='gitlab',
  source_full_name='comentario/comentario',
  source_model='open_source',
  license='MIT License',
  license_type='permissive',
  license_spdx_id='MIT',
  publisher_name='Comentario',
  publisher_type='community',
  publisher_url='https://gitlab.com/comentario',
  icon_url='https://tulgfrqamtcshdtmhvpx.supabase.co/storage/v1/object/public/stack127-media/directories/self-host-apps/icons/commentario-8052925fa51e221a.png',
  icon_source_url='https://gitlab.com/uploads/-/system/project/avatar/42486427/icon-128px.png?v=1790604450',
  docs_url='https://docs.comentario.app/en/about/',
  install_docs_url='https://docs.comentario.app/en/installation/',
  docker_url='https://docs.comentario.app/en/installation/docker-image/',
  docker_image='registry.gitlab.com/comentario/comentario:v3.18.0',
  docker_support='official',
  compose_support=false,
  compose_url=null,
  requires_database=true,
  database_types=array['sqlite','postgres']::text[],
  storage_profile='depends',
  persistent_storage=true,
  deployment_methods=array['docker','binary','helm']::text[],
  release_version='v3.18.0',
  release_url='https://gitlab.com/comentario/comentario/-/releases/v3.18.0',
  release_checked_at=now(),
  github_project_id=null,
  github_owner=null,github_repo=null,github_repo_id=null,github_node_id=null,github_full_name=null,github_owner_type=null,
  github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,github_topics=array[]::text[],
  github_created_at=null,github_updated_at=null,github_pushed_at=null,github_default_branch=null,github_repo_size_kb=null,
  github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
  github_latest_release=null,github_latest_release_at=null,github_last_commit_at=null,github_checked_at=null,
  source_repo_id=null,source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_primary_language=null,source_languages='{}'::jsonb,source_topics=array[]::text[],
  source_created_at=null,source_updated_at=null,source_pushed_at=null,source_default_branch=null,source_repo_size_kb=null,
  source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,
  source_latest_release=null,source_latest_release_at=null,source_last_commit_at=null,source_checked_at=null,
  data_source_urls=array[
    'https://comentario.app/','https://docs.comentario.app/en/about/','https://docs.comentario.app/en/about/source-code/',
    'https://docs.comentario.app/en/legal/license/','https://docs.comentario.app/en/installation/','https://docs.comentario.app/en/installation/requirements/',
    'https://docs.comentario.app/en/installation/docker-image/','https://docs.comentario.app/en/installation/binary-package/',
    'https://docs.comentario.app/en/installation/helm-chart/','https://gitlab.com/comentario/comentario',
    'https://gitlab.com/comentario/comentario/-/tags','https://gitlab.com/comentario/comentario/-/releases'
  ]::text[],
  technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Comentario identifies its GitLab source repository.','source_urls',jsonb_build_array('https://docs.comentario.app/en/about/source-code/','https://gitlab.com/comentario/comentario')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official license page declares MIT.','source_urls',jsonb_build_array('https://docs.comentario.app/en/legal/license/')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official site and GitLab group identify the Comentario project.','source_urls',jsonb_build_array('https://comentario.app/','https://gitlab.com/comentario')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project publishes Docker images in its GitLab Container Registry.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/docker-image/')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The v3.18.0 release image uses the official GitLab registry.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/docker-image/','https://gitlab.com/comentario/comentario/-/releases')),
    'compose',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The official install guide documents Docker, binaries, and Helm; no official Compose deployment is listed.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The installation requirements list SQLite and PostgreSQL.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/requirements/')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The database stores comments, users, and configuration.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/requirements/')),
    'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The directory range is estimated for a small comment service.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/requirements/')),
    'storage_capacity',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','Comment volume and database choice drive the directory estimate.','source_urls',jsonb_build_array('https://docs.comentario.app/en/installation/requirements/')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current GitLab release is v3.18.0.','source_urls',jsonb_build_array('https://gitlab.com/comentario/comentario/-/tags'))
  ),
  updated_at=now()
where slug='commentario';

update public.self_host_apps set
  publisher_name='Gitea',publisher_type='community',publisher_url='https://gitea.com/',
  docs_url='https://docs.gitea.com/',
  install_docs_url='https://docs.gitea.com/installation/install-with-docker/',
  docker_url='https://docs.gitea.com/installation/install-with-docker/',
  docker_image='docker.gitea.com/gitea:1.27.3',
  docker_support='official',compose_support=true,
  compose_url='https://docs.gitea.com/installation/install-with-docker/',
  database_types=array['sqlite','mysql','mariadb','postgres']::text[],
  storage_profile='depends',
  deployment_methods=array['docker','compose','truenas_scale','umbrel']::text[],
  release_version='v1.27.3',
  release_url='https://github.com/go-gitea/gitea/releases/tag/v1.27.3',
  release_checked_at=now(),
  ram_mb=null,
  data_source_urls=array[
    'https://gitea.com/','https://docs.gitea.com/','https://docs.gitea.com/installation/install-with-docker/',
    'https://docs.gitea.com/installation/install-with-docker-rootless/','https://docs.gitea.com/installation/database-prep/',
    'https://docs.gitea.com/administration/repo-indexer/','https://docs.gitea.com/usage/packages/overview/',
    'https://github.com/go-gitea/gitea','https://github.com/go-gitea/gitea/blob/main/LICENSE',
    'https://github.com/go-gitea/gitea/releases/tag/v1.27.3','https://apps.truenas.com/catalog/gitea_community/',
    'https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/gitea/docker-compose.yml',
    'https://github.com/getumbrel/umbrel-apps/tree/master/gitea'
  ]::text[],
  technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Gitea project repository is go-gitea/gitea.','source_urls',jsonb_build_array('https://gitea.com/','https://github.com/go-gitea/gitea')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository declares the MIT license.','source_urls',jsonb_build_array('https://github.com/go-gitea/gitea/blob/main/LICENSE')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Gitea identifies itself as the self-hosted Git service project.','source_urls',jsonb_build_array('https://gitea.com/')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Gitea documents its rootful and rootless Docker images.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/install-with-docker/','https://docs.gitea.com/installation/install-with-docker-rootless/')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official guide shows docker.gitea.com/gitea:1.27.3.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/install-with-docker/')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Docker guide includes a Docker Compose setup.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/install-with-docker/')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Gitea supports SQLite, PostgreSQL, MySQL, MariaDB, and MSSQL.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/database-prep/')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Docker guide mounts Gitea data at /data.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/install-with-docker/')),
    'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The directory range estimates a small Git service; indexing and concurrent use add load.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/install-with-docker/','https://docs.gitea.com/administration/repo-indexer/')),
    'storage_capacity',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','Repositories, LFS data, packages, and attachments drive the directory estimate.','source_urls',jsonb_build_array('https://docs.gitea.com/installation/install-with-docker/','https://docs.gitea.com/usage/packages/overview/')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current stable release is v1.27.3.','source_urls',jsonb_build_array('https://github.com/go-gitea/gitea/releases/tag/v1.27.3'))
  ),
  updated_at=now()
where slug='gitea';

update public.self_host_apps set
  summary='Note-taking and to-do app that can run in a browser through a community Docker image and sync with Joplin Server or other storage targets.',
  summary_source='https://joplinapp.org/',summary_confidence='high',
  source_code_url='https://github.com/laurent22/joplin',source_code_host='github',source_full_name='laurent22/joplin',
  source_model='open_source',license='AGPL-3.0-or-later',license_type='copyleft',license_spdx_id='AGPL-3.0-or-later',
  publisher_name='Laurent Cozic',publisher_type='individual',publisher_url='https://joplinapp.org/',
  docs_url='https://joplinapp.org/help/apps/web/',
  install_docs_url='https://docs.linuxserver.io/images/docker-joplin/',
  docker_url='https://docs.linuxserver.io/images/docker-joplin/',
  docker_image='lscr.io/linuxserver/joplin:latest',docker_support='community',
  compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-joplin/',
  requires_database=false,database_types=array[]::text[],storage_profile='depends',persistent_storage=true,
  deployment_methods=array['docker','compose','unraid']::text[],
  release_version='v3.7.21',release_url='https://github.com/laurent22/joplin/releases/tag/v3.7.21',release_checked_at=now(),
  ram_mb=null,
  data_source_urls=array[
    'https://joplinapp.org/','https://joplinapp.org/download/','https://joplinapp.org/help/apps/web/','https://joplinapp.org/help/apps/sync/',
    'https://github.com/laurent22/joplin','https://github.com/laurent22/joplin/blob/dev/LICENSE',
    'https://github.com/laurent22/joplin/releases/tag/v3.7.21','https://docs.linuxserver.io/images/docker-joplin/',
    'https://github.com/linuxserver/docker-joplin','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/joplin.xml'
  ]::text[],
  technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Joplin repository contains the app source.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The app code is licensed under AGPL-3.0-or-later.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/LICENSE')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official site identifies Joplin and carries Laurent Cozic copyright.','source_urls',jsonb_build_array('https://joplinapp.org/')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The LinuxServer community image runs Joplin Desktop in a browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer documents the lscr.io/linuxserver/joplin image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose example for its Joplin image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The desktop profile is stored in the container config directory and requires no separate database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The LinuxServer example mounts /config for settings and files.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/')),
    'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The directory range estimates a browser-streamed desktop session.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/')),
    'storage_capacity',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The persistent Joplin profile and note attachments drive the directory estimate.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-joplin/','https://joplinapp.org/help/apps/sync/')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current upstream desktop release is v3.7.21.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/releases/tag/v3.7.21'))
  ),
  updated_at=now()
where slug='joplin';

update public.self_host_apps set
  source_model='source_available',license='Joplin Server Personal Use License',license_type='custom',license_spdx_id=null,
  publisher_name='JOPLIN',publisher_type='company',publisher_url='https://joplinapp.org/',
  docs_url='https://github.com/laurent22/joplin/blob/dev/packages/server/README.md',
  install_docs_url='https://github.com/laurent22/joplin/blob/dev/packages/server/README.md',
  docker_url='https://hub.docker.com/r/joplin/server',docker_image='joplin/server:3.7.2',docker_support='official',
  compose_support=true,compose_url='https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml',
  requires_database=true,database_types=array['postgres']::text[],storage_profile='depends',persistent_storage=true,
  deployment_methods=array['docker','compose','truenas_scale']::text[],pricing_model='freemium',
  release_version='3.7.2',release_url='https://joplinapp.org/help/about/changelog/server/',release_checked_at=now(),
  ram_mb=null,
  data_source_urls=array[
    'https://joplinapp.org/','https://github.com/laurent22/joplin/blob/dev/packages/server/README.md',
    'https://github.com/laurent22/joplin/blob/dev/packages/server/LICENSE.md','https://github.com/laurent22/joplin/blob/dev/LICENSE',
    'https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml','https://hub.docker.com/r/joplin/server/tags',
    'https://joplinapp.org/help/apps/joplin_server_business/','https://joplinapp.org/help/about/changelog/server/',
    'https://apps.truenas.com/catalog/joplin_community/'
  ]::text[],
  technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Joplin Server source is in the Joplin repository.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/packages/server/README.md')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The server subdirectory declares the Joplin Server Personal Use License.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/packages/server/LICENSE.md')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The server license names JOPLIN as licensor.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/packages/server/LICENSE.md')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Joplin publishes its official server image.','source_urls',jsonb_build_array('https://hub.docker.com/r/joplin/server')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current official server image is tagged 3.7.2.','source_urls',jsonb_build_array('https://hub.docker.com/r/joplin/server/tags')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Joplin provides a server Compose file.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','PostgreSQL is recommended for production; SQLite is limited to testing and development.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/packages/server/README.md','https://joplinapp.org/help/apps/joplin_server_business/')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The server stores notes and attachments in its database, filesystem, or configured S3 storage.','source_urls',jsonb_build_array('https://github.com/laurent22/joplin/blob/dev/packages/server/README.md')),
    'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The directory estimate is calibrated to the separate Joplin Server Business hardware guidance.','source_urls',jsonb_build_array('https://joplinapp.org/help/apps/joplin_server_business/')),
    'storage_capacity',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The directory estimate is calibrated to Joplin Server Business guidance; attachments can require more storage.','source_urls',jsonb_build_array('https://joplinapp.org/help/apps/joplin_server_business/')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current Joplin Server release is 3.7.2.','source_urls',jsonb_build_array('https://joplinapp.org/help/about/changelog/server/'))
  ),
  updated_at=now()
where slug='joplin-server';

update public.self_host_apps set
  website_url='https://plane.so/',
  docs_url='https://developers.plane.so/self-hosting/editions-and-versions',
  install_docs_url='https://developers.plane.so/self-hosting/methods/docker-compose',
  docker_url='https://developers.plane.so/self-hosting/methods/docker-compose',
  docker_image=null,docker_support='official',compose_support=true,
  compose_url='https://developers.plane.so/self-hosting/methods/docker-compose',
  requires_database=true,database_types=array['postgres','redis']::text[],
  storage_profile='high',persistent_storage=true,
  deployment_methods=array['docker','compose','umbrel']::text[],
  publisher_name='Plane',publisher_type='company',publisher_url='https://plane.so/',
  release_version='v1.4.2',release_url='https://github.com/makeplane/plane/releases/tag/v1.4.2',release_checked_at=now(),
  ram_mb=null,
  data_source_urls=array[
    'https://plane.so/','https://developers.plane.so/self-hosting/editions-and-versions',
    'https://developers.plane.so/self-hosting/methods/docker-compose','https://developers.plane.so/self-hosting/plane-architecture',
    'https://github.com/makeplane/plane','https://github.com/makeplane/plane/releases/tag/v1.4.2',
    'https://github.com/getumbrel/umbrel-apps/tree/master/plane'
  ]::text[],
  technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plane Community Edition source is published in the makeplane/plane repository.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/editions-and-versions','https://github.com/makeplane/plane')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Community Edition is under AGPL v3.0; the commercial edition is closed source.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/editions-and-versions')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plane identifies the Community and Commercial editions on its official site.','source_urls',jsonb_build_array('https://plane.so/','https://developers.plane.so/self-hosting/editions-and-versions')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plane documents its official multi-service Docker Compose deployment.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/methods/docker-compose')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plane is deployed as multiple services rather than one RabbitMQ image.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/methods/docker-compose','https://developers.plane.so/self-hosting/plane-architecture')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plane provides an official Docker Compose install method.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/methods/docker-compose')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The stack uses PostgreSQL and Redis/Valkey, plus RabbitMQ for background jobs.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/plane-architecture','https://developers.plane.so/self-hosting/methods/docker-compose')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Plane persists its database and uploaded files; production can use external storage.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/methods/docker-compose','https://developers.plane.so/self-hosting/plane-architecture')),
    'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The estimate uses the official Compose guide baseline as a guide; that documented baseline is for the Commercial Edition.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/methods/docker-compose')),
    'storage_capacity',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','Uploads, database data, and backups drive the directory estimate.','source_urls',jsonb_build_array('https://developers.plane.so/self-hosting/methods/docker-compose')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current Plane Community Edition release is v1.4.2.','source_urls',jsonb_build_array('https://github.com/makeplane/plane/releases/tag/v1.4.2'))
  ),
  updated_at=now()
where slug='plane';

update public.self_host_apps set
  source_model='source_available',
  license='Functional Source License, Version 1.1, Apache 2.0 Future License',
  license_type='custom',license_spdx_id='FSL-1.1-Apache-2.0',
  publisher_name='Functional Software, Inc. dba Sentry',publisher_type='company',publisher_url='https://sentry.io/',
  docs_url='https://develop.sentry.dev/self-hosted/',install_docs_url='https://develop.sentry.dev/self-hosted/',
  docker_url='https://develop.sentry.dev/self-hosted/',docker_image=null,docker_support='official',
  compose_support=true,compose_url='https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml',
  requires_database=true,database_types=array['postgres','clickhouse','valkey']::text[],
  storage_profile='high',persistent_storage=true,
  ram_min_mb=4096,ram_recommended_mb=16384,storage_min_gb=20,resource_requirement_kind='official_minimum',
  release_version='26.9.0',release_url='https://github.com/getsentry/self-hosted/releases/tag/26.9.0',release_checked_at=now(),
  ram_mb=null,
  data_source_urls=array[
    'https://sentry.io/','https://github.com/getsentry/sentry/blob/master/LICENSE.md',
    'https://develop.sentry.dev/self-hosted/','https://github.com/getsentry/develop/blob/master/src/docs/self-hosted/index.mdx',
    'https://github.com/getsentry/self-hosted','https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml',
    'https://github.com/getsentry/self-hosted/releases/tag/26.9.0'
  ]::text[],
  technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Sentry source is available under the Functional Source License.','source_urls',jsonb_build_array('https://github.com/getsentry/sentry')),
    'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Sentry uses the Functional Source License 1.1 with an Apache 2.0 future license.','source_urls',jsonb_build_array('https://github.com/getsentry/sentry/blob/master/LICENSE.md')),
    'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The license identifies Functional Software, Inc.; Sentry is the product brand.','source_urls',jsonb_build_array('https://github.com/getsentry/sentry/blob/master/LICENSE.md','https://sentry.io/')),
    'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Sentry provides an official self-hosted Docker Compose deployment.','source_urls',jsonb_build_array('https://develop.sentry.dev/self-hosted/','https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml')),
    'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official self-hosted deployment is a multi-service stack, not a single app image.','source_urls',jsonb_build_array('https://develop.sentry.dev/self-hosted/','https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml')),
    'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official self-hosted guide starts the stack with Docker Compose.','source_urls',jsonb_build_array('https://develop.sentry.dev/self-hosted/')),
    'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official stack includes PostgreSQL, ClickHouse, and Valkey.','source_urls',jsonb_build_array('https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml')),
    'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Compose stack persists database, event, and file data.','source_urls',jsonb_build_array('https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml')),
    'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official guide lists 4 GB minimum and 16 GB recommended.','source_urls',jsonb_build_array('https://github.com/getsentry/develop/blob/master/src/docs/self-hosted/index.mdx')),
    'storage_capacity',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official guide recommends 20 GB free disk; retention and event volume affect growth.','source_urls',jsonb_build_array('https://github.com/getsentry/develop/blob/master/src/docs/self-hosted/index.mdx')),
    'release',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current self-hosted release is 26.9.0.','source_urls',jsonb_build_array('https://github.com/getsentry/self-hosted/releases/tag/26.9.0'))
  ),
  updated_at=now()
where slug='sentry';

update public.self_host_apps set
  name='Standard Notes LocalStack sidecar',
  summary='Unraid template that runs LocalStack as a dependency for Standard Notes Server.',
  summary_source='https://raw.githubusercontent.com/junkerderprovinz/unraid-apps/main/standardnotes-server/standardnotes-localstack.xml',
  summary_confidence='high',
  published=false,self_hosting_status='not_self_hostable',
  website_url=null,source_code_url=null,source_code_host='unknown',source_full_name=null,
  source_model='unknown',license=null,license_type='unknown',license_spdx_id=null,
  publisher_name=null,publisher_type='unknown',publisher_url=null,
  icon_url=null,icon_source_url=null,
  docs_url='https://github.com/junkerderprovinz/unraid-apps/blob/main/standardnotes-server/README.md',
  install_docs_url='https://github.com/junkerderprovinz/unraid-apps/blob/main/standardnotes-server/README.md',
  docker_url=null,docker_image=null,docker_support='none',compose_support=false,compose_url=null,
  requires_database=null,database_types=array[]::text[],storage_profile='unknown',persistent_storage=null,
  deployment_methods=array[]::text[],pricing_model='unknown',maintenance_status='unknown',
  release_version=null,release_published_at=null,release_checked_at=null,release_url=null,
  github_project_id=null,
  github_owner=null,github_repo=null,github_repo_id=null,github_node_id=null,github_full_name=null,github_owner_type=null,
  github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,github_topics=array[]::text[],
  github_created_at=null,github_updated_at=null,github_pushed_at=null,github_default_branch=null,github_repo_size_kb=null,
  github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
  github_latest_release=null,github_latest_release_at=null,github_last_commit_at=null,github_checked_at=null,
  source_repo_id=null,source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_primary_language=null,source_languages='{}'::jsonb,source_topics=array[]::text[],
  source_created_at=null,source_updated_at=null,source_pushed_at=null,source_default_branch=null,source_repo_size_kb=null,
  source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,
  source_latest_release=null,source_latest_release_at=null,source_last_commit_at=null,source_checked_at=null,
  data_source_urls=array[
    'https://github.com/junkerderprovinz/unraid-apps/blob/main/standardnotes-server/README.md',
    'https://raw.githubusercontent.com/junkerderprovinz/unraid-apps/main/standardnotes-server/standardnotes-localstack.xml'
  ]::text[],technical_fact_status='{}'::jsonb,
  updated_at=now()
where slug='standardnotes-localstack';

delete from public.self_host_app_category_links
where app_id=(select id from public.self_host_apps where slug='commentario');

insert into public.self_host_app_category_links(app_id,category_id)
select a.id,c.id
from public.self_host_apps a
cross join public.self_host_app_categories c
where a.slug='commentario' and c.slug in ('communication','content-publishing')
on conflict (app_id,category_id) do nothing;

delete from public.self_host_app_category_links
where app_id=(select id from public.self_host_apps where slug='standardnotes-localstack');

update public.self_host_app_resource_estimates e set
  ram_estimate_min_mb=r.ram_min,ram_estimate_max_mb=r.ram_max,ram_estimate_kind='estimated',
  ram_estimate_confidence=r.ram_confidence,ram_estimate_basis=r.ram_basis,ram_source_urls=r.ram_urls,ram_note=null,
  storage_estimate_min_gb=r.storage_min,storage_estimate_max_gb=r.storage_max,storage_estimate_kind='estimated',
  storage_estimate_confidence=r.storage_confidence,storage_estimate_basis=r.storage_basis,storage_source_urls=r.storage_urls,storage_note=null,
  checked_at=now(),updated_at=now()
from public.self_host_apps a
join (values
  ('commentario',256::numeric,1024::numeric,'medium','Small Go comment server; workload and database size drive resource use.',array['https://docs.comentario.app/en/about/','https://docs.comentario.app/en/installation/requirements/']::text[],
    1::numeric,20::numeric,'medium','Comment records, users, and the SQLite or PostgreSQL database grow with site traffic.',array['https://docs.comentario.app/en/installation/requirements/']::text[]),
  ('gitea',512::numeric,2048::numeric,'medium','Small team Git service; indexing, package registry, and concurrent use increase memory needs.',array['https://docs.gitea.com/installation/install-with-docker/','https://docs.gitea.com/administration/repo-indexer/']::text[],
    5::numeric,100::numeric,'medium','Git repositories, LFS objects, packages, and attachments drive storage growth under the persistent /data path.',array['https://docs.gitea.com/installation/install-with-docker/','https://docs.gitea.com/usage/packages/overview/']::text[]),
  ('joplin',2048::numeric,4096::numeric,'medium','Browser-streamed Electron desktop session; the LinuxServer example allocates 1 GB shared memory.',array['https://docs.linuxserver.io/images/docker-joplin/','https://github.com/linuxserver/docker-joplin']::text[],
    1::numeric,20::numeric,'medium','The Joplin profile and local notes live in persistent /config; attachments and sync history drive growth.',array['https://docs.linuxserver.io/images/docker-joplin/','https://joplinapp.org/help/apps/sync/']::text[]),
  ('joplin-server',4096::numeric,8192::numeric,'medium','Estimate for a small multi-user server, calibrated to Joplin Server Business hardware guidance.',array['https://github.com/laurent22/joplin/blob/dev/packages/server/README.md','https://joplinapp.org/help/apps/joplin_server_business/']::text[],
    50::numeric,100::numeric,'medium','The Business guidance lists a 50 GB SSD baseline; notes and attachments can use more local or S3 storage.',array['https://github.com/laurent22/joplin/blob/dev/packages/server/README.md','https://joplinapp.org/help/apps/joplin_server_business/']::text[]),
  ('plane',4096::numeric,8192::numeric,'medium','Estimate for a small multi-service Community stack, calibrated to Plane official Compose RAM guidance.',array['https://developers.plane.so/self-hosting/methods/docker-compose','https://developers.plane.so/self-hosting/editions-and-versions']::text[],
    20::numeric,200::numeric,'medium','Database data, uploads, and backups drive storage; Plane recommends external database and storage for production.',array['https://developers.plane.so/self-hosting/methods/docker-compose','https://developers.plane.so/self-hosting/plane-architecture']::text[]),
  ('sentry',4096::numeric,16384::numeric,'high','Sentry lists 4 GB minimum RAM and recommends 16 GB.',array['https://develop.sentry.dev/self-hosted/','https://github.com/getsentry/develop/blob/master/src/docs/self-hosted/index.mdx']::text[],
    20::numeric,100::numeric,'medium','The guide recommends 20 GB free disk; event volume and retention time increase storage use.',array['https://develop.sentry.dev/self-hosted/','https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml']::text[])
) as r(slug,ram_min,ram_max,ram_confidence,ram_basis,ram_urls,storage_min,storage_max,storage_confidence,storage_basis,storage_urls)
  on a.slug=r.slug
where e.app_id=a.id;

update public.self_host_app_install_options set
  docker_urls=array['https://docs.comentario.app/en/installation/docker-image/']::text[],
  docker_images=array['registry.gitlab.com/comentario/comentario:v3.18.0']::text[],
  compose_urls=array[]::text[],truenas_scale_urls=array[]::text[],unraid_urls=array[]::text[],umbrel_urls=array[]::text[],
  binary_urls=array['https://docs.comentario.app/en/installation/binary-package/']::text[],
  helm_urls=array['https://docs.comentario.app/en/installation/helm-chart/']::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://docs.comentario.app/en/installation/','https://docs.comentario.app/en/installation/docker-image/','https://docs.comentario.app/en/installation/binary-package/','https://docs.comentario.app/en/installation/helm-chart/']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"official","image":"registry.gitlab.com/comentario/comentario:v3.18.0","url":"https://docs.comentario.app/en/installation/docker-image/","source_url":"https://docs.comentario.app/en/installation/docker-image/","note":null,"sort_order":10},
    {"label":"Helm chart","method":"helm","support_level":"official","image":null,"url":"https://docs.comentario.app/en/installation/helm-chart/","source_url":"https://docs.comentario.app/en/installation/helm-chart/","note":null,"sort_order":50},
    {"label":"Binary package","method":"binary","support_level":"official","image":null,"url":"https://docs.comentario.app/en/installation/binary-package/","source_url":"https://docs.comentario.app/en/installation/binary-package/","note":null,"sort_order":80}
  ]'::jsonb,
  checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='commentario');

update public.self_host_app_install_options set
  docker_urls=array['https://docs.gitea.com/installation/install-with-docker/']::text[],
  docker_images=array['docker.gitea.com/gitea:1.27.3']::text[],
  compose_urls=array['https://docs.gitea.com/installation/install-with-docker/']::text[],
  truenas_scale_urls=array['https://apps.truenas.com/catalog/gitea_community/']::text[],
  unraid_urls=array[]::text[],
  umbrel_urls=array['https://github.com/getumbrel/umbrel-apps/tree/master/gitea']::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://docs.gitea.com/installation/install-with-docker/','https://docs.gitea.com/installation/database-prep/','https://apps.truenas.com/catalog/gitea_community/','https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/gitea/docker-compose.yml','https://github.com/getumbrel/umbrel-apps/tree/master/gitea']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"official","image":"docker.gitea.com/gitea:1.27.3","url":"https://docs.gitea.com/installation/install-with-docker/","source_url":"https://docs.gitea.com/installation/install-with-docker/","note":null,"sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"official","image":null,"url":"https://docs.gitea.com/installation/install-with-docker/","source_url":"https://docs.gitea.com/installation/install-with-docker/","note":"Official Compose setup.","sort_order":20},
    {"label":"TrueNAS SCALE catalog","method":"truenas_scale","support_level":"community","image":null,"url":"https://apps.truenas.com/catalog/gitea_community/","source_url":"https://apps.truenas.com/catalog/gitea_community/","note":"Community catalog package; publisher support is not implied.","sort_order":30},
    {"label":"Umbrel catalog","method":"umbrel","support_level":"community","image":null,"url":"https://github.com/getumbrel/umbrel-apps/tree/master/gitea","source_url":"https://github.com/getumbrel/umbrel-apps/tree/master/gitea","note":"Community Umbrel package; publisher support is not implied.","sort_order":70}
  ]'::jsonb,
  checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='gitea');

update public.self_host_app_install_options set
  docker_urls=array['https://docs.linuxserver.io/images/docker-joplin/']::text[],
  docker_images=array['lscr.io/linuxserver/joplin:latest']::text[],
  compose_urls=array['https://docs.linuxserver.io/images/docker-joplin/']::text[],
  unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/joplin.xml']::text[],
  truenas_scale_urls=array[]::text[],umbrel_urls=array[]::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://docs.linuxserver.io/images/docker-joplin/','https://github.com/linuxserver/docker-joplin','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/joplin.xml']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"community","image":"lscr.io/linuxserver/joplin:latest","url":"https://docs.linuxserver.io/images/docker-joplin/","source_url":"https://docs.linuxserver.io/images/docker-joplin/","note":"Community LinuxServer image; not published by the Joplin project.","sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"community","image":"lscr.io/linuxserver/joplin:latest","url":"https://docs.linuxserver.io/images/docker-joplin/","source_url":"https://docs.linuxserver.io/images/docker-joplin/","note":"Community LinuxServer Compose example.","sort_order":20},
    {"label":"Unraid template","method":"unraid","support_level":"community","image":"lscr.io/linuxserver/joplin:latest","url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/joplin.xml","source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/joplin.xml","note":"Community template for the LinuxServer image.","sort_order":35}
  ]'::jsonb,
  checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='joplin');

update public.self_host_app_install_options set
  docker_urls=array['https://hub.docker.com/r/joplin/server']::text[],
  docker_images=array['joplin/server:3.7.2']::text[],
  compose_urls=array['https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml']::text[],
  truenas_scale_urls=array['https://apps.truenas.com/catalog/joplin_community/']::text[],
  unraid_urls=array[]::text[],umbrel_urls=array[]::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://hub.docker.com/r/joplin/server/tags','https://github.com/laurent22/joplin/blob/dev/packages/server/README.md','https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml','https://apps.truenas.com/catalog/joplin_community/']::text[],
  options='[
    {"label":"Docker image","method":"docker","support_level":"official","image":"joplin/server:3.7.2","url":"https://hub.docker.com/r/joplin/server","source_url":"https://hub.docker.com/r/joplin/server/tags","note":null,"sort_order":10},
    {"label":"Docker Compose","method":"compose","support_level":"official","image":"joplin/server:3.7.2","url":"https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml","source_url":"https://github.com/laurent22/joplin/blob/dev/docker-compose.server.yml","note":"Use PostgreSQL for production; SQLite is for testing and development.","sort_order":20},
    {"label":"TrueNAS SCALE catalog","method":"truenas_scale","support_level":"community","image":null,"url":"https://apps.truenas.com/catalog/joplin_community/","source_url":"https://apps.truenas.com/catalog/joplin_community/","note":"Community catalog package; publisher support is not implied.","sort_order":30}
  ]'::jsonb,
  checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='joplin-server');

update public.self_host_app_install_options set
  docker_urls=array[]::text[],docker_images=array[]::text[],
  compose_urls=array['https://developers.plane.so/self-hosting/methods/docker-compose']::text[],
  truenas_scale_urls=array[]::text[],unraid_urls=array[]::text[],
  umbrel_urls=array['https://github.com/getumbrel/umbrel-apps/tree/master/plane']::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://developers.plane.so/self-hosting/methods/docker-compose','https://developers.plane.so/self-hosting/plane-architecture','https://github.com/getumbrel/umbrel-apps/tree/master/plane']::text[],
  options='[
    {"label":"Docker Compose","method":"compose","support_level":"official","image":null,"url":"https://developers.plane.so/self-hosting/methods/docker-compose","source_url":"https://developers.plane.so/self-hosting/methods/docker-compose","note":"Official multi-service deployment; Community and Commercial editions have separate release details.","sort_order":20},
    {"label":"Umbrel catalog","method":"umbrel","support_level":"community","image":null,"url":"https://github.com/getumbrel/umbrel-apps/tree/master/plane","source_url":"https://github.com/getumbrel/umbrel-apps/tree/master/plane","note":"Community Umbrel package; publisher support is not implied.","sort_order":70}
  ]'::jsonb,
  checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='plane');

update public.self_host_app_install_options set
  docker_urls=array[]::text[],docker_images=array[]::text[],
  compose_urls=array['https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml']::text[],
  truenas_scale_urls=array[]::text[],unraid_urls=array[]::text[],umbrel_urls=array[]::text[],
  catalog_sources='[]'::jsonb,
  source_urls=array['https://develop.sentry.dev/self-hosted/','https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml']::text[],
  options='[
    {"label":"Docker Compose","method":"compose","support_level":"official","image":null,"url":"https://develop.sentry.dev/self-hosted/","source_url":"https://github.com/getsentry/self-hosted/blob/master/docker-compose.yml","note":"The official install script configures the multi-service stack.","sort_order":20}
  ]'::jsonb,
  checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='sentry');

update public.self_host_app_install_options set
  docker_urls=array[]::text[],docker_images=array[]::text[],compose_urls=array[]::text[],
  truenas_scale_urls=array[]::text[],unraid_urls=array[]::text[],umbrel_urls=array[]::text[],
  catalog_sources='[]'::jsonb,source_urls=array[
    'https://github.com/junkerderprovinz/unraid-apps/blob/main/standardnotes-server/README.md',
    'https://raw.githubusercontent.com/junkerderprovinz/unraid-apps/main/standardnotes-server/standardnotes-localstack.xml'
  ]::text[],options='[]'::jsonb,checked_at=now(),updated_at=now()
where app_id=(select id from public.self_host_apps where slug='standardnotes-localstack');

do $post_update_guard$
begin
  if (select count(*) from public.self_host_apps where slug in ('commentario','gitea','joplin','joplin-server','plane','sentry') and published=true and self_hosting_status='self_hostable') <> 6 then
    raise exception 'Batch 19 app update check failed';
  end if;
  if (select count(*) from public.self_host_app_resource_estimates e join public.self_host_apps a on a.id=e.app_id
      where a.slug in ('commentario','gitea','joplin','joplin-server','plane','sentry')
        and e.ram_estimate_kind='estimated' and e.storage_estimate_kind='estimated'
        and e.ram_estimate_basis not like 'Typical small self-hosted instance%'
        and e.storage_estimate_basis not like 'Typical small self-hosted instance%') <> 6 then
    raise exception 'Batch 19 estimate update check failed';
  end if;
  if not exists(select 1 from public.self_host_apps where slug='standardnotes-localstack' and published=false and self_hosting_status='not_self_hostable') then
    raise exception 'Standard Notes helper removal check failed';
  end if;
  if exists(select 1 from public.self_host_app_category_links where app_id=(select id from public.self_host_apps where slug='standardnotes-localstack')) then
    raise exception 'Standard Notes helper category cleanup failed';
  end if;
end;
$post_update_guard$;

commit;
