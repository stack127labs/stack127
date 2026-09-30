begin;
do $migration$
declare
  v_app uuid;
  v_options jsonb;
  v_categories text[];
  v_count integer;
begin
  select id into v_app from public.self_host_apps
  where slug='alloy' and published is true
    and source_code_url='https://github.com/grafana/alloy'
    and source_model='open_source' and license_spdx_id='Apache-2.0'
    and docker_support='community' and docker_image='grafana/alloy:latest'
  for update;
  if v_app is null then raise exception 'Alloy record changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from $alloy_options$[
    {"url":"https://hub.docker.com/r/grafana/alloy","note":"Community-maintained image. Verify the publisher before pulling.","image":"grafana/alloy:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/grafana/alloy","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/ccmpbll/unraid-docker-templates/master/templates/grafana-alloy.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/ccmpbll/unraid-docker-templates/master/templates/grafana-alloy.xml","support_level":"community"}
  ]$alloy_options$::jsonb then raise exception 'Alloy install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(
      jsonb_build_object('url','https://hub.docker.com/r/grafana/alloy','note','Grafana Docker documentation uses this image.','image','grafana/alloy:latest','label','Official Docker image','method','docker','sort_order',10,'source_url','https://grafana.com/docs/alloy/latest/set-up/install/docker/','support_level','official'),
      v_options->1
    ),
    docker_urls=array['https://hub.docker.com/r/grafana/alloy']::text[],
    docker_images=array['grafana/alloy:latest']::text[],
    source_urls=array(select distinct url from unnest(coalesce(source_urls,'{}')||array['https://grafana.com/docs/alloy/latest/set-up/install/docker/']::text[]) as refs(url) order by url),
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Alloy install option update failed'; end if;
  update public.self_host_apps set
    docker_support='official',
    docker_url='https://hub.docker.com/r/grafana/alloy',
    requires_database=false,
    persistent_storage=true,
    pricing_model='free',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://grafana.com/docs/alloy/latest/set-up/install/docker/',
      'https://grafana.com/docs/alloy/latest/set-up/estimate-resource-usage/'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Grafana documents grafana/alloy:latest as the Docker image and provides run instructions.','source_urls',jsonb_build_array('https://grafana.com/docs/alloy/latest/set-up/install/docker/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The Alloy install and deployment docs describe its own storage path and do not require an external database.','source_urls',jsonb_build_array('https://grafana.com/docs/alloy/latest/set-up/install/docker/'))
    ),
    updated_at=now()
  where id=v_app;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Alloy fact update failed'; end if;

  update public.self_host_app_resource_estimates set
    ram_estimate_basis='Small telemetry pipeline; active series, log throughput, and profile volume drive memory use.',
    ram_source_urls=array['https://grafana.com/docs/alloy/latest/set-up/estimate-resource-usage/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,
    storage_estimate_basis='The local data path stores component state and write-ahead data; buffering and telemetry volume drive space.',
    storage_source_urls=array['https://grafana.com/docs/alloy/latest/set-up/install/docker/']::text[],
    ram_note=null,storage_note=null,checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=256 and ram_estimate_max_mb=2048
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=5 and storage_estimate_max_gb=100
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Alloy resource estimate changed since review'; end if;

  select id into v_app from public.self_host_apps
  where slug='bark-server' and published is true
    and name='Bark-Server' and website_url='https://bark.day.app/'
    and source_code_url is null and source_code_host='unknown'
    and source_model='closed_source' and license is null and license_spdx_id is null
    and license_type='unknown' and publisher_name='Bark-Server' and publisher_type='unknown'
    and docker_support='community' and compose_support=false and compose_url is null
  for update;
  if v_app is null then raise exception 'Bark Server record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['system-admin-hosting']::text[] then raise exception 'Bark Server categories changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from $bark_options$[
    {"url":"https://hub.docker.com/r/finab/bark-server","note":"Community-maintained image. Verify the publisher before pulling.","image":"finab/bark-server:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/finab/bark-server","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/bark.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/bark.xml","support_level":"community"}
  ]$bark_options$::jsonb then raise exception 'Bark Server install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(
      jsonb_build_object('url','https://hub.docker.com/r/finab/bark-server','note','The Bark project README documents this image.','image','finab/bark-server:latest','label','Official Docker image','method','docker','sort_order',10,'source_url','https://github.com/Finb/bark-server#installation','support_level','official'),
      jsonb_build_object('url','https://github.com/Finb/bark-server/blob/master/deploy/docker-compose.yaml','note','Compose file provided by the Bark project.','image',null,'label','Docker Compose','method','compose','sort_order',20,'source_url','https://github.com/Finb/bark-server#installation','support_level','official'),
      jsonb_build_object('url','https://github.com/Finb/bark-server/releases','note',null,'image',null,'label','Binary release','method','binary','sort_order',30,'source_url','https://github.com/Finb/bark-server#installation','support_level','official'),
      v_options->1
    ),
    docker_urls=array['https://hub.docker.com/r/finab/bark-server']::text[],
    docker_images=array['finab/bark-server:latest']::text[],
    compose_urls=array['https://github.com/Finb/bark-server/blob/master/deploy/docker-compose.yaml']::text[],
    binary_urls=array['https://github.com/Finb/bark-server/releases']::text[],
    source_urls=array(select distinct url from unnest(coalesce(source_urls,'{}')||array[
      'https://github.com/Finb/bark-server',
      'https://github.com/Finb/bark-server#installation',
      'https://github.com/Finb/bark-server/blob/master/deploy/docker-compose.yaml',
      'https://github.com/Finb/bark-server/releases'
    ]::text[]) as refs(url) order by url),
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Bark Server install option update failed'; end if;
  update public.self_host_apps set
    name='Bark Server',
    summary='Self-hosted backend for the Bark iOS app that sends push notifications to your devices.',
    summary_source='https://github.com/Finb/bark-server#readme',summary_confidence='high',
    source_code_url='https://github.com/Finb/bark-server',source_code_host='github',source_model='open_source',
    license='MIT',license_spdx_id='MIT',license_type='permissive',
    publisher_name='Finb',publisher_type='community',publisher_url='https://github.com/Finb',
    docs_url='https://github.com/Finb/bark-server',
    install_docs_url='https://github.com/Finb/bark-server#installation',
    docker_support='official',compose_support=true,
    compose_url='https://github.com/Finb/bark-server/blob/master/deploy/docker-compose.yaml',
    requires_database=false,persistent_storage=true,pricing_model='free',
    deployment_methods=array['binary','compose','docker','unraid']::text[],
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://github.com/Finb/bark-server',
      'https://github.com/Finb/bark-server/blob/master/LICENSE',
      'https://github.com/Finb/bark-server/blob/master/deploy/docker-compose.yaml',
      'https://github.com/Finb/bark-server/releases',
      'https://bark.day.app/'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The Bark site links to the Finb/bark-server source repository.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server','https://bark.day.app/')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The official repository identifies the project as MIT licensed.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server/blob/master/LICENSE')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The official Bark repository is maintained under the Finb project account.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The README documents the finab/bark-server image.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server#installation')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The README links to the project Compose file.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server/blob/master/deploy/docker-compose.yaml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Bark defaults to its embedded Bbolt store; MySQL is optional.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server#readme')),
      'persistence',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The README states that Bark stores data under /data by default.','source_urls',jsonb_build_array('https://github.com/Finb/bark-server#readme'))
    ),
    updated_at=now()
  where id=v_app and name='Bark-Server' and source_code_url is null and source_model='closed_source'
    and license is null and license_type='unknown' and publisher_type='unknown'
    and docker_support='community' and compose_support=false;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Bark Server fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='communication';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Bark Server category update failed'; end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=128,ram_estimate_max_mb=512,
    ram_estimate_basis='Small Go push service; ordinary request load and the embedded Bbolt store drive memory.',
    ram_source_urls=array['https://github.com/Finb/bark-server']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=10,
    storage_estimate_basis='The persistent /data directory stores the embedded database and notification data.',
    storage_source_urls=array['https://github.com/Finb/bark-server#readme']::text[],
    ram_note=null,storage_note=null,checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=256 and ram_estimate_max_mb=2048
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=1 and storage_estimate_max_gb=20
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'Bark Server resource estimate changed since review'; end if;

  select id into v_app from public.self_host_apps
  where slug='iptvnator-backend' and published is true
    and name='IPTVnator---Backend' and source_code_url is null
    and source_model='closed_source' and website_url='https://iptvnator.vercel.app/'
    and docker_support='community' and docker_image='4gray/iptvnator-backend:latest'
    and compose_support=false
  for update;
  if v_app is null then raise exception 'IPTVnator record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['video-conferencing']::text[] then raise exception 'IPTVnator categories changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from $iptv_options$[
    {"url":"https://hub.docker.com/r/4gray/iptvnator-backend","note":"Community-maintained image. Verify the publisher before pulling.","image":"4gray/iptvnator-backend:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/4gray/iptvnator-backend","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/iptvnator_backend.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/iptvnator_backend.xml","support_level":"community"}
  ]$iptv_options$::jsonb then raise exception 'IPTVnator install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(jsonb_build_object(
      'url','https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml',
      'note','Run Compose with --build to build the web app and backend.',
      'image',null,'label','Docker Compose','method','compose','sort_order',10,
      'source_url','https://github.com/4gray/iptvnator/blob/master/docker/README.md',
      'support_level','official'
    )),
    docker_urls=array[]::text[],docker_images=array[]::text[],
    compose_urls=array['https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml']::text[],
    unraid_urls=array[]::text[],catalog_sources='[]'::jsonb,
    source_urls=array[
      'https://github.com/4gray/iptvnator',
      'https://github.com/4gray/iptvnator/blob/master/docker/README.md',
      'https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml'
    ]::text[],
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'IPTVnator install option update failed'; end if;
  update public.self_host_apps set
    name='IPTVnator',
    summary='IPTV player for playlists, live TV, and on-demand media with a self-hosted browser app.',
    summary_source='https://github.com/4gray/iptvnator/blob/master/README.md',summary_confidence='high',
    website_url='https://4gray.github.io/iptvnator/',
    source_code_url='https://github.com/4gray/iptvnator',source_code_host='github',source_model='open_source',
    license='MIT',license_spdx_id='MIT',license_type='permissive',
    publisher_name='4gray',publisher_type='individual',publisher_url='https://github.com/4gray',
    docs_url='https://github.com/4gray/iptvnator/blob/master/docker/README.md',
    install_docs_url='https://github.com/4gray/iptvnator/blob/master/docker/README.md',
    docker_support='none',docker_image=null,docker_url=null,
    compose_support=true,compose_url='https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml',
    deployment_methods=array['compose']::text[],
    requires_database=false,persistent_storage=false,pricing_model='free',
    data_source_urls=array[
      'https://4gray.github.io/iptvnator/',
      'https://github.com/4gray/iptvnator',
      'https://github.com/4gray/iptvnator/blob/master/LICENSE.md',
      'https://github.com/4gray/iptvnator/blob/master/README.md',
      'https://github.com/4gray/iptvnator/blob/master/docker/README.md',
      'https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml',
      'https://github.com/4gray'
    ]::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The official IPTVnator site links to the 4gray/iptvnator source repository.','source_urls',jsonb_build_array('https://github.com/4gray/iptvnator','https://4gray.github.io/iptvnator/')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The current IPTVnator repository provides an MIT license.','source_urls',jsonb_build_array('https://github.com/4gray/iptvnator/blob/master/LICENSE.md')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The repository owner identifies as the developer of IPTVnator.','source_urls',jsonb_build_array('https://github.com/4gray','https://github.com/4gray/iptvnator')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The project provides a Docker Compose build; it does not document a prebuilt Docker image.','source_urls',jsonb_build_array('https://github.com/4gray/iptvnator/blob/master/docker/README.md')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The project README documents its self-hosted Compose deployment.','source_urls',jsonb_build_array('https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The self-hosted Compose setup does not require a separate database service.','source_urls',jsonb_build_array('https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml')),
      'persistence',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','medium','note','The self-hosted PWA keeps playlists and browser data on the client; the Compose app has no media library volume.','source_urls',jsonb_build_array('https://github.com/4gray/iptvnator/blob/master/README.md','https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml'))
    ),
    updated_at=now()
  where id=v_app and name='IPTVnator---Backend' and source_code_url is null
    and source_model='closed_source' and website_url='https://iptvnator.vercel.app/'
    and docker_support='community' and docker_image='4gray/iptvnator-backend:latest'
    and compose_support=false;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'IPTVnator fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='media-servers';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'IPTVnator category update failed'; end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=512,ram_estimate_max_mb=1024,
    ram_estimate_basis='Single-household PWA and playlist proxy; concurrent streams and playlist size drive memory use.',
    ram_source_urls=array['https://github.com/4gray/iptvnator/blob/master/README.md','https://github.com/4gray/iptvnator/blob/master/docker/README.md']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=5,
    storage_estimate_basis='Estimate covers the web app and service state; playlist streams and media remain outside the service.',
    storage_source_urls=array['https://github.com/4gray/iptvnator/blob/master/README.md','https://github.com/4gray/iptvnator/blob/master/docker/docker-compose.yml']::text[],
    ram_note=null,storage_note=null,checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=1024 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Small single-node service; active users and stored content vary.'
    and storage_estimate_min_gb=1 and storage_estimate_max_gb=20
    and storage_estimate_basis='Small single-node service; active users and stored content vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'IPTVnator resource estimate changed since review'; end if;

  select id into v_app from public.self_host_apps
  where slug='magicmirror' and published is true and name='MagicMirror'
    and website_url='https://khassel.gitlab.io/magicmirror/'
    and source_code_url is null and source_model='closed_source'
    and license is null and publisher_type='unknown'
  for update;
  if v_app is null then raise exception 'MagicMirror record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','calendars-contacts','photos-galleries']::text[] then raise exception 'MagicMirror categories changed since review'; end if;
  select options into v_options from public.self_host_app_install_options where app_id=v_app for update;
  if v_options is distinct from $magic_options$[
    {"url":"https://hub.docker.com/r/karsten13/magicmirror","note":"Community-maintained image. Verify the publisher before pulling.","image":"karsten13/magicmirror:wolfi-server","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/karsten13/magicmirror","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/heckpiet/magicmirror-unraid/main/templates/magicmirror.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/heckpiet/magicmirror-unraid/main/templates/magicmirror.xml","support_level":"community"}
  ]$magic_options$::jsonb then raise exception 'MagicMirror install options changed since review'; end if;
  update public.self_host_app_install_options set
    options=jsonb_build_array(
      jsonb_build_object('url','https://docs.magicmirror.builders/getting-started/installation.html','note','The project documents manual installation as its supported method.','image',null,'label','Native installation','method','native','sort_order',5,'source_url','https://docs.magicmirror.builders/getting-started/installation.html','support_level','official'),
      v_options->0,
      v_options->1
    ),
    native_urls=array['https://docs.magicmirror.builders/getting-started/installation.html']::text[],
    source_urls=array(select distinct url from unnest(coalesce(source_urls,'{}')||array[
      'https://magicmirror.builders/',
      'https://github.com/MagicMirrorOrg/MagicMirror',
      'https://docs.magicmirror.builders/getting-started/installation.html'
    ]::text[]) as refs(url) order by url),
    checked_at=now(),updated_at=now()
  where app_id=v_app and options=v_options;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MagicMirror install option update failed'; end if;
  update public.self_host_apps set
    name='MagicMirror²',
    summary='Modular smart mirror platform for displaying calendars, weather, news, and custom modules.',
    summary_source='https://github.com/MagicMirrorOrg/MagicMirror',summary_confidence='high',
    website_url='https://magicmirror.builders/',
    source_code_url='https://github.com/MagicMirrorOrg/MagicMirror',source_code_host='github',source_model='open_source',
    license='MIT',license_spdx_id='MIT',license_type='permissive',
    publisher_name='MagicMirror² Project',publisher_type='community',publisher_url='https://magicmirror.builders/',
    docs_url='https://docs.magicmirror.builders/',
    install_docs_url='https://docs.magicmirror.builders/getting-started/installation.html',
    docker_support='community',compose_support=false,
    requires_database=false,persistent_storage=true,pricing_model='free',
    deployment_methods=array['docker','native','unraid']::text[],
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://magicmirror.builders/',
      'https://github.com/MagicMirrorOrg/MagicMirror',
      'https://github.com/MagicMirrorOrg/MagicMirror/blob/master/LICENSE.md',
      'https://docs.magicmirror.builders/',
      'https://docs.magicmirror.builders/getting-started/installation.html'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The MagicMirror² home page links to its source repository.','source_urls',jsonb_build_array('https://magicmirror.builders/','https://github.com/MagicMirrorOrg/MagicMirror')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The official repository contains an MIT license.','source_urls',jsonb_build_array('https://github.com/MagicMirrorOrg/MagicMirror/blob/master/LICENSE.md')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The project is maintained by the MagicMirror² contributor community.','source_urls',jsonb_build_array('https://magicmirror.builders/','https://github.com/MagicMirrorOrg/MagicMirror')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The project says external installation methods are not maintained by its core team.','source_urls',jsonb_build_array('https://docs.magicmirror.builders/getting-started/installation.html')),
      'native',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Manual installation is the only method supported by the core team.','source_urls',jsonb_build_array('https://docs.magicmirror.builders/getting-started/installation.html'))
    ),
    updated_at=now()
  where id=v_app and name='MagicMirror' and website_url='https://khassel.gitlab.io/magicmirror/'
    and source_code_url is null and source_model='closed_source' and license is null;
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MagicMirror fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug=any(array['dashboards','calendars-contacts']::text[]);
  get diagnostics v_count=row_count;
  if v_count<>2 then raise exception 'MagicMirror category update failed'; end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=2048,
    ram_estimate_basis='Node and Electron smart-mirror runtime; enabled modules and display configuration drive use.',
    ram_source_urls=array['https://docs.magicmirror.builders/getting-started/installation.html','https://github.com/MagicMirrorOrg/MagicMirror']::text[],
    storage_estimate_min_gb=2,storage_estimate_max_gb=8,
    storage_estimate_basis='Estimate covers the app, Node dependencies, configuration, and modules; feed data is remote.',
    storage_source_urls=array['https://docs.magicmirror.builders/getting-started/installation.html','https://github.com/MagicMirrorOrg/MagicMirror']::text[],
    ram_note=null,storage_note=null,checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=2048 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=50 and storage_estimate_max_gb=500
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MagicMirror resource estimate changed since review'; end if;

  select id into v_app from public.self_host_apps
  where slug='musicbrainz-picard' and published is true
    and name='MusicBrainz-Picard' and source_code_url is null
    and source_model='closed_source' and license is null and license_spdx_id is null
    and license_type='unknown' and publisher_type='unknown'
  for update;
  if v_app is null then raise exception 'MusicBrainz Picard record changed since review'; end if;
  select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app;
  if v_categories is distinct from array['ai-ml','music-audio']::text[] then raise exception 'MusicBrainz Picard categories changed since review'; end if;
  update public.self_host_apps set
    name='MusicBrainz Picard',
    summary='Music tagger that identifies tracks with MusicBrainz and organizes music file metadata.',
    summary_source='https://github.com/metabrainz/picard',summary_confidence='high',
    source_code_url='https://github.com/metabrainz/picard',source_code_host='github',source_model='open_source',
    license='GPL-2.0-or-later',license_spdx_id='GPL-2.0-or-later',license_type='copyleft',
    publisher_name='MetaBrainz Foundation',publisher_type='foundation',publisher_url='https://metabrainz.org/',
    docs_url='https://picard-docs.musicbrainz.org/en/latest/',
    install_docs_url='https://picard.musicbrainz.org/downloads/',
    requires_database=false,pricing_model='free',
    data_source_urls=array(select distinct url from unnest(coalesce(data_source_urls,'{}')||array[
      'https://picard.musicbrainz.org/',
      'https://picard.musicbrainz.org/downloads/',
      'https://picard-docs.musicbrainz.org/en/latest/',
      'https://github.com/metabrainz/picard',
      'https://github.com/metabrainz/picard/blob/master/COPYING.txt',
      'https://metabrainz.org/'
    ]::text[]) as refs(url) order by url),
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb)||jsonb_build_object(
      'source_code',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The official Picard downloads page links to the project source code.','source_urls',jsonb_build_array('https://picard.musicbrainz.org/downloads/','https://github.com/metabrainz/picard')),
      'license',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The project README states that Picard uses GPL-2.0-or-later.','source_urls',jsonb_build_array('https://github.com/metabrainz/picard/blob/master/COPYING.txt')),
      'publisher',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','The official downloads page identifies the MetaBrainz Foundation.','source_urls',jsonb_build_array('https://picard.musicbrainz.org/downloads/','https://metabrainz.org/')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-30','confidence','high','note','Picard uses MusicBrainz lookups and does not require a database server to run.','source_urls',jsonb_build_array('https://github.com/metabrainz/picard','https://picard-docs.musicbrainz.org/en/latest/'))
    ),
    updated_at=now()
  where id=v_app and name='MusicBrainz-Picard' and source_code_url is null
    and source_model='closed_source' and license is null and publisher_type='unknown';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MusicBrainz Picard fact update failed'; end if;
  delete from public.self_host_app_category_links where app_id=v_app;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app,id from public.self_host_app_categories where slug='music-audio';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MusicBrainz Picard category update failed'; end if;
  update public.self_host_app_resource_estimates set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=2048,
    ram_estimate_basis='Estimate for the Picard GUI and small tag batches; large batches and plugins can use more memory.',
    ram_source_urls=array['https://github.com/metabrainz/picard','https://picard-docs.musicbrainz.org/en/latest/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=5,
    storage_estimate_basis='Estimate covers the application profile and cache; a mounted music library needs separate storage.',
    storage_source_urls=array['https://picard.musicbrainz.org/downloads/','https://github.com/metabrainz/picard']::text[],
    ram_note=null,storage_note=null,checked_at=now(),updated_at=now()
  where app_id=v_app and ram_estimate_min_mb=2048 and ram_estimate_max_mb=8192
    and ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and storage_estimate_min_gb=50 and storage_estimate_max_gb=500
    and storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_count=row_count;
  if v_count<>1 then raise exception 'MusicBrainz Picard resource estimate changed since review'; end if;
end
$migration$;
commit;
