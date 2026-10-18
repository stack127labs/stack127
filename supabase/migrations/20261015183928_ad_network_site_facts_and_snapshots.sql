begin;
set local lock_timeout = '10s';
set local statement_timeout = '120s';

alter table public.ad_network_publishers
  add column niche text,
  add column publisher_name text,
  add column platform text,
  add column domain_created_on date,
  add column traffic_group text,
  add column ads_txt_summary jsonb,
  add column favicon text,
  add constraint ad_network_publishers_niche_check check (niche in (
    'food','home-diy','travel','parenting','personal-finance','health-fitness',
    'beauty-fashion','gaming','tech','crafts','pets','outdoors','gardening','sports',
    'entertainment','lifestyle','education','automotive','business','news')),
  add constraint ad_network_publishers_traffic_check check (traffic_group in ('top-10k','top-100k','top-1m','not-ranked')),
  add constraint ad_network_publishers_summary_check check (ads_txt_summary is null or (
    jsonb_typeof(ads_txt_summary) = 'object' and
    ads_txt_summary ?& array['lines','companies','direct','reseller','invalid','top_sellers'] and
    jsonb_typeof(ads_txt_summary->'top_sellers') = 'array' and
    jsonb_array_length(ads_txt_summary->'top_sellers') <= 20 and
    (ads_txt_summary->>'lines')::integer >= 0 and (ads_txt_summary->>'companies')::integer >= 0 and
    (ads_txt_summary->>'direct')::integer >= 0 and (ads_txt_summary->>'reseller')::integer >= 0 and
    (ads_txt_summary->>'invalid')::integer >= 0));
create index ad_network_publishers_niche_idx on public.ad_network_publishers(niche, normalized_domain);
create index ad_network_publishers_traffic_idx on public.ad_network_publishers(traffic_group, normalized_domain);

-- Snapshot dates start when we actually measure the dataset. Never backfill invented counts.
create table public.ad_network_daily_counts (
  ad_network_id bigint not null references public.ad_networks(id) on delete restrict,
  snapshot_on date not null,
  listed_count integer not null check (listed_count >= 0),
  confirmed_count integer not null check (confirmed_count >= 0),
  stale_count integer not null check (stale_count >= 0),
  captured_at timestamptz not null default now(),
  primary key(ad_network_id, snapshot_on),
  check(listed_count = confirmed_count + stale_count)
);
alter table public.ad_network_daily_counts enable row level security;
revoke all on public.ad_network_daily_counts from public, anon, authenticated;
grant select, insert, update, delete on public.ad_network_daily_counts to service_role;
-- Existing tables remain server-only, including the added evidence-derived columns.
revoke all on public.ad_network_publishers, public.ad_network_publisher_relationships from public, anon, authenticated;

-- Retain each observed join and departure, including a later return to the same network.
-- Initial observations can be seeded from the verifier's first_confirmed_at and ended_at.
create table public.ad_network_relationship_events (
  ad_network_id bigint not null references public.ad_networks(id) on delete restrict,
  publisher_id bigint not null references public.ad_network_publishers(id) on delete restrict,
  event text not null check(event in ('joined','left')),
  observed_at timestamptz not null,
  relationship_type text not null check(relationship_type in ('primary_or_exclusive_manager','active_network_use','unknown')),
  primary key(ad_network_id,publisher_id,event,observed_at)
);
create index ad_network_relationship_events_date_idx on public.ad_network_relationship_events(observed_at,ad_network_id);
alter table public.ad_network_relationship_events enable row level security;
revoke all on public.ad_network_relationship_events from public, anon, authenticated;
grant select, insert, update, delete on public.ad_network_relationship_events to service_role;

create function public.ad_network_record_relationship_event()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
begin
  if tg_op='UPDATE' then
    insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
    select n.ad_network_id,n.publisher_id,'joined',n.last_confirmed_at,n.relationship_type
    from new_rows n join old_rows o using(ad_network_id,publisher_id)
    where o.status='ended' and n.status='confirmed'
    on conflict do nothing;
  end if;
  insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
  select ad_network_id,publisher_id,'joined',first_confirmed_at,relationship_type from new_rows
  where status in ('confirmed','stale','ended') and first_confirmed_at is not null
  on conflict do nothing;
  insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
  select ad_network_id,publisher_id,'left',ended_at,relationship_type from new_rows
  where status='ended' and ended_at is not null
  on conflict do nothing;
  return null;
end;
$$;
revoke all on function public.ad_network_record_relationship_event() from public,anon,authenticated;
grant execute on function public.ad_network_record_relationship_event() to service_role;
create trigger ad_network_record_relationship_insert after insert on public.ad_network_publisher_relationships
referencing new table as new_rows for each statement execute function public.ad_network_record_relationship_event();
create trigger ad_network_record_relationship_update after update on public.ad_network_publisher_relationships
referencing old table as old_rows new table as new_rows for each statement execute function public.ad_network_record_relationship_event();

create or replace function public.stack127_directory_record_value(p_table text, p_row jsonb)
returns jsonb language plpgsql immutable security invoker set search_path = pg_catalog as $$
begin
  case p_table
    when 'ad_network_publishers' then
      return p_row - array['created_at','updated_at','next_check_at','lease_until','verification_priority','check_attempt_count','consecutive_failures','discovery_sources','last_discovered_at','ads_txt_hash','ads_txt_etag','ads_txt_last_modified'];
    when 'ad_network_publisher_relationships' then
      if p_row->>'status' not in ('confirmed','stale','ended') then return null; end if;
      return p_row - array['created_at','updated_at','consecutive_misses','first_missed_at','last_missed_at','evidence','verification_method'];
    when 'ad_networks' then
      return jsonb_build_object('id',p_row->'id','slug',p_row->'slug','name',p_row->'name',
        'official_url',p_row->'official_url','summary',p_row->'summary');
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


-- Shared reports use all networks. Compare public values at statement level so identical
-- reloads and verifier bookkeeping do not queue refreshes or move public dates.
create function public.stack127_touch_ad_network_reports()
returns trigger language plpgsql security invoker set search_path = pg_catalog as $$
declare changed boolean; route text;
begin
  if tg_op='INSERT' then
    execute format('select exists(select 1 from new_rows r where public.stack127_directory_record_value(%L,to_jsonb(r)) is not null and (%L<>''ad_network_publishers'' or exists(select 1 from public.ad_network_publisher_relationships rel where rel.publisher_id=(to_jsonb(r)->>''id'')::bigint and rel.status in (''confirmed'',''stale'',''ended''))))',tg_table_name,tg_table_name) into changed;
  elsif tg_op='DELETE' then
    execute format('select exists(select 1 from old_rows r where public.stack127_directory_record_value(%L,to_jsonb(r)) is not null and (%L<>''ad_network_publishers'' or exists(select 1 from public.ad_network_publisher_relationships rel where rel.publisher_id=(to_jsonb(r)->>''id'')::bigint and rel.status in (''confirmed'',''stale'',''ended''))))',tg_table_name,tg_table_name) into changed;
  else
    execute format('with a as (select public.stack127_directory_record_value(%L,to_jsonb(r)) v from old_rows r),
      b as (select public.stack127_directory_record_value(%L,to_jsonb(r)) v from new_rows r)
      select exists(select 1 from ((select v from a except select v from b) union (select v from b except select v from a)) d where v is not null and (%L<>''ad_network_publishers'' or exists(select 1 from public.ad_network_publisher_relationships rel where rel.publisher_id=(v->>''id'')::bigint and rel.status in (''confirmed'',''stale'',''ended''))))',tg_table_name,tg_table_name,tg_table_name) into changed;
  end if;
  if not changed then return null; end if;
  perform public.stack127_enqueue_revalidation('ad_networks','all',tg_table_name);
  for route in select slug from public.stack127_pages where slug='ad-networks' or slug like 'ad-networks/%' or slug='ad-network-checker' order by slug loop
    perform public.stack127_touch_page(route,tg_table_name);
  end loop;
  return null;
end;
$$;
revoke all on function public.stack127_touch_ad_network_reports() from public,anon,authenticated;
grant execute on function public.stack127_touch_ad_network_reports() to service_role;
DO $$
declare tab text;
begin
  foreach tab in array array['ad_networks','ad_network_publishers','ad_network_publisher_relationships','ad_network_daily_counts','ad_network_relationship_events'] loop
    execute format('create trigger stack127_ad_reports_insert after insert on public.%I referencing new table as new_rows for each statement execute function public.stack127_touch_ad_network_reports()',tab);
    execute format('create trigger stack127_ad_reports_update after update on public.%I referencing old table as old_rows new table as new_rows for each statement execute function public.stack127_touch_ad_network_reports()',tab);
    execute format('create trigger stack127_ad_reports_delete after delete on public.%I referencing old table as old_rows for each statement execute function public.stack127_touch_ad_network_reports()',tab);
  end loop;
end;
$$;
notify pgrst, 'reload schema';
commit;
