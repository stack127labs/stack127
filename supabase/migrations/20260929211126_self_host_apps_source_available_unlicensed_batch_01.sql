DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/unraid/45d-drivemap'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/unraid/45d-drivemap', 'https://github.com/unraid/45d-drivemap/blob/main/README.md']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = '97d977a5-e0a1-4c64-a6e6-94788ec94025'::uuid AND a.slug = '45d-drive-map' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/unraid/45d-drivemap' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for 45d-drive-map'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/SpaceinvaderOne/a-eye'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/SpaceinvaderOne/a-eye', 'https://hub.docker.com/r/spaceinvaderone/a-eye']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = 'cdc947d5-8c14-4d1c-880b-fad306290421'::uuid AND a.slug = 'a-eye' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/SpaceinvaderOne/a-eye' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for a-eye'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/imTHAI/adguardhome-unbound-redis'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/imTHAI/adguardhome-unbound-redis', 'https://hub.docker.com/r/imthai/adguardhome-unbound-redis']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = 'ed7a28ae-7ce2-47ac-acf7-b1232b60f9a8'::uuid AND a.slug = 'adguardhome-unbound-redis' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/imTHAI/adguardhome-unbound-redis' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for adguardhome-unbound-redis'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/tranceer/nraid-namecheap-ddns-updater'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/tranceer/nraid-namecheap-ddns-updater', 'https://github.com/tranceer/nraid-namecheap-ddns-updater#readme', 'https://hub.docker.com/r/tranceer/namecheap-ddns-updater']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
      license = NULL
  WHERE a.id = '09924f83-eec8-4543-b146-d53e4e2edd4c'::uuid AND a.slug = 'namecheap-ddns-updater' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/tranceer/nraid-namecheap-ddns-updater' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for namecheap-ddns-updater'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/bert-mccutchen/oak'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/bert-mccutchen/oak', 'https://github.com/bert-mccutchen/oak/blob/main/README.md']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = '8e9087ad-af2a-4953-8ca3-5a2c7dcc27b5'::uuid AND a.slug = 'oak' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bert-mccutchen/oak' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for oak'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/Entree3k/qbithelparr'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Entree3k/qbithelparr', 'https://hub.docker.com/r/entree3000/qbithelparr', 'https://ca.unraid.net/apps/qbithelparr-15mrs5f0hcwhlb']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = '9beb0f49-33f8-4b51-8325-267427509e30'::uuid AND a.slug = 'qbithelparr' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/Entree3k/qbithelparr' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for qbithelparr'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/claabs/qbittorrent-port-forward-file'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/claabs/qbittorrent-port-forward-file', 'https://github.com/claabs/qbittorrent-port-forward-file#docker-compose', 'https://github.com/claabs/qbittorrent-port-forward-file/pkgs/container/qbittorrent-port-forward-file']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = 'c266fca5-eb5c-42ef-bd22-024d454af626'::uuid AND a.slug = 'qbittorrent-auto-port-forward' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/claabs/qbittorrent-port-forward-file' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for qbittorrent-auto-port-forward'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/caseyscarborough/qbittorrent-exporter'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/caseyscarborough/qbittorrent-exporter', 'https://hub.docker.com/r/caseyscarborough/qbittorrent-exporter']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = '3ba6591e-e703-4824-aa71-d8671915ae6b'::uuid AND a.slug = 'qbittorrent-exporter' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/caseyscarborough/qbittorrent-exporter' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for qbittorrent-exporter'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available',
      source_code_host = 'github',
      source_checked_at = now(),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','note','Public upstream source is visible, but no license granting redistribution or modification rights was found.','source_urls',jsonb_build_array('https://github.com/what-name/docker-s3sync'))),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/what-name/docker-s3sync', 'https://hub.docker.com/repository/docker/whatname/docker-s3sync']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u)
  WHERE a.id = '9ba0f9ae-75b6-499f-b311-3273f25cee62'::uuid AND a.slug = 's3sync' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'unknown' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/what-name/docker-s3sync' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source-model review guard failed for s3sync'; END IF;
END $$;
