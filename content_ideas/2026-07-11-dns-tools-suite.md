# Version127 DNS Tools Suite

Date: 2026-07-11
Last updated: 2026-07-12
Status: researched backlog; no route or publication work approved

## Recommendation

Build this as a focused DNS troubleshooting suite, not a generic collection of unrelated webmaster utilities. The suite should answer a practical question: **why is this domain, website, email setup, or self-hosted service not working?**

The strongest Version127 advantage is interpretation. Each result should show the raw evidence, explain what it means, distinguish authoritative configuration from recursive cache state, and suggest the next safe check. It should not reduce nuanced DNS behavior to a fake health percentage.

Research verdict:

- Integrated DNS troubleshooting suite: **22/25 — build-next quality**
- Collection of disconnected lookup pages: **14/25 — weak unless it supports the suite**
- Demand is established, but the category is crowded by WhatsMyDNS, DNSChecker, MXToolbox, CheckHub, DNSViz, IntoDNS, and similar products.
- Basic DNS tools are feasible with normal DNS queries or public DNS-over-HTTPS endpoints.
- Genuine country-by-country propagation testing requires distributed infrastructure. A request sent to several anycast resolvers from one Version127 server is not a global geographic test.

## Product Shape

Recommended hub URL: `/dns-tools`

The hub should organize tools by task rather than protocol terminology:

1. Check a DNS change
2. Diagnose a website or self-hosted service
3. Diagnose email delivery DNS
4. Check DNS security and delegation
5. Calculate or prepare DNS records

Shared input and result behavior:

- Accept a domain, hostname, IP address, or record text only when the selected tool needs it.
- Normalize case, trailing dots, Unicode domains, IPv4, and IPv6 input.
- Display query time, resolver or authoritative server, response code, resolver-reported TTL, raw answer, and interpreted finding.
- Distinguish `NOERROR` with no answer, `NXDOMAIN`, `SERVFAIL`, timeout, refused queries, and malformed input.
- Make results shareable only through explicit user action; do not index arbitrary query-param result pages.
- Rate-limit server-side queries and cap recursion, response size, aliases, and nested record expansion.
- Never claim that a configuration is safe, fully propagated, or guaranteed to deliver email.

## Phase 1: Core DNS Troubleshooting

These tools should ship first because they form one coherent diagnostic workflow.

### [ ] 1. Unified DNS Record Lookup

Recommended URL: `/dns-tools/dns-lookup`

Detailed implementation plan: `content_ideas/2026-07-12-dns-lookup-implementation-plan.md`

User problem: See the important public DNS records for a domain without running separate A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, SRV, DS, and DNSKEY searches.

MVP:

- Query one selected type or an intentional standard bundle.
- Show record values, priorities, resolver TTLs, response status, and resolver used.
- Treat resolver TTL as the remaining cache lifetime reported in the resolver response, not necessarily the domain owner's configured TTL.
- Normalize, deduplicate, validate, and render CNAME alias chains separately from terminal records.
- Preserve nullable DNS flags and optional provider fields without turning absent or invalid values into `false` or empty data.
- Preserve raw record data alongside a readable interpretation.
- Link directly to the relevant specialized analyzer when a record needs deeper validation.

Implementation: Server-side DNS or DNS-over-HTTPS queries. Google and Cloudflare DoH can support the initial recursive lookup implementation.

Risk: An “all records” query is not literally all possible DNS record types. Label the standard bundle accurately.

### [ ] 2. DNS Change Checker

Recommended URL: `/dns-tools/dns-change-checker`

User problem: Determine whether a recent DNS change is wrong at the authoritative source or merely still cached by recursive resolvers.

MVP:

- Find the authoritative nameservers.
- Query the authoritative answer directly.
- Compare it with Google, Cloudflare, and Quad9 recursive answers.
- Accept an optional expected value.
- Show TTL remaining when exposed, agreement/disagreement, and the exact response state.
- Explain likely next steps for authoritative mismatch, cached old value, `NXDOMAIN`, `SERVFAIL`, or DNSSEC failure.

Implementation: Server-side DNS queries. This remains useful without geographic nodes because it compares source-of-truth and major recursive states.

Risk: Do not label this “global propagation” or promise that every user sees the same answer.

### [ ] 3. Nameserver Delegation Checker

Recommended URL: `/dns-tools/nameserver-checker`

User problem: Diagnose domains whose registrar/TLD delegation and zone-level NS records disagree.

MVP:

- Read parent-zone delegation.
- Read child-zone NS records.
- Compare nameserver sets.
- Resolve glue records and identify missing or inconsistent glue.
- Test whether each authoritative server answers authoritatively.
- Show lame delegation, timeout, refused response, and inconsistent SOA serial findings.

Implementation: Iterative server-side DNS queries beginning from the public root/TLD path.

Risk: Some arrangements are unusual but valid. Report evidence and impact instead of assigning a simplistic score.

### [ ] 4. DNS Trace Explorer

Recommended URL: `/dns-tools/dns-trace`

User problem: See how a lookup travels from the root to the TLD and authoritative nameserver, similar to `dig +trace`, without interpreting terminal output.

MVP:

- Display root, TLD, delegation, authoritative server, and final answer as ordered steps.
- Include response codes, glue, TTLs, and timing per step.
- Identify the step where resolution stops.
- Provide a copyable compact trace for support requests.

Implementation: Controlled iterative DNS resolution with strict query and redirect limits.

Risk: Requires careful DNS protocol handling; do not build a fake trace from recursive DoH answers.

### [ ] 5. DNS Compare

Recommended URL: `/dns-tools/dns-compare`

User problem: Compare a domain across two resolvers, two authoritative nameservers, or two domains during migration.

MVP:

- Comparison modes: resolver versus resolver, nameserver versus nameserver, and domain versus domain.
- Compare answer values, TTL, response code, MX priority, SOA serial, and CAA policy.
- Highlight additions, removals, and changed values without declaring one side correct.

Implementation: Reuse the normalized DNS query and diff engine from the lookup tools.

Risk: Domain-to-domain comparisons need clear record-name handling so apex and subdomain results are not mixed.

### [ ] 6. DNSSEC Chain Checker

Recommended URL: `/dns-tools/dnssec-checker`

User problem: Explain why a signed domain returns `SERVFAIL` or why DNSSEC validation is incomplete.

MVP:

- Inspect DS, DNSKEY, RRSIG, and chain-of-trust state.
- Distinguish unsigned, securely signed, insecure delegation, expired signature, missing DS, mismatched DS, and validation failure.
- Show key tags, algorithms, digest types, inception, and expiration where available.
- Link each finding to a concise explanation.

Implementation: Use a validating resolver or a DNSSEC-capable library; raw presence checks alone are insufficient.

Risk: This tool must perform actual validation. Merely finding DNSSEC record types would create false confidence.

## Phase 2: Email DNS Diagnostics

These tools share a DNS lookup and parsing engine but solve distinct search problems. The combined email checker should link to the specialist views rather than duplicate their logic.

### [ ] 7. Email DNS Checker

Recommended URL: `/dns-tools/email-dns-checker`

User problem: Check the DNS records most likely to affect outbound authentication and inbound mail routing in one workflow.

MVP:

- Check MX, SPF, DMARC, and optional DKIM selector.
- Show missing, duplicate, malformed, or conflicting records.
- Resolve the effective DMARC organizational-domain policy when applicable.
- Link to the SPF, DMARC, DKIM, and MX detail tools.

Risk: DNS configuration alone cannot prove inbox placement or end-to-end mail delivery.

### [ ] 8. SPF Analyzer

Recommended URL: `/dns-tools/spf-checker`

User problem: Find syntax errors, duplicate SPF records, excessive DNS lookups, void lookups, and the include that causes failure.

MVP:

- Parse the SPF record.
- Recursively expand `include` and `redirect` within strict limits.
- Count DNS-causing mechanisms under RFC 7208 rules.
- Display the expansion tree and contribution of each mechanism.
- Identify loops, nonexistent includes, multiple SPF records, `PermError` conditions, and risky overly broad endings.

Risk: Do not offer automatic SPF flattening as a universal fix; flattened IP lists can become stale.

### [ ] 9. DMARC Checker

Recommended URL: `/dns-tools/dmarc-checker`

User problem: Validate `_dmarc` syntax and understand the effective enforcement and reporting configuration.

MVP:

- Parse tags and defaults.
- Show effective `p`, `sp`, alignment, percentage, aggregate reporting, and forensic reporting values.
- Detect multiple records, invalid tags, bad addresses, and ineffective policy combinations.
- Explain policy without claiming that the domain is protected from every form of spoofing.

### [ ] 10. DMARC Record Generator

Recommended URL: `/dns-tools/dmarc-generator`

User problem: Create a syntactically valid DMARC record from explicit choices rather than copying an unexplained template.

MVP:

- Inputs for policy, subdomain policy, alignment, percentage, aggregate URI, and optional forensic settings.
- Generate a copyable TXT host and value.
- Explain staged monitoring versus enforcement.
- Warn when the selected options could reject legitimate mail.

Implementation: Client-side generator; no DNS call required until the user asks to verify publication.

### [ ] 11. DKIM Checker

Recommended URL: `/dns-tools/dkim-checker`

User problem: Verify a DKIM public key when the user knows the selector.

MVP:

- Require domain and selector.
- Query `<selector>._domainkey.<domain>`.
- Parse version, key type, flags, notes, and public-key presence.
- Detect missing, malformed, duplicate, or revoked keys.

Risk: A generic domain lookup cannot discover every private selector reliably. Never imply otherwise.

### [ ] 12. MX Record Checker

Recommended URL: `/dns-tools/mx-checker`

User problem: Check whether inbound mail exchangers are resolvable and ordered correctly.

MVP:

- Display MX hostnames and priorities.
- Resolve A and AAAA addresses for each exchanger.
- Identify null MX, missing addresses, CNAME misuse where applicable, and inconsistent results.
- Keep SMTP connection tests separate from the DNS-only result.

### [ ] 13. BIMI Checker

Recommended URL: `/dns-tools/bimi-checker`

User problem: Inspect a BIMI record and understand the dependencies that prevent a logo from appearing.

MVP:

- Parse the default or supplied selector record.
- Validate the logo and optional authority evidence URLs structurally.
- Report DMARC policy prerequisites separately.
- Explain that mailbox-provider display remains provider-controlled.

Risk: Remote SVG fetching needs strict URL, size, content-type, redirect, and private-network protections.

## Phase 3: Security, Record Policy, and Reverse Lookup

### [ ] 14. CAA Checker

Recommended URL: `/dns-tools/caa-checker`

User problem: Determine which certificate authorities may issue certificates for a domain and whether inheritance changes the answer.

MVP:

- Resolve the effective CAA records up the label hierarchy.
- Parse `issue`, `issuewild`, and `iodef` properties.
- Show flags and unknown critical properties.
- Explain the difference between normal and wildcard authorization.

### [ ] 15. Reverse DNS / PTR Lookup

Recommended URL: `/dns-tools/reverse-dns-lookup`

User problem: Find the PTR record for an IPv4 or IPv6 address and compare forward-confirmed reverse DNS.

MVP:

- Convert the address to `in-addr.arpa` or `ip6.arpa`.
- Query PTR records.
- Forward-resolve returned hostnames and show whether the original IP appears.
- Clearly state when no PTR is configured.

### [ ] 16. SOA and Zone Consistency Checker

Recommended URL: `/dns-tools/soa-checker`

User problem: Compare SOA serials and core zone settings across authoritative nameservers.

MVP:

- Query every authoritative server directly.
- Compare serial, primary server, responsible mailbox, refresh, retry, expire, and negative cache TTL.
- Highlight nameservers serving different serials or failing to answer.

### [ ] 17. SRV Record Checker

Recommended URL: `/dns-tools/srv-checker`

User problem: Inspect service discovery records whose priority, weight, port, and target are difficult to read.

MVP:

- Accept service, protocol, and domain or a complete SRV name.
- Sort and explain priority and weight.
- Resolve targets and flag missing target addresses.
- Preserve the special no-service target semantics.

### [ ] 18. TLSA / DANE Checker

Recommended URL: `/dns-tools/tlsa-checker`

User problem: Inspect TLSA records and determine whether they sit beneath a valid DNSSEC chain.

MVP:

- Accept hostname, port, and transport.
- Parse certificate usage, selector, matching type, and association data.
- Require DNSSEC validation state in the result.

Risk: Certificate retrieval and cryptographic matching add substantial correctness work. Keep this after DNSSEC is mature.

### [ ] 19. HTTPS and SVCB Record Checker

Recommended URL: `/dns-tools/https-svcb-checker`

User problem: Read newer HTTPS/SVCB records and understand service priority and parameters.

MVP:

- Parse alias and service modes.
- Display target, priority, ALPN, port, IPv4/IPv6 hints, ECH, and mandatory keys.
- Identify malformed or internally inconsistent parameters.

Risk: Standards and deployment behavior need careful source tracking.

## Phase 4: DNS Preparation and Calculators

These are mostly client-side utilities. They are valuable as supporting tools but should not delay the diagnostic core.

### [ ] 20. DNS TTL Calculator

Recommended URL: `/dns-tools/ttl-calculator`

User problem: Convert TTL units and plan a DNS change without misreading seconds as minutes or hours.

MVP:

- Convert seconds, minutes, hours, and days.
- Estimate the earliest cache refresh window from the prior TTL.
- Provide common values without claiming a guaranteed propagation time.

### [ ] 21. DNS Record Builder

Recommended URL: `/dns-tools/dns-record-generator`

User problem: Generate correctly formatted A, AAAA, CNAME, MX, TXT, CAA, SRV, and simple verification records.

MVP:

- Record-specific fields and validation.
- Output neutral host/name, type, TTL, and value fields.
- Show common provider differences such as apex represented by `@` while keeping the canonical FQDN visible.
- Do not generate provider-specific API commands in the first version.

### [ ] 22. DNS Zone File Validator

Recommended URL: `/dns-tools/zone-file-checker`

User problem: Catch syntax and structural errors before importing a BIND-style zone file.

MVP:

- Parse pasted text locally where possible.
- Validate owner names, TTLs, classes, record-specific fields, parentheses, quotes, and required SOA/NS structure.
- Report line-specific syntax findings.
- Never upload or execute the zone file.

Risk: Provider export formats vary. Clearly name the supported syntax instead of pretending all formats are interchangeable.

### [ ] 23. IDN / Punycode Converter

Recommended URL: `/dns-tools/punycode-converter`

User problem: Convert Unicode domain labels to and from the ASCII representation used in DNS.

MVP:

- Convert in both directions.
- Normalize label-by-label.
- Warn about mixed scripts and visually confusable characters without declaring a domain malicious.

### [ ] 24. IPv4 Subnet Calculator

Recommended URL: `/network-tools/ipv4-subnet-calculator`

User problem: Calculate network address, broadcast address, usable range, mask, wildcard mask, and address count.

MVP: Entirely client-side and exact. Include RFC-specific notes for `/31` and `/32` instead of applying a naive host-count formula.

Product note: This belongs under a future network-tools cluster and can be linked from DNS tools; it is not intrinsically a DNS tool.

### [ ] 25. IPv6 Prefix Calculator

Recommended URL: `/network-tools/ipv6-prefix-calculator`

User problem: Expand, compress, normalize, and calculate the range and subnet relationships of an IPv6 prefix.

MVP:

- Canonical compression and full expansion.
- Network range and prefix containment.
- Number of child prefixes at a chosen target length.

Product note: Keep this in the network-tools cluster rather than padding the DNS hub.

### [ ] 26. CIDR and IP Range Converter

Recommended URL: `/network-tools/cidr-range-converter`

User problem: Convert IPv4 or IPv6 CIDR blocks to ranges and summarize ranges into minimal CIDR blocks.

MVP: Client-side exact calculation with validation and no network requests.

## Phase 5: Infrastructure-Dependent Tools

Keep these in the backlog until Version127 has the infrastructure, data rights, and operational budget to make the claims honestly.

### [ ] 27. Global DNS Propagation Checker

Recommended URL: `/dns-tools/dns-propagation-checker`

User problem: Sample DNS answers from genuinely different geographic and network vantage points after a change.

Required capability:

- Distributed probes in multiple regions and autonomous systems.
- Per-probe resolver identity, location, time, answer, response status, and latency.
- Clear separation of recursive cache observations from authoritative answers.
- Expected-value grouping rather than misleading green/red status alone.

Do not ship as “global” using several public DoH providers queried from one server location.

### [ ] 28. DNS Monitoring and Change Alerts

Recommended URL: `/dns-tools/dns-monitoring`

User problem: Receive a notification when selected DNS records, delegation, DNSSEC state, or certificate policy changes.

Required capability:

- Accounts or signed monitor tokens.
- Scheduled jobs, durable observations, alert deduplication, and notification delivery.
- User-selected records and explicit retention policy.

Risk: This changes the product from stateless tools into an operational service with privacy, reliability, and abuse obligations.

### [ ] 29. Historical DNS Records

Recommended URL: `/dns-tools/dns-history`

User problem: See previous public record values during migration, incident response, or ownership research.

Required capability: Licensed passive-DNS data or a Version127-owned opt-in monitoring dataset.

Do not scrape competitors or imply comprehensive history from records Version127 happened to observe.

### [ ] 30. DNS Resolver Performance Test

Recommended URL: `/dns-tools/dns-speed-test`

User problem: Compare the resolver experience from the user’s own connection.

Required capability: A client or carefully designed browser test that controls cache warming, transport, resolver selection, and repeated measurements.

Risk: Server-side measurements describe the Version127 server, not the visitor. Browser networking restrictions also make a trustworthy client-side benchmark harder than it appears.

## Tools to Exclude or Defer Indefinitely

These should not be used to inflate the tool count.

### [ ] Do not build a generic “domain health score”

Reason: A single grade hides evidence, encodes subjective weighting, and can imply correctness. Show specific findings and their technical consequence instead.

### [ ] Do not build automatic SPF flattening initially

Reason: Flattened IP ranges can become stale when included providers change infrastructure. The analyzer should identify the lookup problem without presenting flattening as universally safe.

### [ ] Do not build automatic DKIM selector discovery

Reason: There is no dependable universal enumeration method. Require the selector from the user or offer clearly labeled common-selector checks later.

### [ ] Do not build an unrestricted port scanner

Reason: It adds abuse, authorization, SSRF, private-network access, logging, and rate-limiting concerns while weakening the DNS product focus.

### [ ] Do not build IP geolocation as a DNS fact

Reason: IP geolocation is approximate third-party data, can vary by provider, and is not authoritative DNS information.

### [ ] Do not create thin record-type clones

Reason: Separate A, AAAA, TXT, CNAME, NS, and CAA pages that only change a query parameter are low-value duplicates. Create a separate page only when it has distinct validation, interpretation, or workflow value.

## Recommended Build Order

### Release 1: coherent MVP

- [ ] Shared DNS query, normalization, error, rate-limit, and result components
- [ ] Unified DNS Record Lookup
- [ ] DNS Change Checker
- [ ] Nameserver Delegation Checker
- [ ] DNS Compare
- [ ] DNS hub with task-based navigation

### Release 2: high-value diagnosis

- [ ] DNS Trace Explorer
- [ ] DNSSEC Chain Checker
- [ ] SOA and Zone Consistency Checker
- [ ] Reverse DNS / PTR Lookup
- [ ] CAA Checker

### Release 3: email DNS cluster

- [ ] SPF Analyzer
- [ ] DMARC Checker
- [ ] DMARC Record Generator
- [ ] DKIM Checker
- [ ] MX Record Checker
- [ ] Email DNS Checker

### Release 4: supporting tools

- [ ] SRV Record Checker
- [ ] BIMI Checker
- [ ] TTL Calculator
- [ ] DNS Record Builder
- [ ] Zone File Validator
- [ ] IDN / Punycode Converter

### Release 5: advanced or infrastructure-dependent

- [ ] TLSA / DANE Checker
- [ ] HTTPS and SVCB Record Checker
- [ ] Global DNS Propagation Checker
- [ ] DNS Monitoring and Change Alerts
- [ ] Historical DNS Records only with legitimate data rights
- [ ] Resolver Performance Test only with valid client-side methodology

## Shared Technical Foundation

Suggested internal result model:

- query name and normalized FQDN
- requested record type
- query mode: recursive, authoritative, iterative, or validating
- resolver or nameserver identity
- observation location when genuinely known
- query timestamp and duration
- DNS response code and flags
- answer, authority, and additional sections
- TTL per record
- DNSSEC validation state when actually validated
- parsed findings with evidence and severity category
- raw response representation

Suggested safety controls:

- Reject URLs where only a hostname or IP is expected.
- Normalize and validate internationalized names before resolution.
- Cap CNAME depth, SPF expansion, redirects, response size, parallelism, and total runtime.
- Prevent any HTTP-fetching tool from reaching loopback, link-local, private, metadata, or internal-only addresses.
- Apply per-IP and per-domain rate limits.
- Cache safe recursive results below their DNS TTL where appropriate.
- Never expose internal resolver addresses, environment values, or infrastructure topology.

## SEO and Publication Rules

- Keep the hub server-rendered with clear descriptions of each tool.
- Give a tool its own indexable URL only when the page performs distinct work.
- Keep arbitrary result URLs and query-parameter variants `noindex, follow` and out of the sitemap.
- Do not publish dozens of record-type pages before their functionality and explanation are materially different.
- Publication remains controlled through `public.version127_pages`; creating a route does not publish it automatically.

## Evidence and Primary References

Market-shape references:

- WhatsMyDNS propagation checker: https://www.whatsmydns.net/
- DNSChecker tool inventory: https://dnschecker.org/all-tools.php
- MXToolbox DNS check: https://mxtoolbox.com/dnscheck.aspx
- CheckHub tool inventory: https://checkhub.org/

Implementation and standards references:

- Google Public DNS over HTTPS: https://developers.google.com/speed/public-dns/docs/doh/
- Cloudflare DNS over HTTPS: https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/make-api-requests/
- DNS concepts and implementation: https://www.rfc-editor.org/rfc/rfc1034 and https://www.rfc-editor.org/rfc/rfc1035
- DNSSEC protocol modifications: https://www.rfc-editor.org/rfc/rfc4035
- ICANN DNSSEC overview: https://www.icann.org/resources/pages/dnssec-what-is-it-why-important-2019-03-05-en/
- SPF: https://www.rfc-editor.org/rfc/rfc7208
- DMARC: https://www.rfc-editor.org/rfc/rfc7489
- CAA: https://www.rfc-editor.org/rfc/rfc8659
- Internationalized domain names: https://www.rfc-editor.org/rfc/rfc5890
- HTTPS and SVCB records: https://www.rfc-editor.org/rfc/rfc9460

## Decision Gate

Before implementation, approve the first release scope and final URL naming. Then use the Version127 test-driven page workflow for every new route, update the route coverage manifest, and publish only the exact approved slugs through `public.version127_pages`.
