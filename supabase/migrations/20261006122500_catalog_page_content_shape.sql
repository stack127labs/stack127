begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

-- Existing public artwork must render the same through both column sets.
do $$
begin
  if exists (select 1 from public.stack127_catalog_pages where hero_art_key is distinct from card_art_key) then
    raise exception 'Catalog hero and card artwork must agree before expansion';
  end if;
end;
$$;

-- Release A adds the new shape while retaining every column used by the old app.
alter table public.stack127_catalog_pages disable trigger stack127_touch_catalog_content;
alter table public.stack127_catalog_pages disable trigger stack127_catalog_pages_row_updated_at;
alter table public.stack127_catalog_pages
  add column title text,
  add column intro_markdown text,
  add column content_markdown text,
  add column display_order integer;
update public.stack127_catalog_pages
set title = heading_before || case when heading_mark='' then '' else '<mark>' || heading_mark || '</mark>' end || heading_after,
    intro_markdown = intro,
    display_order = home_order;
alter table public.stack127_catalog_pages
  alter column title set not null,
  alter column intro_markdown set not null,
  alter column display_order set not null,
  alter column heading_before set default '',
  alter column heading_mark set default '',
  alter column section_heading set default 'Tools',
  drop constraint stack127_catalog_pages_copy_check,
  add constraint stack127_catalog_pages_copy_check check (
    length(btrim(heading_before || heading_mark || heading_after)) > 0
    and length(btrim(intro)) > 0 and length(btrim(section_heading)) > 0
  ),
  add constraint stack127_catalog_pages_title_check check (title = btrim(title) and length(title) > 0),
  add constraint stack127_catalog_pages_intro_check check (intro_markdown = btrim(intro_markdown) and length(intro_markdown) > 0),
  add constraint stack127_catalog_pages_content_check check (
    content_markdown is null or (content_markdown = btrim(content_markdown) and length(content_markdown) > 0)
  );
alter table public.stack127_catalog_pages enable trigger stack127_catalog_pages_row_updated_at;
alter table public.stack127_catalog_pages enable trigger stack127_touch_catalog_content;

-- Change NEW before constraints run. No second UPDATE, recursion, or extra date touch.
create function public.stack127_sync_catalog_legacy_columns()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare legacy_title text; parts text[]; title_changed boolean; heading_changed boolean;
begin
  legacy_title := new.heading_before || case when new.heading_mark = '' then ''
    else '<mark>' || new.heading_mark || '</mark>' end || new.heading_after;
  if tg_op = 'INSERT' then
    title_changed := new.title is not null;
    heading_changed := coalesce(legacy_title, '') <> '';
  else
    title_changed := new.title is distinct from old.title;
    heading_changed := (new.heading_before,new.heading_mark,new.heading_after)
      is distinct from (old.heading_before,old.heading_mark,old.heading_after);
  end if;
  if title_changed and heading_changed and new.title is distinct from legacy_title then
    raise exception 'Conflicting catalog title and legacy heading';
  elsif heading_changed then
    new.title := legacy_title;
  elsif title_changed then
    parts := regexp_match(new.title, '^(.*)<mark>([^<]+)</mark>(.*)$');
    if parts is null then
      new.heading_before := new.title; new.heading_mark := ''; new.heading_after := '';
    else
      new.heading_before := parts[1]; new.heading_mark := parts[2]; new.heading_after := parts[3];
    end if;
  end if;

  if tg_op = 'INSERT' then
    if new.intro_markdown is not null and new.intro is not null and new.intro_markdown <> new.intro then
      raise exception 'Conflicting catalog introductions';
    end if;
    new.intro_markdown := coalesce(new.intro_markdown,new.intro);
    new.intro := new.intro_markdown;
    new.display_order := coalesce(new.display_order,new.home_order);
    new.home_order := new.display_order;
    if new.card_art_key = 'catalog-default' then new.card_art_key := new.hero_art_key;
    elsif new.hero_art_key <> 'catalog-default' and new.hero_art_key <> new.card_art_key then
      raise exception 'Conflicting catalog artwork';
    end if;
    new.hero_art_key := new.card_art_key;
  else
    if new.intro_markdown is distinct from old.intro_markdown and new.intro is distinct from old.intro
      and new.intro_markdown is distinct from new.intro then raise exception 'Conflicting catalog introductions'; end if;
    if new.intro_markdown is distinct from old.intro_markdown then new.intro := new.intro_markdown;
    elsif new.intro is distinct from old.intro then new.intro_markdown := new.intro; end if;

    if new.display_order is distinct from old.display_order and new.home_order is distinct from old.home_order
      and new.display_order is distinct from new.home_order then raise exception 'Conflicting catalog ordering'; end if;
    if new.display_order is distinct from old.display_order then new.home_order := new.display_order;
    elsif new.home_order is distinct from old.home_order then new.display_order := new.home_order; end if;

    if new.card_art_key is distinct from old.card_art_key and new.hero_art_key is distinct from old.hero_art_key
      and new.card_art_key is distinct from new.hero_art_key then raise exception 'Conflicting catalog artwork'; end if;
    if new.card_art_key is distinct from old.card_art_key then new.hero_art_key := new.card_art_key;
    elsif new.hero_art_key is distinct from old.hero_art_key then new.card_art_key := new.hero_art_key; end if;
  end if;
  return new;
end;
$$;
revoke all on function public.stack127_sync_catalog_legacy_columns() from public, anon, authenticated;
grant execute on function public.stack127_sync_catalog_legacy_columns() to service_role;
create trigger stack127_sync_catalog_legacy_columns before insert or update on public.stack127_catalog_pages
for each row execute function public.stack127_sync_catalog_legacy_columns();

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
  if tg_op = 'UPDATE' and (new.catalog_page_id,new.tool_page_id,new.display_order)
    is not distinct from (old.catalog_page_id,old.tool_page_id,old.display_order) then
    -- Primary-catalog rank changes refresh navigation without changing the card list.
    perform public.stack127_enqueue_revalidation('page',
      (select slug from public.stack127_pages where id=new.catalog_page_id), 'catalog_navigation');
    return null;
  end if;
  if tg_op <> 'INSERT' and exists (select 1 from public.stack127_pages where id=old.tool_page_id and is_published) then
    perform public.stack127_touch_catalog_page(old.catalog_page_id);
  end if;
  if tg_op <> 'DELETE' and exists (select 1 from public.stack127_pages where id=new.tool_page_id and is_published) then
    perform public.stack127_touch_catalog_page(new.catalog_page_id);
  end if;
  return null;
end;
$$;

-- Draft cards do not appear in public catalogs. Publication changes have their own trigger.
create or replace function public.stack127_touch_tool_catalogs()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare member record; tool_id bigint;
begin
  if tg_op = 'UPDATE' and (new.card_name,new.card_description,new.card_icon_key,new.card_art_key)
    is not distinct from (old.card_name,old.card_description,old.card_icon_key,old.card_art_key) then return null; end if;
  tool_id := case when tg_op='DELETE' then old.page_id else new.page_id end;
  if not exists (select 1 from public.stack127_pages where id=tool_id and is_published) then return null; end if;
  for member in select distinct catalog_page_id from public.stack127_tool_catalog_memberships where tool_page_id=tool_id loop
    perform public.stack127_touch_catalog_page(member.catalog_page_id);
  end loop;
  return null;
end;
$$;

create or replace function public.stack127_touch_catalogs_on_tool_publication()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare member record;
begin
  if tg_op='DELETE' then
    if old.page_family='tool' and old.is_published then
      for member in select catalog_page_id from public.stack127_tool_catalog_memberships where tool_page_id=old.id loop
        perform public.stack127_touch_catalog_page(member.catalog_page_id);
      end loop;
    end if;
    return old;
  end if;
  if new.page_family='tool' and (new.is_published or old.is_published)
    and (new.is_published,new.slug) is distinct from (old.is_published,old.slug) then
    for member in select catalog_page_id from public.stack127_tool_catalog_memberships where tool_page_id=new.id loop
      perform public.stack127_touch_catalog_page(member.catalog_page_id);
    end loop;
  end if;
  return null;
end;
$$;

-- Read memberships before the registry's cascading delete removes them.
create trigger stack127_touch_catalogs_on_tool_removal before delete on public.stack127_pages
for each row execute function public.stack127_touch_catalogs_on_tool_publication();

-- Validation reads page_id and page_family. Cache fingerprints use to_jsonb(catalog),
-- so those functions already support the new schema without legacy column names.
notify pgrst, 'reload schema';
commit;
