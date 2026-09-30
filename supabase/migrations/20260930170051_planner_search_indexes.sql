create extension if not exists pg_trgm with schema extensions;
create index self_host_apps_public_name_trgm_idx on public.self_host_apps
  using gin (lower(name) extensions.gin_trgm_ops)
  where published = true and self_hosting_status = 'self_hostable';
create index self_host_apps_public_slug_trgm_idx on public.self_host_apps
  using gin (lower(slug) extensions.gin_trgm_ops)
  where published = true and self_hosting_status = 'self_hostable';
analyze public.self_host_apps;

-- Both source-model indexes were measured and have the same definition with
-- no dependent constraints. Keep the current name used most often in production.
drop index public.open_projects_source_model_idx;
