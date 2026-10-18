-- Bounded report inputs preserve manager ambiguity and retained confirmations.
-- Full evidence remains unchanged and is still used for individual site proofs.
create function public.stack127_ad_network_report_manager_domains(evidence jsonb)
returns jsonb language sql immutable parallel safe set search_path=pg_catalog as $$
  with entries as (
    select case when jsonb_typeof(item)='string' then item #>> '{}'
      when jsonb_typeof(item->'value')='string' then item->>'value' end as raw
    from jsonb_array_elements(case when jsonb_typeof(evidence->'manager_domains')='array'
      then evidence->'manager_domains' else '[]'::jsonb end) item
  ), normalized as (
    select distinct lower(regexp_replace(regexp_replace(raw,'^\s+|\s+$','','g'),'\.$','')) as value
    from entries where raw is not null
  ), domains as (select value from normalized where value<>'' order by value limit 2)
  select case when count(*)=0 then '[]'::jsonb
    when count(*)>1 then '["__ambiguous_one__","__ambiguous_two__"]'::jsonb
    when length(max(value))>253 then '["__unmapped_manager__"]'::jsonb
    else jsonb_agg(value) end from domains
$$;

create function public.stack127_ad_network_report_retained_manager(evidence jsonb)
returns text language sql immutable parallel safe set search_path=pg_catalog as $$
  with inputs as (
    select case when jsonb_typeof(evidence->'manager_domain')='string' then evidence->>'manager_domain' end as retained,
      case when jsonb_typeof(evidence->'matched_signal')='string' then
        substring(evidence->>'matched_signal' from '(?i)^MANAGERDOMAIN\s*=\s*([^,\s]+)') end as signal
  ), normalized as (
    select coalesce(nullif(lower(regexp_replace(regexp_replace(retained,'^\s+|\s+$','','g'),'\.$','')),''),
      nullif(lower(regexp_replace(regexp_replace(signal,'^\s+|\s+$','','g'),'\.$','')),'')) as value from inputs
  ) select case when length(value)>253 then '__unmapped_manager__' else value end from normalized
$$;

revoke all on function public.stack127_ad_network_report_manager_domains(jsonb),
  public.stack127_ad_network_report_retained_manager(jsonb) from public,anon,authenticated;
grant execute on function public.stack127_ad_network_report_manager_domains(jsonb),
  public.stack127_ad_network_report_retained_manager(jsonb) to service_role;

alter table public.ad_network_publishers
  add column report_manager_domains jsonb generated always as
    (public.stack127_ad_network_report_manager_domains(last_check_evidence)) stored,
  add column report_has_ads_txt_summary boolean generated always as (ads_txt_summary is not null) stored;
alter table public.ad_network_publisher_relationships
  add column report_retained_manager text generated always as
    (public.stack127_ad_network_report_retained_manager(evidence)) stored;

create index ad_network_publishers_manager_report_idx on public.ad_network_publishers(id)
  include (report_manager_domains,report_has_ads_txt_summary,traffic_group,niche);
create index ad_network_relationships_manager_report_idx on public.ad_network_publisher_relationships(publisher_id,ad_network_id)
  include (status,relationship_type,report_retained_manager) where status in ('confirmed','stale');
