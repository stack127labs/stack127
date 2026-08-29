-- Preserve deployment facts that are useful but are not minimum requirements.
-- A catalog default memory cap must never be presented as an app minimum, and
-- a declared persistent volume does not prove a minimum number of gigabytes.

begin;

alter table public.self_host_apps
  add column ram_default_limit_mb integer
    check (ram_default_limit_mb is null or ram_default_limit_mb > 0),
  add column persistent_storage boolean,
  add column technical_facts_checked_at timestamptz;

commit;
