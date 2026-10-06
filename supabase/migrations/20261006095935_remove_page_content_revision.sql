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
