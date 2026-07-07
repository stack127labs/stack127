create table if not exists public.version127_pages (
  slug text primary key,
  meta_title text not null,
  meta_description text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  cover_image_url text,
  page_type text not null default 'WebPage',
  sitemap_priority numeric(3, 2) not null default 0.5,
  check (
    slug = ''
    or (
      slug !~ '^/'
      and slug !~ '/$'
      and slug !~ '//'
      and length(slug) <= 240
    )
  ),
  check (meta_title = btrim(meta_title) and length(meta_title) > 0),
  check (meta_description = btrim(meta_description) and length(meta_description) > 0),
  check (published_at is null or is_published = true),
  check (sitemap_priority >= 0 and sitemap_priority <= 1)
);

create index if not exists version127_pages_published_slug_idx
  on public.version127_pages (is_published, slug);

create trigger set_version127_pages_updated_at
before update on public.version127_pages
for each row execute function public.set_updated_at();

alter table public.version127_pages enable row level security;

drop policy if exists "Published version127 pages are readable" on public.version127_pages;

create policy "Published version127 pages are readable"
on public.version127_pages
for select
to anon, authenticated
using (is_published = true);

grant select on public.version127_pages to anon, authenticated;

insert into public.version127_pages (
  slug,
  meta_title,
  meta_description,
  is_published,
  created_at,
  published_at,
  updated_at,
  cover_image_url,
  page_type,
  sitemap_priority
) values (
  'self-host-apps',
  'Self-host apps | version127',
  'Browse self-hosted apps by category, Docker support, resource needs, project health, and official links.',
  true,
  '2026-07-03T00:00:00.000Z',
  '2026-07-03T00:00:00.000Z',
  '2026-07-07T00:00:00.000Z',
  null,
  'CollectionPage',
  0.90
)
on conflict (slug) do update set
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = excluded.published_at,
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority;
