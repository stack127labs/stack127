-- Correct source links and licenses after direct upstream review.
DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v2.0 or later',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-2.0-or-later',
    source_code_url = 'https://github.com/amule-org/amule',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/amule-org/amule', 'https://github.com/amule-org/amule/blob/master/LICENSE.md', 'https://github.com/ngosang/docker-amule']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/amule-org/amule"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/amule-org/amule/blob/master/LICENSE.md"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '4fb97273-441e-4324-ba6a-3c52fc2f986d'::uuid AND a.slug = 'amule' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for amule'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v3.0',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-3.0',
    source_code_url = 'https://github.com/mrusse/soularr',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://soularr.net/', 'https://github.com/mrusse/soularr', 'https://github.com/mrusse/soularr/blob/main/LICENSE', 'https://github.com/JPDVM2014/soularr']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/mrusse/soularr"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/mrusse/soularr/blob/main/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '90c1fab3-7794-4dba-81c5-71bef0e0b8cb'::uuid AND a.slug = 'soularr' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for soularr'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v2.0',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-2.0',
    source_code_url = 'https://github.com/HandBrake/HandBrake',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://handbrake.fr/', 'https://github.com/HandBrake/HandBrake', 'https://github.com/HandBrake/HandBrake/blob/master/LICENSE', 'https://hub.docker.com/r/zocker160/handbrake-nvenc', 'https://github.com/junkerderprovinz/handbrake']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/HandBrake/HandBrake"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/HandBrake/HandBrake/blob/master/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '5c7b6e97-d3a3-4804-8bca-784cc716f07f'::uuid AND a.slug = 'handbrake-for-nvidia' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for handbrake-for-nvidia'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v3.0',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-3.0',
    source_code_url = 'https://github.com/PaperMC/Velocity',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/PaperMC/Velocity', 'https://docs.papermc.io/velocity/', 'https://registry.hub.docker.com/r/itzg/mc-proxy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/PaperMC/Velocity"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/PaperMC/Velocity"]'::jsonb)),
    updated_at = now()
  WHERE a.id = 'c8341fe5-998f-4eb3-971c-42e99768c492'::uuid AND a.slug = 'velocity' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for velocity'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'Apache License 2.0',
    license_type = 'permissive',
    license_spdx_id = 'Apache-2.0',
    source_code_url = 'https://github.com/apache/httpd',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://httpd.apache.org/docs/2.4/mod/mod_dav.html', 'https://github.com/apache/httpd', 'https://github.com/mgutt/docker-apachewebdav']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/apache/httpd"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/apache/httpd"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '73912405-9f27-4961-bf03-4fe547a3f1cf'::uuid AND a.slug = 'apache-webdav' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for apache-webdav'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v3.0',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-3.0',
    source_code_url = 'https://github.com/damoeb/rss-proxy',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/damoeb/rss-proxy', 'https://rssproxy.migor.org/', 'https://hub.docker.com/r/damoeb/rss-proxy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/damoeb/rss-proxy"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/damoeb/rss-proxy"]'::jsonb)),
    updated_at = now()
  WHERE a.id = 'b391289b-e9c5-434a-b5f4-8df180b5fcde'::uuid AND a.slug = 'rss-proxy' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for rss-proxy'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU Affero General Public License v3.0',
    license_type = 'copyleft',
    license_spdx_id = 'AGPL-3.0',
    source_code_url = 'https://inf-it.com/open-source/download/InfCloud_0.13.1.zip',
    source_code_host = 'other',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://inf-it.com/open-source/clients/infcloud/', 'https://inf-it.com/open-source/download/InfCloud_0.13.1.zip', 'https://github.com/ckulka/infcloud-docker', 'https://hub.docker.com/r/ckulka/infcloud']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://inf-it.com/open-source/download/InfCloud_0.13.1.zip"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://inf-it.com/open-source/download/InfCloud_0.13.1.zip"]'::jsonb)),
    updated_at = now()
  WHERE a.id = 'd7ddb80f-9cf3-46a5-bb68-f31139b1cc12'::uuid AND a.slug = 'infcloud' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for infcloud'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v3.0',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-3.0',
    source_code_url = 'https://github.com/Skyfay/DBackup',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Skyfay/DBackup', 'https://github.com/Skyfay/DBackup/blob/main/LICENSE', 'https://dbackup.app/', 'https://hub.docker.com/r/skyfay/dbackup']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/Skyfay/DBackup"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/Skyfay/DBackup/blob/main/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = 'f392fa54-cb4a-4f08-8005-8cbd1b787dc8'::uuid AND a.slug = 'dbackup' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for dbackup'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'GNU General Public License v3.0 or later',
    license_type = 'copyleft',
    license_spdx_id = 'GPL-3.0-or-later',
    source_code_url = 'https://github.com/xbgmsharp/ipxe-buildweb',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/xbgmsharp/ipxe-buildweb', 'https://github.com/xbgmsharp/ipxe-buildweb/blob/master/LICENSE', 'https://github.com/xbgmsharp/ipxe-buildweb/blob/master/README.md', 'https://github.com/ipxe/ipxe/blob/master/COPYING']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/xbgmsharp/ipxe-buildweb"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/xbgmsharp/ipxe-buildweb/blob/master/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '72727d1e-f07d-4f79-b374-43f1bb800826'::uuid AND a.slug = 'ipxe-buildweb' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for ipxe-buildweb'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'BSD 2-Clause License',
    license_type = 'permissive',
    license_spdx_id = 'BSD-2-Clause',
    source_code_url = 'https://github.com/playit-cloud/playit-agent',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://playit.gg/', 'https://playit.gg/download', 'https://playit.gg/docs', 'https://github.com/playit-cloud/playit-agent', 'https://github.com/playit-cloud/playit-agent/blob/master/LICENSE.txt', 'https://hub.docker.com/r/pepaondrugs/playitgg-docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/playit-cloud/playit-agent"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/playit-cloud/playit-agent/blob/master/LICENSE.txt"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '8a9bf9ec-9ca5-4972-ad95-4b11f2f025cc'::uuid AND a.slug = 'playitgg' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for playitgg'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'MIT License',
    license_type = 'permissive',
    license_spdx_id = 'MIT',
    source_code_url = 'https://github.com/productiveops/dokemon',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://dokemon.dev/', 'https://github.com/productiveops/dokemon', 'https://github.com/productiveops/dokemon/blob/main/LICENSE', 'https://hub.docker.com/r/productiveops/dokemon-agent']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/productiveops/dokemon"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/productiveops/dokemon/blob/main/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '85977afc-d506-4f12-81b2-e9038a8957fb'::uuid AND a.slug = 'dokemon-agent' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for dokemon-agent'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'MIT License',
    license_type = 'permissive',
    license_spdx_id = 'MIT',
    source_code_url = 'https://github.com/udo-munk/z80pack',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/udo-munk/z80pack', 'https://github.com/udo-munk/z80pack/blob/master/LICENSE', 'https://www.icl1900.co.uk/unix4fun/z80pack/', 'https://github.com/dlandon/z80pack']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/udo-munk/z80pack"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/udo-munk/z80pack/blob/master/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '4a057af8-0031-4e75-b114-5a010519afe3'::uuid AND a.slug = 'z80pack' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for z80pack'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'Apache License 2.0',
    license_type = 'permissive',
    license_spdx_id = 'Apache-2.0',
    source_code_url = 'https://github.com/x86pup/conduwuit',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/x86pup/conduwuit', 'https://github.com/x86pup/conduwuit/blob/main/LICENSE', 'https://github.com/matrix-construct/tuwunel', 'https://github.com/matrix-construct/tuwunel/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/x86pup/conduwuit"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/x86pup/conduwuit/blob/main/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = 'e43f82ad-6d7b-4a51-921e-76c1542ed1d5'::uuid AND a.slug = 'conduwuit' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for conduwuit'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'MIT License',
    license_type = 'permissive',
    license_spdx_id = 'MIT',
    source_code_url = 'https://github.com/DeanWard/CaddyGen',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/wardy784/caddygen', 'https://github.com/DeanWard/CaddyGen', 'https://hub.docker.com/r/wardy784/caddygen', 'https://caddygen.site/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/DeanWard/CaddyGen"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/DeanWard/CaddyGen"]'::jsonb)),
    updated_at = now()
  WHERE a.id = '4b9f249a-1931-4ebd-97da-21d1a213ed3e'::uuid AND a.slug = 'caddygen' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM NULL AND a.license_type IS NOT DISTINCT FROM 'unknown' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for caddygen'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    source_model = 'open_source',
    license = 'Apache License 2.0',
    license_type = 'permissive',
    license_spdx_id = 'Apache-2.0',
    source_code_url = 'https://github.com/localstack/localstack',
    source_code_host = 'github',
    source_checked_at = now(),
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/localstack/localstack', 'https://github.com/localstack/localstack/blob/main/LICENSE', 'https://github.com/localstack/localstack/blob/main/docs/end_user_license_agreement/README.md', 'https://blog.localstack.cloud/the-road-ahead-for-localstack/', 'https://docs.localstack.cloud/aws/licensing/', 'https://www.localstack.cloud/legal/terms-of-service']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('source', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/localstack/localstack"]'::jsonb),'license', jsonb_build_object('status','published','checked_at',CURRENT_DATE,'confidence','high','source_urls','["https://github.com/localstack/localstack/blob/main/LICENSE"]'::jsonb)),
    updated_at = now()
  WHERE a.id = 'b3c4784b-68d1-44ba-bba4-77766697b889'::uuid AND a.slug = 'localstack' AND a.source_model IS NOT DISTINCT FROM 'closed_source' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.license IS NOT DISTINCT FROM 'LocalStack Terms of Service (current distribution)' AND a.license_type IS NOT DISTINCT FROM 'custom' AND a.license_spdx_id IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Source review guard failed for localstack'; END IF;
END $$;

