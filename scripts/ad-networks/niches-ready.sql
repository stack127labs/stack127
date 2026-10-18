with listed as (
  select p.niche from public.ad_network_publishers p where exists(
    select 1 from public.ad_network_publisher_relationships r where r.publisher_id=p.id and r.status in ('confirmed','stale'))
) select case when $1::text is null then count(niche)>=100 and count(niche)::numeric/nullif(count(*),0)>=0.8
  else count(*) filter(where niche=$1)>=500 end as ready from listed
