select count(*) = cardinality($1::text[]) as ready
from public.ad_networks
where slug = any($1::text[])
