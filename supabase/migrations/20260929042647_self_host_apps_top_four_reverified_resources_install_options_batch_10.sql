begin;

-- Recheck first-party deployment, licensing, and database details for four widely used apps.
update public.self_host_apps a
set website_url = case a.slug
      when 'stirling-pdf' then 'https://stirling.com/'
      when 'uptime-kuma' then 'https://uptime.kuma.pet/'
      when 'home-assistant' then 'https://www.home-assistant.io/'
      when 'syncthing' then 'https://syncthing.net/'
    end,
    source_code_url = case a.slug
      when 'stirling-pdf' then 'https://github.com/Stirling-Tools/Stirling-PDF'
      else a.source_code_url
    end,
    docs_url = case a.slug
      when 'stirling-pdf' then 'https://docs.stirlingpdf.com/'
      when 'uptime-kuma' then 'https://github.com/louislam/uptime-kuma/wiki'
      when 'home-assistant' then 'https://www.home-assistant.io/docs/'
      when 'syncthing' then 'https://docs.syncthing.net/'
    end,
    install_docs_url = case a.slug
      when 'stirling-pdf' then 'https://docs.stirlingpdf.com/Installation/Docker%20Install/'
      when 'uptime-kuma' then 'https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install'
      when 'home-assistant' then 'https://www.home-assistant.io/installation/linux'
      when 'syncthing' then 'https://github.com/syncthing/syncthing/blob/main/README-Docker.md'
    end,
    docker_url = case a.slug
      when 'stirling-pdf' then 'https://hub.docker.com/r/stirlingtools/stirling-pdf'
      when 'uptime-kuma' then 'https://hub.docker.com/r/louislam/uptime-kuma'
      when 'home-assistant' then 'https://github.com/home-assistant/core/pkgs/container/home-assistant'
      when 'syncthing' then 'https://hub.docker.com/r/syncthing/syncthing'
    end,
    docker_image = case a.slug
      when 'stirling-pdf' then 'stirlingtools/stirling-pdf:latest'
      when 'uptime-kuma' then 'louislam/uptime-kuma:2'
      when 'home-assistant' then 'ghcr.io/home-assistant/home-assistant:stable'
      when 'syncthing' then 'syncthing/syncthing:latest'
    end,
    compose_url = case a.slug
      when 'stirling-pdf' then 'https://docs.stirlingpdf.com/Installation/Docker%20Install/'
      when 'uptime-kuma' then 'https://github.com/louislam/uptime-kuma/blob/master/compose.yaml'
      when 'home-assistant' then null
      when 'syncthing' then 'https://github.com/syncthing/syncthing/blob/main/README-Docker.md'
    end,
    docker_support = 'official',
    compose_support = true,
    deployment_methods = array['docker', 'compose']::text[],
    requires_database = false,
    database_types = case a.slug
      when 'home-assistant' then array['sqlite', 'mariadb', 'mysql', 'postgres']::text[]
      when 'uptime-kuma' then array['sqlite']::text[]
      else array[]::text[]
    end,
    source_model = case when a.slug = 'stirling-pdf' then 'source_available'::public.self_host_app_source_model else a.source_model end,
    license = case
      when a.slug = 'stirling-pdf' then 'MIT for core files; engine and listed modules use separate licenses'
      else a.license
    end,
    license_type = case when a.slug = 'stirling-pdf' then 'custom'::public.self_host_app_license_type else a.license_type end,
    license_spdx_id = case when a.slug = 'stirling-pdf' then null else a.license_spdx_id end,
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(
        coalesce(a.data_source_urls, array[]::text[])
        || case a.slug
          when 'stirling-pdf' then array[
            'https://docs.stirlingpdf.com/Installation/Docker%20Install/',
            'https://docs.stirlingpdf.com/Production-Deployment-Guide/',
            'https://github.com/Stirling-Tools/Stirling-PDF',
            'https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE',
            'https://github.com/Stirling-Tools/Stirling-PDF/blob/main/engine/LICENSE',
            'https://hub.docker.com/r/stirlingtools/stirling-pdf'
          ]::text[]
          when 'uptime-kuma' then array[
            'https://github.com/louislam/uptime-kuma/blob/master/LICENSE',
            'https://github.com/louislam/uptime-kuma/blob/master/compose.yaml',
            'https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install',
            'https://hub.docker.com/r/louislam/uptime-kuma'
          ]::text[]
          when 'home-assistant' then array[
            'https://github.com/home-assistant/core',
            'https://github.com/home-assistant/core/blob/dev/LICENSE',
            'https://github.com/home-assistant/core/pkgs/container/home-assistant',
            'https://www.home-assistant.io/installation/linux',
            'https://www.home-assistant.io/integrations/recorder/'
          ]::text[]
          else array[
            'https://github.com/syncthing/syncthing',
            'https://github.com/syncthing/syncthing/blob/main/README-Docker.md',
            'https://github.com/syncthing/syncthing/blob/main/README.md',
            'https://hub.docker.com/r/syncthing/syncthing'
          ]::text[]
        end
      ) as sources(source_url)
      where source_url is not null
    ),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'publisher', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', 'Publisher identity checked against the official project site or repository.',
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/blob/master/LICENSE')
          when 'home-assistant' then jsonb_build_array('https://www.openhomefoundation.org/')
          else jsonb_build_array('https://syncthing.net/')
        end
      ),
      'source_model', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case when a.slug = 'stirling-pdf' then 'The project describes itself as open-core; the main MIT license excludes engine and other separately licensed modules.' else 'Source model checked against the official project repository.' end,
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://github.com/Stirling-Tools/Stirling-PDF', 'https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE', 'https://github.com/Stirling-Tools/Stirling-PDF/blob/main/engine/LICENSE')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma')
          when 'home-assistant' then jsonb_build_array('https://github.com/home-assistant/core')
          else jsonb_build_array('https://github.com/syncthing/syncthing')
        end
      ),
      'license', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case when a.slug = 'stirling-pdf' then 'The root license is MIT outside named subdirectories; engine and listed modules have separate licenses.' else 'License checked against the official source repository.' end,
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE', 'https://github.com/Stirling-Tools/Stirling-PDF/blob/main/engine/LICENSE')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/blob/master/LICENSE')
          when 'home-assistant' then jsonb_build_array('https://github.com/home-assistant/core/blob/dev/LICENSE')
          else jsonb_build_array('https://github.com/syncthing/syncthing/blob/main/README.md')
        end
      ),
      'docker', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', 'Official project instructions link to this Docker deployment.',
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://docs.stirlingpdf.com/Installation/Docker%20Install/')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install')
          when 'home-assistant' then jsonb_build_array('https://www.home-assistant.io/installation/linux')
          else jsonb_build_array('https://github.com/syncthing/syncthing/blob/main/README-Docker.md')
        end
      ),
      'docker_image', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', 'Image name and publisher checked against the project install instructions or registry.',
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://docs.stirlingpdf.com/Installation/Docker%20Install/', 'https://hub.docker.com/r/stirlingtools/stirling-pdf')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install', 'https://hub.docker.com/r/louislam/uptime-kuma')
          when 'home-assistant' then jsonb_build_array('https://www.home-assistant.io/installation/linux', 'https://github.com/home-assistant/core/pkgs/container/home-assistant')
          else jsonb_build_array('https://github.com/syncthing/syncthing/blob/main/README-Docker.md', 'https://hub.docker.com/r/syncthing/syncthing')
        end
      ),
      'compose', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case when a.slug = 'home-assistant' then 'The app also has a community Umbrel Compose package; the publisher install guide documents Docker Container.' else 'Official project Docker Compose instructions were checked.' end,
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://docs.stirlingpdf.com/Installation/Docker%20Install/')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/blob/master/compose.yaml')
          when 'home-assistant' then jsonb_build_array('https://www.home-assistant.io/installation/linux', 'https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/home-assistant/docker-compose.yml')
          else jsonb_build_array('https://github.com/syncthing/syncthing/blob/main/README-Docker.md')
        end
      ),
      'database', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case a.slug
          when 'home-assistant' then 'SQLite is the default recorder database; MariaDB, MySQL, and PostgreSQL are also supported.'
          when 'uptime-kuma' then 'The app stores its data in its local SQLite-backed data directory; a separate database service is not required.'
          else 'The official deployment instructions do not require a separate database service.'
        end,
        'source_urls', case a.slug
          when 'home-assistant' then jsonb_build_array('https://www.home-assistant.io/integrations/recorder/')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install')
          else jsonb_build_array(a.install_docs_url)
        end
      ),
      'ram', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', case when a.slug = 'stirling-pdf' then 'high' else 'medium' end,
        'note', 'Estimated small self-hosted setup; range is labeled Est. RAM in the directory.',
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://docs.stirlingpdf.com/Production-Deployment-Guide/')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install')
          when 'home-assistant' then jsonb_build_array('https://www.home-assistant.io/installation/linux', 'https://www.home-assistant.io/integrations/recorder/')
          else jsonb_build_array('https://github.com/syncthing/syncthing/blob/main/README-Docker.md')
        end
      ),
      'storage', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', case when a.slug = 'stirling-pdf' then 'high' else 'medium' end,
        'note', 'Estimated small self-hosted setup; range is labeled Est. Storage in the directory.',
        'source_urls', case a.slug
          when 'stirling-pdf' then jsonb_build_array('https://docs.stirlingpdf.com/Production-Deployment-Guide/')
          when 'uptime-kuma' then jsonb_build_array('https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install')
          when 'home-assistant' then jsonb_build_array('https://www.home-assistant.io/integrations/recorder/')
          else jsonb_build_array('https://github.com/syncthing/syncthing/blob/main/README-Docker.md')
        end
      )
    ),
    technical_facts_checked_at = now(),
    updated_at = now()
where a.slug in ('stirling-pdf', 'uptime-kuma', 'home-assistant', 'syncthing')
  and a.published is true
  and a.self_hosting_status = 'self_hostable';

-- Keep RAM and storage as estimates for a typical small deployment, with app-specific ranges and basis.
update public.self_host_app_resource_estimates r
set ram_estimate_min_mb = case a.slug when 'stirling-pdf' then 2048 when 'uptime-kuma' then 256 when 'home-assistant' then 2048 else 256 end,
    ram_estimate_max_mb = case a.slug when 'stirling-pdf' then 4096 when 'uptime-kuma' then 2048 when 'home-assistant' then 4096 else 2048 end,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = case when a.slug = 'stirling-pdf' then 'high' else 'medium' end,
    ram_estimate_basis = case a.slug
      when 'stirling-pdf' then 'Publisher production guidance starts at 2 GB RAM and recommends 4 GB.'
      when 'uptime-kuma' then 'Estimate for a small monitor set; active checks and browser-based probes affect memory use.'
      when 'home-assistant' then 'Estimate for Home Assistant Container with a small set of integrations and its default recorder.'
      else 'Estimate for a small Syncthing node; the number of indexed files affects memory use.'
    end,
    ram_source_urls = case a.slug
      when 'stirling-pdf' then array['https://docs.stirlingpdf.com/Production-Deployment-Guide/']::text[]
      when 'uptime-kuma' then array['https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install']::text[]
      when 'home-assistant' then array['https://www.home-assistant.io/installation/linux', 'https://www.home-assistant.io/integrations/recorder/']::text[]
      else array['https://github.com/syncthing/syncthing/blob/main/README-Docker.md']::text[]
    end,
    storage_estimate_min_gb = case a.slug when 'stirling-pdf' then 10 when 'uptime-kuma' then 1 when 'home-assistant' then 10 else 50 end,
    storage_estimate_max_gb = case a.slug when 'stirling-pdf' then 50 when 'uptime-kuma' then 20 when 'home-assistant' then 100 else 500 end,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = case when a.slug = 'stirling-pdf' then 'high' else 'medium' end,
    storage_estimate_basis = case a.slug
      when 'stirling-pdf' then 'Publisher production guidance asks for 10 GB free disk; range allows room for OCR files and processing.'
      when 'uptime-kuma' then 'Estimate for the SQLite-backed monitor history and app data.'
      when 'home-assistant' then 'Estimate for configuration and retained recorder history; history grows with devices and retention.'
      else 'Estimate for a personal sync set; synced files account for most of the storage.'
    end,
    storage_source_urls = case a.slug
      when 'stirling-pdf' then array['https://docs.stirlingpdf.com/Production-Deployment-Guide/']::text[]
      when 'uptime-kuma' then array['https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install']::text[]
      when 'home-assistant' then array['https://www.home-assistant.io/integrations/recorder/']::text[]
      else array['https://github.com/syncthing/syncthing/blob/main/README-Docker.md']::text[]
    end,
    checked_at = now(),
    updated_at = now()
from public.self_host_apps a
where a.id = r.app_id
  and a.slug in ('stirling-pdf', 'uptime-kuma', 'home-assistant', 'syncthing')
  and a.published is true;

-- Update the official Docker destinations and add verified upstream Compose guides.
update public.self_host_app_install_options i
set options = coalesce((
  select jsonb_agg(
    case
      when o->>'method' = 'docker' and o->>'support_level' = 'official' then
        o || jsonb_build_object('url', a.docker_url, 'image', a.docker_image, 'source_url', a.docker_url)
      else o
    end
    order by coalesce((o->>'sort_order')::integer, 999), o->>'url'
  )
  from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as option(o)
), '[]'::jsonb)
from public.self_host_apps a
where a.id = i.app_id
  and a.slug in ('stirling-pdf', 'uptime-kuma', 'home-assistant', 'syncthing');

update public.self_host_app_install_options i
set options = coalesce(i.options, '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
  'method', 'compose',
  'label', 'Docker Compose setup',
  'url', a.compose_url,
  'image', a.docker_image,
  'support_level', 'official',
  'source_url', a.compose_url,
  'note', null,
  'sort_order', 20
))
from public.self_host_apps a
where a.id = i.app_id
  and a.slug in ('stirling-pdf', 'uptime-kuma', 'syncthing');

-- Keep the table's legacy URL arrays aligned with its verified option list.
update public.self_host_app_install_options i
set docker_urls = coalesce((
      select array_agg(distinct o->>'url' order by o->>'url')
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as option(o)
      where o->>'method' = 'docker'
    ), array[]::text[]),
    docker_images = coalesce((
      select array_agg(distinct o->>'image' order by o->>'image')
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as option(o)
      where o->>'method' = 'docker' and o->>'image' is not null
    ), array[]::text[]),
    compose_urls = coalesce((
      select array_agg(distinct o->>'url' order by o->>'url')
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as option(o)
      where o->>'method' = 'compose'
    ), array[]::text[]),
    source_urls = coalesce((
      select array_agg(distinct o->>'source_url' order by o->>'source_url')
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as option(o)
      where o->>'source_url' is not null
    ), array[]::text[]),
    checked_at = now(),
    updated_at = now()
where i.app_id in (
  select id from public.self_host_apps where slug in ('stirling-pdf', 'uptime-kuma', 'home-assistant', 'syncthing')
);

commit;
