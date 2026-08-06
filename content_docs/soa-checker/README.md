# SOA Consistency Checker

Route: `/soa-checker`

Publication state: controlled by the exact `soa-checker` row in `public.version127_pages`.

The tool discovers the zone and compares the SOA record returned by every authoritative nameserver address. Show MNAME, RNAME, serial, refresh, retry, expire, minimum, and SOA TTL without hiding differences.

Serial comparison must use RFC 1982 arithmetic so wraparound does not make a newer serial look older. Report whether values agree; do not score the zone or invent universal ideal timing ranges.

Group identical IPv4 and IPv6 observations from the same nameserver, but keep different serials or SOA values in separate rows. Preserve all raw responses. Derive negative cache time as the lower of the SOA record TTL and the MINIMUM field; do not describe MINIMUM alone as the guaranteed negative caching time.

Show a favicon for the submitted hostname when one loads and preserve every per-address observation, summary field, and raw response in the downloadable JSON report. The written explanation should define the serial, MNAME, RNAME, refresh, retry, expire, and negative cache behavior in language a reader can use while debugging a stale secondary.
