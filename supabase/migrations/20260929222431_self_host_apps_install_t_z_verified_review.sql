BEGIN;

DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://tabby.tabbyml.com/docs/quick-start/installation/docker/',
    docker_url='https://tabby.tabbyml.com/docs/quick-start/installation/docker/',
    docker_image='registry.tabbyml.com/tabbyml/tabby',
    compose_url='https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx',
    deployment_methods=ARRAY['binary', 'compose', 'docker', 'package']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/docker/', 'https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx', 'https://tabby.tabbyml.com/docs/quick-start/installation/linux/', 'https://tabby.tabbyml.com/docs/quick-start/installation/apple/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/docker/', 'https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx', 'https://tabby.tabbyml.com/docs/quick-start/installation/linux/', 'https://tabby.tabbyml.com/docs/quick-start/installation/apple/']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify registry.tabbyml.com/tabbyml/tabby.','source_urls',ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/docker/', 'https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx', 'https://tabby.tabbyml.com/docs/quick-start/installation/linux/', 'https://tabby.tabbyml.com/docs/quick-start/installation/apple/']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/docker/', 'https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx', 'https://tabby.tabbyml.com/docs/quick-start/installation/linux/', 'https://tabby.tabbyml.com/docs/quick-start/installation/apple/']::text[])),
    updated_at=now()
  WHERE a.id='a85b0213-cdb6-47c8-b17d-871ab2cfa91c'::uuid AND a.slug='tabby' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://tabby.tabbyml.com/docs/installation/' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tabby'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://tabby.tabbyml.com/docs/quick-start/installation/docker/","source_url":"https://tabby.tabbyml.com/docs/quick-start/installation/docker/","image":"registry.tabbyml.com/tabbyml/tabby","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx","source_url":"https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx","image":"registry.tabbyml.com/tabbyml/tabby","note":null,"support_level":"official","sort_order":20},{"method":"binary","label":"Linux binary","url":"https://tabby.tabbyml.com/docs/quick-start/installation/linux/","source_url":"https://tabby.tabbyml.com/docs/quick-start/installation/linux/","image":null,"note":null,"support_level":"official","sort_order":30},{"method":"package","label":"Homebrew package","url":"https://tabby.tabbyml.com/docs/quick-start/installation/apple/","source_url":"https://tabby.tabbyml.com/docs/quick-start/installation/apple/","image":null,"note":"Official Homebrew route is for Apple silicon.","support_level":"official","sort_order":40}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/docker/', 'https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx', 'https://tabby.tabbyml.com/docs/quick-start/installation/linux/', 'https://tabby.tabbyml.com/docs/quick-start/installation/apple/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/docker/']::text[],
    compose_urls=ARRAY['https://github.com/TabbyML/tabby/blob/main/website/docs/quick-start/installation/docker-compose.mdx']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/linux/']::text[],
    package_urls=ARRAY['https://tabby.tabbyml.com/docs/quick-start/installation/apple/']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['registry.tabbyml.com/tabbyml/tabby']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='a85b0213-cdb6-47c8-b17d-871ab2cfa91c'::uuid AND a.slug='tabby' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tabby'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/suitux/Tagr#readme',
    docker_url='https://github.com/suitux/Tagr/pkgs/container/tagr',
    docker_image='ghcr.io/suitux/tagr:latest',
    compose_url='https://github.com/suitux/Tagr/blob/main/docker-compose.yml',
    deployment_methods=ARRAY['compose', 'docker', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/suitux/Tagr', 'https://github.com/suitux/Tagr/pkgs/container/tagr']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/suitux/Tagr', 'https://github.com/suitux/Tagr/pkgs/container/tagr']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify ghcr.io/suitux/tagr:latest.','source_urls',ARRAY['https://github.com/suitux/Tagr', 'https://github.com/suitux/Tagr/pkgs/container/tagr']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://github.com/suitux/Tagr', 'https://github.com/suitux/Tagr/pkgs/container/tagr']::text[])),
    updated_at=now()
  WHERE a.id='2d6a98bf-65f9-4374-a08c-e355a3871f52'::uuid AND a.slug='tagr' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/suitux/Tagr#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tagr'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://github.com/suitux/Tagr/pkgs/container/tagr","source_url":"https://github.com/suitux/Tagr/pkgs/container/tagr","image":"ghcr.io/suitux/tagr:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/suitux/Tagr/blob/main/docker-compose.yml","source_url":"https://github.com/suitux/Tagr","image":null,"note":null,"support_level":"official","sort_order":20},{"method":"native","label":"Node.js install","url":"https://github.com/suitux/Tagr#readme","source_url":"https://github.com/suitux/Tagr","image":null,"note":"README requires Node.js 22+ and pnpm.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/suitux/Tagr/pkgs/container/tagr', 'https://github.com/suitux/Tagr']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/suitux/Tagr/pkgs/container/tagr']::text[],
    compose_urls=ARRAY['https://github.com/suitux/Tagr/blob/main/docker-compose.yml']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://github.com/suitux/Tagr#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/suitux/tagr:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='2d6a98bf-65f9-4374-a08c-e355a3871f52'::uuid AND a.slug='tagr' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tagr'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.tagspaces.org/tutorials/tagspaces-web-docker/',
    docker_url='https://hub.docker.com/r/tagspaces/tagspaces-lite-web',
    docker_image='tagspaces/tagspaces-lite-web',
    compose_url=NULL,
    deployment_methods=ARRAY['docker']::text[],
    docker_support='official',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/tagspaces/tagspaces/blob/HEAD/docker/Dockerfile') || ARRAY['https://docs.tagspaces.org/tutorials/tagspaces-web-docker/', 'https://hub.docker.com/r/tagspaces/tagspaces-lite-web']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://docs.tagspaces.org/tutorials/tagspaces-web-docker/', 'https://hub.docker.com/r/tagspaces/tagspaces-lite-web']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify tagspaces/tagspaces-lite-web.','source_urls',ARRAY['https://docs.tagspaces.org/tutorials/tagspaces-web-docker/', 'https://hub.docker.com/r/tagspaces/tagspaces-lite-web']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://docs.tagspaces.org/tutorials/tagspaces-web-docker/', 'https://hub.docker.com/r/tagspaces/tagspaces-lite-web']::text[])),
    updated_at=now()
  WHERE a.id='a1ebb726-7b52-448a-9f33-a91c72c7abd2'::uuid AND a.slug='tagspaces' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/tagspaces/tagspaces#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/tagspaces/tagspaces/blob/HEAD/docker/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tagspaces'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"TagSpaces Lite Web Docker image","url":"https://hub.docker.com/r/tagspaces/tagspaces-lite-web","source_url":"https://docs.tagspaces.org/tutorials/tagspaces-web-docker/","image":"tagspaces/tagspaces-lite-web","note":"Pro Web uses this image with separately purchased web files.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.tagspaces.org/tutorials/tagspaces-web-docker/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://hub.docker.com/r/tagspaces/tagspaces-lite-web']::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['tagspaces/tagspaces-lite-web']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='a1ebb726-7b52-448a-9f33-a91c72c7abd2'::uuid AND a.slug='tagspaces' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;

  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tagspaces'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.taiga.io/setup-production.html',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://docs.taiga.io/setup-production.html',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.taiga.io/setup-production.html', 'https://github.com/taigaio/taiga-docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://docs.taiga.io/setup-production.html', 'https://github.com/taigaio/taiga-docker']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://docs.taiga.io/setup-production.html', 'https://github.com/taigaio/taiga-docker']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://docs.taiga.io/setup-production.html', 'https://github.com/taigaio/taiga-docker']::text[])),
    updated_at=now()
  WHERE a.id='594c7a69-53ff-4d3b-8338-b205c02a2a4c'::uuid AND a.slug='taiga' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://docs.taiga.io/setup-production.html' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for taiga'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Production Docker Compose stack","url":"https://docs.taiga.io/setup-production.html","source_url":"https://docs.taiga.io/setup-production.html","image":null,"note":null,"support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.taiga.io/setup-production.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://docs.taiga.io/setup-production.html']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='594c7a69-53ff-4d3b-8338-b205c02a2a4c'::uuid AND a.slug='taiga' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for taiga'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/BaldissaraMatheus/Tasks.md#readme',
    docker_url='https://hub.docker.com/r/baldissaramatheus/tasks.md',
    docker_image='baldissaramatheus/tasks.md',
    compose_url='https://github.com/BaldissaraMatheus/Tasks.md#readme',
    deployment_methods=ARRAY['compose', 'docker', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/BaldissaraMatheus/Tasks.md/blob/HEAD/Dockerfile') || ARRAY['https://github.com/BaldissaraMatheus/Tasks.md', 'https://hub.docker.com/r/baldissaramatheus/tasks.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/BaldissaraMatheus/Tasks.md', 'https://hub.docker.com/r/baldissaramatheus/tasks.md']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify baldissaramatheus/tasks.md.','source_urls',ARRAY['https://github.com/BaldissaraMatheus/Tasks.md', 'https://hub.docker.com/r/baldissaramatheus/tasks.md']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://github.com/BaldissaraMatheus/Tasks.md', 'https://hub.docker.com/r/baldissaramatheus/tasks.md']::text[])),
    updated_at=now()
  WHERE a.id='bd5e9503-3ede-4846-a9d7-ef31f9c1a239'::uuid AND a.slug='tasks-md' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/BaldissaraMatheus/Tasks.md#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/BaldissaraMatheus/Tasks.md/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tasks-md'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/baldissaramatheus/tasks.md","source_url":"https://hub.docker.com/r/baldissaramatheus/tasks.md","image":"baldissaramatheus/tasks.md","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/BaldissaraMatheus/Tasks.md#readme","source_url":"https://github.com/BaldissaraMatheus/Tasks.md","image":null,"note":null,"support_level":"official","sort_order":20},{"method":"native","label":"Node.js install","url":"https://github.com/BaldissaraMatheus/Tasks.md#readme","source_url":"https://github.com/BaldissaraMatheus/Tasks.md","image":null,"note":"README documents a Node.js/npm source install.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://hub.docker.com/r/baldissaramatheus/tasks.md', 'https://github.com/BaldissaraMatheus/Tasks.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://hub.docker.com/r/baldissaramatheus/tasks.md']::text[],
    compose_urls=ARRAY['https://github.com/BaldissaraMatheus/Tasks.md#readme']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://github.com/BaldissaraMatheus/Tasks.md#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['baldissaramatheus/tasks.md']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='bd5e9503-3ede-4846-a9d7-ef31f9c1a239'::uuid AND a.slug='tasks-md' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tasks-md'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://taskview.tech/docs/getting-started/installation',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://taskview.tech/docs/getting-started/installation',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://taskview.tech/docs/getting-started/installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://taskview.tech/docs/getting-started/installation']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://taskview.tech/docs/getting-started/installation']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://taskview.tech/docs/getting-started/installation']::text[])),
    updated_at=now()
  WHERE a.id='5bd33f2a-7cd7-43ce-9d4d-b407a5b05e5d'::uuid AND a.slug='taskview' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Gimanh/taskview-community#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for taskview'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"TaskView Docker Compose stack","url":"https://taskview.tech/docs/getting-started/installation","source_url":"https://taskview.tech/docs/getting-started/installation","image":null,"note":"Stack includes API, web app and database migration images.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://taskview.tech/docs/getting-started/installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://taskview.tech/docs/getting-started/installation']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='5bd33f2a-7cd7-43ce-9d4d-b407a5b05e5d'::uuid AND a.slug='taskview' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for taskview'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://tasmota.github.io/docs/Getting-Started/',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['other']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/arendst/Tasmota/blob/HEAD/lib/lib_div/arduino-vid6608/Dockerfile') || ARRAY['https://tasmota.github.io/docs/Getting-Started/', 'https://github.com/arendst/Tasmota']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Docker install destination was verified in this review.','source_urls',ARRAY['https://tasmota.github.io/docs/Getting-Started/', 'https://github.com/arendst/Tasmota']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://tasmota.github.io/docs/Getting-Started/', 'https://github.com/arendst/Tasmota']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://tasmota.github.io/docs/Getting-Started/', 'https://github.com/arendst/Tasmota']::text[])),
    updated_at=now()

  WHERE a.id='0e2f84b8-7660-4b48-b61e-9c5448a4da73'::uuid AND a.slug='tasmota' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/arendst/Tasmota#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/arendst/Tasmota/blob/HEAD/lib/lib_div/arduino-vid6608/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tasmota'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"other","label":"Flash firmware to compatible ESP devices","url":"https://tasmota.github.io/docs/Getting-Started/","source_url":"https://tasmota.github.io/docs/Getting-Started/","image":null,"note":"Guide covers compatible ESP devices, firmware binaries and flashing methods.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://tasmota.github.io/docs/Getting-Started/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    other_urls=ARRAY['https://tasmota.github.io/docs/Getting-Started/']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='0e2f84b8-7660-4b48-b61e-9c5448a4da73'::uuid AND a.slug='tasmota' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tasmota'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/teableio/teable-deployment#readme',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one',
    deployment_methods=ARRAY['compose', 'helm']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/teableio/teable/blob/HEAD/dockers/teable/Dockerfile') || ARRAY['https://github.com/teableio/teable-deployment/blob/main/README.md', 'https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one', 'https://github.com/teableio/teable-deployment/tree/main/helm']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/teableio/teable-deployment/blob/main/README.md', 'https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one', 'https://github.com/teableio/teable-deployment/tree/main/helm']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://github.com/teableio/teable-deployment/blob/main/README.md', 'https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one', 'https://github.com/teableio/teable-deployment/tree/main/helm']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://github.com/teableio/teable-deployment/blob/main/README.md', 'https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one', 'https://github.com/teableio/teable-deployment/tree/main/helm']::text[])),
    updated_at=now()
  WHERE a.id='4bdec657-7237-4728-8d17-b7f5e3eeaf21'::uuid AND a.slug='teable' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/teableio/teable#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/teableio/teable/blob/HEAD/dockers/teable/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for teable'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker all-in-one platform","url":"https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one","source_url":"https://github.com/teableio/teable-deployment/blob/main/README.md","image":null,"note":"Deploys the full platform, not only the app container.","support_level":"official","sort_order":10},{"method":"helm","label":"Kubernetes Helm platform","url":"https://github.com/teableio/teable-deployment/tree/main/helm","source_url":"https://github.com/teableio/teable-deployment/blob/main/README.md","image":null,"note":"Deploys the full platform.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/teableio/teable-deployment/blob/main/README.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/teableio/teable-deployment/tree/main/docker/all-in-one']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY['https://github.com/teableio/teable-deployment/tree/main/helm']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='4bdec657-7237-4728-8d17-b7f5e3eeaf21'::uuid AND a.slug='teable' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for teable'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/teikei/teikei#readme',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['other']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/teikei/teikei/blob/HEAD/packages/api/db/Dockerfile') || ARRAY['https://github.com/teikei/teikei']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','The official README documents Dokku production deployment, but no supported app Docker install was verified; the database Dockerfile is only a helper.','source_urls',ARRAY['https://github.com/teikei/teikei']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No app image was identified in the official Dokku deployment instructions.','source_urls',ARRAY['https://github.com/teikei/teikei']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install route was identified in the deployment instructions.','source_urls',ARRAY['https://github.com/teikei/teikei']::text[])),
    updated_at=now()
  WHERE a.id='a623a3ba-84a6-40a4-8e62-180bbb1ca3b6'::uuid AND a.slug='teikei' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/teikei/teikei#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/teikei/teikei/blob/HEAD/packages/api/db/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for teikei'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"other","label":"Deploy with Dokku","url":"https://github.com/teikei/teikei#readme","source_url":"https://github.com/teikei/teikei","image":null,"note":"The project documents per-package Dokku production deployments; Node.js, PostgreSQL and environment configuration are required.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/teikei/teikei']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    other_urls=ARRAY['https://github.com/teikei/teikei#readme']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='a623a3ba-84a6-40a4-8e62-180bbb1ca3b6'::uuid AND a.slug='teikei' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for teikei'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://tiddly.packett.cool/#ServerHosting/DIY',
    deployment_methods=ARRAY['other']::text[],
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://tiddly.packett.cool/', 'https://tiddly.packett.cool/#ServerHosting/DIY']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='c7262ed6-7bf7-40d8-8022-e9caf27beb07'::uuid AND a.slug='tiddlypwa' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://tiddly.packett.cool' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tiddlypwa'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"other","label":"DIY self-hosted sync server","url":"https://tiddly.packett.cool/#ServerHosting/DIY","source_url":"https://tiddly.packett.cool/","image":null,"note":"Official DIY guide covers setup and local hosting of the TiddlyPWA sync server.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://tiddly.packett.cool/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    other_urls=ARRAY['https://tiddly.packett.cool/#ServerHosting/DIY']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='c7262ed6-7bf7-40d8-8022-e9caf27beb07'::uuid AND a.slug='tiddlypwa' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tiddlypwa'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://goteleport.com/docs/get-started/deploy-community/',
    docker_url='https://goteleport.com/docs/get-started/deploy-community/',
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['binary', 'docker', 'helm', 'package']::text[],
    docker_support='official',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/gravitational/teleport/blob/HEAD/build.assets/Dockerfile') || ARRAY['https://goteleport.com/docs/get-started/deploy-community/', 'https://goteleport.com/docs/installation/single-machine/', 'https://goteleport.com/docs/installation/single-machine/linux/', 'https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/', 'https://goteleport.com/docs/installation/self-hosted/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://goteleport.com/docs/get-started/deploy-community/', 'https://goteleport.com/docs/installation/single-machine/', 'https://goteleport.com/docs/installation/single-machine/linux/', 'https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/', 'https://goteleport.com/docs/installation/self-hosted/']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://goteleport.com/docs/get-started/deploy-community/', 'https://goteleport.com/docs/installation/single-machine/', 'https://goteleport.com/docs/installation/single-machine/linux/', 'https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/', 'https://goteleport.com/docs/installation/self-hosted/']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://goteleport.com/docs/get-started/deploy-community/', 'https://goteleport.com/docs/installation/single-machine/', 'https://goteleport.com/docs/installation/single-machine/linux/', 'https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/', 'https://goteleport.com/docs/installation/self-hosted/']::text[])),
    updated_at=now()

  WHERE a.id='26e35adc-6b4c-4e82-b588-551ac50a605a'::uuid AND a.slug='teleport' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/gravitational/teleport#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/gravitational/teleport/blob/HEAD/build.assets/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for teleport'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"binary","label":"Linux tarball install","url":"https://goteleport.com/docs/installation/single-machine/linux/","source_url":"https://goteleport.com/docs/installation/single-machine/linux/","image":null,"note":null,"support_level":"official","sort_order":10},{"method":"docker","label":"Docker demo install","url":"https://goteleport.com/docs/get-started/deploy-community/","source_url":"https://goteleport.com/docs/get-started/deploy-community/","image":null,"note":"Runs an Ubuntu container, then installs Teleport inside; demo/home-lab route, not a Teleport image.","support_level":"official","sort_order":20},{"method":"helm","label":"Kubernetes Helm deployment","url":"https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/","source_url":"https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/","image":null,"note":"Production self-hosted Enterprise needs a valid license.","support_level":"official","sort_order":30},{"method":"package","label":"Linux package install","url":"https://goteleport.com/docs/installation/single-machine/linux/","source_url":"https://goteleport.com/docs/installation/single-machine/linux/","image":null,"note":null,"support_level":"official","sort_order":40}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://goteleport.com/docs/installation/single-machine/linux/', 'https://goteleport.com/docs/get-started/deploy-community/', 'https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://goteleport.com/docs/get-started/deploy-community/']::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY['https://goteleport.com/docs/installation/self-hosted/helm-deployments/kubernetes-cluster/']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY['https://goteleport.com/docs/installation/single-machine/linux/']::text[],
    package_urls=ARRAY['https://goteleport.com/docs/installation/single-machine/linux/']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='26e35adc-6b4c-4e82-b588-551ac50a605a'::uuid AND a.slug='teleport' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for teleport'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.temporal.io/self-hosted-guide/deployment',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://github.com/temporalio/samples-server/tree/main/compose',
    deployment_methods=ARRAY['binary', 'compose', 'helm']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.temporal.io/self-hosted-guide/deployment', 'https://github.com/temporalio/samples-server/tree/main/compose', 'https://github.com/temporalio/helm-charts']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://docs.temporal.io/self-hosted-guide/deployment', 'https://github.com/temporalio/samples-server/tree/main/compose', 'https://github.com/temporalio/helm-charts']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://docs.temporal.io/self-hosted-guide/deployment', 'https://github.com/temporalio/samples-server/tree/main/compose', 'https://github.com/temporalio/helm-charts']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://docs.temporal.io/self-hosted-guide/deployment', 'https://github.com/temporalio/samples-server/tree/main/compose', 'https://github.com/temporalio/helm-charts']::text[])),
    updated_at=now()
  WHERE a.id='55001225-60c1-4ef9-84f7-d2efc02c35de'::uuid AND a.slug='temporal' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://docs.temporal.io/self-hosted-guide' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for temporal'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose stack","url":"https://github.com/temporalio/samples-server/tree/main/compose","source_url":"https://docs.temporal.io/self-hosted-guide/deployment","image":null,"note":"Includes PostgreSQL, Elasticsearch and Temporal Web UI.","support_level":"official","sort_order":10},{"method":"binary","label":"Temporal server binaries","url":"https://docs.temporal.io/self-hosted-guide/deployment","source_url":"https://docs.temporal.io/self-hosted-guide/deployment","image":null,"note":"Docs describe server and UI Go binaries as services.","support_level":"official","sort_order":20},{"method":"helm","label":"Kubernetes Helm charts","url":"https://github.com/temporalio/helm-charts","source_url":"https://docs.temporal.io/self-hosted-guide/deployment","image":null,"note":null,"support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.temporal.io/self-hosted-guide/deployment']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/temporalio/samples-server/tree/main/compose']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY['https://github.com/temporalio/helm-charts']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY['https://docs.temporal.io/self-hosted-guide/deployment']::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='55001225-60c1-4ef9-84f7-d2efc02c35de'::uuid AND a.slug='temporal' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for temporal'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://stategraph.com/docs/admin/self-hosting',
    docker_url='https://stategraph.com/docs/admin/self-hosting',
    docker_image='ghcr.io/terrateamio/terrat-oss',
    compose_url='https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source',
    deployment_methods=ARRAY['compose', 'helm']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://stategraph.com/docs/admin/self-hosting', 'https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source', 'https://stategraph.com/docs/admin/self-hosting/open-source/kubernetes', 'https://stategraph.com/blog/terrateam-open-source']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://stategraph.com/docs/admin/self-hosting', 'https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source', 'https://stategraph.com/docs/admin/self-hosting/open-source/kubernetes', 'https://stategraph.com/blog/terrateam-open-source']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify ghcr.io/terrateamio/terrat-oss.','source_urls',ARRAY['https://stategraph.com/docs/admin/self-hosting', 'https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source', 'https://stategraph.com/docs/admin/self-hosting/open-source/kubernetes', 'https://stategraph.com/blog/terrateam-open-source']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://stategraph.com/docs/admin/self-hosting', 'https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source', 'https://stategraph.com/docs/admin/self-hosting/open-source/kubernetes', 'https://stategraph.com/blog/terrateam-open-source']::text[])),
    updated_at=now()
  WHERE a.id='65e81db7-ec86-4bd0-b8b9-4e7244fb5348'::uuid AND a.slug='terrateam' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://docs.terrateam.io/quickstart/self-hosted/' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for terrateam'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Open Source Docker Compose","url":"https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source","source_url":"https://stategraph.com/docs/admin/self-hosting","image":"ghcr.io/terrateamio/terrat-oss","note":"Current docs call the product Stategraph Orchestration. Open Source is MPL-2.0, needs no key, and allows up to 3 active users monthly per GitHub or GitLab installation.","support_level":"official","sort_order":10},{"method":"helm","label":"Open Source Kubernetes Helm","url":"https://stategraph.com/docs/admin/self-hosting/open-source/kubernetes","source_url":"https://stategraph.com/docs/admin/self-hosting","image":"ghcr.io/terrateamio/terrat-oss","note":"This is the Open Source route; Enterprise uses a separate licensed image.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://stategraph.com/docs/admin/self-hosting']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://stategraph.com/docs/get-started/quickstart/self-hosted-open-source']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY['https://stategraph.com/docs/admin/self-hosting/open-source/kubernetes']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/terrateamio/terrat-oss']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='65e81db7-ec86-4bd0-b8b9-4e7244fb5348'::uuid AND a.slug='terrateam' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for terrateam'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md',
    deployment_methods=ARRAY['binary', 'compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md', 'https://teslalogger.de/en/docs/requirements/', 'https://teslalogger.de/en/docs/installation/raspberry-install/', 'https://github.com/bassmaster187/TeslaLogger']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md', 'https://teslalogger.de/en/docs/requirements/', 'https://teslalogger.de/en/docs/installation/raspberry-install/', 'https://github.com/bassmaster187/TeslaLogger']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md', 'https://teslalogger.de/en/docs/requirements/', 'https://teslalogger.de/en/docs/installation/raspberry-install/', 'https://github.com/bassmaster187/TeslaLogger']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md', 'https://teslalogger.de/en/docs/requirements/', 'https://teslalogger.de/en/docs/installation/raspberry-install/', 'https://github.com/bassmaster187/TeslaLogger']::text[])),
    updated_at=now()
  WHERE a.id='88fe287b-f5d9-4d1b-b876-e2481fef5d23'::uuid AND a.slug='teslalogger' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bassmaster187/TeslaLogger#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for teslalogger'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose install","url":"https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md","source_url":"https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md","image":null,"note":"Downloads the current Compose and environment files from the NET8 branch.","support_level":"official","sort_order":10},{"method":"binary","label":"Raspberry Pi image","url":"https://teslalogger.de/en/docs/installation/raspberry-install/","source_url":"https://teslalogger.de/en/docs/installation/raspberry-install/","image":null,"note":"Guide explains flashing the official image to an SD card.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md', 'https://teslalogger.de/en/docs/installation/raspberry-install/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/bassmaster187/TeslaLogger/blob/master/docker_setup.md']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY['https://teslalogger.de/en/docs/installation/raspberry-install/']::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='88fe287b-f5d9-4d1b-b876-e2481fef5d23'::uuid AND a.slug='teslalogger' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for teslalogger'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/MaximilianGT500/testflight-watcher#readme',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['native']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/MaximilianGT500/testflight-watcher']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Docker install destination was verified in this review.','source_urls',ARRAY['https://github.com/MaximilianGT500/testflight-watcher']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://github.com/MaximilianGT500/testflight-watcher']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://github.com/MaximilianGT500/testflight-watcher']::text[])),
    updated_at=now()
  WHERE a.id='9e220ddf-b529-4559-9abf-adce5d3b07ab'::uuid AND a.slug='testflight-watcher' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/MaximilianGT500/testflight-watcher#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for testflight-watcher'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"native","label":"Node.js install","url":"https://github.com/MaximilianGT500/testflight-watcher#readme","source_url":"https://github.com/MaximilianGT500/testflight-watcher","image":null,"note":"README documents Node.js startup; Pushover is needed for push notifications.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/MaximilianGT500/testflight-watcher']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://github.com/MaximilianGT500/testflight-watcher#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='9e220ddf-b529-4559-9abf-adce5d3b07ab'::uuid AND a.slug='testflight-watcher' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for testflight-watcher'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/huggingface/text-generation-inference#readme',
    docker_url='https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference',
    docker_image='ghcr.io/huggingface/text-generation-inference:3.3.5',
    compose_url=NULL,
    deployment_methods=ARRAY['docker', 'native']::text[],
    docker_support='official',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/huggingface/text-generation-inference', 'https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/huggingface/text-generation-inference', 'https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify ghcr.io/huggingface/text-generation-inference:3.3.5.','source_urls',ARRAY['https://github.com/huggingface/text-generation-inference', 'https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://github.com/huggingface/text-generation-inference', 'https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference']::text[])),
    updated_at=now()

  WHERE a.id='a5494ad2-555d-4788-a0ae-e16fc79ad489'::uuid AND a.slug='text-generation-inference' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/huggingface/text-generation-inference#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for text-generation-inference'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Official Docker image","url":"https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference","source_url":"https://github.com/huggingface/text-generation-inference","image":"ghcr.io/huggingface/text-generation-inference:3.3.5","note":"Upstream repository was archived 2026-03-21; maintenance mode.","support_level":"official","sort_order":10},{"method":"native","label":"Local source install","url":"https://github.com/huggingface/text-generation-inference#readme","source_url":"https://github.com/huggingface/text-generation-inference","image":null,"note":"Build from source; requires Rust, Python and build dependencies.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/huggingface/text-generation-inference']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/huggingface/text-generation-inference/pkgs/container/text-generation-inference']::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://github.com/huggingface/text-generation-inference#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/huggingface/text-generation-inference:3.3.5']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='a5494ad2-555d-4788-a0ae-e16fc79ad489'::uuid AND a.slug='text-generation-inference' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for text-generation-inference'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/oobabooga/textgen/blob/main/README.md',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker',
    deployment_methods=ARRAY['compose', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/oobabooga/textgen/blob/main/README.md', 'https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/oobabooga/textgen/blob/main/README.md', 'https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://github.com/oobabooga/textgen/blob/main/README.md', 'https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://github.com/oobabooga/textgen/blob/main/README.md', 'https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker']::text[])),
    updated_at=now()
  WHERE a.id='51b505b9-bdc1-4886-a964-3f5ad5198060'::uuid AND a.slug='text-generation-webui' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/oobabooga/textgen/blob/HEAD/README.md' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM TRUE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for text-generation-webui'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose for Web UI","url":"https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker","source_url":"https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker","image":null,"note":"Compose builds locally; no single prebuilt application image.","support_level":"official","sort_order":10},{"method":"native","label":"Manual Web UI install","url":"https://github.com/oobabooga/textgen/blob/main/README.md","source_url":"https://github.com/oobabooga/textgen/blob/main/README.md","image":null,"note":"Applies to the browser Web UI; upstream also offers a newer TextGen desktop app.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker', 'https://github.com/oobabooga/textgen/blob/main/README.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/oobabooga/textgen/wiki/09-%E2%80%90-Docker']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://github.com/oobabooga/textgen/blob/main/README.md']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='51b505b9-bdc1-4886-a964-3f5ad5198060'::uuid AND a.slug='text-generation-webui' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for text-generation-webui'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.textpattern.com/installation/installing-textpattern',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['native']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.textpattern.com/installation/installing-textpattern']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Docker install destination was verified in this review.','source_urls',ARRAY['https://docs.textpattern.com/installation/installing-textpattern']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://docs.textpattern.com/installation/installing-textpattern']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://docs.textpattern.com/installation/installing-textpattern']::text[])),
    updated_at=now()
  WHERE a.id='4c2f9667-2b41-411d-84a1-56a48ff16221'::uuid AND a.slug='textpattern' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/textpattern/textpattern#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for textpattern'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"native","label":"PHP and MySQL install","url":"https://docs.textpattern.com/installation/installing-textpattern","source_url":"https://docs.textpattern.com/installation/installing-textpattern","image":null,"note":null,"support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.textpattern.com/installation/installing-textpattern']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],

    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://docs.textpattern.com/installation/installing-textpattern']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='4c2f9667-2b41-411d-84a1-56a48ff16221'::uuid AND a.slug='textpattern' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for textpattern'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['native']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md', 'https://wiki.wesnoth.org/Multiplayerservers']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Docker install destination was verified in this review.','source_urls',ARRAY['https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md', 'https://wiki.wesnoth.org/Multiplayerservers']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md', 'https://wiki.wesnoth.org/Multiplayerservers']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md', 'https://wiki.wesnoth.org/Multiplayerservers']::text[])),
    updated_at=now()
  WHERE a.id='4f7a4780-db11-4098-be06-e3400091b3d0'::uuid AND a.slug='the-battle-for-wesnoth' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/wesnoth/wesnoth#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for the-battle-for-wesnoth'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"native","label":"Dedicated multiplayer server","url":"https://wiki.wesnoth.org/Multiplayerservers","source_url":"https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md","image":null,"note":"Build and run wesnothd; this is the multiplayer server, not the game client.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/wesnoth/wesnoth/blob/master/INSTALL.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://wiki.wesnoth.org/Multiplayerservers']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='4f7a4780-db11-4098-be06-e3400091b3d0'::uuid AND a.slug='the-battle-for-wesnoth' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for the-battle-for-wesnoth'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://doc.thelia.net/docs/2.x/getting_started/Installation',
    docker_url=NULL,
    docker_image=NULL,
    compose_url='https://doc.thelia.net/docs/2.x/getting_started/docker',
    deployment_methods=ARRAY['compose', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/thelia/thelia/blob/HEAD/templates/frontOffice/modern/Dockerfile') || ARRAY['https://doc.thelia.net/docs/2.x/getting_started/Installation', 'https://doc.thelia.net/docs/2.x/getting_started/docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://doc.thelia.net/docs/2.x/getting_started/Installation', 'https://doc.thelia.net/docs/2.x/getting_started/docker']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://doc.thelia.net/docs/2.x/getting_started/Installation', 'https://doc.thelia.net/docs/2.x/getting_started/docker']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://doc.thelia.net/docs/2.x/getting_started/Installation', 'https://doc.thelia.net/docs/2.x/getting_started/docker']::text[])),
    updated_at=now()
  WHERE a.id='df888818-95c5-4912-beb8-ba42f14a8d76'::uuid AND a.slug='thelia' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/thelia/thelia#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/thelia/thelia/blob/HEAD/templates/frontOffice/modern/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for thelia'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose install","url":"https://doc.thelia.net/docs/2.x/getting_started/docker","source_url":"https://doc.thelia.net/docs/2.x/getting_started/docker","image":null,"note":null,"support_level":"official","sort_order":10},{"method":"native","label":"Composer install","url":"https://doc.thelia.net/docs/2.x/getting_started/Installation","source_url":"https://doc.thelia.net/docs/2.x/getting_started/Installation","image":null,"note":"Official Thelia 2 Composer project install.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://doc.thelia.net/docs/2.x/getting_started/docker', 'https://doc.thelia.net/docs/2.x/getting_started/Installation']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://doc.thelia.net/docs/2.x/getting_started/docker']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://doc.thelia.net/docs/2.x/getting_started/Installation']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='df888818-95c5-4912-beb8-ba42f14a8d76'::uuid AND a.slug='thelia' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for thelia'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.theme-park.dev/setup/',
    docker_url='https://github.com/themepark-dev/theme.park/pkgs/container/theme.park',
    docker_image='ghcr.io/themepark-dev/theme.park:latest',
    compose_url='https://docs.theme-park.dev/setup/',
    deployment_methods=ARRAY['compose', 'docker']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/themepark-dev/theme.park/blob/HEAD/docker-mods/emby/Dockerfile') || ARRAY['https://docs.theme-park.dev/setup/', 'https://github.com/themepark-dev/theme.park/pkgs/container/theme.park']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://docs.theme-park.dev/setup/', 'https://github.com/themepark-dev/theme.park/pkgs/container/theme.park']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify ghcr.io/themepark-dev/theme.park:latest.','source_urls',ARRAY['https://docs.theme-park.dev/setup/', 'https://github.com/themepark-dev/theme.park/pkgs/container/theme.park']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://docs.theme-park.dev/setup/', 'https://github.com/themepark-dev/theme.park/pkgs/container/theme.park']::text[])),
    updated_at=now()
  WHERE a.id='307914a6-e9b5-48f8-9b43-18cf34148293'::uuid AND a.slug='theme-park' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/themepark-dev/theme.park#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/themepark-dev/theme.park/blob/HEAD/docker-mods/emby/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for theme-park'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://github.com/themepark-dev/theme.park/pkgs/container/theme.park","source_url":"https://docs.theme-park.dev/setup/","image":"ghcr.io/themepark-dev/theme.park:latest","note":"Serves theme CSS files.","support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose setup","url":"https://docs.theme-park.dev/setup/","source_url":"https://docs.theme-park.dev/setup/","image":null,"note":"Serves theme CSS files for supported apps.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.theme-park.dev/setup/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/themepark-dev/theme.park/pkgs/container/theme.park']::text[],
    compose_urls=ARRAY['https://docs.theme-park.dev/setup/']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/themepark-dev/theme.park:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='307914a6-e9b5-48f8-9b43-18cf34148293'::uuid AND a.slug='theme-park' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for theme-park'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/dkorecko/Ticky#readme',
    docker_url='https://github.com/dkorecko/Ticky#readme',
    docker_image='ghcr.io/dkorecko/ticky:latest',
    compose_url='https://github.com/dkorecko/Ticky#readme',
    deployment_methods=ARRAY['compose', 'docker', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(array_remove(coalesce(a.data_source_urls, ARRAY[]::text[]), 'https://github.com/dkorecko/Ticky/blob/HEAD/Dockerfile') || ARRAY['https://github.com/dkorecko/Ticky']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://github.com/dkorecko/Ticky']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify ghcr.io/dkorecko/ticky:latest.','source_urls',ARRAY['https://github.com/dkorecko/Ticky']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://github.com/dkorecko/Ticky']::text[])),
    updated_at=now()
  WHERE a.id='59a77f65-7b82-4d36-973d-3aff0495c44c'::uuid AND a.slug='ticky' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/dkorecko/Ticky#readme' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/dkorecko/Ticky/blob/HEAD/Dockerfile' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for ticky'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://github.com/dkorecko/Ticky#readme","source_url":"https://github.com/dkorecko/Ticky","image":"ghcr.io/dkorecko/ticky:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/dkorecko/Ticky#readme","source_url":"https://github.com/dkorecko/Ticky","image":null,"note":"The README stack includes MySQL.","support_level":"official","sort_order":20},{"method":"native","label":"Manual .NET install","url":"https://github.com/dkorecko/Ticky#readme","source_url":"https://github.com/dkorecko/Ticky","image":null,"note":"Run the Ticky.Web project with dotnet.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/dkorecko/Ticky']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/dkorecko/Ticky#readme']::text[],
    compose_urls=ARRAY['https://github.com/dkorecko/Ticky#readme']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY['https://github.com/dkorecko/Ticky#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/dkorecko/ticky:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a

  WHERE i.app_id=a.id AND a.id='59a77f65-7b82-4d36-973d-3aff0495c44c'::uuid AND a.slug='ticky' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for ticky'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['package']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html', 'https://tiddlywiki.com/static/WebServer.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Docker install destination was verified in this review.','source_urls',ARRAY['https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html', 'https://tiddlywiki.com/static/WebServer.html']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html', 'https://tiddlywiki.com/static/WebServer.html']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html', 'https://tiddlywiki.com/static/WebServer.html']::text[])),
    updated_at=now()
  WHERE a.id='491a132c-d8c5-4f92-9b33-ddac1a41a457'::uuid AND a.slug='tiddlywiki' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://tiddlywiki.com/static/Installing%2520TiddlyWiki%2520on%2520Node.js.html' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM FALSE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tiddlywiki'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"package","label":"npm package install","url":"https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html","source_url":"https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html","image":null,"note":"Runs a Node.js wiki server; docs recommend a trusted network or external proxy before internet exposure.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY['https://tiddlywiki.com/static/GettingStarted%20-%20Node.js.html']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='491a132c-d8c5-4f92-9b33-ddac1a41a457'::uuid AND a.slug='tiddlywiki' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tiddlywiki'; END IF;

  UPDATE public.self_host_apps AS a SET

    install_docs_url='https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['binary']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Docker install destination was verified in this review.','source_urls',ARRAY['https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html']::text[]),'docker_image',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No single app image was set from the reviewed install paths.','source_urls',ARRAY['https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html']::text[]),'compose',jsonb_build_object('status','unchecked','checked_at',current_date,'confidence','low','note','No official Compose install destination was verified in this review.','source_urls',ARRAY['https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html']::text[])),
    updated_at=now()
  WHERE a.id='62b6ab79-b1c4-48e7-9c3d-ea66473e7ef7'::uuid AND a.slug='tigase' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/tigase/tigase-server#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for tigase'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"binary","label":"Tigase server distribution","url":"https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html","source_url":"https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html","image":null,"note":"Official guide directs users to server distribution and web installer.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY[]::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY['https://docs.tigase.net/en/8.4.0/Tigase_Administration/Quick_Start_Guide/Intro.html']::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='62b6ab79-b1c4-48e7-9c3d-ea66473e7ef7'::uuid AND a.slug='tigase' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for tigase'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.timeplus.com/proton',
    docker_url='https://docs.timeplus.com/proton',
    docker_image='d.timeplus.com/timeplus-io/proton:latest',
    compose_url='https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce',
    deployment_methods=ARRAY['binary', 'compose', 'docker', 'helm', 'package']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls, ARRAY[]::text[]) || ARRAY['https://docs.timeplus.com/proton', 'https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce', 'https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),

    technical_fact_status=coalesce(a.technical_fact_status, '{}'::jsonb) || jsonb_build_object('docker',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker-based self-host route.','source_urls',ARRAY['https://docs.timeplus.com/proton', 'https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce', 'https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton']::text[]),'docker_image',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources identify d.timeplus.com/timeplus-io/proton:latest.','source_urls',ARRAY['https://docs.timeplus.com/proton', 'https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce', 'https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton']::text[]),'compose',jsonb_build_object('status','published','checked_at',current_date,'confidence','high','note','Official sources document a Docker Compose route.','source_urls',ARRAY['https://docs.timeplus.com/proton', 'https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce', 'https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton']::text[])),
    updated_at=now()
  WHERE a.id='0d311c15-40a7-4c52-a6c5-6318bc2b3d6b'::uuid AND a.slug='timeplus' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://install.timeplus.com/oss' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM TRUE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for timeplus'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://docs.timeplus.com/proton","source_url":"https://docs.timeplus.com/proton","image":"d.timeplus.com/timeplus-io/proton:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose example","url":"https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce","source_url":"https://docs.timeplus.com/proton","image":null,"note":"Official example uses Kafka or Redpanda external streams.","support_level":"official","sort_order":20},{"method":"binary","label":"Linux or macOS binary","url":"https://docs.timeplus.com/proton","source_url":"https://docs.timeplus.com/proton","image":null,"note":"Official installer provides a standalone binary.","support_level":"official","sort_order":30},{"method":"package","label":"Homebrew package","url":"https://docs.timeplus.com/proton","source_url":"https://docs.timeplus.com/proton","image":null,"note":"Official Homebrew route is for macOS.","support_level":"official","sort_order":40},{"method":"helm","label":"Kubernetes Helm chart","url":"https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton","source_url":"https://docs.timeplus.com/proton","image":null,"note":null,"support_level":"official","sort_order":50}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.timeplus.com/proton']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://docs.timeplus.com/proton']::text[],
    compose_urls=ARRAY['https://github.com/timeplus-io/proton/tree/develop/examples/ecommerce']::text[],
    truenas_scale_urls=ARRAY[]::text[],
    unraid_urls=ARRAY[]::text[],
    umbrel_urls=ARRAY[]::text[],
    yunohost_urls=ARRAY[]::text[],
    casaos_urls=ARRAY[]::text[],
    runtipi_urls=ARRAY[]::text[],
    cosmos_urls=ARRAY[]::text[],
    openmediavault_urls=ARRAY[]::text[],
    synology_urls=ARRAY[]::text[],
    qnap_urls=ARRAY[]::text[],
    proxmox_urls=ARRAY[]::text[],
    home_assistant_os_urls=ARRAY[]::text[],
    kubernetes_urls=ARRAY[]::text[],
    helm_urls=ARRAY['https://github.com/timeplus-io/helm-charts/tree/main/charts/timeplus-proton']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY['https://docs.timeplus.com/proton']::text[],
    package_urls=ARRAY['https://docs.timeplus.com/proton']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['d.timeplus.com/timeplus-io/proton:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='0d311c15-40a7-4c52-a6c5-6318bc2b3d6b'::uuid AND a.slug='timeplus' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_images),0)=0 AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for timeplus'; END IF;
END $$;

COMMIT;
