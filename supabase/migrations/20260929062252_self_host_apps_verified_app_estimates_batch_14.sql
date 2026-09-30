begin;

-- Recheck high-traffic records against their official deployment and resource pages.
update public.self_host_apps
set requires_database = false,
    database_types = '{}',
    storage_profile = 'low',
    persistent_storage = false,
    docker_url = 'https://hub.docker.com/r/excalidraw/excalidraw',
    docker_image = 'excalidraw/excalidraw:latest',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://docs.excalidraw.com/docs/introduction/development',
        'https://github.com/excalidraw/excalidraw/blob/master/README.md',
        'https://hub.docker.com/r/excalidraw/excalidraw'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official self-hosting guide names the excalidraw/excalidraw Docker image.', 'source_urls', jsonb_build_array('https://docs.excalidraw.com/docs/introduction/development', 'https://hub.docker.com/r/excalidraw/excalidraw')),
      'database', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official self-hosted client is a static web app; collaboration is not included.', 'source_urls', jsonb_build_array('https://docs.excalidraw.com/docs/introduction/development')),
      'persistent_storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The self-hosted client keeps drawing data in the browser and does not provide server-side collaboration storage.', 'source_urls', jsonb_build_array('https://docs.excalidraw.com/docs/introduction/development', 'https://github.com/excalidraw/excalidraw/blob/master/README.md'))
    ),
    updated_at = now()
where slug = 'excalidraw';

update public.self_host_app_install_options
set options = (
      select jsonb_agg(
        case
          when option->>'method' = 'docker' then
            jsonb_set(
              jsonb_set(
                jsonb_set(option, '{url}', '"https://hub.docker.com/r/excalidraw/excalidraw"'::jsonb),
                '{image}', '"excalidraw/excalidraw:latest"'::jsonb
              ),
              '{source_url}', '"https://docs.excalidraw.com/docs/introduction/development"'::jsonb
            )
          when option->>'method' = 'compose' and option->>'support_level' = 'community' then
            jsonb_set(option, '{note}', '"Community package uses a separate persistence fork."'::jsonb)
          else option
        end
        order by coalesce((option->>'sort_order')::integer, 1000)
      )
      from jsonb_array_elements(coalesce(options, '[]'::jsonb)) as item(option)
    ),
    docker_urls = array['https://hub.docker.com/r/excalidraw/excalidraw']::text[],
    docker_images = array['excalidraw/excalidraw:latest']::text[],
    source_urls = array(
      select distinct source_url
      from unnest(coalesce(source_urls, '{}') || array[
        'https://docs.excalidraw.com/docs/introduction/development',
        'https://hub.docker.com/r/excalidraw/excalidraw'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    checked_at = now(),
    updated_at = now()
where app_id = (select id from public.self_host_apps where slug = 'excalidraw');

-- LocalSend is an installed peer-to-peer client, not a server users can self-host.
update public.self_host_apps
set published = false,
    self_hosting_status = 'not_self_hostable',
    docker_support = 'none',
    compose_support = false,
    requires_database = false,
    database_types = '{}',
    deployment_methods = array['native', 'package']::text[],
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://localsend.org/',
        'https://github.com/localsend/localsend/blob/main/README.md'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'self_hosting', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'LocalSend is installed on sending and receiving devices and its official site says it does not use servers.', 'source_urls', jsonb_build_array('https://localsend.org/', 'https://github.com/localsend/localsend/blob/main/README.md'))
    ),
    updated_at = now()
where slug = 'localsend';

-- Supabase publishes baseline RAM and disk guidance for its complete self-hosted stack.
update public.self_host_apps
set ram_min_mb = 4096,
    ram_recommended_mb = 8192,
    storage_min_gb = 40,
    resource_requirement_kind = 'official_minimum',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://supabase.com/docs/guides/self-hosting/docker',
        'https://supabase.com/docs/guides/self-hosting'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'ram', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official full-stack guide lists 4 GB minimum and 8 GB or more recommended.', 'source_urls', jsonb_build_array('https://supabase.com/docs/guides/self-hosting/docker')),
      'storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official full-stack guide lists 40 GB SSD minimum and 80 GB or more recommended.', 'source_urls', jsonb_build_array('https://supabase.com/docs/guides/self-hosting/docker'))
    ),
    updated_at = now()
where slug = 'supabase';

-- World Monitor's complete Compose stack keeps seeded Redis data in a named volume.
update public.self_host_apps
set data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md',
        'https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml',
        'https://github.com/koala73/worldmonitor/pkgs/container/worldmonitor'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official self-hosting guide and Compose file build and run the Docker stack.', 'source_urls', jsonb_build_array('https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md', 'https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml')),
      'compose', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official self-hosting guide starts the stack with Docker Compose.', 'source_urls', jsonb_build_array('https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md', 'https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml')),
      'database', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The Compose stack uses Redis for seeded and cached data.', 'source_urls', jsonb_build_array('https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md', 'https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml')),
      'persistent_storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official guide says Redis data persists in the redis-data volume.', 'source_urls', jsonb_build_array('https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md'))
    ),
    updated_at = now()
where slug = 'world-monitor';

-- Netdata publishes standalone agent usage and default retention sizes.
update public.self_host_apps
set storage_profile = 'medium',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/',
        'https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/disk-%26-retention',
        'https://learn.netdata.cloud/docs/netdata-agent/installation/docker'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'ram', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'Official standalone usage is 100 to 200 MB on an empty host and 250 to 350 MB in typical production.', 'source_urls', jsonb_build_array('https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/')),
      'storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official default standalone database uses about 4 GiB and can be reconfigured.', 'source_urls', jsonb_build_array('https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/', 'https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/disk-%26-retention')),
      'compose', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official Docker guide documents both Docker Compose and persistent volumes.', 'source_urls', jsonb_build_array('https://learn.netdata.cloud/docs/netdata-agent/installation/docker')),
      'persistent_storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official Docker guide persists configuration, library, and cache volumes.', 'source_urls', jsonb_build_array('https://learn.netdata.cloud/docs/netdata-agent/installation/docker'))
    ),
    updated_at = now()
where slug = 'netdata';

-- Grafana uses embedded SQLite by default; its Docker data needs a persistent volume.
update public.self_host_apps
set database_types = array['sqlite']::text[],
    storage_profile = 'low',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/',
        'https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'database', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'Grafana uses embedded SQLite by default; MySQL or PostgreSQL can be configured instead.', 'source_urls', jsonb_build_array('https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/')),
      'persistent_storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official Docker guide mounts persistent storage for Grafana data.', 'source_urls', jsonb_build_array('https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/'))
    ),
    updated_at = now()
where slug = 'grafana';

-- Hoppscotch self-hosted Community Edition needs PostgreSQL for its saved data.
update public.self_host_apps
set storage_profile = 'depends',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://docs.hoppscotch.io/documentation/self-host/community-edition/install-and-build',
        'https://github.com/hoppscotch/hoppscotch/blob/main/docker-compose.yml'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'database', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official self-hosting guide configures a PostgreSQL DATABASE_URL.', 'source_urls', jsonb_build_array('https://docs.hoppscotch.io/documentation/self-host/community-edition/install-and-build')),
      'docker', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official self-hosting guide and Compose file define the Community Edition container stack.', 'source_urls', jsonb_build_array('https://docs.hoppscotch.io/documentation/self-host/community-edition/install-and-build', 'https://github.com/hoppscotch/hoppscotch/blob/main/docker-compose.yml')),
      'compose', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'The official repository provides a Compose deployment for the Community Edition.', 'source_urls', jsonb_build_array('https://docs.hoppscotch.io/documentation/self-host/community-edition/install-and-build', 'https://github.com/hoppscotch/hoppscotch/blob/main/docker-compose.yml'))
    ),
    updated_at = now()
where slug = 'hoppscotch-community-edition';

-- Superset's Compose stack includes Superset services, PostgreSQL metadata storage, and Redis.
update public.self_host_apps
set install_docs_url = 'https://superset.apache.org/admin-docs/installation/docker-compose/',
    compose_url = 'https://superset.apache.org/admin-docs/installation/docker-compose/',
    storage_profile = 'depends',
    data_source_urls = array(
      select distinct source_url
      from unnest(coalesce(data_source_urls, '{}') || array[
        'https://superset.apache.org/admin-docs/installation/docker-compose/',
        'https://superset.apache.org/docs/installation/installation-methods/',
        'https://superset.apache.org/admin-docs/installation/architecture/'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'database', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'Official Compose setup includes PostgreSQL for metadata and Redis for cache and background jobs.', 'source_urls', jsonb_build_array('https://superset.apache.org/admin-docs/installation/docker-compose/', 'https://superset.apache.org/docs/installation/installation-methods/')),
      'compose', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'Apache documents Compose for evaluation and development; production guidance recommends Kubernetes.', 'source_urls', jsonb_build_array('https://superset.apache.org/admin-docs/installation/docker-compose/', 'https://superset.apache.org/docs/installation/installation-methods/')),
      'persistent_storage', jsonb_build_object('status', 'published', 'checked_at', '2026-09-29', 'confidence', 'high', 'note', 'Dashboards, users, and charts are stored in the metadata database volume.', 'source_urls', jsonb_build_array('https://superset.apache.org/admin-docs/installation/docker-compose/', 'https://superset.apache.org/admin-docs/installation/architecture/'))
    ),
    updated_at = now()
where slug = 'superset';

update public.self_host_app_install_options
set options = (
      select jsonb_agg(
        case
          when option->>'method' = 'compose' then
            jsonb_set(
              jsonb_set(
                jsonb_set(option, '{url}', '"https://superset.apache.org/admin-docs/installation/docker-compose/"'::jsonb),
                '{source_url}', '"https://superset.apache.org/docs/installation/installation-methods/"'::jsonb
              ),
              '{note}', '"Compose is for evaluation and development; production guidance recommends Kubernetes."'::jsonb
            )
          else option
        end
        order by coalesce((option->>'sort_order')::integer, 1000)
      )
      from jsonb_array_elements(coalesce(options, '[]'::jsonb)) as item(option)
    ),
    compose_urls = array['https://superset.apache.org/admin-docs/installation/docker-compose/']::text[],
    source_urls = array(
      select distinct source_url
      from unnest(coalesce(source_urls, '{}') || array[
        'https://superset.apache.org/admin-docs/installation/docker-compose/',
        'https://superset.apache.org/docs/installation/installation-methods/'
      ]::text[]) as sources(source_url)
      order by source_url
    ),
    checked_at = now(),
    updated_at = now()
where app_id = (select id from public.self_host_apps where slug = 'superset');

update public.self_host_app_resource_estimates r
set ram_estimate_min_mb = estimates.ram_min,
    ram_estimate_max_mb = estimates.ram_max,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = estimates.confidence,
    ram_estimate_basis = estimates.ram_basis,
    ram_source_urls = estimates.sources,
    storage_estimate_min_gb = estimates.storage_min,
    storage_estimate_max_gb = estimates.storage_max,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = estimates.confidence,
    storage_estimate_basis = estimates.storage_basis,
    storage_source_urls = estimates.sources,
    checked_at = now(),
    updated_at = now()
from (
  values
    ('excalidraw', 128, 512, 1::numeric, 3::numeric, 'Static client image; no self-hosted database or collaboration service. Range covers a small web server and the app assets.', 'The upstream client is a static web app; the estimate covers image layers and app assets, not drawings saved in users’ browsers.', 'medium', array['https://docs.excalidraw.com/docs/introduction/development', 'https://github.com/excalidraw/excalidraw/blob/master/README.md']::text[]),
    ('supabase', 4096, 8192, 40::numeric, 80::numeric, 'The official full-stack guide lists 4 GB minimum and 8 GB or more recommended for all default services.', 'The official full-stack guide lists 40 GB SSD minimum and 80 GB or more recommended; stored user files can require more.', 'high', array['https://supabase.com/docs/guides/self-hosting/docker']::text[]),
    ('world-monitor', 2048, 4096, 5::numeric, 20::numeric, 'Estimate covers the dashboard, Redis, REST proxy, and relay in the official Compose stack.', 'Estimate covers the app stack and seeded Redis data; retained feeds, logs, and image layers can raise use.', 'medium', array['https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md', 'https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml']::text[]),
    ('netdata', 128, 512, 4::numeric, 8::numeric, 'Official guidance reports 100 to 350 MB for a standalone agent; the upper range allows for additional collectors.', 'The default standalone database uses about 4 GiB; additional retention and metrics need more disk.', 'high', array['https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/', 'https://learn.netdata.cloud/docs/netdata-agent/resource-utilization/disk-%26-retention']::text[]),
    ('grafana', 256, 1024, 1::numeric, 10::numeric, 'Estimate covers a small dashboard service with the embedded SQLite database; plugins and dashboard volume add memory use.', 'Estimate covers Grafana configuration, SQLite data, plugins, and logs; metric history stays in configured data sources.', 'medium', array['https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/', 'https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/']::text[]),
    ('hoppscotch-community-edition', 1024, 4096, 2::numeric, 20::numeric, 'Estimate covers the Community Edition web app, backend, and PostgreSQL for a small team.', 'Estimate covers the Compose services and a small PostgreSQL workspace; saved requests and users increase database use.', 'medium', array['https://docs.hoppscotch.io/documentation/self-host/community-edition/install-and-build', 'https://github.com/hoppscotch/hoppscotch/blob/main/docker-compose.yml']::text[]),
    ('superset', 2048, 8192, 5::numeric, 20::numeric, 'Estimate covers the web app, background worker, PostgreSQL metadata database, and Redis in a small Compose deployment.', 'Estimate covers Superset metadata and cache; connected analytics datasets remain in their source databases.', 'medium', array['https://superset.apache.org/docs/installation/installation-methods/', 'https://superset.apache.org/admin-docs/installation/architecture/']::text[])
) as estimates(slug, ram_min, ram_max, storage_min, storage_max, ram_basis, storage_basis, confidence, sources)
join public.self_host_apps a on a.slug = estimates.slug
where r.app_id = a.id;

commit;
