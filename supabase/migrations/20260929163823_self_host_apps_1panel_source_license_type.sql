begin;

do $migration$
declare
  v_id uuid;
begin
  select id into v_id
  from public.self_host_apps
  where slug='1panel'
    and published is true
    and self_hosting_status='self_hostable'
    and source_code_url='https://github.com/1Panel-dev/1Panel'
  for update;
  if v_id is null then raise exception '1Panel source record changed since review'; end if;

  update public.self_host_apps
  set license='GPL-3.0 (source repository)',
      license_type='copyleft',
      license_spdx_id='GPL-3.0',
      data_source_urls=(
        select array_agg(distinct u order by u)
        from unnest(data_source_urls || array[
          'https://github.com/1Panel-dev/1Panel',
          'https://github.com/1Panel-dev/1Panel/discussions/11823'
        ]::text[]) as s(u)
      ),
      technical_fact_status=coalesce(technical_fact_status,'{}'::jsonb) ||
        '{"license":{"status":"published","checked_at":"2026-09-29","confidence":"high","note":"The public source repository uses GPL-3.0; downloaded installer terms need separate review.","source_urls":["https://github.com/1Panel-dev/1Panel","https://github.com/1Panel-dev/1Panel/discussions/11823"]}}'::jsonb,
      data_checked_at=now(),
      technical_facts_checked_at=now(),
      updated_at=now()
  where id=v_id;
end
$migration$;

commit;
