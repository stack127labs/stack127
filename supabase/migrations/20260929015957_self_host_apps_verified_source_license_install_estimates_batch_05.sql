begin;

create temporary table self_host_apps_review_batch_05 on commit drop as
select *
from jsonb_to_recordset($batch$
[
  {
    "slug":"boinc","name":"BOINC","summary":"Client that runs volunteer computing tasks for scientific research projects.",
    "website_url":"https://boinc.berkeley.edu/","source_code_url":"https://github.com/BOINC/boinc","source_code_host":"github",
    "docs_url":"https://github.com/BOINC/boinc/wiki/BOINC-overview","install_docs_url":"https://github.com/BOINC/boinc/wiki/Installing_on_Linux",
    "license":"LGPL-3.0-or-later","license_spdx_id":"LGPL-3.0-or-later","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"University of California, Berkeley","publisher_type":"unknown","publisher_url":"https://boinc.berkeley.edu/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["package","docker","compose"],"surfaces":["cli","desktop"],"storage_profile":"depends",
    "docker_url":"https://hub.docker.com/r/boinc/client","docker_image":"boinc/client:latest","compose_url":"https://github.com/BOINC/boinc-client-docker",
    "categories":["developer-tools"],
    "data_source_urls":["https://boinc.berkeley.edu/","https://github.com/BOINC/boinc","https://github.com/BOINC/boinc/wiki/BOINC-overview","https://github.com/BOINC/boinc/wiki/SourceCodeGit","https://github.com/BOINC/boinc/wiki/Installing_on_Linux","https://github.com/BOINC/boinc-client-docker","https://hub.docker.com/r/boinc/client"],
    "install_options":[
      {"method":"package","label":"Linux packages","url":"https://github.com/BOINC/boinc/wiki/Installing_on_Linux","image":null,"support_level":"official","source_url":"https://github.com/BOINC/boinc/wiki/Installing_on_Linux","note":null,"sort_order":10},
      {"method":"docker","label":"BOINC Docker image","url":"https://hub.docker.com/r/boinc/client","image":"boinc/client:latest","support_level":"official","source_url":"https://github.com/BOINC/boinc/wiki/Installing_on_Linux","note":"The project says this image is not maintained.","sort_order":20},
      {"method":"compose","label":"Docker Compose example","url":"https://github.com/BOINC/boinc-client-docker","image":null,"support_level":"official","source_url":"https://github.com/BOINC/boinc-client-docker","note":"Legacy example; the image is not maintained.","sort_order":30}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes the client source code.","source_urls":["https://github.com/BOINC/boinc"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project states LGPL version 3 or later.","source_urls":["https://github.com/BOINC/boinc/wiki/SourceCodeGit"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project identifies the University of California as copyright holder.","source_urls":["https://github.com/BOINC/boinc"]},"maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The source repository is active.","source_urls":["https://github.com/BOINC/boinc"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project lists its Docker image and says it is not maintained.","source_urls":["https://github.com/BOINC/boinc/wiki/Installing_on_Linux","https://hub.docker.com/r/boinc/client"]},"compose":{"status":"published","checked_at":"2026-09-29","confidence":"medium","note":"The project has a legacy Compose example.","source_urls":["https://github.com/BOINC/boinc-client-docker"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The BOINC client does not need a database service.","source_urls":["https://github.com/BOINC/boinc/wiki/BOINC-overview"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Project task and cache settings affect memory; the directory shows an estimate.","source_urls":["https://github.com/BOINC/boinc/wiki/Preferences"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Project task and cache settings affect disk use; the directory shows an estimate.","source_urls":["https://github.com/BOINC/boinc/wiki/Preferences"]}},
    "ram_min":512,"ram_max":8192,"ram_confidence":"low","ram_basis":"Memory use varies by research task and the client cache settings.","ram_source_urls":["https://github.com/BOINC/boinc/wiki/Preferences"],
    "storage_min":1,"storage_max":100,"storage_confidence":"low","storage_basis":"Downloaded work units and the selected client cache size drive disk use.","storage_source_urls":["https://github.com/BOINC/boinc/wiki/Preferences"]
  },
  {
    "slug":"zabbix-agent","name":"Zabbix Agent","summary":"Agent that collects host metrics and sends them to a Zabbix server.",
    "website_url":"https://www.zabbix.com/","source_code_url":"https://github.com/zabbix/zabbix","source_code_host":"github",
    "docs_url":"https://www.zabbix.com/documentation/current/en/manual/concepts/agent","install_docs_url":"https://www.zabbix.com/documentation/current/en/manual/installation/containers",
    "license":"AGPL-3.0-only","license_spdx_id":"AGPL-3.0-only","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"Zabbix LLC","publisher_type":"company","publisher_url":"https://www.zabbix.com/",
    "maintenance_status":"active","docker_support":"official","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":false,
    "pricing_model":"free","deployment_methods":["package","docker"],"surfaces":["api"],"storage_profile":"low",
    "docker_url":"https://hub.docker.com/r/zabbix/zabbix-agent","docker_image":"zabbix/zabbix-agent:alpine-7.4-latest","compose_url":null,
    "categories":["monitoring-status"],
    "data_source_urls":["https://www.zabbix.com/","https://github.com/zabbix/zabbix","https://github.com/zabbix/zabbix-docker","https://github.com/zabbix/zabbix-docker/blob/7.4/LICENSE","https://www.zabbix.com/license","https://www.zabbix.com/documentation/current/en/manual/concepts/agent","https://www.zabbix.com/documentation/current/en/manual/installation/containers","https://www.zabbix.com/container_images","https://hub.docker.com/r/zabbix/zabbix-agent"],
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://hub.docker.com/r/zabbix/zabbix-agent","image":"zabbix/zabbix-agent:alpine-7.4-latest","support_level":"official","source_url":"https://www.zabbix.com/documentation/current/en/manual/installation/containers","note":null,"sort_order":10},
      {"method":"package","label":"Agent packages","url":"https://www.zabbix.com/download_agents","image":null,"support_level":"official","source_url":"https://www.zabbix.com/documentation/current/en/manual/concepts/agent","note":null,"sort_order":20}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Zabbix publishes its source repository.","source_urls":["https://github.com/zabbix/zabbix"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Zabbix 7 and later use AGPL version 3.","source_urls":["https://www.zabbix.com/license","https://github.com/zabbix/zabbix-docker/blob/7.4/LICENSE"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project identifies Zabbix LLC as its publisher.","source_urls":["https://www.zabbix.com/"]},"maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Zabbix publishes current agent packages and container images.","source_urls":["https://www.zabbix.com/download_agents","https://www.zabbix.com/container_images"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Zabbix documents and publishes its own agent image.","source_urls":["https://www.zabbix.com/documentation/current/en/manual/installation/containers","https://hub.docker.com/r/zabbix/zabbix-agent"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"medium","note":"The agent's official installation pages do not provide an agent-only Compose deployment.","source_urls":["https://www.zabbix.com/documentation/current/en/manual/installation/containers"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The agent sends collected metrics to a Zabbix server and does not need its own database.","source_urls":["https://www.zabbix.com/documentation/current/en/manual/concepts/agent"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project does not set an agent memory requirement; the directory shows an estimate.","source_urls":["https://www.zabbix.com/documentation/current/en/manual/concepts/agent"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project does not set an agent storage requirement; the directory shows an estimate.","source_urls":["https://www.zabbix.com/documentation/current/en/manual/concepts/agent"]}},
    "ram_min":32,"ram_max":256,"ram_confidence":"low","ram_basis":"The agent is a small metrics collector; active checks and monitored items affect memory.","ram_source_urls":["https://www.zabbix.com/documentation/current/en/manual/concepts/agent"],
    "storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"The agent stores little local state; logs and configuration drive disk use.","storage_source_urls":["https://www.zabbix.com/documentation/current/en/manual/concepts/agent"]
  },
  {
    "slug":"dvwa-web","name":"DVWA","summary":"Intentionally vulnerable PHP and MariaDB app for security training.",
    "website_url":"https://github.com/digininja/DVWA","source_code_url":"https://github.com/digininja/DVWA","source_code_host":"github",
    "docs_url":"https://github.com/digininja/DVWA#readme","install_docs_url":"https://github.com/digininja/DVWA/blob/master/compose.yml",
    "license":"GPL-3.0-or-later","license_spdx_id":"GPL-3.0-or-later","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"Digininja","publisher_type":"individual","publisher_url":"https://github.com/digininja/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":true,"database_types":["mariadb"],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker","compose"],"surfaces":["web"],"storage_profile":"low",
    "docker_url":"https://github.com/digininja/DVWA/pkgs/container/dvwa","docker_image":"ghcr.io/digininja/dvwa:latest","compose_url":"https://github.com/digininja/DVWA/blob/master/compose.yml",
    "categories":["security-privacy"],
    "data_source_urls":["https://github.com/digininja/DVWA","https://github.com/digininja/DVWA/blob/master/README.md","https://github.com/digininja/DVWA/blob/master/README.md","https://github.com/digininja/DVWA/blob/master/compose.yml","https://github.com/digininja/DVWA/pkgs/container/dvwa"],
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://github.com/digininja/DVWA/pkgs/container/dvwa","image":"ghcr.io/digininja/dvwa:latest","support_level":"official","source_url":"https://github.com/digininja/DVWA/blob/master/README.md","note":null,"sort_order":10},
      {"method":"compose","label":"Docker Compose","url":"https://github.com/digininja/DVWA/blob/master/compose.yml","image":null,"support_level":"official","source_url":"https://github.com/digininja/DVWA/blob/master/README.md","note":null,"sort_order":20}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes its source repository.","source_urls":["https://github.com/digininja/DVWA"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project README offers GPL version 3 or later.","source_urls":["https://github.com/digininja/DVWA/blob/master/README.md"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is published by Digininja.","source_urls":["https://github.com/digininja/DVWA"]},"maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official container package has a recent release.","source_urls":["https://github.com/digininja/DVWA/pkgs/container/dvwa"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project documents its official GHCR image.","source_urls":["https://github.com/digininja/DVWA/blob/master/README.md","https://github.com/digininja/DVWA/pkgs/container/dvwa"]},"compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project provides a Compose setup for the app and MariaDB.","source_urls":["https://github.com/digininja/DVWA/blob/master/compose.yml"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose file runs MariaDB for the app.","source_urls":["https://github.com/digininja/DVWA/blob/master/compose.yml"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project does not state a RAM requirement; the directory shows an estimate.","source_urls":["https://github.com/digininja/DVWA/blob/master/compose.yml"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project does not state a storage requirement; the directory shows an estimate.","source_urls":["https://github.com/digininja/DVWA/blob/master/compose.yml"]}},
    "ram_min":512,"ram_max":2048,"ram_confidence":"low","ram_basis":"A small PHP app and MariaDB database; concurrent training sessions use more memory.","ram_source_urls":["https://github.com/digininja/DVWA/blob/master/compose.yml"],
    "storage_min":1,"storage_max":10,"storage_confidence":"low","storage_basis":"The app and database are small; database growth and retained logs affect storage.","storage_source_urls":["https://github.com/digininja/DVWA/blob/master/compose.yml"]
  },
  {
    "slug":"firefoxsyncserver","name":"Mozilla Syncserver (Legacy)","summary":"Archived server for syncing Firefox browser data on your own server.",
    "website_url":"https://github.com/mozilla-services/syncserver","source_code_url":"https://github.com/mozilla-services/syncserver","source_code_host":"github",
    "docs_url":"https://mozilla-services.readthedocs.io/en/latest/howtos/run-sync-1.5.html","install_docs_url":"https://github.com/mozilla-services/syncserver#readme",
    "license":"MPL-2.0","license_spdx_id":"MPL-2.0","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"Mozilla Services","publisher_type":"unknown","publisher_url":"https://github.com/mozilla-services/",
    "maintenance_status":"archived","docker_support":"official","compose_support":true,"requires_database":false,"database_types":["sqlite","mysql","postgresql"],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker","compose"],"surfaces":["api"],"storage_profile":"medium",
    "docker_url":"https://hub.docker.com/r/mozilla/syncserver","docker_image":"mozilla/syncserver:latest","compose_url":"https://github.com/mozilla-services/syncserver#runner-under-docker",
    "categories":["file-sharing-sync"],
    "data_source_urls":["https://github.com/mozilla-services/syncserver","https://github.com/mozilla-services/syncserver/blob/master/LICENSE","https://github.com/mozilla-services/syncserver/blob/master/README.rst","https://mozilla-services.readthedocs.io/en/latest/howtos/run-sync-1.5.html","https://hub.docker.com/r/mozilla/syncserver"],
    "install_options":[
      {"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/mozilla/syncserver","image":"mozilla/syncserver:latest","support_level":"official","source_url":"https://github.com/mozilla-services/syncserver#runner-under-docker","note":"Archived project's experimental image.","sort_order":10},
      {"method":"compose","label":"Docker Compose example","url":"https://github.com/mozilla-services/syncserver#runner-under-docker","image":null,"support_level":"official","source_url":"https://github.com/mozilla-services/syncserver#runner-under-docker","note":"Archived project's experimental example.","sort_order":20}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Mozilla publishes the server source code.","source_urls":["https://github.com/mozilla-services/syncserver"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository identifies MPL version 2.0.","source_urls":["https://github.com/mozilla-services/syncserver/blob/master/LICENSE"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Mozilla Services owns the source repository.","source_urls":["https://github.com/mozilla-services/syncserver"]},"maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository says it is no longer maintained and is archived.","source_urls":["https://github.com/mozilla-services/syncserver"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The archived project documents experimental Docker support.","source_urls":["https://github.com/mozilla-services/syncserver#runner-under-docker","https://hub.docker.com/r/mozilla/syncserver"]},"compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The archived project includes an experimental Compose example.","source_urls":["https://github.com/mozilla-services/syncserver#runner-under-docker"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The server defaults to SQLite and also documents MySQL and PostgreSQL backends.","source_urls":["https://github.com/mozilla-services/syncserver#readme"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Mozilla does not give a RAM requirement; the directory shows an estimate.","source_urls":["https://github.com/mozilla-services/syncserver#readme"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Mozilla does not give a storage requirement; the directory shows an estimate.","source_urls":["https://github.com/mozilla-services/syncserver#readme"]}},
    "ram_min":256,"ram_max":2048,"ram_confidence":"low","ram_basis":"Memory varies with synced accounts and database backend use.","ram_source_urls":["https://github.com/mozilla-services/syncserver#readme"],
    "storage_min":1,"storage_max":20,"storage_confidence":"low","storage_basis":"Synced browser records and the selected database determine storage use.","storage_source_urls":["https://github.com/mozilla-services/syncserver#readme"]
  },
  {
    "slug":"lancache-dns","name":"LanCache DNS","summary":"DNS service that routes game downloads through a local LanCache server.",
    "website_url":"https://lancache.net/","source_code_url":"https://github.com/lancachenet/lancache-dns","source_code_host":"github",
    "docs_url":"https://lancache.net/docs/containers/dns/","install_docs_url":"https://lancache.net/docs/",
    "license":"MIT","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source",
    "publisher_name":"LanCache.net","publisher_type":"community","publisher_url":"https://lancache.net/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":false,
    "pricing_model":"free","deployment_methods":["docker","compose"],"surfaces":["api"],"storage_profile":"low",
    "docker_url":"https://hub.docker.com/r/lancachenet/lancache-dns","docker_image":"lancachenet/lancache-dns:latest","compose_url":"https://github.com/lancachenet/docker-compose",
    "categories":["networking-dns"],
    "data_source_urls":["https://lancache.net/","https://lancache.net/docs/","https://lancache.net/docs/containers/dns/","https://github.com/lancachenet/lancache-dns","https://github.com/lancachenet/docker-compose","https://hub.docker.com/r/lancachenet/lancache-dns"],
    "install_options":[
      {"method":"docker","label":"Official DNS container","url":"https://hub.docker.com/r/lancachenet/lancache-dns","image":"lancachenet/lancache-dns:latest","support_level":"official","source_url":"https://lancache.net/docs/containers/dns/","note":"Requires a separate LanCache server.","sort_order":10},
      {"method":"compose","label":"LanCache Compose stack","url":"https://github.com/lancachenet/docker-compose","image":null,"support_level":"official","source_url":"https://lancache.net/docs/","note":"Starts DNS and cache services.","sort_order":20}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"LanCache publishes the DNS container source.","source_urls":["https://github.com/lancachenet/lancache-dns"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The source repository publishes the MIT license.","source_urls":["https://github.com/lancachenet/lancache-dns"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is published by the LanCache.net team.","source_urls":["https://lancache.net/","https://github.com/lancachenet"]},"maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project repository is active.","source_urls":["https://github.com/lancachenet/lancache-dns"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"LanCache documents and publishes the DNS image.","source_urls":["https://lancache.net/docs/containers/dns/","https://hub.docker.com/r/lancachenet/lancache-dns"]},"compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose stack runs the DNS and cache services.","source_urls":["https://lancache.net/docs/","https://github.com/lancachenet/docker-compose"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The DNS service does not need a database.","source_urls":["https://lancache.net/docs/containers/dns/"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project does not set a DNS container RAM requirement; the directory shows an estimate.","source_urls":["https://lancache.net/docs/containers/dns/"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The DNS service stores configuration only; the directory shows an estimate.","source_urls":["https://lancache.net/docs/containers/dns/"]}},
    "ram_min":64,"ram_max":512,"ram_confidence":"low","ram_basis":"The DNS service is small; query rate and custom records affect memory use.","ram_source_urls":["https://lancache.net/docs/containers/dns/"],
    "storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"The DNS container stores little data; custom records and logs drive disk use.","storage_source_urls":["https://lancache.net/docs/containers/dns/"]
  },
  {
    "slug":"matrix","name":"Synapse (Matrix Homeserver)","summary":"Federated homeserver for Matrix messaging.",
    "website_url":"https://element-hq.github.io/synapse/latest/","source_code_url":"https://github.com/element-hq/synapse","source_code_host":"github",
    "docs_url":"https://element-hq.github.io/synapse/latest/","install_docs_url":"https://element-hq.github.io/synapse/latest/setup/installation.html",
    "license":"AGPL-3.0-or-later OR Element Commercial License","license_spdx_id":"AGPL-3.0-or-later","license_type":"mixed","source_model":"open_source",
    "publisher_name":"Element Creations Ltd.","publisher_type":"company","publisher_url":"https://element.io/",
    "maintenance_status":"active","docker_support":"official","compose_support":true,"requires_database":false,"database_types":["sqlite","postgresql"],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker","compose"],"surfaces":["api"],"storage_profile":"high",
    "docker_url":"https://hub.docker.com/r/matrixdotorg/synapse","docker_image":"matrixdotorg/synapse:latest","compose_url":"https://github.com/element-hq/synapse/tree/develop/contrib/docker",
    "categories":["communication"],
    "data_source_urls":["https://github.com/element-hq/synapse","https://github.com/element-hq/synapse/blob/develop/LICENSE-AGPL-3.0","https://github.com/element-hq/synapse/blob/develop/docs/setup/installation.md","https://github.com/element-hq/synapse/tree/develop/contrib/docker","https://element-hq.github.io/synapse/latest/","https://hub.docker.com/r/matrixdotorg/synapse","https://github.com/matrix-org/matrix.org/blob/main/content/ecosystem/servers/servers.toml"],
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://hub.docker.com/r/matrixdotorg/synapse","image":"matrixdotorg/synapse:latest","support_level":"official","source_url":"https://element-hq.github.io/synapse/latest/setup/installation.html","note":null,"sort_order":10},
      {"method":"compose","label":"Docker Compose","url":"https://github.com/element-hq/synapse/tree/develop/contrib/docker","image":null,"support_level":"official","source_url":"https://element-hq.github.io/synapse/latest/setup/installation.html","note":null,"sort_order":20}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Element publishes Synapse source code.","source_urls":["https://github.com/element-hq/synapse"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Synapse is available under AGPL version 3 or Element commercial terms.","source_urls":["https://github.com/element-hq/synapse","https://github.com/matrix-org/matrix.org/blob/main/content/ecosystem/servers/servers.toml"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Element develops and maintains Synapse.","source_urls":["https://github.com/element-hq/synapse"]},"maintenance":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Element publishes current Synapse releases and documentation.","source_urls":["https://github.com/element-hq/synapse"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The installation guide links the official Docker image.","source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html","https://hub.docker.com/r/matrixdotorg/synapse"]},"compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The installation guide links the official Compose example.","source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html","https://github.com/element-hq/synapse/tree/develop/contrib/docker"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Synapse supports SQLite and recommends PostgreSQL for production deployments.","source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Element does not set a RAM requirement; the directory shows an estimate.","source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Element does not set a storage requirement; the directory shows an estimate.","source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html"]}},
    "ram_min":1024,"ram_max":8192,"ram_confidence":"low","ram_basis":"Active users, federation, and background work affect memory use.","ram_source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html"],
    "storage_min":10,"storage_max":500,"storage_confidence":"low","storage_basis":"Uploaded media and message history drive storage use.","storage_source_urls":["https://element-hq.github.io/synapse/latest/setup/installation.html"]
  }
]
$batch$::jsonb) as reviewed(
  slug text,name text,summary text,website_url text,source_code_url text,source_code_host text,docs_url text,install_docs_url text,
  license text,license_spdx_id text,license_type text,source_model text,publisher_name text,publisher_type text,publisher_url text,
  maintenance_status text,docker_support text,compose_support boolean,requires_database boolean,database_types text[],persistent_storage boolean,
  pricing_model text,deployment_methods text[],surfaces text[],storage_profile text,categories text[],docker_url text,docker_image text,compose_url text,
  data_source_urls text[],install_options jsonb,technical_status jsonb,
  ram_min numeric,ram_max numeric,ram_confidence text,ram_basis text,ram_source_urls text[],
  storage_min numeric,storage_max numeric,storage_confidence text,storage_basis text,storage_source_urls text[]
);

do $guard$
declare
  v_item record;
  v_app_id uuid;
  v_name text;
  v_source text;
  v_model text;
  v_license text;
  v_publisher_type text;
  v_categories text[];
  v_docker_urls text[];
  v_unraid_urls text[];
  v_ram_min numeric;
  v_ram_max numeric;
  v_storage_min numeric;
  v_storage_max numeric;
begin
  if (select count(*) from self_host_apps_review_batch_05) <> 6 then
    raise exception 'Batch 05 payload must contain six apps';
  end if;

  for v_item in select * from (values
    ('boinc','Boinc',array['ai-ml','password-managers','search']::text[],'https://hub.docker.com/r/boinc/client','https://raw.githubusercontent.com/BB-BenBridges/docker-templates/master/cheesemarathon/boinc.xml',2048::numeric,8192::numeric,5::numeric,100::numeric),
    ('zabbix-agent','zabbix-agent',array['ai-ml','monitoring-status','photos-galleries']::text[],'https://hub.docker.com/r/zabbix/zabbix-agent','https://raw.githubusercontent.com/vrx-666/unraid-xml/master/my-zabbix-agent.xml',2048::numeric,8192::numeric,5::numeric,100::numeric),
    ('dvwa-web','DVWA-Web',array['ai-ml','databases','documents-pdfs']::text[],'https://hub.docker.com/r/vulnerables/web-dvwa/','https://raw.githubusercontent.com/natcoso9955/unRAID-docker/master/dvwa_unraid.xml',2048::numeric,8192::numeric,5::numeric,100::numeric),
    ('firefoxsyncserver','FirefoxSyncserver',array['photos-galleries','system-admin-hosting']::text[],'https://hub.docker.com/r/mozilla/syncserver','https://raw.githubusercontent.com/jflo/ffsync-unraid/main/ffsync-template.xml',256::numeric,2048::numeric,50::numeric,500::numeric),
    ('lancache-dns','Lancache-DNS',array['ai-ml','networking-dns','system-admin-hosting']::text[],'https://hub.docker.com/r/lancachenet/lancache-dns','https://raw.githubusercontent.com/redvex2460/docker-templates/master/redvex2460/lancache-dns.xml',2048::numeric,8192::numeric,1::numeric,20::numeric),
    ('matrix','matrix',array['communication','networking-dns','photos-galleries']::text[],'https://hub.docker.com/r/avhost/docker-matrix/','https://raw.githubusercontent.com/A75G/docker-templates/master/templates/matrix.xml',256::numeric,2048::numeric,50::numeric,500::numeric)
  ) expected(slug,old_name,old_categories,old_docker_url,old_unraid_url,old_ram_min,old_ram_max,old_storage_min,old_storage_max)
  loop
    select app.id,app.name,app.source_code_url,app.source_model::text,app.license,app.publisher_type,
           coalesce(array_agg(category.slug order by category.slug) filter (where category.slug is not null),'{}'::text[])
      into v_app_id,v_name,v_source,v_model,v_license,v_publisher_type,v_categories
    from public.self_host_apps app
    left join public.self_host_app_category_links link on link.app_id=app.id
    left join public.self_host_app_categories category on category.id=link.category_id
    where app.slug=v_item.slug and app.published is true and app.self_hosting_status='self_hostable'
    group by app.id;
    if not found or v_name is distinct from v_item.old_name or v_source is not null or v_model is distinct from 'closed_source'
       or v_license is not null or v_publisher_type is distinct from 'unknown' or v_categories is distinct from v_item.old_categories then
      raise exception 'Batch 05 app baseline changed for %',v_item.slug;
    end if;

    select install.docker_urls,install.unraid_urls into v_docker_urls,v_unraid_urls
    from public.self_host_app_install_options install where install.app_id=v_app_id;
    if not found or v_docker_urls is distinct from array[v_item.old_docker_url]::text[]
       or v_unraid_urls is distinct from array[v_item.old_unraid_url]::text[] then
      raise exception 'Batch 05 install baseline changed for %',v_item.slug;
    end if;

    select estimate.ram_estimate_min_mb,estimate.ram_estimate_max_mb,estimate.storage_estimate_min_gb,estimate.storage_estimate_max_gb
      into v_ram_min,v_ram_max,v_storage_min,v_storage_max
    from public.self_host_app_resource_estimates estimate where estimate.app_id=v_app_id;
    if not found or v_ram_min is distinct from v_item.old_ram_min or v_ram_max is distinct from v_item.old_ram_max
       or v_storage_min is distinct from v_item.old_storage_min or v_storage_max is distinct from v_item.old_storage_max then
      raise exception 'Batch 05 estimate baseline changed for %',v_item.slug;
    end if;
  end loop;
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
  summary_source='curated',summary_confidence='high',data_confidence='high',
  data_source_urls=reviewed.data_source_urls,
  technical_fact_status=coalesce(app.technical_fact_status,'{}'::jsonb)||reviewed.technical_status,
  updated_at=now()
from self_host_apps_review_batch_05 reviewed
where app.slug=reviewed.slug;

do $categories$
declare
  v_item record;
  v_app uuid;
  v_count integer;
begin
  for v_item in select slug,categories from self_host_apps_review_batch_05 loop
    select id into v_app from public.self_host_apps where slug=v_item.slug for update;
    delete from public.self_host_app_category_links where app_id=v_app;
    insert into public.self_host_app_category_links(app_id,category_id)
    select v_app,category.id from public.self_host_app_categories category
    where category.slug=any(v_item.categories);
    get diagnostics v_count=row_count;
    if v_count<>cardinality(v_item.categories) then
      raise exception 'Batch 05 category assignment failed for %',v_item.slug;
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
from self_host_apps_review_batch_05 reviewed
join public.self_host_apps app on app.slug=reviewed.slug
where estimate.app_id=app.id;

-- Remove unverified legacy appliance catalog links and rebuild every install destination from the reviewed options.
update public.self_host_app_install_options install set
  options=reviewed.install_options,
  docker_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='docker' order by option->>'url'),
  docker_images=array(select distinct option->>'image' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='docker' and nullif(option->>'image','') is not null order by option->>'image'),
  compose_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='compose' order by option->>'url'),
  truenas_scale_urls='{}',unraid_urls='{}',umbrel_urls='{}',yunohost_urls='{}',casaos_urls='{}',runtipi_urls='{}',cosmos_urls='{}',
  openmediavault_urls='{}',synology_urls='{}',qnap_urls='{}',proxmox_urls='{}',home_assistant_os_urls='{}',kubernetes_urls='{}',helm_urls='{}',
  native_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='native' order by option->>'url'),
  binary_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='binary' order by option->>'url'),
  package_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='package' order by option->>'url'),
  other_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='other' order by option->>'url'),
  catalog_sources='[]'::jsonb,source_urls=reviewed.data_source_urls,checked_at=now(),updated_at=now()
from self_host_apps_review_batch_05 reviewed
join public.self_host_apps app on app.slug=reviewed.slug
where install.app_id=app.id;

commit;
