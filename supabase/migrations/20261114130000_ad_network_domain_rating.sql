begin;
set local lock_timeout='10s';
set local statement_timeout='120s';
-- Add nullable columns without scanning existing publishers under ACCESS EXCLUSIVE.
-- Reruns keep existing data, but reject an incompatible pre-existing schema.
do $$
declare column_name text; expected_type regtype; actual_type oid;
begin
  for column_name, expected_type in select * from (values
    ('domain_rating', 'integer'::regtype), ('domain_rating_checked_on', 'date'::regtype)) as columns(name, type)
  loop
    select atttypid into actual_type from pg_attribute
      where attrelid='public.ad_network_publishers'::regclass and attname=column_name and not attisdropped;
    if found and actual_type <> expected_type::oid then
      raise exception 'public.ad_network_publishers.% has type %, expected %', column_name, actual_type::regtype, expected_type;
    end if;
  end loop;
end $$;
alter table public.ad_network_publishers
  add column if not exists domain_rating integer,
  add column if not exists domain_rating_checked_on date;
do $$ begin
  if not exists(select 1 from pg_constraint where conrelid='public.ad_network_publishers'::regclass
    and conname='ad_network_publishers_domain_rating_check') then
    alter table public.ad_network_publishers add constraint ad_network_publishers_domain_rating_check
      check(domain_rating between 0 and 100) not valid;
  end if;
end $$;
comment on column public.ad_network_publishers.domain_rating is
  'Rounded Ahrefs dr3 estimate for pages and APIs. Display with linked Domain Rating by Ahrefs credit. Unknown is null.';

create or replace view stack127_data.ad_network_publishers with (security_barrier=true) as
  select id,normalized_domain,niche,platform,domain_created_on,traffic_group,last_successful_check_at,
    case when ads_txt_summary is not null then jsonb_build_object(
      'lines',ads_txt_summary->'lines','direct',ads_txt_summary->'direct',
      'reseller',ads_txt_summary->'reseller','invalid',ads_txt_summary->'invalid',
      'top_sellers',ads_txt_summary->'top_sellers') end as ads_txt_summary,
    p.domain_rating,p.domain_rating_checked_on
  from public.ad_network_publishers p
  where exists(select 1 from public.ad_network_publisher_relationships r
    where r.publisher_id=p.id and r.status in ('confirmed','stale','ended'));
revoke all on stack127_data.ad_network_publishers from public,anon,authenticated;

create or replace view stack127_data.dataset_summary with (security_barrier=true) as
  select count(*) filter(where last_successful_check_at is not null)::int as sites_checked,
    min(last_successful_check_at) as oldest_site_check,max(last_successful_check_at) as newest_site_check,
    greatest(max(last_successful_check_at),(select max(observed_at) from public.ad_network_relationship_events),
      (select max(captured_at) from public.ad_network_daily_counts)) as as_of,
    count(*) filter(where domain_rating is not null and exists(select 1 from public.ad_network_publisher_relationships r
      where r.publisher_id=ad_network_publishers.id and r.status in ('confirmed','stale')))::int as domain_rating_base,
    count(*) filter(where exists(select 1 from public.ad_network_publisher_relationships r
      where r.publisher_id=ad_network_publishers.id and r.status in ('confirmed','stale')))::int as domain_rating_total
  from public.ad_network_publishers;

-- Pages and APIs display DR with linked attribution. DR-only writes do not
-- move the frontend revision or enqueue a rebuild. The daily snapshot always
-- inserts a dated row and queues the refresh that publishes new DR each day.
-- Other enrichment and relationship changes still queue their normal refresh.
create or replace function public.stack127_directory_record_value(p_table text, p_row jsonb)
returns jsonb language plpgsql immutable security invoker set search_path = pg_catalog as $$
begin
  case p_table
    when 'ad_network_publishers' then
      return p_row - array['created_at','updated_at','next_check_at','lease_until','verification_priority','check_attempt_count','consecutive_failures','last_discovered_at','ads_txt_hash','ads_txt_etag','ads_txt_last_modified','domain_rating','domain_rating_checked_on'];
    when 'ad_network_publisher_relationships' then
      if p_row->>'status' not in ('confirmed','stale','ended') then return null; end if;
      -- Verification mix and retained manager evidence are public report inputs.
      return (p_row - array['created_at','updated_at','consecutive_misses','first_missed_at','last_missed_at','evidence'])
        || jsonb_build_object('manager_evidence',jsonb_build_object(
          'manager_domain',p_row->'evidence'->'manager_domain',
          'matched_signal',p_row->'evidence'->'matched_signal'));
    when 'ad_networks' then
      return jsonb_build_object('id',p_row->'id','slug',p_row->'slug','name',p_row->'name',
        'official_url',p_row->'official_url','summary',p_row->'summary',
        'manager_domains',p_row->'manager_domains','ad_system_domains',p_row->'ad_system_domains');
    when 'launch_directories' then
      if p_row->>'is_published' <> 'true' then return null; end if;
      return p_row - array['created_at','updated_at','research_notes'];
    when 'terminal_apps' then
      if p_row->>'published' <> 'true' then return null; end if;
      return p_row - array['created_at','updated_at','self_host_app_id'];
    when 'self_host_apps' then
      if p_row->>'published' <> 'true' or p_row->>'self_hosting_status' <> 'self_hostable' then return null; end if;
      return p_row - array['created_at','updated_at','data_checked_at','data_confidence','data_source_urls',
        'source_repo_id','github_repo_id','github_node_id','github_full_name','github_owner_type',
        'source_full_name','source_watchers','source_open_issues','source_languages','source_updated_at',
        'source_default_branch','source_repo_size_kb','source_disabled','source_is_fork','source_is_template',
        'github_watchers','github_open_issues','github_languages','github_updated_at','github_default_branch',
        'github_repo_size_kb','github_disabled','github_is_fork','github_is_template'];
    when 'github_projects' then
      return jsonb_build_object('id',p_row->'id','owner',p_row->'owner','repo',p_row->'repo',
        'stars',p_row->'stars','forks',p_row->'forks','primary_language',p_row->'primary_language','topics',p_row->'topics',
        'created_at',p_row->'created_at','pushed_at',p_row->'pushed_at','latest_release',p_row->'latest_release',
        'latest_release_at',p_row->'latest_release_at','last_commit_at',p_row->'last_commit_at',
        'checked_at',p_row->'checked_at','archived',p_row->'archived');
    when 'self_host_app_install_options' then
      return jsonb_build_object('app_id',p_row->'app_id','options',p_row->'options');
    else
      return p_row - array['created_at','updated_at','row_updated_at'];
  end case;
end;
$$;
revoke all on function public.stack127_directory_record_value(text,jsonb) from public, anon, authenticated;
grant execute on function public.stack127_directory_record_value(text,jsonb) to service_role;

commit;

-- Release ACCESS EXCLUSIVE before scanning the existing rows. VALIDATE takes
-- SHARE UPDATE EXCLUSIVE, allowing normal reads and writes during validation.
-- https://www.postgresql.org/docs/current/sql-altertable.html#SQL-ALTERTABLE-NOTES
begin;
set local lock_timeout='10s';
set local statement_timeout='120s';
do $$ begin
  if exists(select 1 from pg_constraint where conrelid='public.ad_network_publishers'::regclass
    and conname='ad_network_publishers_domain_rating_check' and not convalidated) then
    alter table public.ad_network_publishers validate constraint ad_network_publishers_domain_rating_check;
  end if;
end $$;
commit;
