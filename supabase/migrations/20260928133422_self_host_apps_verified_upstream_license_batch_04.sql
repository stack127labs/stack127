-- Correct eight app records using direct official upstream source and docs.
-- Each update checks the reviewed production values before changing one row.
DO $migration$
DECLARE
  affected integer;
BEGIN
  UPDATE public.self_host_apps AS a SET
    summary='Web interface for generating and editing images with Stable Diffusion models.',
    source_model='open_source', license='GNU Affero General Public License v3.0',
    license_spdx_id='AGPL-3.0', license_type='copyleft',
    website_url='https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    docs_url='https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki',
    install_docs_url='https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Containers',
    publisher_name='AUTOMATIC1111', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
        'https://github.com/AUTOMATIC1111/stable-diffusion-webui/blob/master/LICENSE.txt',
        'https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki',
        'https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Containers'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='automatic1111-stable-diffusion-web-ui' AND a.published=true
    AND a.name='AUTOMATIC1111-Stable-Diffusion-Web-UI'
    AND a.summary='Web interface for Stable Diffusion Integrates with Open WebUI: Add custom models:.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='AGPL-3.0' AND a.license_type='copyleft'
    AND a.website_url IS NULL
    AND a.docs_url='https://forums.unraid.net/topic/133764-support-grtgbln-docker-templates'
    AND a.install_docs_url='https://forums.unraid.net/topic/133764-support-grtgbln-docker-templates'
    AND a.publisher_name='automatic1111' AND a.publisher_type='community'
    AND a.publisher_url='https://github.com/automatic1111' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'automatic1111 web ui changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='MIT License', license_spdx_id='MIT',
    license_type='permissive', website_url='https://bitcoincore.org/',
    docs_url='https://github.com/bitcoin/bitcoin/tree/master/doc',
    install_docs_url='https://bitcoin.org/en/full-node',
    publisher_name='Bitcoin Core', publisher_url='https://bitcoincore.org/',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/bitcoin/bitcoin',
        'https://github.com/bitcoin/bitcoin/blob/master/COPYING',
        'https://bitcoincore.org/en/download/',
        'https://bitcoin.org/en/full-node'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='bitcoind' AND a.published=true
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://forums.unraid.net/topic/195410-support-anym001-application-dockers/'
    AND a.install_docs_url='https://forums.unraid.net/topic/195410-support-anym001-application-dockers/'
    AND a.publisher_name='bitcoin' AND a.publisher_type='community'
    AND a.publisher_url='https://github.com/bitcoin' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'bitcoind changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='Prometheus Alertmanager',
    summary='Groups, deduplicates, and routes Prometheus alerts to notification services.',
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', website_url='https://prometheus.io/',
    docs_url='https://prometheus.io/docs/alerting/latest/alertmanager/',
    install_docs_url='https://github.com/prometheus/alertmanager#install',
    docker_support='official', publisher_name='Prometheus',
    publisher_url='https://prometheus.io/', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/prometheus/alertmanager',
        'https://github.com/prometheus/alertmanager/blob/main/LICENSE',
        'https://prometheus.io/docs/alerting/latest/alertmanager/',
        'https://hub.docker.com/r/prom/alertmanager'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='prom-alertmanager' AND a.published=true
    AND a.name='prom-alertmanager'
    AND a.summary='The Alertmanager handles alerts sent by client applications such as the Prometheus server.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://forums.unraid.net/topic/87798-support-selfhostersnets-template-repository/'
    AND a.install_docs_url='https://forums.unraid.net/topic/87798-support-selfhostersnets-template-repository/'
    AND a.docker_url='https://hub.docker.com/r/prom/alertmanager'
    AND a.docker_image='prom/alertmanager:latest' AND a.docker_support='community'
    AND a.publisher_name='prometheus' AND a.publisher_type='community'
    AND a.publisher_url='https://github.com/prometheus' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'alertmanager changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Streams camera video using formats and protocols such as RTSP and WebRTC.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT',
    license_type='permissive', website_url='https://github.com/AlexxIT/go2rtc',
    docs_url='https://github.com/AlexxIT/go2rtc#readme',
    install_docs_url='https://github.com/AlexxIT/go2rtc#go2rtc-docker',
    docker_support='official', publisher_name='AlexxIT',
    publisher_url='https://github.com/AlexxIT/go2rtc', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/AlexxIT/go2rtc',
        'https://github.com/AlexxIT/go2rtc/blob/master/LICENSE',
        'https://hub.docker.com/r/alexxit/go2rtc'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='go2rtc' AND a.published=true
    AND a.summary='Camera streaming application with support RTSP, WebRTC, HomeKit, FFmpeg, RTMP, etc, • zero-dependency and zero-config small app for all OS.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://github.com/AlexxIT/go2rtc/issues'
    AND a.install_docs_url='https://github.com/AlexxIT/go2rtc/issues'
    AND a.docker_url='https://hub.docker.com/r/alexxit/go2rtc'
    AND a.docker_image='alexxit/go2rtc:latest' AND a.docker_support='community'
    AND a.publisher_name='alexxit' AND a.publisher_type='community'
    AND a.publisher_url='https://github.com/alexxit' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'go2rtc changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='OneDrive Client for Linux',
    source_model='open_source', license='GNU General Public License v3.0',
    license_spdx_id='GPL-3.0', license_type='copyleft',
    website_url='https://abraunegg.github.io/', docs_url='https://abraunegg.github.io/',
    install_docs_url='https://github.com/abraunegg/onedrive/blob/master/docs/install.md',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/abraunegg/onedrive',
        'https://github.com/abraunegg/onedrive/blob/master/docs/install.md',
        'https://github.com/abraunegg/onedrive/blob/master/docs/docker.md',
        'https://abraunegg.github.io/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='onedrive' AND a.published=true
    AND a.name='Onedrive'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='GPL-3.0' AND a.license_type='copyleft'
    AND a.website_url IS NULL
    AND a.docs_url='https://forums.unraid.net/topic/133978-support-bversluis-onedrive/'
    AND a.install_docs_url='https://forums.unraid.net/topic/133978-support-bversluis-onedrive/'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'onedrive changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='MIT License or Apache License 2.0',
    license_spdx_id='MIT OR Apache-2.0', license_type='permissive',
    install_docs_url='https://github.com/sigoden/dufs#install',
    docker_url='https://hub.docker.com/r/sigoden/dufs',
    docker_image='sigoden/dufs:latest', docker_support='official', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/sigoden/dufs',
        'https://github.com/sigoden/dufs/blob/main/LICENSE-APACHE',
        'https://github.com/sigoden/dufs/blob/main/LICENSE-MIT',
        'https://hub.docker.com/r/sigoden/dufs'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='dufs' AND a.published=true
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.install_docs_url='https://github.com/sigoden/dufs#readme'
    AND a.docker_url IS NULL AND a.docker_image IS NULL AND a.docker_support='none'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'dufs changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='Nextcloud All-in-One',
    summary='Deploys Nextcloud with its database, cache, and optional office, backup, and collaboration services.',
    source_model='open_source', license='GNU Affero General Public License v3.0',
    license_spdx_id='AGPL-3.0', license_type='copyleft',
    website_url='https://nextcloud.com/',
    docker_url='https://github.com/nextcloud-releases/all-in-one/pkgs/container/all-in-one',
    docker_image='ghcr.io/nextcloud-releases/all-in-one:latest', docker_support='official',
    publisher_name='Nextcloud', publisher_type='company', publisher_url='https://nextcloud.com/',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/nextcloud/all-in-one',
        'https://github.com/nextcloud/all-in-one/blob/main/LICENSE',
        'https://github.com/nextcloud-releases/all-in-one/pkgs/container/all-in-one',
        'https://nextcloud.com/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='nextcloud-aio-mastercontainer' AND a.published=true
    AND a.name='nextcloud-aio-mastercontainer'
    AND a.summary='The official Nextcloud installation method, Nextcloud AIO provides easy deployment and maintenance with most features included in this one Nextcloud.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='AGPL-3.0' AND a.license_type='copyleft'
    AND a.website_url IS NULL
    AND a.docs_url='https://github.com/nextcloud/all-in-one'
    AND a.install_docs_url='https://github.com/nextcloud/all-in-one'
    AND a.docker_url='https://registry.hub.docker.com/r/nextcloud/all-in-one'
    AND a.docker_image='nextcloud/all-in-one:latest' AND a.docker_support='community'
    AND a.publisher_name='nextcloud' AND a.publisher_type='community'
    AND a.publisher_url='https://github.com/nextcloud' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'nextcloud aio changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    name='SD.Next',
    summary='Web interface for generating, captioning, and processing AI images and videos.',
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', website_url='https://vladmandic.github.io/sdnext/',
    docs_url='https://vladmandic.github.io/sdnext-docs/',
    install_docs_url='https://vladmandic.github.io/sdnext-docs/Installation/',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/vladmandic/sdnext',
        'https://github.com/vladmandic/sdnext/blob/master/LICENSE',
        'https://vladmandic.github.io/sdnext/',
        'https://vladmandic.github.io/sdnext-docs/',
        'https://vladmandic.github.io/sdnext-docs/Installation/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='sdnext' AND a.published=true
    AND a.name='sdnext' AND a.summary='Stable Diffusion Next WebUI with GPU acceleration support.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://github.com/vladmandic/sdnext/issues'
    AND a.install_docs_url='https://github.com/vladmandic/sdnext/issues'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'sdnext changed since review (rows updated: %)', affected; END IF;
END;
$migration$;
