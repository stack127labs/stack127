# Nameserver Delegation Checker

Route: `/dns-tools/nameserver-checker`

Publication state: published locally through the exact registry row. Production publication remains a separate explicit action.

The tool discovers the closest delegated zone, compares the NS set published by the parent with the NS set returned by the child, and checks every public address over UDP and TCP. A reachable server is not automatically healthy: it must also return an authoritative SOA for the zone.

Show in-domain and sibling glue only when it is actually glue. Do not call an out-of-bailiwick address missing glue. Keep parent and child raw responses. SOA serial comparison and DNSSEC validation belong to their own tools.

The result must make the handoff visible as parent zone, delegated zone, then authoritative servers. Glue wording must distinguish required in-zone glue, optional sibling glue, and nameserver addresses that are outside the parent bailiwick and need no glue in this referral. Keep NS evidence separate from direct UDP/TCP reachability evidence.

Show a favicon for the submitted hostname when one loads, and provide a CSV export of both NS lists, glue, addresses, reachability, and authoritative status. The page copy should help a reader understand which registrar or DNS-provider setting to fix when the lists disagree.
