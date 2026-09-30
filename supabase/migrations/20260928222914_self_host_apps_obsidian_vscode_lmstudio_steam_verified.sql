begin;

do $migration$
declare
  v_app uuid;
  v_expected_categories text[];
  v_actual_categories text[];
  v_options jsonb;
  v_count integer;
begin
  select id into v_app from public.self_host_apps
  where slug='obsidian' and published is true and source_model='open_source'
    and source_code_url='https://github.com/linuxserver/docker-obsidian'
    and license_spdx_id='GPL-3.0' and github_project_id='7bbae107-1c6c-4ea6-ae66-e1a61487d8a4'::uuid
    and docker_support='official' and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'Obsidian record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_actual_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_actual_categories is distinct from array['developer-tools']::text[] then raise exception 'Obsidian categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>3
    or not exists(select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/linuxserver/obsidian')
    or not exists(select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/obsidian/docker-compose.yml') then
    raise exception 'Obsidian install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for the browser-streamed desktop app and a small vault; vault size and plugins vary.',
    ram_source_urls=array['https://docs.linuxserver.io/images/docker-obsidian/','https://help.obsidian.md/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the app, settings, and a personal notes vault with attachments.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-obsidian/','https://help.obsidian.md/']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=256 and ram_estimate_max_mb=2048
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=1 and storage_estimate_max_gb=20
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Obsidian estimates changed'; end if;

  update public.self_host_apps set
    name='Obsidian',summary='Flexible note-taking and knowledge management app built around local notes.',
    website_url='https://obsidian.md/',source_code_url=null,source_code_host='unknown',source_full_name=null,source_repo_id=null,
    source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,source_default_branch=null,
    source_checked_at=null,source_latest_release=null,source_latest_release_at=null,source_created_at=null,source_updated_at=null,
    source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,source_languages='{}'::jsonb,
    source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    docs_url='https://help.obsidian.md/',install_docs_url='https://docs.linuxserver.io/images/docker-obsidian/',
    release_url='https://obsidian.md/download',release_version=null,release_published_at=null,release_checked_at=now(),
    license='Proprietary software under the Obsidian Terms of Service',license_spdx_id=null,license_type='custom',source_model='closed_source',
    publisher_name='Dynalist Inc.',publisher_type='company',publisher_url='https://obsidian.md/',pricing_model='freemium',
    docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/obsidian',
    docker_image='lscr.io/linuxserver/obsidian:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-obsidian/',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','umbrel']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://obsidian.md/',summary_confidence='high',
    data_source_urls=array[
      'https://obsidian.md/','https://obsidian.md/terms','https://obsidian.md/download','https://help.obsidian.md/',
      'https://docs.linuxserver.io/images/docker-obsidian/','https://hub.docker.com/r/linuxserver/obsidian',
      'https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/obsidian/docker-compose.yml',
      'https://github.com/getumbrel/umbrel-apps/tree/master/obsidian'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Obsidian software is proprietary under the publisher terms.','source_urls',jsonb_build_array('https://obsidian.md/terms')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Obsidian terms identify Dynalist Inc. as the company.','source_urls',jsonb_build_array('https://obsidian.md/terms')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer publishes a community Obsidian image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-obsidian/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer documents a Compose setup for its community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-obsidian/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented desktop container has no external database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-obsidian/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container persists configuration and local vault files.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-obsidian/','https://help.obsidian.md/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container streams the desktop application to a web browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-obsidian/')),
      'ram',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimated for a small browser-streamed desktop workload.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-obsidian/')),
      'storage',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimated for the app, settings, and a personal vault.','source_urls',jsonb_build_array('https://help.obsidian.md/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Obsidian app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/obsidian","note":"LinuxServer community image.","image":"lscr.io/linuxserver/obsidian:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-obsidian/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-obsidian/","note":"Compose setup for the LinuxServer community image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-obsidian/","support_level":"community"},
      {"url":"https://github.com/getumbrel/umbrel-apps/tree/master/obsidian","note":"Umbrel community catalog entry.","image":null,"label":"Umbrel catalog","method":"umbrel","sort_order":40,"source_url":"https://github.com/getumbrel/umbrel-apps/tree/master/obsidian","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/obsidian']::text[],
    docker_images=array['lscr.io/linuxserver/obsidian:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-obsidian/']::text[],
    umbrel_urls=array['https://github.com/getumbrel/umbrel-apps/tree/master/obsidian']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-obsidian/','https://hub.docker.com/r/linuxserver/obsidian','https://github.com/getumbrel/umbrel-apps/tree/master/obsidian']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Obsidian install options changed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='developer-tools';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Obsidian category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='vscode' and published is true and source_model='source_available'
    and source_code_url='https://github.com/linuxserver/docker-vscode'
    and license_spdx_id='GPL-3.0' and github_project_id='2fb875c6-e06e-4634-898e-c54d0d00dfb1'::uuid
    and docker_support='community' and compose_support is false and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'VS Code record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_actual_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_actual_categories is distinct from array['ai-ml','remote-access','system-admin-hosting']::text[] then raise exception 'VS Code categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists(select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/linuxserver/vscode') then
    raise exception 'VS Code install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=2048,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for a small remote development workspace; extensions, language servers, builds, and concurrent sessions add memory use.',
    ram_source_urls=array['https://code.visualstudio.com/docs','https://docs.linuxserver.io/images/docker-vscode/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=50,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the app, extensions, workspace files, and common development tools.',
    storage_source_urls=array['https://code.visualstudio.com/docs','https://docs.linuxserver.io/images/docker-vscode/']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=2048 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=1 and storage_estimate_max_gb=20
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'VS Code estimates changed'; end if;

  update public.self_host_apps set
    name='Visual Studio Code',summary='Code editor for building and debugging applications in a browser-based remote workspace.',
    website_url='https://code.visualstudio.com/',source_code_url='https://github.com/microsoft/vscode',source_code_host='github',
    source_full_name='microsoft/vscode',source_repo_id=null,source_archived=false,source_disabled=false,source_is_fork=false,
    source_is_template=false,source_default_branch='main',source_checked_at=now(),source_latest_release=null,source_latest_release_at=null,
    source_created_at=null,source_updated_at=null,source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,
    source_languages='{}'::jsonb,source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    docs_url='https://code.visualstudio.com/docs',install_docs_url='https://docs.linuxserver.io/images/docker-vscode/',
    release_url='https://code.visualstudio.com/updates',release_version=null,release_published_at=null,release_checked_at=now(),
    license='Microsoft Visual Studio Code product license; Code-OSS source is MIT',
    license_spdx_id=null,license_type='mixed',source_model='source_available',
    publisher_name='Microsoft',publisher_type='company',publisher_url='https://www.microsoft.com/',pricing_model='free',
    docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/vscode',
    docker_image='lscr.io/linuxserver/vscode:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-vscode/',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://code.visualstudio.com/docs',summary_confidence='high',
    data_source_urls=array[
      'https://code.visualstudio.com/','https://code.visualstudio.com/docs','https://code.visualstudio.com/license',
      'https://code.visualstudio.com/docs/supporting/faq','https://github.com/microsoft/vscode',
      'https://docs.linuxserver.io/images/docker-vscode/','https://hub.docker.com/r/linuxserver/vscode',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/vscode.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Microsoft product uses Microsoft terms; its Code-OSS source repository is MIT licensed.','source_urls',jsonb_build_array('https://code.visualstudio.com/license','https://code.visualstudio.com/docs/supporting/faq')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Microsoft publishes Visual Studio Code.','source_urls',jsonb_build_array('https://code.visualstudio.com/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer publishes a community container for Visual Studio Code.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-vscode/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose setup for its community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-vscode/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented editor container has no external database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-vscode/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container persists its user configuration and workspace files.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-vscode/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container streams the desktop editor to a web browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-vscode/')),
      'ram',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimate varies with extensions, builds, language servers, and sessions.','source_urls',jsonb_build_array('https://code.visualstudio.com/docs','https://docs.linuxserver.io/images/docker-vscode/')),
      'storage',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimate covers app, workspace, extensions, and tools.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-vscode/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'VS Code app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/vscode","note":"LinuxServer community image.","image":"lscr.io/linuxserver/vscode:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-vscode/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-vscode/","note":"Compose setup for the LinuxServer community image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-vscode/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/vscode.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/vscode.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/vscode']::text[],
    docker_images=array['lscr.io/linuxserver/vscode:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-vscode/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/vscode.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-vscode/','https://hub.docker.com/r/linuxserver/vscode','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/vscode.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'VS Code install options changed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='developer-tools';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'VS Code category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='lm-studio' and published is true and source_model='source_available'
    and source_code_url='https://github.com/linuxserver/docker-lm-studio'
    and license_spdx_id='GPL-3.0' and github_project_id='bafa5a46-2805-49c5-a8ad-88b5f41bfead'::uuid
    and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'LM Studio record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_actual_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_actual_categories is distinct from array['ai-ml']::text[] then raise exception 'LM Studio categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists(select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/linuxserver/lm-studio') then
    raise exception 'LM Studio install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=8192,ram_estimate_max_mb=65536,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated from LM Studio 16 GB recommended system memory, allowing smaller models at the low end and larger local models at the high end.',
    ram_source_urls=array['https://lmstudio.ai/docs/app/system-requirements','https://lmstudio.ai/docs/app/basics','https://docs.linuxserver.io/images/docker-lm-studio/']::text[],
    storage_estimate_min_gb=20,storage_estimate_max_gb=500,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the app and a collection of local model files; downloaded model size and count vary.',
    storage_source_urls=array['https://lmstudio.ai/docs/app','https://lmstudio.ai/docs/cli/local-models/ls','https://docs.linuxserver.io/images/docker-lm-studio/']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=8192 and ram_estimate_max_mb=32768
    and ram_estimate_basis='Small local model workload; model size and outputs vary.'
    and storage_estimate_min_gb=20 and storage_estimate_max_gb=100
    and storage_estimate_basis='Small local model workload; model size and outputs vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'LM Studio estimates changed'; end if;

  update public.self_host_apps set
    name='LM Studio',summary='Desktop app for downloading, running, and serving local language models.',
    website_url='https://lmstudio.ai/',source_code_url=null,source_code_host='unknown',source_full_name=null,source_repo_id=null,
    source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,source_default_branch=null,
    source_checked_at=null,source_latest_release=null,source_latest_release_at=null,source_created_at=null,source_updated_at=null,
    source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,source_languages='{}'::jsonb,
    source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    docs_url='https://lmstudio.ai/docs/app',install_docs_url='https://docs.linuxserver.io/images/docker-lm-studio/',
    release_url='https://lmstudio.ai/download',release_version=null,release_published_at=null,release_checked_at=now(),
    license='Proprietary software under the LM Studio App Terms',license_spdx_id=null,license_type='custom',source_model='closed_source',
    publisher_name='LM Studio',publisher_type='company',publisher_url='https://lmstudio.ai/',pricing_model='free',
    docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/lm-studio',
    docker_image='lscr.io/linuxserver/lm-studio:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-lm-studio/',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://lmstudio.ai/docs/app',summary_confidence='high',
    data_source_urls=array[
      'https://lmstudio.ai/','https://lmstudio.ai/app-terms','https://lmstudio.ai/docs/app',
      'https://lmstudio.ai/docs/app/system-requirements','https://lmstudio.ai/docs/app/basics',
      'https://lmstudio.ai/docs/cli/local-models/ls','https://lmstudio.ai/download',
      'https://docs.linuxserver.io/images/docker-lm-studio/','https://hub.docker.com/r/linuxserver/lm-studio',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/lm-studio.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The publisher terms treat the LM Studio app as proprietary software.','source_urls',jsonb_build_array('https://lmstudio.ai/app-terms')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LM Studio publishes the app and its documentation.','source_urls',jsonb_build_array('https://lmstudio.ai/','https://lmstudio.ai/app-terms')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer publishes a community container for LM Studio.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-lm-studio/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose setup for its community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-lm-studio/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The app container has no separate database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-lm-studio/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Model files, settings, and app data are stored persistently.','source_urls',jsonb_build_array('https://lmstudio.ai/docs/app','https://docs.linuxserver.io/images/docker-lm-studio/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The desktop app is delivered through a browser interface in the community container.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-lm-studio/')),
      'ram',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimate reflects recommended system memory and variable local model sizes.','source_urls',jsonb_build_array('https://lmstudio.ai/docs/app/system-requirements','https://lmstudio.ai/docs/app/basics')),
      'storage',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimate reflects variable local model file sizes and count.','source_urls',jsonb_build_array('https://lmstudio.ai/docs/app','https://lmstudio.ai/docs/cli/local-models/ls'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'LM Studio app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/lm-studio","note":"LinuxServer community image.","image":"lscr.io/linuxserver/lm-studio:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-lm-studio/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-lm-studio/","note":"Compose setup for the LinuxServer community image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-lm-studio/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/lm-studio.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/lm-studio.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/lm-studio']::text[],
    docker_images=array['lscr.io/linuxserver/lm-studio:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-lm-studio/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/lm-studio.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-lm-studio/','https://hub.docker.com/r/linuxserver/lm-studio','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/lm-studio.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'LM Studio install options changed'; end if;

  select id into v_app from public.self_host_apps
  where slug='steam' and published is true and source_model='source_available'
    and source_code_url='https://github.com/linuxserver/docker-steam'
    and license_spdx_id='GPL-3.0' and github_project_id='b24de252-5edb-4674-93b0-dd7b3a7cea85'::uuid
    and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'Steam record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_actual_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_actual_categories is distinct from array['games','project-task-management']::text[] then raise exception 'Steam categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2
    or not exists(select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/linuxserver/steam') then
    raise exception 'Steam install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=2048,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for the streamed Steam desktop client and a light gaming session; games and graphics workloads need more.',
    ram_source_urls=array['https://docs.linuxserver.io/images/docker-steam/','https://store.steampowered.com/about/']::text[],
    storage_estimate_min_gb=20,storage_estimate_max_gb=500,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the client and a small-to-large selection of installed games.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-steam/','https://store.steampowered.com/about/']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=1024 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Small single-node service; active users and stored content vary.'
    and storage_estimate_min_gb=10 and storage_estimate_max_gb=100
    and storage_estimate_basis='Small single-node service; active users and stored content vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Steam estimates changed'; end if;

  update public.self_host_apps set
    name='Steam',summary='Game store and desktop client for browsing, installing, and playing PC games.',
    website_url='https://store.steampowered.com/about/',source_code_url=null,source_code_host='unknown',source_full_name=null,source_repo_id=null,
    source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,source_default_branch=null,
    source_checked_at=null,source_latest_release=null,source_latest_release_at=null,source_created_at=null,source_updated_at=null,
    source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,source_languages='{}'::jsonb,
    source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    docs_url='https://help.steampowered.com/en/',install_docs_url='https://docs.linuxserver.io/images/docker-steam/',
    release_url=null,release_version=null,release_published_at=null,release_checked_at=now(),
    license='Proprietary software under the Steam Subscriber Agreement',license_spdx_id=null,license_type='custom',source_model='closed_source',
    publisher_name='Valve Corporation',publisher_type='company',publisher_url='https://www.valvesoftware.com/',pricing_model='free',
    docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/steam',
    docker_image='lscr.io/linuxserver/steam:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-steam/',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://store.steampowered.com/about/',summary_confidence='high',
    data_source_urls=array[
      'https://store.steampowered.com/about/','https://store.steampowered.com/subscriber_agreement/?l=english',
      'https://help.steampowered.com/en/','https://www.valvesoftware.com/',
      'https://docs.linuxserver.io/images/docker-steam/','https://hub.docker.com/r/linuxserver/steam',
      'https://raw.githubusercontent.com/linuxserver/templates/main/unraid/steam.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Steam software is proprietary and licensed under Valve’s subscriber agreement.','source_urls',jsonb_build_array('https://store.steampowered.com/subscriber_agreement/?l=english')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Valve Corporation operates Steam.','source_urls',jsonb_build_array('https://store.steampowered.com/subscriber_agreement/?l=english','https://www.valvesoftware.com/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer publishes a community container for the Steam desktop client.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer provides a Compose setup for its community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented desktop client container has no external database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container stores client files and installed games in persistent volumes.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The desktop client is streamed through a browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/')),
      'ram',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimate varies with the streamed desktop session and games.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/')),
      'storage',jsonb_build_object('status','estimated','checked_at','2026-09-29','confidence','low','note','Estimate varies with the installed game library.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-steam/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Steam app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/steam","note":"LinuxServer community image.","image":"lscr.io/linuxserver/steam:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-steam/","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-steam/","note":"Compose setup for the LinuxServer community image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-steam/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/steam.xml","note":"LinuxServer community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/linuxserver/templates/main/unraid/steam.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/steam']::text[],
    docker_images=array['lscr.io/linuxserver/steam:latest']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-steam/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/linuxserver/templates/main/unraid/steam.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-steam/','https://hub.docker.com/r/linuxserver/steam','https://raw.githubusercontent.com/linuxserver/templates/main/unraid/steam.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Steam install options changed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='games';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Steam category update failed'; end if;
end
$migration$;

commit;
