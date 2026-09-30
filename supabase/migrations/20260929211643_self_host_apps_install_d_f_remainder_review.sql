-- Remaining D-F install review: keep only current, source-supported self-host entries.
-- This migration is guarded by the exact reviewed production snapshots.
DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    website_url = 'https://www.daytona.io/',
    install_docs_url = NULL,
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY[]::text[],
    docker_support = 'none',
    compose_support = FALSE,
    self_hosting_status = 'not_self_hostable',
    published = FALSE,
    data_source_urls = ARRAY(
      SELECT DISTINCT source_url
      FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
        'https://www.daytona.io/',
        'https://www.daytona.io/docs/en/bring-your-own-compute/',
        'https://github.com/daytonaio/daytona/releases/tag/v0.190.0'
      ]::text[]) AS sources(source_url)
      WHERE source_url IS NOT NULL
      ORDER BY source_url
    ),
    technical_fact_status = jsonb_set(
      jsonb_set(
        jsonb_set(
          coalesce(a.technical_fact_status, '{}'::jsonb),
          '{docker}',
          jsonb_build_object(
            'status', 'not_published',
            'checked_at', '2026-09-30',
            'confidence', 'high',
            'note', 'Current publisher materials remove OSS and on-prem deployment; BYOC keeps the Daytona control plane managed.',
            'source_urls', ARRAY[
              'https://github.com/daytonaio/daytona/releases/tag/v0.190.0',
              'https://www.daytona.io/docs/en/bring-your-own-compute/'
            ]::text[]
          ),
          TRUE
        ),
        '{compose}',
        jsonb_build_object(
          'status', 'not_published',
          'checked_at', '2026-09-30',
          'confidence', 'high',
          'note', 'Current publisher materials remove OSS and on-prem deployment; BYOC keeps the Daytona control plane managed.',
          'source_urls', ARRAY[
            'https://github.com/daytonaio/daytona/releases/tag/v0.190.0',
            'https://www.daytona.io/docs/en/bring-your-own-compute/'
          ]::text[]
        ),
        TRUE
      ),
      '{docker_image}',
      jsonb_build_object(
        'status', 'not_published',
        'checked_at', '2026-09-30',
        'confidence', 'high',
        'note', 'The current supported offering is the hosted Daytona control plane with optional BYOC runners.',
        'source_urls', ARRAY[
          'https://github.com/daytonaio/daytona/releases/tag/v0.190.0',
          'https://www.daytona.io/docs/en/bring-your-own-compute/'
        ]::text[]
      ),
      TRUE
    ),
    updated_at = now()
  WHERE a.id = '2006066a-9d33-4467-9a57-d397f92fe8e5'::uuid
    AND a.slug = 'daytona'
    AND a.website_url IS NOT DISTINCT FROM NULL
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/daytonaio/daytona/tree/v0.190.0'
    AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/daytonaio/daytona/tree/v0.190.0'
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.technical_fact_status->'docker'->>'status' = 'published'
    AND a.technical_fact_status->'compose'->>'status' = 'published'
    AND EXISTS (
      SELECT 1 FROM public.self_host_app_install_options AS i
      WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    );
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review guard failed for app daytona';
  END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = NULL,
    deployment_methods = ARRAY[]::text[],
    self_hosting_status = 'not_self_hostable',
    published = FALSE,
    data_source_urls = ARRAY(
      SELECT DISTINCT source_url
      FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
        'https://depay.com/docs/payments/integrate/widget/',
        'https://github.com/DePayFi/widgets'
      ]::text[]) AS sources(source_url)
      WHERE source_url IS NOT NULL
      ORDER BY source_url
    ),
    updated_at = now()
  WHERE a.id = '4fcfb900-4741-40a3-88c4-74626f60f4f4'::uuid
    AND a.slug = 'depay'
    AND a.name IS NOT DISTINCT FROM 'DePay'
    AND a.website_url IS NOT DISTINCT FROM 'https://depay.com'
    AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/DePayFi/widgets'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/DePayFi/widgets#readme'
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.technical_fact_status->'docker'->>'status' = 'not_published'
    AND a.technical_fact_status->'compose'->>'status' = 'not_published'
    AND EXISTS (
      SELECT 1 FROM public.self_host_app_install_options AS i
      WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    );
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review guard failed for app depay';
  END IF;

  UPDATE public.self_host_apps AS a SET
    name = 'OpenTaco',
    website_url = 'https://opentaco.dev/',
    install_docs_url = 'https://docs.digger.dev/ce/self-host/deploy-helm',
    deployment_methods = ARRAY['helm']::text[],
    data_source_urls = ARRAY(
      SELECT DISTINCT source_url
      FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
        'https://opentaco.dev/',
        'https://github.com/diggerhq/digger',
        'https://docs.digger.dev/ce/self-host/deploy-helm'
      ]::text[]) AS sources(source_url)
      WHERE source_url IS NOT NULL
      ORDER BY source_url
    ),
    updated_at = now()
  WHERE a.id = '57937616-c0e8-4fde-82f8-9b2455926a53'::uuid
    AND a.slug = 'digger'
    AND a.name IS NOT DISTINCT FROM 'Digger'
    AND a.website_url IS NOT DISTINCT FROM 'https://digger.dev'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/diggerhq/digger/blob/develop/docs/ce/self-host/deploy-helm.mdx'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.published IS NOT DISTINCT FROM TRUE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Review guard failed for app digger';
  END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"helm","label":"Helm chart","url":"https://docs.digger.dev/ce/self-host/deploy-helm","support_level":"official","source_url":"https://docs.digger.dev/ce/self-host/deploy-helm","image":null,"note":"The official guide installs the digger-backend chart from the publisher''s OCI registry. Use external PostgreSQL for production.","sort_order":10}]'::jsonb,
    source_urls = ARRAY['https://docs.digger.dev/ce/self-host/deploy-helm']::text[],
    checked_at = now(),
    docker_images = ARRAY[]::text[],
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY[]::text[],
    truenas_scale_urls = ARRAY[]::text[],
    unraid_urls = ARRAY[]::text[],
    umbrel_urls = ARRAY[]::text[],
    yunohost_urls = ARRAY[]::text[],
    casaos_urls = ARRAY[]::text[],
    runtipi_urls = ARRAY[]::text[],
    cosmos_urls = ARRAY[]::text[],
    openmediavault_urls = ARRAY[]::text[],
    synology_urls = ARRAY[]::text[],
    qnap_urls = ARRAY[]::text[],
    proxmox_urls = ARRAY[]::text[],
    home_assistant_os_urls = ARRAY[]::text[],
    kubernetes_urls = ARRAY[]::text[],
    helm_urls = ARRAY['https://docs.digger.dev/ce/self-host/deploy-helm']::text[],
    native_urls = ARRAY[]::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id
    AND a.id = '57937616-c0e8-4fde-82f8-9b2455926a53'::uuid
    AND a.slug = 'digger'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND i.helm_urls IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Install option guard failed for app digger';
  END IF;
END $$;
