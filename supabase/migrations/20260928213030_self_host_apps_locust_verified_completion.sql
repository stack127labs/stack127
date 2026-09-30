begin;

do $migration$
declare
  v_locust uuid;
  v_categories text[];
  v_affected integer;
begin
  select a.id into v_locust
  from public.self_host_apps a
  where a.slug='locust' and a.published is true and a.self_hosting_status='self_hostable'
    and a.name='Locust'
    and a.source_code_url='https://github.com/locustio/locust'
    and a.source_model='open_source' and a.license='MIT' and a.license_spdx_id='MIT'
    and a.requires_database is null and a.database_types='{}'::text[] and a.persistent_storage is null
    and a.compose_support is true and a.github_project_id='388f2187-e84f-450e-8660-0903bec7de14'::uuid
    and a.github_owner is null and a.github_repo is null and a.github_full_name is null
    and a.release_url is null;
  if v_locust is null then raise exception 'Locust record changed since review'; end if;

  select coalesce(array_agg(c.slug order by c.slug), '{}'::text[]) into v_categories
  from public.self_host_app_category_links l join public.self_host_app_categories c on c.id=l.category_id
  where l.app_id=v_locust;
  if v_categories is distinct from array['developer-tools']::text[] then raise exception 'Locust categories changed since review'; end if;

  update public.self_host_apps a set
    github_owner='locustio',github_repo='locust',github_full_name='locustio/locust',source_full_name='locustio/locust',
    release_url='https://github.com/locustio/locust/releases',
    requires_database=false,database_types='{}',persistent_storage=true,storage_profile='depends',
    summary_source='https://github.com/locustio/locust',summary_confidence='high',
    data_source_urls=array['https://locust.io/','https://docs.locust.io/en/stable/','https://docs.locust.io/en/stable/installation.html','https://docs.locust.io/en/stable/running-in-docker.html','https://docs.locust.io/en/stable/running-distributed.html','https://github.com/locustio/locust','https://github.com/locustio/locust/blob/master/LICENSE','https://hub.docker.com/r/locustio/locust','https://raw.githubusercontent.com/SCUR0/Unraid_Docker_Locust/main/locust.xml']::text[],
    technical_fact_status=coalesce(a.technical_fact_status,'{}'::jsonb) || jsonb_build_object(
      'license',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The Locust project repository identifies the MIT license.','source_urls',jsonb_build_array('https://github.com/locustio/locust/blob/master/LICENSE')),
      'docker',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official documentation publishes the locustio/locust image.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/running-in-docker.html','https://hub.docker.com/r/locustio/locust')),
      'docker_image',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','The official image is locustio/locust.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/running-in-docker.html')),
      'compose',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Official Compose example runs a Locust master and worker nodes.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/running-in-docker.html')),
      'database',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','medium','note','Locust runs Python test files and writes optional reports; no separate app database is used.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/','https://docs.locust.io/en/stable/running-in-docker.html')),
      'persistent_storage',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Docker setup mounts the test files from the host; optional CSV and HTML output can be saved there.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/running-in-docker.html','https://docs.locust.io/en/stable/')),
      'surfaces',jsonb_build_object('status','published','checked_at','2026-09-29','confidence','high','note','Locust supports a web interface and headless command-line runs.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/')),
      'ram',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory RAM range is an estimate for a small test; memory use grows with users, workers, and request rate.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/running-distributed.html')),
      'storage',jsonb_build_object('status','not_published','checked_at','2026-09-29','confidence','low','note','Directory storage range is an estimate for test files and optional reports.','source_urls',jsonb_build_array('https://docs.locust.io/en/stable/running-in-docker.html'))
    ),updated_at=now()
  where a.id=v_locust;
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'Locust app update failed'; end if;

  update public.self_host_app_resource_estimates e set
    ram_estimate_min_mb=1024,ram_estimate_max_mb=8192,ram_estimate_kind='estimated',ram_estimate_confidence='low',
    ram_estimate_basis='Memory use grows with simulated users, worker processes, and request rate; this range fits a small load test.',
    ram_source_urls=array['https://docs.locust.io/en/stable/running-distributed.html','https://docs.locust.io/en/stable/']::text[],
    storage_estimate_min_gb=1,storage_estimate_max_gb=20,storage_estimate_kind='estimated',storage_estimate_confidence='low',
    storage_estimate_basis='Locust stores test files and optional CSV or HTML reports; test data and report retention determine use.',
    storage_source_urls=array['https://docs.locust.io/en/stable/running-in-docker.html','https://docs.locust.io/en/stable/']::text[],checked_at=now(),updated_at=now()
  where e.app_id=v_locust and e.ram_estimate_min_mb=256 and e.ram_estimate_max_mb=2048
    and e.ram_estimate_basis='Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_estimate_min_gb=1 and e.storage_estimate_max_gb=20
    and e.storage_estimate_basis='Typical small self-hosted instance; workload and stored data vary.';
  get diagnostics v_affected=row_count; if v_affected<>1 then raise exception 'Locust estimates changed since review'; end if;
end
$migration$;

commit;
