# DNS Change Checker

Route: `/dns-tools/dns-change-checker`

Publication state: controlled by the exact `dns-tools/dns-change-checker` row in `public.version127_pages`.

The user enters one name, one record type, and optionally the new value they expect. The tool discovers the zone, asks every reachable authoritative address, then asks every reviewed public resolver. Authoritative results always appear first. Resolver TTL and Authoritative TTL remain separate concepts.

Compare record sets without treating order as meaningful. Keep owner names and aliases. A resolver difference is evidence of a different cached answer, not proof of worldwide propagation or a broken resolver. Location-aware A and AAAA answers may legitimately differ.

Every source keeps its raw response next to the visible records. Do not add a health score or an All query.

Group sources that return the same record set so repeated anycast addresses do not fill the page with duplicate tables. Keep every source name, address, TTL, error, and raw response inside that group. The result heading may show the checked hostname's favicon when `/favicon.ico` loads successfully, and the page exports the complete comparison as CSV.

The explanation flow is: how to run the check, what authoritative versus resolver answers tell the reader, how to interpret Resolver TTL, and when different record sets can be legitimate. The phrase “DNS propagation checker” may appear once because that is how people commonly search for this job, but explain immediately that independent caches refresh over time. Never call this a global propagation test or add a world map.
