begin;

do $review_guard$
begin
  if not exists (
    select 1 from public.self_host_apps
    where slug='affine-community-edition'
      and license='Mixed MIT and backend server license'
      and license_type='permissive'
      and docker_url='https://docs.affine.pro/self-host-affine/references/docker-compose-yml'
      and docker_image='ghcr.io/toeverything/affine:0.27.4@sha256:b649f5ce2384ffdf13c23bccf81d759e15973d59d0b0058af65d895a84373099'
      and compose_url='https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/affine/docker-compose.yml'
      and storage_profile='low'
  ) then raise exception 'AFFiNE changed since review'; end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='coolify'
      and docs_url='https://github.com/coollabsio/coolify#readme'
      and install_docs_url='https://github.com/coollabsio/coolify#readme'
      and docker_url='https://github.com/coollabsio/coolify/blob/HEAD/docker-compose.yml'
      and docker_image='ghcr.io/coollabsio/coolify:4.3.14'
      and compose_url='https://github.com/coollabsio/coolify/blob/HEAD/docker-compose.yml'
      and publisher_name='coollabsio' and publisher_type='community'
      and publisher_url='https://github.com/coollabsio'
      and ram_min_mb is null and ram_recommended_mb is null and storage_min_gb is null
      and resource_requirement_kind='unknown'
  ) then raise exception 'Coolify changed since review'; end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='memos'
      and docs_url='https://github.com/usememos/memos#readme'
      and install_docs_url='https://github.com/usememos/memos#readme'
      and docker_url='https://github.com/usememos/memos/blob/HEAD/scripts/compose.yaml'
      and docker_image='neosmemo/memos:0.30.0@sha256:71a5b4738d1bed96e92112004054f0888e92791b64eb78afd79077c96e6f9327'
      and compose_url='https://github.com/usememos/memos/blob/HEAD/scripts/compose.yaml'
      and requires_database is true and database_types=ARRAY['postgres']::text[]
      and storage_profile='low'
  ) then raise exception 'Memos changed since review'; end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='nocodb'
      and summary='Spreadsheet-style database UI for building tables, forms, and API-backed workflows.'
      and install_docs_url='https://nocodb.com/docs/self-hosting/installation/quickstart'
      and compose_url='https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/nocodb/docker-compose.yml'
      and ram_min_mb is null and ram_recommended_mb is null and storage_min_gb is null
      and resource_requirement_kind='unknown'
  ) then raise exception 'NocoDB changed since review'; end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='penpot' and name='penpot'
      and summary='Web design and prototyping app meant for cross-domain teams.'
      and docs_url='https://github.com/penpot/penpot#readme'
      and install_docs_url='https://github.com/penpot/penpot#readme'
      and docker_url='https://github.com/penpot/penpot/blob/HEAD/docker/images/docker-compose.yaml'
      and docker_image='penpotapp/frontend:2.17.2@sha256:94fa2864d8fc0cd62245af95c03cca89306a7fd23c206a98a3e9dc9a376ea27e'
      and compose_url='https://github.com/penpot/penpot/blob/HEAD/docker/images/docker-compose.yaml'
      and publisher_name='penpot' and publisher_type='community'
      and publisher_url='https://github.com/penpot'
  ) then raise exception 'Penpot changed since review'; end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='pocketbase'
      and summary='Backend for your next SaaS and Mobile app in one file.'
      and docs_url='https://github.com/pocketbase/pocketbase#readme'
      and install_docs_url='https://github.com/pocketbase/pocketbase#readme'
      and docker_url is null
      and docker_image='ghcr.io/muchobien/pocketbase:0.40.1@sha256:8b14308d9634c37bfb4d8ecfd7b90e5961b0f0b4e6b7c8d7116f4c68fabbe58c'
      and requires_database is true and database_types=ARRAY['pocketbase']::text[]
      and storage_profile='high' and surfaces=ARRAY['web','mobile']::text[]
  ) then raise exception 'PocketBase changed since review'; end if;

  if not exists (
    select 1 from public.self_host_apps
    where slug='vaultwarden'
      and requires_database is true and database_types=ARRAY['postgres']::text[]
      and storage_profile='high'
      and compose_url='https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/vaultwarden/docker-compose.yml'
  ) then raise exception 'Vaultwarden changed since review'; end if;

  if not exists (select 1 from public.self_host_apps where slug='localsend' and docker_url='https://github.com/localsend/localsend/blob/HEAD/server/Dockerfile') then
    raise exception 'LocalSend changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='world-monitor' and docker_url='https://github.com/koala73/worldmonitor/blob/HEAD/docker-compose.yml') then
    raise exception 'World Monitor changed since review';
  end if;
  if not exists (select 1 from public.self_host_apps where slug='hoppscotch-community-edition' and docker_url='https://github.com/hoppscotch/hoppscotch/blob/main/docker-compose.yml') then
    raise exception 'Hoppscotch changed since review';
  end if;

  if exists (
    select 1 from public.self_host_apps a
    where a.slug in ('affine-community-edition','nocodb','penpot','vaultwarden')
      and a.slug='affine-community-edition'
      and (select array_agg(c.slug order by c.slug)
           from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
           where l.app_id=a.id) is distinct from ARRAY['communities-social','knowledge-notes','security-privacy']::text[]
  ) then raise exception 'AFFiNE categories changed since review'; end if;
  if exists (
    select 1 from public.self_host_apps a
    where a.slug='nocodb'
      and (select array_agg(c.slug order by c.slug)
           from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
           where l.app_id=a.id) is distinct from ARRAY['databases','developer-tools','documents-pdfs']::text[]
  ) then raise exception 'NocoDB categories changed since review'; end if;
  if exists (
    select 1 from public.self_host_apps a
    where a.slug='penpot'
      and (select array_agg(c.slug order by c.slug)
           from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
           where l.app_id=a.id) is distinct from ARRAY['system-admin-hosting']::text[]
  ) then raise exception 'Penpot categories changed since review'; end if;
  if exists (
    select 1 from public.self_host_apps a
    where a.slug='vaultwarden'
      and (select array_agg(c.slug order by c.slug)
           from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
           where l.app_id=a.id) is distinct from ARRAY['developer-tools','password-managers']::text[]
  ) then raise exception 'Vaultwarden categories changed since review'; end if;

  if not exists (
    select 1 from public.self_host_app_install_options i
    join public.self_host_apps a on a.id=i.app_id
    where a.slug='memos'
      and i.options @> '[{"method":"docker","image":"neosmemo/memos:0.30.0@sha256:71a5b4738d1bed96e92112004054f0888e92791b64eb78afd79077c96e6f9327"}]'::jsonb
      and i.options @> '[{"method":"compose","image":"neosmemo/memos:0.30.0@sha256:71a5b4738d1bed96e92112004054f0888e92791b64eb78afd79077c96e6f9327"}]'::jsonb
  ) then raise exception 'Memos install options changed since review'; end if;
  if not exists (
    select 1 from public.self_host_app_install_options i
    join public.self_host_apps a on a.id=i.app_id
    where a.slug='nocodb' and i.options @> '[{"method":"compose","support_level":"community","url":"https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/nocodb/docker-compose.yml"}]'::jsonb
  ) then raise exception 'NocoDB install options changed since review'; end if;
  if not exists (
    select 1 from public.self_host_app_install_options i
    join public.self_host_apps a on a.id=i.app_id
    where a.slug='pocketbase' and i.options @> '[{"method":"docker","image":"ghcr.io/muchobien/pocketbase:0.40.1@sha256:8b14308d9634c37bfb4d8ecfd7b90e5961b0f0b4e6b7c8d7116f4c68fabbe58c"}]'::jsonb
  ) then raise exception 'PocketBase install options changed since review'; end if;
  if not exists (
    select 1 from public.self_host_app_install_options i
    join public.self_host_apps a on a.id=i.app_id
    where a.slug='vaultwarden' and i.options @> '[{"method":"compose","support_level":"community","url":"https://raw.githubusercontent.com/getumbrel/umbrel-apps/master/vaultwarden/docker-compose.yml"}]'::jsonb
  ) then raise exception 'Vaultwarden install options changed since review'; end if;

  if exists (
    select 1 from (values
      ('affine-community-edition',256::numeric,2048::numeric,1::numeric,20::numeric,'Typical small self-hosted instance; workload and stored data vary.'::text),
      ('coolify',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('memos',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('nocodb',1024,8192,5,100,'Small single-node service; data volume and request load vary.'),
      ('penpot',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('pocketbase',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.'),
      ('prometheus',256,2048,5,100,'Typical small self-hosted instance; workload and stored data vary.'),
      ('vaultwarden',256,2048,1,20,'Typical small self-hosted instance; workload and stored data vary.')
    ) expected(slug,ram_min,ram_max,storage_min,storage_max,old_basis)
    join public.self_host_apps a on a.slug=expected.slug
    join public.self_host_app_resource_estimates r on r.app_id=a.id
    where r.ram_estimate_min_mb is distinct from expected.ram_min
       or r.ram_estimate_max_mb is distinct from expected.ram_max
       or r.storage_estimate_min_gb is distinct from expected.storage_min
       or r.storage_estimate_max_gb is distinct from expected.storage_max
       or r.ram_estimate_basis is distinct from expected.old_basis
       or r.storage_estimate_basis is distinct from expected.old_basis
  ) then raise exception 'One or more resource rows changed since review'; end if;

  if exists (select 1 from public.self_host_app_categories where slug='design-creative' and (name,icon_key,sort_order) is distinct from ('design & creative','pencil-ruler',105)) then
    raise exception 'design-creative already exists with unexpected values';
  end if;
end;
$review_guard$;

insert into public.self_host_app_categories (slug,name,icon_key,sort_order)
values ('design-creative','design & creative','pencil-ruler',105)
on conflict (slug) do nothing;

update public.self_host_apps
set license='Mixed MIT, MPL-2.0, and AFFiNE EE License',
    license_type='custom',
    docker_url='https://github.com/toeverything/AFFiNE/pkgs/container/affine',
    docker_image='ghcr.io/toeverything/affine:stable',
    compose_url='https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml',
    storage_profile='depends',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official self-host Compose file uses the AFFiNE stable container image.','source_urls',jsonb_build_array('https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml','https://github.com/toeverything/AFFiNE/pkgs/container/affine')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','AFFiNE publishes a self-host Compose stack with PostgreSQL and Redis.','source_urls',jsonb_build_array('https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official stack uses PostgreSQL with pgvector and Redis.','source_urls',jsonb_build_array('https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Compose stack persists the PostgreSQL data, workspace files, and configuration.','source_urls',jsonb_build_array('https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml'))
    ),
    updated_at=now()
where slug='affine-community-edition';

update public.self_host_apps
set docs_url='https://coolify.io/docs/',
    install_docs_url='https://coolify.io/docs/start-with-self-hosted',
    docker_url='https://hub.docker.com/r/coollabsio/coolify',
    docker_image='coollabsio/coolify:latest',
    compose_url='https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml',
    publisher_name='CoolLabs Solutions Kft.',
    publisher_type='company',
    publisher_url='https://coolify.io/privacy-policy',
    ram_min_mb=2048,
    storage_min_gb=10,
    resource_requirement_kind='official_minimum',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Coolify lists 2 GB RAM as its minimum; deployed projects need additional resources.','source_urls',jsonb_build_array('https://coolify.io/docs/start-with-self-hosted')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Coolify lists 10 GB free disk as its minimum and advises additional space for images, volumes, and backups.','source_urls',jsonb_build_array('https://coolify.io/docs/start-with-self-hosted')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Coolify publishes the coollabsio/coolify image on Docker Hub.','source_urls',jsonb_build_array('https://hub.docker.com/r/coollabsio/coolify')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The publisher provides a production Compose stack with PostgreSQL and Redis.','source_urls',jsonb_build_array('https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The production stack runs PostgreSQL and Redis.','source_urls',jsonb_build_array('https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The production stack persists Coolify data, images, database records, and Redis data.','source_urls',jsonb_build_array('https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml'))
    ),
    updated_at=now()
where slug='coolify';

update public.self_host_apps
set docs_url='https://usememos.com/docs',
    install_docs_url='https://usememos.com/docs/getting-started',
    docker_url='https://hub.docker.com/r/neosmemo/memos',
    docker_image='neosmemo/memos:stable',
    compose_url='https://github.com/usememos/memos/blob/main/scripts/compose.yaml',
    requires_database=false,
    database_types=ARRAY['sqlite','mysql','postgres']::text[],
    storage_profile='depends',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official guide uses the neosmemo/memos stable image.','source_urls',jsonb_build_array('https://usememos.com/docs/getting-started','https://hub.docker.com/r/neosmemo/memos')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official project repository includes a Compose setup.','source_urls',jsonb_build_array('https://github.com/usememos/memos/blob/main/scripts/compose.yaml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','SQLite is the default; MySQL and PostgreSQL are optional external backends.','source_urls',jsonb_build_array('https://usememos.com/docs/deploy/docker')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Docker guide mounts the Memos data directory for persistent data.','source_urls',jsonb_build_array('https://usememos.com/docs/getting-started','https://usememos.com/docs/deploy/docker'))
    ),
    updated_at=now()
where slug='memos';

update public.self_host_apps
set summary='Turns databases into collaborative spreadsheets, forms, and APIs.',
    summary_source='https://nocodb.com/docs/self-hosting',
    summary_confidence='high',
    docs_url='https://nocodb.com/docs/self-hosting',
    install_docs_url='https://nocodb.com/docs/self-hosting/installation/quickstart',
    compose_url='https://nocodb.com/docs/self-hosting/installation/quickstart',
    ram_min_mb=2048,
    ram_recommended_mb=8192,
    storage_min_gb=10,
    resource_requirement_kind='official_minimum',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','NocoDB lists 2 GB minimum RAM and 8 GB recommended for production.','source_urls',jsonb_build_array('https://product-feed.nocodb.com/docs/self-hosting')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','NocoDB lists 10 GB minimum disk and 50 GB or more recommended for production.','source_urls',jsonb_build_array('https://product-feed.nocodb.com/docs/self-hosting')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official quickstart includes the NocoDB app, a worker, PostgreSQL, and Redis.','source_urls',jsonb_build_array('https://product-feed.nocodb.com/docs/self-hosting/installation/quickstart')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official quickstart generates and starts a Docker Compose stack.','source_urls',jsonb_build_array('https://product-feed.nocodb.com/docs/self-hosting/installation/quickstart')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official quickstart persists its PostgreSQL, Redis, and NocoDB data in named volumes.','source_urls',jsonb_build_array('https://product-feed.nocodb.com/docs/self-hosting/installation/quickstart'))
    ),
    updated_at=now()
where slug='nocodb';

update public.self_host_apps
set name='Penpot',
    summary='Collaborative design tool for creating interface layouts, prototypes, and design systems.',
    summary_source='https://penpot.app/',
    summary_confidence='high',
    docs_url='https://help.penpot.app/technical-guide/',
    install_docs_url='https://help.penpot.app/technical-guide/getting-started/',
    docker_url='https://hub.docker.com/r/penpotapp/frontend',
    docker_image='penpotapp/frontend:latest',
    compose_url='https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml',
    publisher_name='Kaleidos',
    publisher_type='company',
    publisher_url='https://penpot.app/about',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Penpot documents its official Docker images and Compose setup.','source_urls',jsonb_build_array('https://help.penpot.app/technical-guide/getting-started/docker/','https://hub.docker.com/r/penpotapp/frontend')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Penpot publishes an official Compose file for production self-hosting.','source_urls',jsonb_build_array('https://help.penpot.app/technical-guide/getting-started/docker/','https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Penpot requires PostgreSQL; Valkey or Redis is used for websocket coordination and cache.','source_urls',jsonb_build_array('https://help.penpot.app/technical-guide/configuration/','https://help.penpot.app/technical-guide/getting-started/docker/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official Compose deployment persists PostgreSQL and user-uploaded assets.','source_urls',jsonb_build_array('https://help.penpot.app/technical-guide/getting-started/docker/')),
      'ram',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Penpot says 4 CPUs and 16 GB RAM can support thousands of users.','source_urls',jsonb_build_array('https://help.penpot.app/technical-guide/getting-started/recommended-settings/')),
      'storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Penpot recommends 50 to 100 GB database capacity for up to 10 editors, with user-uploaded files also using storage.','source_urls',jsonb_build_array('https://help.penpot.app/technical-guide/getting-started/recommended-settings/'))
    ),
    updated_at=now()
where slug='penpot';

update public.self_host_apps
set summary='Backend platform with an embedded SQLite database, user authentication, file storage, and a REST API.',
    summary_source='https://pocketbase.io/docs/',
    summary_confidence='high',
    docs_url='https://pocketbase.io/docs/',
    install_docs_url='https://pocketbase.io/docs/going-to-production/',
    docker_url='https://github.com/muchobien/pocketbase/pkgs/container/pocketbase',
    docker_image='ghcr.io/muchobien/pocketbase:0.40.4',
    requires_database=false,
    database_types=ARRAY['sqlite']::text[],
    storage_profile='depends',
    surfaces=ARRAY['web','api']::text[],
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','PocketBase has no official Docker image; the listed GHCR image is community maintained.','source_urls',jsonb_build_array('https://pocketbase.io/docs/going-to-production/','https://github.com/muchobien/pocketbase/pkgs/container/pocketbase')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','PocketBase includes an embedded SQLite database and does not require an external database.','source_urls',jsonb_build_array('https://pocketbase.io/docs/')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','PocketBase stores its database and uploaded files in pb_data.','source_urls',jsonb_build_array('https://pocketbase.io/docs/going-to-production/'))
    ),
    updated_at=now()
where slug='pocketbase';

update public.self_host_apps
set requires_database=false,
    database_types=ARRAY['sqlite','mysql','postgres']::text[],
    storage_profile='depends',
    compose_url='https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Vaultwarden defaults to SQLite; MySQL and PostgreSQL can be configured as external databases.','source_urls',jsonb_build_array('https://github.com/dani-garcia/vaultwarden/blob/main/.env.template')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official project documents a Docker Compose deployment.','source_urls',jsonb_build_array('https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose','https://github.com/dani-garcia/vaultwarden/blob/main/README.md')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official container persists Vaultwarden data under /data.','source_urls',jsonb_build_array('https://github.com/dani-garcia/vaultwarden/blob/main/README.md'))
    ),
    updated_at=now()
where slug='vaultwarden';

update public.self_host_apps
set docker_url=null,
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'self_hosting',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','LocalSend is installed on sender and receiver devices and does not use servers.','source_urls',jsonb_build_array('https://localsend.org/','https://github.com/localsend/localsend/blob/main/README.md')),
      'docker',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','high','note','The official project is a peer-to-peer client and does not publish a self-hosted server image.','source_urls',jsonb_build_array('https://localsend.org/','https://github.com/localsend/localsend/blob/main/README.md'))
    ),
    updated_at=now()
where slug='localsend';

update public.self_host_apps
set docker_url=null,
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official self-host guide uses Docker Compose; the project does not provide a standalone image registry destination.','source_urls',jsonb_build_array('https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md','https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official project provides a Compose deployment.','source_urls',jsonb_build_array('https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md','https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml'))
    ),
    updated_at=now()
where slug='world-monitor';

update public.self_host_apps
set docker_url='https://hub.docker.com/r/hoppscotch/hoppscotch-backend',
    technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The app row links to the official Hoppscotch backend image registry page.','source_urls',jsonb_build_array('https://hub.docker.com/r/hoppscotch/hoppscotch-backend','https://github.com/hoppscotch/hoppscotch/blob/main/docker-compose.yml'))
    ),
    updated_at=now()
where slug='hoppscotch-community-edition';

update public.self_host_apps a
set data_source_urls=(
      select array_agg(distinct source_url order by source_url)
      from unnest(coalesce(a.data_source_urls,'{}'::text[]) || v.urls) as sources(source_url)
    ),
    updated_at=now()
from (values
  ('affine-community-edition',ARRAY['https://github.com/toeverything/AFFiNE/blob/canary/LICENSE','https://github.com/toeverything/AFFiNE/blob/canary/packages/backend/server/LICENSE','https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml']::text[]),
  ('coolify',ARRAY['https://coolify.io/docs/start-with-self-hosted','https://coolify.io/privacy-policy','https://hub.docker.com/r/coollabsio/coolify','https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml']::text[]),
  ('memos',ARRAY['https://usememos.com/docs/getting-started','https://usememos.com/docs/deploy/docker','https://usememos.com/docs/configuration/storage','https://github.com/usememos/memos/blob/main/scripts/compose.yaml']::text[]),
  ('nocodb',ARRAY['https://product-feed.nocodb.com/docs/self-hosting','https://nocodb.com/docs/self-hosting/installation/quickstart','https://nocodb.com/docs/self-hosting/installation/single-server']::text[]),
  ('penpot',ARRAY['https://penpot.app/about','https://penpot.app/','https://help.penpot.app/technical-guide/getting-started/docker/','https://help.penpot.app/technical-guide/getting-started/recommended-settings/','https://help.penpot.app/technical-guide/configuration/','https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml']::text[]),
  ('pocketbase',ARRAY['https://pocketbase.io/docs/','https://pocketbase.io/docs/going-to-production/','https://github.com/muchobien/pocketbase/pkgs/container/pocketbase']::text[]),
  ('vaultwarden',ARRAY['https://github.com/dani-garcia/vaultwarden/blob/main/README.md','https://github.com/dani-garcia/vaultwarden/blob/main/.env.template','https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose']::text[]),
  ('localsend',ARRAY['https://localsend.org/','https://github.com/localsend/localsend/blob/main/README.md']::text[]),
  ('world-monitor',ARRAY['https://github.com/koala73/worldmonitor/blob/main/SELF_HOSTING.md','https://github.com/koala73/worldmonitor/blob/main/docker-compose.yml']::text[]),
  ('hoppscotch-community-edition',ARRAY['https://docs.hoppscotch.io/documentation/self-host/community-edition/install-and-build','https://hub.docker.com/r/hoppscotch/hoppscotch-backend','https://raw.githubusercontent.com/hoppscotch/hoppscotch/HEAD/docker-compose.yml']::text[])
) as v(slug,urls)
where a.slug=v.slug;

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(
        case
          when option->>'method'='docker' then
            jsonb_set(jsonb_set(jsonb_set(option,'{url}','"https://hub.docker.com/r/coollabsio/coolify"'::jsonb),'{image}','"coollabsio/coolify:latest"'::jsonb),'{source_url}','"https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml"'::jsonb)
          when option->>'method'='compose' then
            jsonb_set(jsonb_set(jsonb_set(option,'{url}','"https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml"'::jsonb),'{image}','"coollabsio/coolify:latest"'::jsonb),'{source_url}','"https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml"'::jsonb)
          else option
        end order by coalesce((option->>'sort_order')::integer,1000)
      )
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as item(option)
    ),
    docker_urls=ARRAY['https://hub.docker.com/r/coollabsio/coolify']::text[],
    docker_images=ARRAY['coollabsio/coolify:latest']::text[],
    compose_urls=ARRAY['https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml']::text[],
    source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://coolify.io/docs/start-with-self-hosted','https://coolify.io/privacy-policy','https://hub.docker.com/r/coollabsio/coolify','https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml']::text[]) u),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='coolify');

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(
        case
          when option->>'method' in ('docker','compose') then
            jsonb_set(jsonb_set(jsonb_set(option,'{url}',case when option->>'method'='docker' then '"https://hub.docker.com/r/neosmemo/memos"'::jsonb else '"https://github.com/usememos/memos/blob/main/scripts/compose.yaml"'::jsonb end),'{image}','"neosmemo/memos:stable"'::jsonb),'{source_url}','"https://usememos.com/docs/deploy/docker"'::jsonb)
          else option
        end order by coalesce((option->>'sort_order')::integer,1000)
      )
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as item(option)
    ),
    docker_urls=ARRAY['https://hub.docker.com/r/neosmemo/memos']::text[],
    docker_images=ARRAY['neosmemo/memos:stable']::text[],
    compose_urls=ARRAY['https://github.com/usememos/memos/blob/main/scripts/compose.yaml']::text[],
    source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://usememos.com/docs/getting-started','https://usememos.com/docs/deploy/docker','https://usememos.com/docs/configuration/storage','https://github.com/usememos/memos/blob/main/scripts/compose.yaml']::text[]) u),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='memos');

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(option order by coalesce((option->>'sort_order')::integer,1000))
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'method','compose','label','Docker Compose','url','https://nocodb.com/docs/self-hosting/installation/quickstart','image',null,'support_level','official','source_url','https://product-feed.nocodb.com/docs/self-hosting/installation/quickstart','note','The official quickstart generates and starts the Compose stack.','sort_order',20
      ))) as item(option)
    ),
    compose_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.compose_urls,'{}'::text[]) || ARRAY['https://nocodb.com/docs/self-hosting/installation/quickstart']::text[]) u),
    source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://product-feed.nocodb.com/docs/self-hosting/installation/quickstart']::text[]) u),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='nocodb');

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(
        case
          when option->>'method'='docker' then
            jsonb_set(jsonb_set(jsonb_set(option,'{url}','"https://hub.docker.com/r/penpotapp/frontend"'::jsonb),'{image}','"penpotapp/frontend:latest"'::jsonb),'{source_url}','"https://help.penpot.app/technical-guide/getting-started/docker/"'::jsonb)
          when option->>'method'='compose' and option->>'support_level'='official' then
            jsonb_set(jsonb_set(jsonb_set(option,'{url}','"https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml"'::jsonb),'{image}','"penpotapp/frontend:latest"'::jsonb),'{source_url}','"https://help.penpot.app/technical-guide/getting-started/docker/"'::jsonb)
          else option
        end order by coalesce((option->>'sort_order')::integer,1000)
      )
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as item(option)
    ),
    docker_urls=ARRAY['https://hub.docker.com/r/penpotapp/frontend']::text[],
    docker_images=ARRAY['penpotapp/frontend:latest']::text[],
    compose_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.compose_urls,'{}'::text[]) || ARRAY['https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml']::text[]) u),
    source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://help.penpot.app/technical-guide/getting-started/docker/','https://raw.githubusercontent.com/penpot/penpot/main/docker/images/docker-compose.yaml']::text[]) u),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='penpot');

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(
        case when option->>'method'='docker' then
          jsonb_set(jsonb_set(jsonb_set(option,'{url}','"https://github.com/muchobien/pocketbase/pkgs/container/pocketbase"'::jsonb),'{image}','"ghcr.io/muchobien/pocketbase:0.40.4"'::jsonb),'{source_url}','"https://pocketbase.io/docs/going-to-production/"'::jsonb)
        else option end order by coalesce((option->>'sort_order')::integer,1000)
      )
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as item(option)
    ),
    docker_urls=ARRAY['https://github.com/muchobien/pocketbase/pkgs/container/pocketbase']::text[],
    docker_images=ARRAY['ghcr.io/muchobien/pocketbase:0.40.4']::text[],
    source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://pocketbase.io/docs/going-to-production/','https://github.com/muchobien/pocketbase/pkgs/container/pocketbase']::text[]) u),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='pocketbase');

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(option order by coalesce((option->>'sort_order')::integer,1000))
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb) || jsonb_build_array(jsonb_build_object(
        'method','compose','label','Docker Compose','url','https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose','image','vaultwarden/server:1.37.2@sha256:094b5689ed81549bd293418395c7cf495ae9d960fc2d4928cef2083ef913d912','support_level','official','source_url','https://github.com/dani-garcia/vaultwarden/blob/main/README.md','note',null,'sort_order',20
      ))) as item(option)
    ),
    compose_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.compose_urls,'{}'::text[]) || ARRAY['https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose']::text[]) u),
    source_urls=(select array_agg(distinct u order by u) from unnest(coalesce(i.source_urls,'{}'::text[]) || ARRAY['https://github.com/dani-garcia/vaultwarden/blob/main/README.md','https://github.com/dani-garcia/vaultwarden/wiki/Using-Docker-Compose']::text[]) u),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='vaultwarden');

update public.self_host_app_install_options i
set options=(
      select jsonb_agg(
        case when option->>'method'='docker' then
          jsonb_set(jsonb_set(option,'{url}','"https://hub.docker.com/r/penpotapp/frontend"'::jsonb),'{image}','"penpotapp/frontend:latest"'::jsonb)
        else option end order by coalesce((option->>'sort_order')::integer,1000)
      )
      from jsonb_array_elements(coalesce(i.options,'[]'::jsonb)) as item(option)
    ),
    checked_at=now(),updated_at=now()
where i.app_id=(select id from public.self_host_apps where slug='penpot');

delete from public.self_host_app_category_links l
using public.self_host_apps a, public.self_host_app_categories c
where l.app_id=a.id and l.category_id=c.id and a.slug='affine-community-edition' and c.slug='security-privacy';
delete from public.self_host_app_category_links l
using public.self_host_apps a, public.self_host_app_categories c
where l.app_id=a.id and l.category_id=c.id and a.slug='nocodb' and c.slug='documents-pdfs';
delete from public.self_host_app_category_links l
using public.self_host_apps a, public.self_host_app_categories c
where l.app_id=a.id and l.category_id=c.id and a.slug='penpot' and c.slug='system-admin-hosting';
insert into public.self_host_app_category_links (app_id,category_id)
select a.id,c.id from public.self_host_apps a cross join public.self_host_app_categories c
where a.slug='penpot' and c.slug='design-creative'
on conflict (app_id,category_id) do nothing;
delete from public.self_host_app_category_links l
using public.self_host_apps a, public.self_host_app_categories c
where l.app_id=a.id and l.category_id=c.id and a.slug='vaultwarden' and c.slug='developer-tools';

update public.self_host_app_resource_estimates r
set ram_estimate_min_mb=v.ram_min,
    ram_estimate_max_mb=v.ram_max,
    ram_estimate_kind=v.ram_kind,
    ram_estimate_confidence=v.ram_confidence,
    ram_estimate_basis=v.ram_basis,
    ram_source_urls=v.ram_sources,
    storage_estimate_min_gb=v.storage_min,
    storage_estimate_max_gb=v.storage_max,
    storage_estimate_kind=v.storage_kind,
    storage_estimate_confidence=v.storage_confidence,
    storage_estimate_basis=v.storage_basis,
    storage_source_urls=v.storage_sources,
    checked_at=now(),updated_at=now()
from public.self_host_apps a
join (values
  ('affine-community-edition',2048::numeric,8192::numeric,'estimated'::text,'medium'::text,'Official self-host Compose runs AFFiNE, PostgreSQL with pgvector, and Redis; memory rises with editors and workspace size.'::text,ARRAY['https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml']::text[],10::numeric,100::numeric,'estimated'::text,'medium'::text,'The official stack persists PostgreSQL and workspace files; document attachments and retained versions drive growth.'::text,ARRAY['https://github.com/toeverything/AFFiNE/blob/canary/.docker/selfhost/compose.yml']::text[]),
  ('coolify',2048,8192,'estimated','medium','Coolify publishes 2 GB RAM as its minimum; memory also depends on its database, cache, builds, and deployed workloads.',ARRAY['https://coolify.io/docs/start-with-self-hosted','https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml']::text[],20,100,'estimated','medium','Coolify publishes 10 GB free disk as its minimum; images, build layers, deployed data, and backups need additional space.',ARRAY['https://coolify.io/docs/start-with-self-hosted','https://github.com/coollabsio/coolify/blob/main/docker-compose.prod.yml']::text[]),
  ('memos',128,512,'estimated','medium','The official default is one Memos web server with SQLite; concurrency and external database use can raise memory needs.',ARRAY['https://usememos.com/docs/getting-started','https://usememos.com/docs/deploy/docker']::text[],1,20,'estimated','medium','The official Docker setup persists the Memos data directory; notes, local attachments, and backups determine growth.',ARRAY['https://usememos.com/docs/getting-started','https://usememos.com/docs/configuration/storage']::text[]),
  ('nocodb',2048,8192,'derived','high','NocoDB official self-host guide gives 2 GB minimum and 8 GB recommended RAM.',ARRAY['https://product-feed.nocodb.com/docs/self-hosting']::text[],10,50,'derived','high','NocoDB official self-host guide gives 10 GB minimum and 50 GB or more recommended disk.',ARRAY['https://product-feed.nocodb.com/docs/self-hosting']::text[]),
  ('penpot',4096,16384,'estimated','medium','Penpot official guide says 4 CPUs and 16 GB RAM can support thousands of users; this range scales down for a small team.',ARRAY['https://help.penpot.app/technical-guide/getting-started/recommended-settings/','https://help.penpot.app/technical-guide/getting-started/docker/']::text[],50,100,'derived','high','Penpot recommends an initial 50 to 100 GB database for up to 10 editors; uploaded design assets use persistent storage too.',ARRAY['https://help.penpot.app/technical-guide/getting-started/recommended-settings/','https://help.penpot.app/technical-guide/getting-started/docker/']::text[]),
  ('pocketbase',128,512,'estimated','medium','PocketBase is a small standalone binary with embedded SQLite; active requests and realtime subscriptions drive memory use.',ARRAY['https://pocketbase.io/docs/','https://pocketbase.io/docs/going-to-production/']::text[],1,20,'estimated','medium','PocketBase keeps its SQLite database and uploaded files in pb_data; record count and file uploads drive growth.',ARRAY['https://pocketbase.io/docs/','https://pocketbase.io/docs/going-to-production/']::text[]),
  ('prometheus',1024,4096,'estimated','low','A small single-node TSDB is estimated at 1 to 4 GB; the in-memory head and active series affect RAM use.',ARRAY['https://prometheus.io/docs/prometheus/latest/storage/','https://prometheus.io/docs/prometheus/latest/installation/']::text[],2,20,'derived','medium','For a small scrape workload, estimate 15-day default retention at hundreds to a few thousand samples per second using the official 1 to 2 bytes per sample formula, with WAL and compaction headroom.',ARRAY['https://prometheus.io/docs/prometheus/latest/storage/','https://prometheus.io/docs/prometheus/latest/installation/']::text[]),
  ('vaultwarden',128,512,'estimated','medium','The official container runs one Vaultwarden service with embedded SQLite by default; account count and concurrent requests drive memory use.',ARRAY['https://github.com/dani-garcia/vaultwarden/blob/main/README.md','https://github.com/dani-garcia/vaultwarden/blob/main/.env.template']::text[],1,20,'estimated','medium','The official container persists its /data directory; account count, attachments, and backups determine storage growth.',ARRAY['https://github.com/dani-garcia/vaultwarden/blob/main/README.md','https://github.com/dani-garcia/vaultwarden/blob/main/.env.template']::text[])
) as v(slug,ram_min,ram_max,ram_kind,ram_confidence,ram_basis,ram_sources,storage_min,storage_max,storage_kind,storage_confidence,storage_basis,storage_sources) on a.slug=v.slug
where r.app_id=a.id;

commit;
