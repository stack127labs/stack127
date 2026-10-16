-- Rejected discovery candidates never established use and cannot depart.
create or replace function public.ad_network_record_relationship_event()
returns trigger language plpgsql security invoker set search_path=pg_catalog as $$
begin
  insert into public.ad_network_relationship_events(ad_network_id,publisher_id,event,observed_at,relationship_type)
  select ad_network_id,publisher_id,'left',ended_at,relationship_type from new_rows
  where status='ended' and ended_at is not null and first_confirmed_at is not null
  on conflict do nothing;
  return null;
end;
$$;
revoke all on function public.ad_network_record_relationship_event() from public,anon,authenticated;
grant execute on function public.ad_network_record_relationship_event() to service_role;

delete from public.ad_network_relationship_events e
using public.ad_network_publisher_relationships r
where e.ad_network_id=r.ad_network_id and e.publisher_id=r.publisher_id
  and e.event='left' and r.first_confirmed_at is null;

delete from public.ad_network_publisher_relationships
where status='ended' and first_confirmed_at is null;
