-- Source-backed install options for the S batch. Includes manually verified installer routes and current SFTPGo docs.
DO $$
BEGIN
  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://docs.safebucket.io/getting-started/local-lite-deployment/',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_url = 'https://github.com/safebucket/safebucket/pkgs/container/safebucket',
    docker_image = 'ghcr.io/safebucket/safebucket:main',
    compose_url = 'https://docs.safebucket.io/getting-started/local-lite-deployment/',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/safebucket/safebucket/pkgs/container/safebucket', 'https://docs.safebucket.io/getting-started/local-lite-deployment/']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'e53f3035-7ee4-4411-9880-2da01d83ed4a'::uuid AND a.slug = 'safebucket' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://docs.safebucket.io' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/safebucket/safebucket' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/safebucket/safebucket#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/safebucket' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for safebucket'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['ghcr.io/safebucket/safebucket:main']::text[],
      docker_urls = ARRAY['https://github.com/safebucket/safebucket/pkgs/container/safebucket']::text[],
      compose_urls = ARRAY['https://docs.safebucket.io/getting-started/local-lite-deployment/']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://github.com/safebucket/safebucket/pkgs/container/safebucket","support_level":"official","source_url":"https://github.com/safebucket/safebucket/pkgs/container/safebucket","image":"ghcr.io/safebucket/safebucket:main","note":"Publisher-owned GHCR package; use the main tag.","sort_order":10},{"method":"compose","label":"Local Docker Compose setup","url":"https://docs.safebucket.io/getting-started/local-lite-deployment/","support_level":"official","source_url":"https://docs.safebucket.io/getting-started/local-lite-deployment/","image":null,"note":"Official local-lite setup uses Compose; its page distinguishes this from the fuller production setup.","sort_order":21}]'::jsonb,
      source_urls = ARRAY['https://github.com/safebucket/safebucket/pkgs/container/safebucket', 'https://docs.safebucket.io/getting-started/local-lite-deployment/']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'e53f3035-7ee4-4411-9880-2da01d83ed4a'::uuid AND a.slug = 'safebucket' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for safebucket'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://docs.sandstorm.io/en/latest/install/',
    deployment_methods = ARRAY['native', 'docker']::text[],
    docker_url = 'https://docs.sandstorm.io/en/latest/install/',
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'official',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.sandstorm.io/en/latest/install/']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '33d48f29-d4e9-48e6-9715-049fee11962d'::uuid AND a.slug = 'sandstorm' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://sandstorm.org' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/sandstorm-io/sandstorm' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/sandstorm-io/sandstorm#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/sandstorm-io' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for sandstorm'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://docs.sandstorm.io/en/latest/install/']::text[],
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
      native_urls = ARRAY['https://docs.sandstorm.io/en/latest/install/']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"native","label":"Linux install script","url":"https://docs.sandstorm.io/en/latest/install/","support_level":"official","source_url":"https://docs.sandstorm.io/en/latest/install/","image":null,"note":"The guide documents the HTTPS-verified install script and signature-verified alternatives.","sort_order":170},{"method":"docker","label":"Docker setup guide","url":"https://docs.sandstorm.io/en/latest/install/","support_level":"official","source_url":"https://docs.sandstorm.io/en/latest/install/","image":null,"note":"The guide documents a Docker procedure but recommends running outside Docker; there is no Sandstorm image.","sort_order":11}]'::jsonb,
      source_urls = ARRAY['https://docs.sandstorm.io/en/latest/install/']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '33d48f29-d4e9-48e6-9715-049fee11962d'::uuid AND a.slug = 'sandstorm' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for sandstorm'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://sayr.io/docs/self-hosting/get-started',
    install_docs_url = 'https://sayr.io/docs/self-hosting/get-started',
    deployment_methods = ARRAY['compose']::text[],
    compose_url = 'https://sayr.io/docs/self-hosting/get-started',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://sayr.io/docs/self-hosting/get-started']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '34da8f2c-2d6a-49ab-9abd-657766f819e1'::uuid AND a.slug = 'sayr' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://sayr.io' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/dorasto/sayr' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/dorasto/sayr' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/dorasto' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for sayr'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY['https://sayr.io/docs/self-hosting/get-started']::text[],
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
      options = '[{"method":"compose","label":"Docker Compose setup","url":"https://sayr.io/docs/self-hosting/get-started","support_level":"official","source_url":"https://sayr.io/docs/self-hosting/get-started","image":null,"note":"Official self-host guide uses Compose and publisher GHCR images for the services.","sort_order":20}]'::jsonb,
      source_urls = ARRAY['https://sayr.io/docs/self-hosting/get-started']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '34da8f2c-2d6a-49ab-9abd-657766f819e1'::uuid AND a.slug = 'sayr' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for sayr'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://scalar.com/products/api-references/integrations/docker',
    install_docs_url = 'https://scalar.com/products/api-references/integrations/docker',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_url = 'https://scalar.com/products/api-references/integrations/docker',
    docker_image = 'scalarapi/api-reference:latest',
    compose_url = 'https://scalar.com/products/api-references/integrations/docker',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://scalar.com/products/api-references/integrations/docker']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'e044075a-c80c-4338-986a-aa6fd0818797'::uuid AND a.slug = 'scalar' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://scalar.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/scalar/scalar' AND a.install_docs_url IS NOT DISTINCT FROM 'https://guides.scalar.com/scalar/scalar-api-references/integrations/docker' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/scalar' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for scalar'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['scalarapi/api-reference:latest']::text[],
      docker_urls = ARRAY['https://scalar.com/products/api-references/integrations/docker']::text[],
      compose_urls = ARRAY['https://scalar.com/products/api-references/integrations/docker']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://scalar.com/products/api-references/integrations/docker","support_level":"official","source_url":"https://scalar.com/products/api-references/integrations/docker","image":"scalarapi/api-reference:latest","note":"Official Docker guide provides the image and run command.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://scalar.com/products/api-references/integrations/docker","support_level":"official","source_url":"https://scalar.com/products/api-references/integrations/docker","image":"scalarapi/api-reference:latest","note":"The same official guide includes a Compose example.","sort_order":21}]'::jsonb,
      source_urls = ARRAY['https://scalar.com/products/api-references/integrations/docker']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'e044075a-c80c-4338-986a-aa6fd0818797'::uuid AND a.slug = 'scalar' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for scalar'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://scm-manager.org/docs/latest/en/installation/docker/',
    install_docs_url = 'https://scm-manager.org/docs/latest/en/installation/docker/',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_url = 'https://hub.docker.com/r/scmmanager/scm-manager',
    docker_image = 'scmmanager/scm-manager:latest',
    compose_url = 'https://scm-manager.org/docs/latest/en/installation/docker/',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://scm-manager.org/docs/latest/en/installation/docker/', 'https://hub.docker.com/r/scmmanager/scm-manager']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'ce2bff9a-f3d5-4433-beb2-a007ec1e40e7'::uuid AND a.slug = 'scm-manager' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://scm-manager.org' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/scm-manager/scm-manager' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/scm-manager/scm-manager#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/scm-manager' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for scm-manager'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['scmmanager/scm-manager:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/scmmanager/scm-manager']::text[],
      compose_urls = ARRAY['https://scm-manager.org/docs/latest/en/installation/docker/']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/scmmanager/scm-manager","support_level":"official","source_url":"https://scm-manager.org/docs/latest/en/installation/docker/","image":"scmmanager/scm-manager:latest","note":"The official Docker guide documents the publisher image.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://scm-manager.org/docs/latest/en/installation/docker/","support_level":"official","source_url":"https://scm-manager.org/docs/latest/en/installation/docker/","image":"scmmanager/scm-manager:latest","note":"Official guide includes a Compose configuration and persistent home volume.","sort_order":21}]'::jsonb,
      source_urls = ARRAY['https://scm-manager.org/docs/latest/en/installation/docker/', 'https://hub.docker.com/r/scmmanager/scm-manager']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'ce2bff9a-f3d5-4433-beb2-a007ec1e40e7'::uuid AND a.slug = 'scm-manager' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for scm-manager'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://github.com/screego/server/pkgs/container/server',
    deployment_methods = ARRAY['docker']::text[],
    docker_image = 'ghcr.io/screego/server:1.12.5',
    compose_url = NULL,
    docker_support = 'official',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/screego/server/pkgs/container/server']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '2c426122-1b1e-45b7-a0cf-816ed1f90451'::uuid AND a.slug = 'screego' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://app.screego.net' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/screego/server' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/screego/server#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/screego' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/screego/server/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for screego'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['ghcr.io/screego/server:1.12.5']::text[],
      docker_urls = ARRAY['https://github.com/screego/server/pkgs/container/server']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://github.com/screego/server/pkgs/container/server","support_level":"official","source_url":"https://github.com/screego/server/pkgs/container/server","image":"ghcr.io/screego/server:1.12.5","note":"Publisher-owned GHCR package; current package page lists tag 1.12.5.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/screego/server/pkgs/container/server']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2c426122-1b1e-45b7-a0cf-816ed1f90451'::uuid AND a.slug = 'screego' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for screego'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://github.com/ellite/scrob#docker-compose',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_url = 'https://hub.docker.com/r/bellamy/scrob',
    docker_image = 'bellamy/scrob:latest',
    compose_url = 'https://github.com/ellite/scrob#docker-compose',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://scrob.app/', 'https://github.com/ellite/scrob#readme', 'https://github.com/ellite/scrob#docker-compose', 'https://hub.docker.com/r/bellamy/scrob']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'ffa56f3d-8995-4cad-b2fe-20e1629960cc'::uuid AND a.slug = 'scrob' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://scrob.app' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/ellite/scrob' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/ellite/scrob#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/ellite' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for scrob'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['bellamy/scrob:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/bellamy/scrob']::text[],
      compose_urls = ARRAY['https://github.com/ellite/scrob#docker-compose']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/bellamy/scrob","support_level":"official","source_url":"https://github.com/ellite/scrob#readme","image":"bellamy/scrob:latest","note":"The official project README identifies this Docker Hub image and a GHCR mirror.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://github.com/ellite/scrob#docker-compose","support_level":"official","source_url":"https://github.com/ellite/scrob#docker-compose","image":null,"note":"The official README gives a working Compose setup, including PostgreSQL and persistent volumes.","sort_order":21}]'::jsonb,
      source_urls = ARRAY['https://scrob.app/', 'https://github.com/ellite/scrob#readme', 'https://github.com/ellite/scrob#docker-compose', 'https://hub.docker.com/r/bellamy/scrob']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'ffa56f3d-8995-4cad-b2fe-20e1629960cc'::uuid AND a.slug = 'scrob' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for scrob'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://github.com/5rahim/seanime/releases',
    deployment_methods = ARRAY['binary', 'docker']::text[],
    docker_url = 'https://hub.docker.com/r/umagistr/seanime',
    docker_image = 'umagistr/seanime:latest',
    compose_url = NULL,
    docker_support = 'community',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/5rahim/seanime/releases', 'https://hub.docker.com/r/umagistr/seanime']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '81ada5eb-25e2-40b7-9b02-87ba5be740ac'::uuid AND a.slug = 'seanime' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://seanime.app' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/5rahim/seanime' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/5rahim/seanime#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/5rahim' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for seanime'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['umagistr/seanime:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/umagistr/seanime']::text[],
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
      binary_urls = ARRAY['https://github.com/5rahim/seanime/releases']::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"binary","label":"Official release downloads","url":"https://github.com/5rahim/seanime/releases","support_level":"official","source_url":"https://github.com/5rahim/seanime/releases","image":null,"note":"The upstream release page provides downloadable builds for supported platforms.","sort_order":180},{"method":"docker","label":"Community Docker image","url":"https://hub.docker.com/r/umagistr/seanime","support_level":"community","source_url":"https://hub.docker.com/r/umagistr/seanime","image":"umagistr/seanime:latest","note":"Community-maintained multi-architecture image from umagistr; no upstream endorsement appears on the image page.","sort_order":11}]'::jsonb,
      source_urls = ARRAY['https://github.com/5rahim/seanime/releases', 'https://hub.docker.com/r/umagistr/seanime']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '81ada5eb-25e2-40b7-9b02-87ba5be740ac'::uuid AND a.slug = 'seanime' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for seanime'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://secluso.com/build-your-own',
    docker_url = NULL,
    docker_image = NULL,
    deployment_methods = ARRAY['binary']::text[],
    compose_url = NULL,
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://secluso.com/build-your-own', 'https://github.com/secluso/core/releases']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '4125a6ad-7642-4c03-864a-5cc9f4021b76'::uuid AND a.slug = 'secluso' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://secluso.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/secluso/core' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/secluso/core#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/secluso' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/secluso/core/blob/HEAD/releases/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for secluso'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
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
      binary_urls = ARRAY['https://github.com/secluso/core/releases']::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"binary","label":"Build-your-own release tool","url":"https://github.com/secluso/core/releases","support_level":"official","source_url":"https://secluso.com/build-your-own","image":null,"note":"The publisher guide directs users to the release tool used to prepare a Raspberry Pi OS image.","sort_order":180}]'::jsonb,
      source_urls = ARRAY['https://secluso.com/build-your-own', 'https://github.com/secluso/core/releases']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '4125a6ad-7642-4c03-864a-5cc9f4021b76'::uuid AND a.slug = 'secluso' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for secluso'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://hub.docker.com/r/secrover/secrover',
    deployment_methods = ARRAY['docker']::text[],
    docker_image = 'secrover/secrover:latest',
    compose_url = NULL,
    docker_support = 'official',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Secrover/Secrover', 'https://hub.docker.com/r/secrover/secrover']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '570f0bbe-07d2-4e78-980f-72546c1b91db'::uuid AND a.slug = 'secrover' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://secrover.org' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/Secrover/Secrover' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Secrover/Secrover#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/Secrover' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/Secrover/Secrover/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for secrover'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['secrover/secrover:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/secrover/secrover']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/secrover/secrover","support_level":"official","source_url":"https://github.com/Secrover/Secrover","image":"secrover/secrover:latest","note":"Upstream instructions use the same publisher Docker Hub image.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/Secrover/Secrover', 'https://hub.docker.com/r/secrover/secrover']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '570f0bbe-07d2-4e78-980f-72546c1b91db'::uuid AND a.slug = 'secrover' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for secrover'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://docs.usesecuro.com/docs/deployment',
    install_docs_url = 'https://docs.usesecuro.com/docs/deployment',
    deployment_methods = ARRAY['compose', 'helm']::text[],
    compose_url = 'https://docs.usesecuro.com/docs/deployment/docker',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.usesecuro.com/docs/deployment/docker', 'https://docs.usesecuro.com/docs/deployment/kubernetes']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '704fcf85-eb83-46d2-b98a-060670759474'::uuid AND a.slug = 'securo' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://usesecuro.com/' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/securo-finance/securo' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/securo-finance/securo#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/securo-finance' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for securo'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY['https://docs.usesecuro.com/docs/deployment/docker']::text[],
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
      helm_urls = ARRAY['https://docs.usesecuro.com/docs/deployment/kubernetes']::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"compose","label":"Docker Compose production setup","url":"https://docs.usesecuro.com/docs/deployment/docker","support_level":"official","source_url":"https://docs.usesecuro.com/docs/deployment/docker","image":null,"note":"Official production guide uses prebuilt GHCR images and Docker Compose.","sort_order":20},{"method":"helm","label":"Official Helm chart","url":"https://docs.usesecuro.com/docs/deployment/kubernetes","support_level":"official","source_url":"https://docs.usesecuro.com/docs/deployment/kubernetes","image":null,"note":"Official guide installs chart oci://ghcr.io/securo-finance/charts/securo.","sort_order":161}]'::jsonb,
      source_urls = ARRAY['https://docs.usesecuro.com/docs/deployment/docker', 'https://docs.usesecuro.com/docs/deployment/kubernetes']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '704fcf85-eb83-46d2-b98a-060670759474'::uuid AND a.slug = 'securo' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for securo'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    website_url = 'https://seekstorm.com/',
    docs_url = 'https://seekstorm.github.io/',
    install_docs_url = 'https://hub.docker.com/r/wolfgarbe/seekstorm_server',
    deployment_methods = ARRAY['docker']::text[],
    docker_url = 'https://hub.docker.com/r/wolfgarbe/seekstorm_server',
    docker_image = 'wolfgarbe/seekstorm_server:latest',
    compose_url = NULL,
    docker_support = 'official',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://hub.docker.com/r/wolfgarbe/seekstorm_server', 'https://github.com/SeekStorm/SeekStorm']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '5b6abaa0-01ea-4163-b28f-88eba794e8da'::uuid AND a.slug = 'seekstorm' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM NULL AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/SeekStorm/SeekStorm' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/SeekStorm/SeekStorm#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/SeekStorm' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for seekstorm'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['wolfgarbe/seekstorm_server:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/wolfgarbe/seekstorm_server']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/wolfgarbe/seekstorm_server","support_level":"official","source_url":"https://hub.docker.com/r/wolfgarbe/seekstorm_server","image":"wolfgarbe/seekstorm_server:latest","note":"The publisher Docker Hub page provides the server image and run command.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://hub.docker.com/r/wolfgarbe/seekstorm_server', 'https://github.com/SeekStorm/SeekStorm']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '5b6abaa0-01ea-4163-b28f-88eba794e8da'::uuid AND a.slug = 'seekstorm' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for seekstorm'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://shb.skarabox.com/usage.html',
    install_docs_url = 'https://shb.skarabox.com/usage.html',
    deployment_methods = ARRAY['native']::text[],
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://shb.skarabox.com/usage.html']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '39e6fabf-83ee-4986-a411-44d6c2442aae'::uuid AND a.slug = 'self-host-blocks' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://shb.skarabox.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/ibizaman/selfhostblocks' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/ibizaman/selfhostblocks#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/ibizaman' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for self-host-blocks'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
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
      native_urls = ARRAY['https://shb.skarabox.com/usage.html']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"native","label":"NixOS flake setup","url":"https://shb.skarabox.com/usage.html","support_level":"official","source_url":"https://shb.skarabox.com/usage.html","image":null,"note":"Official guide demonstrates NixOS flake setup and deployment with NixOS-Rebuild, Colmena, and deploy-rs.","sort_order":170}]'::jsonb,
      source_urls = ARRAY['https://shb.skarabox.com/usage.html']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '39e6fabf-83ee-4986-a411-44d6c2442aae'::uuid AND a.slug = 'self-host-blocks' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for self-host-blocks'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://github.com/hintjen/selfhosted-gateway#readme',
    install_docs_url = 'https://github.com/hintjen/selfhosted-gateway#readme',
    compose_support = FALSE,
    deployment_methods = ARRAY['docker']::text[],
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/hintjen/selfhosted-gateway#readme']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'b46f9dc8-9305-4cf8-98e5-b063eae6b231'::uuid AND a.slug = 'self-hosted-gateway' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://gethomerun.app' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/hintjen/selfhosted-gateway' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/hintjen/selfhosted-gateway#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/hintjen' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/hintjen/selfhosted-gateway/blob/HEAD/src/gateway/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for self-hosted-gateway'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
      docker_urls = ARRAY['https://github.com/hintjen/selfhosted-gateway#readme']::text[],
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
      options = '[{"method":"docker","label":"Docker build and setup","url":"https://github.com/hintjen/selfhosted-gateway#readme","support_level":"official","source_url":"https://github.com/hintjen/selfhosted-gateway#readme","image":null,"note":"The official README builds and starts the gateway with make docker, make setup, and make gateway.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/hintjen/selfhosted-gateway#readme']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b46f9dc8-9305-4cf8-98e5-b063eae6b231'::uuid AND a.slug = 'self-hosted-gateway' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for self-hosted-gateway'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docker_url = 'https://github.com/selfhst/icons/pkgs/container/icons',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_image = 'ghcr.io/selfhst/icons:latest',
    compose_url = 'https://github.com/selfhst/icons/wiki',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/selfhst/icons/wiki', 'https://github.com/selfhst/icons/pkgs/container/icons']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '9eb089fd-e5e7-4c68-bc38-6a1dff28e1b4'::uuid AND a.slug = 'selfh-st-icons' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://selfh.st/icons' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/selfhst/icons' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/selfhst/icons#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/selfhst' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/selfhst/icons/blob/HEAD/build/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for selfh-st-icons'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['ghcr.io/selfhst/icons:latest']::text[],
      docker_urls = ARRAY['https://github.com/selfhst/icons/pkgs/container/icons']::text[],
      compose_urls = ARRAY['https://github.com/selfhst/icons/wiki']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://github.com/selfhst/icons/pkgs/container/icons","support_level":"official","source_url":"https://github.com/selfhst/icons/wiki","image":"ghcr.io/selfhst/icons:latest","note":"Publisher wiki documents the image and the GHCR package is the install destination.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://github.com/selfhst/icons/wiki","support_level":"official","source_url":"https://github.com/selfhst/icons/wiki","image":"ghcr.io/selfhst/icons:latest","note":"Official wiki provides Compose configuration and environment options.","sort_order":21}]'::jsonb,
      source_urls = ARRAY['https://github.com/selfhst/icons/wiki', 'https://github.com/selfhst/icons/pkgs/container/icons']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '9eb089fd-e5e7-4c68-bc38-6a1dff28e1b4'::uuid AND a.slug = 'selfh-st-icons' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for selfh-st-icons'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://github.com/kossakovsky/selfhost-ai#readme',
    install_docs_url = 'https://github.com/kossakovsky/selfhost-ai#installation',
    deployment_methods = ARRAY['compose']::text[],
    compose_url = 'https://github.com/kossakovsky/selfhost-ai#installation',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/kossakovsky/selfhost-ai#installation']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'fde4ea64-c42d-47d8-887f-11de869f265d'::uuid AND a.slug = 'selfhost-ai' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://github.com/kossakovsky/selfhost-ai#readme' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/kossakovsky/selfhost-ai' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/kossakovsky/selfhost-ai#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/kossakovsky' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for selfhost-ai'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
      docker_urls = ARRAY[]::text[],
      compose_urls = ARRAY['https://github.com/kossakovsky/selfhost-ai#installation']::text[],
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
      options = '[{"method":"compose","label":"Docker Compose stack installer","url":"https://github.com/kossakovsky/selfhost-ai#installation","support_level":"official","source_url":"https://github.com/kossakovsky/selfhost-ai#installation","image":null,"note":"The official installer installs Docker and deploys the selected services with Compose; it requires Ubuntu 24.04 LTS.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://github.com/kossakovsky/selfhost-ai#installation']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'fde4ea64-c42d-47d8-887f-11de869f265d'::uuid AND a.slug = 'selfhost-ai' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for selfhost-ai'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://selfoss.aditu.de/docs/administration/installation/',
    install_docs_url = 'https://selfoss.aditu.de/docs/administration/installation/basic/',
    deployment_methods = ARRAY['native']::text[],
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://selfoss.aditu.de/docs/administration/installation/', 'https://selfoss.aditu.de/docs/administration/installation/basic/']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '3d8c77cd-1444-4cb2-bea2-2372ece7d22d'::uuid AND a.slug = 'selfoss' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://selfoss.aditu.de' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/fossar/selfoss' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/fossar/selfoss#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/fossar' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for selfoss'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
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
      native_urls = ARRAY['https://selfoss.aditu.de/docs/administration/installation/basic/']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"native","label":"Web server installation","url":"https://selfoss.aditu.de/docs/administration/installation/basic/","support_level":"official","source_url":"https://selfoss.aditu.de/docs/administration/installation/","image":null,"note":"Official instructions cover installing the release archive in a PHP web-server environment.","sort_order":170}]'::jsonb,
      source_urls = ARRAY['https://selfoss.aditu.de/docs/administration/installation/', 'https://selfoss.aditu.de/docs/administration/installation/basic/']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '3d8c77cd-1444-4cb2-bea2-2372ece7d22d'::uuid AND a.slug = 'selfoss' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for selfoss'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://semaphoreui.com/docs/getting-started',
    install_docs_url = 'https://semaphoreui.com/docs/getting-started',
    docker_url = 'https://hub.docker.com/r/semaphoreui/semaphore',
    deployment_methods = ARRAY['docker', 'compose', 'package', 'binary', 'helm']::text[],
    docker_image = 'semaphoreui/semaphore:latest',
    compose_url = 'https://semaphoreui.com/docs/getting-started',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://semaphoreui.com/docs/getting-started', 'https://hub.docker.com/r/semaphoreui/semaphore', 'https://github.com/semaphoreui/semaphore/releases']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '62a4ad13-c7ae-4d5e-92b2-7c190e34bdbb'::uuid AND a.slug = 'semaphore-ui' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://semaphoreui.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/semaphoreui/semaphore' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/semaphoreui/semaphore#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/semaphoreui' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/semaphoreui/semaphore/blob/HEAD/deployment/docker/job/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for semaphore-ui'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['semaphoreui/semaphore:latest', 'semaphoreui/semaphore:v2.19.12']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/semaphoreui/semaphore']::text[],
      compose_urls = ARRAY['https://semaphoreui.com/docs/getting-started']::text[],
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
      helm_urls = ARRAY['https://semaphoreui.com/docs/getting-started']::text[],
      native_urls = ARRAY[]::text[],
      binary_urls = ARRAY['https://github.com/semaphoreui/semaphore/releases']::text[],
      package_urls = ARRAY['https://semaphoreui.com/docs/getting-started']::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/semaphoreui/semaphore","support_level":"official","source_url":"https://semaphoreui.com/docs/getting-started","image":"semaphoreui/semaphore:latest","note":"Official Docker Hub package and publisher docs provide the image.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://semaphoreui.com/docs/getting-started","support_level":"official","source_url":"https://semaphoreui.com/docs/getting-started","image":"semaphoreui/semaphore:v2.19.12","note":"Official getting-started guide includes a Compose configuration.","sort_order":21},{"method":"package","label":"Linux packages","url":"https://semaphoreui.com/docs/getting-started","support_level":"official","source_url":"https://semaphoreui.com/docs/getting-started","image":null,"note":"Official guide includes Debian/Ubuntu and RHEL-family packages.","sort_order":192},{"method":"binary","label":"Binary archive","url":"https://github.com/semaphoreui/semaphore/releases","support_level":"official","source_url":"https://semaphoreui.com/docs/getting-started","image":null,"note":"Official guide directs users to release archives for their operating system and architecture.","sort_order":183},{"method":"helm","label":"Official Helm chart","url":"https://semaphoreui.com/docs/getting-started","support_level":"official","source_url":"https://semaphoreui.com/docs/getting-started","image":null,"note":"Guide identifies the semaphoreui/semaphore chart from the official Helm repository.","sort_order":164}]'::jsonb,
      source_urls = ARRAY['https://semaphoreui.com/docs/getting-started', 'https://hub.docker.com/r/semaphoreui/semaphore', 'https://github.com/semaphoreui/semaphore/releases']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '62a4ad13-c7ae-4d5e-92b2-7c190e34bdbb'::uuid AND a.slug = 'semaphore-ui' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for semaphore-ui'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://sendportal.io/docs/v2/getting-started/installation',
    deployment_methods = ARRAY['native']::text[],
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://sendportal.io/docs/v2/getting-started/installation']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '987108e2-24b1-4399-bf57-a20ccdb69989'::uuid AND a.slug = 'sendportal' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://sendportal.io' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/mettle/sendportal' AND a.install_docs_url IS NOT DISTINCT FROM 'https://sendportal.io/docs/v2/getting-started/installation' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/mettle' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for sendportal'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
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
      native_urls = ARRAY['https://sendportal.io/docs/v2/getting-started/installation']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"native","label":"Web server installation","url":"https://sendportal.io/docs/v2/getting-started/installation","support_level":"official","source_url":"https://sendportal.io/docs/v2/getting-started/installation","image":null,"note":"Official v2 installation guide documents the PHP, Composer, and database setup.","sort_order":170}]'::jsonb,
      source_urls = ARRAY['https://sendportal.io/docs/v2/getting-started/installation']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '987108e2-24b1-4399-bf57-a20ccdb69989'::uuid AND a.slug = 'sendportal' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for sendportal'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://seppo.mro.name/en/support/',
    install_docs_url = 'https://seppo.mro.name/downloads',
    deployment_methods = ARRAY['native']::text[],
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://seppo.mro.name/en/support/', 'https://seppo.mro.name/downloads']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '716e33d3-4ee9-475e-88d8-0d41b79817cf'::uuid AND a.slug = 'seppo' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM NULL AND a.source_code_url IS NOT DISTINCT FROM 'https://codeberg.org/seppo/seppo' AND a.install_docs_url IS NOT DISTINCT FROM 'https://seppo.mro.name/downloads' AND a.publisher_url IS NOT DISTINCT FROM 'https://codeberg.org/seppo' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for seppo'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
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
      native_urls = ARRAY['https://seppo.mro.name/downloads']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"native","label":"CGI web host download","url":"https://seppo.mro.name/downloads","support_level":"official","source_url":"https://seppo.mro.name/en/support/","image":null,"note":"Official support instructions describe downloading the single CGI program and installing it on a web host with CGI enabled.","sort_order":170}]'::jsonb,
      source_urls = ARRAY['https://seppo.mro.name/en/support/', 'https://seppo.mro.name/downloads']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '716e33d3-4ee9-475e-88d8-0d41b79817cf'::uuid AND a.slug = 'seppo' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for seppo'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    install_docs_url = 'https://docs.s9y.org/docs/users/getting-started/fresh-installation.html',
    deployment_methods = ARRAY['native']::text[],
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.s9y.org/docs/users/getting-started/fresh-installation.html']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'd15f58e5-cd70-4040-a22d-d5e41454ee3b'::uuid AND a.slug = 'serendipity' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://s9y.org' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/s9y/Serendipity' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/s9y/Serendipity#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/s9y' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for serendipity'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY[]::text[],
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
      native_urls = ARRAY['https://docs.s9y.org/docs/users/getting-started/fresh-installation.html']::text[],
      binary_urls = ARRAY[]::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"native","label":"Web server installation","url":"https://docs.s9y.org/docs/users/getting-started/fresh-installation.html","support_level":"official","source_url":"https://docs.s9y.org/docs/users/getting-started/fresh-installation.html","image":null,"note":"Official guide walks through installing the downloaded archive on a web server.","sort_order":170}]'::jsonb,
      source_urls = ARRAY['https://docs.s9y.org/docs/users/getting-started/fresh-installation.html']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'd15f58e5-cd70-4040-a22d-d5e41454ee3b'::uuid AND a.slug = 'serendipity' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for serendipity'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md',
    install_docs_url = 'https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md',
    deployment_methods = ARRAY['docker', 'compose']::text[],
    docker_url = 'https://github.com/marckohlbrugge/sessy/pkgs/container/sessy',
    docker_image = 'ghcr.io/marckohlbrugge/sessy:main',
    compose_url = 'https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md', 'https://github.com/marckohlbrugge/sessy/pkgs/container/sessy']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'd8771029-54c8-44fa-b557-030fa2847409'::uuid AND a.slug = 'sessy' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://sessy.do' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/marckohlbrugge/sessy' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/marckohlbrugge/sessy' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/marckohlbrugge' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for sessy'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['ghcr.io/marckohlbrugge/sessy:main']::text[],
      docker_urls = ARRAY['https://github.com/marckohlbrugge/sessy/pkgs/container/sessy']::text[],
      compose_urls = ARRAY['https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md']::text[],
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
      options = '[{"method":"docker","label":"Docker image","url":"https://github.com/marckohlbrugge/sessy/pkgs/container/sessy","support_level":"official","source_url":"https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md","image":"ghcr.io/marckohlbrugge/sessy:main","note":"Maintainer''s deployment guide documents this GHCR image and persistent storage.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md","support_level":"official","source_url":"https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md","image":"ghcr.io/marckohlbrugge/sessy:main","note":"Official deployment guide includes a Compose setup.","sort_order":21}]'::jsonb,
      source_urls = ARRAY['https://github.com/marckohlbrugge/sessy/blob/main/docs/docker-deployment.md', 'https://github.com/marckohlbrugge/sessy/pkgs/container/sessy']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'd8771029-54c8-44fa-b557-030fa2847409'::uuid AND a.slug = 'sessy' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for sessy'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://docs.sftpgo.com/latest/',
    install_docs_url = 'https://docs.sftpgo.com/latest/installation/',
    docker_url = 'https://docs.sftpgo.com/latest/docker/',
    deployment_methods = ARRAY['docker', 'package']::text[],
    docker_image = 'drakkan/sftpgo:latest',
    compose_url = NULL,
    docker_support = 'official',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(ARRAY(SELECT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.sftpgo.com/latest/docker/', 'https://docs.sftpgo.com/latest/installation/', 'https://hub.docker.com/r/drakkan/sftpgo']::text[]) AS u WHERE u IS NOT NULL AND u <> ALL(ARRAY['https://docs.sftpgo.com/2.7/docker/', 'https://docs.sftpgo.com/2.7/installation/']::text[]))) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = '6508cf24-7759-4513-bcea-ca888ca643af'::uuid AND a.slug = 'sftpgo-community-edition' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://sftpgo.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/drakkan/sftpgo' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/drakkan/sftpgo#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/drakkan' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for sftpgo-community-edition'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['drakkan/sftpgo:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/drakkan/sftpgo']::text[],
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
      package_urls = ARRAY['https://docs.sftpgo.com/latest/installation/']::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/drakkan/sftpgo","support_level":"official","source_url":"https://docs.sftpgo.com/latest/docker/","image":"drakkan/sftpgo:latest","note":"Official open-source documentation uses the drakkan/sftpgo image; this is the Community Edition route.","sort_order":10},{"method":"package","label":"Linux packages","url":"https://docs.sftpgo.com/latest/installation/","support_level":"official","source_url":"https://docs.sftpgo.com/latest/installation/","image":null,"note":"Official Community Edition installation guide includes native Linux packages.","sort_order":191}]'::jsonb,
      source_urls = ARRAY['https://docs.sftpgo.com/latest/docker/', 'https://docs.sftpgo.com/latest/installation/', 'https://hub.docker.com/r/drakkan/sftpgo']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '6508cf24-7759-4513-bcea-ca888ca643af'::uuid AND a.slug = 'sftpgo-community-edition' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for sftpgo-community-edition'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://sharkord.com/docs/introduction/quick-start',
    install_docs_url = 'https://sharkord.com/docs/introduction/installation/docker',
    docker_url = 'https://hub.docker.com/r/sharkord/sharkord',
    deployment_methods = ARRAY['docker', 'compose', 'binary']::text[],
    docker_image = 'sharkord/sharkord:latest',
    compose_url = 'https://sharkord.com/docs/introduction/installation/docker-compose',
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://sharkord.com/docs/introduction/installation/docker', 'https://sharkord.com/docs/introduction/installation/docker-compose', 'https://sharkord.com/docs/introduction/quick-start', 'https://hub.docker.com/r/sharkord/sharkord', 'https://github.com/Sharkord/sharkord/releases']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'b1d5e459-7fc5-4ea9-8142-c14e0e42e9d5'::uuid AND a.slug = 'sharkord' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://sharkord.com' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/Sharkord/sharkord' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Sharkord/sharkord#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/Sharkord' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/Sharkord/sharkord/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for sharkord'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['sharkord/sharkord:latest']::text[],
      docker_urls = ARRAY['https://hub.docker.com/r/sharkord/sharkord']::text[],
      compose_urls = ARRAY['https://sharkord.com/docs/introduction/installation/docker-compose']::text[],
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
      binary_urls = ARRAY['https://github.com/Sharkord/sharkord/releases']::text[],
      package_urls = ARRAY[]::text[],
      other_urls = ARRAY[]::text[],
      options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/sharkord/sharkord","support_level":"official","source_url":"https://sharkord.com/docs/introduction/installation/docker","image":"sharkord/sharkord:latest","note":"Official Docker guide gives this image and its required ports and data path.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://sharkord.com/docs/introduction/installation/docker-compose","support_level":"official","source_url":"https://sharkord.com/docs/introduction/installation/docker-compose","image":"sharkord/sharkord:latest","note":"Official Compose guide includes the service setup.","sort_order":21},{"method":"binary","label":"Release downloads","url":"https://github.com/Sharkord/sharkord/releases","support_level":"official","source_url":"https://sharkord.com/docs/introduction/quick-start","image":null,"note":"Official quick start links to downloadable release builds.","sort_order":182}]'::jsonb,
      source_urls = ARRAY['https://sharkord.com/docs/introduction/installation/docker', 'https://sharkord.com/docs/introduction/installation/docker-compose', 'https://sharkord.com/docs/introduction/quick-start', 'https://hub.docker.com/r/sharkord/sharkord', 'https://github.com/Sharkord/sharkord/releases']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b1d5e459-7fc5-4ea9-8142-c14e0e42e9d5'::uuid AND a.slug = 'sharkord' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for sharkord'; END IF;

  UPDATE public.self_host_apps AS a
  SET
    docs_url = 'https://docs.shelf.nu/docker',
    install_docs_url = 'https://docs.shelf.nu/docker',
    docker_url = 'https://github.com/Shelf-nu/shelf.nu/pkgs/container/shelf.nu',
    deployment_methods = ARRAY['docker']::text[],
    docker_image = 'ghcr.io/shelf-nu/shelf.nu:latest',
    compose_url = NULL,
    docker_support = 'community',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT u FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.shelf.nu/docker', 'https://github.com/Shelf-nu/shelf.nu/pkgs/container/shelf.nu']::text[]) AS v(u) WHERE u IS NOT NULL ORDER BY u),
    updated_at = now()
  WHERE a.id = 'd499c28c-677e-42ba-96aa-a4d0108552ed'::uuid AND a.slug = 'shelf' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.website_url IS NOT DISTINCT FROM 'https://shelf.nu' AND a.source_code_url IS NOT DISTINCT FROM 'https://github.com/Shelf-nu/shelf.nu' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Shelf-nu/shelf.nu#readme' AND a.publisher_url IS NOT DISTINCT FROM 'https://github.com/Shelf-nu' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/Shelf-nu/shelf.nu/blob/HEAD/apps/webapp/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for shelf'; END IF;
  UPDATE public.self_host_app_install_options AS i
  SET docker_images = ARRAY['ghcr.io/shelf-nu/shelf.nu:latest']::text[],
      docker_urls = ARRAY['https://github.com/Shelf-nu/shelf.nu/pkgs/container/shelf.nu']::text[],
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
      options = '[{"method":"docker","label":"Community Docker image","url":"https://github.com/Shelf-nu/shelf.nu/pkgs/container/shelf.nu","support_level":"community","source_url":"https://docs.shelf.nu/docker","image":"ghcr.io/shelf-nu/shelf.nu:latest","note":"Publisher docs say this Docker setup is community-powered and is not officially supported by Shelf Asset Management Inc.","sort_order":10}]'::jsonb,
      source_urls = ARRAY['https://docs.shelf.nu/docker', 'https://github.com/Shelf-nu/shelf.nu/pkgs/container/shelf.nu']::text[],
      checked_at = now(),
      updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'd499c28c-677e-42ba-96aa-a4d0108552ed'::uuid AND a.slug = 'shelf' AND a.published IS TRUE AND a.self_hosting_status = 'self_hostable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for shelf'; END IF;
END $$;
