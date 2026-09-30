begin;

-- Storybook ships a static build for an existing project. Its official guide
-- documents publishing that build to a web server, not a Docker or Compose app.
update public.self_host_apps
set install_docs_url = 'https://storybook.js.org/docs/9/sharing/publish-storybook',
    docker_support = 'none',
    docker_url = null,
    docker_image = null,
    compose_support = false,
    compose_url = null,
    requires_database = false,
    database_types = array[]::text[],
    storage_profile = 'low',
    persistent_storage = false,
    deployment_methods = array(
      select distinct method
      from unnest(coalesce(deployment_methods, array[]::text[]) || array['native']::text[]) as methods(method)
      where method not in ('docker', 'compose')
      order by method
    ),
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(data_source_urls, array[]::text[]) || array[
        'https://storybook.js.org/docs/9/sharing/publish-storybook',
        'https://storybook.js.org/docs/get-started/install'
      ]::text[]) as sources(source_url)
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','high','note','The official guide builds a static Storybook for an existing project and publishes it to a web server; it does not give a Docker deployment.','source_urls',jsonb_build_array('https://storybook.js.org/docs/9/sharing/publish-storybook','https://storybook.js.org/docs/get-started/install')),
      'docker_image', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','high','note','The official Storybook install and publish guides do not direct users to a Storybook container image.','source_urls',jsonb_build_array('https://storybook.js.org/docs/9/sharing/publish-storybook','https://storybook.js.org/docs/get-started/install')),
      'compose', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','high','note','The official publishing guide serves the static build from any web server and does not document a Compose deployment.','source_urls',jsonb_build_array('https://storybook.js.org/docs/9/sharing/publish-storybook')),
      'database', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Storybook builds a static web app from a host project and does not require a database service.','source_urls',jsonb_build_array('https://storybook.js.org/docs/9/sharing/publish-storybook')),
      'persistent_storage', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The published Storybook is a static build; the official guide does not require an application data volume.','source_urls',jsonb_build_array('https://storybook.js.org/docs/9/sharing/publish-storybook')),
      'surfaces', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Storybook is a browser interface built from a project''s component stories.','source_urls',jsonb_build_array('https://storybook.js.org/docs/9/sharing/publish-storybook'))
    ),
    updated_at = now()
where slug = 'storybook' and published = true and self_hosting_status = 'self_hostable';

-- OpenBB's current repository license is AGPL-3.0. Its later blog post
-- announces a planned permissive relicensing, so the current LICENSE remains
-- the source of the recorded license until the repository changes.
update public.self_host_apps
set summary = 'Financial data platform with Python, command-line, and REST API access to market data providers.',
    website_url = 'https://openbb.co/',
    source_code_url = 'https://github.com/OpenBB-finance/OpenBB',
    source_code_host = 'github',
    docs_url = 'https://docs.openbb.co/odp/python',
    install_docs_url = 'https://docs.openbb.co/odp/python/installation',
    license = 'GNU Affero General Public License v3.0',
    license_type = 'copyleft',
    license_spdx_id = 'AGPL-3.0',
    source_model = 'open_source',
    publisher_name = 'OpenBB Inc.',
    publisher_type = 'company',
    publisher_url = 'https://openbb.co/',
    docker_support = 'official',
    docker_url = 'https://docs.openbb.co/odp/python/installation',
    docker_image = null,
    compose_support = false,
    compose_url = null,
    requires_database = false,
    database_types = array[]::text[],
    storage_profile = 'medium',
    persistent_storage = true,
    surfaces = array['api','cli','library']::text[],
    deployment_methods = array(
      select distinct method
      from unnest(coalesce(deployment_methods, array[]::text[]) || array['docker','package']::text[]) as methods(method)
      where method <> 'compose'
      order by method
    ),
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(data_source_urls, array[]::text[]) || array[
        'https://openbb.co/',
        'https://openbb.co/blog/openbb-belongs-to-everyone/',
        'https://docs.openbb.co/odp/python',
        'https://docs.openbb.co/odp/python/installation',
        'https://docs.openbb.co/odp/python/faqs/license',
        'https://github.com/OpenBB-finance/OpenBB',
        'https://github.com/OpenBB-finance/OpenBB/blob/develop/LICENSE',
        'https://github.com/OpenBB-finance/OpenBB/blob/develop/README.md',
        'https://pypi.org/project/openbb/'
      ]::text[]) as sources(source_url)
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'license', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The current repository LICENSE is AGPL-3.0. OpenBB''s 2026-08-25 blog announces a planned permissive relicensing, but the repository LICENSE remains AGPL-3.0 at this check.','source_urls',jsonb_build_array('https://github.com/OpenBB-finance/OpenBB/blob/develop/LICENSE','https://openbb.co/blog/openbb-belongs-to-everyone/')),
      'publisher', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The current repository LICENSE credits OpenBB Inc.','source_urls',jsonb_build_array('https://github.com/OpenBB-finance/OpenBB/blob/develop/LICENSE','https://openbb.co/')),
      'docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','OpenBB documents building and running its API container from the repository Dockerfile.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python/installation')),
      'docker_image', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','high','note','The official Docker instructions build the image locally as openbb-platform:latest; they do not give a registry image to pull.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python/installation')),
      'compose', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','high','note','The official Docker instructions provide docker build and docker run commands, with no Compose deployment.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python/installation')),
      'database', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The documented Python, CLI, and API installation uses local configuration and does not require a database service.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python/installation','https://docs.openbb.co/odp/python/quickstart/rest_api')),
      'persistent_storage', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official container command mounts .openbb_platform for user configuration.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python/installation')),
      'surfaces', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official docs describe Python, CLI, and REST API use.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python','https://docs.openbb.co/odp/python/installation','https://docs.openbb.co/odp/python/quickstart/rest_api')),
      'ram', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official installation guide recommends at least 8 GB RAM. The directory range is an estimate, not a published minimum.','source_urls',jsonb_build_array('https://docs.openbb.co/odp/python/installation'))
    ),
    updated_at = now()
where slug = 'openbb' and published = true and self_hosting_status = 'self_hostable';

-- The self-hostable OpenCut version is the archived Classic repository. Do
-- not attach GitHub stars from the newer rewrite to the Classic app.
insert into public.github_projects (
  owner,repo,full_name,repository_url,repo_id,owner_type,stars,forks,watchers,open_issues,
  default_branch,repo_size_kb,archived,disabled,is_fork,is_template,license_spdx_id,checked_at,source_url
)
values (
  'opencut-app','opencut-classic','OpenCut-app/opencut-classic',
  'https://github.com/opencut-app/opencut-classic',1241019195,'Organization',261,324,3,0,
  'main',19831,true,false,false,false,'MIT',now(),
  'https://github.com/OpenCut-app/opencut-classic'
)
on conflict (owner,repo) do update set
  full_name = excluded.full_name,
  repository_url = excluded.repository_url,
  repo_id = excluded.repo_id,
  owner_type = excluded.owner_type,
  stars = excluded.stars,
  forks = excluded.forks,
  watchers = excluded.watchers,
  open_issues = excluded.open_issues,
  default_branch = excluded.default_branch,
  repo_size_kb = excluded.repo_size_kb,
  archived = excluded.archived,
  disabled = excluded.disabled,
  is_fork = excluded.is_fork,
  is_template = excluded.is_template,
  license_spdx_id = excluded.license_spdx_id,
  checked_at = excluded.checked_at,
  source_url = excluded.source_url,
  row_updated_at = now();

update public.self_host_apps a
set name = 'OpenCut Classic',
    summary = 'Browser-based video editor that keeps video files on the user''s device.',
    website_url = 'https://opencut.app/',
    source_code_url = 'https://github.com/OpenCut-app/opencut-classic',
    source_code_host = 'github',
    docs_url = 'https://github.com/OpenCut-app/opencut-classic#readme',
    install_docs_url = 'https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker',
    license = 'MIT',
    license_type = 'permissive',
    license_spdx_id = 'MIT',
    source_model = 'open_source',
    publisher_name = 'OpenCut',
    publisher_type = 'community',
    publisher_url = 'https://opencut.app/',
    maintenance_status = 'archived',
    docker_support = 'official',
    docker_url = null,
    docker_image = null,
    compose_support = true,
    compose_url = 'https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml',
    requires_database = true,
    database_types = array['postgres','redis']::text[],
    storage_profile = 'low',
    persistent_storage = true,
    surfaces = array['web']::text[],
    pricing_model = 'free',
    deployment_methods = array(
      select distinct method
      from unnest(coalesce(a.deployment_methods, array[]::text[]) || array['docker','compose']::text[]) as methods(method)
      order by method
    ),
    github_project_id = (select id from public.github_projects where owner='opencut-app' and repo='opencut-classic'),
    github_node_id = null,
    github_owner = 'OpenCut-app',
    github_repo = 'opencut-classic',
    github_repo_id = 1241019195,
    github_full_name = 'OpenCut-app/opencut-classic',
    github_owner_type = 'Organization',
    github_stars = 261,
    github_forks = 324,
    github_watchers = 3,
    github_open_issues = 0,
    github_primary_language = null,
    github_languages = '{}'::jsonb,
    github_topics = array[]::text[],
    github_created_at = null,
    github_updated_at = null,
    github_pushed_at = null,
    github_default_branch = 'main',
    github_repo_size_kb = 19831,
    github_archived = true,
    github_disabled = false,
    github_is_fork = false,
    github_is_template = false,
    github_latest_release = null,
    github_latest_release_at = null,
    github_last_commit_at = null,
    github_checked_at = now(),
    source_repo_id = '1241019195',
    source_full_name = 'OpenCut-app/opencut-classic',
    source_stars = 261,
    source_forks = 324,
    source_watchers = 3,
    source_open_issues = 0,
    source_primary_language = null,
    source_languages = '{}'::jsonb,
    source_topics = array[]::text[],
    source_created_at = null,
    source_updated_at = null,
    source_pushed_at = null,
    source_default_branch = 'main',
    source_repo_size_kb = 19831,
    source_archived = true,
    source_disabled = false,
    source_is_fork = false,
    source_is_template = false,
    source_latest_release = null,
    source_latest_release_at = null,
    source_last_commit_at = null,
    source_checked_at = now(),
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
        'https://opencut.app/',
        'https://github.com/OpenCut-app/OpenCut/blob/main/README.md',
        'https://github.com/OpenCut-app/opencut-classic',
        'https://github.com/OpenCut-app/opencut-classic#readme',
        'https://github.com/OpenCut-app/opencut-classic/blob/main/LICENSE',
        'https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml'
      ]::text[]) as sources(source_url)
    ),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'source_code', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The current opencut.app version is OpenCut Classic; the main repository points users to this archived repository for the version to use today.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/OpenCut/blob/main/README.md','https://github.com/OpenCut-app/opencut-classic')),
      'license', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The archived Classic repository is MIT licensed.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic/blob/main/LICENSE')),
      'maintenance', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','GitHub marks OpenCut Classic archived on 2026-05-17; the main repository describes it as legacy and no longer maintained.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic','https://github.com/OpenCut-app/opencut-classic#readme')),
      'docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official Classic README gives a Docker self-hosting setup that builds the web app from source.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker','https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml')),
      'docker_image', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','high','note','The official Compose file builds the web service from source; it does not point to a prebuilt OpenCut image.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml')),
      'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official Classic README documents docker compose up -d for a production build.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker','https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml')),
      'database', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official Compose stack includes PostgreSQL and Redis services.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml')),
      'persistent_storage', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The Compose stack persists PostgreSQL data; the README says video files stay on the user''s device.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml','https://github.com/OpenCut-app/opencut-classic#readme')),
      'surfaces', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The self-hosting instructions launch the web app at localhost:3100.','source_urls',jsonb_build_array('https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker'))
    ),
    updated_at = now()
from public.github_projects gp
where a.slug = 'opencut'
  and gp.owner='opencut-app'
  and gp.repo='opencut-classic'
  and a.published = true
  and a.self_hosting_status = 'self_hostable';

-- ZooKeeper's project is published by the Apache Software Foundation. The
-- Docker Official Image is maintained by the Docker community, and the
-- official install guide persists snapshots and transaction logs under dataDir.
update public.self_host_apps
set name = 'Apache ZooKeeper',
    summary = 'Distributed coordination service for configuration, naming, synchronization, and group services.',
    website_url = 'https://zookeeper.apache.org/',
    source_code_url = 'https://github.com/apache/zookeeper',
    source_code_host = 'github',
    docs_url = 'https://zookeeper.apache.org/doc/current/zookeeperStarted.html',
    install_docs_url = 'https://zookeeper.apache.org/doc/current/zookeeperStarted.html',
    license = 'Apache-2.0',
    license_type = 'permissive',
    license_spdx_id = 'Apache-2.0',
    source_model = 'open_source',
    publisher_name = 'Apache Software Foundation',
    publisher_type = 'foundation',
    publisher_url = 'https://www.apache.org/',
    docker_support = 'community',
    docker_url = 'https://hub.docker.com/_/zookeeper',
    docker_image = 'zookeeper:latest',
    compose_support = false,
    compose_url = null,
    requires_database = false,
    database_types = array[]::text[],
    storage_profile = 'low',
    persistent_storage = true,
    surfaces = array['cli','server']::text[],
    deployment_methods = array(
      select distinct method
      from unnest(coalesce(deployment_methods, array[]::text[]) || array['native','docker']::text[]) as methods(method)
      where method <> 'compose'
      order by method
    ),
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(data_source_urls, array[]::text[]) || array[
        'https://zookeeper.apache.org/',
        'https://zookeeper.apache.org/doc/current/zookeeperStarted.html',
        'https://zookeeper.apache.org/news/',
        'https://zookeeper.apache.org/releases/',
        'https://github.com/apache/zookeeper',
        'https://github.com/apache/zookeeper/blob/master/LICENSE.txt',
        'https://hub.docker.com/_/zookeeper',
        'https://github.com/31z4/zookeeper-docker'
      ]::text[]) as sources(source_url)
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'publisher', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Apache ZooKeeper is an Apache Software Foundation project.','source_urls',jsonb_build_array('https://zookeeper.apache.org/','https://zookeeper.apache.org/releases/')),
      'license', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official source repository declares Apache-2.0.','source_urls',jsonb_build_array('https://github.com/apache/zookeeper/blob/master/LICENSE.txt')),
      'docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Docker Hub lists the zookeeper Docker Official Image and identifies the Docker Community as its maintainer.','source_urls',jsonb_build_array('https://hub.docker.com/_/zookeeper','https://github.com/31z4/zookeeper-docker')),
      'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The Docker Official Image is named zookeeper; its publisher-maintenance is by the Docker Community, not Apache ZooKeeper.','source_urls',jsonb_build_array('https://hub.docker.com/_/zookeeper','https://github.com/31z4/zookeeper-docker')),
      'compose', jsonb_build_object('status','not_published','checked_at',current_date,'confidence','medium','note','The current Apache install guide and Docker Official Image documentation do not provide a supported Compose deployment.','source_urls',jsonb_build_array('https://zookeeper.apache.org/doc/current/zookeeperStarted.html','https://hub.docker.com/_/zookeeper')),
      'database', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','ZooKeeper stores its own snapshots and transaction logs and does not require an external database.','source_urls',jsonb_build_array('https://zookeeper.apache.org/doc/current/zookeeperStarted.html')),
      'persistent_storage', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official guide uses dataDir for snapshots and transaction logs and says production storage must be managed externally.','source_urls',jsonb_build_array('https://zookeeper.apache.org/doc/current/zookeeperStarted.html')),
      'surfaces', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','ZooKeeper runs as a server and provides the zkCli command-line client; the official guide does not present a user web app.','source_urls',jsonb_build_array('https://zookeeper.apache.org/doc/current/zookeeperStarted.html'))
    ),
    updated_at = now()
where slug = 'apache-zookeeper' and published = true and self_hosting_status = 'self_hostable';

-- The official legal terms identify Nous Research, Inc. as the operator of
-- Hermes and its other products.
update public.self_host_apps
set publisher_name = 'Nous Research, Inc.',
    publisher_type = 'company',
    publisher_url = 'https://nousresearch.com/',
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(data_source_urls, array[]::text[]) || array[
        'https://nousresearch.com/',
        'https://portal.nousresearch.com/terms',
        'https://hermes-agent.nousresearch.com/'
      ]::text[]) as sources(source_url)
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'publisher', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Nous Research''s legal terms identify Nous Research, Inc. as a Delaware corporation; the official site identifies Hermes Agent as a Nous Research product.','source_urls',jsonb_build_array('https://portal.nousresearch.com/terms','https://nousresearch.com/'))
    ),
    updated_at = now()
where slug = 'hermes-agent' and published = true and self_hosting_status = 'self_hostable';

-- RustDesk Server OSS is the headless server component used by RustDesk
-- clients, not a web or desktop app.
update public.self_host_apps
set summary = 'Self-hosted rendezvous and relay server for RustDesk remote desktop clients.',
    surfaces = array['server']::text[],
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(data_source_urls, array[]::text[]) || array[
        'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/',
        'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/'
      ]::text[]) as sources(source_url)
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'surfaces', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The OSS server provides rendezvous and relay services used by RustDesk clients; its official Docker setup runs hbbs and hbbr server processes.','source_urls',jsonb_build_array('https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/','https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/'))
    ),
    updated_at = now()
where slug = 'rustdesk' and published = true and self_hosting_status = 'self_hostable';

-- Refresh only reviewed installation methods; preserve appliance options.
update public.self_host_app_install_options i
set native_urls = array(
      select distinct url from unnest(coalesce(i.native_urls,array[]::text[]) || array['https://storybook.js.org/docs/9/sharing/publish-storybook']::text[]) as urls(url) order by url
    ),
    docker_urls = array[]::text[],
    docker_images = array[]::text[],
    compose_urls = array[]::text[],
    options = (
      select coalesce(jsonb_agg(option_item order by coalesce((option_item->>'sort_order')::integer,999)),'[]'::jsonb)
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as items(option_item)
      where option_item->>'method' not in ('docker','compose','native')
    ) || jsonb_build_array(jsonb_build_object('method','native','label','Static Storybook build','url','https://storybook.js.org/docs/9/sharing/publish-storybook','image',null,'support_level','official','source_url','https://storybook.js.org/docs/9/sharing/publish-storybook','note','Build Storybook for an existing project, then serve the static files from a web server.','sort_order',50)),
    source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(i.source_urls,array[]::text[]) || array['https://storybook.js.org/docs/9/sharing/publish-storybook']::text[]) as sources(source_url)
    ),
    checked_at = current_date,
    updated_at = now()
from public.self_host_apps a
where i.app_id=a.id and a.slug='storybook';

update public.self_host_app_install_options i
set docker_urls = array['https://docs.openbb.co/odp/python/installation']::text[],
    docker_images = array[]::text[],
    compose_urls = array[]::text[],
    package_urls = array(
      select distinct url from unnest(coalesce(i.package_urls,array[]::text[]) || array['https://pypi.org/project/openbb/']::text[]) as urls(url) order by url
    ),
    options = (
      select coalesce(jsonb_agg(option_item order by coalesce((option_item->>'sort_order')::integer,999)),'[]'::jsonb)
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as items(option_item)
      where option_item->>'method' not in ('docker','compose','package')
    ) || jsonb_build_array(
      jsonb_build_object('method','docker','label','Build OpenBB API container','url','https://docs.openbb.co/odp/python/installation','image',null,'support_level','official','source_url','https://docs.openbb.co/odp/python/installation','note','Build the image locally from OpenBB''s official Dockerfile.','sort_order',10),
      jsonb_build_object('method','package','label','OpenBB Python package','url','https://pypi.org/project/openbb/','image',null,'support_level','official','source_url','https://docs.openbb.co/odp/python/installation','note',null,'sort_order',30)
    ),
    source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(i.source_urls,array[]::text[]) || array['https://docs.openbb.co/odp/python/installation','https://pypi.org/project/openbb/']::text[]) as sources(source_url)
    ),
    checked_at = current_date,
    updated_at = now()
from public.self_host_apps a
where i.app_id=a.id and a.slug='openbb';

update public.self_host_app_install_options i
set docker_urls = array[]::text[],
    docker_images = array[]::text[],
    compose_urls = array['https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml']::text[],
    options = (
      select coalesce(jsonb_agg(option_item order by coalesce((option_item->>'sort_order')::integer,999)),'[]'::jsonb)
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as items(option_item)
      where option_item->>'method' not in ('docker','compose')
    ) || jsonb_build_array(jsonb_build_object('method','compose','label','OpenCut Classic Docker Compose setup','url','https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml','image',null,'support_level','official','source_url','https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker','note','Builds the web app and starts PostgreSQL and Redis services.','sort_order',20)),
    source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(i.source_urls,array[]::text[]) || array['https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker','https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml']::text[]) as sources(source_url)
    ),
    checked_at = current_date,
    updated_at = now()
from public.self_host_apps a
where i.app_id=a.id and a.slug='opencut';

update public.self_host_app_install_options i
set docker_urls = array['https://hub.docker.com/_/zookeeper']::text[],
    docker_images = array['zookeeper:latest']::text[],
    compose_urls = array[]::text[],
    options = (
      select coalesce(jsonb_agg(option_item order by coalesce((option_item->>'sort_order')::integer,999)),'[]'::jsonb)
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as items(option_item)
      where option_item->>'method' not in ('docker','compose')
    ) || jsonb_build_array(jsonb_build_object('method','docker','label','ZooKeeper Docker image','url','https://hub.docker.com/_/zookeeper','image','zookeeper:latest','support_level','community','source_url','https://hub.docker.com/_/zookeeper','note','Docker Official Image maintained by the Docker Community.','sort_order',10)),
    source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(i.source_urls,array[]::text[]) || array['https://hub.docker.com/_/zookeeper','https://github.com/31z4/zookeeper-docker']::text[]) as sources(source_url)
    ),
    checked_at = current_date,
    updated_at = now()
from public.self_host_apps a
where i.app_id=a.id and a.slug='apache-zookeeper';

insert into public.self_host_app_resource_estimates (
  app_id,ram_estimate_min_mb,ram_estimate_max_mb,ram_estimate_kind,ram_estimate_confidence,
  ram_estimate_basis,ram_source_urls,storage_estimate_min_gb,storage_estimate_max_gb,
  storage_estimate_kind,storage_estimate_confidence,storage_estimate_basis,storage_source_urls,checked_at
)
select a.id,r.ram_min,r.ram_max,'estimated',r.confidence,r.ram_basis,r.ram_sources,
       r.storage_min,r.storage_max,'estimated',r.confidence,r.storage_basis,r.storage_sources,current_date
from jsonb_to_recordset($resources$[
  {"slug":"openbb","ram_min":8192,"ram_max":16384,"storage_min":5,"storage_max":20,"confidence":"medium","ram_basis":"OpenBB recommends at least 8 GB RAM; more provider extensions and concurrent API work can raise use.","ram_sources":["https://docs.openbb.co/odp/python/installation"],"storage_basis":"Estimate covers the Python environment, optional provider extensions, generated assets, and persisted user settings in .openbb_platform.","storage_sources":["https://docs.openbb.co/odp/python/installation","https://docs.openbb.co/odp/python/basic_usage"]},
  {"slug":"opencut","ram_min":2048,"ram_max":8192,"storage_min":5,"storage_max":20,"confidence":"low","ram_basis":"One OpenCut Classic web app with PostgreSQL and Redis; the production image build and concurrent editing sessions increase memory use.","ram_sources":["https://github.com/OpenCut-app/opencut-classic#self-hosting-with-docker","https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml"],"storage_basis":"Estimate covers the app build and PostgreSQL data; OpenCut Classic says video files stay on the user's device, so media files are excluded.","storage_sources":["https://github.com/OpenCut-app/opencut-classic#readme","https://github.com/OpenCut-app/opencut-classic/blob/main/docker-compose.yml"]},
  {"slug":"apache-zookeeper","ram_min":512,"ram_max":4096,"storage_min":1,"storage_max":20,"confidence":"low","ram_basis":"Estimate for one small Java ZooKeeper server; JVM overhead and the number of clients and stored znodes raise memory use.","ram_sources":["https://zookeeper.apache.org/doc/current/zookeeperStarted.html","https://zookeeper.apache.org/doc/current/zookeeperAdmin.html"],"storage_basis":"A small deployment persists ZooKeeper snapshots, transaction logs, and server logs under dataDir; client count and retention drive disk use.","storage_sources":["https://zookeeper.apache.org/doc/current/zookeeperStarted.html"]}
]$resources$::jsonb) as r(
  slug text,ram_min integer,ram_max integer,storage_min integer,storage_max integer,confidence text,
  ram_basis text,ram_sources text[],storage_basis text,storage_sources text[]
)
join public.self_host_apps a on a.slug=r.slug
where a.published=true and a.self_hosting_status='self_hostable'
on conflict (app_id) do update set
  ram_estimate_min_mb=excluded.ram_estimate_min_mb,
  ram_estimate_max_mb=excluded.ram_estimate_max_mb,
  ram_estimate_kind=excluded.ram_estimate_kind,
  ram_estimate_confidence=excluded.ram_estimate_confidence,
  ram_estimate_basis=excluded.ram_estimate_basis,
  ram_source_urls=excluded.ram_source_urls,
  storage_estimate_min_gb=excluded.storage_estimate_min_gb,
  storage_estimate_max_gb=excluded.storage_estimate_max_gb,
  storage_estimate_kind=excluded.storage_estimate_kind,
  storage_estimate_confidence=excluded.storage_estimate_confidence,
  storage_estimate_basis=excluded.storage_estimate_basis,
  storage_source_urls=excluded.storage_source_urls,
  checked_at=excluded.checked_at,
  updated_at=now();

commit;
