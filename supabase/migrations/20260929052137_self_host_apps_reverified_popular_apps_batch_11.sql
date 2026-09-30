begin;

-- Correct popular app records from their official sites, repositories, docs, and registries.
update public.self_host_apps a
set website_url = case a.slug
      when 'nextchat' then 'https://nextchat.club/'
      when 'openhands' then 'https://www.openhands.dev/'
      when 'pi-hole' then 'https://pi-hole.net/'
      when 'lobehub' then 'https://lobehub.com/'
      when 'appflowy' then 'https://appflowy.com/'
      when 'anythingllm' then 'https://anythingllm.com/'
      else a.website_url
    end,
    docs_url = case a.slug
      when 'nextchat' then 'https://github.com/ChatGPTNextWeb/NextChat/tree/main/docs'
      when 'openhands' then 'https://docs.openhands.dev/openhands/usage/run-openhands/local-setup'
      when 'pi-hole' then 'https://docs.pi-hole.net/'
      when 'lobehub' then 'https://lobehub.com/docs/'
      when 'appflowy' then 'https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production'
      when 'anythingllm' then 'https://docs.anythingllm.com/'
      else a.docs_url
    end,
    install_docs_url = case a.slug
      when 'nextchat' then 'https://github.com/ChatGPTNextWeb/NextChat#deployment'
      when 'openhands' then 'https://docs.openhands.dev/openhands/usage/run-openhands/local-setup'
      when 'pi-hole' then 'https://docs.pi-hole.net/docker/'
      when 'lobehub' then 'https://lobehub.com/docs/self-hosting/server-database/docker-compose'
      when 'appflowy' then 'https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production'
      when 'anythingllm' then 'https://docs.anythingllm.com/installation-docker/quickstart'
      else a.install_docs_url
    end,
    docker_url = case a.slug
      when 'nextchat' then 'https://hub.docker.com/r/yidadaa/chatgpt-next-web'
      when 'openhands' then 'https://docs.openhands.dev/openhands/usage/run-openhands/local-setup'
      when 'pi-hole' then 'https://hub.docker.com/r/pihole/pihole'
      when 'lobehub' then 'https://hub.docker.com/r/lobehub/lobehub'
      when 'appflowy' then 'https://hub.docker.com/r/appflowyinc/appflowy_cloud'
      when 'anythingllm' then 'https://hub.docker.com/r/mintplexlabs/anythingllm'
      else a.docker_url
    end,
    docker_image = case a.slug
      when 'nextchat' then 'yidadaa/chatgpt-next-web:latest'
      when 'openhands' then 'docker.openhands.dev/openhands/openhands:1.8'
      when 'pi-hole' then 'pihole/pihole:latest'
      when 'lobehub' then 'lobehub/lobehub:latest'
      when 'appflowy' then 'appflowyinc/appflowy_cloud:latest'
      when 'anythingllm' then 'mintplexlabs/anythingllm:latest'
      else a.docker_image
    end,
    source_code_url = case a.slug when 'appflowy' then null else a.source_code_url end,
    source_code_host = case a.slug when 'appflowy' then 'unknown' else a.source_code_host end,
    github_project_id = case a.slug when 'appflowy' then null else a.github_project_id end,
    github_owner = case a.slug when 'appflowy' then null else a.github_owner end,
    github_repo = case a.slug when 'appflowy' then null else a.github_repo end,
    github_stars = case a.slug when 'appflowy' then null else a.github_stars end,
    github_latest_release = case a.slug when 'appflowy' then null else a.github_latest_release end,
    github_latest_release_at = case a.slug when 'appflowy' then null else a.github_latest_release_at end,
    github_last_commit_at = case a.slug when 'appflowy' then null else a.github_last_commit_at end,
    github_checked_at = case a.slug when 'appflowy' then null else a.github_checked_at end,
    github_repo_id = case a.slug when 'appflowy' then null else a.github_repo_id end,
    github_node_id = case a.slug when 'appflowy' then null else a.github_node_id end,
    github_full_name = case a.slug when 'appflowy' then null else a.github_full_name end,
    github_owner_type = case a.slug when 'appflowy' then null else a.github_owner_type end,
    github_forks = case a.slug when 'appflowy' then null else a.github_forks end,
    github_watchers = case a.slug when 'appflowy' then null else a.github_watchers end,
    github_open_issues = case a.slug when 'appflowy' then null else a.github_open_issues end,
    github_primary_language = case a.slug when 'appflowy' then null else a.github_primary_language end,
    github_languages = case a.slug when 'appflowy' then '{}'::jsonb else a.github_languages end,
    github_topics = case a.slug when 'appflowy' then array[]::text[] else a.github_topics end,
    github_created_at = case a.slug when 'appflowy' then null else a.github_created_at end,
    github_updated_at = case a.slug when 'appflowy' then null else a.github_updated_at end,
    github_pushed_at = case a.slug when 'appflowy' then null else a.github_pushed_at end,
    github_default_branch = case a.slug when 'appflowy' then null else a.github_default_branch end,
    github_repo_size_kb = case a.slug when 'appflowy' then null else a.github_repo_size_kb end,
    github_archived = case a.slug when 'appflowy' then null else a.github_archived end,
    github_disabled = case a.slug when 'appflowy' then null else a.github_disabled end,
    github_is_fork = case a.slug when 'appflowy' then null else a.github_is_fork end,
    github_is_template = case a.slug when 'appflowy' then null else a.github_is_template end,
    source_repo_id = case a.slug when 'appflowy' then null else a.source_repo_id end,
    source_full_name = case a.slug when 'appflowy' then null else a.source_full_name end,
    source_stars = case a.slug when 'appflowy' then null else a.source_stars end,
    source_forks = case a.slug when 'appflowy' then null else a.source_forks end,
    source_watchers = case a.slug when 'appflowy' then null else a.source_watchers end,
    source_open_issues = case a.slug when 'appflowy' then null else a.source_open_issues end,
    source_primary_language = case a.slug when 'appflowy' then null else a.source_primary_language end,
    source_languages = case a.slug when 'appflowy' then '{}'::jsonb else a.source_languages end,
    source_topics = case a.slug when 'appflowy' then array[]::text[] else a.source_topics end,
    source_created_at = case a.slug when 'appflowy' then null else a.source_created_at end,
    source_updated_at = case a.slug when 'appflowy' then null else a.source_updated_at end,
    source_pushed_at = case a.slug when 'appflowy' then null else a.source_pushed_at end,
    source_default_branch = case a.slug when 'appflowy' then null else a.source_default_branch end,
    source_repo_size_kb = case a.slug when 'appflowy' then null else a.source_repo_size_kb end,
    source_archived = case a.slug when 'appflowy' then null else a.source_archived end,
    source_disabled = case a.slug when 'appflowy' then null else a.source_disabled end,
    source_is_fork = case a.slug when 'appflowy' then null else a.source_is_fork end,
    source_is_template = case a.slug when 'appflowy' then null else a.source_is_template end,
    source_latest_release = case a.slug when 'appflowy' then null else a.source_latest_release end,
    source_latest_release_at = case a.slug when 'appflowy' then null else a.source_latest_release_at end,
    source_last_commit_at = case a.slug when 'appflowy' then null else a.source_last_commit_at end,
    source_checked_at = case a.slug when 'appflowy' then null else a.source_checked_at end,
    license = case a.slug
      when 'openhands' then 'MIT for core OpenHands; PolyForm Free Trial for OpenHands Cloud and Enterprise'
      when 'pi-hole' then 'EUPL-1.2'
      when 'lobehub' then 'LobeHub Community License (based on Apache-2.0 with additional conditions)'
      when 'appflowy' then 'AppFlowy Self-Hosted Commercial License'
      else a.license
    end,
    license_spdx_id = case a.slug
      when 'openhands' then null
      when 'pi-hole' then 'EUPL-1.2'
      when 'lobehub' then null
      when 'appflowy' then null
      else a.license_spdx_id
    end,
    license_type = case a.slug
      when 'openhands' then 'mixed'::public.self_host_app_license_type
      when 'pi-hole' then 'copyleft'::public.self_host_app_license_type
      when 'lobehub' then 'custom'::public.self_host_app_license_type
      when 'appflowy' then 'custom'::public.self_host_app_license_type
      else a.license_type
    end,
    source_model = case a.slug
      when 'openhands' then 'open_source'::public.self_host_app_source_model
      when 'pi-hole' then 'open_source'::public.self_host_app_source_model
      when 'lobehub' then 'source_available'::public.self_host_app_source_model
      when 'appflowy' then 'closed_source'::public.self_host_app_source_model
      else a.source_model
    end,
    pricing_model = case a.slug when 'appflowy' then 'freemium' else a.pricing_model end,
    publisher_name = case a.slug
      when 'nextchat' then 'NextChat'
      when 'openhands' then 'All Hands AI'
      when 'pi-hole' then 'Pi-hole Project'
      when 'lobehub' then 'LobeHub LLC'
      when 'appflowy' then 'AppFlowy Pte. Ltd.'
      when 'anythingllm' then 'Mintplex Labs Inc'
      else a.publisher_name
    end,
    publisher_type = case a.slug
      when 'nextchat' then 'community'
      when 'openhands' then 'company'
      when 'pi-hole' then 'community'
      when 'lobehub' then 'company'
      when 'appflowy' then 'company'
      when 'anythingllm' then 'company'
      else a.publisher_type
    end,
    publisher_url = case a.slug
      when 'nextchat' then 'https://nextchat.club/'
      when 'openhands' then 'https://www.openhands.dev/'
      when 'pi-hole' then 'https://github.com/pi-hole'
      when 'lobehub' then 'https://lobehub.com/'
      when 'appflowy' then 'https://appflowy.com/'
      when 'anythingllm' then 'https://github.com/Mintplex-Labs'
      else a.publisher_url
    end,
    docker_support = case a.slug
      when 'nextchat' then 'official'
      when 'openhands' then 'official'
      when 'pi-hole' then 'official'
      when 'lobehub' then 'official'
      when 'appflowy' then 'official'
      when 'anythingllm' then 'official'
      else a.docker_support
    end,
    compose_support = case a.slug
      when 'nextchat' then true
      when 'openhands' then null
      when 'pi-hole' then true
      when 'traefik' then true
      when 'lobehub' then true
      when 'appflowy' then true
      when 'anythingllm' then true
      else a.compose_support
    end,
    compose_url = case a.slug
      when 'nextchat' then 'https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml'
      when 'openhands' then null
      when 'pi-hole' then 'https://docs.pi-hole.net/docker/'
      when 'traefik' then 'https://doc.traefik.io/traefik/getting-started/quick-start/'
      when 'lobehub' then 'https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml'
      when 'appflowy' then 'https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml'
      when 'anythingllm' then 'https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml'
      else a.compose_url
    end,
    requires_database = case a.slug
      when 'nextchat' then false
      when 'openhands' then false
      when 'pi-hole' then false
      when 'traefik' then false
      when 'lobehub' then true
      when 'appflowy' then true
      when 'anythingllm' then false
      else a.requires_database
    end,
    database_types = case a.slug
      when 'pi-hole' then array['sqlite']::text[]
      when 'lobehub' then array['postgresql']::text[]
      when 'nextchat' then array[]::text[]
      when 'openhands' then array[]::text[]
      when 'traefik' then array[]::text[]
      when 'appflowy' then array['postgresql']::text[]
      when 'anythingllm' then array[]::text[]
      else a.database_types
    end,
    deployment_methods = case a.slug
      when 'nextchat' then array['docker', 'compose']::text[]
      when 'openhands' then array['docker']::text[]
      when 'pi-hole' then array['docker', 'compose']::text[]
      when 'traefik' then array['docker', 'compose']::text[]
      when 'lobehub' then array['docker', 'compose']::text[]
      when 'appflowy' then array['docker', 'compose']::text[]
      when 'anythingllm' then array['docker', 'compose']::text[]
      else a.deployment_methods
    end,
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(
        coalesce(a.data_source_urls, array[]::text[]) || case a.slug
          when 'nextchat' then array[
            'https://nextchat.club/',
            'https://github.com/ChatGPTNextWeb/NextChat',
            'https://github.com/ChatGPTNextWeb/NextChat/blob/main/LICENSE',
            'https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml',
            'https://hub.docker.com/r/yidadaa/chatgpt-next-web'
          ]::text[]
          when 'openhands' then array[
            'https://www.openhands.dev/',
            'https://www.openhands.dev/blog/introducing-all-hands-ai',
            'https://docs.openhands.dev/openhands/usage/run-openhands/local-setup',
            'https://github.com/OpenHands/OpenHands',
            'https://github.com/OpenHands/OpenHands/blob/main/LICENSE',
            'https://github.com/OpenHands/enterprise/blob/main/LICENSE'
          ]::text[]
          when 'pi-hole' then array[
            'https://docs.pi-hole.net/',
            'https://docs.pi-hole.net/docker/',
            'https://docs.pi-hole.net/database/',
            'https://github.com/pi-hole/pi-hole/blob/master/LICENSE',
            'https://github.com/pi-hole/docker-pi-hole',
            'https://hub.docker.com/r/pihole/pihole'
          ]::text[]
          when 'traefik' then array[
            'https://doc.traefik.io/traefik/getting-started/quick-start/',
            'https://hub.docker.com/_/traefik'
          ]::text[]
          when 'lobehub' then array[
            'https://lobehub.com/',
            'https://lobehub.com/docs/',
            'https://lobehub.com/docs/self-hosting/server-database/docker-compose',
            'https://github.com/lobehub/lobehub',
            'https://github.com/lobehub/lobehub/blob/canary/LICENSE',
            'https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml',
            'https://hub.docker.com/r/lobehub/lobehub'
          ]::text[]
          when 'appflowy' then array[
            'https://appflowy.com/',
            'https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production',
            'https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial',
            'https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/SELF_HOST_LICENSE_AGREEMENT.md',
            'https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml',
            'https://github.com/AppFlowy-IO/AppFlowy-Cloud/blob/main/README.md',
            'https://github.com/AppFlowy-IO/AppFlowy',
            'https://github.com/AppFlowy-IO/AppFlowy/blob/main/LICENSE',
            'https://hub.docker.com/r/appflowyinc/appflowy_cloud'
          ]::text[]
          else array[
            'https://docs.anythingllm.com/',
            'https://docs.anythingllm.com/installation-docker/quickstart',
            'https://docs.anythingllm.com/installation-docker/available-images',
            'https://github.com/Mintplex-Labs/anything-llm',
            'https://github.com/Mintplex-Labs/anything-llm/blob/master/LICENSE',
            'https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml',
            'https://hub.docker.com/r/mintplexlabs/anythingllm'
          ]::text[]
        end
      ) as sources(source_url)
      where source_url is not null
    ),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object(
      'publisher', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', 'Publisher identity checked against the official product site, repository, or license.',
        'source_urls', case a.slug
          when 'nextchat' then jsonb_build_array('https://nextchat.club/', 'https://github.com/ChatGPTNextWeb/NextChat')
          when 'openhands' then jsonb_build_array('https://www.openhands.dev/blog/introducing-all-hands-ai')
          when 'pi-hole' then jsonb_build_array('https://github.com/pi-hole')
          when 'traefik' then jsonb_build_array('https://traefik.io/')
          when 'lobehub' then jsonb_build_array('https://github.com/lobehub/lobehub/blob/canary/LICENSE')
          when 'anythingllm' then jsonb_build_array('https://github.com/Mintplex-Labs/anything-llm', 'https://hub.docker.com/r/mintplexlabs/anythingllm')
          when 'appflowy' then jsonb_build_array('https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial', 'https://www.appflowy.com/')
          else jsonb_build_array('https://github.com/AppFlowy-IO/AppFlowy')
        end
      ),
      'license', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case a.slug
          when 'openhands' then 'The core repository is MIT licensed; OpenHands Cloud and Enterprise use the PolyForm Free Trial License.'
          when 'pi-hole' then 'The official Pi-hole core repository identifies the EUPL-1.2 license.'
          when 'traefik' then 'The official Traefik repository identifies the MIT license.'
          when 'lobehub' then 'The project uses its Community License, based on Apache-2.0 with additional conditions.'
          when 'appflowy' then 'The current self-host server is distributed under AppFlowy Self-Hosted Commercial License; the older AppFlowy Cloud repository is archived and no longer builds the current server.'
          else 'The official repository identifies the MIT license.'
        end,
        'source_urls', case a.slug
          when 'openhands' then jsonb_build_array('https://github.com/OpenHands/OpenHands/blob/main/LICENSE', 'https://github.com/OpenHands/enterprise/blob/main/LICENSE')
          when 'pi-hole' then jsonb_build_array('https://github.com/pi-hole/pi-hole/blob/master/LICENSE')
          when 'traefik' then jsonb_build_array('https://github.com/traefik/traefik/blob/master/LICENSE')
          when 'lobehub' then jsonb_build_array('https://github.com/lobehub/lobehub/blob/canary/LICENSE')
          when 'appflowy' then jsonb_build_array('https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/SELF_HOST_LICENSE_AGREEMENT.md', 'https://github.com/AppFlowy-IO/AppFlowy-Cloud/blob/main/README.md')
          when 'anythingllm' then jsonb_build_array('https://github.com/Mintplex-Labs/anything-llm/blob/master/LICENSE')
          else jsonb_build_array('https://github.com/ChatGPTNextWeb/NextChat/blob/main/LICENSE')
        end
      ),
      'docker', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', 'Official project Docker instructions or deployment files were checked.',
        'source_urls', case a.slug
          when 'nextchat' then jsonb_build_array('https://github.com/ChatGPTNextWeb/NextChat#deployment')
          when 'openhands' then jsonb_build_array('https://docs.openhands.dev/openhands/usage/run-openhands/local-setup')
          when 'pi-hole' then jsonb_build_array('https://docs.pi-hole.net/docker/', 'https://github.com/pi-hole/docker-pi-hole')
          when 'traefik' then jsonb_build_array('https://doc.traefik.io/traefik/getting-started/quick-start/')
          when 'lobehub' then jsonb_build_array('https://lobehub.com/docs/self-hosting/server-database/docker-compose')
          when 'appflowy' then jsonb_build_array('https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production', 'https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial')
          else jsonb_build_array('https://docs.anythingllm.com/installation-docker/quickstart')
        end
      ),
      'docker_image', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', 'The image name was checked against the official install instructions or publisher registry.',
        'source_urls', case a.slug
          when 'nextchat' then jsonb_build_array('https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml', 'https://hub.docker.com/r/yidadaa/chatgpt-next-web')
          when 'openhands' then jsonb_build_array('https://docs.openhands.dev/openhands/usage/run-openhands/local-setup')
          when 'pi-hole' then jsonb_build_array('https://docs.pi-hole.net/docker/', 'https://hub.docker.com/r/pihole/pihole')
          when 'lobehub' then jsonb_build_array('https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml', 'https://hub.docker.com/r/lobehub/lobehub')
          when 'appflowy' then jsonb_build_array('https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml', 'https://hub.docker.com/r/appflowyinc/appflowy_cloud')
          when 'traefik' then jsonb_build_array('https://doc.traefik.io/traefik/getting-started/quick-start/', 'https://hub.docker.com/_/traefik')
          else jsonb_build_array('https://docs.anythingllm.com/installation-docker/available-images', 'https://hub.docker.com/r/mintplexlabs/anythingllm')
        end
      ),
      'compose', jsonb_build_object(
        'status', case when a.slug = 'openhands' then 'unchecked' else 'published' end,
        'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case a.slug
          when 'openhands' then 'The checked official local setup documents Docker CLI; an official Compose option was not verified.'
          when 'pi-hole' then 'The official Docker guide provides a Docker Compose configuration.'
          when 'traefik' then 'The official quick start provides a Docker Compose configuration.'
          when 'appflowy' then 'The current official self-host repository provides a Docker Compose stack for AppFlowy Cloud and its supporting services.'
          else 'The official project repository provides a Docker Compose deployment.'
        end,
        'source_urls', case a.slug
          when 'nextchat' then jsonb_build_array('https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml')
          when 'openhands' then jsonb_build_array('https://docs.openhands.dev/openhands/usage/run-openhands/local-setup')
          when 'pi-hole' then jsonb_build_array('https://docs.pi-hole.net/docker/')
          when 'traefik' then jsonb_build_array('https://doc.traefik.io/traefik/getting-started/quick-start/')
          when 'lobehub' then jsonb_build_array('https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml')
          when 'appflowy' then jsonb_build_array('https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml')
          else jsonb_build_array('https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml')
        end
      ),
      'database', jsonb_build_object(
        'status', 'published', 'checked_at', to_char(now() at time zone 'utc', 'YYYY-MM-DD'), 'confidence', 'high',
        'note', case a.slug
          when 'nextchat' then 'The official README says chat data is stored in the browser; the Compose file starts only the app container.'
          when 'openhands' then 'The official single-container local setup does not require a separate database service.'
          when 'pi-hole' then 'Pi-hole uses embedded SQLite databases and does not require a database server.'
          when 'traefik' then 'The official quick start starts the proxy container without a database service.'
          when 'lobehub' then 'The official deployment uses PostgreSQL; Redis and S3-compatible storage are also part of the stack.'
          when 'appflowy' then 'The official Compose stack includes PostgreSQL and uses Redis and object storage alongside AppFlowy Cloud.'
          else 'The official Docker setup persists application and vector data in its storage directory; the default deployment does not require a separate database service.'
        end,
        'source_urls', case a.slug
          when 'nextchat' then jsonb_build_array('https://github.com/ChatGPTNextWeb/NextChat#readme', 'https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml')
          when 'openhands' then jsonb_build_array('https://docs.openhands.dev/openhands/usage/run-openhands/local-setup')
          when 'pi-hole' then jsonb_build_array('https://docs.pi-hole.net/database/', 'https://docs.pi-hole.net/docker/')
          when 'traefik' then jsonb_build_array('https://doc.traefik.io/traefik/getting-started/quick-start/')
          when 'lobehub' then jsonb_build_array('https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml')
          when 'appflowy' then jsonb_build_array('https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml')
          else jsonb_build_array('https://docs.anythingllm.com/installation-docker/quickstart', 'https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml')
        end
      )
    ),
    data_checked_at = now(),
    technical_facts_checked_at = now(),
    data_confidence = 'medium',
    updated_at = now()
where a.slug in ('nextchat', 'openhands', 'pi-hole', 'traefik', 'lobehub', 'appflowy', 'anythingllm')
  and a.published = true
  and a.self_hosting_status = 'self_hostable';

-- Add app-specific estimated resource ranges and clear the generic basis for this batch.
insert into public.self_host_app_resource_estimates (
  app_id, ram_estimate_min_mb, ram_estimate_max_mb, ram_estimate_kind, ram_estimate_confidence,
  ram_estimate_basis, ram_source_urls, storage_estimate_min_gb, storage_estimate_max_gb,
  storage_estimate_kind, storage_estimate_confidence, storage_estimate_basis, storage_source_urls, checked_at
)
select a.id, r.ram_min, r.ram_max, 'estimated', r.ram_confidence, r.ram_basis, r.ram_sources,
       r.storage_min, r.storage_max, 'estimated', r.storage_confidence, r.storage_basis, r.storage_sources, current_date
from jsonb_to_recordset($resources$[
  {"slug":"nextchat","ram_min":256,"ram_max":1024,"ram_confidence":"low","ram_basis":"Estimate for the lightweight Next.js chat service; chat data stays in the browser, and LLM inference runs at the configured provider.","ram_sources":["https://github.com/ChatGPTNextWeb/NextChat#readme","https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml"],"storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"Estimate for the app container and updates; the project stores chat data in the browser rather than on the server.","storage_sources":["https://github.com/ChatGPTNextWeb/NextChat#readme","https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml"]},
  {"slug":"openhands","ram_min":4096,"ram_max":16384,"ram_confidence":"medium","ram_basis":"The official local setup recommends at least 4 GB RAM; active agent sandboxes and parallel tasks can use more.","ram_sources":["https://docs.openhands.dev/openhands/usage/run-openhands/local-setup"],"storage_min":10,"storage_max":100,"storage_confidence":"low","storage_basis":"Estimate includes container images, agent workspaces, and saved application state; task volume changes disk use.","storage_sources":["https://docs.openhands.dev/openhands/usage/run-openhands/local-setup"]},
  {"slug":"pi-hole","ram_min":256,"ram_max":1024,"ram_confidence":"low","ram_basis":"Estimate for a small DNS filtering service; request rate, blocklists, and query retention change memory use.","ram_sources":["https://docs.pi-hole.net/docker/","https://docs.pi-hole.net/database/"],"storage_min":1,"storage_max":10,"storage_confidence":"low","storage_basis":"Estimate includes Pi-hole configuration, blocklists, and the SQLite query history database.","storage_sources":["https://docs.pi-hole.net/docker/","https://docs.pi-hole.net/database/"]},
  {"slug":"traefik","ram_min":128,"ram_max":1024,"ram_confidence":"low","ram_basis":"Estimate for a small reverse proxy; route count, providers, traffic, and access logging affect use.","ram_sources":["https://doc.traefik.io/traefik/getting-started/quick-start/"],"storage_min":1,"storage_max":10,"storage_confidence":"low","storage_basis":"Estimate includes configuration, certificates, and optional access logs.","storage_sources":["https://doc.traefik.io/traefik/getting-started/quick-start/"]},
  {"slug":"lobehub","ram_min":4096,"ram_max":16384,"ram_confidence":"low","ram_basis":"Estimate for the documented PostgreSQL, Redis, object storage, and app stack; usage grows with concurrent users and enabled features.","ram_sources":["https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml","https://lobehub.com/docs/self-hosting/server-database/docker-compose"],"storage_min":20,"storage_max":200,"storage_confidence":"low","storage_basis":"Estimate includes database state and uploaded files or knowledge-base content stored through the S3-compatible service.","storage_sources":["https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml","https://lobehub.com/docs/self-hosting/server-database/docker-compose"]},
  {"slug":"appflowy","ram_min":4096,"ram_max":16384,"ram_confidence":"low","ram_basis":"Estimate for the full self-hosted Compose stack, including PostgreSQL, Redis, authentication, object storage, web, worker, and search services; load and enabled services affect use.","ram_sources":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production"],"storage_min":20,"storage_max":200,"storage_confidence":"low","storage_basis":"Estimate includes database state, object storage, uploads, and container volumes; workspace files and user count drive growth.","storage_sources":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production"]},
  {"slug":"anythingllm","ram_min":2048,"ram_max":8192,"ram_confidence":"low","ram_basis":"Estimate for the application and document indexing without local model inference; embeddings and document volume affect use.","ram_sources":["https://docs.anythingllm.com/installation-docker/system-requirements","https://docs.anythingllm.com/installation-docker/quickstart"],"storage_min":5,"storage_max":100,"storage_confidence":"low","storage_basis":"Estimate includes application state, uploaded documents, and vector indexes; content volume and retention determine disk use.","storage_sources":["https://docs.anythingllm.com/installation-docker/quickstart","https://docs.anythingllm.com/installation-docker/available-images"]}
]$resources$::jsonb) as r(
  slug text, ram_min integer, ram_max integer, ram_confidence text, ram_basis text, ram_sources text[],
  storage_min integer, storage_max integer, storage_confidence text, storage_basis text, storage_sources text[]
)
join public.self_host_apps a on a.slug = r.slug
where a.published = true and a.self_hosting_status = 'self_hostable'
on conflict (app_id) do update set
  ram_estimate_min_mb = excluded.ram_estimate_min_mb,
  ram_estimate_max_mb = excluded.ram_estimate_max_mb,
  ram_estimate_kind = excluded.ram_estimate_kind,
  ram_estimate_confidence = excluded.ram_estimate_confidence,
  ram_estimate_basis = excluded.ram_estimate_basis,
  ram_source_urls = excluded.ram_source_urls,
  storage_estimate_min_gb = excluded.storage_estimate_min_gb,
  storage_estimate_max_gb = excluded.storage_estimate_max_gb,
  storage_estimate_kind = excluded.storage_estimate_kind,
  storage_estimate_confidence = excluded.storage_estimate_confidence,
  storage_estimate_basis = excluded.storage_estimate_basis,
  storage_source_urls = excluded.storage_source_urls,
  checked_at = excluded.checked_at,
  updated_at = now();

-- Correct the Docker and Compose choices shown in app detail views.
update public.self_host_app_install_options i
set docker_urls = case a.slug
      when 'nextchat' then array['https://hub.docker.com/r/yidadaa/chatgpt-next-web']::text[]
      when 'openhands' then array['https://docs.openhands.dev/openhands/usage/run-openhands/local-setup']::text[]
      when 'pi-hole' then array['https://hub.docker.com/r/pihole/pihole']::text[]
      when 'lobehub' then array['https://hub.docker.com/r/lobehub/lobehub']::text[]
      when 'appflowy' then array['https://hub.docker.com/r/appflowyinc/appflowy_cloud']::text[]
      when 'anythingllm' then array['https://hub.docker.com/r/mintplexlabs/anythingllm']::text[]
      else i.docker_urls
    end,
    docker_images = case a.slug
      when 'nextchat' then array['yidadaa/chatgpt-next-web:latest']::text[]
      when 'openhands' then array['docker.openhands.dev/openhands/openhands:1.8']::text[]
      when 'pi-hole' then array['pihole/pihole:latest']::text[]
      when 'lobehub' then array['lobehub/lobehub:latest']::text[]
      when 'appflowy' then array['appflowyinc/appflowy_cloud:latest']::text[]
      when 'anythingllm' then array['mintplexlabs/anythingllm:latest']::text[]
      else i.docker_images
    end,
    compose_urls = case a.slug
      when 'nextchat' then array['https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml']::text[]
      when 'pi-hole' then array['https://docs.pi-hole.net/docker/']::text[]
      when 'traefik' then array['https://doc.traefik.io/traefik/getting-started/quick-start/']::text[]
      when 'lobehub' then array['https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml']::text[]
      when 'appflowy' then array['https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml']::text[]
      when 'anythingllm' then array['https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml']::text[]
      when 'openhands' then array[]::text[]
      else i.compose_urls
    end,
    source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(i.source_urls, array[]::text[]) || case a.slug
        when 'nextchat' then array['https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml','https://hub.docker.com/r/yidadaa/chatgpt-next-web']::text[]
        when 'openhands' then array['https://docs.openhands.dev/openhands/usage/run-openhands/local-setup']::text[]
        when 'pi-hole' then array['https://docs.pi-hole.net/docker/','https://github.com/pi-hole/docker-pi-hole']::text[]
        when 'traefik' then array['https://doc.traefik.io/traefik/getting-started/quick-start/']::text[]
        when 'lobehub' then array['https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml']::text[]
        when 'appflowy' then array['https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production','https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml','https://hub.docker.com/r/appflowyinc/appflowy_cloud']::text[]
        else array['https://docs.anythingllm.com/installation-docker/quickstart','https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml']::text[]
      end) as sources(source_url)
    ),
    options = (
      select coalesce(jsonb_agg(option_item order by coalesce((option_item->>'sort_order')::integer, 999)), '[]'::jsonb)
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as items(option_item)
      where not (
        (a.slug in ('nextchat','pi-hole','traefik','appflowy','anythingllm') and option_item->>'method' in ('docker','compose'))
        or (a.slug = 'openhands' and option_item->>'method' in ('docker','compose'))
        or (a.slug = 'lobehub' and option_item->>'method' = 'docker')
      )
    ) || case a.slug
      when 'nextchat' then jsonb_build_array(
        jsonb_build_object('method','docker','label','Official Docker image','url','https://hub.docker.com/r/yidadaa/chatgpt-next-web','image','yidadaa/chatgpt-next-web:latest','support_level','official','source_url','https://github.com/ChatGPTNextWeb/NextChat#deployment','note',null,'sort_order',10),
        jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml','image','yidadaa/chatgpt-next-web:latest','support_level','official','source_url','https://github.com/ChatGPTNextWeb/NextChat/blob/main/docker-compose.yml','note',null,'sort_order',20))
      when 'openhands' then jsonb_build_array(
        jsonb_build_object('method','docker','label','Official OpenHands Docker setup','url','https://docs.openhands.dev/openhands/usage/run-openhands/local-setup','image','docker.openhands.dev/openhands/openhands:1.8','support_level','official','source_url','https://docs.openhands.dev/openhands/usage/run-openhands/local-setup','note','The setup also pulls the agent-server image for isolated task environments.','sort_order',10))
      when 'pi-hole' then jsonb_build_array(
        jsonb_build_object('method','docker','label','Official Pi-hole Docker image','url','https://hub.docker.com/r/pihole/pihole','image','pihole/pihole:latest','support_level','official','source_url','https://docs.pi-hole.net/docker/','note',null,'sort_order',10),
        jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://docs.pi-hole.net/docker/','image','pihole/pihole:latest','support_level','official','source_url','https://docs.pi-hole.net/docker/','note',null,'sort_order',20))
      when 'traefik' then jsonb_build_array(
        jsonb_build_object('method','compose','label','Official Docker Compose quick start','url','https://doc.traefik.io/traefik/getting-started/quick-start/','image','traefik:v3.7.12','support_level','official','source_url','https://doc.traefik.io/traefik/getting-started/quick-start/','note',null,'sort_order',20))
      when 'lobehub' then jsonb_build_array(
        jsonb_build_object('method','docker','label','Official LobeHub image','url','https://hub.docker.com/r/lobehub/lobehub','image','lobehub/lobehub:latest','support_level','official','source_url','https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml','note','The documented deployment uses PostgreSQL, Redis, and S3-compatible storage with the app.','sort_order',10),
        jsonb_build_object('method','compose','label','Official Docker Compose stack','url','https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml','image','lobehub/lobehub:latest','support_level','official','source_url','https://github.com/lobehub/lobehub/blob/canary/docker-compose/deploy/docker-compose.yml','note',null,'sort_order',20))
      when 'appflowy' then jsonb_build_array(
        jsonb_build_object('method','docker','label','Official AppFlowy Cloud image','url','https://hub.docker.com/r/appflowyinc/appflowy_cloud','image','appflowyinc/appflowy_cloud:latest','support_level','official','source_url','https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml','note','Use as part of the official Compose stack; the server needs PostgreSQL, Redis, authentication, and object storage services.','sort_order',10),
        jsonb_build_object('method','compose','label','Official AppFlowy self-hosted stack','url','https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml','image','appflowyinc/appflowy_cloud:latest','support_level','official','source_url','https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml','note','The free tier includes one user seat; larger plans are paid.','sort_order',20))
      else jsonb_build_array(
        jsonb_build_object('method','docker','label','Official AnythingLLM Docker image','url','https://hub.docker.com/r/mintplexlabs/anythingllm','image','mintplexlabs/anythingllm:latest','support_level','official','source_url','https://docs.anythingllm.com/installation-docker/available-images','note',null,'sort_order',10),
        jsonb_build_object('method','compose','label','Official Docker Compose setup','url','https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml','image',null,'support_level','official','source_url','https://github.com/Mintplex-Labs/anything-llm/blob/master/docker/docker-compose.yml','note','Builds the app from the official source repository.','sort_order',20))
    end,
    checked_at = current_date,
    updated_at = now()
from public.self_host_apps a
where i.app_id = a.id
  and a.slug in ('nextchat','pi-hole','traefik','lobehub','appflowy','anythingllm');

-- Create the official Docker choice for OpenHands, which has no install-options row yet.
insert into public.self_host_app_install_options (app_id, docker_urls, docker_images, compose_urls, options, source_urls, checked_at)
select a.id,
       array['https://docs.openhands.dev/openhands/usage/run-openhands/local-setup']::text[],
       array['docker.openhands.dev/openhands/openhands:1.8']::text[],
       array[]::text[],
       jsonb_build_array(jsonb_build_object('method','docker','label','Official OpenHands Docker setup','url','https://docs.openhands.dev/openhands/usage/run-openhands/local-setup','image','docker.openhands.dev/openhands/openhands:1.8','support_level','official','source_url','https://docs.openhands.dev/openhands/usage/run-openhands/local-setup','note','The setup also pulls the agent-server image for isolated task environments.','sort_order',10)),
       array['https://docs.openhands.dev/openhands/usage/run-openhands/local-setup']::text[],
       current_date
from public.self_host_apps a
where a.slug = 'openhands'
on conflict (app_id) do update set
  docker_urls = excluded.docker_urls,
  docker_images = excluded.docker_images,
  compose_urls = excluded.compose_urls,
  options = excluded.options,
  source_urls = array(
    select distinct source_url
    from unnest(coalesce(public.self_host_app_install_options.source_urls, array[]::text[]) || excluded.source_urls) as sources(source_url)
    where source_url is not null
    order by source_url
  ),
  checked_at = excluded.checked_at,
  updated_at = now();

commit;
