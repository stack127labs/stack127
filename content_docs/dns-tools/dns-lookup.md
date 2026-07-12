# DNS Lookup

Route: `/dns-tools/dns-lookup`

The tool reports what Cloudflare or Google Public DNS returns for an exact DNS name. It supports a selected record type or a Common records bundle made from separate A, AAAA, CNAME, MX, NS, TXT, CAA, and SOA queries.

## Input

- DNS name, hostname, supported service name, or HTTP/HTTPS URL whose hostname can be extracted
- record selection
- resolver: Cloudflare or Google Public DNS
- fixed launch flags: `do=false`, `cd=false`

The tool may query `_dmarc.example.com` as TXT, but it must state that returning a TXT value is not DMARC validation.

## Reader flow

Keep the lookup form before the reference content. Do not turn the page into a glossary or a stack of labeled helper blocks. The page should feel composed by someone who understands which parts of a DNS answer will confuse the reader.

Use complete, natural sentences. Let typography, spacing, tables, and visual relationships create hierarchy instead of eyebrows, decorative labels, colored sentence fragments, or oversized warning panels.

After the tool, keep one connected path:

1. show how to run a useful lookup with an exact name, record selection, and resolver
2. explain aliases, owner names, values, Resolver TTL, response status, and raw data
3. show the supported record types in one simple table
4. connect common troubleshooting jobs to the record types and values worth comparing
5. use one simple table for response meanings, then explain resolver differences, scope, and privacy without splitting every caveat into a separate section

Technical flags belong in Technical details. Each record-type section keeps its own raw provider response beside the normalized records. Neither should dominate the main result.

## Resolver TTL

The normalized field is `resolverTtlSeconds: number | null` and the UI label is `Resolver TTL`.

This is the TTL in the selected resolver's response, usually the remaining cache lifetime. It may be lower than the TTL configured by the domain owner. The UI must not promise how long the resolver will serve the answer.

## Aliases

Every provider response is inspected for CNAME edges. Common bundle results deduplicate compatible edges and show one alias chain above terminal record groups. Terminal records keep their actual owner name and CNAME edges do not inflate A, AAAA, MX, TXT, or other terminal counts.

An explicit CNAME lookup still shows the alias as the requested result.

Per-query alias observations and raw provider responses are retained. Inconsistent chains are shown as separate observations with a warning. Loops and chains longer than 16 edges stop normalized ordering and produce a warning.

## Flags and DNSSEC wording

AD, CD, RD, RA, and TC normalize to `true`, `false`, or `null`. The UI renders Yes, No, or Not reported. Missing or invalid fields never default to false.

AD true means the selected resolver reports that it authenticated the returned data. It is not a complete DNSSEC diagnosis. AD false alone does not prove breakage because the name may be unsigned. Full validation belongs in the later DNSSEC Chain Checker.

## Technical details and raw results

Each query type retains:

- response code
- nullable flags
- terminal records
- alias edges
- authority records
- additional records
- comments

Every result section shows the complete provider response for that query in a collapsed raw-response disclosure. Empty and failed queries keep their raw response with their status instead of moving all provider data into one separate section.

Missing optional sections remain `null`; provider-reported empty sections remain empty arrays.

## Privacy and limits

- DNS names are sent to the selected public resolver.
- Share URLs expose the lookup name in their query string.
- Version127 does not store lookup history.
- Analytics must not include names or record values.
- The API uses fixed upstream hosts, bounded response sizes, timeouts, parallelism, alias depth, and weighted rate limits.
