# DNS Trace Explorer

Route: `/dns-trace`

Publication state: controlled by the exact `dns-trace` row in `public.version127_pages`. Indexing, metadata, canonical URL, structured data, and sitemap inclusion come only from that row.

## Purpose

Show how one DNS question moves from a root nameserver to a top-level-domain nameserver and then to the authoritative server that returns the final answer. This is genuine iterative resolution similar to `dig +trace`, not a sequence assembled from recursive resolver answers.

The page should help a reader answer one question: where did this DNS journey stop or change direction?

## Input

- Exact domain, hostname, service name, or HTTP/HTTPS URL whose hostname can be extracted.
- One record type: A, AAAA, CNAME, MX, NS, TXT, CAA, SOA, SRV, DS, or DNSKEY.
- A is selected by default.

Do not offer All, ANY, or a resolver picker. A trace follows one DNS question directly from the root. Repeating the same delegation path for a bundle would add noise without helping the reader.

## Result

Render the journey as one ordered vertical path. Each step uses a full natural sentence to say what happened, followed by compact structured evidence:

- server hostname and address;
- question name and record type;
- response code and response time;
- referral zone and nameservers when present;
- in-domain or sibling glue A and AAAA records from the referral's Additional section;
- other nameserver addresses included with the referral, labeled separately rather than called glue;
- answer records and TTLs;
- failed server attempts before a usable response;
- complete raw DNS response in a collapsed disclosure.

The result heading summarizes the trace in natural sentences: step count, total time, final response code, and whether the last response was authoritative. Do not split these facts into dashboard cards.

Show the first four referral nameservers or addresses initially. When a referral includes more, offer a small inline control that reveals the complete list without requiring the reader to inspect raw JSON. Keep the full raw response available separately.

The server line must show the question actually sent at that step, including its name and record type. This engine asks the selected record type throughout the referral walk; do not relabel root or TLD questions as NS queries.

If a response returns only a CNAME for a non-CNAME question, show the alias and restart the iterative trace for its target. Preserve aliases returned alongside a terminal answer. Stop loops and excessive alias depth.

One compact Copy trace action may sit beside the result heading. Do not add a separate actions panel or per-field copy buttons.

## Engine

- Start from a reviewed IANA root-hints list.
- Send non-recursive DNS wire queries directly to public nameserver IP addresses.
- Follow NS referrals toward the requested name.
- Use only public A or AAAA nameserver addresses included with a referral. Label an address as glue when the nameserver is inside the delegated zone or a sibling beneath the delegating parent zone; keep unrelated matching Additional-section addresses separate.
- When a referral supplies no usable address, resolve its NS hostname with the same bounded iterative engine rather than a recursive DoH shortcut.
- Retry over TCP when the UDP response is truncated.
- Match response IDs and bound response size, per-query time, total query count, referrals, aliases, nested nameserver resolution, and server attempts.
- Never query loopback, private, link-local, documentation, multicast, reserved, or other non-public targets.
- A failed supporting NS-address lookup must remain visible as the reason the trace cannot continue.

The trace observes the path from the Version127 server. It does not describe the visitor's recursive resolver cache, ISP, geographic location, or worldwide propagation. It does not validate DNSSEC cryptography; link that limitation directly to DNSSEC Chain Checker. When the trace stops at a referral or cannot reach the delegated servers, point the reader to Nameserver Delegation Checker with the name filled in.

## Content flow

Keep the working tool first. Below it, use the same simple, human writing style as DNS Lookup:

1. explain the root-to-answer journey in a small visual;
2. explain what the visible trace steps mean;
3. explain the common places a trace stops;
4. distinguish a trace from a normal recursive lookup;
5. close with a short privacy and scope sentence.

Avoid eyebrows, glossary-like fragments, health scores, propagation claims, and a large technical-details section.
