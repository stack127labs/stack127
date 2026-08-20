-- Move the publication registry to the stack127 namespace while leaving a
-- read-only, RLS-aware compatibility view for the currently deployed app.
do $$
begin
  if to_regclass('public.stack127_pages') is null
    and to_regclass('public.version127_pages') is not null then
    alter table public.version127_pages rename to stack127_pages;
  end if;
end
$$;

alter index if exists public.version127_pages_pkey
  rename to stack127_pages_pkey;
alter index if exists public.version127_pages_published_slug_idx
  rename to stack127_pages_published_slug_idx;

do $$
begin
  if exists (
    select 1
    from pg_trigger
    where tgname = 'set_version127_pages_updated_at'
      and tgrelid = 'public.stack127_pages'::regclass
  ) then
    alter trigger set_version127_pages_updated_at on public.stack127_pages
      rename to set_stack127_pages_updated_at;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'stack127_pages'
      and policyname = 'Published version127 pages are readable'
  ) then
    alter policy "Published version127 pages are readable" on public.stack127_pages
      rename to "Published stack127 pages are readable";
  end if;
end
$$;

update public.stack127_pages
set
  meta_title = replace(replace(meta_title, 'Version127', 'Stack127'), 'version127', 'stack127'),
  meta_description = replace(replace(meta_description, 'Version127', 'Stack127'), 'version127', 'stack127'),
  updated_at = now()
where meta_title ilike '%version127%'
   or meta_description ilike '%version127%';

insert into public.stack127_pages (
  slug,
  label,
  meta_title,
  meta_description,
  is_published,
  published_at,
  cover_image_url,
  page_type,
  sitemap_priority
) values (
  'labs',
  'labs',
  'Labs projects and source code | stack127',
  'Explore the open tools, datasets, and self-hostable projects built by stack127 Labs.',
  true,
  now(),
  null,
  'CollectionPage',
  0.80
)
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = coalesce(public.stack127_pages.published_at, excluded.published_at),
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  updated_at = now();

create or replace view public.version127_pages
with (security_invoker = true)
as
select
  slug,
  meta_title,
  meta_description,
  is_published,
  created_at,
  published_at,
  updated_at,
  cover_image_url,
  page_type,
  sitemap_priority,
  label
from public.stack127_pages;

comment on view public.version127_pages is
  'Temporary read-only compatibility view for the version127-to-stack127 deployment cutover.';

grant select on public.stack127_pages to anon, authenticated;
grant select on public.version127_pages to anon, authenticated;
