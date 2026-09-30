-- Public source code without a verified license does not establish either source model.
DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) ||
        jsonb_build_object('source', jsonb_build_object(
          'status', 'published',
          'checked_at', CURRENT_DATE,
          'confidence', 'high',
          'note', 'The public source repository has no verified license declaration, so its legal source model remains unknown.',
          'source_urls', jsonb_build_array(a.source_code_url)
        )),
      updated_at = now()
  WHERE a.id = '97d977a5-e0a1-4c64-a6e6-94788ec94025'::uuid
    AND a.slug = '45d-drive-map'
    AND a.source_model = 'source_available'
    AND a.source_code_url = 'https://github.com/unraid/45d-drivemap'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for 45d-drive-map'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = 'cdc947d5-8c14-4d1c-880b-fad306290421'::uuid AND a.slug = 'a-eye'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/SpaceinvaderOne/a-eye'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for a-eye'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = 'ed7a28ae-7ce2-47ac-acf7-b1232b60f9a8'::uuid AND a.slug = 'adguardhome-unbound-redis'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/imTHAI/adguardhome-unbound-redis'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for adguardhome-unbound-redis'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = '09924f83-eec8-4543-b146-d53e4e2edd4c'::uuid AND a.slug = 'namecheap-ddns-updater'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/tranceer/nraid-namecheap-ddns-updater'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for namecheap-ddns-updater'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = '8e9087ad-af2a-4953-8ca3-5a2c7dcc27b5'::uuid AND a.slug = 'oak'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/bert-mccutchen/oak'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for oak'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = '9beb0f49-33f8-4b51-8325-267427509e30'::uuid AND a.slug = 'qbithelparr'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/Entree3k/qbithelparr'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for qbithelparr'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = 'c266fca5-eb5c-42ef-bd22-024d454af626'::uuid AND a.slug = 'qbittorrent-auto-port-forward'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/claabs/qbittorrent-port-forward-file'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for qbittorrent-auto-port-forward'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = '3ba6591e-e703-4824-aa71-d8671915ae6b'::uuid AND a.slug = 'qbittorrent-exporter'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/caseyscarborough/qbittorrent-exporter'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for qbittorrent-exporter'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown', source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','The public source repository has no verified license declaration, so its legal source model remains unknown.','source_urls',jsonb_build_array(a.source_code_url))),
      updated_at = now()
  WHERE a.id = '9ba0f9ae-75b6-499f-b311-3273f25cee62'::uuid AND a.slug = 's3sync'
    AND a.source_model = 'source_available' AND a.source_code_url = 'https://github.com/what-name/docker-s3sync'
    AND a.license IS NULL AND a.license_type = 'unknown' AND a.license_spdx_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model correction guard failed for s3sync'; END IF;
END $$;
