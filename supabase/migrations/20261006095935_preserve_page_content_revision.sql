begin;
set local lock_timeout = '10s';
-- Release A retains the counters used by the deployed readers and writers.
-- These definitions keep explicit old-writer increments and automatic increments equivalent.
create or replace function public.prepare_stack127_tool_page_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (new.title, new.intro_markdown, new.usage_markdown, new.content_markdown)
    is distinct from
    (old.title, old.intro_markdown, old.usage_markdown, old.content_markdown) then
    new.content_revision = old.content_revision + 1;
  elsif new.content_revision <> old.content_revision then
    raise exception 'content_revision changes only with title or Markdown content';
  end if;

  if new.tool_version is distinct from old.tool_version then
    new.tool_version_updated_at = now();
  elsif new.tool_version_updated_at <> old.tool_version_updated_at then
    raise exception 'tool_version_updated_at changes only with tool_version';
  end if;

  return new;
end;
$$;

create or replace function public.prepare_stack127_directory_page_update()
returns trigger language plpgsql set search_path=pg_catalog as $$
begin
  if (new.title,new.intro_markdown,new.content_markdown) is distinct from (old.title,old.intro_markdown,old.content_markdown) then
    new.content_revision=old.content_revision+1;
  elsif new.content_revision<>old.content_revision then
    raise exception 'content_revision changes only with title or Markdown content';
  end if;
  return new;
end;
$$;
notify pgrst, 'reload schema';
commit;
