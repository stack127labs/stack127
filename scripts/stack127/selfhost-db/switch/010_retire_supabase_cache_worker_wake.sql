-- Retire the Supabase Edge Function wake-up for the cache worker.
--
-- When to run: at the database switch, on the new self-hosted Postgres right
-- after the restore and BEFORE the cron job for scripts/stack127/cache/worker.mjs
-- starts. Run it on the old Supabase database as well once traffic has moved,
-- so a retired database never calls the function URL again.
--
-- Why it is not in supabase/migrations: the release workflow applies that folder
-- to the Supabase project at release time. This change must land at one exact
-- moment (the switch), not at the next release, and it must never run on the
-- old database while it is still the live one. The restored database may also
-- lack pg_cron and pg_net, so every step checks before it touches them.
--
-- The script is idempotent. It:
--   1. unschedules the pg_cron job `stack127-cache-worker` when pg_cron exists;
--   2. drops the pg_net wake trigger on public.stack127_revalidation_events;
--   3. drops the trigger function and replaces stack127_wake_cache_worker(boolean)
--      with a no-op, so manual calls in old runbooks do nothing instead of failing;
--   4. clears stack127_cache_worker_wake.function_url, which worker.mjs checks
--      before it processes anything.
-- The queue, lease, credentials, observation, and processed tables stay as they
-- are. The Node worker reuses all of them.

begin;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'stack127-cache-worker';
  end if;
end;
$$;

drop trigger if exists stack127_wake_cache_worker on public.stack127_revalidation_events;
drop function if exists public.stack127_queue_wake_cache_worker();

create or replace function public.stack127_wake_cache_worker(p_force boolean default false)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  -- The cache worker runs from cron on the OVH server (scripts/stack127/cache/worker.mjs).
  -- There is no Edge Function to wake. Kept so old runbooks that call it do not fail.
  return;
end;
$$;
revoke all on function public.stack127_wake_cache_worker(boolean) from public, anon, authenticated;

update public.stack127_cache_worker_wake set function_url = null where id;

commit;

-- Verification. Every value must be false or 0 before the Node worker starts.
select
  (select function_url is not null from public.stack127_cache_worker_wake where id) as wake_url_configured,
  exists (select 1 from pg_trigger
    where tgname = 'stack127_wake_cache_worker' and not tgisinternal
      and tgrelid = 'public.stack127_revalidation_events'::regclass) as wake_trigger_present,
  exists (select 1 from pg_proc where proname = 'stack127_queue_wake_cache_worker') as trigger_function_present,
  case when exists (select 1 from pg_extension where extname = 'pg_cron')
    then (select count(*) from cron.job where jobname = 'stack127-cache-worker') else 0 end as cron_jobs;
