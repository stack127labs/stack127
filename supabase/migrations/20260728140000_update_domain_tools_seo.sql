-- Retune domain tool titles and descriptions around the phrases people search for.
-- Titles lead with the query rather than the internal tool name, and descriptions
-- say what the page answers instead of describing the tool.

update public.version127_pages set
  meta_title = 'Free Domain Lookup Tools: WHOIS, Age, Availability and Status | Version127',
  meta_description = 'Free domain tools that answer straight from the registry: who registered a domain, when it was created, when it expires, whether a name is available, and what its status codes mean.',
  updated_at = now()
where slug = 'domain-tools';

update public.version127_pages set
  meta_title = 'Domain Registration Lookup: Free WHOIS and RDAP Search | Version127',
  meta_description = 'Look up any domain''s full registration record: registrar, creation and expiry dates, status codes, nameservers, DNSSEC, and exactly which contact details were withheld.',
  updated_at = now()
where slug = 'domain-tools/domain-lookup';

update public.version127_pages set
  meta_title = 'Domain Age Checker: How Old Is a Domain Name? | Version127',
  meta_description = 'Check how old a domain is and when it was first registered. Shows the exact creation date, the age in plain language, and whether the name was ever dropped and re-registered.',
  updated_at = now()
where slug = 'domain-tools/domain-age';

update public.version127_pages set
  meta_title = 'Domain Expiry Checker: When Does a Domain Expire? | Version127',
  meta_description = 'Check when a domain expires and what happens next. Covers the grace period, the 30 day redemption window and pending delete, so you know when a name actually becomes available.',
  updated_at = now()
where slug = 'domain-tools/domain-expiry';

update public.version127_pages set
  meta_title = 'Domain Availability Checker: Is This Domain Name Taken? | Version127',
  meta_description = 'Check whether a domain name is registered by asking the registry directly. No adverts, no upsell, no suggested alternatives, and no record kept of the names you try.',
  updated_at = now()
where slug = 'domain-tools/domain-availability';

update public.version127_pages set
  meta_title = 'Check a Domain Name Across Multiple Extensions | Version127',
  meta_description = 'Check one domain name against several extensions at once, asked of each registry directly. Every result says clearly whether the name is free, taken, or could not be checked.',
  updated_at = now()
where slug = 'domain-tools/multi-tld-availability';

update public.version127_pages set
  meta_title = 'Who Owns This Domain? Domain Owner Lookup | Version127',
  meta_description = 'Find out who a domain is registered to, see exactly which contact details were withheld and how, and learn the routes that still work for contacting a domain owner.',
  updated_at = now()
where slug = 'domain-tools/domain-owner';

update public.version127_pages set
  meta_title = 'Find a Domain''s Registrar and Abuse Contact | Version127',
  meta_description = 'Look up which registrar a domain is registered through, with its IANA ID and abuse contact, plus how registries, registrars and resellers differ and which one to contact.',
  updated_at = now()
where slug = 'domain-tools/domain-registrar';

update public.version127_pages set
  meta_title = 'Can This Domain Be Transferred? Transfer Lock Checker | Version127',
  meta_description = 'Find out what is blocking a domain transfer, which locks you can remove yourself, how the 60 day transfer lock works, and what the public record cannot show you.',
  updated_at = now()
where slug = 'domain-tools/transfer-readiness';

update public.version127_pages set
  meta_title = 'Domain Health Check: Registration and DNS Together | Version127',
  meta_description = 'Check a domain''s registration and its live DNS in one place and find where they disagree, including nameserver mismatches and DNSSEC enabled on a broken chain.',
  updated_at = now()
where slug = 'domain-tools/domain-report';

update public.version127_pages set
  meta_title = 'Domain Status Codes Explained: clientHold, pendingDelete and More | Version127',
  meta_description = 'What every domain status code means in plain terms, who set it, whether you can remove it yourself, and why clientHold or serverHold takes a site offline.',
  updated_at = now()
where slug = 'domain-tools/epp-status-codes';

update public.version127_pages set
  meta_title = 'Punycode Converter: Convert IDN Domains to ASCII and Back | Version127',
  meta_description = 'Convert a domain name between its readable form and the xn-- punycode form, in either direction, and see every character that could make one name imitate another.',
  updated_at = now()
where slug = 'domain-tools/punycode-converter';

update public.version127_pages set
  meta_title = 'List of All Domain Extensions With Operators and DNSSEC | Version127',
  meta_description = 'Every top-level domain that exists, with its type, the organisation that operates it, whether it is signed with DNSSEC, and whether registration data can be looked up.',
  updated_at = now()
where slug = 'domain-tools/tld-directory';
