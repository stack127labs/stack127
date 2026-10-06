-- Release C. Keep outside supabase/migrations until Release B and its writers are live.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';
drop trigger stack127_sync_catalog_legacy_columns on public.stack127_catalog_pages;
drop function public.stack127_sync_catalog_legacy_columns();
alter table public.stack127_catalog_pages
  drop constraint stack127_catalog_pages_copy_check,
  drop constraint stack127_catalog_pages_asset_check,
  drop column heading_before,
  drop column heading_mark,
  drop column heading_after,
  drop column intro,
  drop column section_heading,
  drop column hero_art_key,
  drop column home_order,
  alter column display_order set default 100,
  add constraint stack127_catalog_pages_asset_check check (
    card_icon_key ~ '^[a-z0-9-]+$' and card_art_key ~ '^[a-z0-9-]+$'
  );
-- Content cache checks use the registry row timestamp.
create or replace function public.prepare_stack127_tool_page_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if new.tool_version is distinct from old.tool_version then
    new.tool_version_updated_at = now();
  elsif new.tool_version_updated_at <> old.tool_version_updated_at then
    raise exception 'tool_version_updated_at changes only with tool_version';
  end if;

  return new;
end;
$$;

create or replace function public.prepare_stack127_directory_page_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  return new;
end;
$$;

alter table public.stack127_tool_pages
  drop constraint stack127_tool_pages_content_revision_check,
  drop column content_revision;

alter table public.stack127_directory_pages
  drop constraint stack127_directory_pages_revision_check,
  drop column content_revision;
notify pgrst, 'reload schema';
commit;
