-- Source-backed install-option review for 25 D-E apps.
-- Prepared for review; not applied to production.
BEGIN;

DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://offen.github.io/docker-volume-backup/',
    docker_url = 'https://hub.docker.com/r/offen/docker-volume-backup',
    docker_image = 'offen/docker-volume-backup:v2',
    compose_url = 'https://offen.github.io/docker-volume-backup/',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://hub.docker.com/r/offen/docker-volume-backup', 'https://offen.github.io/docker-volume-backup/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://hub.docker.com/r/offen/docker-volume-backup","https://offen.github.io/docker-volume-backup/"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://hub.docker.com/r/offen/docker-volume-backup","https://offen.github.io/docker-volume-backup/"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://hub.docker.com/r/offen/docker-volume-backup","https://offen.github.io/docker-volume-backup/"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'cf113f99-158b-4757-b8d8-b790b022a805'::uuid
    AND a.slug = 'docker-volume-backup'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/offen/docker-volume-backup#readme'
    AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/offen/docker-volume-backup/blob/HEAD/Dockerfile'
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app docker-volume-backup'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/offen/docker-volume-backup","source_url":"https://offen.github.io/docker-volume-backup/","image":"offen/docker-volume-backup:v2","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://offen.github.io/docker-volume-backup/","source_url":"https://offen.github.io/docker-volume-backup/","image":"offen/docker-volume-backup:v2","note":"Official Compose sidecar example.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://hub.docker.com/r/offen/docker-volume-backup', 'https://offen.github.io/docker-volume-backup/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/offen/docker-volume-backup']::text[],
    compose_urls = ARRAY['https://offen.github.io/docker-volume-backup/']::text[],
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
    docker_images = ARRAY['offen/docker-volume-backup:v2']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'cf113f99-158b-4757-b8d8-b790b022a805'::uuid
    AND a.slug = 'docker-volume-backup'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app docker-volume-backup'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/GhostWriters/DockSTARTer#readme',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['native']::text[],
    docker_support = 'none',
    compose_support = FALSE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/GhostWriters/DockSTARTer#readme', 'https://dockstarter.com/basics/command-line-usage/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '4966c57b-5860-4c28-a0ef-548ec9bd3cce'::uuid
    AND a.slug = 'dockstarter'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/GhostWriters/DockSTARTer#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dockstarter'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Shell install","url":"https://github.com/GhostWriters/DockSTARTer#readme","source_url":"https://github.com/GhostWriters/DockSTARTer#readme","image":null,"note":"Installs DockSTARTer on the host; its Compose generator deploys other apps.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/GhostWriters/DockSTARTer#readme', 'https://dockstarter.com/basics/command-line-usage/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    native_urls = ARRAY['https://github.com/GhostWriters/DockSTARTer#readme']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '4966c57b-5860-4c28-a0ef-548ec9bd3cce'::uuid
    AND a.slug = 'dockstarter'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dockstarter'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docmost.com/docs/installation',
    docker_url = 'https://docmost.com/docs/installation',
    docker_image = 'docmost/docmost:latest',
    compose_url = 'https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docmost.com/docs/installation', 'https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://docmost.com/docs/installation","https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://docmost.com/docs/installation","https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://docmost.com/docs/installation","https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '45b7fca6-2f1d-40f9-b239-b21c403f28fe'::uuid
    AND a.slug = 'docmost-community-edition'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/docmost/docmost#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'none'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app docmost-community-edition'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://docmost.com/docs/installation","source_url":"https://docmost.com/docs/installation","image":"docmost/docmost:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml","source_url":"https://docmost.com/docs/installation","image":"docmost/docmost:latest","note":"Stack includes PostgreSQL and Redis.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docmost.com/docs/installation', 'https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://docmost.com/docs/installation']::text[],
    compose_urls = ARRAY['https://raw.githubusercontent.com/docmost/docmost/main/docker-compose.yml']::text[],
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
    docker_images = ARRAY['docmost/docmost:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '45b7fca6-2f1d-40f9-b239-b21c403f28fe'::uuid
    AND a.slug = 'docmost-community-edition'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app docmost-community-edition'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/amerkurev/doku#readme',
    docker_url = 'https://hub.docker.com/r/amerkurev/doku',
    docker_image = 'amerkurev/doku:latest',
    compose_url = NULL,
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/amerkurev/doku#readme', 'https://hub.docker.com/r/amerkurev/doku']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/amerkurev/doku#readme","https://hub.docker.com/r/amerkurev/doku"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://github.com/amerkurev/doku#readme","https://hub.docker.com/r/amerkurev/doku"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '5f74e0e0-2483-4932-a46e-eb9dbb74964a'::uuid
    AND a.slug = 'doku'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/amerkurev/doku#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'none'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app doku'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/amerkurev/doku","source_url":"https://github.com/amerkurev/doku#readme","image":"amerkurev/doku:latest","note":null,"support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/amerkurev/doku#readme', 'https://hub.docker.com/r/amerkurev/doku']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/amerkurev/doku']::text[],
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
    docker_images = ARRAY['amerkurev/doku:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '5f74e0e0-2483-4932-a46e-eb9dbb74964a'::uuid
    AND a.slug = 'doku'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app doku'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://www.dokuwiki.org/install',
    docker_url = 'https://hub.docker.com/r/dokuwiki/dokuwiki',
    docker_image = 'dokuwiki/dokuwiki:stable',
    compose_url = 'https://github.com/dokuwiki/docker/blob/main/docker-compose.yml',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/dokuwiki/docker', 'https://github.com/dokuwiki/docker/blob/main/docker-compose.yml', 'https://hub.docker.com/r/dokuwiki/dokuwiki', 'https://www.dokuwiki.org/install']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/dokuwiki/docker","https://github.com/dokuwiki/docker/blob/main/docker-compose.yml","https://hub.docker.com/r/dokuwiki/dokuwiki","https://www.dokuwiki.org/install"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://github.com/dokuwiki/docker","https://github.com/dokuwiki/docker/blob/main/docker-compose.yml","https://hub.docker.com/r/dokuwiki/dokuwiki","https://www.dokuwiki.org/install"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://github.com/dokuwiki/docker","https://github.com/dokuwiki/docker/blob/main/docker-compose.yml","https://hub.docker.com/r/dokuwiki/dokuwiki","https://www.dokuwiki.org/install"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '9652d49d-65a7-4ecb-a01c-8c3bda4a4d89'::uuid
    AND a.slug = 'dokuwiki'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/dokuwiki/dokuwiki#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dokuwiki'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Manual install","url":"https://www.dokuwiki.org/install","source_url":"https://www.dokuwiki.org/install","image":null,"note":"Official PHP/web server install.","support_level":"official","sort_order":10},{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/dokuwiki/dokuwiki","source_url":"https://github.com/dokuwiki/docker","image":"dokuwiki/dokuwiki:stable","note":null,"support_level":"official","sort_order":20},{"method":"compose","label":"Docker Compose","url":"https://github.com/dokuwiki/docker/blob/main/docker-compose.yml","source_url":"https://github.com/dokuwiki/docker","image":"dokuwiki/dokuwiki:stable","note":null,"support_level":"official","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/dokuwiki/docker', 'https://github.com/dokuwiki/docker/blob/main/docker-compose.yml', 'https://hub.docker.com/r/dokuwiki/dokuwiki', 'https://www.dokuwiki.org/install']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/dokuwiki/dokuwiki']::text[],
    compose_urls = ARRAY['https://github.com/dokuwiki/docker/blob/main/docker-compose.yml']::text[],
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
    native_urls = ARRAY['https://www.dokuwiki.org/install']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['dokuwiki/dokuwiki:stable']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '9652d49d-65a7-4ecb-a01c-8c3bda4a4d89'::uuid
    AND a.slug = 'dokuwiki'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dokuwiki'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://wiki.dolibarr.org/index.php/Installation_/_Setup',
    docker_url = 'https://hub.docker.com/r/dolibarr/dolibarr',
    docker_image = 'dolibarr/dolibarr:latest',
    compose_url = 'https://hub.docker.com/r/dolibarr/dolibarr',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://hub.docker.com/r/dolibarr/dolibarr', 'https://wiki.dolibarr.org/index.php/Installation_/_Setup']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://hub.docker.com/r/dolibarr/dolibarr","https://wiki.dolibarr.org/index.php/Installation_/_Setup"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://hub.docker.com/r/dolibarr/dolibarr","https://wiki.dolibarr.org/index.php/Installation_/_Setup"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://hub.docker.com/r/dolibarr/dolibarr","https://wiki.dolibarr.org/index.php/Installation_/_Setup"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '07b712c3-25b0-489a-99f3-667c04691047'::uuid
    AND a.slug = 'dolibarr'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Dolibarr/dolibarr#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dolibarr'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Manual install","url":"https://wiki.dolibarr.org/index.php/Installation_/_Setup","source_url":"https://wiki.dolibarr.org/index.php/Installation_/_Setup","image":null,"note":"Official PHP/database install.","support_level":"official","sort_order":10},{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/dolibarr/dolibarr","source_url":"https://hub.docker.com/r/dolibarr/dolibarr","image":"dolibarr/dolibarr:latest","note":null,"support_level":"official","sort_order":20},{"method":"compose","label":"Docker Compose","url":"https://hub.docker.com/r/dolibarr/dolibarr","source_url":"https://hub.docker.com/r/dolibarr/dolibarr","image":"dolibarr/dolibarr:latest","note":"Hub page has a Compose example with MariaDB.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://hub.docker.com/r/dolibarr/dolibarr', 'https://wiki.dolibarr.org/index.php/Installation_/_Setup']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/dolibarr/dolibarr']::text[],
    compose_urls = ARRAY['https://hub.docker.com/r/dolibarr/dolibarr']::text[],
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
    native_urls = ARRAY['https://wiki.dolibarr.org/index.php/Installation_/_Setup']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['dolibarr/dolibarr:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '07b712c3-25b0-489a-99f3-667c04691047'::uuid
    AND a.slug = 'dolibarr'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dolibarr'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/technomancy-dev/00#setup-the-docker-container',
    docker_url = 'https://hub.docker.com/r/liltechnomancer/double-zero',
    docker_image = 'liltechnomancer/double-zero',
    compose_url = NULL,
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/technomancy-dev/00#setup-the-docker-container', 'https://hub.docker.com/r/liltechnomancer/double-zero']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/technomancy-dev/00#setup-the-docker-container","https://hub.docker.com/r/liltechnomancer/double-zero"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://github.com/technomancy-dev/00#setup-the-docker-container","https://hub.docker.com/r/liltechnomancer/double-zero"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'b2602f1d-a24e-405b-bc8a-80f63e46fa77'::uuid
    AND a.slug = 'doublezero'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/technomancy-dev/00'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app doublezero'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/liltechnomancer/double-zero","source_url":"https://github.com/technomancy-dev/00#setup-the-docker-container","image":"liltechnomancer/double-zero","note":"Requires AWS SES/SQS configuration.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/technomancy-dev/00#setup-the-docker-container', 'https://hub.docker.com/r/liltechnomancer/double-zero']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/liltechnomancer/double-zero']::text[],
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
    docker_images = ARRAY['liltechnomancer/double-zero']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b2602f1d-a24e-405b-bc8a-80f63e46fa77'::uuid
    AND a.slug = 'doublezero'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app doublezero'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://doc.dovecot.org/2.4.5/installation/installation.html',
    docker_url = 'https://doc.dovecot.org/2.4.5/installation/docker.html',
    docker_image = 'dovecot/dovecot:latest',
    compose_url = NULL,
    deployment_methods = ARRAY['docker', 'package']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://doc.dovecot.org/2.4.5/installation/docker.html', 'https://doc.dovecot.org/2.4.5/installation/installation.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://doc.dovecot.org/2.4.5/installation/docker.html","https://doc.dovecot.org/2.4.5/installation/installation.html"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://doc.dovecot.org/2.4.5/installation/docker.html","https://doc.dovecot.org/2.4.5/installation/installation.html"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'bea1f7b3-409a-421a-8fff-b962721d5e80'::uuid
    AND a.slug = 'dovecot'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/dovecot/core#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dovecot'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://doc.dovecot.org/2.4.5/installation/docker.html","source_url":"https://doc.dovecot.org/2.4.5/installation/docker.html","image":"dovecot/dovecot:latest","note":null,"support_level":"official","sort_order":10},{"method":"package","label":"OS package","url":"https://doc.dovecot.org/2.4.5/installation/installation.html","source_url":"https://doc.dovecot.org/2.4.5/installation/installation.html","image":null,"note":"Supported OS repositories.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://doc.dovecot.org/2.4.5/installation/docker.html', 'https://doc.dovecot.org/2.4.5/installation/installation.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://doc.dovecot.org/2.4.5/installation/docker.html']::text[],
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
    package_urls = ARRAY['https://doc.dovecot.org/2.4.5/installation/installation.html']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['dovecot/dovecot:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'bea1f7b3-409a-421a-8fff-b962721d5e80'::uuid
    AND a.slug = 'dovecot'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dovecot'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/corecode/dma#readme',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['package']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/corecode/dma#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '2da36a68-65a2-4a61-a2df-6e1d07cf6dd8'::uuid
    AND a.slug = 'dragonfly'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/corecode/dma#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dragonfly'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"package","label":"OS package","url":"https://github.com/corecode/dma#readme","source_url":"https://github.com/corecode/dma#readme","image":null,"note":"Upstream documents apt and FreeBSD packages.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/corecode/dma#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    package_urls = ARRAY['https://github.com/corecode/dma#readme']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2da36a68-65a2-4a61-a2df-6e1d07cf6dd8'::uuid
    AND a.slug = 'dragonfly'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dragonfly'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/drawdb-io/drawdb#docker-build',
    docker_url = 'https://github.com/drawdb-io/drawdb/pkgs/container/drawdb',
    docker_image = 'ghcr.io/drawdb-io/drawdb:latest',
    compose_url = NULL,
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/drawdb-io/drawdb#docker-build', 'https://github.com/drawdb-io/drawdb/pkgs/container/drawdb']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/drawdb-io/drawdb#docker-build","https://github.com/drawdb-io/drawdb/pkgs/container/drawdb"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://github.com/drawdb-io/drawdb#docker-build","https://github.com/drawdb-io/drawdb/pkgs/container/drawdb"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '8868f1ee-7acf-4085-bb51-f72dc1d7c219'::uuid
    AND a.slug = 'drawdb'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/drawdb-io/drawdb#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'none'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app drawdb'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/drawdb-io/drawdb/pkgs/container/drawdb","source_url":"https://github.com/drawdb-io/drawdb#docker-build","image":"ghcr.io/drawdb-io/drawdb:latest","note":"Optional sharing server is separate.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/drawdb-io/drawdb#docker-build', 'https://github.com/drawdb-io/drawdb/pkgs/container/drawdb']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/drawdb-io/drawdb/pkgs/container/drawdb']::text[],
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
    docker_images = ARRAY['ghcr.io/drawdb-io/drawdb:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '8868f1ee-7acf-4085-bb51-f72dc1d7c219'::uuid
    AND a.slug = 'drawdb'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app drawdb'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.drawpile.net/help/server/docker.html',
    docker_url = NULL,
    docker_image = 'drawpile/drawpile-srv:2.3',
    compose_url = 'https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml',
    deployment_methods = ARRAY['compose']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.drawpile.net/help/server/docker.html', 'https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://docs.drawpile.net/help/server/docker.html","https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://docs.drawpile.net/help/server/docker.html","https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://docs.drawpile.net/help/server/docker.html","https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'f9b34e56-76d2-423c-ac1a-fb92e259c7a0'::uuid
    AND a.slug = 'drawpile'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/drawpile/Drawpile'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app drawpile'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Docker Compose","url":"https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml","source_url":"https://docs.drawpile.net/help/server/docker.html","image":"drawpile/drawpile-srv:2.3","note":null,"support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.drawpile.net/help/server/docker.html', 'https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://github.com/drawpile/dpserver/blob/master/docker-compose.yaml']::text[],
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
    docker_images = ARRAY['drawpile/drawpile-srv:2.3']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'f9b34e56-76d2-423c-ac1a-fb92e259c7a0'::uuid
    AND a.slug = 'drawpile'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app drawpile'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/dreamfactorysoftware/dreamfactory#readme',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = 'https://github.com/dreamfactorysoftware/df-docker',
    deployment_methods = ARRAY['compose', 'helm', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/dreamfactorysoftware/df-docker', 'https://github.com/dreamfactorysoftware/df-helm', 'https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/dreamfactorysoftware/df-docker","https://github.com/dreamfactorysoftware/df-helm","https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://github.com/dreamfactorysoftware/df-docker","https://github.com/dreamfactorysoftware/df-helm","https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '6716e13e-2f5c-4739-8863-27bace861440'::uuid
    AND a.slug = 'dreamfactory'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/dreamfactorysoftware/dreamfactory#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM TRUE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dreamfactory'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Docker Compose","url":"https://github.com/dreamfactorysoftware/df-docker","source_url":"https://github.com/dreamfactorysoftware/df-docker","image":null,"note":"Official Compose repo targets 7.x.","support_level":"official","sort_order":10},{"method":"helm","label":"Helm chart","url":"https://github.com/dreamfactorysoftware/df-helm","source_url":"https://github.com/dreamfactorysoftware/df-helm","image":null,"note":"Official Helm repo targets 7.x.","support_level":"official","sort_order":20},{"method":"native","label":"Linux installer","url":"https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers","source_url":"https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers","image":null,"note":null,"support_level":"official","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/dreamfactorysoftware/df-docker', 'https://github.com/dreamfactorysoftware/df-helm', 'https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://github.com/dreamfactorysoftware/df-docker']::text[],
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
    helm_urls = ARRAY['https://github.com/dreamfactorysoftware/df-helm']::text[],
    native_urls = ARRAY['https://github.com/dreamfactorysoftware/dreamfactory/tree/master/installers']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '6716e13e-2f5c-4739-8863-27bace861440'::uuid
    AND a.slug = 'dreamfactory'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dreamfactory'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.dreeve.app/getting-started/installation/',
    docker_url = 'https://hub.docker.com/r/robiningelbrecht/dreeve',
    docker_image = 'robiningelbrecht/dreeve:latest',
    compose_url = 'https://docs.dreeve.app/getting-started/installation/',
    deployment_methods = ARRAY['compose', 'kubernetes']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.dreeve.app/getting-started/installation-on-k8s/', 'https://docs.dreeve.app/getting-started/installation/', 'https://hub.docker.com/r/robiningelbrecht/dreeve']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents container support and links the published registry image.","source_urls":["https://docs.dreeve.app/getting-started/installation-on-k8s/","https://docs.dreeve.app/getting-started/installation/","https://hub.docker.com/r/robiningelbrecht/dreeve"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream documentation identifies the Docker Hub and GHCR images.","source_urls":["https://docs.dreeve.app/getting-started/installation-on-k8s/","https://docs.dreeve.app/getting-started/installation/","https://hub.docker.com/r/robiningelbrecht/dreeve"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://docs.dreeve.app/getting-started/installation-on-k8s/","https://docs.dreeve.app/getting-started/installation/"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'b790ec6f-71d4-41f8-b2cd-4c2aa91c03a3'::uuid
    AND a.slug = 'dreeve'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/dreeveapp/dreeve#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'none'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dreeve'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Docker Compose","url":"https://docs.dreeve.app/getting-started/installation/","source_url":"https://docs.dreeve.app/getting-started/installation/","image":"robiningelbrecht/dreeve:latest","note":"Stack includes app and daemon.","support_level":"official","sort_order":10},{"method":"kubernetes","label":"Kubernetes manifests","url":"https://docs.dreeve.app/getting-started/installation-on-k8s/","source_url":"https://docs.dreeve.app/getting-started/installation-on-k8s/","image":"ghcr.io/robiningelbrecht/dreeve:latest","note":null,"support_level":"official","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.dreeve.app/getting-started/installation-on-k8s/', 'https://docs.dreeve.app/getting-started/installation/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://docs.dreeve.app/getting-started/installation/']::text[],
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
    kubernetes_urls = ARRAY['https://docs.dreeve.app/getting-started/installation-on-k8s/']::text[],
    helm_urls = ARRAY[]::text[],
    native_urls = ARRAY[]::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/robiningelbrecht/dreeve:latest', 'robiningelbrecht/dreeve:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b790ec6f-71d4-41f8-b2cd-4c2aa91c03a3'::uuid
    AND a.slug = 'dreeve'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dreeve'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://dropserver.org/docs/ds-host',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['binary']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://dropserver.org/docs/ds-host']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '8b9e18f4-e25d-406e-b529-df3ddaad5a5c'::uuid
    AND a.slug = 'dropserver'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/teleclimber/Dropserver#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dropserver'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"binary","label":"Server binary","url":"https://dropserver.org/docs/ds-host","source_url":"https://dropserver.org/docs/ds-host","image":null,"note":"Run ds-host with Deno on infrastructure you control.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://dropserver.org/docs/ds-host']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    binary_urls = ARRAY['https://dropserver.org/docs/ds-host']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '8b9e18f4-e25d-406e-b529-df3ddaad5a5c'::uuid
    AND a.slug = 'dropserver'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dropserver'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/sigoden/dufs#install',
    docker_url = 'https://hub.docker.com/r/sigoden/dufs',
    docker_image = 'sigoden/dufs:latest',
    compose_url = NULL,
    deployment_methods = ARRAY['binary', 'docker', 'package']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/sigoden/dufs#install', 'https://github.com/sigoden/dufs/releases', 'https://hub.docker.com/r/sigoden/dufs']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/sigoden/dufs#install","https://github.com/sigoden/dufs/releases","https://hub.docker.com/r/sigoden/dufs"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://github.com/sigoden/dufs#install","https://github.com/sigoden/dufs/releases","https://hub.docker.com/r/sigoden/dufs"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'b9b17e61-4f77-4f6c-8c91-b9aca8cf0b37'::uuid
    AND a.slug = 'dufs'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/sigoden/dufs#install'
    AND a.docker_url IS NOT DISTINCT FROM 'https://hub.docker.com/r/sigoden/dufs'
    AND a.docker_image IS NOT DISTINCT FROM 'sigoden/dufs:latest'
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dufs'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/sigoden/dufs","source_url":"https://github.com/sigoden/dufs#install","image":"sigoden/dufs:latest","note":null,"support_level":"official","sort_order":10},{"method":"binary","label":"Release binary","url":"https://github.com/sigoden/dufs/releases","source_url":"https://github.com/sigoden/dufs#install","image":null,"note":"Official release binaries.","support_level":"official","sort_order":20},{"method":"package","label":"Package install","url":"https://github.com/sigoden/dufs#install","source_url":"https://github.com/sigoden/dufs#install","image":null,"note":"Cargo and Homebrew.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/sigoden/dufs#install', 'https://github.com/sigoden/dufs/releases', 'https://hub.docker.com/r/sigoden/dufs']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/sigoden/dufs']::text[],
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
    binary_urls = ARRAY['https://github.com/sigoden/dufs/releases']::text[],
    package_urls = ARRAY['https://github.com/sigoden/dufs#install']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['sigoden/dufs:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b9b17e61-4f77-4f6c-8c91-b9aca8cf0b37'::uuid
    AND a.slug = 'dufs'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dufs'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://duplicacy.com/download.html',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['binary']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://duplicacy.com/download.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '972958a7-c821-4577-8678-235e338b376c'::uuid
    AND a.slug = 'duplicacy'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/gilbertchen/duplicacy/wiki/Installation'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app duplicacy'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"binary","label":"Web Edition binary","url":"https://duplicacy.com/download.html","source_url":"https://duplicacy.com/download.html","image":null,"note":"Linux x64/ARM64 Web Edition builds.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://duplicacy.com/download.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    binary_urls = ARRAY['https://duplicacy.com/download.html']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '972958a7-c821-4577-8678-235e338b376c'::uuid
    AND a.slug = 'duplicacy'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app duplicacy'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/Panonim/dynacat#installation',
    docker_url = 'https://hub.docker.com/r/panonim/dynacat',
    docker_image = 'panonim/dynacat',
    compose_url = 'https://github.com/Panonim/dynacat-compose-template',
    deployment_methods = ARRAY['binary', 'compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Panonim/dynacat#installation', 'https://github.com/Panonim/dynacat-compose-template', 'https://github.com/Panonim/dynacat/releases', 'https://hub.docker.com/r/panonim/dynacat']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://github.com/Panonim/dynacat#installation","https://github.com/Panonim/dynacat-compose-template","https://github.com/Panonim/dynacat/releases","https://hub.docker.com/r/panonim/dynacat"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://github.com/Panonim/dynacat#installation","https://github.com/Panonim/dynacat-compose-template","https://github.com/Panonim/dynacat/releases","https://hub.docker.com/r/panonim/dynacat"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://github.com/Panonim/dynacat#installation","https://github.com/Panonim/dynacat-compose-template","https://github.com/Panonim/dynacat/releases","https://hub.docker.com/r/panonim/dynacat"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = '6f62982c-8e76-4abb-8203-1c73aed811f2'::uuid
    AND a.slug = 'dynacat'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Panonim/dynacat#readme'
    AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/Panonim/dynacat/blob/HEAD/Dockerfile'
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM TRUE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app dynacat'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/panonim/dynacat","source_url":"https://github.com/Panonim/dynacat#installation","image":"panonim/dynacat","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/Panonim/dynacat-compose-template","source_url":"https://github.com/Panonim/dynacat#installation","image":"panonim/dynacat","note":null,"support_level":"official","sort_order":20},{"method":"binary","label":"Release binaries","url":"https://github.com/Panonim/dynacat/releases","source_url":"https://github.com/Panonim/dynacat#installation","image":null,"note":"Official release binaries.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Panonim/dynacat#installation', 'https://github.com/Panonim/dynacat-compose-template', 'https://github.com/Panonim/dynacat/releases', 'https://hub.docker.com/r/panonim/dynacat']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/panonim/dynacat']::text[],
    compose_urls = ARRAY['https://github.com/Panonim/dynacat-compose-template']::text[],
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
    binary_urls = ARRAY['https://github.com/Panonim/dynacat/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['panonim/dynacat']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '6f62982c-8e76-4abb-8203-1c73aed811f2'::uuid
    AND a.slug = 'dynacat'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app dynacat'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://easytier.cn/en/guide/installation.html',
    docker_url = 'https://hub.docker.com/r/easytier/easytier',
    docker_image = 'easytier/easytier:latest',
    compose_url = 'https://easytier.cn/en/guide/installation.html',
    deployment_methods = ARRAY['binary', 'compose', 'docker', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://easytier.cn/en/guide/download.html', 'https://easytier.cn/en/guide/installation.html', 'https://hub.docker.com/r/easytier/easytier', 'https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://easytier.cn/en/guide/download.html","https://easytier.cn/en/guide/installation.html","https://hub.docker.com/r/easytier/easytier","https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://easytier.cn/en/guide/download.html","https://easytier.cn/en/guide/installation.html","https://hub.docker.com/r/easytier/easytier","https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Compose installation.","source_urls":["https://easytier.cn/en/guide/download.html","https://easytier.cn/en/guide/installation.html","https://hub.docker.com/r/easytier/easytier","https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'eb7032da-6140-4146-ab85-06a43b473011'::uuid
    AND a.slug = 'easytier'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/EasyTier/EasyTier#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'none'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app easytier'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/easytier/easytier","source_url":"https://easytier.cn/en/guide/installation.html","image":"easytier/easytier:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://easytier.cn/en/guide/installation.html","source_url":"https://easytier.cn/en/guide/installation.html","image":"easytier/easytier:latest","note":"Needs host networking and TUN access.","support_level":"official","sort_order":20},{"method":"binary","label":"CLI download","url":"https://easytier.cn/en/guide/download.html","source_url":"https://easytier.cn/en/guide/installation.html","image":null,"note":"Official platform builds.","support_level":"official","sort_order":30},{"method":"native","label":"Linux install script","url":"https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh","source_url":"https://easytier.cn/en/guide/installation.html","image":null,"note":"Official guide documents Linux installer.","support_level":"official","sort_order":40}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://easytier.cn/en/guide/download.html', 'https://easytier.cn/en/guide/installation.html', 'https://hub.docker.com/r/easytier/easytier', 'https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/easytier/easytier']::text[],
    compose_urls = ARRAY['https://easytier.cn/en/guide/installation.html']::text[],
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
    native_urls = ARRAY['https://raw.githubusercontent.com/EasyTier/EasyTier/main/script/install.sh']::text[],
    binary_urls = ARRAY['https://easytier.cn/en/guide/download.html']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['easytier/easytier:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'eb7032da-6140-4146-ab85-06a43b473011'::uuid
    AND a.slug = 'easytier'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app easytier'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://easy-wi.com/en/installation/web-interface/',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['native']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://easy-wi.com/en/installation/web-interface/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'aa40b985-76fc-4b9c-ad7f-9a3279c12893'::uuid
    AND a.slug = 'easywi'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/easy-wi/developer#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app easywi'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Bash installer","url":"https://easy-wi.com/en/installation/web-interface/","source_url":"https://easy-wi.com/en/installation/web-interface/","image":null,"note":"Official installer sets up the server as root.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://easy-wi.com/en/installation/web-interface/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    native_urls = ARRAY['https://easy-wi.com/en/installation/web-interface/']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'aa40b985-76fc-4b9c-ad7f-9a3279c12893'::uuid
    AND a.slug = 'easywi'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app easywi'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://eclipse.dev/che/docs/stable/install/installing-che/',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['kubernetes']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://eclipse.dev/che/docs/stable/install/installing-che/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'f31f3cd3-83e6-4e00-b2d2-5fba2975e568'::uuid
    AND a.slug = 'eclipse-che'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/eclipse-che/che#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app eclipse-che'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"kubernetes","label":"Kubernetes install","url":"https://eclipse.dev/che/docs/stable/install/installing-che/","source_url":"https://eclipse.dev/che/docs/stable/install/installing-che/","image":null,"note":"Official docs install Che on Kubernetes.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://eclipse.dev/che/docs/stable/install/installing-che/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    kubernetes_urls = ARRAY['https://eclipse.dev/che/docs/stable/install/installing-che/']::text[],
    helm_urls = ARRAY[]::text[],
    native_urls = ARRAY[]::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'f31f3cd3-83e6-4e00-b2d2-5fba2975e568'::uuid
    AND a.slug = 'eclipse-che'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app eclipse-che'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.ejabberd.im/admin/install/',
    docker_url = 'https://github.com/processone/ejabberd/pkgs/container/ejabberd',
    docker_image = 'ghcr.io/processone/ejabberd:latest',
    compose_url = NULL,
    deployment_methods = ARRAY['binary', 'docker', 'package']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.ejabberd.im/CONTAINER/', 'https://docs.ejabberd.im/admin/install/', 'https://docs.ejabberd.im/admin/install/binary-installer/', 'https://docs.ejabberd.im/admin/install/os-package/', 'https://github.com/processone/ejabberd/pkgs/container/ejabberd']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://docs.ejabberd.im/CONTAINER/","https://docs.ejabberd.im/admin/install/","https://docs.ejabberd.im/admin/install/binary-installer/","https://docs.ejabberd.im/admin/install/os-package/","https://github.com/processone/ejabberd/pkgs/container/ejabberd"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://docs.ejabberd.im/CONTAINER/","https://docs.ejabberd.im/admin/install/","https://docs.ejabberd.im/admin/install/binary-installer/","https://docs.ejabberd.im/admin/install/os-package/","https://github.com/processone/ejabberd/pkgs/container/ejabberd"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'bc59c4db-7266-48bb-8424-15d90a52efbe'::uuid
    AND a.slug = 'ejabberd'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/processone/ejabberd#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'official'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app ejabberd'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/processone/ejabberd/pkgs/container/ejabberd","source_url":"https://docs.ejabberd.im/CONTAINER/","image":"ghcr.io/processone/ejabberd:latest","note":null,"support_level":"official","sort_order":10},{"method":"binary","label":"Linux binary installer","url":"https://docs.ejabberd.im/admin/install/binary-installer/","source_url":"https://docs.ejabberd.im/admin/install/","image":null,"note":null,"support_level":"official","sort_order":20},{"method":"package","label":"OS package","url":"https://docs.ejabberd.im/admin/install/os-package/","source_url":"https://docs.ejabberd.im/admin/install/","image":null,"note":"Linux packages and Homebrew.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.ejabberd.im/CONTAINER/', 'https://docs.ejabberd.im/admin/install/', 'https://docs.ejabberd.im/admin/install/binary-installer/', 'https://docs.ejabberd.im/admin/install/os-package/', 'https://github.com/processone/ejabberd/pkgs/container/ejabberd']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/processone/ejabberd/pkgs/container/ejabberd']::text[],
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
    binary_urls = ARRAY['https://docs.ejabberd.im/admin/install/binary-installer/']::text[],
    package_urls = ARRAY['https://docs.ejabberd.im/admin/install/os-package/']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/processone/ejabberd:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'bc59c4db-7266-48bb-8424-15d90a52efbe'::uuid
    AND a.slug = 'ejabberd'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app ejabberd'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://learn.elgg.org/en/stable/intro/install.html',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['native']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://learn.elgg.org/en/stable/intro/install.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '7ff9684f-62b6-4d49-96ef-7d53ad70e1c1'::uuid
    AND a.slug = 'elgg'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Elgg/Elgg#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app elgg'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Composer or ZIP install","url":"https://learn.elgg.org/en/stable/intro/install.html","source_url":"https://learn.elgg.org/en/stable/intro/install.html","image":null,"note":"Composer or ZIP install on PHP.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://learn.elgg.org/en/stable/intro/install.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    native_urls = ARRAY['https://learn.elgg.org/en/stable/intro/install.html']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '7ff9684f-62b6-4d49-96ef-7d53ad70e1c1'::uuid
    AND a.slug = 'elgg'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app elgg'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/LukeSmithxyz/emailwiz#readme',
    docker_url = NULL,
    docker_image = NULL,
    compose_url = NULL,
    deployment_methods = ARRAY['native']::text[],
    docker_support = 'unknown',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/LukeSmithxyz/emailwiz#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '0847eb3b-2fa7-4c70-9439-9b8c04953bdc'::uuid
    AND a.slug = 'emailwiz'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/LukeSmithxyz/emailwiz'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'unknown'
    AND a.compose_support IS NOT DISTINCT FROM NULL
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app emailwiz'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Server setup script","url":"https://github.com/LukeSmithxyz/emailwiz#readme","source_url":"https://github.com/LukeSmithxyz/emailwiz#readme","image":null,"note":"Configures Postfix/Dovecot on Debian/Ubuntu.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/LukeSmithxyz/emailwiz#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
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
    native_urls = ARRAY['https://github.com/LukeSmithxyz/emailwiz#readme']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '0847eb3b-2fa7-4c70-9439-9b8c04953bdc'::uuid
    AND a.slug = 'emailwiz'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app emailwiz'; END IF;


  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://bifroest.engity.org/setup/in-docker/',
    docker_url = 'https://github.com/engity-com/bifroest/pkgs/container/bifroest',
    docker_image = 'ghcr.io/engity-com/bifroest:latest',
    compose_url = NULL,
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    compose_support = NULL,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://bifroest.engity.org/setup/in-docker/', 'https://github.com/engity-com/bifroest/pkgs/container/bifroest']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material documents Docker installation.","source_urls":["https://bifroest.engity.org/setup/in-docker/","https://github.com/engity-com/bifroest/pkgs/container/bifroest"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official upstream material identifies the listed image.","source_urls":["https://bifroest.engity.org/setup/in-docker/","https://github.com/engity-com/bifroest/pkgs/container/bifroest"]}}'::jsonb,
    updated_at = now()
  WHERE a.id = 'dd0ab25d-8ed1-45ad-9127-8eb3c838cf16'::uuid
    AND a.slug = 'engitys-bifrost'
    AND a.published IS NOT DISTINCT FROM TRUE
    AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable'
    AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/engity-com/bifroest#readme'
    AND a.docker_url IS NOT DISTINCT FROM NULL
    AND a.docker_image IS NOT DISTINCT FROM NULL
    AND a.compose_url IS NOT DISTINCT FROM NULL
    AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[]
    AND a.docker_support IS NOT DISTINCT FROM 'none'
    AND a.compose_support IS NOT DISTINCT FROM FALSE
    AND EXISTS (SELECT 1 FROM public.self_host_app_install_options AS i WHERE i.app_id = a.id AND i.options IS NOT DISTINCT FROM '[]'::jsonb);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for app engitys-bifrost'; END IF;
  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/engity-com/bifroest/pkgs/container/bifroest","source_url":"https://bifroest.engity.org/setup/in-docker/","image":"ghcr.io/engity-com/bifroest:latest","note":null,"support_level":"official","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://bifroest.engity.org/setup/in-docker/', 'https://github.com/engity-com/bifroest/pkgs/container/bifroest']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/engity-com/bifroest/pkgs/container/bifroest']::text[],
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
    docker_images = ARRAY['ghcr.io/engity-com/bifroest:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'dd0ab25d-8ed1-45ad-9127-8eb3c838cf16'::uuid
    AND a.slug = 'engitys-bifrost'
    AND i.options IS NOT DISTINCT FROM '[]'::jsonb
    AND coalesce(cardinality(i.docker_urls),0) = 0
    AND coalesce(cardinality(i.compose_urls),0) = 0
    AND coalesce(cardinality(i.truenas_scale_urls),0) = 0
    AND coalesce(cardinality(i.unraid_urls),0) = 0
    AND coalesce(cardinality(i.umbrel_urls),0) = 0
    AND coalesce(cardinality(i.yunohost_urls),0) = 0
    AND coalesce(cardinality(i.casaos_urls),0) = 0
    AND coalesce(cardinality(i.runtipi_urls),0) = 0
    AND coalesce(cardinality(i.cosmos_urls),0) = 0
    AND coalesce(cardinality(i.openmediavault_urls),0) = 0
    AND coalesce(cardinality(i.synology_urls),0) = 0
    AND coalesce(cardinality(i.qnap_urls),0) = 0
    AND coalesce(cardinality(i.proxmox_urls),0) = 0
    AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0
    AND coalesce(cardinality(i.kubernetes_urls),0) = 0
    AND coalesce(cardinality(i.helm_urls),0) = 0
    AND coalesce(cardinality(i.native_urls),0) = 0
    AND coalesce(cardinality(i.binary_urls),0) = 0
    AND coalesce(cardinality(i.package_urls),0) = 0
    AND coalesce(cardinality(i.other_urls),0) = 0
    AND coalesce(cardinality(i.docker_images),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install-option guard failed for app engitys-bifrost'; END IF;

END $$;
COMMIT;
