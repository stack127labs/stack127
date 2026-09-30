begin;

do $review_guard$
declare
  r record;
  actual_categories text[];
begin
  for r in select * from jsonb_to_recordset($expected$
    [
      {"slug":"gitness","name":"gitness","source_model":"closed_source","source_code_url":null,"license":null,"publisher_name":"gitness","docker_image":"harness/gitness:latest","docker_support":"community","requires_database":null,"database_types":[],"storage_profile":"unknown","persistent_storage":null},
      {"slug":"crawl4ai","name":"Crawl4AI","source_model":"closed_source","source_code_url":null,"license":null,"publisher_name":"Crawl4AI","docker_image":"unclecode/crawl4ai:latest","docker_support":"community","requires_database":null,"database_types":[],"storage_profile":"unknown","persistent_storage":null},
      {"slug":"appflowy","name":"AppFlowy","source_model":"closed_source","source_code_url":null,"license":"AppFlowy Self-Hosted Commercial License","publisher_name":"AppFlowy Pte. Ltd.","docker_image":"appflowyinc/appflowy_cloud:latest","docker_support":"official","requires_database":true,"database_types":["postgresql"],"storage_profile":"high","persistent_storage":null},
      {"slug":"maybe","name":"Maybe","source_model":"open_source","source_code_url":"https://github.com/maybe-finance/maybe","license":"AGPL-3.0","publisher_name":"maybe-finance","docker_image":"ghcr.io/maybe-finance/maybe:0.6.0@sha256:1e791e88ecc4d124d05142d943bcec5b5a172e889f648c97d334363133384f01","docker_support":"official","requires_database":true,"database_types":["postgres","redis"],"storage_profile":"unknown","persistent_storage":true,"maintenance_status":"archived"},
      {"slug":"youtrack","name":"YouTrack","source_model":"closed_source","source_code_url":null,"license":null,"publisher_name":"YouTrack","docker_image":"jetbrains/youtrack:2023.1.17582","docker_support":"community","requires_database":null,"database_types":[],"storage_profile":"unknown","persistent_storage":null},
      {"slug":"confluence","name":"Confluence","source_model":"closed_source","source_code_url":null,"license":null,"publisher_name":"Confluence","docker_image":"atlassian/confluence-server","docker_support":"community","requires_database":null,"database_types":[],"storage_profile":"unknown","persistent_storage":null}
    ]
  $expected$::jsonb) as x(
    slug text,name text,source_model text,source_code_url text,license text,publisher_name text,
    docker_image text,docker_support text,requires_database boolean,database_types text[],
    storage_profile text,persistent_storage boolean,maintenance_status text
  )
  loop
    if not exists (
      select 1 from public.self_host_apps a
      where a.slug=r.slug and a.published=true and a.self_hosting_status='self_hostable'
        and a.name is not distinct from r.name
        and a.source_model::text is not distinct from r.source_model
        and a.source_code_url is not distinct from r.source_code_url
        and a.license is not distinct from r.license
        and a.publisher_name is not distinct from r.publisher_name
        and a.docker_image is not distinct from r.docker_image
        and a.docker_support is not distinct from r.docker_support
        and a.requires_database is not distinct from r.requires_database
        and a.database_types is not distinct from r.database_types
        and a.storage_profile is not distinct from r.storage_profile
        and a.persistent_storage is not distinct from r.persistent_storage
        and (r.maintenance_status is null or a.maintenance_status is not distinct from r.maintenance_status)
    ) then
      raise exception 'App % changed since batch 18 review',r.slug;
    end if;
  end loop;

  for r in select * from (values
    ('gitness',array['developer-tools','system-admin-hosting']::text[]),
    ('crawl4ai',array['ai-ml','search']::text[]),
    ('appflowy',array['monitoring-status','project-task-management']::text[]),
    ('maybe',array['finance-budgeting']::text[]),
    ('youtrack',array['ai-ml','knowledge-notes','project-task-management']::text[]),
    ('confluence',array['photos-galleries','system-admin-hosting']::text[])
  ) expected(slug,categories)
  loop
    select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into actual_categories
    from public.self_host_app_category_links l
    join public.self_host_apps a on a.id=l.app_id
    join public.self_host_app_categories c on c.id=l.category_id
    where a.slug=r.slug;
    if actual_categories is distinct from r.categories then
      raise exception 'Categories for % changed since batch 18 review',r.slug;
    end if;
  end loop;

  if (
    select count(*) from public.self_host_app_resource_estimates e
    join public.self_host_apps a on a.id=e.app_id
    where (a.slug,e.ram_estimate_min_mb,e.ram_estimate_max_mb,e.ram_estimate_basis,e.storage_estimate_min_gb,e.storage_estimate_max_gb,e.storage_estimate_basis) in (
      ('gitness',256,2048,'Typical small self-hosted instance; workload and stored data vary.',1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('crawl4ai',8192,32768,'Small local model workload; model size and outputs vary.',20,100,'Small local model workload; model size and outputs vary.'),
      ('appflowy',4096,16384,'Estimate for the full self-hosted Compose stack, including PostgreSQL, Redis, authentication, object storage, web, worker, and search services; load and enabled services affect use.',20,200,'Estimate includes database state, object storage, uploads, and container volumes; workspace files and user count drive growth.'),
      ('maybe',256,2048,'Typical small self-hosted instance; workload and stored data vary.',1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('youtrack',2048,8192,'Typical small self-hosted instance; workload and stored data vary.',1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('confluence',256,2048,'Typical small self-hosted instance; workload and stored data vary.',50,500,'Typical small self-hosted instance; workload and stored data vary.')
    )
  ) <> 6 then
    raise exception 'One or more resource estimate rows changed since batch 18 review';
  end if;

  if (
    select count(*) from public.self_host_app_install_options i
    join public.self_host_apps a on a.id=i.app_id
    where a.slug in ('gitness','crawl4ai','appflowy','maybe','youtrack','confluence')
      and (
        (a.slug='gitness' and i.options @> '[{"method":"docker","image":"harness/gitness:latest","support_level":"community"}]'::jsonb)
        or (a.slug='crawl4ai' and i.options @> '[{"method":"docker","image":"unclecode/crawl4ai:latest","support_level":"community"}]'::jsonb)
        or (a.slug='appflowy' and i.options @> '[{"method":"docker","image":"appflowyinc/appflowy_cloud:latest","support_level":"official"}]'::jsonb)
        or (a.slug='maybe' and i.options @> '[{"method":"docker","image":"ghcr.io/maybe-finance/maybe:0.6.0@sha256:1e791e88ecc4d124d05142d943bcec5b5a172e889f648c97d334363133384f01"}]'::jsonb)
        or (a.slug='youtrack' and i.options @> '[{"method":"docker","image":"jetbrains/youtrack:2023.1.17582","support_level":"community"}]'::jsonb)
        or (a.slug='confluence' and i.options @> '[{"method":"docker","image":"atlassian/confluence-server","support_level":"community"}]'::jsonb)
      )
  ) <> 6 then
    raise exception 'Install options changed since batch 18 review';
  end if;
end;
$review_guard$;

with reviewed as (
  select * from jsonb_to_recordset($apps$
    [
      {
        "slug":"gitness","name":"Harness Open Source","summary":"Open-source software delivery platform for Git hosting, CI/CD pipelines, development environments, and artifact registries.",
        "website_url":"https://www.harness.io/open-source","source_code_url":"https://github.com/harness/harness","source_code_host":"github",
        "docs_url":"https://github.com/harness/harness","install_docs_url":"https://github.com/harness/harness#readme",
        "docker_url":"https://hub.docker.com/r/harness/harness","docker_image":"harness/harness",
        "license":"Apache License 2.0","license_type":"permissive","license_spdx_id":"Apache-2.0","source_model":"open_source",
        "publisher_name":"Harness, Inc.","publisher_type":"company","publisher_url":"https://www.harness.io/",
        "docker_support":"official","compose_support":false,"compose_url":null,
        "requires_database":false,"database_types":[],"storage_profile":"depends","persistent_storage":true,
        "ram_min_mb":null,"ram_recommended_mb":null,"storage_min_gb":null,"resource_requirement_kind":"unknown",
        "deployment_methods":["docker"],"summary_source":"https://www.harness.io/open-source","summary_confidence":"high","data_confidence":"high",
        "data_source_urls":["https://www.harness.io/open-source","https://github.com/harness/harness","https://github.com/harness/harness/blob/main/LICENSE","https://hub.docker.com/r/harness/harness"],
        "status_update":{
          "source":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Harness Open Source links to the current harness/harness repository.","source_urls":["https://www.harness.io/open-source","https://github.com/harness/harness"]},
          "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository declares Apache License 2.0.","source_urls":["https://github.com/harness/harness/blob/main/LICENSE"]},
          "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The product site identifies Harness, Inc. as its publisher.","source_urls":["https://www.harness.io/open-source"]},
          "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project README links the current released Docker image.","source_urls":["https://github.com/harness/harness#readme","https://hub.docker.com/r/harness/harness"]},
          "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The app stores its database and repositories in /data and needs no separate database service.","source_urls":["https://github.com/harness/harness#readme"]},
          "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The README recommends a bind mount or named volume for /data.","source_urls":["https://github.com/harness/harness#readme"]},
          "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The directory range estimates a small instance; pipeline containers add workload-dependent use.","source_urls":["https://github.com/harness/harness#readme"]},
          "storage_capacity":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Repository history and pipeline artifacts drive the estimate.","source_urls":["https://github.com/harness/harness#readme"]}
        }
      },
      {
        "slug":"crawl4ai","name":"Crawl4AI","summary":"Web crawler and scraper that turns websites into clean Markdown for LLMs, agents, and data pipelines.",
        "website_url":"https://crawl4ai.com/","source_code_url":"https://github.com/unclecode/crawl4ai","source_code_host":"github",
        "docs_url":"https://docs.crawl4ai.com/","install_docs_url":"https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md",
        "docker_url":"https://hub.docker.com/r/unclecode/crawl4ai","docker_image":"unclecode/crawl4ai:latest",
        "license":"Apache License 2.0","license_type":"permissive","license_spdx_id":"Apache-2.0","source_model":"open_source",
        "publisher_name":"Crawl4AI","publisher_type":"unknown","publisher_url":"https://crawl4ai.com/",
        "docker_support":"official","compose_support":true,"compose_url":"https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml",
        "requires_database":false,"database_types":[],"storage_profile":"depends","persistent_storage":true,
        "ram_min_mb":4096,"ram_recommended_mb":null,"storage_min_gb":null,"resource_requirement_kind":"official_minimum",
        "deployment_methods":["docker","compose","unraid"],"summary_source":"https://github.com/unclecode/crawl4ai","summary_confidence":"high","data_confidence":"high",
        "data_source_urls":["https://crawl4ai.com/","https://docs.crawl4ai.com/","https://github.com/unclecode/crawl4ai","https://github.com/unclecode/crawl4ai/blob/main/LICENSE","https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml","https://hub.docker.com/r/unclecode/crawl4ai","https://docs.crawl4ai.com/advanced/advanced-features/","https://docs.crawl4ai.com/core/cache-modes/"],
        "status_update":{
          "source":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official project repository is public.","source_urls":["https://github.com/unclecode/crawl4ai"]},
          "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository declares Apache License 2.0.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/LICENSE"]},
          "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official guide recommends the project's Docker Hub image.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","https://hub.docker.com/r/unclecode/crawl4ai"]},
          "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project provides an official Compose file.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml"]},
          "database":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The documented server deployment does not require a separate database service.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml"]},
          "storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Crawl4AI can keep a local crawl cache and saved browser profiles.","source_urls":["https://docs.crawl4ai.com/core/cache-modes/","https://docs.crawl4ai.com/advanced/advanced-features/"]},
          "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Saved caches and browser profiles can be retained between runs.","source_urls":["https://docs.crawl4ai.com/core/cache-modes/","https://docs.crawl4ai.com/advanced/advanced-features/"]},
          "ram":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide calls for at least 4 GB of RAM.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md"]},
          "storage_capacity":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Cache, profiles, and retained crawl output determine the directory estimate.","source_urls":["https://docs.crawl4ai.com/core/cache-modes/","https://docs.crawl4ai.com/advanced/advanced-features/"]}
        }
      },
      {
        "slug":"appflowy","name":"AppFlowy","summary":"Workspace app for documents, databases, tasks, and project notes.",
        "website_url":"https://appflowy.com/","source_code_url":"https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial","source_code_host":"github",
        "docs_url":"https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production","install_docs_url":"https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production",
        "docker_url":"https://hub.docker.com/r/appflowyinc/appflowy_cloud","docker_image":"appflowyinc/appflowy_cloud:latest",
        "license":"AppFlowy Self-Hosted Commercial License","license_type":"custom","license_spdx_id":null,"source_model":"source_available",
        "publisher_name":"AppFlowy Pte. Ltd.","publisher_type":"company","publisher_url":"https://appflowy.com/",
        "docker_support":"official","compose_support":true,"compose_url":"https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml",
        "requires_database":true,"database_types":["postgresql","redis"],"storage_profile":"high","persistent_storage":true,
        "ram_min_mb":null,"ram_recommended_mb":null,"storage_min_gb":null,"resource_requirement_kind":"unknown",
        "deployment_methods":["docker","compose"],"summary_source":"https://appflowy.com/","summary_confidence":"high","data_confidence":"high",
        "data_source_urls":["https://appflowy.com/","https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production","https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial","https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/SELF_HOST_LICENSE_AGREEMENT.md","https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://hub.docker.com/r/appflowyinc/appflowy_cloud"],
        "status_update":{
          "source":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official production self-host server source is public under a commercial license.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial"]},
          "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The self-host repository declares the AppFlowy Self-Hosted Commercial License.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/SELF_HOST_LICENSE_AGREEMENT.md"]},
          "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository includes its Docker image and full self-host stack.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://hub.docker.com/r/appflowyinc/appflowy_cloud"]},
          "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official self-host repository includes a Compose stack.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]},
          "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official stack includes PostgreSQL and Redis.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]},
          "storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The stack stores database state and uploaded files in persistent volumes.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]},
          "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose stack mounts persistent database and object-storage volumes.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]},
          "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The directory range estimates the full stack; AppFlowy does not give one fixed RAM requirement.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]},
          "storage_capacity":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Workspace files, uploads, and backups drive the directory estimate.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]}
        }
      },
      {
        "slug":"maybe","name":"Maybe","summary":"Tracks accounts, transactions, budgets, investments, and net worth in one personal finance workspace.",
        "website_url":null,"source_code_url":"https://github.com/maybe-finance/maybe","source_code_host":"github",
        "docs_url":"https://github.com/maybe-finance/maybe","install_docs_url":"https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md",
        "docker_url":"https://github.com/maybe-finance/maybe/pkgs/container/maybe","docker_image":"ghcr.io/maybe-finance/maybe:latest",
        "license":"AGPL-3.0","license_type":"copyleft","license_spdx_id":"AGPL-3.0","source_model":"open_source",
        "publisher_name":"maybe-finance","publisher_type":"unknown","publisher_url":"https://github.com/maybe-finance",
        "docker_support":"official","compose_support":true,"compose_url":"https://github.com/maybe-finance/maybe/blob/main/compose.example.yml",
        "requires_database":true,"database_types":["postgres","redis"],"storage_profile":"depends","persistent_storage":true,
        "ram_min_mb":null,"ram_recommended_mb":null,"storage_min_gb":null,"resource_requirement_kind":"unknown",
        "deployment_methods":["docker","compose","umbrel"],"summary_source":"https://github.com/maybe-finance/maybe","summary_confidence":"high","data_confidence":"high",
        "data_source_urls":["https://github.com/maybe-finance/maybe","https://github.com/maybe-finance/maybe/blob/main/LICENSE","https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md","https://github.com/maybe-finance/maybe/blob/main/compose.example.yml","https://github.com/maybe-finance/maybe/releases","https://github.com/maybe-finance/maybe/pkgs/container/maybe"],
        "status_update":{
          "source":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The archived project repository contains the source and license.","source_urls":["https://github.com/maybe-finance/maybe","https://github.com/maybe-finance/maybe/blob/main/LICENSE"]},
          "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official archived Docker guide names the GHCR image.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md","https://github.com/maybe-finance/maybe/pkgs/container/maybe"]},
          "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide recommends Compose and links the project sample.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md","https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
          "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official stack uses PostgreSQL and Redis.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
          "storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Compose stack stores PostgreSQL and Redis data in named volumes.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
          "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose sample defines persistent app, PostgreSQL, and Redis volumes.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
          "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The archived project gives no fixed RAM requirement; the directory range estimates its Compose stack.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
          "storage_capacity":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Imported records and backup retention drive the directory estimate.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
          "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The owner archived the repository on July 27, 2025.","source_urls":["https://github.com/maybe-finance/maybe"]}
        }
      },
      {
        "slug":"youtrack","name":"YouTrack","summary":"Project management application for planning work, tracking tasks, and running agile boards.",
        "website_url":"https://www.jetbrains.com/youtrack/","source_code_url":null,"source_code_host":"unknown",
        "docs_url":"https://www.jetbrains.com/help/youtrack/server/","install_docs_url":"https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html",
        "docker_url":"https://hub.docker.com/r/jetbrains/youtrack","docker_image":"jetbrains/youtrack:2026.1.14055",
        "license":"JetBrains YouTrack Server License Agreement","license_type":"custom","license_spdx_id":null,"source_model":"closed_source",
        "publisher_name":"JetBrains s.r.o.","publisher_type":"company","publisher_url":"https://www.jetbrains.com/",
        "docker_support":"official","compose_support":false,"compose_url":null,
        "requires_database":false,"database_types":[],"storage_profile":"depends","persistent_storage":true,
        "ram_min_mb":1536,"ram_recommended_mb":null,"storage_min_gb":null,"resource_requirement_kind":"official_minimum",
        "deployment_methods":["docker"],"summary_source":"https://www.jetbrains.com/youtrack/","summary_confidence":"high","data_confidence":"high",
        "data_source_urls":["https://www.jetbrains.com/youtrack/","https://www.jetbrains.com/help/youtrack/server/","https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html","https://www.jetbrains.com/help/youtrack/server/youtrack-supported-environments.html","https://www.jetbrains.com/help/youtrack/server/manage-youtrack-server-license.html","https://www.jetbrains.com/legal/docs/youtrack/license/","https://hub.docker.com/r/jetbrains/youtrack"],
        "status_update":{
          "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"JetBrains publishes a YouTrack Server License Agreement and a free plan for up to 10 users and 3 agents.","source_urls":["https://www.jetbrains.com/legal/docs/youtrack/license/","https://www.jetbrains.com/help/youtrack/server/manage-youtrack-server-license.html"]},
          "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The license agreement identifies JetBrains s.r.o. as the legal publisher.","source_urls":["https://www.jetbrains.com/legal/docs/youtrack/license/"]},
          "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"JetBrains documents its official Docker image for evaluation and production.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html","https://hub.docker.com/r/jetbrains/youtrack"]},
          "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"YouTrack stores its database in its own data directory and needs no separate database service.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html"]},
          "storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"YouTrack keeps its database, configuration, logs, and backups in local directories.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html"]},
          "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"JetBrains documents persistent mounted volumes for data, configuration, logs, and backups.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html"]},
          "ram":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"JetBrains lists a 1.5 GB minimum RAM requirement.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-supported-environments.html"]},
          "storage_capacity":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"JetBrains estimates about 1 GB per 5,000 issues, with attachments affecting the total.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-supported-environments.html"]}
        }
      },
      {
        "slug":"confluence","name":"Confluence","summary":"Atlassian's self-managed workspace for shared documentation, project pages, and team knowledge.",
        "website_url":"https://www.atlassian.com/software/confluence","source_code_url":null,"source_code_host":"unknown",
        "docs_url":"https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html","install_docs_url":"https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html",
        "docker_url":"https://hub.docker.com/r/atlassian/confluence","docker_image":"atlassian/confluence:9.2.5-ubi9-r1",
        "license":"Atlassian Customer Agreement (Confluence Data Center subscription)","license_type":"custom","license_spdx_id":null,"source_model":"closed_source",
        "publisher_name":"Atlassian","publisher_type":"company","publisher_url":"https://www.atlassian.com/",
        "docker_support":"official","compose_support":false,"compose_url":null,
        "requires_database":true,"database_types":["postgresql","mysql","oracle","sqlserver"],"storage_profile":"high","persistent_storage":true,
        "ram_min_mb":null,"ram_recommended_mb":2048,"storage_min_gb":null,"resource_requirement_kind":"official_recommended",
        "deployment_methods":["docker"],"summary_source":"https://www.atlassian.com/software/confluence","summary_confidence":"high","data_confidence":"high",
        "data_source_urls":["https://www.atlassian.com/software/confluence","https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html","https://confluence.atlassian.com/doc/supported-platforms-207488198.html","https://www.atlassian.com/licensing/confluence","https://www.atlassian.com/licensing/data-center-end-of-life"],
        "status_update":{
          "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian describes Data Center as its self-managed offering and links its Customer Agreement.","source_urls":["https://www.atlassian.com/licensing/confluence"]},
          "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian is the product publisher.","source_urls":["https://www.atlassian.com/software/confluence"]},
          "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian documents running Confluence Data Center/Server in Docker and provides its own image.","source_urls":["https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html","https://hub.docker.com/r/atlassian/confluence"]},
          "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian says confluence-server stopped receiving tags and updates after February 15, 2024; use atlassian/confluence.","source_urls":["https://hub.docker.com/r/atlassian/confluence"]},
          "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Production Confluence uses a supported external database; MariaDB is unsupported.","source_urls":["https://confluence.atlassian.com/doc/supported-platforms-207488198.html"]},
          "storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Confluence uses its home directory and external database; attachments and indexes need persistent space.","source_urls":["https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/supported-platforms-207488198.html"]},
          "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian recommends mounting the Confluence home directory as a data volume.","source_urls":["https://hub.docker.com/r/atlassian/confluence"]},
          "ram":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian recommends 2 GiB memory for the Docker image.","source_urls":["https://hub.docker.com/r/atlassian/confluence"]},
          "storage_capacity":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Attachments, database content, and backups drive the directory estimate.","source_urls":["https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/supported-platforms-207488198.html"]},
          "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Atlassian lists March 28, 2029 as end of life for impacted Data Center products.","source_urls":["https://www.atlassian.com/licensing/data-center-end-of-life"]}
        }
      }
    ]
  $apps$::jsonb) as r(
    slug text,name text,summary text,website_url text,source_code_url text,source_code_host text,docs_url text,install_docs_url text,
    docker_url text,docker_image text,compose_url text,license text,license_type text,license_spdx_id text,source_model text,
    publisher_name text,publisher_type text,publisher_url text,docker_support text,compose_support boolean,
    requires_database boolean,database_types text[],storage_profile text,persistent_storage boolean,
    ram_min_mb integer,ram_recommended_mb integer,storage_min_gb numeric,resource_requirement_kind text,
    deployment_methods text[],summary_source text,summary_confidence text,data_confidence text,data_source_urls text[],status_update jsonb
  )
)
update public.self_host_apps a set
  name=r.name,summary=r.summary,website_url=r.website_url,source_code_url=r.source_code_url,source_code_host=r.source_code_host,
  docs_url=r.docs_url,install_docs_url=r.install_docs_url,docker_url=r.docker_url,docker_image=r.docker_image,compose_url=r.compose_url,
  license=r.license,license_type=r.license_type::public.open_project_license_type,license_spdx_id=r.license_spdx_id,
  source_model=r.source_model::public.open_project_source_model,
  publisher_name=r.publisher_name,publisher_type=r.publisher_type,publisher_url=r.publisher_url,
  docker_support=r.docker_support,compose_support=r.compose_support,requires_database=r.requires_database,database_types=r.database_types,
  storage_profile=r.storage_profile,persistent_storage=r.persistent_storage,ram_min_mb=r.ram_min_mb,ram_recommended_mb=r.ram_recommended_mb,
  storage_min_gb=r.storage_min_gb,resource_requirement_kind=r.resource_requirement_kind,deployment_methods=r.deployment_methods,
  summary_source=r.summary_source,summary_confidence=r.summary_confidence,data_confidence=r.data_confidence,
  data_source_urls=r.data_source_urls,
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb)||r.status_update,updated_at=now()
from reviewed r
where a.slug=r.slug and a.published=true and a.self_hosting_status='self_hostable';

do $app_update_guard$
begin
  if (select count(*) from public.self_host_apps where slug in ('gitness','crawl4ai','appflowy','maybe','youtrack','confluence') and published=true and self_hosting_status='self_hostable' and data_confidence='high') <> 6 then
    raise exception 'Batch 18 app updates did not complete';
  end if;
end;
$app_update_guard$;

with estimates as (
  select * from jsonb_to_recordset($resource_estimates$
    [
      {"slug":"gitness","resource_kind":"ram","estimate_min":2048,"estimate_max":8192,"estimate_kind":"estimated","confidence":"low","basis":"A small Git and CI service; repository size, pipeline runs, and Docker build containers drive memory use.","source_urls":["https://github.com/harness/harness#readme","https://www.harness.io/open-source"]},
      {"slug":"gitness","resource_kind":"storage","estimate_min":10,"estimate_max":100,"estimate_kind":"estimated","confidence":"low","basis":"The /data volume stores the database and repositories; repository history and pipeline artifacts drive growth.","source_urls":["https://github.com/harness/harness#readme"]},
      {"slug":"crawl4ai","resource_kind":"ram","estimate_min":4096,"estimate_max":16384,"estimate_kind":"estimated","confidence":"medium","basis":"The Docker guide calls for at least 4 GB; concurrent browser pages and crawl size raise use.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md"]},
      {"slug":"crawl4ai","resource_kind":"storage","estimate_min":5,"estimate_max":50,"estimate_kind":"estimated","confidence":"low","basis":"The browser image, local cache, saved profiles, and any retained crawl output use disk; crawl volume and retention drive growth.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","https://docs.crawl4ai.com/advanced/advanced-features/","https://docs.crawl4ai.com/core/cache-modes/"]},
      {"slug":"appflowy","resource_kind":"ram","estimate_min":4096,"estimate_max":16384,"estimate_kind":"estimated","confidence":"low","basis":"The official self-host stack includes PostgreSQL, Redis, object storage, authentication, web, worker, and search services.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production"]},
      {"slug":"appflowy","resource_kind":"storage","estimate_min":20,"estimate_max":200,"estimate_kind":"estimated","confidence":"low","basis":"The stack stores PostgreSQL data and uploaded files in persistent volumes; workspaces, uploads, and backups drive growth.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production"]},
      {"slug":"maybe","resource_kind":"ram","estimate_min":2048,"estimate_max":8192,"estimate_kind":"estimated","confidence":"low","basis":"The official Compose stack runs the web app, worker, PostgreSQL, and Redis; imports and background jobs drive use.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"]},
      {"slug":"maybe","resource_kind":"storage","estimate_min":5,"estimate_max":50,"estimate_kind":"estimated","confidence":"low","basis":"PostgreSQL stores account and transaction data while Redis and backups use persistent volumes; imported records and backup retention drive growth.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml","https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md"]},
      {"slug":"youtrack","resource_kind":"ram","estimate_min":2048,"estimate_max":8192,"estimate_kind":"estimated","confidence":"medium","basis":"JetBrains sets a 1.5 GB minimum; issue count, active users, and workflows increase memory use.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-supported-environments.html"]},
      {"slug":"youtrack","resource_kind":"storage","estimate_min":1,"estimate_max":50,"estimate_kind":"estimated","confidence":"medium","basis":"JetBrains estimates about 1 GB per 5,000 issues; attachments and retained backups add storage.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-supported-environments.html","https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html"]},
      {"slug":"confluence","resource_kind":"ram","estimate_min":2048,"estimate_max":8192,"estimate_kind":"estimated","confidence":"medium","basis":"Atlassian recommends 2 GiB for its Docker image; larger spaces, attachments, and concurrent users need more.","source_urls":["https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html"]},
      {"slug":"confluence","resource_kind":"storage","estimate_min":20,"estimate_max":500,"estimate_kind":"estimated","confidence":"low","basis":"The Confluence home directory and external database store indexes, configuration, and content; attachments and backups drive growth.","source_urls":["https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/supported-platforms-207488198.html"]}
    ]
  $resource_estimates$::jsonb) as r(
    slug text,resource_kind text,estimate_min numeric,estimate_max numeric,
    estimate_kind text,confidence text,basis text,source_urls text[]
  )
), ram as (
  select * from estimates where resource_kind='ram'
)
update public.self_host_app_resource_estimates e set
  ram_estimate_min_mb=r.estimate_min,ram_estimate_max_mb=r.estimate_max,
  ram_estimate_kind=r.estimate_kind,ram_estimate_confidence=r.confidence,
  ram_estimate_basis=r.basis,ram_source_urls=r.source_urls,checked_at=now(),updated_at=now()
from ram r join public.self_host_apps a on a.slug=r.slug
where e.app_id=a.id;

with estimates as (
  select * from jsonb_to_recordset($resource_estimates$
    [
      {"slug":"gitness","resource_kind":"storage","estimate_min":10,"estimate_max":100,"estimate_kind":"estimated","confidence":"low","basis":"The /data volume stores the database and repositories; repository history and pipeline artifacts drive growth.","source_urls":["https://github.com/harness/harness#readme"]},
      {"slug":"crawl4ai","resource_kind":"storage","estimate_min":5,"estimate_max":50,"estimate_kind":"estimated","confidence":"low","basis":"The browser image, local cache, saved profiles, and any retained crawl output use disk; crawl volume and retention drive growth.","source_urls":["https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","https://docs.crawl4ai.com/advanced/advanced-features/","https://docs.crawl4ai.com/core/cache-modes/"]},
      {"slug":"appflowy","resource_kind":"storage","estimate_min":20,"estimate_max":200,"estimate_kind":"estimated","confidence":"low","basis":"The stack stores PostgreSQL data and uploaded files in persistent volumes; workspaces, uploads, and backups drive growth.","source_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","https://appflowy.com/docs/Step-by-step-Self-Hosting-Guide---From-Zero-to-Production"]},
      {"slug":"maybe","resource_kind":"storage","estimate_min":5,"estimate_max":50,"estimate_kind":"estimated","confidence":"low","basis":"PostgreSQL stores account and transaction data while Redis and backups use persistent volumes; imported records and backup retention drive growth.","source_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml","https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md"]},
      {"slug":"youtrack","resource_kind":"storage","estimate_min":1,"estimate_max":50,"estimate_kind":"estimated","confidence":"medium","basis":"JetBrains estimates about 1 GB per 5,000 issues; attachments and retained backups add storage.","source_urls":["https://www.jetbrains.com/help/youtrack/server/youtrack-supported-environments.html","https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html"]},
      {"slug":"confluence","resource_kind":"storage","estimate_min":20,"estimate_max":500,"estimate_kind":"estimated","confidence":"low","basis":"The Confluence home directory and external database store indexes, configuration, and content; attachments and backups drive growth.","source_urls":["https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/supported-platforms-207488198.html"]}
    ]
  $resource_estimates$::jsonb) as r(
    slug text,resource_kind text,estimate_min numeric,estimate_max numeric,
    estimate_kind text,confidence text,basis text,source_urls text[]
  )
)
update public.self_host_app_resource_estimates e set
  storage_estimate_min_gb=r.estimate_min,storage_estimate_max_gb=r.estimate_max,
  storage_estimate_kind=r.estimate_kind,storage_estimate_confidence=r.confidence,
  storage_estimate_basis=r.basis,storage_source_urls=r.source_urls,checked_at=now(),updated_at=now()
from estimates r join public.self_host_apps a on a.slug=r.slug
where e.app_id=a.id;

do $resource_update_guard$
begin
  if (select count(*) from public.self_host_app_resource_estimates e join public.self_host_apps a on a.id=e.app_id
      where a.slug in ('gitness','crawl4ai','appflowy','maybe','youtrack','confluence')
        and e.ram_estimate_kind='estimated' and e.storage_estimate_kind='estimated'
        and e.ram_estimate_basis not in ('Typical small self-hosted instance; workload and stored data vary.','Small local model workload; model size and outputs vary.')) <> 6 then
    raise exception 'Batch 18 resource estimates did not complete';
  end if;
end;
$resource_update_guard$;

with reviewed as (
  select * from jsonb_to_recordset($install_options$
    [
      {"slug":"gitness","docker_urls":["https://hub.docker.com/r/harness/harness"],"docker_images":["harness/harness"],"compose_urls":[],"unraid_urls":[],"umbrel_urls":[],"options":[{"url":"https://hub.docker.com/r/harness/harness","note":"Harness Open Source's README runs this image.","image":"harness/harness","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/harness/harness#readme","support_level":"official"}],"source_urls":["https://hub.docker.com/r/harness/harness","https://github.com/harness/harness#readme"]},
      {"slug":"crawl4ai","docker_urls":["https://hub.docker.com/r/unclecode/crawl4ai"],"docker_images":["unclecode/crawl4ai:latest"],"compose_urls":["https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml"],"unraid_urls":["https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/crawl4ai.xml"],"umbrel_urls":[],"options":[{"url":"https://hub.docker.com/r/unclecode/crawl4ai","note":"Official Crawl4AI Docker Hub image.","image":"unclecode/crawl4ai:latest","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","support_level":"official"},{"url":"https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml","note":"Official project Compose file.","image":"unclecode/crawl4ai:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml","support_level":"official"},{"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/crawl4ai.xml","note":"Community Unraid template using the official Crawl4AI image.","image":"unclecode/crawl4ai:latest","label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/crawl4ai.xml","support_level":"community"}],"source_urls":["https://hub.docker.com/r/unclecode/crawl4ai","https://github.com/unclecode/crawl4ai/blob/main/deploy/docker/README.md","https://github.com/unclecode/crawl4ai/blob/main/docker-compose.yml","https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/crawl4ai.xml"]},
      {"slug":"appflowy","docker_urls":["https://hub.docker.com/r/appflowyinc/appflowy_cloud"],"docker_images":["appflowyinc/appflowy_cloud:latest"],"compose_urls":["https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"],"unraid_urls":[],"umbrel_urls":[],"options":[{"url":"https://hub.docker.com/r/appflowyinc/appflowy_cloud","note":"Use as part of the official Compose stack with PostgreSQL, Redis, authentication, and object storage.","image":"appflowyinc/appflowy_cloud:latest","label":"Official AppFlowy Cloud image","method":"docker","sort_order":10,"source_url":"https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","support_level":"official"},{"url":"https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","note":"Official AppFlowy self-hosted stack.","image":"appflowyinc/appflowy_cloud:latest","label":"Official Docker Compose stack","method":"compose","sort_order":20,"source_url":"https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml","support_level":"official"}],"source_urls":["https://hub.docker.com/r/appflowyinc/appflowy_cloud","https://github.com/AppFlowy-IO/AppFlowy-SelfHost-Commercial/blob/main/docker-compose.yml"]},
      {"slug":"maybe","docker_urls":["https://github.com/maybe-finance/maybe/pkgs/container/maybe"],"docker_images":["ghcr.io/maybe-finance/maybe:latest"],"compose_urls":["https://github.com/maybe-finance/maybe/blob/main/compose.example.yml"],"unraid_urls":[],"umbrel_urls":["https://github.com/getumbrel/umbrel-apps/tree/master/maybe"],"options":[{"url":"https://github.com/maybe-finance/maybe/pkgs/container/maybe","note":"Official GHCR image; the archived project recommends its latest or stable tag.","image":"ghcr.io/maybe-finance/maybe:latest","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md","support_level":"official"},{"url":"https://github.com/maybe-finance/maybe/blob/main/compose.example.yml","note":"Official Compose sample uses PostgreSQL and Redis.","image":"ghcr.io/maybe-finance/maybe:latest","label":"Official Docker Compose sample","method":"compose","sort_order":20,"source_url":"https://github.com/maybe-finance/maybe/blob/main/compose.example.yml","support_level":"official"},{"url":"https://github.com/getumbrel/umbrel-apps/tree/master/maybe","note":"Community Umbrel package; support from the app publisher is not implied.","image":"ghcr.io/maybe-finance/maybe:latest","label":"Umbrel catalog","method":"umbrel","sort_order":70,"source_url":"https://github.com/getumbrel/umbrel-apps/tree/master/maybe","support_level":"community"}],"source_urls":["https://github.com/maybe-finance/maybe/pkgs/container/maybe","https://github.com/maybe-finance/maybe/blob/main/docs/hosting/docker.md","https://github.com/maybe-finance/maybe/blob/main/compose.example.yml","https://github.com/getumbrel/umbrel-apps/tree/master/maybe"]},
      {"slug":"youtrack","docker_urls":["https://hub.docker.com/r/jetbrains/youtrack"],"docker_images":["jetbrains/youtrack:2026.1.14055"],"compose_urls":[],"unraid_urls":[],"umbrel_urls":[],"options":[{"url":"https://hub.docker.com/r/jetbrains/youtrack","note":"JetBrains' official YouTrack Server image; use the current build tag.","image":"jetbrains/youtrack:2026.1.14055","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html","support_level":"official"}],"source_urls":["https://hub.docker.com/r/jetbrains/youtrack","https://www.jetbrains.com/help/youtrack/server/youtrack-docker-installation.html"]},
      {"slug":"confluence","docker_urls":["https://hub.docker.com/r/atlassian/confluence"],"docker_images":["atlassian/confluence:9.2.5-ubi9-r1"],"compose_urls":[],"unraid_urls":[],"umbrel_urls":[],"options":[{"url":"https://hub.docker.com/r/atlassian/confluence","note":"Official Atlassian image. The older confluence-server image stopped receiving updates.","image":"atlassian/confluence:9.2.5-ubi9-r1","label":"Official Docker image","method":"docker","sort_order":10,"source_url":"https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html","support_level":"official"}],"source_urls":["https://hub.docker.com/r/atlassian/confluence","https://confluence.atlassian.com/doc/confluence-installation-guide-135681.html"]}
    ]
  $install_options$::jsonb) as r(
    slug text,docker_urls text[],docker_images text[],compose_urls text[],unraid_urls text[],umbrel_urls text[],options jsonb,source_urls text[]
  )
)
update public.self_host_app_install_options i set
  docker_urls=r.docker_urls,docker_images=r.docker_images,compose_urls=r.compose_urls,
  unraid_urls=r.unraid_urls,umbrel_urls=r.umbrel_urls,options=r.options,source_urls=r.source_urls,
  checked_at=now(),updated_at=now()
from reviewed r join public.self_host_apps a on a.slug=r.slug
where i.app_id=a.id;

do $install_update_guard$
begin
  if (select count(*) from public.self_host_app_install_options i join public.self_host_apps a on a.id=i.app_id
      where a.slug in ('gitness','crawl4ai','appflowy','maybe','youtrack','confluence')
        and jsonb_typeof(i.options)='array' and jsonb_array_length(i.options)>0) <> 6 then
    raise exception 'Batch 18 install option updates did not complete';
  end if;
end;
$install_update_guard$;

delete from public.self_host_app_category_links l
using public.self_host_apps a
where l.app_id=a.id and a.slug in ('gitness','crawl4ai','appflowy','maybe','youtrack','confluence');

insert into public.self_host_app_category_links(app_id,category_id)
select a.id,c.id
from (values
  ('gitness','developer-tools'),
  ('crawl4ai','ai-ml'),('crawl4ai','search'),
  ('appflowy','knowledge-notes'),('appflowy','project-task-management'),
  ('maybe','finance-budgeting'),
  ('youtrack','developer-tools'),('youtrack','project-task-management'),
  ('confluence','knowledge-notes'),('confluence','wikis')
) as reviewed(slug,category_slug)
join public.self_host_apps a on a.slug=reviewed.slug
join public.self_host_app_categories c on c.slug=reviewed.category_slug;

do $category_update_guard$
declare
  r record;
  actual_categories text[];
begin
  for r in select * from (values
    ('gitness',array['developer-tools']::text[]),
    ('crawl4ai',array['ai-ml','search']::text[]),
    ('appflowy',array['knowledge-notes','project-task-management']::text[]),
    ('maybe',array['finance-budgeting']::text[]),
    ('youtrack',array['developer-tools','project-task-management']::text[]),
    ('confluence',array['knowledge-notes','wikis']::text[])
  ) as expected(slug,categories)
  loop
    select coalesce(array_agg(c.slug order by c.slug),'{}'::text[]) into actual_categories
    from public.self_host_app_category_links l
    join public.self_host_apps a on a.id=l.app_id
    join public.self_host_app_categories c on c.id=l.category_id
    where a.slug=r.slug;
    if actual_categories is distinct from r.categories then
      raise exception 'Batch 18 category update failed for %',r.slug;
    end if;
  end loop;
end;
$category_update_guard$;

commit;
