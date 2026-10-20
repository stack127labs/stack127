-- Coordinator only, after review. Keep cron and niche sorting paused.
-- Each invocation scans at most 5,000 publishers and 5,000 relationships.
-- Reuse one psql session: temporary cursors advance even through unchanged rows.
-- Finish when both scanned counts are zero. Reconnecting safely starts over.
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
create temporary table if not exists ad_network_trim_cursor (
  singleton boolean primary key check (singleton),
  publisher_id bigint not null default 0,
  relationship_network_id bigint not null default 0,
  relationship_publisher_id bigint not null default 0
);
insert into pg_temp.ad_network_trim_cursor(singleton) values(true) on conflict do nothing;

with batch as materialized (
  select p.id,p.last_check_evidence,p.discovery_sources from public.ad_network_publishers p
  where p.id>(select publisher_id from pg_temp.ad_network_trim_cursor)
  order by p.id limit 5000
), compact as materialized (
  select p.id,
    (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
      from jsonb_each(p.last_check_evidence) where key in ('manager_domains','confirmed_networks'))
    || case when jsonb_typeof(p.last_check_evidence#>'{enrichment,homepage}')='object'
      then jsonb_build_object('enrichment',jsonb_build_object('homepage',
        (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
          from jsonb_each(p.last_check_evidence#>'{enrichment,homepage}')
          where key in ('title','description','h1','language'))))
      else '{}'::jsonb end as evidence,
    (select coalesce(jsonb_agg(case when jsonb_typeof(source)='object' and source ? 'source_key'
      then jsonb_build_object('source_key',source->'source_key') else '{}'::jsonb end order by position),'[]'::jsonb)
      from jsonb_array_elements(p.discovery_sources) with ordinality as s(source,position)) as sources
  from batch p
), trimmed as (
  update public.ad_network_publishers p set last_check_evidence=c.evidence,discovery_sources=c.sources
  from compact c where p.id=c.id
    and (p.last_check_evidence is distinct from c.evidence or p.discovery_sources is distinct from c.sources)
  returning p.id
), progress as (
  update pg_temp.ad_network_trim_cursor c
  set publisher_id=coalesce((select max(id) from batch),c.publisher_id) returning publisher_id
)
select (select count(*) from batch) as publishers_scanned,(select count(*) from trimmed) as publishers_trimmed,
  publisher_id as publisher_after from progress;

with batch as materialized (
  select r.ad_network_id,r.publisher_id,r.evidence from public.ad_network_publisher_relationships r
  where (r.ad_network_id,r.publisher_id)>(select relationship_network_id,relationship_publisher_id from pg_temp.ad_network_trim_cursor)
  order by r.ad_network_id,r.publisher_id limit 5000
), compact as materialized (
  select r.ad_network_id,r.publisher_id,
    (select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
      from jsonb_each(r.evidence) where key in ('manager_domain','matched_signal','checked_url','checked_at','parser_version')) as evidence
  from batch r
), trimmed as (
  update public.ad_network_publisher_relationships r set evidence=c.evidence from compact c
  where r.ad_network_id=c.ad_network_id and r.publisher_id=c.publisher_id and r.evidence is distinct from c.evidence
  returning r.publisher_id
), progress as (
  update pg_temp.ad_network_trim_cursor c set
    relationship_network_id=coalesce((select ad_network_id from batch order by ad_network_id desc,publisher_id desc limit 1),c.relationship_network_id),
    relationship_publisher_id=coalesce((select publisher_id from batch order by ad_network_id desc,publisher_id desc limit 1),c.relationship_publisher_id)
  returning relationship_network_id,relationship_publisher_id
)
select (select count(*) from batch) as relationships_scanned,(select count(*) from trimmed) as relationships_trimmed,
  relationship_network_id as relationship_network_after,relationship_publisher_id as relationship_publisher_after from progress;
commit;
