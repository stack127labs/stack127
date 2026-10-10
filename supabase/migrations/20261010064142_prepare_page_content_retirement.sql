begin;
set local lock_timeout = '10s';

-- Release 1 keeps the old columns readable by the currently deployed image.
-- New publishers omit page words, so allow NULL until Release 2 archives them.
do $$
declare field record;
begin
  for field in
    select table_name, column_name from information_schema.columns
    where table_schema = 'public'
      and table_name in ('stack127_tool_pages', 'stack127_directory_pages', 'stack127_catalog_pages')
      and column_name in ('intro_markdown', 'usage_markdown', 'content_markdown')
      and is_nullable = 'NO'
  loop
    execute format('alter table public.%I alter column %I drop not null', field.table_name, field.column_name);
  end loop;
end;
$$;

create or replace function public.touch_stack127_tool_page_public_date()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if (new.title, new.tool_version) is distinct from (old.title, old.tool_version) then
    perform public.stack127_touch_page(
      (select slug from public.stack127_pages where id = new.page_id), 'tool_content'
    );
  elsif (new.card_name, new.card_description, new.card_icon_key, new.card_art_key)
    is distinct from (old.card_name, old.card_description, old.card_icon_key, old.card_art_key) then
    update public.stack127_pages set row_updated_at = now() where id = new.page_id;
  end if;
  return new;
end;
$$;

notify pgrst, 'reload schema';
commit;
