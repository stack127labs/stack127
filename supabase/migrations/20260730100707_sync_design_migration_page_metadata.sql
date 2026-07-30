begin;

do $$
declare
  updated_count integer;
begin
  update public.version127_pages as page
  set
    meta_title = changes.meta_title,
    updated_at = now()
  from (
    values
      ('', 'version127: practical tools for people who tinker'),
      ('dns-tools', 'DNS tools: check records, trace queries, and find what broke | version127'),
      ('dns-tools/caa-checker', 'CAA Policy Checker: test certificate authority authorization | version127'),
      ('dns-tools/dns-change-checker', 'DNS Change Checker: see if your DNS change has propagated | version127'),
      ('dns-tools/dns-lookup', 'DNS Lookup: check any domain''s records | version127'),
      ('dns-tools/dns-trace', 'DNS Trace Explorer: follow a DNS query from root to answer | version127'),
      ('dns-tools/dnssec-checker', 'DNSSEC Chain Checker: validate DS, DNSKEY, and RRSIG | version127'),
      ('dns-tools/nameserver-checker', 'Nameserver Delegation Checker: test NS and glue records | version127'),
      ('dns-tools/soa-checker', 'SOA Consistency Checker: compare zone serials across nameservers | version127'),
      ('domain-tools', 'Domain tools: free WHOIS, age, availability, and status lookups | version127'),
      ('domain-tools/domain-age', 'Domain Age Checker: how old is a domain name? | version127'),
      ('domain-tools/domain-availability', 'Domain Availability Checker: is this domain name taken? | version127'),
      ('domain-tools/domain-expiry', 'Domain Expiry Checker: when does a domain expire? | version127'),
      ('domain-tools/domain-lookup', 'Domain Registration Lookup: free WHOIS and RDAP search | version127'),
      ('domain-tools/domain-owner', 'Domain Registrant Lookup: who owns this domain? | version127'),
      ('domain-tools/domain-registrar', 'Registrar Lookup: find a domain''s registrar and abuse contact | version127'),
      ('domain-tools/domain-report', 'Domain Registration Report: registration and DNS checked together | version127'),
      ('domain-tools/epp-status-codes', 'Domain status codes explained: clientHold, pendingDelete, and more | version127'),
      ('domain-tools/multi-tld-availability', 'Multi-TLD Availability: check one name across many extensions | version127'),
      ('domain-tools/punycode-converter', 'Punycode and IDN Converter: convert domains to ASCII and back | version127'),
      ('domain-tools/tld-directory', 'TLD Directory: every domain extension, its operator, and DNSSEC | version127'),
      ('domain-tools/transfer-readiness', 'Domain Transfer Readiness: can this domain be transferred? | version127'),
      ('privacy', 'Privacy policy of version127'),
      ('self-host-apps', 'Self-host apps: a directory of apps worth running yourself | version127'),
      ('software-licenses-for-self-hosting', 'Software licenses for self-hosters: what each label lets you do | version127'),
      ('terms', 'Terms and conditions to use version127')
  ) as changes(slug, meta_title)
  where page.slug = changes.slug;

  get diagnostics updated_count = row_count;
  if updated_count <> 26 then
    raise exception 'Expected to update 26 version127 page titles, updated %', updated_count;
  end if;
end $$;

update public.version127_pages
set
  meta_description = 'Check public DNS records and read exact resolver response states with compact DNS troubleshooting tools from version127.',
  updated_at = now()
where slug = 'dns-tools';

commit;
