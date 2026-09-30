begin;

create temporary table reviewed_self_host_apps_batch_07 (
  slug text primary key,
  app_name text,
  summary text,
  summary_source text,
  summary_confidence text,
  website_url text,
  source_code_url text,
  source_model text,
  license text,
  license_type text,
  license_spdx_id text,
  docs_url text,
  install_docs_url text,
  docker_url text,
  docker_support text,
  compose_support boolean,
  docker_image text,
  compose_url text,
  publisher_name text,
  publisher_type text,
  publisher_url text,
  maintenance_status text,
  requires_database boolean,
  database_types text[],
  surfaces text[],
  storage_profile text,
  persistent_storage boolean,
  ram_min_mb numeric,
  ram_max_mb numeric,
  ram_confidence text,
  ram_basis text,
  storage_min_gb numeric,
  storage_max_gb numeric,
  storage_confidence text,
  storage_basis text,
  sources text[],
  ram_storage_sources text[],
  install_options jsonb,
  technical_fact_status jsonb
) on commit drop;

insert into reviewed_self_host_apps_batch_07 values
(
  'dify', null, null, null, null,
  'https://dify.ai/',
  'https://github.com/langgenius/dify',
  'source_available',
  'Dify Open Source License (modified Apache-2.0)',
  'custom',
  null,
  'https://docs.dify.ai/en/home',
  'https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose',
  'https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose',
  'official',
  true,
  null,
  'https://github.com/langgenius/dify/blob/main/docker/docker-compose.yaml',
  'LangGenius, Inc.',
  'company',
  'https://dify.ai/',
  'active',
  true,
  array['postgres','mysql','redis','clickhouse','elasticsearch'],
  array['web','api'],
  'high',
  true,
  4096, 16384, 'medium',
  'The official README sets 4 GiB as a minimum; the multi-service stack, concurrent workflows, and stored knowledge data can need more.',
  20, 500, 'low',
  'Uploaded knowledge files, database records, and vector indexes grow with the number and size of collections.',
  array[
    'https://dify.ai/',
    'https://docs.dify.ai/en/home',
    'https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose',
    'https://github.com/langgenius/dify',
    'https://github.com/langgenius/dify/blob/main/README.md',
    'https://github.com/langgenius/dify/blob/main/LICENSE',
    'https://github.com/langgenius/dify/blob/main/docker/docker-compose.yaml',
    'https://github.com/langgenius'
  ],
  array[
    'https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose',
    'https://github.com/langgenius/dify/blob/main/docker/docker-compose.yaml',
    'https://github.com/langgenius/dify/blob/main/README.md'
  ],
  $json$
  [
    {
      "url":"https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose",
      "label":"Official Docker Compose setup",
      "method":"compose",
      "image":null,
      "support_level":"official",
      "source_url":"https://github.com/langgenius/dify/blob/main/docker/docker-compose.yaml",
      "note":"Deploys Dify as a stack of application and supporting services.",
      "sort_order":10
    }
  ]
  $json$::jsonb,
  $json$
  {
    "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"LangGenius publishes the Dify source repository.","source_urls":["https://github.com/langgenius/dify"]},
    "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository uses a modified Apache-2.0 license with additional conditions, so it is recorded as source-available.","source_urls":["https://github.com/langgenius/dify/blob/main/LICENSE"]},
    "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository identifies LangGenius, Inc. as copyright holder and the verified organization controls dify.ai.","source_urls":["https://github.com/langgenius/dify/blob/main/LICENSE","https://github.com/langgenius"]},
    "docs":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official product and self-hosting documentation checked.","source_urls":["https://docs.dify.ai/en/home","https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose"]},
    "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official self-hosted deployment uses Docker Compose.","source_urls":["https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose"]},
    "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official repository includes the Compose deployment stack.","source_urls":["https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose","https://github.com/langgenius/dify/blob/main/docker/docker-compose.yaml"]},
    "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The app is deployed as a multi-service stack; no single image represents the complete application.","source_urls":["https://github.com/langgenius/dify/blob/main/docker/docker-compose.yaml"]},
    "ram":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official README sets 4 GiB RAM as a minimum; the displayed range remains an estimate for a small self-hosted stack.","source_urls":["https://github.com/langgenius/dify/blob/main/README.md","https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose"]},
    "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The reviewed official deployment guide shows persistent data services but no capacity requirement; the directory value is an estimate.","source_urls":["https://docs.dify.ai/en/self-host/deploy/quick-start/docker-compose"]}
  }
  $json$::jsonb
),
(
  'firecrawl', null, null, null, null,
  'https://www.firecrawl.dev/',
  'https://github.com/firecrawl/firecrawl',
  'open_source',
  'AGPL-3.0 for the core; MIT for SDKs and some UI components',
  'mixed',
  null,
  'https://docs.firecrawl.dev/introduction',
  'https://docs.firecrawl.dev/contributing/self-host',
  'https://docs.firecrawl.dev/contributing/self-host',
  'official',
  true,
  null,
  'https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml',
  'SideGuide Technologies, Inc. d/b/a Firecrawl',
  'company',
  'https://www.firecrawl.dev/about',
  'active',
  true,
  array['postgres','redis'],
  array['api'],
  'medium',
  true,
  4096, 16384, 'low',
  'The official stack runs the API, workers, Playwright browser, and queue and database services; crawl concurrency and browser workload affect RAM.',
  10, 100, 'low',
  'The official Compose file has no persistent volumes by default; allocate disk for retained queue and database data when configuring persistence.',
  array[
    'https://www.firecrawl.dev/',
    'https://www.firecrawl.dev/about',
    'https://www.firecrawl.dev/privacy-policy',
    'https://github.com/firecrawl/firecrawl',
    'https://github.com/firecrawl/firecrawl/blob/main/README.md',
    'https://github.com/firecrawl/firecrawl/blob/main/LICENSE',
    'https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml',
    'https://docs.firecrawl.dev/introduction',
    'https://docs.firecrawl.dev/contributing/self-host'
  ],
  array[
    'https://docs.firecrawl.dev/contributing/self-host',
    'https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml'
  ],
  $json$
  [
    {
      "url":"https://docs.firecrawl.dev/contributing/self-host",
      "label":"Official Docker Compose setup",
      "method":"compose",
      "image":null,
      "support_level":"official",
      "source_url":"https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml",
      "note":"Starts Firecrawl and its browser, queue, and database services.",
      "sort_order":10
    }
  ]
  $json$::jsonb,
  $json$
  {
    "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Firecrawl publishes the core application repository.","source_urls":["https://github.com/firecrawl/firecrawl"]},
    "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository states that core Firecrawl is AGPL-3.0, while SDKs and some UI components use MIT.","source_urls":["https://github.com/firecrawl/firecrawl/blob/main/README.md","https://github.com/firecrawl/firecrawl/blob/main/LICENSE"]},
    "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official terms identify SideGuide Technologies, Inc. d/b/a Firecrawl.","source_urls":["https://www.firecrawl.dev/privacy-policy","https://www.firecrawl.dev/about"]},
    "docs":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official documentation and self-hosting guide checked.","source_urls":["https://docs.firecrawl.dev/introduction","https://docs.firecrawl.dev/contributing/self-host"]},
    "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official self-hosting guide deploys the service with Docker Engine and Compose.","source_urls":["https://docs.firecrawl.dev/contributing/self-host"]},
    "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official guide is tied to the project's Compose stack.","source_urls":["https://docs.firecrawl.dev/contributing/self-host","https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml"]},
    "docker_image":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"The checked official self-hosted stack builds and runs several services rather than providing one image for the complete app.","source_urls":["https://docs.firecrawl.dev/contributing/self-host","https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml"]},
    "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The official guide says it does not publish a verified minimum host size; the directory value is an estimate.","source_urls":["https://docs.firecrawl.dev/contributing/self-host"]},
    "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"The official Compose file defines no persistent volumes by default; the directory value is an estimate for a configured persistent deployment.","source_urls":["https://docs.firecrawl.dev/contributing/self-host","https://github.com/firecrawl/firecrawl/blob/main/docker-compose.yaml"]}
  }
  $json$::jsonb
),
(
  'hermes-agent', null, null, null, null,
  'https://hermes-agent.nousresearch.com/',
  'https://github.com/NousResearch/hermes-agent',
  'open_source',
  'MIT',
  'permissive',
  'MIT',
  'https://hermes-agent.nousresearch.com/docs/',
  'https://hermes-agent.nousresearch.com/docs/user-guide/docker',
  'https://hub.docker.com/r/nousresearch/hermes-agent',
  'official',
  true,
  'nousresearch/hermes-agent:latest',
  'https://hermes-agent.nousresearch.com/docs/user-guide/docker',
  'Nous Research',
  'unknown',
  'https://nousresearch.com/',
  'active',
  false,
  array['sqlite'],
  array['cli','web','api'],
  'medium',
  true,
  1024, 4096, 'low',
  'The gateway and dashboard share one official image; local model inference is outside this estimate, while sandbox tools can raise memory use.',
  2, 20, 'low',
  'Sessions, memories, skills, plugins, scheduled tasks, and logs persist under the documented /opt/data directory and grow with use.',
  array[
    'https://nousresearch.com/',
    'https://hermes-agent.nousresearch.com/',
    'https://hermes-agent.nousresearch.com/docs/',
    'https://hermes-agent.nousresearch.com/docs/user-guide/docker',
    'https://github.com/NousResearch/hermes-agent',
    'https://github.com/NousResearch/hermes-agent/blob/main/LICENSE',
    'https://hub.docker.com/r/nousresearch/hermes-agent'
  ],
  array[
    'https://hermes-agent.nousresearch.com/docs/user-guide/docker',
    'https://github.com/NousResearch/hermes-agent/blob/main/LICENSE'
  ],
  $json$
  [
    {
      "url":"https://hub.docker.com/r/nousresearch/hermes-agent",
      "label":"Official Docker image",
      "method":"docker",
      "image":"nousresearch/hermes-agent:latest",
      "support_level":"official",
      "source_url":"https://hermes-agent.nousresearch.com/docs/user-guide/docker",
      "note":null,
      "sort_order":10
    },
    {
      "url":"https://hermes-agent.nousresearch.com/docs/user-guide/docker",
      "label":"Official Docker Compose setup",
      "method":"compose",
      "image":"nousresearch/hermes-agent:latest",
      "support_level":"official",
      "source_url":"https://hermes-agent.nousresearch.com/docs/user-guide/docker",
      "note":"The official guide includes a persistent gateway and dashboard Compose example.",
      "sort_order":20
    }
  ]
  $json$::jsonb,
  $json$
  {
    "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Nous Research publishes the Hermes Agent repository.","source_urls":["https://github.com/NousResearch/hermes-agent"]},
    "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official project site and repository identify the MIT license.","source_urls":["https://github.com/NousResearch/hermes-agent/blob/main/LICENSE","https://hermes-agent.nousresearch.com/"]},
    "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official documentation identifies Nous Research as the project creator.","source_urls":["https://hermes-agent.nousresearch.com/docs/","https://nousresearch.com/"]},
    "docs":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official documentation includes a maintained Docker installation guide.","source_urls":["https://hermes-agent.nousresearch.com/docs/","https://hermes-agent.nousresearch.com/docs/user-guide/docker"]},
    "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official guide names the Nous Research Docker image and gives Docker run commands.","source_urls":["https://hermes-agent.nousresearch.com/docs/user-guide/docker","https://hub.docker.com/r/nousresearch/hermes-agent"]},
    "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide includes a Compose deployment example.","source_urls":["https://hermes-agent.nousresearch.com/docs/user-guide/docker"]},
    "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide names nousresearch/hermes-agent.","source_urls":["https://hermes-agent.nousresearch.com/docs/user-guide/docker","https://hub.docker.com/r/nousresearch/hermes-agent"]},
    "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The official guide configures sandbox limits but does not give a host RAM requirement for the base gateway; the directory value is an estimate.","source_urls":["https://hermes-agent.nousresearch.com/docs/user-guide/docker"]},
    "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The official guide identifies persistent state but does not give a disk capacity requirement; the directory value is an estimate.","source_urls":["https://hermes-agent.nousresearch.com/docs/user-guide/docker"]}
  }
  $json$::jsonb
),
(
  'langflow', null, null, null, null,
  'https://www.langflow.org/',
  'https://github.com/langflow-ai/langflow',
  'open_source',
  'MIT',
  'permissive',
  'MIT',
  'https://docs.langflow.org/',
  'https://docs.langflow.org/deployment-docker',
  'https://hub.docker.com/r/langflowai/langflow',
  'official',
  true,
  'langflowai/langflow:latest',
  'https://github.com/langflow-ai/langflow/blob/main/docker_example/docker-compose.yml',
  'DataStax, an IBM company',
  'company',
  'https://www.datastax.com/products/langflow',
  'active',
  true,
  array['sqlite','postgres'],
  array['web','api'],
  'low',
  true,
  2048, 8192, 'medium',
  'Official installation guidance sets 2 GB RAM as a minimum and recommends 4 GB; larger flows, components, and connected services raise use.',
  5, 100, 'low',
  'Flows and configuration persist in SQLite or PostgreSQL; generated data and connected services determine additional disk use.',
  array[
    'https://www.langflow.org/',
    'https://docs.langflow.org/',
    'https://docs.langflow.org/get-started-installation',
    'https://docs.langflow.org/deployment-docker',
    'https://github.com/langflow-ai/langflow',
    'https://github.com/langflow-ai/langflow/blob/main/LICENSE',
    'https://github.com/langflow-ai/langflow/blob/main/docker_example/docker-compose.yml',
    'https://hub.docker.com/r/langflowai/langflow',
    'https://www.datastax.com/products/langflow',
    'https://www.ibm.com/products/datastax'
  ],
  array[
    'https://docs.langflow.org/get-started-installation',
    'https://docs.langflow.org/deployment-docker'
  ],
  $json$
  [
    {
      "url":"https://hub.docker.com/r/langflowai/langflow",
      "label":"Official Docker image",
      "method":"docker",
      "image":"langflowai/langflow:latest",
      "support_level":"official",
      "source_url":"https://docs.langflow.org/deployment-docker",
      "note":null,
      "sort_order":10
    },
    {
      "url":"https://github.com/langflow-ai/langflow/blob/main/docker_example/docker-compose.yml",
      "label":"Official Docker Compose setup",
      "method":"compose",
      "image":"langflowai/langflow:latest",
      "support_level":"official",
      "source_url":"https://docs.langflow.org/deployment-docker",
      "note":"The official example persists Langflow data and can use PostgreSQL.",
      "sort_order":20
    }
  ]
  $json$::jsonb,
  $json$
  {
    "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Langflow publishes the project repository.","source_urls":["https://github.com/langflow-ai/langflow"]},
    "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository uses the MIT license.","source_urls":["https://github.com/langflow-ai/langflow/blob/main/LICENSE"]},
    "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"DataStax presents Langflow as its product; IBM identifies DataStax as an IBM company.","source_urls":["https://www.datastax.com/products/langflow","https://www.ibm.com/products/datastax"]},
    "docs":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official docs cover installation and Docker deployment.","source_urls":["https://docs.langflow.org/","https://docs.langflow.org/deployment-docker"]},
    "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official docs name the Langflow Docker image.","source_urls":["https://docs.langflow.org/deployment-docker","https://hub.docker.com/r/langflowai/langflow"]},
    "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official docs provide a Compose configuration from the Langflow repository.","source_urls":["https://docs.langflow.org/deployment-docker","https://github.com/langflow-ai/langflow/blob/main/docker_example/docker-compose.yml"]},
    "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker image is langflowai/langflow.","source_urls":["https://docs.langflow.org/deployment-docker","https://hub.docker.com/r/langflowai/langflow"]},
    "ram":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official installation docs set a 2 GB minimum and recommend 4 GB for the OSS package; the directory range is a planning estimate.","source_urls":["https://docs.langflow.org/get-started-installation"]},
    "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The reviewed deployment docs describe persistence but give no storage capacity requirement; the directory value is an estimate.","source_urls":["https://docs.langflow.org/deployment-docker"]}
  }
  $json$::jsonb
),
(
  'rustdesk', 'RustDesk Server OSS',
  'Self-hosted ID and relay servers that RustDesk clients use to connect directly or relay remote desktop traffic.',
  'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/',
  'high',
  'https://rustdesk.com/',
  'https://github.com/rustdesk/rustdesk-server',
  'open_source',
  'AGPL-3.0',
  'copyleft',
  'AGPL-3.0',
  'https://rustdesk.com/docs/en/',
  'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/',
  'https://hub.docker.com/r/rustdesk/rustdesk-server',
  'official',
  true,
  'rustdesk/rustdesk-server:latest',
  'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/',
  'Purslane Tech Pte. Ltd. (RustDesk)',
  'company',
  'https://rustdesk.com/',
  'active',
  false,
  array[]::text[],
  array[]::text[],
  'low',
  true,
  256, 2048, 'low',
  'Official docs describe low server memory needs; relay traffic and the number of active clients drive the estimate upward.',
  1, 20, 'low',
  'The server persists keys and configuration in its data directory; relay traffic does not imply storing the remote desktop sessions.',
  array[
    'https://rustdesk.com/',
    'https://rustdesk.com/terms/',
    'https://rustdesk.com/docs/en/',
    'https://rustdesk.com/docs/en/self-host/',
    'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/',
    'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/',
    'https://github.com/rustdesk/rustdesk-server',
    'https://github.com/rustdesk/rustdesk-server/blob/master/LICENSE',
    'https://hub.docker.com/r/rustdesk/rustdesk-server',
    'https://github.com/rustdesk/rustdesk'
  ],
  array[
    'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/',
    'https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/',
    'https://github.com/rustdesk/rustdesk-server/blob/master/LICENSE'
  ],
  $json$
  [
    {
      "url":"https://hub.docker.com/r/rustdesk/rustdesk-server",
      "label":"Official RustDesk Server OSS image",
      "method":"docker",
      "image":"rustdesk/rustdesk-server:latest",
      "support_level":"official",
      "source_url":"https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/",
      "note":"The image runs the hbbs ID server or hbbr relay server, depending on its command.",
      "sort_order":10
    },
    {
      "url":"https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/",
      "label":"Official Docker Compose setup",
      "method":"compose",
      "image":"rustdesk/rustdesk-server:latest",
      "support_level":"official",
      "source_url":"https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/",
      "note":"The Compose deployment runs separate hbbs and hbbr services.",
      "sort_order":20
    }
  ]
  $json$::jsonb,
  $json$
  {
    "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"RustDesk's official docs identify this as the separate OSS server repository.","source_urls":["https://rustdesk.com/docs/en/","https://github.com/rustdesk/rustdesk-server"]},
    "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The server repository and official documentation identify the OSS server as AGPL-3.0.","source_urls":["https://github.com/rustdesk/rustdesk-server/blob/master/LICENSE","https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/"]},
    "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"RustDesk's terms identify Purslane Tech Pte. Ltd. and say the company releases RustDesk Server OSS under its open-source license.","source_urls":["https://rustdesk.com/terms/"]},
    "docs":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official docs distinguish the self-hosted OSS server from the client and Pro server.","source_urls":["https://rustdesk.com/docs/en/","https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/"]},
    "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official Docker instructions name rustdesk/rustdesk-server.","source_urls":["https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/","https://hub.docker.com/r/rustdesk/rustdesk-server"]},
    "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official docs provide a Compose example with separate hbbs and hbbr services.","source_urls":["https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/"]},
    "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official OSS server image is rustdesk/rustdesk-server.","source_urls":["https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/","https://hub.docker.com/r/rustdesk/rustdesk-server"]},
    "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"Official docs describe low requirements without a numeric RAM requirement; the directory value is an estimate.","source_urls":["https://rustdesk.com/docs/en/self-host/install/"]},
    "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Official docs show a persistent data directory without a capacity requirement; the directory value is an estimate.","source_urls":["https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/docker/"]}
  }
  $json$::jsonb
);

update public.self_host_apps a set
  name = coalesce(r.app_name, a.name),
  summary = coalesce(r.summary, a.summary),
  summary_source = coalesce(r.summary_source, a.summary_source),
  summary_confidence = coalesce(r.summary_confidence, a.summary_confidence),
  website_url = r.website_url,
  source_code_url = r.source_code_url,
  source_code_host = 'github',
  source_model = r.source_model::public.self_host_app_source_model,
  license = r.license,
  license_type = r.license_type::public.self_host_app_license_type,
  license_spdx_id = r.license_spdx_id,
  docs_url = r.docs_url,
  install_docs_url = r.install_docs_url,
  docker_url = r.docker_url,
  docker_support = r.docker_support,
  compose_support = r.compose_support,
  docker_image = r.docker_image,
  compose_url = r.compose_url,
  publisher_name = r.publisher_name,
  publisher_type = r.publisher_type,
  publisher_url = r.publisher_url,
  maintenance_status = r.maintenance_status,
  requires_database = r.requires_database,
  database_types = r.database_types,
  surfaces = r.surfaces,
  storage_profile = r.storage_profile,
  persistent_storage = r.persistent_storage,
  data_source_urls = (
    select array_agg(distinct source_url order by source_url)
    from unnest(coalesce(a.data_source_urls, array[]::text[]) || r.sources) as source_url
  ),
  technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || r.technical_fact_status,
  updated_at = now()
from reviewed_self_host_apps_batch_07 r
where a.slug = r.slug
  and a.published = true
  and a.self_hosting_status = 'self_hostable';

update public.self_host_apps a set
  github_project_id = project.id,
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
  source_checked_at = project.checked_at
from public.github_projects project
where a.slug = 'rustdesk'
  and project.owner = 'rustdesk'
  and project.repo = 'rustdesk-server';

insert into public.self_host_app_install_options (
  app_id, options, docker_urls, docker_images, compose_urls, truenas_scale_urls,
  unraid_urls, umbrel_urls, yunohost_urls, casaos_urls, runtipi_urls, cosmos_urls,
  openmediavault_urls, synology_urls, qnap_urls, proxmox_urls, home_assistant_os_urls,
  kubernetes_urls, helm_urls, native_urls, binary_urls, package_urls, other_urls,
  catalog_sources, source_urls, checked_at, created_at, updated_at
)
select
  app.id,
  coalesce((
    select jsonb_agg(option order by nullif(option->>'sort_order','')::integer nulls last)
    from jsonb_array_elements(coalesce(existing.options, '[]'::jsonb)) option
    where option->>'method' not in ('docker','compose')
  ), '[]'::jsonb) || reviewed.install_options,
  array[reviewed.docker_url],
  case when reviewed.docker_image is null then array[]::text[] else array[reviewed.docker_image] end,
  array[reviewed.compose_url],
  coalesce(existing.truenas_scale_urls,array[]::text[]),
  coalesce(existing.unraid_urls,array[]::text[]),
  coalesce(existing.umbrel_urls,array[]::text[]),
  coalesce(existing.yunohost_urls,array[]::text[]),
  coalesce(existing.casaos_urls,array[]::text[]),
  coalesce(existing.runtipi_urls,array[]::text[]),
  coalesce(existing.cosmos_urls,array[]::text[]),
  coalesce(existing.openmediavault_urls,array[]::text[]),
  coalesce(existing.synology_urls,array[]::text[]),
  coalesce(existing.qnap_urls,array[]::text[]),
  coalesce(existing.proxmox_urls,array[]::text[]),
  coalesce(existing.home_assistant_os_urls,array[]::text[]),
  coalesce(existing.kubernetes_urls,array[]::text[]),
  coalesce(existing.helm_urls,array[]::text[]),
  coalesce(existing.native_urls,array[]::text[]),
  coalesce(existing.binary_urls,array[]::text[]),
  coalesce(existing.package_urls,array[]::text[]),
  coalesce(existing.other_urls,array[]::text[]),
  coalesce(existing.catalog_sources,'[]'::jsonb),
  array(
    select distinct source_url
    from unnest(coalesce(existing.source_urls,array[]::text[]) || reviewed.sources) source_url
    order by source_url
  ),
  now(),
  coalesce(existing.created_at,now()),
  now()
from reviewed_self_host_apps_batch_07 reviewed
join public.self_host_apps app on app.slug = reviewed.slug
left join public.self_host_app_install_options existing on existing.app_id = app.id
where app.published = true
  and app.self_hosting_status = 'self_hostable'
on conflict (app_id) do update set
  options = excluded.options,
  docker_urls = excluded.docker_urls,
  docker_images = excluded.docker_images,
  compose_urls = excluded.compose_urls,
  truenas_scale_urls = excluded.truenas_scale_urls,
  unraid_urls = excluded.unraid_urls,
  umbrel_urls = excluded.umbrel_urls,
  yunohost_urls = excluded.yunohost_urls,
  casaos_urls = excluded.casaos_urls,
  runtipi_urls = excluded.runtipi_urls,
  cosmos_urls = excluded.cosmos_urls,
  openmediavault_urls = excluded.openmediavault_urls,
  synology_urls = excluded.synology_urls,
  qnap_urls = excluded.qnap_urls,
  proxmox_urls = excluded.proxmox_urls,
  home_assistant_os_urls = excluded.home_assistant_os_urls,
  kubernetes_urls = excluded.kubernetes_urls,
  helm_urls = excluded.helm_urls,
  native_urls = excluded.native_urls,
  binary_urls = excluded.binary_urls,
  package_urls = excluded.package_urls,
  other_urls = excluded.other_urls,
  catalog_sources = excluded.catalog_sources,
  source_urls = excluded.source_urls,
  checked_at = excluded.checked_at,
  updated_at = excluded.updated_at;

insert into public.self_host_app_resource_estimates (
  app_id, ram_estimate_min_mb, ram_estimate_max_mb, ram_estimate_kind,
  ram_estimate_confidence, ram_estimate_basis, ram_source_urls,
  storage_estimate_min_gb, storage_estimate_max_gb, storage_estimate_kind,
  storage_estimate_confidence, storage_estimate_basis, storage_source_urls,
  checked_at, created_at, updated_at
)
select
  app.id,
  reviewed.ram_min_mb,
  reviewed.ram_max_mb,
  'estimated',
  reviewed.ram_confidence,
  reviewed.ram_basis,
  reviewed.ram_storage_sources,
  reviewed.storage_min_gb,
  reviewed.storage_max_gb,
  'estimated',
  reviewed.storage_confidence,
  reviewed.storage_basis,
  reviewed.ram_storage_sources,
  now(),
  now(),
  now()
from reviewed_self_host_apps_batch_07 reviewed
join public.self_host_apps app on app.slug = reviewed.slug
where app.published = true
  and app.self_hosting_status = 'self_hostable'
on conflict (app_id) do update set
  ram_estimate_min_mb = excluded.ram_estimate_min_mb,
  ram_estimate_max_mb = excluded.ram_estimate_max_mb,
  ram_estimate_kind = excluded.ram_estimate_kind,
  ram_estimate_confidence = excluded.ram_estimate_confidence,
  ram_estimate_basis = excluded.ram_estimate_basis,
  ram_source_urls = excluded.ram_source_urls,
  ram_note = null,
  storage_estimate_min_gb = excluded.storage_estimate_min_gb,
  storage_estimate_max_gb = excluded.storage_estimate_max_gb,
  storage_estimate_kind = excluded.storage_estimate_kind,
  storage_estimate_confidence = excluded.storage_estimate_confidence,
  storage_estimate_basis = excluded.storage_estimate_basis,
  storage_source_urls = excluded.storage_source_urls,
  storage_note = null,
  checked_at = excluded.checked_at,
  updated_at = excluded.updated_at;

commit;
