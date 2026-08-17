-- Fix the function's object lookup path so callers cannot influence it.
-- The function only needs PostgreSQL built-ins such as now().
alter function public.set_updated_at()
set search_path = pg_catalog;
