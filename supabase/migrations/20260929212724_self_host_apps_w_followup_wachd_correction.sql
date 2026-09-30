-- Wachd's published install options already contain the verified GHCR image and Compose route.
-- Repair only the app-level Docker registry link and attach its upstream evidence.
BEGIN;
DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    docker_url = 'https://github.com/orgs/wachd/packages/container/package/wachd',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/orgs/wachd/packages/container/package/wachd', 'https://github.com/wachd/wachd/blob/main/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official Compose file uses the Wachd GHCR image.','source_urls',jsonb_build_array('https://github.com/wachd/wachd/blob/main/docker-compose.yml','https://github.com/orgs/wachd/packages/container/package/wachd')),
      'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The official Compose file names ghcr.io/wachd/wachd:latest.','source_urls',jsonb_build_array('https://github.com/wachd/wachd/blob/main/docker-compose.yml','https://github.com/orgs/wachd/packages/container/package/wachd'))
    ),
    updated_at = now()
  WHERE a.id = '80605c76-7a4d-4df0-979c-182ffa078fa4'::uuid
    AND a.slug = 'wachd'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM 'ghcr.io/wachd/wachd:latest'
    AND a.compose_url IS NOT DISTINCT FROM 'https://raw.githubusercontent.com/wachd/wachd/HEAD/docker-compose.yml'
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for wachd'; END IF;
END $$;
COMMIT;
