-- Apply the reviewed K batch with source-backed app facts and app-specific estimates.
begin;

create temporary table reviewed_self_host_k on commit drop as
select jsonb_array_elements($review$
[
  {
    "slug":"k2d",
    "current":{"name":"k2d","source_code_url":null,"docker_image":"portainer/k2d:1.0.0-beta"},
    "name":"K2D",
    "summary":"Translates a limited Kubernetes API into Docker commands for managing industrial edge devices.",
    "summary_source":"https://github.com/portainer/k2d#readme",
    "website_url":"https://k2d.io/",
    "source_code_url":"https://github.com/portainer/k2d",
    "source_code_host":"github",
    "source_full_name":"portainer/k2d",
    "source_model":"source_available",
    "source_archived":true,
    "license":"Portainer.io Source Available License",
    "license_type":"custom",
    "license_spdx_id":null,
    "publisher_name":"Portainer",
    "publisher_type":"company",
    "publisher_url":"https://www.portainer.io/",
    "docs_url":"https://docs.k2d.io/",
    "install_docs_url":"https://docs.k2d.io/quick-start-guide",
    "docker_support":"official",
    "docker_url":"https://hub.docker.com/r/portainer/k2d",
    "docker_image":"portainer/k2d:1.0.0-beta",
    "compose_support":false,
    "compose_url":null,
    "requires_database":false,
    "database_types":[],
    "storage_profile":"low",
    "persistent_storage":false,
    "deployment_methods":["docker","podman"],
    "maintenance_status":"archived",
    "release_version":"1.0.0-beta",
    "release_url":"https://hub.docker.com/r/portainer/k2d/tags",
    "categories":["developer-tools","system-admin-hosting"],
    "sources":["https://k2d.io/","https://docs.k2d.io/","https://github.com/portainer/k2d","https://github.com/portainer/k2d/blob/develop/README.md","https://github.com/portainer/k2d/blob/develop/LICENSE","https://hub.docker.com/r/portainer/k2d","https://raw.githubusercontent.com/ckocyigit/unraid-ca-templates/main/templates/k2d.xml"],
    "github_owner":"portainer","github_repo":"k2d","github_full_name":"portainer/k2d","github_owner_type":"Organization","github_archived":true,
    "ram":{"min":32,"max":128,"confidence":"medium","basis":"The README reports about 20 MB process RAM; this range allows overhead for the small Docker API translator.","sources":["https://github.com/portainer/k2d/blob/develop/README.md","https://k2d.io/"]},
    "storage":{"min":0.1,"max":1,"confidence":"low","basis":"K2D translates commands in real time and reports negligible disk I/O; the estimate covers the image, configuration, and logs.","sources":["https://github.com/portainer/k2d/blob/develop/README.md","https://docs.k2d.io/"]},
    "install_options":[
      {"method":"docker","label":"Portainer Docker image","url":"https://hub.docker.com/r/portainer/k2d","image":"portainer/k2d:1.0.0-beta","support_level":"official","source_url":"https://github.com/portainer/k2d","sort_order":10},
      {"method":"unraid","label":"Unraid Community Applications","url":"https://raw.githubusercontent.com/ckocyigit/unraid-ca-templates/main/templates/k2d.xml","support_level":"community","source_url":"https://raw.githubusercontent.com/ckocyigit/unraid-ca-templates/main/templates/k2d.xml","sort_order":35}
    ]
  },
  {
    "slug":"kafka",
    "current":{"name":"Kafka","source_code_url":null,"docker_image":"medvista/kafka"},
    "name":"Apache Kafka",
    "summary":"Distributed event-streaming platform for publishing, storing, and consuming event streams.",
    "summary_source":"https://kafka.apache.org/",
    "website_url":"https://kafka.apache.org/",
    "source_code_url":"https://github.com/apache/kafka",
    "source_code_host":"github",
    "source_full_name":"apache/kafka",
    "source_model":"open_source",
    "source_archived":false,
    "license":"Apache License 2.0",
    "license_type":"permissive",
    "license_spdx_id":"Apache-2.0",
    "publisher_name":"Apache Software Foundation",
    "publisher_type":"foundation",
    "publisher_url":"https://www.apache.org/",
    "docs_url":"https://kafka.apache.org/documentation/",
    "install_docs_url":"https://kafka.apache.org/quickstart/",
    "docker_support":"official",
    "docker_url":"https://hub.docker.com/r/apache/kafka",
    "docker_image":"apache/kafka:4.3.1",
    "compose_support":true,
    "compose_url":"https://github.com/apache/kafka/tree/trunk/docker/examples/docker-compose-files",
    "requires_database":false,
    "database_types":[],
    "storage_profile":"depends",
    "persistent_storage":true,
    "deployment_methods":["docker","compose","binary"],
    "maintenance_status":"active",
    "release_version":"4.3.1",
    "release_url":"https://kafka.apache.org/community/downloads/",
    "categories":["developer-tools","system-admin-hosting"],
    "sources":["https://kafka.apache.org/","https://kafka.apache.org/community/downloads/","https://kafka.apache.org/quickstart/","https://kafka.apache.org/43/operations/","https://kafka.apache.org/43/configuration/broker-configs/","https://github.com/apache/kafka/blob/trunk/LICENSE","https://github.com/apache/kafka/tree/trunk/docker/examples/docker-compose-files","https://hub.docker.com/r/apache/kafka"],
    "github_owner":"apache","github_repo":"kafka","github_full_name":"apache/kafka","github_owner_type":"Organization","github_archived":false,
    "ram":{"min":2048,"max":4096,"confidence":"low","basis":"Estimate for one small KRaft broker with a modest workload, allowing for the JVM and operating-system page cache.","sources":["https://kafka.apache.org/quickstart/","https://github.com/apache/kafka/tree/trunk/docker/examples"]},
    "storage":{"min":20,"max":100,"confidence":"low","basis":"Kafka retains topic log segments locally; this small-broker range allows moderate event volume and retention.","sources":["https://kafka.apache.org/43/operations/","https://kafka.apache.org/43/configuration/broker-configs/"]},
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://hub.docker.com/r/apache/kafka","image":"apache/kafka:4.3.1","support_level":"official","source_url":"https://kafka.apache.org/quickstart/","sort_order":10},
      {"method":"compose","label":"Docker Compose examples","url":"https://github.com/apache/kafka/tree/trunk/docker/examples/docker-compose-files","support_level":"official","source_url":"https://github.com/apache/kafka/tree/trunk/docker/examples/docker-compose-files","sort_order":20},
      {"method":"binary","label":"Kafka binary downloads","url":"https://kafka.apache.org/community/downloads/","support_level":"official","source_url":"https://kafka.apache.org/community/downloads/","sort_order":30}
    ]
  },
  {
    "slug":"kaizoku",
    "current":{"name":"Kaizoku","source_code_url":null,"docker_image":"ghcr.io/oae/kaizoku:latest"},
    "name":"Kaizoku",
    "summary":"Downloads and organizes manga from supported sources for a self-hosted reading library.",
    "summary_source":"https://github.com/oae/kaizoku#readme",
    "website_url":null,
    "source_code_url":"https://github.com/oae/kaizoku",
    "source_code_host":"github",
    "source_full_name":"oae/kaizoku",
    "source_model":"open_source",
    "source_archived":true,
    "license":"MIT License",
    "license_type":"permissive",
    "license_spdx_id":"MIT",
    "publisher_name":"Alperen Elhan",
    "publisher_type":"individual",
    "publisher_url":"https://github.com/oae",
    "docs_url":"https://github.com/oae/kaizoku#readme",
    "install_docs_url":"https://github.com/oae/kaizoku#deployment",
    "docker_support":"official",
    "docker_url":"https://github.com/oae/kaizoku/pkgs/container/kaizoku",
    "docker_image":"ghcr.io/oae/kaizoku:latest",
    "compose_support":true,
    "compose_url":"https://github.com/oae/kaizoku/blob/main/README.md#deployment",
    "requires_database":true,
    "database_types":["postgres"],
    "storage_profile":"depends",
    "persistent_storage":true,
    "deployment_methods":["docker","compose"],
    "maintenance_status":"archived",
    "release_version":"v1.6.1",
    "release_url":"https://github.com/oae/kaizoku/releases/tag/kaizoku-v1.6.1",
    "categories":["ebooks-libraries","automation"],
    "sources":["https://github.com/oae/kaizoku","https://github.com/oae/kaizoku/blob/main/README.md","https://github.com/oae/kaizoku/blob/main/LICENSE","https://github.com/oae/kaizoku/releases/tag/kaizoku-v1.6.1","https://github.com/oae/kaizoku/pkgs/container/kaizoku","https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/kaizoku.xml","https://github.com/oae"],
    "github_owner":"oae","github_repo":"kaizoku","github_full_name":"oae/kaizoku","github_owner_type":"User","github_archived":true,
    "ram":{"min":2048,"max":4096,"confidence":"low","basis":"Estimate for the app, PostgreSQL, and Redis services in the upstream Compose stack with a small library and a few active downloads.","sources":["https://github.com/oae/kaizoku/blob/main/README.md","https://github.com/oae/kaizoku#deployment"]},
    "storage":{"min":20,"max":200,"confidence":"low","basis":"The Compose stack persists manga under /data and keeps separate database, configuration, and log data; library size drives most storage use.","sources":["https://github.com/oae/kaizoku/blob/main/README.md","https://github.com/oae/kaizoku#deployment"]},
    "install_options":[
      {"method":"docker","label":"Kaizoku GHCR image","url":"https://github.com/oae/kaizoku/pkgs/container/kaizoku","image":"ghcr.io/oae/kaizoku:latest","support_level":"official","source_url":"https://github.com/oae/kaizoku/blob/main/README.md","sort_order":10},
      {"method":"compose","label":"Docker Compose","url":"https://github.com/oae/kaizoku/blob/main/README.md#deployment","support_level":"official","source_url":"https://github.com/oae/kaizoku/blob/main/README.md","sort_order":20},
      {"method":"unraid","label":"Unraid community template","url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/kaizoku.xml","support_level":"community","source_url":"https://raw.githubusercontent.com/nwithan8/unraid_templates/main/templates/kaizoku.xml","sort_order":35}
    ]
  },
  {
    "slug":"kali-linux",
    "current":{"name":"kali-linux","source_code_url":"https://github.com/linuxserver/docker-kali-linux","docker_image":"lscr.io/linuxserver/kali-linux"},
    "name":"Kali Linux",
    "summary":"Linux distribution with tools for penetration testing and digital forensics.",
    "summary_source":"https://www.kali.org/docs/introduction/what-is-kali-linux/",
    "website_url":"https://www.kali.org/",
    "source_code_url":"https://gitlab.com/kalilinux/build-scripts/kali-docker",
    "source_code_host":"gitlab",
    "source_full_name":"kalilinux/build-scripts/kali-docker",
    "source_model":"open_source",
    "source_archived":false,
    "license":"Mixed package licenses; the distribution's non-free section can include proprietary tools.",
    "license_type":"mixed",
    "license_spdx_id":null,
    "publisher_name":"Kali Linux team",
    "publisher_type":"community",
    "publisher_url":"https://www.kali.org/",
    "docs_url":"https://www.kali.org/docs/containers/",
    "install_docs_url":"https://www.kali.org/docs/containers/using-kali-docker-images/",
    "docker_support":"official",
    "docker_url":"https://hub.docker.com/r/kalilinux/kali-rolling",
    "docker_image":"kalilinux/kali-rolling:latest",
    "compose_support":false,
    "compose_url":null,
    "requires_database":false,
    "database_types":[],
    "storage_profile":"depends",
    "persistent_storage":false,
    "deployment_methods":["docker","podman","lxc","lxd"],
    "maintenance_status":"active",
    "release_version":"2026.2",
    "release_url":"https://www.kali.org/get-kali/",
    "categories":["security-privacy","system-admin-hosting"],
    "sources":["https://www.kali.org/","https://www.kali.org/docs/introduction/what-is-kali-linux/","https://www.kali.org/docs/containers/","https://www.kali.org/docs/containers/using-kali-docker-images/","https://www.kali.org/docs/containers/kalilinux-lxc-images/","https://www.kali.org/docs/general-use/metapackages/","https://www.kali.org/docs/policy/kali-linux-derivative-policy/","https://www.kali.org/get-kali/","https://gitlab.com/kalilinux/build-scripts/kali-docker","https://hub.docker.com/r/kalilinux/kali-rolling"],
    "clear_github":true,
    "ram":{"min":2048,"max":4096,"confidence":"low","basis":"Estimate for a small command-line security toolkit after installing Kali's headless tool set; installed tools and concurrent scans affect memory.","sources":["https://www.kali.org/docs/containers/using-kali-docker-images/","https://www.kali.org/docs/general-use/metapackages/"]},
    "storage":{"min":10,"max":30,"confidence":"low","basis":"The rolling base image is small, while a practical headless tool set and its updates use additional package storage.","sources":["https://www.kali.org/docs/containers/using-kali-docker-images/","https://www.kali.org/docs/general-use/metapackages/"]},
    "install_options":[
      {"method":"docker","label":"Official Kali rolling image","url":"https://hub.docker.com/r/kalilinux/kali-rolling","image":"kalilinux/kali-rolling:latest","support_level":"official","source_url":"https://www.kali.org/docs/containers/using-kali-docker-images/","sort_order":10},
      {"method":"other","label":"Kali LXC/LXD images","url":"https://www.kali.org/docs/containers/kalilinux-lxc-images/","support_level":"official","source_url":"https://www.kali.org/docs/containers/kalilinux-lxc-images/","sort_order":30}
    ]
  },
  {
    "slug":"kallithea",
    "current":{"name":"Kallithea","source_code_url":"https://kallithea-scm.org/repos/kallithea","docker_image":null},
    "name":"Kallithea",
    "summary":"Hosts Git and Mercurial repositories with web browsing and code review.",
    "summary_source":"https://kallithea-scm.org/",
    "website_url":"https://kallithea-scm.org/",
    "source_code_url":"https://kallithea-scm.org/repos/kallithea",
    "source_code_host":"other",
    "source_full_name":"kallithea-scm.org/repos/kallithea",
    "source_model":"open_source",
    "source_archived":null,
    "license":"GNU General Public License v3.0",
    "license_type":"copyleft",
    "license_spdx_id":"GPL-3.0-only",
    "publisher_name":"Kallithea project",
    "publisher_type":"community",
    "publisher_url":"https://kallithea-scm.org/",
    "docs_url":"https://docs.kallithea-scm.org/en/latest/",
    "install_docs_url":"https://docs.kallithea-scm.org/en/latest/installation.html",
    "docker_support":"community",
    "docker_url":"https://hub.docker.com/r/atnurgaliev/kallithea",
    "docker_image":"atnurgaliev/kallithea:latest",
    "compose_support":false,
    "compose_url":null,
    "requires_database":true,
    "database_types":["postgres","sqlite","mariadb","mysql"],
    "storage_profile":"depends",
    "persistent_storage":true,
    "deployment_methods":["native","package","docker"],
    "maintenance_status":"active",
    "release_version":"0.7.0",
    "release_url":"https://pypi.org/project/Kallithea/0.7.0/",
    "categories":["developer-tools","system-admin-hosting"],
    "sources":["https://kallithea-scm.org/","https://kallithea-scm.org/repos/kallithea","https://pypi.org/project/Kallithea/0.7.0/","https://docs.kallithea-scm.org/en/latest/installation.html","https://docs.kallithea-scm.org/en/latest/overview.html","https://docs.kallithea-scm.org/en/latest/setup.html","https://hub.docker.com/r/atnurgaliev/kallithea"],
    "ram":{"min":1024,"max":4096,"confidence":"low","basis":"Estimate for the Python web service, one supported database, and repository indexing/search in a small team installation.","sources":["https://docs.kallithea-scm.org/en/latest/overview.html","https://docs.kallithea-scm.org/en/latest/setup.html"]},
    "storage":{"min":10,"max":100,"confidence":"low","basis":"Kallithea stores Git and Mercurial repositories on a writable filesystem in addition to its database and search data; repository size drives the range.","sources":["https://docs.kallithea-scm.org/en/latest/overview.html","https://docs.kallithea-scm.org/en/latest/setup.html"]},
    "install_options":[
      {"method":"package","label":"Kallithea on PyPI","url":"https://pypi.org/project/Kallithea/0.7.0/","support_level":"official","source_url":"https://docs.kallithea-scm.org/en/latest/installation.html","sort_order":10},
      {"method":"native","label":"Install from source","url":"https://docs.kallithea-scm.org/en/latest/installation.html","support_level":"official","source_url":"https://docs.kallithea-scm.org/en/latest/installation.html","sort_order":20},
      {"method":"docker","label":"Community Docker image","url":"https://hub.docker.com/r/atnurgaliev/kallithea","image":"atnurgaliev/kallithea:latest","support_level":"community","source_url":"https://hub.docker.com/r/atnurgaliev/kallithea","note":"Updated almost 8 years ago.","sort_order":30}
    ]
  },
  {
    "slug":"kamailio",
    "current":{"name":"Kamailio","source_code_url":"https://github.com/kamailio/kamailio","docker_image":null},
    "name":"Kamailio",
    "summary":"SIP server for routing VoIP traffic, handling registrations, and building telecom services.",
    "summary_source":"https://www.kamailio.org/",
    "website_url":"https://www.kamailio.org/",
    "source_code_url":"https://github.com/kamailio/kamailio",
    "source_code_host":"github",
    "source_full_name":"kamailio/kamailio",
    "source_model":"open_source",
    "source_archived":false,
    "license":"GPLv2 main license; some source files are BSD-licensed.",
    "license_type":"mixed",
    "license_spdx_id":null,
    "publisher_name":"Kamailio Project",
    "publisher_type":"community",
    "publisher_url":"https://www.kamailio.org/",
    "docs_url":"https://kamailio.org/docs/modules/stable/",
    "install_docs_url":"https://www.kamailio.org/wikidocs/",
    "docker_support":"official",
    "docker_url":"https://hub.docker.com/r/kamailio/kamailio",
    "docker_image":"kamailio/kamailio:latest",
    "compose_support":false,
    "compose_url":null,
    "requires_database":false,
    "database_types":[],
    "storage_profile":"depends",
    "persistent_storage":true,
    "deployment_methods":["docker","native","package"],
    "maintenance_status":"active",
    "release_version":"6.1.4",
    "release_url":"https://www.kamailio.org/w/2026/08/kamailio-v6-1-4-released/",
    "categories":["communication","networking-dns"],
    "sources":["https://www.kamailio.org/","https://github.com/kamailio/kamailio","https://github.com/kamailio/kamailio/blob/master/COPYING","https://github.com/kamailio/kamailio/blob/master/src/main.c","https://github.com/kamailio/kamailio-docker","https://www.kamailio.org/wikidocs/","https://www.kamailio.org/wiki/packages/debs","https://www.kamailio.org/w/2026/08/kamailio-v6-1-4-released/","https://hub.docker.com/r/kamailio/kamailio"],
    "ram":{"min":256,"max":2048,"confidence":"low","basis":"Estimate for a small SIP proxy with modest registrations and calls; worker count, TLS, and enabled modules affect memory.","sources":["https://github.com/kamailio/kamailio-docker","https://www.kamailio.org/w/2026/08/kamailio-v6-1-4-released/"]},
    "storage":{"min":2,"max":20,"confidence":"low","basis":"Persisted files are mainly configuration, certificates, logs, and optional registrar database state; Kamailio does not store call media.","sources":["https://github.com/kamailio/kamailio-docker","https://kamailio.org/wiki/tutorials/getting-started/main"]},
    "install_options":[
      {"method":"docker","label":"Official Kamailio Docker image","url":"https://hub.docker.com/r/kamailio/kamailio","image":"kamailio/kamailio:latest","support_level":"official","source_url":"https://github.com/kamailio/kamailio-docker","sort_order":10},
      {"method":"package","label":"Debian and Ubuntu packages","url":"https://www.kamailio.org/wiki/packages/debs","support_level":"official","source_url":"https://www.kamailio.org/wiki/packages/debs","sort_order":30},
      {"method":"native","label":"Install from source","url":"https://www.kamailio.org/w/download/","support_level":"official","source_url":"https://www.kamailio.org/w/download/","sort_order":40}
    ]
  },
  {
    "slug":"kan",
    "current":{"name":"Kan","source_code_url":"https://github.com/kanbn/kan","docker_image":"ghcr.io/kanbn/kan-migrate:0.6.0@sha256:3296fd28e037a93dda478981494a72c6905ecd4f0d0739e79139172844acbc4b"},
    "name":"Kan",
    "summary":"Kanban project-management app for organizing boards, tasks, and team workflows.",
    "summary_source":"https://docs.kan.bn/",
    "website_url":"https://kan.bn/",
    "source_code_url":"https://github.com/kanbn/kan",
    "source_code_host":"github",
    "source_full_name":"kanbn/kan",
    "source_model":"open_source",
    "source_archived":false,
    "license":"GNU Affero General Public License v3.0-only",
    "license_type":"copyleft",
    "license_spdx_id":"AGPL-3.0-only",
    "publisher_name":"kanbn",
    "publisher_type":"community",
    "publisher_url":"https://github.com/kanbn",
    "docs_url":"https://docs.kan.bn/",
    "install_docs_url":"https://github.com/kanbn/kan#self-hosting",
    "docker_support":"official",
    "docker_url":"https://github.com/kanbn/kan/pkgs/container/kan",
    "docker_image":"ghcr.io/kanbn/kan:latest",
    "compose_support":true,
    "compose_url":"https://github.com/kanbn/kan/blob/main/docker-compose.yml",
    "requires_database":true,
    "database_types":["postgres"],
    "storage_profile":"depends",
    "persistent_storage":true,
    "deployment_methods":["docker","compose"],
    "maintenance_status":"active",
    "release_version":"0.6.0",
    "release_url":"https://github.com/kanbn/kan/releases/tag/v0.6.0",
    "categories":["project-task-management"],
    "sources":["https://kan.bn/","https://docs.kan.bn/","https://github.com/kanbn/kan","https://github.com/kanbn/kan/blob/main/README.md","https://github.com/kanbn/kan/blob/main/LICENSE","https://github.com/kanbn/kan/blob/main/docker-compose.yml","https://github.com/kanbn/kan/releases/tag/v0.6.0","https://github.com/kanbn/kan/pkgs/container/kan","https://github.com/kanbn/kan/pkgs/container/kan-migrate","https://github.com/getumbrel/umbrel-apps/tree/master/kan"],
    "ram":{"min":1024,"max":4096,"confidence":"low","basis":"Estimate for the Next.js service and PostgreSQL in the official Compose stack for a small team; Redis is optional.","sources":["https://github.com/kanbn/kan#self-hosting","https://github.com/kanbn/kan/blob/main/docker-compose.yml"]},
    "storage":{"min":5,"max":30,"confidence":"low","basis":"The Compose stack keeps Kan's PostgreSQL data in a named volume; optional uploads can be stored separately in S3-compatible storage.","sources":["https://github.com/kanbn/kan/blob/main/docker-compose.yml","https://github.com/kanbn/kan#environment-variables"]},
    "install_options":[
      {"method":"docker","label":"Kan web image","url":"https://github.com/kanbn/kan/pkgs/container/kan","image":"ghcr.io/kanbn/kan:latest","support_level":"official","source_url":"https://github.com/kanbn/kan/blob/main/docker-compose.yml","sort_order":10},
      {"method":"compose","label":"Docker Compose","url":"https://github.com/kanbn/kan/blob/main/docker-compose.yml","image":"ghcr.io/kanbn/kan:latest","support_level":"official","source_url":"https://github.com/kanbn/kan/blob/main/docker-compose.yml","sort_order":20},
      {"method":"umbrel","label":"Umbrel app catalog","url":"https://github.com/getumbrel/umbrel-apps/tree/master/kan","support_level":"community","source_url":"https://github.com/getumbrel/umbrel-apps/tree/master/kan","sort_order":40}
    ]
  },
  {
    "slug":"kanba",
    "current":{"name":"Kanba","source_code_url":"https://github.com/Kanba-co/kanba","docker_image":null},
    "name":"Kanba",
    "summary":"Kanban project board for organizing tasks and collaborating with a team.",
    "summary_source":"https://github.com/Kanba-co/kanba#readme",
    "website_url":"https://kanba.co/",
    "source_code_url":"https://github.com/Kanba-co/kanba",
    "source_code_host":"github",
    "source_full_name":"Kanba-co/kanba",
    "source_model":"open_source",
    "source_archived":false,
    "license":"MIT License",
    "license_type":"permissive",
    "license_spdx_id":"MIT",
    "publisher_name":"Kanba-co",
    "publisher_type":"community",
    "publisher_url":"https://github.com/Kanba-co",
    "docs_url":"https://github.com/Kanba-co/kanba#readme",
    "install_docs_url":"https://github.com/Kanba-co/kanba#readme",
    "docker_support":"official",
    "docker_url":null,
    "docker_image":null,
    "compose_support":true,
    "compose_url":"https://github.com/Kanba-co/kanba/blob/main/docker-compose.yml",
    "requires_database":true,
    "database_types":["postgres"],
    "storage_profile":"depends",
    "persistent_storage":true,
    "deployment_methods":["docker","compose"],
    "maintenance_status":"active",
    "release_version":"1.0.8",
    "release_url":"https://github.com/Kanba-co/kanba/releases/tag/1.0.8",
    "categories":["project-task-management"],
    "sources":["https://kanba.co/","https://github.com/Kanba-co/kanba","https://github.com/Kanba-co/kanba/blob/main/README.md","https://github.com/Kanba-co/kanba/blob/main/LICENSE","https://github.com/Kanba-co/kanba/blob/main/docker-compose.yml","https://github.com/Kanba-co/kanba/blob/main/.env.example","https://github.com/Kanba-co/kanba/releases/tag/1.0.8","https://supabase.com/docs/guides/self-hosting/docker"],
    "ram":{"min":2048,"max":8192,"confidence":"low","basis":"Estimate for the Next.js app with a small PostgreSQL backend; the upper range allows for the full self-hosted Supabase stack.","sources":["https://github.com/Kanba-co/kanba/blob/main/README.md","https://github.com/Kanba-co/kanba/blob/main/docker-compose.yml","https://supabase.com/docs/guides/self-hosting/docker"]},
    "storage":{"min":10,"max":50,"confidence":"low","basis":"Estimate for Kanba records and a small self-hosted database; attachments and Supabase Storage files can increase use.","sources":["https://github.com/Kanba-co/kanba/blob/main/README.md","https://github.com/Kanba-co/kanba/blob/main/.env.example","https://supabase.com/docs/guides/self-hosting/docker"]},
    "install_options":[
      {"method":"compose","label":"Docker Compose web service","url":"https://github.com/Kanba-co/kanba/blob/main/docker-compose.yml","support_level":"official","source_url":"https://github.com/Kanba-co/kanba/blob/main/docker-compose.yml","note":"Requires PostgreSQL or Supabase configured separately.","sort_order":20}
    ]
  }
]
$review$::jsonb) as item;

do $guard$
begin
  if (select count(*) from reviewed_self_host_k) <> 8 then
    raise exception 'K review batch must contain eight apps';
  end if;
  if (select count(*)
      from reviewed_self_host_k r
      join public.self_host_apps a on a.slug=r.item->>'slug'
      where a.published=true
        and a.self_hosting_status='self_hostable'
        and a.name is not distinct from r.item#>>'{current,name}'
        and a.source_code_url is not distinct from r.item#>>'{current,source_code_url}'
        and a.docker_image is not distinct from r.item#>>'{current,docker_image}') <> 8 then
    raise exception 'K app snapshot changed since source review';
  end if;
end $guard$;

update public.self_host_apps a set
  name=r.item->>'name',
  summary=r.item->>'summary',
  summary_source=r.item->>'summary_source',
  summary_confidence='high',
  website_url=r.item->>'website_url',
  source_code_url=r.item->>'source_code_url',
  source_code_host=r.item->>'source_code_host',
  source_full_name=r.item->>'source_full_name',
  source_model=(r.item->>'source_model')::public.self_host_app_source_model,
  source_archived=nullif(r.item->>'source_archived','')::boolean,
  source_checked_at=now(),
  license=r.item->>'license',
  license_type=(r.item->>'license_type')::public.self_host_app_license_type,
  license_spdx_id=r.item->>'license_spdx_id',
  publisher_name=r.item->>'publisher_name',
  publisher_type=r.item->>'publisher_type',
  publisher_url=r.item->>'publisher_url',
  docs_url=r.item->>'docs_url',
  install_docs_url=r.item->>'install_docs_url',
  docker_support=r.item->>'docker_support',
  docker_url=r.item->>'docker_url',
  docker_image=r.item->>'docker_image',
  compose_support=nullif(r.item->>'compose_support','')::boolean,
  compose_url=r.item->>'compose_url',
  requires_database=nullif(r.item->>'requires_database','')::boolean,
  database_types=array(select jsonb_array_elements_text(r.item->'database_types')),
  storage_profile=r.item->>'storage_profile',
  persistent_storage=nullif(r.item->>'persistent_storage','')::boolean,
  deployment_methods=array(select jsonb_array_elements_text(r.item->'deployment_methods')),
  maintenance_status=r.item->>'maintenance_status',
  release_version=r.item->>'release_version',
  release_url=r.item->>'release_url',
  release_checked_at=now(),
  data_source_urls=array(select jsonb_array_elements_text(r.item->'sources')),
  data_checked_at=now(),
  data_confidence='high',
  technical_facts_checked_at=now(),
  github_owner=case when coalesce((r.item->>'clear_github')::boolean,false) then null else coalesce(r.item->>'github_owner',a.github_owner) end,
  github_repo=case when coalesce((r.item->>'clear_github')::boolean,false) then null else coalesce(r.item->>'github_repo',a.github_repo) end,
  github_full_name=case when coalesce((r.item->>'clear_github')::boolean,false) then null else coalesce(r.item->>'github_full_name',a.github_full_name) end,
  github_owner_type=case when coalesce((r.item->>'clear_github')::boolean,false) then null else coalesce(r.item->>'github_owner_type',a.github_owner_type) end,
  github_archived=case when coalesce((r.item->>'clear_github')::boolean,false) then null else coalesce((r.item->>'github_archived')::boolean,a.github_archived) end,
  github_project_id=case when coalesce((r.item->>'clear_github')::boolean,false) then null else a.github_project_id end,
  technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
    'source',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Project identity and source were checked against the linked project sources.','source_urls',r.item->'sources'),
    'website',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note',case when r.item->>'slug'='kaizoku' then 'The old domain now identifies another product; the verified project is linked through its repository.' else 'Project website was checked against the official project sources.' end,'source_urls',r.item->'sources'),
    'license',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','License was checked against the project license or official documentation.','source_urls',r.item->'sources'),
    'publisher',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Publisher was identified from the official project sources.','source_urls',r.item->'sources'),
    'docker',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Docker install support was checked against reviewed install sources.','source_urls',r.item->'sources'),
    'docker_image',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Container image destination was checked against its registry or project source.','source_urls',r.item->'sources'),
    'compose',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Compose support was checked against the project install sources.','source_urls',r.item->'sources'),
    'database',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Database needs were checked against the project install sources.','source_urls',r.item->'sources'),
    'persistent_storage',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Persistent data use was checked against the project install sources.','source_urls',r.item->'sources'),
    'release',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence','high','note','Current version was checked against the official release or download page.','source_urls',r.item->'sources'),
    'ram',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence',r.item#>>'{ram,confidence}','note','RAM is an app-specific estimate for a small self-hosted setup.','source_urls',r.item#>'{ram,sources}'),
    'storage',jsonb_build_object('status','published','checked_at',to_char(current_date,'YYYY-MM-DD'),'confidence',r.item#>>'{storage,confidence}','note','Storage is an app-specific estimate for a small self-hosted setup.','source_urls',r.item#>'{storage,sources}')
  ),
  updated_at=now()
from reviewed_self_host_k r
where a.slug=r.item->>'slug';

delete from public.self_host_app_category_links l
using public.self_host_apps a, reviewed_self_host_k r
where l.app_id=a.id and a.slug=r.item->>'slug';

insert into public.self_host_app_category_links(app_id,category_id)
select a.id,c.id
from reviewed_self_host_k r
join public.self_host_apps a on a.slug=r.item->>'slug'
cross join lateral jsonb_array_elements_text(r.item->'categories') category_slug(slug)
join public.self_host_app_categories c on c.slug=category_slug.slug;

insert into public.self_host_app_resource_estimates(
  app_id,ram_estimate_min_mb,ram_estimate_max_mb,ram_estimate_kind,ram_estimate_confidence,ram_estimate_basis,ram_source_urls,
  storage_estimate_min_gb,storage_estimate_max_gb,storage_estimate_kind,storage_estimate_confidence,storage_estimate_basis,storage_source_urls,
  checked_at,updated_at
)
select a.id,
  (r.item#>>'{ram,min}')::numeric,(r.item#>>'{ram,max}')::numeric,'estimated',r.item#>>'{ram,confidence}',r.item#>>'{ram,basis}',
  array(select jsonb_array_elements_text(r.item#>'{ram,sources}')),
  (r.item#>>'{storage,min}')::numeric,(r.item#>>'{storage,max}')::numeric,'estimated',r.item#>>'{storage,confidence}',r.item#>>'{storage,basis}',
  array(select jsonb_array_elements_text(r.item#>'{storage,sources}')),
  now(),now()
from reviewed_self_host_k r join public.self_host_apps a on a.slug=r.item->>'slug'
on conflict(app_id) do update set
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
  checked_at=now(),
  updated_at=now();

update public.self_host_app_install_options io set
  options=coalesce((select jsonb_agg(
      option || jsonb_build_object(
        'source_url',coalesce(option->>'source_url',option->>'url'),
        'image',nullif(option->>'image','')
      ) order by coalesce((option->>'sort_order')::integer,0)
    ) from jsonb_array_elements(r.item->'install_options') option),'[]'::jsonb),
  docker_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='docker' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  docker_images=coalesce(array(select distinct option->>'image' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='docker' and nullif(option->>'image','') is not null order by option->>'image'),'{}'::text[]),
  compose_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='compose' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  unraid_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='unraid' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  umbrel_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='umbrel' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  native_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='native' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  binary_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='binary' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  package_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='package' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  other_urls=coalesce(array(select option->>'url' from jsonb_array_elements(r.item->'install_options') option where option->>'method'='other' order by coalesce((option->>'sort_order')::integer,0)),'{}'::text[]),
  source_urls=coalesce(array(select distinct coalesce(nullif(option->>'source_url',''),option->>'url') from jsonb_array_elements(r.item->'install_options') option order by coalesce(nullif(option->>'source_url',''),option->>'url')),'{}'::text[]),
  catalog_sources=case when r.item->>'slug'='kali-linux' then '[]'::jsonb else io.catalog_sources end,
  checked_at=now(),
  updated_at=now()
from reviewed_self_host_k r
join public.self_host_apps a on a.slug=r.item->>'slug'
where io.app_id=a.id;

do $verify$
begin
  if (select count(*)
      from public.self_host_apps a
      join reviewed_self_host_k r on a.slug=r.item->>'slug'
      join public.self_host_app_resource_estimates e on e.app_id=a.id
      join public.self_host_app_install_options io on io.app_id=a.id
      where a.data_checked_at::date=current_date
        and e.ram_estimate_kind='estimated'
        and e.storage_estimate_kind='estimated'
        and e.ram_source_urls is not null
        and e.storage_source_urls is not null
        and jsonb_array_length(io.options)>0
  ) <> 8 then
    raise exception 'Invalid estimate or install rows in K review batch';
  end if;
end $verify$;

drop table reviewed_self_host_k;
commit;
