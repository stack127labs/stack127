begin;

create temporary table self_host_apps_popular_batch_12 on commit drop as
select *
from jsonb_to_recordset($batch$[
  {
    "slug":"caddy","name":"Caddy","summary":"Web server and reverse proxy with automatic HTTPS and Caddyfile configuration.",
    "website_url":"https://caddyserver.com/","docs_url":"https://caddyserver.com/docs/","install_docs_url":"https://caddyserver.com/docs/running",
    "docker_url":"https://hub.docker.com/_/caddy","docker_image":"caddy:2","docker_support":"official",
    "compose_support":true,"compose_url":"https://caddyserver.com/docs/running#docker-compose",
    "license":"Apache-2.0","license_type":"permissive","license_spdx_id":"Apache-2.0",
    "publisher_name":"Caddy","publisher_type":"community","publisher_url":"https://caddyserver.com/",
    "pricing_model":"free","requires_database":false,"database_types":[],"surfaces":["cli"],
    "storage_profile":"low","persistent_storage":true,"deployment_methods":["docker","compose"],
    "data_source_urls":["https://caddyserver.com/","https://caddyserver.com/docs/","https://caddyserver.com/docs/running","https://caddyserver.com/docs/running#docker-compose","https://hub.docker.com/_/caddy","https://github.com/caddyserver/caddy","https://github.com/caddyserver/caddy/blob/master/LICENSE"],
    "technical_updates":{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official source repository identifies Apache-2.0.","source_urls":["https://github.com/caddyserver/caddy/blob/master/LICENSE"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Caddy's official Docker instructions use the official Docker Hub image.","source_urls":["https://caddyserver.com/docs/running","https://hub.docker.com/_/caddy"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official instructions use the caddy image; the major-version tag is caddy:2.","source_urls":["https://caddyserver.com/docs/running#docker-compose","https://hub.docker.com/_/caddy"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Caddy documents a Docker Compose setup with persistent data and config volumes.","source_urls":["https://caddyserver.com/docs/running#docker-compose"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented Caddy container needs configuration and certificate storage, not a database service.","source_urls":["https://caddyserver.com/docs/running#docker-compose"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose example persists Caddy data and configuration in named volumes.","source_urls":["https://caddyserver.com/docs/running#docker-compose"]}
    },
    "data_confidence":"high",
    "docker_urls":["https://hub.docker.com/_/caddy"],"docker_images":["caddy:2"],
    "compose_urls":["https://caddyserver.com/docs/running#docker-compose"],
    "install_source_urls":["https://caddyserver.com/docs/running#docker-compose","https://hub.docker.com/_/caddy"],
    "install_options":[
      {"method":"docker","label":"Official Caddy Docker image","url":"https://hub.docker.com/_/caddy","image":"caddy:2","support_level":"official","source_url":"https://caddyserver.com/docs/running","note":null,"sort_order":10},
      {"method":"compose","label":"Caddy Docker Compose setup","url":"https://caddyserver.com/docs/running#docker-compose","image":"caddy:2","support_level":"official","source_url":"https://caddyserver.com/docs/running#docker-compose","note":null,"sort_order":20}
    ]
  },
  {
    "slug":"code-server","name":"code-server","summary":"Browser-based VS Code server for editing projects on a remote machine.",
    "website_url":"https://coder.com/","docs_url":"https://coder.com/docs/code-server","install_docs_url":"https://coder.com/docs/code-server/install",
    "docker_url":"https://hub.docker.com/r/codercom/code-server","docker_image":"codercom/code-server:latest","docker_support":"official",
    "compose_support":false,"compose_url":null,
    "license":"MIT","license_type":"permissive","license_spdx_id":"MIT",
    "publisher_name":"Coder","publisher_type":"company","publisher_url":"https://coder.com/",
    "pricing_model":"free","requires_database":false,"database_types":[],"surfaces":["web"],
    "storage_profile":"high","persistent_storage":true,"deployment_methods":["docker"],
    "data_source_urls":["https://coder.com/docs/code-server","https://coder.com/docs/code-server/install","https://github.com/coder/code-server","https://github.com/coder/code-server/blob/main/LICENSE","https://github.com/coder/code-server/blob/main/docs/install.md","https://hub.docker.com/r/codercom/code-server","https://github.com/coder/code-server/discussions/3032"],
    "technical_updates":{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official source repository identifies the MIT license.","source_urls":["https://github.com/coder/code-server/blob/main/LICENSE"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Coder publishes code-server and its official installation documentation.","source_urls":["https://coder.com/docs/code-server","https://github.com/coder/code-server"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official installation guide documents the codercom/code-server image.","source_urls":["https://coder.com/docs/code-server/install","https://hub.docker.com/r/codercom/code-server"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official install command uses codercom/code-server:latest.","source_urls":["https://coder.com/docs/code-server/install","https://hub.docker.com/r/codercom/code-server"]},
      "compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The official install guide documents Docker CLI and Helm; a code-server maintainer says the project does not maintain a Compose file.","source_urls":["https://coder.com/docs/code-server/install","https://github.com/coder/code-server/discussions/3032"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented setup persists config and project files without a database service.","source_urls":["https://coder.com/docs/code-server/install"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker instructions mount user config, extensions, and project files.","source_urls":["https://coder.com/docs/code-server/install"]}
    },
    "data_confidence":"high",
    "docker_urls":["https://hub.docker.com/r/codercom/code-server"],"docker_images":["codercom/code-server:latest"],
    "compose_urls":[],
    "install_source_urls":["https://coder.com/docs/code-server/install","https://hub.docker.com/r/codercom/code-server","https://github.com/coder/code-server/discussions/3032"],
    "install_options":[
      {"method":"docker","label":"Official code-server Docker image","url":"https://hub.docker.com/r/codercom/code-server","image":"codercom/code-server:latest","support_level":"official","source_url":"https://coder.com/docs/code-server/install","note":null,"sort_order":10}
    ]
  },
  {
    "slug":"elasticsearch","name":"Elasticsearch","summary":"Indexes, searches, and analyzes large volumes of text, structured data, logs, and vectors.",
    "website_url":"https://www.elastic.co/elasticsearch","docs_url":"https://www.elastic.co/docs","install_docs_url":"https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker",
    "docker_url":"https://www.docker.elastic.co/r/elasticsearch/elasticsearch","docker_image":"docker.elastic.co/elasticsearch/elasticsearch:9.5.4","docker_support":"official",
    "compose_support":true,"compose_url":"https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker",
    "license":"Elastic License 2.0 for default releases; AGPL-3.0 or SSPL-1.0 options for source code, with ELv2-only directories","license_type":"mixed","license_spdx_id":null,
    "publisher_name":"Elastic","publisher_type":"company","publisher_url":"https://www.elastic.co/",
    "pricing_model":"freemium","requires_database":false,"database_types":[],"surfaces":["api"],
    "storage_profile":"high","persistent_storage":true,"deployment_methods":["docker","compose"],
    "data_source_urls":["https://www.elastic.co/elasticsearch","https://www.elastic.co/docs","https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","https://www.elastic.co/pricing/self-managed","https://www.elastic.co/pricing/faq/licensing","https://www.elastic.co/docs/deploy-manage/license","https://www.elastic.co/docs/deploy-manage/deploy/self-managed/installing-elasticsearch","https://www.docker.elastic.co/r/elasticsearch/elasticsearch","https://github.com/elastic/elasticsearch"],
    "technical_updates":{
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Elastic identifies itself as the company behind Elasticsearch.","source_urls":["https://www.elastic.co/elasticsearch"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Default releases use ELv2; Elastic also offers AGPL and SSPL licensing choices for source code, with some ELv2-only directories.","source_urls":["https://www.elastic.co/pricing/faq/licensing","https://www.elastic.co/licensing/elastic-license/faq/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Elastic provides official Elasticsearch Docker images and self-managed installation instructions.","source_urls":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","https://www.docker.elastic.co/r/elasticsearch/elasticsearch"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Elastic's registry lists version 9.5.4 as the current multi-architecture image.","source_urls":["https://www.docker.elastic.co/r/elasticsearch/elasticsearch"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Elastic's Docker installation guide links to a multi-node Docker Compose deployment.","source_urls":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Elasticsearch stores its own indexed data and does not require a separate database product.","source_urls":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker setup stores the Elasticsearch data path in a persistent volume.","source_urls":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Elasticsearch exposes an API; Kibana is a separate product.","source_urls":["https://www.elastic.co/elasticsearch","https://www.elastic.co/docs"]},
      "pricing":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The self-managed product has a free tier and paid subscription features.","source_urls":["https://www.elastic.co/pricing/self-managed"]}
    },
    "data_confidence":"high",
    "docker_urls":["https://www.docker.elastic.co/r/elasticsearch/elasticsearch"],"docker_images":["docker.elastic.co/elasticsearch/elasticsearch:9.5.4"],
    "compose_urls":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker"],
    "install_source_urls":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","https://www.docker.elastic.co/r/elasticsearch/elasticsearch"],
    "install_options":[
      {"method":"docker","label":"Official Elasticsearch Docker image","url":"https://www.docker.elastic.co/r/elasticsearch/elasticsearch","image":"docker.elastic.co/elasticsearch/elasticsearch:9.5.4","support_level":"official","source_url":"https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","note":null,"sort_order":10},
      {"method":"compose","label":"Elasticsearch Docker Compose setup","url":"https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","image":"docker.elastic.co/elasticsearch/elasticsearch:9.5.4","support_level":"official","source_url":"https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","note":null,"sort_order":20}
    ]
  },
  {
    "slug":"flowise-ai","name":"Flowise","summary":"Builds AI workflows and agents through a visual editor with model, tool, memory, retrieval, and API components.",
    "website_url":"https://flowiseai.com/","docs_url":"https://docs.flowiseai.com/","install_docs_url":"https://docs.flowiseai.com/getting-started",
    "docker_url":"https://hub.docker.com/r/flowiseai/flowise","docker_image":"flowiseai/flowise:latest","docker_support":"official",
    "compose_support":true,"compose_url":"https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml",
    "license":"Apache-2.0 for open-source code; FlowiseAI Commercial License for enterprise code","license_type":"mixed","license_spdx_id":null,
    "publisher_name":"FlowiseAI, Inc.","publisher_type":"company","publisher_url":"https://flowiseai.com/",
    "pricing_model":"freemium","requires_database":false,"database_types":[],"surfaces":["web","api"],
    "storage_profile":"medium","persistent_storage":true,"deployment_methods":["docker","compose"],
    "data_source_urls":["https://flowiseai.com/","https://flowiseai.com/sunset","https://docs.flowiseai.com/","https://docs.flowiseai.com/getting-started","https://github.com/FlowiseAI/Flowise","https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml","https://github.com/FlowiseAI/Flowise/blob/main/LICENSE.md","https://github.com/FlowiseAI/Flowise/blob/main/packages/server/src/enterprise/LICENSE.md","https://github.com/FlowiseAI/Flowise/blob/main/CONTRIBUTING.md","https://hub.docker.com/r/flowiseai/flowise"],
    "technical_updates":{
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository identifies FlowiseAI, Inc. as the copyright holder.","source_urls":["https://github.com/FlowiseAI/Flowise/blob/main/LICENSE.md","https://flowiseai.com/"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Open-source code is Apache-2.0; enterprise code uses the FlowiseAI Commercial License.","source_urls":["https://github.com/FlowiseAI/Flowise/blob/main/LICENSE.md","https://github.com/FlowiseAI/Flowise/blob/main/packages/server/src/enterprise/LICENSE.md"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Flowise announced an end to operations and archived its repository in August 2026.","source_urls":["https://flowiseai.com/sunset","https://github.com/FlowiseAI/Flowise"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose file uses the Flowise Docker image; the project has since been archived and the image deprecated.","source_urls":["https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml","https://hub.docker.com/r/flowiseai/flowise","https://flowiseai.com/sunset"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker Hub repository is flowiseai/flowise; its image is deprecated after the project sunset.","source_urls":["https://hub.docker.com/r/flowiseai/flowise","https://flowiseai.com/sunset"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official getting-started guide and archived repository provide a Compose setup.","source_urls":["https://docs.flowiseai.com/getting-started","https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Flowise uses SQLite by default; PostgreSQL or MySQL can be configured, while Redis is optional for queue mode.","source_urls":["https://github.com/FlowiseAI/Flowise/blob/main/CONTRIBUTING.md","https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose file mounts the Flowise data directory for persistent application state.","source_urls":["https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml"]},
      "pricing":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Flowise has a free community edition and commercial enterprise code; the hosted service has also been wound down.","source_urls":["https://github.com/FlowiseAI/Flowise/blob/main/LICENSE.md","https://flowiseai.com/sunset"]}
    },
    "data_confidence":"high",
    "docker_urls":["https://hub.docker.com/r/flowiseai/flowise"],"docker_images":["flowiseai/flowise:latest"],
    "compose_urls":["https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml"],
    "install_source_urls":["https://docs.flowiseai.com/getting-started","https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml","https://hub.docker.com/r/flowiseai/flowise","https://flowiseai.com/sunset"],
    "install_options":[
      {"method":"docker","label":"Flowise Docker image","url":"https://hub.docker.com/r/flowiseai/flowise","image":"flowiseai/flowise:latest","support_level":"official","source_url":"https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml","note":"Official image from the archived project; the publisher marked it deprecated.","sort_order":10},
      {"method":"compose","label":"Flowise Docker Compose setup","url":"https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml","image":"flowiseai/flowise:latest","support_level":"official","source_url":"https://docs.flowiseai.com/getting-started","note":"Official Compose setup from the archived project.","sort_order":20}
    ]
  },
  {
    "slug":"meilisearch","name":"Meilisearch","summary":"Search engine that indexes content and returns fast, typo-tolerant results through an API.",
    "website_url":"https://www.meilisearch.com/","docs_url":"https://www.meilisearch.com/docs","install_docs_url":"https://www.meilisearch.com/integrations/docker",
    "docker_url":"https://hub.docker.com/r/getmeili/meilisearch","docker_image":"getmeili/meilisearch:latest","docker_support":"official",
    "compose_support":true,"compose_url":"https://www.meilisearch.com/integrations/docker",
    "license":"MIT for Community Edition; Business Source License for Enterprise Edition","license_type":"mixed","license_spdx_id":null,
    "publisher_name":"Meilisearch SAS","publisher_type":"company","publisher_url":"https://www.meilisearch.com/",
    "pricing_model":"freemium","requires_database":false,"database_types":[],"surfaces":["api"],
    "storage_profile":"high","persistent_storage":true,"deployment_methods":["docker","compose"],
    "data_source_urls":["https://www.meilisearch.com/","https://www.meilisearch.com/docs","https://www.meilisearch.com/integrations/docker","https://www.meilisearch.com/terms-of-use","https://www.meilisearch.com/blog/enterprise-license","https://github.com/meilisearch/meilisearch","https://hub.docker.com/r/getmeili/meilisearch"],
    "technical_updates":{
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Meilisearch's official terms identify the company behind the product.","source_urls":["https://www.meilisearch.com/terms-of-use","https://www.meilisearch.com/"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Community Edition remains MIT; Enterprise Edition features use the Business Source License.","source_urls":["https://www.meilisearch.com/blog/enterprise-license","https://github.com/meilisearch/meilisearch"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Meilisearch publishes an official Docker image and Docker deployment instructions.","source_urls":["https://www.meilisearch.com/integrations/docker","https://hub.docker.com/r/getmeili/meilisearch"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker integration page uses getmeili/meilisearch:latest.","source_urls":["https://www.meilisearch.com/integrations/docker","https://hub.docker.com/r/getmeili/meilisearch"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker integration page states that Docker Compose examples are available.","source_urls":["https://www.meilisearch.com/integrations/docker"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Meilisearch is its own search datastore and persists indexes on a mounted filesystem; it does not require a separate database.","source_urls":["https://www.meilisearch.com/blog/meilisearch-in-production-taking-it-to-the-next-level","https://www.meilisearch.com/integrations/docker"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guidance supports a persistent volume for index data.","source_urls":["https://www.meilisearch.com/integrations/docker","https://www.meilisearch.com/blog/meilisearch-in-production-taking-it-to-the-next-level"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Meilisearch exposes search and indexing through an API; it is not the browser interface for a separate product.","source_urls":["https://www.meilisearch.com/terms-of-use","https://www.meilisearch.com/docs"]},
      "pricing":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Community Edition is free and open source; Enterprise Edition has separate licensing.","source_urls":["https://www.meilisearch.com/blog/enterprise-license"]}
    },
    "data_confidence":"high",
    "docker_urls":["https://hub.docker.com/r/getmeili/meilisearch"],"docker_images":["getmeili/meilisearch:latest"],
    "compose_urls":["https://www.meilisearch.com/integrations/docker"],
    "install_source_urls":["https://www.meilisearch.com/integrations/docker","https://hub.docker.com/r/getmeili/meilisearch"],
    "install_options":[
      {"method":"docker","label":"Official Meilisearch Docker image","url":"https://hub.docker.com/r/getmeili/meilisearch","image":"getmeili/meilisearch:latest","support_level":"official","source_url":"https://www.meilisearch.com/integrations/docker","note":null,"sort_order":10},
      {"method":"compose","label":"Meilisearch Docker Compose examples","url":"https://www.meilisearch.com/integrations/docker","image":"getmeili/meilisearch:latest","support_level":"official","source_url":"https://www.meilisearch.com/integrations/docker","note":null,"sort_order":20}
    ]
  },
  {
    "slug":"odysseus","name":"Odysseus","summary":"Combines AI chat, agents, research, documents, notes, email, calendars, and local models in one workspace.",
    "website_url":"https://odysseus-dev.github.io/odysseus","docs_url":"https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","install_docs_url":"https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md",
    "docker_url":null,"docker_image":null,"docker_support":"official",
    "compose_support":true,"compose_url":"https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml",
    "license":"AGPL-3.0-or-later","license_type":"copyleft","license_spdx_id":"AGPL-3.0-or-later",
    "publisher_name":"Odysseus project","publisher_type":"community","publisher_url":"https://github.com/odysseus-dev/",
    "pricing_model":"free","requires_database":true,"database_types":["ChromaDB"],"surfaces":["web"],
    "storage_profile":"depends","persistent_storage":true,"deployment_methods":["docker","compose"],
    "data_source_urls":["https://odysseus-dev.github.io/odysseus","https://github.com/odysseus-dev/odysseus","https://github.com/odysseus-dev/odysseus#readme","https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml","https://github.com/odysseus-dev/odysseus/blob/dev/LICENSE","https://github.com/odysseus-dev/odysseus/blob/dev/docs/backup-restore.md"],
    "technical_updates":{
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official project site and repository identify the Odysseus project and its maintainer organization.","source_urls":["https://odysseus-dev.github.io/odysseus","https://github.com/odysseus-dev/odysseus"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository identifies AGPL-3.0-or-later.","source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/LICENSE","https://github.com/odysseus-dev/odysseus"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository identifies AGPL-3.0-or-later.","source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/LICENSE","https://github.com/odysseus-dev/odysseus"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project recommends Docker Compose and builds the Odysseus container from the checked-out source.","source_urls":["https://github.com/odysseus-dev/odysseus#readme","https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md"]},
      "docker_image":{"status":"unchecked","checked_at":"2026-09-29","confidence":"medium","note":"The official Compose deployment builds the app locally; no standalone image destination is used in that setup.","source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official setup guide runs docker compose up and the stack includes ChromaDB, SearXNG, and ntfy.","source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Compose stack includes ChromaDB for vector storage; the application also stores its state in SQLite.","source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml","https://github.com/odysseus-dev/odysseus/blob/dev/docs/backup-restore.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The setup persists application data, model downloads, and the ChromaDB volume.","source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","https://github.com/odysseus-dev/odysseus/blob/dev/docs/backup-restore.md"]}
    },
    "data_confidence":"high",
    "docker_urls":[],"docker_images":[],
    "compose_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml"],
    "install_source_urls":["https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml"],
    "install_options":[
      {"method":"compose","label":"Odysseus Docker Compose stack","url":"https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml","image":null,"support_level":"official","source_url":"https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","note":"Builds the app from source and starts supporting services.","sort_order":20}
    ]
  },
  {
    "slug":"rclone","name":"Rclone","summary":"Command-line tool for syncing, copying, mounting, and managing files across cloud storage providers.",
    "website_url":"https://rclone.org/","docs_url":"https://rclone.org/docs/","install_docs_url":"https://rclone.org/install/",
    "docker_url":"https://hub.docker.com/r/rclone/rclone","docker_image":"rclone/rclone:latest","docker_support":"official",
    "compose_support":true,"compose_url":"https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml",
    "license":"MIT","license_type":"permissive","license_spdx_id":"MIT",
    "publisher_name":"Rclone project","publisher_type":"community","publisher_url":"https://rclone.org/",
    "pricing_model":"free","requires_database":false,"database_types":[],"surfaces":["cli","web"],
    "storage_profile":"depends","persistent_storage":true,"deployment_methods":["docker","compose"],
    "data_source_urls":["https://rclone.org/","https://rclone.org/docs/","https://rclone.org/install/","https://rclone.org/rc/","https://rclone.org/gui/","https://github.com/rclone/rclone","https://github.com/rclone/rclone/blob/master/COPYING","https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml","https://hub.docker.com/r/rclone/rclone"],
    "technical_updates":{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official source repository identifies the MIT license.","source_urls":["https://github.com/rclone/rclone/blob/master/COPYING"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Rclone is maintained by the Rclone project.","source_urls":["https://rclone.org/","https://github.com/rclone/rclone"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official source repository identifies the MIT license.","source_urls":["https://github.com/rclone/rclone/blob/master/COPYING"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Rclone developers maintain the rclone/rclone Docker image.","source_urls":["https://rclone.org/install/","https://hub.docker.com/r/rclone/rclone"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official installation guide uses rclone/rclone:latest.","source_urls":["https://rclone.org/install/","https://hub.docker.com/r/rclone/rclone"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository includes a Docker Compose example for serving DLNA.","source_urls":["https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Rclone stores its configuration in files and does not require a database service.","source_urls":["https://rclone.org/install/","https://rclone.org/docs/"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Docker instructions require persistent configuration storage; mounts and caches may also use local disk.","source_urls":["https://rclone.org/install/"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Rclone provides a command-line interface and an optional browser GUI through its remote-control command.","source_urls":["https://rclone.org/","https://rclone.org/gui/","https://rclone.org/rc/"]}
    },
    "data_confidence":"high",
    "docker_urls":["https://hub.docker.com/r/rclone/rclone"],"docker_images":["rclone/rclone:latest"],
    "compose_urls":["https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml"],
    "install_source_urls":["https://rclone.org/install/","https://hub.docker.com/r/rclone/rclone","https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml"],
    "install_options":[
      {"method":"docker","label":"Official Rclone Docker image","url":"https://hub.docker.com/r/rclone/rclone","image":"rclone/rclone:latest","support_level":"official","source_url":"https://rclone.org/install/","note":null,"sort_order":10},
      {"method":"compose","label":"Rclone Docker Compose example","url":"https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml","image":"rclone/rclone:latest","support_level":"official","source_url":"https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml","note":"This example configures Rclone's DLNA server.","sort_order":20}
    ]
  }
]$batch$::jsonb) as reviewed(
  slug text,name text,summary text,website_url text,docs_url text,install_docs_url text,
  docker_url text,docker_image text,docker_support text,compose_support boolean,compose_url text,
  license text,license_type text,license_spdx_id text,publisher_name text,publisher_type text,publisher_url text,
  pricing_model text,requires_database boolean,database_types text[],surfaces text[],storage_profile text,persistent_storage boolean,
  deployment_methods text[],data_source_urls text[],technical_updates jsonb,data_confidence text,
  docker_urls text[],docker_images text[],compose_urls text[],install_source_urls text[],install_options jsonb
);

update public.self_host_apps a
set name = r.name,
    summary = r.summary,
    website_url = r.website_url,
    docs_url = r.docs_url,
    install_docs_url = r.install_docs_url,
    docker_url = r.docker_url,
    docker_image = r.docker_image,
    docker_support = r.docker_support,
    compose_support = r.compose_support,
    compose_url = r.compose_url,
    license = r.license,
    license_type = r.license_type::public.self_host_app_license_type,
    license_spdx_id = r.license_spdx_id,
    publisher_name = r.publisher_name,
    publisher_type = r.publisher_type,
    publisher_url = r.publisher_url,
    pricing_model = r.pricing_model,
    requires_database = r.requires_database,
    database_types = r.database_types,
    surfaces = r.surfaces,
    storage_profile = r.storage_profile,
    persistent_storage = r.persistent_storage,
    deployment_methods = array(
      select distinct method
      from unnest(coalesce(a.deployment_methods, array[]::text[]) || r.deployment_methods) as methods(method)
      order by method
    ),
    data_source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(a.data_source_urls, array[]::text[]) || r.data_source_urls) as sources(source_url)
      where source_url is not null
    ),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || r.technical_updates,
    data_checked_at = now(),
    technical_facts_checked_at = now(),
    data_confidence = r.data_confidence,
    updated_at = now()
from self_host_apps_popular_batch_12 r
where a.slug = r.slug
  and a.published = true
  and a.self_hosting_status = 'self_hostable';

update public.self_host_app_install_options i
set docker_urls = r.docker_urls,
    docker_images = r.docker_images,
    compose_urls = r.compose_urls,
    options = (
      select coalesce(jsonb_agg(option_item order by coalesce((option_item->>'sort_order')::integer, 999)), '[]'::jsonb)
      from jsonb_array_elements(coalesce(i.options, '[]'::jsonb)) as items(option_item)
      where option_item->>'method' not in ('docker','compose')
    ) || r.install_options,
    source_urls = (
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(i.source_urls, array[]::text[]) || r.install_source_urls) as sources(source_url)
      where source_url is not null
    ),
    checked_at = current_date,
    updated_at = now()
from self_host_apps_popular_batch_12 r
join public.self_host_apps a on a.slug = r.slug
where i.app_id = a.id;

insert into public.self_host_app_resource_estimates (
  app_id,ram_estimate_min_mb,ram_estimate_max_mb,ram_estimate_kind,ram_estimate_confidence,
  ram_estimate_basis,ram_source_urls,storage_estimate_min_gb,storage_estimate_max_gb,
  storage_estimate_kind,storage_estimate_confidence,storage_estimate_basis,storage_source_urls,checked_at
)
select a.id,r.ram_min,r.ram_max,'estimated',r.confidence,r.ram_basis,r.ram_sources,
       r.storage_min,r.storage_max,'estimated',r.confidence,r.storage_basis,r.storage_sources,current_date
from jsonb_to_recordset($resources$[
  {"slug":"caddy","ram_min":256,"ram_max":2048,"storage_min":1,"storage_max":20,"confidence":"low","ram_basis":"One small reverse proxy with modest traffic; route count, plugins, and request load raise memory use.","ram_sources":["https://caddyserver.com/docs/running#docker-compose"],"storage_basis":"Configuration, TLS certificates, and logs drive disk use for a small proxy.","storage_sources":["https://caddyserver.com/docs/running#docker-compose"]},
  {"slug":"code-server","ram_min":512,"ram_max":4096,"storage_min":10,"storage_max":100,"confidence":"low","ram_basis":"One browser IDE with a small workspace; extensions, language servers, builds, and active sessions raise memory use.","ram_sources":["https://coder.com/docs/code-server/install"],"storage_basis":"Estimate includes a small project workspace, extensions, and persistent user configuration; project size drives disk use.","storage_sources":["https://coder.com/docs/code-server/install"]},
  {"slug":"elasticsearch","ram_min":2048,"ram_max":16384,"storage_min":10,"storage_max":200,"confidence":"low","ram_basis":"One small single-node search service; heap size, index count, shards, and query load raise memory use.","ram_sources":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker","https://www.docker.elastic.co/r/elasticsearch/elasticsearch"],"storage_basis":"Estimate covers a small persistent index; indexed data, replicas, and retention drive disk use.","storage_sources":["https://www.elastic.co/docs/deploy-manage/deploy/self-managed/install-elasticsearch-with-docker"]},
  {"slug":"flowise-ai","ram_min":2048,"ram_max":8192,"storage_min":1,"storage_max":50,"confidence":"low","ram_basis":"One small workflow server using remote model APIs; local queues, components, and concurrent runs raise memory use.","ram_sources":["https://docs.flowiseai.com/getting-started","https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml"],"storage_basis":"Estimate covers Flowise state and a modest amount of uploaded content; documents and vector indexes raise disk use.","storage_sources":["https://github.com/FlowiseAI/Flowise/blob/main/docker/docker-compose.yml","https://flowiseai.com/sunset"]},
  {"slug":"meilisearch","ram_min":1024,"ram_max":8192,"storage_min":5,"storage_max":100,"confidence":"low","ram_basis":"One small search index; document count, indexed fields, and concurrent queries raise memory use.","ram_sources":["https://www.meilisearch.com/integrations/docker"],"storage_basis":"Estimate covers a small persistent index; indexed document count and attributes drive disk use.","storage_sources":["https://www.meilisearch.com/integrations/docker","https://www.meilisearch.com/blog/meilisearch-in-production-taking-it-to-the-next-level"]},
  {"slug":"odysseus","ram_min":8192,"ram_max":32768,"storage_min":20,"storage_max":100,"confidence":"low","ram_basis":"Estimate includes the app stack and a small local-model workload; model size, inference, and vector indexing raise memory use.","ram_sources":["https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","https://github.com/odysseus-dev/odysseus/blob/dev/docker-compose.yml"],"storage_basis":"Estimate includes app data, ChromaDB vectors, and a few local model downloads; model choice and user files raise disk use.","storage_sources":["https://github.com/odysseus-dev/odysseus/blob/dev/website/setup.md","https://github.com/odysseus-dev/odysseus/blob/dev/docs/backup-restore.md"]},
  {"slug":"rclone","ram_min":256,"ram_max":2048,"storage_min":50,"storage_max":500,"confidence":"low","ram_basis":"One small sync, mount, or remote-control process; concurrent transfers and configured cache size raise memory use.","ram_sources":["https://rclone.org/install/","https://rclone.org/rc/"],"storage_basis":"Estimate assumes a small sync or mount with active cache; local copies and cache size can dominate disk use.","storage_sources":["https://rclone.org/install/","https://github.com/rclone/rclone/blob/master/contrib/docker/docker-compose.dlna-server.yml"]}
]$resources$::jsonb) as r(
  slug text,ram_min integer,ram_max integer,storage_min integer,storage_max integer,confidence text,
  ram_basis text,ram_sources text[],storage_basis text,storage_sources text[]
)
join public.self_host_apps a on a.slug=r.slug
where a.published=true and a.self_hosting_status='self_hostable'
on conflict (app_id) do update set
  ram_estimate_min_mb=excluded.ram_estimate_min_mb,
  ram_estimate_max_mb=excluded.ram_estimate_max_mb,
  ram_estimate_kind=excluded.ram_estimate_kind,
  ram_estimate_confidence=excluded.ram_estimate_confidence,
  ram_estimate_basis=excluded.ram_estimate_basis,
  ram_source_urls=excluded.ram_source_urls,
  storage_estimate_min_gb=excluded.storage_estimate_min_gb,
  storage_estimate_max_gb=excluded.storage_estimate_max_gb,
  storage_estimate_kind=excluded.storage_estimate_kind,
  storage_estimate_confidence=excluded.storage_estimate_confidence,
  storage_estimate_basis=excluded.storage_estimate_basis,
  storage_source_urls=excluded.storage_source_urls,
  checked_at=excluded.checked_at,
  updated_at=now();

commit;
