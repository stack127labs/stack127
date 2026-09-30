BEGIN;

-- Community app-store templates are community install methods, even when the
-- catalog itself is operated by the device vendor.
UPDATE public.self_host_app_install_options AS i
SET options = (
  SELECT COALESCE(jsonb_agg(
    CASE
      WHEN option ->> 'method' = 'compose'
        AND COALESCE(option ->> 'source_url', option ->> 'url', '')
          ILIKE '%IceWhaleTech/CasaOS-AppStore%'
      THEN jsonb_set(
        jsonb_set(option, '{support_level}', '"community"'::jsonb, true),
        '{note}',
        to_jsonb('Community Compose setup from the CasaOS app store.'::text),
        true
      )
      ELSE option
    END
    ORDER BY position
  ), '[]'::jsonb)
  FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) WITH ORDINALITY AS item(option, position)
)
WHERE EXISTS (
  SELECT 1
  FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
  WHERE option ->> 'method' = 'compose'
    AND COALESCE(option ->> 'source_url', option ->> 'url', '')
      ILIKE '%IceWhaleTech/CasaOS-AppStore%'
    AND option ->> 'support_level' IS DISTINCT FROM 'community'
);

-- Use direct, official setup links for projects whose current Compose option
-- was missing or pointed to a non-install test file.
UPDATE public.self_host_apps
SET compose_url = 'https://github.com/traccar/traccar/blob/master/docker/compose/traccar-mysql.yaml',
    docker_image = 'traccar/traccar:latest',
    updated_at = now()
WHERE slug = 'traccar'
  AND published;

UPDATE public.self_host_apps
SET docker_support = 'official',
    docker_url = 'https://hub.docker.com/r/libretranslate/libretranslate',
    docker_image = 'libretranslate/libretranslate:latest',
    compose_support = true,
    compose_url = 'https://github.com/LibreTranslate/LibreTranslate/blob/main/docker-compose.yml',
    docs_url = 'https://docs.libretranslate.com/',
    install_docs_url = 'https://docs.libretranslate.com/guides/installation/',
    updated_at = now()
WHERE slug = 'libretranslate'
  AND published;

-- Neos listed a Docker Compose file used by its test suite, not app deployment.
UPDATE public.self_host_apps
SET compose_support = false,
    compose_url = NULL,
    updated_at = now()
WHERE slug = 'neos'
  AND published;

-- Add the six verified project setup paths that were missing from the install
-- buttons. Tutor is community-supported; the other links are maintained by
-- their respective app publishers.
WITH targets AS (
  SELECT
    id,
    slug,
    compose_url,
    docker_image,
    CASE WHEN slug = 'edx' THEN 'community' ELSE 'official' END AS support_level
  FROM public.self_host_apps
  WHERE published
    AND slug IN ('calcom', 'cozy-cloud', 'edx', 'geometrikks-timescaledb', 'split-pro', 'traccar')
    AND compose_url IS NOT NULL
)
UPDATE public.self_host_app_install_options AS i
SET options = COALESCE(i.options, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
      'method', 'compose',
      'label', 'Docker Compose',
      'url', t.compose_url,
      'image', t.docker_image,
      'support_level', t.support_level,
      'source_url', t.compose_url,
      'note', NULL,
      'sort_order', 20
    )),
    updated_at = now()
FROM targets AS t
WHERE i.app_id = t.id
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
    WHERE option ->> 'method' = 'compose'
  );

-- Correct the Docker listing and add the official Compose path for GeoMetrikks.
UPDATE public.self_host_app_install_options AS i
SET options = (
  SELECT COALESCE(jsonb_agg(
    CASE
      WHEN option ->> 'method' = 'docker' THEN jsonb_build_object(
        'method', 'docker',
        'label', 'Docker image',
        'url', 'https://github.com/GilbN/geometrikks/pkgs/container/geometrikks',
        'image', 'ghcr.io/gilbn/geometrikks:latest',
        'support_level', 'official',
        'source_url', 'https://github.com/GilbN/geometrikks#quickstart',
        'note', NULL,
        'sort_order', 10
      )
      ELSE option
    END
    ORDER BY position
  ), '[]'::jsonb)
  FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) WITH ORDINALITY AS item(option, position)
)
WHERE i.app_id = (SELECT id FROM public.self_host_apps WHERE slug = 'geometrikks-timescaledb' AND published);

-- Correct Traccar's image button, which was stale and incorrectly marked as
-- community maintained.
UPDATE public.self_host_app_install_options AS i
SET options = (
  SELECT COALESCE(jsonb_agg(
    CASE
      WHEN option ->> 'method' = 'docker' THEN jsonb_build_object(
        'method', 'docker',
        'label', 'Docker image',
        'url', 'https://hub.docker.com/r/traccar/traccar',
        'image', 'traccar/traccar:latest',
        'support_level', 'official',
        'source_url', 'https://www.traccar.org/docker/',
        'note', NULL,
        'sort_order', 10
      )
      ELSE option
    END
    ORDER BY position
  ), '[]'::jsonb)
  FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) WITH ORDINALITY AS item(option, position)
)
WHERE i.app_id = (SELECT id FROM public.self_host_apps WHERE slug = 'traccar' AND published);

-- Refresh LibreTranslate's Docker and Compose entries to the official current
-- project links and image instead of an old, pinned release.
UPDATE public.self_host_app_install_options AS i
SET options = (
  SELECT COALESCE(jsonb_agg(
    CASE
      WHEN option ->> 'method' = 'docker' THEN jsonb_build_object(
        'method', 'docker',
        'label', 'Docker image',
        'url', 'https://hub.docker.com/r/libretranslate/libretranslate',
        'image', 'libretranslate/libretranslate:latest',
        'support_level', 'official',
        'source_url', 'https://docs.libretranslate.com/guides/installation/',
        'note', NULL,
        'sort_order', 10
      )
      WHEN option ->> 'method' = 'compose' THEN jsonb_build_object(
        'method', 'compose',
        'label', 'Docker Compose',
        'url', 'https://github.com/LibreTranslate/LibreTranslate/blob/main/docker-compose.yml',
        'image', 'libretranslate/libretranslate:latest',
        'support_level', 'official',
        'source_url', 'https://docs.libretranslate.com/guides/build_from_sources/',
        'note', NULL,
        'sort_order', 20
      )
      ELSE option
    END
    ORDER BY position
  ), '[]'::jsonb)
  FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) WITH ORDINALITY AS item(option, position)
)
WHERE i.app_id = (SELECT id FROM public.self_host_apps WHERE slug = 'libretranslate' AND published);

-- Remove the Neos test-only Compose option.
UPDATE public.self_host_app_install_options AS i
SET options = COALESCE((
      SELECT jsonb_agg(option ORDER BY position)
      FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) WITH ORDINALITY AS item(option, position)
      WHERE option ->> 'method' <> 'compose'
    ), '[]'::jsonb),
    updated_at = now()
WHERE i.app_id = (SELECT id FROM public.self_host_apps WHERE slug = 'neos' AND published);

-- Keep the older array columns in step with the install-option objects.
UPDATE public.self_host_app_install_options AS i
SET docker_urls = ARRAY(
      SELECT DISTINCT option ->> 'url'
      FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
      WHERE option ->> 'method' = 'docker' AND NULLIF(option ->> 'url', '') IS NOT NULL
    ),
    docker_images = ARRAY(
      SELECT DISTINCT option ->> 'image'
      FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
      WHERE option ->> 'method' = 'docker' AND NULLIF(option ->> 'image', '') IS NOT NULL
    ),
    compose_urls = ARRAY(
      SELECT DISTINCT option ->> 'url'
      FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
      WHERE option ->> 'method' = 'compose' AND NULLIF(option ->> 'url', '') IS NOT NULL
    ),
    source_urls = ARRAY(
      SELECT DISTINCT source_url
      FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
      CROSS JOIN LATERAL (VALUES (NULLIF(option ->> 'source_url', '')), (NULLIF(option ->> 'url', ''))) AS urls(source_url)
      WHERE source_url IS NOT NULL
    ),
    updated_at = now()
WHERE i.app_id IN (
  SELECT id FROM public.self_host_apps
  WHERE slug IN ('calcom', 'cozy-cloud', 'edx', 'geometrikks-timescaledb', 'split-pro', 'traccar', 'neos', 'libretranslate')
)
OR EXISTS (
  SELECT 1
  FROM jsonb_array_elements(COALESCE(i.options, '[]'::jsonb)) AS item(option)
  WHERE option ->> 'method' = 'compose'
    AND COALESCE(option ->> 'source_url', option ->> 'url', '')
      ILIKE '%IceWhaleTech/CasaOS-AppStore%'
);

-- GeoMetrikks is a log-analysis dashboard with geolocation, not an AI, database,
-- or password-management product.
DELETE FROM public.self_host_app_category_links AS l
USING public.self_host_apps AS a, public.self_host_app_categories AS c
WHERE l.app_id = a.id
  AND l.category_id = c.id
  AND a.slug = 'geometrikks-timescaledb'
  AND c.slug IN ('ai-ml', 'databases', 'password-managers');

INSERT INTO public.self_host_app_category_links (app_id, category_id)
SELECT a.id, c.id
FROM public.self_host_apps AS a
CROSS JOIN public.self_host_app_categories AS c
WHERE a.slug = 'geometrikks-timescaledb'
  AND c.slug IN ('dashboards', 'maps-travel', 'monitoring-status')
  AND NOT EXISTS (
    SELECT 1
    FROM public.self_host_app_category_links AS existing
    WHERE existing.app_id = a.id
      AND existing.category_id = c.id
  );

-- Keep research sources with the affected project facts.
UPDATE public.self_host_apps AS a
SET data_source_urls = ARRAY(
      SELECT DISTINCT source_url
      FROM unnest(COALESCE(a.data_source_urls, ARRAY[]::text[]) || addition.urls) AS urls(source_url)
      WHERE NULLIF(source_url, '') IS NOT NULL
    ),
    updated_at = now()
FROM (VALUES
  ('calcom', ARRAY['https://github.com/calcom/cal.diy', 'https://github.com/calcom/cal.diy/blob/main/docker-compose.yml']::text[]),
  ('cozy-cloud', ARRAY['https://docs.cozy.io/en/tutorials/selfhosting/docker/']::text[]),
  ('edx', ARRAY['https://docs.openedx.org/en/latest/site_ops/quickstarts/tutor_quickstart_ops.html']::text[]),
  ('geometrikks-timescaledb', ARRAY['https://github.com/GilbN/geometrikks', 'https://github.com/GilbN/geometrikks/blob/main/docker-compose.yml']::text[]),
  ('split-pro', ARRAY['https://github.com/oss-apps/split-pro/blob/main/docker/prod/compose.yml']::text[]),
  ('traccar', ARRAY['https://www.traccar.org/docker/', 'https://github.com/traccar/traccar/blob/master/docker/compose/traccar-mysql.yaml']::text[]),
  ('libretranslate', ARRAY['https://docs.libretranslate.com/guides/installation/', 'https://docs.libretranslate.com/guides/build_from_sources/', 'https://github.com/LibreTranslate/LibreTranslate/blob/main/docker-compose.yml']::text[])
) AS addition(slug, urls)
WHERE a.slug = addition.slug
  AND a.published;

-- LibreTranslate downloads language models. Give its displayed resource ranges
-- room for model storage and a normal small single-node setup.
UPDATE public.self_host_app_resource_estimates AS e
SET ram_estimate_min_mb = 1024,
    ram_estimate_max_mb = 4096,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = 'low',
    ram_estimate_basis = 'Typical small single-node setup with language models loaded; request load varies.',
    ram_source_urls = ARRAY['https://docs.libretranslate.com/guides/installation/', 'https://docs.libretranslate.com/guides/build_from_sources/'],
    storage_estimate_min_gb = 5,
    storage_estimate_max_gb = 20,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = 'low',
    storage_estimate_basis = 'Allows for language-model files and a small amount of local data.',
    storage_source_urls = ARRAY['https://docs.libretranslate.com/guides/build_from_sources/'],
    checked_at = now(),
    updated_at = now()
FROM public.self_host_apps AS a
WHERE e.app_id = a.id
  AND a.slug = 'libretranslate'
  AND a.published;

COMMIT;
