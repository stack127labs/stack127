begin;

do $$
declare
  updated_count integer;
begin
  update public.stack127_pages
  set updated_at = timestamptz '2026-09-19 00:00:00+00'
  where slug = 'privacy'
    and is_published = true;

  get diagnostics updated_count = row_count;
  if updated_count <> 1 then
    raise exception 'Expected to update one published privacy page, updated %', updated_count;
  end if;
end $$;

commit;
