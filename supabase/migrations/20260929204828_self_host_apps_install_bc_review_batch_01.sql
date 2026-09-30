-- Reviewed B-C install destinations and corrected stale install links.
-- BinPastes and BitMappery were added after root checked their official source install steps.
DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://docs.backdropcms.org/documentation/installation-instructions',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.backdropcms.org/documentation/installation-instructions', 'https://backdropcms.org/project/backdrop/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '892adb5b-ee25-4188-a608-e07079db88e5'::uuid AND a.slug = 'backdrop-cms' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://backdropcms.org' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/backdrop/backdrop' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/backdrop/backdrop#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/backdrop' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for backdrop-cms'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"native","label":"Web server installation","url":"https://backdropcms.org/project/backdrop/releases","support_level":"official","source_url":"https://docs.backdropcms.org/documentation/installation-instructions","image":null,"note":"The guide directs users to download a release archive, place it in a webroot, and run the browser installer.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://docs.backdropcms.org/documentation/installation-instructions']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY['https://backdropcms.org/project/backdrop/releases']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '892adb5b-ee25-4188-a608-e07079db88e5'::uuid AND a.slug = 'backdrop-cms' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for backdrop-cms'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://backuppc.github.io/backuppc/',
    docs_url = 'https://backuppc.github.io/backuppc/BackupPC',
    install_docs_url = 'https://backuppc.github.io/backuppc/BackupPC',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://backuppc.github.io/backuppc/BackupPC', 'https://github.com/backuppc/backuppc/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '1c424ec8-ee77-479a-9a87-cbe9549d0b62'::uuid AND a.slug = 'backuppc' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/backuppc/backuppc' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/backuppc/backuppc' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/backuppc/backuppc#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/backuppc' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for backuppc'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"native","label":"Native installation","url":"https://backuppc.github.io/backuppc/BackupPC","support_level":"official","source_url":"https://backuppc.github.io/backuppc/BackupPC","image":null,"note":"The official manual covers obtaining and installing BackupPC, with distribution package managers as the recommended path for supported distributions.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://backuppc.github.io/backuppc/BackupPC']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY['https://backuppc.github.io/backuppc/BackupPC']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '1c424ec8-ee77-479a-9a87-cbe9549d0b62'::uuid AND a.slug = 'backuppc' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for backuppc'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://basebuddy.stack127.com/support/deploy-vps-docker',
    install_docs_url = 'https://basebuddy.stack127.com/support/deploy-vps-docker',
    docker_url = 'https://basebuddy.stack127.com/support/deploy-vps-docker',
    docker_image = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://basebuddy.stack127.com/support/deploy-vps-docker', 'https://basebuddy.stack127.com/docs/installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'add96a2b-9cf5-41ac-960c-567816302dc7'::uuid AND a.slug = 'basebuddy' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://basebuddy.stack127.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/stack127labs/basebuddy' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/stack127labs/basebuddy/blob/main/INSTALL.md' AND a.publisher_url IS NOT DISTINCT FROM 'https://stack127.com/labs' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['source', 'docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for basebuddy'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker VPS setup","url":"https://basebuddy.stack127.com/support/deploy-vps-docker","support_level":"official","source_url":"https://basebuddy.stack127.com/support/deploy-vps-docker","image":null,"note":"The official VPS guide documents the Docker-based server setup and app start steps; no registry image is identified.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://basebuddy.stack127.com/support/deploy-vps-docker']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://basebuddy.stack127.com/support/deploy-vps-docker']::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'add96a2b-9cf5-41ac-960c-567816302dc7'::uuid AND a.slug = 'basebuddy' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for basebuddy'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://hub.docker.com/r/daya0576/beaverhabits',
    docker_image = 'daya0576/beaverhabits:latest',
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/daya0576/beaverhabits#readme', 'https://hub.docker.com/r/daya0576/beaverhabits']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '521992f7-f2b9-44cb-94c0-8703907a87d8'::uuid AND a.slug = 'beaver-habit-tracker' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://beaverhabits.com/demo' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/daya0576/beaverhabits' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/daya0576/beaverhabits#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/daya0576' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/daya0576/beaverhabits/blob/HEAD/docker/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for beaver-habit-tracker'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/daya0576/beaverhabits","support_level":"official","source_url":"https://github.com/daya0576/beaverhabits#readme","image":"daya0576/beaverhabits:latest","note":"The upstream README documents the Docker image and run command.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/daya0576/beaverhabits#readme']::text[],
      checked_at = now(),
      docker_images = ARRAY['daya0576/beaverhabits:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/daya0576/beaverhabits']::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '521992f7-f2b9-44cb-94c0-8703907a87d8'::uuid AND a.slug = 'beaver-habit-tracker' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for beaver-habit-tracker'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://beets.io',
    docs_url = 'https://docs.beets.io/en/v2.0.0/guides/main.html',
    install_docs_url = 'https://docs.beets.io/en/v2.0.0/guides/main.html',
    docker_url = 'https://docs.linuxserver.io/images/docker-beets/',
    docker_image = 'lscr.io/linuxserver/beets:latest',
    compose_url = 'https://docs.linuxserver.io/images/docker-beets/',
    deployment_methods = ARRAY['package', 'docker', 'compose']::text[],
    docker_support = 'community',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.beets.io/en/v2.0.0/guides/main.html', 'https://pypi.org/project/beets/', 'https://docs.linuxserver.io/images/docker-beets/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '477a8fd6-2b51-4e96-8e63-eea873069174'::uuid AND a.slug = 'beets' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'http://beets.io' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/beetbox/beets' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/beetbox/beets#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/beetbox' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for beets'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"package","label":"Python package","url":"https://pypi.org/project/beets/","support_level":"official","source_url":"https://docs.beets.io/en/v2.0.0/guides/main.html","image":null,"note":"The official guide documents installation with pip; PyPI is the package destination.","sort_order":10},{"method":"docker","label":"Community Docker image","url":"https://docs.linuxserver.io/images/docker-beets/","support_level":"community","source_url":"https://docs.linuxserver.io/images/docker-beets/","image":"lscr.io/linuxserver/beets:latest","note":"LinuxServer maintains this container; its web player is an add-on around the Beets CLI.","sort_order":20},{"method":"compose","label":"Community Docker Compose","url":"https://docs.linuxserver.io/images/docker-beets/","support_level":"community","source_url":"https://docs.linuxserver.io/images/docker-beets/","image":"lscr.io/linuxserver/beets:latest","note":"LinuxServer documents Compose deployment for its community image.","sort_order":30}]'::jsonb,
      source_urls = ARRAY['https://docs.beets.io/en/v2.0.0/guides/main.html', 'https://docs.linuxserver.io/images/docker-beets/']::text[],
      checked_at = now(),
      docker_images = ARRAY['lscr.io/linuxserver/beets:latest']::text[],
      docker_urls = ARRAY['https://docs.linuxserver.io/images/docker-beets/']::text[],
      compose_urls = ARRAY['https://docs.linuxserver.io/images/docker-beets/']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY['https://pypi.org/project/beets/']::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '477a8fd6-2b51-4e96-8e63-eea873069174'::uuid AND a.slug = 'beets' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for beets'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://hub.docker.com/r/nesaku/biblioreads',
    docker_image = 'nesaku/biblioreads:latest',
    compose_url = 'https://github.com/nesaku/BiblioReads#docker-installation',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/nesaku/BiblioReads#docker-installation', 'https://hub.docker.com/r/nesaku/biblioreads']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '2f9839cc-8828-4e40-9e07-f9bca79f112f'::uuid AND a.slug = 'biblioreads' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://biblioreads.eu.org' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/nesaku/BiblioReads' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/nesaku/BiblioReads#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/nesaku' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for biblioreads'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/nesaku/biblioreads","support_level":"official","source_url":"https://github.com/nesaku/BiblioReads#docker-installation","image":"nesaku/biblioreads:latest","note":"The upstream README documents the image and Docker run command.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/nesaku/BiblioReads#docker-installation","support_level":"official","source_url":"https://github.com/nesaku/BiblioReads#docker-installation","image":"nesaku/biblioreads:latest","note":"The upstream README links the Compose setup.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://github.com/nesaku/BiblioReads#docker-installation']::text[],
      checked_at = now(),
      docker_images = ARRAY['nesaku/biblioreads:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/nesaku/biblioreads']::text[],
      compose_urls = ARRAY['https://github.com/nesaku/BiblioReads#docker-installation']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2f9839cc-8828-4e40-9e07-f9bca79f112f'::uuid AND a.slug = 'biblioreads' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for biblioreads'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://www.bigtreecms.org',
    docs_url = 'https://www.bigtreecms.org/developers/dev-guide/installation/',
    install_docs_url = 'https://www.bigtreecms.org/developers/dev-guide/installation/',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://www.bigtreecms.org/developers/dev-guide/installation/', 'https://www.bigtreecms.org/download/core/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'a81c793c-4f08-4424-af62-c136dc14c070'::uuid AND a.slug = 'bigtree-cms' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM NULL AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bigtreecms/BigTree-CMS' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bigtreecms/BigTree-CMS' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/bigtreecms' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bigtree-cms'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"native","label":"Web server installation","url":"https://www.bigtreecms.org/download/core/","support_level":"official","source_url":"https://www.bigtreecms.org/developers/dev-guide/installation/","image":null,"note":"The official download page provides BigTree CMS; its guide explains installation on a PHP/MySQL web server.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://www.bigtreecms.org/developers/dev-guide/installation/']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY['https://www.bigtreecms.org/download/core/']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'a81c793c-4f08-4424-af62-c136dc14c070'::uuid AND a.slug = 'bigtree-cms' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bigtree-cms'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://hub.docker.com/r/dinkeyes/bindery',
    docker_image = 'dinkeyes/bindery:latest',
    compose_url = 'https://github.com/jarynclouatre/bindery#docker-composeyml',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/vavallee/bindery') || ARRAY['https://github.com/jarynclouatre/bindery', 'https://hub.docker.com/r/dinkeyes/bindery', 'https://github.com/jarynclouatre/bindery#docker-composeyml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '2b063ab0-99a5-437a-9b18-b4c6722a819b'::uuid AND a.slug = 'bindery' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/jarynclouatre/bindery' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/jarynclouatre/bindery' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/jarynclouatre/bindery#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/jarynclouatre' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.data_source_urls IS NOT DISTINCT FROM ARRAY['https://github.com/jarynclouatre/bindery', 'https://github.com/jarynclouatre/bindery#readme', 'https://github.com/vavallee/bindery', 'https://opengraph.githubassets.com/1/jarynclouatre/bindery', 'https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md', 'https://selfhostedworld.com/software/bindery']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bindery'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/dinkeyes/bindery","support_level":"official","source_url":"https://github.com/jarynclouatre/bindery","image":"dinkeyes/bindery:latest","note":"The upstream README documents this image for the self-hosted converter.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://github.com/jarynclouatre/bindery#docker-composeyml","support_level":"official","source_url":"https://github.com/jarynclouatre/bindery","image":"dinkeyes/bindery:latest","note":"The official README includes a Compose file using the maintainer''s Docker image.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://github.com/jarynclouatre/bindery']::text[],
      checked_at = now(),
      docker_images = ARRAY['dinkeyes/bindery:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/dinkeyes/bindery']::text[],
      compose_urls = ARRAY['https://github.com/jarynclouatre/bindery#docker-composeyml']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2b063ab0-99a5-437a-9b18-b4c6722a819b'::uuid AND a.slug = 'bindery' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bindery'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://github.com/querwurzel/BinPastes#how-to-build',
    install_docs_url = 'https://github.com/querwurzel/BinPastes#how-to-build',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/querwurzel/BinPastes', 'https://github.com/querwurzel/BinPastes#how-to-build']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'd3c17a69-b620-476a-87d6-3cc70bace5f9'::uuid AND a.slug = 'binpastes' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/querwurzel/BinPastes' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/querwurzel/BinPastes' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/querwurzel/BinPastes#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/querwurzel' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for binpastes'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"native","label":"Build and run from source","url":"https://github.com/querwurzel/BinPastes#how-to-build","support_level":"official","source_url":"https://github.com/querwurzel/BinPastes","image":null,"note":"The README builds binpastes.jar with its Maven wrapper and documents running it with Java and MySQL.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/querwurzel/BinPastes']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY['https://github.com/querwurzel/BinPastes#how-to-build']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'd3c17a69-b620-476a-87d6-3cc70bace5f9'::uuid AND a.slug = 'binpastes' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for binpastes'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://birdnet-team.github.io/BirdNET-Analyzer/stable/installation.html',
    install_docs_url = 'https://birdnet-team.github.io/BirdNET-Analyzer/stable/installation.html',
    docker_url = NULL,
    docker_image = NULL,
    deployment_methods = ARRAY['native']::text[],
    docker_support = 'none',
    compose_support = 'false',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://birdnet-team.github.io/BirdNET-Analyzer/stable/installation.html', 'https://github.com/birdnet-team/BirdNET-Analyzer/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'f4955bb8-262d-4538-94cc-d96f2d5e9057'::uuid AND a.slug = 'birdnet-analyzer' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://birdnet-team.github.io/BirdNET-Analyzer' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/birdnet-team/BirdNET-Analyzer' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/birdnet-team/BirdNET-Analyzer#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/birdnet-team' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/birdnet-team/BirdNET-Analyzer/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for birdnet-analyzer'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"native","label":"Desktop installers","url":"https://github.com/birdnet-team/BirdNET-Analyzer/releases","support_level":"official","source_url":"https://birdnet-team.github.io/BirdNET-Analyzer/stable/installation.html","image":null,"note":"Official documentation links the Windows and macOS GUI installers from the releases page.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://birdnet-team.github.io/BirdNET-Analyzer/stable/installation.html']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY['https://github.com/birdnet-team/BirdNET-Analyzer/releases']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'f4955bb8-262d-4538-94cc-d96f2d5e9057'::uuid AND a.slug = 'birdnet-analyzer' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for birdnet-analyzer'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://docs.bitcart.ai/deployment/docker',
    install_docs_url = 'https://docs.bitcart.ai/deployment/docker',
    docker_url = 'https://docs.bitcart.ai/deployment/docker',
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    compose_support = 'false',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.bitcart.ai/deployment/docker', 'https://github.com/bitcart/bitcart-docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '637c366d-f376-42c6-bd8c-c7b29e1780af'::uuid AND a.slug = 'bitcart' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://bitcart.ai' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bitcart/bitcart' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bitcart/bitcart-docker#using-provided-scripts-easy' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/bitcart' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/bitcart/bitcart-docker' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bitcart'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker deployment","url":"https://docs.bitcart.ai/deployment/docker","support_level":"official","source_url":"https://docs.bitcart.ai/deployment/docker","image":null,"note":"The official Docker deployment guide uses the Bitcart setup script to install its multi-container stack.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://docs.bitcart.ai/deployment/docker']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://docs.bitcart.ai/deployment/docker']::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '637c366d-f376-42c6-bd8c-c7b29e1780af'::uuid AND a.slug = 'bitcart' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bitcart'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://www.igorski.nl/bitmappery',
    docs_url = 'https://github.com/igorski/bitmappery#docker-based-self-hosted-version',
    install_docs_url = 'https://github.com/igorski/bitmappery#docker-based-self-hosted-version',
    docker_url = 'https://github.com/igorski/bitmappery#docker-based-self-hosted-version',
    docker_image = NULL,
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/igorski/bitmappery/blob/master/README.md', 'https://github.com/igorski/bitmappery#docker-based-self-hosted-version', 'https://github.com/igorski/bitmappery']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'cca3ad06-edce-4e24-943f-aa1dd53def5d'::uuid AND a.slug = 'bitmappery' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM NULL AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/igorski/bitmappery' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/igorski/bitmappery' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/igorski' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/igorski/bitmappery' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bitmappery'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Build the Docker image from source","url":"https://github.com/igorski/bitmappery#docker-based-self-hosted-version","support_level":"official","source_url":"https://github.com/igorski/bitmappery","image":null,"note":"The official README builds an image from the included Dockerfile; it does not list a published image.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/igorski/bitmappery']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://github.com/igorski/bitmappery#docker-based-self-hosted-version']::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'cca3ad06-edce-4e24-943f-aa1dd53def5d'::uuid AND a.slug = 'bitmappery' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bitmappery'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/webtorrent/bittorrent-tracker', 'https://www.npmjs.com/package/bittorrent-tracker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'c7b0b0a7-d367-4881-b094-0a034e04fed0'::uuid AND a.slug = 'bittorrent-tracker' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://webtorrent.io' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/webtorrent/bittorrent-tracker' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/webtorrent/bittorrent-tracker#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/webtorrent' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bittorrent-tracker'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"package","label":"npm package","url":"https://www.npmjs.com/package/bittorrent-tracker","support_level":"official","source_url":"https://github.com/webtorrent/bittorrent-tracker","image":null,"note":"The upstream project documents npm installation and running a tracker server.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/webtorrent/bittorrent-tracker']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY['https://www.npmjs.com/package/bittorrent-tracker']::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'c7b0b0a7-d367-4881-b094-0a034e04fed0'::uuid AND a.slug = 'bittorrent-tracker' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bittorrent-tracker'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://bitwarden.com/help/install-on-premise-linux/',
    install_docs_url = 'https://bitwarden.com/help/install-on-premise-linux/',
    docker_url = 'https://github.com/bitwarden/self-host/pkgs/container/lite',
    docker_image = 'ghcr.io/bitwarden/lite:latest',
    compose_url = 'https://bitwarden.com/help/install-on-premise-linux/',
    deployment_methods = ARRAY['docker', 'compose', 'helm']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/bitwarden/server/blob/HEAD/dev/docker-compose.yml') || ARRAY['https://bitwarden.com/help/install-on-premise-linux/', 'https://bitwarden.com/help/install-and-deploy-lite/', 'https://bitwarden.com/help/self-host-with-helm/', 'https://github.com/bitwarden/self-host/pkgs/container/lite']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '7d7abe94-0107-46d1-add6-4826daf3ca39'::uuid AND a.slug = 'bitwarden' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://bitwarden.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bitwarden/server' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bitwarden/server#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/bitwarden' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.data_source_urls IS NOT DISTINCT FROM ARRAY['https://bitwarden.com', 'https://bitwarden.com/', 'https://github.com/bitwarden/server', 'https://github.com/bitwarden/server/blob/HEAD/dev/docker-compose.yml', 'https://github.com/bitwarden/server#readme', 'https://openalternative.co/bitwarden', 'https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md', 'https://raw.githubusercontent.com/bitwarden/server/HEAD/README.md', 'https://selfhostedworld.com/software/bitwarden', 'https://selfhst.github.io/cdn/directory/software.json']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bitwarden'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"compose","label":"Standard Linux Docker deployment","url":"https://bitwarden.com/help/install-on-premise-linux/","support_level":"official","source_url":"https://bitwarden.com/help/install-on-premise-linux/","image":null,"note":"The official guide uses its setup script to deploy and manage the standard Docker Compose server.","sort_order":10},{"method":"docker","label":"Bitwarden Lite Docker image","url":"https://github.com/bitwarden/self-host/pkgs/container/lite","support_level":"official","source_url":"https://bitwarden.com/help/install-and-deploy-lite/","image":"ghcr.io/bitwarden/lite:latest","note":"Official Lite deployment docs name ghcr.io/bitwarden/lite as the container image.","sort_order":20},{"method":"helm","label":"Official Helm deployment","url":"https://bitwarden.com/help/self-host-with-helm/","support_level":"official","source_url":"https://bitwarden.com/help/self-host-with-helm/","image":null,"note":"Official docs describe the Helm chart deployment.","sort_order":30},{"method":"compose","label":"Bitwarden Lite Docker Compose","url":"https://bitwarden.com/help/install-and-deploy-lite/","support_level":"official","source_url":"https://bitwarden.com/help/install-and-deploy-lite/","image":"ghcr.io/bitwarden/lite:latest","note":"The official Lite guide documents a Docker Compose configuration using this image.","sort_order":40}]'::jsonb,
      source_urls = ARRAY['https://bitwarden.com/help/install-on-premise-linux/', 'https://bitwarden.com/help/install-and-deploy-lite/', 'https://bitwarden.com/help/self-host-with-helm/']::text[],
      checked_at = now(),
      docker_images = ARRAY['ghcr.io/bitwarden/lite:latest']::text[],
      docker_urls = ARRAY['https://github.com/bitwarden/self-host/pkgs/container/lite']::text[],
      compose_urls = ARRAY['https://bitwarden.com/help/install-on-premise-linux/', 'https://bitwarden.com/help/install-and-deploy-lite/']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY['https://bitwarden.com/help/self-host-with-helm/']::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '7d7abe94-0107-46d1-add6-4826daf3ca39'::uuid AND a.slug = 'bitwarden' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bitwarden'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://docs.bknd.io/integration/docker/',
    install_docs_url = 'https://docs.bknd.io/integration/docker/',
    docker_url = 'https://docs.bknd.io/integration/docker/',
    docker_image = NULL,
    compose_url = 'https://docs.bknd.io/integration/docker/',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.bknd.io/integration/docker/', 'https://github.com/bknd-io/bknd']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '5dcb6a25-5b4d-4f51-9b0d-955a3de70cc7'::uuid AND a.slug = 'bknd' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://bknd.io' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bknd-io/bknd' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bknd-io/bknd#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/bknd-io' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/bknd-io/bknd/blob/HEAD/docker/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bknd'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker setup guide","url":"https://docs.bknd.io/integration/docker/","support_level":"official","source_url":"https://docs.bknd.io/integration/docker/","image":null,"note":"Official Docker guide provides build and run commands; the image is built locally from the project Dockerfile.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://docs.bknd.io/integration/docker/","support_level":"official","source_url":"https://docs.bknd.io/integration/docker/","image":null,"note":"The same official guide includes a Compose build-from-source example.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://docs.bknd.io/integration/docker/']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://docs.bknd.io/integration/docker/']::text[],
      compose_urls = ARRAY['https://docs.bknd.io/integration/docker/']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '5dcb6a25-5b4d-4f51-9b0d-955a3de70cc7'::uuid AND a.slug = 'bknd' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bknd'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://0xerr0r.github.io/blocky/latest/installation/',
    install_docs_url = 'https://0xerr0r.github.io/blocky/latest/installation/',
    docker_url = 'https://hub.docker.com/r/spx01/blocky',
    docker_image = 'spx01/blocky:latest',
    compose_url = 'https://0xerr0r.github.io/blocky/latest/installation/',
    deployment_methods = ARRAY['docker', 'compose', 'binary']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://0xerr0r.github.io/blocky/latest/installation/', 'https://hub.docker.com/r/spx01/blocky', 'https://github.com/0xERR0R/blocky/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '8e117f09-18cb-41b0-bef0-c8ef496f3a14'::uuid AND a.slug = 'blocky' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://0xerr0r.github.io/blocky' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/0xERR0R/blocky' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/0xERR0R/blocky#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/0xERR0R' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/0xERR0R/blocky/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for blocky'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/spx01/blocky","support_level":"official","source_url":"https://0xerr0r.github.io/blocky/latest/installation/","image":"spx01/blocky:latest","note":"The official guide names Docker Hub and GHCR images and gives Docker run instructions.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://0xerr0r.github.io/blocky/latest/installation/","support_level":"official","source_url":"https://0xerr0r.github.io/blocky/latest/installation/","image":"spx01/blocky:latest","note":"The official installation guide includes Compose configuration.","sort_order":20},{"method":"binary","label":"Standalone binary","url":"https://github.com/0xERR0R/blocky/releases","support_level":"official","source_url":"https://0xerr0r.github.io/blocky/latest/installation/","image":null,"note":"The official guide links downloadable standalone binaries for supported architectures.","sort_order":30}]'::jsonb,
      source_urls = ARRAY['https://0xerr0r.github.io/blocky/latest/installation/']::text[],
      checked_at = now(),
      docker_images = ARRAY['spx01/blocky:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/spx01/blocky']::text[],
      compose_urls = ARRAY['https://0xerr0r.github.io/blocky/latest/installation/']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY['https://github.com/0xERR0R/blocky/releases']::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '8e117f09-18cb-41b0-bef0-c8ef496f3a14'::uuid AND a.slug = 'blocky' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for blocky'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://docs.bludit.com/en/getting-started/installation-guide',
    install_docs_url = 'https://docs.bludit.com/en/getting-started/installation-guide',
    docker_url = 'https://hub.docker.com/r/bludit/docker',
    docker_image = 'bludit/docker:latest',
    deployment_methods = ARRAY['docker', 'native']::text[],
    docker_support = 'official',
    compose_support = 'false',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.bludit.com/en/getting-started/installation-guide', 'https://hub.docker.com/r/bludit/docker', 'https://www.bludit.com/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '316c2694-2267-4891-ad54-37b38de10896'::uuid AND a.slug = 'bludit' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://www.bludit.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bludit/bludit' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bludit/bludit#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/bludit' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bludit'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/bludit/docker","support_level":"official","source_url":"https://docs.bludit.com/en/getting-started/installation-guide","image":"bludit/docker:latest","note":"The official guide identifies bludit/docker:latest as the Docker image.","sort_order":10},{"method":"native","label":"Web server installation","url":"https://www.bludit.com/","support_level":"official","source_url":"https://docs.bludit.com/en/getting-started/installation-guide","image":null,"note":"The official installation guide links the downloadable ZIP and explains manual web server installation.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://docs.bludit.com/en/getting-started/installation-guide']::text[],
      checked_at = now(),
      docker_images = ARRAY['bludit/docker:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/bludit/docker']::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY['https://www.bludit.com/']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '316c2694-2267-4891-ad54-37b38de10896'::uuid AND a.slug = 'bludit' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bludit'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://blueirissoftware.com/', 'https://blueirissoftware.com/BlueIris.PDF']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '072c30d7-21b1-46e8-9456-9f3c5f7e9042'::uuid AND a.slug = 'blue-iris' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://blueirissoftware.com/' AND a.source_code_url IS NOT DISTINCT FROM NULL AND a.install_docs_url IS NOT DISTINCT FROM 'https://blueirissoftware.com/BlueIris.PDF' AND a.publisher_url IS NOT DISTINCT FROM 'https://blueirissoftware.com/' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['package']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for blue-iris'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"package","label":"Windows installer","url":"https://blueirissoftware.com/","support_level":"official","source_url":"https://blueirissoftware.com/","image":null,"note":"The official site links the Blue Iris installer and documents Windows service operation.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://blueirissoftware.com/']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY['https://blueirissoftware.com/']::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '072c30d7-21b1-46e8-9456-9f3c5f7e9042'::uuid AND a.slug = 'blue-iris' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for blue-iris'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://docs.bluecherrydvr.com/server-installation',
    docs_url = 'https://docs.bluecherrydvr.com/server-installation',
    install_docs_url = 'https://docs.bluecherrydvr.com/server-installation',
    docker_url = 'https://docs.bluecherrydvr.com/server-installation',
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['docker', 'package']::text[],
    docker_support = 'official',
    compose_support = 'false',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.bluecherrydvr.com/server-installation', 'https://github.com/bluecherrydvr/bluecherry-apps']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '50132388-54c9-4088-934a-db7f89f29f09'::uuid AND a.slug = 'bluecherry' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/bluecherrydvr/bluecherry-apps' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/bluecherrydvr/bluecherry-apps' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bluecherrydvr/bluecherry-apps#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/bluecherrydvr' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/bluecherrydvr/bluecherry-apps/blob/HEAD/actions/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bluecherry'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker server installation","url":"https://docs.bluecherrydvr.com/server-installation","support_level":"official","source_url":"https://docs.bluecherrydvr.com/server-installation","image":null,"note":"Official server docs recommend Docker and provide the deployment instructions.","sort_order":10},{"method":"package","label":"Linux package installation","url":"https://docs.bluecherrydvr.com/server-installation","support_level":"official","source_url":"https://docs.bluecherrydvr.com/server-installation","image":null,"note":"Official server docs also describe package installation for supported Debian/Ubuntu systems.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://docs.bluecherrydvr.com/server-installation']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://docs.bluecherrydvr.com/server-installation']::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY['https://docs.bluecherrydvr.com/server-installation']::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '50132388-54c9-4088-934a-db7f89f29f09'::uuid AND a.slug = 'bluecherry' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bluecherry'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://hub.docker.com/r/thewicklowwolf/bookbounty',
    docker_image = 'thewicklowwolf/bookbounty:latest',
    compose_url = 'https://hub.docker.com/r/thewicklowwolf/bookbounty',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://hub.docker.com/r/thewicklowwolf/eBookBuddy') || ARRAY['https://github.com/TheWicklowWolf/BookBounty', 'https://hub.docker.com/r/thewicklowwolf/bookbounty']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'a10de427-8fef-4a1f-8c76-0be80fddb4a3'::uuid AND a.slug = 'bookbounty' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/TheWicklowWolf/BookBounty' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/TheWicklowWolf/BookBounty' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/TheWicklowWolf/BookBounty#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/TheWicklowWolf' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/TheWicklowWolf/BookBounty/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.data_source_urls IS NOT DISTINCT FROM ARRAY['https://forums.unraid.net/topic/122788-support-jpdvm2014-templates/#comment-1400719', 'https://github.com/thewicklowwolf/bookbounty', 'https://github.com/TheWicklowWolf/BookBounty', 'https://github.com/TheWicklowWolf/BookBounty/blob/HEAD/Dockerfile', 'https://github.com/TheWicklowWolf/BookBounty#readme', 'https://hub.docker.com/r/thewicklowwolf/bookbounty', 'https://hub.docker.com/r/thewicklowwolf/eBookBuddy', 'https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md', 'https://raw.githubusercontent.com/JPDVM2014/unraid-templates/main/bookbounty.xml', 'https://raw.githubusercontent.com/JPDVM2014/unraid-templates/main/ebookbuddy.xml', 'https://raw.githubusercontent.com/TheWicklowWolf/BookBounty/HEAD/README.md', 'https://selfhostedworld.com/software/bookbounty']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bookbounty'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/thewicklowwolf/bookbounty","support_level":"official","source_url":"https://github.com/TheWicklowWolf/BookBounty","image":"thewicklowwolf/bookbounty:latest","note":"The upstream README documents the maintainer''s Docker Hub image.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://hub.docker.com/r/thewicklowwolf/bookbounty","support_level":"official","source_url":"https://github.com/TheWicklowWolf/BookBounty","image":"thewicklowwolf/bookbounty:latest","note":"The upstream project documents Compose use with its image.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://github.com/TheWicklowWolf/BookBounty']::text[],
      checked_at = now(),
      docker_images = ARRAY['thewicklowwolf/bookbounty:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/thewicklowwolf/bookbounty']::text[],
      compose_urls = ARRAY['https://hub.docker.com/r/thewicklowwolf/bookbounty']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'a10de427-8fef-4a1f-8c76-0be80fddb4a3'::uuid AND a.slug = 'bookbounty' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bookbounty'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://hub.docker.com/r/hrbingr/bookhaven',
    docker_image = 'hrbingr/bookhaven:latest',
    compose_url = 'https://github.com/HrBingR/BookHaven',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/HrBingR/BookHaven', 'https://hub.docker.com/r/hrbingr/bookhaven']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '88937433-8175-496f-a7e1-e99be488d4da'::uuid AND a.slug = 'bookhaven' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/HrBingR/BookHaven' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/HrBingR/BookHaven' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/HrBingR/BookHaven#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/HrBingR' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/HrBingR/BookHaven/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bookhaven'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/hrbingr/bookhaven","support_level":"official","source_url":"https://github.com/HrBingR/BookHaven","image":"hrbingr/bookhaven:latest","note":"The upstream README and Docker Hub page identify the maintainer''s image.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://hub.docker.com/r/hrbingr/bookhaven","support_level":"official","source_url":"https://github.com/HrBingR/BookHaven","image":"hrbingr/bookhaven:latest","note":"The official repository documents Compose deployment using this image.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://github.com/HrBingR/BookHaven']::text[],
      checked_at = now(),
      docker_images = ARRAY['hrbingr/bookhaven:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/hrbingr/bookhaven']::text[],
      compose_urls = ARRAY['https://hub.docker.com/r/hrbingr/bookhaven']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '88937433-8175-496f-a7e1-e99be488d4da'::uuid AND a.slug = 'bookhaven' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bookhaven'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://github.com/BookHeaven/BookHeaven.Server',
    install_docs_url = 'https://github.com/BookHeaven/BookHeaven.Server',
    docker_url = 'https://github.com/BookHeaven/BookHeaven.Server/pkgs/container/bookheaven-server',
    docker_image = 'ghcr.io/bookheaven/bookheaven-server:latest',
    compose_url = 'https://github.com/BookHeaven/BookHeaven.Server',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_support = 'official',
    compose_support = 'true',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/BookHeaven/BookHeaven.Server', 'https://github.com/orgs/BookHeaven/packages/container/package/bookheaven-server']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '73d1aae6-0c27-4af5-a199-c8318e654c3e'::uuid AND a.slug = 'bookheaven' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://bookheaven.ggarrido.dev' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/BookHeaven/BookHeaven.Server' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/BookHeaven/BookHeaven.Server#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/BookHeaven' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/BookHeaven/BookHeaven.Server/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bookheaven'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"docker","label":"Docker image","url":"https://github.com/orgs/BookHeaven/packages/container/package/bookheaven-server","support_level":"official","source_url":"https://github.com/BookHeaven/BookHeaven.Server","image":"ghcr.io/bookheaven/bookheaven-server:latest","note":"The upstream README documents its GHCR image and Docker deployment.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://github.com/BookHeaven/BookHeaven.Server","support_level":"official","source_url":"https://github.com/BookHeaven/BookHeaven.Server","image":"ghcr.io/bookheaven/bookheaven-server:latest","note":"The official README includes a Compose service using the GHCR image and persistent data path.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://github.com/BookHeaven/BookHeaven.Server']::text[],
      checked_at = now(),
      docker_images = ARRAY['ghcr.io/bookheaven/bookheaven-server:latest']::text[],
      docker_urls = ARRAY['https://github.com/orgs/BookHeaven/packages/container/package/bookheaven-server']::text[],
      compose_urls = ARRAY['https://github.com/BookHeaven/BookHeaven.Server']::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '73d1aae6-0c27-4af5-a199-c8318e654c3e'::uuid AND a.slug = 'bookheaven' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bookheaven'; END IF;
  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://getbor.dev',
    docs_url = 'https://getbor.dev/docs/server/',
    install_docs_url = 'https://getbor.dev/docs/server/',
    deployment_methods = ARRAY['package']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://getbor.dev/download/', 'https://getbor.dev/docs/server/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'eee23821-48af-4efa-87bd-433cb306f1a5'::uuid AND a.slug = 'bor' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM NULL AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/VuteTech/bor' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/VuteTech/bor#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/VuteTech' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bor'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET options = '[{"method":"package","label":"Linux packages","url":"https://getbor.dev/download/","support_level":"official","source_url":"https://getbor.dev/download/","image":null,"note":"The official download page provides Bor Server/Agent installation packages for supported Linux distributions.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://getbor.dev/download/']::text[],
      checked_at = now(),
      docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY[]::text[],
      truenas_scale_urls = ARRAY[]::text[],
      unraid_urls = ARRAY[]::text[],
      umbrel_urls = ARRAY[]::text[],
      yunohost_urls = ARRAY[]::text[],
      casaos_urls = ARRAY[]::text[],
      runtipi_urls = ARRAY[]::text[],
      cosmos_urls = ARRAY[]::text[],
      openmediavault_urls = ARRAY[]::text[],
      synology_urls = ARRAY[]::text[],
      qnap_urls = ARRAY[]::text[],
      proxmox_urls = ARRAY[]::text[],
      home_assistant_os_urls = ARRAY[]::text[],
      kubernetes_urls = ARRAY[]::text[],
      helm_urls = ARRAY[]::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY['https://getbor.dev/download/']::text[],
      other_urls = ARRAY[]::text[],
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'eee23821-48af-4efa-87bd-433cb306f1a5'::uuid AND a.slug = 'bor' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bor'; END IF;
END $$;

