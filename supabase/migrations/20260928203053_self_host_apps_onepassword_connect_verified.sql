begin;

do $migration$
declare
  v_app_id uuid;
  v_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='1password-connect' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='1Password Connect'
    and a.source_code_url='https://github.com/1password/connect'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id is null and a.source_model='source_available'
    and a.docker_support='none' and a.docker_image is null and a.compose_support is false
    and a.requires_database is null and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception '1Password Connect record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['identity-access','password-managers','security-privacy']::text[] then
    raise exception '1Password Connect categories changed since review';
  end if;

  select io.options into v_options
  from public.self_host_app_install_options io where io.app_id=v_app_id for update;
  if v_options is distinct from '[
    {"url":"https://apps.truenas.com/catalog/onepassword-connect_community/","note":"Listed in the TrueNAS SCALE app catalog; catalog listing does not imply publisher support.","image":null,"label":"TrueNAS SCALE catalog","method":"truenas_scale","sort_order":30,"source_url":"https://apps.truenas.com/catalog/onepassword-connect_community/","support_level":"community"}
  ]'::jsonb then raise exception '1Password Connect install options changed since review'; end if;

  update public.self_host_apps a set
    name='1Password Connect',
    summary='Runs a private REST API that lets applications access items in selected 1Password vaults.',
    website_url='https://1password.com/features/secrets-management',
    source_code_url='https://github.com/1Password/connect',source_code_host='github',
    github_owner='1Password',github_repo='connect',github_full_name='1Password/connect',source_full_name='1Password/connect',
    docs_url='https://www.1password.dev/connect',install_docs_url='https://www.1password.dev/connect/get-started',
    docker_url='https://hub.docker.com/r/1password/connect-api',
    compose_url='https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml',
    publisher_name='1Password',publisher_type='company',publisher_url='https://1password.com/',
    docker_support='official',docker_image='1password/connect-api:latest',compose_support=true,
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',
    ram_min_mb=null,ram_recommended_mb=null,storage_min_gb=null,resource_requirement_kind='unknown',
    surfaces=array['api']::text[],deployment_methods=array['docker','compose','helm','kubernetes','truenas_scale']::text[],
    summary_source='https://www.1password.dev/connect',summary_confidence='high',
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"not_published","checked_at":"2026-09-29","confidence":"high","note":"The public 1Password Connect repository has no license file. The repository is source available; its README says API and service use follows the 1Password API Terms of Service.","source_urls":["https://github.com/1Password/connect"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed RAM range is an estimate for both Connect services. The official Helm chart sets an API container memory limit and leaves Sync resources configurable.","source_urls":["https://github.com/1Password/connect-helm-charts/blob/main/charts/connect/values.yaml"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The listed storage range is an estimate for cached vault data in the shared Connect data volume.","source_urls":["https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml","https://www.1password.dev/connect"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official setup uses the 1password/connect-api and 1password/connect-sync images.","source_urls":["https://www.1password.dev/connect/get-started","https://hub.docker.com/r/1password/connect-api","https://hub.docker.com/r/1password/connect-sync"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Docker Compose example pulls the API and Sync images from 1Password.","source_urls":["https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml"]},
      "compose":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"1Password documents Docker Compose and publishes an official Compose example.","source_urls":["https://www.1password.dev/connect/get-started","https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The documented setup uses the API and Sync services without requiring a separate database service.","source_urls":["https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The official Compose example mounts a shared data volume for the API and Sync services.","source_urls":["https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Connect serves a private REST API for applications and services.","source_urls":["https://www.1password.dev/connect"]}
    }'::jsonb),
    data_source_urls=array[
      'https://1password.com/features/secrets-management',
      'https://www.1password.dev/connect',
      'https://www.1password.dev/connect/get-started',
      'https://github.com/1Password/connect',
      'https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml',
      'https://github.com/1Password/connect/blob/main/examples/kubernetes/README.md',
      'https://hub.docker.com/r/1password/connect-api',
      'https://hub.docker.com/r/1password/connect-sync',
      'https://github.com/1Password/connect-helm-charts',
      'https://github.com/1Password/connect-helm-charts/blob/main/charts/connect/values.yaml',
      'https://apps.truenas.com/catalog/onepassword-connect_community/'
    ]::text[],
    data_checked_at=now(),data_confidence='high',technical_facts_checked_at=now(),updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception '1Password Connect app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=256,ram_estimate_max_mb=1024,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for the API and Sync containers together; the official Helm chart sets a 128 MiB API container limit and leaves Sync sizing configurable.',
    ram_source_urls=array['https://github.com/1Password/connect-helm-charts/blob/main/charts/connect/values.yaml'],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='The API and Sync services share local cached vault data; storage grows with the selected vault contents.',
    storage_source_urls=array['https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml','https://www.1password.dev/connect'],
    checked_at=now(),updated_at=now()
  where e.app_id=v_app_id and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception '1Password Connect estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/1password/connect-api","note":"Official API image. Run it with the 1password/connect-sync image as shown in the official Compose guide.","image":"1password/connect-api:latest","label":"Docker images","method":"docker","sort_order":10,"source_url":"https://www.1password.dev/connect/get-started","support_level":"official"},
      {"url":"https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml","note":"Official Compose example starts the API and Sync services together.","image":"1password/connect-api:latest; 1password/connect-sync:latest","label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://www.1password.dev/connect/get-started","support_level":"official"},
      {"url":"https://github.com/1Password/connect/blob/main/examples/kubernetes/README.md","note":"Official Kubernetes deployment example.","image":"1password/connect-api:latest; 1password/connect-sync:latest","label":"Kubernetes","method":"kubernetes","sort_order":25,"source_url":"https://www.1password.dev/connect/get-started","support_level":"official"},
      {"url":"https://github.com/1Password/connect-helm-charts","note":"Official Helm chart for 1Password Connect.","image":"1password/connect-api:latest; 1password/connect-sync:latest","label":"Helm chart","method":"helm","sort_order":26,"source_url":"https://www.1password.dev/connect/get-started","support_level":"official"},
      {"url":"https://apps.truenas.com/catalog/onepassword-connect_community/","note":"Listed in the TrueNAS SCALE Community catalog; this is not publisher support.","image":null,"label":"TrueNAS SCALE catalog","method":"truenas_scale","sort_order":30,"source_url":"https://apps.truenas.com/catalog/onepassword-connect_community/","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/1password/connect-api','https://hub.docker.com/r/1password/connect-sync'],
    docker_images=array['1password/connect-api:latest','1password/connect-sync:latest'],
    compose_urls=array['https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml'],
    kubernetes_urls=array['https://github.com/1Password/connect/blob/main/examples/kubernetes/README.md'],
    helm_urls=array['https://github.com/1Password/connect-helm-charts'],
    truenas_scale_urls=array['https://apps.truenas.com/catalog/onepassword-connect_community/'],
    unraid_urls='{}',
    source_urls=array[
      'https://www.1password.dev/connect/get-started',
      'https://hub.docker.com/r/1password/connect-api',
      'https://hub.docker.com/r/1password/connect-sync',
      'https://github.com/1Password/connect/blob/main/examples/docker/compose/docker-compose.yaml',
      'https://github.com/1Password/connect/blob/main/examples/kubernetes/README.md',
      'https://github.com/1Password/connect-helm-charts',
      'https://apps.truenas.com/catalog/onepassword-connect_community/'
    ],
    checked_at=now(),updated_at=now()
  where io.app_id=v_app_id and io.options=v_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception '1Password Connect install options update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug in ('developer-tools','identity-access','security-privacy');
  get diagnostics v_affected=row_count;
  if v_affected<>3 then raise exception '1Password Connect categories update failed'; end if;
end
$migration$;

commit;
