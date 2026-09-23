# DNS Lookup

Route: `/dns-lookup`

Publication state: controlled by the exact `dns-lookup` row in `public.stack127_pages`.

The tool reports DNS records for an exact name through Cloudflare, Google Public DNS, Quad9, OpenDNS, AdGuard DNS, Control D, Yandex DNS, or a nameserver that is authoritative for the domain. It supports a selected record type or an All bundle made from separate A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, SRV, DS, and DNSKEY queries. PTR is a separate, IP-address input because it is a reverse lookup and does not belong in the domain-name All bundle.

## Input

- DNS name, hostname, supported service name, HTTP/HTTPS URL whose hostname can be extracted, or an IPv4/IPv6 address when PTR is selected
- record selection
- DNS source: Cloudflare, Google Public DNS, Quad9, OpenDNS, AdGuard DNS, Control D, Yandex DNS, or Authoritative nameserver
- fixed launch flags: `do=false`, `cd=false`

The tool may query `_dmarc.example.com` as TXT, but it must state that returning a TXT value is not DMARC validation.

## Reader flow

Follow `stack127_docs/writing-style.md`. Keep the lookup form before the reference content. The record-type and response tables need to work for someone encountering DNS terms for the first time.

The current content plan is in `brief.md`; its source checks and QA evidence are in `writing-and-seo.md`. Follow the reader from choosing the exact name to interpreting its records, investigating different answers, and checking email or verification names. Use two wrapping tables for record types and response meanings. Explain TTL, DNSSEC, scope, and privacy in connected prose, with unfamiliar terms defined when they matter. Do not require a second alias figure, duplicate troubleshooting table, or a fixed section count.

Use one divider between the interactive tool and this content path. Do not put divider lines between the explanatory sections themselves; spacing and headings should carry that structure.

Each record-type section keeps its own raw provider response beside the readable records. Resolver flags and other provider fields remain available there without adding a second technical summary at the bottom of the result.

After a successful lookup, the result may show the queried website's favicon beside its name. The browser requests `https://<hostname>/favicon.ico` directly, sends no referrer, and removes the image when it cannot load. Service-style names such as `_dmarc` do not trigger a favicon request. There is no placeholder icon and no server-side favicon proxy.

## Resolver TTL

The normalized field is `resolverTtlSeconds: number | null` and the UI label is `Resolver TTL`.

This is the TTL in the selected resolver's response, usually the remaining cache lifetime. It may be lower than the TTL configured by the domain owner. The UI must not promise how long the resolver will serve the answer.

A direct authoritative response is different. The same normalized numeric field is retained for compatibility, but the UI labels and formats it as `Authoritative TTL` without saying that cache time remains.

## DNS sources and transport

Every public resolver uses the same RFC 8484 DNS wire-format adapter with `application/dns-message` over HTTPS. The query uses recursion desired, checking disabled remains false, and no DNSSEC OK request is added at launch. AD is still parsed from the response because the public JSON APIs do not require `do=1` to validate data or report AD.

The fixed public endpoints are:

- Cloudflare: `https://cloudflare-dns.com/dns-query`
- Google Public DNS: `https://dns.google/dns-query`
- Quad9 unfiltered: `https://dns10.quad9.net/dns-query`
- OpenDNS: `https://doh.opendns.com/dns-query`
- AdGuard DNS unfiltered: `https://unfiltered.adguard-dns.com/dns-query`
- Control D unfiltered: `https://freedns.controld.com/p0`
- Yandex DNS Basic: `https://common.dot.dns.yandex.net/dns-query`

The resolver registry owns labels, endpoints, and policy metadata. The picker shows the resolver label without a helper sentence. Do not accept an endpoint from the browser or interpolate a user-controlled hostname into an upstream URL.

Authoritative lookup first walks from the requested name toward its zone using Cloudflare as a fixed bootstrap resolver. It resolves the zone's NS hostname, rejects loopback, private, link-local, documentation, multicast, reserved, and other non-public addresses, then sends a non-recursive DNS query directly to that nameserver on port 53. It starts with UDP and retries over TCP only when the response is truncated. Response IDs must match, reply size and time are bounded, and a non-authoritative answer is rejected.

DS belongs to the parent zone, so an authoritative DS lookup discovers and queries the parent authority. DNSKEY and the other supported types use the authority for the requested name's zone.

## Aliases

Every provider response is inspected for CNAME edges. All bundle results deduplicate compatible edges and show one alias chain above terminal record groups. Terminal records keep their actual owner name and CNAME edges do not inflate A, AAAA, MX, TXT, or other terminal counts.

An explicit CNAME lookup still shows the alias as the requested result.

Per-query alias observations and raw provider responses are retained. Inconsistent chains are shown as separate observations with a warning. Loops and chains longer than 16 edges stop normalized ordering and produce a warning.

## Flags and DNSSEC wording

AD, CD, RD, RA, and TC normalize to `true`, `false`, or `null`. The UI renders Yes, No, or Not reported. Missing or invalid fields never default to false.

The result shows DNSSEC authentication as one compact value: `Authenticated`, `Not authenticated`, `Mixed`, `Not reported`, or `Not checked`. AD true means the selected public resolver reports that it authenticated the returned data. It is not a complete DNSSEC diagnosis. AD false alone does not prove breakage because the name may be unsigned. Authoritative nameservers do not normally validate their own answers for the client, so their AD state is not presented as a DNSSEC verdict. Full validation belongs in the later DNSSEC Chain Checker.

## Raw results

Each query type retains:

- response code
- nullable flags
- terminal records
- alias edges
- authority records
- additional records
- comments

The result keeps every queried record type in its original order. A type without records appears quietly in its own position instead of being collected into a separate empty-results block. Failed types stay in position too.

Readable results use compact record rows rather than a separate table for every type. Each returned record has one copy action for the complete displayed value; individual fields such as MX priority or SOA refresh do not get separate copy buttons. Structured records may show their parts with small field names inside the row so they remain understandable.

Every type shows the complete provider response in a collapsed raw-response disclosure attached to that section. Empty and failed queries keep their raw response with their status instead of moving all provider data into one separate section.

CAA results are never hidden behind the normal five-row preview. Show every policy and summarize the returned `issue`, `issuewild`, and other CAA property counts separately so wildcard certificate rules cannot look absent. Other long record groups may start with five rows and use one result-level Expand all control.

The result header has one compact CSV download action. The export preserves requested type, actual owner name, complete normalized value, TTL seconds, whether the TTL is remaining resolver cache or an authoritative published value, and the selected DNS source. Do not restore a separate actions panel or lookup-link copy buttons.

When the resolver returns SERVFAIL or NXDOMAIN, show one quiet `Trace this name` link in the result header. It opens DNS Trace Explorer with the name and a supported record type already selected. SERVFAIL uses the trace to locate where resolution stopped. NXDOMAIN uses it to confirm where the negative answer came from; do not describe NXDOMAIN itself as a broken configuration. Do not repeat the trace link in every empty record section.

Missing optional sections remain `null`; provider-reported empty sections remain empty arrays.

## Reverse DNS and network context

PTR converts an IPv4 address to its `in-addr.arpa` name or an IPv6 address to its full nibble-reversed `ip6.arpa` name before querying the selected DNS source. An IP entered for any forward record type should ask the reader to choose PTR. PTR never joins All.

Returned public A and AAAA addresses are enriched through Team Cymru's DNS IP-to-ASN service. Store the BGP origin ASN, announced prefix, assigned country code, and ASN description as nullable fields. This is network ownership/routing context, not geolocation, and enrichment failure must never fail or change the DNS answer.

NS hostnames are resolved through the fixed Cloudflare wire-format adapter with separate A and AAAA queries. Show those addresses in a full-width table below the nameserver. Keep the nameserver TTL and copy action in a separate header row so they never cover table columns. Do not call the addresses glue because they may have come from a separate recursive lookup. Enrich those public addresses through the same capped, best-effort ASN path. Cap enrichment at eight nameservers and sixteen unique public addresses per lookup.

## Privacy and limits

- DNS names are sent to the selected public resolver. Authoritative lookup sends bootstrap NS and address questions to Cloudflare, then sends the requested question to the discovered authoritative nameserver.
- NS address lookups are sent to Cloudflare. Public IP addresses returned by the lookup are placed in Team Cymru DNS query names for BGP origin ASN, prefix, and network-description enrichment.
- For website-style names, the browser may request `/favicon.ico` directly from that hostname after the DNS result appears.
- Share URLs expose the lookup name in their query string.
- Stack127 does not store lookup history.
- Analytics must not include names or record values.
- The API uses fixed upstream hosts, public-address validation for direct DNS targets, matching response IDs, bounded response sizes, timeouts, parallelism, alias depth, and weighted rate limits.
