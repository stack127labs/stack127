-- Keep the revalidation signing key in the database already shared by the
-- production app and the trusted cache worker. It never enters source control.
create table public.stack127_cache_credentials (
  id boolean primary key default true check (id),
  signing_key text not null check (signing_key ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);

alter table public.stack127_cache_credentials enable row level security;
revoke all on public.stack127_cache_credentials from public, anon, authenticated;
grant select on public.stack127_cache_credentials to service_role;

insert into public.stack127_cache_credentials (id, signing_key)
values (
  true,
  replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
);
