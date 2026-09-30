begin;

create temporary table self_host_apps_review_batch_04 on commit drop as
select *
from jsonb_to_recordset($batch$
[
  {
    "slug":"age","name":"age","summary":"Command-line tool and Go library for encrypting and decrypting files.",
    "website_url":"https://github.com/FiloSottile/age","source_code_url":"https://github.com/FiloSottile/age","source_code_host":"github",
    "docs_url":"https://github.com/FiloSottile/age#readme","install_docs_url":"https://github.com/FiloSottile/age#readme",
    "license":"BSD-3-Clause","license_spdx_id":"BSD-3-Clause","license_type":"permissive","source_model":"open_source",
    "publisher_name":"Filippo Valsorda and Benjojo","publisher_type":"individual","publisher_url":"https://github.com/FiloSottile",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["package","binary","unraid"],"surfaces":["cli"],"storage_profile":"depends",
    "categories":["developer-tools","security-privacy"],
    "data_source_urls":["https://github.com/FiloSottile/age","https://github.com/FiloSottile/age/blob/main/LICENSE","https://github.com/FiloSottile/age#readme","https://forums.unraid.net/topic/110023-plugin-age/","https://raw.githubusercontent.com/ich777/unraid-age/master/age.plg"],
    "install_options":[
      {"method":"package","label":"Package installation","url":"https://github.com/FiloSottile/age#installation","image":null,"support_level":"official","source_url":"https://github.com/FiloSottile/age#readme","note":"Official package instructions.","sort_order":10},
      {"method":"binary","label":"Prebuilt binaries","url":"https://github.com/FiloSottile/age/releases","image":null,"support_level":"official","source_url":"https://github.com/FiloSottile/age#readme","note":"Official release binaries.","sort_order":20},
      {"method":"unraid","label":"Unraid plugin","url":"https://forums.unraid.net/topic/110023-plugin-age/","image":null,"support_level":"community","source_url":"https://raw.githubusercontent.com/ich777/unraid-age/master/age.plg","note":"Plugin maintained by ich777.","sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes its source repository.","source_urls":["https://github.com/FiloSottile/age"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository identifies BSD-3-Clause.","source_urls":["https://github.com/FiloSottile/age/blob/main/LICENSE"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The README credits Filippo Valsorda and Benjojo.","source_urls":["https://github.com/FiloSottile/age#readme"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official installation instructions list packages and binaries, not a Docker image.","source_urls":["https://github.com/FiloSottile/age#readme"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official installation instructions list packages and binaries, not a Compose deployment.","source_urls":["https://github.com/FiloSottile/age#readme"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is a command-line encryption tool and library; it has no database service.","source_urls":["https://github.com/FiloSottile/age#readme"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a RAM requirement; the directory uses an estimate.","source_urls":["https://github.com/FiloSottile/age#readme"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a storage requirement; the directory uses an estimate.","source_urls":["https://github.com/FiloSottile/age#readme"]}},
    "ram_min":64,"ram_max":512,"ram_confidence":"low","ram_basis":"Small CLI encryption process; concurrent large-file jobs can raise memory use.","ram_source_urls":["https://github.com/FiloSottile/age#readme"],
    "storage_min":1,"storage_max":500,"storage_confidence":"low","storage_basis":"The tool and keys are small; encrypted and decrypted file copies can be large.","storage_source_urls":["https://github.com/FiloSottile/age#readme"]
  },
  {
    "slug":"androiddebugbridge","name":"AndroidDebugBridge","summary":"ADB server for connecting Android TV, Fire TV, and Google TV devices to Home Assistant.",
    "website_url":"https://github.com/BLBurgess/adb-hass-androidtv","source_code_url":"https://github.com/BLBurgess/adb-hass-androidtv","source_code_host":"github",
    "docs_url":"https://github.com/BLBurgess/adb-hass-androidtv#readme","install_docs_url":"https://github.com/BLBurgess/adb-hass-androidtv#readme",
    "license":"MIT","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source",
    "publisher_name":"BLBurgess","publisher_type":"individual","publisher_url":"https://github.com/BLBurgess",
    "docker_support":"official","compose_support":true,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["docker","compose","unraid"],"surfaces":["api"],"storage_profile":"low",
    "docker_url":"https://hub.docker.com/r/barnybbb/adb-hass-androidtv","docker_image":"barnybbb/adb-hass-androidtv:latest","compose_url":"https://github.com/BLBurgess/adb-hass-androidtv#readme",
    "categories":["home-automation-iot"],
    "data_source_urls":["https://github.com/BLBurgess/adb-hass-androidtv","https://github.com/BLBurgess/adb-hass-androidtv#readme","https://hub.docker.com/r/barnybbb/adb-hass-androidtv","https://ca.unraid.net/apps/androiddebugbridge-196xwj30cikpbv","https://www.home-assistant.io/integrations/androidtv/"],
    "install_options":[
      {"method":"docker","label":"Official Docker image","url":"https://hub.docker.com/r/barnybbb/adb-hass-androidtv","image":"barnybbb/adb-hass-androidtv:latest","support_level":"official","source_url":"https://github.com/BLBurgess/adb-hass-androidtv#readme","note":"Image and tag documented by the project.","sort_order":10},
      {"method":"compose","label":"Docker Compose","url":"https://github.com/BLBurgess/adb-hass-androidtv#readme","image":null,"support_level":"official","source_url":"https://github.com/BLBurgess/adb-hass-androidtv#readme","note":"Compose examples are in the project README.","sort_order":20},
      {"method":"unraid","label":"Unraid Community Apps","url":"https://ca.unraid.net/apps/androiddebugbridge-196xwj30cikpbv","image":null,"support_level":"community","source_url":"https://ca.unraid.net/apps/androiddebugbridge-196xwj30cikpbv","note":null,"sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project publishes its source repository.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project README identifies the MIT License.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is published under the BLBurgess account.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv"]},"docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The README documents the barnybbb/adb-hass-androidtv image.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme","https://hub.docker.com/r/barnybbb/adb-hass-androidtv"]},"compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The README includes Docker Compose examples.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented server uses a small config file and does not require a database.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a RAM requirement; the directory uses an estimate.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a storage requirement; the directory uses an estimate.","source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"]}},
    "ram_min":128,"ram_max":512,"ram_confidence":"low","ram_basis":"One ADB server with a few connected devices; active sessions use more memory.","ram_source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"],
    "storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"Container and small configuration; media stays on connected devices.","storage_source_urls":["https://github.com/BLBurgess/adb-hass-androidtv#readme"]
  },
  {
    "slug":"community-applications","name":"Community Applications","summary":"Unraid plugin that adds an Apps tab for finding and installing Docker containers and plugins.",
    "website_url":"https://docs.unraid.net/community-applications/","source_code_url":"https://github.com/unraid/community.applications","source_code_host":"github",
    "docs_url":"https://docs.unraid.net/community-applications/","install_docs_url":"https://docs.unraid.net/community-applications/",
    "license":"GPL-2.0-or-later","license_spdx_id":"GPL-2.0-or-later","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"Andrew Zawadzki and Lime Technology, Inc.","publisher_type":"company","publisher_url":"https://unraid.net/",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["unraid"],"surfaces":["web"],"storage_profile":"low",
    "categories":["system-admin-hosting"],
    "data_source_urls":["https://docs.unraid.net/community-applications/","https://github.com/unraid/community.applications","https://github.com/unraid/community.applications/blob/master/LICENSE","https://raw.githubusercontent.com/unraid/community.applications/master/plugins/community.applications.plg"],
    "install_options":[
      {"method":"unraid","label":"Unraid plugin","url":"https://docs.unraid.net/community-applications/","image":null,"support_level":"official","source_url":"https://raw.githubusercontent.com/unraid/community.applications/master/plugins/community.applications.plg","note":"Official Unraid installation guide.","sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Unraid publishes the plugin source repository.","source_urls":["https://github.com/unraid/community.applications"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The repository declares GPL-2.0-or-later.","source_urls":["https://github.com/unraid/community.applications/blob/master/LICENSE"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Copyright notices identify Andrew Zawadzki and Lime Technology, Inc.","source_urls":["https://github.com/unraid/community.applications/blob/master/LICENSE"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Community Applications is an Unraid plugin, not a Docker image.","source_urls":["https://docs.unraid.net/community-applications/"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Community Applications is an Unraid plugin, not a Compose service.","source_urls":["https://docs.unraid.net/community-applications/"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The plugin adds a catalog interface to Unraid and does not require an external database.","source_urls":["https://docs.unraid.net/community-applications/"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official documentation does not give a RAM requirement; the directory uses an estimate.","source_urls":["https://docs.unraid.net/community-applications/"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official documentation does not give a storage requirement; the directory uses an estimate.","source_urls":["https://docs.unraid.net/community-applications/"]}},
    "ram_min":128,"ram_max":512,"ram_confidence":"low","ram_basis":"Unraid plugin with catalog metadata and a local web interface.","ram_source_urls":["https://docs.unraid.net/community-applications/"],
    "storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"Plugin files, cached catalog metadata, and local settings.","storage_source_urls":["https://docs.unraid.net/community-applications/"]
  },
  {
    "slug":"ddrescue","name":"GNU ddrescue","summary":"Command-line recovery tool that copies data from failing drives while rescuing readable areas first.",
    "website_url":"https://www.gnu.org/s/ddrescue/ddrescue.html","source_code_url":"https://ftp.gnu.org/gnu/ddrescue/","source_code_host":"gnu",
    "docs_url":"https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html","install_docs_url":"https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html",
    "license":"GPL-2.0-or-later","license_spdx_id":"GPL-2.0-or-later","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"Antonio Diaz Diaz","publisher_type":"individual","publisher_url":"https://www.gnu.org/s/ddrescue/ddrescue.html",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["package","native","unraid"],"surfaces":["cli"],"storage_profile":"depends",
    "categories":["storage-backup"],
    "data_source_urls":["https://www.gnu.org/s/ddrescue/ddrescue.html","https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html","https://ftp.gnu.org/gnu/ddrescue/","https://forums.unraid.net/topic/192095-plugin-ddrescue/","https://raw.githubusercontent.com/dkaser/unraid-ddrescue/main/plugin/ddrescue.plg"],
    "install_options":[
      {"method":"package","label":"Linux packages and source","url":"https://www.gnu.org/s/ddrescue/ddrescue.html","image":null,"support_level":"official","source_url":"https://ftp.gnu.org/gnu/ddrescue/","note":"GNU project download and package links.","sort_order":10},
      {"method":"native","label":"Build from source","url":"https://ftp.gnu.org/gnu/ddrescue/","image":null,"support_level":"official","source_url":"https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html","note":"Official GNU source archives.","sort_order":20},
      {"method":"unraid","label":"Unraid plugin","url":"https://forums.unraid.net/topic/192095-plugin-ddrescue/","image":null,"support_level":"community","source_url":"https://raw.githubusercontent.com/dkaser/unraid-ddrescue/main/plugin/ddrescue.plg","note":"Community plugin updated to GNU ddrescue 1.30.","sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"GNU publishes source archives for ddrescue.","source_urls":["https://ftp.gnu.org/gnu/ddrescue/"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The GNU project identifies the GPL version 2 or later.","source_urls":["https://www.gnu.org/s/ddrescue/ddrescue.html"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"GNU credits Antonio Diaz Diaz as maintainer.","source_urls":["https://www.gnu.org/s/ddrescue/ddrescue.html"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"GNU installation guidance lists packages and source archives, not a Docker image.","source_urls":["https://www.gnu.org/s/ddrescue/ddrescue.html"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"GNU installation guidance lists packages and source archives, not a Compose deployment.","source_urls":["https://www.gnu.org/s/ddrescue/ddrescue.html"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"GNU ddrescue is a command-line data recovery utility with no database service.","source_urls":["https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"GNU documentation does not give a RAM requirement; the directory uses an estimate.","source_urls":["https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"GNU documentation does not give a storage requirement; the directory uses an estimate.","source_urls":["https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html"]}},
    "ram_min":64,"ram_max":512,"ram_confidence":"low","ram_basis":"CLI recovery job; configured buffers and concurrent reads can raise memory use.","ram_source_urls":["https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html"],
    "storage_min":20,"storage_max":20000,"storage_confidence":"low","storage_basis":"A recovery image can be as large as the source drive; the map file is small.","storage_source_urls":["https://www.gnu.org/software/ddrescue/manual/ddrescue_manual.html"]
  },
  {
    "slug":"dynamix-wireguard","name":"Dynamix WireGuard","summary":"Unraid plugin with a web interface for setting up and managing WireGuard VPN tunnels.",
    "website_url":"https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN","source_code_url":"https://github.com/unraid/dynamix","source_code_host":"github",
    "docs_url":"https://docs.unraid.net/unraid-os/system-administration/secure-your-server/wireguard/","install_docs_url":"https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN",
    "license":null,"license_spdx_id":null,"license_type":"unknown","source_model":"source_available",
    "publisher_name":"Bergware","publisher_type":"community","publisher_url":"https://github.com/unraid/dynamix",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["unraid"],"surfaces":["web"],"storage_profile":"low",
    "categories":["networking-dns"],
    "data_source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN","https://docs.unraid.net/unraid-os/system-administration/secure-your-server/wireguard/","https://github.com/unraid/dynamix","https://raw.githubusercontent.com/unraid/dynamix/master/unRAIDv6/dynamix.wireguard.plg","https://forums.unraid.net/topic/84229-dynamix-wireguard-vpn/"],
    "install_options":[
      {"method":"unraid","label":"Unraid Community Apps","url":"https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN","image":null,"support_level":"community","source_url":"https://raw.githubusercontent.com/unraid/dynamix/master/unRAIDv6/dynamix.wireguard.plg","note":"Plugin published by Bergware.","sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The public Unraid Dynamix repository contains the plugin source.","source_urls":["https://github.com/unraid/dynamix"]},"license":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The public repository does not identify a license for this plugin.","source_urls":["https://github.com/unraid/dynamix"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The Unraid Community Apps page identifies Bergware as publisher.","source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The plugin is distributed through Unraid Community Apps, not as a Docker image.","source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The plugin is distributed through Unraid Community Apps, not as a Compose service.","source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The plugin adds WireGuard controls to Unraid and does not require an external database.","source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official pages do not give a RAM requirement; the directory uses an estimate.","source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official pages do not give a storage requirement; the directory uses an estimate.","source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]}},
    "ram_min":128,"ram_max":512,"ram_confidence":"low","ram_basis":"One Unraid server running the plugin and a modest set of VPN peers.","ram_source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"],
    "storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"Plugin files and WireGuard tunnel and peer settings are small.","storage_source_urls":["https://ca.unraid.net/apps/dynamix-wireguard-0n1upet02qg39l?category=Network+%3E+VPN"]
  },
  {
    "slug":"iotop-c-version-for-unraid","name":"iotop-c for Unraid","summary":"Linux command-line monitor that shows which processes are doing the most disk I/O.",
    "website_url":"https://github.com/Tomas-M/iotop","source_code_url":"https://github.com/Tomas-M/iotop","source_code_host":"github",
    "docs_url":"https://github.com/Tomas-M/iotop#readme","install_docs_url":"https://ca.unraid.net/apps/iotop-c-version-for-unraid-1c6dcjd0qgvs3x",
    "license":"GPL-2.0-or-later","license_spdx_id":"GPL-2.0-or-later","license_type":"copyleft","source_model":"open_source",
    "publisher_name":"Tomas-M and contributors","publisher_type":"community","publisher_url":"https://github.com/Tomas-M",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":false,
    "pricing_model":"free","deployment_methods":["package","unraid"],"surfaces":["cli"],"storage_profile":"tiny",
    "categories":["monitoring-status","system-admin-hosting"],
    "data_source_urls":["https://github.com/Tomas-M/iotop","https://github.com/Tomas-M/iotop#readme","https://ca.unraid.net/apps/iotop-c-version-for-unraid-1c6dcjd0qgvs3x","https://raw.githubusercontent.com/desertwitch/iotop-c-unRAID/main/plugin/dwiotopc.plg"],
    "install_options":[
      {"method":"package","label":"Linux package","url":"https://github.com/Tomas-M/iotop#readme","image":null,"support_level":"official","source_url":"https://github.com/Tomas-M/iotop#readme","note":"The project documents iotop-c packages and source builds.","sort_order":10},
      {"method":"unraid","label":"Unraid Community Apps","url":"https://ca.unraid.net/apps/iotop-c-version-for-unraid-1c6dcjd0qgvs3x","image":null,"support_level":"community","source_url":"https://raw.githubusercontent.com/desertwitch/iotop-c-unRAID/main/plugin/dwiotopc.plg","note":null,"sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The iotop-c project publishes its source repository.","source_urls":["https://github.com/Tomas-M/iotop"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project declares GPL-2.0-or-later.","source_urls":["https://github.com/Tomas-M/iotop#readme"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The source repository identifies the iotop-c maintainers and contributors.","source_urls":["https://github.com/Tomas-M/iotop#readme"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Project install instructions use host packages and source builds, not a Docker image.","source_urls":["https://github.com/Tomas-M/iotop#readme"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Project install instructions use host packages and source builds, not Compose.","source_urls":["https://github.com/Tomas-M/iotop#readme"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"iotop-c is an interactive Linux host utility and has no database service.","source_urls":["https://github.com/Tomas-M/iotop#readme"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a RAM requirement; the directory uses an estimate.","source_urls":["https://github.com/Tomas-M/iotop#readme"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a storage requirement; the directory uses an estimate.","source_urls":["https://github.com/Tomas-M/iotop#readme"]}},
    "ram_min":32,"ram_max":256,"ram_confidence":"low","ram_basis":"Interactive host monitor; process count and displayed details affect memory use.","ram_source_urls":["https://github.com/Tomas-M/iotop#readme"],
    "storage_min":1,"storage_max":5,"storage_confidence":"low","storage_basis":"Package files only; iotop-c does not save application data.","storage_source_urls":["https://github.com/Tomas-M/iotop#readme"]
  },
  {
    "slug":"lxc","name":"LXC","summary":"Linux container manager for running system and application containers on a Linux host.",
    "website_url":"https://linuxcontainers.org/lxc/","source_code_url":"https://github.com/lxc/lxc","source_code_host":"github",
    "docs_url":"https://linuxcontainers.org/lxc/introduction/","install_docs_url":"https://linuxcontainers.org/lxc/downloads/",
    "license":"LGPL-2.1-or-later by default; some components use BSD-2-Clause or GPL-2.0","license_spdx_id":null,"license_type":"mixed","source_model":"open_source",
    "publisher_name":"Linux Containers Project","publisher_type":"community","publisher_url":"https://linuxcontainers.org/",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":true,
    "pricing_model":"free","deployment_methods":["native","package"],"surfaces":["cli"],"storage_profile":"depends",
    "categories":["system-admin-hosting"],
    "data_source_urls":["https://linuxcontainers.org/lxc/","https://linuxcontainers.org/lxc/introduction/","https://linuxcontainers.org/lxc/downloads/","https://github.com/lxc/lxc","https://github.com/ich777/unraid-lxc-plugin"],
    "install_options":[
      {"method":"package","label":"Linux distribution packages","url":"https://linuxcontainers.org/lxc/downloads/","image":null,"support_level":"official","source_url":"https://linuxcontainers.org/lxc/downloads/","note":"The project lists distribution packages.","sort_order":10},
      {"method":"native","label":"Build from source","url":"https://github.com/lxc/lxc","image":null,"support_level":"official","source_url":"https://linuxcontainers.org/lxc/downloads/","note":"Official source repository.","sort_order":20}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The LXC project publishes its source repository.","source_urls":["https://github.com/lxc/lxc"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project uses LGPL-2.1-or-later by default with some components under other free licenses.","source_urls":["https://github.com/lxc/lxc"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The project is published by the Linux Containers community.","source_urls":["https://linuxcontainers.org/lxc/"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"LXC is a Linux host container manager; the project does not publish it as a Docker service.","source_urls":["https://linuxcontainers.org/lxc/introduction/"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"LXC is a Linux host container manager, not a Compose service.","source_urls":["https://linuxcontainers.org/lxc/introduction/"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"LXC manages Linux containers and does not require an external application database.","source_urls":["https://linuxcontainers.org/lxc/introduction/"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official LXC pages do not give a RAM requirement; the directory uses an estimate.","source_urls":["https://linuxcontainers.org/lxc/downloads/"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official LXC pages do not give a storage requirement; the directory uses an estimate.","source_urls":["https://linuxcontainers.org/lxc/downloads/"]}},
    "ram_min":1024,"ram_max":8192,"ram_confidence":"low","ram_basis":"Host manager plus a few lightly loaded containers; each guest adds its own use.","ram_source_urls":["https://linuxcontainers.org/lxc/introduction/"],
    "storage_min":20,"storage_max":500,"storage_confidence":"low","storage_basis":"Container root filesystems dominate disk use; size and count vary.","storage_source_urls":["https://linuxcontainers.org/lxc/introduction/"]
  },
  {
    "slug":"ncdu","name":"ncdu","summary":"Text-mode disk usage analyzer that shows which directories use the most space.",
    "website_url":"https://dev.yorhel.nl/ncdu","source_code_url":"https://code.blicky.net/yorhel/ncdu/","source_code_host":"forgejo",
    "docs_url":"https://dev.yorhel.nl/ncdu/man","install_docs_url":"https://ca.unraid.net/apps/ncdu-1ay54v41e0lwi4",
    "license":"MIT","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source",
    "publisher_name":"Yoran Heling","publisher_type":"individual","publisher_url":"https://dev.yorhel.nl/",
    "docker_support":"none","compose_support":false,"requires_database":false,"database_types":[],"persistent_storage":false,
    "pricing_model":"free","deployment_methods":["package","binary","unraid"],"surfaces":["cli"],"storage_profile":"depends",
    "categories":["storage-backup"],
    "data_source_urls":["https://dev.yorhel.nl/ncdu","https://dev.yorhel.nl/ncdu/man","https://code.blicky.net/yorhel/ncdu/","https://ca.unraid.net/apps/ncdu-1ay54v41e0lwi4","https://raw.githubusercontent.com/dkaser/unraid-ncdu/main/plugin/ncdu.plg"],
    "install_options":[
      {"method":"package","label":"Linux package","url":"https://dev.yorhel.nl/ncdu","image":null,"support_level":"official","source_url":"https://dev.yorhel.nl/ncdu","note":"The project lists distribution packages.","sort_order":10},
      {"method":"binary","label":"Binaries and source","url":"https://dev.yorhel.nl/ncdu","image":null,"support_level":"official","source_url":"https://dev.yorhel.nl/ncdu","note":"Official project downloads.","sort_order":20},
      {"method":"unraid","label":"Unraid Community Apps","url":"https://ca.unraid.net/apps/ncdu-1ay54v41e0lwi4","image":null,"support_level":"community","source_url":"https://raw.githubusercontent.com/dkaser/unraid-ncdu/main/plugin/ncdu.plg","note":null,"sort_order":35}
    ],
    "technical_status":{"source_code":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official site links to the project source repository.","source_urls":["https://dev.yorhel.nl/ncdu","https://code.blicky.net/yorhel/ncdu/"]},"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official project site identifies the MIT license.","source_urls":["https://dev.yorhel.nl/ncdu"]},"publisher":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Yoran Heling publishes the project site and source repository.","source_urls":["https://dev.yorhel.nl/ncdu"]},"docker":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project lists packages and binaries, not an official Docker image.","source_urls":["https://dev.yorhel.nl/ncdu"]},"compose":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The project lists packages and binaries, not an official Compose deployment.","source_urls":["https://dev.yorhel.nl/ncdu"]},"database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"ncdu is a command-line disk usage analyzer and does not require a database.","source_urls":["https://dev.yorhel.nl/ncdu"]},"ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a RAM requirement; the directory uses an estimate.","source_urls":["https://dev.yorhel.nl/ncdu/man"]},"storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"Official project pages do not give a storage requirement; the directory uses an estimate.","source_urls":["https://dev.yorhel.nl/ncdu/man"]}},
    "ram_min":128,"ram_max":2048,"ram_confidence":"low","ram_basis":"Scan memory grows with the number of filesystem entries.","ram_source_urls":["https://dev.yorhel.nl/ncdu/man"],
    "storage_min":1,"storage_max":10,"storage_confidence":"low","storage_basis":"The program is small; scan exports grow with file count.","storage_source_urls":["https://dev.yorhel.nl/ncdu/man"]
  }
]
$batch$::jsonb) as reviewed(
  slug text,name text,summary text,website_url text,source_code_url text,source_code_host text,docs_url text,install_docs_url text,
  license text,license_spdx_id text,license_type text,source_model text,publisher_name text,publisher_type text,publisher_url text,
  docker_support text,compose_support boolean,requires_database boolean,database_types text[],persistent_storage boolean,
  pricing_model text,deployment_methods text[],surfaces text[],storage_profile text,categories text[],data_source_urls text[],
  install_options jsonb,technical_status jsonb,ram_min numeric,ram_max numeric,ram_confidence text,ram_basis text,ram_source_urls text[],
  storage_min numeric,storage_max numeric,storage_confidence text,storage_basis text,storage_source_urls text[],
  docker_url text,docker_image text,compose_url text
);

do $guard$
declare
  v_item record;
  v_app_id uuid;
  v_name text;
  v_website text;
  v_source text;
  v_model text;
  v_license text;
  v_publisher text;
  v_categories text[];
  v_unraid_urls text[];
  v_docker_urls text[];
  v_ram_min numeric;
  v_ram_max numeric;
  v_ram_basis text;
  v_storage_min numeric;
  v_storage_max numeric;
  v_storage_basis text;
begin
  if (select count(*) from self_host_apps_review_batch_04) <> 8 then
    raise exception 'Batch 04 payload must contain eight apps';
  end if;

  for v_item in select * from (values
    ('age','age',array['ai-ml','developer-tools','security-privacy']::text[],'https://raw.githubusercontent.com/ich777/docker-templates/master/ich777/age.xml',null::text,2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.'),
    ('androiddebugbridge','AndroidDebugBridge',array['home-automation-iot','photos-galleries','system-admin-hosting']::text[],'https://raw.githubusercontent.com/CorneliousJD/Docker-Templates/master/androiddebugbridge.xml','https://hub.docker.com/r/barnybbb/adb-hass-androidtv/',256::numeric,2048::numeric,50::numeric,500::numeric,'Typical small self-hosted instance; workload and stored data vary.'),
    ('community-applications','Community Applications',array['ai-ml','communication','system-admin-hosting']::text[],'https://raw.githubusercontent.com/unraid/docker-templates/master/limetech/community.applications.xml',null::text,2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.'),
    ('ddrescue','ddrescue',array['developer-tools']::text[],'https://raw.githubusercontent.com/dkaser/unraid-plugins/main/ddrescue.xml',null::text,256::numeric,2048::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.'),
    ('dynamix-wireguard','Dynamix WireGuard',array['ai-ml','identity-access','networking-dns']::text[],'https://raw.githubusercontent.com/unraid/dynamix-plugins-xml/master/wireguard.xml',null::text,2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.'),
    ('iotop-c-version-for-unraid','iotop (C Version) for UNRAID',array['ai-ml','home-automation-iot','system-admin-hosting']::text[],'https://raw.githubusercontent.com/desertwitch/unraid-plugins/main/dwiotopc.xml',null::text,2048::numeric,8192::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.'),
    ('lxc','LXC',array['ai-ml','ebooks-libraries','video-conferencing']::text[],'https://raw.githubusercontent.com/ich777/docker-templates/master/ich777/LXC.xml',null::text,2048::numeric,8192::numeric,50::numeric,500::numeric,'Small single-node service; active users and stored content vary.'),
    ('ncdu','ncdu',array['developer-tools']::text[],'https://raw.githubusercontent.com/dkaser/unraid-plugins/main/ncdu.xml',null::text,256::numeric,2048::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.')
  ) expected(slug,old_name,old_categories,old_unraid_url,old_docker_url,old_ram_min,old_ram_max,old_storage_min,old_storage_max,old_basis)
  loop
    select app.id,app.name,app.website_url,app.source_code_url,app.source_model::text,app.license,app.publisher_type
      into v_app_id,v_name,v_website,v_source,v_model,v_license,v_publisher
    from public.self_host_apps app
    where app.slug=v_item.slug and app.published is true and app.self_hosting_status='self_hostable';
    if not found or v_name is distinct from v_item.old_name or v_website is not null or v_source is not null
       or v_model is distinct from 'closed_source' or v_license is not null or v_publisher is distinct from 'unknown' then
      raise exception 'Batch 04 source baseline changed for %',v_item.slug;
    end if;

    select coalesce(array_agg(category.slug order by category.slug),'{}'::text[])
      into v_categories
    from public.self_host_app_category_links link
    join public.self_host_app_categories category on category.id=link.category_id
    where link.app_id=v_app_id;
    if v_categories is distinct from v_item.old_categories then
      raise exception 'Batch 04 categories changed for %',v_item.slug;
    end if;

    select install.unraid_urls,install.docker_urls into v_unraid_urls,v_docker_urls
    from public.self_host_app_install_options install where install.app_id=v_app_id;
    if not found or v_unraid_urls is distinct from array[v_item.old_unraid_url]::text[] then
      raise exception 'Batch 04 Unraid install option changed for %',v_item.slug;
    end if;
    if v_item.old_docker_url is null then
      if coalesce(v_docker_urls,'{}'::text[]) <> '{}'::text[] then
        raise exception 'Batch 04 Docker install option changed for %',v_item.slug;
      end if;
    elsif v_docker_urls is distinct from array[v_item.old_docker_url]::text[] then
      raise exception 'Batch 04 Docker install option changed for %',v_item.slug;
    end if;

    select estimate.ram_estimate_min_mb,estimate.ram_estimate_max_mb,estimate.ram_estimate_basis,
           estimate.storage_estimate_min_gb,estimate.storage_estimate_max_gb,estimate.storage_estimate_basis
      into v_ram_min,v_ram_max,v_ram_basis,v_storage_min,v_storage_max,v_storage_basis
    from public.self_host_app_resource_estimates estimate where estimate.app_id=v_app_id;
    if not found or v_ram_min is distinct from v_item.old_ram_min or v_ram_max is distinct from v_item.old_ram_max
       or v_storage_min is distinct from v_item.old_storage_min or v_storage_max is distinct from v_item.old_storage_max
       or v_ram_basis is distinct from v_item.old_basis or v_storage_basis is distinct from v_item.old_basis then
      raise exception 'Batch 04 estimate baseline changed for %',v_item.slug;
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
  docker_url=reviewed.docker_url,docker_image=reviewed.docker_image,docker_support=reviewed.docker_support,
  compose_url=reviewed.compose_url,compose_support=reviewed.compose_support,
  requires_database=reviewed.requires_database,database_types=reviewed.database_types,
  persistent_storage=reviewed.persistent_storage,pricing_model=reviewed.pricing_model,
  deployment_methods=reviewed.deployment_methods,surfaces=reviewed.surfaces,storage_profile=reviewed.storage_profile,
  summary_source='curated',summary_confidence='high',data_confidence='high',
  data_source_urls=(select coalesce(array_agg(distinct url order by url),'{}'::text[])
                    from unnest(coalesce(app.data_source_urls,'{}'::text[])||reviewed.data_source_urls) refs(url)),
  technical_fact_status=coalesce(app.technical_fact_status,'{}'::jsonb)||reviewed.technical_status,
  technical_facts_checked_at=now(),updated_at=now()
from self_host_apps_review_batch_04 reviewed
where app.slug=reviewed.slug;

do $categories$
declare
  v_item record;
  v_app uuid;
  v_count integer;
begin
  for v_item in select slug,categories from self_host_apps_review_batch_04 loop
    select id into v_app from public.self_host_apps where slug=v_item.slug for update;
    delete from public.self_host_app_category_links where app_id=v_app;
    insert into public.self_host_app_category_links(app_id,category_id)
    select v_app,category.id from public.self_host_app_categories category
    where category.slug=any(v_item.categories);
    get diagnostics v_count=row_count;
    if v_count<>cardinality(v_item.categories) then
      raise exception 'Batch 04 category assignment failed for %',v_item.slug;
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
from self_host_apps_review_batch_04 reviewed
join public.self_host_apps app on app.slug=reviewed.slug
where estimate.app_id=app.id;

update public.self_host_app_install_options install set
  options=reviewed.install_options,
  docker_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='docker' order by option->>'url'),
  docker_images=array(select distinct option->>'image' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='docker' and nullif(option->>'image','') is not null order by option->>'image'),
  compose_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='compose' order by option->>'url'),
  unraid_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='unraid' order by option->>'url'),
  native_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='native' order by option->>'url'),
  binary_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='binary' order by option->>'url'),
  package_urls=array(select option->>'url' from jsonb_array_elements(reviewed.install_options) option where option->>'method'='package' order by option->>'url'),
  source_urls=reviewed.data_source_urls,checked_at=now(),updated_at=now()
from self_host_apps_review_batch_04 reviewed
join public.self_host_apps app on app.slug=reviewed.slug
where install.app_id=app.id;

commit;
