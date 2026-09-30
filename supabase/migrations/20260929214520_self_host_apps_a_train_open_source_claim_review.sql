-- The project publisher explicitly describes A-Train as open source and permissively licensed.
-- Keep the exact license name and SPDX identifier blank because the upstream does not name them.
BEGIN;

DO $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license_type = 'permissive',
      data_source_urls = ARRAY(
        SELECT DISTINCT source_url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://github.com/Cloudbox/autoscan#readme',
          'https://github.com/m-rots/a-train',
          'https://github.com/m-rots/a-train/blob/main/Cargo.toml'
        ]::text[]) AS s(source_url)
        WHERE source_url IS NOT NULL
        ORDER BY source_url
      ),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) ||
        jsonb_build_object('license', jsonb_build_object(
          'status', 'published',
          'checked_at', DATE '2026-09-30',
          'confidence', 'medium',
          'note', 'The upstream Autoscan README says A-Train has a permissible open-source license and invites forks. The A-Train repository does not identify the exact license or SPDX identifier, so those exact fields remain unknown.',
          'source_urls', jsonb_build_array(
            'https://github.com/Cloudbox/autoscan#readme',
            'https://github.com/m-rots/a-train',
            'https://github.com/m-rots/a-train/blob/main/Cargo.toml'
          )
        )),
      updated_at = now()
  WHERE a.id = '53a5a3f2-dd9b-473b-8bc8-17631ae19e05'::uuid
    AND a.slug = 'a-train'
    AND a.published IS TRUE
    AND a.self_hosting_status = 'self_hostable'
    AND a.source_code_url = 'https://github.com/m-rots/a-train'
    AND a.source_model = 'unknown'
    AND a.license IS NULL
    AND a.license_type = 'unknown'
    AND a.license_spdx_id IS NULL
    AND a.technical_fact_status->'license'->>'status' = 'unchecked'
    AND a.data_source_urls @> ARRAY['https://github.com/Cloudbox/autoscan']::text[]
    AND EXISTS (
      SELECT 1
      FROM public.github_projects AS g
      WHERE g.id = a.github_project_id
        AND g.full_name = 'm-rots/a-train'
        AND g.license_spdx_id IS NULL
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'A-Train license evidence guard failed: expected exactly one reviewed live row, updated %', v_updated;
  END IF;
END;
$$;

COMMIT;
