# DNS Tools

The `/dns-tools` surface groups compact, evidence-first DNS troubleshooting tools. Each complete tool has its own exact published registry row so it can use its own metadata, canonical URL, structured data, and sitemap entry.

## Rules

- Keep the useful input and result above the explanatory content.
- Use the shared Version127 shell and DNS tools sidebar.
- The DNS tools sidebar is a clean list of tool routes that are available now, matching the course sidebar pattern. Do not add an in-page table of contents, planned tools, disabled links, or coming-soon labels.
- Keep public explanations server-rendered.
- Keep user-requested DNS results client-rendered and out of search indexing.
- Query public resolvers only through the fixed, reviewed DNS-over-HTTPS endpoints in `lib/dns/resolvers.ts`.
- Use one RFC 8484 DNS wire adapter for every public resolver. Provider-specific JSON formats are not part of the lookup contract.
- Keep authoritative lookup separate from recursive resolver lookup. Discover the zone and nameserver through the fixed Cloudflare bootstrap, reject non-public target addresses, then query the authoritative server directly over DNS with TCP fallback for truncated replies.
- Never describe one resolver lookup as global propagation.
- Never replace technical findings with a health score.
- Do not create thin pages that only change the record type.
- The All option runs a defined set of separate queries for every record type offered by the tool. Do not replace it with an `ANY` query.
- Unknown, absent, and invalid provider values remain unknown rather than becoming false or empty.
- Optional IP/ASN and nameserver-address enrichment is capped, uses fixed reviewed DNS services, and must never block or alter the primary DNS result.
- DNS Trace Explorer is different from resolver lookup. It starts from reviewed IANA root hints, sends bounded non-recursive queries directly to nameservers, follows referrals, and never builds a fake trace from recursive DoH answers.
- DNSSEC verdicts must come from a real local validator. A resolver's AD flag is supporting evidence, not the verdict.
- Keep DNS Change, delegation, DNSSEC, SOA, and CAA as separate tools. They may share bounded DNS adapters, but their inputs, conclusions, and result views must stay focused on their own question.

## Publication

The hub and every complete tool slug are published only through `public.version127_pages`. An exact published tool row is `index, follow` and appears in the sitemap. Query-param lookup states are `noindex, follow` and keep the clean tool canonical.

See the page files in this folder for each implemented tool contract.
