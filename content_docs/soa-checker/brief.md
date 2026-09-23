# Brief: SOA Consistency Checker

## Current supporting-content direction

Approved September 6, 2026. Explain independent source comparison, serial evidence and wraparound, timing fields, then persistent mismatches. Matching SOA serials do not prove all zone records match; do not imply the servers are queried as a replication chain.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A DNS operator is investigating a stale secondary or conflicting zone data across authoritative nameservers.

## The job

They leave with every SOA value and serial comparison, including RFC 1982 ordering and the evidence behind any disagreement.

## Show vs say

A comparison table carries MNAME, RNAME, serial, timers, TTL, and negative-cache time per source. Sentences explain serial wraparound, grouped identical address observations, and what each timing field means during diagnosis.
