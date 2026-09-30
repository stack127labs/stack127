begin;

do $migration$
declare
  v_app_id uuid;
  current_categories text[];
  current_options jsonb;
  estimate_row public.self_host_app_resource_estimates;
  affected integer;
  expected_options constant jsonb := '[
    {"url":"https://hub.docker.com/r/cloakhq/cloakbrowser","note":"Community-maintained image. Verify the publisher before pulling.","image":"cloakhq/cloakbrowser:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/cloakhq/cloakbrowser","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml","support_level":"community"}
  ]'::jsonb;
  new_options constant jsonb := '[
    {"url":"https://hub.docker.com/r/cloakhq/cloakbrowser","note":null,"image":"cloakhq/cloakbrowser:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/CloakHQ/CloakBrowser/blob/main/README.md","support_level":"official"},
    {"url":"https://pypi.org/project/cloakbrowser/","note":null,"image":null,"label":"Python package","method":"package","sort_order":20,"source_url":"https://github.com/CloakHQ/CloakBrowser/blob/main/README.md#install","support_level":"official"},
    {"url":"https://www.npmjs.com/package/cloakbrowser","note":null,"image":null,"label":"npm package","method":"package","sort_order":21,"source_url":"https://github.com/CloakHQ/CloakBrowser/blob/main/README.md#install","support_level":"official"},
    {"url":"https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml","note":"Community template for the official Docker image.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml","support_level":"community"}
  ]'::jsonb;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug = 'cloakbrowser'
    and a.published is true
    and a.self_hosting_status = 'self_hostable'
    and to_jsonb(a) @> '{
      "summary":"Stealth Chromium browser with 58 source-level C++ fingerprint patches, Runs as a CDP (Chrome DevTools Protocol) server with Xvfb headed mode for maximum.",
      "website_url":null,
      "source_code_url":"https://github.com/cloakhq/cloakbrowser",
      "docs_url":"https://github.com/CloakHQ/cloakbrowser/issues",
      "install_docs_url":"https://github.com/CloakHQ/cloakbrowser/issues",
      "license":"No license file declared (all rights reserved by default)",
      "license_spdx_id":"MIT",
      "license_type":"permissive",
      "source_model":"source_available",
      "publisher_name":"cloakhq",
      "publisher_type":"community",
      "publisher_url":"https://github.com/cloakhq",
      "pricing_model":"unknown",
      "docker_support":"community",
      "docker_url":"https://hub.docker.com/r/cloakhq/cloakbrowser",
      "docker_image":"cloakhq/cloakbrowser:latest",
      "compose_support":false,
      "compose_url":null,
      "requires_database":null,
      "database_types":[],
      "persistent_storage":null,
      "storage_profile":"unknown",
      "deployment_methods":["docker","unraid"],
      "surfaces":["web"]
    }'::jsonb
  for update;
  if v_app_id is null then raise exception 'cloakbrowser app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[])
    into current_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id = l.category_id
  where l.app_id = v_app_id;
  if current_categories is distinct from array['ai-ml','databases','identity-access']::text[] then
    raise exception 'cloakbrowser categories changed since review';
  end if;

  select io.options into current_options
  from public.self_host_app_install_options io
  where io.app_id = v_app_id
  for update;
  if current_options is distinct from expected_options then raise exception 'cloakbrowser install options changed since review'; end if;

  select e.* into estimate_row
  from public.self_host_app_resource_estimates e
  where e.app_id = v_app_id
  for update;
  if not found or not (to_jsonb(estimate_row) @> '{
    "ram_estimate_min_mb":2048,
    "ram_estimate_max_mb":8192,
    "ram_estimate_basis":"Small single-node service; data volume and request load vary.",
    "storage_estimate_min_gb":5,
    "storage_estimate_max_gb":100,
    "storage_estimate_basis":"Small single-node service; data volume and request load vary."
  }'::jsonb) then
    raise exception 'cloakbrowser resource estimates changed since review';
  end if;

  update public.self_host_apps a set
    summary = 'Browser automation runtime built around a fingerprint-modified Chromium binary, with Playwright, Puppeteer and Selenium support.',
    website_url = 'https://cloakbrowser.dev',
    docs_url = 'https://github.com/CloakHQ/CloakBrowser/blob/main/README.md',
    install_docs_url = 'https://github.com/CloakHQ/CloakBrowser/blob/main/README.md#install',
    license = 'MIT wrapper code; proprietary browser binary',
    license_spdx_id = null,
    license_type = 'mixed',
    source_model = 'source_available',
    publisher_name = 'CloakHQ',
    publisher_type = 'company',
    publisher_url = 'https://cloakbrowser.dev',
    pricing_model = 'freemium',
    docker_support = 'official',
    docker_url = 'https://hub.docker.com/r/cloakhq/cloakbrowser',
    docker_image = 'cloakhq/cloakbrowser:latest',
    compose_support = false,
    compose_url = null,
    requires_database = false,
    database_types = '{}',
    persistent_storage = true,
    storage_profile = 'depends',
    deployment_methods = array['docker','package','unraid']::text[],
    surfaces = array['api','cli']::text[],
    data_source_urls = array[
      'https://cloakbrowser.dev',
      'https://github.com/CloakHQ/CloakBrowser',
      'https://github.com/CloakHQ/CloakBrowser/blob/main/LICENSE',
      'https://github.com/CloakHQ/CloakBrowser/blob/main/BINARY-LICENSE.md',
      'https://github.com/CloakHQ/CloakBrowser/blob/main/README.md',
      'https://github.com/CloakHQ/CloakBrowser/blob/main/Dockerfile',
      'https://hub.docker.com/r/cloakhq/cloakbrowser',
      'https://pypi.org/project/cloakbrowser/',
      'https://www.npmjs.com/package/cloakbrowser',
      'https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml'
    ],
    summary_source = 'https://github.com/CloakHQ/CloakBrowser/blob/main/README.md',
    summary_confidence = 'high',
    data_confidence = 'high',
    technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || '{
      "docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official website and README document the cloakhq/cloakbrowser Docker image.","source_urls":["https://cloakbrowser.dev","https://github.com/CloakHQ/CloakBrowser/blob/main/README.md","https://hub.docker.com/r/cloakhq/cloakbrowser"]},
      "compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The project provides a Docker image and Dockerfile; its setup instructions do not include Compose deployment.","source_urls":["https://github.com/CloakHQ/CloakBrowser/blob/main/README.md","https://github.com/CloakHQ/CloakBrowser/blob/main/Dockerfile"]},
      "database":{"status":"not_published","checked_at":"2026-09-28","confidence":"medium","note":"The browser runtime does not need a separate database service.","source_urls":["https://github.com/CloakHQ/CloakBrowser/blob/main/README.md"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project supports persistent browser profiles for cookies and local storage.","source_urls":["https://github.com/CloakHQ/CloakBrowser/blob/main/README.md","https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml"]},
      "ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate is based on Chromium sessions; active tabs and browser concurrency drive use.","source_urls":["https://github.com/CloakHQ/CloakBrowser/blob/main/Dockerfile","https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml"]},
      "storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers the downloaded browser binary and persistent browser profiles.","source_urls":["https://github.com/CloakHQ/CloakBrowser/blob/main/README.md","https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml"]},
      "docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project website links its Docker Hub image.","source_urls":["https://cloakbrowser.dev","https://hub.docker.com/r/cloakhq/cloakbrowser"]}
    }'::jsonb,
    technical_facts_checked_at = now(),
    updated_at = now()
  where a.id = v_app_id;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'cloakbrowser app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb = 512,
    ram_estimate_max_mb = 2048,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = 'low',
    ram_estimate_basis = 'Chromium session memory; active tabs and browser concurrency drive use.',
    ram_source_urls = array['https://github.com/CloakHQ/CloakBrowser/blob/main/Dockerfile','https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml'],
    storage_estimate_min_gb = 1,
    storage_estimate_max_gb = 10,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = 'low',
    storage_estimate_basis = 'Browser binary and profile data; storage grows with saved sessions.',
    storage_source_urls = array['https://github.com/CloakHQ/CloakBrowser/blob/main/README.md','https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml'],
    checked_at = now(),
    updated_at = now()
  where e.app_id = v_app_id;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'cloakbrowser resource update failed'; end if;

  update public.self_host_app_install_options io set
    options = new_options,
    docker_urls = array['https://hub.docker.com/r/cloakhq/cloakbrowser'],
    docker_images = array['cloakhq/cloakbrowser:latest'],
    compose_urls = '{}',
    package_urls = array['https://pypi.org/project/cloakbrowser/','https://www.npmjs.com/package/cloakbrowser'],
    unraid_urls = array['https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml'],
    source_urls = array['https://github.com/CloakHQ/CloakBrowser/blob/main/README.md','https://github.com/CloakHQ/CloakBrowser/blob/main/README.md#install','https://raw.githubusercontent.com/hsiang-han/unraid_templates/main/templates/cloakbrowser.xml'],
    checked_at = now(),
    updated_at = now()
  where io.app_id = v_app_id and io.options = expected_options;
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'cloakbrowser install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id = v_app_id;
  insert into public.self_host_app_category_links(app_id, category_id)
  select v_app_id, c.id
  from public.self_host_app_categories c
  where c.slug in ('developer-tools','security-privacy');
  get diagnostics affected = row_count;
  if affected <> 2 then raise exception 'cloakbrowser category update failed'; end if;
end
$migration$;

commit;
