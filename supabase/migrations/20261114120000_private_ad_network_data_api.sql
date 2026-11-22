begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

create schema if not exists stack127_data;
revoke all on schema stack127_data from public, anon, authenticated;
-- Owner-executed, security-barrier projections for code-controlled queries.
-- No custom roles or membership changes: production cannot CREATE ROLE.
create or replace view stack127_data.ad_networks with (security_barrier=true) as
  select id,slug,name,official_url,summary from public.ad_networks;
create or replace view stack127_data.ad_network_publishers with (security_barrier=true) as
  select id,normalized_domain,niche,platform,domain_created_on,traffic_group,last_successful_check_at,
    case when ads_txt_summary is not null then jsonb_build_object(
      'lines',ads_txt_summary->'lines','direct',ads_txt_summary->'direct',
      'reseller',ads_txt_summary->'reseller','invalid',ads_txt_summary->'invalid',
      'top_sellers',ads_txt_summary->'top_sellers') end as ads_txt_summary
  from public.ad_network_publishers p
  where exists(select 1 from public.ad_network_publisher_relationships r
    where r.publisher_id=p.id and r.status in ('confirmed','stale','ended'));
create or replace view stack127_data.ad_network_publisher_relationships with (security_barrier=true) as
  select ad_network_id,publisher_id,status,relationship_type,first_confirmed_at,last_confirmed_at,ended_at
  from public.ad_network_publisher_relationships where status in ('confirmed','stale','ended');
create or replace view stack127_data.ad_network_relationship_events with (security_barrier=true) as
  select ad_network_id,publisher_id,event,observed_at,relationship_type
  from public.ad_network_relationship_events where event in ('joined','left','newly_found');
create or replace view stack127_data.ad_network_daily_counts with (security_barrier=true) as
  select ad_network_id,snapshot_on,listed_count,confirmed_count,stale_count,captured_at
  from public.ad_network_daily_counts;
create or replace view stack127_data.dataset_summary with (security_barrier=true) as
  select count(*) filter(where last_successful_check_at is not null)::int as sites_checked,
    min(last_successful_check_at) as oldest_site_check,max(last_successful_check_at) as newest_site_check,
    greatest(max(last_successful_check_at),(select max(observed_at) from public.ad_network_relationship_events),
      (select max(captured_at) from public.ad_network_daily_counts)) as as_of
  from public.ad_network_publishers;
revoke all on all tables in schema stack127_data from public,anon,authenticated;

create schema if not exists stack127_api;
revoke all on schema stack127_api from public,anon,authenticated;
create table if not exists stack127_api.rate_limits (
  principal text primary key,
  minute_on timestamptz not null,
  day_on timestamptz not null,
  minute_count integer not null check(minute_count>=0),
  day_count integer not null check(day_count>=0)
);
alter table stack127_api.rate_limits enable row level security;
revoke all on stack127_api.rate_limits from public,anon,authenticated;
-- Production uses stack127_app; managed development uses postgres.
-- Anonymous API roles have no access to projections or counters.
do $$ declare app_role text; begin
  foreach app_role in array array['stack127_app','postgres'] loop
    if exists(select 1 from pg_roles where rolname=app_role) then
      execute format('grant usage on schema stack127_data to %I',app_role);
      execute format('grant select on all tables in schema stack127_data to %I',app_role);
      execute format('grant usage on schema stack127_api to %I',app_role);
      execute format('grant select,insert,update on stack127_api.rate_limits to %I',app_role);
      execute format('drop policy if exists %I on stack127_api.rate_limits','rate_limits_'||app_role);
      execute format('create policy %I on stack127_api.rate_limits for all to %I using (true) with check (true)',
        'rate_limits_'||app_role,app_role);
    end if;
  end loop;
end $$;
commit;
