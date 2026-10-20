-- Coordinator only, after review. Keep cron and niche sorting paused.
-- Each invocation trims at most 5,000 publishers and 5,000 relationships.
-- Repeat until both returned counts are zero. This is not a scheduled job.
\set ON_ERROR_STOP on
begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';
do $$
begin
  if not pg_try_advisory_xact_lock(hashtext('ad-networks-runtime-heavy'))
     or not pg_try_advisory_xact_lock(hashtext('ad-networks-reviewed-sync')) then
    raise exception 'Pause ad-network sync and niche sorting before trimming evidence';
  end if;
end $$;

with compact as materialized (
  select p.id,
    (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
      from jsonb_each(p.last_check_evidence) where key in ('manager_domains','confirmed_networks'))
    || case when jsonb_typeof(p.last_check_evidence#>'{enrichment,homepage}')='object'
      then jsonb_build_object('enrichment',jsonb_build_object('homepage',
        (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
          from jsonb_each(p.last_check_evidence#>'{enrichment,homepage}')
          where key in ('title','description','h1','language'))))
      else '{}'::jsonb end as evidence
  from public.ad_network_publishers p
), candidates as (
  select c.* from compact c join public.ad_network_publishers p using(id)
  where p.last_check_evidence is distinct from c.evidence or p.discovery_sources<>'[]'::jsonb
  order by c.id limit 5000
), trimmed as (
  update public.ad_network_publishers p set last_check_evidence=c.evidence,discovery_sources='[]'::jsonb
  from candidates c where p.id=c.id returning p.id
)
select count(*) as publishers_trimmed from trimmed;

with compact as materialized (
  select r.ad_network_id,r.publisher_id,
    (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
      from jsonb_each(r.evidence) where key in ('manager_domain','matched_signal','checked_url','checked_at','parser_version')) as evidence
  from public.ad_network_publisher_relationships r
), candidates as (
  select c.* from compact c join public.ad_network_publisher_relationships r using(ad_network_id,publisher_id)
  where r.evidence is distinct from c.evidence
  order by c.ad_network_id,c.publisher_id limit 5000
), trimmed as (
  update public.ad_network_publisher_relationships r set evidence=c.evidence from candidates c
  where r.ad_network_id=c.ad_network_id and r.publisher_id=c.publisher_id returning r.publisher_id
)
select count(*) as relationships_trimmed from trimmed;
commit;
