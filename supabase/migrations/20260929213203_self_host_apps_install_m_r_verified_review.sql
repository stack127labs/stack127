-- Reviewed M-R install destinations against upstream project documentation.
-- App identity, current app facts, and empty install-option guards protect this batch.
BEGIN;
DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://maddy.email/tutorials/setting-up/',
    docker_url = 'https://github.com/foxcpp/maddy/pkgs/container/maddy',
    docker_image = 'ghcr.io/foxcpp/maddy:latest',
    deployment_methods = ARRAY['docker', 'native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://maddy.email/tutorials/setting-up/', 'https://github.com/foxcpp/maddy/pkgs/container/maddy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/foxcpp/maddy/pkgs/container/maddy')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/foxcpp/maddy:latest.','source_urls',jsonb_build_array('https://github.com/foxcpp/maddy/pkgs/container/maddy'))),
    updated_at = now()
  WHERE a.id = '2dd0151a-d73a-4989-963b-940b9e21137b'::uuid AND a.slug = 'maddy-mail-server' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/foxcpp/maddy#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/foxcpp/maddy/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for maddy-mail-server'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Linux tarball or source install","url":"https://maddy.email/tutorials/setting-up/","support_level":"official","source_url":"https://maddy.email/tutorials/setting-up/","image":null,"note":null,"sort_order":10},{"method":"docker","label":"Official GHCR image","url":"https://github.com/foxcpp/maddy/pkgs/container/maddy","support_level":"official","source_url":"https://github.com/foxcpp/maddy/pkgs/container/maddy","image":"ghcr.io/foxcpp/maddy:latest","note":"The official GHCR package lists the published Maddy container tags.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://maddy.email/tutorials/setting-up/', 'https://github.com/foxcpp/maddy/pkgs/container/maddy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/foxcpp/maddy/pkgs/container/maddy']::text[],
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
    native_urls = ARRAY['https://maddy.email/tutorials/setting-up/']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/foxcpp/maddy:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2dd0151a-d73a-4989-963b-940b9e21137b'::uuid AND a.slug = 'maddy-mail-server' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for maddy-mail-server'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/hywax/mafl',
    docker_url = 'https://hub.docker.com/r/hywax/mafl',
    docker_image = 'hywax/mafl:latest',
    compose_url = 'https://github.com/hywax/mafl#docker',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/hywax/mafl', 'https://hub.docker.com/r/hywax/mafl', 'https://github.com/hywax/mafl#docker', 'https://github.com/hywax/mafl#node']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/hywax/mafl', 'https://hub.docker.com/r/hywax/mafl', 'https://github.com/hywax/mafl#docker')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names hywax/mafl:latest.','source_urls',jsonb_build_array('https://github.com/hywax/mafl', 'https://hub.docker.com/r/hywax/mafl', 'https://github.com/hywax/mafl#docker')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/hywax/mafl', 'https://github.com/hywax/mafl#docker'))),
    updated_at = now()
  WHERE a.id = 'ad600680-b4c9-4df9-aa29-3654bc5e5be2'::uuid AND a.slug = 'mafl' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/hywax/mafl#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mafl'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Mafl Docker image","url":"https://hub.docker.com/r/hywax/mafl","support_level":"official","source_url":"https://github.com/hywax/mafl","image":"hywax/mafl:latest","note":"The upstream README publishes this image to Docker Hub and GHCR and includes a Compose example.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://github.com/hywax/mafl#docker","support_level":"official","source_url":"https://github.com/hywax/mafl","image":"hywax/mafl:latest","note":null,"sort_order":20},{"method":"native","label":"Node.js install","url":"https://github.com/hywax/mafl#node","support_level":"official","source_url":"https://github.com/hywax/mafl","image":null,"note":"Upstream documents building and running the app with Node and Yarn.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/hywax/mafl']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/hywax/mafl']::text[],
    compose_urls = ARRAY['https://github.com/hywax/mafl#docker']::text[],
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
    native_urls = ARRAY['https://github.com/hywax/mafl#node']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['hywax/mafl:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'ad600680-b4c9-4df9-aa29-3654bc5e5be2'::uuid AND a.slug = 'mafl' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mafl'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.mage.ai/getting-started/setup',
    docker_url = 'https://docs.mage.ai/getting-started/setup',
    docker_image = 'mageai/mageai:latest',
    compose_url = 'https://github.com/mage-ai/compose-quickstart',
    deployment_methods = ARRAY['compose', 'docker', 'package']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.mage.ai/getting-started/setup', 'https://pypi.org/project/mage-ai/', 'https://docs.mage.ai/getting-started/setup', 'https://github.com/mage-ai/compose-quickstart']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://docs.mage.ai/getting-started/setup', 'https://docs.mage.ai/getting-started/setup', 'https://github.com/mage-ai/compose-quickstart')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names mageai/mageai:latest.','source_urls',jsonb_build_array('https://docs.mage.ai/getting-started/setup', 'https://docs.mage.ai/getting-started/setup')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://docs.mage.ai/getting-started/setup', 'https://github.com/mage-ai/compose-quickstart'))),
    updated_at = now()
  WHERE a.id = '2712ac45-def7-4f71-804f-1122f29ab343'::uuid AND a.slug = 'mage' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/mage-ai/mage-ai#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mage'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Mage Docker image","url":"https://docs.mage.ai/getting-started/setup","support_level":"official","source_url":"https://docs.mage.ai/getting-started/setup","image":"mageai/mageai:latest","note":"Official quickstart provides the Docker run command.","sort_order":10},{"method":"compose","label":"Mage Compose quickstart","url":"https://github.com/mage-ai/compose-quickstart","support_level":"official","source_url":"https://docs.mage.ai/getting-started/setup","image":null,"note":"The official docs link this starter repository and show docker compose up.","sort_order":20},{"method":"package","label":"Install with pip","url":"https://pypi.org/project/mage-ai/","support_level":"official","source_url":"https://docs.mage.ai/getting-started/setup","image":null,"note":"The official setup guide and project package page document pip installation.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.mage.ai/getting-started/setup']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://docs.mage.ai/getting-started/setup']::text[],
    compose_urls = ARRAY['https://github.com/mage-ai/compose-quickstart']::text[],
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
    package_urls = ARRAY['https://pypi.org/project/mage-ai/']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['mageai/mageai:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2712ac45-def7-4f71-804f-1122f29ab343'::uuid AND a.slug = 'mage' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mage'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer',
    deployment_methods = ARRAY['package']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'f00a442e-90ce-497f-bfd4-7a55c8a02446'::uuid AND a.slug = 'magento-open-source' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/magento/magento2#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for magento-open-source'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"package","label":"Composer install","url":"https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer","support_level":"official","source_url":"https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer","image":null,"note":"The on-premises guide installs Magento Open Source with the magento/project-community-edition Composer package.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    package_urls = ARRAY['https://experienceleague.adobe.com/en/docs/commerce-operations/installation-guide/composer']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'f00a442e-90ce-497f-bfd4-7a55c8a02446'::uuid AND a.slug = 'magento-open-source' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for magento-open-source'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://magicframe.dev/docs/installation/',
    compose_url = 'https://magicframe.dev/docs/installation/',
    deployment_methods = ARRAY['compose', 'helm', 'home_assistant_os', 'kubernetes']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://magicframe.dev/docs/installation/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://magicframe.dev/docs/installation/')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/jeremiaa/magic-frame-app:latest.','source_urls',jsonb_build_array('https://magicframe.dev/docs/installation/')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://magicframe.dev/docs/installation/'))),
    updated_at = now()
  WHERE a.id = '635f17e2-ceac-4204-a7f4-7a756427ac36'::uuid AND a.slug = 'magic-frame' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/jeremiaa/magic-frame#readme' AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for magic-frame'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Docker Compose install","url":"https://magicframe.dev/docs/installation/","support_level":"official","source_url":"https://magicframe.dev/docs/installation/","image":"ghcr.io/jeremiaa/magic-frame-app:latest","note":"The official installer and manual Compose steps use the project image.","sort_order":10},{"method":"helm","label":"Helm chart","url":"https://magicframe.dev/docs/installation/","support_level":"official","source_url":"https://magicframe.dev/docs/installation/","image":null,"note":"The install guide documents the Helm chart path.","sort_order":20},{"method":"kubernetes","label":"Kubernetes manifests","url":"https://magicframe.dev/docs/installation/","support_level":"official","source_url":"https://magicframe.dev/docs/installation/","image":"ghcr.io/jeremiaa/magic-frame-app:latest","note":"The install guide documents Kubernetes manifests and image pinning.","sort_order":30},{"method":"home_assistant_os","label":"Home Assistant add-on","url":"https://magicframe.dev/docs/installation/","support_level":"official","source_url":"https://magicframe.dev/docs/installation/","image":null,"note":"The project documents an add-on install for Home Assistant OS.","sort_order":40}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://magicframe.dev/docs/installation/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://magicframe.dev/docs/installation/']::text[],
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
    home_assistant_os_urls = ARRAY['https://magicframe.dev/docs/installation/']::text[],
    kubernetes_urls = ARRAY['https://magicframe.dev/docs/installation/']::text[],
    helm_urls = ARRAY['https://magicframe.dev/docs/installation/']::text[],
    native_urls = ARRAY[]::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '635f17e2-ceac-4204-a7f4-7a756427ac36'::uuid AND a.slug = 'magic-frame' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for magic-frame'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://mailinabox.email/guide.html',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://mailinabox.email/guide.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '55733266-af6f-4c4e-8234-07ea33e99cd7'::uuid AND a.slug = 'mail-in-a-box' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/mail-in-a-box/mailinabox#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mail-in-a-box'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Ubuntu server install","url":"https://mailinabox.email/guide.html","support_level":"official","source_url":"https://mailinabox.email/guide.html","image":null,"note":"The official guide uses a dedicated Ubuntu server and setup script; it does not support Docker installs.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://mailinabox.email/guide.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://mailinabox.email/guide.html']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '55733266-af6f-4c4e-8234-07ea33e99cd7'::uuid AND a.slug = 'mail-in-a-box' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mail-in-a-box'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/maildev/maildev',
    docker_url = 'https://hub.docker.com/r/maildev/maildev',
    docker_image = 'maildev/maildev:latest',
    deployment_methods = ARRAY['docker', 'package']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/maildev/maildev', 'https://hub.docker.com/r/maildev/maildev', 'https://www.npmjs.com/package/maildev']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/maildev/maildev', 'https://hub.docker.com/r/maildev/maildev')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names maildev/maildev:latest.','source_urls',jsonb_build_array('https://github.com/maildev/maildev', 'https://hub.docker.com/r/maildev/maildev'))),
    updated_at = now()
  WHERE a.id = 'e8184dd7-eb9e-4bd6-acc8-a09a19933214'::uuid AND a.slug = 'maildev' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/maildev/maildev#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for maildev'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"MailDev Docker image","url":"https://hub.docker.com/r/maildev/maildev","support_level":"official","source_url":"https://github.com/maildev/maildev","image":"maildev/maildev:latest","note":null,"sort_order":10},{"method":"package","label":"Install from npm","url":"https://www.npmjs.com/package/maildev","support_level":"official","source_url":"https://github.com/maildev/maildev","image":null,"note":"The upstream README documents npm install -g maildev.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/maildev/maildev']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/maildev/maildev']::text[],
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
    package_urls = ARRAY['https://www.npmjs.com/package/maildev']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['maildev/maildev:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'e8184dd7-eb9e-4bd6-acc8-a09a19933214'::uuid AND a.slug = 'maildev' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for maildev'; END IF;

  UPDATE public.self_host_apps AS a SET
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/techulus/manage', 'https://github.com/techulus/manage#self-hosting']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '0c159210-81bc-4bfe-8216-0cfe9fa65651'::uuid AND a.slug = 'manage' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/techulus/manage' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for manage'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Node.js or Bun self-hosting","url":"https://github.com/techulus/manage#self-hosting","support_level":"official","source_url":"https://github.com/techulus/manage","image":null,"note":"Upstream says it can run on Node.js/Bun platforms and lists PostgreSQL, optional S3-compatible storage, and SMTP requirements.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/techulus/manage']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://github.com/techulus/manage#self-hosting']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '0c159210-81bc-4bfe-8216-0cfe9fa65651'::uuid AND a.slug = 'manage' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for manage'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md',
    docker_url = 'https://hub.docker.com/r/intriin/mmdl',
    docker_image = 'intriin/mmdl:latest',
    compose_url = 'https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md', 'https://hub.docker.com/r/intriin/mmdl']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md', 'https://hub.docker.com/r/intriin/mmdl')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names intriin/mmdl:latest.','source_urls',jsonb_build_array('https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md', 'https://hub.docker.com/r/intriin/mmdl')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md'))),
    updated_at = now()
  WHERE a.id = '7c0b024d-3f5d-424c-a870-0776cc9f69f5'::uuid AND a.slug = 'manage-my-damn-life' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/intri-in/manage-my-damn-life-nextjs#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/intri-in/manage-my-damn-life-nextjs/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for manage-my-damn-life'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Docker Compose install","url":"https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md","support_level":"official","source_url":"https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md","image":"intriin/mmdl:latest","note":"The documented stack runs MMDL and MySQL. The project notes that its installation instructions have not been thoroughly tested.","sort_order":10},{"method":"docker","label":"MMDL Docker image","url":"https://hub.docker.com/r/intriin/mmdl","support_level":"official","source_url":"https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md","image":"intriin/mmdl:latest","note":"The official install guide documents docker pull intriin/mmdl:latest and docker run.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/intriin/mmdl']::text[],
    compose_urls = ARRAY['https://github.com/intri-in/manage-my-damn-life-nextjs/blob/main/docs/install/Docker/index.md']::text[],
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
    docker_images = ARRAY['intriin/mmdl:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '7c0b024d-3f5d-424c-a870-0776cc9f69f5'::uuid AND a.slug = 'manage-my-damn-life' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for manage-my-damn-life'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/mantisbt/mantisbt',
    docker_url = 'https://hub.docker.com/r/okainov/mantisbt',
    docker_image = 'okainov/mantisbt:latest',
    compose_url = 'https://github.com/okainov/mantisbt-docker#quick-start',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    docker_support = 'community',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/mantisbt/mantisbt#installation', 'https://github.com/okainov/mantisbt-docker', 'https://hub.docker.com/r/okainov/mantisbt', 'https://github.com/mantisbt/mantisbt', 'https://github.com/okainov/mantisbt-docker#quick-start']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','A community-maintained Docker route is documented in the linked sources.','source_urls',jsonb_build_array('https://github.com/okainov/mantisbt-docker', 'https://hub.docker.com/r/okainov/mantisbt', 'https://github.com/okainov/mantisbt-docker#quick-start')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names okainov/mantisbt:latest.','source_urls',jsonb_build_array('https://github.com/okainov/mantisbt-docker', 'https://hub.docker.com/r/okainov/mantisbt', 'https://github.com/okainov/mantisbt-docker#quick-start')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/okainov/mantisbt-docker', 'https://github.com/okainov/mantisbt-docker#quick-start'))),
    updated_at = now()
  WHERE a.id = 'c74ed558-3655-4683-805e-ebfb0f690c58'::uuid AND a.slug = 'mantisbt' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/mantisbt/mantisbt#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/mantisbt/mantisbt/blob/HEAD/docbook/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mantisbt'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"PHP web server installation","url":"https://github.com/mantisbt/mantisbt#installation","support_level":"official","source_url":"https://github.com/mantisbt/mantisbt","image":null,"note":"Official README describes installing the release tarball with PHP, a web server, and a database.","sort_order":10},{"method":"docker","label":"Community MantisBT Docker image","url":"https://hub.docker.com/r/okainov/mantisbt","support_level":"community","source_url":"https://github.com/okainov/mantisbt-docker","image":"okainov/mantisbt:latest","note":"This is a community-maintained image, not an upstream MantisBT image.","sort_order":20},{"method":"compose","label":"Community MantisBT Compose setup","url":"https://github.com/okainov/mantisbt-docker#quick-start","support_level":"community","source_url":"https://github.com/okainov/mantisbt-docker","image":"okainov/mantisbt:latest","note":"The community project provides a Compose example with a MySQL service.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/mantisbt/mantisbt', 'https://github.com/okainov/mantisbt-docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/okainov/mantisbt']::text[],
    compose_urls = ARRAY['https://github.com/okainov/mantisbt-docker#quick-start']::text[],
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
    native_urls = ARRAY['https://github.com/mantisbt/mantisbt#installation']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['okainov/mantisbt:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'c74ed558-3655-4683-805e-ebfb0f690c58'::uuid AND a.slug = 'mantisbt' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mantisbt'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://manyfold.app/get-started/docker',
    docker_url = 'https://github.com/manyfold3d/manyfold/pkgs/container/manyfold-solo',
    docker_image = 'ghcr.io/manyfold3d/manyfold-solo:latest',
    compose_url = 'https://manyfold.app/get-started/docker',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://manyfold.app/get-started/docker', 'https://github.com/manyfold3d/manyfold/pkgs/container/manyfold-solo']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://manyfold.app/get-started/docker', 'https://github.com/manyfold3d/manyfold/pkgs/container/manyfold-solo')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/manyfold3d/manyfold-solo:latest.','source_urls',jsonb_build_array('https://manyfold.app/get-started/docker', 'https://github.com/manyfold3d/manyfold/pkgs/container/manyfold-solo')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://manyfold.app/get-started/docker'))),
    updated_at = now()
  WHERE a.id = 'ee27a98c-6997-46e4-8850-50626a095ec7'::uuid AND a.slug = 'manyfold' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/manyfold3d/manyfold#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for manyfold'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Manyfold Solo image","url":"https://github.com/manyfold3d/manyfold/pkgs/container/manyfold-solo","support_level":"official","source_url":"https://manyfold.app/get-started/docker","image":"ghcr.io/manyfold3d/manyfold-solo:latest","note":"All-in-one image includes the database and Redis.","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://manyfold.app/get-started/docker","support_level":"official","source_url":"https://manyfold.app/get-started/docker","image":"ghcr.io/manyfold3d/manyfold-solo:latest","note":"Official guide provides a simple Solo Compose setup and a standard multi-service setup.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://manyfold.app/get-started/docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/manyfold3d/manyfold/pkgs/container/manyfold-solo']::text[],
    compose_urls = ARRAY['https://manyfold.app/get-started/docker']::text[],
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
    docker_images = ARRAY['ghcr.io/manyfold3d/manyfold-solo:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'ee27a98c-6997-46e4-8850-50626a095ec7'::uuid AND a.slug = 'manyfold' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for manyfold'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://maple.dev/docs/local-mode/',
    compose_url = 'https://github.com/MapleTechLabs/maple#docker-local',
    deployment_methods = ARRAY['binary', 'compose']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://maple.dev/docs/local-mode/', 'https://github.com/MapleTechLabs/maple', 'https://github.com/MapleTechLabs/maple#docker-local']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/MapleTechLabs/maple', 'https://github.com/MapleTechLabs/maple#docker-local')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/MapleTechLabs/maple', 'https://github.com/MapleTechLabs/maple#docker-local'))),
    updated_at = now()
  WHERE a.id = 'db5c01d1-16e9-4612-9581-26c769aae4fa'::uuid AND a.slug = 'maple' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/MapleTechLabs/maple#readme' AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for maple'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"binary","label":"Maple Local binary","url":"https://maple.dev/docs/local-mode/","support_level":"official","source_url":"https://maple.dev/docs/local-mode/","image":null,"note":"Official guide installs a single binary that runs a local, self-hosted observability stack and persists data on the host.","sort_order":10},{"method":"compose","label":"Local Docker Compose stack","url":"https://github.com/MapleTechLabs/maple#docker-local","support_level":"official","source_url":"https://github.com/MapleTechLabs/maple","image":null,"note":"The upstream README documents this local stack with API, web, ingest, and OpenTelemetry collector services.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://maple.dev/docs/local-mode/', 'https://github.com/MapleTechLabs/maple']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://github.com/MapleTechLabs/maple#docker-local']::text[],
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
    binary_urls = ARRAY['https://maple.dev/docs/local-mode/']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'db5c01d1-16e9-4612-9581-26c769aae4fa'::uuid AND a.slug = 'maple' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for maple'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/sergree/matchering/blob/master/DOCKER_LINUX.md',
    docker_url = 'https://hub.docker.com/r/sergree/matchering-web',
    docker_image = 'sergree/matchering-web:latest',
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/sergree/matchering/blob/master/DOCKER_LINUX.md', 'https://hub.docker.com/r/sergree/matchering-web']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/sergree/matchering/blob/master/DOCKER_LINUX.md', 'https://hub.docker.com/r/sergree/matchering-web')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names sergree/matchering-web:latest.','source_urls',jsonb_build_array('https://github.com/sergree/matchering/blob/master/DOCKER_LINUX.md', 'https://hub.docker.com/r/sergree/matchering-web'))),
    updated_at = now()
  WHERE a.id = '5a5625e9-1631-431e-a532-3f67d63f71fc'::uuid AND a.slug = 'matchering' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/sergree/matchering#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for matchering'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Matchering Web Docker image","url":"https://hub.docker.com/r/sergree/matchering-web","support_level":"official","source_url":"https://github.com/sergree/matchering/blob/master/DOCKER_LINUX.md","image":"sergree/matchering-web:latest","note":"Official Linux Docker guide gives the run command and persistent data volume.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/sergree/matchering/blob/master/DOCKER_LINUX.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/sergree/matchering-web']::text[],
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
    docker_images = ARRAY['sergree/matchering-web:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '5a5625e9-1631-431e-a532-3f67d63f71fc'::uuid AND a.slug = 'matchering' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for matchering'; END IF;

  UPDATE public.self_host_apps AS a SET
    deployment_methods = ARRAY['binary', 'other']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/stryan/materia', 'https://github.com/stryan/materia/releases', 'https://github.com/stryan/materia#with-podman']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'efa37443-cf4d-474f-bea0-79923f09acd5'::uuid AND a.slug = 'materia' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/stryan/materia' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for materia'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"binary","label":"Linux binary release","url":"https://github.com/stryan/materia/releases","support_level":"official","source_url":"https://github.com/stryan/materia","image":null,"note":"The upstream README directs users to architecture-specific release binaries.","sort_order":10},{"method":"other","label":"Podman container image","url":"https://github.com/stryan/materia#with-podman","support_level":"official","source_url":"https://github.com/stryan/materia","image":"ghcr.io/stryan/materia:stable","note":"Materia''s README says to run it with Podman, not Docker.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/stryan/materia']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    binary_urls = ARRAY['https://github.com/stryan/materia/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY['https://github.com/stryan/materia#with-podman']::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'efa37443-cf4d-474f-bea0-79923f09acd5'::uuid AND a.slug = 'materia' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for materia'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md',
    docker_url = 'https://hub.docker.com/r/wardpearce/materialious-full',
    docker_image = 'wardpearce/materialious-full:latest',
    compose_url = 'https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md', 'https://hub.docker.com/r/wardpearce/materialious-full']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md', 'https://hub.docker.com/r/wardpearce/materialious-full')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names wardpearce/materialious-full:latest.','source_urls',jsonb_build_array('https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md', 'https://hub.docker.com/r/wardpearce/materialious-full')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md'))),
    updated_at = now()
  WHERE a.id = '79b7ffb4-d737-48de-9929-c8ac03b81b19'::uuid AND a.slug = 'materialious' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Materialious/Materialious#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/Materialious/Materialious/blob/HEAD/materialious/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for materialious'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Materialious Full image","url":"https://hub.docker.com/r/wardpearce/materialious-full","support_level":"official","source_url":"https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md","image":"wardpearce/materialious-full:latest","note":"The full image includes the backend and account system; it differs from the front-end-only image.","sort_order":10},{"method":"compose","label":"Materialious Full Compose setup","url":"https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md","support_level":"official","source_url":"https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md","image":"wardpearce/materialious-full:latest","note":null,"sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/wardpearce/materialious-full']::text[],
    compose_urls = ARRAY['https://github.com/Materialious/Materialious/blob/main/docs/DOCKER-FULL.md']::text[],
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
    docker_images = ARRAY['wardpearce/materialious-full:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '79b7ffb4-d737-48de-9929-c8ac03b81b19'::uuid AND a.slug = 'materialious' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for materialious'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/',
    docker_url = 'https://hub.docker.com/_/matomo',
    docker_image = 'matomo:latest',
    compose_url = 'https://matomo.org/faq/how-to-install/install-matomo-with-docker/',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/', 'https://matomo.org/faq/how-to-install/install-matomo-with-docker/', 'https://hub.docker.com/_/matomo']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://matomo.org/faq/how-to-install/install-matomo-with-docker/', 'https://hub.docker.com/_/matomo')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names matomo:latest.','source_urls',jsonb_build_array('https://matomo.org/faq/how-to-install/install-matomo-with-docker/', 'https://hub.docker.com/_/matomo')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://matomo.org/faq/how-to-install/install-matomo-with-docker/'))),
    updated_at = now()
  WHERE a.id = '4febae8d-af0d-43a5-b8d6-fa4d074f1791'::uuid AND a.slug = 'matomo' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/matomo-org/matomo#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for matomo'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"On-premises installation","url":"https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/","support_level":"official","source_url":"https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/","image":null,"note":null,"sort_order":10},{"method":"docker","label":"Official Matomo Docker image","url":"https://hub.docker.com/_/matomo","support_level":"official","source_url":"https://matomo.org/faq/how-to-install/install-matomo-with-docker/","image":"matomo:latest","note":null,"sort_order":20},{"method":"compose","label":"Docker Compose setup","url":"https://matomo.org/faq/how-to-install/install-matomo-with-docker/","support_level":"official","source_url":"https://matomo.org/faq/how-to-install/install-matomo-with-docker/","image":"matomo:latest","note":"Official guide recommends Compose with MariaDB, persistent volumes, and a cron service.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/', 'https://matomo.org/faq/how-to-install/install-matomo-with-docker/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/_/matomo']::text[],
    compose_urls = ARRAY['https://matomo.org/faq/how-to-install/install-matomo-with-docker/']::text[],
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
    native_urls = ARRAY['https://matomo.org/guide/installation-maintenance/matomo-on-premise-self-hosted/']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['matomo:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '4febae8d-af0d-43a5-b8d6-fa4d074f1791'::uuid AND a.slug = 'matomo' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for matomo'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.mautic.org/en/7.0/getting_started/how_to_install_mautic.html',
    docker_url = 'https://hub.docker.com/r/mautic/mautic',
    docker_image = 'mautic/mautic:latest',
    compose_url = 'https://github.com/mautic/docker-mautic/tree/main/examples',
    deployment_methods = ARRAY['compose', 'docker', 'package']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.mautic.org/en/7.0/getting_started/how_to_install_mautic.html', 'https://github.com/mautic/docker-mautic', 'https://hub.docker.com/r/mautic/mautic', 'https://github.com/mautic/docker-mautic/tree/main/examples']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/mautic/docker-mautic', 'https://hub.docker.com/r/mautic/mautic', 'https://github.com/mautic/docker-mautic/tree/main/examples')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names mautic/mautic:latest.','source_urls',jsonb_build_array('https://github.com/mautic/docker-mautic', 'https://hub.docker.com/r/mautic/mautic', 'https://github.com/mautic/docker-mautic/tree/main/examples')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/mautic/docker-mautic', 'https://github.com/mautic/docker-mautic/tree/main/examples'))),
    updated_at = now()
  WHERE a.id = '40053fd2-5ddd-4498-9a77-00949a25b90d'::uuid AND a.slug = 'mautic' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/mautic/mautic#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mautic'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"package","label":"Mautic production package","url":"https://docs.mautic.org/en/7.0/getting_started/how_to_install_mautic.html","support_level":"official","source_url":"https://docs.mautic.org/en/7.0/getting_started/how_to_install_mautic.html","image":null,"note":"Official install docs link to the downloadable stable production package.","sort_order":10},{"method":"docker","label":"Official Mautic Docker image","url":"https://hub.docker.com/r/mautic/mautic","support_level":"official","source_url":"https://github.com/mautic/docker-mautic","image":"mautic/mautic:latest","note":"The upstream Docker project identifies this as its official image and recommends Apache over FPM for now.","sort_order":20},{"method":"compose","label":"Mautic Compose examples","url":"https://github.com/mautic/docker-mautic/tree/main/examples","support_level":"official","source_url":"https://github.com/mautic/docker-mautic","image":"mautic/mautic:latest","note":"The official Docker repository includes Compose examples; review and configure them before production use.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.mautic.org/en/7.0/getting_started/how_to_install_mautic.html', 'https://github.com/mautic/docker-mautic']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/mautic/mautic']::text[],
    compose_urls = ARRAY['https://github.com/mautic/docker-mautic/tree/main/examples']::text[],
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
    package_urls = ARRAY['https://docs.mautic.org/en/7.0/getting_started/how_to_install_mautic.html']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['mautic/mautic:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '40053fd2-5ddd-4498-9a77-00949a25b90d'::uuid AND a.slug = 'mautic' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mautic'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.maxkb.pro/quick_start/',
    docker_url = 'https://hub.docker.com/r/1panel/maxkb',
    docker_image = '1panel/maxkb:latest',
    deployment_methods = ARRAY['docker']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.maxkb.pro/quick_start/', 'https://hub.docker.com/r/1panel/maxkb']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://docs.maxkb.pro/quick_start/', 'https://hub.docker.com/r/1panel/maxkb')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names 1panel/maxkb:latest.','source_urls',jsonb_build_array('https://docs.maxkb.pro/quick_start/', 'https://hub.docker.com/r/1panel/maxkb'))),
    updated_at = now()
  WHERE a.id = '27796ef9-e874-4fcb-af5a-cfe627fdbf31'::uuid AND a.slug = 'maxkb' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/1panel-dev/maxkb#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for maxkb'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"MaxKB Docker image","url":"https://hub.docker.com/r/1panel/maxkb","support_level":"official","source_url":"https://docs.maxkb.pro/quick_start/","image":"1panel/maxkb:latest","note":"Official quick start provides the Docker run command and persistence mounts.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.maxkb.pro/quick_start/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/1panel/maxkb']::text[],
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
    docker_images = ARRAY['1panel/maxkb:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '27796ef9-e874-4fcb-af5a-cfe627fdbf31'::uuid AND a.slug = 'maxkb' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for maxkb'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://medama.mintlify.app/deployment/installation',
    docker_url = 'https://github.com/medama-io/medama/pkgs/container/medama',
    docker_image = 'ghcr.io/medama-io/medama:edge',
    deployment_methods = ARRAY['binary', 'docker']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://medama.mintlify.app/deployment/installation', 'https://github.com/medama-io/medama/pkgs/container/medama', 'https://github.com/medama-io/medama/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://medama.mintlify.app/deployment/installation', 'https://github.com/medama-io/medama/pkgs/container/medama')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/medama-io/medama:edge.','source_urls',jsonb_build_array('https://medama.mintlify.app/deployment/installation', 'https://github.com/medama-io/medama/pkgs/container/medama'))),
    updated_at = now()
  WHERE a.id = '0924fed4-4596-4c4c-929a-e75b33142c8f'::uuid AND a.slug = 'medama-analytics' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/medama-io/medama#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/medama-io/medama/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for medama-analytics'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Medama Docker image","url":"https://github.com/medama-io/medama/pkgs/container/medama","support_level":"official","source_url":"https://medama.mintlify.app/deployment/installation","image":"ghcr.io/medama-io/medama:edge","note":"The GHCR package lists the edge tag; it does not currently list a latest tag.","sort_order":10},{"method":"binary","label":"Single binary release","url":"https://github.com/medama-io/medama/releases","support_level":"official","source_url":"https://medama.mintlify.app/deployment/installation","image":null,"note":"The official install guide also documents a standalone binary.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://medama.mintlify.app/deployment/installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/medama-io/medama/pkgs/container/medama']::text[],
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
    binary_urls = ARRAY['https://github.com/medama-io/medama/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/medama-io/medama:edge']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '0924fed4-4596-4c4c-929a-e75b33142c8f'::uuid AND a.slug = 'medama-analytics' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for medama-analytics'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://mediamtx.org/docs/kickoff/install',
    docker_url = 'https://hub.docker.com/r/bluenviron/mediamtx',
    docker_image = 'bluenviron/mediamtx:1',
    deployment_methods = ARRAY['binary', 'docker']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://mediamtx.org/docs/kickoff/install', 'https://hub.docker.com/r/bluenviron/mediamtx', 'https://github.com/bluenviron/mediamtx/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://mediamtx.org/docs/kickoff/install', 'https://hub.docker.com/r/bluenviron/mediamtx')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names bluenviron/mediamtx:1.','source_urls',jsonb_build_array('https://mediamtx.org/docs/kickoff/install', 'https://hub.docker.com/r/bluenviron/mediamtx'))),
    updated_at = now()
  WHERE a.id = '0c290ad4-ae83-43b9-8b46-f792953e10e4'::uuid AND a.slug = 'mediamtx' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bluenviron/mediamtx#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mediamtx'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"MediaMTX Docker image","url":"https://hub.docker.com/r/bluenviron/mediamtx","support_level":"official","source_url":"https://mediamtx.org/docs/kickoff/install","image":"bluenviron/mediamtx:1","note":"Official docs list the maintained image variants and explain that tag 1 follows the current 1.x release line.","sort_order":10},{"method":"binary","label":"Standalone binary","url":"https://github.com/bluenviron/mediamtx/releases","support_level":"official","source_url":"https://mediamtx.org/docs/kickoff/install","image":null,"note":"Official install guide also documents standalone binaries.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://mediamtx.org/docs/kickoff/install']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/bluenviron/mediamtx']::text[],
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
    binary_urls = ARRAY['https://github.com/bluenviron/mediamtx/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['bluenviron/mediamtx:1']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '0c290ad4-ae83-43b9-8b46-f792953e10e4'::uuid AND a.slug = 'mediamtx' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mediamtx'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/pymedusa/Medusa/blob/master/readme.md',
    docker_url = 'https://hub.docker.com/r/pymedusa/medusa',
    docker_image = 'pymedusa/medusa:master',
    compose_url = 'https://github.com/pymedusa/Medusa/blob/master/readme.md#usage',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/pymedusa/Medusa/blob/master/readme.md', 'https://hub.docker.com/r/pymedusa/medusa', 'https://docs.linuxserver.io/images/docker-medusa/', 'https://github.com/pymedusa/Medusa/blob/master/readme.md#usage']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/pymedusa/Medusa/blob/master/readme.md', 'https://hub.docker.com/r/pymedusa/medusa', 'https://github.com/pymedusa/Medusa/blob/master/readme.md#usage', 'https://docs.linuxserver.io/images/docker-medusa/')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names pymedusa/medusa:master, lscr.io/linuxserver/medusa:latest.','source_urls',jsonb_build_array('https://github.com/pymedusa/Medusa/blob/master/readme.md', 'https://hub.docker.com/r/pymedusa/medusa', 'https://github.com/pymedusa/Medusa/blob/master/readme.md#usage', 'https://docs.linuxserver.io/images/docker-medusa/')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/pymedusa/Medusa/blob/master/readme.md', 'https://github.com/pymedusa/Medusa/blob/master/readme.md#usage'))),
    updated_at = now()
  WHERE a.id = '2920edd4-34a8-4256-aaeb-98cff8c97067'::uuid AND a.slug = 'medusa' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/pymedusa/Medusa#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/pymedusa/Medusa/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for medusa'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Official PyMedusa Docker image","url":"https://hub.docker.com/r/pymedusa/medusa","support_level":"official","source_url":"https://github.com/pymedusa/Medusa/blob/master/readme.md","image":"pymedusa/medusa:master","note":"Upstream README identifies the master tag for release builds.","sort_order":10},{"method":"compose","label":"Official PyMedusa Compose setup","url":"https://github.com/pymedusa/Medusa/blob/master/readme.md#usage","support_level":"official","source_url":"https://github.com/pymedusa/Medusa/blob/master/readme.md","image":"pymedusa/medusa:master","note":"Upstream README recommends Compose and includes a setup example.","sort_order":20},{"method":"docker","label":"LinuxServer community image","url":"https://docs.linuxserver.io/images/docker-medusa/","support_level":"community","source_url":"https://docs.linuxserver.io/images/docker-medusa/","image":"lscr.io/linuxserver/medusa:latest","note":"The upstream README credits LinuxServer as its alternative image provider.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/pymedusa/Medusa/blob/master/readme.md', 'https://docs.linuxserver.io/images/docker-medusa/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/pymedusa/medusa', 'https://docs.linuxserver.io/images/docker-medusa/']::text[],
    compose_urls = ARRAY['https://github.com/pymedusa/Medusa/blob/master/readme.md#usage']::text[],
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
    docker_images = ARRAY['pymedusa/medusa:master', 'lscr.io/linuxserver/medusa:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2920edd4-34a8-4256-aaeb-98cff8c97067'::uuid AND a.slug = 'medusa' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for medusa'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.medusajs.com/learn/installation',
    compose_url = 'https://docs.medusajs.com/learn/installation/docker',
    deployment_methods = ARRAY['compose', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.medusajs.com/learn/installation', 'https://docs.medusajs.com/learn/installation/docker', 'https://github.com/medusajs/docker-medusa']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://docs.medusajs.com/learn/installation/docker')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://docs.medusajs.com/learn/installation/docker'))),
    updated_at = now()
  WHERE a.id = 'f01cfd06-9d57-4744-90d6-52cf97465acb'::uuid AND a.slug = 'medusajs' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/medusajs/medusa#readme' AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for medusajs'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Create a Medusa app","url":"https://docs.medusajs.com/learn/installation","support_level":"official","source_url":"https://docs.medusajs.com/learn/installation","image":null,"note":"Official quickstart uses create-medusa-app and PostgreSQL.","sort_order":10},{"method":"compose","label":"Official Docker install tutorial","url":"https://docs.medusajs.com/learn/installation/docker","support_level":"official","source_url":"https://docs.medusajs.com/learn/installation/docker","image":null,"note":"The official Docker tutorial starts a project-specific Compose stack; it does not publish a general Medusa image. The separate medusajs/docker-medusa repository is community-managed and for development, so it is not listed as an official image route.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.medusajs.com/learn/installation', 'https://docs.medusajs.com/learn/installation/docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://docs.medusajs.com/learn/installation/docker']::text[],
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
    native_urls = ARRAY['https://docs.medusajs.com/learn/installation']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'f01cfd06-9d57-4744-90d6-52cf97465acb'::uuid AND a.slug = 'medusajs' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for medusajs'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.mem0.ai/open-source/setup',
    compose_url = 'https://docs.mem0.ai/open-source/setup',
    deployment_methods = ARRAY['compose']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.mem0.ai/open-source/setup', 'https://github.com/mem0ai/mem0']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://docs.mem0.ai/open-source/setup')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://docs.mem0.ai/open-source/setup'))),
    updated_at = now()
  WHERE a.id = '2b168a0b-b68d-41de-bd48-23324d929508'::uuid AND a.slug = 'mem0' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/mem0ai/mem0#readme' AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for mem0'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Mem0 self-hosted Compose setup","url":"https://docs.mem0.ai/open-source/setup","support_level":"official","source_url":"https://docs.mem0.ai/open-source/setup","image":null,"note":"Official self-host guide starts the API and dashboard with the repository''s Docker Compose setup.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.mem0.ai/open-source/setup']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://docs.mem0.ai/open-source/setup']::text[],
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
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '2b168a0b-b68d-41de-bd48-23324d929508'::uuid AND a.slug = 'mem0' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for mem0'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://memgraph.com/docs/getting-started/install-memgraph/docker',
    docker_url = 'https://hub.docker.com/r/memgraph/memgraph-mage',
    docker_image = 'memgraph/memgraph-mage:latest',
    compose_url = 'https://memgraph.com/docs/getting-started/install-memgraph/docker',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://memgraph.com/docs/getting-started/install-memgraph/docker', 'https://hub.docker.com/r/memgraph/memgraph-mage']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://memgraph.com/docs/getting-started/install-memgraph/docker', 'https://hub.docker.com/r/memgraph/memgraph-mage')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names memgraph/memgraph-mage:latest.','source_urls',jsonb_build_array('https://memgraph.com/docs/getting-started/install-memgraph/docker', 'https://hub.docker.com/r/memgraph/memgraph-mage')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://memgraph.com/docs/getting-started/install-memgraph/docker'))),
    updated_at = now()
  WHERE a.id = '4e6b2777-71f2-4532-a747-4a94c039f09e'::uuid AND a.slug = 'memgraph' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/memgraph/memgraph#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for memgraph'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Memgraph MAGE Docker image","url":"https://hub.docker.com/r/memgraph/memgraph-mage","support_level":"official","source_url":"https://memgraph.com/docs/getting-started/install-memgraph/docker","image":"memgraph/memgraph-mage:latest","note":"Official guide recommends this image for Memgraph with MAGE.","sort_order":10},{"method":"compose","label":"Memgraph and Lab Compose setup","url":"https://memgraph.com/docs/getting-started/install-memgraph/docker","support_level":"official","source_url":"https://memgraph.com/docs/getting-started/install-memgraph/docker","image":"memgraph/memgraph-mage:latest","note":"The official docs provide a Compose example with Memgraph and Memgraph Lab.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://memgraph.com/docs/getting-started/install-memgraph/docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/memgraph/memgraph-mage']::text[],
    compose_urls = ARRAY['https://memgraph.com/docs/getting-started/install-memgraph/docker']::text[],
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
    docker_images = ARRAY['memgraph/memgraph-mage:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '4e6b2777-71f2-4532-a747-4a94c039f09e'::uuid AND a.slug = 'memgraph' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for memgraph'; END IF;
END $$;
COMMIT;
