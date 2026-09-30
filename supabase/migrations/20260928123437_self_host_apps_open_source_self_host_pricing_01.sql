-- A verified open-source license makes the self-hosted version free to run.
WITH candidates AS (
  SELECT app.id
  FROM public.self_host_apps AS app
  WHERE app.published = true
    AND app.self_hosting_status = 'self_hostable'
    AND app.source_model = 'open_source'
    AND app.pricing_model = 'unknown'
    AND app.license IS NOT NULL
    AND lower(btrim(app.license)) <> 'unknown'
)
UPDATE public.self_host_apps AS app
SET
  pricing_model = 'free',
  data_source_urls = COALESCE((
    SELECT array_agg(DISTINCT source_url ORDER BY source_url)
    FROM unnest(
      COALESCE(app.data_source_urls, '{}'::text[])
        || array_remove(ARRAY[app.source_code_url, app.website_url], NULL)::text[]
    ) AS source_url
  ), '{}'::text[]),
  data_checked_at = now(),
  data_confidence = 'high',
  updated_at = now()
FROM candidates
WHERE app.id = candidates.id;
