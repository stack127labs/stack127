begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

-- Reject differing artwork before removing the duplicate hero column.
do $$
begin
  if exists (select 1 from public.stack127_catalog_pages where hero_art_key is distinct from card_art_key) then
    raise exception 'Catalog hero art must match card art before this migration';
  end if;
end;
$$;

-- This conversion preserves the rendered copy and public dates.
alter table public.stack127_catalog_pages disable trigger stack127_touch_catalog_content;
alter table public.stack127_catalog_pages disable trigger stack127_catalog_pages_row_updated_at;
alter table public.stack127_catalog_pages add column title text;
update public.stack127_catalog_pages
set title = heading_before || '<mark>' || heading_mark || '</mark>' || heading_after;

alter table public.stack127_catalog_pages
  drop constraint stack127_catalog_pages_copy_check,
  drop constraint stack127_catalog_pages_asset_check,
  drop column heading_before,
  drop column heading_mark,
  drop column heading_after,
  drop column section_heading,
  drop column hero_art_key;
alter table public.stack127_catalog_pages rename column intro to intro_markdown;
alter table public.stack127_catalog_pages rename column home_order to display_order;
alter table public.stack127_catalog_pages
  alter column title set not null,
  add column content_markdown text,
  add constraint stack127_catalog_pages_title_check check (title = btrim(title) and length(title) > 0),
  add constraint stack127_catalog_pages_intro_check check (intro_markdown = btrim(intro_markdown) and length(intro_markdown) > 0),
  add constraint stack127_catalog_pages_content_check check (
    content_markdown is null or (content_markdown = btrim(content_markdown) and length(content_markdown) > 0)
  ),
  add constraint stack127_catalog_pages_asset_check check (
    card_icon_key ~ '^[a-z0-9-]+$' and card_art_key ~ '^[a-z0-9-]+$'
  );
alter table public.stack127_catalog_pages enable trigger stack127_catalog_pages_row_updated_at;
alter table public.stack127_catalog_pages enable trigger stack127_touch_catalog_content;

-- Membership, card, and publication triggers all call this function.
create or replace function public.stack127_touch_catalog_page(p_page_id bigint)
returns void language plpgsql security invoker set search_path = pg_catalog as $$
declare catalog_slug text;
begin
  select slug into catalog_slug from public.stack127_pages where id = p_page_id;
  if catalog_slug is not null then
    perform public.stack127_touch_page(catalog_slug, 'catalog_content_or_members');
  end if;
end;
$$;

create or replace function public.stack127_touch_catalog_content()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
begin
  if tg_op = 'UPDATE' and (to_jsonb(new) - 'row_updated_at')
    is not distinct from (to_jsonb(old) - 'row_updated_at') then return null; end if;
  if tg_op <> 'INSERT' then
    perform public.stack127_touch_catalog_page(old.page_id);
  end if;
  if tg_op <> 'DELETE' then
    perform public.stack127_touch_catalog_page(new.page_id);
  end if;
  return null;
end;
$$;

create or replace function public.stack127_touch_catalog_membership()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
begin
  if tg_op = 'UPDATE' and new is not distinct from old then return null; end if;
  if tg_op <> 'INSERT' then
    perform public.stack127_touch_catalog_page(old.catalog_page_id);
  end if;
  if tg_op <> 'DELETE' then
    perform public.stack127_touch_catalog_page(new.catalog_page_id);
  end if;
  return null;
end;
$$;

-- Validation reads page_id and page_family. Cache fingerprints use to_jsonb(catalog),
-- so those functions already support the new schema without legacy column names.
notify pgrst, 'reload schema';
commit;
