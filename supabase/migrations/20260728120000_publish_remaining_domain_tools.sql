-- Publish the remaining domain tools now that every route exists in the repo.

insert into public.version127_pages (
  slug, label, meta_title, meta_description,
  is_published, published_at, cover_image_url, page_type, sitemap_priority
) values
  ('domain-tools/domain-expiry', 'Domain Expiry Checker', 'Domain Expiry Checker: When a Domain Expires and What Happens Next | Version127', 'Check when a domain expires and see exactly what happens afterwards, through the grace period, redemption and pending delete stages before it is released.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/multi-tld-availability', 'Multi-TLD Availability', 'Multi-TLD Availability: Check One Name Across Endings | Version127', 'Check one domain name against several endings at once, asked of each registry directly, with every row reporting its own outcome.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/domain-owner', 'Domain Registrant Lookup', 'Domain Registrant Lookup: Who Owns a Domain and What Is Hidden | Version127', 'See what is published about a domain registrant, exactly which contact fields were withheld and how, and the routes that still exist for making contact.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/domain-registrar', 'Registrar Lookup', 'Registrar Lookup: Find a Domain Registrar and Abuse Contact | Version127', 'Find which registrar a domain is registered through, get the abuse contact, and understand the difference between a registry, a registrar and a reseller.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/transfer-readiness', 'Domain Transfer Readiness', 'Domain Transfer Readiness: Can This Domain Be Transferred | Version127', 'Find out what is blocking a domain transfer, which locks you can remove yourself, and what the public record cannot tell you about your registrar account.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/domain-report', 'Domain Registration Report', 'Domain Registration Report: Registration and DNS Checked Together | Version127', 'Check a domain registration and its live DNS together, and find the places where the registry record and the working zone disagree.', true, '2026-07-28T00:00:00.000Z', null, 'WebApplication', 0.80),
  ('domain-tools/tld-directory', 'TLD Directory', 'TLD Directory: Every Domain Ending, Operator and DNSSEC Status | Version127', 'Every top-level domain in the root zone with its type, operating organisation, DNSSEC status, and whether registration data can be looked up under it.', true, '2026-07-28T00:00:00.000Z', null, 'CollectionPage', 0.80)
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
