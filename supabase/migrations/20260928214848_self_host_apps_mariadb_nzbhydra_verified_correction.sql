begin;

do $migration$
declare
  v_mariadb uuid;
  v_hydra uuid;
  v_hydra_project uuid;
  v_categories text[];
  v_options jsonb;
  v_affected integer;
begin
  select a.id into v_mariadb
  from public.self_host_apps a
  where a.slug='mariadb' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/linuxserver/docker-mariadb'
    and a.license='GNU Affero General Public License v3.0' and a.license_spdx_id='GPL-3.0'
    and a.source_model='open_source' and a.github_project_id='69de004a-1af4-4a42-9548-64cd4537bcf8'::uuid
    and a.compose_support is false and a.requires_database is null and a.persistent_storage is null;
  if v_mariadb is null then raise exception 'MariaDB record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_mariadb;
  if v_categories is distinct from array['databases','networking-dns','system-admin-hosting']::text[] then
    raise exception 'MariaDB categories changed since review';
  end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_mariadb for update;
  if v_options is null or jsonb_array_length(v_options)<>2
     or not exists(select 1 from jsonb_array_elements(v_options) x where x->>'url'='https://hub.docker.com/r/linuxserver/mariadb')
     or not exists(select 1 from jsonb_array_elements(v_options) x where x->>'url'='https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mariadb.xml') then
    raise exception 'MariaDB install options changed since review';
  end if;

  if exists(select 1 from public.github_projects gp where gp.owner='MariaDB' and gp.repo='server') then
    raise exception 'MariaDB upstream repository is now registered; review project metadata before applying';
  end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=512,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for a small single-server database. Memory use depends on the active data set, cache settings, and connections.',
    ram_source_urls=array['https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-buffer-pool','https://mariadb.com/docs/server/ha-and-performance/mariadb-memory-allocation']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated database files and logs for a small self-hosted server. Actual data size depends on the databases and retention.',
    storage_source_urls=array['https://hub.docker.com/_/mariadb','https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose']::text[],
    checked_at=now(),updated_at=now()
  where e.app_id=v_mariadb and e.ram_estimate_min_mb=1024 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; data volume and request load vary.'
    and e.storage_estimate_min_gb=5 and e.storage_estimate_max_gb=100
    and e.storage_estimate_basis='Small single-node service; data volume and request load vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'MariaDB estimates changed since review'; end if;

  update public.self_host_apps a set
    name='MariaDB',summary='Open-source relational database server with a MySQL-compatible SQL interface.',
    website_url='https://mariadb.org/',source_code_url='https://github.com/MariaDB/server',source_code_host='github',
    source_full_name='MariaDB/server',source_repo_id=null,source_archived=false,source_disabled=false,source_checked_at=now(),
    github_project_id=null,github_owner='MariaDB',github_repo='server',github_full_name='MariaDB/server',
    github_repo_id=null,github_node_id=null,github_owner_type='Organization',github_checked_at=now(),github_archived=false,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,
    github_languages='{}',github_topics='{}',github_created_at=null,github_updated_at=null,github_pushed_at=null,
    github_last_commit_at=null,github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,
    github_latest_release_at=null,
    docs_url='https://mariadb.com/docs/server/',
    install_docs_url='https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/installing-and-using-mariadb-via-docker',
    release_url='https://github.com/MariaDB/server/releases',
    license='GNU General Public License v2.0 only',license_spdx_id='GPL-2.0-only',license_type='copyleft',source_model='open_source',
    publisher_name='MariaDB Foundation',publisher_type='foundation',publisher_url='https://mariadb.org/about/',pricing_model='free',
    maintenance_status='active',docker_support='official',docker_url='https://hub.docker.com/_/mariadb',docker_image='mariadb',
    compose_support=true,compose_url='https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['api','cli']::text[],
    summary_source='https://mariadb.org/about/',summary_confidence='high',data_confidence='high',
    source_latest_release=null,source_latest_release_at=null,
    data_source_urls=array[
      'https://mariadb.org/about/','https://mariadb.com/docs/server/','https://github.com/MariaDB/server',
      'https://hub.docker.com/_/mariadb',
      'https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb',
      'https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/installing-and-using-mariadb-via-docker',
      'https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose',
      'https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-buffer-pool',
      'https://mariadb.com/docs/server/ha-and-performance/mariadb-memory-allocation',
      'https://github.com/linuxserver/docker-mariadb','https://hub.docker.com/r/linuxserver/mariadb',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mariadb.xml',
      'https://raw.githubusercontent.com/linuxserver/docker-templates/master/linuxserver.io/img/mariadb-logo.png'
    ]::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','MariaDB Server states that it is licensed under GPLv2.','source_urls',jsonb_build_array('https://mariadb.org/about/','https://github.com/MariaDB/server')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','MariaDB documents the Docker Official Image.','source_urls',jsonb_build_array('https://hub.docker.com/_/mariadb','https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Docker Official Image is mariadb.','source_urls',jsonb_build_array('https://hub.docker.com/_/mariadb')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','MariaDB documents Docker Compose deployments.','source_urls',jsonb_build_array('https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','MariaDB is the database server itself and does not require a separate database service.','source_urls',jsonb_build_array('https://mariadb.org/about/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Container instructions use persistent storage for the database data directory and logs.','source_urls',jsonb_build_array('https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','MariaDB provides an SQL interface and a command-line client.','source_urls',jsonb_build_array('https://mariadb.org/about/','https://hub.docker.com/_/mariadb')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory value is Est. RAM 512 MB to 4 GB for a small server; cache and connections change memory use.','source_urls',jsonb_build_array('https://mariadb.com/docs/server/server-usage/storage-engines/innodb/innodb-buffer-pool','https://mariadb.com/docs/server/ha-and-performance/mariadb-memory-allocation')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory value is Est. Storage 1 GB to 100 GB for a small server; database contents and logs determine actual use.','source_urls',jsonb_build_array('https://hub.docker.com/_/mariadb','https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_mariadb;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'MariaDB app update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/_/mariadb","note":"MariaDB Docker Official Image.","image":"mariadb","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/_/mariadb","support_level":"official"},
      {"url":"https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose","note":"Official MariaDB Compose example.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose","support_level":"official"},
      {"url":"https://hub.docker.com/r/linuxserver/mariadb","note":"LinuxServer community image.","image":"lscr.io/linuxserver/mariadb","label":"Community Docker image","method":"docker","sort_order":30,"source_url":"https://github.com/linuxserver/docker-mariadb","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mariadb.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mariadb.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/mariadb','https://hub.docker.com/r/linuxserver/mariadb']::text[],
    docker_images=array['mariadb','lscr.io/linuxserver/mariadb']::text[],
    compose_urls=array['https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mariadb.xml']::text[],
    source_urls=array['https://hub.docker.com/_/mariadb','https://mariadb.com/docs/server/server-management/automated-mariadb-deployment-and-administration/docker-and-mariadb/setting-up-a-lamp-stack-with-docker-compose','https://github.com/linuxserver/docker-mariadb','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/mariadb.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_mariadb and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'MariaDB install options changed since review'; end if;

  delete from public.self_host_app_category_links where app_id=v_mariadb;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_mariadb,c.id from public.self_host_app_categories c where c.slug='databases';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'MariaDB category update failed'; end if;

  select a.id into v_hydra
  from public.self_host_apps a
  where a.slug='hydra2' and a.published is true and a.self_hosting_status='self_hostable'
    and a.source_code_url='https://github.com/linuxserver/docker-hydra2'
    and a.license='GNU Affero General Public License v3.0' and a.license_spdx_id='GPL-3.0'
    and a.source_model='open_source' and a.github_project_id='b271c4c8-702a-43f5-a1af-9ee1256912d6'::uuid
    and a.compose_support is false and a.requires_database is null and a.persistent_storage is null;
  if v_hydra is null then raise exception 'NZBHydra 2 record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_hydra;
  if v_categories is distinct from array['ai-ml','system-admin-hosting']::text[] then
    raise exception 'NZBHydra 2 categories changed since review';
  end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_hydra for update;
  if v_options is null or jsonb_array_length(v_options)<>1
     or v_options->0->>'url' is distinct from 'https://hub.docker.com/r/linuxserver/hydra2' then
    raise exception 'NZBHydra 2 install options changed since review';
  end if;

  select gp.id into v_hydra_project from public.github_projects gp
  where gp.owner='theotherp' and gp.repo='nzbhydra2' and gp.repo_id=103616209
    and gp.full_name='theotherp/nzbhydra2' and gp.archived is false and gp.license_spdx_id='GPL-3.0';
  if v_hydra_project is null then raise exception 'NZBHydra 2 upstream project changed since review'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256,ram_estimate_max_mb=2048,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='The author reports about 200 to 300 MB in a low-memory setup; more indexers, history, and statistics use more.',
    ram_source_urls=array['https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Search history, statistics, and the H2 database grow with indexers and retention settings.',
    storage_source_urls=array['https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements','https://docs.linuxserver.io/images/docker-nzbhydra2/']::text[],
    checked_at=now(),updated_at=now()
  where e.app_id=v_hydra and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'NZBHydra 2 estimates changed since review'; end if;

  update public.github_projects gp set latest_release='v9.0.6',latest_release_at=null,checked_at=now(),row_updated_at=now()
  where gp.id=v_hydra_project and gp.latest_release is null;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'NZBHydra 2 project release metadata changed since review'; end if;

  update public.self_host_apps a set
    name='NZBHydra 2',summary='Usenet metasearch for NZB indexers and Torznab trackers, with search results for connected apps.',
    website_url='https://github.com/theotherp/nzbhydra2',source_code_url='https://github.com/theotherp/nzbhydra2',source_code_host='github',
    source_full_name='theotherp/nzbhydra2',source_repo_id='103616209',source_archived=false,source_disabled=false,
    source_default_branch='master',source_latest_release='v9.0.6',source_latest_release_at=null,source_checked_at=now(),
    github_project_id=v_hydra_project,github_owner='theotherp',github_repo='nzbhydra2',github_full_name='theotherp/nzbhydra2',
    github_repo_id=103616209,github_owner_type='User',github_archived=false,github_default_branch='master',github_latest_release='v9.0.6',
    github_checked_at=now(),release_version='v9.0.6',release_published_at=null,release_url='https://github.com/theotherp/nzbhydra2/releases',release_checked_at=now(),
    docs_url='https://github.com/theotherp/nzbhydra2/wiki',install_docs_url='https://docs.linuxserver.io/images/docker-nzbhydra2/',
    license='GPL-3.0 (LICENSE); Apache-2.0 (README)',license_spdx_id=null,license_type='unknown',source_model='open_source',
    publisher_name='theotherp',publisher_type='individual',publisher_url='https://github.com/theotherp',pricing_model='free',
    maintenance_status='active',docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/nzbhydra2',
    docker_image='lscr.io/linuxserver/nzbhydra2:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-nzbhydra2/',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',
    deployment_methods=array['native','docker','compose']::text[],surfaces=array['web','api']::text[],
    summary_source='https://github.com/theotherp/nzbhydra2#readme',summary_confidence='high',data_confidence='high',
    data_source_urls=array[
      'https://github.com/theotherp/nzbhydra2','https://github.com/theotherp/nzbhydra2/blob/master/LICENSE',
      'https://github.com/theotherp/nzbhydra2/blob/master/readme.md','https://github.com/theotherp/nzbhydra2/wiki',
      'https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements','https://github.com/theotherp/nzbhydra2/wiki/External-API%2C-RSS-and-cached-queries',
      'https://github.com/theotherp/nzbhydra2/releases','https://docs.linuxserver.io/images/docker-nzbhydra2/',
      'https://hub.docker.com/r/linuxserver/nzbhydra2'
    ]::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository identifies GPL-3.0, while its README also includes an Apache-2.0 notice; both notices are listed.','source_urls',jsonb_build_array('https://github.com/theotherp/nzbhydra2/blob/master/LICENSE','https://github.com/theotherp/nzbhydra2/blob/master/readme.md')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer publishes a community container for NZBHydra 2.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-nzbhydra2/')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The LinuxServer image is lscr.io/linuxserver/nzbhydra2:latest.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-nzbhydra2/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose example for its image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-nzbhydra2/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','NZBHydra 2 uses an embedded H2 file database and does not require a separate database service.','source_urls',jsonb_build_array('https://github.com/theotherp/nzbhydra2')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The documented container stores persistent config and app data under /config.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-nzbhydra2/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','NZBHydra 2 has a web interface and documented external API.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-nzbhydra2/','https://github.com/theotherp/nzbhydra2/wiki/External-API%2C-RSS-and-cached-queries')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory value is Est. RAM 256 MB to 2 GB; the author reports about 200 to 300 MB in a low-memory setup.','source_urls',jsonb_build_array('https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory value is Est. Storage 1 GB to 20 GB for persistent app data, history, statistics, and the H2 database.','source_urls',jsonb_build_array('https://github.com/theotherp/nzbhydra2/wiki/Memory-requirements','https://docs.linuxserver.io/images/docker-nzbhydra2/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_hydra;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'NZBHydra 2 app update failed'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://github.com/theotherp/nzbhydra2/releases","note":"Official application releases for native installation.","image":null,"label":"Native release","method":"native","sort_order":5,"source_url":"https://github.com/theotherp/nzbhydra2/wiki/Windows-service-and-Linux-start-scripts","support_level":"official"},
      {"url":"https://hub.docker.com/r/linuxserver/nzbhydra2","note":"LinuxServer community image for NZBHydra 2.","image":"lscr.io/linuxserver/nzbhydra2:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-nzbhydra2/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-nzbhydra2/","note":"LinuxServer provides a Compose example for this image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-nzbhydra2/","support_level":"community"}
    ]'::jsonb,
    native_urls=array['https://github.com/theotherp/nzbhydra2/releases']::text[],
    docker_urls=array['https://hub.docker.com/r/linuxserver/nzbhydra2']::text[],
    docker_images=array['lscr.io/linuxserver/nzbhydra2:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-nzbhydra2/']::text[],
    unraid_urls='{}',
    source_urls=array['https://github.com/theotherp/nzbhydra2','https://github.com/theotherp/nzbhydra2/wiki/Windows-service-and-Linux-start-scripts','https://docs.linuxserver.io/images/docker-nzbhydra2/']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_hydra and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'NZBHydra 2 install options changed since review'; end if;

  delete from public.self_host_app_category_links where app_id=v_hydra;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_hydra,c.id from public.self_host_app_categories c where c.slug='search';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'NZBHydra 2 category update failed'; end if;
end
$migration$;

commit;
