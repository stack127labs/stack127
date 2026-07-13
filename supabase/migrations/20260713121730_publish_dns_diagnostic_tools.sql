-- Publish the completed DNS tools through the central page registry.

insert into public.version127_pages (
  slug,
  label,
  meta_title,
  meta_description,
  is_published,
  published_at,
  cover_image_url,
  page_type,
  sitemap_priority
) values
  ('dns-tools/dns-trace', 'DNS Trace Explorer', 'DNS Trace Explorer: Follow a DNS Query Step by Step | Version127', 'Follow a DNS query from the root nameservers to the authoritative answer and see exactly where the path stops or changes direction.', true, '2026-07-13T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('dns-tools/dns-change-checker', 'DNS Change Checker', 'DNS Change Checker: Compare Authoritative and Cached Records | Version127', 'Check a DNS change at the authoritative nameservers and compare it with Cloudflare, Google, Quad9, and other public resolver caches.', true, '2026-07-13T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('dns-tools/nameserver-checker', 'Nameserver Delegation Checker', 'Nameserver Delegation Checker: Test NS and Glue Records | Version127', 'Compare parent and child nameservers, verify glue records, and find unreachable or non-authoritative DNS servers.', true, '2026-07-13T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('dns-tools/dnssec-checker', 'DNSSEC Chain Checker', 'DNSSEC Chain Checker: Validate DS, DNSKEY and RRSIG | Version127', 'Validate a domain DNSSEC chain from the root and find DS mismatches, missing keys, failed signatures, and unsigned delegations.', true, '2026-07-13T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('dns-tools/soa-checker', 'SOA Consistency Checker', 'SOA Consistency Checker: Compare DNS Zone Serials | Version127', 'Compare SOA serial numbers and timing values across every authoritative nameserver for a DNS zone.', true, '2026-07-13T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('dns-tools/caa-checker', 'CAA Policy Checker', 'CAA Policy Checker: Test Certificate Authority Authorization | Version127', 'Find the effective CAA policy for a domain and see which certificate authorities may issue normal and wildcard certificates.', true, '2026-07-13T00:00:00.000Z', null, 'WebApplication', 0.80)
on conflict (slug) do update set
  label = excluded.label,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description,
  is_published = excluded.is_published,
  published_at = coalesce(public.version127_pages.published_at, excluded.published_at),
  cover_image_url = excluded.cover_image_url,
  page_type = excluded.page_type,
  sitemap_priority = excluded.sitemap_priority,
  updated_at = now();
