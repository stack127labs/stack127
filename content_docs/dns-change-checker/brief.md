# Brief: DNS Change Checker

## Current supporting-content direction

Approved September 6, 2026. Connect authoritative publication to cached answers, then explain TTL and legitimate source differences. Use diagnostic links for delegation and signing failures. Agreement among sampled servers does not prove worldwide propagation.

The working tool stays first. Follow `stack127_docs/writing-style.md` for writing and visual choices. Store live copy only in the development tool-page row through the reviewed content command. Publication remains a separate operation.

## Who is here

A domain operator changed a DNS value and needs to compare authoritative answers with reviewed public resolver caches.

## The job

They leave knowing which sources agree, which differ or failed, and whether the expected value is visible without mistaking the result for worldwide propagation.

## Show vs say

The tool groups identical record sets and keeps authoritative sources before resolvers. Tables carry values, source names, TTLs, and raw evidence. Sentences interpret disagreements, unavailable sources, cache timing, and legitimate location-aware answers.
