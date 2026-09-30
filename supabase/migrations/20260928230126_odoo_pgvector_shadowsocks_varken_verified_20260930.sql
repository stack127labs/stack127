begin;
do $migration$
declare
  v_app uuid;
  v_options jsonb;
  v_categories text[];
  v_count integer;
begin
  select id into v_app from public.self_host_apps
  where slug='odoo17' and published is true
    and source_code_url='https://github.com/odoo/docker'
    and license='No license file declared (all rights reserved by default)'
    and docker_image='odoo:17' and website_url is null;
  if v_app is null then raise exception 'Odoo 17 record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','knowledge-notes','video-conferencing']::text[] then
    raise exception 'Odoo 17 categories changed since review';
  end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists (select 1 from jsonb_array_elements(v_options) e where e->>'image'='odoo:17')
    or not exists (select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://raw.githubusercontent.com/Eurotimmy/unraid-templates/main/Odoo17/odoo17.xml') then
    raise exception 'Odoo 17 install options changed since review';
  end if;
  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/_/odoo","note":"Official Odoo 17 Community image. PostgreSQL is required.","image":"odoo:17","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/_/odoo","support_level":"official"},
      {"url":"https://hub.docker.com/_/odoo","note":"Official Compose example runs Odoo with PostgreSQL.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://hub.docker.com/_/odoo","support_level":"official"},
      {"url":"https://www.odoo.com/documentation/17.0/administration/on_premise/source.html","note":"Official source installation guide. PostgreSQL is required.","image":null,"label":"Source installation","method":"native","sort_order":30,"source_url":"https://www.odoo.com/documentation/17.0/administration/on_premise/source.html","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/Eurotimmy/unraid-templates/main/Odoo17/odoo17.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/Eurotimmy/unraid-templates/main/Odoo17/odoo17.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/_/odoo']::text[],
    docker_images=array['odoo:17']::text[],
    compose_urls=array['https://hub.docker.com/_/odoo']::text[],
    native_urls=array['https://www.odoo.com/documentation/17.0/administration/on_premise/source.html']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/Eurotimmy/unraid-templates/main/Odoo17/odoo17.xml']::text[],
    source_urls=array[
      'https://hub.docker.com/_/odoo',
      'https://www.odoo.com/documentation/17.0/administration/on_premise/source.html',
      'https://raw.githubusercontent.com/Eurotimmy/unraid-templates/main/Odoo17/odoo17.xml'
    ]::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Odoo 17 install option update failed'; end if;

  update public.self_host_apps set
    name='Odoo 17 Community',
    summary='Open-source business apps for accounting, sales, inventory, websites, and operations.',
    website_url='https://www.odoo.com/',
    source_code_url='https://github.com/odoo/odoo',source_code_host='github',source_full_name='odoo/odoo',source_default_branch='17.0',
    source_repo_id=null,source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,
    source_primary_language=null,source_languages='{}'::jsonb,source_topics='{}'::text[],source_created_at=null,
    source_updated_at=null,source_pushed_at=null,source_last_commit_at=null,source_archived=null,source_disabled=null,
    source_is_fork=null,source_is_template=null,source_latest_release=null,source_latest_release_at=null,source_checked_at=now(),
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,
    github_languages='{}'::jsonb,github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,
    github_last_commit_at=null,github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    publisher_name='Odoo S.A.',publisher_type='company',publisher_url='https://www.odoo.com/',
    license='GNU Lesser General Public License v3.0',license_spdx_id='LGPL-3.0-only',license_type='copyleft',source_model='open_source',
    docs_url='https://www.odoo.com/documentation/17.0/',install_docs_url='https://hub.docker.com/_/odoo',
    release_url='https://hub.docker.com/_/odoo/tags',release_version='17.0',release_published_at=null,release_checked_at=now(),
    pricing_model='free',docker_support='official',docker_url='https://hub.docker.com/_/odoo',docker_image='odoo:17',
    compose_support=true,compose_url='https://hub.docker.com/_/odoo',
    requires_database=true,database_types=array['PostgreSQL']::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','native','unraid']::text[],
    summary_source='https://hub.docker.com/_/odoo',summary_confidence='high',
    data_source_urls=array[
      'https://www.odoo.com/',
      'https://www.odoo.com/documentation/17.0/',
      'https://www.odoo.com/documentation/17.0/administration/on_premise/source.html',
      'https://github.com/odoo/odoo',
      'https://github.com/odoo/odoo/blob/17.0/LICENSE',
      'https://github.com/odoo/docker',
      'https://hub.docker.com/_/odoo',
      'https://hub.docker.com/_/odoo/tags',
      'https://raw.githubusercontent.com/Eurotimmy/unraid-templates/main/Odoo17/odoo17.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Odoo 17 application source is in the Odoo repository; 17.0 is its version branch.','source_urls',jsonb_build_array('https://github.com/odoo/odoo/tree/17.0')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Odoo 17 source tree states LGPL version 3.','source_urls',jsonb_build_array('https://github.com/odoo/odoo/blob/17.0/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Odoo maintains the official Docker image and publishes the Odoo product site.','source_urls',jsonb_build_array('https://hub.docker.com/_/odoo','https://www.odoo.com/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Docker Hub identifies this as the official Odoo image and lists the 17 tag.','source_urls',jsonb_build_array('https://hub.docker.com/_/odoo','https://hub.docker.com/_/odoo/tags')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official Docker Hub instructions include Compose examples.','source_urls',jsonb_build_array('https://hub.docker.com/_/odoo')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official image requires a PostgreSQL server.','source_urls',jsonb_build_array('https://hub.docker.com/_/odoo','https://www.odoo.com/documentation/17.0/administration/on_premise/source.html')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official image instructions document persistent filestore and database volumes.','source_urls',jsonb_build_array('https://hub.docker.com/_/odoo')),
      'pricing',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','This record covers Odoo Community; the official image describes the business apps as open source.','source_urls',jsonb_build_array('https://hub.docker.com/_/odoo','https://github.com/odoo/odoo/blob/17.0/LICENSE'))
    ),
    technical_facts_checked_at=now(),updated_at=now()
  where id=v_app and source_code_url='https://github.com/odoo/docker';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Odoo 17 fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>3 then raise exception 'Odoo 17 category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='business-commerce';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Odoo 17 category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='pgvector-18' and published is true
    and source_code_url='https://github.com/pgvector/pgvector'
    and license='No license file declared (all rights reserved by default)'
    and docker_image='pgvector/pgvector:pg18' and website_url is null
    and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'pgvector 18 record changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists (select 1 from jsonb_array_elements(v_options) e where e->>'image'='pgvector/pgvector:pg18') then
    raise exception 'pgvector 18 install options changed since review';
  end if;
  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/pgvector/pgvector","note":"Official pgvector image with PostgreSQL 18 and the vector extension.","image":"pgvector/pgvector:pg18","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/pgvector/pgvector","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/pgvector18.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/pgvector18.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/pgvector/pgvector']::text[],
    docker_images=array['pgvector/pgvector:pg18']::text[],
    compose_urls='{}'::text[],
    unraid_urls=array['https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/pgvector18.xml']::text[],
    source_urls=array['https://github.com/pgvector/pgvector','https://hub.docker.com/r/pgvector/pgvector','https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/pgvector18.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'pgvector 18 install option update failed'; end if;
  update public.self_host_apps set
    name='pgvector for PostgreSQL 18',summary='PostgreSQL extension for storing and searching vector embeddings.',
    website_url='https://github.com/pgvector/pgvector',source_code_url='https://github.com/pgvector/pgvector',
    publisher_name='pgvector',publisher_type='community',publisher_url='https://github.com/pgvector',
    license='PostgreSQL License',license_spdx_id='PostgreSQL',license_type='permissive',source_model='open_source',pricing_model='free',
    docs_url='https://github.com/pgvector/pgvector',install_docs_url='https://github.com/pgvector/pgvector',
    docker_support='official',docker_url='https://hub.docker.com/r/pgvector/pgvector',docker_image='pgvector/pgvector:pg18',
    compose_support=false,compose_url=null,requires_database=false,database_types='{}'::text[],
    persistent_storage=true,storage_profile='depends',deployment_methods=array['docker','unraid']::text[],
    summary_source='https://github.com/pgvector/pgvector',summary_confidence='high',
    data_source_urls=array[
      'https://github.com/pgvector/pgvector',
      'https://github.com/pgvector/pgvector/blob/master/LICENSE',
      'https://hub.docker.com/r/pgvector/pgvector',
      'https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/pgvector18.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The pgvector project maintains this source repository.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository LICENSE contains the PostgreSQL License.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector/blob/master/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The pgvector project publishes and documents its PostgreSQL image.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector','https://hub.docker.com/r/pgvector/pgvector')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream README directs users to pgvector/pgvector:pg18.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector','https://hub.docker.com/r/pgvector/pgvector')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The image adds pgvector to a PostgreSQL image, so it does not need an external database container.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The image runs PostgreSQL and stores database files; actual storage depends on database contents.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector','https://hub.docker.com/_/postgres')),
      'pricing',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project is distributed under a permissive PostgreSQL license.','source_urls',jsonb_build_array('https://github.com/pgvector/pgvector/blob/master/LICENSE'))
    ),
    technical_facts_checked_at=now(),updated_at=now()
  where id=v_app and license='No license file declared (all rights reserved by default)';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'pgvector 18 fact update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='shadowsocks' and published is true
    and source_code_url='https://github.com/shadowsocks/shadowsocks-libev'
    and license='No license file declared (all rights reserved by default)'
    and license_spdx_id='GPL-3.0' and website_url is null;
  if v_app is null then raise exception 'Shadowsocks record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','networking-dns','project-task-management']::text[] then
    raise exception 'Shadowsocks categories changed since review';
  end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists (select 1 from jsonb_array_elements(v_options) e where e->>'image'='shadowsocks/shadowsocks-libev') then
    raise exception 'Shadowsocks install options changed since review';
  end if;
  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/shadowsocks/shadowsocks-libev","note":"Official Shadowsocks-libev image documented by the upstream project.","image":"shadowsocks/shadowsocks-libev","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md","support_level":"official"},
      {"url":"https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md","note":"Official Compose example for the Shadowsocks-libev image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/Flight777/unraid_justworks_templates/main/jw_shadowsocks.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/Flight777/unraid_justworks_templates/main/jw_shadowsocks.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/shadowsocks/shadowsocks-libev']::text[],
    docker_images=array['shadowsocks/shadowsocks-libev']::text[],
    compose_urls=array['https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/Flight777/unraid_justworks_templates/main/jw_shadowsocks.xml']::text[],
    source_urls=array[
      'https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md',
      'https://hub.docker.com/r/shadowsocks/shadowsocks-libev',
      'https://raw.githubusercontent.com/Flight777/unraid_justworks_templates/main/jw_shadowsocks.xml'
    ]::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Shadowsocks install option update failed'; end if;
  update public.self_host_apps set
    name='Shadowsocks-libev',summary='Lightweight encrypted SOCKS5 proxy for routing internet traffic through a remote server.',
    website_url='https://shadowsocks.org/',source_code_url='https://github.com/shadowsocks/shadowsocks-c',
    source_code_host='github',source_full_name='shadowsocks/shadowsocks-c',source_default_branch='master',
    source_archived=false,source_disabled=false,source_is_fork=false,source_is_template=false,source_checked_at=now(),
    publisher_name='Shadowsocks contributors',publisher_type='community',publisher_url='https://github.com/shadowsocks',
    license='GNU General Public License v3.0',license_spdx_id='GPL-3.0',license_type='copyleft',source_model='open_source',pricing_model='free',
    docs_url='https://shadowsocks.github.io/',
    install_docs_url='https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md',
    release_url='https://github.com/shadowsocks/shadowsocks-c/releases',release_version='3.3.6',release_published_at=null,release_checked_at=now(),
    docker_support='official',docker_url='https://hub.docker.com/r/shadowsocks/shadowsocks-libev',
    docker_image='shadowsocks/shadowsocks-libev',compose_support=true,
    compose_url='https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md',
    requires_database=false,database_types='{}'::text[],persistent_storage=false,storage_profile='tiny',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['cli']::text[],
    maintenance_status='active',summary_source='https://github.com/shadowsocks/shadowsocks-c',summary_confidence='high',
    data_source_urls=array[
      'https://shadowsocks.org/',
      'https://github.com/shadowsocks/shadowsocks-c',
      'https://github.com/shadowsocks/shadowsocks-c/blob/master/LICENSE',
      'https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md',
      'https://github.com/shadowsocks/shadowsocks-c/releases',
      'https://hub.docker.com/r/shadowsocks/shadowsocks-libev',
      'https://raw.githubusercontent.com/Flight777/unraid_justworks_templates/main/jw_shadowsocks.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream project renamed its canonical repository to shadowsocks-c and retained the libev history and releases.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The current upstream C project is GPL-3.0 licensed.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project site credits Shadowsocks contributors and links to the upstream project.','source_urls',jsonb_build_array('https://shadowsocks.org/','https://github.com/shadowsocks/shadowsocks-c')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Upstream Docker instructions name the shadowsocks/shadowsocks-libev image.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md','https://hub.docker.com/r/shadowsocks/shadowsocks-libev')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The upstream Docker instructions include Compose examples.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Upstream container instructions run the proxy without a database.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented server runs from command arguments and environment settings; no data database is needed.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c/blob/master/docker/alpine/README.md')),
      'pricing',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project is released under GPL-3.0.','source_urls',jsonb_build_array('https://github.com/shadowsocks/shadowsocks-c'))
    ),
    technical_facts_checked_at=now(),updated_at=now()
  where id=v_app and source_code_url='https://github.com/shadowsocks/shadowsocks-libev';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Shadowsocks fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>3 then raise exception 'Shadowsocks category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug in ('networking-dns','security-privacy');
  get diagnostics v_count=row_count;
  if v_count<>2 then raise exception 'Shadowsocks category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='varken' and published is true
    and source_code_url='https://github.com/boerderij/varken'
    and license='No license file declared (all rights reserved by default)'
    and license_spdx_id='MIT' and website_url is null;
  if v_app is null then raise exception 'Varken record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','monitoring-status','networking-dns']::text[] then
    raise exception 'Varken categories changed since review';
  end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists (select 1 from jsonb_array_elements(v_options) e where e->>'image'='boerderij/varken')
    or not exists (select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://raw.githubusercontent.com/benderstwin/docker-templates/master/Bender-Varken.xml') then
    raise exception 'Varken install options changed since review';
  end if;
  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/boerderij/varken/","note":"Varken image built from the project’s official Dockerfile.","image":"boerderij/varken","label":"Project Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/Boerderij/Varken/blob/master/Dockerfile","support_level":"official"},
      {"url":"https://github.com/Boerderij/Varken/blob/master/docker-compose.yml","note":"Project Compose file includes Varken and its InfluxDB service.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/Boerderij/Varken/blob/master/docker-compose.yml","support_level":"official"},
      {"url":"https://raw.githubusercontent.com/benderstwin/docker-templates/master/Bender-Varken.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/benderstwin/docker-templates/master/Bender-Varken.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/boerderij/varken/']::text[],
    docker_images=array['boerderij/varken']::text[],
    compose_urls=array['https://github.com/Boerderij/Varken/blob/master/docker-compose.yml']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/benderstwin/docker-templates/master/Bender-Varken.xml']::text[],
    source_urls=array[
      'https://github.com/Boerderij/Varken/blob/master/Dockerfile',
      'https://github.com/Boerderij/Varken/blob/master/docker-compose.yml',
      'https://hub.docker.com/r/boerderij/varken/',
      'https://raw.githubusercontent.com/benderstwin/docker-templates/master/Bender-Varken.xml'
    ]::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Varken install option update failed'; end if;
  update public.self_host_apps set
    summary='Collects Plex ecosystem statistics in InfluxDB for Grafana dashboards.',
    website_url='https://github.com/Boerderij/Varken',
    source_code_url='https://github.com/Boerderij/Varken',source_code_host='github',source_full_name='Boerderij/Varken',
    source_default_branch='master',
    publisher_name='Boerderij',publisher_type='community',publisher_url='https://github.com/Boerderij',
    license='MIT License',license_spdx_id='MIT',license_type='permissive',source_model='open_source',pricing_model='free',
    docs_url='https://github.com/Boerderij/Varken',install_docs_url='https://github.com/Boerderij/Varken',
    docker_support='official',docker_url='https://hub.docker.com/r/boerderij/varken/',docker_image='boerderij/varken',
    compose_support=true,compose_url='https://github.com/Boerderij/Varken/blob/master/docker-compose.yml',
    requires_database=true,database_types=array['InfluxDB']::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],
    summary_source='https://github.com/Boerderij/Varken',summary_confidence='high',
    data_source_urls=array[
      'https://github.com/Boerderij/Varken',
      'https://github.com/Boerderij/Varken/blob/master/LICENSE',
      'https://github.com/Boerderij/Varken/blob/master/README.md',
      'https://github.com/Boerderij/Varken/blob/master/Dockerfile',
      'https://github.com/Boerderij/Varken/blob/master/docker-compose.yml',
      'https://hub.docker.com/r/boerderij/varken/',
      'https://raw.githubusercontent.com/benderstwin/docker-templates/master/Bender-Varken.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Boerderij Varken repository contains the application source.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','GitHub identifies the repository as MIT licensed and the Dockerfile carries an MIT license label.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken/blob/master/LICENSE','https://github.com/Boerderij/Varken/blob/master/Dockerfile')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project repository and Docker image are published under Boerderij.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken','https://github.com/Boerderij/Varken/blob/master/Dockerfile')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project Dockerfile and Compose file use the boerderij/varken image.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken/blob/master/Dockerfile','https://hub.docker.com/r/boerderij/varken/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project repository includes a Compose deployment.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken/blob/master/docker-compose.yml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README lists InfluxDB 1.8 as a requirement; its Compose file includes InfluxDB.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken/blob/master/README.md','https://github.com/Boerderij/Varken/blob/master/docker-compose.yml')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project Compose file mounts /config for Varken configuration.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken/blob/master/docker-compose.yml')),
      'pricing',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The application is distributed under the MIT License.','source_urls',jsonb_build_array('https://github.com/Boerderij/Varken/blob/master/LICENSE'))
    ),
    technical_facts_checked_at=now(),updated_at=now()
  where id=v_app and license='No license file declared (all rights reserved by default)';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Varken fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>3 then raise exception 'Varken category set changed'; end if;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='monitoring-status';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Varken category update failed'; end if;
end;
$migration$;
commit;
