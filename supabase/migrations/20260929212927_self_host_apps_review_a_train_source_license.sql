-- The upstream does not identify A-Train's license; avoid treating an
-- unverified public repository as open source.
begin;

do $migration$
declare
  updated_rows integer;
begin
  update public.self_host_apps as a
  set
    source_model = 'unknown',
    data_source_urls = array(
      select distinct source_url
      from unnest(
        coalesce(a.data_source_urls, array[]::text[]) || array[
          'https://github.com/m-rots/a-train/blob/main/README.md',
          'https://github.com/m-rots/a-train/blob/main/Cargo.toml'
        ]::text[]
      ) as sources(source_url)
      where source_url is not null
      order by source_url
    ),
    updated_at = now()
  where a.id = '53a5a3f2-dd9b-473b-8bc8-17631ae19e05'::uuid
    and a.slug = 'a-train'
    and a.published is true
    and a.self_hosting_status = 'self_hostable'
    and a.source_model = 'open_source'
    and a.license is null
    and a.license_type = 'unknown'
    and a.license_spdx_id is null
    and a.source_code_url = 'https://github.com/m-rots/a-train'
    and a.website_url is null
    and a.docs_url = 'https://github.com/m-rots/a-train'
    and a.publisher_url = 'https://github.com/m-rots'
    and a.data_source_urls = array[
      'https://github.com/Cloudbox/autoscan',
      'https://github.com/m-rots',
      'https://github.com/m-rots/a-train',
      'https://github.com/m-rots/a-train/pkgs/container/a-train',
      'https://raw.githubusercontent.com/m-rots/a-train/main/README.md'
    ]::text[]
    and a.updated_at = '2026-09-29T19:30:44.641517+00:00'::timestamptz;

  get diagnostics updated_rows = row_count;
  if updated_rows <> 1 then
    raise exception 'A-Train source/license guard failed: expected exactly one unchanged live row, updated %', updated_rows;
  end if;
end;
$migration$;

commit;
