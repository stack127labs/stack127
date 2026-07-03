alter table public.self_host_apps
  add column if not exists publisher_name text,
  add column if not exists publisher_type text not null default 'unknown',
  add column if not exists publisher_url text;

alter table public.self_host_apps
  drop constraint if exists self_host_apps_publisher_type_check;

alter table public.self_host_apps
  add constraint self_host_apps_publisher_type_check
  check (publisher_type in ('company', 'foundation', 'community', 'individual', 'unknown'));
