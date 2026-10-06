begin;
set local lock_timeout = '10s';
-- Retired or renamed child routes still change their registered ancestors.
create or replace function public.stack127_touch_page(p_slug text, p_reason text)
returns void language plpgsql security invoker set search_path = pg_catalog as $$
declare target record;
begin
  if p_reason is null or btrim(p_reason) = '' then raise exception 'A page change reason is required'; end if;
  for target in
    select page.slug from public.stack127_pages page
    where page.slug = p_slug or (
      page.page_family = 'directory' and left(p_slug, length(page.slug) + 1) = page.slug || '/'
    ) order by page.slug
  loop
    update public.stack127_pages set updated_at = case when is_published then now() else null end
    where slug = target.slug and updated_at is distinct from case when is_published then now() else null end;
    perform public.stack127_enqueue_revalidation('page', target.slug, p_reason);
  end loop;
end;
$$;

create function public.stack127_touch_directory_registry()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
begin
  if tg_op='UPDATE' and (to_jsonb(new)-array['published_at','updated_at','row_updated_at'])
    is not distinct from (to_jsonb(old)-array['published_at','updated_at','row_updated_at']) then return null; end if;
  if tg_op<>'INSERT' and old.page_family='directory' then
    perform public.stack127_touch_page(old.slug,'directory_registry');
  end if;
  if tg_op<>'DELETE' and new.page_family='directory' then
    perform public.stack127_touch_page(new.slug,'directory_registry');
  end if;
  return null;
end;
$$;
revoke all on function public.stack127_touch_directory_registry() from public, anon, authenticated;
grant execute on function public.stack127_touch_directory_registry() to service_role;
create trigger stack127_touch_directory_registry
  after insert or update or delete on public.stack127_pages
  for each row execute function public.stack127_touch_directory_registry();
commit;
