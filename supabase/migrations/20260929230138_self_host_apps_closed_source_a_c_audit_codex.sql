BEGIN;

-- Guarded A-C source-model and summary corrections. Draft only; not applied to production.
DO $$
DECLARE
  changed integer;
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      license = NULL,
      license_type = 'unknown'::public.self_host_app_license_type,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'b959289e-f9c9-44d8-9714-6fb7c0bbe342'::uuid
    AND a.slug = 'adsb-fr24feed'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM 'Proprietary vendor-distributed software'
    AND a.license_type IS NOT DISTINCT FROM 'custom'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Feeder client that sends ADS-B receiver data to Flightradar24.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.flightradar24.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'adsb-fr24feed', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v2.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-2.0-or-later',
      source_code_url = 'https://github.com/airnavsystems/rbfeeder',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/airnavsystems/rbfeeder', 'https://github.com/airnavsystems/rbfeeder/blob/master/rbfeeder.c']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'edd7355a-4fa7-423e-83f3-23970e41d7d3'::uuid
    AND a.slug = 'adsb-radarbox'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM 'The rbfeeder program bundled by the current community container is closed-source and supplied by AirNav. The container wrapper is public source, but no license is declared in that repository.'
    AND a.license_type IS NOT DISTINCT FROM 'custom'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Forwards ADS-B receiver data to the AirNav Radar flight tracking network.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.airnavradar.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'adsb-radarbox', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0-or-later',
      source_code_url = 'https://github.com/wizier/airvault',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/wizier/airvault', 'https://github.com/wizier/airvault/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'c2422881-2649-40d1-8438-571645582674'::uuid
    AND a.slug = 'airvault'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'iPhone backup service that stores incremental backups on an Unraid share.'
    AND a.website_url IS NOT DISTINCT FROM 'https://airvault.cloud/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'airvault', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET license = 'MinIO AIStor Free Agreement',
      license_type = 'custom'::public.self_host_app_license_type,
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.min.io/blog/aistor-overview', 'https://www.min.io/legal/aistor-free-agreement']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '248898ab-a38f-47f3-a1ce-8cb9da4a03d9'::uuid
    AND a.slug = 'aistor'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Object storage system for AI data, model training, inference, and agent memory.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.min.io/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'aistor', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '01c0755b-1348-472f-8362-55e04766908c'::uuid
    AND a.slug = 'all-the-mods-9-mohistmc'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Minecraft modpack server bundle with hundreds of mods, quests, and progression.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-9';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'all-the-mods-9-mohistmc', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '1489e770-28c2-4306-a4a7-e71969233d8f'::uuid
    AND a.slug = 'all-the-mods-9-to-the-sky'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Skyblock Minecraft modpack server bundle with technology, magic, and quests.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-9-to-the-sky';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'all-the-mods-9-to-the-sky', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '10210395-6f15-4cab-ba5c-c1ae129b0b88'::uuid
    AND a.slug = 'allthemods10'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Modded Java Minecraft server for the All the Mods 10 modpack.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'allthemods10', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '2b4222e7-d5a9-471b-bbef-7eafb35e7a24'::uuid
    AND a.slug = 'allthemods10-tts'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Java Minecraft server for the All the Mods 10 To the Sky modpack.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-10-sky';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'allthemods10-tts', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'fd24b19b-dc96-472a-9464-12fb5e67f62a'::uuid
    AND a.slug = 'allthemods11'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Dedicated Minecraft server for the All the Mods 11 modpack.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-11';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'allthemods11', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'f5acb75c-5857-434e-b715-ff91b507bff9'::uuid
    AND a.slug = 'allthemods7'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Minecraft 1.18 modpack server bundle with technology, magic, and quests.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-7';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'allthemods7', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '29b2ee97-2435-4357-8bd4-6b4f12e5864a'::uuid
    AND a.slug = 'allthemods8'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Minecraft 1.19 modpack server bundle with hundreds of mods and quests.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-8';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'allthemods8', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      license = NULL,
      license_type = 'unknown'::public.self_host_app_license_type,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '71983e8d-0931-4653-a6a5-b7f281259b70'::uuid
    AND a.slug = 'allthemons'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM 'All Rights Reserved'
    AND a.license_type IS NOT DISTINCT FROM 'custom'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Modded Java Minecraft server for the All the Mons modpack.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mons';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'allthemons', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ffddcc1e-894f-411c-a0fc-008eeadbe217'::uuid
    AND a.slug = 'alpaca-to-influxdb'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Service for sending Alpaca data to InfluxDB for time-series storage.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'alpaca-to-influxdb', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://store.steampowered.com/eula/203770_eula_0']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '3a895aac-5060-40d6-aa37-09efd325b807'::uuid
    AND a.slug = 'americasarmy-pg'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM 'America''s Army Licensing Agreement'
    AND a.license_type IS NOT DISTINCT FROM 'custom'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Dedicated server for America''s Army Proving Grounds, a multiplayer tactical shooter.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.americasarmy.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'americasarmy-pg', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0-only',
      source_code_url = 'https://github.com/rekkyrosso/ampcast',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/rekkyrosso/ampcast', 'https://github.com/rekkyrosso/ampcast/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'c2c15446-0af8-408a-87b3-4b1d0297d782'::uuid
    AND a.slug = 'ampcast'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Desktop music player inspired by Winamp for browsing and playing local audio.'
    AND a.website_url IS NOT DISTINCT FROM 'https://ampcast.app/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'ampcast', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0-only',
      source_code_url = 'https://github.com/rain0r/ampd',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/rain0r/ampd']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '7bd71669-688d-4a8c-9234-06bccab4cd22'::uuid
    AND a.slug = 'ampd'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web client for MPD music servers that lets you browse and play a local music library.'
    AND a.website_url IS NOT DISTINCT FROM 'https://rain0r.github.io/ampd/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'ampd', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/boubli/AMUD-Dashboard',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/boubli/AMUD-Dashboard']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'cd59442d-6e3b-420d-8d51-370c84a94303'::uuid
    AND a.slug = 'amud-agent'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Telemetry sidecar for the AMUD Dashboard that reports live Proxmox and Docker metrics.'
    AND a.website_url IS NOT DISTINCT FROM 'https://boubli.github.io/AMUD-Dashboard/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'amud-agent', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a6e6626f-1e27-416f-a5d2-614e1ba704e5'::uuid
    AND a.slug = 'anarchism'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Reference app for exploring anarchist theory, history, and political practice.'
    AND a.website_url IS NOT DISTINCT FROM 'https://salsa.debian.org/debian/anarchism/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'anarchism', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'f6a5b0c6-0989-495d-ab52-6f33439d7a08'::uuid
    AND a.slug = 'androidstudio'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'JetBrain''s Projector running Android Studio without any windowing system.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'androidstudio', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '602c099e-4aea-4d3f-bc34-2d6f735d98e6'::uuid
    AND a.slug = 'ankidock'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Anki sync server for synchronizing Anki decks and cards between clients.'
    AND a.website_url IS NOT DISTINCT FROM 'http://apps.ankiweb.de/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'ankidock', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/victoralvesf/aonsoku',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/victoralvesf/aonsoku']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ed242d26-cddc-4234-af70-7c87c255ddc4'::uuid
    AND a.slug = 'aonsoku'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Music client for browsing and playing songs from Navidrome and Subsonic servers.'
    AND a.website_url IS NOT DISTINCT FROM 'https://aonsoku.vercel.app/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'aonsoku', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '64cdf646-8038-4abc-8d1a-1bd20ff6ae3a'::uuid
    AND a.slug = 'ap-self-hosted'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Anchorpoint collaboration storage for versioning large 3D projects.'
    AND a.website_url IS NOT DISTINCT FROM 'https://anchorpoint.app';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'ap-self-hosted', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://gitbox.apache.org/repos/asf/directory-server.git',
      source_code_host = 'gitbox.apache.org',
      website_url = 'https://directory.apache.org/apacheds.html',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://directory.apache.org/apacheds.html', 'https://gitbox.apache.org/repos/asf/directory-server.git']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '9a7bb9c6-caf3-496d-984c-3eb1c71c65a2'::uuid
    AND a.slug = 'apacheds'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'LDAP directory server for identity data and directory services.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'apacheds', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'e4800e6c-bbab-4859-a96b-c1e6bbd0df7a'::uuid
    AND a.slug = 'apachephp8-docker'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Apache and PHP 8 container for serving PHP applications with a web server.'
    AND a.website_url IS NOT DISTINCT FROM 'https://github.com/NightMeer/Unraid-Docker-Templates/issues';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'apachephp8-docker', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '43662d4c-dfd7-429e-a75d-670d2e255b38'::uuid
    AND a.slug = 'appdata-backup-restore-v2-5'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Community Applications appdata backup / restore module allows you to easily (and on a schedule) create backups of your docker appdata folder and restore them.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'appdata-backup-restore-v2-5', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v2.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-2.0-or-later',
      source_code_url = 'https://github.com/torvalds/linux/blob/master/drivers/hwmon/aquacomputer_d5next.c',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/torvalds/linux/blob/master/drivers/hwmon/Kconfig', 'https://github.com/torvalds/linux/blob/master/drivers/hwmon/aquacomputer_d5next.c']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'c58edcf1-793b-4a00-b957-0bab103a6dc2'::uuid
    AND a.slug = 'aquacomputer-d5next'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Linux driver that exposes sensors from Aquacomputer devices such as D5 Next, Quadro, and Aquastream XT.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'aquacomputer-d5next', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-only',
      source_code_url = 'https://github.com/Extravi/araa-search',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Extravi/araa-search']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'd5bc25bb-c953-4c20-9889-bfa609982176'::uuid
    AND a.slug = 'araa'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Privacy-focused metasearch engine that searches the web without tracking users.'
    AND a.website_url IS NOT DISTINCT FROM 'https://araa.extravi.dev/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'araa', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/ArchipelagoMW/Archipelago',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/ArchipelagoMW/Archipelago', 'https://raw.githubusercontent.com/ArchipelagoMW/Archipelago/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a5da7289-293b-4c79-974e-23c88f42b061'::uuid
    AND a.slug = 'archipelago-server'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Archipelago multiworld randomizer server, Generate your Archipelago world using the client then place your generated AP_*.zip in the output folder and start.'
    AND a.website_url IS NOT DISTINCT FROM 'https://archipelago.gg/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'archipelago-server', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '078160bd-f64a-477f-95bb-d791c7acf441'::uuid
    AND a.slug = 'archiveteam-warrior'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Virtual appliance for contributing to Archive Team web archiving projects.'
    AND a.website_url IS NOT DISTINCT FROM 'https://wiki.archiveteam.org/index.php/ArchiveTeam_Warrior';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'archiveteam-warrior', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '79a356e6-1ab4-4e8f-9f14-d0190718c17e'::uuid
    AND a.slug = 'argos'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Monitoring dashboard for checking websites and reporting service availability.'
    AND a.website_url IS NOT DISTINCT FROM 'https://argos-monitoring.framasoft.org/#';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'argos', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '2c375b60-c8e5-4da9-aacf-faf99eb9a2f7'::uuid
    AND a.slug = 'aria2-with-ariang'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'The aim for this project is to create the worlds best and hottest interface to interact with aria2, Very simple to use, just download and open index.html in.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'aria2-with-ariang', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'd2e95440-3a95-4e4e-be0f-f9e99b4ce2cd'::uuid
    AND a.slug = 'ark-survivalascended'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Dedicated server for hosting the Ark Survival Ascended multiplayer game.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'ark-survivalascended', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a34652e5-87ed-4d85-b1e6-b8813f647b8b'::uuid
    AND a.slug = 'arn-messager'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Bot which enables multiple Matrix users to use a single third-party IM account over Mautrix bridges.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'arn-messager', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-only',
      source_code_url = 'https://jfrog.com/community/download-artifactory-oss/',
      website_url = 'https://jfrog.com/community/download-artifactory-oss/',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://investors.jfrog.com/files/doc_financials/2025/q4/a0e22157-3a11-407c-a195-8715edb28eb2-1.pdf', 'https://jfrog.com/community/download-artifactory-oss/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '50372396-c778-4acb-bb06-a582a7373901'::uuid
    AND a.slug = 'artifactory-oss'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Binary repository manager for storing and distributing software build artifacts.'
    AND a.website_url IS NOT DISTINCT FROM 'https://jfrog.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'artifactory-oss', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/skanehira/go-starwars',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/skanehira/go-starwars']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '1f2fbfca-14c7-4392-a4b6-2217211eb514'::uuid
    AND a.slug = 'ascii-star-wars'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Terminal animation that displays Star Wars scenes as ASCII art.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.asciimation.co.nz/index.php';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'ascii-star-wars', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET summary = 'Backup server for managing protected devices and stored backup data.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://websupport.asigra.com/Documentation/Help/v14.2/DS-System%20Help/DS-System_Help/Configuring_the_DS-License_Server.html', 'https://www.asigra.com/country-partner-terms']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '8820f6c7-9876-4f18-9ebe-39f071539e71'::uuid
    AND a.slug = 'asigra-ds-system'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'DS-System software enables you to offer a, scalable service to multiple customers, Ease of use comes from the agentless architecture: customers only need to.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'asigra-ds-system', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'c9e543c0-bf2e-42e5-a5cf-5c1d8870460b'::uuid
    AND a.slug = 'askadedicatedserver'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Dedicated ASKA server for hosting multiplayer survival sessions.'
    AND a.website_url IS NOT DISTINCT FROM 'https://store.steampowered.com/app/1898300/ASKA/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'askadedicatedserver', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '389c7d45-25db-4178-8a49-20dd0318227c'::uuid
    AND a.slug = 'assetto-corsa-evo-server'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Run Assetto Corsa EVO Dedicated Server in Docker using Wine, IMPORTANT: You must download server files via Steam (Tools → Assetto Corsa EVO Dedicated Server).'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'assetto-corsa-evo-server', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '167faf7b-922a-466b-8161-b6655827f534'::uuid
    AND a.slug = 'astropolis'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Astropolis-2.2 Modded Minecraft Server Astropolis-2.2 Starting on a asteroid can you navigate across the stars to different.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/astropolis';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'astropolis', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'cc9b1b78-8f2c-40b0-a3e7-c7a554ed9f00'::uuid
    AND a.slug = 'atm7tothesky'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Skyblock Minecraft modpack server bundle with technology, magic, and quests.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/all-the-mods-7-to-the-sky';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'atm7tothesky', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '55bd8da4-11d1-4168-b4cc-0aacea513740'::uuid
    AND a.slug = 'atrium'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Branded client portal for agencies and freelancers with projects, file sharing, invoicing, and client access.'
    AND a.website_url IS NOT DISTINCT FROM 'https://atrium.vibralabs.co/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'atrium', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '1af97a5c-b4b2-4d35-b80d-d5d8f6e5fcbf'::uuid
    AND a.slug = 'auth-grove'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Single sign-on service for protecting web applications and managing user access.'
    AND a.website_url IS NOT DISTINCT FROM 'https://docker.nasqueron.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'auth-grove', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '4f93f9c3-8f5a-4dc7-b676-7647347fae44'::uuid
    AND a.slug = 'auto-turbo-write-mode'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Unraid tool that switches Turbo Write mode based on the number of spinning disks.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'auto-turbo-write-mode', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ddf74d91-3ba8-451a-bd19-bf5008d5d6dc'::uuid
    AND a.slug = 'auto-update-applications'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Community Applications'' auto update allows you to select which plugins to automatically keep up to date as updates become available, Includes options to wait.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'auto-update-applications', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v2.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-2.0-or-later',
      source_code_url = 'https://forge.aeif.fr/achampollion/autobd',
      source_code_host = 'gitlab',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://forge.aeif.fr/achampollion/autobd']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '194dd17a-5f7b-495c-b6bc-5fdef2d1f879'::uuid
    AND a.slug = 'autobd'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web app for creating comic strips and organizing them for reading.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'autobd', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ffa0206b-4961-4623-b348-b68eff66514b'::uuid
    AND a.slug = 'automover'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Monitor pool disks, trigger the mover when thresholds are exceeded, and log what''s moved.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'automover', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/frncsdrk/avatar',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/frncsdrk/avatar']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'bdb870d3-d731-4dc0-bbfe-f42fd4c6a0f1'::uuid
    AND a.slug = 'avatar'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web service for generating random avatars from configurable styles and inputs.'
    AND a.website_url IS NOT DISTINCT FROM 'https://frncsdrk.github.io/avatar';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'avatar', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '13681ef9-ea84-4183-bffd-09f5db0a52f5'::uuid
    AND a.slug = 'awtrix2'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'AWTRIX host for serving smart pixel display applications.'
    AND a.website_url IS NOT DISTINCT FROM 'https://awtrixdocs.blueforcer.de/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'awtrix2', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET license = 'Axigen End User License Agreement',
      license_type = 'custom'::public.self_host_app_license_type,
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.axigen.com/legal/eula/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'e0cf2744-e245-4512-888b-9024233e33f3'::uuid
    AND a.slug = 'axigen-mail-server'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Mail server for managing email accounts, domains, and message delivery.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.axigen.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'axigen-mail-server', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'e0f4cc3f-b2a2-4d88-b241-9eb5a0abaeb7'::uuid
    AND a.slug = 'axym-reader'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Customizable speed-reading app that displays text with pacing, chunking, and highlighting.'
    AND a.website_url IS NOT DISTINCT FROM 'https://axym.davidewiest.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'axym-reader', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '4e47f416-e985-4a2f-b38f-c6fcdf6041b3'::uuid
    AND a.slug = 'backissue'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'BackIssue is a comic library manager, Track the comic series you want, download new issues automatically as they release, tag them with metadata, and keep.'
    AND a.website_url IS NOT DISTINCT FROM 'https://backissue.app/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'backissue', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '442773fc-73ec-47d1-aadb-6419c76e4d9d'::uuid
    AND a.slug = 'bacula-server'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Network backup server with a web interface for managing Bacula jobs.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bacula-server', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-or-later',
      source_code_url = 'https://forge.cliss21.org/cliss21/benevalibre',
      source_code_host = 'gitlab',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://forge.cliss21.org/cliss21/benevalibre']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'd775b8cb-abb1-483f-8ab1-37a35050b837'::uuid
    AND a.slug = 'benevalibre'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Makes it easier to manage and promote voluntary work in associations.'
    AND a.website_url IS NOT DISTINCT FROM 'https://benevalibre.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'benevalibre', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Mozilla Public License 2.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'MPL-2.0',
      source_code_url = 'https://gitlab.isc.org/isc-projects/bind9',
      source_code_host = 'gitlab',
      summary = 'DNS server for publishing and resolving domain records.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://gitlab.isc.org/isc-projects/bind9']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '7853a67d-c962-457c-b058-9fff49e35803'::uuid
    AND a.slug = 'bind9'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Bind9 nameserver with Webmin WebUI, Simple lightweight DNS for local network, Default WebUI username is: admin and password: difficult You can change.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.isc.org/bind/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bind9', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/aculix/bitplay',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/aculix/bitplay']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '605e52ba-b74b-4d3c-950a-eef028ba230d'::uuid
    AND a.slug = 'bitplay'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web application that streams video from torrent files or magnet links in a browser.'
    AND a.website_url IS NOT DISTINCT FROM 'https://bitplay.to/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bitplay', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'f446bea0-cb42-49d9-8659-3bcc631cc9ac'::uuid
    AND a.slug = 'blackcoin-quantum-quasar'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Browser-accessible Blackcoin Quantum Quasar node and wallet interface.'
    AND a.website_url IS NOT DISTINCT FROM 'https://blackcoin.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'blackcoin-quantum-quasar', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/dedkola/bladevault',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/dedkola/bladevault']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'c47558df-ae6a-46b7-b4b8-91aa22fbcee4'::uuid
    AND a.slug = 'bladevault'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Knife collection manager for cataloging, comparing, and querying items with an AI client.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.bladevault.pro/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bladevault', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      summary = 'Checks music tags and file organization, then fixes problems such as misplaced files and missing artwork.',
      website_url = 'https://www.blisshq.com/',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.blisshq.com/', 'https://www.blisshq.com/organise-music-files.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'bc18d171-5227-48ed-b258-1eb8f68267f0'::uuid
    AND a.slug = 'bliss'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Map any local port to 3220 for web access Map any local port to 3221 (used for bliss internal web server) Map a local volume to /config.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bliss', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '6d6d74c3-addd-478a-963f-f2b9e08b83ea'::uuid
    AND a.slug = 'bloat'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web client for Pleroma, Mitra and other Fediverse connected apps.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bloat', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/crowdsecurity/cs-blocklist-mirror',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/crowdsecurity/cs-blocklist-mirror', 'https://github.com/crowdsecurity/cs-blocklist-mirror/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '3abc324d-13ff-465d-97f6-67ad514525da'::uuid
    AND a.slug = 'blocklist-mirror'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'CrowdSec service that exposes active decisions through HTTP endpoints for network appliances.'
    AND a.website_url IS NOT DISTINCT FROM 'https://docs.crowdsec.net/docs/bouncers/blocklist-mirror';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'blocklist-mirror', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License or Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT OR Apache-2.0',
      source_code_url = 'https://github.com/bluesky-social/pds',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/bluesky-social/pds']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '6ea0c7d6-15cd-453c-bcc1-b751f9d79dac'::uuid
    AND a.slug = 'bluesky-pds'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Personal Data Server for federating a Bluesky account with the wider network.'
    AND a.website_url IS NOT DISTINCT FROM 'https://atproto.com/guides/self-hosting';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bluesky-pds', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      summary = 'Server that connects Blynk apps with devices such as Arduino and Raspberry Pi boards.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/blynkkk/blynkkk.github.io/blob/master/introanddownloads.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '0c97b747-6fa5-4a4b-b7db-71d93691a819'::uuid
    AND a.slug = 'blynk-server'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Template to setup a Blynk server on Unraid There is an issue where this Docker doesn''t seem to create the server.properties file in the config directory.'
    AND a.website_url IS NOT DISTINCT FROM 'https://community.blynk.cc/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'blynk-server', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'c9a488f0-8eb5-4554-983f-fe0d328ba214'::uuid
    AND a.slug = 'booktracker'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Reading tracker for organizing a personal library and logging reading habits.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'booktracker', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://github.com/garybowers/bootimus',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/garybowers/bootimus', 'https://github.com/garybowers/bootimus/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'b84a2ae4-3fa4-4020-82a4-d6e262ae3458'::uuid
    AND a.slug = 'bootimus'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'PXE and HTTP boot server with embedded iPXE bootloaders and a web interface.'
    AND a.website_url IS NOT DISTINCT FROM 'https://bootimus.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bootimus', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-only',
      source_code_url = 'https://github.com/karanhudia/borg-ui',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/karanhudia/borg-ui']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '20911d6d-8692-4ff4-97d5-b2108a2141a3'::uuid
    AND a.slug = 'borg-web-ui'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Replace complex Borg Backup terminal commands with a beautiful web UI, Create, schedule, and restore backups with just a few clicks.'
    AND a.website_url IS NOT DISTINCT FROM 'https://karanhudia.github.io/borg-ui/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'borg-web-ui', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0-or-later',
      source_code_url = 'https://projects.torsion.org/witten/borgmatic',
      website_url = 'https://torsion.org/borgmatic/',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://projects.torsion.org/witten/borgmatic', 'https://torsion.org/borgmatic/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'fd8296a5-a133-4466-b6de-47316e227321'::uuid
    AND a.slug = 'borgmatic'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Borgmatic is simple, configuration-driven backup software for servers and workstations, Protect your files with client-side encryption, Backup your databases.'
    AND a.website_url IS NOT DISTINCT FROM 'http://ghcr.io/borgmatic-collective/borgmatic';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'borgmatic', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-only',
      source_code_url = 'https://gitdab.com/cadence/breezewiki',
      summary = 'Read Fandom wiki pages through a simpler frontend that removes ads, videos, and suggested content.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://gitdab.com/cadence/breezewiki']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'cd4a8de0-cb17-49ca-927f-0f22408f9224'::uuid
    AND a.slug = 'breezewiki'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Alternative frontend for Fandom for writing and organizing notes or pages.'
    AND a.website_url IS NOT DISTINCT FROM 'https://breezewiki.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'breezewiki', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-only',
      source_code_url = 'https://github.com/tombadilo-bombadilo/budgero',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/tombadilo-bombadilo/budgero']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'f2354cf4-f7b1-4fd4-99a4-7202322ade6a'::uuid
    AND a.slug = 'budgero'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'End-to-end encrypted envelope-budgeting app for planning and tracking personal finances.'
    AND a.website_url IS NOT DISTINCT FROM 'https://budgero.app/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'budgero', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/range-of-motion/budget',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/range-of-motion/budget']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'd98d6584-a5d3-4912-afd5-71ffdd8331cf'::uuid
    AND a.slug = 'budget'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web app that helps you keep track of your finances.'
    AND a.website_url IS NOT DISTINCT FROM 'https://usebudget.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'budget', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/buggregator/server',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/buggregator/server']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '09adb7be-8e49-424a-b2de-761b54f3ebd1'::uuid
    AND a.slug = 'buggregator'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Buggregator is a free, multi-purpose server tool designed primarily for debugging PHP applications.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'buggregator', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available'::public.self_host_app_source_model,
      license = 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International',
      license_type = 'custom'::public.self_host_app_license_type,
      license_spdx_id = 'CC-BY-NC-ND-4.0',
      source_code_url = 'https://github.com/raesene/bWAPP',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/raesene/bWAPP', 'https://github.com/raesene/bWAPP/blob/master/bWAPP/README.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '7b0d5bb4-46a9-48b9-aeea-a96630e3e233'::uuid
    AND a.slug = 'bwapp'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Deliberately insecure PHP and MySQL web application for learning and testing common web vulnerabilities.'
    AND a.website_url IS NOT DISTINCT FROM 'https://sourceforge.net/projects/bwapp/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'bwapp', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0-only',
      source_code_url = 'https://framagit.org/caerp/caerp',
      source_code_host = 'gitlab',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://endi.coop/cgv/enDI%20-%20CGV%20et%20CGU%20v0.pdf', 'https://framagit.org/caerp/caerp']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '12a05113-6b09-4b17-9b53-e90310e34f09'::uuid
    AND a.slug = 'caerp'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Accounting and management software for companies organized as cooperatives.'
    AND a.website_url IS NOT DISTINCT FROM 'https://endi.coop';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'caerp', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '8407b51a-e0b8-454f-a476-691593240f13'::uuid
    AND a.slug = 'canticle'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Fetches time-synced (.lrc) lyrics for your music library from Musixmatch, on a schedule and via Lidarr webhooks, and writes them next to your audio files.'
    AND a.website_url IS NOT DISTINCT FROM 'https://sydlexius.github.io/canticle/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'canticle', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '6775e703-4943-4c3b-a438-23d28d731b27'::uuid
    AND a.slug = 'cave-factory'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Minecraft server container for running the Cave Factory modpack with its matching game files.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/cave-factory';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cave-factory', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'aa60f099-cbdb-4d59-ae19-527753e6e46c'::uuid
    AND a.slug = 'chancery'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Security-focused paste service for sharing text snippets through a private web interface.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.vladzodchey.ru/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'chancery', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'bbca5c03-c89a-487d-95cb-55ada98ff444'::uuid
    AND a.slug = 'chaptertool'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Create and convert chapters for podcasts, youtube, matroska, mkvmerge/nero/vorbis, webvtt, ffmpeginfo, ffmetadata, pyscenedetect, apple chapters, edl.'
    AND a.website_url IS NOT DISTINCT FROM 'https://mtillmann.github.io/chaptertool/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'chaptertool', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '4fd45c21-4adb-4612-b079-21d520b60811'::uuid
    AND a.slug = 'chatonsinfos'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Create stats files Chatons compliant and enable configuration in config pannel.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'chatonsinfos', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET website_url = 'https://www.chitubox.com/en',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://dental.chitubox.com/lang/article/dental/law/legal', 'https://docs.chitubox.com/en-US/chitubox-pro/latest/account-and-license', 'https://www.chitubox.com/en']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '4231549e-7633-4e67-893c-b22ae493e377'::uuid
    AND a.slug = 'chitubox-novnc'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Browser-accessible container for running CHITUBOX through a remote desktop interface.'
    AND a.website_url IS NOT DISTINCT FROM 'https://ultimaker.com/software/ultimaker-chitubox';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'chitubox-novnc', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '46239105-ce77-4277-a630-632742f874df'::uuid
    AND a.slug = 'clipy'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Simple web-clipboard, Easy copy something to clipboard and use it on another device, Written in python based on flask Runs on port 4321 if you use a bridge.'
    AND a.website_url IS NOT DISTINCT FROM 'https://github.com/maschhoff';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'clipy', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '483293ae-dbc9-441a-9619-e61ae272b44f'::uuid
    AND a.slug = 'clumoove'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Cloud data migration and synchronization manager for moving files between providers.'
    AND a.website_url IS NOT DISTINCT FROM 'https://github.com/IceWhaleTech/CasaOS-AppStore/tree/main/Apps/Clumoove';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'clumoove', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Lesser General Public License v2.1',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'LGPL-2.1-only',
      source_code_url = 'https://github.com/cockpit-project/cockpit',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/cockpit-project/cockpit', 'https://github.com/cockpit-project/cockpit/security']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'e25a874b-5071-4aef-abae-173fa810ca06'::uuid
    AND a.slug = 'cockpit-ws'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Cockpit is a web graphical interface for Linux servers.'
    AND a.website_url IS NOT DISTINCT FROM 'https://cockpit-project.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cockpit-ws', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '69ba21a3-35c6-4919-8d20-e0df411c388f'::uuid
    AND a.slug = 'codechef'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Developer tool for converting different languages repetitive codes to another language.'
    AND a.website_url IS NOT DISTINCT FROM 'https://codechef.ipdotsetaf.ir/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'codechef', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available'::public.self_host_app_source_model,
      license = 'Server Side Public License v1',
      license_type = 'custom'::public.self_host_app_license_type,
      license_spdx_id = 'SSPL-1.0',
      source_code_url = 'https://github.com/codeproject/CodeProject.AI-Server',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/codeproject/CodeProject.AI-Server', 'https://github.com/codeproject/CodeProject.AI-Server/blob/master/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '580fc3ec-b913-46b2-8da5-edf6545ef94a'::uuid
    AND a.slug = 'codeproject-ai-server'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Fast, free, Artificial Intelligence Server for any app, any language, CodeProject.AI Server is a locally installed, fast, free and Artificial Intelligence.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.codeproject.com/ai/docs/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'codeproject-ai-server', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ef5aaf92-a49e-4fb5-a679-366791eec86d'::uuid
    AND a.slug = 'codex-docs'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Documentation app for creating internal, public, and personal docs.'
    AND a.website_url IS NOT DISTINCT FROM 'https://docs.codex.so/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'codex-docs', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '003a3793-d419-41c4-a9fb-ff70f9c9d9dc'::uuid
    AND a.slug = 'coin'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Member management dashboard for nonprofit internet service providers.'
    AND a.website_url IS NOT DISTINCT FROM 'https://code.ffdn.org/FFDN/coin';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'coin', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a731ee71-c4d8-4e3f-8452-dcbab7c3c86f'::uuid
    AND a.slug = 'comfyui-magic'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'ComfyUI image-generation environment with common extensions and models preconfigured.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.minethefutr.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'comfyui-magic', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://gitlab.com/commento/commento',
      source_code_host = 'gitlab',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://gitlab.com/commento/docs']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '12a3fb1e-82b5-44ad-a4a4-4b1c039fde9d'::uuid
    AND a.slug = 'commento'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Privacy-focused commenting system for adding discussions to websites.'
    AND a.website_url IS NOT DISTINCT FROM 'https://commento.io/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'commento', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/bitfocus/companion',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/bitfocus/companion', 'https://github.com/bitfocus/companion/blob/main/LICENSE.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '1232f41c-7d9b-4da8-870f-7aa76dd55366'::uuid
    AND a.slug = 'companion'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Control surface software that turns Stream Deck devices into tools for live production equipment.'
    AND a.website_url IS NOT DISTINCT FROM 'https://bitfocus.io/companion/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'companion', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '522f0b2b-1670-46e9-9557-d8b0b1585750'::uuid
    AND a.slug = 'config-editor'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'CA Config Editor is a simple file editor for advanced users that will allow you to edit within your browser any of Unraid''s configuration files.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'config-editor', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.atlassian.com/legal/atlassian-customer-agreement']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '8124b1fc-3b15-496c-a7eb-eb2ee363a7f6'::uuid
    AND a.slug = 'confluence'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM 'Atlassian Customer Agreement (Confluence Data Center subscription)'
    AND a.license_type IS NOT DISTINCT FROM 'custom'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Atlassian''s self-managed workspace for shared documentation, project pages, and team knowledge.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.atlassian.com/software/confluence';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'confluence', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '7e55f49a-ccaf-4686-a592-eb505ce67fb0'::uuid
    AND a.slug = 'conjurr'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Conjurr is an AI recommendation tool that uses Tautulli watch data to recommend what users should watch next.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.newsletterr.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'conjurr', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/FoxxMD/context-mod',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/FoxxMD/context-mod']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'fa2f12d0-c7fb-4e82-adfd-606dd242e31a'::uuid
    AND a.slug = 'contextmod'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Reddit moderation bot that applies event-based rules to posts and users.'
    AND a.website_url IS NOT DISTINCT FROM 'https://contextmod.dev/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'contextmod', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://github.com/Convert-Commander/convert-commander',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Convert-Commander/convert-commander']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '70b06b6a-d82a-4b5c-92ed-091be45bc221'::uuid
    AND a.slug = 'convert-commander'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Web service for converting files on a local server without sending them to external services.'
    AND a.website_url IS NOT DISTINCT FROM 'https://cc.bleibundgut.ch/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'convert-commander', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v2.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-2.0-only',
      source_code_url = 'https://github.com/google/gasket-driver',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/google/gasket-driver']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'eee7eb0e-e54f-4658-9432-b61d6f5c2fb8'::uuid
    AND a.slug = 'coral-accelerator-module-drivers'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'This package contains the Coral Accelerator Module Drivers (for PCI based TPUs) and installs them to utilize them in your Docker containers, Only necessary.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'coral-accelerator-module-drivers', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a22dfa28-b444-446d-8049-3f650a73500a'::uuid
    AND a.slug = 'create-re-flavored'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Create Re-Flavored-6.44b Modded Minecraft Server Create Re-Flavored-6.44b A continuation of and stability improvement on the Create Flavored.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/create-re-flavored';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'create-re-flavored', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a81bc6a1-b585-4c68-8eb0-74138ddf93b9'::uuid
    AND a.slug = 'createaboveandbeyond'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Dedicated Minecraft server for the Create Above and Beyond modpack.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/create-above-and-beyond';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'createaboveandbeyond', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '8e9b3ad2-24f6-4a27-b667-f9289ab2e339'::uuid
    AND a.slug = 'createflavored'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Dedicated Minecraft server for the Create Flavored 5.10 modpack.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.curseforge.com/minecraft/modpacks/create-flavored';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'createflavored', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://github.com/funkolab/cs-mikrotik-bouncer',
      source_code_host = 'github',
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '8e30a0b5-83aa-433e-8adc-0982f1efc58b'::uuid
    AND a.slug = 'crowdsec-mikrotik-bouncer'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'CrowdSec bouncer for MikroTik RouterOS that blocks malicious IP addresses from reaching protected services.'
    AND a.website_url IS NOT DISTINCT FROM 'https://app.crowdsec.net/hub/author/funkolab/remediation-components/cs-mikrotik-bouncer';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'crowdsec-mikrotik-bouncer', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET license = 'CrushFTP License',
      license_type = 'custom'::public.self_host_app_license_type,
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.crushftp.com/license.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '097b4499-0d71-48a2-9dbf-854ecfbd1b27'::uuid
    AND a.slug = 'crushftp10'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Share your files securely with FTP, Implicit FTPS, SFTP, HTTP, or HTTPS using CrushFTP 10, Built on Alpine 3.12, Size 234.8 MB, See dockerhub registry page.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.crushftp.com/index.html';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'crushftp10', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/cupcakearmy/cryptgeon',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/cupcakearmy/cryptgeon']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '610bbe3d-7ca5-44d8-95f7-3a9bdd4e4bbf'::uuid
    AND a.slug = 'cryptgeon-redis'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Note and file sharing service that creates a separate secret for each shared item.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cryptgeon-redis', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'de4cb4f3-cd1e-4257-a623-ba3170bc9906'::uuid
    AND a.slug = 'cryptomator-webdav'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Cryptomator WebDAV allows you to serve a locally stored Cryptomator vault over a secure WebDAV (https) connection, allowing access to decrypted files through.'
    AND a.website_url IS NOT DISTINCT FROM 'https://github.com/greycubesgav/unraid-templates/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cryptomator-webdav', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET license = 'CubeBackup Terms of Service',
      license_type = 'custom'::public.self_host_app_license_type,
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://cubebackup.com/docs/legal/terms-of-service/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '2d513810-533d-4bb2-a046-f5d560453f6f'::uuid
    AND a.slug = 'cubebackup-googleworkspace'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Backup service for Google Workspace and Microsoft 365 with version history on private storage.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.cubebackup.com/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cubebackup-googleworkspace', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://xulops.net/forge/cultivons.php?menu=download',
      summary = 'Web app for managing crops, garden tasks, weather, stocks, documents, and budgets for an autonomous community.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://xulops.net/forge/cultivons.php?menu=download']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ca9a7ad6-b587-4edb-8f00-5ee53d00e52f'::uuid
    AND a.slug = 'cultivons'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Autonomous base-management game about building and sustaining a community.'
    AND a.website_url IS NOT DISTINCT FROM 'https://xulops.net/forge/cultivons.php';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cultivons', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'unknown'::public.self_host_app_source_model,
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '96326aba-4065-4334-b088-bee65b076f4d'::uuid
    AND a.slug = 'cups-for-canon'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'CUPS print server container with Canon printer drivers for network printing.'
    AND a.website_url IS NOT DISTINCT FROM NULL;
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cups-for-canon', changed;
  END IF;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Lesser General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'LGPL-3.0-or-later',
      source_code_url = 'https://github.com/Ultimaker/Cura',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Ultimaker/Cura', 'https://github.com/Ultimaker/Cura/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '46480323-fba8-471c-9161-b8b6ee794fab'::uuid
    AND a.slug = 'cura-novnc'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.summary IS NOT DISTINCT FROM 'Browser-accessible container for running UltiMaker Cura with a remote desktop interface.'
    AND a.website_url IS NOT DISTINCT FROM 'https://ultimaker.com/software/ultimaker-cura';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'A-C closed-source audit guard failed for % (expected exactly one row, updated %)', 'cura-novnc', changed;
  END IF;
END $$;

COMMIT;

