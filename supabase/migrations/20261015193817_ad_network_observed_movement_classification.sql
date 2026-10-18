begin;
set local lock_timeout='10s';
set local statement_timeout='120s';

-- Imported first confirmations never prove that a network was absent before.
alter table public.ad_network_relationship_events drop constraint ad_network_relationship_events_event_check;
alter table public.ad_network_relationship_events add constraint ad_network_relationship_events_event_check
  check(event in ('baseline','newly_found','joined','left'));
update public.ad_network_relationship_events set event='baseline' where event='joined';

-- Retain a successful check's full confirmed-network set before the next sync
-- overwrites publisher evidence. A failed fetch cannot establish absence.
create table public.ad_network_check_observations (
  publisher_id bigint primary key references public.ad_network_publishers(id) on delete restrict,
  checked_at timestamptz not null,
  confirmed_network_ids bigint[] not null
);
alter table public.ad_network_check_observations enable row level security;
revoke all on public.ad_network_check_observations from public,anon,authenticated;
grant select,insert,update,delete on public.ad_network_check_observations to service_role;

insert into public.ad_network_check_observations(publisher_id,checked_at,confirmed_network_ids)
select p.id,p.last_checked_at,array(select n.id from public.ad_networks n
  where coalesce(p.last_check_evidence->'confirmed_networks','[]'::jsonb) ? n.slug order by n.id)
from public.ad_network_publishers p
where p.last_check_outcome in ('matched','no_match','no_ads_txt','not_modified')
  and p.last_checked_at=p.last_successful_check_at
  and exists(select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale','ended'));

-- Departures use the verifier's ended_at, after repeated successful misses.
-- Arrival events are now recorded by sync after comparison with the prior check.
create or replace function public.ad_network_record_relationship_event()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
  insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
  select ad_network_id,publisher_id,'left',ended_at,relationship_type from new_rows
  where status='ended' and ended_at is not null
  on conflict do nothing;
  return null;
end;
$$;
revoke all on function public.ad_network_record_relationship_event() from public,anon,authenticated;
grant execute on function public.ad_network_record_relationship_event() to service_role;
notify pgrst,'reload schema';
commit;
