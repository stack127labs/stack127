-- Keep exact publisher requirements separate from editorial planning ranges,
-- and keep install destinations separate from source files and evidence links.

begin;

create table public.self_host_app_resource_estimates (
  app_id uuid not null references public.self_host_apps(id) on delete cascade,
  resource_kind text not null
    check (resource_kind in ('ram', 'storage')),
  estimate_min numeric not null check (estimate_min >= 0),
  estimate_max numeric not null check (estimate_max >= estimate_min),
  unit text not null
    check (
      (resource_kind = 'ram' and unit = 'mb')
      or (resource_kind = 'storage' and unit = 'gb')
    ),
  estimate_kind text not null
    check (estimate_kind in ('derived', 'estimated')),
  confidence text not null
    check (confidence in ('high', 'medium', 'low')),
  basis text not null,
  source_urls text[] not null default '{}',
  note text,
  checked_at timestamptz not null default now(),
  primary key (app_id, resource_kind),
  check (cardinality(source_urls) > 0)
);

create index self_host_app_resource_estimates_kind_idx
  on public.self_host_app_resource_estimates (resource_kind, confidence);

create table public.self_host_app_install_options (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.self_host_apps(id) on delete cascade,
  method text not null
    check (method in (
      'docker', 'compose', 'truenas_scale', 'unraid', 'umbrel', 'yunohost',
      'casaos', 'runtipi', 'cosmos', 'openmediavault', 'synology', 'qnap',
      'proxmox', 'home_assistant_os', 'kubernetes', 'helm', 'native',
      'binary', 'package', 'other'
    )),
  label text not null,
  url text not null check (url ~ '^https?://'),
  image text,
  support_level text not null
    check (support_level in ('official', 'community', 'third_party')),
  source_url text,
  note text,
  sort_order integer not null default 0,
  checked_at timestamptz not null default now(),
  unique (app_id, method, url)
);

create index self_host_app_install_options_app_idx
  on public.self_host_app_install_options (app_id, sort_order, method);

alter table public.self_host_app_resource_estimates enable row level security;
alter table public.self_host_app_install_options enable row level security;

revoke all on table public.self_host_app_resource_estimates from anon, authenticated;
revoke all on table public.self_host_app_install_options from anon, authenticated;

commit;
