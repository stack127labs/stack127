# DNS Lookup Implementation Plan

Date: 2026-07-12
Status: implemented; release verification in progress
Parent backlog: `content_ideas/2026-07-11-dns-tools-suite.md`

## Scope

The first DNS tool is a unified recursive DNS lookup at `/dns-tools/dns-lookup`. The release should also include a small server-rendered `/dns-tools` hub so the first tool has stable navigation and future tools can join the same namespace.

The lookup answers one question:

> What DNS records does this exact name return through the selected public resolver right now?

The tool will:

- query Cloudflare or Google Public DNS through a Version127 server endpoint
- support one selected record type or a defined Common records bundle
- show readable records and complete per-query technical responses
- preserve record owner names, resolver-reported TTLs, response codes, nullable flags, aliases, authority data, additional data, comments, and query timing
- explain what the selected resolver reported without claiming configuration correctness
- create shareable lookup URLs that run a fresh query

The tool will not:

- create separate thin pages for each record type
- use an `ANY` query
- claim global DNS propagation
- present a domain health score
- perform a complete DNSSEC diagnosis
- validate DMARC, SPF, DKIM, email delivery, website availability, WHOIS, geolocation, or open ports

## Routes and Publication State

### `/dns-tools`

Purpose: compact server-rendered hub and stable suite navigation.

Initial content:

- `DNS tools` H1
- short explanation of the troubleshooting suite
- one active DNS Lookup card
- a compact text-only roadmap for DNS Change Checker, Nameserver Checker, DNS Compare, DNS Trace, and DNSSEC Checker

Unreleased tools must not be broken links.

Recommended registry values:

- label: `DNS tools`
- page type: `CollectionPage`
- final state: published only after the release gate passes

### `/dns-tools/dns-lookup`

Purpose: the interactive recursive DNS lookup.

Recommended registry values:

- label: `DNS lookup`
- meta title: `DNS Lookup: Check Domain Records | Version127`
- meta description: `Enter a domain or hostname to check its A, AAAA, CNAME, MX, NS, TXT, CAA, SOA and other public DNS records.`
- page type: `WebApplication`
- final state: published only after the release gate passes

Both routes remain unpublished during implementation. Publication, metadata, canonical URLs, robots rules, sitemap inclusion, dates, and page JSON-LD remain controlled by `public.version127_pages` and the shared registry layout.

## Page Layout

Use the existing `AppShell` and `AppSidebar`.

Desktop:

- sticky DNS tools sidebar in the existing sidebar column
- main content constrained to a readable tool width
- page header first
- lookup form immediately after the introduction
- result area immediately after the form
- server-rendered reference content below the interactive result area

Mobile:

- existing off-canvas sidebar drawer with `DNS tools` as the menu label
- form controls stacked vertically
- result rows converted to label-value cards where a table would overflow
- copy and expand controls sized for touch

No map, decorative hero image, chart, fake status gauge, or oversized introduction.

## Sidebar

The first release sidebar contains usable navigation only.

Main navigation:

- DNS tools overview
- DNS lookup, with an active state on the tool page

On this page:

- Look up records
- Record types
- DNS status meanings
- Limitations and privacy
- FAQ

Future published tools will be added through a shared DNS tool navigation configuration. The sidebar must not be filled with disabled controls.

## User Input

### DNS name

One required text input.

Quick examples:

- `example.com`
- `www.example.com`
- `mail.example.com`

The tool may accept `_dmarc.example.com`, but it must explain that a TXT lookup only returns the published value and does not validate DMARC policy.

Accepted input can include:

- domain names
- hostnames
- service names such as `_sip._tcp.example.com`
- a pasted HTTP or HTTPS URL, from which only the hostname is extracted
- Unicode domain names, converted to their ASCII form for the DNS query

Normalization and validation:

- trim surrounding whitespace
- preserve the original input for display
- normalize the query name consistently
- handle a final trailing dot
- convert internationalized names safely
- enforce total DNS name and label length limits
- reject credentials, ports where a DNS name is expected, invalid URL syntax, unsupported control characters, and malformed names
- do not make an HTTP request to the entered domain

### Record selection

Default: `Common records`

Launch options:

- Common records
- A
- AAAA
- CNAME
- MX
- NS
- TXT
- CAA
- SOA
- SRV
- DS
- DNSKEY

Common records expands to separate A, AAAA, CNAME, MX, NS, TXT, CAA, and SOA queries. It does not send `ANY`.

PTR is excluded because it expects an IP address and belongs in the future Reverse DNS tool.

### Resolver

Launch options:

- Cloudflare, default
- Google Public DNS

The server queries exactly the selected resolver. It must not silently fall back to a different resolver because the result would then mislabel its source.

### Launch request flags

Provider requests use:

- `do=false`
- `cd=false`

`do=1` requests DNSSEC records such as RRSIG, NSEC, and NSEC3. It is not required for Google or Cloudflare to perform validation or report the AD flag through their JSON APIs.

The first release does not expose DO or CD as user controls.

### Submission behavior

- submit label: `Look up DNS`
- Enter submits the form
- a new submission aborts the previous browser request
- the user can edit the query while reviewing results
- loading, partial success, completion, and error states are announced accessibly

## Resolver TTL Semantics

The TTL returned by Cloudflare or Google Public DNS is the TTL in that resolver's response. For a cached recursive answer, it is usually the remaining cache lifetime. It is not necessarily the TTL configured by the domain owner.

Required normalized field:

```ts
resolverTtlSeconds: number | null;
```

Required UI label:

```text
Resolver TTL
```

Example rendering:

```text
300 seconds, about 5 minutes remaining
```

Required explanation when Cloudflare is selected:

```text
This is the remaining cache lifetime reported by Cloudflare. It may be lower than the TTL configured by the domain owner.
```

Use the selected resolver name dynamically for Google.

Forbidden wording:

- `Configured TTL`
- `The domain owner set this TTL`
- `The resolver will serve this answer for five minutes`
- any guaranteed duration based only on the response TTL

If the provider omits TTL or supplies an invalid TTL, normalize it to `null` and render `Not reported`.

## CNAME and Alias Handling

Recursive responses may contain CNAME edges followed by terminal records belonging to the canonical target. Common records sends several separate queries, so the same CNAME edge may appear in several provider responses.

### Required alias type

```ts
type DnsAliasEdge = {
  from: string;
  to: string;
  resolverTtlSeconds: number | null;
};
```

The top-level normalized response contains:

```ts
aliasChain: DnsAliasEdge[];
```

Each per-query result also retains the alias edges observed in that specific provider response. This is required for inconsistency detection and technical inspection.

### Common bundle behavior

For every individual provider response:

1. Extract all CNAME edges.
2. Preserve their exact owner and target names after consistent canonical normalization.
3. Deduplicate identical `from` and `to` edges observed across responses.
4. Do not count a CNAME answer as an A, AAAA, MX, TXT, or other terminal record.
5. Preserve the actual owner name on every terminal record.
6. Compare per-query alias observations before creating the unified top-level chain.

If the observations are compatible:

- order the deduplicated edges into one `aliasChain`
- show the alias chain once above the terminal record groups
- group terminal records under their actual owner name

Example:

```text
www.example.com is an alias for edge.example.net. The records below may belong to the alias target.

A records for edge.example.net
```

If separate queries return inconsistent alias chains:

- do not merge them into a misleading single chain
- return a structured alias inconsistency warning
- preserve the per-query alias observations
- show each observed chain with the query type that produced it
- keep all terminal records attached to their actual owner names

### Explicit CNAME lookup

An explicit CNAME lookup must show the alias itself as the requested result. It must not hide the result only because the same edge would normally be moved into the Common bundle alias summary.

### Loop and depth protection

The alias normalizer must:

- detect a repeated owner in a chain
- identify CNAME loops
- stop ordering a chain after the configured maximum depth
- return a structured warning for loops or excessive depth
- preserve the original raw provider response even when normalized ordering stops

Initial maximum normalized alias depth: 16 edges.

The tool does not recursively fetch websites or IP endpoints reached through an alias.

## Nullable DNS Flags

Missing or invalid provider flags must not default to `false`.

Required type:

```ts
type DnsFlags = {
  authenticatedData: boolean | null;
  checkingDisabled: boolean | null;
  recursionDesired: boolean | null;
  recursionAvailable: boolean | null;
  truncated: boolean | null;
};
```

Parser behavior:

- provider `true` becomes `true`
- provider `false` becomes `false`
- absent, `null`, incorrectly typed, or otherwise invalid becomes `null`
- invalid fields produce a defensive parse warning when useful for debugging

UI rendering:

- `true`: `Yes`
- `false`: `No`
- `null`: `Not reported`

The same defensive distinction applies to optional provider fields:

- a reported empty array remains `[]`
- an absent or invalid array becomes `null`
- an absent comment field becomes `null`
- valid comments are preserved as normalized strings
- authority records and additional records preserve their record owner, type, value, and resolver TTL
- no missing field is invented as an empty successful result

## AD and DNSSEC Wording

Continue parsing AD as `authenticatedData: boolean | null` when launch requests use `do=false` and `cd=false`.

When `authenticatedData` is `true`:

```text
DNSSEC authentication reported: Yes
The selected resolver reports that it authenticated the returned data. This is not a complete diagnosis of the domain's DNSSEC configuration.
```

When it is `false`:

```text
DNSSEC authentication reported: No
The resolver did not report this answer as authenticated. This alone does not prove DNSSEC is broken; the name may be unsigned.
```

When it is `null`:

```text
DNSSEC authentication reported: Not reported
```

Do not claim that AD is meaningless unless `do=1`. Do not claim that AD false proves a DNSSEC failure.

Full chain validation, DS and DNSKEY matching, signature timing, and failure diagnosis remain the responsibility of the later DNSSEC Chain Checker.

## Normalized Response Model

The provider adapters return a common defensive model. Provider-specific property names must not leak into UI components.

```ts
type DnsResolver = "cloudflare" | "google";

type DnsFlags = {
  authenticatedData: boolean | null;
  checkingDisabled: boolean | null;
  recursionDesired: boolean | null;
  recursionAvailable: boolean | null;
  truncated: boolean | null;
};

type DnsAliasEdge = {
  from: string;
  to: string;
  resolverTtlSeconds: number | null;
};

type NormalizedDnsRecord = {
  ownerName: string;
  type: string;
  typeCode: number | null;
  value: string;
  resolverTtlSeconds: number | null;
};

type DnsAliasObservation = {
  requestedType: string;
  aliasChain: DnsAliasEdge[];
};

type DnsQueryResult = {
  requestedName: string;
  requestedType: string;
  responseCode: string | null;
  responseCodeNumber: number | null;
  flags: DnsFlags;
  terminalRecords: NormalizedDnsRecord[];
  aliasChain: DnsAliasEdge[];
  authorityRecords: NormalizedDnsRecord[] | null;
  additionalRecords: NormalizedDnsRecord[] | null;
  comments: string[] | null;
  warnings: DnsWarning[];
  rawResponse: unknown;
};

type DnsLookupResponse = {
  query: {
    originalInput: string;
    normalizedName: string;
    selection: string;
    resolver: DnsResolver;
    dnssecRecordsRequested: false;
    checkingDisabled: false;
  };
  checkedAt: string;
  durationMs: number;
  aliasChain: DnsAliasEdge[];
  aliasObservations: DnsAliasObservation[];
  queryResults: DnsQueryResult[];
  warnings: DnsWarning[];
};
```

`DnsWarning` is a structured code plus reader-safe message and optional query-type context. Initial warning codes include:

- `alias_chain_inconsistent`
- `alias_loop_detected`
- `alias_depth_exceeded`
- `provider_field_invalid`
- `partial_lookup_failure`

For explicit CNAME requests, CNAME answers remain visible as the requested result. For other requested types, extracted CNAME edges are not counted among `terminalRecords`.

## Internal API Contract

Endpoint:

```text
POST /api/dns/lookup
```

Common request:

```json
{
  "name": "www.example.com",
  "selection": "common",
  "resolver": "cloudflare"
}
```

Explicit request:

```json
{
  "name": "www.example.com",
  "selection": "CNAME",
  "resolver": "google"
}
```

The API sets or preserves launch behavior equivalent to:

```json
{
  "do": false,
  "cd": false
}
```

The client cannot override those flags in the first release.

The response follows `DnsLookupResponse` and includes every per-query `rawResponse`. The combined response must never replace several raw provider responses with one synthetic raw object.

HTTP and DNS errors remain separate:

- upstream HTTP status describes transport or provider API handling
- DNS response code describes the DNS query outcome
- a provider HTTP 200 can contain a DNS failure
- one failed Common bundle query does not erase successful query results

## Result Rendering

### Summary

Show:

- normalized query name
- selected resolver
- number of record types queried
- number with terminal answers
- number with no terminal answer
- number that failed
- lookup timestamp
- total duration

Do not count alias edges as terminal records.

### Alias summary

For a compatible Common bundle alias chain, show one alias summary above record groups.

Example:

```text
www.example.com is an alias for edge.example.net. The records below may belong to the alias target.
```

For several edges, render an ordered chain. Every edge shows its own Resolver TTL if reported.

For inconsistent observations, render a warning followed by the observed chains and their source query types. Do not select a winner.

### Record groups

Group terminal records by requested type and actual owner name.

Examples:

- `A records for edge.example.net`
- `MX records for example.com`
- `TXT records for _dmarc.example.com`

Every record displays:

- owner name
- type
- type-specific parsed value
- `Resolver TTL`
- copy action

Resolver TTL example:

```text
300 seconds, about 5 minutes remaining
```

Type-specific fields:

- A: IPv4 address
- AAAA: IPv6 address
- CNAME: owner and alias target
- MX: priority and exchanger
- NS: nameserver target
- TXT: readable combined value plus preserved raw segments where available
- CAA: flags, property tag, and value
- SOA: primary server, responsible mailbox, serial, refresh, retry, expire, and negative-cache field
- SRV: priority, weight, port, and target
- DS: key tag, algorithm, digest type, and digest
- DNSKEY: flags, protocol, algorithm, and expandable key

Long values are visually collapsed with explicit expand and copy controls. They remain complete in the DOM when expanded and in Technical details.

### Technical details

Technical details are separated per query type. Each section contains:

- requested name and type
- resolver
- response code and number
- every nullable flag rendered as Yes, No, or Not reported
- question information when reported
- normalized answers
- normalized authority records or Not reported
- normalized additional records or Not reported
- comments or Not reported
- alias edges extracted from that response
- complete raw provider response

The raw view must make it possible to audit why two Common bundle queries produced different alias observations.

## Status and Error Rendering

Required distinctions:

- records found
- `NOERROR` with no terminal answer
- `NXDOMAIN`
- `SERVFAIL`
- `REFUSED`
- provider timeout
- provider HTTP error
- provider rate limit
- invalid provider field
- partial Common bundle success
- inconsistent aliases
- alias loop
- excessive alias depth

Forbidden claims:

- `Your DNS is healthy`
- `Your DNS is fully propagated`
- `The configured TTL is...`
- `Cloudflare will serve this for...`
- `DNSSEC is broken` based only on AD false
- `DMARC is valid` based on a TXT lookup

## Server and Client Rendering

Server-rendered content:

- shared page shell and sidebar
- visible breadcrumb
- H1 and direct introduction
- form labels and non-result shell
- record-type reference
- DNS status explanations
- Resolver TTL explanation
- CNAME and terminal-owner explanation
- DNSSEC AD caveat
- limitations and privacy
- FAQ

Client-rendered behavior:

- form state
- validation feedback
- submission and cancellation
- result rendering
- alias-chain rendering
- inconsistent-chain warnings
- per-query Technical details
- copy actions
- raw response expansion
- share URL generation
- restoring and rerunning valid lookup query parameters

Dynamic user-requested DNS results are not SEO content and should load from the internal API after hydration. Query-param page variants remain `noindex, follow` with the clean canonical URL.

## Server Flow

1. Receive same-origin POST request.
2. Validate request body and resolver enum.
3. Normalize the DNS name.
4. Expand Common records to an allowlisted query set.
5. Apply weighted rate limiting and request limits.
6. Send separate provider queries with `do=false` and `cd=false`.
7. Enforce per-query and whole-request deadlines.
8. Preserve every raw response.
9. Parse response codes and nullable flags defensively.
10. Normalize answers, authority records, additional records, comments, and Resolver TTL fields.
11. Extract CNAME edges from every answer section.
12. Separate CNAME edges from terminal record counts unless CNAME was explicitly requested.
13. Build per-query alias observations.
14. Detect duplicates, loops, excessive depth, and inconsistent chains.
15. Build a unified alias chain only when observations are compatible.
16. Return successful and failed query results together.
17. Render terminal records under their actual owner names.

## Security, Limits, and Privacy

- fixed allowlist of Cloudflare and Google resolver endpoints
- no user-supplied upstream URL
- no HTTP request to resolved addresses
- no permissive CORS or public API promise
- maximum 8 provider queries for Common records
- maximum normalized alias depth of 16
- bounded response size
- bounded parallelism
- per-query timeout around 3 seconds
- whole-request deadline around 5 seconds
- weighted rate limiting because Common records creates several upstream queries
- no database lookup history
- no queried names or raw DNS values in analytics events
- share links disclose the query name in the URL and must say so
- aggregate analytics may include selection, resolver, duration bucket, and outcome category only

## SEO and On-Page Content

Clean routes:

- `/dns-tools`: index, follow after publication
- `/dns-tools/dns-lookup`: index, follow after publication

Lookup query variants:

- noindex, follow
- canonical to `/dns-tools/dns-lookup`
- excluded from sitemap

The page naturally covers DNS lookup and the supported record types without separate thin record-type routes.

Required server-rendered sections:

1. What this lookup checks
2. Record types
3. How to read the result
4. Resolver TTL
5. Aliases and canonical targets
6. DNS response states
7. DNSSEC authentication reporting
8. Limitations and privacy
9. FAQ

Required content points:

- the query uses the selected recursive resolver
- Common records means a defined set of separate queries, not `ANY`
- Resolver TTL is usually remaining resolver cache lifetime
- terminal records can belong to a CNAME target
- owner names are preserved
- a TXT result at `_dmarc` is not DMARC validation
- one resolver lookup is not global propagation testing
- AD false alone does not prove DNSSEC failure

## File Plan

```text
app/
  (site)/
    dns-tools/
      page.tsx
      dns-tools-sidebar.tsx
      dns-lookup/
        page.tsx
        dns-lookup-tool.tsx
        dns-lookup-results.tsx
  api/
    dns/
      lookup/
        route.ts

content_docs/
  dns-tools/
    README.md
    dns-lookup.md

lib/
  dns/
    types.ts
    normalize-name.ts
    normalize-provider-response.ts
    alias-chain.ts
    record-types.ts
    response-codes.ts
    lookup.ts
    providers/
      cloudflare.ts
      google.ts

tests/
  version127/
    dns-lookup.test.mjs
    dns-lookup-api.spec.ts
    page-coverage.json
    seo.spec.ts

supabase/
  migrations/
    <timestamp>_publish_dns_tools.sql
```

## Test Requirements

Tests are written before or alongside implementation. Required quality tests must use provider fixtures rather than depend on live Cloudflare or Google availability.

### Resolver TTL tests

- valid numeric TTL maps to `resolverTtlSeconds`
- missing TTL maps to `null`
- invalid TTL maps to `null` with defensive warning where applicable
- UI label is exactly `Resolver TTL`
- readable copy says `about ... remaining`
- explanation names the selected resolver
- no UI or content calls it configured TTL
- no UI promises how long a resolver will serve the answer

### Alias tests

- extracts CNAME edges from every query response
- deduplicates identical edges across A, AAAA, and other responses
- orders a compatible multi-edge chain
- displays the chain once above Common record groups
- preserves each terminal record's actual owner name
- excludes CNAME edges from A, AAAA, MX, TXT, and other terminal counts
- explicit CNAME lookup displays the CNAME as the requested result
- preserves complete raw responses per query
- detects a direct CNAME loop
- detects a multi-edge loop
- stops and warns after 16 edges
- detects incompatible alias chains across query types
- does not blindly collapse inconsistent chains
- renders inconsistent observations with their source query types

### Nullable flag tests

For every flag:

- provider true becomes `true` and renders Yes
- provider false becomes `false` and renders No
- absent becomes `null` and renders Not reported
- invalid type becomes `null`

The parser must specifically prove that missing flags never become false through Boolean coercion or default destructuring.

### DO, CD, and AD tests

- launch provider requests use `do=false`
- launch provider requests use `cd=false`
- client input cannot override those values
- AD true is preserved even when DO is false
- AD false uses unsigned-or-not-authenticated wording, not broken-DNSSEC wording
- absent AD renders Not reported
- no copy says AD is meaningful only with DO true

### Optional provider field tests

- absent comments normalize to `null`
- valid comments normalize to string array
- malformed comments normalize to `null`
- reported empty authority array remains `[]`
- absent authority data becomes `null`
- malformed authority data becomes `null` with a warning
- additional records follow the same rules
- owner names and Resolver TTLs are preserved in authority and additional records

### Input and UI tests

- quick examples are exactly `example.com`, `www.example.com`, and `mail.example.com`
- `_dmarc.example.com` remains accepted
- TXT result does not claim DMARC validation
- Common records creates the exact allowlisted queries
- no `ANY` option exists
- no thin record-type routes are added
- no global propagation claim appears
- no health score appears
- form submission, cancellation, partial results, copy actions, mobile layout, keyboard use, and accessible announcements work

### API and provider tests

- valid Common request
- valid explicit CNAME request
- invalid resolver
- invalid record selection
- partial provider failure
- HTTP 200 with DNS error response
- provider HTTP error
- provider timeout
- provider rate limit
- oversized response
- weighted request limit
- raw provider response retained for every query
- normalized provider-specific fields never leak into UI requirements

### SEO and publication tests

- route coverage entries exist for hub and tool
- unpublished routes remain 404 and outside sitemap during development
- published clean routes return 200 after approval
- one visible H1 exists in `.app-main`
- canonical URLs are clean
- clean published URLs are indexable
- query variants are noindex, follow
- query variants keep the clean canonical
- clean published URLs appear in sitemap
- registry-generated JSON-LD exists

## Implementation Order

1. Create `content_docs/dns-tools/` from this approved plan.
2. Add unpublished route coverage entries.
3. Add normalized model and fixture tests, including TTL, flags, aliases, and optional fields.
4. Implement DNS name normalization.
5. Implement provider adapters with `do=false` and `cd=false`.
6. Implement defensive response normalization.
7. Implement alias extraction, deduplication, ordering, inconsistency detection, loop detection, and depth limits.
8. Implement lookup orchestration and partial-result handling.
9. Implement the protected internal API.
10. Build the shared DNS sidebar and hub.
11. Build the server-rendered lookup page content.
12. Build the client form and corrected quick examples.
13. Build alias-first result rendering and terminal record groups.
14. Build Resolver TTL and nullable flag rendering.
15. Build per-query Technical details and raw views.
16. Add browser and API tests.
17. Run `npm run test` while routes remain unpublished.
18. Manually verify live provider responses without making the quality gate depend on them.
19. Prepare and inspect the production registry migration.
20. Change coverage state and publish only after explicit release approval.
21. Run `npm run quality`.
22. Deploy and verify the live routes, resolver behavior, canonical, robots, sitemap, and production registry rows.

## Definition of Done

The tool is not complete until:

- Resolver TTL semantics and copy match this document
- CNAME edges are first-class, deduplicated, and not miscounted as terminal records
- inconsistent alias chains are visible rather than collapsed
- loops and excessive depth are detected
- record owner names are preserved
- all provider flags remain true, false, or null as reported
- optional fields distinguish absent from reported empty data
- AD wording is accurate with launch DO and CD behavior
- raw responses remain available per provider query
- quick examples use `mail.example.com`, not `_dmarc.example.com`
- TXT lookup never claims DMARC validation
- no `ANY`, global propagation, thin record-type pages, or health score is introduced
- deterministic tests cover the corrected model and rendering
- `npm run quality` passes before public handoff
- production registry and live SEO behavior are verified after publication
