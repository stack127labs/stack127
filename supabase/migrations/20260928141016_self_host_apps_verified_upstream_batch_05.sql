-- Correct directly verified upstream licenses, install links, support labels, and estimates.
DO $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='Apache License 2.0',
    license_spdx_id='Apache-2.0', license_type='permissive',
    docs_url='https://github.com/JustArchiNET/ArchiSteamFarm/wiki',
    install_docs_url='https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker',
    docker_url='https://hub.docker.com/r/justarchi/archisteamfarm',
    docker_image='justarchi/archisteamfarm:latest', docker_support='official',
    compose_url='https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker',
    compose_support=true,
    deployment_methods=ARRAY['compose','docker','truenas_scale']::text[],
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/JustArchiNET/ArchiSteamFarm',
        'https://github.com/JustArchiNET/ArchiSteamFarm/wiki/License',
        'https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker',
        'https://hub.docker.com/r/justarchi/archisteamfarm'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(
      jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project documents its own Docker image and install steps.',
        'source_urls',to_jsonb(ARRAY['https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker','https://hub.docker.com/r/justarchi/archisteamfarm']::text[])
      ),true),'{compose}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project documents a Docker Compose setup.',
        'source_urls',to_jsonb(ARRAY['https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker']::text[])
      ),true),
    updated_at=now()
  WHERE a.slug='archisteamfarm' AND a.published=true
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.docker_support='none' AND a.docker_url IS NULL AND a.compose_support=false
    AND a.docs_url='https://apps.truenas.com/catalog/archisteamfarm_community/'
    AND a.install_docs_url='https://apps.truenas.com/catalog/archisteamfarm_community/';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'archisteamfarm changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Runs a relay where people and AI agents can share a workspace on infrastructure they control.',
    source_model='open_source', license='Apache License 2.0',
    license_spdx_id='Apache-2.0', license_type='permissive',
    website_url='https://github.com/block/buzz',
    docs_url='https://github.com/block/buzz',
    install_docs_url='https://github.com/block/buzz/blob/main/deploy/compose/README.md',
    docker_url='https://github.com/block/buzz/pkgs/container/buzz',
    docker_image='ghcr.io/block/buzz:main', docker_support='official',
    compose_url='https://github.com/block/buzz/blob/main/deploy/compose/README.md',
    compose_support=true, deployment_methods=ARRAY['compose','docker','unraid']::text[],
    publisher_name='Block, Inc.', publisher_type='company', publisher_url='https://block.xyz/',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/block/buzz',
        'https://github.com/block/buzz/blob/main/LICENSE',
        'https://github.com/block/buzz/blob/main/deploy/compose/README.md',
        'https://github.com/block/buzz/pkgs/container/buzz',
        'https://block.xyz/'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(
      jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','Block publishes the container image for Buzz.',
        'source_urls',to_jsonb(ARRAY['https://github.com/block/buzz/blob/main/deploy/compose/README.md','https://github.com/block/buzz/pkgs/container/buzz']::text[])
      ),true),'{compose}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project provides a single-node Docker Compose deployment.',
        'source_urls',to_jsonb(ARRAY['https://github.com/block/buzz/blob/main/deploy/compose/README.md']::text[])
      ),true),
    updated_at=now()
  WHERE a.slug='buzz' AND a.published=true
    AND a.name='Buzz'
    AND a.summary='Collaborative workspace with rooms, channels, threads, direct messages, canvases, and media sharing.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.docs_url='https://forums.unraid.net/topic/197867-support-maybegrim-unraid-templates-nextexplorer-forgejo-runner-kilndb/'
    AND a.install_docs_url='https://forums.unraid.net/topic/197867-support-maybegrim-unraid-templates-nextexplorer-forgejo-runner-kilndb/'
    AND a.docker_support='community' AND a.compose_support=false;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'buzz changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Web chat interface for AI models that can connect to hosted APIs or local Ollama models.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT', license_type='permissive',
    website_url='https://chatbotui.com/',
    docs_url='https://github.com/mckaywrigley/chatbot-ui/blob/main/README.md',
    install_docs_url='https://github.com/mckaywrigley/chatbot-ui/blob/main/README.md',
    docker_url='https://github.com/mckaywrigley/chatbot-ui/pkgs/container/chatbot-ui',
    docker_image='ghcr.io/mckaywrigley/chatbot-ui:main',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/mckaywrigley/chatbot-ui',
        'https://github.com/mckaywrigley/chatbot-ui/blob/main/README.md',
        'https://github.com/mckaywrigley/chatbot-ui/pkgs/container/chatbot-ui',
        'https://github.com/getumbrel/umbrel-apps/tree/master/chatbot-ui',
        'https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/chatbot-ui/docker-compose.yml',
        'https://chatbotui.com/'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    updated_at=now()
  WHERE a.slug='chatbot-ui' AND a.published=true
    AND a.name='ChatBot UI'
    AND a.summary='Chat interface for talking with language models through a web browser.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.docs_url='https://github.com/mckaywrigley/chatbot-ui/issues'
    AND a.install_docs_url='https://github.com/mckaywrigley/chatbot-ui/issues'
    AND a.docker_url='https://ghcr.io/mckaywrigley/chatbot-ui'
    AND a.docker_image='ghcr.io/mckaywrigley/chatbot-ui:main@sha256:569dffe6043136f03de86bde38453a58d05150f29476239dc1da4ce2573b4101'
    AND a.docker_support='official' AND a.compose_support=true;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'chatbot-ui changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='Grafana Mimir',
    summary='Stores and queries Prometheus and OpenTelemetry metrics for long-term retention.',
    source_model='open_source', license='GNU Affero General Public License v3.0 only',
    license_spdx_id='AGPL-3.0-only', license_type='copyleft',
    website_url='https://grafana.com/oss/mimir/',
    docs_url='https://grafana.com/docs/mimir/latest/',
    install_docs_url='https://grafana.com/docs/mimir/latest/get-started/',
    docker_url='https://hub.docker.com/r/grafana/mimir',
    docker_image='grafana/mimir:latest', docker_support='official',
    compose_url='https://github.com/grafana/mimir/blob/main/docs/sources/mimir/get-started/play-with-grafana-mimir/docker-compose.yml',
    compose_support=true, deployment_methods=ARRAY['compose','docker','unraid']::text[],
    publisher_name='Grafana Labs', publisher_type='company', publisher_url='https://grafana.com/',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/grafana/mimir',
        'https://github.com/grafana/mimir/blob/main/LICENSING.md',
        'https://grafana.com/oss/mimir/',
        'https://grafana.com/docs/mimir/latest/',
        'https://grafana.com/docs/mimir/latest/get-started/',
        'https://github.com/grafana/mimir/blob/main/docs/sources/mimir/get-started/play-with-grafana-mimir/docker-compose.yml',
        'https://hub.docker.com/r/grafana/mimir'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(
      jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','Grafana documents and publishes the Grafana Mimir Docker image.',
        'source_urls',to_jsonb(ARRAY['https://grafana.com/docs/mimir/latest/get-started/','https://hub.docker.com/r/grafana/mimir']::text[])
      ),true),'{compose}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','Grafana provides a Docker Compose setup for trying Mimir with its dependencies.',
        'source_urls',to_jsonb(ARRAY['https://grafana.com/docs/mimir/latest/get-started/','https://github.com/grafana/mimir/blob/main/docs/sources/mimir/get-started/play-with-grafana-mimir/docker-compose.yml']::text[])
      ),true),
    updated_at=now()
  WHERE a.slug='grafanamimir' AND a.published=true
    AND a.name='GrafanaMimir'
    AND a.summary='Long-term metrics storage for Prometheus with scalable, highly available, multi-tenant operation.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='AGPL-3.0' AND a.license_type='copyleft'
    AND a.website_url IS NULL
    AND a.docs_url='https://forums.unraid.net/topic/148434-support-template-masterwishx-grafanamimir'
    AND a.install_docs_url='https://forums.unraid.net/topic/148434-support-template-masterwishx-grafanamimir'
    AND a.docker_support='community' AND a.compose_support=false;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'grafanamimir changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Searches code in Git repositories through a web interface.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT', license_type='permissive',
    docs_url='https://github.com/hound-search/hound/blob/main/README.md',
    install_docs_url='https://github.com/hound-search/hound/blob/main/README.md',
    docker_url='https://github.com/hound-search/hound/pkgs/container/hound',
    docker_image='ghcr.io/hound-search/hound:latest', docker_support='official',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/hound-search/hound',
        'https://github.com/hound-search/hound/blob/main/LICENSE',
        'https://github.com/hound-search/hound/blob/main/README.md',
        'https://github.com/hound-search/hound/pkgs/container/hound'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
      'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
      'note','The project documents its own GHCR image and Docker commands.',
      'source_urls',to_jsonb(ARRAY['https://github.com/hound-search/hound/blob/main/README.md','https://github.com/hound-search/hound/pkgs/container/hound']::text[])
    ),true),
    updated_at=now()
  WHERE a.slug='hound' AND a.published=true
    AND a.summary='Extremely fast source code search engine for searching and retrieving information from the web.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.docs_url='https://github.com/hound-search/hound/issues'
    AND a.install_docs_url='https://github.com/hound-search/hound/issues'
    AND a.docker_url='https://registry.hub.docker.com/r/ghcr.io/hound-search/hound'
    AND a.docker_image='ghcr.io/hound-search/hound:latest' AND a.docker_support='community';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'hound changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='macOS in Docker',
    summary='Runs macOS as a virtual machine in Docker with a browser-based viewer.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT', license_type='permissive',
    docs_url='https://github.com/dockur/macos/blob/master/readme.md',
    install_docs_url='https://github.com/dockur/macos/blob/master/readme.md',
    docker_url='https://hub.docker.com/r/dockurr/macos',
    docker_image='dockurr/macos', docker_support='official',
    compose_url='https://github.com/dockur/macos/blob/master/compose.yml', compose_support=true,
    deployment_methods=ARRAY['compose','docker','unraid']::text[],
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/dockur/macos',
        'https://github.com/dockur/macos/blob/master/license.md',
        'https://github.com/dockur/macos/blob/master/readme.md',
        'https://github.com/dockur/macos/blob/master/compose.yml',
        'https://hub.docker.com/r/dockurr/macos'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(
      jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project publishes its own Docker image and install instructions.',
        'source_urls',to_jsonb(ARRAY['https://github.com/dockur/macos/blob/master/readme.md','https://hub.docker.com/r/dockurr/macos']::text[])
      ),true),'{compose}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project provides an official Compose file.',
        'source_urls',to_jsonb(ARRAY['https://github.com/dockur/macos/blob/master/compose.yml']::text[])
      ),true),
    updated_at=now()
  WHERE a.slug='macos' AND a.published=true
    AND a.name='MacOS' AND a.summary='Docker-based macOS environment for running macOS inside a container.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.docs_url='https://github.com/dockur/macos/issues'
    AND a.install_docs_url='https://github.com/dockur/macos/issues'
    AND a.docker_support='community' AND a.compose_support=false;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'macos changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='OmniRoute',
    summary='Routes AI requests to multiple model providers through one endpoint.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT', license_type='permissive',
    docs_url='https://github.com/diegosouzapw/omniroute',
    install_docs_url='https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md',
    docker_url='https://hub.docker.com/r/diegosouzapw/omniroute',
    docker_image='diegosouzapw/omniroute:latest', docker_support='official',
    compose_url='https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md',
    compose_support=true, deployment_methods=ARRAY['compose','docker','unraid']::text[],
    publisher_name='Diego Souza', publisher_type='individual', publisher_url='https://github.com/diegosouzapw',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/diegosouzapw/omniroute',
        'https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/LICENSE',
        'https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md',
        'https://hub.docker.com/r/diegosouzapw/omniroute',
        'https://github.com/diegosouzapw'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(
      jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project documents its Docker image and deployment guide.',
        'source_urls',to_jsonb(ARRAY['https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md','https://hub.docker.com/r/diegosouzapw/omniroute']::text[])
      ),true),'{compose}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The official Docker guide documents the self-hosted Compose stack.',
        'source_urls',to_jsonb(ARRAY['https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md']::text[])
      ),true),
    updated_at=now()
  WHERE a.slug='omniroute' AND a.published=true
    AND a.name='omniroute'
    AND a.summary='OmniRoute is an AI gateway supporting 230+ LLM providers (OpenAI, Anthropic, Google, Mistral, Ollama, and more) with intelligent routing, 4-tier.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.docs_url='https://forums.unraid.net/topic/87798-support-selfhostersnets-template-repository/'
    AND a.install_docs_url='https://forums.unraid.net/topic/87798-support-selfhostersnets-template-repository/'
    AND a.docker_support='community' AND a.compose_support=false;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'omniroute changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Creates SVG and raster status badges for software projects and services.',
    source_model='open_source', license='MIT License or Apache License 2.0',
    license_spdx_id='MIT OR Apache-2.0', license_type='permissive',
    docs_url='https://github.com/badges/shields/blob/master/doc/self-hosting.md',
    install_docs_url='https://github.com/badges/shields/blob/master/doc/self-hosting.md',
    docker_url='https://hub.docker.com/r/shieldsio/shields',
    docker_image='shieldsio/shields:next', docker_support='official',
    deployment_methods=ARRAY['docker','yunohost']::text[],
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/badges/shields',
        'https://github.com/badges/shields/blob/master/LICENSE-MIT',
        'https://github.com/badges/shields/blob/master/LICENSE-APACHE',
        'https://github.com/badges/shields/blob/master/doc/self-hosting.md',
        'https://hub.docker.com/r/shieldsio/shields'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
      'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
      'note','The project documents and publishes its own Docker images.',
      'source_urls',to_jsonb(ARRAY['https://github.com/badges/shields/blob/master/doc/self-hosting.md','https://hub.docker.com/r/shieldsio/shields']::text[])
    ),true),
    updated_at=now()
  WHERE a.slug='shields' AND a.published=true
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.docs_url='https://shields.io/docs'
    AND a.install_docs_url='https://shields.io/docs'
    AND a.docker_support='none' AND a.docker_url IS NULL;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'shields changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='Windows in Docker',
    summary='Runs Windows as a virtual machine inside a Docker container.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT', license_type='permissive',
    docs_url='https://github.com/dockur/windows/blob/master/readme.md',
    install_docs_url='https://github.com/dockur/windows/blob/master/readme.md',
    docker_url='https://hub.docker.com/r/dockurr/windows',
    docker_image='dockurr/windows', docker_support='official',
    compose_url='https://github.com/dockur/windows/blob/master/compose.yml', compose_support=true,
    deployment_methods=ARRAY['compose','docker','unraid']::text[],
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/dockur/windows',
        'https://github.com/dockur/windows/blob/master/license.md',
        'https://github.com/dockur/windows/blob/master/readme.md',
        'https://github.com/dockur/windows/blob/master/compose.yml',
        'https://hub.docker.com/r/dockurr/windows'
      ]::text[]) AS src(url)
    ),'{}'::text[]),
    technical_fact_status=jsonb_set(
      jsonb_set(coalesce(a.technical_fact_status,'{}'::jsonb),'{docker}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project publishes its own Docker image and install instructions.',
        'source_urls',to_jsonb(ARRAY['https://github.com/dockur/windows/blob/master/readme.md','https://hub.docker.com/r/dockurr/windows']::text[])
      ),true),'{compose}',jsonb_build_object(
        'status','published','checked_at','2026-09-28T13:59:02+00:00','confidence','high',
        'note','The project provides an official Compose file.',
        'source_urls',to_jsonb(ARRAY['https://github.com/dockur/windows/blob/master/compose.yml']::text[])
      ),true),
    updated_at=now()
  WHERE a.slug='windowsindocker' AND a.published=true
    AND a.name='WindowsinDocker'
    AND a.summary='Windows environment for running desktop software through containerized virtualization.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.docs_url='https://github.com/dockur/windows/issues'
    AND a.install_docs_url='https://github.com/dockur/windows/issues'
    AND a.docker_support='community' AND a.compose_support=false;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'windowsindocker changed since review (rows updated: %)', affected; END IF;
END $$;

-- Keep the public install-options drawer in sync with the reviewed app fields.
DO $$
DECLARE
  cfg record;
  target_id uuid;
  affected integer;
BEGIN
  FOR cfg IN
    SELECT * FROM (VALUES
      ('archisteamfarm','https://hub.docker.com/r/justarchi/archisteamfarm','justarchi/archisteamfarm:latest','https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker','https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker','official',ARRAY[]::text[],ARRAY[]::text[]),
      ('buzz','https://github.com/block/buzz/pkgs/container/buzz','ghcr.io/block/buzz:main','https://github.com/block/buzz/blob/main/deploy/compose/README.md','https://github.com/block/buzz/blob/main/deploy/compose/README.md','official',ARRAY['https://github.com/block/buzz/pkgs/container/buzz']::text[],ARRAY[]::text[]),
      ('chatbot-ui','https://github.com/mckaywrigley/chatbot-ui/pkgs/container/chatbot-ui','ghcr.io/mckaywrigley/chatbot-ui:main','https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/chatbot-ui/docker-compose.yml','https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/chatbot-ui/docker-compose.yml','community',ARRAY['https://ghcr.io/mckaywrigley/chatbot-ui']::text[],ARRAY['https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/chatbot-ui/docker-compose.yml']::text[]),
      ('grafanamimir','https://hub.docker.com/r/grafana/mimir','grafana/mimir:latest','https://github.com/grafana/mimir/blob/main/docs/sources/mimir/get-started/play-with-grafana-mimir/docker-compose.yml','https://github.com/grafana/mimir/blob/main/docs/sources/mimir/get-started/play-with-grafana-mimir/docker-compose.yml','official',ARRAY['https://hub.docker.com/r/grafana/mimir']::text[],ARRAY[]::text[]),
      ('hound','https://github.com/hound-search/hound/pkgs/container/hound','ghcr.io/hound-search/hound:latest',NULL,NULL,'official',ARRAY['https://github.com/hound-search/hound/pkgs/container/hound']::text[],ARRAY[]::text[]),
      ('macos','https://hub.docker.com/r/dockurr/macos','dockurr/macos','https://github.com/dockur/macos/blob/master/compose.yml','https://github.com/dockur/macos/blob/master/compose.yml','official',ARRAY['https://hub.docker.com/r/dockurr/macos']::text[],ARRAY[]::text[]),
      ('omniroute','https://hub.docker.com/r/diegosouzapw/omniroute','diegosouzapw/omniroute:latest','https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md','https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md','official',ARRAY['https://hub.docker.com/r/diegosouzapw/omniroute/']::text[],ARRAY[]::text[]),
      ('shields','https://hub.docker.com/r/shieldsio/shields','shieldsio/shields:next',NULL,NULL,'official',ARRAY[]::text[],ARRAY[]::text[]),
      ('windowsindocker','https://hub.docker.com/r/dockurr/windows','dockurr/windows','https://github.com/dockur/windows/blob/master/compose.yml','https://github.com/dockur/windows/blob/master/compose.yml','official',ARRAY['https://hub.docker.com/r/dockurr/windows']::text[],ARRAY[]::text[])
    ) AS values_list(slug,docker_url,image,compose_url,compose_source,support_level,expected_docker_urls,expected_compose_urls)
  LOOP
    SELECT id INTO target_id FROM public.self_host_apps WHERE slug=cfg.slug AND published=true;
    IF target_id IS NULL THEN RAISE EXCEPTION 'missing published app %', cfg.slug; END IF;

    UPDATE public.self_host_app_install_options AS o SET
      docker_urls=ARRAY[cfg.docker_url]::text[],
      docker_images=ARRAY[cfg.image]::text[],
      compose_urls=CASE WHEN cfg.compose_url IS NULL THEN '{}'::text[] ELSE ARRAY[cfg.compose_url]::text[] END,
      source_urls=ARRAY(
        SELECT DISTINCT url
        FROM unnest(coalesce(o.source_urls,'{}'::text[]) || ARRAY[cfg.docker_url,coalesce(cfg.compose_source,cfg.docker_url)]::text[]) AS src(url)
        ORDER BY url
      ),
      options=coalesce((
        SELECT jsonb_agg(CASE
          WHEN item->>'method'='docker' THEN item || jsonb_build_object(
            'url',cfg.docker_url,'image',cfg.image,'source_url',cfg.docker_url,
            'support_level','official','note',NULL
          )
          WHEN item->>'method'='compose' AND cfg.compose_url IS NOT NULL THEN item || jsonb_build_object(
            'url',cfg.compose_url,'image',cfg.image,'source_url',cfg.compose_source,
            'support_level',cfg.support_level,'note',NULL
          )
          ELSE item
        END)
        FROM jsonb_array_elements(coalesce(o.options,'[]'::jsonb)) AS existing(item)
      ),'[]'::jsonb)
      || CASE WHEN EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(o.options,'[]'::jsonb)) AS existing(item) WHERE item->>'method'='docker')
              THEN '[]'::jsonb
              ELSE jsonb_build_array(jsonb_build_object('url',cfg.docker_url,'note',NULL,'image',cfg.image,'label','Docker image','method','docker','sort_order',10,'source_url',cfg.docker_url,'support_level','official')) END
      || CASE WHEN cfg.compose_url IS NULL OR EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(o.options,'[]'::jsonb)) AS existing(item) WHERE item->>'method'='compose')
              THEN '[]'::jsonb
              ELSE jsonb_build_array(jsonb_build_object('url',cfg.compose_url,'note',NULL,'image',cfg.image,'label','Docker Compose','method','compose','sort_order',20,'source_url',cfg.compose_source,'support_level',cfg.support_level)) END,
      checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
    WHERE o.app_id=target_id
      AND coalesce(o.docker_urls,'{}'::text[])=cfg.expected_docker_urls
      AND coalesce(o.compose_urls,'{}'::text[])=cfg.expected_compose_urls;
    GET DIAGNOSTICS affected = ROW_COUNT;
    IF affected <> 1 THEN RAISE EXCEPTION 'install options changed since review for % (rows updated: %)', cfg.slug, affected; END IF;
  END LOOP;
END $$;

-- Replace generic deployment-based estimates with researched app-specific ranges.
DO $$
DECLARE affected integer;
BEGIN
  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='Runs the card-farming bot and stores account configuration; account count and plugins affect memory.',
    ram_source_urls=ARRAY['https://github.com/JustArchiNET/ArchiSteamFarm','https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker']::text[],
    storage_estimate_min_gb=1, storage_estimate_max_gb=10, storage_estimate_kind='estimated',
    storage_estimate_confidence='medium',
    storage_estimate_basis='Stores bot configuration, plugins, and logs; it does not store the Steam games being farmed.',
    storage_source_urls=ARRAY['https://github.com/JustArchiNET/ArchiSteamFarm','https://github.com/JustArchiNET/ArchiSteamFarm/wiki/Docker']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='archisteamfarm'
    AND e.ram_estimate_min_mb=1024 AND e.ram_estimate_max_mb=8192
    AND e.storage_estimate_min_gb=10 AND e.storage_estimate_max_gb=100;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'archisteamfarm estimate changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_min_mb=4096, ram_estimate_max_mb=16384, ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='The single-node relay stack includes PostgreSQL, Redis, and MinIO in addition to the Buzz relay.',
    ram_source_urls=ARRAY['https://github.com/block/buzz/blob/main/deploy/compose/README.md']::text[],
    storage_estimate_min_gb=20, storage_estimate_max_gb=200, storage_estimate_kind='estimated',
    storage_estimate_confidence='low',
    storage_estimate_basis='Stores database records, uploaded media, and Git data; retention and media use drive growth.',
    storage_source_urls=ARRAY['https://github.com/block/buzz/blob/main/deploy/compose/README.md']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='buzz'
    AND e.ram_estimate_min_mb=2048 AND e.ram_estimate_max_mb=8192
    AND e.storage_estimate_min_gb=5 AND e.storage_estimate_max_gb=100;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'buzz estimate changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_min_mb=2048, ram_estimate_max_mb=8192, ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='Runs the web app and Supabase backend; local model memory is separate when Ollama is used.',
    ram_source_urls=ARRAY['https://github.com/mckaywrigley/chatbot-ui/blob/main/README.md']::text[],
    storage_estimate_min_gb=5, storage_estimate_max_gb=50, storage_estimate_kind='estimated',
    storage_estimate_confidence='medium',
    storage_estimate_basis='Stores the database and user files; local model files belong to Ollama when used.',
    storage_source_urls=ARRAY['https://github.com/mckaywrigley/chatbot-ui/blob/main/README.md']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='chatbot-ui'
    AND e.ram_estimate_min_mb=8192 AND e.ram_estimate_max_mb=32768
    AND e.storage_estimate_min_gb=20 AND e.storage_estimate_max_gb=100;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'chatbot-ui estimate changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_confidence='low',
    ram_estimate_basis='A small monolithic deployment runs in one process; ingestion rate and query load drive memory use.',
    ram_source_urls=ARRAY['https://grafana.com/docs/mimir/latest/get-started/','https://grafana.com/docs/mimir/latest/get-started/about-grafana-mimir-architecture/']::text[],
    storage_estimate_confidence='low',
    storage_estimate_basis='Stores retained metrics; ingestion rate and retention period drive storage use.',
    storage_source_urls=ARRAY['https://grafana.com/docs/mimir/latest/get-started/','https://grafana.com/docs/mimir/latest/introduction/']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='grafanamimir'
    AND e.ram_estimate_min_mb=2048 AND e.ram_estimate_max_mb=8192
    AND e.storage_estimate_min_gb=5 AND e.storage_estimate_max_gb=100;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'grafanamimir estimate changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_min_mb=4096, ram_estimate_max_mb=8192, ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The project requires 4 GB of RAM and defaults the VM to 4 GB; heavier macOS apps need more.',
    ram_source_urls=ARRAY['https://github.com/dockur/macos/blob/master/readme.md']::text[],
    storage_estimate_min_gb=32, storage_estimate_max_gb=64, storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The project requires 32 GB of free disk and defaults the virtual disk to 64 GB.',
    storage_source_urls=ARRAY['https://github.com/dockur/macos/blob/master/readme.md']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='macos'
    AND e.ram_estimate_min_mb=2048 AND e.ram_estimate_max_mb=8192
    AND e.storage_estimate_min_gb=1 AND e.storage_estimate_max_gb=20;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'macos estimate changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_min_mb=512, ram_estimate_max_mb=2048, ram_estimate_kind='estimated',
    ram_estimate_confidence='medium',
    ram_estimate_basis='OmniRoute sends requests to connected model providers; model memory is separate unless a local model is also run.',
    ram_source_urls=ARRAY['https://github.com/diegosouzapw/omniroute','https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md']::text[],
    storage_estimate_min_gb=1, storage_estimate_max_gb=10, storage_estimate_kind='estimated',
    storage_estimate_confidence='medium',
    storage_estimate_basis='Stores gateway configuration and logs; model files stay with the connected model runtime.',
    storage_source_urls=ARRAY['https://github.com/diegosouzapw/omniroute','https://github.com/diegosouzapw/omniroute/blob/release/v3.8.51/docs/guides/DOCKER_GUIDE.md']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='omniroute'
    AND e.ram_estimate_min_mb=8192 AND e.ram_estimate_max_mb=32768
    AND e.storage_estimate_min_gb=20 AND e.storage_estimate_max_gb=100;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'omniroute estimate changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_app_resource_estimates AS e SET
    ram_estimate_min_mb=2048, ram_estimate_max_mb=8192, ram_estimate_kind='estimated',
    ram_estimate_confidence='high',
    ram_estimate_basis='The project requires 2 GB of RAM and defaults the VM to 4 GB; heavier Windows apps need more.',
    ram_source_urls=ARRAY['https://github.com/dockur/windows/blob/master/readme.md']::text[],
    storage_estimate_min_gb=32, storage_estimate_max_gb=64, storage_estimate_kind='estimated',
    storage_estimate_confidence='high',
    storage_estimate_basis='The project requires 32 GB of free disk and defaults the virtual disk to 64 GB.',
    storage_source_urls=ARRAY['https://github.com/dockur/windows/blob/master/readme.md']::text[],
    checked_at='2026-09-28T13:59:02+00:00', updated_at=now()
  FROM public.self_host_apps a
  WHERE e.app_id=a.id AND a.slug='windowsindocker'
    AND e.ram_estimate_min_mb=2048 AND e.ram_estimate_max_mb=8192
    AND e.storage_estimate_min_gb=50 AND e.storage_estimate_max_gb=500;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'windowsindocker estimate changed since review (rows updated: %)', affected; END IF;
END $$;
