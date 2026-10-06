-- Release C requires Release B on both OVH and the public frontend.
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

-- Keep the version timestamp guard. Content dates come from the existing touch trigger.
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

-- This trigger only maintained the retired directory revision counter.
drop trigger prepare_stack127_directory_page_update on public.stack127_directory_pages;
drop function public.prepare_stack127_directory_page_update();

alter table public.stack127_tool_pages
  drop constraint stack127_tool_pages_content_revision_check,
  drop column content_revision;
alter table public.stack127_directory_pages
  drop constraint stack127_directory_pages_revision_check,
  drop column content_revision;

-- Column defaults disappear with their columns. No CASCADE hides other dependents.
-- Cache fingerprints serialize whole rows and already include every retained field.
-- Touch and validation functions use retained fields, so their definitions stay intact.
notify pgrst, 'reload schema';
commit;
