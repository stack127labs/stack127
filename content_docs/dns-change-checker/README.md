# DNS Change Checker

Route: `/dns-change-checker`

Publication state: controlled by the exact `dns-change-checker` row in `public.stack127_pages`.

The user enters one name, one record type, and optionally the new value they expect. The tool discovers the zone, asks every reachable authoritative address, then asks every reviewed public resolver. Authoritative results always appear first. Resolver TTL and Authoritative TTL remain separate concepts.

Compare record sets without treating order as meaningful. Keep owner names and aliases. When authoritative replies differ, use the record set returned by the largest number of usable authoritative sources as the resolver comparison baseline; never let whichever address happened to answer first decide the result. Count agreement only among usable resolver replies, and state timeouts or other unavailable resolvers separately so they are not mistaken for different answers. Explain that a difference can be a change still settling or an intentional location-aware answer, not automatic proof of a DNS problem. A resolver difference is evidence of a different cached answer, not proof of worldwide propagation or a broken resolver.

Every source keeps its raw response next to the visible records. Do not add a health score or an All query.

Group sources that return the same record set so repeated anycast addresses do not fill the page with duplicate tables. Keep every source name, address, TTL, error, and raw response inside that group. The result heading may show the checked hostname's favicon when `/favicon.ico` loads successfully, and the downloadable JSON report preserves the complete comparison and raw evidence.

The explanation flow is: how to run the check, what authoritative versus resolver answers tell the reader, how to interpret Resolver TTL, and when different record sets can be legitimate. The phrase “DNS propagation checker” may appear once because that is how people commonly search for this job, but explain immediately that independent caches refresh over time. Never call this a global propagation test or add a world map.
