begin;

-- Umbrel catalog Compose files and images are community packages, not upstream publisher releases.
update public.self_host_app_install_options i
set options = (
  select coalesce(jsonb_agg(changed.option order by coalesce((changed.option->>'sort_order')::integer, 999), changed.option->>'url'), '[]'::jsonb)
  from (
    select case
      when lower(concat_ws(' ', o->>'url', o->>'source_url', o->>'image')) like '%getumbrel%'
        and coalesce(a.publisher_name, '') not ilike '%umbrel%'
        then jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(o, '{support_level}', '"community"'::jsonb, true),
              '{label}',
              to_jsonb(case o->>'method'
                when 'docker' then 'Umbrel community Docker image'
                when 'compose' then 'Umbrel community Docker Compose'
                else coalesce(o->>'label', 'Umbrel community install')
              end),
              true
            ),
            '{note}',
            to_jsonb('Community Umbrel package; support from the app publisher is not implied.'::text),
            true
          ),
          '{sort_order}',
          to_jsonb(case o->>'method' when 'docker' then 50 when 'compose' then 60 else 70 end),
          true
        )
      when o->>'url' in (
        'https://hub.docker.com/r/icewhaletech/deepseek-ocr-backend',
        'https://hub.docker.com/r/icewhaletech/index-tts',
        'https://hub.docker.com/r/icewhaletech/turbodiffusion'
      )
        then jsonb_set(
          jsonb_set(
            jsonb_set(o, '{support_level}', '"community"'::jsonb, true),
            '{label}',
            to_jsonb('IceWhaleTech community Docker image'::text),
            true
          ),
          '{note}',
          to_jsonb('Repackaged image from IceWhaleTech; it is not published as an upstream project image.'::text),
          true
        )
      else o
    end as option
    from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as item(o)
  ) as changed
)
from public.self_host_apps a
where a.id = i.app_id
  and a.published = true
  and (
    exists (
      select 1
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as item(o)
      where o->>'support_level' = 'official'
        and lower(concat_ws(' ', o->>'url', o->>'source_url', o->>'image')) like '%getumbrel%'
        and coalesce(a.publisher_name, '') not ilike '%umbrel%'
    )
    or exists (
      select 1
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as item(o)
      where o->>'support_level' = 'official'
        and o->>'url' in (
          'https://hub.docker.com/r/icewhaletech/deepseek-ocr-backend',
          'https://hub.docker.com/r/icewhaletech/index-tts',
          'https://hub.docker.com/r/icewhaletech/turbodiffusion'
        )
    )
  );

-- IceWhaleTech distributes these images; the upstream apps do not claim them as official.
update public.self_host_apps
set docker_support = 'community',
    docker_url = case slug
      when 'deepseek-ocr-nvidia-gpu' then 'https://hub.docker.com/r/icewhaletech/deepseek-ocr-backend'
      when 'index-tts' then 'https://hub.docker.com/r/icewhaletech/index-tts'
      when 'turbodiffusion-nvidia-gpu' then 'https://hub.docker.com/r/icewhaletech/turbodiffusion'
    end,
    website_url = case slug
      when 'deepseek-ocr-nvidia-gpu' then 'https://github.com/rdumasia303/deepseek_ocr_app'
      when 'index-tts' then 'https://github.com/index-tts/index-tts'
      when 'turbodiffusion-nvidia-gpu' then 'https://github.com/thu-ml/TurboDiffusion'
    end,
    publisher_name = case slug
      when 'deepseek-ocr-nvidia-gpu' then 'rdumasia303'
      when 'index-tts' then 'IndexTTS'
      when 'turbodiffusion-nvidia-gpu' then 'thu-ml'
    end,
    publisher_type = 'community',
    publisher_url = case slug
      when 'deepseek-ocr-nvidia-gpu' then 'https://github.com/rdumasia303'
      when 'index-tts' then 'https://github.com/index-tts'
      when 'turbodiffusion-nvidia-gpu' then 'https://github.com/thu-ml'
    end,
    license = case slug
      when 'index-tts' then 'Bilibili Model Use License Agreement'
      when 'turbodiffusion-nvidia-gpu' then 'Apache License 2.0'
      else license
    end,
    license_type = case slug
      when 'index-tts' then 'custom'
      when 'turbodiffusion-nvidia-gpu' then 'permissive'
      else license_type
    end,
    license_spdx_id = case slug
      when 'index-tts' then null
      when 'turbodiffusion-nvidia-gpu' then 'Apache-2.0'
      else license_spdx_id
    end,
    source_model = case slug
      when 'index-tts' then 'source_available'
      when 'turbodiffusion-nvidia-gpu' then 'open_source'
      else source_model
    end,
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(
        coalesce(data_source_urls, array[]::text[])
        || case slug
          when 'deepseek-ocr-nvidia-gpu' then array[
            'https://github.com/rdumasia303/deepseek_ocr_app',
            'https://github.com/rdumasia303/deepseek_ocr_app/blob/main/LICENSE',
            'https://hub.docker.com/r/icewhaletech/deepseek-ocr-backend'
          ]::text[]
          when 'index-tts' then array[
            'https://github.com/index-tts/index-tts',
            'https://github.com/index-tts/index-tts/blob/main/LICENSE',
            'https://hub.docker.com/r/icewhaletech/index-tts'
          ]::text[]
          else array[
            'https://github.com/thu-ml/TurboDiffusion',
            'https://github.com/thu-ml/TurboDiffusion/blob/main/LICENSE',
            'https://hub.docker.com/r/icewhaletech/turbodiffusion'
          ]::text[]
        end
      ) as source_url
      where source_url is not null
    ),
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'publisher', jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Publisher identity is taken from the upstream source project.','source_urls',jsonb_build_array(source_code_url)),
      'license', jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note',case slug when 'index-tts' then 'The upstream repository provides the Bilibili Model Use License Agreement.' when 'turbodiffusion-nvidia-gpu' then 'The upstream repository uses Apache License 2.0.' else 'The upstream app repository identifies MIT for the app; the underlying model has separate terms.' end,'source_urls',case slug when 'index-tts' then jsonb_build_array('https://github.com/index-tts/index-tts/blob/main/LICENSE') when 'turbodiffusion-nvidia-gpu' then jsonb_build_array('https://github.com/thu-ml/TurboDiffusion/blob/main/LICENSE') else jsonb_build_array('https://github.com/rdumasia303/deepseek_ocr_app/blob/main/LICENSE','https://github.com/rdumasia303/deepseek_ocr_app') end),
      'docker', jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','A community IceWhaleTech container is available; the upstream project does not publish this image.','source_urls',jsonb_build_array(docker_url)),
      'docker_image', jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The listed image is a community repackaging by IceWhaleTech.','source_urls',jsonb_build_array(docker_url))
    ),
    technical_facts_checked_at = now(),
    updated_at = now()
where slug in ('deepseek-ocr-nvidia-gpu', 'index-tts', 'turbodiffusion-nvidia-gpu')
  and published = true;

-- Correct first-party links, data stores, and install destinations for the most popular apps.
update public.self_host_apps a
set website_url = case a.slug
      when 'autogpt' then 'https://agpt.co/'
      when 'comfyui' then 'https://comfy.org/'
      when 'pi' then 'https://pi.dev/'
      else a.website_url
    end,
    docs_url = case a.slug
      when 'autogpt' then 'https://agpt.co/docs/'
      when 'pi' then 'https://pi.dev/docs/latest'
      else a.docs_url
    end,
    install_docs_url = case a.slug
      when 'openclaw' then 'https://docs.openclaw.ai/install/docker'
      when 'n8n' then 'https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/'
      when 'autogpt' then 'https://agpt.co/docs/platform/self-hosting/getting-started/'
      when 'comfyui' then 'https://docs.comfy.org/installation/manual_install'
      when 'immich' then 'https://docs.immich.app/install/docker-compose/'
      when 'pi' then 'https://pi.dev/docs/latest/containerization'
      else a.install_docs_url
    end,
    docker_url = case a.slug
      when 'openclaw' then 'https://github.com/openclaw/openclaw/pkgs/container/openclaw'
      when 'n8n' then 'https://hub.docker.com/r/n8nio/n8n'
      when 'autogpt' then 'https://agpt.co/docs/platform/self-hosting/getting-started/'
      when 'comfyui' then 'https://github.com/lecode-official/comfyui-docker/pkgs/container/comfyui-docker'
      when 'immich' then 'https://github.com/immich-app/immich/pkgs/container/immich-server'
      when 'pi' then 'https://pi.dev/docs/latest/containerization'
      else a.docker_url
    end,
    publisher_name = case a.slug
      when 'autogpt' then 'Determinist Ltd (trading as AutoGPT)'
      when 'comfyui' then 'Comfy Org'
      when 'pi' then 'Earendil Inc.'
      else a.publisher_name
    end,
    publisher_type = case a.slug
      when 'autogpt' then 'company'
      when 'comfyui' then 'company'
      when 'pi' then 'company'
      else a.publisher_type
    end,
    publisher_url = case a.slug
      when 'autogpt' then 'https://agpt.co/'
      when 'comfyui' then 'https://comfy.org/'
      when 'pi' then 'https://earendil.com/'
      else a.publisher_url
    end,
    license = case
      when a.slug = 'autogpt' then 'PolyForm Shield License 1.0.0 for autogpt_platform; MIT for other repository components'
      else a.license
    end,
    docker_support = case
      when a.slug in ('openclaw','n8n','autogpt','immich','pi') then 'official'
      when a.slug = 'comfyui' then 'community'
      else a.docker_support
    end,
    compose_support = case
      when a.slug in ('openclaw','n8n','autogpt','comfyui','immich') then true
      when a.slug = 'pi' then false
      else a.compose_support
    end,
    requires_database = case
      when a.slug in ('openclaw','n8n','comfyui','pi','storybook') then false
      when a.slug in ('autogpt','immich') then true
      else a.requires_database
    end,
    database_types = case a.slug
      when 'openclaw' then array[]::text[]
      when 'n8n' then array['sqlite','postgres']::text[]
      when 'autogpt' then array['postgres','redis','rabbitmq']::text[]
      when 'comfyui' then array[]::text[]
      when 'immich' then array['postgres']::text[]
      when 'pi' then array[]::text[]
      when 'storybook' then array[]::text[]
      else a.database_types
    end,
    docker_image = case a.slug
      when 'openclaw' then 'ghcr.io/openclaw/openclaw:latest'
      when 'n8n' then 'n8nio/n8n:latest'
      when 'autogpt' then null
      when 'comfyui' then 'ghcr.io/lecode-official/comfyui-docker:latest'
      when 'immich' then 'ghcr.io/immich-app/immich-server:v3'
      when 'pi' then null
      else a.docker_image
    end,
    compose_url = case a.slug
      when 'openclaw' then 'https://raw.githubusercontent.com/openclaw/openclaw/main/docker-compose.yml'
      when 'n8n' then 'https://github.com/n8n-io/n8n/blob/master/docker/get-n8n-compose.yml'
      when 'autogpt' then 'https://raw.githubusercontent.com/Significant-Gravitas/AutoGPT/master/autogpt_platform/docker-compose.yml'
      when 'comfyui' then 'https://github.com/lecode-official/comfyui-docker/blob/main/compose.yml'
      when 'immich' then 'https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml'
      when 'pi' then null
      else a.compose_url
    end,
    persistent_storage = case
      when a.slug in ('openclaw','n8n','autogpt','comfyui','immich','pi') then true
      when a.slug = 'storybook' then false
      else a.persistent_storage
    end,
    storage_profile = case a.slug
      when 'openclaw' then 'medium'
      when 'n8n' then 'medium'
      when 'autogpt' then 'medium'
      when 'comfyui' then 'high'
      when 'immich' then 'high'
      when 'pi' then 'low'
      when 'storybook' then 'low'
      else a.storage_profile
    end,
    deployment_methods = (
      case a.slug
        when 'storybook' then array['package']::text[]
        else (
          select array_agg(distinct method order by method)
          from unnest(coalesce(a.deployment_methods, array[]::text[]) || case a.slug
            when 'openclaw' then array['docker','compose']::text[]
            when 'n8n' then array['docker','compose']::text[]
            when 'autogpt' then array['docker','compose']::text[]
            when 'comfyui' then array['docker','compose']::text[]
            when 'immich' then array['docker','compose']::text[]
            when 'pi' then array['docker']::text[]
            else array[]::text[]
          end) as method
          where method is not null
        )
      end
    ),
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(
        coalesce(a.data_source_urls, array[]::text[])
        || case a.slug
          when 'openclaw' then array[
            'https://docs.openclaw.ai/install/docker',
            'https://github.com/openclaw/openclaw/pkgs/container/openclaw',
            'https://hub.docker.com/r/openclaw/openclaw',
            'https://raw.githubusercontent.com/openclaw/openclaw/main/docker-compose.yml'
          ]::text[]
          when 'n8n' then array[
            'https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/',
            'https://github.com/n8n-io/n8n/blob/master/docker/get-n8n-compose.yml',
            'https://hub.docker.com/r/n8nio/n8n'
          ]::text[]
          when 'autogpt' then array[
            'https://agpt.co/',
            'https://agpt.co/docs/',
            'https://agpt.co/docs/platform/self-hosting/getting-started/',
            'https://agpt.co/legal/platform-terms-of-use/',
            'https://github.com/Significant-Gravitas/AutoGPT/blob/master/LICENSE',
            'https://github.com/Significant-Gravitas/AutoGPT/blob/master/autogpt_platform/docker-compose.yml',
            'https://github.com/Significant-Gravitas/AutoGPT/blob/master/docs/platform/installer.md'
          ]::text[]
          when 'comfyui' then array[
            'https://comfy.org/',
            'https://docs.comfy.org/installation/manual_install',
            'https://docs.comfy.org/installation/system_requirements',
            'https://github.com/lecode-official/comfyui-docker',
            'https://github.com/lecode-official/comfyui-docker/pkgs/container/comfyui-docker',
            'https://github.com/lecode-official/comfyui-docker/blob/main/compose.yml'
          ]::text[]
          when 'immich' then array[
            'https://docs.immich.app/install/docker-compose/',
            'https://docs.immich.app/install/requirements/',
            'https://github.com/immich-app/immich/pkgs/container/immich-server',
            'https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml'
          ]::text[]
          when 'pi' then array[
            'https://pi.dev/',
            'https://pi.dev/docs/latest',
            'https://pi.dev/docs/latest/containerization',
            'https://pi.dev/changelog/2026/5/7/pi-has-a-new-home',
            'https://earendil.com/'
          ]::text[]
          else array[
            'https://storybook.js.org/docs/get-started/install',
            'https://storybook.js.org/docs'
          ]::text[]
        end
      ) as source_url
      where source_url is not null
        and not (a.slug = 'autogpt' and source_url in (
          'https://docs.agpt.co/platform/getting-started',
          'https://hub.docker.com/r/significantgravitas/autogpt'
        ))
    ),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || case a.slug
      when 'openclaw' then jsonb_build_object(
        'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','OpenClaw documents its official GHCR and Docker Hub images.','source_urls',jsonb_build_array('https://docs.openclaw.ai/install/docker','https://github.com/openclaw/openclaw/pkgs/container/openclaw')),
        'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official image is ghcr.io/openclaw/openclaw.','source_urls',jsonb_build_array('https://docs.openclaw.ai/install/docker')),
        'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Docker guide starts the Gateway with Docker Compose.','source_urls',jsonb_build_array('https://docs.openclaw.ai/install/docker','https://raw.githubusercontent.com/openclaw/openclaw/main/docker-compose.yml')),
        'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','The documented install persists OpenClaw state in mounted files and does not require an external database.','source_urls',jsonb_build_array('https://docs.openclaw.ai/install/docker'))
      )
      when 'n8n' then jsonb_build_object(
        'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','n8n documents its Docker image and Compose install.','source_urls',jsonb_build_array('https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/','https://hub.docker.com/r/n8nio/n8n')),
        'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The n8n documentation uses the official n8nio/n8n image.','source_urls',jsonb_build_array('https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/')),
        'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official setup is provided as a Docker Compose deployment.','source_urls',jsonb_build_array('https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/','https://github.com/n8n-io/n8n/blob/master/docker/get-n8n-compose.yml')),
        'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official default uses SQLite; the docs describe PostgreSQL as an optional setup.','source_urls',jsonb_build_array('https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/')),
        'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The full official Compose stack specifies at least 4 GB RAM and 2 vCPUs.','source_urls',jsonb_build_array('https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/'))
      )
      when 'autogpt' then jsonb_build_object(
        'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','AutoGPT platform terms identify Determinist Ltd trading as AutoGPT.','source_urls',jsonb_build_array('https://agpt.co/legal/platform-terms-of-use/')),
        'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The repository applies PolyForm Shield to autogpt_platform and MIT to other components.','source_urls',jsonb_build_array('https://github.com/Significant-Gravitas/AutoGPT/blob/master/LICENSE')),
        'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official self-host guide runs the platform with Docker Compose and builds from source.','source_urls',jsonb_build_array('https://agpt.co/docs/platform/self-hosting/getting-started/')),
        'docker_image',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','high','note','The official guide says appliance image tags are not public; the documented deployment builds from source.','source_urls',jsonb_build_array('https://agpt.co/docs/platform/self-hosting/getting-started/')),
        'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official setup runs the autogpt_platform Compose file.','source_urls',jsonb_build_array('https://agpt.co/docs/platform/self-hosting/getting-started/','https://github.com/Significant-Gravitas/AutoGPT/blob/master/autogpt_platform/docker-compose.yml')),
        'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The documented core services include PostgreSQL, Redis, and RabbitMQ.','source_urls',jsonb_build_array('https://agpt.co/docs/platform/self-hosting/getting-started/')),
        'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official installer guide recommends at least 8 GB RAM.','source_urls',jsonb_build_array('https://github.com/Significant-Gravitas/AutoGPT/blob/master/docs/platform/installer.md')),
        'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official installer guide asks for about 25 GB free disk.','source_urls',jsonb_build_array('https://github.com/Significant-Gravitas/AutoGPT/blob/master/docs/platform/installer.md'))
      )
      when 'comfyui' then jsonb_build_object(
        'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','A community maintained Docker image and Compose file are available.','source_urls',jsonb_build_array('https://github.com/lecode-official/comfyui-docker','https://github.com/lecode-official/comfyui-docker/pkgs/container/comfyui-docker')),
        'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The listed GHCR image is published by a community maintainer, not Comfy Org.','source_urls',jsonb_build_array('https://github.com/lecode-official/comfyui-docker/pkgs/container/comfyui-docker')),
        'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The community container repository provides a Compose setup.','source_urls',jsonb_build_array('https://github.com/lecode-official/comfyui-docker/blob/main/compose.yml'))
      )
      when 'immich' then jsonb_build_object(
        'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Immich recommends Docker Compose for production and publishes its server image.','source_urls',jsonb_build_array('https://docs.immich.app/install/docker-compose/','https://github.com/immich-app/immich/pkgs/container/immich-server')),
        'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Compose file defaults to the v3 image stream.','source_urls',jsonb_build_array('https://docs.immich.app/install/docker-compose/')),
        'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official install page downloads the release Compose file.','source_urls',jsonb_build_array('https://docs.immich.app/install/docker-compose/','https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml')),
        'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Compose setup includes PostgreSQL.','source_urls',jsonb_build_array('https://docs.immich.app/install/docker-compose/')),
        'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official requirements list 6 GB minimum and 8 GB recommended RAM.','source_urls',jsonb_build_array('https://docs.immich.app/install/requirements/')),
        'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official guidance says thumbnail and transcoded files add about 10 to 20 percent to the photo library.','source_urls',jsonb_build_array('https://docs.immich.app/install/requirements/'))
      )
      when 'pi' then jsonb_build_object(
        'publisher',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Pi identifies Earendil Inc. and documents its move to Earendil Works.','source_urls',jsonb_build_array('https://pi.dev/changelog/2026/5/7/pi-has-a-new-home','https://earendil.com/')),
        'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Pi documents building and running its official package inside Docker.','source_urls',jsonb_build_array('https://pi.dev/docs/latest/containerization')),
        'docker_image',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','high','note','The official guide provides a Dockerfile to build locally rather than a publisher image.','source_urls',jsonb_build_array('https://pi.dev/docs/latest/containerization')),
        'compose',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The official containerization guide documents Docker run and does not provide a Compose setup.','source_urls',jsonb_build_array('https://pi.dev/docs/latest/containerization')),
        'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','Pi persists its settings, credentials, and sessions in a mounted local directory.','source_urls',jsonb_build_array('https://pi.dev/docs/latest/containerization'))
      )
      else jsonb_build_object(
        'docker',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The official Storybook install guide documents the project install; no official Docker install is listed there.','source_urls',jsonb_build_array('https://storybook.js.org/docs/get-started/install')),
        'compose',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','medium','note','The official Storybook install guide does not provide a Compose deployment.','source_urls',jsonb_build_array('https://storybook.js.org/docs/get-started/install'))
      )
    end,
    technical_facts_checked_at = now(),
    updated_at = now()
where a.slug in ('openclaw','n8n','autogpt','comfyui','immich','pi','storybook')
  and a.published = true;

-- Refresh only the reviewed RAM and storage estimates; the public directory labels both as estimates.
update public.self_host_app_resource_estimates r
set ram_estimate_min_mb = v.ram_min,
    ram_estimate_max_mb = v.ram_max,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = v.ram_confidence,
    ram_estimate_basis = v.ram_basis,
    ram_source_urls = v.ram_sources,
    storage_estimate_min_gb = v.storage_min,
    storage_estimate_max_gb = v.storage_max,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = v.storage_confidence,
    storage_estimate_basis = v.storage_basis,
    storage_source_urls = v.storage_sources,
    checked_at = now(),
    updated_at = now()
from (
  values
    ('openclaw', 2048::numeric, 8192::numeric, 'medium', 'Agent sessions, tools, and conversation context drive memory use; the model can run remotely or locally.', array['https://docs.openclaw.ai/install/docker']::text[], 1::numeric, 20::numeric, 'low', 'Configuration, session history, and workspace files determine storage use.', array['https://docs.openclaw.ai/install/docker']::text[]),
    ('n8n', 1024::numeric, 4096::numeric, 'medium', 'Memory use grows with workflow concurrency, execution data, and the optional code sandbox.', array['https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/']::text[], 1::numeric, 20::numeric, 'low', 'Workflow definitions, execution history, and binary data determine storage use.', array['https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/']::text[]),
    ('autogpt', 8192::numeric, 16384::numeric, 'medium', 'The official installer recommends 8 GB RAM; this range covers the Compose platform services.', array['https://github.com/Significant-Gravitas/AutoGPT/blob/master/docs/platform/installer.md','https://agpt.co/docs/platform/self-hosting/getting-started/']::text[], 25::numeric, 100::numeric, 'medium', 'The official installer asks for 25 GB free disk; persistent agent data and logs add to that.', array['https://github.com/Significant-Gravitas/AutoGPT/blob/master/docs/platform/installer.md']::text[]),
    ('comfyui', 8192::numeric, 32768::numeric, 'low', 'Workflow execution and model loading drive memory use; the selected model and GPU affect the total.', array['https://docs.comfy.org/installation/system_requirements','https://github.com/lecode-official/comfyui-docker']::text[], 20::numeric, 100::numeric, 'low', 'Downloaded models, custom nodes, and generated outputs use most of the storage.', array['https://docs.comfy.org/installation/system_requirements','https://github.com/lecode-official/comfyui-docker']::text[]),
    ('immich', 6144::numeric, 8192::numeric, 'medium', 'The project lists 6 GB minimum and 8 GB recommended RAM; background jobs can increase use.', array['https://docs.immich.app/install/requirements/']::text[], 50::numeric, 500::numeric, 'low', 'Photo and video libraries drive storage; thumbnails and transcoded files add about 10 to 20 percent.', array['https://docs.immich.app/install/requirements/']::text[]),
    ('pi', 512::numeric, 4096::numeric, 'low', 'The CLI and extensions run locally; model inference is usually handled by an external provider.', array['https://pi.dev/docs/latest/containerization']::text[], 1::numeric, 20::numeric, 'low', 'Session history, settings, extensions, and the working project determine storage use.', array['https://pi.dev/docs/latest/containerization']::text[]),
    ('storybook', 512::numeric, 4096::numeric, 'low', 'A small local preview is light; builds, browser tests, and large component sets use more memory.', array['https://storybook.js.org/docs/get-started/install']::text[], 1::numeric, 10::numeric, 'low', 'Project dependencies and generated static Storybook files determine storage use.', array['https://storybook.js.org/docs/get-started/install']::text[])
) as v(slug, ram_min, ram_max, ram_confidence, ram_basis, ram_sources, storage_min, storage_max, storage_confidence, storage_basis, storage_sources)
join public.self_host_apps a on a.slug = v.slug and a.published = true
where r.app_id = a.id;

-- Add or refresh install options while preserving NAS and other community entries.
update public.self_host_app_install_options i
set options = (
      select coalesce(jsonb_agg(item.option order by coalesce((item.option->>'sort_order')::integer, 999), item.option->>'url'), '[]'::jsonb)
      from (
        select case
          when a.slug = 'n8n' and o->>'method' = 'docker'
            then jsonb_set(jsonb_set(o, '{image}', '"n8nio/n8n:latest"'::jsonb, true), '{source_url}', '"https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/"'::jsonb, true)
          when a.slug = 'immich' and o->>'method' = 'docker'
            then jsonb_set(jsonb_set(o, '{image}', '"ghcr.io/immich-app/immich-server:v3"'::jsonb, true), '{source_url}', '"https://docs.immich.app/install/docker-compose/"'::jsonb, true)
          else o
        end as option
        from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as item(o)
        where not exists (
          select 1
          from jsonb_array_elements(v.additions) as new_item(option)
          where new_item.option->>'url' = o->>'url'
        )
        union all
        select new_item.option
        from jsonb_array_elements(v.additions) as new_item(option)
      ) as item
    ),
    docker_urls = (
      select coalesce(array_agg(distinct o->>'url' order by o->>'url'), array[]::text[])
      from jsonb_array_elements((
        select coalesce(jsonb_agg(item.option order by coalesce((item.option->>'sort_order')::integer, 999), item.option->>'url'), '[]'::jsonb)
        from (
          select case
            when a.slug = 'n8n' and o->>'method' = 'docker'
              then jsonb_set(jsonb_set(o, '{image}', '"n8nio/n8n:latest"'::jsonb, true), '{source_url}', '"https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/"'::jsonb, true)
            when a.slug = 'immich' and o->>'method' = 'docker'
              then jsonb_set(jsonb_set(o, '{image}', '"ghcr.io/immich-app/immich-server:v3"'::jsonb, true), '{source_url}', '"https://docs.immich.app/install/docker-compose/"'::jsonb, true)
            else o
          end as option
          from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as existing(o)
          where not exists (select 1 from jsonb_array_elements(v.additions) n(option) where n.option->>'url'=o->>'url')
          union all
          select n.option from jsonb_array_elements(v.additions) n(option)
        ) item
      )) o
      where o->>'method' = 'docker' and nullif(o->>'url','') is not null
    ),
    docker_images = (
      select coalesce(array_agg(distinct o->>'image' order by o->>'image'), array[]::text[])
      from jsonb_array_elements((
        select coalesce(jsonb_agg(item.option order by coalesce((item.option->>'sort_order')::integer, 999), item.option->>'url'), '[]'::jsonb)
        from (
          select case
            when a.slug = 'n8n' and o->>'method' = 'docker'
              then jsonb_set(jsonb_set(o, '{image}', '"n8nio/n8n:latest"'::jsonb, true), '{source_url}', '"https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/"'::jsonb, true)
            when a.slug = 'immich' and o->>'method' = 'docker'
              then jsonb_set(jsonb_set(o, '{image}', '"ghcr.io/immich-app/immich-server:v3"'::jsonb, true), '{source_url}', '"https://docs.immich.app/install/docker-compose/"'::jsonb, true)
            else o
          end as option
          from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as existing(o)
          where not exists (select 1 from jsonb_array_elements(v.additions) n(option) where n.option->>'url'=o->>'url')
          union all
          select n.option from jsonb_array_elements(v.additions) n(option)
        ) item
      )) o
      where o->>'method' = 'docker' and nullif(o->>'image','') is not null
    ),
    compose_urls = (
      select coalesce(array_agg(distinct o->>'url' order by o->>'url'), array[]::text[])
      from jsonb_array_elements((
        select coalesce(jsonb_agg(item.option order by coalesce((item.option->>'sort_order')::integer, 999), item.option->>'url'), '[]'::jsonb)
        from (
          select case
            when a.slug = 'n8n' and o->>'method' = 'docker'
              then jsonb_set(jsonb_set(o, '{image}', '"n8nio/n8n:latest"'::jsonb, true), '{source_url}', '"https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/"'::jsonb, true)
            when a.slug = 'immich' and o->>'method' = 'docker'
              then jsonb_set(jsonb_set(o, '{image}', '"ghcr.io/immich-app/immich-server:v3"'::jsonb, true), '{source_url}', '"https://docs.immich.app/install/docker-compose/"'::jsonb, true)
            else o
          end as option
          from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as existing(o)
          where not exists (select 1 from jsonb_array_elements(v.additions) n(option) where n.option->>'url'=o->>'url')
          union all
          select n.option from jsonb_array_elements(v.additions) n(option)
        ) item
      )) o
      where o->>'method' = 'compose' and nullif(o->>'url','') is not null
    ),
    checked_at = now(),
    updated_at = now()
from (
  values
    ('openclaw', jsonb_build_array(
      jsonb_build_object('method','docker','label','Official OpenClaw Docker image','url','https://github.com/openclaw/openclaw/pkgs/container/openclaw','image','ghcr.io/openclaw/openclaw:latest','support_level','official','source_url','https://docs.openclaw.ai/install/docker','note',null::text,'sort_order',10),
      jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://raw.githubusercontent.com/openclaw/openclaw/main/docker-compose.yml','image',null::text,'support_level','official','source_url','https://docs.openclaw.ai/install/docker','note',null::text,'sort_order',20)
    )),
    ('n8n', jsonb_build_array(
      jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://github.com/n8n-io/n8n/blob/master/docker/get-n8n-compose.yml','image',null::text,'support_level','official','source_url','https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose/','note',null::text,'sort_order',20)
    )),
    ('autogpt', jsonb_build_array(
      jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://raw.githubusercontent.com/Significant-Gravitas/AutoGPT/master/autogpt_platform/docker-compose.yml','image',null::text,'support_level','official','source_url','https://agpt.co/docs/platform/self-hosting/getting-started/','note','Builds the platform services from source.','sort_order',10)
    )),
    ('comfyui', jsonb_build_array(
      jsonb_build_object('method','docker','label','Community ComfyUI Docker image','url','https://github.com/lecode-official/comfyui-docker/pkgs/container/comfyui-docker','image','ghcr.io/lecode-official/comfyui-docker:latest','support_level','community','source_url','https://github.com/lecode-official/comfyui-docker','note','Community maintained image; not published by Comfy Org.','sort_order',10),
      jsonb_build_object('method','compose','label','Community Docker Compose setup','url','https://github.com/lecode-official/comfyui-docker/blob/main/compose.yml','image',null::text,'support_level','community','source_url','https://github.com/lecode-official/comfyui-docker','note','Community maintained Compose setup; not published by Comfy Org.','sort_order',20)
    )),
    ('immich', jsonb_build_array(
      jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml','image',null::text,'support_level','official','source_url','https://docs.immich.app/install/docker-compose/','note',null::text,'sort_order',20)
    )),
    ('pi', jsonb_build_array(
      jsonb_build_object('method','docker','label','Build and run Pi with Docker','url','https://pi.dev/docs/latest/containerization','image',null::text,'support_level','official','source_url','https://pi.dev/docs/latest/containerization','note','The official guide provides a Dockerfile to build locally.','sort_order',10)
    ))
) as v(slug, additions)
join public.self_host_apps a on a.slug = v.slug and a.published = true
where i.app_id = a.id;

-- Keep app-level image and Compose links aligned with the reviewed option list.
update public.self_host_app_install_options i
set docker_urls = (
      select coalesce(array_agg(distinct o->>'url' order by o->>'url'), array[]::text[])
      from jsonb_array_elements(i.options) o
      where o->>'method' = 'docker' and nullif(o->>'url','') is not null
    ),
    docker_images = (
      select coalesce(array_agg(distinct o->>'image' order by o->>'image'), array[]::text[])
      from jsonb_array_elements(i.options) o
      where o->>'method' = 'docker' and nullif(o->>'image','') is not null
    ),
    compose_urls = (
      select coalesce(array_agg(distinct o->>'url' order by o->>'url'), array[]::text[])
      from jsonb_array_elements(i.options) o
      where o->>'method' = 'compose' and nullif(o->>'url','') is not null
    ),
    updated_at = now()
from public.self_host_apps a
where a.id = i.app_id
  and a.slug in ('openclaw','n8n','autogpt','comfyui','immich','pi')
  and a.published = true;

-- Copy current shared GitHub metadata to the reviewed app rows.
update public.self_host_apps app set
  source_code_url = project.repository_url,
  source_code_host = 'github',
  github_owner = project.owner,
  github_repo = project.repo,
  github_full_name = project.full_name,
  github_repo_id = project.repo_id,
  github_node_id = project.node_id,
  github_owner_type = project.owner_type,
  github_stars = project.stars,
  github_forks = project.forks,
  github_watchers = project.watchers,
  github_open_issues = project.open_issues,
  github_primary_language = project.primary_language,
  github_languages = project.languages,
  github_topics = project.topics,
  github_created_at = project.created_at,
  github_updated_at = project.updated_at,
  github_pushed_at = project.pushed_at,
  github_default_branch = project.default_branch,
  github_repo_size_kb = project.repo_size_kb,
  github_archived = project.archived,
  github_disabled = project.disabled,
  github_is_fork = project.is_fork,
  github_is_template = project.is_template,
  github_latest_release = project.latest_release,
  github_latest_release_at = project.latest_release_at,
  github_last_commit_at = project.last_commit_at,
  github_checked_at = project.checked_at,
  release_version = project.latest_release,
  release_published_at = project.latest_release_at,
  release_checked_at = project.checked_at,
  release_url = case when project.latest_release is null then null else rtrim(project.repository_url, '/') || '/releases/latest' end,
  source_repo_id = project.repo_id::text,
  source_full_name = project.full_name,
  source_stars = project.stars,
  source_forks = project.forks,
  source_watchers = project.watchers,
  source_open_issues = project.open_issues,
  source_primary_language = project.primary_language,
  source_languages = project.languages,
  source_topics = project.topics,
  source_created_at = project.created_at,
  source_updated_at = project.updated_at,
  source_pushed_at = project.pushed_at,
  source_default_branch = project.default_branch,
  source_repo_size_kb = project.repo_size_kb,
  source_archived = project.archived,
  source_disabled = project.disabled,
  source_is_fork = project.is_fork,
  source_is_template = project.is_template,
  source_latest_release = project.latest_release,
  source_latest_release_at = project.latest_release_at,
  source_last_commit_at = project.last_commit_at,
  source_checked_at = project.checked_at,
  data_source_urls = (
    select array_agg(distinct source_url order by source_url)
    from unnest(
      coalesce(app.data_source_urls, array[]::text[])
      || array[project.repository_url, rtrim(project.repository_url, '/') || '/releases/latest']::text[]
    ) as source_url
  ),
  updated_at = now()
from public.github_projects project
where app.slug in ('openclaw','n8n','autogpt','comfyui','immich','pi','storybook')
  and app.published = true
  and app.self_hosting_status = 'self_hostable'
  and app.github_project_id = project.id;

commit;
