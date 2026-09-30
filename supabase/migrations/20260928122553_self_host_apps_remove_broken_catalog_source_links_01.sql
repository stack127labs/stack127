-- Remove malformed Docker Hub wrappers from research and technical-fact evidence.
WITH cleaned AS (
  SELECT
    app.id,
    ARRAY(
      SELECT source_url.url
      FROM unnest(COALESCE(app.data_source_urls, '{}'::text[])) WITH ORDINALITY AS source_url(url, ordinality)
      WHERE source_url.url NOT LIKE 'https://hub.docker.com/r/https://%'
      ORDER BY source_url.ordinality
    ) AS data_source_urls,
    COALESCE(
      (
        SELECT jsonb_object_agg(
          fact.key,
          CASE
            WHEN jsonb_typeof(fact.value -> 'source_urls') = 'array' THEN jsonb_set(
              fact.value,
              '{source_urls}',
              (
                SELECT COALESCE(jsonb_agg(source_url.value ORDER BY source_url.ordinality), '[]'::jsonb)
                FROM jsonb_array_elements(fact.value -> 'source_urls') WITH ORDINALITY AS source_url(value, ordinality)
                WHERE source_url.value #>> '{}' NOT LIKE 'https://hub.docker.com/r/https://%'
              ),
              false
            )
            ELSE fact.value
          END
        )
        FROM jsonb_each(COALESCE(app.technical_fact_status, '{}'::jsonb)) AS fact
      ),
      '{}'::jsonb
    ) AS technical_fact_status
  FROM public.self_host_apps AS app
  WHERE EXISTS (
    SELECT 1
    FROM unnest(COALESCE(app.data_source_urls, '{}'::text[])) AS source_url(url)
    WHERE source_url.url LIKE 'https://hub.docker.com/r/https://%'
  )
    OR app.technical_fact_status::text LIKE '%https://hub.docker.com/r/https://%'
)
UPDATE public.self_host_apps AS app
SET
  data_source_urls = cleaned.data_source_urls,
  technical_fact_status = cleaned.technical_fact_status
FROM cleaned
WHERE app.id = cleaned.id;
