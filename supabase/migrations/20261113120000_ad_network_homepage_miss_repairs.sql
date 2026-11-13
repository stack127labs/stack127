begin;
set local lock_timeout = '10s';
-- A target-side checkpoint survives collector syncs and commits atomically with
-- event/snapshot repair. Never put it in source-owned relationship evidence.
create table public.ad_network_homepage_miss_repairs (
  ad_network_id bigint not null,
  publisher_id bigint not null,
  corrected_at timestamptz not null,
  version text not null,
  repaired_at timestamptz not null default now(),
  primary key (ad_network_id, publisher_id, corrected_at, version)
);
alter table public.ad_network_homepage_miss_repairs enable row level security;
revoke all on public.ad_network_homepage_miss_repairs from public, anon, authenticated;
grant select, insert on public.ad_network_homepage_miss_repairs to service_role;
do $$ begin
  if exists(select 1 from pg_roles where rolname='stack127_app') then
    grant select, insert on public.ad_network_homepage_miss_repairs to stack127_app;
    create policy ad_network_homepage_miss_repairs_backend on public.ad_network_homepage_miss_repairs
      for all to stack127_app using (true) with check (true);
  end if;
end $$;
commit;
