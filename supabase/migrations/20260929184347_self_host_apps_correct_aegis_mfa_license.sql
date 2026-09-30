-- Correct Aegis MFA's source model and license from the official repository README and LICENSE, checked 2026-09-30.
begin;

do $$
begin
  if not exists (
    select 1
    from public.self_host_apps
    where id = '56bf9dfd-c075-4f74-87d5-bea024bab380'
      and slug = 'aegis-mfa'
      and published = true
      and source_model = 'unknown'
      and license_type = 'unknown'
      and license is null
      and license_spdx_id is null
      and 'https://github.com/Lazaros-Chalkidis/unraid-aegis-mfa/blob/main/README.md' = any(data_source_urls)
      and 'https://github.com/Lazaros-Chalkidis/unraid-aegis-mfa/blob/main/LICENSE' = any(data_source_urls)
  ) then
    raise exception 'Aegis MFA changed from the reviewed license snapshot';
  end if;
end;
$$;

update public.self_host_apps
set source_model = 'open_source',
    license_type = 'copyleft',
    license = 'GNU General Public License v3.0 or later',
    license_spdx_id = 'GPL-3.0-or-later',
    technical_fact_status = coalesce(technical_fact_status, '{}'::jsonb)
      || jsonb_build_object(
        'source_model', jsonb_build_object(
          'status', 'published',
          'checked_at', '2026-09-30',
          'confidence', 'high',
          'note', 'The official README declares GPL-3.0-or-later.',
          'source_urls', jsonb_build_array(
            'https://github.com/Lazaros-Chalkidis/unraid-aegis-mfa/blob/main/README.md',
            'https://github.com/Lazaros-Chalkidis/unraid-aegis-mfa/blob/main/LICENSE'
          )
        ),
        'license', jsonb_build_object(
          'status', 'published',
          'checked_at', '2026-09-30',
          'confidence', 'high',
          'note', 'The official README declares GPL-3.0-or-later.',
          'source_urls', jsonb_build_array(
            'https://github.com/Lazaros-Chalkidis/unraid-aegis-mfa/blob/main/README.md',
            'https://github.com/Lazaros-Chalkidis/unraid-aegis-mfa/blob/main/LICENSE'
          )
        )
      ),
    updated_at = now()
where id = '56bf9dfd-c075-4f74-87d5-bea024bab380'
  and slug = 'aegis-mfa';

commit;
