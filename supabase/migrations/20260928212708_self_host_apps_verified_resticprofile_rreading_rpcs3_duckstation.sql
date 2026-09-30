begin;

do $migration$
declare
  v_resticprofile uuid;
  v_rreading uuid;
  v_rpcs3 uuid;
  v_duckstation uuid;
  v_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_resticprofile
  from public.self_host_apps a
  where a.slug='resticprofile' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='resticprofile'
    and a.summary='Configuration profile manager for organizing and running Restic backup jobs.'
    and a.source_model='source_available' and a.source_code_url='https://github.com/creativeprojects/resticprofile'
    and a.website_url is null and a.license='No license file declared (all rights reserved by default)'
    and a.license_type='copyleft' and a.license_spdx_id='GPL-3.0'
    and a.docker_support='community' and a.docker_image='alexycodes/resticprofile'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null
    and a.database_types='{}'::text[] and a.persistent_storage is null and a.surfaces=array['web']::text[]
    and a.github_project_id='338bd79f-b15b-4bdd-ab4f-96ba0c66fd31'::uuid;
  if v_resticprofile is null then raise exception 'resticprofile record changed since review'; end if;

  select a.id into v_rreading
  from public.self_host_apps a
  where a.slug='rreading-glasses' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='rreading-glasses'
    and a.summary='Metadata service that helps Readarr-compatible libraries find books and audiobooks.'
    and a.source_model='source_available' and a.source_code_url='https://github.com/blampe/rreading-glasses'
    and a.website_url is null and a.license='No license file declared (all rights reserved by default)'
    and a.license_type='copyleft' and a.license_spdx_id='GPL-3.0'
    and a.docker_support='community' and a.docker_image='blampe/rreading-glasses:latest'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null
    and a.database_types='{}'::text[] and a.persistent_storage is null and a.surfaces=array['web']::text[]
    and a.github_project_id='f5c8dcdc-c309-436b-b113-0178174cd995'::uuid;
  if v_rreading is null then raise exception 'rreading-glasses record changed since review'; end if;

  select a.id into v_rpcs3
  from public.self_host_apps a
  where a.slug='rpcs3' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='rpcs3'
    and a.summary='Emulator and debugger for Sony PlayStation 3 games on desktop operating systems.'
    and a.source_model='source_available' and a.source_code_url='https://github.com/linuxserver/docker-rpcs3'
    and a.website_url is null and a.license='No license file declared (all rights reserved by default)'
    and a.license_type='copyleft' and a.license_spdx_id='GPL-3.0'
    and a.docker_support='community' and a.docker_image='lscr.io/linuxserver/rpcs3'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null
    and a.database_types='{}'::text[] and a.persistent_storage is null and a.surfaces=array['web']::text[]
    and a.github_project_id='9502b615-6063-4853-8761-e89cd477f4a7'::uuid;
  if v_rpcs3 is null then raise exception 'RPCS3 record changed since review'; end if;

  select a.id into v_duckstation
  from public.self_host_apps a
  where a.slug='duckstation' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='duckstation'
    and a.summary='DuckStation is a PS1 Emulator aiming for the best accuracy and game support.'
    and a.source_model='source_available' and a.source_code_url='https://github.com/linuxserver/docker-duckstation'
    and a.website_url is null and a.license='No license file declared (all rights reserved by default)'
    and a.license_type='copyleft' and a.license_spdx_id='GPL-3.0'
    and a.docker_support='community' and a.docker_image='lscr.io/linuxserver/duckstation'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null
    and a.database_types='{}'::text[] and a.persistent_storage is null and a.surfaces=array['web']::text[]
    and a.github_project_id='c452b683-e01d-448b-92bb-96791c5ac288'::uuid;
  if v_duckstation is null then raise exception 'DuckStation record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_resticprofile;
  if v_categories is distinct from array['ai-ml','databases','storage-backup']::text[] then raise exception 'resticprofile categories changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_rreading;
  if v_categories is distinct from array['databases','ebooks-libraries','identity-access']::text[] then raise exception 'rreading-glasses categories changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_rpcs3;
  if v_categories is distinct from array['storage-backup']::text[] then raise exception 'RPCS3 categories changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_duckstation;
  if v_categories is distinct from array['ai-ml','games']::text[] then raise exception 'DuckStation categories changed since review'; end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_resticprofile for update;
  if v_options is distinct from $resticprofile_old$[
    {"url":"https://hub.docker.com/r/alexycodes/resticprofile","note":"Community-maintained image. Verify the publisher before pulling.","image":"alexycodes/resticprofile","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/alexycodes/resticprofile","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml","support_level":"community"}
  ]$resticprofile_old$::jsonb then raise exception 'resticprofile install options changed since review'; end if;
  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_rreading for update;
  if v_options is distinct from $rreading_old$[
    {"url":"https://hub.docker.com/r/blampe/rreading-glasses","note":"Community-maintained image. Verify the publisher before pulling.","image":"blampe/rreading-glasses:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/blampe/rreading-glasses","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml","support_level":"community"}
  ]$rreading_old$::jsonb then raise exception 'rreading-glasses install options changed since review'; end if;
  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_rpcs3 for update;
  if v_options is distinct from $rpcs3_old$[
    {"url":"https://hub.docker.com/r/linuxserver/rpcs3","note":"Community-maintained image. Verify the publisher before pulling.","image":"lscr.io/linuxserver/rpcs3","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/orgs/linuxserver/packages/container/package/rpcs3","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml","support_level":"community"}
  ]$rpcs3_old$::jsonb then raise exception 'RPCS3 install options changed since review'; end if;
  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_duckstation for update;
  if v_options is distinct from $duckstation_old$[
    {"url":"https://hub.docker.com/r/linuxserver/duckstation","note":"Community-maintained image. Verify the publisher before pulling.","image":"lscr.io/linuxserver/duckstation","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/orgs/linuxserver/packages/container/package/duckstation","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml","support_level":"community"}
  ]$duckstation_old$::jsonb then raise exception 'DuckStation install options changed since review'; end if;

  update public.self_host_apps a set
    name='resticprofile',summary='Configuration manager and scheduler for Restic backup jobs.',
    website_url='https://creativeprojects.github.io/resticprofile/',source_code_url='https://github.com/creativeprojects/resticprofile',source_code_host='github',
    github_owner='creativeprojects',github_repo='resticprofile',github_full_name='creativeprojects/resticprofile',source_full_name='creativeprojects/resticprofile',
    docs_url='https://creativeprojects.github.io/resticprofile/',install_docs_url='https://creativeprojects.github.io/resticprofile/installation/docker/index.html',
    docker_url='https://hub.docker.com/r/creativeprojects/resticprofile',
    license='GNU General Public License v3.0',license_type='copyleft',license_spdx_id='GPL-3.0',source_model='open_source',
    publisher_name='CreativeProjects',publisher_type='community',publisher_url='https://github.com/creativeprojects',pricing_model='free',
    docker_support='official',docker_image='creativeprojects/resticprofile:latest',compose_support=true,
    compose_url='https://github.com/creativeprojects/resticprofile/tree/master/contrib/schedule-in-docker',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',surfaces=array['cli']::text[],
    deployment_methods=array['binary','docker','unraid']::text[],release_url='https://github.com/creativeprojects/resticprofile/releases',
    summary_source='https://github.com/creativeprojects/resticprofile',summary_confidence='high',
    data_source_urls=array['https://github.com/creativeprojects/resticprofile','https://github.com/creativeprojects/resticprofile/blob/master/LICENSE','https://creativeprojects.github.io/resticprofile/','https://creativeprojects.github.io/resticprofile/installation/docker/index.html','https://creativeprojects.github.io/resticprofile/installation/binaries/index.html','https://creativeprojects.github.io/resticprofile/usage/memory/index.html','https://hub.docker.com/r/creativeprojects/resticprofile','https://github.com/creativeprojects/resticprofile/tree/master/contrib/schedule-in-docker','https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream repository identifies GPL-3.0.','source_urls',jsonb_build_array('https://github.com/creativeprojects/resticprofile/blob/master/LICENSE')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official project documentation publishes the CreativeProjects Docker image.','source_urls',jsonb_build_array('https://creativeprojects.github.io/resticprofile/installation/docker/index.html','https://hub.docker.com/r/creativeprojects/resticprofile')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official image is creativeprojects/resticprofile:latest.','source_urls',jsonb_build_array('https://creativeprojects.github.io/resticprofile/installation/docker/index.html')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream repository includes a Docker Compose scheduling example.','source_urls',jsonb_build_array('https://creativeprojects.github.io/resticprofile/installation/docker/index.html','https://github.com/creativeprojects/resticprofile/tree/master/contrib/schedule-in-docker')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','This command-line backup manager uses configuration files and Restic repositories.','source_urls',jsonb_build_array('https://github.com/creativeprojects/resticprofile','https://creativeprojects.github.io/resticprofile/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Docker setup mounts the configuration, backup source, and optional local destination.','source_urls',jsonb_build_array('https://creativeprojects.github.io/resticprofile/installation/docker/index.html')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','resticprofile is a command-line tool and scheduler.','source_urls',jsonb_build_array('https://github.com/creativeprojects/resticprofile')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM range is an estimate for the tool and backup workload.','source_urls',jsonb_build_array('https://creativeprojects.github.io/resticprofile/usage/memory/index.html')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage range is an estimate for a local backup repository; remote targets use remote storage.','source_urls',jsonb_build_array('https://creativeprojects.github.io/resticprofile/installation/docker/index.html'))
    ),updated_at=now()
  where a.id=v_resticprofile;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'resticprofile app update failed'; end if;

  update public.self_host_apps a set
    name='rreading-glasses',summary='Book and audiobook metadata service for Readarr-compatible apps.',
    website_url='https://github.com/blampe/rreading-glasses',source_code_url='https://github.com/blampe/rreading-glasses',source_code_host='github',
    github_owner='blampe',github_repo='rreading-glasses',github_full_name='blampe/rreading-glasses',source_full_name='blampe/rreading-glasses',
    docs_url='https://github.com/blampe/rreading-glasses#readme',install_docs_url='https://github.com/blampe/rreading-glasses#self-hosting',
    docker_url='https://hub.docker.com/r/blampe/rreading-glasses',
    license='GNU General Public License v3.0',license_type='copyleft',license_spdx_id='GPL-3.0',source_model='open_source',
    publisher_name='blampe',publisher_type='individual',publisher_url='https://github.com/blampe',pricing_model='free',
    docker_support='official',docker_image='blampe/rreading-glasses:latest',compose_support=true,
    compose_url='https://github.com/blampe/rreading-glasses/blob/master/docker-compose-gr.yml',
    requires_database=true,database_types=array['PostgreSQL']::text[],persistent_storage=true,storage_profile='low',surfaces=array['api']::text[],
    deployment_methods=array['docker','unraid']::text[],release_url='https://github.com/blampe/rreading-glasses/releases',
    summary_source='https://github.com/blampe/rreading-glasses',summary_confidence='high',
    data_source_urls=array['https://github.com/blampe/rreading-glasses','https://github.com/blampe/rreading-glasses/blob/master/LICENSE','https://github.com/blampe/rreading-glasses#self-hosting','https://github.com/blampe/rreading-glasses/blob/master/docker-compose-gr.yml','https://github.com/blampe/rreading-glasses/blob/master/docker-compose-hardcover.yml','https://hub.docker.com/r/blampe/rreading-glasses','https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream repository identifies GPL-3.0.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses/blob/master/LICENSE')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project publishes its own Docker image.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses#self-hosting','https://hub.docker.com/r/blampe/rreading-glasses')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project documents blampe/rreading-glasses.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses#self-hosting')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project includes two Compose examples.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses/blob/master/docker-compose-gr.yml','https://github.com/blampe/rreading-glasses/blob/master/docker-compose-hardcover.yml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Self-hosting requires a PostgreSQL backend.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses#self-hosting')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','PostgreSQL stores cached metadata; the app also keeps a local cache.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses#self-hosting')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The service exposes metadata API routes for compatible readers.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM range is an estimate; the app uses available memory for cache.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses#self-hosting')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage range is an estimate for PostgreSQL and metadata cache.','source_urls',jsonb_build_array('https://github.com/blampe/rreading-glasses#self-hosting'))
    ),updated_at=now()
  where a.id=v_rreading;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'rreading-glasses app update failed'; end if;

  update public.self_host_apps a set
    name='RPCS3',summary='PlayStation 3 emulator and debugger for Windows, Linux, macOS, and FreeBSD.',
    website_url='https://rpcs3.net/',source_code_url='https://github.com/RPCS3/rpcs3',source_code_host='github',
    github_project_id=null,github_owner='RPCS3',github_repo='rpcs3',github_full_name='RPCS3/rpcs3',github_checked_at=null,
    source_repo_id=null,source_full_name='RPCS3/rpcs3',source_checked_at=null,
    docs_url='https://wiki.rpcs3.net/',install_docs_url='https://rpcs3.net/quickstart',
    docker_url='https://hub.docker.com/r/linuxserver/rpcs3',
    license='GNU General Public License v2.0 only (most files; some files have different licenses)',
    license_type='copyleft',license_spdx_id='GPL-2.0-only',source_model='open_source',
    publisher_name='RPCS3 project',publisher_type='community',publisher_url='https://github.com/RPCS3',pricing_model='free',
    docker_support='community',docker_image='lscr.io/linuxserver/rpcs3:latest',compose_support=true,
    compose_url='https://docs.linuxserver.io/images/docker-rpcs3/',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',surfaces=array['web']::text[],
    deployment_methods=array['docker','unraid']::text[],release_url='https://github.com/RPCS3/rpcs3/releases',
    summary_source='https://github.com/RPCS3/rpcs3',summary_confidence='high',
    data_source_urls=array['https://github.com/RPCS3/rpcs3','https://github.com/RPCS3/rpcs3/blob/master/LICENSE','https://rpcs3.net/','https://rpcs3.net/quickstart','https://wiki.rpcs3.net/','https://blog.rpcs3.net/2024/12/09/introducing-rpcs3-for-arm64/','https://docs.linuxserver.io/images/docker-rpcs3/','https://hub.docker.com/r/linuxserver/rpcs3','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream repository states that most files use GPL-2.0-only and some files have separate licenses.','source_urls',jsonb_build_array('https://github.com/RPCS3/rpcs3')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer.io publishes a community container for RPCS3.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-rpcs3/','https://hub.docker.com/r/linuxserver/rpcs3')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer.io documents lscr.io/linuxserver/rpcs3:latest.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-rpcs3/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer.io provides a recommended Compose setup.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-rpcs3/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The emulator stores configuration and game data locally; no external database is used.','source_urls',jsonb_build_array('https://github.com/RPCS3/rpcs3','https://docs.linuxserver.io/images/docker-rpcs3/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container maps /config for persistent emulator settings and files.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-rpcs3/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The community container exposes the desktop interface through a browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-rpcs3/')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM range is an estimate; upstream ARM64 guidance starts at 8 GB.','source_urls',jsonb_build_array('https://blog.rpcs3.net/2024/12/09/introducing-rpcs3-for-arm64/','https://rpcs3.net/quickstart')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage range is an estimate for a game library and emulator files.','source_urls',jsonb_build_array('https://github.com/RPCS3/rpcs3','https://docs.linuxserver.io/images/docker-rpcs3/'))
    ),updated_at=now()
  where a.id=v_rpcs3;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'RPCS3 app update failed'; end if;

  update public.self_host_apps a set
    name='DuckStation',summary='PlayStation 1 emulator focused on accuracy, speed, and game compatibility.',
    website_url='https://www.duckstation.org/',source_code_url='https://github.com/stenzek/duckstation',source_code_host='github',
    github_project_id=null,github_owner='stenzek',github_repo='duckstation',github_full_name='stenzek/duckstation',github_checked_at=null,
    source_repo_id=null,source_full_name='stenzek/duckstation',source_checked_at=null,
    docs_url='https://github.com/stenzek/duckstation#readme',install_docs_url='https://docs.linuxserver.io/images/docker-duckstation/',
    docker_url='https://hub.docker.com/r/linuxserver/duckstation',
    license='Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International',
    license_type='custom',license_spdx_id='CC-BY-NC-ND-4.0',source_model='source_available',
    publisher_name='Stenzek',publisher_type='individual',publisher_url='https://github.com/stenzek',pricing_model='free',
    docker_support='community',docker_image='lscr.io/linuxserver/duckstation:latest',compose_support=true,
    compose_url='https://docs.linuxserver.io/images/docker-duckstation/',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',surfaces=array['web']::text[],
    deployment_methods=array['docker','unraid']::text[],release_url='https://github.com/stenzek/duckstation/releases',
    summary_source='https://github.com/stenzek/duckstation',summary_confidence='high',
    data_source_urls=array['https://github.com/stenzek/duckstation','https://github.com/stenzek/duckstation/blob/master/LICENSE','https://www.duckstation.org/','https://github.com/stenzek/duckstation/releases','https://docs.linuxserver.io/images/docker-duckstation/','https://hub.docker.com/r/linuxserver/duckstation','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream repository identifies CC BY-NC-ND 4.0, which is source-available rather than an open-source license.','source_urls',jsonb_build_array('https://github.com/stenzek/duckstation/blob/master/LICENSE','https://github.com/stenzek/duckstation')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer.io publishes a community container for DuckStation.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-duckstation/','https://hub.docker.com/r/linuxserver/duckstation')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer.io documents lscr.io/linuxserver/duckstation:latest.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-duckstation/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer.io provides a recommended Compose setup.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-duckstation/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The emulator stores configuration and game data locally; no external database is used.','source_urls',jsonb_build_array('https://github.com/stenzek/duckstation','https://docs.linuxserver.io/images/docker-duckstation/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container maps /config for persistent emulator settings and files.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-duckstation/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The community container exposes the desktop interface through a browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-duckstation/')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM range is an estimate based on emulator use and optional disc-image preloading.','source_urls',jsonb_build_array('https://github.com/stenzek/duckstation')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage range is an estimate for emulator files and a small game library.','source_urls',jsonb_build_array('https://github.com/stenzek/duckstation','https://docs.linuxserver.io/images/docker-duckstation/'))
    ),updated_at=now()
  where a.id=v_duckstation;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'DuckStation app update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_resticprofile;
  insert into public.self_host_app_category_links(app_id,category_id) select v_resticprofile,c.id from public.self_host_app_categories c where c.slug='storage-backup';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'resticprofile category update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_rreading;
  insert into public.self_host_app_category_links(app_id,category_id) select v_rreading,c.id from public.self_host_app_categories c where c.slug='ebooks-libraries';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'rreading-glasses category update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_rpcs3;
  insert into public.self_host_app_category_links(app_id,category_id) select v_rpcs3,c.id from public.self_host_app_categories c where c.slug='games';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'RPCS3 category update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_duckstation;
  insert into public.self_host_app_category_links(app_id,category_id) select v_duckstation,c.id from public.self_host_app_categories c where c.slug='games';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'DuckStation category update failed'; end if;

  update public.self_host_app_install_options io set
    options=$resticprofile_new$[
      {"url":"https://hub.docker.com/r/creativeprojects/resticprofile","note":"Official image from the resticprofile project maintainers.","image":"creativeprojects/resticprofile:latest","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://creativeprojects.github.io/resticprofile/installation/docker/index.html","support_level":"official"},
      {"url":"https://github.com/creativeprojects/resticprofile/tree/master/contrib/schedule-in-docker","note":"Official example for scheduling backups in a long-running container.","image":"creativeprojects/resticprofile:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://creativeprojects.github.io/resticprofile/installation/docker/index.html","support_level":"official"},
      {"url":"https://creativeprojects.github.io/resticprofile/installation/binaries/index.html","note":"Official pre-built binaries for supported operating systems and architectures.","image":null,"label":"Pre-built binary","method":"binary","sort_order":30,"source_url":"https://creativeprojects.github.io/resticprofile/installation/binaries/index.html","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml","note":"Community Unraid template; it uses a separate community image.","image":"alexycodes/resticprofile","label":"Unraid template","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml","support_level":"community"}
    ]$resticprofile_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/creativeprojects/resticprofile','https://hub.docker.com/r/alexycodes/resticprofile']::text[],
    docker_images=array['creativeprojects/resticprofile:latest','alexycodes/resticprofile']::text[],
    compose_urls=array['https://github.com/creativeprojects/resticprofile/tree/master/contrib/schedule-in-docker']::text[],
    binary_urls=array['https://creativeprojects.github.io/resticprofile/installation/binaries/index.html']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml']::text[],
    source_urls=array['https://creativeprojects.github.io/resticprofile/installation/docker/index.html','https://creativeprojects.github.io/resticprofile/installation/binaries/index.html','https://hub.docker.com/r/creativeprojects/resticprofile','https://raw.githubusercontent.com/alexycodes/unraid-docker-templates/main/resticprofile.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_resticprofile;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'resticprofile install options update failed'; end if;

  update public.self_host_app_install_options io set
    options=$rreading_new$[
      {"url":"https://hub.docker.com/r/blampe/rreading-glasses","note":"Image published by the project maintainer.","image":"blampe/rreading-glasses:latest","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/blampe/rreading-glasses#self-hosting","support_level":"official"},
      {"url":"https://github.com/blampe/rreading-glasses/blob/master/docker-compose-gr.yml","note":"Official Compose example using Goodreads metadata.","image":"blampe/rreading-glasses:latest","label":"Docker Compose (Goodreads)","method":"compose","sort_order":20,"source_url":"https://github.com/blampe/rreading-glasses#self-hosting","support_level":"official"},
      {"url":"https://github.com/blampe/rreading-glasses/blob/master/docker-compose-hardcover.yml","note":"Official Compose example using Hardcover metadata.","image":"blampe/rreading-glasses:hardcover","label":"Docker Compose (Hardcover)","method":"compose","sort_order":21,"source_url":"https://github.com/blampe/rreading-glasses#self-hosting","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml","note":"Community Unraid template for rreading-glasses.","image":"blampe/rreading-glasses:latest","label":"Unraid template","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml","support_level":"community"}
    ]$rreading_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/blampe/rreading-glasses']::text[],
    docker_images=array['blampe/rreading-glasses:latest']::text[],
    compose_urls=array['https://github.com/blampe/rreading-glasses/blob/master/docker-compose-gr.yml','https://github.com/blampe/rreading-glasses/blob/master/docker-compose-hardcover.yml']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml']::text[],
    source_urls=array['https://github.com/blampe/rreading-glasses#self-hosting','https://hub.docker.com/r/blampe/rreading-glasses','https://raw.githubusercontent.com/ds-sebastian/unraid-templates/main/rreading-glasses/rreading-glasses.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_rreading;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'rreading-glasses install options update failed'; end if;

  update public.self_host_app_install_options io set
    options=$rpcs3_new$[
      {"url":"https://hub.docker.com/r/linuxserver/rpcs3","note":"LinuxServer.io community image for the RPCS3 emulator.","image":"lscr.io/linuxserver/rpcs3:latest","label":"Community Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-rpcs3/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-rpcs3/","note":"LinuxServer.io recommends this Compose setup for its image.","image":"lscr.io/linuxserver/rpcs3:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-rpcs3/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml","note":"Community Unraid template for the LinuxServer.io image.","image":"lscr.io/linuxserver/rpcs3:latest","label":"Unraid template","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml","support_level":"community"}
    ]$rpcs3_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/rpcs3']::text[],
    docker_images=array['lscr.io/linuxserver/rpcs3:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-rpcs3/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-rpcs3/','https://hub.docker.com/r/linuxserver/rpcs3','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/rpcs3.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_rpcs3;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'RPCS3 install options update failed'; end if;

  update public.self_host_app_install_options io set
    options=$duckstation_new$[
      {"url":"https://hub.docker.com/r/linuxserver/duckstation","note":"LinuxServer.io community image for DuckStation.","image":"lscr.io/linuxserver/duckstation:latest","label":"Community Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-duckstation/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-duckstation/","note":"LinuxServer.io recommends this Compose setup for its image.","image":"lscr.io/linuxserver/duckstation:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-duckstation/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml","note":"Community Unraid template for the LinuxServer.io image.","image":"lscr.io/linuxserver/duckstation:latest","label":"Unraid template","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml","support_level":"community"}
    ]$duckstation_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/duckstation']::text[],
    docker_images=array['lscr.io/linuxserver/duckstation:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-duckstation/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-duckstation/','https://hub.docker.com/r/linuxserver/duckstation','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/duckstation.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_duckstation;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'DuckStation install options update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Restic can use substantial memory during backups; the job size and repository affect the amount.',
    ram_source_urls=array['https://creativeprojects.github.io/resticprofile/usage/memory/index.html','https://github.com/creativeprojects/resticprofile']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=500,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='A local Restic repository grows with the backed-up files and retention; remote targets use remote storage.',
    storage_source_urls=array['https://creativeprojects.github.io/resticprofile/installation/docker/index.html','https://github.com/creativeprojects/resticprofile']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_resticprofile and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'resticprofile estimates changed since review'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='The app uses available memory for metadata caching; request volume affects memory use.',
    ram_source_urls=array['https://github.com/blampe/rreading-glasses#self-hosting']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=5,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='PostgreSQL and the local metadata cache grow as the service is queried; personal libraries usually need only a few gigabytes.',
    storage_source_urls=array['https://github.com/blampe/rreading-glasses#self-hosting']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_rreading and e.ram_estimate_min_mb=1024 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'rreading-glasses estimates changed since review'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=8192,ram_estimate_max_mb=16384,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Upstream ARM64 guidance starts at 8 GB; heavier games and shader caches may need more.',
    ram_source_urls=array['https://blog.rpcs3.net/2024/12/09/introducing-rpcs3-for-arm64/','https://rpcs3.net/quickstart']::text[],
    storage_estimate_min_gb=50,storage_estimate_max_gb=500,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Game installations and updates dominate storage; the amount depends on the PS3 library.',
    storage_source_urls=array['https://github.com/RPCS3/rpcs3','https://docs.linuxserver.io/images/docker-rpcs3/']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_rpcs3 and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=50 and e.storage_estimate_max_gb=500
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'RPCS3 estimates changed since review'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for the emulator and its desktop interface; higher render settings and preloading disc images use more memory.',
    ram_source_urls=array['https://github.com/stenzek/duckstation','https://docs.linuxserver.io/images/docker-duckstation/']::text[],
    storage_estimate_min_gb=10,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The emulator is small; disc images, saves, and user files determine most storage use.',
    storage_source_urls=array['https://github.com/stenzek/duckstation','https://docs.linuxserver.io/images/docker-duckstation/']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_duckstation and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; active users and stored content vary.'
    and e.storage_estimate_min_gb=10 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; active users and stored content vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'DuckStation estimates changed since review'; end if;
end
$migration$;

commit;
