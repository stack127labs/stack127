-- The cache worker runs as a Supabase Edge Function. Queued changes wake it
-- right away, and a 30-second schedule wakes it again if a wake-up is missed.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- first_queued_at keeps the age of repeated changes for the 60-second limit and
-- the stale-queue alert. created_at still moves forward on every repeat change.
alter table public.stack127_revalidation_events
  add column first_queued_at timestamptz not null default now(),
  add column next_attempt_at timestamptz not null default now();

create index stack127_revalidation_events_first_queued_idx
  on public.stack127_revalidation_events (first_queued_at, id);

create or replace function public.stack127_enqueue_revalidation(p_type text, p_slug text, p_source text)
returns void language plpgsql set search_path = pg_catalog, public as $$
begin
  if p_slug is null then return; end if;
  insert into public.stack127_revalidation_events (entity_type, slug, source)
  values (p_type, lower(trim(both '/' from p_slug)), p_source)
  on conflict (entity_type, slug) do update set
    source = excluded.source,
    created_at = now(),
    attempts = 0,
    last_error = null,
    next_attempt_at = now();
end;
$$;

-- Wake-ups use their own row so a long import holding this lock never blocks
-- the worker's lease. function_url stays empty until an environment is set up.
create table public.stack127_cache_worker_wake (
  id boolean primary key default true check (id),
  function_url text check (function_url ~ '^https://[a-z0-9.-]+/functions/v1/cache-worker$'),
  last_wake_at timestamptz not null default '-infinity'
);

create table public.stack127_cache_worker_state (
  id boolean primary key default true check (id),
  lease_id uuid,
  lease_until timestamptz,
  last_run_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  alert_issue_number integer
);

insert into public.stack127_cache_worker_wake (id) values (true);
insert into public.stack127_cache_worker_state (id) values (true);

alter table public.stack127_cache_worker_wake enable row level security;
alter table public.stack127_cache_worker_state enable row level security;
revoke all on public.stack127_cache_worker_wake from public, anon, authenticated;
revoke all on public.stack127_cache_worker_state from public, anon, authenticated;
grant select, update on public.stack127_cache_worker_wake to service_role;
grant select, update on public.stack127_cache_worker_state to service_role;

-- p_force skips the 5-second wake limit. The schedule and manual runs use it.
create function public.stack127_wake_cache_worker(p_force boolean default false)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  worker_url text;
  key text;
begin
  select wake.function_url into worker_url
  from public.stack127_cache_worker_wake wake
  where wake.id
    and wake.function_url is not null
    and (p_force or wake.last_wake_at < clock_timestamp() - interval '5 seconds')
  for update skip locked;
  if worker_url is null then return; end if;

  select credential.signing_key into key
  from public.stack127_cache_credentials credential
  where credential.id;
  if key is null then return; end if;

  update public.stack127_cache_worker_wake set last_wake_at = clock_timestamp() where id;
  perform net.http_post(
    url := worker_url,
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || encode(extensions.hmac('stack127-cache-worker-v1', key, 'sha256'), 'hex')
    ),
    timeout_milliseconds := 5000
  );
end;
$$;
revoke all on function public.stack127_wake_cache_worker(boolean) from public, anon, authenticated;
grant execute on function public.stack127_wake_cache_worker(boolean) to service_role;

create function public.stack127_queue_wake_cache_worker()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  perform public.stack127_wake_cache_worker(false);
  return null;
end;
$$;

-- Only new or repeated changes wake the worker. Its own retry bookkeeping
-- updates other columns and does not wake it again.
create trigger stack127_wake_cache_worker
after insert or update of created_at on public.stack127_revalidation_events
for each statement execute function public.stack127_queue_wake_cache_worker();

select cron.schedule(
  'stack127-cache-worker',
  '30 seconds',
  'select public.stack127_wake_cache_worker(true)'
);
