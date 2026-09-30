-- Correct five app records against their official project repositories and docs.
-- Each update checks the reviewed production values before changing one row.
DO $migration$
DECLARE
  affected integer;
BEGIN
  UPDATE public.self_host_apps AS a SET
    summary='FRP forwards traffic to services behind NAT or a firewall.',
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', website_url='https://gofrp.org/en/',
    docs_url='https://gofrp.org/en/docs/', install_docs_url='https://gofrp.org/en/docs/setup/',
    publisher_name='fatedier', publisher_type='community',
    publisher_url='https://github.com/fatedier/frp', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/fatedier/frp',
        'https://github.com/fatedier/frp/blob/dev/LICENSE',
        'https://gofrp.org/en/',
        'https://gofrp.org/en/docs/',
        'https://gofrp.org/en/docs/setup/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='frp' AND a.published=true
    AND a.summary='FRP client and server for creating reverse proxies across network boundaries.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://github.com/fatedier/frp#readme'
    AND a.install_docs_url='https://github.com/fatedier/frp#readme'
    AND a.publisher_name='井沢川秃顶版' AND a.publisher_type='community'
    AND a.publisher_url='https://hub.docker.com/u/homelabo'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'frp changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', docs_url='https://github.com/homebridge/homebridge/wiki',
    install_docs_url='https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Docker',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/homebridge/homebridge',
        'https://github.com/homebridge/homebridge/blob/latest/LICENSE',
        'https://github.com/homebridge/homebridge/wiki',
        'https://github.com/homebridge/homebridge/wiki/Install-Homebridge-on-Docker',
        'https://homebridge.io/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='homebridge' AND a.published=true
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.docs_url='https://github.com/homebridge/homebridge/issues'
    AND a.install_docs_url='https://github.com/homebridge/homebridge/issues'
    AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'homebridge changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Runs large language and vision-language models across a wide range of hardware.',
    source_model='open_source', license='MIT License', license_spdx_id='MIT',
    license_type='permissive', website_url='https://llama.app/',
    docs_url='https://github.com/ggml-org/llama.cpp#documentation',
    install_docs_url='https://github.com/ggml-org/llama.cpp/blob/master/docs/docker.md',
    docker_url='https://github.com/ggml-org/llama.cpp/pkgs/container/llama.cpp',
    docker_image='ghcr.io/ggml-org/llama.cpp:server', docker_support='official',
    pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/ggml-org/llama.cpp',
        'https://github.com/ggml-org/llama.cpp/blob/master/LICENSE',
        'https://github.com/ggml-org/llama.cpp/blob/master/docs/docker.md',
        'https://github.com/ggml-org/llama.cpp/pkgs/container/llama.cpp',
        'https://llama.app/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='llama-cpp' AND a.published=true
    AND a.summary='Inference of Meta''s LLaMA model (and others) in pure C/C++.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='MIT' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://github.com/ggml-org/llama.cpp/issues'
    AND a.install_docs_url='https://github.com/ggml-org/llama.cpp/issues'
    AND a.docker_url='https://registry.hub.docker.com/r/ghcr.io/ggml-org/llama.cpp'
    AND a.docker_image='ghcr.io/ggml-org/llama.cpp:full'
    AND a.docker_support='community' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'llama-cpp changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', website_url='https://www.rancher.com/',
    docs_url='https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/',
    install_docs_url='https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/other-installation-methods/rancher-on-a-single-node-with-docker/',
    docker_support='official', publisher_name='SUSE', publisher_type='company',
    publisher_url='https://www.suse.com/',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/rancher/rancher',
        'https://github.com/rancher/rancher/blob/main/LICENSE',
        'https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/',
        'https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/installation-requirements/',
        'https://ranchermanager.docs.rancher.com/getting-started/installation-and-upgrade/other-installation-methods/rancher-on-a-single-node-with-docker/',
        'https://www.rancher.com/',
        'https://www.suse.com/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='rancher' AND a.published=true
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.website_url IS NULL
    AND a.docs_url='https://rancher.com/docs/rancher/v2.x/en/installation/other-installation-methods/single-node-docker/'
    AND a.install_docs_url='https://rancher.com/docs/rancher/v2.x/en/installation/other-installation-methods/single-node-docker/'
    AND a.docker_support='community'
    AND a.publisher_name='rancher' AND a.publisher_type='community'
    AND a.publisher_url='https://github.com/rancher';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'rancher changed since review (rows updated: %)', affected; END IF;

  UPDATE public.self_host_apps AS a SET
    summary='Serves large language models through a high-throughput, OpenAI-compatible API.',
    source_model='open_source', license='Apache License 2.0', license_spdx_id='Apache-2.0',
    license_type='permissive', website_url='https://vllm.ai/',
    docs_url='https://docs.vllm.ai/en/latest/',
    install_docs_url='https://docs.vllm.ai/en/latest/getting_started/installation/',
    docker_url='https://hub.docker.com/r/vllm/vllm-openai',
    docker_image='vllm/vllm-openai:latest', docker_support='official',
    publisher_name='vLLM Project', pricing_model='free',
    data_source_urls=coalesce((
      SELECT array_agg(DISTINCT url ORDER BY url)
      FROM unnest(coalesce(a.data_source_urls,'{}'::text[]) || ARRAY[
        'https://github.com/vllm-project/vllm',
        'https://github.com/vllm-project/vllm/blob/main/LICENSE',
        'https://docs.vllm.ai/en/latest/',
        'https://docs.vllm.ai/en/latest/deployment/docker/',
        'https://docs.vllm.ai/en/latest/getting_started/installation/',
        'https://hub.docker.com/r/vllm/vllm-openai',
        'https://vllm.ai/'
      ]::text[]) AS src(url)
    ), '{}'::text[]),
    updated_at=now()
  WHERE a.slug='vllm' AND a.published=true
    AND a.summary='VLLM is a high-throughput and memory-efficient inference and serving engine for LLMs with an OpenAI-compatible API.'
    AND a.source_model='source_available'
    AND a.license='No license file declared (all rights reserved by default)'
    AND a.license_spdx_id='Apache-2.0' AND a.license_type='permissive'
    AND a.website_url='https://github.com/vllm-project/vllm'
    AND a.docs_url='https://apps.truenas.com/catalog/vllm_community/'
    AND a.install_docs_url='https://apps.truenas.com/catalog/vllm_community/'
    AND a.docker_url IS NULL AND a.docker_image IS NULL AND a.docker_support='none'
    AND a.publisher_name='vllm-project' AND a.pricing_model='unknown';
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'vllm changed since review (rows updated: %)', affected; END IF;
END;
$migration$;
