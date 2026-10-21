-- Weekly discovery reports need two source flags, not the publishers' JSON.
-- Partial ID indexes allow index-only membership checks without copying JSON
-- into another covering index or adding generated columns to the wide table.
-- At ~107k publishers, even the all-publisher index is about 2.4 MiB.
-- Plain builds briefly block publisher writes. Fail fast instead of queueing
-- behind an ad-network sync; the release can be retried once it finishes.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create index if not exists ad_network_publishers_attributed_source_report_idx
  on public.ad_network_publishers (id)
  where jsonb_array_length(discovery_sources)>0;

create index if not exists ad_network_publishers_checker_source_report_idx
  on public.ad_network_publishers (id)
  where discovery_sources @> '[{"source_key":"checker"}]'::jsonb;
