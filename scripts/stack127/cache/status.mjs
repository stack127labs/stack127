import pg from "pg";
import { appendFile } from "node:fs/promises";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
try {
  const result = await pool.query(`select wake.function_url is not null as enabled,
    state.last_run_at,state.last_success_at,state.last_error,
    observation.healthy_since,observation.last_check_at,observation.last_reconcile_at,observation.long_ttl_enabled_at,
    (select count(*)::int from public.stack127_revalidation_events) as pending,
    (select min(first_queued_at) from public.stack127_revalidation_events) as oldest,
    observation.healthy_since <= now()-interval '1 day' and observation.last_check_at>=now()-interval '2 minutes'
      and observation.last_reconcile_at>=now()-interval '16 minutes' and state.last_error is null
      and wake.function_url is not null
      and not exists(select 1 from public.stack127_revalidation_events where first_queued_at<now()-interval '2 minutes') as github_schedule_can_retire,
    observation.healthy_since <= now()-interval '7 days' and observation.last_check_at>=now()-interval '2 minutes'
      and observation.last_reconcile_at>=now()-interval '16 minutes' and state.last_error is null and wake.function_url is not null
      and not exists(select 1 from public.stack127_revalidation_events where first_queued_at<now()-interval '2 minutes') as longer_ttl_ready
    from public.stack127_cache_worker_wake wake
    join public.stack127_cache_worker_state state using(id)
    join public.stack127_cache_observation observation using(id)
    where wake.id`);
  console.log(JSON.stringify(result.rows[0], null, 2));
  if (process.env.GITHUB_OUTPUT) {
    const state = result.rows[0];
    await appendFile(process.env.GITHUB_OUTPUT, `backup_needed=${!state.github_schedule_can_retire}\nlong_ttl_ready=${Boolean(state.longer_ttl_ready && !state.long_ttl_enabled_at)}\nlong_ttl_enabled=${Boolean(state.long_ttl_enabled_at)}\n`);
  }
} finally { await pool.end(); }
