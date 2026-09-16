# IP and ASN Registration Lookup

Canonical route: `/ip-asn-lookup`

Publication state: controlled by the exact `ip-asn-lookup` row in `public.stack127_pages`.

Status: plan.

## Purpose

Show who an IP address range or autonomous system number is registered to, according to the regional internet registry that allocated it.

This is the network equivalent of a registration lookup, and it uses the same RDAP engine. People arrive here from an abuse investigation, a firewall log, or a DNS result where they want to know whose network an address belongs to.

## Input

One of:

- an IPv4 address, `1.1.1.1`
- an IPv6 address
- an autonomous system number, accepted as `13335`, `AS13335`, or `as13335`

Detect the type from the input rather than making the reader pick. Reject CIDR ranges at launch and say we look up a single address.

Reject private, loopback, link-local, documentation, multicast, and other non-public addresses before making any outbound call, matching the existing address validation in `lib/dns/`.

## What the result shows

For an address, lead with the allocation it falls inside, not the address itself.

```
1.1.1.1 is inside 1.1.1.0 to 1.1.1.255, registered to APNIC-LABS in AU. APNIC
records it as an assigned portable allocation.
```

The current result should show the handle, name, country, and allocation type returned by the responsible RIR. Do not hardcode a live record in page copy.

Show:

- the allocation range, its handle, and its name
- the registry that answered, named, which is one of ARIN, RIPE NCC, APNIC, LACNIC, or AFRINIC
- allocation type and registered country
- registration and last changed events when published
- abuse contact from the entity with role `abuse`, which is the field most readers came for
- the parent allocation when published, since a small assignment inside a large ISP block is more informative when both are visible
- remarks and notices, which RIRs use for meaningful operational notes

For an ASN, show the range, the holder name, the registry, the country, and the abuse contact.

Where the reader arrived from a DNS result, offer the reverse direction: a link to DNS Lookup with PTR selected for that address.

## Engine

The IANA RDAP bootstrap files for network objects, all verified reachable on 28 July 2026:

- `https://data.iana.org/rdap/ipv4.json`
- `https://data.iana.org/rdap/ipv6.json`
- `https://data.iana.org/rdap/asn.json`
- `https://data.iana.org/rdap/object-tags.json`

These map an address range or ASN range to the responsible RIR's RDAP service. Committed to the repo and refreshed by script, never fetched during a request, exactly as for the domain bootstrap.

RIR coverage is complete in a way domain coverage is not. Every routable address belongs to an RIR and every RIR runs RDAP, so this tool has no equivalent of the TLD coverage gap. Say so on the page, because it is a genuine difference from the domain tools.

Cache as elsewhere. Allocation records change rarely, so a longer freshness window than domains is defensible.

## Relationship to the existing ASN enrichment

`lib/dns/network-enrichment.ts` already annotates DNS results with BGP origin ASN, announced prefix, and network description from Team Cymru. That answers a different question and the two must stay separate.

- Team Cymru answers: which autonomous system is currently announcing a route to this address in BGP.
- RDAP answers: who is this address range registered to at the RIR.

They disagree routinely and legitimately. An ISP registered a block years ago and a customer announces part of it today. Show both when both are available, labelled by what they mean, and never merge them into one "owner" field.

## What this tool cannot do

- **It is not geolocation.** The country field is the registered country of the allocation holder. A block registered to a company in the Netherlands is routinely used in a dozen countries. This has to be stated clearly because it is the single most common misuse of this data.
- **It cannot identify a person or a customer.** An address inside a residential ISP range returns the ISP, and the subscriber behind it is not public.
- **It cannot tell you what is running on the address.** No ports, no services, no hostnames beyond a separate PTR lookup.
- **It cannot tell you whether the address is malicious.** We do not check blocklists or reputation feeds and we do not plan to.
- **It cannot show allocation history.** Current state only.
- **It cannot resolve a hostname.** An input that is not an address or ASN is rejected with a link to DNS Lookup.

## What the page must tell the reader

- That this is registration data from an RIR, not geolocation, stated where the country field is shown rather than only in a footer.
- Which registry answered, and that the five RIRs publish slightly different fields, so a missing field can mean that registry does not publish it.
- What the abuse contact is for, and what to include in a report.
- That the registered holder and the network currently announcing the route can differ, with both shown when we have both.
- The privacy position: the address queried is sent to the responsible RIR, and we cache the allocation record without recording who asked.

## Content flow

1. Title and a paragraph on what the tool returns and which registries it queries.
2. The form.
3. The allocation, holder, abuse contact, and registry.
4. One divider.
5. Who the RIRs are and how address space is delegated, with a small visual showing IANA to RIR to allocation to assignment. This is what makes the parent and child records make sense.
6. Registration versus routing, explained properly, with the Team Cymru difference named.
7. Why this is not geolocation, with a concrete example.
8. Reporting abuse to a network operator: what the contact is for and what to send.
9. Links to DNS Lookup for PTR and to Domain Registration Lookup.

## Placement note

This is not a domain tool. Its canonical URL is the flat `/ip-asn-lookup` route already recorded in `content_docs/domain-tools/README.md`. Do not create a one-tool `/ip-tools` hub or move the URL after publication. Collection links can be added where the route genuinely serves the reader, without changing ownership or the canonical path.
