-- Fill estimates for apps added or completed after the first resource pass.
-- Existing publisher-stated values are not replaced.
WITH app_categories AS (
  SELECT
    link.app_id,
    array_agg(DISTINCT category.slug ORDER BY category.slug) AS categories
  FROM public.self_host_app_category_links AS link
  JOIN public.self_host_app_categories AS category ON category.id = link.category_id
  GROUP BY link.app_id
), app_sources AS (
  SELECT
    app.id AS app_id,
    COALESCE(
      NULLIF(source.urls, '{}'::text[]),
      app.data_source_urls[1:1],
      '{}'::text[]
    ) AS urls
  FROM public.self_host_apps AS app
  LEFT JOIN LATERAL (
    SELECT array_agg(DISTINCT url ORDER BY url) AS urls
    FROM unnest(array_remove(ARRAY[
      app.website_url,
      app.source_code_url,
      app.docs_url,
      app.install_docs_url,
      app.docker_url
    ]::text[], NULL::text)) AS links(url)
  ) AS source ON true
), apps AS (
  SELECT
    app.id,
    app.name,
    app.summary,
    app.storage_profile,
    COALESCE(categories.categories, '{}'::text[]) AS categories,
    COALESCE(sources.urls, '{}'::text[]) AS source_urls,
    app.ram_min_mb IS NULL AND app.ram_recommended_mb IS NULL AS needs_ram_estimate,
    app.storage_min_gb IS NULL AS needs_storage_estimate
  FROM public.self_host_apps AS app
  LEFT JOIN app_categories AS categories ON categories.app_id = app.id
  LEFT JOIN app_sources AS sources ON sources.app_id = app.id
  LEFT JOIN public.self_host_app_resource_estimates AS resource ON resource.app_id = app.id
  WHERE app.published = true
    AND app.self_hosting_status = 'self_hostable'
    AND (
      (app.ram_min_mb IS NULL AND app.ram_recommended_mb IS NULL AND resource.ram_estimate_min_mb IS NULL)
      OR (app.storage_min_gb IS NULL AND resource.storage_estimate_min_gb IS NULL)
    )
), planned AS (
  SELECT
    apps.*,
    CASE
      WHEN 'ai-ml' = ANY(categories)
        AND (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' THEN 8192
      WHEN categories && ARRAY['databases', 'search']::text[] THEN 2048
      WHEN 'ai-ml' = ANY(categories) THEN 1024
      WHEN categories && ARRAY['media-servers', 'video-conferencing']::text[] THEN 2048
      WHEN categories && ARRAY['monitoring-status', 'system-admin-hosting', 'networking-dns', 'identity-access']::text[] THEN 1024
      WHEN 'games' = ANY(categories) THEN 1024
      ELSE 512
    END AS ram_min_estimate_mb,
    CASE
      WHEN 'ai-ml' = ANY(categories)
        AND (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' THEN 32768
      WHEN categories && ARRAY['databases', 'search']::text[] THEN 8192
      WHEN 'ai-ml' = ANY(categories) THEN 8192
      WHEN categories && ARRAY['media-servers', 'video-conferencing', 'games']::text[] THEN 8192
      WHEN categories && ARRAY['monitoring-status', 'system-admin-hosting', 'networking-dns', 'identity-access']::text[] THEN 4096
      ELSE 4096
    END AS ram_max_estimate_mb,
    CASE storage_profile
      WHEN 'tiny' THEN 0.5
      WHEN 'low' THEN 1
      WHEN 'medium' THEN 10
      WHEN 'high' THEN 100
      WHEN 'depends' THEN 10
      WHEN 'unknown' THEN CASE
        WHEN 'ai-ml' = ANY(categories)
          AND (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' THEN 20
        WHEN categories && ARRAY['photos-galleries', 'file-sharing-sync', 'storage-backup', 'media-servers', 'music-audio', 'ebooks-libraries']::text[] THEN 50
        WHEN categories && ARRAY['databases', 'search', 'monitoring-status', 'games', 'video-conferencing']::text[] THEN 10
        ELSE 1
      END
      ELSE 1
    END AS storage_min_estimate_gb,
    CASE storage_profile
      WHEN 'tiny' THEN 2
      WHEN 'low' THEN 10
      WHEN 'medium' THEN 100
      WHEN 'high' THEN 1000
      WHEN 'depends' THEN 500
      WHEN 'unknown' THEN CASE
        WHEN 'ai-ml' = ANY(categories)
          AND (name || ' ' || summary) ~* '(local model|model inference|llm|language model|stable diffusion|image generation|embedding model|ollama|text generation)' THEN 100
        WHEN categories && ARRAY['photos-galleries', 'file-sharing-sync', 'storage-backup', 'media-servers', 'music-audio', 'ebooks-libraries']::text[] THEN 500
        WHEN categories && ARRAY['databases', 'search', 'monitoring-status', 'games', 'video-conferencing']::text[] THEN 100
        ELSE 20
      END
      ELSE 20
    END AS storage_max_estimate_gb
  FROM apps
)
INSERT INTO public.self_host_app_resource_estimates (
  app_id,
  ram_estimate_min_mb,
  ram_estimate_max_mb,
  ram_estimate_kind,
  ram_estimate_confidence,
  ram_estimate_basis,
  ram_source_urls,
  storage_estimate_min_gb,
  storage_estimate_max_gb,
  storage_estimate_kind,
  storage_estimate_confidence,
  storage_estimate_basis,
  storage_source_urls,
  checked_at
)
SELECT
  planned.id,
  CASE WHEN planned.needs_ram_estimate THEN planned.ram_min_estimate_mb END,
  CASE WHEN planned.needs_ram_estimate THEN planned.ram_max_estimate_mb END,
  CASE WHEN planned.needs_ram_estimate THEN 'estimated' END,
  CASE WHEN planned.needs_ram_estimate THEN 'low' END,
  CASE WHEN planned.needs_ram_estimate THEN 'Estimated for one small self-hosted setup based on the app purpose.' END,
  CASE WHEN planned.needs_ram_estimate THEN planned.source_urls ELSE '{}'::text[] END,
  CASE WHEN planned.needs_storage_estimate THEN planned.storage_min_estimate_gb END,
  CASE WHEN planned.needs_storage_estimate THEN planned.storage_max_estimate_gb END,
  CASE WHEN planned.needs_storage_estimate THEN 'estimated' END,
  CASE WHEN planned.needs_storage_estimate THEN 'low' END,
  CASE WHEN planned.needs_storage_estimate THEN 'Estimated for one small self-hosted setup; stored user data can grow beyond this range.' END,
  CASE WHEN planned.needs_storage_estimate THEN planned.source_urls ELSE '{}'::text[] END,
  now()
FROM planned
WHERE planned.needs_ram_estimate OR planned.needs_storage_estimate
ON CONFLICT (app_id) DO UPDATE SET
  ram_estimate_min_mb = COALESCE(self_host_app_resource_estimates.ram_estimate_min_mb, excluded.ram_estimate_min_mb),
  ram_estimate_max_mb = COALESCE(self_host_app_resource_estimates.ram_estimate_max_mb, excluded.ram_estimate_max_mb),
  ram_estimate_kind = COALESCE(self_host_app_resource_estimates.ram_estimate_kind, excluded.ram_estimate_kind),
  ram_estimate_confidence = COALESCE(self_host_app_resource_estimates.ram_estimate_confidence, excluded.ram_estimate_confidence),
  ram_estimate_basis = COALESCE(self_host_app_resource_estimates.ram_estimate_basis, excluded.ram_estimate_basis),
  ram_source_urls = CASE
    WHEN cardinality(COALESCE(self_host_app_resource_estimates.ram_source_urls, '{}'::text[])) > 0
      THEN self_host_app_resource_estimates.ram_source_urls
    ELSE excluded.ram_source_urls
  END,
  storage_estimate_min_gb = COALESCE(self_host_app_resource_estimates.storage_estimate_min_gb, excluded.storage_estimate_min_gb),
  storage_estimate_max_gb = COALESCE(self_host_app_resource_estimates.storage_estimate_max_gb, excluded.storage_estimate_max_gb),
  storage_estimate_kind = COALESCE(self_host_app_resource_estimates.storage_estimate_kind, excluded.storage_estimate_kind),
  storage_estimate_confidence = COALESCE(self_host_app_resource_estimates.storage_estimate_confidence, excluded.storage_estimate_confidence),
  storage_estimate_basis = COALESCE(self_host_app_resource_estimates.storage_estimate_basis, excluded.storage_estimate_basis),
  storage_source_urls = CASE
    WHEN cardinality(COALESCE(self_host_app_resource_estimates.storage_source_urls, '{}'::text[])) > 0
      THEN self_host_app_resource_estimates.storage_source_urls
    ELSE excluded.storage_source_urls
  END,
  checked_at = now(),
  updated_at = now();
