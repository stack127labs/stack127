begin;
set local lock_timeout = '10s';
create or replace function public.touch_stack127_tool_page_public_date()
returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if (new.title,new.intro_markdown,new.usage_markdown,new.content_markdown,new.tool_version)
    is distinct from (old.title,old.intro_markdown,old.usage_markdown,old.content_markdown,old.tool_version) then
    perform public.stack127_touch_page((select slug from public.stack127_pages where id=new.page_id), 'tool_content');
  elsif (new.card_name,new.card_description,new.card_icon_key,new.card_art_key)
    is distinct from (old.card_name,old.card_description,old.card_icon_key,old.card_art_key) then
    -- Origin verification must still detect an older rendered card or sidebar.
    update public.stack127_pages set row_updated_at=now() where id=new.page_id;
  end if;
  return new;
end;
$$;
commit;
