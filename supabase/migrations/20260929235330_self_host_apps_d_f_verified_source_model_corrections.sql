-- Guarded corrections for verified D-F source models, licenses, and Datadog Agent identity.
BEGIN;

DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET name = 'Datadog Agent',
      summary = 'Collects host metrics and events and sends them to Datadog.',
      docs_url = 'https://docs.datadoghq.com/agent/',
      install_docs_url = 'https://docs.datadoghq.com/getting_started/agent/',
      publisher_name = 'Datadog, Inc.',
      publisher_type = 'company',
      data_source_urls = ARRAY(
        SELECT DISTINCT source_url
        FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY[
          'https://docs.datadoghq.com/agent/',
          'https://docs.datadoghq.com/getting_started/agent/',
          'https://github.com/DataDog/datadog-agent',
          'https://github.com/DataDog/datadog-agent/blob/main/LICENSE'
        ]::text[]) AS sources(source_url)
        WHERE source_url IS NOT NULL
        ORDER BY source_url
      ),
      updated_at = now()
  WHERE a.id = '0354b086-a7b6-49ad-8154-4753d08ccab3'::uuid
    AND a.slug = 'dd-agent'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.name IS NOT DISTINCT FROM 'dd-agent'
    AND a.summary IS NOT DISTINCT FROM 'Datadog is a monitoring service for cloud-scale applications, providing monitoring of servers, databases, tools, and services, through a SaaS-based data.'
    AND a.website_url IS NOT DISTINCT FROM 'https://www.datadoghq.com/'
    AND a.docs_url IS NOT DISTINCT FROM NULL
    AND a.install_docs_url IS NOT DISTINCT FROM NULL
    AND a.publisher_name IS NOT DISTINCT FROM 'dd-agent'
    AND a.publisher_type IS NOT DISTINCT FROM 'unknown'
    AND a.docker_image IS NOT DISTINCT FROM 'registry.datadoghq.com/agent:latest'
    AND a.source_model IS NOT DISTINCT FROM 'closed_source'
    AND a.source_code_url IS NOT DISTINCT FROM NULL
    AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
    AND a.license IS NOT DISTINCT FROM NULL
    AND a.license_type IS NOT DISTINCT FROM 'unknown'
    AND a.license_spdx_id IS NOT DISTINCT FROM NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Datadog Agent identity guard failed for dd-agent';
  END IF;
END $$;

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT *
    FROM (VALUES
    ('7d06a06c-8c78-4fd5-a846-9147a85fdda2'::uuid, 'daredoessnapcast'::text, 'open_source'::text, 'https://github.com/daredoes/docker-snapcast'::text, 'github'::text, 'MIT (container wrapper); GNU GPL v3.0 or later (Snapcast); MIT (librespot)'::text, 'mixed'::text, NULL::text, ARRAY['https://forums.unraid.net/topic/119582-support-daredoes-snapcast/', 'https://github.com/daredoes/docker-snapcast', 'https://github.com/daredoes/docker-snapcast/blob/master/LICENSE', 'https://github.com/snapcast/snapcast', 'https://github.com/snapcast/snapcast/blob/develop/LICENSE', 'https://github.com/librespot-org/librespot']::text[]),
    ('b1e10f26-2ebe-42ad-a3f7-72c7b6d92481'::uuid, 'data-volume-monitor-dvm-for-unraid'::text, 'open_source'::text, 'https://github.com/desertwitch/DVM-unRAID'::text, 'github'::text, 'GNU General Public License v2.0'::text, 'copyleft'::text, 'GPL-2.0-only', ARRAY['https://github.com/desertwitch/DVM-unRAID']::text[]),
    ('426af06d-6638-44dc-8b38-8ce1fc173bef'::uuid, 'dato'::text, 'open_source'::text, 'https://framagit.org/squeak/dato'::text, 'framagit'::text, 'GNU Affero General Public License v3.0 or later'::text, 'copyleft'::text, 'AGPL-3.0-or-later', ARRAY['https://framagit.org/squeak/dato', 'https://apps.yunohost.org/app/dato']::text[]),
    ('0354b086-a7b6-49ad-8154-4753d08ccab3'::uuid, 'dd-agent'::text, 'open_source'::text, 'https://github.com/DataDog/datadog-agent'::text, 'github'::text, 'Apache License 2.0 (user-space components); GNU General Public License v2.0 (BPF code)'::text, 'mixed'::text, NULL::text, ARRAY['https://docs.datadoghq.com/agent/', 'https://docs.datadoghq.com/getting_started/agent/', 'https://github.com/DataDog/datadog-agent', 'https://github.com/DataDog/datadog-agent/blob/main/LICENSE']::text[]),
    ('d6c3c8c6-f830-4a70-bd59-3d86654014de'::uuid, 'ddnet'::text, 'open_source'::text, 'https://github.com/ddnet/ddnet'::text, 'github'::text, 'Custom permissive DDNet license; bundled game data, fonts, and third-party libraries have separate licenses'::text, 'custom'::text, NULL::text, ARRAY['https://github.com/ddnet/ddnet', 'https://github.com/ddnet/ddnet/blob/master/license.txt']::text[]),
    ('4a042037-0206-4265-b6ae-082ac66ac401'::uuid, 'debian-apt-mirror'::text, 'open_source'::text, 'https://github.com/apt-mirror/apt-mirror'::text, 'github'::text, 'GNU General Public License v2.0 or later'::text, 'copyleft'::text, 'GPL-2.0-or-later', ARRAY['https://github.com/apt-mirror/apt-mirror']::text[]),
    ('de662e15-3b84-4ca8-bf30-d6f9a7a257fb'::uuid, 'derbynet-server'::text, 'open_source'::text, 'https://github.com/jeffpiazza/derbynet'::text, 'github'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://github.com/jeffpiazza/derbynet']::text[]),
    ('52f940ac-8e62-4d55-abbc-b82b5872efb9'::uuid, 'diacamma'::text, 'open_source'::text, 'https://github.com/Diacamma2/asso'::text, 'github'::text, 'GNU General Public License v3.0 or later'::text, 'copyleft'::text, 'GPL-3.0-or-later', ARRAY['https://github.com/Diacamma2/asso', 'https://apps.yunohost.org/app/diacamma']::text[]),
    ('b5ccde12-5eb4-4dd6-8f9a-4e5f0f4ed0da'::uuid, 'diagnostickoeur'::text, 'open_source'::text, 'https://framagit.org/stickoeur/diagnostickoeur'::text, 'framagit'::text, 'GNU General Public License v3.0 or later'::text, 'copyleft'::text, 'GPL-3.0-or-later', ARRAY['https://framagit.org/stickoeur/diagnostickoeur', 'https://apps.yunohost.org/app/diagnostickoeur']::text[]),
    ('400c217e-e95d-4b06-bd01-1482a8c7f4d6'::uuid, 'discord-tickets'::text, 'open_source'::text, 'https://github.com/discord-tickets/bot'::text, 'github'::text, 'GNU General Public License v3.0 or later'::text, 'copyleft'::text, 'GPL-3.0-or-later', ARRAY['https://github.com/discord-tickets/bot']::text[]),
    ('5e498051-2b3e-4e6d-92ad-cebd41f08c2d'::uuid, 'discordgsm'::text, 'open_source'::text, 'https://github.com/DiscordGSM/GameServerMonitor'::text, 'github'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://github.com/DiscordGSM/GameServerMonitor']::text[]),
    ('43a0730a-f283-46bf-8ddf-abd904ea26fd'::uuid, 'docker-swarm-visualizer'::text, 'open_source'::text, 'https://github.com/sammonsempes/DockerSwarmVisualizer'::text, 'github'::text, 'Apache License 2.0'::text, 'permissive'::text, 'Apache-2.0', ARRAY['https://github.com/sammonsempes/DockerSwarmVisualizer']::text[]),
    ('bc1ee18e-a4f0-4286-83f2-1f18dfef1d7c'::uuid, 'docpht'::text, 'open_source'::text, 'https://github.com/docpht/docpht'::text, 'github'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://github.com/docpht/docpht']::text[]),
    ('e09c0333-7a2d-4c79-a95f-f40bee4c54aa'::uuid, 'doge-node'::text, 'open_source'::text, 'https://github.com/dogecoin/dogecoin'::text, 'github'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://github.com/dogecoin/dogecoin']::text[]),
    ('78647c47-4610-4d21-87d9-be0123c17445'::uuid, 'dont-code'::text, 'open_source'::text, 'https://github.com/dont-code/dont-code'::text, 'github'::text, 'GNU Affero General Public License v3.0 or later'::text, 'copyleft'::text, 'AGPL-3.0-or-later', ARRAY['https://github.com/dont-code/dont-code', 'https://apps.yunohost.org/app/dont-code']::text[]),
    ('049ba303-78df-499c-a57c-c89611ca140a'::uuid, 'dotclear2'::text, 'open_source'::text, 'https://github.com/dotclear/dotclear'::text, 'github'::text, 'GNU Affero General Public License v3.0 or later'::text, 'copyleft'::text, 'AGPL-3.0-or-later', ARRAY['https://github.com/dotclear/dotclear']::text[]),
    ('71bcb9b7-f096-4c31-9564-e30b827aaec6'::uuid, 'drupal-cms'::text, 'open_source'::text, 'https://git.drupalcode.org/project/drupal_cms'::text, 'gitlab'::text, 'GNU General Public License v2.0 or later'::text, 'copyleft'::text, 'GPL-2.0-or-later', ARRAY['https://git.drupalcode.org/project/drupal_cms', 'https://www.drupal.org/about/licensing']::text[]),
    ('1f3c84a7-cb7d-4ea5-a4fc-41ad0e484afd'::uuid, 'duniter'::text, 'open_source'::text, 'https://git.duniter.org/nodes/typescript/duniter'::text, 'gitlab'::text, 'GNU Affero General Public License v3.0 or later'::text, 'copyleft'::text, 'AGPL-3.0-or-later', ARRAY['https://git.duniter.org/nodes/typescript/duniter', 'https://apps.yunohost.org/app/duniter']::text[]),
    ('80114412-4eaa-45d6-a2b7-f709d82de192'::uuid, 'easy-rsync'::text, 'open_source'::text, 'https://github.com/Teknicallity/easy-rsync'::text, 'github'::text, 'GNU Affero General Public License v3.0'::text, 'copyleft'::text, 'AGPL-3.0-only', ARRAY['https://github.com/Teknicallity/easy-rsync']::text[]),
    ('cb449726-21e3-4bdf-9f23-da4c6029490f'::uuid, 'elastic-search'::text, 'source_available'::text, 'https://github.com/elastic/elasticsearch'::text, 'github'::text, 'Default distribution: Elastic License 2.0; free source components: AGPL-3.0-only, SSPL-1.0, or ELv2, unless a file header says otherwise; X-Pack code is ELv2-only.'::text, 'mixed'::text, NULL::text, ARRAY['https://github.com/elastic/elasticsearch', 'https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt', 'https://www.elastic.co/pricing/faq/licensing']::text[]),
    ('ea72914a-2bda-4e34-a406-b44efe3af208'::uuid, 'emailengine'::text, 'source_available'::text, 'https://github.com/postalsys/emailengine'::text, 'github'::text, 'EmailEngine License Agreement v2.1'::text, 'custom'::text, NULL::text, ARRAY['https://github.com/postalsys/emailengine', 'https://github.com/postalsys/emailengine/blob/master/LICENSE_EMAILENGINE.txt']::text[]),
    ('6dfec059-8191-4d6e-ba8b-03924bec8332'::uuid, 'emailpoubelle'::text, 'open_source'::text, 'https://framagit.org/kepon/emailPoubellePhp'::text, 'framagit'::text, 'Beerware License'::text, 'permissive'::text, 'Beerware', ARRAY['https://framagit.org/kepon/emailPoubellePhp', 'https://apps.yunohost.org/app/emailpoubelle']::text[]),
    ('fac40859-c768-4f16-9fd4-3132395a5bf7'::uuid, 'embywrapped'::text, 'open_source'::text, 'https://github.com/CtznSniiips/emby-wrapped'::text, 'github'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://github.com/CtznSniiips/emby-wrapped']::text[]),
    ('7edb852b-0de4-44c4-92bf-40c29fc9d54d'::uuid, 'faceprivacy'::text, 'open_source'::text, 'https://forge.apps.education.fr/faceprivacy/app'::text, 'gitlab'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://forge.apps.education.fr/faceprivacy/app', 'https://apps.yunohost.org/app/faceprivacy']::text[]),
    ('e10ab635-97db-456e-b840-d23ebc68cb32'::uuid, 'facturascripts'::text, 'open_source'::text, 'https://github.com/NeoRazorX/facturascripts'::text, 'github'::text, 'GNU Lesser General Public License v3.0 or later'::text, 'copyleft'::text, 'LGPL-3.0-or-later', ARRAY['https://github.com/NeoRazorX/facturascripts']::text[]),
    ('b0c689c6-9656-49bb-82ed-469cadc5830d'::uuid, 'feishin'::text, 'open_source'::text, 'https://github.com/jeffvli/feishin'::text, 'github'::text, 'GNU General Public License v3.0'::text, 'copyleft'::text, 'GPL-3.0-only', ARRAY['https://github.com/jeffvli/feishin', 'https://github.com/jeffvli/feishin/blob/development/LICENSE']::text[]),
    ('617258ea-695e-4922-be9f-e74da077c36d'::uuid, 'fivefilters-full-text-rss'::text, 'open_source'::text, 'https://bitbucket.org/fivefilters/full-text-rss'::text, 'other'::text, 'GNU Affero General Public License v3.0 or later'::text, 'copyleft'::text, 'AGPL-3.0-or-later', ARRAY['https://bitbucket.org/fivefilters/full-text-rss', 'https://forum.fivefilters.org/t/license-question/350', 'https://www.fivefilters.org/full-text-rss/']::text[]),
    ('d9bb3755-6f81-4f62-a8eb-6477ed2768e1'::uuid, 'flash-backup'::text, 'open_source'::text, 'https://github.com/jcofer555/flash-backup'::text, 'github'::text, 'GNU General Public License v2.0'::text, 'copyleft'::text, 'GPL-2.0-only', ARRAY['https://github.com/jcofer555/flash-backup']::text[]),
    ('b2af9d44-f9e6-4642-b471-5a2b21509a7b'::uuid, 'fogproject'::text, 'open_source'::text, 'https://github.com/FOGProject/fogproject'::text, 'github'::text, 'GNU General Public License v3.0'::text, 'copyleft'::text, 'GPL-3.0-only', ARRAY['https://github.com/FOGProject/fogproject']::text[]),
    ('cba24832-422a-4f68-8f4d-202d079b6d63'::uuid, 'folderframe'::text, 'open_source'::text, 'https://github.com/The-Grog/FolderFrame'::text, 'github'::text, 'MIT License'::text, 'permissive'::text, 'MIT', ARRAY['https://github.com/The-Grog/FolderFrame']::text[]),
    ('f11df3a0-656c-4917-bb29-8d8f325c1e77'::uuid, 'forgejo-runner'::text, 'open_source'::text, 'https://code.forgejo.org/forgejo/runner'::text, 'forgejo'::text, 'GNU General Public License v3.0 or later'::text, 'copyleft'::text, 'GPL-3.0-or-later', ARRAY['https://code.forgejo.org/forgejo/runner']::text[]),
    ('86c5dcec-f18e-4f93-b296-e90c8a798662'::uuid, 'framaforms'::text, 'open_source'::text, 'https://framagit.org/yakforms/yakforms'::text, 'framagit'::text, 'GNU General Public License v2.0'::text, 'copyleft'::text, 'GPL-2.0-only', ARRAY['https://framaforms.org/', 'https://framagit.org/yakforms/yakforms']::text[]),
    ('21eceb8b-adcf-4fab-a574-febd39884706'::uuid, 'framagames'::text, 'open_source'::text, 'https://framagit.org/framasoft/framagames'::text, 'framagit'::text, 'GNU Affero General Public License v3.0'::text, 'copyleft'::text, 'AGPL-3.0-only', ARRAY['https://framagit.org/framasoft/framagames', 'https://apps.yunohost.org/app/framagames']::text[])
    ) AS corrections(id, slug, source_model, source_code_url, source_code_host, license, license_type, license_spdx_id, source_urls)
  LOOP
    UPDATE public.self_host_apps AS a
    SET source_model = r.source_model::public.self_host_app_source_model,
        source_code_url = r.source_code_url,
        source_code_host = r.source_code_host,
        license = r.license,
        license_type = r.license_type::public.self_host_app_license_type,
        license_spdx_id = r.license_spdx_id,
        source_checked_at = now(),
        data_source_urls = ARRAY(
          SELECT DISTINCT source_url
          FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || r.source_urls) AS sources(source_url)
          WHERE source_url IS NOT NULL
          ORDER BY source_url
        ),
        technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
          'source', jsonb_build_object(
            'status', 'published',
            'checked_at', CURRENT_DATE,
            'confidence', 'high',
            'source_urls', to_jsonb(r.source_urls)
          ),
          'license', jsonb_build_object(
            'status', 'published',
            'checked_at', CURRENT_DATE,
            'confidence', 'high',
            'source_urls', to_jsonb(r.source_urls)
          )
        ),
        updated_at = now()
    WHERE a.id = r.id
      AND a.slug = r.slug
      AND a.published IS NOT DISTINCT FROM TRUE
      AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
      AND a.source_model IS NOT DISTINCT FROM 'closed_source'
      AND a.source_code_url IS NOT DISTINCT FROM NULL
      AND a.source_code_host IS NOT DISTINCT FROM 'unknown'
      AND a.license IS NOT DISTINCT FROM NULL
      AND a.license_type IS NOT DISTINCT FROM 'unknown'
      AND a.license_spdx_id IS NOT DISTINCT FROM NULL;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Source review guard failed for %', r.slug;
    END IF;
  END LOOP;
END $$;

COMMIT;
