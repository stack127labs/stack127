do $$
declare
  moved_count integer;
begin
  with tool_routes(old_slug, new_slug) as (
    values
      ('dns-tools/caa-checker', 'caa-checker'),
      ('dns-tools/dns-change-checker', 'dns-change-checker'),
      ('dns-tools/dns-lookup', 'dns-lookup'),
      ('dns-tools/dns-trace', 'dns-trace'),
      ('dns-tools/dnssec-checker', 'dnssec-checker'),
      ('dns-tools/nameserver-checker', 'nameserver-checker'),
      ('dns-tools/soa-checker', 'soa-checker'),
      ('domain-tools/domain-age', 'domain-age'),
      ('domain-tools/domain-availability', 'domain-availability'),
      ('domain-tools/domain-expiry', 'domain-expiry'),
      ('domain-tools/domain-lookup', 'domain-lookup'),
      ('domain-tools/domain-owner', 'domain-owner'),
      ('domain-tools/domain-registrar', 'domain-registrar'),
      ('domain-tools/domain-report', 'domain-report'),
      ('domain-tools/epp-status-codes', 'epp-status-codes'),
      ('domain-tools/multi-tld-availability', 'multi-tld-availability'),
      ('domain-tools/punycode-converter', 'punycode-converter'),
      ('domain-tools/tld-directory', 'tld-directory'),
      ('domain-tools/transfer-readiness', 'transfer-readiness')
  )
  update public.version127_pages as page
  set slug = tool_routes.new_slug
  from tool_routes
  where page.slug = tool_routes.old_slug;

  get diagnostics moved_count = row_count;
  if moved_count <> 19 then
    raise exception 'Expected to move 19 published tool slugs, moved %', moved_count;
  end if;
end
$$;
