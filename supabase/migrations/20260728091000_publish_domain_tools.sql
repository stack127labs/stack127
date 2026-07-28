-- Publish the completed domain tools through the central page registry.
--
-- Only routes that exist in the repo are listed here. The remaining planned tools
-- in content_docs/domain-tools/ are added as they ship, so the sidebar and the
-- sitemap never point at a route that returns 404.

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
  ('domain-tools', 'domain tools', 'Domain Tools: Registration, Age, Availability and Status | Version127', 'Look up domain registration data straight from the registry: who a domain is registered through, when it was created, when it expires, and what its status codes actually mean.', true, '2026-07-28T00:00:00.000Z', null, 'CollectionPage', 0.90),
  ('domain-tools/domain-lookup', 'Domain Registration Lookup', 'Domain Registration Lookup: RDAP Records for Any Domain | Version127', 'See the full registration record for a domain: registrar, creation and expiry dates, status codes, nameservers, DNSSEC, and which contact fields were withheld.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/domain-age', 'Domain Age Checker', 'Domain Age Checker: How Old Is a Domain Name | Version127', 'Check how long a domain has been registered, taken from the registry, with a clear explanation of why registration age is not the age of the site.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/domain-availability', 'Domain Availability Checker', 'Domain Availability Checker: Ask the Registry Directly | Version127', 'Check whether a domain name is registered by asking the registry itself, with no adverts, no upsell, and no log of the names you try.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/epp-status-codes', 'Domain status codes', 'Domain Status Codes Explained: clientHold, pendingDelete and More | Version127', 'What every domain status code means, who set it, and whether you can remove it yourself. Covers clientTransferProhibited, clientHold, redemptionPeriod and the rest.', true, '2026-07-28T00:00:00.000Z', null, 'WebPage', 0.80),
  ('domain-tools/punycode-converter', 'Punycode and IDN Converter', 'Punycode Converter: IDN to ASCII and Back | Version127', 'Convert a domain name between its readable Unicode form and the xn-- ASCII form DNS carries, and see every character that could make one name look like another.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80)
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
