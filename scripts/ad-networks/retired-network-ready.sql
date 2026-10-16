select not exists(select 1 from public.ad_networks where slug=$1::text)
  and exists(select 1 from public.ad_networks where slug=$2::text) as ready
