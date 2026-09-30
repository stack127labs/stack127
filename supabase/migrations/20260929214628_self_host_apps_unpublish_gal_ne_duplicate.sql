-- Gal Ne and Galene point to the same publisher, website, and canonical repository.
BEGIN;

DO $$
DECLARE
  v_updated integer;
BEGIN
  UPDATE public.self_host_apps AS duplicate
  SET published = false,
      updated_at = now()
  WHERE duplicate.id = 'eceedd88-6414-4259-bd5c-49340e3ad047'::uuid
    AND duplicate.slug = 'gal-ne'
    AND duplicate.published IS TRUE
    AND duplicate.self_hosting_status = 'self_hostable'
    AND duplicate.source_code_url = 'https://github.com/jech/galene'
    AND duplicate.website_url = 'https://galene.org'
    AND EXISTS (
      SELECT 1
      FROM public.self_host_apps AS canonical
      WHERE canonical.id = 'b5943e99-f0a4-4e09-807c-09038ead27d9'::uuid
        AND canonical.slug = 'galene'
        AND canonical.published IS TRUE
        AND canonical.source_code_url = duplicate.source_code_url
        AND canonical.website_url = duplicate.website_url
    );

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated <> 1 THEN
    RAISE EXCEPTION 'Gal Ne duplicate guard failed: expected one duplicate row, updated %', v_updated;
  END IF;
END;
$$;

COMMIT;
