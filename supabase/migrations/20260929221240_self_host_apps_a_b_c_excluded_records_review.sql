-- Source review: A/B/C install batch exclusions, checked 2026-09-30.
-- Snapshot guards make this migration fail if any reviewed row has changed.

begin;

do $migration$
declare
  affected_rows integer;
begin
  update public.self_host_apps as a
  set install_docs_url = 'https://ca.unraid.net/apps/accept-bot-0b1aurb03y2akb',
      docker_url = 'https://ghcr.io/brockbreacher/accept-bot',
      docker_image = 'ghcr.io/brockbreacher/accept-bot:latest',
      deployment_methods = array['docker', 'unraid']::text[],
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://cardboards.net/accept-bot/',
          'https://ca.unraid.net/apps/accept-bot-0b1aurb03y2akb',
          'https://ghcr.io/brockbreacher/accept-bot',
          'https://github.com/brockbreacher/join-bot-unraid',
          'https://raw.githubusercontent.com/brockbreacher/join-bot-unraid/main/acceptbot-docker.xml'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'docker', jsonb_build_object(
          'status', 'published', 'checked_at', '2026-09-30', 'confidence', 'high',
          'note', 'The publisher-maintained Unraid template uses this GHCR image.',
          'source_urls', jsonb_build_array(
            'https://github.com/brockbreacher/join-bot-unraid',
            'https://raw.githubusercontent.com/brockbreacher/join-bot-unraid/main/acceptbot-docker.xml',
            'https://ghcr.io/brockbreacher/accept-bot'
          )
        ),
        'docker_image', jsonb_build_object(
          'status', 'published', 'checked_at', '2026-09-30', 'confidence', 'high',
          'note', 'The official Unraid package names the GHCR image and tag.',
          'source_urls', jsonb_build_array(
            'https://ca.unraid.net/apps/accept-bot-0b1aurb03y2akb',
            'https://raw.githubusercontent.com/brockbreacher/join-bot-unraid/main/acceptbot-docker.xml'
          )
        )
      ),
      updated_at = now()
  where a.id = '367eb989-b5a7-440d-b894-9e92f03df8ff'::uuid
    and a.slug = 'accept-bot'
    and a.name = 'Accept-Bot'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'https://cardboards.net/accept-bot/'
    and a.install_docs_url is not distinct from 'https://github.com/brockbreacher/accept-bot'
    and a.docker_support is not distinct from 'official'
    and a.docker_url is null
    and a.docker_image is null
    and a.compose_support is not distinct from false
    and a.compose_url is null
    and a.deployment_methods is not distinct from array['docker']::text[]
    and a.updated_at is not distinct from '2026-09-29 16:37:00.657158+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for accept-bot app row (updated % rows)', affected_rows;
  end if;

  update public.self_host_app_install_options as io
  set docker_urls = array['https://ghcr.io/brockbreacher/accept-bot']::text[],
      docker_images = array['ghcr.io/brockbreacher/accept-bot:latest']::text[],
      unraid_urls = array['https://ca.unraid.net/apps/accept-bot-0b1aurb03y2akb']::text[],
      source_urls = array[
        'https://ca.unraid.net/apps/accept-bot-0b1aurb03y2akb',
        'https://github.com/brockbreacher/join-bot-unraid',
        'https://raw.githubusercontent.com/brockbreacher/join-bot-unraid/main/acceptbot-docker.xml'
      ]::text[],
      options = '[
        {"method":"docker","label":"Official Docker image","url":"https://ghcr.io/brockbreacher/accept-bot","image":"ghcr.io/brockbreacher/accept-bot:latest","support_level":"official","source_url":"https://raw.githubusercontent.com/brockbreacher/join-bot-unraid/main/acceptbot-docker.xml","note":"The publisher-maintained Unraid template supplies the image and configuration.","sort_order":10},
        {"method":"unraid","label":"Unraid Community Apps","url":"https://ca.unraid.net/apps/accept-bot-0b1aurb03y2akb","image":"ghcr.io/brockbreacher/accept-bot:latest","support_level":"official","source_url":"https://raw.githubusercontent.com/brockbreacher/join-bot-unraid/main/acceptbot-docker.xml","note":"The publisher template configures the bot token and persistent role-data path.","sort_order":20}
      ]'::jsonb,
      checked_at = '2026-09-30'::date,
      updated_at = now()
  where io.app_id = '367eb989-b5a7-440d-b894-9e92f03df8ff'::uuid
    and io.options is not distinct from '[]'::jsonb
    and io.docker_urls is not distinct from array[]::text[]
    and io.docker_images is not distinct from array[]::text[]
    and io.unraid_urls is not distinct from array[]::text[]
    and io.updated_at is not distinct from '2026-09-29 16:37:00.657158+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for accept-bot install options row (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set published = false,
      self_hosting_status = 'not_self_hostable',
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://altcha.org/docs/integration/quick-start/',
          'https://altcha.org/docs/sentinel/install/'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      updated_at = now()
  where a.id = '6d380385-a3c8-41a2-9d66-fb6427660840'::uuid
    and a.slug = 'altcha'
    and a.name = 'ALTCHA'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'https://altcha.org'
    and a.install_docs_url is not distinct from 'https://altcha.org/docs/v2/server-integration'
    and a.deployment_methods is not distinct from array[]::text[]
    and a.updated_at is not distinct from '2026-09-28 19:10:59.526716+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for altcha (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set published = false,
      self_hosting_status = 'not_self_hostable',
      install_docs_url = 'https://amical.ai/docs/quick-start',
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://amical.ai/docs/',
          'https://amical.ai/docs/quick-start'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      updated_at = now()
  where a.id = '63e32807-ae38-4c3a-a9bf-b51ba3709af9'::uuid
    and a.slug = 'amical'
    and a.name = 'Amical'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'https://amical.ai'
    and a.install_docs_url is not distinct from 'https://amical.ai/docs'
    and a.deployment_methods is not distinct from array[]::text[]
    and a.updated_at is not distinct from '2026-09-29 08:45:07.555887+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for amical (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set published = false,
      self_hosting_status = 'not_self_hostable',
      install_docs_url = 'https://docs.anarlog.so/desktop-installation',
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://anarlog.so/download/',
          'https://docs.anarlog.so/desktop-installation',
          'https://github.com/fastrepl/anarlog/blob/main/docs/installation.mdx'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      updated_at = now()
  where a.id = 'dba706d2-c8bf-4b5f-9055-30859c32dcc8'::uuid
    and a.slug = 'anarlog'
    and a.name = 'Anarlog'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'https://anarlog.so'
    and a.install_docs_url is not distinct from 'https://github.com/fastrepl/anarlog/blob/main/docs/installation.mdx'
    and a.deployment_methods is not distinct from array[]::text[]
    and a.updated_at is not distinct from '2026-09-28 19:11:11.777392+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for anarlog (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set website_url = 'https://marmelab.com/atomic-crm/',
      deployment_methods = array['native']::text[],
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://marmelab.com/atomic-crm/',
          'https://github.com/marmelab/atomic-crm#readme'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      updated_at = now()
  where a.id = '3e20e24e-fa86-4a31-b91a-5b47dcf6ef95'::uuid
    and a.slug = 'atomic-crm'
    and a.name = 'Atomic CRM'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'http://marmelab.com/atomic-crm'
    and a.install_docs_url is not distinct from 'https://github.com/marmelab/atomic-crm#readme'
    and a.deployment_methods is not distinct from array[]::text[]
    and a.updated_at is not distinct from '2026-09-28 19:11:35.514955+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for atomic-crm (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set website_url = 'https://audiomass.co/',
      install_docs_url = 'https://github.com/pkalogiros/AudioMass#getting-it-to-run',
      deployment_methods = array['native']::text[],
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://audiomass.co/',
          'https://github.com/pkalogiros/AudioMass#getting-it-to-run'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      updated_at = now()
  where a.id = '23bc75ce-e36c-4671-8aef-d43c50fd4a63'::uuid
    and a.slug = 'audiomass'
    and a.name = 'AudioMass'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is null
    and a.install_docs_url is not distinct from 'https://github.com/pkalogiros/AudioMass'
    and a.deployment_methods is not distinct from array[]::text[]
    and a.updated_at is not distinct from '2026-09-28 19:11:41.463775+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for audiomass (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set published = false,
      self_hosting_status = 'unknown',
      website_url = 'https://authman.simular.co/',
      docs_url = 'https://authman.simular.co/docs/',
      install_docs_url = null,
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://authman.simular.co/',
          'https://authman.simular.co/docs/',
          'https://authman.simular.co/privacy-policy.html',
          'https://github.com/simular/authman-app',
          'https://github.com/simular/authman-server'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      updated_at = now()
  where a.id = 'a78e229a-3a0b-46b0-9db4-b00ead24b6b6'::uuid
    and a.slug = 'authman'
    and a.name = 'Authman'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'https://github.com/simular/authman-server'
    and a.docs_url is not distinct from 'https://github.com/simular/authman-server#readme'
    and a.install_docs_url is not distinct from 'https://github.com/simular/authman-server#readme'
    and a.deployment_methods is not distinct from array[]::text[]
    and a.updated_at is not distinct from '2026-09-28 19:11:47.479034+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for authman (updated % rows)', affected_rows;
  end if;

  update public.self_host_apps as a
  set published = false,
      self_hosting_status = 'not_self_hostable',
      install_docs_url = null,
      docker_support = 'none',
      compose_support = false,
      deployment_methods = array[]::text[],
      data_source_urls = array(
        select distinct source_url
        from unnest(coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://github.com/awesome-foss/awesome-sysadmin#readme',
          'https://sysadmin.awesome-selfhosted.net/'
        ]::text[]) as sources(source_url)
        where source_url is not null
        order by source_url
      ),
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
        'docker', jsonb_build_object(
          'status', 'not_published', 'checked_at', '2026-09-30', 'confidence', 'high',
          'note', 'The project is a curated sysadmin resource list, not an app with a Docker deployment.',
          'source_urls', jsonb_build_array('https://github.com/awesome-foss/awesome-sysadmin#readme')
        ),
        'docker_image', jsonb_build_object(
          'status', 'not_published', 'checked_at', '2026-09-30', 'confidence', 'high',
          'note', 'The project is a curated resource list, not an installable app image.',
          'source_urls', jsonb_build_array('https://github.com/awesome-foss/awesome-sysadmin#readme')
        ),
        'compose', jsonb_build_object(
          'status', 'not_published', 'checked_at', '2026-09-30', 'confidence', 'high',
          'note', 'The project is a curated resource list, not an app with a Compose deployment.',
          'source_urls', jsonb_build_array('https://github.com/awesome-foss/awesome-sysadmin#readme')
        )
      ),
      updated_at = now()
  where a.id = 'a68a639e-6682-412d-9106-373e5ca33a21'::uuid
    and a.slug = 'awesome-sysadmin'
    and a.name = 'Awesome Sysadmin'
    and a.published is true
    and a.self_hosting_status is not distinct from 'self_hostable'
    and a.website_url is not distinct from 'https://sysadmin.awesome-selfhosted.net'
    and a.install_docs_url is not distinct from 'https://github.com/awesome-foss/awesome-sysadmin#readme'
    and a.docker_support is not distinct from 'official'
    and a.docker_url is null
    and a.docker_image is null
    and a.compose_url is null
    and a.deployment_methods is not distinct from array['docker']::text[]
    and a.technical_fact_status->'docker'->>'status' is not distinct from 'published'
    and a.updated_at is not distinct from '2026-09-29 08:45:07.555887+00'::timestamptz;
  get diagnostics affected_rows = row_count;
  if affected_rows <> 1 then
    raise exception 'Snapshot guard failed for awesome-sysadmin (updated % rows)', affected_rows;
  end if;
end;
$migration$;

commit;
