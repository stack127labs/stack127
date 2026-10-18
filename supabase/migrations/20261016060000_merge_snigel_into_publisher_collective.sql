begin;
set local lock_timeout='10s';
set local statement_timeout='120s';
-- Serialize against reviewed syncs. Source refresh triggers remain enabled.
select pg_advisory_xact_lock(hashtext('ad-networks-reviewed-sync'));

do $$
declare source_id bigint; target_id bigint;
begin
  select id into source_id from public.ad_networks where slug='snigel';
  select id into target_id from public.ad_networks where slug='publisher-collective';
  if target_id is null then
    if source_id is not null then raise exception 'Cannot retire Snigel without Publisher Collective'; end if;
    return; -- A genuinely empty database has no identity or history to merge.
  end if;
  update public.ad_networks set
    manager_domains=array(select distinct d from unnest(manager_domains || array['snigelweb.com']) d order by d),
    ad_system_domains=array(select distinct d from unnest(ad_system_domains || array['snigelweb.com']) d order by d),
    identity_reviewed_at='2026-10-16T00:00:00Z',
    identity_sources=(select coalesce(jsonb_agg(distinct s),'[]'::jsonb) from jsonb_array_elements(
      identity_sources || coalesce((select identity_sources from public.ad_networks where id=source_id),'[]'::jsonb)
      || '[{"kind":"official_merger","url":"https://www.publisher-collective.com/blog/snigel-and-publisher-collective-939e2"},{"kind":"official_company","url":"https://publisher-collective.com/about"}]'::jsonb) s)
  where id=target_id and (source_id is not null or not manager_domains @> array['snigelweb.com'] or not ad_system_domains @> array['snigelweb.com']);
  if source_id is null then return; end if;

  -- Pick the strongest status, then the most recent confirmation. Preserve
  -- the original evidence of both rows and their earliest/latest dates.
  create temp table merged_snigel_relationships on commit drop as
  select distinct on (r.publisher_id) r.*,
    min(first_confirmed_at) over w as merged_first,
    max(last_confirmed_at) over w as merged_last,
    min(created_at) over w as merged_created,
    jsonb_agg(jsonb_build_object('ad_network_id',ad_network_id,'status',status,
      'relationship_type',relationship_type,'verification_method',verification_method,'evidence',evidence,
      'first_confirmed_at',first_confirmed_at,'last_confirmed_at',last_confirmed_at,'ended_at',ended_at)) over w as original_rows
  from public.ad_network_publisher_relationships r
  where r.ad_network_id in (source_id,target_id)
    and exists(select 1 from public.ad_network_publisher_relationships s where s.ad_network_id=source_id and s.publisher_id=r.publisher_id)
  window w as (partition by r.publisher_id)
  order by r.publisher_id,case r.status when 'confirmed' then 4 when 'stale' then 3 when 'ended' then 2 else 1 end desc,
    r.last_confirmed_at desc nulls last,r.updated_at desc,r.ad_network_id desc;

  -- A relabel is not an observed departure/arrival. Suppress only the event
  -- writers during the move; all date and cache-refresh triggers still run.
  alter table public.ad_network_publisher_relationships disable trigger ad_network_record_relationship_insert;
  alter table public.ad_network_publisher_relationships disable trigger ad_network_record_relationship_update;
  insert into public.ad_network_publisher_relationships as r(ad_network_id,publisher_id,status,relationship_type,
    verification_method,evidence,first_confirmed_at,last_confirmed_at,ended_at,consecutive_misses,
    first_missed_at,last_missed_at,created_at,updated_at)
  select target_id,publisher_id,status,relationship_type,verification_method,
    evidence || jsonb_build_object('identity_merge',jsonb_build_object('from','snigel','into','publisher-collective','previous_relationships',original_rows)),
    merged_first,merged_last,case when status='ended' then ended_at else null end,
    consecutive_misses,first_missed_at,last_missed_at,merged_created,updated_at
  from merged_snigel_relationships
  on conflict(ad_network_id,publisher_id) do update set
    status=excluded.status,relationship_type=excluded.relationship_type,verification_method=excluded.verification_method,
    evidence=excluded.evidence,first_confirmed_at=excluded.first_confirmed_at,last_confirmed_at=excluded.last_confirmed_at,
    ended_at=excluded.ended_at,consecutive_misses=excluded.consecutive_misses,
    first_missed_at=excluded.first_missed_at,last_missed_at=excluded.last_missed_at,created_at=excluded.created_at;
  delete from public.ad_network_publisher_relationships where ad_network_id=source_id;
  alter table public.ad_network_publisher_relationships enable trigger ad_network_record_relationship_insert;
  alter table public.ad_network_publisher_relationships enable trigger ad_network_record_relationship_update;

  -- Keep each existing event's kind and timestamp. Collapse exact duplicates.
  insert into public.ad_network_relationship_events as e(ad_network_id,publisher_id,event,observed_at,relationship_type)
  select target_id,publisher_id,event,observed_at,relationship_type from public.ad_network_relationship_events where ad_network_id=source_id
  on conflict(ad_network_id,publisher_id,event,observed_at) do update set relationship_type=case
    when e.relationship_type='primary_or_exclusive_manager' or excluded.relationship_type='primary_or_exclusive_manager' then 'primary_or_exclusive_manager'
    when e.relationship_type='active_network_use' or excluded.relationship_type='active_network_use' then 'active_network_use' else 'unknown' end;
  delete from public.ad_network_relationship_events where ad_network_id=source_id;
  update public.ad_network_check_observations set confirmed_network_ids=array(
    select distinct case when id=source_id then target_id else id end from unnest(confirmed_network_ids) id order by 1)
  where source_id=any(confirmed_network_ids);
  update public.ad_network_publishers p set last_check_evidence=p.last_check_evidence || jsonb_build_object(
    'confirmed_networks',(select coalesce(jsonb_agg(distinct case when value='snigel' then 'publisher-collective' else value end),'[]'::jsonb)
      from jsonb_array_elements_text(coalesce(p.last_check_evidence->'confirmed_networks','[]'::jsonb))),
    'review_networks',(select coalesce(jsonb_agg(distinct case when value='snigel' then 'publisher-collective' else value end),'[]'::jsonb)
      from jsonb_array_elements_text(coalesce(p.last_check_evidence->'review_networks','[]'::jsonb))))
  where coalesce(p.last_check_evidence->'confirmed_networks','[]'::jsonb) ? 'snigel'
    or coalesce(p.last_check_evidence->'review_networks','[]'::jsonb) ? 'snigel';

  -- Old aggregates do not retain daily membership, so summing them invents
  -- duplicate sites. Remove both series; the next sync measures a real count.
  delete from public.ad_network_daily_counts where ad_network_id in (source_id,target_id);
  update public.ad_networks set parent_network_id=target_id where parent_network_id=source_id;
  delete from public.ad_networks where id=source_id;
end;
$$;
-- Registry retirement is a separate reviewed directory-publisher batch.
commit;
