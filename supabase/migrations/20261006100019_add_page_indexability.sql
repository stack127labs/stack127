-- Publication controls access; indexability controls search engines.
begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

alter table public.stack127_pages
  add column is_indexable boolean not null default true;

comment on column public.stack127_pages.is_indexable is
  'Published pages with false stay public but send noindex, omit JSON-LD, and stay out of the sitemap.';

-- The page-change trigger compares the whole row, including this new column.
notify pgrst, 'reload schema';
commit;
