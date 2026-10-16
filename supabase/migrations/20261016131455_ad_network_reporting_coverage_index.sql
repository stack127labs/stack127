-- Public report counts should read small facts without scanning ads.txt evidence.
create index if not exists ad_network_publishers_report_facts_idx
  on public.ad_network_publishers (id)
  include (normalized_domain,niche,traffic_group,domain_created_on,platform,publisher_name,last_checked_at);
