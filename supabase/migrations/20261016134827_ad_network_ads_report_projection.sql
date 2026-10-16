-- Reporting reads two measured counts, without decoding seller lists or previews.
alter table public.ad_network_publishers
  add column report_ads_txt_lines integer generated always as ((ads_txt_summary->>'lines')::integer) stored,
  add column report_ads_txt_invalid integer generated always as ((ads_txt_summary->>'invalid')::integer) stored;

create index ad_network_publishers_ads_report_idx on public.ad_network_publishers(id)
  include (report_ads_txt_lines,report_ads_txt_invalid) where report_has_ads_txt_summary;
create index ad_network_relationships_method_report_idx
  on public.ad_network_publisher_relationships(ad_network_id,verification_method) where status='confirmed';
