begin;
do $migration$
declare
  v_app uuid;
  v_categories text[];
  v_options jsonb;
  v_count integer;
begin
  select id into v_app from public.self_host_apps
  where slug='obsidian' and published is true and source_model='closed_source'
    and source_code_url is null and license='Proprietary software under the Obsidian Terms of Service';
  if v_app is null then raise exception 'Obsidian record changed since review'; end if;
  update public.self_host_app_category_links set category_id=(select id from public.self_host_app_categories where slug='knowledge-notes')
  where app_id=v_app and category_id=(select id from public.self_host_app_categories where slug='developer-tools');
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Obsidian category changed since review'; end if;

  select id into v_app from public.self_host_apps
  where slug='firefox' and published is true and source_code_url='https://github.com/jlesage/docker-firefox'
    and source_model='source_available' and license_spdx_id='MIT'
    and github_project_id='68728ec2-cbee-478b-993b-34a88bfa5679'::uuid
    and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'Firefox record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','identity-access','photos-galleries']::text[] then raise exception 'Firefox categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2 or not exists
    (select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/jlesage/firefox') then
    raise exception 'Firefox install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for a small browser session; tabs, extensions, video, and active sites affect memory use.',
    ram_source_urls=array['https://docs.linuxserver.io/images/docker-firefox/','https://www.mozilla.org/en-US/firefox/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=50,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for the browser profile, downloads, extensions, and cache.',
    storage_source_urls=array['https://docs.linuxserver.io/images/docker-firefox/','https://support.mozilla.org/en-US/products/firefox']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=2048 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=50 and storage_estimate_max_gb=500
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Firefox estimates changed'; end if;

  update public.self_host_apps set
    name='Firefox',summary='Mozilla web browser for browsing the internet on a remote desktop.',
    website_url='https://www.firefox.com/en-US/',source_code_url='https://github.com/mozilla-firefox/firefox',
    source_code_host='github',source_full_name='mozilla-firefox/firefox',source_repo_id=null,
    source_archived=false,source_disabled=false,source_is_fork=false,source_is_template=false,source_default_branch='main',
    source_checked_at=now(),source_latest_release=null,source_latest_release_at=null,source_created_at=null,source_updated_at=null,
    source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,source_languages='{}'::jsonb,
    source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    publisher_name='Mozilla Corporation',publisher_type='company',publisher_url='https://www.mozilla.org/',
    license='Mozilla Public License 2.0',license_spdx_id='MPL-2.0',license_type='copyleft',source_model='open_source',
    docs_url='https://support.mozilla.org/en-US/products/firefox',install_docs_url='https://docs.linuxserver.io/images/docker-firefox/',
    release_url='https://www.mozilla.org/en-US/firefox/releases/',release_version=null,release_published_at=null,release_checked_at=now(),
    pricing_model='free',docker_support='community',docker_url='https://hub.docker.com/r/linuxserver/firefox',
    docker_image='lscr.io/linuxserver/firefox:latest',compose_support=true,compose_url='https://docs.linuxserver.io/images/docker-firefox/',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://www.mozilla.org/en-US/firefox/',summary_confidence='high',
    data_source_urls=array[
      'https://www.firefox.com/en-US/','https://www.mozilla.org/en-US/about/legal/terms/firefox/',
      'https://www.mozilla.org/en-US/about/legal/firefox/','https://github.com/mozilla-firefox/firefox',
      'https://firefox-source-docs.mozilla.org/','https://support.mozilla.org/en-US/products/firefox',
      'https://docs.linuxserver.io/images/docker-firefox/','https://hub.docker.com/r/linuxserver/firefox',
      'https://github.com/jlesage/docker-firefox','https://hub.docker.com/r/jlesage/firefox',
      'https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/firefox.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Mozilla identifies Firefox as open-source software under MPL and other open-source licenses.','source_urls',jsonb_build_array('https://www.mozilla.org/en-US/about/legal/terms/firefox/','https://www.mozilla.org/en-US/about/legal/firefox/')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Mozilla Corporation is the publisher named in Firefox terms.','source_urls',jsonb_build_array('https://www.mozilla.org/en-US/about/legal/terms/firefox/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer and jlesage maintain separate community Firefox images.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/','https://github.com/jlesage/docker-firefox')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LinuxServer documents a Compose setup for its community image.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The browser container has no external database service.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The container persists its browser profile and local files.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The browser desktop is streamed to a web browser.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory planning range is estimated for a small browser session.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory planning range is estimated for a browser profile and cache.','source_urls',jsonb_build_array('https://docs.linuxserver.io/images/docker-firefox/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Firefox app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://hub.docker.com/r/linuxserver/firefox","note":"LinuxServer community image.","image":"lscr.io/linuxserver/firefox:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://docs.linuxserver.io/images/docker-firefox/","support_level":"community"},
      {"url":"https://hub.docker.com/r/jlesage/firefox","note":"jlesage community image.","image":"jlesage/firefox","label":"Docker image","method":"docker","sort_order":11,"source_url":"https://github.com/jlesage/docker-firefox","support_level":"community"},
      {"url":"https://docs.linuxserver.io/images/docker-firefox/","note":"Compose setup for the LinuxServer community image.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://docs.linuxserver.io/images/docker-firefox/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/firefox.xml","note":"jlesage community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/firefox.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/linuxserver/firefox','https://hub.docker.com/r/jlesage/firefox']::text[],
    docker_images=array['lscr.io/linuxserver/firefox:latest','jlesage/firefox']::text[],
    compose_urls=array['https://docs.linuxserver.io/images/docker-firefox/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/firefox.xml']::text[],
    source_urls=array['https://docs.linuxserver.io/images/docker-firefox/','https://hub.docker.com/r/linuxserver/firefox','https://github.com/jlesage/docker-firefox','https://hub.docker.com/r/jlesage/firefox','https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/firefox.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Firefox install options changed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id) select v_app,id from public.self_host_app_categories where slug='security-privacy';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Firefox category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='filebot' and published is true and source_code_url='https://github.com/jlesage/docker-filebot'
    and source_model='source_available' and license_spdx_id='MIT'
    and github_project_id='d0814253-3fc1-446b-92f7-bbaaf16ad77d'::uuid
    and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'FileBot record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','music-audio','photos-galleries']::text[] then raise exception 'FileBot categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2 or not exists
    (select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/jlesage/filebot') then
    raise exception 'FileBot install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=4096,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimated for the GUI, file matching, and metadata tasks; batch jobs may need more memory.',
    ram_source_urls=array['https://www.filebot.net/','https://github.com/filebot/filebot-docker','https://github.com/jlesage/docker-filebot']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated for application data, settings, cache, and small temporary jobs; media stays on mounted storage.',
    storage_source_urls=array['https://github.com/filebot/filebot-docker','https://github.com/jlesage/docker-filebot']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=2048 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=50 and storage_estimate_max_gb=500
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'FileBot estimates changed'; end if;

  update public.self_host_apps set
    name='FileBot',summary='Rename and organize movies, TV shows, anime, music, and other files with online metadata.',
    website_url='https://www.filebot.net/',source_code_url=null,source_code_host='unknown',source_full_name=null,source_repo_id=null,
    source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,source_default_branch=null,
    source_checked_at=null,source_latest_release=null,source_latest_release_at=null,source_created_at=null,source_updated_at=null,
    source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,source_languages='{}'::jsonb,
    source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    publisher_name='Point Planck Limited',publisher_type='company',publisher_url='https://www.filebot.net/',
    license='Proprietary software under the FileBot End User License Agreement',license_spdx_id=null,license_type='custom',source_model='closed_source',
    docs_url='https://www.filebot.net/manual.html',install_docs_url='https://github.com/filebot/filebot-docker',
    release_url='https://www.filebot.net/download.html',release_version='v5.3.0',release_published_at=null,release_checked_at=now(),
    pricing_model='paid',docker_support='official',docker_url='https://hub.docker.com/r/rednoah/filebot',
    docker_image='rednoah/filebot:node',compose_support=true,compose_url='https://github.com/filebot/filebot-docker',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['native','docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://www.filebot.net/',summary_confidence='high',
    data_source_urls=array[
      'https://www.filebot.net/','https://www.filebot.net/eula.html','https://www.filebot.net/download.html',
      'https://www.filebot.net/manual.html','https://github.com/filebot/filebot-docker',
      'https://hub.docker.com/r/rednoah/filebot','https://github.com/jlesage/docker-filebot',
      'https://hub.docker.com/r/jlesage/filebot','https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/filebot.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','FileBot is proprietary software under the publisher EULA.','source_urls',jsonb_build_array('https://www.filebot.net/eula.html')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','FileBot identifies Point Planck Limited as licensor and copyright holder.','source_urls',jsonb_build_array('https://www.filebot.net/','https://www.filebot.net/eula.html')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official FileBot project publishes Docker images; jlesage also maintains a community image.','source_urls',jsonb_build_array('https://github.com/filebot/filebot-docker','https://github.com/jlesage/docker-filebot')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official FileBot Docker repository includes Compose examples.','source_urls',jsonb_build_array('https://github.com/filebot/filebot-docker')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented containers do not require an external database.','source_urls',jsonb_build_array('https://github.com/filebot/filebot-docker','https://github.com/jlesage/docker-filebot')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Containers persist settings and access user media through mounted volumes.','source_urls',jsonb_build_array('https://github.com/filebot/filebot-docker','https://github.com/jlesage/docker-filebot')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official images include a command-line app, web app, and remote desktop UI.','source_urls',jsonb_build_array('https://github.com/filebot/filebot-docker')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory range is estimated for a small GUI and metadata workload.','source_urls',jsonb_build_array('https://www.filebot.net/','https://github.com/filebot/filebot-docker')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory range estimates app data and temporary files; media is mounted separately.','source_urls',jsonb_build_array('https://github.com/filebot/filebot-docker'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'FileBot app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://filebot.net/download.html","note":"FileBot publisher downloads.","image":null,"label":"Native app","method":"native","sort_order":5,"source_url":"https://www.filebot.net/download.html","support_level":"official"},
      {"url":"https://hub.docker.com/r/rednoah/filebot","note":"Official FileBot Docker image; the node tag includes the web interface.","image":"rednoah/filebot:node","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/filebot/filebot-docker","support_level":"official"},
      {"url":"https://github.com/filebot/filebot-docker","note":"Compose examples for official FileBot images.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/filebot/filebot-docker","support_level":"official"},
      {"url":"https://hub.docker.com/r/jlesage/filebot","note":"jlesage community image.","image":"jlesage/filebot","label":"Community Docker image","method":"docker","sort_order":11,"source_url":"https://github.com/jlesage/docker-filebot","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/filebot.xml","note":"jlesage community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/filebot.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/rednoah/filebot','https://hub.docker.com/r/jlesage/filebot']::text[],
    docker_images=array['rednoah/filebot:node','jlesage/filebot']::text[],
    compose_urls=array['https://github.com/filebot/filebot-docker']::text[],
    native_urls=array['https://www.filebot.net/download.html']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/filebot.xml']::text[],
    source_urls=array['https://github.com/filebot/filebot-docker','https://hub.docker.com/r/rednoah/filebot','https://github.com/jlesage/docker-filebot','https://hub.docker.com/r/jlesage/filebot','https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/filebot.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'FileBot install options changed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id) select v_app,id from public.self_host_app_categories where slug='automation';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'FileBot category update failed'; end if;

  select id into v_app from public.self_host_apps
  where slug='foundry' and published is true and source_code_url='https://github.com/felddy/foundryvtt-docker'
    and source_model='source_available' and license_spdx_id='MIT'
    and github_project_id='de0e47d0-e373-421b-b6c8-951b225244ba'::uuid
    and requires_database is null and persistent_storage is null;
  if v_app is null then raise exception 'Foundry record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','password-managers','photos-galleries']::text[] then raise exception 'Foundry categories changed'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is null or jsonb_array_length(v_options)<>2 or not exists
    (select 1 from jsonb_array_elements(v_options) e where e->>'url'='https://hub.docker.com/r/felddy/foundryvtt') then
    raise exception 'Foundry install options changed';
  end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=2048,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='medium',
    ram_estimate_basis='Estimated from Foundry dedicated-server minimum of 2 GB and 4 GB recommended; world content and modules increase use.',
    ram_source_urls=array['https://foundryvtt.com/article/requirements/','https://github.com/felddy/foundryvtt-docker']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=100,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Estimated from the 1 GB server minimum plus worlds, modules, and game assets.',
    storage_source_urls=array['https://foundryvtt.com/article/requirements/','https://foundryvtt.com/article/installation/','https://github.com/felddy/foundryvtt-docker']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=2048 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=50 and storage_estimate_max_gb=500
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Foundry estimates changed'; end if;

  update public.self_host_apps set
    name='Foundry Virtual Tabletop',summary='Virtual tabletop for hosting role-playing game sessions with game systems, maps, and shared worlds.',
    website_url='https://foundryvtt.com/',source_code_url=null,source_code_host='unknown',source_full_name=null,source_repo_id=null,
    source_archived=null,source_disabled=null,source_is_fork=null,source_is_template=null,source_default_branch=null,
    source_checked_at=null,source_latest_release=null,source_latest_release_at=null,source_created_at=null,source_updated_at=null,
    source_pushed_at=null,source_last_commit_at=null,source_primary_language=null,source_languages='{}'::jsonb,
    source_stars=null,source_forks=null,source_watchers=null,source_open_issues=null,source_repo_size_kb=null,
    github_project_id=null,github_owner=null,github_repo=null,github_full_name=null,github_repo_id=null,github_node_id=null,
    github_owner_type=null,github_checked_at=null,github_archived=null,github_disabled=null,github_is_fork=null,github_is_template=null,
    github_stars=null,github_forks=null,github_watchers=null,github_open_issues=null,github_primary_language=null,github_languages='{}'::jsonb,
    github_topics='{}'::text[],github_created_at=null,github_updated_at=null,github_pushed_at=null,github_last_commit_at=null,
    github_default_branch=null,github_repo_size_kb=null,github_latest_release=null,github_latest_release_at=null,
    publisher_name='Foundry Gaming LLC',publisher_type='company',publisher_url='https://foundryvtt.com/',
    license='Proprietary software under the Foundry Virtual Tabletop EULA',license_spdx_id=null,license_type='custom',source_model='closed_source',
    docs_url='https://foundryvtt.com/article/installation/',install_docs_url='https://github.com/felddy/foundryvtt-docker',
    release_url='https://foundryvtt.com/releases/',release_version=null,release_published_at=null,release_checked_at=now(),
    pricing_model='paid',docker_support='community',docker_url='https://hub.docker.com/r/felddy/foundryvtt',
    docker_image='felddy/foundryvtt:release',compose_support=true,compose_url='https://github.com/felddy/foundryvtt-docker',
    requires_database=false,database_types='{}'::text[],persistent_storage=true,storage_profile='depends',
    deployment_methods=array['native','docker','compose','unraid']::text[],surfaces=array['desktop','web']::text[],
    ram_mb=null,ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    summary_source='https://foundryvtt.com/',summary_confidence='high',
    data_source_urls=array[
      'https://foundryvtt.com/','https://foundryvtt.com/article/license/','https://foundryvtt.com/article/installation/',
      'https://foundryvtt.com/article/hosting/','https://foundryvtt.com/article/requirements/','https://foundryvtt.com/article/faq/',
      'https://github.com/felddy/foundryvtt-docker','https://hub.docker.com/r/felddy/foundryvtt',
      'https://raw.githubusercontent.com/silman/unraid_templates/main/foundry/foundry.xml'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Foundry is proprietary software under its EULA.','source_urls',jsonb_build_array('https://foundryvtt.com/article/license/')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Foundry Gaming LLC owns the software.','source_urls',jsonb_build_array('https://foundryvtt.com/article/license/')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Felddy maintains a community container; Foundry documents self-hosted native installs.','source_urls',jsonb_build_array('https://github.com/felddy/foundryvtt-docker','https://foundryvtt.com/article/installation/')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The community container repository provides Compose instructions.','source_urls',jsonb_build_array('https://github.com/felddy/foundryvtt-docker')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The dedicated server does not require a separate external database.','source_urls',jsonb_build_array('https://foundryvtt.com/article/requirements/','https://github.com/felddy/foundryvtt-docker')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Foundry stores user data in a persistent data folder.','source_urls',jsonb_build_array('https://foundryvtt.com/article/installation/','https://github.com/felddy/foundryvtt-docker')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Players connect through supported web browsers; a desktop application is also available.','source_urls',jsonb_build_array('https://foundryvtt.com/article/installation/','https://foundryvtt.com/article/hosting/')),
      'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official dedicated-server requirements list 2 GB minimum and 4 GB recommended.','source_urls',jsonb_build_array('https://foundryvtt.com/article/requirements/')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official dedicated-server requirements list at least 1 GB storage.','source_urls',jsonb_build_array('https://foundryvtt.com/article/requirements/'))
    ),technical_facts_checked_at=now(),updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Foundry app update failed'; end if;

  update public.self_host_app_install_options set
    options='[
      {"url":"https://foundryvtt.com/article/installation/","note":"Official Foundry self-hosting installation guide.","image":null,"label":"Native installation","method":"native","sort_order":5,"source_url":"https://foundryvtt.com/article/installation/","support_level":"official"},
      {"url":"https://hub.docker.com/r/felddy/foundryvtt","note":"Community-maintained container.","image":"felddy/foundryvtt:release","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/felddy/foundryvtt-docker","support_level":"community"},
      {"url":"https://github.com/felddy/foundryvtt-docker","note":"Compose setup for the Felddy community container.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/felddy/foundryvtt-docker","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/silman/unraid_templates/main/foundry/foundry.xml","note":"Community Unraid template.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/silman/unraid_templates/main/foundry/foundry.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/felddy/foundryvtt']::text[],
    docker_images=array['felddy/foundryvtt:release']::text[],
    compose_urls=array['https://github.com/felddy/foundryvtt-docker']::text[],
    native_urls=array['https://foundryvtt.com/article/installation/']::text[],
    unraid_urls=array['https://raw.githubusercontent.com/silman/unraid_templates/main/foundry/foundry.xml']::text[],
    source_urls=array['https://foundryvtt.com/article/installation/','https://github.com/felddy/foundryvtt-docker','https://hub.docker.com/r/felddy/foundryvtt','https://raw.githubusercontent.com/silman/unraid_templates/main/foundry/foundry.xml']::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Foundry install options changed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id) select v_app,id from public.self_host_app_categories where slug='games';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Foundry category update failed'; end if;
end
$migration$;
commit;
