-- Correct the Locust record from the project's current official documentation.
-- Resource ranges are estimates for one modest, single-node test.
do $$
declare
  app_record public.self_host_apps%rowtype;
  category_id uuid;
  affected integer;
begin
  select * into app_record
  from public.self_host_apps
  where slug = 'locust'
  for update;

  if not found then
    raise exception 'Locust record is missing';
  end if;

  if not (
    (app_record.source_model = 'closed_source' and app_record.source_code_url is null and app_record.license is null)
    or
    (app_record.source_model = 'open_source' and app_record.source_code_url = 'https://github.com/locustio/locust' and app_record.license = 'MIT')
  ) then
    raise exception 'Locust record changed since review; inspect it before applying this correction';
  end if;

  update public.self_host_apps
  set name = 'Locust',
      summary = 'Creates Python load tests that simulate user behavior against websites and other services.',
      website_url = 'https://locust.io/',
      source_code_url = 'https://github.com/locustio/locust',
      source_code_host = 'github',
      docs_url = 'https://docs.locust.io/en/stable/',
      install_docs_url = 'https://docs.locust.io/en/stable/installation.html',
      docker_url = 'https://hub.docker.com/r/locustio/locust',
      docker_image = 'locustio/locust',
      docker_support = 'official',
      compose_support = true,
      compose_url = 'https://docs.locust.io/en/stable/running-in-docker.html',
      deployment_methods = array(
        select distinct method
        from unnest(coalesce(deployment_methods, '{}'::text[]) || array['docker', 'compose', 'native']::text[]) as methods(method)
        order by method
      ),
      surfaces = array['cli', 'web']::text[],
      license = 'MIT',
      license_type = 'permissive',
      license_spdx_id = 'MIT',
      source_model = 'open_source',
      pricing_model = 'free',
      data_source_urls = array(
        select distinct url
        from unnest(coalesce(data_source_urls, '{}'::text[]) || array[
          'https://docs.locust.io/en/stable/what-is-locust.html',
          'https://docs.locust.io/en/stable/installation.html',
          'https://docs.locust.io/en/stable/running-in-docker.html',
          'https://github.com/locustio/locust/blob/master/LICENSE',
          'https://hub.docker.com/r/locustio/locust'
        ]::text[]) as sources(url)
        order by url
      ),
      updated_at = now()
  where id = app_record.id;

  delete from public.self_host_app_category_links
  where app_id = app_record.id;

  select id into category_id
  from public.self_host_app_categories
  where slug = 'developer-tools';

  if category_id is null then
    raise exception 'Developer tools category is missing';
  end if;

  insert into public.self_host_app_category_links (app_id, category_id)
  values (app_record.id, category_id);

  insert into public.self_host_app_resource_estimates (
    app_id,
    ram_estimate_min_mb,
    ram_estimate_max_mb,
    ram_estimate_kind,
    ram_estimate_confidence,
    ram_estimate_basis,
    ram_source_urls,
    ram_note,
    storage_estimate_min_gb,
    storage_estimate_max_gb,
    storage_estimate_kind,
    storage_estimate_confidence,
    storage_estimate_basis,
    storage_source_urls,
    storage_note,
    checked_at
  )
  values (
    app_record.id,
    1024,
    4096,
    'estimated',
    'low',
    'Single-node load test with a modest user count; RAM rises with concurrent users and test behavior.',
    array['https://docs.locust.io/en/stable/what-is-locust.html', 'https://docs.locust.io/en/stable/running-in-docker.html'],
    'Small single-node test.',
    1,
    5,
    'estimated',
    'low',
    'Locust image, test scripts, and short result exports; excludes data stored by the test target.',
    array['https://docs.locust.io/en/stable/installation.html', 'https://docs.locust.io/en/stable/running-in-docker.html'],
    'Small test files and short result exports.',
    now()
  )
  on conflict (app_id) do update set
    ram_estimate_min_mb = excluded.ram_estimate_min_mb,
    ram_estimate_max_mb = excluded.ram_estimate_max_mb,
    ram_estimate_kind = excluded.ram_estimate_kind,
    ram_estimate_confidence = excluded.ram_estimate_confidence,
    ram_estimate_basis = excluded.ram_estimate_basis,
    ram_source_urls = excluded.ram_source_urls,
    ram_note = excluded.ram_note,
    storage_estimate_min_gb = excluded.storage_estimate_min_gb,
    storage_estimate_max_gb = excluded.storage_estimate_max_gb,
    storage_estimate_kind = excluded.storage_estimate_kind,
    storage_estimate_confidence = excluded.storage_estimate_confidence,
    storage_estimate_basis = excluded.storage_estimate_basis,
    storage_source_urls = excluded.storage_source_urls,
    storage_note = excluded.storage_note,
    checked_at = excluded.checked_at,
    updated_at = now();

  update public.self_host_app_install_options
  set docker_urls = array['https://hub.docker.com/r/locustio/locust'],
      docker_images = array['locustio/locust'],
      compose_urls = array['https://docs.locust.io/en/stable/running-in-docker.html'],
      native_urls = array['https://docs.locust.io/en/stable/installation.html'],
      options = (
        select coalesce(
          jsonb_agg(
            case
              when option->>'method' = 'docker' then option || jsonb_build_object(
                'support_level', 'official',
                'source_url', 'https://docs.locust.io/en/stable/running-in-docker.html',
                'note', null
              )
              else option
            end
            order by (option->>'sort_order')::integer
          ),
          '[]'::jsonb
        )
        from jsonb_array_elements(self_host_app_install_options.options) as entries(option)
        where option->>'method' not in ('compose', 'native')
      ) || jsonb_build_array(
        jsonb_build_object(
          'method', 'compose',
          'label', 'Docker Compose',
          'url', 'https://docs.locust.io/en/stable/running-in-docker.html',
          'image', 'locustio/locust',
          'support_level', 'official',
          'source_url', 'https://docs.locust.io/en/stable/running-in-docker.html',
          'note', null,
          'sort_order', 20
        ),
        jsonb_build_object(
          'method', 'native',
          'label', 'Python package',
          'url', 'https://docs.locust.io/en/stable/installation.html',
          'image', null,
          'support_level', 'official',
          'source_url', 'https://docs.locust.io/en/stable/installation.html',
          'note', null,
          'sort_order', 30
        )
      ),
      source_urls = array(
        select distinct url
        from unnest(coalesce(source_urls, '{}'::text[]) || array[
          'https://docs.locust.io/en/stable/running-in-docker.html',
          'https://docs.locust.io/en/stable/installation.html'
        ]::text[]) as sources(url)
        order by url
      ),
      checked_at = now(),
      updated_at = now()
  where app_id = app_record.id;

  get diagnostics affected = row_count;
  if affected <> 1 then
    raise exception 'Locust install options row is missing';
  end if;
end
$$;
