select
  (select count(*) from public.platform_fee_sections
    where $1::text is null or group_name = $1) = $2::integer
  and (select count(*) from public.platform_fee_entries entry
    join public.platform_fee_sections section on section.id = entry.section_id
    where $1::text is null or section.group_name = $1) = $3::integer
  and not exists (
    select 1 from public.platform_fee_entries entry
    left join public.platform_fee_sections section on section.id = entry.section_id
    where section.id is null or entry.card is null
  ) as ready;
