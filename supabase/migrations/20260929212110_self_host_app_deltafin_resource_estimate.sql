-- Deltafin resource estimates reviewed against current upstream hardware and
-- installation guidance. This changes resource estimates only.
begin;

do $migration$
declare
  updated_rows integer;
begin
  update public.self_host_app_resource_estimates as e
  set
    ram_estimate_min_mb = 65536,
    ram_estimate_max_mb = 131072,
    ram_estimate_kind = 'estimated',
    ram_estimate_confidence = 'low',
    ram_estimate_basis = 'Published working hosts: 64 GB M1 Max maintainer benchmark; 128 GB DGX Spark contributor run.',
    ram_source_urls = array[
      'https://github.com/gavamedia/deltafin/blob/main/docs/PERFORMANCE.md',
      'https://github.com/gavamedia/deltafin/pull/2'
    ]::text[],
    storage_estimate_min_gb = 215,
    storage_estimate_max_gb = 1700,
    storage_estimate_kind = 'estimated',
    storage_estimate_confidence = 'high',
    storage_estimate_basis = 'Publisher lists about 215 GB for streaming and 1.7 TB for a full install.',
    storage_source_urls = array[
      'https://github.com/gavamedia/deltafin/blob/main/README.md',
      'https://github.com/gavamedia/deltafin/blob/main/docs/REQUIREMENTS.md'
    ]::text[],
    checked_at = now()
  from public.self_host_apps as a
  where e.app_id = a.id
    and a.id = 'c1c593a8-6393-4ff8-893f-181d0a228e37'::uuid
    and a.slug = 'deltafin'
    and a.published is true
    and e.ram_estimate_min_mb = 2048
    and e.ram_estimate_max_mb = 8192
    and e.ram_estimate_kind = 'estimated'
    and e.ram_estimate_confidence = 'low'
    and e.ram_estimate_basis = 'Typical small self-hosted instance; workload and stored data vary.'
    and e.ram_source_urls = array['https://github.com/gavamedia/deltafin']::text[]
    and e.storage_estimate_min_gb = 1
    and e.storage_estimate_max_gb = 20
    and e.storage_estimate_kind = 'estimated'
    and e.storage_estimate_confidence = 'low'
    and e.storage_estimate_basis = 'Typical small self-hosted instance; workload and stored data vary.'
    and e.storage_source_urls = array['https://github.com/gavamedia/deltafin']::text[]
    and e.checked_at = '2026-09-28T11:08:23.499769+00:00'::timestamptz;

  get diagnostics updated_rows = row_count;
  if updated_rows <> 1 then
    raise exception 'Deltafin resource estimate guard failed: expected exactly one unchanged live row, updated %', updated_rows;
  end if;
end;
$migration$;

commit;
