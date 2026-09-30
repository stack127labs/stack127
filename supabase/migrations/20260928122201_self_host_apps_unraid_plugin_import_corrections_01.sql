-- Unraid plugin package URLs were misread as Docker Hub images.
WITH targets AS (
  SELECT
    app.id,
    app.docker_url AS bad_docker_url,
    app.source_code_url,
    install.unraid_urls[1] AS unraid_url,
    app.technical_fact_status
  FROM public.self_host_apps AS app
  JOIN public.self_host_app_install_options AS install ON install.app_id = app.id
  WHERE app.docker_url LIKE 'https://hub.docker.com/r/https://%'
    AND app.docker_image ~ '\.plg($|[?#])'
    AND cardinality(install.unraid_urls) > 0
    AND install.options @> '[{"method":"unraid"}]'::jsonb
), cleaned_status AS (
  SELECT
    target.id,
    COALESCE(
      jsonb_object_agg(
        fact.key,
        CASE
          WHEN jsonb_typeof(fact.value -> 'source_urls') = 'array' THEN jsonb_set(
            fact.value,
            '{source_urls}',
            (
              SELECT COALESCE(jsonb_agg(source_url.value ORDER BY source_url.ordinality), '[]'::jsonb)
              FROM jsonb_array_elements(fact.value -> 'source_urls') WITH ORDINALITY AS source_url(value, ordinality)
              WHERE source_url.value #>> '{}' <> target.bad_docker_url
            ),
            false
          )
          ELSE fact.value
        END
      ) FILTER (WHERE fact.key IS NOT NULL),
      '{}'::jsonb
    ) AS status
  FROM targets AS target
  LEFT JOIN LATERAL jsonb_each(COALESCE(target.technical_fact_status, '{}'::jsonb)) AS fact ON true
  GROUP BY target.id
)
UPDATE public.self_host_apps AS app
SET
  docker_url = NULL,
  docker_image = NULL,
  docker_support = 'unknown',
  compose_support = NULL,
  deployment_methods = array_remove(app.deployment_methods, 'docker'),
  data_source_urls = array_remove(COALESCE(app.data_source_urls, '{}'::text[]), target.bad_docker_url),
  technical_fact_status = cleaned_status.status || jsonb_build_object(
    'docker', jsonb_build_object(
      'status', 'unchecked',
      'confidence', 'unknown',
      'note', 'The Unraid catalog listed a plugin package, which was incorrectly imported as a Docker image. Docker support needs a project-source check.',
      'source_urls', to_jsonb(array_remove(ARRAY[target.source_code_url, target.unraid_url], NULL))
    ),
    'docker_image', jsonb_build_object(
      'status', 'unchecked',
      'confidence', 'unknown',
      'note', 'The stored value was an Unraid plugin package URL, not a container image.',
      'source_urls', to_jsonb(array_remove(ARRAY[target.source_code_url, target.unraid_url], NULL))
    ),
    'compose', jsonb_build_object(
      'status', 'unchecked',
      'confidence', 'unknown',
      'note', 'Compose support was not verified from the project sources.',
      'source_urls', to_jsonb(array_remove(ARRAY[target.source_code_url, target.unraid_url], NULL))
    )
  )
FROM targets AS target
JOIN cleaned_status ON cleaned_status.id = target.id
WHERE app.id = target.id;

WITH targets AS (
  SELECT app.id
  FROM public.self_host_apps AS app
  WHERE app.docker_url IS NULL
    AND app.docker_image IS NULL
    AND app.docker_support = 'unknown'
    AND app.technical_fact_status -> 'docker' ->> 'note' = 'The Unraid catalog listed a plugin package, which was incorrectly imported as a Docker image. Docker support needs a project-source check.'
), cleaned AS (
  SELECT
    install.app_id,
    COALESCE(
      (
        SELECT jsonb_agg(option.value ORDER BY option.ordinality)
        FROM jsonb_array_elements(install.options) WITH ORDINALITY AS option(value, ordinality)
        WHERE NOT (
          option.value ->> 'method' = 'docker'
          AND (
            option.value ->> 'url' LIKE 'https://hub.docker.com/r/https://%'
            OR option.value ->> 'image' ~ '\.plg($|[?#])'
          )
        )
      ),
      '[]'::jsonb
    ) AS options,
    COALESCE(
      (
        SELECT jsonb_agg(
          CASE
            WHEN source.value ->> 'source' = 'unraid_apps'
              AND source.value -> 'payload' ->> 'registry_url' LIKE 'https://hub.docker.com/r/https://%'
            THEN jsonb_set(
              source.value,
              '{payload}',
              ((source.value -> 'payload') - 'registry_url' - 'docker_url' - 'image')
                || jsonb_strip_nulls(jsonb_build_object('plugin_url', source.value -> 'payload' -> 'image')),
              false
            )
            ELSE source.value
          END
          ORDER BY source.ordinality
        )
        FROM jsonb_array_elements(COALESCE(install.catalog_sources, '[]'::jsonb)) WITH ORDINALITY AS source(value, ordinality)
      ),
      '[]'::jsonb
    ) AS catalog_sources
  FROM public.self_host_app_install_options AS install
  JOIN targets ON targets.id = install.app_id
)
UPDATE public.self_host_app_install_options AS install
SET
  options = cleaned.options,
  docker_urls = COALESCE(
    ARRAY(SELECT DISTINCT option.value ->> 'url' FROM jsonb_array_elements(cleaned.options) AS option(value) WHERE option.value ->> 'method' = 'docker'),
    '{}'::text[]
  ),
  docker_images = COALESCE(
    ARRAY(SELECT DISTINCT option.value ->> 'image' FROM jsonb_array_elements(cleaned.options) AS option(value) WHERE option.value ->> 'method' = 'docker' AND option.value ->> 'image' IS NOT NULL),
    '{}'::text[]
  ),
  source_urls = COALESCE(
    ARRAY(SELECT DISTINCT option.value ->> 'source_url' FROM jsonb_array_elements(cleaned.options) AS option(value) WHERE option.value ->> 'source_url' IS NOT NULL),
    '{}'::text[]
  ),
  catalog_sources = cleaned.catalog_sources
FROM cleaned
WHERE install.app_id = cleaned.app_id;

WITH target AS (
  SELECT
    app.id,
    app.install_docs_url AS malformed_url,
    'https://forums.unraid.net/topic/198558-support-itsnotwebby-modded-minecraft-servers-for-unraid/'::text AS corrected_url,
    app.technical_fact_status
  FROM public.self_host_apps AS app
  WHERE app.slug = 'allthemons'
    AND app.install_docs_url = 'https://https//forums.unraid.net/topic/198558-support-itsnotwebby-modded-minecraft-servers-for-unraid/'
), cleaned_status AS (
  SELECT
    target.id,
    COALESCE(
      jsonb_object_agg(
        fact.key,
        CASE
          WHEN jsonb_typeof(fact.value -> 'source_urls') = 'array' THEN jsonb_set(
            fact.value,
            '{source_urls}',
            (
              SELECT COALESCE(jsonb_agg(
                CASE WHEN source_url.value #>> '{}' = target.malformed_url THEN to_jsonb(target.corrected_url) ELSE source_url.value END
                ORDER BY source_url.ordinality
              ), '[]'::jsonb)
              FROM jsonb_array_elements(fact.value -> 'source_urls') WITH ORDINALITY AS source_url(value, ordinality)
            ),
            false
          )
          ELSE fact.value
        END
      ) FILTER (WHERE fact.key IS NOT NULL),
      '{}'::jsonb
    ) AS status
  FROM target
  LEFT JOIN LATERAL jsonb_each(COALESCE(target.technical_fact_status, '{}'::jsonb)) AS fact ON true
  GROUP BY target.id
)
UPDATE public.self_host_apps AS app
SET
  install_docs_url = target.corrected_url,
  data_source_urls = array_replace(COALESCE(app.data_source_urls, '{}'::text[]), target.malformed_url, target.corrected_url),
  technical_fact_status = cleaned_status.status
FROM target
JOIN cleaned_status ON cleaned_status.id = target.id
WHERE app.id = target.id;
