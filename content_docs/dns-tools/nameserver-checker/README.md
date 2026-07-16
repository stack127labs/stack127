# Nameserver Delegation Checker

Route: `/dns-tools/nameserver-checker`

Publication state: controlled by the exact `dns-tools/nameserver-checker` row in `public.version127_pages`.

The tool discovers the closest delegated zone, compares the NS set published by the parent with the NS set returned by the child, and checks every public address available to this checker over UDP and TCP. A reachable server is not automatically healthy: it must also return an authoritative SOA for the zone. Probe the checker's IPv6 route before contacting IPv6 nameserver addresses. When the checker has no IPv6 route, keep those addresses visible as skipped and never report them as domain failures.

Show in-domain and sibling glue only when it is actually glue. Do not call an out-of-bailiwick address missing glue. Compare required parent glue with the A and AAAA records published by the authoritative zone. Test UDP and TCP independently because an authoritative DNS server needs both. Show exact shared IPs as warnings, while a shared ASN or network prefix is useful context rather than a health score. Keep parent, child, address, and transport raw responses. SOA serial comparison and DNSSEC validation belong to their own tools.

The result must make the handoff visible as parent zone, delegated zone, then authoritative servers. Glue wording must distinguish required in-zone glue, optional sibling glue, and nameserver addresses that are outside the parent bailiwick and need no glue in this referral. Keep NS evidence separate from direct UDP/TCP reachability evidence.

Show a favicon for the submitted hostname when one loads. The downloadable JSON report must preserve the complete normalized result: input and timing, parent and child NS evidence, glue, address data, per-address UDP and TCP status, SOA evidence, ASN context, findings, notes, skipped checks, and every raw response. Do not collapse per-address failures into one nameserver-level boolean. The page copy should help a reader understand which registrar or DNS-provider setting to fix when the lists disagree.
