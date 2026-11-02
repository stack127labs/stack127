begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

alter table public.github_projects
  add column last_attempt_at timestamptz,
  add column consecutive_failures integer not null default 0
    check (consecutive_failures >= 0);

comment on column public.github_projects.last_attempt_at is
  'Last GitHub fetch attempt, successful or failed; checked_at remains the last successful fact refresh.';
comment on column public.github_projects.consecutive_failures is
  'Consecutive failed GitHub fetches, reset only after a successful fact refresh.';

create index github_projects_refresh_attempt_idx
  on public.github_projects (greatest(last_attempt_at, checked_at) nulls first);

-- Keep provider metadata private. Existing backend RLS policies still apply.
revoke all on public.github_projects from anon, authenticated;
grant select, insert, update on public.github_projects to service_role;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'stack127_app') then
    grant select, insert, update on public.github_projects to stack127_app;
  end if;
end;
$$;

commit;
