-- Correct 4get's source model and license from its official license file, checked 2026-09-30.
begin;

do $$
begin
  if not exists (
    select 1
    from public.self_host_apps
    where id = 'c3cb6bea-2fb5-4ea7-9e49-da3b65d5ba40'
      and slug = '4get'
      and published = true
      and source_model = 'unknown'
      and license_type = 'unknown'
      and license is null
      and license_spdx_id is null
      and 'https://git.lolcat.ca/lolcat/4get/src/branch/master/license.txt' = any(data_source_urls)
  ) then
    raise exception '4get changed from the reviewed license snapshot';
  end if;
end;
$$;

update public.self_host_apps
set source_model = 'open_source',
    license_type = 'copyleft',
    license = 'GNU Affero General Public License v3.0 only',
    license_spdx_id = 'AGPL-3.0-only',
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb)
      || jsonb_build_object(
        'source_model', jsonb_build_object(
          'status', 'published',
          'checked_at', '2026-09-30',
          'confidence', 'high',
          'note', 'The official project license file declares GNU AGPL v3.',
          'source_urls', jsonb_build_array('https://git.lolcat.ca/lolcat/4get/src/branch/master/license.txt')
        ),
        'license', jsonb_build_object(
          'status', 'published',
          'checked_at', '2026-09-30',
          'confidence', 'high',
          'note', 'The official project license file declares GNU AGPL v3.',
          'source_urls', jsonb_build_array('https://git.lolcat.ca/lolcat/4get/src/branch/master/license.txt')
        )
      ),
    updated_at = now()
where id = 'c3cb6bea-2fb5-4ea7-9e49-da3b65d5ba40'
  and slug = '4get';

commit;
