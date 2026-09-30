-- Guarded draft for the 2026-09-30 published unknown-source review.
-- Review only. Do not apply this SQL without approval.
BEGIN;
DO $$
DECLARE
  changed integer;
  changed_total integer := 0;
BEGIN
  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v2.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-2.0-or-later',
      source_code_url = 'https://salsa.debian.org/debian/anarchism/',
      source_code_host = 'other',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://apps.yunohost.org/app/anarchism', 'https://salsa.debian.org/debian/anarchism/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a6e6626f-1e27-416f-a5d2-614e1ba704e5'::uuid
    AND a.slug = 'anarchism'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Anarchism'
    AND a.summary IS NOT DISTINCT FROM 'Reference app for exploring anarchist theory, history, and political practice.'
    AND a.website_url IS NOT DISTINCT FROM 'https://salsa.debian.org/debian/anarchism/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://salsa.debian.org/debian/anarchism'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://salsa.debian.org/debian/anarchism'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://salsa.debian.org/debian/anarchism/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'anarchism', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-only',
      source_code_url = 'https://framagit.org/framasoft/framaspace/argos',
      source_code_host = 'other',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://argos-monitoring.framasoft.org/developer/license.html', 'https://framagit.org/framasoft/framaspace/argos']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '79a356e6-1ab4-4e8f-9f14-d0190718c17e'::uuid
    AND a.slug = 'argos'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Argos'
    AND a.summary IS NOT DISTINCT FROM 'Monitoring dashboard for checking websites and reporting service availability.'
    AND a.website_url IS NOT DISTINCT FROM 'https://argos-monitoring.framasoft.org/#'
    AND a.docs_url IS NOT DISTINCT FROM 'https://argos-monitoring.framasoft.org/'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://argos-monitoring.framasoft.org/'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://argos-monitoring.framasoft.org/#';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'argos', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-or-later',
      source_code_url = 'https://code.ffdn.org/arn/arn-messager',
      source_code_host = 'other',
      summary = 'Matrix bot that lets users without admin rights connect to a WhatsApp group through a Mautrix bridge.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://apps.yunohost.org/app/arn_messager', 'https://code.ffdn.org/arn/arn-messager']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'a34652e5-87ed-4d85-b1e6-b8813f647b8b'::uuid
    AND a.slug = 'arn-messager'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Arn Messager'
    AND a.summary IS NOT DISTINCT FROM 'Bot which enables multiple Matrix users to use a single third-party IM account over Mautrix bridges.'
    AND a.website_url IS NOT DISTINCT FROM NULL
    AND a.docs_url IS NOT DISTINCT FROM 'https://code.ffdn.org/arn/arn-messager#configuration-file'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://code.ffdn.org/arn/arn-messager#configuration-file'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://apps.yunohost.org/app/arn_messager';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'arn-messager', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'source_available'::public.self_host_app_source_model,
      license = 'Elastic License 2.0 (ELv2)',
      license_type = 'custom'::public.self_host_app_license_type,
      license_spdx_id = 'Elastic-2.0',
      source_code_url = 'https://github.com/Vibra-Labs/Atrium',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Vibra-Labs/Atrium', 'https://github.com/Vibra-Labs/Atrium/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '55bd8da4-11d1-4168-b4cc-0aacea513740'::uuid
    AND a.slug = 'atrium'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Atrium'
    AND a.summary IS NOT DISTINCT FROM 'Branded client portal for agencies and freelancers with projects, file sharing, invoicing, and client access.'
    AND a.website_url IS NOT DISTINCT FROM 'https://atrium.vibralabs.co/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/Vibra-Labs/Atrium/blob/main/docs/configuration.md'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Vibra-Labs/Atrium/blob/main/docs/configuration.md'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://atrium.vibralabs.co/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'atrium', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0-or-later',
      source_code_url = 'https://github.com/BackIssueApp/BackIssue',
      source_code_host = 'github',
      summary = 'Self-hosted library manager for comics, manga, books, and audiobooks, with automatic downloads and built-in reading tools.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/BackIssueApp/BackIssue', 'https://github.com/BackIssueApp/BackIssue/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '4e47f416-e985-4a2f-b38f-c6fcdf6041b3'::uuid
    AND a.slug = 'backissue'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'BackIssue'
    AND a.summary IS NOT DISTINCT FROM 'BackIssue is a comic library manager, Track the comic series you want, download new issues automatically as they release, tag them with metadata, and keep.'
    AND a.website_url IS NOT DISTINCT FROM 'https://backissue.app/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://backissue.app/'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://backissue.app/'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://backissue.app/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'backissue', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'MIT License',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'MIT',
      source_code_url = 'https://github.com/Blackcoin-Dev/Blackcoin',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Blackcoin-Dev/Blackcoin']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'f446bea0-cb42-49d9-8659-3bcc631cc9ac'::uuid
    AND a.slug = 'blackcoin-quantum-quasar'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Blackcoin-Quantum-Quasar'
    AND a.summary IS NOT DISTINCT FROM 'Browser-accessible Blackcoin Quantum Quasar node and wallet interface.'
    AND a.website_url IS NOT DISTINCT FROM 'https://blackcoin.org/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://forums.unraid.net/'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://forums.unraid.net/'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://blackcoin.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'blackcoin-quantum-quasar', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0',
      source_code_url = 'https://github.com/sydlexius/canticle',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/sydlexius/canticle', 'https://github.com/sydlexius/canticle/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '8407b51a-e0b8-454f-a476-691593240f13'::uuid
    AND a.slug = 'canticle'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Canticle'
    AND a.summary IS NOT DISTINCT FROM 'Fetches time-synced (.lrc) lyrics for your music library from Musixmatch, on a schedule and via Lidarr webhooks, and writes them next to your audio files.'
    AND a.website_url IS NOT DISTINCT FROM 'https://sydlexius.github.io/canticle/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://sydlexius.github.io/canticle/GETTING_STARTED/'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://sydlexius.github.io/canticle/GETTING_STARTED/'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://sydlexius.github.io/canticle/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'canticle', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'AGPL-3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0',
      source_code_url = 'https://framagit.org/chatons/chatonsinfos',
      source_code_host = 'other',
      summary = 'Shares structured data about the CHATONS collective, its members, and their services.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://apps.yunohost.org/app/chatonsinfos', 'https://framagit.org/chatons/chatonsinfos']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '4fd45c21-4adb-4612-b079-21d520b60811'::uuid
    AND a.slug = 'chatonsinfos'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Chatonsinfos'
    AND a.summary IS NOT DISTINCT FROM 'Create stats files Chatons compliant and enable configuration in config pannel.'
    AND a.website_url IS NOT DISTINCT FROM NULL
    AND a.docs_url IS NOT DISTINCT FROM 'https://framagit.org/chatons/chatonsinfos/-/blob/master/README.md'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://framagit.org/chatons/chatonsinfos/-/blob/master/README.md'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://apps.yunohost.org/app/chatonsinfos';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'chatonsinfos', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU Affero General Public License v3.0 or later',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'AGPL-3.0-or-later',
      source_code_url = 'https://code.ffdn.org/ffdn/coin',
      source_code_host = 'other',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://apps.yunohost.org/app/coin', 'https://code.ffdn.org/ffdn/coin']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '003a3793-d419-41c4-a9fb-ff70f9c9d9dc'::uuid
    AND a.slug = 'coin'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Coin'
    AND a.summary IS NOT DISTINCT FROM 'Member management dashboard for nonprofit internet service providers.'
    AND a.website_url IS NOT DISTINCT FROM 'https://code.ffdn.org/FFDN/coin'
    AND a.docs_url IS NOT DISTINCT FROM 'https://apps.yunohost.org/app/coin'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://apps.yunohost.org/app/coin'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://code.ffdn.org/FFDN/coin';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'coin', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0',
      source_code_url = 'https://github.com/Axym-Labs/LetoReader',
      source_code_host = 'github',
      name = 'LetoReader',
      publisher_name = 'Axym Labs',
      website_url = 'https://leto.axym.org/',
      docs_url = 'https://github.com/Axym-Labs/LetoReader/wiki',
      install_docs_url = 'https://github.com/Axym-Labs/LetoReader#hosting',
      publisher_url = 'https://github.com/Axym-Labs',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Axym-Labs/Axym-Reader', 'https://github.com/Axym-Labs/LetoReader', 'https://github.com/Axym-Labs/LetoReader/blob/main/LICENSE', 'https://github.com/Axym-Labs/LetoReader/wiki', 'https://github.com/Axym-Labs', 'https://hub.docker.com/r/davidewiest/reader', 'https://leto.axym.org/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'e0f4cc3f-b2a2-4d88-b241-9eb5a0abaeb7'::uuid
    AND a.slug = 'axym-reader'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Axym-Reader'
    AND a.summary IS NOT DISTINCT FROM 'Customizable speed-reading app that displays text with pacing, chunking, and highlighting.'
    AND a.website_url IS NOT DISTINCT FROM 'https://axym.davidewiest.com/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://forums.unraid.net/topic/133764-support-grtgbln-docker-templates'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://forums.unraid.net/topic/133764-support-grtgbln-docker-templates'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://axym.davidewiest.com/'
    AND a.publisher_name IS NOT DISTINCT FROM 'Axym-Reader';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'axym-reader', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'Apache License 2.0',
      license_type = 'permissive'::public.self_host_app_license_type,
      license_spdx_id = 'Apache-2.0',
      source_code_url = 'https://github.com/codex-team/codex.docs',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/codex-team/codex.docs', 'https://github.com/codex-team/codex.docs/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'ef5aaf92-a49e-4fb5-a679-366791eec86d'::uuid
    AND a.slug = 'codex-docs'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'CodeX-Docs'
    AND a.summary IS NOT DISTINCT FROM 'Documentation app for creating internal, public, and personal docs.'
    AND a.website_url IS NOT DISTINCT FROM 'https://docs.codex.so/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://forums.unraid.net/topic/137296-support-b42n1-repo/'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://forums.unraid.net/topic/137296-support-b42n1-repo/'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://docs.codex.so/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'codex-docs', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_model = 'open_source'::public.self_host_app_source_model,
      license = 'GNU General Public License v3.0',
      license_type = 'copyleft'::public.self_host_app_license_type,
      license_spdx_id = 'GPL-3.0',
      source_code_url = 'https://github.com/maschhoff/clipy',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/maschhoff/clipy', 'https://github.com/maschhoff/clipy/blob/main/LICENSE']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '46239105-ce77-4277-a630-632742f874df'::uuid
    AND a.slug = 'clipy'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Clipy'
    AND a.summary IS NOT DISTINCT FROM 'Simple web-clipboard, Easy copy something to clipboard and use it on another device, Written in python based on flask Runs on port 4321 if you use a bridge.'
    AND a.website_url IS NOT DISTINCT FROM 'https://github.com/maschhoff'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/maschhoff'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/maschhoff'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/maschhoff';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'clipy', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_code_url = 'https://github.com/NightMeer/ApachePHP8',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/NightMeer/ApachePHP8']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'e4800e6c-bbab-4859-a96b-c1e6bbd0df7a'::uuid
    AND a.slug = 'apachephp8-docker'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'ApachePHP8-Docker'
    AND a.summary IS NOT DISTINCT FROM 'Apache and PHP 8 container for serving PHP applications with a web server.'
    AND a.website_url IS NOT DISTINCT FROM 'https://github.com/NightMeer/Unraid-Docker-Templates/issues'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/NightMeer/Unraid-Docker-Templates/issues'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/NightMeer/Unraid-Docker-Templates/issues'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/NightMeer/Unraid-Docker-Templates/issues';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'apachephp8-docker', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_code_url = 'https://github.com/Mtillmann/chaptertool',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Mtillmann/chaptertool']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = 'bbca5c03-c89a-487d-95cb-55ada98ff444'::uuid
    AND a.slug = 'chaptertool'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'chaptertool'
    AND a.summary IS NOT DISTINCT FROM 'Create and convert chapters for podcasts, youtube, matroska, mkvmerge/nero/vorbis, webvtt, ffmpeginfo, ffmetadata, pyscenedetect, apple chapters, edl.'
    AND a.website_url IS NOT DISTINCT FROM 'https://mtillmann.github.io/chaptertool/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/Mtillmann/chaptertool/issues'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Mtillmann/chaptertool/issues'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://mtillmann.github.io/chaptertool/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'chaptertool', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET source_code_url = 'https://github.com/yungsnuzzy/conjurr',
      source_code_host = 'github',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/yungsnuzzy/conjurr']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '7e55f49a-ccaf-4686-a592-eb505ce67fb0'::uuid
    AND a.slug = 'conjurr'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Conjurr'
    AND a.summary IS NOT DISTINCT FROM 'Conjurr is an AI recommendation tool that uses Tautulli watch data to recommend what users should watch next.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.newsletterr.org/'
    AND a.docs_url IS NOT DISTINCT FROM 'https://github.com/yungsnuzzy/conjurr/issues'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/yungsnuzzy/conjurr/issues'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://www.newsletterr.org/';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'conjurr', changed;
  END IF;
  changed_total := changed_total + changed;

  UPDATE public.self_host_apps AS a
  SET summary = 'Self-hosted metadata server for Anchorpoint''s collaborative file management and version-control app.',
      data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.anchorpoint.app/administration/self-hosting/getting-started/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
      data_checked_at = now(),
      technical_facts_checked_at = now(),
      updated_at = now()
  WHERE a.id = '64cdf646-8038-4abc-8d1a-1bd20ff6ae3a'::uuid
    AND a.slug = 'ap-self-hosted'
    AND a.published IS TRUE
    AND a.source_model IS NOT DISTINCT FROM 'unknown'::public.self_host_app_source_model
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'::public.self_host_app_license_type
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.name IS NOT DISTINCT FROM 'Ap Self Hosted'
    AND a.summary IS NOT DISTINCT FROM 'Anchorpoint collaboration storage for versioning large 3D projects.'
    AND a.website_url IS NOT DISTINCT FROM 'https://anchorpoint.app'
    AND a.docs_url IS NOT DISTINCT FROM 'https://anchorpoint.app'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://anchorpoint.app'
    AND a.publisher_url IS NOT DISTINCT FROM 'https://anchorpoint.app';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'Unknown-source audit guard failed for % (expected one current row, updated %)', 'ap-self-hosted', changed;
  END IF;
  changed_total := changed_total + changed;

  IF changed_total <> 16 THEN
    RAISE EXCEPTION 'Unknown-source audit expected 16 changed rows, got %', changed_total;
  END IF;
END $$;
COMMIT;

