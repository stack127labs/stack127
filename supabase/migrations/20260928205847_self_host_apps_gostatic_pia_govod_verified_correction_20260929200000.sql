begin;

do $migration$
declare
  v_govod uuid;
  v_gostatic uuid;
  v_pia uuid;
  v_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_govod
  from public.self_host_apps a
  where a.slug='go-vod' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='go-vod'
    and a.summary='Unraid Docker based transcoder for Nextcloud Memories Links.'
    and a.website_url is null and a.source_code_url is null
    and a.source_model='closed_source' and a.license is null and a.license_type='unknown' and a.license_spdx_id is null
    and a.source_code_host='unknown' and a.source_full_name is null and a.github_owner is null and a.github_repo is null and a.github_full_name is null
    and a.publisher_name='go-vod' and a.publisher_type='unknown' and a.publisher_url='https://hub.docker.com/r/radialapps/go-vod/'
    and a.pricing_model='unknown' and a.docs_url is null and a.install_docs_url is null and a.docker_url='https://hub.docker.com/r/radialapps/go-vod/'
    and a.storage_profile='unknown' and a.docker_support='community' and a.docker_image='radialapps/go-vod:latest'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null and a.database_types='{}'::text[]
    and a.persistent_storage is null and a.surfaces=array['web']::text[] and a.deployment_methods=array['docker','unraid']::text[]
    and a.summary_source='curated' and a.summary_confidence='high';
  if v_govod is null then raise exception 'go-vod record changed since review'; end if;

  select a.id into v_gostatic
  from public.self_host_apps a
  where a.slug='gostatic' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='goStatic' and a.summary='Small static web server for serving files from a directory.'
    and a.website_url is null and a.source_code_url is null
    and a.source_model='closed_source' and a.license is null and a.license_type='unknown' and a.license_spdx_id is null
    and a.source_code_host='unknown' and a.source_full_name is null and a.github_owner is null and a.github_repo is null and a.github_full_name is null
    and a.publisher_name='goStatic' and a.publisher_type='unknown' and a.publisher_url='https://hub.docker.com/r/pierrezemb/gostatic'
    and a.pricing_model='unknown' and a.docs_url is null and a.install_docs_url is null and a.docker_url='https://hub.docker.com/r/pierrezemb/gostatic'
    and a.storage_profile='unknown' and a.docker_support='community' and a.docker_image='pierrezemb/gostatic'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null and a.database_types='{}'::text[]
    and a.persistent_storage is null and a.surfaces=array['web']::text[] and a.deployment_methods=array['docker','unraid']::text[]
    and a.summary_source='curated' and a.summary_confidence='high';
  if v_gostatic is null then raise exception 'goStatic record changed since review'; end if;

  select a.id into v_pia
  from public.self_host_apps a
  where a.slug='pia-wg-config-generator' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='PIA-WG-Config-Generator'
    and a.summary='Generator for Private Internet Access WireGuard configurations and per-container VPN routing.'
    and a.website_url is null and a.source_code_url is null
    and a.source_model='closed_source' and a.license is null and a.license_type='unknown' and a.license_spdx_id is null
    and a.source_code_host='unknown' and a.source_full_name is null and a.github_owner is null and a.github_repo is null and a.github_full_name is null
    and a.publisher_name='PIA-WG-Config-Generator' and a.publisher_type='unknown' and a.publisher_url='https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator/tags'
    and a.pricing_model='unknown' and a.docs_url is null and a.install_docs_url is null
    and a.docker_url='https://registry.hub.docker.com/r/spaceinvaderone/pia-wg-config-generator'
    and a.storage_profile='unknown' and a.docker_support='community' and a.docker_image='spaceinvaderone/pia-wg-config-generator:latest'
    and a.compose_support is false and a.compose_url is null and a.requires_database is null and a.database_types='{}'::text[]
    and a.persistent_storage is null and a.surfaces=array['web']::text[] and a.deployment_methods=array['docker','unraid']::text[]
    and a.summary_source='curated' and a.summary_confidence='high';
  if v_pia is null then raise exception 'PIA generator record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_govod;
  if v_categories is distinct from array['ai-ml','photos-galleries','video-conferencing']::text[] then raise exception 'go-vod categories changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_gostatic;
  if v_categories is distinct from array['ai-ml','networking-dns','system-admin-hosting']::text[] then raise exception 'goStatic categories changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_pia;
  if v_categories is distinct from array['ai-ml','identity-access','password-managers']::text[] then raise exception 'PIA generator categories changed since review'; end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_govod for update;
  if v_options is distinct from $govod_old$[
    {"url":"https://hub.docker.com/r/radialapps/go-vod/","note":"Community-maintained image. Verify the publisher before pulling.","image":"radialapps/go-vod:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/radialapps/go-vod/","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml","support_level":"community"}
  ]$govod_old$::jsonb then raise exception 'go-vod install options changed since review'; end if;
  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_gostatic for update;
  if v_options is distinct from $gostatic_old$[
    {"url":"https://hub.docker.com/r/pierrezemb/gostatic","note":"Community-maintained image. Verify the publisher before pulling.","image":"pierrezemb/gostatic","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/pierrezemb/gostatic","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/redvex2460/docker-templates/master/redvex2460/gostatic.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/redvex2460/docker-templates/master/redvex2460/gostatic.xml","support_level":"community"}
  ]$gostatic_old$::jsonb then raise exception 'goStatic install options changed since review'; end if;
  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_pia for update;
  if v_options is distinct from $pia_old$[
    {"url":"https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator","note":"Community-maintained image. Verify the publisher before pulling.","image":"spaceinvaderone/pia-wg-config-generator:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://registry.hub.docker.com/r/spaceinvaderone/pia-wg-config-generator","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/PIA-WG-Config-Generator.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/SpaceinvaderOne/Docker-Templates-Unraid/master/spaceinvaderone/PIA-WG-Config-Generator.xml","support_level":"community"}
  ]$pia_old$::jsonb then raise exception 'PIA generator install options changed since review'; end if;

  update public.self_host_apps a set
    name='go-vod',summary='An external video transcoder for Nextcloud Memories that can use CPU or GPU acceleration.',
    website_url='https://memories.gallery/',source_code_url='https://github.com/pulsejet/memories/tree/master/go-vod',source_code_host='github',
    source_full_name='pulsejet/memories',github_owner='pulsejet',github_repo='memories',github_full_name='pulsejet/memories',
    docs_url='https://memories.gallery/hw-transcoding/',install_docs_url='https://memories.gallery/hw-transcoding/',
    docker_url='https://hub.docker.com/r/radialapps/go-vod',license='Apache License 2.0',license_type='permissive',license_spdx_id='Apache-2.0',source_model='open_source',
    publisher_name='Memories project',publisher_type='community',publisher_url='https://memories.gallery/',pricing_model='free',
    docker_support='community',docker_image='radialapps/go-vod:latest',compose_support=true,compose_url='https://memories.gallery/hw-transcoding/',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',surfaces=array['api']::text[],deployment_methods=array['docker','unraid']::text[],
    summary_source='https://github.com/pulsejet/memories/tree/master/go-vod',summary_confidence='high',
    data_source_urls=array['https://github.com/pulsejet/memories/tree/master/go-vod','https://github.com/pulsejet/memories/blob/master/go-vod/LICENSE','https://memories.gallery/hw-transcoding/','https://hub.docker.com/r/radialapps/go-vod','https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The go-vod subdirectory has an Apache 2.0 license.','source_urls',jsonb_build_array('https://github.com/pulsejet/memories/blob/master/go-vod/LICENSE')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Memories guide documents the external Docker image.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/','https://hub.docker.com/r/radialapps/go-vod')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Docker image is published by radialapps and is the image shown in the official guide.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/','https://hub.docker.com/r/radialapps/go-vod')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official hardware transcoding guide provides a Compose setup.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The external transcoder setup has no separate database service.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The guide recommends a persistent volume for keyframes and storyboard cache.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','go-vod serves HLS video streams through an HTTP API.','source_urls',jsonb_build_array('https://github.com/pulsejet/memories/tree/master/go-vod')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM value is an estimate for video transcoding workload.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage value is an estimate for the persistent video cache.','source_urls',jsonb_build_array('https://memories.gallery/hw-transcoding/'))
    ),updated_at=now()
  where a.id=v_govod;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'go-vod app update failed'; end if;

  update public.self_host_apps a set
    name='goStatic',summary='goStatic is a small HTTP server for serving static files from a directory.',
    website_url='https://github.com/PierreZ/goStatic',source_code_url='https://github.com/PierreZ/goStatic',source_code_host='github',
    source_full_name='PierreZ/goStatic',github_owner='PierreZ',github_repo='goStatic',github_full_name='PierreZ/goStatic',
    docs_url='https://github.com/PierreZ/goStatic#readme',install_docs_url='https://github.com/PierreZ/goStatic#how-to-use',
    docker_url='https://hub.docker.com/r/pierrezemb/gostatic',license='GNU General Public License version 2.0',license_type='copyleft',license_spdx_id='GPL-2.0',source_model='open_source',
    publisher_name='Pierre Zemb',publisher_type='individual',publisher_url='https://github.com/PierreZ',pricing_model='free',
    docker_support='official',docker_image='pierrezemb/gostatic:latest',compose_support=null,compose_url=null,
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',surfaces=array['web']::text[],deployment_methods=array['docker','unraid']::text[],
    summary_source='https://github.com/PierreZ/goStatic',summary_confidence='high',
    data_source_urls=array['https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic','https://ca.unraid.net/apps/gostatic-0lf17ai1tblcfa']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','GitHub identifies the repository license as GPL-2.0.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README documents its Docker image.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README and Docker Hub page identify pierrezemb/gostatic.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic')),
      'compose',jsonb_build_object('status','unchecked','checked_at','2026-09-29','confidence','low','note','The reviewed project README shows Docker CLI setup.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The static web server does not require a separate database.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Docker example mounts the website directory at /srv/http.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','goStatic serves static files over HTTP.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM value is an estimate for a small Go web server.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage value is an estimate for static files and logs.','source_urls',jsonb_build_array('https://github.com/PierreZ/goStatic'))
    ),updated_at=now()
  where a.id=v_gostatic;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'goStatic app update failed'; end if;

  update public.self_host_apps a set
    name='PIA WireGuard Config Generator',summary='Generates WireGuard configuration files for Private Internet Access subscribers.',
    website_url='https://github.com/SpaceinvaderOne/pia-wg-config-generator',source_code_url='https://github.com/SpaceinvaderOne/pia-wg-config-generator',source_code_host='github',
    source_full_name='SpaceinvaderOne/pia-wg-config-generator',github_owner='SpaceinvaderOne',github_repo='pia-wg-config-generator',github_full_name='SpaceinvaderOne/pia-wg-config-generator',
    docs_url='https://github.com/SpaceinvaderOne/pia-wg-config-generator#readme',install_docs_url='https://github.com/SpaceinvaderOne/pia-wg-config-generator#docker-cli',
    docker_url='https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator',license='MIT License',license_type='permissive',license_spdx_id='MIT',source_model='open_source',
    publisher_name='SpaceinvaderOne',publisher_type='individual',publisher_url='https://github.com/SpaceinvaderOne',pricing_model='free',
    docker_support='official',docker_image='spaceinvaderone/pia-wg-config-generator:latest',compose_support=null,compose_url=null,
    requires_database=false,database_types='{}',persistent_storage=false,storage_profile='tiny',surfaces=array['web']::text[],deployment_methods=array['docker','unraid']::text[],
    summary_source='https://github.com/SpaceinvaderOne/pia-wg-config-generator',summary_confidence='high',
    data_source_urls=array['https://github.com/SpaceinvaderOne/pia-wg-config-generator','https://github.com/SpaceinvaderOne/pia-wg-config-generator/blob/master/README.md','https://github.com/SpaceinvaderOne/pia-wg-config-generator/blob/master/LICENSE','https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README identifies the MIT License.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator/blob/master/LICENSE')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project README documents the Docker image and run command.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator','https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project publishes spaceinvaderone/pia-wg-config-generator.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator','https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator')),
      'compose',jsonb_build_object('status','unchecked','checked_at','2026-09-29','confidence','low','note','The reviewed README gives Docker CLI and Unraid installation steps.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The single-container generator does not require an external database.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project says container credentials are not stored and generated configs are downloaded by the user.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The project provides a web interface.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM value is an estimate for a small nginx and Flask tool.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage value is an estimate for the application and logs.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/pia-wg-config-generator'))
    ),updated_at=now()
  where a.id=v_pia;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'PIA generator app update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_govod;
  insert into public.self_host_app_category_links(app_id,category_id) select v_govod,c.id from public.self_host_app_categories c where c.slug='media-servers';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'go-vod category update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_gostatic;
  insert into public.self_host_app_category_links(app_id,category_id) select v_gostatic,c.id from public.self_host_app_categories c where c.slug in ('content-publishing','system-admin-hosting');
  get diagnostics v_affected=row_count; if v_affected<>2 then raise exception 'goStatic category update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_pia;
  insert into public.self_host_app_category_links(app_id,category_id) select v_pia,c.id from public.self_host_app_categories c where c.slug in ('networking-dns','security-privacy');
  get diagnostics v_affected=row_count; if v_affected<>2 then raise exception 'PIA generator category update failed'; end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_govod for update;
  update public.self_host_app_install_options io set
    options=$govod_new$[
      {"url":"https://hub.docker.com/r/radialapps/go-vod","note":"Community image recommended by the official Memories transcoding guide.","image":"radialapps/go-vod:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://memories.gallery/hw-transcoding/","support_level":"community"},
      {"url":"https://memories.gallery/hw-transcoding/","note":"The official guide includes a Docker Compose setup using the community image.","image":"radialapps/go-vod:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://memories.gallery/hw-transcoding/","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml","note":"Community Unraid template for the external Memories transcoder.","image":"radialapps/go-vod:latest","label":"Unraid template","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml","support_level":"community"}
    ]$govod_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/radialapps/go-vod']::text[],docker_images=array['radialapps/go-vod:latest']::text[],
    compose_urls=array['https://memories.gallery/hw-transcoding/']::text[],unraid_urls=array['https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml']::text[],
    source_urls=array['https://memories.gallery/hw-transcoding/','https://hub.docker.com/r/radialapps/go-vod','https://raw.githubusercontent.com/glls/Docker-Templates-Unraid/main/go-vod.xml']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_govod and io.options=v_options;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'go-vod install options update failed'; end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_gostatic;
  update public.self_host_app_install_options io set
    options=$gostatic_new$[
      {"url":"https://hub.docker.com/r/pierrezemb/gostatic","note":"Image published under the project authors Docker Hub account; repository README documents this image.","image":"pierrezemb/gostatic:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/PierreZ/goStatic","support_level":"official"},
      {"url":"https://ca.unraid.net/apps/gostatic-0lf17ai1tblcfa","note":"Unraid Community Applications listing maintained by RedVex.","image":"pierrezemb/gostatic:latest","label":"Unraid Community Applications","method":"unraid","sort_order":35,"source_url":"https://ca.unraid.net/apps/gostatic-0lf17ai1tblcfa","support_level":"community"}
    ]$gostatic_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/pierrezemb/gostatic']::text[],docker_images=array['pierrezemb/gostatic:latest']::text[],
    compose_urls='{}',unraid_urls=array['https://ca.unraid.net/apps/gostatic-0lf17ai1tblcfa']::text[],
    source_urls=array['https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic','https://ca.unraid.net/apps/gostatic-0lf17ai1tblcfa']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_gostatic and io.options=v_options;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'goStatic install options update failed'; end if;

  select io.options into v_options from public.self_host_app_install_options io where io.app_id=v_pia;
  update public.self_host_app_install_options io set
    options=$pia_new$[
      {"url":"https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator","note":"Official Docker image published by the project maintainer.","image":"spaceinvaderone/pia-wg-config-generator:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/SpaceinvaderOne/pia-wg-config-generator","support_level":"official"},
      {"url":"https://github.com/SpaceinvaderOne/pia-wg-config-generator#unraid-users","note":"The project README says to install it from Unraid Community Applications.","image":"spaceinvaderone/pia-wg-config-generator:latest","label":"Unraid Community Applications","method":"unraid","sort_order":35,"source_url":"https://github.com/SpaceinvaderOne/pia-wg-config-generator#unraid-users","support_level":"community"}
    ]$pia_new$::jsonb,
    docker_urls=array['https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator']::text[],docker_images=array['spaceinvaderone/pia-wg-config-generator:latest']::text[],
    compose_urls='{}',unraid_urls=array['https://github.com/SpaceinvaderOne/pia-wg-config-generator#unraid-users']::text[],
    source_urls=array['https://github.com/SpaceinvaderOne/pia-wg-config-generator','https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator']::text[],
    checked_at=now(),updated_at=now()
  where io.app_id=v_pia and io.options=v_options;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'PIA generator install options update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for an external transcoder; CPU or GPU processing and simultaneous video jobs affect memory use.',
    ram_source_urls=array['https://memories.gallery/hw-transcoding/','https://hub.docker.com/r/radialapps/go-vod']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=50,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The persistent keyframe and storyboard cache grows with the number and size of processed videos.',
    storage_source_urls=array['https://memories.gallery/hw-transcoding/','https://hub.docker.com/r/radialapps/go-vod']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_govod and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Small single-node service; active users and stored content vary.'
    and e.storage_estimate_min_gb=50 and e.storage_estimate_max_gb=500
    and e.storage_estimate_basis='Small single-node service; active users and stored content vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'go-vod estimates changed since review'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=32,ram_estimate_max_mb=256,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for the small Go static web server; request volume and enabled logging affect memory use.',
    ram_source_urls=array['https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The static site files are served from a mounted directory; site size and log retention determine storage use.',
    storage_source_urls=array['https://github.com/PierreZ/goStatic','https://hub.docker.com/r/pierrezemb/gostatic']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_gostatic and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'goStatic estimates changed since review'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=128,ram_estimate_max_mb=512,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for the single-container nginx and Flask web tool with occasional configuration generation.',
    ram_source_urls=array['https://github.com/SpaceinvaderOne/pia-wg-config-generator','https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=5,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The container does not store credentials and generated configuration files download to the user; this range covers the app and logs.',
    storage_source_urls=array['https://github.com/SpaceinvaderOne/pia-wg-config-generator','https://hub.docker.com/r/spaceinvaderone/pia-wg-config-generator']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_pia and e.ram_estimate_min_mb=2048 and e.ram_estimate_max_mb=8192
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'PIA generator estimates changed since review'; end if;
end
$migration$;

commit;
