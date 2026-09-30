-- Correct verified source models, licenses, publishers, and project links.
-- Every update checks the reviewed production values before changing one row.
DO $migration$
DECLARE
  affected integer;
BEGIN
  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', source_code_url='https://github.com/containrrr/watchtower',
    source_code_host='github', publisher_name='Containrrr', publisher_type='community',
    publisher_url='https://github.com/containrrr/watchtower', docs_url='https://containrrr.dev/watchtower/',
    install_docs_url='https://github.com/containrrr/watchtower#quick-start', pricing_model='free',
    maintenance_status='archived',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/containrrr/watchtower',
        'https://github.com/containrrr/watchtower/blob/main/LICENSE.md',
        'https://containrrr.dev/watchtower/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='watchtower' AND a.published=true
    AND a.source_model='closed_source' AND a.license IS NULL AND a.license_spdx_id IS NULL AND a.license_type='unknown'
    AND a.source_code_url IS NULL AND a.source_code_host='unknown'
    AND a.publisher_name='watchtower' AND a.publisher_type='unknown'
    AND a.publisher_url='https://containrrr.dev/watchtower/' AND a.docs_url IS NULL AND a.install_docs_url IS NULL
    AND a.pricing_model='unknown' AND a.maintenance_status='active';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'watchtower changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='GNU Affero General Public License v3.0',
    license_spdx_id='AGPL-3.0-only', license_type='copyleft',
    source_code_url='https://github.com/element-hq/synapse', source_code_host='github',
    summary='Matrix homeserver implementation for federated real-time communication.',
    website_url='https://element-hq.github.io/synapse/latest/', publisher_name='Element',
    publisher_type='company', publisher_url='https://element.io/',
    docs_url='https://element-hq.github.io/synapse/latest/',
    install_docs_url='https://element-hq.github.io/synapse/latest/setup/installation.html',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/element-hq/synapse',
        'https://github.com/element-hq/synapse/blob/develop/LICENSE-AGPL-3.0',
        'https://element-hq.github.io/synapse/latest/',
        'https://element-hq.github.io/synapse/latest/setup/installation.html'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='matrix-synapse' AND a.published=true
    AND a.source_model='closed_source' AND a.license IS NULL AND a.license_spdx_id IS NULL AND a.license_type='unknown'
    AND a.source_code_url IS NULL AND a.source_code_host='unknown'
    AND a.summary='Reference server for Matrix chat that supports SQLite for simple deployments and PostgreSQL for production.'
    AND a.website_url='https://matrix.org/docs/projects/server/synapse'
    AND a.publisher_name='Matrix-Synapse' AND a.publisher_type='unknown'
    AND a.publisher_url='https://matrix.org/docs/projects/server/synapse'
    AND a.docs_url='https://github.com/matrix-org/synapse/issues'
    AND a.install_docs_url='https://github.com/matrix-org/synapse/issues'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'matrix-synapse changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', source_code_url='https://github.com/swagger-api/swagger-ui',
    source_code_host='github', website_url='https://swagger.io/open-source/swagger-ui/',
    publisher_name='SmartBear Software', publisher_type='company', publisher_url='https://www.smartbear.com/',
    docs_url='https://swagger.io/docs/',
    install_docs_url='https://github.com/swagger-api/swagger-ui#general', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/swagger-api/swagger-ui',
        'https://github.com/swagger-api/swagger-ui/blob/main/LICENSE',
        'https://swagger.io/open-source/swagger-ui/',
        'https://swagger.io/about/',
        'https://swagger.io/docs/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='swagger-ui' AND a.published=true
    AND a.source_model='closed_source' AND a.license IS NULL AND a.license_spdx_id IS NULL AND a.license_type='unknown'
    AND a.source_code_url IS NULL AND a.source_code_host='unknown'
    AND a.website_url='https://swagger.io/' AND a.publisher_name='Swagger-UI' AND a.publisher_type='unknown'
    AND a.publisher_url='https://swagger.io/'
    AND a.docs_url='https://github.com/swagger-api/swagger-ui/tree/master/docs'
    AND a.install_docs_url='https://github.com/swagger-api/swagger-ui/tree/master/docs'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'swagger-ui changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='GNU Affero General Public License v3.0 or later',
    license_spdx_id='AGPL-3.0-or-later', license_type='copyleft',
    source_code_url='https://github.com/influxdata/chronograf', source_code_host='github',
    publisher_name='InfluxData', publisher_type='company', publisher_url='https://www.influxdata.com/',
    docs_url='https://docs.influxdata.com/chronograf/v1/',
    install_docs_url='https://docs.influxdata.com/chronograf/v1/introduction/installation/', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/influxdata/chronograf',
        'https://github.com/influxdata/chronograf/blob/master/LICENSE',
        'https://docs.influxdata.com/chronograf/v1/',
        'https://docs.influxdata.com/chronograf/v1/introduction/installation/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='chronograf' AND a.published=true
    AND a.source_model='closed_source' AND a.license IS NULL AND a.license_spdx_id IS NULL AND a.license_type='unknown'
    AND a.source_code_url IS NULL AND a.source_code_host='unknown'
    AND a.publisher_name='Chronograf' AND a.publisher_type='unknown'
    AND a.publisher_url='https://www.influxdata.com/time-series-platform/chronograf/'
    AND a.docs_url='https://forums.unraid.net/topic/71264-support-data-monkey-chronograf/'
    AND a.install_docs_url='https://forums.unraid.net/topic/71264-support-data-monkey-chronograf/'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'chronograf changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='BSD-style license', license_spdx_id=NULL,
    license_type='permissive', source_code_url='https://github.com/esnet/iperf', source_code_host='github',
    summary='Measures network bandwidth over TCP, UDP, and SCTP.',
    website_url='https://software.es.net/iperf/', publisher_name='ESnet', publisher_type='unknown',
    publisher_url='https://software.es.net/iperf/', docs_url='https://software.es.net/iperf/',
    install_docs_url='https://software.es.net/iperf/obtaining.html', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/esnet/iperf',
        'https://github.com/esnet/iperf/blob/master/LICENSE',
        'https://software.es.net/iperf/',
        'https://software.es.net/iperf/obtaining.html'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='iperf3' AND a.published=true
    AND a.source_model='closed_source' AND a.license IS NULL AND a.license_spdx_id IS NULL AND a.license_type='unknown'
    AND a.source_code_url IS NULL AND a.source_code_host='unknown'
    AND a.summary='Network performance testing tool, Spawns an iperf3 instance with the settings you put in the "Post Arguments" field (switch to Advanced View to see it), By.'
    AND a.website_url='https://iperf.fr/' AND a.publisher_name='iperf3' AND a.publisher_type='unknown'
    AND a.publisher_url='https://iperf.fr/'
    AND a.docs_url='https://forums.unraid.net/topic/130827-support-kilrahiperf3/'
    AND a.install_docs_url='https://forums.unraid.net/topic/130827-support-kilrahiperf3/'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'iperf3 changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='Mozilla Public License 2.0 (primary license)',
    license_spdx_id='MPL-2.0', license_type='copyleft',
    source_code_url='https://github.com/CollaboraOnline/online.mirror', source_code_host='github',
    website_url='https://www.collaboraonline.com/code/',
    publisher_name='Collabora Productivity', publisher_type='company', publisher_url='https://www.collaboraonline.com/',
    docs_url='https://sdk.collaboraonline.com/docs/',
    install_docs_url='https://sdk.collaboraonline.com/docs/installation/CODE_Docker_image.html', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/CollaboraOnline/online.mirror',
        'https://github.com/CollaboraOnline/online.mirror/blob/main/README.md',
        'https://www.collaboraonline.com/code-25-04-release-notes/',
        'https://www.collaboraonline.com/faqs/',
        'https://sdk.collaboraonline.com/docs/installation/CODE_Docker_image.html'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='collabora-code' AND a.published=true
    AND a.source_model='closed_source' AND a.license IS NULL AND a.license_spdx_id IS NULL AND a.license_type='unknown'
    AND a.source_code_url IS NULL AND a.source_code_host='unknown'
    AND a.website_url='https://sdk.collaboraonline.com/docs/installation/CODE_Docker_image.html'
    AND a.publisher_name='Collabora-CODE' AND a.publisher_type='unknown'
    AND a.publisher_url='https://sdk.collaboraonline.com/docs/installation/CODE_Docker_image.html'
    AND a.docs_url IS NULL AND a.install_docs_url IS NULL AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'collabora-code changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    license='JetBrains TeamCity On-Premises License Agreement', license_type='custom',
    publisher_name='JetBrains', publisher_type='company', publisher_url='https://www.jetbrains.com/',
    website_url='https://www.jetbrains.com/teamcity/', docs_url='https://www.jetbrains.com/help/teamcity/',
    install_docs_url='https://www.jetbrains.com/help/teamcity/install-and-start-teamcity-server.html',
    pricing_model='freemium',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://www.jetbrains.com/teamcity/',
        'https://www.jetbrains.com/help/teamcity/licensing-policy.html',
        'https://www.jetbrains.com/legal/docs/teamcity/license/',
        'https://www.jetbrains.com/teamcity/buy/',
        'https://www.jetbrains.com/help/teamcity/install-and-start-teamcity-server.html'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='teamcity' AND a.published=true AND a.source_model='closed_source'
    AND a.license IS NULL AND a.license_type='unknown'
    AND a.publisher_name='TeamCity' AND a.publisher_type='unknown'
    AND a.publisher_url='https://hub.docker.com/r/jetbrains/teamcity-server/' AND a.website_url IS NULL
    AND a.docs_url='https://forums.unraid.net/topic/79858-support-josh5-docker-templates/'
    AND a.install_docs_url='https://forums.unraid.net/topic/79858-support-josh5-docker-templates/'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'teamcity changed since review (rows updated: %)', affected; END IF;
END;
$migration$;
