-- Apply only at the authorized database switch, not as a release migration.
-- During the source write freeze, retire its wake before the final copy, disable
-- invocation of the old function, and drain in-flight runs and the 150s lease.
-- Also apply on the restored OVH target BEFORE test mutations or Node processing.
-- Disabling wiring cannot cancel an already running function or HTTP request.
--
-- Idempotent; does not need pg_cron/pg_net installed. Keep ordinary queue triggers,
-- event versions, credentials, observations, fingerprints and leases unchanged.
-- Requires a trusted administrator. Run with psql -v ON_ERROR_STOP=1.
begin;
set local lock_timeout = '5s';
set local statement_timeout = '15s';

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute 'select cron.unschedule(jobid) from cron.job where jobname = ''stack127-cache-worker''';
  end if;
  -- Remove only queued cache-worker HTTP calls, preserving other pg_net work.
  -- Requests already taken by pg_net still require the cutover drain above.
  if to_regclass('net.http_request_queue') is not null then
    execute $sql$delete from net.http_request_queue
      where url ~ '^https://[a-z0-9.-]+/functions/v1/cache-worker$'$sql$;
  end if;
end;
$$;

drop trigger if exists stack127_wake_cache_worker on public.stack127_revalidation_events;
drop function if exists public.stack127_queue_wake_cache_worker();

create or replace function public.stack127_wake_cache_worker(p_force boolean default false)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  -- The Node worker runs from the OVH systemd timer. Keep old manual calls safe.
  return;
end;
$$;
revoke all on function public.stack127_wake_cache_worker(boolean) from public, anon, authenticated;

update public.stack127_cache_worker_wake set function_url = null where id;

-- Dynamic SQL avoids resolving cron.job on targets without pg_cron. Checks are
-- inside the transaction, so failed verification rolls back the switch.
do $$
declare
  cron_jobs bigint := 0;
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    execute 'select count(*) from cron.job where jobname = ''stack127-cache-worker''' into cron_jobs;
  end if;
  if not exists (select 1 from public.stack127_cache_worker_wake where id and function_url is null)
    or exists (select 1 from pg_trigger where tgname = 'stack127_wake_cache_worker'
      and not tgisinternal and tgrelid = 'public.stack127_revalidation_events'::regclass)
    or to_regprocedure('public.stack127_queue_wake_cache_worker()') is not null
    or cron_jobs <> 0 then
    raise exception 'Cache worker wake retirement did not verify';
  end if;
  raise notice 'Cache worker wake retired; cron jobs: %', cron_jobs;
end;
$$;

commit;
