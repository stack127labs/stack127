begin;

do $migration$
declare
  app_rec record;
  v_app_id uuid;
  expected_categories text[];
  current_categories text[];
  current_options jsonb;
  estimate_row public.self_host_app_resource_estimates;
  app_patch public.self_host_apps;
  affected integer;
  batch constant jsonb := $batch$[
    {
      "slug":"geth-ethereum",
      "expected":{"summary":"Go implementation of the Ethereum execution client for running an Ethereum node.","website_url":null,"source_code_url":"https://github.com/ethereum/go-ethereum","docs_url":"https://github.com/ethereum/go-ethereum","install_docs_url":"https://github.com/ethereum/go-ethereum","license":"No license file declared (all rights reserved by default)","license_spdx_id":"LGPL-3.0","license_type":"copyleft","source_model":"source_available","docker_support":"community","docker_url":"https://hub.docker.com/r/ethereum/client-go/","docker_image":"ethereum/client-go","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["games"],
      "expected_options":[
        {"url":"https://hub.docker.com/r/ethereum/client-go/","note":"Community-maintained image. Verify the publisher before pulling.","image":"ethereum/client-go","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/ethereum/client-go/","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/zgorizzo69/unraid-templates/master/geth-ethereum/geth-ethereum.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/zgorizzo69/unraid-templates/master/geth-ethereum/geth-ethereum.xml","support_level":"community"}
      ],
      "categories":["developer-tools","system-admin-hosting"],
      "changes":{"name":"Go Ethereum (Geth)","summary":"Ethereum execution client for running a full node and serving JSON-RPC requests.","website_url":"https://geth.ethereum.org","docs_url":"https://geth.ethereum.org/docs/getting-started/installing-geth","install_docs_url":"https://geth.ethereum.org/docs/getting-started/installing-geth","license":"GPL-3.0 (Geth binaries); LGPL-3.0 (Go library)","license_spdx_id":null,"license_type":"mixed","source_model":"open_source","docker_support":"official","docker_url":"https://hub.docker.com/r/ethereum/client-go","docker_image":"ethereum/client-go","compose_support":false,"compose_url":null,"requires_database":false,"database_types":[],"persistent_storage":true,"storage_profile":"high","deployment_methods":["docker","unraid"],"surfaces":["api","cli"],"summary_source":"https://github.com/ethereum/go-ethereum#readme","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://geth.ethereum.org/docs/getting-started/installing-geth","https://geth.ethereum.org/docs/getting-started/hardware-requirements","https://github.com/ethereum/go-ethereum","https://github.com/ethereum/go-ethereum/blob/master/README.md","https://github.com/ethereum/go-ethereum/blob/master/COPYING","https://github.com/ethereum/go-ethereum/blob/master/COPYING.LESSER","https://hub.docker.com/r/ethereum/client-go","https://raw.githubusercontent.com/zgorizzo69/unraid-templates/master/geth-ethereum/geth-ethereum.xml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":1024,"ram_estimate_max_mb":8192,"ram_estimate_basis":"Small single-node service; active users and stored content vary.","storage_estimate_min_gb":10,"storage_estimate_max_gb":100,"storage_estimate_basis":"Small single-node service; active users and stored content vary."},
      "resource_estimate":{"ram_min_mb":8192,"ram_max_mb":16384,"ram_basis":"Standard full node; project lists 8 GB minimum and 16 GB recommended.","ram_source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md","https://geth.ethereum.org/docs/getting-started/hardware-requirements"],"storage_min_gb":2048,"storage_max_gb":4096,"storage_basis":"Standard full node; project recommends a 2–4 TB SSD.","storage_source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md","https://geth.ethereum.org/docs/getting-started/hardware-requirements"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project README provides a Docker command using ethereum/client-go.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md"]},"compose":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The project README documents Docker run instructions but no Compose setup.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The node stores blockchain data in its own persistent data directory and needs no separate database service.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md","https://geth.ethereum.org/docs/getting-started/hardware-requirements"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The project Docker example mounts a persistent directory for blockchain data.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md"]},"ram":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The project lists 8 GB minimum and 16 GB or more recommended for a node.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md"]},"storage":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The project recommends a 2–4 TB SSD; archive nodes need more storage.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md"]},"docker_image":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The official Docker example uses ethereum/client-go.","source_urls":["https://github.com/ethereum/go-ethereum/blob/master/README.md","https://hub.docker.com/r/ethereum/client-go"]}},
      "install_options":[
        {"url":"https://hub.docker.com/r/ethereum/client-go","note":null,"image":"ethereum/client-go","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/ethereum/go-ethereum/blob/master/README.md#docker-quick-start","support_level":"official"},
        {"url":"https://raw.githubusercontent.com/zgorizzo69/unraid-templates/master/geth-ethereum/geth-ethereum.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/zgorizzo69/unraid-templates/master/geth-ethereum/geth-ethereum.xml","support_level":"community"}
      ]
    },
    {
      "slug":"ralph",
      "expected":{"summary":"Autonomous coding loop that repeatedly runs an agent against a project task list.","website_url":null,"source_code_url":"https://github.com/snarktank/ralph","docs_url":"https://github.com/snarktank/ralph/issues","install_docs_url":"https://github.com/snarktank/ralph/issues","license":"No license file declared (all rights reserved by default)","license_spdx_id":"MIT","license_type":"permissive","source_model":"source_available","docker_support":"community","docker_url":"https://hub.docker.com/","docker_image":"snarktank/ralph:latest","compose_support":false,"compose_url":null,"requires_database":null,"database_types":[],"persistent_storage":null,"storage_profile":"unknown","deployment_methods":["docker","unraid"],"surfaces":["web"]},
      "expected_categories":["ai-ml","developer-tools"],
      "expected_options":[
        {"url":"https://hub.docker.com/","note":"Community-maintained image. Verify the publisher before pulling.","image":"snarktank/ralph:latest","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/","support_level":"community"},
        {"url":"https://raw.githubusercontent.com/Zeyso/ralph-multi/main/templates/ralph.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/Zeyso/ralph-multi/main/templates/ralph.xml","support_level":"community"}
      ],
      "categories":["ai-ml","developer-tools"],
      "changes":{"summary":"AI coding loop that runs an agent on project tasks and tracks progress in the code repository.","website_url":"https://github.com/snarktank/ralph","docs_url":"https://github.com/snarktank/ralph/blob/main/README.md","install_docs_url":"https://github.com/snarktank/ralph/blob/main/README.md#setup","license":"MIT License","license_spdx_id":"MIT","license_type":"permissive","source_model":"open_source","docker_support":"community","docker_url":null,"docker_image":null,"compose_support":true,"compose_url":"https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml","requires_database":false,"database_types":[],"persistent_storage":true,"storage_profile":"depends","deployment_methods":["compose","native"],"surfaces":["cli","web"],"summary_source":"https://github.com/snarktank/ralph/blob/main/README.md","summary_confidence":"high","data_confidence":"high"},
      "source_urls":["https://github.com/snarktank/ralph","https://github.com/snarktank/ralph/blob/main/LICENSE","https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi","https://github.com/Zeyso/ralph-multi/blob/main/LICENSE","https://github.com/Zeyso/ralph-multi/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/Dockerfile","https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml"],
      "resource_estimate_expected":{"ram_estimate_min_mb":2048,"ram_estimate_max_mb":8192,"ram_estimate_basis":"Typical small self-hosted instance; workload and stored data vary.","storage_estimate_min_gb":1,"storage_estimate_max_gb":20,"storage_estimate_basis":"Typical small self-hosted instance; workload and stored data vary."},
      "resource_estimate":{"ram_min_mb":512,"ram_max_mb":4096,"ram_basis":"Loop runs a local coding-agent CLI; agent and project workload drive use.","ram_source_urls":["https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/Dockerfile"],"storage_min_gb":1,"storage_max_gb":20,"storage_basis":"Stores project tasks and progress; codebase size drives use.","storage_source_urls":["https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml"]},
      "technical_updates":{"docker":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"A community fork supplies a Dockerfile for building the container locally.","source_urls":["https://github.com/Zeyso/ralph-multi/blob/main/Dockerfile","https://github.com/Zeyso/ralph-multi/blob/main/README.md"]},"compose":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"A community fork provides a Compose file that builds the container locally.","source_urls":["https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml"]},"database":{"status":"published","checked_at":"2026-09-28","confidence":"medium","note":"The loop stores its task and progress data in project files; it does not need a database service.","source_urls":["https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/README.md"]},"persistent_storage":{"status":"published","checked_at":"2026-09-28","confidence":"high","note":"The loop writes task and progress files in the project and the Compose setup mounts that project persistently.","source_urls":["https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml"]},"ram":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate includes a local coding-agent CLI and varies by agent and project.","source_urls":["https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/Dockerfile"]},"storage":{"status":"not_published","checked_at":"2026-09-28","confidence":"low","note":"The estimate covers project files and task progress; the repository size drives storage use.","source_urls":["https://github.com/snarktank/ralph/blob/main/README.md","https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml"]},"docker_image":{"status":"unchecked","checked_at":"2026-09-28","confidence":"low","note":"The community setup builds the image from its Dockerfile; no prebuilt registry image is linked by the verified setup instructions.","source_urls":["https://github.com/Zeyso/ralph-multi/blob/main/Dockerfile","https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml"]}},
      "install_options":[
        {"url":"https://github.com/snarktank/ralph/blob/main/README.md#setup","note":null,"image":null,"label":"Local setup","method":"native","sort_order":10,"source_url":"https://github.com/snarktank/ralph/blob/main/README.md#setup","support_level":"official"},
        {"url":"https://github.com/Zeyso/ralph-multi/blob/main/docker-compose.yml","note":"Community setup builds the container from source.","image":null,"label":"Docker Compose","method":"compose","sort_order":20,"source_url":"https://github.com/Zeyso/ralph-multi/blob/main/README.md#docker--unraid-deployment","support_level":"community"}
      ]
    }
  ]$batch$::jsonb;
begin
  for app_rec in
    select * from jsonb_to_recordset(batch) as x(
      slug text, expected jsonb, expected_categories jsonb, expected_options jsonb,
      categories jsonb, changes jsonb, source_urls jsonb,
      resource_estimate_expected jsonb, resource_estimate jsonb,
      technical_updates jsonb, install_options jsonb
    )
  loop
    select a.id into v_app_id
    from public.self_host_apps a
    where a.slug = app_rec.slug
      and a.published is true
      and a.self_hosting_status = 'self_hostable'
      and to_jsonb(a) @> app_rec.expected
    for update;
    if v_app_id is null then raise exception '% app record changed since review', app_rec.slug; end if;

    select coalesce(array_agg(c.slug order by c.slug), '{}'::text[])
      into current_categories
    from public.self_host_app_category_links l
    join public.self_host_app_categories c on c.id = l.category_id
    where l.app_id = v_app_id;
    expected_categories := array(select jsonb_array_elements_text(app_rec.expected_categories) order by 1);
    if current_categories is distinct from expected_categories then raise exception '% categories changed since review', app_rec.slug; end if;

    select io.options into current_options
    from public.self_host_app_install_options io
    where io.app_id = v_app_id
    for update;
    if current_options is distinct from app_rec.expected_options then raise exception '% install options changed since review', app_rec.slug; end if;

    select e.* into estimate_row
    from public.self_host_app_resource_estimates e
    where e.app_id = v_app_id
    for update;
    if not found or not (to_jsonb(estimate_row) @> app_rec.resource_estimate_expected) then
      raise exception '% resource estimates changed since review', app_rec.slug;
    end if;

    select * into app_patch from jsonb_populate_record(null::public.self_host_apps, app_rec.changes);
    update public.self_host_apps a set
      name = coalesce(app_patch.name, a.name), summary = app_patch.summary,
      website_url = app_patch.website_url, docs_url = app_patch.docs_url,
      install_docs_url = app_patch.install_docs_url, license = app_patch.license,
      license_spdx_id = app_patch.license_spdx_id, license_type = app_patch.license_type,
      source_model = app_patch.source_model, docker_support = app_patch.docker_support,
      docker_url = app_patch.docker_url, docker_image = app_patch.docker_image,
      compose_support = app_patch.compose_support, compose_url = app_patch.compose_url,
      requires_database = app_patch.requires_database, database_types = app_patch.database_types,
      persistent_storage = app_patch.persistent_storage, storage_profile = app_patch.storage_profile,
      deployment_methods = app_patch.deployment_methods, surfaces = app_patch.surfaces,
      data_source_urls = array(select jsonb_array_elements_text(app_rec.source_urls) order by 1),
      summary_source = app_patch.summary_source, summary_confidence = app_patch.summary_confidence,
      data_confidence = app_patch.data_confidence,
      technical_fact_status = coalesce(a.technical_fact_status, '{}'::jsonb) || app_rec.technical_updates,
      technical_facts_checked_at = now(), updated_at = now()
    where a.id = v_app_id;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception '% app update failed', app_rec.slug; end if;

    update public.self_host_app_resource_estimates e set
      ram_estimate_min_mb = (app_rec.resource_estimate ->> 'ram_min_mb')::numeric,
      ram_estimate_max_mb = (app_rec.resource_estimate ->> 'ram_max_mb')::numeric,
      ram_estimate_kind = 'estimated', ram_estimate_confidence = case when app_rec.slug = 'ralph' then 'low' else 'medium' end,
      ram_estimate_basis = app_rec.resource_estimate ->> 'ram_basis',
      ram_source_urls = array(select jsonb_array_elements_text(app_rec.resource_estimate -> 'ram_source_urls')),
      storage_estimate_min_gb = (app_rec.resource_estimate ->> 'storage_min_gb')::numeric,
      storage_estimate_max_gb = (app_rec.resource_estimate ->> 'storage_max_gb')::numeric,
      storage_estimate_kind = 'estimated', storage_estimate_confidence = case when app_rec.slug = 'ralph' then 'low' else 'medium' end,
      storage_estimate_basis = app_rec.resource_estimate ->> 'storage_basis',
      storage_source_urls = array(select jsonb_array_elements_text(app_rec.resource_estimate -> 'storage_source_urls')),
      checked_at = now(), updated_at = now()
    where e.app_id = v_app_id and to_jsonb(e) @> app_rec.resource_estimate_expected;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception '% resource update failed', app_rec.slug; end if;

    update public.self_host_app_install_options io set
      options = app_rec.install_options,
      docker_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'docker' order by (o ->> 'sort_order')::integer),
      docker_images = array(select distinct o ->> 'image' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'docker' and nullif(o ->> 'image', '') is not null order by 1),
      compose_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'compose' order by (o ->> 'sort_order')::integer),
      unraid_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'unraid' order by (o ->> 'sort_order')::integer),
      native_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'native' order by (o ->> 'sort_order')::integer),
      package_urls = array(select o ->> 'url' from jsonb_array_elements(app_rec.install_options) o where o ->> 'method' = 'package' order by (o ->> 'sort_order')::integer),
      source_urls = array(select distinct o ->> 'source_url' from jsonb_array_elements(app_rec.install_options) o where nullif(o ->> 'source_url', '') is not null order by 1),
      checked_at = now(), updated_at = now()
    where io.app_id = v_app_id and io.options = app_rec.expected_options;
    get diagnostics affected = row_count;
    if affected <> 1 then raise exception '% install option update failed', app_rec.slug; end if;

    delete from public.self_host_app_category_links where app_id = v_app_id;
    insert into public.self_host_app_category_links(app_id, category_id)
    select v_app_id, c.id from jsonb_array_elements_text(app_rec.categories) x(slug)
    join public.self_host_app_categories c on c.slug = x.slug;
    get diagnostics affected = row_count;
    if affected <> jsonb_array_length(app_rec.categories) then raise exception '% category update failed', app_rec.slug; end if;
  end loop;
end
$migration$;

commit;
