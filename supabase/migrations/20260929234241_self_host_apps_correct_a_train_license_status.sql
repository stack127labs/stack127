-- A-Train's related Autoscan README claims a permissive license, but no exact
-- license terms are published in the A-Train repository or manifest.
BEGIN;

DO $guarded_review$
DECLARE
  updated_rows integer;
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown',
      license_type = 'unknown',
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) ||
        jsonb_build_object('license', jsonb_build_object(
          'status', 'not_published',
          'checked_at', CURRENT_DATE,
          'confidence', 'medium',
          'note', 'The A-Train repository and manifest publish no license terms. An associated project claims a permissive license but does not identify its terms, so the source model and exact license remain unverified.',
          'source_urls', jsonb_build_array(
            'https://github.com/m-rots/a-train',
            'https://github.com/m-rots/a-train/blob/main/README.md',
            'https://github.com/m-rots/a-train/blob/main/Cargo.toml',
            'https://github.com/Cloudbox/autoscan#readme'
          )
        )),
      data_source_urls = ARRAY(
        SELECT DISTINCT u.url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/m-rots/a-train',
          'https://github.com/m-rots/a-train/blob/main/README.md',
          'https://github.com/m-rots/a-train/blob/main/Cargo.toml',
          'https://github.com/Cloudbox/autoscan#readme'
        ]::text[]) AS u(url)
        WHERE u.url IS NOT NULL
        ORDER BY u.url
      ),
      updated_at = now()
  WHERE a.id = '53a5a3f2-dd9b-473b-8bc8-17631ae19e05'::uuid
    AND a.slug = 'a-train'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.source_model = 'open_source'
    AND a.license IS NULL
    AND a.license_type = 'permissive'
    AND a.license_spdx_id IS NULL
    AND a.source_code_url = 'https://github.com/m-rots/a-train'
    AND a.technical_fact_status->'license'->>'status' = 'published';

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows <> 1 THEN
    RAISE EXCEPTION 'A-Train source/license guard failed: expected one unchanged reviewed row, updated %', updated_rows;
  END IF;
END;
$guarded_review$;

COMMIT;
