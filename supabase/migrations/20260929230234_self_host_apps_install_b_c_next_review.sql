BEGIN;

DO $$
BEGIN
  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/jR4dh3y/BoxBox/blob/master/docs/docker.md',
    docker_url='https://github.com/jR4dh3y/BoxBox/blob/master/docs/docker.md',
    docker_image='ghcr.io/jr4dh3y/boxbox:v0.2.2',
    compose_url='https://github.com/jR4dh3y/BoxBox/blob/master/docker-compose.yml',
    deployment_methods=ARRAY['compose', 'docker']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docs/docker.md', 'https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docs/docker.md","https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docker-compose.yml"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docs/docker.md","https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docker-compose.yml"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docker-compose.yml"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='23447bef-da49-4d23-8572-7be1c099562d'::uuid AND a.slug='boxbox' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/jR4dh3y/BoxBox#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for boxbox'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://github.com/jR4dh3y/BoxBox/blob/master/docs/docker.md","source_url":"https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docs/docker.md","image":"ghcr.io/jr4dh3y/boxbox:v0.2.2","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/jR4dh3y/BoxBox/blob/master/docker-compose.yml","source_url":"https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docker-compose.yml","image":"ghcr.io/jr4dh3y/boxbox:v0.2.2","note":null,"support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docs/docker.md', 'https://raw.githubusercontent.com/jR4dh3y/BoxBox/master/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/jR4dh3y/BoxBox/blob/master/docs/docker.md']::text[],
    compose_urls=ARRAY['https://github.com/jR4dh3y/BoxBox/blob/master/docker-compose.yml']::text[],
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
    docker_images=ARRAY['ghcr.io/jr4dh3y/boxbox:v0.2.2']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='23447bef-da49-4d23-8572-7be1c099562d'::uuid AND a.slug='boxbox' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for boxbox'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.bugpin.io/installation/docker',
    docker_url='https://docs.bugpin.io/installation/docker',
    docker_image='registry.arantic.cloud/bugpin/bugpin:latest',
    compose_url='https://raw.githubusercontent.com/aranticlabs/bugpin/main/docker-compose.yml',
    deployment_methods=ARRAY['compose', 'docker', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    summary='Self-hosted visual bug reporting for web apps, with screenshots, attachments, and issue triage.',
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://docs.bugpin.io/installation/docker', 'https://raw.githubusercontent.com/aranticlabs/bugpin/main/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://docs.bugpin.io/installation/docker"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://docs.bugpin.io/installation/docker"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://docs.bugpin.io/installation/docker"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='1edbcb7f-80d8-437f-b9a4-6b301be2d247'::uuid AND a.slug='bugpin' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/aranticlabs/bugpin#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE) AND a.summary IS NOT DISTINCT FROM 'Visual bug reporting and ticketing tool for web applications, (Source Code) AGPL-3.0/MIT Docker.';
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for bugpin'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://docs.bugpin.io/installation/docker","source_url":"https://docs.bugpin.io/installation/docker","image":"registry.arantic.cloud/bugpin/bugpin:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://raw.githubusercontent.com/aranticlabs/bugpin/main/docker-compose.yml","source_url":"https://docs.bugpin.io/installation/docker","image":"registry.arantic.cloud/bugpin/bugpin:latest","note":null,"support_level":"official","sort_order":20},{"method":"native","label":"Bun install","url":"https://docs.bugpin.io/installation/docker#bun","source_url":"https://docs.bugpin.io/installation/docker","image":null,"note":"Official guide also documents Bun source install.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.bugpin.io/installation/docker']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://docs.bugpin.io/installation/docker']::text[],
    compose_urls=ARRAY['https://raw.githubusercontent.com/aranticlabs/bugpin/main/docker-compose.yml']::text[],
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
    native_urls=ARRAY['https://docs.bugpin.io/installation/docker#bun']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['registry.arantic.cloud/bugpin/bugpin:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='1edbcb7f-80d8-437f-b9a4-6b301be2d247'::uuid AND a.slug='bugpin' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for bugpin'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://c15t.com/docs/self-host/quickstart',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['package']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://c15t.com/docs/self-host/quickstart']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='f36243a9-244c-4331-b2bc-c18e521a346e'::uuid AND a.slug='c15t' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/c15t/c15t/blob/main/docs/self-host/quickstart.mdx' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for c15t'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"package","label":"Backend package","url":"https://c15t.com/docs/self-host/quickstart","source_url":"https://c15t.com/docs/self-host/quickstart","image":null,"note":"Install @c15t/backend and run it on your own infrastructure.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://c15t.com/docs/self-host/quickstart']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    package_urls=ARRAY['https://c15t.com/docs/self-host/quickstart']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='f36243a9-244c-4331-b2bc-c18e521a346e'::uuid AND a.slug='c15t' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for c15t'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/CapSoftware/Cap/blob/main/docker-compose.yml',
    docker_url='https://github.com/CapSoftware/Cap/blob/main/docker-compose.yml',
    docker_image='ghcr.io/capsoftware/cap-web:latest',
    compose_url='https://github.com/CapSoftware/Cap/blob/main/docker-compose.yml',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/CapSoftware/Cap/blob/main/docker-compose.yml', 'https://github.com/CapSoftware/Cap']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://raw.githubusercontent.com/CapSoftware/Cap/main/docker-compose.yml"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://raw.githubusercontent.com/CapSoftware/Cap/main/docker-compose.yml"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://raw.githubusercontent.com/CapSoftware/Cap/main/docker-compose.yml"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='db390e9b-47c9-4553-9d52-ed17351491bf'::uuid AND a.slug='cap-so' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/CapSoftware/Cap#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for cap-so'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://github.com/CapSoftware/Cap/blob/main/docker-compose.yml","source_url":"https://raw.githubusercontent.com/CapSoftware/Cap/main/docker-compose.yml","image":"ghcr.io/capsoftware/cap-web:latest","note":"Starts web, media server, MySQL, and MinIO.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://raw.githubusercontent.com/CapSoftware/Cap/main/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/CapSoftware/Cap/blob/main/docker-compose.yml']::text[],
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
    docker_images=ARRAY['ghcr.io/capsoftware/cap-web:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='db390e9b-47c9-4553-9d52-ed17351491bf'::uuid AND a.slug='cap-so' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for cap-so'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://capjs.js.org/guide/',
    docker_url='https://capjs.js.org/guide/',
    docker_image='tiago2/cap:latest',
    compose_url='https://capjs.js.org/guide/',
    deployment_methods=ARRAY['compose', 'docker']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://capjs.js.org/guide/', 'https://github.com/tiagozip/cap']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://capjs.js.org/guide/"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://capjs.js.org/guide/"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://capjs.js.org/guide/"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='836e2641-6c26-4bb6-bd94-0bdc39b28872'::uuid AND a.slug='capjs' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/tiagorangel1/cap#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for capjs'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://capjs.js.org/guide/","source_url":"https://capjs.js.org/guide/","image":"tiago2/cap:latest","note":"Official guide recommends standalone Docker server.","support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://capjs.js.org/guide/","source_url":"https://capjs.js.org/guide/","image":"tiago2/cap:latest","note":null,"support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://capjs.js.org/guide/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://capjs.js.org/guide/']::text[],
    compose_urls=ARRAY['https://capjs.js.org/guide/']::text[],
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
    docker_images=ARRAY['tiago2/cap:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='836e2641-6c26-4bb6-bd94-0bdc39b28872'::uuid AND a.slug='capjs' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for capjs'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/paradigmxyz/centaur/blob/main/docs/pages/deploying-in-production.mdx',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['helm', 'kubernetes']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/paradigmxyz/centaur/blob/main/docs/pages/deploying-in-production.mdx', 'https://github.com/paradigmxyz/centaur/tree/main/contrib/chart']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"unchecked","checked_at":"2026-09-30","confidence":"low","note":"The old Docker URL was only the source repository. Reviewed production docs specify Helm; Docker install remains unverified.","source_urls":["https://github.com/paradigmxyz/centaur/blob/main/docs/pages/deploying-in-production.mdx"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='5d306e59-26ab-438d-83b0-d76cb1426703'::uuid AND a.slug='centaur' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/paradigmxyz/centaur' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/paradigmxyz/centaur' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for centaur'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"helm","label":"Helm chart","url":"https://github.com/paradigmxyz/centaur/tree/main/contrib/chart","source_url":"https://github.com/paradigmxyz/centaur/blob/main/docs/pages/deploying-in-production.mdx","image":null,"note":"Production guide installs Centaur with Helm on Kubernetes.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/paradigmxyz/centaur/blob/main/docs/pages/deploying-in-production.mdx']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    helm_urls=ARRAY['https://github.com/paradigmxyz/centaur/tree/main/contrib/chart']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='5d306e59-26ab-438d-83b0-d76cb1426703'::uuid AND a.slug='centaur' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for centaur'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md',
    docker_url='https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md',
    docker_image=NULL,
    compose_url='https://github.com/chattocorp/chatto/tree/main/examples/dockercompose',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md', 'https://github.com/chattocorp/chatto/tree/main/examples/dockercompose']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='da1ce6b9-e931-43d8-98ec-04ebbdc89991'::uuid AND a.slug='chatto' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/chattocorp/chatto' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for chatto'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md","source_url":"https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md","image":null,"note":"Use the production example; root Compose file is development-only.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/chattocorp/chatto/blob/main/examples/dockercompose/README.md']::text[],
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
  WHERE i.app_id=a.id AND a.id='da1ce6b9-e931-43d8-98ec-04ebbdc89991'::uuid AND a.slug='chatto' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for chatto'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.checkmk.com/latest/en/introduction_docker.html',
    docker_url='https://docs.checkmk.com/latest/en/introduction_docker.html',
    docker_image='checkmk/check-mk-community:2.5.0-latest',
    compose_url='https://docs.checkmk.com/latest/en/introduction_docker.html',
    deployment_methods=ARRAY['compose', 'docker', 'package']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://docs.checkmk.com/latest/en/introduction_docker.html', 'https://docs.checkmk.com/latest/en/install_packages.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://docs.checkmk.com/latest/en/introduction_docker.html"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://docs.checkmk.com/latest/en/introduction_docker.html"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://docs.checkmk.com/latest/en/introduction_docker.html"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='e4dd51a6-111f-4894-b698-e7f41d0e1f14'::uuid AND a.slug='checkmk' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/checkmk/checkmk#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for checkmk'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/checkmk/check-mk-community","source_url":"https://docs.checkmk.com/latest/en/introduction_docker.html","image":"checkmk/check-mk-community:2.5.0-latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://docs.checkmk.com/latest/en/introduction_docker.html","source_url":"https://docs.checkmk.com/latest/en/introduction_docker.html","image":"checkmk/check-mk-community:2.5.0-latest","note":null,"support_level":"official","sort_order":20},{"method":"package","label":"Linux packages","url":"https://docs.checkmk.com/latest/en/install_packages.html","source_url":"https://docs.checkmk.com/latest/en/install_packages.html","image":null,"note":"Official packages are documented for supported Linux distributions.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.checkmk.com/latest/en/introduction_docker.html', 'https://docs.checkmk.com/latest/en/install_packages.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://hub.docker.com/r/checkmk/check-mk-community']::text[],
    compose_urls=ARRAY['https://docs.checkmk.com/latest/en/introduction_docker.html']::text[],
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
    package_urls=ARRAY['https://docs.checkmk.com/latest/en/install_packages.html']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['checkmk/check-mk-community:2.5.0-latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='e4dd51a6-111f-4894-b698-e7f41d0e1f14'::uuid AND a.slug='checkmk' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for checkmk'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/nicedreamzapp/claude-code-local/blob/main/README.md',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['native']::text[],
    docker_support='none',
    compose_support=FALSE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/nicedreamzapp/claude-code-local/blob/main/README.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='9aa95471-ce1a-4480-b0c9-87254cd47e86'::uuid AND a.slug='claude-code-local' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/nicedreamzapp/claude-code-local#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for claude-code-local'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"native","label":"macOS install","url":"https://github.com/nicedreamzapp/claude-code-local/blob/main/README.md","source_url":"https://github.com/nicedreamzapp/claude-code-local/blob/main/README.md","image":null,"note":"Requires an Apple Silicon Mac.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/nicedreamzapp/claude-code-local/blob/main/README.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls=ARRAY['https://github.com/nicedreamzapp/claude-code-local/blob/main/README.md']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='9aa95471-ce1a-4480-b0c9-87254cd47e86'::uuid AND a.slug='claude-code-local' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for claude-code-local'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/ipv6rslimited/cloudseeder/releases',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['binary']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/ipv6rslimited/cloudseeder', 'https://github.com/ipv6rslimited/cloudseeder/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='f1f43c4d-6ad8-459e-99c4-799b49eb88b1'::uuid AND a.slug='cloud-seeder' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/ipv6rslimited/cloudseeder' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for cloud-seeder'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"binary","label":"Desktop downloads","url":"https://github.com/ipv6rslimited/cloudseeder/releases","source_url":"https://github.com/ipv6rslimited/cloudseeder","image":null,"note":"Desktop releases; Podman is required to run appliances.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/ipv6rslimited/cloudseeder']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    binary_urls=ARRAY['https://github.com/ipv6rslimited/cloudseeder/releases']::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='f1f43c4d-6ad8-459e-99c4-799b49eb88b1'::uuid AND a.slug='cloud-seeder' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for cloud-seeder'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://clyo.cloud/docs',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['native']::text[],
    docker_support='none',
    compose_support=FALSE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://clyo.cloud/', 'https://clyo.cloud/docs']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='54563f71-71a5-46b5-ba4e-8b7de8b2d396'::uuid AND a.slug='clyocloud' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://code.weexnes.dev/ClyoCloud#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for clyocloud'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"native","label":"Linux install","url":"https://clyo.cloud/docs","source_url":"https://clyo.cloud/","image":null,"note":"Official site documents a Linux install script and systemd service.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://clyo.cloud/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls=ARRAY['https://clyo.cloud/docs']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='54563f71-71a5-46b5-ba4e-8b7de8b2d396'::uuid AND a.slug='clyocloud' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for clyocloud'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/Ark0N/Codeman/wiki/Installation/8949aa15b86f71cc67d1df09fa75eb35c0782bcc',
    docker_url='https://github.com/Ark0N/Codeman#readme',
    docker_image=NULL,
    compose_url='https://github.com/Ark0N/Codeman/tree/master/docker',
    deployment_methods=ARRAY['compose', 'native', 'package']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/Ark0N/Codeman', 'https://github.com/Ark0N/Codeman/wiki/Installation/8949aa15b86f71cc67d1df09fa75eb35c0782bcc', 'https://www.npmjs.com/package/aicodeman', 'https://getcodeman.com/install']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://github.com/Ark0N/Codeman#readme"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://github.com/Ark0N/Codeman#readme"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='4ad5bb14-72c0-43d2-abd3-dd095ad85b5e'::uuid AND a.slug='codeman' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Ark0N/Codeman#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for codeman'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://github.com/Ark0N/Codeman/tree/master/docker","source_url":"https://github.com/Ark0N/Codeman#readme","image":null,"note":"Project scripts build and start the Docker deployment.","support_level":"official","sort_order":10},{"method":"package","label":"npm package","url":"https://www.npmjs.com/package/aicodeman","source_url":"https://github.com/Ark0N/Codeman/wiki/Installation/8949aa15b86f71cc67d1df09fa75eb35c0782bcc","image":null,"note":"Install globally with npm.","support_level":"official","sort_order":20},{"method":"native","label":"Linux and macOS installer","url":"https://getcodeman.com/install","source_url":"https://github.com/Ark0N/Codeman#readme","image":null,"note":"The upstream one-line installer supports macOS and Linux.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/Ark0N/Codeman#readme', 'https://github.com/Ark0N/Codeman/wiki/Installation/8949aa15b86f71cc67d1df09fa75eb35c0782bcc']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/Ark0N/Codeman/tree/master/docker']::text[],
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
    native_urls=ARRAY['https://getcodeman.com/install']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY['https://www.npmjs.com/package/aicodeman']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='4ad5bb14-72c0-43d2-abd3-dd095ad85b5e'::uuid AND a.slug='codeman' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for codeman'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.codezero.build/general/install/',
    docker_url='https://docs.codezero.build/general/install/',
    docker_image=NULL,
    compose_url='https://docs.codezero.build/general/install/',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://docs.codezero.build/general/install/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://docs.codezero.build/general/install/"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://docs.codezero.build/general/install/"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='dd4c6f29-d317-4040-8e53-e1c8545a577e'::uuid AND a.slug='codezero' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://docs.codezero.build' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM (TRUE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for codezero'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://docs.codezero.build/general/install/","source_url":"https://docs.codezero.build/general/install/","image":null,"note":"The official guide deploys the release with Compose.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.codezero.build/general/install/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://docs.codezero.build/general/install/']::text[],
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
  WHERE i.app_id=a.id AND a.id='dd4c6f29-d317-4040-8e53-e1c8545a577e'::uuid AND a.slug='codezero' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for codezero'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/AltanS/collie/blob/main/docs/install.md',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['binary']::text[],
    docker_support='none',
    compose_support=FALSE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/AltanS/collie/blob/main/docs/install.md', 'https://github.com/AltanS/collie/releases']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='fa8dc52e-3ce6-4009-9bdb-f95b66724137'::uuid AND a.slug='collie' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/AltanS/collie#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for collie'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"binary","label":"Release binary","url":"https://github.com/AltanS/collie/releases","source_url":"https://github.com/AltanS/collie/blob/main/docs/install.md","image":null,"note":"Installer downloads the published binary.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/AltanS/collie/blob/main/docs/install.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    binary_urls=ARRAY['https://github.com/AltanS/collie/releases']::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='fa8dc52e-3ce6-4009-9bdb-f95b66724137'::uuid AND a.slug='collie' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for collie'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/basnijholt/compose-farm#readme',
    docker_url='https://github.com/basnijholt/compose-farm#readme',
    docker_image='ghcr.io/basnijholt/compose-farm:latest',
    compose_url='https://github.com/basnijholt/compose-farm#readme',
    deployment_methods=ARRAY['compose', 'docker', 'package']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/basnijholt/compose-farm', 'https://github.com/basnijholt/compose-farm/pkgs/container/compose-farm', 'https://pypi.org/project/compose-farm/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://github.com/basnijholt/compose-farm#readme"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://github.com/basnijholt/compose-farm#readme"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://github.com/basnijholt/compose-farm#readme"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='fba13dcb-ef6e-4ade-a17c-9dd87e1d69c6'::uuid AND a.slug='compose-farm' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/basnijholt/compose-farm#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for compose-farm'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://github.com/basnijholt/compose-farm/pkgs/container/compose-farm","source_url":"https://github.com/basnijholt/compose-farm#readme","image":"ghcr.io/basnijholt/compose-farm:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/basnijholt/compose-farm#readme","source_url":"https://github.com/basnijholt/compose-farm#readme","image":"ghcr.io/basnijholt/compose-farm:latest","note":null,"support_level":"official","sort_order":20},{"method":"package","label":"Python package","url":"https://pypi.org/project/compose-farm/","source_url":"https://github.com/basnijholt/compose-farm#readme","image":null,"note":"README documents uv or pip install.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/basnijholt/compose-farm#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/basnijholt/compose-farm/pkgs/container/compose-farm']::text[],
    compose_urls=ARRAY['https://github.com/basnijholt/compose-farm#readme']::text[],
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
    package_urls=ARRAY['https://pypi.org/project/compose-farm/']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/basnijholt/compose-farm:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='fba13dcb-ef6e-4ade-a17c-9dd87e1d69c6'::uuid AND a.slug='compose-farm' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for compose-farm'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.convex.dev/self-hosting',
    docker_url='https://docs.convex.dev/self-hosting',
    docker_image='ghcr.io/get-convex/convex-backend:latest',
    compose_url='https://github.com/get-convex/convex-backend/blob/main/self-hosted/docker/docker-compose.yml',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://docs.convex.dev/self-hosting', 'https://github.com/get-convex/convex-backend/tree/main/self-hosted']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://docs.convex.dev/self-hosting"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://docs.convex.dev/self-hosting"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://docs.convex.dev/self-hosting"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='56dba6a1-9cc8-476a-af45-db0e6d8f64e8'::uuid AND a.slug='convex' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/get-convex/convex-backend/tree/main/self-hosted' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM (TRUE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for convex'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://github.com/get-convex/convex-backend/blob/main/self-hosted/docker/docker-compose.yml","source_url":"https://docs.convex.dev/self-hosting","image":"ghcr.io/get-convex/convex-backend:latest","note":"Official backend and dashboard deployment.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.convex.dev/self-hosting']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/get-convex/convex-backend/blob/main/self-hosted/docker/docker-compose.yml']::text[],
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
    docker_images=ARRAY['ghcr.io/get-convex/convex-backend:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='56dba6a1-9cc8-476a-af45-db0e6d8f64e8'::uuid AND a.slug='convex' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for convex'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.coroot.com/installation/',
    docker_url='https://docs.coroot.com/installation/docker/',
    docker_image='ghcr.io/coroot/coroot',
    compose_url='https://raw.githubusercontent.com/coroot/coroot/main/deploy/docker-compose.yaml',
    deployment_methods=ARRAY['compose', 'helm']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://docs.coroot.com/installation/', 'https://docs.coroot.com/installation/docker/', 'https://docs.coroot.com/installation/kubernetes/', 'https://coroot.github.io/helm-charts']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://docs.coroot.com/installation/docker/"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://docs.coroot.com/installation/docker/"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://docs.coroot.com/installation/docker/"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='4d550d0d-60aa-40fb-a31b-54295a3896c2'::uuid AND a.slug='coroot' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/coroot/coroot#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for coroot'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://raw.githubusercontent.com/coroot/coroot/main/deploy/docker-compose.yaml","source_url":"https://docs.coroot.com/installation/docker/","image":"ghcr.io/coroot/coroot","note":null,"support_level":"official","sort_order":10},{"method":"helm","label":"Kubernetes Helm chart","url":"https://coroot.github.io/helm-charts","source_url":"https://docs.coroot.com/installation/kubernetes/","image":null,"note":"Official Coroot Operator and chart repository.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.coroot.com/installation/docker/', 'https://docs.coroot.com/installation/kubernetes/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://raw.githubusercontent.com/coroot/coroot/main/deploy/docker-compose.yaml']::text[],
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
    helm_urls=ARRAY['https://coroot.github.io/helm-charts']::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/coroot/coroot']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='4d550d0d-60aa-40fb-a31b-54295a3896c2'::uuid AND a.slug='coroot' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for coroot'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://docs.courselit.app/self-hosting/self-host/',
    docker_url='https://docs.courselit.app/self-hosting/self-host/',
    docker_image='codelit/courselit-app',
    compose_url='https://raw.githubusercontent.com/codelitdev/courselit/main/deployment/docker/docker-compose.yml',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://docs.courselit.app/self-hosting/self-host/', 'https://raw.githubusercontent.com/codelitdev/courselit/main/deployment/docker/docker-compose.yml']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://docs.courselit.app/self-hosting/self-host/"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://docs.courselit.app/self-hosting/self-host/"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://docs.courselit.app/self-hosting/self-host/"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='6b22a2a7-e724-42e9-b50e-f596699980c9'::uuid AND a.slug='courselit' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://docs.courselit.app/self-hosting/self-host/' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker', 'compose']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM (TRUE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for courselit'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://raw.githubusercontent.com/codelitdev/courselit/main/deployment/docker/docker-compose.yml","source_url":"https://docs.courselit.app/self-hosting/self-host/","image":"codelit/courselit-app","note":"Self-host guide recommends the provided Compose deployment.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://docs.courselit.app/self-hosting/self-host/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://raw.githubusercontent.com/codelitdev/courselit/main/deployment/docker/docker-compose.yml']::text[],
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
    docker_images=ARRAY['codelit/courselit-app']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='6b22a2a7-e724-42e9-b50e-f596699980c9'::uuid AND a.slug='courselit' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for courselit'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://cozystack.io/docs/v1.6/install/cozystack/',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['kubernetes']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://cozystack.io/docs/v1.6/install/cozystack/', 'https://cozystack.io/docs/v1.6/install/kubernetes/talm/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='a6dd4753-22da-44a7-b1cc-1eb8dca7ea50'::uuid AND a.slug='cozystack' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://cozystack.io/docs/getting-started/' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for cozystack'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"kubernetes","label":"Kubernetes installation","url":"https://cozystack.io/docs/v1.6/install/cozystack/","source_url":"https://cozystack.io/docs/v1.6/install/cozystack/","image":null,"note":"Official guide installs Cozystack on a Kubernetes cluster.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://cozystack.io/docs/v1.6/install/cozystack/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    kubernetes_urls=ARRAY['https://cozystack.io/docs/v1.6/install/cozystack/']::text[],
    helm_urls=ARRAY[]::text[],
    native_urls=ARRAY[]::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='a6dd4753-22da-44a7-b1cc-1eb8dca7ea50'::uuid AND a.slug='cozystack' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for cozystack'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://craftcms.com/docs/5.x/install.html',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['package']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://craftcms.com/docs/5.x/install.html', 'https://craftcms.com/knowledge-base/using-the-starter-project']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='87fb5f68-fe07-4478-8b71-9c3ce45e7da3'::uuid AND a.slug='craft-cms' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://craftcms.com/docs/5.x/install.html' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for craft-cms'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"package","label":"Composer project","url":"https://craftcms.com/knowledge-base/using-the-starter-project","source_url":"https://craftcms.com/docs/5.x/install.html","image":null,"note":"Install the official starter project with Composer.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://craftcms.com/docs/5.x/install.html']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    package_urls=ARRAY['https://craftcms.com/knowledge-base/using-the-starter-project']::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='87fb5f68-fe07-4478-8b71-9c3ce45e7da3'::uuid AND a.slug='craft-cms' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for craft-cms'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md',
    docker_url='https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md',
    docker_image=NULL,
    compose_url='https://github.com/trycompai/comp/blob/main/docker-compose.yml',
    deployment_methods=ARRAY['compose']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md', 'https://github.com/trycompai/comp/blob/main/docker-compose.yml', 'https://www.trycomp.ai/docs/self-hosting/env-reference']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='1db3d9b0-0220-4c77-b09b-27b26881c23b'::uuid AND a.slug='crm' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/trycompai/crm#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for crm'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"compose","label":"Docker Compose","url":"https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md","source_url":"https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md","image":null,"note":"Self-host guide covers app and portal; PostgreSQL, email, and workflow services are required.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY[]::text[],
    compose_urls=ARRAY['https://github.com/trycompai/comp/blob/main/SELF_HOSTING.md']::text[],
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
  WHERE i.app_id=a.id AND a.id='1db3d9b0-0220-4c77-b09b-27b26881c23b'::uuid AND a.slug='crm' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for crm'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/bretzel-app/crumbs#readme',
    docker_url='https://github.com/orgs/bretzel-app/packages/container/package/crumbs',
    docker_image='ghcr.io/bretzel-app/crumbs:latest',
    compose_url='https://github.com/bretzel-app/crumbs#readme',
    deployment_methods=ARRAY['compose', 'docker', 'native']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/bretzel-app/crumbs', 'https://github.com/orgs/bretzel-app/packages/container/package/crumbs']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://github.com/bretzel-app/crumbs#readme"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://github.com/bretzel-app/crumbs#readme"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://github.com/bretzel-app/crumbs#readme"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='83666fbf-009e-47ba-841c-b311e21724e6'::uuid AND a.slug='crumbs' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/bretzel-app/crumbs#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for crumbs'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://github.com/orgs/bretzel-app/packages/container/package/crumbs","source_url":"https://github.com/bretzel-app/crumbs#readme","image":"ghcr.io/bretzel-app/crumbs:latest","note":null,"support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/bretzel-app/crumbs/blob/main/docker-compose.yml","source_url":"https://github.com/bretzel-app/crumbs#readme","image":"ghcr.io/bretzel-app/crumbs:latest","note":null,"support_level":"official","sort_order":20},{"method":"native","label":"Node.js install","url":"https://github.com/bretzel-app/crumbs#readme","source_url":"https://github.com/bretzel-app/crumbs#readme","image":null,"note":"The README documents a manual pnpm build and Node.js server run.","support_level":"official","sort_order":30}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/bretzel-app/crumbs#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://github.com/orgs/bretzel-app/packages/container/package/crumbs']::text[],
    compose_urls=ARRAY['https://github.com/bretzel-app/crumbs/blob/main/docker-compose.yml']::text[],
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
    native_urls=ARRAY['https://github.com/bretzel-app/crumbs#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY['ghcr.io/bretzel-app/crumbs:latest']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='83666fbf-009e-47ba-841c-b311e21724e6'::uuid AND a.slug='crumbs' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for crumbs'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/cstate/cstate#readme',
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY['native']::text[],
    docker_support='unknown',
    compose_support=NULL,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/cstate/cstate']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"unchecked","checked_at":"2026-09-30","confidence":"low","note":"The old Docker URL was only the source repository. Upstream documents Hugo static-site generation; Docker install remains unverified.","source_urls":["https://github.com/cstate/cstate"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='357a1766-3e5a-4ac2-a050-8043b6bbbf00'::uuid AND a.slug='cstate' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/cstate/cstate' AND a.docker_url IS NOT DISTINCT FROM 'https://github.com/cstate/cstate' AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['docker']::text[] AND a.docker_support IS NOT DISTINCT FROM 'official' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for cstate'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"native","label":"Hugo static site","url":"https://github.com/cstate/cstate#readme","source_url":"https://github.com/cstate/cstate#readme","image":null,"note":"Build the Hugo status page and host the generated static files on your own web server.","support_level":"official","sort_order":10}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/cstate/cstate#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
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
    native_urls=ARRAY['https://github.com/cstate/cstate#readme']::text[],
    binary_urls=ARRAY[]::text[],
    package_urls=ARRAY[]::text[],
    other_urls=ARRAY[]::text[],
    docker_images=ARRAY[]::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='357a1766-3e5a-4ac2-a050-8043b6bbbf00'::uuid AND a.slug='cstate' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for cstate'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url=NULL,
    docker_url=NULL,
    docker_image=NULL,
    compose_url=NULL,
    deployment_methods=ARRAY[]::text[],
    docker_support='unknown',
    compose_support=NULL,
    published=FALSE,
    self_hosting_status='not_self_hostable',
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/Kshitij-Banerjee/Cubiks-2048', 'https://kshitij-banerjee.github.io/Cubiks-2048/']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    updated_at=now()
  WHERE a.id='f9fe7aa1-51bc-4ceb-82d0-6c7fac4649f7'::uuid AND a.slug='cubiks-2048' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/Kshitij-Banerjee/Cubiks-2048' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY[]::text[] AND a.docker_support IS NOT DISTINCT FROM 'unknown' AND a.compose_support IS NOT DISTINCT FROM (NULL);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for cubiks-2048'; END IF;

  UPDATE public.self_host_apps AS a SET
    install_docs_url='https://github.com/netbootxyz/docker-netbootxyz#readme',
    docker_url='https://hub.docker.com/r/netbootxyz/netbootxyz',
    docker_image='ghcr.io/netbootxyz/netbootxyz',
    compose_url='https://github.com/netbootxyz/docker-netbootxyz/blob/master/docker-compose.yml.example',
    deployment_methods=ARRAY['compose', 'docker']::text[],
    docker_support='official',
    compose_support=TRUE,
    data_source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(a.data_source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/netbootxyz/docker-netbootxyz', 'https://hub.docker.com/r/netbootxyz/netbootxyz']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || '{"docker":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker-based installation route.","source_urls":["https://github.com/netbootxyz/docker-netbootxyz#readme"]},"docker_image":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources identify the image listed in the install option.","source_urls":["https://github.com/netbootxyz/docker-netbootxyz#readme"]},"compose":{"status":"published","checked_at":"2026-09-30","confidence":"high","note":"Official sources document a Docker Compose installation route.","source_urls":["https://github.com/netbootxyz/docker-netbootxyz#readme"]}}'::jsonb,
    updated_at=now()
  WHERE a.id='e21ff9a4-185a-4085-b7cd-9a8a4fcc3843'::uuid AND a.slug='docker-netbootxyz' AND a.published IS NOT DISTINCT FROM TRUE AND a.self_hosting_status IS NOT DISTINCT FROM 'self_hostable' AND a.install_docs_url IS NOT DISTINCT FROM 'https://github.com/netbootxyz/docker-netbootxyz#readme' AND a.docker_url IS NOT DISTINCT FROM NULL AND a.docker_image IS NOT DISTINCT FROM NULL AND a.compose_url IS NOT DISTINCT FROM NULL AND a.deployment_methods IS NOT DISTINCT FROM ARRAY['native']::text[] AND a.docker_support IS NOT DISTINCT FROM 'none' AND a.compose_support IS NOT DISTINCT FROM (FALSE);
  IF NOT FOUND THEN RAISE EXCEPTION 'Review guard failed for docker-netbootxyz'; END IF;

  UPDATE public.self_host_app_install_options AS i SET
    options='[{"method":"docker","label":"Docker image","url":"https://hub.docker.com/r/netbootxyz/netbootxyz","source_url":"https://github.com/netbootxyz/docker-netbootxyz#readme","image":"ghcr.io/netbootxyz/netbootxyz","note":"Requires a separate DHCP server.","support_level":"official","sort_order":10},{"method":"compose","label":"Docker Compose","url":"https://github.com/netbootxyz/docker-netbootxyz/blob/master/docker-compose.yml.example","source_url":"https://github.com/netbootxyz/docker-netbootxyz#readme","image":"ghcr.io/netbootxyz/netbootxyz","note":"Configure DHCP separately.","support_level":"official","sort_order":20}]'::jsonb,
    source_urls=ARRAY(SELECT DISTINCT source_url FROM unnest(coalesce(i.source_urls,ARRAY[]::text[]) || ARRAY['https://github.com/netbootxyz/docker-netbootxyz#readme']::text[]) AS sources(source_url) WHERE source_url IS NOT NULL ORDER BY source_url),
    checked_at=now(),
    docker_urls=ARRAY['https://hub.docker.com/r/netbootxyz/netbootxyz']::text[],
    compose_urls=ARRAY['https://github.com/netbootxyz/docker-netbootxyz/blob/master/docker-compose.yml.example']::text[],
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
    docker_images=ARRAY['ghcr.io/netbootxyz/netbootxyz']::text[],
    updated_at=now()
  FROM public.self_host_apps AS a
  WHERE i.app_id=a.id AND a.id='e21ff9a4-185a-4085-b7cd-9a8a4fcc3843'::uuid AND a.slug='docker-netbootxyz' AND i.options IS NOT DISTINCT FROM '[]'::jsonb AND coalesce(cardinality(i.docker_urls),0)=0 AND coalesce(cardinality(i.compose_urls),0)=0 AND coalesce(cardinality(i.truenas_scale_urls),0)=0 AND coalesce(cardinality(i.unraid_urls),0)=0 AND coalesce(cardinality(i.umbrel_urls),0)=0 AND coalesce(cardinality(i.yunohost_urls),0)=0 AND coalesce(cardinality(i.casaos_urls),0)=0 AND coalesce(cardinality(i.runtipi_urls),0)=0 AND coalesce(cardinality(i.cosmos_urls),0)=0 AND coalesce(cardinality(i.openmediavault_urls),0)=0 AND coalesce(cardinality(i.synology_urls),0)=0 AND coalesce(cardinality(i.qnap_urls),0)=0 AND coalesce(cardinality(i.proxmox_urls),0)=0 AND coalesce(cardinality(i.home_assistant_os_urls),0)=0 AND coalesce(cardinality(i.kubernetes_urls),0)=0 AND coalesce(cardinality(i.helm_urls),0)=0 AND coalesce(cardinality(i.native_urls),0)=0 AND coalesce(cardinality(i.binary_urls),0)=0 AND coalesce(cardinality(i.package_urls),0)=0 AND coalesce(cardinality(i.other_urls),0)=0 AND coalesce(cardinality(i.docker_images),0)=0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Install snapshot guard failed for docker-netbootxyz'; END IF;

END $$;

COMMIT;
