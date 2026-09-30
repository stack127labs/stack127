begin;

do $migration$
declare
  v_app_id uuid;
  v_current_options jsonb;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_app_id
  from public.self_host_apps a
  where a.slug='ffmpeg-nvidia'
    and a.published is true
    and a.self_hosting_status='self_hostable'
    and a.name='ffmpeg-nvidia'
    and a.summary='FFmpeg image with NVIDIA hardware acceleration for GPU-assisted video encoding and transcoding.'
    and a.source_code_url='https://github.com/jrottenberg/ffmpeg'
    and a.license='No license file declared (all rights reserved by default)'
    and a.license_spdx_id='Apache-2.0'
    and a.source_model='source_available'
    and a.docker_image='jrottenberg/ffmpeg:4.2-nvidia'
    and a.docker_support='community'
    and a.compose_support is false
    and a.requires_database is null
    and a.persistent_storage is null
  for update;
  if v_app_id is null then raise exception 'ffmpeg-nvidia app record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l
  join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_app_id;
  if v_categories is distinct from array['system-admin-hosting']::text[] then
    raise exception 'ffmpeg-nvidia categories changed since review';
  end if;

  select io.options into v_current_options
  from public.self_host_app_install_options io
  where io.app_id=v_app_id
  for update;
  if v_current_options is distinct from '[
    {"url":"https://hub.docker.com/r/jrottenberg/ffmpeg","note":"Community-maintained image. Verify the publisher before pulling.","image":"jrottenberg/ffmpeg:4.2-nvidia","label":"Docker image","method":"docker","sort_order":10,"source_url":"https://hub.docker.com/r/jrottenberg/ffmpeg","support_level":"community"},
    {"url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml","note":"Listed in the Unraid Community Applications catalog; verify the template publisher before installing.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml","support_level":"community"}
  ]'::jsonb then
    raise exception 'ffmpeg-nvidia install options changed since review';
  end if;

  update public.self_host_apps a set
    name='FFmpeg (NVIDIA)',
    summary='FFmpeg (NVIDIA) runs the command-line media transcoder in Docker with NVIDIA hardware encoding and decoding.',
    website_url='https://ffmpeg.org/',
    source_code_url='https://github.com/FFmpeg/FFmpeg',
    source_code_host='github',
    github_owner='FFmpeg', github_repo='FFmpeg', github_full_name='FFmpeg/FFmpeg', source_full_name='FFmpeg/FFmpeg',
    github_project_id=null, github_repo_id=null, github_node_id=null, source_repo_id=null,
    docs_url='https://www.ffmpeg.org/documentation.html',
    install_docs_url='https://github.com/jrottenberg/ffmpeg/blob/main/README.md',
    docker_url='https://hub.docker.com/r/jrottenberg/ffmpeg/tags',
    docker_image='jrottenberg/ffmpeg:9-nvidia',
    license='FFmpeg core: LGPL-2.1-or-later. Optional GPL parts and bundled libraries have their own licenses.',
    license_type='copyleft', license_spdx_id='LGPL-2.1', source_model='open_source',
    publisher_name='jrottenberg', publisher_type='community', publisher_url='https://github.com/jrottenberg',
    pricing_model='free', maintenance_status='active', docker_support='community',
    compose_support=null, compose_url=null,
    requires_database=false, database_types='{}', persistent_storage=true, storage_profile='depends',
    ram_min_mb=null, storage_min_gb=null, resource_requirement_kind='unknown',
    deployment_methods=array['docker','unraid']::text[], surfaces=array['cli']::text[],
    summary_source='https://github.com/jrottenberg/ffmpeg/blob/main/README.md', summary_confidence='high',
    release_url='https://github.com/FFmpeg/FFmpeg/releases', release_version=null, release_published_at=null,
    technical_fact_status=(coalesce(a.technical_fact_status,'{}'::jsonb) || '{
      "license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"FFmpeg core uses LGPL-2.1-or-later by default; optional GPL components and bundled libraries have their own terms.","source_urls":["https://github.com/FFmpeg/FFmpeg/blob/master/LICENSE.md","https://github.com/jrottenberg/ffmpeg/blob/main/README.md"]},
      "ram":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"The project gives no RAM minimum; the range is estimated for one transcode job.","source_urls":["https://github.com/jrottenberg/ffmpeg/blob/main/README.md"]},
      "storage":{"status":"not_published","checked_at":"2026-09-29","confidence":"low","note":"Storage depends on input and output media size; the range is estimated for a small media set.","source_urls":["https://ffmpeg.org/ffmpeg.html","https://github.com/jrottenberg/ffmpeg/blob/main/README.md"]},
      "docker":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The image builder documents Docker images and NVIDIA-enabled image variants.","source_urls":["https://github.com/jrottenberg/ffmpeg/blob/main/README.md","https://hub.docker.com/r/jrottenberg/ffmpeg/tags"]},
      "docker_image":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"Docker Hub currently lists the 9-nvidia image tag.","source_urls":["https://hub.docker.com/r/jrottenberg/ffmpeg/tags"]},
      "database":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The FFmpeg command-line tool does not require a separate database service.","source_urls":["https://ffmpeg.org/ffmpeg.html"]},
      "persistent_storage":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"FFmpeg reads input media and writes encoded output files; retain those files on mounted or host storage.","source_urls":["https://ffmpeg.org/ffmpeg.html","https://github.com/jrottenberg/ffmpeg/blob/main/README.md"]},
      "surfaces":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"FFmpeg is a command-line tool.","source_urls":["https://www.ffmpeg.org/documentation.html"]}
    }'::jsonb),
    data_source_urls=(
      select array_agg(distinct u order by u)
      from unnest(coalesce(a.data_source_urls,'{}'::text[]) || array[
        'https://ffmpeg.org/',
        'https://www.ffmpeg.org/documentation.html',
        'https://ffmpeg.org/ffmpeg.html',
        'https://github.com/FFmpeg/FFmpeg',
        'https://github.com/FFmpeg/FFmpeg/blob/master/LICENSE.md',
        'https://github.com/jrottenberg/ffmpeg',
        'https://github.com/jrottenberg/ffmpeg/blob/main/README.md',
        'https://hub.docker.com/r/jrottenberg/ffmpeg',
        'https://hub.docker.com/r/jrottenberg/ffmpeg/tags',
        'https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml'
      ]::text[]) as urls(u)
    ),
    data_checked_at=now(), data_confidence='high', technical_facts_checked_at=now(), updated_at=now()
  where a.id=v_app_id;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'ffmpeg-nvidia app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024, ram_estimate_max_mb=4096, ram_estimate_kind='estimated', ram_estimate_confidence='low',
    ram_estimate_basis='Estimate for one transcode job; resolution, filters, concurrent jobs, and GPU processing change memory use.',
    ram_source_urls=array['https://github.com/jrottenberg/ffmpeg/blob/main/README.md','https://ffmpeg.org/ffmpeg.html'],
    storage_estimate_min_gb=10, storage_estimate_max_gb=100, storage_estimate_kind='estimated', storage_estimate_confidence='low',
    storage_estimate_basis='FFmpeg reads input files and writes output files; 10 to 100 GB is an estimate for a small set of source and encoded media files.',
    storage_source_urls=array['https://ffmpeg.org/ffmpeg.html','https://github.com/jrottenberg/ffmpeg/blob/main/README.md'],
    checked_at=now(), updated_at=now()
  where e.app_id=v_app_id
    and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'ffmpeg-nvidia resource estimates changed since review'; end if;

  update public.self_host_app_install_options io set
    options='[
      {"url":"https://hub.docker.com/r/jrottenberg/ffmpeg/tags","note":"Community image builder; Docker Hub currently lists the 9-nvidia tag. An NVIDIA-enabled host is required.","image":"jrottenberg/ffmpeg:9-nvidia","label":"NVIDIA Docker image","method":"docker","sort_order":10,"source_url":"https://github.com/jrottenberg/ffmpeg/blob/main/README.md","support_level":"community"},
      {"url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml","note":"Community Unraid template; confirm its image tag and GPU settings before use.","image":null,"label":"Unraid catalog","method":"unraid","sort_order":35,"source_url":"https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml","support_level":"community"}
    ]'::jsonb,
    docker_urls=array['https://hub.docker.com/r/jrottenberg/ffmpeg/tags'],
    docker_images=array['jrottenberg/ffmpeg:9-nvidia'],
    compose_urls='{}',
    unraid_urls=array['https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml'],
    source_urls=array[
      'https://github.com/jrottenberg/ffmpeg/blob/main/README.md',
      'https://hub.docker.com/r/jrottenberg/ffmpeg/tags',
      'https://raw.githubusercontent.com/qubex22/unraid-templates/main/ffmpeg-nvidia/ffmpeg-nvidia.xml'
    ],
    checked_at=now(), updated_at=now()
  where io.app_id=v_app_id and io.options=v_current_options;
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'ffmpeg-nvidia install option update failed'; end if;

  delete from public.self_host_app_category_links where app_id=v_app_id;
  insert into public.self_host_app_category_links(app_id,category_id)
  select v_app_id,c.id from public.self_host_app_categories c where c.slug='media-servers';
  get diagnostics v_affected=row_count;
  if v_affected<>1 then raise exception 'ffmpeg-nvidia category update failed'; end if;
end
$migration$;

commit;
