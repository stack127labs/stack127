begin;

create temporary table self_host_apps_review_batch_06 on commit drop as
select *
from jsonb_to_recordset($batch$[
  {
    "slug":"chibisafe","name":"Chibisafe","summary":"Chibisafe lets people upload files and share them through links.",
    "website_url":"https://chibisafe.app/","source_code_url":"https://github.com/chibisafe/chibisafe","source_code_host":"github",
    "docs_url":"https://chibisafe.app/docs/installation/running-with-docker","install_docs_url":"https://chibisafe.app/docs/installation/running-with-docker",
    "license":"MIT","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source",
    "publisher_name":"Chibisafe","publisher_type":"community","publisher_url":"https://github.com/chibisafe",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker","compose"],"surfaces":["web"],"storage_profile":"high",
    "categories":["file-sharing-sync","photos-galleries"],"docker_url":"https://hub.docker.com/r/chibisafe/chibisafe","docker_image":"chibisafe/chibisafe:latest",
    "compose_url":"https://chibisafe.app/docs/installation/running-with-docker",
    "github_owner":"chibisafe","github_repo":"chibisafe","source_full_name":"chibisafe/chibisafe",
    "data_source_urls":["https://chibisafe.app/","https://chibisafe.app/docs/installation/running-with-docker","https://github.com/chibisafe/chibisafe","https://github.com/chibisafe/chibisafe/blob/master/LICENSE","https://hub.docker.com/r/chibisafe/chibisafe","https://hub.docker.com/r/chibisafe/chibisafe-server","https://hub.docker.com/_/caddy"],
    "install_options":[
      {"method":"docker","label":"Official frontend image","url":"https://hub.docker.com/r/chibisafe/chibisafe","image":"chibisafe/chibisafe:latest","support_level":"official","source_url":"https://chibisafe.app/docs/installation/running-with-docker","note":null,"sort_order":10},
      {"method":"docker","label":"Official server image","url":"https://hub.docker.com/r/chibisafe/chibisafe-server","image":"chibisafe/chibisafe-server:latest","support_level":"official","source_url":"https://chibisafe.app/docs/installation/running-with-docker","note":null,"sort_order":20},
      {"method":"docker","label":"Caddy image used by the official stack","url":"https://hub.docker.com/_/caddy","image":"caddy:2-alpine","support_level":"official","source_url":"https://chibisafe.app/docs/installation/running-with-docker","note":null,"sort_order":30},
      {"method":"compose","label":"Docker Compose stack","url":"https://chibisafe.app/docs/installation/running-with-docker","image":null,"support_level":"official","source_url":"https://chibisafe.app/docs/installation/running-with-docker","note":"Runs the frontend, server, and Caddy containers together.","sort_order":40}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official repository contains the application source.","source_urls":["https://github.com/chibisafe/chibisafe"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project repository identifies the MIT license.","source_urls":["https://github.com/chibisafe/chibisafe/blob/master/LICENSE"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is maintained under the Chibisafe GitHub organization.","source_urls":["https://github.com/chibisafe/chibisafe"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The project publishes current installation instructions and official images.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker","https://hub.docker.com/r/chibisafe/chibisafe"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Official frontend and server images are documented.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker","https://hub.docker.com/r/chibisafe/chibisafe","https://hub.docker.com/r/chibisafe/chibisafe-server"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official installation guide provides a Compose stack.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The documented stack persists its database directory locally and does not require a separate database service.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is an estimate for a small upload service.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is an estimate; uploaded files drive storage use.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official guide names both Chibisafe images and its Caddy dependency.","source_urls":["https://chibisafe.app/docs/installation/running-with-docker"]}
    },
    "ram_min":512,"ram_max":2048,"ram_confidence":"low","ram_basis":"Small upload service; concurrent uploads affect memory.","ram_source_urls":["https://chibisafe.app/docs/installation/running-with-docker"],
    "storage_min":10,"storage_max":1000,"storage_confidence":"low","storage_basis":"Uploaded files and retained copies determine storage use.","storage_source_urls":["https://chibisafe.app/docs/installation/running-with-docker"]
  },
  {
    "slug":"db-backup","name":"db-backup","summary":"db-backup schedules and manages backups for several database engines.",
    "website_url":"https://nfrastack.com/db-backup/","source_code_url":"https://github.com/nfrastack/db-backup","source_code_host":"github",
    "docs_url":"https://nfrastack.com/db-backup/","install_docs_url":"https://nfrastack.com/db-backup/install",
    "license":"AGPL-3.0-or-later for Community Edition; Nfrastack Supporter License v1 for paid features; MIT for container packaging","license_spdx_id":null,"license_type":"mixed","source_model":"open_source",
    "publisher_name":"Nfrastack","publisher_type":"unknown","publisher_url":"https://nfrastack.com/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"freemium","deployment_methods":["docker","compose","binary"],"surfaces":["cli"],"storage_profile":"high",
    "categories":["databases","storage-backup"],"docker_url":"https://hub.docker.com/r/nfrastack/db-backup","docker_image":"nfrastack/db-backup:latest",
    "compose_url":"https://nfrastack.com/db-backup/container",
    "github_owner":"nfrastack","github_repo":"db-backup","source_full_name":"nfrastack/db-backup",
    "data_source_urls":["https://nfrastack.com/db-backup/","https://nfrastack.com/db-backup/install","https://nfrastack.com/db-backup/container","https://nfrastack.com/db-backup/editions","https://github.com/nfrastack/db-backup","https://github.com/nfrastack/container-db-backup","https://hub.docker.com/r/nfrastack/db-backup"],
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://hub.docker.com/r/nfrastack/db-backup","image":"nfrastack/db-backup:latest","support_level":"official","source_url":"https://nfrastack.com/db-backup/install","note":null,"sort_order":10},
      {"method":"compose","label":"Docker Compose deployment","url":"https://nfrastack.com/db-backup/container","image":null,"support_level":"official","source_url":"https://nfrastack.com/db-backup/container","note":"Backup storage requirements depend on the databases and retention settings.","sort_order":20},
      {"method":"binary","label":"Prebuilt binaries","url":"https://github.com/nfrastack/db-backup/releases","image":null,"support_level":"official","source_url":"https://nfrastack.com/db-backup/install","note":null,"sort_order":30}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Nfrastack publishes the db-backup source repository.","source_urls":["https://github.com/nfrastack/db-backup"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Community code is AGPL-3.0-or-later; supported features and image packaging have separate licenses.","source_urls":["https://nfrastack.com/db-backup/editions","https://nfrastack.com/db-backup/container","https://github.com/nfrastack/db-backup","https://github.com/nfrastack/container-db-backup"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Nfrastack maintains the software and official image.","source_urls":["https://nfrastack.com/db-backup/","https://github.com/nfrastack/db-backup"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Current 5.0.x documentation and container releases are available.","source_urls":["https://nfrastack.com/db-backup/","https://nfrastack.com/db-backup/install"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Nfrastack publishes the Docker image and Compose instructions.","source_urls":["https://nfrastack.com/db-backup/container","https://hub.docker.com/r/nfrastack/db-backup"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official container guide includes a Compose example.","source_urls":["https://nfrastack.com/db-backup/container"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The tool connects to databases to back them up but does not require a database for its own state.","source_urls":["https://nfrastack.com/db-backup/guides/quickstart"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated; backup engine and compression affect memory.","source_urls":["https://nfrastack.com/db-backup/container"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated; backup size and retention determine disk use.","source_urls":["https://nfrastack.com/db-backup/container"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official container guide documents the nfrastack/db-backup image.","source_urls":["https://nfrastack.com/db-backup/container"]}
    },
    "ram_min":256,"ram_max":2048,"ram_confidence":"low","ram_basis":"Backup engine, source database, and compression affect memory.","ram_source_urls":["https://nfrastack.com/db-backup/container"],
    "storage_min":10,"storage_max":500,"storage_confidence":"low","storage_basis":"Backup size, destination, and retention determine storage use.","storage_source_urls":["https://nfrastack.com/db-backup/container"]
  },
  {
    "slug":"diskspeed","name":"DiskSpeed","summary":"DiskSpeed benchmarks drives and controllers to help spot slowdowns and failing hardware.",
    "website_url":"https://github.com/jbartlett777/DiskSpeed","source_code_url":"https://github.com/jbartlett777/DiskSpeed","source_code_host":"github",
    "docs_url":"https://github.com/jbartlett777/DiskSpeed/blob/master/README.md","install_docs_url":"https://github.com/jbartlett777/DiskSpeed/blob/master/README.md#installation-instructions",
    "license":"GNU General Public License v3.0","license_spdx_id":"GPL-3.0-only","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"jbartlett777","publisher_type":"unknown","publisher_url":"https://github.com/jbartlett777",
    "maintenance_status":"unknown","docker_support":"official","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker"],"surfaces":["web"],"storage_profile":"medium",
    "categories":["system-admin-hosting"],"docker_url":"https://hub.docker.com/r/jbartlett777/diskspeed","docker_image":"jbartlett777/diskspeed",
    "compose_url":null,
    "github_owner":"jbartlett777","github_repo":"DiskSpeed","source_full_name":"jbartlett777/DiskSpeed",
    "data_source_urls":["https://github.com/jbartlett777/DiskSpeed","https://github.com/jbartlett777/DiskSpeed/blob/master/README.md","https://github.com/jbartlett777/DiskSpeed/blob/master/LICENSE","https://hub.docker.com/r/jbartlett777/diskspeed"],
    "install_options":[
      {"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/jbartlett777/diskspeed","image":"jbartlett777/diskspeed","support_level":"official","source_url":"https://github.com/jbartlett777/DiskSpeed/blob/master/README.md#installation-instructions","note":"Requires privileged container access to scan hardware.","sort_order":10}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project repository contains the DiskSpeed source.","source_urls":["https://github.com/jbartlett777/DiskSpeed"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"GitHub identifies the project as GPL-3.0.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/LICENSE"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository owner publishes the app and its Docker instructions.","source_urls":["https://github.com/jbartlett777/DiskSpeed"]},
      "maintenance":{"status":"unchecked","checked_at":"2026-09-29","confidence":"low","note":"The repo does not clearly state a current maintenance commitment.","source_urls":["https://github.com/jbartlett777/DiskSpeed"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The app README gives Docker instructions and its image name.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"]},
      "compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"The project install guide documents Docker CLI and Unraid, not a Compose deployment.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The documented container uses app storage and does not require a database service.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for occasional drive benchmarks.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated; benchmark test files can use temporary disk space.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project README names its Docker image.","source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md","https://hub.docker.com/r/jbartlett777/diskspeed"]}
    },
    "ram_min":256,"ram_max":1024,"ram_confidence":"low","ram_basis":"Drive scans and concurrent benchmark tasks affect memory use.","ram_source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"],
    "storage_min":10,"storage_max":100,"storage_confidence":"low","storage_basis":"Saved results and temporary SSD benchmark files use disk space.","storage_source_urls":["https://github.com/jbartlett777/DiskSpeed/blob/master/README.md"]
  },
  {
    "slug":"localstack","name":"LocalStack","summary":"LocalStack emulates AWS services locally for development and testing.",
    "website_url":"https://www.localstack.cloud/","source_code_url":null,"source_code_host":"unknown",
    "docs_url":"https://docs.localstack.cloud/aws/","install_docs_url":"https://docs.localstack.cloud/aws/getting-started/installation/",
    "license":"LocalStack Terms of Service (current distribution)","license_spdx_id":null,"license_type":"custom","source_model":"closed_source",
    "publisher_name":"LocalStack","publisher_type":"company","publisher_url":"https://www.localstack.cloud/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"freemium","deployment_methods":["docker","compose"],"surfaces":["api","cli"],"storage_profile":"medium",
    "categories":["developer-tools"],"docker_url":"https://hub.docker.com/r/localstack/localstack","docker_image":"localstack/localstack:latest",
    "compose_url":"https://docs.localstack.cloud/aws/getting-started/installation/",
    "github_owner":null,"github_repo":null,"source_full_name":null,
    "data_source_urls":["https://www.localstack.cloud/","https://www.localstack.cloud/legal/terms-of-service","https://docs.localstack.cloud/aws/getting-started/installation/","https://docs.localstack.cloud/aws/getting-started/auth-token/","https://docs.localstack.cloud/aws/licensing/","https://docs.localstack.cloud/aws/customization/other-installations/docker-images/","https://blog.localstack.cloud/localstack-for-aws-release-2026-03-0/","https://github.com/localstack/localstack","https://hub.docker.com/r/localstack/localstack"],
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://hub.docker.com/r/localstack/localstack","image":"localstack/localstack:latest","support_level":"official","source_url":"https://docs.localstack.cloud/aws/getting-started/installation/","note":"Requires a LocalStack account and auth token.","sort_order":10},
      {"method":"compose","label":"Docker Compose deployment","url":"https://docs.localstack.cloud/aws/getting-started/installation/","image":null,"support_level":"official","source_url":"https://docs.localstack.cloud/aws/getting-started/installation/","note":"Requires a LocalStack account and auth token.","sort_order":20}
    ],
    "technical_status":{
      "source_code":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The current image is distributed under LocalStack terms; its archived Community Edition repository is historical source code.","source_urls":["https://www.localstack.cloud/legal/terms-of-service","https://github.com/localstack/localstack"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Current use is governed by LocalStack Terms and a plan; the former Community Edition code is Apache-2.0.","source_urls":["https://www.localstack.cloud/legal/terms-of-service","https://docs.localstack.cloud/aws/licensing/","https://github.com/localstack/localstack/blob/main/LICENSE.txt"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"LocalStack publishes the current product and container image.","source_urls":["https://www.localstack.cloud/","https://hub.docker.com/r/localstack/localstack"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The current LocalStack for AWS product has current documentation and releases.","source_urls":["https://docs.localstack.cloud/aws/","https://blog.localstack.cloud/localstack-for-aws-release-2026-03-0/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The current install guide supports Docker and Compose.","source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The current install guide includes a Compose configuration.","source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The emulator runs as a container and does not require a separate database service.","source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated; memory use varies by enabled services.","source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated; persisted test state varies by workload.","source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Current docs name localstack/localstack and require a token.","source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/","https://hub.docker.com/r/localstack/localstack"]}
    },
    "ram_min":2048,"ram_max":8192,"ram_confidence":"low","ram_basis":"Enabled AWS emulators and test workload drive memory use.","ram_source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"],
    "storage_min":10,"storage_max":100,"storage_confidence":"low","storage_basis":"Persisted emulator state and test data drive storage use.","storage_source_urls":["https://docs.localstack.cloud/aws/getting-started/installation/"]
  },
  {
    "slug":"obfs4-bridge","name":"Obfs4 Bridge","summary":"An obfs4 bridge helps people reach Tor from networks that block access.",
    "website_url":"https://www.torproject.org/","source_code_url":"https://gitlab.torproject.org/tpo/anti-censorship/docker-obfs4-bridge","source_code_host":"gitlab",
    "docs_url":"https://community.torproject.org/relay/setup/bridge/","install_docs_url":"https://community.torproject.org/relay/setup/bridge/docker/",
    "license":null,"license_spdx_id":null,"license_type":"unknown","source_model":"unknown",
    "publisher_name":"The Tor Project, Inc.","publisher_type":"company","publisher_url":"https://www.torproject.org/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker","compose"],"surfaces":[],"storage_profile":"low",
    "categories":["networking-dns","security-privacy"],"docker_url":"https://hub.docker.com/r/thetorproject/obfs4-bridge","docker_image":"thetorproject/obfs4-bridge:latest",
    "compose_url":"https://community.torproject.org/relay/setup/bridge/docker/",
    "github_owner":null,"github_repo":null,"source_full_name":null,
    "data_source_urls":["https://www.torproject.org/","https://community.torproject.org/relay/setup/bridge/","https://community.torproject.org/relay/setup/bridge/docker/","https://gitlab.torproject.org/tpo/anti-censorship/docker-obfs4-bridge","https://gitlab.torproject.org/tpo/anti-censorship/pluggable-transports/lyrebird","https://hub.docker.com/r/thetorproject/obfs4-bridge","https://hub.docker.com/r/thetorproject/obfs4-bridge/tags"],
    "install_options":[
      {"method":"docker","label":"Official Tor Project image","url":"https://hub.docker.com/r/thetorproject/obfs4-bridge","image":"thetorproject/obfs4-bridge:latest","support_level":"official","source_url":"https://community.torproject.org/relay/setup/bridge/docker/","note":"Keep the Tor data volume so the bridge keeps its identity.","sort_order":10},
      {"method":"compose","label":"Docker Compose setup","url":"https://community.torproject.org/relay/setup/bridge/docker/","image":null,"support_level":"official","source_url":"https://community.torproject.org/relay/setup/bridge/docker/","note":"Requires an open OR port and obfs4 port.","sort_order":20}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Tor publishes the Docker bridge build repository.","source_urls":["https://gitlab.torproject.org/tpo/anti-censorship/docker-obfs4-bridge"]},
      "license":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"An explicit license for the official Docker bridge repository was not verified.","source_urls":["https://gitlab.torproject.org/tpo/anti-censorship/docker-obfs4-bridge"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official image is published by The Tor Project, Inc.","source_urls":["https://hub.docker.com/r/thetorproject/obfs4-bridge"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official image has recent tags and updates.","source_urls":["https://hub.docker.com/r/thetorproject/obfs4-bridge/tags"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Tor documents and publishes its bridge container.","source_urls":["https://community.torproject.org/relay/setup/bridge/docker/","https://hub.docker.com/r/thetorproject/obfs4-bridge"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide provides a Compose setup.","source_urls":["https://community.torproject.org/relay/setup/bridge/docker/"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The bridge stores its identity and state in a Docker volume and does not need a database.","source_urls":["https://community.torproject.org/relay/setup/bridge/docker/"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for a single bridge.","source_urls":["https://community.torproject.org/relay/setup/bridge/docker/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for bridge keys and state.","source_urls":["https://community.torproject.org/relay/setup/bridge/docker/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Tor guide links the official image.","source_urls":["https://community.torproject.org/relay/setup/bridge/docker/","https://hub.docker.com/r/thetorproject/obfs4-bridge"]}
    },
    "ram_min":128,"ram_max":512,"ram_confidence":"low","ram_basis":"Estimate for one Tor bridge with moderate relay traffic.","ram_source_urls":["https://community.torproject.org/relay/setup/bridge/docker/"],
    "storage_min":1,"storage_max":10,"storage_confidence":"low","storage_basis":"The container stores bridge keys and state in a persistent volume.","storage_source_urls":["https://community.torproject.org/relay/setup/bridge/docker/"]
  },
  {
    "slug":"pgadmin4","name":"pgAdmin 4","summary":"pgAdmin manages PostgreSQL servers, databases, and queries through a web interface.",
    "website_url":"https://www.pgadmin.org/","source_code_url":"https://github.com/pgadmin-org/pgadmin4","source_code_host":"github",
    "docs_url":"https://www.pgadmin.org/docs/pgadmin4/latest/","install_docs_url":"https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html",
    "license":"PostgreSQL License","license_spdx_id":"PostgreSQL","license_type":"permissive","source_model":"open_source",
    "publisher_name":"pgAdmin Development Team","publisher_type":"community","publisher_url":"https://www.pgadmin.org/",
    "maintenance_status":"active","docker_support":"official","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker"],"surfaces":["web"],"storage_profile":"low",
    "categories":["databases","developer-tools"],"docker_url":"https://hub.docker.com/r/dpage/pgadmin4","docker_image":"dpage/pgadmin4:latest",
    "compose_url":null,
    "github_owner":"pgadmin-org","github_repo":"pgadmin4","source_full_name":"pgadmin-org/pgadmin4",
    "data_source_urls":["https://www.pgadmin.org/","https://www.pgadmin.org/docs/pgadmin4/latest/","https://www.pgadmin.org/docs/pgadmin4/latest/licence.html","https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html","https://www.pgadmin.org/download/pgadmin-4-container/","https://github.com/pgadmin-org/pgadmin4","https://hub.docker.com/r/dpage/pgadmin4"],
    "install_options":[
      {"method":"docker","label":"Official pgAdmin 4 container","url":"https://hub.docker.com/r/dpage/pgadmin4","image":"dpage/pgadmin4:latest","support_level":"official","source_url":"https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html","note":"Stores configuration and session data under /var/lib/pgadmin.","sort_order":10}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The pgAdmin Development Team publishes the source repository.","source_urls":["https://github.com/pgadmin-org/pgadmin4"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"pgAdmin is released under the PostgreSQL License, approved by OSI.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/licence.html"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Copyright and project information identify the pgAdmin Development Team.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/licence.html","https://www.pgadmin.org/download/pgadmin-4-container/"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes current releases and documentation.","source_urls":["https://www.pgadmin.org/","https://www.pgadmin.org/docs/pgadmin4/latest/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official container deployment guide names dpage/pgadmin4.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html","https://hub.docker.com/r/dpage/pgadmin4"]},
      "compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"The official pgAdmin container guide documents Docker CLI, not a Compose deployment.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The container keeps its own configuration database and state in /var/lib/pgadmin.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for a small web deployment.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for configuration and saved files.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official install guide uses dpage/pgadmin4.","source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"]}
    },
    "ram_min":512,"ram_max":2048,"ram_confidence":"low","ram_basis":"Small web deployment; concurrent database sessions affect memory use.","ram_source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"],
    "storage_min":1,"storage_max":20,"storage_confidence":"low","storage_basis":"Configuration, session data, and saved files use the persistent data directory.","storage_source_urls":["https://www.pgadmin.org/docs/pgadmin4/latest/container_deployment.html"]
  },
  {
    "slug":"phpipam","name":"phpIPAM","summary":"phpIPAM tracks IP address space, subnets, and network inventory.",
    "website_url":"https://phpipam.net/","source_code_url":"https://github.com/phpipam/phpipam","source_code_host":"github",
    "docs_url":"https://phpipam.net/documents/","install_docs_url":"https://phpipam.net/documents/installation/",
    "license":"GNU General Public License v3.0","license_spdx_id":"GPL-3.0-only","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"phpIPAM","publisher_type":"community","publisher_url":"https://github.com/phpipam/phpipam",
    "maintenance_status":"active","docker_support":"community","compose_support":true,"requires_database":true,"database_types":["mysql","mariadb"],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["native","docker","compose"],"surfaces":["web"],"storage_profile":"medium",
    "categories":["networking-dns","system-admin-hosting"],"docker_url":"https://hub.docker.com/r/phpipam/phpipam-www","docker_image":"phpipam/phpipam-www:latest",
    "compose_url":"https://github.com/phpipam-docker/phpipam-docker/blob/master/README.md#docker-standalone",
    "github_owner":"phpipam","github_repo":"phpipam","source_full_name":"phpipam/phpipam",
    "data_source_urls":["https://phpipam.net/","https://phpipam.net/documents/","https://phpipam.net/documents/installation/","https://github.com/phpipam/phpipam","https://github.com/phpipam-docker/phpipam-docker","https://github.com/phpipam-docker/phpipam-docker/blob/master/README.md","https://hub.docker.com/r/phpipam/phpipam-www","https://hub.docker.com/r/phpipam/phpipam-cron"],
    "install_options":[
      {"method":"native","label":"Manual web-server installation","url":"https://phpipam.net/documents/installation/","image":null,"support_level":"official","source_url":"https://phpipam.net/documents/installation/","note":"Requires MySQL-compatible database service.","sort_order":10},
      {"method":"docker","label":"Community-maintained web image","url":"https://hub.docker.com/r/phpipam/phpipam-www","image":"phpipam/phpipam-www:latest","support_level":"community","source_url":"https://github.com/phpipam-docker/phpipam-docker","note":"The full stack also includes MariaDB and a scheduled discovery service.","sort_order":20},
      {"method":"docker","label":"Community-maintained scheduled discovery image","url":"https://hub.docker.com/r/phpipam/phpipam-cron","image":"phpipam/phpipam-cron:latest","support_level":"community","source_url":"https://github.com/phpipam-docker/phpipam-docker","note":"Run one cron container for a phpIPAM stack.","sort_order":30},
      {"method":"compose","label":"Docker Compose stack","url":"https://github.com/phpipam-docker/phpipam-docker/blob/master/README.md#docker-standalone","image":null,"support_level":"community","source_url":"https://github.com/phpipam-docker/phpipam-docker","note":"Includes web, cron, and MariaDB services.","sort_order":40}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project source is published by phpIPAM.","source_urls":["https://github.com/phpipam/phpipam"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project states that it is released under GPL v3.","source_urls":["https://github.com/phpipam/phpipam"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The phpIPAM project repository and website identify the project publisher.","source_urls":["https://github.com/phpipam/phpipam","https://phpipam.net/"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The official repository and install documentation remain current.","source_urls":["https://github.com/phpipam/phpipam","https://phpipam.net/documents/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Community-maintained phpIPAM images are documented by the image project.","source_urls":["https://github.com/phpipam-docker/phpipam-docker","https://hub.docker.com/r/phpipam/phpipam-www"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The image project provides a Compose example with web, cron, and MariaDB.","source_urls":["https://github.com/phpipam-docker/phpipam-docker/blob/master/README.md"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Installation requires MySQL-compatible database details; the container stack uses MariaDB.","source_urls":["https://phpipam.net/documents/installation/","https://github.com/phpipam-docker/phpipam-docker"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for a small web and database deployment.","source_urls":["https://phpipam.net/documents/installation/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for network inventory and database history.","source_urls":["https://phpipam.net/documents/installation/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The image project names phpipam-www and phpipam-cron containers.","source_urls":["https://github.com/phpipam-docker/phpipam-docker","https://hub.docker.com/r/phpipam/phpipam-www","https://hub.docker.com/r/phpipam/phpipam-cron"]}
    },
    "ram_min":512,"ram_max":2048,"ram_confidence":"low","ram_basis":"Small web and MariaDB setup; inventory size and polling affect memory.","ram_source_urls":["https://phpipam.net/documents/installation/","https://github.com/phpipam-docker/phpipam-docker"],
    "storage_min":5,"storage_max":50,"storage_confidence":"low","storage_basis":"IP records, history, and database backups drive storage use.","storage_source_urls":["https://phpipam.net/documents/installation/"]
  },
  {
    "slug":"redisinsight","name":"Redis Insight","summary":"Redis Insight lets people inspect, query, and monitor Redis databases through a web interface.",
    "website_url":"https://redis.io/insight/","source_code_url":"https://github.com/redis/RedisInsight","source_code_host":"github",
    "docs_url":"https://redis.io/docs/latest/operate/redisinsight/","install_docs_url":"https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/",
    "license":"Server Side Public License v1","license_spdx_id":"SSPL-1.0","license_type":"copyleft","source_model":"source_available",
    "publisher_name":"Redis","publisher_type":"company","publisher_url":"https://redis.io/",
    "maintenance_status":"active","docker_support":"official","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker"],"surfaces":["web"],"storage_profile":"low",
    "categories":["databases","developer-tools"],"docker_url":"https://hub.docker.com/r/redis/redisinsight","docker_image":"redis/redisinsight:latest",
    "compose_url":null,
    "github_owner":"redis","github_repo":"RedisInsight","source_full_name":"redis/RedisInsight",
    "data_source_urls":["https://redis.io/insight/","https://redis.io/docs/latest/operate/redisinsight/","https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/","https://github.com/redis/RedisInsight","https://github.com/redis/RedisInsight/blob/main/LICENSE","https://hub.docker.com/r/redis/redisinsight"],
    "install_options":[
      {"method":"docker","label":"Official Redis Insight image","url":"https://hub.docker.com/r/redis/redisinsight","image":"redis/redisinsight:latest","support_level":"official","source_url":"https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/","note":"Mount /data to keep Redis Insight settings and data between restarts.","sort_order":10}
    ],
    "technical_status":{
      "source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis publishes the Redis Insight source repository.","source_urls":["https://github.com/redis/RedisInsight"]},
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis Insight is licensed under SSPL, a source-available license.","source_urls":["https://github.com/redis/RedisInsight/blob/main/LICENSE"]},
      "publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis publishes the product, source, and official image.","source_urls":["https://github.com/redis/RedisInsight","https://redis.io/insight/"]},
      "maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Current Redis Insight documentation and 2026 releases are available.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/","https://redis.io/docs/latest/develop/tools/insight/release-notes/v.3.4.1/"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Redis documents the official redis/redisinsight image.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/","https://hub.docker.com/r/redis/redisinsight"]},
      "compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"The official container guide documents Docker CLI, not Compose.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"Redis Insight connects to Redis servers and stores its own state under /data.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for a small web UI deployment.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Planning value is estimated for local settings; Redis data remains on the Redis server.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker guide names redis/redisinsight:latest.","source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"]}
    },
    "ram_min":512,"ram_max":2048,"ram_confidence":"low","ram_basis":"Small web UI; number of active connections and analyses affect memory.","ram_source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"],
    "storage_min":1,"storage_max":20,"storage_confidence":"low","storage_basis":"Local settings are stored under /data; Redis datasets stay on the Redis server.","storage_source_urls":["https://redis.io/docs/latest/operate/redisinsight/install/install-on-docker/"]
  }
]$batch$::jsonb) as reviewed(
  slug text,name text,summary text,website_url text,source_code_url text,source_code_host text,docs_url text,install_docs_url text,
  license text,license_spdx_id text,license_type text,source_model text,publisher_name text,publisher_type text,publisher_url text,
  maintenance_status text,docker_support text,compose_support boolean,requires_database boolean,database_types text[],persistent_storage boolean,
  pricing_model text,deployment_methods text[],surfaces text[],storage_profile text,categories text[],docker_url text,docker_image text,compose_url text,
  github_owner text,github_repo text,source_full_name text,data_source_urls text[],install_options jsonb,technical_status jsonb,
  ram_min numeric,ram_max numeric,ram_confidence text,ram_basis text,ram_source_urls text[],
  storage_min numeric,storage_max numeric,storage_confidence text,storage_basis text,storage_source_urls text[]
);

do $guard$
declare
  v_item record;
  v_name text;
  v_source_model text;
  v_license text;
  v_docker_image text;
begin
  if (select count(*) from self_host_apps_review_batch_06) <> 8 then
    raise exception 'Batch 06 payload must contain eight app records';
  end if;
  for v_item in select * from (values
    ('chibisafe','Chibisafe','open_source','MIT',null::text),
    ('db-backup','db-backup','closed_source',null::text,'tiredofit/db-backup:latest'),
    ('diskspeed','DiskSpeed','closed_source',null::text,'jbartlett777/diskspeed'),
    ('localstack','LocalStack','closed_source',null::text,'localstack/localstack:latest'),
    ('obfs4-bridge','obfs4-bridge','closed_source',null::text,'thetorproject/obfs4-bridge'),
    ('pgadmin4','pgAdmin4','closed_source',null::text,'fenglc/pgadmin4'),
    ('phpipam','Phpipam','open_source','GNU General Public License v3.0',null::text),
    ('redisinsight','RedisInsight','closed_source',null::text,'redis/redisinsight:latest')
  ) expected(slug,old_name,old_source_model,old_license,old_docker_image)
  loop
    select app.name,app.source_model::text,app.license,app.docker_image
      into v_name,v_source_model,v_license,v_docker_image
    from public.self_host_apps app
    where app.slug=v_item.slug and app.published is true and app.self_hosting_status='self_hostable';
    if not found or v_name is distinct from v_item.old_name or v_source_model is distinct from v_item.old_source_model
       or v_license is distinct from v_item.old_license or v_docker_image is distinct from v_item.old_docker_image then
      raise exception 'Batch 06 app baseline changed for %',v_item.slug;
    end if;
  end loop;
  if not exists (select 1 from public.self_host_apps where slug='chibisafe-caddy' and name='chibisafe-caddy' and published is true)
     or not exists (select 1 from public.self_host_apps where slug='phpipam-cron' and name='phpIPAM-cron' and published is true) then
    raise exception 'Batch 06 duplicate baseline changed';
  end if;
end
$guard$;

update public.self_host_apps app set
  name=reviewed.name,summary=reviewed.summary,website_url=reviewed.website_url,
  source_code_url=reviewed.source_code_url,source_code_host=reviewed.source_code_host,
  docs_url=reviewed.docs_url,install_docs_url=reviewed.install_docs_url,
  license=reviewed.license,license_spdx_id=reviewed.license_spdx_id,
  license_type=reviewed.license_type::public.self_host_app_license_type,
  source_model=reviewed.source_model::public.self_host_app_source_model,
  publisher_name=reviewed.publisher_name,publisher_type=reviewed.publisher_type,publisher_url=reviewed.publisher_url,
  maintenance_status=reviewed.maintenance_status,
  docker_url=reviewed.docker_url,docker_image=reviewed.docker_image,docker_support=reviewed.docker_support,
  compose_url=reviewed.compose_url,compose_support=reviewed.compose_support,
  requires_database=reviewed.requires_database,database_types=reviewed.database_types,
  persistent_storage=reviewed.persistent_storage,pricing_model=reviewed.pricing_model,
  deployment_methods=reviewed.deployment_methods,surfaces=reviewed.surfaces,storage_profile=reviewed.storage_profile,
  github_owner=reviewed.github_owner,github_repo=reviewed.github_repo,source_full_name=reviewed.source_full_name,
  summary_source='curated',summary_confidence='high',data_confidence='high',
  data_source_urls=reviewed.data_source_urls,
  technical_fact_status=coalesce(app.technical_fact_status,'{}'::jsonb)||reviewed.technical_status,
  updated_at=now()
from self_host_apps_review_batch_06 reviewed
where app.slug=reviewed.slug;

do $categories$
declare
  v_item record;
  v_app uuid;
  v_count integer;
begin
  for v_item in select slug,categories from self_host_apps_review_batch_06 loop
    select id into v_app from public.self_host_apps where slug=v_item.slug for update;
    delete from public.self_host_app_category_links where app_id=v_app;
    insert into public.self_host_app_category_links(app_id,category_id)
    select v_app,category.id from public.self_host_app_categories category
    where category.slug=any(v_item.categories);
    get diagnostics v_count=row_count;
    if v_count<>cardinality(v_item.categories) then
      raise exception 'Batch 06 category assignment failed for %',v_item.slug;
    end if;
  end loop;
end
$categories$;

update public.self_host_app_resource_estimates estimate set
  ram_estimate_min_mb=reviewed.ram_min,ram_estimate_max_mb=reviewed.ram_max,
  ram_estimate_kind='estimated',ram_estimate_confidence=reviewed.ram_confidence,
  ram_estimate_basis=reviewed.ram_basis,ram_source_urls=reviewed.ram_source_urls,ram_note=null,
  storage_estimate_min_gb=reviewed.storage_min,storage_estimate_max_gb=reviewed.storage_max,
  storage_estimate_kind='estimated',storage_estimate_confidence=reviewed.storage_confidence,
  storage_estimate_basis=reviewed.storage_basis,storage_source_urls=reviewed.storage_source_urls,storage_note=null,
  checked_at=now(),updated_at=now()
from self_host_apps_review_batch_06 reviewed
join public.self_host_apps app on app.slug=reviewed.slug
where estimate.app_id=app.id;

insert into public.self_host_app_install_options(
  app_id,options,docker_urls,docker_images,compose_urls,truenas_scale_urls,unraid_urls,umbrel_urls,yunohost_urls,casaos_urls,runtipi_urls,
  cosmos_urls,openmediavault_urls,synology_urls,qnap_urls,proxmox_urls,home_assistant_os_urls,kubernetes_urls,helm_urls,native_urls,binary_urls,
  package_urls,other_urls,catalog_sources,source_urls,checked_at,updated_at
)
select app.id,reviewed.install_options,
  array(select distinct option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='docker' order by option->>'url'),
  array(select distinct option->>'image' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='docker' and nullif(option->>'image','') is not null order by option->>'image'),
  array(select distinct option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='compose' order by option->>'url'),
  '{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}','{}',
  array(select distinct option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='native' order by option->>'url'),
  array(select distinct option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='binary' order by option->>'url'),
  array(select distinct option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='package' order by option->>'url'),
  array(select distinct option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='other' order by option->>'url'),
  '[]'::jsonb,reviewed.data_source_urls,now(),now()
from self_host_apps_review_batch_06 reviewed
join public.self_host_apps app on app.slug=reviewed.slug
on conflict (app_id) do update set
  options=excluded.options,docker_urls=excluded.docker_urls,docker_images=excluded.docker_images,compose_urls=excluded.compose_urls,
  truenas_scale_urls=excluded.truenas_scale_urls,unraid_urls=excluded.unraid_urls,umbrel_urls=excluded.umbrel_urls,yunohost_urls=excluded.yunohost_urls,
  casaos_urls=excluded.casaos_urls,runtipi_urls=excluded.runtipi_urls,cosmos_urls=excluded.cosmos_urls,openmediavault_urls=excluded.openmediavault_urls,
  synology_urls=excluded.synology_urls,qnap_urls=excluded.qnap_urls,proxmox_urls=excluded.proxmox_urls,home_assistant_os_urls=excluded.home_assistant_os_urls,
  kubernetes_urls=excluded.kubernetes_urls,helm_urls=excluded.helm_urls,native_urls=excluded.native_urls,binary_urls=excluded.binary_urls,
  package_urls=excluded.package_urls,other_urls=excluded.other_urls,catalog_sources=excluded.catalog_sources,source_urls=excluded.source_urls,
  checked_at=excluded.checked_at,updated_at=excluded.updated_at;

update public.self_host_apps app set
  published=false,self_hosting_status='unknown',source_model='unknown',license_type='unknown',maintenance_status='unknown',
  summary='Duplicate component entry; install details are recorded with the main app.',
  updated_at=now()
where app.slug in ('chibisafe-caddy','phpipam-cron') and app.published is true;

delete from public.self_host_app_category_links link
using public.self_host_apps app
where link.app_id=app.id and app.slug in ('chibisafe-caddy','phpipam-cron');

commit;
