-- Apply the first manually verified factual corrections to the published
-- self-host apps. Each set of source links was checked against project pages.
do $$
declare
  target_app_id uuid;
  option_count integer;
begin
  -- Locust's current publisher identity is the Locust project.
  update public.self_host_apps
  set publisher_name = 'Locust Project',
      publisher_type = 'community',
      publisher_url = 'https://locust.io/',
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(data_source_urls, '{}'::text[]) || array['https://locust.io/']::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where slug = 'locust'
    and source_model = 'open_source'
    and source_code_url = 'https://github.com/locustio/locust';

  -- PostGIS is a GPLv2 PostgreSQL extension; its Docker image is community run.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'postgis'
    and source_model = 'closed_source'
    and source_code_url is null;
  if target_app_id is null then
    raise exception 'PostGIS record changed since review';
  end if;

  update public.self_host_apps as app
  set website_url = 'https://postgis.net/',
      source_code_url = 'https://github.com/postgis/postgis',
      source_code_host = 'github',
      docs_url = 'https://postgis.net/documentation/',
      install_docs_url = 'https://postgis.net/documentation/getting_started/install_docker/',
      license = 'GNU GPL v2',
      license_spdx_id = 'GPL-2.0-only',
      license_type = 'copyleft',
      source_model = 'open_source',
      pricing_model = 'free',
      publisher_name = 'PostGIS Project',
      publisher_type = 'community',
      publisher_url = 'https://postgis.net/',
      surfaces = array['cli']::text[],
      requires_database = true,
      database_types = array['postgres']::text[],
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://postgis.net/documentation/',
          'https://postgis.net/documentation/faq/gpl-license/',
          'https://postgis.net/documentation/getting_started/',
          'https://postgis.net/documentation/getting_started/install_docker/',
          'https://github.com/postgis/postgis',
          'https://github.com/postgis/postgis/blob/master/COPYING'
        ]::text[]) as sources(url)
        order by url
      ),
      technical_fact_status = jsonb_set(
        coalesce(app.technical_fact_status, '{}'::jsonb),
        '{database}',
        jsonb_build_object(
          'status', 'published',
          'checked_at', now(),
          'confidence', 'high',
          'note', 'PostGIS is a PostgreSQL extension.',
          'source_urls', jsonb_build_array('https://postgis.net/documentation/getting_started/')
        )
      ),
      updated_at = now()
  where app.id = target_app_id;

  delete from public.self_host_app_category_links
  where app_id = (select id from public.self_host_apps where slug = 'postgis')
    and category_id = (select id from public.self_host_app_categories where slug = 'photos-galleries');

  update public.self_host_app_install_options as options
  set options = (
        select coalesce(
          jsonb_agg(
            case
              when option->>'method' = 'docker' then option || jsonb_build_object(
                'support_level', 'community',
                'source_url', 'https://postgis.net/documentation/getting_started/install_docker/',
                'note', 'The PostGIS project documents this as a community-maintained Docker image.'
              )
              else option
            end
            order by coalesce((option->>'sort_order')::integer, 100)
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(coalesce(options.options, '[]'::jsonb)) as entries(option)
      ),
      source_urls = array(
        select distinct url
        from unnest(coalesce(options.source_urls, '{}'::text[]) || array['https://postgis.net/documentation/getting_started/install_docker/']::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where options.app_id = target_app_id;
  get diagnostics option_count = row_count;
  if option_count <> 1 then
    raise exception 'PostGIS install options row is missing';
  end if;

  -- Promtail is open source and reached end of life on 2026-03-02.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'grafanapromtail'
    and source_model = 'closed_source'
    and source_code_url is null;
  if target_app_id is null then
    raise exception 'Promtail record changed since review';
  end if;

  update public.self_host_apps as app
  set name = 'Promtail',
      summary = 'Ships host and container logs to Loki-compatible endpoints for centralized log search.',
      website_url = 'https://grafana.com/docs/loki/latest/send-data/promtail/',
      source_code_url = 'https://github.com/grafana/loki/tree/main/clients/cmd/promtail',
      source_code_host = 'github',
      docs_url = 'https://grafana.com/docs/loki/latest/send-data/promtail/',
      install_docs_url = 'https://grafana.com/docs/loki/latest/send-data/promtail/',
      license = 'GNU AGPL v3 only',
      license_spdx_id = 'AGPL-3.0-only',
      license_type = 'copyleft',
      source_model = 'open_source',
      pricing_model = 'free',
      publisher_name = 'Grafana Labs',
      publisher_type = 'company',
      publisher_url = 'https://grafana.com/',
      maintenance_status = 'archived',
      surfaces = array['cli']::text[],
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://grafana.com/docs/loki/latest/send-data/promtail/',
          'https://github.com/grafana/loki/tree/main/clients/cmd/promtail',
          'https://github.com/grafana/loki/blob/main/LICENSING.md'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  delete from public.self_host_app_category_links
  where app_id = (select id from public.self_host_apps where slug = 'grafanapromtail')
    and category_id in (
      select id from public.self_host_app_categories
      where slug in ('ai-ml', 'video-conferencing')
    );

  -- Kibana's default distribution is Elastic License 2.0; the source code is
  -- public under additional license options, including AGPL for free portions.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'kibana'
    and source_model = 'closed_source'
    and source_code_url is null;
  if target_app_id is null then
    raise exception 'Kibana record changed since review';
  end if;

  update public.self_host_apps as app
  set name = 'Kibana',
      source_model = 'source_available',
      source_code_url = 'https://github.com/elastic/kibana',
      source_code_host = 'github',
      license = 'Elastic License 2.0',
      license_spdx_id = 'Elastic-2.0',
      license_type = 'custom',
      pricing_model = 'freemium',
      publisher_name = 'Elastic',
      publisher_type = 'company',
      publisher_url = 'https://www.elastic.co/',
      docs_url = 'https://www.elastic.co/guide/en/kibana/current/index.html',
      install_docs_url = 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
      docker_url = 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
      docker_image = 'docker.elastic.co/kibana/kibana:9.5.4',
      docker_support = 'official',
      compose_support = true,
      compose_url = 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
      requires_database = true,
      database_types = array['elasticsearch']::text[],
      deployment_methods = array(
        select distinct method
        from unnest(coalesce(app.deployment_methods, '{}'::text[]) || array['docker', 'compose']::text[]) as methods(method)
        order by method
      ),
      technical_fact_status = jsonb_set(
        jsonb_set(
          jsonb_set(coalesce(app.technical_fact_status, '{}'::jsonb), '{docker}', jsonb_build_object(
            'status', 'published', 'checked_at', now(), 'confidence', 'high',
            'note', 'Elastic documents the official Kibana Docker image.',
            'source_urls', jsonb_build_array('https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker')
          )),
          '{compose}', jsonb_build_object(
            'status', 'published', 'checked_at', now(), 'confidence', 'high',
            'note', 'Elastic documents Docker Compose configuration for Kibana.',
            'source_urls', jsonb_build_array('https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker')
          )
        ),
        '{database}', jsonb_build_object(
          'status', 'published', 'checked_at', now(), 'confidence', 'high',
          'note', 'Kibana connects to Elasticsearch.',
          'source_urls', jsonb_build_array('https://www.elastic.co/guide/en/kibana/current/index.html')
        )
      ),
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://www.elastic.co/guide/en/kibana/current/index.html',
          'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
          'https://www.elastic.co/pricing/faq/licensing',
          'https://github.com/elastic/kibana',
          'https://github.com/elastic/kibana/blob/main/LICENSE.txt'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  delete from public.self_host_app_category_links
  where app_id = (select id from public.self_host_apps where slug = 'kibana')
    and category_id = (select id from public.self_host_app_categories where slug = 'system-admin-hosting');

  update public.self_host_app_install_options as options
  set docker_urls = array['https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker'],
      docker_images = array['docker.elastic.co/kibana/kibana:9.5.4'],
      compose_urls = array['https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker'],
      options = (
        select coalesce(jsonb_agg(option order by coalesce((option->>'sort_order')::integer, 100)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(options.options, '[]'::jsonb)) as entries(option)
        where option->>'method' not in ('docker', 'compose')
      ) || jsonb_build_array(
        jsonb_build_object(
          'method', 'docker', 'label', 'Docker image',
          'url', 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
          'image', 'docker.elastic.co/kibana/kibana:9.5.4', 'support_level', 'official',
          'source_url', 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
          'note', null, 'sort_order', 10
        ),
        jsonb_build_object(
          'method', 'compose', 'label', 'Docker Compose',
          'url', 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
          'image', 'docker.elastic.co/kibana/kibana:9.5.4', 'support_level', 'official',
          'source_url', 'https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker',
          'note', null, 'sort_order', 20
        )
      ),
      source_urls = array(
        select distinct url
        from unnest(coalesce(options.source_urls, '{}'::text[]) || array['https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-kibana-with-docker']::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where options.app_id = target_app_id;
  get diagnostics option_count = row_count;
  if option_count <> 1 then
    raise exception 'Kibana install options row is missing';
  end if;

  -- Neo4j Community Edition is the GPLv3 self-managed image without the
  -- -enterprise tag. Keep the paid Enterprise edition separate in the docs.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'neo4j'
    and source_model = 'closed_source'
    and source_code_url is null;
  if target_app_id is null then
    raise exception 'Neo4j record changed since review';
  end if;

  update public.self_host_apps as app
  set name = 'Neo4j Community Edition',
      website_url = 'https://neo4j.com/product/community-edition/',
      source_code_url = 'https://github.com/neo4j/neo4j',
      source_code_host = 'github',
      docs_url = 'https://neo4j.com/docs/operations-manual/current/',
      install_docs_url = 'https://neo4j.com/docs/operations-manual/current/docker/introduction/',
      docker_url = 'https://hub.docker.com/_/neo4j/',
      docker_image = 'neo4j:2026.09.0',
      docker_support = 'official',
      license = 'GNU GPL v3',
      license_spdx_id = 'GPL-3.0-only',
      license_type = 'copyleft',
      source_model = 'open_source',
      pricing_model = 'free',
      publisher_name = 'Neo4j',
      publisher_type = 'company',
      publisher_url = 'https://neo4j.com/',
      deployment_methods = array(
        select distinct method
        from unnest(coalesce(app.deployment_methods, '{}'::text[]) || array['docker']::text[]) as methods(method)
        order by method
      ),
      technical_fact_status = jsonb_set(
        coalesce(app.technical_fact_status, '{}'::jsonb),
        '{docker}',
        jsonb_build_object(
          'status', 'published', 'checked_at', now(), 'confidence', 'high',
          'note', 'Neo4j documents its official Docker image and distinguishes Community and Enterprise tags.',
          'source_urls', jsonb_build_array('https://neo4j.com/docs/operations-manual/current/docker/introduction/')
        )
      ),
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://neo4j.com/product/community-edition/',
          'https://neo4j.com/pricing/',
          'https://neo4j.com/docs/operations-manual/current/docker/introduction/',
          'https://neo4j.com/open-source-project/',
          'https://github.com/neo4j/neo4j'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  update public.self_host_app_install_options as options
  set docker_urls = array['https://hub.docker.com/_/neo4j/'],
      docker_images = array['neo4j:2026.09.0'],
      options = (
        select coalesce(
          jsonb_agg(
            case
              when option->>'method' = 'docker' then option || jsonb_build_object(
                'support_level', 'official',
                'source_url', 'https://neo4j.com/docs/operations-manual/current/docker/introduction/',
                'note', null,
                'image', 'neo4j:2026.09.0'
              )
              else option
            end
            order by coalesce((option->>'sort_order')::integer, 100)
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(coalesce(options.options, '[]'::jsonb)) as entries(option)
      ),
      source_urls = array(
        select distinct url
        from unnest(coalesce(options.source_urls, '{}'::text[]) || array['https://neo4j.com/docs/operations-manual/current/docker/introduction/']::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where options.app_id = target_app_id;
  get diagnostics option_count = row_count;
  if option_count <> 1 then
    raise exception 'Neo4j install options row is missing';
  end if;

  -- Kong OSS already has its own record. The current kong/kong-gateway image
  -- belongs to the licensed Enterprise edition, so distinguish the entries.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'kong'
    and source_model = 'open_source'
    and source_code_url = 'https://github.com/Kong/kong';
  if target_app_id is null then
    raise exception 'Kong OSS record changed since review';
  end if;

  update public.self_host_apps as app
  set name = 'Kong Gateway OSS',
      website_url = 'https://konghq.com/install',
      docs_url = 'https://developer.konghq.com/gateway/',
      install_docs_url = 'https://docs.konghq.com/gateway/latest/install/docker/',
      docker_url = 'https://hub.docker.com/_/kong',
      docker_image = 'kong:latest',
      docker_support = 'official',
      compose_support = true,
      compose_url = 'https://docs.konghq.com/gateway/latest/install/docker/',
      requires_database = false,
      database_types = '{}'::text[],
      publisher_name = 'Kong Inc.',
      publisher_type = 'company',
      publisher_url = 'https://konghq.com/',
      deployment_methods = array(
        select distinct method
        from unnest(coalesce(app.deployment_methods, '{}'::text[]) || array['docker', 'compose']::text[]) as methods(method)
        order by method
      ),
      technical_fact_status = jsonb_set(
        jsonb_set(
          jsonb_set(coalesce(app.technical_fact_status, '{}'::jsonb), '{docker}', jsonb_build_object(
            'status', 'published', 'checked_at', now(), 'confidence', 'high',
            'note', 'Kong documents the OSS image and Docker installation.',
            'source_urls', jsonb_build_array('https://docs.konghq.com/gateway/latest/install/docker/')
          )),
          '{compose}', jsonb_build_object(
            'status', 'published', 'checked_at', now(), 'confidence', 'high',
            'note', 'Kong documents an OSS Docker Compose template.',
            'source_urls', jsonb_build_array('https://docs.konghq.com/gateway/latest/install/docker/')
          )
        ),
        '{database}', jsonb_build_object(
          'status', 'published', 'checked_at', now(), 'confidence', 'high',
          'note', 'Kong Gateway OSS supports both database-backed and DB-less operation.',
          'source_urls', jsonb_build_array('https://docs.konghq.com/gateway/latest/install/docker/')
        )
      ),
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://docs.konghq.com/gateway/latest/install/docker/',
          'https://developer.konghq.com/gateway/',
          'https://github.com/Kong/kong/blob/master/LICENSE',
          'https://hub.docker.com/_/kong'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  update public.self_host_app_install_options as options
  set docker_urls = array['https://hub.docker.com/_/kong'],
      docker_images = array['kong:latest'],
      compose_urls = array['https://docs.konghq.com/gateway/latest/install/docker/'],
      options = (
        select coalesce(jsonb_agg(option order by coalesce((option->>'sort_order')::integer, 100)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(options.options, '[]'::jsonb)) as entries(option)
        where option->>'method' not in ('docker', 'compose')
      ) || jsonb_build_array(
        jsonb_build_object(
          'method', 'docker', 'label', 'Kong Gateway OSS image',
          'url', 'https://hub.docker.com/_/kong', 'image', 'kong:latest',
          'support_level', 'official', 'source_url', 'https://docs.konghq.com/gateway/latest/install/docker/',
          'note', null, 'sort_order', 10
        ),
        jsonb_build_object(
          'method', 'compose', 'label', 'Docker Compose',
          'url', 'https://docs.konghq.com/gateway/latest/install/docker/', 'image', 'kong:latest',
          'support_level', 'official', 'source_url', 'https://docs.konghq.com/gateway/latest/install/docker/',
          'note', null, 'sort_order', 20
        )
      ),
      source_urls = array(
        select distinct url
        from unnest(coalesce(options.source_urls, '{}'::text[]) || array['https://docs.konghq.com/gateway/latest/install/docker/', 'https://hub.docker.com/_/kong']::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where options.app_id = target_app_id;
  get diagnostics option_count = row_count;
  if option_count <> 1 then
    raise exception 'Kong OSS install options row is missing';
  end if;

  select id into target_app_id
  from public.self_host_apps
  where slug = 'kong-gateway'
    and source_model = 'closed_source'
    and source_code_url is null;
  if target_app_id is null then
    raise exception 'Kong Gateway Enterprise record changed since review';
  end if;

  update public.self_host_apps as app
  set name = 'Kong Gateway Enterprise',
      summary = 'Runs Kong’s licensed API gateway to route, secure, and manage service traffic.',
      website_url = 'https://developer.konghq.com/gateway/',
      docs_url = 'https://developer.konghq.com/gateway/',
      install_docs_url = 'https://developer.konghq.com/gateway/install/docker/',
      docker_url = 'https://hub.docker.com/r/kong/kong-gateway',
      docker_image = 'kong/kong-gateway:3.16.0.0',
      docker_support = 'official',
      compose_support = true,
      compose_url = 'https://developer.konghq.com/gateway/install/docker/',
      license = 'Kong Gateway Enterprise commercial license',
      license_spdx_id = null,
      license_type = 'custom',
      source_model = 'closed_source',
      pricing_model = 'subscription',
      publisher_name = 'Kong Inc.',
      publisher_type = 'company',
      publisher_url = 'https://konghq.com/',
      requires_database = false,
      database_types = '{}'::text[],
      deployment_methods = array(
        select distinct method
        from unnest(coalesce(app.deployment_methods, '{}'::text[]) || array['docker', 'compose']::text[]) as methods(method)
        order by method
      ),
      technical_fact_status = jsonb_set(
        jsonb_set(
          jsonb_set(coalesce(app.technical_fact_status, '{}'::jsonb), '{docker}', jsonb_build_object(
            'status', 'published', 'checked_at', now(), 'confidence', 'high',
            'note', 'Kong documents the official Enterprise Docker image.',
            'source_urls', jsonb_build_array('https://developer.konghq.com/gateway/install/docker/')
          )),
          '{compose}', jsonb_build_object(
            'status', 'published', 'checked_at', now(), 'confidence', 'high',
            'note', 'Kong documents Docker Compose deployment for Enterprise Gateway.',
            'source_urls', jsonb_build_array('https://developer.konghq.com/gateway/install/docker/')
          )
        ),
        '{database}', jsonb_build_object(
          'status', 'published', 'checked_at', now(), 'confidence', 'high',
          'note', 'Kong supports database-backed and DB-less deployment modes.',
          'source_urls', jsonb_build_array('https://developer.konghq.com/gateway/install/docker/')
        )
      ),
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://developer.konghq.com/gateway/',
          'https://developer.konghq.com/gateway/entities/license/',
          'https://developer.konghq.com/gateway/install/docker/',
          'https://hub.docker.com/r/kong/kong-gateway'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  update public.self_host_app_install_options as options
  set docker_urls = array['https://hub.docker.com/r/kong/kong-gateway'],
      docker_images = array['kong/kong-gateway:3.16.0.0'],
      compose_urls = array['https://developer.konghq.com/gateway/install/docker/'],
      options = (
        select coalesce(jsonb_agg(option order by coalesce((option->>'sort_order')::integer, 100)), '[]'::jsonb)
        from jsonb_array_elements(coalesce(options.options, '[]'::jsonb)) as entries(option)
        where option->>'method' not in ('docker', 'compose')
      ) || jsonb_build_array(
        jsonb_build_object(
          'method', 'docker', 'label', 'Kong Gateway Enterprise image',
          'url', 'https://hub.docker.com/r/kong/kong-gateway', 'image', 'kong/kong-gateway:3.16.0.0',
          'support_level', 'official', 'source_url', 'https://developer.konghq.com/gateway/install/docker/',
          'note', 'Requires a Kong Gateway Enterprise license.', 'sort_order', 10
        ),
        jsonb_build_object(
          'method', 'compose', 'label', 'Docker Compose',
          'url', 'https://developer.konghq.com/gateway/install/docker/', 'image', 'kong/kong-gateway:3.16.0.0',
          'support_level', 'official', 'source_url', 'https://developer.konghq.com/gateway/install/docker/',
          'note', 'Requires a Kong Gateway Enterprise license.', 'sort_order', 20
        )
      ),
      source_urls = array(
        select distinct url
        from unnest(coalesce(options.source_urls, '{}'::text[]) || array['https://developer.konghq.com/gateway/install/docker/', 'https://hub.docker.com/r/kong/kong-gateway']::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where options.app_id = target_app_id;
  get diagnostics option_count = row_count;
  if option_count <> 1 then
    raise exception 'Kong Gateway Enterprise install options row is missing';
  end if;

  -- The Factorio GitHub repository builds a container wrapper, not the game.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'factorio'
    and source_code_url = 'https://github.com/factoriotools/factorio-docker'
    and license_spdx_id = 'MIT';
  if target_app_id is null then
    raise exception 'Factorio record changed since review';
  end if;

  update public.self_host_apps as app
  set source_code_url = null,
      source_code_host = 'unknown',
      license = 'Proprietary Factorio game software',
      license_spdx_id = null,
      license_type = 'custom',
      source_model = 'closed_source',
      docs_url = 'https://www.factorio.com/support/faq',
      install_docs_url = 'https://factorio.com/download',
      publisher_name = 'Wube Software Ltd.',
      publisher_url = 'https://factorio.com/',
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://factorio.com/download',
          'https://factorio.com/terms-of-service',
          'https://www.factorio.com/support/faq',
          'https://github.com/factoriotools/factorio-docker'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  -- Firefly publishes its code with personal-use restrictions, so it is
  -- source-available rather than closed-source or open-source.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'firefly'
    and source_model = 'closed_source'
    and source_code_url = 'https://github.com/Safe3/firefly';
  if target_app_id is null then
    raise exception 'Firefly record changed since review';
  end if;

  update public.self_host_apps as app
  set source_model = 'source_available',
      license = 'Personal free use; contact publisher for source licensing',
      license_spdx_id = null,
      license_type = 'custom',
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://github.com/Safe3/firefly',
          'https://github.com/Safe3/firefly#readme',
          'https://qq.uusec.com/'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  -- Omada's official software is proprietary; mbentley's Docker repository
  -- is a community wrapper. The official guide recommends 16 GB RAM.
  select id into target_app_id
  from public.self_host_apps
  where slug = 'omada-controller'
    and source_code_url = 'https://github.com/mbentley/docker-omada-controller'
    and license_spdx_id = 'AGPL-3.0';
  if target_app_id is null then
    raise exception 'Omada Controller record changed since review';
  end if;

  update public.self_host_apps as app
  set summary = 'Manages TP-Link Omada access points, switches, and gateways from one on-premises controller.',
      source_code_url = null,
      source_code_host = 'unknown',
      license = 'Proprietary TP-Link Omada Software Controller',
      license_spdx_id = null,
      license_type = 'custom',
      source_model = 'closed_source',
      docs_url = 'https://support.omadanetworks.com/us/product/omada-software-controller/',
      install_docs_url = 'https://support.omadanetworks.com/en/document/111217/',
      publisher_name = 'TP-Link',
      publisher_type = 'company',
      publisher_url = 'https://www.tp-link.com/',
      ram_recommended_mb = 16384,
      requires_database = false,
      database_types = '{}'::text[],
      technical_fact_status = jsonb_set(
        jsonb_set(coalesce(app.technical_fact_status, '{}'::jsonb), '{ram}', jsonb_build_object(
          'status', 'published', 'checked_at', now(), 'confidence', 'high',
          'note', 'The official Omada User Guide recommends 16 GB or more for operational stability.',
          'source_urls', jsonb_build_array('https://support.omadanetworks.com/en/document/111217/')
        )),
        '{database}', jsonb_build_object(
          'status', 'published', 'checked_at', now(), 'confidence', 'medium',
          'note', 'The official host installation guide does not require a separate database service.',
          'source_urls', jsonb_build_array('https://support.omadanetworks.com/en/document/111217/')
        )
      ),
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(app.data_source_urls, '{}'::text[]) || array[
          'https://support.omadanetworks.com/en/document/111217/',
          'https://support.omadanetworks.com/download/software/omada-controller/',
          'https://support.omadanetworks.com/us/product/omada-software-controller/'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where app.id = target_app_id;

  update public.self_host_app_install_options as options
  set native_urls = array(
        select distinct url
        from unnest(coalesce(options.native_urls, '{}'::text[]) || array['https://support.omadanetworks.com/download/software/omada-controller/']::text[]) as sources(url)
        order by url
      ),
      options = coalesce(options.options, '[]'::jsonb) || case
        when exists (
          select 1
          from jsonb_array_elements(coalesce(options.options, '[]'::jsonb)) as entries(option)
          where option->>'method' = 'native'
        ) then '[]'::jsonb
        else jsonb_build_array(jsonb_build_object(
          'method', 'native', 'label', 'Linux package',
          'url', 'https://support.omadanetworks.com/download/software/omada-controller/',
          'image', null, 'support_level', 'official',
          'source_url', 'https://support.omadanetworks.com/en/document/111217/',
          'note', null, 'sort_order', 30
        ))
      end,
      source_urls = array(
        select distinct url
        from unnest(coalesce(options.source_urls, '{}'::text[]) || array[
          'https://support.omadanetworks.com/en/document/111217/',
          'https://support.omadanetworks.com/download/software/omada-controller/'
        ]::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where options.app_id = target_app_id;
  get diagnostics option_count = row_count;
  if option_count <> 1 then
    raise exception 'Omada Controller install options row is missing';
  end if;
end
$$;
