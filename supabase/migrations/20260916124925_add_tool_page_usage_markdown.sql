-- Usage guidance is deliberately nullable while existing rows are reviewed.
-- New writes that provide it must contain meaningful, trimmed Markdown.
alter table public.stack127_tool_pages
  add column if not exists usage_markdown text;

alter table public.stack127_tool_pages
  add constraint stack127_tool_pages_usage_check check (
    usage_markdown is null
    or (usage_markdown = btrim(usage_markdown) and length(usage_markdown) > 0)
  );

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

create or replace function public.touch_stack127_tool_page_public_date()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  if (new.title, new.intro_markdown, new.usage_markdown, new.content_markdown, new.tool_version)
    is distinct from
    (old.title, old.intro_markdown, old.usage_markdown, old.content_markdown, old.tool_version) then
    update public.stack127_pages
    set updated_at = case when is_published then now() else null end
    where id = new.page_id;
  end if;
  return new;
end;
$$;
