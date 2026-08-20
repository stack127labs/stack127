# Stack127 DNS Tools Launch Plan

Date: 2026-07-13
Status: approved for local implementation

This document keeps the approved plan for the five DNS tools that follow DNS Lookup and DNS Trace Explorer. Each tool is a separate product page with one clear job. The pages may reuse safe DNS code internally, but they must not become one combined health report or copy the same result layout without regard for the question being answered.

All writing follows `stack127_docs/writing-style.md`: full sentences, simple language, useful evidence first, and no decorative eyebrows, floating helper copy, health scores, or false certainty.

## DNS Change Checker

Route: `/dns-change-checker`

The page answers: Is a new DNS value published at the authoritative source, and what do major public resolver caches return now?

Input:

- exact domain or hostname;
- one record type: A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, SRV, DS, or DNSKEY;
- optional expected answer.

Result:

- lead with a natural conclusion;
- query every delegated authoritative nameserver address;
- compare Cloudflare, Google, Quad9, OpenDNS, AdGuard DNS, Control D, and Yandex DNS;
- keep authoritative TTL and resolver TTL meanings separate;
- keep CNAME chains and actual owner names;
- compare complete normalized RRsets without depending on record order;
- retain one raw response with each source;
- distinguish NXDOMAIN, NODATA, SERVFAIL, REFUSED, timeout, and partial results;
- never call the result global propagation or automatically call a different address stale.

The page content explains the authoritative source, resolver caches, remaining cache lifetime, negative caching, and legitimate location-aware address differences.

## Nameserver Delegation Checker

Route: `/nameserver-checker`

The page answers: Does the parent zone point to the right nameservers, and can those servers actually serve the delegated zone?

Input:

- one domain or hostname; the engine discovers the closest delegated zone.

Result:

- compare the parent delegation with the child apex NS records;
- show parent-only, child-only, and matching nameservers;
- query each nameserver and public address pair;
- classify in-domain, sibling, and out-of-bailiwick nameserver addresses correctly;
- check required in-domain glue and compare it with authoritative A and AAAA records;
- detect NS targets that are CNAME aliases;
- test UDP, TCP, response code, and authoritative AA behavior;
- identify lame, unreachable, refused, and partially working nameservers;
- retain raw evidence with the parent, child, and individual server that produced it.

This page does not compare SOA serials or validate DNSSEC. SOA is used only to prove that a server is authoritative for the zone.

## DNSSEC Chain Checker

Route: `/dnssec-checker`

The page answers: Can this DNS answer be validated from the DNS root, and where does the authentication chain stop if it cannot?

Input:

- domain or hostname;
- one record type: A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, or SRV.

Result:

- friendly states: Validated, Unsigned, Validation failed, or Could not determine;
- retain the exact DNSSEC states secure, insecure, bogus, and indeterminate;
- render an ordered root-to-answer chain;
- show parent DS, child DNSKEY, DS-to-DNSKEY matches, algorithms, digests, RRSIG times, and authenticated denial records where relevant;
- handle multiple keys, multiple algorithms, rollovers, aliases, NSEC, NSEC3, expired signatures, missing signatures, and unsupported algorithms;
- keep raw evidence with each chain step.

The verdict must come from a real validating resolver such as a pinned local Unbound/libunbound service with a maintained root trust anchor. Record presence alone is not validation. Validator infrastructure failure must be reported as undetermined, never as an unsigned or broken domain.

## SOA Consistency Checker

Route: `/soa-checker`

The page answers: Are all authoritative nameservers serving the same zone version and the same core SOA settings?

Input:

- one domain or hostname; the engine discovers the applicable zone.

Result:

- query every authoritative nameserver and public address pair directly;
- compare serial, MNAME, RNAME, refresh, retry, expire, SOA TTL, and negative cache TTL;
- use RFC 1982 serial arithmetic, including wraparound and undefined ordering;
- distinguish serial mismatch from equal serials with different SOA settings;
- show timeout, REFUSED, SERVFAIL, missing AA, and missing SOA results in place;
- retain raw evidence with each nameserver response.

This page does not score timer choices or claim that one request to an anycast address proves every backend instance is synchronized.

## CAA Policy Checker

Route: `/caa-checker`

The page answers: Which certificate authority issuer domains are currently authorized for normal and wildcard certificates for this name?

Input:

- one domain or hostname.

Result:

- show the exact CAA search path from the requested name toward its parents;
- follow aliases for each exact lookup while keeping tree climbing based on the original name;
- stop at the first non-empty CAA RRset;
- calculate normal and wildcard authorization separately;
- apply `issuewild` precedence correctly;
- treat `issue` as the wildcard policy when no `issuewild` property exists;
- handle empty and malformed issuer values, additive authorization, parameters, `iodef`, unknown tags, and critical flags;
- do not fetch `iodef` URLs;
- retain every search-step response and the complete effective RRset.

When DNSSEC applies, a bogus answer makes the CAA policy undetermined and links to DNSSEC Chain Checker. The page does not scan certificates, generate CAA records, or claim that CAA validates existing certificates.

## Shared route and publication requirements

- Each route has its own server-rendered explanation, interactive client result, API contract, colocated styles, tests, and exact `public.stack127_pages` row.
- Query-param variants remain `noindex, follow` with the clean canonical.
- Publication rows are added to the local database only during local implementation. Production publication remains a separate explicit action.
- The DNS sidebar and hub list only tools that are locally complete and available.
- API responses use `Cache-Control: no-store`, same-origin checks, strict request limits, bounded DNS work, safe public-address validation, response ID checks, UDP-to-TCP fallback, and weighted rate limits.
- No result history is stored and queried names or returned DNS values are not sent to analytics.

## Primary standards

- DNS terminology and delegation: RFC 8499
- Glue in referrals: RFC 9471
- DNS over TCP: RFC 7766
- Negative caching: RFC 2308
- Serial arithmetic: RFC 1982
- DNSSEC: RFC 4033, RFC 4034, and RFC 4035
- CAA policy processing: RFC 8659 and RFC 8657
