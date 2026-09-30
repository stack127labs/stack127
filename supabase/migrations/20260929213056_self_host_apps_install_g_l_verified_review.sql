-- Reviewed G-L install destinations against upstream project documentation.
-- App identity, current app facts, and empty install-option guards protect this batch.
BEGIN;
DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/bytedance/g3/blob/master/g3proxy/UserGuide.en_US.md',
    deployment_methods = ARRAY['package']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/bytedance/g3/blob/master/g3proxy/UserGuide.en_US.md', 'https://cloudsmith.io/~g3-oqh/repos/g3-stable/packages/?q=name%3Ag3proxy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '6ea6778b-3430-47ae-bc0e-54cbcb7a868b'::uuid AND a.slug = 'g3proxy' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://g3-project.readthedocs.io/projects/g3proxy/en/latest/' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for g3proxy'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"package","label":"Linux packages","url":"https://cloudsmith.io/~g3-oqh/repos/g3-stable/packages/?q=name%3Ag3proxy","support_level":"official","source_url":"https://github.com/bytedance/g3/blob/master/g3proxy/UserGuide.en_US.md","image":null,"note":"The guide supports Debian and RHEL packages; G3 publishes Debian packages through its Cloudsmith repository.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/bytedance/g3/blob/master/g3proxy/UserGuide.en_US.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    package_urls = ARRAY['https://cloudsmith.io/~g3-oqh/repos/g3-stable/packages/?q=name%3Ag3proxy']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '6ea6778b-3430-47ae-bc0e-54cbcb7a868b'::uuid AND a.slug = 'g3proxy' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for g3proxy'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://galene.org/galene-install.html',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://galene.org/galene-install.html', 'https://github.com/jech/galene']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = 'b5943e99-f0a4-4e09-807c-09038ead27d9'::uuid AND a.slug = 'galene' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/jech/galene#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for galene'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Native installation","url":"https://galene.org/galene-install.html","support_level":"official","source_url":"https://galene.org/galene-install.html","image":null,"note":"The official guide explains how to build the server binary, copy it to a Linux host, and run it as a service.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://galene.org/galene-install.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://galene.org/galene-install.html']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b5943e99-f0a4-4e09-807c-09038ead27d9'::uuid AND a.slug = 'galene' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for galene'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://doc.galette.eu/en/master/installation/index.html',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://doc.galette.eu/en/master/installation/index.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '31f7c79d-57f1-489a-a366-87e3b5be8bcc'::uuid AND a.slug = 'galette' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/galette/galette#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for galette'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Native installation","url":"https://doc.galette.eu/en/master/installation/index.html","support_level":"official","source_url":"https://doc.galette.eu/en/master/installation/index.html","image":null,"note":"The official guide installs the release archive on a web server and finishes setup in the browser.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://doc.galette.eu/en/master/installation/index.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://doc.galette.eu/en/master/installation/index.html']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '31f7c79d-57f1-489a-a366-87e3b5be8bcc'::uuid AND a.slug = 'galette' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for galette'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://games-on-whales.github.io/wolf/stable/user/quickstart.html',
    docker_url = 'https://github.com/games-on-whales/wolf/pkgs/container/wolf',
    docker_image = 'ghcr.io/games-on-whales/wolf:stable',
    compose_url = 'https://games-on-whales.github.io/wolf/stable/user/quickstart.html',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://games-on-whales.github.io/wolf/stable/user/quickstart.html', 'https://github.com/games-on-whales/wolf/pkgs/container/wolf']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://games-on-whales.github.io/wolf/stable/user/quickstart.html', 'https://github.com/games-on-whales/wolf/pkgs/container/wolf')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/games-on-whales/wolf:stable.','source_urls',jsonb_build_array('https://games-on-whales.github.io/wolf/stable/user/quickstart.html', 'https://github.com/games-on-whales/wolf/pkgs/container/wolf')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://games-on-whales.github.io/wolf/stable/user/quickstart.html'))),
    updated_at = now()
  WHERE a.id = '6d385058-0102-4cdf-b4b8-7854c0e3bafb'::uuid AND a.slug = 'games-on-whales' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/games-on-whales/wolf#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for games-on-whales'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/games-on-whales/wolf/pkgs/container/wolf","support_level":"official","source_url":"https://games-on-whales.github.io/wolf/stable/user/quickstart.html","image":"ghcr.io/games-on-whales/wolf:stable","note":null,"sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://games-on-whales.github.io/wolf/stable/user/quickstart.html","support_level":"official","source_url":"https://games-on-whales.github.io/wolf/stable/user/quickstart.html","image":"ghcr.io/games-on-whales/wolf:stable","note":"The official guide includes Compose files but says they are less stable than the manual setup.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://games-on-whales.github.io/wolf/stable/user/quickstart.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/games-on-whales/wolf/pkgs/container/wolf']::text[],
    compose_urls = ARRAY['https://games-on-whales.github.io/wolf/stable/user/quickstart.html']::text[],
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
    docker_images = ARRAY['ghcr.io/games-on-whales/wolf:stable']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '6d385058-0102-4cdf-b4b8-7854c0e3bafb'::uuid AND a.slug = 'games-on-whales' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for games-on-whales'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md',
    docker_url = 'https://hub.docker.com/r/dxflrs/garage',
    docker_image = 'dxflrs/garage:v2.4.1',
    compose_url = 'https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md', 'https://hub.docker.com/r/dxflrs/garage']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md', 'https://hub.docker.com/r/dxflrs/garage')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names dxflrs/garage:v2.4.1.','source_urls',jsonb_build_array('https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md', 'https://hub.docker.com/r/dxflrs/garage')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md'))),
    updated_at = now()
  WHERE a.id = '939f0283-e49a-40a6-afed-806b2a3220d0'::uuid AND a.slug = 'garage' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://garagehq.deuxfleurs.fr/documentation/quick-start/' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for garage'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/dxflrs/garage","support_level":"official","source_url":"https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md","image":"dxflrs/garage:v2.4.1","note":"The project recommends a fixed version tag instead of latest.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md","support_level":"official","source_url":"https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md","image":"dxflrs/garage:v2.4.1","note":"The official cookbook includes a Compose example and uses host networking for cluster communication.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/dxflrs/garage']::text[],
    compose_urls = ARRAY['https://github.com/deuxfleurs-org/garage/blob/main-v2/doc/book/cookbook/real-world.md']::text[],
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
    docker_images = ARRAY['dxflrs/garage:v2.4.1']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '939f0283-e49a-40a6-afed-806b2a3220d0'::uuid AND a.slug = 'garage' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for garage'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://garlic-signage.com/garlic-hub/installation/',
    docker_url = 'https://hub.docker.com/r/sagiadinos/garlic-hub',
    docker_image = 'sagiadinos/garlic-hub:latest',
    compose_url = 'https://garlic-signage.com/garlic-hub/installation/',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://garlic-signage.com/garlic-hub/installation/', 'https://hub.docker.com/r/sagiadinos/garlic-hub']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://garlic-signage.com/garlic-hub/installation/', 'https://hub.docker.com/r/sagiadinos/garlic-hub')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names sagiadinos/garlic-hub:latest.','source_urls',jsonb_build_array('https://garlic-signage.com/garlic-hub/installation/', 'https://hub.docker.com/r/sagiadinos/garlic-hub')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://garlic-signage.com/garlic-hub/installation/'))),
    updated_at = now()
  WHERE a.id = 'be90fd9f-16ba-4af4-bf8c-f2f5faa8cc73'::uuid AND a.slug = 'garlic-hub' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/garlic-signage/garlic-hub#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for garlic-hub'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/sagiadinos/garlic-hub","support_level":"official","source_url":"https://garlic-signage.com/garlic-hub/installation/","image":"sagiadinos/garlic-hub:latest","note":null,"sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://garlic-signage.com/garlic-hub/installation/","support_level":"official","source_url":"https://garlic-signage.com/garlic-hub/installation/","image":null,"note":"The official guide shows Compose installation from the project repository with a build step.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://garlic-signage.com/garlic-hub/installation/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/sagiadinos/garlic-hub']::text[],
    compose_urls = ARRAY['https://garlic-signage.com/garlic-hub/installation/']::text[],
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
    docker_images = ARRAY['sagiadinos/garlic-hub:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'be90fd9f-16ba-4af4-bf8c-f2f5faa8cc73'::uuid AND a.slug = 'garlic-hub' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for garlic-hub'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/genea-app/genea-app#installation',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/genea-app/genea-app#installation', 'https://www.genea.app/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '1a14c4a9-653a-4c0f-884f-3b524a3597fe'::uuid AND a.slug = 'genea-app' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/genea-app/genea-app#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for genea-app'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Self-hosted static site","url":"https://github.com/genea-app/genea-app#installation","support_level":"official","source_url":"https://github.com/genea-app/genea-app#installation","image":null,"note":"The project says to unpack the files and serve them over HTTPS; the app has no server-side components.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/genea-app/genea-app#installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://github.com/genea-app/genea-app#installation']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '1a14c4a9-653a-4c0f-884f-3b524a3597fe'::uuid AND a.slug = 'genea-app' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for genea-app'; END IF;

  UPDATE public.self_host_apps AS a SET
    deployment_methods = ARRAY['binary', 'native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/lsdefine/GenericAgent/blob/main/docs/installation.md', 'https://github.com/lsdefine/GenericAgent/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '116c410b-8cd7-4c43-b46d-4499759dc4bf'::uuid AND a.slug = 'genericagent' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/lsdefine/GenericAgent/blob/main/docs/installation.md' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['package', 'source']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for genericagent'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Python installation","url":"https://github.com/lsdefine/GenericAgent/blob/main/docs/installation.md","support_level":"official","source_url":"https://github.com/lsdefine/GenericAgent/blob/main/docs/installation.md","image":null,"note":"The official guide supports a one-line Linux/macOS installer or cloning the project and installing its Python dependencies.","sort_order":10},{"method":"binary","label":"Desktop releases","url":"https://github.com/lsdefine/GenericAgent/releases","support_level":"official","source_url":"https://github.com/lsdefine/GenericAgent/releases","image":null,"note":"The release page includes a Windows executable and a macOS disk image.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/lsdefine/GenericAgent/blob/main/docs/installation.md', 'https://github.com/lsdefine/GenericAgent/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://github.com/lsdefine/GenericAgent/blob/main/docs/installation.md']::text[],
    binary_urls = ARRAY['https://github.com/lsdefine/GenericAgent/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '116c410b-8cd7-4c43-b46d-4499759dc4bf'::uuid AND a.slug = 'genericagent' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for genericagent'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/geneweb/geneweb',
    docker_url = 'https://hub.docker.com/r/jeffernz/geneweb',
    docker_image = 'jeffernz/geneweb:latest',
    deployment_methods = ARRAY['binary', 'docker']::text[],
    docker_support = 'community',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/geneweb/geneweb', 'https://geneweb.tuxfamily.org/wiki/Docker', 'https://github.com/geneweb/geneweb/releases/latest', 'https://hub.docker.com/r/jeffernz/geneweb']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','A community-maintained Docker route is documented in the linked sources.','source_urls',jsonb_build_array('https://geneweb.tuxfamily.org/wiki/Docker', 'https://hub.docker.com/r/jeffernz/geneweb')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names jeffernz/geneweb:latest.','source_urls',jsonb_build_array('https://geneweb.tuxfamily.org/wiki/Docker', 'https://hub.docker.com/r/jeffernz/geneweb'))),
    updated_at = now()
  WHERE a.id = '80c1b5c9-559b-459d-9987-67dfcb37c60c'::uuid AND a.slug = 'geneweb' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/geneweb/geneweb#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/geneweb/geneweb/blob/HEAD/docker/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for geneweb'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"binary","label":"Prebuilt binaries","url":"https://github.com/geneweb/geneweb/releases/latest","support_level":"official","source_url":"https://github.com/geneweb/geneweb","image":null,"note":"The upstream README provides Linux, macOS, and Windows downloads and launch steps. The current release is marked beta.","sort_order":10},{"method":"docker","label":"Community Docker image","url":"https://hub.docker.com/r/jeffernz/geneweb","support_level":"community","source_url":"https://geneweb.tuxfamily.org/wiki/Docker","image":"jeffernz/geneweb:latest","note":"The upstream wiki lists this third-party image. It uses an old Ubuntu 19.04 base in the documented example; verify current maintenance before recommending it.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/geneweb/geneweb', 'https://geneweb.tuxfamily.org/wiki/Docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/jeffernz/geneweb']::text[],
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
    binary_urls = ARRAY['https://github.com/geneweb/geneweb/releases/latest']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['jeffernz/geneweb:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '80c1b5c9-559b-459d-9987-67dfcb37c60c'::uuid AND a.slug = 'geneweb' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for geneweb'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/garanda21/geoposler',
    docker_url = NULL,
    compose_url = 'https://github.com/garanda21/geoposler#docker-compose-example',
    deployment_methods = ARRAY['compose']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/garanda21/geoposler', 'https://github.com/garanda21/geoposler#docker-compose-example']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/garanda21/geoposler', 'https://github.com/garanda21/geoposler#docker-compose-example')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/garanda21/geoposler:latest.','source_urls',jsonb_build_array('https://github.com/garanda21/geoposler', 'https://github.com/garanda21/geoposler#docker-compose-example')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/garanda21/geoposler', 'https://github.com/garanda21/geoposler#docker-compose-example'))),
    updated_at = now()
  WHERE a.id = '51932ef4-6ab2-48a3-8442-ce5a8c2b8a29'::uuid AND a.slug = 'geoposler' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/garanda21/geoposler#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/garanda21/geoposler/blob/HEAD/Dockerfile' AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for geoposler'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"compose","label":"Docker Compose","url":"https://github.com/garanda21/geoposler#docker-compose-example","support_level":"official","source_url":"https://github.com/garanda21/geoposler","image":"ghcr.io/garanda21/geoposler:latest","note":"The README provides a Compose configuration for GeoPosler and MySQL. The repository was archived on 2026-02-24.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/garanda21/geoposler']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY[]::text[],
    compose_urls = ARRAY['https://github.com/garanda21/geoposler#docker-compose-example']::text[],
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
  WHERE i.app_id = a.id AND a.id = '51932ef4-6ab2-48a3-8442-ce5a8c2b8a29'::uuid AND a.slug = 'geoposler' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for geoposler'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.gerbera.io/en/latest/install.html',
    docker_url = 'https://hub.docker.com/r/gerbera/gerbera',
    docker_image = 'gerbera/gerbera',
    deployment_methods = ARRAY['docker', 'package']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.gerbera.io/en/latest/install.html', 'https://hub.docker.com/r/gerbera/gerbera']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://docs.gerbera.io/en/latest/install.html', 'https://hub.docker.com/r/gerbera/gerbera')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names gerbera/gerbera.','source_urls',jsonb_build_array('https://docs.gerbera.io/en/latest/install.html', 'https://hub.docker.com/r/gerbera/gerbera'))),
    updated_at = now()
  WHERE a.id = '221ef295-a490-4b74-94dd-285b15ac0f36'::uuid AND a.slug = 'gerbera' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/gerbera/gerbera#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/gerbera/gerbera/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for gerbera'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/gerbera/gerbera","support_level":"official","source_url":"https://docs.gerbera.io/en/latest/install.html","image":"gerbera/gerbera","note":null,"sort_order":10},{"method":"package","label":"Linux packages","url":"https://docs.gerbera.io/en/latest/install.html","support_level":"official","source_url":"https://docs.gerbera.io/en/latest/install.html","image":null,"note":"The official guide lists distribution packages and Gerbera-maintained Debian and Ubuntu repositories.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.gerbera.io/en/latest/install.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/gerbera/gerbera']::text[],
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
    package_urls = ARRAY['https://docs.gerbera.io/en/latest/install.html']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['gerbera/gerbera']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '221ef295-a490-4b74-94dd-285b15ac0f36'::uuid AND a.slug = 'gerbera' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for gerbera'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/AkashRajpurohit/git-sync/wiki/Installation',
    docker_url = 'https://github.com/AkashRajpurohit/git-sync/pkgs/container/git-sync',
    docker_image = 'ghcr.io/akashrajpurohit/git-sync:latest',
    compose_url = 'https://github.com/AkashRajpurohit/git-sync/wiki/Installation',
    deployment_methods = ARRAY['binary', 'compose', 'docker']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/AkashRajpurohit/git-sync/wiki/Installation', 'https://github.com/AkashRajpurohit/git-sync/pkgs/container/git-sync', 'https://github.com/AkashRajpurohit/git-sync/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/AkashRajpurohit/git-sync/wiki/Installation', 'https://github.com/AkashRajpurohit/git-sync/pkgs/container/git-sync')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/akashrajpurohit/git-sync:latest.','source_urls',jsonb_build_array('https://github.com/AkashRajpurohit/git-sync/wiki/Installation', 'https://github.com/AkashRajpurohit/git-sync/pkgs/container/git-sync')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/AkashRajpurohit/git-sync/wiki/Installation'))),
    updated_at = now()
  WHERE a.id = '1ff06790-c7ed-43c0-b0fb-8cfcbc29aa7f'::uuid AND a.slug = 'git-sync' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/AkashRajpurohit/git-sync#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/AkashRajpurohit/git-sync/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for git-sync'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/AkashRajpurohit/git-sync/pkgs/container/git-sync","support_level":"official","source_url":"https://github.com/AkashRajpurohit/git-sync/wiki/Installation","image":"ghcr.io/akashrajpurohit/git-sync:latest","note":null,"sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/AkashRajpurohit/git-sync/wiki/Installation","support_level":"official","source_url":"https://github.com/AkashRajpurohit/git-sync/wiki/Installation","image":"ghcr.io/akashrajpurohit/git-sync:latest","note":"The upstream install guide includes a Compose service.","sort_order":20},{"method":"binary","label":"Prebuilt binaries","url":"https://github.com/AkashRajpurohit/git-sync/releases","support_level":"official","source_url":"https://github.com/AkashRajpurohit/git-sync/wiki/Installation","image":null,"note":"The install guide links to platform-specific prebuilt releases.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/AkashRajpurohit/git-sync/wiki/Installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/AkashRajpurohit/git-sync/pkgs/container/git-sync']::text[],
    compose_urls = ARRAY['https://github.com/AkashRajpurohit/git-sync/wiki/Installation']::text[],
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
    binary_urls = ARRAY['https://github.com/AkashRajpurohit/git-sync/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/akashrajpurohit/git-sync:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '1ff06790-c7ed-43c0-b0fb-8cfcbc29aa7f'::uuid AND a.slug = 'git-sync' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for git-sync'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/gitbucket/gitbucket/blob/master/README.md',
    docker_url = 'https://github.com/gitbucket/gitbucket-docker/pkgs/container/gitbucket',
    docker_image = 'ghcr.io/gitbucket/gitbucket:latest',
    deployment_methods = ARRAY['binary', 'docker']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/gitbucket/gitbucket/blob/master/README.md', 'https://github.com/gitbucket/gitbucket-docker/pkgs/container/gitbucket', 'https://github.com/gitbucket/gitbucket/releases/latest', 'https://github.com/gitbucket/gitbucket-docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/gitbucket/gitbucket-docker', 'https://github.com/gitbucket/gitbucket-docker/pkgs/container/gitbucket')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/gitbucket/gitbucket:latest.','source_urls',jsonb_build_array('https://github.com/gitbucket/gitbucket-docker', 'https://github.com/gitbucket/gitbucket-docker/pkgs/container/gitbucket'))),
    updated_at = now()
  WHERE a.id = 'c7375bf3-db46-410b-916d-6b7b9b24ff22'::uuid AND a.slug = 'gitbucket' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/gitbucket/gitbucket#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for gitbucket'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"binary","label":"WAR release","url":"https://github.com/gitbucket/gitbucket/releases/latest","support_level":"official","source_url":"https://github.com/gitbucket/gitbucket/blob/master/README.md","image":null,"note":"Requires Java 17; the WAR can run with java -jar or in a supported servlet container.","sort_order":10},{"method":"docker","label":"Docker image","url":"https://github.com/gitbucket/gitbucket-docker/pkgs/container/gitbucket","support_level":"official","source_url":"https://github.com/gitbucket/gitbucket-docker","image":"ghcr.io/gitbucket/gitbucket:latest","note":"The GitBucket organization publishes this image from its Docker repository.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/gitbucket/gitbucket/blob/master/README.md', 'https://github.com/gitbucket/gitbucket-docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/gitbucket/gitbucket-docker/pkgs/container/gitbucket']::text[],
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
    binary_urls = ARRAY['https://github.com/gitbucket/gitbucket/releases/latest']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/gitbucket/gitbucket:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'c7375bf3-db46-410b-916d-6b7b9b24ff22'::uuid AND a.slug = 'gitbucket' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for gitbucket'; END IF;

  UPDATE public.self_host_apps AS a SET
    docker_url = 'https://hub.docker.com/r/breizhhardware/github-ntfy',
    docker_image = 'breizhhardware/github-ntfy:latest',
    compose_url = 'https://github.com/BreizhHardware/ntfy_alerts#installation',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/BreizhHardware/ntfy_alerts', 'https://hub.docker.com/r/breizhhardware/github-ntfy', 'https://github.com/BreizhHardware/ntfy_alerts#installation', 'https://github.com/BreizhHardware/ntfy_alerts#manual-installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/BreizhHardware/ntfy_alerts', 'https://hub.docker.com/r/breizhhardware/github-ntfy', 'https://github.com/BreizhHardware/ntfy_alerts#installation')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names breizhhardware/github-ntfy:latest.','source_urls',jsonb_build_array('https://github.com/BreizhHardware/ntfy_alerts', 'https://hub.docker.com/r/breizhhardware/github-ntfy', 'https://github.com/BreizhHardware/ntfy_alerts#installation')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/BreizhHardware/ntfy_alerts#installation'))),
    updated_at = now()
  WHERE a.id = '5239687d-c00c-4b97-b750-d1f696b15d29'::uuid AND a.slug = 'github-ntfy' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/BreizhHardware/ntfy_alerts' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/BreizhHardware/ntfy_alerts' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for github-ntfy'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/breizhhardware/github-ntfy","support_level":"official","source_url":"https://github.com/BreizhHardware/ntfy_alerts","image":"breizhhardware/github-ntfy:latest","note":null,"sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/BreizhHardware/ntfy_alerts#installation","support_level":"official","source_url":"https://github.com/BreizhHardware/ntfy_alerts#installation","image":"breizhhardware/github-ntfy:latest","note":"The README recommends Docker and supplies a Compose service.","sort_order":20},{"method":"native","label":"Manual installation","url":"https://github.com/BreizhHardware/ntfy_alerts#manual-installation","support_level":"official","source_url":"https://github.com/BreizhHardware/ntfy_alerts#manual-installation","image":null,"note":"The README documents compiling and running the Rust application.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/BreizhHardware/ntfy_alerts', 'https://github.com/BreizhHardware/ntfy_alerts#installation', 'https://github.com/BreizhHardware/ntfy_alerts#manual-installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/breizhhardware/github-ntfy']::text[],
    compose_urls = ARRAY['https://github.com/BreizhHardware/ntfy_alerts#installation']::text[],
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
    native_urls = ARRAY['https://github.com/BreizhHardware/ntfy_alerts#manual-installation']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['breizhhardware/github-ntfy:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '5239687d-c00c-4b97-b750-d1f696b15d29'::uuid AND a.slug = 'github-ntfy' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for github-ntfy'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/iamspido/github-release-monitor',
    docker_url = 'https://github.com/iamspido/github-release-monitor/pkgs/container/github-release-monitor',
    docker_image = 'ghcr.io/iamspido/github-release-monitor:latest',
    compose_url = 'https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended',
    deployment_methods = ARRAY['compose', 'docker', 'native']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/iamspido/github-release-monitor', 'https://github.com/iamspido/github-release-monitor/pkgs/container/github-release-monitor', 'https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended', 'https://github.com/iamspido/github-release-monitor#setup-guide-manual']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/iamspido/github-release-monitor', 'https://github.com/iamspido/github-release-monitor/pkgs/container/github-release-monitor', 'https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/iamspido/github-release-monitor:latest.','source_urls',jsonb_build_array('https://github.com/iamspido/github-release-monitor', 'https://github.com/iamspido/github-release-monitor/pkgs/container/github-release-monitor', 'https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/iamspido/github-release-monitor', 'https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended'))),
    updated_at = now()
  WHERE a.id = 'b201924b-7151-44b6-a83c-faf3d7da81d3'::uuid AND a.slug = 'github-release-monitor' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/iamspido/github-release-monitor#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for github-release-monitor'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/iamspido/github-release-monitor/pkgs/container/github-release-monitor","support_level":"official","source_url":"https://github.com/iamspido/github-release-monitor","image":"ghcr.io/iamspido/github-release-monitor:latest","note":null,"sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended","support_level":"official","source_url":"https://github.com/iamspido/github-release-monitor","image":"ghcr.io/iamspido/github-release-monitor:latest","note":"The recommended Compose example includes a reverse proxy and SMTP relay.","sort_order":20},{"method":"native","label":"Manual installation","url":"https://github.com/iamspido/github-release-monitor#setup-guide-manual","support_level":"official","source_url":"https://github.com/iamspido/github-release-monitor","image":null,"note":"The README documents a manual Node.js installation.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/iamspido/github-release-monitor']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/iamspido/github-release-monitor/pkgs/container/github-release-monitor']::text[],
    compose_urls = ARRAY['https://github.com/iamspido/github-release-monitor#docker-compose-setup-recommended']::text[],
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
    native_urls = ARRAY['https://github.com/iamspido/github-release-monitor#setup-guide-manual']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/iamspido/github-release-monitor:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'b201924b-7151-44b6-a83c-faf3d7da81d3'::uuid AND a.slug = 'github-release-monitor' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for github-release-monitor'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/jgm/gitit',
    deployment_methods = ARRAY['native']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/jgm/gitit', 'https://github.com/jgm/gitit#compiling-and-installing-gitit']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '48eddaf8-7162-42b8-bfa7-53b323d60075'::uuid AND a.slug = 'gitit' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/jgm/gitit#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for gitit'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"native","label":"Native installation","url":"https://github.com/jgm/gitit#compiling-and-installing-gitit","support_level":"official","source_url":"https://github.com/jgm/gitit","image":null,"note":"The upstream README documents installation with Stack or Cabal and running the wiki as a local service.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/jgm/gitit']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls = ARRAY['https://github.com/jgm/gitit#compiling-and-installing-gitit']::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '48eddaf8-7162-42b8-bfa7-53b323d60075'::uuid AND a.slug = 'gitit' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for gitit'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://git-proxy.finos.org/docs/quickstart/intercept/',
    deployment_methods = ARRAY['package']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://git-proxy.finos.org/docs/quickstart/intercept/', 'https://www.npmjs.com/package/%40finos/git-proxy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at = now()
  WHERE a.id = '27288fc4-6570-4b62-8b19-d7d44f0dec75'::uuid AND a.slug = 'gitproxy' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/finos/git-proxy#readme' AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for gitproxy'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"package","label":"npm package","url":"https://www.npmjs.com/package/%40finos/git-proxy","support_level":"official","source_url":"https://git-proxy.finos.org/docs/quickstart/intercept/","image":null,"note":"The official quick start uses npx to fetch and run @finos/git-proxy; Node.js is required.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://git-proxy.finos.org/docs/quickstart/intercept/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    package_urls = ARRAY['https://www.npmjs.com/package/%40finos/git-proxy']::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY[]::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '27288fc4-6570-4b62-8b19-d7d44f0dec75'::uuid AND a.slug = 'gitproxy' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for gitproxy'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://gladysassistant.com/docs/installation/docker/',
    docker_url = 'https://hub.docker.com/r/gladysassistant/gladys',
    docker_image = 'gladysassistant/gladys:v5',
    compose_url = 'https://gladysassistant.com/docs/installation/docker-compose/',
    deployment_methods = ARRAY['compose', 'docker', 'synology', 'unraid']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://gladysassistant.com/docs/installation/docker/', 'https://gladysassistant.com/docs/installation/synology/', 'https://gladysassistant.com/docs/installation/unraid/', 'https://hub.docker.com/r/gladysassistant/gladys', 'https://gladysassistant.com/docs/installation/docker-compose/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://gladysassistant.com/docs/installation/docker/', 'https://hub.docker.com/r/gladysassistant/gladys', 'https://gladysassistant.com/docs/installation/docker-compose/')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names gladysassistant/gladys:v5.','source_urls',jsonb_build_array('https://gladysassistant.com/docs/installation/docker/', 'https://hub.docker.com/r/gladysassistant/gladys', 'https://gladysassistant.com/docs/installation/docker-compose/')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://gladysassistant.com/docs/installation/docker-compose/'))),
    updated_at = now()
  WHERE a.id = '7331c0f6-87d8-4f6b-8770-37308d076ff8'::uuid AND a.slug = 'gladys-assistant' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/gladysassistant/gladys#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for gladys-assistant'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/gladysassistant/gladys","support_level":"official","source_url":"https://gladysassistant.com/docs/installation/docker/","image":"gladysassistant/gladys:v5","note":"Official guide shows the Docker run command and required host mounts.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://gladysassistant.com/docs/installation/docker-compose/","support_level":"official","source_url":"https://gladysassistant.com/docs/installation/docker-compose/","image":"gladysassistant/gladys:v5","note":"The official guide provides a Compose service with host networking, local device mounts, and Watchtower.","sort_order":20},{"method":"synology","label":"Synology NAS installation","url":"https://gladysassistant.com/docs/installation/synology/","support_level":"official","source_url":"https://gladysassistant.com/docs/installation/synology/","image":"gladysassistant/gladys:v5","note":"Official guide gives the NAS-specific Docker setup.","sort_order":30},{"method":"unraid","label":"Unraid installation","url":"https://gladysassistant.com/docs/installation/unraid/","support_level":"official","source_url":"https://gladysassistant.com/docs/installation/unraid/","image":"gladysassistant/gladys:v5","note":"Official guide walks through installation from the Unraid Apps Manager.","sort_order":40}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://gladysassistant.com/docs/installation/docker/', 'https://gladysassistant.com/docs/installation/docker-compose/', 'https://gladysassistant.com/docs/installation/synology/', 'https://gladysassistant.com/docs/installation/unraid/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/gladysassistant/gladys']::text[],
    compose_urls = ARRAY['https://gladysassistant.com/docs/installation/docker-compose/']::text[],
    truenas_scale_urls = ARRAY[]::text[],
    unraid_urls = ARRAY['https://gladysassistant.com/docs/installation/unraid/']::text[],
    umbrel_urls = ARRAY[]::text[],
    yunohost_urls = ARRAY[]::text[],
    casaos_urls = ARRAY[]::text[],
    runtipi_urls = ARRAY[]::text[],
    cosmos_urls = ARRAY[]::text[],
    openmediavault_urls = ARRAY[]::text[],
    synology_urls = ARRAY['https://gladysassistant.com/docs/installation/synology/']::text[],
    qnap_urls = ARRAY[]::text[],
    proxmox_urls = ARRAY[]::text[],
    home_assistant_os_urls = ARRAY[]::text[],
    kubernetes_urls = ARRAY[]::text[],
    helm_urls = ARRAY[]::text[],
    native_urls = ARRAY[]::text[],
    binary_urls = ARRAY[]::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['gladysassistant/gladys:v5']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '7331c0f6-87d8-4f6b-8770-37308d076ff8'::uuid AND a.slug = 'gladys-assistant' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for gladys-assistant'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://glauth.github.io/docs/containerization.html',
    docker_url = 'https://hub.docker.com/r/glauth/glauth',
    docker_image = 'glauth/glauth',
    deployment_methods = ARRAY['binary', 'docker', 'helm']::text[],
    docker_support = 'official',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://glauth.github.io/docs/containerization.html', 'https://glauth.github.io/docs/kubernetes.html', 'https://glauth.github.io/docs/quickstart.html', 'https://hub.docker.com/r/glauth/glauth', 'https://glauth.github.io/helm-glauth', 'https://github.com/glauth/glauth/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://glauth.github.io/docs/containerization.html', 'https://hub.docker.com/r/glauth/glauth')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names glauth/glauth.','source_urls',jsonb_build_array('https://glauth.github.io/docs/containerization.html', 'https://hub.docker.com/r/glauth/glauth'))),
    updated_at = now()
  WHERE a.id = 'dc97ea2d-7c6e-4c88-9466-d3415876eeb3'::uuid AND a.slug = 'glauth' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/glauth/glauth#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for glauth'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/glauth/glauth","support_level":"official","source_url":"https://glauth.github.io/docs/containerization.html","image":"glauth/glauth","note":"The official container guide documents the upstream image and Docker run commands.","sort_order":10},{"method":"helm","label":"Helm chart","url":"https://glauth.github.io/helm-glauth","support_level":"official","source_url":"https://glauth.github.io/docs/kubernetes.html","image":null,"note":"The official Kubernetes guide calls this the project''s Helm chart and documents helm repo add and helm install.","sort_order":20},{"method":"binary","label":"Prebuilt binaries","url":"https://github.com/glauth/glauth/releases","support_level":"official","source_url":"https://glauth.github.io/docs/quickstart.html","image":null,"note":"The official quick start links to precompiled releases and describes running the server with a config file.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://glauth.github.io/docs/containerization.html', 'https://glauth.github.io/docs/kubernetes.html', 'https://glauth.github.io/docs/quickstart.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/glauth/glauth']::text[],
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
    helm_urls = ARRAY['https://glauth.github.io/helm-glauth']::text[],
    native_urls = ARRAY[]::text[],
    binary_urls = ARRAY['https://github.com/glauth/glauth/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['glauth/glauth']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'dc97ea2d-7c6e-4c88-9466-d3415876eeb3'::uuid AND a.slug = 'glauth' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for glauth'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://docs.godoxy.dev/docs/godoxy/Setup',
    docker_url = 'https://github.com/yusing/godoxy/pkgs/container/godoxy',
    docker_image = 'ghcr.io/yusing/godoxy:latest',
    compose_url = 'https://docs.godoxy.dev/docs/godoxy/Setup',
    deployment_methods = ARRAY['compose', 'docker']::text[],
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://registry.hub.docker.com/r/ghcr.io/yusing/godoxy') || ARRAY['https://docs.godoxy.dev/docs/godoxy/Setup', 'https://github.com/yusing/godoxy/pkgs/container/godoxy']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://docs.godoxy.dev/docs/godoxy/Setup', 'https://github.com/yusing/godoxy/pkgs/container/godoxy')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/yusing/godoxy:latest.','source_urls',jsonb_build_array('https://docs.godoxy.dev/docs/godoxy/Setup', 'https://github.com/yusing/godoxy/pkgs/container/godoxy')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://docs.godoxy.dev/docs/godoxy/Setup'))),
    updated_at = now()
  WHERE a.id = 'c8ee61db-9768-400f-980e-243fe3f58eae'::uuid AND a.slug = 'go-doxy' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/yusing/godoxy#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[];
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for go-doxy'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/yusing/godoxy/pkgs/container/godoxy","support_level":"official","source_url":"https://docs.godoxy.dev/docs/godoxy/Setup","image":"ghcr.io/yusing/godoxy:latest","note":"The official image is on GHCR; the install docs use Compose for the supported setup.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://docs.godoxy.dev/docs/godoxy/Setup","support_level":"official","source_url":"https://docs.godoxy.dev/docs/godoxy/Setup","image":"ghcr.io/yusing/godoxy:latest","note":"The official setup guide runs a setup script that prepares the Compose deployment.","sort_order":20}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://docs.godoxy.dev/docs/godoxy/Setup']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/yusing/godoxy/pkgs/container/godoxy']::text[],
    compose_urls = ARRAY['https://docs.godoxy.dev/docs/godoxy/Setup']::text[],
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
    docker_images = ARRAY['ghcr.io/yusing/godoxy:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'c8ee61db-9768-400f-980e-243fe3f58eae'::uuid AND a.slug = 'go-doxy' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for go-doxy'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/thomaspoignant/go-feature-flag',
    docker_url = 'https://hub.docker.com/r/gofeatureflag/go-feature-flag',
    docker_image = 'gofeatureflag/go-feature-flag:latest',
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/thomaspoignant/go-feature-flag', 'https://hub.docker.com/r/gofeatureflag/go-feature-flag']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/thomaspoignant/go-feature-flag', 'https://hub.docker.com/r/gofeatureflag/go-feature-flag')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names gofeatureflag/go-feature-flag:latest.','source_urls',jsonb_build_array('https://github.com/thomaspoignant/go-feature-flag', 'https://hub.docker.com/r/gofeatureflag/go-feature-flag'))),
    updated_at = now()
  WHERE a.id = '20d97561-1c75-46e0-89ab-68b17cb90745'::uuid AND a.slug = 'go-feature-flag' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/thomaspoignant/go-feature-flag#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for go-feature-flag'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/gofeatureflag/go-feature-flag","support_level":"official","source_url":"https://github.com/thomaspoignant/go-feature-flag","image":"gofeatureflag/go-feature-flag:latest","note":"The upstream README gives a Docker run command for the relay proxy.","sort_order":10}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/thomaspoignant/go-feature-flag']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/gofeatureflag/go-feature-flag']::text[],
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
    docker_images = ARRAY['gofeatureflag/go-feature-flag:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = '20d97561-1c75-46e0-89ab-68b17cb90745'::uuid AND a.slug = 'go-feature-flag' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for go-feature-flag'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/arran4/gobookmarks#quick-start',
    docker_url = 'https://github.com/arran4/gobookmarks/pkgs/container/gobookmarks',
    docker_image = 'ghcr.io/arran4/gobookmarks',
    compose_url = 'https://github.com/arran4/gobookmarks#docker-compose',
    deployment_methods = ARRAY['binary', 'compose', 'docker']::text[],
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/arran4/gobookmarks', 'https://github.com/arran4/gobookmarks/pkgs/container/gobookmarks', 'https://github.com/arran4/gobookmarks#quick-start', 'https://github.com/arran4/gobookmarks#docker-compose', 'https://github.com/arran4/gobookmarks/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/arran4/gobookmarks#quick-start', 'https://github.com/arran4/gobookmarks/pkgs/container/gobookmarks', 'https://github.com/arran4/gobookmarks#docker-compose')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names ghcr.io/arran4/gobookmarks.','source_urls',jsonb_build_array('https://github.com/arran4/gobookmarks#quick-start', 'https://github.com/arran4/gobookmarks/pkgs/container/gobookmarks', 'https://github.com/arran4/gobookmarks#docker-compose')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/arran4/gobookmarks#docker-compose'))),
    updated_at = now()
  WHERE a.id = 'c1fc8e81-0978-466d-9e44-30762ce49bc4'::uuid AND a.slug = 'gobookmarks' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/arran4/gobookmarks#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/arran4/gobookmarks/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for gobookmarks'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://github.com/arran4/gobookmarks/pkgs/container/gobookmarks","support_level":"official","source_url":"https://github.com/arran4/gobookmarks#quick-start","image":"ghcr.io/arran4/gobookmarks","note":"The official README gives a Docker run command and persistent data mounts.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/arran4/gobookmarks#docker-compose","support_level":"official","source_url":"https://github.com/arran4/gobookmarks#docker-compose","image":"ghcr.io/arran4/gobookmarks","note":"The README includes two Compose configurations.","sort_order":20},{"method":"binary","label":"Prebuilt binaries","url":"https://github.com/arran4/gobookmarks/releases","support_level":"official","source_url":"https://github.com/arran4/gobookmarks#quick-start","image":null,"note":"The README says release packages include precompiled binaries and service files.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/arran4/gobookmarks#quick-start', 'https://github.com/arran4/gobookmarks#docker-compose']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://github.com/arran4/gobookmarks/pkgs/container/gobookmarks']::text[],
    compose_urls = ARRAY['https://github.com/arran4/gobookmarks#docker-compose']::text[],
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
    binary_urls = ARRAY['https://github.com/arran4/gobookmarks/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['ghcr.io/arran4/gobookmarks']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'c1fc8e81-0978-466d-9e44-30762ce49bc4'::uuid AND a.slug = 'gobookmarks' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for gobookmarks'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url = 'https://github.com/slurdge/goeland',
    docker_url = 'https://hub.docker.com/r/slurdge/goeland',
    docker_image = 'slurdge/goeland:latest',
    compose_url = 'https://github.com/slurdge/goeland#docker',
    deployment_methods = ARRAY['binary', 'compose', 'docker']::text[],
    docker_support = 'official',
    compose_support = TRUE,
    data_source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/slurdge/goeland', 'https://hub.docker.com/r/slurdge/goeland', 'https://github.com/slurdge/goeland#docker', 'https://github.com/slurdge/goeland/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker-based install route.','source_urls',jsonb_build_array('https://github.com/slurdge/goeland', 'https://hub.docker.com/r/slurdge/goeland', 'https://github.com/slurdge/goeland#docker')), 'docker_image', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked install route names slurdge/goeland:latest, ghcr.io/slurdge/goeland.','source_urls',jsonb_build_array('https://github.com/slurdge/goeland', 'https://hub.docker.com/r/slurdge/goeland', 'https://github.com/slurdge/goeland#docker')), 'compose', jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','The linked upstream sources document a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/slurdge/goeland#docker'))),
    updated_at = now()
  WHERE a.id = 'ca27a933-2d86-4c38-badf-c9ea2d013f4d'::uuid AND a.slug = 'goeland' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/slurdge/goeland#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM 'false';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for goeland'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options = '[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/slurdge/goeland","support_level":"official","source_url":"https://github.com/slurdge/goeland","image":"slurdge/goeland:latest","note":"The project says images are published to Docker Hub and GHCR.","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/slurdge/goeland#docker","support_level":"official","source_url":"https://github.com/slurdge/goeland#docker","image":"ghcr.io/slurdge/goeland","note":"The official README includes a Compose service and a database volume for persistent state.","sort_order":20},{"method":"binary","label":"Prebuilt binaries","url":"https://github.com/slurdge/goeland/releases","support_level":"official","source_url":"https://github.com/slurdge/goeland","image":null,"note":"The README lists prebuilt binaries for Linux, macOS, and Windows.","sort_order":30}]'::jsonb,
    source_urls = ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/slurdge/goeland', 'https://github.com/slurdge/goeland#docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at = now(),
    docker_urls = ARRAY['https://hub.docker.com/r/slurdge/goeland']::text[],
    compose_urls = ARRAY['https://github.com/slurdge/goeland#docker']::text[],
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
    binary_urls = ARRAY['https://github.com/slurdge/goeland/releases']::text[],
    package_urls = ARRAY[]::text[],
    other_urls = ARRAY[]::text[],
    docker_images = ARRAY['slurdge/goeland:latest']::text[],
    updated_at = now()
  FROM public.self_host_apps AS a
  WHERE i.app_id = a.id AND a.id = 'ca27a933-2d86-4c38-badf-c9ea2d013f4d'::uuid AND a.slug = 'goeland' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0) = 0 AND coalesce(cardinality(i.docker_urls),0) = 0 AND coalesce(cardinality(i.compose_urls),0) = 0 AND coalesce(cardinality(i.truenas_scale_urls),0) = 0 AND coalesce(cardinality(i.unraid_urls),0) = 0 AND coalesce(cardinality(i.umbrel_urls),0) = 0 AND coalesce(cardinality(i.yunohost_urls),0) = 0 AND coalesce(cardinality(i.casaos_urls),0) = 0 AND coalesce(cardinality(i.runtipi_urls),0) = 0 AND coalesce(cardinality(i.cosmos_urls),0) = 0 AND coalesce(cardinality(i.openmediavault_urls),0) = 0 AND coalesce(cardinality(i.synology_urls),0) = 0 AND coalesce(cardinality(i.qnap_urls),0) = 0 AND coalesce(cardinality(i.proxmox_urls),0) = 0 AND coalesce(cardinality(i.home_assistant_os_urls),0) = 0 AND coalesce(cardinality(i.kubernetes_urls),0) = 0 AND coalesce(cardinality(i.helm_urls),0) = 0 AND coalesce(cardinality(i.native_urls),0) = 0 AND coalesce(cardinality(i.binary_urls),0) = 0 AND coalesce(cardinality(i.package_urls),0) = 0 AND coalesce(cardinality(i.other_urls),0) = 0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for goeland'; END IF;
END $$;
COMMIT;
