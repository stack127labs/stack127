begin;

do $migration$
declare
  app_rec record;
  v_app_id uuid;
  expected_categories text[];
  current_categories text[];
  current_options jsonb;
  estimate_row public.self_host_app_resource_estimates;
  app_patch public.self_host_apps;
  affected integer;
  batch constant jsonb := $batch$[
    {
      "slug":"absulli",
      "expected":{"summary":"ABSulli is an Audiobookshelf companion dashboard inspired by the concept of Tautulli, Track audiobook and podcast listening activity, browse library stats.","website_url":null,"source_code_url":"https://github.com/operationeth/absulli","docs_url":"https://forums.unraid.net/topic/199686-support-operationeth-absulli","install_docs_url":"https://forums.unraid.net/topic/199686-support-operationeth-absulli","license":"No license file declared (all rights reserved by default)","license_spdx_id":"GPL-3.0","source_model":"source_available","docker_support":"community","docker_url":"https://hub.docker.com/r/operationeth/absulli","docker_image":"operationeth/absulli:latest","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["ebooks-libraries","monitoring-status","music-audio"],
      "expected_options":[
        {"url":"https://hub.docker.com/r/operationeth/absulli","note":"Community-maintained image. Verify the publisher before pulling.","image":"operationeth/absulli:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/operationeth/absulli","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/operationETH/unraid-templates/main/templates/absulli.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/operationETH/unraid-templates/main/templates/absulli.xml","support_level":"community"}
      ],
      "categories":["dashboards","ebooks-libraries","monitoring-status"],
      "changes":{"summary":"Dashboard for Audiobookshelf that tracks listening activity, library stats, history, and alerts.","website_url":"https://github.com/operationETH/ABSulli","docs_url":"https://github.com/operationETH/ABSulli/blob/main/README.md","install_docs_url":"https://github.com/operationETH/ABSulli/blob/main/README.md#quick-start","license":"GNU General Public License v3.0","license_spdx_id":"GPL-3.0","license_type":"copyleft","source_model":"open_source","source_code_host":"github","docker_support":"official","docker_url":"https://github.com/operationETH/ABSulli/pkgs/container/absulli","docker_image":"ghcr.io/operationeth/absulli:latest","compose_support":true,"compose_url":"https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml","requires_database":true,"database_types":["sqlite"],"persistent_storage":true,"storage_profile":"depends","deployment_methods":["docker","compose","unraid"],"surfaces":["api","web"],"summary_source":"https://github.com/operationETH/ABSulli/blob/main/README.md","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://github.com/operationETH/ABSulli","https://github.com/operationETH/ABSulli/blob/main/LICENSE","https://github.com/operationETH/ABSulli/blob/main/README.md","https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml","https://github.com/operationETH/ABSulli/pkgs/container/absulli","https://raw.githubusercontent.com/operationETH/unraid-templates/main/templates/absulli.xml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":256,"ram_estimate_max_mb":2048,"ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.","storage_estimate_min_gb":5,"storage_estimate_max_gb":100,"storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."},
      "resource_estimate":{"ram_min_mb":256,"ram_max_mb":1024,"ram_basis":"Web dashboard with local SQLite; user and listening-history volume drive use.","ram_source_urls":["https://github.com/operationETH/ABSulli/blob/main/README.md","https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"],"storage_min_gb":1,"storage_max_gb":10,"storage_basis":"Keeps settings and listening history in SQLite; media stays in Audiobookshelf.","storage_source_urls":["https://github.com/operationETH/ABSulli/blob/main/README.md","https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project publishes the GHCR image and uses it in its official Compose example.","source_urls":["https://github.com/operationETH/ABSulli/blob/main/README.md","https://github.com/operationETH/ABSulli/pkgs/container/absulli"]},"compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project provides a Compose file for its Docker setup.","source_urls":["https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The app stores its records in a local SQLite database and does not need a separate database service.","source_urls":["https://github.com/operationETH/ABSulli/blob/main/README.md"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"Its Compose example mounts a data directory for app settings and SQLite records.","source_urls":["https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"]},"ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers the dashboard and its local SQLite workload.","source_urls":["https://github.com/operationETH/ABSulli/blob/main/README.md","https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"]},"storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers settings and listening history; audiobook and podcast media stays in Audiobookshelf.","source_urls":["https://github.com/operationETH/ABSulli/blob/main/README.md","https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"]},"docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official Compose file uses the project GHCR image.","source_urls":["https://github.com/operationETH/ABSulli/pkgs/container/absulli","https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml"]}},
      "install_options":[
        {"url":"https://github.com/operationETH/ABSulli/pkgs/container/absulli","note":null,"image":"ghcr.io/operationeth/absulli:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/operationETH/ABSulli/blob/main/README.md#quick-start","support_level":"official"},
        {"url":"https://github.com/operationETH/ABSulli/blob/main/docker-compose.yml","note":null,"image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/operationETH/ABSulli/blob/main/README.md#quick-start","support_level":"official"},
        {"url":"https://raw.githubusercontent.com/operationETH/unraid-templates/main/templates/absulli.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/operationETH/unraid-templates/main/templates/absulli.xml","support_level":"community"}
      ]
    },
    {
      "slug":"actual-mcp-server",
      "expected":{"summary":"Model Context Protocol (MCP) server that connects AI assistants (LibreChat, LobeChat, Claude Desktop, Cursor) to your Actual Budget instance, exposing 71.","website_url":null,"source_code_url":"https://github.com/agigante80/actual-mcp-server","docs_url":"https://github.com/agigante80/actual-mcp-server/issues","install_docs_url":"https://github.com/agigante80/actual-mcp-server/issues","license":"No license file declared (all rights reserved by default)","license_spdx_id":"MIT","source_model":"source_available","docker_support":"community","docker_url":"https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","docker_image":"ghcr.io/agigante80/actual-mcp-server:latest","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["ai-ml","communication","finance-budgeting"],
      "expected_options":[
        {"url":"https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","note":"Community-maintained image. Verify the publisher before pulling.","image":"ghcr.io/agigante80/actual-mcp-server:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/agigante80/actual-mcp-server/main/unraid/actual-mcp-server.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/agigante80/actual-mcp-server/main/unraid/actual-mcp-server.xml","support_level":"community"}
      ],
      "categories":["developer-tools","finance-budgeting"],
      "changes":{"summary":"MCP server that lets AI assistants read and manage transactions, budgets, and accounts in an Actual Budget instance.","website_url":"https://github.com/agigante80/actual-mcp-server","docs_url":"https://github.com/agigante80/actual-mcp-server/blob/main/README.md","install_docs_url":"https://github.com/agigante80/actual-mcp-server/blob/main/docs/guides/DEPLOYMENT.md","license":"MIT License","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source","source_code_host":"github","docker_support":"official","docker_url":"https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","docker_image":"ghcr.io/agigante80/actual-mcp-server:latest","compose_support":true,"compose_url":"https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml","requires_database":false,"database_types":[],"persistent_storage":true,"storage_profile":"depends","deployment_methods":["docker","compose","package","unraid"],"surfaces":["api","cli"],"summary_source":"https://github.com/agigante80/actual-mcp-server/blob/main/README.md","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://github.com/agigante80/actual-mcp-server","https://github.com/agigante80/actual-mcp-server/blob/main/LICENSE","https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docs/guides/DEPLOYMENT.md","https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml","https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","https://www.npmjs.com/package/actual-mcp-server","https://raw.githubusercontent.com/agigante80/actual-mcp-server/main/unraid/actual-mcp-server.xml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":2048,"ram_estimate_max_mb":8192,"ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.","storage_estimate_min_gb":1,"storage_estimate_max_gb":20,"storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."},
      "resource_estimate":{"ram_min_mb":512,"ram_max_mb":2048,"ram_basis":"Node MCP service with a local Actual API cache; concurrent clients add load.","ram_source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docs/guides/DEPLOYMENT.md"],"storage_min_gb":1,"storage_max_gb":20,"storage_basis":"Keeps a local copy of budget data and logs; needs vary with budget size.","storage_source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project documents its own GHCR image as the recommended Docker setup.","source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server"]},"compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project documents production and development Compose profiles in its deployment guide and Compose file.","source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/docs/guides/DEPLOYMENT.md","https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"It connects to an Actual Budget server and keeps a local budget-data copy; the Compose stack does not require a separate database service.","source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official run and Compose instructions require a persistent data directory for the local budget copy and logs.","source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml"]},"ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The planning range estimates a small Node MCP server and local budget-data workload.","source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docs/guides/DEPLOYMENT.md"]},"storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The planning range covers its local budget-data copy and logs; actual budget size varies.","source_urls":["https://github.com/agigante80/actual-mcp-server/blob/main/README.md","https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml"]},"docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project publishes the GHCR image used in its setup instructions.","source_urls":["https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","https://github.com/agigante80/actual-mcp-server/blob/main/README.md"]}},
      "install_options":[
        {"url":"https://github.com/agigante80/actual-mcp-server/pkgs/container/actual-mcp-server","note":null,"image":"ghcr.io/agigante80/actual-mcp-server:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/agigante80/actual-mcp-server/blob/main/README.md#quick-start","support_level":"official"},
        {"url":"https://github.com/agigante80/actual-mcp-server/blob/main/docker-compose.yaml","note":null,"image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/agigante80/actual-mcp-server/blob/main/docs/guides/DEPLOYMENT.md","support_level":"official"},
        {"url":"https://www.npmjs.com/package/actual-mcp-server","note":null,"image":null,"label":"npm package","method":"package","sort_order":30,"source_url":"https://github.com/agigante80/actual-mcp-server/blob/main/README.md#quick-start","support_level":"official"},
        {"url":"https://raw.githubusercontent.com/agigante80/actual-mcp-server/main/unraid/actual-mcp-server.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/agigante80/actual-mcp-server/main/unraid/actual-mcp-server.xml","support_level":"community"}
      ]
    },
    {
      "slug":"adguardbuddy",
      "expected":{"summary":"AdGuard Buddy is designed to keep multiple AdGuard Home instances synchronized, allowing you to monitor statistics, logs, and settings of all your AdGuard.","website_url":null,"source_code_url":"https://github.com/chrizzo84/adguard-buddy","docs_url":"https://github.com/chrizzo84/adguard-buddy/issues","install_docs_url":"https://github.com/chrizzo84/adguard-buddy/issues","license":"No license file declared (all rights reserved by default)","license_spdx_id":"MIT","source_model":"source_available","docker_support":"community","docker_url":"https://registry.hub.docker.com/r/ghcr.io/chrizzo84/adguard-buddy","docker_image":"ghcr.io/chrizzo84/adguard-buddy:latest","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["monitoring-status","networking-dns","system-admin-hosting"],
      "expected_options":[
        {"url":"https://github.com/chrizzo84/adguard-buddy/pkgs/container/adguard-buddy","note":"Community-maintained image. Verify the publisher before pulling.","image":"ghcr.io/chrizzo84/adguard-buddy:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://registry.hub.docker.com/r/ghcr.io/chrizzo84/adguard-buddy","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/chrizzo84/unraid-templates/main/templates/adguard-buddy.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/chrizzo84/unraid-templates/main/templates/adguard-buddy.xml","support_level":"community"}
      ],
      "categories":["dashboards","monitoring-status","networking-dns"],
      "changes":{"summary":"Dashboard for monitoring AdGuard Home servers and syncing their settings.","website_url":"https://github.com/chrizzo84/adguard-buddy","docs_url":"https://github.com/chrizzo84/adguard-buddy/blob/main/README.md","install_docs_url":"https://github.com/chrizzo84/adguard-buddy/blob/main/README.md#installation","license":"MIT License","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source","source_code_host":"github","docker_support":"official","docker_url":"https://github.com/chrizzo84/adguard-buddy/pkgs/container/adguard-buddy","docker_image":"ghcr.io/chrizzo84/adguard-buddy:latest","compose_support":false,"compose_url":null,"requires_database":false,"database_types":[],"persistent_storage":true,"storage_profile":"low","deployment_methods":["docker","unraid"],"surfaces":["api","web"],"summary_source":"https://github.com/chrizzo84/adguard-buddy/blob/main/README.md","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://github.com/chrizzo84/adguard-buddy","https://github.com/chrizzo84/adguard-buddy/blob/main/LICENSE","https://github.com/chrizzo84/adguard-buddy/blob/main/README.md","https://github.com/chrizzo84/adguard-buddy/pkgs/container/adguard-buddy","https://raw.githubusercontent.com/chrizzo84/unraid-templates/main/templates/adguard-buddy.xml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":256,"ram_estimate_max_mb":2048,"ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.","storage_estimate_min_gb":5,"storage_estimate_max_gb":100,"storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."},
      "resource_estimate":{"ram_min_mb":256,"ram_max_mb":1024,"ram_basis":"Web dashboard with small connection and statistics stores; server count and history drive use.","ram_source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"],"storage_min_gb":1,"storage_max_gb":10,"storage_basis":"Keeps AdGuard connections, local settings, and logs; DNS data stays in AdGuard Home.","storage_source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project documents and publishes its own GHCR image.","source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md","https://github.com/chrizzo84/adguard-buddy/pkgs/container/adguard-buddy"]},"compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The project documents Docker run instructions but no Compose deployment.","source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The documented container stores server connections in its own data directory and needs no separate database service.","source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project says to persist /app/.data because it holds server connections.","source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]},"ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers a small dashboard, with use increasing as more servers and history are added.","source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]},"storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers local connection settings and logs; DNS records remain in AdGuard Home.","source_urls":["https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]},"docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README links its GHCR package for the prebuilt image.","source_urls":["https://github.com/chrizzo84/adguard-buddy/pkgs/container/adguard-buddy","https://github.com/chrizzo84/adguard-buddy/blob/main/README.md"]}},
      "install_options":[
        {"url":"https://github.com/chrizzo84/adguard-buddy/pkgs/container/adguard-buddy","note":null,"image":"ghcr.io/chrizzo84/adguard-buddy:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/chrizzo84/adguard-buddy/blob/main/README.md#installation","support_level":"official"},
        {"url":"https://raw.githubusercontent.com/chrizzo84/unraid-templates/main/templates/adguard-buddy.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/chrizzo84/unraid-templates/main/templates/adguard-buddy.xml","support_level":"community"}
      ]
    },
    {
      "slug":"ads-b-browser-screenshot",
      "expected":{"summary":"Browser screenshot service used to support ADS-B monitoring workflows.","website_url":null,"source_code_url":"https://github.com/tedder/browser-screenshot-service","docs_url":"https://github.com/tedder/browser-screenshot-service/issues","install_docs_url":"https://github.com/tedder/browser-screenshot-service/issues","license":"No license file declared (all rights reserved by default)","license_spdx_id":"MIT","source_model":"source_available","docker_support":"community","docker_url":"https://hub.docker.com/r/tedder42/browser-screenshot-service","docker_image":"tedder42/browser-screenshot-service:latest","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["remote-access"],
      "expected_options":[
        {"url":"https://hub.docker.com/r/tedder42/browser-screenshot-service","note":"Community-maintained image. Verify the publisher before pulling.","image":"tedder42/browser-screenshot-service:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/tedder42/browser-screenshot-service","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/adsb_browser_screenshot.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/adsb_browser_screenshot.xml","support_level":"community"}
      ],
      "categories":["maps-travel","monitoring-status"],
      "changes":{"summary":"API service that captures screenshots of aircraft tracking maps for ADS-B monitoring.","website_url":"https://github.com/tedder/browser-screenshot-service","docs_url":"https://github.com/tedder/browser-screenshot-service/blob/main/README.md","install_docs_url":"https://github.com/tedder/browser-screenshot-service/blob/main/README.md#execution-example","license":"MIT License","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source","source_code_host":"github","docker_support":"official","docker_url":"https://hub.docker.com/r/tedder42/browser-screenshot-service","docker_image":"tedder42/browser-screenshot-service:latest","compose_support":false,"compose_url":null,"requires_database":false,"database_types":[],"persistent_storage":false,"storage_profile":"tiny","deployment_methods":["docker","unraid"],"surfaces":["api"],"summary_source":"https://github.com/tedder/browser-screenshot-service/blob/main/README.md","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://github.com/tedder/browser-screenshot-service","https://github.com/tedder/browser-screenshot-service/blob/main/LICENSE","https://github.com/tedder/browser-screenshot-service/blob/main/README.md","https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile","https://hub.docker.com/r/tedder42/browser-screenshot-service","https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/adsb_browser_screenshot.xml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":256,"ram_estimate_max_mb":2048,"ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.","storage_estimate_min_gb":1,"storage_estimate_max_gb":20,"storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."},
      "resource_estimate":{"ram_min_mb":512,"ram_max_mb":2048,"ram_basis":"Chromium and Selenium capture pages; concurrent screenshots drive memory use.","ram_source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile","https://github.com/tedder/browser-screenshot-service/blob/main/README.md"],"storage_min_gb":1,"storage_max_gb":5,"storage_basis":"Container and browser files; screenshots are served without a persistent data volume.","storage_source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile","https://github.com/tedder/browser-screenshot-service/blob/main/README.md"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README provides the Docker image and run command.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/README.md","https://hub.docker.com/r/tedder42/browser-screenshot-service"]},"compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The project documents a Docker run command and does not provide Compose setup instructions.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/README.md"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The screenshot API runs without a separate database service.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/README.md","https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The documented container runs the screenshot API without a persistent data volume.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile","https://github.com/tedder/browser-screenshot-service/blob/main/README.md"]},"ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate accounts for Chromium and Selenium used to capture each page.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile"]},"storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers the browser container and temporary captures, not a persistent media library.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/Dockerfile","https://github.com/tedder/browser-screenshot-service/blob/main/README.md"]},"docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README instructs users to run the Docker Hub image.","source_urls":["https://github.com/tedder/browser-screenshot-service/blob/main/README.md","https://hub.docker.com/r/tedder42/browser-screenshot-service"]}},
      "install_options":[
        {"url":"https://hub.docker.com/r/tedder42/browser-screenshot-service","note":null,"image":"tedder42/browser-screenshot-service:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/tedder/browser-screenshot-service/blob/main/README.md#execution-example","support_level":"official"},
        {"url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/adsb_browser_screenshot.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/adsb_browser_screenshot.xml","support_level":"community"}
      ]
    },
    {
      "slug":"aiometadata",
      "expected":{"summary":"Stremio metadata add-on that aggregates movie, series, and anime data from multiple providers.","website_url":null,"source_code_url":"https://github.com/cedya77/aiometadata","docs_url":"https://github.com/cedya77/aiometadata/issues","install_docs_url":"https://github.com/cedya77/aiometadata/issues","license":"No license file declared (all rights reserved by default)","license_spdx_id":"GPL-3.0","source_model":"source_available","docker_support":"community","docker_url":"https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","docker_image":"ghcr.io/cedya77/aiometadata:latest","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["ai-ml","databases","video-conferencing"],
      "expected_options":[
        {"url":"https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","note":"Community-maintained image. Verify the publisher before pulling.","image":"ghcr.io/cedya77/aiometadata:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/JamsRepos/Unraid-Templates/main/templates/aiometadata.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/JamsRepos/Unraid-Templates/main/templates/aiometadata.xml","support_level":"community"}
      ],
      "categories":["media-servers"],
      "changes":{"summary":"Stremio metadata add-on that combines movie, series, and anime catalogs from several providers.","website_url":"https://github.com/cedya77/aiometadata","docs_url":"https://github.com/cedya77/aiometadata/blob/dev/README.md","install_docs_url":"https://github.com/cedya77/aiometadata/blob/dev/README.md#2-self-hosting-docker-compose","license":"GNU General Public License v3.0","license_spdx_id":"GPL-3.0","license_type":"copyleft","source_model":"open_source","source_code_host":"github","docker_support":"official","docker_url":"https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","docker_image":"ghcr.io/cedya77/aiometadata:latest","compose_support":true,"compose_url":"https://github.com/cedya77/aiometadata/blob/dev/README.md#2-self-hosting-docker-compose","requires_database":true,"database_types":["redis","sqlite","postgresql"],"persistent_storage":true,"storage_profile":"depends","deployment_methods":["docker","compose","unraid"],"surfaces":["api","web"],"summary_source":"https://github.com/cedya77/aiometadata/blob/dev/README.md","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://github.com/cedya77/aiometadata","https://github.com/cedya77/aiometadata/blob/dev/LICENSE","https://github.com/cedya77/aiometadata/blob/dev/README.md","https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","https://raw.githubusercontent.com/JamsRepos/Unraid-Templates/main/templates/aiometadata.xml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":2048,"ram_estimate_max_mb":8192,"ram_estimate_basis":"Small single-node service; data volume and request load vary.","storage_estimate_min_gb":5,"storage_estimate_max_gb":100,"storage_estimate_basis":"Small single-node service; data volume and request load vary."},
      "resource_estimate":{"ram_min_mb":512,"ram_max_mb":2048,"ram_basis":"Node add-on with Redis caching and SQLite or PostgreSQL configuration storage.","ram_source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md","https://github.com/cedya77/aiometadata/pkgs/container/aiometadata"],"storage_min_gb":1,"storage_max_gb":20,"storage_basis":"Stores per-user settings and cached metadata; use grows with catalogs and traffic.","storage_source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md","https://github.com/cedya77/aiometadata/pkgs/container/aiometadata"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project Compose example uses its published GHCR image.","source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md","https://github.com/cedya77/aiometadata/pkgs/container/aiometadata"]},"compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project provides a Compose setup with the add-on and Redis cache.","source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The Compose setup requires Redis for cache; app configuration uses SQLite by default and can use PostgreSQL.","source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The Compose setup mounts app data and Redis cache volumes.","source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md"]},"ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers the Node add-on and Redis cache; request volume drives use.","source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md"]},"storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers user settings and metadata cache; actual size grows with use.","source_urls":["https://github.com/cedya77/aiometadata/blob/dev/README.md"]},"docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official Compose example uses the project GHCR package.","source_urls":["https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","https://github.com/cedya77/aiometadata/blob/dev/README.md"]}},
      "install_options":[
        {"url":"https://github.com/cedya77/aiometadata/pkgs/container/aiometadata","note":null,"image":"ghcr.io/cedya77/aiometadata:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/cedya77/aiometadata/blob/dev/README.md#2-self-hosting-docker-compose","support_level":"official"},
        {"url":"https://github.com/cedya77/aiometadata/blob/dev/README.md#2-self-hosting-docker-compose","note":null,"image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/cedya77/aiometadata/blob/dev/README.md#2-self-hosting-docker-compose","support_level":"official"},
        {"url":"https://raw.githubusercontent.com/JamsRepos/Unraid-Templates/main/templates/aiometadata.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/JamsRepos/Unraid-Templates/main/templates/aiometadata.xml","support_level":"community"}
      ]
    }
  ]$batch$::jsonb;
begin
  for app_rec in
    select * from jsonb_to_recordset(batch) as x(
      slug text,
      expected jsonb,
      expected_categories jsonb,
      expected_options jsonb,
      categories jsonb,
      changes jsonb,
      source_urls jsonb,
      resource_estimate_expected jsonb,
      resource_estimate jsonb,
      technical_updates jsonb,
      install_options jsonb
    )
  loop
    select a.id into v_app_id
    from public.self_host_apps a
    where a.slug = app_rec.slug
      and a.published is true
      and a.self_hosting_status = 'self_hostable'
      and to_jsonb(a) @> app_rec.expected
    for update;
    if v_app_id is null then
      raise exception '% app record changed since review', app_rec.slug;
    end if;

    select coalesce(array_agg(c.slug order by c.slug), '{}'::text[])
      into current_categories
    from public.self_host_app_category_links l
    join public.self_host_app_categories c on c.id = l.category_id
    where l.app_id = v_app_id;
    expected_categories := array(
      select jsonb_array_elements_text(app_rec.expected_categories) order by 1
    );
    if current_categories is distinct from expected_categories then
      raise exception '% categories changed since review', app_rec.slug;
    end if;

    select io.options into current_options
    from public.self_host_app_install_options io
    where io.app_id = v_app_id
    for update;
    if current_options is distinct from app_rec.expected_options then
      raise exception '% install options changed since review', app_rec.slug;
    end if;

    select e.* into estimate_row
    from public.self_host_app_resource_estimates e
    where e.app_id = v_app_id
    for update;
    if not found or not (to_jsonb(estimate_row) @> app_rec.resource_estimate_expected) then
      raise exception '% resource estimates changed since review', app_rec.slug;
    end if;

    select * into app_patch
    from jsonb_populate_record(null::public.self_host_apps, app_rec.changes);

    update public.self_host_apps a set
      summary = app_patch.summary,
      website_url = app_patch.website_url,
      docs_url = app_patch.docs_url,
      install_docs_url = app_patch.install_docs_url,
      license = app_patch.license,
      license_spdx_id = app_patch.license_spdx_id,
      license_type = app_patch.license_type,
      source_model = app_patch.source_model,
      source_code_host = app_patch.source_code_host,
      docker_support = app_patch.docker_support,
      docker_url = app_patch.docker_url,
      docker_image = app_patch.docker_image,
      compose_support = app_patch.compose_support,
      compose_url = app_patch.compose_url,
      requires_database = app_patch.requires_database,
      database_types = app_patch.database_types,
      persistent_storage = app_patch.persistent_storage,
      storage_profile = app_patch.storage_profile,
      deployment_methods = app_patch.deployment_methods,
      surfaces = app_patch.surfaces,
      data_source_urls = (
        select array_agg(distinct source_url order by source_url)
        from unnest(coalesce(a.data_source_urls, '{}'::text[]) ||
          array(select jsonb_array_elements_text(app_rec.source_urls))) as source(source_url)
      ),
      summary_source = app_patch.summary_source,
      summary_confidence = app_patch.summary_confidence,
      data_confidence = app_patch.data_confidence,
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || app_rec.technical_updates,
      technical_facts_checked_at = now(),
      updated_at = now()
    where a.id = v_app_id;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception '% app update failed', app_rec.slug; end if;

    update public.self_host_app_resource_estimates e set
      ram_estimate_min_mb = (app_rec.resource_estimate ->> 'ram_min_mb')::numeric,
      ram_estimate_max_mb = (app_rec.resource_estimate ->> 'ram_max_mb')::numeric,
      ram_estimate_kind = 'estimated',
      ram_estimate_confidence = 'low',
      ram_estimate_basis = app_rec.resource_estimate ->> 'ram_basis',
      ram_source_urls = array(select jsonb_array_elements_text(app_rec.resource_estimate -> 'ram_source_urls')),
      storage_estimate_min_gb = (app_rec.resource_estimate ->> 'storage_min_gb')::numeric,
      storage_estimate_max_gb = (app_rec.resource_estimate ->> 'storage_max_gb')::numeric,
      storage_estimate_kind = 'estimated',
      storage_estimate_confidence = 'low',
      storage_estimate_basis = app_rec.resource_estimate ->> 'storage_basis',
      storage_source_urls = array(select jsonb_array_elements_text(app_rec.resource_estimate -> 'storage_source_urls')),
      checked_at = now(),
      updated_at = now()
    where e.app_id = v_app_id
      and to_jsonb(e) @> app_rec.resource_estimate_expected;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception '% resource update failed', app_rec.slug; end if;

    update public.self_host_app_install_options io set
      options = app_rec.install_options,
      docker_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'docker' order by (o ->> 'sort_order')::integer),
      docker_images = array(select distinct o ->> 'image' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'docker' and nullif(o ->> 'image', '') is not null order by 1),
      compose_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'compose' order by (o ->> 'sort_order')::integer),
      unraid_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'unraid' order by (o ->> 'sort_order')::integer),
      package_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'package' order by (o ->> 'sort_order')::integer),
      source_urls = array(select distinct o ->> 'source_url' from jsonb_array_elements(app_rec.install_options) o where nullif(o ->> 'source_url', '') is not null order by 1),
      checked_at = now(),
      updated_at = now()
    where io.app_id = v_app_id
      and io.options = app_rec.expected_options;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception '% install option update failed', app_rec.slug; end if;

    delete from public.self_host_app_category_links where app_id = v_app_id;
    insert into public.self_host_app_category_links(app_id, category_id)
    select v_app_id, c.id
    from jsonb_array_elements_text(app_rec.categories) x(slug)
    join public.self_host_app_categories c on c.slug = x.slug;
    get diagnostics affected = row_count;
    if affected <> jsonb_array_length(app_rec.categories) then
      raise exception '% category update failed', app_rec.slug;
    end if;
  end loop;
end
$migration$;

commit;
