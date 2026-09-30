-- Correct six G-L source models against each project's official source and license.
BEGIN;

DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license = 'Apache License 2.0',
      license_type = 'permissive',
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://github.com/goss-org/goss',
      source_code_host = 'github',
      source_checked_at = now(),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/goss-org/goss', 'https://goss.rocks/']::text[]) AS sources(u) WHERE u IS NOT NULL ORDER BY u),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://github.com/goss-org/goss')),
        'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://github.com/goss-org/goss'))
      ),
      updated_at = now()
  WHERE a.id = '936d89cc-c6ce-427a-9c7f-e74ec5f24b95'::uuid AND a.slug = 'goss' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.source_code_host IS NOT DISTINCT FROM 'unknown' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for goss'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license = 'GNU General Public License v3.0 or later',
      license_type = 'copyleft',
      license_spdx_id = 'GPL-3.0-or-later',
      source_code_url = 'https://github.com/gpodder/gpodder',
      source_code_host = 'github',
      source_checked_at = now(),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://gpodder.github.io/', 'https://github.com/gpodder/gpodder']::text[]) AS sources(u) WHERE u IS NOT NULL ORDER BY u),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://gpodder.github.io/', 'https://github.com/gpodder/gpodder')),
        'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://github.com/gpodder/gpodder'))
      ),
      updated_at = now()
  WHERE a.id = '2ff623dc-9b83-41b3-b116-34ef7c71f6bd'::uuid AND a.slug = 'gpodder' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.source_code_host IS NOT DISTINCT FROM 'unknown' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for gpodder'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft',
      license_spdx_id = 'GPL-3.0',
      source_code_url = 'https://github.com/algoo/grammalecte',
      source_code_host = 'github',
      source_checked_at = now(),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.grammalecte.net/', 'https://github.com/algoo/grammalecte']::text[]) AS sources(u) WHERE u IS NOT NULL ORDER BY u),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://www.grammalecte.net/', 'https://github.com/algoo/grammalecte')),
        'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://github.com/algoo/grammalecte'))
      ),
      updated_at = now()
  WHERE a.id = 'bdb36e98-6297-48f4-bb32-4e5c69d5ef77'::uuid AND a.slug = 'grammalecte' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.source_code_host IS NOT DISTINCT FROM 'unknown' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for grammalecte'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license = 'GNU General Public License v2.0',
      license_type = 'copyleft',
      license_spdx_id = 'GPL-2.0-only',
      source_code_url = 'https://gitlab.xiph.org/xiph/icecast-server',
      source_code_host = 'gitlab',
      source_checked_at = now(),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://icecast.org/', 'https://icecast.org/download/', 'https://gitlab.xiph.org/xiph/icecast-server']::text[]) AS sources(u) WHERE u IS NOT NULL ORDER BY u),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://icecast.org/download/', 'https://gitlab.xiph.org/xiph/icecast-server')),
        'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://icecast.org/'))
      ),
      updated_at = now()
  WHERE a.id = 'ef220d4a-d8ed-4dc6-ab5b-fd8f3f8682f9'::uuid AND a.slug = 'icecast2' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.source_code_host IS NOT DISTINCT FROM 'unknown' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for icecast2'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license = 'GNU General Public License v3.0 or later',
      license_type = 'copyleft',
      license_spdx_id = 'GPL-3.0-or-later',
      source_code_url = 'https://github.com/xroche/httrack',
      source_code_host = 'github',
      source_checked_at = now(),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.httrack.com/', 'https://www.httrack.com/page/5/en/index.html', 'https://github.com/xroche/httrack']::text[]) AS sources(u) WHERE u IS NOT NULL ORDER BY u),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://www.httrack.com/', 'https://github.com/xroche/httrack')),
        'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://www.httrack.com/page/5/en/index.html', 'https://github.com/xroche/httrack'))
      ),
      updated_at = now()
  WHERE a.id = '18bd7757-c930-4012-854f-1dd0dcd98fb5'::uuid AND a.slug = 'httrack' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.source_code_host IS NOT DISTINCT FROM 'unknown' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for httrack'; END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source',
      license = 'GNU Affero General Public License v3.0 or later',
      license_type = 'copyleft',
      license_spdx_id = 'AGPL-3.0-or-later',
      source_code_url = 'https://github.com/Ahwxorg/LibreY',
      source_code_host = 'github',
      source_checked_at = now(),
      data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://librey.org/', 'https://github.com/Ahwxorg/LibreY', 'https://github.com/Ahwxorg/LibreY/blob/main/LICENSE']::text[]) AS sources(u) WHERE u IS NOT NULL ORDER BY u),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://librey.org/', 'https://github.com/Ahwxorg/LibreY')),
        'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls',jsonb_build_array('https://github.com/Ahwxorg/LibreY/blob/main/LICENSE'))
      ),
      updated_at = now()
  WHERE a.id = '6fd7fbe9-a429-4c53-938d-81d5292490dd'::uuid AND a.slug = 'librey' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.source_code_host IS NOT DISTINCT FROM 'unknown' AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for librey'; END IF;
END $$;

COMMIT;
