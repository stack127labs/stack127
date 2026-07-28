-- Read through cache for RDAP responses.
--
-- The DNS tools cache nothing. RDAP has to, because registries throttle by source
-- IP and the whole site leaves through one address, so one visitor's burst can get
-- every visitor blocked.
--
-- Privacy: rows are keyed by the queried URL and hold the registry's answer only.
-- No requester address, session, or identifier is stored here, and nothing in this
-- table is ever joined to who asked. Requester identifiers live only in the
-- in-memory rate limiter for a few minutes. See version127_docs/rdap.md.

create table if not exists public.rdap_cache (
  url text primary key,
  status text not null,
  http_status integer,
  body jsonb,
  fetched_at timestamptz not null default now()
);

-- Lookups are always "this URL, if it is fresh enough".
create index if not exists rdap_cache_fetched_at_idx on public.rdap_cache (fetched_at);

comment on table public.rdap_cache is
  'Cached RDAP responses keyed by request URL. Registry facts only; never holds requester identifiers.';
