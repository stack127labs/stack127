begin;
set local lock_timeout = '10s';

-- Block writes until the archive and column drops commit together.
lock table public.stack127_tool_pages, public.stack127_directory_pages,
  public.stack127_catalog_pages in access exclusive mode;

create table if not exists public.stack127_retired_page_content (
  page_id bigint not null,
  table_name text not null check (table_name in (
    'stack127_tool_pages', 'stack127_directory_pages', 'stack127_catalog_pages'
  )),
  column_name text not null check (column_name in ('intro_markdown', 'usage_markdown', 'content_markdown')),
  value text,
  archived_at timestamptz not null default now(),
  primary key (page_id, table_name, column_name)
);
comment on table public.stack127_retired_page_content is
  'Original page words retired when tools, directories and catalogs moved to route-owned MDX. No foreign key so archived words survive page deletion.';
alter table public.stack127_retired_page_content enable row level security;
revoke all on public.stack127_retired_page_content from public, anon, authenticated;
grant select on public.stack127_retired_page_content to service_role;

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

-- PL/pgSQL trigger bodies do not create column dependencies. Refuse to drop
-- columns if another installed function still refers to them.
do $$
declare remaining text;
begin
  select string_agg(p.oid::regprocedure::text, ', ') into remaining
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
    and p.prosrc ~ '\m(intro_markdown|usage_markdown|content_markdown)\M'
    and (p.prosrc ~ '\m(stack127_tool_pages|stack127_directory_pages|stack127_catalog_pages)\M'
      or exists (select 1 from pg_trigger t where t.tgfoid = p.oid and t.tgrelid in (
        'public.stack127_tool_pages'::regclass, 'public.stack127_directory_pages'::regclass,
        'public.stack127_catalog_pages'::regclass
      )));
  if remaining is not null then
    raise exception 'Retired page columns still have function readers: %', remaining;
  end if;
end;
$$;

do $$
declare field record;
declare mismatches bigint;
begin
  for field in
    select table_name, column_name from information_schema.columns
    where table_schema = 'public'
      and table_name in ('stack127_tool_pages', 'stack127_directory_pages', 'stack127_catalog_pages')
      and column_name in ('intro_markdown', 'usage_markdown', 'content_markdown')
    order by table_name, column_name
  loop
    execute format(
      'insert into public.stack127_retired_page_content(page_id,table_name,column_name,value)
       select page_id,%L,%L,%I from public.%I
       on conflict(page_id,table_name,column_name) do nothing',
      field.table_name, field.column_name, field.column_name, field.table_name
    );
    execute format(
      'select count(*) from public.%I live
       left join public.stack127_retired_page_content archive
         on archive.page_id=live.page_id and archive.table_name=%L and archive.column_name=%L
       where archive.page_id is null or archive.value is distinct from live.%I',
      field.table_name, field.table_name, field.column_name, field.column_name
    ) into mismatches;
    if mismatches <> 0 then
      raise exception 'Archive verification failed for %.%: % rows', field.table_name, field.column_name, mismatches;
    end if;
  end loop;

  -- Without CASCADE, an unexpected view or other dependent object aborts the
  -- whole transaction. Column checks retire with their columns.
  alter table public.stack127_tool_pages
    drop column if exists intro_markdown,
    drop column if exists usage_markdown,
    drop column if exists content_markdown;
  alter table public.stack127_directory_pages
    drop column if exists intro_markdown,
    drop column if exists content_markdown;
  alter table public.stack127_catalog_pages
    drop column if exists intro_markdown,
    drop column if exists content_markdown;
end;
$$;

notify pgrst, 'reload schema';
commit;
